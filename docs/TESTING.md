# TESTING

Last verified: working tree on branch `sinos-play` on top of commit `2dbda4a`, 2026-11-17 (uncommitted). Labels: VERIFIED (checked by command or browser run) / INFERENCE / UNKNOWN.

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

## Play page (`sinos/`): manual checklist
Run on a Range-capable static server (`python -m http.server` is INFERENCE-unsuitable, see PROJECT_MAP Gotchas), DevTools console open.
1. Load `/sinos/`: no CSP violation, nothing starts before the click.
2. Click "Boot SinOS": status changes, the `sinos>` prompt appears.
3. Click the screen, run `help`, `ls /`, `cat /readme.txt`, `run hello`, `ps`.
4. `ls /disk`, then `write` a file on `/disk` and `cat` it back (network panel shows `data.img` requests with `Range` headers and 206 responses).
5. `game`: Sin Snake starts, arrow keys/WASD steer, the page does not scroll, pause works, quit returns to the shell.
6. Restart button reboots; disk writes from before are gone (memory-only).
7. Homepage: section 01 shows only the SIH game ("The game"); the "In the oven" SinOS card shows "Just shipped", full bar "BOOTED. FOR REAL.", and its "play SinOS" link opens `sinos/`; stats read 1 project / 1 OS; with reduced motion and with JS off the page is readable.
8. `node --check` on `js/render.js`, `js/projects.js` and `sinos/play.js`.

Verified 2026-11-17 in a local Chromium (VERIFIED): steps 1-6 for boot, shell commands, `/disk` listing + write + read back, game start, arrow-key steering, pause, quit to shell, and arrow keys not scrolling the page while the screen has focus.
Not verified (UNKNOWN): Firefox and Safari; mobile (the page states a physical keyboard is needed); the real GitHub Pages deployment (range requests on Pages are expected to work); homepage step 7 and Restart behaviour were not part of that browser run unless re-run.

## Not covered (UNKNOWN)
- Firefox and Safari (homepage and play page), including whether opening `index.html` from disk works there under the CSP (it does in Chromium). Only Chromium was run.
- Real touch devices; mobile was a 375x812 emulation.
- Screen-reader output; only the computed `aria-label` values were inspected.
- The live site after deploy.

## Flaky areas
Animated-mode comparisons differ by ticker position by nature; compare in reduced-motion mode.
