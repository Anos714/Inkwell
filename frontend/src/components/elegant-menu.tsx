import { useEffect, useId, useRef, useState } from 'react'
import { FaCheck, FaChevronDown } from 'react-icons/fa'

export type MenuOption<T extends string> = {
  value: T
  label: string
}

type Props<T extends string> = {
  /** Accessible name, e.g. "Sort comments". */
  label: string
  value: T
  options: readonly MenuOption<T>[]
  onChange: (value: T) => void
  /** pill = compact (comment header), field = full-width (filter bar). */
  variant?: 'pill' | 'field'
  className?: string
}

/**
 * An elegant, theme-aware replacement for the native <select>.
 * Native option popups are painted by the OS (blue/grey) and cannot be
 * styled — this menu keeps everything inside the calm Inkwell system while
 * staying keyboard accessible (arrows + Enter + Escape).
 */
export function ElegantMenu<T extends string>({
  label,
  value,
  options,
  onChange,
  variant = 'pill',
  className = '',
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const selected = options.find((option) => option.value === value)

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )

  const openMenu = () => {
    setActiveIndex(selectedIndex)
    setOpen(true)
  }

  useEffect(() => {
    if (open) menuRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const closeOnOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const pick = (next: T) => {
    onChange(next)
    setOpen(false)
    buttonRef.current?.focus()
  }

  const onButtonKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openMenu()
    }
  }

  const onMenuKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % options.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + options.length) % options.length)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(options.length - 1)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const next = options[activeIndex]
      if (next) pick(next.value)
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={label}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onButtonKeyDown}
        className={
          variant === 'field'
            ? 'flex w-full items-center justify-between gap-3 rounded-xl border border-inkwell-cream/15 bg-inkwell-900/70 px-4 py-2.5 text-xs text-inkwell-cream outline-none transition hover:border-inkwell-gold/50 focus:border-inkwell-gold'
            : 'inline-flex items-center gap-2 rounded-full border border-inkwell-cream/15 bg-inkwell-900/60 px-3.5 py-1.5 text-xs font-semibold text-inkwell-muted outline-none transition hover:border-inkwell-gold/60 hover:text-inkwell-gold focus:border-inkwell-gold'
        }
      >
        <span className={variant === 'pill' ? '' : 'text-inkwell-cream'}>
          {selected?.label}
        </span>
        <FaChevronDown
          aria-hidden="true"
          className={`size-3 shrink-0 text-inkwell-gold transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
          className={`reader-card absolute z-30 mt-2 overflow-hidden rounded-2xl p-1.5 outline-none ${
            variant === 'field' ? 'inset-x-0' : 'right-0 w-52'
          }`}
        >
          {options.map((option, index) => {
            const selectedOption = option.value === value
            const active = index === activeIndex
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={selectedOption}
                tabIndex={-1}
                onClick={() => pick(option.value)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs transition ${
                  selectedOption
                    ? 'bg-inkwell-gold/15 font-semibold text-inkwell-gold'
                    : active
                      ? 'bg-inkwell-cream/5 text-inkwell-cream'
                      : 'text-inkwell-muted'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`grid size-4 shrink-0 place-items-center ${
                    selectedOption ? 'text-inkwell-gold' : 'text-transparent'
                  }`}
                >
                  <FaCheck className="size-3" />
                </span>
                {option.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
