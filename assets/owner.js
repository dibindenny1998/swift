(function () {
  'use strict';
  var C = window.WL_OWNER;
  var pv = document.getElementById('pv');
  var plan = C.paid ? C.plan : 'premium';
  var first = true;

  function paint() {
    try {
      var d = Object.assign({}, C.data, { plan: plan });
      pv.contentWindow.wlRender(d, first ? { mode: C.paid ? 'demo' : 'preview', cover: true } : { mode: C.paid ? 'demo' : 'preview', keepScroll: true });
      first = false;
    } catch (e) {}
  }
  pv.addEventListener('load', paint);

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
      var label = 'Pay ₹' + C.prices[plan] + ' and publish';
      payBtn.textContent = label; if (mPay) mPay.textContent = label;
      paint();
    });
  });
  if (mPay) mPay.addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('plans').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(function () { payBtn.focus(); }, 500);
  });

  // payment
  var rzpLoaded = null;
  function loadRzp() {
    if (window.Razorpay) return Promise.resolve();
    if (rzpLoaded) return rzpLoaded;
    rzpLoaded = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = res; s.onerror = function () { rzpLoaded = null; rej(new Error('Could not load the payment window. Check your connection and try again.')); };
      document.head.appendChild(s);
    });
    return rzpLoaded;
  }
  if (C.live && !C.paid) loadRzp().catch(function () {});

  function startPay(btn, chosen) {
    var err = document.getElementById('pay-err');
    var original = btn.textContent;
    err.textContent = '';
    btn.disabled = true; btn.textContent = 'Opening payment…';
    var value = C.paid ? C.upgrade : C.prices[chosen];
    try { fbq('track', 'InitiateCheckout', { value: value, currency: 'INR' }); } catch (e) {}
    function reset(msg) { btn.disabled = false; btn.textContent = original; if (msg) err.textContent = msg; }

    post('/api.php?a=order', { t: C.t, plan: chosen }).then(function (o) {
      if (!o.ok) return reset(o.error);
      if (o.demo) {
        btn.textContent = 'Publishing…';
        return post('/api.php?a=demo_pay', { t: C.t, plan: chosen }).then(function (r) {
          if (r.ok) location.reload(); else reset(r.error);
        });
      }
      return loadRzp().then(function () {
        var rzp = new Razorpay({
          key: o.key, amount: o.amount, currency: o.currency, name: o.name, description: o.description, order_id: o.order_id,
          prefill: o.prefill, theme: { color: '#C2183F' }, retry: { enabled: true },
          handler: function (resp) {
            btn.textContent = 'Confirming payment…';
            post('/api.php?a=verify', Object.assign({ t: C.t }, resp)).then(function (v) {
              if (v.ok) location.reload();
              else reset(v.error + ' If money was taken, refresh this page in a minute.');
            }).catch(function () { reset('We could not confirm the payment yet. Refresh this page in a minute.'); });
          },
          modal: { ondismiss: function () { reset(); } }
        });
        rzp.on('payment.failed', function (r) { reset('Payment failed: ' + ((r.error && r.error.description) || 'try another method.')); });
        rzp.open();
      });
    }).catch(function (x) { reset(x && x.message ? x.message : 'No connection. Try again.'); });
  }

  if (payBtn) payBtn.addEventListener('click', function () { startPay(payBtn, plan); });
  var up = document.getElementById('upgrade');
  if (up) up.addEventListener('click', function () { startPay(up, 'premium'); });
})();
