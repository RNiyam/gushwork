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

  /* ---------- Technical specs: datasheet download (href from JSON per product) ---------- */

  function initDatasheetDownload() {
    var btn = document.querySelector("[data-datasheet-download]");
    if (!btn) return;

    btn.addEventListener("click", function (e) {
      var href = (btn.getAttribute("href") || "").trim();
      if (!href || href === "#" || href === "#!") {
        e.preventDefault();
        btn.dispatchEvent(
          new CustomEvent("mangalam:datasheet-request", {
            bubbles: true,
            detail: { trigger: btn },
          })
        );
        return;
      }
      if (href.indexOf("http://") === 0 || href.indexOf("https://") === 0) {
        e.preventDefault();
        global.open(href, "_blank", "noopener,noreferrer");
      }
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

  /** Wire every button / control on the page. */
  function initButtons() {
    initProductCarousel();
    initProductsDropdown();
    initNavProductSwitching();
    initDatasheetDownload();
    initProductCtas();
  }

  global.MangalamPage = global.MangalamPage || {};
  global.MangalamPage.initButtons = initButtons;
})(typeof window !== "undefined" ? window : this);
