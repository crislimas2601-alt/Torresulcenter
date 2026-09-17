import React, { useState, useEffect } from 'react';
import { ProposalData } from '../types';
import { generateContractText } from '../utils/templateGenerator';
import {
  Copy,
  Check,
  Share2,
  Download,
  Printer,
  FileText,
  Sparkles,
  Edit3,
} from 'lucide-react';

interface PreviewCardProps {
  proposal: ProposalData;
  onSaveHistory?: () => void;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({
  proposal,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customText, setCustomText] = useState('');

  const generatedText = generateContractText(proposal);

  useEffect(() => {
    if (!isEditing) {
      setCustomText(generatedText);
    }
  }, [generatedText, isEditing]);

  const currentText = isEditing ? customText : generatedText;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(currentText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([currentText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    const fileName = proposal.nomeCliente
      ? `Proposta_${proposal.nomeCliente.replace(/\s+/g, '_')}.txt`
      : `Resumo_Contrato_Backoffice_${new Date().toISOString().slice(0, 10)}.txt`;
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Resumo de Contrato - Backoffice</title>
            <style>
              body { font-family: monospace, sans-serif; white-space: pre-wrap; padding: 24px; font-size: 14px; line-height: 1.6; color: #1e293b; }
              h2 { font-family: sans-serif; margin-bottom: 16px; font-size: 18px; }
            </style>
          </head>
          <body>
            <h2>DADOS PARA ELABORAÇÃO DE CONTRATO (BACK OFFICE)</h2>
            <hr style="margin-bottom: 20px;" />
            ${currentText}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full sticky top-4">
      {/* Header bar */}
      <div className="px-5 py-4 bg-gradient-to-r from-black via-slate-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-red-600/20 text-red-500 rounded-lg border border-red-500/30">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-wide text-white">
                Proposta finalizada p/envio
              </h3>
              <span className="text-[9px] px-1.5 py-0.5 bg-red-600 text-white rounded font-black uppercase tracking-wider shadow-xs">
                Torresul
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Formato padronizado pronto para envio e emissão de contrato
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isEditing
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
            }`}
            title="Editar texto manualmente antes de copiar"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Modo Visual' : 'Ajustar Texto'}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                : 'bg-red-600 hover:bg-red-500 text-white active:scale-95 shadow-red-950/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Texto
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action quick toolbar */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-red-600" />
          Minuta em tempo real
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="hover:text-green-700 font-medium inline-flex items-center gap-1 text-slate-700 cursor-pointer"
            title="Enviar via WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 text-green-600" />
            WhatsApp
          </button>
          <div className="h-3 w-px bg-slate-300" />
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="hover:text-slate-900 font-medium inline-flex items-center gap-1 cursor-pointer"
            title="Baixar como arquivo .txt"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Baixar .txt
          </button>
          <div className="h-3 w-px bg-slate-300" />
          <button
            type="button"
            onClick={handlePrint}
            className="hover:text-slate-900 font-medium inline-flex items-center gap-1 cursor-pointer"
            title="Imprimir proposta"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Text display / editor */}
      <div className="p-4 flex-1 bg-slate-950 font-mono text-xs text-slate-100 overflow-y-auto max-h-[580px] select-text border-b border-slate-800">
        {isEditing ? (
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={22}
            className="w-full h-full min-h-[460px] bg-transparent text-amber-200 font-mono text-xs focus:outline-none resize-none leading-relaxed selection:bg-red-600 selection:text-white"
          />
        ) : (
          <pre className="whitespace-pre-wrap leading-relaxed font-mono text-xs font-normal selection:bg-red-600 selection:text-white text-slate-100">
            {currentText}
          </pre>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <span>Pronto para colar no sistema de contratos da Torresul</span>
        {copied && (
          <span className="text-red-600 font-bold animate-pulse">
            Texto copiado para a área de transferência!
          </span>
        )}
      </div>
    </div>
  );
};
