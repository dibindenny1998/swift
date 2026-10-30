<?php
require __DIR__ . '/lib/bootstrap.php';
header('X-Robots-Tag: noindex');

$slug = (string)($_GET['s'] ?? '');
$inv = preg_match('/^[a-z0-9-]{3,60}$/', $slug) ? find_invite('slug', $slug) : null;
$expired = $inv && $inv['status'] === 'paid' && strtotime((string)$inv['paid_at']) < time() - 366 * 86400;

if (!$inv || $inv['status'] !== 'paid' || $expired) {
    http_response_code($inv ? 200 : 404);
    site_head($expired ? 'This invite has ended' : 'Invite not found');
    echo '<body><main class="wrap legal" style="text-align:center;padding-top:90px"><h1>'
        . ($expired ? 'This invite has ended.' : ($inv ? 'This invite is not published yet.' : 'We could not find this invite.'))
        . '</h1><p style="margin:12px auto 28px;max-width:34em">'
        . ($inv ? 'Ask the couple for the latest link.' : 'Check the link you were sent. It may have a typo.')
        . '</p><a class="btn" href="/">Make your own invite</a></main></body></html>';
    exit;
}

if (!is_bot()) {
    try { db()->prepare('UPDATE invites SET views = views + 1 WHERE id = ?')->execute([$inv['id']]); } catch (Throwable $t) {}
}

$d = public_payload($inv);
$lim = PLAN_LIMITS[$inv['plan']] ?? PLAN_LIMITS['premium'];
$d['photos'] = array_slice($d['photos'], 0, $lim['photos']);
if (!$lim['music']) $d['music'] = '';
$d['brand'] = setting('brand');

$title = invite_title($d) . ' are getting married';
$main = null;
foreach (sorted_events($d) as $ev) { if (preg_match('/wedding|marriage|muhurt|kalyan|vivah|nikah|thali|minnu|matrimony|shaadi/i', $ev['name'])) { $main = $ev; break; } }
$main = $main ?? (sorted_events($d)[0] ?? null);
$desc = $main ? date('l, j F Y', strtotime($main['date'])) . ($main['venue'] ? ', ' . $main['venue'] : '') . '. Tap to open the invitation.' : 'Tap to open the invitation.';
$og = $d['photos'] ? base_url() . $d['photos'][0] : base_url() . '/assets/og/' . $inv['theme'] . '.jpg';
$colors = ['kasavu' => '#FBF7EC', 'sindoor' => '#6E0B1D', 'marigold' => '#FFF1C9', 'nilavu' => '#0B1533', 'mullappoo' => '#F2F8F3', 'thamara' => '#FADDE3'];
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title><?= e($title) ?></title>
<meta name="description" content="<?= e($desc) ?>">
<meta name="robots" content="noindex">
<meta property="og:type" content="website">
<meta property="og:title" content="<?= e($title) ?>">
<meta property="og:description" content="<?= e($desc) ?>">
<meta property="og:image" content="<?= e($og) ?>">
<meta property="og:url" content="<?= e(base_url() . '/i/' . $inv['slug']) ?>">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="<?= $colors[$inv['theme']] ?? '#ffffff' ?>">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="<?= asset('assets/invite.css') ?>">
<style>html,body{margin:0}</style>
</head>
<body>
<div id="invite"></div>
<noscript><p style="padding:40px;text-align:center"><?= e(invite_title($d)) ?>. <?= e($desc) ?></p></noscript>
<script src="<?= asset('assets/invite.js') ?>"></script>
<script>WL.render(document.getElementById('invite'), <?= json_for_script($d) ?>, { mode: 'live', cover: true });</script>
</body>
</html>
