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

/** A letterpress seal that turns slowly, like a stamp pressed into the page. */
function Seal() {
  const reduce = useReducedMotion()
  return (
    <div className="relative grid size-44 place-items-center sm:size-52">
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <path id="seal-ring" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
        </defs>
        <circle cx="100" cy="100" r="94" fill="none" stroke="var(--inverse-rule)" strokeWidth="1" />
        <circle cx="100" cy="100" r="62" fill="none" stroke="var(--inverse-rule)" strokeWidth="1" />
        <g className={reduce ? '' : 'seal-spin'} style={{ transformOrigin: '100px 100px' }}>
          <text
            fill="var(--inverse-accent)"
            fontFamily="var(--font-mono)"
            fontSize="8.5"
            letterSpacing="3.2"
          >
            <textPath href="#seal-ring" startOffset="0">
              READ SLOWLY · KEEP WHAT MATTERS · READ SLOWLY · KEEP WHAT MATTERS ·
            </textPath>
          </text>
        </g>
      </svg>
      <svg viewBox="0 0 24 24" className="size-8 text-[var(--inverse-accent)]" fill="none" aria-hidden="true">
        <path d="M12 3v18M3 12h18M5.8 5.8l12.4 12.4M18.2 5.8 5.8 18.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function CallToAction() {
  return (
    <section className="px-5 py-16 sm:px-8 lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.8, ease: easeOutSoft }}
        className="ink-band mx-auto max-w-[86rem] overflow-hidden rounded-[1.25rem] px-6 py-14 sm:px-12 sm:py-20 lg:px-16"
      >
        <div className="grid items-center gap-14 lg:grid-cols-[1.25fr_.75fr]">
          <div>
            <p className="eyebrow">One more page</p>
            <h2 className="display mt-5 text-5xl text-[var(--inverse-text)] sm:text-6xl lg:text-7xl">
              Stay for the
              <br />
              <em className="text-[var(--inverse-accent)]">quiet part.</em>
            </h2>
            <p className="mt-6 max-w-md font-serif text-base leading-8 text-[var(--inverse-muted)] sm:text-lg">
              Read freely, leave a note in the margin, and come back when the
              world gets loud. The journal will be here.
            </p>

            <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Link
                to="/blogs"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[var(--inverse-text)] px-6 py-3.5 text-sm font-semibold text-[var(--inverse-bg)] transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--inverse-accent)] hover:text-[var(--inverse-bg)]"
              >
                Enter the journal
                <span className="transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight />
                </span>
              </Link>
              <a
                href="#journal"
                className="link-rule py-3 text-sm font-medium text-[var(--inverse-muted)] transition hover:text-[var(--inverse-text)]"
              >
                Read the recent entries
              </a>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <Seal />
          </div>
        </div>
      </motion.div>
    </section>
  )
}
