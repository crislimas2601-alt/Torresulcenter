import { ProposalData, ProposalTotals, ParcelamentoItem, ReforcoItem } from '../types';

/**
  * Safely round number to 2 decimal places to avoid floating point precision issues
  */
export function round2(val: number): number {
  if (isNaN(val) || val === null || val === undefined) return 0;
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates estimated grace period months between base date and first installment due date.
 * Assumes a normal first installment occurs in ~30 days (1 month).
 * Cap at 36 months to prevent bogus dates.
 */
export function calculateGraceMonths(dueDateStr?: string, baseDateStr?: string): number {
  if (!dueDateStr) return 0;
  try {
    const cleanDue = dueDateStr.trim().slice(0, 10);
    if (!cleanDue || cleanDue.length < 10) return 0;
    const dueYear = parseInt(cleanDue.slice(0, 4), 10);
    if (isNaN(dueYear) || dueYear < 2020 || dueYear > 2060) return 0;

    let cleanBase = (baseDateStr && baseDateStr.trim().length >= 10) ? baseDateStr.trim().slice(0, 10) : '';
    const nowIso = new Date().toISOString().slice(0, 10);
    if (!cleanBase || parseInt(cleanBase.slice(0, 4), 10) < 2020) {
      cleanBase = nowIso;
    }

    const due = new Date(cleanDue + 'T12:00:00');
    const base = new Date(cleanBase + 'T12:00:00');
    if (isNaN(due.getTime()) || isNaN(base.getTime())) return 0;

    const yearDiff = due.getFullYear() - base.getFullYear();
    const monthDiff = due.getMonth() - base.getMonth();
    const dayDiff = due.getDate() - base.getDate();

    let totalMonths = yearDiff * 12 + monthDiff;
    if (dayDiff > 15) {
      totalMonths += 1;
    } else if (dayDiff < -15) {
      totalMonths -= 1;
    }

    // Normal first installment happens in 1 month (approx. 30 days)
    const graceMonths = totalMonths - 1;
    if (graceMonths <= 0) return 0;
    // Cap at 60 months to prevent bogus dates/calculations
    return Math.min(60, graceMonths);
  } catch {
    return 0;
  }
}

/**
 * Calculates interest on an individual reforço (balloon payment).
 * Can be simple interest accumulated over months or custom interest amount.
 */
export function calculateReforcoItem(r: ReforcoItem): {
  valorJuros: number;
  valorTotalComJuros: number;
} {
  const nominal = Math.max(0, r.valor || 0);
  if (!r.temJuros || nominal <= 0) {
    return { valorJuros: 0, valorTotalComJuros: nominal };
  }
  const taxaMes = (r.taxaJuros !== undefined ? r.taxaJuros : 1.0) / 100;
  const meses = Math.max(1, r.mesesJuros !== undefined ? r.mesesJuros : 12);

  // If user provided a specific valorJuros manually, use it; otherwise compute simple interest
  let juros = r.valorJuros !== undefined && r.valorJuros > 0 && r.taxaJuros === undefined
    ? round2(r.valorJuros)
    : round2(nominal * taxaMes * meses);

  return {
    valorJuros: juros,
    valorTotalComJuros: round2(nominal + juros),
  };
}

/**
 * Calculates an individual installment series with Price, Simple, or 0% interest,
 * including optional grace period interest (carência) and diluted interest (adimplência and reforços).
 */
export function calculateParcelamentoItem(p: ParcelamentoItem): {
  valorParcelaCalculada: number;
  valorTotalComJuros: number;
  jurosCarenciaCalculado: number;
  capitalComCarencia: number;
} {
  const rawCapital = Math.max(0, p.totalSemJuros || 0);
  const n = Math.max(1, p.quantidadeParcelas || 1);
  const rateMonth = (p.jurosAoMes || 0) / 100;
  const tipo = p.tipoCalculo || 'price';

  // Juros de Carência / Início Futuro
  let jurosCarenciaCalculado = 0;
  let capital = rawCapital;
  const mesesCarencia = Math.max(0, p.mesesCarencia || 0);

  if (p.temCarencia && mesesCarencia > 0 && rateMonth > 0 && rawCapital > 0) {
    if (tipo === 'simples') {
      jurosCarenciaCalculado = round2(rawCapital * rateMonth * mesesCarencia);
      capital = round2(rawCapital + jurosCarenciaCalculado);
    } else if (tipo === 'price') {
      // Juros compostos de carência sobre o saldo inicial (regra padrão da imobiliária / construtora)
      capital = round2(rawCapital * Math.pow(1 + rateMonth, mesesCarencia));
      jurosCarenciaCalculado = round2(capital - rawCapital);
    }
  }

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
    jurosCarenciaCalculado,
    capitalComCarencia: capital,
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
  const baseDateStr = proposal.dataAto || proposal.createdAt?.slice(0, 10);
  const parcelamentosRecalculados: ParcelamentoItem[] = (proposal.parcelamentos || []).map((p) => {
    const autoMonths = p.temCarencia
      ? (calculateGraceMonths(p.dataVencimento, baseDateStr) || p.mesesCarencia || 1)
      : 0;
    const itemToCalc: ParcelamentoItem = {
      ...p,
      mesesCarencia: autoMonths,
    };
    const calc = calculateParcelamentoItem(itemToCalc);
    
    return {
      ...itemToCalc,
      valorParcelaCalculada: calc.valorParcelaCalculada,
      valorTotalComJuros: calc.valorTotalComJuros,
      jurosCarenciaCalculado: calc.jurosCarenciaCalculado,
    };
  });

  const totalParcelamentosSemJuros = round2(
    (proposal.parcelamentos || []).reduce((acc, cur) => acc + (cur.totalSemJuros || 0), 0)
  );

  const totalParcelamentosComJuros = round2(
    parcelamentosRecalculados.reduce((acc, cur) => acc + (cur.valorTotalComJuros || 0), 0)
  );

  // Reforços: nominal vs com juros (somente se não diluídos nas parcelas mensais)
  const totalReforcosSemJuros = round2(
    (proposal.reforcos || []).reduce((acc, cur) => acc + (cur.valor || 0), 0)
  );

  let totalJurosReforcosDiluidos = 0;
  const totalReforcosComJuros = round2(
    (proposal.reforcos || []).reduce((acc, cur) => {
      const calc = calculateReforcoItem(cur);
      if (cur.temJuros && cur.diluirNasMensais) {
        totalJurosReforcosDiluidos += calc.valorJuros;
        // Juro vai para as mensais, logo o saldo deste reforço permanece o nominal
        return acc + (cur.valor || 0);
      }
      return acc + (cur.temJuros ? calc.valorTotalComJuros : (cur.valor || 0));
    }, 0)
  );
  totalJurosReforcosDiluidos = round2(totalJurosReforcosDiluidos);

  const totalReforcos = totalReforcosSemJuros;

  const totalEntradaSemJuros = round2(ato + totalParcelamentosSemJuros + totalReforcosSemJuros);
  const totalEntradaComJuros = round2(ato + totalParcelamentosComJuros + totalReforcosComJuros);

  // Se o juros da adimplência for no total:
  const jurosAdimplenciaNoTotal = proposal.tipoJurosAdimplencia === 'total' ? jurosAdimplencia : 0;

  // Total Nominal sem juros adicionais
  const totalNominal = round2(totalEntradaSemJuros + financiamento + fgts + subsidio);

  // Total da Negociação (com juros gerados, adimplência, imposto e juros da adimplência se for no total)
  const totalNegociacao = round2(totalEntradaComJuros + financiamento + fgts + subsidio + adimplencia + impostoAdimplencia + jurosAdimplenciaNoTotal);

  // Diferença em relação ao valor do imóvel (positivo = falta valor; negativo = excedeu)
  // O valor nominal (Entrada + Financiamento) deve cobrir o valor do contrato (valorImovel + impostos)
  const diferencaImovel = round2((valorImovel + impostoAdimplencia) - totalNominal);

  return {
    totalEntradaSemJuros,
    totalEntradaComJuros,
    totalParcelamentosSemJuros,
    totalReforcos,
    totalReforcosComJuros,
    totalJurosReforcosDiluidos,
    totalNominal,
    totalNegociacao,
    diferencaImovel,
    parcelamentosRecalculados,
  };
}
