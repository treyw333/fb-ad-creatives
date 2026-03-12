# Project Structure

```
/
├── index.html          # Single HTML file — all 14 slides in a horizontal strip
├── style.css           # All styles (design tokens, layout, components, responsive)
├── app.js              # All application logic (module pattern, no ES imports)
├── CLAUDE.md           # Project guidance for AI assistants
├── .gitignore
└── .kiro/
    ├── agents/         # Multi-agent configs (orchestrator, player, reviewer, etc.)
    ├── specs/          # Feature specs (requirements, design, tasks)
    │   └── ai-ad-presentation/
    └── steering/       # Steering rules (this directory)
```

## Key Layout Concepts

- `#slide-viewport`: 100vw × 100vh window with `overflow: hidden`
- `#slide-strip`: flex row, 1400vw wide (14 × 100vw), panned via `transform: translateX`
- `.slide`: each panel is `flex: 0 0 100vw`, full viewport height
- `#ambient-bg`: canvas element spanning full strip width for background effects
- Cross-panel decorative elements (accent lines, dot grids) span the entire strip via `::before`/`::after` pseudo-elements

## Conventions

- All presentation content lives in the three root files — no subdirectories for slides
- Supabase credentials are placeholder constants in `app.js` (SyncService module)
- Presenter mode activated via URL params: `?role=presenter&key=SECRET`
- CSS custom properties defined in `:root` for all design tokens
- Responsive: mobile-first (375px base), tablet (768px), desktop (1024px)
