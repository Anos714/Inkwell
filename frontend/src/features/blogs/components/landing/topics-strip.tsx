import { motion } from 'motion/react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getBlogTags } from '../../api/blog-api'

const easeOutSoft = [0.22, 1, 0.36, 1] as [number, number, number, number]

function Arrow() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <path d="M3 13 13 3M5 3h8v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
    </svg>
  )
}

/**
 * The contents page: a numbered index of real tags, set like the back matter
 * of a journal rather than a row of pills.
 */
export function TopicsStrip() {
  const tagsQuery = useQuery({
    queryKey: ['blogs', 'tags'],
    queryFn: getBlogTags,
    staleTime: 5 * 60_000,
  })
  const tags = (tagsQuery.data?.data ?? []).slice(0, 7)

  return (
    <section id="topics" className="mx-auto max-w-[86rem] px-5 py-20 sm:px-8 sm:py-24 lg:py-28">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: easeOutSoft }}
          className="lg:sticky lg:top-28 lg:self-start"
        >
          <p className="eyebrow">The contents</p>
          <h2 className="display mt-5 text-5xl text-inkwell-cream sm:text-6xl">
            Wander by
            <br />
            <em className="text-inkwell-brass">topic.</em>
          </h2>
          <p className="mt-6 max-w-xs font-serif text-base leading-8 text-inkwell-muted">
            Follow a thread rather than a feed. Every subject opens onto the
            entries filed beneath it.
          </p>
          <Link
            to="/blogs"
            className="link-rule mt-7 font-mono text-[10px] uppercase tracking-[0.18em] text-inkwell-muted transition hover:text-inkwell-cream"
          >
            Browse every entry
          </Link>
        </motion.div>

        <div>
          {tagsQuery.isLoading ? (
            <div className="space-y-0">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-shimmer h-[3.6rem] border-t border-inkwell-rule" />
              ))}
            </div>
          ) : tags.length === 0 ? (
            <div className="border-t border-inkwell-rule py-8">
              <p className="font-serif text-lg italic text-inkwell-muted">
                The index is still being set. The journal is open in the meantime.
              </p>
              <Link
                to="/blogs"
                className="link-rule mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-inkwell-brass"
              >
                Read the latest entries
              </Link>
            </div>
          ) : (
            <motion.ul
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            >
              {tags.map((item, index) => (
                <motion.li
                  key={item.tag}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOutSoft } },
                  }}
                >
                  <Link
                    to={`/blogs?tag=${encodeURIComponent(item.tag)}`}
                    className="index-row group text-inkwell-cream"
                    aria-label={`Read entries tagged ${item.tag}`}
                  >
                    <span className="index-row__num">{String(index + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 font-display text-[1.65rem] leading-tight tracking-[-0.01em] transition duration-300 group-hover:translate-x-1 group-hover:text-inkwell-brass sm:text-[2rem]">
                      {item.tag}
                      <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-inkwell-dim sm:hidden">
                        {item.count} {item.count === 1 ? 'entry' : 'entries'}
                      </span>
                    </span>
                    <span className="hidden items-center gap-3 justify-self-end sm:flex">
                      <span aria-hidden="true" className="h-px w-10 bg-inkwell-rule transition-all duration-500 group-hover:w-16 group-hover:bg-inkwell-brass/60" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-inkwell-dim">
                        {item.count} {item.count === 1 ? 'entry' : 'entries'}
                      </span>
                    </span>
                    <span className="justify-self-end text-inkwell-dim transition duration-300 group-hover:text-inkwell-brass">
                      <Arrow />
                    </span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </section>
  )
}
