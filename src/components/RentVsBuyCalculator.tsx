import React, { useState } from 'react';
import {
  Building2,
  Home,
  TrendingUp,
  Share2,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import { RentVsBuyInput } from '../types';
import { calculateRentVsBuy } from '../utils/rentVsBuyCalculations';
import { formatCurrency } from '../utils/formatters';

interface RentVsBuyCalculatorProps {
  defaultPropertyPrice?: number;
  defaultDownPayment?: number;
}

export const RentVsBuyCalculator: React.FC<RentVsBuyCalculatorProps> = ({
  defaultPropertyPrice = 350000,
  defaultDownPayment = 70000,
}) => {
  const [monthlyRent, setMonthlyRent] = useState<number>(1800);
  const [propertyPrice, setPropertyPrice] = useState<number>(defaultPropertyPrice);
  const [downPayment, setDownPayment] = useState<number>(defaultDownPayment);
  const [timeHorizonYears, setTimeHorizonYears] = useState<number>(5);
  const [rentAnnualInflation, setRentAnnualInflation] = useState<number>(6.0); // 6% taxa de reajuste do aluguel
  const [propertyAnnualAppreciation, setPropertyAnnualAppreciation] = useState<number>(6.0); // 6% valorização média do imóvel
  const [showYearlyDetails, setShowYearlyDetails] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const input: RentVsBuyInput = {
    monthlyRent,
    rentAnnualInflation,
    condoAndTaxesRent: 0,
    propertyPrice,
    downPayment,
    loanTermYears: 30,
    annualInterestRate: 7.66, // Padrão MCMV Faixa 3
    propertyAnnualAppreciation,
    timeHorizonYears,
  };

  const result = calculateRentVsBuy(input);
  const years = timeHorizonYears;

  const handleShareWhatsApp = () => {
    const text = `🏡 *Comparativo Rápido: Alugar vs. Comprar (Torresul Imobiliária)*
📅 *Projeção de ${years} anos*
📈 *Parâmetros:* Reajuste Aluguel: ${rentAnnualInflation}% a.a. | Valorização Imóvel: ${propertyAnnualAppreciation}% a.a.

❌ *NO ALUGUEL:*
• Aluguel inicial: ${formatCurrency(monthlyRent)}/mês
• Total gasto jogado fora: *${formatCurrency(result.totalRentSpent)}*
• Patrimônio gerado: *R$ 0,00*

✅ *COMPRANDO COM A TORRESUL:*
• Valor do imóvel: ${formatCurrency(propertyPrice)}
• Valor estimado em ${years} anos: *${formatCurrency(result.finalPropertyValue)}*
• Saldo devedor restante: ${formatCurrency(result.finalLoanBalance)}
• *SEU PATRIMÔNIO LÍQUIDO:* *${formatCurrency(result.finalBuyerEquity)}*

🎯 *Diferença Patrimonial:* Você conquista *+${formatCurrency(result.finalBuyerEquity)}* de patrimônio próprio em vez de perder *${formatCurrency(result.totalRentSpent)}* no aluguel!

Torresul Imobiliária • Simulação Comercial`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Card Principal */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                <Building2 className="w-3 h-3 text-red-600" />
                Alugar vs. Comprar
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 font-medium">Comparativo patrimonial para o cliente</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1 font-heading">
              Evolução patrimonial projetada em {years} anos
            </h2>
          </div>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-300" />
                <span>Enviar no WhatsApp</span>
              </>
            )}
          </button>
        </div>

        {/* Barra de Variáveis Rápidas (Inputs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 bg-slate-50/80 p-3.5 rounded-lg border border-slate-200">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Aluguel mensal
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">R$</span>
              <input
                type="number"
                step="50"
                value={monthlyRent || ''}
                onChange={(e) => setMonthlyRent(Math.max(0, Number(e.target.value)))}
                className="w-full pl-7 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-600 tabular-nums"
                placeholder="1.800"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Valor do imóvel
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">R$</span>
              <input
                type="number"
                step="5000"
                value={propertyPrice || ''}
                onChange={(e) => setPropertyPrice(Math.max(0, Number(e.target.value)))}
                className="w-full pl-7 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-600 tabular-nums"
                placeholder="350.000"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Entrada / FGTS
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">R$</span>
              <input
                type="number"
                step="2000"
                value={downPayment || ''}
                onChange={(e) => setDownPayment(Math.max(0, Number(e.target.value)))}
                className="w-full pl-7 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-600 tabular-nums"
                placeholder="70.000"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Reajuste aluguel (% a.a.)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                value={rentAnnualInflation}
                onChange={(e) => setRentAnnualInflation(Number(e.target.value))}
                className="w-full pl-2.5 pr-6 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-600 tabular-nums"
                placeholder="6.0"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">%</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Valorização (% a.a.)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                value={propertyAnnualAppreciation}
                onChange={(e) => setPropertyAnnualAppreciation(Number(e.target.value))}
                className="w-full pl-2.5 pr-6 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-600 tabular-nums"
                placeholder="6.0"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">%</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Período de análise
            </label>
            <div className="grid grid-cols-4 gap-1">
              {[3, 5, 10, 15].map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setTimeHorizonYears(y)}
                  className={`py-1.5 text-xs font-medium rounded-md transition cursor-pointer text-center ${
                    timeHorizonYears === y
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {y}a
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comparativo Lado a Lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Aluguel */}
          <div className="p-4 sm:p-5 rounded-lg border border-red-200/80 bg-red-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-800 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-red-600" />
                Continuando no aluguel
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                Desembolso sem retorno
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Total desembolsado em {years} anos:
              </span>
              <div className="text-2xl sm:text-3xl font-black text-red-600 mt-0.5 tabular-nums">
                {formatCurrency(result.totalRentSpent)}
              </div>
            </div>

            <div className="pt-3 border-t border-red-200/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Aluguel estimado no {years}º ano:</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  {formatCurrency(result.yearlyBreakdown[result.yearlyBreakdown.length - 1]?.monthlyRent || 0)}/mês
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Patrimônio acumulado:</span>
                <span className="font-bold text-red-700">R$ 0,00</span>
              </div>
            </div>
          </div>

          {/* Card 2: Compra Torresul */}
          <div className="p-4 sm:p-5 rounded-lg border border-emerald-200/80 bg-emerald-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-emerald-600" />
                Comprando com a Torresul
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                Patrimônio próprio
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Seu patrimônio líquido em {years} anos:
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-0.5 tabular-nums">
                {formatCurrency(result.finalBuyerEquity)}
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-200/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Valor estimado do imóvel:</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  {formatCurrency(result.finalPropertyValue)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Saldo devedor restante:</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  {formatCurrency(result.finalLoanBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Veredito Síntese */}
        <div className="p-3.5 rounded-lg bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Em <strong>{years} anos</strong>, a compra gera{' '}
              <strong className="text-emerald-400 tabular-nums">+{formatCurrency(result.finalBuyerEquity)}</strong> em patrimônio
              líquido contra <span className="text-red-300 tabular-nums">{formatCurrency(result.totalRentSpent)}</span> despendidos em aluguel.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowYearlyDetails(!showYearlyDetails)}
            className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 font-medium cursor-pointer shrink-0 ml-auto sm:ml-0"
          >
            <span>{showYearlyDetails ? 'Ocultar tabela' : 'Ver ano a ano'}</span>
            {showYearlyDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Tabela de Evolução */}
        {showYearlyDetails && (
          <div className="pt-2 animate-in fade-in duration-200 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2 px-3">Ano</th>
                  <th className="py-2 px-3">Aluguel mensal</th>
                  <th className="py-2 px-3 text-red-600">Desembolso aluguel</th>
                  <th className="py-2 px-3">Valor imóvel</th>
                  <th className="py-2 px-3">Saldo devedor</th>
                  <th className="py-2 px-3 text-emerald-700 font-bold">Patrimônio líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {result.yearlyBreakdown.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50/80 transition">
                    <td className="py-1.5 px-3 font-medium">{row.year}º ano</td>
                    <td className="py-1.5 px-3 tabular-nums">{formatCurrency(row.monthlyRent)}</td>
                    <td className="py-1.5 px-3 text-red-600 font-medium tabular-nums">{formatCurrency(row.rentCumulativeSpent)}</td>
                    <td className="py-1.5 px-3 tabular-nums">{formatCurrency(row.propertyMarketValue)}</td>
                    <td className="py-1.5 px-3 text-slate-500 tabular-nums">{formatCurrency(row.remainingLoanBalance)}</td>
                    <td className="py-1.5 px-3 font-bold text-emerald-700 tabular-nums">{formatCurrency(row.buyerNetEquity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentVsBuyCalculator;
