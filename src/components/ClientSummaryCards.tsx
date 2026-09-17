import React from 'react';
import { SimulationResult, LoanInput, ExtraAmortizationInput } from '../types';
import { formatCurrency, formatTimeSaved } from '../utils/formatters';

interface ClientSummaryCardsProps {
  loan: LoanInput;
  extra: ExtraAmortizationInput;
  result: SimulationResult;
}

export const ClientSummaryCards: React.FC<ClientSummaryCardsProps> = ({
  loan,
  extra,
  result,
}) => {
  const originalYears = Math.floor(loan.termMonths / 12);
  const payoffYears = result.withAmortization.yearsToPayoff;
  const payoffMonths = result.withAmortization.monthsRemaining;
  const monthsSaved = result.withAmortization.monthsSaved;
  const interestSaved = result.withAmortization.interestSaved;
  const installmentsEliminated = result.withAmortization.installmentsEliminatedCount;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* 1. Tempo de Quitação */}
      <div className="bg-white rounded-xl border border-zinc-200/90 p-4 shadow-xs">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
          Prazo de Quitação
        </span>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-zinc-900 tracking-tight tabular-nums">
            {payoffYears} <span className="text-sm font-semibold text-zinc-500">anos</span>
          </span>
          {payoffMonths > 0 && (
            <span className="text-sm font-bold text-zinc-900 tabular-nums">
              e {payoffMonths}m
            </span>
          )}
        </div>
        <span className="text-[11px] text-zinc-500 block mt-1">
          {monthsSaved > 0 ? (
            <span className="text-red-600 font-bold">
              -{formatTimeSaved(monthsSaved)} a menos
            </span>
          ) : (
            `De ${originalYears} anos contratuais`
          )}
        </span>
      </div>

      {/* 2. Parcelas Eliminadas */}
      <div className="bg-white rounded-xl border border-zinc-200/90 p-4 shadow-xs">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
          Parcelas Cortadas
        </span>
        <div className="mt-1.5">
          <span className="text-2xl font-bold text-red-600 tracking-tight tabular-nums">
            {installmentsEliminated}
          </span>
          <span className="text-xs font-semibold text-zinc-500 ml-1">parcelas do fim</span>
        </div>
        <span className="text-[11px] text-zinc-500 block mt-1">
          {installmentsEliminated > 0
            ? 'Quitadas sem incidência de juros futuros'
            : 'Nenhuma parcela antecipada'}
        </span>
      </div>

      {/* 3. Juros Evitados */}
      <div className="bg-white rounded-xl border border-zinc-200/90 p-4 shadow-xs">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
          Juros Economizados
        </span>
        <div className="mt-1.5">
          <span className="text-2xl font-bold text-emerald-600 tracking-tight tabular-nums">
            {formatCurrency(interestSaved)}
          </span>
        </div>
        <span className="text-[11px] text-zinc-500 block mt-1">
          Dinheiro que deixa de ir para o banco
        </span>
      </div>

      {/* 4. Prestação Mensal Atual */}
      <div className="bg-white rounded-xl border border-zinc-200/90 p-4 shadow-xs">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
          1ª Prestação Estimada
        </span>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-zinc-900 tracking-tight tabular-nums">
            {formatCurrency(result.standard.initialInstallment)}
          </span>
          <span className="text-xs font-normal text-zinc-500">/mês</span>
        </div>
        <span className="text-[11px] text-zinc-500 block mt-1">
          {loan.system === 'SAC'
            ? `Decresce até ${formatCurrency(result.standard.finalInstallment)}`
            : 'Parcela 100% fixa'}
        </span>
      </div>
    </div>
  );
};
