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
import { User, signInWithGoogle, logoutGoogle } from '../lib/firebase';

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

  const handleSignIn = async () => {
    try {
      setIsAuthLoading(true);
      // If we are embedded inside the preview iframe, standard popups get blocked or close immediately by cross-origin security
      if (window.self !== window.top) {
        // Open the app in standalone new tab where Google Auth popup works without restrictions
        window.open(window.location.href, '_blank');
        setIsAuthLoading(false);
        return;
      }
      await signInWithGoogle();
      setIsSettingsOpen(false);
    } catch (err) {
      console.error('Erro ao conectar Google:', err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsAuthLoading(true);
      await logoutGoogle();
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
        className={`fixed top-0 bottom-0 left-0 z-50 bg-zinc-900 border-r border-zinc-800 shadow-xl md:shadow-none flex flex-col transition-all duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 w-64' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-18' : 'md:w-60'}`}
      >
        {/* Brand Header */}
        <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-zinc-950 p-0.5 flex items-center justify-center shrink-0">
              <TorreSulLogo size={30} className="w-7 h-7 text-red-600" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs tracking-tight text-white font-heading truncate">
                    TORRE SUL
                  </span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold uppercase tracking-wider">
                    Tools
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate">
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
        <div ref={settingsRef} className="p-2.5 border-b border-zinc-800 bg-zinc-900 relative">
          
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
                      <span>Desconectar Conta Google</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Conecte sua conta do Google para salvar seus contratos e propostas na nuvem com segurança total.
                  </p>

                  <button
                    type="button"
                    onClick={handleSignIn}
                    disabled={isAuthLoading}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-98"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{isAuthLoading ? 'Conectando...' : 'Entrar com Google'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Top Button / User Banner */}
          {user ? (
            <div className="flex items-center justify-between p-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer select-none"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Corretor'}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-red-500 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0 border border-zinc-700">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'TS'}
                  </div>
                )}
                {!isCollapsed && (
                  <div className="truncate">
                    <span className="font-bold text-slate-900 block truncate text-xs">
                      {user.displayName?.split(' ')[0] || 'Corretor'}
                    </span>
                    <span className="text-[9px] text-emerald-600 font-semibold block truncate flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Nuvem Conectada
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                title="Configurações e Conta"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              {!isCollapsed ? (
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isAuthLoading}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-zinc-200 truncate">
                      {isAuthLoading ? 'Entrando...' : 'Entrar com Google'}
                    </span>
                  </div>
                  <Settings className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isAuthLoading}
                  className="w-full flex items-center justify-center p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition cursor-pointer shadow-2xs"
                  title="Entrar com Google"
                >
                  <Settings className="w-4 h-4 text-zinc-400" />
                </button>
              )}
            </div>
          )}
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
                    className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 group relative border ${
                      isActive
                        ? 'bg-zinc-800 border-zinc-700 shadow-sm'
                        : 'bg-transparent hover:bg-zinc-800/50 border-transparent hover:border-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-zinc-300 group-hover:text-zinc-100'}`}>
                            {tool.title}
                          </span>
                        </div>
                        <p className={`text-[10px] truncate ${isActive ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          {tool.subtitle}
                        </p>
                      </div>
                    )}

                    {!isCollapsed && tool.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold border shrink-0 ${
                          isActive 
                            ? 'bg-zinc-900 text-zinc-300 border-zinc-700' 
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
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
        <div className="p-3 border-t border-zinc-800 text-center text-[10px] text-zinc-500">
          {!isCollapsed && <span>Torresul Imobiliária © {new Date().getFullYear()}</span>}
        </div>
      </aside>
    </>
  );
};
