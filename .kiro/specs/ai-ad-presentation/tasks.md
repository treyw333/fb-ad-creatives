# Implementation Plan: AI Ad Presentation

## Overview

Build a synchronized, presenter-controlled web presentation using vanilla HTML/CSS/JS with Supabase Realtime for slide sync. The presentation is a continuous horizontal canvas — 14 slides laid out side-by-side in a flex strip, with the viewport panning across them. Includes a dynamic prompt builder where viewers customize prompts with their own business details before copying. All inline SVG illustrations are authored with each slide, not as a separate polish pass.

## Tasks

- [ ] 1. Supabase setup
  - [ ] 1.1 Create the `presentation_state` table in Supabase
    - Run the SQL from the design document in the Supabase SQL Editor: create table, trigger for `updated_at`, seed row, enable RLS with read/update policies
    - Verify: query the table to confirm the seed row exists
    - _Requirements: 4.1, 4.2_

- [ ] 2. Project structure, HTML skeleton, and CSS foundation
  - [ ] 2.1 Create `index.html` with horizontal strip layout
    - `<div id="slide-viewport">` containing `<canvas id="ambient-bg">` and `<div id="slide-strip">` with 14 `<section class="slide" data-slide="0..13">` placeholders
    - `<div id="connection-indicator" class="hidden">` outside viewport
    - Load Supabase client from CDN, link `style.css` and `app.js`
    - Include Inter + JetBrains Mono from Google Fonts
    - Viewport meta tag, `overflow: hidden` on body
    - _Requirements: 5.1, 5.8, 6.4, 6.7, 14.1, 14.2_
  - [ ] 2.2 Create `style.css` with design tokens, horizontal strip layout, and component styles
    - Define all CSS custom properties (design tokens from design doc)
    - Style `#slide-viewport` (100vw × 100vh, overflow hidden), `#slide-strip` (flex row, 1400vw wide, transition on transform), `.slide` (flex: 0 0 100vw)
    - `#slide-strip.no-transition` for instant positioning
    - Style ambient canvas (positioned inside strip, full strip width)
    - Cross-panel decorative elements: `#slide-strip::before` (accent line), `#slide-strip::after` (dot grid)
    - Responsive breakpoints (375px base, 768px tablet, 1024px desktop)
    - Component styles: `.presenter-controls`, `.connection-indicator`, `.copy-btn`, `.prompt-block`, `.tool-link`, `.tool-card` (glass effect), `.ad-creative-card`, `.prompt-variables`, `.variable-field input`
    - Micro-animations on interactive elements (hover glow, focus borders) under 300ms
    - Minimum 4.5:1 contrast ratio on all text
    - _Requirements: 5.1–5.8, 6.1–6.10, 7.2, 8.3, 15.2, 16.1, 16.2_

- [ ] 3. Core JavaScript modules
  - [ ] 3.1 Create `app.js` with AuthModule
    - `PRESENTER_KEY` constant, `getRole()` reads URL params, `isPresenter()` helper
    - Supabase URL and anon key as placeholder constants in SyncService
    - _Requirements: 1.1, 1.2, 1.3, 14.3_
  - [ ] 3.2 Implement SlideEngine (horizontal strip panning)
    - `init(initialIndex, animate)` — cache `#slide-strip`, set initial `translateX`
    - `goToSlide(index, animate)` — set `transform: translateX(-index * 100vw)` on strip; mid-transition changes just update the target (CSS transition handles interpolation)
    - `next()`, `prev()`, `canNavigate(direction)`, `getCurrentIndex()`
    - Add/remove `no-transition` class for instant positioning
    - _Requirements: 2.1, 2.2, 5.1–5.5_
  - [ ] 3.3 Implement SyncService
    - `init(onSlideChange, onConnectionChange)` — Supabase client, Broadcast channel, connection status tracking, reconnection logic (fetch from State_Store on reconnect)
    - `fetchCurrentSlide()` — query `presentation_state`, return 0 on failure
    - `publishSlide(slideIndex)` — broadcast + upsert (fire-and-forget)
    - `destroy()`
    - _Requirements: 3.1, 3.2, 4.1, 4.2, 4.3, 15.1_
  - [ ] 3.4 Implement PresenterUI
    - `init()` — inject prev/next buttons + slide counter, fixed bottom-center
    - `updateControls(currentIndex, totalSlides)` — disable at bounds, update counter
    - _Requirements: 2.3, 2.4, 2.7_
  - [ ] 3.5 Implement ConnectionIndicator
    - `init()` — create DOM element (hidden)
    - `update(connected)` — pulsing dot when disconnected, auto-hide 2s after reconnect
    - _Requirements: 15.2, 15.3_
  - [ ] 3.6 Implement InteractiveElements
    - `init()` — bind `.copy-btn` handlers (read `data-copy-text` or delegate to PromptBuilder), ensure `.tool-link` elements have correct `target` and `rel`
    - `copyToClipboard(button, text)` — Clipboard API with "Copied!" confirmation, fallback to selectable textarea
    - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2_
  - [ ] 3.7 Implement PromptBuilder
    - `init()` — cache `.variable-field input` elements and `.prompt-block` cards, bind `input` event listeners
    - `getValues()` — read current input values
    - `renderAll()` — replace `{variable}` in templates, style empty vars as muted placeholders, filled vars as accent-colored
    - `getResolvedPrompt(templateKey)` — return full prompt with values or placeholder text for copy
    - State is local to each viewer's browser — not synced
    - _Requirements: 11.2 (all sub-criteria)_
  - [ ] 3.8 Implement AmbientEffects
    - `init()` — canvas sized to full strip width, slow-moving gradient orbs with sine/cosine drift, ~30fps
    - `destroy()` — cancel animation, handle resize
    - _Requirements: 6.5, 6.7_
  - [ ] 3.9 Implement App orchestrator
    - Wire all modules per initialization flow: AuthModule → AmbientEffects → ConnectionIndicator → SyncService → SlideEngine → InteractiveElements → PromptBuilder → (if presenter) PresenterUI + keyboard
    - `onSlideChange` → `SlideEngine.goToSlide()` + `PresenterUI.updateControls()` if presenter
    - `onConnectionChange` → `ConnectionIndicator.update()`
    - Presenter nav: buttons + arrow keys → `SlideEngine.next/prev()` → `SyncService.publishSlide()` → `PresenterUI.updateControls()`
    - Viewer: no controls, no keyboard nav
    - _Requirements: 1.1, 1.2, 2.5, 2.6, 3.1–3.4, 4.2, 4.3, 15.1_

- [ ] 4. Checkpoint — Core modules complete
  - Open in browser, verify: presenter mode with controls, viewer mode without, strip panning works, prompt builder inputs update prompts live. Ask user if questions arise.

- [ ] 5. Slide content: Title and Context (Slides 1–3)
  - [ ] 5.1 Author Slide 1 (Title)
    - "AI-Powered Ad Creatives" / "How to Produce Winning Ads Faster Than Your Competition"
    - Presenter name placeholder, date
    - CSS animated gradient background, abstract geometric SVG shapes
    - _Requirements: 9.1_
  - [ ] 5.2 Author Slide 2 (Why Creatives Matter)
    - "The #1 Lever You Control" with 3 key-point cards
    - Inline SVG icons per point (target, grid, cost arrow)
    - _Requirements: 9.2_
  - [ ] 5.3 Author Slide 3 (The Andromeda Shift)
    - "Facebook Changed the Rules" with plain-language explanation
    - Before/after comparison cards (bid wins → creative quality wins)
    - _Requirements: 9.3_

- [ ] 6. Slide content: Strategy (Slides 4–7)
  - [ ] 6.1 Author Slide 4 (Anatomy of a Winning Ad)
    - "What Makes an Ad Work" with annotated `.ad-creative-card` mockup
    - Hook / Value / CTA sections with accent callout lines (inline SVG)
    - _Requirements: 10.1, 16.1, 16.2_
  - [ ] 6.2 Author Slide 5 (Weekly Creative Rhythm)
    - "The Weekly Refresh Cycle" timeline (Mon–Fri)
    - Inline SVG icons per day (chart, lightbulb, upload, rocket)
    - _Requirements: 10.2_
  - [ ] 6.3 Author Slide 6 (Reading the Signals)
    - "How to Spot Winners and Losers" — two comparison columns
    - Green/blue vs muted gray signals, SVG gauge illustration
    - _Requirements: 10.3_
  - [ ] 6.4 Author Slide 7 (Iterating on Winners)
    - "Found a Winner? Make More Like It" with iteration flow visual
    - 3 `.ad-creative-card` variations (different colors/headlines)
    - "Don't reinvent — remix your winners"
    - _Requirements: 10.4, 16.1, 16.2_

- [ ] 7. Slide content: AI Tools and Dynamic Prompts (Slides 8–9)
  - [ ] 7.1 Author Slide 8 (Your AI Toolkit)
    - "The Tools That Do the Heavy Lifting" — grid of `.tool-card` elements
    - ChatGPT, Claude, Gemini, Recraft.ai, ZenduxAI with links, descriptions, SVG initial-letter icons
    - _Requirements: 11.1, 8.1, 8.2, 8.3_
  - [ ] 7.2 Author Slide 9 (Dynamic Prompt Builder)
    - "Build Your Prompt" with 3 variable input fields (product, audience, industry)
    - 4 `.prompt-block` cards with live-updating prompt text
    - Copy buttons that read from `PromptBuilder.getResolvedPrompt()`
    - _Requirements: 11.2, 7.1, 7.2_

- [ ] 8. Slide content: Testing, Launch, and Closing (Slides 10–14)
  - [ ] 8.1 Author Slide 10 (Testing Your Creatives)
    - "Simple A/B Testing That Works" — CBO vs ABO comparison
    - Campaign hierarchy diagram (SVG or styled HTML)
    - `.ad-creative-card` mockup in testing context
    - _Requirements: 12.1, 16.1, 16.2_
  - [ ] 8.2 Author Slide 11 (Launch Checklist)
    - "Launch Day Checklist" — 8 items with checkmark SVG icons
    - _Requirements: 12.2_
  - [ ] 8.3 Author Slide 12 (The Full Loop)
    - "Your Weekly AI Ad Workflow" — circular flow SVG (Research → Create → Launch → Optimize → loop)
    - "Repeat weekly. Consistency beats perfection."
    - _Requirements: 13.1_
  - [ ] 8.4 Author Slide 13 (Resource Hub)
    - "Your Toolkit — All in One Place" — 7 tool links with descriptions
    - "Screenshot this slide — it's your cheat sheet"
    - _Requirements: 13.2, 8.1, 8.2_
  - [ ] 8.5 Author Slide 14 (Closing / Q&A)
    - "Let's Talk" with contact placeholder
    - Animated background matching title slide to bookend the presentation
    - _Requirements: 13.3_

- [ ] 9. Checkpoint — All content authored
  - Browser test: pan through all 14 slides, verify continuous canvas feel (background flows across boundaries), prompt builder works, copy buttons work, all links open in new tabs. Ask user if questions arise.

- [ ] 10. Responsive verification
  - [ ] 10.1 Test and adjust at 375px, 768px, and 1024px+
    - Verify no content overflow, text readable, prompt builder inputs usable on mobile
    - Adjust font sizes, grid layouts, card sizes via clamp/media queries as needed
    - _Requirements: 6.7_

- [ ] 11. Final checkpoint
  - Full walkthrough in both presenter and viewer mode. Verify sync, late-joiner, reconnection, all interactive elements. Ask user if questions arise.

## Notes

- No optional test tasks — this is a one-time-use project; rely on browser testing at checkpoints
- Task 1 (Supabase setup) must be done manually in the Supabase dashboard before sync features can be tested
- SVG illustrations are authored inline with each slide task, not as a separate polish pass
- The horizontal strip layout simplifies transitions: changing the `translateX` target mid-transition causes CSS to smoothly redirect — no manual animation cancellation needed
- PromptBuilder state is browser-local; it is never sent to Supabase
- All files are static with no build step — deployable directly to GitHub Pages
