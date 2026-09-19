/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ContractDeal, 
  Installment, 
  InstallmentStatus,
  MonthlyForecastItem, 
  FinancialStats,
  AppToolMode 
} from './types';
import { 
  loadDeals, 
  saveDeals, 
  resetToSampleDeals, 
  clearAllDeals, 
  calculateFinancialStats,
  sanitizeDeveloperName
} from './utils/storage';
import { loadProposals } from './utils/proposalStorage';
import { formatCurrency, formatDateBR, getPropertyTypeLabel, getDealCategoryLabel } from './utils/formatters';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { CashFlowForecast } from './components/CashFlowForecast';
import { BonusTracker } from './components/BonusTracker';
import { ContractsList } from './components/ContractsList';
import { DatabaseView } from './components/DatabaseView';
import { DealModal } from './components/DealModal';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';
import { AmortizationSuite } from './components/AmortizationSuite';
import { ProposalBackOfficeTool } from './components/ProposalBackOfficeTool';
import { TorreSulLogo } from './components/TorresulLogo';
import { LoginScreen } from './components/LoginScreen';
import { auth, User, checkRedirectLogin, isSessionExpired, logoutUser } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  saveDealsToCloud, 
  loadDealsFromCloud, 
  subscribeToUserCloud,
  areDealsEqual,
  mergeDeals
} from './utils/cloudSync';
import { 
  CheckCircle2, 
  Info, 
  TrendingUp, 
  Sparkles, 
  CalendarDays,
  FileCheck2,
  Menu,
  Calculator,
  FileText,
  Wallet,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppToolMode>('comissoes');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [deals, setDeals] = useState<ContractDeal[]>(() => loadDeals());
  const [proposalsCount, setProposalsCount] = useState<number>(() => loadProposals().length);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'database'>('dashboard');
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<ContractDeal | null>(null);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Authentication & Cloud Sync States
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [expiredNotice, setExpiredNotice] = useState<string | null>(null);
  const [cloudSyncWarning, setCloudSyncWarning] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isInitialCloudLoad = React.useRef(true);
  const lastSyncedJson = React.useRef<string>('');
  const dealsRef = React.useRef<ContractDeal[]>(deals);
  dealsRef.current = deals;
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Monitor Auth state & perform cloud sync
  useEffect(() => {
    // Fallback timer ensures UI is never stuck on loading screen
    const fallbackTimer = setTimeout(() => {
      setAuthChecking(false);
    }, 1200);

    // Check if user came back from a redirect login on mobile safely
    try {
      checkRedirectLogin();
    } catch {
      // ignore
    }

    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      clearTimeout(fallbackTimer);
      if (currentUser) {
        // Enforce 7-day session validity rule
        if (isSessionExpired(7)) {
          try {
            await logoutUser();
          } catch {
            // ignore
          }
          setUser(null);
          setExpiredNotice('Sua sessão de 7 dias expirou por segurança. Por favor, faça login com seu e-mail e senha.');
          setAuthChecking(false);
          return;
        }

        setUser(currentUser);
        setExpiredNotice(null);
        setIsSyncing(true);
        try {
          // Load existing remote deals if any
          const { deals: cloudDeals, error: cloudError } = await loadDealsFromCloud(currentUser);
          
          if (cloudError) {
            const errStr = String(cloudError?.message || cloudError);
            if (errStr.includes('disabled') || errStr.includes('not been used') || cloudError?.code === 'permission-denied') {
              setCloudSyncWarning(
                'O banco de dados Firestore ainda precisa ser criado no Firebase Console (Menu: Firestore Database > Criar banco de dados). Enquanto isso, todos os seus dados continuam 100% salvos no seu computador.'
              );
            }
          } else {
            setCloudSyncWarning(null);
          }

          // Merge existing local browser deals with cloud deals so NO PRIOR DATA IS LOST!
          const currentLocalDeals = loadDeals();
          const merged = mergeDeals(cloudDeals || [], currentLocalDeals || []);

          if (merged.length > 0) {
            const sanitizedDeals = merged.map((deal) => ({
              ...deal,
              developerOrAgency: sanitizeDeveloperName(deal.developerOrAgency),
            }));
            lastSyncedJson.current = JSON.stringify(sanitizedDeals);
            setDeals(sanitizedDeals);
            saveDeals(sanitizedDeals);

            // Attempt cloud sync if deals exist
            saveDealsToCloud(currentUser, sanitizedDeals).then((res) => {
              if (res.success) {
                setCloudSyncWarning(null);
              }
            });
            showToast(`Bem-vindo, ${currentUser.displayName || currentUser.email}! Dados carregados.`);
          } else {
            showToast(`Bem-vindo, ${currentUser.displayName || currentUser.email}!`);
          }

          // Subscribe to real-time updates from other tabs/devices
          unsubscribeSnapshot = subscribeToUserCloud(
            currentUser, 
            (remoteDeals) => {
              if (!isInitialCloudLoad.current) {
                const sanitizedRemote = remoteDeals.map((deal) => ({
                  ...deal,
                  developerOrAgency: sanitizeDeveloperName(deal.developerOrAgency),
                }));
                
                if (!areDealsEqual(dealsRef.current, sanitizedRemote)) {
                  lastSyncedJson.current = JSON.stringify(sanitizedRemote);
                  setDeals(sanitizedRemote);
                  saveDeals(sanitizedRemote);
                }
              }
              isInitialCloudLoad.current = false;
            },
            (err) => {
              console.warn('Listener notice:', err);
            }
          );
        } catch (error) {
          console.warn('Sincronização inicial em modo tolerante:', error);
        } finally {
          setIsSyncing(false);
          isInitialCloudLoad.current = false;
          setAuthChecking(false);
        }
      } else {
        setUser(null);
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }
        isInitialCloudLoad.current = false;
        setAuthChecking(false);
      }
    });

    return () => {
      clearTimeout(fallbackTimer);
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  // Save to localStorage immediately and sync to Cloud
  useEffect(() => {
    saveDeals(deals);

    if (user && !isInitialCloudLoad.current) {
      const currentJson = JSON.stringify(deals);
      // Skip if data is unchanged from last sync
      if (currentJson === lastSyncedJson.current) {
        return;
      }

      setIsSyncing(true);
      saveDealsToCloud(user, deals).then((res) => {
        setIsSyncing(false);
        if (res.success) {
          lastSyncedJson.current = currentJson;
          setCloudSyncWarning(null);
        } else if (res.error) {
          const errStr = String(res.error?.message || res.error);
          if (errStr.includes('disabled') || errStr.includes('not been used') || res.error?.code === 'permission-denied') {
            setCloudSyncWarning(
              'O banco de dados Firestore ainda precisa ser criado no Firebase Console (Menu: Firestore Database > Criar banco de dados). Enquanto isso, todos os seus dados continuam 100% salvos no seu computador.'
            );
          }
        }
      }).catch((err) => {
        setIsSyncing(false);
        console.warn('Auto-sync notice:', err);
      });
    }
  }, [deals, user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Manual Force Cloud Sync
  const handleManualSync = async () => {
    if (!user) return;
    try {
      setIsSyncing(true);
      await saveDealsToCloud(user, deals);
      showToast('Nuvem atualizada com sucesso!');
    } catch (err: any) {
      console.error(err);
      showToast(`Erro ao sincronizar: ${err.message || 'Verifique as permissões do Firebase'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Compute live financial analytics
  const { stats, monthlyForecast } = useMemo(() => {
    return calculateFinancialStats(deals);
  }, [deals]);

  // Handle toggle installment status (e.g. mark as received)
  const handleToggleInstallmentStatus = (dealId: string, installmentId: string) => {
    setDeals((prevDeals) =>
      prevDeals.map((deal) => {
        if (deal.id !== dealId) return deal;

        const updatedInstallments: Installment[] = deal.installments.map((inst) => {
          if (inst.id !== installmentId) return inst;
          const nextStatus: InstallmentStatus = inst.status === 'recebido' ? 'pendente' : 'recebido';
          return {
            ...inst,
            status: nextStatus,
            receivedDate: nextStatus === 'recebido' ? new Date().toISOString().slice(0, 10) : undefined,
          };
        });

        // If all installments are received, update deal status to 'concluido'
        const allReceived = updatedInstallments.every((i) => i.status === 'recebido');
        const dealStatus = allReceived ? 'concluido' : 'em_andamento';

        return {
          ...deal,
          installments: updatedInstallments,
          status: dealStatus,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    showToast('Status da parcela atualizado com sucesso!');
  };

  // Add or update deal
  const handleSaveDeal = (savedDeal: ContractDeal) => {
    setDeals((prev) => {
      const exists = prev.some((d) => d.id === savedDeal.id);
      if (exists) {
        return prev.map((d) => (d.id === savedDeal.id ? savedDeal : d));
      }
      return [savedDeal, ...prev];
    });

    showToast(editingDeal ? 'Contrato atualizado!' : 'Nova venda cadastrada com sucesso!');
    setEditingDeal(null);
  };

  // Delete deal
  const handleDeleteDeal = (dealId: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== dealId));
    showToast('Contrato excluído.');
  };

  // Convert an approved proposal from back office into a commission deal
  const handleConvertProposalToDeal = (dealData: Partial<ContractDeal>) => {
    const propVal = Number(dealData.propertyValue) || 0;
    const defaultGrossPercent = 5;
    const grossVal = Math.round((propVal * defaultGrossPercent) / 100);
    const brokerSplit = 50;
    const netComm = Math.round((grossVal * brokerSplit) / 100);

    const generatedDeal: ContractDeal = {
      id: `deal-${Date.now()}`,
      propertyTitle: dealData.propertyTitle || 'Novo Imóvel',
      propertyType: dealData.propertyType || 'apartamento',
      dealCategory: 'venda_direta',
      clientName: dealData.clientName || 'Cliente Proposta',
      clientPhone: dealData.clientPhone || '',
      developerOrAgency: sanitizeDeveloperName(dealData.developerOrAgency || ''),
      contractDate: new Date().toISOString().slice(0, 10),
      signatureDate: new Date().toISOString().slice(0, 10),
      propertyValue: propVal,
      grossCommissionPercent: defaultGrossPercent,
      grossCommissionValue: grossVal,
      brokerSplitPercent: brokerSplit,
      brokerNetCommission: netComm,
      bonusAmount: 0,
      bonusDescription: '',
      totalBrokerReceivable: netComm,
      installments: [
        {
          id: `inst-${Date.now()}-1`,
          dealId: `deal-${Date.now()}`,
          dealTitle: dealData.propertyTitle || 'Novo Imóvel',
          installmentNumber: 1,
          totalInstallments: 1,
          title: 'Parcela Única de Comissão (1/1)',
          amount: netComm,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          status: 'pendente',
        }
      ],
      status: 'em_andamento',
      notes: dealData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingDeal(generatedDeal);
    setIsDealModalOpen(true);
    setCurrentMode('comissoes');
    showToast('Proposta importada! Confira os dados da venda.');
  };

  // Reset to sample data
  const handleResetToSample = () => {
    const sample = resetToSampleDeals();
    setDeals(sample);
    setSelectedMonthFilter(null);
    showToast('Exemplos de corretor restaurados!');
  };

  // Clear all deals for fresh entry
  const handleClearAll = () => {
    const empty = clearAllDeals();
    setDeals(empty);
    setSelectedMonthFilter(null);
    showToast('Todos os dados foram zerados com sucesso! Pronto para cadastrar.');
  };

  // Import JSON backup
  const handleImportDeals = (imported: ContractDeal[]) => {
    setDeals(imported);
    saveDeals(imported);
    showToast(`${imported.length} contratos importados com sucesso!`);
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (deals.length === 0) {
      showToast('Não há vendas cadastradas para exportar.');
      return;
    }

    const headers = [
      'ID Contrato',
      'Tipo de Operação',
      'Data de Assinatura / Fechamento',
      'Imóvel',
      'Tipo de Imóvel',
      'Cliente (Comprador)',
      'Telefone',
      'Origem / Imobiliária',
      'Data Contrato',
      'Valor do Imóvel (VGV)',
      '% Comissão Bruta',
      'Comissão Bruta (R$)',
      '% Repasse Corretor',
      'Comissão Líquida (R$)',
      'Bônus / Premiação (R$)',
      'Total a Receber (R$)',
      'Status do Contrato',
      'Parcelas Totais',
      'Parcelas Pagas',
      'Observações',
    ];

    const rows = deals.map((d) => {
      const paidCount = d.installments.filter((i) => i.status === 'recebido').length;
      return [
        `"${d.id}"`,
        `"${getDealCategoryLabel(d.dealCategory)}"`,
        `"${formatDateBR(d.signatureDate || d.contractDate)}"`,
        `"${d.propertyTitle.replace(/"/g, '""')}"`,
        `"${getPropertyTypeLabel(d.propertyType)}"`,
        `"${d.clientName.replace(/"/g, '""')}"`,
        `"${d.clientPhone || ''}"`,
        `"${(d.developerOrAgency || '').replace(/"/g, '""')}"`,
        `"${formatDateBR(d.contractDate)}"`,
        d.propertyValue,
        `${d.grossCommissionPercent}%`,
        d.grossCommissionValue,
        `${d.brokerSplitPercent}%`,
        d.brokerNetCommission,
        d.bonusAmount,
        d.totalBrokerReceivable,
        `"${d.status === 'concluido' ? 'Concluído' : 'Em Andamento'}"`,
        d.installments.length,
        paidCount,
        `"${(d.notes || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio-comissoes-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Relatório CSV exportado com sucesso!');
  };

  // Export JSON Backup
  const handleExportJson = () => {
    if (deals.length === 0) {
      showToast('Não há contratos cadastrados para exportar backup.');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(deals, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `banco-comissoes-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup do banco de dados exportado com sucesso!');
  };

  // Handle hidden file input for JSON import
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          handleImportDeals(json);
        } else {
          showToast('Arquivo inválido: o formato precisa ser uma lista de contratos.');
        }
      } catch (err) {
        showToast('Erro ao carregar o arquivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // If verifying authentication status on first load, render loading state
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="mb-4">
          <TorreSulLogo size={44} variant="red" layout="icon-only" />
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <RefreshCw className="w-4 h-4 animate-spin text-slate-700" />
          <span>Carregando sistema...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, render dedicated minimalist Login / Registration Screen
  if (!user) {
    return (
      <LoginScreen
        expiredNotice={expiredNotice}
        onSuccess={() => {
          setExpiredNotice(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-row font-sans">
      
      {/* Hidden file input for DB restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".json"
        className="hidden"
      />

      {/* Left Sidebar for Tool Navigation */}
      <Sidebar
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        dealsCount={deals.length}
        proposalsCount={proposalsCount}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
        user={user}
        isSyncing={isSyncing}
        onSyncNow={handleManualSync}
      />

      {/* Main App Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        
        {/* 1. Ferramenta de Gestão de Comissões & Vendas (MANTIDA 100% COMO ESTÁ) */}
        {currentMode === 'comissoes' && (
          <div className="flex-1 flex flex-col">
            {/* Top Header */}
            <Header
              onOpenNewDeal={() => {
                setEditingDeal(null);
                setIsDealModalOpen(true);
              }}
              deals={deals}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onToggleSidebar={() => setIsSidebarOpenMobile(true)}
            />

            {/* Firestore Setup Warning Banner if Database not created in Firebase Console */}
            {cloudSyncWarning && (
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-amber-900 text-xs">
                <div className="max-w-7xl mx-auto flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-950">Ativação do Banco em Nuvem Pendente:</p>
                    <p className="mt-0.5 text-amber-800">{cloudSyncWarning}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Container */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 space-y-6 sm:space-y-8 flex-1 w-full">
              {activeTab === 'dashboard' ? (
                <>
                  {/* KPI Financial Metric Cards */}
                  <section aria-label="Métricas Principais">
                    <MetricCards 
                      stats={stats} 
                      monthlyForecast={monthlyForecast}
                      onFilterPending={() => setSelectedMonthFilter(null)}
                      onFilterReceived={() => setSelectedMonthFilter(null)}
                      onSelectMonth={(mKey) => setSelectedMonthFilter(mKey)}
                    />
                  </section>

                  {/* Cash Flow Forecast (Charts & Month-by-Month Inflow) */}
                  <section aria-label="Previsão de Fluxo de Caixa">
                    <CashFlowForecast
                      forecast={monthlyForecast}
                      onToggleInstallmentStatus={handleToggleInstallmentStatus}
                      onSelectMonthFilter={setSelectedMonthFilter}
                      selectedMonthFilter={selectedMonthFilter}
                    />
                  </section>

                  {/* Bonus and Campaign Rewards Tracker */}
                  <section aria-label="Bônus e Premiações">
                    <BonusTracker
                      deals={deals}
                      onToggleInstallmentStatus={handleToggleInstallmentStatus}
                    />
                  </section>

                  {/* Closed Contracts & Deal Management */}
                  <section aria-label="Lista de Contratos">
                    <ContractsList
                      deals={deals}
                      onEditDeal={(deal) => {
                        setEditingDeal(deal);
                        setIsDealModalOpen(true);
                      }}
                      onDeleteDeal={handleDeleteDeal}
                      onToggleInstallmentStatus={handleToggleInstallmentStatus}
                      onOpenNewDeal={() => {
                        setEditingDeal(null);
                        setIsDealModalOpen(true);
                      }}
                    />
                  </section>
                </>
              ) : (
                /* Dedicated Database Master View */
                <section aria-label="Banco de Dados">
                  <DatabaseView
                    deals={deals}
                    onOpenNewDeal={() => {
                      setEditingDeal(null);
                      setIsDealModalOpen(true);
                    }}
                    onEditDeal={(deal) => {
                      setEditingDeal(deal);
                      setIsDealModalOpen(true);
                    }}
                    onDeleteDeal={handleDeleteDeal}
                    onToggleInstallmentStatus={handleToggleInstallmentStatus}
                    onExportCsv={handleExportCsv}
                    onExportJson={handleExportJson}
                    onTriggerImport={() => fileInputRef.current?.click()}
                    onClearAll={handleClearAll}
                  />
                </section>
              )}
            </main>
          </div>
        )}

        {/* 2. Ferramenta de Simulador de Amortização (SAC / PRICE) */}
        {currentMode === 'amortizacao' && (
          <div className="flex-1 flex flex-col">
            <AmortizationSuite />
          </div>
        )}

        {/* 3. Ferramenta de Proposta Comercial (Back Office) */}
        {currentMode === 'proposta' && (
          <div className="flex-1 flex flex-col">
            <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsSidebarOpenMobile(true)}
                className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center gap-2 text-xs font-semibold"
                aria-label="Abrir menu"
              >
                <Menu className="w-4 h-4" />
                <span>Menu de Ferramentas</span>
              </button>
            </div>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16 flex-1 w-full">
              <ProposalBackOfficeTool onConvertToDeal={handleSaveDeal} />
            </main>
          </div>
        )}

        {/* Brand Footer */}
        <Footer />

      </div>

      {/* Toast feedback message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-medium border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* New / Edit Deal Modal */}
      <DealModal
        isOpen={isDealModalOpen}
        onClose={() => {
          setIsDealModalOpen(false);
          setEditingDeal(null);
        }}
        onSaveDeal={handleSaveDeal}
        dealToEdit={editingDeal}
      />

    </div>
  );
}
