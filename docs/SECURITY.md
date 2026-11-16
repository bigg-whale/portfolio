# SECURITY

Last verified: working tree on branch `sinos-play` on top of commit `2dbda4a`, 2026-11-17 (uncommitted). Labels: VERIFIED (checked by command or browser run) / INFERENCE / UNKNOWN.

## Risk tier
T0: static files on GitHub Pages. No server code, accounts, forms or cookies; the homepage makes no network calls. The play page fetches only same-origin files. There is nothing on the site to log in to and no data to steal beyond what is deliberately published.

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

## Project detail pages (`projects/*.html`)
Carry the homepage CSP unchanged and load no scripts. Any change to the homepage CSP must be copied into them.

## Play page CSP (`sinos/index.html`)
Rationale: `docs/adr/0002-sinos-in-browser-via-v86.md`. Each difference from the homepage policy:

```
default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; worker-src blob:;
style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com;
img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'
```

| Change vs homepage | Why | Risk |
|---|---|---|
| `script-src` + `'wasm-unsafe-eval'` | v86 compiles `v86.wasm` with `WebAssembly.instantiate`. Allows WebAssembly compilation only, not JS `eval`. | low |
| `worker-src blob:` | v86 starts a helper worker from a blob built out of its own bundled code. | low-medium: any script able to create a blob could run as a worker; no such script exists on the page |
| `connect-src 'self'` (was `'none'`) | fetches BIOS and disk images, including range reads of `data.img`. Same origin only. | low |
| `img-src` + `blob:` | emulator screen canvas / images. | low |
| `media-src` removed | no audio or video on this page; falls back to `default-src 'none'`. Speaker is disabled in `play.js` (`disable_speaker: true`), so no audio worklet is needed. | none |
| `require-trusted-types-for` / `trusted-types` omitted | v86 writes its text-mode screen with `innerHTML`, which Trusted Types would block. | medium: DOM-XSS sinks are unguarded on this page. Mitigated by: no user input, URL data or storage is read by `play.js`; the only `innerHTML` content is guest screen text produced by the emulator from the owner's own OS image |

All other directives (`default-src 'none'`, `object-src`, `base-uri`, `form-action`, `style-src`) match the homepage.

## Third-party dependency: v86 (vendored, `sinos/v86/`)
No package manager; files are committed. Integrity is by SHA-256 of the committed bytes (hashes recomputed and matched the table at 2026-11-17; recompute with `sha256sum sinos/v86/*` after any change).

| File | Version / source | Licence | SHA-256 |
|---|---|---|---|
| `libv86.js` | npm `v86@0.5.473` | BSD-2-Clause (`v86/LICENSE`) | `e257912c4a1129e36a86c1e2df69904ab969d87bffd24aa6676e84d6ddffc1c6` |
| `v86.wasm` | npm `v86@0.5.473` | BSD-2-Clause | `2f0c4150f266415b754a84a32e6f8e4c975a1d3abb94c78b047fa30027db1ef1` |
| `seabios.bin` | github.com/copy/v86 commit `cc37f35c43bf14865d74ad76879ecf9410f69eb1` (`bios/`) | LGPL-3.0 (SeaBIOS; `v86/COPYING.LESSER`) | `73e3f359102e3a9982c35fce98eb7cd08f18303ac7f1ba6ebfbe6cdc1c244d98` |
| `vgabios.bin` | same commit | LGPL-3.0 (VGABIOS; `v86/COPYING.LESSER`) | `a4bc0d80cc3ca028c73dafa8fee396b8d054ce87ebd8abfbd31b06b437607880` |

Risk notes:
- Supply chain: pinned exact version, copied once, no install-time scripts, no CDN at runtime. Provenance of the npm tarball and git commit was not independently audited (UNKNOWN beyond the hashes). The npm package contains an opaque WebAssembly binary; its build was not reproduced.
- Licences: LGPL-3.0 BIOS binaries are distributed unmodified with the licence text alongside, as a separate file loaded at runtime. Source for SeaBIOS/VGABIOS is available from the v86 repository at the pinned commit. Not legal advice; UNKNOWN whether further notices are required.
- The emulator runs guest code (the owner's OS) in a WebAssembly sandbox with no network device. Guest disk writes are memory-only and discarded on reload; `sinos/data.img` on the server is never modified by visitors.
- `'self'` includes `sinos/` for the homepage as well, so a compromise of `sinos/` files is equivalent to a compromise of the site; this is no new trust boundary.
- Bandwidth: a visit to `/sinos/` can transfer several MB, `data.img` in ranges only. Pages bandwidth limits apply.

## Personal data on the page
Published on purpose by the owner: first name, email (`mailto:`), GitHub / Instagram / itch.io links, one photo.
- `assets/img/me.jpg`: JFIF only, no EXIF, GPS or XMP (VERIFIED by segment walk). Screenshots: `IHDR`/`IDAT`/`IEND` only.
- The `mailto:` is plain text in HTML and can be harvested by spam bots. Not changed, because hiding it behind JS breaks it for no-JS visitors; owner decision.
- The commit author email in the public history differs from the contact email. Rewriting history is not recommended; use the GitHub noreply address for future commits.

## Risks: owner decisions
- **R1 copyright:** `assets/audio/trouble.mp3` is a clip of a commercial recording (ID3 title names the song and artist) served from a public repo. Licence UNKNOWN. A takedown notice would hit the repository. **Decision 2026-11-16: the owner keeps the file and accepts the risk.** If a notice arrives, follow RUNBOOK "Incidents".
- **R2 account:** `main` has no branch protection and 2FA status is UNKNOWN. Anyone with push access deploys to production.

## Secrets and dependencies
No secrets are needed or stored. No package dependencies (v86 is vendored, see above). Do not add third-party scripts without updating this file and the CSP.
