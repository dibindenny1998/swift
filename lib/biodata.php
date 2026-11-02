<?php
/* Marriage biodata maker: field list, templates and cleaning. Shared by biodata.php, b.php and api.php. */

const BIO_TEMPLATES = [
    'royal'  => ['name' => 'Royal',  'note' => 'Maroon and gold border'],
    'kasavu' => ['name' => 'Kasavu', 'note' => 'Ivory with a gold Kerala border'],
    'floral' => ['name' => 'Floral', 'note' => 'Soft pink with rose corners'],
    'simple' => ['name' => 'Simple', 'note' => 'Clean black and white'],
];

/** Sections and fields, in the order they print. [key, label, max length, placeholder, input type] */
const BIO_SECTIONS = [
    'Personal details' => [
        ['name', 'Full name', 80, 'Meera Nair', 'text'],
        ['dob', 'Date of birth', 10, '', 'date'],
        ['birth_time', 'Time of birth', 5, '', 'time'],
        ['birth_place', 'Place of birth', 80, 'Kochi, Kerala', 'text'],
        ['height', 'Height', 20, '5 ft 4 in', 'text'],
        ['complexion', 'Complexion', 30, 'Fair', 'text'],
        ['blood', 'Blood group', 10, 'B+', 'text'],
        ['marital', 'Marital status', 30, 'Never married', 'text'],
        ['tongue', 'Mother tongue', 40, 'Malayalam', 'text'],
    ],
    'Religion and horoscope' => [
        ['religion', 'Religion', 40, 'Hindu', 'text'],
        ['caste', 'Caste / community', 60, 'Nair', 'text'],
        ['gothram', 'Gothram', 40, '', 'text'],
        ['star', 'Star (nakshatra)', 40, 'Rohini', 'text'],
        ['rasi', 'Rasi', 40, 'Edavam', 'text'],
        ['dosham', 'Dosham / manglik', 40, 'No', 'text'],
    ],
    'Education and work' => [
        ['education', 'Education', 120, 'B.Tech, NIT Calicut', 'text'],
        ['occupation', 'Occupation', 80, 'Software engineer', 'text'],
        ['company', 'Company / workplace', 80, 'Infosys, Bengaluru', 'text'],
        ['income', 'Annual income', 40, '₹12 lakh', 'text'],
    ],
    'Family details' => [
        ['father', "Father's name", 80, 'Suresh Nair', 'text'],
        ['father_job', "Father's occupation", 80, 'Retired bank manager', 'text'],
        ['mother', "Mother's name", 80, 'Anitha Nair', 'text'],
        ['mother_job', "Mother's occupation", 80, 'Teacher', 'text'],
        ['siblings', 'Brothers and sisters', 160, '1 elder brother, married', 'text'],
        ['native', 'Native place', 80, 'Thrissur', 'text'],
        ['address', 'Address', 200, 'House name, street, city', 'textarea'],
    ],
    'Contact' => [
        ['contact_name', 'Contact person', 60, 'Suresh Nair (father)', 'text'],
        ['contact_phone', 'Phone', 20, '98765 43210', 'tel'],
        ['contact_email', 'Email', 120, '', 'email'],
    ],
];

const BIO_TEXT = [
    ['title', 'Heading', 40, 'Marriage Biodata'],
    ['top_line', 'Line at the very top (optional)', 60, '|| Shree Ganeshaya Namah ||'],
    ['about', 'About me (optional)', 500, 'A few lines about yourself, your values and interests.'],
    ['expect', 'Partner expectations (optional)', 400, 'What you are looking for in a partner.'],
];

const BIO_MAX_EXTRA = 8;

function bio_clip($v, int $max): string
{
    $s = is_scalar($v) ? (string)$v : '';
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';
    return mb_substr(trim($s), 0, $max);
}

function bio_sanitize(array $r): array
{
    $d = [];
    foreach (BIO_SECTIONS as $fields) {
        foreach ($fields as [$k, , $max, , $type]) {
            $v = bio_clip($r[$k] ?? '', $max);
            if ($type === 'date' && $v !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $v)) $v = '';
            if ($type === 'time' && $v !== '' && !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $v)) $v = '';
            if ($type === 'email' && $v !== '' && !filter_var($v, FILTER_VALIDATE_EMAIL)) $v = '';
            $d[$k] = $v;
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
        $sections[] = ['title' => $title, 'fields' => array_map(fn($f) => ['k' => $f[0], 'label' => $f[1]], $fields)];
    }
    return ['sections' => $sections, 'templates' => array_map(fn($t) => $t['name'], BIO_TEMPLATES)];
}
