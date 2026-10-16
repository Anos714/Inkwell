import { useAuth } from '../hooks/use-auth'
import { FcGoogle } from 'react-icons/fc'
import { ThemeToggle } from '../../../components/theme-toggle'
import { BackButton } from '../../../components/back-button'
import { BrandLogo } from '../../../components/brand-logo'
import { useSeo } from '../../../hooks/use-seo'
import { SITE_NAME } from '../../../lib/seo'

export function AuthPage() {
  const { isLoading, login, notice } = useAuth()

  useSeo({
    title: `Sign in — ${SITE_NAME}`,
    description: `Sign in to ${SITE_NAME} with Google to like posts and join the conversation.`,
    path: '/login',
    noIndex: true,
  })

  return (
    <main className="auth-shell min-h-svh bg-inkwell-950 text-inkwell-cream">
      <section className="auth-visual hidden lg:flex">
        <div className="auth-grid" />
        <div className="auth-visual-copy">
          <p className="font-display text-5xl font-medium italic leading-[1.1] text-inkwell-cream">“Make space for<br />good ideas.”</p>
          <span className="mt-6 font-mono text-[10px] uppercase tracking-[.22em] text-inkwell-gold">Inkwell workspace</span>
        </div>
      </section>
      <section className="auth-panel relative flex min-h-svh flex-col px-7 py-8 sm:px-14">
        <div className="flex items-center justify-between"><BackButton fallback="/" label="Back" /><ThemeToggle /></div>
        <div className="m-auto w-full max-w-[330px] text-center">
          <BrandLogo size="lg" className="mx-auto mb-8" />
          <p className="font-mono text-[10px] uppercase tracking-[.28em] text-inkwell-gold">Inkwell</p>
          <h1 className="mt-3 font-display text-5xl font-medium text-inkwell-cream">Welcome back.</h1>
          <p className="mt-4 text-sm leading-7 text-inkwell-muted">A quiet place for your writing, ideas, and unfinished thoughts.</p>
          <button className="mt-9 flex w-full items-center justify-center gap-3 rounded-full bg-inkwell-cream px-5 py-3.5 text-sm font-semibold text-inkwell-950 transition hover:bg-white disabled:cursor-wait disabled:opacity-65" type="button" onClick={login} disabled={isLoading}>
            <FcGoogle aria-hidden="true" size={20} />
            {isLoading ? 'Connecting…' : 'Sign in with Google'}
          </button>
          {notice && <p className="danger-error mt-4 text-xs" role="alert">{notice}</p>}
          <p className="mt-5 text-[10px] text-inkwell-dim">◈ Secure passwordless authentication.</p>
        </div>
        <p className="text-center font-mono text-[10px] text-inkwell-dim">Private by design · Made for the long draft</p>
      </section>
    </main>
  )
}
