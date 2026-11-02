<?php
/* Marriage biodata maker: religions, fields, templates and cleaning. Shared by biodata.php, b.php and api.php.
   Indian biodatas differ by religion: Hindu and Jain families look for gotra, star, rasi and dosham for horoscope
   matching; Muslim families for sect, maslak and community; Christian families for denomination, parish and diocese;
   Sikh families for got and Amritdhari / Keshdhari status. The form shows only what fits the chosen religion. */

const BIO_RELIGIONS = [
    'hindu'     => ['name' => 'Hindu',     'top' => '॥ श्री गणेशाय नमः ॥',            'emblem' => 'om',       'template' => 'royal',   'section' => 'Religion and horoscope'],
    'muslim'    => ['name' => 'Muslim',    'top' => 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ', 'emblem' => 'crescent', 'template' => 'emerald', 'section' => 'Religion and community'],
    'christian' => ['name' => 'Christian', 'top' => 'With the blessings of God Almighty', 'emblem' => 'cross',  'template' => 'ivory',   'section' => 'Church and community'],
    'sikh'      => ['name' => 'Sikh',      'top' => 'ੴ ਸਤਿ ਨਾਮੁ',                      'emblem' => 'onkar',    'template' => 'khalsa',  'section' => 'Religion and community'],
    'jain'      => ['name' => 'Jain',      'top' => 'Jai Jinendra',                      'emblem' => 'jain',     'template' => 'ivory',   'section' => 'Religion and horoscope'],
    'buddhist'  => ['name' => 'Buddhist',  'top' => 'Namo Buddhaya',                     'emblem' => 'wheel',    'template' => 'ivory',   'section' => 'Religion and community'],
    'other'     => ['name' => 'Other',     'top' => '',                                  'emblem' => '',         'template' => 'noir',    'section' => 'Community'],
];

const BIO_TEMPLATES = [
    'royal'   => ['name' => 'Maroon & Gold'],
    'emerald' => ['name' => 'Emerald & Gold'],
    'ivory'   => ['name' => 'Ivory & Gold'],
    'khalsa'  => ['name' => 'Royal Blue'],
    'kasavu'  => ['name' => 'Kerala Kasavu'],
    'noir'    => ['name' => 'Black & Gold'],
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
    $d = ['religion' => isset(BIO_RELIGIONS[$r['religion'] ?? '']) ? $r['religion'] : 'hindu', 'no_top' => !empty($r['no_top'])];
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
    return ['sections' => $sections, 'religions' => BIO_RELIGIONS, 'templates' => array_map(fn($t) => $t['name'], BIO_TEMPLATES)];
}
