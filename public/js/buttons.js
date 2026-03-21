/**
 * All interactive controls: carousel arrows & thumbnails, Products menu, hero CTAs.
 */
(function (global) {
  "use strict";

  /* ---------- Product carousel (prev/next, thumbs, keyboard) ---------- */

  /**
   * One-time delegation on [data-carousel] so slides/thumbs can be replaced when the product changes.
   */
  function initProductCarousel() {
    var root = document.querySelector("[data-carousel]");
    if (!root || root.getAttribute("data-carousel-delegation") === "1") {
      return;
    }
    root.setAttribute("data-carousel-delegation", "1");

    var index = 0;

    function getTrack() {
      return root.querySelector("[data-carousel-track]");
    }

    function slideCount() {
      return root.querySelectorAll("[data-carousel-slide]").length;
    }

    function clamp(i) {
      var n = slideCount();
      if (n === 0) return 0;
      if (i < 0) return n - 1;
      if (i >= n) return 0;
      return i;
    }

    function updateTrack() {
      var track = getTrack();
      if (!track) return;
      track.style.transform = "translateX(" + -index * 100 + "%)";
    }

    function syncThumbs() {
      var thumbs = root.querySelectorAll("[data-carousel-thumb]");
      thumbs.forEach(function (btn, j) {
        var active = j === index;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
    }

    function goTo(i) {
      index = clamp(i);
      updateTrack();
      syncThumbs();
    }

    function next() {
      goTo(index + 1);
    }

    function prev() {
      goTo(index - 1);
    }

    function resetCarousel() {
      index = 0;
      updateTrack();
      syncThumbs();
    }

    root.addEventListener("click", function (e) {
      if (e.target.closest("[data-carousel-prev]")) {
        e.preventDefault();
        prev();
        return;
      }
      if (e.target.closest("[data-carousel-next]")) {
        e.preventDefault();
        next();
        return;
      }
      var thumb = e.target.closest("[data-carousel-thumb]");
      if (thumb) {
        e.preventDefault();
        var i = parseInt(thumb.getAttribute("data-carousel-thumb"), 10);
        if (!isNaN(i)) goTo(i);
      }
    });

    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    });

    global.MangalamPage = global.MangalamPage || {};
    global.MangalamPage.resetCarousel = resetCarousel;
    resetCarousel();
  }

  /* ---------- Header Products dropdown ---------- */

  function initProductsDropdown() {
    var root = document.querySelector("[data-products-dropdown]");
    if (!root) return;

    var trigger = root.querySelector("[data-dropdown-trigger]");
    var panel = root.querySelector("[data-dropdown-panel]");

    if (!trigger || !panel) return;

    function isOpen() {
      return !panel.hasAttribute("hidden");
    }

    function open() {
      root.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      panel.removeAttribute("hidden");
    }

    function close() {
      root.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      panel.setAttribute("hidden", "");
    }

    function toggle() {
      if (isOpen()) {
        close();
      } else {
        open();
      }
    }

    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      toggle();
    });

    document.addEventListener("click", function (e) {
      if (!root.contains(e.target)) {
        close();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) {
        close();
        trigger.focus();
      }
    });

    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        close();
      }
    });
  }

  /** Nav links with data-product-id swap the JSON-driven product body. */
  function initNavProductSwitching() {
    var panel = document.getElementById("navProductsPanel");
    if (!panel) return;
    panel.addEventListener("click", function (e) {
      var a = e.target.closest("a[data-product-id]");
      if (!a) return;
      e.preventDefault();
      var id = a.getAttribute("data-product-id");
      if (!id) return;
      var apply = global.MangalamPage && global.MangalamPage.applyProductById;
      if (typeof apply === "function") apply(id);
    });
  }

  /* ---------- Hero CTAs (Get Custom Quote, View Technical Specs) ---------- */

  function initProductCtas() {
    var root = document.querySelector("[data-product-ctas]");
    if (!root) return;

    var quoteBtn = root.querySelector("[data-cta-quote]");
    var specsBtn = root.querySelector("[data-cta-specs]");

    function isPlaceholderHash(href) {
      return !href || href === "#" || href === "#!";
    }

    if (quoteBtn) {
      quoteBtn.addEventListener("click", function (e) {
        var href = quoteBtn.getAttribute("href");
        if (isPlaceholderHash(href)) {
          e.preventDefault();
        }
        root.dispatchEvent(
          new CustomEvent("mangalam:quote-request", {
            bubbles: true,
            detail: { trigger: quoteBtn },
          })
        );
      });
    }

    if (specsBtn) {
      specsBtn.addEventListener("click", function (e) {
        var href = specsBtn.getAttribute("href");
        if (isPlaceholderHash(href)) {
          e.preventDefault();
        } else if (href && href.charAt(0) === "#") {
          var target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            e.preventDefault();
          }
        }
        root.dispatchEvent(
          new CustomEvent("mangalam:specs-request", {
            bubbles: true,
            detail: { trigger: specsBtn },
          })
        );
      });
    }
  }

  /* ---------- Lower folds: FAQ, catalogue strip, applications, process, scroll reveal ---------- */

  function initFaqAccordion() {
    var root = document.querySelector("[data-faq-section]");
    if (!root || root.getAttribute("data-faq-init") === "1") return;
    root.setAttribute("data-faq-init", "1");

    root.addEventListener("click", function (e) {
      var btn = e.target.closest(".faq-item__trigger");
      if (!btn || !root.contains(btn)) return;
      var item = btn.closest(".faq-item");
      var panel = item && item.querySelector(".faq-item__panel");
      if (!panel) return;

      var wasOpen = btn.getAttribute("aria-expanded") === "true";

      root.querySelectorAll(".faq-item").forEach(function (it) {
        var b = it.querySelector(".faq-item__trigger");
        var p = it.querySelector(".faq-item__panel");
        if (b) b.setAttribute("aria-expanded", "false");
        if (p) p.setAttribute("hidden", "");
        it.classList.remove("is-open");
      });

      if (!wasOpen) {
        btn.setAttribute("aria-expanded", "true");
        panel.removeAttribute("hidden");
        item.classList.add("is-open");
      }
    });
  }

  function initCatalogueInlineForm() {
    var form = document.getElementById("catalogueInlineForm");
    if (!form || form.getAttribute("data-catalogue-inline-init") === "1") return;
    form.setAttribute("data-catalogue-inline-init", "1");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var email = (fd.get("email") || "").toString().trim();
      var input = document.getElementById("catalogueInlineEmail");
      if (!email) {
        if (input) input.focus();
        return;
      }
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!ok) {
        if (input) input.focus();
        return;
      }
      var prefill = global.MangalamPage && global.MangalamPage.prefillCatalogueEmail;
      if (typeof prefill === "function") prefill(email);
      var openCat = global.MangalamPage && global.MangalamPage.openCatalogueModal;
      if (typeof openCat === "function") openCat();
    });
  }

  function initApplicationsCarousel() {
    var section = document.querySelector("[data-applications-section]");
    if (!section || section.getAttribute("data-apps-init") === "1") return;
    section.setAttribute("data-apps-init", "1");

    var viewport = section.querySelector(".applications-fold__viewport");
    var track = document.getElementById("applicationsTrack");
    if (!viewport || !track) return;

    function trackGapPx() {
      var st = getComputedStyle(track);
      var g = parseFloat(st.gap || st.columnGap || "0");
      return !isNaN(g) && g > 0 ? g : 20;
    }

    function stepPx() {
      var card = track.querySelector(".applications-fold__card");
      if (!card) return 328;
      return Math.round(card.getBoundingClientRect().width + trackGapPx());
    }

    function maxScrollLeft() {
      return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    }

    function smoothBehavior() {
      return global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth";
    }

    function scrollByStep(direction) {
      var max = maxScrollLeft();
      var step = stepPx();
      var behavior = smoothBehavior();
      if (max < 2) {
        return;
      }
      var left = viewport.scrollLeft;
      var target = left + direction * step;
      if (direction > 0 && target > max - 2) {
        target = 0;
      } else if (direction < 0 && left < 2) {
        target = max;
      } else {
        target = Math.max(0, Math.min(max, target));
      }
      viewport.scrollTo({ left: target, behavior: behavior });
    }

    section.addEventListener("click", function (e) {
      if (e.target.closest("[data-apps-prev]")) {
        e.preventDefault();
        scrollByStep(-1);
        return;
      }
      if (e.target.closest("[data-apps-next]")) {
        e.preventDefault();
        scrollByStep(1);
      }
    });

    viewport.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollByStep(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollByStep(1);
      }
    });
  }

  function initManufacturingTabs() {
    var tablist = document.getElementById("processTabs");
    if (!tablist || tablist.getAttribute("data-process-tabs-init") === "1") return;
    tablist.setAttribute("data-process-tabs-init", "1");

    function focusTab(index) {
      var btn = tablist.querySelector('[data-process-tab="' + index + '"]');
      if (btn) btn.focus();
    }

    tablist.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-process-tab]");
      if (!btn || !tablist.contains(btn)) return;
      var i = parseInt(btn.getAttribute("data-process-tab"), 10);
      if (isNaN(i)) return;
      var apply = global.MangalamPage && global.MangalamPage.applyManufacturingStep;
      if (typeof apply === "function") apply(i);
    });

    tablist.addEventListener("keydown", function (e) {
      var tabs = tablist.querySelectorAll("[data-process-tab]");
      if (!tabs.length) return;
      var n = tabs.length;
      var cur = global.MangalamPage._manufacturingActiveIndex;
      if (cur == null || isNaN(cur)) cur = 0;
      var next = cur;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        next = (cur + 1) % n;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        next = (cur - 1 + n) % n;
      } else if (e.key === "Home") {
        e.preventDefault();
        next = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        next = n - 1;
      } else {
        return;
      }
      var apply = global.MangalamPage && global.MangalamPage.applyManufacturingStep;
      if (typeof apply === "function") apply(next);
      focusTab(next);
    });
  }

  function initProcessStepCarousel() {
    var root = document.querySelector("[data-process-carousel]");
    if (!root || root.getAttribute("data-process-carousel-delegation") === "1") return;
    root.setAttribute("data-process-carousel-delegation", "1");

    var index = 0;

    function getTrack() {
      return document.getElementById("processCarouselTrack");
    }

    function slideCount() {
      var track = getTrack();
      return track ? track.querySelectorAll("[data-process-carousel-slide]").length : 0;
    }

    function clamp(i) {
      var n = slideCount();
      if (n === 0) return 0;
      if (i < 0) return n - 1;
      if (i >= n) return 0;
      return i;
    }

    function updateTrack() {
      var track = getTrack();
      if (!track) return;
      track.style.transform = "translateX(" + -index * 100 + "%)";
    }

    function goTo(i) {
      index = clamp(i);
      updateTrack();
    }

    function next() {
      goTo(index + 1);
    }

    function prev() {
      goTo(index - 1);
    }

    function resetProcessCarousel() {
      index = 0;
      updateTrack();
    }

    root.addEventListener("click", function (e) {
      if (e.target.closest("[data-process-carousel-prev]")) {
        e.preventDefault();
        prev();
        return;
      }
      if (e.target.closest("[data-process-carousel-next]")) {
        e.preventDefault();
        next();
      }
    });

    global.MangalamPage = global.MangalamPage || {};
    global.MangalamPage.resetProcessCarousel = resetProcessCarousel;
    resetProcessCarousel();
  }

  /**
   * Seamless horizontal marquee on any track with [data-seamless-marquee].
   */
  function initSeamlessMarquees() {
    if (global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    var tracks = document.querySelectorAll("[data-seamless-marquee]");
    for (var t = 0; t < tracks.length; t++) {
      (function (track) {
        if (track.getAttribute("data-marquee-init") === "1") return;
        var seg = track.querySelector("[data-marquee-segment]:not([aria-hidden='true'])");
        if (!seg) return;
        track.setAttribute("data-marquee-init", "1");

        var x = 0;
        var segWidth = 0;
        var speed = parseFloat(track.getAttribute("data-marquee-speed") || "54");
        if (!(speed > 0)) speed = 54;

        function measure() {
          segWidth = seg.getBoundingClientRect().width;
        }

        var last = performance.now();

        function tick(now) {
          var dt = Math.min((now - last) / 1000, 0.08);
          last = now;
          if (segWidth <= 1) measure();
          x -= speed * dt;
          if (segWidth > 1 && x <= -segWidth) {
            x += segWidth;
          }
          track.style.transform = "translate3d(" + x + "px,0,0)";
          global.requestAnimationFrame(tick);
        }

        global.addEventListener(
          "resize",
          function () {
            x = 0;
            measure();
          },
          { passive: true }
        );

        global.requestAnimationFrame(function () {
          measure();
          global.requestAnimationFrame(function () {
            measure();
            last = performance.now();
            global.requestAnimationFrame(tick);
          });
        });
      })(tracks[t]);
    }
  }

  function initFoldScrollReveal() {
    var els = document.querySelectorAll(".fold-animate");
    if (!els.length) return;

    function markAllInView() {
      for (var i = 0; i < els.length; i++) {
        els[i].classList.add("is-in-view");
      }
    }

    if (global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      markAllInView();
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      markAllInView();
      return;
    }

    try {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.add("is-in-view");
              io.unobserve(en.target);
            }
          });
        },
        { rootMargin: "0px 0px 80px 0px", threshold: 0 }
      );

      for (var j = 0; j < els.length; j++) {
        io.observe(els[j]);
      }

      /* If nothing fired yet (e.g. strict layout), ensure sections become visible */
      global.requestAnimationFrame(function () {
        for (var k = 0; k < els.length; k++) {
          if (!els[k].classList.contains("is-in-view")) {
            var r = els[k].getBoundingClientRect();
            if (r.top < global.innerHeight && r.bottom > 0) {
              els[k].classList.add("is-in-view");
              io.unobserve(els[k]);
            }
          }
        }
      });
    } catch (err) {
      markAllInView();
    }
  }

  /** Wire every button / control on the page. */
  function initButtons() {
    initProductCarousel();
    initProductsDropdown();
    initNavProductSwitching();
    initProductCtas();
    initFaqAccordion();
    initCatalogueInlineForm();
    initApplicationsCarousel();
    initManufacturingTabs();
    initProcessStepCarousel();
    initSeamlessMarquees();
    initFoldScrollReveal();
  }

  global.MangalamPage = global.MangalamPage || {};
  global.MangalamPage.initButtons = initButtons;
})(typeof window !== "undefined" ? window : this);
