import React, { useState } from 'react';
import { SimulationResult, LoanInput, ExtraAmortizationInput } from '../types';
import { formatCurrency, formatTimeSaved } from '../utils/formatters';
import { Check, X, ArrowRight, Layers } from 'lucide-react';

interface ComparisonViewProps {
  loan: LoanInput;
  extra: ExtraAmortizationInput;
  result: SimulationResult;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  loan,
  extra,
  result,
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'table'>('cards');
  const [filterStep, setFilterStep] = useState<number>(12); // annual steps for table

  const originalYears = Math.floor(loan.termMonths / 12);
  const payoffYears = result.withAmortization.yearsToPayoff;
  const payoffMonths = result.withAmortization.monthsRemaining;
  const monthsSaved = result.withAmortization.monthsSaved;
  const interestSaved = result.withAmortization.interestSaved;
  const installmentsEliminated = result.withAmortization.installmentsEliminatedCount;

  // Filter schedule for table (e.g., month 1, 12, 24, 36...)
  const fullSchedule = result.withAmortization.schedule;
  const sampledSchedule = fullSchedule.filter(
    (row, idx) =>
      idx === 0 ||
      row.month % filterStep === 0 ||
      idx === fullSchedule.length - 1
  );

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-xs p-5 sm:p-6 text-zinc-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-900">
              3. Comparativo Lado a Lado dos Cenários
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
              Transparência Caixa
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Compare o custo total e o tempo do contrato padrão versus a estratégia com amortização
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              activeTab === 'cards'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Visão Geral (Cards)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              activeTab === 'table'
                ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Tabela de Evolução
          </button>
        </div>
      </div>

      {activeTab === 'cards' ? (
        <div className="mt-5 space-y-5">
          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Cenário Padrão (Sem Amortização) */}
            <div className="bg-zinc-50/70 rounded-xl border border-zinc-200/90 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                  <h3 className="text-sm font-bold text-zinc-800">
                    Cenário Padrão (Sem Amortização)
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-zinc-500 bg-white px-2 py-0.5 rounded border border-zinc-200">
                  Contrato Normal
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-zinc-200/60">
                  <span className="text-zinc-500">Prazo Total:</span>
                  <span className="font-bold text-zinc-800 tabular-nums">
                    {originalYears} anos ({loan.termMonths} meses)
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-zinc-200/60">
                  <span className="text-zinc-500">1ª Parcela:</span>
                  <span className="font-bold text-zinc-800 tabular-nums">
                    {formatCurrency(result.standard.initialInstallment)}/mês
                  </span>
                </div>

                {loan.system === 'SAC' && (
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Última Parcela:</span>
                    <span className="font-bold text-zinc-800 tabular-nums">
                      {formatCurrency(result.standard.finalInstallment)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-1 border-b border-zinc-200/60">
                  <span className="text-zinc-500">Total Pago em Juros:</span>
                  <span className="font-bold text-zinc-900 tabular-nums">
                    {formatCurrency(result.standard.totalInterestPaid)}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-zinc-200/60">
                  <span className="text-zinc-500">Aportes Extras:</span>
                  <span className="font-bold text-zinc-500">R$ 0,00</span>
                </div>

                <div className="flex justify-between pt-1 text-sm font-bold">
                  <span className="text-zinc-700">Custo Total ao Final:</span>
                  <span className="text-zinc-900 tabular-nums">
                    {formatCurrency(result.standard.totalAmountPaid)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-zinc-200 text-[11px] text-zinc-500 flex items-start gap-2">
                <X className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <span>
                  Você assume todos os 30 anos do financiamento, pagando integralmente a taxa de juros composta de todo o período contratual.
                </span>
              </div>
            </div>

            {/* Cenário com Estratégia de Amortização */}
            <div className="bg-white rounded-xl border-2 border-zinc-900 p-5 shadow-xs space-y-4 relative">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  <h3 className="text-sm font-bold text-zinc-900">
                    Cenário com Amortização Torresul
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-white bg-zinc-900 px-2 py-0.5 rounded">
                  Estratégia Recomendada
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-600">Novo Prazo de Quitação:</span>
                  <div className="font-bold text-zinc-900 tabular-nums">
                    {payoffYears} anos {payoffMonths > 0 ? `e ${payoffMonths}m` : ''}
                    {monthsSaved > 0 && (
                      <span className="ml-1.5 text-xs font-bold text-red-600">
                        (-{formatTimeSaved(monthsSaved)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-600">Parcelas Eliminadas do Final:</span>
                  <span className="font-bold text-red-600 tabular-nums">
                    {installmentsEliminated} parcelas a menos
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-600">Total de Aportes Extras Aplicados:</span>
                  <span className="font-bold text-zinc-800 tabular-nums">
                    {formatCurrency(result.withAmortization.totalExtraAmortized)}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-600">Total Pago em Juros:</span>
                  <span className="font-bold text-zinc-900 tabular-nums">
                    {formatCurrency(result.withAmortization.totalInterestPaid)}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-600 font-semibold">Economia de Juros Líquida:</span>
                  <span className="font-bold text-red-600 text-xs tabular-nums">
                    -{formatCurrency(interestSaved)}
                  </span>
                </div>

                <div className="flex justify-between pt-1 text-sm font-bold">
                  <span className="text-zinc-800">Custo Total com Estratégia:</span>
                  <span className="text-zinc-900 tabular-nums">
                    {formatCurrency(result.withAmortization.totalAmountPaid)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-[11px] text-zinc-700 flex items-start gap-2 font-medium">
                <Check className="w-4 h-4 text-zinc-800 shrink-0 mt-0.5" />
                <span>
                  Cada real aportado antecipadamente reduz diretamente o capital devido, desarmando o efeito dos juros sobre juros futuros.
                </span>
              </div>
            </div>
          </div>

          {/* Banner de Saldo e Economia Líquida */}
          <div className="p-4 sm:p-5 rounded-xl bg-zinc-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Balanço Final da Estratégia
              </span>
              <div className="text-sm sm:text-base font-bold text-white mt-1">
                Você aporta {formatCurrency(result.withAmortization.totalExtraAmortized)} e economiza{' '}
                <span className="text-red-400 font-bold">{formatCurrency(interestSaved)}</span> em juros bancários.
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Retorno imediato: cada aporte rende mais do que qualquer investimento de renda fixa convencional com segurança absoluta.
              </p>
            </div>

            <div className="text-left md:text-right shrink-0 border-t md:border-t-0 border-zinc-800 pt-3 md:pt-0 w-full md:w-auto">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Lucro Patrimonial Real
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                +{formatCurrency(Math.max(0, interestSaved - result.withAmortization.totalExtraAmortized))}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Tabela Detalhada de Evolução */
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-600 font-medium">
              Amostragem do cronograma (Total de {fullSchedule.length} meses calculados)
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 text-[11px]">Passo:</span>
              {[6, 12, 24].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setFilterStep(step)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                    filterStep === step
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  a cada {step}m
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Mês</th>
                  <th className="py-2.5 px-3">Saldo Inicial</th>
                  <th className="py-2.5 px-3">Amortização</th>
                  <th className="py-2.5 px-3">Aporte Extra</th>
                  <th className="py-2.5 px-3">Juros</th>
                  <th className="py-2.5 px-3">Parcela Total</th>
                  <th className="py-2.5 px-3">Saldo Devedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {sampledSchedule.map((row) => (
                  <tr key={row.month} className="hover:bg-zinc-50/80 transition">
                    <td className="py-2 px-3 font-bold text-zinc-900">
                      Mês {row.month}
                      <span className="text-[10px] text-zinc-400 block font-normal">
                        Ano {Math.ceil(row.month / 12)}
                      </span>
                    </td>
                    <td className="py-2 px-3 tabular-nums font-mono text-zinc-600">
                      {formatCurrency(row.startingBalance)}
                    </td>
                    <td className="py-2 px-3 tabular-nums font-mono font-medium text-zinc-900">
                      {formatCurrency(row.amortization)}
                    </td>
                    <td className="py-2 px-3 tabular-nums font-mono">
                      {row.extraAmortization > 0 ? (
                        <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          +{formatCurrency(row.extraAmortization)}
                        </span>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 tabular-nums font-mono text-zinc-500">
                      {formatCurrency(row.interest)}
                    </td>
                    <td className="py-2 px-3 tabular-nums font-mono font-bold text-zinc-900">
                      {formatCurrency(row.totalPayment)}
                    </td>
                    <td className="py-2 px-3 tabular-nums font-mono font-bold text-zinc-900">
                      {formatCurrency(row.endingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
