import { RentVsBuyInput, RentVsBuyResult, RentVsBuyYearlyRow } from '../types';

export function calculateRentVsBuy(input: RentVsBuyInput): RentVsBuyResult {
  const {
    monthlyRent,
    rentAnnualInflation,
    condoAndTaxesRent,
    propertyPrice,
    downPayment,
    loanTermYears,
    annualInterestRate,
    propertyAnnualAppreciation,
    timeHorizonYears,
  } = input;

  const financedAmount = Math.max(0, propertyPrice - downPayment);
  const totalLoanMonths = loanTermYears * 12;
  const monthlyInterestRate = (annualInterestRate / 100) / 12;
  const monthlySacAmort = totalLoanMonths > 0 ? financedAmount / totalLoanMonths : 0;

  let cumulativeRent = 0;
  let curMonthlyRent = monthlyRent;
  const yearlyBreakdown: RentVsBuyYearlyRow[] = [];

  for (let year = 1; year <= timeHorizonYears; year++) {
    // 12 months in this year
    const yearlyRentCost = (curMonthlyRent + condoAndTaxesRent) * 12;
    cumulativeRent += yearlyRentCost;

    // Property market value with compound appreciation
    const propertyMarketValue = propertyPrice * Math.pow(1 + propertyAnnualAppreciation / 100, year);

    // Remaining loan balance (using SAC for conservatism)
    const elapsedMonths = Math.min(totalLoanMonths, year * 12);
    const paidAmortization = elapsedMonths * monthlySacAmort;
    const remainingLoanBalance = Math.max(0, financedAmount - paidAmortization);

    // Equity = Property Value - Remaining Loan
    const buyerNetEquity = Math.max(0, propertyMarketValue - remainingLoanBalance);

    yearlyBreakdown.push({
      year,
      monthlyRent: curMonthlyRent,
      rentCumulativeSpent: cumulativeRent,
      propertyMarketValue,
      remainingLoanBalance,
      buyerNetEquity,
    });

    // Advance rent inflation for next year
    curMonthlyRent *= (1 + rentAnnualInflation / 100);
  }

  const lastRow = yearlyBreakdown[yearlyBreakdown.length - 1] || {
    propertyMarketValue: propertyPrice,
    remainingLoanBalance: financedAmount,
    buyerNetEquity: downPayment,
    rentCumulativeSpent: cumulativeRent,
  };

  return {
    totalRentSpent: cumulativeRent,
    finalPropertyValue: lastRow.propertyMarketValue,
    finalLoanBalance: lastRow.remainingLoanBalance,
    finalBuyerEquity: lastRow.buyerNetEquity,
    yearlyBreakdown,
  };
}
