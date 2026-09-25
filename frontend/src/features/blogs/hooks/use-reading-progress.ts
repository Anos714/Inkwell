import { useEffect, useState } from 'react'

const SHOW_AFTER_PX = 100

function getProgress(article: HTMLElement): number {
  const { top } = article.getBoundingClientRect()
  const articleTop = top + window.scrollY
  const scrollable = article.offsetHeight - window.innerHeight

  if (scrollable <= 0) return 1
  return Math.min(1, Math.max(0, (window.scrollY - articleTop) / scrollable))
}

/**
 * Reading progress through an article, 0→1. Updates on a requestAnimationFrame
 * tick so a fast scroll never floods React with renders.
 */
export function useReadingProgress(
  articleRef: React.RefObject<HTMLElement | null>,
  contentKey: string,
) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const article = articleRef.current
    if (!article) return

    let frame = 0
    const compute = () => {
      frame = 0
      setProgress(getProgress(article))
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(compute)
    }

    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [articleRef, contentKey])

  return progress
}

/** Resolves once the reader has scrolled far enough for the pill to appear. */
export function useScrolledPast(): boolean {
  const [past, setPast] = useState(false)

  useEffect(() => {
    let frame = 0
    const compute = () => {
      frame = 0
      setPast(window.scrollY > SHOW_AFTER_PX)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(compute)
    }

    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return past
}

/** SSR-safe prefers-reduced-motion, updates with the user's OS setting. */
export function usePrefersReducedMotion(): boolean {
  // Initialised lazily so the state is correct on the first render and the
  // effect only subscribes for later changes.
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}
