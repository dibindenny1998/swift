<?php
/**
 * VINAYA admin API. Every action needs a logged-in session; every change also needs the
 * session's CSRF token in the X-CSRF header.
 *
 *   GET  ?action=state     everything the editor needs (text, settings, images, blog)
 *   POST ?action=publish   save text + settings and write the regenerated pages
 *   POST ?action=upload    replace one photo (already resized in the browser)
 *   POST ?action=password  change the admin password
 *   POST ?action=logout
 */

declare(strict_types=1);

require __DIR__ . '/lib.php';

start_session();
no_cache_headers();
header('Content-Type: application/json; charset=utf-8');

function reply(array $data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $status = 400): never
{
    reply(['ok' => false, 'error' => $message], $status);
}

if (!logged_in()) {
    fail('Please log in again.', 401);
}

$action = (string) ($_GET['action'] ?? '');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'POST' && !hash_equals($_SESSION['csrf'], (string) ($_SERVER['HTTP_X_CSRF'] ?? ''))) {
    fail('Your session expired. Reload the page.', 403);
}

$images = site_root() . '/images';
$fingerprint = static fn (string $file): string => substr((string) sha1_file($file), 0, 10);

/** Photos saved through the admin are kept in the data folder too; put back any a website upload replaced. */
function restore_photos(string $images): void
{
    $saved = data_dir() . '/images';
    if (!is_dir($saved)) {
        return;
    }
    foreach (glob($saved . '/*.{jpg,jpeg,png,webp}', GLOB_BRACE) ?: [] as $file) {
        $target = $images . '/' . basename($file);
        if (!is_file($target) || sha1_file($target) !== sha1_file($file)) {
            @copy($file, $target);
        }
    }
}

/** The product list from the editor, checked field by field. */
function clean_catalog($catalog): array
{
    $slug = '/^[a-z0-9][a-z0-9-]{1,60}$/';
    $text = static function ($value, int $max) {
        $value = trim((string) $value);
        if (mb_strlen($value) > $max) {
            fail('Some product text is too long.');
        }
        return $value;
    };
    $hidden = [];
    foreach ((array) ($catalog['hidden'] ?? []) as $s) {
        if (is_string($s) && preg_match($slug, $s)) {
            $hidden[] = $s;
        }
    }
    $custom = [];
    foreach ((array) ($catalog['custom'] ?? []) as $c) {
        if (!is_array($c) || !preg_match($slug, (string) ($c['slug'] ?? '')) || !preg_match('/^[a-z]{2,20}$/', (string) ($c['category'] ?? ''))) {
            fail('A product is missing its name or category.');
        }
        $item = [
            'slug' => $c['slug'],
            'category' => $c['category'],
            'name' => $text($c['name'] ?? '', 120),
            'variant' => $text($c['variant'] ?? '', 160),
            'short' => $text($c['short'] ?? '', 300),
            'description' => $text($c['description'] ?? '', 3000),
            'highlights' => [],
            'specs' => [],
        ];
        if ($item['name'] === '' || $item['variant'] === '') {
            fail('Every product needs a name and a subtitle.');
        }
        foreach (array_slice((array) ($c['highlights'] ?? []), 0, 12) as $hl) {
            if (($hl = $text($hl, 160)) !== '') {
                $item['highlights'][] = $hl;
            }
        }
        foreach (['ingredients', 'size', 'usage', 'shelfLife', 'packaging'] as $k) {
            if (($v = $text($c['specs'][$k] ?? '', 2000)) !== '') {
                $item['specs'][$k] = $v;
            }
        }
        $custom[] = $item;
        if (count($custom) > 60) {
            fail('Too many products.');
        }
    }
    return ['hidden' => array_values(array_unique($hidden)), 'custom' => $custom];
}

/** Blog posts written or edited in the admin: full Markdown source per post, plus deletions. */
function clean_blog($blog): array
{
    $slug = '/^[a-z0-9][a-z0-9-]{1,80}$/';
    $posts = [];
    foreach ((array) ($blog['posts'] ?? []) as $key => $source) {
        if (!is_string($key) || !preg_match($slug, $key) || !is_string($source)
            || strlen($source) > 300_000 || !str_starts_with($source, "---\n")) {
            fail('A blog post could not be saved.');
        }
        $posts[$key] = $source;
        if (count($posts) > 300) {
            fail('Too many blog posts.');
        }
    }
    $deleted = [];
    foreach ((array) ($blog['deleted'] ?? []) as $s) {
        if (is_string($s) && preg_match($slug, $s)) {
            $deleted[] = $s;
        }
    }
    return ['posts' => (object) $posts, 'deleted' => array_values(array_unique($deleted))];
}

function valid_email(string $value): bool
{
    return $value === '' || filter_var($value, FILTER_VALIDATE_EMAIL) !== false;
}

try {
    switch ("$method $action") {
        case 'GET state':
            restore_photos($images);
            $engine = __DIR__ . '/engine';
            $files = [];
            $versions = [];
            foreach (glob($images . '/*.{jpg,jpeg,png,webp,svg}', GLOB_BRACE) ?: [] as $file) {
                $name = basename($file);
                $size = @getimagesize($file) ?: [0, 0];
                $files[] = ['file' => $name, 'w' => $size[0], 'h' => $size[1], 'kb' => (int) round(filesize($file) / 1024)];
                $versions['images/' . $name] = $fingerprint($file);
            }
            foreach (['assets/css/main.css', 'assets/js/main.js'] as $asset) {
                if (is_file(site_root() . '/' . $asset)) {
                    $versions[$asset] = $fingerprint(site_root() . '/' . $asset);
                }
            }
            $blog = [];
            foreach (glob($engine . '/content/blog/*.md') ?: [] as $file) {
                $blog[] = ['slug' => basename($file, '.md'), 'source' => (string) file_get_contents($file)];
            }
            $build = json_decode((string) @file_get_contents($engine . '/build.json'), true) ?: [];
            $last = read_json('last-publish.json', []);
            reply([
                'ok' => true,
                'user' => $_SESSION['user'],
                // Where edits are kept: 'safe' = next to public_html, survives website uploads.
                'storage' => str_starts_with(data_dir(), site_root() . '/') ? 'inside' : 'safe',
                'overrides' => read_json('content.json', new stdClass()),
                'settings' => read_json('settings.json', new stdClass()),
                'catalog' => read_json('products.json', ['hidden' => [], 'custom' => []]),
                'blogEdits' => read_json('blog.json', ['posts' => new stdClass(), 'deleted' => []]),
                'images' => $files,
                'versions' => $versions,
                'blog' => $blog,
                'lastPublish' => $last,
                // A developer upload replaced the pages after the last publish: re-apply the edits.
                'needsRepublish' => !empty($last['at']) && !empty($build['builtAt']) && $build['builtAt'] > $last['at'],
            ]);

        case 'POST publish':
            $body = json_decode((string) file_get_contents('php://input'), true);
            if (!is_array($body) || !isset($body['files']) || !is_array($body['files'])) {
                fail('Nothing to publish.');
            }
            $overrides = $body['overrides'] ?? [];
            if (!is_array($overrides) || strlen(json_encode($overrides)) > 1_000_000) {
                fail('The text is too long to save.');
            }
            foreach ($overrides as $key => $value) {
                if (!is_string($key) || !preg_match('/^[A-Za-z0-9_.-]{1,160}$/', $key) || !is_string($value) || strlen($value) > 20000) {
                    fail('Some text could not be saved.');
                }
            }
            $settings = $body['settings'] ?? [];
            $clean = [];
            foreach (['contactEmail', 'publicEmail', 'fromEmail'] as $k) {
                $v = trim((string) ($settings[$k] ?? ''));
                if (!valid_email($v)) {
                    fail("That email address doesn't look right: $v");
                }
                $clean[$k] = $v;
            }
            $whatsapp = preg_replace('/\D+/', '', (string) ($settings['whatsapp'] ?? '')) ?? '';
            if ($whatsapp !== '' && (strlen($whatsapp) < 8 || strlen($whatsapp) > 15)) {
                fail('The WhatsApp number needs the country code, e.g. 919876543210.');
            }
            $clean['whatsapp'] = $whatsapp;
            foreach (['instagram', 'youtube', 'x'] as $k) {
                $v = trim((string) ($settings[$k] ?? ''));
                if ($v !== '' && (!preg_match('#^https://[^\s<>"]+$#', $v) || strlen($v) > 300)) {
                    fail("That link should start with https:// — $v");
                }
                $clean[$k] = $v;
            }

            $catalog = clean_catalog($body['catalog'] ?? []);
            $blogEdits = clean_blog($body['blog'] ?? []);

            // Validate every page before writing any.
            $pages = [];
            foreach ($body['files'] as $path => $content) {
                if (!is_string($path) || !is_string($content)
                    || !preg_match('#^((?:[a-z0-9-]+/){0,2}index\.html|404\.html|sitemap\.xml)$#', $path)
                    || strlen($content) > 2_000_000) {
                    fail('Unexpected page: ' . (string) $path);
                }
                $pages[$path] = $content;
            }
            if (!isset($pages['index.html'], $pages['contact/index.html'])) {
                fail('The site was not generated completely. Nothing was changed.');
            }

            write_json('content.json', (object) $overrides);
            write_json('settings.json', $clean);
            write_json('products.json', $catalog);
            write_json('blog.json', $blogEdits);
            foreach ($pages as $path => $content) {
                write_atomic(site_root() . '/' . $path, $content);
            }
            // Take down the pages of products and blog posts that were deleted or hidden.
            foreach (array_merge(glob(site_root() . '/products/*/index.html') ?: [], glob(site_root() . '/blog/*/index.html') ?: []) as $file) {
                $rel = basename(dirname(dirname($file))) . '/' . basename(dirname($file)) . '/index.html';
                if (!isset($pages[$rel])) {
                    @unlink($file);
                    @rmdir(dirname($file));
                }
            }
            $stamp = ['at' => time(), 'by' => $_SESSION['user']];
            write_json('last-publish.json', $stamp);
            reply(['ok' => true, 'pages' => count($pages), 'lastPublish' => $stamp]);

        case 'POST upload':
            $target = basename((string) ($_POST['target'] ?? ''));
            if (!preg_match('/^[a-z0-9][a-z0-9-]{0,80}\.(jpg|png)$/', $target)) {
                fail('Unknown photo.');
            }
            $upload = $_FILES['photo'] ?? null;
            if (!$upload || ($upload['error'] ?? 1) !== UPLOAD_ERR_OK || !is_uploaded_file($upload['tmp_name'])) {
                fail('The upload did not arrive. Try again.');
            }
            if ($upload['size'] > 8_000_000) {
                fail('That file is too large (8 MB maximum).');
            }
            $info = @getimagesize($upload['tmp_name']);
            $wanted = str_ends_with($target, '.png') ? IMAGETYPE_PNG : IMAGETYPE_JPEG;
            if (!$info || $info[2] !== $wanted) {
                fail('That file is not a valid ' . ($wanted === IMAGETYPE_PNG ? 'PNG' : 'JPG') . ' image.');
            }
            $saved = data_dir() . '/images';
            if (!is_dir($saved)) {
                mkdir($saved, 0755, true);
            }
            if (!move_uploaded_file($upload['tmp_name'], $saved . '/' . $target)) {
                fail('Could not save the photo.', 500);
            }
            if (!copy($saved . '/' . $target, $images . '/' . $target)) {
                fail('Could not place the photo on the website.', 500);
            }
            reply([
                'ok' => true,
                'file' => $target,
                'w' => $info[0],
                'h' => $info[1],
                'kb' => (int) round(filesize($images . '/' . $target) / 1024),
                'version' => $fingerprint($images . '/' . $target),
            ]);

        case 'POST password':
            $body = json_decode((string) file_get_contents('php://input'), true) ?: [];
            $creds = credentials();
            if (!password_verify((string) ($body['current'] ?? ''), $creds['hash'])) {
                fail('The current password is not correct.');
            }
            $new = (string) ($body['new'] ?? '');
            if (strlen($new) < 10) {
                fail('Use at least 10 characters for the new password.');
            }
            write_json('auth.json', ['username' => $creds['username'], 'hash' => password_hash($new, PASSWORD_DEFAULT)]);
            reply(['ok' => true]);

        case 'POST logout':
            $_SESSION = [];
            session_destroy();
            reply(['ok' => true]);

        default:
            fail('Unknown action.', 404);
    }
} catch (Throwable $e) {
    error_log('Vinaya admin: ' . $e->getMessage());
    fail('Something went wrong on the server: ' . $e->getMessage(), 500);
}
