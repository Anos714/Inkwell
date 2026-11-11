import { motion } from 'motion/react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getAdminBlogs, getDashboardSummary } from '../api/blog-api'
import { useAuthStore } from '../../auth/store/auth-store'
import { AdminFrame } from './admin-pages'
import {
  EditionDonut,
  ReadsChart,
  type EditionSlice,
  type EntryRead,
} from './dashboard-charts'

const numberFormat = new Intl.NumberFormat('en-GB')

function ledgerValue(value: number) {
  return numberFormat.format(value)
}

/* ── Ledger cell ────────────────────────────────────────────────────────────── */

function LedgerCell({
  index,
  label,
  value,
  detail,
}: {
  index: number
  label: string
  value: string
  detail: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="border-t border-inkwell-rule py-6 pr-4 sm:pr-6"
    >
      <div className="flex items-baseline gap-2.5">
        <span aria-hidden="true" className="font-mono text-[9px] tracking-[0.14em] text-inkwell-brass/80">
          {String(index + 1).padStart(2, '0')}
        </span>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-inkwell-dim">
          {label}
        </p>
      </div>

      <p className="mt-4 font-display text-[2.6rem] leading-none tracking-[-0.03em] text-inkwell-cream sm:text-[3.1rem]">
        {value}
      </p>
      <p className="mt-2.5 max-w-[24ch] font-serif text-[0.8rem] leading-5 text-inkwell-muted">
        {detail}
      </p>
    </motion.div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────────── */

export function AdminDashboard() {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const enabled = Boolean(token && user?.role === 'admin')

  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => getDashboardSummary(token ?? ''),
    enabled,
  })

  const entriesQuery = useQuery({
    queryKey: ['blogs', 'admin-dashboard'],
    queryFn: () => getAdminBlogs(token ?? ''),
    enabled,
  })

  const summary = summaryQuery.data?.data
  const entries = entriesQuery.data?.data

  const isLoading = summaryQuery.isLoading || entriesQuery.isLoading
  const hasError = summaryQuery.isError || entriesQuery.isError

  const chartEntries: EntryRead[] = (entries ?? [])
    .slice()
    .sort((a, b) => b.views - a.views)
    .slice(0, 6)
    .map((blog) => ({ title: blog.title, views: blog.views }))

  const editionSlices: EditionSlice[] = summary
    ? [
        { name: 'In print', value: summary.publishedBlogs, fill: 'var(--gold)' },
        { name: 'In the drawer', value: summary.draftBlogs, fill: 'url(#draft-hatch)' },
      ]
    : []

  const engagementRate =
    summary && summary.totalViews > 0
      ? ((summary.totalLikes + summary.totalComments) / summary.totalViews) * 100
      : 0

  const readsPerEntry =
    summary && summary.publishedBlogs > 0
      ? Math.round(summary.totalViews / summary.publishedBlogs)
      : 0

  const ledger = summary
    ? [
        {
          label: 'Reads',
          value: ledgerValue(summary.totalViews),
          detail: 'Recorded across every published piece',
        },
        {
          label: 'Appreciation',
          value: ledgerValue(summary.totalLikes),
          detail: 'Likes left in the margin',
        },
        {
          label: 'Marginal notes',
          value: ledgerValue(summary.totalComments),
          detail: 'Comments kept by readers',
        },
        {
          label: 'Engagement',
          value: `${engagementRate.toFixed(1)}%`,
          detail: 'Likes and notes per hundred reads',
        },
      ]
    : []

  return (
    <AdminFrame
      title="Admin dashboard."
      eyebrow="Private workspace"
      description="A live picture of the journal, its readers, and the conversations around it."
    >
      {hasError && (
        <div className="danger-card mb-10 px-4 py-4" role="alert">
          <p className="danger-title font-serif text-sm">
            The dashboard data could not be loaded. Please try again.
          </p>
        </div>
      )}

      {isLoading && (
        <div aria-hidden="true" className="space-y-14">
          <div className="grid grid-cols-2 border-b border-inkwell-rule lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="border-t border-inkwell-rule py-6 pr-4 sm:pr-6">
                <div className="skeleton-shimmer h-2.5 w-20" />
                <div className="skeleton-shimmer mt-6 h-10 w-28" />
                <div className="skeleton-shimmer mt-4 h-2.5 w-36" />
              </div>
            ))}
          </div>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <div>
              <div className="skeleton-shimmer h-2.5 w-24" />
              <div className="skeleton-shimmer mt-6 h-9 w-3/4" />
              <div className="skeleton-shimmer mt-8 h-72 w-full" />
            </div>
            <div>
              <div className="skeleton-shimmer h-2.5 w-24" />
              <div className="skeleton-shimmer mt-6 h-9 w-2/3" />
              <div className="skeleton-shimmer mt-8 h-44 w-44" />
            </div>
          </div>
        </div>
      )}

      {!isLoading && summary && (
        <>
          <section aria-labelledby="ledger-heading">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pb-3">
              <p className="eyebrow" id="ledger-heading">
                The ledger
              </p>
              <p className="folio">
                {String(summary.totalBlogs).padStart(2, '0')} entries ·{' '}
                {String(summary.publishedBlogs).padStart(2, '0')} in print ·{' '}
                {String(summary.draftBlogs).padStart(2, '0')} in the drawer
              </p>
            </div>

            <div className="grid grid-cols-2 border-b border-inkwell-rule lg:grid-cols-4">
              {ledger.map((stat, index) => (
                <LedgerCell key={stat.label} index={index} {...stat} />
              ))}
            </div>
          </section>

          <section aria-label="Readership charts" className="mt-14">
            <div className="grid gap-x-12 gap-y-14 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
              <motion.figure
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-inkwell-rule pt-3">
                  <p className="eyebrow">Readership</p>
                  <p className="folio">Top six by reads</p>
                </div>

                <h2 className="display mt-6 max-w-[18ch] text-[2.1rem] text-inkwell-cream sm:text-4xl">
                  Where the reading gathers.
                </h2>
                <p className="mt-3 max-w-md font-serif text-sm leading-7 text-inkwell-muted">
                  Each bar is one entry&rsquo;s recorded reads, from the most returned-to
                  piece down.
                </p>

                {chartEntries.length > 0 ? (
                  <div className="mt-7">
                    <ReadsChart data={chartEntries} />
                  </div>
                ) : (
                  <div className="mt-8 border-y border-dashed border-inkwell-rule px-4 py-14 text-center">
                    <p className="font-display text-2xl text-inkwell-cream">
                      No reads recorded yet.
                    </p>
                    <p className="mt-2 font-serif text-sm text-inkwell-muted">
                      Publish an entry and its readership will be drawn here.
                    </p>
                  </div>
                )}
              </motion.figure>

              <motion.figure
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-inkwell-rule pt-3">
                  <p className="eyebrow">The edition</p>
                  <p className="folio">Published &amp; pending</p>
                </div>

                <h2 className="display mt-6 max-w-[16ch] text-[2.1rem] text-inkwell-cream sm:text-4xl">
                  In print, in the drawer.
                </h2>
                <p className="mt-3 max-w-sm font-serif text-sm leading-7 text-inkwell-muted">
                  The whole shelf at a glance — what readers can find, and what is still
                  waiting for another pass.
                </p>

                <div className="mt-8">
                  <EditionDonut slices={editionSlices} total={summary.totalBlogs} />
                </div>

                <div className="mt-8 grid grid-cols-2 border-t border-inkwell-rule">
                  <div className="border-r border-inkwell-rule py-4 pr-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-inkwell-dim">
                      Reads per entry
                    </p>
                    <p className="mt-2 font-display text-2xl text-inkwell-cream">
                      {ledgerValue(readsPerEntry)}
                    </p>
                  </div>
                  <div className="py-4 pl-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-inkwell-dim">
                      Engagement
                    </p>
                    <p className="mt-2 font-display text-2xl text-inkwell-cream">
                      {engagementRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </motion.figure>
            </div>
          </section>
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="mt-16 flex flex-col gap-7 border-y border-inkwell-rule py-9 lg:flex-row lg:items-center lg:justify-between lg:gap-10"
      >
        <div>
          <p className="eyebrow">Workspace actions</p>
          <h2 className="display mt-3 text-3xl text-inkwell-cream sm:text-4xl">
            Keep the journal moving.
          </h2>
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
            <span aria-hidden="true" className="transition duration-300 group-hover:translate-x-0.5">
              →
            </span>
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
