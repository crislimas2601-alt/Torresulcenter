import React, { useState, useEffect, useMemo } from 'react';
import { ProposalData, ParcelamentoItem, ReforcoItem } from '../types';
import { calculateProposalTotals, round2 } from '../utils/calculator';
import { formatBRL, formatDateBR } from '../utils/formatter';
import { generateContractText } from '../utils/templateGenerator';
import { CurrencyInput } from './CurrencyInput';
import { FinancingCalculatorBox } from './FinancingCalculatorBox';
import { SummaryCards } from './SummaryCards';
import { ParcelamentoSection } from './ParcelamentoSection';
import { ReforcosSection } from './ReforcosSection';
import { AvalistaSection } from './AvalistaSection';
import { FloatingBalancePill } from './FloatingBalancePill';
import { TorreSulLogo } from './TorresulLogo';
import {
  RotateCcw,
  Sparkles,
  Calculator,
  FileText,
  Copy,
  Check,
  Download,
  Printer,
  ArrowRight,
  ArrowLeft,
  Edit3,
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'torresul_draft_proposal_v3';

export const VIDEO_DEFAULT_PROPOSAL: ProposalData = {
  id: 'proposta_padrao_torresul',
  nomeCliente: '',
  numeroUnidade: '',
  valorImovel: 235422.50,
  temAdimplencia: true,
  valorAdimplencia: 500.00,
  ato: 4990.09,
  financiamento: 172693.23,
  fgts: 2477.59,
  subsidio: 0,
  bancoFinanciamento: 'CEF',
  correspondente: 'FAST',
  parcelamentos: [
    {
      id: 'p1_video',
      title: 'Parcelamento (Mensal)',
      totalSemJuros: 8000.00,
      jurosAoMes: 0,
      quantidadeParcelas: 4,
      dataVencimento: '2026-10-08',
      tipoCalculo: 'simples',
      temJurosDiluidos: false,
      jurosAdimplenciaDiluido: 0,
      jurosReforcosDiluido: 0,
      valorParcelaCalculada: 2000.00,
      valorTotalComJuros: 8000.00,
    },
    {
      id: 'p2_video',
      title: 'Parcelamento 2',
      totalSemJuros: 20.00,
      jurosAoMes: 1.0,
      quantidadeParcelas: 60,
      dataVencimento: '2027-02-08',
      tipoCalculo: 'simples',
      temJurosDiluidos: false,
      jurosAdimplenciaDiluido: 0,
      jurosReforcosDiluido: 0,
      valorParcelaCalculada: 0.53,
      valorTotalComJuros: 32.00,
    },
  ],
  reforcos: [
    {
      id: 'r1_video',
      title: 'Reforço 1',
      valor: 3157.53,
      tipoVencimento: 'data',
      dataVencimento: '2028-01-08',
      textoVencimento: '',
    },
    {
      id: 'r2_video',
      title: 'Reforço 2',
      valor: 2645.16,
      tipoVencimento: 'data',
      dataVencimento: '2029-01-08',
      textoVencimento: '',
    },
  ],
  avalista: {
    temAvalista: false,
    nome: '',
    email: '',
    telefone: '',
    profissao: '',
  },
  promissoria: true,
  ficaramMoveis: false,
  descricaoMoveis: '',
  valorImovelComissao: 238500.00,
  comissaoPercent: 6.0,
  comissaoValor: 14310.00,
  comissaoManual: false,
  tipoDivisaoComissao: '100',
  momentoPrimeiro50: 'no ato da assinatura do contrato de compra e venda',
  momentoSegundo50: 'na assinatura do financiamento habitacional.',
  pagamentoComissao: '100% na liberação de recurso do financiamento.',
  createdAt: new Date().toISOString(),
};

export const INITIAL_EMPTY_PROPOSAL: ProposalData = {
  nomeCliente: '',
  numeroUnidade: '',
  valorImovel: 0,
  temAdimplencia: false,
  valorAdimplencia: 0,
  ato: 0,
  financiamento: 0,
  fgts: 0,
  subsidio: 0,
  bancoFinanciamento: 'CEF',
  correspondente: 'FAST',
  parcelamentos: [],
  reforcos: [],
  avalista: {
    temAvalista: false,
    nome: '',
    email: '',
    telefone: '',
    profissao: '',
  },
  promissoria: true,
  ficaramMoveis: false,
  descricaoMoveis: '',
  valorImovelComissao: 0,
  comissaoPercent: 6.0,
  comissaoValor: 0,
  comissaoManual: false,
  tipoDivisaoComissao: '100',
  momentoPrimeiro50: 'no ato da assinatura do contrato de compra e venda',
  momentoSegundo50: 'na assinatura do financiamento habitacional.',
  pagamentoComissao: '100% na liberação de recurso do financiamento.',
};

export const TorresulProposalCalculator: React.FC = () => {
  // Navigation Tabs: 1. Preenchimento dos Valores vs 2. Proposta finalizada p/envio
  const [activeTab, setActiveTab] = useState<'valores' | 'minuta'>('valores');

  // Load draft or fallback to VIDEO_DEFAULT_PROPOSAL
  const [proposal, setProposal] = useState<ProposalData>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading saved draft:', e);
    }
    return VIDEO_DEFAULT_PROPOSAL;
  });

  // Minuta Text State & Controls
  const [copied, setCopied] = useState(false);
  const [isEditingMinuta, setIsEditingMinuta] = useState(false);
  const [customMinutaText, setCustomMinutaText] = useState('');

  // Auto-save draft on change
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(proposal));
    } catch (e) {
      console.warn('Error writing draft:', e);
    }
  }, [proposal]);

  const totals = useMemo(() => calculateProposalTotals(proposal), [proposal]);
  const liveGeneratedMinuta = useMemo(() => generateContractText(proposal), [proposal]);

  useEffect(() => {
    if (!isEditingMinuta) {
      setCustomMinutaText(liveGeneratedMinuta);
    }
  }, [liveGeneratedMinuta, isEditingMinuta]);

  const handleUpdate = (updates: Partial<ProposalData>) => {
    setProposal((prev) => ({ ...prev, ...updates }));
  };

  // Balance Entradas: allocates the difference (diferencaImovel) to the first parcelamento item or adds one
  const handleBalanceEntrada = () => {
    const diff = totals.diferencaImovel;
    if (Math.abs(diff) < 0.009) return;

    if (proposal.parcelamentos && proposal.parcelamentos.length > 0) {
      const updatedParcelamentos = [...proposal.parcelamentos];
      const first = { ...updatedParcelamentos[0] };
      first.totalSemJuros = Math.max(0, round2(first.totalSemJuros + diff));
      updatedParcelamentos[0] = first;
      handleUpdate({ parcelamentos: updatedParcelamentos });
    } else {
      const newItem: ParcelamentoItem = {
        id: `p_${Date.now()}`,
        title: 'Parcelamento (Mensal)',
        totalSemJuros: Math.max(0, diff),
        jurosAoMes: 0,
        quantidadeParcelas: 12,
        dataVencimento: new Date().toISOString().split('T')[0],
        tipoCalculo: 'simples',
        temJurosDiluidos: false,
        jurosAdimplenciaDiluido: 0,
        jurosReforcosDiluido: 0,
        valorParcelaCalculada: 0,
        valorTotalComJuros: 0,
      };
      handleUpdate({ parcelamentos: [newItem] });
    }
  };

  // Balance Financiamento: adjusts financiamento so that:
  // financiamento = valorImovel - totalEntradaSemJuros - fgts - subsidio
  const handleBalanceFinanciamento = () => {
    const neededFinancing = Math.max(
      0,
      round2(
        (proposal.valorImovel || 0) -
          totals.totalEntradaSemJuros -
          (proposal.fgts || 0) -
          (proposal.subsidio || 0)
      )
    );
    handleUpdate({ financiamento: neededFinancing });
  };

  const handleClear = () => {
    if (window.confirm('Deseja realmente limpar todos os campos da proposta?')) {
      setProposal({
        ...INITIAL_EMPTY_PROPOSAL,
        id: `prop_${Date.now()}`,
      });
      setIsEditingMinuta(false);
    }
  };

  const handleCopyMinuta = async () => {
    try {
      await navigator.clipboard.writeText(customMinutaText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(customMinutaText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([customMinutaText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Proposta_Torresul_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Proposta Comercial - Torresul</title>
            <style>
              body { font-family: monospace, sans-serif; white-space: pre-wrap; padding: 24px; font-size: 14px; line-height: 1.6; color: #1e293b; }
              h2 { font-family: sans-serif; margin-bottom: 16px; font-size: 18px; color: #b91c1c; }
            </style>
          </head>
          <body>
            <h2>TORRESUL IMOBILIÁRIA - PROPOSTA COMERCIAL</h2>
            <hr style="margin-bottom: 20px;" />
            ${customMinutaText}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Financing percentage display
  const financPercentDisplay = useMemo(() => {
    if (!proposal.valorImovel || proposal.valorImovel <= 0) return '0%';
    const pct = ((proposal.financiamento || 0) / proposal.valorImovel) * 100;
    return `${pct.toFixed(1)}%`;
  }, [proposal.valorImovel, proposal.financiamento]);

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header Bar matching Video (0:00) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="shrink-0">
            <TorreSulLogo size={42} className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-slate-900 font-heading">
                TORRESUL
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                IMOBILIÁRIA • CRECI: 4218 J
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
              Modelo de proposta padrão
            </h1>
            <p className="text-xs text-slate-500">
              Calculadora de fluxo de entradas totais, juros diluídos e gerador de minuta
            </p>
          </div>
        </div>

        {/* Right Header Controls: Limpar Formulário */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            id="btn_limpar_formulario"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="Limpar todos os campos da proposta"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Limpar Formulário</span>
          </button>
        </div>
      </div>

      {/* Main Tabs matching Video: 1. Preenchimento dos Valores vs 2. Proposta finalizada p/envio */}
      <div className="border-b border-slate-200 bg-white rounded-t-2xl px-5 pt-3 flex items-center gap-8 shadow-xs">
        <button
          type="button"
          id="tab_preenchimento_valores"
          onClick={() => setActiveTab('valores')}
          className={`pb-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'valores'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>1. Preenchimento dos Valores</span>
        </button>

        <button
          type="button"
          id="tab_proposta_finalizada"
          onClick={() => setActiveTab('minuta')}
          className={`pb-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'minuta'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>2. Proposta finalizada p/envio</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black tracking-wide">
            MINUTA
          </span>
        </button>
      </div>

      {/* TAB 1: PREENCHIMENTO DOS VALORES */}
      {activeTab === 'valores' && (
        <div className="space-y-6">
          {/* Summary Cards Top */}
          <SummaryCards
            proposal={proposal}
            onBalanceEntrada={handleBalanceEntrada}
            onBalanceFinanciamento={handleBalanceFinanciamento}
          />

          {/* 1. Imóvel & Recursos (Sem identificação de cliente e unidade) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 text-base">
                1. Imóvel & Recursos
              </h3>
              <p className="text-xs text-slate-500">
                Valor do contrato, adimplência, financiamento e FGTS
              </p>
            </div>

            {/* Valor do Imóvel para Contrato */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                VALOR DO IMÓVEL PARA CONTRATO
              </label>
              <CurrencyInput
                id="valor_imovel_input"
                value={proposal.valorImovel}
                onChange={(val) => {
                  handleUpdate({
                    valorImovel: val,
                    valorImovelComissao: proposal.valorImovelComissao || val,
                  });
                }}
                placeholder="0,00"
                className="font-bold text-base text-slate-900 border-slate-300"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Valor base estabelecido na tabela de vendas / contrato
              </span>
            </div>

            {/* Adimplência de Negociação (Box com Segmented Switch Sem / Com Adimplência) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    Adimplência de Negociação
                  </span>
                </div>

                {/* Pill Segmented Switch */}
                <div className="flex items-center bg-slate-200 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdate({
                        temAdimplencia: false,
                        valorAdimplencia: 0,
                      })
                    }
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      !proposal.temAdimplencia
                        ? 'bg-white text-slate-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sem Adimplência
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleUpdate({
                        temAdimplencia: true,
                        valorAdimplencia: proposal.valorAdimplencia || 500,
                      })
                    }
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      proposal.temAdimplencia
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Com Adimplência
                  </button>
                </div>
              </div>

              {proposal.temAdimplencia && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Valor da Adimplência
                  </label>
                  <CurrencyInput
                    id="valor_adimplencia_input"
                    value={proposal.valorAdimplencia || 0}
                    onChange={(val) => handleUpdate({ valorAdimplencia: val })}
                    placeholder="0,00"
                    className="border-amber-300 bg-amber-50/40 text-amber-950 font-bold"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Este valor é somado ao total da negociação e exibido no contrato.
                  </span>
                </div>
              )}
            </div>

            {/* Financiamento & FGTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Financiamento */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Valor do Financiamento
                  </label>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                    {financPercentDisplay}
                  </span>
                </div>
                <CurrencyInput
                  id="financiamento_input"
                  value={proposal.financiamento || 0}
                  onChange={(val) => handleUpdate({ financiamento: val })}
                  placeholder="0,00"
                  className="font-bold text-slate-900 border-slate-300"
                />

                {/* Seletor Rápido de Financiamento */}
                <div className="mt-2">
                  <FinancingCalculatorBox
                    valorImovel={proposal.valorImovel}
                    financiamentoAtual={proposal.financiamento}
                    onChangeFinanciamento={(val) => handleUpdate({ financiamento: val })}
                  />
                </div>
              </div>

              {/* FGTS */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Valor do FGTS
                </label>
                <CurrencyInput
                  id="fgts_input"
                  value={proposal.fgts || 0}
                  onChange={(val) => handleUpdate({ fgts: val })}
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Subsídio & Ato */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Subsídio (se houver)
                </label>
                <CurrencyInput
                  id="subsidio_input"
                  value={proposal.subsidio || 0}
                  onChange={(val) => handleUpdate({ subsidio: val })}
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Valor do Ato (Assinatura)
                </label>
                <CurrencyInput
                  id="ato_input"
                  value={proposal.ato || 0}
                  onChange={(val) => handleUpdate({ ato: val })}
                  placeholder="0,00"
                  className="font-bold text-slate-900 border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* 2. Parcelamentos Mensais da Entrada */}
          <ParcelamentoSection
            parcelamentos={proposal.parcelamentos || []}
            onChange={(items) => handleUpdate({ parcelamentos: items })}
            saldoRestanteEntrada={totals.diferencaImovel > 0 ? totals.diferencaImovel : 0}
          />

          {/* 3. Reforços (Parcelamentos Anuais / Balões) */}
          <ReforcosSection
            reforcos={proposal.reforcos || []}
            onChange={(items) => handleUpdate({ reforcos: items })}
          />

          {/* 4, 5 & 6: Agente Financeiro, Avalista, Promissória, Móveis e Comissão */}
          <AvalistaSection
            avalista={proposal.avalista}
            onChangeAvalista={(av) => handleUpdate({ avalista: av })}
            promissoria={proposal.promissoria}
            onChangePromissoria={(val) => handleUpdate({ promissoria: val })}
            ficaramMoveis={proposal.ficaramMoveis}
            onChangeFicaramMoveis={(val) => handleUpdate({ ficaramMoveis: val })}
            descricaoMoveis={proposal.descricaoMoveis}
            onChangeDescricaoMoveis={(val) => handleUpdate({ descricaoMoveis: val })}
            valorImovel={proposal.valorImovel}
            valorImovelComissao={proposal.valorImovelComissao}
            onChangeValorImovelComissao={(val) =>
              handleUpdate({ valorImovelComissao: val })
            }
            comissaoPercent={proposal.comissaoPercent}
            onChangeComissaoPercent={(val) => handleUpdate({ comissaoPercent: val })}
            comissaoValor={proposal.comissaoValor}
            onChangeComissaoValor={(val) => handleUpdate({ comissaoValor: val })}
            comissaoManual={proposal.comissaoManual}
            onChangeComissaoManual={(val) => handleUpdate({ comissaoManual: val })}
            tipoDivisaoComissao={proposal.tipoDivisaoComissao}
            onChangeTipoDivisaoComissao={(val) =>
              handleUpdate({ tipoDivisaoComissao: val })
            }
            momentoPrimeiro50={proposal.momentoPrimeiro50}
            onChangeMomentoPrimeiro50={(val) =>
              handleUpdate({ momentoPrimeiro50: val })
            }
            momentoSegundo50={proposal.momentoSegundo50}
            onChangeMomentoSegundo50={(val) =>
              handleUpdate({ momentoSegundo50: val })
            }
            pagamentoComissao={proposal.pagamentoComissao}
            onChangePagamentoComissao={(val) =>
              handleUpdate({ pagamentoComissao: val })
            }
            bancoFinanciamento={proposal.bancoFinanciamento}
            onChangeBancoFinanciamento={(val) =>
              handleUpdate({ bancoFinanciamento: val })
            }
            correspondente={proposal.correspondente}
            onChangeCorrespondente={(val) =>
              handleUpdate({ correspondente: val })
            }
          />

          {/* Bottom Bar: Action to Switch to Tab 2 matching Video (0:09 - 0:11) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Dica: Os cálculos e juros são atualizados em tempo real conforme você digita.
            </p>

            <button
              type="button"
              id="btn_ver_proposta_finalizada"
              onClick={() => {
                setActiveTab('minuta');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Ver Proposta finalizada p/envio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: PROPOSTA FINALIZADA P/ ENVIO (MINUTA) matching Video (0:14 - 0:19) */}
      {activeTab === 'minuta' && (
        <div className="space-y-4">
          {/* Breadcrumb / Return to Tab 1 */}
          <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
            <button
              type="button"
              id="btn_voltar_valores"
              onClick={() => {
                setActiveTab('valores');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>← Voltar e Ajustar Valores (Aba 1)</span>
            </button>

            <span className="text-xs text-slate-500 font-medium">
              Texto formatado pronto para cópia e emissão de contrato
            </span>
          </div>

          {/* Minuta Container Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header of Minuta */}
            <div className="px-5 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Proposta finalizada p/envio
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500 text-white rounded font-black uppercase tracking-wider">
                    MINUTA
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Formato padronizado pronto para envio e emissão de contrato
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  id="btn_ajustar_texto_minuta"
                  onClick={() => setIsEditingMinuta(!isEditingMinuta)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isEditingMinuta
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                  title="Editar texto livremente antes de copiar"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingMinuta ? 'Modo Visual' : 'Ajustar Texto'}</span>
                </button>

                <button
                  type="button"
                  id="btn_copiar_minuta_topo"
                  onClick={handleCopyMinuta}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                      : 'bg-red-600 hover:bg-red-500 text-white active:scale-95 shadow-red-950/20'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="btn_whatsapp_minuta"
                  onClick={handleShareWhatsApp}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white transition-colors cursor-pointer"
                  title="Compartilhar via WhatsApp"
                >
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  id="btn_baixar_txt_minuta"
                  onClick={handleDownloadTxt}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                  title="Baixar em formato .txt"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar .txt</span>
                </button>

                <button
                  type="button"
                  id="btn_imprimir_minuta"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                  title="Imprimir minuta"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>

            {/* Minuta Body (Text Display matching Video 0:15 - 0:18) */}
            <div className="p-6 bg-slate-950 text-slate-100 font-mono text-sm leading-relaxed border-t border-slate-800">
              {isEditingMinuta ? (
                <textarea
                  value={customMinutaText}
                  onChange={(e) => setCustomMinutaText(e.target.value)}
                  rows={20}
                  className="w-full bg-slate-900 text-white font-mono text-sm p-4 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-sm text-slate-100 selection:bg-red-600 selection:text-white">
                  {customMinutaText}
                </pre>
              )}
            </div>

            {/* Ready to Paste Banner */}
            <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 text-xs text-emerald-400 font-medium flex items-center justify-between">
              <span>✓ Pronto para colar no sistema de contratos da Torresul</span>
              <button
                type="button"
                onClick={handleCopyMinuta}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                Copiar novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Balance Pill (Sticky bottom-right) */}
      <FloatingBalancePill
        proposal={proposal}
        onBalanceEntrada={handleBalanceEntrada}
        onBalanceFinanciamento={handleBalanceFinanciamento}
      />
    </div>
  );
};
