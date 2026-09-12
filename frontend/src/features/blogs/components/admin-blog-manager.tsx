import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";
import { deleteBlog } from "../api/blog-api";
import type { Blog } from "../types";

type Props = { token: string; blogs: Blog[] };

export function AdminBlogManager({ token, blogs }: Props) {
  const queryClient = useQueryClient();
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBlog(token, id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setSelectedBlog(null);
    },
  });

  const handleDelete = () => {
    if (!selectedBlog) return;

    deleteMutation.mutate(selectedBlog.id);
  };

  return (
    <>
      <section className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-inkwell-cream/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-inkwell-gold">
              Content
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-inkwell-cream">
              Manage Blogs
            </h2>

            <p className="mt-1 text-sm text-inkwell-cream/50">
              Create, edit and manage your published content.
            </p>
          </div>

          <span className="w-fit rounded-full border border-inkwell-cream/10 bg-inkwell-950/60 px-3 py-1 text-xs font-medium text-inkwell-cream/60">
            {blogs.length} {blogs.length === 1 ? "blog" : "blogs"}
          </span>
        </div>

        {/* Blog list */}
        <div className="overflow-hidden rounded-2xl border border-inkwell-cream/10 bg-inkwell-950/40">
          {/* Desktop header */}
          <div className="hidden grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-4 border-b border-inkwell-cream/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-inkwell-cream/40 sm:grid">
            <span>#</span>
            <span>Blog</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-inkwell-cream/10">
            {blogs.map((blog, index) => (
              <article
                key={blog.id}
                className="group p-4 transition hover:bg-inkwell-cream/[0.025] sm:grid sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:px-5"
              >
                {/* Number */}
                <div className="mb-3 hidden text-xs font-medium tabular-nums text-inkwell-cream/25 sm:mb-0 sm:block">
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* Blog information */}
                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 hidden h-2 w-2 shrink-0 rounded-full bg-inkwell-gold/70 sm:block" />

                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/blogs/${blog.slug}`}
                        className="block truncate text-sm font-semibold text-inkwell-cream transition group-hover:text-inkwell-gold sm:text-[15px]"
                      >
                        {blog.title}
                      </Link>

                      <p className="mt-1 truncate text-xs text-inkwell-cream/35">
                        /{blog.slug}
                      </p>
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
              </article>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {blogs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-inkwell-cream/15 px-6 py-14 text-center">
            <p className="text-sm font-medium text-inkwell-cream/60">
              No blogs yet
            </p>

            <p className="mt-1 text-xs text-inkwell-cream/35">
              Your created blogs will appear here.
            </p>
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {selectedBlog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          onClick={() => {
            if (!deleteMutation.isPending) {
              setSelectedBlog(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-blog-title"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-inkwell-cream/10 bg-inkwell-950 shadow-2xl shadow-black/40"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal accent */}
            <div className="h-1 w-full bg-red-400/80" />

            <div className="p-5 sm:p-6">
              {/* Icon */}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-300/20 bg-red-300/10 text-red-300">
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
                className="mt-5 text-lg font-bold tracking-tight text-inkwell-cream"
              >
                Delete this blog?
              </h2>

              <p className="mt-2 text-sm leading-6 text-inkwell-cream/55">
                You're about to permanently delete{" "}
                <span className="font-semibold text-inkwell-cream/85">
                  "{selectedBlog.title}"
                </span>
                . This action cannot be undone.
              </p>

              {/* Actions */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBlog(null)}
                  disabled={deleteMutation.isPending}
                  className="h-10 rounded-lg border border-inkwell-cream/15 px-4 text-sm font-semibold text-inkwell-cream/70 transition hover:border-inkwell-cream/25 hover:bg-inkwell-cream/5 hover:text-inkwell-cream disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="h-10 rounded-lg bg-red-400 px-4 text-sm font-semibold text-inkwell-950 transition hover:bg-red-300 disabled:cursor-wait disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Deleting…" : "Delete blog"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
