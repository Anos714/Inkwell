import { cubicBezier, motion } from 'motion/react'
import { Link } from 'react-router'
import { HeroPreviewCard } from './hero-preview'

const easeOutSoft = cubicBezier(0.22, 1, 0.36, 1)

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <path d="M3 13 13 3M5 3h8v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  )
}

export function Hero() {
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
  }
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOutSoft } },
  }

  return (
    <section className="relative isolate overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-[-10%] -z-10 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-inkwell-800/25 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_70%)] opacity-40 [background-image:linear-gradient(color-mix(in_srgb,var(--text)_7%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--text)_7%,transparent)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="mx-auto grid max-w-7xl gap-16 px-6 pb-28 pt-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-8 lg:pb-36 lg:pt-28">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div
            variants={item}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-inkwell-gold/30 bg-inkwell-gold/5 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold"
          >
            Stories · Ideas · Honest notes
          </motion.div>

          <motion.h1
            variants={item}
            className="max-w-3xl font-display text-5xl leading-[1.02] tracking-[-0.03em] text-inkwell-cream sm:text-7xl lg:text-[5.25rem]"
          >
            Make space<br />
            for{' '}
            <span className="relative inline-block italic text-inkwell-gold">
              good ideas
              <svg
                aria-hidden="true"
                viewBox="0 0 300 18"
                className="absolute -bottom-2 left-0 h-3.5 w-full text-inkwell-gold/70"
                fill="none"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M3 12C46 5.5 128 3.5 152 8c30 5.5 74 4 145-3.5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 0.8, ease: easeOutSoft }}
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-9 max-w-lg font-serif text-lg leading-8 text-inkwell-muted"
          >
            A quiet corner of the internet for unfinished thoughts, useful lessons, and the small details worth remembering.
          </motion.p>

          <motion.div variants={item} className="mt-11 flex flex-wrap items-center gap-4">
            <Link
              to="/blogs"
              className="group flex items-center gap-2.5 rounded-xl bg-inkwell-gold px-6 py-3.5 text-sm font-bold text-inkwell-950 transition duration-300 hover:-translate-y-0.5 hover:bg-inkwell-light hover:shadow-lg hover:shadow-inkwell-gold/20"
            >
              Read the journal <ArrowUpRight />
            </Link>
            <a
              href="#features"
              className="rounded-xl px-5 py-3.5 text-sm font-semibold text-inkwell-muted transition hover:text-inkwell-cream"
            >
              What is Inkwell?
            </a>
          </motion.div>

          <motion.div variants={item} className="mt-14 flex items-center gap-4 text-xs text-inkwell-dim">
            <span className="flex -space-x-2">
              {['RS', 'AK', 'JM'].map((initials) => (
                <span
                  key={initials}
                  className="grid size-8 place-items-center rounded-full border-2 border-inkwell-950 bg-inkwell-800 font-mono text-[9px] text-inkwell-cream"
                >
                  {initials}
                </span>
              ))}
            </span>
            <span>Written slowly, shared freely.</span>
          </motion.div>
        </motion.div>

        {/* Interactive blog preview with animated stats */}
        <HeroPreviewCard />
      </div>
    </section>
  )
}
