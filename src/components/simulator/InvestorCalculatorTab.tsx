import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Building2, 
  Calendar, 
  Award, 
  ShieldCheck, 
  ArrowUpRight, 
  CheckCircle2, 
  Copy, 
  Check,
  Layers,
  Sparkles,
  Zap,
  Repeat
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

type InvestorStrategy = 'tradicional' | 'airbnb' | 'flip_planta';

export const InvestorCalculatorTab: React.FC = () => {
  const [strategy, setStrategy] = useState<InvestorStrategy>('tradicional');

  // Common inputs
  const [propertyPrice, setPropertyPrice] = useState<number>(420000);
  const [closingCostsPercent, setClosingCostsPercent] = useState<number>(4.5); // ITBI + Registro ~ 4.5%
  const [renovationFurnishing, setRenovationFurnishing] = useState<number>(30000); // Mobília / Reforma

  // Locação Tradicional
  const [expectedRentMonthly, setExpectedRentMonthly] = useState<number>(2500);
  const [vacancyRate, setVacancyRate] = useState<number>(5.0); // % ao ano
  const [managementFeePercent, setManagementFeePercent] = useState<number>(8.0); // % imobiliária
  const [annualMaintenance, setAnnualMaintenance] = useState<number>(1500); // R$/ano

  // Airbnb / Short Stay
  const [dailyRate, setDailyRate] = useState<number>(240);
  const [occupancyRate, setOccupancyRate] = useState<number>(65); // %
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(3.0); // Airbnb host fee
  const [cleaningAndUtilitiesMonthly, setCleaningAndUtilitiesMonthly] = useState<number>(650);

  // Flip / Planta
  const [constructionMonths, setConstructionMonths] = useState<number>(24);
  const [expectedExitValue, setExpectedExitValue] = useState<number>(560000);
  const [brokerSellingFeePercent, setBrokerSellingFeePercent] = useState<number>(5.0);
  const [capitalGainsTaxPercent, setCapitalGainsTaxPercent] = useState<number>(15.0); // IR ganho de capital

  const [copied, setCopied] = useState(false);

  // Total initial investment
  const totalInvestment = useMemo(() => {
    const closingCosts = (propertyPrice * closingCostsPercent) / 100;
    return propertyPrice + closingCosts + renovationFurnishing;
  }, [propertyPrice, closingCostsPercent, renovationFurnishing]);

  // 1. Locação Tradicional Calculation
  const traditionalStats = useMemo(() => {
    const grossAnnualRent = expectedRentMonthly * 12;
    const vacancyLoss = (grossAnnualRent * vacancyRate) / 100;
    const effectiveGross = grossAnnualRent - vacancyLoss;
    const managementCost = (effectiveGross * managementFeePercent) / 100;
    const netAnnualRent = effectiveGross - managementCost - annualMaintenance;
    const netMonthlyRent = netAnnualRent / 12;

    const grossYieldAnnual = totalInvestment > 0 ? (grossAnnualRent / totalInvestment) * 100 : 0;
    const netYieldAnnual = totalInvestment > 0 ? (netAnnualRent / totalInvestment) * 100 : 0;
    const paybackYears = netAnnualRent > 0 ? totalInvestment / netAnnualRent : 0;

    return {
      grossAnnualRent,
      netAnnualRent,
      netMonthlyRent,
      grossYieldAnnual,
      netYieldAnnual,
      paybackYears,
    };
  }, [expectedRentMonthly, vacancyRate, managementFeePercent, annualMaintenance, totalInvestment]);

  // 2. Airbnb Calculation
  const airbnbStats = useMemo(() => {
    const occupiedDaysPerMonth = (30 * occupancyRate) / 100;
    const grossMonthlyRevenue = occupiedDaysPerMonth * dailyRate;
    const grossAnnualRevenue = grossMonthlyRevenue * 12;
    const platformCostsMonthly = (grossMonthlyRevenue * platformFeePercent) / 100;
    const netMonthlyRevenue = grossMonthlyRevenue - platformCostsMonthly - cleaningAndUtilitiesMonthly;
    const netAnnualRevenue = netMonthlyRevenue * 12;

    const netYieldAnnual = totalInvestment > 0 ? (netAnnualRevenue / totalInvestment) * 100 : 0;
    const paybackYears = netAnnualRevenue > 0 ? totalInvestment / netAnnualRevenue : 0;

    return {
      occupiedDaysPerMonth: Math.round(occupiedDaysPerMonth),
      grossMonthlyRevenue,
      netMonthlyRevenue,
      netAnnualRevenue,
      netYieldAnnual,
      paybackYears,
    };
  }, [occupancyRate, dailyRate, platformFeePercent, cleaningAndUtilitiesMonthly, totalInvestment]);

  // 3. Flip / Planta Calculation
  const flipStats = useMemo(() => {
    const sellingBrokerFee = (expectedExitValue * brokerSellingFeePercent) / 100;
    const netSaleBeforeTax = expectedExitValue - sellingBrokerFee;
    const rawProfit = netSaleBeforeTax - totalInvestment;
    const taxAmount = rawProfit > 0 ? (rawProfit * capitalGainsTaxPercent) / 100 : 0;
    const netProfit = rawProfit - taxAmount;

    const roiTotal = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
    const years = constructionMonths / 12;
    const annualizedRoi = years > 0 ? roiTotal / years : 0;

    return {
      sellingBrokerFee,
      taxAmount,
      netProfit,
      roiTotal,
      annualizedRoi,
    };
  }, [expectedExitValue, brokerSellingFeePercent, totalInvestment, capitalGainsTaxPercent, constructionMonths]);

  const handleCopy = () => {
    let summaryText = '';

    if (strategy === 'tradicional') {
      summaryText = `🏢 ESTUDO DE INVESTIMENTO: LOCAÇÃO TRADICIONAL
💰 Preço do Imóvel: ${formatCurrency(propertyPrice)}
📦 Investimento Total Real: ${formatCurrency(totalInvestment)} (com ITBI, registro e mobília)

📊 RESULTADOS PROJETADOS:
- Aluguel Mensal Líquido: ${formatCurrency(traditionalStats.netMonthlyRent)}/mês
- Rental Yield Líquido: ${traditionalStats.netYieldAnnual.toFixed(2)}% a.a.
- Rental Yield Bruto: ${traditionalStats.grossYieldAnnual.toFixed(2)}% a.a.
- Payback Estimado: ${traditionalStats.paybackYears.toFixed(1)} anos`;
    } else if (strategy === 'airbnb') {
      summaryText = `🏖️ ESTUDO DE INVESTIMENTO: AIRBNB / SHORT STAY
💰 Investimento Total Real: ${formatCurrency(totalInvestment)}
📅 Ocupação: ${occupancyRate}% (${airbnbStats.occupiedDaysPerMonth} dias/mês) | Diária: ${formatCurrency(dailyRate)}

📊 RESULTADOS PROJETADOS:
- Renda Líquida Mensal: ${formatCurrency(airbnbStats.netMonthlyRevenue)}/mês
- Renda Líquida Anual: ${formatCurrency(airbnbStats.netAnnualRevenue)}
- Yield Líquido: ${airbnbStats.netYieldAnnual.toFixed(2)}% a.a.
- Payback: ${airbnbStats.paybackYears.toFixed(1)} anos`;
    } else {
      summaryText = `🏗️ ESTUDO DE INVESTIMENTO: PLANTA / FLIP
💰 Investimento Total: ${formatCurrency(totalInvestment)}
📅 Prazo de Execução: ${constructionMonths} meses
🚀 Venda Projetada na Entrega: ${formatCurrency(expectedExitValue)}

📊 RESULTADOS PROJETADOS:
- Lucro Líquido Real: ${formatCurrency(flipStats.netProfit)}
- ROI Total: ${flipStats.roiTotal.toFixed(2)}%
- Rentabilidade Anualizada: ${flipStats.annualizedRoi.toFixed(2)}% a.a.`;
    }

    navigator.clipboard.writeText(summaryText);
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
              Simulador de Rentabilidade para Investidores
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-red-50 text-red-700 border border-red-200">
              Yield & Cap Rate
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calcule o retorno sobre o capital investido para clientes investidores em locação tradicional, short stay (Airbnb) ou ganho na planta.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 self-start md:self-auto shadow-xs"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Estudo Copiado!' : 'Copiar Estudo p/ Investidor'}</span>
        </button>
      </div>

      {/* Strategy Selector (3 Modalidades) */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-xl max-w-xl">
        <button
          type="button"
          onClick={() => setStrategy('tradicional')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            strategy === 'tradicional'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-red-500" />
          <span>Locação Tradicional</span>
        </button>

        <button
          type="button"
          onClick={() => setStrategy('airbnb')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            strategy === 'airbnb'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Short Stay (Airbnb)</span>
        </button>

        <button
          type="button"
          onClick={() => setStrategy('flip_planta')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            strategy === 'flip_planta'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span>Ganho de Capital (Planta)</span>
        </button>
      </div>

      {/* Inputs Form */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Custos de Aquisição & Parâmetros</span>
          <span className="text-xs text-red-600 font-bold">
            Total Real Investido: {formatCurrency(totalInvestment)}
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preço de Compra do Imóvel (R$)
            </label>
            <input
              type="number"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Custos ITBI + Registro (% do valor)
            </label>
            <input
              type="number"
              step="0.1"
              value={closingCostsPercent}
              onChange={(e) => setClosingCostsPercent(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobília / Reforma Inicial (R$)
            </label>
            <input
              type="number"
              value={renovationFurnishing}
              onChange={(e) => setRenovationFurnishing(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        {/* Dynamic Inputs according to Strategy */}
        {strategy === 'tradicional' && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Aluguel Mensal Estimado (R$)
              </label>
              <input
                type="number"
                value={expectedRentMonthly}
                onChange={(e) => setExpectedRentMonthly(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Taxa de Vacância Estimada (% a.a.)
              </label>
              <input
                type="number"
                step="0.5"
                value={vacancyRate}
                onChange={(e) => setVacancyRate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Taxa Imobiliária Gestão (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={managementFeePercent}
                onChange={(e) => setManagementFeePercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Manutenção / Custos Anuais (R$)
              </label>
              <input
                type="number"
                value={annualMaintenance}
                onChange={(e) => setAnnualMaintenance(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        )}

        {strategy === 'airbnb' && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Valor da Diária Média (R$)
              </label>
              <input
                type="number"
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Taxa de Ocupação Média (%)
              </label>
              <input
                type="number"
                value={occupancyRate}
                onChange={(e) => setOccupancyRate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Taxa Plataforma Host (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={platformFeePercent}
                onChange={(e) => setPlatformFeePercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Limpeza + Luz/Internet (R$/mês)
              </label>
              <input
                type="number"
                value={cleaningAndUtilitiesMonthly}
                onChange={(e) => setCleaningAndUtilitiesMonthly(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        )}

        {strategy === 'flip_planta' && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prazo até Conclusão (Meses)
              </label>
              <input
                type="number"
                value={constructionMonths}
                onChange={(e) => setConstructionMonths(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Valor Projetado de Venda (R$)
              </label>
              <input
                type="number"
                value={expectedExitValue}
                onChange={(e) => setExpectedExitValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Comissão de Revenda (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={brokerSellingFeePercent}
                onChange={(e) => setBrokerSellingFeePercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Imposto s/ Ganho Capital (%)
              </label>
              <input
                type="number"
                step="1"
                value={capitalGainsTaxPercent}
                onChange={(e) => setCapitalGainsTaxPercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        )}

      </div>

      {/* KPI Results Display */}
      {strategy === 'tradicional' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Renda Líquida Mensal
            </span>
            <span className="text-2xl font-black text-slate-900 font-heading block">
              {formatCurrency(traditionalStats.netMonthlyRent)}
            </span>
            <span className="text-xs text-slate-500">
              Livre de imobiliária e vacância
            </span>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Rental Yield Líquido
            </span>
            <span className="text-2xl font-black text-red-600 font-heading block">
              {traditionalStats.netYieldAnnual.toFixed(2)}% a.a.
            </span>
            <span className="text-xs text-slate-500">
              Bruto: {traditionalStats.grossYieldAnnual.toFixed(2)}% a.a.
            </span>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Payback Estimado
            </span>
            <span className="text-2xl font-black text-slate-900 font-heading block">
              {traditionalStats.paybackYears.toFixed(1)} anos
            </span>
            <span className="text-xs text-slate-500">
              Retorno total do capital
            </span>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Renda Líquida Anual
            </span>
            <span className="text-2xl font-black text-emerald-600 font-heading block">
              {formatCurrency(traditionalStats.netAnnualRent)}
            </span>
            <span className="text-xs text-slate-500">
              Faturamento anual no bolso
            </span>
          </div>
        </div>
      )}

      {strategy === 'airbnb' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Faturamento Líquido Mensal
            </span>
            <span className="text-2xl font-black text-slate-900 font-heading block">
              {formatCurrency(airbnbStats.netMonthlyRevenue)}
            </span>
            <span className="text-xs text-slate-500">
              {airbnbStats.occupiedDaysPerMonth} diárias ocupadas/mês
            </span>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Yield Anualizado Airbnb
            </span>
            <span className="text-2xl font-black text-red-600 font-heading block">
              {airbnbStats.netYieldAnnual.toFixed(2)}% a.a.
            </span>
            <span className="text-xs text-slate-500">
              Rentabilidade líquida real
            </span>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Payback Estimado
            </span>
            <span className="text-2xl font-black text-slate-900 font-heading block">
              {airbnbStats.paybackYears.toFixed(1)} anos
            </span>
            <span className="text-xs text-slate-500">
              Retorno rápido via diárias
            </span>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Receita Anual Líquida
            </span>
            <span className="text-2xl font-black text-emerald-600 font-heading block">
              {formatCurrency(airbnbStats.netAnnualRevenue)}
            </span>
            <span className="text-xs text-slate-500">
              Projeção anual 12 meses
            </span>
          </div>
        </div>
      )}

      {strategy === 'flip_planta' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Lucro Líquido Final
            </span>
            <span className="text-2xl font-black text-emerald-600 font-heading block">
              {formatCurrency(flipStats.netProfit)}
            </span>
            <span className="text-xs text-slate-500">
              Livre de comissão e IR
            </span>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              ROI Total no Período
            </span>
            <span className="text-2xl font-black text-red-600 font-heading block">
              {flipStats.roiTotal.toFixed(2)}%
            </span>
            <span className="text-xs text-slate-500">
              Sobre {formatCurrency(totalInvestment)}
            </span>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Rentabilidade Anualizada
            </span>
            <span className="text-2xl font-black text-slate-900 font-heading block">
              {flipStats.annualizedRoi.toFixed(2)}% a.a.
            </span>
            <span className="text-xs text-slate-500">
              Em {constructionMonths} meses de obra
            </span>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Valor de Saída
            </span>
            <span className="text-2xl font-black text-slate-900 font-heading block">
              {formatCurrency(expectedExitValue)}
            </span>
            <span className="text-xs text-slate-500">
              Valor de revenda final
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
