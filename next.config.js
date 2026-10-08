// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mode serveur Node (PM2) requis pour les routes API (/api/*, MySQL, JWT).
  // 'standalone' produit un bundle minimal (.next/standalone) avec son propre server.js.
  output: 'standalone',
  images: {
    unoptimized: true, // évite la dépendance à 'sharp' sur cPanel
  },
};

module.exports = nextConfig;