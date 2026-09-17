import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Edit, 
  Trash2, 
  Phone, 
  Building, 
  Award,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { ContractDeal, Installment, PropertyType } from '../types';
import { formatCurrency, formatDateBR, getPropertyTypeLabel } from '../utils/formatters';

interface ContractsListProps {
  deals: ContractDeal[];
  onEditDeal: (deal: ContractDeal) => void;
  onDeleteDeal: (dealId: string) => void;
  onToggleInstallmentStatus: (dealId: string, installmentId: string) => void;
  onOpenNewDeal: () => void;
}

export const ContractsList: React.FC<ContractsListProps> = ({
  deals,
  onEditDeal,
  onDeleteDeal,
  onToggleInstallmentStatus,
  onOpenNewDeal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'em_andamento' | 'concluido'>('todos');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [expandedDealIds, setExpandedDealIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (dealId: string) => {
    setExpandedDealIds((prev) => ({
      ...prev,
      [dealId]: !prev[dealId],
    }));
  };

  // Filter deals
  const filteredDeals = deals.filter((deal) => {
    // Search query
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      deal.propertyTitle.toLowerCase().includes(searchLower) ||
      deal.clientName.toLowerCase().includes(searchLower) ||
      (deal.developerOrAgency && deal.developerOrAgency.toLowerCase().includes(searchLower)) ||
      (deal.notes && deal.notes.toLowerCase().includes(searchLower));

    // Status filter
    const matchStatus = statusFilter === 'todos' || deal.status === statusFilter;

    // Type filter
    const matchType = typeFilter === 'todos' || deal.propertyType === typeFilter;

    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* List Header & Filters */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                Contratos Fechados & Comissões
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                {filteredDeals.length} {filteredDeals.length === 1 ? 'venda' : 'vendas'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Gerencie cada negócio fechado, repasses da imobiliária e status de cada parcela
            </p>
          </div>

          {/* Quick status tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
            <button
              id="filter-status-todos"
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                statusFilter === 'todos'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Todos ({deals.length})
            </button>
            <button
              id="filter-status-andamento"
              onClick={() => setStatusFilter('em_andamento')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                statusFilter === 'em_andamento'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Em Andamento ({deals.filter(d => d.status === 'em_andamento').length})
            </button>
            <button
              id="filter-status-concluido"
              onClick={() => setStatusFilter('concluido')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                statusFilter === 'concluido'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Concluídos ({deals.filter(d => d.status === 'concluido').length})
            </button>
          </div>
        </div>

        {/* Search & Property Type Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por imóvel, cliente, construtora..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="todos">Todos os tipos de imóvel</option>
              <option value="apartamento">Apartamentos</option>
              <option value="casa">Casas / Sobrados</option>
              <option value="terreno">Terrenos / Lotes</option>
              <option value="comercial">Comerciais</option>
              <option value="lancamento">Lançamentos</option>
            </select>

            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-slate-500 hover:text-slate-800 underline px-2 cursor-pointer"
              >
                Limpar busca
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Deals List */}
      <div className="divide-y divide-slate-100">
        {filteredDeals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 font-heading">
              Nenhum contrato encontrado
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'todos' || typeFilter !== 'todos'
                ? 'Tente ajustar os filtros de busca para encontrar o contrato desejado.'
                : 'Você ainda não cadastrou nenhuma venda de imóvel. Comece adicionando o seu primeiro contrato!'}
            </p>
            <button
              onClick={onOpenNewDeal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Cadastrar Nova Venda
            </button>
          </div>
        ) : (
          filteredDeals.map((deal) => {
            const isExpanded = expandedDealIds[deal.id] ?? false;

            // Calculate progress of received commission
            const receivedAmount = deal.installments
              .filter((i) => i.status === 'recebido')
              .reduce((acc, i) => acc + i.amount, 0);
            const totalCommission = deal.totalBrokerReceivable;
            const progressPercent = totalCommission > 0 ? Math.min(100, Math.round((receivedAmount / totalCommission) * 100)) : 0;
            const pendingAmount = Math.max(0, totalCommission - receivedAmount);

            return (
              <div 
                key={deal.id}
                className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Column: Deal info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {getPropertyTypeLabel(deal.propertyType)}
                      </span>
                      <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                        deal.status === 'concluido'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {deal.status === 'concluido' ? '100% Recebido' : 'Em Andamento'}
                      </span>
                      {deal.bonusAmount > 0 && (
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-600" />
                          Bônus +{formatCurrency(deal.bonusAmount)}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        • Contrato em {formatDateBR(deal.contractDate)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 font-heading truncate">
                      {deal.propertyTitle}
                    </h3>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                      <div>
                        Cliente: <strong className="font-semibold text-slate-700">{deal.clientName}</strong>
                        {deal.clientPhone && <span className="text-slate-400 ml-1">({deal.clientPhone})</span>}
                      </div>
                      {deal.developerOrAgency && (
                        <div>
                          Origem/Parceria: <strong className="font-semibold text-slate-700">{deal.developerOrAgency}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Financial Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 bg-slate-50/70 p-3 rounded-xl border border-slate-200 shrink-0">
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 block">VGV da Venda</span>
                      <span className="text-sm font-bold text-slate-900 font-heading">
                        {formatCurrency(deal.propertyValue)}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Bruto {deal.grossCommissionPercent}% ({formatCurrency(deal.grossCommissionValue)})
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-slate-500 block">Comissão Líquida</span>
                      <span className="text-sm font-bold text-slate-900 font-heading">
                        {formatCurrency(deal.totalBrokerReceivable)}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Repasse {deal.brokerSplitPercent}% {deal.bonusAmount > 0 ? '+ bônus' : ''}
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[11px] font-medium text-slate-500 block">Status Recebimento</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-sm font-bold text-emerald-600 font-heading">
                          {formatCurrency(receivedAmount)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          / {formatCurrency(totalCommission)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <button
                      onClick={() => toggleExpand(deal.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <span>{deal.installments.length} parcelas</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => onEditDeal(deal)}
                      title="Editar contrato"
                      className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Tem certeza que deseja remover o contrato "${deal.propertyTitle}"?`)) {
                          onDeleteDeal(deal.id);
                        }
                      }}
                      title="Excluir contrato"
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {/* Expanded Installments Schedule */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Cronograma de Recebíveis Desta Venda
                      </h4>
                      <span className="text-xs text-slate-500">
                        {deal.installments.filter(i => i.status === 'recebido').length} de {deal.installments.length} parcelas pagas
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {deal.installments.map((inst) => {
                        const isPaid = inst.status === 'recebido';
                        return (
                          <div
                            key={inst.id}
                            className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                              isPaid
                                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                                : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                {inst.isBonus && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                    BÔNUS
                                  </span>
                                )}
                                <span className="font-bold truncate block">
                                  {inst.title}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Vencimento: <strong>{formatDateBR(inst.dueDate)}</strong>
                                {inst.receivedDate && (
                                  <span className="ml-1 text-emerald-700">• Pago em {formatDateBR(inst.receivedDate)}</span>
                                )}
                              </div>
                              <div className="font-extrabold text-sm mt-1">
                                {formatCurrency(inst.amount)}
                              </div>
                            </div>

                            <button
                              id={`btn-deal-inst-${inst.id}`}
                              onClick={() => onToggleInstallmentStatus(deal.id, inst.id)}
                              className={`px-2.5 py-1.5 rounded-md font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0 ${
                                isPaid
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : 'bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 border border-slate-200'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isPaid ? 'Pago' : 'Receber'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {deal.notes && (
                      <div className="mt-3 p-2.5 rounded-lg bg-amber-50/50 border border-amber-100 text-xs text-amber-900">
                        <strong>Observações:</strong> {deal.notes}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
