<?php
/* PayU India hosted checkout. The customer is sent to PayU's payment page and comes back to /payu.php with a signed result. */

function payu_mode(): string { return setting('payu_mode') === 'live' ? 'live' : 'test'; }
function payu_url(): string { return payu_mode() === 'live' ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment'; }
function payu_info_url(): string { return payu_mode() === 'live' ? 'https://info.payu.in/merchant/postservice.php?form=2' : 'https://test.payu.in/merchant/postservice.php?form=2'; }
function payu_amount(int $paise): string { return number_format($paise / 100, 2, '.', ''); }

/** Form fields (with the request hash) that send the customer to PayU. $kind: invite | biodata */
function payu_fields(string $kind, string $token, string $txnid, int $paise, string $product, string $name, string $email, string $phone): array
{
    $key = setting('payu_key'); $salt = setting('payu_salt');
    $f = ['key' => $key, 'txnid' => $txnid, 'amount' => payu_amount($paise), 'productinfo' => mb_substr(preg_replace('/[|]/', ' ', $product), 0, 100),
        'firstname' => mb_substr(preg_replace('/[^\p{L} .]/u', '', $name) ?: 'Customer', 0, 60), 'email' => $email ?: ('noreply+' . substr($token, 0, 8) . '@' . (parse_url(base_url(), PHP_URL_HOST) ?: 'thewedlink.in')),
        'phone' => $phone, 'udf1' => $kind, 'udf2' => $token, 'udf3' => '', 'udf4' => '', 'udf5' => '',
        'surl' => base_url() . '/payu.php', 'furl' => base_url() . '/payu.php'];
    $f['hash'] = strtolower(hash('sha512', implode('|', [$key, $f['txnid'], $f['amount'], $f['productinfo'], $f['firstname'], $f['email'], $f['udf1'], $f['udf2'], $f['udf3'], $f['udf4'], $f['udf5'], '', '', '', '', '', $salt])));
    return $f;
}

/** Checks the hash PayU sends back with the result. */
function payu_response_ok(array $p): bool
{
    $salt = setting('payu_salt');
    $parts = [$salt, $p['status'] ?? '', '', '', '', '', '', $p['udf5'] ?? '', $p['udf4'] ?? '', $p['udf3'] ?? '', $p['udf2'] ?? '', $p['udf1'] ?? '',
        $p['email'] ?? '', $p['firstname'] ?? '', $p['productinfo'] ?? '', $p['amount'] ?? '', $p['txnid'] ?? '', $p['key'] ?? ''];
    if (!empty($p['additionalCharges'])) array_unshift($parts, $p['additionalCharges']);
    return hash_equals(strtolower(hash('sha512', implode('|', $parts))), strtolower((string)($p['hash'] ?? '')));
}

/** Asks PayU directly whether a transaction succeeded. Returns [paise, mihpayid] or null. */
function payu_verify(string $txnid): ?array
{
    $key = setting('payu_key'); $salt = setting('payu_salt');
    if ($key === '' || !function_exists('curl_init')) return null;
    $ch = curl_init(payu_info_url());
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 20, CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query(['key' => $key, 'command' => 'verify_payment', 'var1' => $txnid, 'hash' => strtolower(hash('sha512', "$key|verify_payment|$txnid|$salt"))])]);
    $res = curl_exec($ch); curl_close($ch);
    $j = json_decode((string)$res, true);
    $t = $j['transaction_details'][$txnid] ?? null;
    if (!is_array($t) || ($t['status'] ?? '') !== 'success') return null;
    return [(int)round((float)$t['amt'] * 100), (string)($t['mihpayid'] ?? '')];
}

/** Applies a confirmed PayU payment to its invite or biodata. Returns the page to send the customer to. */
function payu_complete(array $p): string
{
    $kind = ($p['udf1'] ?? '') === 'biodata' ? 'biodata' : 'invite';
    $token = (string)($p['udf2'] ?? ''); $txnid = (string)($p['txnid'] ?? '');
    $item = $kind === 'biodata' ? find_bio('token', $token) : find_invite('token', $token);
    if (!$item || $txnid === '' || $item['rzp_order_id'] !== $txnid) return '/';
    $back = $kind === 'biodata' ? '/b/' . $item['token'] : '/p/' . $item['token'];
    if (($p['status'] ?? '') !== 'success' || !payu_response_ok($p)) return $back . '?payfail=1';
    $v = payu_verify($txnid);
    if (!$v) return $back . '?payfail=1';
    [$paise, $mih] = $v;
    if ($kind === 'biodata') { apply_bio_payment($item, $paise, $mih); return $back; }
    apply_payment($item, $paise, $mih);
    return $back . '?published=1';
}
