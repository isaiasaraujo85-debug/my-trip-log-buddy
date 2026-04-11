import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Veiculo } from "@/types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VeiculoSelectProps {
  value: string;
  onSelect: (veiculo: Veiculo | undefined) => void;
}

export function VeiculoSelect({ value, onSelect }: VeiculoSelectProps) {
  const [veiculos] = useLocalStorage<Veiculo[]>("veiculos", []);

  const handleChange = (id: string) => {
    if (id === "__blank__") {
      onSelect(undefined);
      return;
    }
    const veiculo = veiculos.find(v => v.id === id);
    onSelect(veiculo);
  };

  return (
    <div className="space-y-2">
      <Label>Selecione o Veículo</Label>
      <Select value={value || "__blank__"} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o veículo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__blank__">— Nenhum —</SelectItem>
          {veiculos.map((veiculo) => (
            <SelectItem key={veiculo.id} value={veiculo.id}>
              {veiculo.modelo} - {veiculo.placa}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
