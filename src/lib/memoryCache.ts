// lib/memoryCache.ts
// Cache mémoire minimal (TTL) pour les routes API publiques en lecture seule.
// Faible trafic : on évite surtout de refaire les requêtes MySQL identiques
// en rafale. Les données ne changent que via l'admin (rare), TTL de 5 min.
const store = new Map<string, { value: unknown; expires: number }>();
const MAX_ENTRIES = 50;

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;

  const value = await load();
  if (store.size >= MAX_ENTRIES) store.delete(store.keys().next().value as string);
  store.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

// Cache navigateur/proxy : le navigateur ne redemande pas pendant 1 min,
// le proxy Apache/CDN peut resservir 5 min, puis revalide en arrière-plan.
export const PUBLIC_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
};

export const CACHE_TTL_MS = 5 * 60 * 1000;
