const valorImovel = 200000;
const adimplencia = 50000;
const financiamento = 200000; // 80% of 250k
const totalNominal = financiamento; // 200000
const totalEntradaComJuros = 0;
const fgts = 0;
const subsidio = 0;
const impostoAdimplencia = 0;
const jurosAdimplenciaNoTotal = 0;

const totalNegociacao = totalEntradaComJuros + financiamento + fgts + subsidio + adimplencia + impostoAdimplencia + jurosAdimplenciaNoTotal;

console.log("totalNegociacao:", totalNegociacao);
