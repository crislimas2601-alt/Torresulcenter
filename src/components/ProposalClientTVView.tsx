import React, { useState, useEffect } from 'react';
import { ProposalData } from '../types';
import { formatBRL, formatDateBR, round2 } from '../utils/formatter';
import { calculateParcelamentoItem } from '../utils/calculator';
import { TorresulLogo } from './TorresulLogo';
import { CurrencyInput } from './CurrencyInput';
import {
  X,
  Share2,
  Check,
  SlidersHorizontal,
} from 'lucide-react';

interface ProposalClientTVViewProps {
  proposal: ProposalData;
  onExitFullscreen?: () => void;
  onUpdateProposal?: (updates: Partial<ProposalData>) => void;
}

export const ProposalClientTVView: React.FC<ProposalClientTVViewProps> = ({
  proposal,
  onExitFullscreen,
  onUpdateProposal,
}) => {
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Parcela Estimada de Financiamento State
  const [mostrarParcelaFinanciamento, setMostrarParcelaFinanciamento] = useState<boolean>(() => {
    return proposal.mostrarParcelaFinanciamento !== undefined
      ? proposal.mostrarParcelaFinanciamento
      : true;
  });

  const [prazoMeses, setPrazoMeses] = useState<number>(() => {
    return proposal.prazoFinanciamentoMeses || 420;
  });

  const [sistemaAmortizacao, setSistemaAmortizacao] = useState<'SAC' | 'PRICE'>(() => {
    return proposal.sistemaAmortizacaoFinanciamento || 'SAC';
  });

  const [taxaAnual] = useState<number>(9.0); // Taxa média Caixa 9% a.a.

  const [modoCalculoParcela, setModoCalculoParcela] = useState<'auto' | 'manual'>(() => {
    return (proposal.valorParcelaFinanciamentoEstimada && proposal.valorParcelaFinanciamentoEstimada > 0)
      ? 'manual'
      : 'auto';
  });

  const [valorParcelaManual, setValorParcelaManual] = useState<number>(() => {
    return proposal.valorParcelaFinanciamentoEstimada || 0;
  });

  // Fecha modal ou tela cheia com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isConfigModalOpen) {
          setIsConfigModalOpen(false);
        } else if (onExitFullscreen) {
          onExitFullscreen();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExitFullscreen, isConfigModalOpen]);

  // Valor do Imóvel
  const valorImovel = proposal.valorImovel || 0;

  // Ato
  const valorAto = proposal.ato || 0;
  const dataAtoFormatada = proposal.dataAto ? formatDateBR(proposal.dataAto) : 'No fechamento';

  // Parcelamentos negociados
  const parcelamentos = (proposal.parcelamentos || []).map((p, idx) => {
    const calc = calculateParcelamentoItem(p);
    const parcela =
      p.valorParcelaCalculada ||
      calc.valorParcelaCalculada ||
      (p.quantidadeParcelas > 0 ? round2(p.totalSemJuros / p.quantidadeParcelas) : 0);
    const total =
      p.valorTotalComJuros ||
      calc.valorTotalComJuros ||
      (parcela * (p.quantidadeParcelas || 1));
    const title = p.title || `Parcelamento ${idx + 1}`;
    const dataInicio = p.dataVencimento ? formatDateBR(p.dataVencimento) : 'A combinar';

    return {
      id: p.id || `p_${idx}`,
      title,
      qtd: p.quantidadeParcelas || 1,
      valorParcela: parcela,
      total,
      dataInicio,
    };
  });

  // Reforços / Balões
  const reforcos = (proposal.reforcos || []).map((r, idx) => {
    const dataVenc =
      r.tipoVencimento === 'data' && r.dataVencimento
        ? formatDateBR(r.dataVencimento)
        : (r.textoVencimento || 'A combinar');

    return {
      id: r.id || `r_${idx}`,
      title: r.title || `Reforço ${idx + 1}`,
      valor: r.valor || 0,
      vencimento: dataVenc,
    };
  });

  // Financiamento, FGTS e Subsídio
  const financiamento = proposal.financiamento || 0;
  const fgts = proposal.fgts || 0;
  const subsidio = proposal.subsidio || 0;
  const bancoFinanciamento = proposal.bancoFinanciamento || 'Caixa Econômica Federal';

  // Cálculo da Parcela Estimada de Financiamento Caixa
  const calcularParcelaEstimada = (): number => {
    if (modoCalculoParcela === 'manual' && valorParcelaManual > 0) {
      return valorParcelaManual;
    }
    if (financiamento <= 0) return 0;

    const i = (taxaAnual / 100) / 12;
    const taxaSeguros = 45;

    if (sistemaAmortizacao === 'SAC') {
      const amortizacao = financiamento / prazoMeses;
      const juros = financiamento * i;
      return round2(amortizacao + juros + taxaSeguros);
    } else {
      const pmt = financiamento * (i * Math.pow(1 + i, prazoMeses)) / (Math.pow(1 + i, prazoMeses) - 1);
      return round2(pmt + taxaSeguros);
    }
  };

  const parcelaEstimadaFinal = calcularParcelaEstimada();

  const handleSalvarConfiguracao = () => {
    setIsConfigModalOpen(false);
    if (onUpdateProposal) {
      onUpdateProposal({
        mostrarParcelaFinanciamento,
        prazoFinanciamentoMeses: prazoMeses,
        sistemaAmortizacaoFinanciamento: sistemaAmortizacao,
        valorParcelaFinanciamentoEstimada: modoCalculoParcela === 'manual' ? valorParcelaManual : undefined,
      });
    }
  };

  // Gerador de Resumo para WhatsApp
  const gerarResumoWhatsapp = (): string => {
    const lines: string[] = [];
    lines.push(`*TORRESUL IMOBILIÁRIA • PROPOSTA COMERCIAL*`);
    if (proposal.nomeCliente) lines.push(`Cliente: *${proposal.nomeCliente}*`);
    if (proposal.numeroUnidade) lines.push(`Unidade: *${proposal.numeroUnidade}*`);
    lines.push(`Valor do Imóvel: *${formatBRL(valorImovel)}*`);
    lines.push(``);
    lines.push(`*CONDIÇÕES DA NEGOCIAÇÃO:*`);
    lines.push(`• *Ato:* ${formatBRL(valorAto)} (${dataAtoFormatada})`);

    parcelamentos.forEach((p) => {
      lines.push(`• *${p.title}:* ${p.qtd}x de ${formatBRL(p.valorParcela)} (Início: ${p.dataInicio})`);
    });

    if (reforcos.length > 0) {
      reforcos.forEach((r) => {
        lines.push(`• *${r.title}:* ${formatBRL(r.valor)} (${r.vencimento})`);
      });
    }

    if (fgts > 0) lines.push(`• *FGTS:* ${formatBRL(fgts)}`);
    if (subsidio > 0) lines.push(`• *Subsídio MCMV:* ${formatBRL(subsidio)}`);
    
    if (mostrarParcelaFinanciamento && parcelaEstimadaFinal > 0) {
      lines.push(
        `• *Financiamento (${bancoFinanciamento}):* ${formatBRL(financiamento)} (Parcela estimada: ~${formatBRL(parcelaEstimadaFinal)}/mês em ${prazoMeses}x)`
      );
    } else {
      lines.push(`• *Financiamento (${bancoFinanciamento}):* ${formatBRL(financiamento)}`);
    }

    lines.push(``);
    lines.push(`Torresul Imobiliária • Blumenau / SC`);

    return lines.join('\n');
  };

  const handleCopyWhatsapp = async () => {
    try {
      await navigator.clipboard.writeText(gerarResumoWhatsapp());
      setCopiedWhatsapp(true);
      setTimeout(() => setCopiedWhatsapp(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 text-white flex flex-col overflow-hidden selection:bg-red-600 selection:text-white">
      {/* 1. BARRA SUPERIOR: FUNDO BRANCO NÍTIDO (Logo e contraste 100% perfeitos) */}
      <header className="bg-white text-neutral-900 px-6 sm:px-10 py-4 border-b border-neutral-200 shrink-0 flex items-center justify-between shadow-xs">
        <TorresulLogo variant="red" size="lg" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            {proposal.nomeCliente ? (
              <span className="text-xs text-neutral-800 font-semibold block">
                Cliente: <strong className="text-black">{proposal.nomeCliente}</strong>
                {proposal.numeroUnidade ? ` • Unidade ${proposal.numeroUnidade}` : ''}
              </span>
            ) : (
              <span className="text-xs text-neutral-700 font-medium block">
                Proposta Comercial
              </span>
            )}
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
              Condições da Negociação
            </span>
          </div>

          {/* Ajustar Parcela Caixa */}
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            className="px-3 py-2 rounded-md bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            title="Ajustar parcela estimada do financiamento"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-600" />
            <span className="hidden md:inline">Parcela Caixa</span>
          </button>

          {/* Botão WhatsApp */}
          <button
            type="button"
            onClick={handleCopyWhatsapp}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              copiedWhatsapp
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-900 hover:bg-neutral-800 text-white'
            }`}
            title="Copiar resumo para WhatsApp"
          >
            {copiedWhatsapp ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-neutral-300" />
                <span>WhatsApp</span>
              </>
            )}
          </button>

          {/* Sair do Modo TV */}
          {onExitFullscreen && (
            <button
              type="button"
              onClick={onExitFullscreen}
              className="px-3.5 py-2 rounded-md bg-neutral-900 hover:bg-red-600 text-white transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Sair</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. CORPO PRINCIPAL: FUNDO ESCURO COM CONTRASTE TOTAL (O texto nunca some) */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col justify-between bg-gradient-to-b from-neutral-900 via-neutral-950 to-black">
        <div className="my-auto py-4 max-w-4xl mx-auto w-full space-y-8">
          
          {/* Header Valor do Imóvel (Limpo, Alto Contraste, Sem Informações Supérfluas) */}
          <div className="text-center space-y-1">
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold block">
              Valor do Imóvel
            </span>
            <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-heading">
              {formatBRL(valorImovel)}
            </div>
          </div>

          {/* 3. DEMONSTRATIVO LINEAR E TRANQUILO (Sem números gigantes ou assustadores) */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Demonstrativo de Pagamento
              </span>
              <span className="text-xs text-neutral-500">
                Condições ajustadas
              </span>
            </div>

            <div className="divide-y divide-neutral-800/80 text-sm">
              {/* Linha 1: O ATO */}
              <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-neutral-800/30 transition">
                <div>
                  <span className="font-semibold text-white block">Ato / Entrada</span>
                  <span className="text-xs text-neutral-400">Vencimento: {dataAtoFormatada}</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-white tabular-nums sm:text-right">
                  {formatBRL(valorAto)}
                </div>
              </div>

              {/* Linhas: PARCELAMENTOS (Apresentação calma, sem alarme) */}
              {parcelamentos.map((p) => (
                <div
                  key={p.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-neutral-800/30 transition"
                >
                  <div>
                    <span className="font-semibold text-white block">{p.title}</span>
                    <span className="text-xs text-neutral-400">1º Vencimento: {p.dataInicio}</span>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-base sm:text-lg font-semibold text-white tabular-nums">
                      {p.qtd}x de {formatBRL(p.valorParcela)}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Total: {formatBRL(p.total)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Linhas: REFORÇOS / BALÕES (Se houver) */}
              {reforcos.length > 0 && reforcos.map((r) => (
                <div
                  key={r.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-neutral-800/30 transition"
                >
                  <div>
                    <span className="font-semibold text-white block">{r.title}</span>
                    <span className="text-xs text-neutral-400">Vencimento: {r.vencimento}</span>
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-white tabular-nums sm:text-right">
                    {formatBRL(r.valor)}
                  </div>
                </div>
              ))}

              {/* Linha: FGTS (Se houver) */}
              {fgts > 0 && (
                <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-neutral-800/30 transition">
                  <div>
                    <span className="font-semibold text-white block">FGTS Utilizado</span>
                    <span className="text-xs text-neutral-400">Recurso vinculado Caixa</span>
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-white tabular-nums sm:text-right">
                    {formatBRL(fgts)}
                  </div>
                </div>
              )}

              {/* Linha: SUBSÍDIO (Se houver) */}
              {subsidio > 0 && (
                <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-neutral-800/30 transition">
                  <div>
                    <span className="font-semibold text-white block">Subsídio Governo Federal</span>
                    <span className="text-xs text-neutral-400">Programa Minha Casa Minha Vida</span>
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-white tabular-nums sm:text-right">
                    {formatBRL(subsidio)}
                  </div>
                </div>
              )}

              {/* Linha: FINANCIAMENTO BANCÁRIO */}
              <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-950/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white block">Financiamento Bancário</span>
                    <span className="text-xs text-neutral-400">({bancoFinanciamento})</span>
                  </div>
                  
                  {mostrarParcelaFinanciamento && parcelaEstimadaFinal > 0 && (
                    <div className="text-xs text-neutral-300 mt-1 flex items-center gap-2">
                      <span>Parcela estimada:</span>
                      <strong className="text-red-500 font-bold">~ {formatBRL(parcelaEstimadaFinal)}/mês</strong>
                      <span className="text-neutral-400">({prazoMeses}x • {sistemaAmortizacao})</span>
                      <button
                        type="button"
                        onClick={() => setIsConfigModalOpen(true)}
                        className="text-[11px] text-neutral-400 hover:text-white underline cursor-pointer ml-1"
                      >
                        Alterar
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-base sm:text-lg font-bold text-white tabular-nums sm:text-right">
                  {formatBRL(financiamento)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. RODAPÉ SÓBRIO */}
        <footer className="pt-6 border-t border-neutral-800 text-center text-xs text-neutral-500">
          Torresul Imobiliária • Blumenau / SC • Proposta sujeita à aprovação bancária.
        </footer>
      </main>

      {/* 5. MODAL DE AJUSTE DA PARCELA CAIXA */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-md w-full text-white shadow-xl space-y-5 animate-in fade-in duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-bold text-base text-white">
                Parcela Estimada do Financiamento
              </h3>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Toggle de Exibição */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-950 border border-neutral-800">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Exibir parcela estimada na apresentação
                </span>
                <span className="text-[11px] text-neutral-400">
                  Mostra a parcela mensal para o cliente
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMostrarParcelaFinanciamento(!mostrarParcelaFinanciamento)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  mostrarParcelaFinanciamento ? 'bg-red-600' : 'bg-neutral-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    mostrarParcelaFinanciamento ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {mostrarParcelaFinanciamento && (
              <div className="space-y-4 pt-1">
                {/* Seleção do Modo */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModoCalculoParcela('auto')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                      modoCalculoParcela === 'auto'
                        ? 'bg-neutral-800 text-white border-red-500'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    Cálculo Automático
                  </button>

                  <button
                    type="button"
                    onClick={() => setModoCalculoParcela('manual')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                      modoCalculoParcela === 'manual'
                        ? 'bg-neutral-800 text-white border-red-500'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    Digitar Valor Exato
                  </button>
                </div>

                {modoCalculoParcela === 'auto' ? (
                  <div className="space-y-3 p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-400 block mb-1.5 uppercase">
                        Prazo do Financiamento:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPrazoMeses(420)}
                          className={`py-1.5 px-2 rounded-md font-semibold transition cursor-pointer border ${
                            prazoMeses === 420
                              ? 'bg-neutral-800 text-white border-neutral-600'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                          }`}
                        >
                          420 meses (35 anos)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrazoMeses(360)}
                          className={`py-1.5 px-2 rounded-md font-semibold transition cursor-pointer border ${
                            prazoMeses === 360
                              ? 'bg-neutral-800 text-white border-neutral-600'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                          }`}
                        >
                          360 meses (30 anos)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-neutral-400 block mb-1.5 uppercase">
                        Sistema de Amortização:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSistemaAmortizacao('SAC')}
                          className={`py-1.5 px-2 rounded-md font-semibold transition cursor-pointer border ${
                            sistemaAmortizacao === 'SAC'
                              ? 'bg-neutral-800 text-white border-neutral-600'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                          }`}
                        >
                          SAC (Decrescente)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSistemaAmortizacao('PRICE')}
                          className={`py-1.5 px-2 rounded-md font-semibold transition cursor-pointer border ${
                            sistemaAmortizacao === 'PRICE'
                              ? 'bg-neutral-800 text-white border-neutral-600'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                          }`}
                        >
                          PRICE (Fixa)
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                      <span className="text-neutral-400">Parcela calculada:</span>
                      <span className="text-base font-extrabold text-red-500">
                        {formatBRL(parcelaEstimadaFinal)}/mês
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-400 block mb-1 uppercase">
                        Valor da 1ª Parcela (da simulação Caixa):
                      </label>
                      <CurrencyInput
                        value={valorParcelaManual}
                        onChange={setValorParcelaManual}
                        className="w-full text-base font-bold !text-white !bg-neutral-900 border-neutral-700 rounded-md p-2.5 focus:!text-white focus:!bg-neutral-900 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        prefixClassName="text-neutral-400 font-semibold"
                        placeholder="0,00"
                      />
                      <span className="text-[10px] text-neutral-500 block mt-1">
                        Insira o valor oficial gerado na simulação Caixa.
                      </span>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-neutral-400 block mb-1 uppercase">
                        Prazo em Meses:
                      </label>
                      <select
                        value={prazoMeses}
                        onChange={(e) => setPrazoMeses(parseInt(e.target.value, 10))}
                        className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-md p-2 text-xs font-semibold outline-none cursor-pointer"
                      >
                        <option value={420}>420 meses (35 anos)</option>
                        <option value={360}>360 meses (30 anos)</option>
                        <option value={240}>240 meses (20 anos)</option>
                        <option value={180}>180 meses (15 anos)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ações */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="px-4 py-2 rounded-md text-xs font-semibold text-neutral-400 hover:text-white transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSalvarConfiguracao}
                className="px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
