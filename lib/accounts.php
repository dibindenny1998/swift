<?php
/* Customer accounts: sign in with an email code or Google, then add a mobile number. Invites and biodatas attach to the account. */

function accounts_schema(PDO $pdo): void
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL, name TEXT, phone TEXT, google_sub TEXT, via TEXT,
        created_at TEXT NOT NULL, last_login TEXT
    )");
    $pdo->exec("CREATE TABLE IF NOT EXISTS login_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, code_hash TEXT NOT NULL,
        expires_at INTEGER NOT NULL, tries INTEGER NOT NULL DEFAULT 0, used INTEGER NOT NULL DEFAULT 0, ip TEXT, created_at TEXT NOT NULL
    )");
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_codes_email ON login_codes(email, created_at)');
    foreach (['invites', 'biodata'] as $t) {
        $cols = array_column($pdo->query("PRAGMA table_info($t)")->fetchAll(), 'name');
        if (!in_array('user_id', $cols, true)) $pdo->exec("ALTER TABLE $t ADD COLUMN user_id INTEGER");
    }
}

function user_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_name('wluser');
    session_set_cookie_params(['lifetime' => 86400 * 90, 'path' => '/', 'secure' => $secure, 'httponly' => true, 'samesite' => 'Lax']);
    ini_set('session.gc_maxlifetime', (string)(86400 * 90));
    session_start();
}
/** The signed-in customer, or null. Only opens a session when the visitor already has one. */
function current_user(): ?array
{
    static $u = false;
    if ($u !== false) return $u;
    $u = null;
    if (empty($_COOKIE['wluser']) && session_status() !== PHP_SESSION_ACTIVE) return null;
    user_session();
    if (!empty($_SESSION['uid'])) {
        $st = db()->prepare('SELECT * FROM users WHERE id = ?');
        $st->execute([(int)$_SESSION['uid']]);
        $u = $st->fetch() ?: null;
    }
    return $u;
}
function sign_in_user(int $id, string $via): void
{
    user_session();
    session_regenerate_id(true);
    $_SESSION['uid'] = $id;
    db()->prepare('UPDATE users SET last_login = ?, via = COALESCE(via, ?) WHERE id = ?')->execute([now(), $via, $id]);
}
function sign_out_user(): void { user_session(); $_SESSION = []; session_destroy(); setcookie('wluser', '', time() - 3600, '/'); }

function user_by_email(string $email): ?array
{
    $st = db()->prepare('SELECT * FROM users WHERE email = ?');
    $st->execute([strtolower($email)]);
    return $st->fetch() ?: null;
}
function user_upsert(string $email, string $name = '', string $googleSub = ''): array
{
    $email = strtolower($email);
    if (!($u = user_by_email($email))) {
        db()->prepare('INSERT INTO users (email, name, google_sub, created_at) VALUES (?,?,?,?)')->execute([$email, $name, $googleSub ?: null, now()]);
        $u = user_by_email($email);
    } else {
        if ($name !== '' && !$u['name']) db()->prepare('UPDATE users SET name = ? WHERE id = ?')->execute([$name, $u['id']]);
        if ($googleSub !== '' && !$u['google_sub']) db()->prepare('UPDATE users SET google_sub = ? WHERE id = ?')->execute([$googleSub, $u['id']]);
    }
    return user_by_email($email);
}

/** Puts an invite or biodata into the signed-in account (whoever holds the private link owns it). */
function attach_to_user(string $table, int $id): void
{
    $u = current_user();
    if (!$u || !in_array($table, ['invites', 'biodata'], true)) return;
    db()->prepare("UPDATE $table SET user_id = ? WHERE id = ? AND user_id IS NULL")->execute([$u['id'], $id]);
}

function send_login_code(string $email, string $code): bool
{
    $brand = setting('brand');
    $host = preg_replace('#^https?://#', '', base_url());
    $from = setting('mail_from') ?: ('no-reply@' . preg_replace('/^www\./', '', parse_url(base_url(), PHP_URL_HOST) ?: 'localhost'));
    $subject = "$code is your $brand sign-in code";
    $body = "Your $brand sign-in code is:\r\n\r\n    $code\r\n\r\nIt works for 15 minutes. If you did not ask for it, you can ignore this email.\r\n\r\n$brand · $host";
    $headers = "From: $brand <$from>\r\nReply-To: " . (setting('support_email') ?: $from) . "\r\nContent-Type: text/plain; charset=UTF-8";
    return @mail($email, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers, '-f' . $from);
}

/** Checks a Google sign-in token with Google and returns [email, name, sub] or null. */
function google_verify(string $idToken): ?array
{
    $cid = setting('google_client_id');
    if ($cid === '' || $idToken === '' || !function_exists('curl_init')) return null;
    $ch = curl_init('https://oauth2.googleapis.com/tokeninfo?id_token=' . rawurlencode($idToken));
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10]);
    $res = curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    $j = $code === 200 ? json_decode((string)$res, true) : null;
    if (!is_array($j) || ($j['aud'] ?? '') !== $cid || !in_array($j['iss'] ?? '', ['accounts.google.com', 'https://accounts.google.com'], true)) return null;
    if (($j['email_verified'] ?? '') !== 'true' && ($j['email_verified'] ?? false) !== true) return null;
    if ((int)($j['exp'] ?? 0) < time()) return null;
    return [strtolower((string)$j['email']), (string)($j['name'] ?? ''), (string)$j['sub']];
}
