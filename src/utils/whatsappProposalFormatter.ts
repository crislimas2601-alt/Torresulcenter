import { ProposalData } from '../types';
import { calculateProposalTotals } from './calculator';
import { formatBRL, formatDateBR } from './formatter';

/**
 * Generates a clean, minimalistic and straightforward proposal summary for WhatsApp.
 * Direct and human, no robotic or corporate fluff.
 * Excludes total with interest.
 * Terms:
 * - "Desconto concedido: R$ ..." instead of "taxa"
 * - Ato: only the date and value to be paid (e.g. "Ato: 23/09/2026 - R$ 5.000,00"), no "na assinatura"
 * - Installments: labeled as "Parcelamento 1", "Parcelamento 2", etc.
 */
export function formatClientProposalSummaryForWhatsApp(
  proposal: ProposalData,
  _clientCustomName?: string
): string {
  const totals = calculateProposalTotals(proposal);
  const lines: string[] = [];

  lines.push('*Resumo da Proposta*');
  lines.push('');

  // 1. Dados Básicos do Imóvel
  if (proposal.numeroUnidade && proposal.numeroUnidade.trim()) {
    lines.push(`Unidade: ${proposal.numeroUnidade.trim()}`);
  }
  lines.push(`Imóvel: ${formatBRL(proposal.valorImovel || 0)}`);

  // Desconto Concedido (se houver)
  if (proposal.temAdimplencia && (proposal.valorAdimplencia || 0) > 0) {
    lines.push(`Desconto concedido: ${formatBRL(proposal.valorAdimplencia)}`);
  }

  // Ato: data que o cliente vai pagar e o valor (sem escrever 'na assinatura')
  const dataAtoFormatada = proposal.dataAto ? formatDateBR(proposal.dataAto) : '';
  if (dataAtoFormatada) {
    lines.push(`Ato: ${dataAtoFormatada} - ${formatBRL(proposal.ato || 0)}`);
  } else {
    lines.push(`Ato: ${formatBRL(proposal.ato || 0)}`);
  }

  // 2. Parcelamentos Mensais com 'Parcelamento 1', 'Parcelamento 2', etc.
  if (proposal.parcelamentos && proposal.parcelamentos.length > 0) {
    lines.push('');
    proposal.parcelamentos.forEach((p, index) => {
      const recalculated = totals.parcelamentosRecalculados.find((r) => r.id === p.id) || p;
      const vcto = p.dataVencimento ? formatDateBR(p.dataVencimento) : '';
      const vctoStr = vcto ? ` (1º vencimento: ${vcto})` : '';
      lines.push(
        `Parcelamento ${index + 1}: ${p.quantidadeParcelas}x de ${formatBRL(recalculated.valorParcelaCalculada)}${vctoStr}`
      );
    });
  }

  // 3. Reforços (Parcelas anuais / balões)
  const validReforcos = (proposal.reforcos || []).filter((r) => (r.valor || 0) > 0);
  if (validReforcos.length > 0) {
    lines.push('');
    lines.push('Reforços:');
    validReforcos.forEach((r, idx) => {
      const vencimento =
        r.tipoVencimento === 'texto' && r.textoVencimento
          ? r.textoVencimento
          : r.dataVencimento
          ? formatDateBR(r.dataVencimento)
          : '';
      const vctoStr = vencimento ? ` (${vencimento})` : '';
      lines.push(`• Reforço ${idx + 1}: ${formatBRL(r.valor)}${vctoStr}`);
    });
  }

  // 4. Recursos complementares (FGTS, Subsídio, Financiamento)
  const hasFgts = (proposal.fgts || 0) > 0;
  const hasSubsidio = (proposal.subsidio || 0) > 0;
  const hasFinanciamento = (proposal.financiamento || 0) > 0;

  if (hasFgts || hasSubsidio || hasFinanciamento) {
    lines.push('');
    if (hasFgts) {
      lines.push(`FGTS: ${formatBRL(proposal.fgts)}`);
    }
    if (hasSubsidio) {
      lines.push(`Subsídio: ${formatBRL(proposal.subsidio)}`);
    }
    if (hasFinanciamento) {
      lines.push(`Financiamento: ${formatBRL(proposal.financiamento)}`);
    }
  }

  return lines.join('\n').trim();
}

