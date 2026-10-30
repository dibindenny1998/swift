/* WedLink invite renderer. One renderer powers the live invite, the owner preview,
   the live editor preview and the landing-page demo. */
(function (w, doc) {
  'use strict';

  var FONTS = {
    champagne: 'family=Bodoni+Moda:ital,wght@0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500',
    kasavu: 'family=Great+Vibes&family=Marcellus',
    noor: 'family=Cormorant+Upright:wght@500;600&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Amiri:wght@400;700',
    chapel: 'family=Allura&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500',
    sindoor: 'family=Rozha+One&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500',
    kesar: 'family=Yeseva+One&family=Mukta:wght@400;500;600&family=Noto+Serif+Gurmukhi:wght@600',
    gopuram: 'family=Cinzel+Decorative:wght@400;700&family=Marcellus',
    velvet: 'family=Limelight&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500',
    qamar: 'family=Italianno&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Amiri:wght@400;700',
    grace: 'family=Alex+Brush&family=EB+Garamond:ital,wght@0,400;0,500;1,400',
    marigold: 'family=Yatra+One&family=Mukta:wght@400;500;600',
    nilavu: 'family=Pinyon+Script&family=Cinzel:wght@400;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400',
    mullappoo: 'family=Italiana&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500',
    thamara: 'family=Parisienne&family=Lora:ital,wght@0,400;0,500;1,400',
    mayil: 'family=Rouge+Script&family=EB+Garamond:ital,wght@0,400;0,500;1,400',
    jaipur: 'family=Gloock&family=Lora:ital,wght@0,400;0,500;1,400',
    gulmohar: 'family=Tangerine:wght@700&family=Lora:ital,wght@0,400;0,500;1,400'
  };
  // Opening lines that suit each design when the couple leaves them empty.
  var DEFAULTS = {
    noor: { intro: 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', line: 'request the honour of your presence at their Nikah' },
    qamar: { intro: 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', line: 'invite you to celebrate their Nikah' },
    chapel: { intro: 'With joy and the blessings of God', line: 'invite you to celebrate their Holy Matrimony' },
    grace: { intro: 'By the grace of God, two become one', line: 'invite you to witness their Holy Matrimony' },
    kesar: { intro: 'With the blessings of Waheguru', line: 'request your presence at their Anand Karaj' },
    gopuram: { intro: '|| Shree Ganeshaya Namah ||', line: 'invite you to grace their auspicious wedding' },
    sindoor: { intro: '|| Shubh Vivah ||', line: 'invite you to celebrate their wedding' },
    jaipur: { intro: '|| Shubh Vivah ||', line: 'request the pleasure of your company at their wedding' }
  };
  // Indian scripts: Google serves these with unicode-range, so they only download when the text uses them.
  var SCRIPT_FONTS = 'family=Noto+Serif+Malayalam:wght@400;600&family=Noto+Serif+Devanagari:wght@400;600&family=Noto+Serif+Kannada:wght@400;600&family=Noto+Serif+Tamil:wght@400;600&family=Noto+Serif+Telugu:wght@400;600&family=Noto+Serif+Gurmukhi:wght@400;600&family=Amiri:wght@400;700';

  var LIMITS = {
    standard: { events: 3, photos: 1, rsvp: false, music: false, badge: true },
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
      '<rect width="16" height="4" fill="url(#wlFoil)"/><rect y="6" width="16" height="1" fill="url(#wlFoil)"/><path d="M0,22 L8,10 L16,22Z" fill="url(#wlFoil)"/><circle cx="8" cy="17" r="1.6" fill="#FBF7EC"/><rect y="23" width="16" height="2" fill="url(#wlFoil)"/></pattern></defs>' +
      '<rect width="100%" height="26" fill="url(#wlKb)"/></svg>';
  }

  function divider(theme) {
    var c = theme === 'marigold' ? '#E0700A' : theme === 'mullappoo' ? '#5D8B69' : theme === 'thamara' ? '#B5546B' : foil(theme);
    return '<svg class="wl-div" viewBox="0 0 200 20" aria-hidden="true"><rect x="10" y="9.5" width="72" height="1" fill="' + c + '"/><rect x="118" y="9.5" width="72" height="1" fill="' + c + '"/>' +
      '<g fill="' + c + '" transform="translate(100,10)"><path d="M0,-8 L4,0 L0,8 L-4,0Z"/><circle cx="-11" r="2"/><circle cx="11" r="2"/><circle cx="-18" r="1.2"/><circle cx="18" r="1.2"/></g></svg>';
  }

  /* ---------- foil + new ornaments ---------- */
  var DEFS = '<svg class="wl-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>' +
    '<linearGradient id="wlFoil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9A7425"/><stop offset=".28" stop-color="#F4DE95"/><stop offset=".5" stop-color="#B8902F"/><stop offset=".74" stop-color="#FFF0C2"/><stop offset="1" stop-color="#A07A22"/></linearGradient>' +
    '<linearGradient id="wlFoilD" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6E5212"/><stop offset=".3" stop-color="#C9A44A"/><stop offset=".52" stop-color="#84651A"/><stop offset=".76" stop-color="#DDBB66"/><stop offset="1" stop-color="#6E5212"/></linearGradient>' +
    '<linearGradient id="wlSilver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5F7184"/><stop offset=".3" stop-color="#C9D3DD"/><stop offset=".55" stop-color="#7C8C9C"/><stop offset=".78" stop-color="#E6ECF1"/><stop offset="1" stop-color="#5F7184"/></linearGradient>' +
    '<radialGradient id="wlBokeh"><stop offset="0" stop-color="#FFF3CF" stop-opacity=".95"/><stop offset=".6" stop-color="#E9C978" stop-opacity=".55"/><stop offset="1" stop-color="#C9A24A" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="wlLampIn"><stop offset="0" stop-color="#FFF4C4"/><stop offset=".7" stop-color="#FFC75A"/><stop offset="1" stop-color="#E08A1E"/></radialGradient>' +
    '</defs></svg>';

  var LIGHT = { kasavu: 1, champagne: 1, chapel: 1, jaipur: 1, gulmohar: 1, grace: 1, mullappoo: 1, thamara: 1, marigold: 1 };
  function foil(theme) { return theme === 'grace' ? 'url(#wlSilver)' : (LIGHT[theme] ? 'url(#wlFoilD)' : 'url(#wlFoil)'); }

  function bokeh(seed, n, w, h) {
    var R = rng(seed), s = '';
    for (var i = 0; i < n; i++) {
      var r = 2 + R() * (i % 6 === 0 ? 16 : 6);
      s += '<circle cx="' + f1(R() * w) + '" cy="' + f1(R() * h) + '" r="' + f1(r) + '" fill="url(#wlBokeh)" opacity="' + f1(.35 + R() * .6) + '"/>';
    }
    return '<svg class="wl-bokeh" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + s + '</svg>';
  }
  function cornerFrame(fill) {
    var c = '<path d="M0,26 L0,0 L26,0" fill="none" stroke="' + fill + '" stroke-width="1.6"/><path d="M8,30 L8,8 L30,8" fill="none" stroke="' + fill + '" stroke-width=".8"/><rect x="-3" y="-3" width="6" height="6" transform="rotate(45)" fill="' + fill + '"/>';
    return '<div class="wl-frame"><svg class="tl" viewBox="-4 -4 40 40">' + c + '</svg><svg class="tr" viewBox="-4 -4 40 40">' + c + '</svg><svg class="bl" viewBox="-4 -4 40 40">' + c + '</svg><svg class="br" viewBox="-4 -4 40 40">' + c + '</svg></div>';
  }
  function star8(cx, cy, r, extra) {
    var a = '', b = '';
    for (var i = 0; i < 4; i++) {
      var t = i * Math.PI / 2, u = t + Math.PI / 4;
      a += (i ? 'L' : 'M') + f1(cx + r * Math.cos(t)) + ',' + f1(cy + r * Math.sin(t));
      b += (i ? 'L' : 'M') + f1(cx + r * Math.cos(u)) + ',' + f1(cy + r * Math.sin(u));
    }
    return '<path d="' + a + 'Z' + b + 'Z" ' + (extra || '') + '/>';
  }
  function starBand(fill) {
    var s = '';
    for (var x = 12; x < 400; x += 24) s += star8(x, 12, 9, '');
    return '<svg class="wl-band" viewBox="0 0 400 24" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="' + fill + '" stroke-width="1">' + s + '</g><rect y="0" width="400" height=".8" fill="' + fill + '"/><rect y="23.2" width="400" height=".8" fill="' + fill + '"/></svg>';
  }
  function mihrab(fill) {
    var arch = function (o) { return 'M' + (20 + o) + ',600 L' + (20 + o) + ',200 C' + (20 + o) + ',' + (120 + o) + ' ' + (110 + o * .5) + ',' + (78 + o) + ' 180,' + (26 + o * 1.4) + ' C' + (250 - o * .5) + ',' + (78 + o) + ' ' + (340 - o) + ',' + (120 + o) + ' ' + (340 - o) + ',200 L' + (340 - o) + ',600'; };
    return '<svg class="wl-mihrab" viewBox="0 0 360 600" preserveAspectRatio="xMidYMin meet" aria-hidden="true"><g fill="none" stroke="' + fill + '"><path d="' + arch(0) + '" stroke-width="1.6"/><path d="' + arch(9) + '" stroke-width=".8"/></g>' +
      '<g fill="' + fill + '" transform="translate(180,0)"><path d="M-6,4 A12,12 0 1,0 6,22 A9.5,9.5 0 1,1 -6,4Z"/>' + star8(7, 10, 3.6, '') + '</g></svg>';
  }
  function lantern(x, drop, sc) {
    return '<g transform="translate(' + x + ',0)"><rect x="-.4" width=".8" height="' + drop + '" fill="#C9A65A"/><g transform="translate(0,' + drop + ') scale(' + sc + ')">' +
      '<circle cx="0" cy="2" r="2.4" fill="none" stroke="url(#wlFoil)" stroke-width="1.2"/><path d="M-7,10 Q0,0 7,10Z" fill="url(#wlFoil)"/>' +
      '<path d="M-9,11 L9,11 L12,24 L9,40 L-9,40 L-12,24Z" fill="url(#wlFoil)"/>' +
      '<path d="M-5.5,14 L5.5,14 L7.5,24 L5.5,36 L-5.5,36 L-7.5,24Z" fill="url(#wlLampIn)"/><path d="M0,14 L0,36 M-7.5,24 L7.5,24" stroke="#B8902F" stroke-width=".8"/>' +
      '<path d="M-9,40 L9,40 L0,52Z" fill="url(#wlFoil)"/><circle cy="54" r="1.8" fill="url(#wlFoil)"/>' +
      '<circle cy="25" r="22" fill="url(#wlBokeh)" opacity=".5"/></g></g>';
  }
  function lanterns() {
    return '<svg class="wl-lanterns" viewBox="0 0 400 190" preserveAspectRatio="xMidYMin meet" aria-hidden="true">' +
      lantern(46, 40, 1) + lantern(108, 92, .8) + lantern(292, 92, .8) + lantern(354, 40, 1) + '</svg>';
  }
  function crossWindow() {
    var arch = 'M-62,110 L-62,-10 Q-62,-80 0,-118 Q62,-80 62,-10 L62,110Z';
    var panes = '<defs><linearGradient id="wlGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3B5BA9"/><stop offset=".35" stop-color="#8A4FA3"/><stop offset=".6" stop-color="#C9506E"/><stop offset="1" stop-color="#E7A93C"/></linearGradient><clipPath id="wlArchClip"><path d="' + arch + '"/></clipPath></defs>';
    var rays = '';
    for (var i = 0; i < 24; i++) { var a = i * 15; rays += '<rect x="-.5" y="-210" width="1" height="150" transform="rotate(' + a + ')" fill="#E9CF7A" opacity=".35"/>'; }
    return '<svg class="wl-window" viewBox="-140 -190 280 320" aria-hidden="true">' + panes + '<g opacity=".7">' + rays + '</g>' +
      '<path d="' + arch + '" fill="url(#wlGlass)" opacity=".38"/>' +
      '<g clip-path="url(#wlArchClip)" fill="url(#wlFoilD)"><rect x="-21.5" y="-130" width="1.6" height="250"/><rect x="20" y="-130" width="1.6" height="250"/><rect x="-70" y="30" width="140" height="1.6"/><rect x="-70" y="70" width="140" height="1.6"/></g>' +
      '<circle cy="-62" r="20" fill="none" stroke="url(#wlFoilD)" stroke-width="1.6"/>' +
      '<path d="' + arch + '" fill="none" stroke="url(#wlFoilD)" stroke-width="3"/><path d="M-70,118 L-70,-12 Q-70,-88 0,-128 Q70,-88 70,-12 L70,118" fill="none" stroke="url(#wlFoilD)" stroke-width="1"/>' +
      '<g fill="url(#wlFoil)"><rect x="-5" y="-30" width="10" height="92" rx="1.5"/><rect x="-26" y="-12" width="52" height="10" rx="1.5"/></g></svg>';
  }
  function wreath() {
    function branch(flip) {
      var s = '', pts = [];
      for (var i = 0; i <= 12; i++) {
        var t = (i / 12) * 2.5 + .35, r = 78;
        pts.push([f1(Math.cos(Math.PI / 2 + t * (flip ? -1 : 1)) * r), f1(Math.sin(Math.PI / 2 + t * (flip ? -1 : 1)) * r)]);
      }
      s += '<path d="M' + pts.map(function (p) { return p.join(','); }).join(' L') + '" fill="none" stroke="url(#wlSilver)" stroke-width="1.6"/>';
      pts.forEach(function (p, i) {
        if (i === 0) return;
        var ang = Math.atan2(p[1], p[0]) * 180 / Math.PI;
        s += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="9" ry="3.6" transform="rotate(' + f1(ang + (flip ? -55 : 55)) + ' ' + p[0] + ' ' + p[1] + ') translate(8,0)" fill="url(#wlSilver)"/>';
        s += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="8" ry="3.2" transform="rotate(' + f1(ang + (flip ? 55 : -55) + 180) + ' ' + p[0] + ' ' + p[1] + ') translate(8,0)" fill="url(#wlSilver)" opacity=".85"/>';
      });
      return s;
    }
    return '<svg class="wl-wreath" viewBox="-100 -100 200 200" aria-hidden="true">' + branch(false) + branch(true) +
      '<g fill="none" stroke-width="3.2"><circle cx="-10" cy="0" r="17" stroke="url(#wlFoilD)"/><circle cx="10" cy="0" r="17" stroke="url(#wlSilver)"/></g></svg>';
  }
  function phulkari(seed) {
    var s = '', cols = ['#F4A21C', '#E0457B', '#F7D27A', '#F07A1F'];
    for (var x = 0; x < 420; x += 20) {
      var c = cols[(x / 20) % 4];
      s += '<rect x="' + (x - 7) + '" y="5" width="14" height="14" transform="rotate(45 ' + x + ' 12)" fill="' + c + '"/>' +
        '<rect x="' + (x - 3) + '" y="9" width="6" height="6" transform="rotate(45 ' + x + ' 12)" fill="#1E3A8A"/>' +
        '<rect x="' + (x + 7) + '" y="10.5" width="3" height="3" transform="rotate(45 ' + (x + 10) + ' 12)" fill="#F7D27A"/>';
    }
    return '<svg class="wl-band" viewBox="0 0 400 24" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + s + '</svg>';
  }
  function onkar() {
    return '<div class="wl-onkar" aria-hidden="true"><svg viewBox="-50 -50 100 100"><circle r="46" fill="none" stroke="url(#wlFoil)" stroke-width="1.5"/><circle r="40" fill="none" stroke="url(#wlFoil)" stroke-width=".7"/></svg><span>ੴ</span></div>';
  }
  function gopuramSvg() {
    var s = '', w = 150, y = 210, tiers = 7;
    s += '<rect x="' + (-w / 2 - 10) + '" y="' + y + '" width="' + (w + 20) + '" height="10" fill="url(#wlFoil)"/>';
    for (var i = 0; i < tiers; i++) {
      var tw = w - i * 15, th = 20;
      y -= th;
      s += '<path d="M' + (-tw / 2) + ',' + (y + th) + ' L' + (-tw / 2 + 4) + ',' + y + ' L' + (tw / 2 - 4) + ',' + y + ' L' + (tw / 2) + ',' + (y + th) + 'Z" fill="url(#wlFoil)" opacity="' + (1 - i * .03) + '"/>';
      s += '<rect x="' + (-tw / 2 - 3) + '" y="' + (y - 2.5) + '" width="' + (tw + 6) + '" height="3" fill="url(#wlFoil)"/>';
      for (var k = -tw / 2 + 10; k < tw / 2 - 6; k += 12) s += '<rect x="' + f1(k) + '" y="' + (y + 5) + '" width="5" height="10" rx="2.5" fill="#5A0F1C" opacity=".55"/>';
    }
    y -= 20;
    s += '<path d="M-36,' + (y + 20) + ' Q-36,' + (y - 6) + ' 0,' + (y - 8) + ' Q36,' + (y - 6) + ' 36,' + (y + 20) + 'Z" fill="url(#wlFoil)"/>';
    [-24, -12, 0, 12, 24].forEach(function (x) {
      s += '<path d="M' + (x - 3.5) + ',' + (y - 6) + ' Q' + x + ',' + (y - 16) + ' ' + (x + 3.5) + ',' + (y - 6) + 'Z" fill="url(#wlFoil)"/><rect x="' + (x - .6) + '" y="' + (y - 22) + '" width="1.2" height="8" fill="url(#wlFoil)"/>';
    });
    return '<svg class="wl-gopuram" viewBox="-90 ' + (y - 26) + ' 180 ' + (250 - y) + '" aria-hidden="true">' + s + '</svg>';
  }
  function kolam(fill) {
    var s = '';
    for (var x = 6; x < 400; x += 12) s += '<circle cx="' + x + '" cy="6" r="1.6"/>';
    for (var x2 = 0; x2 < 400; x2 += 24) s += '<path d="M' + x2 + ',6 Q' + (x2 + 6) + ',-2 ' + (x2 + 12) + ',6 Q' + (x2 + 18) + ',14 ' + (x2 + 24) + ',6" fill="none" stroke="' + fill + '" stroke-width=".9"/>';
    return '<svg class="wl-kolam" viewBox="0 -2 400 16" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="' + fill + '">' + s + '</g></svg>';
  }
  function deco() {
    var s = '';
    for (var i = 0; i <= 18; i++) { var a = -90 + i * 10; s += '<rect x="-.5" y="-150" width="1" height="118" transform="rotate(' + a + ')" fill="url(#wlFoil)" opacity="' + (i % 2 ? .55 : 1) + '"/>'; }
    [32, 44, 150, 158].forEach(function (r, i) { s += '<path d="M' + (-r) + ',0 A' + r + ',' + r + ' 0 0 1 ' + r + ',0" fill="none" stroke="url(#wlFoil)" stroke-width="' + (i % 2 ? .8 : 1.6) + '"/>'; });
    s += '<path d="M-26,0 A26,26 0 0 1 26,0Z" fill="url(#wlFoil)"/>';
    return '<svg class="wl-deco" viewBox="-170 -170 340 172" aria-hidden="true">' + s + '<rect x="-170" y="0" width="340" height="1.6" fill="url(#wlFoil)"/></svg>';
  }
  function feather(len, rot, x, y) {
    var s = '<g transform="translate(' + x + ',' + y + ') rotate(' + rot + ')">';
    s += '<rect x="-.6" y="' + (-len) + '" width="1.2" height="' + len + '" fill="#C9A24A"/>';
    for (var i = 8; i < len - 18; i += 3.2) {
      var w = Math.min(18, 4 + (i / len) * 22);
      s += '<path d="M0,' + f1(-i) + ' q' + f1(-w * .6) + ',' + f1(-w * .4) + ' ' + f1(-w) + ',' + f1(-w * .9) + ' M0,' + f1(-i) + ' q' + f1(w * .6) + ',' + f1(-w * .4) + ' ' + f1(w) + ',' + f1(-w * .9) + '" stroke="' + (i % 2 ? '#2E9E7A' : '#5DB37E') + '" stroke-width=".7" fill="none" opacity=".75"/>';
    }
    var ey = -len + 12;
    s += '<ellipse cy="' + ey + '" rx="13" ry="16" fill="#7FB04A"/><ellipse cy="' + (ey + 1) + '" rx="10.5" ry="13" fill="url(#wlFoil)"/>' +
      '<ellipse cy="' + (ey + 2) + '" rx="8" ry="10" fill="#0F9AA0"/><ellipse cy="' + (ey + 3) + '" rx="5" ry="6.4" fill="#173E8C"/><ellipse cx="-1.4" cy="' + (ey + 1) + '" rx="1.2" ry="1.8" fill="#9FE3E8" opacity=".8"/>';
    return s + '</g>';
  }
  function peacock() {
    var s = '';
    [[-50, 118], [-25, 132], [0, 140], [25, 132], [50, 118]].forEach(function (f) { s += feather(f[1], f[0], 0, 150); });
    return '<svg class="wl-peacock" viewBox="-120 0 240 160" aria-hidden="true">' + s + '</svg>';
  }
  function jharokha() {
    function arch(cx, sc) {
      var p = 'M-40,70 L-40,0 A10,10 0 0 1 -30,-12 A12,12 0 0 1 -14,-26 A14,14 0 0 1 14,-26 A12,12 0 0 1 30,-12 A10,10 0 0 1 40,0 L40,70Z';
      return '<g transform="translate(' + cx + ',90) scale(' + sc + ')">' +
        '<path d="M-48,-40 Q0,-82 48,-40Z" fill="#FFF6EE" stroke="url(#wlFoilD)" stroke-width="1.2"/><rect x="-1" y="-96" width="2" height="16" fill="url(#wlFoilD)"/><circle cy="-98" r="3" fill="url(#wlFoilD)"/>' +
        '<rect x="-54" y="-42" width="108" height="6" fill="url(#wlFoilD)"/>' +
        '<rect x="-50" y="-36" width="100" height="112" fill="#FBEDE6" stroke="url(#wlFoilD)" stroke-width="1"/>' +
        '<path d="' + p + '" fill="#F6D2C6" stroke="url(#wlFoilD)" stroke-width="1.4"/>' +
        '<path d="' + p + '" transform="scale(.8) translate(0,8)" fill="none" stroke="url(#wlFoilD)" stroke-width=".8"/></g>';
    }
    return '<svg class="wl-jharokha" viewBox="0 0 400 190" preserveAspectRatio="xMidYMin meet" aria-hidden="true">' + arch(70, .72) + arch(330, .72) + arch(200, 1) + '</svg>';
  }
  function gulmoharBranch(seed, flip) {
    var R = rng(seed), s = '';
    s += '<path d="M0,0 C60,30 110,40 170,90 C200,115 230,120 260,128" fill="none" stroke="#5B3A22" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M90,42 C110,70 116,96 112,130 M170,90 C176,60 196,40 224,30" fill="none" stroke="#5B3A22" stroke-width="2.4" stroke-linecap="round"/>';
    function fern(x, y, a, l) {
      var t = '<g transform="translate(' + x + ',' + y + ') rotate(' + a + ')"><rect width="' + l + '" height=".9" fill="#4E7D3A"/>';
      for (var i = 4; i < l; i += 4) t += '<ellipse cx="' + i + '" cy="-2.6" rx="1.3" ry="2.6" fill="#5E9446"/><ellipse cx="' + i + '" cy="2.6" rx="1.3" ry="2.6" fill="#5E9446"/>';
      return t + '</g>';
    }
    function flower(x, y, r, rot) {
      var t = '<g transform="translate(' + f1(x) + ',' + f1(y) + ') rotate(' + f1(rot) + ')">';
      for (var p = 0; p < 5; p++) t += '<ellipse cx="0" cy="' + f1(-r) + '" rx="' + f1(r * .62) + '" ry="' + f1(r * .9) + '" transform="rotate(' + (p * 72) + ')" fill="' + (p === 0 ? '#F6E7D3' : (p % 2 ? '#E2401C' : '#EF5A24')) + '"/>';
      if (true) t += '<ellipse cx="0" cy="' + f1(-r) + '" rx="' + f1(r * .3) + '" ry="' + f1(r * .5) + '" fill="#E2401C" opacity=".55"/>';
      return t + '<circle r="' + f1(r * .3) + '" fill="#B0270E"/></g>';
    }
    [[40, 22, 20, 36], [120, 58, -30, 40], [200, 108, 10, 34], [150, 70, 60, 30], [230, 30, -10, 30]].forEach(function (f) { s += fern(f[0], f[1], f[2], f[3]); });
    [[96, 52], [130, 74], [176, 94], [112, 118], [222, 34], [200, 46], [250, 126], [70, 30], [160, 84]].forEach(function (p) {
      s += flower(p[0] + (R() - .5) * 6, p[1] + (R() - .5) * 6, 7 + R() * 3, R() * 72);
    });
    return '<svg class="wl-gulmohar' + (flip ? ' r' : '') + '" viewBox="-6 -6 280 150" aria-hidden="true">' + s + '</svg>';
  }

  function heroDecor(theme) {
    switch (theme) {
      case 'kasavu': return '<div class="wl-hd-top">' + kasavuBand() + '</div>' + lamp();
      case 'sindoor': return mandala('url(#wlFoil)');
      case 'marigold': return toran();
      case 'nilavu': return night(11) + moon() + diyas();
      case 'mullappoo': return jasmine(380, 3, false) + jasmine(300, 9, true);
      case 'thamara': return lotus('wl-lotus wl-lotus-top');
      case 'champagne': return bokeh(5, 34, 400, 700) + cornerFrame('url(#wlFoilD)');
      case 'noor': return '<div class="wl-hd-top">' + starBand('url(#wlFoil)') + '</div>' + mihrab('url(#wlFoil)');
      case 'qamar': return night(23) + lanterns() + '<svg class="wl-moon wl-moon-q" viewBox="0 0 60 60" aria-hidden="true"><path d="M38,4 A27,27 0 1,0 56,40 A22,22 0 1,1 38,4Z" fill="url(#wlFoil)"/></svg>';
      case 'chapel': return crossWindow();
      case 'grace': return wreath();
      case 'kesar': return '<div class="wl-hd-top">' + phulkari(1) + '</div>' + onkar() + '<div class="wl-hd-bot">' + phulkari(2) + '</div>';
      case 'gopuram': return gopuramSvg() + '<div class="wl-hd-bot">' + kolam('url(#wlFoil)') + '</div>';
      case 'velvet': return deco() + cornerFrame('url(#wlFoil)');
      case 'mayil': return peacock() + bokeh(9, 16, 400, 700);
      case 'jaipur': return jharokha();
      case 'gulmohar': return gulmoharBranch(4, false) + gulmoharBranch(8, true);
    }
    return '';
  }

  /* ---------------- render ---------------- */

  function normalize(d) {
    d = d || {};
    var plan = LIMITS[d.plan] ? d.plan : 'premium';
    var lim = LIMITS[plan];
    var theme = FONTS[d.theme] ? d.theme : 'champagne';
    var evs = (d.events || []).filter(function (e) { return e && (e.date || e.name || e.venue); });
    evs = evs.slice(0, lim.events).sort(function (a, b) { return ((a.date || '9') + (a.time || '')).localeCompare((b.date || '9') + (b.time || '')); });
    return {
      theme: theme, plan: plan, lim: lim, bg: d.bg || (w.WL_BG && w.WL_BG[theme]) || '',
      p1: (d.p1 || '').trim() || 'Arjun', p2: (d.p2 || '').trim() || 'Meera',
      p1f: (d.p1_family || '').trim(), p2f: (d.p2_family || '').trim(),
      intro: (d.intro || '').trim() || (DEFAULTS[theme] || {}).intro || 'Together with their families',
      line: (d.line || '').trim() || (DEFAULTS[theme] || {}).line || 'invite you to celebrate their wedding',
      message: (d.message || '').trim(),
      closing: (d.closing || '').trim() || 'Your presence is the blessing we look forward to.',
      events: evs,
      main: evs.filter(function (e) { return e.date && /wedding|marriage|muhurt|kalyan|vivah|nikah|thali|minnu|matrimony|shaadi|anand karaj/i.test(e.name || ''); })[0] || evs.filter(function (e) { return e.date; })[0],
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

    var bgStyle = v.bg ? ' style="--bgimg:url(&quot;' + esc(v.bg).replace(/[()]/g, '') + '&quot;)"' : '';
    var html = '<div class="wl' + (v.bg ? ' has-bg' : '') + '" data-theme="' + v.theme + '" data-plan="' + v.plan + '" data-mode="' + mode + '"' + bgStyle + '>' + DEFS;

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

  w.WL = { render: render, longDate: longDate, time12: time12, LIMITS: LIMITS, DEFAULTS: DEFAULTS };
})(window, document);
