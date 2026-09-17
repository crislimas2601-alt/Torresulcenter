import React, { useState, useMemo, useEffect } from 'react';
import { LoanInput, ExtraAmortizationInput } from '../types';
import { runSimulation } from '../utils/financialCalculations';
import { AmortizationHeader } from './AmortizationHeader';
import { ContractForm } from './ContractForm';
import { AmortizationControls } from './AmortizationControls';
import { FinancialResultHero } from './FinancialResultHero';
import { ClientModeView } from './ClientModeView';
import { ClientSummaryCards } from './ClientSummaryCards';
import { ComparisonView } from './ComparisonView';
import { VisualDebtStory } from './VisualDebtStory';
import { InstallmentEliminationVisualizer } from './InstallmentEliminationVisualizer';
import { RentVsBuyCalculator } from './RentVsBuyCalculator';
import { InvestorCalculator } from './InvestorCalculator';
import { EducationalModal } from './EducationalModal';
import { ShareWhatsAppModal } from './ShareWhatsAppModal';
import { ClientTVPresentationView } from './ClientTVPresentationView';
import { DesktopInstallModal } from './DesktopInstallModal';
import { OfflineIndicator } from './OfflineIndicator';
import { TorresulLogo } from './TorresulLogo';
import { usePWAInstall } from '../hooks/usePWAInstall';

const DEFAULT_LOAN: LoanInput = {
  propertyValue: 350000,
  downPayment: 70000,
  termMonths: 360,
  annualInterestRate: 7.66, // Faixa 3 MCMV
  system: 'SAC',
  monthlyAdminFee: 25,
  insuranceRateMonthly: 0.025,
  clientAge: 35,
};

const DEFAULT_EXTRA: ExtraAmortizationInput = {
  oneTimeAmount: 5000,
  oneTimeMonth: 1,
  recurringMonthlyAmount: 200,
  recurringBiAnnualFGTS: 0,
  goalType: 'REDUCE_TERM',
};

export const AmortizationSuite: React.FC = () => {
  // PWA & Iframe Installation Detection
  const { isInstallable, install, isInIframe, openInNewTab } = usePWAInstall();

  // Load from localStorage or defaults, sanitizing any corrupted numeric values
  const [loan, setLoan] = useState<LoanInput>(() => {
    try {
      const savedStr = localStorage.getItem('torresul_loan_input_v1');
      if (savedStr) {
        const saved = JSON.parse(savedStr);
        let prop = Number(saved.propertyValue);
        // If property was corrupted by prior input bug (e.g. 35.000.000 or negative)
        if (isNaN(prop) || prop <= 0 || prop > 5000000) {
          prop = 350000;
        }
        let down = Number(saved.downPayment);
        if (isNaN(down) || down < 0 || down > prop || down > 5000000) {
          down = Math.round(prop * 0.20);
        }
        return {
          ...DEFAULT_LOAN,
          ...saved,
          propertyValue: prop,
          downPayment: down,
          termMonths: Number(saved.termMonths) > 0 ? Number(saved.termMonths) : 360,
          annualInterestRate: Number(saved.annualInterestRate) > 0 ? Number(saved.annualInterestRate) : 7.66,
          clientAge: Number(saved.clientAge) > 0 ? Number(saved.clientAge) : 35,
        };
      }
      return DEFAULT_LOAN;
    } catch {
      return DEFAULT_LOAN;
    }
  });

  const [extra, setExtra] = useState<ExtraAmortizationInput>(() => {
    try {
      const saved = localStorage.getItem('torresul_extra_amort_v1');
      return saved ? JSON.parse(saved) : DEFAULT_EXTRA;
    } catch {
      return DEFAULT_EXTRA;
    }
  });

  // UI Modes & Modals
  const [userMode, setUserMode] = useState<'broker' | 'client'>('broker');
  const [activeFeatureTab, setActiveFeatureTab] = useState<'amortizacao' | 'aluguel_vs_compra' | 'investidores'>('amortizacao');
  const [showEducationalModal, setShowEducationalModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTVMode, setShowTVMode] = useState(false);
  const [showDesktopModal, setShowDesktopModal] = useState(false);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem('torresul_loan_input_v1', JSON.stringify(loan));
    } catch (e) {
      console.warn('Storage unavailable', e);
    }
  }, [loan]);

  useEffect(() => {
    try {
      localStorage.setItem('torresul_extra_amort_v1', JSON.stringify(extra));
    } catch (e) {
      console.warn('Storage unavailable', e);
    }
  }, [extra]);

  // Core Financial Simulation Engine
  const result = useMemo(() => {
    return runSimulation(loan, extra);
  }, [loan, extra]);

  const handleResetToDefaults = () => {
    setLoan(DEFAULT_LOAN);
    setExtra(DEFAULT_EXTRA);
  };

  const handleApplyExampleStrategy = () => {
    setExtra({
      oneTimeAmount: 5000,
      oneTimeMonth: 1,
      recurringMonthlyAmount: 300,
      recurringBiAnnualFGTS: 5000,
      goalType: 'REDUCE_TERM',
    });
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Offline Alert Indicator */}
      <OfflineIndicator />

      {/* Main Header & Brand Navigation */}
      <AmortizationHeader
        userMode={userMode}
        onToggleUserMode={setUserMode}
        activeFeatureTab={activeFeatureTab}
        onChangeFeatureTab={setActiveFeatureTab}
        onOpenEducationalModal={() => setShowEducationalModal(true)}
        onOpenShareModal={() => setShowShareModal(true)}
        onOpenTVMode={() => setShowTVMode(true)}
        onResetToDefaults={handleResetToDefaults}
        isInstallable={isInstallable}
        onInstall={install}
        onOpenDesktopModal={() => setShowDesktopModal(true)}
        isInIframe={isInIframe}
        onOpenNewTab={openInNewTab}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ABA 1: AMORTIZAÇÃO ACELERADA */}
        {activeFeatureTab === 'amortizacao' && (
          <>
            {userMode === 'client' ? (
              /* MODO CLIENTE: FOCO EM DECISÃO, SIMPLICIDADE E VISUAL LIMPO */
              <ClientModeView
                loan={loan}
                extra={extra}
                result={result}
                onChangeLoan={setLoan}
                onChangeExtra={setExtra}
                onOpenShareModal={() => setShowShareModal(true)}
                onSwitchToBrokerMode={() => setUserMode('broker')}
              />
            ) : (
              /* MODO CORRETOR: CONTROLE COMPLETO, VARIÁVEIS BANCÁRIAS E CRONOGRAMA */
              <div className="space-y-6">
                {/* 1. HERO PRINCIPAL */}
                <FinancialResultHero
                  loan={loan}
                  extra={extra}
                  result={result}
                  userMode="broker"
                />

                {/* 2. RESUMO EM CARDS */}
                <ClientSummaryCards
                  loan={loan}
                  extra={extra}
                  result={result}
                />

                {/* 3. GRID PRINCIPAL: DADOS DO FINANCIAMENTO & ESTRATÉGIA DE AMORTIZAÇÃO */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <ContractForm
                    loan={loan}
                    onChange={setLoan}
                    result={result}
                  />

                  <AmortizationControls
                    extra={extra}
                    loan={loan}
                    result={result}
                    onChange={setExtra}
                  />
                </div>

                {/* 4. COMPARATIVO LADO A LADO */}
                <ComparisonView
                  loan={loan}
                  extra={extra}
                  result={result}
                />

                {/* 5. HISTÓRIA VISUAL DO TEMPO E DA DÍVIDA */}
                <VisualDebtStory
                  loan={loan}
                  extra={extra}
                  result={result}
                />

                {/* 6. VISUALIZADOR DE BLOCOS DE PARCELAS ELIMINADAS */}
                <InstallmentEliminationVisualizer
                  loan={loan}
                  extra={extra}
                  result={result}
                />
              </div>
            )}
          </>
        )}

        {/* ABA 2: COMPARADOR ALUGAR VS. COMPRAR */}
        {activeFeatureTab === 'aluguel_vs_compra' && (
          <RentVsBuyCalculator
            defaultPropertyPrice={loan.propertyValue}
            defaultDownPayment={loan.downPayment}
          />
        )}

        {/* ABA 3: MÓDULO INVESTIDOR (YIELD DE LOCAÇÃO E FLIP) */}
        {activeFeatureTab === 'investidores' && (
          <InvestorCalculator />
        )}
      </main>

      {/* Footer Oficial Torresul */}
      <footer className="bg-white border-t border-zinc-200 py-8 px-4 sm:px-6 text-xs text-zinc-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TorresulLogo variant="red" size="sm" />
            <div className="text-[11px] text-zinc-600">
              <span className="font-semibold text-zinc-800">Torresul Imobiliária Blumenau</span> • Líder em Financiamento Caixa MCMV em SC
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>createdbycristianlimas</span>
            <span>•</span>
            <span>Simulador Habitacional SAC / Price</span>
          </div>
        </div>
      </footer>

      {/* MODAIS & APRESENTAÇÕES */}
      <EducationalModal
        isOpen={showEducationalModal}
        onClose={() => setShowEducationalModal(false)}
        onApplyExampleStrategy={handleApplyExampleStrategy}
      />

      <ShareWhatsAppModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        loan={loan}
        extra={extra}
        result={result}
      />

      {showTVMode && (
        <ClientTVPresentationView
          loan={loan}
          extra={extra}
          result={result}
          onExit={() => setShowTVMode(false)}
        />
      )}

      <DesktopInstallModal
        isOpen={showDesktopModal}
        onClose={() => setShowDesktopModal(false)}
        onOpenNewTab={openInNewTab}
        isInstallable={isInstallable}
        onInstall={install}
      />
    </div>
  );
};
