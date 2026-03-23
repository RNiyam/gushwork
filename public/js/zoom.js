/**
 * Hero product carousel — lens + flyout magnifier
 *
 * The white box on the main image (lens) shows exactly which part of the photo is
 * blown up in the panel to the right. Math accounts for CSS object-fit: cover so the
 * magnified bitmap lines up with what you see under the lens.
 *
 * Tunables: LENS (px square on hero), RESULT (px square flyout). Effective zoom is
 * roughly (RESULT/LENS) * S where S is the cover scale — we bake S into background-size
 * so “what’s in the box” matches the image.
 *
 * @see README.md in this folder for behaviour, a11y, and tuning notes.
 */
(function (global) {
  "use strict";

  /** Side length of the square lens on the hero image (CSS px). Larger = more context in the box. */
  var LENS = 180;

  /**
   * Side length of the square flyout panel (must match .hero-zoom-result in styles.css).
   * Lower RESULT/LENS ⇒ gentler zoom. With corrected cover math, ~1.15–1.25 feels natural.
   */
  var RESULT = 210;

  function prefersReducedMotion() {
    return global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /** Flyout is desktop-only; small viewports hide lens/result in CSS too. */
  function allowZoomLayout() {
    return global.matchMedia && global.matchMedia("(min-width: 992px)").matches;
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  /** The <img> belonging to the slide currently visible inside the clipped viewport. */
  function visibleSlideImg(viewport) {
    var vRect = viewport.getBoundingClientRect();
    var imgs = viewport.querySelectorAll(".product-carousel__slide img");
    for (var i = 0; i < imgs.length; i++) {
      var r = imgs[i].getBoundingClientRect();
      if (
        r.width > 0 &&
        r.left < vRect.right - 0.5 &&
        r.right > vRect.left + 0.5 &&
        r.top < vRect.bottom - 0.5 &&
        r.bottom > vRect.top + 0.5
      ) {
        return imgs[i];
      }
    }
    return imgs[0] || null;
  }

  /**
   * object-fit: cover metadata for an <img>:
   * - S scales natural → the “display plane” (the cropped, centered bitmap drawn in the box).
   * - dispW/dispH = that plane’s size in CSS px; ox/oy offset within the element.
   */
  function getCoverMeta(img) {
    var r = img.getBoundingClientRect();
    var Wd = r.width;
    var Hd = r.height;
    var Nw = img.naturalWidth;
    var Nh = img.naturalHeight;
    if (!Nw || !Nh || !Wd || !Hd) return null;
    var S = Math.max(Wd / Nw, Hd / Nh);
    var dispW = Nw * S;
    var dispH = Nh * S;
    var ox = (Wd - dispW) / 2;
    var oy = (Hd - dispH) / 2;
    return { Wd: Wd, Hd: Hd, Nw: Nw, Nh: Nh, S: S, dispW: dispW, dispH: dispH, ox: ox, oy: oy };
  }

  /** Map a screen point (clientX/Y) to natural image coordinates (nx, ny). */
  function clientToNatural(img, clientX, clientY, meta) {
    var mx = clientX - img.getBoundingClientRect().left;
    var my = clientY - img.getBoundingClientRect().top;
    var mx2 = clamp(mx - meta.ox, 0, meta.dispW);
    var my2 = clamp(my - meta.oy, 0, meta.dispH);
    var nx = (mx2 / meta.dispW) * meta.Nw;
    var ny = (my2 / meta.dispH) * meta.Nh;
    return { nx: nx, ny: ny };
  }

  function hideZoom(lens, result) {
    lens.setAttribute("hidden", "");
    lens.setAttribute("aria-hidden", "true");
    result.setAttribute("hidden", "");
    result.setAttribute("aria-hidden", "true");
    var inner = result.querySelector(".hero-zoom-result__inner");
    if (inner) {
      inner.style.backgroundImage = "";
      inner.style.backgroundSize = "";
      inner.style.backgroundPosition = "";
    }
  }

  function showZoom(lens, result) {
    lens.removeAttribute("hidden");
    lens.setAttribute("aria-hidden", "false");
    result.removeAttribute("hidden");
    result.setAttribute("aria-hidden", "false");
  }

  /** Pin flyout top to viewport top, gap to the right of the main image. */
  function positionFlyout(stage, viewport, resultEl) {
    var vr = viewport.getBoundingClientRect();
    var sr = stage.getBoundingClientRect();
    var gap = 14;
    resultEl.style.top = Math.round(vr.top - sr.top) + "px";
    resultEl.style.left = Math.round(vr.right - sr.left + gap) + "px";
  }

  function updateZoom(viewport, stage, lens, result, inner, clientX, clientY) {
    if (!allowZoomLayout()) return;

    var img = visibleSlideImg(viewport);
    if (!img || !img.src) return;
    if (!img.complete || img.naturalWidth === 0) return;

    var vRect = viewport.getBoundingClientRect();
    if (vRect.width <= 0 || vRect.height <= 0) return;

    var meta = getCoverMeta(img);
    if (!meta) return;

    // Lens follows pointer, clamped so it stays inside the viewport.
    var lx = clientX - vRect.left - LENS / 2;
    var ly = clientY - vRect.top - LENS / 2;
    lx = clamp(lx, 0, vRect.width - LENS);
    ly = clamp(ly, 0, vRect.height - LENS);
    lens.style.width = LENS + "px";
    lens.style.height = LENS + "px";
    lens.style.left = lx + "px";
    lens.style.top = ly + "px";

    // Align flyout to what the LENS square actually covers: use the lens *center*, not the raw pointer
    // (when the lens is clamped at an edge, center ≠ cursor).
    var lensCx = vRect.left + lx + LENS / 2;
    var lensCy = vRect.top + ly + LENS / 2;
    var nat = clientToNatural(img, lensCx, lensCy, meta);
    var nx = clamp(nat.nx, 0, meta.Nw);
    var ny = clamp(nat.ny, 0, meta.Nh);

    /*
     * Under object-fit: cover, 1 CSS px on the drawn image = 1/S natural px (along each axis).
     * The lens is LENS css px wide → it spans LENS/S natural px. We want that span to fill RESULT css px
     * in the flyout, so painted width Bw must satisfy: RESULT * (Nw/Bw) = LENS/S → Bw = Nw * RESULT * S / LENS.
     */
    var bgW = (meta.Nw * RESULT * meta.S) / LENS;
    var bgH = (meta.Nh * RESULT * meta.S) / LENS;

    // Place natural point (nx, ny) under the flyout center (RESULT/2, RESULT/2).
    var posX = RESULT / 2 - (nx / meta.Nw) * bgW;
    var posY = RESULT / 2 - (ny / meta.Nh) * bgH;

    inner.style.backgroundImage =
      "url(" + JSON.stringify(img.currentSrc || img.getAttribute("src") || "") + ")";
    inner.style.backgroundRepeat = "no-repeat";
    inner.style.backgroundSize = Math.round(bgW) + "px " + Math.round(bgH) + "px";
    inner.style.backgroundPosition = Math.round(posX) + "px " + Math.round(posY) + "px";

    positionFlyout(stage, viewport, result);
    showZoom(lens, result);
  }

  function initHeroImageZoom() {
    if (prefersReducedMotion()) return;

    var viewport = document.querySelector(".product-carousel__viewport");
    var stage = document.querySelector(".product-carousel__stage");
    var lens = document.getElementById("heroZoomLens");
    var result = document.getElementById("heroZoomResult");
    var inner = document.getElementById("heroZoomResultInner");

    if (!viewport || !stage || !lens || !result || !inner) return;
    if (viewport.getAttribute("data-hero-zoom-init") === "1") return;
    viewport.setAttribute("data-hero-zoom-init", "1");
    viewport.setAttribute("data-hero-zoom", "lens");

    function onPointerMove(e) {
      if (!allowZoomLayout()) {
        hideZoom(lens, result);
        return;
      }
      if (!viewport.contains(e.target)) return;
      updateZoom(viewport, stage, lens, result, inner, e.clientX, e.clientY);
    }

    function onPointerEnter(e) {
      if (!allowZoomLayout()) return;
      updateZoom(viewport, stage, lens, result, inner, e.clientX, e.clientY);
    }

    function onPointerLeave(e) {
      if (e.relatedTarget && viewport.contains(e.relatedTarget)) return;
      hideZoom(lens, result);
    }

    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerenter", onPointerEnter);
    viewport.addEventListener("pointerleave", onPointerLeave);
    viewport.addEventListener("pointercancel", function () {
      hideZoom(lens, result);
    });

    global.addEventListener(
      "resize",
      function () {
        if (!allowZoomLayout()) hideZoom(lens, result);
      },
      { passive: true }
    );
  }

  global.MangalamPage = global.MangalamPage || {};
  global.MangalamPage.initHeroImageZoom = initHeroImageZoom;

  initHeroImageZoom();
})(typeof window !== "undefined" ? window : this);
