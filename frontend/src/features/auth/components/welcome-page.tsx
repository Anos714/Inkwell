import { useAuth } from '../hooks/use-auth'
import type { AuthUser } from '../types'

type WelcomePageProps = { user: AuthUser }

export function WelcomePage({ user }: WelcomePageProps) {
  const { isLoading, logout } = useAuth()

  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden bg-inkwell-950 px-5 py-8">
      <div className="pointer-events-none absolute -right-32 -top-56 size-[440px] rounded-full bg-inkwell-800/70 blur-[2px]" />
      <section className="relative z-10 w-full max-w-[470px] rounded-3xl border border-inkwell-cream/15 bg-inkwell-900/80 p-7 text-center shadow-2xl shadow-black/30 backdrop-blur-lg sm:p-12">
        <div className="mx-auto mb-10 grid size-10 place-items-center rounded-full border border-inkwell-gold text-lg text-inkwell-gold [font-family:var(--font-display)]">I</div>
        <span className="font-mono text-[11px] uppercase tracking-[.12em] text-inkwell-gold">Welcome back</span>
        <h1 className="mb-5 mt-4 text-4xl font-semibold tracking-[-.05em] text-inkwell-cream">Your ideas have a home.</h1>
        <p className="mb-8 text-sm leading-[1.7] text-inkwell-muted">You’re signed in as <strong className="font-medium text-inkwell-cream">{user.email}</strong>.</p>
        <button className="w-full rounded-lg border border-inkwell-gold bg-transparent px-[18px] py-[15px] font-bold text-inkwell-gold transition hover:-translate-y-0.5 hover:bg-inkwell-gold hover:text-inkwell-950 disabled:cursor-wait disabled:opacity-65" type="button" onClick={logout} disabled={isLoading}>
          {isLoading ? 'Signing out…' : 'Sign out'}
        </button>
      </section>
    </main>
  )
}
