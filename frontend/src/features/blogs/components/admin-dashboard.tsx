import { useQuery } from '@tanstack/react-query'
import { Link, Navigate } from 'react-router-dom'
import { getPublishedBlogs } from '../api/blog-api'
import { useAuthStore } from '../../auth/store/auth-store'
import { ThemeToggle } from '../../../components/theme-toggle'

function StatCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-2xl border border-inkwell-cream/10 bg-inkwell-900/60 p-6">
      <p className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">{label}</p>
      <p className="mt-4 font-display text-4xl text-inkwell-cream">{value}</p>
      <p className="mt-2 text-xs text-inkwell-muted">{detail}</p>
    </div>
  )
}

export function AdminDashboard() {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const blogsQuery = useQuery({
    queryKey: ['blogs', 'admin-dashboard'],
    queryFn: () => getPublishedBlogs(),
    enabled: Boolean(token && user?.role === 'admin'),
  })

  if (!token || user?.role !== 'admin') return <Navigate to="/" replace />

  const blogs = blogsQuery.data?.data ?? []
  const totalLikes = blogs.reduce((total, blog) => total + (blog.likesCount ?? 0), 0)

  return (
    <main className="min-h-screen bg-inkwell-950 text-inkwell-cream">
      <header className="border-b border-inkwell-cream/10 bg-inkwell-950/90">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full border border-inkwell-gold text-lg text-inkwell-gold [font-family:var(--font-display)]">I</span>
            <span className="font-display text-xl">Inkwell</span>
          </Link>
          <div className="flex items-center gap-4"><ThemeToggle /><Link to="/" className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold hover:text-inkwell-light">View blog →</Link></div>
        </nav>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="mb-12">
          <span className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">Private workspace</span>
          <h1 className="mt-4 font-display text-5xl sm:text-6xl">Admin dashboard.</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-inkwell-muted">Create, edit, publish, and remove entries from one quiet corner of the journal.</p>
        </div>
        {blogsQuery.isError && <p className="mb-8 text-sm text-red-300">The dashboard data could not be loaded.</p>}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Published entries" value={blogs.length} detail="Visible in the public journal" />
          <StatCard label="Draft entries" value="—" detail="The current API only returns published entries" />
          <StatCard label="Tracked likes" value={totalLikes || '—'} detail={totalLikes ? 'Across returned entries' : 'Like totals are not included in list responses'} />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="flex flex-col gap-5 rounded-3xl border border-inkwell-gold/20 bg-inkwell-900/60 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">Workspace actions</p>
            <h2 className="mt-2 font-display text-2xl text-inkwell-cream">Keep the journal moving.</h2>
            <p className="mt-2 text-sm text-inkwell-muted">Write something new or refine an existing entry.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/admin/blogs/create" className="inline-flex items-center justify-center rounded-xl bg-inkwell-gold px-5 py-3 text-sm font-bold text-inkwell-950 transition hover:bg-inkwell-light">Create entry <span className="ml-2">→</span></Link>
            <Link to="/admin/blogs/manage" className="inline-flex items-center justify-center rounded-xl border border-inkwell-gold/60 px-5 py-3 text-sm font-semibold text-inkwell-gold transition hover:bg-inkwell-gold/10">Manage entries <span className="ml-2">→</span></Link>
          </div>
        </div>
      </div>
    </main>
  )
}
