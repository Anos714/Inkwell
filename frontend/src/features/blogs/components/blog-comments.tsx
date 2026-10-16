import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  FaChevronDown,
  FaRegThumbsUp,
  FaRegTrashAlt,
  FaThumbsUp,
} from 'react-icons/fa'
import { Link } from 'react-router'
import { useAuthStore } from '../../auth/store/auth-store'
import {
  createBlogComment,
  deleteBlogComment,
  getBlogComments,
  toggleCommentLike,
  type CommentSort,
  type NewCommentInput,
} from '../api/blog-api'
import { ElegantMenu } from '../../../components/elegant-menu'
import { resolveGifUrl } from '../api/upload-api'
import type { BlogComment } from '../types'

type ReplyTarget = Omit<BlogComment, 'replies'>

type ThreadKey = readonly ['blog-comments', string, CommentSort]

const threadKey = (blogId: string, sort: CommentSort): ThreadKey => [
  'blog-comments',
  blogId,
  sort,
]

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (Number.isNaN(seconds) || seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds} seconds ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
  const years = Math.floor(days / 365)
  return `${years} year${years > 1 ? 's' : ''} ago`
}

function Avatar({ username, avatarUrl }: { username: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        loading="lazy"
        decoding="async"
        className="size-9 shrink-0 rounded-full object-cover"
      />
    )
  }
  return (
    <div
      aria-hidden="true"
      className="grid size-9 shrink-0 place-items-center rounded-full bg-inkwell-gold/20 text-sm font-semibold text-inkwell-gold"
    >
      {username[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

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
  const [focused, setFocused] = useState(false)
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
      setFocused(false)
      queryClient.invalidateQueries({ queryKey: ['blog-comments', blogId] })
      onDone?.()
    },
  })

  const canPost = (content.trim() || gifUrl) && isValidGifUrl(gifUrl) && !createMutation.isPending
  // YT-style: actions appear once the field has focus or content.
  const expanded = focused || content.length > 0 || showGif

  return (
    <form
      className="mt-2"
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
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        rows={1}
        maxLength={2000}
        className="w-full resize-none border-b border-inkwell-cream/20 bg-transparent py-2 text-sm text-inkwell-cream outline-none transition placeholder:text-inkwell-dim focus:border-inkwell-gold"
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
            <p className="danger-error mt-1 text-xs" role="alert">
              That GIF link needs to start with https://
            </p>
          )}
        </div>
      )}
      {expanded && (
        <div className="mt-2 flex items-center gap-2">
        {createMutation.isError && (
          <p className="danger-error text-xs" role="alert">
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
          <span className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setContent('')
                setGifInput('')
                setShowGif(false)
                setFocused(false)
                onDone?.()
              }}
              className="rounded-full px-4 py-2 text-xs font-semibold text-inkwell-muted transition hover:bg-inkwell-cream/10 hover:text-inkwell-cream"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canPost}
              className="rounded-full bg-inkwell-gold px-4 py-2 text-xs font-semibold text-inkwell-950 transition hover:bg-inkwell-light disabled:cursor-not-allowed disabled:opacity-40"
            >
              {createMutation.isPending ? 'Posting…' : parentId ? 'Reply' : 'Comment'}
            </button>
          </span>
        </div>
      )}
    </form>
  )
}

function LikeButton({
  blogId,
  sort,
  comment,
}: {
  blogId: string
  sort: CommentSort
  comment: ReplyTarget
}) {
  const token = useAuthStore((state) => state.token)
  const queryClient = useQueryClient()
  const key = threadKey(blogId, sort)

  const likeMutation = useMutation({
    mutationFn: () => toggleCommentLike(token ?? '', comment.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<{ data: BlogComment[] }>(key)
      queryClient.setQueryData<{ data: BlogComment[] }>(key, (current) => {
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
      })
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous)
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
        className="inline-flex items-center gap-1.5 text-xs text-inkwell-dim transition hover:text-inkwell-gold"
      >
        <FaRegThumbsUp aria-hidden="true" className="size-4" />
        {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
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
        comment.likedByMe ? 'text-inkwell-gold' : 'text-inkwell-dim hover:text-inkwell-cream'
      }`}
    >
      {comment.likedByMe ? (
        <FaThumbsUp aria-hidden="true" className="size-4" />
      ) : (
        <FaRegThumbsUp aria-hidden="true" className="size-4" />
      )}
      {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
    </button>
  )
}

// One flat YT-style row: avatar rail on the left, everything else flowing.
function CommentRow({
  blogId,
  sort,
  comment,
  parentAuthor,
  onReply,
  replying,
}: {
  blogId: string
  sort: CommentSort
  comment: ReplyTarget
  parentAuthor?: string
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
    <article className="flex gap-3">
      <Avatar
        username={comment.user?.username ?? '?'}
        avatarUrl={comment.user?.avatarUrl ?? null}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <p className="text-[13px] font-semibold text-inkwell-cream">
            @{comment.user?.username ?? 'anonymous'}
          </p>
          <time
            className="text-xs text-inkwell-dim"
            dateTime={comment.createdAt}
            title={new Date(comment.createdAt).toLocaleString()}
          >
            {timeAgo(comment.createdAt)}
          </time>
        </div>
        {parentAuthor && (
          <p className="mt-0.5 text-xs text-inkwell-gold/90">@{parentAuthor}</p>
        )}
        {comment.content && (
          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-inkwell-cream/90">
            {comment.content}
          </p>
        )}
        {comment.gifUrl && (
          <GifMedia
            url={comment.gifUrl}
            alt={`GIF shared by ${comment.user?.username ?? 'a reader'}`}
          />
        )}
        <div className="mt-2 flex items-center gap-4">
          <LikeButton blogId={blogId} sort={sort} comment={comment} />
          {!parentAuthor && token && (
            <button
              type="button"
              onClick={onReply}
              aria-expanded={replying}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-inkwell-muted transition hover:bg-inkwell-cream/10 hover:text-inkwell-cream"
            >
              Reply
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              aria-label="Delete comment"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="rounded-full p-1.5 text-inkwell-dim transition hover:bg-red-400/10 hover:text-red-300 disabled:opacity-50"
            >
              <FaRegTrashAlt aria-hidden="true" className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

// A top-level comment plus its collapsible reply rail.
function CommentThread({
  blogId,
  sort,
  comment,
  replyOpen,
  onToggleReply,
}: {
  blogId: string
  sort: CommentSort
  comment: BlogComment
  replyOpen: boolean
  onToggleReply: () => void
}) {
  const token = useAuthStore((state) => state.token)
  const [showReplies, setShowReplies] = useState(false)
  const replyCount = comment.replies.length

  return (
    <div>
      <CommentRow
        blogId={blogId}
        sort={sort}
        comment={comment}
        onReply={onToggleReply}
        replying={replyOpen}
      />
      {replyOpen && token && (
        <div className="ml-12 mt-1 flex gap-3">
          <Avatar
            username={comment.user?.username ?? '?'}
            avatarUrl={comment.user?.avatarUrl ?? null}
          />
          <div className="min-w-0 flex-1">
            <CommentComposer
              blogId={blogId}
              parentId={comment.id}
              autoFocus
              placeholder={`Reply to @${comment.user?.username ?? 'anonymous'}…`}
              onDone={onToggleReply}
            />
          </div>
        </div>
      )}
      {replyCount > 0 && (
        <div className="ml-12 mt-1">
          <button
            type="button"
            onClick={() => setShowReplies((open) => !open)}
            aria-expanded={showReplies}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-inkwell-gold transition hover:bg-inkwell-gold/10"
          >
            <FaChevronDown
              aria-hidden="true"
              className={`size-3 transition-transform ${showReplies ? 'rotate-180' : ''}`}
            />
            {showReplies ? 'Hide replies' : `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
          </button>
          {showReplies && (
            <div className="mt-3 space-y-5 border-l border-inkwell-cream/15 pl-4">
              {comment.replies.map((reply) => (
                <CommentRow
                  key={reply.id}
                  blogId={blogId}
                  sort={sort}
                  comment={reply}
                  parentAuthor={comment.user?.username ?? undefined}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const SORT_LABELS: Record<CommentSort, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  top: 'Top comments',
}

export function BlogComments({ blogId }: { blogId: string }) {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [sort, setSort] = useState<CommentSort>('newest')
  const commentsQuery = useQuery({
    queryKey: threadKey(blogId, sort),
    queryFn: () => getBlogComments(blogId, token ?? undefined, sort),
  })
  const comments = commentsQuery.data?.data ?? []
  const totalCount =
    comments.length + comments.reduce((sum, c) => sum + c.replies.length, 0)

  return (
    <section
      className="mt-16 border-t border-inkwell-cream/10 pt-8"
      aria-labelledby="comments-heading"
    >
      <div className="flex flex-wrap items-center gap-4">
        <h2 id="comments-heading" className="font-display text-3xl font-medium">
          {totalCount.toLocaleString()} Comment{totalCount === 1 ? '' : 's'}
        </h2>
        <div className="ml-auto flex items-center gap-2 text-xs text-inkwell-muted">
          <span className="font-mono uppercase tracking-[0.14em]">Sort by</span>
          <ElegantMenu
            label="Sort comments"
            value={sort}
            options={(Object.keys(SORT_LABELS) as CommentSort[]).map((value) => ({
              value,
              label: SORT_LABELS[value],
            }))}
            onChange={setSort}
          />
        </div>
      </div>
      {token ? (
        <div className="mt-4 flex gap-3">
          <Avatar
            username={user?.username ?? '?'}
            avatarUrl={user?.avatarUrl ?? null}
          />
          <div className="min-w-0 flex-1">
            <CommentComposer
              blogId={blogId}
              placeholder="Add a comment…"
            />
          </div>
        </div>
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
          <p className="danger-error text-sm">Comments could not be loaded.</p>
          <button
            type="button"
            onClick={() => commentsQuery.refetch()}
            className="mt-3 rounded-full border border-inkwell-gold/60 px-4 py-1.5 text-xs font-semibold text-inkwell-gold transition hover:bg-inkwell-gold hover:text-inkwell-950"
          >
            Retry
          </button>
        </div>
      )}
      <div className="mt-8 space-y-7">
        {comments.map((comment) => (
          <CommentThread
            key={comment.id}
            blogId={blogId}
            sort={sort}
            comment={comment}
            replyOpen={replyTo === comment.id}
            onToggleReply={() =>
              setReplyTo((current) => (current === comment.id ? null : comment.id))
            }
          />
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
