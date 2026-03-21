/**
 * Loads json/data.json and fills the product page (same idea as JSON-driven content).
 * Run before js/buttons.js so the carousel exists in the DOM.
 */
(function (global) {
  "use strict";

  var DATA_URL = "json/data.json";

  var CERT_SVG =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/></svg>';

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function expandImages(images, targetCount) {
    var out = [];
    if (!images || !images.length) return out;
    for (var i = 0; i < targetCount; i++) {
      out.push(images[i % images.length]);
    }
    return out;
  }

  function renderBreadcrumbs(items) {
    var ol = document.getElementById("jsonBreadcrumbs");
    if (!ol || !items) return;
    ol.innerHTML = items
      .map(function (item) {
        if (item.current) {
          return '<li aria-current="page">' + escapeHtml(item.label) + "</li>";
        }
        return (
          '<li><a href="' +
          escapeHtml(item.href || "#") +
          '">' +
          escapeHtml(item.label) +
          "</a></li>"
        );
      })
      .join("");
  }

  function renderCertBadges(badges) {
    var ul = document.getElementById("productCertBadges");
    if (!ul || !badges) return;
    ul.innerHTML = badges
      .map(function (b) {
        var variant = b.iconVariant === "primary" ? "primary" : "dark";
        return (
          '<li class="cert-badges__item">' +
          '<span class="cert-badges__icon cert-badges__icon--' +
          variant +
          '" aria-hidden="true">' +
          CERT_SVG +
          "</span>" +
          escapeHtml(b.label) +
          "</li>"
        );
      })
      .join("");
  }

  function renderFeatures(list) {
    var ul = document.getElementById("productFeatures");
    if (!ul || !list) return;
    ul.innerHTML = list
      .map(function (text) {
        return (
          '<li><span class="feature-list__check" aria-hidden="true">&#10003;</span> ' +
          escapeHtml(text) +
          "</li>"
        );
      })
      .join("");
  }

  function renderPriceCard(p) {
    var elRange = document.getElementById("jsonPriceRange");
    var elShip = document.getElementById("jsonShippingTag");
    var elRet = document.getElementById("jsonReturnsTag");
    var elFoot = document.getElementById("jsonCertLine");
    if (elRange) elRange.textContent = p.priceRange || "";
    if (elShip) elShip.textContent = p.shippingLabel || "";
    if (elRet) elRet.textContent = p.returnsLabel || "";
    if (elFoot) elFoot.textContent = p.certificationsSummary || "";
  }

  function renderCtas(p) {
    var q = document.querySelector("[data-cta-quote]");
    var s = document.querySelector("[data-cta-specs]");
    if (q && p.ctaQuote) {
      q.textContent = p.ctaQuote.label || "";
      q.setAttribute("href", p.ctaQuote.href || "#");
    }
    if (s && p.ctaSpecs) {
      var labelEl = s.querySelector("[data-cta-specs-label]");
      if (labelEl) labelEl.textContent = p.ctaSpecs.label || "";
      s.setAttribute("href", p.ctaSpecs.href || "#");
    }
  }

  function renderNavProducts(items) {
    var ul = document.getElementById("navProductsPanel");
    if (!ul || !items) return;
    ul.innerHTML = items
      .map(function (item) {
        var pid = item.productId != null ? String(item.productId) : "";
        var dataAttr = pid ? ' data-product-id="' + escapeHtml(pid) + '"' : "";
        return (
          '<li role="none"><a href="#"' +
          dataAttr +
          ' role="menuitem">' +
          escapeHtml(item.label) +
          "</a></li>"
        );
      })
      .join("");
  }

  function renderCarousel(images) {
    var track = document.getElementById("carouselTrack");
    var thumbs = document.getElementById("carouselThumbs");
    if (!track || !thumbs) return;

    track.innerHTML = images
      .map(function (img, idx) {
        var eager = idx === 0 ? "eager" : "lazy";
        return (
          '<figure class="product-carousel__slide" data-carousel-slide>' +
          "<img" +
          ' src="' +
          escapeHtml(img.src) +
          '"' +
          ' alt="' +
          escapeHtml(img.alt || "") +
          '"' +
          ' width="960" height="640"' +
          ' loading="' +
          eager +
          '"' +
          " decoding=\"async\">" +
          "</figure>"
        );
      })
      .join("");

    thumbs.innerHTML = images
      .map(function (img, idx) {
        var active = idx === 0 ? " is-active" : "";
        var selected = idx === 0 ? "true" : "false";
        return (
          '<button type="button" class="product-carousel__thumb' +
          active +
          '" role="tab" aria-selected="' +
          selected +
          '" aria-label="Show image ' +
          (idx + 1) +
          '" data-carousel-thumb="' +
          idx +
          '">' +
          '<img src="' +
          escapeHtml(img.src) +
          '" alt="" width="120" height="120" loading="lazy" decoding="async">' +
          "</button>"
        );
      })
      .join("");
  }

  var FEATURE_ICONS = {
    droplet:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 2.5c2.5 4 5 7.2 5 10.2a5 5 0 1 1-10 0c0-3 2.5-6.2 5-10.2z"/></svg>',
    wave:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M4 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>',
    link:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M10 13a5 5 0 0 1 7 0l2 2a5 5 0 1 1-7 7l-1-1"/><path d="M14 11a5 5 0 0 0-7 0L5 13a5 5 0 1 0 7 7l1-1"/></svg>',
    coin:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 10h6M9 14h6M12 10v4"/></svg>',
    leaf:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M11 20A7 7 0 0 1 4 13V6l2 2a7 7 0 0 1 5-3h3a7 7 0 0 1 7 7c0 3-2 6-5 7"/></svg>',
    badge:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 2l2.4 4.9L20 8l-4 3.9L17 18l-5-2.7L7 18l1-6.1L4 8l5.6-1.1z"/></svg>',
    gear:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2"/></svg>',
  };

  function renderFeatureCard(card) {
    var iconKey = card.icon || "gear";
    var svg = FEATURE_ICONS[iconKey] || FEATURE_ICONS.gear;
    var imgSrc = card.imageSrc;
    var mediaInner = imgSrc
      ? '<img src="' + escapeHtml(imgSrc) + '" alt="" loading="lazy" decoding="async">'
      : '<div class="features-fold__card-icon">' + svg + "</div>";
    return (
      '<article class="features-fold__card">' +
      '<div class="features-fold__card-media">' +
      mediaInner +
      "</div>" +
      '<h3 class="features-fold__card-title">' +
      escapeHtml(card.title || "") +
      "</h3>" +
      '<p class="features-fold__card-body">' +
      escapeHtml(card.body || "") +
      "</p>" +
      "</article>"
    );
  }

  function renderFeaturesFold(cfg) {
    var section = document.querySelector("[data-features-fold]");
    var titleEl = document.getElementById("featuresFoldTitle");
    var subEl = document.getElementById("featuresFoldSubtitle");
    var grid = document.getElementById("featuresFoldGrid");
    var cta = document.getElementById("featuresFoldCta");
    if (!section || !titleEl || !grid) return;

    if (!cfg || !cfg.cards || !cfg.cards.length) {
      section.setAttribute("hidden", "");
      grid.innerHTML = "";
      titleEl.textContent = "";
      if (subEl) subEl.textContent = "";
      return;
    }

    section.removeAttribute("hidden");
    titleEl.textContent = cfg.title || "";
    if (subEl) subEl.textContent = cfg.subtitle || "";
    grid.innerHTML = cfg.cards.map(renderFeatureCard).join("");
    if (cta && cfg.ctaLabel) cta.textContent = cfg.ctaLabel;
  }

  function renderTechnicalSpecs(p) {
    var section = document.querySelector("[data-tech-specs-section]");
    var titleEl = document.getElementById("techSpecsHeading");
    var subtitleEl = document.getElementById("techSpecsSubtitle");
    var tbody = document.getElementById("techSpecsTableBody");
    var btn = document.getElementById("techSpecsDatasheetBtn");
    if (!section || !titleEl || !subtitleEl || !tbody || !btn) return;

    var ts = p && p.technicalSpecs;
    if (!ts || !ts.rows || !ts.rows.length) {
      section.setAttribute("hidden", "");
      tbody.innerHTML = "";
      titleEl.textContent = "";
      subtitleEl.textContent = "";
      return;
    }

    section.removeAttribute("hidden");
    titleEl.textContent = ts.title || "";
    subtitleEl.textContent = ts.subtitle || "";
    tbody.innerHTML = ts.rows
      .map(function (row) {
        return (
          "<tr><td>" +
          escapeHtml(row.parameter) +
          "</td><td>" +
          escapeHtml(row.specification) +
          "</td></tr>"
        );
      })
      .join("");

    var dl = ts.datasheetDownload || {};
    var labelSpan = btn.querySelector("[data-datasheet-label]");
    if (labelSpan) {
      labelSpan.textContent = dl.label || "Download Full Technical Datasheet";
    }
  }

  function renderTrustedBy(cfg) {
    var headline = document.getElementById("trustedHeadline");
    var track = document.getElementById("trustedMarqueeTrack");
    if (!headline || !track || !cfg) return;
    headline.textContent = cfg.headline || "";
    var n = Math.max(1, parseInt(cfg.logosPerSegment, 10) || 6);
    var src = cfg.logoSrc || "euroflex.png";
    var alt = cfg.logoAlt || "Partner";
    function segment(isDuplicate) {
      var imgs = "";
      for (var i = 0; i < n; i++) {
        var a = i === 0 && !isDuplicate ? alt : "";
        imgs +=
          '<img class="trusted-by__logo" src="' +
          escapeHtml(src) +
          '" alt="' +
          escapeHtml(a) +
          '" width="520" height="150" loading="lazy" decoding="async">';
      }
      return (
        '<div class="trusted-by__segment"' +
        (isDuplicate ? ' aria-hidden="true"' : "") +
        ">" +
        imgs +
        "</div>"
      );
    }
    track.innerHTML = segment(false) + segment(true);
  }

  function applyProductTitle(title) {
    var h1 = document.getElementById("productTitle");
    if (h1) h1.textContent = title || "";
  }

  function findProductById(products, id) {
    if (!products || !id) return null;
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === id) return products[i];
    }
    return null;
  }

  function setDocumentTitle(data, p) {
    if (!p) return;
    var site = data && data.siteName ? String(data.siteName) : "";
    var piece = p.metaTitle || p.title || "";
    if (data && data.pageTitle && !piece) {
      document.title = data.pageTitle;
      return;
    }
    document.title = site ? piece + " | " + site : piece;
  }

  function applyProduct(p, data) {
    if (!p) return;
    applyProductTitle(p.title);
    setDocumentTitle(data, p);
    renderBreadcrumbs(p.breadcrumbs);
    renderCertBadges(p.certBadges);
    renderFeatures(p.features);
    renderPriceCard(p);
    renderCtas(p);
    var count = Math.max(1, parseInt(p.carouselSlides, 10) || 6);
    var imgs = expandImages(p.images, count);
    renderCarousel(imgs);
    renderTechnicalSpecs(p);
    if (global.MangalamPage && typeof global.MangalamPage.resetCarousel === "function") {
      global.MangalamPage.resetCarousel();
    }
  }

  function applyProductById(id) {
    var data = global.MangalamPage._pageData;
    if (!data || !data.products || !id) return;
    var p = findProductById(data.products, id);
    if (!p) return;
    applyProduct(p, data);
    try {
      var url = new URL(global.location.href);
      url.searchParams.set("product", id);
      global.history.replaceState({}, "", url.pathname + url.search + url.hash);
    } catch (e) {
      /* ignore */
    }
  }

  function resolveInitialProduct(data) {
    var products = data.products;
    if (!products || !products.length) return null;
    var params = new URLSearchParams(global.location.search || "");
    var fromUrl = params.get("product");
    var p = findProductById(products, fromUrl);
    if (p) return p;
    if (data.defaultProductId) {
      p = findProductById(products, data.defaultProductId);
      if (p) return p;
    }
    var idx = Math.max(0, parseInt(data.activeProductIndex, 10) || 0);
    return products[idx] || products[0];
  }

  async function loadPageData() {
    var res = await fetch(DATA_URL, { credentials: "same-origin" });
    if (!res.ok) throw new Error("Could not load " + DATA_URL + " (" + res.status + ")");
    var data = await res.json();

    global.MangalamPage = global.MangalamPage || {};
    global.MangalamPage._pageData = data;

    if (data.pageTitle && !data.products) {
      document.title = data.pageTitle;
    }

    var p = resolveInitialProduct(data);
    if (p) applyProduct(p, data);

    renderNavProducts(data.navProducts);
    renderTrustedBy(data.trustedBy);
    renderFeaturesFold(data.featuresSection);
  }

  global.MangalamPage = global.MangalamPage || {};
  global.MangalamPage.loadPageData = loadPageData;
  global.MangalamPage.applyProductById = applyProductById;
})(typeof window !== "undefined" ? window : this);
