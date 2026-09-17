import { ProposalData } from '../types';
import { formatBRL, formatDateBR } from './formatter';
import { calculateProposalTotals, round2 } from './calculator';

/**
 * Generates the standardized contract draft text for Torresul Imobiliária Back Office,
 * matching the exact plain-text format shown in the reference tool without client/unit headers.
 */
export function generateContractText(proposal: ProposalData): string {
  const totals = calculateProposalTotals(proposal);
  const lines: string[] = [];

  const adimplencia = proposal.temAdimplencia ? round2(proposal.valorAdimplencia || 0) : 0;
  let impostoAdimplencia = 0;
  if (proposal.temAdimplencia && proposal.temImpostoAdimplencia) {
    if ((proposal.valorImpostoAdimplencia || 0) > 0) {
      impostoAdimplencia = round2(proposal.valorImpostoAdimplencia || 0);
    } else {
      const percImposto = proposal.percentualImpostoAdimplencia || 0;
      impostoAdimplencia = round2(adimplencia * (percImposto / 100));
    }
  }

  let jurosAdimplencia = 0;
  if (proposal.temAdimplencia && proposal.temJurosAdimplencia) {
    const percJuros = proposal.percentualJurosAdimplencia || 0;
    jurosAdimplencia = round2(adimplencia * (percJuros / 100));
  }

  // 1. Valor do imóvel para contrato
  if (impostoAdimplencia > 0) {
    lines.push(`Valor do imóvel para contrato: ${formatBRL(proposal.valorImovel + impostoAdimplencia)} (Inclui imposto de desconto avaliado de ${formatBRL(impostoAdimplencia)})`);
  } else {
    lines.push(`Valor do imóvel para contrato: ${formatBRL(proposal.valorImovel)}`);
  }
  lines.push('');

  // 2. Desconto Avaliado (se houver)
  if (proposal.temAdimplencia && proposal.valorAdimplencia > 0) {
    lines.push(`Desconto Avaliado: ${formatBRL(proposal.valorAdimplencia)}`);
    if (proposal.temJurosAdimplencia && proposal.tipoJurosAdimplencia === 'total' && jurosAdimplencia > 0) {
      lines.push(`Juros do Desconto Avaliado (Diluído no Total): ${formatBRL(jurosAdimplencia)} (${proposal.percentualJurosAdimplencia}%)`);
    }
    lines.push('');
  }

  // 3. Valor total da negociação
  const totalJuros = totals.totalEntradaComJuros - totals.totalEntradaSemJuros;
  const valorDescontoAvaliado = proposal.temAdimplencia ? round2(proposal.valorAdimplencia || 0) : 0;
  const somaJurosEDesconto = round2(totalJuros + valorDescontoAvaliado);
  
  if (somaJurosEDesconto > 0) {
    lines.push(`Valor total da negociação (com ${formatBRL(somaJurosEDesconto)} de juros e desc. avaliado): ${formatBRL(totals.totalNegociacao)}`);
  } else {
    lines.push(`Valor total da negociação: ${formatBRL(totals.totalNegociacao)}`);
  }
  lines.push('');

  // 4. Valor total da entrada
  lines.push(`Valor total da entrada: ${formatBRL(totals.totalEntradaSemJuros)}`);
  lines.push('');

  // 5. Valor do ato
  lines.push(`Valor do ato (a ser pago na assinatura do contrato de compra e venda): ${formatBRL(proposal.ato || 0)}`);
  lines.push('');

  // 6. Parcelamentos
  if (proposal.parcelamentos && proposal.parcelamentos.length > 0) {
    proposal.parcelamentos.forEach((p, idx) => {
      const defaultTitle = idx === 0 ? 'Parcelamento (Mensal)' : `Parcelamento ${idx + 1}`;
      const title = p.title?.trim() || defaultTitle;
      const recalculated = totals.parcelamentosRecalculados.find((r) => r.id === p.id) || p;
      const vcto = p.dataVencimento ? formatDateBR(p.dataVencimento) : 'A definir';
      const parcelasStr = String(p.quantidadeParcelas).padStart(2, '0');
      const jurosFormatted = (p.jurosAoMes || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      lines.push(`${title}: Valor total sem juros ${formatBRL(p.totalSemJuros)}`);
      lines.push(`Valor total com juros: ${formatBRL(recalculated.valorTotalComJuros)} Juros de ${jurosFormatted}%`);

      let parcelaLine = `${parcelasStr} Parcelas de ${formatBRL(recalculated.valorParcelaCalculada)} primeiro vencimento para ${vcto}`;
      if (p.temJurosDiluidos) {
        const adimp = p.jurosAdimplenciaDiluido ? `desc. aval. ${formatBRL(p.jurosAdimplenciaDiluido)}` : '';
        const ref = p.jurosReforcosDiluido ? `reforços ${formatBRL(p.jurosReforcosDiluido)}` : '';
        const details = [adimp, ref].filter(Boolean).join(' e ');
        if (details) {
          parcelaLine += ` [Inclui juros diluídos: ${details}]`;
        }
      }
      lines.push(parcelaLine);
      lines.push('');
    });
  }

  // 7. Reforços (parcelas anuais - só exibe se houver reforço com valor > 0)
  const validReforcos = (proposal.reforcos || []).filter((r) => (r.valor || 0) > 0);
  if (validReforcos.length > 0 && totals.totalReforcos > 0) {
    lines.push(`Reforços (parcelas anuais): ${formatBRL(totals.totalReforcos)}`);
    lines.push(`Valor nominal: ${formatBRL(totals.totalReforcos)}`);
    lines.push(`Valor com juros: ${formatBRL(totals.totalReforcos)}`);
    validReforcos.forEach((r, idx) => {
      const rTitle = r.title?.trim() || `Reforço ${idx + 1}`;
      const vencimento =
        r.tipoVencimento === 'texto' && r.textoVencimento
          ? r.textoVencimento
          : r.dataVencimento
          ? formatDateBR(r.dataVencimento)
          : 'A definir';
      lines.push(`${rTitle}: ${formatBRL(r.valor)} vencimento: ${vencimento}`);
    });
    lines.push('');
  }

  // 8. Recursos Bancários & FGTS
  if (proposal.fgts && proposal.fgts > 0) {
    lines.push(`Valor do FGTS: ${formatBRL(proposal.fgts)}`);
    lines.push('');
  }

  if (proposal.subsidio && proposal.subsidio > 0) {
    lines.push(`Subsídio: ${formatBRL(proposal.subsidio)}`);
    lines.push('');
  }

  if (proposal.financiamento && proposal.financiamento > 0) {
    lines.push(`Valor do Financiamento: ${formatBRL(proposal.financiamento)}`);
    const banco = proposal.bancoFinanciamento || 'CEF';
    const corr = proposal.correspondente ? ` (Correspondente: ${proposal.correspondente})` : '';
    lines.push(`Financiamento aprovado no banco ${banco}${corr}`);
    lines.push('');
  }

  // 9. Garantias & Condições
  if (proposal.avalista?.temAvalista) {
    const av = proposal.avalista;
    const parts = [
      `Nome: ${av.nome || 'A preencher'}`,
      av.email ? `E-mail: ${av.email}` : '',
      av.telefone ? `Telefone: ${av.telefone}` : '',
      av.profissao ? `Profissão: ${av.profissao}` : '',
    ].filter(Boolean);
    lines.push(`Avalista: SIM (${parts.join(', ')})`);
    lines.push('');
  }

  if (proposal.promissoria) {
    lines.push('Nota Promissória: SIM (Exigência de emissão para garantia do parcelamento)');
    lines.push('');
  }

  if (proposal.ficaramMoveis) {
    lines.push(`Móveis no Imóvel Usado: SIM`);
    if (proposal.descricaoMoveis) {
      lines.push(`Descrição: ${proposal.descricaoMoveis}`);
    }
    lines.push('');
  }

  // 10. Comissão
  const comissaoTotal = proposal.comissaoManual
    ? (proposal.comissaoValor || 0)
    : (((proposal.valorImovelComissao || proposal.valorImovel) * (proposal.comissaoPercent || 0)) / 100);

  if (comissaoTotal > 0) {
    lines.push(`Comissão de Corretagem: ${formatBRL(comissaoTotal)} (${proposal.comissaoPercent || 0}%)`);
    lines.push(`Forma de pagamento da comissão: ${proposal.pagamentoComissao || '100% na liberação de recurso do financiamento.'}`);
    lines.push('');
  }

  return lines.join('\n').trim();
}
