// Central source of truth for anything that ends up in the document <head> or
// in structured-data payloads. Keeping the site identity here means the SEO
// hook, the sitemap generator and index.html can never drift apart.

// Vite injects `import.meta.env` at build time; the fallback keeps the module
// importable outside a Vite context (tests, tooling).
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {}

export const SITE_URL = (env.VITE_SITE_URL ?? 'https://inkwell-blogs.pages.dev').replace(/\/$/, '')
export const SITE_NAME = 'Inkwell'
export const SITE_TAGLINE = 'Make space for good ideas'
export const SITE_DESCRIPTION =
  'Inkwell is a personal blog by Rahul — stories, ideas, and honest notes on building, writing, and the web.'
export const AUTHOR_NAME = env.VITE_AUTHOR_NAME ?? 'Rahul'
export const AUTHOR_HANDLE = '@rahul'
// Social scrapers (Twitter/X, Facebook, LinkedIn, Slack) do not render SVG, so
// every shared card must point at the rasterised PNG.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`
export const SITE_KEYWORDS = [
  'personal blog',
  'Inkwell',
  'web development',
  'writing',
  'essays',
  'Rahul',
]

/** Resolve a possibly-relative image path into an absolute public URL. */
export function absoluteUrl(path?: string | null): string {
  if (!path) return DEFAULT_OG_IMAGE
  if (/^https?:\/\//i.test(path)) return path
  return new URL(path, SITE_URL).href
}

type JsonLd = Record<string, unknown>

/** Organization + author identity. Sits on every page. */
export function organizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    alternateName: `${SITE_NAME} blog`,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: DEFAULT_OG_IMAGE,
      width: 1200,
      height: 630,
    },
    founder: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    sameAs: ['https://github.com/Anos714/Inkwell'],
  }
}

/** WebSite + SearchAction unlocks the sitelinks search box in Google results. */
export function websiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: SITE_TAGLINE,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: { '@type': 'Organization', name: SITE_NAME },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/blogs?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export type BlogLike = {
  title: string
  slug: string
  description?: string | null
  coverImage?: string | null
  tags?: string[]
  publishedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

/** BlogPosting for an article page. `url` must be the canonical article URL. */
export function blogPostingJsonLd(blog: BlogLike, url: string): JsonLd {
  const datePublished = blog.publishedAt ?? blog.createdAt
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: blog.title,
    name: blog.title,
    description: blog.description ?? SITE_DESCRIPTION,
    image: [absoluteUrl(blog.coverImage)],
    datePublished,
    dateModified: blog.updatedAt ?? datePublished,
    keywords: (blog.tags ?? []).join(', '),
    author: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
      },
    },
  }
}

export type Crumb = { name: string; url: string }

/** BreadcrumbList — Home > Section > Article. */
export function breadcrumbJsonLd(crumbs: Crumb[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}
