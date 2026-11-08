# Grauer

All-in-one workout app (warm-up, strength, calisthenics, HIIT, cardio, yoga, stretching) for iPad and Android.
It's an installable web app (PWA): plain HTML/CSS/JavaScript, no build step, no server, and data stays on the device.

Design doc: [SPEC.md](SPEC.md). Logo and brand files: [brand/](brand/).

## Run it locally

```bash
python dev/serve.py
```

Then open http://localhost:4175. (`dev/serve.py` is a tiny server that turns off browser caching so your edits show up on reload.)

`http://localhost:4175/dev/figures.html` shows every exercise's stick-figure demo and each key pose, which is handy when editing `content/poses.json`.

## Put it on your iPad / phone

Installing a PWA needs HTTPS, so host it on GitHub Pages (free):

1. Push this folder to a GitHub repo (e.g. `pynnetreellc/grauer`).
2. Repo **Settings → Pages → Deploy from branch → main / (root)**.
3. Open the Pages URL on the device:
   - **iPad/iPhone (Safari):** Share → **Add to Home Screen**
   - **Android (Chrome):** menu → **Install app**

After changing any file, bump `VERSION` in `sw.js` so installed copies pick up the update.

## How it's organized

| Path | What it is |
|---|---|
| `index.html` | App shell + bottom tab bar |
| `js/app.js` | Startup + router (`#/home`, `#/library`, `#/player/<session>`…) |
| `js/screens/*.js` | One file per screen: onboarding, home, library, history, settings (Me), player |
| `js/session.js` | Turns a session template into timed steps (warm-up → rounds → cool-down), scaled to 20/30/45/60 min |
| `js/figure.js` | Animated stick-figure demos (pose tweening + two-bone IK) |
| `js/audio.js` | Beeps + spoken cues |
| `js/db.js` | On-device storage (IndexedDB) + backup export/import |
| `content/exercises.json` | Exercise library: cues, easier/harder links, low-impact swaps |
| `content/poses.json` | Body positions used by the demos |
| `content/sessions.json` | Session templates |
| `sw.js`, `manifest.webmanifest` | Offline support + install info |

Content is plain JSON on purpose, so programs can be reviewed and tweaked (SPEC §13a) without touching code.

## Status

Milestone 1 (shell + player) is done. Next up is M2: the real Juvenile program, with weekly schedules built from your days, emphasis and session length, plus progression suggestions.
