# PROJECT MAP

Last verified: working tree on top of commit `2dbda4a`, 2026-11-16. Labels: VERIFIED (checked by command or browser run) / INFERENCE / UNKNOWN.

## Purpose
One-page personal portfolio for "Sin". Static, no build, no dependencies. Live at https://bigg-whale.github.io/portfolio/ (GitHub Pages, `main`, root).

## Tree
```
index.html        markup for every section, CSP meta, social-preview meta, music player
css/style.css     all styling; colour tokens in :root; motion rules gated on html.js-motion
js/projects.js    data only: window.PROJECTS
js/render.js      builds project cards from window.PROJECTS; safeUrl; profile photo swap; profile card alignment
js/player.js      play / pause for the corner audio player
js/motion.js      all animation: hero entrance, scroll reveals, count-up, tickers, tilt
assets/img        me.jpg (profile), sih-1..4.png (screenshots; sih-1 doubles as og:image)
assets/audio      trouble.mp3
docs/             this documentation set
```
Local-only, git-ignored: `.claude/`, `.playwright-mcp/`, `DESIGN.md`, `portfolio-design.md`.

## Entry points and load order
`index.html` loads, at the end of `<body>` and in this order: `projects.js` → `render.js` → `player.js` → `motion.js`. Order matters: `render.js` needs `window.PROJECTS`; `motion.js` decorates the cards `render.js` created.

## Commands
| Action | Command |
|---|---|
| Run | `python -m http.server 8000` then http://localhost:8000 (or open `index.html` from disk) |
| Syntax check | `node --check js/render.js` (repeat per file) |
| Secret scan | `gitleaks detect --source . --redact` |
| Deploy | push to `main` |

There is no build, linter config or automated test suite.

## Conventions
- ES5-style JS in IIFEs with `"use strict"`, no modules, no globals except `window.PROJECTS`.
- DOM is built with `createElement` + `textContent`. Never `innerHTML` (blocked by the CSP).
- Styles live in `css/style.css`. No `style=""` attributes or `<style>` blocks (blocked by the CSP). JS may write `el.style`.
- Content edits happen in `index.html` and `js/projects.js`; `render.js` should not need changes to add a project.

## Invariants
- The page must be fully readable with JavaScript off, with `prefers-reduced-motion: reduce`, and without `motion.js`.
- Hidden-until-revealed states exist only under `html.js-motion`, a class that only `motion.js` adds.
- Never render a link or button with an empty or unsafe URL: everything from `window.PROJECTS` goes through `safeUrl`.
- The audio never autoplays.

## Gotchas
- The hero entrance waits for `requestAnimationFrame`; a tab that is not being painted (some embedded previews) stays blank until it is shown.
- Browsers cache aggressively on `python -m http.server`; hard-reload after edits.
- Pages serves every tracked file, including `README.md` and `docs/`.
- `og:image`, `og:url` and the canonical link are absolute URLs; update them if the repo or domain changes.

## Glossary
- band: full-width coloured section. ticker / belt: scrolling text strip. reveal: scroll-triggered entrance animation. tape: rotated label on the profile card.
