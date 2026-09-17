export type PropertyType = 
  | 'apartamento'
  | 'casa'
  | 'terreno'
  | 'comercial'
  | 'lancamento'
  | 'rural'
  | 'outro';

export type DealStatus = 'em_andamento' | 'concluido' | 'distrato';

export type InstallmentStatus = 'pendente' | 'recebido' | 'atrasado';

export interface Installment {
  id: string;
  dealId: string;
  dealTitle: string;
  installmentNumber: number;
  totalInstallments: number;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  receivedDate?: string; // YYYY-MM-DD
  status: InstallmentStatus;
  isBonus?: boolean;
  notes?: string;
}

export interface ContractDeal {
  id: string;
  propertyTitle: string;
  propertyType: PropertyType;
  clientName: string;
  clientPhone?: string;
  developerOrAgency: string; // Ex: 'Construtora Cyrela', 'Imobiliária Nova', 'Autônomo'
  contractDate: string; // YYYY-MM-DD
  propertyValue: number; // VGV do imóvel em R$
  grossCommissionPercent: number; // Ex: 5 (%)
  grossCommissionValue: number; // Ex: R$ 50.000
  brokerSplitPercent: number; // Repasse pro corretor Ex: 50 (%) ou 100 (%)
  brokerNetCommission: number; // Comissão líquida do corretor
  bonusAmount: number; // Bônus ou premiação extra da construtora
  bonusDescription?: string; // Ex: 'Campanha de Aceleração / Prêmio Sinal'
  totalBrokerReceivable: number; // Comissao liquida + bonus
  installments: Installment[];
  status: DealStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyForecastItem {
  monthKey: string; // YYYY-MM
  label: string; // Ex: "Out/26"
  fullLabel: string; // Ex: "Outubro de 2026"
  projectedAmount: number; // Total a receber previsto
  receivedAmount: number; // Já pago/recebido no mês
  bonusAmount: number; // Bônus do mês
  totalVolume: number; // projected + received
  installments: Installment[];
  isCurrentMonth: boolean;
  isPastMonth: boolean;
}

export interface FinancialStats {
  totalPendingFuture: number; // O que vai entrar nos próximos meses
  avgMonthlyNextMonths: number; // Média mensal prevista nos próximos meses
  totalReceivedAllTime: number; // Histórico de comissões já no bolso
  totalBonusesAllTime: number; // Total de bônus faturados
  totalVGV: number; // Volume total de vendas intermediado
  activeContractsCount: number;
  completedContractsCount: number;
  totalContractsCount: number;
  averageCommissionPercent: number;
}

export type ViewFilterPeriod = 'todos' | 'proximos_3_meses' | 'proximos_6_meses' | 'ano_atual' | 'recebidos' | 'pendentes';

// ==========================================
// Amortization & Financial Tool Types (Torresul)
// ==========================================
export interface LoanInput {
  propertyValue: number;
  downPayment: number;
  termMonths: number;
  annualInterestRate: number;
  system: 'SAC' | 'PRICE';
  monthlyAdminFee: number;
  insuranceRateMonthly: number;
  clientAge?: number;
  grossIncome?: number;
}

export interface ExtraAmortizationInput {
  oneTimeAmount: number;
  oneTimeMonth: number;
  recurringMonthlyAmount: number;
  recurringBiAnnualFGTS: number;
  goalType: 'REDUCE_TERM' | 'REDUCE_INSTALLMENT';
}

export interface SimulationScheduleRow {
  month: number;
  startingBalance: number;
  amortization: number;
  interest: number;
  fees: number;
  extraAmortization: number;
  totalPayment: number;
  endingBalance: number;
}

export interface SimulationResult {
  financedAmount: number;
  standard: {
    totalMonths: number;
    totalInterestPaid: number;
    initialInstallment: number;
    finalInstallment: number;
    totalAmountPaid: number;
    schedule: SimulationScheduleRow[];
  };
  withAmortization: {
    yearsToPayoff: number;
    monthsRemaining: number;
    yearsSaved: number;
    monthsSaved: number;
    actualMonthsToPayoff: number;
    installmentsEliminatedCount: number;
    totalInterestPaid: number;
    interestSaved: number;
    totalAmountPaid: number;
    totalExtraAmortized: number;
    initialInstallment: number;
    schedule: SimulationScheduleRow[];
  };
}

export interface RentVsBuyInput {
  monthlyRent: number;
  rentAnnualInflation: number;
  condoAndTaxesRent: number;
  propertyPrice: number;
  downPayment: number;
  loanTermYears: number;
  annualInterestRate: number;
  propertyAnnualAppreciation: number;
  timeHorizonYears: number;
}

export interface RentVsBuyYearlyRow {
  year: number;
  monthlyRent: number;
  rentCumulativeSpent: number;
  propertyMarketValue: number;
  remainingLoanBalance: number;
  buyerNetEquity: number;
}

export interface RentVsBuyResult {
  totalRentSpent: number;
  finalPropertyValue: number;
  finalLoanBalance: number;
  finalBuyerEquity: number;
  yearlyBreakdown: RentVsBuyYearlyRow[];
}

export type InvestorStrategy = 'RENTAL' | 'FLIP';

export interface InvestorInput {
  propertyPurchasePrice: number;
  acquisitionClosingCostsPercent: number;
  renovationCost: number;
  furnitureCost: number;
  estimatedMonthlyRent: number;
  vacancyRatePercent: number;
  propertyManagementFeePercent: number;
  annualMaintenanceAndTaxes: number;
  annualAppreciationRate: number;
  estimatedResalePrice: number;
  holdingPeriodMonths: number;
  brokerSellingFeePercent: number;
  capitalGainsTaxPercent: number;
  holdingMonthlyCosts: number;
}

export interface InvestorMetrics {
  monthlyNetYield: number;
  annualNetYield: number;
  netAnnualOperatingIncome: number;
  totalAnnualReturnPercent: number;
  totalInitialInvestment: number;
  paybackYears: number;
  annualizedTIR: number;
  monthlyTIR: number;
  totalROI: number;
  netProfit: number;
  totalHoldingCosts: number;
  acquisitionCosts: number;
  renovationAndFurniture: number;
  sellingFees: number;
  taxOnGains: number;
  grossAnnualRent: number;
  effectiveAnnualRent: number;
  annualAppreciationValue: number;
  cdiNetAnnualRate: number;
}

// Active Tool Mode in Main Left Navigation
export type AppToolMode = 'comissoes' | 'amortizacao' | 'proposta';

// Simulator Sub-Tabs
export type SimulatorSubTab = 'amortizacao' | 'aluguel_vs_financiamento' | 'investidores';

// Fast Proposal Input for direct copy-paste into CRM/system
export interface FastProposalData {
  totalValue: number;
  downPayment: number;
  downPaymentParts: number; // ex: 1x, 2x, 3x
  monthlyCount: number;
  monthlyAmount: number;
  balloonCount: number;
  balloonAmount: number;
  balloonPeriodicity: 'semestral' | 'anual';
  bankFinancingAmount: number;
  keysPayment: number;
  fgtsOrExchangeAmount: number;
  notes: string;
}

// ==========================================
// Amortization Tool Types
// ==========================================
export type AmortizationSystem = 'SAC' | 'PRICE';
export type AmortizationStrategy = 'prazo' | 'parcela';
export type AmortizationExtraFrequency = 'unico' | 'mensal' | 'anual';

export interface AmortizationSimulationInput {
  financedAmount: number; // Saldo devedor ou financiamento inicial (R$)
  termMonths: number; // Prazo total em meses (ex: 360 ou 420)
  annualInterestRate: number; // Taxa de juros anual % (ex: 9.99%)
  system: AmortizationSystem; // SAC ou PRICE
  adminFee: number; // Taxa mensal administrativa (ex: R$ 25,00)
  mipDfiRate: number; // Seguro MIP/DFI mensal estimado (ex: R$ 60,00 ou % sobre saldo)
  extraAmount: number; // Valor do aporte extra (R$)
  extraStartMonth: number; // Mês inicial do aporte (ex: mês 12 ou mês 1)
  extraFrequency: AmortizationExtraFrequency; // Único, Mensal ou Anual (ex: FGTS/13º)
  strategy: AmortizationStrategy; // Reduzir Prazo ou Reduzir Parcela
}

export interface AmortizationMonthRow {
  month: number;
  originalPayment: number;
  originalInterest: number;
  originalAmortization: number;
  originalBalance: number;
  simPayment: number;
  simInterest: number;
  simAmortization: number;
  simExtra: number;
  simBalance: number;
  insuranceAndFees: number;
}

export interface AmortizationSummary {
  originalTotalPaid: number;
  originalTotalInterest: number;
  originalTermMonths: number;
  originalInitialPayment: number;
  originalLastPayment: number;
  simTotalPaid: number;
  simTotalInterest: number;
  simTermMonths: number;
  simInitialPayment: number;
  simCurrentPaymentAfterExtra: number;
  totalExtraInvested: number;
  savedInterest: number;
  totalSavings: number;
  monthsReduced: number;
  yearsReduced: number;
}

// ==========================================
// Proposal (Back Office) Types
// ==========================================
export type ProposalStatus = 'rascunho' | 'enviada' | 'analise' | 'aprovada' | 'recusada';

export interface ProposalClient {
  name: string;
  cpf: string;
  rg?: string;
  phone: string;
  email?: string;
  maritalStatus?: string;
  profession?: string;
  hasSpouse?: boolean;
  spouseName?: string;
  spouseCpf?: string;
  spouseProfession?: string;
}

export interface ProposalProperty {
  title: string;
  unit?: string;
  type: PropertyType;
  developerOrSeller: string;
  totalValue: number;
  areaM2?: number;
  parkingSpots?: number;
  address?: string;
}

export interface ProposalPaymentFlow {
  downPayment: number; // Sinal / Ato (R$)
  downPaymentDate: string;
  monthlyInstallmentsCount: number; // Qtd parcelas mensais na obra
  monthlyInstallmentAmount: number; // Valor de cada parcela
  monthlyStartDate: string;
  balloonInstallmentsCount: number; // Balões / Intermediárias
  balloonInstallmentAmount: number; // Valor de cada balão
  balloonFrequency: 'semestral' | 'anual';
  balloonStartDate: string;
  keysPayment: number; // Parcela de chaves / Habite-se
  keysDate: string;
  bankFinancingAmount: number; // Financiamento bancário
  fgtsAmount: number; // Uso de FGTS
  otherPayments: number; // Outros pagamentos
  otherPaymentsNotes?: string;
}

export interface ProposalBroker {
  name: string;
  creci: string;
  phone: string;
  agency: string;
}

export interface ProposalConditions {
  validityDays: number;
  correctionIndex: string; // Ex: INCC até as chaves, pós-chaves IPCA + 1%
  includedItems?: string; // Ex: Armários planejados na cozinha e suíte
  notes?: string;
}

export interface RealEstateProposal {
  id: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  status: ProposalStatus;
  client: ProposalClient;
  property: ProposalProperty;
  paymentFlow: ProposalPaymentFlow;
  broker: ProposalBroker;
  conditions: ProposalConditions;
}

// ==========================================
// Torresul Standard Proposal Calculator Types
// ==========================================
export interface ParcelamentoItem {
  id: string;
  title: string;
  totalSemJuros: number;
  jurosAoMes: number;
  quantidadeParcelas: number;
  dataVencimento: string; // YYYY-MM-DD
  tipoCalculo: 'price' | 'simples' | 'sem_juros';
  temJurosDiluidos: boolean;
  jurosAdimplenciaDiluido?: number;
  jurosReforcosDiluido?: number;
  valorParcelaCalculada: number;
  valorTotalComJuros: number;
}

export interface ReforcoItem {
  id: string;
  title: string;
  valor: number;
  tipoVencimento: 'data' | 'texto';
  dataVencimento?: string;
  textoVencimento?: string;
}

export interface AvalistaData {
  temAvalista: boolean;
  nome: string;
  rg?: string;
  cpf?: string;
  endereco?: string;
  estadoCivil?: string;
  email: string;
  telefone: string;
  profissao: string;
}

export interface ProposalData {
  id?: string;
  nomeCliente?: string;
  numeroUnidade?: string;
  createdAt?: string;
  valorImovel: number;
  temDesconto?: boolean;
  valorDesconto?: number;
  temAdimplencia: boolean;
  valorAdimplencia: number;
  financiamento: number;
  bancoFinanciamento?: string;
  correspondente?: string;
  fgts: number;
  subsidio: number;
  ato: number;
  parcelamentos: ParcelamentoItem[];
  reforcos: ReforcoItem[];
  avalista: AvalistaData;
  promissoria: boolean;
  ficaramMoveis: boolean;
  descricaoMoveis?: string;
  comissaoPercent: number;
  comissaoValor: number;
  comissaoManual: boolean;
  valorImovelComissao?: number;
  tipoDivisaoComissao?: '100' | '50_50' | 'personalizado';
  momentoPrimeiro50?: string;
  momentoSegundo50?: string;
  pagamentoComissao: string;
}

export interface ProposalTotals {
  totalEntradaSemJuros: number;
  totalEntradaComJuros: number;
  totalParcelamentosSemJuros: number;
  totalReforcos: number;
  totalNominal: number;
  totalNegociacao: number;
  diferencaImovel: number;
  parcelamentosRecalculados: ParcelamentoItem[];
}

