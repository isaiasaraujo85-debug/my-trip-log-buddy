import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  placeholder?: string;
}

function formatCentsToDecimal(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const cents = parseInt(digits, 10);
  return (cents / 100).toFixed(2).replace(".", ",");
}

function decimalToNumericString(formatted: string): string {
  return formatted.replace(",", ".");
}

export function CurrencyInput({ value, onChange, id, className, placeholder = "0,00" }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(() => {
    if (!value) return "";
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    return num.toFixed(2).replace(".", ",");
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplayValue(raw);
  };

  const handleBlur = () => {
    if (!displayValue) {
      onChange("");
      return;
    }
    // Remove everything except digits
    const formatted = formatCentsToDecimal(displayValue);
    setDisplayValue(formatted);
    onChange(decimalToNumericString(formatted));
  };

  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={cn("uppercase", className)}
    />
  );
}
