import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

const easeOutSoft = [0.22, 1, 0.36, 1] as [number, number, number, number]

/**
 * The one piece of art on the landing page, treated like a plate in a printed
 * journal: matted, captioned, and given a slow parallax drift as it passes.
 */
export function HeroPlate() {
  const frameRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-4%', '6%'])
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.06, 1.12])

  return (
    <section id="plate" className="mx-auto max-w-[86rem] px-5 pb-20 pt-16 sm:px-8 sm:pb-24 lg:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, ease: easeOutSoft }}
        className="plate bg-inkwell-900 p-2 sm:p-3"
      >
        <div ref={frameRef} className="relative overflow-hidden">
          <motion.img
            src="/images/field-note.webp"
            alt="A wide, sunlit countryside with a lone farmhouse and two leaning trees at the end of a winding dirt road."
            width={1672}
            height={941}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            style={{ y, scale }}
            className="aspect-[4/3] w-full object-cover sm:aspect-[16/9]"
          />

          {/* soft vignette so the matted edge feels printed, not cropped */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(20,24,18,0.18)]"
          />

          <div className="pointer-events-none absolute left-3 top-3 hidden items-center gap-2 rounded-full bg-[#f2ecdd]/85 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#22301f] backdrop-blur-sm sm:flex">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[#6f7f4a]" />
            A field note on wandering
          </div>
        </div>

        <figcaption className="flex flex-col gap-2 px-1.5 pb-1 pt-3 sm:flex-row sm:items-baseline sm:justify-between sm:px-2 sm:pt-4">
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-inkwell-dim">Plate I</span>
            <span className="font-display text-lg italic leading-none text-inkwell-cream sm:text-xl">
              Where the road ends
            </span>
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-inkwell-dim">
            Golden grass · Quiet air · Somewhere far
          </p>
        </figcaption>
      </motion.div>
    </section>
  )
}
