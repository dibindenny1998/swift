<?php
require __DIR__ . '/lib/bootstrap.php';
$brand = setting('brand');
$n = count(THEMES);
site_head("Wedding Invitation Website Designs: Hindu, Christian, Muslim, Sikh | $brand", "Wedding invitation website designs for Hindu, Christian, Muslim, Sikh and Kerala weddings. Two are free. Pick one, add your names and share on WhatsApp.",
    '/assets/og/site.jpg', '', ['path' => '/designs', 'jsonld' => [ld_breadcrumb([['Home', '/'], ['Designs', '/designs']])]]);
?>
<body>
<?php site_header('designs'); ?>
<main>
  <section class="dz-hero">
    <div class="wrap dz-hero-in">
      <div class="dz-hero-txt">
        <span class="tag">Hindu · Christian · Muslim · Sikh · Kerala</span>
        <h1>Wedding designs</h1>
        <p>Tap any design to see it live.</p>
      </div>
      <div class="dz-fan" aria-hidden="true">
        <?php foreach (['noor', 'lumiere', 'mayil', 'vogue', 'kasavu'] as $i => $d): ?><img src="<?= asset('assets/img/designs/' . $d . '.jpg') ?>" alt="" width="232" height="480" style="--i:<?= $i - 2 ?>"<?= $i === 2 ? '' : ' loading="lazy"' ?>><?php endforeach; ?>
      </div>
    </div>
  </section>
  <?php sec_designs(); ?>
  <section class="sec dz-custom">
    <div class="wrap" style="text-align:center">
      <h2 style="font-size:clamp(1.8rem,4vw,2.6rem)">Want something made only for you?</h2>
      <p style="color:var(--plum-2);margin:12px auto 22px;max-width:34em">We design a wedding website from scratch on your own web address.</p>
      <a class="btn alt" href="/custom">Ask about a custom website</a>
    </div>
  </section>
</main>
<?php site_footer(); ?>
<?= sticky_cta() ?>
<script src="<?= asset('assets/gallery.js') ?>"></script>
</body>
</html>
