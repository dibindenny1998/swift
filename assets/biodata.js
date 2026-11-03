/* TheWedLink marriage biodata: renderer, form logic and PDF / image download. */
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

  // small religious symbol in the accent colour (off unless the person turns it on)
  var SYMBOL = { hindu: 'om', jain: 'jain', sikh: 'onkar', muslim: 'crescent', christian: 'cross', buddhist: 'wheel' };
  function symbol(rel) {
    var k = SYMBOL[rel], g = '';
    if (!k) return '';
    if (k === 'om') return '<p class="bd-sym bd-sym-t" lang="hi">ॐ</p>';
    if (k === 'onkar') return '<p class="bd-sym bd-sym-t" lang="pa">ੴ</p>';
    if (k === 'crescent') g = '<path d="M17,3 A11,11 0 1,0 25,20 A9,9 0 1,1 17,3Z"/>';
    else if (k === 'cross') g = '<path d="M12.5,3 h3 v6 h6 v3 h-6 v13 h-3 v-13 h-6 v-3 h6Z"/>';
    else if (k === 'jain') g = '<path d="M14,3 C9,9 7,14 9,19 C10.5,22.5 17.5,22.5 19,19 C21,14 19,9 14,3Z M14,13 a2,2 0 1,1 0,4 a2,2 0 1,1 0,-4Z" fill-rule="evenodd"/>';
    else if (k === 'wheel') { g = '<circle cx="14" cy="14" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="14" cy="14" r="2.2"/>'; for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; g += '<path d="M' + (14 + 2.2 * Math.cos(a)).toFixed(1) + ',' + (14 + 2.2 * Math.sin(a)).toFixed(1) + ' L' + (14 + 9 * Math.cos(a)).toFixed(1) + ',' + (14 + 9 * Math.sin(a)).toFixed(1) + '" stroke="currentColor" stroke-width="1.3"/>'; } }
    return '<svg class="bd-sym" width="28" height="28" viewBox="0 0 28 28" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' + g + '</svg>';
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

    var layout = (CFG.layouts && CFG.layouts[d.layout]) ? d.layout : 'center';
    var html = '<div class="bd bd-' + esc(tpl) + ' bd-l-' + layout + (photo ? ' has-photo' : '') + (opts.watermark ? ' has-strip' : '') + '" lang="' + (rel === 'muslim' ? 'ar' : 'en') + '">' +
      '<div class="bd-in">' +
      (layout === 'frame' ? '<i class="bd-tick tl"></i><i class="bd-tick tr"></i><i class="bd-tick bl"></i><i class="bd-tick br"></i>' : '') +
      '<header class="bd-hd">' + (d.symbol ? symbol(rel) : '') +
        (top ? '<p class="bd-top">' + esc(top) + '</p>' : '') +
        '<p class="bd-title">' + esc(d.title || 'Marriage Biodata') + '</p><span class="bd-rule"></span></header>' +
      '<div class="bd-head">' +
        (photo ? '<div class="bd-photo"><img src="' + esc(photo) + '" alt="" crossorigin="anonymous"></div>' : '') +
        '<div class="bd-headtxt"><p class="bd-name">' + esc(name) + '</p>' +
        (personal ? '<table class="bd-personal">' + personal + '</table>' : '') + '</div>' +
      '</div>' +
      (d.about ? '<section class="bd-sec bd-para">' + head('About me') + '<p>' + nl2br(d.about) + '</p></section>' : '') +
      body +
      (d.expect ? '<section class="bd-sec bd-para">' + head('Partner expectations') + '<p>' + nl2br(d.expect) + '</p></section>' : '') +
      '</div>' + (opts.watermark ? strip(opts.brand || 'TheWedLink') : '') + '</div>';
    el.innerHTML = html;
    fit(el.querySelector('.bd'));
  }

  // shrink the type until everything fits on one A4 page
  function fit(page) {
    if (!page) return;
    var size = 16.5;
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
