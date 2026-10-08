<?php
/**
 * Point d'entrée commun, à inclure en tête de chaque script sous api/.
 */

declare(strict_types=1);
error_reporting(E_ALL);
ini_set('display_errors', '0'); // pas d'erreurs PHP brutes dans le JSON en prod

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/cors.php';

function json_input(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function json_out($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
