<?php
// Cashfree sends the customer back here (GET ?order_id=…) and posts payment webhooks here (POST).
require __DIR__ . '/lib/bootstrap.php';
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = (string)file_get_contents('php://input');
    if (!cf_webhook_ok($raw, (string)($_SERVER['HTTP_X_WEBHOOK_TIMESTAMP'] ?? ''), (string)($_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? ''))) { http_response_code(401); exit('bad signature'); }
    $j = json_decode($raw, true) ?: [];
    $oid = (string)($j['data']['order']['order_id'] ?? '');
    if ($oid !== '') cf_complete($oid); // cf_complete re-checks with Cashfree's API
    exit('ok');
}
$oid = (string)($_GET['order_id'] ?? '');
header('Location: ' . ($oid !== '' ? cf_complete($oid) : '/'), true, 303);
