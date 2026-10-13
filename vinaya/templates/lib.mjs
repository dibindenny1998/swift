// Small helpers shared by all templates.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

// Escaped text, with [PLACEHOLDER…] markers highlighted, *accent* in italics and \n as line breaks.
export const rich = (value) =>
  esc(value)
    .replace(/\[PLACEHOLDER(?::[^\]]*)?\]/g, (m) => `<span class="tbd">${m}</span>`)
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

// The Vinaya leaf "V" mark (recreated from the label; swap for the original logo file when available).
export const MARK = `<svg class="mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle cx="30.5" cy="14" r="4.6" fill="#dda77f"/><path d="M31.5 55C22 45 13.5 31 9 17.5c9.5 5.5 18.5 17.5 22.5 37.5z" fill="currentColor"/><path d="M31.5 55c2.5-17 10.5-32 24.5-43.5-1.5 18-10 34-24.5 43.5z" fill="currentColor" opacity=".82"/></svg>`;

export const LEAF = `<svg class="leaf" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M8 40C8 20 20 8 42 6c-1 22-13 34-34 34z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 40L30 18" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;

export const isPlaceholder = (value) => /\[[^\]]+\]/.test(String(value ?? ''));

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
export const roman = (n) => ROMAN[n - 1] ?? String(n);
export const pad = (n) => String(n).padStart(2, '0');
