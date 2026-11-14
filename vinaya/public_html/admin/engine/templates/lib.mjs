// Small helpers shared by all templates.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

// [PLACEHOLDER…] markers mark facts still to come from the client. They are never shown:
// the marker is removed, and a row or section left empty is skipped by the templates.
export const stripPlaceholders = (value) =>
  String(value ?? '')
    .replace(/\s*\[PLACEHOLDER(?::[^\]]*)?\]/g, '')
    .trim();

// Escaped text, with *accent* in italics and \n as line breaks.
export const rich = (value) =>
  esc(stripPlaceholders(value))
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');

// Joins template parts, dropping null / undefined / false so conditionals stay tidy.
export const html = (strings, ...values) =>
  strings.reduce((out, str, i) => {
    let v = i < values.length ? values[i] : '';
    if (Array.isArray(v)) v = v.join('');
    if (v === null || v === undefined || v === false) v = '';
    return out + str + v;
  }, '');

// The Vinaya V mark, from the official logo (gold dot fixed, leaves in currentColor).
export const MARK = `<svg class="mark" aria-hidden="true" focusable="false" viewBox="124 76 410 285"><path fill="currentColor" d="M 316.14 341.87 C 314.36 338.39 312.60 334.91 310.81 331.43 C 283.87 279.05 259.62 225.32 231.20 173.69 C 220.17 153.64 209.91 133.08 195.43 115.12 C 183.18 99.93 168.51 88.43 148.53 85.54 C 142.79 84.71 136.94 84.56 131.14 84.18 C 129.56 84.07 128.16 84.16 128.16 81.91 C 128.16 79.98 129.24 79.84 130.71 79.78 C 160.03 78.67 188.89 80.68 216.38 92.16 C 243.47 103.47 263.73 122.23 278.28 147.66 C 295.60 177.93 310.92 209.21 326.36 240.43 C 326.73 241.17 327.17 241.86 327.81 242.97 C 334.20 226.55 341.72 211.04 350.01 195.90 C 367.26 164.41 386.96 134.67 413.14 109.76 C 424.91 98.55 438.27 89.63 453.83 84.37 C 454.74 84.07 455.70 83.90 457.01 84.37 C 453.83 86.29 450.57 88.10 447.48 90.16 C 423.32 106.12 404.79 127.66 388.43 151.07 C 359.14 192.99 335.36 237.67 322.85 287.67 C 318.44 305.32 316.17 323.25 316.14 341.87 "/><path fill="currentColor" d="M 509.24 79.80 C 515.06 79.80 520.89 79.76 526.71 79.82 C 528.07 79.83 529.83 79.30 529.87 81.77 C 529.91 83.88 528.72 84.17 527.05 84.31 C 500.41 86.54 481.86 102.04 466.09 121.84 C 448.23 144.27 434.14 169.18 419.66 193.81 C 391.06 242.46 362.71 291.25 337.74 341.91 C 335.83 345.78 334.09 349.72 332.32 353.66 C 331.61 355.23 330.90 356.77 328.80 356.52 C 326.37 356.22 326.30 354.34 326.09 352.45 C 323.11 325.05 326.52 298.24 335.44 272.39 C 356.01 212.78 388.84 160.44 431.76 114.38 C 442.41 102.96 454.86 93.85 468.58 86.31 C 476.25 82.10 484.20 80.10 492.77 79.94 C 498.26 79.84 503.75 79.92 509.24 79.92 C 509.24 79.88 509.24 79.84 509.24 79.80 "/><path fill="#c79e5d" d="M 362.39 115.47 C 362.21 132.98 348.97 146.07 331.67 145.85 C 315.16 145.65 302.19 132.29 302.35 115.64 C 302.51 98.62 316.07 85.00 332.71 85.15 C 349.38 85.30 362.56 98.77 362.39 115.47 "/></svg>`;

export const LEAF = `<svg class="leaf" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M8 40C8 20 20 8 42 6c-1 22-13 34-34 34z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 40L30 18" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;

export const isPlaceholder = (value) => /\[[^\]]+\]/.test(String(value ?? ''));

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
export const roman = (n) => ROMAN[n - 1] ?? String(n);
export const pad = (n) => String(n).padStart(2, '0');

// ---------------------------------------------------------------- botanical line art
// Fine line drawings used as floating decoration. All stroke in currentColor.

const svg = (cls, viewBox, body) =>
  `<svg class="${cls}" viewBox="${viewBox}" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

// A single hibiscus petal with its veins.
export const PETAL = svg(
  'bot bot--petal',
  '0 0 48 48',
  '<path d="M24 45C9 37 6 16 17 6c2.5 3 4.5 4 7 4s4.5-1 7-4c11 10 8 31-7 39z"/><path d="M24 45V14M24 32l-7-9M24 28l7-9"/>',
);

// An oil droplet with a soft highlight.
export const DROPLET = svg(
  'bot bot--droplet',
  '0 0 48 48',
  '<path d="M24 5C18 15 12 22 12 30a12 12 0 0 0 24 0c0-8-6-15-12-25z"/><path d="M18 31a6 6 0 0 0 5 6"/>',
);

// A seed pod, split to show its line.
export const SEED = svg(
  'bot bot--seed',
  '0 0 48 48',
  '<path d="M24 4C13 14 13 34 24 44c11-10 11-30 0-40z"/><path d="M24 9v30"/>',
);

// A soft organic loop, like a ripple of oil.
export const LOOP = svg(
  'bot bot--loop',
  '0 0 64 64',
  '<path d="M33 7c13 1 24 10 23 24S45 58 31 57 7 47 8 32 20 6 33 7z"/><path d="M33 17c8 1 14 6 13 14s-7 15-15 14-14-6-13-14 7-15 15-14z"/>',
);

// A gold vine that draws itself between sections (every path has pathLength="1").
export const VINE = `<svg class="vine" viewBox="0 0 260 40" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${[
  'M6 20C40 6 74 34 122 20',
  'M138 20C186 6 220 34 254 20',
  'M40 13C46 4 56 4 60 8 54 13 46 15 40 13z',
  'M76 27C82 36 92 36 96 32 90 27 82 25 76 27z',
  'M220 13C214 4 204 4 200 8 206 13 214 15 220 13z',
  'M184 27C178 36 168 36 164 32 170 27 178 25 184 27z',
]
  .map((d) => `<path pathLength="1" d="${d}"/>`)
  .join('')}<circle cx="130" cy="20" r="2.4" fill="none"/></svg>`;

