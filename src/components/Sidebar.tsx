import React, { useState, useRef, useEffect } from 'react';
import { 
  Wallet, 
  Calculator, 
  FileText, 
  Layers, 
  ChevronRight, 
  X, 
  TrendingDown, 
  Building2, 
  ShieldCheck, 
  Cloud,
  Settings,
  LogIn,
  LogOut,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { AppToolMode } from '../types';
import { TorreSulLogo } from './TorresulLogo';
import { User, logoutUser } from '../lib/firebase';
import sidebarBgImage from '../assets/images/sidebar_premium_red_top_down_1789674732097.jpg';

interface SidebarProps {
  currentMode: AppToolMode;
  onSelectMode: (mode: AppToolMode) => void;
  dealsCount: number;
  proposalsCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  user?: User | null;
  isSyncing?: boolean;
  onSyncNow?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentMode,
  onSelectMode,
  dealsCount,
  proposalsCount,
  isOpenMobile,
  onCloseMobile,
  user = null,
  isSyncing = false,
  onSyncNow,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close settings popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      setIsAuthLoading(true);
      await logoutUser();
      setIsSettingsOpen(false);
    } catch (err) {
      console.error('Erro ao desconectar:', err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const tools = [
    {
      id: 'amortizacao' as AppToolMode,
      title: 'Simulador Imobiliário',
      subtitle: 'Amortização, Aluguel & Investidor',
      icon: TrendingDown,
      badge: undefined,
    },
    {
      id: 'proposta' as AppToolMode,
      title: 'Gerador de Propostas',
      subtitle: 'Cálculo & Copiar p/ Sistema',
      icon: FileText,
      badge: undefined,
    },
    {
      id: 'comissoes' as AppToolMode,
      title: 'Comissões & Vendas',
      subtitle: 'Contratos, VGV & Fluxo',
      icon: Wallet,
      badge: dealsCount > 0 ? `${dealsCount}` : undefined,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#12141a] border-r border-zinc-800 shadow-xl md:shadow-none flex flex-col transition-all duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 w-64' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-18' : 'md:w-60'}`}
      >
        {/* Brand Header */}
        <div className="p-3.5 border-b border-zinc-800/90 flex items-center justify-between text-white bg-zinc-950/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md bg-zinc-900 p-0.5 flex items-center justify-center shrink-0 border border-zinc-800">
              <TorreSulLogo size={24} className="w-6 h-6 text-red-600" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-bold text-xs tracking-wider text-white font-heading truncate block">
                  TORRESUL
                </span>
                <p className="text-[10px] text-zinc-400 truncate font-normal">
                  Sistema Comercial
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition cursor-pointer"
              title={isCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden text-zinc-400 hover:text-white p-1 rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Google Cloud Auth & User Status */}
        <div ref={settingsRef} className="p-2.5 border-b border-zinc-800/60 bg-zinc-950/30 relative z-50">
          
          {/* Settings & Auth Popup Modal */}
          {isSettingsOpen && (
            <div className="absolute top-full left-2 right-2 mt-1.5 bg-white rounded-lg border border-slate-200 shadow-xl p-3.5 z-50 text-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Settings className="w-3.5 h-3.5 text-slate-600" />
                  <span>Configurações & Nuvem</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {user ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-md border border-slate-100">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Corretor'}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'TS'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user.displayName || 'Corretor'}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] px-0.5 text-slate-600">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Nuvem sincronizada
                    </span>
                    <span className="font-semibold text-slate-700">{dealsCount} vendas</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {onSyncNow && (
                      <button
                        type="button"
                        onClick={() => {
                          onSyncNow();
                          setIsSettingsOpen(false);
                        }}
                        disabled={isSyncing}
                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                        <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar agora'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={isAuthLoading}
                      className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/60 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isAuthLoading ? 'Saindo...' : 'Sair do sistema'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sua conta está conectada ao banco de dados da Torresul.
                  </p>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isAuthLoading}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair do sistema</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* User Banner at Top */}
          <div className="flex items-center justify-between p-2 rounded-md bg-zinc-900/90 border border-zinc-800">
            <div 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer select-none"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Corretor'}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-zinc-700 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold text-[10px] shrink-0 border border-zinc-700">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'TS')}
                </div>
              )}
              {!isCollapsed && (
                <div className="truncate">
                  <span className="font-semibold text-white block truncate text-xs">
                    {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Corretor'}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium block truncate flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Sincronizado
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition cursor-pointer"
              title="Conta & Sincronização"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-2 flex-1 overflow-y-auto space-y-4">
          <div>
            {!isCollapsed && (
              <div className="px-2 mb-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Módulos
                </span>
              </div>
            )}

            <nav className="space-y-1" aria-label="Navegação Lateral de Ferramentas">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = currentMode === tool.id;

                return (
                  <button
                    key={tool.id}
                    id={`sidebar-btn-${tool.id}`}
                    type="button"
                    onClick={() => {
                      onSelectMode(tool.id);
                      onCloseMobile();
                    }}
                    title={tool.title}
                    className={`w-full text-left p-2 rounded-lg transition-all cursor-pointer flex items-center gap-2.5 group relative border ${
                      isActive
                        ? 'bg-zinc-800/90 border-zinc-700 text-white shadow-2xs'
                        : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-all ${
                        isActive
                          ? 'bg-red-600 text-white'
                          : 'bg-zinc-900 text-zinc-400 group-hover:text-zinc-200 border border-zinc-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className={`text-xs font-medium truncate transition-colors ${isActive ? 'text-white font-semibold' : 'text-zinc-300 group-hover:text-white'}`}>
                            {tool.title}
                          </span>
                        </div>
                        <p className={`text-[10px] truncate transition-colors ${isActive ? 'text-zinc-300' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                          {tool.subtitle}
                        </p>
                      </div>
                    )}
                    {!isCollapsed && tool.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium border shrink-0 transition-colors ${
                          isActive 
                            ? 'bg-red-600 text-white border-red-500' 
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        {tool.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom spacer / Minimal status */}
        <div className="p-3 border-t border-zinc-800/80 text-center text-[10px] text-zinc-500 bg-zinc-950/40">
          {!isCollapsed && <span>Torresul Imobiliária • {new Date().getFullYear()}</span>}
        </div>
      </aside>
    </>
  );
};
