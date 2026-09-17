import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { deleteBlog } from '../api/blog-api'
import type { Blog } from '../types'

type Props = { token: string; blogs: Blog[] }

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" className="size-3.5" fill="none" viewBox="0 0 16 16">
      <path d="M3 13 13 3M5 3h8v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  )
}

export function AdminBlogManager({ token, blogs }: Props) {
  const queryClient = useQueryClient()
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBlog(token, id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      setSelectedBlog(null)
    },
  })

  const handleDelete = () => {
    if (!selectedBlog) return

    deleteMutation.mutate(selectedBlog.id)
  }

  return (
    <>
      <section className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-inkwell-cream/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl text-inkwell-cream sm:text-3xl">
              All entries
            </h2>

            <p className="mt-2 text-sm text-inkwell-muted">
              Create, edit and manage your published content and drafts.
            </p>
          </div>

          <Link
            to="/admin/blogs/create"
            className="group inline-flex w-fit items-center gap-2 rounded-xl bg-inkwell-gold px-5 py-2.5 text-sm font-bold text-inkwell-950 transition duration-300 hover:-translate-y-0.5 hover:bg-inkwell-light"
          >
            New entry <ArrowUpRight />
          </Link>
        </div>

        {/* Blog list */}
        <div className="overflow-hidden rounded-3xl border border-inkwell-cream/10 bg-inkwell-900/40">
          {/* Desktop header */}
          <div className="hidden grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-4 border-b border-inkwell-cream/10 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-inkwell-dim sm:grid">
            <span>#</span>
            <span>Entry</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-inkwell-cream/10">
            {blogs.map((blog, index) => (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
                className="group p-4 transition duration-300 hover:bg-inkwell-cream/[0.025] sm:grid sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:px-6"
              >
                {/* Number */}
                <div className="mb-3 hidden text-xs font-medium tabular-nums text-inkwell-dim sm:mb-0 sm:block">
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Blog information */}
                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 hidden h-2 w-2 shrink-0 rounded-full bg-inkwell-gold/70 sm:block" />

                    <div className="min-w-0 flex-1">
                      <Link
                        to={
                          blog.isPublished
                            ? `/blogs/${blog.slug}`
                            : `/admin/blogs/edit/${blog.slug}`
                        }
                        className="block truncate text-sm font-semibold text-inkwell-cream transition group-hover:text-inkwell-gold sm:text-[15px]"
                      >
                        {blog.title}
                      </Link>

                      <div className="mt-1.5 flex items-center gap-2">
                        <p className="truncate font-mono text-[10px] text-inkwell-dim">
                          /{blog.slug}
                        </p>

                        {!blog.isPublished && (
                          <span className="shrink-0 rounded-full border border-inkwell-gold/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-inkwell-gold">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2 sm:mt-0">
                  <Link
                    to={`/admin/blogs/edit/${blog.slug}`}
                    className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-inkwell-gold/40 px-4 text-xs font-semibold text-inkwell-gold transition hover:border-inkwell-gold hover:bg-inkwell-gold hover:text-inkwell-950 sm:min-w-20 sm:flex-none"
                  >
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() => setSelectedBlog(blog)}
                    className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-red-300/30 px-4 text-xs font-semibold text-red-300 transition hover:border-red-300 hover:bg-red-300 hover:text-inkwell-950 sm:min-w-20 sm:flex-none"
                  >
                    Delete
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {blogs.length === 0 && (
          <div className="rounded-3xl border border-dashed border-inkwell-cream/15 px-6 py-16 text-center">
            <p className="font-display text-2xl text-inkwell-cream">No entries yet</p>
            <p className="mt-3 text-sm text-inkwell-muted">
              Your published posts and drafts will appear here.
            </p>
            <Link
              to="/admin/blogs/create"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-inkwell-gold px-5 py-2.5 text-sm font-bold text-inkwell-950 transition hover:bg-inkwell-light"
            >
              Write the first entry <ArrowUpRight />
            </Link>
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {selectedBlog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          onClick={() => {
            if (!deleteMutation.isPending) {
              setSelectedBlog(null)
            }
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-blog-title"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md overflow-hidden rounded-3xl border border-inkwell-cream/10 bg-inkwell-950 shadow-2xl shadow-black/40"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal accent */}
            <div className="h-1 w-full bg-red-400/80" />

            <div className="p-6 sm:p-7">
              {/* Icon */}
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-300/20 bg-red-300/10 text-red-300">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M10.3 3.7 2.8 17a2 2 0 0 0 1.75 3h14.9a2 2 0 0 0 1.75-3L13.7 3.7a2 2 0 0 0-3.4 0Z"
                  />
                </svg>
              </div>

              <h2
                id="delete-blog-title"
                className="mt-5 font-display text-2xl tracking-tight text-inkwell-cream"
              >
                Delete this entry?
              </h2>

              <p className="mt-3 text-sm leading-7 text-inkwell-muted">
                You're about to permanently delete{' '}
                <span className="font-semibold text-inkwell-cream">
                  "{selectedBlog.title}"
                </span>
                . This action cannot be undone.
              </p>

              {/* Actions */}
              <div className="mt-7 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBlog(null)}
                  disabled={deleteMutation.isPending}
                  className="h-10 rounded-xl border border-inkwell-cream/15 px-4 text-sm font-semibold text-inkwell-muted transition hover:border-inkwell-cream/25 hover:bg-inkwell-cream/5 hover:text-inkwell-cream disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="h-10 rounded-xl bg-red-400 px-4 text-sm font-semibold text-inkwell-950 transition hover:bg-red-300 disabled:cursor-wait disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Deleting…' : 'Delete entry'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
