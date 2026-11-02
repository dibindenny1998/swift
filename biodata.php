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
$fmt = isset(BIO_SEO[$_GET['f'] ?? '']) && ($_GET['f'] ?? '') !== '' ? $_GET['f'] : '';
$SEO = BIO_SEO[$fmt];
$preset = $fmt && !$bio ? ['religion' => $SEO['religion'], 'template' => $SEO['template']] : null;
$cfg = bio_js_config() + ['existing' => $existing, 'preset' => $preset, 'brand' => $brand, 'host' => preg_replace('#^https?://#', '', base_url())];
$path = $fmt ? '/biodata/' . $fmt : '/biodata';
$crumbs = [['Home', '/'], ['Free biodata maker', '/biodata']];
if ($fmt) $crumbs[] = [$SEO['h1'], $path];
$ld = [
    ld_app($SEO['h1'] . ' (free)', $SEO['desc'], $path, ['Religion-based biodata formats', 'Minimal designs in six colours', 'Photo', 'PDF and JPG download', 'Malayalam, Hindi, Tamil and other Indian languages'],
        [['Free biodata with a small credit strip', 0], ['Clean biodata without the strip', $pb]]),
    ld_faq(bio_faq()),
    ld_breadcrumb($crumbs),
];

$bioHead = '<link rel="stylesheet" crossorigin="anonymous" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Amiri:wght@400;700&family=Noto+Serif+Malayalam:wght@400;600&family=Noto+Serif+Devanagari:wght@400;600&family=Noto+Serif+Tamil:wght@400;600&family=Noto+Serif+Kannada:wght@400;600&family=Noto+Serif+Telugu:wght@400;600&family=Noto+Serif+Gurmukhi:wght@400;600&display=swap">'
    . '<link rel="stylesheet" href="' . asset('assets/biodata.css') . '">';
site_head($bio ? 'Edit your biodata | ' . $brand : $SEO['title'], $SEO['desc'], '/assets/img/biodata-sample.jpg', $bioHead,
    ['path' => $path, 'noindex' => (bool)$bio, 'jsonld' => $bio ? [] : $ld]);
?>
<body>
<?php site_header('biodata'); ?>

<main class="wrap">
  <div class="page-head">
    <?php if ($bio): ?><p style="margin-bottom:10px"><a href="/b/<?= e($bio['token']) ?>">← Back to my biodata</a></p><?php endif; ?>
    <h1><?= $bio ? 'Edit your biodata' : e($SEO['h1']) ?> <span class="free-tag big">Free</span></h1>
    <?php if (!$bio): ?><p><?= e($SEO['intro']) ?></p><?php endif; ?>
    <p>Fill in what you like and leave the rest empty. Empty lines don't print. Write in English or your own language. Free with a small red “Created by <?= e($brand) ?>” strip at the bottom, or ₹<?= $pb ?> to remove it.</p>
  </div>

  <div class="bio-layout edit">
    <form class="bio-form" id="bf" novalidate>
      <div class="card">
        <h2>Religion</h2>
        <p class="lead" style="margin:-6px 0 14px;font-size:.95rem;color:var(--plum-2)">We show the details families of your religion usually look for, and add the right blessing at the top.</p>
        <div class="rel-pick" role="radiogroup" aria-label="Religion">
          <?php foreach (BIO_RELIGIONS as $k => $r): ?><label><input type="radio" name="religion" value="<?= $k ?>"<?= $k === 'hindu' ? ' checked' : '' ?>><span><?= e($r['name']) ?></span></label><?php endforeach; ?>
        </div>
      </div>

      <div class="card">
        <h2>Style</h2>
        <div class="lay-pick" role="radiogroup" aria-label="Style">
          <?php foreach (BIO_LAYOUTS as $k => $name): ?>
            <label><input type="radio" name="layout" value="<?= $k ?>"<?= $k === 'center' ? ' checked' : '' ?>><i class="lay-<?= $k ?>"></i><?= e($name) ?></label>
          <?php endforeach; ?>
        </div>
        <h2 style="margin-top:22px">Colour</h2>
        <div class="tpl-pick" role="radiogroup" aria-label="Colour">
          <?php foreach (BIO_TEMPLATES as $k => $t): ?>
            <label><input type="radio" name="template" value="<?= $k ?>"<?= $k === 'royal' ? ' checked' : '' ?>><i class="tpl-<?= $k ?>"></i><?= e($t['name']) ?></label>
          <?php endforeach; ?>
        </div>
      </div>

      <div class="card">
        <h2>Heading and photo</h2>
        <div class="row2">
          <div class="field"><label for="f-title">Heading</label><input id="f-title" name="title" maxlength="40" placeholder="Marriage Biodata"></div>
          <div class="field"><label for="f-top_line">Blessing line at the top</label><input id="f-top_line" name="top_line" maxlength="60" placeholder=""><small><label style="font-weight:500;display:inline-flex;gap:6px;align-items:center"><input type="checkbox" name="no_top" id="f-no_top"> Don't show a blessing line</label></small>
            <small><label style="font-weight:500;display:inline-flex;gap:6px;align-items:center"><input type="checkbox" name="symbol" id="f-symbol"> Show the religious symbol (<span id="sym-name">ॐ</span>)</label></small></div>
        </div>
        <div class="field"><span>Photo (optional)</span>
          <div class="photo-row"><img id="photo-th" alt="" hidden><label class="btn alt small" for="photo-in">Add a photo</label><button type="button" class="linkbtn" id="photo-x" hidden>Remove</button></div>
          <input type="file" id="photo-in" accept="image/*" hidden>
        </div>
      </div>

      <?php foreach (BIO_SECTIONS as $title => $fields): ?>
      <div class="card">
        <h2 <?= $title === '@religion' ? 'id="rel-title"' : '' ?>><?= e($title === '@religion' ? BIO_RELIGIONS['hindu']['section'] : $title) ?></h2>
        <div class="row2">
          <?php foreach ($fields as $f): $k = $f['k']; $type = $f['type'] ?? 'text'; $ph = $f['ph'] ?? ''; ?>
            <div class="field" data-rel="<?= e(implode(' ', $f['rel'] ?? [])) ?>" data-ph="<?= e(json_encode(is_array($ph) ? $ph : ['*' => $ph], JSON_UNESCAPED_UNICODE)) ?>"<?= $type === 'textarea' ? ' style="grid-column:1/-1"' : '' ?>><label for="f-<?= $k ?>"><?= e($f['label']) ?></label>
              <?php if ($type === 'textarea'): ?><textarea id="f-<?= $k ?>" name="<?= $k ?>" maxlength="<?= $f['max'] ?>" rows="2" placeholder="<?= e(bio_ph($ph, 'hindu')) ?>"></textarea>
              <?php else: ?><input id="f-<?= $k ?>" name="<?= $k ?>" type="<?= $type === 'tel' ? 'text' : $type ?>"<?= $type === 'tel' ? ' inputmode="tel"' : '' ?> maxlength="<?= $f['max'] ?>" placeholder="<?= e(bio_ph($ph, 'hindu')) ?>"<?= $k === 'name' ? ' required' : '' ?>><?php endif; ?></div>
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
        <p class="lead" style="margin:-6px 0 14px;font-size:.95rem;color:var(--plum-2)">Anything else, like hobbies, languages known, property or a second contact.</p>
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
      <p>Live preview. The free download has a small red “Created by <?= e($brand) ?>” strip at the bottom.</p>
    </aside>
  </div>
<?php if (!$bio): ?>
  <section class="sec bio-guide">
    <div class="guide-grid">
      <div>
        <h2><?= e($SEO['guide_title']) ?></h2>
        <ul class="guide-list"><?php foreach ($SEO['guide'] as $g): ?><li><?= e($g) ?></li><?php endforeach; ?></ul>
      </div>
      <nav class="formats" aria-label="Biodata formats">
        <h2>Biodata formats</h2>
        <?php foreach (BIO_SEO as $k => $x): if ($k === '') continue; ?>
          <a href="/biodata/<?= $k ?>"<?= $k === $fmt ? ' aria-current="page"' : '' ?>><?= e(str_replace(' maker', '', $x['h1'])) ?></a>
        <?php endforeach; ?>
        <a href="/biodata"<?= $fmt === '' ? ' aria-current="page"' : '' ?>>All formats</a>
      </nav>
    </div>
  </section>
<?php endif; ?>
</main>
<?php if (!$bio) echo faq_html(bio_faq(), 'Biodata questions'); ?>

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
  // a format page (/biodata/muslim etc.) starts with that religion and colour
  if (!EX && C.preset) { data.religion = C.preset.religion; tpl = C.preset.template; }
  var photo = EX && EX.photo ? { kind: 'old', url: EX.photo } : null;
  if (!Array.isArray(data.extra)) data.extra = [];

  var SKIP = { template: 1, phone: 1, religion: 1, no_top: 1, symbol: 1, layout: 1 };
  var names = [];
  Array.prototype.forEach.call(f.elements, function (el) { if (el.name && !SKIP[el.name] && el.type !== 'file') { names.push(el.name); if (data[el.name]) el.value = data[el.name]; } });
  if (!C.religions[data.religion]) data.religion = 'hindu';
  f.querySelector('input[name=religion][value="' + data.religion + '"]').checked = true;
  f.elements.no_top.checked = !!data.no_top;
  f.elements.symbol.checked = !!data.symbol;
  if (!C.layouts[data.layout]) data.layout = 'center';
  f.querySelector('input[name=layout][value="' + data.layout + '"]').checked = true;
  var SYM = { hindu: 'ॐ', jain: 'Jain symbol', sikh: 'ੴ', muslim: 'crescent', christian: 'cross', buddhist: 'dharma wheel' };
  var tplChosen = !!EX || !!C.preset || !!store.get('wlb_tpl_set');
  (f.querySelector('input[name=template][value="' + tpl + '"]') || f.querySelector('input[name=template]')).checked = true;
  // show only the fields that fit the religion, with matching examples
  function applyReligion() {
    var r = data.religion, R = C.religions[r];
    f.querySelectorAll('.field[data-rel]').forEach(function (fl) {
      var rel = fl.dataset.rel; fl.hidden = !!rel && rel.split(' ').indexOf(r) < 0;
      var ph = JSON.parse(fl.dataset.ph || '{}'), inp = fl.querySelector('input,textarea');
      if (inp) inp.placeholder = ph[r] != null ? ph[r] : (ph['*'] || '');
    });
    document.getElementById('rel-title').textContent = R.section;
    f.elements.top_line.placeholder = R.top || 'Optional';
    document.getElementById('sym-name').textContent = SYM[r] || 'none for this religion';
    f.elements.symbol.disabled = !SYM[r];
    if (!tplChosen) { tpl = R.template; f.querySelector('input[name=template][value="' + tpl + '"]').checked = true; }
  }
  applyReligion();

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
  f.addEventListener('change', function (e) {
    if (e.target.name === 'template') { tpl = e.target.value; tplChosen = true; store.set('wlb_tpl_set', 1); changed(); }
    if (e.target.name === 'religion') { data.religion = e.target.value; applyReligion(); changed(); }
    if (e.target.name === 'no_top') { data.no_top = e.target.checked; changed(); }
    if (e.target.name === 'symbol') { data.symbol = e.target.checked; changed(); }
    if (e.target.name === 'layout') { data.layout = e.target.value; changed(); }
  });
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
