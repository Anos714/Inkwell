import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getBlog, getBlogLikeStatus, toggleBlogLike } from '../api/blog-api'
import { useAuthStore } from '../../auth/store/auth-store'
import DOMPurify from 'dompurify'
import { FaHeart, FaLink, FaShareAlt, FaWhatsapp } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { useEffect, useRef, useState } from 'react'

export function BlogDetail() {
  const { blogId } = useParams()
  const token = useAuthStore((state) => state.token)
  const navigate = useNavigate()
  const [shareOpen, setShareOpen] = useState(false)
  const [shareNotice, setShareNotice] = useState('')
  const shareMenuRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const blogQuery = useQuery({
    queryKey: ['blog', blogId],
    queryFn: () => getBlog(blogId ?? ''),
    enabled: Boolean(blogId),
  })
  const likeQuery = useQuery({
    queryKey: ['blog-like', blogId],
    queryFn: () => getBlogLikeStatus(token ?? '', blogId ?? ''),
    enabled: Boolean(token && blogId),
  })
  const likeMutation = useMutation({
    mutationFn: () => toggleBlogLike(token ?? '', blogId ?? ''),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['blog-like', blogId] })
      const previous = queryClient.getQueryData<typeof likeQuery.data>(['blog-like', blogId])
      const currentLiked = previous?.liked ?? false
      const currentTotal = previous?.totalLikes ?? blogQuery.data?.data.likesCount ?? 0
      const optimistic = {
        success: true,
        liked: !currentLiked,
        totalLikes: Math.max(0, currentTotal + (currentLiked ? -1 : 1)),
        message: '',
      }
      queryClient.setQueryData(['blog-like', blogId], optimistic)
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(['blog-like', blogId], context.previous)
    },
    onSuccess: (result) => {
      const optimistic = queryClient.getQueryData<typeof likeQuery.data>(['blog-like', blogId])
      queryClient.setQueryData(['blog-like', blogId], {
        ...result,
        totalLikes: optimistic?.totalLikes ?? result.totalLikes,
      })
      queryClient.setQueryData(['blog', blogId], (current: typeof blogQuery.data) => (
        current ? { ...current, data: { ...current.data, likesCount: optimistic?.totalLikes ?? result.totalLikes } } : current
      ))
    },
  })
  const blog = blogQuery.data?.data
  const shareUrl = window.location.href
  const shareText = `Read "${blog?.title ?? 'this post'}" on Inkwell`
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareNotice('Link copied')
    } catch {
      setShareNotice('Copy failed')
    }
    window.setTimeout(() => setShareNotice(''), 1800)
  }
  useEffect(() => {
    if (!shareOpen) return
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShareOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShareOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [shareOpen])
  const content = typeof blog?.content === 'string'
    ? DOMPurify.sanitize(blog.content)
    : `<pre>${DOMPurify.sanitize(JSON.stringify(blog?.content, null, 2) ?? '')}</pre>`

  if (blogQuery.isLoading) return <main className="min-h-screen bg-inkwell-950 px-6 py-24 text-center text-inkwell-muted">Loading entry…</main>
  if (blogQuery.isError || !blog) return <main className="min-h-screen bg-inkwell-950 px-6 py-24 text-center text-red-300">This entry could not be found.</main>

  return (
    <main className="min-h-screen bg-inkwell-950 text-inkwell-cream">
      <header className="border-b border-inkwell-cream/10">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link to="/" className="font-display text-xl text-inkwell-cream">Inkwell</Link>
          <button type="button" onClick={() => navigate(-1)} className="rounded-full border border-inkwell-gold/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold transition hover:bg-inkwell-gold hover:text-inkwell-950">← Back</button>
        </nav>
      </header>
      <article className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <div className="flex flex-wrap gap-2">
          {blog.tags.map((tag) => <span key={tag} className="font-mono text-[10px] uppercase tracking-wider text-inkwell-gold">#{tag}</span>)}
        </div>
        <h1 className="mt-6 font-display text-5xl leading-tight sm:text-7xl">{blog.title}</h1>
        <p className="mt-6 text-sm text-inkwell-dim">{new Date(blog.publishedAt ?? blog.createdAt).toLocaleDateString()}</p>
        {blog.coverImage && <img src={blog.coverImage} alt="" className="mt-12 max-h-[30rem] w-full rounded-2xl object-cover" />}
        <div className="mt-4 flex items-center gap-3">
          {token ? (
            <button
              type="button"
              aria-label={likeQuery.data?.liked ? 'Unlike this blog' : 'Like this blog'}
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className={`group transition disabled:cursor-wait disabled:opacity-60 ${likeQuery.data?.liked ? 'text-red-500' : 'text-inkwell-muted hover:text-red-400'}`}
            >
              <FaHeart
                aria-hidden="true"
                className={`size-7 transition-transform group-hover:scale-110 ${likeQuery.data?.liked ? 'drop-shadow-[0_0_8px_rgb(239_68_68_/_35%)]' : ''}`}
              />
            </button>
          ) : (
            <Link to="/login" aria-label="Sign in to like this blog" className="text-inkwell-muted transition hover:text-red-400">
              <FaHeart aria-hidden="true" className="size-7" />
            </Link>
          )}
          <span className="text-sm text-inkwell-muted">{likeQuery.data?.totalLikes ?? blog.likesCount ?? 0} likes</span>
          <div ref={shareMenuRef} className="relative ml-2">
            <button
              type="button"
              aria-expanded={shareOpen}
              onClick={() => setShareOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-inkwell-cream/15 px-3 py-2 text-sm text-inkwell-muted transition hover:border-inkwell-gold/60 hover:text-inkwell-gold"
            >
              <FaShareAlt aria-hidden="true" className="size-3.5" /> Share
            </button>
            {shareOpen && (
              <div className="absolute left-0 top-full z-10 mt-2 flex min-w-48 flex-col gap-1 rounded-xl border border-inkwell-cream/15 bg-inkwell-900 p-2 shadow-xl shadow-black/30">
                <button type="button" onClick={copyLink} className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-xs text-inkwell-muted transition hover:bg-inkwell-brown/50 hover:text-inkwell-cream"><FaLink className="size-3.5" /> Copy link</button>
                <a href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-inkwell-muted transition hover:bg-inkwell-brown/50 hover:text-emerald-400"><FaWhatsapp className="size-4" /> WhatsApp</a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-inkwell-muted transition hover:bg-inkwell-brown/50 hover:text-inkwell-cream"><FaXTwitter className="size-3.5" /> X / Twitter</a>
                {shareNotice && <span className="px-3 py-1 text-[10px] text-inkwell-gold">{shareNotice}</span>}
              </div>
            )}
          </div>
        </div>
        {blog.description && <p className="mt-12 text-xl leading-9 text-inkwell-muted">{blog.description}</p>}
        <div
          className="blog-content mt-10 text-base leading-8 text-inkwell-cream/85"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <div className="mt-14 border-t border-inkwell-cream/10 pt-6">
          <span className="text-sm text-inkwell-dim">Comments will be available when the backend comments API is added.</span>
        </div>
      </article>
    </main>
  )
}
