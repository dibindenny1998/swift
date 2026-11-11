<?php
require __DIR__ . '/lib/bootstrap.php';

$a = $_GET['a'] ?? '';
if ($a === 'health') {
    $ok = true; $info = ['php' => PHP_VERSION, 'sqlite' => extension_loaded('pdo_sqlite'), 'gd' => extension_loaded('gd'), 'curl' => extension_loaded('curl')];
    try { db()->query('SELECT 1'); $info['db'] = true; } catch (Throwable $t) { $info['db'] = false; $ok = false; }
    $info['outside_webroot'] = str_ends_with(data_dir(), 'wedlink-data');
    $info['payments_live'] = payments_live();
    json_out(['ok' => $ok] + $info);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['ok' => false, 'error' => 'Use POST.'], 405);

function body_json(): array
{
    $j = json_decode((string)file_get_contents('php://input'), true);
    return is_array($j) ? $j : [];
}
function clip($v, int $max): string
{
    $s = is_scalar($v) ? (string)$v : '';
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';
    return mb_substr(trim($s), 0, $max);
}
function sanitize_data(array $r): array
{
    $d = [];
    foreach (['p1' => 40, 'p2' => 40, 'p1_family' => 160, 'p2_family' => 160, 'intro' => 80, 'line' => 100, 'message' => 500, 'closing' => 120, 'contact_name' => 40, 'about_p1' => 400, 'about_p2' => 400, 'story' => 1200, 'notes' => 500] as $k => $max) {
        $d[$k] = clip($r[$k] ?? '', $max);
    }
    $d['contact_phone'] = substr(preg_replace('/[^\d+]/', '', (string)($r['contact_phone'] ?? '')) ?? '', 0, 15);
    $d['events'] = [];
    foreach (array_slice(is_array($r['events'] ?? null) ? $r['events'] : [], 0, 6) as $ev) {
        if (!is_array($ev)) continue;
        $date = (string)($ev['date'] ?? '');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || !checkdate((int)substr($date, 5, 2), (int)substr($date, 8, 2), (int)substr($date, 0, 4))) continue;
        $time = preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', (string)($ev['time'] ?? '')) ? $ev['time'] : '';
        $map = clip($ev['map'] ?? '', 300);
        if ($map !== '' && !preg_match('#^https://(maps\.app\.goo\.gl|goo\.gl|g\.co|(www\.|maps\.)?google\.[a-z.]{2,8})/#i', $map)) $map = '';
        $d['events'][] = ['name' => clip($ev['name'] ?? '', 40) ?: 'Wedding', 'date' => $date, 'time' => $time,
            'venue' => clip($ev['venue'] ?? '', 80), 'address' => clip($ev['address'] ?? '', 160), 'map' => $map];
    }
    // one video: YouTube, Vimeo or Google Drive (Premium)
    $v = clip($r['video'] ?? '', 300);
    if ($v !== '' && !preg_match('#^https://(www\.|m\.|player\.)?(youtube\.com|youtu\.be|vimeo\.com|drive\.google\.com)/#i', $v)) $v = '';
    $d['video'] = $v;
    $d['video_kind'] = in_array($r['video_kind'] ?? '', ['prewedding', 'wishes', 'story'], true) ? $r['video_kind'] : 'prewedding';
    $d['gift_note'] = clip($r['gift_note'] ?? '', 200);
    $d['gifts'] = [];
    $seen = [];
    foreach (array_slice(is_array($r['gifts'] ?? null) ? $r['gifts'] : [], 0, MAX_GIFTS) as $g) {
        if (!is_array($g)) continue;
        $name = clip($g['name'] ?? '', 60);
        if ($name === '') continue;
        $id = preg_match('/^[a-z0-9]{6,12}$/', (string)($g['id'] ?? '')) ? (string)$g['id'] : substr(rand_hex(5), 0, 8);
        if (isset($seen[$id])) $id = substr(rand_hex(5), 0, 8);
        $seen[$id] = true;
        $link = clip($g['link'] ?? '', 300);
        if ($link !== '' && !preg_match('#^https://[a-z0-9.-]+\.[a-z]{2,}(/|$)#i', $link)) $link = '';
        $d['gifts'][] = ['id' => $id, 'name' => $name, 'note' => clip($g['note'] ?? '', 120), 'link' => $link];
    }
    return $d;
}
function design_error(string $theme): string
{
    return THEMES[$theme]['name'] . ' is a ' . TIER_NAMES[theme_tier($theme)] . ' design. Pick another design or upgrade your plan.';
}
function save_image(array $f, string $dir): ?string
{
    if (($f['error'] ?? 1) !== UPLOAD_ERR_OK || $f['size'] > 12 * 1024 * 1024) return null;
    $info = @getimagesize($f['tmp_name']);
    if (!$info || !in_array($info[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP, IMAGETYPE_GIF], true)) return null;
    if ($info[0] * $info[1] > 40000000) return null;
    $img = @imagecreatefromstring((string)file_get_contents($f['tmp_name']));
    if (!$img) return null;
    if ($info[2] === IMAGETYPE_JPEG && function_exists('exif_read_data')) {
        $o = (int)(@exif_read_data($f['tmp_name'])['Orientation'] ?? 1);
        if ($o === 3) $img = imagerotate($img, 180, 0);
        elseif ($o === 6) $img = imagerotate($img, -90, 0);
        elseif ($o === 8) $img = imagerotate($img, 90, 0);
    }
    $w = imagesx($img); $h = imagesy($img);
    $s = min(1, 1600 / max($w, $h));
    if ($s < 1) {
        $nw = (int)round($w * $s); $nh = (int)round($h * $s);
        $dst = imagecreatetruecolor($nw, $nh);
        imagefill($dst, 0, 0, imagecolorallocate($dst, 255, 255, 255));
        imagecopyresampled($dst, $img, 0, 0, 0, 0, $nw, $nh, $w, $h);
        imagedestroy($img); $img = $dst;
    } elseif ($info[2] !== IMAGETYPE_JPEG) {
        $dst = imagecreatetruecolor($w, $h);
        imagefill($dst, 0, 0, imagecolorallocate($dst, 255, 255, 255));
        imagecopy($dst, $img, 0, 0, 0, 0, $w, $h);
        imagedestroy($img); $img = $dst;
    }
    $name = rand_hex(8) . '.jpg';
    $ok = imagejpeg($img, $dir . '/' . $name, 82);
    imagedestroy($img);
    return $ok ? $name : null;
}
function save_music(array $f, string $dir): ?string
{
    if (($f['error'] ?? 1) !== UPLOAD_ERR_OK || $f['size'] > 10 * 1024 * 1024 || $f['size'] < 1000) return null;
    $ext = strtolower(pathinfo((string)$f['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['mp3', 'm4a', 'aac', 'mp4'], true)) return null;
    $mime = function_exists('finfo_open') ? (string)finfo_file(finfo_open(FILEINFO_MIME_TYPE), $f['tmp_name']) : 'audio/mpeg';
    if (!preg_match('#^(audio/|video/mp4|application/octet-stream)#', $mime)) return null;
    $name = rand_hex(8) . '.' . ($ext === 'mp3' ? 'mp3' : 'm4a');
    return move_uploaded_file($f['tmp_name'], $dir . '/' . $name) ? $name : null;
}
function client_ip(): string { return substr((string)($_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? ''), 0, 64); }

try {
    switch ($a) {

    case 'save': {
        $raw = json_decode((string)($_POST['data'] ?? ''), true);
        if (!is_array($raw)) json_out(['ok' => false, 'error' => 'Something was missing. Refresh and try again.'], 400);
        $d = sanitize_data($raw);
        $theme = isset(THEMES[$raw['theme'] ?? '']) ? $raw['theme'] : 'kasavu';
        if ($d['p1'] === '' || $d['p2'] === '') json_out(['ok' => false, 'error' => 'Add both names.'], 422);
        if (!$d['events']) json_out(['ok' => false, 'error' => 'Add a date for at least one event.'], 422);

        $inv = null;
        if (!empty($_POST['token'])) {
            $inv = find_invite('token', (string)$_POST['token']);
            if (!$inv) json_out(['ok' => false, 'error' => 'This invite was not found.'], 404);
        }
        $pdo = db();
        if (!$inv) {
            $phone = normalize_phone((string)($_POST['phone'] ?? ''));
            if (strlen($phone) !== 10) json_out(['ok' => false, 'error' => 'Enter a 10-digit mobile number.'], 422);
            $email = clip($_POST['email'] ?? '', 120);
            if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $email = '';
            $ip = client_ip();
            $st = $pdo->prepare("SELECT COUNT(*) FROM invites WHERE ip = ? AND created_at > ?");
            $st->execute([$ip, date('Y-m-d H:i:s', time() - 3600)]);
            if ((int)$st->fetchColumn() >= 25) json_out(['ok' => false, 'error' => 'Too many invites from this connection. Try again in an hour.'], 429);

            $base = slugify($d['p1'] . '-' . $d['p2']) ?: 'invite';
            $base = substr($base, 0, 40);
            // the cleanest link first (arjun-meera); a short code is added only if that name is taken
            $slug = $base;
            while (find_invite('slug', $slug)) $slug = $base . '-' . substr(base_convert(rand_hex(4), 16, 36), 0, 4);
            $token = rand_hex(16);
            $pdo->prepare("INSERT INTO invites (slug, token, theme, data, phone, email, utm_source, utm_campaign, fbclid, fbp, user_agent, ip, created_at, updated_at)
                           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
                ->execute([$slug, $token, $theme, '{}', $phone, $email, clip($_POST['utm_source'] ?? '', 80), clip($_POST['utm_campaign'] ?? '', 120),
                    clip($_POST['fbclid'] ?? '', 300), clip($_POST['fbp'] ?? '', 120), clip($_SERVER['HTTP_USER_AGENT'] ?? '', 300), $ip, now(), now()]);
            $inv = find_invite('token', $token);
            attach_to_user('invites', (int)$inv['id']);
            // who sent them: the couple whose link they came from
            $ref = (string)($_COOKIE['wl_ref'] ?? '');
            if ($ref !== '' && ($by = find_invite('slug', $ref)) && $by['status'] === 'paid' && (int)$by['id'] !== (int)$inv['id'] && $by['phone'] !== $phone) {
                $pdo->prepare('UPDATE invites SET referred_by = ? WHERE id = ?')->execute([$by['id'], $inv['id']]);
                $inv['referred_by'] = $by['id'];
            }
        }
        if ($inv['status'] === 'paid' && !theme_allowed($theme, $inv['plan'])) json_out(['ok' => false, 'error' => design_error($theme)], 422);
        $prev = invite_data($inv);
        $dir = data_dir() . '/uploads/' . (int)$inv['id'];
        if (!is_dir($dir)) @mkdir($dir, 0750, true);

        // photos, in the order the couple arranged them
        $order = json_decode((string)($_POST['photo_order'] ?? '[]'), true);
        $oldPhotos = $prev['photos'] ?? [];
        $photos = [];
        foreach (array_slice(is_array($order) ? $order : [], 0, 15) as $o) {
            if (!is_string($o)) continue;
            if (str_starts_with($o, 'old:')) {
                $n = substr($o, 4);
                if (in_array($n, $oldPhotos, true)) $photos[] = $n;
            } elseif (preg_match('/^new:(\d{1,2})$/', $o, $m) && isset($_FILES['photo_' . $m[1]])) {
                $n = save_image($_FILES['photo_' . $m[1]], $dir);
                if ($n) $photos[] = $n;
            }
        }
        foreach (array_diff($oldPhotos, $photos) as $gone) @unlink($dir . '/' . basename($gone));
        $d['photos'] = $photos;

        $oldMusic = $prev['music'] ?? '';
        if (isset($_FILES['music'])) {
            $n = save_music($_FILES['music'], $dir);
            if (!$n) json_out(['ok' => false, 'error' => 'That song could not be used. Upload an MP3 or M4A under 10 MB.'], 422);
            if ($oldMusic) @unlink($dir . '/' . basename($oldMusic));
            $d['music'] = $n;
            $d['music_label'] = clip($_POST['music_label'] ?? '', 40);
        } elseif (($_POST['music_keep'] ?? '0') === '1' && $oldMusic) {
            $d['music'] = $oldMusic;
            $d['music_label'] = $prev['music_label'] ?? '';
        } elseif ($oldMusic) {
            @unlink($dir . '/' . basename($oldMusic));
        }

        $pdo->prepare('UPDATE invites SET data = ?, theme = ?, updated_at = ? WHERE id = ?')
            ->execute([json_encode($d, JSON_UNESCAPED_UNICODE), $theme, now(), $inv['id']]);
        $keep = array_column($d['gifts'], 'id');
        foreach (gift_claims((int)$inv['id']) as $c) {
            if (!in_array($c['gift_id'], $keep, true)) $pdo->prepare('DELETE FROM gift_claims WHERE id = ?')->execute([$c['id']]);
        }
        json_out(['ok' => true, 'token' => $inv['token']]);
    }

    case 'login_code': {
        // step 1 of email sign-in: send a 6-digit code
        $j = body_json();
        $email = strtolower(clip($j['email'] ?? '', 120));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_out(['ok' => false, 'error' => 'Enter a valid email address.'], 422);
        $pdo = db();
        $st = $pdo->prepare('SELECT COUNT(*) FROM login_codes WHERE (email = ? OR ip = ?) AND created_at > ?');
        $st->execute([$email, client_ip(), date('Y-m-d H:i:s', time() - 3600)]);
        if ((int)$st->fetchColumn() >= 6) json_out(['ok' => false, 'error' => 'Too many codes. Try again in an hour.'], 429);
        $code = (string)random_int(100000, 999999);
        $pdo->prepare('INSERT INTO login_codes (email, code_hash, expires_at, ip, created_at) VALUES (?,?,?,?,?)')
            ->execute([$email, password_hash($code, PASSWORD_DEFAULT), time() + 900, client_ip(), now()]);
        $sent = send_login_code($email, $code);
        $local = in_array(parse_url(base_url(), PHP_URL_HOST), ['127.0.0.1', 'localhost'], true);
        if (!$sent && !$local) json_out(['ok' => false, 'error' => 'We could not send the email. Try again, or sign in with Google.'], 502);
        json_out(['ok' => true] + ($local ? ['dev_code' => $code] : []));
    }

    case 'login_verify': {
        $j = body_json();
        $email = strtolower(clip($j['email'] ?? '', 120));
        $code = preg_replace('/\D/', '', (string)($j['code'] ?? '')) ?? '';
        $st = db()->prepare('SELECT * FROM login_codes WHERE email = ? AND used = 0 AND expires_at > ? ORDER BY id DESC LIMIT 1');
        $st->execute([$email, time()]);
        $row = $st->fetch();
        if (!$row) json_out(['ok' => false, 'error' => 'This code has expired. Ask for a new one.'], 422);
        if ((int)$row['tries'] >= 5) json_out(['ok' => false, 'error' => 'Too many wrong tries. Ask for a new code.'], 429);
        if (!password_verify($code, $row['code_hash'])) {
            db()->prepare('UPDATE login_codes SET tries = tries + 1 WHERE id = ?')->execute([$row['id']]);
            json_out(['ok' => false, 'error' => 'That code is not right. Check the email and try again.'], 422);
        }
        db()->prepare('UPDATE login_codes SET used = 1 WHERE id = ?')->execute([$row['id']]);
        $u = user_upsert($email);
        sign_in_user((int)$u['id'], 'email');
        json_out(['ok' => true, 'need_phone' => !$u['phone']]);
    }

    case 'login_google': {
        $j = body_json();
        $g = google_verify((string)($j['credential'] ?? ''));
        if (!$g) json_out(['ok' => false, 'error' => 'Google sign-in did not work. Try again or use your email.'], 422);
        $u = user_upsert($g[0], $g[1], $g[2]);
        sign_in_user((int)$u['id'], 'google');
        json_out(['ok' => true, 'need_phone' => !$u['phone']]);
    }

    case 'profile': {
        $u = current_user();
        if (!$u) json_out(['ok' => false, 'error' => 'Please sign in again.'], 401);
        $j = body_json();
        $name = clip($j['name'] ?? '', 80);
        $phone = normalize_phone((string)($j['phone'] ?? ''));
        if (mb_strlen($name) < 2) json_out(['ok' => false, 'field' => 'name', 'error' => 'Add your name.'], 422);
        if (strlen($phone) !== 10) json_out(['ok' => false, 'field' => 'phone', 'error' => 'Enter a 10-digit mobile number.'], 422);
        db()->prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?')->execute([$name, $phone, $u['id']]);
        json_out(['ok' => true]);
    }

    case 'logout': { sign_out_user(); json_out(['ok' => true]); }

    case 'claim': {
        // put invites and biodatas this browser made into the signed-in account (the private links prove ownership)
        $u = current_user();
        if (!$u) json_out(['ok' => false], 401);
        $j = body_json(); $n = 0;
        foreach (array_slice((array)($j['invites'] ?? []), 0, 20) as $t) if (is_string($t) && ($i = find_invite('token', $t))) { attach_to_user('invites', (int)$i['id']); $n++; }
        foreach (array_slice((array)($j['bios'] ?? []), 0, 20) as $t) if (is_string($t) && ($b = find_bio('token', $t))) { attach_to_user('biodata', (int)$b['id']); $n++; }
        json_out(['ok' => true, 'n' => $n]);
    }

    case 'details': {
        // name, mobile and address, asked once before buying or downloading
        $j = body_json();
        $kind = ($j['kind'] ?? '') === 'biodata' ? 'biodata' : 'invite';
        $item = $kind === 'biodata' ? find_bio('token', (string)($j['t'] ?? '')) : find_invite('token', (string)($j['t'] ?? ''));
        if (!$item) json_out(['ok' => false, 'error' => 'Not found. Refresh the page and try again.'], 404);
        $name = clip($j['name'] ?? '', 80);
        $phone = normalize_phone((string)($j['phone'] ?? ''));
        $email = clip($j['email'] ?? '', 120);
        $address = clip($j['address'] ?? '', 200);
        $city = clip($j['city'] ?? '', 60);
        $state = clip($j['state'] ?? '', 60);
        $pin = preg_replace('/\D/', '', (string)($j['pincode'] ?? '')) ?? '';
        if (mb_strlen($name) < 2) json_out(['ok' => false, 'field' => 'name', 'error' => 'Add your name.'], 422);
        if (strlen($phone) !== 10) json_out(['ok' => false, 'field' => 'phone', 'error' => 'Enter a 10-digit mobile number.'], 422);
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) json_out(['ok' => false, 'field' => 'email', 'error' => 'That email does not look right. You can also leave it empty.'], 422);
        if (mb_strlen($city) < 2) json_out(['ok' => false, 'field' => 'city', 'error' => 'Add your city or town.'], 422);
        if (!in_array($state, INDIAN_STATES, true)) json_out(['ok' => false, 'field' => 'state', 'error' => 'Choose your state.'], 422);
        if ($state !== 'Outside India' && !preg_match('/^[1-9]\d{5}$/', $pin)) json_out(['ok' => false, 'field' => 'pincode', 'error' => 'Enter a 6-digit PIN code.'], 422);
        db()->prepare('INSERT INTO customers (kind, ref_id, name, phone, email, address, city, state, pincode, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)
                       ON CONFLICT(kind, ref_id) DO UPDATE SET name=excluded.name, phone=excluded.phone, email=excluded.email, address=excluded.address, city=excluded.city, state=excluded.state, pincode=excluded.pincode, updated_at=excluded.updated_at')
            ->execute([$kind, $item['id'], $name, $phone, $email, $address, $city, $state, substr($pin, 0, 6), now(), now()]);
        $tbl = $kind === 'biodata' ? 'biodata' : 'invites';
        if ($email !== '') db()->prepare("UPDATE $tbl SET email = ? WHERE id = ? AND (email IS NULL OR email = '')")->execute([$email, $item['id']]);
        json_out(['ok' => true]);
    }

    case 'order': {
        $j = body_json();
        $inv = find_invite('token', (string)($j['t'] ?? ''));
        if (!$inv) json_out(['ok' => false, 'error' => 'This invite was not found.'], 404);
        if (!customer_get('invite', (int)$inv['id'])) json_out(['ok' => false, 'need_details' => true, 'error' => 'Add your details first.'], 428);
        $plan = ($j['plan'] ?? '') === 'standard' ? 'standard' : 'premium';
        if ($inv['status'] === 'paid' && PLAN_RANK[$plan] <= (PLAN_RANK[$inv['plan']] ?? 2)) json_out(['ok' => false, 'error' => 'This invite is already on ' . PLAN_NAMES[$inv['plan']] . '.'], 409);
        if (!theme_allowed($inv['theme'], $plan)) json_out(['ok' => false, 'error' => design_error($inv['theme'])], 422);
        $amount = upgrade_price($inv, $plan) * 100;
        db()->prepare('UPDATE invites SET pending_plan = ?, checkout_at = COALESCE(checkout_at, ?) WHERE id = ?')->execute([$plan, now(), $inv['id']]);
        if ($amount === 0) {
            // fully covered by referral credit: no payment needed
            apply_payment(array_merge($inv, ['pending_plan' => $plan]), 0, 'credit-' . rand_hex(3), !payments_live());
            json_out(['ok' => true, 'free' => true]);
        }
        if (!payments_live()) json_out(['ok' => true, 'demo' => true, 'amount' => $amount]);
        // PayU: a fresh transaction id, then the signed form that sends the customer to PayU's payment page
        $txnid = 'WL' . $inv['id'] . 'T' . time() . strtoupper(rand_hex(2));
        db()->prepare('UPDATE invites SET rzp_order_id = ? WHERE id = ?')->execute([$txnid, $inv['id']]);
        $c = customer_get('invite', (int)$inv['id']) ?: [];
        $d = invite_data($inv);
        json_out(['ok' => true, 'payu' => ['action' => payu_url(), 'fields' => payu_fields('invite', $inv['token'], $txnid, $amount,
            PLAN_NAMES[$plan] . ' wedding website: ' . invite_title($d), (string)($c['name'] ?? invite_title($d)), (string)($c['email'] ?? $inv['email'] ?? ''), (string)($c['phone'] ?? $inv['phone']))]]);
    }

    case 'theme': {
        // switch design from the preview page
        $j = body_json();
        $inv = find_invite('token', (string)($j['t'] ?? ''));
        if (!$inv) json_out(['ok' => false, 'error' => 'This invite was not found.'], 404);
        $theme = (string)($j['theme'] ?? '');
        if (!isset(THEMES[$theme])) json_out(['ok' => false, 'error' => 'Unknown design.'], 422);
        if ($inv['status'] === 'paid' && !theme_allowed($theme, $inv['plan'])) json_out(['ok' => false, 'upgrade' => min_plan_for($theme), 'error' => design_error($theme)], 422);
        db()->prepare('UPDATE invites SET theme = ?, updated_at = ? WHERE id = ?')->execute([$theme, now(), $inv['id']]);
        json_out(['ok' => true]);
    }

    case 'publish_free': {
        $j = body_json();
        $inv = find_invite('token', (string)($j['t'] ?? ''));
        if (!$inv) json_out(['ok' => false, 'error' => 'This invite was not found.'], 404);
        if ($inv['status'] === 'paid') json_out(['ok' => true]);
        if (!theme_allowed($inv['theme'], 'free')) json_out(['ok' => false, 'error' => 'The free plan includes five designs: Classic, Blush, Terracotta, Olive and Indigo. Switch to one of them, or choose Premium.'], 422);
        publish_free($inv);
        json_out(['ok' => true]);
    }

    case 'verify': {
        $j = body_json();
        $inv = find_invite('token', (string)($j['t'] ?? ''));
        if (!$inv) json_out(['ok' => false, 'error' => 'This invite was not found.'], 404);
        $oid = (string)($j['razorpay_order_id'] ?? ''); $pid = (string)($j['razorpay_payment_id'] ?? ''); $sig = (string)($j['razorpay_signature'] ?? '');
        if ($oid === '' || $oid !== $inv['rzp_order_id']) json_out(['ok' => false, 'error' => 'Payment did not match this invite. Contact us if money was taken.'], 400);
        if (!hash_equals(hash_hmac('sha256', $oid . '|' . $pid, setting('rzp_key_secret')), $sig)) {
            json_out(['ok' => false, 'error' => 'Payment could not be verified. Contact us if money was taken.'], 400);
        }
        $amount = upgrade_price($inv, $inv['pending_plan'] ?: 'premium') * 100;
        $o = rzp_request('GET', '/orders/' . rawurlencode($oid));
        if ($o['code'] === 200 && !empty($o['body']['amount'])) $amount = (int)$o['body']['amount'];
        apply_payment($inv, $amount, $pid);
        json_out(['ok' => true]);
    }

    case 'demo_pay': {
        if (payments_live()) json_out(['ok' => false, 'error' => 'Payments are live.'], 403);
        $j = body_json();
        $inv = find_invite('token', (string)($j['t'] ?? ''));
        if (!$inv) json_out(['ok' => false, 'error' => 'This invite was not found.'], 404);
        $plan = ($j['plan'] ?? '') === 'standard' ? 'standard' : 'premium';
        if (!theme_allowed($inv['theme'], $plan)) json_out(['ok' => false, 'error' => design_error($inv['theme'])], 422);
        $amount = upgrade_price($inv, $plan) * 100;
        apply_payment(array_merge($inv, ['pending_plan' => $plan]), $amount, 'demo-' . rand_hex(3), true);
        json_out(['ok' => true]);
    }

    case 'gift': {
        $j = body_json();
        $inv = find_invite('slug', (string)($j['slug'] ?? ''));
        if (!$inv || $inv['status'] !== 'paid' || !(PLAN_LIMITS[$inv['plan']]['gifts'] ?? false)) json_out(['ok' => false, 'error' => 'The gift list is not open for this invite.'], 404);
        $gid = (string)($j['gift'] ?? '');
        $gifts = array_column(invite_data($inv)['gifts'] ?? [], 'name', 'id');
        if (!isset($gifts[$gid])) json_out(['ok' => false, 'error' => 'This gift is no longer on the list.'], 404);
        $name = clip($j['name'] ?? '', 80);
        if ($name === '') json_out(['ok' => false, 'error' => 'Add your name so the couple knows who it is from.'], 422);
        $st = db()->prepare('SELECT COUNT(*) FROM gift_claims WHERE invite_id = ? AND created_at > ? ');
        $st->execute([$inv['id'], date('Y-m-d H:i:s', time() - 60)]);
        if ((int)$st->fetchColumn() > 20) json_out(['ok' => false, 'error' => 'Too many requests. Try again in a minute.'], 429);
        try {
            db()->prepare('INSERT INTO gift_claims (invite_id, gift_id, name, phone, message, created_at) VALUES (?,?,?,?,?,?)')
                ->execute([$inv['id'], $gid, $name, substr(preg_replace('/[^\d+]/', '', (string)($j['phone'] ?? '')) ?? '', 0, 15), clip($j['message'] ?? '', 300), now()]);
        } catch (PDOException $x) {
            json_out(['ok' => false, 'taken' => true, 'error' => 'Someone has just picked this gift. Please choose another one.'], 409);
        }
        json_out(['ok' => true]);
    }

    case 'gift_release': {
        $j = body_json();
        $inv = find_invite('token', (string)($j['t'] ?? ''));
        if (!$inv) json_out(['ok' => false, 'error' => 'This invite was not found.'], 404);
        db()->prepare('DELETE FROM gift_claims WHERE invite_id = ? AND id = ?')->execute([$inv['id'], (int)($j['claim'] ?? 0)]);
        json_out(['ok' => true]);
    }

    case 'enquiry': {
        $j = body_json();
        $name = clip($j['name'] ?? '', 80);
        $phone = normalize_phone((string)($j['phone'] ?? ''));
        if ($name === '') json_out(['ok' => false, 'error' => 'Add your name.'], 422);
        if (strlen($phone) !== 10) json_out(['ok' => false, 'error' => 'Enter a 10-digit mobile number.'], 422);
        $email = clip($j['email'] ?? '', 120);
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $email = '';
        $date = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)($j['date'] ?? '')) ? $j['date'] : '';
        $wants = implode(', ', array_slice(array_filter(array_map(fn($x) => clip($x, 40), is_array($j['wants'] ?? null) ? $j['wants'] : [])), 0, 8));
        $ip = client_ip();
        $st = db()->prepare('SELECT COUNT(*) FROM enquiries WHERE ip = ? AND created_at > ?');
        $st->execute([$ip, date('Y-m-d H:i:s', time() - 3600)]);
        if ((int)$st->fetchColumn() >= 5) json_out(['ok' => false, 'error' => 'We already have your request. We will be in touch soon.'], 429);
        db()->prepare('INSERT INTO enquiries (name, phone, email, wedding_date, wants, message, ip, created_at) VALUES (?,?,?,?,?,?,?,?)')
            ->execute([$name, $phone, $email, $date, $wants, clip($j['message'] ?? '', 1000), $ip, now()]);
        json_out(['ok' => true]);
    }

    /* ---------- marriage biodata ---------- */

    case 'bio_save': {
        $raw = json_decode((string)($_POST['data'] ?? ''), true);
        if (!is_array($raw)) json_out(['ok' => false, 'error' => 'Something was missing. Refresh and try again.'], 400);
        $d = bio_sanitize($raw);
        if ($d['name'] === '') json_out(['ok' => false, 'error' => 'Add the full name.'], 422);
        $tpl = isset(BIO_TEMPLATES[$_POST['template'] ?? '']) ? $_POST['template'] : 'royal';
        $pdo = db();
        $bio = null;
        if (!empty($_POST['token'])) {
            $bio = find_bio('token', (string)$_POST['token']);
            if (!$bio) json_out(['ok' => false, 'error' => 'This biodata was not found.'], 404);
        } else {
            $phone = normalize_phone((string)($_POST['phone'] ?? ''));
            if (strlen($phone) !== 10) json_out(['ok' => false, 'error' => 'Enter a 10-digit mobile number.'], 422);
            $ip = client_ip();
            $st = $pdo->prepare('SELECT COUNT(*) FROM biodata WHERE ip = ? AND created_at > ?');
            $st->execute([$ip, date('Y-m-d H:i:s', time() - 3600)]);
            if ((int)$st->fetchColumn() >= 25) json_out(['ok' => false, 'error' => 'Too many from this connection. Try again in an hour.'], 429);
            $token = rand_hex(16);
            $pdo->prepare('INSERT INTO biodata (token, template, data, phone, utm_source, utm_campaign, fbclid, ip, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
                ->execute([$token, $tpl, '{}', $phone, clip($_POST['utm_source'] ?? '', 80), clip($_POST['utm_campaign'] ?? '', 120), clip($_POST['fbclid'] ?? '', 300), $ip, now(), now()]);
            $bio = find_bio('token', $token);
            attach_to_user('biodata', (int)$bio['id']);
        }
        $photo = $bio['photo'];
        $dir = data_dir() . '/uploads/b' . (int)$bio['id'];
        if (isset($_FILES['photo'])) {
            if (!is_dir($dir)) @mkdir($dir, 0750, true);
            $n = save_image($_FILES['photo'], $dir);
            if (!$n) json_out(['ok' => false, 'error' => 'That photo could not be used. Try a JPG or PNG.'], 422);
            if ($photo) @unlink($dir . '/' . basename($photo));
            $photo = $n;
        } elseif (($_POST['photo_keep'] ?? '1') !== '1' && $photo) {
            @unlink($dir . '/' . basename($photo));
            $photo = null;
        }
        $pdo->prepare('UPDATE biodata SET data = ?, template = ?, photo = ?, updated_at = ? WHERE id = ?')
            ->execute([json_encode($d, JSON_UNESCAPED_UNICODE), $tpl, $photo, now(), $bio['id']]);
        json_out(['ok' => true, 'token' => $bio['token']]);
    }

    case 'bio_style': {
        // change style, colour and symbol from the download page
        $j = body_json();
        $bio = find_bio('token', (string)($j['t'] ?? ''));
        if (!$bio) json_out(['ok' => false, 'error' => 'This biodata was not found.'], 404);
        $tpl = isset(BIO_TEMPLATES[$j['template'] ?? '']) ? $j['template'] : $bio['template'];
        $d = json_decode($bio['data'], true) ?: [];
        if (isset(BIO_LAYOUTS[$j['layout'] ?? ''])) $d['layout'] = $j['layout'];
        if (array_key_exists('symbol', $j)) $d['symbol'] = !empty($j['symbol']);
        db()->prepare('UPDATE biodata SET template = ?, data = ?, updated_at = ? WHERE id = ?')
            ->execute([$tpl, json_encode($d, JSON_UNESCAPED_UNICODE), now(), $bio['id']]);
        json_out(['ok' => true]);
    }

    case 'bio_order': {
        $j = body_json();
        $bio = find_bio('token', (string)($j['t'] ?? ''));
        if (!$bio) json_out(['ok' => false, 'error' => 'This biodata was not found.'], 404);
        if ((int)$bio['paid'] === 1) json_out(['ok' => false, 'error' => 'This biodata is already clean.'], 409);
        if (!customer_get('biodata', (int)$bio['id'])) json_out(['ok' => false, 'need_details' => true, 'error' => 'Add your details first.'], 428);
        $amount = price('biodata') * 100;
        db()->prepare('UPDATE biodata SET checkout_at = COALESCE(checkout_at, ?) WHERE id = ?')->execute([now(), $bio['id']]);
        if (!payments_live()) json_out(['ok' => true, 'demo' => true, 'amount' => $amount]);
        $txnid = 'WB' . $bio['id'] . 'T' . time() . strtoupper(rand_hex(2));
        db()->prepare('UPDATE biodata SET rzp_order_id = ? WHERE id = ?')->execute([$txnid, $bio['id']]);
        $c = customer_get('biodata', (int)$bio['id']) ?: [];
        $name = (json_decode($bio['data'], true) ?: [])['name'] ?? '';
        json_out(['ok' => true, 'payu' => ['action' => payu_url(), 'fields' => payu_fields('biodata', $bio['token'], $txnid, $amount,
            'Biodata clean copy' . ($name ? ': ' . $name : ''), (string)($c['name'] ?? $name), (string)($c['email'] ?? $bio['email'] ?? ''), (string)($c['phone'] ?? $bio['phone']))]]);
    }

    case 'bio_verify': {
        $j = body_json();
        $bio = find_bio('token', (string)($j['t'] ?? ''));
        if (!$bio) json_out(['ok' => false, 'error' => 'This biodata was not found.'], 404);
        $oid = (string)($j['razorpay_order_id'] ?? ''); $pid = (string)($j['razorpay_payment_id'] ?? ''); $sig = (string)($j['razorpay_signature'] ?? '');
        if ($oid === '' || $oid !== $bio['rzp_order_id']) json_out(['ok' => false, 'error' => 'Payment did not match this biodata. Contact us if money was taken.'], 400);
        if (!hash_equals(hash_hmac('sha256', $oid . '|' . $pid, setting('rzp_key_secret')), $sig)) {
            json_out(['ok' => false, 'error' => 'Payment could not be verified. Contact us if money was taken.'], 400);
        }
        $amount = price('biodata') * 100;
        $o = rzp_request('GET', '/orders/' . rawurlencode($oid));
        if ($o['code'] === 200 && !empty($o['body']['amount'])) $amount = (int)$o['body']['amount'];
        apply_bio_payment($bio, $amount, $pid);
        json_out(['ok' => true]);
    }

    case 'bio_demo_pay': {
        if (payments_live()) json_out(['ok' => false, 'error' => 'Payments are live.'], 403);
        $j = body_json();
        $bio = find_bio('token', (string)($j['t'] ?? ''));
        if (!$bio) json_out(['ok' => false, 'error' => 'This biodata was not found.'], 404);
        apply_bio_payment($bio, price('biodata') * 100, 'demo-' . rand_hex(3), true);
        json_out(['ok' => true]);
    }

    case 'bio_download': {
        $j = body_json();
        $bio = find_bio('token', (string)($j['t'] ?? ''));
        if ($bio) db()->prepare('UPDATE biodata SET downloads = downloads + 1 WHERE id = ?')->execute([$bio['id']]);
        json_out(['ok' => true]);
    }

    case 'rsvp': {
        $j = body_json();
        $inv = find_invite('slug', (string)($j['slug'] ?? ''));
        if (!$inv || $inv['status'] !== 'paid' || $inv['plan'] !== 'premium') json_out(['ok' => false, 'error' => 'RSVPs are not open for this invite.'], 404);
        $name = clip($j['name'] ?? '', 80);
        if ($name === '') json_out(['ok' => false, 'error' => 'Add your name.'], 422);
        $att = (string)($j['attending'] ?? '1') === '0' ? 0 : 1;
        $guests = $att ? max(1, min(10, (int)($j['guests'] ?? 1))) : 0;
        $st = db()->prepare('SELECT COUNT(*) FROM rsvps WHERE invite_id = ?');
        $st->execute([$inv['id']]);
        if ((int)$st->fetchColumn() > 2000) json_out(['ok' => false, 'error' => 'RSVPs are full.'], 429);
        db()->prepare('INSERT INTO rsvps (invite_id, name, phone, attending, guests, message, created_at) VALUES (?,?,?,?,?,?,?)')
            ->execute([$inv['id'], $name, substr(preg_replace('/[^\d+]/', '', (string)($j['phone'] ?? '')) ?? '', 0, 15), $att, $guests, clip($j['message'] ?? '', 400), now()]);
        json_out(['ok' => true]);
    }

    case 'webhook': {
        $body = (string)file_get_contents('php://input');
        $secret = setting('rzp_webhook_secret');
        $sig = (string)($_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ?? '');
        if ($secret === '' || !hash_equals(hash_hmac('sha256', $body, $secret), $sig)) json_out(['ok' => false], 400);
        $ev = json_decode($body, true) ?: [];
        $type = $ev['event'] ?? '';
        $oid = ''; $pid = null; $amount = 0;
        if ($type === 'order.paid') {
            $oid = (string)($ev['payload']['order']['entity']['id'] ?? '');
            $amount = (int)($ev['payload']['order']['entity']['amount_paid'] ?? 0);
            $pid = $ev['payload']['payment']['entity']['id'] ?? null;
        } elseif ($type === 'payment.captured') {
            $oid = (string)($ev['payload']['payment']['entity']['order_id'] ?? '');
            $amount = (int)($ev['payload']['payment']['entity']['amount'] ?? 0);
            $pid = $ev['payload']['payment']['entity']['id'] ?? null;
        }
        if ($oid !== '') {
            $inv = find_invite('rzp_order_id', $oid);
            if ($inv) apply_payment($inv, $amount ?: upgrade_price($inv, $inv['pending_plan'] ?: 'premium') * 100, $pid);
            elseif ($bio = find_bio('rzp_order_id', $oid)) apply_bio_payment($bio, $amount ?: price('biodata') * 100, $pid);
        }
        json_out(['ok' => true]);
    }

    case 'tracked': {
        $j = body_json();
        $inv = find_invite('token', (string)($j['t'] ?? ''));
        if ($inv) db()->prepare('UPDATE invites SET purchase_tracked = 1 WHERE id = ?')->execute([$inv['id']]);
        json_out(['ok' => true]);
    }
    }
} catch (Throwable $t) {
    error_log('TheWedLink API error: ' . $t->getMessage() . ' @' . $t->getFile() . ':' . $t->getLine());
    json_out(['ok' => false, 'error' => 'Something went wrong on our side. Try again.'], 500);
}
json_out(['ok' => false, 'error' => 'Unknown action.'], 404);
