const DEPARTMENTS = [
  'Marginalia',
  'Craft',
  'Code',
  'Observations',
  'The slow web',
  'Long reads',
] as const

/**
 * The departments of the journal, set as a still running head between the
 * opening and the plate. A printed contents line rather than a ticker: it
 * holds its place, so the eye can rest on it.
 */
export function DepartmentsBand() {
  return (
    <section aria-label="Departments" className="border-y border-inkwell-rule bg-inkwell-900/40">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-2.5 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-8 sm:px-8">
        <p className="eyebrow flex shrink-0 items-center gap-3">
          <span aria-hidden="true" className="h-px w-6 bg-inkwell-brass/70" />
          Departments
        </p>

        <ul className="grid grid-cols-2 gap-x-6 gap-y-1 sm:w-full sm:grid-cols-3 sm:gap-x-8 xl:flex xl:flex-1 xl:justify-between">
          {DEPARTMENTS.map((department) => (
            <li
              key={department}
              className="font-display text-[1.1rem] italic leading-6 tracking-[-0.01em] text-inkwell-cream/85 sm:text-[1.2rem] sm:leading-7"
            >
              {department}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
