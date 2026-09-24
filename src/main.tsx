import { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { safeStorage } from './utils/safeStorage';

// Unconditionally unregister any zombie or stale Service Workers from previous PWA builds
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  }).catch(() => {});
}

// Clear any stale browser CacheStorage created by Workbox or previous PWA versions
if (typeof window !== 'undefined' && 'caches' in window) {
  caches.keys().then((cacheNames) => {
    for (const name of cacheNames) {
      caches.delete(name);
    }
  }).catch(() => {});
}

// Catch Vite chunk preload errors (occurs when a new version is deployed and old hashes 404)
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    console.warn('Vite preload chunk error detected. Auto-reloading with fresh bundle...');
    window.location.reload();
  });
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error caught by boundary:', error, errorInfo);

    // Auto-heal on first occurrence per session (e.g. stale chunk or schema mismatch)
    try {
      const autoHealed = sessionStorage.getItem('app_auto_healed_v2');
      if (autoHealed !== '1') {
        sessionStorage.setItem('app_auto_healed_v2', '1');
        // Clear caches and reload once seamlessly
        if ('caches' in window) {
          caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
        }
        window.location.reload();
      }
    } catch {
      // ignore
    }
  }

  handleNuclearReset = () => {
    try {
      safeStorage.clear();
      if (typeof window !== 'undefined') {
        if (window.localStorage) window.localStorage.clear();
        if (window.sessionStorage) window.sessionStorage.clear();
        if ('caches' in window) {
          caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
        }
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((regs) => {
            for (const r of regs) r.unregister();
          }).catch(() => {});
        }
      }
    } catch {
      // ignore
    }
    // Hard navigate with query param to bypass any HTTP cache
    window.location.href = window.location.origin + window.location.pathname + '?reload=' + Date.now();
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-xl mx-auto flex items-center justify-center font-bold text-xl">
              !
            </div>
            <h2 className="text-xl font-bold text-white">Recuperação do Sistema</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              O seu navegador continha uma versão em cache antiga da aplicação. Clique abaixo para atualizar e acessar normalmente.
            </p>
            {this.state.error && (
              <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-700 font-mono text-left max-h-24 overflow-y-auto break-words">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl transition cursor-pointer text-sm"
              >
                Tentar Novamente
              </button>
              <button
                type="button"
                onClick={this.handleNuclearReset}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition cursor-pointer text-sm shadow-md"
              >
                Limpar Cache e Entrar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
