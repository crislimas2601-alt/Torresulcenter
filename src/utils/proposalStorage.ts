import { RealEstateProposal, ProposalStatus } from '../types';

const STORAGE_KEY = 'torre_sul_proposals_v1';

export const INITIAL_SAMPLE_PROPOSALS: RealEstateProposal[] = [
  {
    id: 'prop-sample-01',
    code: 'PROP-2026/084',
    createdAt: '2026-09-12T14:30:00.000Z',
    updatedAt: '2026-09-14T10:15:00.000Z',
    status: 'analise',
    client: {
      name: 'Dr. Roberto Silveira Martins',
      cpf: '241.890.342-15',
      rg: '38.452.190-X SSP/SP',
      phone: '(11) 98765-4321',
      email: 'roberto.silveira@clinica.com.br',
      maritalStatus: 'Casado em Comunhão Parcial',
      profession: 'Médico Cardiologista',
      hasSpouse: true,
      spouseName: 'Dra. Camila Nogueira Martins',
      spouseCpf: '312.445.890-04',
      spouseProfession: 'Advogada',
    },
    property: {
      title: 'Residencial Privilege Blumenau',
      unit: 'Apto 182 - 18º Andar (Torre A)',
      type: 'apartamento',
      developerOrSeller: 'Rôgga Empreendimentos',
      totalValue: 950000,
      areaM2: 114,
      parkingSpots: 2,
      address: 'Av. das Nações Unidas, 1420 - Brooklin, São Paulo - SP',
    },
    paymentFlow: {
      downPayment: 150000,
      downPaymentDate: '2026-09-25',
      monthlyInstallmentsCount: 24,
      monthlyInstallmentAmount: 6250,
      monthlyStartDate: '2026-10-15',
      balloonInstallmentsCount: 4,
      balloonInstallmentAmount: 25000,
      balloonFrequency: 'semestral',
      balloonStartDate: '2027-03-15',
      keysPayment: 50000,
      keysDate: '2028-10-15',
      bankFinancingAmount: 500000,
      fgtsAmount: 0,
      otherPayments: 0,
      otherPaymentsNotes: '',
    },
    broker: {
      name: 'Cristiano Lima',
      creci: '194820-F',
      phone: '(11) 99123-8844',
      agency: 'Torre Sul Imobiliária',
    },
    conditions: {
      validityDays: 5,
      correctionIndex: 'INCC-DI/FGV até a entrega das chaves; pós-habite-se IPCA + 1% a.m.',
      includedItems: 'Infraestrutura completa para ar condicionado split em todos os dormitórios e varanda gourmet entregue com churrasqueira a carvão.',
      notes: 'Cliente com aprovação de crédito imobiliário pré-analisada junto ao Banco Santander e Bradesco.',
    },
  },
  {
    id: 'prop-sample-02',
    code: 'PROP-2026/089',
    createdAt: '2026-09-14T09:00:00.000Z',
    updatedAt: '2026-09-15T16:00:00.000Z',
    status: 'aprovada',
    client: {
      name: 'Juliana Mendes de Alencar',
      cpf: '389.210.456-78',
      rg: '45.123.987-1 SSP/SP',
      phone: '(11) 97111-2233',
      email: 'juliana.alencar@techcorp.com',
      maritalStatus: 'Solteira',
      profession: 'Diretora de Engenharia de Software',
      hasSpouse: false,
    },
    property: {
      title: 'Condomínio Reserva do Parque',
      unit: 'Casa 42 - Alameda das Figueiras',
      type: 'casa',
      developerOrSeller: 'Incorporadora Parque Verde S/A',
      totalValue: 1450000,
      areaM2: 240,
      parkingSpots: 4,
      address: 'Rua das Palmeiras, 500 - Granja Viana, Cotia - SP',
    },
    paymentFlow: {
      downPayment: 300000,
      downPaymentDate: '2026-09-20',
      monthlyInstallmentsCount: 12,
      monthlyInstallmentAmount: 12500,
      monthlyStartDate: '2026-10-20',
      balloonInstallmentsCount: 2,
      balloonInstallmentAmount: 100000,
      balloonFrequency: 'semestral',
      balloonStartDate: '2027-04-20',
      keysPayment: 100000,
      keysDate: '2027-10-20',
      bankFinancingAmount: 600000,
      fgtsAmount: 100000,
      otherPayments: 0,
    },
    broker: {
      name: 'Cristiano Lima',
      creci: '194820-F',
      phone: '(11) 99123-8844',
      agency: 'Torre Sul Imobiliária',
    },
    conditions: {
      validityDays: 7,
      correctionIndex: 'CUB/SINDUSCON até a conclusão da fase externa.',
      includedItems: 'Piscina de alvenaria e espaço gourmet com bancada em granito São Gabriel instalados.',
      notes: 'Proposta aceita pela construtora parceira.',
    },
  },
];

export function loadProposals(): RealEstateProposal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_PROPOSALS));
      return INITIAL_SAMPLE_PROPOSALS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SAMPLE_PROPOSALS;
  } catch (err) {
    console.error('Error loading proposals from localStorage:', err);
    return INITIAL_SAMPLE_PROPOSALS;
  }
}

export function saveProposals(proposals: RealEstateProposal[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
  } catch (err) {
    console.error('Error saving proposals to localStorage:', err);
  }
}

export function createEmptyProposal(): RealEstateProposal {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100 + Math.random() * 900);
  const today = new Date().toISOString().slice(0, 10);

  return {
    id: `prop-${Date.now()}`,
    code: `PROP-${year}/${randomNum}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'rascunho',
    client: {
      name: '',
      cpf: '',
      phone: '',
      email: '',
      maritalStatus: 'Solteiro(a)',
      profession: '',
      hasSpouse: false,
    },
    property: {
      title: '',
      unit: '',
      type: 'apartamento',
      developerOrSeller: '',
      totalValue: 0,
      areaM2: 0,
      parkingSpots: 1,
      address: '',
    },
    paymentFlow: {
      downPayment: 0,
      downPaymentDate: today,
      monthlyInstallmentsCount: 12,
      monthlyInstallmentAmount: 0,
      monthlyStartDate: today,
      balloonInstallmentsCount: 2,
      balloonInstallmentAmount: 0,
      balloonFrequency: 'semestral',
      balloonStartDate: today,
      keysPayment: 0,
      keysDate: today,
      bankFinancingAmount: 0,
      fgtsAmount: 0,
      otherPayments: 0,
      otherPaymentsNotes: '',
    },
    broker: {
      name: 'Cristiano Lima',
      creci: '194820-F',
      phone: '(11) 99123-8844',
      agency: 'Torre Sul Imobiliária',
    },
    conditions: {
      validityDays: 5,
      correctionIndex: 'INCC até as chaves, pós-habite-se IPCA + 1% a.m.',
      includedItems: '',
      notes: '',
    },
  };
}

/**
 * Calculates sum of the entire proposal payment schedule
 */
export function calculateProposalPaymentSum(flow: RealEstateProposal['paymentFlow']): {
  totalSinal: number;
  totalMensais: number;
  totalBaloes: number;
  totalChaves: number;
  totalFinanciamento: number;
  totalFgts: number;
  totalOutros: number;
  grandTotal: number;
} {
  const totalSinal = Number(flow.downPayment) || 0;
  const totalMensais = (Number(flow.monthlyInstallmentsCount) || 0) * (Number(flow.monthlyInstallmentAmount) || 0);
  const totalBaloes = (Number(flow.balloonInstallmentsCount) || 0) * (Number(flow.balloonInstallmentAmount) || 0);
  const totalChaves = Number(flow.keysPayment) || 0;
  const totalFinanciamento = Number(flow.bankFinancingAmount) || 0;
  const totalFgts = Number(flow.fgtsAmount) || 0;
  const totalOutros = Number(flow.otherPayments) || 0;

  const grandTotal = totalSinal + totalMensais + totalBaloes + totalChaves + totalFinanciamento + totalFgts + totalOutros;

  return {
    totalSinal,
    totalMensais,
    totalBaloes,
    totalChaves,
    totalFinanciamento,
    totalFgts,
    totalOutros,
    grandTotal: Math.round(grandTotal * 100) / 100,
  };
}

/**
 * Generates WhatsApp-friendly formatted message
 */
export function formatProposalForWhatsApp(prop: RealEstateProposal): string {
  const fmt = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const paymentSums = calculateProposalPaymentSum(prop.paymentFlow);

  return `🏛️ *PROPOSTA FORMAL DE COMPRA E VENDA* 
📋 *Código:* ${prop.code}
🏢 *Imobiliária:* ${prop.broker.agency}
👤 *Corretor:* ${prop.broker.name} (CRECI: ${prop.broker.creci}) - ${prop.broker.phone}

━━━━━━━━━━━━━━━━━━━━
📌 *1. IMÓVEL / EMPREENDIMENTO*
• *Imóvel:* ${prop.property.title}
• *Unidade/Lote:* ${prop.property.unit || 'A definir'}
• *Vendedor/Construtora:* ${prop.property.developerOrSeller}
• *Valor Total Proposto:* *${fmt(prop.property.totalValue)}*
${prop.property.areaM2 ? `• *Metragem Privativa:* ${prop.property.areaM2}m²` : ''}
${prop.property.parkingSpots ? `• *Vagas de Garagem:* ${prop.property.parkingSpots} vaga(s)` : ''}
${prop.property.address ? `• *Localização:* ${prop.property.address}` : ''}

━━━━━━━━━━━━━━━━━━━━
👤 *2. PROPONENTE COMPRADOR(A)*
• *Nome:* ${prop.client.name}
• *CPF:* ${prop.client.cpf}
• *Telefone:* ${prop.client.phone}
${prop.client.hasSpouse && prop.client.spouseName ? `• *Cônjuge:* ${prop.client.spouseName} (CPF: ${prop.client.spouseCpf || 'N/I'})` : ''}

━━━━━━━━━━━━━━━━━━━━
💰 *3. FLUXO E CONDIÇÕES DE PAGAMENTO*
• *Entrada / Sinal (Ato):* ${fmt(prop.paymentFlow.downPayment)} (${prop.paymentFlow.downPaymentDate ? new Date(prop.paymentFlow.downPaymentDate).toLocaleDateString('pt-BR') : 'No ato'})
${paymentSums.totalMensais > 0 ? `• *Mensais na Obra:* ${prop.paymentFlow.monthlyInstallmentsCount}x de ${fmt(prop.paymentFlow.monthlyInstallmentAmount)} = ${fmt(paymentSums.totalMensais)}` : ''}
${paymentSums.totalBaloes > 0 ? `• *Intermediárias/Balões:* ${prop.paymentFlow.balloonInstallmentsCount}x de ${fmt(prop.paymentFlow.balloonInstallmentAmount)} (${prop.paymentFlow.balloonFrequency}) = ${fmt(paymentSums.totalBaloes)}` : ''}
${prop.paymentFlow.keysPayment > 0 ? `• *Parcela de Chaves:* ${fmt(prop.paymentFlow.keysPayment)}` : ''}
${prop.paymentFlow.bankFinancingAmount > 0 ? `• *Financiamento Bancário:* ${fmt(prop.paymentFlow.bankFinancingAmount)}` : ''}
${prop.paymentFlow.fgtsAmount > 0 ? `• *Uso de FGTS:* ${fmt(prop.paymentFlow.fgtsAmount)}` : ''}
${prop.paymentFlow.otherPayments > 0 ? `• *Outros:* ${fmt(prop.paymentFlow.otherPayments)} (${prop.paymentFlow.otherPaymentsNotes || ''})` : ''}
━━━━━━━━━━━━━━━━━━━━
📊 *TOTAL DO FLUXO OFERTADO:* *${fmt(paymentSums.grandTotal)}*

⏳ *Validade da Proposta:* ${prop.conditions.validityDays} dias úteis
📈 *Correção Monetária:* ${prop.conditions.correctionIndex || 'A combinar'}
${prop.conditions.notes ? `📝 *Observações:* ${prop.conditions.notes}` : ''}

_Documento gerado pelo Back Office Torre Sul Imobiliária._`;
}
