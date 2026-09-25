import { useEffect, useMemo, useState } from 'react'

export type TocItem = {
  id: string
  text: string
  level: 2 | 3
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const HEADING_PATTERN = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi

/**
 * Stamps ids onto the article's h2/h3 headings before React renders them.
 *
 * The body arrives via dangerouslySetInnerHTML, which means React owns that
 * subtree and re-writes the whole block on every content change. Writing ids
 * to the DOM from an effect cannot win that race — the next HTML write erases
 * them — so the ids have to be baked into the HTML string itself.
 */
export function injectHeadingIds(
  html: string,
): { items: TocItem[]; html: string } {
  const usedIds = new Set<string>()
  const items: TocItem[] = []

  const stamped = html.replace(HEADING_PATTERN, (match, level: string, inner: string) => {
    const text = inner.replace(/<[^>]*>/g, '').trim()
    const numericLevel = level === '3' ? 3 : 2

    // De-dupe clashing slugs so two identically named sections still get
    // distinct anchors.
    let id = slugify(text) || `section-${items.length}`
    if (usedIds.has(id)) id = `${id}-${items.length}`
    usedIds.add(id)

    items.push({ id, text, level: numericLevel })

    return match.replace(/^<h([23])/i, `<h$1 id="${id}"`)
  })

  return { items, html: stamped }
}

/**
 * Collects the article's table of contents from the content that is about to
 * be rendered. Pair this with the same `contentKey` the article renders from.
 * Returns the TOC items alongside the id-stamped HTML — render the stamped
 * copy, not the original, or the anchor ids never reach the DOM.
 */
export function useHeadingToc(contentKey: string) {
  return useMemo(() => injectHeadingIds(contentKey), [contentKey])
}

/**
 * Tracks which heading the reader is currently sitting under. A heading
 * becomes active once it crosses into the top ~25% of the viewport and stays
 * active until the next one takes over, which matches how a reader mentally
 * maps "the section I'm reading". Drives both the pill label and the
 * highlighted row in the TOC panel.
 */
export function useActiveHeading(items: TocItem[]) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (items.length === 0) return

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null)

    if (elements.length === 0) return

    const visible = new Set<string>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }

        // The topmost heading inside the activation band wins; if the band is
        // empty we simply keep the last one so the highlight never flickers
        // out in the gap between two sections.
        const firstVisible = elements.find((element) => visible.has(element.id))
        if (firstVisible) setActiveId(firstVisible.id)
      },
      { rootMargin: '0px 0px -75% 0px', threshold: 0 },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [items])

  return activeId
}
