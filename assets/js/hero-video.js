/* ============================================================
   SEM Lab — hero background video crossfader
   Cycles the muted clips inside .hero-media, fading between them.
   Only the first <video> has a real src (autoplay+loop), so the
   hero still works with JS disabled — it just won't cycle.
   ============================================================ */
(function () {
  "use strict";

  var root = document.querySelector(".hero-media");
  if (!root) return;

  var vids = Array.prototype.slice.call(root.querySelectorAll("video"));
  if (vids.length < 2) return;

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return; // leave the single autoplaying/looping clip as-is
  }

  var SEGMENT_MS = 4200; // how long each clip stays on screen
  var FADE_MS = 900;     // crossfade duration, kept in sync with the CSS transition
  var IN_POINT = 0.4;    // skip the shaky first frames of each clip

  vids.forEach(function (v) {
    v.style.transition = "opacity " + FADE_MS + "ms linear";
    var src = v.getAttribute("data-src");
    if (src) {
      v.setAttribute("src", src);
      v.preload = "auto";
      v.removeAttribute("data-src");
    }
  });

  var current = 0;
  var timer = null;

  function ready(v) {
    if (v.readyState >= 3) return Promise.resolve();
    return new Promise(function (resolve) {
      v.addEventListener("canplay", resolve, { once: true });
    });
  }

  function show(i) {
    var outgoingIndex = current;
    var v = vids[i];

    try { v.currentTime = IN_POINT; } catch (e) {}
    var p = v.play();
    if (p && p.catch) p.catch(function () {});

    vids.forEach(function (o, j) { o.classList.toggle("is-active", j === i); });
    current = i;

    if (outgoingIndex !== i) {
      var outgoing = vids[outgoingIndex];
      setTimeout(function () {
        if (current !== outgoingIndex) { try { outgoing.pause(); } catch (e) {} }
      }, FADE_MS);
    }

    clearTimeout(timer);
    var next = (i + 1) % vids.length;
    timer = setTimeout(function () {
      ready(vids[next]).then(function () { show(next); });
    }, SEGMENT_MS);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      clearTimeout(timer);
    } else if (!timer) {
      var next = (current + 1) % vids.length;
      ready(vids[next]).then(function () { show(next); });
    }
  });

  vids[0].classList.add("is-active");
  ready(vids[0]).then(function () {
    var next = 1 % vids.length;
    timer = setTimeout(function () {
      ready(vids[next]).then(function () { show(next); });
    }, SEGMENT_MS);
  });
})();
