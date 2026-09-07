import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { FaRegTrashAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../auth/store/auth-store'
import { createBlogComment, deleteBlogComment, getBlogComments } from '../api/blog-api'

export function BlogComments({ blogId }: { blogId: string }) {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const [content, setContent] = useState('')
  const queryClient = useQueryClient()
  const commentsQuery = useQuery({
    queryKey: ['blog-comments', blogId],
    queryFn: () => getBlogComments(blogId),
    enabled: Boolean(blogId),
  })
  const createMutation = useMutation({
    mutationFn: () => createBlogComment(token ?? '', blogId, content.trim()),
    onSuccess: () => {
      setContent('')
      queryClient.invalidateQueries({ queryKey: ['blog-comments', blogId] })
    },
  })
  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteBlogComment(token ?? '', commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blog-comments', blogId] }),
  })
  const comments = commentsQuery.data?.data ?? []

  return (
    <section className="mt-16 border-t border-inkwell-cream/10 pt-8" aria-labelledby="comments-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="comments-heading" className="font-display text-3xl">Comments <span className="font-sans text-sm text-inkwell-dim">({comments.length})</span></h2>
      </div>
      {token ? (
        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault()
            if (content.trim()) createMutation.mutate()
          }}
        >
          <label htmlFor="comment-content" className="sr-only">Write a comment</label>
          <textarea
            id="comment-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Add to the conversation…"
            rows={3}
            maxLength={2000}
            className="w-full resize-y rounded-xl border border-inkwell-cream/15 bg-inkwell-900/60 px-4 py-3 text-sm text-inkwell-cream outline-none transition placeholder:text-inkwell-dim focus:border-inkwell-gold"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            {createMutation.isError && <p className="text-xs text-red-300" role="alert">Could not post your comment.</p>}
            <span className="ml-auto text-xs text-inkwell-dim">{content.length}/2000</span>
            <button type="submit" disabled={!content.trim() || createMutation.isPending} className="rounded-full bg-inkwell-gold px-4 py-2 text-xs font-semibold text-inkwell-950 transition hover:bg-inkwell-light disabled:cursor-not-allowed disabled:opacity-50">
              {createMutation.isPending ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-5 text-sm text-inkwell-muted">Please <Link to="/login" className="text-inkwell-gold underline-offset-4 hover:underline">sign in</Link> to join the conversation.</p>
      )}
      {commentsQuery.isLoading && <p className="mt-8 text-sm text-inkwell-dim">Loading comments…</p>}
      {commentsQuery.isError && <p className="mt-8 text-sm text-red-300" role="alert">Comments could not be loaded.</p>}
      <div className="mt-8 space-y-5">
        {comments.map((comment) => (
          <article key={comment.id} className="rounded-xl border border-inkwell-cream/10 bg-inkwell-900/35 p-4">
            <div className="flex items-start gap-3">
              {comment.user?.avatarUrl ? <img src={comment.user.avatarUrl} alt="" className="size-9 rounded-full object-cover" /> : <div className="grid size-9 shrink-0 place-items-center rounded-full bg-inkwell-gold/20 text-sm font-semibold text-inkwell-gold">{comment.user?.username?.[0]?.toUpperCase() ?? '?'}</div>}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <p className="text-sm font-semibold text-inkwell-cream">{comment.user?.username ?? 'Anonymous'}</p>
                  <time className="text-xs text-inkwell-dim" dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleDateString()}</time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-inkwell-muted">{comment.content}</p>
              </div>
              {token && (user?.role === 'admin' || user?.id === comment.user?.id) && (
                <button type="button" aria-label="Delete comment" onClick={() => deleteMutation.mutate(comment.id)} disabled={deleteMutation.isPending} className="rounded-lg p-2 text-inkwell-dim transition hover:bg-red-400/10 hover:text-red-300 disabled:opacity-50">
                  <FaRegTrashAlt aria-hidden="true" className="size-3.5" />
                </button>
              )}
            </div>
          </article>
        ))}
        {!commentsQuery.isLoading && !commentsQuery.isError && comments.length === 0 && <p className="text-sm text-inkwell-dim">No comments yet. Be the first to share a thought.</p>}
      </div>
    </section>
  )
}
