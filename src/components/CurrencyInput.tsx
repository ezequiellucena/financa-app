import { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  autoFocus?: boolean;
  placeholder?: string;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function CurrencyInput({ value, onChange, className, autoFocus, placeholder, onKeyPress }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value === '') {
      setDisplayValue('');
      return;
    }
    const numeric = parseFloat(value);
    if (!isNaN(numeric)) {
      setDisplayValue(numeric.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw === '') {
      onChange('');
      setDisplayValue('');
      return;
    }
    const numeric = parseFloat(raw) / 100;
    onChange(numeric.toString());
    setDisplayValue(numeric.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      className={className}
      autoFocus={autoFocus}
      placeholder={placeholder}
      onKeyDown={onKeyPress}
    />
  );
}
