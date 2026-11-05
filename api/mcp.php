<?php
declare(strict_types=1);

header('Cache-Control: no-store');
header('MCP-Protocol-Version: 2025-03-26');
header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    http_response_code(405);
    echo json_encode(['error' => 'Use POST for MCP JSON-RPC requests.']);
    exit;
}

$raw = file_get_contents('php://input');
$message = $raw === false || strlen($raw) > 65536 ? null : json_decode($raw, true);
if (!is_array($message) || ($message['jsonrpc'] ?? null) !== '2.0' || !is_string($message['method'] ?? null)) {
    http_response_code(400);
    echo json_encode(['jsonrpc' => '2.0', 'id' => null, 'error' => ['code' => -32600, 'message' => 'Invalid JSON-RPC request.']]);
    exit;
}

if ($message['method'] === 'notifications/initialized' || !array_key_exists('id', $message)) {
    http_response_code(202);
    exit;
}

$id = $message['id'];
$success = static function (mixed $result) use ($id): void {
    echo json_encode(['jsonrpc' => '2.0', 'id' => $id, 'result' => $result], JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
};
$error = static function (int $code, string $text) use ($id): void {
    echo json_encode(['jsonrpc' => '2.0', 'id' => $id, 'error' => ['code' => $code, 'message' => $text]], JSON_UNESCAPED_SLASHES);
};

$pages = [
    ['title' => 'Home', 'url' => 'https://legacies.global/', 'summary' => 'Legacies Global and its focus on artisan design, culture and considered fashion.'],
    ['title' => 'About Legacies Global', 'url' => 'https://legacies.global/about', 'summary' => "The platform's purpose, principles and editorial approach."],
    ['title' => 'Legacies Across Borders', 'url' => 'https://legacies.global/across-borders', 'summary' => 'How the platform connects makers, design and context across locations.'],
    ['title' => 'Legacies Showcases', 'url' => 'https://legacies.global/showcases', 'summary' => 'A showcase hub; illustrative placeholders are not real partner profiles.'],
    ['title' => 'Catalogue', 'url' => 'https://legacies.global/catalogue', 'summary' => 'Curated fashion editions.'],
    ['title' => 'Onboarding', 'url' => 'https://legacies.global/onboarding', 'summary' => 'Partner criteria, review process and application.'],
    ['title' => 'Careers', 'url' => 'https://legacies.global/careers', 'summary' => 'Career and collaboration information.'],
    ['title' => 'Contact', 'url' => 'https://legacies.global/contact', 'summary' => 'General enquiries by email and a website enquiry form.'],
];
$tools = [
    [
        'name' => 'get_business_overview',
        'description' => 'Return verified public information about Legacies Global. This tool is read-only and does not provide unpublished business details.',
        'inputSchema' => ['type' => 'object', 'properties' => (object) [], 'additionalProperties' => false],
        'annotations' => ['readOnlyHint' => true, 'openWorldHint' => false],
    ],
    [
        'name' => 'list_public_pages',
        'description' => 'List public, indexable Legacies Global website pages and short descriptions. Placeholder showcase profiles are not represented as real partners.',
        'inputSchema' => ['type' => 'object', 'properties' => (object) [], 'additionalProperties' => false],
        'annotations' => ['readOnlyHint' => true, 'openWorldHint' => false],
    ],
];

switch ($message['method']) {
    case 'initialize':
        $success([
            'protocolVersion' => '2025-03-26',
            'capabilities' => ['tools' => ['listChanged' => false]],
            'serverInfo' => ['name' => 'legacies-global-public-information', 'version' => '1.0.0'],
            'instructions' => 'Tools return public, read-only information about Legacies Global. Use the site links for current page details.',
        ]);
        break;
    case 'ping':
        $success((object) []);
        break;
    case 'tools/list':
        $success(['tools' => $tools]);
        break;
    case 'tools/call':
        $name = $message['params']['name'] ?? null;
        $arguments = $message['params']['arguments'] ?? [];
        if (!is_array($arguments) || $arguments !== []) {
            $error(-32602, 'This read-only tool accepts no arguments.');
            break;
        }
        if ($name === 'get_business_overview') {
            $overview = [
                'name' => 'Legacies Global',
                'website' => 'https://legacies.global/',
                'email' => 'legacies@legacies.global',
                'focus' => 'Artisan design, cultural innovation, considered fashion editions and editorial collaboration.',
                'phone' => null,
                'streetAddress' => null,
                'note' => 'No public telephone number or street address is published.',
            ];
            $success([
                'content' => [[
                    'type' => 'text',
                    'text' => 'Legacies Global is a fashion platform connecting artisan designers and cultural innovators with audiences and opportunities across borders. Contact: legacies@legacies.global. No public phone number or street address is published.',
                ]],
                'structuredContent' => $overview,
                'isError' => false,
            ]);
            break;
        }
        if ($name === 'list_public_pages') {
            $success([
                'content' => [['type' => 'text', 'text' => json_encode($pages, JSON_UNESCAPED_SLASHES)]],
                'structuredContent' => ['pages' => $pages],
                'isError' => false,
            ]);
            break;
        }
        $error(-32602, 'Unknown read-only tool.');
        break;
    default:
        $error(-32601, 'Method not found.');
}
