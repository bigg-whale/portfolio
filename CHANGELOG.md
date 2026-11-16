# Changelog

Format: Keep a Changelog. This project is not versioned; entries are dated.

## [Unreleased] - 2026-11-17

### Added
- `links.play` link key ("Play in browser ↗" label in `render.js`) for projects that run on this site. Not used yet: the SinOS project card is deliberately left out of `js/projects.js` (owner will add it separately); screenshots `assets/img/sinos-1..2.png` are in place for it.
- `sinos/`: play page that boots SinOS in the browser with the v86 emulator (v86 0.5.473, vendored in `sinos/v86/`), a 1 MiB boot disk and a lazily fetched 16 MiB FAT16 data disk. Own CSP (see `docs/SECURITY.md`, `docs/adr/0002-sinos-in-browser-via-v86.md`).
- `.progress-done` style: finished progress bar, full, without the "stuck" wobble.
- `docs/adr/0002-sinos-in-browser-via-v86.md`; play page sections in the docs.

### Changed
- Homepage: the "In the oven" SinOS card is now "Just shipped" ("BOOTED. FOR REAL.") and links to the play page; the stat now reads 1 operating system that boots; patch notes, profile card and About text no longer say it is unfinished.

## [Unreleased] - 2026-11-16

### Security
- Content-Security-Policy and referrer policy added via `<meta>`; only same-origin files and Google Fonts may load, inline script/style and outside requests are blocked, Trusted Types enforced.
- `safeUrl` now uses the browser URL parser with an http/https allow-list. The previous regex let `java<TAB>script:` style values through as "relative paths".
- External links (static and generated) use `rel="noopener noreferrer"`.

### Fixed
- Screen readers announced the contact heading as "Slide intomy inbox."; a `<br>` now counts as a space in generated `aria-label`s.
- The "2nd" stat counted up as "0nd", "1nd", "2nd"; it now shows "1st", "2nd".
- Stats briefly flashed their final value before counting up.
- `motion.js` no longer hides content in browsers without `IntersectionObserver`.
- Printing / saving as PDF showed blank areas for sections not yet scrolled into view.

### Performance
- Scroll handler no longer measures layout or restyles the hero on every scroll event; the scroll value is written once per frame, straight onto the six floating shapes (`--sy` registered as non-inherited).
- Tickers and shapes keep their own compositor layers (`will-change`).
- The SinOS progress-bar wobble (a `width` animation) pauses while off screen.
- Measured in Chromium at 6x CPU throttle, 90 wheel steps over hero + first belt: frames over 20 ms fell from about 73 to about 26. Not measured on real devices, Firefox or Safari.

- Star and plus shapes: the stacked `drop-shadow` filters (re-run by the GPU every frame while the shapes bob) are replaced by a plain clipped shape in `::before`. Compositor draw time while idle on the hero fell from about 1.3 ms to about 0.26 ms per frame in Chromium on the dev machine. Visible difference: the shadow corners are slightly crisper at 6x zoom; depths were fitted by pixel-diff.
- Where supported (`animation-timeline: scroll()`), the shapes follow the scrollbar through a compositor scroll-driven animation instead of JavaScript; other browsers keep the JS path.
- `.shape` uses `transform-style: flat` instead of `preserve-3d`. This is the change that removed the scroll stutter the site owner saw in the hero, the first belt and the top of section 2 (Chrome 157 and Brave 157, Windows 11, 60 Hz laptop panel at 125 % scaling, wheel and touchpad). Evidence: owner-run blind A/B toggles on a local copy; only the toggles that set `flat` (and hiding the shapes) removed it, while removing `will-change`, shadows, clip-paths, single shapes, the bob or the scroll reaction did not. The stutter was never reproduced by frame-timing traces on the same machine, so the mechanism inside the browser is UNKNOWN. Rendering is equivalent because every descendant of `.shape` only has 2D transforms: screenshots at 10 scroll positions (1920x1080 device pixels) were byte-identical at 8, differed in 3 pixels by 1 level at one, and in 41 anti-aliasing pixels (max 52/255) at one.

### Added
- Link-preview metadata: `og:url`, `og:image` (first game screenshot), `twitter:card`, canonical URL.
- Documentation set under `docs/`.

### Changed
- Six inline `style="--k:..."` attributes moved into `css/style.css` (same values) so inline styles can be banned.
- `.gitignore` covers local tool folders.
