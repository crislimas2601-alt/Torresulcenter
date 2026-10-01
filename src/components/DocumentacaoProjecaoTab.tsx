import React, { useState, useEffect } from 'react';
import { ProposalData } from '../types';
import { formatBRL, round2 } from '../utils/formatter';
import { CurrencyInput } from './CurrencyInput';
import {
  Landmark,
  Building2,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Share2,
  Receipt,
  Scale,
  AlertCircle
} from 'lucide-react';

export type CidadeDocumentacao = 'blumenau' | 'indaial';
export type ModalidadeFinanciamentoDoc = 'individual' | 'associativo';
export type CartorioRegistroDoc = 
  | '1_oficio_blumenau' 
  | '2_oficio_blumenau' 
  | '3_oficio_blumenau' 
  | 'ri_indaial';

interface DocumentacaoProjecaoTabProps {
  proposal: ProposalData;
  onUpdateProposal?: (updates: Partial<ProposalData>) => void;
}

export const DocumentacaoProjecaoTab: React.FC<DocumentacaoProjecaoTabProps> = ({
  proposal,
}) => {
  // Configuração principal da projeção
  const [cidade, setCidade] = useState<CidadeDocumentacao>('blumenau');
  const [modalidade, setModalidade] = useState<ModalidadeFinanciamentoDoc>('individual');

  // Valores base (iniciam com os valores da proposta ou do exemplo da planilha)
  const [valorImovel, setValorImovel] = useState<number>(() => proposal.valorImovel || 420000);
  const [financiamento, setFinanciamento] = useState<number>(() => proposal.financiamento || 320000);
  const [fgts, setFgts] = useState<number>(() => proposal.fgts || 0);
  const [subsidio, setSubsidio] = useState<number>(() => proposal.subsidio || 0);

  // Itens de custo da documentação
  const [despachante, setDespachante] = useState<number>(980);
  const [registroImovel, setRegistroImovel] = useState<number>(3500);
  const [certidaoImovel, setCertidaoImovel] = useState<number>(100);
  const [certidaoEstadoCivil, setCertidaoEstadoCivil] = useState<number>(100);
  const [quantidadeCpfs, setQuantidadeCpfs] = useState<number>(1);
  const [valorAssinaturaCpf, setValorAssinaturaCpf] = useState<number>(54);

  // Tarifa bancária (com flag para customização)
  const [tarifaBancariaManual, setTarifaBancariaManual] = useState<number | null>(null);
  const [incluirRelacionamentoIndividual, setIncluirRelacionamentoIndividual] = useState<boolean>(false);

  // ITBI (inicia com o valor do Excel para bater exatamente R$ 15.934,00)
  const [itbiManual, setItbiManual] = useState<number | null>(6400);
  const [usandoItbiManual, setUsandoItbiManual] = useState<boolean>(true);

  // Estados de feedback
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);

  // Sincroniza se a proposta mudar na Aba 1
  useEffect(() => {
    if (proposal.valorImovel && proposal.valorImovel !== 235422.5) {
      setValorImovel(proposal.valorImovel);
    }
    if (proposal.financiamento && proposal.financiamento !== 172693.23) {
      setFinanciamento(proposal.financiamento);
    }
  }, [proposal.valorImovel, proposal.financiamento]);

  // Cálculos automáticos:
  // 1. Entrada / Recursos Próprios
  const entradaCalculada = Math.max(0, round2(valorImovel - financiamento - fgts - subsidio));

  // 2. Tarifa Bancária Caixa:
  // Individual: 1,5% do saldo financiado (+ 2000 se taxa de relacionamento marcada)
  // Associativo: R$ 2.000,00 fixo
  const tarifaBancariaCalculada = modalidade === 'associativo'
    ? 2000
    : round2((financiamento * 0.015) + (incluirRelacionamentoIndividual ? 2000 : 0));

  const tarifaBancariaFinal = tarifaBancariaManual !== null ? tarifaBancariaManual : tarifaBancariaCalculada;

  // 3. ITBI Automático (Regras Municipais Blumenau / Indaial):
  // Blumenau: 2% sobre Entrada + Subsídio; 1% sobre Saldo Financiado + FGTS
  // Indaial: 2% sobre Entrada + Subsídio; 1,5% sobre Saldo Financiado + FGTS
  const itbiAliquotaFinanciado = cidade === 'indaial' ? 0.015 : 0.010;
  const itbiBaseEntrada = round2((entradaCalculada + subsidio) * 0.02);
  const itbiBaseFinanciado = round2((financiamento + fgts) * itbiAliquotaFinanciado);
  const itbiCalculadoLei = round2(itbiBaseEntrada + itbiBaseFinanciado);

  const itbiFinal = usandoItbiManual && itbiManual !== null ? itbiManual : itbiCalculadoLei;

  // 4. Assinatura Digital
  const assinaturaDigitalTotal = round2(quantidadeCpfs * valorAssinaturaCpf);

  // 5. Total Geral da Projeção de Documentação
  const totalProjecao = round2(
    tarifaBancariaFinal +
    despachante +
    registroImovel +
    itbiFinal +
    certidaoImovel +
    certidaoEstadoCivil +
    assinaturaDigitalTotal
  );

  const percentualDoImovel = valorImovel > 0 ? ((totalProjecao / valorImovel) * 100).toFixed(2) : '0.00';

  // Handler para sincronizar da Aba 1 (Proposta atual)
  const handleSincronizarAba1 = () => {
    setValorImovel(proposal.valorImovel || 420000);
    setFinanciamento(proposal.financiamento || 320000);
    setFgts(proposal.fgts || 0);
    setSubsidio(proposal.subsidio || 0);
    setUsandoItbiManual(false);
    setTarifaBancariaManual(null);
  };

  // Texto formatado para envio no WhatsApp
  const gerarTextoWhatsapp = (): string => {
    const nomeCliente = proposal.nomeCliente ? ` para *${proposal.nomeCliente}*` : '';
    const descModalidade = modalidade === 'individual' ? 'Financiamento Individual (CEF)' : 'Crédito Associativo (Planta)';
    const descCidade = cidade === 'blumenau' ? 'Blumenau - SC' : 'Indaial - SC';

    return `📑 *PROJEÇÃO ESTIMADA DE DOCUMENTAÇÃO IMOBILIÁRIA*
${nomeCliente}
📍 *Município:* ${descCidade}
🏦 *Modalidade:* ${descModalidade}

🏢 *DADOS DO IMÓVEL*
• Valor do Imóvel: ${formatBRL(valorImovel)}
• Valor Financiado: ${formatBRL(financiamento)}
${fgts > 0 ? `• FGTS Utilizado: ${formatBRL(fgts)}\n` : ''}${subsidio > 0 ? `• Subsídio MCMV: ${formatBRL(subsidio)}\n` : ''}• Entrada/Recursos Próprios: ${formatBRL(entradaCalculada)}

---------------------------------------------
📋 *DETALHAMENTO DOS CUSTOS DE DOCUMENTAÇÃO:*

1️⃣ *Tarifa Bancária Caixa:* ${formatBRL(tarifaBancariaFinal)}
   _(Engenharia e avaliação inclusa - paga no dia da assinatura na Caixa)_

2️⃣ *Despachante Imobiliário:* ${formatBRL(despachante)}
   _(Acompanhamento do processo - pago após assinatura do contrato)_

3️⃣ *Registro de Imóveis (Estimativa):* ${formatBRL(registroImovel)}
   _(Emolumentos do Cartório de Registro de Imóveis)_

4️⃣ *ITBI (Imposto de Transmissão):* ${formatBRL(itbiFinal)}
   _(Prefeitura Municipal de ${descCidade})_

5️⃣ *Certidão do Imóvel (Inteiro Teor c/ Ônus e Ações):* ${formatBRL(certidaoImovel)}
   _(Validade de 30 dias)_

6️⃣ *Certidão de Estado Civil Atualizada:* ${formatBRL(certidaoEstadoCivil)}
   _(Validade de 90 dias - digital ou física)_

7️⃣ *Assinatura Digital:* ${formatBRL(assinaturaDigitalTotal)} (${quantidadeCpfs} CPF${quantidadeCpfs > 1 ? 's' : ''})
   _(Certificado digital para formalização eletrônica)_

---------------------------------------------
💰 *PROJEÇÃO TOTAL ESTIMADA:* *${formatBRL(totalProjecao)}*
📊 *Equivalente a:* ${percentualDoImovel}% do valor do imóvel

⚠️ *Importante:* Os valores de ITBI e Registro são estimativas baseadas na legislação municipal e tabelas de emolumentos do Estado de SC. Valores sujeitos a confirmação após avaliação dos órgãos competentes.

📲 *Torresul Imobiliária* | Assessoria e Financiamento`;
  };

  const handleCopyWhatsapp = async () => {
    try {
      await navigator.clipboard.writeText(gerarTextoWhatsapp());
      setCopiedWhatsapp(true);
      setTimeout(() => setCopiedWhatsapp(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header com controles de Cidade e Modalidade (Padrão Torresul) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">
              3. Projeção de Documentação
            </h3>
            <p className="text-xs text-slate-500">
              Cálculo estimativo de taxas bancárias, ITBI, registro de imóveis, despachante e certidões
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSincronizarAba1}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Sincronizar com Proposta (Aba 1)</span>
            </button>
          </div>
        </div>

        {/* Seletores: Região e Modalidade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Cidade */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
              Região de Cobrança:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCidade('blumenau')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border ${
                  cidade === 'blumenau'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Blumenau</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  cidade === 'blumenau' ? 'bg-red-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  ITBI 1% / 2%
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCidade('indaial')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border ${
                  cidade === 'indaial'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Indaial</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  cidade === 'indaial' ? 'bg-red-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  ITBI 1,5% / 2%
                </span>
              </button>
            </div>
          </div>

          {/* Modalidade de Financiamento */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
              Modalidade de Financiamento:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setModalidade('individual')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border ${
                  modalidade === 'individual'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Individual (Imóvel Pronto)</span>
              </button>

              <button
                type="button"
                onClick={() => setModalidade('associativo')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border ${
                  modalidade === 'associativo'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Associativo (Na Planta)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CARDS RESUMO (Mesmo padrão da Aba 1 / SummaryCards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total da Documentação */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Total Projeção
            </span>
            <div className="p-1.5 bg-red-50 text-red-600 rounded">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-950 tabular-nums">
              {formatBRL(totalProjecao)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              ~{percentualDoImovel}% do valor do imóvel
            </div>
          </div>
        </div>

        {/* Tarifa Bancária */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tarifa Bancária
            </span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded">
              <Landmark className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900 tabular-nums">
              {formatBRL(tarifaBancariaFinal)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {modalidade === 'individual' ? '1,5% Saldo Financiado' : 'Associativo Caixa'}
            </div>
          </div>
        </div>

        {/* ITBI Municipal */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ITBI ({cidade === 'blumenau' ? 'Blumenau' : 'Indaial'})
            </span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900 tabular-nums">
              {formatBRL(itbiFinal)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Imposto recolhido na Prefeitura
            </div>
          </div>
        </div>

        {/* Registro do Imóvel */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Registro de Imóveis
            </span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-900 tabular-nums">
              {formatBRL(registroImovel)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Estimativa média do cartório
            </div>
          </div>
        </div>
      </div>

      {/* 3. Valores Base para Cálculo */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-base">
            Valores Base do Imóvel
          </h3>
          <p className="text-xs text-slate-500">
            Valores utilizados para o cálculo proporcional das taxas e impostos
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              VALOR DO IMÓVEL (CONTRATO)
            </label>
            <CurrencyInput
              value={valorImovel}
              onChange={setValorImovel}
              className="w-full text-base font-bold text-slate-900 border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              FINANCIAMENTO CAIXA
            </label>
            <CurrencyInput
              value={financiamento}
              onChange={setFinanciamento}
              className="w-full text-base font-bold text-slate-900 border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              FGTS UTILIZADO
            </label>
            <CurrencyInput
              value={fgts}
              onChange={setFgts}
              className="w-full text-base font-bold text-slate-900 border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              ENTRADA (RECURSOS PRÓPRIOS)
            </label>
            <div className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-base font-bold text-slate-900 flex items-center justify-between">
              <span>{formatBRL(entradaCalculada)}</span>
              <span className="text-[10px] text-slate-500 font-normal">Automático</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Composição Detalhada dos Custos (Tabela Limpa) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">
              Discriminação dos Custos de Documentação
            </h3>
            <p className="text-xs text-slate-500">
              Detalhamento de cada item cobrado no processo de financiamento
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {/* 1. Tarifa Bancária */}
          <div className="py-4 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">
                    1. Tarifa Bancária Caixa
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                    {modalidade === 'individual' ? '1,5% do Saldo Financiado' : 'Associativo'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {modalidade === 'individual'
                    ? 'Tarifa bancária de 1,5% sobre o saldo financiado (taxa de engenharia inclusa). Paga na assinatura com a Caixa.'
                    : 'Tarifa de relacionamento do associativo (valor fixo de R$ 2.000,00).'}
                </p>
              </div>

              <div className="w-full sm:w-48">
                <CurrencyInput
                  value={tarifaBancariaFinal}
                  onChange={(val) => setTarifaBancariaManual(val)}
                  className="w-full text-sm font-bold text-slate-900 border-slate-300 text-right"
                />
              </div>
            </div>

            {modalidade === 'individual' && (
              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={incluirRelacionamentoIndividual}
                    onChange={(e) => setIncluirRelacionamentoIndividual(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>+ R$ 2.000,00 Taxa de Relacionamento (Opcional Caixa)</span>
                </label>

                {tarifaBancariaManual !== null && (
                  <button
                    type="button"
                    onClick={() => setTarifaBancariaManual(null)}
                    className="text-[11px] text-red-600 hover:text-red-700 font-semibold underline cursor-pointer"
                  >
                    Restaurar 1,5%
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 2. Despachante Imobiliário */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  2. Despachante Imobiliário
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                  Após assinatura contrato
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Honorários do despachante para montagem de dossiê, prefeitura e trâmite cartorário (R$ 980,00).
              </p>
            </div>

            <div className="w-full sm:w-48">
              <CurrencyInput
                value={despachante}
                onChange={setDespachante}
                className="w-full text-sm font-bold text-slate-900 border-slate-300 text-right"
              />
            </div>
          </div>

          {/* 3. Registro de Imóvel */}
          <div className="py-4 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">
                    3. Registro de Imóvel
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                    Estimativa média +/- R$ 3.500,00
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Emolumentos do Cartório de Registro de Imóveis para registro da escritura / contrato com alienação fiduciária.
                </p>
              </div>

              <div className="w-full sm:w-48">
                <CurrencyInput
                  value={registroImovel}
                  onChange={setRegistroImovel}
                  className="w-full text-sm font-bold text-slate-900 border-slate-300 text-right"
                />
              </div>
            </div>

            {/* Regras de Desconto dos Ofícios */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block">
                Regras de Desconto nos Ofícios de Registro de Imóveis:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                <li><strong>2º e 3º Ofício de Blumenau:</strong> Concedem desconto de 50% na Compra e Venda <em>e</em> no Financiamento.</li>
                <li><strong>1º Ofício de Blumenau:</strong> Concede desconto de 50% <em>apenas</em> na Compra e Venda.</li>
              </ul>
            </div>
          </div>

          {/* 4. ITBI (Imposto de Transmissão) */}
          <div className="py-4 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">
                    4. ITBI (Imposto de Transmissão de Bens Imóveis)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                    {cidade === 'blumenau' ? 'Blumenau: 1% Financ / 2% Entrada' : 'Indaial: 1,5% Financ / 2% Entrada'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Imposto recolhido para a Prefeitura Municipal.
                </p>
              </div>

              <div className="w-full sm:w-48 space-y-1">
                <CurrencyInput
                  value={itbiFinal}
                  onChange={(val) => {
                    setItbiManual(val);
                    setUsandoItbiManual(true);
                  }}
                  className="w-full text-sm font-bold text-slate-900 border-slate-300 text-right"
                />
                {usandoItbiManual && (
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setUsandoItbiManual(false)}
                      className="text-[10px] text-red-600 hover:text-red-700 font-semibold underline cursor-pointer"
                    >
                      Calcular por alíquota ({formatBRL(itbiCalculadoLei)})
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Sobre Entrada / Recursos Próprios (2%):</span>
                <span className="font-bold text-slate-900">{formatBRL(itbiBaseEntrada)}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">
                  Sobre Financiamento + FGTS ({cidade === 'indaial' ? '1,5%' : '1%'}):
                </span>
                <span className="font-bold text-slate-900">{formatBRL(itbiBaseFinanciado)}</span>
              </div>
            </div>
          </div>

          {/* 5. Certidão do Imóvel */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  5. Certidão do Imóvel (Inteiro Teor c/ Ônus e Ações)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                  Validade 30 dias
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Certidão de matrícula atualizada para comprovação de ônus e ações impeditivas.
              </p>
            </div>

            <div className="w-full sm:w-48">
              <CurrencyInput
                value={certidaoImovel}
                onChange={setCertidaoImovel}
                className="w-full text-sm font-bold text-slate-900 border-slate-300 text-right"
              />
            </div>
          </div>

          {/* 6. Certidão de Estado Civil */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  6. Certidão de Estado Civil Atualizada
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                  Validade 90 dias
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Certidão de nascimento ou casamento atualizada (formato digital ou físico).
              </p>
            </div>

            <div className="w-full sm:w-48">
              <CurrencyInput
                value={certidaoEstadoCivil}
                onChange={setCertidaoEstadoCivil}
                className="w-full text-sm font-bold text-slate-900 border-slate-300 text-right"
              />
            </div>
          </div>

          {/* 7. Assinatura Digital */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  7. Assinatura Digital
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                  R$ 54,00 por CPF
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Certificação digital para formalização eletrônica do contrato bancário.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
                <span className="text-xs text-slate-600 font-medium">Qtd CPFs:</span>
                <select
                  value={quantidadeCpfs}
                  onChange={(e) => setQuantidadeCpfs(parseInt(e.target.value, 10))}
                  className="text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer"
                >
                  <option value={1}>1 CPF (R$ 54)</option>
                  <option value={2}>2 CPFs (R$ 108)</option>
                  <option value={3}>3 CPFs (R$ 162)</option>
                  <option value={4}>4 CPFs (R$ 216)</option>
                </select>
              </div>

              <div className="w-32">
                <div className="w-full text-sm font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg p-2 text-right">
                  {formatBRL(assinaturaDigitalTotal)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé da tabela com Total e Botão WhatsApp */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">
              Total Geral Estimado:
            </span>
            <span className="text-2xl font-bold text-slate-950">
              {formatBRL(totalProjecao)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyWhatsapp}
            className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer ${
              copiedWhatsapp
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {copiedWhatsapp ? (
              <>
                <Check className="w-4 h-4" />
                <span>Resumo Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Copiar Resumo p/ WhatsApp</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
