import React from 'react';
import { ContractDeal } from '../types';
import { TorresulProposalCalculator } from './TorresulProposalCalculator';

interface ProposalBackOfficeToolProps {
  onConvertToDeal?: (deal: ContractDeal) => void;
}

/**
 * Back Office de Propostas Comerciais - Torresul Imobiliária
 * Ferramenta oficial simplificada: Calculadora de fluxo de entradas totais,
 * juros diluídos e gerador de minuta formatada para envio e cópia direta.
 */
export const ProposalBackOfficeTool: React.FC<ProposalBackOfficeToolProps> = () => {
  return <TorresulProposalCalculator />;
};

export default ProposalBackOfficeTool;
