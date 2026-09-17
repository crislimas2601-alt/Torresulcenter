import React from 'react';
import { SimulationResult, LoanInput, ExtraAmortizationInput } from '../types';
import { formatCurrency, formatTimeSaved } from '../utils/formatters';

interface FinancialResultHeroProps {
  loan: LoanInput;
  extra: ExtraAmortizationInput;
  result: SimulationResult;
  userMode: 'broker' | 'client';
}

export const FinancialResultHero: React.FC<FinancialResultHeroProps> = ({
  loan,
  extra,
  result,
  userMode,
}) => {
  const originalYears = Math.floor(loan.termMonths / 12);
  const payoffYears = result.withAmortization.yearsToPayoff;
  const payoffMonths = result.withAmortization.monthsRemaining;
  const monthsSaved = result.withAmortization.monthsSaved;
  const interestSaved = result.withAmortization.interestSaved;
  const installmentsEliminated = result.withAmortization.installmentsEliminatedCount;
  const downPaymentPercent = loan.propertyValue > 0 ? (loan.downPayment / loan.propertyValue) * 100 : 0;

  const hasAmortization =
    extra.oneTimeAmount > 0 ||
    extra.recurringMonthlyAmount > 0 ||
    extra.recurringBiAnnualFGTS > 0;

  return (
    <section aria-label="Resultado Financeiro Principal" className="space-y-3">
      {/* 1. SURFACE PRINCIPAL: Os 5 Números Fundamentais em Hierarquia Forte */}
      <div className="bg-white rounded-xl border border-zinc-200/90 shadow-xs overflow-hidden">
        {/* Faixa Superior: Status do Imóvel & Proposta */}
        <div className="px-5 py-3 bg-zinc-50/70 border-b border-zinc-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span className="font-bold text-zinc-900 uppercase tracking-wider text-[11px]">
              Simulação de Financiamento Habitacional
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-600 font-medium">
              Caixa Econômica Federal / MCMV ({loan.system})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[11px]">Taxa Contratada:</span>
            <span className="font-bold text-zinc-900 font-mono text-[11px]">
              {loan.annualInterestRate.toFixed(2)}% a.a.
            </span>
            {userMode === 'client' && (
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                Aprovada para Faixa MCMV
              </span>
            )}
          </div>
        </div>

        {/* Grade Primária: Os 5 Indicadores Fundamentais */}
        <div className="p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 divide-y sm:divide-y-0 divide-zinc-100 sm:divide-x sm:divide-zinc-200/80">
          {/* 1. VALOR DO IMÓVEL */}
          <div className="sm:pr-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
              1. Valor do Imóvel
            </span>
            <div className="mt-1.5">
              <span className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight tabular-nums block">
                {formatCurrency(loan.propertyValue)}
              </span>
              <span className="text-[11px] text-zinc-500 block mt-0.5 font-medium">
                Avaliação total
              </span>
            </div>
          </div>

          {/* 2. ENTRADA */}
          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
              2. Entrada / FGTS
            </span>
            <div className="mt-1.5">
              <span className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight tabular-nums block">
                {formatCurrency(loan.downPayment)}
              </span>
              <span className="text-[11px] text-zinc-500 block mt-0.5 font-medium">
                {downPaymentPercent.toFixed(1)}% do valor
              </span>
            </div>
          </div>

          {/* 3. VALOR FINANCIADO */}
          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
              3. Financiado
            </span>
            <div className="mt-1.5">
              <span className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight tabular-nums block">
                {formatCurrency(result.financedAmount)}
              </span>
              <span className="text-[11px] text-zinc-500 block mt-0.5 font-medium">
                Saldo na contratação
              </span>
            </div>
          </div>

          {/* 4. PARCELA */}
          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
              4. Prestação
            </span>
            <div className="mt-1.5">
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight tabular-nums">
                  {formatCurrency(result.standard.initialInstallment)}
                </span>
                <span className="text-xs font-normal text-zinc-500">/mês</span>
              </div>
              <span className="text-[11px] text-zinc-500 block mt-0.5 font-medium">
                {loan.system === 'SAC'
                  ? `Decresce até ${formatCurrency(result.standard.finalInstallment)}`
                  : 'Parcela fixa (Price)'}
              </span>
            </div>
          </div>

          {/* 5. PRAZO */}
          <div className="pt-4 sm:pt-0 sm:pl-4 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
              5. Prazo de Quitação
            </span>
            <div className="mt-1.5">
              {hasAmortization && extra.goalType === 'REDUCE_TERM' ? (
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl sm:text-2xl font-bold text-red-600 tracking-tight tabular-nums">
                      {payoffYears} anos {payoffMonths > 0 ? `e ${payoffMonths}m` : ''}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 block mt-0.5 font-medium">
                    De <span className="line-through">{originalYears} anos</span> (-{formatTimeSaved(monthsSaved)})
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight tabular-nums block">
                    {originalYears} anos
                  </span>
                  <span className="text-[11px] text-zinc-500 block mt-0.5 font-medium">
                    {loan.termMonths} prestações
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Faixa Inferior de Destaque da Estratégia de Quitação */}
        {hasAmortization && (
          <div className="px-5 py-4 bg-zinc-900 text-white border-t border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-0.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                  Impacto da Estratégia Torresul
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-xs text-zinc-300">
                  {extra.goalType === 'REDUCE_TERM'
                    ? `${installmentsEliminated} parcelas cortadas do final do contrato`
                    : 'Parcela mensal reduzida com o mesmo prazo'}
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                {extra.goalType === 'REDUCE_TERM' ? (
                  <>
                    Ao antecipar amortizações diretas no saldo principal, você reduz o contrato de{' '}
                    <strong className="text-white">{originalYears} anos ({loan.termMonths} meses)</strong> para{' '}
                    <strong className="text-white font-bold">
                      {result.withAmortization.actualMonthsToPayoff} meses ({payoffYears} anos e {payoffMonths}m)
                    </strong>
                    .
                  </>
                ) : (
                  <>
                    Sua nova parcela mensal cai para{' '}
                    <strong className="text-white font-bold">
                      {formatCurrency(result.withAmortization.initialInstallment)}/mês
                    </strong>
                    .
                  </>
                )}
              </p>
            </div>

            {/* Total de Juros Economizados */}
            {interestSaved > 0 && (
              <div className="bg-zinc-800/90 rounded-lg px-4 py-2.5 border border-zinc-700/80 shrink-0 flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
                    Juros que Deixam de ser Pagos
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight tabular-nums">
                    {formatCurrency(interestSaved)}
                  </span>
                </div>
                {monthsSaved > 0 && (
                  <div className="border-l border-zinc-700 pl-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
                      Tempo Ganho
                    </span>
                    <span className="text-base sm:text-lg font-bold text-white tabular-nums">
                      -{formatTimeSaved(monthsSaved)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
