/* VINAYA — the only script on the site. Everything works without it; it adds the
   mobile menu, slow reveal-on-scroll, the header background and form validation. */
(function () {
  'use strict';

  var doc = document;

  /* ---------------------------------------------------------------- header */

  var header = doc.querySelector('[data-header]');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------------------------------------------------------- floating enquire button */

  var floatCta = doc.querySelector('[data-float-cta]');
  var footer = doc.querySelector('.site-footer');
  if (floatCta) {
    var placeCta = function () {
      var nearEnd = footer && footer.getBoundingClientRect().top < window.innerHeight;
      floatCta.classList.toggle('is-shown', window.scrollY > window.innerHeight * 0.7 && !nearEnd);
    };
    placeCta();
    window.addEventListener('scroll', placeCta, { passive: true });
  }

  /* ---------------------------------------------------------------- mobile menu */

  var toggle = doc.querySelector('[data-menu-toggle]');
  var nav = doc.querySelector('[data-nav]');
  var desktop = window.matchMedia('(min-width: 960px)');

  function setMenu(open, returnFocus) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    doc.body.classList.toggle('menu-open', open);
    if (open) {
      var first = nav.querySelector('a');
      if (first) first.focus();
    } else if (returnFocus) {
      toggle.focus();
    }
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true', true);
    });

    doc.addEventListener('keydown', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        setMenu(false, true);
        return;
      }
      // Keep keyboard focus inside the open menu.
      if (e.key === 'Tab') {
        var items = [toggle].concat(Array.prototype.slice.call(nav.querySelectorAll('a')));
        var firstItem = items[0];
        var lastItem = items[items.length - 1];
        if (e.shiftKey && doc.activeElement === firstItem) {
          e.preventDefault();
          lastItem.focus();
        } else if (!e.shiftKey && doc.activeElement === lastItem) {
          e.preventDefault();
          firstItem.focus();
        }
      }
    });

    var closeOnDesktop = function () {
      if (desktop.matches) setMenu(false, false);
    };
    if (desktop.addEventListener) desktop.addEventListener('change', closeOnDesktop);
  }

  /* ---------------------------------------------------------------- parallax */

  // Elements with data-parallax="<speed>" drift slightly as the page scrolls.
  var floaters = doc.querySelectorAll('[data-parallax]');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (floaters.length && !calm) {
    var ticking = false;
    var drift = function () {
      var vh = window.innerHeight;
      floaters.forEach(function (el) {
        var box = el.getBoundingClientRect();
        if (box.bottom < -200 || box.top > vh + 200) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        var offset = (box.top + box.height / 2 - vh / 2) * speed;
        el.style.setProperty('--py', offset.toFixed(1) + 'px');
      });
      ticking = false;
    };
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(drift);
        }
      },
      { passive: true }
    );
    drift();
  }

  /* ---------------------------------------------------------------- reveal on scroll */

  var revealables = doc.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    );
    revealables.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealables.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------------------------------------------------------------- enquiry form */

  var form = doc.querySelector('[data-enquiry-form]');
  if (!form) return;

  var messages = JSON.parse(form.getAttribute('data-messages') || '{}');
  var success = doc.getElementById('enquiry-sent');
  var failure = doc.getElementById('enquiry-error');
  var summary = form.querySelector('[data-form-summary]');
  var submit = form.querySelector('[type="submit"]');
  var submitLabel = submit ? submit.textContent : '';
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE = /^[+()\d\s.\-]{6,24}$/;

  // Preselect the product when arriving from a product page (?product=<slug>).
  var params = new URLSearchParams(window.location.search);
  var wanted = params.get('product');
  if (wanted) {
    var option = form.querySelector('option[data-slug="' + wanted.replace(/[^a-z0-9-]/gi, '') + '"]');
    if (option) option.selected = true;
  }

  function fieldError(input) {
    var value = input.value.trim();
    if (input.required && !value) return messages.required;
    if (value && input.type === 'email' && !EMAIL.test(value)) return messages.email;
    if (value && input.type === 'tel' && !PHONE.test(value)) return messages.phone;
    return '';
  }

  function showError(input, message) {
    var box = doc.getElementById(input.id + '-error');
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    if (box) {
      box.textContent = message;
      box.hidden = !message;
    }
  }

  var inputs = Array.prototype.slice.call(form.querySelectorAll('input:not([type="hidden"]):not([tabindex="-1"]), select, textarea'));

  inputs.forEach(function (input) {
    // Validate after the visitor leaves a field, then live while they correct it.
    input.addEventListener('blur', function () {
      if (input.value.trim() || input.getAttribute('aria-invalid')) showError(input, fieldError(input));
    });
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid')) showError(input, fieldError(input));
    });
  });

  function setBusy(busy) {
    if (!submit) return;
    submit.disabled = busy;
    submit.textContent = busy ? messages.sending : submitLabel;
  }

  function showFailure(message) {
    if (!failure) return;
    var text = failure.querySelector('[data-error-text]');
    if (text && message) text.textContent = message;
    failure.classList.add('is-shown');
    failure.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (failure) failure.classList.remove('is-shown');

    var firstInvalid = null;
    inputs.forEach(function (input) {
      var message = fieldError(input);
      showError(input, message);
      if (message && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      if (summary) {
        summary.textContent = messages.summary;
        summary.hidden = false;
      }
      firstInvalid.focus();
      return;
    }
    if (summary) summary.hidden = true;

    setBusy(true);
    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    })
      .then(function (res) {
        return res.json().catch(function () {
          return { ok: false };
        });
      })
      .then(function (data) {
        setBusy(false);
        if (data && data.ok) {
          form.reset();
          if (success) {
            success.classList.add('is-shown');
            success.focus();
            success.scrollIntoView({ block: 'center' });
          }
        } else {
          showFailure(data && data.error === 'not_configured' ? messages.notConfigured : messages.server);
        }
      })
      .catch(function () {
        setBusy(false);
        showFailure(messages.server);
      });
  });

  // "Send another enquiry" brings the form back.
  var again = doc.querySelector('[data-enquiry-again]');
  if (again && success) {
    again.addEventListener('click', function (e) {
      e.preventDefault();
      // Arrived here from the no-JavaScript fallback (#enquiry-sent): reload a clean form.
      if (window.location.hash === '#enquiry-sent') {
        window.location.href = window.location.pathname;
        return;
      }
      success.classList.remove('is-shown');
      var first = form.querySelector('input:not([type="hidden"])');
      if (first) first.focus();
    });
  }
})();
