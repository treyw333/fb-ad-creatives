# Requirements Document

## Introduction

A browser-based, presenter-controlled synchronized web presentation for a talk on optimizing Facebook ads using AI tools, targeted at digital agency owners. The presentation is hosted on GitHub Pages, uses Supabase Realtime for slide synchronization, and is built with vanilla HTML/CSS/JS (no build step). It supports up to 50 concurrent viewers who see exactly the slide the presenter is on, with no independent navigation. The presentation is designed as one continuous horizontal canvas — slides are logical sections of a single flowing visual experience, not discrete "slides" in the traditional sense. Content features interactive prompt builders with user-customizable variables, copy-to-clipboard prompts, clickable tool links, example ad creatives, and inline vector illustrations — all wrapped in a premium dark futuristic aesthetic that showcases AI capability without looking templated or cheap.

## Glossary

- **Presentation_App**: The single-page web application serving both presenter and viewer modes, deployed to GitHub Pages
- **Presenter_View**: The mode activated via a secret key in the URL, granting slide navigation controls (next/prev)
- **Viewer_View**: The default mode for attendees, displaying only the current slide the presenter is on with no navigation controls
- **Slide_Engine**: The client-side module responsible for rendering slides, managing transitions, and displaying interactive content. Slides are positioned as panels in a single horizontal strip — transitions pan the viewport across this strip to maintain the illusion of one continuous canvas.
- **Sync_Service**: The module that uses Supabase Realtime (Broadcast channel) to publish and receive the current slide index
- **State_Store**: A small Supabase database table that persists the current slide index so late joiners can fetch it on load
- **Slide_Deck**: The ordered collection of 14 slides (panels) containing the presentation content, laid out as a continuous horizontal strip
- **Interactive_Element**: A UI component embedded in a slide — a copy-to-clipboard button, an external link, or a dynamic prompt builder
- **Prompt_Builder**: An interactive form embedded in a slide where viewers can type in their own values (product name, target audience, industry, etc.) and see the prompt update live before copying
- **Secret_Key**: A URL query parameter (e.g., `?role=presenter&key=<secret>`) used to authenticate the presenter
- **Transition**: A smooth horizontal pan across the continuous canvas, revealing the next section
- **Example_Creative**: A mock ad creative image or card used to illustrate concepts (generated via AI image tools or inline SVG)

## Requirements

### Requirement 1: Presenter Authentication

**User Story:** As the presenter, I want to access presenter controls via a secret key in the URL, so that only I can navigate the slides.

#### Acceptance Criteria

1. WHEN the URL contains a valid Secret_Key query parameter, THE Presentation_App SHALL activate the Presenter_View with next and previous slide controls visible.
2. WHEN the URL does not contain a valid Secret_Key query parameter, THE Presentation_App SHALL activate the Viewer_View with no navigation controls visible.
3. THE Presentation_App SHALL store the Secret_Key as a configurable constant in the source code.

### Requirement 2: Presenter Slide Navigation

**User Story:** As the presenter, I want next and previous controls to navigate through slides, so that I can drive the presentation at my own pace.

#### Acceptance Criteria

1. WHEN the presenter clicks the next button, THE Slide_Engine SHALL advance to the next slide in the Slide_Deck.
2. WHEN the presenter clicks the previous button, THE Slide_Engine SHALL return to the previous slide in the Slide_Deck.
3. WHILE the Slide_Engine is displaying the first slide, THE Presenter_View SHALL disable the previous button.
4. WHILE the Slide_Engine is displaying the last slide, THE Presenter_View SHALL disable the next button.
5. WHEN the presenter presses the right arrow key, THE Slide_Engine SHALL advance to the next slide.
6. WHEN the presenter presses the left arrow key, THE Slide_Engine SHALL return to the previous slide.
7. THE Presenter_View SHALL display the current slide number and total slide count.

### Requirement 3: Real-Time Slide Synchronization

**User Story:** As a viewer, I want to see the same slide the presenter is on in real-time, so that I can follow along with the talk.

#### Acceptance Criteria

1. WHEN the presenter navigates to a new slide, THE Sync_Service SHALL broadcast the current slide index to all connected viewers via Supabase Realtime Broadcast.
2. WHEN the Viewer_View receives a broadcast with a new slide index, THE Slide_Engine SHALL transition to that slide.
3. THE Viewer_View SHALL NOT display any slide navigation controls.
4. THE Viewer_View SHALL NOT allow keyboard or gesture-based slide navigation.

### Requirement 4: Late Joiner Support

**User Story:** As a viewer joining mid-presentation, I want to land on the correct current slide, so that I don't miss what's being discussed.

#### Acceptance Criteria

1. WHEN the presenter navigates to a new slide, THE Sync_Service SHALL write the current slide index to the State_Store table in Supabase.
2. WHEN a new viewer loads the Presentation_App, THE Sync_Service SHALL fetch the current slide index from the State_Store before subscribing to the Broadcast channel.
3. WHEN the State_Store returns a valid slide index, THE Slide_Engine SHALL display that slide immediately without a transition animation.

### Requirement 5: Continuous Horizontal Canvas and Transitions

**User Story:** As a viewer or presenter, I want the presentation to feel like one continuous horizontal experience rather than discrete slides, so it feels immersive and cinematic.

#### Acceptance Criteria

1. THE Slide_Engine SHALL lay out all 14 slides as panels in a single horizontal strip (each panel = 100vw wide), and transition by translating the entire strip or viewport window.
2. WHEN the slide index increases, THE Slide_Engine SHALL pan the viewport to the right with a smooth ease-out curve, revealing the next panel.
3. WHEN the slide index decreases, THE Slide_Engine SHALL pan the viewport to the left with a smooth ease-out curve.
4. THE Slide_Engine SHALL complete each pan animation within 600 milliseconds using a cubic-bezier curve that starts fast and decelerates.
5. WHEN a transition is in progress and a new slide change is received, THE Slide_Engine SHALL smoothly redirect the pan toward the new target without snapping or jarring resets.
6. Adjacent slides SHALL share visual continuity — background gradients, ambient elements, and decorative lines flow across panel boundaries so the seams are invisible during panning.
7. THE ambient background canvas SHALL span the full width of the horizontal strip (not just one viewport), so gradient orbs and effects are visible across slide boundaries during transitions.
8. WHEN the presentation loads, THE Slide_Engine SHALL NOT show any horizontal scrollbar. Overflow is hidden; only the Slide_Engine controls the viewport position.

### Requirement 6: Premium Dark Futuristic Visual Design

**User Story:** As a viewer, I want a premium, futuristic dark-themed presentation that looks like it was made by a top design studio — not a generic AI template — so the visual quality reinforces the message about AI capability.

#### Acceptance Criteria

1. THE Presentation_App SHALL use a deep dark background (#0a0a0f to #12121a range) with subtle gradient shifts that flow continuously across the horizontal canvas.
2. THE Presentation_App SHALL use accent colors sparingly — electric blue (#00d4ff), cyan (#00f0ff), and violet (#8b5cf6) — for key highlights, borders, and interactive elements only.
3. THE Presentation_App SHALL use a premium sans-serif font stack (Inter or similar) with careful typographic hierarchy: large bold headings, medium subheads, regular body text with generous line height.
4. THE Slide_Engine SHALL render each slide as a full-viewport panel (100vw × 100vh) within the horizontal strip.
5. THE Presentation_App SHALL include subtle ambient background effects (slow-moving gradient orbs, faint grid lines, or soft particle field) that span the full canvas width and are visible during transitions between panels.
6. THE Presentation_App SHALL NOT use any cliché AI imagery (robot faces, brain circuits, floating hologram hands) or stock-template patterns.
7. THE Presentation_App SHALL be responsive and readable on viewports >= 375px wide (mobile phones).
8. ALL text SHALL maintain a minimum contrast ratio of 4.5:1 against its background for readability.
9. THE Presentation_App SHALL use subtle micro-animations on interactive elements (buttons glow on hover, links have smooth color transitions) with durations under 300ms.
10. Decorative elements (thin lines, dot grids, geometric shapes) SHALL extend across panel boundaries to reinforce the continuous canvas feel.

### Requirement 7: Copy-to-Clipboard Interactive Elements

**User Story:** As a viewer, I want to copy AI prompts from the slides with a single click, so that I can paste them directly into AI tools.

#### Acceptance Criteria

1. WHEN a viewer clicks a copy-to-clipboard button on a slide, THE Interactive_Element SHALL copy the associated prompt text to the system clipboard using the Clipboard API (requires HTTPS — provided by GitHub Pages).
2. WHEN the copy operation succeeds, THE Interactive_Element SHALL display a brief visual confirmation (e.g., "Copied!" with a checkmark) for 2 seconds.
3. IF the copy operation fails (e.g., browser permission denied), THEN THE Interactive_Element SHALL display the prompt text in a selectable text area as a fallback.

### Requirement 8: External Tool Links

**User Story:** As a viewer, I want clickable links to AI tools shown during the presentation, so that I can explore them immediately.

#### Acceptance Criteria

1. WHEN a viewer clicks an external tool link, THE Interactive_Element SHALL open the linked URL in a new browser tab.
2. THE Interactive_Element SHALL set the `rel` attribute to `noopener noreferrer` on all external links.
3. THE Interactive_Element SHALL visually distinguish external links from regular text using the accent color, a subtle glow, and an external-link icon indicator.

### Requirement 9: Presentation Content — Title and Context Slides (Slides 1–3)

**User Story:** As a viewer, I want to quickly understand why this talk matters and why creative volume is a competitive advantage right now, so I can see the value before we get into tactics.

#### Acceptance Criteria

1. THE Slide_Engine SHALL render **Slide 1 (Title)** with:
   - Headline: "AI-Powered Ad Creatives"
   - Subtitle: "How to Produce Winning Ads Faster Than Your Competition"
   - Presenter name placeholder (configurable)
   - Date
   - A subtle animated gradient background or abstract geometric visual — no stock imagery

2. THE Slide_Engine SHALL render **Slide 2 (Why Creatives Matter)** with:
   - Heading: "The #1 Lever You Control"
   - Three key points presented as cards or a visual list:
     - "Facebook's algorithm decides who sees your ad — but YOU decide what they see"
     - "More creative variations = more chances for the algorithm to find winners"
     - "Agencies testing 10+ creatives/week see 2-3x better cost-per-result"
   - A simple inline SVG icon or illustration per point (e.g., a target, a grid of variations, a downward cost arrow)

3. THE Slide_Engine SHALL render **Slide 3 (The Andromeda Shift)** with:
   - Heading: "Facebook Changed the Rules"
   - Brief explanation: "Facebook's Andromeda update scores every ad on relevance and engagement before it even enters the auction. Low-quality or stale creatives get buried. Fresh, high-quality creatives get rewarded with cheaper reach."
   - A simple before/after visual: "Before: bid wins → After: creative quality wins"
   - Keep language plain — no jargon about ML ranking systems

### Requirement 10: Presentation Content — Strategy Slides (Slides 4–7)

**User Story:** As a viewer, I want clear, actionable frameworks for building better ads and knowing what's working, so I can apply these to my accounts this week.

#### Acceptance Criteria

1. THE Slide_Engine SHALL render **Slide 4 (Anatomy of a Winning Ad)** with:
   - Heading: "What Makes an Ad Work"
   - A visual breakdown of an ad's structure using an example ad creative mockup:
     - **Hook** (first 1-3 seconds / first line of copy): "Stops the scroll — a bold claim, question, or pattern interrupt"
     - **Value** (body): "Shows the benefit, not the feature"
     - **CTA** (call to action): "Tells them exactly what to do next"
   - An annotated example creative card (SVG or styled HTML) showing each section highlighted with accent-colored callout lines
   - Keep descriptions to one short sentence each

2. THE Slide_Engine SHALL render **Slide 5 (Your Weekly Creative Rhythm)** with:
   - Heading: "The Weekly Refresh Cycle"
   - A visual timeline or weekly calendar showing:
     - **Monday**: Review last week's performance — kill losers, note winners
     - **Tuesday–Wednesday**: Generate new creative concepts using AI tools
     - **Thursday**: Build and upload 3-5 new ad variations
     - **Friday**: Launch new creatives into testing campaigns
   - Simple inline SVG icons per day (chart, lightbulb, upload, rocket)

3. THE Slide_Engine SHALL render **Slide 6 (Reading the Signals)** with:
   - Heading: "How to Spot Winners and Losers"
   - Two columns or comparison cards:
     - **Winner signals**: Low cost-per-result, high CTR (above 1.5%), strong hook rate (video), improving over 3+ days
     - **Loser signals**: Rising cost-per-result, CTR below 0.8%, high frequency (audience fatigue), declining after day 2
   - Use green/blue accent for winners, muted red/gray for losers
   - A simple gauge or thumbs-up/thumbs-down SVG illustration

4. THE Slide_Engine SHALL render **Slide 7 (Iterating on Winners)** with:
   - Heading: "Found a Winner? Make More Like It"
   - A visual showing the iteration process:
     - Take your best-performing ad → change ONE variable → test again
     - Variables to iterate: headline, image style, color palette, CTA text, opening hook
   - Show 3 example creative variation thumbnails (styled HTML cards with slight visual differences — e.g., same layout but different accent colors and headlines)
   - Key message: "Don't reinvent — remix your winners"

### Requirement 11: Presentation Content — AI Tools and Dynamic Prompts (Slides 8–9)

**User Story:** As a viewer, I want to know exactly which AI tools to use and have prompts I can customize with my own business details before copying, so I leave with something I can use immediately — not a generic template.

#### Acceptance Criteria

1. THE Slide_Engine SHALL render **Slide 8 (Your AI Toolkit)** with:
   - Heading: "The Tools That Do the Heavy Lifting"
   - A grid of tool cards, each containing:
     - **ChatGPT** — "Ad copy, hooks, and headline variations" — link: https://chat.openai.com
     - **Claude** — "Strategy briefs, audience research, and long-form copy" — link: https://claude.ai
     - **Gemini** — "Competitive research and trend analysis" — link: https://gemini.google.com
     - **Recraft.ai** — "Vector graphics and branded illustrations" — link: https://www.recraft.ai
     - **ZenduxAI** — "Full ad creative generation in one workflow" — link: https://zenduxai.com
   - Each card has the tool name as a clickable external link, a one-line description, and a subtle tool icon or logo placeholder (styled SVG initial letter)
   - Cards should have a subtle glass/frosted border effect

2. THE Slide_Engine SHALL render **Slide 9 (Dynamic Prompt Builder)** with:
   - Heading: "Build Your Prompt"
   - A Prompt_Builder interface containing:
     - **Variable input fields** at the top of the slide: small labeled text inputs for "Your product/service", "Target audience", and "Industry" — styled as sleek inline fields with accent-colored focus borders
     - **Prompt cards below**, each displaying a live-updating prompt where the variable placeholders are replaced in real-time as the viewer types:
       - **Ad Copy Prompt**: "Write 5 Facebook ad variations for {product/service}. Each ad should have: a scroll-stopping first line, 2-3 sentences of benefit-focused body copy, and a clear CTA. Tone: confident but not salesy. Audience: {target audience}."
       - **Image Concept Prompt**: "Create a clean, modern product lifestyle photo for a Facebook ad. Show {product/service} in a natural setting with soft lighting. Style: editorial, minimal, high-end. No text overlay."
       - **Hook Generator Prompt**: "Give me 10 opening lines for a Facebook ad about {product/service}. Mix formats: questions, bold claims, statistics, and 'did you know' style hooks. Keep each under 15 words."
       - **Competitor Research Prompt**: "Analyze the top Facebook ads in the {industry} space. What hooks, visuals, and CTAs are most common? Summarize the top 5 patterns."
     - Each prompt card has a copy-to-clipboard button that copies the prompt with the viewer's filled-in values (or the placeholder text if no values entered)
   - WHEN a viewer types into a variable input field, THE Prompt_Builder SHALL update all prompt cards in real-time (on each keystroke) replacing the corresponding `{variable}` with the typed value.
   - WHEN a variable input field is empty, THE prompt card SHALL display the original placeholder text (e.g., `[product/service]`) in a visually distinct style (muted color or italic) so viewers know it's a placeholder.
   - THE Prompt_Builder state is local to each viewer's browser — it is NOT synchronized via Supabase. Each viewer fills in their own values independently.

### Requirement 12: Presentation Content — Testing and Launch Slides (Slides 10–11)

**User Story:** As a viewer, I want a simple framework for testing new creatives in Ads Manager, so I know exactly how to set up campaigns without overcomplicating it.

#### Acceptance Criteria

1. THE Slide_Engine SHALL render **Slide 10 (Testing Your Creatives)** with:
   - Heading: "Simple A/B Testing That Works"
   - A clear comparison:
     - **CBO (Campaign Budget Optimization)**: "Best for most agencies — let Facebook distribute budget to the winning ads automatically. Set one budget at the campaign level."
     - **ABO (Ad Set Budget Optimization)**: "Use when you want equal spend across variations to get clean data. Set individual budgets per ad set."
   - Recommendation: "Start with CBO. Use 3-5 creative variations per ad set. Give each test 3-5 days and $20-50/day minimum before judging."
   - A simple visual diagram showing campaign → ad set → ad variations hierarchy

2. THE Slide_Engine SHALL render **Slide 11 (Launch Checklist)** with:
   - Heading: "Launch Day Checklist"
   - A styled checklist (not a plain list) with checkmark icons:
     - ✓ Creative files exported at 1080×1080 (square) and 1080×1920 (story)
     - ✓ Ad copy written with 3 headline options and 2 primary text options
     - ✓ UTM parameters added to all destination URLs
     - ✓ Pixel/conversion event verified on landing page
     - ✓ CBO campaign created with 3-5 ad variations
     - ✓ Budget set ($20-50/day minimum per ad set for testing)
     - ✓ Placements: Automatic (let Facebook optimize) or Feed + Stories only
     - ✓ Schedule: Launch Monday-Tuesday for full-week data collection
   - Keep it scannable — no paragraphs, just the checklist

### Requirement 13: Presentation Content — Workflow and Resources (Slides 12–14)

**User Story:** As a viewer, I want a summary of the full workflow and a resource page I can screenshot, so that I leave with a clear action plan.

#### Acceptance Criteria

1. THE Slide_Engine SHALL render **Slide 12 (The Full Loop)** with:
   - Heading: "Your Weekly AI Ad Workflow"
   - A circular or linear flow diagram (SVG) showing 4 steps with connecting arrows:
     1. **Research** — "Analyze what's working (yours + competitors')"
     2. **Create** — "Use AI tools to generate copy + visuals"
     3. **Launch** — "Set up testing campaigns in Ads Manager"
     4. **Optimize** — "Read the data, kill losers, iterate winners"
   - Arrow looping back from step 4 to step 1
   - Each step has a small icon and one-line description
   - Key message at bottom: "Repeat weekly. Consistency beats perfection."

2. THE Slide_Engine SHALL render **Slide 13 (Resource Hub)** with:
   - Heading: "Your Toolkit — All in One Place"
   - All tool links consolidated with descriptions, each as a clickable external link:
     - ChatGPT — https://chat.openai.com
     - Claude — https://claude.ai
     - Gemini — https://gemini.google.com
     - Recraft.ai — https://www.recraft.ai
     - ZenduxAI — https://zenduxai.com
     - Facebook Ads Manager — https://www.facebook.com/adsmanager
     - Meta Ad Library (competitor research) — https://www.facebook.com/ads/library
   - A note: "Screenshot this slide — it's your cheat sheet"
   - Cards or list items with accent-colored link styling

3. THE Slide_Engine SHALL render **Slide 14 (Closing / Q&A)** with:
   - Heading: "Let's Talk"
   - Subheading: "Questions, ideas, or want to share what's working for you?"
   - Presenter contact placeholder (name, email, or social handle — configurable)
   - A clean, minimal layout with generous whitespace
   - Optional: subtle animated background element (same style as title slide) to bookend the presentation

### Requirement 14: Deployment and Hosting

**User Story:** As the presenter, I want the app deployed on GitHub Pages with no build step, so that I can host it for free and update it easily.

#### Acceptance Criteria

1. THE Presentation_App SHALL consist of static HTML, CSS, and JavaScript files with no build or compilation step required.
2. THE Presentation_App SHALL load the Supabase client library from a CDN.
3. THE Presentation_App SHALL store the Supabase project URL and anon key as configurable constants in the source code.
4. THE Presentation_App SHALL function correctly when served from the root of a GitHub Pages site.
5. THE Presentation_App SHALL be deployable by pushing to the `main` branch with GitHub Pages configured to serve from root (`/`).

### Requirement 15: Viewer Connection Resilience

**User Story:** As a viewer, I want the presentation to recover gracefully if my connection drops, so that I don't get stuck on a stale slide.

#### Acceptance Criteria

1. WHEN the Sync_Service detects a reconnection to the Supabase Realtime channel, THE Sync_Service SHALL fetch the current slide index from the State_Store.
2. IF the Sync_Service fails to connect to the Supabase Realtime channel, THEN THE Presentation_App SHALL display a small, non-intrusive connection status indicator (e.g., a pulsing dot in the corner) visible to the viewer.
3. WHEN the connection is restored, THE indicator SHALL disappear after 2 seconds.

### Requirement 16: Example Ad Creatives and Visual Assets

**User Story:** As a viewer, I want to see real-looking example ad creatives throughout the presentation, so the concepts feel concrete and actionable rather than abstract.

#### Acceptance Criteria

1. THE Slide_Engine SHALL display example ad creative mockups on Slides 4, 7, and 10 using styled HTML/CSS cards that resemble real Facebook ad units.
2. EACH example creative card SHALL include: a visual area (gradient, SVG illustration, or placeholder image), headline text, body copy, and a CTA button — styled to look like an actual ad.
3. THE Presentation_App SHALL use inline SVG illustrations and CSS-generated graphics for all decorative visuals — no external image file dependencies unless explicitly provided.
4. WHERE AI-generated images are desired (e.g., product lifestyle shots), THE Slide_Engine SHALL use placeholder gradient areas with a label indicating the image concept, so they can be swapped with real AI-generated images before the presentation.
