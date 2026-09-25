import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { Link, Navigate, useLocation, useParams } from 'react-router'
import type { ReactNode } from 'react'
import { getAdminBlogBySlug, getAdminBlogs } from '../api/blog-api'
import { useAuthStore } from '../../auth/store/auth-store'
import { AdminBlogForm } from './admin-blog-form'
import { AdminBlogManager } from './admin-blog-manager'
import { BlogGridSkeleton } from './blog-skeleton'
import { ThemeToggle } from '../../../components/theme-toggle'
import { BrandLogo } from '../../../components/brand-logo'
import { useSeo } from '../../../hooks/use-seo'
import { SITE_NAME } from '../../../lib/seo'

const NAV_ITEMS = [
  { href: '/admin/blogs', label: 'Overview' },
  { href: '/admin/blogs/create', label: 'Create entry' },
  { href: '/admin/blogs/manage', label: 'Manage entries' },
] as const

/**
 * Shared chrome for every admin screen: sticky glass header, pill navigation
 * with an animated active indicator, and the consistent page heading block.
 */
export function AdminFrame({
  title,
  eyebrow,
  children,
}: {
  title: string
  eyebrow: string
  children: ReactNode
}) {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const location = useLocation()

  useSeo({
    title: `${title} — ${SITE_NAME} Admin`,
    description: 'Private Inkwell admin workspace. Not indexed.',
    path: location.pathname,
    noIndex: true,
  })

  if (!token || user?.role !== 'admin') return <Navigate to="/" replace />

  return (
    <main className="min-h-screen bg-inkwell-950">
      <header className="glass-nav sticky top-0" data-scrolled="true">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
          <Link to="/admin/blogs" className="flex shrink-0 items-center gap-2.5">
            <BrandLogo size="sm" />
            <span className="font-display text-lg tracking-tight text-inkwell-cream">
              Inkwell <span className="text-inkwell-gold">/ Admin</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1.5 rounded-full border border-inkwell-cream/10 bg-inkwell-900/60 p-1.5 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`relative rounded-full px-4 py-2 text-xs font-semibold transition duration-300 ${
                    active
                      ? 'text-inkwell-950'
                      : 'text-inkwell-muted hover:text-inkwell-cream'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="admin-nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-inkwell-gold"
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/"
              className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold transition hover:text-inkwell-light"
            >
              View blog →
            </Link>
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 max-w-2xl"
        >
          <span className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">
            {eyebrow}
          </span>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight text-inkwell-cream sm:text-6xl">
            {title}
          </h1>
        </motion.div>
        {children}
      </div>
    </main>
  )
}

export function AdminCreatePage() {
  const token = useAuthStore((state) => state.token)
  return (
    <AdminFrame title="Create an entry." eyebrow="Private workspace">
      <AdminBlogForm token={token ?? ''} />
    </AdminFrame>
  )
}

export function AdminManagePage() {
  const token = useAuthStore((state) => state.token)
  const query = useQuery({
    queryKey: ['blogs', 'admin-manage'],
    queryFn: () => getAdminBlogs(token ?? ''),
    enabled: Boolean(token),
  })
  return (
    <AdminFrame title="Manage entries." eyebrow="Private workspace">
      {query.isLoading ? (
        <BlogGridSkeleton count={4} />
      ) : (
        <AdminBlogManager token={token ?? ''} blogs={query.data?.data ?? []} />
      )}
    </AdminFrame>
  )
}

export function AdminEditPage() {
  const token = useAuthStore((state) => state.token)
  const { blogId } = useParams()
  const query = useQuery({
    queryKey: ['blog', 'admin', blogId],
    queryFn: () => getAdminBlogBySlug(token ?? '', blogId ?? ''),
    enabled: Boolean(token && blogId),
  })
  return (
    <AdminFrame title="Update an entry." eyebrow="Private workspace">
      {query.isLoading ? (
        <div className="space-y-4">
          <div className="skeleton-shimmer h-12 rounded-xl" />
          <div className="skeleton-shimmer h-72 rounded-xl" />
        </div>
      ) : query.data?.data ? (
        <AdminBlogForm key={query.data.data.id} token={token ?? ''} blog={query.data.data} />
      ) : (
        <div className="rounded-3xl border border-dashed border-inkwell-cream/15 p-12 text-center">
          <p className="font-display text-2xl text-inkwell-cream">Entry could not be loaded.</p>
          <p className="mt-3 text-sm text-inkwell-muted">
            It may have been deleted, or the link is no longer valid.
          </p>
          <Link
            to="/admin/blogs/manage"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-inkwell-gold/60 px-5 py-2.5 text-sm font-semibold text-inkwell-gold transition hover:bg-inkwell-gold hover:text-inkwell-950"
          >
            Back to entries
          </Link>
        </div>
      )}
    </AdminFrame>
  )
}
