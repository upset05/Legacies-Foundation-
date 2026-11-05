<?php
declare(strict_types=1);

require_once __DIR__ . '/_shared.php';

if (!lg_require_post()) {
    exit;
}

$data = lg_request_data();
if ($data === []) {
    lg_json_response(400, ['ok' => false, 'error' => 'Your enquiry could not be read. Please try again.']);
    exit;
}

$honeypot = lg_text($data, 'companyWebsite', 500, false);
$name = lg_text($data, 'name', 120);
$email = lg_text($data, 'email', 254);
$category = lg_text($data, 'category', 80);
$message = lg_text($data, 'message', 3000);
$categories = [
    'General question',
    'Designer partnership',
    'Editorial or press',
    'Collections and catalogue',
    'Website support',
    'Other enquiry',
];

if ($honeypot === null || $honeypot !== '') {
    lg_json_response(400, ['ok' => false, 'error' => 'Your enquiry could not be accepted.']);
    exit;
}

if ($name === null || $email === null || !lg_valid_email($email) || $category === null
    || !in_array($category, $categories, true) || $message === null) {
    lg_json_response(400, ['ok' => false, 'error' => 'Please complete each field with valid information.']);
    exit;
}

$rateLimit = lg_allow_submission((string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
if ($rateLimit === false) {
    lg_json_response(429, ['ok' => false, 'error' => 'Too many enquiries were sent from this connection. Please try again later.']);
    exit;
}
if ($rateLimit === null) {
    lg_json_response(503, ['ok' => false, 'error' => 'Enquiry delivery is temporarily unavailable. Please email legacies@legacies.global.']);
    exit;
}

$mailBody = implode("\n", [
    'New Legacies Global website enquiry',
    '',
    'Name: ' . $name,
    'Email: ' . $email,
    'Category: ' . $category,
    '',
    'Message:',
    $message,
]);

if (!lg_send_mail($email, 'Website enquiry: ' . $category, $mailBody)) {
    lg_json_response(503, ['ok' => false, 'error' => 'We could not send your enquiry just now. Please email legacies@legacies.global.']);
    exit;
}

lg_json_response(200, ['ok' => true]);
