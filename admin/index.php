<?php
require dirname(__DIR__) . '/lib/bootstrap.php';
header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');

$secure = str_starts_with(base_url(), 'https');
session_name('wladmin');
session_set_cookie_params(['lifetime' => 0, 'path' => '/admin', 'secure' => $secure, 'httponly' => true, 'samesite' => 'Lax']);
session_start();
if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = rand_hex(16);

function csrf_field(): string { return '<input type="hidden" name="csrf" value="' . e($_SESSION['csrf']) . '">'; }
function check_csrf(): void { if (!hash_equals($_SESSION['csrf'], (string)($_POST['csrf'] ?? ''))) { http_response_code(400); exit('Session expired. Go back and try again.'); } }
function admin_hash(): string { return setting('admin_hash') ?: ADMIN_DEFAULT_HASH; }

$flash = '';
$ip = substr((string)($_SERVER['REMOTE_ADDR'] ?? ''), 0, 64);

if (($_GET['logout'] ?? '') === '1') { session_destroy(); header('Location: /admin/'); exit; }

if (empty($_SESSION['admin'])) {
    $err = '';
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        check_csrf();
        $key = 'fail:' . $ip;
        [$n, $ts] = array_map('intval', explode('|', setting($key) ?: '0|0') + [0, 0]);
        if ($n >= 8 && time() - $ts < 900) {
            $err = 'Too many wrong attempts. Wait 15 minutes and try again.';
        } elseif (password_verify((string)($_POST['password'] ?? ''), admin_hash())) {
            session_regenerate_id(true);
            $_SESSION['admin'] = 1;
            set_setting($key, '0|0');
            header('Location: /admin/'); exit;
        } else {
            sleep(1);
            set_setting($key, (time() - $ts < 900 ? $n + 1 : 1) . '|' . time());
            $err = 'That password is not right.';
        }
    }
    site_head('Admin | ' . setting('brand'));
    echo '<body><main class="wrap" style="max-width:420px;padding:80px 0"><div class="card"><h1 style="font-size:2rem">Admin</h1>'
        . '<form method="post" style="margin-top:20px">' . csrf_field()
        . '<div class="field"><label for="pw">Password</label><input id="pw" type="password" name="password" autocomplete="current-password" required autofocus></div>'
        . ($err ? '<p class="err">' . e($err) . '</p>' : '')
        . '<button class="btn" style="width:100%">Log in</button></form></div></main></body></html>';
    exit;
}

$pdo = db();
$view = $_GET['v'] ?? 'dash';

/* ---------- actions ---------- */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $act = $_POST['act'] ?? '';
    if ($act === 'spend') {
        $day = preg_match('/^\d{4}-\d{2}-\d{2}$/', $_POST['day'] ?? '') ? $_POST['day'] : date('Y-m-d');
        $amt = (int)round((float)($_POST['amount'] ?? 0));
        if ($amt > 0) $pdo->prepare('INSERT INTO adspend (day, amount, note, created_at) VALUES (?,?,?,?)')->execute([$day, $amt, mb_substr(trim((string)($_POST['note'] ?? '')), 0, 80), now()]);
        header('Location: /admin/?saved=spend'); exit;
    }
    if ($act === 'spend_del') {
        $pdo->prepare('DELETE FROM adspend WHERE id = ?')->execute([(int)($_POST['id'] ?? 0)]);
        header('Location: /admin/'); exit;
    }
    if ($act === 'settings') {
        foreach (['brand', 'business_name', 'support_phone', 'support_email', 'address', 'pixel_id'] as $k) set_setting($k, mb_substr(trim((string)($_POST[$k] ?? '')), 0, 200));
        foreach (['price_standard', 'price_premium'] as $k) { $v = (int)($_POST[$k] ?? 0); if ($v >= 1) set_setting($k, (string)$v); }
        $kid = trim((string)($_POST['rzp_key_id'] ?? ''));
        if ($kid !== '') set_setting('rzp_key_id', $kid);
        foreach (['rzp_key_secret', 'rzp_webhook_secret', 'capi_token'] as $k) { $v = trim((string)($_POST[$k] ?? '')); if ($v !== '') set_setting($k, $v); }
        header('Location: /admin/?v=settings&saved=1'); exit;
    }
    if ($act === 'rzp_clear') {
        set_setting('rzp_key_id', ''); set_setting('rzp_key_secret', '');
        header('Location: /admin/?v=settings&saved=1'); exit;
    }
    if ($act === 'password') {
        $cur = (string)($_POST['current'] ?? ''); $new = (string)($_POST['new'] ?? '');
        if (!password_verify($cur, admin_hash())) { header('Location: /admin/?v=settings&pw=wrong'); exit; }
        if (mb_strlen($new) < 10) { header('Location: /admin/?v=settings&pw=short'); exit; }
        set_setting('admin_hash', password_hash($new, PASSWORD_DEFAULT));
        header('Location: /admin/?v=settings&pw=ok'); exit;
    }
}

/* ---------- metrics ---------- */
function metrics(string $from): array
{
    $pdo = db();
    $q = fn(string $sql, array $p = []) => (function () use ($pdo, $sql, $p) { $s = $pdo->prepare($sql); $s->execute($p); return $s->fetchColumn(); })();
    $rev = (int)$q("SELECT COALESCE(SUM(amount),0) FROM invites WHERE status='paid' AND is_demo=0 AND paid_at >= ?", [$from . ' 00:00:00']);
    $orders = (int)$q("SELECT COUNT(*) FROM invites WHERE status='paid' AND is_demo=0 AND paid_at >= ?", [$from . ' 00:00:00']);
    $drafts = (int)$q("SELECT COUNT(*) FROM invites WHERE created_at >= ?", [$from . ' 00:00:00']);
    $checkouts = (int)$q("SELECT COUNT(*) FROM invites WHERE checkout_at >= ?", [$from . ' 00:00:00']);
    $visits = (int)$q("SELECT COALESCE(SUM(landing),0) FROM visits WHERE day >= ?", [$from]);
    $spend = (int)$q("SELECT COALESCE(SUM(amount),0) FROM adspend WHERE day >= ?", [$from]);
    $fees = (int)round($rev * 0.0236);
    return ['rev' => $rev, 'orders' => $orders, 'drafts' => $drafts, 'checkouts' => $checkouts, 'visits' => $visits,
        'spend' => $spend * 100, 'fees' => $fees, 'profit' => $rev - $fees - $spend * 100];
}
function pct(int $a, int $b): string { return $b > 0 ? round($a * 100 / $b, 1) . '%' : '–'; }
function money(int $paise): string { return ($paise < 0 ? '−' : '') . rupees(abs($paise)); }

$ranges = ['today' => [date('Y-m-d'), 'Today'], '7' => [date('Y-m-d', strtotime('-6 days')), 'Last 7 days'], '30' => [date('Y-m-d', strtotime('-29 days')), 'Last 30 days'], 'all' => ['2000-01-01', 'All time']];
$r = isset($ranges[$_GET['r'] ?? '']) ? $_GET['r'] : '7';

site_head('Admin | ' . setting('brand'));
?>
<body>
<style>
  .adm-nav { display: flex; gap: 6px; flex-wrap: wrap; }
  .adm-nav a { padding: 8px 14px; border-radius: 99px; text-decoration: none; color: var(--plum); font-weight: 600; font-size: .95rem; }
  .adm-nav a.on { background: var(--plum); color: #fff; }
  .adm { padding: 26px 0 80px; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 18px 0 26px; }
  .kpi { background: #fff; border-radius: 18px; padding: 18px; box-shadow: 0 0 0 1px var(--line); }
  .kpi span { font-size: .88rem; color: var(--plum-2); }
  .kpi b { display: block; font-family: var(--display); font-weight: 400; font-size: 2rem; line-height: 1.15; }
  .kpi small { color: var(--plum-2); }
  .kpi.big { background: var(--plum); color: #fff; }
  .kpi.big span, .kpi.big small { color: #F2D9DF; }
  .kpi.good b { color: var(--leaf); } .kpi.bad b { color: var(--kumkum); }
  .tbl { width: 100%; border-collapse: collapse; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 0 0 1px var(--line); font-size: .95rem; }
  .tbl th, .tbl td { padding: 10px 12px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
  .tbl th { font-size: .82rem; color: var(--plum-2); background: #FFF8F9; }
  .tbl td.n, .tbl th.n { text-align: right; font-variant-numeric: tabular-nums; }
  .scroll { overflow-x: auto; }
  .chips2 { display: flex; gap: 6px; flex-wrap: wrap; }
  .chips2 a { padding: 6px 14px; border-radius: 99px; box-shadow: 0 0 0 1px var(--line); text-decoration: none; color: var(--plum); font-size: .92rem; background: #fff; }
  .chips2 a.on { box-shadow: 0 0 0 2px var(--kumkum); font-weight: 700; }
  .inline-form { display: flex; gap: 10px; flex-wrap: wrap; align-items: end; }
  .inline-form .field { margin: 0; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 18px; }
  .pill { display: inline-block; padding: 1px 8px; border-radius: 99px; font-size: .78rem; font-weight: 600; background: var(--rose-2); }
  .pill.ok { background: #DFF2E5; color: var(--leaf); }
  .linkbtn { background: none; border: 0; color: var(--kumkum); cursor: pointer; font: inherit; padding: 0; text-decoration: underline; }
  h2.sub { font-size: 1.6rem; margin: 30px 0 12px; }
  @media (max-width: 800px) { .kpis { grid-template-columns: 1fr 1fr; } .grid2 { grid-template-columns: 1fr; } }
</style>
<header class="top"><div class="wrap top-in">
  <a class="logo" href="/admin/"><?= e(setting('brand')) ?> admin</a>
  <nav class="adm-nav">
    <a href="/admin/" class="<?= $view === 'dash' ? 'on' : '' ?>">Money</a>
    <a href="/admin/?v=orders" class="<?= $view === 'orders' ? 'on' : '' ?>">Orders</a>
    <a href="/admin/?v=leads" class="<?= $view === 'leads' ? 'on' : '' ?>">Unpaid</a>
    <a href="/admin/?v=settings" class="<?= $view === 'settings' ? 'on' : '' ?>">Settings</a>
    <a href="/admin/?logout=1">Log out</a>
  </nav>
</div></header>
<main class="wrap adm">
<?php if (!payments_live()): ?>
  <p class="demo" style="margin-bottom:18px"><b>Payments are in test mode.</b> Customers can publish without paying. Add your Razorpay keys in <a href="/admin/?v=settings">Settings</a> before you run ads.</p>
<?php endif; ?>

<?php if ($view === 'dash'):
    $m = metrics($ranges[$r][0]);
    $roas = $m['spend'] > 0 ? round($m['rev'] / $m['spend'], 2) . 'x' : '–';
?>
  <div class="chips2"><?php foreach ($ranges as $k => $v): ?><a class="<?= $k === $r ? 'on' : '' ?>" href="/admin/?r=<?= $k ?>"><?= $v[1] ?></a><?php endforeach; ?></div>
  <div class="kpis">
    <div class="kpi big"><span>Profit after ads and fees</span><b><?= money($m['profit']) ?></b><small>Revenue minus ad spend minus Razorpay fees</small></div>
    <div class="kpi"><span>Revenue</span><b><?= money($m['rev']) ?></b><small><?= $m['orders'] ?> paid orders</small></div>
    <div class="kpi"><span>Ad spend</span><b><?= money($m['spend']) ?></b><small>Entered by you below</small></div>
    <div class="kpi <?= $m['spend'] > 0 ? ($m['rev'] >= $m['spend'] ? 'good' : 'bad') : '' ?>"><span>Return on ad spend</span><b><?= $roas ?></b><small>Above 1x means ads pay for themselves</small></div>
    <div class="kpi"><span>Visitors</span><b><?= $m['visits'] ?></b><small>Landing page views</small></div>
    <div class="kpi"><span>Invites started</span><b><?= $m['drafts'] ?></b><small><?= pct($m['drafts'], $m['visits']) ?> of visitors</small></div>
    <div class="kpi"><span>Opened payment</span><b><?= $m['checkouts'] ?></b><small><?= pct($m['checkouts'], $m['drafts']) ?> of invites started</small></div>
    <div class="kpi"><span>Paid</span><b><?= $m['orders'] ?></b><small><?= pct($m['orders'], $m['visits']) ?> of visitors</small></div>
  </div>

  <div class="card">
    <h2>Add today's ad spend</h2>
    <p class="lead">Copy the amount spent from Meta Ads Manager each day, so profit stays accurate.</p>
    <form method="post" class="inline-form" style="margin-top:14px"><?= csrf_field() ?><input type="hidden" name="act" value="spend">
      <div class="field"><label for="day">Date</label><input id="day" type="date" name="day" value="<?= date('Y-m-d') ?>"></div>
      <div class="field"><label for="amount">Amount (₹)</label><input id="amount" type="number" name="amount" min="1" step="1" inputmode="numeric" required></div>
      <div class="field"><label for="note">Campaign (optional)</label><input id="note" name="note" maxlength="80"></div>
      <button class="btn">Add spend</button>
    </form>
  </div>

  <h2 class="sub">Last 14 days</h2>
  <div class="scroll"><table class="tbl"><thead><tr><th>Day</th><th class="n">Visitors</th><th class="n">Started</th><th class="n">Paid</th><th class="n">Revenue</th><th class="n">Ad spend</th><th class="n">Profit</th></tr></thead><tbody>
  <?php for ($i = 0; $i < 14; $i++):
      $day = date('Y-m-d', strtotime("-$i days"));
      $s = $pdo->prepare("SELECT COALESCE(SUM(amount),0) rev, COUNT(*) n FROM invites WHERE status='paid' AND is_demo=0 AND substr(paid_at,1,10)=?"); $s->execute([$day]); $p = $s->fetch();
      $s = $pdo->prepare("SELECT COUNT(*) FROM invites WHERE substr(created_at,1,10)=?"); $s->execute([$day]); $dr = (int)$s->fetchColumn();
      $s = $pdo->prepare("SELECT COALESCE(SUM(landing),0) FROM visits WHERE day=?"); $s->execute([$day]); $vi = (int)$s->fetchColumn();
      $s = $pdo->prepare("SELECT COALESCE(SUM(amount),0) FROM adspend WHERE day=?"); $s->execute([$day]); $sp = (int)$s->fetchColumn() * 100;
      $pr = (int)$p['rev'] - (int)round($p['rev'] * 0.0236) - $sp;
  ?>
    <tr><td><?= date('D j M', strtotime($day)) ?></td><td class="n"><?= $vi ?></td><td class="n"><?= $dr ?></td><td class="n"><?= (int)$p['n'] ?></td><td class="n"><?= money((int)$p['rev']) ?></td><td class="n"><?= money($sp) ?></td><td class="n" style="color:<?= $pr >= 0 ? 'var(--leaf)' : 'var(--kumkum)' ?>"><?= money($pr) ?></td></tr>
  <?php endfor; ?>
  </tbody></table></div>

  <h2 class="sub">Ad spend entries</h2>
  <?php $rows = $pdo->query('SELECT * FROM adspend ORDER BY day DESC, id DESC LIMIT 60')->fetchAll(); ?>
  <?php if (!$rows): ?><p class="lead">No ad spend entered yet.</p><?php else: ?>
  <div class="scroll"><table class="tbl"><thead><tr><th>Day</th><th>Campaign</th><th class="n">Amount</th><th></th></tr></thead><tbody>
  <?php foreach ($rows as $row): ?>
    <tr><td><?= e($row['day']) ?></td><td><?= e($row['note']) ?></td><td class="n"><?= rupees((int)$row['amount'] * 100) ?></td>
    <td><form method="post"><?= csrf_field() ?><input type="hidden" name="act" value="spend_del"><input type="hidden" name="id" value="<?= (int)$row['id'] ?>"><button class="linkbtn">Remove</button></form></td></tr>
  <?php endforeach; ?></tbody></table></div><?php endif; ?>

<?php elseif ($view === 'orders'):
    $rows = $pdo->query("SELECT * FROM invites WHERE status='paid' ORDER BY paid_at DESC LIMIT 300")->fetchAll();
?>
  <h1 style="font-size:2.4rem">Orders</h1>
  <?php if (!$rows): ?><p class="lead" style="margin-top:12px">No orders yet. They appear here the moment someone pays.</p><?php else: ?>
  <div class="scroll" style="margin-top:18px"><table class="tbl"><thead><tr><th>Paid</th><th>Couple</th><th>Plan</th><th class="n">Amount</th><th>Phone</th><th>Campaign</th><th class="n">Opens</th><th>Links</th></tr></thead><tbody>
  <?php foreach ($rows as $row): $dd = invite_data($row); ?>
    <tr><td><?= date('j M, g:i a', strtotime($row['paid_at'])) ?></td><td><b><?= e(invite_title($dd)) ?></b></td>
    <td><?= e(ucfirst($row['plan'])) ?> <?= $row['is_demo'] ? '<span class="pill">Test</span>' : '<span class="pill ok">Paid</span>' ?></td>
    <td class="n"><?= $row['is_demo'] ? '–' : rupees((int)$row['amount']) ?></td>
    <td><a href="https://wa.me/91<?= e($row['phone']) ?>" target="_blank" rel="noopener"><?= e($row['phone']) ?></a></td>
    <td><?= e($row['utm_campaign'] ?: $row['utm_source']) ?></td><td class="n"><?= (int)$row['views'] ?></td>
    <td><a href="/i/<?= e($row['slug']) ?>" target="_blank" rel="noopener">Invite</a> · <a href="/p/<?= e($row['token']) ?>" target="_blank" rel="noopener">Owner page</a></td></tr>
  <?php endforeach; ?></tbody></table></div><?php endif; ?>

<?php elseif ($view === 'leads'):
    $rows = $pdo->query("SELECT * FROM invites WHERE status!='paid' ORDER BY created_at DESC LIMIT 300")->fetchAll();
?>
  <h1 style="font-size:2.4rem">Unpaid invites</h1>
  <p class="lead" style="margin-top:8px;max-width:44em">These couples built an invite but didn't pay. A friendly WhatsApp message within a day often brings them back.</p>
  <?php if (!$rows): ?><p class="lead" style="margin-top:12px">None yet.</p><?php else: ?>
  <div class="scroll" style="margin-top:18px"><table class="tbl"><thead><tr><th>Started</th><th>Couple</th><th>Wedding date</th><th>Phone</th><th>Opened payment</th><th>Follow up</th></tr></thead><tbody>
  <?php foreach ($rows as $row):
      $dd = invite_data($row); $ev = sorted_events($dd)[0] ?? null;
      $msg = "Hi! Your wedding invite for " . invite_title($dd) . " is saved and ready. You can publish it and get your link here: " . base_url() . '/p/' . $row['token'] . "\n\nAny questions, just reply here.";
  ?>
    <tr><td><?= date('j M, g:i a', strtotime($row['created_at'])) ?></td><td><b><?= e(invite_title($dd)) ?></b><br><a href="/p/<?= e($row['token']) ?>" target="_blank" rel="noopener">View</a></td>
    <td><?= $ev ? e(date('j M Y', strtotime($ev['date']))) : '–' ?></td><td><?= e($row['phone']) ?></td><td><?= $row['checkout_at'] ? 'Yes' : 'No' ?></td>
    <td><a class="btn small wa-btn" style="width:auto" href="https://wa.me/91<?= e($row['phone']) ?>?text=<?= rawurlencode($msg) ?>" target="_blank" rel="noopener">WhatsApp</a></td></tr>
  <?php endforeach; ?></tbody></table></div><?php endif; ?>

<?php else: /* settings */ ?>
  <h1 style="font-size:2.4rem">Settings</h1>
  <?php if (!empty($_GET['saved'])): ?><p class="note" style="margin-top:12px">Saved.</p><?php endif; ?>
  <?php if (($_GET['pw'] ?? '') === 'ok'): ?><p class="note" style="margin-top:12px">Password changed.</p><?php elseif (($_GET['pw'] ?? '') === 'wrong'): ?><p class="err" style="margin-top:12px">Current password was not right.</p><?php elseif (($_GET['pw'] ?? '') === 'short'): ?><p class="err" style="margin-top:12px">Use at least 10 characters.</p><?php endif; ?>
  <form method="post" style="margin-top:18px"><?= csrf_field() ?><input type="hidden" name="act" value="settings">
    <div class="card">
      <h2>Razorpay</h2>
      <p class="lead">From Razorpay Dashboard, Account &amp; Settings, API Keys. Use test keys first, then live keys after KYC.</p>
      <p style="margin:12px 0"><?= payments_live() ? '<span class="pill ok">Connected: ' . e(substr(setting('rzp_key_id'), 0, 13)) . '…</span>' : '<span class="pill">Not connected</span>' ?></p>
      <div class="grid2">
        <div class="field"><label for="k1">Key ID</label><input id="k1" name="rzp_key_id" placeholder="<?= e(setting('rzp_key_id') ?: 'rzp_live_…') ?>" autocomplete="off"></div>
        <div class="field"><label for="k2">Key secret</label><input id="k2" name="rzp_key_secret" type="password" placeholder="<?= setting('rzp_key_secret') ? 'Saved. Type to replace' : '' ?>" autocomplete="new-password"></div>
      </div>
      <div class="field"><label for="k3">Webhook secret</label><input id="k3" name="rzp_webhook_secret" type="password" placeholder="<?= setting('rzp_webhook_secret') ? 'Saved. Type to replace' : 'Any strong text you also enter in Razorpay' ?>" autocomplete="new-password">
        <small>In Razorpay, add a webhook to <b><?= e(base_url()) ?>/api.php?a=webhook</b> with events order.paid and payment.captured. This publishes invites even if a customer closes the page right after paying.</small></div>
    </div>
    <div class="card" style="margin-top:18px">
      <h2>Prices</h2>
      <div class="grid2">
        <div class="field"><label for="pr1">Standard (₹)</label><input id="pr1" name="price_standard" type="number" min="1" value="<?= e(setting('price_standard')) ?>"></div>
        <div class="field"><label for="pr2">Premium (₹)</label><input id="pr2" name="price_premium" type="number" min="1" value="<?= e(setting('price_premium')) ?>"></div>
      </div>
    </div>
    <div class="card" style="margin-top:18px">
      <h2>Meta ads tracking</h2>
      <div class="grid2">
        <div class="field"><label for="px">Pixel ID</label><input id="px" name="pixel_id" inputmode="numeric" value="<?= e(setting('pixel_id')) ?>"><small>Sends PageView, ViewContent, Lead, InitiateCheckout and Purchase with the amount.</small></div>
        <div class="field"><label for="capi">Conversions API token (optional)</label><input id="capi" name="capi_token" type="password" placeholder="<?= setting('capi_token') ? 'Saved. Type to replace' : '' ?>" autocomplete="new-password"><small>Also reports purchases from the server, which survives ad blockers and iPhone tracking limits.</small></div>
      </div>
    </div>
    <div class="card" style="margin-top:18px">
      <h2>Business details</h2>
      <p class="lead">Shown on the Contact, Terms, Privacy and Refund pages. Razorpay checks these pages during KYC.</p>
      <div class="grid2" style="margin-top:12px">
        <div class="field"><label for="b1">Brand name</label><input id="b1" name="brand" value="<?= e(setting('brand')) ?>"></div>
        <div class="field"><label for="b2">Legal business name</label><input id="b2" name="business_name" value="<?= e(setting('business_name')) ?>"></div>
        <div class="field"><label for="b3">Support WhatsApp number</label><input id="b3" name="support_phone" inputmode="tel" value="<?= e(setting('support_phone')) ?>"></div>
        <div class="field"><label for="b4">Support email</label><input id="b4" name="support_email" type="email" value="<?= e(setting('support_email')) ?>"></div>
      </div>
      <div class="field"><label for="b5">Address</label><input id="b5" name="address" value="<?= e(setting('address')) ?>"></div>
    </div>
    <button class="btn" style="margin-top:18px">Save settings</button>
  </form>

  <?php if (payments_live()): ?>
  <form method="post" style="margin-top:14px"><?= csrf_field() ?><input type="hidden" name="act" value="rzp_clear"><button class="linkbtn">Disconnect Razorpay (back to test mode)</button></form>
  <?php endif; ?>

  <form method="post" class="card" style="margin-top:28px"><?= csrf_field() ?><input type="hidden" name="act" value="password">
    <h2>Change admin password</h2>
    <div class="grid2" style="margin-top:12px">
      <div class="field"><label for="c1">Current password</label><input id="c1" name="current" type="password" autocomplete="current-password" required></div>
      <div class="field"><label for="c2">New password</label><input id="c2" name="new" type="password" minlength="10" autocomplete="new-password" required></div>
    </div>
    <button class="btn alt">Change password</button>
  </form>
<?php endif; ?>
</main>
</body>
</html>
