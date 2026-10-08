// next.config.js
/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

// CSP : 'unsafe-inline' requis pour les scripts/styles inline de Next.js et de
// Google Analytics (pas de nonce). Elle bloque surtout les ressources, frames,
// <base>, formulaires et plugins venant d'origines non prévues.
// Désactivée en dev (le hot-reload de Next a besoin de 'unsafe-eval' et de websockets).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://mfwa.org https://www.mfwa.org https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com",
  "worker-src 'self' blob:",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self' https://mfwa.org https://*.mfwa.org",
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  ...(isProd ? [{ key: 'Content-Security-Policy', value: csp }] : []),
];

const nextConfig = {
  poweredByHeader: false, // masque "X-Powered-By: Next.js"
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Réponses authentifiées : jamais mises en cache (navigateur ou proxy)
      { source: '/api/auth/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
      { source: '/api/admin/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
    ];
  },
  // Mode serveur Node (PM2) requis pour les routes API (/api/*, MySQL, JWT).
  // 'standalone' produit un bundle minimal (.next/standalone) avec son propre server.js.
  output: 'standalone',
  // Build sur serveur mutualisé : limite la RAM (1 seul worker, pas de threads).
  experimental: {
    cpus: 1,
    workerThreads: false,
    webpackMemoryOptimizations: true,
  },
  images: {
    unoptimized: true, // évite la dépendance à 'sharp' sur cPanel
  },
};

module.exports = nextConfig;