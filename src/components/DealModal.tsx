import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Building, 
  DollarSign, 
  Percent, 
  Award,
  Wallet
} from 'lucide-react';
import { ContractDeal, Installment, PropertyType } from '../types';
import { formatCurrency, generateInstallmentDates } from '../utils/formatters';

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDeal: (deal: ContractDeal) => void;
  dealToEdit?: ContractDeal | null;
}

export const DealModal: React.FC<DealModalProps> = ({
  isOpen,
  onClose,
  onSaveDeal,
  dealToEdit,
}) => {
  if (!isOpen) return null;

  // Basic Form State
  const [propertyTitle, setPropertyTitle] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartamento');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [developerOrAgency, setDeveloperOrAgency] = useState('');
  const [contractDate, setContractDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  // Financial values (stored as string | number so typing decimals/commas never locks or blocks)
  const [propertyValue, setPropertyValue] = useState<string | number>('');
  const [grossCommissionPercent, setGrossCommissionPercent] = useState<string | number>(5);
  const [grossCommissionValue, setGrossCommissionValue] = useState<string | number>('');
  const [brokerSplitPercent, setBrokerSplitPercent] = useState<string | number>(50);
  const [brokerNetCommission, setBrokerNetCommission] = useState<string | number>('');
  const [bonusAmount, setBonusAmount] = useState<string | number>('');
  const [bonusDescription, setBonusDescription] = useState('');

  // Installments plan
  const [numInstallments, setNumInstallments] = useState<number>(2);
  const [firstDueDate, setFirstDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [installments, setInstallments] = useState<Installment[]>([]);

  // Helper for numeric conversion
  const parseNum = (val: string | number): number => {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val || typeof val !== 'string') return 0;
    const normalized = val.replace(',', '.').trim();
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Helper to rebalance existing or new installments when values change
  const syncInstallmentAmounts = (
    currentList: Installment[],
    targetNetCommission: number,
    targetBonus: number,
    bonusDesc: string,
    dueDate: string,
    defaultCount: number
  ): Installment[] => {
    const nonBonus = currentList.filter((i) => !i.isBonus);
    const count = nonBonus.length > 0 ? nonBonus.length : defaultCount > 0 ? defaultCount : 1;
    const dates = generateInstallmentDates(dueDate, count);
    const amountPerInstallment = count > 0 ? Math.round((targetNetCommission / count) * 100) / 100 : 0;

    const updatedList: Installment[] = [];

    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const installmentAmount = isLast
        ? Math.round((targetNetCommission - amountPerInstallment * (count - 1)) * 100) / 100
        : amountPerInstallment;

      const oldInst = nonBonus[i];
      const title =
        oldInst?.title ||
        (count === 1
          ? 'Parcela Única - Escritura/Sinal'
          : i === 0
          ? '1ª Parcela - Ato / Sinal'
          : i === 1
          ? '2ª Parcela - Financiamento'
          : `${i + 1}ª Parcela`);

      updatedList.push({
        id: oldInst?.id || `inst-${Date.now()}-${i + 1}`,
        dealId: dealToEdit?.id || 'temp',
        dealTitle: propertyTitle || 'Novo Imóvel',
        installmentNumber: i + 1,
        totalInstallments: count + (targetBonus > 0 ? 1 : 0),
        title,
        amount: Math.max(0, installmentAmount),
        dueDate: oldInst?.dueDate || dates[i] || dueDate,
        status: oldInst?.status || 'pendente',
        receivedDate: oldInst?.receivedDate,
        notes: oldInst?.notes,
      });
    }

    if (targetBonus > 0) {
      const oldBonus = currentList.find((i) => i.isBonus);
      updatedList.push({
        id: oldBonus?.id || `inst-${Date.now()}-bonus`,
        dealId: dealToEdit?.id || 'temp',
        dealTitle: propertyTitle || 'Novo Imóvel',
        installmentNumber: count + 1,
        totalInstallments: count + 1,
        title: bonusDesc ? `Bônus: ${bonusDesc}` : oldBonus?.title || 'Bônus / Premiação Construtora',
        amount: targetBonus,
        dueDate: oldBonus?.dueDate || dates[dates.length - 1] || dueDate,
        status: oldBonus?.status || 'pendente',
        receivedDate: oldBonus?.receivedDate,
        isBonus: true,
        notes: oldBonus?.notes,
      });
    }

    return updatedList;
  };

  // Bidirectional calculations with automatic real-time installment synchronization
  const handlePropertyValueChange = (val: string) => {
    setPropertyValue(val);
    const numV = parseNum(val);
    const numGrossPct = parseNum(grossCommissionPercent);
    const numSplit = parseNum(brokerSplitPercent);
    const numB = parseNum(bonusAmount);

    let calcGross = 0;
    let calcNet = 0;

    if (numV > 0 && numGrossPct > 0) {
      calcGross = Math.round(((numV * numGrossPct) / 100) * 100) / 100;
      setGrossCommissionValue(calcGross);
      if (numSplit > 0) {
        calcNet = Math.round(((calcGross * numSplit) / 100) * 100) / 100;
        setBrokerNetCommission(calcNet);
      }
    } else if (!val) {
      setGrossCommissionValue('');
      setBrokerNetCommission('');
    }

    // Automatically synchronize installment amounts
    setInstallments((prev) =>
      syncInstallmentAmounts(prev, calcNet, numB, bonusDescription, firstDueDate, numInstallments)
    );
  };

  const handleGrossPercentChange = (pctVal: string | number) => {
    setGrossCommissionPercent(pctVal);
    const numPct = parseNum(pctVal);
    const numV = parseNum(propertyValue);
    const numSplit = parseNum(brokerSplitPercent);
    const numB = parseNum(bonusAmount);

    let calcGross = 0;
    let calcNet = 0;

    if (numV > 0 && numPct >= 0) {
      calcGross = Math.round(((numV * numPct) / 100) * 100) / 100;
      setGrossCommissionValue(calcGross);
      if (numSplit > 0) {
        calcNet = Math.round(((calcGross * numSplit) / 100) * 100) / 100;
        setBrokerNetCommission(calcNet);
      }
    }

    setInstallments((prev) =>
      syncInstallmentAmounts(prev, calcNet, numB, bonusDescription, firstDueDate, numInstallments)
    );
  };

  const handleGrossValueChange = (valStr: string) => {
    setGrossCommissionValue(valStr);
    const numGross = parseNum(valStr);
    const numV = parseNum(propertyValue);
    const numSplit = parseNum(brokerSplitPercent);
    const numB = parseNum(bonusAmount);

    if (numV > 0 && numGross >= 0) {
      const calcPct = Math.round(((numGross / numV) * 100) * 1000) / 1000;
      setGrossCommissionPercent(calcPct);
    }

    let calcNet = 0;
    if (numGross >= 0 && numSplit > 0) {
      calcNet = Math.round(((numGross * numSplit) / 100) * 100) / 100;
      setBrokerNetCommission(calcNet);
    }

    setInstallments((prev) =>
      syncInstallmentAmounts(prev, calcNet, numB, bonusDescription, firstDueDate, numInstallments)
    );
  };

  const handleBrokerSplitPercentChange = (splitVal: string | number) => {
    setBrokerSplitPercent(splitVal);
    const numSplit = parseNum(splitVal);
    const numGross = parseNum(grossCommissionValue);
    const numB = parseNum(bonusAmount);

    let calcNet = 0;
    if (numGross > 0 && numSplit >= 0) {
      calcNet = Math.round(((numGross * numSplit) / 100) * 100) / 100;
      setBrokerNetCommission(calcNet);
    }

    setInstallments((prev) =>
      syncInstallmentAmounts(prev, calcNet, numB, bonusDescription, firstDueDate, numInstallments)
    );
  };

  const handleBrokerNetCommissionChange = (netValStr: string) => {
    setBrokerNetCommission(netValStr);
    const numNet = parseNum(netValStr);
    const numGross = parseNum(grossCommissionValue);
    const numV = parseNum(propertyValue);
    const numB = parseNum(bonusAmount);

    if (numGross > 0 && numNet >= 0) {
      const calcSplit = Math.round(((numNet / numGross) * 100) * 100) / 100;
      setBrokerSplitPercent(calcSplit);
    } else if (numV > 0 && numNet >= 0) {
      setGrossCommissionValue(numNet);
      setBrokerSplitPercent(100);
      const calcPct = Math.round(((numNet / numV) * 100) * 1000) / 1000;
      setGrossCommissionPercent(calcPct);
    }

    setInstallments((prev) =>
      syncInstallmentAmounts(prev, numNet, numB, bonusDescription, firstDueDate, numInstallments)
    );
  };

  const handleBonusAmountChange = (bonusValStr: string) => {
    setBonusAmount(bonusValStr);
    const numB = parseNum(bonusValStr);
    const numNet = parseNum(brokerNetCommission);

    setInstallments((prev) =>
      syncInstallmentAmounts(prev, numNet, numB, bonusDescription, firstDueDate, numInstallments)
    );
  };

  // Active calculated values for display & summary
  const numPropVal = parseNum(propertyValue);
  const numGrossPercent = parseNum(grossCommissionPercent);
  const numGrossValue = parseNum(grossCommissionValue);
  const numBrokerSplit = parseNum(brokerSplitPercent);
  const numBrokerNet = parseNum(brokerNetCommission);
  const numBonus = parseNum(bonusAmount);
  const totalBrokerReceivable = numBrokerNet + numBonus;

  // Load existing deal if editing
  useEffect(() => {
    if (dealToEdit) {
      setPropertyTitle(dealToEdit.propertyTitle);
      setPropertyType(dealToEdit.propertyType);
      setClientName(dealToEdit.clientName);
      setClientPhone(dealToEdit.clientPhone || '');
      setDeveloperOrAgency(dealToEdit.developerOrAgency || '');
      setContractDate(dealToEdit.contractDate);
      setPropertyValue(dealToEdit.propertyValue || '');
      setGrossCommissionPercent(dealToEdit.grossCommissionPercent);
      setGrossCommissionValue(dealToEdit.grossCommissionValue);
      setBrokerSplitPercent(dealToEdit.brokerSplitPercent);
      setBrokerNetCommission(dealToEdit.brokerNetCommission);
      setBonusAmount(dealToEdit.bonusAmount > 0 ? dealToEdit.bonusAmount : '');
      setBonusDescription(dealToEdit.bonusDescription || '');
      setNotes(dealToEdit.notes || '');
      setInstallments(dealToEdit.installments);
      setNumInstallments(dealToEdit.installments.filter((i) => !i.isBonus).length || 1);
      if (dealToEdit.installments.length > 0) {
        setFirstDueDate(dealToEdit.installments[0].dueDate);
      }
    } else {
      // Initialize fresh new deal
      setPropertyTitle('');
      setPropertyType('apartamento');
      setClientName('');
      setClientPhone('');
      setDeveloperOrAgency('');
      setContractDate(new Date().toISOString().slice(0, 10));
      setPropertyValue('');
      setGrossCommissionPercent(5);
      setGrossCommissionValue('');
      setBrokerSplitPercent(50);
      setBrokerNetCommission('');
      setBonusAmount('');
      setBonusDescription('');
      setNotes('');
      setNumInstallments(2);
      const today = new Date().toISOString().slice(0, 10);
      setFirstDueDate(today);
      setInstallments([]);
    }
  }, [dealToEdit, isOpen]);

  // Regenerate installments based on count and total
  const generateFreshInstallments = (
    count: number,
    netComm: number,
    bonus: number,
    bonusDesc: string,
    startDate: string
  ) => {
    const dates = generateInstallmentDates(startDate, count);
    const amountPerInstallment = count > 0 ? Math.round((netComm / count) * 100) / 100 : 0;

    const list: Installment[] = [];
    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const installmentAmount = isLast
        ? Math.round((netComm - amountPerInstallment * (count - 1)) * 100) / 100
        : amountPerInstallment;

      const title =
        count === 1
          ? 'Parcela Única - Escritura/Sinal'
          : i === 0
          ? '1ª Parcela - Ato / Sinal'
          : i === 1
          ? '2ª Parcela - Financiamento'
          : `${i + 1}ª Parcela`;

      list.push({
        id: `inst-${Date.now()}-${i + 1}`,
        dealId: dealToEdit?.id || 'temp',
        dealTitle: propertyTitle || 'Novo Imóvel',
        installmentNumber: i + 1,
        totalInstallments: count + (bonus > 0 ? 1 : 0),
        title,
        amount: Math.max(0, installmentAmount),
        dueDate: dates[i] || startDate,
        status: 'pendente',
      });
    }

    // Add bonus installment if any
    if (bonus > 0) {
      list.push({
        id: `inst-${Date.now()}-bonus`,
        dealId: dealToEdit?.id || 'temp',
        dealTitle: propertyTitle || 'Novo Imóvel',
        installmentNumber: count + 1,
        totalInstallments: count + 1,
        title: bonusDesc ? `Bônus: ${bonusDesc}` : 'Bônus / Premiação Construtora',
        amount: bonus,
        dueDate: dates[dates.length - 1] || startDate,
        status: 'pendente',
        isBonus: true,
      });
    }

    setInstallments(list);
  };

  const handleRecalculateInstallments = () => {
    generateFreshInstallments(
      numInstallments,
      numBrokerNet,
      numBonus,
      bonusDescription,
      firstDueDate
    );
  };

  // Update specific installment
  const handleUpdateInstallment = (index: number, field: keyof Installment, value: any) => {
    const updated = [...installments];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setInstallments(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyTitle.trim()) {
      alert('Por favor, informe o nome ou identificação do imóvel.');
      return;
    }
    if (!clientName.trim()) {
      alert('Por favor, informe o nome do cliente/comprador.');
      return;
    }

    const dealId = dealToEdit ? dealToEdit.id : `deal-${Date.now()}`;

    // Calculate final financial numbers directly from inputs
    const finalPropVal = parseNum(propertyValue);
    const finalGrossPercent = parseNum(grossCommissionPercent);
    let finalGrossValue = parseNum(grossCommissionValue);
    if (finalGrossValue <= 0 && finalPropVal > 0 && finalGrossPercent > 0) {
      finalGrossValue = Math.round(((finalPropVal * finalGrossPercent) / 100) * 100) / 100;
    }

    const finalBrokerSplit = parseNum(brokerSplitPercent);
    let finalBrokerNet = parseNum(brokerNetCommission);
    if (finalBrokerNet <= 0 && finalGrossValue > 0 && finalBrokerSplit > 0) {
      finalBrokerNet = Math.round(((finalGrossValue * finalBrokerSplit) / 100) * 100) / 100;
    }

    const finalBonus = parseNum(bonusAmount);
    const finalTotalReceivable = finalBrokerNet + finalBonus;

    // Ensure installments array matches the final values accurately
    let activeInstallments = syncInstallmentAmounts(
      installments,
      finalBrokerNet,
      finalBonus,
      bonusDescription,
      firstDueDate,
      numInstallments
    );

    // Adjust installments to include correct dealId and dealTitle
    const finalizedInstallments = activeInstallments.map((inst, idx) => ({
      ...inst,
      dealId,
      dealTitle: propertyTitle.trim(),
      installmentNumber: idx + 1,
      totalInstallments: activeInstallments.length,
    }));

    // Check status: if all installments are received, deal is completed
    const allReceived = finalizedInstallments.length > 0 && finalizedInstallments.every((i) => i.status === 'recebido');

    const newDeal: ContractDeal = {
      id: dealId,
      propertyTitle: propertyTitle.trim(),
      propertyType,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || undefined,
      developerOrAgency: developerOrAgency.trim() || 'Torre Sul',
      contractDate,
      propertyValue: finalPropVal,
      grossCommissionPercent: finalGrossPercent,
      grossCommissionValue: finalGrossValue,
      brokerSplitPercent: finalBrokerSplit,
      brokerNetCommission: finalBrokerNet,
      bonusAmount: finalBonus,
      bonusDescription: bonusDescription.trim() || undefined,
      totalBrokerReceivable: finalTotalReceivable,
      installments: finalizedInstallments,
      status: allReceived ? 'concluido' : 'em_andamento',
      notes: notes.trim() || undefined,
      createdAt: dealToEdit ? dealToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveDeal(newDeal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-6 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-heading">
                {dealToEdit ? 'Editar Contrato de Venda' : 'Cadastrar Nova Venda'}
              </h2>
              <p className="text-xs text-slate-400">
                Preencha os dados da venda para atualizar seu fluxo de caixa e comissões
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Section 1: Imóvel & Cliente */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
              1. Dados do Imóvel & Cliente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Imóvel / Empreendimento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Edifício Vision - Apto 904 ou Casa Condomínio"
                  value={propertyTitle}
                  onChange={(e) => setPropertyTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Imóvel
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="apartamento">Apartamento</option>
                  <option value="casa">Casa / Sobrado</option>
                  <option value="terreno">Terreno / Lote</option>
                  <option value="comercial">Comercial / Sala</option>
                  <option value="lancamento">Lançamento Planta</option>
                  <option value="rural">Chácara / Rural</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Cliente (Comprador) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo e Família"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone / WhatsApp (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Origem / Parceria / Imobiliária
                </label>
                <input
                  type="text"
                  placeholder="Ex: Torre Sul, Parceria ou Autônomo"
                  value={developerOrAgency}
                  onChange={(e) => setDeveloperOrAgency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Valores & Divisão de Comissão - Sincronização Total Bidirecional */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                2. Valores & Divisão de Comissão (Cálculo Livre em R$ ou %)
              </h3>
              <span className="text-[11px] text-slate-400">
                Altere valores em R$ ou % sem travar
              </span>
            </div>

            {/* Linha 1: Valor do Imóvel, Comissão Bruta (%) e Comissão Bruta (R$) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor do Imóvel (VGV em R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    placeholder="0,00"
                    value={propertyValue}
                    onChange={(e) => handlePropertyValueChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
                  {numPropVal > 0 ? formatCurrency(numPropVal) : 'R$ 0,00'}
                </span>
              </div>

              {/* Comissão Total Bruta (%) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Comissão Total (% Bruta)
                </label>
                <div className="flex items-center gap-1">
                  {[4, 5, 6].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleGrossPercentChange(p)}
                      className={`px-2 py-2 rounded text-xs font-bold cursor-pointer transition-colors ${
                        numGrossPercent === p
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="5"
                      value={grossCommissionPercent}
                      onChange={(e) => handleGrossPercentChange(e.target.value)}
                      className="w-full px-2 py-2 border border-slate-200 rounded text-xs font-semibold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-2 top-2 text-xs text-slate-400">%</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
                  {numGrossPercent > 0 ? `${numGrossPercent}% sobre o VGV` : '0%'}
                </span>
              </div>

              {/* Comissão Total Bruta em R$ (Editável livremente) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor Comissão Bruta (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0,00"
                    value={grossCommissionValue}
                    onChange={(e) => handleGrossValueChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
                  {numGrossValue > 0 ? formatCurrency(numGrossValue) : 'R$ 0,00'}
                </span>
              </div>
            </div>

            {/* Linha 2: Repasse do Corretor (%) e Valor Líquido a Receber em R$ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {/* Repasse % */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seu Repasse de Corretor (%)
                </label>
                <div className="flex items-center gap-1.5">
                  {[40, 50, 60, 100].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleBrokerSplitPercentChange(s)}
                      className={`px-2.5 py-2 rounded text-xs font-bold cursor-pointer transition-colors ${
                        numBrokerSplit === s
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {s === 100 ? '100%' : `${s}%`}
                    </button>
                  ))}
                  <div className="relative w-20">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="50"
                      value={brokerSplitPercent}
                      onChange={(e) => handleBrokerSplitPercentChange(e.target.value)}
                      className="w-full px-2 py-2 bg-white border border-slate-200 rounded text-xs font-semibold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-2 top-2 text-xs text-slate-400">%</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Participação sobre a comissão da imobiliária
                </span>
              </div>

              {/* Valor Líquido da Comissão (R$) - Totalmente Editável */}
              <div>
                <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center justify-between">
                  <span>Sua Comissão Líquida a Receber (R$)</span>
                  <span className="text-[10px] font-normal text-emerald-600">Editável em R$</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-emerald-600 font-bold">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0,00"
                    value={brokerNetCommission}
                    onChange={(e) => handleBrokerNetCommissionChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border-2 border-emerald-300 rounded-lg text-xs sm:text-sm font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                  {numBrokerNet > 0 ? formatCurrency(numBrokerNet) : 'R$ 0,00'}
                </span>
              </div>
            </div>

            {/* Bônus extra / Premiação da construtora */}
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-amber-900 mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  Bônus ou Premiação Extra (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-amber-600 font-bold">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0,00 (Ex: 1500.50)"
                    value={bonusAmount}
                    onChange={(e) => handleBonusAmountChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-amber-200 rounded-lg text-xs sm:text-sm font-semibold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <span className="text-[11px] text-amber-700 block mt-0.5">
                  {numBonus > 0 ? formatCurrency(numBonus) : 'Opcional (prêmio de lançamento, etc.)'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-900 mb-1">
                  Descrição do Bônus / Campanha
                </label>
                <input
                  type="text"
                  placeholder="Ex: Prêmio Meta Semestral ou Campanha Sinal"
                  value={bonusDescription}
                  onChange={(e) => setBonusDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Quick Result Highlight */}
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-red-800 font-bold block flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-red-600" />
                  Total Final que Vai para o Seu Bolso:
                </span>
                <span className="text-xs text-slate-600">
                  Comissão Líquida ({formatCurrency(numBrokerNet)}) + Bônus ({formatCurrency(numBonus)})
                </span>
              </div>
              <div className="text-xl font-black text-red-700 font-heading">
                {formatCurrency(totalBrokerReceivable)}
              </div>
            </div>
          </div>

          {/* Section 3: Cronograma de Parcelas / Fluxo de Caixa */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" />
                3. Cronograma de Recebíveis (Parcelas)
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Dividir em:</span>
                {[1, 2, 3, 4, 6].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setNumInstallments(n);
                      generateFreshInstallments(
                        n,
                        numBrokerNet,
                        numBonus,
                        bonusDescription,
                        firstDueDate
                      );
                    }}
                    className={`px-2 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                      numInstallments === n
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {n}x
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data do 1º Vencimento / Sinal
                </label>
                <input
                  type="date"
                  value={firstDueDate}
                  onChange={(e) => {
                    setFirstDueDate(e.target.value);
                    if (installments.length > 0) {
                      generateFreshInstallments(
                        numInstallments,
                        numBrokerNet,
                        numBonus,
                        bonusDescription,
                        e.target.value
                      );
                    }
                  }}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleRecalculateInstallments}
                  className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Gerar / Redistribuir Parcelas
                </button>
              </div>
            </div>

            {/* List of custom installments */}
            {installments.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {installments.map((inst, idx) => (
                  <div 
                    key={inst.id}
                    className={`p-2.5 rounded-lg border text-xs grid grid-cols-12 gap-2 items-center ${
                      inst.isBonus ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={inst.title}
                        onChange={(e) => handleUpdateInstallment(idx, 'title', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium"
                        placeholder="Descrição da parcela"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="date"
                        value={inst.dueDate}
                        onChange={(e) => handleUpdateInstallment(idx, 'dueDate', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        step="any"
                        value={inst.amount}
                        onChange={(e) => handleUpdateInstallment(idx, 'amount', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-right"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (installments.length > 1) {
                            setInstallments(installments.filter((_, i) => i !== idx));
                          }
                        }}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        title="Remover parcela"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-500">
                As parcelas serão geradas automaticamente na confirmação ou ao clicar em <strong>"Gerar / Redistribuir Parcelas"</strong>.
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações Adicionais (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Condições de repasse, banco do financiamento, contato do correspondente..."
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {dealToEdit ? 'Salvar Alterações' : 'Confirmar e Adicionar Venda'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
