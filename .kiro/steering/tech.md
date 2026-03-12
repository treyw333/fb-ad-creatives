# Tech Stack

## Core
- Vanilla HTML, CSS, JavaScript — no frameworks, no build step
- Single-page app: `index.html`, `style.css`, `app.js`
- Supabase (Realtime Broadcast for sync, one DB table for late-joiner state)
- Supabase JS client loaded from CDN (`<script>` tag, not ES modules)

## Fonts
- Inter (display) and JetBrains Mono (code/prompts) via Google Fonts

## Architecture
- Client-only — no server-side logic
- Module pattern in `app.js`: plain object modules (AuthModule, SlideEngine, SyncService, InteractiveElements, PresenterUI, ConnectionIndicator, AmbientEffects, PromptBuilder, App)
- No ES module imports/exports — everything in one JS file
- All illustrations are inline SVG or CSS-generated — no external image dependencies

## Deployment
- GitHub Pages, served from root (`/`) of `main` branch
- No install, no build, no compilation

## Common Commands

```bash
# Local development (pick one)
npx serve .
python3 -m http.server 8000
```

No test suite — this is a one-time-use presentation project. Verification is done via browser testing at implementation checkpoints.

## Multi-Agent Setup
The `.kiro/agents/` directory contains agent configs (orchestrator, player, reviewer, planner, etc.) for coordinating implementation and review cycles. The orchestrator spawns a player to implement tasks and a reviewer to audit changes.
