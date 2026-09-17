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

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#journal', label: 'Journal' },
  { href: '#voices', label: 'Voices' },
] as const

export function SiteHeader() {
  const { isLoading, logout } = useAuth()
  const user = useAuthStore((state) => state.user)
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  // Toggle the glass intensity once the page has scrolled a little.
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

  const userInitials = user?.username
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="glass-nav" data-scrolled={scrolled}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <BrandLogo size="sm" />
          <span className="font-display text-lg tracking-tight text-inkwell-cream">Inkwell</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-inkwell-muted md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="nav-link transition hover:text-inkwell-cream">
              {link.label}
            </a>
          ))}
        </div>

        {user ? (
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                aria-expanded={profileOpen}
                aria-label={`Open profile menu for ${user.username}`}
                onClick={() => setProfileOpen((open) => !open)}
                className="group flex items-center gap-2 rounded-full border border-inkwell-gold/70 py-1.5 pl-1.5 pr-3 text-xs font-semibold text-inkwell-gold transition hover:bg-inkwell-gold hover:text-inkwell-950"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="size-7 rounded-full object-cover" />
                ) : (
                  <span className="grid size-7 place-items-center rounded-full bg-inkwell-gold text-[10px] font-bold text-inkwell-950">{userInitials}</span>
                )}
                <span className="hidden max-w-24 truncate sm:block">{user.username}</span>
                <span className="text-[9px] opacity-70">{profileOpen ? '▲' : '▼'}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full z-30 mt-3 w-56 overflow-hidden rounded-2xl border border-inkwell-cream/15 bg-inkwell-900 p-2 shadow-2xl shadow-black/40">
                  <div className="border-b border-inkwell-cream/10 px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-inkwell-cream">{user.username}</p>
                    <p className="mt-0.5 truncate text-xs text-inkwell-muted">{user.email}</p>
                  </div>
                  <Link to="/profile" className="mt-1 block rounded-xl px-3 py-2.5 text-sm text-inkwell-muted transition hover:bg-inkwell-brown/50 hover:text-inkwell-cream">
                    Profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin/blogs" className="block rounded-xl px-3 py-2.5 text-sm text-inkwell-gold transition hover:bg-inkwell-brown/50">
                      Admin dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={logout}
                    disabled={isLoading}
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-inkwell-muted transition hover:bg-inkwell-brown/50 hover:text-inkwell-cream disabled:cursor-wait disabled:opacity-60"
                  >
                    {isLoading ? 'Signing out…' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link
              to="/login"
              className="group flex items-center gap-2 rounded-full border border-inkwell-gold/70 px-4 py-2 text-xs font-semibold text-inkwell-gold transition hover:bg-inkwell-gold hover:text-inkwell-950"
            >
              Sign in <ArrowUpRight />
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
