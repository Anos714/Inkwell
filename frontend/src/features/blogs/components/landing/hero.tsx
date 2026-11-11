import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router'
import { HeroPreview } from './hero-preview'

const easeOutSoft = [0.22, 1, 0.36, 1] as [number, number, number, number]

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <path d="M3 13 13 3M5 3h8v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  )
}

/**
 * The mask needs room below the baseline for descenders — the g in "good"
 * hangs lower than the line box on some font-metric/browser combinations.
 * The extra padding buys that room; the negative margin gives the leading
 * back, so the headline's rhythm is unchanged. The reveal offset clears the
 * taller mask so nothing peeks in while the line rises.
 */
function RevealLine({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <span className="-mb-[0.19em] block overflow-hidden pb-[0.26em]">
      <motion.span
        className="block"
        initial={reduce ? { y: 0, opacity: 1 } : { y: '135%' }}
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
      {/* The field itself, washed to paper so the masthead stays legible. */}
      <div aria-hidden="true" className="hero-field" />
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
          className="hero-masthead grid grid-cols-2 items-baseline gap-4 border-b border-inkwell-rule pb-3 sm:grid-cols-3"
        >
          <span className="folio justify-self-start">Vol. I &nbsp;·&nbsp; Issue 01</span>
          <span className="folio hidden justify-self-center sm:block">A journal of the slow web</span>
          <span className="folio col-start-2 justify-self-end sm:col-start-3">Est. MMXXV</span>
        </motion.div>

        <div className="grid gap-12 pt-10 sm:pt-14 xl:grid-cols-[1.6fr_.8fr] xl:items-center xl:gap-12 xl:pt-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: easeOutSoft }}
              className="eyebrow mb-6 flex items-center gap-3"
            >
              <span aria-hidden="true" className="h-px w-8 bg-inkwell-brass/70" />
              Inkwell
              <span className="hidden min-[360px]:inline">&nbsp;· Essays &amp; field notes</span>
            </motion.p>

            <h1 className="display flex flex-col text-[clamp(2.9rem,12vw,8rem)] text-inkwell-cream">
              <RevealLine delay={0.34}>Make space</RevealLine>
              <RevealLine delay={0.46}>
                for good{' '}
                <span className="relative inline-block">
                  <em className="text-inkwell-brass">ideas.</em>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 220 14"
                    className="absolute -bottom-[0.04em] left-0 h-[0.1em] w-[112%] min-w-10 text-inkwell-brass/70"
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
          </div>

          <motion.div
            variants={item}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.9 }}
            className="xl:pb-2"
          >
            <HeroPreview />

            <div className="max-w-md xl:mt-7">
              <p className="font-serif text-lg italic leading-8 text-inkwell-cream/90 sm:text-xl sm:leading-9">
                A room for readers who like to linger.
              </p>
              <p className="mt-3 font-serif text-lg leading-8 text-inkwell-muted sm:text-xl sm:leading-9">
                Essays, field notes, and small observations on code, craft, and the
                quiet parts of a creative life — written to be read once, slowly,
                and kept.
              </p>
            </div>

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
          </motion.div>
        </div>
      </div>
    </section>
  )
}
