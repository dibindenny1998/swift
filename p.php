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
$theme = $inv['theme'];
$themeName = THEMES[$theme]['name'] ?? $theme;
$planOpts = [
    'premium' => ['Live for 1 year. 15-photo gallery, a video, RSVPs, gift list, your song, 6 events, all designs, no ' . $brand . ' credit', $pp],
    'standard' => ['Live for 6 months. Up to 3 events, a cover photo, countdown, maps and calendar', $ps],
    'free' => ['Live for 3 months. Classic or Blush design, up to 2 events, countdown and maps. Small ' . $brand . ' credit', 0],
];
$defaultPlan = 'premium';
$gifts = $d['gifts'] ?? [];
$claims = [];
foreach (gift_claims((int)$inv['id']) as $c) $claims[$c['gift_id']] = $c;
$upgrades = [];
if ($paid) foreach (['standard', 'premium'] as $up) {
    if (PLAN_RANK[$up] > PLAN_RANK[$inv['plan']]) $upgrades[$up] = upgrade_price($inv, $up);
}

$cfg = [
    't' => $inv['token'], 'paid' => $paid, 'plan' => $inv['plan'], 'data' => $d,
    'prices' => ['free' => 0, 'standard' => $ps, 'premium' => $pp], 'upgrade' => $upgradeDiff, 'upgrades' => $upgrades, 'defaultPlan' => $defaultPlan,
    'rank' => PLAN_RANK, 'tierNames' => TIER_NAMES, 'live' => payments_live(), 'purchase' => $trackPurchase ? ['value' => $inv['amount'] / 100, 'id' => 'inv_' . $inv['id']] : null,
];
site_head(($paid ? 'Your invite is live' : 'Your invite preview') . ' | ' . $brand);
?>
<body>
<header class="top">
  <div class="wrap top-in">
    <a class="logo" href="/"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="12" cy="16" r="8.5" fill="none" stroke="#C9727F" stroke-width="2.6"/><circle cx="20" cy="16" r="8.5" fill="none" stroke="#B8913A" stroke-width="2.6"/></svg><?= e($brand) ?></a>
    <a class="btn small alt" href="/create?t=<?= e($inv['token']) ?>">Edit details</a>
  </div>
</header>

<main class="wrap owner">
<?php if (!$paid): ?>
  <section class="card intro">
    <h1>Here is your invite, <?= e($names) ?>.</h1>
    <p class="lead">Scroll through it and tap around. When you're happy, pick a plan to publish it and get the link to share.</p>
  </section>

  <section class="card design-card" id="design">
    <div class="design-head"><h2>Change design</h2><small id="design-msg" role="status"></small></div>
    <div class="design-strip">
      <?php foreach (showcase_themes() as $id => $t): $lock = $paid && !theme_allowed($id, $inv['plan']); ?>
        <button type="button" class="ds<?= $id === $theme ? ' on' : '' ?><?= $lock ? ' locked' : '' ?>" data-theme="<?= $id ?>" data-tier="<?= $t['tier'] ?>" aria-pressed="<?= $id === $theme ? 'true' : 'false' ?>">
          <img src="<?= asset('assets/img/designs/' . $id . '.jpg') ?>" alt="" width="232" height="480" loading="lazy"><span><?= e($t['name']) ?></span>
          <?php if ($t['tier'] !== 'standard'): ?><em class="tier tier-<?= $t['tier'] ?>"><?= TIER_NAMES[$t['tier']] ?></em><?php endif; ?>
        </button>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="card plans-card" id="plans">
    <h2>Publish your invite</h2>
    <div class="plan-opts" role="radiogroup" aria-label="Plan">
      <?php foreach ($planOpts as $k => [$desc, $amt]): $ok = theme_allowed($theme, $k); ?>
      <label class="plan-opt<?= $ok ? '' : ' off' ?>"><input type="radio" name="plan" value="<?= $k ?>"<?= $k === $defaultPlan ? ' checked' : '' ?><?= $ok ? '' : ' disabled' ?>>
        <div><b><?= PLAN_NAMES[$k] ?></b><span><?= e($desc) ?></span>
<small class="why"<?= $ok ? ' hidden' : '' ?>>Your design is a <span class="why-tier"><?= TIER_NAMES[theme_tier($theme)] ?></span> design. <a href="#design">Pick another design</a> to use this plan.</small></div>
        <em><?= $amt ? '₹' . $amt : 'Free' ?></em></label>
      <?php endforeach; ?>
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
    <?php $exp = invite_expiry($inv); $isExp = invite_expired($inv); ?>
    <p class="live-until<?= $isExp ? ' ended' : '' ?>"><?= $isExp ? 'This link ended on ' : 'Live until ' ?><b><?= date('j F Y', strtotime($exp)) ?></b> · <?= PLAN_NAMES[$inv['plan']] ?> plan (<?= plan_term($inv['plan']) ?>)<?php if ($isExp && $inv['plan'] !== 'premium'): ?>. Upgrade below to switch it back on.<?php elseif ($isExp): ?>. Message us on WhatsApp to renew it.<?php endif; ?></p>
    <div class="stats"><div><b><?= (int)$inv['views'] ?></b><span>Opens</span></div><div><b><?= $coming ?></b><span>Guests coming</span></div><div><b><?= $declined ?></b><span>Can't come</span></div></div>
    <p class="note" style="margin-top:18px">This page is your private edit link. Keep it safe and don't forward it.
      <?php if ($inv['phone']): ?><a href="https://wa.me/91<?= e($inv['phone']) ?>?text=<?= rawurlencode("My $brand edit link (private): $ownerUrl\nShare this one with guests: $live") ?>" target="_blank" rel="noopener">Send it to my WhatsApp</a><?php endif; ?></p>
    <?php if ($inv['is_demo']): ?><p class="demo">Published in test mode. No money was charged.</p><?php endif; ?>
  </section>

  <section class="card design-card" id="design">
    <div class="design-head"><h2>Change design</h2><small id="design-msg" role="status"></small></div>
    <div class="design-strip">
      <?php foreach (showcase_themes() as $id => $t): $lock = $paid && !theme_allowed($id, $inv['plan']); ?>
        <button type="button" class="ds<?= $id === $theme ? ' on' : '' ?><?= $lock ? ' locked' : '' ?>" data-theme="<?= $id ?>" data-tier="<?= $t['tier'] ?>" aria-pressed="<?= $id === $theme ? 'true' : 'false' ?>">
          <img src="<?= asset('assets/img/designs/' . $id . '.jpg') ?>" alt="" width="232" height="480" loading="lazy"><span><?= e($t['name']) ?></span>
          <?php if ($t['tier'] !== 'standard'): ?><em class="tier tier-<?= $t['tier'] ?>"><?= TIER_NAMES[$t['tier']] ?></em><?php endif; ?>
        </button>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="card plans-card">
    <?php if ($upgrades): ?>
      <h2>Get more from your website</h2>
      <p class="lead">You are on <?= PLAN_NAMES[$inv['plan']] ?>. Upgrade any time. Your link stays the same.</p>
      <div class="nav-btns" style="margin-top:18px">
        <?php if (isset($upgrades['premium'])): ?><button type="button" class="btn pay-btn js-up" data-plan="premium">Premium for ₹<?= $upgrades['premium'] ?></button><?php endif; ?>
        <?php if (isset($upgrades['standard'])): ?><button type="button" class="btn alt js-up" data-plan="standard">Standard for ₹<?= $upgrades['standard'] ?></button><?php endif; ?>
      </div>
      <p class="note" style="margin-top:14px">Premium adds RSVPs, a gift list, a 15-photo gallery, music, 6 events and all designs.</p>
      <p class="err" id="pay-err" role="alert" style="margin-top:10px"></p>
    <?php endif; ?>
    <?php if ($inv['plan'] === 'premium'): ?>
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

      <h2 style="margin-top:30px">Gift list</h2>
      <?php if (!$gifts): ?>
        <p class="lead">Add gifts you would love, and guests can reserve them. <a href="/create?t=<?= e($inv['token']) ?>">Add a gift list</a></p>
      <?php else: ?>
        <p class="lead"><?= count($claims) ?> of <?= count($gifts) ?> gifts reserved.</p>
        <table class="gift-table"><tbody>
        <?php foreach ($gifts as $g): $c = $claims[$g['id']] ?? null; ?>
          <tr><td><b><?= e($g['name']) ?></b><?= $g['note'] ? '<br><small>' . e($g['note']) . '</small>' : '' ?></td>
          <td><?php if ($c): ?><b><?= e($c['name']) ?></b><?= $c['phone'] ? '<br><a href="tel:' . e($c['phone']) . '">' . e($c['phone']) . '</a>' : '' ?><?= $c['message'] ? '<br><small>' . e($c['message']) . '</small>' : '' ?>
            <br><button type="button" class="linkbtn js-release" data-claim="<?= (int)$c['id'] ?>">Make available again</button>
          <?php else: ?><span class="free">Not picked yet</span><?php endif; ?></td></tr>
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
