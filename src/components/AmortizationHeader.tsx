import React from 'react';
import {
  Download,
  Share2,
  Tv,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Smartphone,
  Sliders,
  Eye,
  Building,
  KeyRound,
  TrendingUp,
} from 'lucide-react';
import { TorresulLogo } from './TorresulLogo';

interface HeaderProps {
  userMode: 'broker' | 'client';
  onToggleUserMode: (mode: 'broker' | 'client') => void;
  activeFeatureTab: 'amortizacao' | 'aluguel_vs_compra' | 'investidores';
  onChangeFeatureTab: (tab: 'amortizacao' | 'aluguel_vs_compra' | 'investidores') => void;
  onOpenEducationalModal: () => void;
  onOpenShareModal: () => void;
  onOpenTVMode: () => void;
  onResetToDefaults: () => void;
  isInstallable: boolean;
  onInstall: () => void;
  onOpenDesktopModal: () => void;
  isInIframe: boolean;
  onOpenNewTab: () => void;
}

export const AmortizationHeader: React.FC<HeaderProps> = ({
  userMode,
  onToggleUserMode,
  activeFeatureTab,
  onChangeFeatureTab,
  onOpenEducationalModal,
  onOpenShareModal,
  onOpenTVMode,
  onResetToDefaults,
  isInstallable,
  onInstall,
  onOpenDesktopModal,
  isInIframe,
  onOpenNewTab,
}) => {
  return (
    <header className="bg-white border-b border-zinc-200/90 sticky top-0 z-40">
      {/* Top Banner (Utility) */}
      <div className="bg-zinc-900 text-zinc-300 text-[11px] px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-white font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Torresul Imobiliária • Sistema Comercial MCMV / Caixa
          </span>
          <span className="text-zinc-600 hidden sm:inline">|</span>
          <span className="text-zinc-400 hidden sm:inline">
            Tabelas SAC e Price Atualizadas
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            Nuvem Ativa
          </span>
        </div>
      </div>

      {/* Main Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Official Brand Logo */}
        <div className="flex items-center justify-between">
          <TorresulLogo variant="red" size="md" />

          {/* Mobile TV Mode button */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenTVMode}
              className="p-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold flex items-center gap-1"
              title="Modo Apresentação TV"
            >
              <Tv className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Main Tool Tabs: Amortização, Aluguel vs Compra, Investidores */}
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 overflow-x-auto">
          <button
            type="button"
            onClick={() => onChangeFeatureTab('amortizacao')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeFeatureTab === 'amortizacao'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>Quitação Acelerada</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeFeatureTab('aluguel_vs_compra')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeFeatureTab === 'aluguel_vs_compra'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-zinc-600" />
            <span>Alugar vs. Comprar</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeFeatureTab('investidores')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeFeatureTab === 'investidores'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Investidores (Yield/Flip)</span>
          </button>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
          {/* Corretor vs Cliente Selector */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-xs">
            <button
              type="button"
              onClick={() => onToggleUserMode('broker')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${
                userMode === 'broker'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Corretor</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleUserMode('client')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${
                userMode === 'client'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Cliente</span>
            </button>
          </div>

          {/* TV Presentation Mode */}
          <button
            type="button"
            onClick={onOpenTVMode}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-xs"
            title="Modo Apresentação TV em Tela Cheia"
          >
            <Tv className="w-3.5 h-3.5 text-red-500" />
            <span>Modo TV</span>
          </button>

          {/* Share WhatsApp Modal */}
          <button
            type="button"
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Educational Guide */}
          <button
            type="button"
            onClick={onOpenEducationalModal}
            className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition"
            title="Como funciona a amortização acelerada?"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Reset button */}
          <button
            type="button"
            onClick={onResetToDefaults}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
            title="Restaurar simulação padrão"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
