// Small helpers shared by all templates.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

// Escaped text, with [PLACEHOLDER…] markers highlighted and \n turned into line breaks.
export const rich = (value) =>
  esc(value)
    .replace(/\[PLACEHOLDER(?::[^\]]*)?\]/g, (m) => `<span class="tbd">${m}</span>`)
    .replace(/\n/g, '<br>');

// Joins template parts, dropping null / undefined / false so conditionals stay tidy.
export const html = (strings, ...values) =>
  strings.reduce((out, str, i) => {
    let v = i < values.length ? values[i] : '';
    if (Array.isArray(v)) v = v.join('');
    if (v === null || v === undefined || v === false) v = '';
    return out + str + v;
  }, '');

export const isPlaceholder = (value) => /\[[^\]]+\]/.test(String(value ?? ''));

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
export const roman = (n) => ROMAN[n - 1] ?? String(n);
export const pad = (n) => String(n).padStart(2, '0');
