<?php
declare(strict_types=1);

function lg_json_response(int $status, array $payload): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
}

function lg_request_data(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($contentType, 'application/json') !== false) {
        $raw = file_get_contents('php://input');
        if ($raw === false || strlen($raw) > 65536) {
            return [];
        }
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    return $_POST;
}

function lg_text(array $data, string $key, int $maximum, bool $required = true): ?string
{
    $value = $data[$key] ?? null;
    if (!is_string($value)) {
        return !$required && !array_key_exists($key, $data) ? '' : null;
    }

    $value = trim($value);
    if (($required && $value === '') || strlen($value) > $maximum) {
        return null;
    }

    return $value;
}

function lg_valid_email(?string $email): bool
{
    return $email !== null
        && strlen($email) <= 254
        && filter_var($email, FILTER_VALIDATE_EMAIL) !== false
        && !preg_match('/[\r\n]/', $email);
}

function lg_valid_web_address(string $address, bool $optional = false): bool
{
    if ($optional && $address === '') {
        return true;
    }
    if (strlen($address) > 2000 || filter_var($address, FILTER_VALIDATE_URL) === false) {
        return false;
    }

    $scheme = strtolower((string) parse_url($address, PHP_URL_SCHEME));
    return in_array($scheme, ['http', 'https'], true);
}

function lg_send_mail(string $replyTo, string $subject, string $message): bool
{
    $headers = [
        'From: Legacies Global <legacies@legacies.global>',
        'Reply-To: ' . $replyTo,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
    ];

    return mail(
        'legacies@legacies.global',
        $subject,
        $message,
        implode("\r\n", $headers)
    );
}

function lg_allow_submission(string $ip, int $maximum = 5, int $windowSeconds = 3600): ?bool
{
    $directory = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'legacies-global-rate-limit';
    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
        return null;
    }

    $path = $directory . DIRECTORY_SEPARATOR . hash('sha256', $ip) . '.json';
    $handle = fopen($path, 'c+');
    if ($handle === false) {
        return null;
    }

    try {
        if (!flock($handle, LOCK_EX)) {
            return null;
        }

        rewind($handle);
        $stored = stream_get_contents($handle);
        $state = is_string($stored) ? json_decode($stored, true) : null;
        $now = time();
        if (!is_array($state) || !isset($state['startedAt'], $state['count'])
            || !is_int($state['startedAt']) || !is_int($state['count'])
            || $now - $state['startedAt'] >= $windowSeconds || $state['startedAt'] > $now) {
            $state = ['startedAt' => $now, 'count' => 0];
        }

        if ($state['count'] >= $maximum) {
            return false;
        }

        $state['count']++;
        rewind($handle);
        if (!ftruncate($handle, 0)
            || fwrite($handle, json_encode($state, JSON_THROW_ON_ERROR)) === false
            || !fflush($handle)) {
            return null;
        }

        return true;
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

function lg_require_post(): bool
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
        return true;
    }

    header('Allow: POST');
    lg_json_response(405, ['ok' => false, 'error' => 'Use POST to send this form.']);
    return false;
}
