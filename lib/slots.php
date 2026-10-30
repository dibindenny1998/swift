<?php
/* Image slots: places on the site that take a photo you generate and upload in Admin → Images.
   Until a slot has an image, the site shows a gradient placeholder there. */

const SLOT_STYLE = 'Luxury editorial wedding photography, soft natural light, shallow depth of field, rich but soft colours, high detail, no text, no letters, no logos, no watermark.';

const SLOTS = [
    'hero' => ['group' => 'Landing page', 'label' => 'Hero backdrop', 'where' => 'Behind the phones at the top of the home page', 'w' => 2400, 'h' => 1600, 'ratio' => '3:2',
        'prompt' => 'Luxury Indian wedding table styling photographed from a low angle: blush pink and ivory roses, white jasmine garlands, brass diyas and slim gold candles glowing, champagne silk drapes in the background, scattered rose petals and fine gold confetti on an ivory linen table. Warm evening light, creamy bokeh, 85mm lens. Keep the centre calm and softly blurred. No people.'],
    'cat-hindu' => ['group' => 'Landing page', 'label' => 'Hindu category card', 'where' => 'Design categories section', 'w' => 1200, 'h' => 1500, 'ratio' => '4:5',
        'prompt' => 'Close-up of an Indian Hindu bride\'s hands with intricate mehendi and gold temple bangles, holding a brass plate with jasmine flowers, kumkum and a small lit diya. Red and gold silk saree fabric softly blurred behind. Warm golden light. Hands only, no face.'],
    'cat-christian' => ['group' => 'Landing page', 'label' => 'Christian category card', 'where' => 'Design categories section', 'w' => 1200, 'h' => 1500, 'ratio' => '4:5',
        'prompt' => 'Two gold wedding rings resting on an open vintage Bible beside a bouquet of white roses and lilies, ivory lace and silk ribbon, soft light from a church stained-glass window blurred in the background. Warm ivory, pearl and gold tones. No people.'],
    'cat-muslim' => ['group' => 'Landing page', 'label' => 'Muslim category card', 'where' => 'Design categories section', 'w' => 1200, 'h' => 1500, 'ratio' => '4:5',
        'prompt' => 'Elegant Nikah details: a bride\'s hennaed hands holding an open emerald velvet ring box with a gold ring, red rose petals and a small brass lantern on ivory silk, soft light from an arched window. Emerald, ivory and gold palette. Hands only, no face, no script or calligraphy.'],
    'cat-sikh' => ['group' => 'Landing page', 'label' => 'Sikh category card', 'where' => 'Design categories section', 'w' => 1200, 'h' => 1500, 'ratio' => '4:5',
        'prompt' => 'Anand Karaj wedding details: a bride\'s hands wearing red and ivory chooda bangles with gold kalire hanging from the wrists, a saffron and pink silk dupatta, scattered marigold petals, warm soft light. Saffron, pink and gold palette. Hands only, no face.'],
    'cat-kerala' => ['group' => 'Landing page', 'label' => 'Kerala category card', 'where' => 'Design categories section', 'w' => 1200, 'h' => 1500, 'ratio' => '4:5',
        'prompt' => 'Kerala wedding still life: an ivory kasavu saree with a wide gold zari border folded on dark wood, a glowing brass nilavilakku oil lamp, strings of jasmine (mullappoo), a banana leaf and a gold temple necklace. Warm morning light. No people.'],
    'cat-modern' => ['group' => 'Landing page', 'label' => 'Modern category card', 'where' => 'Design categories section', 'w' => 1200, 'h' => 1500, 'ratio' => '4:5',
        'prompt' => 'Modern minimalist wedding flat lay seen from above: two champagne glasses, white garden roses and eucalyptus, two gold rings on a blush velvet tray, ivory silk ribbon, soft shadows. Blush, ivory and champagne gold palette. No people.'],
    'cta' => ['group' => 'Landing page', 'label' => 'Final banner', 'where' => 'Behind "Your guests are waiting" near the bottom of the home page', 'w' => 2400, 'h' => 1200, 'ratio' => '2:1',
        'prompt' => 'Wide view of a luxurious Indian wedding mandap at dusk, decorated with thousands of warm fairy lights, hanging strands of white flowers and marigolds, gold drapes and candles. Dreamy bokeh, deep wine and gold tones, cinematic. No people.'],
    'og' => ['group' => 'Landing page', 'label' => 'Share preview image', 'where' => 'Shown when your website link is shared on WhatsApp or Facebook', 'w' => 1200, 'h' => 630, 'ratio' => '1.91:1',
        'prompt' => 'Luxury wedding invitation flat lay seen from above: an ivory card with gold foil edges (blank, no writing), blush roses, jasmine, two gold rings and a silk ribbon on a soft blush background. Plenty of calm empty space. No readable text.'],
];

const THEME_SLOT_PROMPTS = [
    'champagne' => 'Soft blush and champagne silk fabric with gentle folds and a few fine gold foil flecks, warm diffused light.',
    'kasavu' => 'Ivory handloom cotton texture with a gold zari kasavu border running down both side edges, soft daylight.',
    'noor' => 'Deep emerald velvet texture with a faint embossed gold geometric eight-point star pattern along the edges, soft light. No calligraphy.',
    'chapel' => 'Soft ivory and pearl textured paper with a faint blurred glow of stained-glass colours (sapphire, rose, amber) at the top, like light from a church window.',
    'sindoor' => 'Rich crimson silk with subtle gold brocade along the edges and soft folds, royal Indian wedding feel.',
    'kesar' => 'Royal blue silk with saffron, pink and gold phulkari embroidery along the top and bottom edges.',
    'gopuram' => 'Deep maroon handmade paper texture with faint gold South Indian temple-pattern borders, warm light.',
    'velvet' => 'Wine red crushed velvet with soft highlights and a faint gold art deco line pattern at the edges.',
    'qamar' => 'Midnight navy to deep purple night sky gradient with soft gold bokeh and faint stars.',
    'grace' => 'Dusty blue watercolour wash on textured cotton paper with a faint silver shimmer, airy.',
    'marigold' => 'Warm pale yellow textured paper with blurred orange and yellow marigold petals scattered around the edges.',
    'nilavu' => 'Deep navy night sky with a soft glowing moon near the top and fine gold stars, smooth gradient.',
    'mullappoo' => 'Pure white textured cotton paper with a few soft-focus jasmine flowers and green leaves in the top corners.',
    'thamara' => 'Soft pink watercolour wash on textured paper with faint lotus petals along the bottom edge.',
    'mayil' => 'Deep teal silk with soft-focus peacock feathers along the side edges and a gold shimmer.',
    'jaipur' => 'Pink sandstone wall texture with a faint carved jharokha arch outline at the top, warm Rajasthan sunlight.',
    'gulmohar' => 'Warm ivory textured paper with a softly blurred branch of red-orange gulmohar flowers coming in from the top corner.',
];

function all_slots(): array
{
    $s = SLOTS;
    foreach (THEMES as $id => $t) {
        $s['theme-' . $id] = ['group' => 'Design backdrops', 'label' => $t['name'] . ' backdrop', 'where' => 'Faint background behind the names on the ' . $t['name'] . ' design',
            'w' => 1080, 'h' => 1920, 'ratio' => '9:16',
            'prompt' => 'Vertical background for a luxury wedding invitation. ' . (THEME_SLOT_PROMPTS[$id] ?? '') . ' Keep the centre plain and calm so text can sit on top. Minimal, elegant.'];
    }
    return $s;
}

function slot_prompt(array $slot): string
{
    return $slot['prompt'] . ' ' . SLOT_STYLE . ' Aspect ratio ' . $slot['ratio'] . '.';
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
