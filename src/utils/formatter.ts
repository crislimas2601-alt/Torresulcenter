/**
 * Safe currency format for Brazilian Real (R$ 1.250,00)
 */
export function formatBRL(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

/**
 * Format raw number with thousand separators and 2 decimal places (1.250,00)
 */
export function formatNumberBRL(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) {
    return '0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

/**
 * Parses Brazilian formatted currency string or raw number string to number
 */
export function parseBRL(str: string): number {
  if (!str) return 0;
  // Remove currency symbol, whitespace, dots (thousands) and replace comma with dot
  const clean = str
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

/**
 * Safely rounds to 2 decimal places
 */
export function round2(val: number): number {
  if (isNaN(val) || val === null || val === undefined) return 0;
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Formats YYYY-MM-DD to DD/MM/YYYY
 */
export function formatDateBR(dateStr?: string): string {
  if (!dateStr) return '-';
  const clean = dateStr.slice(0, 10);
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Ensures YYYY-MM-DD format for HTML date inputs
 */
export function toInputDateFormat(dateStr?: string): string {
  if (!dateStr) return '';
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0];
  }
  return dateStr;
}
