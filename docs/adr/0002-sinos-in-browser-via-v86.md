# 0002: SinOS playable in the browser via a self-hosted v86 emulator

- Status: accepted, 2026-11-17 (pending first deployment check)

## Context
The owner finished SinOS, a 32-bit x86 hobby OS. A portfolio visitor cannot run an OS image without QEMU or similar. The site is static on GitHub Pages (no server code, no custom headers) and its CSP (ADR 0001) blocks WebAssembly compilation, blob workers, same-origin fetches and unsafe DOM sinks. The SinOS source repository is not public.

## Options
1. **Self-hosted v86** (x86 emulator in WebAssembly/JS, BSD-2-Clause) on a dedicated `/sinos/` page. Works offline from the repo, no third-party runtime, needs a relaxed CSP on that page.
2. **v86 or another emulator from a CDN.** Less repo weight, but a runtime third-party script on a page that executes guest code; needs outside hosts in `script-src`/`connect-src`; version drift.
3. **Video or GIF only.** No CSP change and trivial, but the visitor cannot interact; weakest proof the OS actually boots.
4. **JS-Linux-style emulators (e.g. Fabrice Bellard\'s JSLinux).** Aimed at running Linux images, not a custom boot disk; licensing and hosting terms differ; no advantage for a bare-metal OS.

## Decision
Option 1. Vendor `libv86.js`, `v86.wasm`, SeaBIOS and VGABIOS under `sinos/v86/` at pinned versions with recorded SHA-256 hashes. Boot only after a click. Disable the speaker. Apply a per-page CSP in `sinos/index.html` only; leave the homepage CSP untouched. The homepage links to it with a normal project link (`links.play`).

## Consequences
- The play page CSP adds `'wasm-unsafe-eval'`, `worker-src blob:`, `connect-src 'self'`, `blob:` images and drops Trusted Types (v86 uses `innerHTML`). The weaker policy is confined to `/sinos/`; reasoning and residual risk are in `docs/SECURITY.md`.
- The repository grows by about 17 MiB of disk images plus about 2.5 MB of emulator files; each image rebuild adds to git history permanently.
- Third-party code (BSD-2-Clause, plus LGPL-3.0 BIOS binaries) is now distributed with the site; licence files ship alongside. Upgrades are manual (RUNBOOK).
- The 16 MiB data disk relies on HTTP Range requests; GitHub Pages is expected to support them but this is UNKNOWN until deployed, and plain `python -m http.server` does not (local testing needs another server). Fallback: load the disk eagerly.
- Mobile visitors need a physical keyboard; Firefox and Safari are untested.
- Not a link to source: the SinOS repo stays private, so no GitHub link is shown.
