import { ContractDeal, Installment, InstallmentStatus, FinancialStats, MonthlyForecastItem } from '../types';
import { safeStorage } from './safeStorage';

const STORAGE_KEY = 'torre_sul_comissoes_deals_v2';

/**
 * Checks if a string is a reference to Torresul (which is the real estate agency, not a developer/construtora)
 */
export function isTorresulReference(value?: string | null): boolean {
  if (!value) return false;
  const normalized = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s\-_./\\]/g, '');

  return (
    normalized.includes('torresul') ||
    normalized.includes('torresul') ||
    normalized.includes('torresulimobiliaria') ||
    normalized.includes('imobiliariatorresul') ||
    normalized.includes('construtoratorresul')
  );
}

/**
 * Sanitizes developer / construtora field to ensure Torresul is never listed as a developer.
 * Returns empty string or stripped developer name.
 */
export function sanitizeDeveloperName(developerOrAgency?: string | null): string {
  if (!developerOrAgency) return '';
  const trimmed = developerOrAgency.trim();
  
  if (isTorresulReference(trimmed)) {
    return '';
  }

  // If there's a compound string e.g. "Rôgga / Torresul", keep only the actual developer
  if (trimmed.includes('/') || trimmed.includes('+') || trimmed.includes(',')) {
    const parts = trimmed.split(/[\/\+,]/).map((p) => p.trim());
    const validParts = parts.filter((p) => !isTorresulReference(p));
    return validParts.join(' / ').trim();
  }

  return trimmed;
}

export const INITIAL_SAMPLE_DEALS: ContractDeal[] = [
  {
    id: 'deal-1',
    propertyTitle: 'Edifício Grand Royale - Apto 142',
    propertyType: 'apartamento',
    dealCategory: 'venda_direta',
    clientName: 'Rodrigo Medeiros e Paula Costa',
    clientPhone: '(11) 98765-4321',
    developerOrAgency: 'Cyrela Empreendimentos',
    contractDate: '2026-08-15',
    signatureDate: '2026-08-15',
    propertyValue: 850000,
    grossCommissionPercent: 5,
    grossCommissionValue: 42500,
    brokerSplitPercent: 50,
    brokerNetCommission: 21250,
    bonusAmount: 3000,
    bonusDescription: 'Prêmio Campanha Lançamento Construtora',
    totalBrokerReceivable: 24250,
    status: 'em_andamento',
    notes: 'Sinal pago e contrato assinado. Financiamento bancário aprovado na Caixa.',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z',
    installments: [
      {
        id: 'inst-1-1',
        dealId: 'deal-1',
        dealTitle: 'Edifício Grand Royale - Apto 142',
        installmentNumber: 1,
        totalInstallments: 2,
        title: '1ª Parcela - Ato / Sinal',
        amount: 10625,
        dueDate: '2026-08-25',
        receivedDate: '2026-08-24',
        status: 'recebido',
        notes: 'Pago via PIX pela imobiliária',
      },
      {
        id: 'inst-1-2',
        dealId: 'deal-1',
        dealTitle: 'Edifício Grand Royale - Apto 142',
        installmentNumber: 2,
        totalInstallments: 2,
        title: '2ª Parcela - Repasse do Financiamento',
        amount: 10625,
        dueDate: '2026-10-10',
        status: 'pendente',
        notes: 'Aguardando liberação dos recursos bancários',
      },
      {
        id: 'inst-1-bonus',
        dealId: 'deal-1',
        dealTitle: 'Edifício Grand Royale - Apto 142',
        installmentNumber: 3,
        totalInstallments: 3,
        title: 'Bônus Construtora - Campanha Fechamento',
        amount: 3000,
        dueDate: '2026-10-25',
        status: 'pendente',
        isBonus: true,
        notes: 'Pago diretamente pela construtora após registro em cartório',
      },
    ],
  },
  {
    id: 'deal-2',
    propertyTitle: 'Residencial Villa Serena - Casa 12',
    propertyType: 'casa',
    dealCategory: 'agenciamento',
    clientName: 'Dr. Fernando Albuquerque',
    clientPhone: '(11) 99123-8877',
    developerOrAgency: 'Direto com Proprietário',
    contractDate: '2026-09-02',
    signatureDate: '2026-09-02',
    propertyValue: 1400000,
    grossCommissionPercent: 6,
    grossCommissionValue: 84000,
    brokerSplitPercent: 60,
    brokerNetCommission: 50400,
    bonusAmount: 0,
    totalBrokerReceivable: 50400,
    status: 'em_andamento',
    notes: 'Imóvel de alto padrão. Comissão acordada em 3 parcelas mensais.',
    createdAt: '2026-09-02T14:30:00Z',
    updatedAt: '2026-09-02T14:30:00Z',
    installments: [
      {
        id: 'inst-2-1',
        dealId: 'deal-2',
        dealTitle: 'Residencial Villa Serena - Casa 12',
        installmentNumber: 1,
        totalInstallments: 3,
        title: '1ª Parcela - Assinatura da Escritura',
        amount: 16800,
        dueDate: '2026-09-08',
        receivedDate: '2026-09-08',
        status: 'recebido',
        notes: 'Transferência bancária confirmada',
      },
      {
        id: 'inst-2-2',
        dealId: 'deal-2',
        dealTitle: 'Residencial Villa Serena - Casa 12',
        installmentNumber: 2,
        totalInstallments: 3,
        title: '2ª Parcela - 30 Dias',
        amount: 16800,
        dueDate: '2026-10-08',
        status: 'pendente',
      },
      {
        id: 'inst-2-3',
        dealId: 'deal-2',
        dealTitle: 'Residencial Villa Serena - Casa 12',
        installmentNumber: 3,
        totalInstallments: 3,
        title: '3ª Parcela - 60 Dias / Entrega de Posse',
        amount: 16800,
        dueDate: '2026-11-08',
        status: 'pendente',
      },
    ],
  },
  {
    id: 'deal-3',
    propertyTitle: 'Torre Bella Vista - Studio 408',
    propertyType: 'lancamento',
    dealCategory: 'venda_direta',
    clientName: 'Mariana Silveira',
    clientPhone: '(11) 97654-1122',
    developerOrAgency: 'Gafisa',
    contractDate: '2026-09-05',
    signatureDate: '2026-09-05',
    propertyValue: 390000,
    grossCommissionPercent: 4,
    grossCommissionValue: 15600,
    brokerSplitPercent: 50,
    brokerNetCommission: 7800,
    bonusAmount: 2000,
    bonusDescription: 'Bônus Venda no Fim de Semana de Lançamento',
    totalBrokerReceivable: 9800,
    status: 'em_andamento',
    notes: 'Studio para investimento de locação short-stay.',
    createdAt: '2026-09-05T16:00:00Z',
    updatedAt: '2026-09-05T16:00:00Z',
    installments: [
      {
        id: 'inst-3-1',
        dealId: 'deal-3',
        dealTitle: 'Torre Bella Vista - Studio 408',
        installmentNumber: 1,
        totalInstallments: 2,
        title: '1ª Parcela - Aprovação de Crédito',
        amount: 3900,
        dueDate: '2026-10-15',
        status: 'pendente',
      },
      {
        id: 'inst-3-bonus',
        dealId: 'deal-3',
        dealTitle: 'Torre Bella Vista - Studio 408',
        installmentNumber: 2,
        totalInstallments: 3,
        title: 'Premiação Lançamento Construtora',
        amount: 2000,
        dueDate: '2026-11-05',
        status: 'pendente',
        isBonus: true,
      },
      {
        id: 'inst-3-2',
        dealId: 'deal-3',
        dealTitle: 'Torre Bella Vista - Studio 408',
        installmentNumber: 3,
        totalInstallments: 3,
        title: '2ª Parcela - Quitação Entrada',
        amount: 3900,
        dueDate: '2026-12-15',
        status: 'pendente',
      },
    ],
  },
  {
    id: 'deal-4',
    propertyTitle: 'Loteamento Terras Altas - Lote 18',
    propertyType: 'terreno',
    dealCategory: 'agenciamento',
    clientName: 'Carlos Eduardo Vieira',
    clientPhone: '(11) 98111-2233',
    developerOrAgency: 'Direto com Proprietário',
    contractDate: '2026-07-20',
    signatureDate: '2026-07-20',
    propertyValue: 310000,
    grossCommissionPercent: 6,
    grossCommissionValue: 18600,
    brokerSplitPercent: 100,
    brokerNetCommission: 18600,
    bonusAmount: 0,
    totalBrokerReceivable: 18600,
    status: 'concluido',
    notes: 'Venda de terreno quitado à vista. Comissão integral recebida.',
    createdAt: '2026-07-20T09:00:00Z',
    updatedAt: '2026-07-20T09:00:00Z',
    installments: [
      {
        id: 'inst-4-1',
        dealId: 'deal-4',
        dealTitle: 'Loteamento Terras Altas - Lote 18',
        installmentNumber: 1,
        totalInstallments: 1,
        title: 'Parcela Única - Escritura',
        amount: 18600,
        dueDate: '2026-07-25',
        receivedDate: '2026-07-25',
        status: 'recebido',
      },
    ],
  },
  {
    id: 'deal-5',
    propertyTitle: 'Corporate Park Paulista - Sala 704',
    propertyType: 'comercial',
    dealCategory: 'venda_direta',
    clientName: 'Advocacia Ramos & Associados',
    clientPhone: '(11) 99887-7665',
    developerOrAgency: 'Even Construtora',
    contractDate: '2026-09-08',
    signatureDate: '2026-09-08',
    propertyValue: 620000,
    grossCommissionPercent: 5,
    grossCommissionValue: 31000,
    brokerSplitPercent: 50,
    brokerNetCommission: 15500,
    bonusAmount: 1500,
    bonusDescription: 'Bônus Meta Trimestral Imobiliária',
    totalBrokerReceivable: 17000,
    status: 'em_andamento',
    notes: 'Sala comercial pronta para consultório/escritório.',
    createdAt: '2026-09-08T11:00:00Z',
    updatedAt: '2026-09-08T11:00:00Z',
    installments: [
      {
        id: 'inst-5-1',
        dealId: 'deal-5',
        dealTitle: 'Corporate Park Paulista - Sala 704',
        installmentNumber: 1,
        totalInstallments: 2,
        title: '1ª Parcela - Sinal',
        amount: 7750,
        dueDate: '2026-11-20',
        status: 'pendente',
      },
      {
        id: 'inst-5-bonus',
        dealId: 'deal-5',
        dealTitle: 'Corporate Park Paulista - Sala 704',
        installmentNumber: 2,
        totalInstallments: 3,
        title: 'Bônus Meta Trimestral',
        amount: 1500,
        dueDate: '2026-12-05',
        status: 'pendente',
        isBonus: true,
      },
      {
        id: 'inst-5-2',
        dealId: 'deal-5',
        dealTitle: 'Corporate Park Paulista - Sala 704',
        installmentNumber: 3,
        totalInstallments: 3,
        title: '2ª Parcela - Conclusão Contratual',
        amount: 7750,
        dueDate: '2027-01-15',
        status: 'pendente',
      },
    ],
  },
];

export function loadDeals(): ContractDeal[] {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      safeStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const loadedDeals: ContractDeal[] = parsed.map((deal: any, index: number) => {
        const dealId = String(deal?.id || `deal-${index}-${Date.now()}`);
        const dealTitle = String(deal?.propertyTitle || 'Imóvel sem título');
        const propertyVal = Number(deal?.propertyValue) || 0;
        const grossPercent = Number(deal?.grossCommissionPercent) || 0;
        const grossCommissionValue = Number(deal?.grossCommissionValue) || (propertyVal * grossPercent) / 100;
        const createdAt = String(deal?.createdAt || new Date().toISOString());
        const updatedAt = String(deal?.updatedAt || new Date().toISOString());

        const netComm = Number(deal?.brokerNetCommission) || 0;
        const bonusAmt = Number(deal?.bonusAmount) || 0;
        const totalReceivable = Number(deal?.totalBrokerReceivable) || (netComm + bonusAmt);

        let parsedInstallments: Installment[] = Array.isArray(deal?.installments)
          ? deal.installments.map((inst: any, instIdx: number) => ({
              id: String(inst?.id || `inst-${index}-${instIdx}-${Date.now()}`),
              dealId: String(inst?.dealId || dealId),
              dealTitle: String(inst?.dealTitle || dealTitle),
              installmentNumber: Number(inst?.installmentNumber) || instIdx + 1,
              totalInstallments: Number(inst?.totalInstallments) || 1,
              title: String(inst?.title || `Parcela ${instIdx + 1}`),
              amount: Number(inst?.amount) || 0,
              dueDate: String(inst?.dueDate || deal?.contractDate || '2026-09-10'),
              receivedDate: inst?.receivedDate ? String(inst.receivedDate) : undefined,
              status: (inst?.status === 'recebido' ? 'recebido' : 'pendente') as InstallmentStatus,
              isBonus: Boolean(inst?.isBonus),
              notes: inst?.notes ? String(inst.notes) : undefined,
            }))
          : [];

        // If no installments existed, synthesize standard installment
        if (parsedInstallments.length === 0 && (netComm > 0 || bonusAmt > 0)) {
          if (netComm > 0) {
            parsedInstallments.push({
              id: `inst-${dealId}-1`,
              dealId,
              dealTitle,
              installmentNumber: 1,
              totalInstallments: bonusAmt > 0 ? 2 : 1,
              title: 'Comissão de Venda',
              amount: netComm,
              dueDate: String(deal?.contractDate || '2026-09-10'),
              status: (deal?.status === 'concluido' ? 'recebido' : 'pendente') as InstallmentStatus,
            });
          }
          if (bonusAmt > 0) {
            parsedInstallments.push({
              id: `inst-${dealId}-bonus`,
              dealId,
              dealTitle,
              installmentNumber: parsedInstallments.length + 1,
              totalInstallments: parsedInstallments.length + 1,
              title: deal?.bonusDescription ? `Bônus: ${deal.bonusDescription}` : 'Bônus / Premiação',
              amount: bonusAmt,
              dueDate: String(deal?.contractDate || '2026-09-10'),
              status: 'pendente' as InstallmentStatus,
              isBonus: true,
            });
          }
        }

        const contractDateStr = String(deal?.contractDate || deal?.signatureDate || '2026-09-10');
        const signatureDateStr = String(deal?.signatureDate || deal?.contractDate || contractDateStr);
        const dealCategory = deal?.dealCategory === 'agenciamento' ? 'agenciamento' : 'venda_direta';

        const rawDev = deal?.developerOrAgency ? String(deal.developerOrAgency) : '';
        const cleanDev = sanitizeDeveloperName(rawDev);

        return {
          id: dealId,
          propertyTitle: dealTitle,
          propertyType: deal?.propertyType || 'outro',
          dealCategory,
          propertyValue: propertyVal,
          grossCommissionPercent: grossPercent,
          grossCommissionValue,
          brokerSplitPercent: Number(deal?.brokerSplitPercent) || 100,
          brokerNetCommission: netComm,
          bonusAmount: bonusAmt,
          bonusDescription: deal?.bonusDescription ? String(deal.bonusDescription) : undefined,
          totalBrokerReceivable: totalReceivable,
          developerOrAgency: cleanDev,
          clientName: deal?.clientName ? String(deal.clientName) : '',
          clientPhone: deal?.clientPhone ? String(deal.clientPhone) : undefined,
          contractDate: contractDateStr,
          signatureDate: signatureDateStr,
          status: deal?.status || 'em_andamento',
          notes: deal?.notes ? String(deal.notes) : undefined,
          createdAt,
          updatedAt,
          installments: parsedInstallments,
        };
      });

      // If any existing deals stored in storage had Torresul as developer, rewrite clean state
      const hadChanges = parsed.some((rawItem: any, idx: number) => {
        const rawDev = rawItem?.developerOrAgency ? String(rawItem.developerOrAgency) : '';
        return rawDev !== loadedDeals[idx]?.developerOrAgency;
      });

      if (hadChanges) {
        safeStorage.setItem(STORAGE_KEY, JSON.stringify(loadedDeals));
      }

      return loadedDeals;
    }
    return [];
  } catch (err) {
    console.error('Error loading deals from storage:', err);
    return [];
  }
}

export function saveDeals(deals: ContractDeal[]): void {
  try {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
  } catch (err) {
    console.error('Error saving deals to storage:', err);
  }
}

export function resetToSampleDeals(): ContractDeal[] {
  safeStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_DEALS));
  return INITIAL_SAMPLE_DEALS;
}

export function clearAllDeals(): ContractDeal[] {
  safeStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
}

/**
 * Computes all financial stats, upcoming monthly forecast, and averages
 */
export function calculateFinancialStats(deals: ContractDeal[], currentDateStr: string = '2026-09-10'): {
  stats: FinancialStats;
  monthlyForecast: MonthlyForecastItem[];
} {
  const allInstallments: Installment[] = [];
  let totalVGV = 0;
  let totalBonusesAllTime = 0;
  let totalCommissionPercentSum = 0;

  if (Array.isArray(deals)) {
    deals.forEach((deal) => {
      if (!deal) return;
      if (deal.status !== 'distrato') {
        totalVGV += Number(deal.propertyValue) || 0;
        totalBonusesAllTime += Number(deal.bonusAmount) || 0;
        totalCommissionPercentSum += Number(deal.grossCommissionPercent) || 0;
        if (Array.isArray(deal.installments)) {
          deal.installments.forEach((inst) => {
            if (inst && typeof inst.amount === 'number') {
              allInstallments.push(inst);
            }
          });
        }
      }
    });
  }

  const currentYearMonth = currentDateStr.slice(0, 7); // '2026-09'
  
  let totalReceivedAllTime = 0;
  let totalPendingFuture = 0;

  allInstallments.forEach((inst) => {
    const amount = Number(inst.amount) || 0;
    if (inst.status === 'recebido') {
      totalReceivedAllTime += amount;
    } else {
      totalPendingFuture += amount;
    }
  });

  // Build 14-month timeline: 1 month back, current month, and 12 months forward
  const [currY, currM] = currentYearMonth.split('-').map(Number);
  const monthKeys: string[] = [];

  // Start 1 month back (-1) and go up to 12 months forward
  for (let offset = -1; offset <= 12; offset++) {
    const d = new Date(currY, (currM || 9) - 1 + offset, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    monthKeys.push(`${y}-${m}`);
  }

  const monthShortNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthFullNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const monthlyForecast: MonthlyForecastItem[] = monthKeys.map((mKey) => {
    const [y, m] = mKey.split('-').map(Number);
    const label = `${monthShortNames[(m || 1) - 1]}/${String(y).slice(-2)}`;
    const fullLabel = `${monthFullNames[(m || 1) - 1]} de ${y}`;
    
    // Find installments due or received in this month
    const monthInsts = allInstallments.filter((inst) => {
      const rawDate = inst.status === 'recebido' && inst.receivedDate ? inst.receivedDate : inst.dueDate;
      const targetDate = String(rawDate || '');
      return targetDate.startsWith(mKey);
    });

    let projectedAmount = 0;
    let receivedAmount = 0;
    let bonusAmount = 0;

    monthInsts.forEach((inst) => {
      const amount = Number(inst.amount) || 0;
      if (inst.status === 'recebido') {
        receivedAmount += amount;
      } else {
        projectedAmount += amount;
      }
      if (inst.isBonus) {
        bonusAmount += amount;
      }
    });

    return {
      monthKey: mKey,
      label,
      fullLabel,
      projectedAmount,
      receivedAmount,
      bonusAmount,
      totalVolume: projectedAmount + receivedAmount,
      installments: monthInsts,
      isCurrentMonth: mKey === currentYearMonth,
      isPastMonth: mKey < currentYearMonth,
    };
  });

  // Calculate average projected monthly inflow for the next 3 to 6 months
  const futureMonths = monthlyForecast.filter((m) => m.monthKey >= currentYearMonth);
  const futureProjectedTotal = futureMonths.reduce((acc, m) => acc + m.projectedAmount, 0);
  const avgMonthlyNextMonths = futureMonths.length > 0 ? futureProjectedTotal / futureMonths.length : 0;

  const validDeals = Array.isArray(deals) ? deals : [];
  const activeContractsCount = validDeals.filter((d) => d && d.status === 'em_andamento').length;
  const completedContractsCount = validDeals.filter((d) => d && d.status === 'concluido').length;

  const stats: FinancialStats = {
    totalPendingFuture,
    avgMonthlyNextMonths,
    totalReceivedAllTime,
    totalBonusesAllTime,
    totalVGV,
    activeContractsCount,
    completedContractsCount,
    totalContractsCount: validDeals.length,
    averageCommissionPercent: validDeals.length > 0 ? totalCommissionPercentSum / validDeals.length : 0,
  };

  return { stats, monthlyForecast };
}
