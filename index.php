<?php
require __DIR__ . '/lib/bootstrap.php';
count_visit('landing');
$brand = setting('brand');
$ps = price('standard');
$pp = price('premium');
$tick = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
site_head($brand . ': wedding invites you share on WhatsApp', "Make a beautiful wedding invite website in 5 minutes. Directions, countdown, RSVP and photos in one link. Preview free, from ₹$ps.");
?>
<body>
<div class="resume" id="resume" hidden><div class="wrap"><span>Your invite is saved.</span><a id="resume-link" href="#">Continue where you left off</a></div></div>
<header class="top" id="top">
  <div class="wrap top-in">
    <a class="logo" href="/"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="12" cy="16" r="8.5" fill="none" stroke="#C2183F" stroke-width="2.6"/><circle cx="20" cy="16" r="8.5" fill="none" stroke="#B8913A" stroke-width="2.6"/></svg><?= e($brand) ?></a>
    <a class="btn small js-make" href="/create">Make our invite</a>
  </div>
</header>

<main>
  <section class="hero">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <h1>
          <span class="names"><label class="sr" for="n1">First name</label><input class="name-in" id="n1" value="Arjun" maxlength="24" autocomplete="off" spellcheck="false"><span class="amp">&amp;</span><label class="sr" for="n2">Second name</label><input class="name-in" id="n2" value="Meera" maxlength="24" autocomplete="off" spellcheck="false"></span>
          are getting married.
        </h1>
        <p class="hero-hint"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 17l3.5-1 9-9-2.5-2.5-9 9L3 17z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>Tap the names and type yours. The invite changes as you type.</p>
        <p class="hero-lead">Pick a design, add your dates and venues, and share one link on WhatsApp. Guests get directions, a countdown and an RSVP button. See the whole invite free, and pay only when you love it.</p>
        <div class="hero-cta">
          <a class="btn js-make" href="/create">Make our invite</a>
          <small>Free preview. One-time ₹<?= $ps ?> or ₹<?= $pp ?>.</small>
        </div>
        <ul class="ticks">
          <li><?= $tick ?>Ready in 5 minutes</li>
          <li><?= $tick ?>Edit details anytime</li>
          <li><?= $tick ?>Secure payment by Razorpay</li>
        </ul>
      </div>
      <div class="stage">
        <div class="phone"><iframe id="demo" src="/frame.php" title="Live invite preview" loading="eager"></iframe></div>
        <div class="swatches" role="group" aria-label="Choose a design">
          <?php foreach (THEMES as $id => $t): ?>
            <button type="button" class="sw sw-<?= $id ?>" data-theme="<?= $id ?>" aria-pressed="<?= $id === 'kasavu' ? 'true' : 'false' ?>"><i></i><?= e($t['name']) ?></button>
          <?php endforeach; ?>
        </div>
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
        <div><h3>A live countdown</h3><p>Days, hours and minutes to the muhurtham, right under your names.</p></div>
        <div><h3>Add to calendar</h3><p>One tap saves each event in your guests' phones.</p></div>
        <div><h3>RSVPs in one place<span class="tag">Premium</span></h3><p>Guests reply with how many are coming. You see the full list and headcount.</p></div>
        <div><h3>Your photos and your song<span class="tag">Premium</span></h3><p>A photo gallery, and music that starts when they open the invite.</p></div>
        <div><h3>Write in your language</h3><p>Type in Malayalam, Tamil, Kannada, Hindi, Telugu or English. It all displays correctly.</p></div>
        <div><h3>Fix it after sharing</h3><p>Change a time or a venue and the same link updates for everyone.</p></div>
        <div><h3>Engagement to reception</h3><p>Add every function with its own date, time and venue.</p></div>
      </div>
    </div>
  </section>

  <section class="sec" id="designs">
    <div class="wrap">
      <div class="sec-head">
        <h2>Six designs, drawn for Indian weddings.</h2>
        <p>From a Kerala kasavu border to marigold torans. Every design works for church, temple, mosque and registered weddings.</p>
      </div>
      <div class="designs">
        <?php foreach (THEMES as $id => $t): ?>
          <a class="design" href="/create?t=<?= $id ?>">
            <img src="/assets/img/designs/<?= $id ?>.jpg" alt="<?= e($t['name']) ?> invite design" width="232" height="480" loading="lazy">
            <b><?= e($t['name']) ?></b>
            <span><?= e($t['note']) ?></span>
            <u>Use <?= e($t['name']) ?></u>
          </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <section class="sec band">
    <div class="wrap">
      <div class="sec-head"><h2>How it works</h2></div>
      <ol class="steps">
        <li><h3>Pick a design</h3><p>Choose one of six. You can switch any time before you share.</p></li>
        <li><h3>Add your details</h3><p>Names, families, events, venues and photos. The preview updates as you type.</p></li>
        <li><h3>Preview, pay and share</h3><p>See the finished invite free. Pay once, get your link instantly and send it on WhatsApp.</p></li>
      </ol>
    </div>
  </section>

  <section class="sec" id="pricing">
    <div class="wrap">
      <div class="sec-head">
        <h2>Pay once, after you have seen it.</h2>
        <p>No subscription. Your link stays live for a full year.</p>
      </div>
      <div class="plans">
        <div class="plan">
          <h3>Standard</h3>
          <p class="price">₹<?= $ps ?> <small>one time</small></p>
          <ul>
            <li><?= $tick ?>Any of the six designs</li>
            <li><?= $tick ?>Up to 3 events with maps and calendar</li>
            <li><?= $tick ?>Countdown and family details</li>
            <li><?= $tick ?>Up to 4 photos</li>
            <li><?= $tick ?>Edit anytime, live for a year</li>
          </ul>
          <a class="btn alt js-make" href="/create">Start with Standard</a>
        </div>
        <div class="plan pick">
          <span class="plan-flag">Most couples pick this</span>
          <h3>Premium</h3>
          <p class="price">₹<?= $pp ?> <small>one time</small></p>
          <ul>
            <li><?= $tick ?>Everything in Standard</li>
            <li><?= $tick ?>RSVPs with guest list and headcount</li>
            <li><?= $tick ?>Up to 6 events</li>
            <li><?= $tick ?>Gallery of up to 15 photos</li>
            <li><?= $tick ?>Background music you choose</li>
            <li><?= $tick ?>No <?= e($brand) ?> credit at the bottom</li>
          </ul>
          <a class="btn js-make" href="/create">Start with Premium</a>
        </div>
      </div>
      <p class="plans-note">You choose the plan on the preview screen, so you can compare both on your own invite.</p>
    </div>
  </section>

  <section class="sec band">
    <div class="wrap">
      <div class="sec-head"><h2>Questions couples ask</h2></div>
      <div class="faq">
        <details><summary>Do guests need to install anything?</summary><p>No. The invite is a web page. It opens in WhatsApp, Instagram or any browser on any phone.</p></details>
        <details><summary>Can I change details after I share the link?</summary><p>Yes. You get a private edit link. Change times, venues, photos or wording, and the shared link shows the update straight away.</p></details>
        <details><summary>When do I pay?</summary><p>Only after you have built and previewed your full invite. If you don't like it, close the page and pay nothing.</p></details>
        <details><summary>How long does the link work?</summary><p>For a full year from the day you publish, so it covers the wedding, the reception and the thank-yous.</p></details>
        <details><summary>Can I write in Malayalam, Tamil or Hindi?</summary><p>Yes. Type in any Indian language in any field and the invite shows it in a matching font.</p></details>
        <details><summary>Is the payment safe?</summary><p>Payments go through Razorpay, India's most used payment gateway. Pay by UPI, card or net banking. We never see your card or UPI details.</p></details>
        <details><summary>Something went wrong with my payment. What now?</summary><p>If money left your account but your link didn't go live, write to us with your phone number and we'll fix it or refund you in full.</p></details>
      </div>
    </div>
  </section>

  <section class="final">
    <div class="wrap">
      <h2>Your guests are waiting for the date.</h2>
      <p>Make the invite now. It takes about five minutes and costs nothing to preview.</p>
      <a class="btn js-make" href="/create">Make our invite</a>
    </div>
  </section>
</main>
<?php site_footer(); ?>
<div class="sticky-cta"><a class="btn js-make" href="/create">Make our invite</a><small>Free preview, from ₹<?= $ps ?></small></div>
<script src="<?= asset('assets/landing.js') ?>"></script>
</body>
</html>
