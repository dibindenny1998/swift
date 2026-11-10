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
    $pick = ['lumiere', 'vogue', 'journal', 'mono', 'marigold', 'reel'];
    $all = showcase_themes();
    $themes = $limit > 0 ? array_slice(array_replace(array_flip($pick), array_intersect_key($all, array_flip($pick))), 0, $limit, true) : $all;
    $f = preg_match('/^[a-z-]{3,20}$/', $_GET['f'] ?? '') ? $_GET['f'] : 'all';
    
?>
  <section class="sec gallery-band" id="designs" data-start-filter="<?= e($f) ?>">
    <div class="wrap">
      <?php if ($limit): ?><div class="sec-head">
          <h2 class="foil">Our favourite designs</h2>
          <p>Each one opens in its own way. Tap any design to preview it.</p>
      </div><?php endif; ?>
      <?php if (!$limit): ?>
      <div class="dz-bar" id="dz-bar">
        <label class="dz-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 20l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span class="sr">Search designs</span><input type="search" id="dz-q" placeholder="Search: Kerala, peacock, gold…" autocomplete="off"><button type="button" class="dz-clear" id="dz-clear" aria-label="Clear search" hidden>&times;</button></label>
        <button type="button" class="dz-fbtn" id="dz-fbtn" aria-haspopup="dialog" aria-controls="dz-sheet"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Filters<i id="dz-n" hidden></i></button>
      </div>
      <div class="dz-chips" role="group" aria-label="Plan">
        <button type="button" data-plan="" aria-pressed="true">All designs</button>
        <button type="button" data-plan="tier-free" aria-pressed="false">Free</button>
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
        <div class="dz-opts" data-group="plan"><button type="button" data-v="tier-free" aria-pressed="false">Free</button></div>
        <div class="dz-sheet-ft"><button type="button" class="btn alt" id="dz-reset">Clear all</button><button type="button" class="btn" id="dz-apply">Show designs</button></div>
      </div></div>
      <?php endif; ?>
      <div class="grid-designs<?= $limit ? ' grid-six' : ' dz-grid' ?>">
        <?php foreach ($themes as $id => $t):
            $photoLed = in_array($id, PHOTO_LED_THEMES, true); $fx = THEME_FX[$id] ?? '';
            $tags = implode(' ', $t['tags']) . ' tier-' . $t['tier'] . ($photoLed ? ' photo-led' : '') . ($fx ? ' animated' : ''); ?>
          <div class="gd<?= $t['tier'] === 'premium' ? ' gd-prem' : '' ?>" data-tags="<?= e($tags) ?>" data-q="<?= e(strtolower($t['name'] . ' ' . $t['note'] . ' ' . implode(' ', array_map(fn($x) => CATEGORIES[$x], $t['tags'])) . ($photoLed ? ' photo' : '') . ($fx ? ' animated ' . (THEME_OPEN[$id] ?? '') : ''))) ?>">
            <button type="button" class="gd-img js-preview" data-theme="<?= $id ?>" data-tier="<?= $t['tier'] ?>" data-name="<?= e($t['name']) ?>" aria-label="Preview <?= e($t['name']) ?>">
              <img src="<?= asset('assets/img/designs/' . $id . '.jpg') ?>" alt="<?= e($t['name']) ?> invite design" width="232" height="480" loading="lazy">
              <?php if ($fx): $cfx = in_array($fx, ['petals', 'confetti', 'leaves', 'blossom', 'hearts', 'marigolds', 'feathers'], true) ? 'petals' : ($fx === 'lanterns' ? 'lanterns' : 'sparkle'); ?><span class="gd-fx gd-fx-<?= $cfx ?>" aria-hidden="true"><?php for ($i = 0; $i < 9; $i++): ?><i></i><?php endfor; ?></span><?php endif; ?>
              <span class="gd-eye" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></span>
            </button>
            <b><?= e($t['name']) ?></b>
            <span class="gd-tags">
              <?php if ($t['tier'] === 'free'): ?><em class="tier tier-<?= $t['tier'] ?>"><?= TIER_NAMES[$t['tier']] ?></em><?php endif; ?>
              <?php if ($photoLed): ?><em class="feat-tag">Photo-led</em><?php endif; ?>
              <?php if ($fx): ?><em class="feat-tag">Animated</em><?php endif; ?>
            </span>
            <span class="gd-open"><?= e(THEME_OPEN[$id] ?? '') ?></span>
            <?php if ($t['tier'] === 'free' || $fx || $photoLed): ?><small class="gd-price"><?= $t['tier'] === 'free' ? '<b>Free</b>' : '' ?><?= $fx ? '<i>✨ Animated</i>' : ($photoLed ? '<i>Photo-led</i>' : '') ?></small><?php endif; ?>
          </div>
        <?php endforeach; ?>
      </div>
      <?php if (!$limit): ?><div class="dz-empty" id="dz-empty" hidden><p>No design matches that.</p><button type="button" class="btn alt" id="dz-empty-reset">Show all designs</button></div><?php endif; ?>
      <?php preview_modal(); ?>
      <?php if ($limit): ?><p style="text-align:center;margin-top:34px"><a class="btn" href="/designs" style="background:var(--foil);color:var(--wine-2)">See all designs</a></p><?php endif; ?>
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
    $cfg = ['ps' => price('standard'), 'pp' => price('premium'), 'offer' => offer_active(), 'photos' => $photos, 'video' => setting('demo_video'), 'brand' => setting('brand'), 'domain' => setting('site_domain'),
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

/** Founding-couples offer: Built for you at a lower price for the first few couples. Spots left come from admin. */
function founding(): array
{
    $total = max(0, (int)setting('founding_total')); $left = max(0, $total - (int)setting('founding_taken'));
    $end = (int)strtotime(setting('founding_until') ?: '2027-01-31 23:59:59');
    return ['on' => $left > 0 && time() < $end, 'left' => $left, 'total' => $total, 'price' => (int)setting('founding_price'), 'end' => $end];
}

function sec_pricing(): void
{
    extract(page_vars());
    $pb4u = (int)setting('price_built'); $fo = founding();
?>
  <section class="sec band" id="pricing">
    <div class="wrap">
      <div class="sec-head">
        <h2>Start free. Pay once if you want more.</h2>
        <p>No subscription. Build and preview your whole site first, then choose.</p>
      </div>
      <div class="plans plans3">
        <div class="plan">
          <h3>Free</h3>
          <p class="price">₹0 <small>free</small></p>
          <p class="who">Try it for one function</p>
          <ul>
            <li><?= $tick ?>1 event with maps and countdown</li>
            <li><?= $tick ?>2 designs: Classic and Blush</li>
            <li><?= $tick ?>One cover photo</li>
            <li><?= $tick ?>Live for 1 month</li>
            <li class="no"><?= $tick ?>"Crafted by <?= e($brand) ?>" mark</li>
          </ul>
          <a class="btn alt js-make" href="/create?t=classic">Start free</a>
        </div>
        <div class="plan pick">
          <h3>One Link Wedding</h3>
          <p class="price"><span class="foil">₹<?= $pp ?></span> <small>one time</small></p>
          <p class="who">Every function, every guest, one link</p>
          <ul>
            <li><?= $tick ?>All functions, with maps and countdown</li>
            <li><?= $tick ?>RSVP and headcount for each function</li>
            <li><?= $tick ?>Your story, 15 photos and a video</li>
            <li><?= $tick ?>All <?= $nThemes ?> designs</li>
            <li><?= $tick ?>Gift list and background music</li>
            <li><?= $tick ?>Live for 1 year, no <?= e($brand) ?> mark</li>
          </ul>
          <a class="btn js-make" href="/create">Choose One Link Wedding</a>
        </div>
        <div class="plan custom">
          <h3>Built for you</h3>
          <p class="price">₹<?= number_format($pb4u) ?> <small>fixed</small></p>
          <p class="who">Send us your details, we do the rest</p>
          <ul>
            <li><?= $tick ?>Everything in One Link Wedding</li>
            <li><?= $tick ?>We fill it in from your WhatsApp message</li>
            <li><?= $tick ?>We set up every function and your photos</li>
            <li><?= $tick ?>You check it and ask for changes</li>
            <li><?= $tick ?>Live for 1 year</li>
          </ul>
          <a class="btn alt" href="/custom">Send us your details</a>
        </div>
      </div>
      <?php if ($fo['on']): ?>
      <div class="founding"><div>
        <p><b>Founding couples:</b> the first <?= $fo['total'] ?> couples get Built for you for <b>₹<?= number_format($fo['price']) ?></b> instead of ₹<?= number_format($pb4u) ?>, if they let us show their site as an example (names hidden on request).</p>
        <p class="founding-meta"><b><?= $fo['left'] ?> of <?= $fo['total'] ?> spots left</b> · Ends <?= date('j M Y', $fo['end']) ?></p>
      </div><a class="btn small" href="/custom?founding=1">Claim a founding spot</a></div>
      <?php endif; ?>
      <p class="plans-note">You choose the plan on the preview screen, after you have seen your own website.</p>
    </div>
  </section>
<?php
}

function site_faq(): array
{
    $pp = price('premium'); $pb4u = number_format((int)setting('price_built'));
    $wa = normalize_phone(setting('support_phone'));
    return [
        ['Will older relatives be able to open it?', 'Yes. It opens from WhatsApp like any other link, on any phone. There is no app to install and no login.'],
        ['What if the link stops working near the wedding?', 'Every site runs on our paid hosting and we keep an eye on it. If anything looks wrong, message us' . ($wa ? ' on WhatsApp at +91 ' . $wa : ' on WhatsApp') . ' and we fix it the same day. If we can\'t, you get your money back, as set out in our refund terms.'],
        ['How long does it stay live?', 'Free sites stay live for 1 month. One Link Wedding and Built for you stay live for 1 year from the day you publish.'],
        ['Can I change times or venues after sending?', 'Yes. Edit it from your private link and every guest sees the update on the same link. No corrected cards.'],
        ['Is my payment and my family\'s data safe?', 'Payments go through PayU, so we never see your card or UPI details. Your site is only seen by people you send the link to, and it is hidden from Google. Our privacy policy has the details.'],
        ['Can you build it for me?', "Yes. With Built for you (₹$pb4u, fixed), send us your details and photos on WhatsApp and we set up the whole site for you to check."],
        ['Is it really free?', "Yes. The Free plan covers one function for 1 month, with maps and a countdown. One Link Wedding (₹$pp, one time) adds every function, RSVP, photos, a video and all designs."],
        ['Do I still need printed cards?', 'Many families print a few cards for the elders. Send the link to everyone, so every guest gets maps, updates and RSVP.'],
    ];
}

function sec_faq(): void
{
    echo faq_html(site_faq(), 'Questions couples ask');
}
