import React, { useState, useEffect } from 'react';
import {
  Percent,
  ChevronDown,
  ChevronUp,
  User,
  AlertTriangle,
  Info,
  ShieldCheck,
  TrendingDown,
  Calendar,
  Wallet,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';
import { LoanInput, SimulationResult } from '../types';
import { MCMV_BANDS, runSimulation, calculateIncomeDiagnosis } from '../utils/financialCalculations';
import { calculateMaxTermForAge, getAgeFinancingDiagnosis } from '../utils/mcmvAgeRules';
import { formatCurrency, parseBRLInput, formatBRLNumber } from '../utils/formatters';

interface ContractFormProps {
  loan: LoanInput;
  onChange: (updated: LoanInput) => void;
  result?: SimulationResult;
  presentationMode?: boolean;
}

const PROPERTY_PRESETS = [200000, 260000, 300000, 350000, 420000];
const INCOME_PRESETS = [3000, 4500, 5000, 6500, 8000];

export const ContractForm: React.FC<ContractFormProps> = ({
  loan,
  onChange,
  result,
  presentationMode = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Local string states for smooth numeric editing without cursor jumping or format corruption
  const [propertyValueStr, setPropertyValueStr] = useState<string>(
    loan.propertyValue ? formatBRLNumber(loan.propertyValue) : ''
  );
  const [downPaymentStr, setDownPaymentStr] = useState<string>(
    loan.downPayment ? formatBRLNumber(loan.downPayment) : ''
  );
  const [incomeStr, setIncomeStr] = useState<string>(
    loan.grossIncome ? formatBRLNumber(loan.grossIncome) : ''
  );
  const [isPropFocused, setIsPropFocused] = useState(false);
  const [isDownFocused, setIsDownFocused] = useState(false);
  const [isIncomeFocused, setIsIncomeFocused] = useState(false);

  useEffect(() => {
    if (!isPropFocused) {
      setPropertyValueStr(loan.propertyValue ? formatBRLNumber(loan.propertyValue) : '');
    }
  }, [loan.propertyValue, isPropFocused]);

  useEffect(() => {
    if (!isDownFocused) {
      setDownPaymentStr(loan.downPayment ? formatBRLNumber(loan.downPayment) : '');
    }
  }, [loan.downPayment, isDownFocused]);

  useEffect(() => {
    if (!isIncomeFocused) {
      setIncomeStr(loan.grossIncome ? formatBRLNumber(loan.grossIncome) : '');
    }
  }, [loan.grossIncome, isIncomeFocused]);

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

  // Caixa 30% gross income rule & Diagnosis:
  const minIncome = firstInstallment > 0 ? firstInstallment / 0.30 : 0;
  const incomeDiagnosis = calculateIncomeDiagnosis(loan, firstInstallment);

  const sacMonthlyDrop =
    loan.system === 'SAC' && loan.termMonths > 1
      ? (firstInstallment - lastInstallment) / (loan.termMonths - 1)
      : 0;

  // MCMV Age Rules & Diagnosis (Regra dos 80 anos e 6 meses da Caixa)
  const clientAge = loan.clientAge || 35;
  const ageDiagnosis = getAgeFinancingDiagnosis(
    clientAge,
    financedAmount,
    loan.annualInterestRate,
    loan.system
  );

  const handleAgeChange = (newAge: number) => {
    const safeAge = Math.max(18, Math.min(80, newAge));
    const termInfo = calculateMaxTermForAge(safeAge);
    const updatedTerm = Math.min(loan.termMonths, termInfo.maxTermMonths);
    onChange({
      ...loan,
      clientAge: safeAge,
      termMonths: updatedTerm,
    });
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setIncomeStr(raw);
    const parsed = parseBRLInput(raw);
    onChange({
      ...loan,
      grossIncome: parsed,
    });
  };

  const handleIncomeBlur = () => {
    setIsIncomeFocused(false);
    const parsed = parseBRLInput(incomeStr);
    onChange({
      ...loan,
      grossIncome: parsed,
    });
    setIncomeStr(parsed ? formatBRLNumber(parsed) : '');
  };

  const handleIncomePresetClick = (val: number) => {
    setIncomeStr(formatBRLNumber(val));
    onChange({
      ...loan,
      grossIncome: val,
    });
  };

  // Auto-adjust down payment to fit current client income
  const handleAutoAdjustDownPayment = () => {
    if (incomeDiagnosis.neededDownPayment > 0) {
      setDownPaymentStr(formatBRLNumber(incomeDiagnosis.neededDownPayment));
      onChange({
        ...loan,
        downPayment: incomeDiagnosis.neededDownPayment,
      });
    }
  };

  const handlePropertyValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setPropertyValueStr(raw);
    const parsed = parseBRLInput(raw);
    onChange({
      ...loan,
      propertyValue: parsed,
      downPayment: Math.min(loan.downPayment, parsed),
    });
  };

  const handlePropertyValueBlur = () => {
    setIsPropFocused(false);
    const parsed = parseBRLInput(propertyValueStr);
    onChange({
      ...loan,
      propertyValue: parsed,
      downPayment: Math.min(loan.downPayment, parsed),
    });
    setPropertyValueStr(parsed ? formatBRLNumber(parsed) : '');
  };

  const handleDownPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDownPaymentStr(raw);
    const parsed = parseBRLInput(raw);
    onChange({
      ...loan,
      downPayment: Math.min(parsed, loan.propertyValue),
    });
  };

  const handleDownPaymentBlur = () => {
    setIsDownFocused(false);
    const parsed = parseBRLInput(downPaymentStr);
    onChange({
      ...loan,
      downPayment: Math.min(parsed, loan.propertyValue),
    });
    setDownPaymentStr(parsed ? formatBRLNumber(parsed) : '');
  };

  const handleDownPaymentPercentClick = (percent: number) => {
    const newDown = Math.round(loan.propertyValue * (percent / 100));
    setDownPaymentStr(formatBRLNumber(newDown));
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
              value={propertyValueStr}
              onFocus={() => setIsPropFocused(true)}
              onBlur={handlePropertyValueBlur}
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
                onClick={() => {
                  setPropertyValueStr(formatBRLNumber(val));
                  onChange({ ...loan, propertyValue: val, downPayment: Math.min(loan.downPayment, val) });
                }}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
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
              value={downPaymentStr}
              onFocus={() => setIsDownFocused(true)}
              onBlur={handleDownPaymentBlur}
              onChange={handleDownPaymentChange}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-semibold text-sm focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition tabular-nums"
              placeholder="0"
            />
          </div>
          {/* Percent chips */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 mt-2">
            <div className="flex items-center gap-1.5">
              {[10, 20, 30, 40].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleDownPaymentPercentClick(pct)}
                  className={`text-xs px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                    Math.round(downPaymentPercent) === pct
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 border border-zinc-200/80'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">
              {formatCurrency(loan.downPayment)}
            </span>
          </div>
        </div>

        {/* Renda Bruta Familiar (Comprador / Coobrigados) */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-zinc-600" />
              <span>Renda Bruta Familiar da Pessoa</span>
            </span>
            <span className="text-[11px] font-semibold text-zinc-500">
              {loan.grossIncome ? formatCurrency(loan.grossIncome) : 'Ex: R$ 5.000,00'}
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-sm">
              R$
            </span>
            <input
              id="gross-income-input"
              type="text"
              value={incomeStr}
              onFocus={() => setIsIncomeFocused(true)}
              onBlur={handleIncomeBlur}
              onChange={handleIncomeChange}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-semibold text-sm focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition tabular-nums"
              placeholder="Ex: 5.000,00"
            />
          </div>
          {/* Quick Income Presets */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {INCOME_PRESETS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleIncomePresetClick(val)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  loan.grossIncome === val
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 border border-zinc-200/80'
                }`}
              >
                {formatCurrency(val)}
              </button>
            ))}
          </div>
        </div>

        {/* Idade do Proponente (Regra MCMV / Caixa) */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-600" />
              <span>Idade do Comprador / Proponente Mais Velho</span>
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
              clientAge >= 50
                ? 'bg-amber-100 text-amber-800'
                : 'bg-zinc-100 text-zinc-700'
            }`}>
              {clientAge} anos
            </span>
          </label>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="client-age-input"
                type="number"
                min="18"
                max="80"
                value={clientAge}
                onChange={(e) => handleAgeChange(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-bold text-sm focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition tabular-nums"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-medium">
                anos
              </span>
            </div>

            <input
              type="range"
              min="18"
              max="75"
              value={clientAge}
              onChange={(e) => handleAgeChange(Number(e.target.value))}
              className="flex-1 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
            />
          </div>

          {/* Quick Age Presets */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[25, 35, 45, 50, 55, 62].map((ageVal) => (
              <button
                key={ageVal}
                type="button"
                onClick={() => handleAgeChange(ageVal)}
                className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition ${
                  clientAge === ageVal
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : ageVal >= 50
                    ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-300 font-semibold'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 border border-zinc-200/80'
                }`}
              >
                {ageVal} anos
              </button>
            ))}
          </div>

          {/* Sub-label explaining Caixa rule */}
          <div className="mt-1.5 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Regra Caixa: Idade + Prazo ≤ 80,5 anos</span>
            <span className="font-semibold text-zinc-700">Teto: {ageDiagnosis.maxTermFormatted}</span>
          </div>
        </div>

        {/* Prazo em Meses com Entrada Manual e Atalhos */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center justify-between">
            <span>Prazo do Financiamento</span>
            <span className="text-[11px] font-medium text-zinc-500">
              {Math.floor(loan.termMonths / 12)} anos ({loan.termMonths} meses)
            </span>
          </label>

          {/* Campo Manual para digitar qualquer quantidade de meses (ex: 330) */}
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1">
              <input
                id="loan-term-months-input"
                type="number"
                min="12"
                max={ageDiagnosis.maxTermMonths}
                value={loan.termMonths || ''}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '') {
                    onChange({ ...loan, termMonths: 0 });
                    return;
                  }
                  const val = parseInt(raw, 10);
                  if (!isNaN(val)) {
                    onChange({
                      ...loan,
                      termMonths: Math.max(1, Math.min(val, ageDiagnosis.maxTermMonths)),
                    });
                  }
                }}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-bold text-sm focus:bg-white focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition tabular-nums"
                placeholder="Ex: 330"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-medium">
                meses
              </span>
            </div>

            {/* Atalho rápido para usar o teto exato da Caixa */}
            {ageDiagnosis.isLimitedByAge && loan.termMonths !== ageDiagnosis.maxTermMonths && (
              <button
                type="button"
                onClick={() => onChange({ ...loan, termMonths: ageDiagnosis.maxTermMonths })}
                className="px-2.5 py-2 rounded-lg text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition shrink-0 cursor-pointer"
                title="Ajustar para o teto legal permitido pela Caixa"
              >
                Usar Teto ({ageDiagnosis.maxTermMonths}m)
              </button>
            )}
          </div>

          {/* Atalhos Rápidos Inteligentes */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              ageDiagnosis.maxTermMonths < 420 && ageDiagnosis.maxTermMonths !== 360 && ageDiagnosis.maxTermMonths !== 240
                ? { months: ageDiagnosis.maxTermMonths, label: `${ageDiagnosis.maxTermMonths}m (Teto)` }
                : null,
              { months: 420, label: '420m (35a)' },
              { months: 360, label: '360m (30a)' },
              { months: 300, label: '300m (25a)' },
              { months: 240, label: '240m (20a)' },
              { months: 180, label: '180m (15a)' },
            ]
              .filter(Boolean)
              .slice(0, 4)
              .map((item) => {
                if (!item) return null;
                const isBlockedByAge = item.months > ageDiagnosis.maxTermMonths;
                return (
                  <button
                    key={item.months}
                    type="button"
                    disabled={isBlockedByAge}
                    onClick={() => onChange({ ...loan, termMonths: item.months })}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                      isBlockedByAge
                        ? 'opacity-35 bg-zinc-100 border-zinc-200 cursor-not-allowed text-zinc-400'
                        : loan.termMonths === item.months
                        ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs cursor-pointer'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 cursor-pointer'
                    }`}
                  >
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Sistema de Amortização (SAC vs PRICE) */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            Sistema de Amortização
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...loan, system: 'SAC' })}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                loan.system === 'SAC'
                  ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900 shadow-xs'
                  : 'border-zinc-200 bg-white hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900">SAC (Caixa)</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1 leading-tight">
                Parcelas decrescentes. Amortização constante todo mês.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onChange({ ...loan, system: 'PRICE' })}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
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

      {/* Nota Técnica de Enquadramento CEF (Regra 80,5 anos) */}
      <div className="mt-3.5 px-3.5 py-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-zinc-800">Parâmetros CEF (Regra 80,5 anos):</span>
          <span>
            Teto: <strong className="text-zinc-900">{ageDiagnosis.maxTermMonths} meses</strong> ({ageDiagnosis.maxTermYears} anos)
            {clientAge >= 50 && (
              <span className="text-zinc-500 ml-1.5 font-normal">
                • Proponente com {clientAge} anos (-{ageDiagnosis.yearsLost}a no prazo)
              </span>
            )}
          </span>
        </div>
        <div className="text-[11px] text-zinc-500 font-medium sm:text-right shrink-0">
          Seguro MIP: <strong className="text-zinc-800">{ageDiagnosis.mipRateFormatted}</strong> a.m.
        </div>
      </div>

      {/* Diagnóstico de Enquadramento de Renda CEF / MCMV */}
      {loan.grossIncome && loan.grossIncome > 0 ? (
        <div className={`mt-4 p-4 rounded-xl border transition-all ${
          incomeDiagnosis.isApproved
            ? 'bg-white border-zinc-200 text-zinc-900 shadow-2xs'
            : 'bg-white border-red-200 text-zinc-900 shadow-2xs'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              {incomeDiagnosis.isApproved ? (
                <div className="w-6 h-6 rounded-md bg-zinc-900 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-md bg-red-600 text-white flex items-center justify-center shrink-0">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-zinc-900 leading-tight">
                  {incomeDiagnosis.isApproved
                    ? 'Enquadramento de Renda Aprovado (Margem 30%)'
                    : 'Comprometimento Acima da Margem Caixa (30%)'}
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Renda Informada: <strong className="text-zinc-800">{formatCurrency(incomeDiagnosis.income)}</strong> • Limite da 1ª Parcela: <strong className="text-zinc-800">{formatCurrency(incomeDiagnosis.maxCommitment)}/mês</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${
                incomeDiagnosis.isApproved 
                  ? 'bg-zinc-100 text-zinc-800 border-zinc-200' 
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {incomeDiagnosis.band.name} ({incomeDiagnosis.band.incomeRange})
              </span>
            </div>
          </div>

          {/* Análise de Comprometimento & Diagnóstico */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block">1ª Prestação Atual</span>
              <span className="text-base font-bold text-zinc-900 block mt-0.5">
                {formatCurrency(incomeDiagnosis.firstInstallment)}
              </span>
              <span className="text-[11px] text-zinc-500 block mt-0.5">
                Compromete <strong>{incomeDiagnosis.commitmentPercent.toFixed(1)}%</strong> da renda
              </span>
            </div>

            <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Renda Mínima Exigida</span>
              <span className="text-base font-bold text-zinc-900 block mt-0.5">
                {formatCurrency(incomeDiagnosis.requiredIncome)}
              </span>
              <span className="text-[11px] text-zinc-500 block mt-0.5">
                Margem máxima Caixa de 30%
              </span>
            </div>

            <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Diagnóstico Caixa</span>
              <span className={`text-base font-bold block mt-0.5 ${
                incomeDiagnosis.isApproved ? 'text-zinc-900' : 'text-red-600'
              }`}>
                {incomeDiagnosis.isApproved ? 'Enquadrado' : 'Excede Margem'}
              </span>
              <span className="text-[11px] text-zinc-500 block mt-0.5">
                {incomeDiagnosis.isApproved ? 'Renda suficiente para aprovação' : `Excedente de ${(incomeDiagnosis.commitmentPercent - 30).toFixed(1)}%`}
              </span>
            </div>
          </div>

          {/* Caso NÃO ENQUADRE: Soluções para enquadramento e botão de auto-ajuste */}
          {!incomeDiagnosis.isApproved && (
            <div className="mt-3 pt-3 border-t border-zinc-200 space-y-2.5">
              <p className="text-xs font-semibold text-zinc-800 leading-snug">
                Alternativas para enquadramento do imóvel ({formatCurrency(loan.propertyValue)}):
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Opção 1: Complementar a Renda */}
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                  <span className="font-semibold text-zinc-900 block mb-1">
                    Opção 1: Composição Familiar de Renda
                  </span>
                  <p className="text-zinc-600 leading-relaxed">
                    Comprovar <strong className="text-zinc-900 font-semibold">+{formatCurrency(incomeDiagnosis.incomeGap)}/mês</strong> de renda adicional (ou compor renda até totalizar <strong>{formatCurrency(incomeDiagnosis.requiredIncome)}</strong>).
                  </p>
                </div>

                {/* Opção 2: Aumentar Entrada / Atrelar Ajuste */}
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 flex flex-col justify-between">
                  <div>
                    <span className="font-semibold text-zinc-900 block mb-1">
                      Opção 2: Ajuste da Entrada
                    </span>
                    <p className="text-zinc-600 leading-relaxed">
                      Aporte de <strong className="text-zinc-900 font-semibold">+{formatCurrency(incomeDiagnosis.downPaymentGap)}</strong> na entrada (passando de {formatCurrency(loan.downPayment)} para <strong>{formatCurrency(incomeDiagnosis.neededDownPayment)}</strong>).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoAdjustDownPayment}
                    className="mt-2.5 w-full py-2 px-3 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-semibold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Ajustar Entrada para {formatCurrency(incomeDiagnosis.neededDownPayment)}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-zinc-500 shrink-0" />
            <span>
              Informe a <strong>Renda Bruta Familiar</strong> acima para avaliar o enquadramento na margem de 30% da Caixa.
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleIncomePresetClick(5000)}
            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs shrink-0 cursor-pointer shadow-2xs transition"
          >
            Testar R$ 5.000
          </button>
        </div>
      )}

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
