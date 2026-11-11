import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { deleteBlog } from '../api/blog-api'
import type { Blog } from '../types'

type Props = { token: string; blogs: Blog[] }

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" className="size-3.5" fill="none" viewBox="0 0 16 16">
      <path d="M3 13 13 3M5 3h8v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
    </svg>
  )
}

/**
 * The shelf of entries, set as a printed index: number, title, slug, and the
 * two quiet actions. No cards, no chrome — the writing is the interface.
 */
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

  useEffect(() => {
    if (!selectedBlog) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !deleteMutation.isPending) setSelectedBlog(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedBlog, deleteMutation.isPending])

  const published = blogs.filter((blog) => blog.isPublished).length
  const drafts = blogs.length - published

  return (
    <>
      <section>
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <p className="folio">
            {String(blogs.length).padStart(2, '0')} entries ·{' '}
            {String(published).padStart(2, '0')} published ·{' '}
            {String(drafts).padStart(2, '0')} in the drawer
          </p>

          <Link
            to="/admin/blogs/create"
            className="group inline-flex items-center gap-2 rounded-full bg-inkwell-cream px-5 py-2.5 text-sm font-semibold text-inkwell-950 transition duration-300 hover:-translate-y-0.5 hover:bg-inkwell-brass"
          >
            New entry
            <span aria-hidden="true" className="transition duration-300 group-hover:translate-x-0.5">
              <ArrowUpRight />
            </span>
          </Link>
        </div>

        {blogs.length === 0 ? (
          <div className="border-y border-dashed border-inkwell-rule px-4 py-16 text-center">
            <p className="font-display text-3xl text-inkwell-cream">The shelf is empty.</p>
            <p className="mt-3 font-serif text-sm text-inkwell-muted">
              Published pieces and drafts will be filed here.
            </p>
            <Link
              to="/admin/blogs/create"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-inkwell-cream px-5 py-2.5 text-sm font-semibold text-inkwell-950 transition hover:bg-inkwell-brass"
            >
              Write the first entry <ArrowUpRight />
            </Link>
          </div>
        ) : (
          <ol className="border-b border-inkwell-rule">
            {blogs.map((blog, index) => (
              <motion.li
                key={blog.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: Math.min(index * 0.035, 0.3), ease: [0.22, 1, 0.36, 1] }}
                className="group border-t border-inkwell-rule"
              >
                <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 gap-y-3 py-5 transition-colors duration-300 group-hover:bg-inkwell-brass/[0.03] sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-x-6 sm:py-6">
                  <span className="index-row__num pt-1 sm:pt-0">{String(index + 1).padStart(2, '0')}</span>

                  <div className="min-w-0">
                    <Link
                      to={blog.isPublished ? `/blogs/${blog.slug}` : `/admin/blogs/edit/${blog.slug}`}
                      className="line-clamp-2 font-display text-xl leading-snug tracking-[-0.01em] text-inkwell-cream transition duration-300 group-hover:text-inkwell-brass sm:line-clamp-1 sm:text-2xl"
                    >
                      {blog.title}
                    </Link>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="truncate font-mono text-[9px] tracking-[0.04em] text-inkwell-dim">
                        /{blog.slug}
                      </span>
                      {!blog.isPublished && (
                        <span className="shrink-0 border border-inkwell-brass/40 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-inkwell-brass">
                          Draft
                        </span>
                      )}
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-inkwell-dim">
                        {blog.views.toLocaleString()} reads
                      </span>
                    </div>
                  </div>

                  <div className="col-start-2 flex items-center gap-5 sm:col-start-auto sm:justify-end">
                    <Link
                      to={`/admin/blogs/edit/${blog.slug}`}
                      className="link-rule font-mono text-[10px] uppercase tracking-[0.16em] text-inkwell-muted transition hover:text-inkwell-cream"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelectedBlog(blog)}
                      className="font-mono text-[10px] uppercase tracking-[0.16em] text-inkwell-dim transition hover:text-[#c25a54]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        )}
      </section>

      {selectedBlog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!deleteMutation.isPending) setSelectedBlog(null)
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-blog-title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md border border-inkwell-rule bg-inkwell-950 shadow-2xl shadow-black/40"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="h-[3px] w-full bg-[#b3261e]/70" />

            <div className="p-7 sm:p-8">
              <p className="danger-eyebrow font-mono text-[10px] uppercase tracking-[0.2em]">
                Destructive action
              </p>

              <h2 id="delete-blog-title" className="display mt-4 text-3xl text-inkwell-cream">
                Delete this entry?
              </h2>

              <p className="mt-4 font-serif text-base leading-8 text-inkwell-muted">
                <span className="text-inkwell-cream">&ldquo;{selectedBlog.title}&rdquo;</span> will be
                removed from the journal for good. This cannot be undone.
              </p>

              {deleteMutation.isError && (
                <p className="danger-error mt-4 font-serif text-sm" role="alert">
                  The entry could not be deleted. Please try again.
                </p>
              )}

              <div className="mt-8 flex items-center justify-end gap-6">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setSelectedBlog(null)}
                  disabled={deleteMutation.isPending}
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-inkwell-muted transition hover:text-inkwell-cream disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Keep it
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="danger-solid rounded-full px-5 py-2.5 text-sm font-semibold disabled:cursor-wait disabled:opacity-50"
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
