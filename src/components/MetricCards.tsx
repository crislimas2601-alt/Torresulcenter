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
      {/* 1. Indicadores Principais (Primary KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Recebimentos previstos */}
        <div 
          id="card-metric-pending"
          className={`bg-white rounded-lg p-4 sm:p-5 border transition-all ${
            showPendingBreakdown 
              ? 'border-red-600 ring-1 ring-red-600/10 shadow-xs' 
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Recebimentos previstos
            </span>
            <div className="w-8 h-8 rounded-md bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-heading tabular-nums">
              {formatCurrency(stats.totalPendingFuture)}
            </div>
            <div className="mt-2 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                id="btn-toggle-pending-breakdown"
                type="button"
                onClick={() => setShowPendingBreakdown(!showPendingBreakdown)}
                className="font-medium text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{showPendingBreakdown ? 'Ocultar cronograma' : 'Ver por mês'}</span>
                {showPendingBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <span className="text-slate-400">
                {upcomingInflows.length} meses futuros
              </span>
            </div>
          </div>
        </div>

        {/* Recebido */}
        <div 
          id="card-metric-received"
          onClick={onFilterReceived}
          className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Recebido
            </span>
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-heading tabular-nums">
              {formatCurrency(stats.totalReceivedAllTime)}
            </div>
            <div className="mt-2 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Liquidado
              </span>
              <span className="text-slate-400">{stats.completedContractsCount} contrato(s) quitados</span>
            </div>
          </div>
        </div>

        {/* VGV intermediado */}
        <div 
          id="card-metric-vgv"
          className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 hover:border-slate-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              VGV intermediado
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <Building2 className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-heading tabular-nums">
              {formatCurrency(stats.totalVGV)}
            </div>
            <div className="mt-2 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-700">{stats.totalContractsCount} contrato(s) no total</span>
              <span className="text-slate-400">Volume de vendas</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Indicadores Complementares de Gestão (Secondary KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        
        {/* Média mensal */}
        <div 
          id="card-metric-avg"
          className="bg-slate-50/80 rounded-lg p-3.5 sm:p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-white text-slate-600 flex items-center justify-center border border-slate-200 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                Média mensal
              </span>
              <div className="text-xl font-bold text-slate-900 font-heading tabular-nums mt-0.5">
                {formatCurrency(dynamicMonthlyAverage)}
              </div>
            </div>
          </div>

          {/* Interactive Selector: 3 meses, 6 meses, 12 meses */}
          <div className="flex items-center gap-2 self-start sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-[11px] text-slate-500 font-medium">Janela:</span>
            <div className="inline-flex bg-white p-0.5 rounded-md border border-slate-200">
              <button
                id="btn-avg-3m"
                type="button"
                onClick={() => setAverageMonthsCount(3)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                  averageMonthsCount === 3
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3 meses
              </button>
              <button
                id="btn-avg-6m"
                type="button"
                onClick={() => setAverageMonthsCount(6)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                  averageMonthsCount === 6
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                6 meses
              </button>
              <button
                id="btn-avg-12m"
                type="button"
                onClick={() => setAverageMonthsCount(12)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                  averageMonthsCount === 12
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                12 meses
              </button>
            </div>
          </div>
        </div>

        {/* Bônus e prêmios */}
        <div 
          id="card-metric-bonuses"
          className="bg-slate-50/80 rounded-lg p-3.5 sm:p-4 border border-slate-200 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-white text-slate-600 flex items-center justify-center border border-slate-200 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                Bônus e prêmios
              </span>
              <div className="text-xl font-bold text-slate-900 font-heading tabular-nums mt-0.5">
                {formatCurrency(stats.totalBonusesAllTime)}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-medium text-slate-600 block">Campanhas extras</span>
            <span className="text-[11px] text-slate-400">Premiações de construtoras</span>
          </div>
        </div>

      </div>

      {/* Cronograma Interativo Mês a Mês */}
      {showPendingBreakdown && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Cronograma de recebimentos previstos
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Selecione um mês para filtrar parcelas específicas
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-3">
            {upcomingInflows.map((m) => (
              <div 
                key={m.monthKey}
                onClick={() => onSelectMonth?.(m.monthKey)}
                className="p-3 rounded-md border border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">
                    {m.fullLabel.split(' de ')[0]}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {m.monthKey.slice(2, 4)}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1 font-heading tabular-nums">
                  {formatCurrency(m.projectedAmount)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
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
