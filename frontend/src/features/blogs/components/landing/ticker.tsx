const WORDS = [
  'Essays',
  'Field notes',
  'Marginalia',
  'Craft',
  'Code',
  'Observations',
  'The slow web',
  'Long reads',
] as const

function Row({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden || undefined}>
      {WORDS.map((word) => (
        <span key={word} className="flex items-center">
          <span className="px-6 font-mono text-[10px] uppercase tracking-[0.28em] text-inkwell-muted sm:px-8">
            {word}
          </span>
          <span aria-hidden="true" className="font-display text-base italic text-inkwell-brass">
            ✦
          </span>
        </span>
      ))}
    </div>
  )
}

/**
 * A printer's ticker: the categories of the journal, set in caps, drifting
 * slowly between two hairlines.
 */
export function ReadingTicker() {
  return (
    <div className="border-y border-inkwell-rule bg-inkwell-900/50">
      <div className="marquee py-3.5" style={{ ['--marquee-duration' as string]: '46s' }}>
        <div className="marquee-track">
          <Row />
          <Row ariaHidden />
        </div>
      </div>
    </div>
  )
}
