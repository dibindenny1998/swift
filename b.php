<?php
require __DIR__ . '/lib/bootstrap.php';
header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');

$token = (string)($_GET['t'] ?? '');
$bio = preg_match('/^[a-f0-9]{32}$/', $token) ? find_bio('token', $token) : null;
if (!$bio) { header('Location: /biodata'); exit; }

attach_to_user('biodata', (int)$bio['id']);
$brand = setting('brand');
$paid = (int)$bio['paid'] === 1;
$pb = price('biodata');
$d = json_decode($bio['data'], true) ?: [];
$cfg = bio_js_config() + [
    't' => $bio['token'], 'paid' => $paid, 'data' => $d, 'template' => $bio['template'],
    'photo' => $bio['photo'] ? '/m/b' . $bio['id'] . '/' . $bio['photo'] : '',
    'hasDetails' => (bool)customer_get('biodata', (int)$bio['id']), 'prefill' => ['name' => $d['name'] ?? '', 'phone' => $bio['phone'] ?: '', 'email' => $bio['email'] ?: ''], 'states' => INDIAN_STATES,
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
        <h1 style="font-size:clamp(1.9rem,4vw,2.6rem)">Your biodata is ready.</h1>
        <p class="lead" style="margin:10px 0 20px;color:var(--plum-2)">Download it free, with no watermark, as often as you like. You can edit it any time.</p>
        <div class="bio-actions">
          <button type="button" class="btn<?= $paid ? '' : ' alt' ?>" data-dl="pdf">Download PDF</button>
          <button type="button" class="btn alt" data-dl="jpg">Download image (JPG)</button>
          <button type="button" class="btn alt" id="share" hidden>Share on WhatsApp</button>
        </div>
        <p class="err" id="dl-err" role="alert" style="margin-top:10px"></p>
      </section>

      <section class="card look-card" style="margin-top:16px" id="look">
        <h2 style="font-size:1.5rem">Change the look</h2>
        <p class="lead" style="margin:6px 0 16px;color:var(--plum-2);font-size:.95rem">Tap a style or colour. The preview and your downloads change straight away.</p>
        <div class="lay-pick" role="radiogroup" aria-label="Style">
          <?php foreach (BIO_LAYOUTS as $k => $name): ?>
            <label><input type="radio" name="layout" value="<?= $k ?>"<?= ($d['layout'] ?? 'center') === $k ? ' checked' : '' ?>><i class="lay-<?= $k ?>"></i><?= e($name) ?></label>
          <?php endforeach; ?>
        </div>
        <div class="tpl-pick" role="radiogroup" aria-label="Colour" style="margin-top:18px">
          <?php foreach (BIO_TEMPLATES as $k => $t): ?>
            <label><input type="radio" name="template" value="<?= $k ?>"<?= $bio['template'] === $k ? ' checked' : '' ?>><i class="tpl-<?= $k ?>"></i><?= e($t['name']) ?></label>
          <?php endforeach; ?>
        </div>
        <label class="sym-toggle"><input type="checkbox" id="sym"<?= !empty($d['symbol']) ? ' checked' : '' ?><?= in_array($d['religion'] ?? 'hindu', ['other'], true) ? ' disabled' : '' ?>> Show the religious symbol</label>
        <p class="note-saved" id="look-msg" role="status"></p>
      </section>



      <?php if (!current_user()): ?><section class="card acct-nudge" style="margin-top:16px"><h2>Keep it safe in your account</h2><p class="lead">Sign in once to find and edit this biodata from any phone.</p><a class="btn small" href="/account">Sign in or create an account</a></section><?php endif; ?>
      <section class="card later-card" id="later" style="margin-top:16px" hidden>
        <h2 style="font-size:1.5rem">When the match is fixed, your wedding link is ready in 5 minutes.</h2>
        <p class="lead" style="margin:8px 0 16px;color:var(--plum-2)">One link with every function, maps and RSVP, sent on WhatsApp. Save your details now and we'll keep them ready.</p>
        <a class="btn" href="/account">Save my details for later</a>
      </section>
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
<script src="<?= asset('assets/details.js') ?>"></script>
<script>
(function () {
  'use strict';
  var C = window.WLB_CFG, pv = document.getElementById('pv');
  window.WL_STATES = C.states;
  function details() { return WLDetails.ask({ kind: 'biodata', t: C.t, have: C.hasDetails, prefill: C.prefill, why: 'We need these once before your download, so we can help if anything goes wrong.' }).then(function () { C.hasDetails = true; }); }
  var opts = { watermark: false, brand: C.brand, host: C.host };
  function paint() { WLB.render(pv, C.data, C.template, C.photo, opts); WLB.scaleTo(pv); }

  // change the look from this page: repaint now, save quietly in the background
  var look = document.getElementById('look'), lookMsg = document.getElementById('look-msg'), saveT;
  look.addEventListener('change', function (e) {
    if (e.target.name === 'template') C.template = e.target.value;
    if (e.target.name === 'layout') C.data.layout = e.target.value;
    if (e.target.id === 'sym') C.data.symbol = e.target.checked;
    paint();
    lookMsg.textContent = 'Saving…';
    clearTimeout(saveT);
    saveT = setTimeout(function () {
      fetch('/api.php?a=bio_style', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ t: C.t, template: C.template, layout: C.data.layout || 'center', symbol: !!C.data.symbol }) })
        .then(function (r) { return r.json(); })
        .then(function (j) { lookMsg.textContent = j.ok ? 'Saved' : (j.error || 'Could not save. Try again.'); setTimeout(function () { if (lookMsg.textContent === 'Saved') lookMsg.textContent = ''; }, 1500); })
        .catch(function () { lookMsg.textContent = 'No connection. Your downloads still use the new look.'; });
    }, 300);
  });
  paint();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint);
  addEventListener('resize', function () { WLB.scaleTo(pv); });
  var toast = document.getElementById('toast'); if (toast) setTimeout(function () { toast.remove(); }, 2600);
  function post(url, body) { return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) { return r.json().catch(function () { return { ok: false, error: 'Unexpected reply (' + r.status + ').' }; }); }); }
  if (C.purchase) { try { fbq('track', 'Purchase', { value: C.purchase.value, currency: 'INR', content_name: 'Biodata' }, { eventID: C.purchase.id }); } catch (e) {} }

  var err = document.getElementById('dl-err');
  document.querySelectorAll('[data-dl]').forEach(function (b) {
    b.addEventListener('click', function () {
      var label = b.textContent;
      details().then(function () {
      b.disabled = true; b.textContent = 'Preparing…'; err.textContent = '';
      return WLB.download(b.dataset.dl, C.data, C.template, C.photo, opts).then(function (file) {
        WLB.saveBlob(file.blob, file.name); post('/api.php?a=bio_download', { t: C.t });
        var later = document.getElementById('later'); if (later && later.hidden) { later.hidden = false; setTimeout(function () { later.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 600); }
      }).catch(function () { err.textContent = 'Could not create the file. Check your connection and try again.'; })
        .then(function () { b.disabled = false; b.textContent = label; });
      }, function () {});
    });
  });

  // share the image straight to WhatsApp where the phone supports it
  var share = document.getElementById('share');
  if (navigator.canShare && navigator.canShare({ files: [new File(['x'], 'x.jpg', { type: 'image/jpeg' })] })) {
    share.hidden = false;
    share.addEventListener('click', function () {
      details().then(function () {
      share.disabled = true;
      return WLB.download('jpg', C.data, C.template, C.photo, opts).then(function (file) {
        return navigator.share({ files: [new File([file.blob], file.name, { type: file.type })], title: 'Marriage biodata' });
      }).catch(function () {}).then(function () { share.disabled = false; });
      }, function () {});
    });
  }

  // payment
  var pay = document.getElementById('pay');
  if (!pay) return;
  var payErr = document.getElementById('pay-err');
  function goPayU(pu) {
    var f = document.createElement('form'); f.method = 'POST'; f.action = pu.action;
    Object.keys(pu.fields).forEach(function (k) { var i = document.createElement('input'); i.type = 'hidden'; i.name = k; i.value = pu.fields[k]; f.appendChild(i); });
    document.body.appendChild(f); f.submit();
  }
  if (/[?&]payfail=1/.test(location.search)) { payErr.textContent = 'The payment did not go through, and no money was taken. Please try again.'; history.replaceState(null, '', location.pathname); }
  pay.addEventListener('click', function () {
    var original = pay.textContent;
    function reset(m) { pay.disabled = false; pay.textContent = original; if (m) payErr.textContent = m; }
    details().then(function () {
    pay.disabled = true; pay.textContent = 'Opening payment…'; payErr.textContent = '';
    try { fbq('track', 'InitiateCheckout', { value: C.price, currency: 'INR', content_name: 'Biodata' }); } catch (e) {}
    post('/api.php?a=bio_order', { t: C.t }).then(function (o) {
      if (o.need_details) { C.hasDetails = false; return reset('Add your details to continue.'); }
      if (!o.ok) return reset(o.error);
      if (o.demo) return post('/api.php?a=bio_demo_pay', { t: C.t }).then(function (r) { if (r.ok) location.reload(); else reset(r.error); });
      if (o.payu) { pay.textContent = 'Opening PayU…'; return goPayU(o.payu); }
      reset('Payment could not start. Try again.');
    }).catch(function (x) { reset(x && x.message ? x.message : 'No connection. Try again.'); });
    }, function () {});
  });
})();
</script>
</body>
</html>
