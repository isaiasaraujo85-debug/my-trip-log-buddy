import { useState } from "react";
import { UserPlus, Trash2, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Funcionario } from "@/types";

export function CadastroTab() {
  const { toast } = useToast();
  const [funcionarios, setFuncionarios] = useLocalStorage<Funcionario[]>("funcionarios", []);
  
  const [nome, setNome] = useState("");
  const [chapa, setChapa] = useState("");
  const [carro, setCarro] = useState("");
  const [placa, setPlaca] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editChapa, setEditChapa] = useState("");
  const [editCarro, setEditCarro] = useState("");
  const [editPlaca, setEditPlaca] = useState("");

  const handleAdd = () => {
    if (!nome || !chapa || !carro || !placa) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    const newFuncionario: Funcionario = {
      id: crypto.randomUUID(),
      nome,
      chapa,
      carro,
      placa: placa.toUpperCase()
    };

    setFuncionarios([...funcionarios, newFuncionario]);
    setNome("");
    setChapa("");
    setCarro("");
    setPlaca("");
    
    toast({
      title: "Sucesso",
      description: "Funcionário cadastrado com sucesso!"
    });
  };

  const handleDelete = (id: string) => {
    setFuncionarios(funcionarios.filter(f => f.id !== id));
    toast({
      title: "Excluído",
      description: "Funcionário removido com sucesso."
    });
  };

  const startEdit = (funcionario: Funcionario) => {
    setEditingId(funcionario.id);
    setEditNome(funcionario.nome);
    setEditChapa(funcionario.chapa);
    setEditCarro(funcionario.carro);
    setEditPlaca(funcionario.placa);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNome("");
    setEditChapa("");
    setEditCarro("");
    setEditPlaca("");
  };

  const saveEdit = (id: string) => {
    if (!editNome || !editChapa || !editCarro || !editPlaca) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setFuncionarios(funcionarios.map(f => 
      f.id === id 
        ? { ...f, nome: editNome, chapa: editChapa, carro: editCarro, placa: editPlaca.toUpperCase() }
        : f
    ));
    cancelEdit();
    toast({
      title: "Sucesso",
      description: "Funcionário atualizado com sucesso!"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 whitespace-nowrap">
            <UserPlus className="h-5 w-5 flex-shrink-0" />
            Cadastro de Funcionário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Funcionário</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapa">Número da Chapa</Label>
              <Input
                id="chapa"
                value={chapa}
                onChange={(e) => setChapa(e.target.value)}
                placeholder="12345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carro">Carro</Label>
              <Input
                id="carro"
                value={carro}
                onChange={(e) => setCarro(e.target.value)}
                placeholder="Modelo do veículo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placa">Placa</Label>
              <Input
                id="placa"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                placeholder="ABC-1234"
              />
            </div>
          </div>
          <Button onClick={handleAdd} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Salvar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funcionários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {funcionarios.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhum funcionário cadastrado
            </p>
          ) : (
            <div className="space-y-3">
              {funcionarios.map((funcionario) => (
                <div key={funcionario.id} className="p-3 border rounded-lg">
                  {editingId === funcionario.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={editNome}
                          onChange={(e) => setEditNome(e.target.value)}
                          placeholder="Nome"
                          className="h-8 text-sm"
                        />
                        <Input
                          value={editChapa}
                          onChange={(e) => setEditChapa(e.target.value)}
                          placeholder="Chapa"
                          className="h-8 text-sm"
                        />
                        <Input
                          value={editCarro}
                          onChange={(e) => setEditCarro(e.target.value)}
                          placeholder="Carro"
                          className="h-8 text-sm"
                        />
                        <Input
                          value={editPlaca}
                          onChange={(e) => setEditPlaca(e.target.value.toUpperCase())}
                          placeholder="Placa"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveEdit(funcionario.id)}
                          className="flex-1"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Salvar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm flex-1 min-w-0">
                        <div>
                          <span className="text-muted-foreground text-xs">Nome:</span>
                          <p className="font-medium truncate">{funcionario.nome}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Chapa:</span>
                          <p className="font-medium">{funcionario.chapa}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Carro:</span>
                          <p className="font-medium truncate">{funcionario.carro}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Placa:</span>
                          <p className="font-medium">{funcionario.placa}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => startEdit(funcionario)}
                        >
                          <Edit2 className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(funcionario.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
