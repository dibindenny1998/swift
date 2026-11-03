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
    // the home page leads with the photo-led and animated Premium designs; /designs shows everything in the same order
    $pick = ['lumiere', 'vogue', 'bloom', 'journal', 'mughal', 'seal'];
    $all = showcase_themes();
    $themes = $limit > 0 ? array_slice(array_intersect_key($all, array_flip($pick)), 0, $limit, true) : $all;
    $f = preg_match('/^[a-z-]{3,20}$/', $_GET['f'] ?? '') ? $_GET['f'] : 'all';
    $fxNames = ['petals' => 'Falling petals', 'sparkle' => 'Gold sparkles', 'lanterns' => 'Floating lanterns'];
?>
  <section class="sec gallery-band" id="designs" data-start-filter="<?= e($f) ?>">
    <div class="wrap">
      <?php if ($limit): ?><div class="sec-head">
          <span class="tag" style="margin:0 0 12px">Premium</span>
          <h2 class="foil">Photo-led &amp; animated designs</h2>
          <p>Your photo fills the first screen, with petals, sparkles or lanterns moving over it. Tap any design to preview it.</p>
      </div><?php endif; ?>
      <?php if (!$limit): ?>
      <div class="dz-bar" id="dz-bar">
        <label class="dz-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span class="sr">Search designs</span><input type="search" id="dz-q" placeholder="Search: Kerala, peacock, gold…" autocomplete="off"><button type="button" class="dz-clear" id="dz-clear" aria-label="Clear search" hidden>&times;</button></label>
        <button type="button" class="dz-fbtn" id="dz-fbtn" aria-haspopup="dialog" aria-controls="dz-sheet"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Filters<i id="dz-n" hidden></i></button>
      </div>
      <div class="dz-chips" role="group" aria-label="Plan">
        <button type="button" data-plan="" aria-pressed="true">All <?= $nThemes ?></button>
        <button type="button" data-plan="tier-free" aria-pressed="false">Free</button>
        <button type="button" data-plan="tier-standard" aria-pressed="false">₹<?= $ps ?></button>
        <button type="button" data-plan="tier-premium" aria-pressed="false">₹<?= $pp ?> Premium</button>
        <button type="button" data-plan="animated" aria-pressed="false">✨ Animated</button>
        <button type="button" data-plan="photo-led" aria-pressed="false">Photo-led</button>
      </div>
      <p class="dz-count" id="dz-count" aria-live="polite"></p>
      <div class="dz-sheet" id="dz-sheet" hidden role="dialog" aria-modal="true" aria-labelledby="dz-sheet-t"><div class="dz-sheet-box">
        <div class="dz-sheet-hd"><h3 id="dz-sheet-t">Filters</h3><button type="button" class="pv-x" id="dz-x" aria-label="Close filters">&times;</button></div>
        <p class="dz-lbl">Tradition</p>
        <div class="dz-opts" data-group="trad"><?php foreach (CATEGORIES as $k => $label): ?><button type="button" data-v="<?= $k ?>" aria-pressed="false"><?= e($label) ?></button><?php endforeach; ?></div>
        <p class="dz-lbl">Style</p>
        <div class="dz-opts" data-group="style"><button type="button" data-v="photo-led" aria-pressed="false">Photo-led</button><button type="button" data-v="animated" aria-pressed="false">Animated</button></div>
        <p class="dz-lbl">Plan</p>
        <div class="dz-opts" data-group="plan"><button type="button" data-v="tier-free" aria-pressed="false">Free</button><button type="button" data-v="tier-standard" aria-pressed="false">₹<?= $ps ?></button><button type="button" data-v="tier-premium" aria-pressed="false">₹<?= $pp ?></button></div>
        <div class="dz-sheet-ft"><button type="button" class="btn alt" id="dz-reset">Clear all</button><button type="button" class="btn" id="dz-apply">Show designs</button></div>
      </div></div>
      <?php endif; ?>
      <div class="grid-designs<?= $limit ? ' grid-six' : ' dz-grid' ?>">
        <?php foreach ($themes as $id => $t):
            $photoLed = in_array($id, PHOTO_LED_THEMES, true); $fx = THEME_FX[$id] ?? '';
            $tags = implode(' ', $t['tags']) . ' tier-' . $t['tier'] . ($photoLed ? ' photo-led' : '') . ($fx ? ' animated' : ''); ?>
          <div class="gd<?= $t['tier'] === 'premium' ? ' gd-prem' : '' ?>" data-tags="<?= e($tags) ?>" data-q="<?= e(strtolower($t['name'] . ' ' . $t['note'] . ' ' . implode(' ', array_map(fn($x) => CATEGORIES[$x], $t['tags'])) . ($photoLed ? ' photo' : '') . ($fx ? ' animated ' . $fxNames[$fx] : ''))) ?>">
            <button type="button" class="gd-img js-preview" data-theme="<?= $id ?>" data-tier="<?= $t['tier'] ?>" data-name="<?= e($t['name']) ?>" aria-label="Preview <?= e($t['name']) ?>">
              <img src="<?= asset('assets/img/designs/' . $id . '.jpg') ?>" alt="<?= e($t['name']) ?> invite design" width="232" height="480" loading="lazy">
              <?php if ($fx): ?><span class="gd-fx gd-fx-<?= $fx ?>" aria-hidden="true"><?php for ($i = 0; $i < 9; $i++): ?><i></i><?php endfor; ?></span><?php endif; ?>
              <span class="gd-eye" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></span>
            </button>
            <b><?= e($t['name']) ?></b>
            <span class="gd-tags">
              <?php if ($t['tier'] !== 'standard'): ?><em class="tier tier-<?= $t['tier'] ?>"><?= TIER_NAMES[$t['tier']] ?></em><?php endif; ?>
              <?php if ($photoLed): ?><em class="feat-tag">Photo-led</em><?php endif; ?>
              <?php if ($fx): ?><em class="feat-tag" title="<?= e($fxNames[$fx]) ?>">Animated</em><?php endif; ?>
            </span>
            <small class="gd-price"><?= $t['tier'] === 'free' ? 'Free' : '₹' . ($t['tier'] === 'premium' ? $pp : $ps) ?><?= $fx ? '<i>✨ Animated</i>' : ($photoLed ? '<i>Photo-led</i>' : '') ?></small>
          </div>
        <?php endforeach; ?>
      </div>
      <?php if (!$limit): ?><div class="dz-empty" id="dz-empty" hidden><p>No design matches that.</p><button type="button" class="btn alt" id="dz-empty-reset">Show all designs</button></div><?php endif; ?>
      <?php preview_modal(); ?>
      <?php if ($limit): ?><p style="text-align:center;margin-top:34px"><a class="btn" href="/designs" style="background:var(--foil);color:var(--wine-2)">See all <?= $nThemes ?> designs</a></p><?php endif; ?>
    </div>
  </section>
<?php
}

/** The design preview pop-up: a phone showing the full sample invite. Printed once per page. */
function preview_modal(): void
{
    static $done = false;
    if ($done) return;
    $done = true;
    $photos = array_values(array_filter([slot_url('demo-1'), slot_url('demo-2'), slot_url('demo-3')]));
    $cfg = ['photos' => $photos, 'video' => setting('demo_video'), 'brand' => setting('brand'), 'domain' => setting('site_domain'),
        'led' => array_values(array_filter(array_map(function ($id) {
            // each design leads with its own couple: photo-led designs use their cover photo, the rest their sample couple
            $u = slot_url((in_array($id, PHOTO_LED_THEMES, true) ? 'theme-' : 'sample-') . $id);
            return $u ? [$id, $u] : null;
        }, array_keys(THEMES))))];
    echo '<div class="pv-modal" id="pv-modal" hidden role="dialog" aria-modal="true" aria-labelledby="pv-title"><div class="pv-box">'
        . '<div class="pv-head"><div><small id="pv-tier"></small><h3 id="pv-title">Preview</h3></div><button type="button" class="pv-x" id="pv-x" aria-label="Close preview">&times;</button></div>'
        . '<div class="phone pv-phone"><iframe id="pv-frame" title="Design preview"></iframe></div>'
        . '<p class="pv-note">Sample names and photos. Scroll inside the phone to see the whole invite.</p>'
        . '<a class="btn" id="pv-use" href="/create">Use this design</a></div></div>'
        . '<script>window.WL_PREVIEW = ' . json_for_script($cfg) . ';</script>'
        . '<script src="' . asset('assets/samples.js') . '"></script><script src="' . asset('assets/preview.js') . '"></script>';
}

function sec_pricing(): void
{
    extract(page_vars());
?>
  <section class="sec band" id="pricing">
    <div class="wrap">
      <div class="sec-head">
        <h2>Start free. Pay once if you want more.</h2>
        <p>No subscription. Free links stay live for 3 months, Standard for 6 months and Premium for a full year.</p>
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
            <li><?= $tick ?>Live for 3 months</li>
            <li class="no"><?= $tick ?>"Crafted by <?= e($brand) ?>" mark on the design</li>
          </ul>
          <a class="btn alt js-make" href="/create?t=classic">Start free</a>
        </div>
        <div class="plan">
          <h3>Standard</h3>
          <p class="price">₹<?= $ps ?> <small>one time</small></p>
          <p class="who">All the classic designs</p>
          <ul>
            <li><?= $tick ?><?= count(themes_by_tier('standard')) ?> Standard designs, plus the 2 free ones</li>
            <li><?= $tick ?>Up to 3 events with maps and calendar</li>
            <li><?= $tick ?>One cover photo</li>
            <li><?= $tick ?>Countdown and family details</li>
            <li><?= $tick ?>Edit anytime, live for 6 months</li>
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
            <li><?= $tick ?><?= count(themes_by_tier('premium')) ?> Premium designs, plus all the others</li>
            <li><?= $tick ?>Gift list: guests reserve what you need</li>
            <li><?= $tick ?>RSVPs with guest list and headcount</li>
            <li><?= $tick ?>Gallery of up to 15 photos guests can download</li>
            <li><?= $tick ?>Pre-wedding or wishes video</li>
            <li><?= $tick ?>Background music and up to 6 events</li>
            <li><?= $tick ?>Live for 1 year, no <?= e($brand) ?> credit</li>
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

function site_faq(): array
{
    $ps = price('standard'); $pp = price('premium');
    return [
        ['Is TheWedLink really free?', "Yes. The Basic plan is free for 3 months: make a wedding website with the Classic or Blush design and up to 2 events, then share the link on WhatsApp. Pay only if you want more designs, photos, RSVPs or a gift list (Standard ₹$ps or Premium ₹$pp, one time)."],
        ['What is a wedding website?', 'A wedding website is a single link that replaces the printed card. Guests open it from WhatsApp and see your invitation, every event with Google Maps directions, a countdown, RSVP, gift list and photos.'],
        ['Do guests need to install anything?', 'No. The invite is a web page. It opens in WhatsApp, Instagram or any browser on any phone.'],
        ['Can I change details after I share the link?', 'Yes. You get a private edit link. Change times, venues, photos or wording, and the shared link shows the update straight away.'],
        ['When do I pay?', 'Only after you have built and previewed your full website. If you don\'t like it, close the page and pay nothing.'],
        ['How does the gift list work?', 'On Premium, you list gifts you would love. Guests tap one, type their name and reserve it. Others then see it as reserved, and you see who picked what.'],
        ['Is there a design for our tradition?', 'Yes. There are designs for Hindu, Christian, Muslim and Sikh weddings, Kerala weddings, and modern designs that suit everyone. Every line of text can be changed.'],
        ['How long does the link work?', 'Free links work for 3 months, Standard for 6 months and Premium for a full year from the day you publish. Upgrading later adds time and never shortens it.'],
        ['Can I write in Malayalam, Hindi, Tamil or Arabic?', 'Yes. Type in any Indian language or Arabic in any field and the invite shows it in a matching font.'],
        ['Is the payment safe?', 'Payments go through Razorpay. Pay by UPI, card or net banking. We never see your card or UPI details.'],
        ['Can I also make a marriage biodata?', 'Yes. The biodata maker is free: choose your religion, fill in your details and download a PDF or image to share on WhatsApp.'],
    ];
}

function sec_faq(): void
{
    echo faq_html(site_faq(), 'Questions couples ask');
}
