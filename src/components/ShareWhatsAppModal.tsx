import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare, Phone } from 'lucide-react';
import { SimulationResult, LoanInput, ExtraAmortizationInput } from '../types';
import { generateWhatsAppMessage } from '../utils/formatters';

interface ShareWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: LoanInput;
  extra: ExtraAmortizationInput;
  result: SimulationResult;
}

export const ShareWhatsAppModal: React.FC<ShareWhatsAppModalProps> = ({
  isOpen,
  onClose,
  loan,
  extra,
  result,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const messageText = generateWhatsAppMessage(clientName, loan, extra, result);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-zinc-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Enviar Simulação para o Cliente
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-zinc-700 font-semibold mb-1">
              Nome do Cliente (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: João da Silva"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-zinc-700 font-semibold mb-1">
              WhatsApp do Cliente com DDD (Opcional)
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="(47) 99999-9999"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5 block">
              Se deixar em branco, você pode escolher o contato diretamente no WhatsApp.
            </span>
          </div>

          {/* Message Preview */}
          <div>
            <label className="block text-zinc-700 font-semibold mb-1 flex items-center justify-between">
              <span>Prévia da Mensagem Formatada</span>
              <span className="text-[10px] text-zinc-400 font-normal">Pronta para envio</span>
            </label>
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg max-h-48 overflow-y-auto whitespace-pre-wrap font-sans text-zinc-700 text-[11px] leading-relaxed">
              {messageText}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-500" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Abrir no WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
