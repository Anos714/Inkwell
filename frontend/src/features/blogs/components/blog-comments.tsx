import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { FaHeart, FaRegHeart, FaRegTrashAlt } from 'react-icons/fa'
import { Link } from 'react-router'
import { useAuthStore } from '../../auth/store/auth-store'
import {
  createBlogComment,
  deleteBlogComment,
  getBlogComments,
  toggleCommentLike,
  type NewCommentInput,
} from '../api/blog-api'
import { resolveGifUrl } from '../api/upload-api'
import type { BlogComment } from '../types'

type ReplyTarget = Omit<BlogComment, 'replies'>

// Hosts that always serve raw media, even without a file extension.
const DIRECT_MEDIA_HOSTS = [
  'media.tenor.com',
  'media.giphy.com',
  'i.giphy.com',
  'i.imgur.com',
  'media.imgur.com',
]

// Share/short links on the main site hosts redirect to view pages,
// even when the path ends with .gif — always resolve them.
const PAGE_HOSTS = ['tenor.com', 'www.tenor.com', 'giphy.com', 'www.giphy.com']

// media1.tenor.com … media4.tenor.com, media0.giphy.com … media4.giphy.com
const DIRECT_MEDIA_HOST_PATTERNS = [/^media\d\.tenor\.com$/, /^media\d\.giphy\.com$/]

function isDirectMediaUrl(value: string) {
  try {
    const parsed = new URL(value)
    const host = parsed.hostname.toLowerCase()
    if (PAGE_HOSTS.includes(host)) return false
    if (/\.(gif|webp|png|jpe?g|avif|mp4|webm)(\?.*)?$/i.test(parsed.pathname)) {
      return true
    }
    return (
      DIRECT_MEDIA_HOSTS.some(
        (allowed) => host === allowed || host.endsWith(`.${allowed}`),
      ) || DIRECT_MEDIA_HOST_PATTERNS.some((pattern) => pattern.test(host))
    )
  } catch {
    return false
  }
}

function isVideoGif(url: string) {
  return /\.(mp4|webm)(\?.*)?$/i.test(url)
}

function GifMedia({ url, alt }: { url: string; alt: string }) {
  const token = useAuthStore((state) => state.token)
  const [failed, setFailed] = useState(false)
  // Tenor/Giphy share pages (tenor.com/view/…) are not embeddable — resolve
  // them to the direct media file once, then cache forever per URL.
  const direct = isDirectMediaUrl(url)
  const resolvedQuery = useQuery({
    queryKey: ['gif-resolve', url],
    queryFn: () => resolveGifUrl(token ?? '', url),
    enabled: !direct && Boolean(token),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  })
  const src = direct ? url : (resolvedQuery.data?.url ?? null)
  const kind =
    resolvedQuery.data?.kind ?? (isVideoGif(src ?? '') ? 'video' : 'image')

  // Logged-out readers cannot hit the authed resolver — link out instead of
  // shimmering forever.
  if (failed || (!direct && (resolvedQuery.isError || !token))) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-block text-xs text-inkwell-gold underline-offset-4 hover:underline"
      >
        View attached GIF
      </a>
    )
  }
  if (!src) {
    return <div className="skeleton-shimmer mt-2 h-40 w-64 max-w-full rounded-xl" />
  }
  if (kind === 'video' || isVideoGif(src)) {
    return (
      <video
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
        className="mt-2 max-h-64 w-auto max-w-full rounded-xl border border-inkwell-cream/10"
      />
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="mt-2 max-h-64 w-auto max-w-full rounded-xl border border-inkwell-cream/10 object-cover"
    />
  )
}

function isValidGifUrl(value: string) {
  if (!value) return true
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:' && value.length <= 500
  } catch {
    return false
  }
}

function CommentComposer({
  blogId,
  parentId,
  autoFocus,
  placeholder,
  onDone,
}: {
  blogId: string
  parentId?: string
  autoFocus?: boolean
  placeholder: string
  onDone?: () => void
}) {
  const token = useAuthStore((state) => state.token)
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [gifInput, setGifInput] = useState('')
  const [showGif, setShowGif] = useState(false)
  const gifUrl = gifInput.trim()

  const createMutation = useMutation({
    mutationFn: () => {
      const input: NewCommentInput = { content: content.trim() }
      if (parentId) input.parentId = parentId
      if (gifUrl) input.gifUrl = gifUrl
      return createBlogComment(token ?? '', blogId, input)
    },
    onSuccess: () => {
      setContent('')
      setGifInput('')
      setShowGif(false)
      queryClient.invalidateQueries({ queryKey: ['blog-comments', blogId] })
      onDone?.()
    },
  })

  const canPost = (content.trim() || gifUrl) && isValidGifUrl(gifUrl) && !createMutation.isPending

  return (
    <form
      className="mt-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (canPost) createMutation.mutate()
      }}
    >
      <label htmlFor={parentId ? `reply-${parentId}` : 'comment-content'} className="sr-only">
        {placeholder}
      </label>
      <textarea
        id={parentId ? `reply-${parentId}` : 'comment-content'}
        value={content}
        autoFocus={autoFocus}
        onChange={(event) => setContent(event.target.value)}
        placeholder={placeholder}
        rows={parentId ? 2 : 3}
        maxLength={2000}
        className="w-full resize-y rounded-xl border border-inkwell-cream/15 bg-inkwell-900/60 px-4 py-3 text-sm text-inkwell-cream outline-none transition placeholder:text-inkwell-dim focus:border-inkwell-gold"
      />
      {showGif && (
        <div className="mt-2">
          <input
            value={gifInput}
            onChange={(event) => setGifInput(event.target.value)}
            placeholder="Paste a GIF link (https://… from Tenor or Giphy)"
            inputMode="url"
            className="w-full rounded-xl border border-inkwell-cream/15 bg-inkwell-900/60 px-4 py-2.5 text-sm text-inkwell-cream outline-none transition placeholder:text-inkwell-dim focus:border-inkwell-gold"
          />
          {gifUrl && isValidGifUrl(gifUrl) && (
            <GifMedia url={gifUrl} alt="GIF preview" />
          )}
          {gifUrl && !isValidGifUrl(gifUrl) && (
            <p className="mt-1 text-xs text-red-300" role="alert">
              That GIF link needs to start with https://
            </p>
          )}
        </div>
      )}
      <div className="mt-2 flex items-center gap-3">
        {createMutation.isError && (
          <p className="text-xs text-red-300" role="alert">
            Could not post. Try again.
          </p>
        )}
        <span className="text-xs text-inkwell-dim">{content.length}/2000</span>
        <button
          type="button"
          onClick={() => setShowGif((open) => !open)}
          aria-expanded={showGif}
          className="rounded-full border border-inkwell-cream/15 px-3 py-1.5 text-xs text-inkwell-muted transition hover:border-inkwell-gold/60 hover:text-inkwell-gold"
        >
          {showGif ? 'Hide GIF' : 'GIF'}
        </button>
        <button
          type="submit"
          disabled={!canPost}
          className="ml-auto rounded-full bg-inkwell-gold px-4 py-2 text-xs font-semibold text-inkwell-950 transition hover:bg-inkwell-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createMutation.isPending ? 'Posting…' : parentId ? 'Reply' : 'Post comment'}
        </button>
      </div>
    </form>
  )
}

function LikeButton({ blogId, comment }: { blogId: string; comment: ReplyTarget }) {
  const token = useAuthStore((state) => state.token)
  const queryClient = useQueryClient()

  const likeMutation = useMutation({
    mutationFn: () => toggleCommentLike(token ?? '', comment.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['blog-comments', blogId] })
      const previous = queryClient.getQueryData<{ data: BlogComment[] }>([
        'blog-comments',
        blogId,
      ])
      queryClient.setQueryData<{ data: BlogComment[] }>(
        ['blog-comments', blogId],
        (current) => {
          if (!current) return current
          const patch = (item: ReplyTarget) =>
            item.id === comment.id
              ? {
                  ...item,
                  likedByMe: !item.likedByMe,
                  likesCount: Math.max(
                    0,
                    item.likesCount + (item.likedByMe ? -1 : 1),
                  ),
                }
              : item
          return {
            ...current,
            data: current.data.map((top) => ({
              ...patch(top),
              replies: top.replies.map(patch),
            })),
          }
        },
      )
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['blog-comments', blogId], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-comments', blogId] })
    },
  })

  if (!token) {
    return (
      <Link
        to="/login"
        aria-label="Sign in to like this comment"
        className="inline-flex items-center gap-1.5 text-xs text-inkwell-dim transition hover:text-red-400"
      >
        <FaRegHeart aria-hidden="true" className="size-3.5" />
        <span>{comment.likesCount}</span>
      </Link>
    )
  }

  return (
    <button
      type="button"
      aria-label={comment.likedByMe ? 'Unlike this comment' : 'Like this comment'}
      aria-pressed={comment.likedByMe}
      onClick={() => likeMutation.mutate()}
      disabled={likeMutation.isPending}
      className={`inline-flex items-center gap-1.5 text-xs transition disabled:opacity-60 ${
        comment.likedByMe ? 'text-red-400' : 'text-inkwell-dim hover:text-red-400'
      }`}
    >
      {comment.likedByMe ? (
        <FaHeart aria-hidden="true" className="size-3.5" />
      ) : (
        <FaRegHeart aria-hidden="true" className="size-3.5" />
      )}
      <span>{comment.likesCount}</span>
    </button>
  )
}

function CommentCard({
  blogId,
  comment,
  isReply,
  onReply,
  replying,
}: {
  blogId: string
  comment: ReplyTarget
  isReply?: boolean
  onReply?: () => void
  replying?: boolean
}) {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: () => deleteBlogComment(token ?? '', comment.id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['blog-comments', blogId] }),
  })
  const canDelete =
    token && (user?.role === 'admin' || user?.id === comment.user?.id)

  return (
    <article
      className={`rounded-xl border border-inkwell-cream/10 bg-inkwell-900/35 p-4 ${
        isReply ? 'ml-6 border-l-2 border-l-inkwell-gold/40 sm:ml-10' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {comment.user?.avatarUrl ? (
          <img
            src={comment.user.avatarUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-9 rounded-full object-cover"
          />
        ) : (
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-inkwell-gold/20 text-sm font-semibold text-inkwell-gold">
            {comment.user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="text-sm font-semibold text-inkwell-cream">
              {comment.user?.username ?? 'Anonymous'}
            </p>
            <time
              className="text-xs text-inkwell-dim"
              dateTime={comment.createdAt}
            >
              {new Date(comment.createdAt).toLocaleDateString()}
            </time>
          </div>
          {comment.content && (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-inkwell-muted">
              {comment.content}
            </p>
          )}
          {comment.gifUrl && (
            <GifMedia
              url={comment.gifUrl}
              alt={`GIF shared by ${comment.user?.username ?? 'a reader'}`}
            />
          )}
          <div className="mt-3 flex items-center gap-4">
            <LikeButton blogId={blogId} comment={comment} />
            {!isReply && token && (
              <button
                type="button"
                onClick={onReply}
                aria-expanded={replying}
                className="text-xs text-inkwell-dim transition hover:text-inkwell-gold"
              >
                Reply
              </button>
            )}
          </div>
        </div>
        {canDelete && (
          <button
            type="button"
            aria-label="Delete comment"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="rounded-lg p-2 text-inkwell-dim transition hover:bg-red-400/10 hover:text-red-300 disabled:opacity-50"
          >
            <FaRegTrashAlt aria-hidden="true" className="size-3.5" />
          </button>
        )}
      </div>
    </article>
  )
}

export function BlogComments({ blogId }: { blogId: string }) {
  const token = useAuthStore((state) => state.token)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const commentsQuery = useQuery({
    queryKey: ['blog-comments', blogId],
    queryFn: () => getBlogComments(blogId, token ?? undefined),
  })
  const comments = commentsQuery.data?.data ?? []
  const totalCount =
    comments.length + comments.reduce((sum, c) => sum + c.replies.length, 0)

  return (
    <section
      className="mt-16 border-t border-inkwell-cream/10 pt-8"
      aria-labelledby="comments-heading"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="comments-heading" className="font-display text-3xl">
          Comments{' '}
          <span className="font-sans text-sm text-inkwell-dim">
            ({totalCount})
          </span>
        </h2>
      </div>
      {token ? (
        <CommentComposer
          blogId={blogId}
          placeholder="Add to the conversation…"
        />
      ) : (
        <p className="mt-5 text-sm text-inkwell-muted">
          Please{' '}
          <Link
            to="/login"
            className="text-inkwell-gold underline-offset-4 hover:underline"
          >
            sign in
          </Link>{' '}
          to join the conversation.
        </p>
      )}
      {commentsQuery.isLoading && (
        <p className="mt-8 text-sm text-inkwell-dim">Loading comments…</p>
      )}
      {commentsQuery.isError && (
        <div className="mt-8" role="alert">
          <p className="text-sm text-red-300">Comments could not be loaded.</p>
          <button
            type="button"
            onClick={() => commentsQuery.refetch()}
            className="mt-3 rounded-full border border-inkwell-gold/60 px-4 py-1.5 text-xs font-semibold text-inkwell-gold transition hover:bg-inkwell-gold hover:text-inkwell-950"
          >
            Retry
          </button>
        </div>
      )}
      <div className="mt-8 space-y-5">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-3">
            <CommentCard
              blogId={blogId}
              comment={comment}
              onReply={() =>
                setReplyTo((current) => (current === comment.id ? null : comment.id))
              }
              replying={replyTo === comment.id}
            />
            {comment.replies.map((reply) => (
              <CommentCard
                key={reply.id}
                blogId={blogId}
                comment={reply}
                isReply
              />
            ))}
            {replyTo === comment.id && token && (
              <div className="ml-6 sm:ml-10">
                <CommentComposer
                  blogId={blogId}
                  parentId={comment.id}
                  autoFocus
                  placeholder={`Reply to ${comment.user?.username ?? 'this comment'}…`}
                  onDone={() => setReplyTo(null)}
                />
              </div>
            )}
          </div>
        ))}
        {!commentsQuery.isLoading && !commentsQuery.isError && comments.length === 0 && (
          <p className="text-sm text-inkwell-dim">
            No comments yet. Be the first to share a thought.
          </p>
        )}
      </div>
    </section>
  )
}
