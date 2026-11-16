# SIN // INDIE DEV + CYBER

My one-page portfolio. Plain HTML, CSS and JavaScript: no build step, no npm, no frameworks. Hosted on GitHub Pages.

## Files

```
index.html         the page (hero, about, contact, music player)
css/style.css      all styling; colours are variables at the top
js/projects.js     the project list (data only)
js/render.js       turns the list into cards and lines up the profile card
js/player.js       play/pause for the corner music player
js/motion.js       all the animation (delete it to turn animation off)
assets/img/        profile pic, screenshots
assets/audio/      the song in the corner player
assets/video/      gameplay clips (later)
```

## Run it locally

Open `index.html` in a browser, or serve the folder:

```
python -m http.server 8000
```

then go to http://localhost:8000.

## Add a project

1. Put screenshots in `assets/img/` (e.g. `mygame-1.png`).
2. Open `js/projects.js`, copy an existing `{ ... }` block, paste it after it (with a comma between blocks) and edit the values.
3. Set `featured: false` unless it should replace the big centerpiece card.

Empty `links` and empty contact buttons are hidden automatically, so there are never dead links. An empty `images` list shows a "screenshots incoming" box; an empty `video` shows the images instead.

## Still to fill in

Search the project for `TODO`:

- SIH game: real name and final bullet wording (`js/projects.js`)
- SIH game links: add the itch.io page / GitHub repo once the game is public (`js/projects.js`)

## Animation

Everything that moves is in `js/motion.js`. Anyone with "reduce motion" switched on in their device settings gets the still version automatically.

## Change the song

Replace `assets/audio/trouble.mp3` and edit the track name in the player block at the bottom of `index.html`. If the file is missing, the player hides itself.

## Change colours

Edit the variables in `:root` at the top of `css/style.css`. One line per colour.

## Deploy (GitHub Pages)

1. Push this folder to a public GitHub repo.
2. Repo **Settings → Pages → Source:** deploy from branch `main`, folder `/ (root)`.
3. The site appears at `https://<username>.github.io/<repo>/` after a minute or so.

## Security rules (read before adding anything)

The page has a strict security policy at the top of `index.html`. Things it blocks will silently not work and show an error in the browser console (F12):

- no `style="..."` attributes and no `<style>` blocks: put styles in `css/style.css`
- no inline `<script>` or `onclick="..."`: put code in a file in `js/`
- images, audio and video must be files in this repo, not links to other sites
- embeds, analytics or anything from another website need the policy line edited first

Details: `docs/SECURITY.md`.

## Docs

`docs/PROJECT_MAP.md` (start here), `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/RUNBOOK.md`, `docs/TESTING.md`, `docs/PLAN.md`, `docs/adr/`, `CHANGELOG.md`.
