import { InvestorInput, InvestorMetrics } from '../types';

export function calculateInvestorMetrics(input: InvestorInput): InvestorMetrics {
  const {
    propertyPurchasePrice,
    acquisitionClosingCostsPercent,
    renovationCost,
    furnitureCost,
    estimatedMonthlyRent,
    vacancyRatePercent,
    propertyManagementFeePercent,
    annualMaintenanceAndTaxes,
    annualAppreciationRate,
    estimatedResalePrice,
    holdingPeriodMonths,
    brokerSellingFeePercent,
    capitalGainsTaxPercent,
    holdingMonthlyCosts,
  } = input;

  // 1. Initial Investment Breakdown
  const acquisitionCosts = propertyPurchasePrice * (acquisitionClosingCostsPercent / 100);
  const renovationAndFurniture = renovationCost + furnitureCost;
  const totalInitialInvestment = propertyPurchasePrice + acquisitionCosts + renovationAndFurniture;

  // 2. Rental Metrics
  const grossAnnualRent = estimatedMonthlyRent * 12;
  const vacancyDeduction = grossAnnualRent * (vacancyRatePercent / 100);
  const effectiveAnnualRent = grossAnnualRent - vacancyDeduction;
  const managementFeeDeduction = effectiveAnnualRent * (propertyManagementFeePercent / 100);
  const netAnnualOperatingIncome = Math.max(
    0,
    effectiveAnnualRent - managementFeeDeduction - annualMaintenanceAndTaxes
  );

  const annualNetYield = totalInitialInvestment > 0 ? (netAnnualOperatingIncome / totalInitialInvestment) * 100 : 0;
  const monthlyNetYield = annualNetYield / 12;
  const annualAppreciationValue = propertyPurchasePrice * (annualAppreciationRate / 100);
  const totalAnnualReturnPercent = annualNetYield + annualAppreciationRate;
  const paybackYears = netAnnualOperatingIncome > 0 ? totalInitialInvestment / netAnnualOperatingIncome : 0;

  // 3. Flip / Resale Metrics
  const totalHoldingCosts = holdingMonthlyCosts * (holdingPeriodMonths || 1);
  const sellingFees = estimatedResalePrice * (brokerSellingFeePercent / 100);
  const totalCostBasis = totalInitialInvestment + totalHoldingCosts;
  const grossProfit = estimatedResalePrice - totalCostBasis - sellingFees;
  const taxableProfit = Math.max(0, grossProfit);
  const taxOnGains = taxableProfit * (capitalGainsTaxPercent / 100);
  const netProfit = grossProfit - taxOnGains;
  const totalROI = totalCostBasis > 0 ? (netProfit / totalCostBasis) * 100 : 0;

  const months = Math.max(1, holdingPeriodMonths);
  const monthlyTIR = totalROI > -100 ? (Math.pow(1 + Math.max(-0.99, totalROI / 100), 1 / months) - 1) * 100 : 0;
  const annualizedTIR = monthlyTIR !== 0 ? (Math.pow(1 + monthlyTIR / 100, 12) - 1) * 100 : 0;

  return {
    monthlyNetYield,
    annualNetYield,
    netAnnualOperatingIncome,
    totalAnnualReturnPercent,
    totalInitialInvestment,
    paybackYears,
    annualizedTIR,
    monthlyTIR,
    totalROI,
    netProfit,
    totalHoldingCosts,
    acquisitionCosts,
    renovationAndFurniture,
    sellingFees,
    taxOnGains,
    grossAnnualRent,
    effectiveAnnualRent,
    annualAppreciationValue,
    cdiNetAnnualRate: 10.5, // Benchmark Selic/CDI Líquido 15% IR
  };
}
