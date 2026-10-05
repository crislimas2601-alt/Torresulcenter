import React from 'react';
import { ReforcoItem } from '../types';
import { CurrencyInput } from './CurrencyInput';
import { formatBRL, toInputDateFormat } from '../utils/formatter';
import { calculateReforcoItem } from '../utils/calculator';
import { Plus, Trash2, Calendar, TrendingUp, Percent } from 'lucide-react';

interface ReforcosSectionProps {
  reforcos: ReforcoItem[];
  onChange: (items: ReforcoItem[]) => void;
}

export const ReforcosSection: React.FC<ReforcosSectionProps> = ({
  reforcos,
  onChange,
}) => {
  const totalReforcosNominal = (reforcos || []).reduce((acc, cur) => acc + (cur.valor || 0), 0);

  let totalJurosReforcos = 0;
  let totalJurosDiluidos = 0;
  let totalReforcosFinal = 0;

  (reforcos || []).forEach((r) => {
    const calc = calculateReforcoItem(r);
    if (r.temJuros) {
      totalJurosReforcos += calc.valorJuros;
      if (r.diluirNasMensais) {
        totalJurosDiluidos += calc.valorJuros;
        totalReforcosFinal += (r.valor || 0);
      } else {
        totalReforcosFinal += calc.valorTotalComJuros;
      }
    } else {
      totalReforcosFinal += (r.valor || 0);
    }
  });

  const handleAddReforco = () => {
    const nextNum = reforcos.length + 1;
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + nextNum);

    const newItem: ReforcoItem = {
      id: `ref_${Date.now()}`,
      title: `Reforço ${nextNum}`,
      valor: 0,
      tipoVencimento: 'data',
      dataVencimento: nextYear.toISOString().split('T')[0],
      textoVencimento: '',
      temJuros: false,
      taxaJuros: 1.0,
      mesesJuros: 12,
      valorJuros: 0,
      diluirNasMensais: false,
    };
    onChange([...reforcos, newItem]);
  };

  const handleRemoveReforco = (index: number) => {
    const updated = reforcos.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateReforco = (index: number, updates: Partial<ReforcoItem>) => {
    const updated = [...reforcos];
    const merged = { ...updated[index], ...updates };
    const calc = calculateReforcoItem(merged);
    updated[index] = {
      ...merged,
      valorJuros: calc.valorJuros,
    };
    onChange(updated);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">
              Reforços (Parcelamentos Anuais / Balões)
            </h3>
            <p className="text-xs text-slate-500">
              Intermediárias com suporte a juros e opção de diluir nas parcelas mensais
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs text-right">
            <span className="text-slate-500 font-medium">
              Total Nominal:{' '}
              <strong className="text-slate-800 text-sm font-semibold">
                {formatBRL(totalReforcosNominal)}
              </strong>
            </span>
            {totalJurosReforcos > 0 && (
              <div className="text-[11px] text-amber-800 font-medium">
                +{formatBRL(totalJurosReforcos)} juros
                {totalJurosDiluidos > 0 && (
                  <span className="ml-1 text-emerald-700">
                    ({formatBRL(totalJurosDiluidos)} nas mensais)
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddReforco}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Adicionar Reforço
          </button>
        </div>
      </div>

      {reforcos.length === 0 ? (
        <div className="py-6 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <p className="text-sm">Nenhum reforço anual cadastrado.</p>
          <button
            type="button"
            onClick={handleAddReforco}
            className="mt-2 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
          >
            + Adicionar Balão / Reforço Anual
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {reforcos.map((ref, idx) => {
            const calculatedJuros = calculateReforcoItem(ref);

            return (
              <div
                key={ref.id || idx}
                className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3 transition-all hover:border-slate-300"
              >
                {/* Top header row */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={ref.title}
                      onChange={(e) =>
                        handleUpdateReforco(idx, { title: e.target.value })
                      }
                      placeholder={`Reforço ${idx + 1}`}
                      className="font-bold text-slate-800 text-sm bg-transparent border-b border-dashed border-slate-300 focus:border-red-500 focus:outline-none px-1 py-0.5"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !ref.temJuros;
                        const calc = calculateReforcoItem({
                          ...ref,
                          temJuros: nextState,
                          taxaJuros: ref.taxaJuros ?? 1.0,
                          mesesJuros: ref.mesesJuros ?? 12,
                        });
                        handleUpdateReforco(idx, {
                          temJuros: nextState,
                          taxaJuros: ref.taxaJuros ?? 1.0,
                          mesesJuros: ref.mesesJuros ?? 12,
                          valorJuros: calc.valorJuros,
                          diluirNasMensais: ref.diluirNasMensais ?? false,
                        });
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                        ref.temJuros
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Cobrar juros neste reforço"
                    >
                      <Percent className="w-3.5 h-3.5" />
                      {ref.temJuros ? 'Juros Ativos' : '+ Juros'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveReforco(idx)}
                      title="Remover reforço"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  {/* Valor Nominal */}
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Valor Nominal (Sem Juros)
                    </label>
                    <CurrencyInput
                      id={`ref_val_${idx}`}
                      value={ref.valor}
                      onChange={(val) => {
                        const calc = calculateReforcoItem({ ...ref, valor: val });
                        handleUpdateReforco(idx, {
                          valor: val,
                          valorJuros: calc.valorJuros,
                        });
                      }}
                      placeholder="0,00"
                    />
                  </div>

                  {/* Vencimento (Data ou Texto Livre) */}
                  <div className="sm:col-span-8">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Vencimento
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateReforco(idx, {
                            tipoVencimento:
                              ref.tipoVencimento === 'texto' ? 'data' : 'texto',
                          })
                        }
                        className="text-[10px] text-red-600 hover:underline font-medium cursor-pointer"
                      >
                        {ref.tipoVencimento === 'texto'
                          ? 'Usar Calendário'
                          : 'Usar Texto Livre'}
                      </button>
                    </div>

                    {ref.tipoVencimento === 'texto' ? (
                      <input
                        type="text"
                        value={
                          ref.textoVencimento !== undefined
                            ? ref.textoVencimento
                            : 'Vencimento na data da assinatura caixa:'
                        }
                        onChange={(e) =>
                          handleUpdateReforco(idx, {
                            textoVencimento: e.target.value,
                          })
                        }
                        placeholder="Ex: Vencimento na data da assinatura caixa:"
                        className="w-full px-3 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                    ) : (
                      <input
                        type="date"
                        value={toInputDateFormat(ref.dataVencimento)}
                        onChange={(e) =>
                          handleUpdateReforco(idx, {
                            dataVencimento: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    )}
                  </div>
                </div>

                {/* Bloco de Juros no Reforço */}
                {ref.temJuros && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2.5 text-xs animate-in fade-in duration-150">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-amber-800 shrink-0" />
                        <span className="font-semibold text-amber-950">
                          Juros sobre este Reforço
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpdateReforco(idx, { temJuros: false })}
                        className="text-[11px] text-amber-800 hover:text-amber-950 underline font-medium cursor-pointer"
                      >
                        Remover juros
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center bg-white p-3 rounded-lg border border-amber-100 shadow-2xs">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
                          Taxa ao mês (% a.m.):
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="20"
                            value={ref.taxaJuros !== undefined ? ref.taxaJuros : 1.0}
                            onChange={(e) => {
                              const taxa = parseFloat(e.target.value) || 0;
                              const calc = calculateReforcoItem({ ...ref, taxaJuros: taxa });
                              handleUpdateReforco(idx, {
                                taxaJuros: taxa,
                                valorJuros: calc.valorJuros,
                              });
                            }}
                            className="w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-300 rounded font-semibold text-xs text-slate-800 focus:ring-1 focus:ring-amber-500 outline-none"
                          />
                          <Percent className="w-3.5 h-3.5 absolute right-2.5 top-2 text-slate-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
                          Prazo (Meses):
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const meses = Math.max(1, (ref.mesesJuros || 12) - 1);
                              const calc = calculateReforcoItem({ ...ref, mesesJuros: meses });
                              handleUpdateReforco(idx, {
                                mesesJuros: meses,
                                valorJuros: calc.valorJuros,
                              });
                            }}
                            className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-bold text-slate-700 cursor-pointer"
                            title="Diminuir 1 mês"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={ref.mesesJuros !== undefined ? ref.mesesJuros : 12}
                            onChange={(e) => {
                              const meses = Math.max(1, parseInt(e.target.value, 10) || 1);
                              const calc = calculateReforcoItem({ ...ref, mesesJuros: meses });
                              handleUpdateReforco(idx, {
                                mesesJuros: meses,
                                valorJuros: calc.valorJuros,
                              });
                            }}
                            className="w-14 px-2 py-1 bg-slate-50 border border-slate-300 rounded font-bold text-xs text-center text-slate-800 focus:ring-1 focus:ring-amber-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const meses = Math.min(120, (ref.mesesJuros || 12) + 1);
                              const calc = calculateReforcoItem({ ...ref, mesesJuros: meses });
                              handleUpdateReforco(idx, {
                                mesesJuros: meses,
                                valorJuros: calc.valorJuros,
                              });
                            }}
                            className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-bold text-slate-700 cursor-pointer"
                            title="Aumentar 1 mês"
                          >
                            +
                          </button>
                          <span className="text-xs text-slate-500 ml-1">meses</span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[11px] text-slate-500 block">Juros gerados:</span>
                        <span className="font-bold text-amber-900 text-sm">
                          +{formatBRL(calculatedJuros.valorJuros)}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Total c/ juros: {formatBRL(calculatedJuros.valorTotalComJuros)}
                        </span>
                      </div>
                    </div>

                    {/* Opção de Diluir nas Parcelas Mensais */}
                    <div className="pt-2 border-t border-amber-200/60 bg-amber-100/50 p-2.5 rounded-lg">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(ref.diluirNasMensais)}
                          onChange={(e) => {
                            handleUpdateReforco(idx, {
                              diluirNasMensais: e.target.checked,
                            });
                          }}
                          className="mt-0.5 rounded border-amber-400 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-amber-950 block">
                            Diluir juros nas parcelas mensais
                          </span>
                          <span className="text-slate-600 text-[11px] block mt-0.5">
                            {ref.diluirNasMensais
                              ? `✅ Os juros de ${formatBRL(calculatedJuros.valorJuros)} serão diluídos nas parcelas mensais. Este reforço permanece em ${formatBRL(ref.valor)} no vencimento.`
                              : `💰 Os juros de ${formatBRL(calculatedJuros.valorJuros)} serão somados a este reforço. Valor a pagar no vencimento: ${formatBRL(calculatedJuros.valorTotalComJuros)}.`}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
