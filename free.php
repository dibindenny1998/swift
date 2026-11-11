<?php
// Landing page for ads: one job, get people to make a free wedding link.
require __DIR__ . '/lib/bootstrap.php';
$brand = setting('brand');
$tick = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
site_head('Make Your Free Wedding Link in 5 Minutes | ' . $brand, 'One link for every guest: maps to every venue, countdown and your details, shared on WhatsApp. Free to make.', '/assets/og/home.jpg', '<meta name="robots" content="noindex">', ['path' => '/free']);
?>
<body class="lp">
<?php site_header(); ?>
<main>
  <section class="lp-hero">
    <div class="wrap lp-grid">
      <div>
        <span class="tag" style="margin:0 0 14px">Free to start · No card needed</span>
        <h1>Make your wedding website in 5 minutes.</h1>
        <p class="lead">One link. Every guest knows where to go, and you know who's coming. Send it on WhatsApp.</p>
        <ul class="lp-ticks">
          <li><?= $tick ?>Maps to every venue, one tap</li>
          <li><?= $tick ?>Countdown and your family details</li>
          <li><?= $tick ?>Change it any time, everyone sees the update</li>
          <li><?= $tick ?>Opens from WhatsApp, no app, no login</li>
        </ul>
        <a class="btn lp-cta js-make" href="/create?t=classic">Create our wedding website</a>
        <p class="lp-small">Your card for the elders. Your link for everyone. <a href="/sample" target="_blank" rel="noopener">See a live wedding site →</a></p>
      </div>
      <div class="lp-phone"><img src="<?= asset('assets/img/designs/kasavu.jpg') ?>" alt="A wedding link on a phone" width="232" height="480"></div>
    </div>
  </section>
  <section class="sec band">
    <div class="wrap">
      <div class="sec-head"><h2>How it works</h2></div>
      <ol class="steps">
        <li><h3>Pick a design</h3><p>Five free designs, more when you upgrade.</p></li>
        <li><h3>Add your details</h3><p>Names, date and venue. The preview updates as you type.</p></li>
        <li><h3>Share on WhatsApp</h3><p>Publish free and send one link to everyone.</p></li>
      </ol>
      <p style="text-align:center;margin-top:28px"><a class="btn js-make" href="/create?t=classic">Start free</a></p>
    </div>
  </section>
  <?php sec_faq(); ?>
</main>
<?php site_footer(); ?>
<?= sticky_cta('/create?t=classic', 'Create our wedding website', 'Free to start · No card needed') ?>
<script>(function(){try{var q=new URLSearchParams(location.search);if(q.get('utm_source')||q.get('utm_campaign')||q.get('fbclid'))localStorage.setItem('wl_attr',JSON.stringify({utm_source:q.get('utm_source')||'',utm_campaign:q.get('utm_campaign')||'',fbclid:q.get('fbclid')||'',t:Date.now()}));}catch(e){}})();</script>
</body>
</html>
