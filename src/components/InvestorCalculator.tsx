import React, { useState } from 'react';
import {
  TrendingUp,
  Percent,
  RefreshCw,
  Share2,
  Building2,
  Banknote,
  PieChart,
  HelpCircle,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { InvestorInput, InvestorStrategy } from '../types';
import { calculateInvestorMetrics } from '../utils/investorCalculations';
import { formatCurrency } from '../utils/formatters';

export const InvestorCalculator: React.FC = () => {
  const [strategy, setStrategy] = useState<InvestorStrategy>('RENTAL');

  const [input, setInput] = useState<InvestorInput>({
    propertyPurchasePrice: 240000,
    acquisitionClosingCostsPercent: 4.0, // ITBI + Registro Cartório
    renovationCost: 8000,
    furnitureCost: 15000, // Mobília para locação pronta ou Airbnb
    estimatedMonthlyRent: 1800, // Blumenau 0.6% a 0.8%
    vacancyRatePercent: 5.0,
    propertyManagementFeePercent: 8.0, // Taxa da imobiliária
    annualMaintenanceAndTaxes: 1200, // IPTU + reparos anuais
    annualAppreciationRate: 8.0, // Média imobiliária em Santa Catarina
    // Flip fields
    estimatedResalePrice: 330000,
    holdingPeriodMonths: 12,
    brokerSellingFeePercent: 6.0,
    capitalGainsTaxPercent: 15.0, // IR Ganho de Capital
    holdingMonthlyCosts: 450, // Condomínio + IPTU na reforma
  });

  const [copied, setCopied] = useState(false);
  const metrics = calculateInvestorMetrics(input);

  const handleShareWhatsApp = () => {
    let text = '';
    if (strategy === 'RENTAL') {
      text = `📊 *ESTUDO DE VIABILIDADE PARA INVESTIDOR - TORRESUL IMOBILIÁRIA*
🏢 Imóvel: ${formatCurrency(input.propertyPurchasePrice)}
💰 Investimento Total (com custos e mobília): *${formatCurrency(metrics.totalInitialInvestment)}*

📈 *INDICADORES DE LOCAÇÃO:*
• Aluguel Estimado: ${formatCurrency(input.estimatedMonthlyRent)}/mês
• *Rental Yield Líquido:* *${metrics.annualNetYield.toFixed(2)}% a.a.* (${metrics.monthlyNetYield.toFixed(2)}%/mês)
• Valorização Imobiliária Projetada: *${input.annualAppreciationRate.toFixed(1)}% a.a.*
• *RETORNO TOTAL ANUAL (Yield + Ganho de Capital):* *${metrics.totalAnnualReturnPercent.toFixed(2)}% a.a.*
• Tempo de Payback estimado: *${metrics.paybackYears.toFixed(1)} anos*

📲 Análise por *Torresul Imobiliária • createdbycristianlimas*`;
    } else {
      text = `📊 *ESTUDO DE FLIP / REVENDA - TORRESUL IMOBILIÁRIA*
🏢 Compra: ${formatCurrency(input.propertyPurchasePrice)}
🔨 Investimento Total (com obras e custos): *${formatCurrency(metrics.totalInitialInvestment + metrics.totalHoldingCosts)}*
🏷️ Preço Estimado de Venda: *${formatCurrency(input.estimatedResalePrice)}* em ${input.holdingPeriodMonths} meses

📈 *LUCRO E RENTABILIDADE:*
• *Lucro Líquido no Bolso:* *${formatCurrency(metrics.netProfit)}*
• *ROI Líquido do Projeto:* *${metrics.totalROI.toFixed(1)}%*
• *TIR Anualizada:* *${metrics.annualizedTIR.toFixed(1)}% a.a.* (vs CDI Líquido de ~10,5%)

📲 Análise por *Torresul Imobiliária • createdbycristianlimas*`;
    }

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Selector: Rental vs Flip */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                Módulo Investidor
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 font-medium">Torresul Imobiliária</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1 font-heading">
              Simulador de rentabilidade e viabilidade para investidores
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cálculo de yield líquido de locação mensal ou retorno por operação de compra, reforma e revenda (flip).
            </p>
          </div>

          {/* Strategy Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md border border-slate-200/80 shrink-0">
            <button
              onClick={() => setStrategy('RENTAL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
                strategy === 'RENTAL'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Banknote className="w-3.5 h-3.5 text-emerald-700" />
              <span>Renda de aluguel (Yield)</span>
            </button>
            <button
              onClick={() => setStrategy('FLIP')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
                strategy === 'FLIP'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-red-600" />
              <span>Compra e revenda (Flip)</span>
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Simulação estruturada para apresentação a clientes investidores e fundos imobiliários</span>
          </div>
          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition cursor-pointer shrink-0"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-300" />
            <span>{copied ? 'Copiado para WhatsApp!' : 'Compartilhar no WhatsApp'}</span>
          </button>
        </div>
      </div>

      {/* RESULT HERO CARDS */}
      {strategy === 'RENTAL' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Yield Líquido */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Rental yield líquido
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2 tabular-nums">
              {metrics.annualNetYield.toFixed(2)}% <span className="text-xs font-medium text-slate-500">a.a.</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block tabular-nums">
              ~{metrics.monthlyNetYield.toFixed(2)}%/mês líquido de custos
            </span>
          </div>

          {/* Card 2: Retorno Total (Yield + Valorização) */}
          <div className="bg-slate-900 text-white rounded-lg border border-slate-800 p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Retorno total anual
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2 tabular-nums">
              {metrics.totalAnnualReturnPercent.toFixed(2)}% <span className="text-xs font-medium text-slate-400">a.a.</span>
            </div>
            <span className="text-xs text-emerald-400 mt-1 block tabular-nums">
              Yield ({metrics.annualNetYield.toFixed(1)}%) + Valorização ({input.annualAppreciationRate}%)
            </span>
          </div>

          {/* Card 3: Receita Líquida Anual (NOI) */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Renda líquida anual (NOI)
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tabular-nums">
              {formatCurrency(metrics.netAnnualOperatingIncome)}
            </div>
            <span className="text-xs text-slate-500 mt-1 block tabular-nums">
              ~{formatCurrency(metrics.netAnnualOperatingIncome / 12)}/mês líquido
            </span>
          </div>

          {/* Card 4: Investimento Total */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Investimento total
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tabular-nums">
              {formatCurrency(metrics.totalInitialInvestment)}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Imóvel + ITBI + Mobília
            </span>
          </div>
        </div>
      ) : (
        /* FLIP HERO CARDS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Lucro Líquido */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Lucro líquido em caixa
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2 tabular-nums">
              {formatCurrency(metrics.netProfit)}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Descontados IR (15%) e corretagem
            </span>
          </div>

          {/* Card 2: TIR Anualizada */}
          <div className="bg-slate-900 text-white rounded-lg border border-slate-800 p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              TIR anualizada
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2 tabular-nums">
              {metrics.annualizedTIR.toFixed(1)}% <span className="text-xs font-medium text-slate-400">a.a.</span>
            </div>
            <span className="text-xs text-emerald-400 mt-1 block tabular-nums">
              vs ~{metrics.cdiNetAnnualRate}% do CDI Líquido
            </span>
          </div>

          {/* Card 3: ROI Total do Projeto */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              ROI do projeto
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tabular-nums">
              {metrics.totalROI.toFixed(1)}%
            </div>
            <span className="text-xs text-slate-500 mt-1 block tabular-nums">
              Sobre o capital total em {input.holdingPeriodMonths} meses
            </span>
          </div>

          {/* Card 4: Preço Estimado de Revenda */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Preço estimado de saída
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tabular-nums">
              {formatCurrency(input.estimatedResalePrice)}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Prazo previsto: {input.holdingPeriodMonths} meses
            </span>
          </div>
        </div>
      )}

      {/* FORM INPUTS */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
          <span>Parâmetros financeiros da operação</span>
          <span className="text-xs font-normal text-slate-400">Altere os campos para recalcular instantaneamente</span>
        </h3>

        {/* Parâmetros Gerais de Aquisição */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Valor de compra do imóvel (R$)
            </label>
            <input
              type="number"
              step="5000"
              value={input.propertyPurchasePrice}
              onChange={(e) => setInput({ ...input, propertyPurchasePrice: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-red-600 outline-none tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Custos de aquisição (ITBI + Cartório %)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                value={input.acquisitionClosingCostsPercent}
                onChange={(e) => setInput({ ...input, acquisitionClosingCostsPercent: Number(e.target.value) })}
                className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-red-600 outline-none tabular-nums"
              />
              <span className="text-xs text-slate-500 font-medium tabular-nums">
                ({formatCurrency(metrics.acquisitionCosts)})
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Reforma / Melhorias (R$)
            </label>
            <input
              type="number"
              step="1000"
              value={input.renovationCost}
              onChange={(e) => setInput({ ...input, renovationCost: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-red-600 outline-none tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Mobília / Decoração (R$)
            </label>
            <input
              type="number"
              step="1000"
              value={input.furnitureCost}
              onChange={(e) => setInput({ ...input, furnitureCost: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-red-600 outline-none tabular-nums"
            />
          </div>
        </div>

        {/* Inputs Específicos por Estratégia */}
        {strategy === 'RENTAL' ? (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Aluguel mensal bruto estimado (R$)
              </label>
              <input
                type="number"
                step="50"
                value={input.estimatedMonthlyRent}
                onChange={(e) => setInput({ ...input, estimatedMonthlyRent: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-red-600 outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Taxa de vacância estimada (%)
              </label>
              <input
                type="number"
                step="1"
                value={input.vacancyRatePercent}
                onChange={(e) => setInput({ ...input, vacancyRatePercent: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-red-600 outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Taxa de administração imobiliária (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={input.propertyManagementFeePercent}
                onChange={(e) => setInput({ ...input, propertyManagementFeePercent: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-red-600 outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Valorização anual projetada (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={input.annualAppreciationRate}
                onChange={(e) => setInput({ ...input, annualAppreciationRate: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-red-600 outline-none tabular-nums"
              />
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Preço de revenda estimado (R$)
              </label>
              <input
                type="number"
                step="5000"
                value={input.estimatedResalePrice}
                onChange={(e) => setInput({ ...input, estimatedResalePrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-red-600 outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Prazo total do flip (meses)
              </label>
              <input
                type="number"
                min="1"
                max="48"
                value={input.holdingPeriodMonths}
                onChange={(e) => setInput({ ...input, holdingPeriodMonths: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-red-600 outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Comissão de venda corretagem (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={input.brokerSellingFeePercent}
                onChange={(e) => setInput({ ...input, brokerSellingFeePercent: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-red-600 outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Custo fixo mensal de obra/holding (R$)
              </label>
              <input
                type="number"
                step="50"
                value={input.holdingMonthlyCosts}
                onChange={(e) => setInput({ ...input, holdingMonthlyCosts: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-red-600 outline-none tabular-nums"
              />
            </div>
          </div>
        )}
      </div>

      {/* BENCHMARK COMPARISON */}
      <div className="p-4 sm:p-5 rounded-lg bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Comparativo com mercado financeiro (CDI e Tesouro Selic)
          </span>
          <p className="text-xs text-slate-300">
            O CDI Líquido hoje rende aproximadamente <strong>10,50% a.a.</strong> após dedução do Imposto de Renda (15%).
            {strategy === 'RENTAL' ? (
              <>
                {' '}O retorno imobiliário projetado é de{' '}
                <strong className="text-white font-bold tabular-nums">{metrics.totalAnnualReturnPercent.toFixed(2)}% a.a.</strong>{' '}
                com a segurança patrimonial de um ativo real físico inconfiscável.
              </>
            ) : (
              <>
                {' '}A operação de Flip projeta uma TIR Anualizada de{' '}
                <strong className="text-white font-bold tabular-nums">{metrics.annualizedTIR.toFixed(1)}% a.a.</strong>, superando o CDI em{' '}
                <strong className="text-emerald-400 font-bold tabular-nums">
                  {(metrics.annualizedTIR - metrics.cdiNetAnnualRate).toFixed(1)} pontos percentuais
                </strong>.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
