import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ThemeToggle } from './theme-toggle'
import { BrandLogo } from './brand-logo'
import { useAuth } from '../features/auth/hooks/use-auth'
import { useAuthStore } from '../features/auth/store/auth-store'

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" className="size-3.5" fill="none" viewBox="0 0 16 16">
      <path d="M3 13 13 3M5 3h8v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  )
}

function MenuGlyph({ open }: { open: boolean }) {
  return (
    <span aria-hidden="true" className="relative grid h-4 w-5 place-items-center">
      <span
        className={`absolute h-px w-5 bg-current transition duration-300 ${open ? 'rotate-45' : '-translate-y-1.5'}`}
      />
      <span className={`absolute h-px w-5 bg-current transition duration-300 ${open ? 'opacity-0' : ''}`} />
      <span
        className={`absolute h-px w-5 bg-current transition duration-300 ${open ? '-rotate-45' : 'translate-y-1.5'}`}
      />
    </span>
  )
}

const NAV_LINKS = [
  { href: '#journal', label: 'Journal' },
  { href: '#topics', label: 'Topics' },
  { href: '#reading-room', label: 'Inside' },
  { href: '#voices', label: 'Voices' },
] as const

export function SiteHeader() {
  const { isLoading, logout } = useAuth()
  const user = useAuthStore((state) => state.user)
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  // Tighten the masthead once the page has moved.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!profileOpen) return
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [profileOpen])

  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  const userInitials = (user?.username?.trim() ? user.username : '?')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="glass-nav" data-scrolled={scrolled}>
      <nav className="mx-auto flex max-w-[86rem] items-center justify-between gap-6 px-5 py-3.5 sm:px-8 lg:py-4">
        <Link to="/" className="group flex shrink-0 items-end gap-3" aria-label="Inkwell home">
          <BrandLogo size="sm" className="mb-0.5 transition duration-500 group-hover:-rotate-3" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[1.4rem] font-medium tracking-[-0.02em] text-inkwell-cream">
              Inkwell
            </span>
            <span className="mt-1 hidden font-mono text-[8px] uppercase tracking-[0.28em] text-inkwell-dim sm:block">
              A reader&rsquo;s journal
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-9 lg:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="masthead-link">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {user ? (
            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                aria-label={`Open profile menu for ${user.username}`}
                onClick={() => setProfileOpen((open) => !open)}
                className="group flex items-center gap-2 rounded-full border border-inkwell-rule py-1 pl-1 pr-3 text-xs font-semibold text-inkwell-cream transition hover:border-inkwell-brass/60 hover:bg-inkwell-brass/10"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" loading="lazy" decoding="async" className="size-7 rounded-full object-cover" />
                ) : (
                  <span className="grid size-7 place-items-center rounded-full bg-inkwell-cream text-[10px] font-bold text-inkwell-950">{userInitials}</span>
                )}
                <span className="hidden max-w-24 truncate sm:block">{user.username}</span>
              </button>

              {profileOpen && (
                <div role="menu" className="absolute right-0 top-full z-30 mt-3 w-56 overflow-hidden rounded-xl border border-inkwell-rule bg-inkwell-900 p-1.5 shadow-2xl shadow-black/20">
                  <div className="border-b border-inkwell-rule px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-inkwell-cream">{user.username}</p>
                    <p className="mt-0.5 truncate text-xs text-inkwell-muted">{user.email}</p>
                  </div>
                  <Link to="/profile" className="mt-1 block rounded-lg px-3 py-2.5 text-sm text-inkwell-muted transition hover:bg-inkwell-800 hover:text-inkwell-cream">
                    Profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin/blogs" className="block rounded-lg px-3 py-2.5 text-sm text-inkwell-brass transition hover:bg-inkwell-800">
                      Admin dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={logout}
                    disabled={isLoading}
                    className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-inkwell-muted transition hover:bg-inkwell-800 hover:text-inkwell-cream disabled:cursor-wait disabled:opacity-60"
                  >
                    {isLoading ? 'Signing out…' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="group hidden items-center gap-2 rounded-full bg-inkwell-cream px-4 py-2 text-xs font-semibold text-inkwell-950 transition duration-300 hover:-translate-y-0.5 hover:bg-inkwell-brass hover:text-inkwell-950 sm:flex"
            >
              Sign in <ArrowUpRight />
            </Link>
          )}

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="masthead-mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid size-9 place-items-center rounded-full border border-inkwell-rule text-inkwell-cream transition hover:border-inkwell-brass/60 hover:text-inkwell-brass lg:hidden"
          >
            <MenuGlyph open={menuOpen} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div id="masthead-mobile-menu" className="masthead-sheet lg:hidden">
          <div className="mx-auto max-w-[86rem] px-5 py-5 sm:px-8">
            <div className="flex flex-col">
              {NAV_LINKS.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-baseline justify-between border-b border-inkwell-rule py-3.5 font-display text-2xl text-inkwell-cream transition hover:text-inkwell-brass"
                >
                  {link.label}
                  <span className="font-mono text-[10px] tracking-[0.2em] text-inkwell-dim">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </a>
              ))}
              <Link
                to="/blogs"
                onClick={() => setMenuOpen(false)}
                className="mt-5 inline-flex items-center justify-between rounded-full bg-inkwell-cream px-5 py-3 text-sm font-semibold text-inkwell-950"
              >
                Enter the journal <ArrowUpRight />
              </Link>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-inkwell-rule pt-4">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="font-mono text-[10px] uppercase tracking-[0.16em] text-inkwell-muted transition hover:text-inkwell-cream"
                    >
                      Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin/blogs"
                        onClick={() => setMenuOpen(false)}
                        className="font-mono text-[10px] uppercase tracking-[0.16em] text-inkwell-brass"
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        void logout()
                      }}
                      disabled={isLoading}
                      className="font-mono text-[10px] uppercase tracking-[0.16em] text-inkwell-muted transition hover:text-inkwell-cream disabled:opacity-60"
                    >
                      {isLoading ? 'Signing out…' : 'Sign out'}
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="font-mono text-[10px] uppercase tracking-[0.16em] text-inkwell-brass"
                  >
                    Sign in to Inkwell
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
