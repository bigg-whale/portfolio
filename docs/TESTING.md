# TESTING

Last verified: working tree on top of commit `2dbda4a`, 2026-11-16. Labels: VERIFIED (checked by command or browser run) / INFERENCE / UNKNOWN.

## Strategy
There is no automated test suite; this is a T0 static page with no build. Verification is a scripted browser comparison plus static checks. Stated plainly: nothing runs on push, so a regression is caught only if someone repeats the steps below.

## Checks and how to run them
| Check | How | Result at last verification |
|---|---|---|
| JS syntax | `node --check js/<file>.js` | pass, 4 files |
| Secrets | `gitleaks detect --source . --redact` | no leaks |
| Console / CSP violations | load over http and `file://` in Chromium, read the console | zero |
| Design unchanged | Playwright: serve `git archive HEAD` and the working tree side by side with reduced motion on; compare bounding box, colour, font, transform, opacity and display of all 244 body elements at 1440x900, 1024x768, 768x1024, 375x812 | 0 differences at every size |
| CSP actually blocks | inject inline script, inline style attribute, `innerHTML`, cross-origin fetch and image | all blocked |
| `safeUrl` | feed a stub `projects.js` with `java\tscript:`, ` JaVaScript:`, `java\nscript:`, `vbscript:`, `data:`, `mailto:`, `//host/x`, `https://ok` | only http(s) results rendered |
| Behaviour | count-up frames (`1st`, `2nd`, no flash of the final value), player play/pause, print media shows all content | pass |

## Not covered (UNKNOWN)
- Firefox and Safari, including whether opening `index.html` from disk works there under the CSP (it does in Chromium). Only Chromium was run.
- Real touch devices; mobile was a 375x812 emulation.
- Screen-reader output; only the computed `aria-label` values were inspected.
- The live site after deploy.

## Flaky areas
Animated-mode comparisons differ by ticker position by nature; compare in reduced-motion mode.
