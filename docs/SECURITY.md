# SECURITY

Last verified: working tree on top of commit `2dbda4a`, 2026-11-16. Labels: VERIFIED (checked by command or browser run) / INFERENCE / UNKNOWN.

## Risk tier
T0: static files on GitHub Pages. No server code, accounts, forms, cookies, storage or network calls. There is nothing on the site to log in to and no data to steal beyond what is deliberately published.

## Threat model (STRIDE, scoped to what exists)

| Threat | Vector | Control | Residual |
|---|---|---|---|
| Tampering with site content | takeover of the GitHub account or a leaked token | account security (2FA, no tokens in the repo) | **main real risk**; 2FA status UNKNOWN |
| Script injection (XSS) | a bad value pasted into `js/projects.js`, or a future code change | DOM built with `createElement` / `textContent` only; `safeUrl` allow-list; CSP; Trusted Types | low |
| Malicious link schemes | `javascript:`, `data:`, `vbscript:` in project links or media | `safeUrl` parses with `new URL()` and allows only `http:` / `https:` (and `file:` when the page itself is opened from disk) | low |
| Reverse tabnabbing / referrer leak | `target="_blank"` links | `rel="noopener noreferrer"` on every external link (static and generated) | none known |
| Third-party compromise | Google Fonts stylesheet | CSP limits it to styles and fonts; it cannot run script | SRI is impossible for this stylesheet; self-hosting would remove it |
| Clickjacking | site framed by another page | none: `frame-ancestors` is ignored in a `<meta>` policy and Pages sends no such header | accepted; the page has no sensitive action to hijack |
| Information disclosure | secrets or metadata in the public repo | gitleaks clean; images carry no EXIF/GPS/text chunks | commit author email is public in history |

## Content-Security-Policy
Set by `<meta http-equiv>` at the top of `index.html` (rationale: `docs/adr/0001-csp-via-meta.md`).

```
default-src 'none'; script-src 'self'; style-src 'self' https://fonts.googleapis.com;
font-src https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'none';
object-src 'none'; base-uri 'none'; form-action 'none';
require-trusted-types-for 'script'; trusted-types 'none'
```

Rules this imposes on future edits (violations fail silently on screen and show in the browser console):
- No inline `<script>`, no `onclick=` attributes, no `eval`.
- No `style="..."` attributes and no `<style>` blocks. Put styles in `css/style.css`. Setting styles from JS through `el.style` is allowed.
- No `innerHTML` / `insertAdjacentHTML` / `document.write` (Trusted Types blocks them in Chromium). Use `createElement` + `textContent`.
- Images, audio, video and scripts must be files in this repo. A new outside host (embed, analytics, CDN) needs a matching CSP entry.
- `'self'` is the whole `bigg-whale.github.io` origin, so it also covers other Pages sites of the same account.

VERIFIED in Chromium: inline script, inline style attribute, `innerHTML`, cross-origin `fetch` and cross-origin image are all blocked; the unmodified page logs zero CSP violations over http and `file://`.

## Personal data on the page
Published on purpose by the owner: first name, email (`mailto:`), GitHub / Instagram / itch.io links, one photo.
- `assets/img/me.jpg`: JFIF only, no EXIF, GPS or XMP (VERIFIED by segment walk). Screenshots: `IHDR`/`IDAT`/`IEND` only.
- The `mailto:` is plain text in HTML and can be harvested by spam bots. Not changed, because hiding it behind JS breaks it for no-JS visitors; owner decision.
- The commit author email in the public history differs from the contact email. Rewriting history is not recommended; use the GitHub noreply address for future commits.

## Risks: owner decisions
- **R1 copyright:** `assets/audio/trouble.mp3` is a clip of a commercial recording (ID3 title names the song and artist) served from a public repo. Licence UNKNOWN. A takedown notice would hit the repository. **Decision 2026-11-16: the owner keeps the file and accepts the risk.** If a notice arrives, follow RUNBOOK "Incidents".
- **R2 account:** `main` has no branch protection and 2FA status is UNKNOWN. Anyone with push access deploys to production.

## Secrets and dependencies
No secrets are needed or stored. No package dependencies. Do not add third-party scripts without updating this file and the CSP.
