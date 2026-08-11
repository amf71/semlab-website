/* ============================================================
   SEM Lab — hero banner player (stabilised cut)
   Replaces the plain crossfader. Each clip plays a fixed in/out
   window at its own rate, cropped in and shifted per frame to
   cancel the handheld wobble measured in the source footage.
   The hand-off runs off each video's own clock, so a clip never
   plays past its out point while the next one buffers.
   Cut list: see CLIPS below (t/out in source seconds).
   ============================================================ */
(function () {
  "use strict";
  var CLIPS = [{"file":"IMG_5494","t":1,"rate":0.65,"hold":3000,"crop":1.1,"label":"The Hub — seating pan","out":2.95,"off":[[0.833,17.2,-1.3],[1,15.7,-0.5],[1.167,2.7,0.5],[1.333,5.5,1.8],[1.5,3.4,3.7],[1.667,-0.3,2.3],[1.833,-6.1,1.6],[2,1.5,1.5],[2.167,-1.8,-2.3],[2.333,-4.4,-1.9],[2.5,-6.7,-1.6],[2.667,-9,-1.3],[2.833,-11.4,-1.1],[3,-5.8,-1],[3.167,-0.2,-0.9]]},{"file":"IMG_5537","t":0.15,"rate":0.9,"hold":2600,"crop":1.1,"label":"Microscope","out":2.49,"off":[[0,3.8,2.4],[0.167,12.8,4.1],[0.333,16.7,2.4],[0.5,16,1.3],[0.667,10.7,0.7],[0.833,8.5,0.5],[1,4.9,0.7],[1.167,-0.8,1.2],[1.333,2.7,1.9],[1.5,-1.2,-1.2],[1.667,-4.9,-0.2],[1.833,-0.9,0.7],[2,-5.9,-2.6],[2.167,-8.4,-2.2],[2.333,-13.2,-2.4],[2.5,-17,-3.2],[2.667,-24.2,-4.6]]},{"file":"IMG_5495","t":0.3,"rate":0.9,"hold":2800,"crop":1.1,"label":"Kitchen","out":2.82,"off":[[0.167,9.9,1],[0.333,8.5,1.6],[0.5,5.7,2.6],[0.667,5.3,3.9],[0.833,-1,1.4],[1,2.5,-1.3],[1.167,7.4,-4.4],[1.333,-2.5,-8.4],[1.5,-3.5,-5.4],[1.667,0,-3.4],[1.833,-4.2,1.8],[2,-4.3,2.6],[2.167,-0.3,-0.8],[2.333,-4.4,-0.2],[2.5,-4.6,0.4],[2.667,-1.1,1.3],[2.833,-6.1,2.6],[3,-7.8,4.2]]},{"file":"IMG_5539","t":1.2,"rate":1,"hold":3200,"crop":1.1,"label":"Tissue-culture hood","out":4.4,"off":[[1,5.8,1.8],[1.167,6.2,2.8],[1.333,7.4,0.3],[1.5,5.1,-1.9],[1.667,3.1,0],[1.833,1.1,-2.2],[2,-1.5,-4.7],[2.167,-0.9,-3.6],[2.333,-1.6,-3.1],[2.5,-3.8,-3],[2.667,-7.8,-3.1],[2.833,-5.7,0.9],[3,-1.4,5.3],[3.167,1.3,2.5],[3.333,-1.5,4.9],[3.5,-1.7,4.8],[3.667,-3.4,6.1],[3.833,-2.3,8.7],[4,-2.6,0.2],[4.167,0,-7.9],[4.333,1.9,-4],[4.5,3.3,-4.6]]},{"file":"IMG_5500","t":2.8,"rate":0.8,"hold":3200,"crop":1.1,"label":"Li Ka Shing reception","out":5.36,"off":[[2.667,-1,-0.8],[2.833,6.4,-1.5],[3,3.9,1.6],[3.167,7.1,0.6],[3.333,3.9,-0.6],[3.5,1.9,-1.9],[3.667,1,0.8],[3.833,0.9,3.7],[4,-2.7,3],[4.167,-1.8,2.7],[4.333,3.5,2.9],[4.5,5.1,3.5],[4.667,-5.1,0.3],[4.833,-7.4,-3],[5,2.1,-2.7],[5.167,-5,-3],[5.333,-4.6,-4],[5.5,-8.9,-1.5]]},{"file":"IMG_5531","t":0.15,"rate":0.8,"hold":2400,"crop":1.14,"label":"Cryovials on ice","out":2.07,"off":[[0,-6,-3.2],[0.167,-5.4,0.8],[0.333,-17.1,1.4],[0.5,-30.5,7.1],[0.667,-34.5,6.4],[0.833,-33.3,3.5],[1,-10.2,6.9],[1.167,-3.7,12.6],[1.333,4.3,8.5],[1.5,7.9,6],[1.667,17.5,-3.7],[1.833,27.2,-9.8],[2,34.7,-17.5],[2.167,49,-19.5]]},{"file":"IMG_5498","t":6.2,"rate":0.8,"hold":2800,"crop":1.1,"label":"\"The Hub\" wall pan","out":8.44,"off":[[6,3.5,0.8],[6.167,7.9,1.1],[6.333,-0.4,1.9],[6.5,-1.5,3.4],[6.667,4.3,1.6],[6.833,1,0.4],[7,0.6,-0.3],[7.167,2.9,-0.7],[7.333,0,-0.9],[7.5,-0.3,-1],[7.667,1.9,-1],[7.833,-1.6,-1],[8,-3,-1],[8.167,-2.6,-1],[8.333,-4.4,-1],[8.5,-4.6,-1],[8.667,-2.9,-1]]}];
  var FADE_MS = 800;
  var SRC_W = 1920, SRC_H = 1080;

  var root = document.querySelector(".hero-media");
  if (!root) return;
  var vids = Array.prototype.slice.call(root.querySelectorAll("video"));
  if (!vids.length) return;

  function confFor(v, i) {
    var src = v.getAttribute("src") || v.getAttribute("data-src") || "", hit = null;
    for (var k = 0; k < CLIPS.length; k++) { if (src.indexOf(CLIPS[k].file) !== -1) hit = CLIPS[k]; }
    return hit || CLIPS[i % CLIPS.length];
  }

  vids.forEach(function (v, i) {
    var c = confFor(v, i);
    v._c = c;
    v.muted = true; v.playsInline = true; v.loop = false;
    v.style.transition = "opacity " + FADE_MS + "ms linear";
    v.style.willChange = "opacity, transform";
    v.style.transform = "scale(" + c.crop + ")";
    v.playbackRate = c.rate;
    var ds = v.getAttribute("data-src");
    if (ds) { v.setAttribute("src", ds); v.removeAttribute("data-src"); }
    v.preload = i === 0 ? "auto" : "metadata";
  });

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var v0 = vids[0];
    vids.forEach(function (v, i) { v.classList.toggle("is-active", i === 0); });
    v0.addEventListener("loadeddata", function () {
      try { v0.currentTime = v0._c.t + 0.4; } catch (e) {}
    }, { once: true });
    return; // one held frame, no motion
  }

  function offsetAt(c, t) {
    var o = c.off, n = o.length;
    if (!n) return [0, 0];
    if (t <= o[0][0]) return [o[0][1], o[0][2]];
    for (var i = 1; i < n; i++) {
      if (t <= o[i][0]) {
        var a = o[i - 1], b = o[i], f = (t - a[0]) / (b[0] - a[0]);
        return [a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
      }
    }
    return [o[n - 1][1], o[n - 1][2]];
  }

  function ready(v) {
    if (v.readyState >= 3) return Promise.resolve();
    v.preload = "auto";
    if (v.readyState === 0) { try { v.load(); } catch (e) {} }
    return new Promise(function (res) { v.addEventListener("canplay", res, { once: true }); });
  }

  var current = 0, handedOff = false, raf = null;

  function show(i) {
    var v = vids[i], c = v._c;
    try { v.currentTime = c.t; } catch (e) {}
    v.playbackRate = c.rate;
    var p = v.play(); if (p && p.catch) p.catch(function () {});
    vids.forEach(function (o, j) { o.classList.toggle("is-active", j === i); });
    current = i; handedOff = false;
    ready(vids[(i + 1) % vids.length]); // buffer the next shot now
  }

  function tick() {
    var active = vids[current], fadeSec = FADE_MS / 1000;
    // Self-heal: a refused or stalled play() (background tab, slow buffer)
    // recovers on the next frame instead of freezing the banner for good.
    if (active && active.paused && !document.hidden && active.currentTime < active._c.out) {
      var pp = active.play(); if (pp && pp.catch) pp.catch(function () {});
    }
    vids.forEach(function (v) {
      var c = v._c, d = offsetAt(c, v.currentTime);
      v.style.transform = "translate(" + (-d[0] / SRC_W * 100).toFixed(3) + "%," +
        (-d[1] / SRC_H * 100).toFixed(3) + "%) scale(" + c.crop + ")";
      if (v !== active && !v.paused && v.currentTime >= c.out) { try { v.pause(); } catch (e) {} }
    });
    if (active && !handedOff && !active.paused &&
        active.currentTime >= active._c.out - fadeSec * active.playbackRate) {
      handedOff = true;
      show((current + 1) % vids.length);
    }
    raf = requestAnimationFrame(tick);
  }

  document.addEventListener("visibilitychange", function () {
    var a = vids[current];
    if (document.hidden) {
      cancelAnimationFrame(raf); raf = null;
      try { a.pause(); } catch (e) {}
    } else if (!raf) {
      raf = requestAnimationFrame(tick); // tick() restarts playback
    }
  });

  // Watchdog: on some browsers/embeds rAF itself gets throttled or dropped
  // (backgrounded webview, low-power mode) independently of visibilitychange.
  // A second, cheap timer can't hurt and guarantees the banner never sticks
  // on a paused frame indefinitely.
  setInterval(function () {
    if (document.hidden) return;
    if (!raf) { raf = requestAnimationFrame(tick); return; }
    var a = vids[current];
    if (a && a.paused && a.currentTime < a._c.out) {
      var p = a.play(); if (p && p.catch) p.catch(function () {});
    }
  }, 1000);

  ready(vids[0]).then(function () { raf = requestAnimationFrame(tick); show(0); });
})();
