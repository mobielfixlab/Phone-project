/* ── script.js ── */

// =========================================
// NAVIGATION SCROLL EFFECT
// =========================================
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// =========================================
// HAMBURGER MENU
// =========================================
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('navMobile');

if (hamburger && navMobile) {
  hamburger.addEventListener('click', () => {
    navMobile.classList.toggle('open');
  });

  // Close on link click
  navMobile.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navMobile.classList.remove('open'));
  });
}

// =========================================
// HERO SLIDER
// =========================================
const SLIDE_DURATION = 5500; // ms

function initSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots   = document.querySelectorAll('.slide-dot');
  const fill   = document.querySelector('.slide-progress-fill');

  if (!slides.length) return;

  let current = 0;
  let timer;
  let fillTimer;
  let paused = false;

  function goTo(index) {
    // Remove active from current
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('active');
    dots[current]?.classList.add('active');

    // Reset progress bar
    if (fill) {
      fill.style.transition = 'none';
      fill.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fill.style.transition = `width ${SLIDE_DURATION}ms linear`;
          fill.style.width = '100%';
        });
      });
    }
  }

  function start() {
    clearInterval(timer);
    timer = setInterval(() => {
      if (!paused) goTo(current + 1);
    }, SLIDE_DURATION);
  }

  // Dot clicks
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goTo(i);
      start(); // restart timer
    });
  });

  // Pause on hover
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mouseenter', () => paused = true);
    hero.addEventListener('mouseleave', () => paused = false);
  }

  // Init
  goTo(0);
  start();
}

// =========================================
// INTERSECTION OBSERVER — SCROLL REVEALS
// =========================================
function initReveal() {
  const els = document.querySelectorAll('.service-card, .bento-card, .price-card, .review-card, .stat');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = `opacity 0.6s ${i * 0.06}s ease, transform 0.6s ${i * 0.06}s ease`;
    obs.observe(el);
  });
}

// =========================================
// CONTACT FORM
// =========================================
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name    = form.querySelector('#cname')?.value.trim();
    const email   = form.querySelector('#cemail')?.value.trim();
    const message = form.querySelector('#cmessage')?.value.trim();
    const fb      = document.getElementById('contact-msg');

    if (!name || !email || !message) {
      showFeedback(fb, 'Please fill in all fields.', 'error');
      return;
    }

    // Simulate success
    showFeedback(fb, '✓ Message sent! We\'ll be in touch shortly.', 'success');
    form.reset();
  });
}

// =========================================
// BOOKING FORM
// =========================================
function initBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    const name   = document.getElementById('b-name')?.value.trim();
    const email  = document.getElementById('b-email')?.value.trim();
    const device = document.getElementById('b-device')?.value.trim();
    const repair = document.getElementById('b-repair')?.value.trim();
    const fb     = document.getElementById('booking-msg');

    if (!name || !email || !device || !repair) {
      e.preventDefault();
      showFeedback(fb, 'Please fill in all required fields.', 'error');
    }
  });
}

function showFeedback(el, msg, type) {
  if (!el) return;
  el.textContent = msg;
  el.className = 'form-feedback ' + type;
  setTimeout(() => {
    el.className = 'form-feedback';
    el.textContent = '';
  }, 5000);
}

// =========================================
// INIT
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  initReveal();
  initContactForm();
  initBookingForm();
});
