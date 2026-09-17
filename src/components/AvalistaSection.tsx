import React from 'react';
import { AvalistaData } from '../types';
import { CurrencyInput } from './CurrencyInput';
import { formatBRL } from '../utils/formatter';
import {
  UserCheck,
  ShieldCheck,
  Home,
  Coins,
  AlertCircle,
  Landmark,
  Percent,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

interface AvalistaSectionProps {
  avalista: AvalistaData;
  onChangeAvalista: (avalista: AvalistaData) => void;
  promissoria: boolean;
  onChangePromissoria: (val: boolean) => void;
  ficaramMoveis: boolean;
  onChangeFicaramMoveis: (val: boolean) => void;
  descricaoMoveis?: string;
  onChangeDescricaoMoveis?: (val: string) => void;
  valorImovel: number;
  valorImovelComissao?: number;
  onChangeValorImovelComissao: (val: number) => void;
  comissaoPercent: number;
  onChangeComissaoPercent: (val: number) => void;
  comissaoValor: number;
  onChangeComissaoValor: (val: number) => void;
  comissaoManual: boolean;
  onChangeComissaoManual: (val: boolean) => void;
  tipoDivisaoComissao?: '100' | '50_50' | 'personalizado';
  onChangeTipoDivisaoComissao: (val: '100' | '50_50' | 'personalizado') => void;
  momentoPrimeiro50?: string;
  onChangeMomentoPrimeiro50: (val: string) => void;
  momentoSegundo50?: string;
  onChangeMomentoSegundo50: (val: string) => void;
  pagamentoComissao: string;
  onChangePagamentoComissao: (val: string) => void;
  bancoFinanciamento?: string;
  onChangeBancoFinanciamento?: (val: string) => void;
  correspondente?: string;
  onChangeCorrespondente?: (val: string) => void;
}

export const AvalistaSection: React.FC<AvalistaSectionProps> = ({
  avalista,
  onChangeAvalista,
  promissoria,
  onChangePromissoria,
  ficaramMoveis,
  onChangeFicaramMoveis,
  descricaoMoveis = '',
  onChangeDescricaoMoveis,
  valorImovel,
  valorImovelComissao,
  onChangeValorImovelComissao,
  comissaoPercent,
  onChangeComissaoPercent,
  comissaoValor,
  onChangeComissaoValor,
  comissaoManual,
  onChangeComissaoManual,
  tipoDivisaoComissao = '100',
  onChangeTipoDivisaoComissao,
  momentoPrimeiro50 = 'no ato da assinatura do contrato de compra e venda',
  onChangeMomentoPrimeiro50,
  momentoSegundo50 = 'na assinatura do financiamento habitacional.',
  onChangeMomentoSegundo50,
  pagamentoComissao,
  onChangePagamentoComissao,
  bancoFinanciamento = 'CEF',
  onChangeBancoFinanciamento,
  correspondente = 'FAST',
  onChangeCorrespondente,
}) => {
  const baseImovelComissao =
    valorImovelComissao !== undefined && valorImovelComissao > 0
      ? valorImovelComissao
      : valorImovel;

  const calculatedComissao = comissaoManual
    ? comissaoValor
    : (baseImovelComissao * (comissaoPercent || 0)) / 100;

  const metadeComissao = calculatedComissao / 2;

  const handleBaseImovelChange = (val: number) => {
    onChangeValorImovelComissao(val);
    if (!comissaoManual) {
      onChangeComissaoValor((val * (comissaoPercent || 0)) / 100);
    }
  };

  const handlePercentChange = (p: number) => {
    onChangeComissaoPercent(p);
    if (!comissaoManual) {
      onChangeComissaoValor((baseImovelComissao * p) / 100);
    }
  };

  const handleSelectDivisao = (mode: '100' | '50_50' | 'personalizado') => {
    onChangeTipoDivisaoComissao(mode);
    if (mode === '100') {
      onChangePagamentoComissao('100% na liberação de recursos do financiamento.');
    } else if (mode === '50_50') {
      const p1 = momentoPrimeiro50 || 'no ato da assinatura do contrato de compra e venda';
      const p2 = momentoSegundo50 || 'na assinatura do financiamento habitacional.';
      onChangePagamentoComissao(
        `50% (${formatBRL(metadeComissao)}) ${p1} e 50% (${formatBRL(metadeComissao)}) ${p2}`
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Banco & Correspondente Bancário */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">
              Agente Financeiro & Correspondente Bancário
            </h3>
            <p className="text-xs text-slate-500">
              Identificação do banco aprovador do crédito habitacional
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Banco / Instituição Financeira
            </label>
            <input
              type="text"
              value={bancoFinanciamento}
              onChange={(e) =>
                onChangeBancoFinanciamento && onChangeBancoFinanciamento(e.target.value)
              }
              placeholder="Ex: CEF, Santander, Bradesco, Itaú"
              className="w-full px-3 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Correspondente Caixa / Bancário
            </label>
            <input
              type="text"
              value={correspondente}
              onChange={(e) =>
                onChangeCorrespondente && onChangeCorrespondente(e.target.value)
              }
              placeholder="Ex: FAST"
              className="w-full px-3 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Avalista Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Avalista / Fiador
              </h3>
              <p className="text-xs text-slate-500">
                Informações para qualificação e contrato
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => onChangeAvalista({ ...avalista, temAvalista: false })}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                !avalista.temAvalista
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              NÃO
            </button>
            <button
              type="button"
              onClick={() => onChangeAvalista({ ...avalista, temAvalista: true })}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                avalista.temAvalista
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              SIM
            </button>
          </div>
        </div>

        {avalista.temAvalista && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={avalista.nome}
                  onChange={(e) =>
                    onChangeAvalista({ ...avalista, nome: e.target.value })
                  }
                  placeholder="Nome completo do avalista"
                  className="w-full px-3 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  RG
                </label>
                <input
                  type="text"
                  value={avalista.rg || ''}
                  onChange={(e) =>
                    onChangeAvalista({ ...avalista, rg: e.target.value })
                  }
                  placeholder="Número do RG"
                  className="w-full px-3 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  value={avalista.cpf || ''}
                  onChange={(e) =>
                    onChangeAvalista({ ...avalista, cpf: e.target.value })
                  }
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Estado Civil
                </label>
                <input
                  type="text"
                  value={avalista.estadoCivil || ''}
                  onChange={(e) =>
                    onChangeAvalista({ ...avalista, estadoCivil: e.target.value })
                  }
                  placeholder="Ex: Solteiro(a), Casado(a)..."
                  className="w-full px-3 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={avalista.endereco || ''}
                  onChange={(e) =>
                    onChangeAvalista({ ...avalista, endereco: e.target.value })
                  }
                  placeholder="Rua, número, bairro, cidade - UF"
                  className="w-full px-3 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={avalista.email}
                  onChange={(e) =>
                    onChangeAvalista({ ...avalista, email: e.target.value })
                  }
                  placeholder="email@exemplo.com"
                  className="w-full px-3 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  value={avalista.telefone}
                  onChange={(e) =>
                    onChangeAvalista({ ...avalista, telefone: e.target.value })
                  }
                  placeholder="(00) 00000-0000"
                  className="w-full px-3 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Profissão
                </label>
                <input
                  type="text"
                  value={avalista.profissao}
                  onChange={(e) =>
                    onChangeAvalista({ ...avalista, profissao: e.target.value })
                  }
                  placeholder="Ex: Engenheiro, Autônomo, etc."
                  className="w-full px-3 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-purple-50/60 border border-purple-100 rounded-lg text-xs text-purple-900">
              <AlertCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <span>
                <strong>Obs:</strong> Documentos a serem anexados do avalista: RG e CPF,
                Comprovante de residência, comprovante de registro civil, comprovante de renda.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Condições Contratuais (Promissória e Móveis) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Promissória */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 text-amber-700 rounded-md">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-800 text-sm">
                Nota Promissória
              </span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => onChangePromissoria(false)}
                className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer ${
                  !promissoria ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                }`}
              >
                NÃO
              </button>
              <button
                type="button"
                onClick={() => onChangePromissoria(true)}
                className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer ${
                  promissoria ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                SIM
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Exigência de emissão de nota promissória para garantia do parcelamento
          </p>
        </div>

        {/* Móveis no Imóvel Usado */}
        <div className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3 transition-all ${
          ficaramMoveis ? 'md:col-span-2 border-indigo-200 bg-indigo-50/10' : ''
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-md">
                <Home className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-800 text-sm">
                Móveis no Imóvel Usado
              </span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => onChangeFicaramMoveis(false)}
                className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer ${
                  !ficaramMoveis ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                }`}
              >
                NÃO
              </button>
              <button
                type="button"
                onClick={() => onChangeFicaramMoveis(true)}
                className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer ${
                  ficaramMoveis ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                SIM
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Ficarão móveis / planejados no imóvel na entrega das chaves
          </p>

          {ficaramMoveis && (
            <div className="pt-2 border-t border-indigo-100 space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-indigo-950">
                  Descreva o que vai ficar no imóvel:
                </label>
                <span className="text-[10px] text-indigo-600 font-medium">
                  Informação para a minuta
                </span>
              </div>
              <textarea
                rows={3}
                value={descricaoMoveis}
                onChange={(e) =>
                  onChangeDescricaoMoveis && onChangeDescricaoMoveis(e.target.value)
                }
                placeholder="Ex: Cozinha sob medida com armários e cooktop, armários embutidos dos 2 quartos, ar-condicionado da sala e móvel do banheiro com espelho..."
                className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 resize-y"
              />
              <span className="text-[11px] text-slate-500 block">
                Essa descrição será inserida automaticamente no resumo de contrato para o Back Office.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Comissão de Corretagem */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <Coins className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Comissão de Corretagem
              </h3>
              <p className="text-xs text-slate-500">
                Cálculo automático do valor e condições de pagamento (100% ou 50%/50%)
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Total da Comissão:</span>
            <span className="text-base font-bold text-slate-950">
              {formatBRL(calculatedComissao)}
            </span>
          </div>
        </div>

        {/* 1. Base do Imóvel, Percentual e Valor Calculado */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Valor do Imóvel para Comissão */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Valor Imóvel (p/ Comissão)
              </label>
              {valorImovelComissao !== undefined &&
                valorImovelComissao !== valorImovel && (
                  <button
                    type="button"
                    onClick={() => handleBaseImovelChange(valorImovel)}
                    className="text-[10px] text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                    title="Usar valor do contrato"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    Resetar
                  </button>
                )}
            </div>
            <CurrencyInput
              id="val_imovel_comissao"
              value={baseImovelComissao}
              onChange={handleBaseImovelChange}
              placeholder={formatBRL(valorImovel)}
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Base utilizada para o cálculo da %
            </span>
          </div>

          {/* Percentual de Comissão (%) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Percentual (%)
              </label>
              <div className="flex gap-1">
                {[4, 5, 6].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePercentChange(p)}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold cursor-pointer ${
                      comissaoPercent === p
                        ? 'bg-red-100 text-red-800'
                        : 'text-slate-400 hover:text-slate-600 bg-slate-50'
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={comissaoPercent}
                onChange={(e) =>
                  handlePercentChange(parseFloat(e.target.value) || 0)
                }
                className="w-full pl-3 pr-8 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                %
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Taxa de honorários
            </span>
          </div>

          {/* Valor Calculado da Comissão */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700">
                Valor Total da Comissão
              </label>
              <button
                type="button"
                onClick={() => {
                  onChangeComissaoManual(!comissaoManual);
                  if (comissaoManual) {
                    onChangeComissaoValor((baseImovelComissao * comissaoPercent) / 100);
                  }
                }}
                className="text-[10px] text-red-600 hover:underline cursor-pointer"
              >
                {comissaoManual ? 'Cálculo auto' : 'Digitar manual'}
              </button>
            </div>
            <CurrencyInput
              id="comissao_valor"
              value={calculatedComissao}
              onChange={(val) => {
                onChangeComissaoManual(true);
                onChangeComissaoValor(val);
              }}
              placeholder="0,00"
              className="font-bold text-red-800 bg-red-50/50 border-red-300"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              {formatBRL(baseImovelComissao)} × {comissaoPercent}% ={' '}
              {formatBRL(calculatedComissao)}
            </span>
          </div>
        </div>

        {/* 2. Divisão e Forma de Pagamento da Comissão */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Modalidade de Pagamento da Comissão
          </label>

          {/* Segmented Selector Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-xl">
            <button
              type="button"
              onClick={() => handleSelectDivisao('100')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                tipoDivisaoComissao === '100'
                  ? 'bg-white text-red-800 shadow-sm font-bold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  tipoDivisaoComissao === '100' ? 'text-red-600' : 'text-slate-400'
                }`}
              />
              100% na Assinatura/Recursos
            </button>

            <button
              type="button"
              onClick={() => handleSelectDivisao('50_50')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                tipoDivisaoComissao === '50_50'
                  ? 'bg-white text-red-800 shadow-sm font-bold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  tipoDivisaoComissao === '50_50' ? 'text-red-600' : 'text-slate-400'
                }`}
              />
              50% / 50% (Em 2x)
            </button>

            <button
              type="button"
              onClick={() => handleSelectDivisao('personalizado')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                tipoDivisaoComissao === 'personalizado'
                  ? 'bg-white text-red-800 shadow-sm font-bold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  tipoDivisaoComissao === 'personalizado'
                    ? 'text-red-600'
                    : 'text-slate-400'
                }`}
              />
              Personalizado / Outro
            </button>
          </div>

          {/* Conditional Detail Form according to Selected Mode */}
          {tipoDivisaoComissao === '50_50' && (
            <div className="p-4 bg-red-50/50 border border-red-200 rounded-xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-bold text-red-950">
                <span className="flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-red-600" />
                  Divisão Automática em 2 Parcelas Iguais:
                </span>
                <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-md font-bold">
                  2x de {formatBRL(metadeComissao)}
                </span>
              </div>

              {/* 1º 50% */}
              <div className="space-y-2 bg-white p-3.5 rounded-lg border border-red-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    1ª Parcela (50% = {formatBRL(metadeComissao)}): Quando será paga?
                  </label>
                  <span className="text-[10px] text-red-700 font-semibold bg-red-50 px-1.5 py-0.5 rounded">
                    50% Entrada
                  </span>
                </div>

                <input
                  type="text"
                  value={momentoPrimeiro50}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChangeMomentoPrimeiro50(val);
                    onChangePagamentoComissao(
                      `50% (${formatBRL(metadeComissao)}) ${val} e 50% (${formatBRL(
                        metadeComissao
                      )}) ${momentoSegundo50}`
                    );
                  }}
                  placeholder="no ato da assinatura do contrato de compra e venda"
                  className="w-full px-3 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />

                {/* Quick Suggestions Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 self-center">Sugestões:</span>
                  {[
                    'no ato da assinatura do contrato de compra e venda',
                    'no sinal de negócio',
                    'em 30 dias após a assinatura do contrato',
                    'na entrega de toda a documentação',
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        onChangeMomentoPrimeiro50(sug);
                        onChangePagamentoComissao(
                          `50% (${formatBRL(metadeComissao)}) ${sug} e 50% (${formatBRL(
                            metadeComissao
                          )}) ${momentoSegundo50}`
                        );
                      }}
                      className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                        momentoPrimeiro50 === sug
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2º 50% */}
              <div className="space-y-1.5 bg-white p-3.5 rounded-lg border border-red-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    2ª Parcela (50% = {formatBRL(metadeComissao)}): Condição Padrão
                  </label>
                  <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                    50% Financiamento
                  </span>
                </div>
                <input
                  type="text"
                  value={momentoSegundo50}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChangeMomentoSegundo50(val);
                    onChangePagamentoComissao(
                      `50% (${formatBRL(metadeComissao)}) ${momentoPrimeiro50} e 50% (${formatBRL(
                        metadeComissao
                      )}) ${val}`
                    );
                  }}
                  placeholder="na assinatura do financiamento habitacional / liberação de recursos."
                  className="w-full px-3 py-2 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500">
                  Definido automaticamente para ser pago na assinatura com a Caixa ou liberação dos recursos.
                </span>
              </div>
            </div>
          )}

          {tipoDivisaoComissao === '100' && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Forma de Pagamento Padrão (100%)
                </label>
                <span className="text-[10px] text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded">
                  Integral ({formatBRL(calculatedComissao)})
                </span>
              </div>
              <input
                type="text"
                value={
                  pagamentoComissao ||
                  '100% na liberação de recursos do financiamento.'
                }
                onChange={(e) => onChangePagamentoComissao(e.target.value)}
                placeholder="100% na liberação de recursos do financiamento."
                className="w-full px-3 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500">
                Padrão usual do mercado: 100% pago na liberação de recursos do financiamento habitacional.
              </span>
            </div>
          )}

          {tipoDivisaoComissao === 'personalizado' && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in duration-200">
              <label className="block text-xs font-semibold text-slate-700">
                Descrição Livre do Pagamento da Comissão
              </label>
              <textarea
                rows={2}
                value={pagamentoComissao}
                onChange={(e) => onChangePagamentoComissao(e.target.value)}
                placeholder="Ex: 30% no ato e 70% na liberação de recursos do financiamento bancário."
                className="w-full px-3 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
