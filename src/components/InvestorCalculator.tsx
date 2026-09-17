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
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-900 text-white">
                Módulo Investidor
              </span>
              <span className="text-xs text-zinc-400 font-medium">Torresul Imobiliária</span>
            </div>
            <h2 className="text-xl font-black text-zinc-900 mt-1">
              Simulador de Rendimento e Viabilidade para Investidores
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Calcule o Yield Líquido de Locação ou a TIR/ROI de Compra, Reforma e Revenda (Flip).
            </p>
          </div>

          {/* Strategy Tabs */}
          <div className="flex items-center gap-2 bg-zinc-100 p-1.5 rounded-xl border border-zinc-200">
            <button
              onClick={() => setStrategy('RENTAL')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                strategy === 'RENTAL'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Banknote className="w-4 h-4 text-emerald-600" />
              <span>Renda de Aluguel (Yield)</span>
            </button>
            <button
              onClick={() => setStrategy('FLIP')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                strategy === 'FLIP'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-red-600" />
              <span>Compra e Venda (Flip)</span>
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
            <span>Simulação profissional para apresentação a clientes investidores e fundos</span>
          </div>
          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Copiado para WhatsApp!' : 'Compartilhar Proposta no WhatsApp'}</span>
          </button>
        </div>
      </div>

      {/* RESULT HERO CARDS */}
      {strategy === 'RENTAL' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1: Yield Líquido */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Rental Yield Líquido
            </span>
            <div className="text-3xl font-black text-emerald-600 mt-2">
              {metrics.annualNetYield.toFixed(2)}% <span className="text-xs font-bold text-zinc-500">a.a.</span>
            </div>
            <span className="text-xs text-zinc-500 mt-1 block">
              ~{metrics.monthlyNetYield.toFixed(2)}% ao mês livre de custos
            </span>
          </div>

          {/* Card 2: Retorno Total (Yield + Valorização) */}
          <div className="bg-white rounded-2xl border-2 border-zinc-900 p-5 shadow-xs bg-zinc-950 text-white">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Retorno Total Anual
            </span>
            <div className="text-3xl font-black text-white mt-2">
              {metrics.totalAnnualReturnPercent.toFixed(2)}% <span className="text-xs font-bold text-zinc-400">a.a.</span>
            </div>
            <span className="text-xs text-emerald-400 mt-1 block">
              Yield ({metrics.annualNetYield.toFixed(1)}%) + Valorização ({input.annualAppreciationRate}%)
            </span>
          </div>

          {/* Card 3: Receita Líquida Anual (NOI) */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Renda Líquida Anual (NOI)
            </span>
            <div className="text-2xl font-black text-zinc-900 mt-2">
              {formatCurrency(metrics.netAnnualOperatingIncome)}
            </div>
            <span className="text-xs text-zinc-500 mt-1 block">
              ~{formatCurrency(metrics.netAnnualOperatingIncome / 12)}/mês líquido
            </span>
          </div>

          {/* Card 4: Investimento Total */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Investimento Total
            </span>
            <div className="text-2xl font-black text-zinc-900 mt-2">
              {formatCurrency(metrics.totalInitialInvestment)}
            </div>
            <span className="text-xs text-zinc-500 mt-1 block">
              Imóvel + ITBI + Mobília
            </span>
          </div>
        </div>
      ) : (
        /* FLIP HERO CARDS */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1: Lucro Líquido */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Lucro Líquido em Caixa
            </span>
            <div className="text-3xl font-black text-emerald-600 mt-2">
              {formatCurrency(metrics.netProfit)}
            </div>
            <span className="text-xs text-zinc-500 mt-1 block">
              Já descontado IR (15%) e corretagem
            </span>
          </div>

          {/* Card 2: TIR Anualizada */}
          <div className="bg-white rounded-2xl border-2 border-zinc-900 p-5 shadow-xs bg-zinc-950 text-white">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              TIR Anualizada (Taxa Interna)
            </span>
            <div className="text-3xl font-black text-white mt-2">
              {metrics.annualizedTIR.toFixed(1)}% <span className="text-xs font-bold text-zinc-400">a.a.</span>
            </div>
            <span className="text-xs text-emerald-400 mt-1 block">
              vs ~{metrics.cdiNetAnnualRate}% do CDI Líquido
            </span>
          </div>

          {/* Card 3: ROI Total do Projeto */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              ROI do Projeto (Retorno)
            </span>
            <div className="text-2xl font-black text-zinc-900 mt-2">
              {metrics.totalROI.toFixed(1)}%
            </div>
            <span className="text-xs text-zinc-500 mt-1 block">
              Sobre o capital total em {input.holdingPeriodMonths} meses
            </span>
          </div>

          {/* Card 4: Preço Estimado de Revenda */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Preço Estimado de Saída
            </span>
            <div className="text-2xl font-black text-zinc-900 mt-2">
              {formatCurrency(input.estimatedResalePrice)}
            </div>
            <span className="text-xs text-zinc-500 mt-1 block">
              Prazo de execução: {input.holdingPeriodMonths} meses
            </span>
          </div>
        </div>
      )}

      {/* FORM INPUTS */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center justify-between">
          <span>Parâmetros Financeiros do Investimento</span>
          <span className="text-xs font-normal text-zinc-400">Ajuste os valores para recalcular</span>
        </h3>

        {/* Parâmetros Gerais de Aquisição */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Valor de Compra do Imóvel (R$)
            </label>
            <input
              type="number"
              step="5000"
              value={input.propertyPurchasePrice}
              onChange={(e) => setInput({ ...input, propertyPurchasePrice: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Custos de Aquisição (ITBI + Cartório %)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                value={input.acquisitionClosingCostsPercent}
                onChange={(e) => setInput({ ...input, acquisitionClosingCostsPercent: Number(e.target.value) })}
                className="w-20 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 outline-none"
              />
              <span className="text-xs text-zinc-500 font-medium">
                ({formatCurrency(metrics.acquisitionCosts)})
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Reforma / Melhorias (R$)
            </label>
            <input
              type="number"
              step="1000"
              value={input.renovationCost}
              onChange={(e) => setInput({ ...input, renovationCost: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Mobília / Decoração (R$)
            </label>
            <input
              type="number"
              step="1000"
              value={input.furnitureCost}
              onChange={(e) => setInput({ ...input, furnitureCost: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 outline-none"
            />
          </div>
        </div>

        {/* Inputs Específicos por Estratégia */}
        {strategy === 'RENTAL' ? (
          <div className="pt-4 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                Aluguel Mensal Bruto Estimado (R$)
              </label>
              <input
                type="number"
                step="50"
                value={input.estimatedMonthlyRent}
                onChange={(e) => setInput({ ...input, estimatedMonthlyRent: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                Taxa de Vacância Estimada (%)
              </label>
              <input
                type="number"
                step="1"
                value={input.vacancyRatePercent}
                onChange={(e) => setInput({ ...input, vacancyRatePercent: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                Taxa de Adm Imobiliária (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={input.propertyManagementFeePercent}
                onChange={(e) => setInput({ ...input, propertyManagementFeePercent: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                Valorização Imobiliária Anual (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={input.annualAppreciationRate}
                onChange={(e) => setInput({ ...input, annualAppreciationRate: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                Preço de Revenda Estimado (R$)
              </label>
              <input
                type="number"
                step="5000"
                value={input.estimatedResalePrice}
                onChange={(e) => setInput({ ...input, estimatedResalePrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                Prazo Total do Flip (Meses)
              </label>
              <input
                type="number"
                min="1"
                max="48"
                value={input.holdingPeriodMonths}
                onChange={(e) => setInput({ ...input, holdingPeriodMonths: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                Comissão de Venda Corretor (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={input.brokerSellingFeePercent}
                onChange={(e) => setInput({ ...input, brokerSellingFeePercent: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                Custo Fixo Mensal no Flip (Condomínio/IPTU)
              </label>
              <input
                type="number"
                step="50"
                value={input.holdingMonthlyCosts}
                onChange={(e) => setInput({ ...input, holdingMonthlyCosts: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* BENCHMARK COMPARISON */}
      <div className="p-5 rounded-2xl bg-zinc-900 text-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Comparativo com Mercado Financeiro (CDI e Tesouro Selic)
          </span>
          <p className="text-xs text-zinc-300">
            O CDI Líquido hoje rende cerca de <strong>10,50% a.a.</strong> após desconto do Imposto de Renda (15%).
            {strategy === 'RENTAL' ? (
              <>
                {' '}O retorno imobiliário total da Torresul é de{' '}
                <strong className="text-white font-bold">{metrics.totalAnnualReturnPercent.toFixed(2)}% a.a.</strong>{' '}
                com a proteção patrimonial de um ativo real físico inconfiscável.
              </>
            ) : (
              <>
                {' '}A operação de Flip da Torresul gera uma TIR Anualizada de{' '}
                <strong className="text-white font-bold">{metrics.annualizedTIR.toFixed(1)}% a.a.</strong>, superando o CDI em{' '}
                <strong className="text-emerald-400 font-bold">
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
