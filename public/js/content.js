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

  function renderFaqSection(cfg) {
    var section = document.querySelector("[data-faq-section]");
    var titleEl = document.getElementById("faqSectionTitle");
    var acc = document.getElementById("faqAccordion");
    if (!section || !titleEl || !acc) return;

    if (!cfg || !cfg.items || !cfg.items.length) {
      acc.innerHTML = "";
      titleEl.innerHTML = "";
      titleEl.setAttribute("hidden", "");
      acc.setAttribute("hidden", "");
      return;
    }

    titleEl.removeAttribute("hidden");
    acc.removeAttribute("hidden");
    var accent = escapeHtml(cfg.titleAccent || "");
    var rest = escapeHtml(cfg.titleRest || "");
    titleEl.innerHTML =
      (accent ? '<span class="faq-fold__title-accent">' + accent + "</span> " : "") + rest;

    acc.innerHTML = cfg.items
      .map(function (item, idx) {
        var open = !!item.defaultOpen;
        var q = escapeHtml(item.question || "");
        var a = escapeHtml(item.answer || "");
        var bid = "faq-btn-" + idx;
        var pid = "faq-panel-" + idx;
        return (
          '<div class="faq-item' +
          (open ? " is-open" : "") +
          '">' +
          '<button type="button" class="faq-item__trigger" id="' +
          bid +
          '" aria-expanded="' +
          (open ? "true" : "false") +
          '" aria-controls="' +
          pid +
          '">' +
          '<span class="faq-item__question">' +
          q +
          "</span>" +
          '<span class="faq-item__chevron" aria-hidden="true"></span>' +
          "</button>" +
          '<div class="faq-item__panel" id="' +
          pid +
          '" role="region" aria-labelledby="' +
          bid +
          '"' +
          (open ? "" : " hidden") +
          ">" +
          '<p class="faq-item__answer">' +
          a +
          "</p>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  /** Show FAQ fold if accordion or embedded catalogue CTA has content. */
  function syncFaqFoldVisibility() {
    var section = document.querySelector("[data-faq-section]");
    if (!section) return;
    var acc = document.getElementById("faqAccordion");
    var cat = section.querySelector("[data-catalogue-cta]");
    var hasFaq = acc && !acc.hasAttribute("hidden") && acc.querySelector(".faq-item");
    var hasCat = cat && !cat.hasAttribute("hidden");
    if (hasFaq || hasCat) {
      section.removeAttribute("hidden");
    } else {
      section.setAttribute("hidden", "");
    }
  }

  function renderCatalogueCta(cfg) {
    var section = document.querySelector("[data-catalogue-cta]");
    var t = document.getElementById("catalogueCtaTitle");
    var s = document.getElementById("catalogueCtaSubtitle");
    var input = document.getElementById("catalogueInlineEmail");
    var btn = document.getElementById("catalogueCtaBtn");
    if (!section || !t || !s) return;

    if (!cfg || !cfg.title) {
      section.setAttribute("hidden", "");
      t.textContent = "";
      s.textContent = "";
      return;
    }

    section.removeAttribute("hidden");
    t.textContent = cfg.title || "";
    s.textContent = cfg.subtitle || "";
    if (input && cfg.placeholder) input.setAttribute("placeholder", cfg.placeholder);
    if (btn && cfg.buttonLabel) btn.textContent = cfg.buttonLabel;
  }

  function renderApplicationCard(card) {
    var src = escapeHtml(card.image || "fishnet.jpg");
    var alt = escapeHtml(card.imageAlt || card.title || "");
    return (
      '<article class="applications-fold__card">' +
      '<div class="applications-fold__card-media">' +
      '<img src="' +
      src +
      '" alt="' +
      alt +
      '" loading="lazy" decoding="async">' +
      '<div class="applications-fold__card-gradient"></div>' +
      '<div class="applications-fold__card-copy">' +
      '<h3 class="applications-fold__card-title">' +
      escapeHtml(card.title || "") +
      "</h3>" +
      '<p class="applications-fold__card-desc">' +
      escapeHtml(card.description || "") +
      "</p>" +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function renderApplicationsSection(cfg) {
    var section = document.querySelector("[data-applications-section]");
    var titleEl = document.getElementById("applicationsTitle");
    var subEl = document.getElementById("applicationsSubtitle");
    var track = document.getElementById("applicationsTrack");
    if (!section || !titleEl || !track) return;

    if (!cfg || !cfg.cards || !cfg.cards.length) {
      section.setAttribute("hidden", "");
      track.innerHTML = "";
      titleEl.textContent = "";
      if (subEl) subEl.textContent = "";
      return;
    }

    section.removeAttribute("hidden");
    titleEl.textContent = cfg.title || "";
    if (subEl) subEl.textContent = cfg.subtitle || "";
    track.innerHTML = cfg.cards.map(renderApplicationCard).join("");
  }

  function buildProcessCarouselSlides(images) {
    var list = images && images.length ? images : [{ src: "fishnet.jpg", alt: "" }];
    return list
      .map(function (img, idx) {
        return (
          '<figure class="process-step-carousel__slide" data-process-carousel-slide>' +
          "<img" +
          ' src="' +
          escapeHtml(img.src) +
          '"' +
          ' alt="' +
          escapeHtml(img.alt || "") +
          '"' +
          ' loading="' +
          (idx === 0 ? "eager" : "lazy") +
          '"' +
          ' decoding="async">' +
          "</figure>"
        );
      })
      .join("");
  }

  function applyManufacturingStep(index) {
    var data = global.MangalamPage._pageData;
    var sec = data && data.manufacturingSection;
    var steps = sec && sec.steps;
    if (!steps || !steps.length) return;

    var i = Math.max(0, Math.min(index, steps.length - 1));
    global.MangalamPage._manufacturingActiveIndex = i;

    var tabBtns = document.querySelectorAll("[data-process-tab]");
    for (var j = 0; j < tabBtns.length; j++) {
      var btn = tabBtns[j];
      var sel = j === i;
      btn.classList.toggle("is-active", sel);
      btn.setAttribute("aria-selected", sel ? "true" : "false");
      btn.setAttribute("tabindex", sel ? "0" : "-1");
    }

    var panel = document.getElementById("processCardPanel");
    if (panel) panel.setAttribute("aria-labelledby", "process-tab-" + i);

    var step = steps[i];
    var textEl = document.getElementById("processCardText");
    var track = document.getElementById("processCarouselTrack");
    if (textEl) {
      var bullets = (step.bullets || [])
        .map(function (b) {
          return (
            '<li><span class="process-fold__bullet-icon" aria-hidden="true"></span>' +
            escapeHtml(b) +
            "</li>"
          );
        })
        .join("");
      textEl.innerHTML =
        '<h3 class="process-fold__card-heading">' +
        escapeHtml(step.cardTitle || "") +
        "</h3>" +
        '<p class="process-fold__card-body">' +
        escapeHtml(step.body || "") +
        "</p>" +
        (bullets ? '<ul class="process-fold__bullet-list">' + bullets + "</ul>" : "");
    }
    if (track) {
      track.innerHTML = buildProcessCarouselSlides(step.images);
    }
    if (global.MangalamPage && typeof global.MangalamPage.resetProcessCarousel === "function") {
      global.MangalamPage.resetProcessCarousel();
    }
  }

  function renderManufacturingSection(cfg) {
    var section = document.querySelector("[data-process-section]");
    var titleEl = document.getElementById("processTitle");
    var subEl = document.getElementById("processSubtitle");
    var tabsEl = document.getElementById("processTabs");
    if (!section || !titleEl || !tabsEl) return;

    if (!cfg || !cfg.steps || !cfg.steps.length) {
      section.setAttribute("hidden", "");
      titleEl.textContent = "";
      if (subEl) subEl.textContent = "";
      tabsEl.innerHTML = "";
      var textEl = document.getElementById("processCardText");
      var track = document.getElementById("processCarouselTrack");
      if (textEl) textEl.innerHTML = "";
      if (track) track.innerHTML = "";
      return;
    }

    section.removeAttribute("hidden");
    titleEl.textContent = cfg.title || "";
    if (subEl) subEl.textContent = cfg.subtitle || "";

    tabsEl.innerHTML = cfg.steps
      .map(function (s, idx) {
        var sel = idx === 0;
        return (
          '<button type="button" role="tab" class="process-fold__tab" id="process-tab-' +
          idx +
          '" data-process-tab="' +
          idx +
          '" aria-selected="' +
          (sel ? "true" : "false") +
          '" aria-controls="processCardPanel" tabindex="' +
          (sel ? "0" : "-1") +
          '">' +
          escapeHtml(s.label || "") +
          "</button>"
        );
      })
      .join("");

    applyManufacturingStep(0);
  }

  function buildTrustQuoteCardHtml(q) {
    var headline = (q.headline || "").trim();
    var body = (q.text || "").trim();
    if (!headline && body) {
      headline = body;
      body = "";
    }
    var name = (q.authorName || "").trim();
    var role = (q.authorTitle || "").trim();
    if (!name && q.author) {
      var raw = (q.author || "").trim();
      var comma = raw.indexOf(",");
      if (comma !== -1) {
        role = raw.slice(0, comma).trim();
        name = raw.slice(comma + 1).trim();
        if (!name) {
          name = role;
          role = "";
        }
      } else {
        name = raw;
      }
    }
    var avatarSrc = (q.avatar || q.avatarSrc || "").trim();
    var avatarHtml = avatarSrc
      ? '<img class="trust-fold__quote-avatar-img" src="' +
        escapeHtml(avatarSrc) +
        '" alt="" loading="lazy" decoding="async">'
      : "";
    var headHtml = headline
      ? '<h3 class="trust-fold__quote-headline">' + escapeHtml(headline) + "</h3>"
      : "";
    var bodyHtml = body
      ? '<p class="trust-fold__quote-body">' + escapeHtml(body) + "</p>"
      : "";
    var bylineHtml =
      name || role
        ? '<div class="trust-fold__quote-byline">' +
          (name
            ? '<cite class="trust-fold__quote-name">' + escapeHtml(name) + "</cite>"
            : "") +
          (role
            ? '<span class="trust-fold__quote-role">' + escapeHtml(role) + "</span>"
            : "") +
          "</div>"
        : "";
    return (
      '<blockquote class="trust-fold__card">' +
      '<span class="trust-fold__quote-mark" aria-hidden="true"><span class="trust-fold__quote-mark-inner">&#8220;&#8220;</span></span>' +
      headHtml +
      bodyHtml +
      (name || role
        ? '<footer class="trust-fold__quote-footer">' +
          '<div class="trust-fold__quote-avatar">' +
          avatarHtml +
          "</div>" +
          bylineHtml +
          "</footer>"
        : "") +
      "</blockquote>"
    );
  }

  function renderTrustSection(cfg) {
    var section = document.querySelector("[data-trust-section]");
    var titleEl = document.getElementById("trustTitle");
    var subEl = document.getElementById("trustSubtitle");
    var grid = document.getElementById("trustQuotesGrid");
    if (!section || !titleEl || !grid) return;

    if (!cfg || !cfg.quotes || !cfg.quotes.length) {
      section.setAttribute("hidden", "");
      titleEl.textContent = "";
      if (subEl) subEl.textContent = "";
      grid.innerHTML = "";
      return;
    }

    section.removeAttribute("hidden");
    titleEl.textContent = cfg.title || "";
    if (subEl) subEl.textContent = cfg.subtitle || "";
    var cardsHtml = cfg.quotes.map(buildTrustQuoteCardHtml).join("");
    var seg =
      '<div class="trust-fold__segment" data-marquee-segment>' + cardsHtml + "</div>";
    var segDup =
      '<div class="trust-fold__segment" data-marquee-segment aria-hidden="true">' +
      cardsHtml +
      "</div>";
    grid.innerHTML =
      '<div class="trust-fold__marquee">' +
      '<div class="trust-fold__track" data-seamless-marquee>' +
      seg +
      segDup +
      "</div></div>";
  }

  function buildPortfolioCardHtml(card) {
    var img = escapeHtml(card.image || "fishnet.jpg");
    var alt = escapeHtml(card.imageAlt || card.title || "");
    var href = escapeHtml(card.ctaHref || "#");
    return (
      '<article class="portfolio-card">' +
      '<h3 class="portfolio-card__title">' +
      escapeHtml(card.title || "") +
      "</h3>" +
      '<p class="portfolio-card__body">' +
      escapeHtml(card.description || "") +
      "</p>" +
      '<div class="portfolio-card__media">' +
      '<img src="' +
      img +
      '" alt="' +
      alt +
      '" loading="lazy" decoding="async" width="640" height="400">' +
      "</div>" +
      '<a class="portfolio-card__cta" href="' +
      href +
      '">' +
      escapeHtml(card.ctaLabel || "Learn More") +
      "</a>" +
      "</article>"
    );
  }

  function renderPortfolioSection(cfg) {
    var section = document.querySelector("[data-portfolio-section]");
    var titleEl = document.getElementById("portfolioTitle");
    var subEl = document.getElementById("portfolioSubtitle");
    var gridEl = document.getElementById("portfolioCardsGrid");
    var bottomEl = document.getElementById("portfolioBottomCta");
    if (!section || !titleEl || !gridEl) return;

    if (!cfg || !cfg.cards || !cfg.cards.length) {
      section.setAttribute("hidden", "");
      titleEl.textContent = "";
      if (subEl) subEl.textContent = "";
      gridEl.innerHTML = "";
      if (bottomEl) {
        bottomEl.innerHTML = "";
        bottomEl.setAttribute("hidden", "");
      }
      return;
    }

    section.removeAttribute("hidden");
    titleEl.textContent = cfg.title || "";
    if (subEl) subEl.textContent = cfg.subtitle || "";

    var cards = cfg.cards.slice(0, 3);
    gridEl.innerHTML = cards.map(buildPortfolioCardHtml).join("");

    if (bottomEl && cfg.bottomCta) {
      var bc = cfg.bottomCta;
      var btnHref = escapeHtml(bc.buttonHref || "#");
      var titleHtml;
      if (bc.titleAccent) {
        titleHtml =
          escapeHtml(bc.titleBefore || "") +
          ' <span class="portfolio-fold__bottom-cta__accent">' +
          escapeHtml(bc.titleAccent) +
          "</span>";
      } else {
        titleHtml = escapeHtml(bc.title || "");
      }
      bottomEl.removeAttribute("hidden");
      bottomEl.innerHTML =
        '<div class="portfolio-fold__bottom-cta__copy">' +
        '<h3 class="portfolio-fold__bottom-cta__title">' +
        titleHtml +
        "</h3>" +
        '<p class="portfolio-fold__bottom-cta__sub">' +
        escapeHtml(bc.subtitle || "") +
        "</p></div>" +
        '<a class="portfolio-fold__bottom-cta__btn" href="' +
        btnHref +
        '">' +
        '<svg class="portfolio-fold__bottom-cta__phone-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
        '<path d="M6.6 10.8c1.6 3.1 4.5 5.9 7.6 7.6l2.5-2.5c.4-.4 1-.5 1.5-.3 1 .4 2.1.6 3.3.6.8 0 1.5.7 1.5 1.5V21c0 .8-.7 1.5-1.5 1.5C9.9 22.5 1.5 14.1 1.5 3C1.5 2.2 2.2 1.5 3 1.5H6.5c.8 0 1.5.7 1.5 1.5 0 1.2.2 2.3.6 3.3.2.5.1 1.1-.3 1.5L6.6 10.8z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>' +
        "</svg>" +
        "<span>" +
        escapeHtml(bc.buttonLabel || "Talk to an Expert") +
        "</span></a>";
    } else if (bottomEl) {
      bottomEl.innerHTML = "";
      bottomEl.setAttribute("hidden", "");
    }
  }

  function renderResourcesSection(cfg) {
    var section = document.querySelector("[data-resources-section]");
    var titleEl = document.getElementById("resourcesTitle");
    var subEl = document.getElementById("resourcesSubtitle");
    var listEl = document.getElementById("resourcesList");
    if (!section || !titleEl || !listEl) return;

    if (!cfg || !cfg.items || !cfg.items.length) {
      section.setAttribute("hidden", "");
      titleEl.textContent = "";
      if (subEl) subEl.textContent = "";
      listEl.innerHTML = "";
      return;
    }

    section.removeAttribute("hidden");
    titleEl.textContent = cfg.title || "";
    if (subEl) subEl.textContent = cfg.subtitle || "";

    var dlIcon =
      '<svg class="resources-fold__dl-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<path d="M12 3v7l-3-3m3 3l3-3M6 20h12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>' +
      "</svg>";

    listEl.innerHTML =
      '<ul class="resources-fold__list" role="list">' +
      cfg.items
        .map(function (item) {
          var href = escapeHtml(item.href || "#");
          var label = escapeHtml(item.linkLabel || "Download PDF");
          return (
            '<li class="resources-fold__row">' +
            '<span class="resources-fold__doc-title">' +
            escapeHtml(item.title || "") +
            "</span>" +
            '<a class="resources-fold__dl" href="' +
            href +
            '">' +
            "<span class=\"resources-fold__dl-text\">" +
            label +
            "</span>" +
            dlIcon +
            "</a></li>"
          );
        })
        .join("") +
      "</ul>";
  }

  function renderContactBandSection(cfg) {
    var section = document.querySelector("[data-contact-band-section]");
    var titleEl = document.getElementById("contactBandTitle");
    var subEl = document.getElementById("contactBandSubtitle");
    var footerEl = document.getElementById("contactBandFooter");
    var formTitleEl = document.getElementById("contactBandFormTitle");
    var submitLabel = document.querySelector("[data-contact-band-submit-label]");
    if (!section || !titleEl) return;

    if (!cfg || (!cfg.title && !cfg.subtitle && !cfg.formTitle)) {
      section.setAttribute("hidden", "");
      titleEl.textContent = "";
      if (subEl) subEl.textContent = "";
      if (footerEl) footerEl.innerHTML = "";
      if (formTitleEl) formTitleEl.textContent = "";
      if (submitLabel) submitLabel.textContent = "Request Custom Quote";
      return;
    }

    section.removeAttribute("hidden");
    titleEl.textContent = cfg.title || "";
    if (subEl) subEl.textContent = cfg.subtitle || "";
    if (formTitleEl) formTitleEl.textContent = cfg.formTitle || "Contact Us Today";
    if (submitLabel) submitLabel.textContent = cfg.submitLabel || "Request Custom Quote";

    if (footerEl) {
      var em = (cfg.footerEmail || "").trim();
      var mailHref = em ? "mailto:" + em.replace(/\s/g, "") : "#";
      footerEl.innerHTML =
        escapeHtml(cfg.footerLead || "") +
        ' <strong class="contact-band__footer-strong">' +
        escapeHtml(cfg.footerPhone || "") +
        "</strong>. " +
        escapeHtml(cfg.footerMid || "") +
        ' <a class="contact-band__footer-link" href="' +
        escapeHtml(mailHref) +
        '">' +
        escapeHtml(em) +
        "</a>.";
    }
  }

  var FOOTER_SVG_ICO =
    ' class="site-footer__ico" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"';

  function renderFooterSection(cfg, navProducts) {
    var el = document.getElementById("siteFooter");
    if (!el) return;
    var taglineEl = document.getElementById("footerTagline");
    var colsEl = document.getElementById("footerCols");
    var copyEl = document.getElementById("footerCopyright");
    var legalEl = document.getElementById("footerLegal");
    if (!taglineEl || !colsEl || !copyEl || !legalEl) return;

    if (!cfg) {
      el.setAttribute("hidden", "");
      return;
    }

    el.removeAttribute("hidden");
    taglineEl.innerHTML =
      '<span class="site-footer__tagline-accent">' +
      escapeHtml(cfg.taglineAccent || "") +
      '</span><span class="site-footer__tagline-rest">' +
      escapeHtml(cfg.taglineRest || "") +
      "</span>";

    function colLinks(title, links) {
      var arr = links || [];
      var items = arr
        .map(function (lk) {
          return (
            '<li><a class="site-footer__link" href="' +
            escapeHtml(lk.href || "#") +
            '">' +
            escapeHtml(lk.label || "") +
            "</a></li>"
          );
        })
        .join("");
      return (
        '<div class="site-footer__col">' +
        '<h3 class="site-footer__col-title">' +
        escapeHtml(title || "") +
        "</h3>" +
        '<ul class="site-footer__links">' +
        items +
        "</ul></div>"
      );
    }

    var about = cfg.about || {};
    var cats = cfg.categories || {};
    var prods = cfg.products || {};
    var productLinks = prods.links && prods.links.length ? prods.links : [];
    if (!productLinks.length && prods.useNavProducts && navProducts && navProducts.length) {
      productLinks = navProducts.map(function (p) {
        return { label: p.label, href: "#" };
      });
    }

    var colAbout = colLinks(about.title, about.links);
    var colCat = colLinks(cats.title, cats.links);
    var colProd = colLinks(prods.title, productLinks);

    var c = cfg.contact || {};
    var pinSvg =
      "<svg" +
      FOOTER_SVG_ICO +
      '><path d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="currentColor" stroke-width="1.75"/><path d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var phoneSvg =
      "<svg" +
      FOOTER_SVG_ICO +
      '><path d="M6.6 10.8c1.6 3.1 4.5 5.9 7.6 7.6l2.5-2.5c.4-.4 1-.5 1.5-.3 1 .4 2.1.6 3.3.6.8 0 1.5.7 1.5 1.5V21c0 .8-.7 1.5-1.5 1.5C9.9 22.5 1.5 14.1 1.5 3C1.5 2.2 2.2 1.5 3 1.5H6.5c.8 0 1.5.7 1.5 1.5 0 1.2.2 2.3.6 3.3.2.5.1 1.1-.3 1.5L6.6 10.8z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var mailSvg =
      "<svg" +
      FOOTER_SVG_ICO +
      '><path d="M4 6h16v12H4V6zm0 0l8 6 8-6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var headSvg =
      "<svg" +
      FOOTER_SVG_ICO +
      '><path d="M5 10c0-3.87 3.13-7 7-7s7 3.13 7 7v3a2 2 0 01-2 2h-1M5 10v3a2 2 0 002 2h1.5M19 10v3a2 2 0 01-2 2h-1.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 18v1a3 3 0 003 3 3 3 0 003-3v-1" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>';

    var phoneDisp = c.phone || "";
    var phoneHrefRaw = (c.phoneHref || "").trim();
    var phoneHref =
      phoneHrefRaw ||
      (phoneDisp ? "tel:" + String(phoneDisp).replace(/[^\d+]/g, "") : "#");
    var emailMain = (c.email || "").trim();
    var emailSup = (c.supportEmail || "").trim();

    var contactHtml =
      '<div class="site-footer__col site-footer__col--contact">' +
      '<h3 class="site-footer__col-title">' +
      escapeHtml(c.title || "Contact") +
      "</h3>" +
      '<ul class="site-footer__contact">' +
      '<li><span class="site-footer__contact-ico" aria-hidden="true">' +
      pinSvg +
      "</span><span class=\"site-footer__contact-txt\">" +
      escapeHtml(c.address || "") +
      "</span></li>" +
      '<li><span class="site-footer__contact-ico" aria-hidden="true">' +
      phoneSvg +
      '</span><a class="site-footer__contact-link" href="' +
      escapeHtml(phoneHref) +
      '">' +
      escapeHtml(phoneDisp) +
      "</a></li>";

    if (emailMain) {
      contactHtml +=
        '<li><span class="site-footer__contact-ico" aria-hidden="true">' +
        mailSvg +
        '</span><a class="site-footer__contact-link" href="mailto:' +
        escapeHtml(emailMain) +
        '">' +
        escapeHtml(emailMain) +
        "</a></li>";
    }
    if (emailSup) {
      contactHtml +=
        '<li><span class="site-footer__contact-ico" aria-hidden="true">' +
        headSvg +
        '</span><a class="site-footer__contact-link" href="mailto:' +
        escapeHtml(emailSup) +
        '">' +
        escapeHtml(emailSup) +
        "</a></li>";
    }
    contactHtml += "</ul>";

    var soc = cfg.social || {};
    if (soc.linkedin || soc.twitter || soc.instagram) {
      contactHtml += '<div class="site-footer__social">';
      if (soc.linkedin) {
        contactHtml +=
          '<a class="site-footer__social-link" href="' +
          escapeHtml(soc.linkedin) +
          '" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg class="site-footer__social-svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.5 8.5h2V17h-2V8.5zM7.5 4.5c.65 0 1.2.55 1.2 1.2s-.55 1.2-1.2 1.2-1.2-.55-1.2-1.2.55-1.2 1.2-1.2zm4 4h1.9v1.1h.1c.35-.65 1.05-1.35 2.45-1.35 2.6 0 3.1 1.55 3.1 3.65V17h-2.1v-4.4c0-1.05-.02-2.4-1.45-2.4-1.45 0-1.7.95-1.7 1.95V17h-2.1V8.5z"/></svg></a>';
      }
      if (soc.twitter) {
        contactHtml +=
          '<a class="site-footer__social-link" href="' +
          escapeHtml(soc.twitter) +
          '" target="_blank" rel="noopener noreferrer" aria-label="X"><svg class="site-footer__social-svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 3H21l-6.5 7.4L21.5 21h-5.1l-4-5.2L6.2 21H3l6.9-7.9L3 3h5.2l3.6 4.7L18.244 3z"/></svg></a>';
      }
      if (soc.instagram) {
        contactHtml +=
          '<a class="site-footer__social-link" href="' +
          escapeHtml(soc.instagram) +
          '" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg class="site-footer__social-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" stroke="none"/></svg></a>';
      }
      contactHtml += "</div>";
    }

    contactHtml += "</div>";

    colsEl.innerHTML = colAbout + colCat + colProd + contactHtml;

    copyEl.textContent = cfg.copyright || "";

    var legals = cfg.legalLinks || [];
    legalEl.innerHTML = legals
      .map(function (lk) {
        return (
          '<a class="site-footer__legal-link" href="' +
          escapeHtml(lk.href || "#") +
          '">' +
          escapeHtml(lk.label || "") +
          "</a>"
        );
      })
      .join("");
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
    renderFaqSection(data.faqSection);
    renderCatalogueCta(data.catalogueCta);
    syncFaqFoldVisibility();
    renderApplicationsSection(data.applicationsSection);
    renderManufacturingSection(data.manufacturingSection);
    renderTrustSection(data.trustSection);
    renderPortfolioSection(data.portfolioSection);
    renderResourcesSection(data.resourcesSection);
    renderContactBandSection(data.contactBandSection);
    renderFooterSection(data.footer, data.navProducts);
  }

  global.MangalamPage = global.MangalamPage || {};
  global.MangalamPage.loadPageData = loadPageData;
  global.MangalamPage.applyProductById = applyProductById;
  global.MangalamPage.applyManufacturingStep = applyManufacturingStep;
})(typeof window !== "undefined" ? window : this);
