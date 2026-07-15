# SEM Lab — data-motif decorations · install guide

Adds atmospheric, on-brand backdrops that echo the lab's own figures —
**fishplots** (nested clone streams), **cloneMaps** (circle-packed subclones),
**phylogenetic lineages**, and a **DNA** base-pair texture — to the Home hero,
Research and Software pages. Pure vector (no image assets), themed to the existing
palette, animated subtly, and disabled under `prefers-reduced-motion`.

## Files
- `sem-decor.js`  → put in `static/js/sem-decor.js`  (served at `/js/sem-decor.js`)
- `decor.css`     → paste its contents at the END of your stylesheet
  (`assets/css/main.css` in the Hugo source — the file that builds
  `/css/main.<hash>.css`). Tokens/animations already match `:root`.

## 1. Load the script (once, before `</body>` in your base layout)
```html
<script defer src="/js/sem-decor.js"></script>
```

## 2. Home hero — add two backdrops as the FIRST children of `<section class="hero">`
```html
<div class="decor decor--lineage" data-decor="lineage" data-seed="4"></div>
<div class="decor decor--fish"    data-decor="fishplot" data-seed="9"></div>
```
(The hero already positions its content above via `z-index`; nothing else changes.
You can keep or remove the old inline `.hero-lineage` SVG — this replaces it.)

## 3. Home "Research themes" section — cloneMap bleeding off the edge
As the first child of that `<section class="section-alt">`:
```html
<div class="decor decor--clone-edge" data-decor="clonemap" data-seed="12"></div>
```

## 4. Research page — fishplot behind the header
First child of `<section class="page-head">`:
```html
<div class="decor decor--fish" data-decor="fishplot" data-seed="21"></div>
```

## 5. Software page — cloneMap beside the header
First child of `<section class="page-head">`:
```html
<div class="decor decor--clone" data-decor="clonemap" data-seed="5"></div>
```

## Optional — DNA texture (footers/dividers)
```html
<div class="decor decor--dna" data-decor="dna" data-seed="2"></div>
```

## Tuning
- **Change the pattern:** edit `data-seed` (any integer) — deterministic, so a
  seed always redraws the same art.
- **Change strength:** the per-placement `opacity` values live at the top of
  `decor.css`. Fishplot/cloneMap are the loudest; lineage is faint by design.
- **Motifs available:** `data-decor="fishplot | clonemap | lineage | dna"`.

## Note on Hugo
These snippets belong in your layout **partials/templates** (hero partial,
`page-head` partial) so they survive `hugo` rebuilds — not only in the generated
`public/` HTML. `sem-decor.js` goes in `static/`, which Hugo copies verbatim.

See `preview.html` for the rendered result across all three pages.

NOTE: a stray 17-byte placeholder `sem-decor.js` was created in the Lab website
root by mistake — safe to delete; the real one lives in this folder.
