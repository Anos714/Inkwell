import { motion } from 'motion/react'

/* ── Animated SVG icons (each draws itself in on view) ─────────────────────── */

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

/* ── Bento grid ─────────────────────────────────────────────────────────────── */

type Card = {
  icon: React.ReactNode
  title: string
  copy: string
  className: string
  iconClassName: string
}

const CARDS: Card[] = [
  {
    icon: <QuillIcon />,
    title: 'A rich editor that stays out of the way',
    copy: 'Headings, lists, quotes, code, images, and alignment — the full typographic toolkit, rendered as calm, readable prose.',
    className: 'md:col-span-2 md:row-span-2',
    iconClassName: 'size-14',
  },
  {
    icon: <EyeIcon />,
    title: 'Views that count',
    copy: 'Every post tracks reads, so you know what actually lands.',
    className: '',
    iconClassName: 'size-10',
  },
  {
    icon: <HeartIcon />,
    title: 'Appreciate, lightly',
    copy: 'One tap to like. Instant, optimistic, satisfying.',
    className: '',
    iconClassName: 'size-10',
  },
  {
    icon: <CommentIcon />,
    title: 'Conversation in the margins',
    copy: 'Thoughtful comments on every entry, moderated with a light touch — the reader’s voice is part of the page.',
    className: 'md:col-span-2',
    iconClassName: 'size-10',
  },
  {
    icon: <RssIcon />,
    title: 'Fresh, never noisy',
    copy: 'The latest entries, surfaced simply.',
    className: 'md:col-span-2',
    iconClassName: 'size-10',
  },
  {
    icon: <PaletteIcon />,
    title: 'Dark, light, always calm',
    copy: 'A hand-tuned palette and editorial serif type in both themes.',
    className: 'md:col-span-2',
    iconClassName: 'size-10',
  },
]

export function BentoFeatures() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mb-14 max-w-xl"
      >
        <span className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">
          Crafted, not assembled
        </span>
        <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-inkwell-cream sm:text-5xl">
          Everything a blog needs,<br />
          <span className="italic text-inkwell-gold">nothing it doesn't.</span>
        </h2>
      </motion.div>

      <div className="grid auto-rows-[minmax(11rem,auto)] gap-4 sm:grid-cols-2 md:grid-cols-4">
        {CARDS.map((card, index) => (
          <motion.article
            key={card.title}
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className={`group relative flex flex-col overflow-hidden rounded-3xl border border-inkwell-cream/10 bg-inkwell-900/45 p-7 transition duration-300 hover:-translate-y-1 hover:border-inkwell-gold/40 hover:bg-inkwell-900/70 ${card.className}`}
          >
            {/* corner glow on hover */}
            <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-inkwell-gold/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

            <div className={`relative mb-6 grid shrink-0 place-items-center rounded-2xl border border-inkwell-gold/25 bg-inkwell-gold/5 p-3.5 text-inkwell-gold transition duration-300 group-hover:border-inkwell-gold/50 group-hover:bg-inkwell-gold/10 ${card.iconClassName}`}>
              {card.icon}
            </div>

            <h3 className="relative font-display text-xl leading-snug text-inkwell-cream sm:text-2xl">
              {card.title}
            </h3>
            <p className="relative mt-3 text-sm leading-7 text-inkwell-muted">
              {card.copy}
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
