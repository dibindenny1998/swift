<?php
/**
 * VINAYA — enquiry form handler (Hostinger web hosting, PHP 8+).
 *
 * The addresses come from the admin panel (Contact details), or else from site.config.mjs
 * when you run `node build.mjs`.
 * With JavaScript the form posts here in the background and gets JSON back; without
 * JavaScript the visitor is redirected back to the contact page with a message.
 */

declare(strict_types=1);

// Addresses set in the admin panel (Contact details) take over from the built-in ones.
$settings = [];
foreach ([dirname(__DIR__) . '/vinaya-data/settings.json', __DIR__ . '/admin/data/settings.json'] as $settingsFile) {
    if (is_file($settingsFile)) {
        $settings = json_decode((string) file_get_contents($settingsFile), true) ?: [];
        break;
    }
}
define('TO_EMAIL', (string) (($settings['contactEmail'] ?? '') ?: '__CONTACT_EMAIL__'));
define('FROM_EMAIL', (string) (($settings['fromEmail'] ?? '') ?: '__FROM_EMAIL__'));
const SITE_NAME = 'Vinaya';
const MIN_SECONDS_BETWEEN_SENDS = 30;

$wantsJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');

function finish(bool $ok, string $error = '', int $status = 200, array $fields = []): never
{
    global $wantsJson;
    if ($wantsJson) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode(['ok' => $ok, 'error' => $error ?: null, 'fields' => $fields]);
        exit;
    }
    $target = 'contact/' . ($ok ? '?sent=1#enquiry-sent' : '?error=' . rawurlencode($error) . '#enquiry-error');
    header('Location: ' . $target, true, 303);
    exit;
}

function isPlaceholder(string $value): bool
{
    return $value === '' || str_contains($value, '[') || str_contains($value, '__');
}

// Single line, no control characters (blocks header injection), trimmed and length-limited.
function line(string $key, int $max = 200): string
{
    $value = (string) ($_POST[$key] ?? '');
    $value = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value) ?? '';
    return mb_substr(trim($value), 0, $max);
}

function text(string $key, int $max = 5000): string
{
    $value = str_replace(["\r\n", "\r"], "\n", (string) ($_POST[$key] ?? ''));
    $value = preg_replace('/[\x00-\x08\x0B-\x1F\x7F]+/u', '', $value) ?? '';
    return mb_substr(trim($value), 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    finish(false, 'method', 405);
}

// Spam trap: real visitors never see or fill this field. Pretend all went well.
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    finish(true);
}

$data = [
    'name' => line('name'),
    'company' => line('company'),
    'country' => line('country', 100),
    'email' => line('email', 254),
    'phone' => line('phone', 40),
    'interest' => line('interest', 100),
    'quantity' => line('quantity'),
    'message' => text('message'),
];

$invalid = [];
foreach (['name', 'company', 'country', 'email', 'message'] as $required) {
    if ($data[$required] === '') {
        $invalid[] = $required;
    }
}
if ($data['email'] !== '' && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $invalid[] = 'email';
}
if ($data['phone'] !== '' && !preg_match('/^[+()\d\s.\-]{6,24}$/', $data['phone'])) {
    $invalid[] = 'phone';
}
if ($invalid) {
    finish(false, 'invalid', 422, array_values(array_unique($invalid)));
}

if (isPlaceholder(TO_EMAIL)) {
    finish(false, 'not_configured', 503);
}

// Gentle rate limit per visitor IP.
$stamp = sys_get_temp_dir() . '/vinaya_enquiry_' . hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . TO_EMAIL);
if (is_file($stamp) && time() - (int) @filemtime($stamp) < MIN_SECONDS_BETWEEN_SENDS) {
    finish(false, 'too_fast', 429);
}

$labels = [
    'name' => 'Name',
    'company' => 'Company',
    'country' => 'Country',
    'email' => 'Email',
    'phone' => 'Phone / WhatsApp',
    'interest' => 'Product interest',
    'quantity' => 'Estimated quantity',
];
$body = "New enquiry from the Vinaya website\n\n";
foreach ($labels as $key => $label) {
    $body .= str_pad($label . ':', 22) . ($data[$key] !== '' ? $data[$key] : '-') . "\n";
}
$body .= "\nMessage:\n" . $data['message'] . "\n\n";
$body .= "--\nSent: " . gmdate('Y-m-d H:i') . " UTC\nIP: " . ($_SERVER['REMOTE_ADDR'] ?? '') . "\n";

$from = isPlaceholder(FROM_EMAIL) ? TO_EMAIL : FROM_EMAIL;
$subject = 'Vinaya enquiry: ' . $data['company'] . ' (' . $data['country'] . ')';
$headers = [
    'From' => mb_encode_mimeheader(SITE_NAME . ' website', 'UTF-8') . " <{$from}>",
    'Reply-To' => mb_encode_mimeheader($data['name'], 'UTF-8') . " <{$data['email']}>",
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/plain; charset=UTF-8',
    'Content-Transfer-Encoding' => '8bit',
    'X-Mailer' => 'Vinaya website',
];

$sent = mail(TO_EMAIL, mb_encode_mimeheader($subject, 'UTF-8'), $body, $headers, '-f' . $from);

if (!$sent) {
    error_log('Vinaya enquiry: mail() failed');
    finish(false, 'send_failed', 500);
}

@touch($stamp);
finish(true);
