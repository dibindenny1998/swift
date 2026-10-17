# VINAYA · Image prompts

There are 27 photos and 7 optional ingredient icons. Each one has a file name, a size and a prompt.
Generate each image, save it as a JPG with the **exact file name** below and upload it to
`public_html/images/`, overwriting the old file. The site crops automatically, but using the
size given keeps everything sharp. Keep each file under 400 KB (JPG quality around 80).
Check your uploads at `/images/guide.html`.

---

## 1. House style (already included in every prompt)

Every prompt below ends with this line, so the whole site looks like one photo shoot:

> **STYLE:** premium natural-cosmetics editorial photograph, soft warm natural light, gentle
> single-colour gradient backdrop, palette of warm cream (#FBF6EC), sand (#F3E4C9), deep leaf
> green (#1F4A2E) and soft antique gold (#C39A45), calm, minimal, uncluttered composition, generous
> negative space, shallow depth of field, fine detail, film-like natural colour, Kerala / South
> Indian heritage feel, no text, no logos, no watermark

**Negative prompt** (for tools that support one):
`text, letters, logo, watermark, label text, plastic, neon, purple, blue tint, harsh flash, busy background, clutter, multiple gradients, rainbow, cartoon, 3D render, oversaturated, distorted hands, extra fingers`

**Gradient rule:** every background fades within **one** colour only: light sand to cream,
or deep green to darker green. Never two different colours.

**Product bottles:** AI tools cannot reproduce the real Vinaya label. For any image that shows the
bottle or gift set (marked 📦), either use a **real product photo**, or use your tool's
"image reference / image-to-image" mode with the existing product photo so the label stays exact.
All other images need no product.

**Aspect ratio quick list**

| Shape | Ratio | Size (px) | Midjourney |
|---|---|---|---|
| Wide banner | 16:9 | 1920 × 1080 | `--ar 16:9` |
| Tall card | 4:5 | 1000 × 1250 (or 800 × 1000) | `--ar 4:5` |
| Product | 4:5 | 1200 × 1500 | `--ar 4:5` |
| Card | 4:3 | 1200 × 900 | `--ar 4:3` |
| Blog | 3:2 | 1500 × 1000 | `--ar 3:2` |
| Share preview | 1.91:1 | 1200 × 630 | `--ar 40:21` |
| Ingredient icon | 1:1, transparent PNG | 400 × 400 | `--ar 1:1` |

---

## 2. Home page

### home-hero.jpg · 1920 × 1080 · 16:9
*Top banner. Headline sits on the **left third**, so keep the left side darker and calm.*
> Wide cinematic view of the Kerala backwaters at golden hour, still water mirroring tall coconut palms, a single traditional wooden houseboat small on the right third, soft mist over the water, warm golden sun low on the horizon, the left third of the frame falls into deep leaf-green shadow with a smooth dark-green gradient, peaceful and grand, lots of open sky and water. STYLE: … `--ar 16:9`

### tale-nature.jpg · 1000 × 1250 · 4:5
*"01 Nature" card. Text sits on the **bottom third**.*
> Close-up of fresh green curry leaves, tulsi and a split coconut growing in a sunlit Kerala garden, morning dew, soft rays of light from the top, the bottom third fades into deep leaf green with a smooth single-green gradient, vertical composition. STYLE: … `--ar 4:5`

### tale-tradition.jpg · 1000 × 1250 · 4:5
*"02 Tradition" card. Text on the **bottom third**.*
> An elderly Indian woman's hands gently stirring herbs and spices into coconut oil in a traditional brass uruli over a low flame, steam softly rising, hibiscus flowers and cinnamon sticks beside it, warm amber light, the bottom third fades into deep green-brown shadow, timeless, respectful, vertical composition, no face visible. STYLE: … `--ar 4:5`

### tale-you.jpg · 1000 × 1250 · 4:5
*"03 You" card. Text on the **bottom third**.*
> A young Indian woman with long dark glossy hair seen from behind, sitting by a sunlit window, combing her hair with a wooden comb, soft morning light, linen clothing in cream, a few green leaves in the foreground blur, the bottom third fades into deep leaf green, calm modern lifestyle, vertical composition. STYLE: … `--ar 4:5`

### collection-hair.jpg · 800 × 1000 · 4:5 · 📦
*Hair Care tile.*
> Vinaya hair oil bottle standing on a cream travertine stone, a few green leaves and a wooden comb beside it, soft leaf shadows across a warm sand-to-cream gradient wall, product centred. STYLE: … `--ar 4:5`

### collection-skin.jpg · 800 × 1000 · 4:5
*Skin Care tile (coming soon).*
> A single drop of golden oil on a fresh green leaf, tiny white jasmine flowers, soft focus, smooth sand-to-cream gradient background, delicate and skin-like, macro, vertical. STYLE: … `--ar 4:5`

### collection-body.jpg · 800 × 1000 · 4:5
*Body Care tile (coming soon).*
> A freshly halved coconut with white flesh, a small brass bowl of coconut oil and a folded cream muslin cloth on natural stone, warm side light, smooth sand gradient background, vertical. STYLE: … `--ar 4:5`

### collection-gift.jpg · 800 × 1000 · 4:5 · 📦
*Gifting tile.*
> The Vinaya gift set in its sheer pouch with the hair oil, wooden comb and illustrated story card, tied with a natural cotton thread, a few green leaves and a jasmine sprig, warm sand-to-cream gradient background, vertical. STYLE: … `--ar 4:5`

### approach-simplicity.jpg · 1200 × 900 · 4:3
*"Thoughtful Simplicity" card.*
> Minimal still life: one green leaf, one smooth river stone and a small clay bowl on a cream linen surface, long soft shadow, lots of empty space, smooth cream gradient background, quiet and simple. STYLE: … `--ar 4:3`

### approach-care.jpg · 1200 × 900 · 4:3
*"Conscious Care" card.*
> Two hands cupped gently, holding fresh hibiscus petals, curry leaves and a small piece of coconut, soft warm light, cream linen sleeves, smooth sand gradient background, caring and tender. STYLE: … `--ar 4:3`

### approach-purpose.jpg · 1200 × 900 · 4:3
*"Our Purpose" card.*
> A woman's hand placing a coconut seedling into rich soil in a green Kerala garden, morning light filtering through palms, background softening into a deep leaf-green gradient, hopeful and purposeful. STYLE: … `--ar 4:3`

---

## 3. Our Story page

### story-hero.jpg · 1920 × 1080 · 16:9
*Top banner. Title on the **left third**. Must differ from the Home banner.*
> A traditional Kerala ancestral home (nalukettu) courtyard at dawn, carved wooden pillars, a brass lamp, a tulsi plant on its stone stand at the centre, soft morning light falling into the courtyard, the left third in deep green shadow with a smooth single-green gradient, serene heritage atmosphere. STYLE: … `--ar 16:9`

### story-heritage.jpg · 1000 × 1250 · 4:5
*"I Heritage".*
> Old hands of an Indian grandmother grinding fresh herbs on a traditional stone grinder (ammikallu), curry leaves, hibiscus and turmeric around it, warm window light, smooth warm sand gradient background, documentary yet elegant, vertical. STYLE: … `--ar 4:5`

### story-change.jpg · 1000 × 1250 · 4:5
*"II Change". Shown with an **arch top**, so keep the subject centred.*
> A quiet contrast: a single sprig of fresh green leaves in a small glass of water on a modern minimal cream shelf, soft city morning light through sheer curtains, smooth cream gradient wall, calm and reflective, subject centred, vertical. STYLE: … `--ar 4:5`

### story-reconnect.jpg · 1000 × 1250 · 4:5
*"III Reconnection".*
> A young Indian woman in a cream linen dress walking barefoot through a green Kerala garden, touching the leaves of a curry-leaf plant, golden afternoon light, background softly fading into a leaf-green gradient, feeling of coming home, vertical. STYLE: … `--ar 4:5`

### story-value.jpg · 1920 × 1080 · 16:9
*Full-width background behind a quote. It sits under a dark green veil, so keep it simple and **centre clear**.*
> Overhead flat lay of raw botanicals arranged in a loose circle on dark green stone: coconut halves, hibiscus flowers, cinnamon bark, curry leaves, aloe vera, tulsi and bhringraj, empty space in the centre, deep green-to-darker-green gradient, moody and rich. STYLE: … `--ar 16:9`

### story-source.jpg · 1200 × 900 · 4:3
*"From the Source to You" card.*
> A woven basket of freshly harvested coconuts and green leaves resting on the edge of a Kerala farm path, palms behind in soft focus, morning light, background fading into a soft green gradient. STYLE: … `--ar 4:3`

### story-approach.jpg · 1200 × 900 · 4:3
*"The Vinaya Approach" card.*
> A calm modern bathroom shelf in cream stone with a wooden comb, a folded linen towel, a small brass bowl and a green plant, warm soft light, smooth sand-to-cream gradient wall, everyday natural ritual. STYLE: … `--ar 4:3`

---

## 4. Products

### product-hair-oil.jpg · 1200 × 1500 · 4:5 · 📦 real photo recommended
*Main product photo on the Hair Oil page, Products page and Home.*
> Vinaya hair oil 110 ml bottle with gold cap standing on a cream travertine plinth, a halved coconut and a few green leaves behind, soft leaf shadows, smooth warm sand-to-cream gradient background, product sharp and centred, premium beauty product photography. STYLE: … `--ar 4:5`

### product-gift-set.jpg · 1200 × 1500 · 4:5 · 📦 real photo recommended
*Gift Set page and cards.*
> The Vinaya gift set laid out: sheer pouch, hair-oil bottle, wooden comb and illustrated story card, arranged neatly on cream linen with a jasmine sprig, soft top light, smooth sand gradient background. STYLE: … `--ar 4:5`

---

## 5. Partner With Us

### export-hero.jpg · 1920 × 1080 · 16:9 · 📦 optional
*Top image, shown inside the page.*
> Neat rows of kraft-paper shipping boxes tied with cotton string, a few with green leaves tucked in, on a clean wooden table in a bright natural-light studio, a single Vinaya bottle in front (optional), warm sand-to-cream gradient wall, organised, trustworthy, ready for export. STYLE: … `--ar 16:9`

---

## 6. Blog (one per article)

### blog-made-the-vinaya-way.jpg · 1500 × 1000 · 3:2
> Golden coconut oil gently simmering with herbs and spices in a brass uruli, wisps of steam, cinnamon sticks and curry leaves around, warm amber light, dark green-brown gradient background. STYLE: … `--ar 3:2`

### blog-seven-botanicals.jpg · 1500 × 1000 · 3:2
> Seven botanicals arranged in a neat row on cream paper: coconut, aloe vera, cinnamon bark, hibiscus, curry leaves, tulsi, bhringraj, soft shadow, smooth cream gradient background, clean editorial flat lay. STYLE: … `--ar 3:2`

### blog-weekly-hair-oil-ritual.jpg · 1500 × 1000 · 3:2
> Over-the-shoulder view of a woman gently massaging oil into her scalp, long dark hair, wooden comb and small brass bowl on a stool beside her, soft weekend morning light, sand gradient background. STYLE: … `--ar 3:2`

### blog-why-natural-smells-different.jpg · 1500 × 1000 · 3:2
> Close-up of crushed curry leaves, a broken cinnamon stick and coconut shavings with a faint wisp of aroma in the light, macro, soft warm light, smooth sand-to-cream gradient background, sensory. STYLE: … `--ar 3:2`

### blog-caring-for-your-wooden-comb.jpg · 1500 × 1000 · 3:2
> A neem-wood comb resting on a folded cream linen cloth beside a small bowl of water and a soft brush, top light, minimal, smooth cream gradient background. STYLE: … `--ar 3:2`

---

## 7. Share preview

### share-image.jpg · 1200 × 630 · 1.91:1 · 📦
*Shown when the link is shared on WhatsApp, Facebook or LinkedIn. Keep the subject in the centre.*
> Vinaya hair oil bottle centred on a cream stone plinth, green leaves on either side, deep leaf-green gradient background fading darker to the edges, premium and simple. STYLE: … `--ar 40:21`

---

## 8. Ingredient icons (optional: the current ones work)

Transparent PNG, 400 × 400, subject centred, no background, no shadow. One per file:
`ingredient-coconut.png`, `ingredient-aloe-vera.png`, `ingredient-cinnamon.png`,
`ingredient-hibiscus.png`, `ingredient-curry-leaves.png`, `ingredient-tulsi.png`,
`ingredient-bhringraj.png`

> Botanical watercolour illustration of a single [INGREDIENT], soft natural colours in leaf green and warm gold, delicate ink line, isolated on a transparent background, centred, no shadow, no text. `--ar 1:1`
