/* WedLink invite renderer. One renderer powers the live invite, the owner preview,
   the live editor preview and the landing-page demo. */
(function (w, doc) {
  'use strict';

  var FONTS = {
    kasavu: 'family=Great+Vibes&family=Marcellus',
    sindoor: 'family=Rozha+One&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500',
    marigold: 'family=Yatra+One&family=Mukta:wght@400;500;600',
    nilavu: 'family=Pinyon+Script&family=Cinzel:wght@400;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400',
    mullappoo: 'family=Italiana&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500',
    thamara: 'family=Parisienne&family=Lora:ital,wght@0,400;0,500;1,400'
  };
  // Indian scripts: Google serves these with unicode-range, so they only download when the text uses them.
  var SCRIPT_FONTS = 'family=Noto+Serif+Malayalam:wght@400;600&family=Noto+Serif+Devanagari:wght@400;600&family=Noto+Serif+Kannada:wght@400;600&family=Noto+Serif+Tamil:wght@400;600&family=Noto+Serif+Telugu:wght@400;600';

  var LIMITS = {
    standard: { events: 3, photos: 4, rsvp: false, music: false, badge: true },
    premium: { events: 6, photos: 15, rsvp: true, music: true, badge: false }
  };

  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function loadFont(q) {
    var id = 'wlf-' + q.replace(/[^a-z]/gi, '').slice(0, 40);
    if (doc.getElementById(id)) return;
    var l = doc.createElement('link');
    l.id = id; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?' + q + '&display=swap';
    doc.head.appendChild(l);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function nl2br(s) { return esc(s).replace(/\n/g, '<br>'); }

  function parts(dateStr) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr || '');
    if (!m) return null;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    return { y: +m[1], mo: +m[2] - 1, d: +m[3], wd: d.getUTCDay() };
  }
  function longDate(s) { var p = parts(s); return p ? DAYS[p.wd] + ', ' + p.d + ' ' + MONTHS[p.mo] + ' ' + p.y : ''; }
  function time12(t) {
    var m = /^(\d{1,2}):(\d{2})/.exec(t || '');
    if (!m) return '';
    var h = +m[1], ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + m[2] + ' ' + ap;
  }
  function startOf(ev) {
    if (!parts(ev.date)) return null;
    var t = /^\d{1,2}:\d{2}$/.test(ev.time || '') ? ev.time : '09:00';
    if (t.length === 4) t = '0' + t;
    return new Date(ev.date + 'T' + t + ':00+05:30');
  }
  function utcStamp(d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function calLink(ev, title) {
    var s = startOf(ev); if (!s) return '#';
    var e = new Date(s.getTime() + 3 * 3600 * 1000);
    var loc = [ev.venue, ev.address].filter(Boolean).join(', ');
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent((ev.name || 'Wedding') + ': ' + title) +
      '&dates=' + utcStamp(s) + '/' + utcStamp(e) + '&location=' + encodeURIComponent(loc) +
      '&details=' + encodeURIComponent('Invitation: ' + location.href);
  }
  function mapLink(ev) {
    if (ev.map && /^https?:\/\//i.test(ev.map)) return ev.map;
    var q = [ev.venue, ev.address].filter(Boolean).join(', ');
    return q ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q) : '';
  }
  function initial(n) { var s = String(n || '').trim(); return s ? Array.from(s)[0].toUpperCase() : ''; }

  function rng(seed) { // mulberry32
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function f1(n) { return Math.round(n * 10) / 10; }

  /* ---------------- ornaments ---------------- */

  function mandala(c) {
    var s = '', rings = [[16, 8, 22, 9], [42, 12, 30, 11], [76, 16, 34, 11], [114, 24, 30, 8], [148, 32, 26, 6]];
    rings.forEach(function (r) {
      for (var i = 0; i < r[1]; i++) {
        s += '<path transform="rotate(' + f1(i * 360 / r[1]) + ')" d="M0,' + (-r[0]) + ' Q' + r[3] + ',' + (-(r[0] + r[2] / 2)) + ' 0,' + (-(r[0] + r[2])) + ' Q' + (-r[3]) + ',' + (-(r[0] + r[2] / 2)) + ' 0,' + (-r[0]) + 'Z"/>';
      }
      s += '<circle r="' + r[0] + '"/>';
    });
    var dots = '';
    for (var i = 0; i < 56; i++) {
      var a = i * Math.PI * 2 / 56;
      dots += '<circle cx="' + f1(184 * Math.cos(a)) + '" cy="' + f1(184 * Math.sin(a)) + '" r="2.4"/>';
    }
    return '<svg class="wl-mandala" viewBox="-200 -200 400 400" aria-hidden="true"><g fill="none" stroke="' + c + '" stroke-width="1.1">' + s +
      '<circle r="176"/><circle r="192"/></g><g fill="' + c + '">' + dots + '</g></svg>';
  }

  function marigoldFlower(x, y, r, a, b) {
    var s = '<g transform="translate(' + f1(x) + ',' + f1(y) + ')"><circle r="' + f1(r) + '" fill="' + a + '"/>';
    for (var i = 0; i < 10; i++) {
      var t = i * Math.PI / 5;
      s += '<circle cx="' + f1(Math.cos(t) * r * 0.78) + '" cy="' + f1(Math.sin(t) * r * 0.78) + '" r="' + f1(r * 0.36) + '" fill="' + a + '"/>';
    }
    return s + '<circle r="' + f1(r * 0.66) + '" fill="' + b + '"/><circle r="' + f1(r * 0.3) + '" fill="' + a + '" opacity=".9"/></g>';
  }
  function mangoLeaf(x, y, rot, len) {
    return '<g transform="translate(' + f1(x) + ',' + f1(y) + ') rotate(' + f1(rot) + ')"><path d="M0,0 C' + f1(len * .2) + ',' + f1(len * .25) + ' ' + f1(len * .22) + ',' + f1(len * .7) + ' 0,' + len +
      ' C' + f1(-len * .22) + ',' + f1(len * .7) + ' ' + f1(-len * .2) + ',' + f1(len * .25) + ' 0,0Z" fill="#2F7D3A"/><path d="M0,2 L0,' + (len - 3) + '" stroke="#9BC48A" stroke-width=".8"/></g>';
  }
  function toran() {
    var W = 400, s = '', R = rng(7), i, x;
    s += '<path d="M0,5 L400,5" stroke="#8A5A1F" stroke-width="2"/>';
    for (x = 6; x < W; x += 15) s += mangoLeaf(x, 5, (R() - .5) * 14, 26 + R() * 8);
    var swags = 4, sw = W / swags;
    for (i = 0; i < swags; i++) {
      var x0 = i * sw, x1 = x0 + sw, xm = (x0 + x1) / 2, sag = 50;
      for (var k = 0; k <= 11; k++) {
        var t = k / 11, mt = 1 - t;
        var px = mt * mt * x0 + 2 * mt * t * xm + t * t * x1;
        var py = mt * mt * 30 + 2 * mt * t * (30 + sag * 2) + t * t * 30;
        s += marigoldFlower(px, py, 8.4, k % 2 ? '#F7B500' : '#F07B0A', k % 2 ? '#FFD84D' : '#FFA531');
      }
    }
    for (i = 0; i <= swags; i++) {
      x = i * sw; if (x === 0) x = 8; if (x === W) x = W - 8;
      for (var j = 0; j < 6; j++) s += marigoldFlower(x, 34 + j * 13, 7, j % 2 ? '#F07B0A' : '#F7B500', j % 2 ? '#FFA531' : '#FFD84D');
      s += mangoLeaf(x, 108, 0, 18);
    }
    return '<svg class="wl-toran" viewBox="0 0 400 136" preserveAspectRatio="xMidYMin meet" aria-hidden="true">' + s + '</svg>';
  }

  function jasmine(len, seed, flip) {
    var R = rng(seed), s = '', path = 'M20,0', y;
    for (y = 0; y <= len; y += 8) path += ' L' + f1(20 + Math.sin(y / 38) * 5) + ',' + y;
    s += '<path d="' + path + '" fill="none" stroke="#6E9C78" stroke-width="1"/>';
    for (y = 10; y <= len; y += 12) {
      var cx = 20 + Math.sin(y / 38) * 5, rot = R() * 72;
      if (R() < .2) {
        s += '<ellipse cx="' + f1(cx + (R() < .5 ? -5 : 5)) + '" cy="' + y + '" rx="2.2" ry="4.6" fill="#FFFFFF" stroke="#CFE0D3" stroke-width=".8" transform="rotate(' + f1((R() - .5) * 60) + ' ' + f1(cx) + ' ' + y + ')"/>';
        continue;
      }
      s += '<g transform="translate(' + f1(cx) + ',' + y + ') rotate(' + f1(rot) + ')">';
      for (var p = 0; p < 5; p++) s += '<ellipse cx="0" cy="-5.2" rx="3.6" ry="5.8" fill="#FFFFFF" stroke="#C6D9CB" stroke-width=".8" transform="rotate(' + (p * 72) + ')"/>';
      s += '<circle r="2" fill="#E2C95E"/></g>';
      if (R() < .35) s += '<path d="M' + f1(cx) + ',' + y + ' q' + (R() < .5 ? -9 : 9) + ',4 ' + (R() < .5 ? -12 : 12) + ',12" fill="none" stroke="#7FAF88" stroke-width="2.2" stroke-linecap="round"/>';
    }
    return '<svg class="wl-jasmine' + (flip ? ' r' : ' l') + '" viewBox="0 0 40 ' + (len + 8) + '" aria-hidden="true">' + s + '</svg>';
  }

  function lotus(cls) {
    function petal(rot, len, wd, fill) {
      return '<path transform="rotate(' + rot + ')" d="M0,0 C' + wd + ',' + f1(-len * .3) + ' ' + f1(wd * .6) + ',' + f1(-len * .86) + ' 0,' + (-len) +
        ' C' + f1(-wd * .6) + ',' + f1(-len * .86) + ' ' + (-wd) + ',' + f1(-len * .3) + ' 0,0Z" fill="' + fill + '"/>';
    }
    var s = '<defs><linearGradient id="wlLg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#F3B3C1"/><stop offset="1" stop-color="#FDE8EC"/></linearGradient></defs>';
    s += '<g stroke="#B5546B" stroke-width="1.2" transform="translate(0,-6)">';
    [[-74, 52, 18], [74, 52, 18], [-50, 70, 20], [50, 70, 20], [-24, 86, 21], [24, 86, 21], [0, 96, 22]].forEach(function (p) { s += petal(p[0], p[1], p[2], 'url(#wlLg)'); });
    s += '</g><path d="M-112,0 Q-56,-10 0,0 T112,0" fill="none" stroke="#B5546B" stroke-width="1.2"/><path d="M-84,9 Q-42,1 0,9 T84,9" fill="none" stroke="#D88A9C" stroke-width="1"/>';
    return '<svg class="' + (cls || 'wl-lotus') + '" viewBox="-120 -110 240 124" aria-hidden="true">' + s + '</svg>';
  }

  function night(seed) {
    var R = rng(seed), s = '';
    for (var i = 0; i < 70; i++) {
      s += '<circle class="' + (i % 5 === 0 ? 'tw' : '') + '" style="animation-delay:' + f1(R() * 4) + 's" cx="' + f1(R() * 400) + '" cy="' + f1(R() * 640) + '" r="' + f1(.5 + R() * 1.3) + '"/>';
    }
    return '<svg class="wl-stars" viewBox="0 0 400 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="#F6E7B8">' + s + '</g></svg>';
  }
  function diyas() {
    function diya(x, drop) {
      return '<g transform="translate(' + x + ',0)"><path d="M0,0 L0,' + drop + '" stroke="#C9A65A" stroke-width=".8"/>' +
        '<g transform="translate(0,' + drop + ')"><path d="M-12,2 L-8,2 L-6,-2 L6,-2 L8,2 L12,2 Q8,8 0,9 Q-8,8 -12,2Z" fill="#C98B2C"/>' +
        '<path d="M-14,2 Q0,12 14,2" fill="none" stroke="#E8C77A" stroke-width="1"/>' +
        '<circle cy="-8" r="9" fill="url(#wlGlow)"/><path d="M0,-15 C3,-10 3,-6 0,-3 C-3,-6 -3,-10 0,-15Z" fill="#FFD36B"/></g></g>';
    }
    return '<svg class="wl-diyas" viewBox="0 0 400 130" preserveAspectRatio="xMidYMin meet" aria-hidden="true"><defs><radialGradient id="wlGlow"><stop offset="0" stop-color="#FFE7A3" stop-opacity=".9"/><stop offset="1" stop-color="#FFB547" stop-opacity="0"/></radialGradient></defs>' +
      diya(48, 64) + diya(120, 100) + diya(280, 100) + diya(352, 64) + '</svg>';
  }
  function moon() {
    return '<svg class="wl-moon" viewBox="0 0 60 60" aria-hidden="true"><path d="M38,4 A27,27 0 1,0 56,40 A22,22 0 1,1 38,4Z" fill="#F6E7B8"/></svg>';
  }
  function lamp() {
    var flames = '';
    [18, 29, 40, 51, 62].forEach(function (x, i) {
      var y = i === 2 ? 34 : 38;
      flames += '<circle cx="' + x + '" cy="' + (y - 4) + '" r="6" fill="url(#wlLampGlow)"/><path d="M' + x + ',' + (y - 11) + ' C' + (x + 3) + ',' + (y - 6) + ' ' + (x + 3) + ',' + (y - 2) + ' ' + x + ',' + y + ' C' + (x - 3) + ',' + (y - 2) + ' ' + (x - 3) + ',' + (y - 6) + ' ' + x + ',' + (y - 11) + 'Z" fill="#F9B233"/>';
    });
    return '<svg class="wl-lamp" viewBox="0 0 80 150" aria-hidden="true"><defs><linearGradient id="wlBrass" x1="0" x2="1"><stop offset="0" stop-color="#9C7A22"/><stop offset=".5" stop-color="#E9C766"/><stop offset="1" stop-color="#9C7A22"/></linearGradient><radialGradient id="wlLampGlow"><stop offset="0" stop-color="#FFE6A0" stop-opacity=".95"/><stop offset="1" stop-color="#FFC24D" stop-opacity="0"/></radialGradient></defs>' +
      flames +
      '<g fill="url(#wlBrass)"><path d="M10,40 Q40,56 70,40 L66,46 Q40,60 14,46Z"/><rect x="36" y="18" width="8" height="22" rx="2"/><path d="M34,18 Q40,6 46,18Z"/><circle cx="40" cy="7" r="3"/>' +
      '<rect x="37" y="54" width="6" height="58" rx="2"/><ellipse cx="40" cy="70" rx="7" ry="3"/><ellipse cx="40" cy="88" rx="8" ry="3.4"/><ellipse cx="40" cy="104" rx="9" ry="3.6"/>' +
      '<path d="M24,140 Q26,118 40,112 Q54,118 56,140Z"/><ellipse cx="40" cy="141" rx="24" ry="5"/></g></svg>';
  }
  function kasavuBand() {
    return '<svg class="wl-band" width="100%" height="26" aria-hidden="true"><defs><pattern id="wlKb" width="16" height="26" patternUnits="userSpaceOnUse">' +
      '<rect width="16" height="4" fill="#C9A227"/><rect y="6" width="16" height="1" fill="#C9A227"/><path d="M0,22 L8,10 L16,22Z" fill="#C9A227"/><circle cx="8" cy="17" r="1.6" fill="#FBF7EC"/><rect y="23" width="16" height="2" fill="#C9A227"/></pattern></defs>' +
      '<rect width="100%" height="26" fill="url(#wlKb)"/></svg>';
  }

  function divider(theme) {
    var c = {
      kasavu: '#B8901F', sindoor: '#E3B85C', marigold: '#E0700A', nilavu: '#E8C77A', mullappoo: '#5D8B69', thamara: '#B5546B'
    }[theme] || '#999';
    return '<svg class="wl-div" viewBox="0 0 200 20" aria-hidden="true"><path d="M10,10 H82 M118,10 H190" stroke="' + c + '" stroke-width="1"/>' +
      '<g fill="' + c + '" transform="translate(100,10)"><path d="M0,-8 L4,0 L0,8 L-4,0Z"/><circle cx="-11" r="2"/><circle cx="11" r="2"/><circle cx="-18" r="1.2"/><circle cx="18" r="1.2"/></g></svg>';
  }

  function heroDecor(theme) {
    switch (theme) {
      case 'kasavu': return '<div class="wl-hd-top">' + kasavuBand() + '</div>' + lamp();
      case 'sindoor': return mandala('#E3B85C');
      case 'marigold': return toran();
      case 'nilavu': return night(11) + moon() + diyas();
      case 'mullappoo': return jasmine(380, 3, false) + jasmine(300, 9, true);
      case 'thamara': return lotus('wl-lotus wl-lotus-top');
    }
    return '';
  }

  /* ---------------- render ---------------- */

  function normalize(d) {
    d = d || {};
    var plan = LIMITS[d.plan] ? d.plan : 'premium';
    var lim = LIMITS[plan];
    var evs = (d.events || []).filter(function (e) { return e && (e.date || e.name || e.venue); });
    evs = evs.slice(0, lim.events).sort(function (a, b) { return ((a.date || '9') + (a.time || '')).localeCompare((b.date || '9') + (b.time || '')); });
    return {
      theme: FONTS[d.theme] ? d.theme : 'kasavu', plan: plan, lim: lim,
      p1: (d.p1 || '').trim() || 'Arjun', p2: (d.p2 || '').trim() || 'Meera',
      p1f: (d.p1_family || '').trim(), p2f: (d.p2_family || '').trim(),
      intro: (d.intro || '').trim() || 'Together with their families',
      line: (d.line || '').trim() || 'invite you to celebrate their wedding',
      message: (d.message || '').trim(),
      closing: (d.closing || '').trim() || 'Your presence is the blessing we look forward to.',
      events: evs,
      main: evs.filter(function (e) { return e.date && /wedding|marriage|muhurt|kalyan|vivah|nikah|thali|minnu|matrimony|shaadi/i.test(e.name || ''); })[0] || evs.filter(function (e) { return e.date; })[0],
      photos: (d.photos || []).slice(0, lim.photos),
      music: lim.music ? (d.music || '') : '',
      contactName: (d.contact_name || '').trim(), contactPhone: (d.contact_phone || '').replace(/[^\d+]/g, ''),
      slug: d.slug || '', brand: d.brand || 'WedLink'
    };
  }

  function eventsHtml(v, title) {
    if (!v.events.length) return '';
    var cards = v.events.map(function (ev) {
      var map = mapLink(ev);
      return '<article class="wl-ev">' +
        '<h3>' + esc(ev.name || 'Wedding') + '</h3>' +
        (ev.date ? '<p class="wl-ev-when">' + esc(longDate(ev.date)) + (ev.time ? '<br>' + esc(time12(ev.time)) : '') + '</p>' : '') +
        (ev.venue ? '<p class="wl-ev-venue">' + esc(ev.venue) + '</p>' : '') +
        (ev.address ? '<p class="wl-ev-addr">' + nl2br(ev.address) + '</p>' : '') +
        '<div class="wl-ev-acts">' + (map ? '<a class="wl-btn" href="' + esc(map) + '" target="_blank" rel="noopener">Directions</a>' : '') +
        (ev.date ? '<a class="wl-btn ghost" href="' + esc(calLink(ev, title)) + '" target="_blank" rel="noopener">Add to calendar</a>' : '') + '</div>' +
        '</article>';
    }).join('');
    return '<section class="wl-sec wl-events" data-sec="events"><h2>' + (v.events.length > 1 ? 'Celebrations' : 'The celebration') + '</h2>' + divider(v.theme) + cards + '</section>';
  }

  function rsvpHtml(v, mode) {
    if (!v.lim.rsvp) return '';
    var opts = '';
    for (var i = 1; i <= 10; i++) opts += '<option>' + i + '</option>';
    return '<section class="wl-sec wl-rsvp" data-sec="rsvp"><h2>Will you join us?</h2>' + divider(v.theme) +
      '<form class="wl-form" novalidate>' +
      '<label>Your name<input name="name" required maxlength="80" autocomplete="name"></label>' +
      '<label>Phone (optional)<input name="phone" inputmode="tel" maxlength="15" autocomplete="tel"></label>' +
      '<fieldset><legend>Attending</legend><label class="wl-radio"><input type="radio" name="attending" value="1" checked> Yes, with joy</label>' +
      '<label class="wl-radio"><input type="radio" name="attending" value="0"> Sorry, can\'t make it</label></fieldset>' +
      '<label class="wl-guests">Number of guests<select name="guests">' + opts + '</select></label>' +
      '<label>A note for the couple (optional)<textarea name="message" rows="3" maxlength="400"></textarea></label>' +
      '<button class="wl-btn solid" type="submit">Send RSVP</button><p class="wl-form-msg" role="status"></p></form></section>';
  }

  function render(root, data, opts) {
    opts = opts || {};
    var mode = opts.mode || 'live';
    var v = normalize(data);
    loadFont(FONTS[v.theme]);
    loadFont(SCRIPT_FONTS);
    if (root._wlTimer) { clearInterval(root._wlTimer); root._wlTimer = null; }

    var title = v.p1 + ' & ' + v.p2;
    var first = v.main;
    var photos = v.photos;
    var showCover = opts.cover && mode !== 'editor';

    var html = '<div class="wl" data-theme="' + v.theme + '" data-plan="' + v.plan + '" data-mode="' + mode + '">';

    if (showCover) {
      html += '<div class="wl-cover" role="dialog" aria-label="Invitation"><div class="wl-door l"></div><div class="wl-door r"></div>' +
        '<div class="wl-cover-in"><p class="wl-cover-k">Wedding invitation</p>' +
        '<div class="wl-mono"><span>' + esc(initial(v.p1)) + '</span><i>&amp;</i><span>' + esc(initial(v.p2)) + '</span></div>' +
        '<p class="wl-cover-n">' + esc(title) + '</p>' +
        (first && first.date ? '<p class="wl-cover-d">' + esc(longDate(first.date)) + '</p>' : '') +
        '<button type="button" class="wl-open">Open invitation</button></div></div>';
    }

    html += '<main class="wl-body">';
    html += '<header class="wl-hero" data-sec="hero"><div class="wl-hd">' + heroDecor(v.theme) + '</div><div class="wl-hero-in">' +
      '<p class="wl-intro">' + esc(v.intro) + '</p>' +
      '<h1 class="wl-names"><span>' + esc(v.p1) + '</span><span class="wl-amp">&amp;</span><span>' + esc(v.p2) + '</span></h1>' +
      '<p class="wl-line">' + esc(v.line) + '</p>';
    if (first && first.date) {
      var p = parts(first.date);
      html += '<div class="wl-date"><span class="wl-date-a">' + DAYS[p.wd] + '</span><span class="wl-date-d">' + p.d + '</span><span class="wl-date-a">' + MONTHS[p.mo] + ' ' + p.y + '</span></div>';
      if (first.time) html += '<p class="wl-time">' + esc(time12(first.time)) + '</p>';
      if (first.venue) html += '<p class="wl-venue">' + esc(first.venue) + '</p>';
    }
    html += '</div></header>';

    if (first && startOf(first)) {
      html += '<section class="wl-sec wl-count" data-sec="count" aria-label="Countdown"><div class="wl-cd">' +
        ['Days', 'Hours', 'Minutes', 'Seconds'].map(function (l) { return '<div><b>0</b><span>' + l + '</span></div>'; }).join('') +
        '</div><p class="wl-cd-done" hidden>Just married. Thank you for the blessings.</p></section>';
    }

    if (photos[0]) html += '<figure class="wl-cover-photo" data-sec="photos"><img src="' + esc(photos[0]) + '" alt="' + esc(title) + '" loading="lazy"></figure>';

    if (v.p1f || v.p2f) {
      html += '<section class="wl-sec wl-fam" data-sec="family"><div class="wl-fam-grid">' +
        '<div><h3>' + esc(v.p1) + '</h3>' + (v.p1f ? '<p>' + nl2br(v.p1f) + '</p>' : '') + '</div>' +
        '<div class="wl-fam-amp" aria-hidden="true">&amp;</div>' +
        '<div><h3>' + esc(v.p2) + '</h3>' + (v.p2f ? '<p>' + nl2br(v.p2f) + '</p>' : '') + '</div></div></section>';
    }

    if (v.message) html += '<section class="wl-sec wl-msg" data-sec="message">' + divider(v.theme) + '<p>' + nl2br(v.message) + '</p></section>';

    html += eventsHtml(v, title);

    if (photos.length > 1) {
      html += '<section class="wl-sec wl-gal" data-sec="gallery"><h2>Moments</h2>' + divider(v.theme) + '<div class="wl-grid">' +
        photos.slice(1).map(function (src, i) { return '<button type="button" class="wl-ph" data-i="' + (i + 1) + '"><img src="' + esc(src) + '" alt="Photo ' + (i + 2) + '" loading="lazy"></button>'; }).join('') +
        '</div></section>';
    }

    html += rsvpHtml(v, mode);

    if (v.contactName || v.contactPhone) {
      var tel = v.contactPhone.replace(/^\+?91/, '');
      html += '<section class="wl-sec wl-contact" data-sec="contact"><p>For directions or anything else, call ' + esc(v.contactName || 'us') + '</p>' +
        (tel ? '<div class="wl-ev-acts"><a class="wl-btn" href="tel:+91' + esc(tel) + '">Call</a><a class="wl-btn ghost" href="https://wa.me/91' + esc(tel) + '" target="_blank" rel="noopener">WhatsApp</a></div>' : '') + '</section>';
    }

    html += '<footer class="wl-end"><p class="wl-closing">' + esc(v.closing) + '</p><p class="wl-sign">' + esc(title) + '</p>' + divider(v.theme) +
      (v.lim.badge ? '<a class="wl-badge" href="/?ref=badge" target="_blank" rel="noopener">Made with ' + esc(v.brand) + '. Make yours</a>' : '') + '</footer>';
    html += '</main>';

    if (v.music) html += '<button type="button" class="wl-music" aria-label="Play music" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l12-2v13" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="18" r="3" fill="currentColor"/><circle cx="18" cy="16" r="3" fill="currentColor"/></svg></button><audio class="wl-audio" src="' + esc(v.music) + '" loop preload="none"></audio>';
    if (mode === 'preview') html += '<div class="wl-wm" aria-hidden="true"></div>';
    html += '<div class="wl-lb" hidden><button type="button" class="wl-lb-x" aria-label="Close">&times;</button><img alt=""></div>';
    html += '</div>';

    var keep = opts.keepScroll ? (root.ownerDocument.scrollingElement || doc.documentElement).scrollTop : 0;
    root.innerHTML = html;
    if (opts.keepScroll) (root.ownerDocument.scrollingElement || doc.documentElement).scrollTop = keep;
    wire(root, v, mode, opts);
  }

  function wire(root, v, mode, opts) {
    var el = root.querySelector('.wl');
    var audio = root.querySelector('.wl-audio');
    var mbtn = root.querySelector('.wl-music');
    function setPlaying(on) {
      if (!audio) return;
      if (on) { audio.play().then(function () { mbtn.classList.add('on'); mbtn.setAttribute('aria-pressed', 'true'); }).catch(function () {}); }
      else { audio.pause(); mbtn.classList.remove('on'); mbtn.setAttribute('aria-pressed', 'false'); }
    }
    if (mbtn) mbtn.addEventListener('click', function () { setPlaying(audio.paused); });

    var cover = root.querySelector('.wl-cover');
    if (!cover && mode !== 'editor') el.classList.add('revealed');
    if (cover) {
      el.classList.add('is-closed');
      var open = function () {
        if (cover.classList.contains('open')) return;
        cover.classList.add('open');
        el.classList.remove('is-closed');
        el.classList.add('revealed');
        if (mode === 'live') setPlaying(true);
        setTimeout(function () { cover.remove(); }, 1400);
      };
      cover.querySelector('.wl-open').addEventListener('click', open);
      if (opts.autoOpen) setTimeout(open, opts.autoOpen);
    }

    // countdown
    var cd = root.querySelector('.wl-cd');
    if (cd && v.main) {
      var target = startOf(v.main).getTime();
      var b = cd.querySelectorAll('b');
      var tick = function () {
        var diff = target - Date.now();
        if (diff <= 0) {
          cd.hidden = true; root.querySelector('.wl-cd-done').hidden = false;
          clearInterval(root._wlTimer); return;
        }
        var s = Math.floor(diff / 1000);
        b[0].textContent = Math.floor(s / 86400);
        b[1].textContent = String(Math.floor(s % 86400 / 3600)).padStart(2, '0');
        b[2].textContent = String(Math.floor(s % 3600 / 60)).padStart(2, '0');
        b[3].textContent = String(s % 60).padStart(2, '0');
      };
      tick();
      root._wlTimer = setInterval(tick, 1000);
    }

    // lightbox
    var lb = root.querySelector('.wl-lb');
    root.querySelectorAll('.wl-ph').forEach(function (btn) {
      btn.addEventListener('click', function () {
        lb.querySelector('img').src = v.photos[+btn.dataset.i];
        lb.hidden = false;
      });
    });
    lb.addEventListener('click', function () { lb.hidden = true; });

    // RSVP
    var form = root.querySelector('.wl-form');
    if (form) {
      var msg = form.querySelector('.wl-form-msg');
      var guests = form.querySelector('.wl-guests');
      form.addEventListener('change', function () {
        guests.hidden = form.querySelector('input[name=attending]:checked').value === '0';
      });
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        if (mode !== 'live') { msg.textContent = 'RSVPs start working once your invite is published.'; return; }
        var fd = new FormData(form);
        var name = String(fd.get('name') || '').trim();
        if (!name) { msg.textContent = 'Add your name so the couple knows who replied.'; form.name.focus(); return; }
        var btn = form.querySelector('button[type=submit]');
        btn.disabled = true; msg.textContent = 'Sending…';
        fetch('/api.php?a=rsvp', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: v.slug, name: name, phone: fd.get('phone'), attending: fd.get('attending'), guests: fd.get('guests'), message: fd.get('message') })
        }).then(function (r) { return r.json(); }).then(function (j) {
          if (j.ok) { form.innerHTML = '<p class="wl-thanks">Thank you, ' + esc(name) + '. Your reply has reached ' + esc(v.p1) + ' &amp; ' + esc(v.p2) + '.</p>'; }
          else { btn.disabled = false; msg.textContent = j.error || 'Could not send. Try again.'; }
        }).catch(function () { btn.disabled = false; msg.textContent = 'No connection. Check your internet and try again.'; });
      });
    }
  }

  w.WL = { render: render, longDate: longDate, time12: time12, LIMITS: LIMITS };
})(window, document);
