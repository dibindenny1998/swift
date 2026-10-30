<?php
require __DIR__ . '/lib/bootstrap.php';

$id = (int)($_GET['i'] ?? 0);
$f = (string)($_GET['f'] ?? '');
if ($id < 1 || !preg_match('/^[a-f0-9]{16}\.(jpg|mp3|m4a)$/', $f)) { http_response_code(404); exit; }
$path = data_dir() . '/uploads/' . $id . '/' . $f;
if (!is_file($path)) { http_response_code(404); exit; }

$types = ['jpg' => 'image/jpeg', 'mp3' => 'audio/mpeg', 'm4a' => 'audio/mp4'];
$size = filesize($path);
$etag = '"' . dechex($size) . '-' . dechex(filemtime($path)) . '"';
header('Content-Type: ' . $types[pathinfo($f, PATHINFO_EXTENSION)]);
header('Cache-Control: public, max-age=31536000, immutable');
header('ETag: ' . $etag);
header('Accept-Ranges: bytes');
header('X-Content-Type-Options: nosniff');
if (($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) { http_response_code(304); exit; }

$start = 0; $end = $size - 1;
if (isset($_SERVER['HTTP_RANGE']) && preg_match('/bytes=(\d*)-(\d*)/', $_SERVER['HTTP_RANGE'], $m)) {
    if ($m[1] === '' && $m[2] !== '') { $start = max(0, $size - (int)$m[2]); }
    else { $start = (int)$m[1]; if ($m[2] !== '') $end = min((int)$m[2], $size - 1); }
    if ($start > $end || $start >= $size) { http_response_code(416); header("Content-Range: bytes */$size"); exit; }
    http_response_code(206);
    header("Content-Range: bytes $start-$end/$size");
}
header('Content-Length: ' . ($end - $start + 1));
if ($_SERVER['REQUEST_METHOD'] === 'HEAD') exit;
$fp = fopen($path, 'rb');
fseek($fp, $start);
$left = $end - $start + 1;
while ($left > 0 && !feof($fp)) {
    $chunk = fread($fp, (int)min(65536, $left));
    if ($chunk === false) break;
    echo $chunk;
    $left -= strlen($chunk);
}
fclose($fp);
