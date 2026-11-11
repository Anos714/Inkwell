# Inkwell — The Reading Room

A design system for a personal journal that should feel like a printed field
note, not a dashboard. The landing page is composed as a broadsheet: a
masthead, one full-bleed plate, a contents index, a lead story, and a
colophon. Every element earns its place; nothing is a card for the sake of a
card.

## Principles

1. **Paper first.** Warm parchment is the default surface. Dark mode is the
   same room after sunset, not an inverted UI.
2. **One scene, two treatments.** The opening carries the field as a
   paper-washed backdrop; the plate below is the same idea as a full-colour
   print. Type, rules, and space carry everything else.
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

Display sizes use `clamp()`; the hero runs from `2.9rem` to `8rem`. Body
copy stays between `0.95rem` and `1.125rem` so the page reads like a journal
at every width.

## Layout

- Page gutter: `1.25rem` mobile, `2rem` from `sm`.
- Content width: `86rem` (the broadsheet measure); prose columns cap at
  `68ch` or `max-w-md/lg` for standfirsts.
- Every section's content starts on the same left rule. Full-bleed bands
  (departments band, CTA) may extend past it, but their inner copy stays on the shell.
- The opening is a single editorial column below `1280px` and a
  `1.6fr / .8fr` spread above it; the headline is set to break in two lines
  from `320px` upward.
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
| Hero | `landing/hero.tsx` | Two-line reveal, brass underline draw, paper-washed field backdrop |
| Hero preview | `landing/hero-preview.tsx` | Latest-entry note card and brass sprig in the opening's right margin |
| Departments | `landing/departments.tsx` | Still running head of journal sections, set on the shell |
| Plate | `landing/hero-plate.tsx` | Matted dreamy countryside, parallax, caption and folio |
| Contents | `landing/topics-strip.tsx` | Numbered index of real tags with counts |
| Journal | `landing/recent-posts.tsx` | Lead story spread + hairline contents list |
| Reading room | `landing/reading-room.tsx` | Four rule-separated features, drawn icons, marginalia |
| Voices | `landing/comments-marquee.tsx` | Reader pull-quotes in a slow marquee |
| CTA | `landing/cta.tsx` | Inverted band with rotating letterpress seal |
| Colophon | `landing/site-footer.tsx` | Link columns, socials, giant wordmark |

## The workspace

The admin screens are the back office of the same journal, not a separate
product, so they inherit the shell rather than a dashboard kit.

| Piece | File | Notes |
| --- | --- | --- |
| Frame | `features/blogs/components/admin-pages.tsx` | Ruled masthead, running nav (`masthead-link[data-active]`), display heading on the broadsheet shell |
| Overview | `admin-dashboard.tsx` | Four-cell ledger in hairline rules; no cards or glows |
| Charts | `dashboard-charts.tsx` | EvilCharts-inspired reads bars and edition donut, in brass and paper |
| Entries | `admin-blog-manager.tsx` | Printed index rows — number, title, slug, draft stamp, reads, two quiet actions |
| Editor | `admin-blog-form.tsx` | Underlined fields, square cover well, status switch, pill primary action |
| Delete | `admin-blog-manager.tsx` | Square dialog, red top rule, Escape to close, autofocus on the safe action |

- Primary actions are the only filled controls (`rounded-full`, cream on ink,
  brass on hover). Everything else is a letterpress link with a drawn rule.
- Fields use `.field-line` / `.field-frame`: focus is a brass rule under the
  line, never the global boxed ring.
- The overview keeps the landing page's editorial rhythm: a four-cell ledger
  of reads, likes, comments and engagement, then two ruled figures — reads per
  entry (rounded brass bars, hatched hover/selection from EvilCharts) and the
  edition split (a solid brass donut against a hatched drawer slice).
- Chart axes and value labels use the mono face at 10px; no grids, no boxes.
  Recharts animations are disabled under `prefers-reduced-motion`.
- The workspace boots from the httpOnly refresh cookie via
  `features/auth/store/session-bootstrap.ts`, so bookmarked admin URLs survive
  a hard reload; signed-out visitors go to `/login`.
- An editor can pin one comment per entry from the public thread. The pinned
  note rises above every sort order with a brass `Pinned` stamp; pinning
  another releases the previous one, replies cannot be pinned, and the pin is
  enforced server-side (admin role only).
- The blog page boots the same session on mount, so an editor's pin controls
  and a reader's likes survive a hard reload.

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
  duplicated on `:focus-visible`. Writing-desk fields replace the ring with a
  brass rule (`.field-line` / `.field-frame`) so the page stays unboxed.
- Decorative art is `aria-hidden`; the plate has a descriptive caption and
  `alt`.
- Interactive targets are at least 36px tall on touch; the mobile sheet
  exposes the same routes as the desktop masthead.
- Color pairs target WCAG AA for body text in both themes.

## Assets

- `public/images/field-note.webp` — 1672×941 landscape used as the washed hero backdrop (~255 KB).
- `public/images/dreamy-countryside.webp` — 1672×941 hand-painted orchard plate (~443 KB).
- `public/og-image.png` — social card.
- Paper grain is an inline SVG turbulence layer at 5% opacity, fixed above
  content and pointer-transparent.
