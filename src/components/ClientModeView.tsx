import React, { useState } from 'react';
import { SimulationResult, LoanInput, ExtraAmortizationInput } from '../types';
import { formatCurrency, formatTimeSaved } from '../utils/formatters';
import { FinancialResultHero } from './FinancialResultHero';
import {
  CheckCircle2,
  ShieldCheck,
  Share2,
  ChevronDown,
  ChevronUp,
  Sliders
} from 'lucide-react';

interface ClientModeViewProps {
  loan: LoanInput;
  extra: ExtraAmortizationInput;
  result: SimulationResult;
  onChangeLoan: (updated: LoanInput) => void;
  onChangeExtra: (updated: ExtraAmortizationInput) => void;
  onOpenShareModal: () => void;
  onSwitchToBrokerMode: () => void;
}

export const ClientModeView: React.FC<ClientModeViewProps> = ({
  loan,
  extra,
  result,
  onChangeLoan,
  onChangeExtra,
  onOpenShareModal,
  onSwitchToBrokerMode,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const originalYears = Math.floor(loan.termMonths / 12);
  const payoffYears = result.withAmortization.yearsToPayoff;
  const payoffMonths = result.withAmortization.monthsRemaining;
  const interestSaved = result.withAmortization.interestSaved;
  const installmentsEliminated = result.withAmortization.installmentsEliminatedCount;

  // Percentage of time saved
  const timeSavedPercentage = Math.min(
    100,
    Math.round((result.withAmortization.monthsSaved / loan.termMonths) * 100)
  );

  return (
    <div className="space-y-6">
      {/* 1. HERO COM HIERARQUIA FORTE (VALOR DO IMÓVEL, ENTRADA, FINANCIADO, PARCELA, PRAZO) */}
      <FinancialResultHero
        loan={loan}
        extra={extra}
        result={result}
        userMode="client"
      />

      {/* 2. CONTROLES SIMPLIFICADOS PARA O CLIENTE */}
      <div className="bg-white rounded-xl border border-zinc-200/90 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-zinc-900">
              Personalize sua Simulação
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Ajuste os valores abaixo para ver o impacto imediato na sua parcela e no tempo de quitação
            </p>
          </div>
          <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200 self-start sm:self-auto">
            Cálculo em Tempo Real
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Valor do Imóvel & Entrada */}
          <div className="space-y-3 bg-zinc-50/70 p-4 rounded-xl border border-zinc-200/80">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-zinc-800">
                1. Valor do Imóvel
              </span>
              <span className="text-sm font-bold text-zinc-900 tabular-nums">
                {formatCurrency(loan.propertyValue)}
              </span>
            </div>

            <input
              type="range"
              min={150000}
              max={500000}
              step={10000}
              value={loan.propertyValue}
              onChange={(e) => {
                const val = Number(e.target.value);
                onChangeLoan({
                  ...loan,
                  propertyValue: val,
                  downPayment: Math.min(loan.downPayment, Math.round(val * 0.4)),
                });
              }}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
            />

            <div className="flex justify-between items-baseline pt-2 border-t border-zinc-200/70">
              <span className="text-xs font-semibold text-zinc-700">
                Entrada (R$)
              </span>
              <span className="text-xs font-bold text-zinc-900 tabular-nums">
                {formatCurrency(loan.downPayment)} (
                {loan.propertyValue > 0 ? ((loan.downPayment / loan.propertyValue) * 100).toFixed(0) : 0}%)
              </span>
            </div>

            <div className="flex gap-1.5">
              {[10, 20, 30].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() =>
                    onChangeLoan({
                      ...loan,
                      downPayment: Math.round(loan.propertyValue * (pct / 100)),
                    })
                  }
                  className="flex-1 py-1 px-2 rounded text-[11px] font-medium bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                >
                  {pct}% ({formatCurrency(loan.propertyValue * (pct / 100))})
                </button>
              ))}
            </div>
          </div>

          {/* Aporte Único / FGTS Inicial */}
          <div className="space-y-3 bg-zinc-50/70 p-4 rounded-xl border border-zinc-200/80">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-xs font-bold text-zinc-800 block">
                  2. Aporte Pontual
                </span>
                <span className="text-[11px] text-zinc-500">FGTS, 13º salário ou poupança</span>
              </div>
              <span className="text-sm font-bold text-zinc-900 tabular-nums">
                {formatCurrency(extra.oneTimeAmount)}
              </span>
            </div>

            <div className="flex gap-1.5 flex-wrap pt-1">
              {[0, 3000, 5000, 10000, 20000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChangeExtra({ ...extra, oneTimeAmount: val, goalType: 'REDUCE_TERM' })}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    extra.oneTimeAmount === val
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
                  }`}
                >
                  {val === 0 ? 'Sem aporte' : formatCurrency(val)}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-zinc-500 pt-1">
              Este valor vai 100% para amortização do saldo devedor principal, cancelando as últimas parcelas.
            </p>
          </div>

          {/* Economia Mensal Extra */}
          <div className="space-y-3 bg-zinc-50/70 p-4 rounded-xl border border-zinc-200/80">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-xs font-bold text-zinc-800 block">
                  3. Aporte Mensal Extra
                </span>
                <span className="text-[11px] text-zinc-500">Valor adicional somado à prestação</span>
              </div>
              <span className="text-sm font-bold text-zinc-900 tabular-nums">
                +{formatCurrency(extra.recurringMonthlyAmount)}/mês
              </span>
            </div>

            <div className="flex gap-1.5 flex-wrap pt-1">
              {[0, 100, 200, 300, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChangeExtra({ ...extra, recurringMonthlyAmount: val, goalType: 'REDUCE_TERM' })}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    extra.recurringMonthlyAmount === val
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
                  }`}
                >
                  {val === 0 ? 'R$ 0' : `+${formatCurrency(val)}`}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-zinc-500 pt-1">
              Uma pequena sobra mensal antecipa a quitação do imóvel em anos e gera grande economia de juros.
            </p>
          </div>
        </div>
      </div>

      {/* 3. COMPARAÇÃO SIMPLES E CLARA DOS CENÁRIOS (CENÁRIO A vs CENÁRIO B) */}
      <div className="bg-white rounded-xl border border-zinc-200/90 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 gap-2">
          <div>
            <h3 className="text-base font-bold text-zinc-900">
              Comparativo de Decisão: Cenário A vs. Cenário B
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Entenda em números simples o que muda entre pagar o contrato até o fim ou aplicar a estratégia Torresul
            </p>
          </div>
          {interestSaved > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Economia de {formatCurrency(interestSaved)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Cenário A: Contrato Normal */}
          <div className="p-5 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                <span className="text-sm font-bold text-zinc-800">
                  Cenário A: Financiamento Padrão
                </span>
              </div>
              <span className="text-[11px] font-medium text-zinc-500 bg-white px-2 py-0.5 rounded border border-zinc-200">
                Sem amortização
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-200/60">
                <span className="text-zinc-500">Tempo para quitar:</span>
                <span className="font-bold text-zinc-900 tabular-nums">
                  {originalYears} anos ({loan.termMonths} meses)
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-zinc-200/60">
                <span className="text-zinc-500">Prestação mensal inicial:</span>
                <span className="font-semibold text-zinc-800 tabular-nums">
                  {formatCurrency(result.standard.initialInstallment)}/mês
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-zinc-200/60">
                <span className="text-zinc-500">Juros totais ao banco:</span>
                <span className="font-semibold text-zinc-900 tabular-nums">
                  {formatCurrency(result.standard.totalInterestPaid)}
                </span>
              </div>

              <div className="flex justify-between pt-1">
                <span className="font-bold text-zinc-700">Total pago ao final:</span>
                <span className="font-bold text-zinc-900 text-sm tabular-nums">
                  {formatCurrency(result.standard.totalAmountPaid)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-zinc-200 text-[11px] text-zinc-600 leading-relaxed">
              Você paga o financiamento durante 30 anos, desembolsando mais do que o dobro do capital financiado somente em juros.
            </div>
          </div>

          {/* Cenário B: Com Quitação Acelerada Torresul */}
          <div className="p-5 rounded-xl border-2 border-zinc-900 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span className="text-sm font-bold text-zinc-900">
                  Cenário B: Quitação Acelerada Torresul
                </span>
              </div>
              <span className="text-[11px] font-bold text-white bg-zinc-900 px-2 py-0.5 rounded">
                Recomendado
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-600">Tempo para quitar:</span>
                <div className="font-bold text-zinc-900 tabular-nums">
                  {payoffYears} anos {payoffMonths > 0 ? `e ${payoffMonths}m` : ''}
                  {result.withAmortization.monthsSaved > 0 && (
                    <span className="ml-1.5 text-xs font-bold text-red-600">
                      (-{formatTimeSaved(result.withAmortization.monthsSaved)})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-600">Parcelas canceladas:</span>
                <span className="font-bold text-red-600 tabular-nums">
                  {installmentsEliminated} parcelas eliminadas
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-600">Juros pagos ao banco:</span>
                <span className="font-bold text-emerald-700 tabular-nums">
                  {formatCurrency(result.withAmortization.totalInterestPaid)}
                </span>
              </div>

              <div className="flex justify-between pt-1">
                <span className="font-bold text-zinc-800">Total pago ao final:</span>
                <span className="font-bold text-zinc-900 text-sm tabular-nums">
                  {formatCurrency(result.withAmortization.totalAmountPaid)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed font-medium">
              Você economiza <strong>{formatCurrency(interestSaved)}</strong> que ficaria com o banco e se torna proprietário do imóvel definitivo muito mais cedo.
            </div>
          </div>
        </div>

        {/* Linha Visual do Prazo Eliminado */}
        {timeSavedPercentage > 0 && (
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 mb-2">
              <span>Progresso de Redução do Tempo do Contrato:</span>
              <span className="text-zinc-900">
                <strong className="text-red-600 font-bold">{timeSavedPercentage}%</strong> do tempo eliminado
              </span>
            </div>
            <div className="w-full h-2.5 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 rounded-full transition-all duration-500"
                style={{ width: `${timeSavedPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-zinc-500 mt-1.5">
              <span>Início: Hoje</span>
              <span>Quitação: {payoffYears} anos e {payoffMonths}m</span>
              <span>Prazo Original: {originalYears} anos</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. AÇÕES PRINCIPAIS & CONTATO COM CORRETOR */}
      <div className="p-5 sm:p-6 rounded-xl bg-zinc-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-base font-bold text-white">
            Gostou desta simulação de quitação?
          </h4>
          <p className="text-xs text-zinc-400 max-w-xl">
            Envie esta proposta com todos os dados calculados diretamente para o seu WhatsApp ou agende uma visita com um consultor da Torresul Imobiliária.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={onOpenShareModal}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Enviar no WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={onSwitchToBrokerMode}
            className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Alternar para visão completa do corretor"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-400" />
            <span>Ver Modo Corretor</span>
          </button>
        </div>
      </div>

      {/* 5. SEÇÃO DE DETALHES AVANÇADOS RECOLHÍVEL */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full py-3 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 flex items-center justify-between transition shadow-2xs cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900">
              {showTechnicalDetails ? 'Ocultar' : 'Exibir'} detalhes bancários e composição da parcela
            </span>
            <span className="text-[11px] text-zinc-500 font-normal">
              (Amortização pura, juros da Caixa, taxas e regras do contrato)
            </span>
          </div>
          {showTechnicalDetails ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </button>

        {showTechnicalDetails && (
          <div className="mt-3 p-5 rounded-xl border border-zinc-200 bg-white shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Amortização Mensal Pura
                </span>
                <span className="text-sm font-bold text-zinc-900 block mt-1 tabular-nums">
                  {formatCurrency(result.standard.schedule[0]?.amortization || 0)}
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5 block">
                  Valor que reduz a dívida a cada mês
                </span>
              </div>

              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Juros Bancários Iniciais
                </span>
                <span className="text-sm font-bold text-red-600 block mt-1 tabular-nums">
                  {formatCurrency(result.standard.schedule[0]?.interest || 0)}
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5 block">
                  Remuneração do banco na 1ª parcela
                </span>
              </div>

              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Renda Mínima Recomendada
                </span>
                <span className="text-sm font-bold text-zinc-900 block mt-1 tabular-nums">
                  ~{formatCurrency(result.standard.initialInstallment / 0.30)}
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5 block">
                  Comprometimento máximo de 30% da renda
                </span>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs text-zinc-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <span>
                <strong>Garantia Torresul:</strong> Os cálculos seguem rigorosamente as tabelas SAC e Price praticadas pela Caixa Econômica Federal no programa Minha Casa Minha Vida, considerando taxa nominal, tarifa de administração e seguros habitacionais obrigatórios (MIP e DFI).
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
