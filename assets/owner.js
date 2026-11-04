(function () {
  'use strict';
  var C = window.WL_OWNER;
  if (/[?&]payfail=1/.test(location.search)) setTimeout(function () { var e = document.getElementById('pay-err'); if (e) { e.textContent = 'The payment did not go through, and no money was taken. Please try again.'; e.scrollIntoView({ block: 'center' }); } history.replaceState(null, '', location.pathname); }, 400);
  window.WL_STATES = C.states;
  function done() { location.href = location.pathname + '?published=1'; }
  var pv = document.getElementById('pv');
  var plan = C.paid ? C.plan : (C.defaultPlan || 'premium');
  var first = true;

  function paint() {
    try {
      var d = Object.assign({}, C.data, { plan: plan });
      pv.contentWindow.wlRender(d, first ? { mode: C.paid ? 'demo' : 'preview', cover: true } : { mode: C.paid ? 'demo' : 'preview', keepScroll: true });
      first = false;
    } catch (e) {}
  }
  pv.addEventListener('load', paint);

  // change design right here: repaint now, save in the background, update which plans fit
  var dmsg = document.getElementById('design-msg');
  function fitPlans(tier) {
    document.querySelectorAll('.plan-opt').forEach(function (o) {
      var inp = o.querySelector('input'), ok = C.rank[inp.value] >= C.rank[tier];
      inp.disabled = !ok; o.classList.toggle('off', !ok);
      var why = o.querySelector('.why'); if (why) { why.hidden = ok; why.querySelector('.why-tier').textContent = C.tierNames[tier]; }
      if (!ok && inp.checked) { var p = document.querySelector('input[name=plan][value=premium]'); p.checked = true; p.dispatchEvent(new Event('change')); }
    });
  }
  document.querySelectorAll('.ds').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.classList.contains('locked')) { dmsg.textContent = 'Upgrade to use this design.'; var up = document.querySelector('.js-up'); if (up) up.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      var prev = C.data.theme;
      document.querySelectorAll('.ds').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      C.data.theme = b.dataset.theme; first = true; paint();
      if (!C.paid) fitPlans(b.dataset.tier);
      dmsg.textContent = 'Saving…';
      post('/api.php?a=theme', { t: C.t, theme: b.dataset.theme }).then(function (r) {
        if (r.ok) { dmsg.textContent = 'Saved'; setTimeout(function () { if (dmsg.textContent === 'Saved') dmsg.textContent = ''; }, 1500); }
        else { dmsg.textContent = r.error || 'Could not save.'; C.data.theme = prev; first = true; paint(); }
      }).catch(function () { dmsg.textContent = 'No connection. Try again.'; });
    });
  });

  var toast = document.getElementById('toast');
  if (toast) setTimeout(function () { toast.remove(); }, 2600);

  function post(url, body) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'Unexpected reply from the server (' + r.status + ').' }; }); });
  }

  if (C.purchase) {
    try { fbq('track', 'Purchase', { value: C.purchase.value, currency: 'INR', content_name: 'Wedding invite' }, { eventID: C.purchase.id }); } catch (e) {}
    post('/api.php?a=tracked', { t: C.t });
  }

  // copy link
  var copy = document.getElementById('copy');
  if (copy) copy.addEventListener('click', function () {
    var inp = document.getElementById('link');
    inp.select();
    (navigator.clipboard ? navigator.clipboard.writeText(inp.value) : Promise.reject()).catch(function () { document.execCommand('copy'); });
    copy.textContent = 'Copied';
    setTimeout(function () { copy.textContent = 'Copy'; }, 1800);
  });

  // plan choice
  var payBtn = document.getElementById('pay'), mPay = document.getElementById('m-pay');
  document.querySelectorAll('input[name=plan]').forEach(function (r) {
    r.addEventListener('change', function () {
      plan = r.value;
      var label = plan === 'free' ? 'Publish free' : 'Pay ₹' + C.prices[plan] + ' and publish';
      payBtn.textContent = label; if (mPay) mPay.textContent = label;
      paint();
    });
  });
  if (mPay) mPay.addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('plans').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(function () { payBtn.focus(); }, 500);
  });

  // payment: PayU hosted checkout (the customer goes to PayU's page and comes back here)
  function goPayU(pu) {
    var f = document.createElement('form'); f.method = 'POST'; f.action = pu.action;
    Object.keys(pu.fields).forEach(function (k) { var i = document.createElement('input'); i.type = 'hidden'; i.name = k; i.value = pu.fields[k]; f.appendChild(i); });
    document.body.appendChild(f); f.submit();
  }

  function startPay(btn, chosen) {
    var err = document.getElementById('pay-err');
    var original = btn.textContent;
    err.textContent = '';
    btn.disabled = true; btn.textContent = 'Opening payment…';
    var value = C.paid ? (C.upgrades[chosen] || 0) : C.prices[chosen];
    try { fbq('track', 'InitiateCheckout', { value: value, currency: 'INR' }); } catch (e) {}
    function reset(msg) { btn.disabled = false; btn.textContent = original; if (msg) err.textContent = msg; }

    if (chosen === 'free') {
      btn.textContent = 'Publishing…';
      return post('/api.php?a=publish_free', { t: C.t }).then(function (r) {
        if (r.ok) { try { fbq('track', 'CompleteRegistration', { content_name: 'Free invite' }); } catch (e) {} done(); }
        else reset(r.error);
      }).catch(function () { reset('No connection. Try again.'); });
    }

    // name, mobile and address first (asked once)
    WLDetails.ask({ kind: 'invite', t: C.t, have: C.hasDetails, prefill: C.prefill }).then(function () {
      C.hasDetails = true; btn.textContent = 'Opening payment…';
      return post('/api.php?a=order', { t: C.t, plan: chosen });
    }, function () { reset(); throw null; }).then(function (o) {
      if (!o) return;
      if (o.need_details) { C.hasDetails = false; return reset('Add your details to continue.'); }
      if (!o.ok) return reset(o.error);
      if (o.free) return done();
      if (o.demo) {
        btn.textContent = 'Publishing…';
        return post('/api.php?a=demo_pay', { t: C.t, plan: chosen }).then(function (r) {
          if (r.ok) done(); else reset(r.error);
        });
      }
      if (o.payu) { btn.textContent = 'Opening PayU…'; return goPayU(o.payu); }
      reset('Payment could not start. Try again.');
    }).catch(function (x) { if (x) reset(x.message ? x.message : 'No connection. Try again.'); });
  }

  // after publishing: a gentle prompt to upgrade (once)
  var up = document.getElementById('upsell');
  if (up && C.showUpsell) {
    up.hidden = false; document.documentElement.style.overflow = 'hidden';
    var closeUp = function () { up.hidden = true; document.documentElement.style.overflow = ''; };
    document.getElementById('up-x').addEventListener('click', closeUp);
    document.getElementById('up-later').addEventListener('click', closeUp);
    up.addEventListener('click', function (e) { if (e.target === up) closeUp(); });
  }
  if (C.showUpsell) history.replaceState(null, '', location.pathname);

  // referral link
  var rc = document.getElementById('ref-copy');
  if (rc) rc.addEventListener('click', function () {
    var inp = document.getElementById('ref-link'); inp.select();
    (navigator.clipboard ? navigator.clipboard.writeText(inp.value) : Promise.reject()).catch(function () { document.execCommand('copy'); });
    rc.textContent = 'Copied'; setTimeout(function () { rc.textContent = 'Copy'; }, 1800);
  });

  if (payBtn) payBtn.addEventListener('click', function () { startPay(payBtn, plan); });
  document.querySelectorAll('.js-up').forEach(function (b) {
    b.addEventListener('click', function () { startPay(b, b.dataset.plan); });
  });

  // gift list: let the couple free up a reserved gift
  document.querySelectorAll('.js-release').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!confirm('Make this gift available to other guests again?')) return;
      b.disabled = true;
      post('/api.php?a=gift_release', { t: C.t, claim: +b.dataset.claim }).then(function (r) { if (r.ok) location.reload(); else { b.disabled = false; alert(r.error || 'Could not update.'); } });
    });
  });
})();
