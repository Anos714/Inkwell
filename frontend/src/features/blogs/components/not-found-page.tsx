import { Link } from "react-router";
import { BrandLogo } from "../../../components/brand-logo";
import { ThemeToggle } from "../../../components/theme-toggle";
import { useSeo } from "../../../hooks/use-seo";
import { SITE_NAME } from "../../../lib/seo";

/**
 * Real 404 page. A bare <Navigate to="/" /> for unknown paths turns every
 * invalid URL into a soft-404 that Google indexes as the homepage; serving a
 * distinct, self-canonical page keeps the sitemap honest and gives crawlers a
 * proper "not found" signal.
 */
export function NotFoundPage() {
  useSeo({
    title: `Page not found — ${SITE_NAME}`,
    description: "That page doesn't exist on Inkwell. Head back to the journal.",
    noIndex: true,
  });

  return (
    <main className="min-h-screen bg-inkwell-950 text-inkwell-cream">
      <header className="border-b border-inkwell-cream/10">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3 font-display text-xl">
            <BrandLogo />
            Inkwell
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-28 text-center sm:py-40">
        <span className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">
          Error 404
        </span>
        <h1 className="mt-6 font-display text-5xl leading-tight sm:text-7xl">
          This page is blank.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-inkwell-muted">
          The link may be broken, or the entry may have been unpublished. The
          journal is still very much open.
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="rounded-full bg-inkwell-gold px-6 py-3 font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-950 transition hover:opacity-90"
          >
            Back to home
          </Link>
          <Link
            to="/blogs"
            className="rounded-full border border-inkwell-cream/15 px-6 py-3 font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-muted transition hover:border-inkwell-gold/60 hover:text-inkwell-gold"
          >
            Browse all posts
          </Link>
        </div>
      </section>
    </main>
  );
}
