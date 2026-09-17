import React from 'react';
import { X, ExternalLink, Monitor, Smartphone, Download, AlertCircle } from 'lucide-react';
import { TorresulLogo } from './TorresulLogo';

interface DesktopInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewTab: () => void;
  isInstallable: boolean;
  onInstall: () => void;
}

export const DesktopInstallModal: React.FC<DesktopInstallModalProps> = ({
  isOpen,
  onClose,
  onOpenNewTab,
  isInstallable,
  onInstall,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-zinc-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <TorresulLogo variant="white" size="sm" />
            <div>
              <h2 className="text-base font-bold text-white">
                Instalar Torresul no seu Dispositivo
              </h2>
              <span className="text-[11px] text-zinc-400">
                Acesso rápido, offline e em tela cheia
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-zinc-700 leading-relaxed">
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs">
              <Monitor className="w-4 h-4 text-red-600" />
              <span>Instalação no Computador ou Celular (PWA):</span>
            </div>
            <p className="text-zinc-600">
              O Simulador Torresul foi desenvolvido como um Progressive Web App moderno. Você pode instalá-lo como um programa no seu Windows, Mac, Android ou iPhone para abrir sem precisar digitar o endereço e usar mesmo sem internet.
            </p>
          </div>

          {/* Opção 1: Abrir em Nova Aba (Essencial caso esteja no iFrame do AI Studio) */}
          <div className="border border-zinc-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-zinc-700" />
                Passo 1: Abrir em Nova Aba
              </span>
              <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
                Recomendado
              </span>
            </div>
            <p className="text-zinc-500">
              Navegadores bloqueiam a instalação direta de apps quando exibidos dentro de janelas de pré-visualização. Abra em uma aba própria para liberar o botão de instalar.
            </p>
            <button
              type="button"
              onClick={() => {
                onOpenNewTab();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold flex items-center justify-center gap-2 transition shadow-xs"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir em Nova Aba Completa</span>
            </button>
          </div>

          {/* Opção 2: Se já for instalável diretamente */}
          {isInstallable && (
            <div className="border border-red-200 bg-red-50/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-red-600" />
                  Instalar Diretamente Agora
                </span>
                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                  Pronto
                </span>
              </div>
              <p className="text-zinc-600">
                Seu navegador já suporta a instalação imediata com 1 clique.
              </p>
              <button
                type="button"
                onClick={() => {
                  onInstall();
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 transition shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Instalar Aplicativo Torresul</span>
              </button>
            </div>
          )}

          {/* Dica para Celulares */}
          <div className="flex items-start gap-2.5 text-zinc-500 text-[11px] pt-1">
            <Smartphone className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <span>
              <strong>No Celular:</strong> No Safari do iPhone, clique no botão de <em>Compartilhar</em> e escolha <em>"Adicionar à Tela de Início"</em>. No Android/Chrome, clique nos três pontinhos e selecione <em>"Instalar Aplicativo"</em>.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
