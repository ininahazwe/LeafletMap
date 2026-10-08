<?php
/**
 * GET    /api/country.php?iso3=XXX        -> pays + media_environment
 *                                             (remplace useCountryDetails)
 * PUT    /api/country.php?id=1    (auth)  -> mise à jour pays + media_environment
 * DELETE /api/country.php?id=1    (auth)  -> suppression
 */

require_once __DIR__ . '/../bootstrap.php';

$pdo = get_pdo();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $iso3 = strtoupper(trim($_GET['iso3'] ?? ''));
    if ($iso3 === '') {
        json_out(['error' => 'Paramètre iso3 requis'], 422);
    }

    $stmt = $pdo->prepare('SELECT * FROM countries WHERE iso_a3 = :iso3 LIMIT 1');
    $stmt->execute(['iso3' => $iso3]);
    $country = $stmt->fetch();

    if (!$country) {
        json_out(['error' => "Pays introuvable pour ISO3 \"$iso3\""], 404);
    }

    $mediaStmt = $pdo->prepare('SELECT * FROM media_environment WHERE country_id = :id LIMIT 1');
    $mediaStmt->execute(['id' => $country['id']]);
    $media = $mediaStmt->fetch() ?: null;

    $country['media_environment'] = $media;
    json_out($country);
}

if ($method === 'PUT') {
    require_auth();
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) json_out(['error' => 'Paramètre id requis'], 422);

    $input = json_input();
    $countryFields = ['iso_a3', 'name_fr', 'name_en', 'region', 'tooltip_info'];
    $set = [];
    $params = ['id' => $id];
    foreach ($countryFields as $f) {
        if (array_key_exists($f, $input)) {
            $set[] = "$f = :$f";
            $params[$f] = $f === 'iso_a3' ? strtoupper($input[$f]) : $input[$f];
        }
    }
    if ($set) {
        $pdo->prepare('UPDATE countries SET ' . implode(', ', $set) . ' WHERE id = :id')->execute($params);
    }

    if (isset($input['media_environment']) && is_array($input['media_environment'])) {
        $mediaFields = [
            'legal_environment', 'media_regulators', 'journalists_associations',
            'radio_stations', 'tv_stations', 'newspapers', 'state_owned_media',
            'news_agency', 'international_media', 'online_media',
            'internet_freedom', 'leading_media',
        ];
        $me = $input['media_environment'];
        $cols = array_intersect(array_keys($me), $mediaFields);

        $exists = $pdo->prepare('SELECT id FROM media_environment WHERE country_id = :id');
        $exists->execute(['id' => $id]);

        if ($exists->fetch()) {
            $set2 = array_map(fn($c) => "$c = :$c", $cols);
            $params2 = ['id' => $id];
            foreach ($cols as $c) $params2[$c] = $me[$c];
            if ($set2) {
                $pdo->prepare('UPDATE media_environment SET ' . implode(', ', $set2) . ' WHERE country_id = :id')
                    ->execute($params2);
            }
        } else {
            $insertCols = array_merge(['country_id'], $cols);
            $placeholders = array_map(fn($c) => ":$c", $insertCols);
            $params2 = ['country_id' => $id];
            foreach ($cols as $c) $params2[$c] = $me[$c];
            $pdo->prepare(
                'INSERT INTO media_environment (' . implode(', ', $insertCols) . ') VALUES (' . implode(', ', $placeholders) . ')'
            )->execute($params2);
        }
    }

    json_out(['success' => true]);
}

if ($method === 'DELETE') {
    require_auth();
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) json_out(['error' => 'Paramètre id requis'], 422);

    $pdo->prepare('DELETE FROM countries WHERE id = :id')->execute(['id' => $id]);
    json_out(['success' => true]);
}

json_out(['error' => 'Méthode non supportée'], 405);
