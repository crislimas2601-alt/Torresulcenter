import React from 'react';
import { ReforcoItem } from '../types';
import { CurrencyInput } from './CurrencyInput';
import { formatBRL, toInputDateFormat } from '../utils/formatter';
import { Plus, Trash2, Calendar, TrendingUp } from 'lucide-react';

interface ReforcosSectionProps {
  reforcos: ReforcoItem[];
  onChange: (items: ReforcoItem[]) => void;
}

export const ReforcosSection: React.FC<ReforcosSectionProps> = ({
  reforcos,
  onChange,
}) => {
  const totalReforcos = (reforcos || []).reduce((acc, cur) => acc + (cur.valor || 0), 0);

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
    };
    onChange([...reforcos, newItem]);
  };

  const handleRemoveReforco = (index: number) => {
    const updated = reforcos.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateReforco = (index: number, updates: Partial<ReforcoItem>) => {
    const updated = [...reforcos];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">
              Reforços (Parcelamentos Anuais / Balões)
            </h3>
            <p className="text-xs text-slate-500">
              Intermediárias anuais, semestrais ou balão na data da assinatura Caixa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">
            Total:{' '}
            <strong className="text-slate-800 text-sm font-semibold">
              {formatBRL(totalReforcos)}
            </strong>
          </span>
          <button
            type="button"
            onClick={handleAddReforco}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 cursor-pointer"
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
          {reforcos.map((ref, idx) => (
            <div
              key={ref.id || idx}
              className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                {/* Reforço Name */}
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Identificação
                  </label>
                  <input
                    type="text"
                    value={ref.title}
                    onChange={(e) =>
                      handleUpdateReforco(idx, { title: e.target.value })
                    }
                    placeholder={`Reforço ${idx + 1}`}
                    className="w-full px-3 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                {/* Valor */}
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Valor Nominal
                  </label>
                  <CurrencyInput
                    id={`ref_val_${idx}`}
                    value={ref.valor}
                    onChange={(val) => handleUpdateReforco(idx, { valor: val })}
                    placeholder="0,00"
                  />
                </div>

                {/* Vencimento (Data ou Texto Livre como 'Vencimento na data da assinatura caixa') */}
                <div className="sm:col-span-5">
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

                {/* Trash Button */}
                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveReforco(idx)}
                    title="Remover reforço"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors mt-4 sm:mt-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
