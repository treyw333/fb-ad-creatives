# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A browser-based synchronized presentation app for a talk on optimizing Facebook ads with AI tools. Built with vanilla HTML/CSS/JS (no build step), deployed to GitHub Pages, using Supabase Realtime for live slide sync between one presenter and up to 50 viewers.

## Architecture

- **No build system** — three static files: `index.html`, `style.css`, `app.js`
- **Continuous horizontal canvas** — all 14 slides are panels in a flex strip (`#slide-strip`, 1400vw wide) inside a viewport (`#slide-viewport`, 100vw × 100vh, overflow hidden). Navigation translates the strip via `transform: translateX(-N * 100vw)`. This is NOT a show/hide slide system — it's a single panoramic strip that pans.
- **Client-only** — Supabase is the sole backend (Realtime Broadcast for sync, one DB table for late-joiner state)
- **Module pattern** — `app.js` contains plain object modules: `AuthModule`, `SlideEngine`, `SyncService`, `InteractiveElements`, `PresenterUI`, `ConnectionIndicator`, `AmbientEffects`, `PromptBuilder`, `App` (orchestrator)

### Key flows

- **Presenter mode**: URL param `?role=presenter&key=SECRET` → shows nav controls, broadcasts slide index via Supabase Broadcast + upserts to `presentation_state` table
- **Viewer mode**: Default — no controls, receives slide index via Broadcast subscription. On load, fetches current slide from `presentation_state` table before subscribing
- **Reconnection**: On channel reconnect, viewer re-fetches current slide from DB
- **Prompt Builder** (Slide 9): Viewers type product/audience/industry into input fields → prompts update live with their values → copy button grabs the customized prompt. State is local per viewer, never synced.

## Development

No install, no build. Open `index.html` in a browser or use any static server:

```bash
npx serve .
python3 -m http.server 8000
```

Clipboard API requires HTTPS (or localhost). Supabase connection requires valid credentials in `app.js` constants.

## Deployment

Push to `main` branch with GitHub Pages configured to serve from root (`/`).

## Specs

Full requirements, design, and task breakdown live in `.kiro/specs/ai-ad-presentation/`. Read `design.md` for component interfaces, data models, SQL setup, CSS token system, and horizontal strip layout.

## Visual Design Constraints

- **Continuous canvas** — background gradients, ambient orbs, decorative lines, and dot grids span across slide boundaries. Transitions should feel like panning a panorama, not flipping cards.
- Premium dark theme (#0a0a0f–#12121a), restrained accents (electric blue #00d4ff, violet #8b5cf6)
- No cliché AI imagery (robot faces, brain circuits, hologram hands)
- All illustrations are inline SVG or CSS-generated — no external image dependencies unless explicitly provided
- Ambient canvas background spans full strip width with slow-moving gradient orbs (~30fps)
- Transitions: 600ms horizontal pan via CSS transform + cubic-bezier(0.22, 1, 0.36, 1)
- Must look high-end and futuristic without looking like a generic AI template
