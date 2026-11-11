import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router'

const easeOutSoft = [0.22, 1, 0.36, 1] as [number, number, number, number]

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <path d="M3 13 13 3M5 3h8v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  )
}

function RevealLine({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span
        className="block"
        initial={reduce ? { y: 0, opacity: 1 } : { y: '115%' }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.05, delay, ease: easeOutSoft }}
      >
        {children}
      </motion.span>
    </span>
  )
}

export function Hero() {
  const item = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: easeOutSoft } },
  }

  return (
    <section className="relative isolate overflow-hidden">
      {/* A quiet wash of field colour, no glow. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_18%_0%,var(--gold-soft),transparent_60%),radial-gradient(60%_50%_at_92%_10%,color-mix(in_srgb,var(--sky)_14%,transparent),transparent_65%)]"
      />
      {/* Ruled paper */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.55] [mask-image:linear-gradient(to_bottom,black,transparent_75%)] [background-image:linear-gradient(var(--rule)_1px,transparent_1px)] [background-size:100%_3.5rem]"
      />

      <div className="mx-auto max-w-[86rem] px-5 pb-10 pt-10 sm:px-8 sm:pt-14 lg:pb-16 lg:pt-20">
        {/* Masthead folio row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex items-baseline justify-between gap-4 border-b border-inkwell-rule pb-3"
        >
          <span className="folio">Vol. I &nbsp;·&nbsp; Issue 01</span>
          <span className="folio hidden sm:block">A journal of the slow web</span>
          <span className="folio">Est. MMXXV</span>
        </motion.div>

        <div className="grid gap-12 pt-10 sm:pt-14 lg:grid-cols-[1.55fr_.85fr] lg:items-end lg:gap-16 lg:pt-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: easeOutSoft }}
              className="eyebrow mb-6 flex items-center gap-3"
            >
              <span aria-hidden="true" className="h-px w-8 bg-inkwell-brass/70" />
              Inkwell · Essays &amp; field notes
            </motion.p>

            <h1 className="display text-[clamp(3.5rem,11.5vw,8.75rem)] text-inkwell-cream">
              <RevealLine delay={0.34}>Make space</RevealLine>
              <RevealLine delay={0.46}>
                for good
              </RevealLine>
              <RevealLine delay={0.58}>
                <span className="inline-flex items-baseline gap-[0.18em]">
                  <em className="text-inkwell-brass">ideas.</em>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 220 14"
                    className="mb-[0.22em] hidden h-[0.13em] w-[1.5em] min-w-10 text-inkwell-brass/70 sm:block"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <motion.path
                      d="M2 10C46 4 122 3 218 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.2, delay: 1.35, ease: easeOutSoft }}
                    />
                  </svg>
                </span>
              </RevealLine>
            </h1>

            <motion.div
              variants={item}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.85 }}
              className="mt-8 flex items-center gap-4 sm:mt-10"
            >
              <span aria-hidden="true" className="h-px w-14 bg-inkwell-rule" />
              <p className="max-w-sm font-serif text-[0.95rem] italic leading-7 text-inkwell-muted sm:text-base">
                A room for readers who like to linger.
              </p>
            </motion.div>
          </div>

          <motion.div
            variants={item}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.9 }}
            className="lg:pb-2"
          >
            <p className="max-w-md font-serif text-lg leading-8 text-inkwell-muted sm:text-xl sm:leading-9">
              Essays, field notes, and small observations on code, craft, and the
              quiet parts of a creative life — written to be read once, slowly,
              and kept.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
              <Link
                to="/blogs"
                className="group inline-flex items-center gap-2.5 rounded-full bg-inkwell-cream px-6 py-3.5 text-sm font-semibold text-inkwell-950 transition duration-300 hover:-translate-y-0.5 hover:bg-inkwell-brass"
              >
                Enter the journal
                <span className="transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight />
                </span>
              </Link>
              <a href="#topics" className="link-rule px-1 py-3 text-sm font-medium text-inkwell-muted transition hover:text-inkwell-cream">
                Browse the contents
              </a>
            </div>

            <div className="mt-9 flex items-center gap-3 border-t border-inkwell-rule pt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-inkwell-dim sm:gap-4 sm:tracking-[0.18em]">
              <span>No trackers</span>
              <span aria-hidden="true" className="size-1 shrink-0 rounded-full bg-inkwell-brass/70" />
              <span>No algorithm</span>
              <span aria-hidden="true" className="hidden size-1 shrink-0 rounded-full bg-inkwell-brass/70 sm:block" />
              <span className="hidden sm:inline">Only the good parts</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
