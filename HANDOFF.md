# Agent Handoff Document

## What This Project Is

A synchronized web presentation (14 slides) about optimizing Facebook ads with AI tools. One presenter controls navigation; up to 50 viewers see the same slide in real-time via Supabase Realtime. Deployed to GitHub Pages, no build step.

## Critical Architecture Decision: Horizontal Strip

This is NOT a traditional slide deck. All 14 slides are panels in a single horizontal flex strip. The viewport pans across them.

```
#slide-viewport (100vw × 100vh, overflow: hidden)
  └── #slide-strip (display: flex, width: 1400vw)
       ├── .slide[data-slide="0"]  (flex: 0 0 100vw)
       ├── .slide[data-slide="1"]
       └── ... 12 more
```

Navigation = `#slide-strip { transform: translateX(-N * 100vw) }` with a 600ms CSS transition. Mid-pan redirects work automatically (CSS interpolates to new target). No JS animation loops needed.

## Files to Create

| File | Purpose |
|------|---------|
| `index.html` | All 14 slides inline, Supabase CDN, fonts, links CSS/JS |
| `style.css` | Design tokens, strip layout, all component styles |
| `app.js` | All modules: AuthModule, SlideEngine, SyncService, PresenterUI, ConnectionIndicator, InteractiveElements, PromptBuilder, AmbientEffects, App |

## Key Specs Location

All specs live in `.kiro/specs/ai-ad-presentation/`:
- `requirements.md` — 16 requirements with acceptance criteria and full slide content
- `design.md` — component interfaces, SQL, CSS patterns, data models
- `tasks.md` — ordered implementation plan

**Read `tasks.md` first** — it's the execution roadmap.

## Module Summary

| Module | What It Does |
|--------|-------------|
| **AuthModule** | Reads `?role=presenter&key=SECRET` from URL. Returns 'presenter' or 'viewer'. |
| **SlideEngine** | Sets `translateX` on `#slide-strip`. Has `goToSlide(index, animate)`, `next()`, `prev()`. |
| **SyncService** | Supabase Realtime Broadcast + `presentation_state` table. Presenter publishes, viewers subscribe. Handles reconnection. |
| **PresenterUI** | Injects prev/next buttons + slide counter (fixed bottom-center). Only in presenter mode. |
| **ConnectionIndicator** | Pulsing dot in corner when disconnected. Auto-hides 2s after reconnect. |
| **InteractiveElements** | Copy-to-clipboard (Clipboard API + textarea fallback) and external link setup. |
| **PromptBuilder** | Slide 9 only. Three input fields (product, audience, industry) → live-updates 4 prompt templates → copy grabs customized text. Local state only, not synced. |
| **AmbientEffects** | Canvas spanning full strip width. Slow gradient orbs drifting at ~30fps. |
| **App** | Orchestrator. Wires everything in order per init flow in design.md. |

## Slide Content Quick Reference

1. Title — "AI-Powered Ad Creatives"
2. "The #1 Lever You Control" — 3 key-point cards with SVG icons
3. "Facebook Changed the Rules" — Andromeda before/after
4. "What Makes an Ad Work" — annotated ad mockup (Hook/Value/CTA)
5. "The Weekly Refresh Cycle" — Mon–Fri timeline with icons
6. "How to Spot Winners and Losers" — two comparison columns
7. "Found a Winner? Make More Like It" — 3 variation cards
8. "The Tools That Do the Heavy Lifting" — 5 tool cards (glass effect)
9. "Build Your Prompt" — dynamic prompt builder with variable inputs
10. "Simple A/B Testing That Works" — CBO vs ABO + hierarchy diagram
11. "Launch Day Checklist" — 8-item styled checklist
12. "Your Weekly AI Ad Workflow" — circular flow diagram SVG
13. "Your Toolkit — All in One Place" — 7 tool links, "screenshot this"
14. "Let's Talk" — Q&A/closing

## Visual Design Non-Negotiables

- **Dark theme**: #0a0a0f → #12121a backgrounds
- **Accents**: #00d4ff (blue), #00f0ff (cyan), #8b5cf6 (violet) — used SPARINGLY
- **Fonts**: Inter (display), JetBrains Mono (code/prompts)
- **Continuous canvas feel**: background gradients, dot grid, thin accent lines span the FULL strip width across slide boundaries
- **No cliché AI imagery**: no robots, brain circuits, hologram hands
- **All visuals are inline SVG or CSS-generated** — no external image files
- **Glass cards**: `backdrop-filter: blur(12px)` with subtle white borders
- **Micro-animations**: hover glows, focus borders — all under 300ms
- **4.5:1 minimum contrast ratio** on all text
- **Responsive**: works at 375px, 768px, 1024px+

## Supabase Details

- Credentials are placeholders (`YOUR_SUPABASE_URL`, `YOUR_SUPABASE_ANON_KEY`) — user will fill in
- Table: `presentation_state` (single row, id=1, slide_index integer, updated_at timestamp)
- Full SQL including trigger and RLS policies is in `design.md`
- Broadcast channel name: `presentation`, event: `slide_change`, payload: `{ slideIndex: N }`

## Task Execution Order

1. Supabase setup (manual — user does this)
2. `index.html` skeleton with strip layout
3. `style.css` with everything (tokens, strip, components, responsive)
4. `app.js` with all modules
5. Slides 1–3 content (title + context)
6. Slides 4–7 content (strategy)
7. Slides 8–9 content (tools + prompt builder)
8. Slides 10–14 content (testing, launch, workflow, resources, closing)
9. Responsive verification
10. Final walkthrough

## Gotchas

- The ambient canvas needs to be inside `#slide-strip` (or offset-aware) so it moves with the strip during pans
- PromptBuilder copy buttons use `data-prompt-key` attribute (not `data-copy-text`) — InteractiveElements delegates to `PromptBuilder.getResolvedPrompt(key)`
- `#slide-strip.no-transition` class is needed for instant positioning (initial load, late joiners)
- Supabase `publishSlide()` does broadcast AND upsert — broadcast for real-time, upsert for late joiners
- Connection indicator is for VIEWERS only, not presenter
- Body must have `overflow: hidden` to prevent horizontal scrollbar
- Each slide may need `overflow-y: auto` for tall content (especially mobile)
