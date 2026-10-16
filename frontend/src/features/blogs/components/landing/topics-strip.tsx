import { motion } from 'motion/react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getBlogTags } from '../../api/blog-api'

/**
 * Topics — a new discovery strip fed by real tag data.
 * Each pill deep-links into the journal pre-filtered by that tag.
 */
export function TopicsStrip() {
  const tagsQuery = useQuery({
    queryKey: ['blogs', 'tags'],
    queryFn: getBlogTags,
    staleTime: 5 * 60_000,
  })
  const tags = (tagsQuery.data?.data ?? []).slice(0, 8)

  if (!tagsQuery.isLoading && tags.length === 0) return null

  return (
    <section id="topics" className="border-y border-inkwell-cream/10 bg-inkwell-900/40">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[.22em] text-inkwell-gold">
              Wander by topic
            </span>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-inkwell-cream sm:text-5xl">
              Every trail, <span className="italic text-inkwell-gold">mapped.</span>
            </h2>
          </div>
          <Link
            to="/blogs"
            className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold transition hover:text-inkwell-light"
          >
            All posts →
          </Link>
        </div>

        {tagsQuery.isLoading ? (
          <div className="mt-8 flex gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="skeleton-shimmer h-10 w-28 shrink-0 rounded-full"
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-wrap gap-2.5"
          >
            {tags.map((item) => (
              <Link
                key={item.tag}
                to={`/blogs?tag=${encodeURIComponent(item.tag)}`}
                className="group inline-flex items-center gap-2 rounded-full border border-inkwell-cream/15 bg-inkwell-950/60 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[.14em] text-inkwell-muted transition duration-300 hover:-translate-y-0.5 hover:border-inkwell-gold/60 hover:text-inkwell-gold"
              >
                #{item.tag}
                <span className="text-inkwell-dim transition group-hover:text-inkwell-gold">
                  {item.count}
                </span>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
