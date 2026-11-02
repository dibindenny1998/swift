/* WedLink marriage biodata: renderer, form logic and PDF / image download. */
(function (w, doc) {
  'use strict';
  var CFG = w.WLB_CFG || {};
  var PAGE_W = 794, PAGE_H = 1123; // A4 at 96 dpi
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function nl2br(s) { return esc(s).replace(/\n/g, '<br>'); }
  function fmtDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); if (!m) return s || '';
    return (+m[3]) + ' ' + MONTHS[+m[2] - 1] + ' ' + m[1];
  }
  function age(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); if (!m) return '';
    var now = new Date(), a = now.getFullYear() - +m[1];
    if (now.getMonth() + 1 < +m[2] || (now.getMonth() + 1 === +m[2] && now.getDate() < +m[3])) a--;
    return a > 0 && a < 120 ? a + ' years' : '';
  }
  function time12(t) {
    var m = /^(\d{2}):(\d{2})$/.exec(t || ''); if (!m) return t || '';
    var h = +m[1], ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    return h + ':' + m[2] + ' ' + ap;
  }
  function value(k, d) {
    var v = (d[k] || '').trim();
    if (!v) return '';
    if (k === 'dob') { var a = age(v); return fmtDate(v) + (a ? ' (' + a + ')' : ''); }
    if (k === 'birth_time') return time12(v);
    return v;
  }

  // Corners are drawn already rotated (no CSS transforms), so the PDF/image export draws them exactly.
  function flip(path, fx, fy, w, h) {
    return path.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, function (m, x, y) { return (fx ? w - +x : +x) + ',' + (fy ? h - +y : +y); });
  }
  function svgBox(cls, w, h, inner, pw, ph) {
    return '<svg class="bd-c ' + cls + '" width="' + pw + '" height="' + ph + '" viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
  }
  function corner(tpl) {
    if (tpl === 'floral') {
      var paths = ['M6,120 C30,90 50,60 96,40 C120,30 150,24 190,26', 'M40,80 C30,66 40,52 54,56 C50,68 46,76 40,80Z', 'M120,32 C126,18 142,16 150,22 C142,30 132,34 120,32Z',
        'M88,44 C80,30 90,14 104,18 C118,22 116,38 106,42 C98,45 92,40 95,33 C98,27 105,28 106,33'];
      var dots = [[70, 60, 3], [160, 22, 2.4], [24, 104, 2.4]];
      return ['tl', 'br'].map(function (pos) {
        var f = pos === 'br';
        var g = paths.map(function (d) { return '<path d="' + flip(d, f, f, 200, 130) + '" fill="none" stroke="#C27A86" stroke-width="1.6" stroke-linecap="round"/>'; }).join('') +
          dots.map(function (c) { return '<circle cx="' + (f ? 200 - c[0] : c[0]) + '" cy="' + (f ? 130 - c[1] : c[1]) + '" r="' + c[2] + '" fill="#F3C7CE"/>'; }).join('');
        return svgBox(pos, 200, 130, g, 220, 143);
      }).join('');
    }
    if (tpl === 'royal') {
      return [['tl', 0, 0], ['tr', 1, 0], ['bl', 0, 1], ['br', 1, 1]].map(function (c) {
        var fx = c[1], fy = c[2];
        var g = '<path d="' + flip('M2,40 L2,2 L40,2', fx, fy, 54, 54) + '" fill="none" stroke="#C9A24A" stroke-width="2.4"/>' +
          '<path d="' + flip('M12,46 L12,12 L46,12', fx, fy, 54, 54) + '" fill="none" stroke="#C9A24A" stroke-width="1"/>' +
          '<path d="' + flip('M2,-4 L8,2 L2,8 L-4,2Z', fx, fy, 54, 54) + '" fill="#C9A24A"/>';
        return svgBox(c[0], 54, 54, g, 54, 54);
      }).join('');
    }
    return '';
  }

  function ornament(tpl) {
    var col = { royal: '#B08A3E', kasavu: '#B08A3E', floral: '#C27A86', simple: '#222' }[tpl] || '#B08A3E';
    return '<svg class="bd-orn" width="210" height="21" viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="10" y="9.5" width="72" height="1" fill="' + col + '"/><rect x="118" y="9.5" width="72" height="1" fill="' + col + '"/>' +
      '<g fill="' + col + '" transform="translate(100,10)"><path d="M0,-7 L4,0 L0,7 L-4,0Z"/><circle cx="-11" r="2"/><circle cx="11" r="2"/></g></svg>';
  }

  function watermark(brand, host) {
    var marks = '';
    for (var r = 0; r < 7; r++) for (var c = 0; c < 3; c++) {
      marks += '<span style="top:' + (r * 170 + 40) + 'px;left:' + (c * 290 - 40 + (r % 2) * 140) + 'px">' + esc(brand) + '</span>';
    }
    return '<div class="bd-wm" aria-hidden="true">' + marks + '</div>' +
      '<div class="bd-wm-foot">Made free with ' + esc(brand) + ' · ' + esc(host) + '/biodata</div>';
  }

  /** Renders the biodata page into el. opts: { watermark: bool, brand, host } */
  function render(el, d, tpl, photo, opts) {
    opts = opts || {};
    d = d || {};
    tpl = tpl || 'royal';
    var sections = (CFG.sections || []).map(function (sec) {
      var rows = sec.fields.map(function (f) {
        var v = value(f.k, d);
        return v ? '<tr><th>' + esc(f.label) + '</th><td>' + nl2br(v) + '</td></tr>' : '';
      }).join('');
      if (sec.title === 'Contact') return { title: sec.title, rows: rows, last: true };
      return { title: sec.title, rows: rows };
    });
    var extra = (d.extra || []).filter(function (x) { return x && x.label && x.value; })
      .map(function (x) { return '<tr><th>' + esc(x.label) + '</th><td>' + nl2br(x.value) + '</td></tr>'; }).join('');
    if (extra) sections.splice(sections.length - 1, 0, { title: 'Other details', rows: extra });

    var body = '';
    sections.forEach(function (s) {
      if (s.title === 'Personal details' || !s.rows) return;
      body += '<section class="bd-sec"><h3>' + esc(s.title) + '</h3><table>' + s.rows + '</table></section>';
    });
    var personal = sections[0] && sections[0].rows;
    var name = (d.name || '').trim() || 'Your name';

    var html = '<div class="bd bd-' + esc(tpl) + (photo ? ' has-photo' : '') + '"><div class="bd-in">' + corner(tpl) +
      (d.top_line ? '<p class="bd-top">' + esc(d.top_line) + '</p>' : '') +
      '<h1 class="bd-title">' + esc(d.title || 'Marriage Biodata') + '</h1>' + ornament(tpl) +
      '<div class="bd-head">' +
        (photo ? '<div class="bd-photo"><img src="' + esc(photo) + '" alt="" crossorigin="anonymous"></div>' : '') +
        '<div class="bd-headtxt"><h2 class="bd-name">' + esc(name) + '</h2>' +
        (personal ? '<table class="bd-personal">' + personal + '</table>' : '') + '</div>' +
      '</div>' +
      (d.about ? '<section class="bd-sec bd-para"><h3>About me</h3><p>' + nl2br(d.about) + '</p></section>' : '') +
      body +
      (d.expect ? '<section class="bd-sec bd-para"><h3>Partner expectations</h3><p>' + nl2br(d.expect) + '</p></section>' : '') +
      '</div>' + (opts.watermark ? watermark(opts.brand || 'WedLink', opts.host || '') : '') + '</div>';
    el.innerHTML = html;
    fit(el.querySelector('.bd'));
  }

  // shrink the type until everything fits on one A4 page
  function fit(page) {
    if (!page) return;
    var size = 19;
    page.style.fontSize = size + 'px';
    var inner = page.querySelector('.bd-in');
    var guard = 0;
    while (inner.scrollHeight > page.clientHeight - 4 && size > 9.5 && guard++ < 40) {
      size -= 0.4;
      page.style.fontSize = size + 'px';
    }
  }

  /** Scales the fixed-size A4 page to the width of its frame. */
  function scaleTo(frame) {
    var page = frame.querySelector('.bd'); if (!page) return;
    var s = frame.clientWidth / PAGE_W;
    page.style.transform = 'scale(' + s + ')';
    frame.style.height = Math.ceil(PAGE_H * s) + 'px';
  }

  /* ---------- download ---------- */
  var libs = null;
  function loadScript(src) {
    return new Promise(function (res, rej) { var s = doc.createElement('script'); s.src = src; s.onload = res; s.onerror = function () { rej(new Error('Could not load ' + src)); }; doc.head.appendChild(s); });
  }
  function loadLibs() {
    if (libs) return libs;
    libs = Promise.all([
      w.html2canvas ? 1 : loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
      w.jspdf ? 1 : loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
    ]).catch(function (e) { libs = null; throw e; });
    return libs;
  }
  /** Draws an unscaled copy of the page off-screen and returns a canvas at 2x. */
  function snapshot(d, tpl, photo, opts) {
    return loadLibs().then(function () {
      var host = doc.createElement('div');
      host.className = 'bd-snap';
      doc.body.appendChild(host);
      render(host, d, tpl, photo, opts);
      var page = host.querySelector('.bd');
      var imgs = Array.prototype.slice.call(host.querySelectorAll('img'));
      return Promise.all(imgs.map(function (im) { return im.complete ? 1 : new Promise(function (r) { im.onload = im.onerror = r; }); }))
        .then(function () { return doc.fonts && doc.fonts.ready; })
        .then(function () { return w.html2canvas(page, { scale: 2, useCORS: true, backgroundColor: '#ffffff', width: PAGE_W, height: PAGE_H, windowWidth: PAGE_W }); })
        .then(function (canvas) { host.remove(); return canvas; }, function (e) { host.remove(); throw e; });
    });
  }
  function fileName(d, ext) { return ((d.name || 'biodata').trim().replace(/[^\w\u0080-￿]+/g, '-').replace(/^-|-$/g, '') || 'biodata') + '-biodata.' + ext; }
  function saveBlob(blob, name) {
    var a = doc.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    doc.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }
  function download(kind, d, tpl, photo, opts) {
    return snapshot(d, tpl, photo, opts).then(function (canvas) {
      if (kind === 'pdf') {
        var pdf = new w.jspdf.jsPDF({ unit: 'mm', format: 'a4', compress: true });
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297);
        var blob = pdf.output('blob');
        return { blob: blob, name: fileName(d, 'pdf'), type: 'application/pdf' };
      }
      return new Promise(function (res) {
        canvas.toBlob(function (b) { res({ blob: b, name: fileName(d, 'jpg'), type: 'image/jpeg' }); }, 'image/jpeg', 0.92);
      });
    });
  }

  w.WLB = { render: render, scaleTo: scaleTo, download: download, saveBlob: saveBlob, fmtDate: fmtDate };
})(window, document);
