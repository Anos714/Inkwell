import { motion } from 'motion/react'
import { Link, Navigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '../api/blog-api'
import { useAuthStore } from '../../auth/store/auth-store'
import { AdminFrame } from './admin-pages'

/* ── Stat icons (draw in on view) ───────────────────────────────────────────── */

function LayersIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-full" fill="none">
      <motion.path
        d="M16 5 28 11l-12 6L4 11l12-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />
      <motion.path
        d="M4 16l12 6 12-6M4 21l12 6 12-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.3 }}
      />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-full" fill="none">
      <motion.path
        d="M22 5 5 14l7 3 3 7 7-19Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />
      <motion.path
        d="M12 17 22 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.45 }}
      />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-full" fill="none">
      <motion.path
        d="M21 5 27 11 11 27H5v-6L21 5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />
      <motion.path
        d="M18 8l6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.45 }}
      />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-full" fill="none">
      <motion.path
        d="M3 16s5-8 13-8 13 8 13 8-5 8-13 8-13-8-13-8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="16" cy="16" r="3.5" stroke="currentColor" strokeWidth="1.6"
        initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-full" fill="none">
      <motion.path
        d="M16 27S4 20 4 12.5A5 5 0 0 1 16 10a5 5 0 0 1 12 2.5C28 20 16 27 16 27Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-full" fill="none">
      <motion.path
        d="M5 8h22v14H12l-5 5v-5H5V8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />
      <motion.path
        d="M11 14h10M11 18h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.45 }}
      />
    </svg>
  )
}

/* ── Stat card with count-up ────────────────────────────────────────────────── */

function CountUp({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      {value.toLocaleString()}
    </motion.span>
  )
}

function StatCard({
  icon,
  label,
  value,
  detail,
  index,
}: {
  icon: React.ReactNode
  label: string
  value: number
  detail: string
  index: number
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 22, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-3xl border border-inkwell-cream/10 bg-inkwell-900/45 p-6 transition duration-300 hover:-translate-y-1 hover:border-inkwell-gold/40 sm:p-7"
    >
      <div className="pointer-events-none absolute -right-14 -top-14 size-32 rounded-full bg-inkwell-gold/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative mb-6 grid size-11 place-items-center rounded-2xl border border-inkwell-gold/25 bg-inkwell-gold/5 text-inkwell-gold">
        {icon}
      </div>

      <p className="relative font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-dim">
        {label}
      </p>
      <p className="relative mt-3 font-display text-4xl text-inkwell-cream sm:text-5xl">
        <CountUp value={value} />
      </p>
      <p className="relative mt-2.5 text-xs leading-6 text-inkwell-muted">{detail}</p>
    </motion.article>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────────── */

export function AdminDashboard() {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => getDashboardSummary(token ?? ''),
    enabled: Boolean(token && user?.role === 'admin'),
  })

  if (!token || user?.role !== 'admin') return <Navigate to="/" replace />

  const summary = summaryQuery.data?.data

  const stats = summary
    ? [
        { icon: <LayersIcon />, label: 'All entries', value: summary.totalBlogs, detail: 'Published posts and private drafts' },
        { icon: <SendIcon />, label: 'Published', value: summary.publishedBlogs, detail: 'Visible in the public journal' },
        { icon: <PencilIcon />, label: 'Drafts', value: summary.draftBlogs, detail: 'Ready for your next editing session' },
        { icon: <EyeIcon />, label: 'Views', value: summary.totalViews, detail: 'Total article reads recorded' },
        { icon: <HeartIcon />, label: 'Likes', value: summary.totalLikes, detail: 'Appreciation across every entry' },
        { icon: <CommentIcon />, label: 'Comments', value: summary.totalComments, detail: 'Reader contributions to the journal' },
      ]
    : []

  return (
    <AdminFrame title="Admin dashboard." eyebrow="Private workspace">
      <p className="-mt-6 mb-12 max-w-xl text-sm leading-7 text-inkwell-muted">
        A live picture of your journal, its readers, and the conversations around it.
      </p>

      {summaryQuery.isError && (
        <p className="mb-8 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-200">
          The dashboard data could not be loaded. Please try again.
        </p>
      )}

      {summaryQuery.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="skeleton-shimmer h-44 rounded-3xl" />
          ))}
        </div>
      )}

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} index={index} {...stat} />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mt-16 flex flex-col gap-5 overflow-hidden rounded-3xl border border-inkwell-gold/20 bg-inkwell-900/50 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-inkwell-gold/10 blur-3xl" />
        <div className="relative">
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">
            Workspace actions
          </p>
          <h2 className="mt-2 font-display text-2xl text-inkwell-cream sm:text-3xl">
            Keep the journal moving.
          </h2>
          <p className="mt-2 text-sm text-inkwell-muted">
            Write something new or refine an existing entry.
          </p>
        </div>
        <div className="relative flex flex-col gap-3 sm:flex-row">
          <Link
            to="/admin/blogs/create"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-inkwell-gold px-6 py-3 text-sm font-bold text-inkwell-950 transition duration-300 hover:-translate-y-0.5 hover:bg-inkwell-light hover:shadow-lg hover:shadow-inkwell-gold/20"
          >
            Create entry <span>→</span>
          </Link>
          <Link
            to="/admin/blogs/manage"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-inkwell-gold/60 px-6 py-3 text-sm font-semibold text-inkwell-gold transition duration-300 hover:-translate-y-0.5 hover:bg-inkwell-gold/10"
          >
            Manage entries <span>→</span>
          </Link>
        </div>
      </motion.div>
    </AdminFrame>
  )
}
