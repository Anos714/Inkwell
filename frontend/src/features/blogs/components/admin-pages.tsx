import { useQuery } from '@tanstack/react-query'
import { Link, Navigate, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { getBlog, getPublishedBlogs } from '../api/blog-api'
import { useAuthStore } from '../../auth/store/auth-store'
import { AdminBlogForm } from './admin-blog-form'
import { AdminBlogManager } from './admin-blog-manager'

function AdminFrame({ title, children }: { title: string; children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  if (!token || user?.role !== 'admin') return <Navigate to="/" replace />
  return (
    <main className="min-h-screen bg-inkwell-950 text-inkwell-cream">
      <header className="border-b border-inkwell-cream/10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link to="/admin/blogs" className="font-display text-xl">Inkwell <span className="text-inkwell-gold">/ Admin</span></Link>
          <Link to="/" className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">View blog →</Link>
        </nav>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="mb-10 flex flex-wrap gap-3 border-b border-inkwell-cream/10 pb-5">
          {[
            ['/admin/blogs', 'Overview'],
            ['/admin/blogs/create', 'Create entry'],
            ['/admin/blogs/manage', 'Manage entries'],
          ].map(([href, label]) => <Link key={href} to={href} className="rounded-full border border-inkwell-cream/15 px-4 py-2 text-xs text-inkwell-muted transition hover:border-inkwell-gold hover:text-inkwell-gold">{label}</Link>)}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">Private workspace</span>
        <h1 className="mt-4 font-display text-5xl">{title}</h1>
        <div className="mt-10">{children}</div>
      </div>
    </main>
  )
}

export function AdminCreatePage() {
  const token = useAuthStore((state) => state.token)
  return <AdminFrame title="Create an entry."><AdminBlogForm token={token ?? ''} /></AdminFrame>
}

export function AdminManagePage() {
  const token = useAuthStore((state) => state.token)
  const query = useQuery({ queryKey: ['blogs', 'admin-manage'], queryFn: () => getPublishedBlogs(), enabled: Boolean(token) })
  return <AdminFrame title="Manage entries.">{query.isLoading ? <p className="text-sm text-inkwell-muted">Loading entries…</p> : <AdminBlogManager token={token ?? ''} blogs={query.data?.data ?? []} />}</AdminFrame>
}

export function AdminEditPage() {
  const token = useAuthStore((state) => state.token)
  const { blogId } = useParams()
  const query = useQuery({ queryKey: ['blog', blogId], queryFn: () => getBlog(blogId ?? ''), enabled: Boolean(token && blogId) })
  return <AdminFrame title="Update an entry.">{query.isLoading ? <p className="text-sm text-inkwell-muted">Loading entry…</p> : query.data?.data ? <AdminBlogForm token={token ?? ''} blog={query.data.data} /> : <p className="text-sm text-red-300">Entry could not be loaded.</p>}</AdminFrame>
}
