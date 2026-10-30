# Strata — product demo video

A code-built motion-graphics demo of the Strata app revamp (risk-tranched yields: Senior srUSDe / Junior jrUSDe).
No After Effects: the scene is HTML/CSS animated with a paused **GSAP** timeline, rendered frame by frame with **Playwright**
and encoded with **ffmpeg** at 1920×1080, 60 fps. Screens come from the Strata Figma file (exported at 2×, data de-duplicated).

| Version | Page | Notes |
|---|---|---|
| v1 | `index.html` / `scene.js` | Logo lock-up → "Democratizing on-chain yields." → Markets (push through View Market) → Ethena market: tooltip rides the price curve, Junior → Senior → buy 2,000 USDe (snap in while typing, status → success) → Portfolio (jrUSDe expands into its networks) → Points (leaderboard) → 15-screen montage → lock-up + strata.markets. Every screen centred at 0.8 with background visible; the camera only moves to follow action. ~41 s loop |
| v2 | `index2.html` / `scene2.js` | v1 + React Bits *Aurora* background (vendored in `rb/`, bundled to `assets/rb.js`) in Strata blue + Junior teal, rotated to rise from the left and clocked by the video timeline so frames are deterministic |

Rendered videos are in `videos/`.

## Render (Mac)

Needs Node 18+, Python 3 and ffmpeg (`brew install node ffmpeg`).

```bash
git clone https://github.com/shantanujha97/Strata-Video && cd Strata-Video
npm install                      # gsap, sharp, playwright, DM Sans / DM Mono
npx playwright install chromium
npm run serve &                  # static server on 127.0.0.1:8125
npm run render                   # → Strata_Demo_v2.mp4
```

Stills: `PORT=8125 node render.js stills 3.6,12.5,19.4 out/`. To render faster, split the range across terminals
(`… 60 0 10.25`, `… 60 10.25 20.5`, …) and join with `ffmpeg -f concat -safe 0 -i list.txt -c copy out.mp4`.

## Layout

- `assets/` — screen exports (2×), buy-panel typing states, modals, montage frames (1.5×), `chart_curve.json` (price curve traced from the export, drives the live tooltip)
- `fonts/` — DM Sans (variable, opsz) and DM Mono, from Fontsource (OFL)
- `logo.js` — Strata mark + wordmark paths from the Figma header
- `render.js` — Playwright → raw frames → ffmpeg (libx264, crf 14), sub-frame motion blur on fast moves
- `raw/` — full-resolution market-page exports
