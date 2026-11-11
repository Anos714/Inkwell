import { motion } from 'motion/react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '../api/blog-api'
import { useAuthStore } from '../../auth/store/auth-store'
import { AdminFrame } from './admin-pages'

/* ── Stat icons (drawn in the same line as the public page) ─────────────────── */

function LayersIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-full" fill="none">
      <motion.path
        d="M16 5 28 11l-12 6L4 11l12-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />
      <motion.path
        d="M4 16l12 6 12-6M4 21l12 6 12-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
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
        d="M22 5 5 14l7 3 3 7 7-19Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />
      <motion.path
        d="M12 17 22 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
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
        d="M21 5 27 11 11 27H5v-6L21 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />
      <motion.path
        d="M18 8l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
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
        d="M3 16s5-8 13-8 13 8 13 8-5 8-13 8-13-8-13-8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="16" cy="16" r="3.5" stroke="currentColor" strokeWidth="1.5"
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
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
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
        d="M5 8h22v14H12l-5 5v-5H5V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />
      <motion.path
        d="M11 14h10M11 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.45 }}
      />
    </svg>
  )
}

/* ── Ledger cell ────────────────────────────────────────────────────────────── */

function CountUp({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      {value.toLocaleString()}
    </motion.span>
  )
}

function LedgerCell({
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="border-t border-inkwell-rule py-7 pr-5 sm:pr-8"
    >
      <div className="flex items-center gap-2.5 text-inkwell-brass/85">
        <span aria-hidden="true" className="size-4">{icon}</span>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-inkwell-dim">{label}</p>
      </div>

      <p className="mt-5 font-display text-[2.9rem] leading-none tracking-[-0.03em] text-inkwell-cream sm:text-5xl">
        <CountUp value={value} />
      </p>
      <p className="mt-3 max-w-[22ch] font-serif text-[0.8rem] leading-5 text-inkwell-muted">{detail}</p>
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

  const summary = summaryQuery.data?.data

  const stats = summary
    ? [
        { icon: <LayersIcon />, label: 'All entries', value: summary.totalBlogs, detail: 'Published pieces and private drafts' },
        { icon: <SendIcon />, label: 'Published', value: summary.publishedBlogs, detail: 'Visible in the public journal' },
        { icon: <PencilIcon />, label: 'Drafts', value: summary.draftBlogs, detail: 'Waiting for another pass' },
        { icon: <EyeIcon />, label: 'Views', value: summary.totalViews, detail: 'Reads recorded across the journal' },
        { icon: <HeartIcon />, label: 'Likes', value: summary.totalLikes, detail: 'Appreciation from readers' },
        { icon: <CommentIcon />, label: 'Comments', value: summary.totalComments, detail: 'Notes left in the margin' },
      ]
    : []

  return (
    <AdminFrame
      title="Admin dashboard."
      eyebrow="Private workspace"
      description="A live picture of the journal, its readers, and the conversations around it."
    >
      {summaryQuery.isError && (
        <p className="danger-card danger-title mb-8 p-4 font-serif text-sm">
          The dashboard data could not be loaded. Please try again.
        </p>
      )}

      {summaryQuery.isLoading && (
        <div className="grid grid-cols-2 border-b border-inkwell-rule lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="border-t border-inkwell-rule py-7 pr-5 sm:pr-8">
              <div className="skeleton-shimmer h-2.5 w-24" />
              <div className="skeleton-shimmer mt-6 h-10 w-28" />
              <div className="skeleton-shimmer mt-4 h-2.5 w-36" />
            </div>
          ))}
        </div>
      )}

      {summary && (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pb-3">
            <p className="eyebrow">The ledger</p>
            <p className="folio">
              {String(summary.totalBlogs).padStart(2, '0')} entries ·{' '}
              {String(summary.publishedBlogs).padStart(2, '0')} in print ·{' '}
              {String(summary.draftBlogs).padStart(2, '0')} in the drawer
            </p>
          </div>

          <div className="grid grid-cols-2 border-b border-inkwell-rule lg:grid-cols-3">
            {stats.map((stat, index) => (
              <LedgerCell key={stat.label} index={index} {...stat} />
            ))}
          </div>
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="mt-14 flex flex-col gap-7 border-y border-inkwell-rule py-9 lg:flex-row lg:items-center lg:justify-between lg:gap-10"
      >
        <div>
          <p className="eyebrow">Workspace actions</p>
          <h2 className="display mt-3 text-3xl text-inkwell-cream sm:text-4xl">Keep the journal moving.</h2>
          <p className="mt-2.5 max-w-sm font-serif text-sm leading-7 text-inkwell-muted">
            Start something new, or return to the shelf and refine what is already there.
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
          <Link
            to="/admin/blogs/create"
            className="group inline-flex items-center gap-2.5 rounded-full bg-inkwell-cream px-6 py-3 text-sm font-semibold text-inkwell-950 transition duration-300 hover:-translate-y-0.5 hover:bg-inkwell-brass"
          >
            Write a new entry
            <span aria-hidden="true" className="transition duration-300 group-hover:translate-x-0.5">→</span>
          </Link>
          <Link
            to="/admin/blogs/manage"
            className="link-rule font-mono text-[10px] uppercase tracking-[0.18em] text-inkwell-muted transition hover:text-inkwell-cream"
          >
            Manage entries
          </Link>
        </div>
      </motion.div>
    </AdminFrame>
  )
}
