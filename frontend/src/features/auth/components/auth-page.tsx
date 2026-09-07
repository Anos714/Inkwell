import { useAuth } from '../hooks/use-auth'
import { FcGoogle } from 'react-icons/fc'

export function AuthPage() {
  const { isLoading, login, notice } = useAuth()

  return (
    <main className="auth-shell min-h-svh bg-inkwell-950 text-inkwell-cream">
      <section className="auth-visual hidden lg:flex">
        <div className="auth-grid" />
        <div className="auth-visual-copy">
          <p className="font-display text-4xl italic leading-tight text-inkwell-cream">“Make space for<br />good ideas.”</p>
          <span className="mt-6 font-mono text-[10px] uppercase tracking-[.22em] text-inkwell-gold">Inkwell workspace</span>
        </div>
      </section>
      <section className="auth-panel relative flex min-h-svh flex-col px-7 py-8 sm:px-14">
        <button type="button" onClick={() => window.history.back()} className="self-start text-xs text-inkwell-muted transition hover:text-inkwell-cream">← Back</button>
        <div className="m-auto w-full max-w-[330px] text-center">
          <div className="mx-auto mb-8 grid size-12 place-items-center rounded-full border border-inkwell-gold text-xl text-inkwell-gold [font-family:var(--font-display)]">I</div>
          <p className="font-mono text-[10px] uppercase tracking-[.28em] text-inkwell-gold">Inkwell</p>
          <h1 className="mt-3 font-display text-4xl text-inkwell-cream">Welcome back.</h1>
          <p className="mt-4 text-sm leading-7 text-inkwell-muted">A quiet place for your writing, ideas, and unfinished thoughts.</p>
          <button className="mt-9 flex w-full items-center justify-center gap-3 rounded-full bg-inkwell-cream px-5 py-3.5 text-sm font-semibold text-inkwell-950 transition hover:bg-white disabled:cursor-wait disabled:opacity-65" type="button" onClick={login} disabled={isLoading}>
            <FcGoogle aria-hidden="true" size={20} />
            {isLoading ? 'Connecting…' : 'Sign in with Google'}
          </button>
          {notice && <p className="mt-4 text-xs text-red-300" role="alert">{notice}</p>}
          <p className="mt-5 text-[10px] text-inkwell-dim">◈ Secure passwordless authentication.</p>
        </div>
        <p className="text-center font-mono text-[10px] text-inkwell-dim">Private by design · Made for the long draft</p>
      </section>
    </main>
  )
}
