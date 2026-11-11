<?php
// A sample wedding site, clearly labelled as a sample, so visitors can see every feature before making their own.
require __DIR__ . '/lib/bootstrap.php';
header('X-Robots-Tag: noindex');
$brand = setting('brand');
$photos = array_values(array_filter([slot_url('sample-kasavu'), slot_url('demo-2'), slot_url('demo-3'), slot_url('demo-1')]));
$d = [
    'theme' => 'kasavu', 'plan' => 'premium', 'brand' => $brand, 'domain' => setting('site_domain'), 'slug' => 'sample',
    'p1' => 'Arjun', 'p2' => 'Meera', 'p1_family' => 'Son of Rajan & Latha Menon, Thrissur', 'p2_family' => 'Daughter of Suresh & Anitha Nair, Kochi',
    'about_p1' => 'Loves cricket, filter coffee and long drives.', 'about_p2' => 'Paints on weekends and sings in the car.',
    'story' => "We met at a friend's wedding and argued about the music all evening. Two years and many coffees later, we are getting married.",
    'notes' => 'Dress code: traditional. Parking is available at every venue.',
    'message' => 'With the blessings of our elders, we warmly invite you and your family to share our joy.',
    'events' => [
        ['name' => 'Engagement', 'date' => date('Y-m-d', strtotime('+70 days')), 'time' => '17:00', 'venue' => 'Lulu Convention Centre', 'address' => 'Puzhakkal, Thrissur'],
        ['name' => 'Muhurtham', 'date' => date('Y-m-d', strtotime('+72 days')), 'time' => '10:30', 'venue' => 'Sree Krishna Temple', 'address' => 'Guruvayur, Kerala'],
        ['name' => 'Reception', 'date' => date('Y-m-d', strtotime('+72 days')), 'time' => '18:30', 'venue' => 'Grand Hyatt', 'address' => 'Bolgatty, Kochi'],
    ],
    'photos' => $photos, 'video' => setting('demo_video'), 'video_kind' => 'prewedding',
    'gifts' => [['id' => 'g1aaaaaa', 'name' => 'Dinner set'], ['id' => 'g2bbbbbb', 'name' => 'Air fryer'], ['id' => 'g3cccccc', 'name' => 'Silver pooja set']],
    'contact_name' => 'Rajan Menon', 'contact_phone' => '',
];
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Sample wedding site | <?= e($brand) ?></title>
<meta name="robots" content="noindex">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="<?= asset('assets/invite.css') ?>">
<style>html,body{margin:0}
.sbar{position:fixed;left:0;right:0;bottom:0;z-index:60;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;padding:10px 14px calc(10px + env(safe-area-inset-bottom));background:rgba(42,26,30,.94);color:#fff;font:500 14px/1.3 system-ui,sans-serif;text-align:center}
.sbar b{font-weight:700;color:#F6D6DE}.sbar a{background:#C2456E;color:#fff;text-decoration:none;padding:9px 16px;border-radius:99px;font-weight:700;white-space:nowrap}
.wl-body{padding-bottom:70px}</style>
</head>
<body>
<div id="invite"></div>
<div class="sbar"><span><b>Sample site.</b> The couple, photos and events are examples.</span><a href="/create">Create ours →</a></div>
<script>window.WL_BG = <?= json_for_script(theme_backdrops()) ?>;</script>
<script src="<?= asset('assets/invite.js') ?>"></script>
<script>WL.render(document.getElementById('invite'), <?= json_for_script($d) ?>, { mode: 'demo', cover: true });</script>
</body>
</html>
