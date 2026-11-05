# Design System: PostalNook Partner Program

## 1. Visual Theme & Atmosphere

**Tone:** Institutional, trustworthy, data-driven, premium

The PostalNook Partner Program design conveys a professional, business-focused experience with a deep navy foundation grounded by vibrant orange accents. The visual language balances corporate credibility with modern clarity—think of a polished, well-lit business office with sharp typography and confident data presentation.

The atmosphere is:
- **Density:** 6/10 — balanced information density, not cramped, not sparse
- **Variance:** 7/10 — asymmetric hero and two-column layouts prevent monotony
- **Motion:** 4/10 — subtle scroll reveals and count-up animations, no excessive movement
- **Accessibility:** High contrast, semantic color use, keyboard navigation supported

---

## 2. Color Palette & Roles

### Primary Colors

- **Navy 900** (#07172E) — Hero backgrounds, footer, investment cards, primary dark surfaces. The anchor of the brand palette—deep, trustworthy, institutional.
- **Navy 800** (#0B2545) — Logo background, cards, secondary darker surfaces. Slightly lighter for hierarchy.
- **Navy 700** (#12305A) — Footer borders, subtle tints. Transitional shade.
- **Navy 600** (#1C3D6B) — Data visualization, secondary emphasis. Bridge to lighter navy tones.

### Accent Color

- **Orange** (#E8622A) — Primary CTA buttons, kickers, badges, emphasis elements, count-up animations. The hero accent that drives conversion. Never exceeded as primary color on page (≤10% of visible surface).
- **Orange 600** (#D2531E) — Hover state for Orange, darker emphasis. ~4% less saturation than primary orange.
- **Orange 050** (#FCF1EA) — Background tint for badges, support item checkmarks, mini card icons. Ultra-light hint of warmth.

### Neutral Foundation

- **White** (#FFFFFF) — Card fill, button text, form backgrounds. Clean, readable baseline.
- **Ink** (#11223B) — Primary body text, heading text, main content color. Dark enough for high contrast.
- **Ink 2** (#33445E) — Secondary text, navigation links, labels. Slightly muted for hierarchy.
- **Muted** (#5C6B82) — Tertiary text, captions, metadata, kickers. De-emphasized supporting content.
- **Paper** (#F2F4F7) — Section background, page background. Cool light neutral, tinted toward navy.
- **Paper 2** (#E6EAF0) — Subtle background variations, table headers, slight contrast layer.

### Data & Utility

- **Steel** (#34618F) — Data visualization, stat tags. Professional blue-gray for numbers and metrics.
- **Steel 100** (#E5ECF3) — Tint background for stat chips. Ultra-light steel for affordance.
- **Line** (rgba(17,34,59,.12)) — Border color for cards, dividers, subtle structure. Tinted ink at 12% opacity.
- **Line 2** (rgba(17,34,59,.07)) — Even more subtle dividers, grid lines, internal separators. 7% opacity ink.
- **Navy Line** (rgba(255,255,255,.10)) — Borders on dark backgrounds (navy hero, footer). White at 10% opacity.

### Color Strategy: Restrained

**One accent, tinted neutrals.** Orange is the only saturated color on the page; everything else is navy, ink, or cool light neutrals. This creates a premium, professional aesthetic without visual chaos. No secondary accent colors. No gradients. No multicolor data visualizations.

---

## 3. Typography Rules

### Font Stack

- **Display Font:** Archivo (Weights: 500, 600, 700, 800)
  - Used for: H1, H2, H3 titles, stat numbers, kickers, data-heavy labels
  - Personality: Modern geometric, geometric-sans, geometric grotesk. Clean, confident, constructed feel.
  - Line height: 1.04 (tight for headings, controls rhythm)
  - Letter spacing: -0.02em (subtle tracking-in for visual control)

- **Body Font:** Hanken Grotesk (Weights: 400, 500, 600, 700)
  - Used for: Body text, button labels, descriptions, form labels, UI copy
  - Personality: Warm, approachable, modern grotesk with slight humanist touches
  - Line height: 1.6 (generous, readable)
  - Letter spacing: Normal (default spacing respects readability)

- **Mono Font:** Space Mono (Weights: 400, 700)
  - Used for: Kickers, labels, tags, metadata, small numbers
  - Personality: Literal, code-inspired, structured. Used sparingly for visual punctuation.
  - Line height: 1.4 (tight, to emphasize compact tech aesthetic)
  - Letter spacing: 0.14em–0.18em (expanded for emphasis and scan-ability)

### Type Scale & Hierarchy

| Use | Size | Weight | Line Height | Example |
|-----|------|--------|-------------|---------|
| H1 Display (Hero) | 64px / clamp(36px, 5.2vw, 64px) | 800 | 1.04 | "Own the modern mailbox business in your city." |
| H2 Section Title | 44px / clamp(29px, 4vw, 44px) | 800 | 1.04 | "The opportunity, in numbers" |
| H3 Card / Feature | 17–21px | 700 | 1.1 | "Mailbox subscriptions" |
| H4 / H5 Small Title | 15–17px | 700 | 1.2 | "Physical hub" |
| Body Text | 17px base / clamp(16px, 1.6vw, 19px) | 400 | 1.6 | Main descriptive paragraph |
| Body Small | 14.5–15px | 400–500 | 1.5 | Card descriptions, form labels |
| Kicker / Label | 10.5–12px | 700 | 1.4 | "FRANCHISE · PARTNERSHIP PROGRAM" |
| Stat / Number | 38–60px | 800 | 1 | "200+", "$45K", "6" |

### Typography Bans

- **No Inter.** Rejected for premium context; use Archivo instead.
- **No generic serifs** (Times New Roman, Georgia, Garamond). Serif is banned in dashboard/SaaS UI.
- **No truncation without purpose.** Wrap text over truncating; if truncation is necessary, provide full text via tooltip or expand.
- **No oversaturated color text.** All text uses semantic color tokens (ink, muted, orange); no arbitrary ad-hoc colors.

### Responsive Typography

All major heading sizes use `clamp()` to scale smoothly across 375px (mobile) to 1200px+ (desktop):
- H1: `clamp(36px, 5.2vw, 64px)`
- H2: `clamp(29px, 4vw, 44px)`
- Body text: `clamp(16px, 1.6vw, 19px)`

Body text minimum 16px on mobile to prevent iOS auto-zoom. Line lengths capped at 65–75 characters on desktop for readability.

---

## 4. Component Styles

### Buttons

**Primary Button (CTA)**
- Background: Orange (#E8622A)
- Text: White, Hanken Grotesk 16px / 600, letter-spacing normal
- Size: 58px height, 32px horizontal padding (large); 54px height (medium); 44px height (small)
- Border Radius: 11px
- Shadow: `0 10px 28px -14px rgba(17,34,59,.18), 0 2px 8px rgba(17,34,59,.05)` (on hover)
- Hover State: Background darkens to Orange 600 (#D2531E), translate Y -2px, enhanced shadow
- Active State: No translate, shadow reduces to `0 1px 2px rgba(17,34,59,.05), 0 2px 8px rgba(17,34,59,.05)`
- Disabled: Opacity 0.5, no transform, no shadow, cursor not-allowed

**Ghost Button (Secondary)**
- Background: Transparent
- Border: 1.5px solid Line (#rgba(17,34,59,.12))
- Text: Ink (#11223B), weight 600
- Hover State: Border becomes ink, background tints to rgba(17,34,59,.03), translate Y -2px
- Dark Variant: Text #EAF0F7, border rgba(255,255,255,.28); hover border white, background rgba(255,255,255,.06)

**Button Arrow Animation**
- Arrow character (→) transitions on hover with 0.2s ease, translate X +3px to signal momentum

### Cards & Containers

**Standard Card**
- Background: White (#FFFFFF)
- Border: 1px solid Line (rgba(17,34,59,.12))
- Border Radius: 14px
- Box Shadow: `0 10px 28px -14px rgba(17,34,59,.18), 0 2px 8px rgba(17,34,59,.05)`
- Hover State (optional): Translate Y -4px, enhanced shadow, border-color tints to rgba(232,98,42,.4) for subtle orange accent

**Dark Card (on navy backgrounds)**
- Background: rgba(8,22,42,.6) — semi-transparent dark navy
- Border: 1px solid Navy Line (rgba(255,255,255,.10))
- Text: Light (#EAF0F7, #AFC0D6, #7E93AE) depending on hierarchy

**Mini Card (nested in overview)**
- Background: White
- Border: 1px solid Line
- Border Radius: 10px (slightly tighter than standard)
- Padding: 20px
- Icon Box: 42x42px, background Orange 050, border-radius 11px, icon centered

**Investment Card**
- Background: Navy 900 (#07172E)
- Border: 1px solid Navy Line
- Border Radius: 22px (extra rounded for premium feel)
- Padding: 34px
- Text colors: Muted text #7E93AE, secondary #C3D0E1, primary #FFFFFF

### Form Elements

**Input Fields**
- Background: #FBFAF8 (warm white)
- Border: 1.5px solid Line, border-radius 10px
- Padding: 13px 14px (comfortable touch target)
- Typography: Hanken Grotesk 15.5px, color #11223B
- Placeholder: #A6AEBC (muted light gray)
- Hover State: Border-color rgba(17,34,59,.28)
- Focus State: Border-color Orange (#E8622A), background #FFFFFF, box-shadow `0 0 0 4px rgba(232,98,42,.12)`
- Invalid State: Border #D8453B, background #FEF6F5, focus-shadow `0 0 0 4px rgba(216,69,59,.12)`

**Form Labels**
- Typography: Hanken Grotesk 13px, weight 600, color Ink 2 (#33445E)
- Required marker: Orange asterisk
- Margin below: 7px

**Textarea**
- Min height: 88px
- Resize: vertical only
- Same border/focus styling as inputs

**Select Dropdowns**
- Styling matches inputs
- Use native select with custom focus states in supporting browsers

**Validation & Error**
- Error messages display below field, color #C5392F, font-size 12.5px, margin-top 6px
- Show only on invalid state (`.field.invalid .err{display:block}`)
- Inline validation on blur; don't trigger on keystroke

**Checkboxes (Consent)**
- Accent color: Orange (#E8622A)
- Label text: 13px, color muted
- Inline with label text

### Stat & Data Display

**Stat Boxes (4-column grid)**
- Background: White
- Border: 1px solid Line
- Border Radius: 14px
- Padding: 34px 28px (generous internal spacing)
- Typography:
  - Tag (label): Space Mono 10.5px, color Steel (#34618F), letter-spacing 0.12em, uppercase
  - Number: Archivo 52px, weight 800, color Navy 800, letter-spacing -0.03em
  - Caption: Body 14.5px, color Muted, margin-top 10px
- Responsive: 2 columns on tablet, 1 column on mobile

**Driver Cards (4-column, can collapse to 2 or 1)**
- Background: White
- Border: 1px solid Line
- Border Radius: 14px
- Padding: 26px 24px
- Index: Mono 12px, muted color
- Stat number: Archivo 38px, navy800, margin 14px 0 6px
- Title: Archivo 17px, weight 700
- Description: Body 14.5px, muted color

**Revenue Stream Cards (3-column, top accent)**
- Background: White
- Border: 1px solid Line + 3px top border Orange (visual punctuation)
- Border Radius: 14px
- Padding: 30px 28px
- Typography:
  - Stream number: Mono 14px, weight 700, Orange 600
  - Title: Archivo 21px, weight 700
  - Description: Body 15px, muted
- Chip (stats): Background Steel 100, color Steel, border-radius 9px, padding 11px 14px

### Kickers (Eyebrows)

- Font: Space Mono, 12px, weight 700, letter-spacing 0.18em, uppercase
- Color: Orange 600 (#D2531E) by default, muted (#5C6B82) for secondary sections
- Before element: 18px × 2px horizontal line, background matches color, margin-right 10px
- Adds visual separation and hierarchy to section introductions

### Territory Card & Status

**Scarcity Indicator**
- Progress bar background: rgba(255,255,255,.10)
- Progress fill: Linear gradient from Orange to #FF8A5C
- Height: 12px, border-radius 30px
- Territory chips:
  - Claimed: Muted text, opacity 0.4, text-decoration line-through
  - Available: Border color rgba(232,98,42,.5), text color #FF8A5C

---

## 5. Layout Principles

### Grid System

- **Max-width container:** 1200px
- **Horizontal padding:** 24px on sides (gutter)
- **Content width:** 1152px (1200 - 48px gutters)
- **Column gap:** 20–56px depending on section (two-column sections use 56px, four-column use 20px)

### Section Spacing

- **Standard section padding:** 92px vertical (top & bottom)
- **Tight sections:** 72px vertical (used for proof/stats sections)
- **Mobile sections:** 64px vertical on screens < 720px
- **Internal block spacing:** 16–50px depending on density

### Layout Variants

| Section | Layout | Notes |
|---------|--------|-------|
| Navigation | Horizontal flex | Logo + nav links + CTA |
| Hero | 2-column grid (1.08fr .92fr) | Copy left, image right; collapses to 1 on mobile < 860px |
| Proof / Stats | 4-column stat grid | Collapses to 2 on tablet, 1 on mobile |
| Overview | 2-column (1fr 1fr) | Image left / right with mini-card pair below copy |
| Drivers | 4-column card grid | Collapses to 2, then 1 on mobile |
| Revenue | 3-column stream grid | Collapses to 1 on mobile |
| Investment | 2-column (0.95fr 1.05fr) | Card left, support grid right; stacks on mobile |
| Partners | 3-column persona grid | Collapses to 1 on mobile |
| Urgency | 2-column (1.1fr .9fr) | Title/CTA left, territory card right; stack on mobile |
| Form | 2-column (0.92fr 1.08fr) | Form values left, form card right; stack on mobile |
| Final CTA | Centered, single column | Title + buttons centered, text-align center |
| Footer | 4-column on desktop, 2 on tablet, 1 on mobile | Brand + links grid, bottom copyright |

### Responsive Behavior

- **Mobile-first design:** All layouts start single-column on 375px phones
- **Tablet (768px):** Two-column where applicable; tighter spacing
- **Desktop (1024px+):** Full multi-column grid layouts
- **Extra large (1440px+):** Same as desktop, max-width respected
- **No horizontal scroll:** All content fits within viewport width on mobile
- **Safe area compliance:** Respect top/bottom notches and gesture areas; padding adjustments for fixed headers/footers

### Negative Space & Rhythm

- Spacing follows 4px/8dp base unit in most places
- Section separators: Use background color change rather than lines where possible
- Card spacing within grid: 20–22px gap (consistent rhythm)
- Internal padding: 18–34px depending on container size
- Heading-to-content spacing: 16–22px (not repetitive, varies)

---

## 6. Motion & Interaction

### Scroll Reveal Animation

- **Trigger:** Intersection Observer at 12% threshold, -40px bottom margin
- **Animation:** Opacity 0→1, translateY 22px→0
- **Duration:** 0.7s ease-out
- **Easing:** `cubic-bezier(0.2, 0.7, 0.2, 1)` — premium ease-out curve
- **Reduced motion:** Opacity 1, transform none, no transition (respects `prefers-reduced-motion`)

### Count-Up Animation (Numbers)

- **Trigger:** Intersection Observer at 60% threshold
- **Animation:** Animate from 0 to target value
- **Duration:** 1300ms
- **Easing:** Cubic ease-out (`1 - (1-t)³`)
- **Decimals:** Configurable (e.g., "9.6B" with 1 decimal)
- **Apply once:** Unobserve after animation completes

### Button Interactions

- **Hover state:** 150ms ease transition
  - Primary: Translate Y -2px, shadow enhances, background darkens
  - Arrow: Translate X +3px (200ms ease)
- **Active/Press:** 0ms instant
  - Translate Y 0 (back to baseline)
  - Shadow reduces
- **Focus ring:** 2–4px outline in accent color (keyboard navigation)

### Mobile Menu

- **Trigger:** Hamburger icon (44×44px touch target)
- **Animation:** Transform translateY(-120%) → 0
- **Duration:** 300ms cubic-bezier(0.4, 0, 0.2, 1)
- **Dismiss on nav click:** Close menu immediately
- **Position:** Fixed, z-index 55 (below modal/popover layers)

### Navigation Scroll Effect

- **Sticky header:** Top 0, z-index 60
- **On scroll > 8px:**
  - Add border-bottom-color: Line (previously transparent)
  - Add box-shadow: `0 6px 24px -18px rgba(11,37,69,.4)`
  - Transition duration: 250ms

### Form Submit Feedback

- **Valid submit:** Hide form, show success state
- **Success animation:** Scale 0.94→1, opacity 0→1 (400ms cubic-bezier(0.2, 0.8, 0.3, 1.2) — slight bounce)
- **Success ring:** 68×68px circle, background Orange 050, icon in Orange 600
- **Reset form:** Optional, or keep success visible with "close" option

### Flag Marquee (Scroll Loop)

- **Animation:** Transform translateX(0) → translateX(-50%)
- **Duration:** 40s linear infinite
- **On hover:** animation-play-state paused
- **Gradient mask:** Fade in/out at 7% and 93% edges to mask duplication
- **Reduced motion:** Disable animation, flex-wrap wrap, justify-content center, no mask

### Performance Notes

- All animations use `transform` and `opacity` only (GPU-accelerated)
- No animating `width`, `height`, `top`, `left`, `padding`, or other layout-triggering properties
- `will-change: transform` applied to `.marquee-row` for optimization
- No nested transforms that cause reflow
- Animations isolated to single elements where possible

---

## 7. Accessibility & Inclusive Design

### Color Contrast

- **Primary text (ink on white):** #11223B on #FFFFFF = 14.4:1 (AAA)
- **Secondary text (muted on white):** #5C6B82 on #FFFFFF = 6.5:1 (AA)
- **Dark backgrounds (white on navy900):** #FFFFFF on #07172E = 13.5:1 (AAA)
- **All interactive elements:** Minimum 4.5:1 (AA), ideally 7:1 (AAA)

### Focus Management

- **Focus ring:** 2–4px outline in Orange (#E8622A)
- **All interactive elements:** Visible focus state (buttons, links, form inputs)
- **Tab order:** Matches visual order, no unexpected jumps
- **Modal/dialog:** Focus trap, close on Escape

### Form Accessibility

- **Labels:** Always paired with inputs via `<label for>` or wrapping
- **Required fields:** Marked with asterisk + aria-required
- **Error states:** aria-live region announces errors to screen readers
- **Help text:** Persistent below complex inputs, not placeholder-only
- **Input types:** Semantic types (email, tel, number) trigger correct mobile keyboards

### Screen Reader Support

- **Landmark regions:** Proper semantic HTML (`<header>`, `<main>`, `<footer>`, `<nav>`)
- **Heading hierarchy:** H1 → H2 → H3 (no level skips)
- **Alt text:** Meaningful alt text for all images; decorative images use `alt=""`
- **aria-labels:** Icon-only buttons have aria-label
- **aria-live:** Form errors and success states announced
- **Skip link:** "Skip to main content" link for keyboard users

### Responsive & Mobile

- **Touch targets:** Minimum 44×44pt / 48×48dp (iOS/Android standard)
- **Spacing:** 8px+ minimum gap between touch targets
- **Readable font:** 16px minimum body text on mobile (prevents iOS auto-zoom)
- **Viewport:** No `user-scalable=no`; allow pinch-zoom
- **Safe areas:** Respect notch, gesture bar, Dynamic Island on iOS/Android

### Reduced Motion

- **Respects `prefers-reduced-motion: reduce`**
  - Scroll reveals: Remove animation, set `opacity: 1; transform: none`
  - Marquee: Disable animation, unwrap to static grid
  - Button hover: Keep state change, remove translate/shadow transition
  - Page transitions: No slide/fade animations
- **Testing:** Check in system settings or browser dev tools

---

## 8. Anti-Patterns (Banned)

Never use:

- **Emojis as structural icons** — Use vector SVG icons (Lucide, Heroicons) instead
- **Inter font** — Use Archivo for display, Hanken Grotesk for body
- **Generic serif fonts** (Times, Georgia, Garamond, Palatino) — Serif banned in SaaS UI
- **Pure black (#000000)** — Use Navy 900 (#07172E) or Ink (#11223B)
- **Neon outer glows** or purple/blue glow effects — No glow shadows on buttons
- **Oversaturated accent colors** — Orange saturation max 80%, never bright neon
- **Excessive gradient text** on large headers — Use solid color instead
- **Custom mouse cursors** — Trust system defaults
- **Overlapping elements** (text over images, stacked content) — Every element occupies its own space
- **3-equal-column card layouts** (identical cards repeated) — Use asymmetric grid, zig-zag, or single-featured card
- **Generic placeholder names** ("John Doe", "Acme Corp", "Nexus") — Use realistic business names
- **Fake metrics** or invented data — "99.98% UPTIME SLA", "124ms AVG RESPONSE" are AI filler; use real data or clear placeholders like `[metric]`
- **Metric sections with invented data** ("SYSTEM PERFORMANCE", "BY THE NUMBERS") — If real data unavailable, don't create fake dashboards
- **"Scroll to explore", "Swipe down" text, bouncing chevrons** — Content pulls users in naturally, not via filler UI hints
- **Broken image links** — Test all image sources; use `picsum.photos` for realistic placeholders if needed
- **AI copywriting clichés** ("Elevate", "Seamless", "Unleash", "Next-Gen") — Use concrete, benefit-driven language
- **Centered hero sections** (when variance > 4) — Force split-screen, left-aligned, or asymmetric whitespace

---

## 9. Implementation Notes

### Technology Stack

- **HTML/CSS/JS:** Vanilla, no framework (per project scope)
- **Fonts:** Google Fonts API (preconnect to fonts.googleapis.com)
- **Images:** Realistic placeholder slots; use actual photos for production (no stock photo watermarks)
- **Scripts:** Vanilla JavaScript; Intersection Observer for scroll reveal & count-up

### Build & Export

- **Figma:** Design exported to HTML/CSS prototype (current state: `PostalNook Partner.html` in Website/project folder)
- **Stitch:** User runs Google Stitch with provided prompt to generate production-ready HTML
- **Responsive:** Mobile-first CSS; test on 375px (iPhone SE), 768px (iPad), 1024px (desktop), 1440px (ultrawide)

### Deployment

- **No framework required** — Pure HTML/CSS/JS for fast loading
- **CDN for fonts** — Preload critical fonts (Archivo Bold, Hanken Grotesk Regular/Semi Bold)
- **Code splitting:** Optional for heavy interactions (form, marquee)
- **Performance targets:** LCP < 2s, FID < 100ms, CLS < 0.1

---

## 10. Design Tokens & CSS Variables

### Root Variables (defined in `:root`)

```css
--navy-900: #07172E;
--navy-800: #0B2545;
--navy-700: #12305A;
--navy-600: #1C3D6B;
--navy-line: rgba(255,255,255,.10);
--ink: #11223B;
--ink-2: #33445E;
--muted: #5C6B82;
--paper: #F2F4F7;
--paper-2: #E6EAF0;
--card: #FFFFFF;
--line: rgba(17,34,59,.12);
--line-2: rgba(17,34,59,.07);
--orange: #E8622A;
--orange-600: #D2531E;
--orange-100: #FBE7DC;
--orange-050: #FCF1EA;
--steel: #34618F;
--steel-100: #E5ECF3;
--accent: var(--orange);
--accent-600: var(--orange-600);

/* Typography */
--f-display: "Archivo", system-ui, sans-serif;
--f-body: "Hanken Grotesk", system-ui, sans-serif;
--f-mono: "Space Mono", ui-monospace, monospace;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(17,34,59,.05), 0 2px 8px rgba(17,34,59,.05);
--shadow: 0 10px 28px -14px rgba(17,34,59,.18), 0 2px 8px rgba(17,34,59,.05);
--shadow-lg: 0 24px 56px -24px rgba(17,34,59,.22), 0 4px 14px rgba(17,34,59,.06);

/* Spacing & Sizing */
--r: 14px;
--r-sm: 10px;
--r-lg: 22px;
--maxw: 1200px;
```

### Usage

All colors, fonts, shadows, and radii are defined as CSS variables for maintainability. Never hardcode hex values; always use `var(--token-name)`.

---

## 11. QA & Testing Checklist

Before shipping:

- [ ] All text contrast ≥ 4.5:1 (WCAG AA)
- [ ] All interactive elements focusable via keyboard
- [ ] Form validation works on blur (not keystroke)
- [ ] Success state displays after form submit
- [ ] Scroll reveals trigger and animate correctly
- [ ] Count-up numbers animate and stop at target
- [ ] Mobile menu opens/closes smoothly
- [ ] No horizontal scroll on mobile (375–768px)
- [ ] Images load without layout shift (CLS < 0.1)
- [ ] Touch targets ≥ 44×44px
- [ ] Navigation sticky on scroll with smooth transition
- [ ] Dark theme (if supported) maintains contrast and readability
- [ ] Reduced motion respected (prefers-reduced-motion: reduce)
- [ ] All links (internal & external) are accessible
- [ ] Form fields labeled and associated correctly
- [ ] No console errors or warnings
- [ ] Performance budgets met (LCP < 2s, FID < 100ms)

---

## 12. Future Enhancements

Optional additions for future phases:

- Dark mode variant (see color tokens for dark theme structure)
- Territory map visualization (interactive US map showing available cities)
- Testimonials section with rotating carousel
- Detailed franchise breakdown (expandable accordion)
- Video hero (with fallback static image)
- Live chat widget (lower-right corner, orange accent)
- Comparison slider (before/after PostalNook vs. alternatives)
- PDF downloadable franchise kit
- Multi-language support (i18n)

---

**Design System Version:** 1.0  
**Last Updated:** June 2026  
**Status:** Production Ready

For questions or updates, refer to the Figma design file: https://figma.com/design/N5XkqUBkzeq939LVixNjUY/PostalNook-%E2%80%94-Licensing-Opportunities
