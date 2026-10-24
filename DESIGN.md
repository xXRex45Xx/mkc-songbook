---
name: MKC Choir Songbook
description: The working songbook that travels into the hall — Amharic lyrics, chords, and recordings on the phone the singer carries.
colors:
  vestment-gold: "#FABE1F"
  gold-400: "#FCD46A"
  gold-600: "#EFAF05"
  gold-700: "#CB9505"
  gold-900: "#6B4F03"
  gold-pale: "#FEF9E7"
  sanctuary-crimson: "#C9184A"
  crimson-400: "#EE6E92"
  crimson-600: "#E5255B"
  crimson-700: "#AB143F"
  crimson-900: "#700D29"
  crimson-pale: "#FCE4EC"
  cool-paper: "#FCFDFE"
  slate-ink: "#40444F"
  slate-100: "#E4ECF5"
  slate-200: "#CCDBEB"
  slate-400: "#A2B9D3"
  slate-700: "#6B84A6"
  slate-800: "#5F7392"
  slate-900: "#55637A"
  slate-1000: "#4B5364"
  liturgical-teal: "#15B097"
  teal-300: "#0B7B69"
  teal-pale: "#A4F4E7"
  signal-coral: "#E4626F"
  coral-300: "#8C1823"
  coral-pale: "#ECABB1"
  ochre-200: "#EDA145"
  ochre-300: "#CC7914"
  ochre-pale: "#FFFAEC"
typography:
  display:
    fontFamily: "Inter, Helvetica, Arial, sans-serif"
    fontSize: "clamp(1.125rem, 4vw, 1.875rem)"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "Inter, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "Inter, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, Helvetica, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.02em"
  lyrics:
    fontFamily: "Abyssinica SIL, Noto Sans Ethiopic, Nyala, Kefa, Inter, sans-serif"
    fontSize: "user-controlled"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "4px"
  md: "8px"
  full: "9999px"
spacing:
  xs: "10px"
  sm: "20px"
  md: "28px"
  lg: "40px"
  xl: "80px"
components:
  button-primary:
    backgroundColor: "{colors.sanctuary-crimson}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 28px"
  button-primary-hover:
    backgroundColor: "{colors.crimson-600}"
    textColor: "#FFFFFF"
  button-outline-crimson:
    backgroundColor: "transparent"
    textColor: "{colors.sanctuary-crimson}"
    rounded: "{rounded.md}"
    padding: "10px 28px"
  button-light:
    backgroundColor: "transparent"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-destructive:
    backgroundColor: "{colors.coral-pale}"
    textColor: "{colors.coral-300}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-icon-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.md}"
    padding: "0"
  card-surface:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.md}"
    padding: "20px"
  input-field:
    backgroundColor: "{colors.cool-paper}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  nav-link-active:
    backgroundColor: "transparent"
    textColor: "{colors.sanctuary-crimson}"
    padding: "8px 0"
---

# Design System: MKC Choir Songbook

## Overview

**Creative North Star: "The Songbook That Travels"**

The system behaves like the object it replaces: a working song binder carried into rehearsal and into a dim church hall. Surfaces are paper-cool and quiet so that Amharic lyrics read at a glance while a singer is standing, sight-reading, and holding a phone. Decoration is not the point; the point is that the right song's words, chords, and audio reach the right person in time. Color is used as a signal, not as atmosphere — gold marks what is active and selected, crimson carries the brand voice and the primary action, and the cool slate ramp does nearly all the structural work.

Density follows the page's job. Lists and tables run tight and scannable because the songleader is scanning 1,016 songs; lyrics run generous because the singer is reading while singing. The same surface must survive a phone in a dark hall, a projector, and a desktop used for data entry, so the system keeps one control language across all three and lets the font-size control, not a redesign, carry the difference.

**Key Characteristics:**
- Paper-cool surfaces (`#FCFDFE`) with a cool blue-gray neutral ramp doing the structural work.
- Two liturgical accents only: Vestment Gold for state, Sanctuary Crimson for brand and primary action.
- Inter for interface, an Ethiopic-first stack for lyrics; Amharic glyphs are the priority at every size.
- Flat by default; shadow appears only when a state changes.
- The gradient strip (crimson → gold) is the system's one signature gesture, reserved for the audio player and its progress.

## Colors

The palette is a liturgical pair — Vestment Gold and Sanctuary Crimson — resting on a cool blue-gray neutral ramp, with teal, ochre, and coral as fixed semantic states.

### Primary
- **Vestment Gold** (`#FABE1F`): the state color. It marks the active, the selected, the saved, and the local badge; it is the manifest theme color and the logo's own fill. Its deep steps (`#CB9505`, `#6B4F03`) are for text on gold, never gold text on white.
- **Sanctuary Crimson** (`#C9184A`): the brand voice and the primary action. It fills the search submit, the selected date, the active nav link, and the play/pause glyph. `#AB143F` is the pressed state.

### Secondary
- **Liturgical Teal** (`#15B097`): the offline-saved and success signal. It says audio is on the device. Deep `#0B7B69` carries text; pale `#A4F4E7` carries the tinted chip.

### Tertiary
- **Ochre** (`#EDA145` / `#CC7914`): warning and pending-sync states. Pale `#FFFAEC` is the tinted surface.

### Neutral
- **Cool Paper** (`#FCFDFE`): the page background and the input field fill. It is the paper the whole system is printed on.
- **Slate Ink** (`#40444F`): all primary text. Not black — the system never uses pure black on text.
- **Slate 100–200** (`#E4ECF5`, `#CCDBEB`): field fills, hairline borders, and the quiet structure of tables.
- **Slate 400–800** (`#A2B9D3`, `#6B84A6`, `#5F7392`): secondary text, inactive nav links, borders on secondary buttons, and metadata lines under titles.
- **Slate 900–1000** (`#55637A`, `#4B5364`): hover text on dark-adjacent controls; the deepest structural step.
- **Signal Coral** (`#E4626F` / `#8C1823`): destructive and error states. Pale `#ECABB1` is the destructive button fill; `#8C1823` is its text.

### Named Rules
**The Two-Accent Rule.** Gold and crimson are the only expressive colors in the system. Teal, ochre, and coral are semantic state codes with fixed meanings — a new hue is a defect, not a design choice.

**The Rarity Rule.** Gold is a marker, not a surface. On any screen, gold appears on the small number of things that are currently active. A wall of gold is a failure of hierarchy.

**The Cool Neutral Rule.** Neutrals run cool blue-gray, never warm gray. Text, borders, and metadata all come from the slate ramp; warm grays break the paper illusion.

## Typography

**Display Font:** Inter (with Helvetica, Arial fallback)
**Body Font:** Inter (with Helvetica, Arial fallback)
**Lyrics Font:** Ethiopic-first stack — Abyssinica SIL, Noto Sans Ethiopic, Nyala, Kefa, then Inter

**Character:** Inter is the interface voice: neutral, dense, and legible at small sizes on a phone. The Ethiopic-first stack is the content voice, and it is the one that matters — Ge'ez glyphs must render cleanly at every size, in a dim hall, before any Latin fallback is consulted. The pairing is deliberately plain: the type is a reading tool, not a personality.

### Hierarchy
- **Display** (700, `clamp(1.125rem, 4vw, 1.875rem)`, 1.2): page titles (`Songs`, `Albums`) and the brand wordmark at `text-2xl`. Bold, tight, left-aligned.
- **Headline** (600, `1rem`, 1.2): card titles — album names, playlist names, song titles in the lyric header.
- **Body** (400, `1rem`, 1.5): general reading; lyrics at the user's chosen size.
- **Label** (700, `0.75rem`, uppercase, `0.02em`): table headers, badges, and status chips. The system's only uppercase voice.
- **Metadata** (400–600, `0.75rem–0.875rem`, 1.2, slate 700–800): year + song count, album names under a title, timestamps. Always subordinate to its headline.

### Named Rules
**The Amharic-First Rule.** Any rule that sets lyrics must declare the Ethiopic stack before Latin fallbacks, and must survive a font-size change without breaking line breaks. Lyrics are content, not UI text.

**The Reader Size Rule.** Lyrics font size is a user-controlled product requirement, not a preference toggle. Every lyrics surface must scale with it and stay readable at the largest setting.

**The Subordination Rule.** Metadata is always smaller, lighter, and cooler than the title it describes. A row where title and metadata read at the same weight is a scan failure.

## Layout

The page is a single column with a fixed header stack: brand row, nav row, then a collapsible search row that animates open. Below that, `MainBodyContainer` owns the content area — `p-5` on mobile, `p-10` at `md`, `py-10 px-20` at `lg` — as a flex column with gap `2.5` / `5` / `7` (`10px` / `20px` / `28px`) at the same breakpoints. A page title sits at the top of that column with its helper controls (sort, admin tools) right-aligned on the same line.

Content is either a card grid (albums, playlists) or a table (songs, users). The audio player is a permanent bottom bar: a `1px` gradient strip over a paper-colored panel, progress slider, title + album metadata, transport controls, and a toolbox.

`md` (`768px`) is the real mobile/desktop boundary — the app reads `windowWidth >= 768` in JavaScript to drop columns, so `md` is the breakpoint that matters, not `sm`. Below `md`, tables shed their album column, the player shrinks its transport glyphs, and the nav collapses. The layout is portrait-first: the manifest declares `orientation: portrait` and the primary usage scene is a phone in hand.

Spacing rhythm is the Tailwind scale, used as `10 / 20 / 28 / 40 / 80`. Nothing is centered; content is left-aligned and starts at the container edge.

## Elevation & Depth

The system is flat by default. Depth is a response to state, not a property of a surface: cards sit flat with a hairline border and gain `shadow-md` only on hover, over a `300ms` transition. The table container carries one soft shadow; the logo image carries `shadow-xl` as the single decorative exception. The player bar reads as elevated because it is separated by a gradient strip, not by a shadow.

### Shadow Vocabulary
- **Hover lift** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)`): card hover only. Paired with a `border` that stays put.
- **Container shadow** (Flowbite table shadow): the table wrapper only.
- **Brand lift** (`box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1)`): the header logo only. Never reused.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. A shadow means something is interactive, focused, or lifted by state. A shadow that is always on is decoration, and decoration is not the job.

**The Hairline Rule.** Borders do the structural work. `1px` slate-200/400 lines separate rows, cards, and fields; they are the depth system.

## Shapes

Gently curved edges, two steps only: `4px` for badges and small chips, `8px` (`rounded-lg`) for cards, buttons, inputs, and the search cluster. Avatars are fully round (`9999px`). No clipping, no diagonal cuts, no custom silhouettes.

The recurring geometry is the rounded rectangle plus the underline: active nav links get a `2px` crimson bottom border, inactive links get none. The gradient strip (`from-secondary to-primary`, crimson → gold) is the system's only linear ornament, and it appears exactly twice — the player's top edge and the progress fill. Buttons are Flowbite defaults with `focus:ring-0` applied almost everywhere: focus is shown by the control's own state, not by a ring.

## Components

Buttons read as tools: rectangular, crimson-forward, and quick to hit on a phone.

### Buttons
- **Shape:** gently curved, `8px` (`rounded-lg`).
- **Primary:** crimson fill (`#C9184A`), white text, `10px 28px` padding, `font-semibold`, hover to `#E5255B`. Used for the search submit, the selected date, and confirm actions.
- **Outline:** transparent fill, `1px` crimson border, crimson text, same padding. The secondary affirmative action.
- **Light:** transparent fill, `1px` slate-400 border, slate-ink text. Card-level secondary actions (Edit).
- **Destructive:** coral-pale fill (`#ECABB1`) with coral-300 text (`#8C1823`), or Flowbite `color="failure"` for modals. Delete is never crimson.
- **Ghost icon button:** `p-0`, no border, `focus:ring-0`, icon-only. The transport controls, back button, and search toggle. Icon fills shift on hover/active (`fill-secondary-600` → `fill-secondary-700`).
- **Group:** adjacent buttons in the player share a group with `rounded-r-none` / `rounded-none` / `rounded-l-none`, so the transport cluster reads as one instrument.

### Chips & Badges
- **Style:** `4px` radius, `8px` padding, `text-xs`, white on gold for the Local/Synced badge.
- **State:** tinted semantic fills — `success-100` + `success-300` for saved, `warning-100` + `warning-300` for pending. Hover applies `brightness-95`, not a new color.

### Cards / Containers
- **Corner Style:** `8px` (`rounded-lg`).
- **Background:** white on the paper page; dark-mode variant `gray-800` under media-based dark.
- **Shadow Strategy:** flat at rest, `shadow-md` on hover, `300ms` transition.
- **Border:** `1px` `gray-200` for standard cards; `1px` gold for the favorites card — the gold border is the favorites identity.
- **Internal padding:** `20px`, with a `16px` gap between cover, title, and metadata.

### Inputs / Fields
- **Style:** paper fill (`#FCFDFE`), slate-ink text, `8px` radius, `10px 20px` padding, `border-none` with `focus:ring-0` on selects.
- **Search cluster:** select + input + crimson submit as one unit, `rounded-l-lg` on the select, `rounded-e-lg` on the submit, hairline vertical borders removed between them.
- **Focus:** border color shift to crimson-600 on the submit; no ring.
- **Range slider:** custom track with the crimson → gold gradient fill under a gold thumb (`#FABE1F`).

### Navigation
- **Style:** Flowbite navbar, `px-5 / md:px-10 / lg:px-16`, brand row then links row.
- **Typography:** `font-semibold`, `text-sm` mobile → `text-lg` desktop.
- **Active:** crimson text with a `2px` crimson bottom border. **Inactive:** slate-700, hover to slate-ink, no border.
- **Mobile:** links collapse into a `max-w-[400px]` panel; the search row animates open under the navbar.

### Signature Component: Audio Player Bar
A `1px` full-width gradient strip (`from-secondary to-primary`) sits above a paper panel: the progress slider (gradient fill, gold thumb), then title + album metadata on the left, transport cluster in the middle, toolbox on the right. On mobile the transport shrinks to `1.875rem` glyphs and prev/next hide. The gradient strip is the player's identity — nothing else in the app may use it.

### Signature Component: Song Row
A table row that is also a drag handle and a navigation target: song number, title, album names (desktop only), then right-aligned tools. Dragged rows scale `105%`; drop zones are `0.5` height at rest and `10` height when hovered. The row is the unit of the working songbook — it must read at a glance and survive a thumb.

## Do's and Don'ts

### Do:
- **Do** keep the page background at Cool Paper (`#FCFDFE`) and text at Slate Ink (`#40444F`) — the paper illusion is the system's base.
- **Do** use gold only for state: active, selected, saved, local. Keep it under 10% of any screen.
- **Do** declare the Ethiopic stack first on any lyrics surface, then Latin fallbacks.
- **Do** keep `md` (768px) as the mobile/desktop boundary, matching the `windowWidth >= 768` logic in JS.
- **Do** show focus through the control's own state (`focus:ring-0` is the house convention), and keep tap targets at the phone-legible sizes the player uses.
- **Do** reserve the crimson → gold gradient for the player bar and its progress fill.
- **Do** use the slate ramp for every structural line: `slate-200` for hairlines, `slate-400` for secondary buttons, `slate-700/800` for metadata.

### Don't:
- **Don't** introduce a new hue. Teal, ochre, and coral are semantic state codes with fixed meanings; a fourth accent breaks the Two-Accent Rule.
- **Don't** use pure black (`#000000`) for text or surfaces.
- **Don't** put gold text on white, or white text on gold-400/gold-500 — use the deep gold steps (`#CB9505`, `#6B4F03`) for text on gold.
- **Don't** add permanent shadows to cards, panels, or the player.
- **Don't** center page titles, lyrics, or table content. The system is left-aligned.
- **Don't** use warm grays, `gray-500`-family text, or Tailwind's default palette for structure — the neutral ramp is the slate family.
- **Don't** apply the gradient strip to buttons, cards, headers, or text.
- **Don't** ship a lyrics surface whose font size is fixed; the font-size control is a product requirement.
