<?php
require __DIR__ . '/lib/bootstrap.php';
$brand = setting('brand');
$wa = normalize_phone(setting('support_phone'));
$from = trim(setting('custom_from'));
$tick = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
$wants = ['Custom design', 'Own domain name', 'Full photo gallery', 'Our story & timeline', 'Video', 'Gift list', 'RSVP', 'Live stream link', 'Printed QR card'];
site_head('Custom Wedding Website with Your Own Domain | ' . $brand, 'A wedding website designed only for you, on your own domain, with a full gallery, your story, RSVP and gift list.', '/assets/og/site.jpg', '', ['path' => '/custom', 'jsonld' => [ld_breadcrumb([['Home', '/'], ['Custom website', '/custom']])]]);
?>
<body>
<?php site_header('custom'); ?>
<main class="wrap" style="padding-bottom:80px">
  <div class="page-head">
    <span class="tag" style="margin:0 0 12px">Custom plan</span>
    <h1>A wedding website made only for you.</h1>
    <p>Tell us what you have in mind. We design it, set it up on your own web address, and you approve every detail before it goes live.<?= $from ? ' Custom websites start from ' . e($from) . '.' : '' ?></p>
  </div>

  <?php if (slot_url('custom')): ?><div style="margin-top:22px;border-radius:var(--r-lg);overflow:hidden;aspect-ratio:20/9"><?= slot_img('custom', '', 'Custom wedding website', false) ?></div><?php endif; ?>
  <div class="plans" style="grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);align-items:start;margin-top:24px">
    <div class="plan custom">
      <h3>What you get</h3>
      <ul>
        <li><?= $tick ?>A design made from scratch for the two of you</li>
        <li><?= $tick ?>Your own domain, like arjunwedsmeera.com, for a year</li>
        <li><?= $tick ?>A full photo gallery with no limit</li>
        <li><?= $tick ?>Our story, a timeline of your journey and a video</li>
        <li><?= $tick ?>Gift list, RSVPs and guest headcount</li>
        <li><?= $tick ?>Every function with maps and calendar</li>
        <li><?= $tick ?>Changes by WhatsApp until the wedding</li>
      </ul>
      <?php if ($wa): ?><a class="btn" href="https://wa.me/91<?= e($wa) ?>?text=<?= rawurlencode("Hi! I'd like a custom wedding website from $brand.") ?>" target="_blank" rel="noopener">Chat on WhatsApp</a><?php endif; ?>
    </div>

    <form class="card" id="enq" novalidate>
      <h2 style="font-size:1.7rem;margin-bottom:16px">Ask for a quote</h2>
      <div class="row2">
        <div class="field"><label for="q-name">Your name</label><input id="q-name" name="name" maxlength="80" autocomplete="name" required></div>
        <div class="field"><label for="q-phone">WhatsApp number</label><input id="q-phone" name="phone" inputmode="tel" maxlength="15" autocomplete="tel" placeholder="98765 43210" required></div>
      </div>
      <div class="row2">
        <div class="field"><label for="q-email">Email (optional)</label><input id="q-email" name="email" type="email" maxlength="120" autocomplete="email"></div>
        <div class="field"><label for="q-date">Wedding date (optional)</label><input id="q-date" name="date" type="date"></div>
      </div>
      <div class="field"><span>What would you like?</span>
        <div class="checks"><?php foreach ($wants as $w): ?><label><input type="checkbox" name="wants" value="<?= e($w) ?>"><?= e($w) ?></label><?php endforeach; ?></div>
      </div>
      <div class="field"><label for="q-msg">Anything else? (optional)</label><textarea id="q-msg" name="message" maxlength="1000" rows="4" placeholder="Colours you love, a design you saw, the domain name you want…"></textarea></div>
      <p class="err" role="alert"></p>
      <button class="btn" type="submit">Send my request</button>
      <p class="note" style="margin-top:16px">We reply on WhatsApp within one working day.</p>
    </form>
  </div>
</main>
<?php site_footer(); ?>
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
        try { fbq('track', 'Contact', { content_name: 'Custom website' }); } catch (x) {}
        f.innerHTML = '<div class="ok-box">Thank you! We have your request and will message you on WhatsApp soon.</div>';
      }).catch(function () { btn.disabled = false; err.textContent = 'No connection. Try again.'; });
  });
})();
</script>
</body>
</html>
