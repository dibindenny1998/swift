<?php
require __DIR__ . '/lib/bootstrap.php';
header('Content-Type: text/plain; charset=utf-8');
?>
# Search engines and AI assistants are welcome on the public pages.
User-agent: *
Allow: /
Disallow: /i/
Disallow: /p/
Disallow: /b/
Disallow: /m/
Disallow: /admin/
Disallow: /api.php
Disallow: /create?t=
Disallow: /biodata?t=

User-agent: GPTBot
Allow: /
Disallow: /i/
Disallow: /p/
Disallow: /b/
Disallow: /admin/

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: <?= base_url() ?>/sitemap.xml
