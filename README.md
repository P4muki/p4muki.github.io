# Neon Arcade

A colorful, animated, all-vanilla-JS arcade for GitHub Pages. No build step, no dependencies except two Google Fonts.

## Files
- `index.html` — page structure
- `style.css` — all styling, themes, animations
- `app.js` — all game logic + the secret owner panel

## Deploy
Drop all three files in your repo root (or `/docs`), turn on GitHub Pages in repo settings, done.

## Games
Snake, 2048, Memory Match, Reflex Test, Tic-Tac-Toe (unbeatable AI), Whack-a-Mole, Breakout, Flappy Neon.
All best scores/stats save locally in the visitor's own browser via `localStorage`.

## Secret Owner Panel
Type the Konami code anywhere on the page (keyboard, not touch):

`↑ ↑ ↓ ↓ ← → ← → B A`

That opens a hidden side panel with:
- 4 theme presets (Neon / Sunset / Matrix / Vaporwave) — saved across visits
- Matrix rain background toggle
- Rainbow title mode toggle
- Games-played / visits counter
- Manual confetti button
- "Reset all scores" button

Nothing about the panel is shown anywhere on the page — it only exists for people who know the code.
