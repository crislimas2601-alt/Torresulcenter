import React, { useState, useEffect } from 'react';
import {
  Minus,
  Plus,
  RotateCcw
} from 'lucide-react';
import { ExtraAmortizationInput, LoanInput, SimulationResult } from '../types';
import { formatCurrency, parseBRLInput, formatBRLNumber } from '../utils/formatters';
import { calculateInstantElimination } from '../utils/financialCalculations';

interface AmortizationControlsProps {
  extra: ExtraAmortizationInput;
  loan: LoanInput;
  result: SimulationResult;
  onChange: (updated: ExtraAmortizationInput) => void;
}

const QUICK_ONE_TIME = [0, 1000, 3000, 5000, 10000, 15000, 20000];
const QUICK_MONTHLY = [0, 100, 200, 300, 500, 1000];
const QUICK_FGTS = [0, 3000, 5000, 8000, 12000, 20000];

export const AmortizationControls: React.FC<AmortizationControlsProps> = ({
  extra,
  loan,
  result,
  onChange,
}) => {
  // Input local strings to allow smooth typing without cursor jumps
  const [oneTimeStr, setOneTimeStr] = useState(extra.oneTimeAmount ? formatBRLNumber(extra.oneTimeAmount) : '');
  const [monthlyStr, setMonthlyStr] = useState(extra.recurringMonthlyAmount ? formatBRLNumber(extra.recurringMonthlyAmount) : '');
  const [fgtsStr, setFgtsStr] = useState(extra.recurringBiAnnualFGTS ? formatBRLNumber(extra.recurringBiAnnualFGTS) : '');

  // Keep strings synced when extra props change from presets/modals
  useEffect(() => {
    setOneTimeStr(extra.oneTimeAmount ? formatBRLNumber(extra.oneTimeAmount) : '');
  }, [extra.oneTimeAmount]);

  useEffect(() => {
    setMonthlyStr(extra.recurringMonthlyAmount ? formatBRLNumber(extra.recurringMonthlyAmount) : '');
  }, [extra.recurringMonthlyAmount]);

  useEffect(() => {
    setFgtsStr(extra.recurringBiAnnualFGTS ? formatBRLNumber(extra.recurringBiAnnualFGTS) : '');
  }, [extra.recurringBiAnnualFGTS]);

  // Specific one-time instant calculation
  const instantOneTime = calculateInstantElimination(loan, extra.oneTimeAmount);

  // Total eliminated in active simulation
  const totalEliminated = result.withAmortization.installmentsEliminatedCount;
  const isReduceTerm = extra.goalType === 'REDUCE_TERM';

  const handleOneTimeInput = (valStr: string) => {
    setOneTimeStr(valStr);
    const num = parseBRLInput(valStr);
    onChange({
      ...extra,
      oneTimeAmount: Math.max(0, num),
    });
  };

  const handleOneTimeBlur = () => {
    const num = parseBRLInput(oneTimeStr);
    setOneTimeStr(num ? formatBRLNumber(num) : '');
  };

  const handleMonthlyInput = (valStr: string) => {
    setMonthlyStr(valStr);
    const num = parseBRLInput(valStr);
    onChange({
      ...extra,
      recurringMonthlyAmount: Math.max(0, num),
    });
  };

  const handleMonthlyBlur = () => {
    const num = parseBRLInput(monthlyStr);
    setMonthlyStr(num ? formatBRLNumber(num) : '');
  };

  const handleFGTSInput = (valStr: string) => {
    setFgtsStr(valStr);
    const num = parseBRLInput(valStr);
    onChange({
      ...extra,
      recurringBiAnnualFGTS: Math.max(0, num),
    });
  };

  const handleFGTSBlur = () => {
    const num = parseBRLInput(fgtsStr);
    setFgtsStr(num ? formatBRLNumber(num) : '');
  };

  const adjustOneTime = (delta: number) => {
    const current = extra.oneTimeAmount || 0;
    const nextVal = Math.max(0, current + delta);
    onChange({ ...extra, oneTimeAmount: nextVal });
  };

  const adjustMonthly = (delta: number) => {
    const current = extra.recurringMonthlyAmount || 0;
    const nextVal = Math.max(0, current + delta);
    onChange({ ...extra, recurringMonthlyAmount: nextVal });
  };

  const adjustFGTS = (delta: number) => {
    const current = extra.recurringBiAnnualFGTS || 0;
    const nextVal = Math.max(0, current + delta);
    onChange({ ...extra, recurringBiAnnualFGTS: nextVal });
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 text-zinc-900 shadow-xs border border-zinc-200/90 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-900">
              2. Simulação de Amortização Acelerada
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200 uppercase tracking-wider">
              100% Saldo Devedor
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Aplicação de recursos próprios ou FGTS diretamente no abatimento do saldo devedor
          </p>
        </div>

        {/* Modalidade Choice: Reduzir Prazo vs Reduzir Parcela */}
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200 text-xs">
          <button
            type="button"
            onClick={() => onChange({ ...extra, goalType: 'REDUCE_TERM' })}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              isReduceTerm
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Eliminar Prazo
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...extra, goalType: 'REDUCE_INSTALLMENT' })}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              !isReduceTerm
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Reduzir Parcela
          </button>
        </div>
      </div>

      {/* Warning if in Reduce Installment mode */}
      {!isReduceTerm && (
        <div className="mt-4 p-3.5 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <strong>Modalidade Reduzir Parcela selecionada:</strong> O número de prestações é mantido, mas o valor mensal diminui. Para cortar anos de contrato, selecione <strong>"Eliminar Prazo"</strong>.
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...extra, goalType: 'REDUCE_TERM' })}
            className="px-3 py-1 bg-zinc-900 text-white rounded-md font-medium text-xs shrink-0 hover:bg-zinc-800 transition cursor-pointer"
          >
            Mudar para Eliminar Prazo
          </button>
        </div>
      )}

      {/* Live Impact Strip for the Client */}
      <div className="mt-5 p-4 sm:p-5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Impacto da Estratégia no Financiamento
          </span>
          <div className="text-sm sm:text-base font-semibold text-zinc-900">
            {isReduceTerm ? (
              totalEliminated > 0 ? (
                <span>
                  Com esta combinação você elimina{' '}
                  <span className="text-red-600 font-bold">
                    {totalEliminated} {totalEliminated === 1 ? 'parcela' : 'parcelas'}
                  </span>{' '}
                  do final do contrato e economiza juros substanciais.
                </span>
              ) : (
                <span className="text-zinc-500 font-normal">
                  Insira um valor nos campos abaixo para simular o cancelamento de parcelas.
                </span>
              )
            ) : (
              <span>
                Parcela recalculada de{' '}
                <span className="line-through text-zinc-400">
                  {formatCurrency(result.standard.initialInstallment)}
                </span>{' '}
                para{' '}
                <span className="text-zinc-900 font-bold">
                  {formatCurrency(result.withAmortization.initialInstallment)}/mês
                </span>{' '}
                <span className="text-xs text-zinc-700 font-semibold">
                  (-{formatCurrency(result.standard.initialInstallment - result.withAmortization.initialInstallment)}/mês)
                </span>
              </span>
            )}
          </div>
          {isReduceTerm && extra.oneTimeAmount > 0 && (
            <p className="text-xs text-zinc-500">
              O aporte pontual de {formatCurrency(extra.oneTimeAmount)} quita de imediato{' '}
              <strong className="text-zinc-900">{instantOneTime.installmentsEliminated} parcelas</strong> do contrato.
            </p>
          )}
        </div>

        {/* Big numbers on the right */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-zinc-200 pt-3 md:pt-0">
          <div className="text-left md:text-right">
            <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">
              {isReduceTerm ? 'Parcelas Canceladas' : 'Parcelas Mantidas'}
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-red-600 tracking-tight tabular-nums">
              {isReduceTerm ? totalEliminated : loan.termMonths}
            </span>
          </div>

          <div className="h-9 w-px bg-zinc-200 hidden sm:block" />

          <div className="text-left md:text-right">
            <span className="text-[11px] font-medium text-zinc-400 block uppercase tracking-wider">
              Juros Evitados
            </span>
            <span className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight tabular-nums">
              {formatCurrency(result.withAmortization.interestSaved)}
            </span>
          </div>
        </div>
      </div>

      {/* Three Types of Amortization Inputs */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. Aporte Único (Ex: R$ 5.000) */}
        <div className="bg-zinc-50/70 p-4 rounded-xl border border-zinc-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-800">
                Aporte Único (Ex: 13º, Poupança)
              </label>
              {extra.oneTimeAmount > 0 && (
                <button
                  type="button"
                  onClick={() => onChange({ ...extra, oneTimeAmount: 0 })}
                  className="text-[11px] text-zinc-400 hover:text-zinc-700 flex items-center gap-0.5 cursor-pointer"
                  title="Zerar aporte"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Zerar</span>
                </button>
              )}
            </div>

            {/* Stepper + Input */}
            <div className="relative mt-2 flex items-center">
              <button
                type="button"
                onClick={() => adjustOneTime(-1000)}
                disabled={extra.oneTimeAmount <= 0}
                className="w-8 h-9 rounded-l-lg bg-white border border-zinc-200 hover:bg-zinc-100 disabled:opacity-30 flex items-center justify-center font-medium text-zinc-700 transition shrink-0 cursor-pointer"
                title="Diminuir R$ 1.000"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-xs pointer-events-none">
                  R$
                </span>
                <input
                  id="one-time-amort-input"
                  type="text"
                  inputMode="numeric"
                  value={oneTimeStr}
                  onBlur={handleOneTimeBlur}
                  onChange={(e) => handleOneTimeInput(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-white border-y border-zinc-200 text-zinc-900 font-semibold text-sm focus:ring-1 focus:ring-zinc-900 outline-none transition text-center tabular-nums"
                  placeholder="0"
                />
              </div>

              <button
                type="button"
                onClick={() => adjustOneTime(1000)}
                className="w-8 h-9 rounded-r-lg bg-white border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center font-medium text-zinc-700 transition shrink-0 cursor-pointer"
                title="Aumentar R$ 1.000"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Instant mini feedback for this input */}
            <div className="mt-2 text-center text-xs">
              {extra.oneTimeAmount > 0 ? (
                <span className="text-zinc-600 font-medium">
                  Elimina <strong className="text-zinc-900 font-bold">~{instantOneTime.installmentsEliminated} parcelas</strong> do final
                </span>
              ) : (
                <span className="text-zinc-400 text-[11px]">Nenhum aporte único</span>
              )}
            </div>
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-zinc-200">
            {QUICK_ONE_TIME.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange({ ...extra, oneTimeAmount: val })}
                className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
                  extra.oneTimeAmount === val
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
                }`}
              >
                {val === 0 ? 'R$ 0' : formatCurrency(val)}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Aporte Recorrente Mensal (Ex: R$ 200 ou R$ 500/mês) */}
        <div className="bg-zinc-50/70 p-4 rounded-xl border border-zinc-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-800">
                Aporte Mensal Extra
              </label>
              {extra.recurringMonthlyAmount > 0 && (
                <button
                  type="button"
                  onClick={() => onChange({ ...extra, recurringMonthlyAmount: 0 })}
                  className="text-[11px] text-zinc-400 hover:text-zinc-700 flex items-center gap-0.5 cursor-pointer"
                  title="Zerar aporte"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Zerar</span>
                </button>
              )}
            </div>

            {/* Stepper + Input */}
            <div className="relative mt-2 flex items-center">
              <button
                type="button"
                onClick={() => adjustMonthly(-100)}
                disabled={extra.recurringMonthlyAmount <= 0}
                className="w-8 h-9 rounded-l-lg bg-white border border-zinc-200 hover:bg-zinc-100 disabled:opacity-30 flex items-center justify-center font-medium text-zinc-700 transition shrink-0 cursor-pointer"
                title="Diminuir R$ 100"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-xs pointer-events-none">
                  R$
                </span>
                <input
                  id="recurring-monthly-input"
                  type="text"
                  inputMode="numeric"
                  value={monthlyStr}
                  onBlur={handleMonthlyBlur}
                  onChange={(e) => handleMonthlyInput(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-white border-y border-zinc-200 text-zinc-900 font-semibold text-sm focus:ring-1 focus:ring-zinc-900 outline-none transition text-center tabular-nums"
                  placeholder="0"
                />
              </div>

              <button
                type="button"
                onClick={() => adjustMonthly(100)}
                className="w-8 h-9 rounded-r-lg bg-white border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center font-medium text-zinc-700 transition shrink-0 cursor-pointer"
                title="Aumentar R$ 100"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feedback */}
            <div className="mt-2 text-center text-xs">
              {extra.recurringMonthlyAmount > 0 ? (
                <span className="text-zinc-600 font-medium">
                  +{formatCurrency(extra.recurringMonthlyAmount)} todo mês no saldo
                </span>
              ) : (
                <span className="text-zinc-400 text-[11px]">Apenas a parcela normal</span>
              )}
            </div>
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-zinc-200">
            {QUICK_MONTHLY.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange({ ...extra, recurringMonthlyAmount: val })}
                className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
                  extra.recurringMonthlyAmount === val
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
                }`}
              >
                {val === 0 ? 'Sem mensal' : formatCurrency(val)}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Uso do FGTS a cada 2 anos (Caixa permite a cada 24 meses) */}
        <div className="bg-zinc-50/70 p-4 rounded-xl border border-zinc-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-800">
                FGTS a cada 2 anos (24m)
              </label>
              {extra.recurringBiAnnualFGTS > 0 && (
                <button
                  type="button"
                  onClick={() => onChange({ ...extra, recurringBiAnnualFGTS: 0 })}
                  className="text-[11px] text-zinc-400 hover:text-zinc-700 flex items-center gap-0.5 cursor-pointer"
                  title="Zerar aporte"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Zerar</span>
                </button>
              )}
            </div>

            {/* Stepper + Input */}
            <div className="relative mt-2 flex items-center">
              <button
                type="button"
                onClick={() => adjustFGTS(-1000)}
                disabled={extra.recurringBiAnnualFGTS <= 0}
                className="w-8 h-9 rounded-l-lg bg-white border border-zinc-200 hover:bg-zinc-100 disabled:opacity-30 flex items-center justify-center font-medium text-zinc-700 transition shrink-0 cursor-pointer"
                title="Diminuir R$ 1.000"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-xs pointer-events-none">
                  R$
                </span>
                <input
                  id="fgts-input"
                  type="text"
                  inputMode="numeric"
                  value={fgtsStr}
                  onBlur={handleFGTSBlur}
                  onChange={(e) => handleFGTSInput(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-white border-y border-zinc-200 text-zinc-900 font-semibold text-sm focus:ring-1 focus:ring-zinc-900 outline-none transition text-center tabular-nums"
                  placeholder="0"
                />
              </div>

              <button
                type="button"
                onClick={() => adjustFGTS(1000)}
                className="w-8 h-9 rounded-r-lg bg-white border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center font-medium text-zinc-700 transition shrink-0 cursor-pointer"
                title="Aumentar R$ 1.000"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feedback */}
            <div className="mt-2 text-center text-xs">
              {extra.recurringBiAnnualFGTS > 0 ? (
                <span className="text-zinc-600 font-medium">
                  {formatCurrency(extra.recurringBiAnnualFGTS)} a cada 24 meses
                </span>
              ) : (
                <span className="text-zinc-400 text-[11px]">Sem uso periódico de FGTS</span>
              )}
            </div>
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-zinc-200">
            {QUICK_FGTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange({ ...extra, recurringBiAnnualFGTS: val })}
                className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
                  extra.recurringBiAnnualFGTS === val
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
                }`}
              >
                {val === 0 ? 'Sem FGTS' : formatCurrency(val)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advisory Footer */}
      <div className="mt-5 pt-3.5 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
          <span>
            <strong>Regra Oficial:</strong> 100% de qualquer amortização extraordinária é direcionada ao abatimento do saldo devedor principal.
          </span>
        </div>
        <div className="text-[11px] text-zinc-600 font-medium">
          {totalEliminated > 0
            ? `${totalEliminated} parcelas eliminadas nesta simulação`
            : 'Defina valores acima para simular a quitação antecipada'}
        </div>
      </div>
    </div>
  );
};
