(function () {
  'use strict';
  var CFG = window.WL_CFG;
  var EX = CFG.existing;
  var form = document.getElementById('f');
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var navBtns = Array.prototype.slice.call(document.querySelectorAll('.steps-nav button'));
  var TEXT = ['p1', 'p2', 'p1_family', 'p2_family', 'intro', 'line', 'message', 'closing', 'contact_name', 'contact_phone'];
  var EVENT_NAMES = ['Wedding', 'Engagement', 'Reception', 'Haldi', 'Mehendi', 'Sangeet', 'Madhuramvaypu', 'Nikah', 'Betrothal'];
  var MAX_PHOTOS = 15;

  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  // ---------- state ----------
  var data, photos = [], music = null;
  if (EX) {
    data = EX.data;
    photos = EX.photos.slice();
    music = EX.music;
  } else {
    var saved = store.get('wl_draft') || {};
    data = Object.assign({}, saved, CFG.init.p1 ? { p1: CFG.init.p1 } : {}, CFG.init.p2 ? { p2: CFG.init.p2 } : {});
    if (!saved.theme || new URLSearchParams(location.search).get('t')) data.theme = CFG.init.theme;
  }
  if (!data.events || !data.events.length) data.events = [{ name: 'Wedding', date: '', time: '', venue: '', address: '', map: '' }];

  // ---------- fill form ----------
  TEXT.forEach(function (k) { var el = form.elements[k]; if (el && data[k]) el.value = data[k]; });
  (form.querySelector('input[name=theme][value="' + (data.theme || 'kasavu') + '"]') || form.querySelector('input[name=theme]')).checked = true;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  var evWrap = document.getElementById('events');
  function drawEvents() {
    evWrap.innerHTML = data.events.map(function (ev, i) {
      return '<div class="ev-card" data-i="' + i + '">' +
        (data.events.length > 1 ? '<button type="button" class="x" data-del="' + i + '" aria-label="Remove this event">&times;</button>' : '') +
        '<div class="field"><label for="ev-name-' + i + '">Event</label><input id="ev-name-' + i + '" data-k="name" maxlength="40" value="' + esc(ev.name) + '" placeholder="Wedding">' +
        '<div class="chips">' + EVENT_NAMES.map(function (n) { return '<button type="button" data-chip="' + n + '">' + n + '</button>'; }).join('') + '</div></div>' +
        '<div class="row2"><div class="field"><label for="ev-date-' + i + '">Date</label><input id="ev-date-' + i + '" type="date" data-k="date" value="' + esc(ev.date) + '"></div>' +
        '<div class="field"><label for="ev-time-' + i + '">Time</label><input id="ev-time-' + i + '" type="time" data-k="time" value="' + esc(ev.time) + '"></div></div>' +
        '<div class="field"><label for="ev-venue-' + i + '">Venue</label><input id="ev-venue-' + i + '" data-k="venue" maxlength="80" value="' + esc(ev.venue) + '" placeholder="St. Mary\'s Church"></div>' +
        '<div class="field"><label for="ev-addr-' + i + '">Address</label><textarea id="ev-addr-' + i + '" data-k="address" maxlength="160" rows="2" placeholder="Area, city">' + esc(ev.address) + '</textarea></div>' +
        '<div class="field"><label for="ev-map-' + i + '">Google Maps link (optional)</label><input id="ev-map-' + i + '" data-k="map" maxlength="300" inputmode="url" value="' + esc(ev.map) + '" placeholder="Paste from Google Maps, or leave empty"><small>Empty is fine. We search the venue and address.</small></div>' +
        '</div>';
    }).join('');
    document.getElementById('add-ev').hidden = data.events.length >= 6;
  }
  drawEvents();

  evWrap.addEventListener('input', function (e) {
    var card = e.target.closest('.ev-card'); var k = e.target.dataset.k;
    if (!card || !k) return;
    data.events[+card.dataset.i][k] = e.target.value;
    changed('events');
  });
  evWrap.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-chip]');
    if (chip) {
      var card = chip.closest('.ev-card');
      var inp = card.querySelector('[data-k=name]');
      inp.value = chip.dataset.chip;
      data.events[+card.dataset.i].name = chip.dataset.chip;
      changed('events');
      return;
    }
    var del = e.target.closest('[data-del]');
    if (del) { data.events.splice(+del.dataset.del, 1); drawEvents(); changed('events'); }
  });
  document.getElementById('add-ev').addEventListener('click', function () {
    var prev = data.events[data.events.length - 1] || {};
    data.events.push({ name: '', date: prev.date || '', time: '', venue: '', address: '', map: '' });
    drawEvents();
    var cards = evWrap.querySelectorAll('.ev-card');
    cards[cards.length - 1].querySelector('input').focus();
    changed('events');
  });

  form.addEventListener('input', function (e) {
    if (TEXT.indexOf(e.target.name) > -1) { data[e.target.name] = e.target.value; changed(); }
  });
  form.addEventListener('change', function (e) {
    if (e.target.name === 'theme') { data.theme = e.target.value; changed('hero'); }
  });

  // ---------- photos ----------
  var thumbs = document.getElementById('thumbs');
  function drawPhotos() {
    thumbs.innerHTML = photos.map(function (p, i) {
      return '<figure class="' + (i >= 4 ? 'extra' : '') + '"><img src="' + esc(p.url) + '" alt="">' +
        '<button type="button" data-rm="' + i + '" aria-label="Remove photo">&times;</button>' + (i === 0 ? '<figcaption>Cover</figcaption>' : (i === 4 ? '<figcaption>Premium</figcaption>' : '')) + '</figure>';
    }).join('');
    document.querySelector('.drop[for=photo-in] b').textContent = photos.length ? 'Add more photos (' + photos.length + ' of ' + MAX_PHOTOS + ')' : 'Add photos';
  }
  drawPhotos();
  thumbs.addEventListener('click', function (e) {
    var b = e.target.closest('[data-rm]'); if (!b) return;
    var p = photos.splice(+b.dataset.rm, 1)[0];
    if (p && p.kind === 'new') URL.revokeObjectURL(p.url);
    drawPhotos(); changed('photos');
  });

  function shrink(file) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var max = 1600, w = img.naturalWidth, h = img.naturalHeight, s = Math.min(1, max / Math.max(w, h));
        var c = document.createElement('canvas');
        c.width = Math.round(w * s); c.height = Math.round(h * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(u);
        c.toBlob(function (b) { b ? res(b) : rej(new Error('x')); }, 'image/jpeg', 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(u); rej(new Error('x')); };
      img.src = u;
    });
  }
  document.getElementById('photo-in').addEventListener('change', function (e) {
    var files = Array.prototype.slice.call(e.target.files || []);
    e.target.value = '';
    var room = MAX_PHOTOS - photos.length;
    var err = panels[3].querySelector('.err');
    err.textContent = files.length > room ? 'Only ' + MAX_PHOTOS + ' photos fit. We added the first ' + Math.max(room, 0) + '.' : '';
    files.slice(0, Math.max(room, 0)).reduce(function (p, f) {
      return p.then(function () {
        return shrink(f).then(function (blob) {
          photos.push({ kind: 'new', blob: blob, url: URL.createObjectURL(blob) });
          drawPhotos(); changed('photos');
        }).catch(function () { err.textContent = 'One photo could not be read. Try a JPG or PNG.'; });
      });
    }, Promise.resolve());
  });

  // ---------- music ----------
  var musicIn = document.getElementById('music-in'), musicX = document.getElementById('music-x'), musicLabel = document.getElementById('music-label');
  function drawMusic() {
    musicLabel.textContent = music ? 'Song: ' + (music.label || 'added') : 'Add a song (MP3 or M4A)';
    musicX.hidden = !music;
  }
  drawMusic();
  musicIn.addEventListener('change', function () {
    var f = musicIn.files[0]; musicIn.value = '';
    var err = panels[3].querySelector('.err');
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { err.textContent = 'That song is over 10 MB. Pick a shorter or smaller file.'; return; }
    if (!/\.(mp3|m4a|aac|mp4)$/i.test(f.name)) { err.textContent = 'Use an MP3 or M4A file.'; return; }
    err.textContent = '';
    if (music && music.kind === 'new') URL.revokeObjectURL(music.url);
    music = { kind: 'new', file: f, url: URL.createObjectURL(f), label: f.name.replace(/\.[^.]+$/, '').slice(0, 40) };
    drawMusic(); changed();
  });
  musicX.addEventListener('click', function () { music = null; drawMusic(); changed(); });

  // ---------- preview ----------
  var pv = document.getElementById('pv'), pvm = document.getElementById('pv-m'), sheet = document.getElementById('sheet');
  function payload() {
    return Object.assign({}, data, { photos: photos.map(function (p) { return p.url; }), music: music ? music.url : '', plan: 'premium', brand: CFG.brand });
  }
  function paint(frame, sec) {
    try {
      if (!frame.contentWindow || !frame.contentWindow.wlRender) return;
      frame.contentWindow.wlRender(payload(), { mode: 'editor', keepScroll: !sec });
      if (sec) frame.contentWindow.wlScrollTo(sec);
    } catch (e) {}
  }
  var t, pendingSec = null;
  function changed(sec) {
    if (sec) pendingSec = sec;
    clearTimeout(t);
    t = setTimeout(function () {
      paint(pv, pendingSec); if (!sheet.hidden) paint(pvm, pendingSec); pendingSec = null;
      if (!EX) { var d = Object.assign({}, data); store.set('wl_draft', d); }
    }, 140);
  }
  pv.addEventListener('load', function () { paint(pv); });
  document.getElementById('open-sheet').addEventListener('click', function () {
    sheet.hidden = false;
    var secs = ['hero', 'hero', 'events', 'photos', 'hero'];
    if (!pvm.src) { pvm.onload = function () { paint(pvm, secs[cur]); }; pvm.src = '/frame.php'; }
    else paint(pvm, secs[cur]);
  });
  document.getElementById('close-sheet').addEventListener('click', function () { sheet.hidden = true; });

  // ---------- steps ----------
  var cur = 0;
  function validate(step) {
    var err = panels[step].querySelector('.err');
    var msg = '';
    if (step === 1) {
      if (!(data.p1 || '').trim()) { msg = 'Add the first name.'; form.elements.p1.focus(); }
      else if (!(data.p2 || '').trim()) { msg = 'Add the second name.'; form.elements.p2.focus(); }
    }
    if (step === 2) {
      var withDate = data.events.filter(function (e) { return e.date; });
      if (!withDate.length) { msg = 'Add a date for at least one event.'; var d = evWrap.querySelector('[data-k=date]'); if (d) d.focus(); }
      else if (data.events.some(function (e) { return !e.date && (e.name || e.venue); })) { msg = 'Each event needs a date. Add one or remove the event.'; }
    }
    if (err) err.textContent = msg;
    return !msg;
  }
  function go(n) {
    if (n > cur) { for (var s = cur; s < n; s++) { if (!validate(s)) { show(s); return; } } }
    show(n);
  }
  function show(n) {
    cur = n;
    panels.forEach(function (p, i) { p.hidden = i !== n; });
    navBtns.forEach(function (b, i) {
      if (i === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      b.classList.toggle('done', i < n);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    var sec = ['hero', 'hero', 'events', 'photos', null][n];
    if (sec) { pendingSec = sec; changed(); }
    var first = panels[n].querySelector('input:not([type=radio]):not([type=file]), textarea');
    if (first && n > 0 && matchMedia('(min-width: 901px)').matches) setTimeout(function () { first.focus({ preventScroll: true }); }, 250);
  }
  navBtns.forEach(function (b) { b.addEventListener('click', function () { go(+b.dataset.go); }); });
  form.addEventListener('click', function (e) {
    if (e.target.closest('.js-next')) go(cur + 1);
    if (e.target.closest('.js-back')) show(Math.max(0, cur - 1));
  });

  // ---------- save ----------
  function cookie(n) { var m = document.cookie.match('(?:^|; )' + n + '=([^;]*)'); return m ? decodeURIComponent(m[1]) : ''; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    for (var s = 0; s < 4; s++) if (!validate(s)) { show(s); return; }
    var err = panels[4].querySelector('.err');
    var phoneEl = form.elements.phone;
    if (phoneEl) {
      var digits = phoneEl.value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
      if (digits.length !== 10) { err.textContent = 'Enter a 10-digit mobile number.'; phoneEl.focus(); return; }
    }
    var btn = document.getElementById('save');
    btn.disabled = true; err.textContent = '';
    btn.textContent = EX ? 'Saving…' : 'Saving your invite…';

    var fd = new FormData();
    var clean = {};
    TEXT.concat(['theme']).forEach(function (k) { clean[k] = (data[k] || '').trim ? (data[k] || '').trim() : data[k]; });
    clean.events = data.events.filter(function (ev) { return ev.date; });
    fd.append('data', JSON.stringify(clean));
    var order = [];
    var n = 0;
    photos.forEach(function (p) {
      if (p.kind === 'old') order.push('old:' + p.name);
      else { order.push('new:' + n); fd.append('photo_' + n, p.blob, 'photo' + n + '.jpg'); n++; }
    });
    fd.append('photo_order', JSON.stringify(order));
    if (music && music.kind === 'new') { fd.append('music', music.file, music.file.name); fd.append('music_label', music.label); }
    fd.append('music_keep', music && music.kind === 'old' ? '1' : '0');
    if (EX) fd.append('token', EX.token);
    if (phoneEl) { fd.append('phone', phoneEl.value); fd.append('email', form.elements.email.value); }
    var attr = store.get('wl_attr') || {};
    fd.append('utm_source', attr.utm_source || ''); fd.append('utm_campaign', attr.utm_campaign || ''); fd.append('fbclid', attr.fbclid || '');
    fd.append('fbp', cookie('_fbp'));

    fetch('/api.php?a=save', { method: 'POST', body: fd })
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'The server sent an unexpected reply (' + r.status + '). Try again.' }; }); })
      .then(function (j) {
        if (!j.ok) throw new Error(j.error || 'Could not save. Try again.');
        if (!EX) {
          store.set('wl_last', j.token);
          try { localStorage.removeItem('wl_draft'); } catch (x) {}
          try { fbq('track', 'Lead', { content_name: 'Invite preview' }); } catch (x) {}
        }
        setTimeout(function () { location.href = '/p/' + j.token + (EX ? '?saved=1' : ''); }, 250);
      })
      .catch(function (x) {
        btn.disabled = false; btn.textContent = EX ? 'Save changes' : 'See my invite';
        err.textContent = x.message === 'Failed to fetch' ? 'No connection. Check your internet and try again.' : x.message;
      });
  });
})();
