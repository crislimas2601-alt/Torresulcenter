import React, { useState } from 'react';
import { ProposalData } from '../types';
import { calculateProposalTotals } from '../utils/calculator';
import { formatBRL } from '../utils/formatter';
import {
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  ChevronUp,
  ChevronDown,
  Zap,
  Scale,
  Minus,
  Plus,
} from 'lucide-react';

interface FloatingBalancePillProps {
  proposal: ProposalData;
  onBalanceEntrada: () => void;
  onBalanceFinanciamento: () => void;
}

export const FloatingBalancePill: React.FC<FloatingBalancePillProps> = ({
  proposal,
  onBalanceEntrada,
  onBalanceFinanciamento,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const totals = calculateProposalTotals(proposal);

  const valorImovel = proposal.valorImovel || 0;
  const totalNominal = totals.totalNominal || 0;
  const diferenca = totals.diferencaImovel; // positivo = falta valor; negativo = ultrapassou
  // Exato ao centavo: não arredonda nada, alerta mesmo com R$ 0,01 de diferença
  const isExact = Math.abs(diferenca) < 0.009;

  const percentPreenchido =
    valorImovel > 0
      ? Math.min(100, Math.max(0, (totalNominal / valorImovel) * 100))
      : 0;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-none select-none">
      {/* Expanded Quick Detail Popover */}
      {isExpanded && (
        <div className="mb-2 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-4 text-xs space-y-3 pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-slate-950">
              <Scale className="w-4 h-4 text-red-600" />
              <span>Conferência da Conta em Tempo Real</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isExact
                  ? 'bg-emerald-100 text-emerald-900'
                  : diferenca > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isExact
                ? '100% Batida'
                : `${percentPreenchido.toFixed(1)}% do Imóvel`}
            </span>
          </div>

          {/* Breakdown items */}
          <div className="space-y-1.5 font-medium text-slate-600">
            <div className="flex justify-between">
              <span>Valor do Imóvel (Meta):</span>
              <span className="font-bold text-slate-900">{formatBRL(valorImovel)}</span>
            </div>
            <div className="h-px bg-slate-100 my-1" />
            <div className="flex justify-between text-slate-700">
              <span>• Ato:</span>
              <span>{formatBRL(proposal.ato || 0)}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>• Parcelamentos Mensais ({proposal.parcelamentos?.length || 0}x):</span>
              <span>{formatBRL(totals.totalParcelamentosSemJuros)}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>• Reforços Anuais / Balões ({proposal.reforcos?.length || 0}x):</span>
              <span>{formatBRL(totals.totalReforcos)}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>• Financiamento Bancário:</span>
              <span>{formatBRL(proposal.financiamento || 0)}</span>
            </div>
            {(proposal.fgts > 0 || proposal.subsidio > 0) && (
              <div className="flex justify-between text-slate-700">
                <span>• FGTS + Subsídio:</span>
                <span>{formatBRL((proposal.fgts || 0) + (proposal.subsidio || 0))}</span>
              </div>
            )}
            <div className="h-px bg-slate-200 my-1" />
            <div className="flex justify-between font-bold text-slate-900 text-sm">
              <span>Valor Padrão (Sem Juros/Desc):</span>
              <span>{formatBRL(totalNominal)}</span>
            </div>
            <div className="flex justify-between font-bold text-red-600 text-sm pt-0.5">
              <span>Total c/ Juros + Desc Avaliado:</span>
              <span>{formatBRL(totals.totalNegociacao)}</span>
            </div>
          </div>

          {/* Balance Result Banner */}
          <div
            className={`p-2.5 rounded-xl flex items-center justify-between gap-2 ${
              isExact
                ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                : diferenca > 0
                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {isExact ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : diferenca > 0 ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-semibold text-xs">
                {isExact
                  ? 'Perfeito! A conta fecha exatamente.'
                  : diferenca > 0
                  ? `Falta ${formatBRL(diferenca)} para fechar`
                  : `Passou ${formatBRL(Math.abs(diferenca))} do valor`}
              </span>
            </div>
          </div>

          {/* Auto-adjust buttons if not balanced */}
          {!isExact && (
            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onBalanceEntrada();
                }}
                className="flex-1 py-1.5 px-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-xs cursor-pointer"
              >
                <Zap className="w-3 h-3" />
                Ajustar Entrada
              </button>
              <button
                type="button"
                onClick={() => {
                  onBalanceFinanciamento();
                }}
                className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-black text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-xs cursor-pointer"
              >
                <Zap className="w-3 h-3" />
                Ajustar Financiamento
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Pill / Balãozinho Compacto */}
      <div className="pointer-events-auto group">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg border transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
            isExact
              ? 'bg-gradient-to-r from-black via-slate-950 to-slate-900 hover:from-slate-900 hover:to-slate-800 text-white border-red-500/40 shadow-slate-950/40'
              : diferenca > 0
              ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500 shadow-amber-900/25 animate-pulse-subtle'
              : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 shadow-rose-900/25'
          }`}
          title="Clique para ver o detalhamento da conta"
        >
          {/* Status Icon */}
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            {isExact ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : diferenca > 0 ? (
              <Minus className="w-3.5 h-3.5 text-white" />
            ) : (
              <Plus className="w-3.5 h-3.5 text-white" />
            )}
          </div>

          {/* Text Status */}
          <div className="flex flex-col text-left leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-tight">
                {isExact
                  ? 'Conta 100% Batida!'
                  : diferenca > 0
                  ? `Falta ${formatBRL(diferenca)}`
                  : `Passou ${formatBRL(Math.abs(diferenca))}`}
              </span>
              <span className="text-[10px] opacity-80 font-semibold px-1 py-0.2 bg-black/20 rounded">
                {isExact ? '✓ OK' : `${percentPreenchido.toFixed(0)}%`}
              </span>
            </div>
            <span className="text-[10px] opacity-90 font-medium">
              Soma: {formatBRL(totalNominal)} / {formatBRL(valorImovel)}
            </span>
          </div>

          {/* Quick Expand Toggle Arrow */}
          <div className="ml-1 pl-1 border-l border-white/20 text-white/80">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
