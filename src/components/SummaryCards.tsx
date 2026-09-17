import React from 'react';
import { ProposalData } from '../types';
import { calculateProposalTotals } from '../utils/calculator';
import { formatBRL } from '../utils/formatter';
import {
  Building2,
  DollarSign,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface SummaryCardsProps {
  proposal: ProposalData;
  onBalanceEntrada: () => void;
  onBalanceFinanciamento: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  proposal,
  onBalanceEntrada,
  onBalanceFinanciamento,
}) => {
  const totals = calculateProposalTotals(proposal);
  // Exato ao centavo: qualquer centavo quebrado é acusado para não dar erro em contrato
  const isBalanced = Math.abs(totals.diferencaImovel) < 0.009;

  return (
    <div className="space-y-3">
      {/* Top 4 Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Valor do Imóvel */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Valor do Imóvel
            </span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-md">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900">
              {formatBRL(proposal.valorImovel)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Valor base de contrato
            </div>
          </div>
        </div>

        {/* 2. Total da Entrada (sem juros) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Total da Entrada
            </span>
            <div className="p-1.5 bg-red-50 text-red-600 rounded-md">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-950">
              {formatBRL(totals.totalEntradaSemJuros)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
              <span>Ato + Parcelas + Reforços</span>
              {totals.totalEntradaComJuros > totals.totalEntradaSemJuros && (
                <span className="text-red-600 font-bold">
                  (c/ juros: {formatBRL(totals.totalEntradaComJuros)})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Financiamento + Recursos */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Financiamento & FGTS
            </span>
            <div className="p-1.5 bg-slate-100 text-slate-800 rounded-md">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900">
              {formatBRL(
                (proposal.financiamento || 0) +
                  (proposal.fgts || 0) +
                  (proposal.subsidio || 0)
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Financ: {formatBRL(proposal.financiamento)}
              {proposal.fgts > 0 && ` | FGTS: ${formatBRL(proposal.fgts)}`}
            </div>
          </div>
        </div>

        {/* 4. Total Negociação (com juros e adimplência) */}
        <div className="bg-gradient-to-br from-black via-slate-950 to-slate-900 text-white rounded-xl p-4 shadow-sm flex flex-col justify-between border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Total Negociação
            </span>
            <div className="p-1.5 bg-red-600/20 text-red-400 rounded-md border border-red-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-white">
              {formatBRL(totals.totalNegociacao)}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5 flex items-center justify-between">
              <span>Com juros e adimplência</span>
              {proposal.temAdimplencia && proposal.valorAdimplencia > 0 && (
                <span className="text-red-400 font-bold">
                  +{formatBRL(proposal.valorAdimplencia)} adimp.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Balance Verification Bar */}
      <div
        className={`px-4 py-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          isBalanced
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-center gap-2">
          {isBalanced ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <div>
            {isBalanced ? (
              <span className="font-medium">
                <strong>100% Equilibrado:</strong> Entrada nominal ({formatBRL(totals.totalEntradaSemJuros)}) + Financiamento ({formatBRL(proposal.financiamento)}) + FGTS ({formatBRL(proposal.fgts)}) = <strong>{formatBRL(proposal.valorImovel)}</strong> (Valor do Imóvel).
              </span>
            ) : (
              <span className="font-medium">
                <strong>Conferência de Valores:</strong>{' '}
                {totals.diferencaImovel > 0 ? (
                  <>
                    Faltam <strong>{formatBRL(totals.diferencaImovel)}</strong> para cobrir o valor total do imóvel.
                  </>
                ) : (
                  <>
                    A soma está ultrapassando o valor do imóvel em{' '}
                    <strong>{formatBRL(Math.abs(totals.diferencaImovel))}</strong>.
                  </>
                )}
              </span>
            )}
          </div>
        </div>

        {!isBalanced && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onBalanceEntrada}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors shadow-xs cursor-pointer"
            >
              Ajustar na Entrada
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={onBalanceFinanciamento}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 font-medium text-xs transition-colors cursor-pointer"
            >
              Ajustar no Financiamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
