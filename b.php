<?php
require __DIR__ . '/lib/bootstrap.php';
header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');

$token = (string)($_GET['t'] ?? '');
$bio = preg_match('/^[a-f0-9]{32}$/', $token) ? find_bio('token', $token) : null;
if (!$bio) { header('Location: /biodata'); exit; }

$brand = setting('brand');
$paid = (int)$bio['paid'] === 1;
$pb = price('biodata');
$d = json_decode($bio['data'], true) ?: [];
$cfg = bio_js_config() + [
    't' => $bio['token'], 'paid' => $paid, 'data' => $d, 'template' => $bio['template'],
    'photo' => $bio['photo'] ? '/m/b' . $bio['id'] . '/' . $bio['photo'] : '',
    'brand' => $brand, 'host' => preg_replace('#^https?://#', '', base_url()), 'live' => payments_live(), 'price' => $pb,
    'purchase' => $paid && !$bio['is_demo'] && $bio['paid_at'] && strtotime($bio['paid_at']) > time() - 600 ? ['value' => $bio['amount'] / 100, 'id' => 'bio_' . $bio['id']] : null,
];
$bioHead = '<link rel="stylesheet" crossorigin="anonymous" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Amiri:wght@400;700&family=Noto+Serif+Malayalam:wght@400;600&family=Noto+Serif+Devanagari:wght@400;600&family=Noto+Serif+Tamil:wght@400;600&family=Noto+Serif+Kannada:wght@400;600&family=Noto+Serif+Telugu:wght@400;600&family=Noto+Serif+Gurmukhi:wght@400;600&display=swap">'
    . '<link rel="stylesheet" href="' . asset('assets/biodata.css') . '">';
site_head('Your biodata | ' . $brand, '', '/assets/og/site.jpg', $bioHead);
?>
<body>
<header class="top">
  <div class="wrap top-in">
    <a class="logo" href="/"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="12" cy="16" r="8.5" fill="none" stroke="#C9727F" stroke-width="2.6"/><circle cx="20" cy="16" r="8.5" fill="none" stroke="#C9A26B" stroke-width="2.6"/></svg><?= e($brand) ?></a>
    <a class="btn small alt" href="/biodata?t=<?= e($bio['token']) ?>">Edit details</a>
  </div>
</header>

<main class="wrap">
  <div class="bio-layout" style="padding-top:28px">
    <div>
      <section class="card">
        <h1 style="font-size:clamp(1.9rem,4vw,2.6rem)"><?= $paid ? 'Your biodata is ready.' : 'Your biodata is ready to download.' ?></h1>
        <p class="lead" style="margin:10px 0 20px;color:var(--plum-2)"><?= $paid ? 'The strip is removed. Download it as often as you like, and edit it any time.' : 'Download it free with a small red “Created by ' . e($brand) . '” strip at the bottom, or remove it for a clean copy.' ?></p>
        <div class="bio-actions">
          <button type="button" class="btn<?= $paid ? '' : ' alt' ?>" data-dl="pdf">Download PDF</button>
          <button type="button" class="btn alt" data-dl="jpg">Download image (JPG)</button>
          <button type="button" class="btn alt" id="share" hidden>Share on WhatsApp</button>
        </div>
        <p class="err" id="dl-err" role="alert" style="margin-top:10px"></p>
      </section>

      <?php if (!$paid): ?>
      <section class="card" style="margin-top:16px" id="clean">
        <div class="price-line"><h2 style="font-size:1.5rem">Remove the strip</h2><b>₹<?= $pb ?></b></div>
        <p class="lead" style="margin:8px 0 18px;color:var(--plum-2)">One-time payment. Clean PDF and image, edit and download again any time.</p>
        <button type="button" class="btn" id="pay" style="width:100%">Pay ₹<?= $pb ?> for a clean copy</button>
        <p class="err" id="pay-err" role="alert" style="margin-top:10px"></p>
        <p class="safe" style="margin-top:6px">UPI, cards and net banking via Razorpay</p>
        <?php if (!payments_live()): ?><p class="demo"><b>Test mode.</b> Payments are not connected yet, so the button removes the strip without charging.</p><?php endif; ?>
      </section>
      <?php elseif ($bio['is_demo']): ?>
        <p class="demo">Unlocked in test mode. No money was charged.</p>
      <?php endif; ?>

      <section class="card" style="margin-top:16px">
        <h2 style="font-size:1.4rem">Getting married soon?</h2>
        <p class="lead" style="margin:8px 0 16px;color:var(--plum-2)">Make a wedding website to share on WhatsApp, with your events, maps, RSVP and a gift list. There's a free plan.</p>
        <a class="btn alt" href="/">See wedding websites</a>
      </section>
      <p class="note" style="margin-top:16px">Bookmark this page. It is your private link to download and edit your biodata.</p>
    </div>
    <aside class="bio-preview" aria-label="Your biodata"><div class="bd-frame" id="pv"></div></aside>
  </div>
</main>
<?php if (!empty($_GET['saved'])): ?><div class="toast" role="status" id="toast">Changes saved</div><?php endif; ?>
<?php site_footer(); ?>
<script>window.WLB_CFG = <?= json_for_script($cfg) ?>;</script>
<script src="<?= asset('assets/biodata.js') ?>"></script>
<script>
(function () {
  'use strict';
  var C = window.WLB_CFG, pv = document.getElementById('pv');
  var opts = { watermark: !C.paid, brand: C.brand, host: C.host };
  function paint() { WLB.render(pv, C.data, C.template, C.photo, opts); WLB.scaleTo(pv); }
  paint();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint);
  addEventListener('resize', function () { WLB.scaleTo(pv); });
  var toast = document.getElementById('toast'); if (toast) setTimeout(function () { toast.remove(); }, 2600);
  function post(url, body) { return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) { return r.json().catch(function () { return { ok: false, error: 'Unexpected reply (' + r.status + ').' }; }); }); }
  if (C.purchase) { try { fbq('track', 'Purchase', { value: C.purchase.value, currency: 'INR', content_name: 'Biodata' }, { eventID: C.purchase.id }); } catch (e) {} }

  var err = document.getElementById('dl-err');
  document.querySelectorAll('[data-dl]').forEach(function (b) {
    b.addEventListener('click', function () {
      var label = b.textContent; b.disabled = true; b.textContent = 'Preparing…'; err.textContent = '';
      WLB.download(b.dataset.dl, C.data, C.template, C.photo, opts).then(function (file) {
        WLB.saveBlob(file.blob, file.name); post('/api.php?a=bio_download', { t: C.t });
      }).catch(function () { err.textContent = 'Could not create the file. Check your connection and try again.'; })
        .then(function () { b.disabled = false; b.textContent = label; });
    });
  });

  // share the image straight to WhatsApp where the phone supports it
  var share = document.getElementById('share');
  if (navigator.canShare && navigator.canShare({ files: [new File(['x'], 'x.jpg', { type: 'image/jpeg' })] })) {
    share.hidden = false;
    share.addEventListener('click', function () {
      share.disabled = true;
      WLB.download('jpg', C.data, C.template, C.photo, opts).then(function (file) {
        return navigator.share({ files: [new File([file.blob], file.name, { type: file.type })], title: 'Marriage biodata' });
      }).catch(function () {}).then(function () { share.disabled = false; });
    });
  }

  // payment
  var pay = document.getElementById('pay');
  if (!pay) return;
  var payErr = document.getElementById('pay-err');
  function loadRzp() {
    if (window.Razorpay) return Promise.resolve();
    return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.onload = res; s.onerror = function () { rej(new Error('Could not load the payment window. Check your connection.')); }; document.head.appendChild(s); });
  }
  if (C.live) loadRzp().catch(function () {});
  pay.addEventListener('click', function () {
    var original = pay.textContent;
    function reset(m) { pay.disabled = false; pay.textContent = original; if (m) payErr.textContent = m; }
    pay.disabled = true; pay.textContent = 'Opening payment…'; payErr.textContent = '';
    try { fbq('track', 'InitiateCheckout', { value: C.price, currency: 'INR', content_name: 'Biodata' }); } catch (e) {}
    post('/api.php?a=bio_order', { t: C.t }).then(function (o) {
      if (!o.ok) return reset(o.error);
      if (o.demo) return post('/api.php?a=bio_demo_pay', { t: C.t }).then(function (r) { if (r.ok) location.reload(); else reset(r.error); });
      return loadRzp().then(function () {
        var rzp = new Razorpay({ key: o.key, amount: o.amount, currency: o.currency, name: o.name, description: o.description, order_id: o.order_id, prefill: o.prefill,
          theme: { color: '#C9727F' }, retry: { enabled: true },
          handler: function (resp) {
            pay.textContent = 'Confirming payment…';
            post('/api.php?a=bio_verify', Object.assign({ t: C.t }, resp)).then(function (v) { if (v.ok) location.reload(); else reset(v.error + ' If money was taken, refresh this page in a minute.'); })
              .catch(function () { reset('We could not confirm the payment yet. Refresh this page in a minute.'); });
          },
          modal: { ondismiss: function () { reset(); } } });
        rzp.on('payment.failed', function (r) { reset('Payment failed: ' + ((r.error && r.error.description) || 'try another method.')); });
        rzp.open();
      });
    }).catch(function (x) { reset(x && x.message ? x.message : 'No connection. Try again.'); });
  });
})();
</script>
</body>
</html>
