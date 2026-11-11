import { motion } from 'motion/react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getPublishedBlogs } from '../../api/blog-api'
import { BlogGridSkeleton } from '../blog-skeleton'
import type { Blog } from '../../types'

const easeOutSoft = [0.22, 1, 0.36, 1] as [number, number, number, number]

function Arrow() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <path d="M3 13 13 3M5 3h8v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
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

function LeadCover({ blog }: { blog: Blog }) {
  if (blog.coverImage) {
    return (
      <div className="plate overflow-hidden bg-inkwell-800">
        <img
          src={blog.coverImage}
          alt={`${blog.title} — cover image`}
          loading="lazy"
          decoding="async"
          width={1200}
          height={800}
          className="aspect-[4/3] w-full object-cover transition duration-[900ms] ease-out group-hover:scale-[1.03]"
        />
      </div>
    )
  }

  return (
    <div className="plate flex aspect-[4/3] items-center justify-center overflow-hidden bg-inkwell-800">
      <span className="px-10 text-center font-display text-4xl italic leading-tight text-inkwell-brass/70">
        {blog.title}
      </span>
    </div>
  )
}

/**
 * The lead story plus a contents list — a magazine spread, not a card grid.
 */
export function RecentPosts() {
  const blogsQuery = useQuery({
    queryKey: ['blogs', 'published', { limit: 5 }],
    queryFn: () => getPublishedBlogs({ limit: 5 }),
  })
  const blogs = blogsQuery.data?.data ?? []
  const [lead, ...rest] = blogs

  return (
    <section id="journal" className="border-t border-inkwell-rule bg-inkwell-900/45">
      <div className="mx-auto max-w-[86rem] px-5 py-20 sm:px-8 sm:py-24 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: easeOutSoft }}
          className="flex flex-wrap items-end justify-between gap-6 border-b border-inkwell-rule pb-8"
        >
          <div>
            <p className="eyebrow">From the journal</p>
            <h2 className="display mt-4 text-5xl text-inkwell-cream sm:text-6xl lg:text-7xl">
              Recent <em className="text-inkwell-brass">entries.</em>
            </h2>
          </div>
          <Link
            to="/blogs"
            className="link-rule mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-inkwell-muted transition hover:text-inkwell-cream"
          >
            The full journal <Arrow />
          </Link>
        </motion.div>

        {blogsQuery.isLoading && (
          <div className="mt-10">
            <BlogGridSkeleton count={3} />
          </div>
        )}

        {blogsQuery.isError && (
          <p className="danger-error mt-8 text-sm">The journal could not be loaded. Please try again.</p>
        )}

        {!blogsQuery.isLoading && !blogsQuery.isError && blogs.length === 0 && (
          <div className="mt-10 border-y border-inkwell-rule py-20 text-center">
            <p className="font-display text-3xl italic text-inkwell-cream sm:text-4xl">The first entry is still being written.</p>
            <p className="mt-3 font-serif text-base text-inkwell-muted">Come back soon — the ink is drying.</p>
          </div>
        )}

        {lead && (
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, ease: easeOutSoft }}
            className="group mt-10 grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-14"
          >
            <Link to={`/blogs/${lead.slug}`} className="block" aria-label={`Read ${lead.title}`}>
              <LeadCover blog={lead} />
            </Link>

            <div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[9px] uppercase tracking-[0.18em] text-inkwell-dim">
                <span className="text-inkwell-brass">Lead entry</span>
                <span aria-hidden="true" className="h-px w-6 bg-inkwell-rule" />
                <span>{formatDate(lead)}</span>
                <span>{lead.views.toLocaleString()} reads</span>
              </div>

              <Link to={`/blogs/${lead.slug}`}>
                <h3 className="display mt-5 text-4xl text-inkwell-cream transition duration-500 group-hover:text-inkwell-brass sm:text-5xl lg:text-[3.6rem]">
                  {lead.title}
                </h3>
              </Link>

              {lead.description && (
                <p className="mt-5 max-w-lg font-serif text-base leading-8 text-inkwell-muted sm:text-lg sm:leading-9">
                  {lead.description}
                </p>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-2">
                {lead.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-inkwell-rule px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-inkwell-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Link
                to={`/blogs/${lead.slug}`}
                className="link-rule mt-8 inline-flex font-mono text-[10px] uppercase tracking-[0.18em] text-inkwell-cream"
              >
                Read this entry <Arrow />
              </Link>
            </div>
          </motion.article>
        )}

        {rest.length > 0 && (
          <div className="mt-14">
            {rest.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.06, ease: easeOutSoft }}
              >
                <Link
                  to={`/blogs/${blog.slug}`}
                  className="group grid grid-cols-[2rem_1fr_auto] items-baseline gap-4 border-t border-inkwell-rule py-6 transition sm:grid-cols-[2.75rem_1fr_auto_auto] sm:gap-6"
                >
                  <span className="font-mono text-[10px] tracking-[0.16em] text-inkwell-dim transition group-hover:text-inkwell-brass">
                    {String(index + 2).padStart(2, '0')}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-2xl leading-snug text-inkwell-cream transition duration-300 group-hover:translate-x-1 group-hover:text-inkwell-brass sm:text-[1.7rem]">
                      {blog.title}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] uppercase tracking-[0.14em] text-inkwell-dim">
                      <span>{formatDate(blog)}</span>
                      {blog.tags[0] && (
                        <>
                          <span aria-hidden="true" className="size-0.5 rounded-full bg-inkwell-brass/70" />
                          <span>{blog.tags[0]}</span>
                        </>
                      )}
                    </span>
                  </span>
                  <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] text-inkwell-dim md:block">
                    {blog.views.toLocaleString()} reads
                  </span>
                  <span className="justify-self-end text-inkwell-dim transition duration-300 group-hover:-translate-y-0.5 group-hover:text-inkwell-brass">
                    <Arrow />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {blogs.length > 0 && (
          <div className="mt-12 flex justify-center">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2.5 rounded-full border border-inkwell-rule px-6 py-3 text-sm font-semibold text-inkwell-cream transition duration-300 hover:-translate-y-0.5 hover:border-inkwell-brass/60 hover:text-inkwell-brass"
            >
              Explore every entry <Arrow />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
