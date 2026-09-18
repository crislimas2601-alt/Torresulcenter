import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Plus, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  ChevronDown, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  User, 
  Phone, 
  Tag, 
  Calendar, 
  DollarSign, 
  ArrowUpDown, 
  Sparkles, 
  Layers, 
  Check, 
  X, 
  RotateCcw,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { ContractDeal, Installment, PropertyType, DealStatus } from '../types';
import { sanitizeDeveloperName } from '../utils/storage';

interface DatabaseViewProps {
  deals: ContractDeal[];
  onOpenNewDeal: () => void;
  onEditDeal: (deal: ContractDeal) => void;
  onDeleteDeal: (dealId: string) => void;
  onToggleInstallmentStatus: (dealId: string, installmentId: string) => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onTriggerImport: () => void;
  onClearAll: () => void;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  deals,
  onOpenNewDeal,
  onEditDeal,
  onDeleteDeal,
  onToggleInstallmentStatus,
  onExportCsv,
  onExportJson,
  onTriggerImport,
  onClearAll,
}) => {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all'); // 'all' | 'venda_direta' | 'agenciamento'
  const [startDate, setStartDate] = useState<string>(''); // YYYY-MM-DD
  const [endDate, setEndDate] = useState<string>(''); // YYYY-MM-DD
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentState, setSelectedPaymentState] = useState<string>('all');
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'signature-desc' | 'signature-asc' | 'date-desc' | 'date-asc' | 'value-desc' | 'commission-desc' | 'title-asc'>('signature-desc');
  
  // Expanded row tracking
  const [expandedDealIds, setExpandedDealIds] = useState<Set<string>>(new Set());
  
  // View mode: 'table' or 'cards'
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const [year, month, day] = dateStr.split('-');
      if (!year || !month || !day) return dateStr;
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // Toggle row expand
  const toggleExpand = (dealId: string) => {
    setExpandedDealIds((prev) => {
      const next = new Set(prev);
      if (next.has(dealId)) {
        next.delete(dealId);
      } else {
        next.add(dealId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedDealIds(new Set(deals.map((d) => d.id)));
  };

  const collapseAll = () => {
    setExpandedDealIds(new Set());
  };

  // Unique developers for filter
  const uniqueDevelopers = useMemo(() => {
    const devs = new Set<string>();
    deals.forEach((d) => {
      const cleanDev = sanitizeDeveloperName(d.developerOrAgency);
      if (cleanDev) {
        devs.add(cleanDev);
      }
    });
    return Array.from(devs).sort();
  }, [deals]);

  // Overall database metrics
  const databaseStats = useMemo(() => {
    const totalRecords = deals.length;
    let totalVgv = 0;
    let totalNetCommission = 0;
    let totalBonuses = 0;
    let totalReceived = 0;
    let totalPending = 0;
    let totalInstallmentsCount = 0;
    let receivedInstallmentsCount = 0;
    let totalDirectSalesCount = 0;
    let totalAgencyCount = 0;
    let totalDirectSalesVgv = 0;
    let totalAgencyVgv = 0;
    const clients = new Set<string>();

    deals.forEach((deal) => {
      const isAgency = deal.dealCategory === 'agenciamento';
      if (isAgency) {
        totalAgencyCount += 1;
        totalAgencyVgv += deal.propertyValue || 0;
      } else {
        totalDirectSalesCount += 1;
        totalDirectSalesVgv += deal.propertyValue || 0;
      }

      totalVgv += deal.propertyValue || 0;
      totalNetCommission += deal.brokerNetCommission || 0;
      totalBonuses += deal.bonusAmount || 0;
      if (deal.clientName?.trim()) clients.add(deal.clientName.trim().toLowerCase());

      deal.installments.forEach((inst) => {
        totalInstallmentsCount += 1;
        if (inst.status === 'recebido') {
          totalReceived += inst.amount || 0;
          receivedInstallmentsCount += 1;
        } else {
          totalPending += inst.amount || 0;
        }
      });
    });

    const totalReceivables = totalNetCommission + totalBonuses;
    const completionPercent = totalReceivables > 0 ? (totalReceived / totalReceivables) * 100 : 0;

    return {
      totalRecords,
      totalVgv,
      totalNetCommission,
      totalBonuses,
      totalReceivables,
      totalReceived,
      totalPending,
      totalInstallmentsCount,
      receivedInstallmentsCount,
      uniqueClientsCount: clients.size,
      completionPercent,
      totalDirectSalesCount,
      totalAgencyCount,
      totalDirectSalesVgv,
      totalAgencyVgv,
    };
  }, [deals]);

  // Filter & Sort Logic
  const filteredDeals = useMemo(() => {
    return deals
      .filter((deal) => {
        // Search term
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchTitle = deal.propertyTitle?.toLowerCase().includes(query);
          const matchClient = deal.clientName?.toLowerCase().includes(query);
          const matchDev = deal.developerOrAgency?.toLowerCase().includes(query);
          const matchPhone = deal.clientPhone?.toLowerCase().includes(query);
          const matchNotes = deal.notes?.toLowerCase().includes(query);
          const matchBonus = deal.bonusDescription?.toLowerCase().includes(query);
          const matchId = deal.id?.toLowerCase().includes(query);
          if (!matchTitle && !matchClient && !matchDev && !matchPhone && !matchNotes && !matchBonus && !matchId) {
            return false;
          }
        }

        // Deal category (Venda Direta vs Agenciamento)
        if (selectedCategory !== 'all') {
          const isAgency = deal.dealCategory === 'agenciamento';
          if (selectedCategory === 'agenciamento' && !isAgency) return false;
          if (selectedCategory === 'venda_direta' && isAgency) return false;
        }

        // Date period filter (Signature / Closing date)
        const signDate = deal.signatureDate || deal.contractDate;
        if (startDate && signDate < startDate) {
          return false;
        }
        if (endDate && signDate > endDate) {
          return false;
        }

        // Property type
        if (selectedType !== 'all' && deal.propertyType !== selectedType) {
          return false;
        }

        // Deal status
        if (selectedStatus !== 'all' && deal.status !== selectedStatus) {
          return false;
        }

        // Developer
        if (selectedDeveloper !== 'all' && deal.developerOrAgency !== selectedDeveloper) {
          return false;
        }

        // Payment status
        if (selectedPaymentState !== 'all') {
          const allReceived = deal.installments.length > 0 && deal.installments.every((i) => i.status === 'recebido');
          const hasPending = deal.installments.some((i) => i.status !== 'recebido');

          if (selectedPaymentState === 'quitado' && !allReceived) return false;
          if (selectedPaymentState === 'pendente' && !hasPending) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'signature-desc') {
          const dateA = a.signatureDate || a.contractDate;
          const dateB = b.signatureDate || b.contractDate;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        }
        if (sortBy === 'signature-asc') {
          const dateA = a.signatureDate || a.contractDate;
          const dateB = b.signatureDate || b.contractDate;
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        }
        if (sortBy === 'date-desc') {
          return new Date(b.contractDate).getTime() - new Date(a.contractDate).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.contractDate).getTime() - new Date(b.contractDate).getTime();
        }
        if (sortBy === 'value-desc') {
          return (b.propertyValue || 0) - (a.propertyValue || 0);
        }
        if (sortBy === 'commission-desc') {
          return (b.totalBrokerReceivable || 0) - (a.totalBrokerReceivable || 0);
        }
        if (sortBy === 'title-asc') {
          return a.propertyTitle.localeCompare(b.propertyTitle);
        }
        return 0;
      });
  }, [deals, searchTerm, selectedCategory, startDate, endDate, selectedType, selectedStatus, selectedDeveloper, selectedPaymentState, sortBy]);

  // Subtotal for filtered results
  const filteredSubtotals = useMemo(() => {
    let subtotalVgv = 0;
    let subtotalCommission = 0;
    let subtotalReceived = 0;
    let subtotalPending = 0;
    let filteredDirectCount = 0;
    let filteredAgencyCount = 0;
    let filteredDirectVgv = 0;
    let filteredAgencyVgv = 0;

    filteredDeals.forEach((deal) => {
      const isAgency = deal.dealCategory === 'agenciamento';
      if (isAgency) {
        filteredAgencyCount += 1;
        filteredAgencyVgv += deal.propertyValue || 0;
      } else {
        filteredDirectCount += 1;
        filteredDirectVgv += deal.propertyValue || 0;
      }

      subtotalVgv += deal.propertyValue || 0;
      subtotalCommission += deal.totalBrokerReceivable || 0;
      deal.installments.forEach((inst) => {
        if (inst.status === 'recebido') {
          subtotalReceived += inst.amount || 0;
        } else {
          subtotalPending += inst.amount || 0;
        }
      });
    });

    return {
      subtotalVgv,
      subtotalCommission,
      subtotalReceived,
      subtotalPending,
      filteredDirectCount,
      filteredAgencyCount,
      filteredDirectVgv,
      filteredAgencyVgv,
    };
  }, [filteredDeals]);

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'all' || startDate !== '' || endDate !== '' || selectedType !== 'all' || selectedStatus !== 'all' || selectedDeveloper !== 'all' || selectedPaymentState !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setStartDate('');
    setEndDate('');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedDeveloper('all');
    setSelectedPaymentState('all');
    setSortBy('signature-desc');
  };

  const getDealCategoryBadge = (category?: 'venda_direta' | 'agenciamento') => {
    if (category === 'agenciamento') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200" title="Agenciamento / Captação do Imóvel">
          <Building2 className="w-3 h-3 text-slate-600" />
          Agenciamento
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200/80" title="Venda Direta">
        <Tag className="w-3 h-3 text-red-600" />
        Venda Direta
      </span>
    );
  };

  const getStatusBadge = (status: DealStatus) => {
    switch (status) {
      case 'concluido':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Quitado
          </span>
        );
      case 'distrato':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-3 h-3 text-red-600" />
            Distrato
          </span>
        );
      case 'em_andamento':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            Em Andamento
          </span>
        );
    }
  };

  const getPropertyTypeLabel = (type: PropertyType) => {
    const map: Record<PropertyType, string> = {
      apartamento: 'Apartamento',
      casa: 'Casa',
      terreno: 'Terreno',
      comercial: 'Comercial',
      lancamento: 'Lançamento',
      rural: 'Rural',
      outro: 'Outro',
    };
    return map[type] || type;
  };

  return (
    <div className="space-y-6">
      
      {/* Database Header & Controls */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  Banco de Dados de Contratos & Vendas
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Armazenamento Local Ativo
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Tabela relacional completa com todos os contratos, clientes, cálculos de comissões líquidas e parcelas registradas.
              </p>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-db-export-csv"
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer border border-slate-200"
              title="Exportar todos os dados para Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Excel</span>
            </button>

            <button
              id="btn-db-export-json"
              onClick={onExportJson}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer border border-slate-200"
              title="Download do arquivo JSON completo do banco"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Backup JSON</span>
            </button>

            <button
              id="btn-db-import-json"
              onClick={onTriggerImport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer border border-slate-200"
              title="Restaurar dados a partir de arquivo de backup"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Restaurar</span>
            </button>

            <button
              id="btn-db-new-deal"
              onClick={onOpenNewDeal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Registro</span>
            </button>
          </div>

        </div>

        {/* Database Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-100">
          
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Total Registros
            </span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {databaseStats.totalRecords} <span className="text-xs font-normal text-slate-500">vendas</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              {databaseStats.uniqueClientsCount} clientes únicos
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Volume Geral (VGV)
            </span>
            <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 truncate" title={formatCurrency(databaseStats.totalVgv)}>
              {formatCurrency(databaseStats.totalVgv)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Soma dos imóveis
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Comissão Total
            </span>
            <div className="text-sm sm:text-base font-bold text-amber-700 mt-0.5 truncate" title={formatCurrency(databaseStats.totalReceivables)}>
              {formatCurrency(databaseStats.totalReceivables)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Líquido + Bônus
            </span>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider block">
              Já Recebido
            </span>
            <div className="text-sm sm:text-base font-bold text-emerald-700 mt-0.5 truncate" title={formatCurrency(databaseStats.totalReceived)}>
              {formatCurrency(databaseStats.totalReceived)}
            </div>
            <span className="text-[10px] text-emerald-600 mt-0.5 block font-medium">
              {databaseStats.completionPercent.toFixed(0)}% liquidado
            </span>
          </div>

          <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100">
            <span className="text-[11px] font-medium text-blue-800 uppercase tracking-wider block">
              Saldo a Receber
            </span>
            <div className="text-sm sm:text-base font-bold text-blue-700 mt-0.5 truncate" title={formatCurrency(databaseStats.totalPending)}>
              {formatCurrency(databaseStats.totalPending)}
            </div>
            <span className="text-[10px] text-blue-600 mt-0.5 block">
              Previsão futura
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Parcelas no Banco
            </span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {databaseStats.receivedInstallmentsCount} / {databaseStats.totalInstallmentsCount}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              parcelas baixadas
            </span>
          </div>

        </div>

        {/* Discriminador de Operações: Vendas Diretas vs Agenciamentos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className={`p-3.5 rounded-xl border transition-all ${
            selectedCategory === 'venda_direta' ? 'bg-red-50/40 border-red-300 ring-1 ring-red-300' : 'bg-slate-50/70 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Vendas Diretas Realizadas
                  </span>
                  <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                    {filteredSubtotals.filteredDirectCount} <span className="text-xs font-normal text-slate-500">imóveis</span>
                    {(startDate || endDate || selectedCategory !== 'all') && (
                      <span className="text-[11px] font-medium text-slate-500 ml-1.5">
                        (de {databaseStats.totalDirectSalesCount} ao total)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-medium block">VGV Vendas</span>
                <span className="text-sm font-bold text-slate-900">
                  {formatCurrency(filteredSubtotals.filteredDirectVgv)}
                </span>
              </div>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border transition-all ${
            selectedCategory === 'agenciamento' ? 'bg-slate-100/90 border-slate-400 ring-1 ring-slate-400' : 'bg-slate-50/70 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Agenciamentos / Captações
                  </span>
                  <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                    {filteredSubtotals.filteredAgencyCount} <span className="text-xs font-normal text-slate-500">imóveis</span>
                    {(startDate || endDate || selectedCategory !== 'all') && (
                      <span className="text-[11px] font-medium text-slate-500 ml-1.5">
                        (de {databaseStats.totalAgencyCount} ao total)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-medium block">VGV Agenciamento</span>
                <span className="text-sm font-bold text-slate-900">
                  {formatCurrency(filteredSubtotals.filteredAgencyVgv)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Query, Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Universal Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="db-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, empreendimento, construtora, telefone, notas..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-hidden"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Switcher + Expand/Collapse Buttons */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Tabela
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Fichas
              </button>
            </div>

            {viewMode === 'table' && deals.length > 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={expandAll}
                  className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  title="Expandir todas as parcelas"
                >
                  Expandir Tudo
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={collapseAll}
                  className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  title="Recolher parcelas"
                >
                  Recolher
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
          
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filtros:</span>
          </div>

          {/* Operation Category Filter (Venda Direta vs Agenciamento) */}
          <select
            id="filter-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-hidden focus:border-red-600 cursor-pointer"
          >
            <option value="all">Todas as Operações</option>
            <option value="venda_direta">Venda Direta</option>
            <option value="agenciamento">Agenciamento (Captação)</option>
          </select>

          {/* Date Period Filter (Período de Assinatura / Fechamento) */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 border border-slate-200 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] text-slate-500 font-medium">Fechamento:</span>
            <input
              id="filter-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-slate-800 font-medium text-xs outline-none cursor-pointer"
              title="Data inicial de assinatura/fechamento"
            />
            <span className="text-slate-400 text-xs">até</span>
            <input
              id="filter-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-slate-800 font-medium text-xs outline-none cursor-pointer"
              title="Data final de assinatura/fechamento"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-slate-400 hover:text-slate-600 p-0.5 ml-1"
                title="Limpar período de datas"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <select
            id="filter-type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Todos os Tipos</option>
            <option value="apartamento">Apartamento</option>
            <option value="casa">Casa</option>
            <option value="terreno">Terreno</option>
            <option value="comercial">Comercial</option>
            <option value="lancamento">Lançamento</option>
            <option value="rural">Rural</option>
            <option value="outro">Outro</option>
          </select>

          {/* Status Filter */}
          <select
            id="filter-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluido">Quitado / Concluído</option>
            <option value="distrato">Distrato</option>
          </select>

          {/* Payment State Filter */}
          <select
            id="filter-payment"
            value={selectedPaymentState}
            onChange={(e) => setSelectedPaymentState(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Todos os Pagamentos</option>
            <option value="pendente">Com Saldo a Receber</option>
            <option value="quitado">100% Recebidos</option>
          </select>

          {/* Developer Filter */}
          {uniqueDevelopers.length > 0 && (
            <select
              id="filter-dev"
              value={selectedDeveloper}
              onChange={(e) => setSelectedDeveloper(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:border-blue-500 cursor-pointer max-w-[160px] truncate"
            >
              <option value="all">Todas Construtoras</option>
              {uniqueDevelopers.map((dev) => (
                <option key={dev} value={dev}>{dev}</option>
              ))}
            </select>
          )}

          {/* Sort Controller */}
          <div className="flex items-center gap-1 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="signature-desc">Assinatura (Mais recente)</option>
              <option value="signature-asc">Assinatura (Mais antiga)</option>
              <option value="date-desc">Data Contrato (Mais recente)</option>
              <option value="date-asc">Data Contrato (Mais antiga)</option>
              <option value="value-desc">Maior VGV</option>
              <option value="commission-desc">Maior Comissão</option>
              <option value="title-asc">Imóvel (A-Z)</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar Filtros</span>
            </button>
          )}

        </div>

      </div>

      {/* Main Content Area */}
      {deals.length === 0 ? (
        /* Empty Database State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            O Banco de Dados está Vazio
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Nenhum contrato cadastrado no momento. Você pode começar a preencher seus lançamentos agora ou importar um backup anterior.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={onOpenNewDeal}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Primeiro Contrato</span>
            </button>
            <button
              onClick={onTriggerImport}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Restaurar Backup</span>
            </button>
          </div>
        </div>
      ) : filteredDeals.length === 0 ? (
        /* Filtered Result Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs">
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            Nenhum registro encontrado
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Não encontramos nenhum contrato correspondente aos filtros aplicados.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Limpar Filtros de Busca
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table Master View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              
              {/* Table Head */}
              <thead>
                <tr className="bg-slate-100/90 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3">Operação</th>
                  <th className="py-3 px-3">Fechamento / Assinatura</th>
                  <th className="py-3 px-3">Imóvel & Construtora</th>
                  <th className="py-3 px-3">Cliente Comprador</th>
                  <th className="py-3 px-3 text-right">VGV Imóvel</th>
                  <th className="py-3 px-3 text-right">% Com.</th>
                  <th className="py-3 px-3 text-right">Comissão Líquida</th>
                  <th className="py-3 px-3 text-right">Bônus</th>
                  <th className="py-3 px-4 text-right">Total Recebível</th>
                  <th className="py-3 px-3 text-center">Data de Recebimento</th>
                  <th className="py-3 px-3 text-center">Progresso</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100">
                {filteredDeals.map((deal) => {
                  const isExpanded = expandedDealIds.has(deal.id);
                  const totalPaid = deal.installments
                    .filter((i) => i.status === 'recebido')
                    .reduce((sum, i) => sum + i.amount, 0);
                  const totalBalance = (deal.totalBrokerReceivable || 0) - totalPaid;
                  const paidCount = deal.installments.filter((i) => i.status === 'recebido').length;
                  const totalCount = deal.installments.length;

                  return (
                    <React.Fragment key={deal.id}>
                      <tr 
                        className={`hover:bg-slate-50 transition-colors ${
                          isExpanded ? 'bg-slate-50/80 font-medium' : 'even:bg-slate-50/40'
                        }`}
                      >
                        {/* Expand Button */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => toggleExpand(deal.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                            title={isExpanded ? 'Ocultar parcelas' : 'Ver parcelas deste contrato'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-red-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Operation Category */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {getDealCategoryBadge(deal.dealCategory)}
                        </td>

                        {/* Signature & Contract Date */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-bold text-slate-900 text-xs">
                            {formatDate(deal.signatureDate || deal.contractDate)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {deal.signatureDate ? 'Assinado' : 'Cadastrado'}
                          </div>
                        </td>

                        {/* Property */}
                        <td className="py-3 px-3 min-w-[180px]">
                          <div className="font-bold text-slate-900 leading-tight">
                            {deal.propertyTitle}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="capitalize">{getPropertyTypeLabel(deal.propertyType)}</span>
                            {deal.developerOrAgency && (
                              <>
                                <span>•</span>
                                <span className="font-medium text-slate-700">{deal.developerOrAgency}</span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Client */}
                        <td className="py-3 px-3 min-w-[150px]">
                          <div className="font-semibold text-slate-800">
                            {deal.clientName || '-'}
                          </div>
                          {deal.clientPhone && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              <span>{deal.clientPhone}</span>
                            </div>
                          )}
                        </td>

                        {/* VGV */}
                        <td className="py-3 px-3 text-right font-medium text-slate-800 whitespace-nowrap">
                          {formatCurrency(deal.propertyValue)}
                        </td>

                        {/* Commission % */}
                        <td className="py-3 px-3 text-right text-slate-600 whitespace-nowrap">
                          <span className="font-semibold text-slate-900">{deal.grossCommissionPercent}%</span>
                          {deal.brokerSplitPercent < 100 && (
                            <span className="text-[10px] text-slate-400 block">
                              ({deal.brokerSplitPercent}% repasse)
                            </span>
                          )}
                        </td>

                        {/* Broker Net */}
                        <td className="py-3 px-3 text-right font-semibold text-slate-800 whitespace-nowrap">
                          {formatCurrency(deal.brokerNetCommission)}
                        </td>

                        {/* Bonus */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          {deal.bonusAmount > 0 ? (
                            <span className="font-semibold text-amber-700">
                              +{formatCurrency(deal.bonusAmount)}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Total Receivable */}
                        <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap bg-slate-50/70">
                          {formatCurrency(deal.totalBrokerReceivable)}
                        </td>

                        {/* Data de Recebimento (Último recebido ou próximo agendado) */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {(() => {
                            const receivedInsts = deal.installments.filter(i => i.status === 'recebido' && i.receivedDate);
                            const lastReceived = receivedInsts.length > 0 
                              ? [...receivedInsts].sort((a, b) => (b.receivedDate || '').localeCompare(a.receivedDate || ''))[0]
                              : null;
                            const nextPending = deal.installments
                              .filter(i => i.status !== 'recebido')
                              .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

                            if (lastReceived && lastReceived.receivedDate) {
                              return (
                                <div className="inline-flex flex-col items-center">
                                  <span className="font-bold text-slate-900 text-xs">
                                    {formatDate(lastReceived.receivedDate)}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    {receivedInsts.length === deal.installments.length ? 'Quitado' : 'Última baixa'}
                                  </span>
                                </div>
                              );
                            } else if (nextPending) {
                              return (
                                <div className="inline-flex flex-col items-center">
                                  <span className="font-medium text-slate-700 text-xs">
                                    {formatDate(nextPending.dueDate)}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    Previsto
                                  </span>
                                </div>
                              );
                            }
                            return <span className="text-slate-400">-</span>;
                          })()}
                        </td>

                        {/* Progress */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="text-[11px] font-bold text-slate-700">
                              {paidCount}/{totalCount} parcelas
                            </span>
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-red-600 rounded-full transition-all"
                                style={{
                                  width: `${deal.totalBrokerReceivable > 0 ? (totalPaid / deal.totalBrokerReceivable) * 100 : 0}%`
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {getStatusBadge(deal.status)}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onEditDeal(deal)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                              title="Editar contrato"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Deseja excluir o contrato "${deal.propertyTitle}"?`)) {
                                  onDeleteDeal(deal.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Excluir contrato"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Sub-table (Installments & Contract Ledger) */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-y border-slate-200">
                          <td colSpan={14} className="p-4 sm:p-5">
                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                              
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-2.5">
                                <div className="flex items-center gap-2">
                                  <Layers className="w-4 h-4 text-red-600" />
                                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                                    Grade de Parcelas de Comissão — {deal.propertyTitle}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                  <span>
                                    Recebido: <strong className="text-slate-900 font-bold">{formatCurrency(totalPaid)}</strong>
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Saldo Aberto: <strong className="text-red-700 font-bold">{formatCurrency(totalBalance)}</strong>
                                  </span>
                                </div>
                              </div>

                              {/* Installments Table */}
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                      <th className="py-2 px-2.5">Parcela</th>
                                      <th className="py-2 px-2.5">Identificação</th>
                                      <th className="py-2 px-2.5">Vencimento</th>
                                      <th className="py-2 px-2.5 text-right">Valor Parcela</th>
                                      <th className="py-2 px-2.5">Data Baixa</th>
                                      <th className="py-2 px-2.5 text-center">Status</th>
                                      <th className="py-2 px-2.5 text-center">Ação</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {deal.installments.map((inst, idx) => (
                                      <tr key={inst.id} className="hover:bg-slate-50">
                                        <td className="py-2 px-2.5 font-semibold text-slate-700">
                                          #{inst.installmentNumber} de {inst.totalInstallments}
                                        </td>
                                        <td className="py-2 px-2.5 text-slate-800">
                                          {inst.title}
                                          {inst.isBonus && (
                                            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                              Bônus
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2 px-2.5 text-slate-600 font-medium">
                                          {formatDate(inst.dueDate)}
                                        </td>
                                        <td className="py-2 px-2.5 text-right font-bold text-slate-900">
                                          {formatCurrency(inst.amount)}
                                        </td>
                                        <td className="py-2 px-2.5 text-slate-500">
                                          {inst.receivedDate ? formatDate(inst.receivedDate) : '-'}
                                        </td>
                                        <td className="py-2 px-2.5 text-center">
                                          {inst.status === 'recebido' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                                              <Check className="w-3 h-3 text-slate-700" />
                                              Recebido
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                                              <Clock className="w-3 h-3 text-slate-400" />
                                              Pendente
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2 px-2.5 text-center">
                                          <button
                                            onClick={() => onToggleInstallmentStatus(deal.id, inst.id)}
                                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                                              inst.status === 'recebido'
                                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                : 'bg-red-600 hover:bg-red-700 text-white shadow-2xs'
                                            }`}
                                          >
                                            {inst.status === 'recebido' ? 'Desmarcar' : 'Dar Baixa'}
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Contract Notes if any */}
                              {deal.notes && (
                                <div className="mt-2 p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                                  <strong className="text-slate-800">Observações:</strong> {deal.notes}
                                </div>
                              )}

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>

              {/* Table Footer Subtotals */}
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-800">
                  <td colSpan={5} className="py-3 px-4">
                    Subtotal dos Registros Filtrados ({filteredDeals.length} de {deals.length})
                  </td>
                  <td className="py-3 px-3 text-right">
                    {formatCurrency(filteredSubtotals.subtotalVgv)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300">-</td>
                  <td className="py-3 px-3 text-right">
                    {formatCurrency(filteredSubtotals.subtotalCommission)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-200">
                    {filteredDeals.reduce((sum, d) => sum + (d.bonusAmount || 0), 0) > 0 
                      ? formatCurrency(filteredDeals.reduce((sum, d) => sum + (d.bonusAmount || 0), 0))
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-right text-white font-extrabold bg-slate-800">
                    {formatCurrency(filteredSubtotals.subtotalCommission)}
                  </td>
                  <td colSpan={4} className="py-3 px-4 text-center text-slate-300">
                    Pago: {formatCurrency(filteredSubtotals.subtotalReceived)} | Saldo: {formatCurrency(filteredSubtotals.subtotalPending)}
                  </td>
                </tr>
              </tfoot>

            </table>
          </div>

        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeals.map((deal) => {
            const totalPaid = deal.installments
              .filter((i) => i.status === 'recebido')
              .reduce((sum, i) => sum + i.amount, 0);
            const totalBalance = (deal.totalBrokerReceivable || 0) - totalPaid;
            const paidCount = deal.installments.filter((i) => i.status === 'recebido').length;
            const totalCount = deal.installments.length;

            return (
              <div 
                key={deal.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        {getDealCategoryBadge(deal.dealCategory)}
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          • {getPropertyTypeLabel(deal.propertyType)}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {deal.propertyTitle}
                      </h3>
                      {deal.developerOrAgency && (
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {deal.developerOrAgency}
                        </span>
                      )}
                    </div>
                    {getStatusBadge(deal.status)}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/70 px-2.5 py-1.5 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>Fechamento / Assinatura:</span>
                    </div>
                    <strong className="text-slate-900 font-bold">
                      {formatDate(deal.signatureDate || deal.contractDate)}
                    </strong>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Cliente Comprador:</span>
                      <strong className="text-slate-800">{deal.clientName || '-'}</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Valor Imóvel (VGV):</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(deal.propertyValue)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Comissão Corretor ({deal.grossCommissionPercent}%):</span>
                      <strong className="text-slate-900 text-sm font-bold">{formatCurrency(deal.totalBrokerReceivable)}</strong>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="text-slate-600 font-medium">Parcelas: {paidCount}/{totalCount}</span>
                      <span className="font-bold text-slate-800">{formatCurrency(totalPaid)} recebido</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-600 rounded-full transition-all"
                        style={{
                          width: `${deal.totalBrokerReceivable > 0 ? (totalPaid / deal.totalBrokerReceivable) * 100 : 0}%`
                        }}
                      />
                    </div>
                    {totalBalance > 0 && (
                      <span className="text-[10px] text-slate-500 font-medium block mt-1 text-right">
                        Restam {formatCurrency(totalBalance)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleExpand(deal.id)}
                    className="text-xs font-semibold text-slate-700 hover:text-red-600 transition cursor-pointer"
                  >
                    Ver {deal.installments.length} parcelas
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditDeal(deal)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Deseja excluir "${deal.propertyTitle}"?`)) {
                          onDeleteDeal(deal.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Cloud & Backup Security Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              Banco de Dados Seguro no seu Navegador
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Todas as inserções, baixas de parcelas e edições são salvas automaticamente em tempo real. Você pode fazer o download do banco a qualquer momento pelo botão <strong>Backup JSON</strong> ou <strong>Exportar Excel</strong>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={onExportCsv}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition shadow-2xs cursor-pointer"
          >
            Baixar Planilha
          </button>
        </div>
      </div>

    </div>
  );
};
