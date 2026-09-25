import { useCallback, useEffect, useRef, useState } from 'react'
import { FaCheck, FaCopy, FaLinkedinIn, FaXmark, FaWhatsapp } from 'react-icons/fa6'
import { FaXTwitter } from 'react-icons/fa6'

type ShareModalProps = {
  open: boolean
  onClose: () => void
  url: string
  title: string
  triggerRef: React.RefObject<HTMLElement | null>
}

const FOCUSABLE_SELECTOR = [
  'a[href]', 'button:not([disabled])', 'input', '[tabindex]:not([tabindex="-1"])',
].join(',')

export function ShareModal({ open, onClose, url, title, triggerRef }: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Lock body scroll while the modal is up and return focus to the Share
  // button when it comes down.
  useEffect(() => {
    if (!open) return

    const trigger = triggerRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const stopScrollPropagation = (event: TouchEvent) => event.stopPropagation()

    document.addEventListener('touchmove', stopScrollPropagation, { passive: true })

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('touchmove', stopScrollPropagation)
      trigger?.focus()
    }
  }, [open, triggerRef])

  // Select the whole URL the moment the input becomes visible so one Cmd+C is
  // enough, even before focus lands.
  useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
    return () => cancelAnimationFrame(id)
  }, [open])

  const close = useCallback(() => {
    if (copiedTimer.current) clearTimeout(copiedTimer.current)
    setCopied(false)
    onClose()
  }, [onClose])

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      close()
      return
    }

    if (event.key !== 'Tab') return

    const focusables = cardRef.current
      ? Array.from(cardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => !element.hasAttribute('data-disabled'),
      )
      : []

    if (focusables.length === 0) return

    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    // Trap focus inside the card: Tab on the last element wraps to the first
    // and vice-versa.
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }, [close])

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      inputRef.current?.select()
    } catch {
      // The clipboard API can refuse in insecure contexts — the selected text
      // is still there for the user to copy manually.
      inputRef.current?.focus()
      inputRef.current?.select()
    }
    if (copiedTimer.current) clearTimeout(copiedTimer.current)
    copiedTimer.current = setTimeout(() => setCopied(false), 1500)
  }, [url])

  if (!open) return null

  const shareText = `Read "${title}" on Inkwell`

  return (
    <div
      className="reader-backdrop grid place-items-center px-5"
      onClick={close}
      onKeyDown={onKeyDown}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label="Share this post"
        className="reader-card w-[90vw] max-w-[420px] rounded-2xl p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-inkwell-cream">Share this post</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full bg-inkwell-brown text-inkwell-muted transition hover:bg-inkwell-cream/15 hover:text-inkwell-cream"
          >
            <FaXmark aria-hidden="true" className="size-4" />
          </button>
        </div>

        <p className="mt-2 text-sm text-inkwell-muted">
          “{title}”
        </p>

        <span className="mt-5 block text-sm font-semibold text-inkwell-cream">Copy link</span>
        <div className="mt-2 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            readOnly
            value={url}
            aria-label="Post URL"
            className="min-w-0 flex-1 rounded-lg border border-inkwell-cream/20 bg-inkwell-950 px-3 py-2.5 text-sm text-inkwell-cream outline-none"
          />
          <button
            type="button"
            onClick={copyLink}
            aria-label="Copy link"
            className="grid size-10 shrink-0 place-items-center rounded-lg border border-inkwell-cream/20 bg-inkwell-brown text-inkwell-cream transition hover:bg-inkwell-cream/15"
          >
            {copied ? <FaCheck aria-hidden="true" className="size-4 text-inkwell-gold" /> : <FaCopy aria-hidden="true" className="size-4" />}
          </button>
        </div>

        <span className="mt-6 block text-sm font-semibold text-inkwell-cream">Share on</span>
        <div className="mt-2 flex flex-wrap gap-2">
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-inkwell-cream/20 bg-inkwell-950 px-3.5 py-2.5 text-sm text-inkwell-cream transition hover:border-inkwell-gold/60 hover:text-inkwell-gold"
          >
            <FaXTwitter aria-hidden="true" className="size-3.5" /> Twitter / X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-inkwell-cream/20 bg-inkwell-950 px-3.5 py-2.5 text-sm text-inkwell-cream transition hover:border-inkwell-gold/60 hover:text-inkwell-gold"
          >
            <FaLinkedinIn aria-hidden="true" className="size-3.5" /> LinkedIn
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-inkwell-cream/20 bg-inkwell-950 px-3.5 py-2.5 text-sm text-inkwell-cream transition hover:text-emerald-400"
          >
            <FaWhatsapp aria-hidden="true" className="size-3.5" /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
