<?php
/* Image slots: places on the site that take a photo you generate and upload in Admin → Images.
   Until a slot has an image, the site shows a gradient placeholder there. */

/* Style endings added to every prompt, so all pictures share one look: bright, airy, blush, ivory and champagne gold. */
const SLOT_STYLE = [
    'photo' => 'Photorealistic luxury editorial wedding photography, full-frame camera with an 85mm lens, soft natural light, bright and airy, soft blush pink, ivory and champagne-gold palette, refined and joyful mood, natural skin and fabric texture, high-end bridal magazine quality. No text, no letters, no logos, no watermark.',
    'still' => 'Photorealistic luxury wedding still-life photography, soft natural daylight, bright and airy, blush pink, ivory and champagne-gold palette, shallow depth of field, high-end editorial quality. No people, no text, no letters, no logos, no watermark.',
    'texture' => 'Photorealistic fine-art texture photograph, soft even light, subtle and elegant, very high resolution. No people, no text, no letters, no logos, no watermark.',
];

const SLOTS = [
    'demo-1' => ['group' => 'Start here: home page', 'label' => 'Demo couple photo 1 (cover)', 'where' => 'Fills the live invite preview on the home page and the photo-led design cards', 'w' => 1200, 'h' => 1500, 'ratio' => '4:5', 'kind' => 'photo',
        'prompt' => 'Romantic portrait of a young Indian bride and groom standing close, foreheads almost touching and smiling softly, the bride in a blush-pink and gold silk lehenga with fresh jasmine in her hair and delicate gold jewellery, the groom in an ivory sherwani with a champagne stole, in a sunlit garden with softly blurred blush roses and white flowers behind them, warm late-afternoon light.'],
    'demo-2' => ['group' => 'Start here: home page', 'label' => 'Demo couple photo 2', 'where' => 'Second photo in the home page invite preview (it fades in after photo 1)', 'w' => 1200, 'h' => 1200, 'ratio' => '1:1', 'kind' => 'photo',
        'prompt' => 'Close-up of an Indian bride\'s and groom\'s hands intertwined, her hands with intricate bridal mehendi and thin gold bangles, his hand with a gold ring, resting on blush pink silk with a few white jasmine buds and rose petals.'],
    'demo-3' => ['group' => 'Start here: home page', 'label' => 'Demo couple photo 3', 'where' => 'Third photo in the home page invite preview', 'w' => 1200, 'h' => 1200, 'ratio' => '1:1', 'kind' => 'photo',
        'prompt' => 'Candid joyful moment of an Indian bride and groom laughing together as they walk through a garden aisle lined with white and blush flowers, the bride in an ivory and gold saree, the groom in a cream kurta, soft backlight and gentle movement.'],
    'hero' => ['group' => 'Start here: home page', 'label' => 'Hero backdrop', 'where' => 'Soft background behind the phones at the top of the home page', 'w' => 2400, 'h' => 1600, 'ratio' => '3:2', 'kind' => 'still',
        'prompt' => 'Elegant Indian wedding tablescape: blush pink and ivory garden roses, white jasmine garlands, a champagne silk runner, crystal glasses and slim gold candle holders on an ivory linen table beside a tall sunlit window. Keep the left half of the picture light, soft and almost empty, with the flowers and detail on the right third.'],
    'og' => ['group' => 'Start here: home page', 'label' => 'Share preview image', 'where' => 'The picture WhatsApp, Instagram and Facebook show when your site link is shared', 'w' => 1200, 'h' => 630, 'ratio' => '1.91:1', 'kind' => 'still',
        'prompt' => 'Overhead flat lay on soft blush silk: a blank ivory invitation card with a thin gold-foil edge (no writing on it), a gold wax seal, two gold wedding rings, scattered blush rose petals, jasmine buds and a champagne satin ribbon. Calm empty space in the centre and left.'],
    'cta' => ['group' => 'Start here: home page', 'label' => 'Final banner', 'where' => 'Behind "Your guests are waiting for the date" near the bottom of the home page', 'w' => 2400, 'h' => 1200, 'ratio' => '2:1', 'kind' => 'still',
        'prompt' => 'Wide view of a dreamy daytime Indian wedding mandap with a canopy of blush pink and white flowers, hanging jasmine strands, ivory drapes and soft champagne-gold details, sunlight streaming in, rows of white chairs softly blurred in the foreground.'],
    'custom' => ['group' => 'Other pages', 'label' => 'Custom plan banner', 'where' => 'Top of the Custom website page (/custom)', 'w' => 2000, 'h' => 900, 'ratio' => '20:9', 'kind' => 'still',
        'prompt' => 'Luxury flat lay on ivory linen: an open laptop and a smartphone side by side with blank glowing screens, surrounded by blush roses, eucalyptus sprigs, a gold wax seal, a silk ribbon and a fountain pen.'],
];

/* Photo-led designs: a real couple photo, shown on their design cards and as the first screen until a couple adds their own. */
const PHOTO_LED_PROMPTS = [
    'bloom' => 'Romantic portrait of an Indian bride and groom framed by a tall arch of blush roses and white flowers, the bride in a blush-pink lehenga, the groom in an ivory sherwani, smiling at each other, soft daylight, centred composition.',
    'lumiere' => 'Full-length romantic portrait of an Indian bride and groom walking hand in hand down a garden aisle of white and blush flowers, seen slightly from behind as she looks back over her shoulder, the bride in an ivory and gold lehenga with a long sheer veil, the groom in an ivory sherwani, golden-hour backlight. Keep the bottom third simple and slightly darker so white names can sit on top.',
    'vogue' => 'High-fashion editorial portrait of an elegant Indian bride and groom standing side by side under a warm stone archway, full length, poised and confident, the bride in a champagne-gold lehenga with statement jewellery, the groom in a tailored ivory bandhgala, soft directional light, magazine-cover look. Keep the top and bottom of the frame simple so titles can sit there.',
    'journal' => 'Candid, warm photo of a laughing Indian couple sitting close on the steps of a sunlit veranda with pots of white flowers, the bride in a soft pink saree with jasmine in her hair, the groom in a cream kurta, natural and intimate, like a favourite photo from a family album.',
];

/* Soft backgrounds behind the names on the illustrated designs (optional). */
const THEME_SLOT_PROMPTS = [
    'lavender' => 'Soft lilac and lavender watercolour wash on white cold-press paper with delicate lavender sprigs at the top corners.',
    'mehndi' => 'Deep bottle-green raw silk with a fine gold henna paisley border along the top and bottom edges.',
    'mughal' => 'Ivory marble with faint gold Mughal jaali lattice pattern along the edges and a soft warm glow at the top.',
    'classic' => 'Warm ivory handmade cotton paper with a soft deckled edge and the faintest linen texture.',
    'blush' => 'Soft blush pink watercolour wash on cold-press paper, with one delicate pale pink rose softly out of focus at the top edge.',
    'champagne' => 'Champagne and blush silk satin with gentle flowing folds and a few fine gold-foil flecks.',
    'kasavu' => 'Ivory Kerala handloom cotton with a rich gold zari kasavu border running down both side edges.',
    'noor' => 'Deep emerald velvet with a faint embossed gold eight-point star pattern along the edges. No calligraphy.',
    'sindoor' => 'Rich crimson raw silk with subtle gold brocade along the edges and soft folds.',
    'kesar' => 'Royal blue silk with saffron, pink and gold phulkari embroidery along the top and bottom edges.',
    'grace' => 'Dusty blue watercolour wash on textured cotton paper with a faint silver shimmer.',
    'marigold' => 'Pale butter-yellow textured paper with soft-focus orange and yellow marigold petals scattered around the edges.',
    'nilavu' => 'Deep navy night sky with a soft glowing moon near the top and tiny gold stars.',
    'mullappoo' => 'Pure white textured paper with soft-focus jasmine flowers and green leaves in the top corners.',
    'thamara' => 'Soft pink watercolour wash with faint pink lotus petals along the bottom edge.',
    'gulmohar' => 'Warm ivory paper with a softly blurred branch of red-orange gulmohar flowers coming in from the top corner.',
    'sage' => 'Sage green and olive watercolour washes bleeding into ivory paper at the top corners, with delicate eucalyptus sprigs.',
    'seal' => 'Champagne fine-art paper with soft shadows of dried flowers, baby\'s breath and cream roses along the top edge.',
    'ink' => 'Warm ivory handmade cotton paper with deckled edges and a faint ink-wash texture.',
    'toile' => 'Ivory paper with a faint navy toile de Jouy pattern of trees and flowers along the bottom edge only.',
    'velvet' => 'Wine-red crushed velvet with soft highlights and a faint gold art-deco line pattern at the edges.',
    'gopuram' => 'Deep maroon handmade paper with faint gold South Indian temple-pattern borders.',
    'mayil' => 'Deep teal silk with soft-focus peacock feathers along the side edges and a gentle gold shimmer.',
    'qamar' => 'Midnight navy to deep purple night sky with soft gold bokeh and faint stars.',
    'chapel' => 'Soft ivory and pearl paper with a faint glow of stained-glass colours (sapphire, rose, amber) at the top, like light falling from a church window.',
    'jaipur' => 'Pink sandstone wall with a faint carved jharokha arch outline at the top, in warm Rajasthan sunlight.',
];

function all_slots(): array
{
    $s = SLOTS;
    // photo-led designs come right after the home page pictures: they make the design cards look real
    $photo = [];
    foreach (PHOTO_LED_PROMPTS as $id => $prompt) {
        if (!isset(THEMES[$id])) continue;
        $photo['theme-' . $id] = ['group' => 'Photo-led designs', 'label' => THEMES[$id]['name'] . ' couple photo', 'where' => 'The ' . THEMES[$id]['name'] . ' card on the home page and Designs page, and its first screen until a couple adds their own photo',
            'w' => 1080, 'h' => 1920, 'ratio' => '9:16', 'kind' => 'photo', 'prompt' => $prompt];
    }
    $out = [];
    foreach ($s as $k => $v) { if ($v['group'] === 'Other pages' && $photo) { $out += $photo; $photo = []; } $out[$k] = $v; }
    $out += $photo;
    foreach (THEMES as $id => $t) {
        if (isset(PHOTO_LED_PROMPTS[$id])) continue;
        $out['theme-' . $id] = ['group' => 'Design backdrops (optional)', 'label' => $t['name'] . ' backdrop', 'where' => 'Faint background behind the names on the ' . $t['name'] . ' design',
            'w' => 1080, 'h' => 1920, 'ratio' => '9:16', 'kind' => 'texture',
            'prompt' => 'Vertical background for a luxury wedding invitation: ' . (THEME_SLOT_PROMPTS[$id] ?? 'soft elegant paper texture.') . ' Keep the centre plain and calm so names and text can sit on top.'];
    }
    return $out;
}

/** The full prompt, ready to paste: description, shared style and the exact size. */
function slot_prompt(array $slot): string
{
    $orient = $slot['w'] > $slot['h'] ? 'landscape' : ($slot['w'] < $slot['h'] ? 'portrait' : 'square');
    return $slot['prompt'] . ' ' . (SLOT_STYLE[$slot['kind'] ?? 'photo'] ?? SLOT_STYLE['photo'])
        . ' Size: ' . $slot['w'] . ' x ' . $slot['h'] . ' px, ' . $orient . ' (aspect ratio ' . $slot['ratio'] . ').';
}

function slot_file(string $key): string { return data_dir() . '/site/' . $key . '.jpg'; }

function slot_url(string $key): string
{
    if (!preg_match('/^[a-z0-9-]{2,40}$/', $key)) return '';
    $f = slot_file($key);
    if (is_file($f)) return '/s/' . $key . '.jpg?v=' . substr((string)filemtime($f), -6);
    $bundled = dirname(__DIR__) . '/assets/img/slots/' . $key . '.jpg';
    if (is_file($bundled)) return asset('assets/img/slots/' . $key . '.jpg');
    return '';
}

/** <img> when the slot has a picture, otherwise a gradient placeholder. Add ?slots=1 to any page to see slot names. */
function slot_img(string $key, string $class = '', string $alt = '', bool $lazy = true): string
{
    $url = slot_url($key);
    if ($url) return '<img class="slot ' . e($class) . '" src="' . e($url) . '" alt="' . e($alt) . '"' . ($lazy ? ' loading="lazy"' : '') . ' decoding="async">';
    $slots = all_slots();
    $label = !empty($_GET['slots']) && isset($slots[$key]) ? '<span class="slot-label">' . e($slots[$key]['label']) . ' · ' . $slots[$key]['w'] . '×' . $slots[$key]['h'] . '</span>' : '';
    return '<div class="slot slot-ph ' . e($class) . '" data-slot="' . e($key) . '" role="presentation">' . $label . '</div>';
}

/** Map of theme id => backdrop URL, for the invite renderer. */
function theme_backdrops(): array
{
    $m = [];
    foreach (THEMES as $id => $t) { $u = slot_url('theme-' . $id); if ($u) $m[$id] = $u; }
    return $m;
}
