import * as XLSX from 'xlsx';
import { ContractDeal, Installment, PropertyType, DealStatus, DealCategory } from '../types';

/**
 * Normaliza strings para comparação de cabeçalhos (remove acentos, espaços e pontuação)
 */
function normalizeHeader(header: string): string {
  return String(header || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Converte valor de moeda/número (R$ 350.000,00 ou "350000" ou número) para float
 */
function parseNumber(val: any): number {
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : val;
  }
  if (!val) return 0;
  
  let str = String(val).trim();
  // Remove R$, espaços
  str = str.replace(/[R$\s]/g, '');
  
  // Trata formato brasileiro (1.000,50) vs formato americano (1000.50)
  if (str.includes(',') && str.includes('.')) {
    // 1.250,50 -> remove ponto e troca vírgula por ponto
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    // 1250,50 -> troca vírgula por ponto
    str = str.replace(',', '.');
  }
  
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Converte datas do Excel (número de série do Excel ou strings DD/MM/AAAA / AAAA-MM-DD) para YYYY-MM-DD
 */
function parseDate(val: any): string {
  if (!val) return new Date().toISOString().slice(0, 10);
  
  // Se for número de série de data do Excel
  if (typeof val === 'number') {
    try {
      const dateObj = XLSX.SSF.parse_date_code(val);
      if (dateObj) {
        const y = String(dateObj.y).padStart(4, '0');
        const m = String(dateObj.m).padStart(2, '0');
        const d = String(dateObj.d).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    } catch {
      // fallback
    }
  }

  const str = String(val).trim();

  // Formato DD/MM/AAAA ou DD-MM-AAAA
  const brMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (brMatch) {
    const day = brMatch[1].padStart(2, '0');
    const month = brMatch[2].padStart(2, '0');
    const year = brMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Formato AAAA-MM-DD
  const isoMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = isoMatch[2].padStart(2, '0');
    const day = isoMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return new Date().toISOString().slice(0, 10);
}

/**
 * Normaliza tipo de imóvel
 */
function parsePropertyType(val: any): PropertyType {
  const norm = normalizeHeader(val);
  if (norm.includes('ap') || norm.includes('apartamento')) return 'apartamento';
  if (norm.includes('casa') || norm.includes('sobrado')) return 'casa';
  if (norm.includes('terr') || norm.includes('lote')) return 'terreno';
  if (norm.includes('comercial') || norm.includes('sala')) return 'comercial';
  if (norm.includes('lanc') || norm.includes('planta')) return 'lancamento';
  if (norm.includes('rural') || norm.includes('chacara') || norm.includes('sitio')) return 'rural';
  return 'outro';
}

/**
 * Normaliza status do contrato
 */
function parseDealStatus(val: any): DealStatus {
  const norm = normalizeHeader(val);
  if (norm.includes('conc') || norm.includes('pago') || norm.includes('quitado') || norm.includes('finalizado')) return 'concluido';
  if (norm.includes('distr') || norm.includes('canc') || norm.includes('cancelado')) return 'distrato';
  return 'em_andamento';
}

/**
 * Normaliza categoria de venda
 */
function parseDealCategory(val: any): DealCategory {
  const norm = normalizeHeader(val);
  if (norm.includes('agenc') || norm.includes('captacao')) return 'agenciamento';
  return 'venda_direta';
}

/**
 * Importa dados a partir de arquivo Excel (.xlsx, .xls, .csv) ou JSON
 */
export async function parseDealsFromFile(file: File): Promise<{ deals: ContractDeal[]; error?: string }> {
  try {
    const fileName = file.name.toLowerCase();

    // Se for arquivo JSON puro
    if (fileName.endsWith('.json')) {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return { deals: parsed as ContractDeal[] };
      }
      if (parsed && Array.isArray(parsed.deals)) {
        return { deals: parsed.deals as ContractDeal[] };
      }
      return { deals: [], error: 'O arquivo JSON não contém uma lista válida de contratos.' };
    }

    // Se for arquivo Excel (.xlsx, .xls) ou CSV
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    
    // Pega a primeira aba
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { deals: [], error: 'A planilha selecionada está vazia.' };
    }

    const worksheet = workbook.Sheets[firstSheetName];
    // Converte a aba para lista de objetos JSON com cabeçalhos da primeira linha
    const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return { deals: [], error: 'Nenhuma linha de dados encontrada na planilha.' };
    }

    const importedDeals: ContractDeal[] = [];

    rawRows.forEach((row, index) => {
      // Mapeamento dinâmico de chaves
      let propertyTitle = '';
      let clientName = '';
      let clientPhone = '';
      let propertyType: PropertyType = 'apartamento';
      let dealCategory: DealCategory = 'venda_direta';
      let developerOrAgency = 'Torresul Imobiliária';
      let contractDate = new Date().toISOString().slice(0, 10);
      let signatureDate = '';
      let propertyValue = 0;
      let grossCommissionPercent = 5;
      let grossCommissionValue = 0;
      let brokerSplitPercent = 50;
      let brokerNetCommission = 0;
      let bonusAmount = 0;
      let bonusDescription = '';
      let totalBrokerReceivable = 0;
      let status: DealStatus = 'em_andamento';
      let notes = '';

      for (const origKey of Object.keys(row)) {
        const normKey = normalizeHeader(origKey);
        const val = row[origKey];

        if (normKey.includes('imovel') || normKey.includes('empreendimento') || normKey.includes('titulo') || normKey === 'propertytitle' || normKey === 'unidade') {
          propertyTitle = String(val || '').trim();
        } else if (normKey.includes('cliente') || normKey.includes('comprador') || normKey === 'clientname' || normKey === 'nome') {
          clientName = String(val || '').trim();
        } else if (normKey.includes('fone') || normKey.includes('tel') || normKey.includes('celular') || normKey === 'clientphone') {
          clientPhone = String(val || '').trim();
        } else if (normKey.includes('tipo') || normKey === 'propertytype') {
          propertyType = parsePropertyType(val);
        } else if (normKey.includes('categoria') || normKey.includes('agenc') || normKey === 'dealcategory') {
          dealCategory = parseDealCategory(val);
        } else if (normKey.includes('construtora') || normKey.includes('incorporadora') || normKey.includes('parceiro') || normKey.includes('imobiliaria') || normKey === 'developeroragency') {
          developerOrAgency = String(val || '').trim() || 'Torresul Imobiliária';
        } else if (normKey.includes('assinatura') || normKey === 'signaturedate') {
          signatureDate = parseDate(val);
        } else if (normKey.includes('datacontrato') || normKey.includes('data') || normKey.includes('fechamento') || normKey === 'contractdate') {
          contractDate = parseDate(val);
        } else if (normKey.includes('vgv') || normKey.includes('valorimovel') || normKey.includes('valorvenda') || normKey === 'propertyvalue' || normKey === 'valor') {
          propertyValue = parseNumber(val);
        } else if (normKey.includes('comissaobruta') || normKey.includes('perccomissao') || normKey.includes('comissaototal') || normKey === 'grosscommissionpercent') {
          grossCommissionPercent = parseNumber(val);
        } else if (normKey.includes('valorcomissaobruta') || normKey === 'grosscommissionvalue') {
          grossCommissionValue = parseNumber(val);
        } else if (normKey.includes('repasse') || normKey.includes('split') || normKey === 'brokersplitpercent') {
          brokerSplitPercent = parseNumber(val);
        } else if (normKey.includes('comissaoliquida') || normKey.includes('netcommission') || normKey === 'brokernetcommission') {
          brokerNetCommission = parseNumber(val);
        } else if (normKey.includes('bonus') || normKey.includes('premiacao') || normKey === 'bonusamount') {
          bonusAmount = parseNumber(val);
        } else if (normKey.includes('descricaobonus') || normKey.includes('motivobonus') || normKey === 'bonusdescription') {
          bonusDescription = String(val || '').trim();
        } else if (normKey.includes('totalreceber') || normKey.includes('totalcorretor') || normKey === 'totalbrokerreceivable') {
          totalBrokerReceivable = parseNumber(val);
        } else if (normKey.includes('status') || normKey.includes('situacao')) {
          status = parseDealStatus(val);
        } else if (normKey.includes('obs') || normKey.includes('nota') || normKey === 'notes') {
          notes = String(val || '').trim();
        }
      }

      // Se a linha não tiver nome de imóvel nem cliente, ignora
      if (!propertyTitle && !clientName && propertyValue === 0) {
        return;
      }

      if (!propertyTitle) {
        propertyTitle = `Imóvel #${index + 1}`;
      }
      if (!clientName) {
        clientName = `Cliente #${index + 1}`;
      }

      // Cálculos automáticos de segurança se não preenchidos
      if (grossCommissionValue === 0 && propertyValue > 0) {
        grossCommissionValue = (propertyValue * (grossCommissionPercent || 5)) / 100;
      }
      if (brokerNetCommission === 0 && grossCommissionValue > 0) {
        brokerNetCommission = (grossCommissionValue * (brokerSplitPercent || 50)) / 100;
      }
      if (totalBrokerReceivable === 0) {
        totalBrokerReceivable = brokerNetCommission + bonusAmount;
      }

      const dealId = `deal_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`;

      // Gera parcela única padrão se não houver parcelamento explícito
      const defaultInstallment: Installment = {
        id: `inst_${dealId}_1`,
        dealId,
        dealTitle: propertyTitle,
        installmentNumber: 1,
        totalInstallments: 1,
        title: 'Comissão Única / Saldo Integral',
        amount: totalBrokerReceivable,
        dueDate: contractDate,
        status: status === 'concluido' ? 'recebido' : 'pendente',
        receivedDate: status === 'concluido' ? contractDate : undefined,
      };

      const deal: ContractDeal = {
        id: dealId,
        propertyTitle,
        propertyType,
        dealCategory,
        clientName,
        clientPhone: clientPhone || undefined,
        developerOrAgency: developerOrAgency || 'Torresul Imobiliária',
        contractDate,
        signatureDate: signatureDate || contractDate,
        propertyValue,
        grossCommissionPercent,
        grossCommissionValue,
        brokerSplitPercent,
        brokerNetCommission,
        bonusAmount,
        bonusDescription: bonusDescription || undefined,
        totalBrokerReceivable,
        installments: [defaultInstallment],
        status,
        notes: notes || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      importedDeals.push(deal);
    });

    if (importedDeals.length === 0) {
      return { deals: [], error: 'Nenhum contrato válido pôde ser importado da planilha.' };
    }

    return { deals: importedDeals };
  } catch (error: any) {
    console.error('Erro na importação de planilha:', error);
    return { deals: [], error: error?.message || 'Falha ao ler o arquivo Excel.' };
  }
}

/**
 * Gera e baixa uma planilha modelo do Excel (.xlsx) para o corretor preencher
 */
export function downloadExcelTemplate() {
  const sampleData = [
    {
      'Imóvel / Empreendimento': 'Residencial Blumenau Park - Apto 302',
      'Tipo de Imóvel': 'apartamento',
      'Categoria': 'venda_direta',
      'Cliente': 'João Carlos da Silva',
      'Telefone': '(47) 99876-5432',
      'Construtora / Imobiliária': 'Torresul Imobiliária',
      'Data Contrato': new Date().toISOString().slice(0, 10),
      'Valor do Imóvel (VGV)': 320000,
      '% Comissão Bruta': 5,
      '% Repasse Corretor': 50,
      'Bônus / Premiação': 1000,
      'Descrição Bônus': 'Campanha de Aceleração',
      'Status': 'em_andamento',
      'Observações': 'Contrato Caixa aprovado',
    },
    {
      'Imóvel / Empreendimento': 'Casa Alphaville - Lote 14',
      'Tipo de Imóvel': 'casa',
      'Categoria': 'agenciamento',
      'Cliente': 'Mariana Souza',
      'Telefone': '(47) 98765-4321',
      'Construtora / Imobiliária': 'Particular',
      'Data Contrato': new Date().toISOString().slice(0, 10),
      'Valor do Imóvel (VGV)': 550000,
      '% Comissão Bruta': 6,
      '% Repasse Corretor': 50,
      'Bônus / Premiação': 0,
      'Descrição Bônus': '',
      'Status': 'concluido',
      'Observações': 'Escritura lavrada',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contratos_Torresul');

  XLSX.writeFile(workbook, `modelo_importacao_contratos_torresul.xlsx`);
}
