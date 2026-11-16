# RUNBOOK

Last verified: working tree on branch `sinos-play` on top of commit `2dbda4a`, 2026-11-17 (uncommitted). Labels: VERIFIED (checked by command or browser run) / INFERENCE / UNKNOWN.

## Deploy
Push to `main` on `github.com/bigg-whale/portfolio`. Pages builds from `/` and publishes to https://bigg-whale.github.io/portfolio/ within a minute or two. Check: `gh api repos/bigg-whale/portfolio/pages/builds/latest --jq .status` → `built`. The CDN caches for 10 minutes (`Cache-Control: max-age=600`).

## Post-deploy check
0. After the first deploy with `sinos/`: open `/sinos/` live, boot, and confirm `data.img` loads (Range requests on Pages are UNKNOWN until this is done). If it fails, the data disk can be switched to a non-async load in `play.js` (costs a 16 MiB download).
1. Open the live URL in a private window with DevTools open: the console must be empty. A line starting "Refused to" or "violates the following Content Security Policy" means something was added that the policy blocks (see `docs/SECURITY.md`).
2. Press play on the corner player.
3. Paste the URL into a chat app to confirm the link preview.

## Updating the SinOS images (`sinos/sinos.img`, `sinos/data.img`)
Source repo is local only (`C:\Users\rickr\Documents\sinos`, WSL path `/mnt/c/Users/rickr/Documents/sinos`). In WSL, from that repo:
1. Boot disk: `make disk` produces `build/sinos-disk.img`; copy it to `<portfolio>/sinos/sinos.img`.
2. Fresh data disk: `make DATA_IMG=/tmp/web-data.img /tmp/web-data.img`; copy `/tmp/web-data.img` to `<portfolio>/sinos/data.img`. It must stay 16 MiB: `DATA_DISK_BYTES` in `sinos/play.js` must equal the file size.
3. Test locally on a Range-capable server (see PROJECT_MAP), run the TESTING checklist, then commit. Each image change grows the git history by the file size.

## Upgrading v86
1. Pick a version; `npm pack v86@<version>` in an empty scratch directory (not in this repo) and take `build/libv86.js` and `build/v86.wasm` from the tarball. BIOS files come from the matching commit of github.com/copy/v86 (`bios/seabios.bin`, `bios/vgabios.bin`).
2. Replace the files in `sinos/v86/` wholesale; do not edit them. Keep `LICENSE` and `COPYING.LESSER` current.
3. Recompute `sha256sum sinos/v86/*` and update the table in `docs/SECURITY.md`, plus the version in the CHANGELOG.
4. Re-run the TESTING checklist. Check the console for new CSP violations (a new release may need different directives; do not loosen the CSP beyond what is shown to be required).
5. If `play.js` options changed upstream (`hda`/`hdb`, `disable_speaker`, `boot_order`), adjust `play.js` and ARCHITECTURE.

## Rollback
`git revert <bad commit>` then push. Do not force-push `main`.

## Configuration
None. No environment variables, secrets or build settings. Pages settings: source `main` / root, HTTPS enforced.

## Observability
None (no analytics, no error reporting, by design). Availability is GitHub Pages' own.

## Incidents
- Site defaced or unexpected commits: change the GitHub password, revoke sessions and tokens (github.com/settings/security), enable 2FA, then revert the commits.
- Copyright notice about the audio file: remove `assets/audio/trouble.mp3` and push; the player hides itself when the file is missing.

## Backup / restore
The git repository is the backup. Local clone plus GitHub.
