<?php
/**
 * POST /api/auth/login.php  { email, password }
 * -> vérifie password_hash (bcrypt) en base, pose un cookie JWT httpOnly.
 */

require_once __DIR__ . '/../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['error' => 'Méthode non supportée'], 405);
}

$input = json_input();
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if ($email === '' || $password === '') {
    json_out(['success' => false, 'error' => 'Email et mot de passe requis'], 422);
}

$pdo = get_pdo();
$stmt = $pdo->prepare('SELECT id, email, password_hash, name FROM admin_users WHERE email = :email LIMIT 1');
$stmt->execute(['email' => $email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    json_out(['success' => false, 'error' => 'Identifiants invalides'], 401);
}

$token = jwt_sign([
    'sub' => (int) $user['id'],
    'email' => $user['email'],
    'name' => $user['name'],
]);

set_auth_cookie($token);

json_out([
    'success' => true,
    'user' => ['id' => (int) $user['id'], 'email' => $user['email'], 'name' => $user['name']],
]);
