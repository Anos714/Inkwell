import { useEffect } from 'react'
import { Link } from 'react-router'
import { BrandLogo } from '../../../../components/brand-logo'
import { ThemeToggle } from '../../../../components/theme-toggle'
import { SiteFooter } from './site-footer'

type LegalPageProps = {
  /** Small mono label above the title, e.g. "Legal". */
  eyebrow: string
  title: string
  /** Human-readable date string, e.g. "25 September 2026". */
  updatedAt: string
  children: React.ReactNode
}

/**
 * Shared shell for the static legal pages. Matches the article reading
 * measure (~68ch) so the prose sits at the same comfortable width as a post,
 * and reuses the .blog-content typography so headings and lists stay on-design
 * without duplicating styles.
 */
export function LegalPage({ eyebrow, title, updatedAt, children }: LegalPageProps) {
  // These are deep-linked from the footer; arriving mid-scroll is jarring.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  return (
    <div className="min-h-screen bg-inkwell-950 text-inkwell-cream">
      <header className="border-b border-inkwell-cream/10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3 font-display text-xl text-inkwell-cream">
            <BrandLogo />
            Inkwell
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/"
              className="rounded-full border border-inkwell-gold/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold transition hover:bg-inkwell-gold hover:text-inkwell-950"
            >
              ← Home
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <span className="font-mono text-[10px] uppercase tracking-[.18em] text-inkwell-gold">
          {eyebrow}
        </span>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">
          {title}
        </h1>
        <p className="mt-6 text-sm text-inkwell-dim">
          Last updated {updatedAt}
        </p>

        <div className="blog-content mt-12 text-base leading-8 text-inkwell-cream/85">
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
