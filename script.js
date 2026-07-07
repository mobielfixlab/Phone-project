/* Mobile Fix Lab — site behavior
   Nav state, mobile menu, scroll-reveal animations, form UX. */

(function () {
  "use strict";

  /* ---------- Sticky nav shadow on scroll ---------- */
  const nav = document.getElementById("nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile hamburger menu ---------- */
  const hamburger = document.getElementById("hamburger");
  const navMobile = document.getElementById("navMobile");
  if (hamburger && navMobile) {
    hamburger.addEventListener("click", () => {
      const open = navMobile.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", String(open));
      hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    // Close the menu when a link is chosen or focus leaves via Escape
    navMobile.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        navMobile.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMobile.classList.contains("open")) {
        navMobile.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.focus();
      }
    });
  }

  /* ---------- Reveal-on-scroll ---------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && !reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Booking date: block past dates ---------- */
  const dateInput = document.getElementById("b-date");
  if (dateInput) {
    dateInput.min = new Date().toISOString().split("T")[0];
  }

  /* ---------- Before / after comparison sliders ---------- */
  document.querySelectorAll(".ba-slider").forEach((slider) => {
    const range = slider.querySelector(".ba-range");
    if (!range) return;
    const update = () => slider.style.setProperty("--pos", range.value + "%");
    range.addEventListener("input", update);
    update();
  });

  /* ---------- Forms: AJAX submit with inline feedback ---------- */
  function wireForm(form) {
    const feedback = form.querySelector(".form-feedback");
    const submitBtn = form.querySelector('[type="submit"]');

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      const originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      if (feedback) {
        feedback.textContent = "";
        feedback.classList.remove("ok", "err");
      }

      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Request failed: " + res.status);

        form.reset();
        if (feedback) {
          feedback.textContent = "✓ Thanks! We received your request and will get back to you shortly.";
          feedback.classList.add("ok");
        }
      } catch (err) {
        if (feedback) {
          feedback.textContent = "Something went wrong sending your request. Please try again, or call (704) 615-4536.";
          feedback.classList.add("err");
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });
  }

  document.querySelectorAll("#bookingForm, #contactForm").forEach(wireForm);
})();
