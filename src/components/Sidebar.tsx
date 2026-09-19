import React, { useState, useRef, useEffect } from 'react';
import { 
  Wallet, 
  Calculator, 
  FileText, 
  Layers, 
  ChevronRight, 
  Sparkles, 
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
      badge: '3 abas',
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
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(20, 0, 0, 0.3) 0%, rgba(10, 0, 0, 0.6) 20%, rgba(0, 0, 0, 0.95) 50%, rgba(0, 0, 0, 1) 100%), url(${sidebarBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        className={`fixed top-0 bottom-0 left-0 z-50 border-r border-red-900/30 shadow-2xl md:shadow-none flex flex-col transition-all duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 w-64' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-18' : 'md:w-60'}`}
      >
        {/* Brand Header */}
        <div className="p-3.5 border-b border-red-900/40 flex items-center justify-between text-white bg-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-black/40 p-0.5 flex items-center justify-center shrink-0 border border-red-900/30">
              <TorreSulLogo size={30} className="w-7 h-7 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs tracking-tight text-white font-heading truncate drop-shadow-md">
                    TORRESUL
                  </span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-red-200 border border-red-900/50 font-bold uppercase tracking-wider backdrop-blur-sm">
                    Tools
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate font-medium">
                  Imobiliária & Back Office
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
              title={isCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Google Cloud Auth & User Status (Directly visible at top) */}
        <div ref={settingsRef} className="p-2.5 border-b border-red-900/30 bg-black/20 backdrop-blur-sm relative z-50">
          
          {/* Settings & Auth Popup Modal */}
          {isSettingsOpen && (
            <div className="absolute top-full left-2 right-2 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3.5 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Settings className="w-4 h-4 text-slate-600" />
                  <span>Configurações & Nuvem</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Corretor'}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'TS'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user.displayName || 'Corretor Conectado'}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] px-1 text-slate-600">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Nuvem Sincronizada
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
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                        <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={isAuthLoading}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/60 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isAuthLoading ? 'Saindo...' : 'Sair do Sistema'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Sua conta está conectada ao banco de dados da Torresul.
                  </p>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isAuthLoading}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-98"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair do Sistema</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* User Banner at Bottom */}
          <div className="flex items-center justify-between p-1.5 rounded-xl bg-black/40 border border-red-900/30 shadow-2xs backdrop-blur-sm">
            <div 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer select-none"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Corretor'}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-red-500 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-red-950/80 text-red-200 flex items-center justify-center font-bold text-[10px] shrink-0 border border-red-900/50">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'TS')}
                </div>
              )}
              {!isCollapsed && (
                <div className="truncate">
                  <span className="font-bold text-white block truncate text-xs">
                    {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Corretor'}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-semibold block truncate flex items-center gap-1 drop-shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                    Nuvem Conectada
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-black/30 rounded-lg transition cursor-pointer"
              title="Conta & Sincronização"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-2 flex-1 overflow-y-auto space-y-4">
          <div>
            {!isCollapsed && (
              <div className="px-2 mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Ferramentas
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
                    className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 group relative border backdrop-blur-sm ${
                      isActive
                        ? 'bg-red-950/60 border-red-500/50 shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)]'
                        : 'bg-red-950/30 border-red-900/40 hover:bg-red-950/50 hover:border-red-800/60'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        isActive
                          ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)] border border-red-500'
                          : 'bg-black/40 text-red-200/70 group-hover:text-red-100 group-hover:bg-black/60 border border-red-950/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className={`text-xs font-bold truncate transition-colors ${isActive ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                            {tool.title}
                          </span>
                        </div>
                        <p className={`text-[10px] truncate transition-colors ${isActive ? 'text-red-200/80' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                          {tool.subtitle}
                        </p>
                      </div>
                    )}
                    {!isCollapsed && tool.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold border shrink-0 transition-colors ${
                          isActive 
                            ? 'bg-red-500/20 text-red-200 border-red-500/30' 
                            : 'bg-black/40 text-red-300/70 border-red-900/30 group-hover:border-red-900/50'
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
        <div className="p-3 border-t border-red-900/30 text-center text-[10px] text-zinc-500 bg-black/20 backdrop-blur-sm">
          {!isCollapsed && <span>Torresul Imobiliária © {new Date().getFullYear()}</span>}
        </div>
      </aside>
    </>
  );
};
