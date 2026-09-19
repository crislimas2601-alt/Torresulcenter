import React, { useState } from 'react';
import { ProposalData } from '../types';
import { formatBRL, formatDateBR } from '../utils/formatter';
import { Bookmark, Clock, Trash2, FolderOpen, PlusCircle, X, FileText } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProposals: ProposalData[];
  onLoadProposal: (proposal: ProposalData) => void;
  onDeleteProposal: (id: string) => void;
  onSaveCurrent: (name: string, unit: string) => void;
  currentProposal: ProposalData;
  onLoadSample: () => void;
  onLoadAdimplenciaSample?: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  savedProposals,
  onLoadProposal,
  onDeleteProposal,
  onSaveCurrent,
  onLoadSample,
  onLoadAdimplenciaSample,
}) => {
  const [clientName, setClientName] = useState('');
  const [unitNumber, setUnitNumber] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;
    onSaveCurrent(clientName.trim(), unitNumber.trim());
    setClientName('');
    setUnitNumber('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Propostas & Modelos Rápidos
              </h3>
              <p className="text-xs text-slate-500">
                Carregue modelos prontos ou salve suas propostas de negociação
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Preset Templates */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-700" />
              Modelos de Proposta Predefinidos
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Preset 1: Com Adimplência e Diluídos (R$ 325.000 / R$ 356.042,40) */}
              <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <strong className="text-xs text-red-900 font-bold block">
                      Imóvel R$ 325k c/ Adimplência
                    </strong>
                    <span className="px-1.5 py-0.5 bg-red-200/80 text-red-800 text-[10px] font-bold rounded">
                      Padrão Torresul
                    </span>
                  </div>
                  <p className="text-[11px] text-red-700 mt-1">
                    Adimplência R$ 25.000, 2 séries de parcelamento com juros diluídos (R$ 1.750 + R$ 860,83), 3 reforços e financ. R$ 280k.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onLoadAdimplenciaSample) onLoadAdimplenciaSample();
                    onClose();
                  }}
                  className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors text-center shadow-xs cursor-pointer"
                >
                  Carregar este Modelo
                </button>
              </div>

              {/* Preset 2: Modelo Padrão (R$ 250.400) */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between gap-3">
                <div>
                  <strong className="text-xs text-slate-900 font-bold block">
                    Imóvel R$ 250.400 (Direto Construtora)
                  </strong>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Entrada R$ 53.600, ato R$ 903,80, 36 parcelas mensais de R$ 1.186,01 e 2 reforços de R$ 5.000.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onLoadSample();
                    onClose();
                  }}
                  className="w-full py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors text-center shadow-xs cursor-pointer"
                >
                  Carregar este Modelo
                </button>
              </div>
            </div>
          </div>

          {/* Quick Save Current */}
          <form
            onSubmit={handleSave}
            className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
          >
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-red-600" />
              Salvar Proposta Atual no Histórico
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nome do Cliente / Proponente
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Carlos Silva"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Empreendimento / Unidade (Opcional)
                </label>
                <input
                  type="text"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  placeholder="Ex: Edifício Aurora - Apt 402"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Salvar Proposta
              </button>
            </div>
          </form>

          {/* Saved List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              Propostas Salvas no Navegador ({savedProposals.length})
            </h4>

            {savedProposals.length === 0 ? (
              <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <p className="text-sm">Nenhuma proposta salva manualmente ainda.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Preencha os valores e clique em "Salvar Proposta" para criar um histórico local.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedProposals.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-slate-200 hover:border-red-300 rounded-xl flex items-center justify-between gap-3 transition-colors shadow-2xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-semibold text-slate-800 truncate">
                          {item.nomeCliente || 'Proposta sem nome'}
                        </strong>
                        {item.numeroUnidade && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-md">
                            {item.numeroUnidade}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>Imóvel: {formatBRL(item.valorImovel)}</span>
                        <span>•</span>
                        <span>
                          {item.createdAt ? formatDateBR(item.createdAt) : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadProposal(item);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg border border-red-200 transition-colors cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        Abrir
                      </button>
                      <button
                        type="button"
                        onClick={() => item.id && onDeleteProposal(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
