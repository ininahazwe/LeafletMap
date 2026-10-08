<?php
/**
 * En-têtes CORS communs. Le frontend static (Next export) et l'API
 * PHP sont censés vivre sous le même domaine (site.org + site.org/api),
 * ce qui évite le CORS "cross-site" pour les cookies. On garde quand
 * même des en-têtes explicites pour les cas dev (localhost:3000).
 */

$config = get_config();
$allowedOrigin = $config['allowed_origin'] ?? '*';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === $allowedOrigin || $origin === 'http://localhost:3000') {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: $allowedOrigin");
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
