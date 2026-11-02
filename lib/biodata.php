<?php
/* Marriage biodata maker: religions, fields, templates and cleaning. Shared by biodata.php, b.php and api.php.
   Indian biodatas differ by religion: Hindu and Jain families look for gotra, star, rasi and dosham for horoscope
   matching; Muslim families for sect, maslak and community; Christian families for denomination, parish and diocese;
   Sikh families for got and Amritdhari / Keshdhari status. The form shows only what fits the chosen religion. */

const BIO_RELIGIONS = [
    'hindu'     => ['name' => 'Hindu',     'top' => '॥ श्री गणेशाय नमः ॥',       'template' => 'royal',   'section' => 'Religion and horoscope'],
    'muslim'    => ['name' => 'Muslim',    'top' => 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ', 'template' => 'emerald', 'section' => 'Religion and community'],
    'christian' => ['name' => 'Christian', 'top' => 'With the blessings of God Almighty',  'template' => 'ivory',   'section' => 'Church and community'],
    'sikh'      => ['name' => 'Sikh',      'top' => 'ੴ ਸਤਿ ਨਾਮੁ',    'template' => 'khalsa',  'section' => 'Religion and community'],
    'jain'      => ['name' => 'Jain',      'top' => 'Jai Jinendra',     'template' => 'ivory',   'section' => 'Religion and horoscope'],
    'buddhist'  => ['name' => 'Buddhist',  'top' => 'Namo Buddhaya',    'template' => 'ivory',   'section' => 'Religion and community'],
    'other'     => ['name' => 'Other',     'top' => '',         'template' => 'noir',    'section' => 'Community'],
];

/* Minimal layouts; the template below only sets the colour. */
const BIO_LAYOUTS = [
    'center' => 'Centered',
    'left'   => 'Left aligned',
    'cols'   => 'Two column',
    'frame'  => 'Double frame',
];

const BIO_TEMPLATES = [
    'royal'   => ['name' => 'Rose gold'],
    'noir'    => ['name' => 'Blush'],
    'ivory'   => ['name' => 'Champagne'],
    'khalsa'  => ['name' => 'Peach'],
    'emerald' => ['name' => 'Mint'],
    'kasavu'  => ['name' => 'Kerala gold'],
];

/* Fields: k, label, max, placeholder (string, or per-religion map), type, religions it applies to (null = all) */
const BIO_SECTIONS = [
    'Personal details' => [
        ['k' => 'name', 'label' => 'Full name', 'max' => 80, 'ph' => 'Meera Nair'],
        ['k' => 'dob', 'label' => 'Date of birth', 'max' => 10, 'type' => 'date'],
        ['k' => 'birth_time', 'label' => 'Time of birth', 'max' => 5, 'type' => 'time', 'rel' => ['hindu', 'sikh', 'jain', 'buddhist']],
        ['k' => 'birth_place', 'label' => 'Place of birth', 'max' => 80, 'ph' => 'Kochi, Kerala'],
        ['k' => 'height', 'label' => 'Height', 'max' => 20, 'ph' => '5 ft 4 in'],
        ['k' => 'complexion', 'label' => 'Complexion', 'max' => 30, 'ph' => 'Fair'],
        ['k' => 'blood', 'label' => 'Blood group', 'max' => 10, 'ph' => 'B+'],
        ['k' => 'marital', 'label' => 'Marital status', 'max' => 30, 'ph' => 'Never married'],
        ['k' => 'tongue', 'label' => 'Mother tongue', 'max' => 40, 'ph' => 'Malayalam'],
        ['k' => 'diet', 'label' => 'Diet', 'max' => 40, 'ph' => ['hindu' => 'Vegetarian', 'jain' => 'Jain vegetarian, no root vegetables', 'muslim' => 'Non-vegetarian (halal)', '*' => 'Non-vegetarian']],
    ],
    '@religion' => [
        ['k' => 'caste', 'label' => 'Caste', 'max' => 60, 'ph' => ['hindu' => 'Nair', 'sikh' => 'Jat', 'jain' => 'Oswal', '*' => ''], 'rel' => ['hindu', 'sikh', 'jain', 'buddhist', 'other']],
        ['k' => 'sub_caste', 'label' => 'Sub-caste', 'max' => 60, 'ph' => ['hindu' => 'Menon', 'jain' => 'Bisa', '*' => ''], 'rel' => ['hindu', 'jain']],
        ['k' => 'sect', 'label' => 'Sect', 'max' => 40, 'ph' => ['muslim' => 'Sunni', 'jain' => 'Shwetambar', '*' => ''], 'rel' => ['muslim', 'jain']],
        ['k' => 'maslak', 'label' => 'Maslak / school', 'max' => 40, 'ph' => "Shafi'i", 'rel' => ['muslim']],
        ['k' => 'denomination', 'label' => 'Denomination', 'max' => 60, 'ph' => 'Syro-Malabar Catholic', 'rel' => ['christian']],
        ['k' => 'community', 'label' => 'Community', 'max' => 60, 'ph' => ['muslim' => 'Mappila', 'christian' => 'Syrian Christian', '*' => ''], 'rel' => ['muslim', 'christian', 'buddhist', 'other']],
        ['k' => 'parish', 'label' => 'Parish / church', 'max' => 80, 'ph' => "St. Mary's Forane Church, Kottayam", 'rel' => ['christian']],
        ['k' => 'diocese', 'label' => 'Diocese', 'max' => 80, 'ph' => 'Archdiocese of Changanacherry', 'rel' => ['christian']],
        ['k' => 'practice', 'label' => 'Religious practice', 'max' => 80, 'ph' => 'Prays five times a day', 'rel' => ['muslim']],
        ['k' => 'sikh_status', 'label' => 'Amritdhari / Keshdhari', 'max' => 40, 'ph' => 'Keshdhari', 'rel' => ['sikh']],
        ['k' => 'gurdwara', 'label' => 'Gurdwara', 'max' => 80, 'ph' => 'Gurdwara Singh Sabha, Ludhiana', 'rel' => ['sikh']],
        ['k' => 'gothram', 'label' => 'Gotra', 'max' => 40, 'ph' => ['hindu' => 'Kashyap', 'sikh' => 'Sandhu', 'jain' => 'Bafna', '*' => ''], 'rel' => ['hindu', 'sikh', 'jain']],
        ['k' => 'star', 'label' => 'Star (nakshatra)', 'max' => 40, 'ph' => 'Rohini', 'rel' => ['hindu', 'jain']],
        ['k' => 'rasi', 'label' => 'Rasi (moon sign)', 'max' => 40, 'ph' => 'Edavam (Taurus)', 'rel' => ['hindu', 'jain']],
        ['k' => 'dosham', 'label' => 'Manglik / Chevvai dosham', 'max' => 40, 'ph' => 'No', 'rel' => ['hindu']],
        ['k' => 'kuladevata', 'label' => 'Kuladevata (family deity)', 'max' => 60, 'ph' => 'Guruvayurappan', 'rel' => ['hindu']],
        ['k' => 'horoscope', 'label' => 'Horoscope matching', 'max' => 40, 'ph' => 'Required', 'rel' => ['hindu', 'jain']],
    ],
    'Education and career' => [
        ['k' => 'education', 'label' => 'Education', 'max' => 120, 'ph' => 'B.Tech, NIT Calicut'],
        ['k' => 'occupation', 'label' => 'Occupation', 'max' => 80, 'ph' => 'Software engineer'],
        ['k' => 'company', 'label' => 'Company / workplace', 'max' => 80, 'ph' => 'Infosys, Bengaluru'],
        ['k' => 'income', 'label' => 'Annual income', 'max' => 40, 'ph' => '₹12 lakh'],
    ],
    'Family details' => [
        ['k' => 'father', 'label' => "Father's name", 'max' => 80, 'ph' => 'Suresh Nair'],
        ['k' => 'father_job', 'label' => "Father's occupation", 'max' => 80, 'ph' => 'Retired bank manager'],
        ['k' => 'mother', 'label' => "Mother's name", 'max' => 80, 'ph' => 'Anitha Nair'],
        ['k' => 'mother_job', 'label' => "Mother's occupation", 'max' => 80, 'ph' => 'Teacher'],
        ['k' => 'siblings', 'label' => 'Brothers and sisters', 'max' => 160, 'ph' => '1 elder brother, married'],
        ['k' => 'family_type', 'label' => 'Family type', 'max' => 40, 'ph' => 'Nuclear family'],
        ['k' => 'family_status', 'label' => 'Family status', 'max' => 40, 'ph' => 'Upper middle class'],
        ['k' => 'native', 'label' => 'Native place', 'max' => 80, 'ph' => 'Thrissur'],
        ['k' => 'address', 'label' => 'Address', 'max' => 200, 'ph' => 'House name, street, city', 'type' => 'textarea'],
    ],
    'Contact' => [
        ['k' => 'contact_name', 'label' => 'Contact person', 'max' => 60, 'ph' => 'Suresh Nair (father)'],
        ['k' => 'contact_phone', 'label' => 'Phone', 'max' => 20, 'ph' => '98765 43210', 'type' => 'tel'],
        ['k' => 'contact_email', 'label' => 'Email', 'max' => 120, 'type' => 'email'],
    ],
];

const BIO_TEXT = [
    ['title', 'Heading', 40, 'Marriage Biodata'],
    ['top_line', 'Blessing line at the top', 60, ''],
    ['about', 'About me (optional)', 500, 'A few lines about yourself, your values and interests.'],
    ['expect', 'Partner expectations (optional)', 400, 'What you are looking for in a partner.'],
];

const BIO_MAX_EXTRA = 8;

function bio_ph($ph, string $rel): string
{
    if (!is_array($ph)) return (string)$ph;
    return (string)($ph[$rel] ?? $ph['*'] ?? '');
}

function bio_clip($v, int $max): string
{
    $s = is_scalar($v) ? (string)$v : '';
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';
    return mb_substr(trim($s), 0, $max);
}

function bio_sanitize(array $r): array
{
    $d = ['religion' => isset(BIO_RELIGIONS[$r['religion'] ?? '']) ? $r['religion'] : 'hindu', 'no_top' => !empty($r['no_top']),
        'symbol' => !empty($r['symbol']), 'layout' => isset(BIO_LAYOUTS[$r['layout'] ?? '']) ? $r['layout'] : 'center'];
    foreach (BIO_SECTIONS as $fields) {
        foreach ($fields as $f) {
            $type = $f['type'] ?? 'text';
            $v = bio_clip($r[$f['k']] ?? '', $f['max']);
            if ($type === 'date' && $v !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $v)) $v = '';
            if ($type === 'time' && $v !== '' && !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $v)) $v = '';
            if ($type === 'email' && $v !== '' && !filter_var($v, FILTER_VALIDATE_EMAIL)) $v = '';
            $d[$f['k']] = $v;
        }
    }
    foreach (BIO_TEXT as [$k, , $max]) $d[$k] = bio_clip($r[$k] ?? '', $max);
    $d['extra'] = [];
    foreach (array_slice(is_array($r['extra'] ?? null) ? $r['extra'] : [], 0, BIO_MAX_EXTRA) as $x) {
        if (!is_array($x)) continue;
        $l = bio_clip($x['label'] ?? '', 40); $v = bio_clip($x['value'] ?? '', 160);
        if ($l !== '' && $v !== '') $d['extra'][] = ['label' => $l, 'value' => $v];
    }
    return $d;
}

/** Config handed to assets/biodata.js. */
function bio_js_config(): array
{
    $sections = [];
    foreach (BIO_SECTIONS as $title => $fields) {
        $sections[] = ['title' => $title, 'fields' => array_map(fn($f) => ['k' => $f['k'], 'label' => $f['label'], 'rel' => $f['rel'] ?? null], $fields)];
    }
    return ['sections' => $sections, 'religions' => BIO_RELIGIONS, 'templates' => array_map(fn($t) => $t['name'], BIO_TEMPLATES), 'layouts' => BIO_LAYOUTS];
}

/* ---------- search pages: /biodata and /biodata/<format> ---------- */

const BIO_SEO = [
    '' => [
        'title' => 'Free Marriage Biodata Maker Online: Download PDF | WedLink',
        'desc' => 'Make a marriage biodata online for free. Hindu, Muslim, Christian, Sikh, Jain and Kerala formats with minimal designs. Add a photo and download a PDF or image for WhatsApp.',
        'h1' => 'Free marriage biodata maker',
        'intro' => 'Choose your religion, fill in your details and download a beautiful biodata as a PDF or image. No sign-up, no design skills needed.',
        'religion' => null, 'template' => null,
        'guide_title' => 'What to include in a marriage biodata',
        'guide' => [
            'Personal details: full name, date of birth, height, complexion, marital status and mother tongue.',
            'Religion and community details that families look for, such as caste, gotra or sect.',
            'Education and career: your degree, job, company and annual income.',
            'Family details: parents\' names and occupations, brothers and sisters, family type and native place.',
            'Contact details of the person families should call, usually a parent.',
            'A recent, clear photo and a few lines about yourself and what you are looking for in a partner.',
        ],
    ],
    'hindu' => [
        'title' => 'Hindu Marriage Biodata Format: Free Maker with PDF | WedLink',
        'desc' => 'Free Hindu marriage biodata maker with gotra, nakshatra, rasi, manglik and kuladevata fields. Pick a minimal design, add a photo and download a PDF.',
        'h1' => 'Hindu marriage biodata maker',
        'intro' => 'A Hindu biodata format with everything families check for horoscope matching: gotra, star, rasi, manglik dosham and birth time.',
        'religion' => 'hindu', 'template' => 'royal',
        'guide_title' => 'What to include in a Hindu marriage biodata',
        'guide' => [
            'Date, exact time and place of birth, needed for kundli (horoscope) matching.',
            'Caste and sub-caste, gotra, nakshatra (star) and rasi (moon sign).',
            'Manglik or chevvai dosham status, and whether horoscope matching is required.',
            'Kuladevata (family deity) and native place.',
            'Diet (vegetarian or non-vegetarian), education, profession and income.',
            'Family details and a contact person, often the father or mother.',
        ],
    ],
    'muslim' => [
        'title' => 'Muslim Marriage Biodata Format: Free Nikah Biodata Maker | WedLink',
        'desc' => 'Free Muslim marriage biodata maker for Nikah proposals. Add sect, maslak, community and religious practice, choose a minimal design and download a PDF.',
        'h1' => 'Muslim marriage biodata maker',
        'intro' => 'A Muslim biodata format for Nikah proposals, starting with Bismillah, with sect, maslak and community details. No horoscope fields.',
        'religion' => 'muslim', 'template' => 'emerald',
        'guide_title' => 'What to include in a Muslim marriage biodata',
        'guide' => [
            'Sect (Sunni or Shia) and maslak or school, such as Hanafi or Shafi\'i.',
            'Community, for example Mappila, Syed, Pathan or Sheikh.',
            'Religious practice, such as regular namaz.',
            'Education, profession and family background.',
            'Parents\' names and occupations, siblings and native place.',
            'A contact person from the family.',
        ],
    ],
    'christian' => [
        'title' => 'Christian Marriage Biodata Format: Free Maker with PDF | WedLink',
        'desc' => 'Free Christian marriage biodata maker with denomination, parish and diocese. Catholic, Syro-Malabar, Orthodox, CSI, Marthoma and Pentecostal. Download a PDF.',
        'h1' => 'Christian marriage biodata maker',
        'intro' => 'A Christian biodata format with denomination, parish church and diocese, as asked by families and parish matrimony services.',
        'religion' => 'christian', 'template' => 'ivory',
        'guide_title' => 'What to include in a Christian marriage biodata',
        'guide' => [
            'Denomination, for example Syro-Malabar Catholic, Latin Catholic, Orthodox, CSI, Marthoma or Pentecostal.',
            'Parish or church you belong to, and the diocese.',
            'Community, such as Syrian Christian or Latin Christian.',
            'Education, profession and income.',
            'Parents\' names and occupations, siblings, family type and native place.',
            'A contact person, usually a parent.',
        ],
    ],
    'sikh' => [
        'title' => 'Sikh Marriage Biodata Format: Free Maker with PDF | WedLink',
        'desc' => 'Free Sikh marriage biodata maker with got, caste, Amritdhari or Keshdhari status and Gurdwara. Starts with Ik Onkar. Pick a design and download a PDF.',
        'h1' => 'Sikh marriage biodata maker',
        'intro' => 'A Sikh biodata format for Anand Karaj proposals, starting with ੴ ਸਤਿ ਨਾਮੁ, with got, caste and Sikhi details.',
        'religion' => 'sikh', 'template' => 'khalsa',
        'guide_title' => 'What to include in a Sikh marriage biodata',
        'guide' => [
            'Caste and got (gotra), for example Jat, Khatri or Ramgarhia.',
            'Amritdhari, Keshdhari or Sahajdhari status.',
            'The Gurdwara your family is associated with.',
            'Date, time and place of birth.',
            'Education, profession, family details and native place.',
            'A contact person from the family.',
        ],
    ],
    'jain' => [
        'title' => 'Jain Marriage Biodata Format: Free Maker with PDF | WedLink',
        'desc' => 'Free Jain marriage biodata maker with sect (Digambar or Shwetambar), gotra, star and Jain diet. Choose a minimal design and download a PDF.',
        'h1' => 'Jain marriage biodata maker',
        'intro' => 'A Jain biodata format beginning with Jai Jinendra, with sect, gotra and diet details.',
        'religion' => 'jain', 'template' => 'ivory',
        'guide_title' => 'What to include in a Jain marriage biodata',
        'guide' => [
            'Sect: Digambar or Shwetambar, and community such as Oswal or Agarwal.',
            'Gotra, and star and rasi if your family matches horoscopes.',
            'Diet, for example Jain vegetarian without root vegetables.',
            'Education, profession and income.',
            'Family details and native place.',
            'A contact person from the family.',
        ],
    ],
    'kerala' => [
        'title' => 'Kerala Marriage Biodata Format: Free Maker in Malayalam or English | WedLink',
        'desc' => 'Free Kerala marriage biodata maker with a kasavu gold design. Write in Malayalam or English, add star and rasi, a photo, and download a PDF.',
        'h1' => 'Kerala marriage biodata maker',
        'intro' => 'A Kerala biodata with a kasavu gold border. Write in Malayalam or English, with star (nakshatram) and rasi for jathakam matching.',
        'religion' => 'hindu', 'template' => 'kasavu',
        'guide_title' => 'What to include in a Kerala marriage biodata',
        'guide' => [
            'Star (nakshatram), rasi and birth time for jathakam (horoscope) matching.',
            'Caste or community, for example Nair, Ezhava, Menon, or Syrian Christian.',
            'Education, profession and where you work, in India or abroad.',
            'Parents\' names, occupations and native place (tharavadu).',
            'Write in Malayalam or English. Both print correctly.',
            'A contact person from the family.',
        ],
    ],
];

function bio_faq(): array
{
    $pb = price('biodata');
    return [
        ['Is the biodata maker free?', "Yes. Making and downloading your biodata is free. The free version has a small red \"Created by " . setting('brand') . "\" strip at the bottom. Pay ₹$pb once if you want a clean copy without it."],
        ['What format is the biodata downloaded in?', 'You can download an A4 PDF to print or share, and a JPG image that is easy to send on WhatsApp.'],
        ['Can I make a biodata in Malayalam, Hindi or Tamil?', 'Yes. Type in any Indian language and the biodata uses a matching font.'],
        ['Can I add a photo?', 'Yes. Add a clear, recent photo and it appears at the top of the biodata.'],
        ['Can I edit my biodata later?', 'Yes. Your biodata is saved under your WhatsApp number with a private link, so you can change it and download it again any time.'],
        ['Which biodata format should I use?', 'Pick your religion and the form shows the details families usually ask for: gotra, star and rasi for Hindus; sect and maslak for Muslims; denomination and parish for Christians; got and Amritdhari status for Sikhs.'],
    ];
}
