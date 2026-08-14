import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ObservacaoFieldProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
}

export function ObservacaoField({ value, onChange, id, className }: ObservacaoFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs">Observação</Label>
        <span className="text-[10px] text-muted-foreground">{value.length}/50</span>
      </div>
      <Input
        id={id}
        value={value}
        maxLength={50}
        onChange={(e) => onChange(e.target.value.slice(0, 50))}
        placeholder="Observação (máx. 50 caracteres)"
        className={className}
      />
    </div>
  );
}
