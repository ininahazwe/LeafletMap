<?php
/**
 * GET /api/auth/me.php -> identité de l'utilisateur courant, ou 401.
 * Remplace supabase.auth.getSession() / getUser() dans authProvider.ts.
 */

require_once __DIR__ . '/../../bootstrap.php';

$user = current_user();

if (!$user) {
    json_out(['authenticated' => false], 401);
}

json_out([
    'authenticated' => true,
    'user' => [
        'id' => $user['sub'] ?? null,
        'email' => $user['email'] ?? null,
        'name' => $user['name'] ?? null,
    ],
]);
