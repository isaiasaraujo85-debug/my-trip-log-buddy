import { useState } from "react";
import { UserPlus, Trash2, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
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
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Funcionário
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funcionários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Chapa</TableHead>
                  <TableHead>Carro</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funcionarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum funcionário cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  funcionarios.map((funcionario) => (
                    <TableRow key={funcionario.id}>
                      {editingId === funcionario.id ? (
                        <>
                          <TableCell>
                            <Input
                              value={editNome}
                              onChange={(e) => setEditNome(e.target.value)}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editChapa}
                              onChange={(e) => setEditChapa(e.target.value)}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editCarro}
                              onChange={(e) => setEditCarro(e.target.value)}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editPlaca}
                              onChange={(e) => setEditPlaca(e.target.value.toUpperCase())}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => saveEdit(funcionario.id)}
                              >
                                <Save className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={cancelEdit}
                              >
                                <X className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">{funcionario.nome}</TableCell>
                          <TableCell>{funcionario.chapa}</TableCell>
                          <TableCell>{funcionario.carro}</TableCell>
                          <TableCell>{funcionario.placa}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEdit(funcionario)}
                              >
                                <Edit2 className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(funcionario.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
