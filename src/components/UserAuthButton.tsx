import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  signInWithEmail, 
  signUpWithEmail, 
  logoutUser 
} from '../lib/firebase';
import { 
  Cloud, 
  LogOut, 
  LogIn, 
  RefreshCw, 
  User as UserIcon, 
  ChevronDown, 
  AlertCircle, 
  Mail, 
  Lock, 
  X 
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
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Informe o e-mail e a senha.');
      return;
    }
    try {
      setIsLoading(true);
      setErrorMessage(null);
      if (isRegisterMode) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      setShowEmailModal(false);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password' || err?.code === 'auth/user-not-found') {
        setErrorMessage('E-mail ou senha incorretos.');
      } else if (err?.code === 'auth/email-already-in-use') {
        setErrorMessage('Este e-mail já está cadastrado. Faça login.');
      } else if (err?.code === 'auth/weak-password') {
        setErrorMessage('A senha precisa ter pelo menos 6 caracteres.');
      } else if (err?.code === 'auth/operation-not-allowed') {
        setErrorMessage('O login com e-mail/senha ainda não foi ativado no Firebase Console.');
      } else {
        setErrorMessage(err?.message || 'Erro ao autenticar. Verifique os dados.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await logoutUser();
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null);
              setIsRegisterMode(false);
              setShowEmailModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer border border-slate-700 active:scale-98"
            title="Entrar com E-mail e Senha"
          >
            <LogIn className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="hidden sm:inline">Entrar / Acessar</span>
            <span className="sm:hidden">Entrar</span>
          </button>
        </div>

        {/* Email Auth Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-red-500" />
                  <h3 className="font-bold text-sm">
                    {isRegisterMode ? 'Criar Conta' : 'Acessar Conta'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEmailAuthSubmit} className="p-5 space-y-4">
                {errorMessage && (
                  <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Processando...' : (isRegisterMode ? 'Cadastrar e Entrar' : 'Entrar')}
                </button>

                <div className="pt-2 text-center border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(!isRegisterMode);
                      setErrorMessage(null);
                    }}
                    className="text-xs text-slate-600 hover:text-red-600 font-medium transition cursor-pointer"
                  >
                    {isRegisterMode 
                      ? 'Já tem uma conta? Clique para Entrar' 
                      : 'Não tem conta? Clique para Cadastrar'}
                  </button>
                </div>
              </form>
            </div>
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
        title="Gerenciar Conta"
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
            {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Corretor'}
          </span>
          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Online
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
                {user.displayName || user.email?.split('@')[0] || 'Corretor Torresul'}
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
              Seus dados são sincronizados com a nuvem em tempo real. Você pode acessar de qualquer computador ou celular com seu e-mail e senha.
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
