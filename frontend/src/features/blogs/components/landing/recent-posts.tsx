import { motion } from 'motion/react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getPublishedBlogs } from '../../api/blog-api'
import { BlogGridSkeleton } from '../blog-skeleton'

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <path d="M3 13 13 3M5 3h8v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  )
}

export function RecentPosts() {
  const blogsQuery = useQuery({
    queryKey: ['blogs', 'published', { limit: 6 }],
    queryFn: () => getPublishedBlogs({ limit: 6 }),
  })
  const blogs = blogsQuery.data?.data ?? []

  return (
    <section id="journal" className="border-y border-inkwell-cream/10 bg-inkwell-900/30">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 flex items-end justify-between gap-6"
        >
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">
              From the journal
            </span>
            <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-inkwell-cream sm:text-5xl">
              Recent posts.
            </h2>
          </div>
          <Link
            to="/blogs"
            className="hidden font-mono text-[10px] uppercase tracking-wider text-inkwell-gold transition hover:text-inkwell-light sm:block"
          >
            View all posts →
          </Link>
        </motion.div>

        {blogsQuery.isLoading && <BlogGridSkeleton count={6} />}

        {blogsQuery.isError && (
          <p className="text-sm text-red-300">The journal could not be loaded. Please try again.</p>
        )}

        {!blogsQuery.isLoading && blogs.length === 0 && (
          <div className="rounded-3xl border border-dashed border-inkwell-cream/15 p-12 text-center">
            <p className="font-display text-2xl text-inkwell-cream">The first entry is still being written.</p>
            <p className="mt-3 text-sm text-inkwell-muted">Come back soon for new ideas.</p>
          </div>
        )}

        {blogs.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog, index) => (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group overflow-hidden rounded-3xl border border-inkwell-cream/10 bg-inkwell-950/70 transition duration-300 hover:-translate-y-1 hover:border-inkwell-gold/50 hover:shadow-xl hover:shadow-black/25"
              >
                {blog.coverImage && (
                  <div className="overflow-hidden">
                    <img
                      src={blog.coverImage}
                      alt=""
                      className="aspect-[16/9] w-full object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                    />
                  </div>
                )}
                <Link to={`/blogs/${blog.slug}`} className="block p-6">
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {blog.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="font-mono text-[10px] uppercase tracking-wider text-inkwell-gold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="mt-4 font-display text-2xl leading-tight text-inkwell-cream transition group-hover:text-inkwell-gold">
                    {blog.title}
                  </h3>
                  {blog.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-inkwell-muted">
                      {blog.description}
                    </p>
                  )}
                  <p className="mt-6 font-mono text-[10px] uppercase tracking-wider text-inkwell-dim">
                    {new Date(blog.publishedAt ?? blog.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              </motion.article>
            ))}
          </div>
        )}

        {blogs.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 rounded-xl border border-inkwell-gold/60 px-6 py-3 text-sm font-semibold text-inkwell-gold transition duration-300 hover:-translate-y-0.5 hover:bg-inkwell-gold hover:text-inkwell-950"
            >
              Explore all posts <ArrowUpRight />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
