/**
 * Modals: catalogue / brochure (Excel download) + request callback.
 * Open triggers: [data-open-catalogue-modal], [data-open-callback-modal]
 */
(function (global) {
  "use strict";

  function escapeCell(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * Excel-compatible download: HTML table as .xls (opens in Microsoft Excel).
   */
  function downloadBrochureSpreadsheet(email, contact) {
    var rows = [
      ["Field", "Value"],
      ["Email", email || ""],
      ["Contact", contact || ""],
      ["Requested at", new Date().toISOString()],
      ["Product", "Mangalam HDPE Pipes — full catalogue"],
    ];
    var trs = rows
      .map(function (r) {
        return (
          "<tr><td>" +
          escapeCell(r[0]) +
          "</td><td>" +
          escapeCell(r[1]) +
          "</td></tr>"
        );
      })
      .join("");
    var html =
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Brochure</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table border="1">' +
      trs +
      "</table></body></html>";
    var blob = new Blob(["\ufeff" + html], {
      type: "application/vnd.ms-excel",
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "Mangalam-Product-Brochure.xls";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function getModal(id) {
    return document.getElementById(id);
  }

  function openModal(id) {
    var modal = getModal(id);
    if (!modal) return;
    modal.classList.add("is-open");
    modal.removeAttribute("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    var focusable = modal.querySelector(
      'input:not([type="hidden"]), button:not([disabled]), select, textarea, [href]'
    );
    if (focusable) focusable.focus();
  }

  function closeModal(modal) {
    if (!modal || !modal.classList.contains("modal")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("hidden", "");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
  }

  function closeAllModals() {
    document.querySelectorAll(".modal.is-open").forEach(function (m) {
      closeModal(m);
    });
  }

  function initModals() {
    if (document.documentElement.getAttribute("data-modals-bound") === "1") {
      return;
    }
    document.documentElement.setAttribute("data-modals-bound", "1");

    document.addEventListener("click", function (e) {
      var openCat = e.target.closest("[data-open-catalogue-modal]");
      if (openCat) {
        e.preventDefault();
        openModal("modal-catalogue");
        return;
      }
      var openCb = e.target.closest("[data-open-callback-modal]");
      if (openCb) {
        e.preventDefault();
        openModal("modal-callback");
        return;
      }
      if (e.target.closest("[data-modal-close]")) {
        e.preventDefault();
        var modal = e.target.closest(".modal");
        closeModal(modal);
        return;
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var open = document.querySelector(".modal.is-open");
      if (open) {
        e.preventDefault();
        closeModal(open);
      }
    });

    var formCat = document.getElementById("form-catalogue");
    if (formCat) {
      formCat.addEventListener("submit", function (e) {
        e.preventDefault();
        var fd = new FormData(formCat);
        var email = (fd.get("email") || "").toString().trim();
        var contact = (fd.get("contact") || "").toString().trim();
        if (!email) return;
        downloadBrochureSpreadsheet(email, contact);
        formCat.dispatchEvent(
          new CustomEvent("mangalam:brochure-downloaded", {
            bubbles: true,
            detail: { email: email, contact: contact },
          })
        );
        closeModal(getModal("modal-catalogue"));
        formCat.reset();
      });
    }

    var formCb = document.getElementById("form-callback");
    if (formCb) {
      formCb.addEventListener("submit", function (e) {
        e.preventDefault();
        var fd = new FormData(formCb);
        formCb.dispatchEvent(
          new CustomEvent("mangalam:callback-submitted", {
            bubbles: true,
            detail: {
              fullName: fd.get("fullName"),
              company: fd.get("company"),
              email: fd.get("email"),
              dialCode: fd.get("dialCode"),
              phone: fd.get("phone"),
            },
          })
        );
        closeModal(getModal("modal-callback"));
        formCb.reset();
      });
    }
  }

  global.MangalamPage = global.MangalamPage || {};
  global.MangalamPage.initButtonModals = initModals;
  global.MangalamPage.prefillCatalogueEmail = function (email) {
    var input = document.getElementById("catalogue-email");
    if (input) input.value = email != null ? String(email) : "";
  };

  global.MangalamPage.openCatalogueModal = function () {
    openModal("modal-catalogue");
  };
  global.MangalamPage.openCallbackModal = function () {
    openModal("modal-callback");
  };
  global.MangalamPage.closeAllModals = closeAllModals;
})(typeof window !== "undefined" ? window : this);
