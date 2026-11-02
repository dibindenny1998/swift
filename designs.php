<?php
require __DIR__ . '/lib/bootstrap.php';
$brand = setting('brand');
$n = count(THEMES);
site_head("Wedding invitation designs | $brand", "$n wedding website designs for Hindu, Christian, Muslim, Sikh and Kerala weddings. Two are free.");
?>
<body>
<?php site_header('designs'); ?>
<main>
  <div class="wrap page-head">
    <h1>Wedding website designs</h1>
    <p><?= $n ?> designs for every tradition. Pick one to start, type your names and see your own website straight away. You can switch designs any time before you share.</p>
  </div>
  <?php sec_designs(); ?>
  <section class="sec">
    <div class="wrap" style="text-align:center">
      <h2 style="font-size:clamp(1.8rem,4vw,2.6rem)">Want something made only for you?</h2>
      <p style="color:var(--plum-2);margin:12px auto 22px;max-width:34em">We design a wedding website from scratch on your own web address.</p>
      <a class="btn alt" href="/custom">Ask about a custom website</a>
    </div>
  </section>
</main>
<?php site_footer(); ?>
<script src="<?= asset('assets/gallery.js') ?>"></script>
</body>
</html>
