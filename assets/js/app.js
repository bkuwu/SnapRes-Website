/* =========================================================================
   SnapRes — shared site behavior
   ========================================================================= */
(function () {
  "use strict";

  var CFG = window.SNAPRES_CONFIG || {};
  var root = document.documentElement;

  /* ---------------------------------------------------------------------
     Config-driven links — every href tagged data-cfg gets its value from
     assets/js/config.js. Edit that ONE file to change links site-wide.
     --------------------------------------------------------------------- */
  function applyConfig() {
    document.querySelectorAll("[data-cfg]").forEach(function (el) {
      var key = el.getAttribute("data-cfg");
      if (key === "CONTACT_EMAIL" && CFG.CONTACT_EMAIL) {
        el.setAttribute("href", "mailto:" + CFG.CONTACT_EMAIL);
        if (el.hasAttribute("data-cfg-text")) el.textContent = CFG.CONTACT_EMAIL;
      } else if (CFG[key]) {
        el.setAttribute("href", CFG[key]);
      }
    });
    document.querySelectorAll("[data-cfg-text]").forEach(function (el) {
      var key = el.getAttribute("data-cfg-text");
      if (CFG[key]) el.textContent = CFG[key];
    });
  }

  /* ---------------------------------------------------------------------
     Theme — mirrors THEMES["dark"/"light"] from SnapRes.py
     --------------------------------------------------------------------- */
  function syncLogos() {
    var theme = root.getAttribute("data-theme");
    // Logo_Dark.png is the light-stroke mark made for dark backgrounds;
    // Logo_Main.png is the dark-stroke mark made for light backgrounds —
    // swap so the wordmark stays legible in both themes.
    document.querySelectorAll("[data-logo], [data-shot]").forEach(function (img) {
      img.src = theme === "dark" ? img.getAttribute("data-src-dark") : img.getAttribute("data-src-light");
    });
  }

  function initTheme() {
    var saved = localStorage.getItem("snapres-theme");
    var theme = saved || "dark";
    root.setAttribute("data-theme", theme);
    syncLogos();
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cur = root.getAttribute("data-theme");
        var next = cur === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem("snapres-theme", next);
        syncLogos();
      });
    });
  }

  /* ---------------------------------------------------------------------
     i18n
     --------------------------------------------------------------------- */
  function initLang() {
    var LANGS = window.SNAPRES_LANGS || [];
    var DICT = window.SNAPRES_I18N || {};
    var saved = localStorage.getItem("snapres-lang");
    var browser = (navigator.language || "en").slice(0, 2);
    var lang = saved || (DICT[browser] ? browser : "en");

    function apply(code) {
      var d = DICT[code] || DICT.en;
      document.querySelectorAll("[data-i18n]").forEach(function (el) {
        var key = el.getAttribute("data-i18n");
        if (d[key]) el.textContent = d[key];
      });
      document.documentElement.lang = code;
      document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
      document.querySelectorAll("[data-lang-label]").forEach(function (el) {
        var match = LANGS.find(function (l) { return l.code === code; });
        el.textContent = match ? match.label : "English";
      });
      document.querySelectorAll(".lang-select__opt").forEach(function (opt) {
        opt.classList.toggle("is-active", opt.getAttribute("data-lang") === code);
      });
    }

    // build menu(s)
    document.querySelectorAll("[data-lang-menu]").forEach(function (menu) {
      LANGS.forEach(function (l) {
        var btn = document.createElement("button");
        btn.className = "lang-select__opt";
        btn.type = "button";
        btn.setAttribute("data-lang", l.code);
        btn.textContent = l.label;
        btn.addEventListener("click", function () {
          lang = l.code;
          localStorage.setItem("snapres-lang", lang);
          apply(lang);
          menu.closest(".lang-select").classList.remove("is-open");
        });
        menu.appendChild(btn);
      });
    });

    document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        btn.closest(".lang-select").classList.toggle("is-open");
      });
    });
    document.addEventListener("click", function () {
      document.querySelectorAll(".lang-select.is-open").forEach(function (el) {
        el.classList.remove("is-open");
      });
    });

    apply(lang);
  }

  /* ---------------------------------------------------------------------
     Nav: scroll shadow + mobile menu + active link
     --------------------------------------------------------------------- */
  function initNav() {
    var nav = document.querySelector(".nav");
    if (!nav) return;
    var onScroll = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var burger = document.querySelector("[data-nav-burger]");
    var links = document.querySelector("[data-nav-links]");
    if (burger && links) {
      burger.addEventListener("click", function () {
        links.classList.toggle("is-open");
      });
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { links.classList.remove("is-open"); });
      });
    }

    var here = (document.body.getAttribute("data-page") || "home");
    document.querySelectorAll(".nav__link").forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("data-page") === here);
    });
  }

  /* ---------------------------------------------------------------------
     Scroll reveals + snap-frames
     --------------------------------------------------------------------- */
  function initReveals() {
    var targets = document.querySelectorAll(".reveal, .snapframe");
    if (!("IntersectionObserver" in window) || !targets.length) {
      targets.forEach(function (t) { t.classList.add("is-in", "is-snapped"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        var show = entry.isIntersecting;
        // an element can carry BOTH classes (e.g. a screenshot frame that's
        // also a fade target) — toggle each independently, and toggle both
        // ways so things fade back out on scroll-away, not just in once.
        if (el.classList.contains("reveal")) el.classList.toggle("is-in", show);
        if (el.classList.contains("snapframe")) el.classList.toggle("is-snapped", show);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -60px 0px" });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ---------------------------------------------------------------------
     Page transition veil — fades out before internal navigation so page
     changes feel like one continuous, "smooth" experience rather than a
     hard reload.
     --------------------------------------------------------------------- */
  function initTransitions() {
    var veil = document.querySelector(".page-veil");
    document.body.classList.add("is-loaded");
    if (!veil) return;
    document.querySelectorAll("a[href]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || a.target === "_blank" || a.hasAttribute("data-cfg")) return;
      if (href.indexOf("http") === 0 || href.indexOf("mailto:") === 0) return;
      a.addEventListener("click", function (e) {
        e.preventDefault();
        veil.classList.add("is-active");
        setTimeout(function () { window.location.href = href; }, 320);
      });
    });
  }

  /* ---------------------------------------------------------------------
     Contact form — no backend on this site, so this opens the visitor's
     email client with the message pre-filled, addressed to CONTACT_EMAIL.
     --------------------------------------------------------------------- */
  function initContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (form.querySelector("[data-cf-name]") || {}).value || "";
      var email = (form.querySelector("[data-cf-email]") || {}).value || "";
      var msg = (form.querySelector("[data-cf-message]") || {}).value || "";
      var to = CFG.CONTACT_EMAIL || "";
      var subject = "SnapRes — message from " + (name.trim() || "the website");
      var body = msg.trim() + "\n\n— " + name.trim() + (email.trim() ? " (" + email.trim() + ")" : "");
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    applyConfig();
    initTheme();
    initLang();
    initNav();
    initReveals();
    initTransitions();
    initContactForm();
  });
})();
