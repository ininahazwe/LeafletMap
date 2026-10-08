# Migration Supabase → MySQL (cPanel)

Résumé des décisions prises : le front Next.js reste en export statique
(`output: 'export'`, déploiement inchangé sur `public_html`) ; les données
passent de Supabase (Postgres) à MySQL ; l'accès aux données et
l'authentification admin passent par une petite API PHP (`/backend`,
déployée sous `/api`) car le MySQL cPanel n'est accessible qu'en local
(phpMyAdmin, pas de connexion distante).

## 1. Créer la base MySQL sur cPanel

1. cPanel → MySQL Databases → créer une base (ex: `leafletmap`) et un
   utilisateur avec tous les privilèges dessus. Note le nom complet
   préfixé (`CPANELUSER_leafletmap`).
2. phpMyAdmin → sélectionner la base → onglet Importer → importer
   `database/schema.sql`.

## 2. Exporter les données Supabase

En local (pas dans un environnement sans accès réseau à supabase.co) :

```bash
npm install
node scripts/export-supabase-data.mjs
```

Génère `database/data.sql`. Importe-le ensuite via phpMyAdmin (après
`schema.sql`).

Cas particulier — mots de passe admin : la clé anon/API ne permet pas
de lire `auth.users.encrypted_password`. Va dans Supabase → SQL Editor :

```sql
select u.email, u.encrypted_password
from auth.users u
join public.admins a on a.user_id = u.id;
```

Les hashs sont au format bcrypt (`$2a$...`), directement compatibles
avec `password_verify()` en PHP. Insère-les à la main dans
`admin_users` (colonnes `email`, `password_hash`), ou génère un
nouveau mot de passe :

```bash
php -r "echo password_hash('nouveau-mot-de-passe', PASSWORD_BCRYPT), PHP_EOL;"
```

```sql
INSERT INTO admin_users (email, password_hash, name)
VALUES ('admin@exemple.org', '$2y$10$....', 'Admin');
```

## 3. Configurer l'API PHP

Sur le serveur (via SSH ou File Manager), dans le dossier `backend/`
déployé (voir étape 5) :

```bash
cp config.example.php config.php
php -r "echo bin2hex(random_bytes(32));"   # -> colle le résultat dans jwt_secret
```

Remplis `db.host/name/user/pass` et `allowed_origin` (le domaine du
site) dans `config.php`. **Ne jamais committer ce fichier** (déjà dans
`.gitignore`).

## 4. Frontend

- `.env.local` : `NEXT_PUBLIC_API_URL` doit pointer vers l'API PHP
  (`https://ton-domaine.org/api` en prod, ou une URL locale en dev).
- Les anciennes variables `NEXT_PUBLIC_SUPABASE_*` ne sont plus lues
  par l'app (gardées uniquement pour `scripts/export-supabase-data.mjs`
  le temps de la migration, à supprimer ensuite).
- `src/lib/supabase.ts` et `src/lib/supabaseServer.ts` sont vidés
  (dépréciés) — à supprimer manuellement : plus aucun import ne les
  référence.
- `@supabase/supabase-js` peut être retiré de `package.json` une fois
  `scripts/export-supabase-data.mjs` devenu inutile.

## 5. Déploiement automatisé

`.github/workflows/deploy.yml` : GitHub Actions + SSH (même schéma que
ton projet memorial : `appleboy/ssh-action`). À faire une fois côté
serveur :

1. `git clone` le repo dans `/home/CPANELUSER/repositories/leafletmap`.
2. Créer `backend/config.php` (étape 3) directement dans
   `/home/CPANELUSER/public_html/ton-domaine.org/api/config.php`
   (prembattre le premier déploiement, ou laisser le workflow le
   déployer une fois puis éditer sur place — le workflow ne l'écrase
   jamais ensuite).
3. Créer `/home/CPANELUSER/public_html/ton-domaine.org/.env.production.local`
   avec le `NEXT_PUBLIC_API_URL` de prod.
4. Dans GitHub → Settings → Secrets : `SSH_HOST`, `SSH_USER`,
   `SSH_PRIVATE_KEY` (clé privée dont la publique est dans
   `~/.ssh/authorized_keys` sur le serveur), `SSH_PORT` si différent
   de 22.
5. Adapter les chemins `REPO` et `PROD` en haut du script du workflow.

Un push sur `main` déclenche : `git pull` → `npm run build` (export
statique) → sync du site + de l'API PHP sur `public_html` (sans
toucher à `config.php`).

## 6. Vérifications avant de couper Supabase

- [ ] `database/schema.sql` puis `database/data.sql` importés sans
      erreur dans phpMyAdmin.
- [ ] Comparer les comptages de lignes (Supabase vs MySQL) pour
      `countries` et `media_environment`.
- [ ] `GET /api/countries.php` renvoie la même liste que l'ancien
      `useAllCountries` (carte affichée correctement).
- [ ] `GET /api/country.php?iso3=FRA` renvoie bien le pays + son
      `media_environment`.
- [ ] Login admin (`POST /api/auth/login.php`) fonctionne avec un
      hash migré ou un nouveau mot de passe.
- [ ] Déploiement automatisé testé une fois via `workflow_dispatch`
      avant de compter dessus pour un vrai push.
