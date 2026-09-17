import React, { useState } from 'react';
import {
  HelpCircle,
  Share2,
  Check,
  Building,
  KeyRound,
  ShieldCheck,
  TrendingDown,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { RentVsBuyInput } from '../types';
import { calculateRentVsBuy } from '../utils/rentVsBuyCalculations';
import { formatCurrency } from '../utils/formatters';

interface RentVsBuyCalculatorProps {
  defaultPropertyPrice?: number;
  defaultDownPayment?: number;
}

export const RentVsBuyCalculator: React.FC<RentVsBuyCalculatorProps> = ({
  defaultPropertyPrice = 220000,
  defaultDownPayment = 44000,
}) => {
  const [input, setInput] = useState<RentVsBuyInput>({
    monthlyRent: 1500,
    rentAnnualInflation: 5.0, // reajuste médio IGP-M/IPCA histórico
    condoAndTaxesRent: 350,
    propertyPrice: defaultPropertyPrice,
    downPayment: defaultDownPayment,
    loanTermYears: 30,
    annualInterestRate: 7.66, // Faixa 3 MCMV
    propertyAnnualAppreciation: 7.0, // Média imobiliária Blumenau/SC
    timeHorizonYears: 10,
  });

  const [activeTab, setActiveTab] = useState<'cards' | 'timeline'>('cards');
  const [copied, setCopied] = useState(false);

  const result = calculateRentVsBuy(input);
  const years = input.timeHorizonYears;

  // Patrimônio líquido gerado a mais na compra
  const equityDifference = result.finalBuyerEquity - 0;

  const handleShareWhatsApp = () => {
    const text = `🏡 *Comparativo Alugar vs. Comprar - Torresul Imobiliária*
👤 Projeção para ${years} anos

❌ *CENÁRIO ALUGUEL:*
• Aluguel Inicial: ${formatCurrency(input.monthlyRent)}/mês
• Total gasto acumulado em aluguel: *${formatCurrency(result.totalRentSpent)}*
• Patrimônio gerado: *R$ 0,00* (100% entregue ao proprietário)

✅ *CENÁRIO COMPRA TORRESUL:*
• Imóvel: ${formatCurrency(input.propertyPrice)} (Entrada: ${formatCurrency(input.downPayment)})
• Valor estimado do imóvel em ${years} anos: *${formatCurrency(result.finalPropertyValue)}*
• Saldo devedor restante: *${formatCurrency(result.finalLoanBalance)}*
• *SEU PATRIMÔNIO LÍQUIDO:* *${formatCurrency(result.finalBuyerEquity)}*

🚀 *VANTAGEM PATRIMONIAL DA COMPRA:*
Ao comprar com a Torresul, você constrói um patrimônio de *${formatCurrency(result.finalBuyerEquity)}* em vez de pagar *${formatCurrency(result.totalRentSpent)}* em aluguel sem retorno!

📲 Simulação por *Torresul Imobiliária • createdbycristianlimas*`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Hero Comparativo Principal */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                Comparador Decisivo
              </span>
              <span className="text-xs text-zinc-400 font-medium">Torresul Imobiliária</span>
            </div>
            <h2 className="text-xl font-black text-zinc-900 mt-1">
              Alugar vs. Comprar: Onde Está o Seu Dinheiro em {years} Anos?
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Descubra quanto você deixa na mão do locador versus o patrimônio que constrói com a Torresul.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copiado para WhatsApp!' : 'Enviar Comparativo WhatsApp'}</span>
            </button>
          </div>
        </div>

        {/* Big Numbers Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
          {/* Card Aluguel (Vermelho / Alerta) */}
          <div className="p-6 bg-red-50/40">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-red-700">
                <Building className="w-4 h-4 text-red-600" />
                Cenário 1: Continuar no Aluguel
              </span>
              <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                Sem Retorno
              </span>
            </div>

            <div className="mt-4">
              <span className="text-xs text-zinc-500 font-medium">Total desembolsado em {years} anos:</span>
              <div className="text-3xl font-black text-red-600 mt-0.5">
                {formatCurrency(result.totalRentSpent)}
              </div>
              <p className="text-xs text-red-700 mt-1">
                Dinheiro 100% repassado ao proprietário sem gerar 1 centavo de patrimônio.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-red-200/70 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Aluguel inicial:</span>
                <span className="font-bold text-zinc-900">{formatCurrency(input.monthlyRent)}/mês</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Reajuste médio considerado:</span>
                <span className="font-bold text-zinc-900">{input.rentAnnualInflation}% ao ano</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Aluguel no {years}º ano:</span>
                <span className="font-bold text-red-700">
                  {formatCurrency(result.yearlyBreakdown[result.yearlyBreakdown.length - 1]?.monthlyRent || 0)}/mês
                </span>
              </div>
              <div className="flex justify-between font-bold text-red-700 pt-1 border-t border-red-200">
                <span>Patrimônio Líquido Acumulado:</span>
                <span>R$ 0,00</span>
              </div>
            </div>
          </div>

          {/* Card Compra Torresul (Verde / Conquista) */}
          <div className="p-6 bg-emerald-50/40">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-800">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                Cenário 2: Comprar com a Torresul
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Patrimônio Real
              </span>
            </div>

            <div className="mt-4">
              <span className="text-xs text-zinc-500 font-medium">Seu Patrimônio Líquido em {years} anos:</span>
              <div className="text-3xl font-black text-emerald-700 mt-0.5">
                {formatCurrency(result.finalBuyerEquity)}
              </div>
              <p className="text-xs text-emerald-800 mt-1">
                Valorização do imóvel somada ao saldo já quitado da dívida imobiliária.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-200/70 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Valor projetado do imóvel ({input.propertyAnnualAppreciation}% a.a.):</span>
                <span className="font-bold text-emerald-800">{formatCurrency(result.finalPropertyValue)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Saldo devedor restante do banco:</span>
                <span className="font-bold text-zinc-700">{formatCurrency(result.finalLoanBalance)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Entrada investida hoje:</span>
                <span className="font-bold text-zinc-900">{formatCurrency(input.downPayment)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-800 pt-1 border-t border-emerald-200">
                <span>Vantagem Patrimonial vs. Aluguel:</span>
                <span>+{formatCurrency(result.finalBuyerEquity)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conclusão em Destaque */}
        <div className="p-4 bg-zinc-900 text-white flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-xs leading-relaxed">
            <strong>Veredito Financeiro:</strong> Ao alugar, você joga fora{' '}
            <span className="text-red-400 font-bold">{formatCurrency(result.totalRentSpent)}</span>. Ao comprar na Torresul, você conquista{' '}
            <span className="text-emerald-400 font-bold">{formatCurrency(result.finalBuyerEquity)}</span> de patrimônio líquido em {years} anos.
          </p>
        </div>
      </div>

      {/* Parâmetros e Sliders Interativos */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center justify-between">
          <span>Personalize as Variáveis da Comparação</span>
          <span className="text-xs font-normal text-zinc-500">Ajuste conforme sua realidade</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna 1: Dados do Aluguel Atual */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
              1. Seu Aluguel Atual
            </h4>

            <div>
              <label className="block text-xs text-zinc-600 font-medium mb-1">
                Valor Mensal do Aluguel (R$)
              </label>
              <input
                type="number"
                step="50"
                value={input.monthlyRent}
                onChange={(e) => setInput({ ...input, monthlyRent: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-600 font-medium mb-1 flex justify-between">
                <span>Reajuste Anual do Aluguel</span>
                <span className="font-bold text-zinc-900">{input.rentAnnualInflation}% a.a.</span>
              </label>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={input.rentAnnualInflation}
                onChange={(e) => setInput({ ...input, rentAnnualInflation: Number(e.target.value) })}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
              />
              <span className="text-[10px] text-zinc-400">IPCA / IGP-M histórico</span>
            </div>
          </div>

          {/* Coluna 2: Dados do Imóvel Torresul */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
              2. Imóvel Pretendido
            </h4>

            <div>
              <label className="block text-xs text-zinc-600 font-medium mb-1">
                Valor de Compra do Imóvel (R$)
              </label>
              <input
                type="number"
                step="5000"
                value={input.propertyPrice}
                onChange={(e) => setInput({ ...input, propertyPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-600 font-medium mb-1">
                Entrada / FGTS Disponível (R$)
              </label>
              <input
                type="number"
                step="2000"
                value={input.downPayment}
                onChange={(e) => setInput({ ...input, downPayment: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>
          </div>

          {/* Coluna 3: Horizonte e Mercado */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
              3. Horizonte e Valorização
            </h4>

            <div>
              <label className="block text-xs text-zinc-600 font-medium mb-1 flex justify-between">
                <span>Período da Simulação</span>
                <span className="font-bold text-red-600">{input.timeHorizonYears} anos</span>
              </label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setInput({ ...input, timeHorizonYears: y })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                      input.timeHorizonYears === y
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {y} anos
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-600 font-medium mb-1 flex justify-between">
                <span>Valorização Imobiliária Média</span>
                <span className="font-bold text-zinc-900">{input.propertyAnnualAppreciation}% a.a.</span>
              </label>
              <input
                type="range"
                min="3"
                max="14"
                step="0.5"
                value={input.propertyAnnualAppreciation}
                onChange={(e) => setInput({ ...input, propertyAnnualAppreciation: Number(e.target.value) })}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
              />
              <span className="text-[10px] text-zinc-400">Média em SC: 7% a 10% a.a.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Evolução Ano a Ano */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center justify-between">
          <span>Evolução Patrimonial Ano a Ano ({years} anos)</span>
          <span className="text-xs text-zinc-400 font-normal">Valores projetados em reais</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold">
              <tr>
                <th className="py-2.5 px-3">Ano</th>
                <th className="py-2.5 px-3">Aluguel Mensal</th>
                <th className="py-2.5 px-3">Gasto Acumulado Aluguel</th>
                <th className="py-2.5 px-3">Valor Estimado Imóvel</th>
                <th className="py-2.5 px-3">Saldo Devedor Caixa</th>
                <th className="py-2.5 px-3 text-emerald-700">Seu Patrimônio Líquido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-800">
              {result.yearlyBreakdown.map((row) => (
                <tr key={row.year} className="hover:bg-zinc-50 transition">
                  <td className="py-2 px-3 font-bold">{row.year}º ano</td>
                  <td className="py-2 px-3">{formatCurrency(row.monthlyRent)}</td>
                  <td className="py-2 px-3 text-red-600 font-medium">
                    {formatCurrency(row.rentCumulativeSpent)}
                  </td>
                  <td className="py-2 px-3 font-semibold text-zinc-900">
                    {formatCurrency(row.propertyMarketValue)}
                  </td>
                  <td className="py-2 px-3 text-zinc-500">
                    {formatCurrency(row.remainingLoanBalance)}
                  </td>
                  <td className="py-2 px-3 font-bold text-emerald-700">
                    {formatCurrency(row.buyerNetEquity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
