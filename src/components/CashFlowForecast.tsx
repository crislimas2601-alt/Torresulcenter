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
  Sparkles,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
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
    // Fire celebratory confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10B981', '#3B82F6', '#F59E0B'],
    });
    onToggleInstallmentStatus(dealId, installmentId);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl text-xs border border-slate-700 min-w-[180px]">
          <div className="font-bold text-sm text-slate-100 mb-2 pb-1 border-b border-slate-800 flex items-center justify-between">
            <span>{label}</span>
            {data.isCurrent && (
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Mês Atual</span>
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-blue-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                A Receber:
              </span>
              <span className="font-semibold">{formatCurrency(data.previsto)}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Já Recebido:
              </span>
              <span className="font-semibold">{formatCurrency(data.recebido)}</span>
            </div>
            {data.bonus > 0 && (
              <div className="flex justify-between items-center text-amber-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  Deste mês em Bônus:
                </span>
                <span className="font-semibold">{formatCurrency(data.bonus)}</span>
              </div>
            )}
            <div className="pt-1.5 mt-1 border-t border-slate-800 flex justify-between items-center font-bold text-slate-200">
              <span>Volume Total:</span>
              <span>{formatCurrency(data.total)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
              Previsão de Fluxo de Caixa (Entradas Futuras)
            </h2>
            <span className="hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100">
              Próximos Meses
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Visualize o montante previsto a receber em cada mês conforme as vendas e parcelas acordadas
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start sm:self-auto text-xs font-medium text-slate-600">
          <button
            id="tab-chart-view"
            onClick={() => setActiveTab('grafico')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'grafico'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Gráfico Mensal
          </button>
          <button
            id="tab-breakdown-view"
            onClick={() => setActiveTab('meses')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'meses'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Detalhamento por Mês
          </button>
        </div>
      </div>

      {/* Selected Month Filter Banner */}
      {selectedMonthFilter && (
        <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex items-center justify-between text-xs text-blue-800">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>
              Filtrando parcelas do mês: <strong>{forecast.find(f => f.monthKey === selectedMonthFilter)?.fullLabel || selectedMonthFilter}</strong>
            </span>
          </div>
          <button
            onClick={() => onSelectMonthFilter?.(null)}
            className="text-blue-700 hover:text-blue-900 underline font-semibold cursor-pointer"
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
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-xs font-semibold text-slate-700 capitalize">
                        {value === 'previsto' ? 'A Receber (Previsão)' : value === 'recebido' ? 'Já Recebido' : 'Bônus'}
                      </span>
                    )}
                  />
                  <Bar 
                    dataKey="previsto" 
                    name="previsto" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={44} 
                  />
                  <Bar 
                    dataKey="recebido" 
                    name="recebido" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={44} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Azul: Entrada prevista para o mês</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Verde: Comissões já creditadas</span>
                </div>
              </div>
              <span className="text-slate-400 italic">
                *Clique em uma barra para filtrar as parcelas do mês
              </span>
            </div>
          </div>
        ) : (
          /* Detailed Month-by-Month Spreadsheet-like List (Planilha Executiva Limpa) */
          <div className="space-y-6">
            {forecast.filter(m => m.installments.length > 0 || m.isCurrentMonth).map((month) => {
              const isSelected = selectedMonthFilter === month.monthKey;
              return (
                <div
                  key={month.monthKey}
                  className={`rounded-xl border overflow-hidden transition-all ${
                    isSelected
                      ? 'border-red-500 ring-2 ring-red-100 bg-white shadow-xs'
                      : month.isCurrentMonth
                      ? 'border-slate-300 bg-white shadow-xs'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* Month Header Row */}
                  <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${month.isCurrentMonth ? 'bg-red-600 animate-pulse' : 'bg-slate-400'}`} />
                      <h3 className="font-bold text-slate-900 text-sm font-heading">
                        {month.fullLabel}
                      </h3>
                      {month.isCurrentMonth && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                          Mês Atual
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 font-medium">A Receber: </span>
                        <strong className="text-slate-900 font-semibold">{formatCurrency(month.projectedAmount)}</strong>
                      </div>
                      {month.receivedAmount > 0 && (
                        <div className="border-l border-slate-200 pl-3">
                          <span className="text-slate-500 font-medium">Já Recebido: </span>
                          <strong className="text-emerald-700 font-semibold">{formatCurrency(month.receivedAmount)}</strong>
                        </div>
                      )}
                      <button
                        onClick={() => onSelectMonthFilter?.(isSelected ? null : month.monthKey)}
                        className={`text-xs px-2 py-1 rounded transition cursor-pointer font-medium ${
                          isSelected ? 'bg-red-50 text-red-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                      >
                        {isSelected ? 'Limpar Filtro' : 'Filtrar'}
                      </button>
                    </div>
                  </div>

                  {/* Spreadsheet table rows */}
                  {month.installments.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 italic">
                      Nenhuma comissão agendada para este mês
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-500 bg-white uppercase tracking-wider">
                            <th className="py-2.5 px-4">Data Vencimento</th>
                            <th className="py-2.5 px-4">Imóvel / Contrato</th>
                            <th className="py-2.5 px-4">Parcela</th>
                            <th className="py-2.5 px-4 text-right">Valor da Parcela</th>
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
                                <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-700">
                                  {formatDateBR(inst.dueDate)}
                                </td>
                                <td className="py-3 px-4 font-semibold text-slate-900">
                                  <div className="flex items-center gap-1.5">
                                    <span className="truncate max-w-xs">{inst.dealTitle}</span>
                                    {inst.isBonus && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                                        BÔNUS
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-slate-600">
                                  {inst.title}
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap font-heading text-sm">
                                  {formatCurrency(inst.amount)}
                                </td>
                                <td className="py-3 px-4 text-center whitespace-nowrap">
                                  {isPaid ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      Recebido
                                      {inst.receivedDate && <span className="text-[10px] text-emerald-600/70">({formatDateBR(inst.receivedDate)})</span>}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                      <Clock className="w-3 h-3 text-blue-600" />
                                      Previsto
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right whitespace-nowrap">
                                  <button
                                    id={`btn-spreadsheet-toggle-${inst.id}`}
                                    onClick={() => handleMarkAsReceived(inst.dealId, inst.id)}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                      isPaid
                                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                    }`}
                                  >
                                    {isPaid ? 'Desmarcar' : 'Confirmar Recebimento'}
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
