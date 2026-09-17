import { LoanInput, ExtraAmortizationInput, SimulationResult, SimulationScheduleRow } from '../types';

export const MCMV_BANDS = [
  { id: 1, name: 'Faixa 1', defaultRate: 4.25, incomeRange: 'Até R$ 2.640' },
  { id: 2, name: 'Faixa 2', defaultRate: 5.50, incomeRange: 'R$ 2.640 a R$ 4.400' },
  { id: 3, name: 'Faixa 3', defaultRate: 7.66, incomeRange: 'R$ 4.400 a R$ 8.000' },
  { id: 4, name: 'SBPE', defaultRate: 9.99, incomeRange: 'Acima de R$ 8.000' },
];

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
export function calculateInstantElimination(loan: LoanInput, extraAmount: number): { installmentsEliminated: number } {
  if (!extraAmount || extraAmount <= 0) {
    return { installmentsEliminated: 0 };
  }

  const financedAmount = Math.max(0, loan.propertyValue - loan.downPayment);
  if (financedAmount <= 0 || loan.termMonths <= 0) {
    return { installmentsEliminated: 0 };
  }

  if (loan.system === 'SAC') {
    const monthlyAmort = financedAmount / loan.termMonths;
    const count = Math.min(loan.termMonths, Math.floor(extraAmount / (monthlyAmort || 1)));
    return { installmentsEliminated: count };
  } else {
    // PRICE: the last installments have the largest principal amortization, roughly equal to the PMT discounted
    const monthlyRate = getMonthlyRate(loan.annualInterestRate);
    const pmt = calculatePriceInstallment(financedAmount, monthlyRate, loan.termMonths);
    // Simulating from the end:
    let remainingExtra = extraAmount;
    let eliminatedCount = 0;
    // For Price, each month k from the end has principal = pmt / (1+r)^(term - k + 1)
    for (let k = 1; k <= loan.termMonths; k++) {
      const principalPart = pmt / Math.pow(1 + monthlyRate, k);
      if (remainingExtra >= principalPart) {
        remainingExtra -= principalPart;
        eliminatedCount++;
      } else {
        break;
      }
    }
    return { installmentsEliminated: Math.min(loan.termMonths, eliminatedCount) };
  }
}

/**
 * Full simulation engine for mortgage amortization
 */
export function runSimulation(loan: LoanInput, extra: ExtraAmortizationInput): SimulationResult {
  const financedAmount = Math.max(0, loan.propertyValue - loan.downPayment);
  const termMonths = loan.termMonths || 360;
  const monthlyRate = getMonthlyRate(loan.annualInterestRate || 5.5);
  const adminFee = loan.monthlyAdminFee ?? 25;
  const insuranceRate = (loan.insuranceRateMonthly ?? 0.025) / 100;

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

    const fees = adminFee + (stdBalance * insuranceRate);
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

    const fees = adminFee + (curBalance * insuranceRate);
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
