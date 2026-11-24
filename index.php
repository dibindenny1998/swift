<?php
require __DIR__ . '/lib/bootstrap.php';
count_visit('landing');
$brand = setting('brand');
$ps = price('standard');
$pp = price('premium');
$tick = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
$swatch = [
 'lumiere' => 'linear-gradient(180deg,#B89A72 0 60%,#FBF8F3 60%)', 'journal' => 'linear-gradient(180deg,#E2C3BF 0 55%,#FBF6EE 55%)', 'vogue' => 'linear-gradient(180deg,#6E6152 0 70%,#F7F5F1 70%)',
 'lavender' => 'radial-gradient(circle at 40% 40%,#B39DDB 0 22%,#FAF7FD 23%)', 'mehndi' => 'radial-gradient(circle at 50% 50%,#DDBB66 0 18%,#1E4A35 19%)',
    'mughal' => 'linear-gradient(180deg,#C9A24A 0 18%,#FBF6EA 18%)', 'bloom' => 'radial-gradient(ellipse at 50% 60%,#E7A5AF 0 34%,#FDF3F4 35%)',
    'sage' => 'radial-gradient(circle at 30% 30%,#A7B293 0 24%,#F6F3EA 25%)', 'seal' => 'radial-gradient(circle at 50% 55%,#C9A24A 0 20%,#D6C09E 21%)',
    'ink' => 'radial-gradient(circle at 50% 50%,#5A2E2A 0 14%,#F7F2EA 15%)', 'toile' => 'linear-gradient(135deg,#F8F6F0 0 55%,#2F4A7A 55%)',
    'classic' => 'linear-gradient(135deg,#FBF8F2 0 60%,#1E1E1E 60%)', 'blush' => 'radial-gradient(circle at 50% 40%,#E7A5AF 0 22%,#FDF1F2 23%)',
    'champagne' => 'linear-gradient(135deg,#FBE6E3,#F3E1C8)', 'kasavu' => 'linear-gradient(90deg,#C9A227 0 20%,#FBF7EC 20% 80%,#C9A227 80%)',
    'noor' => 'radial-gradient(circle at 50% 35%,#E3C26E 0 14%,#145A44 15%)', 'chapel' => 'linear-gradient(160deg,#3B5BA9,#C9506E 55%,#E7A93C)',
    'sindoor' => 'radial-gradient(circle at 50% 40%,#E9C46A 0 16%,#C9727F 17%)', 'kesar' => 'linear-gradient(135deg,#F4A21C 0 30%,#172C6E 30%)',
    'gopuram' => 'linear-gradient(180deg,#E8C26A 0 35%,#5E1020 35%)', 'velvet' => 'radial-gradient(circle at 50% 100%,#E5C37A 0 30%,#4A5739 31%)',
    'qamar' => 'radial-gradient(circle at 65% 35%,#F5DFA8 0 15%,#1B1440 16%)', 'grace' => 'linear-gradient(135deg,#DCE6EE,#8EA3B6)', 'mono' => 'linear-gradient(135deg,#FAFAF7 0 50%,#151515 50%)', 'reel' => 'radial-gradient(circle,#D9B76A 0 22%,#0F0D0C 24%)',
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
site_head('Create Your Wedding Website: One Link for Every Guest | ' . $brand,
    "Create your own wedding website in 5 minutes. Pick a design, add your details and share one link with every guest on WhatsApp. Free to start.",
    '/assets/og/home.jpg', '', ['path' => '/', 'jsonld' => [ld_org(), ld_website(), ld_faq(site_faq()),
        ld_app($brand . ' wedding website maker', 'Make a free wedding invitation website to share on WhatsApp, with events, maps, countdown, RSVP, gift list and photos.', '/',
            ['Free wedding website', 'Wedding invitation for WhatsApp', 'Google Maps directions for every event', 'Countdown', 'RSVP and guest list', 'Gift list', 'Photo gallery and music', 'Hindu, Christian, Muslim, Sikh and Kerala designs'],
            [['Free', 0], ['Premium', $pp], ['Built for you', (int)setting('price_built')]])]]);
?>
<body>
<div class="resume" id="resume" hidden><div class="wrap"><span>Your invite is saved.</span><a id="resume-link" href="#">Continue where you left off</a></div></div>
<?php site_header(); ?>

<main class="home">
  <section class="x-hero">
    <div class="wrap x-hero-grid">
      <div class="x-hero-copy">
        <h1 class="x-h1" data-enter>Create your own <em>wedding website</em></h1>
        <p class="x-lede" data-enter>Pick a design, add your wedding details and send one link to every guest on WhatsApp. Ready in five minutes.</p>
        <div class="x-cta" data-enter>
          <a class="x-btn js-make" href="/designs">Create our wedding website <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
          <a class="x-link" href="/sample" target="_blank" rel="noopener">See a live wedding site</a>
        </div>
        <ul class="x-proof" data-enter>
          <li><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>Free to start</li><li><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>No card needed</li><li><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>Opens from WhatsApp</li>
        </ul>
        <div class="x-try" data-enter>
          <p class="x-try-label">Try it with your names</p>
          <span class="names" id="names"><label class="sr" for="n1">First name</label><span class="name-box hint"><input class="name-in" id="n1" value="Arjun" maxlength="24" autocomplete="off" spellcheck="false"><i class="name-caret" aria-hidden="true"></i></span><span class="amp">&amp;</span><label class="sr" for="n2">Second name</label><span class="name-box"><input class="name-in" id="n2" value="Meera" maxlength="24" autocomplete="off" spellcheck="false"><i class="name-caret" aria-hidden="true"></i></span></span>
        </div>
      </div>
      <div class="x-stage" data-enter>
        <figure class="x-arch"><span class="x-petals" aria-hidden="true"><i style="--d:0s;--x:12%;--t:9s;--s:1"></i><i style="--d:1.8s;--x:34%;--t:11s;--s:0.8"></i><i style="--d:3.1s;--x:58%;--t:10s;--s:1.1"></i><i style="--d:4.6s;--x:78%;--t:12s;--s:0.9"></i><i style="--d:6.2s;--x:22%;--t:9.5s;--s:0.7"></i><i style="--d:7.4s;--x:66%;--t:11.5s;--s:1"></i><i style="--d:2.6s;--x:88%;--t:10.5s;--s:0.8"></i><i style="--d:5.3s;--x:46%;--t:12.5s;--s:0.9"></i></span><img src="<?= asset('assets/img/slots/demo-1.jpg') ?>" alt="" width="900" height="1125" fetchpriority="high"></figure>
        <div class="x-phone"><iframe id="demo" src="/frame.php" title="Live invite preview" loading="eager" allow="autoplay; encrypted-media; picture-in-picture"></iframe></div>
        <?php $heroPick = ['champagne', 'mono', 'marigold', 'kasavu', 'noor', 'lumiere']; ?>
        <div class="x-pills" role="group" aria-label="Try a design">
          <?php foreach ($heroPick as $id): ?>
            <button type="button" class="sw2" data-theme="<?= $id ?>" data-name="<?= e(THEMES[$id]['name']) ?>" aria-pressed="<?= $id === 'champagne' ? 'true' : 'false' ?>"><i style="background:<?= $swatch[$id] ?>"></i><?= e(THEMES[$id]['name']) ?></button>
          <?php endforeach; ?>
        </div>
        <p class="design-now sr" aria-live="polite">Design: <b id="design-name">Champagne</b></p>
      </div>
    </div>
  </section>

  <section class="x-statement">
    <div class="wrap x-statement-grid">
      <h2 class="x-display" data-io>One link. Every guest knows where to go, and you know who's coming.</h2>
      <ul class="x-benefits" data-io>
        <li><i><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3 19c.6-3.2 3-5 6-5s5.4 1.8 6 5"/><path d="M15.5 11.5l2 2 3.5-4"/></svg></i><div><b>RSVP headcount</b><span>Know who's coming to each function, before the caterer asks.</span></div></li>
        <li><i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0113 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg></i><div><b>Maps to every venue</b><span>One tap opens directions. No more "where is the hall?" calls.</span></div></li>
        <li><i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0113.7-5.6L20 8.5"/><path d="M20 4v4.5h-4.5"/><path d="M20 12a8 8 0 01-13.7 5.6L4 15.5"/><path d="M4 20v-4.5h4.5"/></svg></i><div><b>Change once, everyone sees it</b><span>Move the reception to 7 pm and every guest sees the new time.</span></div></li>
        <li><i><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.7"/><path d="M4 17l4.5-4 3.5 3 3-2.5 5 4"/></svg></i><div><b>Your story and photos</b><span>The part a printed card can't hold.</span></div></li>
      </ul>
    </div>
  </section>

  <section class="x-band" aria-label="Your card and your link">
    <figure class="x-band-img"><img src="<?= asset('assets/img/slots/sample-kasavu.jpg') ?>" alt="" width="1080" height="1920" loading="lazy"></figure>
    <div class="wrap x-band-copy"><p>Your card for the elders.<br><em>Your link for everyone.</em></p></div>
  </section>

<?php sec_designs(6); ?>


  <section class="sec band">
    <div class="wrap">
      <div class="sec-head"><h2>How it works</h2><p>From design to WhatsApp in about five minutes.</p></div>
      <ol class="steps">
        <li><h3>Pick a design</h3><p>Switch any time before you share.</p></li>
        <li><h3>Add your details</h3><p>The preview updates as you type.</p></li>
        <li><h3>Publish and share</h3><p>Free, or pay once for more. Send the link on WhatsApp.</p></li>
      </ol>
    </div>
  </section>

<?php sec_reviews(); ?>

  <section class="sec">
    <div class="wrap">
      <div class="sec-head"><h2>Simple plans, paid once</h2><p>Build and preview free. Pay only when you want more.</p></div>
      <div class="mini-plans" id="mini-plans">
        <a class="mp" href="/designs">
          <span class="mp-name">Free</span><b class="mp-price">₹0 <small>free</small></b>
          <ul><li>1 event with maps</li><li>5 designs, a cover photo</li><li>Live for 1 month</li><li class="no">"Crafted by TheWedLink" mark</li></ul>
          <span class="mp-go">Start free</span>
        </a>
        <a class="mp pop" href="/designs" data-start>
          <span class="mp-name">Premium</span><b class="mp-price">₹<?= $pp ?> <small>one time</small></b>
          <ul><li>All functions, RSVP and headcount</li><li>Story, 15 photos and a video</li><li>All designs, gift list, music</li><li>Live for 1 year</li></ul>
          <span class="mp-go">Choose Premium</span>
        </a>
        <a class="mp" href="/custom">
          <span class="mp-name">Built for you</span><b class="mp-price">₹<?= number_format((int)setting('price_built')) ?> <small>fixed</small></b>
          <ul><li>Everything in Premium</li><li>We fill it in from your WhatsApp message</li><li>You check it and ask for changes</li><li>Fixed price</li></ul>
          <span class="mp-go">Send us your details</span>
        </a>
      </div>
<?php $fo = founding(); if ($fo['on']): ?>      <div class="founding"><div><p><b>Founding couples:</b> the first <?= $fo['total'] ?> couples get Built for you for <b>₹<?= number_format($fo['price']) ?></b> instead of ₹<?= number_format((int)setting('price_built')) ?>, if they let us show their site as an example (names hidden on request).</p><p class="founding-meta"><b><?= $fo['left'] ?> of <?= $fo['total'] ?> spots left</b> · Ends <?= date('j M Y', $fo['end']) ?></p></div><a class="btn small" href="/custom?founding=1">Claim a founding spot</a></div>
<?php endif; ?>
      <p class="mini-note">One-time prices. No subscription. <a href="/pricing">Compare every feature →</a></p>
    </div>
  </section>

  <section class="sec" style="padding-top:0">
    <div class="wrap">
      <div class="bio-band">
        <div>
          <h2>Free marriage biodata maker</h2>
          <p>Make a clean, beautiful biodata in minutes and share it with families on WhatsApp.</p>
          <ul class="bio-feats">
            <li><b>Made for your religion.</b> Pick Hindu, Muslim, Christian, Sikh, Jain or Buddhist and get the details families ask for: gotra, star and rasi; sect and maslak; parish and diocese; got and Amritdhari status.</li>
            <li><b>Minimal designs.</b> 4 styles in 6 soft colours, an optional photo, and a blessing line or symbol only if you want it.</li>
            <li><b>Any language.</b> Write in English, Malayalam, Hindi, Tamil, Kannada, Telugu or Punjabi.</li>
            <li><b>PDF or image.</b> Download an A4 PDF to print or a picture to send on WhatsApp. Edit and download again any time.</li>
            <li><b>Completely free.</b> No watermark, no payment, download as often as you like.</li>
          </ul>
          <div class="bio-cta"><a class="btn" href="/biodata">Make my biodata</a><span>Formats: <a href="/biodata/hindu">Hindu</a> · <a href="/biodata/muslim">Muslim</a> · <a href="/biodata/christian">Christian</a> · <a href="/biodata/sikh">Sikh</a> · <a href="/biodata/kerala">Kerala</a></span></div>
        </div>
        <div class="bio-mini"><img src="<?= asset('assets/img/biodata-sample.jpg') ?>" alt="Sample marriage biodata" width="600" height="849" loading="lazy"></div>
      </div>
    </div>
  </section>

<?php sec_faq(); ?>

  <section class="final">
    <?= slot_img('cta') ?>
    <div class="wrap">
      <h2>Your guests are waiting for the date.</h2>
      <p>Make your wedding website now. It takes about five minutes, and you can publish it free.</p>
      <a class="btn js-make" href="/designs">Create our wedding website</a>
    </div>
  </section>
</main>
<?php site_footer(); ?>
<?= sticky_cta() ?>
<script>window.WL_DEMO_VIDEO = <?= json_encode(setting('demo_video'), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;</script>
<script>window.WL_DEMO_PHOTOS = <?= json_for_script(array_values(array_filter([slot_url('demo-1'), slot_url('demo-2'), slot_url('demo-3')]))) ?>;</script>
<script>window.WL_THEMES = <?= json_for_script(array_map(fn($t) => ['name' => $t['name'], 'tags' => $t['tags']], THEMES)) ?>;</script>
<script src="<?= asset('assets/samples.js') ?>"></script>
<script src="<?= asset('assets/landing.js') ?>"></script>
<script>(function(){
var rm=matchMedia('(prefers-reduced-motion: reduce)').matches, io=('IntersectionObserver' in window)&&!rm;
document.querySelectorAll('.x-benefits svg *').forEach(function(el){el.setAttribute('pathLength','1');});
function count(el){var tn=null;for(var n=el.firstChild;n;n=n.nextSibling){if(n.nodeType===3&&/\d/.test(n.nodeValue)){tn=n;break;}}if(!tn)return;
 var m=tn.nodeValue.match(/([\d,]+)/);if(!m)return;var to=parseInt(m[1].replace(/,/g,''),10),pre=tn.nodeValue.slice(0,m.index),post=tn.nodeValue.slice(m.index+m[1].length);if(!to)return;
 var t0=null,D=1100;function f(ts){if(!t0)t0=ts;var p=Math.min(1,(ts-t0)/D),e=1-Math.pow(1-p,3);tn.nodeValue=pre+Math.round(to*e).toLocaleString('en-IN')+post;if(p<1)requestAnimationFrame(f);}requestAnimationFrame(f);}
var els=document.querySelectorAll('[data-io], .mp, .review');
if(!io){els.forEach(function(e){e.classList.add('is-in');});return;}
els.forEach(function(e){e.classList.add('io');});
var o=new IntersectionObserver(function(es){es.forEach(function(en){if(!en.isIntersecting)return;en.target.classList.add('is-in');o.unobserve(en.target);var pr=en.target.querySelector&&en.target.querySelector('.mp-price');if(pr)count(pr);});},{threshold:.2});
els.forEach(function(e){o.observe(e);});
})();</script>
<script>(function(){var b=document.querySelector('.x-band');if(!b)return;if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){b.classList.add('is-in');return;}new IntersectionObserver(function(es,o){es.forEach(function(e){if(e.isIntersecting){b.classList.add('is-in');o.disconnect();}});},{threshold:.25}).observe(b);})();</script>
</body>
</html>
