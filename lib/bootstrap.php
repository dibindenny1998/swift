<?php
declare(strict_types=1);

date_default_timezone_set('Asia/Kolkata');
mb_internal_encoding('UTF-8');

const APP_VERSION = '1.0.0';
// bcrypt hash of the first admin password. Change it from Admin → Settings; the new one is stored in the database.
const ADMIN_DEFAULT_HASH = '$2y$11$ApuzEe1Z4lTaqYK1tTCOWurl.MtvnTE9WvLQB1nh5wtzOclMU4XNa';

const THEMES = [
    // Free plan: two simple, clean designs.
    'classic'   => ['name' => 'Classic',   'note' => 'Simple black serif on soft ivory', 'tags' => ['modern', 'hindu', 'christian', 'muslim', 'sikh'], 'tier' => 'free'],
    'blush'     => ['name' => 'Blush',     'note' => 'Soft pink with a fine rose line', 'tags' => ['modern', 'hindu', 'christian', 'muslim', 'sikh'], 'tier' => 'free'],
    // Standard and above.
    'champagne' => ['name' => 'Champagne', 'note' => 'Gold foil on blush and ivory silk', 'tags' => ['modern'], 'tier' => 'standard'],
    'kasavu'    => ['name' => 'Kasavu',    'note' => 'Ivory and gold, like a Kerala saree border', 'tags' => ['hindu', 'christian', 'kerala'], 'tier' => 'standard'],
    'noor'      => ['name' => 'Noor',      'note' => 'Emerald and gold with a mihrab arch', 'tags' => ['muslim'], 'tier' => 'standard'],
    'sindoor'   => ['name' => 'Sindoor',   'note' => 'Deep red with a gold mandala', 'tags' => ['hindu'], 'tier' => 'standard'],
    'kesar'     => ['name' => 'Kesar',     'note' => 'Royal blue, saffron and phulkari', 'tags' => ['sikh'], 'tier' => 'standard'],
    'grace'     => ['name' => 'Grace',     'note' => 'Dusty blue with a silver olive wreath', 'tags' => ['christian', 'modern'], 'tier' => 'standard'],
    'marigold'  => ['name' => 'Marigold',  'note' => 'Bright garlands for a festive day', 'tags' => ['hindu', 'sikh'], 'tier' => 'standard'],
    'nilavu'    => ['name' => 'Nilavu',    'note' => 'Moonlit navy with hanging diyas', 'tags' => ['hindu', 'muslim', 'modern'], 'tier' => 'standard'],
    'mullappoo' => ['name' => 'Mullappoo', 'note' => 'Jasmine strings on clean white', 'tags' => ['kerala', 'hindu', 'christian', 'modern'], 'tier' => 'standard'],
    'thamara'   => ['name' => 'Thamara',   'note' => 'Soft pink with lotus line art', 'tags' => ['hindu', 'modern'], 'tier' => 'standard'],
    'gulmohar'  => ['name' => 'Gulmohar',  'note' => 'A flowering branch on warm ivory', 'tags' => ['modern', 'christian', 'muslim'], 'tier' => 'standard'],
    // Premium designs (₹499 plan).
    'velvet'    => ['name' => 'Velvet',    'note' => 'Wine velvet with art deco gold', 'tags' => ['modern'], 'tier' => 'premium'],
    'gopuram'   => ['name' => 'Gopuram',   'note' => 'Temple tower in gold on maroon', 'tags' => ['hindu', 'kerala'], 'tier' => 'premium'],
    'mayil'     => ['name' => 'Mayil',     'note' => 'Peacock feathers in teal and gold', 'tags' => ['hindu', 'kerala', 'modern'], 'tier' => 'premium'],
    'qamar'     => ['name' => 'Qamar',     'note' => 'Midnight lanterns and a crescent moon', 'tags' => ['muslim'], 'tier' => 'premium'],
    'chapel'    => ['name' => 'Chapel',    'note' => 'Stained-glass arch and a gold cross', 'tags' => ['christian', 'kerala'], 'tier' => 'premium'],
    'jaipur'    => ['name' => 'Jaipur',    'note' => 'Pink sandstone palace arches', 'tags' => ['hindu', 'sikh'], 'tier' => 'premium'],
];

const CATEGORIES = ['hindu' => 'Hindu', 'christian' => 'Christian', 'muslim' => 'Muslim', 'sikh' => 'Sikh', 'kerala' => 'Kerala', 'modern' => 'Modern'];

const PLAN_NAMES = ['free' => 'Basic', 'standard' => 'Standard', 'premium' => 'Premium'];
const PLAN_RANK = ['free' => 0, 'standard' => 1, 'premium' => 2];
const TIER_NAMES = ['free' => 'Free', 'standard' => 'Standard', 'premium' => 'Premium'];

const PLAN_LIMITS = [
    'free'     => ['events' => 2, 'photos' => 0,  'rsvp' => false, 'music' => false, 'gifts' => false, 'badge' => true],
    'standard' => ['events' => 3, 'photos' => 1,  'rsvp' => false, 'music' => false, 'gifts' => false, 'badge' => true],
    'premium'  => ['events' => 6, 'photos' => 15, 'rsvp' => true,  'music' => true,  'gifts' => true,  'badge' => false],
];

const MAX_GIFTS = 40;

function theme_tier(string $theme): string { return THEMES[$theme]['tier'] ?? 'standard'; }
/** Can an invite on $plan use $theme? Free designs work on every plan; premium designs need Premium. */
function theme_allowed(string $theme, string $plan): bool
{
    return isset(THEMES[$theme]) && (PLAN_RANK[$plan] ?? 2) >= PLAN_RANK[theme_tier($theme)];
}
/** Cheapest plan that includes a design. */
function min_plan_for(string $theme): string { return theme_tier($theme); }
function themes_by_tier(string $tier): array { return array_keys(array_filter(THEMES, fn($t) => $t['tier'] === $tier)); }

/* ---------- storage ---------- */

function data_dir(): string
{
    static $dir = null;
    if ($dir !== null) return $dir;
    // Prefer a folder outside public_html so git deploys never touch customer data.
    $candidates = [dirname(__DIR__, 2) . '/wedlink-data', dirname(__DIR__) . '/data'];
    foreach ($candidates as $c) {
        if ((is_dir($c) || @mkdir($c, 0750, true)) && is_writable($c)) { $dir = $c; break; }
    }
    if ($dir === null) {
        http_response_code(500);
        exit('Storage folder is not writable.');
    }
    if (!is_dir($dir . '/uploads')) @mkdir($dir . '/uploads', 0750, true);
    if (!file_exists($dir . '/.htaccess')) @file_put_contents($dir . '/.htaccess', "Require all denied\n");
    return $dir;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo) return $pdo;
    $pdo = new PDO('sqlite:' . data_dir() . '/wedlink.sqlite');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;');
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS invites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            token TEXT UNIQUE NOT NULL,
            theme TEXT NOT NULL,
            data TEXT NOT NULL,
            plan TEXT NOT NULL DEFAULT 'premium',
            pending_plan TEXT,
            status TEXT NOT NULL DEFAULT 'draft',
            phone TEXT, email TEXT,
            amount INTEGER NOT NULL DEFAULT 0,
            is_demo INTEGER NOT NULL DEFAULT 0,
            rzp_order_id TEXT, rzp_payment_id TEXT,
            utm_source TEXT, utm_campaign TEXT, fbclid TEXT, fbp TEXT, user_agent TEXT, ip TEXT,
            views INTEGER NOT NULL DEFAULT 0,
            purchase_tracked INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
            checkout_at TEXT, paid_at TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_inv_status ON invites(status, created_at);
        CREATE INDEX IF NOT EXISTS idx_inv_order ON invites(rzp_order_id);
        CREATE TABLE IF NOT EXISTS rsvps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invite_id INTEGER NOT NULL REFERENCES invites(id) ON DELETE CASCADE,
            name TEXT NOT NULL, phone TEXT, attending INTEGER NOT NULL, guests INTEGER NOT NULL DEFAULT 1,
            message TEXT, created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_rsvp_inv ON rsvps(invite_id);
        CREATE TABLE IF NOT EXISTS settings (k TEXT PRIMARY KEY, v TEXT);
        CREATE TABLE IF NOT EXISTS adspend (
            id INTEGER PRIMARY KEY AUTOINCREMENT, day TEXT NOT NULL, amount INTEGER NOT NULL, note TEXT, created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS visits (day TEXT PRIMARY KEY, landing INTEGER NOT NULL DEFAULT 0, create_views INTEGER NOT NULL DEFAULT 0);
        CREATE TABLE IF NOT EXISTS gift_claims (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invite_id INTEGER NOT NULL REFERENCES invites(id) ON DELETE CASCADE,
            gift_id TEXT NOT NULL, name TEXT NOT NULL, phone TEXT, message TEXT, created_at TEXT NOT NULL
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_gift_once ON gift_claims(invite_id, gift_id);
        CREATE TABLE IF NOT EXISTS biodata (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token TEXT UNIQUE NOT NULL,
            template TEXT NOT NULL DEFAULT 'royal',
            data TEXT NOT NULL,
            photo TEXT,
            phone TEXT, email TEXT,
            paid INTEGER NOT NULL DEFAULT 0, is_demo INTEGER NOT NULL DEFAULT 0, amount INTEGER NOT NULL DEFAULT 0,
            rzp_order_id TEXT, rzp_payment_id TEXT,
            utm_source TEXT, utm_campaign TEXT, fbclid TEXT, ip TEXT,
            downloads INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL, updated_at TEXT NOT NULL, checkout_at TEXT, paid_at TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_bio_order ON biodata(rzp_order_id);
        CREATE TABLE IF NOT EXISTS enquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT, wedding_date TEXT, wants TEXT, message TEXT,
            status TEXT NOT NULL DEFAULT 'new', ip TEXT, created_at TEXT NOT NULL
        );
    ");
    // v2 pricing: Basic ₹199, Premium ₹499 (runs once, even if old prices were saved in admin)
    if (!$pdo->query("SELECT 1 FROM settings WHERE k = 'mig_prices_v2'")->fetchColumn()) {
        $pdo->exec("INSERT OR REPLACE INTO settings(k, v) VALUES ('price_standard', '199'), ('price_premium', '499'), ('mig_prices_v2', '1')");
    }
    return $pdo;
}

function now(): string { return date('Y-m-d H:i:s'); }

/* ---------- settings ---------- */

const SETTING_DEFAULTS = [
    'brand'           => 'WedLink',
    'business_name'   => 'WedLink',
    'support_phone'   => '',
    'support_email'   => '',
    'address'         => 'Bangalore, Karnataka, India',
    'price_standard'  => '199',
    'price_premium'   => '499',
    'price_biodata'   => '399',
    'custom_from'     => '',
    'rzp_key_id'      => '',
    'rzp_key_secret'  => '',
    'rzp_webhook_secret' => '',
    'pixel_id'        => '',
    'capi_token'      => '',
    'admin_hash'      => '',
];

function setting(string $k): string
{
    static $cache = null;
    if ($cache === null) {
        $cache = [];
        foreach (db()->query('SELECT k, v FROM settings') as $r) $cache[$r['k']] = (string)$r['v'];
    }
    if (array_key_exists($k, $cache) && $cache[$k] !== '') return $cache[$k];
    return SETTING_DEFAULTS[$k] ?? '';
}

function set_setting(string $k, string $v): void
{
    $st = db()->prepare('INSERT INTO settings(k, v) VALUES(?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v');
    $st->execute([$k, $v]);
}

function price(string $plan): int
{
    if ($plan === 'free') return 0;
    if ($plan === 'biodata') return max(1, (int)setting('price_biodata'));
    return max(1, (int)setting($plan === 'standard' ? 'price_standard' : 'price_premium'));
}
/** What it costs to move an invite from its current plan to $target (₹). Drafts pay the full price. */
function upgrade_price(array $inv, string $target): int
{
    $from = $inv['status'] === 'paid' ? $inv['plan'] : null;
    if ($from === null) return price($target);
    return max(0, price($target) - price($from));
}
function payments_live(): bool { return setting('rzp_key_id') !== '' && setting('rzp_key_secret') !== ''; }

/* ---------- helpers ---------- */

function e(?string $s): string { return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

function base_url(): string
{
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
        || (($_SERVER['SERVER_PORT'] ?? '') === '443');
    $host = preg_replace('/[^A-Za-z0-9.:-]/', '', $_SERVER['HTTP_HOST'] ?? 'localhost');
    return ($https ? 'https' : 'http') . '://' . $host;
}

function json_out(array $data, int $code = 200): never
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function rand_hex(int $bytes = 16): string { return bin2hex(random_bytes($bytes)); }

function slugify(string $s): string
{
    $s = strtolower(trim($s));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
    return trim($s, '-');
}

function is_bot(): bool
{
    $ua = strtolower($_SERVER['HTTP_USER_AGENT'] ?? '');
    return $ua === '' || (bool)preg_match('/bot|crawl|spider|facebookexternalhit|whatsapp|preview|slurp|curl|wget|python|headless/', $ua);
}

function count_visit(string $col): void
{
    if (is_bot() || !in_array($col, ['landing', 'create_views'], true)) return;
    try {
        $day = date('Y-m-d');
        db()->prepare("INSERT INTO visits(day, $col) VALUES(?, 1) ON CONFLICT(day) DO UPDATE SET $col = $col + 1")->execute([$day]);
    } catch (Throwable $t) { /* never block a page on stats */ }
}

function normalize_phone(string $p): string
{
    $d = preg_replace('/\D+/', '', $p) ?? '';
    if (strlen($d) === 12 && str_starts_with($d, '91')) $d = substr($d, 2);
    if (strlen($d) === 11 && str_starts_with($d, '0')) $d = substr($d, 1);
    return $d;
}

function rupees(int $paise): string { return '₹' . number_format($paise / 100, 0, '.', ','); }

function find_invite(string $col, string $val): ?array
{
    if (!in_array($col, ['token', 'slug', 'rzp_order_id', 'id'], true)) return null;
    $st = db()->prepare("SELECT * FROM invites WHERE $col = ? LIMIT 1");
    $st->execute([$val]);
    $row = $st->fetch();
    return $row ?: null;
}

function invite_data(array $inv): array
{
    $d = json_decode($inv['data'], true);
    return is_array($d) ? $d : [];
}

function invite_title(array $d): string
{
    $a = trim((string)($d['p1'] ?? ''));
    $b = trim((string)($d['p2'] ?? ''));
    return trim($a . ($a && $b ? ' & ' : '') . $b) ?: 'Wedding invitation';
}

function sorted_events(array $d): array
{
    $ev = array_values(array_filter($d['events'] ?? [], fn($e) => is_array($e) && !empty($e['date'])));
    usort($ev, fn($a, $b) => strcmp(($a['date'] ?? '') . ($a['time'] ?? ''), ($b['date'] ?? '') . ($b['time'] ?? '')));
    return $ev;
}

/** Public JSON for the renderer, trimmed to what the plan includes. */
function public_payload(array $inv, ?string $planOverride = null): array
{
    $d = invite_data($inv);
    $plan = $planOverride ?? $inv['plan'];
    $lim = PLAN_LIMITS[$plan] ?? PLAN_LIMITS['premium'];
    $d['theme'] = $inv['theme'];
    $d['plan'] = $plan;
    $d['slug'] = $inv['slug'];
    $d['photos'] = array_map(fn($f) => '/m/' . $inv['id'] . '/' . $f, $d['photos'] ?? []);
    $d['music'] = !empty($d['music']) ? '/m/' . $inv['id'] . '/' . $d['music'] : '';
    $d['gifts'] = array_values(array_filter($d['gifts'] ?? [], 'is_array'));
    $d['gifts_taken'] = $d['gifts'] ? array_column(gift_claims((int)$inv['id']), 'gift_id') : [];
    // Never show a design the plan does not include (e.g. after a downgrade by an admin).
    if (!theme_allowed($inv['theme'], $plan)) $d['theme'] = themes_by_tier('free')[0];
    return $d;
}

function json_for_script(array $d): string
{
    return json_encode($d, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
}

function asset(string $path): string
{
    $file = dirname(__DIR__) . '/' . ltrim($path, '/');
    $v = is_file($file) ? substr((string)filemtime($file), -6) : APP_VERSION;
    return '/' . ltrim($path, '/') . '?v=' . $v;
}

/* ---------- payments ---------- */

function mark_paid(array $inv, string $plan, int $amountPaise, ?string $paymentId, bool $demo = false): void
{
    if ($inv['status'] === 'paid') return;
    $st = db()->prepare("UPDATE invites SET status='paid', plan=?, amount=?, rzp_payment_id=?, is_demo=?, paid_at=?, updated_at=? WHERE id=? AND status!='paid'");
    $st->execute([$plan, $amountPaise, $paymentId, $demo ? 1 : 0, now(), now(), $inv['id']]);
    if ($st->rowCount() > 0 && !$demo) capi_purchase($inv, $amountPaise);
}

/** Applies a confirmed payment: publishes a draft, or moves a published invite up to a higher plan. */
function apply_payment(array $inv, int $amountPaise, ?string $paymentId, bool $demo = false): void
{
    $target = isset(PLAN_RANK[$inv['pending_plan'] ?? '']) ? $inv['pending_plan'] : 'premium';
    if ($inv['status'] !== 'paid') { mark_paid($inv, $target, $amountPaise, $paymentId, $demo); return; }
    if (PLAN_RANK[$target] > (PLAN_RANK[$inv['plan']] ?? 2) && ($paymentId === null || $paymentId !== $inv['rzp_payment_id'])) {
        $st = db()->prepare("UPDATE invites SET plan = ?, amount = amount + ?, rzp_payment_id = ?, is_demo = CASE WHEN amount = 0 THEN ? ELSE is_demo END, updated_at = ? WHERE id = ? AND plan = ?");
        $st->execute([$target, $amountPaise, $paymentId, $demo ? 1 : 0, now(), $inv['id'], $inv['plan']]);
        if ($st->rowCount() > 0 && !$demo && !$inv['is_demo']) capi_purchase($inv, $amountPaise);
    }
}

/** Publishes an invite on the free plan. */
function publish_free(array $inv): void
{
    if ($inv['status'] === 'paid') return;
    db()->prepare("UPDATE invites SET status='paid', plan='free', amount=0, is_demo=0, paid_at=?, updated_at=? WHERE id=? AND status!='paid'")
        ->execute([now(), now(), $inv['id']]);
}

/** Confirmed biodata payment: removes the watermark. */
function apply_bio_payment(array $bio, int $amountPaise, ?string $paymentId, bool $demo = false): void
{
    if ((int)$bio['paid'] === 1) return;
    db()->prepare('UPDATE biodata SET paid=1, amount=?, rzp_payment_id=?, is_demo=?, paid_at=?, updated_at=? WHERE id=? AND paid=0')
        ->execute([$amountPaise, $paymentId, $demo ? 1 : 0, now(), now(), $bio['id']]);
}

function find_bio(string $col, string $val): ?array
{
    if (!in_array($col, ['token', 'rzp_order_id', 'id'], true)) return null;
    $st = db()->prepare("SELECT * FROM biodata WHERE $col = ? LIMIT 1");
    $st->execute([$val]);
    return $st->fetch() ?: null;
}

function gift_claims(int $inviteId): array
{
    $st = db()->prepare('SELECT * FROM gift_claims WHERE invite_id = ? ORDER BY id');
    $st->execute([$inviteId]);
    return $st->fetchAll();
}

function rzp_request(string $method, string $path, ?array $body = null): array
{
    $ch = curl_init('https://api.razorpay.com/v1' . $path);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERPWD => setting('rzp_key_id') . ':' . setting('rzp_key_secret'),
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    ]);
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    $res = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    $json = is_string($res) ? json_decode($res, true) : null;
    return ['code' => $code, 'body' => is_array($json) ? $json : [], 'error' => $err];
}

/** Server-side Meta Conversions API purchase event (optional; needs pixel id + token). */
function capi_purchase(array $inv, int $amountPaise): void
{
    $pixel = setting('pixel_id');
    $token = setting('capi_token');
    if ($pixel === '' || $token === '' || !function_exists('curl_init')) return;
    $user = ['client_ip_address' => $inv['ip'] ?? '', 'client_user_agent' => $inv['user_agent'] ?? ''];
    if (!empty($inv['phone'])) $user['ph'] = [hash('sha256', '91' . normalize_phone($inv['phone']))];
    if (!empty($inv['fbp'])) $user['fbp'] = $inv['fbp'];
    if (!empty($inv['fbclid'])) $user['fbc'] = 'fb.1.' . (strtotime($inv['created_at']) * 1000) . '.' . $inv['fbclid'];
    $payload = ['data' => [[
        'event_name' => 'Purchase',
        'event_time' => time(),
        'event_id' => 'inv_' . $inv['id'],
        'action_source' => 'website',
        'event_source_url' => base_url() . '/p/' . $inv['token'],
        'user_data' => $user,
        'custom_data' => ['currency' => 'INR', 'value' => $amountPaise / 100, 'content_name' => 'Wedding invite'],
    ]]];
    $ch = curl_init('https://graph.facebook.com/v19.0/' . rawurlencode($pixel) . '/events?access_token=' . rawurlencode($token));
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_TIMEOUT => 8,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => json_encode($payload)]);
    @curl_exec($ch);
    curl_close($ch);
}

/* ---------- page chrome ---------- */

function pixel_snippet(): string
{
    $id = setting('pixel_id');
    if ($id === '' || !preg_match('/^\d{5,20}$/', $id)) return '<script>window.fbq=window.fbq||function(){};</script>';
    $id = e($id);
    return "<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','{$id}');fbq('track','PageView');</script>";
}

function site_head(string $title, string $desc = '', string $ogImage = '/assets/og/site.jpg', string $extraHead = ''): void
{
    $brand = setting('brand');
    $og = str_starts_with($ogImage, 'http') ? $ogImage : base_url() . $ogImage;
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
        . '<title>' . e($title) . '</title>'
        . ($desc ? '<meta name="description" content="' . e($desc) . '">' : '')
        . '<meta property="og:type" content="website"><meta property="og:site_name" content="' . e($brand) . '">'
        . '<meta property="og:title" content="' . e($title) . '">'
        . ($desc ? '<meta property="og:description" content="' . e($desc) . '">' : '')
        . '<meta property="og:image" content="' . e($og) . '"><meta name="twitter:card" content="summary_large_image">'
        . '<meta name="theme-color" content="#FDF0F1">'
        . '<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">'
        . '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
        . '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap">'
        . '<link rel="stylesheet" href="' . asset('assets/site.css') . '">'
        . $extraHead
        . pixel_snippet()
        . '</head>';
}

function site_footer(): void
{
    $brand = e(setting('brand'));
    $wa = normalize_phone(setting('support_phone'));
    echo '<footer class="foot"><div class="wrap foot-in">'
        . '<a class="logo" href="/">' . $brand . '</a>'
        . '<nav class="foot-links"><a href="/legal.php?p=contact">Contact</a><a href="/legal.php?p=terms">Terms</a>'
        . '<a href="/legal.php?p=privacy">Privacy</a><a href="/legal.php?p=refund">Refunds</a>'
        . ($wa ? '<a href="https://wa.me/91' . e($wa) . '" rel="noopener">WhatsApp us</a>' : '')
        . '</nav><p class="foot-note">&copy; ' . date('Y') . ' ' . e(setting('business_name')) . '. Payments secured by Razorpay.</p>'
        . '</div></footer>';
}
require __DIR__ . '/slots.php';
require __DIR__ . '/biodata.php';
