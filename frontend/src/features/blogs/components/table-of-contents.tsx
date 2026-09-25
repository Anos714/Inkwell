import { useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { TocItem } from '../hooks/use-heading-toc'
import { usePrefersReducedMotion } from '../hooks/use-reading-progress'

type TableOfContentsProps = {
  open: boolean
  onClose: () => void
  items: TocItem[]
  activeId: string | null
  triggerRef: React.RefObject<HTMLElement | null>
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function TableOfContents({
  open,
  onClose,
  items,
  activeId,
  triggerRef,
}: TableOfContentsProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  // Every dismissal hands focus back to the control that opened the TOC.
  const dismiss = useCallback(() => {
    triggerRef.current?.focus()
    onClose()
  }, [onClose, triggerRef])

  const jumpTo = useCallback(
    (id: string) => {
      const element = document.getElementById(id)
      if (!element) return
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      triggerRef.current?.focus()
      onClose()
    },
    [onClose, triggerRef],
  )

  // Lock body scroll while the dialog is up and give it back on close.
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  // Escape dismisses, Tab is trapped inside the panel — same contract as the
  // share modal. Focus returns to whichever control opened the TOC.
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        dismiss()
        return
      }

      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => !element.hasAttribute('data-disabled'))

      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, dismiss])

  // Land focus inside the panel on open — the active section when there is
  // one, otherwise the first entry.
  useEffect(() => {
    if (!open) return

    const id = requestAnimationFrame(() => {
      const panel = panelRef.current
      if (!panel) return

      const active = activeId
        ? panel.querySelector<HTMLElement>(`[data-toc-id="${activeId}"]`)
        : null
      const target =
        active ?? panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? panel

      target.focus({ preventScroll: true })
    })

    return () => cancelAnimationFrame(id)
  }, [open, activeId])

  // Keep the active item inside the scrollable panel without snapping it to
  // the top.
  useEffect(() => {
    if (!open || !activeId) return

    const panel = panelRef.current
    if (!panel) return

    const active = panel.querySelector<HTMLElement>(`[data-toc-id="${activeId}"]`)
    if (!active) return

    const { offsetTop, offsetHeight } = active
    const viewTop = panel.scrollTop
    const viewBottom = viewTop + panel.clientHeight

    if (offsetTop < viewTop + 8 || offsetTop + offsetHeight > viewBottom - 8) {
      panel.scrollTo({
        top: offsetTop - panel.clientHeight / 2 + offsetHeight / 2,
        behavior: 'smooth',
      })
    }
  }, [open, activeId])

  if (items.length === 0) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="toc-backdrop"
          className="reader-backdrop"
          style={{ animation: 'none' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: reducedMotion ? 0 : 0.15 } }}
          exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : 0.12 } }}
          onClick={dismiss}
        >
          <div className="absolute bottom-24 left-1/2 w-[calc(100vw-32px)] max-w-[420px] -translate-x-1/2 sm:w-auto">
            <motion.nav
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Table of contents"
              tabIndex={-1}
              className="reader-card max-h-[60vh] min-w-[340px] overflow-y-auto rounded-3xl p-6"
              style={{ animation: 'none' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: reducedMotion ? 0 : 0.18, ease: 'easeOut' },
              }}
              exit={{
                opacity: 0,
                y: 10,
                transition: { duration: reducedMotion ? 0 : 0.12, ease: 'easeIn' },
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <h2 className="mb-4 text-[11px] uppercase tracking-[0.12em] text-inkwell-dim">
                Table of contents
              </h2>

              <ul className="flex flex-col gap-1">
                {items.map((item) => {
                  const isActive = item.id === activeId
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        data-toc-id={item.id}
                        aria-current={isActive ? 'true' : undefined}
                        onClick={() => jumpTo(item.id)}
                        className={`relative block w-full rounded-lg py-2.5 pr-8 text-left transition hover:bg-inkwell-cream/[0.06] ${
                          item.level === 3
                            ? 'pl-8 text-sm text-inkwell-dim'
                            : 'px-3.5 text-[15px] text-inkwell-cream/90'
                        } ${
                          isActive
                            ? 'bg-inkwell-cream/[0.10] font-semibold text-inkwell-cream'
                            : ''
                        }`}
                      >
                        {item.text}
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute right-3.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-inkwell-cream"
                          />
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </motion.nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
