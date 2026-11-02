<?php
require __DIR__ . '/lib/bootstrap.php';
count_visit('landing');
$brand = setting('brand');
$ps = price('standard');
$pp = price('premium');
$tick = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
$swatch = [
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
<header class="top" id="top">
  <div class="wrap top-in">
    <a class="logo" href="/"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="12" cy="16" r="8.5" fill="none" stroke="#7E1239" stroke-width="2.6"/><circle cx="20" cy="16" r="8.5" fill="none" stroke="#B08A3E" stroke-width="2.6"/></svg><?= e($brand) ?></a>
    <a class="btn small js-make" href="/create">Make our website</a>
  </div>
</header>

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
        <div class="url-pill-wrap"><span class="url-pill"><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="9" width="12" height="8" rx="2" fill="currentColor"/><path d="M7 9V6.5a3 3 0 016 0V9" fill="none" stroke="currentColor" stroke-width="1.8"/></svg><span><?= e(preg_replace('#^https?://#', '', base_url())) ?>/i/<b id="url-names">arjun-meera</b></span></span></div>
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
          <a class="cat js-cat" href="#designs" data-cat="<?= $k ?>">
            <?= slot_img('cat-' . $k, '', $label . ' wedding') ?>
            <span class="cat-in"><b><?= e($label) ?></b><span><?= e($catNotes[$k]) ?>. <?= $counts[$k] ?> designs</span></span>
          </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <section class="sec gallery-band" id="designs">
    <div class="wrap">
      <div class="sec-head">
        <h2 class="foil"><?= $nThemes ?> designs, finished in gold.</h2>
        <p>Tap any design to start with it. Two are free, and the Premium ones are our most detailed. You can switch any time before you share.</p>
      </div>
      <div class="filters" role="group" aria-label="Filter designs">
        <button type="button" data-f="all" aria-pressed="true">All</button>
        <button type="button" data-f="tier-free" aria-pressed="false">Free</button>
        <button type="button" data-f="tier-premium" aria-pressed="false">Premium</button>
        <?php foreach (CATEGORIES as $k => $label): ?><button type="button" data-f="<?= $k ?>" aria-pressed="false"><?= e($label) ?></button><?php endforeach; ?>
      </div>
      <div class="grid-designs">
        <?php foreach (THEMES as $id => $t): ?>
          <a class="gd" href="/create?t=<?= $id ?>" data-tags="<?= e(implode(' ', $t['tags']) . ' tier-' . $t['tier']) ?>">
            <img src="/assets/img/designs/<?= $id ?>.jpg" alt="<?= e($t['name']) ?> invite design" width="232" height="480" loading="lazy">
            <b><?= e($t['name']) ?><?php if ($t['tier'] !== 'standard'): ?><span class="tier tier-<?= $t['tier'] ?>"><?= TIER_NAMES[$t['tier']] ?></span><?php endif; ?></b>
            <span><?= e($t['note']) ?></span>
            <small><?= e(implode(', ', array_map(fn($x) => CATEGORIES[$x], $t['tags']))) ?></small>
          </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

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

  <section class="sec band" id="pricing">
    <div class="wrap">
      <div class="sec-head">
        <h2>Start free. Pay once if you want more.</h2>
        <p>No subscription. Your link stays live for a full year.</p>
      </div>
      <div class="plans">
        <div class="plan">
          <h3>Basic</h3>
          <p class="price">₹0 <small>free</small></p>
          <p class="who">For a simple, clean invite</p>
          <ul>
            <li><?= $tick ?>2 simple designs: Classic and Blush</li>
            <li><?= $tick ?>Up to 2 events with maps and calendar</li>
            <li><?= $tick ?>Countdown and family details</li>
            <li><?= $tick ?>Live for a year</li>
            <li class="no"><?= $tick ?>Small <?= e($brand) ?> credit at the bottom</li>
          </ul>
          <a class="btn alt js-make" href="/create?t=classic">Start free</a>
        </div>
        <div class="plan">
          <h3>Standard</h3>
          <p class="price">₹<?= $ps ?> <small>one time</small></p>
          <p class="who">All the classic designs</p>
          <ul>
            <li><?= $tick ?><?= count(themes_by_tier('free')) + count(themes_by_tier('standard')) ?> designs for every tradition</li>
            <li><?= $tick ?>Up to 3 events with maps and calendar</li>
            <li><?= $tick ?>One cover photo</li>
            <li><?= $tick ?>Countdown and family details</li>
            <li><?= $tick ?>Edit anytime, live for a year</li>
            <li class="no"><?= $tick ?>No gallery or gift list</li>
          </ul>
          <a class="btn alt js-make" href="/create">Start with Standard</a>
        </div>
        <div class="plan pick">
          <span class="plan-flag">Most couples pick this</span>
          <h3>Premium</h3>
          <p class="price"><span class="foil">₹<?= $pp ?></span> <small>one time</small></p>
          <p class="who">Everything, with our best designs</p>
          <ul>
            <li><?= $tick ?>All <?= $nThemes ?> designs, including Premium ones</li>
            <li><?= $tick ?>Gift list: guests reserve what you need</li>
            <li><?= $tick ?>RSVPs with guest list and headcount</li>
            <li><?= $tick ?>Gallery of up to 15 photos</li>
            <li><?= $tick ?>Background music and up to 6 events</li>
            <li><?= $tick ?>No <?= e($brand) ?> credit</li>
          </ul>
          <a class="btn js-make" href="/create">Start with Premium</a>
        </div>
        <div class="plan custom">
          <h3>Custom</h3>
          <p class="price<?= $customFrom ? '' : ' word' ?>"><?= $customFrom ? e($customFrom) . ' <small>from</small>' : 'Made for you' ?></p>
          <p class="who">Your own design and web address</p>
          <ul>
            <li><?= $tick ?>A design made only for you</li>
            <li><?= $tick ?>Your own domain, like arjunwedsmeera.com</li>
            <li><?= $tick ?>Full photo gallery, no limit</li>
            <li><?= $tick ?>Our story, timeline and video</li>
            <li><?= $tick ?>Gift list, RSVP and everything in Premium</li>
            <li><?= $tick ?>We build it, you approve it</li>
          </ul>
          <a class="btn alt" href="/custom">Ask for a quote</a>
        </div>
      </div>
      <p class="plans-note">You choose the plan on the preview screen, after you have seen your own website.</p>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="bio-band">
        <div>
          <span class="tag" style="margin:0 0 12px">New · Free</span>
          <h2>Make your marriage biodata too.</h2>
          <p>Fill in your details, family and horoscope, pick a design and download it as a PDF or image to share on WhatsApp. Free with a small <?= e($brand) ?> watermark, or ₹<?= $pb ?> to remove it.</p>
          <a class="btn" href="/biodata">Make my biodata</a>
        </div>
        <div class="bio-mini"><img src="/assets/img/biodata-sample.jpg" alt="Sample marriage biodata" width="600" height="849" loading="lazy"></div>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      <div class="sec-head"><h2>Questions couples ask</h2></div>
      <div class="faq">
        <details><summary>Do guests need to install anything?</summary><p>No. The invite is a web page. It opens in WhatsApp, Instagram or any browser on any phone.</p></details>
        <details><summary>Can I change details after I share the link?</summary><p>Yes. You get a private edit link. Change times, venues, photos or wording, and the shared link shows the update straight away.</p></details>
        <details><summary>Is it really free?</summary><p>Yes. The Basic plan is free for a year with the Classic or Blush design and up to 2 events. Pay only if you want more designs, photos, RSVPs or a gift list.</p></details>
        <details><summary>When do I pay?</summary><p>Only after you have built and previewed your full website. If you don't like it, close the page and pay nothing.</p></details>
        <details><summary>How does the gift list work?</summary><p>On Premium, you list gifts you would love. Guests tap one, type their name and reserve it. Others then see it as reserved, and you see who picked what.</p></details>
        <details><summary>Is there a design for our tradition?</summary><p>Yes. There are designs for Hindu, Christian, Muslim and Sikh weddings, Kerala weddings, and modern designs that suit everyone. Every line of text can be changed.</p></details>
        <details><summary>How long does the link work?</summary><p>For a full year from the day you publish, so it covers the wedding, the reception and the thank-yous.</p></details>
        <details><summary>Can I write in Malayalam, Hindi or Arabic?</summary><p>Yes. Type in any Indian language or Arabic in any field and the invite shows it in a matching font.</p></details>
        <details><summary>Is the payment safe?</summary><p>Payments go through Razorpay. Pay by UPI, card or net banking. We never see your card or UPI details.</p></details>
        <details><summary>Something went wrong with my payment. What now?</summary><p>If money left your account but your link didn't go live, write to us with your phone number and we'll fix it or refund you in full.</p></details>
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
<div class="sticky-cta"><a class="btn js-make" href="/create">Make our website</a><small>Free plan, no card needed</small></div>
<script>window.WL_THEMES = <?= json_for_script(array_map(fn($t) => ['name' => $t['name'], 'tags' => $t['tags']], THEMES)) ?>;</script>
<script src="<?= asset('assets/samples.js') ?>"></script>
<script src="<?= asset('assets/landing.js') ?>"></script>
</body>
</html>
