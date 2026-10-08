<?php
/**
 * JWT minimal (HS256), sans dépendance externe/composer, pour rester
 * compatible avec un hébergement cPanel mutualisé basique.
 */

function base64url_encode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string
{
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
}

function jwt_sign(array $payload): string
{
    $config = get_config();
    $header = ['typ' => 'JWT', 'alg' => 'HS256'];

    $payload['iat'] = time();
    $payload['exp'] = time() + ($config['jwt_ttl'] ?? 604800);

    $segments = [
        base64url_encode(json_encode($header)),
        base64url_encode(json_encode($payload)),
    ];

    $signature = hash_hmac('sha256', implode('.', $segments), $config['jwt_secret'], true);
    $segments[] = base64url_encode($signature);

    return implode('.', $segments);
}

/**
 * Retourne le payload décodé si le token est valide et non expiré,
 * sinon null.
 */
function jwt_verify(string $token): ?array
{
    $config = get_config();
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$headerB64, $payloadB64, $sigB64] = $parts;

    $expectedSig = hash_hmac('sha256', "$headerB64.$payloadB64", $config['jwt_secret'], true);
    $actualSig = base64url_decode($sigB64);

    if (!hash_equals($expectedSig, $actualSig)) return null;

    $payload = json_decode(base64url_decode($payloadB64), true);
    if (!is_array($payload)) return null;

    if (isset($payload['exp']) && time() > $payload['exp']) return null;

    return $payload;
}

/**
 * Récupère le token depuis le cookie httpOnly "auth_token", ou en
 * fallback depuis l'en-tête Authorization: Bearer xxx.
 */
function get_token_from_request(): ?string
{
    if (!empty($_COOKIE['auth_token'])) {
        return $_COOKIE['auth_token'];
    }
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $auth = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (str_starts_with($auth, 'Bearer ')) {
        return substr($auth, 7);
    }
    return null;
}

/**
 * Retourne le payload de l'utilisateur courant, ou null si non authentifié.
 */
function current_user(): ?array
{
    $token = get_token_from_request();
    if (!$token) return null;
    return jwt_verify($token);
}

/**
 * Coupe la requête en 401 si non authentifié.
 */
function require_auth(): array
{
    $user = current_user();
    if (!$user) {
        http_response_code(401);
        die(json_encode(['error' => 'Non authentifié']));
    }
    return $user;
}

function set_auth_cookie(string $token): void
{
    $config = get_config();
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    setcookie('auth_token', $token, [
        'expires' => time() + ($config['jwt_ttl'] ?? 604800),
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function clear_auth_cookie(): void
{
    setcookie('auth_token', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'httponly' => true,
    ]);
}
