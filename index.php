<?php
require __DIR__ . '/lib/bootstrap.php';
count_visit('landing');
$brand = setting('brand');
$ps = price('standard');
$pp = price('premium');
$tick = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
$swatch = [
    'sage' => 'radial-gradient(circle at 30% 30%,#A7B293 0 24%,#F6F3EA 25%)', 'seal' => 'radial-gradient(circle at 50% 55%,#C9A24A 0 20%,#D6C09E 21%)',
    'ink' => 'radial-gradient(circle at 50% 50%,#5A2E2A 0 14%,#F7F2EA 15%)', 'toile' => 'linear-gradient(135deg,#F8F6F0 0 55%,#2F4A7A 55%)',
    'classic' => 'linear-gradient(135deg,#FBF8F2 0 60%,#1E1E1E 60%)', 'blush' => 'radial-gradient(circle at 50% 40%,#E7A5AF 0 22%,#FDF1F2 23%)',
    'champagne' => 'linear-gradient(135deg,#FBE6E3,#F3E1C8)', 'kasavu' => 'linear-gradient(90deg,#C9A227 0 20%,#FBF7EC 20% 80%,#C9A227 80%)',
    'noor' => 'radial-gradient(circle at 50% 35%,#E3C26E 0 14%,#145A44 15%)', 'chapel' => 'linear-gradient(160deg,#3B5BA9,#C9506E 55%,#E7A93C)',
    'sindoor' => 'radial-gradient(circle at 50% 40%,#E9C46A 0 16%,#8E1530 17%)', 'kesar' => 'linear-gradient(135deg,#F4A21C 0 30%,#172C6E 30%)',
    'gopuram' => 'linear-gradient(180deg,#E8C26A 0 35%,#5E1020 35%)', 'velvet' => 'radial-gradient(circle at 50% 100%,#E5C37A 0 30%,#4A0A22 31%)',
    'qamar' => 'radial-gradient(circle at 65% 35%,#F5DFA8 0 15%,#1B1440 16%)', 'grace' => 'linear-gradient(135deg,#DCE6EE,#8EA3B6)',
    'marigold' => 'radial-gradient(circle at 30% 30%,#F7B500 0 22%,transparent 23%),radial-gradient(circle at 70% 30%,#F07B0A 0 22%,transparent 23%),#FFF1C9',
    'nilavu' => 'radial-gradient(circle at 68% 32%,#F6E7B8 0 14%,#13214A 15%)', 'mullappoo' => 'radial-gradient(circle,#fff 0 22%,#CFE3D4 23% 30%,#F2F8F3 31%)',
    'thamara' => 'radial-gradient(ellipse at 50% 70%,#F3B3C1 0 30%,#FDEEF1 31%)', 'mayil' => 'radial-gradient(circle at 50% 45%,#173E8C 0 12%,#0F9AA0 13% 22%,#E2C46F 23% 28%,#0D4651 29%)',
    'jaipur' => 'linear-gradient(180deg,#F6D2C6 0 55%,#E9A99A 55%)', 'gulmohar' => 'radial-gradient(circle at 40% 40%,#E2401C 0 20%,#FFF4E6 21%)',
];
$counts = array_fill_keys(array_keys(CATEGORIES), 0);
foreach (THEMES as $t) foreach ($t['tags'] as $tag) $counts[$tag]++;
$catNotes = ['hindu' => 'Temple, mandap and Kerala weddings', 'christian' => 'Church weddings and betrothals', 'muslim' => 'Nikah and walima', 'sikh' => 'Anand Karaj', 'kerala' => 'Kasavu, jasmine and temple gold', 'modern' => 'For every faith and none'];
$ogSlot = slot_url('og');
$nThemes = count(THEMES);
$pb = price('biodata');
$customFrom = trim(setting('custom_from'));
site_head($brand . ': wedding invitation websites you share on WhatsApp', "Make your own wedding website in 5 minutes: invitation, venues with maps, countdown, RSVP, gift list and photos in one link. Free plan, paid from ₹$ps.", $ogSlot ?: '/assets/og/site.jpg');
?>
<body>
<div class="resume" id="resume" hidden><div class="wrap"><span>Your invite is saved.</span><a id="resume-link" href="#">Continue where you left off</a></div></div>
<?php site_header(); ?>

<main>
  <section class="hero lux-hero">
    <?= slot_img('hero', '', '', false) ?>
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <p class="eyebrow"><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="3.5" width="15" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M2.5 7.5h15" stroke="currentColor" stroke-width="1.8"/></svg>Wedding invitation website</p>
        <h1>
          <span class="pre">A wedding website for</span>
          <span class="names"><label class="sr" for="n1">First name</label><input class="name-in" id="n1" value="Arjun" maxlength="24" autocomplete="off" spellcheck="false"><span class="amp">&amp;</span><label class="sr" for="n2">Second name</label><input class="name-in" id="n2" value="Meera" maxlength="24" autocomplete="off" spellcheck="false"></span>
        </h1>
        <p class="hero-hint"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 17l3.5-1 9-9-2.5-2.5-9 9L3 17z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>Tap the names and type yours. Your website changes as you type.</p>
        <p class="hero-lead">Instead of a printed card, send your guests one link on WhatsApp. It opens your own wedding website with the invitation, every event with Google Maps directions, a countdown, RSVP, a gift list and your photos. <?= $nThemes ?> designs for Hindu, Christian, Muslim and Sikh weddings. Start free.</p>
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
        <p class="design-now">Design: <b id="design-name">Champagne</b></p>
        <div class="swatch-strip" role="group" aria-label="Choose a design">
          <?php foreach (THEMES as $id => $t): ?>
            <button type="button" class="sw2" data-theme="<?= $id ?>" data-name="<?= e($t['name']) ?>" aria-label="<?= e($t['name']) ?>" aria-pressed="<?= $id === 'champagne' ? 'true' : 'false' ?>" style="background:<?= $swatch[$id] ?>"></button>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="sec-head">
        <h2>Designs for every wedding.</h2>
        <p>Each one comes with the right opening line and events, from Muhurtham to Nikah, Holy Matrimony and Anand Karaj. You can change every word.</p>
      </div>
      <div class="cats">
        <?php foreach (CATEGORIES as $k => $label): ?>
          <a class="cat" href="/designs?f=<?= $k ?>">
            <?= slot_img('cat-' . $k, '', $label . ' wedding') ?>
            <span class="cat-in"><b><?= e($label) ?></b><span><?= e($catNotes[$k]) ?>. <?= $counts[$k] ?> designs</span></span>
          </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

<?php sec_designs(8); ?>

  <section class="sec band">
    <div class="wrap">
      <div class="sec-head">
        <h2>One link does the work of the card, the map and the phone calls.</h2>
        <p>Your guests open it straight from WhatsApp. Nothing to download, nothing to print.</p>
      </div>
      <div class="feat">
        <div><h3>Directions to every venue</h3><p>Each event has a button that opens Google Maps, so nobody calls to ask the way.</p></div>
        <div><h3>A live countdown</h3><p>Days, hours and minutes to the big moment, right under your names.</p></div>
        <div><h3>Add to calendar</h3><p>One tap saves each event in your guests' phones.</p></div>
        <div><h3>RSVPs in one place<span class="tag">Premium</span></h3><p>Guests reply with how many are coming. You see the full list and headcount.</p></div>
        <div><h3>A gift list guests can pick from<span class="tag">Premium</span></h3><p>List the gifts you would love. Guests type their name and reserve one, so nobody brings the same thing twice.</p></div>
        <div><h3>Your photos and your song<span class="tag">Premium</span></h3><p>A photo gallery, and music that starts when they open the invite.</p></div>
        <div><h3>Write in your language</h3><p>Malayalam, Tamil, Kannada, Telugu, Hindi, Punjabi, Arabic or English. It all displays correctly.</p></div>
        <div><h3>Fix it after sharing</h3><p>Change a time or a venue and the same link updates for everyone.</p></div>
        <div><h3>Engagement to reception</h3><p>Add every function with its own date, time and venue.</p></div>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="sec-head"><h2>How it works</h2></div>
      <ol class="steps">
        <li><h3>Pick a design</h3><p>Choose from <?= $nThemes ?>. Switch any time before you share.</p></li>
        <li><h3>Add your details</h3><p>Names, families, events, venues and photos. The preview updates as you type.</p></li>
        <li><h3>Preview, publish and share</h3><p>See the finished website free. Publish on the free plan or pay once for more, then send the link on WhatsApp.</p></li>
      </ol>
    </div>
  </section>

<?php sec_pricing(); ?>

  <section class="sec">
    <div class="wrap">
      <div class="bio-band">
        <div>
          <span class="tag" style="margin:0 0 12px">New · Free</span>
          <h2>Make your marriage biodata too.</h2>
          <p>Fill in your details, family and horoscope, pick a design and download it as a PDF or image to share on WhatsApp. Free with a small “Created by <?= e($brand) ?>” strip at the bottom, or ₹<?= $pb ?> for a clean copy.</p>
          <a class="btn" href="/biodata">Make my biodata</a>
        </div>
        <div class="bio-mini"><img src="/assets/img/biodata-sample.jpg" alt="Sample marriage biodata" width="600" height="849" loading="lazy"></div>
      </div>
    </div>
  </section>

<?php sec_faq(); ?>

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
<div class="sticky-cta"><a class="btn js-make" href="/create">Make our website</a><small>Free plan, no card needed</small></div>
<script>window.WL_THEMES = <?= json_for_script(array_map(fn($t) => ['name' => $t['name'], 'tags' => $t['tags']], THEMES)) ?>;</script>
<script src="<?= asset('assets/samples.js') ?>"></script>
<script src="<?= asset('assets/landing.js') ?>"></script>
</body>
</html>
