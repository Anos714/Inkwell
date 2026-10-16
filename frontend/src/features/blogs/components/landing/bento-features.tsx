import { motion, useReducedMotion } from 'motion/react'
import { useCallback } from 'react'

/* ── Living micro-visuals (all decorative, all reduced-motion safe) ─────────── */

function DocMock() {
  const reduce = useReducedMotion()
  const lines = [
    'w-[72%]',
    'w-[94%]',
    'w-[86%]',
    'w-[48%]',
  ]
  return (
    <div aria-hidden="true" className="relative mt-auto w-full overflow-hidden rounded-2xl border border-inkwell-cream/10 bg-inkwell-950/60 p-4">
      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-inkwell-gold/50" />
        <span className="size-2 rounded-full bg-inkwell-cream/20" />
        <span className="size-2 rounded-full bg-inkwell-cream/20" />
      </div>
      <div className="mt-3 space-y-2">
        {lines.map((width, i) => (
          <motion.div
            key={i}
            initial={reduce ? { opacity: 1 } : { scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={`h-2 origin-left rounded-full bg-inkwell-cream/15 ${width}`}
          />
        ))}
        <div className="flex items-center gap-2 pt-1">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="h-4 w-px bg-inkwell-gold"
            animate={reduce ? undefined : { opacity: [1, 0.15, 1] }}
            transition={{ duration: 1.1, delay: 1.1, repeat: reduce ? 0 : Infinity, ease: 'easeInOut' }}
          />
          <span className="font-mono text-[9px] uppercase tracking-[.2em] text-inkwell-gold/80">
            writing…
          </span>
        </div>
      </div>
    </div>
  )
}

function BarsMock() {
  const reduce = useReducedMotion()
  const bars = [34, 58, 44, 72, 52, 88, 66]
  return (
    <div aria-hidden="true" className="mt-auto flex h-20 items-end gap-1.5">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          initial={reduce ? { height: `${height}%` } : { height: '8%' }}
          whileInView={{ height: `${height}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 rounded-t-md bg-gradient-to-t from-inkwell-gold/20 to-inkwell-gold/80"
        />
      ))}
    </div>
  )
}

function HeartbeatMock() {
  const reduce = useReducedMotion()
  return (
    <div aria-hidden="true" className="relative mt-auto grid place-items-center py-2">
      <motion.svg
        viewBox="0 0 48 48"
        className="size-14 text-inkwell-gold"
        fill="currentColor"
        animate={reduce ? undefined : { scale: [1, 1.18, 1, 1.12, 1] }}
        transition={{ duration: 1.6, repeat: reduce ? 0 : Infinity, ease: 'easeInOut' }}
      >
        <path d="M24 40s-14-8.5-14-19a8 8 0 0 1 14-5.5A8 8 0 0 1 38 21c0 10.5-14 19-14 19Z" />
      </motion.svg>
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="absolute size-14 rounded-full border border-inkwell-gold/40"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={reduce ? { opacity: 0 } : { opacity: [0, 0.7, 0], scale: [0.7, 1.5] }}
          transition={{ duration: 1.6, delay: i * 0.8, repeat: reduce ? 0 : Infinity, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

function TypingMock() {
  const reduce = useReducedMotion()
  return (
    <div aria-hidden="true" className="mt-auto flex items-center gap-3 rounded-2xl border border-inkwell-cream/10 bg-inkwell-950/60 px-4 py-3">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-inkwell-gold/20 font-mono text-[8px] text-inkwell-gold">
        R
      </span>
      <span className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1.5 rounded-full bg-inkwell-cream/60"
            animate={reduce ? undefined : { y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.9, delay: i * 0.15, repeat: reduce ? 0 : Infinity, ease: 'easeInOut' }}
          />
        ))}
      </span>
      <span className="ml-auto font-mono text-[9px] uppercase tracking-[.2em] text-inkwell-dim">
        replying…
      </span>
    </div>
  )
}

function PulseMock() {
  const reduce = useReducedMotion()
  return (
    <div aria-hidden="true" className="relative mt-auto grid place-items-center py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute size-16 rounded-full border border-inkwell-gold/40"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={reduce ? { opacity: 0 } : { opacity: [0, 0.8, 0], scale: [0.5, 1.4] }}
          transition={{ duration: 2.2, delay: i * 0.7, repeat: reduce ? 0 : Infinity, ease: 'easeOut' }}
        />
      ))}
      <span className="relative grid size-4 place-items-center rounded-full bg-inkwell-gold">
        <span className="size-1.5 rounded-full bg-inkwell-950" />
      </span>
    </div>
  )
}

function ThemeMock() {
  const reduce = useReducedMotion()
  return (
    <div aria-hidden="true" className="mt-auto flex items-center gap-3">
      <motion.div
        className="relative size-12 shrink-0 overflow-hidden rounded-full border border-inkwell-cream/20"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 14, repeat: reduce ? 0 : Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-0 bg-[#0b100e]" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[#f5f2e8]" />
        <div className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-inkwell-gold bg-transparent" />
      </motion.div>
      <div className="flex gap-1.5">
        {['#0b100e', '#436b4b', '#a9c7a1', '#f5f2e8'].map((swatch) => (
          <span
            key={swatch}
            style={{ background: swatch }}
            className="size-5 rounded-full border border-inkwell-cream/25"
          />
        ))}
      </div>
      <span className="ml-auto font-mono text-[9px] uppercase tracking-[.2em] text-inkwell-dim">
        fern & paper
      </span>
    </div>
  )
}

/* ── Spotlight card (cursor-tracking glow) ──────────────────────────────────── */

function SpotCard({
  children,
  className = '',
  index,
}: {
  children: React.ReactNode
  className?: string
  index: number
}) {
  const onMove = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`)
  }, [])

  return (
    <motion.article
      initial={{ opacity: 0, y: 22, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={onMove}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-inkwell-cream/10 bg-inkwell-900/45 p-7 transition duration-300 hover:-translate-y-1 hover:border-inkwell-gold/40 hover:shadow-xl hover:shadow-black/30 ${className}`}
    >
      {/* cursor spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(320px_circle_at_var(--mx,50%)_var(--my,50%),color-mix(in_srgb,var(--accent)_14%,transparent),transparent_70%)]"
      />
      {children}
    </motion.article>
  )
}

/* ── Bento grid ─────────────────────────────────────────────────────────────── */

type Card = {
  icon: React.ReactNode
  title: string
  copy: string
  chips: string[]
  visual: React.ReactNode
  className: string
}

const CARDS: Card[] = [
  {
    icon: <QuillIcon />,
    title: 'A rich editor that stays out of the way',
    copy: 'Headings, lists, quotes, code, images, and alignment — the full typographic toolkit, rendered as calm, readable prose.',
    chips: ['Headings', 'Code', 'Images', 'Quotes'],
    visual: <DocMock />,
    className: 'md:col-span-2 md:row-span-2',
  },
  {
    icon: <EyeIcon />,
    title: 'Views that count',
    copy: 'Every post tracks reads, so you know what actually lands.',
    chips: ['Per-post reads'],
    visual: <BarsMock />,
    className: '',
  },
  {
    icon: <HeartIcon />,
    title: 'Appreciate, lightly',
    copy: 'One tap to like. Instant, optimistic, satisfying.',
    chips: ['Optimistic UI'],
    visual: <HeartbeatMock />,
    className: '',
  },
  {
    icon: <CommentIcon />,
    title: 'Conversation in the margins',
    copy: 'Threads, likes, and GIFs on every entry — the reader’s voice is part of the page.',
    chips: ['Threads', 'Likes', 'GIFs'],
    visual: <TypingMock />,
    className: 'md:col-span-2',
  },
  {
    icon: <RssIcon />,
    title: 'Fresh, never noisy',
    copy: 'The latest entries surface first, searchable and filterable by topic.',
    chips: ['Latest-first', 'Topics'],
    visual: <PulseMock />,
    className: 'md:col-span-2',
  },
  {
    icon: <PaletteIcon />,
    title: 'Dark, light, always calm',
    copy: 'Fern & paper in both themes — a hand-tuned palette with editorial serif type.',
    chips: ['2 themes', 'Serif type'],
    visual: <ThemeMock />,
    className: 'md:col-span-2',
  },
]

/* ── Draw-in icons ──────────────────────────────────────────────────────────── */

function QuillIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-full" fill="none">
      <motion.path
        d="M38 10C28 9 18 14 16 25l-1 8"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 1, ease: 'easeInOut' }}
      />
      <motion.path
        d="M38 10c1 10-4 20-15 22M38 10 13 35"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 1, delay: 0.25, ease: 'easeInOut' }}
      />
      <motion.path
        d="M11 38h10"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.7 }}
      />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-full" fill="none">
      <motion.path
        d="M6 24s7-11 18-11 18 11 18 11-7 11-18 11S6 24 6 24Z"
        stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 1, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="24" cy="24" r="6"
        stroke="currentColor" strokeWidth="2"
        initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-full" fill="none">
      <motion.path
        d="M24 40s-14-8.5-14-19a8 8 0 0 1 14-5.5A8 8 0 0 1 38 21c0 10.5-14 19-14 19Z"
        stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 1.1, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="24" cy="22" r="2.5" fill="currentColor"
        initial={{ scale: 0 }} whileInView={{ scale: [0, 1.3, 1] }}
        viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.9 }}
      />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-full" fill="none">
      <motion.path
        d="M8 12h32v20H18l-7 7v-7H8V12Z"
        stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 1, ease: 'easeInOut' }}
      />
      <motion.path
        d="M17 21h14M17 26h8"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.6 }}
      />
    </svg>
  )
}

function RssIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-full" fill="none">
      <motion.path
        d="M10 30a8 8 0 0 1 8 8"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}
      />
      <motion.path
        d="M10 20a18 18 0 0 1 18 18"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.25 }}
      />
      <motion.path
        d="M10 10c16 0 28 12 28 28"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 1, delay: 0.45 }}
      />
      <motion.circle
        cx="12" cy="36" r="2.5" fill="currentColor"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.9 }}
      />
    </svg>
  )
}

function PaletteIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-full" fill="none">
      <motion.path
        d="M24 8c9 0 16 6.5 16 14.5S33 38 24 38c-3 0-5-2-5-4.5 0-3 2-4 2-6.5 0-2-2-2.5-4.5-2.5C12 24.5 8 21 8 16 8 11 15 8 24 8Z"
        stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 1.2, ease: 'easeInOut' }}
      />
      {[
        { cx: 18, cy: 17, d: 0.8 },
        { cx: 27, cy: 15, d: 0.95 },
        { cx: 32, cy: 22, d: 1.1 },
        { cx: 28, cy: 30, d: 1.25 },
      ].map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.cx} cy={dot.cy} r="2.2" fill="currentColor"
          initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 0.85 }}
          viewport={{ once: true }} transition={{ duration: 0.45, delay: dot.d }}
        />
      ))}
    </svg>
  )
}

export function BentoFeatures() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mb-14 flex flex-wrap items-end justify-between gap-6"
      >
        <div className="max-w-xl">
          <span className="font-mono text-[10px] uppercase tracking-[.22em] text-inkwell-gold">
            Crafted, not assembled
          </span>
          <h2 className="mt-4 font-display text-4xl font-medium leading-tight tracking-tight text-inkwell-cream sm:text-5xl">
            Everything a blog needs,<br />
            <span className="italic text-inkwell-gold">nothing it doesn't.</span>
          </h2>
        </div>
        <p className="max-w-xs font-serif text-base leading-7 text-inkwell-muted">
          Hover around — every card is alive, the way the product feels to use.
        </p>
      </motion.div>

      <div className="grid auto-rows-[minmax(11rem,auto)] gap-4 sm:grid-cols-2 md:grid-cols-4">
        {CARDS.map((card, index) => (
          <SpotCard key={card.title} index={index} className={card.className}>
            <div className="relative mb-5 grid size-12 shrink-0 place-items-center rounded-2xl border border-inkwell-gold/25 bg-inkwell-gold/5 p-2.5 text-inkwell-gold transition duration-300 group-hover:rotate-3 group-hover:border-inkwell-gold/50 group-hover:bg-inkwell-gold/10">
              {card.icon}
            </div>

            <h3 className="relative font-display text-2xl font-medium leading-snug text-inkwell-cream">
              {card.title}
            </h3>
            <p className="relative mt-2.5 text-sm leading-7 text-inkwell-muted">
              {card.copy}
            </p>

            <div className="relative mt-4 flex flex-wrap gap-1.5">
              {card.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-inkwell-cream/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[.14em] text-inkwell-dim transition group-hover:border-inkwell-gold/25 group-hover:text-inkwell-muted"
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="relative mt-5 flex flex-1 flex-col">
              {card.visual}
            </div>
          </SpotCard>
        ))}
      </div>
    </section>
  )
}
