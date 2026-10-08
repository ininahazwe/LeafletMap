<?php
/**
 * Connexion PDO/MySQL réutilisable par tous les endpoints.
 */

function get_config(): array
{
    static $config = null;
    if ($config === null) {
        $path = __DIR__ . '/config.php';
        if (!file_exists($path)) {
            http_response_code(500);
            die(json_encode(['error' => 'config.php manquant. Copie config.example.php -> config.php et remplis les valeurs.']));
        }
        $config = require $path;
    }
    return $config;
}

function get_pdo(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $db = get_config()['db'];
        $dsn = "mysql:host={$db['host']};dbname={$db['name']};charset={$db['charset']}";
        try {
            $pdo = new PDO($dsn, $db['user'], $db['pass'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            die(json_encode(['error' => 'Connexion DB impossible']));
        }
    }
    return $pdo;
}
