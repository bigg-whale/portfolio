# PROJECT MAP

Last verified: working tree on branch `sinos-play` on top of commit `2dbda4a`, 2026-11-17 (uncommitted). Labels: VERIFIED (checked by command or browser run) / INFERENCE / UNKNOWN.

## Purpose
One-page personal portfolio for "Sin", plus one sub-page (`sinos/`) that boots the owner's hobby OS in the browser through the self-hosted v86 emulator. Static, no build, no package manager. Live at https://bigg-whale.github.io/portfolio/ (GitHub Pages, `main`, root).

## Tree
```
index.html        markup for every section, CSP meta, social-preview meta, music player
css/style.css     all styling; colour tokens in :root; motion rules gated on html.js-motion
js/projects.js    data only: window.PROJECTS
js/render.js      builds project cards from window.PROJECTS; safeUrl; profile photo swap; profile card alignment
js/player.js      play / pause for the corner audio player
js/motion.js      all animation: hero entrance, scroll reveals, count-up, tickers, tilt
assets/img        me.jpg (profile), sih-1..4.png (screenshots; sih-1 doubles as og:image), sinos-1..2.png (SinOS screenshots)
assets/audio      trouble.mp3
sinos/            play page, separate document with its own (relaxed) CSP:
  index.html      page shell + CSP meta
  play.js, play.css   boot/restart UI, v86 configuration, keyboard focus handling
  v86/            third-party, vendored: libv86.js, v86.wasm, seabios.bin, vgabios.bin, COPYING.LESSER, LICENSE
  sinos.img       1 MiB boot disk (SinOS built with its own bootloader)
  data.img        16 MiB FAT16 data disk, fetched lazily with HTTP Range requests; writes stay in browser memory
docs/             this documentation set
```
Local-only, git-ignored: `.claude/`, `.playwright-mcp/`, `DESIGN.md`, `portfolio-design.md`.

## Entry points and load order
`sinos/index.html` is an independent entry point (linked from the SinOS card via `links.play = "sinos/"`); it loads `v86/libv86.js` then `play.js` and shares no JS with the homepage. See `docs/ARCHITECTURE.md`.

`index.html` loads, at the end of `<body>` and in this order: `projects.js` → `render.js` → `player.js` → `motion.js`. Order matters: `render.js` needs `window.PROJECTS`; `motion.js` decorates the cards `render.js` created.

## Commands
| Action | Command |
|---|---|
| Run | `python -m http.server 8000` then http://localhost:8000 (or open `index.html` from disk) |
| Syntax check | `node --check js/render.js` (repeat per file) |
| Secret scan | `gitleaks detect --source . --redact` |
| Run play page locally | needs a Range-capable static server (see Gotchas); then http://localhost:8000/sinos/ |
| Deploy | push to `main` |

There is no build, linter config or automated test suite.

## Conventions
- ES5-style JS in IIFEs with `"use strict"`, no modules, no globals except `window.PROJECTS`.
- DOM is built with `createElement` + `textContent`. Never `innerHTML` (blocked by the CSP).
- Styles live in `css/style.css`. No `style=""` attributes or `<style>` blocks (blocked by the CSP). JS may write `el.style`.
- `sinos/` follows the same rules (ES5, `textContent`, no inline styles) except that v86 itself uses `innerHTML`; the play page CSP is relaxed for that reason (`docs/SECURITY.md`). Do not copy the relaxed CSP to `index.html`.
- Content edits happen in `index.html` and `js/projects.js`; `render.js` should not need changes to add a project. A link key with no entry in `LINK_LABELS` is labelled `<key> ↗`; `play` is labelled "Play in browser ↗".

## Invariants
- The page must be fully readable with JavaScript off, with `prefers-reduced-motion: reduce`, and without `motion.js`.
- Hidden-until-revealed states exist only under `html.js-motion`, a class that only `motion.js` adds.
- Never render a link or button with an empty or unsafe URL: everything from `window.PROJECTS` goes through `safeUrl`.
- The audio never autoplays.
- The play page never boots without a click, and its emulator speaker stays disabled.
- `sinos/v86/*` is vendored third-party code: never edit it; replace it wholesale and update the hashes in `docs/SECURITY.md`.

## Gotchas
- The hero entrance waits for `requestAnimationFrame`; a tab that is not being painted (some embedded previews) stays blank until it is shown.
- Do not put `transform-style: preserve-3d` back on `.shape` (hero floating shapes). It caused owner-visible scroll stutter in Chrome/Brave 157 that frame-timing traces did not show; see `CHANGELOG.md`, Performance. Nothing inside a shape may use a 3D transform, or the flat rendering will stop matching.
- INFERENCE (not run): plain `python -m http.server` does not implement HTTP Range requests, so the play page's lazily loaded `data.img` may fail to load or mount locally. Use a Range-capable server (e.g. `npx http-server` or `npx serve`) when testing `/sinos/`. GitHub Pages is expected to support Range; UNKNOWN until deployed.
- `sinos.img` / `data.img` are binary blobs tracked in git; each rebuild adds its size to the repository history.
- Browsers cache aggressively on `python -m http.server`; hard-reload after edits.
- Pages serves every tracked file, including `README.md` and `docs/`.
- `og:image`, `og:url` and the canonical link are absolute URLs; update them if the repo or domain changes.

## Glossary
- band: full-width coloured section. ticker / belt: scrolling text strip. reveal: scroll-triggered entrance animation. tape: rotated label on the profile card.
