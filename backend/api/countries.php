<?php
/**
 * GET  /api/countries.php            -> liste des pays (remplace le
 *                                        .from('countries').select(...) du hook useAllCountries)
 * POST /api/countries.php  (auth)    -> création d'un pays
 */

require_once __DIR__ . '/../bootstrap.php';

$pdo = get_pdo();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query(
        'SELECT id, iso_a3, name_fr, name_en, region, tooltip_info
         FROM countries
         ORDER BY name_fr ASC'
    );
    json_out($stmt->fetchAll());
}

if ($method === 'POST') {
    require_auth();
    $input = json_input();

    foreach (['iso_a3', 'name_fr', 'name_en'] as $required) {
        if (empty($input[$required])) {
            json_out(['error' => "Champ requis manquant: $required"], 422);
        }
    }

    $stmt = $pdo->prepare(
        'INSERT INTO countries (iso_a3, name_fr, name_en, region, tooltip_info)
         VALUES (:iso_a3, :name_fr, :name_en, :region, :tooltip_info)'
    );
    $stmt->execute([
        'iso_a3' => strtoupper($input['iso_a3']),
        'name_fr' => $input['name_fr'],
        'name_en' => $input['name_en'],
        'region' => $input['region'] ?? null,
        'tooltip_info' => $input['tooltip_info'] ?? null,
    ]);

    json_out(['id' => (int) $pdo->lastInsertId()], 201);
}

json_out(['error' => 'Méthode non supportée'], 405);
