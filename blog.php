<?php
require __DIR__ . '/lib/bootstrap.php';
require __DIR__ . '/lib/blog.php';
$brand = setting('brand');
$slug = (string)($_GET['s'] ?? '');
$post = $slug !== '' ? (BLOG[$slug] ?? null) : null;
if ($slug !== '' && !$post) { http_response_code(404); }

if ($post) {
    $path = '/blog/' . $slug;
    $ld = ['@context' => 'https://schema.org', '@type' => 'BlogPosting', 'headline' => $post['title'], 'description' => $post['desc'],
        'datePublished' => $post['date'], 'dateModified' => $post['date'], 'mainEntityOfPage' => base_url() . $path, 'inLanguage' => 'en-IN',
        'author' => ['@type' => 'Organization', 'name' => $brand], 'publisher' => ['@type' => 'Organization', 'name' => $brand], 'image' => base_url() . '/assets/og/home.jpg'];
    site_head($post['title'] . ' | ' . $brand, $post['desc'], '/assets/og/home.jpg', '', ['path' => $path, 'jsonld' => [$ld, ld_breadcrumb([['Home', '/'], ['Blog', '/blog'], [$post['short'], $path]])]]);
} else {
    site_head('Wedding Invitation Ideas, Wording and Tips | ' . $brand . ' Blog', 'Wedding invitation wording for Hindu, Christian, Muslim and Kerala weddings, WhatsApp invitation tips and planning guides.', '/assets/og/home.jpg', '',
        ['path' => '/blog', 'jsonld' => [ld_breadcrumb([['Home', '/'], ['Blog', '/blog']])]]);
}
?>
<body>
<?php site_header('blog'); ?>
<main class="wrap blog">
<?php if ($post): ?>
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/blog">Blog</a></nav>
  <article class="post">
    <h1><?= e($post['title']) ?></h1>
    <p class="post-meta"><?= date('j F Y', strtotime($post['date'])) ?> · <?= (int)$post['read'] ?> min read</p>
    <div class="post-body"><?= $post['body'] ?></div>
    <aside class="post-cta">
      <h2>Make your wedding website in 5 minutes</h2>
      <p>Every function with maps, a countdown, RSVP and your photos, in one link to share on WhatsApp. There's a free plan.</p>
      <a class="btn js-make" href="<?= e($post['cta'][0]) ?>"><?= e($post['cta'][1]) ?></a>
    </aside>
  </article>
  <section class="post-more"><h2>More guides</h2><div class="post-list">
    <?php foreach (BLOG as $k => $p): if ($k === $slug) continue; ?>
      <a class="post-card" href="/blog/<?= $k ?>"><b><?= e($p['title']) ?></b><span><?= e($p['desc']) ?></span></a>
    <?php endforeach; ?>
  </div></section>
<?php elseif ($slug !== ''): ?>
  <div class="page-head"><h1>That article was not found</h1><p><a href="/blog">See all guides</a></p></div>
<?php else: ?>
  <div class="page-head"><h1>Wedding invitation guides</h1><p>Wording samples, WhatsApp tips and honest advice for Indian weddings.</p></div>
  <div class="post-list" style="margin:26px 0 70px">
    <?php foreach (BLOG as $k => $p): ?>
      <a class="post-card" href="/blog/<?= $k ?>"><b><?= e($p['title']) ?></b><span><?= e($p['desc']) ?></span><small><?= (int)$p['read'] ?> min read</small></a>
    <?php endforeach; ?>
  </div>
<?php endif; ?>
</main>
<?php site_footer(); ?>
<?= sticky_cta() ?>
</body>
</html>
