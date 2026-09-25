import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
import {
  getBlogBySlug,
  getBlogLikeStatus,
  recordBlogView,
  toggleBlogLike,
} from "../api/blog-api";
import { useAuthStore } from "../../auth/store/auth-store";
import DOMPurify from "dompurify";
import { FaHeart, FaShareAlt } from "react-icons/fa";
import { FaListUl } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import { BlogDetailSkeleton } from "./blog-skeleton";
import { BlogComments } from "./blog-comments";
import { ThemeToggle } from "../../../components/theme-toggle";
import { BrandLogo } from "../../../components/brand-logo";
import { ShareModal } from "./share-modal";
import { TableOfContents } from "./table-of-contents";
import { ReadingProgressPill } from "./reading-progress-pill";
import {
  useActiveHeading,
  useHeadingToc,
} from "../hooks/use-heading-toc";
import { useReadingProgress } from "../hooks/use-reading-progress";

export function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const tocButtonRef = useRef<HTMLButtonElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  // Whichever control opened the TOC last, so focus can go straight back to it.
  const tocTriggerRef = useRef<HTMLElement | null>(null);
  const articleRef = useRef<HTMLDivElement>(null);
  const hasRecordedView = useRef(false);
  const queryClient = useQueryClient();

  // 1. Fetch Blog by Slug
  const blogQuery = useQuery({
    queryKey: ["blog", slug],
    queryFn: () => getBlogBySlug(slug ?? ""),
    enabled: Boolean(slug),
  });

  const blog = blogQuery.data?.data;
  const blogId = blog?.id;

  const viewMutation = useMutation({
    mutationFn: () => recordBlogView(slug ?? ""),
    onSuccess: (result) => {
      queryClient.setQueryData(
        ["blog", slug],
        (current: typeof blogQuery.data) =>
          current
            ? { ...current, data: { ...current.data, views: result.data.views } }
            : current,
      );
    },
  });

  // 2. Fetch Like status using the resolved blogId
  const likeQuery = useQuery({
    queryKey: ["blog-like", blogId],
    queryFn: () => getBlogLikeStatus(token ?? "", blogId ?? ""),
    enabled: Boolean(token && blogId),
  });

  // 3. Mutate Like using blogId
  const likeMutation = useMutation({
    mutationFn: () => toggleBlogLike(token ?? "", blogId ?? ""),
    onMutate: async () => {
      if (!blogId) return;
      await queryClient.cancelQueries({ queryKey: ["blog-like", blogId] });
      const previous = queryClient.getQueryData<typeof likeQuery.data>([
        "blog-like",
        blogId,
      ]);
      const currentLiked = previous?.liked ?? false;
      const currentTotal = previous?.totalLikes ?? blog?.likesCount ?? 0;
      const optimistic = {
        success: true,
        liked: !currentLiked,
        totalLikes: Math.max(0, currentTotal + (currentLiked ? -1 : 1)),
        message: "",
      };
      queryClient.setQueryData(["blog-like", blogId], optimistic);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous && blogId) {
        queryClient.setQueryData(["blog-like", blogId], context.previous);
      }
    },
    onSuccess: (result) => {
      if (!blogId) return;
      const optimistic = queryClient.getQueryData<typeof likeQuery.data>([
        "blog-like",
        blogId,
      ]);
      const finalLikes = optimistic?.totalLikes ?? result.totalLikes;

      queryClient.setQueryData(["blog-like", blogId], {
        ...result,
        totalLikes: finalLikes,
      });

      queryClient.setQueryData(
        ["blog", slug],
        (current: typeof blogQuery.data) =>
          current
            ? { ...current, data: { ...current.data, likesCount: finalLikes } }
            : current,
      );
    },
  });

  useEffect(() => {
    if (!slug || !blog || hasRecordedView.current) return;
    hasRecordedView.current = true;
    viewMutation.mutate();
  }, [blog, slug, viewMutation]);

  // Canonical share URL — stable regardless of trailing query params or hashes.
  const canonicalUrl = `${window.location.origin}/blogs/${blog?.slug ?? slug}`;

  const content =
    typeof blog?.content === "string"
      ? DOMPurify.sanitize(blog.content)
      : `<pre>${DOMPurify.sanitize(JSON.stringify(blog?.content, null, 2) ?? "")}</pre>`;

  // The sanitized body is the single source of truth for the TOC: heading ids
  // are baked into the HTML before React renders it, because React re-writes
  // the whole dangerouslySetInnerHTML block on every content change and would
  // erase anything stamped on afterwards. The article therefore renders the
  // stamped copy so the anchors are actually in the DOM.
  const { items: tocItems, html: stampedContent } = useHeadingToc(content);
  const activeHeadingId = useActiveHeading(tocItems);
  const readingProgress = useReadingProgress(articleRef, content);
  const activeTitle =
    tocItems.find((item) => item.id === activeHeadingId)?.text ?? null;

  // One reader overlay at a time. The pill is the only control that sits above
  // both overlays, so it can open the TOC while the share modal is visible.
  const toggleToc = (trigger: HTMLElement | null) => {
    if (tocOpen) {
      setTocOpen(false);
      return;
    }
    tocTriggerRef.current = trigger;
    setShareOpen(false);
    setTocOpen(true);
  };

  if (blogQuery.isLoading) {
    return (
      <main className="min-h-screen bg-inkwell-950 text-inkwell-cream">
        <header className="border-b border-inkwell-cream/10">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
            <span className="flex items-center gap-3 font-display text-xl">
              <BrandLogo />
              Inkwell
            </span>
            <div className="skeleton-shimmer h-8 w-20 rounded-full" />
          </nav>
        </header>
        <BlogDetailSkeleton />
      </main>
    );
  }

  if (blogQuery.isError || !blog) {
    return (
      <main className="min-h-screen bg-inkwell-950 px-6 py-24 text-center text-red-300">
        This entry could not be found.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-inkwell-950 text-inkwell-cream">
      <header className="border-b border-inkwell-cream/10">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link
            to="/"
            className="flex items-center gap-3 font-display text-xl text-inkwell-cream"
          >
            <BrandLogo />
            Inkwell
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full border border-inkwell-gold/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold transition hover:bg-inkwell-gold hover:text-inkwell-950"
            >
              ← Back
            </button>
          </div>
        </nav>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <div className="flex flex-wrap gap-2">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] uppercase tracking-wider text-inkwell-gold"
            >
              #{tag}
            </span>
          ))}
        </div>

        <h1 className="mt-6 break-words font-display text-4xl leading-tight sm:text-7xl">
          {blog.title}
        </h1>
        <p className="mt-6 text-sm text-inkwell-dim">
          {new Date(blog.publishedAt ?? blog.createdAt).toLocaleDateString()}
        </p>

        {blog.coverImage && (
          <img
            src={blog.coverImage}
            alt=""
            className="mt-12 max-h-[30rem] w-full rounded-2xl object-cover"
          />
        )}

        <div className="relative mt-4 flex min-h-9 flex-wrap items-center gap-3 pr-20">
          {token ? (
            <button
              type="button"
              aria-label={
                likeQuery.data?.liked ? "Unlike this blog" : "Like this blog"
              }
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className={`group transition disabled:cursor-wait disabled:opacity-60 ${
                likeQuery.data?.liked
                  ? "text-red-500"
                  : "text-inkwell-muted hover:text-red-400"
              }`}
            >
              <FaHeart
                aria-hidden="true"
                className={`size-7 transition-transform group-hover:scale-110 ${
                  likeQuery.data?.liked
                    ? "drop-shadow-[0_0_8px_rgb(239_68_68_/_35%)]"
                    : ""
                }`}
              />
            </button>
          ) : (
            <Link
              to="/login"
              aria-label="Sign in to like this blog"
              className="text-inkwell-muted transition hover:text-red-400"
            >
              <FaHeart aria-hidden="true" className="size-7" />
            </Link>
          )}

          <span className="text-sm text-inkwell-muted">
            {likeQuery.data?.totalLikes ?? blog.likesCount ?? 0} likes
          </span>
          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-inkwell-muted">
            {blog.views} views
          </span>

          {tocItems.length > 0 && (
            <button
              ref={tocButtonRef}
              type="button"
              aria-expanded={tocOpen}
              onClick={() => toggleToc(tocButtonRef.current)}
              className="inline-flex items-center gap-2 rounded-full border border-inkwell-cream/15 px-3 py-2 text-sm text-inkwell-muted transition hover:border-inkwell-gold/60 hover:text-inkwell-gold"
            >
              <FaListUl aria-hidden="true" className="size-3.5" /> Contents
            </button>
          )}

          <button
            ref={shareButtonRef}
            type="button"
            aria-expanded={shareOpen}
            onClick={() => {
              setTocOpen(false);
              setShareOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-inkwell-cream/15 px-3 py-2 text-sm text-inkwell-muted transition hover:border-inkwell-gold/60 hover:text-inkwell-gold"
          >
            <FaShareAlt aria-hidden="true" className="size-3.5" /> Share
          </button>
        </div>

        {blog.description && (
          <p className="mt-12 text-xl leading-9 text-inkwell-muted">
            {blog.description}
          </p>
        )}

        <div
          ref={articleRef}
          className="blog-content mt-10 text-base leading-8 text-inkwell-cream/85"
          dangerouslySetInnerHTML={{ __html: stampedContent }}
        />

        <BlogComments blogId={blog.id} />
      </article>

      <ReadingProgressPill
        ref={pillRef}
        progress={readingProgress}
        activeTitle={activeTitle}
        tocOpen={tocOpen}
        onToggleToc={() => toggleToc(pillRef.current)}
      />

      <TableOfContents
        open={tocOpen}
        onClose={() => setTocOpen(false)}
        items={tocItems}
        activeId={activeHeadingId}
        triggerRef={tocTriggerRef}
      />

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={canonicalUrl}
        title={blog.title}
        triggerRef={shareButtonRef}
      />
    </main>
  );
}
