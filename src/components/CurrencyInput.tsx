import React, { useState, useEffect } from 'react';
import { formatNumberBRL, round2 } from '../utils/formatter';

interface CurrencyInputProps {
  id?: string;
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  prefix?: string;
  ariaLabel?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  value,
  onChange,
  placeholder = '0,00',
  className = '',
  disabled = false,
  prefix = 'R$',
  ariaLabel,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(
    value ? formatNumberBRL(value) : ''
  );
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value > 0 ? formatNumberBRL(value) : '');
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    
    // Extract only digits
    const digitsOnly = rawVal.replace(/\D/g, '');
    if (!digitsOnly) {
      setDisplayValue('');
      onChange(0);
      return;
    }

    // Convert digits to cents without float precision drift
    const numericValue = round2(parseInt(digitsOnly, 10) / 100);
    setDisplayValue(formatNumberBRL(numericValue));
    onChange(numericValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value > 0) {
      setDisplayValue(formatNumberBRL(value));
    } else {
      setDisplayValue('');
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <div className="relative flex items-center w-full">
      {prefix && (
        <span className="absolute left-3 text-sm font-medium text-slate-500 pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`w-full ${
          prefix ? 'pl-9' : 'pl-3'
        } pr-3 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors disabled:bg-slate-100 disabled:text-slate-400 ${className}`}
      />
    </div>
  );
};
