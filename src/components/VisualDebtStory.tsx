import React from 'react';
import { SimulationResult, LoanInput, ExtraAmortizationInput } from '../types';
import { formatCurrency, formatTimeSaved } from '../utils/formatters';

interface VisualDebtStoryProps {
  loan: LoanInput;
  extra: ExtraAmortizationInput;
  result: SimulationResult;
}

export const VisualDebtStory: React.FC<VisualDebtStoryProps> = ({
  loan,
  extra,
  result,
}) => {
  const originalMonths = loan.termMonths || 360;
  const actualMonths = result.withAmortization.actualMonthsToPayoff;
  const monthsSaved = result.withAmortization.monthsSaved;
  const percentPaid = Math.min(100, Math.round((actualMonths / originalMonths) * 100));
  const percentSaved = Math.max(0, 100 - percentPaid);

  const financedAmount = result.financedAmount;
  const standardInterest = result.standard.totalInterestPaid;
  const amortInterest = result.withAmortization.totalInterestPaid;
  const interestSaved = result.withAmortization.interestSaved;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-xs p-5 sm:p-6 text-zinc-900 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
        <div>
          <h2 className="text-base font-bold text-zinc-900">
            4. Mapa Visual da Dívida e Redução de Prazo
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Visualize o encurtamento do tempo e o corte de juros ao longo da linha do tempo
          </p>
        </div>
        <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200">
          Linha do Tempo
        </span>
      </div>

      {/* Barra de Tempo do Contrato */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-zinc-700">
            Tempo de Financiamento: {actualMonths} meses pagos (
            <span className="text-red-600 font-bold">-{formatTimeSaved(monthsSaved)} eliminados</span>)
          </span>
          <span className="text-zinc-500 text-[11px]">
            Prazo Original: {originalMonths} meses ({Math.floor(originalMonths / 12)} anos)
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-6 w-full bg-zinc-100 rounded-lg overflow-hidden flex border border-zinc-200 p-0.5">
          {/* Active paying period */}
          <div
            className="h-full bg-zinc-900 rounded-l-md flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
            style={{ width: `${percentPaid}%` }}
          >
            {percentPaid > 15 ? `${actualMonths}m pagos` : ''}
          </div>

          {/* Eliminated period */}
          {percentSaved > 0 && (
            <div
              className="h-full bg-red-600 rounded-r-md flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
              style={{ width: `${percentSaved}%` }}
            >
              {percentSaved > 15 ? `-${monthsSaved}m cortados` : ''}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-zinc-900 inline-block" />
              Tempo real com a estratégia ({actualMonths} meses)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-red-600 inline-block" />
              Tempo eliminado ({monthsSaved} meses a menos)
            </span>
          </div>
          <span className="font-medium text-zinc-700">
            {percentSaved}% do tempo cancelado
          </span>
        </div>
      </div>

      {/* Comparação dos Blocos Financeiros (Capital vs Juros) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Bloco 1: Financiamento Padrão */}
        <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-3">
          <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider block">
            Distribuição no Financiamento Padrão
          </span>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Capital Financiado:</span>
              <span className="font-bold text-zinc-900 tabular-nums">{formatCurrency(financedAmount)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Juros Totais Pagos ao Banco:</span>
              <span className="font-bold text-zinc-900 tabular-nums">{formatCurrency(standardInterest)}</span>
            </div>
            <div className="flex justify-between font-bold text-zinc-900 pt-1 border-t border-zinc-200">
              <span>Desembolso Total:</span>
              <span className="tabular-nums">{formatCurrency(result.standard.totalAmountPaid)}</span>
            </div>
          </div>
        </div>

        {/* Bloco 2: Com Estratégia Torresul */}
        <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-900 text-white space-y-3">
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
            Distribuição com Estratégia Torresul
          </span>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-zinc-300">
              <span>Capital Financiado:</span>
              <span className="font-bold text-white tabular-nums">{formatCurrency(financedAmount)}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Novos Juros Pagos:</span>
              <span className="font-bold text-emerald-400 tabular-nums">{formatCurrency(amortInterest)}</span>
            </div>
            <div className="flex justify-between font-bold text-white pt-1 border-t border-zinc-700">
              <span>Economia de Juros:</span>
              <span className="text-emerald-400 tabular-nums">-{formatCurrency(interestSaved)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
