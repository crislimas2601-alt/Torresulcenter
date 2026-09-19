import React from 'react';
import { Award, CheckCircle2, Clock, Plus, Gift } from 'lucide-react';
import { ContractDeal, Installment } from '../types';
import { formatCurrency, formatDateBR } from '../utils/formatters';

interface BonusTrackerProps {
  deals: ContractDeal[];
  onToggleInstallmentStatus: (dealId: string, installmentId: string) => void;
}

export const BonusTracker: React.FC<BonusTrackerProps> = ({
  deals,
  onToggleInstallmentStatus,
}) => {
  // Extract all bonus installments across all active deals
  const bonusItems: {
    deal: ContractDeal;
    installment: Installment;
  }[] = [];

  deals.forEach((deal) => {
    if (deal.status !== 'distrato') {
      deal.installments.forEach((inst) => {
        if (inst.isBonus || (deal.bonusAmount > 0 && inst.title.toLowerCase().includes('bônus'))) {
          bonusItems.push({ deal, installment: inst });
        }
      });
    }
  });

  const totalBonuses = bonusItems.reduce((acc, item) => acc + item.installment.amount, 0);
  const receivedBonuses = bonusItems
    .filter((item) => item.installment.status === 'recebido')
    .reduce((acc, item) => acc + item.installment.amount, 0);
  const pendingBonuses = totalBonuses - receivedBonuses;

  if (bonusItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/50">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Bônus & Premiações de Venda
              </h3>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {bonusItems.length} prêmio(s)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Premiações de construtoras, campanhas e superação de metas comerciais
            </p>
          </div>
        </div>

        {/* Quick summary numbers */}
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">A Receber em Bônus:</span>
            <span className="font-bold text-slate-900 text-sm font-heading">
              {formatCurrency(pendingBonuses)}
            </span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-[11px] text-slate-500 block font-medium">Já Creditado:</span>
            <span className="font-bold text-emerald-600 text-sm font-heading">
              {formatCurrency(receivedBonuses)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {bonusItems.map(({ deal, installment }) => {
            const isReceived = installment.status === 'recebido';
            return (
              <div
                key={installment.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isReceived
                    ? 'bg-emerald-50/30 border-emerald-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block truncate">
                      {deal.propertyTitle}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5 truncate font-heading">
                      {installment.title}
                    </h4>
                  </div>
                  <button
                    id={`btn-bonus-toggle-${installment.id}`}
                    onClick={() => onToggleInstallmentStatus(deal.id, installment.id)}
                    title={isReceived ? 'Marcar como pendente' : 'Marcar como bônus recebido'}
                    className={`p-1.5 rounded-lg cursor-pointer transition-colors shrink-0 ${
                      isReceived
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-400 hover:text-emerald-600 border border-slate-200 shadow-xs'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-base font-bold text-slate-900 font-heading">
                    {formatCurrency(installment.amount)}
                  </span>
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                    isReceived 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {isReceived ? 'Recebido' : 'Previsto: ' + formatDateBR(installment.dueDate)}
                  </span>
                </div>

                {deal.bonusDescription && (
                  <p className="mt-2.5 text-xs text-slate-500 italic truncate border-t border-slate-100 pt-2">
                    "{deal.bonusDescription}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
