import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Torresul App:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-6">
          <div className="bg-white max-w-md w-full rounded-2xl border border-zinc-300 shadow-xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900">
              Ocorreu um erro inesperado
            </h2>
            <p className="text-xs text-zinc-600 leading-relaxed">
              O simulador encontrou uma inconsistência ao renderizar. Clique abaixo para reiniciar a ferramenta com segurança.
            </p>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('torresul_loan_input_v1');
                localStorage.removeItem('torresul_extra_amort_v1');
                window.location.reload();
              }}
              className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restaurar Valores Padrão</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
