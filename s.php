<?php
require __DIR__ . '/lib/bootstrap.php';
$k = (string)($_GET['k'] ?? '');
if (!preg_match('/^[a-z0-9-]{2,40}$/', $k) || !isset(all_slots()[$k])) { http_response_code(404); exit; }
$f = slot_file($k);
if (!is_file($f)) { http_response_code(404); exit; }
$etag = '"' . dechex(filesize($f)) . '-' . dechex(filemtime($f)) . '"';
header('Content-Type: image/jpeg');
header('Cache-Control: public, max-age=31536000, immutable');
header('ETag: ' . $etag);
header('X-Content-Type-Options: nosniff');
if (($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) { http_response_code(304); exit; }
header('Content-Length: ' . filesize($f));
readfile($f);
