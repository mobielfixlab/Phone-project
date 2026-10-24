(function () {
  'use strict';

  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var first = null;
      form.querySelectorAll('[required]').forEach(function (input) {
        var field = input.closest('.field');
        var bad = !input.value.trim();
        if (bad) {
          valid = false;
          if (field) field.classList.add('invalid');
          if (!first) first = input;
        } else if (field) field.classList.remove('invalid');
      });
      if (!valid) {
        if (first) first.focus();
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : '';
      var success = form.parentElement.querySelector('.form-success');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (!res.ok) throw new Error('fail');
        form.reset();
        if (success) {
          success.classList.add('show');
          success.setAttribute('tabindex', '-1');
          success.focus();
        }
      }).catch(function () {
        alert('Could not send. Please call (704) 615-4536.');
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = label; }
      });
    });
  }
})();
