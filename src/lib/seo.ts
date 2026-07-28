// lib/seo.ts — constantes SEO partagées (layout, sitemap, robots, pages pays).
// Domaine unique de vérité : NEXT_PUBLIC_APP_URL (voir .env.local), avec fallback
// sur le domaine réel de production pour éviter tout retour à un domaine placeholder.
export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://mediascape.mfwa.org";

export const SITE_NAME = "West Africa Mediascape";
