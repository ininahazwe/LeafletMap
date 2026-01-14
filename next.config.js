// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // C'est la ligne clé pour l'export statique
  // Assurez-vous d'avoir aussi l'option d'image non optimisée si vous utilisez <Image/>
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;