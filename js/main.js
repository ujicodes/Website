/* ==========================================================================
   Ignite Fitness Coaching — behavior
   Vanilla JS only: mobile nav, scroll-reveal animations, and client-side
   form validation. No build step, no dependencies.
   ========================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------------------------------------------------------------
   * Mobile navigation toggle
   * ------------------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var primaryNav = document.getElementById("primaryNav");

  function setNavOpen(isOpen) {
    navToggle.setAttribute("aria-expanded", String(isOpen));
    primaryNav.classList.toggle("is-open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setNavOpen(!isOpen);
    });

    // Close the mobile menu whenever a nav link is used.
    primaryNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNavOpen(false);
      });
    });

    // Close on Escape for keyboard users.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setNavOpen(false);
      }
    });
  }

  /* ---------------------------------------------------------------------
   * Smooth scroll for in-page links
   * (html { scroll-behavior: smooth } already covers plain #anchor clicks;
   * this loop just keeps focus management correct for accessibility —
   * moving focus to the target section after the jump.)
   * ------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"][data-scroll], a.nav-link[href^="#"]').forEach(
    function (link) {
      link.addEventListener("click", function (event) {
        var targetId = link.getAttribute("href");
        var target = targetId && document.querySelector(targetId);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });

        // Make the target section programmatically focusable, then focus it,
        // so keyboard/screen-reader users land where the page visually jumped to.
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    }
  );

  /* ---------------------------------------------------------------------
   * Scroll-reveal (fade-in-up) via IntersectionObserver
   * ------------------------------------------------------------------- */
  var revealTargets = document.querySelectorAll("[data-reveal]");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    // No motion preference support or no IO support: show everything immediately.
    revealTargets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // reveal once, don't re-trigger on scroll-back
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------------------------------------------------------------------
   * Contact form validation + submit handling
   *
   * There is no backend wired up yet: submitting shows an in-page success
   * message only. To actually receive messages, either:
   *   1. Point the <form> at a service like Formspree or Netlify Forms and
   *      remove the preventDefault() below, or
   *   2. Replace the "TODO: send to backend" block with a fetch() call to
   *      your own API endpoint.
   * ------------------------------------------------------------------- */
  var form = document.getElementById("contactForm");

  if (form) {
    var fields = {
      name: { input: form.querySelector("#name"), error: form.querySelector("#name-error") },
      email: { input: form.querySelector("#email"), error: form.querySelector("#email-error") },
      message: { input: form.querySelector("#message"), error: form.querySelector("#message-error") },
    };
    var summary = document.getElementById("formSummary");
    var success = document.getElementById("formSuccess");

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setFieldError(field, message) {
      field.error.textContent = message || "";
      field.input.setAttribute("aria-invalid", message ? "true" : "false");
      field.input.setAttribute(
        "aria-describedby",
        message ? field.error.id : ""
      );
    }

    function validateField(key) {
      var field = fields[key];
      var value = field.input.value.trim();

      if (!value) {
        setFieldError(field, "This field is required.");
        return false;
      }
      if (key === "email" && !emailPattern.test(value)) {
        setFieldError(field, "Enter a valid email address.");
        return false;
      }
      setFieldError(field, "");
      return true;
    }

    // Validate on blur, not on every keystroke, per standard form-UX guidance.
    Object.keys(fields).forEach(function (key) {
      fields[key].input.addEventListener("blur", function () {
        validateField(key);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      success.hidden = true;
      summary.hidden = true;

      var results = Object.keys(fields).map(validateField);
      var allValid = results.every(Boolean);

      if (!allValid) {
        summary.textContent =
          "Please fix the highlighted fields before submitting.";
        summary.hidden = false;
        summary.focus();

        // Move focus to the first invalid field for a fast fix path.
        var firstInvalidKey = Object.keys(fields).find(
          function (key) { return fields[key].error.textContent; }
        );
        if (firstInvalidKey) {
          fields[firstInvalidKey].input.focus();
        }
        return;
      }

      // TODO: send to backend — see comment block above this handler.
      // Example once you have an endpoint:
      // fetch("/api/contact", { method: "POST", body: new FormData(form) });

      form.reset();
      success.hidden = false;
    });
  }

  /* ---------------------------------------------------------------------
   * Footer year
   * ------------------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
