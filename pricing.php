<?php
require __DIR__ . '/lib/bootstrap.php';
$brand = setting('brand');
site_head("Pricing | $brand", 'Start free. Standard ₹' . price('standard') . ', Premium ₹' . price('premium') . ', one time. Custom websites on request.');
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
</body>
</html>
