/**
 * Format number into Brazilian Real (R$)
 */
export function formatCurrency(value: number): string {
  if (isNaN(value) || value === null || value === undefined) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Safely parse Brazilian currency string into float number
 * Handles:
 * - "350.000,00" -> 350000
 * - "76.847,87" -> 76847.87
 * - "350000,00" -> 350000
 * - "350.000" -> 350000
 * - "350000" -> 350000
 * - "R$ 350.000,00" -> 350000
 * - "76847.87" -> 76847.87
 */
export function parseBRLInput(valueStr: string | number): number {
  if (typeof valueStr === 'number') return isNaN(valueStr) ? 0 : valueStr;
  if (!valueStr) return 0;
  
  const clean = String(valueStr).trim().replace(/^R\$\s?/, '');
  if (!clean) return 0;

  // Case 1: Brazilian decimal comma present (e.g. "350.000,00" or "76.847,87")
  if (clean.includes(',')) {
    const parts = clean.split(',');
    const integerDigits = parts[0].replace(/\D/g, '');
    const decimalDigits = (parts[1] || '').replace(/\D/g, '').slice(0, 2);
    const parsed = parseFloat(`${integerDigits || '0'}.${decimalDigits || '0'}`);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Case 2: Dot as decimal separator (e.g. "76847.87")
  if (clean.includes('.') && /^\d+\.\d{1,2}$/.test(clean)) {
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Case 3: Thousands dots or raw integer (e.g. "350.000" or "350000")
  const onlyDigits = clean.replace(/\D/g, '');
  return Number(onlyDigits) || 0;
}

/**
 * Format a number for input display in pt-BR
 */
export function formatBRLNumber(value: number): string {
  if (value === null || value === undefined || isNaN(value) || value <= 0) return '';
  const hasDecimals = value % 1 !== 0;
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Format compact currency for charts (e.g., R$ 15k, R$ 1,2M)
 */
export function formatCurrencyCompact(value: number): string {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(0)}k`;
  }
  return formatCurrency(value);
}

/**
 * Format date string YYYY-MM-DD to DD/MM/YYYY
 */
export function formatDateBR(dateStr?: any): string {
  if (!dateStr || typeof dateStr !== 'string') return '-';
  try {
    const cleanStr = dateStr.trim().slice(0, 10);
    const parts = cleanStr.split('-');
    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return cleanStr;
  } catch {
    return String(dateStr || '-');
  }
}

/**
 * Format month key YYYY-MM to readable name e.g. "Out/26"
 */
export function formatMonthLabel(monthKey?: any): string {
  if (!monthKey || typeof monthKey !== 'string') return '-';
  try {
    const parts = monthKey.trim().split('-');
    if (parts.length < 2) return monthKey;
    const [year, month] = parts;
    const monthNamesShort = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    const mIndex = parseInt(month, 10) - 1;
    const shortYear = (year || '').slice(-2);
    return `${monthNamesShort[mIndex] || month}/${shortYear}`;
  } catch {
    return String(monthKey || '-');
  }
}

/**
 * Format month key YYYY-MM to full name e.g. "Outubro de 2026"
 */
export function formatMonthFullLabel(monthKey?: any): string {
  if (!monthKey || typeof monthKey !== 'string') return '-';
  try {
    const parts = monthKey.trim().split('-');
    if (parts.length < 2) return monthKey;
    const [year, month] = parts;
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const mIndex = parseInt(month, 10) - 1;
    return `${monthNames[mIndex] || month} de ${year}`;
  } catch {
    return String(monthKey || '-');
  }
}

/**
 * Deal category human label
 */
export function getDealCategoryLabel(category?: string): string {
  if (category === 'agenciamento') {
    return 'Agenciamento';
  }
  return 'Venda Direta';
}

/**
 * Calculate due dates for N installments starting from a date
 */
export function generateInstallmentDates(startDate: string, count: number, intervalDays: number = 30): string[] {
  const dates: string[] = [];
  let base: Date;
  try {
    const cleanDate = typeof startDate === 'string' && startDate.includes('-') ? startDate.slice(0, 10) : new Date().toISOString().slice(0, 10);
    base = new Date(cleanDate + 'T12:00:00');
    if (isNaN(base.getTime())) {
      base = new Date();
    }
  } catch {
    base = new Date();
  }
  
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setMonth(d.getMonth() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  
  return dates;
}

/**
 * Property type human label
 */
export function getPropertyTypeLabel(type: string): string {
  const map: Record<string, string> = {
    apartamento: 'Apartamento',
    casa: 'Casa / Sobrado',
    terreno: 'Terreno / Lote',
    comercial: 'Sala / Comercial',
    lancamento: 'Lançamento na Planta',
    rural: 'Chácara / Rural',
    outro: 'Outro Imóvel',
  };
  return map[type] || 'Imóvel';
}

/**
 * Formats time in months to a readable years and months string
 */
export function formatTimeSaved(months: number): string {
  if (months <= 0) return '0 meses';
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (years === 0) return `${remMonths} ${remMonths === 1 ? 'mês' : 'meses'}`;
  if (remMonths === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remMonths} ${remMonths === 1 ? 'mês' : 'meses'}`;
}

/**
 * Generates a formatted WhatsApp proposal message for mortgage amortization
 */
export function generateWhatsAppMessage(
  clientName: string,
  loan: {
    propertyValue: number;
    downPayment: number;
    termMonths: number;
    annualInterestRate: number;
    system: string;
  },
  extra: {
    oneTimeAmount: number;
    recurringMonthlyAmount: number;
    recurringBiAnnualFGTS: number;
    goalType: string;
  },
  result: {
    financedAmount: number;
    standard: {
      initialInstallment: number;
      totalInterestPaid: number;
      totalAmountPaid: number;
    };
    withAmortization: {
      yearsToPayoff: number;
      monthsRemaining: number;
      installmentsEliminatedCount: number;
      interestSaved: number;
      initialInstallment: number;
    };
  }
): string {
  const nameGreeting = clientName && clientName.trim() ? `Olá, *${clientName.trim()}*!` : 'Olá!';
  const originalYears = Math.floor(loan.termMonths / 12);
  const payoffYears = result.withAmortization.yearsToPayoff;
  const payoffMonths = result.withAmortization.monthsRemaining;
  const eliminated = result.withAmortization.installmentsEliminatedCount;

  return `🏢 *SIMULAÇÃO DE QUITAÇÃO ACELERADA - TORRESUL IMOBILIÁRIA*

${nameGreeting} Segue o demonstrativo da sua simulação habitacional:

💰 *DADOS DO FINANCIAMENTO (CAIXA / MCMV)*
• Valor do Imóvel: ${formatCurrency(loan.propertyValue)}
• Entrada: ${formatCurrency(loan.downPayment)}
• Financiamento: ${formatCurrency(result.financedAmount)}
• Prazo Contratual: ${loan.termMonths} meses (${originalYears} anos)
• Sistema: ${loan.system} • Taxa: ${loan.annualInterestRate}% a.a.
• 1ª Parcela Estimada: ${formatCurrency(result.standard.initialInstallment)}/mês

🚀 *ESTRATÉGIA DE AMORTIZAÇÃO TORRESUL*
${extra.oneTimeAmount > 0 ? `• Aporte Pontual (13º/FGTS): ${formatCurrency(extra.oneTimeAmount)}\n` : ''}${extra.recurringMonthlyAmount > 0 ? `• Aporte Mensal Extra: +${formatCurrency(extra.recurringMonthlyAmount)}/mês\n` : ''}${extra.recurringBiAnnualFGTS > 0 ? `• FGTS a cada 24 meses: ${formatCurrency(extra.recurringBiAnnualFGTS)}\n` : ''}
🎯 *RESULTADO ALCANÇADO:*
${extra.goalType === 'REDUCE_TERM' ? `• Novo Prazo de Quitação: *${payoffYears} anos ${payoffMonths > 0 ? `e ${payoffMonths} meses` : ''}* (em vez de ${originalYears} anos)
• Parcelas Eliminadas do Final: *${eliminated} parcelas a menos*
• Juros Economizados: *${formatCurrency(result.withAmortization.interestSaved)}* que você deixa de pagar ao banco!` : `• Nova Parcela Reduzida: *${formatCurrency(result.withAmortization.initialInstallment)}/mês*
• Juros Economizados: *${formatCurrency(result.withAmortization.interestSaved)}*`}

📲 *Torresul Imobiliária* • Blumenau/SC
Consultoria Especializada MCMV`;
}

