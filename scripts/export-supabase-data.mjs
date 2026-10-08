/**
 * Exporte les données Supabase (countries, media_environment, rankings)
 * vers un fichier SQL compatible MySQL, importable via phpMyAdmin.
 *
 * À exécuter en LOCAL (pas dans un environnement bac à sable sans accès
 * réseau à supabase.co) :
 *
 *   node scripts/export-supabase-data.mjs
 *
 * Aucune dépendance npm requise (fetch natif Node 18+), juste
 * .env.local rempli avec NEXT_PUBLIC_SUPABASE_URL /
 * NEXT_PUBLIC_SUPABASE_ANON_KEY.
 *
 * Si des lignes n'apparaissent pas (RLS trop restrictive avec la clé
 * anon), définis SUPABASE_SERVICE_ROLE_KEY (Project Settings > API
 * > service_role, à NE JAMAIS committer) avant de relancer :
 *
 *   SUPABASE_SERVICE_ROLE_KEY=xxxx node scripts/export-supabase-data.mjs
 *
 * Sortie : database/data.sql
 *
 * Important — mots de passe admin :
 * la clé anon/service_role via l'API REST ne permet PAS de lire
 * auth.users.encrypted_password. Pour récupérer les hashs bcrypt
 * (réutilisables tels quels avec password_verify() en PHP), va dans
 * Supabase > SQL Editor et exécute :
 *
 *   select u.email, u.encrypted_password
 *   from auth.users u
 *   join public.admins a on a.user_id = u.id;
 *
 * Exporte le résultat en CSV, puis génère les INSERT dans
 * admin_users à la main (ou adapte ce script pour lire le CSV).
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// --- Charge .env.local à la main (pas de dépendance dotenv) ---
function loadEnvLocal() {
  const envPath = path.join(rootDir, '.env.local');
  const env = {};
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }
  return env;
}

const fileEnv = loadEnvLocal();
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || fileEnv.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  fileEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Manque NEXT_PUBLIC_SUPABASE_URL / clé Supabase (voir .env.local).');
  process.exit(1);
}

function sqlEscape(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? '1' : '0';
  // Postgres timestamptz -> 'YYYY-MM-DD HH:MM:SS' pour MySQL DATETIME
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''").replace('T', ' ').replace(/\+00:00$|Z$/, '')}'`;
}

// Appel direct de l'API REST (PostgREST) via fetch natif, sans passer
// par @supabase/supabase-js — plus simple à déboguer (statut HTTP et
// message d'erreur bruts visibles).
async function fetchAll(table, orderBy = 'id') {
  const pageSize = 1000;
  let from = 0;
  let rows = [];

  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&order=${orderBy}.asc`;
    let res;
    try {
      res = await fetch(url, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Range: `${from}-${from + pageSize - 1}`,
          'Range-Unit': 'items',
        },
      });
    } catch (err) {
      console.warn(`⚠️  Table "${table}" : erreur réseau (${err.cause ?? err.message}) — ignorée`);
      return rows;
    }

    if (!res.ok && res.status !== 206) {
      const text = await res.text().catch(() => '');
      console.warn(`⚠️  Table "${table}" : HTTP ${res.status} ${text} (ignorée si elle n'existe pas)`);
      return rows;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    rows = rows.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return rows;
}

function buildInsert(table, columns, rows) {
  if (rows.length === 0) return `-- (aucune ligne pour ${table})\n`;
  const lines = rows.map((row) => {
    const values = columns.map((col) => sqlEscape(row[col])).join(', ');
    return `(${values})`;
  });
  return (
    `INSERT INTO ${table} (${columns.join(', ')}) VALUES\n` +
    lines.join(',\n') +
    ';\n'
  );
}

async function checkConnection() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    console.log(`Connexion à ${SUPABASE_URL} ... statut ${res.status}`);
  } catch (err) {
    console.error(`Impossible de joindre ${SUPABASE_URL} :`, err.cause ?? err.message);
    process.exit(1);
  }
}

async function main() {
  await checkConnection();

  const countries = await fetchAll('countries');
  const mediaEnv = await fetchAll('media_environment');
  const rankings = await fetchAll('rankings');

  console.log(`countries: ${countries.length} lignes`);
  console.log(`media_environment: ${mediaEnv.length} lignes`);
  console.log(`rankings: ${rankings.length} lignes`);

  let sql = `-- Export généré depuis Supabase le ${new Date().toISOString()}\n`;
  sql += `-- À importer APRÈS database/schema.sql\n\n`;
  sql += `SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS = 0;\n\n`;

  if (countries.length) {
    const hasTooltip = Object.prototype.hasOwnProperty.call(countries[0], 'tooltip_info');
    const cols = ['id', 'iso_a3', 'name_fr', 'name_en', 'region'];
    if (hasTooltip) cols.push('tooltip_info');
    sql += `-- countries\n` + buildInsert('countries', cols, countries) + '\n';
  }

  if (mediaEnv.length) {
    const cols = [
      'id', 'country_id', 'legal_environment', 'media_regulators',
      'journalists_associations', 'radio_stations', 'tv_stations',
      'newspapers', 'state_owned_media', 'news_agency',
      'international_media', 'online_media', 'internet_freedom',
      'leading_media', 'created_at', 'updated_at',
    ];
    sql += `-- media_environment\n` + buildInsert('media_environment', cols, mediaEnv) + '\n';
  }

  if (rankings.length) {
    const cols = [
      'id', 'country_id', 'year', 'position', 'score_global',
      'score_political', 'score_economic', 'score_legal',
      'score_social', 'score_security',
    ];
    sql += `-- rankings\n` + buildInsert('rankings', cols, rankings) + '\n';
  }

  sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

  const outPath = path.join(rootDir, 'database', 'data.sql');
  writeFileSync(outPath, sql, 'utf-8');
  console.log(`\n✅ Écrit : ${outPath}`);
  console.log('Rappel : les mots de passe admin ne sont pas exportés ici, voir le commentaire en haut de ce script.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
