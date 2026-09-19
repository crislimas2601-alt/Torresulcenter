import React from 'react';
import { SimulationResult, LoanInput, ExtraAmortizationInput } from '../types';
import { formatCurrency, formatTimeSaved } from '../utils/formatters';
import { TorresulLogo } from './TorresulLogo';
import { X, TrendingDown, Clock, ShieldCheck, DollarSign, Calendar } from 'lucide-react';

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
  const reductionPercentage = Math.round((monthsSaved / loan.termMonths) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-white via-slate-900 to-black text-slate-900 overflow-y-auto p-6 sm:p-10 flex flex-col justify-between">
      {/* Top Bar (White / Light zone) */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200/80">
        <TorresulLogo variant="red" size="lg" />

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-600 font-medium block">Projeção de Amortização Financeira</span>
            <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider block">
              Simulação Comercial
            </span>
          </div>

          <button
            type="button"
            onClick={onExit}
            className="px-3.5 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white transition flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
            <span>Sair do modo TV</span>
          </button>
        </div>
      </div>

      {/* Main Content Showcase */}
      <div className="my-auto py-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Main Headline */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-heading">
            De <span className="line-through text-slate-400">{originalYears} anos</span> para{' '}
            <span className="text-red-500">
              {payoffYears} {payoffYears === 1 ? 'ano' : 'anos'}{payoffMonths > 0 ? ` e ${payoffMonths} m` : ''}
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-normal">
            Imóvel de <strong className="text-white">{formatCurrency(loan.propertyValue)}</strong> • Financiamento de <strong className="text-white">{formatCurrency(result.financedAmount)}</strong> • Tabela {loan.system}
          </p>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Economia em Juros */}
          <div className="p-6 sm:p-7 rounded-lg bg-slate-950/85 border border-slate-800 text-white flex flex-col justify-between shadow-lg backdrop-blur-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Economia em Juros
                </span>
                <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-400 mt-4 tabular-nums tracking-tight">
                {formatCurrency(interestSaved)}
              </div>
            </div>
            <div className="pt-4 mt-6 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
              <span>Juros evitados</span>
              <span className="text-slate-200 font-semibold tabular-nums">
                {Math.round((interestSaved / (result.standard.totalInterestPaid || 1)) * 100)}% a menos
              </span>
            </div>
          </div>

          {/* Card 2: Parcelas Eliminadas */}
          <div className="p-6 sm:p-7 rounded-lg bg-slate-950/85 border border-slate-800 text-white flex flex-col justify-between shadow-lg backdrop-blur-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Parcelas Eliminadas
                </span>
                <div className="p-1.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 tabular-nums tracking-tight">
                {installmentsEliminated} <span className="text-lg sm:text-xl font-medium text-slate-400">meses</span>
              </div>
            </div>
            <div className="pt-4 mt-6 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
              <span>Prazo de quitação</span>
              <span className="text-slate-200 font-semibold tabular-nums">
                {result.withAmortization.actualMonthsToPayoff} de {loan.termMonths} parcelas
              </span>
            </div>
          </div>

          {/* Card 3: Tempo Economizado */}
          <div className="p-6 sm:p-7 rounded-lg bg-slate-950/85 border border-slate-800 text-white flex flex-col justify-between shadow-lg backdrop-blur-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Tempo Economizado
                </span>
                <div className="p-1.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 tabular-nums tracking-tight">
                {formatTimeSaved(monthsSaved)}
              </div>
            </div>
            <div className="pt-4 mt-6 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
              <span>Redução de prazo</span>
              <span className="text-slate-200 font-semibold tabular-nums">
                {reductionPercentage}% mais rápido
              </span>
            </div>
          </div>
        </div>

        {/* Input Parameters Reference Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
          <div>
            <span className="text-slate-400 block text-[11px]">Aporte extra mensal:</span>
            <span className="font-semibold text-slate-200 tabular-nums">
              {extra.recurringMonthlyAmount > 0 ? formatCurrency(extra.recurringMonthlyAmount) : 'R$ 0,00'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Aporte FGTS (bi-anual):</span>
            <span className="font-semibold text-slate-200 tabular-nums">
              {extra.recurringBiAnnualFGTS > 0 ? formatCurrency(extra.recurringBiAnnualFGTS) : 'R$ 0,00'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Aporte único:</span>
            <span className="font-semibold text-slate-200 tabular-nums">
              {extra.oneTimeAmount > 0 ? `${formatCurrency(extra.oneTimeAmount)} (mês ${extra.oneTimeMonth})` : 'R$ 0,00'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Taxa de juros:</span>
            <span className="font-semibold text-slate-200 tabular-nums">
              {loan.annualInterestRate.toFixed(2)}% a.a.
            </span>
          </div>
        </div>

        {/* Institutional Guarantee Bar */}
        <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
            <span>
              Simulação estruturada com regras oficiais do Sistema Financeiro de Habitação (SFH) e Caixa Econômica Federal.
            </span>
          </div>
          <span className="text-slate-400 font-medium shrink-0">
            Torresul Imobiliária • Blumenau / SC
          </span>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
        Valores estimados com base nos parâmetros inseridos, sujeitos à análise de crédito e condições contratuais.
      </div>
    </div>
  );
};
