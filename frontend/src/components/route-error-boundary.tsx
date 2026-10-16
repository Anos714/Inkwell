import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    // Keep console reporting for diagnostics; UI stays calm and recoverable.
    console.error('[Inkwell] route error:', error)
  }

  private handleRetry = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="grid min-h-screen place-items-center bg-inkwell-950 px-6 text-center text-inkwell-cream">
        <div className="max-w-md">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-inkwell-gold">
            Something went quiet
          </p>
          <h1 className="mt-4 font-display text-4xl">This page stumbled.</h1>
          <p className="mt-3 text-sm leading-7 text-inkwell-muted">
            Take a breath and try again — your reading spot is saved.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="rounded-full bg-inkwell-gold px-5 py-2.5 text-sm font-semibold text-inkwell-950 transition hover:bg-inkwell-light"
            >
              Try again
            </button>
            <a
              href="/"
              className="rounded-full border border-inkwell-cream/15 px-5 py-2.5 text-sm text-inkwell-muted transition hover:border-inkwell-gold/60 hover:text-inkwell-gold"
            >
              Go home
            </a>
          </div>
        </div>
      </main>
    )
  }
}
