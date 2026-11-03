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
  // the blinking cursor hint disappears once the visitor taps a name
  var namesEl = document.getElementById('names');
  [n1, n2].forEach(function (inp) { inp.addEventListener('focus', function () { namesEl.classList.add('typed'); }); });
  document.querySelectorAll('.name-box').forEach(function (bx) { bx.addEventListener('click', function (e) { if (e.target.tagName !== 'INPUT') bx.querySelector('input').focus(); }); });
  var frame = document.getElementById('demo');
  var ready = false, first = true;

  function sample() { return WL_SAMPLES.get(WL_SAMPLES.faith(state.theme)); }
  // real photos uploaded in Admin → Images (Home page demo) make the preview feel real
  var DEMO_PHOTOS = window.WL_DEMO_PHOTOS || [];
  var DEMO_VIDEO = window.WL_DEMO_VIDEO || '';
  function data() { var s = sample(); return Object.assign({}, s, { theme: state.theme, p1: state.p1 || s.p1, p2: state.p2 || s.p2, brand: 'TheWedLink' }, DEMO_PHOTOS.length ? { photos: DEMO_PHOTOS, plan: 'premium' } : {}, DEMO_VIDEO ? { video: DEMO_VIDEO, plan: 'premium' } : {}); }
  function paint() {
    if (!ready) return;
    try {
      frame.contentWindow.wlRender(data(), first ? { mode: 'demo', cover: true, autoOpen: 1300, filmCover: true } : { mode: 'editor', keepScroll: !state.jump, filmCover: true });
      if (state.jump) frame.contentWindow.scrollTo(0, 0);
      first = false; state.jump = false;
    } catch (e) {}
  }
  frame.addEventListener('load', function () { ready = true; paint(); });

  var meas = document.createElement('span');
  meas.className = 'name-measure';
  document.getElementById('names').appendChild(meas);
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
      namesEl.classList.add('typed');
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
  showUrl();
  document.querySelectorAll('.sw2').forEach(function (b) { b.addEventListener('click', function () { pick(b.dataset.theme); }); });

  var urlNames = document.getElementById('url-names');
  function slugify(x) { return String(x || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function showUrl() {
    if (!urlNames) return;
    var s = sample();
    urlNames.textContent = (slugify(state.p1 || s.p1) || 'you') + '-' + (slugify(state.p2 || s.p2) || 'yours');
  }
  function links() {
    showUrl();
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

// plan cards on phones: start with Standard (Most Popular) in the middle
(function () {
  var row = document.getElementById('mini-plans'), pop = row && row.querySelector('.pop');
  if (!row || !pop || row.scrollWidth <= row.clientWidth) return;
  row.scrollLeft = pop.offsetLeft - (row.clientWidth - pop.offsetWidth) / 2;
})();

// phones: hide the bottom bar while the hero's own button is on screen
(function () {
  var c = document.querySelector('.hero-cta-m');
  if (!c || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (es) { document.body.classList.toggle('hero-cta-visible', es[0].isIntersecting); }).observe(c);
})();
// the demo inside the hero phone is drawn at a real phone width, then scaled down, so it looks like a phone screen and not a zoomed-in one
(function () {
  var f = document.getElementById('demo'); if (!f) return;
  var ph = f.parentNode, V = 390;
  function fit() {
    f.removeAttribute('style');
    var cs = getComputedStyle(ph), pl = parseFloat(cs.paddingLeft) || 0, pt = parseFloat(cs.paddingTop) || 0;
    var W = ph.clientWidth - pl * 2, H = ph.clientHeight - pt * 2;
    if (!W || W >= V - 30) return;
    var s = W / V, bw = parseFloat(getComputedStyle(f).borderTopWidth) || 0, br = parseFloat(getComputedStyle(f).borderTopLeftRadius) || 0;
    f.style.cssText = 'position:absolute;left:' + pl + 'px;top:' + pt + 'px;width:' + V + 'px;height:' + (H / s) + 'px;transform:scale(' + s + ');transform-origin:0 0;border-width:' + (bw / s) + 'px;border-radius:' + (br / s) + 'px';
  }
  fit();
  var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fit, 120); });
})();
