import { useEffect } from 'react'
import {
  SITE_NAME,
  SITE_URL,
  SITE_DESCRIPTION,
  AUTHOR_NAME,
  absoluteUrl,
} from '../lib/seo'

export type SeoOptions = {
  title: string
  description?: string
  /** Override the canonical path; defaults to the current location pathname. */
  path?: string
  type?: 'website' | 'article' | 'profile'
  /** OG/Twitter image. Relative paths are resolved against the site origin. */
  image?: string | null
  /** ISO date for article pages. */
  publishedTime?: string | null
  jsonLd?: Record<string, unknown>[]
  /** Keep low-value pages (login, admin, profile) out of the index. */
  noIndex?: boolean
}

type MetaAttr = 'name' | 'property'

const JSONLD_MARKER = 'data-seo-jsonld'

function upsertMeta(attr: MetaAttr, key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.appendChild(element)
  }
  element.href = href
}

function syncJsonLd(blocks: Record<string, unknown>[]) {
  document.head.querySelectorAll(`script[${JSONLD_MARKER}]`).forEach((node) => node.remove())
  blocks.forEach((block) => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute(JSONLD_MARKER, '')
    script.text = JSON.stringify(block)
    document.head.appendChild(script)
  })
}

/**
 * Dependency-free per-route head management for the SPA. React Router swaps one
 * page for another, so every page owns its full head state: title, description,
 * canonical URL, social cards and structured data. Google renders JS and picks
 * all of this up; the static fallback in index.html covers non-JS crawlers.
 */
export function useSeo({
  title,
  description = SITE_DESCRIPTION,
  path,
  type = 'website',
  image,
  publishedTime,
  jsonLd = [],
  noIndex = false,
}: SeoOptions) {
  useEffect(() => {
    const canonical = `${SITE_URL}${path ?? window.location.pathname}`
    const ogImage = absoluteUrl(image)

    document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow')
    upsertCanonical(canonical)

    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:image', ogImage)
    upsertMeta('property', 'og:image:alt', title)

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:site', AUTHOR_NAME)
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', ogImage)

    if (type === 'article') {
      if (publishedTime) upsertMeta('property', 'article:published_time', publishedTime)
      upsertMeta('property', 'article:author', AUTHOR_NAME)
    }

    syncJsonLd(jsonLd)
  }, [title, description, path, type, image, publishedTime, jsonLd, noIndex])
}
