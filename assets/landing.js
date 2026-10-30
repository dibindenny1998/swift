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
  function isoIn(days) {
    var d = new Date(Date.now() + days * 864e5);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  var state = { theme: 'kasavu', p1: 'Arjun', p2: 'Meera' };
  var sample = {
    p1_family: 'Son of Rajan & Latha Menon, Thrissur', p2_family: 'Daughter of Suresh & Anitha Nair, Kochi',
    message: 'With the blessings of our elders, we warmly invite you and your family to share our joy.',
    events: [
      { name: 'Engagement', date: isoIn(70), time: '17:00', venue: 'Lulu Convention Centre', address: 'Puzhakkal, Thrissur' },
      { name: 'Wedding', date: isoIn(72), time: '10:30', venue: 'Sree Krishna Temple', address: 'Guruvayur, Kerala' },
      { name: 'Reception', date: isoIn(72), time: '18:30', venue: 'Grand Hyatt', address: 'Bolgatty, Kochi' }
    ],
    contact_name: 'Rajan Menon', contact_phone: '9876543210', plan: 'premium', brand: 'WedLink'
  };
  var frame = document.getElementById('demo');
  var ready = false, first = true;
  function data() { return Object.assign({}, sample, { theme: state.theme, p1: state.p1, p2: state.p2 }); }
  function paint() {
    if (!ready) return;
    try {
      frame.contentWindow.wlRender(data(), first ? { mode: 'demo', cover: true, autoOpen: 1300 } : { mode: 'editor', keepScroll: true });
      first = false;
    } catch (e) {}
  }
  frame.addEventListener('load', function () { ready = true; paint(); });

  var t;
  function soon() { clearTimeout(t); t = setTimeout(paint, 120); }
  var meas = document.createElement('span');
  meas.className = 'name-measure';
  document.querySelector('.hero h1').appendChild(meas);
  function fit(inp) {
    meas.textContent = inp.value || 'M';
    inp.style.width = (meas.getBoundingClientRect().width + 6) + 'px';
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(document.getElementById('n1')); fit(document.getElementById('n2')); });
  addEventListener('resize', function () { fit(document.getElementById('n1')); fit(document.getElementById('n2')); });
  ['n1', 'n2'].forEach(function (id, i) {
    var inp = document.getElementById(id);
    fit(inp);
    inp.addEventListener('focus', function () { if (inp.value === (i ? 'Meera' : 'Arjun')) inp.select(); });
    inp.addEventListener('input', function () {
      fit(inp);
      state[i ? 'p2' : 'p1'] = inp.value.trim();
      soon(); links();
    });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); (i ? document.querySelector('.js-make') : document.getElementById('n2')).focus(); } });
  });

  document.querySelectorAll('.sw').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.sw').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      state.theme = b.dataset.theme;
      paint(); links();
    });
  });

  function links() {
    var qs = '?t=' + state.theme;
    if (state.p1 && state.p1 !== 'Arjun') qs += '&n1=' + encodeURIComponent(state.p1);
    if (state.p2 && state.p2 !== 'Meera') qs += '&n2=' + encodeURIComponent(state.p2);
    document.querySelectorAll('.js-make').forEach(function (a) { a.href = '/create' + qs; });
  }
})();
