import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublishedBlogs } from '../api/blog-api'

export function BlogListPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 9
  const blogsQuery = useQuery({
    queryKey: ['blogs', 'all', { search, page, limit }],
    queryFn: () => getPublishedBlogs({ search, page, limit }),
  })
  const blogs = blogsQuery.data?.data ?? []
  const pagination = blogsQuery.data?.pagination

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1)
      setSearch(searchInput.trim())
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  return (
    <main className="min-h-screen bg-inkwell-950 text-inkwell-cream">
      <header className="border-b border-inkwell-cream/10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full border border-inkwell-gold text-lg text-inkwell-gold [font-family:var(--font-display)]">I</span>
            <span className="font-display text-xl">Inkwell</span>
          </Link>
          <Link to="/" className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold hover:text-inkwell-light">← Home</Link>
        </nav>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="flex flex-col justify-between gap-8 border-b border-inkwell-cream/10 pb-10 md:flex-row md:items-end">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">The complete journal</span>
            <h1 className="mt-4 font-display text-5xl sm:text-6xl">All posts.</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-inkwell-muted">Search through essays, experiments, and notes from the desk.</p>
          </div>
          <label className="w-full md:max-w-sm">
            <span className="sr-only">Search posts</span>
            <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search title or description…" className="w-full rounded-xl border border-inkwell-cream/15 bg-inkwell-900/70 px-4 py-3 text-sm text-inkwell-cream outline-none placeholder:text-inkwell-dim focus:border-inkwell-gold" />
          </label>
        </div>
        {blogsQuery.isLoading && <p className="py-16 text-sm text-inkwell-muted">Loading the journal…</p>}
        {blogsQuery.isError && <p className="py-16 text-sm text-red-300">The journal could not be loaded. Please try again.</p>}
        {!blogsQuery.isLoading && !blogs.length && <div className="mt-12 rounded-2xl border border-dashed border-inkwell-cream/15 p-10 text-center"><p className="font-display text-2xl">No entries found.</p><p className="mt-3 text-sm text-inkwell-muted">Try a different search.</p></div>}
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <article key={blog.id} className="group overflow-hidden rounded-2xl border border-inkwell-cream/10 bg-inkwell-900/45 transition hover:-translate-y-1 hover:border-inkwell-gold/50">
              {blog.coverImage && <img src={blog.coverImage} alt="" className="aspect-[16/9] w-full object-cover opacity-90 transition duration-500 group-hover:opacity-100" />}
              <Link to={`/blogs/${blog.id}`} className="block p-6">
                <div className="flex flex-wrap gap-2">{blog.tags.slice(0, 3).map((tag) => <span key={tag} className="font-mono text-[10px] uppercase tracking-wider text-inkwell-gold">#{tag}</span>)}</div>
                <h2 className="mt-4 font-display text-2xl leading-tight">{blog.title}</h2>
                {blog.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-inkwell-muted">{blog.description}</p>}
                <p className="mt-6 font-mono text-[10px] uppercase tracking-wider text-inkwell-dim">{new Date(blog.publishedAt ?? blog.createdAt).toLocaleDateString()}</p>
              </Link>
            </article>
          ))}
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button type="button" disabled={!pagination.hasPrevPage} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-inkwell-cream/15 px-4 py-2 text-sm text-inkwell-muted transition hover:border-inkwell-gold hover:text-inkwell-gold disabled:opacity-40">← Previous</button>
            <span className="font-mono text-xs text-inkwell-dim">Page {pagination.page} of {pagination.totalPages}</span>
            <button type="button" disabled={!pagination.hasNextPage} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-inkwell-cream/15 px-4 py-2 text-sm text-inkwell-muted transition hover:border-inkwell-gold hover:text-inkwell-gold disabled:opacity-40">Next →</button>
          </div>
        )}
      </section>
    </main>
  )
}
