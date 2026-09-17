import { 
  AmortizationSimulationInput, 
  AmortizationMonthRow, 
  AmortizationSummary, 
  AmortizationSystem 
} from '../types';

/**
 * Calculates monthly interest rate from annual rate
 * Using nominal annual rate divided by 12 (standard Brazilian banking practice in SFH/SFI)
 */
export function getMonthlyInterestRate(annualRatePercent: number): number {
  return (annualRatePercent / 100) / 12;
}

/**
 * Calculates standard PRICE installment (without insurance or admin fees)
 */
export function calculatePriceInstallment(principal: number, monthlyRate: number, termMonths: number): number {
  if (monthlyRate === 0 || termMonths <= 0) return principal / (termMonths || 1);
  const factor = Math.pow(1 + monthlyRate, termMonths);
  return principal * ((monthlyRate * factor) / (factor - 1));
}

/**
 * Calculates full amortization simulation for SAC or PRICE with optional extra amortizations
 */
export function runAmortizationSimulation(input: AmortizationSimulationInput): {
  schedule: AmortizationMonthRow[];
  summary: AmortizationSummary;
} {
  const {
    financedAmount,
    termMonths,
    annualInterestRate,
    system,
    adminFee,
    mipDfiRate,
    extraAmount,
    extraStartMonth,
    extraFrequency,
    strategy
  } = input;

  const monthlyRate = getMonthlyInterestRate(annualInterestRate);

  // 1. Calculate Baseline (Original scenario without extra amortization)
  const origSchedule: {
    payment: number;
    interest: number;
    amortization: number;
    balance: number;
    fees: number;
  }[] = [];

  let origBalance = financedAmount;
  let origTotalInterest = 0;
  let origTotalPaid = 0;
  const origSacAmort = financedAmount / termMonths;
  const origPricePmt = calculatePriceInstallment(financedAmount, monthlyRate, termMonths);

  for (let m = 1; m <= termMonths; m++) {
    if (origBalance <= 0.01) break;

    const interest = origBalance * monthlyRate;
    let amort = 0;
    let pmt = 0;

    if (system === 'SAC') {
      amort = Math.min(origBalance, origSacAmort);
      pmt = amort + interest;
    } else {
      // PRICE
      pmt = Math.min(origBalance + interest, origPricePmt);
      amort = Math.max(0, pmt - interest);
    }

    const fees = adminFee + (origBalance * (mipDfiRate / 100));
    origBalance = Math.max(0, origBalance - amort);
    origTotalInterest += interest;
    origTotalPaid += pmt + fees;

    origSchedule.push({
      payment: pmt + fees,
      interest,
      amortization: amort,
      balance: origBalance,
      fees,
    });
  }

  const originalInitialPayment = origSchedule[0]?.payment || 0;
  const originalLastPayment = origSchedule[origSchedule.length - 1]?.payment || 0;

  // 2. Calculate Simulation Scenario (With extra amortization)
  const simSchedule: AmortizationMonthRow[] = [];
  let simBalance = financedAmount;
  let simTotalInterest = 0;
  let simTotalPaid = 0;
  let totalExtraInvested = 0;
  let simRemainingMonths = termMonths;
  let currentSacAmort = financedAmount / termMonths;
  let currentPricePmt = origPricePmt;

  let currentPaymentAfterExtra = 0;

  for (let m = 1; m <= termMonths; m++) {
    if (simBalance <= 0.01) break;

    // Check if extra amortization applies this month
    let extra = 0;
    if (extraAmount > 0 && m >= extraStartMonth) {
      if (extraFrequency === 'unico' && m === extraStartMonth) {
        extra = extraAmount;
      } else if (extraFrequency === 'mensal') {
        extra = extraAmount;
      } else if (extraFrequency === 'anual' && (m - extraStartMonth) % 12 === 0) {
        extra = extraAmount;
      }
    }

    const interest = simBalance * monthlyRate;
    let normalAmort = 0;
    let normalPmt = 0;

    if (system === 'SAC') {
      normalAmort = Math.min(simBalance, currentSacAmort);
      normalPmt = normalAmort + interest;
    } else {
      // PRICE
      normalPmt = Math.min(simBalance + interest, currentPricePmt);
      normalAmort = Math.max(0, normalPmt - interest);
    }

    const fees = adminFee + (simBalance * (mipDfiRate / 100));

    // Cap extra amortization to not exceed remaining balance after normal amortization
    const balanceAfterNormalAmort = Math.max(0, simBalance - normalAmort);
    const actualExtra = Math.min(balanceAfterNormalAmort, extra);

    simBalance = Math.max(0, balanceAfterNormalAmort - actualExtra);
    totalExtraInvested += actualExtra;
    simTotalInterest += interest;
    simTotalPaid += normalPmt + fees + actualExtra;

    simRemainingMonths = Math.max(0, simRemainingMonths - 1);

    // Apply Strategy Adjustment for future months
    if (actualExtra > 0 && simBalance > 0.01) {
      if (strategy === 'prazo') {
        // Reduzir Prazo: Mantém amortização alta para abater parcelas do final
        if (system === 'PRICE') {
          // Presta-se a manter a parcela original alta
          currentPricePmt = origPricePmt;
        } else {
          // SAC: mantém amortização original
          currentSacAmort = origSacAmort;
        }
      } else {
        // Reduzir Parcela: Recalcula o valor da parcela distribuindo o novo saldo nos meses restantes
        if (simRemainingMonths > 0) {
          if (system === 'SAC') {
            currentSacAmort = simBalance / simRemainingMonths;
          } else {
            currentPricePmt = calculatePriceInstallment(simBalance, monthlyRate, simRemainingMonths);
          }
        }
      }
    }

    const totalMonthPayment = normalPmt + fees + actualExtra;
    if (actualExtra > 0 && currentPaymentAfterExtra === 0) {
      currentPaymentAfterExtra = normalPmt + fees;
    }

    const origItem = origSchedule[m - 1];

    simSchedule.push({
      month: m,
      originalPayment: origItem ? origItem.payment : 0,
      originalInterest: origItem ? origItem.interest : 0,
      originalAmortization: origItem ? origItem.amortization : 0,
      originalBalance: origItem ? origItem.balance : 0,
      simPayment: totalMonthPayment,
      simInterest: interest,
      simAmortization: normalAmort,
      simExtra: actualExtra,
      simBalance,
      insuranceAndFees: fees,
    });
  }

  const simTermMonths = simSchedule.length;
  const monthsReduced = Math.max(0, origSchedule.length - simTermMonths);
  const yearsReduced = Math.round((monthsReduced / 12) * 10) / 10;
  const savedInterest = Math.max(0, origTotalInterest - simTotalInterest);
  const totalSavings = Math.max(0, origTotalPaid - simTotalPaid);

  const summary: AmortizationSummary = {
    originalTotalPaid: Math.round(origTotalPaid * 100) / 100,
    originalTotalInterest: Math.round(origTotalInterest * 100) / 100,
    originalTermMonths: origSchedule.length,
    originalInitialPayment: Math.round(originalInitialPayment * 100) / 100,
    originalLastPayment: Math.round(originalLastPayment * 100) / 100,
    simTotalPaid: Math.round(simTotalPaid * 100) / 100,
    simTotalInterest: Math.round(simTotalInterest * 100) / 100,
    simTermMonths,
    simInitialPayment: Math.round((simSchedule[0]?.simPayment || 0) * 100) / 100,
    simCurrentPaymentAfterExtra: Math.round((currentPaymentAfterExtra || simSchedule[0]?.simPayment || 0) * 100) / 100,
    totalExtraInvested: Math.round(totalExtraInvested * 100) / 100,
    savedInterest: Math.round(savedInterest * 100) / 100,
    totalSavings: Math.round(totalSavings * 100) / 100,
    monthsReduced,
    yearsReduced,
  };

  return { schedule: simSchedule, summary };
}
