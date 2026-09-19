import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { MonthlyForecastItem, Installment } from '../types';
import { formatCurrency, formatCurrencyCompact, formatDateBR } from '../utils/formatters';

interface CashFlowForecastProps {
  forecast: MonthlyForecastItem[];
  onToggleInstallmentStatus: (dealId: string, installmentId: string) => void;
  onSelectMonthFilter?: (monthKey: string | null) => void;
  selectedMonthFilter?: string | null;
}

export const CashFlowForecast: React.FC<CashFlowForecastProps> = ({
  forecast,
  onToggleInstallmentStatus,
  onSelectMonthFilter,
  selectedMonthFilter,
}) => {
  const [activeTab, setActiveTab] = useState<'grafico' | 'meses'>('grafico');

  // Chart data format
  const chartData = forecast.map((item) => ({
    name: item.label,
    monthKey: item.monthKey,
    previsto: item.projectedAmount,
    recebido: item.receivedAmount,
    bonus: item.bonusAmount,
    total: item.totalVolume,
    isCurrent: item.isCurrentMonth,
  }));

  const handleMarkAsReceived = (dealId: string, installmentId: string) => {
    onToggleInstallmentStatus(dealId, installmentId);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-lg shadow-xl text-xs border border-slate-800 min-w-[200px]">
          <div className="font-semibold text-xs text-slate-200 mb-2 pb-1.5 border-b border-slate-800 flex items-center justify-between">
            <span>{label}</span>
            {data.isCurrent && (
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">Mês atual</span>
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-blue-600 inline-block" />
                Recebimentos previstos:
              </span>
              <span className="font-semibold text-white tabular-nums">{formatCurrency(data.previsto)}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-emerald-600 inline-block" />
                Recebido:
              </span>
              <span className="font-semibold tabular-nums">{formatCurrency(data.recebido)}</span>
            </div>
            {data.bonus > 0 && (
              <div className="flex justify-between items-center text-amber-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-amber-500 inline-block" />
                  Bônus no mês:
                </span>
                <span className="font-semibold tabular-nums">{formatCurrency(data.bonus)}</span>
              </div>
            )}
            <div className="pt-2 mt-1.5 border-t border-slate-800 flex justify-between items-center font-bold text-slate-100">
              <span>Volume total:</span>
              <span className="tabular-nums">{formatCurrency(data.total)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
            Previsão de fluxo de caixa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Projeção mensal de recebimentos e histórico consolidado por vencimento
          </p>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-md self-start sm:self-auto text-xs font-medium text-slate-600 border border-slate-200/80">
          <button
            id="tab-chart-view"
            onClick={() => setActiveTab('grafico')}
            className={`px-3 py-1.5 rounded text-xs transition cursor-pointer ${
              activeTab === 'grafico'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gráfico mensal
          </button>
          <button
            id="tab-breakdown-view"
            onClick={() => setActiveTab('meses')}
            className={`px-3 py-1.5 rounded text-xs transition cursor-pointer ${
              activeTab === 'meses'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Detalhamento por mês
          </button>
        </div>
      </div>

      {/* Selected Month Filter Banner */}
      {selectedMonthFilter && (
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>
              Filtrando parcelas de: <strong>{forecast.find(f => f.monthKey === selectedMonthFilter)?.fullLabel || selectedMonthFilter}</strong>
            </span>
          </div>
          <button
            onClick={() => onSelectMonthFilter?.(null)}
            className="text-red-600 hover:text-red-700 font-medium cursor-pointer"
          >
            Remover filtro
          </button>
        </div>
      )}

      {/* View Content */}
      <div className="p-4 sm:p-6">
        {activeTab === 'grafico' ? (
          <div>
            <div className="h-[280px] sm:h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload[0]) {
                      const clickedMonthKey = e.activePayload[0].payload.monthKey;
                      onSelectMonthFilter?.(selectedMonthFilter === clickedMonthKey ? null : clickedMonthKey);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={formatCurrencyCompact}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="rect"
                    iconSize={10}
                    formatter={(value) => (
                      <span className="text-xs font-medium text-slate-700 capitalize">
                        {value === 'previsto' ? 'Recebimentos previstos' : value === 'recebido' ? 'Recebido' : 'Bônus'}
                      </span>
                    )}
                  />
                  <Bar 
                    dataKey="previsto" 
                    name="previsto" 
                    fill="#2563eb" 
                    radius={[2, 2, 0, 0]} 
                    maxBarSize={40} 
                  />
                  <Bar 
                    dataKey="recebido" 
                    name="recebido" 
                    fill="#059669" 
                    radius={[2, 2, 0, 0]} 
                    maxBarSize={40} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
                  <span>Azul: Entrada prevista para o mês</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
                  <span>Verde: Comissões já creditadas</span>
                </div>
              </div>
              <span className="text-slate-400">
                Dica: clique em uma barra para filtrar as parcelas do mês
              </span>
            </div>
          </div>
        ) : (
          /* Detailed Month-by-Month Spreadsheet-like List (Planilha Executiva Limpa) */
          <div className="space-y-4">
            {forecast.filter(m => m.installments.length > 0 || m.isCurrentMonth).map((month) => {
              const isSelected = selectedMonthFilter === month.monthKey;
              return (
                <div
                  key={month.monthKey}
                  className={`rounded-lg border overflow-hidden transition-all ${
                    isSelected
                      ? 'border-red-500 ring-1 ring-red-500/20 bg-white'
                      : month.isCurrentMonth
                      ? 'border-slate-300 bg-white'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* Month Header Row */}
                  <div className="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${month.isCurrentMonth ? 'bg-red-600' : 'bg-slate-400'}`} />
                      <h3 className="font-bold text-slate-900 text-sm font-heading">
                        {month.fullLabel}
                      </h3>
                      {month.isCurrentMonth && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                          Mês atual
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 font-medium">Previsão: </span>
                        <strong className="text-slate-900 font-semibold tabular-nums">{formatCurrency(month.projectedAmount)}</strong>
                      </div>
                      {month.receivedAmount > 0 && (
                        <div className="border-l border-slate-200 pl-3">
                          <span className="text-slate-500 font-medium">Recebido: </span>
                          <strong className="text-emerald-700 font-semibold tabular-nums">{formatCurrency(month.receivedAmount)}</strong>
                        </div>
                      )}
                      <button
                        onClick={() => onSelectMonthFilter?.(isSelected ? null : month.monthKey)}
                        className={`text-xs px-2.5 py-1 rounded transition cursor-pointer font-medium ${
                          isSelected ? 'bg-red-50 text-red-700 border border-red-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        {isSelected ? 'Limpar filtro' : 'Filtrar'}
                      </button>
                    </div>
                  </div>

                  {/* Spreadsheet table rows */}
                  {month.installments.length === 0 ? (
                    <div className="py-5 text-center text-xs text-slate-400">
                      Nenhuma parcela prevista para este mês
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-500 bg-white uppercase tracking-wider">
                            <th className="py-2.5 px-4">Vencimento</th>
                            <th className="py-2.5 px-4">Imóvel / Contrato</th>
                            <th className="py-2.5 px-4">Parcela</th>
                            <th className="py-2.5 px-4 text-right">Valor</th>
                            <th className="py-2.5 px-4 text-center">Status</th>
                            <th className="py-2.5 px-4 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {month.installments.map((inst) => {
                            const isPaid = inst.status === 'recebido';
                            return (
                              <tr 
                                key={inst.id}
                                className={`hover:bg-slate-50/70 transition-colors ${
                                  isPaid ? 'bg-emerald-50/20' : ''
                                }`}
                              >
                                <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-700 tabular-nums">
                                  {formatDateBR(inst.dueDate)}
                                </td>
                                <td className="py-3 px-4 font-semibold text-slate-900">
                                  <div className="flex items-center gap-1.5">
                                    <span className="truncate max-w-xs">{inst.dealTitle}</span>
                                    {inst.isBonus && (
                                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                                        BÔNUS
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-slate-600">
                                  {inst.title}
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap font-heading text-sm tabular-nums">
                                  {formatCurrency(inst.amount)}
                                </td>
                                <td className="py-3 px-4 text-center whitespace-nowrap">
                                  {isPaid ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      Recebido
                                      {inst.receivedDate && <span className="text-[10px] text-emerald-600/70">({formatDateBR(inst.receivedDate)})</span>}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                      <Clock className="w-3 h-3 text-slate-500" />
                                      Previsto
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right whitespace-nowrap">
                                  <button
                                    id={`btn-spreadsheet-toggle-${inst.id}`}
                                    onClick={() => handleMarkAsReceived(inst.dealId, inst.id)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                                      isPaid
                                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    }`}
                                  >
                                    {isPaid ? 'Desmarcar' : 'Confirmar recebimento'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
