import { forwardRef } from 'react'
import {
  usePrefersReducedMotion,
  useScrolledPast,
} from '../hooks/use-reading-progress'
import { FaListUl } from 'react-icons/fa6'

type ReadingProgressPillProps = {
  progress: number
  activeTitle: string | null
  tocOpen: boolean
  onToggleToc: () => void
}

const RING = 24
const RADIUS = 10
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export const ReadingProgressPill = forwardRef<
  HTMLButtonElement,
  ReadingProgressPillProps
>(function ReadingProgressPill(
  { progress, activeTitle, tocOpen, onToggleToc },
  ref,
) {
  const scrolledPast = useScrolledPast()
  const reducedMotion = usePrefersReducedMotion()

  const offset = CIRCUMFERENCE * (1 - progress)
  const label = activeTitle ?? 'Start of the article'

  return (
    <button
      ref={ref}
      type="button"
      onClick={onToggleToc}
      data-visible={scrolledPast}
      data-open={tocOpen}
      aria-haspopup="dialog"
      aria-expanded={tocOpen}
      aria-label="Open table of contents"
      className="reader-pill group"
    >
      <span
        aria-hidden="true"
        className={`size-2 shrink-0 rounded-full bg-inkwell-cream ${reducedMotion ? '' : 'reader-dot-pulse'}`}
      />

      <span className="reader-pill-label flex-1 text-left">{label}</span>

      <svg
        width={RING}
        height={RING}
        viewBox={`0 0 ${RING} ${RING}`}
        aria-hidden="true"
        className="shrink-0 -rotate-90"
      >
        <circle
          cx={RING / 2}
          cy={RING / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={2.5}
          className="stroke-inkwell-cream/25"
        />
        <circle
          cx={RING / 2}
          cy={RING / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="stroke-inkwell-gold transition-[stroke-dashoffset] duration-75 ease-linear"
        />
      </svg>

      <FaListUl
        aria-hidden="true"
        className="size-3.5 shrink-0 text-inkwell-dim transition group-hover:text-inkwell-gold"
      />
    </button>
  )
})
