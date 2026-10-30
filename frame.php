<?php require __DIR__ . '/lib/bootstrap.php'; header('X-Robots-Tag: noindex'); ?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Invite preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="<?= asset('assets/invite.css') ?>">
<style>html,body{margin:0;background:#fff}html{scrollbar-width:none}body::-webkit-scrollbar{display:none}</style>
</head>
<body>
<div id="invite"></div>
<script src="<?= asset('assets/invite.js') ?>"></script>
<script>
  // Parent pages call window.wlRender(data, opts) once this frame has loaded.
  window.wlRender = function (data, opts) { WL.render(document.getElementById('invite'), data, opts || {}); };
  window.wlScrollTo = function (sec) {
    var el = document.querySelector('[data-sec="' + sec + '"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  try { parent.postMessage({ wlFrameReady: true }, location.origin); } catch (e) {}
</script>
</body>
</html>
