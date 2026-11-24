<?php
/* Cashfree Payments hosted checkout (API 2023-08-01). The server creates an order, the browser opens Cashfree's checkout
   with the payment_session_id, and Cashfree sends the customer back to /cashfree.php?order_id=… . We always confirm
   with Cashfree's API before marking anything paid; the webhook to the same URL covers customers who close the page. */

function cf_mode(): string { return setting('cf_mode') === 'live' ? 'live' : 'test'; }
function cf_live(): bool { return setting('cf_app_id') !== '' && setting('cf_secret') !== ''; }
function cf_base(): string { return cf_mode() === 'live' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg'; }

/** Calls the Cashfree PG API. Returns ['code' => int, 'body' => array]. */
function cf_request(string $method, string $path, ?array $body = null): array
{
    if (!function_exists('curl_init')) return ['code' => 0, 'body' => []];
    $ch = curl_init(cf_base() . $path);
    $h = ['Accept: application/json', 'Content-Type: application/json', 'x-api-version: 2023-08-01',
        'x-client-id: ' . setting('cf_app_id'), 'x-client-secret: ' . setting('cf_secret')];
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 20, CURLOPT_CUSTOMREQUEST => $method, CURLOPT_HTTPHEADER => $h]);
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    $res = curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    return ['code' => $code, 'body' => json_decode((string)$res, true) ?: []];
}

/** Creates a Cashfree order. Returns the payment_session_id, or throws with a message the customer can read. */
function cf_create_order(string $kind, string $token, string $orderId, int $paise, string $note, string $name, string $email, string $phone): string
{
    $cust = ['customer_id' => substr($kind . '_' . preg_replace('/[^A-Za-z0-9]/', '', $token), 0, 50), 'customer_phone' => $phone,
        'customer_name' => mb_substr(preg_replace('/[^\p{L} .]/u', '', $name) ?: 'Customer', 0, 60)];
    if ($email !== '') $cust['customer_email'] = $email;
    $r = cf_request('POST', '/orders', [
        'order_id' => $orderId, 'order_amount' => round($paise / 100, 2), 'order_currency' => 'INR', 'customer_details' => $cust,
        'order_meta' => ['return_url' => base_url() . '/cashfree.php?order_id={order_id}', 'notify_url' => base_url() . '/cashfree.php'],
        'order_note' => mb_substr($note, 0, 200), 'order_tags' => ['kind' => $kind]]);
    $sid = (string)($r['body']['payment_session_id'] ?? '');
    if ($r['code'] !== 200 || $sid === '') {
        error_log('Cashfree order failed: ' . $r['code'] . ' ' . json_encode($r['body']));
        throw new RuntimeException('Payment could not start. Please try again in a minute.');
    }
    return $sid;
}

/** Asks Cashfree whether an order is paid. Returns [paise, payment id] or null. */
function cf_verify(string $orderId): ?array
{
    $o = cf_request('GET', '/orders/' . rawurlencode($orderId));
    if ($o['code'] !== 200 || ($o['body']['order_status'] ?? '') !== 'PAID') return null;
    $pid = (string)($o['body']['cf_order_id'] ?? $orderId);
    $p = cf_request('GET', '/orders/' . rawurlencode($orderId) . '/payments');
    foreach (($p['code'] === 200 ? $p['body'] : []) as $pay) if (($pay['payment_status'] ?? '') === 'SUCCESS') { $pid = (string)$pay['cf_payment_id']; break; }
    return [(int)round((float)$o['body']['order_amount'] * 100), $pid];
}

/** Applies a confirmed Cashfree payment for an order id (WL… invite, WB… biodata). Returns the page to send the customer to. */
function cf_complete(string $orderId): string
{
    if (!preg_match('/^W([LB])(\d+)T/', $orderId, $m)) return '/';
    $kind = $m[1] === 'B' ? 'biodata' : 'invite';
    $st = db()->prepare('SELECT * FROM ' . ($kind === 'biodata' ? 'biodata' : 'invites') . ' WHERE id = ?');
    $st->execute([(int)$m[2]]);
    $item = $st->fetch();
    if (!$item || $item['rzp_order_id'] !== $orderId) return '/';
    $back = ($kind === 'biodata' ? '/b/' : '/p/') . $item['token'];
    $v = cf_verify($orderId);
    if (!$v) return $back . '?payfail=1';
    [$paise, $pid] = $v;
    if ($kind === 'biodata') { apply_bio_payment($item, $paise, $pid); return $back; }
    apply_payment($item, $paise, $pid);
    return $back . '?published=1';
}

/** Checks a webhook's signature: base64(HMAC-SHA256(timestamp . raw body, secret)). */
function cf_webhook_ok(string $raw, string $ts, string $sig): bool
{
    if ($raw === '' || $ts === '' || $sig === '' || setting('cf_secret') === '') return false;
    return hash_equals(base64_encode(hash_hmac('sha256', $ts . $raw, setting('cf_secret'), true)), $sig);
}
