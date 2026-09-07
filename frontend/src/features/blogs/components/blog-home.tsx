import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublishedBlogs } from '../api/blog-api'
import { useAuthStore } from '../../auth/store/auth-store'
import { useAuth } from '../../auth/hooks/use-auth'

function ArrowUpRight() {
  return <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16"><path d="M3 13 13 3M5 3h8v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>
}

function Sparkle() {
  return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d="m12 2 1.8 7.2L21 11l-7.2 1.8L12 20l-1.8-7.2L3 11l7.2-1.8L12 2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" /></svg>
}

function Compass() {
  return <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.4" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" /></svg>
}

function Feather() {
  return <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24"><path d="M19.5 4.5C13 3 6 6.5 6 13v2.5M19.5 4.5C21 11 17.5 18 11 18H8.5M19.5 4.5 4.5 19.5M5 15h6M8 12h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" /></svg>
}

function Bookmark() {
  return <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24"><path d="M6.5 4.5h11v15l-5.5-3-5.5 3v-15Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" /></svg>
}

export function BlogHome() {
  const user = useAuthStore((state) => state.user)
  const { isLoading, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const blogsQuery = useQuery({ queryKey: ['blogs', 'published', { limit: 4 }], queryFn: () => getPublishedBlogs({ limit: 4 }) })
  const blogs = blogsQuery.data?.data ?? []
  const userInitials = user?.username
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    if (!profileOpen) return
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [profileOpen])

  return (
    <main className="overflow-hidden bg-inkwell-950">
      <header className="relative z-20 border-b border-inkwell-cream/10 bg-inkwell-950/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full border border-inkwell-gold text-lg text-inkwell-gold [font-family:var(--font-display)]">I</span>
            <span className="font-display text-xl text-inkwell-cream">Inkwell</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-inkwell-muted md:flex">
            <a href="#journal" className="transition hover:text-inkwell-cream">Journal</a>
            <a href="#about" className="transition hover:text-inkwell-cream">About the blog</a>
          </div>
          {user ? (
            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                aria-expanded={profileOpen}
                aria-label={`Open profile menu for ${user.username}`}
                onClick={() => setProfileOpen((open) => !open)}
                className="group flex items-center gap-2 rounded-full border border-inkwell-gold/70 py-1.5 pl-1.5 pr-3 text-xs font-semibold text-inkwell-gold transition hover:bg-inkwell-gold hover:text-inkwell-950"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="size-7 rounded-full object-cover" />
                ) : (
                  <span className="grid size-7 place-items-center rounded-full bg-inkwell-gold text-[10px] font-bold text-inkwell-950">{userInitials}</span>
                )}
                <span className="hidden max-w-28 truncate sm:block">{user.username}</span>
                <span className="text-[10px]">{profileOpen ? '▲' : '▼'}</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full z-30 mt-3 w-52 rounded-2xl border border-inkwell-cream/15 bg-inkwell-900 p-2 shadow-2xl shadow-black/40">
                  <div className="border-b border-inkwell-cream/10 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-inkwell-cream">{user.username}</p>
                    <p className="mt-1 truncate text-xs text-inkwell-muted">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/admin/blogs" className="mt-1 block rounded-xl px-3 py-2.5 text-sm text-inkwell-gold transition hover:bg-inkwell-brown/50">
                      Admin dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={logout}
                    disabled={isLoading}
                    className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-sm text-inkwell-muted transition hover:bg-inkwell-brown/50 hover:text-inkwell-gold disabled:cursor-wait disabled:opacity-60"
                  >
                    {isLoading ? 'Signing out…' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="group flex items-center gap-2 rounded-full border border-inkwell-gold/70 px-4 py-2 text-xs font-semibold text-inkwell-gold transition hover:bg-inkwell-gold hover:text-inkwell-950">
              Sign in <ArrowUpRight />
            </Link>
          )}
        </nav>
      </header>

      <section className="relative isolate border-b border-inkwell-cream/10">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[580px] w-[580px] -translate-x-1/2 rounded-full bg-inkwell-800/30 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-16 px-6 pb-24 pt-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:pb-32 lg:pt-28">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-inkwell-gold/30 bg-inkwell-gold/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">
              <Sparkle /> Rahul's personal blog
            </div>
            <h1 className="max-w-3xl text-6xl font-semibold leading-[.98] tracking-[-.07em] text-inkwell-cream sm:text-8xl">
              Stories, ideas,<br /><em className="font-display font-medium not-italic text-inkwell-gold">and honest notes.</em>
            </h1>
            <p className="mt-8 max-w-lg text-base leading-8 text-inkwell-muted sm:text-lg">
              Welcome to my personal corner of the internet. Read what I am learning, thinking about, and creating—and share what resonates with you.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/blogs" className="flex items-center gap-3 rounded-lg bg-inkwell-gold px-5 py-3.5 text-sm font-bold text-inkwell-950 transition hover:-translate-y-0.5 hover:bg-inkwell-light">
                Read the blog <ArrowUpRight />
              </Link>
              <Link to="/blogs" className="rounded-lg px-5 py-3.5 text-sm font-semibold text-inkwell-muted transition hover:text-inkwell-cream">Browse all posts ↓</Link>
            </div>
            <div className="mt-12 flex items-center gap-4 text-xs text-inkwell-dim">
              <span className="flex -space-x-2">
                {['RS', 'AK', 'JM'].map((initials) => <span key={initials} className="grid size-8 place-items-center rounded-full border-2 border-inkwell-950 bg-inkwell-800 font-mono text-[9px] text-inkwell-cream">{initials}</span>)}
              </span>
              <span>Written and shared from my desk.</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: .94, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: .9, delay: .15 }} className="relative mx-auto w-full max-w-[510px]">
            <div className="absolute -inset-5 rounded-[2rem] border border-inkwell-gold/10" />
            <div className="relative overflow-hidden rounded-3xl border border-inkwell-cream/15 bg-inkwell-900 p-7 shadow-2xl shadow-black/30 sm:p-10">
              <div className="flex items-center justify-between border-b border-inkwell-cream/10 pb-5">
                <span className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">Field note / 01</span>
                <span className="text-xs text-inkwell-dim">04:38 read</span>
              </div>
              <div className="py-12">
                <div className="mb-8 font-display text-5xl leading-[.95] text-inkwell-cream sm:text-6xl">Notes from<br /><em className="text-inkwell-gold">the long way.</em></div>
                <p className="max-w-sm text-sm leading-7 text-inkwell-muted">“A personal blog for unfinished thoughts, useful lessons, and the small details worth remembering.”</p>
              </div>
              <div className="flex items-end justify-between border-t border-inkwell-cream/10 pt-5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-inkwell-dim">Personal notes · Open to everyone</span>
                <span className="text-3xl text-inkwell-gold">✦</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="why-inkwell" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mb-12 max-w-xl">
          <span className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">A personal blog, open to you</span>
          <h2 className="mt-4 font-display text-4xl leading-tight text-inkwell-cream sm:text-5xl">Read a thought.<br /><em className="text-inkwell-gold">Leave your own.</em></h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: <Feather />, title: 'Read my latest posts', copy: 'Essays, experiments, and everyday observations written from my perspective.' },
            { icon: <Compass />, title: 'Find something that stays', copy: 'Explore ideas and stories at your own pace, without the noise of a feed.' },
            { icon: <Bookmark />, title: 'Join the conversation', copy: 'Like the posts you enjoy and leave a thoughtful comment when something resonates.' },
          ].map((feature, index) => (
            <motion.article key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }} transition={{ delay: index * .1 }} className="rounded-2xl border border-inkwell-cream/10 bg-inkwell-900/45 p-7 transition hover:-translate-y-1 hover:border-inkwell-gold/40">
              <div className="mb-10 grid size-12 place-items-center rounded-xl border border-inkwell-gold/30 bg-inkwell-gold/5 text-inkwell-gold">{feature.icon}</div>
              <h3 className="font-display text-2xl text-inkwell-cream">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-inkwell-muted">{feature.copy}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="journal" className="border-y border-inkwell-cream/10 bg-inkwell-900/30">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div><span className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">From my blog</span><h2 className="mt-4 font-display text-4xl text-inkwell-cream sm:text-5xl">Recent posts.</h2></div>
            <Link to="/blogs" className="hidden font-mono text-[10px] uppercase tracking-wider text-inkwell-gold transition hover:text-inkwell-light sm:block">View all posts →</Link>
          </div>
          {blogsQuery.isLoading && <p className="text-sm text-inkwell-muted">Loading the journal…</p>}
          {blogsQuery.isError && <p className="text-sm text-red-300">The journal could not be loaded. Please try again.</p>}
          {!blogsQuery.isLoading && blogs.length === 0 && <div className="rounded-2xl border border-dashed border-inkwell-cream/15 p-10 text-center"><p className="font-display text-2xl text-inkwell-cream">The first entry is still being written.</p><p className="mt-3 text-sm text-inkwell-muted">Come back soon for new ideas.</p></div>}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {blogs.slice(0, 4).map((blog, index) => (
              <motion.article key={blog.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }} className="group overflow-hidden rounded-2xl border border-inkwell-cream/10 bg-inkwell-950/70 transition hover:-translate-y-1 hover:border-inkwell-gold/50">
                {blog.coverImage && <img src={blog.coverImage} alt="" className="aspect-[16/9] w-full object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />}
                <Link to={`/blogs/${blog.id}`} className="block p-6"><div className="flex flex-wrap gap-2">{blog.tags.slice(0, 3).map((tag) => <span key={tag} className="font-mono text-[10px] uppercase tracking-wider text-inkwell-gold">#{tag}</span>)}</div><h3 className="mt-4 font-display text-2xl leading-tight text-inkwell-cream">{blog.title}</h3>{blog.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-inkwell-muted">{blog.description}</p>}<p className="mt-6 font-mono text-[10px] uppercase tracking-wider text-inkwell-dim">{new Date(blog.publishedAt ?? blog.createdAt).toLocaleDateString()}</p></Link>
              </motion.article>
            ))}
          </div>
          {blogs.length > 0 && (
            <div className="mt-10 text-center">
              <Link to="/blogs" className="inline-flex items-center gap-2 rounded-lg border border-inkwell-gold/60 px-5 py-3 text-sm font-semibold text-inkwell-gold transition hover:bg-inkwell-gold hover:text-inkwell-950">
                Explore all posts <ArrowUpRight />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-inkwell-gold/25 bg-inkwell-800/35 px-7 py-14 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-inkwell-gold/10 blur-3xl" />
          <span className="relative font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">Stay a while</span>
          <h2 className="relative mx-auto mt-5 max-w-2xl font-display text-4xl leading-tight text-inkwell-cream sm:text-6xl">Find a post that<br /><em className="text-inkwell-gold">speaks to you.</em></h2>
          <p className="relative mx-auto mt-5 max-w-md text-sm leading-7 text-inkwell-muted">Read freely, leave a little love, and add your perspective to the conversation.</p>
          <a href="#journal" className="relative mx-auto mt-8 inline-flex items-center gap-3 rounded-lg bg-inkwell-gold px-6 py-3.5 text-sm font-bold text-inkwell-950 transition hover:-translate-y-0.5 hover:bg-inkwell-light">Explore recent posts <ArrowUpRight /></a>
        </div>
      </section>

      <footer className="border-t border-inkwell-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left lg:px-8">
          <div className="flex items-center justify-center gap-3 sm:justify-start"><span className="grid size-7 place-items-center rounded-full border border-inkwell-gold text-sm text-inkwell-gold [font-family:var(--font-display)]">I</span><span className="font-display text-lg text-inkwell-cream">Inkwell</span></div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-inkwell-dim">Private by design · Made for the long draft</p>
        </div>
      </footer>
    </main>
  )
}
