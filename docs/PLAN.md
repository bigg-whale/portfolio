# PLAN: bigg-whale/portfolio (review, fix, harden)

- plan_revision: 1
- last_verified: 2dbda4a + working tree / 2026-11-16
- planner_model_requested: Opus older than 5.5 (standing rule 3); none selectable, `opus` alias used
- planner_model_actual: claude-opus-5-5 (self-reported by the planner agent)
- trivial_exemption: NOT APPLICABLE (public deployed site, more than 2 files, personal data on the page)

## 1. Classification

| Field | Value | Label | Evidence |
|---|---|---|---|
| Project type | Personal portfolio / static site | VERIFIED | 16 tracked static files; no manifest, backend or build step |
| Risk tier | T0 | VERIFIED | no auth, forms, fetch/XHR, cookies/storage, DB or LLM use (grep + CSP `connect-src 'none'` runs clean) |
| Stack | HTML5, CSS, vanilla JS (4 same-origin scripts), Google Fonts | VERIFIED | repo tree |
| Deployment | GitHub Pages, branch `main`, path `/`, HTTPS enforced | VERIFIED | `gh api repos/bigg-whale/portfolio/pages` |

Every push to `main` is a production deploy. Pages cannot set response headers, so controls are limited to `<meta>` and code.

## 2. Lifecycle phases

| Phase | Verdict | Basis |
|---|---|---|
| Intake, Requirements (brief), Planning, Implementation, Code review (independent), Release prep, Deployment | REQUIRED | T0 default / never skippable |
| Risk analysis, Security assessment (passive), QA (browser before/after) | CONDITIONAL, executed | owner asked for hardening and "no design change" |
| Tech research (ADR) | CONDITIONAL, executed | CSP-via-meta decision, `docs/adr/0001` |
| CI/CD | OPTIONAL, not done | `.github/` absent; needs owner approval |
| Domain research, Feasibility, Architecture change, Technical spec, UX/UI, Performance validation, Observability, Incident mgmt, Upgrades, Deprecation | NOT APPLICABLE | static T0, no dependencies, design frozen by owner |

## 3. Audit capabilities

| Capability | Verdict | Basis | Result |
|---|---|---|---|
| Secrets scan | REQUIRED | git repo | gitleaks over history: no leaks (VERIFIED) |
| SCA / SBOM | NOT APPLICABLE | no manifest, no vendored code | n/a |
| SAST | REQUIRED | `js/*.js` | manual taint review; no automated SAST tool ran (automated SAST: UNKNOWN) |
| IaC / container, Authn/z, API contract, Prompt-injection | NOT APPLICABLE | none present | n/a |
| DAST | NOT APPLICABLE | github.io is third-party; no authorised target | local browser smoke test only |
| Licence review | REQUIRED | `assets/audio/trouble.mp3`, Google Fonts | mp3 licence UNKNOWN, owner decision open (SECURITY.md R1) |
| Accessibility | REQUIRED | UI code | one defect fixed (heading label); full WCAG audit not performed (UNKNOWN) |
| Privacy | REQUIRED | email, photo, commit email | image metadata clean (VERIFIED); see SECURITY.md |

## 4. Documents

| Document | Verdict | Reason |
|---|---|---|
| README.md, docs/PROJECT_MAP.md, docs/ARCHITECTURE.md, docs/SECURITY.md, docs/RUNBOOK.md, docs/TESTING.md, docs/PLAN.md, CHANGELOG.md | REQUIRED | mandatory set |
| docs/adr/0001-csp-via-meta.md | REQUIRED | decision taken |
| docs/API.md | NOT APPLICABLE | no HTTP API; the `window.PROJECTS` data contract is in ARCHITECTURE.md |
| docs/DATA.md | NOT APPLICABLE | no persistence, schema or migrations |

## 5. Tasks as executed

| Task | Agent | Model |
|---|---|---|
| Planner | subagent | claude-opus-5-5 |
| Inventory, scans, implementation, browser verification, docs | main session | claude-fable-5-2 |
| Independent review of the diff (correctness + security) | subagent, read-only | opus alias |

Deviation from the planner's task table: implementation and docs were done in the main session instead of separate Sonnet/Haiku agents, because the whole code base (about 1,500 lines) was already in context. The implementer was not the sole approver.

## 6. Human approval points (open)

| Point | Status |
|---|---|
| H1 keep / replace `trouble.mp3` | decided 2026-11-16: owner keeps it, risk accepted |
| H3 future commit email (GitHub noreply) and whether to keep the plain `mailto:` | open |
| H4 commit and push to `main` (production deploy) | open |
| H5 CI workflow, self-hosted fonts, branch protection | open, optional |

## 7. Open questions / UNKNOWN

| # | Question | Resolution |
|---|---|---|
| 1 | Licence status of `trouble.mp3` | owner |
| 2 | Is 2FA enabled on the GitHub account | owner checks github.com/settings/security (API did not report it) |
| 3 | Safari / Firefox rendering after the change | not tested here; only Chromium was run |
| 4 | Independent review findings left as-is | player stays visible until first click when the audio file is missing; an empty `window.PROJECTS` still shows "1 project shipped". Both pre-existing, data-dependent, not fixed |
