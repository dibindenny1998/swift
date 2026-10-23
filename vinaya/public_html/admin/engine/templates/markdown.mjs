// A deliberately small Markdown reader for blog posts: front matter, ## / ### headings,
// paragraphs, - and 1. lists, > quotes, **bold**, *italic*, [links](url) and photos on their
// own line: ![description](/images/file.jpg). Nothing else. The admin's blog editor writes it.

import { esc } from './lib.mjs';

// Only web, email, phone and same-site links; anything else is shown as plain text.
const safeUrl = (url) => /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url);
const external = (url) => /^https?:\/\//i.test(url);

const inline = (text) =>
  esc(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) =>
      safeUrl(url) ? `<a href="${url}"${external(url) ? ' target="_blank" rel="noopener"' : ''}>${label}</a>` : label,
    );

const IMAGE = /^!\[([^\]]*)\]\((\/images\/[A-Za-z0-9._-]+)\)$/;

export function parsePost(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error('Blog post is missing its --- front matter ---');
  const meta = {};
  for (const line of match[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  meta.featured = meta.featured === 'true';
  const body = match[2].trim();
  const words = body.split(/\s+/).length;
  return { meta, body, minutes: Math.max(1, Math.round(words / 200)) };
}

export function renderMarkdown(body) {
  const out = [];
  const blocks = body.split(/\n{2,}/);
  for (const block of blocks) {
    const lines = block.split('\n');
    if (IMAGE.test(block.trim())) {
      const [, alt, src] = block.trim().match(IMAGE);
      out.push(`<figure class="prose__figure"><img src="${src}" alt="${esc(alt)}" loading="lazy" decoding="async"></figure>`);
    } else if (/^### /.test(block)) out.push(`<h3>${inline(block.slice(4))}</h3>`);
    else if (/^## /.test(block)) out.push(`<h2>${inline(block.slice(3))}</h2>`);
    else if (lines.every((l) => /^- /.test(l))) out.push(`<ul>${lines.map((l) => `<li>${inline(l.slice(2))}</li>`).join('')}</ul>`);
    else if (lines.every((l) => /^\d+\. /.test(l))) out.push(`<ol>${lines.map((l) => `<li>${inline(l.replace(/^\d+\. /, ''))}</li>`).join('')}</ol>`);
    else if (lines.every((l) => /^> ?/.test(l))) out.push(`<blockquote><p>${inline(lines.map((l) => l.replace(/^> ?/, '')).join(' '))}</p></blockquote>`);
    else out.push(`<p>${inline(lines.join(' '))}</p>`);
  }
  return out.join('\n');
}
