import React, { useEffect, useState } from 'react';
import { MonitorDown, Check, ExternalLink, X, Info } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallAppButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // If native prompt is available (e.g. running in standard browser tab)
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          return;
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    }

    // If inside iframe or browser has not provided deferredPrompt, show guidance modal
    setShowModal(true);
  };

  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  if (isInstalled) {
    return (
      <div
        title="Aplicativo instalado no seu computador"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg select-none"
      >
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden sm:inline">App Instalado</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        id="btn_install_pc"
        onClick={handleInstallClick}
        title="Instalar no Computador / PC como aplicativo desktop"
        className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
      >
        <MonitorDown className="w-3.5 h-3.5 text-red-600" />
        <span>Instalar no PC</span>
      </button>

      {/* Guide Modal for Desktop Installation */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 text-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100">
                  <MonitorDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Instalar Aplicativo no PC
                  </h3>
                  <p className="text-xs text-slate-500">
                    Torresul Imobiliária - Atalho direto na área de trabalho
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-2.5">
              <div className="flex items-start gap-2 text-slate-700">
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[11px] text-slate-700 shrink-0 mt-0.5">
                  1
                </div>
                <p>
                  <strong>No Chrome ou Edge:</strong> Olhe na barra de endereços do navegador (ao lado da estrela de favoritos) e clique no ícone de <strong>Instalar computador</strong> <span className="inline-block px-1.5 py-0.5 bg-slate-200 rounded font-mono text-[10px]">⊕</span> ou <strong>Instalar Torresul</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2 text-slate-700">
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[11px] text-slate-700 shrink-0 mt-0.5">
                  2
                </div>
                <p>
                  Ou clique no menu do navegador (<strong>três pontinhos ⋮</strong> no canto superior direito) &gt; <strong>Salvar e compartilhar</strong> ou <strong>Instalar este site como aplicativo</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Se estiver visualizando dentro do painel do AI Studio, abra em uma nova aba para o botão de instalação nativo aparecer no navegador.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleOpenNewTab}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <span>Abrir em Nova Aba</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
