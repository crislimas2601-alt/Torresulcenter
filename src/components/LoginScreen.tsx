import React, { useState } from 'react';
import { TorresulLogo } from './TorresulLogo';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  resetPasswordWithEmail,
  saveSessionTimestamp
} from '../lib/firebase';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onSuccess?: () => void;
  expiredNotice?: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onSuccess,
  expiredNotice = null 
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberSevenDays, setRememberSevenDays] = useState(true);

  // Status and feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(expiredNotice);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getFriendlyErrorMessage = (error: any): string => {
    const code = error?.code || '';
    setErrorCode(code);
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'E-mail ou senha incorretos. Verifique se digitou corretamente ou redefina sua senha.';
      case 'auth/email-already-in-use':
        return 'Este e-mail já foi cadastrado anteriormente.';
      case 'auth/weak-password':
        return 'A senha deve conter no mínimo 6 caracteres.';
      case 'auth/invalid-email':
        return 'Informe um endereço de e-mail válido.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas sem sucesso. Aguarde alguns instantes ou redefina sua senha.';
      case 'auth/operation-not-allowed':
        return 'O método de E-mail e Senha ainda não foi ativado no Firebase Console. Ative o provedor "E-mail/senha" na aba "Sign-in method" da Autenticação do Firebase.';
      case 'auth/network-request-failed':
        return 'Sem conexão com a internet. Verifique sua rede.';
      default:
        return error?.message || 'Não foi possível processar o acesso. Tente novamente.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorCode(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    if (mode === 'reset') {
      if (!cleanEmail) {
        setErrorMessage('Informe seu e-mail para recuperar a senha.');
        return;
      }
      try {
        setIsLoading(true);
        await resetPasswordWithEmail(cleanEmail);
        setSuccessMessage(`Enviamos um link de redefinição para ${cleanEmail}. Verifique sua caixa de entrada e spam.`);
      } catch (err: any) {
        setErrorMessage(getFriendlyErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!cleanEmail || !password) {
      setErrorMessage('Preencha os campos obrigatórios.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setErrorMessage('A senha deve conter pelo menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('As senhas não coincidem. Digite a mesma senha em ambos os campos.');
        return;
      }
    }

    try {
      setIsLoading(true);

      if (mode === 'register') {
        await signUpWithEmail(cleanEmail, password, name.trim());
      } else {
        await signInWithEmail(cleanEmail, password);
      }

      if (rememberSevenDays) {
        saveSessionTimestamp();
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 py-12 sm:px-6 font-sans">
      <div className="w-full max-w-sm">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3.5">
            <TorresulLogo size={46} variant="red" layout="icon-only" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Torresul Imobiliária
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login' && 'Acesse sua conta para continuar'}
            {mode === 'register' && 'Cadastre seu usuário para acessar o sistema'}
            {mode === 'reset' && 'Recuperação de acesso ao sistema'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
          
          {/* Messages */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed space-y-2">
              <p className="font-medium">{errorMessage}</p>
              
              {/* Quick actions depending on error */}
              {(errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') && mode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('reset');
                    setErrorMessage(null);
                  }}
                  className="inline-flex items-center text-xs font-semibold text-red-800 underline hover:text-red-950 cursor-pointer"
                >
                  Esqueceu a senha? Clique para redefinir agora →
                </button>
              )}

              {errorCode === 'auth/email-already-in-use' && mode === 'register' && (
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                    }}
                    className="text-xs font-semibold text-red-800 underline hover:text-red-950 cursor-pointer"
                  >
                    Fazer Login →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setErrorMessage(null);
                    }}
                    className="text-xs font-semibold text-red-800 underline hover:text-red-950 cursor-pointer"
                  >
                    Redefinir Senha →
                  </button>
                </div>
              )}
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs leading-relaxed">
              <p className="font-medium">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome e sobrenome"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmail((prev) => prev.trim())}
                placeholder="seu.email@torresul.com.br"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-700">
                    Senha
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      Esqueci minha senha
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita sua senha"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberSevenDays}
                    onChange={(e) => setRememberSevenDays(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600">
                    Manter conectado por 7 dias
                  </span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
              <span>
                {mode === 'login' && 'Entrar'}
                {mode === 'register' && 'Criar Conta'}
                {mode === 'reset' && 'Enviar Instruções'}
              </span>
            </button>
          </form>

          {/* Mode Switchers */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            {mode === 'login' && (
              <p className="text-xs text-slate-500">
                Ainda não tem acesso?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-medium text-slate-900 hover:underline cursor-pointer"
                >
                  Cadastre-se
                </button>
              </p>
            )}

            {mode === 'register' && (
              <p className="text-xs text-slate-500">
                Já possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-medium text-slate-900 hover:underline cursor-pointer"
                >
                  Fazer login
                </button>
              </p>
            )}

            {mode === 'reset' && (
              <p className="text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-medium text-slate-900 hover:underline cursor-pointer"
                >
                  Voltar ao login
                </button>
              </p>
            )}
          </div>

        </div>

        {/* Discreet Footer */}
        <p className="text-center text-xs text-slate-400 mt-8">
          Torresul Imobiliária
        </p>

      </div>
    </div>
  );
};
