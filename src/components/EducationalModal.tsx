import React from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface EducationalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyExampleStrategy?: () => void;
}

export const EducationalModal: React.FC<EducationalModalProps> = ({
  isOpen,
  onClose,
  onApplyExampleStrategy,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-zinc-200 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-6 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Guia Oficial Torresul
              </span>
            </div>
            <h2 className="text-lg font-black text-white mt-1">
              Como Funciona a Amortização Acelerada da Caixa?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 text-xs text-zinc-700 leading-relaxed max-h-[75vh] overflow-y-auto">
          {/* Seção 1: O Segredo do Saldo Devedor */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-red-600" />
              1. Por que pagar a parcela normal não resolve o financiamento rápido?
            </h3>
            <p>
              Em um contrato de 30 anos (360 meses), nos primeiros anos{' '}
              <strong>mais de 60% a 70% da sua parcela é apenas juro bancário e seguros</strong>. Ou seja, você paga R$ 1.500,00 por mês, mas a sua dívida real diminui apenas R$ 450,00 a R$ 500,00.
            </p>
          </div>

          {/* Seção 2: Como a Amortização Quebra Esse Ciclo */}
          <div className="space-y-2 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              2. O que acontece quando você faz uma amortização extraordinária?
            </h3>
            <p>
              Pela lei e pelas regras da Caixa Econômica Federal,{' '}
              <strong>100% de qualquer valor amortizado é abatido diretamente do saldo devedor principal</strong>.
            </p>
            <p className="text-zinc-600">
              Não incide nenhum juro futuro sobre o valor aportado. Ao escolher a opção{' '}
              <strong>"Reduzir Prazo"</strong>, você cancela as parcelas lá do final do contrato, eliminando dezenas ou centenas de meses de juros compostos que você teria que pagar ao banco.
            </p>
          </div>

          {/* Seção 3: Exemplo Prático com Números Reais */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-900">
              3. Exemplo Prático em um Financiamento de R$ 200.000 (Caixa MCMV):
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-800">
              <div className="p-3 rounded-lg border border-zinc-200 bg-white">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Pagando apenas a prestação normal
                </span>
                <div className="text-sm font-bold text-zinc-900 mt-1">360 meses (30 anos)</div>
                <span className="text-[11px] text-zinc-500 block mt-0.5">
                  Você paga o imóvel + mais de R$ 180.000,00 só de juros.
                </span>
              </div>

              <div className="p-3 rounded-lg border-2 border-zinc-900 bg-zinc-50">
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
                  Aportando R$ 200 a R$ 300 extras ao mês
                </span>
                <div className="text-sm font-bold text-zinc-900 mt-1">~12 a 15 anos para quitar</div>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                  Economia de mais de R$ 80.000,00 em juros bancários.
                </span>
              </div>
            </div>
          </div>

          {/* Seção 4: Como Fazer no Aplicativo Habitação Caixa */}
          <div className="space-y-2 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Passo a Passo Oficial no App Habitação Caixa:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-xs text-amber-900/90 pl-1">
              <li>Abra o aplicativo <strong>Habitação Caixa</strong> no seu celular</li>
              <li>Acesse o menu <strong>"Serviços" → "Amortizar"</strong></li>
              <li>Digite o valor que deseja abater (ex: R$ 500, R$ 2.000 ou FGTS)</li>
              <li>
                Selecione impreterivelmente a opção <strong>"REDUZIR PRAZO"</strong>
              </li>
              <li>Gere o boleto ou pague via Pix. O cancelamento das parcelas é imediato!</li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition"
          >
            Fechar Guia
          </button>

          {onApplyExampleStrategy && (
            <button
              type="button"
              onClick={() => {
                onApplyExampleStrategy();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <span>Aplicar Estratégia de Exemplo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
