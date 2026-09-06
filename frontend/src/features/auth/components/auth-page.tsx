import { useAuth } from '../hooks/use-auth'

export function AuthPage() {
  const { isLoading, login, notice } = useAuth()

  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden bg-inkwell-950 px-5 py-8">
      <div className="pointer-events-none absolute -right-32 -top-56 size-[440px] rounded-full bg-inkwell-800/70 blur-[2px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 size-[300px] rounded-full bg-inkwell-brown/65 blur-[2px]" />
      <section className="relative z-10 w-full max-w-[470px] rounded-3xl border border-inkwell-cream/15 bg-inkwell-900/80 p-7 shadow-2xl shadow-black/30 backdrop-blur-lg sm:p-12">
        <div className="mb-10 grid size-10 place-items-center rounded-full border border-inkwell-gold text-lg text-inkwell-gold [font-family:var(--font-display)] sm:mb-12">I</div>
        <span className="font-mono text-[11px] uppercase tracking-[.12em] text-inkwell-gold">A quieter place to think</span>
        <h1 className="mb-5 mt-4 text-[clamp(37px,7vw,54px)] font-semibold leading-[1.04] tracking-[-.05em] text-inkwell-cream">
          Make space for<br /><em className="font-display font-medium not-italic tracking-[-.045em] text-inkwell-gold">good ideas.</em>
        </h1>
        <p className="mb-8 max-w-[330px] text-sm leading-[1.7] text-inkwell-muted">Inkwell keeps your writing close, clear, and entirely yours.</p>
        <button className="flex w-full items-center gap-3 rounded-lg border border-inkwell-gold bg-inkwell-gold px-[18px] py-[15px] font-bold text-inkwell-950 transition hover:-translate-y-0.5 hover:bg-inkwell-light disabled:cursor-wait disabled:opacity-65" type="button" onClick={login} disabled={isLoading}>
          <span className="text-[17px]">G</span>
          {isLoading ? 'Connecting…' : 'Continue with Google'}
          <span className="ml-auto text-lg">↗</span>
        </button>
        {notice && <p className="mt-4 text-center text-xs text-red-300" role="alert">{notice}</p>}
        <p className="mt-[18px] text-center font-mono text-[11px] leading-relaxed text-inkwell-dim">By continuing, you agree to keep Inkwell a thoughtful place.</p>
      </section>
      <p className="absolute bottom-6 z-10 font-mono text-[11px] text-inkwell-dim">Private by design <span className="mx-2 text-inkwell-gold">·</span> Made for the long draft</p>
    </main>
  )
}
