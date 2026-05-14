import { Component } from 'react';

/**
 * Per-route error boundary — wraps individual pages so one crash
 * doesn't kill the entire app. The global ErrorBoundary is the last resort.
 */
export default class PageErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[PageErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Page Error</h2>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              Something went wrong loading this page. Your data is safe.
            </p>
          </div>
          {this.state.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md overflow-auto max-h-24">
              <code className="text-xs text-red-400">{this.state.error.toString()}</code>
            </div>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-8 py-3 bg-yellow-500 text-black font-black rounded-2xl hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20"
          >
            TRY AGAIN
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
