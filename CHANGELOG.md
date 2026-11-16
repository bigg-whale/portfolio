# Changelog

Format: Keep a Changelog. This project is not versioned; entries are dated.

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

### Added
- Link-preview metadata: `og:url`, `og:image` (first game screenshot), `twitter:card`, canonical URL.
- Documentation set under `docs/`.

### Changed
- Six inline `style="--k:..."` attributes moved into `css/style.css` (same values) so inline styles can be banned.
- `.gitignore` covers local tool folders.
