import React, { useState, useMemo } from 'react';
import { 
  TrendingDown, 
  Calculator, 
  Calendar, 
  DollarSign, 
  Percent, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Printer, 
  Share2, 
  CheckCircle2, 
  Info, 
  HelpCircle,
  PiggyBank,
  ShieldCheck,
  ChevronDown,
  Layers,
  Copy,
  BarChart3
} from 'lucide-react';
import { 
  AmortizationSimulationInput, 
  AmortizationSystem, 
  AmortizationStrategy, 
  AmortizationExtraFrequency 
} from '../types';
import { runAmortizationSimulation } from '../utils/amortizationCalculations';
import { formatCurrency } from '../utils/formatters';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { SimulatorSubTab } from '../types';
import { RentVsFinancingTab } from './simulator/RentVsFinancingTab';
import { InvestorCalculatorTab } from './simulator/InvestorCalculatorTab';

export const AmortizationTool: React.FC = () => {
  // Sub-tab Navigation: Amortização, Aluguel vs Financiamento, Investidores
  const [activeSubTab, setActiveSubTab] = useState<SimulatorSubTab>('amortizacao');

  // Input State
  const [financedAmount, setFinancedAmount] = useState<number>(400000);
  const [termMonths, setTermMonths] = useState<number>(360);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(9.99);
  const [system, setSystem] = useState<AmortizationSystem>('SAC');
  const [adminFee, setAdminFee] = useState<number>(25);
  const [mipDfiRate, setMipDfiRate] = useState<number>(0.025); // ~0.025% sobre saldo

  // Extra Amortization State
  const [extraAmount, setExtraAmount] = useState<number>(1000);
  const [extraStartMonth, setExtraStartMonth] = useState<number>(1);
  const [extraFrequency, setExtraFrequency] = useState<AmortizationExtraFrequency>('mensal');
  const [strategy, setStrategy] = useState<AmortizationStrategy>('prazo');

  // UI helpers
  const [showTableDetails, setShowTableDetails] = useState(false);
  const [tableFilter, setTableFilter] = useState<'primeiros_24' | 'anuais' | 'todos'>('primeiros_24');
  const [copiedToast, setCopiedToast] = useState(false);

  // Compute simulation
  const simulationInput: AmortizationSimulationInput = useMemo(() => ({
    financedAmount: Number(financedAmount) || 0,
    termMonths: Number(termMonths) || 1,
    annualInterestRate: Number(annualInterestRate) || 0,
    system,
    adminFee: Number(adminFee) || 0,
    mipDfiRate: Number(mipDfiRate) || 0,
    extraAmount: Number(extraAmount) || 0,
    extraStartMonth: Number(extraStartMonth) || 1,
    extraFrequency,
    strategy,
  }), [
    financedAmount,
    termMonths,
    annualInterestRate,
    system,
    adminFee,
    mipDfiRate,
    extraAmount,
    extraStartMonth,
    extraFrequency,
    strategy,
  ]);

  const { schedule, summary } = useMemo(() => {
    return runAmortizationSimulation(simulationInput);
  }, [simulationInput]);

  // Chart data sampled every 12 months for clean visualization
  const chartData = useMemo(() => {
    const data: any[] = [];
    const maxM = Math.max(summary.originalTermMonths, summary.simTermMonths);
    const step = maxM > 120 ? 12 : 6;

    for (let m = 1; m <= maxM; m += step) {
      const origItem = schedule.find(s => s.month === m) || { originalBalance: 0 };
      const simItem = schedule.find(s => s.month === m);
      data.push({
        ano: `Ano ${Math.ceil(m / 12)}`,
        mes: m,
        'Original (Sem Aporte)': Math.round(origItem.originalBalance),
        'Com Amortização': simItem ? Math.round(simItem.simBalance) : 0,
      });
    }

    // Always include the last data point
    const lastItem = schedule[schedule.length - 1];
    if (lastItem) {
      data.push({
        ano: `Mês ${lastItem.month}`,
        mes: lastItem.month,
        'Original (Sem Aporte)': Math.round(lastItem.originalBalance),
        'Com Amortização': Math.round(lastItem.simBalance),
      });
    }

    return data;
  }, [schedule, summary]);

  // Filtered rows for schedule table
  const displayedSchedule = useMemo(() => {
    if (tableFilter === 'primeiros_24') {
      return schedule.slice(0, 24);
    }
    if (tableFilter === 'anuais') {
      return schedule.filter(s => s.month % 12 === 0 || s.month === 1 || s.month === schedule.length);
    }
    return schedule;
  }, [schedule, tableFilter]);

  // Generate WhatsApp summary text
  const handleCopyWhatsApp = () => {
    const text = `📊 *SIMULAÇÃO DE AMORTIZAÇÃO IMOBILIÁRIA*
🏦 *Sistema:* ${system} (${system === 'SAC' ? 'Parcelas Decrescentes' : 'Parcelas Fixas'})
💰 *Financiamento:* ${formatCurrency(financedAmount)} em ${termMonths} meses (${Math.round(termMonths / 12)} anos)
📈 *Taxa de Juros:* ${annualInterestRate}% a.a.

✨ *APORTE EXTRAORDINÁRIO:*
• *Valor:* ${formatCurrency(extraAmount)} (${extraFrequency === 'unico' ? 'Aporte Único' : extraFrequency === 'mensal' ? 'Todo Mês' : 'Anual / 13º / FGTS'})
• *Estratégia:* ${strategy === 'prazo' ? 'Reduzir Prazo (Eliminar Parcelas)' : 'Reduzir Parcela (Aliviar Mensalidade)'}

🚀 *RESULTADO DO ESTUDO:*
💵 *ECONOMIA DE JUROS:* *${formatCurrency(summary.savedInterest)}*
⏳ *PRAZO CORTADO:* *${summary.monthsReduced} meses* (~${summary.yearsReduced} anos a menos de dívida!)
📉 *NOVO PRAZO TOTAL:* ${summary.simTermMonths} meses (${Math.round((summary.simTermMonths / 12) * 10) / 10} anos)
🏷️ *Custo Total Sem Aportes:* ${formatCurrency(summary.originalTotalPaid)}
🏷️ *Custo Total Com Aportes:* ${formatCurrency(summary.simTotalPaid)}

_Simulação gerada pela Torre Sul Imobiliária._`;

    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 3 Sub-Tabs Bar: Amortização, Aluguel x Financiamento, Investidores */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('amortizacao')}
          className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'amortizacao'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <TrendingDown className="w-4 h-4 text-red-500" />
          <span>Amortização (SAC / PRICE)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('aluguel_vs_financiamento')}
          className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'aluguel_vs_financiamento'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calculator className="w-4 h-4 text-amber-500" />
          <span>Aluguel x Financiamento</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('investidores')}
          className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'investidores'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <PiggyBank className="w-4 h-4 text-emerald-500" />
          <span>Simulador p/ Investidores</span>
        </button>
      </div>

      {/* Sub-Tab 2: Aluguel vs Financiamento */}
      {activeSubTab === 'aluguel_vs_financiamento' && <RentVsFinancingTab />}

      {/* Sub-Tab 3: Investidores Imobiliários */}
      {activeSubTab === 'investidores' && <InvestorCalculatorTab />}

      {/* Sub-Tab 1: Amortização Financiamento SAC & PRICE */}
      {activeSubTab === 'amortizacao' && (
        <>
          {/* Tool Header */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                  Simulador Financeiro
                </span>
                <span className="text-xs text-slate-400">SAC & PRICE</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                Simulador de Amortização Imobiliária
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-0.5">
                Descubra exatamente quantos anos de parcelas e quanto dinheiro de juros seu cliente pode cortar fazendo aportes extras (FGTS, 13º ou aportes mensais).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Share2 className="w-4 h-4" />
                <span>Enviar no WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Imprimir simulação"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimir</span>
              </button>
            </div>
          </div>

      {/* Copy Toast Feedback */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-emerald-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Resumo da simulação copiado para o WhatsApp!</span>
        </div>
      )}

      {/* Main Form & Setup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Box 1: Dados do Financiamento Original */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-heading">
                <span className="w-2 h-2 rounded-full bg-slate-900" />
                1. Contrato de Financiamento
              </h3>
              <span className="text-[11px] text-slate-400">Valores iniciais</span>
            </div>

            {/* Saldo Devedor / Financiado */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Saldo Devedor / Valor Financiado (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={financedAmount}
                  onChange={(e) => setFinancedAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>{formatCurrency(financedAmount)}</span>
                <div className="flex gap-1">
                  {[250000, 400000, 600000, 800000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setFinancedAmount(v)}
                      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold cursor-pointer"
                    >
                      {v / 1000}k
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sistema de Amortização (SAC vs PRICE) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tabela de Amortização
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSystem('SAC')}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                    system === 'SAC'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-xs">Tabela SAC</div>
                  <div className={`text-[10px] mt-0.5 ${system === 'SAC' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Parcelas Decrescentes (Padrão Caixa)
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSystem('PRICE')}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                    system === 'PRICE'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-xs">Tabela PRICE</div>
                  <div className={`text-[10px] mt-0.5 ${system === 'PRICE' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Parcelas Fixas (Bancos Privados)
                  </div>
                </button>
              </div>
            </div>

            {/* Prazo e Taxa de Juros */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prazo Total
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="12"
                    max="480"
                    step="12"
                    value={termMonths}
                    onChange={(e) => setTermMonths(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">meses</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  {Math.round(termMonths / 12)} anos ({termMonths}x)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Taxa de Juros (% a.a.)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    step="0.01"
                    value={annualInterestRate}
                    onChange={(e) => setAnnualInterestRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">% a.a.</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  ~{(annualInterestRate / 12).toFixed(3)}% ao mês
                </span>
              </div>
            </div>

            {/* Taxas Acessórias (Seguro e Tarifa Adm) */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Taxa Adm (R$/mês)
                </label>
                <input
                  type="number"
                  value={adminFee}
                  onChange={(e) => setAdminFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Seguro MIP/DFI (%/mês)
                </label>
                <input
                  type="number"
                  step="0.005"
                  value={mipDfiRate}
                  onChange={(e) => setMipDfiRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

          </div>

          {/* Box 2: Simulação de Aporte Extraordinário */}
          <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-2xl p-5 border border-emerald-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5 font-heading">
                <PiggyBank className="w-4 h-4 text-emerald-600" />
                2. Aporte Extraordinário (Amortização)
              </h3>
              <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                Poder dos Juros
              </span>
            </div>

            {/* Valor do Aporte */}
            <div>
              <label className="block text-xs font-semibold text-emerald-950 mb-1">
                Valor do Aporte Extra (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-emerald-600">R$</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={extraAmount}
                  onChange={(e) => setExtraAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-emerald-300 rounded-xl text-sm font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-1.5 mt-1.5">
                {[500, 1000, 2000, 5000, 10000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setExtraAmount(v)}
                    className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100 transition cursor-pointer"
                  >
                    +R${v >= 1000 ? `${v / 1000}k` : v}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequência do Aporte */}
            <div>
              <label className="block text-xs font-semibold text-emerald-950 mb-1">
                Frequência do Aporte
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'mensal', label: 'Mensal', desc: 'Todo mês' },
                  { id: 'anual', label: 'Anual', desc: '13º / FGTS' },
                  { id: 'unico', label: 'Único', desc: 'Uma vez' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setExtraFrequency(f.id as AmortizationExtraFrequency)}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      extraFrequency === f.id
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs font-bold'
                        : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-100/60'
                    }`}
                  >
                    <div className="text-xs font-bold">{f.label}</div>
                    <div className={`text-[10px] ${extraFrequency === f.id ? 'text-emerald-100' : 'text-emerald-600'}`}>
                      {f.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Estratégia de Amortização (Reduzir Prazo vs Reduzir Parcela) */}
            <div>
              <label className="block text-xs font-semibold text-emerald-950 mb-1 flex items-center justify-between">
                <span>Estratégia de Amortização</span>
                <span className="text-[10px] text-emerald-700 font-normal">Qual objetivo do cliente?</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStrategy('prazo')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                    strategy === 'prazo'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm ring-2 ring-emerald-300'
                      : 'bg-white text-slate-800 border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1">
                    <span>Reduzir Prazo</span>
                    <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.2 rounded font-black">
                      TOP
                    </span>
                  </div>
                  <div className={`text-[10px] mt-1 ${strategy === 'prazo' ? 'text-emerald-100' : 'text-slate-500'}`}>
                    Elimina parcelas do final e gera a <strong>maior economia de juros</strong>.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStrategy('parcela')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                    strategy === 'parcela'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm ring-2 ring-emerald-300'
                      : 'bg-white text-slate-800 border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  <div className="font-bold text-xs">Reduzir Parcela</div>
                  <div className={`text-[10px] mt-1 ${strategy === 'parcela' ? 'text-emerald-100' : 'text-slate-500'}`}>
                    Mantém o mesmo prazo e reduz o valor da prestação mensal no bolso.
                  </div>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Key Results, KPI Metrics, Charts (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Big Highlight Hero: Economia de Juros e Anos a Menos */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Economia Real no Bolso do Comprador
                </span>
                <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1 font-heading">
                  {formatCurrency(summary.savedInterest)}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Total de juros bancários evitados com a amortização programada
                </p>
              </div>

              {strategy === 'prazo' && summary.monthsReduced > 0 && (
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-3 sm:text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-emerald-300 block">Tempo Cortado</span>
                  <div className="text-2xl font-black text-emerald-400 font-heading">
                    -{summary.monthsReduced} meses
                  </div>
                  <span className="text-xs text-emerald-200">
                    (~{summary.yearsReduced} anos a menos!)
                  </span>
                </div>
              )}
            </div>

            {/* Quick stats comparison bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-700/60 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Prazo Inicial</span>
                <span className="font-bold text-white text-sm">{summary.originalTermMonths} meses</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Novo Prazo</span>
                <span className="font-bold text-emerald-400 text-sm">{summary.simTermMonths} meses</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Custo Original Total</span>
                <span className="font-bold text-slate-300 text-sm">{formatCurrency(summary.originalTotalPaid)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Novo Custo Total</span>
                <span className="font-bold text-emerald-400 text-sm">{formatCurrency(summary.simTotalPaid)}</span>
              </div>
            </div>
          </div>

          {/* KPI Mini Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                1ª Parcela Original
              </span>
              <div className="text-lg font-bold text-slate-900 font-heading">
                {formatCurrency(summary.originalInitialPayment)}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Última: {formatCurrency(summary.originalLastPayment)}
              </span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                {strategy === 'parcela' ? 'Nova Parcela Após Aporte' : 'Parcela com Aporte'}
              </span>
              <div className="text-lg font-bold text-emerald-700 font-heading">
                {formatCurrency(strategy === 'parcela' ? summary.simCurrentPaymentAfterExtra : summary.simInitialPayment)}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {strategy === 'parcela' ? 'Prestação reduzida' : 'Inclui aporte programado'}
              </span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                Total Aportado
              </span>
              <div className="text-lg font-bold text-blue-700 font-heading">
                {formatCurrency(summary.totalExtraInvested)}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Retorno: {(summary.savedInterest / (summary.totalExtraInvested || 1)).toFixed(1)}x em juros
              </span>
            </div>
          </div>

          {/* Interactive Chart: Curva de Quitação do Saldo Devedor */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-slate-700" />
                  Evolução do Saldo Devedor (Ano a Ano)
                </h4>
                <p className="text-xs text-slate-400">
                  Veja a antecipação brutal do fim da dívida na linha verde
                </p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="ano" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                  <YAxis 
                    tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(val: any) => [formatCurrency(Number(val)), '']}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="Original (Sem Aporte)" 
                    stroke="#94a3b8" 
                    strokeWidth={2} 
                    dot={false} 
                    strokeDasharray="4 4"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Com Amortização" 
                    stroke="#059669" 
                    strokeWidth={3} 
                    dot={{ r: 3, fill: '#059669' }} 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* Collapsible Detailed Monthly Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Tabela de Amortização Detalhada Mês a Mês
            </h3>
            <p className="text-xs text-slate-500">
              Acompanhe a amortização da dívida, juros decrescentes e impacto de cada aporte
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setTableFilter('primeiros_24')}
                className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition ${
                  tableFilter === 'primeiros_24' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                24 Meses
              </button>
              <button
                type="button"
                onClick={() => setTableFilter('anuais')}
                className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition ${
                  tableFilter === 'anuais' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Anuais
              </button>
              <button
                type="button"
                onClick={() => setTableFilter('todos')}
                className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition ${
                  tableFilter === 'todos' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({schedule.length})
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3">Mês</th>
                <th className="py-2.5 px-3">Parcela Original</th>
                <th className="py-2.5 px-3 text-emerald-800">Nova Parcela</th>
                <th className="py-2.5 px-3">Amortização</th>
                <th className="py-2.5 px-3 text-red-600">Juros do Mês</th>
                <th className="py-2.5 px-3 text-blue-700">Aporte Extra</th>
                <th className="py-2.5 px-3 text-right">Saldo Devedor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedSchedule.map((row) => (
                <tr 
                  key={row.month} 
                  className={`hover:bg-slate-50/80 transition-colors ${
                    row.simExtra > 0 ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  <td className="py-2 px-3 font-semibold text-slate-800">
                    {row.month}º ({Math.ceil(row.month / 12)}º ano)
                  </td>
                  <td className="py-2 px-3 text-slate-500">
                    {formatCurrency(row.originalPayment)}
                  </td>
                  <td className="py-2 px-3 font-bold text-emerald-700">
                    {formatCurrency(row.simPayment)}
                  </td>
                  <td className="py-2 px-3 text-slate-700">
                    {formatCurrency(row.simAmortization)}
                  </td>
                  <td className="py-2 px-3 text-red-600">
                    {formatCurrency(row.simInterest)}
                  </td>
                  <td className="py-2 px-3 font-bold text-red-600">
                    {row.simExtra > 0 ? `+${formatCurrency(row.simExtra)}` : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900">
                    {formatCurrency(row.simBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
          Exibindo {displayedSchedule.length} de {schedule.length} meses simulados.
        </div>
      </div>
        </>
      )}

    </div>
  );
};
