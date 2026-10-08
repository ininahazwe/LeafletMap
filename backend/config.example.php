<?php
/**
 * Copie ce fichier en "config.php" (gitignored) et remplis les valeurs
 * réelles du cPanel. Ne JAMAIS committer config.php.
 *
 * DB_HOST est presque toujours "localhost" sur cPanel (MySQL tourne
 * sur le même serveur). DB_NAME et DB_USER sont préfixés par le nom
 * d'utilisateur cPanel (ex: "dxtrmfwa_leafletmap").
 */

return [
    'db' => [
        'host' => 'localhost',
        'name' => 'CPANELUSER_leafletmap',
        'user' => 'CPANELUSER_leafletmap',
        'pass' => 'CHANGE_ME',
        'charset' => 'utf8mb4',
    ],

    // Chaîne aléatoire longue, générée une fois, jamais changée sans
    // invalider toutes les sessions actives.
    // Génère-la avec : php -r "echo bin2hex(random_bytes(32));"
    'jwt_secret' => 'CHANGE_ME_RANDOM_64_HEX_CHARS',

    // Durée de validité du token, en secondes (ici 7 jours).
    'jwt_ttl' => 60 * 60 * 24 * 7,

    // Domaine(s) autorisés à appeler cette API (le domaine du site).
    'allowed_origin' => 'https://ton-domaine.org',
];
