import { TipoTransporte } from "@/types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const tipoTransporteLabels: Record<TipoTransporte, string> = {
  nenhum: "Nenhum",
  "99": "99",
  uber: "Uber",
  taxi: "Taxi",
  onibus: "Ônibus",
  outros: "Outros",
};

export const tipoTransporteOrdem: TipoTransporte[] = ["nenhum", "99", "uber", "taxi", "onibus", "outros"];

interface TransporteSelectProps {
  value: TipoTransporte;
  onChange: (value: TipoTransporte) => void;
  className?: string;
}

export function TransporteSelect({ value, onChange, className }: TransporteSelectProps) {
  return (
    <div className="space-y-2">
      <Label>Selecione o Transporte</Label>
      <Select value={value} onValueChange={(v) => onChange(v as TipoTransporte)}>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Selecione o transporte" />
        </SelectTrigger>
        <SelectContent>
          {tipoTransporteOrdem.map((t) => (
            <SelectItem key={t} value={t}>{tipoTransporteLabels[t]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
