<?php
declare(strict_types=1);

require_once __DIR__ . '/_shared.php';

if (!lg_require_post()) {
    exit;
}

$data = lg_request_data();
if ($data === []) {
    lg_json_response(400, ['ok' => false, 'error' => 'The application form could not be read. Please check the fields and try again.']);
    exit;
}

$honeypot = lg_text($data, 'companyWebsite', 500, false);
if ($honeypot === null || $honeypot !== '') {
    lg_json_response(400, ['ok' => false, 'error' => 'The application could not be accepted.']);
    exit;
}

$startedAt = isset($data['startedAt']) && is_scalar($data['startedAt'])
    ? filter_var((string) $data['startedAt'], FILTER_VALIDATE_INT)
    : false;
$now = (int) floor(microtime(true) * 1000);
if ($startedAt === false || $now - $startedAt < 3000 || $now - $startedAt > 7200000) {
    lg_json_response(400, ['ok' => false, 'error' => 'Please review the form and submit it again.']);
    exit;
}

$fields = [
    'fullName' => lg_text($data, 'fullName', 120),
    'email' => lg_text($data, 'email', 254),
    'country' => lg_text($data, 'country', 100),
    'city' => lg_text($data, 'city', 120),
    'studioName' => lg_text($data, 'studioName', 160),
    'craft' => lg_text($data, 'craft', 80),
    'portfolio' => lg_text($data, 'portfolio', 2000),
    'bio' => lg_text($data, 'bio', 800),
    'whyLegacies' => lg_text($data, 'whyLegacies', 800),
    'samples' => lg_text($data, 'samples', 2000, false),
];

$allowedCrafts = [
    'Clothing and ready-to-wear',
    'Tailoring and bespoke garments',
    'Knitwear',
    'Traditional and heritage garments',
    'Leather goods',
    'Footwear',
    'Handwoven textiles',
    'Embroidery and surface embellishment',
    'Natural dyeing and textile printing',
    'Spinning, fibre and yarn',
    'Quilting and patchwork',
    'Bags and small accessories',
    'Jewellery and metalwork',
    'Beadwork and adornment',
    'Scarves and soft accessories',
    'Ceramics and clay',
    'Basketry and plant fibre',
    'Woodcraft and carving',
    'Homeware and functional objects',
    'Art, illustration and wearable art',
    'Other craft practice',
];

$valid = !in_array(null, $fields, true)
    && lg_valid_email($fields['email'])
    && in_array($fields['craft'], $allowedCrafts, true)
    && lg_valid_web_address($fields['portfolio'])
    && lg_valid_web_address($fields['samples'], true)
    && in_array($data['consent'] ?? null, [true, 'true', 'on'], true);

if (!$valid) {
    lg_json_response(400, ['ok' => false, 'error' => 'Please check that all required fields are complete and valid.']);
    exit;
}

$rateLimit = lg_allow_submission((string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
if ($rateLimit === false) {
    lg_json_response(429, ['ok' => false, 'error' => 'Too many applications were submitted from this connection. Please try again later.']);
    exit;
}
if ($rateLimit === null) {
    lg_json_response(503, ['ok' => false, 'error' => 'Application delivery is temporarily unavailable. Please email legacies@legacies.global.']);
    exit;
}

$message = implode("\n", [
    'New Legacies Global partner application',
    '',
    'Full name: ' . $fields['fullName'],
    'Email: ' . $fields['email'],
    'Location: ' . $fields['city'] . ', ' . $fields['country'],
    'Brand or studio: ' . $fields['studioName'],
    'Craft or category: ' . $fields['craft'],
    'Portfolio: ' . $fields['portfolio'],
    'Short bio: ' . $fields['bio'],
    'Why Legacies: ' . $fields['whyLegacies'],
    'Samples: ' . ($fields['samples'] !== '' ? $fields['samples'] : 'Not provided'),
]);

if (!lg_send_mail($fields['email'], 'New artisan and designer partner application', $message)) {
    lg_json_response(503, ['ok' => false, 'error' => 'Application delivery is unavailable right now. Please email legacies@legacies.global.']);
    exit;
}

lg_json_response(200, ['ok' => true]);
