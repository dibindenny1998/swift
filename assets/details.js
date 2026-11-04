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
})(window, document);
