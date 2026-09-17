import React, { useState } from 'react';
import { 
  TrendingUp, 
  CalendarClock, 
  Wallet, 
  Award, 
  Building2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { FinancialStats, MonthlyForecastItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface MetricCardsProps {
  stats: FinancialStats;
  monthlyForecast: MonthlyForecastItem[];
  onFilterPending?: () => void;
  onFilterReceived?: () => void;
  onSelectMonth?: (monthKey: string) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ 
  stats,
  monthlyForecast,
  onFilterPending,
  onFilterReceived,
  onSelectMonth
}) => {
  // State for interactive breakdown of "A Receber"
  const [showPendingBreakdown, setShowPendingBreakdown] = useState(false);
  
  // State for interactive period of "Média Mensal" (3, 6, or 12 months)
  const [averageMonthsCount, setAverageMonthsCount] = useState<3 | 6 | 12>(3);

  // Filter future months (starting from current active month)
  const currentMonth = monthlyForecast.find(m => m.isCurrentMonth)?.monthKey || new Date().toISOString().slice(0, 7);
  const futureMonths = monthlyForecast.filter(m => m.monthKey >= currentMonth);

  // Calculate dynamic average based on selected months (3, 6, 12)
  const selectedWindowMonths = futureMonths.slice(0, averageMonthsCount);
  const sumForWindow = selectedWindowMonths.reduce((sum, m) => sum + m.projectedAmount, 0);
  const dynamicMonthlyAverage = averageMonthsCount > 0 ? sumForWindow / averageMonthsCount : 0;

  // Next months with projected amount > 0 for quick breakdown
  const upcomingInflows = futureMonths.filter(m => m.projectedAmount > 0).slice(0, 6);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* 1. A Receber nos Próximos Meses (Interativo: Abre detalhamento de meses) */}
        <div 
          id="card-metric-pending"
          className={`bg-white rounded-xl p-4 sm:p-5 border transition-all relative group ${
            showPendingBreakdown 
              ? 'border-red-600 ring-1 ring-red-600/20 shadow-sm' 
              : 'border-zinc-200 shadow-xs hover:border-red-600'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider group-hover:text-red-600 transition-colors">
              A Receber (Previsão)
            </span>
            <div className="w-8 h-8 rounded-lg bg-white text-zinc-400 flex items-center justify-center border border-zinc-200 group-hover:border-red-600 group-hover:text-red-600 transition-colors">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>

          <div className="text-2xl font-extrabold text-zinc-900 tracking-tight font-heading">
            {formatCurrency(stats.totalPendingFuture)}
          </div>

          {/* Interactive Trigger Button */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              id="btn-toggle-pending-breakdown"
              type="button"
              onClick={() => setShowPendingBreakdown(!showPendingBreakdown)}
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer transition"
            >
              <span>{showPendingBreakdown ? 'Ocultar meses' : 'Ver por mês'}</span>
              {showPendingBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[11px] text-slate-400">
              {upcomingInflows.length} meses previstos
            </span>
          </div>
        </div>

        {/* 2. Média Mensal Prevista (Interativo: 3, 6, ou 12 meses) */}
        <div 
          id="card-metric-avg"
          className="bg-white rounded-xl p-4 sm:p-5 border border-zinc-200 shadow-xs hover:border-red-600 transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider group-hover:text-red-600 transition-colors">
                Média Mensal
              </span>
              <div className="w-8 h-8 rounded-lg bg-white text-zinc-400 flex items-center justify-center border border-zinc-200 group-hover:border-red-600 group-hover:text-red-600 transition-colors">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="text-2xl font-extrabold text-zinc-900 tracking-tight font-heading">
              {formatCurrency(dynamicMonthlyAverage)}
            </div>
          </div>

          {/* Interactive Selector: 3 meses, 6 meses, 12 meses */}
          <div className="mt-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between gap-1 text-[11px]">
              <span className="text-slate-400 font-medium">Janela:</span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  id="btn-avg-3m"
                  type="button"
                  onClick={() => setAverageMonthsCount(3)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                    averageMonthsCount === 3
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Média dos próximos 3 meses"
                >
                  3m
                </button>
                <button
                  id="btn-avg-6m"
                  type="button"
                  onClick={() => setAverageMonthsCount(6)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                    averageMonthsCount === 6
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Média dos próximos 6 meses"
                >
                  6m
                </button>
                <button
                  id="btn-avg-12m"
                  type="button"
                  onClick={() => setAverageMonthsCount(12)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                    averageMonthsCount === 12
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Média dos próximos 12 meses"
                >
                  12m
                </button>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Próximos {averageMonthsCount} meses ({formatCurrency(sumForWindow)} total)
            </p>
          </div>
        </div>

        {/* 3. Já Recebido (Histórico) */}
        <div 
          id="card-metric-received"
          onClick={onFilterReceived}
          className="bg-white rounded-xl p-4 sm:p-5 border border-zinc-200 shadow-xs hover:border-red-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider group-hover:text-red-600 transition-colors">
              Total Já Recebido
            </span>
            <div className="w-8 h-8 rounded-lg bg-white text-zinc-400 flex items-center justify-center border border-zinc-200 group-hover:border-red-600 group-hover:text-red-600 transition-colors">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 tracking-tight font-heading">
            {formatCurrency(stats.totalReceivedAllTime)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Liquidado
            </span>
            <span className="text-[11px] text-slate-400">{stats.completedContractsCount} quitados</span>
          </div>
        </div>

        {/* 4. Bônus & Premiações */}
        <div 
          id="card-metric-bonuses"
          className="bg-white rounded-xl p-4 sm:p-5 border border-zinc-200 shadow-xs hover:border-red-600 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider group-hover:text-red-600 transition-colors">
              Bônus & Prêmios
            </span>
            <div className="w-8 h-8 rounded-lg bg-white text-zinc-400 flex items-center justify-center border border-zinc-200 group-hover:border-red-600 group-hover:text-red-600 transition-colors">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 tracking-tight font-heading">
            {formatCurrency(stats.totalBonusesAllTime)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px] text-slate-500">Campanhas extras</span>
            <span className="text-[11px] font-semibold text-amber-700">Premiações</span>
          </div>
        </div>

        {/* 5. VGV Intermediado */}
        <div 
          id="card-metric-vgv"
          className="bg-white rounded-xl p-4 sm:p-5 border border-zinc-200 shadow-xs hover:border-red-600 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider group-hover:text-red-600 transition-colors">
              VGV Intermediado
            </span>
            <div className="w-8 h-8 rounded-lg bg-white text-zinc-400 flex items-center justify-center border border-zinc-200 group-hover:border-red-600 group-hover:text-red-600 transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 tracking-tight font-heading">
            {formatCurrency(stats.totalVGV)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{stats.totalContractsCount} contrato(s)</span>
            <span className="text-[11px] text-slate-400">Total</span>
          </div>
        </div>

      </div>

      {/* Interactive Month-by-Month Drawer for "A Receber" */}
      {showPendingBreakdown && (
        <div className="bg-white rounded-xl border border-red-200/80 p-4 sm:p-5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Cronograma de Entradas Previstas (Mês a Mês)
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Clique em um mês para filtrar ou consultar parcelas específicas
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-3">
            {upcomingInflows.map((m) => (
              <div 
                key={m.monthKey}
                onClick={() => onSelectMonth?.(m.monthKey)}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-red-50/30 hover:border-red-300 transition cursor-pointer text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-red-700">
                    {m.fullLabel.split(' de ')[0]}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {m.monthKey.slice(2, 4)}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1 font-heading group-hover:text-red-600">
                  {formatCurrency(m.projectedAmount)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {m.installments.filter(i => i.status !== 'recebido').length} parcela(s)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
