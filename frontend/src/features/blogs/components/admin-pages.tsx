import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router'
import type { ReactNode } from 'react'
import { getAdminBlogBySlug, getAdminBlogs } from '../api/blog-api'
import { useAuthStore } from '../../auth/store/auth-store'
import { ensureSession } from '../../auth/store/session-bootstrap'
import { AdminBlogForm } from './admin-blog-form'
import { AdminBlogManager } from './admin-blog-manager'
import { ThemeToggle } from '../../../components/theme-toggle'
import { BrandLogo } from '../../../components/brand-logo'
import { useSeo } from '../../../hooks/use-seo'
import { SITE_NAME } from '../../../lib/seo'

type NavItem = { href: string; label: string; match: string[] }

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/blogs', label: 'Overview', match: ['/admin/blogs'] },
  { href: '/admin/blogs/manage', label: 'Entries', match: ['/admin/blogs/manage', '/admin/blogs/edit'] },
  { href: '/admin/blogs/create', label: 'New entry', match: ['/admin/blogs/create'] },
]

function isActive(pathname: string, item: NavItem) {
  if (item.href === '/admin/blogs') return pathname === '/admin/blogs'
  return item.match.some((prefix) => pathname.startsWith(prefix))
}

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" className="size-3" fill="none" viewBox="0 0 16 16">
      <path d="M3 13 13 3M5 3h8v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  )
}

/** Quiet holding page while the refresh cookie is exchanged for a session. */
function AdminBoot() {
  return (
    <main className="grid min-h-screen place-items-center bg-inkwell-950 px-6">
      <div className="w-full max-w-sm">
        <p className="eyebrow flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-inkwell-brass/70" />
          Private workspace
        </p>
        <p className="mt-5 font-display text-3xl text-inkwell-cream">Opening the desk.</p>
        <div className="mt-7 space-y-3">
          <div className="skeleton-shimmer h-2 w-full" />
          <div className="skeleton-shimmer h-2 w-4/5" />
          <div className="skeleton-shimmer h-2 w-2/3" />
        </div>
      </div>
    </main>
  )
}

/**
 * Shared chrome for every admin screen, set like the back office of the same
 * journal: a ruled masthead, a running nav, and a display heading that sits on
 * the same shell as the public pages.
 */
export function AdminFrame({
  title,
  eyebrow,
  description,
  children,
}: {
  title: string
  eyebrow: string
  description?: string
  children: ReactNode
}) {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const location = useLocation()
  const [bootSettled, setBootSettled] = useState(() => Boolean(token))

  useSeo({
    title: `${title} — ${SITE_NAME} Admin`,
    description: 'Private Inkwell admin workspace. Not indexed.',
    path: location.pathname,
    noIndex: true,
  })

  useEffect(() => {
    if (token || bootSettled) return
    void ensureSession().finally(() => setBootSettled(true))
  }, [token, bootSettled])

  if (!token) {
    if (!bootSettled) return <AdminBoot />
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'admin') return <Navigate to="/" replace />

  const signedInAs = user?.username?.trim()

  return (
    <main className="min-h-screen bg-inkwell-950">
      <header className="sticky top-0 z-50 border-b border-inkwell-rule bg-inkwell-950/92 backdrop-blur-md">
        <div className="mx-auto max-w-[86rem] px-5 sm:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link to="/admin/blogs" className="flex shrink-0 items-center gap-2.5">
              <BrandLogo size="sm" />
              <span className="font-display text-lg leading-none text-inkwell-cream">Inkwell</span>
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-inkwell-brass sm:inline">
                / Workspace
              </span>
            </Link>

            <nav aria-label="Admin sections" className="hidden items-center gap-7 md:flex">
              {NAV_ITEMS.map((item) => {
                const active = isActive(location.pathname, item)
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    data-active={active || undefined}
                    aria-current={active ? 'page' : undefined}
                    className="masthead-link"
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                to="/"
                className="link-rule inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-inkwell-brass transition hover:text-inkwell-cream"
              >
                View journal <ArrowUpRight />
              </Link>
            </div>
          </div>

          {/* Small screens get the same running nav, on its own rule. */}
          <nav aria-label="Admin sections" className="flex gap-6 overflow-x-auto border-t border-inkwell-rule py-2.5 md:hidden">
            {NAV_ITEMS.map((item) => {
              const active = isActive(location.pathname, item)
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  data-active={active || undefined}
                  aria-current={active ? 'page' : undefined}
                  className="masthead-link shrink-0"
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[86rem] px-5 pb-4 pt-12 sm:px-8 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-6 border-b border-inkwell-rule pb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-10"
        >
          <div className="min-w-0">
            <p className="eyebrow flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-6 bg-inkwell-brass/70" />
              {eyebrow}
            </p>
            <h1 className="display mt-5 text-[clamp(2.4rem,5.2vw,4.25rem)] text-inkwell-cream">{title}</h1>
            {description && (
              <p className="mt-4 max-w-xl font-serif text-base leading-8 text-inkwell-muted sm:text-lg">
                {description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-6 sm:flex-col sm:items-end sm:gap-1.5">
            <span className="folio">The desk · {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            {signedInAs && <span className="folio hidden text-inkwell-brass sm:block">Signed in as {signedInAs}</span>}
          </div>
        </motion.div>
      </div>

      <div className="mx-auto max-w-[86rem] px-5 pb-20 pt-10 sm:px-8 sm:pb-24">{children}</div>
    </main>
  )
}

export function AdminCreatePage() {
  const token = useAuthStore((state) => state.token)
  const navigate = useNavigate()
  return (
    <AdminFrame
      title="Write an entry."
      eyebrow="Private workspace"
      description="Set the title, choose the cover, and write the piece. It can stay a draft for as long as it needs."
    >
      <AdminBlogForm token={token ?? ''} onSaved={() => navigate('/admin/blogs/manage')} />
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
    <AdminFrame
      title="Your entries."
      eyebrow="Private workspace"
      description="Every published piece and unfinished draft, filed in one place."
    >
      {query.isLoading ? (
        <div className="space-y-0">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="skeleton-shimmer h-[5.4rem] border-t border-inkwell-rule" />
          ))}
        </div>
      ) : query.isError ? (
        <div className="border-y border-inkwell-rule py-14 text-center" role="alert">
          <p className="font-display text-2xl text-inkwell-cream">The entries could not be loaded.</p>
          <p className="mt-3 font-serif text-sm text-inkwell-muted">Check your connection and try again.</p>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="link-rule mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-inkwell-brass"
          >
            Try again
          </button>
        </div>
      ) : (
        <AdminBlogManager token={token ?? ''} blogs={query.data?.data ?? []} />
      )}
    </AdminFrame>
  )
}

export function AdminEditPage() {
  const token = useAuthStore((state) => state.token)
  const { blogId } = useParams()
  const navigate = useNavigate()
  const query = useQuery({
    queryKey: ['blog', 'admin', blogId],
    queryFn: () => getAdminBlogBySlug(token ?? '', blogId ?? ''),
    enabled: Boolean(token && blogId),
  })
  return (
    <AdminFrame
      title="Revise the entry."
      eyebrow="Private workspace"
      description="Changes go live the moment you save them. Nothing is lost if you close the tab."
    >
      {query.isLoading ? (
        <div className="space-y-10">
          <div className="skeleton-shimmer h-16 w-3/4" />
          <div className="skeleton-shimmer h-10 w-1/2" />
          <div className="skeleton-shimmer h-80" />
        </div>
      ) : query.data?.data ? (
        <AdminBlogForm
          key={query.data.data.id}
          token={token ?? ''}
          blog={query.data.data}
          onSaved={() => navigate('/admin/blogs/manage')}
        />
      ) : (
        <div className="border-y border-inkwell-rule py-14 text-center">
          <p className="font-display text-2xl text-inkwell-cream">The entry could not be opened.</p>
          <p className="mt-3 font-serif text-sm text-inkwell-muted">
            It may have been deleted, or the link is no longer valid.
          </p>
          <Link
            to="/admin/blogs/manage"
            className="link-rule mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-inkwell-brass"
          >
            Back to entries
          </Link>
        </div>
      )}
    </AdminFrame>
  )
}
