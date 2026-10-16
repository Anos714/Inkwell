import { useNavigate } from 'react-router'
import { FaArrowLeft } from 'react-icons/fa'

type Props = {
  /** Where to land when there is no history to go back to. */
  fallback?: string
  label?: string
  className?: string
}

/**
 * One consistent arrow back button for the whole app.
 * Goes back through history when possible, otherwise lands on `fallback`
 * instead of leaving the user stranded (e.g. deep links, fresh tabs).
 */
export function BackButton({ fallback = '/', label = 'Back', className = '' }: Props) {
  const navigate = useNavigate()

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallback, { replace: true })
    }
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label={`${label} — go to the previous page`}
      className={`group inline-flex items-center gap-2.5 text-xs font-semibold text-inkwell-muted transition hover:text-inkwell-cream ${className}`}
    >
      <span className="grid size-9 place-items-center rounded-full border border-inkwell-cream/15 text-inkwell-muted transition duration-300 group-hover:-translate-x-0.5 group-hover:border-inkwell-gold/70 group-hover:bg-inkwell-gold group-hover:text-inkwell-950">
        <FaArrowLeft aria-hidden="true" className="size-3.5" />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[.18em]">{label}</span>
    </button>
  )
}
