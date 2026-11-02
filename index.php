<?php
require __DIR__ . '/lib/bootstrap.php';
count_visit('landing');
$brand = setting('brand');
$ps = price('standard');
$pp = price('premium');
$tick = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
$swatch = [
 'lumiere' => 'linear-gradient(180deg,#B89A72 0 60%,#FBF8F3 60%)', 'journal' => 'linear-gradient(180deg,#E2C3BF 0 55%,#FBF6EE 55%)', 'vogue' => 'linear-gradient(180deg,#6E6152 0 70%,#F7F5F1 70%)',
    'sage' => 'radial-gradient(circle at 30% 30%,#A7B293 0 24%,#F6F3EA 25%)', 'seal' => 'radial-gradient(circle at 50% 55%,#C9A24A 0 20%,#D6C09E 21%)',
    'ink' => 'radial-gradient(circle at 50% 50%,#5A2E2A 0 14%,#F7F2EA 15%)', 'toile' => 'linear-gradient(135deg,#F8F6F0 0 55%,#2F4A7A 55%)',
    'classic' => 'linear-gradient(135deg,#FBF8F2 0 60%,#1E1E1E 60%)', 'blush' => 'radial-gradient(circle at 50% 40%,#E7A5AF 0 22%,#FDF1F2 23%)',
    'champagne' => 'linear-gradient(135deg,#FBE6E3,#F3E1C8)', 'kasavu' => 'linear-gradient(90deg,#C9A227 0 20%,#FBF7EC 20% 80%,#C9A227 80%)',
    'noor' => 'radial-gradient(circle at 50% 35%,#E3C26E 0 14%,#145A44 15%)', 'chapel' => 'linear-gradient(160deg,#3B5BA9,#C9506E 55%,#E7A93C)',
    'sindoor' => 'radial-gradient(circle at 50% 40%,#E9C46A 0 16%,#C9727F 17%)', 'kesar' => 'linear-gradient(135deg,#F4A21C 0 30%,#172C6E 30%)',
    'gopuram' => 'linear-gradient(180deg,#E8C26A 0 35%,#5E1020 35%)', 'velvet' => 'radial-gradient(circle at 50% 100%,#E5C37A 0 30%,#4A5739 31%)',
    'qamar' => 'radial-gradient(circle at 65% 35%,#F5DFA8 0 15%,#1B1440 16%)', 'grace' => 'linear-gradient(135deg,#DCE6EE,#8EA3B6)',
    'marigold' => 'radial-gradient(circle at 30% 30%,#F7B500 0 22%,transparent 23%),radial-gradient(circle at 70% 30%,#F07B0A 0 22%,transparent 23%),#FFF1C9',
    'nilavu' => 'radial-gradient(circle at 68% 32%,#F6E7B8 0 14%,#13214A 15%)', 'mullappoo' => 'radial-gradient(circle,#fff 0 22%,#CFE3D4 23% 30%,#F2F8F3 31%)',
    'thamara' => 'radial-gradient(ellipse at 50% 70%,#F3B3C1 0 30%,#F1F2EA 31%)', 'mayil' => 'radial-gradient(circle at 50% 45%,#173E8C 0 12%,#0F9AA0 13% 22%,#E2C46F 23% 28%,#0D4651 29%)',
    'jaipur' => 'linear-gradient(180deg,#F6D2C6 0 55%,#E9A99A 55%)', 'gulmohar' => 'radial-gradient(circle at 40% 40%,#E2401C 0 20%,#FFF4E6 21%)',
];
$counts = array_fill_keys(array_keys(CATEGORIES), 0);
foreach (THEMES as $t) foreach ($t['tags'] as $tag) $counts[$tag]++;
$catNotes = ['hindu' => 'Temple, mandap and Kerala weddings', 'christian' => 'Church weddings and betrothals', 'muslim' => 'Nikah and walima', 'sikh' => 'Anand Karaj', 'kerala' => 'Kasavu, jasmine and temple gold', 'modern' => 'For every faith and none'];
$ogSlot = slot_url('og');
$nThemes = count(THEMES);
$pb = price('biodata');
$customFrom = trim(setting('custom_from'));
site_head('Free Wedding Website & Invitation Maker for WhatsApp | ' . $brand,
    "Make a free wedding website in 5 minutes: your invitation, every event with Google Maps, countdown, RSVP and gift list in one WhatsApp link. Hindu, Christian, Muslim and Sikh designs. Free marriage biodata maker too.",
    $ogSlot ?: '/assets/og/site.jpg', '', ['path' => '/', 'jsonld' => [ld_org(), ld_website(),
        ld_app($brand . ' wedding website maker', 'Make a free wedding invitation website to share on WhatsApp, with events, maps, countdown, RSVP, gift list and photos.', '/',
            ['Free wedding website', 'Wedding invitation for WhatsApp', 'Google Maps directions for every event', 'Countdown', 'RSVP and guest list', 'Gift list', 'Photo gallery and music', 'Hindu, Christian, Muslim, Sikh and Kerala designs'],
            [['Basic (free)', 0], ['Standard', $ps], ['Premium', $pp]])]]);
?>
<body>
<div class="resume" id="resume" hidden><div class="wrap"><span>Your invite is saved.</span><a id="resume-link" href="#">Continue where you left off</a></div></div>
<?php site_header(); ?>

<main>
  <section class="hero lux-hero">
    <?= slot_img('hero', '', '', false) ?>
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <h1 class="eyebrow"><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="3.5" width="15" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M2.5 7.5h15" stroke="currentColor" stroke-width="1.8"/></svg>Free wedding website &amp; invitation maker</h1>
        <div class="hero-title">
          <span class="pre">A wedding website for</span>
          <span class="names" id="names"><label class="sr" for="n1">First name</label><span class="name-box hint"><input class="name-in" id="n1" value="Arjun" maxlength="24" autocomplete="off" spellcheck="false"><i class="name-caret" aria-hidden="true"></i><svg class="name-pen" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 17l3.5-1 9-9-2.5-2.5-9 9L3 17z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span><span class="amp">&amp;</span><label class="sr" for="n2">Second name</label><span class="name-box"><input class="name-in" id="n2" value="Meera" maxlength="24" autocomplete="off" spellcheck="false"><i class="name-caret" aria-hidden="true"></i><svg class="name-pen" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 17l3.5-1 9-9-2.5-2.5-9 9L3 17z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span></span>
        </div>
        <p class="hero-hint"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 17l3.5-1 9-9-2.5-2.5-9 9L3 17z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>Tap the names and type yours. Your website changes as you type.</p>
        <p class="hero-lead">Send one link on WhatsApp instead of a printed card. Your invitation, venues, countdown and RSVP in one beautiful page.</p>
        <div class="hero-cta">
          <a class="btn js-make" href="/create">Make our wedding website</a>
          <small>Free plan available. Paid from ₹<?= $ps ?>, one time.</small>
        </div>
        <ul class="ticks">
          <li><?= $tick ?>Free plan, no card needed</li>
          <li><?= $tick ?>Ready in 5 minutes</li>
          <li><?= $tick ?>Opens straight from WhatsApp</li>
        </ul>
      </div>
      <div class="stage">
        <div class="fan">
          <div class="phone back l" aria-hidden="true"><img src="/assets/img/designs/noor.jpg" alt="" width="232" height="480"></div>
          <div class="phone back r" aria-hidden="true"><img src="/assets/img/designs/chapel.jpg" alt="" width="232" height="480"></div>
          <div class="phone front"><iframe id="demo" src="/frame.php" title="Live invite preview" loading="eager"></iframe></div>
        </div>
        <div class="url-pill-wrap"><span class="url-pill"><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="9" width="12" height="8" rx="2" fill="currentColor"/><path d="M7 9V6.5a3 3 0 016 0V9" fill="none" stroke="currentColor" stroke-width="1.8"/></svg><?php $host = preg_replace('#^https?://#', '', base_url()); ?><span><?= strlen($host) > 24 ? '…' : e($host) ?>/i/<b id="url-names">arjun-meera</b></span></span></div>
        <?php $heroPick = ['champagne', 'kasavu', 'noor', 'sage', 'seal', 'lumiere']; ?>
        <div class="style-pills" role="group" aria-label="Try a design">
          <?php foreach ($heroPick as $id): ?>
            <button type="button" class="sw2" data-theme="<?= $id ?>" data-name="<?= e(THEMES[$id]['name']) ?>" aria-pressed="<?= $id === 'champagne' ? 'true' : 'false' ?>"><i style="background:<?= $swatch[$id] ?>"></i><?= e(THEMES[$id]['name']) ?></button>
          <?php endforeach; ?>
          <a class="more-chip" href="/designs">+<?= count(THEMES) - count($heroPick) ?> more</a>
        </div>
        <p class="design-now sr" aria-live="polite">Design: <b id="design-name">Champagne</b></p>
      </div>
    </div>
  </section>

<?php sec_designs(6); ?>

  <section class="sec">
    <div class="wrap">
      <div class="quick">
        <div><b>Maps to every venue</b><span>One tap opens Google Maps</span></div>
        <div><b>Live countdown</b><span>Right under your names</span></div>
        <div><b>RSVP and gift list</b><span>Know who is coming and what they bring</span></div>
        <div><b>Edit any time</b><span>The same link updates for everyone</span></div>
      </div>
    </div>
  </section>

  <section class="sec band">
    <div class="wrap">
      <div class="sec-head"><h2>How it works</h2></div>
      <ol class="steps">
        <li><h3>Pick a design</h3><p>Switch any time before you share.</p></li>
        <li><h3>Add your details</h3><p>The preview updates as you type.</p></li>
        <li><h3>Publish and share</h3><p>Free, or pay once for more. Send the link on WhatsApp.</p></li>
      </ol>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="sec-head"><h2>Simple plans, paid once</h2><p>Build and preview free. Pay only when you want more.</p></div>
      <div class="mini-plans" id="mini-plans">
        <a class="mp" href="/create?t=classic">
          <span class="mp-name">Basic</span><b class="mp-price">Free</b>
          <ul><li>2 simple designs</li><li>Up to 2 events with maps</li><li>Countdown</li><li class="no">Small WedLink credit</li></ul>
          <span class="mp-go">Start free</span>
        </a>
        <a class="mp" href="/create">
          <span class="mp-name">Standard</span><b class="mp-price">₹<?= $ps ?></b>
          <ul><li><?= count(themes_by_tier('free')) + count(themes_by_tier('standard')) ?> designs</li><li>Up to 3 events</li><li>Cover photo</li><li class="no">No RSVP or gift list</li></ul>
          <span class="mp-go">Choose Standard</span>
        </a>
        <a class="mp pop" href="/create">
          <span class="mp-badge">Most Popular</span>
          <span class="mp-name">Premium</span><b class="mp-price">₹<?= $pp ?></b>
          <ul><li>All <?= count(THEMES) ?> designs, animated</li><li>RSVP and gift list</li><li>15-photo gallery and music</li><li>No WedLink credit</li></ul>
          <span class="mp-go">Choose Premium</span>
        </a>
        <a class="mp" href="/custom">
          <span class="mp-name">Custom</span><b class="mp-price"><?= $customFrom ? e($customFrom) : 'On request' ?></b>
          <ul><li>Designed only for you</li><li>Your own domain</li><li>Unlimited gallery</li><li>We build it for you</li></ul>
          <span class="mp-go">Ask for a quote</span>
        </a>
      </div>
      <p class="mini-note">One-time prices. No subscription. <a href="/pricing">Compare every feature →</a></p>
    </div>
  </section>

  <section class="sec" style="padding-top:0">
    <div class="wrap">
      <div class="bio-band">
        <div>
          <span class="free-tag big" style="top:0;margin-bottom:12px">Free</span>
          <h2>Make your marriage biodata too.</h2>
          <p>Pick your religion and a minimal design, fill in your details and download a PDF to share on WhatsApp.</p>
          <a class="btn" href="/biodata">Make my biodata</a>
        </div>
        <div class="bio-mini"><img src="/assets/img/biodata-sample.jpg" alt="Sample marriage biodata" width="600" height="849" loading="lazy"></div>
      </div>
    </div>
  </section>

  <section class="final">
    <?= slot_img('cta') ?>
    <div class="wrap">
      <h2>Your guests are waiting for the date.</h2>
      <p>Make your wedding website now. It takes about five minutes, and you can publish it free.</p>
      <a class="btn js-make" href="/create">Make our wedding website</a>
    </div>
  </section>
</main>
<?php site_footer(); ?>
<?= sticky_cta() ?>
<script>window.WL_DEMO_PHOTOS = <?= json_for_script(array_values(array_filter([slot_url('demo-1'), slot_url('demo-2'), slot_url('demo-3')]))) ?>;</script>
<script>window.WL_THEMES = <?= json_for_script(array_map(fn($t) => ['name' => $t['name'], 'tags' => $t['tags']], THEMES)) ?>;</script>
<script src="<?= asset('assets/samples.js') ?>"></script>
<script src="<?= asset('assets/landing.js') ?>"></script>
</body>
</html>
