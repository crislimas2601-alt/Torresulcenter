import { LoanInput, ExtraAmortizationInput, SimulationResult, SimulationScheduleRow } from '../types';
import { getMIPInsuranceRateMonthly } from './mcmvAgeRules';

export interface MCMVBandInfo {
  id: number;
  name: string;
  defaultRate: number;
  incomeRange: string;
  minIncome: number;
  maxIncome: number;
  badgeColor: string;
}

export const MCMV_BANDS: MCMVBandInfo[] = [
  { id: 1, name: 'Faixa 1', defaultRate: 4.25, incomeRange: 'Até R$ 2.850', minIncome: 0, maxIncome: 2850, badgeColor: 'bg-zinc-100 text-zinc-800 border-zinc-200' },
  { id: 2, name: 'Faixa 2', defaultRate: 5.50, incomeRange: 'R$ 2.850 a R$ 4.700', minIncome: 2850.01, maxIncome: 4700, badgeColor: 'bg-zinc-100 text-zinc-800 border-zinc-200' },
  { id: 3, name: 'Faixa 3', defaultRate: 7.66, incomeRange: 'R$ 4.700 a R$ 8.600', minIncome: 4700.01, maxIncome: 8600, badgeColor: 'bg-zinc-100 text-zinc-800 border-zinc-200' },
  { id: 4, name: 'SBPE', defaultRate: 9.99, incomeRange: 'Acima de R$ 8.600', minIncome: 8600.01, maxIncome: 9999999, badgeColor: 'bg-zinc-100 text-zinc-800 border-zinc-200' },
];

/**
 * Identify MCMV band based on client gross monthly family income
 */
export function getMCMVBandByIncome(income: number): MCMVBandInfo {
  const safeIncome = Math.max(0, Number(income) || 0);
  if (safeIncome <= 2850) return MCMV_BANDS[0];
  if (safeIncome <= 4700) return MCMV_BANDS[1];
  if (safeIncome <= 8600) return MCMV_BANDS[2];
  return MCMV_BANDS[3];
}

export interface IncomeDiagnosis {
  income: number;
  firstInstallment: number;
  maxCommitment: number; // 30% da renda bruta
  commitmentPercent: number;
  isApproved: boolean;
  requiredIncome: number; // Renda mínima para pagar a parcela atual
  incomeGap: number; // Quanto falta na renda para aprovar
  neededDownPayment: number; // Entrada total necessária para parcela caber na renda atual
  downPaymentGap: number; // Quanto falta na entrada para fechar a conta
  band: MCMVBandInfo;
}

/**
 * Diagnoses whether the client's income fits the Caixa 30% commitment rule
 * and calculates exact gap for income or down payment to close the deal.
 */
export function calculateIncomeDiagnosis(
  loan: LoanInput,
  firstInstallment: number
): IncomeDiagnosis {
  const income = Math.max(0, Number(loan.grossIncome) || 0);
  const band = getMCMVBandByIncome(income);
  const maxCommitment = income * 0.30;
  const safeFirstInstallment = Math.max(0, Number(firstInstallment) || 0);

  const commitmentPercent = income > 0 ? (safeFirstInstallment / income) * 100 : 0;
  const isApproved = income > 0 && safeFirstInstallment <= maxCommitment + 1.0; // tolerância de R$ 1

  const requiredIncome = safeFirstInstallment > 0 ? Math.ceil(safeFirstInstallment / 0.30) : 0;
  const incomeGap = Math.max(0, requiredIncome - income);

  // Cálculo da entrada necessária para a parcela caber na renda informada
  let neededDownPayment = loan.downPayment;
  let downPaymentGap = 0;

  if (!isApproved && income > 0 && safeFirstInstallment > 0) {
    const currentFinanced = Math.max(0, loan.propertyValue - loan.downPayment);
    if (currentFinanced > 0) {
      // Proporção do financiamento que a margem suporta
      // Parcela é aproximadamente linear com o saldo financiado
      const targetRatio = Math.max(0, maxCommitment / safeFirstInstallment);
      const maxFinancedSupported = Math.floor(currentFinanced * targetRatio);
      neededDownPayment = Math.max(0, Math.min(loan.propertyValue, loan.propertyValue - maxFinancedSupported));
      downPaymentGap = Math.max(0, neededDownPayment - loan.downPayment);
    }
  }

  return {
    income,
    firstInstallment: safeFirstInstallment,
    maxCommitment,
    commitmentPercent,
    isApproved,
    requiredIncome,
    incomeGap,
    neededDownPayment,
    downPaymentGap,
    band,
  };
}

export function getMonthlyRate(annualRatePercent: number): number {
  return (annualRatePercent / 100) / 12;
}

export function calculatePriceInstallment(principal: number, monthlyRate: number, termMonths: number): number {
  if (monthlyRate === 0 || termMonths <= 0) return principal / (termMonths || 1);
  const factor = Math.pow(1 + monthlyRate, termMonths);
  return principal * ((monthlyRate * factor) / (factor - 1));
}

/**
 * Calculates instant installment elimination for a single lump-sum extra payment
 */
export function calculateInstantElimination(loan: LoanInput, extraAmount: number): {
  installmentsEliminated: number;
  interestSavedEstimate?: number;
  totalSavedEstimate?: number;
} {
  if (!extraAmount || extraAmount <= 0) {
    return { installmentsEliminated: 0, interestSavedEstimate: 0, totalSavedEstimate: 0 };
  }

  const financedAmount = Math.max(0, loan.propertyValue - loan.downPayment);
  if (financedAmount <= 0 || loan.termMonths <= 0) {
    return { installmentsEliminated: 0, interestSavedEstimate: 0, totalSavedEstimate: 0 };
  }

  const monthlyRate = getMonthlyRate(loan.annualInterestRate || 7.66);

  if (loan.system === 'SAC') {
    const monthlyAmort = financedAmount / loan.termMonths;
    const count = Math.min(loan.termMonths, Math.floor(extraAmount / (monthlyAmort || 1)));
    
    let interestSaved = 0;
    let totalSaved = 0;
    for (let k = 1; k <= count; k++) {
      const balanceAtMonth = k * monthlyAmort;
      const intAtMonth = balanceAtMonth * monthlyRate;
      interestSaved += intAtMonth;
      totalSaved += monthlyAmort + intAtMonth + (loan.monthlyAdminFee ?? 25);
    }

    return {
      installmentsEliminated: count,
      interestSavedEstimate: interestSaved,
      totalSavedEstimate: totalSaved,
    };
  } else {
    // PRICE: the last installments have the largest principal amortization
    const pmt = calculatePriceInstallment(financedAmount, monthlyRate, loan.termMonths);
    let remainingExtra = extraAmount;
    let eliminatedCount = 0;
    let interestSaved = 0;
    let totalSaved = 0;

    for (let k = 1; k <= loan.termMonths; k++) {
      const principalPart = pmt / Math.pow(1 + monthlyRate, k);
      const interestPart = pmt - principalPart;
      
      if (remainingExtra >= principalPart) {
        remainingExtra -= principalPart;
        eliminatedCount++;
        interestSaved += interestPart;
        totalSaved += pmt + (loan.monthlyAdminFee ?? 25);
      } else {
        break;
      }
    }
    return {
      installmentsEliminated: Math.min(loan.termMonths, eliminatedCount),
      interestSavedEstimate: interestSaved,
      totalSavedEstimate: totalSaved,
    };
  }
}

/**
 * Full simulation engine for mortgage amortization (Caixa MCMV & SBPE)
 */
export function runSimulation(loan: LoanInput, extra: ExtraAmortizationInput): SimulationResult {
  const financedAmount = Math.max(0, loan.propertyValue - loan.downPayment);
  const termMonths = Math.max(1, loan.termMonths || 360);
  const monthlyRate = getMonthlyRate(loan.annualInterestRate || 7.66);
  const adminFee = loan.monthlyAdminFee ?? 25;
  
  // DFI: Proteção física do imóvel (~0.0071% a.m. sobre o valor de avaliação)
  const dfiFee = (loan.propertyValue || 0) * 0.000071;

  // MIP: Seguro de vida proporcional à idade do proponente sobre o saldo devedor
  const age = loan.clientAge || 32;
  const mipRatePercent = loan.insuranceRateMonthly !== undefined && loan.insuranceRateMonthly !== 0.025
    ? loan.insuranceRateMonthly
    : getMIPInsuranceRateMonthly(age);
  const mipRate = mipRatePercent / 100;

  // 1. Standard schedule without extra payments
  const standardSchedule: SimulationScheduleRow[] = [];
  let stdBalance = financedAmount;
  let stdTotalInterest = 0;
  let stdTotalPaid = 0;

  const sacAmortization = termMonths > 0 ? financedAmount / termMonths : 0;
  const pricePmt = calculatePriceInstallment(financedAmount, monthlyRate, termMonths);

  for (let m = 1; m <= termMonths; m++) {
    if (stdBalance <= 0.01) break;

    const interest = stdBalance * monthlyRate;
    let amort = 0;
    let pmtWithoutFees = 0;

    if (loan.system === 'SAC') {
      amort = Math.min(stdBalance, sacAmortization);
      pmtWithoutFees = amort + interest;
    } else {
      pmtWithoutFees = Math.min(stdBalance + interest, pricePmt);
      amort = Math.max(0, pmtWithoutFees - interest);
    }

    const currentMIP = stdBalance * mipRate;
    // No último mês a tarifa Caixa pode ser abonada/reduzida se saldo quitado
    const currentAdmin = stdBalance > 100 ? adminFee : 0;
    const fees = currentAdmin + dfiFee + currentMIP;
    const totalPayment = pmtWithoutFees + fees;
    const endingBalance = Math.max(0, stdBalance - amort);

    standardSchedule.push({
      month: m,
      startingBalance: stdBalance,
      amortization: amort,
      interest,
      fees,
      extraAmortization: 0,
      totalPayment,
      endingBalance,
    });

    stdTotalInterest += interest;
    stdTotalPaid += totalPayment;
    stdBalance = endingBalance;
  }

  const stdInitialInstallment = standardSchedule[0]?.totalPayment || 0;
  const stdFinalInstallment = standardSchedule[standardSchedule.length - 1]?.totalPayment || 0;

  // 2. Scenario with extra amortization
  const amortSchedule: SimulationScheduleRow[] = [];
  let curBalance = financedAmount;
  let curTotalInterest = 0;
  let curTotalPaid = 0;
  let totalExtraAmortized = 0;

  let activeSacAmort = sacAmortization;
  let activePricePmt = pricePmt;
  let monthsToFinish = 0;

  for (let m = 1; m <= termMonths; m++) {
    if (curBalance <= 0.01) {
      break;
    }

    monthsToFinish = m;
    const interest = curBalance * monthlyRate;
    let regAmort = 0;
    let pmtWithoutFees = 0;

    if (loan.system === 'SAC') {
      regAmort = Math.min(curBalance, activeSacAmort);
      pmtWithoutFees = regAmort + interest;
    } else {
      pmtWithoutFees = Math.min(curBalance + interest, activePricePmt);
      regAmort = Math.max(0, pmtWithoutFees - interest);
    }

    // Determine extra payment for this month
    let extraThisMonth = 0;
    if (extra.oneTimeAmount > 0 && m === (extra.oneTimeMonth || 1)) {
      extraThisMonth += extra.oneTimeAmount;
    }
    if (extra.recurringMonthlyAmount > 0) {
      extraThisMonth += extra.recurringMonthlyAmount;
    }
    if (extra.recurringBiAnnualFGTS > 0 && m % 24 === 0) {
      extraThisMonth += extra.recurringBiAnnualFGTS;
    }

    // Don't pay more extra than remaining balance after regular amort
    extraThisMonth = Math.max(0, Math.min(curBalance - regAmort, extraThisMonth));
    totalExtraAmortized += extraThisMonth;

    const currentMIP = curBalance * mipRate;
    const currentAdmin = curBalance > 100 ? adminFee : 0;
    const fees = currentAdmin + dfiFee + currentMIP;
    const totalPayment = pmtWithoutFees + fees + extraThisMonth;
    const endingBalance = Math.max(0, curBalance - regAmort - extraThisMonth);

    amortSchedule.push({
      month: m,
      startingBalance: curBalance,
      amortization: regAmort,
      interest,
      fees,
      extraAmortization: extraThisMonth,
      totalPayment,
      endingBalance,
    });

    curTotalInterest += interest;
    curTotalPaid += totalPayment;
    curBalance = endingBalance;

    // If goal is REDUCE_INSTALLMENT, recalculate installment for remaining months
    if (extra.goalType === 'REDUCE_INSTALLMENT' && extraThisMonth > 0 && endingBalance > 0) {
      const remainingMonths = termMonths - m;
      if (remainingMonths > 0) {
        if (loan.system === 'SAC') {
          activeSacAmort = endingBalance / remainingMonths;
        } else {
          activePricePmt = calculatePriceInstallment(endingBalance, monthlyRate, remainingMonths);
        }
      }
    }
  }

  const actualMonthsToPayoff = monthsToFinish;
  const yearsToPayoff = Math.floor(actualMonthsToPayoff / 12);
  const monthsRemaining = actualMonthsToPayoff % 12;
  const monthsSaved = Math.max(0, termMonths - actualMonthsToPayoff);
  const yearsSaved = Math.floor(monthsSaved / 12);
  const installmentsEliminatedCount = extra.goalType === 'REDUCE_TERM' ? monthsSaved : 0;
  const interestSaved = Math.max(0, stdTotalInterest - curTotalInterest);
  const initialInstallmentWithAmort = amortSchedule[0]?.totalPayment || 0;

  return {
    financedAmount,
    standard: {
      totalMonths: termMonths,
      totalInterestPaid: stdTotalInterest,
      initialInstallment: stdInitialInstallment,
      finalInstallment: stdFinalInstallment,
      totalAmountPaid: stdTotalPaid,
      schedule: standardSchedule,
    },
    withAmortization: {
      yearsToPayoff,
      monthsRemaining,
      yearsSaved,
      monthsSaved,
      actualMonthsToPayoff,
      installmentsEliminatedCount,
      totalInterestPaid: curTotalInterest,
      interestSaved,
      totalAmountPaid: curTotalPaid,
      totalExtraAmortized,
      initialInstallment: initialInstallmentWithAmort,
      schedule: amortSchedule,
    },
  };
}
