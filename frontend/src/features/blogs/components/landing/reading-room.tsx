import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router'

const easeOutSoft = [0.22, 1, 0.36, 1] as [number, number, number, number]

/* ── Thin, drawn-in line icons ────────────────────────────────────────────── */

function Icon({ paths }: { paths: string[] }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-7" fill="none">
      {paths.map((d, index) => (
        <motion.path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 + index * 0.18, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  )
}

type Feature = {
  title: string
  copy: string
  icon: string[]
  note: string
}

const FEATURES: Feature[] = [
  {
    title: 'Prose first',
    copy: 'A reading column measured in characters, not breakpoints. Serif text, generous leading, and headings that step back.',
    icon: ['M7 25c8-1 13-7 15-17', 'M22 8c-1 8-5 13-12 15', 'M6 27h9'],
    note: 'Typeset for the long read',
  },
  {
    title: 'A room with margins',
    copy: 'Threaded replies, quiet likes, and a share menu that never interrupts the paragraph you are in.',
    icon: ['M5 7h22v15H13l-6 5v-5H5V7Z', 'M11 13h10', 'M11 17h6'],
    note: 'Conversation, kept civil',
  },
  {
    title: 'Filed by subject',
    copy: 'Every entry carries its tags. Follow one thread at a time instead of scrolling an endless feed.',
    icon: ['M4 9h10l4 4-9 9-5-5V9Z', 'M9.5 12.5h.01'],
    note: 'An index, not an algorithm',
  },
  {
    title: 'Dusk & daylight',
    copy: 'Warm paper for the day, deep fern for the night. Both themes are hand-tuned, never inverted.',
    icon: ['M23 19A9 9 0 0 1 13 5a9 9 0 1 0 10 14Z'],
    note: 'Two readings of the same page',
  },
]

export function ReadingRoom() {
  const reduce = useReducedMotion()

  return (
    <section id="reading-room" className="mx-auto max-w-[86rem] px-5 py-20 sm:px-8 sm:py-24 lg:py-28">
      <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: easeOutSoft }}
          className="lg:sticky lg:top-28 lg:self-start"
        >
          <p className="eyebrow">Inside the reading room</p>
          <h2 className="display mt-5 text-5xl text-inkwell-cream sm:text-6xl">
            Built for the
            <br />
            <em className="text-inkwell-brass">long read.</em>
          </h2>
          <p className="mt-6 max-w-sm font-serif text-base leading-8 text-inkwell-muted">
            Inkwell is a small, deliberate place. No infinite scroll, no
            autoplay, no interruptions — just the page and whatever you brought
            to it.
          </p>
          <Link
            to="/blogs"
            className="link-rule mt-7 font-mono text-[10px] uppercase tracking-[0.18em] text-inkwell-muted transition hover:text-inkwell-cream"
          >
            See it for yourself
          </Link>
        </motion.div>

        <div className="grid gap-x-10 gap-y-0 sm:grid-cols-2">
          {FEATURES.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.65, delay: reduce ? 0 : index * 0.08, ease: easeOutSoft }}
              className="group border-t border-inkwell-rule py-7"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-inkwell-brass transition duration-500 group-hover:-rotate-3">
                  <Icon paths={feature.icon} />
                </span>
                <span className="font-mono text-[10px] tracking-[0.18em] text-inkwell-dim">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-5 font-display text-2xl leading-tight text-inkwell-cream">
                {feature.title}
              </h3>
              <p className="mt-2.5 text-[13.5px] leading-6 text-inkwell-muted">
                {feature.copy}
              </p>
              <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.16em] text-inkwell-dim">
                {feature.note}
              </p>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Marginalia — one line, left as a note in the margin. */}
      <motion.figure
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1, ease: easeOutSoft }}
        className="mx-auto mt-20 max-w-3xl border-t border-inkwell-rule pt-10 text-center"
      >
        <blockquote className="display text-3xl leading-[1.15] text-inkwell-cream sm:text-4xl">
          “A good essay is a room you can walk around in,
          <br className="hidden sm:block" />{' '}
          <em className="text-inkwell-brass">furnished with someone else’s attention.</em>”
        </blockquote>
        <figcaption className="mt-6 font-mono text-[9px] uppercase tracking-[0.22em] text-inkwell-dim">
          From the editor’s desk
        </figcaption>
      </motion.figure>
    </section>
  )
}
