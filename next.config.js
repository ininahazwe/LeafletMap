// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
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