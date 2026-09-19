import React from 'react';
import { 
  Plus, 
  Menu, 
  LayoutDashboard, 
  Database 
} from 'lucide-react';
import { ContractDeal } from '../types';
import { TorreSulLogo } from './TorresulLogo';

interface HeaderProps {
  onOpenNewDeal: () => void;
  deals: ContractDeal[];
  activeTab: 'dashboard' | 'database';
  onTabChange: (tab: 'dashboard' | 'database') => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewDeal,
  deals,
  activeTab,
  onTabChange,
  onToggleSidebar,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Abrir menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-3">
              <TorreSulLogo size={36} />
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                  Gestão de Comissões & Vendas
                </h1>
                <p className="text-xs text-slate-500 font-normal">
                  Controle de contratos, repasses e fluxo de recebíveis
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200/80">
            <button
              type="button"
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-red-600" />
              <span>Visão geral</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('database')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
                activeTab === 'database'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-slate-600" />
              <span>Banco de vendas ({deals.length})</span>
            </button>
          </div>

          {/* Action: Nova Venda */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              id="btn-header-new-deal"
              onClick={onOpenNewDeal}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Cadastrar venda</span>
              <span className="sm:hidden">Nova venda</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
