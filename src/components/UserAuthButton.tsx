import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  signInWithGoogle, 
  logoutGoogle 
} from '../lib/firebase';
import { 
  Cloud, 
  CloudCheck, 
  LogOut, 
  LogIn, 
  RefreshCw, 
  ShieldCheck, 
  User as UserIcon, 
  ChevronDown,
  AlertCircle
} from 'lucide-react';

interface UserAuthButtonProps {
  user: User | null;
  isSyncing: boolean;
  onSyncNow?: () => void;
  dealsCount: number;
}

export const UserAuthButton: React.FC<UserAuthButtonProps> = ({
  user,
  isSyncing,
  onSyncNow,
  dealsCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await signInWithGoogle();
      setIsOpen(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Não foi possível conectar com o Google. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await logoutGoogle();
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={handleSignIn}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer border border-slate-700 active:scale-98"
          title="Fazer login com Google para salvar suas comissões na nuvem"
        >
          {/* Google Logo G */}
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
          <span className="hidden sm:inline">Entrar com Google</span>
          <span className="sm:hidden">Entrar</span>
        </button>

        {errorMessage && (
          <div className="absolute right-0 mt-2 w-64 bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 shadow-xl z-50 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold transition cursor-pointer"
        title="Gerenciar Conta & Nuvem Google"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'Usuário'}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
            {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
          </div>
        )}

        <div className="hidden sm:flex flex-col items-start text-left leading-tight">
          <span className="text-[11px] font-bold text-slate-900 truncate max-w-[100px]">
            {user.displayName?.split(' ')[0] || 'Corretor'}
          </span>
          <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Nuvem Ativa
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* User Info Header */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center gap-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Usuário'}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-400"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
                <UserIcon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-xs truncate text-white">
                {user.displayName || 'Corretor Torresul'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user.email}
              </p>
            </div>
          </div>

          {/* Cloud Status Box */}
          <div className="p-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500 text-white rounded-lg">
                <Cloud className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-emerald-950 text-[11px]">
                  Banco Seguro na Nuvem
                </p>
                <p className="text-[10px] text-emerald-700">
                  {dealsCount} venda{dealsCount !== 1 ? 's' : ''} sincronizada{dealsCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {onSyncNow && (
              <button
                type="button"
                onClick={onSyncNow}
                disabled={isSyncing}
                className="px-2 py-1 rounded-md bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                title="Sincronizar agora com a nuvem"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                <span>{isSyncing ? 'Salvando...' : 'Sincronizar'}</span>
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="p-2 space-y-1">
            <div className="px-2.5 py-1.5 text-[10px] text-slate-500 leading-relaxed">
              Seus dados agora são salvos automaticamente no seu e-mail Google. Você pode acessar de qualquer computador ou celular.
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Desconectar Conta Google</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
