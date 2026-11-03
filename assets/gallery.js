/* Designs page: search, quick chips, filter sheet and card reveal. */
(function () {
  'use strict';
  var sec = document.getElementById('designs'); if (!sec) return;
  var $ = function (id) { return document.getElementById(id); };
  var cards = [].slice.call(sec.querySelectorAll('.dz-grid .gd'));
  var chips = [].slice.call(sec.querySelectorAll('.dz-chips button'));
  var sheet = $('dz-sheet'), q = $('dz-q');
  var st = { q: '', quick: '', trad: [], style: [], plan: [] };

  function has(g, t) { return g.dataset.tags.split(' ').indexOf(t) > -1; }
  function anyOf(g, list) { return !list.length || list.some(function (t) { return has(g, t); }); }
  function apply(animate) {
    var words = st.q.toLowerCase().split(/\s+/).filter(Boolean), shown = 0;
    cards.forEach(function (g) {
      var ok = (!st.quick || has(g, st.quick)) && anyOf(g, st.trad) && anyOf(g, st.style) && anyOf(g, st.plan) &&
        words.every(function (w) { return g.dataset.q.indexOf(w) > -1; });
      g.hidden = !ok;
      if (ok && animate) { g.classList.remove('dz-pop'); void g.offsetWidth; g.style.setProperty('--d', Math.min(shown, 8) * 45 + 'ms'); g.classList.add('dz-pop'); }
      if (ok) shown++;
    });
    var n = st.trad.length + st.style.length + st.plan.length;
    $('dz-n').hidden = !n; $('dz-n').textContent = n;
    $('dz-count').textContent = shown === cards.length ? 'Showing all designs' : 'Showing ' + shown + (shown === 1 ? ' design' : ' designs');
    $('dz-empty').hidden = shown > 0;
    $('dz-clear').hidden = !st.q;
    chips.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.plan === st.quick)); });
    sheet.querySelectorAll('.dz-opts').forEach(function (box) {
      var list = st[box.dataset.group];
      box.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(list.indexOf(b.dataset.v) > -1)); });
    });
  }
  function reset() { st = { q: '', quick: '', trad: [], style: [], plan: [] }; q.value = ''; apply(true); }

  var tq; q.addEventListener('input', function () { clearTimeout(tq); tq = setTimeout(function () { st.q = q.value.trim(); apply(true); }, 140); });
  $('dz-clear').addEventListener('click', function () { q.value = ''; st.q = ''; apply(true); q.focus(); });
  chips.forEach(function (b) { b.addEventListener('click', function () { st.quick = b.dataset.plan; apply(true); }); });

  function openSheet() { sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add('open'); }); document.body.style.overflow = 'hidden'; }
  function closeSheet() { sheet.classList.remove('open'); document.body.style.overflow = ''; setTimeout(function () { sheet.hidden = true; }, 250); }
  $('dz-fbtn').addEventListener('click', openSheet);
  $('dz-x').addEventListener('click', closeSheet);
  $('dz-apply').addEventListener('click', function () { closeSheet(); apply(true); sec.scrollIntoView({ behavior: 'smooth' }); });
  $('dz-reset').addEventListener('click', function () { st.trad = []; st.style = []; st.plan = []; apply(false); });
  $('dz-empty-reset').addEventListener('click', reset);
  sheet.addEventListener('click', function (e) { if (e.target === sheet) closeSheet(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) closeSheet(); });
  sheet.querySelectorAll('.dz-opts button').forEach(function (b) {
    b.addEventListener('click', function () {
      var list = st[b.parentNode.dataset.group], i = list.indexOf(b.dataset.v);
      if (i > -1) list.splice(i, 1); else list.push(b.dataset.v);
      apply(false);
    });
  });

  // old links like /designs?f=kerala keep working
  var f = sec.dataset.startFilter || 'all';
  if (f !== 'all') { if (chips.some(function (b) { return b.dataset.plan === f; })) st.quick = f; else st.trad = [f]; }
  apply(false);

  // cards rise in as they scroll into view
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('dz-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -5% 0px' });
    cards.forEach(function (g, i) { g.classList.add('dz-rv'); g.style.setProperty('--d', (i % 2) * 80 + 'ms'); io.observe(g); });
  }
})();
