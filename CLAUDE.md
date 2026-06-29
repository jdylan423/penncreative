# CLAUDE.md — Jeremy Penn Portfolio Site

## What this site is
Personal portfolio for Jeremy Penn, Senior Creative Director & Brand Strategist.
Live at **www.jeremypenn.co**, deployed via **Vercel** (connected to GitHub `main` branch — every push to `main` deploys automatically).

No framework, no build step. Pure static HTML/CSS/JS.

---

## File map

| Path | Role |
|------|------|
| `index.html` | Entire single-page site |
| `css/style.css` | All styles — design tokens, layout, animations, responsive breakpoints |
| `js/app.js` | All JavaScript — canvas hero, GSAP scroll, nav, reveals, form, lightbox, marquee |
| `frames/snow-monkey_XXXX.webp` | 312 WebP frames (0002–0313) — scroll-driven canvas animation |
| `animations/process-0{1,2,3}.webm` | Loop videos for the three Process section cards |
| `images/` | Project gallery images (lululemon, saks, good-luck-dry-cleaners, degen-arcade) |
| `brand_assets/new site logos black/` | Brand logos for the "Trusted By" marquee |
| `videos/Degen-Arcade-5.mp4` | Inline video in Degen Arcade case study |
| `privacy.html`, `tos.html` | Legal pages (share `css/style.css`) |
| `_backup_v1/`, `_backup_v2/` | Old site versions — not deployed, do not edit |
| `fine-art-link-preview.html`, `skills-preview.html`, `test-animations.html` | Dev/test pages |
| `.claude/launch.json` | Dev server config: `npx serve -l 3456 -s .` |

---

## External dependencies (CDN — no npm)

| Library | Version | Purpose |
|---------|---------|---------|
| Lenis | v1 (jsDelivr) | Smooth scroll |
| GSAP | v3 (jsDelivr) | Scroll animations, marquee, open/close transitions |
| ScrollTrigger | v3 (jsDelivr, GSAP plugin) | Scrub-driven hero scroll |
| Inter | Google Fonts | Body + heading typeface |

All scripts loaded with `defer` at bottom of `index.html`.

---

## Hero animation — how it works

- A full-screen `<canvas id="canvas">` is fixed behind all content.
- 312 WebP frames (`frames/snow-monkey_XXXX.webp`) play frame-by-frame as the user scrolls.
- A 500vh spacer `<div id="hero-scroll">` provides the scroll distance.
- GSAP ScrollTrigger scrubs through frames via `onUpdate`.
- Phase 1: first 25 frames load sequentially, progress bar animates; loader hides on completion.
- Phase 2: remaining frames load in background.
- Canvas rendering: desktop = right-aligned cover; mobile = center-aligned cover.

### Scroll sequence (progress 0–100%)
| Progress | What happens |
|----------|-------------|
| 0–40% | Subtitles cycle: Creative Director → Cultural Strategist → Artist → Product Designer → joke |
| 0–70% | Hero name + gradient fade out |
| 0–50% | Scroll cue visible; fades by 60% |
| 60–85% | Canvas fades to white (whitewash overlay) |
| 70–80% | "Concept to Culture" headline fades in |
| 80–88% | Headline holds center |
| 88–98% | Headline morphs: scales down 0.35×, drifts into about section |
| >2% | Nav becomes solid white/glass |

---

## Design tokens (`css/style.css` `:root`)

```
--white: #ffffff         --off-white: #f8f8f6
--grey-50 → --grey-800   (neutral scale)
--black: #111110
--font: 'Inter', system stack
--ease-expo: cubic-bezier(0.16, 1, 0.3, 1)
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1)
--max-w: 1400px
--gutter: clamp(1.5rem, 5vw, 6rem)
--section-spacing: clamp(6rem, 12vh, 10rem)
```

---

## Sections (in DOM order)

1. **Loader** — progress bar, hides after first 25 frames load
2. **Nav** — fixed; transparent over hero, glass when scrolled
3. **Hero** — canvas + gradient overlay + name/subtitle text + scroll cue
4. **Transition headline** — "Concept to Culture" (fixed, scroll-driven)
5. **About** — bio text + circular headshot
6. **Trusted By** — two GSAP infinite marquee rows of brand logos
7. **Selected Works** — 4 expandable project cards (Lululemon, Saks, GLDC, Degen Arcade)
8. **Process** — 3 cards with webm loop videos
9. **Contact** — form → Formspree endpoint `https://formspree.io/f/mpqypndb` via `fetch`
10. **Footer**
11. **Lightbox** — full-screen gallery image viewer with keyboard nav

---

## Section reveal pattern

All content sections use an `IntersectionObserver` in `app.js:initReveals()`.
When a section enters the viewport, it gets the class `in-view`.
CSS handles the transition (opacity + translateY → 0).

---

## Responsive breakpoints

| Breakpoint | Changes |
|-----------|---------|
| ≤1024px | Process grid: 3→2 cols; about photo 220px |
| ≤768px | Mobile nav (hamburger + overlay); hero text centered; about 1-col; works 1-col header; process 1-col; contact 1-col |
| ≤480px | Hero name 1.8rem; work gallery 1-col; about photo 120px |

---

## Dev server

```bash
npx serve -l 3456 -s .
```
Then open http://localhost:3456. No build needed — file edits are live on refresh.

---

## Deployment

Push to `main` → Vercel auto-deploys. No CI, no build command, just static file hosting.

---

## Contact form

- Endpoint: `https://formspree.io/f/mpqypndb`
- Method: `fetch` POST with `Content-Type: application/json`
- On success: form hidden, `#form-success` shown
- On error: `#form-error` shown

---

## Copy Rules (enforced on all content edits)

- **No em dashes** — use commas, colons, semicolons, or periods instead. Also ban `--`.
- **No AI slop** — banned words and phrases: seamless, elevate, unleash, next-gen, leverage, cutting-edge, game-changer, robust, innovative, holistic, delve, foster, streamline, reimagine, transformative, curated, journey (metaphorical), ecosystem (metaphorical), granular, deep dive, synergy, paradigm, at the end of the day, it's worth noting, in today's world.
- **No superlatives without evidence** — first, best, only, leading, pioneering require a cited source or removal.
- **No invented outcomes** — no metrics, awards, revenue figures, or press mentions unless already present in existing site copy.
- **Tone** — premium, concise, factual. Confident without hype.

---

## Notes

- Canonical URL in meta tags is `https://jeremypenn.com/` (not `.co`) — intentional or to-do.
- `fine-art-link-preview.html` links to a fine art site at `https://jeremypenn.com`.
- The "fine art" link in the About section also points to `https://jeremypenn.com`.
