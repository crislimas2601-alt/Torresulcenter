import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Torresul Imobiliária</span>
          <span className="text-slate-300">•</span>
          <span>Sistema Comercial & Gestão de Vendas</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span>© {currentYear} Todos os direitos reservados</span>
        </div>
      </div>
    </footer>
  );
};
