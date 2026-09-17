import React, { useState, useEffect } from 'react';
import { Percent } from 'lucide-react';
import { formatBRL } from '../utils/formatter';
import { round2 } from '../utils/calculator';

interface FinancingCalculatorBoxProps {
  valorImovel: number;
  valorAdimplencia?: number;
  temAdimplencia?: boolean;
  financiamentoAtual: number;
  onChangeFinanciamento: (novoValor: number) => void;
}

export const FinancingCalculatorBox: React.FC<FinancingCalculatorBoxProps> = ({
  valorImovel,
  valorAdimplencia = 0,
  temAdimplencia = false,
  financiamentoAtual,
  onChangeFinanciamento,
}) => {
  // Mode: 'financ' (% do financiamento) vs 'entrada' (% da entrada, financiando o restante)
  const [mode, setMode] = useState<'financ' | 'entrada'>('financ');
  // Se tem adimplência preenchida, calcula por padrão sobre o valor com adimplência (Total da Venda)
  const [useAdimplenciaBase, setUseAdimplenciaBase] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<number | 'custom' | null>(null);
  const [customPercent, setCustomPercent] = useState<string>('');

  const hasAdimplencia = temAdimplencia && (valorAdimplencia || 0) > 0;
  const valorBase = hasAdimplencia && useAdimplenciaBase
    ? (valorImovel || 0) + (valorAdimplencia || 0)
    : (valorImovel || 0);

  // Calculate current effective percentage based on current effective base
  const currentPercentOfProperty = valorBase > 0 ? (financiamentoAtual / valorBase) * 100 : 0;

  // Determine which percentage button corresponds to current value
  useEffect(() => {
    if (valorBase <= 0) return;

    if (mode === 'financ') {
      const match = [10, 20, 30, 80].find(
        (pct) => Math.abs(currentPercentOfProperty - pct) < 0.15
      );
      if (match !== undefined) {
        setSelectedOption(match);
      } else if (financiamentoAtual > 0) {
        setSelectedOption('custom');
        setCustomPercent(currentPercentOfProperty.toFixed(2));
      } else {
        setSelectedOption(null);
      }
    } else {
      // mode === 'entrada'
      const entryPct = 100 - currentPercentOfProperty;
      const match = [10, 20, 30].find(
        (pct) => Math.abs(entryPct - pct) < 0.15
      );
      if (match !== undefined) {
        setSelectedOption(match);
      } else if (financiamentoAtual > 0) {
        setSelectedOption('custom');
        setCustomPercent(entryPct.toFixed(2));
      } else {
        setSelectedOption(null);
      }
    }
  }, [financiamentoAtual, valorBase, mode, currentPercentOfProperty]);

  const handleSelectPreset = (pct: number) => {
    setSelectedOption(pct);
    if (valorBase <= 0) return;

    let targetFinanc = 0;
    if (mode === 'financ') {
      targetFinanc = round2((valorBase * pct) / 100);
    } else {
      // mode === 'entrada' (e.g. 20% entrada -> 80% financ)
      targetFinanc = round2((valorBase * (100 - pct)) / 100);
    }

    onChangeFinanciamento(targetFinanc);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(',', '.');
    setCustomPercent(rawVal);
    setSelectedOption('custom');

    const num = parseFloat(rawVal);
    if (!isNaN(num) && num >= 0 && num <= 100 && valorBase > 0) {
      let targetFinanc = 0;
      if (mode === 'financ') {
        targetFinanc = round2((valorBase * num) / 100);
      } else {
        targetFinanc = round2((valorBase * (100 - num)) / 100);
      }
      onChangeFinanciamento(targetFinanc);
    }
  };

  const calculatePreview = (pct: number) => {
    if (valorBase <= 0) return 'R$ 0,00';
    const val = mode === 'financ' 
      ? (valorBase * pct) / 100 
      : (valorBase * (100 - pct)) / 100;
    return formatBRL(val);
  };

  return (
    <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
      {/* Top Header: Title + Mode Toggle */}
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
          <Percent className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span>Calcular por % automática:</span>
        </div>

        {/* Small Mode Selector */}
        <div className="inline-flex items-center bg-slate-200/80 p-0.5 rounded-md text-[10px] font-semibold">
          <button
            type="button"
            onClick={() => setMode('financ')}
            title="Calcular a porcentagem direta financiada"
            className={`px-1.5 py-0.5 rounded transition-colors ${
              mode === 'financ'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            % Financiada
          </button>
          <button
            type="button"
            onClick={() => setMode('entrada')}
            title="Definir % de entrada e financiar o restante (ex: 20% entrada = 80% financ.)"
            className={`px-1.5 py-0.5 rounded transition-colors ${
              mode === 'entrada'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            % de Entrada
          </button>
        </div>
      </div>

      {/* Base de Cálculo: Com Desconto Concedido vs Só Imóvel */}
      {hasAdimplencia && (
        <div className="flex items-center justify-between gap-2 p-1.5 bg-emerald-50/80 border border-emerald-200 rounded-md text-[11px] text-emerald-950 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="font-semibold">Base p/ cálculo (%):</span>
            <strong className="text-emerald-900 font-bold">{formatBRL(valorBase)}</strong>
          </div>
          <div className="inline-flex items-center gap-1 text-[10px]">
            <button
              type="button"
              onClick={() => {
                setUseAdimplenciaBase(true);
                if (selectedOption && typeof selectedOption === 'number') {
                  const target = mode === 'financ'
                    ? round2(((valorImovel + valorAdimplencia) * selectedOption) / 100)
                    : round2(((valorImovel + valorAdimplencia) * (100 - selectedOption)) / 100);
                  onChangeFinanciamento(target);
                }
              }}
              title="Calcular sobre o valor da venda com desconto concedido incluso"
              className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                useAdimplenciaBase
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Com Desconto (+{formatBRL(valorAdimplencia)})
            </button>
            <button
              type="button"
              onClick={() => {
                setUseAdimplenciaBase(false);
                if (selectedOption && typeof selectedOption === 'number') {
                  const target = mode === 'financ'
                    ? round2((valorImovel * selectedOption) / 100)
                    : round2((valorImovel * (100 - selectedOption)) / 100);
                  onChangeFinanciamento(target);
                }
              }}
              title="Calcular apenas sobre o valor do imóvel sem desconto"
              className={`px-1.5 py-0.5 rounded font-medium transition cursor-pointer ${
                !useAdimplenciaBase
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Apenas Imóvel
            </button>
          </div>
        </div>
      )}

      {/* Preset Options Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 pt-0.5">
        {/* 10% */}
        <button
          type="button"
          onClick={() => handleSelectPreset(10)}
          title={`${mode === 'financ' ? '10% financiado' : '10% entrada (90% financ.)'}: ${calculatePreview(10)}`}
          className={`px-2 py-1.5 rounded-md border text-center font-bold text-xs transition-all ${
            selectedOption === 10
              ? 'bg-red-600 text-white border-red-700 shadow-2xs'
              : 'bg-white text-slate-700 border-slate-200 hover:border-red-300 hover:bg-red-50/50'
          }`}
        >
          <span>10%</span>
          <span className="block text-[9px] font-normal opacity-85 truncate">
            {mode === 'entrada' ? 'Financ 90%' : calculatePreview(10)}
          </span>
        </button>

        {/* 20% */}
        <button
          type="button"
          onClick={() => handleSelectPreset(20)}
          title={`${mode === 'financ' ? '20% financiado' : '20% entrada (80% financ.)'}: ${calculatePreview(20)}`}
          className={`px-2 py-1.5 rounded-md border text-center font-bold text-xs transition-all ${
            selectedOption === 20
              ? 'bg-red-600 text-white border-red-700 shadow-2xs'
              : 'bg-white text-slate-700 border-slate-200 hover:border-red-300 hover:bg-red-50/50'
          }`}
        >
          <span>20%</span>
          <span className="block text-[9px] font-normal opacity-85 truncate">
            {mode === 'entrada' ? 'Financ 80%' : calculatePreview(20)}
          </span>
        </button>

        {/* 30% */}
        <button
          type="button"
          onClick={() => handleSelectPreset(30)}
          title={`${mode === 'financ' ? '30% financiado' : '30% entrada (70% financ.)'}: ${calculatePreview(30)}`}
          className={`px-2 py-1.5 rounded-md border text-center font-bold text-xs transition-all ${
            selectedOption === 30
              ? 'bg-red-600 text-white border-red-700 shadow-2xs'
              : 'bg-white text-slate-700 border-slate-200 hover:border-red-300 hover:bg-red-50/50'
          }`}
        >
          <span>30%</span>
          <span className="block text-[9px] font-normal opacity-85 truncate">
            {mode === 'entrada' ? 'Financ 70%' : calculatePreview(30)}
          </span>
        </button>

        {/* 80% CEF (or 80% preset in financ mode) */}
        {mode === 'financ' ? (
          <button
            type="button"
            onClick={() => handleSelectPreset(80)}
            title={`80% padrão CEF: ${calculatePreview(80)}`}
            className={`px-2 py-1.5 rounded-md border text-center font-bold text-xs transition-all ${
              selectedOption === 80
                ? 'bg-red-600 text-white border-red-700 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-red-300 hover:bg-red-50/50'
            }`}
          >
            <span>80%</span>
            <span className="block text-[9px] font-semibold opacity-95 truncate text-amber-700">
              {hasAdimplencia ? 'c/ Adimplência' : 'Padrão CEF'}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleSelectPreset(20)}
            title="Entrada padrão de 20% (Financia 80% CEF)"
            className="px-2 py-1.5 rounded-md border text-center font-bold text-xs bg-white text-slate-700 border-slate-200 hover:border-red-300 hover:bg-red-50/50"
          >
            <span>Padrão</span>
            <span className="block text-[9px] font-semibold opacity-95 truncate text-amber-700">
              {hasAdimplencia ? '80% c/ Adimp.' : '80% CEF'}
            </span>
          </button>
        )}

        {/* Opcional / Custom % */}
        <button
          type="button"
          onClick={() => {
            setSelectedOption('custom');
            if (!customPercent && currentPercentOfProperty > 0) {
              setCustomPercent(currentPercentOfProperty.toFixed(1));
            }
          }}
          title="Digitar qualquer porcentagem personalizada"
          className={`px-2 py-1.5 rounded-md border text-center font-bold text-xs transition-all col-span-4 sm:col-span-1 ${
            selectedOption === 'custom'
              ? 'bg-slate-900 text-white border-slate-950 shadow-2xs'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
          }`}
        >
          <span>Opcional</span>
          <span className="block text-[9px] font-normal opacity-85 truncate">
            {selectedOption === 'custom' && customPercent ? `${customPercent}%` : 'Personalizar'}
          </span>
        </button>
      </div>

      {/* When 'Opcional' is active, show the small custom input */}
      {selectedOption === 'custom' && (
        <div className="pt-1 flex items-center gap-2 bg-white p-2 rounded-md border border-slate-200 animate-in fade-in duration-150">
          <label className="text-[11px] font-semibold text-slate-600 shrink-0">
            {mode === 'financ' ? '% a Financiar:' : '% de Entrada:'}
          </label>
          <div className="relative flex-1 max-w-[120px]">
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={customPercent}
              onChange={handleCustomChange}
              placeholder="ex: 73.35"
              className="w-full pl-2 pr-6 py-1 text-xs font-bold text-slate-900 border border-slate-300 rounded focus:border-red-500 focus:outline-none"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[11px]">
              %
            </span>
          </div>

          <div className="text-[11px] text-slate-500 truncate flex-1 text-right">
            = <strong className="text-red-700">{formatBRL(financiamentoAtual)}</strong>
          </div>
        </div>
      )}
    </div>
  );
};
