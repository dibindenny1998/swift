<?php
require __DIR__ . '/lib/bootstrap.php';
header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');
$brand = setting('brand');
$u = current_user();
$gid = setting('google_client_id');
$step = !$u ? 'signin' : (!$u['phone'] ? 'phone' : 'home');

$invites = $bios = [];
if ($step === 'home') {
    $st = db()->prepare('SELECT * FROM invites WHERE user_id = ? ORDER BY id DESC');
    $st->execute([$u['id']]); $invites = $st->fetchAll();
    $st = db()->prepare('SELECT * FROM biodata WHERE user_id = ? ORDER BY id DESC');
    $st->execute([$u['id']]); $bios = $st->fetchAll();
}
$head = $step === 'signin' && $gid ? '<script src="https://accounts.google.com/gsi/client" async></script>' : '';
site_head(($step === 'home' ? 'My account' : 'Sign in') . ' | ' . $brand, 'Sign in to see all your wedding websites and biodatas in one place.', '/assets/og/home.jpg', $head);
?>
<body>
<?php site_header('account'); ?>
<main class="wrap acct">
<?php if ($step === 'signin'): ?>
  <section class="card acct-card">
    <h1>Sign in</h1>
    <p class="lead">See all your wedding websites and biodatas in one place, on any phone or laptop.</p>
    <?php if ($gid): ?>
      <div id="g_id_onload" data-client_id="<?= e($gid) ?>" data-callback="wlGoogle" data-auto_prompt="false"></div>
      <div class="g_id_signin" data-type="standard" data-size="large" data-shape="pill" data-text="continue_with" data-width="320"></div>
      <p class="acct-or"><span>or use your email</span></p>
    <?php endif; ?>
    <form id="f-email" novalidate>
      <div class="field"><label for="a-email">Email</label><input id="a-email" type="email" autocomplete="email" maxlength="120" required placeholder="you@example.com"></div>
      <p class="err" role="alert"></p>
      <button class="btn" type="submit" style="width:100%">Send me a code</button>
    </form>
    <form id="f-code" novalidate hidden>
      <p class="lead" style="margin-bottom:12px">We sent a 6-digit code to <b id="a-sent"></b>. It works for 15 minutes.</p>
      <div class="field"><label for="a-code">Code</label><input id="a-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required placeholder="123456"></div>
      <p class="err" role="alert"></p>
      <button class="btn" type="submit" style="width:100%">Sign in</button>
      <button type="button" class="linkbtn" id="a-back" style="margin-top:12px">Use a different email</button>
    </form>
    <p class="note" style="margin-top:16px">New here? Signing in creates your account. No password needed.</p>
  </section>
<?php elseif ($step === 'phone'): ?>
  <section class="card acct-card">
    <h1>One last step</h1>
    <p class="lead">Add your name and mobile number. We use it only to help you with your invite and payments.</p>
    <form id="f-profile" novalidate>
      <div class="field"><label for="a-name">Full name</label><input id="a-name" name="name" maxlength="80" autocomplete="name" required value="<?= e($u['name'] ?? '') ?>"></div>
      <div class="field"><label for="a-phone">Mobile number</label><input id="a-phone" name="phone" inputmode="tel" maxlength="15" autocomplete="tel" required placeholder="98765 43210"></div>
      <p class="err" role="alert"></p>
      <button class="btn" type="submit" style="width:100%">Continue</button>
    </form>
  </section>
<?php else: ?>
  <div class="acct-head">
    <div><h1>Hello, <?= e(explode(' ', trim($u['name'] ?: 'there'))[0]) ?></h1><p class="lead"><?= e($u['email']) ?> · <?= e($u['phone']) ?></p></div>
    <div class="acct-acts"><a class="btn small" href="/create">Make a new invite</a><button type="button" class="btn small alt" id="a-edit">Edit profile</button><button type="button" class="btn small alt" id="a-out">Sign out</button></div>
  </div>
  <form class="card acct-profile" id="f-profile" novalidate hidden>
    <div class="row2"><div class="field"><label for="a-name">Full name</label><input id="a-name" name="name" maxlength="80" required value="<?= e($u['name']) ?>"></div>
    <div class="field"><label for="a-phone">Mobile number</label><input id="a-phone" name="phone" inputmode="tel" maxlength="15" required value="<?= e($u['phone']) ?>"></div></div>
    <p class="err" role="alert"></p><button class="btn small" type="submit">Save</button>
  </form>

  <h2 class="acct-h">My wedding websites</h2>
  <?php if (!$invites): ?>
    <div class="card acct-empty"><p>No invites yet. <a href="/create">Make your wedding website</a> in 5 minutes. If you made one before signing in, open its private link once on this phone and it will appear here.</p></div>
  <?php else: ?><div class="acct-list">
    <?php foreach ($invites as $inv): $d = invite_data($inv); $paid = $inv['status'] === 'paid';
      $st = db()->prepare('SELECT COALESCE(SUM(CASE WHEN attending = 1 THEN guests ELSE 0 END), 0) FROM rsvps WHERE invite_id = ?'); $st->execute([$inv['id']]); $coming = (int)$st->fetchColumn();
      $exp = $paid ? invite_expiry($inv) : null; ?>
      <article class="card acct-item">
        <img src="<?= asset('assets/img/designs/' . $inv['theme'] . '.jpg') ?>" alt="" width="232" height="480" loading="lazy">
        <div class="acct-item-b">
          <h3><?= e(invite_title($d)) ?></h3>
          <p class="acct-meta"><span class="pill<?= $paid ? ' ok' : '' ?>"><?= $paid ? e(PLAN_NAMES[$inv['plan']] ?? $inv['plan']) : 'Draft' ?></span> <?= e(THEMES[$inv['theme']]['name'] ?? $inv['theme']) ?> design</p>
          <p class="acct-stats"><?= $paid ? (invite_expired($inv) ? 'Ended ' : 'Live until ') . date('j M Y', strtotime($exp)) . ' · ' . (int)$inv['views'] . ' opens' . ($inv['plan'] === 'premium' ? ' · ' . $coming . ' guests coming' : '') : 'Not published yet' ?></p>
          <div class="acct-btns"><a class="btn small" href="/p/<?= e($inv['token']) ?>"><?= $paid ? 'Manage' : 'Publish' ?></a><a class="btn small alt" href="/create?t=<?= e($inv['token']) ?>">Edit</a><?php if ($paid): ?><a class="btn small alt" href="/i/<?= e($inv['slug']) ?>" target="_blank" rel="noopener">Open</a><?php endif; ?></div>
        </div>
      </article>
    <?php endforeach; ?></div>
  <?php endif; ?>

  <h2 class="acct-h">My biodatas</h2>
  <?php if (!$bios): ?>
    <div class="card acct-empty"><p>No biodata yet. <a href="/biodata">Make a free marriage biodata</a>.</p></div>
  <?php else: ?><div class="acct-list">
    <?php foreach ($bios as $b): $bd = json_decode($b['data'], true) ?: []; ?>
      <article class="card acct-item acct-bio">
        <div class="acct-item-b">
          <h3><?= e($bd['name'] ?? 'Biodata') ?></h3>
          <p class="acct-meta"><span class="pill<?= $b['paid'] ? ' ok' : '' ?>"><?= $b['paid'] ? 'Clean copy' : 'Free' ?></span> <?= (int)$b['downloads'] ?> downloads</p>
          <div class="acct-btns"><a class="btn small" href="/b/<?= e($b['token']) ?>">Download</a><a class="btn small alt" href="/biodata?t=<?= e($b['token']) ?>">Edit</a></div>
        </div>
      </article>
    <?php endforeach; ?></div>
  <?php endif; ?>
<?php endif; ?>
</main>
<?php site_footer(); ?>
<script>
(function () {
  'use strict';
  function post(a, body) { return fetch('/api.php?a=' + a, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }).then(function (r) { return r.json(); }); }
  function busy(b, on, t) { b.disabled = on; if (t) b.textContent = t; }
  function after(j) { location.href = location.pathname; }
  // invites and biodatas made on this phone before signing in join the account
  function claim() {
    var g = function (k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
    var inv = [g('wl_last')].filter(Boolean), bio = [g('wlb_last')].filter(Boolean);
    return inv.length || bio.length ? post('claim', { invites: inv, bios: bio }).catch(function () {}) : Promise.resolve();
  }
  var fe = document.getElementById('f-email'), fc = document.getElementById('f-code'), email = '';
  if (fe) {
    fe.addEventListener('submit', function (e) {
      e.preventDefault(); var b = fe.querySelector('button'), err = fe.querySelector('.err'); err.textContent = '';
      email = document.getElementById('a-email').value.trim(); busy(b, true, 'Sending…');
      post('login_code', { email: email }).then(function (j) {
        busy(b, false, 'Send me a code');
        if (!j.ok) { err.textContent = j.error; return; }
        document.getElementById('a-sent').textContent = email; fe.hidden = true; fc.hidden = false;
        if (j.dev_code) document.getElementById('a-code').value = j.dev_code;
        document.getElementById('a-code').focus();
      }).catch(function () { busy(b, false, 'Send me a code'); err.textContent = 'No connection. Try again.'; });
    });
    fc.addEventListener('submit', function (e) {
      e.preventDefault(); var b = fc.querySelector('button[type=submit]'), err = fc.querySelector('.err'); err.textContent = ''; busy(b, true, 'Signing in…');
      post('login_verify', { email: email, code: document.getElementById('a-code').value }).then(function (j) {
        if (!j.ok) { busy(b, false, 'Sign in'); err.textContent = j.error; return; }
        claim().then(after);
      }).catch(function () { busy(b, false, 'Sign in'); err.textContent = 'No connection. Try again.'; });
    });
    document.getElementById('a-back').addEventListener('click', function () { fc.hidden = true; fe.hidden = false; });
  }
  window.wlGoogle = function (r) {
    post('login_google', { credential: r.credential }).then(function (j) {
      if (!j.ok) { fe.querySelector('.err').textContent = j.error; return; }
      claim().then(after);
    });
  };
  var fp = document.getElementById('f-profile');
  if (fp) fp.addEventListener('submit', function (e) {
    e.preventDefault(); var b = fp.querySelector('button[type=submit]'), err = fp.querySelector('.err'), label = b.textContent; err.textContent = ''; busy(b, true, 'Saving…');
    post('profile', { name: fp.elements.name.value, phone: fp.elements.phone.value }).then(function (j) {
      if (!j.ok) { busy(b, false, label); err.textContent = j.error; return; }
      claim().then(after);
    }).catch(function () { busy(b, false, label); err.textContent = 'No connection. Try again.'; });
  });
  var ed = document.getElementById('a-edit'); if (ed) ed.addEventListener('click', function () { fp.hidden = !fp.hidden; });
  var out = document.getElementById('a-out'); if (out) out.addEventListener('click', function () { post('logout').then(function () { location.href = '/'; }); });
  <?php if ($step === 'home'): ?>claim();<?php endif; ?>
})();
</script>
</body>
</html>
