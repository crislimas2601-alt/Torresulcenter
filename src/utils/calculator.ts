import { ProposalData, ProposalTotals, ParcelamentoItem } from '../types';

/**
  * Safely round number to 2 decimal places to avoid floating point precision issues
  */
export function round2(val: number): number {
  if (isNaN(val) || val === null || val === undefined) return 0;
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
  * Calculates an individual installment series with Price, Simple, or 0% interest,
  * including optional diluted interest (adimplência and reforços).
  */
export function calculateParcelamentoItem(p: ParcelamentoItem): {
  valorParcelaCalculada: number;
  valorTotalComJuros: number;
} {
  const capital = Math.max(0, p.totalSemJuros || 0);
  const n = Math.max(1, p.quantidadeParcelas || 1);
  const rateMonth = (p.jurosAoMes || 0) / 100;
  const tipo = p.tipoCalculo || 'price';

  let baseInstallment = 0;
  let baseTotalWithInterest = 0;

  if (capital <= 0 || n <= 0) {
    baseInstallment = 0;
    baseTotalWithInterest = 0;
  } else if (tipo === 'sem_juros' || rateMonth <= 0) {
    baseInstallment = round2(capital / n);
    baseTotalWithInterest = capital;
  } else if (tipo === 'simples') {
    // Juros Simples: J = C * i * n -> Total = C * (1 + i * n)
    baseTotalWithInterest = round2(capital * (1 + rateMonth * n));
    baseInstallment = round2(baseTotalWithInterest / n);
  } else {
    // Tabela Price: PMT = C * [i / (1 - (1 + i)^-n)]
    const factor = rateMonth / (1 - Math.pow(1 + rateMonth, -n));
    baseInstallment = round2(capital * factor);
    baseTotalWithInterest = round2(baseInstallment * n);
  }

  // Juros Diluídos (Adimplência e/ou Reforços)
  let extraDilutedInterest = 0;
  if (p.temJurosDiluidos) {
    extraDilutedInterest = round2(
      (p.jurosAdimplenciaDiluido || 0) + (p.jurosReforcosDiluido || 0)
    );
  }

  const dilutedPerInstallment = n > 0 ? round2(extraDilutedInterest / n) : 0;
  const finalInstallment = round2(baseInstallment + dilutedPerInstallment);
  const finalTotalWithInterest = round2(baseTotalWithInterest + extraDilutedInterest);

  return {
    valorParcelaCalculada: finalInstallment,
    valorTotalComJuros: finalTotalWithInterest,
  };
}

/**
  * Calculates full proposal financial totals, balance difference, and recalculates all parcelamento items
  */
export function calculateProposalTotals(proposal: ProposalData): ProposalTotals {
  const ato = round2(proposal.ato || 0);
  const valorImovel = round2(proposal.valorImovel || 0);
  const financiamento = round2(proposal.financiamento || 0);
  const fgts = round2(proposal.fgts || 0);
  const subsidio = round2(proposal.subsidio || 0);
  const adimplencia = proposal.temAdimplencia ? round2(proposal.valorAdimplencia || 0) : 0;

  // Juros Adimplência
  let jurosAdimplencia = 0;
  if (proposal.temAdimplencia && proposal.temJurosAdimplencia) {
    const percJuros = proposal.percentualJurosAdimplencia || 0;
    jurosAdimplencia = round2(adimplencia * (percJuros / 100));
  }

  // Imposto Adimplência
  let impostoAdimplencia = 0;
  if (proposal.temAdimplencia && proposal.temImpostoAdimplencia) {
    if ((proposal.valorImpostoAdimplencia || 0) > 0) {
      impostoAdimplencia = round2(proposal.valorImpostoAdimplencia || 0);
    } else {
      const percImposto = proposal.percentualImpostoAdimplencia || 0;
      impostoAdimplencia = round2(adimplencia * (percImposto / 100));
    }
  }

  // Recalculate each parcelamento item
  const parcelamentosRecalculados: ParcelamentoItem[] = (proposal.parcelamentos || []).map((p) => {
    const calc = calculateParcelamentoItem(p);
    let extraJurosAdimplencia = 0;
    
    // Se o juros da adimplência for diluído nos parcelamentos, dividimos proporcionalmente ou apenas adicionamos?
    // Para simplificar, se o usuário escolher 'parcelamentos', ele deve preencher 'jurosAdimplenciaDiluido' manualmente na parcela.
    // Mas se quisermos automatizar:
    
    return {
      ...p,
      valorParcelaCalculada: calc.valorParcelaCalculada,
      valorTotalComJuros: calc.valorTotalComJuros,
    };
  });

  const totalParcelamentosSemJuros = round2(
    (proposal.parcelamentos || []).reduce((acc, cur) => acc + (cur.totalSemJuros || 0), 0)
  );

  const totalParcelamentosComJuros = round2(
    parcelamentosRecalculados.reduce((acc, cur) => acc + (cur.valorTotalComJuros || 0), 0)
  );

  const totalReforcos = round2(
    (proposal.reforcos || []).reduce((acc, cur) => acc + (cur.valor || 0), 0)
  );

  const totalEntradaSemJuros = round2(ato + totalParcelamentosSemJuros + totalReforcos);
  const totalEntradaComJuros = round2(ato + totalParcelamentosComJuros + totalReforcos);

  // Se o juros da adimplência for no total:
  const jurosAdimplenciaNoTotal = proposal.tipoJurosAdimplencia === 'total' ? jurosAdimplencia : 0;

  // Total Nominal sem juros adicionais
  const totalNominal = round2(totalEntradaSemJuros + financiamento + fgts + subsidio);

  // Total da Negociação (com juros gerados, adimplência, imposto e juros da adimplência se for no total)
  const totalNegociacao = round2(totalEntradaComJuros + financiamento + fgts + subsidio + adimplencia + impostoAdimplencia + jurosAdimplenciaNoTotal);

  // Diferença em relação ao valor do imóvel (positivo = falta valor; negativo = excedeu)
  // Como o imposto da adimplência vai "no valor do contrato", o valorImovel deve teoricamente ser acrescido desse imposto na comparação
  const diferencaImovel = round2((valorImovel + impostoAdimplencia) - (totalNominal + adimplencia));

  return {
    totalEntradaSemJuros,
    totalEntradaComJuros,
    totalParcelamentosSemJuros,
    totalReforcos,
    totalNominal,
    totalNegociacao,
    diferencaImovel,
    parcelamentosRecalculados,
  };
}
