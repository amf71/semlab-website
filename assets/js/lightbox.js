/* Gallery lightbox: click a gallery image to view it enlarged, click
   through neighbours with prev/next or arrow keys. Self-contained;
   no-ops on pages without any .gallery-trigger elements. */
(function () {
  "use strict";

  function init() {
    var triggers = Array.prototype.slice.call(document.querySelectorAll(".gallery-trigger"));
    if (!triggers.length) return;

    var items = triggers.map(function (btn) {
      return { src: btn.getAttribute("data-lightbox-src"), caption: btn.getAttribute("data-lightbox-caption") || "" };
    });

    var current = -1;
    var lastFocused = null;

    var overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Image viewer");
    overlay.hidden = true;
    overlay.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Close">&times;</button>' +
      '<button type="button" class="lightbox-prev" aria-label="Previous image">&#8249;</button>' +
      '<button type="button" class="lightbox-next" aria-label="Next image">&#8250;</button>' +
      '<figure class="lightbox-figure">' +
        '<img class="lightbox-img" alt="">' +
        '<figcaption class="lightbox-caption"></figcaption>' +
      "</figure>";
    document.body.appendChild(overlay);

    var imgEl = overlay.querySelector(".lightbox-img");
    var capEl = overlay.querySelector(".lightbox-caption");
    var closeBtn = overlay.querySelector(".lightbox-close");
    var prevBtn = overlay.querySelector(".lightbox-prev");
    var nextBtn = overlay.querySelector(".lightbox-next");

    function preload(i) {
      if (i < 0 || i >= items.length) return;
      var im = new Image();
      im.src = items[i].src;
    }

    function show(i) {
      current = (i + items.length) % items.length;
      var it = items[current];
      imgEl.src = it.src;
      imgEl.alt = it.caption;
      capEl.textContent = it.caption;
      preload(current + 1 >= items.length ? 0 : current + 1);
      preload(current - 1 < 0 ? items.length - 1 : current - 1);
    }

    function open(i, triggerEl) {
      lastFocused = triggerEl || document.activeElement;
      show(i);
      overlay.hidden = false;
      requestAnimationFrame(function () { overlay.classList.add("is-open"); });
      document.body.style.overflow = "hidden";
      closeBtn.focus();
      document.addEventListener("keydown", onKeydown);
    }

    function close() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeydown);
      window.setTimeout(function () { overlay.hidden = true; }, 200);
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    function next() { show(current + 1); }
    function prev() { show(current - 1); }

    function onKeydown(e) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }

    triggers.forEach(function (btn, i) {
      btn.addEventListener("click", function () { open(i, btn); });
    });
    closeBtn.addEventListener("click", close);
    nextBtn.addEventListener("click", next);
    prevBtn.addEventListener("click", prev);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
