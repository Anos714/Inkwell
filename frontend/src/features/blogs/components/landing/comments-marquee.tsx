import { motion } from 'motion/react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getRecentComments } from '../../api/blog-api'
import type { RecentComment } from '../../types'

function CommentCard({ comment }: { comment: RecentComment }) {
  const username = comment.user?.username ?? 'Someone'
  const initials = username
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <figure className="flex w-[20rem] shrink-0 flex-col gap-4 rounded-2xl border border-inkwell-cream/10 bg-inkwell-900/50 p-6 transition duration-300 hover:border-inkwell-gold/40 sm:w-[24rem]">
      <div className="flex items-center gap-3">
        {comment.user?.avatarUrl ? (
          <img
            src={comment.user.avatarUrl}
            alt=""
            className="size-9 rounded-full object-cover"
          />
        ) : (
          <span className="grid size-9 place-items-center rounded-full bg-inkwell-800 font-mono text-[10px] font-bold text-inkwell-gold">
            {initials}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-inkwell-cream">{username}</p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-inkwell-dim">
            {new Date(comment.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <blockquote className="line-clamp-3 font-serif text-[0.95rem] leading-7 text-inkwell-muted">
        “{comment.content}”
      </blockquote>

      {comment.blog && (
        <figcaption className="mt-auto">
          <Link
            to={`/blogs/${comment.blog.slug}`}
            className="font-mono text-[10px] uppercase tracking-wider text-inkwell-gold/80 transition hover:text-inkwell-gold"
          >
            on “{comment.blog.title.length > 32 ? `${comment.blog.title.slice(0, 32)}…` : comment.blog.title}”
          </Link>
        </figcaption>
      )}
    </figure>
  )
}

export function CommentsMarquee() {
  const commentsQuery = useQuery({
    queryKey: ['comments', 'recent'],
    queryFn: () => getRecentComments(12),
  })
  const comments = commentsQuery.data?.data ?? []

  // Nothing to scroll through yet — keep the section quiet.
  if (!commentsQuery.isLoading && comments.length === 0) return null

  // Duplicate the list so the track loops seamlessly (translateX(-50%)).
  const loop = [...comments, ...comments]

  return (
    <section id="voices" className="overflow-hidden py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 max-w-xl"
        >
          <span className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">
            Voices from the margins
          </span>
          <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-inkwell-cream sm:text-5xl">
            What readers are<br />
            <span className="italic text-inkwell-gold">saying.</span>
          </h2>
        </motion.div>
      </div>

      {commentsQuery.isLoading ? (
        <div className="flex gap-4 px-6 lg:px-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton-shimmer h-44 w-[20rem] shrink-0 rounded-2xl sm:w-[24rem]"
            />
          ))}
        </div>
      ) : (
        <div
          className="marquee group"
          style={{ ['--marquee-duration' as string]: `${Math.max(36, comments.length * 6)}s` }}
        >
          <div className="marquee-track">
            {loop.map((comment, index) => (
              <CommentCard key={`${comment.id}-${index}`} comment={comment} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
