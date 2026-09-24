import React from 'react';
import { ParcelamentoItem } from '../types';
import { CurrencyInput } from './CurrencyInput';
import { formatBRL, toInputDateFormat } from '../utils/formatter';
import { calculateParcelamentoItem, round2 } from '../utils/calculator';
import {
  Plus,
  Trash2,
  Calendar,
  Percent,
  Calculator,
  Layers,
} from 'lucide-react';

interface ParcelamentoSectionProps {
  parcelamentos: ParcelamentoItem[];
  onChange: (items: ParcelamentoItem[]) => void;
  saldoRestanteEntrada?: number;
}

export const ParcelamentoSection: React.FC<ParcelamentoSectionProps> = ({
  parcelamentos,
  onChange,
  saldoRestanteEntrada = 0,
}) => {
  const handleAddItem = () => {
    const nextIndex = parcelamentos.length + 1;
    const base: ParcelamentoItem = {
      id: `p_${Date.now()}`,
      title: `Parcelamento ${nextIndex}`,
      totalSemJuros: saldoRestanteEntrada > 0 ? saldoRestanteEntrada : 0,
      jurosAoMes: 1.0,
      quantidadeParcelas: 12,
      dataVencimento: new Date().toISOString().split('T')[0],
      tipoCalculo: 'simples',
      temJurosDiluidos: false,
      jurosAdimplenciaDiluido: 0,
      jurosReforcosDiluido: 0,
      valorParcelaCalculada: 0,
      valorTotalComJuros: 0,
    };
    const calc = calculateParcelamentoItem(base);
    onChange([...parcelamentos, { ...base, ...calc }]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = parcelamentos.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateItem = (index: number, updates: Partial<ParcelamentoItem>) => {
    const updated = [...parcelamentos];
    const merged = { ...updated[index], ...updates };
    const calc = calculateParcelamentoItem(merged);
    updated[index] = {
      ...merged,
      valorParcelaCalculada: calc.valorParcelaCalculada,
      valorTotalComJuros: calc.valorTotalComJuros,
    };
    onChange(updated);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <Calculator className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">
              Parcelamentos Mensais da Entrada
            </h3>
            <p className="text-xs text-slate-500">
              Cálculo com % de juros a.m. e suporte a juros diluídos (adimplência e reforços)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors border border-slate-200 hover:border-red-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Adicionar Série
        </button>
      </div>

      {parcelamentos.length === 0 ? (
        <div className="py-6 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <p className="text-sm">Nenhum parcelamento mensal adicionado.</p>
          <button
            type="button"
            onClick={handleAddItem}
            className="mt-2 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
          >
            + Adicionar Parcelamento Mensal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {parcelamentos.map((item, idx) => {
            const calculated = calculateParcelamentoItem(item);
            const jurosGerados = round2(
              calculated.valorTotalComJuros - (item.totalSemJuros || 0)
            );

            return (
              <div
                key={item.id || idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4 transition-all hover:border-slate-300"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-6 h-6 rounded-full bg-slate-950 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        handleUpdateItem(idx, { title: e.target.value })
                      }
                      placeholder={
                        idx === 0 ? 'Parcelamento (Mensal)' : `Parcelamento ${idx + 1}`
                      }
                      className="font-bold text-slate-800 text-sm bg-transparent border-b border-dashed border-slate-300 focus:border-red-500 focus:outline-none px-1 py-0.5"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateItem(idx, {
                          temJurosDiluidos: !item.temJurosDiluidos,
                        })
                      }
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                        item.temJurosDiluidos
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Incluir juros de adimplência ou reforços diluídos nesta série"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      {item.temJurosDiluidos ? 'Juros Diluídos Ativos' : '+ Juros Diluídos'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      title="Remover série"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Valor Sem Juros */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Valor Sem Juros
                    </label>
                    <CurrencyInput
                      id={`p_total_${idx}`}
                      value={item.totalSemJuros}
                      onChange={(val) =>
                        handleUpdateItem(idx, { totalSemJuros: val })
                      }
                      placeholder="0,00"
                    />
                  </div>

                  {/* Quantidade de Parcelas */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Nº de Parcelas
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="360"
                        value={item.quantidadeParcelas || ''}
                        onChange={(e) =>
                          handleUpdateItem(idx, {
                            quantidadeParcelas: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        placeholder="Ex: 11"
                        className="w-full pl-3 pr-8 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">
                        x
                      </span>
                    </div>
                  </div>

                  {/* Taxa de Juros ao Mês */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-600">
                        Juros ao mês (%)
                      </label>
                      <span className="text-[10px] text-slate-400">a.m.</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="20"
                        value={item.jurosAoMes !== undefined ? item.jurosAoMes : 0}
                        onChange={(e) =>
                          handleUpdateItem(idx, {
                            jurosAoMes: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="1,00"
                        className="w-full pl-3 pr-8 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <Percent className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
                    </div>
                  </div>

                  {/* 1º Vencimento */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      1º Vencimento
                    </label>
                    <input
                      type="date"
                      value={toInputDateFormat(item.dataVencimento)}
                      onChange={(e) =>
                        handleUpdateItem(idx, { dataVencimento: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Bloco de Juros Diluídos (Opcional) */}
                {item.temJurosDiluidos && (
                  <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-amber-800" />
                        Juros Adicionais Diluídos nas Parcelas desta Série
                      </span>
                      <span className="text-[11px] text-amber-800">
                        Somam ao total com juros e dividem nas {item.quantidadeParcelas || 1} parcelas
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-amber-900 mb-1">
                          Juros de Adimplência Diluídos
                        </label>
                        <CurrencyInput
                          id={`p_juros_adimp_${idx}`}
                          value={item.jurosAdimplenciaDiluido || 0}
                          onChange={(val) =>
                            handleUpdateItem(idx, { jurosAdimplenciaDiluido: val })
                          }
                          placeholder="Ex: 1.750,00"
                          className="bg-white border-amber-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-amber-900 mb-1">
                          Juros dos Reforços Diluídos
                        </label>
                        <CurrencyInput
                          id={`p_juros_reforco_${idx}`}
                          value={item.jurosReforcosDiluido || 0}
                          onChange={(val) =>
                            handleUpdateItem(idx, { jurosReforcosDiluido: val })
                          }
                          placeholder="Ex: 860,83"
                          className="bg-white border-amber-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Calculation Type & Summary Preview */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Método:</span>
                    <select
                      value={item.tipoCalculo || 'price'}
                      onChange={(e) =>
                        handleUpdateItem(idx, {
                          tipoCalculo: e.target.value as 'price' | 'simples' | 'sem_juros',
                        })
                      }
                      className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="price">Tabela Price (Compostos)</option>
                      <option value="simples">Juros Simples</option>
                      <option value="sem_juros">Sem Juros (0%)</option>
                    </select>
                  </div>

                  {/* Result pill */}
                  <div className="flex flex-wrap items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
                    <div>
                      <span className="text-slate-400 mr-1">Valor Parcela:</span>
                      <strong className="text-red-700 text-sm font-bold">
                        {item.quantidadeParcelas || 0}x de{' '}
                        {formatBRL(calculated.valorParcelaCalculada)}
                      </strong>
                    </div>

                    <div className="h-3 w-px bg-slate-200" />

                    <div>
                      <span className="text-slate-400 mr-1">Total c/ Juros:</span>
                      <strong className="text-slate-900 font-bold">
                        {formatBRL(calculated.valorTotalComJuros)}
                      </strong>
                    </div>

                    {jurosGerados > 0.009 && (
                      <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-800 text-[11px] font-semibold border border-orange-200">
                        +{formatBRL(jurosGerados)} juros
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
