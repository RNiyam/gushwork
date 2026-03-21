/**
 * Loads JSON content first, then wires buttons (carousel, dropdown, CTAs).
 * Use a local dev server rooted at public/ (e.g. open public/index.html) so fetch() can read json/data.json.
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var load = window.MangalamPage && window.MangalamPage.loadPageData;
    var init = window.MangalamPage && window.MangalamPage.initButtons;

    if (typeof load !== "function") {
      if (typeof init === "function") init();
      var m = window.MangalamPage && window.MangalamPage.initButtonModals;
      if (typeof m === "function") m();
      return;
    }

    load()
      .then(function () {
        if (typeof init === "function") init();
        var modals = window.MangalamPage && window.MangalamPage.initButtonModals;
        if (typeof modals === "function") modals();
      })
      .catch(function (err) {
        console.error("[MangalamPage] Failed to load JSON:", err);
        if (typeof init === "function") init();
        var modals = window.MangalamPage && window.MangalamPage.initButtonModals;
        if (typeof modals === "function") modals();
      });
  });
})();
