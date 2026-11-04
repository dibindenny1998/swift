<?php
// PayU sends the customer back here (success and failure) and also posts webhooks here
require __DIR__ . '/lib/bootstrap.php';
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { header('Location: /'); exit; }
$to = payu_complete($_POST);
header('Location: ' . $to, true, 303);
