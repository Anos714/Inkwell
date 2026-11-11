import { motion } from 'motion/react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getRecentComments } from '../../api/blog-api'
import type { RecentComment } from '../../types'

const easeOutSoft = [0.22, 1, 0.36, 1] as [number, number, number, number]

function CommentFolio({ comment, hidden = false }: { comment: RecentComment; hidden?: boolean }) {
  const username = comment.user?.username?.trim() || 'A reader'
  const initials = username
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <figure
      aria-hidden={hidden || undefined}
      className="flex w-[19rem] shrink-0 flex-col border-l border-inkwell-rule pl-6 sm:w-[25rem]"
    >
      <span aria-hidden="true" className="font-display text-5xl leading-[0.6] text-inkwell-brass/60">
        &ldquo;
      </span>

      <blockquote className="mt-4 line-clamp-4 font-serif text-[1.05rem] italic leading-8 text-inkwell-cream/90 sm:text-lg sm:leading-9">
        {comment.content}
      </blockquote>

      <div className="mt-auto flex items-center gap-3 pt-6">
        {comment.user?.avatarUrl ? (
          <img src={comment.user.avatarUrl} alt="" loading="lazy" className="size-8 rounded-full object-cover" />
        ) : (
          <span className="grid size-8 place-items-center rounded-full border border-inkwell-rule font-mono text-[9px] font-semibold text-inkwell-brass">
            {initials}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-inkwell-muted">
            {username}
          </p>
          {comment.blog && (
            <Link
              to={`/blogs/${comment.blog.slug}`}
              className="mt-0.5 block truncate font-serif text-xs italic text-inkwell-dim transition hover:text-inkwell-brass"
            >
              on “{comment.blog.title.length > 34 ? `${comment.blog.title.slice(0, 34)}…` : comment.blog.title}”
            </Link>
          )}
        </div>
      </div>
    </figure>
  )
}

/**
 * Reader marginalia, running past the edge of the page like a line of notes
 * left in the gutter of a shared book.
 */
export function CommentsMarquee() {
  const commentsQuery = useQuery({
    queryKey: ['comments', 'recent'],
    queryFn: () => getRecentComments(12),
  })
  const comments = commentsQuery.data?.data ?? []

  if (!commentsQuery.isLoading && comments.length === 0) return null

  const loop = [...comments, ...comments]

  return (
    <section id="voices" className="border-y border-inkwell-rule py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[86rem] px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: easeOutSoft }}
          className="flex flex-wrap items-end justify-between gap-6 pb-10"
        >
          <div className="max-w-xl">
            <p className="eyebrow">Voices from the margin</p>
            <h2 className="display mt-4 text-5xl text-inkwell-cream sm:text-6xl">
              What readers <em className="text-inkwell-brass">left behind.</em>
            </h2>
          </div>
          <p className="max-w-xs font-serif text-sm leading-7 text-inkwell-muted">
            Notes, disagreements, and small kindnesses — the part of a journal
            that keeps writing itself.
          </p>
        </motion.div>
      </div>

      {commentsQuery.isLoading ? (
        <div className="mx-auto flex max-w-[86rem] gap-8 px-5 sm:px-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton-shimmer h-40 w-[19rem] shrink-0 border-l border-inkwell-rule pl-6 sm:w-[25rem]" />
          ))}
        </div>
      ) : (
        <div
          className="marquee"
          style={{ ['--marquee-duration' as string]: `${Math.max(40, comments.length * 7)}s` }}
        >
          <div className="marquee-track gap-8">
            {loop.map((comment, index) => (
              <CommentFolio key={`${comment.id}-${index}`} comment={comment} hidden={index >= comments.length} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
