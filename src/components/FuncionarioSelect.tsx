import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Funcionario } from "@/types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FuncionarioSelectProps {
  value: string;
  onSelect: (funcionario: Funcionario | undefined) => void;
  showDetails?: boolean;
}

export function FuncionarioSelect({ value, onSelect, showDetails = true }: FuncionarioSelectProps) {
  const [funcionarios] = useLocalStorage<Funcionario[]>("funcionarios", []);

  const handleChange = (id: string) => {
    const funcionario = funcionarios.find(f => f.id === id);
    onSelect(funcionario);
  };

  const selectedFuncionario = funcionarios.find(f => f.id === value);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Funcionário</Label>
        <Select value={value} onValueChange={handleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um funcionário" />
          </SelectTrigger>
          <SelectContent>
            {funcionarios.length === 0 ? (
              <SelectItem value="none" disabled>
                Nenhum funcionário cadastrado
              </SelectItem>
            ) : (
              funcionarios.map((funcionario) => (
                <SelectItem key={funcionario.id} value={funcionario.id}>
                  {funcionario.nome} - {funcionario.chapa}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {showDetails && selectedFuncionario && (
        <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg text-sm">
          <div>
            <span className="text-muted-foreground">Nome:</span>
            <p className="font-medium">{selectedFuncionario.nome}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Chapa:</span>
            <p className="font-medium">{selectedFuncionario.chapa}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Carro:</span>
            <p className="font-medium">{selectedFuncionario.carro}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Placa:</span>
            <p className="font-medium">{selectedFuncionario.placa}</p>
          </div>
        </div>
      )}
    </div>
  );
}
