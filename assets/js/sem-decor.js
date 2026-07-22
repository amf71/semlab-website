/* ============================================================
   SEM Lab — data-motif decorations
   Renders atmospheric, on-brand SVG backdrops that echo the
   lab's own figure types: fishplots (nested clone streams),
   cloneMaps (irregular coloured clone territories), phylogenetic
   lineages and a fine DNA texture.

   Usage:  <div class="decor" data-decor="fishplot" data-seed="7"></div>
   Motifs: fishplot | clonemap | lineage | dna
   All output is inert (aria-hidden, pointer-events:none) and
   sits behind content via CSS (.decor).
   ============================================================ */
(function () {
  "use strict";

  // deterministic PRNG so a given seed always draws the same art
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // indigo tint ramp (lab accent → pale wash) — used by fishplot/dna
  var TINTS = ["#2a2560", "#3d348b", "#5a4fb0", "#7a6fc9", "#9a90db", "#bcb3ea", "#d8d2f3"];

  // ---- smoothing: build a smooth path through points (midpoint quadratics)
  function smooth(pts) {
    if (pts.length < 2) return "";
    var d = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
    for (var i = 1; i < pts.length - 1; i++) {
      var mx = (pts[i][0] + pts[i + 1][0]) / 2;
      var my = (pts[i][1] + pts[i + 1][1]) / 2;
      d += "Q" + pts[i][0].toFixed(1) + " " + pts[i][1].toFixed(1) + " " + mx.toFixed(1) + " " + my.toFixed(1);
    }
    var n = pts.length - 1;
    d += "L" + pts[n][0].toFixed(1) + " " + pts[n][1].toFixed(1);
    return d;
  }

  // ============================================================ FISHPLOT
  // nested clone-frequency streams, born at staggered times, all
  // centred on a wandering baseline — the classic "fish".
  function fishplot(seed) {
    var r = mulberry32(seed || 1);
    var W = 1200, H = 600, y0 = H * 0.52;
    var xs = [], N = 30, x0 = 120, x1 = 1180;
    for (var i = 0; i <= N; i++) xs.push(x0 + (x1 - x0) * i / N);

    var base = xs.map(function (x, i) { return y0 + Math.sin(i * 0.32 + r() * 6) * 26 + (i / N) * 30; });

    var clones = [
      { born: 0.00, amp: 210, wob: 0.9, tint: 5 },
      { born: 0.02, amp: 150, wob: 1.3, tint: 4 },
      { born: 0.10, amp: 96,  wob: 1.7, tint: 3 },
      { born: 0.18, amp: 120, wob: 1.1, tint: 3 },
      { born: 0.30, amp: 60,  wob: 2.1, tint: 2 },
      { born: 0.42, amp: 78,  wob: 1.5, tint: 2 },
      { born: 0.55, amp: 40,  wob: 2.6, tint: 1 },
      { born: 0.66, amp: 30,  wob: 3.0, tint: 1 }
    ];

    var paths = "";
    clones.forEach(function (c, ci) {
      var ph = r() * 6.28;
      var top = [], bot = [];
      for (var i = 0; i <= N; i++) {
        var t = i / N;
        var g = t < c.born ? 0 : Math.min(1, (t - c.born) / 0.18);
        var env = Math.sin(Math.PI * Math.min(1, (t - c.born) / (1 - c.born + 0.001)));
        env = Math.max(0, env);
        var wob = 1 + 0.28 * Math.sin(t * 6.5 * c.wob + ph);
        var th = c.amp * g * env * wob * 0.5;
        top.push([xs[i], base[i] - th]);
        bot.push([xs[i], base[i] + th]);
      }
      var d = smooth(top);
      var rb = bot.slice().reverse();
      d += "L" + rb[0][0].toFixed(1) + " " + rb[0][1].toFixed(1);
      for (var j = 1; j < rb.length - 1; j++) {
        var mx = (rb[j][0] + rb[j + 1][0]) / 2, my = (rb[j][1] + rb[j + 1][1]) / 2;
        d += "Q" + rb[j][0].toFixed(1) + " " + rb[j][1].toFixed(1) + " " + mx.toFixed(1) + " " + my.toFixed(1);
      }
      d += "L" + rb[rb.length - 1][0].toFixed(1) + " " + rb[rb.length - 1][1].toFixed(1) + "Z";
      var dur = (26 + ci * 3).toFixed(0);
      paths += '<path d="' + d + '" fill="' + TINTS[c.tint] + '" fill-opacity="' + (0.5 - ci * 0.03).toFixed(2) +
               '" class="fp-band" style="--dur:' + dur + 's;--d:' + (ci * 0.7).toFixed(1) + 's"/>';
    });

    return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
           paths + '</svg>';
  }

  // ============================================================ CLONEMAP
  // Faithful to the R package: a circular "sample" territory filled with
  // irregular, distinctly-coloured clone blobs packed and nested by
  // phylogeny (parent -> child -> grandchild). Palette echoes cloneMap's
  // RColorBrewer "Paired" default, with the lab indigo leading.
  var CLONE_COLS = ["#3d348b", "#3F8EAA", "#79C360", "#FDB762", "#ED8F47",
                    "#E52829", "#9471B4", "#A6CEE3", "#B15928", "#DDD399"];

  // organic near-circular blob (radial wobble -> smooth closed path)
  function blobPath(cx, cy, R, r) {
    var K = 16, pts = [];
    for (var i = 0; i < K; i++) {
      var a = (i / K) * 6.28319;
      var rr = R * (1 + (r() - 0.5) * 0.20);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    var s0x = (pts[0][0] + pts[K - 1][0]) / 2, s0y = (pts[0][1] + pts[K - 1][1]) / 2;
    var d = "M" + s0x.toFixed(1) + " " + s0y.toFixed(1);
    for (var i = 0; i < K; i++) {
      var p = pts[i], nx = pts[(i + 1) % K];
      var mx = (p[0] + nx[0]) / 2, my = (p[1] + nx[1]) / 2;
      d += "Q" + p[0].toFixed(1) + " " + p[1].toFixed(1) + " " + mx.toFixed(1) + " " + my.toFixed(1);
    }
    return d + "Z";
  }

  function clonemap(seed) {
    var r = mulberry32(seed || 1);
    var W = 620, H = 620;
    var blobs = [], ci = 0;
    function place(cx, cy, R, depth, colIdx) {
      blobs.push({ x: cx, y: cy, r: R, c: CLONE_COLS[colIdx % CLONE_COLS.length], depth: depth, d: blobPath(cx, cy, R, r) });
      if (depth >= 2 || R < 42) return;
      var kids = depth === 0 ? (3 + Math.floor(r() * 3)) : (1 + Math.floor(r() * 3));
      var placed = [], tries = 0;
      while (placed.length < kids && tries < 240) {
        tries++;
        var kr = R * (depth === 0 ? (0.20 + r() * 0.26) : (0.32 + r() * 0.30));
        var ang = r() * 6.28319, rad = r() * (R - kr - R * 0.08);
        var kx = cx + Math.cos(ang) * rad, ky = cy + Math.sin(ang) * rad;
        var ok = true;
        for (var i = 0; i < placed.length; i++) {
          if (Math.hypot(kx - placed[i].x, ky - placed[i].y) < kr + placed[i].r + 9) { ok = false; break; }
        }
        if (ok) { placed.push({ x: kx, y: ky, r: kr }); ci++; place(kx, ky, kr, depth + 1, ci); }
      }
    }
    place(W / 2, H / 2, 294, 0, 0);

    var out = "";
    blobs.forEach(function (b, i) {
      out += '<path d="' + b.d + '" fill="' + b.c + '" fill-opacity="' + (b.depth === 0 ? 0.46 : 0.86) +
             '" stroke="#2a2560" stroke-opacity="0.55" stroke-width="1.4" class="cm-node" style="--d:' +
             (i * 0.08).toFixed(2) + 's;transform-origin:' + b.x.toFixed(1) + 'px ' + b.y.toFixed(1) + 'px"/>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
           out + '</svg>';
  }

  // ============================================================ LINEAGE
  // phylogenetic tree branching left->right with node dots
  function lineage(seed) {
    var r = mulberry32(seed || 1);
    var W = 1200, H = 520;
    var segs = "", dots = "";
    // Each branch owns a vertical band [yMin, yMax] and sits at its centre.
    // Its two children are placed at the centres of the upper and lower
    // half-bands, so sibling subtrees occupy strictly disjoint vertical space:
    // branches only ever diverge and can never converge or overlap, as in a
    // real phylogeny.
    function branch(x, y, len, depth, yMin, yMax) {
      var x2 = x + len;
      segs += line(x, y, x2, y);
      if (depth > 4 || len < 40) { dots += node(x2, y, 3.4); return; }
      var xm = x2 + len * 0.5;
      var upY = (yMin + y) / 2, dnY = (y + yMax) / 2;
      segs += curve(x2, y, xm, upY);
      segs += curve(x2, y, xm, dnY);
      dots += node(x2, y, 2.6);
      branch(xm, upY, len * 0.66, depth + 1, yMin, y);
      branch(xm, dnY, len * 0.66, depth + 1, y, yMax);
    }
    function line(a, b, c, d) { return '<path d="M' + a + ' ' + b + 'H' + c + '" class="ln"/>'; }
    function curve(a, b, c, d) { return '<path d="M' + a + ' ' + b + 'C' + ((a + c) / 2).toFixed(0) + ' ' + b + ' ' + a + ' ' + d + ' ' + c + ' ' + d + '" class="ln"/>'; }
    function node(x, y, rr) { return '<circle cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="' + rr + '" class="nd"/>'; }
    // The band spans wider than the 520-unit viewBox so the outermost branches
    // run off the top and bottom of the hero (cropped by "slice"). The first
    // split gap equals half the band height (= `half`), kept larger than the
    // hero text block so the tree frames it.
    var cy = H / 2, half = H * 0.65;
    branch(-40, cy, 300, 0, cy - half, cy + half);
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
           '<g fill="none" stroke="#3d348b" stroke-width="1.1">' + segs + '</g>' +
           '<g fill="#3d348b">' + dots + '</g></svg>';
  }

  // ============================================================ DNA
  // fine base-pair ladder texture
  function dna(seed) {
    var r = mulberry32(seed || 1);
    var W = 1200, H = 220, rungs = "";
    var n = 46, amp = 60, yc = H / 2;
    for (var i = 0; i <= n; i++) {
      var x = 40 + (W - 80) * i / n;
      var ph = i * 0.5;
      var y1 = yc + Math.sin(ph) * amp, y2 = yc + Math.sin(ph + Math.PI) * amp;
      rungs += '<line x1="' + x.toFixed(0) + '" y1="' + y1.toFixed(0) + '" x2="' + x.toFixed(0) + '" y2="' + y2.toFixed(0) +
               '" stroke="#3d348b" stroke-width="1" stroke-opacity="' + (0.25 + 0.25 * Math.abs(Math.cos(ph))).toFixed(2) + '"/>';
      rungs += '<circle cx="' + x.toFixed(0) + '" cy="' + y1.toFixed(0) + '" r="2.2" fill="#5a4fb0"/>';
      rungs += '<circle cx="' + x.toFixed(0) + '" cy="' + y2.toFixed(0) + '" r="2.2" fill="#7a6fc9"/>';
    }
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + rungs + '</svg>';
  }

  var GEN = { fishplot: fishplot, clonemap: clonemap, lineage: lineage, dna: dna };

  function render(el) {
    var kind = el.getAttribute("data-decor");
    var seed = parseInt(el.getAttribute("data-seed") || "1", 10);
    if (GEN[kind]) el.innerHTML = GEN[kind](seed);
  }

  function init() { document.querySelectorAll("[data-decor]").forEach(render); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.SEMDecor = { render: render, generate: function (k, s) { return GEN[k] ? GEN[k](s) : ""; } };
})();
