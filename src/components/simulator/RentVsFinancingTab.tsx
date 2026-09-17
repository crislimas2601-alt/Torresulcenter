import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  TrendingUp, 
  Home, 
  PiggyBank, 
  DollarSign, 
  Percent, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

export const RentVsFinancingTab: React.FC = () => {
  // Inputs
  const [propertyValue, setPropertyValue] = useState<number>(450000);
  const [downPayment, setDownPayment] = useState<number>(90000); // 20%
  const [initialRent, setInitialRent] = useState<number>(2200);
  const [termYears, setTermYears] = useState<number>(30); // 360 meses
  const [financingRateAnnual, setFinancingRateAnnual] = useState<number>(9.99); // % a.a.
  const [investmentReturnAnnual, setInvestmentReturnAnnual] = useState<number>(10.5); // % a.a. CDI líq
  const [propertyAppreciationAnnual, setPropertyAppreciationAnnual] = useState<number>(6.0); // % a.a.
  const [rentInflationAnnual, setRentInflationAnnual] = useState<number>(4.5); // % a.a. IPCA

  const [copied, setCopied] = useState(false);

  // Calculations
  const comparison = useMemo(() => {
    const financedPrincipal = Math.max(0, propertyValue - downPayment);
    const totalMonths = Math.min(360, Math.max(12, termYears * 12));
    const monthlyFinancingRate = Math.pow(1 + financingRateAnnual / 100, 1 / 12) - 1;
    const monthlyInvestmentRate = Math.pow(1 + investmentReturnAnnual / 100, 1 / 12) - 1;
    const monthlyAppreciationRate = Math.pow(1 + propertyAppreciationAnnual / 100, 1 / 12) - 1;
    const monthlyRentInflation = Math.pow(1 + rentInflationAnnual / 100, 1 / 12) - 1;

    // Fixed PRICE installment estimate or initial SAC average
    const pricePayment = monthlyFinancingRate > 0 && financedPrincipal > 0
      ? (financedPrincipal * monthlyFinancingRate * Math.pow(1 + monthlyFinancingRate, totalMonths)) /
        (Math.pow(1 + monthlyFinancingRate, totalMonths) - 1)
      : financedPrincipal / totalMonths;

    let investmentPortfolio = downPayment;
    let totalRentPaid = 0;
    let totalFinancingPaid = 0;
    let currentMonthlyRent = initialRent;
    let propertyAppreciatedValue = propertyValue;

    const yearlyData: Array<{
      year: number;
      imovelPatrimonio: number;
      investimentoPatrimonio: number;
      totalAluguelGasto: number;
      totalFinanciamentoGasto: number;
    }> = [];

    for (let m = 1; m <= totalMonths; m++) {
      // Inflation adjustment on rent yearly
      if (m > 1 && (m - 1) % 12 === 0) {
        currentMonthlyRent = currentMonthlyRent * (1 + rentInflationAnnual / 100);
      }

      totalRentPaid += currentMonthlyRent;
      totalFinancingPaid += pricePayment;

      // Investment growth
      investmentPortfolio = investmentPortfolio * (1 + monthlyInvestmentRate);

      // If financing payment > rent, the tenant can invest the difference!
      // If rent > financing payment, the tenant draws from investments to pay rent
      const cashDifference = pricePayment - currentMonthlyRent;
      if (cashDifference > 0) {
        investmentPortfolio += cashDifference;
      } else {
        investmentPortfolio += cashDifference; // subtracts
      }

      // Property value appreciation
      propertyAppreciatedValue = propertyAppreciatedValue * (1 + monthlyAppreciationRate);

      // Record yearly checkpoint
      if (m % 12 === 0 || m === totalMonths) {
        const yr = Math.round(m / 12);
        yearlyData.push({
          year: yr,
          imovelPatrimonio: Math.round(propertyAppreciatedValue),
          investimentoPatrimonio: Math.max(0, Math.round(investmentPortfolio)),
          totalAluguelGasto: Math.round(totalRentPaid),
          totalFinanciamentoGasto: Math.round(totalFinancingPaid + downPayment),
        });
      }
    }

    const finalPropertyPatrimony = Math.round(propertyAppreciatedValue);
    const finalInvestmentPatrimony = Math.max(0, Math.round(investmentPortfolio));
    const patrimonyDifference = finalPropertyPatrimony - finalInvestmentPatrimony;

    return {
      pricePayment: Math.round(pricePayment),
      totalFinancingPaid: Math.round(totalFinancingPaid + downPayment),
      totalRentPaid: Math.round(totalRentPaid),
      finalPropertyPatrimony,
      finalInvestmentPatrimony,
      patrimonyDifference,
      yearlyData,
      isPropertyWinner: patrimonyDifference >= 0,
    };
  }, [
    propertyValue,
    downPayment,
    initialRent,
    termYears,
    financingRateAnnual,
    investmentReturnAnnual,
    propertyAppreciationAnnual,
    rentInflationAnnual,
  ]);

  const handleCopySummary = () => {
    const text = `📊 COMPARATIVO: ALUGUEL X FINANCIAMENTO
🏡 Imóvel: ${formatCurrency(propertyValue)} | Entrada: ${formatCurrency(downPayment)}
📅 Prazo: ${termYears} anos (${termYears * 12} meses)

📌 CENÁRIO 1: FINANCIAR IMÓVEL
- Parcela estimada: ${formatCurrency(comparison.pricePayment)}/mês
- Total desembolsado: ${formatCurrency(comparison.totalFinancingPaid)}
- Patrimônio Líquido Final: ${formatCurrency(comparison.finalPropertyPatrimony)} (Imóvel quitado e valorizado)

📌 CENÁRIO 2: ALUGAR E INVESTIR A DIFERENÇA
- Aluguel inicial: ${formatCurrency(initialRent)}/mês
- Total gasto com aluguel (sem retorno): ${formatCurrency(comparison.totalRentPaid)}
- Patrimônio Final em Investimentos: ${formatCurrency(comparison.finalInvestmentPatrimony)}

💡 RESULTADO FINAL:
${comparison.isPropertyWinner 
  ? `✅ Comprar o imóvel gera +${formatCurrency(comparison.patrimonyDifference)} a mais de patrimônio final!` 
  : `⚠️ Alugar e investir gera +${formatCurrency(Math.abs(comparison.patrimonyDifference))} a mais de liquidez!`}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              Comparador: Aluguel vs Financiamento Imobiliário
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-red-50 text-red-700 border border-red-200">
              Análise Patrimonial
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simule o acúmulo de patrimônio real comparando a compra de um imóvel próprio versus morar de aluguel e investir a sobra.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopySummary}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 self-start md:self-auto shadow-xs"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copiado para o Clipboard!' : 'Copiar Resumo'}</span>
        </button>
      </div>

      {/* Input Parameters Form */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-red-600" />
          <span>Parâmetros de Mercado & Condições</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Valor do Imóvel (R$)
            </label>
            <input
              type="number"
              value={propertyValue}
              onChange={(e) => setPropertyValue(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Entrada Disponível (R$)
            </label>
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Aluguel Mensal Atual (R$)
            </label>
            <input
              type="number"
              value={initialRent}
              onChange={(e) => setInitialRent(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Prazo de Comparação (Anos)
            </label>
            <select
              value={termYears}
              onChange={(e) => setTermYears(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 cursor-pointer"
            >
              <option value={10}>10 anos (120 meses)</option>
              <option value={15}>15 anos (180 meses)</option>
              <option value={20}>20 anos (240 meses)</option>
              <option value={25}>25 anos (300 meses)</option>
              <option value={30}>30 anos (360 meses)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Juros do Financiamento (% a.a.)
            </label>
            <input
              type="number"
              step="0.01"
              value={financingRateAnnual}
              onChange={(e) => setFinancingRateAnnual(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rendimento Investimentos (% a.a.)
            </label>
            <input
              type="number"
              step="0.01"
              value={investmentReturnAnnual}
              onChange={(e) => setInvestmentReturnAnnual(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Valorização do Imóvel (% a.a.)
            </label>
            <input
              type="number"
              step="0.01"
              value={propertyAppreciationAnnual}
              onChange={(e) => setPropertyAppreciationAnnual(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reajuste Anual Aluguel (% a.a.)
            </label>
            <input
              type="number"
              step="0.01"
              value={rentInflationAnnual}
              onChange={(e) => setRentInflationAnnual(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

        </div>
      </div>

      {/* Outcome Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Cenário Financiamento */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Cenário 1: Financiamento
            </span>
            <Home className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 font-heading block">
              {formatCurrency(comparison.finalPropertyPatrimony)}
            </span>
            <span className="text-xs text-slate-500">
              Patrimônio final (Imóvel quitado valorizado)
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Parcela estimada:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(comparison.pricePayment)}/mês</span>
            </div>
            <div className="flex justify-between">
              <span>Total desembolsado:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(comparison.totalFinancingPaid)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Cenário Aluguel */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Cenário 2: Aluguel + Investir
            </span>
            <PiggyBank className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 font-heading block">
              {formatCurrency(comparison.finalInvestmentPatrimony)}
            </span>
            <span className="text-xs text-slate-500">
              Patrimônio final em investimentos
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Gasto total c/ aluguel:</span>
              <span className="font-semibold text-red-600">-{formatCurrency(comparison.totalRentPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span>Entrada aplicada:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(downPayment)}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Veredito e Diferença */}
        <div className={`rounded-xl p-5 border shadow-xs space-y-3 ${
          comparison.isPropertyWinner 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">
              Veredito Patrimonial
            </span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-2xl font-black font-heading block">
              {formatCurrency(Math.abs(comparison.patrimonyDifference))}
            </span>
            <span className="text-xs opacity-80">
              {comparison.isPropertyWinner 
                ? 'Vantagem a favor da Compra do Imóvel' 
                : 'Vantagem a favor de Alugar e Investir'}
            </span>
          </div>
          <p className="text-xs leading-relaxed opacity-90 pt-1 border-t border-current/10">
            {comparison.isPropertyWinner 
              ? `A valorização imobiliária histórica de ${propertyAppreciationAnnual}% a.a. superou a renda passiva de investimentos líquidos.` 
              : `A alta rentabilidade líquida dos investimentos superou a valorização do imóvel no período simulado.`}
          </p>
        </div>

      </div>

      {/* Chart: Patrimonial Evolution */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
          <span>Evolução do Patrimônio Acumulado (Anual)</span>
          <span className="text-xs font-normal text-slate-500">Valores em R$</span>
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparison.yearlyData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `Ano ${val}`}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(val: any) => formatCurrency(Number(val))}
                labelFormatter={(label) => `Ano ${label}`}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="imovelPatrimonio" 
                name="Imóvel Quitado (Valorizado)" 
                stroke="#DC2626" 
                strokeWidth={2.5}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="investimentoPatrimonio" 
                name="Carteira Investimentos (Aluguel)" 
                stroke="#d97706" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
