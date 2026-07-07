/* ============================================================
   MOBILE FIX LAB — interactions
   Lenis smooth scroll · GSAP ScrollTrigger · scroll-scrubbed
   video · 3D tilt · counters · nav · reveals
   ============================================================ */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(pointer: coarse)').matches;
  var isMobile = window.matchMedia('(max-width: 768px)').matches;

  /* ---------- GSAP setup ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  if (hasGsap && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
    }
  }

  /* ---------- Navbar ---------- */
  var nav = document.querySelector('.nav');
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  function onScrollNav() {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var delay = parseFloat(entry.target.getAttribute('data-delay') || 0);
            setTimeout(function () { entry.target.classList.add('is-visible'); }, delay * 1000);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Hero parallax (mouse) ---------- */
  var hero = document.querySelector('.hero');
  if (hero && !isTouch && !prefersReducedMotion && hasGsap) {
    var blobs = hero.querySelectorAll('.hero-blob');
    var phone = hero.querySelector('.hero-phone');
    var content = hero.querySelector('.hero-content');

    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;   // -0.5 … 0.5
      var y = (e.clientY - r.top) / r.height - 0.5;

      blobs.forEach(function (b, i) {
        var depth = (i + 1) * 14;
        gsap.to(b, { x: x * depth * 2, y: y * depth * 2, duration: 1.4, ease: 'power2.out' });
      });
      if (phone) {
        gsap.to(phone, {
          x: x * -30, y: y * -22,
          rotateY: x * 10, rotateX: y * -8,
          transformPerspective: 800,
          duration: 1.2, ease: 'power2.out'
        });
      }
      if (content) {
        gsap.to(content, { x: x * 10, y: y * 8, duration: 1.6, ease: 'power2.out' });
      }
    });
  }

  /* ---------- Scroll-scrubbed video ---------- */
  /* Desktop: pinned section, video currentTime tied to scroll.
     Mobile/reduced-motion: slowed autoplay when in view (fallback). */
  document.querySelectorAll('[data-scrub]').forEach(function (section) {
    var video = section.querySelector('video');
    if (!video) return;

    var captions = section.querySelectorAll('.sv-caption');
    var progressBar = section.querySelector('.scrollvideo-progress .bar');

    function fallbackAutoplay() {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.playbackRate = 0.5; // cinematic slow-down
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) video.play().catch(function () {});
          else video.pause();
        });
      }, { threshold: 0.3 });
      vio.observe(video);
      // show captions via staggered reveal instead of scrub timing
      captions.forEach(function (c, i) {
        c.classList.add('reveal');
        c.setAttribute('data-delay', (0.25 * i).toFixed(2));
        c.style.opacity = '';
        c.style.transform = '';
      });
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.1 });
      captions.forEach(function (c) { cio.observe(c); });
    }

    if (prefersReducedMotion || isMobile || !hasGsap || typeof ScrollTrigger === 'undefined') {
      fallbackAutoplay();
      return;
    }

    video.pause();
    video.muted = true;
    video.playsInline = true;

    var setupScrub = function () {
      var duration = video.duration;
      if (!duration || !isFinite(duration)) { fallbackAutoplay(); return; }

      var target = 0;   // target time from scroll
      var current = 0;  // lerped time actually applied

      var st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=100%', // one screen of scrolling (~2-3 wheel flicks) plays the whole clip
        pin: section.querySelector('.scrollvideo-pin'),
        scrub: true,
        anticipatePin: 1,
        onUpdate: function (self) {
          target = self.progress * duration;
          if (progressBar) progressBar.style.transform = 'scaleX(' + self.progress + ')';

          // captions keyed to progress
          captions.forEach(function (c) {
            var at = parseFloat(c.getAttribute('data-at') || 0);
            var until = parseFloat(c.getAttribute('data-until') || (at + 0.3));
            var active = self.progress >= at && self.progress <= until;
            gsap.to(c, {
              opacity: active ? 1 : 0,
              y: active ? 0 : 24,
              duration: 0.5,
              ease: 'power3.out',
              overwrite: 'auto'
            });
          });
        }
      });

      // smooth the seek with a lerp so scrubbing feels fluid, not steppy
      gsap.ticker.add(function () {
        current += (target - current) * 0.2;
        if (Math.abs(current - target) > 0.001 && video.readyState >= 2) {
          try { video.currentTime = current; } catch (e) {}
        }
      });

      return st;
    };

    // full download only on the desktop scrub path — mobile fallback streams on demand
    video.preload = 'auto';
    if (video.readyState >= 1) setupScrub();
    else video.addEventListener('loadedmetadata', setupScrub, { once: true });
    video.load();
  });

  /* ---------- Plain autoplay-in-view videos ---------- */
  document.querySelectorAll('video[data-autoplay-view]').forEach(function (video) {
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.playbackRate = parseFloat(video.getAttribute('data-rate') || 0.65);
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) video.play().catch(function () {});
        else video.pause();
      });
    }, { threshold: 0.25 });
    vio.observe(video);
  });

  /* ---------- 3D tilt cards ---------- */
  if (!isTouch && !prefersReducedMotion) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var bounds = null;
      card.addEventListener('mouseenter', function () {
        bounds = card.getBoundingClientRect();
      });
      card.addEventListener('mousemove', function (e) {
        if (!bounds) bounds = card.getBoundingClientRect();
        var x = (e.clientX - bounds.left) / bounds.width;
        var y = (e.clientY - bounds.top) / bounds.height;
        card.style.setProperty('--mx', (x * 100) + '%');
        card.style.setProperty('--my', (y * 100) + '%');
        var rx = (0.5 - y) * 8;
        var ry = (x - 0.5) * 8;
        card.style.transform =
          'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () {
        bounds = null;
        card.style.transform = '';
      });
    });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var animateCount = function (el) {
      var end = parseFloat(el.getAttribute('data-count'));
      var decimals = parseInt(el.getAttribute('data-decimals') || 0, 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1800;
      var startTs = null;

      if (prefersReducedMotion) {
        el.textContent = end.toFixed(decimals) + suffix;
        return;
      }
      function frame(ts) {
        if (!startTs) startTs = ts;
        var p = Math.min((ts - startTs) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 4); // ease-out quart
        el.textContent = (end * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    };
    var cio2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio2.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio2.observe(c); });
  }

  /* ---------- Hero entrance timeline ---------- */
  if (hero && hasGsap && !prefersReducedMotion) {
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.hero-badge', { y: 24, opacity: 0, duration: 0.9 }, 0.1)
      .from('.hero-title', { y: 60, opacity: 0, duration: 1.2 }, 0.22)
      .from('.hero .lead', { y: 32, opacity: 0, duration: 1 }, 0.42)
      .from('.hero-ctas', { y: 24, opacity: 0, duration: 0.9 }, 0.58)
      .from('.hero-scroll-hint', { opacity: 0, duration: 1 }, 1.0);
  }

  /* ---------- Booking form (demo submit) ---------- */
  var form = document.querySelector('#booking-form');
  if (form) {
    // preferred date: today or later
    var dateInput = form.querySelector('input[type="date"]');
    if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var firstInvalid = null;

      form.querySelectorAll('[required]').forEach(function (input) {
        var field = input.closest('.field');
        var isEmail = input.type === 'email';
        var bad = !input.value.trim() ||
          (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value));
        if (bad) {
          valid = false;
          if (field) field.classList.add('invalid');
          if (!firstInvalid) firstInvalid = input;
        } else if (field) {
          field.classList.remove('invalid');
        }
      });

      if (!valid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      var success = document.querySelector('.form-success');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (!res.ok) throw new Error('Request failed: ' + res.status);
        form.reset();
        if (success) {
          success.classList.add('show');
          success.setAttribute('tabindex', '-1');
          success.focus();
        }
      }).catch(function () {
        alert('Something went wrong sending your request. Please try again, or call (704) 615-4536.');
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = 'Book a Repair'; }
      });
    });

    // clear error state as user types
    form.querySelectorAll('input, select, textarea').forEach(function (input) {
      input.addEventListener('blur', function () {
        var field = input.closest('.field');
        if (field && input.value.trim()) field.classList.remove('invalid');
      });
    });
  }

  /* ---------- Before / after comparison sliders ---------- */
  document.querySelectorAll('.ba-slider').forEach(function (slider) {
    var range = slider.querySelector('.ba-range');
    if (!range) return;
    var update = function () { slider.style.setProperty('--pos', range.value + '%'); };
    range.addEventListener('input', update);
    update();
  });

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
