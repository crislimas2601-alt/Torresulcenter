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

// Patch Node.prototype.removeChild and insertBefore to completely prevent crashes
// caused by Google Translate, Edge Translator, or browser extensions injecting/wrapping DOM nodes
if (typeof Node === 'function' && Node.prototype) {
  const origRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (child.parentNode) {
        return child.parentNode.removeChild(child) as T;
      }
      return child;
    }
    return origRemoveChild.apply(this, [child]) as T;
  };

  const origInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (referenceNode.parentNode) {
        return referenceNode.parentNode.insertBefore(newNode, referenceNode) as T;
      }
      return this.appendChild(newNode) as T;
    }
    return origInsertBefore.apply(this, [newNode, referenceNode]) as T;
  };
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
    const msg = String(error?.message || '').toLowerCase();
    // Google Translate / Edge Translator / Browser extension DOM mutation:
    // "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
    if (
      msg.includes('removechild') ||
      msg.includes('insertbefore') ||
      msg.includes('not a child of this node') ||
      msg.includes('não é filho deste nó')
    ) {
      console.warn('Silent auto-recovery from DOM translate/extension mutation:', msg);
      return { hasError: false };
    }
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error caught by boundary:', error, errorInfo);

    const msg = String(error?.message || '').toLowerCase();
    if (
      msg.includes('removechild') ||
      msg.includes('insertbefore') ||
      msg.includes('not a child of this node') ||
      msg.includes('não é filho deste nó')
    ) {
      this.setState({ hasError: false, error: undefined });
      return;
    }

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
              O seu navegador encontrou uma inconsistência de exibição temporária. Clique abaixo para reiniciar com segurança.
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
