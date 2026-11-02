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
  function applies(f, rel) { return !f.rel || f.rel.indexOf(rel) > -1; }

  /* ---------- ornaments (all drawn as SVG, gold via gradient) ---------- */
  var PAL = {
    royal: ['#8A6416', '#F6E3A1', '#B88A2A', '#FFF2C4', '#7A560F'],
    emerald: ['#8A6416', '#F6E3A1', '#B88A2A', '#FFF2C4', '#7A560F'],
    ivory: ['#8E6A22', '#E9CF86', '#A7802F', '#F7E4AE', '#7E5C17'],
    khalsa: ['#B5701A', '#FFD98A', '#D9952C', '#FFEBB8', '#A1600F'],
    kasavu: ['#8E6A16', '#EBCB6E', '#B08A2A', '#F7E3A0', '#7E5C10'],
    noir: ['#8A6416', '#F6E3A1', '#B88A2A', '#FFF2C4', '#7A560F']
  };
  function gold(id, tpl) {
    var p = PAL[tpl] || PAL.royal;
    return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      p.map(function (c, i) { return '<stop offset="' + (i / (p.length - 1)) + '" stop-color="' + c + '"/>'; }).join('') + '</linearGradient></defs>';
  }
  function filigree(pos, tpl) {
    // an ornate corner: double rule, a scroll and a leaf, drawn for the top-left and mirrored by coordinates
    var fx = pos === 'tr' || pos === 'br', fy = pos === 'bl' || pos === 'br', S = 120;
    function P(x, y) { return (fx ? S - x : x) + ',' + (fy ? S - y : y); }
    var id = 'g' + pos + tpl;
    var d1 = 'M' + P(4, 110) + ' L' + P(4, 4) + ' L' + P(110, 4);
    var d2 = 'M' + P(14, 96) + ' L' + P(14, 14) + ' L' + P(96, 14);
    var scroll = 'M' + P(14, 54) + ' C' + P(30, 52) + ' ' + P(40, 40) + ' ' + P(38, 28) + ' C' + P(36, 18) + ' ' + P(24, 18) + ' ' + P(24, 28) + ' C' + P(24, 34) + ' ' + P(30, 36) + ' ' + P(33, 31) +
      ' M' + P(54, 14) + ' C' + P(52, 30) + ' ' + P(40, 40) + ' ' + P(28, 38);
    var leaf = 'M' + P(38, 38) + ' C' + P(50, 44) + ' ' + P(58, 56) + ' ' + P(60, 66) + ' C' + P(50, 62) + ' ' + P(40, 52) + ' ' + P(38, 38) + 'Z';
    return '<svg class="bd-c ' + pos + '" width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">' + gold(id, tpl) +
      '<g fill="none" stroke="url(#' + id + ')" stroke-linecap="round"><path d="' + d1 + '" stroke-width="2.6"/><path d="' + d2 + '" stroke-width="1"/><path d="' + scroll + '" stroke-width="1.6"/></g>' +
      '<path d="' + leaf + '" fill="url(#' + id + ')"/><circle cx="' + P(14, 14).split(',')[0] + '" cy="' + P(14, 14).split(',')[1] + '" r="3.5" fill="url(#' + id + ')"/></svg>';
  }
  function flourish(tpl, id) {
    return '<svg class="bd-fl" width="300" height="24" viewBox="0 0 300 24" xmlns="http://www.w3.org/2000/svg">' + gold(id, tpl) +
      '<g fill="none" stroke="url(#' + id + ')" stroke-linecap="round" stroke-width="1.3">' +
      '<path d="M10,12 L110,12 M190,12 L290,12"/><path d="M110,12 C122,12 126,4 136,6 C142,7 142,14 136,14 C132,14 132,10 135,10"/>' +
      '<path d="M190,12 C178,12 174,4 164,6 C158,7 158,14 164,14 C168,14 168,10 165,10"/></g>' +
      '<path d="M150,4 L157,12 L150,20 L143,12Z" fill="url(#' + id + ')"/><circle cx="10" cy="12" r="2" fill="url(#' + id + ')"/><circle cx="290" cy="12" r="2" fill="url(#' + id + ')"/></svg>';
  }
  function emblem(kind, tpl) {
    if (!kind) return '';
    var id = 'em' + tpl, inner = '';
    if (kind === 'om') inner = '<text x="40" y="54" text-anchor="middle" font-family="Noto Serif Devanagari, serif" font-size="40" font-weight="600" fill="url(#' + id + ')">ॐ</text>';
    else if (kind === 'onkar') inner = '<text x="40" y="53" text-anchor="middle" font-family="Noto Serif Gurmukhi, serif" font-size="36" font-weight="600" fill="url(#' + id + ')">ੴ</text>';
    else if (kind === 'crescent') inner = '<path d="M46,20 A21,21 0 1,0 58,52 A17,17 0 1,1 46,20Z" fill="url(#' + id + ')"/><path d="M55,27 l2.4,5 5.4,.6 -4,3.7 1.1,5.3 -4.9,-2.7 -4.9,2.7 1.1,-5.3 -4,-3.7 5.4,-.6Z" fill="url(#' + id + ')"/>';
    else if (kind === 'cross') inner = '<path d="M36,16 h8 v12 h12 v8 h-12 v28 h-8 v-28 h-12 v-8 h12Z" fill="url(#' + id + ')"/>';
    else if (kind === 'wheel') { inner = '<circle cx="40" cy="40" r="20" fill="none" stroke="url(#' + id + ')" stroke-width="2.4"/><circle cx="40" cy="40" r="5" fill="url(#' + id + ')"/>'; for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; inner += '<path d="M' + (40 + 5 * Math.cos(a)).toFixed(1) + ',' + (40 + 5 * Math.sin(a)).toFixed(1) + ' L' + (40 + 20 * Math.cos(a)).toFixed(1) + ',' + (40 + 20 * Math.sin(a)).toFixed(1) + '" stroke="url(#' + id + ')" stroke-width="2"/>'; } }
    else if (kind === 'jain') inner = '<path d="M40,18 C30,30 26,40 30,50 C33,57 47,57 50,50 C54,40 50,30 40,18Z" fill="none" stroke="url(#' + id + ')" stroke-width="2.4"/><circle cx="40" cy="44" r="4" fill="url(#' + id + ')"/>';
    return '<svg class="bd-emblem" width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">' + gold(id, tpl) +
      '<circle cx="40" cy="40" r="37" fill="none" stroke="url(#' + id + ')" stroke-width="1.6"/><circle cx="40" cy="40" r="33" fill="none" stroke="url(#' + id + ')" stroke-width=".7"/>' + inner + '</svg>';
  }

  function strip(brand) { return '<div class="bd-strip">Created by ' + esc(brand) + '</div>'; }

  /** Renders the biodata page into el. opts: { watermark: bool, brand } */
  function render(el, d, tpl, photo, opts) {
    opts = opts || {};
    d = d || {};
    var rel = (CFG.religions && CFG.religions[d.religion]) ? d.religion : 'hindu';
    var R = (CFG.religions || {})[rel] || {};
    tpl = (CFG.templates && CFG.templates[tpl]) ? tpl : (R.template || 'royal');

    var personal = '', blocks = [];
    (CFG.sections || []).forEach(function (sec) {
      var rows = '';
      if (sec.title === '@religion' && rel !== 'other') rows += '<tr><th>Religion</th><td>' + esc(R.name) + '</td></tr>';
      sec.fields.forEach(function (f) {
        if (f.k === 'name' || !applies(f, rel)) return;
        var v = value(f.k, d);
        if (v) rows += '<tr><th>' + esc(f.label) + '</th><td>' + nl2br(v) + '</td></tr>';
      });
      if (sec.title === 'Personal details') { personal = rows; return; }
      blocks.push({ title: sec.title === '@religion' ? R.section : sec.title, rows: rows });
    });
    var extra = (d.extra || []).filter(function (x) { return x && x.label && x.value; })
      .map(function (x) { return '<tr><th>' + esc(x.label) + '</th><td>' + nl2br(x.value) + '</td></tr>'; }).join('');
    if (extra) blocks.splice(blocks.length - 1, 0, { title: 'Other details', rows: extra });

    function head(t) { return '<h3><span>' + esc(t) + '</span></h3>'; }
    var body = '';
    blocks.forEach(function (b) { if (b.rows) body += '<section class="bd-sec">' + head(b.title) + '<table>' + b.rows + '</table></section>'; });
    var name = (d.name || '').trim() || 'Your name';
    var top = d.no_top ? '' : ((d.top_line || '').trim() || R.top || '');
    var corners = ['tl', 'tr', 'bl', 'br'].map(function (p) { return filigree(p, tpl); }).join('');

    var html = '<div class="bd bd-' + esc(tpl) + (photo ? ' has-photo' : '') + (opts.watermark ? ' has-strip' : '') + '" lang="' + (rel === 'muslim' ? 'ar' : 'en') + '">' +
      '<div class="bd-frame-o"></div><div class="bd-in">' + corners +
      '<header class="bd-hd">' + (d.no_top ? '' : emblem(R.emblem, tpl)) +
        (top ? '<p class="bd-top">' + esc(top) + '</p>' : '') +
        '<h1 class="bd-title">' + esc(d.title || 'Marriage Biodata') + '</h1>' + flourish(tpl, 'fl' + tpl) + '</header>' +
      '<div class="bd-head">' +
        (photo ? '<div class="bd-photo"><img src="' + esc(photo) + '" alt="" crossorigin="anonymous"></div>' : '') +
        '<div class="bd-headtxt"><h2 class="bd-name">' + esc(name) + '</h2>' +
        (personal ? '<table class="bd-personal">' + personal + '</table>' : '') + '</div>' +
      '</div>' +
      (d.about ? '<section class="bd-sec bd-para">' + head('About me') + '<p>' + nl2br(d.about) + '</p></section>' : '') +
      body +
      (d.expect ? '<section class="bd-sec bd-para">' + head('Partner expectations') + '<p>' + nl2br(d.expect) + '</p></section>' : '') +
      '</div>' + (opts.watermark ? strip(opts.brand || 'WedLink') : '') + '</div>';
    el.innerHTML = html;
    fit(el.querySelector('.bd'));
  }

  // shrink the type until everything fits on one A4 page
  function fit(page) {
    if (!page) return;
    var size = 17.5;
    page.style.fontSize = size + 'px';
    var inner = page.querySelector('.bd-in');
    var guard = 0;
    while (inner.scrollHeight > inner.clientHeight + 1 && size > 9.5 && guard++ < 40) {
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
      w.htmlToImage ? 1 : loadScript('https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js'),
      w.jspdf ? 1 : loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
    ]).catch(function (e) { libs = null; throw e; });
    return libs;
  }
  /** Draws an unscaled copy of the page off-screen and returns a canvas at 2x.
      html-to-image lets the browser itself draw the page, so text and ornaments land exactly where they are on screen. */
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
        .then(function () { return w.htmlToImage.toCanvas(page, { pixelRatio: 2, width: PAGE_W, height: PAGE_H, cacheBust: false }); })
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
