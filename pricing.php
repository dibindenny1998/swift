<?php
require __DIR__ . '/lib/bootstrap.php';
$brand = setting('brand');
site_head("Pricing: Free Wedding Link, One Link Wedding ₹" . price('premium') . " | $brand", 'Make a wedding link free. One Link Wedding ₹' . price('premium') . ' one time, with every function, RSVP, photos and video. Or Built for you, where we set it up for you.',
    '/assets/og/site.jpg', '', ['path' => '/pricing', 'jsonld' => [ld_faq(site_faq()), ld_breadcrumb([['Home', '/'], ['Pricing', '/pricing']])]]);
?>
<body>
<?php site_header('pricing'); ?>
<main>
  <div class="wrap page-head">
    <h1>Simple, one-time prices</h1>
    <p>Build and preview your whole wedding website free. Publish on the free plan, or pay once for more designs and features. No subscription.</p>
  </div>
  <?php sec_pricing(); ?>
  <?php sec_faq(); ?>
</main>
<?php site_footer(); ?>
<?= sticky_cta() ?>
</body>
</html>
