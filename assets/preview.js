/* Design preview pop-up: renders a full sample invite for any design in a phone frame. */
(function () {
  'use strict';
  var C = window.WL_PREVIEW || {}, modal = document.getElementById('pv-modal');
  if (!modal) return;
  var frame = document.getElementById('pv-frame'), ready = false, pending = null, last = null;
  var LED = {}; (C.led || []).forEach(function (x) { LED[x[0]] = x[1]; });
  function data(theme, tier) {
    var s = window.WL_SAMPLES ? WL_SAMPLES.get(WL_SAMPLES.faith(theme)) : { p1: 'Arjun', p2: 'Meera', events: [] };
    var plan = tier === 'free' ? 'free' : 'premium';
    var photos = (C.photos || []).slice();
    if (LED[theme]) photos.unshift(LED[theme]);
    return Object.assign({}, s, { theme: theme, plan: plan, brand: C.brand, domain: C.domain, photos: plan === 'free' ? photos.slice(0, 1) : photos,
      video: plan === 'premium' ? (C.video || '') : '', video_kind: 'prewedding',
      gifts: plan === 'premium' ? [{ id: 'g1aaaaaa', name: 'Dinner set' }, { id: 'g2bbbbbb', name: 'Air fryer' }, { id: 'g3cccccc', name: 'Silver pooja set' }] : [] });
  }
  function paint() {
    if (!ready || !pending) return;
    try { frame.contentWindow.scrollTo(0, 0); frame.contentWindow.wlRender(data(pending.theme, pending.tier), { mode: 'demo', cover: true, autoOpen: 1100 }); } catch (e) {}
  }
  frame.addEventListener('load', function () { ready = true; paint(); });
  function open(btn) {
    pending = { theme: btn.dataset.theme, tier: btn.dataset.tier };
    document.getElementById('pv-title').textContent = btn.dataset.name;
    document.getElementById('pv-tier').textContent = { free: 'Free design', standard: 'One Link Wedding · ₹' + (C.pp || 999), premium: 'One Link Wedding · ₹' + (C.pp || 999) }[pending.tier] || '';
    document.getElementById('pv-use').href = '/create?t=' + pending.theme;
    last = btn; modal.hidden = false; document.documentElement.style.overflow = 'hidden';
    if (!frame.src) frame.src = '/frame.php'; else paint();
    document.getElementById('pv-x').focus();
  }
  function close() { modal.hidden = true; document.documentElement.style.overflow = ''; if (last) last.focus(); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.js-preview'); if (b) { e.preventDefault(); open(b); return; }
    if (e.target === modal || e.target.closest('#pv-x')) close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) close(); });
})();
