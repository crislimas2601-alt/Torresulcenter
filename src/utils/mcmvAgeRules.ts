/**
 * Regras Oficiais da Caixa Econômica Federal e Minha Casa Minha Vida para Idade do Proponente
 * 
 * 1. Regra dos 80 anos e 6 meses (966 meses):
 *    A idade do proponente mais velho somada ao prazo de financiamento não pode ultrapassar
 *    80 anos e 6 meses no momento da última parcela.
 *    Portanto, passou dos 45,5 anos, o prazo máximo começa a diminuir dos 420 meses padrão.
 * 
 * 2. Tabela de Seguro MIP (Morte e Invalidez Permanente) Caixa:
 *    O percentual sobre o saldo devedor aumenta com a faixa etária do participante,
 *    encarecendo a parcela e reduzindo a capacidade de financiamento para a mesma renda familiar.
 */

export const CAIXA_MAX_AGE_PLUS_TERM = 80.5; // 80 anos e 6 meses
export const MCMV_MAX_TERM_MONTHS = 420; // 35 anos (teto padrão MCMV/SFH)

export interface AgeFinancingDiagnosis {
  age: number;
  maxTermMonths: number;
  maxTermYears: number;
  maxTermFormatted: string;
  isLimitedByAge: boolean;
  termMonthsLost: number;
  yearsLost: number;
  mipRateMonthlyPercent: number;
  mipRateFormatted: string;
  estimatedMinIncomeForLoan: number;
  capacityReductionPercent: number;
  warningLevel: 'none' | 'moderate' | 'high';
  warningMessage: string;
  brokerTips: string[];
}

/**
 * Calcula o prazo máximo permitido pela regra dos 80 anos e 6 meses da Caixa
 */
export function calculateMaxTermForAge(age: number): {
  maxTermMonths: number;
  maxTermYears: number;
  maxTermFormatted: string;
  isLimitedByAge: boolean;
  termMonthsLost: number;
  yearsLost: number;
} {
  const safeAge = Math.max(18, Math.min(80, age || 30));
  const remainingYears = Math.max(0.5, CAIXA_MAX_AGE_PLUS_TERM - safeAge);
  const rawMaxMonths = Math.floor(remainingYears * 12);
  const maxTermMonths = Math.min(MCMV_MAX_TERM_MONTHS, Math.max(12, rawMaxMonths));
  
  const isLimitedByAge = maxTermMonths < MCMV_MAX_TERM_MONTHS;
  const termMonthsLost = Math.max(0, MCMV_MAX_TERM_MONTHS - maxTermMonths);
  const yearsLost = Math.round((termMonthsLost / 12) * 10) / 10;
  
  const fullYears = Math.floor(maxTermMonths / 12);
  const remainingMonths = maxTermMonths % 12;
  const maxTermFormatted = remainingMonths > 0 
    ? `${fullYears} anos e ${remainingMonths} meses (${maxTermMonths} meses)` 
    : `${fullYears} anos (${maxTermMonths} meses)`;

  return {
    maxTermMonths,
    maxTermYears: Math.round((maxTermMonths / 12) * 10) / 10,
    maxTermFormatted,
    isLimitedByAge,
    termMonthsLost,
    yearsLost,
  };
}

/**
 * Retorna a alíquota estimada do seguro habitacional MIP Caixa conforme faixa etária
 */
export function getMIPInsuranceRateMonthly(age: number): number {
  const a = Math.max(18, Math.min(80, age || 30));
  if (a <= 30) return 0.0175;
  if (a <= 40) return 0.0175 + (a - 30) * ((0.0260 - 0.0175) / 10);
  if (a <= 50) return 0.0260 + (a - 40) * ((0.0520 - 0.0260) / 10);
  if (a <= 55) return 0.0520 + (a - 50) * ((0.0780 - 0.0520) / 5); // At 53.6: ~0.0644% (matches Caixa R$ 176,02 on 273k)
  if (a <= 60) return 0.0780 + (a - 55) * ((0.1450 - 0.0780) / 5);
  if (a <= 65) return 0.1450 + (a - 60) * ((0.2850 - 0.1450) / 5);
  if (a <= 70) return 0.2850 + (a - 65) * ((0.4800 - 0.2850) / 5);
  return 0.4800 + (a - 70) * ((0.8500 - 0.4800) / 10);
}

/**
 * Diagnóstico completo do impacto da idade no financiamento Caixa / MCMV
 */
export function getAgeFinancingDiagnosis(
  age: number,
  financedAmount: number = 200000,
  annualInterestRate: number = 7.66,
  system: 'SAC' | 'PRICE' = 'SAC'
): AgeFinancingDiagnosis {
  const safeAge = Math.max(18, Math.min(80, age || 32));
  const termInfo = calculateMaxTermForAge(safeAge);
  const mipRate = getMIPInsuranceRateMonthly(safeAge);
  const standardMIP = getMIPInsuranceRateMonthly(30); // Base de comparação (jovem)

  // Cálculo da parcela inicial aproximada para cálculo de renda mínima
  const monthlyRate = (annualInterestRate / 100) / 12;
  const actualMonths = termInfo.maxTermMonths;

  let firstInstallment = 0;
  if (system === 'SAC') {
    const amort = financedAmount / actualMonths;
    const interest = financedAmount * monthlyRate;
    const mipCost = financedAmount * (mipRate / 100);
    const admin = 25;
    firstInstallment = amort + interest + mipCost + admin;
  } else {
    const factor = Math.pow(1 + monthlyRate, actualMonths);
    const pmt = financedAmount * ((monthlyRate * factor) / (factor - 1));
    const mipCost = financedAmount * (mipRate / 100);
    firstInstallment = pmt + mipCost + 25;
  }

  // Renda mínima necessária (comprometimento máximo de 30% da renda na Caixa)
  const estimatedMinIncomeForLoan = firstInstallment > 0 ? firstInstallment / 0.30 : 0;

  // Comparação de capacidade com proponente jovem (420 meses e menor MIP)
  let standardFirstInstallment = 0;
  if (system === 'SAC') {
    const amort30 = financedAmount / 420;
    const interest30 = financedAmount * monthlyRate;
    const mipCost30 = financedAmount * (standardMIP / 100);
    standardFirstInstallment = amort30 + interest30 + mipCost30 + 25;
  } else {
    const factor30 = Math.pow(1 + monthlyRate, 420);
    const pmt30 = financedAmount * ((monthlyRate * factor30) / (factor30 - 1));
    const mipCost30 = financedAmount * (standardMIP / 100);
    standardFirstInstallment = pmt30 + mipCost30 + 25;
  }

  // Redução na capacidade de financiamento para a mesma renda
  const capacityRatio = standardFirstInstallment > 0 ? (standardFirstInstallment / firstInstallment) : 1;
  const capacityReductionPercent = Math.max(0, Math.round((1 - capacityRatio) * 100));

  let warningLevel: 'none' | 'moderate' | 'high' = 'none';
  let warningMessage = 'Idade dentro do prazo máximo integral de 35 anos (420 meses) na Caixa.';

  if (safeAge >= 60) {
    warningLevel = 'high';
    warningMessage = `Atenção Crítica: Aos ${safeAge} anos, a regra da Caixa (80,5 anos) limita o prazo a apenas ${termInfo.maxTermFormatted}. A capacidade de financiamento cai cerca de ${capacityReductionPercent}% devido ao prazo curto e seguro MIP elevado.`;
  } else if (safeAge >= 50) {
    warningLevel = 'moderate';
    warningMessage = `Atenção: Aos ${safeAge} anos, a regra da Caixa (80,5 anos) reduz o prazo máximo de 420 para ${termInfo.maxTermFormatted}. Isso reduz a capacidade de financiamento em aproximadamente ${capacityReductionPercent}%.`;
  } else if (safeAge > 45) {
    warningLevel = 'moderate';
    warningMessage = `Aos ${safeAge} anos, o prazo máximo já começa a diminuir levemente para ${termInfo.maxTermFormatted}.`;
  }

  const brokerTips: string[] = [];
  if (safeAge >= 50) {
    brokerTips.push('Composição de Renda: Se compor renda com cônjuge ou filho mais jovem, a Caixa pode ponderar o prazo pela idade do proponente com maior renda ou mais jovem.');
    brokerTips.push('Aumento de Entrada: Para viabilizar a aprovação na Caixa aos ' + safeAge + ' anos, busque aumentar o valor de entrada ou utilizar o saldo do FGTS.');
    brokerTips.push('Seguro MIP: O seguro de Morte e Invalidez Permanente é cobrado mensalmente e sobe para ' + mipRate.toFixed(4) + '% a.m. nesta faixa etária.');
  } else {
    brokerTips.push('Aproveitamento Máximo: O comprador possui idade suficiente para obter o prazo integral de 420 meses (35 anos) do MCMV/Caixa.');
  }

  return {
    age: safeAge,
    maxTermMonths: termInfo.maxTermMonths,
    maxTermYears: termInfo.maxTermYears,
    maxTermFormatted: termInfo.maxTermFormatted,
    isLimitedByAge: termInfo.isLimitedByAge,
    termMonthsLost: termInfo.termMonthsLost,
    yearsLost: termInfo.yearsLost,
    mipRateMonthlyPercent: mipRate,
    mipRateFormatted: `${mipRate.toFixed(4)}% a.m.`,
    estimatedMinIncomeForLoan,
    capacityReductionPercent,
    warningLevel,
    warningMessage,
    brokerTips,
  };
}
