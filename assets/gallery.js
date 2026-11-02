/* Design gallery filters (Designs page). */
(function () {
  'use strict';
  var sec = document.getElementById('designs'); if (!sec) return;
  var btns = sec.querySelectorAll('.filters button');
  function filter(f) {
    var any = false;
    btns.forEach(function (b) { var on = b.dataset.f === f; b.setAttribute('aria-pressed', String(on)); any = any || on; });
    if (!any) { f = 'all'; btns[0] && btns[0].setAttribute('aria-pressed', 'true'); }
    sec.querySelectorAll('.gd').forEach(function (g) { g.hidden = f !== 'all' && g.dataset.tags.split(' ').indexOf(f) < 0; });
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { filter(b.dataset.f); history.replaceState(null, '', b.dataset.f === 'all' ? '/designs' : '/designs?f=' + b.dataset.f); }); });
  filter(sec.dataset.startFilter || 'all');
})();
