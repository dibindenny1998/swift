<?php
require __DIR__ . '/lib/bootstrap.php';
$brand = setting('brand');
$token = preg_match('/^[a-f0-9]{32}$/', $_GET['t'] ?? '') ? $_GET['t'] : '';
$editing = null;
if ($token) {
    $editing = find_invite('token', $token);
    if (!$editing) { header('Location: /create'); exit; }
}
if (!$editing) count_visit('create_views');

$init = ['theme' => isset(THEMES[$_GET['t'] ?? '']) ? $_GET['t'] : 'kasavu'];
if (!empty($_GET['n1'])) $init['p1'] = mb_substr(trim((string)$_GET['n1']), 0, 40);
if (!empty($_GET['n2'])) $init['p2'] = mb_substr(trim((string)$_GET['n2']), 0, 40);
$existing = null;
if ($editing) {
    $d = invite_data($editing);
    $existing = [
        'token' => $editing['token'],
        'paid' => $editing['status'] === 'paid',
        'data' => array_merge($d, ['theme' => $editing['theme']]),
        'photos' => array_map(fn($f) => ['kind' => 'old', 'name' => $f, 'url' => '/m/' . $editing['id'] . '/' . $f], $d['photos'] ?? []),
        'music' => !empty($d['music']) ? ['kind' => 'old', 'name' => $d['music'], 'url' => '/m/' . $editing['id'] . '/' . $d['music'], 'label' => $d['music_label'] ?? 'Your song'] : null,
    ];
}
$cfg = ['brand' => $brand, 'init' => $init, 'existing' => $existing, 'themes' => array_map(fn($t) => $t['name'], THEMES)];

site_head(($editing ? 'Edit your invite' : 'Make your invite') . ' | ' . $brand);
?>
<body>
<header class="top">
  <div class="wrap top-in">
    <a class="logo" href="/"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="12" cy="16" r="8.5" fill="none" stroke="#C2183F" stroke-width="2.6"/><circle cx="20" cy="16" r="8.5" fill="none" stroke="#B8913A" stroke-width="2.6"/></svg><?= e($brand) ?></a>
    <?php if ($editing): ?><a class="btn small alt" href="/p/<?= e($editing['token']) ?>">Back to my invite</a><?php endif; ?>
  </div>
</header>

<main class="wrap builder">
  <form id="f" novalidate>
    <nav class="steps-nav" aria-label="Steps">
      <button type="button" data-go="0" aria-current="step">Design</button>
      <button type="button" data-go="1">Names</button>
      <button type="button" data-go="2">Events</button>
      <button type="button" data-go="3">Photos</button>
      <button type="button" data-go="4"><?= $editing ? 'Save' : 'Finish' ?></button>
    </nav>

    <section class="panel" data-step="0">
      <h1>Pick a design</h1>
      <p class="lead">You can switch designs any time before you share.</p>
      <div class="theme-pick">
        <?php foreach (THEMES as $id => $t): ?>
          <label><input type="radio" name="theme" value="<?= $id ?>"><img src="/assets/img/designs/<?= $id ?>.jpg" alt="" width="180" height="320" loading="lazy"><b><?= e($t['name']) ?></b></label>
        <?php endforeach; ?>
      </div>
      <div class="nav-btns" style="margin-top:26px"><button type="button" class="btn js-next">Next: your names</button></div>
    </section>

    <section class="panel" data-step="1" hidden>
      <h1>Who is getting married?</h1>
      <p class="lead">Names appear in the order you type them. Write in any language.</p>
      <div class="row2">
        <div class="field"><label for="p1">First name</label><input id="p1" name="p1" maxlength="40" required placeholder="Arjun" autocomplete="off"></div>
        <div class="field"><label for="p2">Second name</label><input id="p2" name="p2" maxlength="40" required placeholder="Meera" autocomplete="off"></div>
      </div>
      <div class="row2">
        <div class="field"><label for="p1_family">Family line for the first name</label><textarea id="p1_family" name="p1_family" maxlength="160" rows="2" placeholder="Son of Rajan &amp; Latha Menon, Thrissur"></textarea></div>
        <div class="field"><label for="p2_family">Family line for the second name</label><textarea id="p2_family" name="p2_family" maxlength="160" rows="2" placeholder="Daughter of Suresh &amp; Anitha Nair, Kochi"></textarea></div>
      </div>
      <div class="field"><label for="intro">Line above the names</label><input id="intro" name="intro" maxlength="80" placeholder="Together with their families"><small>Leave empty to use the text shown.</small></div>
      <div class="field"><label for="line">Line below the names</label><input id="line" name="line" maxlength="100" placeholder="invite you to celebrate their wedding"></div>
      <p class="err" role="alert"></p>
      <div class="nav-btns"><button type="button" class="btn js-next">Next: events</button><button type="button" class="btn alt js-back">Back</button></div>
    </section>

    <section class="panel" data-step="2" hidden>
      <h1>When and where?</h1>
      <p class="lead">Add each function. The one called Wedding shows at the top with the countdown.</p>
      <div id="events"></div>
      <button type="button" class="btn alt small" id="add-ev">Add another event</button>
      <p class="err" role="alert"></p>
      <div class="nav-btns" style="margin-top:22px"><button type="button" class="btn js-next">Next: photos</button><button type="button" class="btn alt js-back">Back</button></div>
    </section>

    <section class="panel" data-step="3" hidden>
      <h1>Photos, music and a message</h1>
      <p class="lead">All optional. The first photo is shown large under the countdown.</p>
      <div class="field">
        <span>Photos</span>
        <label class="drop" for="photo-in"><b>Add photos</b><small>Up to 15. Standard shows the first 4.</small></label>
        <input type="file" id="photo-in" accept="image/*" multiple hidden>
        <div class="thumbs" id="thumbs"></div>
      </div>
      <div class="field">
        <span>Background music <span class="tag">Premium</span></span>
        <label class="drop" for="music-in" id="music-drop"><b id="music-label">Add a song (MP3 or M4A)</b><small>Plays when guests open the invite. Up to 10 MB.</small></label>
        <input type="file" id="music-in" accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/aac,.mp3,.m4a" hidden>
        <button type="button" class="btn alt small" id="music-x" hidden>Remove song</button>
      </div>
      <div class="field"><label for="message">A message for your guests</label><textarea id="message" name="message" maxlength="500" rows="3" placeholder="With the blessings of our elders, we warmly invite you and your family to share our joy."></textarea></div>
      <div class="field"><label for="closing">Closing line</label><input id="closing" name="closing" maxlength="120" placeholder="Your presence is the blessing we look forward to."></div>
      <div class="row2">
        <div class="field"><label for="contact_name">Contact person for guests</label><input id="contact_name" name="contact_name" maxlength="40" placeholder="Rajan Menon"></div>
        <div class="field"><label for="contact_phone">Their phone</label><input id="contact_phone" name="contact_phone" inputmode="tel" maxlength="15" placeholder="98765 43210"></div>
      </div>
      <p class="err" role="alert"></p>
      <div class="nav-btns"><button type="button" class="btn js-next">Next</button><button type="button" class="btn alt js-back">Back</button></div>
    </section>

    <section class="panel" data-step="4" hidden>
      <?php if ($editing): ?>
        <h1>Save your changes</h1>
        <p class="lead"><?= $editing['status'] === 'paid' ? 'Your shared link updates as soon as you save.' : 'Your preview updates as soon as you save.' ?></p>
      <?php else: ?>
        <h1>See your invite</h1>
        <p class="lead">We'll keep your invite saved under this number, so you can come back and finish later.</p>
        <div class="field"><label for="phone">Your WhatsApp number</label><input id="phone" name="phone" inputmode="tel" autocomplete="tel" maxlength="15" placeholder="98765 43210" required></div>
        <div class="field"><label for="email">Email (optional)</label><input id="email" name="email" type="email" autocomplete="email" maxlength="120" placeholder="you@example.com"><small>For your receipt and edit link.</small></div>
      <?php endif; ?>
      <p class="err" role="alert"></p>
      <div class="nav-btns"><button type="submit" class="btn" id="save"><?= $editing ? 'Save changes' : 'See my invite' ?></button><button type="button" class="btn alt js-back">Back</button></div>
      <?php if (!$editing): ?><p class="note" style="margin-top:20px">Free to preview. You only pay if you want to publish and share it.</p><?php endif; ?>
    </section>
  </form>

  <aside class="stage" aria-label="Live preview">
    <div class="phone"><iframe id="pv" src="/frame.php" title="Live preview"></iframe></div>
  </aside>
</main>

<button type="button" class="btn prev-fab" id="open-sheet">Preview</button>
<div class="sheet" id="sheet" hidden><div class="sheet-in"><div class="sheet-bar"><b>Preview</b><button type="button" class="btn small alt" id="close-sheet">Close</button></div><iframe id="pv-m" title="Live preview"></iframe></div></div>

<script>window.WL_CFG = <?= json_for_script($cfg) ?>;</script>
<script src="<?= asset('assets/create.js') ?>"></script>
<script>fbq('track', 'ViewContent', { content_name: 'Invite builder' });</script>
</body>
</html>
