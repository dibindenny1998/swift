<?php
require __DIR__ . '/lib/bootstrap.php';
$brand = setting('brand');
$wa = normalize_phone(setting('support_phone'));
$price = (int)setting('price_built'); $fo = founding(); $isF = !empty($_GET['founding']) && $fo['on'];
$tick = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
$wants = ['Founding couple spot (₹' . number_format($fo['price']) . ')', 'Photos and story', 'Video', 'RSVP and headcount', 'Gift list', 'A specific design'];
site_head('Built for You: We Make Your Wedding Website | ' . $brand, 'Send us your details on WhatsApp and we set up your whole wedding website for a fixed ₹' . number_format($price) . ': every function, maps, RSVP, photos and video.', '/assets/og/home.jpg', '', ['path' => '/custom', 'jsonld' => [ld_breadcrumb([['Home', '/'], ['Built for you', '/custom']])]]);
?>
<body>
<?php site_header('custom'); ?>
<main class="wrap" style="padding-bottom:80px">
  <div class="page-head">
    <span class="tag" style="margin:0 0 12px">Built for you · ₹<?= number_format($price) ?> fixed</span>
    <h1>Send us your details. We build your wedding link.</h1>
    <p>Tell us the names, the functions and send a few photos. We set up the whole site, you check it, and we change anything you like before you share it.</p>
  </div>
  <?php if ($fo['on']): ?><div class="founding" style="margin:18px 0 0"><p><b>Founding couples:</b> the first <?= $fo['total'] ?> couples pay <b>₹<?= number_format($fo['price']) ?></b> instead of ₹<?= number_format($price) ?>, if they let us show their site as an example (names hidden on request).</p><p class="founding-meta"><b><?= $fo['left'] ?> of <?= $fo['total'] ?> spots left</b> · Ends <?= date('j M Y', $fo['end']) ?></p></div><?php endif; ?>
  <div class="custom-grid">
    <div class="plan custom">
      <h3>What you get for ₹<?= number_format($price) ?></h3>
      <ul>
        <li><?= $tick ?>Everything in One Link Wedding: all functions, RSVP, 15 photos, video, gift list</li>
        <li><?= $tick ?>We fill it in from your WhatsApp message</li>
        <li><?= $tick ?>We pick the design with you and set up every venue's map</li>
        <li><?= $tick ?>You check it and ask for changes before sharing</li>
        <li><?= $tick ?>Changes by WhatsApp until the wedding</li>
        <li><?= $tick ?>Live for 1 year</li>
      </ul>
      <?php if ($wa): ?><a class="btn" href="https://wa.me/91<?= e($wa) ?>?text=<?= rawurlencode("Hi! I'd like Built for you from $brand.") ?>" target="_blank" rel="noopener">Chat on WhatsApp</a><?php endif; ?>
    </div>

    <form class="card" id="enq" novalidate>
      <h2 style="font-size:1.7rem;margin-bottom:16px">Send us your details</h2>
      <div class="row2">
        <div class="field"><label for="q-name">Your name</label><input id="q-name" name="name" maxlength="80" autocomplete="name" required></div>
        <div class="field"><label for="q-phone">WhatsApp number</label><input id="q-phone" name="phone" inputmode="tel" maxlength="15" autocomplete="tel" placeholder="98765 43210" required></div>
      </div>
      <div class="row2">
        <div class="field"><label for="q-email">Email (optional)</label><input id="q-email" name="email" type="email" maxlength="120" autocomplete="email"></div>
        <div class="field"><label for="q-date">Wedding date (optional)</label><input id="q-date" name="date" type="date"></div>
      </div>
      <div class="field"><span>What would you like?</span>
        <div class="checks"><?php foreach ($wants as $w): if (!$fo['on'] && str_starts_with($w, 'Founding')) continue; ?><label><input type="checkbox" name="wants" value="<?= e($w) ?>"<?= $isF && str_starts_with($w, 'Founding') ? ' checked' : '' ?>><?= e($w) ?></label><?php endforeach; ?></div>
      </div>
      <div class="field"><label for="q-msg">Anything else? (optional)</label><textarea id="q-msg" name="message" maxlength="1000" rows="4" placeholder="Names, functions, dates and venues. You can also send everything on WhatsApp."></textarea></div>
      <p class="err" role="alert"></p>
      <button class="btn" type="submit">Send my details</button>
      <p class="note" style="margin-top:16px">We reply on WhatsApp within one working day.</p>
    </form>
  </div>
</main>
<?php site_footer(); ?>
<?= sticky_cta('#enq', 'Send us your details', 'We reply on WhatsApp within a day') ?>
<script>
(function () {
  var f = document.getElementById('enq'), err = f.querySelector('.err');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var body = { name: f.name.value, phone: f.phone.value, email: f.email.value, date: f.date.value, message: f.message.value,
      wants: Array.prototype.map.call(f.querySelectorAll('input[name=wants]:checked'), function (x) { return x.value; }) };
    if (!body.name.trim()) { err.textContent = 'Add your name.'; f.name.focus(); return; }
    if (body.phone.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '').length !== 10) { err.textContent = 'Enter a 10-digit mobile number.'; f.phone.focus(); return; }
    var btn = f.querySelector('button'); btn.disabled = true; err.textContent = '';
    fetch('/api.php?a=enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok) { btn.disabled = false; err.textContent = j.error || 'Could not send. Try again.'; return; }
        try { fbq('track', 'Contact', { content_name: 'Built for you' }); } catch (x) {}
        f.innerHTML = '<div class="ok-box">Thank you! We have your request and will message you on WhatsApp soon.</div>';
      }).catch(function () { btn.disabled = false; err.textContent = 'No connection. Try again.'; });
  });
})();
</script>
</body>
</html>
