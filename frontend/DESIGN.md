# Inkwell — The Reading Room

A design system for a personal journal that should feel like a printed field
note, not a dashboard. The landing page is composed as a broadsheet: a
masthead, one full-bleed plate, a contents index, a lead story, and a
colophon. Every element earns its place; nothing is a card for the sake of a
card.

## Principles

1. **Paper first.** Warm parchment is the default surface. Dark mode is the
   same room after sunset, not an inverted UI.
2. **One piece of art.** The landscape plate is the only image on the landing
   page. Type, rules, and space carry the rest.
3. **Read, don't scan.** Measure, leading, and hierarchy are tuned for long
   prose. Labels are small, tracked, and monospaced; headlines are large,
   serif, and tightly leaded.
4. **Rules, not boxes.** Sections are separated by hairlines and numbering,
   not by rounded containers and drop shadows.
5. **Motion is punctuation.** Reveals are slow and singular. Nothing loops in
   the reader's eyeline, and every animation collapses under
   `prefers-reduced-motion`.

## Palette

Tokens live in `src/styles/globals.css`. Components use the semantic
`inkwell-*` utilities so both themes stay in step.

| Token | Light (default) | Dark | Use |
| --- | --- | --- | --- |
| `--base` | `#f2ecdd` parchment | `#0d110d` night ink | page |
| `--surface` | `#faf5e9` | `#131913` | raised paper |
| `--surface-2` | `#eae2d1` | `#1a2118` | wells, plate mat |
| `--text` | `#21261e` ink | `#f0e8d6` cream | body & display |
| `--text-muted` | `#5b6152` | `#b3b2a1` | secondary prose |
| `--text-dim` | `#8a8b77` | `#85867a` | folios, metadata |
| `--accent` | `#4c6b4a` fern | `#a9c7a1` sage | interactive accent |
| `--gold` / brass | `#9a7234` | `#c9a86c` | rules, italics, seals |
| `--rule` | ink @ 14% | cream @ 14% | hairlines |
| `--inverse-bg` | `#1e241d` | `#e9e1cf` | CTA band |

The brass and fern hues are sampled from the landscape plate
(`public/images/field-note.webp`); the sky wash in the hero comes from the
same source.

## Typography

Loaded in `index.html`.

| Role | Family | Treatment |
| --- | --- | --- |
| Display | Cormorant Garamond | 500 weight, `line-height: .94`, tracking `-.028em`; italic for emphasis |
| Reading | Newsreader | 400/500, `line-height: 1.75–2`, max ~68ch |
| UI | Outfit | 400–600, small sizes, no tracking |
| Labels | DM Mono | 9–10px, uppercase, tracking `.16–.26em` |

Display sizes use `clamp()`; the hero runs from `3.5rem` to `8.75rem`. Body
copy stays between `0.95rem` and `1.125rem` so the page reads like a journal
at every width.

## Layout

- Page gutter: `1.25rem` mobile, `2rem` from `sm`.
- Content width: `86rem` (the broadsheet measure); prose columns cap at
  `68ch` or `max-w-md/lg` for standfirsts.
- Sticky masthead is `4.5rem` tall; `section[id]` carries a `6rem` scroll
  margin so anchor links land below it.
- Sections alternate between open parchment and a barely-tinted
  `bg-inkwell-900/45` band; the CTA is a full inverted band.
- The footer is a masthead grid plus a giant cropped wordmark pressed into
  the bottom edge.

## Components

| Piece | File | Notes |
| --- | --- | --- |
| Masthead | `components/site-header.tsx` | Sticky, hairline base, numbered mobile sheet, theme toggle, account menu |
| Hero | `landing/hero.tsx` | Staggered line reveal, brass underline draw, ruled-paper wash |
| Ticker | `landing/ticker.tsx` | Slow, reversed category marquee; pauses on hover |
| Plate | `landing/hero-plate.tsx` | Matted landscape, parallax, caption and folio |
| Contents | `landing/topics-strip.tsx` | Numbered index of real tags with counts |
| Journal | `landing/recent-posts.tsx` | Lead story spread + hairline contents list |
| Reading room | `landing/reading-room.tsx` | Four rule-separated features, drawn icons, marginalia |
| Voices | `landing/comments-marquee.tsx` | Reader pull-quotes in a slow marquee |
| CTA | `landing/cta.tsx` | Inverted band with rotating letterpress seal |
| Colophon | `landing/site-footer.tsx` | Link columns, socials, giant wordmark |

## Motion

- Easing: `cubic-bezier(.22, 1, .36, 1)`; durations `180–500ms` for UI,
  `650–1050ms` for editorial reveals.
- Hero lines rise from an overflow-hidden mask with staggered delays; the
  underline path draws once.
- In-view reveals fire once (`viewport={{ once: true }}`) at `amount: .25–.4`.
- Marquees and the seal rotate/translate slowly; both are decorative and
  `aria-hidden`.
- All animation is disabled by the reduced-motion guard in `globals.css`.

## Accessibility

- Semantic landmarks: one `h1`, section `h2`s, `article`/`figure` for
  editorial units.
- Focus uses a visible accent ring with a 2px offset; hover-only effects are
  duplicated on `:focus-visible`.
- Decorative art is `aria-hidden`; the plate has a descriptive caption and
  `alt`.
- Interactive targets are at least 36px tall on touch; the mobile sheet
  exposes the same routes as the desktop masthead.
- Color pairs target WCAG AA for body text in both themes.

## Assets

- `public/images/field-note.webp` — 1672×941 landscape plate (~255 KB).
- `public/og-image.png` — social card.
- Paper grain is an inline SVG turbulence layer at 5% opacity, fixed above
  content and pointer-transparent.
