import { Link } from 'react-router'
import { BrandLogo } from '../../../../components/brand-logo'

const FOOTER_LINKS = [
  {
    heading: 'Read',
    links: [
      { label: 'Journal', href: '/blogs' },
      { label: 'Recent entries', href: '#journal' },
      { label: 'Topics', href: '#topics' },
      { label: 'Inside', href: '#reading-room' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign in', href: '/login' },
      { label: 'Profile', href: '/profile' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms & Conditions', href: '/terms' },
    ],
  },
] as const

const SOCIALS = [
  { kind: 'x', label: 'X / Twitter', href: 'https://x.com/RahulSain714' },
  { kind: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/rahulxcode/' },
  { kind: 'github', label: 'GitHub', href: 'https://github.com/Anos714' },
  { kind: 'portfolio', label: 'Portfolio', href: 'https://rahulxcode.vercel.app/' },
  { kind: 'email', label: 'Email', href: 'mailto:sainrahul374@gmail.com' },
] as const

function SocialIcon({ kind }: { kind: 'x' | 'linkedin' | 'github' | 'portfolio' | 'email' }) {
  const common = {
    'aria-hidden': true,
    className: 'size-3.5',
    viewBox: '0 0 24 24',
  } as const

  switch (kind) {
    case 'x':
      return (
        <svg {...common} fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg {...common} fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )
    case 'github':
      return (
        <svg {...common} fill="currentColor">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a9.28 9.28 0 0 1 2.5-.338c.85 0 1.7.112 2.5.337 1.912-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      )
    case 'portfolio':
      return (
        <svg {...common} fill="none">
          <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M2.75 12h18.5M12 2.75c2.6 2.6 2.6 15.9 0 18.5M12 2.75c-2.6 2.6-2.6 15.9 0 18.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'email':
      return (
        <svg {...common} fill="none">
          <rect x="2.5" y="5" width="19" height="14" rx="2.25" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="m3.2 6.8 8.8 6 8.8-6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
  }
}

export function SiteFooter() {
  return (
    <footer className="border-t border-inkwell-rule">
      <div className="mx-auto max-w-[86rem] px-5 pt-16 sm:px-8 sm:pt-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_.6fr_.6fr_.6fr_.8fr]">
          {/* Masthead */}
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <BrandLogo size="sm" />
              <span className="font-display text-xl tracking-tight text-inkwell-cream">Inkwell</span>
            </Link>
            <p className="mt-5 max-w-xs font-serif text-base leading-8 text-inkwell-muted">
              Rooted in the slow web. Essays, field notes, and marginalia —
              written to be read slowly and kept.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {SOCIALS.map((social) => (
                <a
                  key={social.kind}
                  href={social.href}
                  target={social.kind === 'email' ? undefined : '_blank'}
                  rel="noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="grid size-8 place-items-center rounded-full border border-inkwell-rule text-inkwell-muted transition duration-300 hover:-translate-y-0.5 hover:border-inkwell-brass/60 hover:text-inkwell-brass"
                >
                  <SocialIcon kind={social.kind} />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_LINKS.map((column) => (
            <div key={column.heading}>
              <h3 className="eyebrow">{column.heading}</h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#') ? (
                      <a href={link.href} className="text-sm text-inkwell-muted transition hover:text-inkwell-cream">
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.href} className="text-sm text-inkwell-muted transition hover:text-inkwell-cream">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="eyebrow">Colophon</h3>
            <ul className="mt-5 space-y-3 font-serif text-sm leading-6 text-inkwell-muted">
              <li>Set in Cormorant Garamond, Newsreader &amp; DM Mono.</li>
              <li>Printed on warm paper, day and night.</li>
              <li>No trackers. No noise.</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-inkwell-rule py-7 sm:flex-row sm:items-center">
          <p className="folio">© {new Date().getFullYear()} Inkwell · Private by design</p>
          <p className="folio">Made for the long draft</p>
        </div>
      </div>

      {/* Signature — the wordmark, pressed into the bottom of the page. */}
      <div aria-hidden="true" className="overflow-hidden">
        <p className="display -mb-[0.18em] translate-y-[0.08em] whitespace-nowrap text-center text-[clamp(4.5rem,19vw,17rem)] leading-[0.8] text-inkwell-cream/[0.07]">
          Inkwell
        </p>
      </div>
    </footer>
  )
}
