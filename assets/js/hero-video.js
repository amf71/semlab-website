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
  var CLIPS = [{"file":"IMG_5574","t":0.3,"rate":0.9,"hold":3333,"crop":1.1,"label":"Li Ka Shing Centre entrance","out":3.3,"off":[[0,7.8,0],[0.167,10,0],[0.333,7.1,0],[0.5,7.1,0],[0.667,5.8,0],[0.833,7.2,0],[1,7.2,0],[1.167,5.7,0],[1.333,6.7,0],[1.5,5.8,0],[1.667,2.7,0],[1.833,0.9,0],[2,0,0],[2.167,-0.4,0],[2.333,-0.8,0],[2.5,-1.5,0],[2.667,-3.1,0],[2.833,-6.6,0],[3,-13.3,0],[3.167,-21,0],[3.333,-27.3,0]]},{"file":"IMG_5500","t":2.8,"rate":0.8,"hold":3200,"crop":1.1,"label":"Li Ka Shing reception","out":5.36,"off":[[2.667,-1,-0.8],[2.833,6.4,-1.5],[3,3.9,1.6],[3.167,7.1,0.6],[3.333,3.9,-0.6],[3.5,1.9,-1.9],[3.667,1,0.8],[3.833,0.9,3.7],[4,-2.7,3],[4.167,-1.8,2.7],[4.333,3.5,2.9],[4.5,5.1,3.5],[4.667,-5.1,0.3],[4.833,-7.4,-3],[5,2.1,-2.7],[5.167,-5,-3],[5.333,-4.6,-4],[5.5,-8.9,-1.5]]},{"file":"IMG_5552","t":4.5,"rate":0.75,"hold":4533,"crop":1.1,"label":"Main lab, wide pan","out":7.9,"off":[[4.2,0,0],[8.2,0,0]]},{"file":"IMG_5543","t":1.2,"rate":0.95,"hold":4000,"crop":1.1,"label":"Multichannel pipetting","out":5,"off":[[1.033,-2.8,0.2],[1.2,-4.9,0.8],[1.367,-8.2,2.1],[1.533,-4.9,4.4],[1.7,-2.9,8.3],[1.867,-2,5.9],[2.033,-1.9,5.6],[2.2,-2.6,7.2],[2.367,-3.9,2.5],[2.533,-1.5,3],[2.7,0.7,0.3],[2.867,3.2,-2.3],[3.033,2.4,-5.6],[3.2,2.6,-6],[3.367,4.1,-3.7],[3.533,7.2,-3],[3.7,3.7,-3.7],[3.867,1.5,-5.9],[4.033,0.4,-5.4],[4.2,-0.1,-1.9],[4.367,-0.1,1.1],[4.533,0.4,4.1],[4.7,1.6,3.3],[4.867,3.5,-1.4],[5.033,2.4,-6.3],[5.2,2.3,-3.8]]},{"file":"IMG_5548","t":1.5,"rate":1,"hold":3500,"crop":1.1,"label":"Microcentrifuge","out":5,"off":[[1.333,0.4,1.5],[1.5,-2.1,0.9],[1.667,-1,0.2],[1.833,-0.6,-1.1],[2,-1.3,-3.4],[2.167,-3.1,-6.9],[2.333,-6.4,-4],[2.5,-3,-2.6],[2.667,-0.8,-2.5],[2.833,0.4,0.4],[3,0.9,-1.5],[3.167,1.2,-3.9],[3.333,1.3,1.3],[3.5,1.3,6.6],[3.667,1.3,4.4],[3.833,1.3,2.8],[4,1.3,1.9],[4.167,1.3,1.4],[4.333,1.3,1.2],[4.5,1.3,1.2],[4.667,1.3,1.3],[4.833,1.3,1.5],[5,1.3,1.6],[5.167,1.3,-2.3]]},{"file":"IMG_5537","t":0.15,"rate":0.9,"hold":2600,"crop":1.1,"label":"Microscope","out":2.49,"off":[[0,3.8,2.4],[0.167,12.8,4.1],[0.333,16.7,2.4],[0.5,16,1.3],[0.667,10.7,0.7],[0.833,8.5,0.5],[1,4.9,0.7],[1.167,-0.8,1.2],[1.333,2.7,1.9],[1.5,-1.2,-1.2],[1.667,-4.9,-0.2],[1.833,-0.9,0.7],[2,-5.9,-2.6],[2.167,-8.4,-2.2],[2.333,-13.2,-2.4],[2.5,-17,-3.2],[2.667,-24.2,-4.6]]},{"file":"IMG_5531","t":0.15,"rate":0.8,"hold":2400,"crop":1.14,"label":"Cryovials on ice","out":2.07,"off":[[0,-6,-3.2],[0.167,-5.4,0.8],[0.333,-17.1,1.4],[0.5,-30.5,7.1],[0.667,-34.5,6.4],[0.833,-33.3,3.5],[1,-10.2,6.9],[1.167,-3.7,12.6],[1.333,4.3,8.5],[1.5,7.9,6],[1.667,17.5,-3.7],[1.833,27.2,-9.8],[2,34.7,-17.5],[2.167,49,-19.5]]},{"file":"IMG_5539","t":3,"rate":0.8,"hold":5625,"crop":1.1,"label":"Tissue-culture hood (face visible)","out":7.5,"off":[[2.8,0.8,-3.3],[2.967,1.2,3.3],[3.133,1.7,2.2],[3.3,1.9,1.5],[3.467,-6.5,5.6],[3.633,-7.8,6.8],[3.8,-6.3,9.1],[3.967,-6.2,4.3],[4.133,-3.3,-4],[4.3,-1.3,-4.1],[4.467,0.2,-0.4],[4.633,1.7,-1.4],[4.8,3.5,-3.1],[4.967,5.9,-1.7],[5.133,5.1,-5.4],[5.3,1,-10.1],[5.467,1.4,-3.6],[5.633,-1.9,2.8],[5.8,-1.2,9.8],[5.967,-0.7,13.9],[6.133,-0.3,11.5],[6.3,0,2],[6.467,0.1,-7.2],[6.633,0.2,-9.4],[6.8,0.3,-9.5],[6.967,0.5,-16],[7.133,0.9,-21],[7.3,1.6,-3.7],[7.467,2.7,16.9],[7.633,4.4,14.1]]},{"file":"IMG_5559","t":5.9,"rate":1.05,"hold":3905,"crop":1.1,"label":"Loading the incubator","out":10,"off":[[5.667,0.7,9.7],[5.833,3.3,10],[6,6.8,8.5],[6.167,3.5,9.3],[6.333,1.4,4.2],[6.5,0.2,0.2],[6.667,-0.4,-3.6],[6.833,-0.7,-8.1],[7,-0.8,-6.1],[7.167,-1.1,-5.8],[7.333,-1.7,-7.2],[7.5,-2.8,-1.8],[7.667,-4.6,2.9],[7.833,-7.4,3.4],[8,-2.9,-0.4],[8.167,1.4,-4.5],[8.333,5.9,-5.2],[8.5,3.2,-2.9],[8.667,1.3,-1.4],[8.833,0.2,-0.6],[9,-0.4,-0.2],[9.167,-0.6,-0.1],[9.333,-0.7,0],[9.5,-0.7,0],[9.667,-0.7,0],[9.833,-0.7,0],[10,-0.7,0],[10.167,-0.7,0]]},{"file":"IMG_5564","t":5.3,"rate":0.9,"hold":7000,"crop":1.1,"label":"Frankell Group office, whiteboard discussion","out":11.6,"off":[[5.333,11,11],[5.5,11,11],[5.667,11,11],[5.833,5,9.8],[6,-1,3.8],[6.167,-7,-2.2],[6.333,-11,-7.4],[6.5,-11,-3.3],[6.667,-5,2.7],[6.833,1,7.9],[7,7,5.8],[7.167,11,-0.2],[7.333,11,-6.2],[7.5,6.2,-11],[7.667,-1.9,-6.8],[7.833,-7,-1.8],[8,-8.9,2.5],[8.167,-8.2,5.7],[8.333,-5.1,8.9],[8.5,-5.4,1.2],[8.667,-5,-5.7],[8.833,-3.7,-4.4],[9,-5.2,-3.4],[9.167,-1,-3],[9.333,1.3,-3.3],[9.5,2,-4.7],[9.667,1.3,-7],[9.833,-1,-6.4],[10,-5.1,-2.5],[10.167,-3.2,1.4],[10.333,-3.6,6.1],[10.5,-1.8,4.2],[10.667,2.7,4.4],[10.833,6.7,7.1],[11,11,8.4],[11.167,8,8.1],[11.333,6.1,1.4],[11.5,4.9,-4.7],[11.667,4.3,-11.8]]},{"file":"IMG_5566","t":3.5,"rate":1.05,"hold":4286,"crop":1.1,"label":"Reviewing spatial data","out":8,"off":[[3.333,0.8,-0.4],[3.5,0.8,-1.2],[3.667,0.8,-2.8],[3.833,0.8,-5.4],[4,0.8,-5.2],[4.167,0.8,-1.9],[4.333,0.8,0.9],[4.5,0.8,3.9],[4.667,0.8,7.6],[4.833,0.8,4.4],[5,0.8,2.3],[5.167,0.8,1.1],[5.333,0.8,0.6],[5.5,0.8,0.3],[5.667,0.8,0.2],[5.833,0.8,0.2],[6,0.8,0.2],[6.167,0.8,0],[6.333,0.7,-0.4],[6.5,0.7,-1.2],[6.667,0.4,-2.6],[6.833,-0.2,-5],[7,-1.4,-4.4],[7.167,-3.5,-0.6],[7.333,-6.8,2.6],[7.5,-3.5,1.4],[7.667,-1.4,0],[7.833,-0.2,-1.3],[8,0.4,1.6],[8.167,0.8,5.2]]},{"file":"IMG_5569","t":0.2,"rate":0.85,"hold":2824,"crop":1.1,"label":"Analysis at the desk","out":2.6,"off":[[0,6.2,-0.8],[0.167,7.1,-0.8],[0.333,1,-0.8],[0.5,-4.8,-0.8],[0.667,-2.8,-0.8],[0.833,-1.3,-0.8],[1,-0.4,-0.9],[1.167,0.1,-1],[1.333,0.3,-1.4],[1.5,0.4,-2.2],[1.667,0.4,-3.5],[1.833,0.4,-5.7],[2,0.3,-4.4],[2.167,0,0.6],[2.333,-0.7,6.4],[2.5,-1.9,6.3],[2.667,-4.1,10.8]]},{"file":"IMG_5568","t":1,"rate":1.05,"hold":3810,"crop":1.1,"label":"Computational bench","out":5,"off":[[0.833,7.8,-4],[1,3.1,-1.5],[1.167,0.1,0.3],[1.333,-2.5,2.3],[1.5,-1.5,5],[1.667,-1.2,4.4],[1.833,-1.9,0.5],[2,-3.8,-3.3],[2.167,-3.2,-7.4],[2.333,-4.2,-4.1],[2.5,-6.9,-1.3],[2.667,-3.3,1.4],[2.833,-1,4.7],[3,0.2,4.9],[3.167,0.8,2.3],[3.333,1,0.7],[3.5,1.2,-0.1],[3.667,1.3,-0.5],[3.833,1.6,-0.7],[4,2.3,-0.7],[4.167,3.4,-0.7],[4.333,4.8,-0.8],[4.5,2.5,-0.8],[4.667,-4.1,-1],[4.833,-7.2,-1.1],[5,-2.8,-1.3],[5.167,13.3,2.6]]},{"file":"IMG_5494","t":1,"rate":0.5,"hold":3900,"crop":1.1,"label":"The Hub — seating pan","out":2.95,"off":[[0.833,0,0],[3.167,0,0]]},{"file":"IMG_5498","t":6.2,"rate":0.8,"hold":2800,"crop":1.1,"label":"\"The Hub\" wall pan","out":8.44,"off":[[6,3.5,0.8],[6.167,7.9,1.1],[6.333,-0.4,1.9],[6.5,-1.5,3.4],[6.667,4.3,1.6],[6.833,1,0.4],[7,0.6,-0.3],[7.167,2.9,-0.7],[7.333,0,-0.9],[7.5,-0.3,-1],[7.667,1.9,-1],[7.833,-1.6,-1],[8,-3,-1],[8.167,-2.6,-1],[8.333,-4.4,-1],[8.5,-4.6,-1],[8.667,-2.9,-1]]},{"file":"IMG_5571","t":0.8,"rate":0.75,"hold":6400,"crop":1.1,"label":"Kitchen and write-up space","out":5.6,"off":[[0.5,0,0],[5.6,0,0]]},{"file":"IMG_5495","t":0.3,"rate":0.9,"hold":2800,"crop":1.1,"label":"Kitchen","out":2.82,"off":[[0.167,9.9,1],[0.333,8.5,1.6],[0.5,5.7,2.6],[0.667,5.3,3.9],[0.833,-1,1.4],[1,2.5,-1.3],[1.167,7.4,-4.4],[1.333,-2.5,-8.4],[1.5,-3.5,-5.4],[1.667,0,-3.4],[1.833,-4.2,1.8],[2,-4.3,2.6],[2.167,-0.3,-0.8],[2.333,-4.4,-0.2],[2.5,-4.6,0.4],[2.667,-1.1,1.3],[2.833,-6.1,2.6],[3,-7.8,4.2]]}];
  var FADE_MS = 800;
  var SRC_W = 1920, SRC_H = 1080;

  var root = document.querySelector(".hero-media");
  if (!root) return;
  var vids = Array.prototype.slice.call(root.querySelectorAll("video"));
  if (!vids.length) return;

  // Positional: a source split into several cuts repeats its <video> tag once
  // per cut, so DOM order must match CLIPS order rather than matching by filename.
  function confFor(v, i) {
    return CLIPS[i] || CLIPS[i % CLIPS.length];
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

  // Buffer AND seek to the in point before a clip is ever revealed. Assigning
  // currentTime on a readyState-0 element is silently dropped, which makes the
  // clip play from 0 and show the footage the cut list excludes.
  function prepare(v) {
    if (v._prep) return v._prep;
    var c = v._c;

    // A seek past the buffered range needs a range request and can take
    // seconds. Resolving on a timeout handed back a clip still parked at the
    // wrong time, so shots played from outside their cut window: retry the
    // seek until it lands, and report failure rather than false success.
    function seek(tries) {
      return new Promise(function (res) {
        if (Math.abs(v.currentTime - c.t) < 0.05) return res(true);
        var settled = false;
        function finish(ok) {
          if (settled) return;
          settled = true;
          v.removeEventListener("seeked", onSeeked);
          res(ok);
        }
        function onSeeked() { finish(Math.abs(v.currentTime - c.t) < 0.15); }
        v.addEventListener("seeked", onSeeked);
        try { v.currentTime = c.t; } catch (e) { return finish(false); }
        setTimeout(function () { finish(false); }, 2500);
      }).then(function (ok) { return ok || tries <= 0 ? ok : seek(tries - 1); });
    }

    // Fallback for hosts that serve video without HTTP range support, which
    // leaves `seekable` empty and silently rejects every seek. A normally
    // configured web server never needs this path.
    function viaBlob() {
      if (v._blobbed) return Promise.resolve(false);
      v._blobbed = true;
      return fetch(v.currentSrc || v.src)
        .then(function (r) { return r.ok ? r.blob() : Promise.reject(new Error(r.status)); })
        .then(function (b) {
          return new Promise(function (res) {
            v.src = URL.createObjectURL(b);
            v.addEventListener("canplay", function () { res(); }, { once: true });
            try { v.load(); } catch (e) { res(); }
            setTimeout(res, 8000);
          });
        })
        .then(function () { return seek(2); })
        .catch(function () { return false; });
    }

    function canSeek() { return v.seekable && v.seekable.length && v.seekable.end(0) > 0; }

    v._prep = ready(v).then(function () {
      v._et = c.t; v._eo = c.out; v._noSeek = false;
      var first = c.t > 0 && !canSeek() ? viaBlob() : seek(3);
      return Promise.resolve(first)
        .then(function (ok) { return ok ? true : viaBlob(); })
        .then(function (ok) {
          if (ok) { v._et = c.t; v._eo = c.out; return true; }
          // Truly unseekable source: play from 0 for the same screen time
          // rather than stalling the montage.
          v._noSeek = true;
          v._et = 0;
          v._eo = Math.min(v.duration || c.out, c.out - c.t);
          return true;
        });
    });
    return v._prep;
  }

  function atInPoint(v) {
    var inAt = v._et != null ? v._et : v._c.t;
    return Math.abs(v.currentTime - inAt) < 0.15;
  }

  var current = 0, handedOff = false, raf = null;

  function show(i) {
    var v = vids[i], c = v._c;
    // Never reveal a clip sitting outside its cut window — hold the previous
    // shot's frame and come back once the seek has landed.
    if (!atInPoint(v)) {
      var inAt = v._et != null ? v._et : c.t;
      try { v.currentTime = inAt; } catch (e) {}
      prepare(v);
      handedOff = false;
      return;
    }
    v.playbackRate = c.rate;
    var p = v.play(); if (p && p.catch) p.catch(function () {});
    vids.forEach(function (o, j) { o.classList.toggle("is-active", j === i); });
    var prevIdx = current;
    current = i; handedOff = false;
    if (prevIdx !== i) {
      var prev = vids[prevIdx];
      setTimeout(function () {
        if (current !== prevIdx) { prev._prep = null; prepare(prev); }
      }, FADE_MS);
    }
    var nx = vids[(i + 1) % vids.length];
    nx._prep = null;
    prepare(nx); // buffer AND seek the next shot now
  }

  function tick() {
    var active = vids[current], fadeSec = FADE_MS / 1000;
    // Self-heal: a refused or stalled play() (background tab, slow buffer)
    // recovers on the next frame instead of freezing the banner for good.
    if (active && active.paused && !document.hidden && active.currentTime < (active._eo != null ? active._eo : active._c.out)) {
      var pp = active.play(); if (pp && pp.catch) pp.catch(function () {});
    }
    vids.forEach(function (v) {
      var c = v._c, d = offsetAt(c, v.currentTime);
      v.style.transform = "translate(" + (-d[0] / SRC_W * 100).toFixed(3) + "%," +
        (-d[1] / SRC_H * 100).toFixed(3) + "%) scale(" + c.crop + ")";
      // an off-screen clip must never keep running: it drifts off its in point
      if (v !== active && !v.paused) { try { v.pause(); } catch (e) {} }
    });
    if (active && !handedOff &&
        active.currentTime >= (active._eo != null ? active._eo : active._c.out) - fadeSec * active.playbackRate) {
      var next = vids[(current + 1) % vids.length];
      // hold on the current shot until the next one is buffered AND seeked
      if (next.readyState >= 3 && atInPoint(next)) {
        handedOff = true;
        show((current + 1) % vids.length);
      } else {
        prepare(next);
        if (active.currentTime >= (active._eo != null ? active._eo : active._c.out)) { try { active.pause(); } catch (e) {} }
      }
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
    if (a && a.paused && a.currentTime < (a._eo != null ? a._eo : a._c.out)) {
      var p = a.play(); if (p && p.catch) p.catch(function () {});
    }
  }, 1000);

  prepare(vids[0]).then(function () { raf = requestAnimationFrame(tick); show(0); });
})();
