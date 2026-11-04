<?php
require __DIR__ . '/lib/bootstrap.php';
header('Content-Type: application/xml; charset=utf-8');
$b = base_url();
// public pages only; couples' invites and biodatas are private
$pages = [['/', '1.0'], ['/biodata', '0.9'], ['/designs', '0.8'], ['/pricing', '0.8'], ['/custom', '0.6']];
foreach (array_keys(BIO_SEO) as $k) if ($k !== '') $pages[] = ['/biodata/' . $k, '0.8'];
require __DIR__ . '/lib/blog.php';
$pages[] = ['/blog', '0.7'];
foreach (array_keys(BLOG) as $k) $pages[] = ['/blog/' . $k, '0.7'];
foreach (['contact', 'terms', 'privacy', 'refund'] as $l) $pages[] = ['/legal.php?p=' . $l, '0.3'];
$mod = date('Y-m-d', max(filemtime(__FILE__), filemtime(__DIR__ . '/index.php'), filemtime(__DIR__ . '/lib/biodata.php')));
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($pages as [$p, $pr]) echo '  <url><loc>' . htmlspecialchars($b . $p, ENT_XML1) . '</loc><lastmod>' . $mod . '</lastmod><priority>' . $pr . "</priority></url>\n";
echo '</urlset>';
