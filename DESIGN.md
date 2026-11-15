---
name: Ahmad Bhanvadiya
description: A typeset index of real work, set on warm paper with one ultramarine voice.
colors:
  paper: "#f5f3ee"
  surface: "#ece9e2"
  ink: "#161513"
  graphite: "#67645d"
  hairline: "#e0dcd3"
  hairline-strong: "#cdc8bd"
  accent: "#2c3ec9"
  accent-ink: "#ffffff"
  selection: "#d8ddf8"
  paper-dark: "#121210"
  surface-dark: "#1b1a18"
  ink-dark: "#edebe5"
  graphite-dark: "#9b978e"
  hairline-dark: "#2a2926"
  hairline-strong-dark: "#3a3834"
  accent-dark: "#7f93ff"
  accent-ink-dark: "#121210"
  selection-dark: "#262f6b"
typography:
  display:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 7.4vw, 5.75rem)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.04em"
    fontFeature: "\"ss01\", \"cv11\""
  headline:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.625rem, 3vw, 2.25rem)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  lead:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 2.6vw, 2rem)"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body-large:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  title:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.625
rounded:
  plate: "4px"
  monogram: "3px"
  focus: "2px"
  dot: "9999px"
spacing:
  gutter-mobile: "20px"
  gutter-tablet: "32px"
  gutter-desktop: "40px"
  column-gap: "40px"
  row-pad: "32px"
  section-top: "24px"
  section-bottom: "128px"
  container: "1200px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.plate}"
    height: "44px"
    padding: "0 16px 0 20px"
    typography: "{typography.title}"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.graphite}"
    rounded: "{rounded.plate}"
    height: "36px"
    padding: "0 14px"
    typography: "{typography.label}"
  button-outline-hover:
    textColor: "{colors.ink}"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.graphite}"
    rounded: "{rounded.plate}"
    size: "36px"
  button-icon-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  preview-plate:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.plate}"
  monogram:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.monogram}"
    size: "28px"
  nav-link:
    textColor: "{colors.graphite}"
  nav-link-active:
    textColor: "{colors.ink}"
---

# Design System: Ahmad Bhanvadiya

## Overview

**Creative North Star: "The Specimen Sheet"**

The site reads like a well-set type specimen. It has one grotesk at a few chosen sizes, a quiet mono for facts, and 1px hairlines for structure. Warm off-white paper and near-black ink carry nearly everything. A two-tone display sentence opens the page: the name is set in ink, the intent in graphite. After that the page becomes an index of real work, and the work leads while the chrome recedes.

Density is low and the rhythm is editorial. Sections share one frame: a hairline rule, a small title in a sticky left column, and content on the right. Depth comes almost entirely from tone and rules, not from lift. The only exception is the preview frame, which floats a little so the screenshots read as objects. Motion is short, eased hard on an expo-out curve, and always functional: entrances, reveals, a wipe between previews, and underlines that draw in.

The system rejects gradients, neon glow, glassmorphism, large rounded cards, skill-badge walls, floating decoration and invented statistics (owner's binding brief, PRODUCT.md).

**Key Characteristics:**
- Warm paper and ink, with graphite doing every secondary job.
- One ultramarine accent, reserved for state.
- A single grotesk at deliberate sizes with tight negative tracking at display scale; mono at 12-13px for metadata.
- 1px hairline rules instead of boxes; a 4px radius on the few framed objects.
- A shared 12-column section frame inside a 1200px container.
- Expo-out motion, with fully static fallbacks under reduced motion.

## Colors

A near-monochrome warm palette, with a single cool ultramarine that only appears when something is live, active or being touched.

### Primary
- **Ultramarine Signal** (light `accent`, dark `accent-dark`): the system's only colour. It is used for the availability dot, the active-nav dot, the focus outline, the selection tint (`selection`), the underline of the chosen skill, the mailto link's hover colour, the hover colour of the Contact row arrows, and the Copied check. One hue (about 232 degrees) in both themes: `#2c3ec9` on paper (7.2:1), `#7f93ff` on charcoal (6.7:1). Dark is the default theme. Text on an accent fill uses `accent-ink`.

### Neutral
- **Warm Paper** (`paper` / `paper-dark`): page background, nav bar background, and the text colour on ink fills.
- **Bone Surface** (`surface` / `surface-dark`): the fill behind preview plates and the hover wash on the theme toggle. It is one tonal step off paper.
- **Ink** (`ink` / `ink-dark`): primary text, project names, the primary button fill and the monogram tile.
- **Graphite** (`graphite` / `graphite-dark`): all secondary text, including the second clause of the display sentence, descriptions, asides, mono metadata and inactive nav. Graphite is also the dim state for non-active Work rows.
- **Hairline** (`hairline` / `hairline-dark`): every structural rule, including section tops, row dividers, the nav underline after scroll, and preview borders.
- **Hairline Strong** (`hairline-strong` / `hairline-strong-dark`): the outline button stroke and the scrollbar thumb.

Dark mode keeps the same roles on warm charcoal. It applies under `prefers-color-scheme: dark` unless `data-theme="light"` is set, and it can be forced with `data-theme="dark"`. The choice persists in `localStorage.theme`.

### Named Rules
**The State-Only Accent Rule.** Ultramarine marks state (available, active, focused, selected, hovered, confirmed) and nothing else. It never fills a section, colours a heading at rest, or decorates.

**The Graphite Second Voice Rule.** Hierarchy comes from ink versus graphite, not from more colours. If something needs to recede, it turns graphite.

## Typography

**Display / Body Font:** Schibsted Grotesk (with ui-sans-serif, system-ui), stylistic sets `ss01` and `cv11` on globally.
**Label/Mono Font:** Geist Mono (with ui-monospace, SFMono-Regular).

**Character:** A single confident grotesk handles both headline and body work. Weight 500 and tight tracking carry the display sizes. A small, neutral mono sets every technical fact apart from the prose.

### Hierarchy
- **Display** (500, clamp(2.5rem, 7.4vw, 5.75rem), 0.98, -0.04em): the hero sentence (max 15ch) and the Contact headline (clamp(2.5rem, 6.6vw, 5.25rem), max 14ch). The type is two-tone where it carries name and intent.
- **Headline** (500, clamp(1.625rem, 3vw, 2.25rem), 1.05, -0.035em): Work row project names, set nowrap.
- **Lead** (400, clamp(1.375rem, 2.6vw, 2rem), 1.3, -0.02em): the opening About paragraph, max 44rem.
- **Body Large** (400, 1.0625rem on mobile and 1.25rem from sm up, 1.55): hero and contact descriptions in graphite, 46-52ch.
- **Body** (400, 15-17px, relaxed 1.625): row descriptions (max 54ch) and About paragraphs.
- **Title** (500, 15px, -0.01em): section titles in the left column, the nav name and button labels. Section asides sit below at 14px in graphite.
- **Label** (400 mono, 12-13px): category, stack lists (slash-separated), fact terms, link metadata, preview captions and the 01 / 05 counter.

### Named Rules
**The Mono-Is-Fact Rule.** Mono is set only on checkable facts: stacks, categories, handles, link names and counters. It is never used for prose or headings.

**The Balanced Wrap Rule.** h1 through h3 use `text-wrap: balance` and paragraphs use `text-wrap: pretty`. Line measure is capped in ch on every reading block.

## Layout

All content sits inside a centred 1200px container with side gutters of 20px (mobile), 32px (sm, 640px) and 40px (lg, 1024px). The fixed nav is 56px tall, and in-page anchors use a 4.5rem scroll padding.

Every content section uses the **Section frame**, a 12-column grid at lg with a 40px column gap. The title and aside take 3 columns and stick at 96px from the top. Content takes 9 columns. Each section opens with a hairline top border, 24px of top padding and 96px of bottom padding (128px from sm up). Below lg the frame stacks with a 40px row gap.

The Work index splits its 9 columns into 5 for the list and 4 for the sticky preview. Rows are separated by hairlines and padded 28-32px vertically. On tablet (sm to lg) each row becomes a 2fr / 3fr grid with a side thumbnail. On mobile the preview sits full width above the text, and plates without a screenshot are hidden. Skills run as 2, then 3, then 5 columns, each under a mono group label with a hairline beneath. The hero fills `100svh`, its statement is vertically centred, and a hairline meta row is pinned at the bottom.

## Elevation & Depth

The system is flat by default. Depth comes from tonal steps (paper to surface) and hairlines. Exactly one shadow exists, and only the sticky Work preview frame uses it, so screenshots read as physical plates.

### Shadow Vocabulary
- **Plate lift, light** (`box-shadow: 0 1px 2px rgb(22 21 19 / 0.04), 0 12px 32px -12px rgb(22 21 19 / 0.18)`): sticky preview frame only.
- **Plate lift, dark** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.3), 0 16px 40px -16px rgb(0 0 0 / 0.6)`): the same role in dark mode.

### Named Rules
**The One Lifted Object Rule.** Only the preview frame casts a shadow. Everything else separates by a hairline or a tone step.

## Shapes

The form language is rectilinear and quiet. Framed objects (preview plates, buttons, the theme toggle) use a barely-there 4px radius. The monogram tile uses 3px and the focus outline 2px. Circles appear only as state dots: 8px for availability, 4px for active nav, 6px in the mobile menu. Structure is drawn with 1px hairlines. The system has no cards, pills or containers with heavy borders. Icons are 16px-grid SVG strokes at 1.4 weight with round caps.

## Components

### Buttons
- **Shape:** gently squared (4px).
- **Primary:** an ink fill with paper text, 44px tall, padded 20px on the left and 16px on the right, set at 15px weight 500, with a trailing arrow icon. On hover (fine pointers only) the fill steps a shade toward the ground (`--cta-hover`), the arrow nudges 2px in its direction of travel, and the button presses to 0.97 scale (160ms, `--ease-out`).
- **Outline (Copy email):** transparent, with a 1px hairline-strong border, 44px tall, mono 12px in graphite. On hover the border and text turn ink. "Copy email" and "Copied" crossfade in place over 150ms with a 2px blur and 0.95 scale; the confirmed state holds for 1.8s with the check in accent.
- **Icon (theme toggle):** a 36px square in graphite. On hover it gets a surface wash and ink text. The sun and moon cross-fade with a 90-degree rotation.

### Links
- **Draw-in link (`.link`):** no underline at rest. A 1px currentColor underline grows from the left over 0.45s on hover or focus. It is used for mono metadata links and project Code / Live links.
- **Present link (`.link-strong`):** rests on a hairline-strong underline; on hover an ink line draws over it from the left (200ms) and leaves to the right (120ms). It is used for "Get in touch" and the email address, which also turns accent on hover.

### Navigation
A fixed 56px paper bar. It gains a hairline bottom border once the page scrolls past 8px. The left side carries the AB monogram tile (ink, mono 11px), which tilts -6 degrees on hover, followed by the name. Links are set at 14px in graphite. The active link turns ink and shows a 4px accent dot to its left, tracked by an IntersectionObserver on the middle band of the viewport. Below 768px a "Menu" text button opens a full-height paper sheet. The sheet lists the links at 2rem weight 500 between hairlines, followed by a mono link row.

### Section Frame (signature)
A hairline top rule with a sticky title column (Title 15px plus a 14px graphite aside) beside 9 columns of content. Every section except the hero and Contact uses it.

### Work Row (signature)
A hairline-topped list item holding the project name (Headline), a mono category, a graphite description, a slash-separated mono stack, and Code / Live draw-in links. Hovering or focusing a row makes it active. While the pointer is over the list at lg, inactive names dim to graphite and the active name shifts 6px right over 500ms.

### Preview Plate (signature)
A 16:10 frame with a surface fill, a 1px hairline border and a 4px radius, showing a real screenshot cropped from the top. Where no screenshot exists it shows a typeset plate instead: mono category and stack, the project name in large type, and a graphite note. At lg one sticky plate holds every preview. The incoming preview wipes up over the outgoing one with `clip-path: inset(100% 0 0 0)` to `inset(0)` over 700ms expo-out, while the outgoing preview stays still beneath it. A mono caption sits below with the name and a zero-padded counter.

### Motion
- **Hero entrance (`.enter`):** each element rises 0.35em and resolves from a 6px blur at full opacity over 1s expo-out. Elements are staggered at 90ms times the index plus 80ms. The mobile menu items use the same entrance.
- **Row reveal (`[data-reveal]`):** rows rise 14px while fading in over 0.8s, staggered 70ms. The effect only applies when JS has set the `.js` class, so content is visible without JS.
- **Reduced motion:** all animation and transition durations collapse to 0.01ms with no delays, smooth scroll is disabled, and reveal elements are forced visible.

## Do's and Don'ts

### Do:
- **Do** use ultramarine only for state: availability, active, focus, selection, hover and confirmation.
- **Do** separate content with 1px hairlines and paper/surface tone steps rather than boxes.
- **Do** put new sections inside the shared Section frame (3 + 9 columns at lg, hairline top, sticky title).
- **Do** set technical facts in Geist Mono at 12-13px in graphite, and use slashes or commas between stack items.
- **Do** keep framed objects at a 4px radius and limit the shadow to the preview frame.
- **Do** use the expo-out curve (cubic-bezier(0.16, 1, 0.3, 1)) for motion, and give every effect a static reduced-motion fallback.
- **Do** show real screenshots in preview plates, or a typeset plate when none exists.

### Don't:
- **Don't** use gradients, neon glow, glassmorphism, large rounded cards or floating decoration.
- **Don't** add a second accent or tint a heading with ultramarine at rest.
- **Don't** build skill-badge walls or chip grids; skills are plain lists under mono labels.
- **Don't** add shadows to rows, buttons or sections.
- **Don't** fabricate screenshots, metrics or statistics in any component.
