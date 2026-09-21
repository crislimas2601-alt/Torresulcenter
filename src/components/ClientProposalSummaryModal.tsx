import React, { useState } from 'react';
import { ProposalData } from '../types';
import { formatClientProposalSummaryForWhatsApp } from '../utils/whatsappProposalFormatter';
import { X, Copy, Check, MessageCircle, ExternalLink } from 'lucide-react';

interface ClientProposalSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposalData;
  onUpdateProposal?: (updates: Partial<ProposalData>) => void;
}

export const ClientProposalSummaryModal: React.FC<ClientProposalSummaryModalProps> = ({
  isOpen,
  onClose,
  proposal,
}) => {
  const [clientPhone, setClientPhone] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const messageText = formatClientProposalSummaryForWhatsApp(proposal);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    let cleanPhone = clientPhone.replace(/\D/g, '');
    if (cleanPhone.length > 0 && !cleanPhone.startsWith('55')) {
      cleanPhone = `55${cleanPhone}`;
    }

    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;

    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Enviar Resumo ao Cliente</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp do cliente (opcional)
            </label>
            <input
              type="tel"
              placeholder="(47) 99999-9999"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mensagem a ser enviada
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed select-all">
              {messageText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copiar</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm shadow-emerald-900/10"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Abrir no WhatsApp</span>
            <ExternalLink className="w-3 h-3 text-emerald-200" />
          </button>
        </div>
      </div>
    </div>
  );
};
