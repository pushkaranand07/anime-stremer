import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-10">
          <div className="max-w-xl text-center">
            <h1 className="text-8xl font-black text-red-500 mb-6 tracking-tighter">OPS!</h1>
            <h2 className="text-3xl font-bold text-white mb-4">Something went wrong.</h2>
            <p className="text-gray-400 mb-10 leading-relaxed">
              We encountered an unexpected error. Don't worry, your data is safe. 
              Please try refreshing the page or contact support if the issue persists.
            </p>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-10 overflow-auto max-h-40">
               <code className="text-xs text-red-400">{this.state.error?.toString()}</code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-10 py-4 bg-white text-black font-black rounded-full hover:bg-yellow-500 transition-colors"
            >
              REFRESH PAGE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
