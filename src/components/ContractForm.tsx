import React, { useState } from 'react';
import {
  Percent,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { LoanInput, SimulationResult } from '../types';
import { MCMV_BANDS, runSimulation } from '../utils/financialCalculations';
import { formatCurrency } from '../utils/formatters';

interface ContractFormProps {
  loan: LoanInput;
  onChange: (updated: LoanInput) => void;
  result?: SimulationResult;
  presentationMode?: boolean;
}

const PROPERTY_PRESETS = [180000, 220000, 260000, 320000, 400000];

export const ContractForm: React.FC<ContractFormProps> = ({
  loan,
  onChange,
  result,
  presentationMode = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const financedAmount = Math.max(0, loan.propertyValue - loan.downPayment);
  const downPaymentPercent = loan.propertyValue > 0 ? (loan.downPayment / loan.propertyValue) * 100 : 0;

  // Compute live installment details from result or fallback runSimulation
  const sim = result || runSimulation(loan, {
    oneTimeAmount: 0,
    oneTimeMonth: 1,
    recurringMonthlyAmount: 0,
    recurringBiAnnualFGTS: 0,
    goalType: 'REDUCE_TERM',
  });

  const firstInstallment = sim.standard.initialInstallment;
  const lastInstallment = sim.standard.finalInstallment;
  const schedule0 = sim.standard.schedule[0];
  const amortizationPart = schedule0?.amortization || 0;
  const interestPart = schedule0?.interest || 0;
  const feesPart = schedule0?.fees || 0;

  // Caixa 30% gross income rule:
  const minIncome = firstInstallment > 0 ? firstInstallment / 0.30 : 0;
  const sacMonthlyDrop =
    loan.system === 'SAC' && loan.termMonths > 1
      ? (firstInstallment - lastInstallment) / (loan.termMonths - 1)
      : 0;

  const handlePropertyValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value.replace(/\D/g, ''));
    onChange({
      ...loan,
      propertyValue: val,
      downPayment: Math.min(loan.downPayment, val),
    });
  };

  const handleDownPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value.replace(/\D/g, ''));
    onChange({
      ...loan,
      downPayment: Math.min(val, loan.propertyValue),
    });
  };

  const handleDownPaymentPercentClick = (percent: number) => {
    const newDown = Math.round(loan.propertyValue * (percent / 100));
    onChange({
      ...loan,
      downPayment: newDown,
    });
  };

  const handleBandSelect = (rate: number) => {
    onChange({
      ...loan,
      annualInterestRate: rate,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-xs p-5 sm:p-6 text-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
        <div>
          <h2 className="text-base font-bold text-zinc-900">1. Dados do Financiamento</h2>
          <p className="text-xs text-zinc-500">Parâmetros contratados na Caixa Econômica / MCMV</p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-medium text-zinc-400 block">1ª Parcela Estimada</span>
          <span className="text-sm sm:text-base font-bold text-zinc-900 tabular-nums">
            {formatCurrency(firstInstallment)}<span className="text-xs font-normal text-zinc-500">/mês</span>
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Valor do Imóvel */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center justify-between">
            <span>Valor Total do Imóvel</span>
            <span className="text-[11px] font-normal text-zinc-400">Sugestões rápidas</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-sm">
              R$
            </span>
            <input
              id="property-value-input"
              type="text"
              value={loan.propertyValue.toLocaleString('pt-BR')}
              onChange={handlePropertyValueChange}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-semibold text-sm focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition tabular-nums"
              placeholder="0"
            />
          </div>
          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {PROPERTY_PRESETS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange({ ...loan, propertyValue: val, downPayment: Math.min(loan.downPayment, val) })}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition ${
                  loan.propertyValue === val
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 border border-zinc-200/80'
                }`}
              >
                {formatCurrency(val)}
              </button>
            ))}
          </div>
        </div>

        {/* Entrada / FGTS / Subsídio */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center justify-between">
            <span>Entrada / FGTS / Subsídio</span>
            <span className="text-[11px] font-semibold text-zinc-500">
              {downPaymentPercent.toFixed(1)}% do imóvel
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-sm">
              R$
            </span>
            <input
              id="down-payment-input"
              type="text"
              value={loan.downPayment.toLocaleString('pt-BR')}
              onChange={handleDownPaymentChange}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-semibold text-sm focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition tabular-nums"
              placeholder="0"
            />
          </div>
          {/* Percent chips */}
          <div className="flex items-center gap-1.5 mt-2">
            {[10, 20, 30, 40].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleDownPaymentPercentClick(pct)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition ${
                  Math.round(downPaymentPercent) === pct
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 border border-zinc-200/80'
                }`}
              >
                {pct}% ({formatCurrency(loan.propertyValue * (pct / 100))})
              </button>
            ))}
          </div>
        </div>

        {/* Prazo em Meses */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center justify-between">
            <span>Prazo do Financiamento</span>
            <span className="text-[11px] font-medium text-zinc-500">
              {Math.floor(loan.termMonths / 12)} anos ({loan.termMonths} meses)
            </span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { months: 420, label: '420 meses', sub: '35 anos (MCMV)' },
              { months: 360, label: '360 meses', sub: '30 anos (Padrão)' },
              { months: 240, label: '240 meses', sub: '20 anos' },
            ].map((item) => (
              <button
                key={item.months}
                type="button"
                onClick={() => onChange({ ...loan, termMonths: item.months })}
                className={`py-2 px-2.5 rounded-lg border text-left transition-all ${
                  loan.termMonths === item.months
                    ? 'border-zinc-900 bg-zinc-50 text-zinc-900 ring-1 ring-zinc-900 shadow-xs'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                }`}
              >
                <div className="text-xs font-semibold leading-none">{item.label}</div>
                <div className="text-[10px] text-zinc-500 mt-1">{item.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sistema de Amortização (SAC vs PRICE) */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            Sistema de Amortização
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...loan, system: 'SAC' })}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                loan.system === 'SAC'
                  ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900 shadow-xs'
                  : 'border-zinc-200 bg-white hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900">SAC (Caixa)</span>
                {loan.system === 'SAC' && (
                  <span className="text-[10px] font-semibold bg-zinc-900 text-white px-1.5 py-0.5 rounded">
                    Recomendado
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-500 mt-1 leading-tight">
                Parcelas decrescentes. Amortização constante todo mês.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onChange({ ...loan, system: 'PRICE' })}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                loan.system === 'PRICE'
                  ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900 shadow-xs'
                  : 'border-zinc-200 bg-white hover:bg-zinc-50'
              }`}
            >
              <div className="text-xs font-semibold text-zinc-900">PRICE (Tabela Price)</div>
              <p className="text-[10px] text-zinc-500 mt-1 leading-tight">
                Parcelas fixas. No começo, a maior parte é juros.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Taxas do Minha Casa Minha Vida */}
      <div className="mt-5 pt-4 border-t border-zinc-100">
        <label className="block text-xs font-semibold text-zinc-700 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-red-600" />
            Taxa de Juros Anual do Minha Casa Minha Vida
          </span>
          <span className="text-xs font-bold text-zinc-900 tabular-nums">
            {loan.annualInterestRate}% a.a. ({(loan.annualInterestRate / 12).toFixed(3)}% ao mês)
          </span>
        </label>

        {/* Faixas MCMV Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MCMV_BANDS.map((band) => {
            const isSelected = Math.abs(loan.annualInterestRate - band.defaultRate) < 0.05;
            return (
              <button
                key={band.id}
                type="button"
                onClick={() => handleBandSelect(band.defaultRate)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900 text-zinc-900 shadow-xs'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{band.name}</span>
                  <span className="text-xs font-bold text-zinc-900 tabular-nums">{band.defaultRate}%</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5 truncate">{band.incomeRange}</div>
              </button>
            );
          })}
        </div>

        {/* Slider & manual custom rate input */}
        <div className="mt-3 flex items-center gap-3">
          <input
            type="range"
            min="4.00"
            max="12.00"
            step="0.05"
            value={loan.annualInterestRate}
            onChange={(e) => onChange({ ...loan, annualInterestRate: Number(e.target.value) })}
            className="flex-1 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
          <div className="flex items-center gap-1 w-28 shrink-0">
            <input
              type="number"
              step="0.01"
              min="1"
              max="20"
              value={loan.annualInterestRate}
              onChange={(e) => onChange({ ...loan, annualInterestRate: Number(e.target.value) })}
              className="w-full text-center py-1 px-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs font-bold text-zinc-900 focus:border-red-600 outline-none"
            />
            <span className="text-xs font-semibold text-zinc-500">% a.a.</span>
          </div>
        </div>
      </div>

      {/* Demonstrativo Oficial Caixa */}
      <div className="mt-5 p-5 rounded-xl bg-zinc-50 border border-zinc-200/90 text-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Demonstrativo da 1ª Prestação (Na Mesa)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-200 text-zinc-700">
                Sistema {loan.system}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {loan.system === 'SAC'
                ? `Parcelas decrescentes em ${loan.termMonths} meses (${Math.floor(loan.termMonths / 12)} anos)`
                : `Parcelas fixas em ${loan.termMonths} meses (${Math.floor(loan.termMonths / 12)} anos)`}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white text-zinc-700 border border-zinc-200">
            {loan.annualInterestRate}% a.a.
          </span>
        </div>

        {/* Big Installment Numbers */}
        <div className="mt-4 pt-3 border-t border-zinc-200/70 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-[11px] font-medium text-zinc-500 block">
              {loan.system === 'SAC' ? '1ª Parcela (Maior prestação do contrato)' : 'Parcela Mensal Fixa'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight tabular-nums">
                {formatCurrency(firstInstallment)}
              </span>
              <span className="text-sm font-semibold text-zinc-500">/mês</span>
            </div>
          </div>

          {loan.system === 'SAC' ? (
            <div className="text-left sm:text-right bg-white px-3.5 py-2.5 rounded-lg border border-zinc-200">
              <span className="text-[10px] font-semibold text-zinc-400 block uppercase tracking-wider">
                Última Parcela (Mês {loan.termMonths})
              </span>
              <span className="text-base font-bold text-zinc-800 tabular-nums">
                {formatCurrency(lastInstallment)}
              </span>
              <span className="block text-[11px] text-zinc-500 font-medium mt-0.5">
                Reduz ~{formatCurrency(sacMonthlyDrop)}/mês
              </span>
            </div>
          ) : (
            <div className="text-left sm:text-right bg-white px-3.5 py-2.5 rounded-lg border border-zinc-200">
              <span className="text-[10px] font-semibold text-zinc-400 block uppercase tracking-wider">
                Tipo da Prestação
              </span>
              <span className="text-base font-bold text-zinc-800">
                100% Fixa
              </span>
              <span className="block text-[11px] text-zinc-500 font-medium mt-0.5">
                Mesmo valor até o final
              </span>
            </div>
          )}
        </div>

        {/* Decomposição da 1ª Parcela */}
        <div className="mt-4 pt-3 border-t border-zinc-200/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-700">
              Composição da primeira parcela de {formatCurrency(firstInstallment)}:
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">Transparência Bancária</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-zinc-200">
              <span className="text-[10px] text-zinc-400 font-medium block uppercase tracking-wider">Amortização</span>
              <span className="text-xs sm:text-sm font-bold text-zinc-900 block mt-0.5 tabular-nums">
                {formatCurrency(amortizationPart)}
              </span>
              <span className="text-[10px] text-zinc-500 block leading-tight mt-0.5">abate direto na dívida</span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-zinc-200">
              <span className="text-[10px] text-zinc-400 font-medium block uppercase tracking-wider">Juros Bancários</span>
              <span className="text-xs sm:text-sm font-bold text-red-600 block mt-0.5 tabular-nums">
                {formatCurrency(interestPart)}
              </span>
              <span className="text-[10px] text-zinc-500 block leading-tight mt-0.5">{loan.annualInterestRate}% ao ano</span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-zinc-200">
              <span className="text-[10px] text-zinc-400 font-medium block uppercase tracking-wider">Seguros + Taxa</span>
              <span className="text-xs sm:text-sm font-bold text-zinc-800 block mt-0.5 tabular-nums">
                {formatCurrency(feesPart)}
              </span>
              <span className="text-[10px] text-zinc-500 block leading-tight mt-0.5">MIP, DFI e Adm</span>
            </div>
          </div>
        </div>

        {/* Renda Familiar Mínima Estimada */}
        <div className="mt-3.5 pt-3 border-t border-zinc-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
          <span className="text-zinc-600 font-medium">
            Renda bruta familiar sugerida para aprovação (margem 30%):
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-zinc-900 text-sm sm:text-base tabular-nums">
              ~{formatCurrency(minIncome)}
            </span>
            <span className="text-[11px] text-zinc-500 font-medium">/mês</span>
          </div>
        </div>

        {/* Formal Contract Summary */}
        <div className="mt-3 bg-white border border-zinc-200 p-2.5 rounded-lg text-xs text-zinc-600 flex items-center justify-between">
          <span>
            Financiamento: <strong className="text-zinc-900">{formatCurrency(financedAmount)}</strong> • {loan.termMonths} meses a{' '}
            <strong className="text-zinc-900">{loan.annualInterestRate}% a.a.</strong> ({loan.system})
          </span>
          <span className="text-[11px] font-medium text-zinc-400 hidden sm:inline">
            Caixa Econômica Federal
          </span>
        </div>
      </div>

      {/* Advanced Caixa Fees Toggle */}
      {!presentationMode && (
        <div className="mt-4 pt-3 border-t border-zinc-100">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition"
          >
            <span>Configurações bancárias adicionais (MIP, DFI, Taxa Adm Caixa)</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvanced && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200 text-xs text-zinc-700">
              <div>
                <label className="block text-zinc-600 font-bold mb-1">
                  Taxa de Administração Caixa (Mensal)
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500">R$</span>
                  <input
                    type="number"
                    value={loan.monthlyAdminFee}
                    onChange={(e) => onChange({ ...loan, monthlyAdminFee: Number(e.target.value) })}
                    className="w-24 px-2.5 py-1 bg-white border border-zinc-300 text-zinc-900 rounded-lg font-bold"
                  />
                  <span className="text-zinc-500 text-[11px]">(Padrão MCMV: R$ 25,00)</span>
                </div>
              </div>

              <div>
                <label className="block text-zinc-600 font-bold mb-1">
                  Seguros Obrigatórios (MIP + DFI)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.005"
                    value={loan.insuranceRateMonthly}
                    onChange={(e) => onChange({ ...loan, insuranceRateMonthly: Number(e.target.value) })}
                    className="w-20 px-3 py-1.5 bg-white border border-zinc-300 text-zinc-900 rounded-lg font-bold"
                  />
                  <span className="text-zinc-600 font-semibold">% sobre o saldo ao mês</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
