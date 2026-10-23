<?php
/**
 * VINAYA admin: shared helpers (sessions, login, storage).
 *
 * The admin keeps its data (edited text, contact details, uploaded photos, the password) in
 * a folder NEXT TO public_html, so a fresh website upload never wipes it. If that folder
 * cannot be created, it falls back to admin/data/ (blocked from the web by .htaccess).
 */

declare(strict_types=1);

const SESSION_IDLE_SECONDS = 2 * 60 * 60;
const MAX_LOGIN_FAILS = 5;
const LOCKOUT_SECONDS = 15 * 60;

function site_root(): string
{
    return dirname(__DIR__);
}

function data_dir(): string
{
    static $dir = null;
    if ($dir !== null) {
        return $dir;
    }
    $outside = dirname(site_root()) . '/vinaya-data';
    if ((is_dir($outside) || @mkdir($outside, 0750, true)) && is_writable($outside)) {
        return $dir = $outside;
    }
    $inside = __DIR__ . '/data';
    if (!is_dir($inside)) {
        @mkdir($inside, 0750, true);
    }
    return $dir = $inside;
}

function read_json(string $name, $default)
{
    $file = data_dir() . '/' . $name;
    if (!is_file($file)) {
        return $default;
    }
    $value = json_decode((string) file_get_contents($file), true);
    return $value ?? $default;
}

function write_atomic(string $file, string $content): void
{
    $dir = dirname($file);
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException('Cannot create folder ' . basename($dir));
    }
    $tmp = $file . '.tmp-' . bin2hex(random_bytes(4));
    if (file_put_contents($tmp, $content, LOCK_EX) === false || !rename($tmp, $file)) {
        @unlink($tmp);
        throw new RuntimeException('Cannot write ' . basename($file));
    }
}

function write_json(string $name, $value): void
{
    write_atomic(data_dir() . '/' . $name, json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

// ---------------------------------------------------------------- sessions

function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $https = ($_SERVER['HTTPS'] ?? '') !== '' && $_SERVER['HTTPS'] !== 'off'
        || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    session_name('VINAYAADMIN');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/admin/',
        'secure' => $https,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
    if (!empty($_SESSION['user']) && time() - (int) ($_SESSION['seen'] ?? 0) > SESSION_IDLE_SECONDS) {
        $_SESSION = [];
        session_regenerate_id(true);
    }
    $_SESSION['seen'] = time();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
}

function logged_in(): bool
{
    return !empty($_SESSION['user']);
}

function no_cache_headers(): void
{
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex, nofollow');
    header('X-Frame-Options: DENY');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: same-origin');
}

// ---------------------------------------------------------------- credentials

function credentials(): array
{
    $saved = read_json('auth.json', null);
    if (is_array($saved) && !empty($saved['username']) && !empty($saved['hash'])) {
        return $saved;
    }
    return require __DIR__ . '/config.php';
}

function client_ip(): string
{
    return (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
}

/** Seconds left on a lockout for this visitor, 0 when they may try. */
function lockout_remaining(): int
{
    $fails = read_json('login-fails.json', []);
    $entry = $fails[hash('sha256', client_ip())] ?? null;
    if (!$entry || ($entry['until'] ?? 0) <= time()) {
        return 0;
    }
    return (int) $entry['until'] - time();
}

function record_login(bool $ok): void
{
    $fails = read_json('login-fails.json', []);
    $key = hash('sha256', client_ip());
    if ($ok) {
        unset($fails[$key]);
    } else {
        $entry = $fails[$key] ?? ['count' => 0, 'until' => 0];
        if (($entry['until'] ?? 0) <= time() && ($entry['count'] ?? 0) >= MAX_LOGIN_FAILS) {
            $entry = ['count' => 0, 'until' => 0];
        }
        $entry['count']++;
        $entry['last'] = time();
        if ($entry['count'] >= MAX_LOGIN_FAILS) {
            $entry['until'] = time() + LOCKOUT_SECONDS;
        }
        $fails[$key] = $entry;
    }
    // Forget entries untouched for a day.
    foreach ($fails as $k => $e) {
        if (max((int) ($e['last'] ?? 0), (int) ($e['until'] ?? 0)) < time() - 86400) {
            unset($fails[$k]);
        }
    }
    write_json('login-fails.json', $fails);
}

function attempt_login(string $username, string $password): bool
{
    $creds = credentials();
    $ok = hash_equals(strtolower($creds['username']), strtolower(trim($username)))
        && password_verify($password, $creds['hash']);
    record_login($ok);
    if ($ok) {
        session_regenerate_id(true);
        $_SESSION['user'] = $creds['username'];
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $ok;
}
