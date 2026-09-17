import React, { useState } from 'react';
import { SimulationResult, LoanInput, ExtraAmortizationInput } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Layers } from 'lucide-react';

interface InstallmentEliminationVisualizerProps {
  loan: LoanInput;
  extra: ExtraAmortizationInput;
  result: SimulationResult;
}

export const InstallmentEliminationVisualizer: React.FC<InstallmentEliminationVisualizerProps> = ({
  loan,
  extra,
  result,
}) => {
  const [hoveredInstallment, setHoveredInstallment] = useState<number | null>(null);

  const totalInstallments = loan.termMonths || 360;
  const eliminatedCount = result.withAmortization.installmentsEliminatedCount;
  const remainingCount = Math.max(0, totalInstallments - eliminatedCount);

  // Group installments into yearly blocks for clear visual rendering
  const totalYears = Math.ceil(totalInstallments / 12);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-xs p-5 sm:p-6 text-zinc-900 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-900">
              5. Visualizador de Cancelamento de Parcelas
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
              Corte do Final para o Início
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Cada bloco representa 1 mês do contrato. Os blocos vermelhos foram totalmente eliminados pela amortização.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-zinc-800 inline-block" />
            <span className="text-zinc-600 font-medium">{remainingCount} Parcelas Pagas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-600 inline-block" />
            <span className="text-red-700 font-bold">{eliminatedCount} Canceladas</span>
          </div>
        </div>
      </div>

      {/* Grid of Installment Blocks */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1 p-3 bg-zinc-50 rounded-xl border border-zinc-200 max-h-72 overflow-y-auto">
          {Array.from({ length: totalInstallments }).map((_, index) => {
            const installmentNum = index + 1;
            const isEliminated = installmentNum > remainingCount;
            const isHovered = hoveredInstallment === installmentNum;

            return (
              <button
                key={installmentNum}
                type="button"
                onMouseEnter={() => setHoveredInstallment(installmentNum)}
                onMouseLeave={() => setHoveredInstallment(null)}
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-xs text-[8px] font-mono flex items-center justify-center transition-all cursor-pointer ${
                  isEliminated
                    ? 'bg-red-600 text-white font-bold hover:bg-red-700 hover:scale-110 shadow-2xs'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-950'
                } ${isHovered ? 'ring-2 ring-zinc-900 z-10' : ''}`}
                title={`Parcela ${installmentNum} (${isEliminated ? 'ELIMINADA' : 'Paga'})`}
              >
                {installmentNum % 12 === 0 ? Math.ceil(installmentNum / 12) : ''}
              </button>
            );
          })}
        </div>

        {/* Info on hovered or summary */}
        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
          <span>
            {hoveredInstallment ? (
              <span className="font-semibold text-zinc-800">
                Parcela nº {hoveredInstallment} (Ano {Math.ceil(hoveredInstallment / 12)}):{' '}
                {hoveredInstallment > remainingCount ? (
                  <span className="text-red-600 font-bold">CANCELADA SEM JUROS</span>
                ) : (
                  <span className="text-zinc-700">Mantida no cronograma</span>
                )}
              </span>
            ) : (
              <span>Passe o cursor sobre os blocos para inspecionar cada mês</span>
            )}
          </span>
          <span className="text-[11px] text-zinc-400">
            Total contratado: {totalInstallments} meses ({totalYears} anos)
          </span>
        </div>
      </div>
    </div>
  );
};
