/* "Your details" pop-up: name, mobile, email (optional) and address, asked once before buying or downloading. */
(function (w, doc) {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  /** opts: { kind: 'invite'|'biodata', t, have: bool, prefill: {name, phone, email}, why } → Promise that resolves once details are saved */
  function ask(opts) {
    if (opts.have) return Promise.resolve();
    var STATES = opts.states || w.WL_STATES || [];
    return new Promise(function (resolve, reject) {
      var p = opts.prefill || {};
      var box = doc.createElement('div');
      box.className = 'dt-modal';
      box.innerHTML = '<form class="dt-box" novalidate role="dialog" aria-modal="true" aria-labelledby="dt-h">' +
        '<button type="button" class="dt-x" aria-label="Close">&times;</button>' +
        '<h2 id="dt-h">Your details</h2><p class="dt-lead">' + esc(opts.why || 'We need these once, for your receipt and so we can help if anything goes wrong.') + '</p>' +
        '<div class="field"><label for="dt-name">Full name</label><input id="dt-name" name="name" maxlength="80" autocomplete="name" required value="' + esc(p.name) + '"></div>' +
        '<div class="row2"><div class="field"><label for="dt-phone">Mobile number</label><input id="dt-phone" name="phone" inputmode="tel" maxlength="15" autocomplete="tel" placeholder="98765 43210" required value="' + esc(p.phone) + '"></div>' +
        '<div class="field"><label for="dt-email">Email <small>(optional)</small></label><input id="dt-email" name="email" type="email" maxlength="120" autocomplete="email" value="' + esc(p.email) + '"></div></div>' +
        '<div class="field"><label for="dt-addr">Address <small>(house, street, area)</small></label><input id="dt-addr" name="address" maxlength="200" autocomplete="street-address"></div>' +
        '<div class="row3"><div class="field"><label for="dt-city">City / town</label><input id="dt-city" name="city" maxlength="60" autocomplete="address-level2" required></div>' +
        '<div class="field"><label for="dt-state">State</label><select id="dt-state" name="state" autocomplete="address-level1" required><option value="">Choose</option>' +
          STATES.map(function (s) { return '<option>' + esc(s) + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label for="dt-pin">PIN code</label><input id="dt-pin" name="pincode" inputmode="numeric" maxlength="6" autocomplete="postal-code" required></div></div>' +
        '<p class="err" role="alert"></p><button class="btn dt-go" type="submit">Continue</button>' +
        '<p class="dt-safe">We never share your details. No spam.</p></form>';
      doc.body.appendChild(box);
      doc.documentElement.style.overflow = 'hidden';
      var f = box.querySelector('form'), err = f.querySelector('.err'), go = f.querySelector('.dt-go');
      setTimeout(function () { (p.name ? f.elements.city : f.elements.name).focus(); }, 50);
      function close() { box.remove(); doc.documentElement.style.overflow = ''; }
      box.querySelector('.dt-x').addEventListener('click', function () { close(); reject(new Error('cancelled')); });
      box.addEventListener('click', function (e) { if (e.target === box) { close(); reject(new Error('cancelled')); } });
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var body = { kind: opts.kind, t: opts.t };
        ['name', 'phone', 'email', 'address', 'city', 'state', 'pincode'].forEach(function (k) { body[k] = f.elements[k].value.trim(); });
        go.disabled = true; go.textContent = 'Saving…'; err.textContent = '';
        fetch('/api.php?a=details', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
          .then(function (r) { return r.json(); })
          .then(function (j) {
            if (!j.ok) { go.disabled = false; go.textContent = 'Continue'; err.textContent = j.error || 'Could not save. Try again.'; if (j.field && f.elements[j.field]) f.elements[j.field].focus(); return; }
            close(); resolve();
          })
          .catch(function () { go.disabled = false; go.textContent = 'Continue'; err.textContent = 'No connection. Try again.'; });
      });
    });
  }
  w.WLDetails = { ask: ask };

  /** Launch offer pop-up shown instead of payment while online payments are not connected.
      opts: { n, total, worth, what, go } → Promise that resolves when they tap the button, rejects if they close it */
  function gift(opts) {
    return new Promise(function (resolve, reject) {
      var first = opts.total > 0 && opts.n > 0 && opts.n <= opts.total;
      var worth = opts.worth > 0 ? ' (worth ₹' + Number(opts.worth).toLocaleString('en-IN') + ')' : '';
      var box = doc.createElement('div');
      box.className = 'dt-modal';
      box.innerHTML = '<div class="dt-box gf-box" role="dialog" aria-modal="true" aria-labelledby="gf-h">' +
        '<button type="button" class="dt-x" aria-label="Close">&times;</button>' +
        '<svg class="gf-ic" viewBox="0 0 48 48" aria-hidden="true"><path d="M8 20h32v22H8zM5 13h38v7H5zM24 13v29M24 13c-3-6-12-8-12-2 0 3 6 2 12 2zm0 0c3-6 12-8 12-2 0 3-6 2-12 2z"/></svg>' +
        '<h2 id="gf-h">This one is on us</h2>' +
        (first
          ? '<p class="dt-lead">You are one of our first ' + esc(opts.total) + ' couples, so ' + esc(opts.what) + esc(worth) + ' is completely free. No payment needed.</p>'
          : '<p class="dt-lead">We are just launching, so ' + esc(opts.what) + esc(worth) + ' is free for you. No payment needed.</p>') +
        '<p class="gf-ask">All we ask: if you love it, tell us on WhatsApp what you think.</p>' +
        '<button type="button" class="btn gf-go">' + esc(opts.go || 'Continue') + '</button></div>';
      doc.body.appendChild(box);
      doc.documentElement.style.overflow = 'hidden';
      var go = box.querySelector('.gf-go');
      setTimeout(function () { go.focus(); }, 50);
      function close() { box.remove(); doc.documentElement.style.overflow = ''; }
      function cancel() { close(); reject(new Error('cancelled')); }
      box.querySelector('.dt-x').addEventListener('click', cancel);
      box.addEventListener('click', function (e) { if (e.target === box) cancel(); });
      doc.addEventListener('keydown', function esc_(e) { if (e.key === 'Escape' && box.isConnected) { doc.removeEventListener('keydown', esc_); cancel(); } });
      go.addEventListener('click', function () { close(); resolve(); });
    });
  }
  w.WLGift = { show: gift };

  /** Opens Cashfree's checkout in this tab. cf: { session, mode } from the server. */
  function cashfree(cf) {
    return new Promise(function (resolve, reject) {
      function open() { try { w.Cashfree({ mode: cf.mode }).checkout({ paymentSessionId: cf.session, redirectTarget: '_self' }); resolve(); } catch (e) { reject(new Error('Payment could not open. Try again.')); } }
      if (w.Cashfree) return open();
      var s = doc.createElement('script'); s.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      s.onload = open; s.onerror = function () { reject(new Error('Payment could not load. Check your connection and try again.')); };
      doc.head.appendChild(s);
    });
  }
  w.WLPay = { cashfree: cashfree };

  /** Sign in with an emailed 6-digit code, then link this invite/biodata to the account so the couple can always come back.
      opts: { t, kind: 'invite'|'biodata', email } → Promise that resolves once signed in */
  function signin(opts) {
    function post(a, b) { return fetch('/api.php?a=' + a, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b || {}) }).then(function (r) { return r.json(); }); }
    return new Promise(function (resolve, reject) {
      var box = doc.createElement('div');
      box.className = 'dt-modal';
      box.innerHTML = '<form class="dt-box si-box" novalidate role="dialog" aria-modal="true" aria-labelledby="si-h">' +
        '<button type="button" class="dt-x" aria-label="Close">&times;</button>' +
        '<h2 id="si-h">Save your website to your account</h2>' +
        '<p class="dt-lead">Sign in once so you can come back any time to edit it, see who is coming and share it again. No password needed.</p>' +
        '<div class="si-step1"><div class="field"><label for="si-email">Your email</label><input id="si-email" type="email" inputmode="email" autocomplete="email" maxlength="120" placeholder="you@example.com" value="' + esc(opts.email || '') + '"></div></div>' +
        '<div class="si-step2" hidden><p class="si-sent"></p><div class="field"><label for="si-code">6-digit code</label><input id="si-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]*"></div>' +
        '<button type="button" class="linkbtn si-back">Use a different email</button></div>' +
        '<p class="err" role="alert"></p><button class="btn si-go" style="width:100%">Send me a code</button>' +
        '<p class="dt-safe">We only email you about your website. No spam.</p></form>';
      doc.body.appendChild(box);
      doc.documentElement.style.overflow = 'hidden';
      var f = box.querySelector('form'), err = f.querySelector('.err'), go = f.querySelector('.si-go');
      var em = f.querySelector('#si-email'), code = f.querySelector('#si-code'), s1 = f.querySelector('.si-step1'), s2 = f.querySelector('.si-step2');
      var step = 1, email = '';
      setTimeout(function () { em.focus(); }, 50);
      function close() { box.remove(); doc.documentElement.style.overflow = ''; }
      function cancel() { close(); reject(new Error('cancelled')); }
      function busy(on, label) { go.disabled = on; go.textContent = label; }
      box.querySelector('.dt-x').addEventListener('click', cancel);
      box.addEventListener('click', function (e) { if (e.target === box) cancel(); });
      f.querySelector('.si-back').addEventListener('click', function () { step = 1; s2.hidden = true; s1.hidden = false; err.textContent = ''; busy(false, 'Send me a code'); em.focus(); });
      f.addEventListener('submit', function (e) {
        e.preventDefault(); err.textContent = '';
        if (step === 1) {
          email = em.value.trim();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Enter a valid email address.'; em.focus(); return; }
          busy(true, 'Sending…');
          post('login_code', { email: email }).then(function (j) {
            if (!j.ok) { busy(false, 'Send me a code'); err.textContent = j.error || 'Could not send the code. Try again.'; return; }
            step = 2; s1.hidden = true; s2.hidden = false;
            f.querySelector('.si-sent').textContent = 'We sent a code to ' + email + '. Check your inbox (and spam).';
            if (j.dev_code) code.value = j.dev_code;
            busy(false, 'Sign in and continue'); code.focus();
          }).catch(function () { busy(false, 'Send me a code'); err.textContent = 'No connection. Try again.'; });
          return;
        }
        busy(true, 'Signing in…');
        post('login_verify', { email: email, code: code.value }).then(function (j) {
          if (!j.ok) { busy(false, 'Sign in and continue'); err.textContent = j.error || 'That code is not right.'; code.focus(); return; }
          var body = opts.kind === 'biodata' ? { bios: [opts.t] } : { invites: [opts.t] };
          return post('claim', body).catch(function () {}).then(function () { close(); resolve(email); });
        }).catch(function () { busy(false, 'Sign in and continue'); err.textContent = 'No connection. Try again.'; });
      });
    });
  }
  w.WLSignin = { ask: signin };
})(window, document);
