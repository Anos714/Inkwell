import { motion } from 'motion/react'
import { Link } from 'react-router'

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <path d="M3 13 13 3M5 3h8v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  )
}

/**
 * Concentric rings that breathe outward — a calm, looping CTA ornament.
 */
function Rings() {
  return (
    <svg aria-hidden="true" viewBox="0 0 240 240" className="size-full" fill="none">
      {[0, 1, 2, 3].map((i) => (
        <motion.circle
          key={i}
          cx="120" cy="120" r={26 + i * 22}
          stroke="var(--accent)"
          strokeWidth="1.25"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: [0, 0.5 - i * 0.1, 0], scale: [0.85, 1.06] }}
          transition={{
            duration: 3.6,
            delay: i * 0.5,
            repeat: Infinity,
            repeatDelay: 1.2,
            ease: 'easeInOut',
          }}
        />
      ))}
      <motion.circle
        cx="120" cy="120" r="8" fill="var(--accent)"
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}

export function CallToAction() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative grid overflow-hidden rounded-[2rem] border border-inkwell-gold/25 bg-inkwell-800/30 px-7 py-16 sm:px-12 sm:py-24 lg:grid-cols-[1.25fr_.75fr] lg:items-center lg:gap-8"
      >
        {/* ambient glows */}
        <div className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-inkwell-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full bg-inkwell-800/40 blur-3xl" />

        <div className="relative">
          <span className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">
            Stay a while
          </span>
          <h2 className="mt-5 max-w-2xl font-display text-4xl leading-[1.08] tracking-tight text-inkwell-cream sm:text-6xl">
            Find a post that<br />
            <span className="italic text-inkwell-gold">speaks to you.</span>
          </h2>
          <p className="mt-6 max-w-md font-serif text-base leading-8 text-inkwell-muted">
            Read freely, leave a little love, and add your perspective to the conversation.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/blogs"
              className="group flex items-center gap-2.5 rounded-xl bg-inkwell-gold px-6 py-3.5 text-sm font-bold text-inkwell-950 transition duration-300 hover:-translate-y-0.5 hover:bg-inkwell-light hover:shadow-lg hover:shadow-inkwell-gold/20"
            >
              Explore the journal <ArrowUpRight />
            </Link>
            <a
              href="#journal"
              className="nav-link rounded-xl px-5 py-3.5 text-sm font-semibold text-inkwell-muted transition hover:text-inkwell-cream"
            >
              Recent posts
            </a>
          </div>
        </div>

        <div className="relative mx-auto mt-14 hidden aspect-square w-full max-w-[16rem] lg:mt-0 lg:block">
          <Rings />
        </div>
      </motion.div>
    </section>
  )
}
