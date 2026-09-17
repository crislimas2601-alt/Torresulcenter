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
export function formatDateBR(dateStr?: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Format month key YYYY-MM to readable name e.g. "Out/26"
 */
export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const monthNamesShort = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  const mIndex = parseInt(month, 10) - 1;
  const shortYear = year.slice(-2);
  return `${monthNamesShort[mIndex] || month}/${shortYear}`;
}

/**
 * Format month key YYYY-MM to full name e.g. "Outubro de 2026"
 */
export function formatMonthFullLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${monthNames[mIndex] || month} de ${year}`;
}

/**
 * Calculate due dates for N installments starting from a date
 */
export function generateInstallmentDates(startDate: string, count: number, intervalDays: number = 30): string[] {
  const dates: string[] = [];
  const base = new Date(startDate + 'T12:00:00');
  
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    // Use month advancement for clean monthly dates or day addition
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

