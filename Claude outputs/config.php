<?php
/**
 * Configuration du backend pour développement LOCAL
 *
 * ⚠️ IMPORTANT:
 * 1. Copie ce fichier dans: backend/config.php
 * 2. Assure-toi que MySQL tourne avec ces identifiants
 * 3. La base 'leafletmap' doit exister (crée-la si nécessaire)
 */

return [
    'db' => [
        // Connexion MySQL locale (XAMPP, Laragon, Docker, etc.)
        'host' => 'localhost',           // OU '127.0.0.1', OU 'mysql' (Docker)
        'name' => 'leafletmap',          // Nom de la base
        'user' => 'root',                // Utilisateur MySQL (par défaut en local)
        'pass' => '',                    // Mot de passe (vide en dev local, à remplir en prod)
        'charset' => 'utf8mb4',
    ],

    // Clé secrète JWT — génère une nouvelle clé avec:
    // php -r "echo bin2hex(random_bytes(32));"
    'jwt_secret' => bin2hex(random_bytes(32)),

    // Durée de validité du token JWT (ici 7 jours en secondes)
    'jwt_ttl' => 60 * 60 * 24 * 7,

    // Domaines autorisés à appeler cette API (CORS)
    // EN DEV: http://localhost:3000
    // EN PROD: https://ton-domaine.org
    'allowed_origin' => 'http://localhost:3000',
];

// Après avoir créé ce fichier, teste avec:
// php -S localhost:8000
// puis ouvre: http://localhost:8000/api/countries.php
