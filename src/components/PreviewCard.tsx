import React, { useState, useEffect } from 'react';
import { ProposalData } from '../types';
import { generateContractText } from '../utils/templateGenerator';
import {
  Copy,
  Check,
  FileText,
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

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full sticky top-4">
      {/* Header bar */}
      <div className="px-5 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-wide text-white">
                Proposta finalizada p/envio
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Formato padronizado para elaboração de contrato
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              isEditing
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
            title="Editar texto manualmente antes de copiar"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Modo Visual' : 'Ajustar Texto'}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm cursor-pointer ${
              copied
                ? 'bg-slate-700 text-white'
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

      {/* Text display / editor */}
      <div className="p-4 flex-1 bg-slate-950 font-mono text-xs text-slate-100 overflow-y-auto max-h-[580px] select-text">
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
    </div>
  );
};
