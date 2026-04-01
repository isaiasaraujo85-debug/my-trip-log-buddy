import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Funcionario } from "@/types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FuncionarioSelectProps {
  value: string;
  onSelect: (funcionario: Funcionario | undefined) => void;
}

export function FuncionarioSelect({ value, onSelect }: FuncionarioSelectProps) {
  const [funcionarios] = useLocalStorage<Funcionario[]>("funcionarios", []);

  const handleChange = (id: string) => {
    const funcionario = funcionarios.find(f => f.id === id);
    onSelect(funcionario);
  };

  return (
    <div className="space-y-2">
      <Label>Selecione o Funcionário</Label>
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o funcionário" />
        </SelectTrigger>
        <SelectContent>
          {funcionarios.length === 0 ? (
            <SelectItem value="none" disabled>
              Nenhum funcionário cadastrado
            </SelectItem>
          ) : (
            funcionarios.map((funcionario) => (
              <SelectItem key={funcionario.id} value={funcionario.id}>
                {funcionario.nome}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
