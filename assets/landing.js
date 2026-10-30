(function () {
  'use strict';
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  // Remember where the visitor came from (Meta ad UTMs / fbclid) for revenue-per-campaign tracking.
  var q = new URLSearchParams(location.search);
  if (q.get('utm_source') || q.get('utm_campaign') || q.get('fbclid')) {
    store.set('wl_attr', { utm_source: q.get('utm_source') || '', utm_campaign: q.get('utm_campaign') || '', fbclid: q.get('fbclid') || '', t: Date.now() });
  }
  var last = store.get('wl_last');
  if (last && /^[a-f0-9]{32}$/.test(last)) {
    document.getElementById('resume').hidden = false;
    document.getElementById('resume-link').href = '/p/' + last;
  }
  var top = document.getElementById('top');
  addEventListener('scroll', function () { top.classList.toggle('scrolled', scrollY > 8); }, { passive: true });

  // ---- live demo ----
  var THEMES = window.WL_THEMES || {};
  var state = { theme: 'champagne', p1: '', p2: '', touched: false };
  var n1 = document.getElementById('n1'), n2 = document.getElementById('n2');
  var frame = document.getElementById('demo');
  var ready = false, first = true;

  function sample() { return WL_SAMPLES.get(WL_SAMPLES.faith(state.theme)); }
  function data() { var s = sample(); return Object.assign({}, s, { theme: state.theme, p1: state.p1 || s.p1, p2: state.p2 || s.p2, brand: 'WedLink' }); }
  function paint() {
    if (!ready) return;
    try {
      frame.contentWindow.wlRender(data(), first ? { mode: 'demo', cover: true, autoOpen: 1300 } : { mode: 'editor', keepScroll: !state.jump });
      if (state.jump) frame.contentWindow.scrollTo(0, 0);
      first = false; state.jump = false;
    } catch (e) {}
  }
  frame.addEventListener('load', function () { ready = true; paint(); });

  var meas = document.createElement('span');
  meas.className = 'name-measure';
  document.querySelector('.hero h1').appendChild(meas);
  function fit(inp) { meas.textContent = inp.value || 'M'; inp.style.width = (meas.getBoundingClientRect().width + 6) + 'px'; }
  function fitAll() { fit(n1); fit(n2); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  addEventListener('resize', fitAll);

  function syncNames() {
    if (state.touched) return;
    var s = sample();
    n1.value = s.p1; n2.value = s.p2; fitAll();
  }
  syncNames();

  var t;
  function soon() { clearTimeout(t); t = setTimeout(paint, 120); }
  [n1, n2].forEach(function (inp, i) {
    inp.addEventListener('focus', function () { if (!state.touched) inp.select(); });
    inp.addEventListener('input', function () {
      state.touched = true;
      fit(inp);
      state.p1 = n1.value.trim(); state.p2 = n2.value.trim();
      soon(); links();
    });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); (i ? document.querySelector('.hero-cta .js-make') || document.querySelector('.js-make') : n2).focus(); } });
  });

  var nameOut = document.getElementById('design-name');
  function pick(theme) {
    state.theme = theme; state.jump = true;
    document.querySelectorAll('.sw2').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.theme === theme)); });
    nameOut.textContent = (THEMES[theme] || {}).name || theme;
    syncNames(); paint(); links();
  }
  document.querySelectorAll('.sw2').forEach(function (b) { b.addEventListener('click', function () { pick(b.dataset.theme); }); });

  function links() {
    var qs = '?t=' + state.theme;
    if (state.touched && state.p1) qs += '&n1=' + encodeURIComponent(state.p1);
    if (state.touched && state.p2) qs += '&n2=' + encodeURIComponent(state.p2);
    document.querySelectorAll('.js-make').forEach(function (a) { a.href = '/create' + qs; });
  }

  // ---- gallery filters ----
  var fBtns = document.querySelectorAll('.filters button');
  function filter(f) {
    fBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.f === f)); });
    document.querySelectorAll('.gd').forEach(function (g) { g.hidden = f !== 'all' && g.dataset.tags.split(' ').indexOf(f) < 0; });
  }
  fBtns.forEach(function (b) { b.addEventListener('click', function () { filter(b.dataset.f); }); });
  document.querySelectorAll('.js-cat').forEach(function (a) { a.addEventListener('click', function () { filter(a.dataset.cat); }); });
})();
