import React from 'react';
import { Shield, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white/80 backdrop-blur-xs py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        
        {/* Left: Branding & Rights */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>CrisBranding</span>
          </div>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span>
            Idealizado e Desenvolvido por <strong className="text-slate-800 font-medium">CreatedByCris</strong>
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span>© {currentYear} Todos os direitos reservados</span>
        </div>

        {/* Right: Security Badge & System Integrity */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-slate-600 font-medium">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dados 100% Seguros & Privados</span>
          </div>
          <div className="hidden lg:flex items-center gap-1 text-slate-400">
            <span>Versão Exclusiva para Corretores</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
