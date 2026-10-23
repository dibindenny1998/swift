<?php
/** VINAYA admin: login, then the editor (admin.js does the rest). */

declare(strict_types=1);

require __DIR__ . '/lib.php';

start_session();
no_cache_headers();
header("Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");

$error = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && !logged_in()) {
    if (!hash_equals($_SESSION['csrf'], (string) ($_POST['csrf'] ?? ''))) {
        $error = 'Your session expired. Please try again.';
    } elseif (($wait = lockout_remaining()) > 0) {
        $error = 'Too many attempts. Try again in ' . max(1, (int) ceil($wait / 60)) . ' minutes.';
    } elseif (attempt_login((string) ($_POST['username'] ?? ''), (string) ($_POST['password'] ?? ''))) {
        header('Location: ./', true, 303);
        exit;
    } else {
        $error = 'That username or password is not correct.';
    }
}

$h = static fn (string $s): string => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Vinaya · Admin</title>
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Jost:wght@400;500&display=swap">
<link rel="stylesheet" href="admin.css?v=<?= $h((string) @filemtime(__DIR__ . '/admin.css')) ?>">
<?php if (logged_in()): ?>
<meta name="csrf" content="<?= $h($_SESSION['csrf']) ?>">
<script type="module" src="admin.js?v=<?= $h((string) @filemtime(__DIR__ . '/admin.js')) ?>"></script>
<?php endif; ?>
</head>
<body>
<?php if (!logged_in()): ?>
<main class="login">
  <form class="login__card" method="post" autocomplete="on">
    <img class="login__logo" src="../assets/img/logo-full.svg" alt="Vinaya" width="140" height="131">
    <h1>Website admin</h1>
    <?php if ($error): ?><p class="alert alert--error" role="alert"><?= $h($error) ?></p><?php endif; ?>
    <input type="hidden" name="csrf" value="<?= $h($_SESSION['csrf']) ?>">
    <label>Username<input name="username" autocomplete="username" required autofocus></label>
    <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
    <button class="btn" type="submit">Log in</button>
  </form>
</main>
<?php else: ?>
<div id="app" class="app" aria-busy="true">
  <p class="loading">Loading the editor…</p>
</div>
<noscript><p class="alert alert--error">The editor needs JavaScript.</p></noscript>
<?php endif; ?>
</body>
</html>
