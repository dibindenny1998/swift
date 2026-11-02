<?php
require __DIR__ . '/lib/bootstrap.php';
$brand = setting('brand');
$token = preg_match('/^[a-f0-9]{32}$/', $_GET['t'] ?? '') ? $_GET['t'] : '';
$bio = $token ? find_bio('token', $token) : null;
if ($token && !$bio) { header('Location: /biodata'); exit; }
$pb = price('biodata');
$existing = $bio ? [
    'token' => $bio['token'], 'template' => $bio['template'], 'data' => json_decode($bio['data'], true) ?: [],
    'photo' => $bio['photo'] ? '/m/b' . $bio['id'] . '/' . $bio['photo'] : '',
] : null;
$cfg = bio_js_config() + ['existing' => $existing, 'brand' => $brand, 'host' => preg_replace('#^https?://#', '', base_url())];

$bioHead = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Marcellus&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Noto+Serif+Malayalam:wght@400;600&family=Noto+Serif+Devanagari:wght@400;600&family=Noto+Serif+Tamil:wght@400;600&family=Noto+Serif+Kannada:wght@400;600&family=Noto+Serif+Telugu:wght@400;600&family=Noto+Serif+Gurmukhi:wght@400;600&display=swap">'
    . '<link rel="stylesheet" href="' . asset('assets/biodata.css') . '">';
site_head(($bio ? 'Edit your biodata' : 'Free marriage biodata maker') . ' | ' . $brand,
    'Make a beautiful marriage biodata in minutes. Add your details, family and horoscope, pick a design and download a PDF or image. Free.', '/assets/og/site.jpg', $bioHead);
?>
<body>
<header class="top">
  <div class="wrap top-in">
    <a class="logo" href="/"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="12" cy="16" r="8.5" fill="none" stroke="#7E1239" stroke-width="2.6"/><circle cx="20" cy="16" r="8.5" fill="none" stroke="#B08A3E" stroke-width="2.6"/></svg><?= e($brand) ?></a>
    <?php if ($bio): ?><a class="btn small alt" href="/b/<?= e($bio['token']) ?>">Back to my biodata</a><?php else: ?><a class="btn small alt" href="/">Wedding websites</a><?php endif; ?>
  </div>
</header>

<main class="wrap">
  <div class="page-head">
    <h1><?= $bio ? 'Edit your biodata' : 'Marriage biodata maker' ?></h1>
    <p>Fill in what you like and leave the rest empty. Empty lines don't print. Write in English or your own language. Free with a small <?= e($brand) ?> watermark, or ₹<?= $pb ?> to remove it.</p>
  </div>

  <div class="bio-layout edit">
    <form class="bio-form" id="bf" novalidate>
      <div class="card">
        <h2>Design</h2>
        <div class="tpl-pick" role="radiogroup" aria-label="Design">
          <?php foreach (BIO_TEMPLATES as $k => $t): ?>
            <label><input type="radio" name="template" value="<?= $k ?>"<?= $k === 'royal' ? ' checked' : '' ?>><i class="tpl-<?= $k ?>"></i><?= e($t['name']) ?></label>
          <?php endforeach; ?>
        </div>
      </div>

      <div class="card">
        <h2>Heading and photo</h2>
        <div class="row2">
          <?php foreach (BIO_TEXT as [$k, $label, $max, $ph]): if (!in_array($k, ['title', 'top_line'], true)) continue; ?>
            <div class="field"><label for="f-<?= $k ?>"><?= e($label) ?></label><input id="f-<?= $k ?>" name="<?= $k ?>" maxlength="<?= $max ?>" placeholder="<?= e($ph) ?>"></div>
          <?php endforeach; ?>
        </div>
        <div class="field"><span>Photo (optional)</span>
          <div class="photo-row"><img id="photo-th" alt="" hidden><label class="btn alt small" for="photo-in">Add a photo</label><button type="button" class="linkbtn" id="photo-x" hidden>Remove</button></div>
          <input type="file" id="photo-in" accept="image/*" hidden>
        </div>
      </div>

      <?php foreach (BIO_SECTIONS as $title => $fields): ?>
      <div class="card">
        <h2><?= e($title) ?></h2>
        <div class="row2">
          <?php foreach ($fields as [$k, $label, $max, $ph, $type]): ?>
            <div class="field"<?= $type === 'textarea' ? ' style="grid-column:1/-1"' : '' ?>><label for="f-<?= $k ?>"><?= e($label) ?></label>
              <?php if ($type === 'textarea'): ?><textarea id="f-<?= $k ?>" name="<?= $k ?>" maxlength="<?= $max ?>" rows="2" placeholder="<?= e($ph) ?>"></textarea>
              <?php else: ?><input id="f-<?= $k ?>" name="<?= $k ?>" type="<?= $type === 'tel' ? 'text' : $type ?>"<?= $type === 'tel' ? ' inputmode="tel"' : '' ?> maxlength="<?= $max ?>" placeholder="<?= e($ph) ?>"<?= $k === 'name' ? ' required' : '' ?>><?php endif; ?></div>
          <?php endforeach; ?>
        </div>
      </div>
      <?php endforeach; ?>

      <div class="card">
        <h2>About and expectations</h2>
        <?php foreach (BIO_TEXT as [$k, $label, $max, $ph]): if (!in_array($k, ['about', 'expect'], true)) continue; ?>
          <div class="field"><label for="f-<?= $k ?>"><?= e($label) ?></label><textarea id="f-<?= $k ?>" name="<?= $k ?>" maxlength="<?= $max ?>" rows="3" placeholder="<?= e($ph) ?>"></textarea></div>
        <?php endforeach; ?>
      </div>

      <div class="card">
        <h2>More details (optional)</h2>
        <p class="lead" style="margin:-6px 0 14px;font-size:.95rem;color:var(--plum-2)">Anything else, like hobbies, diet, property or a second contact.</p>
        <div id="extra"></div>
        <button type="button" class="btn alt small" id="add-extra">Add a line</button>
      </div>

      <div class="card">
        <?php if ($bio): ?>
          <h2>Save your changes</h2>
        <?php else: ?>
          <h2>Save and download</h2>
          <div class="field"><label for="phone">Your WhatsApp number</label><input id="phone" name="phone" inputmode="tel" autocomplete="tel" maxlength="15" placeholder="98765 43210" required><small>We save your biodata under this number so you can edit it later.</small></div>
        <?php endif; ?>
        <p class="err" role="alert"></p>
        <button type="submit" class="btn" id="save" style="width:100%"><?= $bio ? 'Save changes' : 'Save and see download options' ?></button>
      </div>
    </form>

    <aside class="bio-preview" aria-label="Preview">
      <div class="bd-frame" id="pv"></div>
      <p>Live preview. The <?= e($brand) ?> watermark shows on the free download.</p>
    </aside>
  </div>
</main>

<div class="bio-mobile-bar"><button type="button" class="btn alt" id="m-prev">Preview</button><button type="button" class="btn" id="m-save"><?= $bio ? 'Save' : 'Save &amp; download' ?></button></div>
<div class="sheet" id="sheet" hidden><div class="sheet-in"><div class="sheet-bar"><b>Preview</b><button type="button" class="btn small alt" id="close-sheet">Close</button></div><div style="overflow:auto;padding:16px;flex:1"><div class="bd-frame" id="pv-m"></div></div></div></div>

<?php site_footer(); ?>
<script>window.WLB_CFG = <?= json_for_script($cfg) ?>;</script>
<script src="<?= asset('assets/biodata.js') ?>"></script>
<script>
(function () {
  'use strict';
  var C = window.WLB_CFG, EX = C.existing;
  var f = document.getElementById('bf'), pv = document.getElementById('pv'), pvm = document.getElementById('pv-m');
  var store = { get: function (k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  var data = EX ? EX.data : (store.get('wlb_draft') || {});
  var tpl = EX ? EX.template : (store.get('wlb_tpl') || 'royal');
  var photo = EX && EX.photo ? { kind: 'old', url: EX.photo } : null;
  if (!Array.isArray(data.extra)) data.extra = [];

  var names = [];
  Array.prototype.forEach.call(f.elements, function (el) { if (el.name && el.name !== 'template' && el.name !== 'phone' && el.type !== 'file') { names.push(el.name); if (data[el.name]) el.value = data[el.name]; } });
  (f.querySelector('input[name=template][value="' + tpl + '"]') || f.querySelector('input[name=template]')).checked = true;

  var extraWrap = document.getElementById('extra');
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function drawExtra() {
    extraWrap.innerHTML = data.extra.map(function (x, i) {
      return '<div class="extra-row" data-i="' + i + '"><div class="field"><label for="x-l-' + i + '">Label</label><input id="x-l-' + i + '" data-x="label" maxlength="40" value="' + esc(x.label) + '" placeholder="Hobbies"></div>' +
        '<div class="field"><label for="x-v-' + i + '">Details</label><input id="x-v-' + i + '" data-x="value" maxlength="160" value="' + esc(x.value) + '" placeholder="Music, travel, cooking"></div>' +
        '<button type="button" class="x" data-xdel="' + i + '" aria-label="Remove this line">&times;</button></div>';
    }).join('');
    document.getElementById('add-extra').hidden = data.extra.length >= 8;
  }
  drawExtra();
  document.getElementById('add-extra').addEventListener('click', function () { data.extra.push({ label: '', value: '' }); drawExtra(); extraWrap.querySelector('.extra-row:last-child input').focus(); });
  extraWrap.addEventListener('input', function (e) { var r = e.target.closest('.extra-row'); if (r && e.target.dataset.x) { data.extra[+r.dataset.i][e.target.dataset.x] = e.target.value; changed(); } });
  extraWrap.addEventListener('click', function (e) { var b = e.target.closest('[data-xdel]'); if (b) { data.extra.splice(+b.dataset.xdel, 1); drawExtra(); changed(); } });

  // photo
  var th = document.getElementById('photo-th'), px = document.getElementById('photo-x');
  function drawPhoto() { th.hidden = !photo; px.hidden = !photo; if (photo) th.src = photo.url; document.querySelector('label[for=photo-in]').textContent = photo ? 'Change photo' : 'Add a photo'; }
  drawPhoto();
  document.getElementById('photo-in').addEventListener('change', function (e) {
    var file = e.target.files[0]; e.target.value = ''; if (!file) return;
    var u = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      var s = Math.min(1, 1200 / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
      c.toBlob(function (b) { if (photo && photo.kind === 'new') URL.revokeObjectURL(photo.url); photo = { kind: 'new', blob: b, url: URL.createObjectURL(b) }; drawPhoto(); changed(); }, 'image/jpeg', .88);
    };
    img.onerror = function () { f.querySelector('.err').textContent = 'That photo could not be read. Try a JPG or PNG.'; };
    img.src = u;
  });
  px.addEventListener('click', function () { photo = null; drawPhoto(); changed(); });

  function paint(frame) { WLB.render(frame, data, tpl, photo ? photo.url : '', { watermark: false }); WLB.scaleTo(frame); }
  var t;
  function changed() {
    clearTimeout(t);
    t = setTimeout(function () { paint(pv); if (!sheet.hidden) paint(pvm); if (!EX) { store.set('wlb_draft', data); store.set('wlb_tpl', tpl); } }, 120);
  }
  f.addEventListener('input', function (e) { if (names.indexOf(e.target.name) > -1) { data[e.target.name] = e.target.value; changed(); } });
  f.addEventListener('change', function (e) { if (e.target.name === 'template') { tpl = e.target.value; changed(); } });
  addEventListener('resize', function () { WLB.scaleTo(pv); if (!sheet.hidden) WLB.scaleTo(pvm); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { paint(pv); });
  paint(pv);

  var sheet = document.getElementById('sheet');
  document.getElementById('m-prev').addEventListener('click', function () { sheet.hidden = false; paint(pvm); });
  document.getElementById('close-sheet').addEventListener('click', function () { sheet.hidden = true; });
  document.getElementById('m-save').addEventListener('click', function () { f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', { cancelable: true })); });

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var err = f.querySelector('.err');
    if (!(data.name || '').trim()) { err.textContent = 'Add the full name.'; f.elements.name.focus(); f.elements.name.scrollIntoView({ block: 'center' }); return; }
    var phoneEl = f.elements.phone;
    if (phoneEl && phoneEl.value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '').length !== 10) { err.textContent = 'Enter a 10-digit mobile number.'; phoneEl.focus(); return; }
    var btn = document.getElementById('save'); btn.disabled = true; err.textContent = ''; btn.textContent = 'Saving…';
    var fd = new FormData();
    fd.append('data', JSON.stringify(data)); fd.append('template', tpl);
    if (photo && photo.kind === 'new') fd.append('photo', photo.blob, 'photo.jpg');
    fd.append('photo_keep', photo ? '1' : '0');
    if (EX) fd.append('token', EX.token);
    if (phoneEl) fd.append('phone', phoneEl.value);
    var attr = store.get('wl_attr') || {};
    fd.append('utm_source', attr.utm_source || ''); fd.append('utm_campaign', attr.utm_campaign || ''); fd.append('fbclid', attr.fbclid || '');
    fetch('/api.php?a=bio_save', { method: 'POST', body: fd })
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'Unexpected reply from the server (' + r.status + ').' }; }); })
      .then(function (j) {
        if (!j.ok) throw new Error(j.error || 'Could not save. Try again.');
        if (!EX) { store.set('wlb_last', j.token); try { localStorage.removeItem('wlb_draft'); } catch (x) {} try { fbq('track', 'Lead', { content_name: 'Biodata' }); } catch (x) {} }
        location.href = '/b/' + j.token + (EX ? '?saved=1' : '');
      })
      .catch(function (x) { btn.disabled = false; btn.textContent = EX ? 'Save changes' : 'Save and see download options'; err.textContent = x.message === 'Failed to fetch' ? 'No connection. Check your internet and try again.' : x.message; });
  });
})();
</script>
</body>
</html>
