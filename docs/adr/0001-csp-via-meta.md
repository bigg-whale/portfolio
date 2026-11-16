# 0001: Content-Security-Policy delivered by meta tag

- Status: accepted, 2026-11-16

## Context
The owner asked for hardening. GitHub Pages cannot send custom response headers, and the site had no CSP. Six inline `style="--k:..."` attributes existed in the markup.

## Options
1. No CSP. Rely on the code never using unsafe DOM sinks.
2. CSP in a `<meta>` tag with `'unsafe-inline'` for styles, leaving markup untouched.
3. Strict CSP in a `<meta>` tag, moving the six inline custom properties into `css/style.css`.
4. Move hosting to a platform with header support (Cloudflare Pages, Netlify) for `frame-ancestors`, HSTS preload and friends.

## Decision
Option 3, plus `require-trusted-types-for 'script'` with `trusted-types 'none'`.

## Consequences
- Rendering is unchanged (computed `--k` values and all element boxes identical before and after at four viewport sizes).
- Inline scripts/styles and HTML-string DOM sinks are no longer usable; see the rules in `docs/SECURITY.md`.
- `frame-ancestors`, `report-uri` and `sandbox` do not work from a meta tag, so clickjacking protection is not available. Accepted for a page with no sensitive actions; option 4 remains open.
- Trusted Types is enforced only where the browser supports it; elsewhere the directive is ignored.
