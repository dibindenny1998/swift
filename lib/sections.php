<?php
/* Page sections shared by the home page and the Designs / Pricing pages. */

function page_vars(): array
{
    return [
        'brand' => setting('brand'), 'ps' => price('standard'), 'pp' => price('premium'), 'pb' => price('biodata'),
        'nThemes' => count(THEMES), 'customFrom' => trim(setting('custom_from')),
        'tick' => '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ];
}

/** Design gallery. $limit > 0 shows only that many designs and a link to the full page. */
function sec_designs(int $limit = 0): void
{
    extract(page_vars());
    // the home page shows a mix across traditions and plans; /designs shows everything
    $pick = ['seal', 'kasavu', 'noor', 'sage'];
    $themes = $limit > 0 ? array_slice(array_intersect_key(THEMES, array_flip($pick)), 0, $limit, true) : THEMES;
    $f = preg_match('/^[a-z-]{3,20}$/', $_GET['f'] ?? '') ? $_GET['f'] : 'all';
?>
  <section class="sec gallery-band" id="designs" data-start-filter="<?= e($f) ?>">
    <div class="wrap">
      <div class="sec-head">
        <h2 class="foil"><?= $nThemes ?> designs for every wedding</h2>
        <p><?= $limit ? 'Two are free. Tap one to start.' : 'Tap any design to start with it. Two are free, and the Premium ones are our most detailed. You can switch any time before you share.' ?></p>
      </div>
      <?php if (!$limit): ?>
      <div class="filters" role="group" aria-label="Filter designs">
        <button type="button" data-f="all" aria-pressed="true">All</button>
        <button type="button" data-f="tier-free" aria-pressed="false">Free</button>
        <button type="button" data-f="tier-premium" aria-pressed="false">Premium</button>
        <?php foreach (CATEGORIES as $k => $label): ?><button type="button" data-f="<?= $k ?>" aria-pressed="false"><?= e($label) ?></button><?php endforeach; ?>
      </div>
      <?php endif; ?>
      <div class="grid-designs">
        <?php foreach ($themes as $id => $t): ?>
          <a class="gd" href="/create?t=<?= $id ?>" data-tags="<?= e(implode(' ', $t['tags']) . ' tier-' . $t['tier']) ?>">
            <img src="/assets/img/designs/<?= $id ?>.jpg" alt="<?= e($t['name']) ?> invite design" width="232" height="480" loading="lazy">
            <b><?= e($t['name']) ?><?php if ($t['tier'] !== 'standard'): ?><span class="tier tier-<?= $t['tier'] ?>"><?= TIER_NAMES[$t['tier']] ?></span><?php endif; ?></b>
            <span><?= e($t['note']) ?></span>
            <small><?= e(implode(', ', array_map(fn($x) => CATEGORIES[$x], $t['tags']))) ?></small>
          </a>
        <?php endforeach; ?>
      </div>
      <?php if ($limit): ?><p style="text-align:center;margin-top:34px"><a class="btn" href="/designs" style="background:var(--foil);color:var(--wine-2)">See all <?= $nThemes ?> designs</a></p><?php endif; ?>
    </div>
  </section>
<?php
}

function sec_pricing(): void
{
    extract(page_vars());
?>
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
<?php
}

function sec_faq(): void
{
    extract(page_vars());
?>
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
<?php
}
