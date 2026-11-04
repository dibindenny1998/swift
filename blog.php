<?php
require __DIR__ . '/lib/bootstrap.php';
require __DIR__ . '/lib/blog.php';
$brand = setting('brand');
$slug = (string)($_GET['s'] ?? '');
$posts = blog_posts();
$post = $slug !== '' ? ($posts[$slug] ?? null) : null;
if ($slug !== '' && !$post) { http_response_code(404); }

if ($post) {
    $path = '/blog/' . $slug;
    $ld = ['@context' => 'https://schema.org', '@type' => 'BlogPosting', 'headline' => $post['title'], 'description' => $post['desc'],
        'datePublished' => $post['date'], 'dateModified' => $post['date'], 'mainEntityOfPage' => base_url() . $path, 'inLanguage' => 'en-IN',
        'author' => ['@type' => 'Organization', 'name' => $brand], 'publisher' => ['@type' => 'Organization', 'name' => $brand], 'image' => base_url() . (blog_cover($slug) ?: '/assets/og/home.jpg')];
    site_head($post['title'] . ' | ' . $brand, $post['desc'], blog_cover($slug) ?: '/assets/og/home.jpg', '', ['path' => $path, 'jsonld' => [$ld, ld_breadcrumb([['Home', '/'], ['Blog', '/blog'], [$post['short'], $path]])]]);
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
    <p class="post-meta"><span class="post-cat"><?= e($post['cat']) ?></span> <?= date('j F Y', strtotime($post['date'])) ?> · <?= (int)$post['read'] ?> min read</p>
    <?php if ($c = blog_cover($slug)): ?><img class="post-cover" src="<?= $c ?>" alt="<?= e($post['title']) ?>" width="1200" height="675"><?php endif; ?>
    <div class="post-body"><?= $post['body'] ?></div>
    <aside class="post-cta">
      <h2>Make your wedding website in 5 minutes</h2>
      <p>Every function with maps, a countdown, RSVP and your photos, in one link to share on WhatsApp. There's a free plan.</p>
      <a class="btn js-make" href="<?= e($post['cta'][0]) ?>"><?= e($post['cta'][1]) ?></a>
    </aside>
  </article>
  <section class="post-more"><h2>More guides</h2><div class="post-list">
    <?php $n = 0; foreach ($posts as $k => $p): if ($k === $slug || ++$n > 4) continue; ?>
      <a class="post-card" href="/blog/<?= $k ?>"><b><?= e($p['title']) ?></b><span><?= e($p['desc']) ?></span></a>
    <?php endforeach; ?>
  </div></section>
<?php elseif ($slug !== ''): ?>
  <div class="page-head"><h1>That article was not found</h1><p><a href="/blog">See all guides</a></p></div>
<?php else: ?>
  <div class="page-head"><h1>Wedding invitation guides</h1><p>Wording samples, WhatsApp tips and honest advice for Indian weddings.</p></div>
  <div class="post-list" style="margin:26px 0 70px">
    <?php foreach ($posts as $k => $p): $c = blog_cover($k); ?>
      <a class="post-card" href="/blog/<?= $k ?>"><?php if ($c): ?><img src="<?= $c ?>" alt="" width="600" height="338" loading="lazy"><?php endif; ?><em class="post-cat"><?= e($p['cat']) ?></em><b><?= e($p['title']) ?></b><span><?= e($p['desc']) ?></span><small><?= (int)$p['read'] ?> min read</small></a>
    <?php endforeach; ?>
  </div>
<?php endif; ?>
</main>
<?php site_footer(); ?>
<?= sticky_cta() ?>
</body>
</html>
