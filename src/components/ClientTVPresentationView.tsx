import React from 'react';
import { SimulationResult, LoanInput, ExtraAmortizationInput } from '../types';
import { formatCurrency, formatTimeSaved } from '../utils/formatters';
import { TorresulLogo } from './TorresulLogo';
import { X, CheckCircle2, TrendingDown, Clock, ShieldCheck, Sparkles } from 'lucide-react';

interface ClientTVPresentationViewProps {
  loan: LoanInput;
  extra: ExtraAmortizationInput;
  result: SimulationResult;
  onExit: () => void;
}

export const ClientTVPresentationView: React.FC<ClientTVPresentationViewProps> = ({
  loan,
  extra,
  result,
  onExit,
}) => {
  const originalYears = Math.floor(loan.termMonths / 12);
  const payoffYears = result.withAmortization.yearsToPayoff;
  const payoffMonths = result.withAmortization.monthsRemaining;
  const monthsSaved = result.withAmortization.monthsSaved;
  const interestSaved = result.withAmortization.interestSaved;
  const installmentsEliminated = result.withAmortization.installmentsEliminatedCount;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 text-white overflow-y-auto p-6 sm:p-10 flex flex-col justify-between">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
        <TorresulLogo variant="white" size="lg" />

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-zinc-400 block font-medium">Modo Telão / Reunião com Cliente</span>
            <span className="text-sm font-bold text-red-500 uppercase tracking-wider">
              Apresentação Comercial Exclusiva
            </span>
          </div>

          <button
            type="button"
            onClick={onExit}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Sair do Modo TV</span>
          </button>
        </div>
      </div>

      {/* Main Content Showcase */}
      <div className="my-auto py-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-widest inline-block">
            Estratégia de Quitação Acelerada
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            De <span className="line-through text-zinc-500">{originalYears} Anos</span> para{' '}
            <span className="text-red-500 underline decoration-red-600 underline-offset-8">
              {payoffYears} Anos {payoffMonths > 0 ? `e ${payoffMonths} Meses` : ''}
            </span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-lg max-w-2xl mx-auto font-medium">
            Imóvel de {formatCurrency(loan.propertyValue)} financiado pela Caixa Econômica Federal.
          </p>
        </div>

        {/* 3 Large Showcase Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Juros Economizados */}
          <div className="p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 relative overflow-hidden flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Juros Economizados
              </span>
              <div className="text-4xl sm:text-5xl font-black text-emerald-400 mt-3 tabular-nums tracking-tight">
                {formatCurrency(interestSaved)}
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-4 border-t border-zinc-800 pt-3">
              Dinheiro real que deixa de ser pago ao banco e permanece como patrimônio da família.
            </p>
          </div>

          {/* Card 2: Parcelas Eliminadas */}
          <div className="p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 relative overflow-hidden flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Parcelas Cortadas do Fim
              </span>
              <div className="text-4xl sm:text-5xl font-black text-red-500 mt-3 tabular-nums tracking-tight">
                {installmentsEliminated}
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-4 border-t border-zinc-800 pt-3">
              Prestações canceladas da última para a primeira, livres de qualquer incidência de juros.
            </p>
          </div>

          {/* Card 3: Tempo Total Ganho */}
          <div className="p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 relative overflow-hidden flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Anos de Vida Ganhos
              </span>
              <div className="text-4xl sm:text-5xl font-black text-white mt-3 tabular-nums tracking-tight">
                {formatTimeSaved(monthsSaved)}
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-4 border-t border-zinc-800 pt-3">
              Liberdade financeira conquistada muito antes do prazo de 30 anos estipulado no banco.
            </p>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-red-500 shrink-0" />
            <span className="text-xs text-zinc-300 font-medium">
              Simulação desenvolvida com metodologia oficial Caixa Econômica Federal e Tabela SAC.
            </span>
          </div>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider hidden md:block">
            Torresul Imobiliária • Blumenau / SC
          </span>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="pt-6 border-t border-zinc-800 text-center text-xs text-zinc-500">
        Valores estimados sujeitos à análise de crédito e regras do FGTS vigentes.
      </div>
    </div>
  );
};
