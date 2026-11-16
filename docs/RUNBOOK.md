# RUNBOOK

Last verified: working tree on top of commit `2dbda4a`, 2026-11-16. Labels: VERIFIED (checked by command or browser run) / INFERENCE / UNKNOWN.

## Deploy
Push to `main` on `github.com/bigg-whale/portfolio`. Pages builds from `/` and publishes to https://bigg-whale.github.io/portfolio/ within a minute or two. Check: `gh api repos/bigg-whale/portfolio/pages/builds/latest --jq .status` → `built`. The CDN caches for 10 minutes (`Cache-Control: max-age=600`).

## Post-deploy check
1. Open the live URL in a private window with DevTools open: the console must be empty. A line starting "Refused to" or "violates the following Content Security Policy" means something was added that the policy blocks (see `docs/SECURITY.md`).
2. Press play on the corner player.
3. Paste the URL into a chat app to confirm the link preview.

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
