import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

/** Keeps one crashing screen from blanking the whole app; offers a way back home. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[RRV] UI error', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const lv = document.documentElement.lang !== 'en';
    return (
      <div className="relative z-10 grid min-h-dvh place-items-center p-6 text-center">
        <div className="max-w-md rounded-3xl border border-white/10 bg-[#16143d]/95 p-8">
          <h1 className="font-display text-2xl font-bold">{lv ? 'Kaut kas nogāja greizi' : 'Something went wrong'}</h1>
          <p className="mt-2 text-muted">{lv ? 'Tavs progress ir saglabāts. Mēģini atvērt sākumlapu vēlreiz.' : 'Your progress is saved. Try opening the home screen again.'}</p>
          <pre className="mt-4 max-h-32 overflow-auto rounded-xl bg-black/30 p-3 text-left text-xs text-rose-200">{this.state.error.message}</pre>
          <button
            type="button"
            onClick={() => {
              this.setState({ error: null });
              window.location.assign('/');
            }}
            className="mt-6 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 font-semibold text-white"
          >
            {lv ? 'Uz sākumu' : 'Go home'}
          </button>
        </div>
      </div>
    );
  }
}
