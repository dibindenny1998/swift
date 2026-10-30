<?php
require __DIR__ . '/lib/bootstrap.php';
header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');

$token = (string)($_GET['t'] ?? '');
$inv = preg_match('/^[a-f0-9]{32}$/', $token) ? find_invite('token', $token) : null;
if (!$inv) { http_response_code(404); header('Location: /'); exit; }

$brand = setting('brand');
$d = public_payload($inv);
$d['brand'] = $brand;
$paid = $inv['status'] === 'paid';
$names = invite_title($d);
$live = base_url() . '/i/' . $inv['slug'];
$ownerUrl = base_url() . '/p/' . $inv['token'];
$ps = price('standard'); $pp = price('premium');
$tick = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

$rsvps = [];
if ($paid) {
    $st = db()->prepare('SELECT * FROM rsvps WHERE invite_id = ? ORDER BY id DESC');
    $st->execute([$inv['id']]);
    $rsvps = $st->fetchAll();
}
$coming = array_sum(array_map(fn($r) => $r['attending'] ? (int)$r['guests'] : 0, $rsvps));
$declined = count(array_filter($rsvps, fn($r) => !$r['attending']));
$trackPurchase = $paid && !$inv['purchase_tracked'] && !$inv['is_demo'];
$upgradeDiff = max(0, $pp - $ps);

$cfg = [
    't' => $inv['token'], 'paid' => $paid, 'plan' => $inv['plan'], 'data' => $d,
    'prices' => ['standard' => $ps, 'premium' => $pp], 'upgrade' => $upgradeDiff,
    'live' => payments_live(), 'purchase' => $trackPurchase ? ['value' => $inv['amount'] / 100, 'id' => 'inv_' . $inv['id']] : null,
];
site_head(($paid ? 'Your invite is live' : 'Your invite preview') . ' | ' . $brand);
?>
<body>
<header class="top">
  <div class="wrap top-in">
    <a class="logo" href="/"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="12" cy="16" r="8.5" fill="none" stroke="#C2183F" stroke-width="2.6"/><circle cx="20" cy="16" r="8.5" fill="none" stroke="#B8913A" stroke-width="2.6"/></svg><?= e($brand) ?></a>
    <a class="btn small alt" href="/create?t=<?= e($inv['token']) ?>">Edit details</a>
  </div>
</header>

<main class="wrap owner">
<?php if (!$paid): ?>
  <section class="card intro">
    <h1>Here is your invite, <?= e($names) ?>.</h1>
    <p class="lead">Scroll through it and tap around. When you're happy, pick a plan to publish it and get the link to share.</p>
  </section>

  <section class="card plans-card" id="plans">
    <h2>Publish your invite</h2>
    <div class="plan-opts" role="radiogroup" aria-label="Plan">
      <label class="plan-opt"><input type="radio" name="plan" value="premium" checked>
        <div><b>Premium</b><span>RSVPs with headcount, up to 15 photos, your song, 6 events, no <?= e($brand) ?> credit</span></div><em>₹<?= $pp ?></em></label>
      <label class="plan-opt"><input type="radio" name="plan" value="standard">
        <div><b>Basic</b><span>Up to 3 events, 4 photos, countdown, maps and calendar</span></div><em>₹<?= $ps ?></em></label>
    </div>
    <button type="button" class="btn pay-btn" id="pay">Pay ₹<?= $pp ?> and publish</button>
    <p class="err" id="pay-err" role="alert" style="margin-top:10px"></p>
    <p class="safe"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2l6 3v5c0 4-3 7-6 8-3-1-6-4-6-8V5l6-3z" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>UPI, cards and net banking via Razorpay</p>
    <?php if (!payments_live()): ?><p class="demo"><b>Test mode.</b> Payments are not connected yet, so the button publishes without charging. Add Razorpay keys in the admin panel to go live.</p><?php endif; ?>
    <p class="lead" style="font-size:.92rem;margin-top:16px">Your invite is saved. Bookmark this page to come back to it later.</p>
  </section>
<?php else: ?>
  <section class="card intro">
    <h1>Your invite is live.</h1>
    <p class="lead">Share this link with your guests. Changes you make later show up on the same link.</p>
    <div class="linkbox"><input id="link" value="<?= e($live) ?>" readonly aria-label="Your invite link"><button type="button" class="btn small" id="copy">Copy</button></div>
    <a class="btn wa-btn" href="https://wa.me/?text=<?= rawurlencode("We're getting married! Here is our invitation, with the dates, venues and directions:\n" . $live) ?>" target="_blank" rel="noopener">Share on WhatsApp</a>
    <div class="nav-btns" style="margin-top:12px"><a class="btn alt small" href="<?= e($live) ?>" target="_blank" rel="noopener">Open invite</a><a class="btn alt small" href="/create?t=<?= e($inv['token']) ?>">Edit details</a></div>
    <div class="stats"><div><b><?= (int)$inv['views'] ?></b><span>Opens</span></div><div><b><?= $coming ?></b><span>Guests coming</span></div><div><b><?= $declined ?></b><span>Can't come</span></div></div>
    <p class="note" style="margin-top:18px">This page is your private edit link. Keep it safe and don't forward it.
      <?php if ($inv['phone']): ?><a href="https://wa.me/91<?= e($inv['phone']) ?>?text=<?= rawurlencode("My $brand edit link (private): $ownerUrl\nShare this one with guests: $live") ?>" target="_blank" rel="noopener">Send it to my WhatsApp</a><?php endif; ?></p>
    <?php if ($inv['is_demo']): ?><p class="demo">Published in test mode. No money was charged.</p><?php endif; ?>
  </section>

  <section class="card plans-card">
    <?php if ($inv['plan'] === 'standard'): ?>
      <h2>Add RSVPs, a gallery and your song</h2>
      <p class="lead">Upgrade to Premium for ₹<?= $upgradeDiff ?>. Your link stays the same.</p>
      <button type="button" class="btn pay-btn" id="upgrade" style="margin-top:18px">Upgrade for ₹<?= $upgradeDiff ?></button>
      <p class="err" id="pay-err" role="alert" style="margin-top:10px"></p>
    <?php else: ?>
      <h2>RSVPs</h2>
      <?php if (!$rsvps): ?>
        <p class="lead">Replies from guests will appear here.</p>
      <?php else: ?>
        <table class="rsvp-list"><thead><tr><th>Guest</th><th>Reply</th><th>Note</th></tr></thead><tbody>
        <?php foreach ($rsvps as $r): ?>
          <tr><td><b><?= e($r['name']) ?></b><?= $r['phone'] ? '<br><a href="tel:' . e($r['phone']) . '">' . e($r['phone']) . '</a>' : '' ?></td>
          <td><?= $r['attending'] ? 'Coming, ' . (int)$r['guests'] : 'Can\'t come' ?></td><td><?= e($r['message']) ?></td></tr>
        <?php endforeach; ?></tbody></table>
      <?php endif; ?>
    <?php endif; ?>
  </section>
<?php endif; ?>

  <aside class="stage" aria-label="Invite preview">
    <div class="phone"><iframe id="pv" src="/frame.php" title="Your invite"></iframe></div>
  </aside>
</main>
<?php if (!$paid): ?><div class="mobile-pay"><a class="btn" href="#plans" id="m-pay">Pay ₹<?= $pp ?> and publish</a></div><?php endif; ?>
<?php if (!empty($_GET['saved'])): ?><div class="toast" role="status" id="toast">Changes saved</div><?php endif; ?>

<script>window.WL_OWNER = <?= json_for_script($cfg) ?>;</script>
<script src="<?= asset('assets/owner.js') ?>"></script>
</body>
</html>
