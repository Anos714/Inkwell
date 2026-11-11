import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getPublishedBlogs } from '../../api/blog-api'
import type { Blog } from '../../types'

function Arrow() {
  return (
    <svg aria-hidden="true" className="size-3.5" fill="none" viewBox="0 0 16 16">
      <path d="M3 13 13 3M5 3h8v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
    </svg>
  )
}

/** A small brass sprig, drawn in the same hand as the rest of the page. */
function Sprig() {
  return (
    <svg aria-hidden="true" className="size-8 text-inkwell-brass/70" fill="none" viewBox="0 0 32 32">
      <path d="M16 28V9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M16 19c-5 0-8-3-8-8 5 0 8 3 8 8Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <path d="M16 14c5 0 8-3 8-8-5 0-8 3-8 8Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <circle cx="16" cy="6" r="1.3" fill="currentColor" />
    </svg>
  )
}

function formatDate(blog: Blog) {
  return new Date(blog.publishedAt ?? blog.createdAt).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * The top-right margin of the opening spread: a small, real preview of the
 * latest entry so the column carries information instead of empty air.
 */
export function HeroPreview() {
  // Share the journal's query so the opening and the lead story cannot disagree.
  const blogsQuery = useQuery({
    queryKey: ['blogs', 'published', { limit: 5 }],
    queryFn: () => getPublishedBlogs({ limit: 5 }),
  })
  const latest = blogsQuery.data?.data?.[0]

  return (
    <aside className="hidden border border-inkwell-rule bg-inkwell-900/80 p-5 backdrop-blur-sm xl:block">
      <div className="flex items-start justify-between gap-4">
        <p className="eyebrow">In this issue</p>
        <Sprig />
      </div>

      {blogsQuery.isLoading ? (
        <div className="mt-4 space-y-2.5">
          <div className="skeleton-shimmer h-5 w-11/12" />
          <div className="skeleton-shimmer h-5 w-3/4" />
          <div className="skeleton-shimmer mt-4 h-3 w-1/2" />
        </div>
      ) : latest ? (
        <Link to={`/blogs/${latest.slug}`} className="group mt-4 block">
          <h2 className="line-clamp-2 font-display text-[1.4rem] leading-[1.15] text-inkwell-cream transition duration-300 group-hover:text-inkwell-brass">
            {latest.title}
          </h2>
          <p className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[9px] uppercase tracking-[0.16em] text-inkwell-dim">
            <span>{formatDate(latest)}</span>
            <span aria-hidden="true" className="size-0.5 rounded-full bg-inkwell-brass/70" />
            <span>{latest.views.toLocaleString()} reads</span>
          </p>
          <span className="link-rule mt-4 inline-flex font-mono text-[9px] uppercase tracking-[0.18em] text-inkwell-cream">
            Read the entry <Arrow />
          </span>
        </Link>
      ) : (
        <p className="mt-4 font-serif text-lg italic leading-7 text-inkwell-muted">
          The first entry is still being written. The journal is open in the meantime.
        </p>
      )}
    </aside>
  )
}
