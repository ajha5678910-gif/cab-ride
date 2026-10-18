import React from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } catch (e) {
      console.error('Failed to clear storage:', e);
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-xl bg-white rounded-3xl p-8 border border-neutral-200 shadow-uber-lg text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Application Diagnostic
              </span>
              <h1 className="text-2xl font-black text-neutral-900 tracking-tight mt-2">
                Something interrupted the view
              </h1>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                A client runtime error occurred while rendering the mobility interface. You can reload or reset your local storage cache to restore defaults.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-neutral-950 text-left p-4 rounded-2xl overflow-x-auto text-[11px] font-mono text-neutral-300 border border-neutral-800 max-h-48">
                <div className="text-red-400 font-bold mb-1">
                  {this.state.error.toString()}
                </div>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-neutral-500 text-[10px] whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleResetStorage}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Cache & Restart</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
