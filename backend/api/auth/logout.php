<?php
/**
 * POST /api/auth/logout.php -> supprime le cookie JWT.
 */

require_once __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['error' => 'Méthode non supportée'], 405);
}

clear_auth_cookie();
json_out(['success' => true]);
