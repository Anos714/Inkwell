import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getBlogTags, getPublishedBlogs, type BlogSort } from "../api/blog-api";
import { ElegantMenu } from "../../../components/elegant-menu";
import { BlogGridSkeleton } from "./blog-skeleton";
import { ThemeToggle } from "../../../components/theme-toggle";
import { BrandLogo } from "../../../components/brand-logo";
import { useSeo } from "../../../hooks/use-seo";
import {
  SITE_NAME,
  breadcrumbJsonLd,
} from "../../../lib/seo";

export function BlogListPage() {
  useSeo({
    title: `All posts — ${SITE_NAME}`,
    description:
      "Browse every published story, essay and note on Inkwell — searchable by title and topic.",
    path: "/blogs",
    jsonLd: [
      breadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: "All posts", url: "/blogs" },
      ]),
    ],
  });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState<BlogSort>("latest");
  const [page, setPage] = useState(1);
  const limit = 9;
  const blogsQuery = useQuery({
    queryKey: ["blogs", "all", { search, tag, sort, page, limit }],
    queryFn: () => getPublishedBlogs({ search, tag, sort, page, limit }),
  });
  const blogs = blogsQuery.data?.data ?? [];
  const pagination = blogsQuery.data?.pagination;
  const tagsQuery = useQuery({
    queryKey: ["blogs", "tags"],
    queryFn: getBlogTags,
    staleTime: 5 * 60_000,
  });
  const tags = tagsQuery.data?.data ?? [];

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const hasFilters = Boolean(search || tag || sort !== "latest");
  const clearAll = () => {
    setSearchInput("");
    setSearch("");
    setTag("");
    setSort("latest");
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-inkwell-950 text-inkwell-cream">
      <header className="border-b border-inkwell-cream/10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <BrandLogo />
            <span className="font-display text-xl">Inkwell</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              to="/"
              className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold hover:text-inkwell-light"
            >
              ← Home
            </Link>
          </div>
        </nav>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="flex flex-col justify-between gap-8 border-b border-inkwell-cream/10 pb-10 md:flex-row md:items-end">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">
              The complete journal
            </span>
            <h1 className="mt-4 font-display text-5xl sm:text-6xl">
              All posts.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-inkwell-muted">
              Search through essays, experiments, and notes from the desk.
            </p>
          </div>
          <div className="w-full md:max-w-sm">
            <label className="block">
              <span className="sr-only">Search posts</span>
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search title or description…"
                className="w-full rounded-xl border border-inkwell-cream/15 bg-inkwell-900/70 px-4 py-3 text-sm text-inkwell-cream outline-none placeholder:text-inkwell-dim focus:border-inkwell-gold"
              />
            </label>
            <div className="mt-3 flex items-center gap-3">
              <ElegantMenu
                label="Sort posts"
                variant="field"
                value={sort}
                options={[
                  { value: 'latest', label: 'Latest first' },
                  { value: 'oldest', label: 'Oldest first' },
                  { value: 'most_viewed', label: 'Most viewed' },
                ]}
                onChange={(next) => {
                  setSort(next);
                  setPage(1);
                }}
                className="flex-1"
              />
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="shrink-0 rounded-full border border-inkwell-cream/15 px-4 py-2 text-xs text-inkwell-muted transition hover:border-inkwell-gold/60 hover:text-inkwell-gold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
        {tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
            <button
              type="button"
              onClick={() => {
                setTag("");
                setPage(1);
              }}
              aria-pressed={!tag}
              className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition ${
                !tag
                  ? "border-inkwell-gold bg-inkwell-gold text-inkwell-950"
                  : "border-inkwell-cream/15 text-inkwell-muted hover:border-inkwell-gold/60 hover:text-inkwell-gold"
              }`}
            >
              All
            </button>
            {tags.map((item) => (
              <button
                key={item.tag}
                type="button"
                onClick={() => {
                  setTag((current) => (current === item.tag ? "" : item.tag));
                  setPage(1);
                }}
                aria-pressed={tag === item.tag}
                className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition ${
                  tag === item.tag
                    ? "border-inkwell-gold bg-inkwell-gold text-inkwell-950"
                    : "border-inkwell-cream/15 text-inkwell-muted hover:border-inkwell-gold/60 hover:text-inkwell-gold"
                }`}
              >
                #{item.tag} · {item.count}
              </button>
            ))}
          </div>
        )}
        {blogsQuery.isLoading && (
          <div className="mt-12">
            <BlogGridSkeleton count={6} />
          </div>
        )}
        {blogsQuery.isError && (
          <div className="py-16 text-center" role="alert">
            <p className="text-sm text-red-300">
              The journal could not be loaded. Please try again.
            </p>
            <button
              type="button"
              onClick={() => blogsQuery.refetch()}
              className="mt-4 rounded-full border border-inkwell-gold/60 px-5 py-2 text-sm font-semibold text-inkwell-gold transition hover:bg-inkwell-gold hover:text-inkwell-950"
            >
              Retry
            </button>
          </div>
        )}
        {!blogsQuery.isLoading && !blogs.length && (
          <div className="mt-12 rounded-2xl border border-dashed border-inkwell-cream/15 p-10 text-center">
            <p className="font-display text-2xl">No entries found.</p>
            <p className="mt-3 text-sm text-inkwell-muted">
              Try a different search or clear the filters.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-inkwell-gold/60 px-5 py-2.5 text-sm font-semibold text-inkwell-gold transition hover:bg-inkwell-gold hover:text-inkwell-950"
              >
                Clear search & filters
              </button>
            )}
          </div>
        )}
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <article
              key={blog.id}
              className="group overflow-hidden rounded-2xl border border-inkwell-cream/10 bg-inkwell-900/40 shadow-[0_2px_16px_-8px_rgb(0_0_0/0.35)] transition duration-300 hover:-translate-y-0.5 hover:border-inkwell-gold/40 hover:shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)]"
            >
              {blog.coverImage && (
                <img
                  src={blog.coverImage}
                  alt={`${blog.title} — cover image`}
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={450}
                  className="aspect-[16/9] w-full object-cover opacity-90 transition duration-500 group-hover:opacity-100"
                />
              )}
              <Link to={`/blogs/${blog.slug}`} className="block p-6">
                <div className="flex flex-wrap gap-2">
                  {blog.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] uppercase tracking-wider text-inkwell-gold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <h2 className="mt-4 font-display text-2xl leading-tight">
                  {blog.title}
                </h2>
                {blog.description && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-inkwell-muted">
                    {blog.description}
                  </p>
                )}
                <p className="mt-6 font-mono text-[10px] uppercase tracking-wider text-inkwell-dim">
                  {new Date(
                    blog.publishedAt ?? blog.createdAt,
                  ).toLocaleDateString()}
                </p>
              </Link>
            </article>
          ))}
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              type="button"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border border-inkwell-cream/15 px-4 py-2 text-sm text-inkwell-muted transition hover:border-inkwell-gold hover:text-inkwell-gold disabled:opacity-40"
            >
              ← Previous
            </button>
            <span className="font-mono text-xs text-inkwell-dim">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-inkwell-cream/15 px-4 py-2 text-sm text-inkwell-muted transition hover:border-inkwell-gold hover:text-inkwell-gold disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
