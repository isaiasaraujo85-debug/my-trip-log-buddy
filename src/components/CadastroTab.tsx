import { useState } from "react";
import { UserPlus, Car, Trash2, Edit2, Save, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Funcionario, Veiculo } from "@/types";

export function CadastroTab() {
  const [funcionarios, setFuncionarios] = useLocalStorage<Funcionario[]>("funcionarios", []);
  const [veiculos, setVeiculos] = useLocalStorage<Veiculo[]>("veiculos", []);

  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [funcao, setFuncao] = useState("");

  const [modelo, setModelo] = useState("");
  const [placa, setPlaca] = useState("");

  const [editFuncId, setEditFuncId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editMatricula, setEditMatricula] = useState("");
  const [editFuncao, setEditFuncao] = useState("");

  const [editVeicId, setEditVeicId] = useState<string | null>(null);
  const [editModelo, setEditModelo] = useState("");
  const [editPlaca, setEditPlaca] = useState("");

  const handleAddFuncionario = () => {
    if (!nome || !matricula || !funcao) return;
    const newFunc: Funcionario = {
      id: crypto.randomUUID(),
      nome: nome.toUpperCase(),
      matricula: matricula.toUpperCase(),
      funcao: funcao.toUpperCase(),
    };
    setFuncionarios([...funcionarios, newFunc]);
    setNome("");
    setMatricula("");
    setFuncao("");
  };

  const handleDeleteFuncionario = (id: string) => {
    setFuncionarios(funcionarios.filter(f => f.id !== id));
  };

  const startEditFunc = (f: Funcionario) => {
    setEditFuncId(f.id);
    setEditNome(f.nome);
    setEditMatricula(f.matricula);
    setEditFuncao(f.funcao);
  };

  const saveEditFunc = (id: string) => {
    if (!editNome || !editMatricula || !editFuncao) return;
    setFuncionarios(funcionarios.map(f =>
      f.id === id ? { ...f, nome: editNome.toUpperCase(), matricula: editMatricula.toUpperCase(), funcao: editFuncao.toUpperCase() } : f
    ));
    setEditFuncId(null);
  };

  const handleAddVeiculo = () => {
    if (!modelo || !placa) return;
    const newVeic: Veiculo = {
      id: crypto.randomUUID(),
      modelo: modelo.toUpperCase(),
      placa: placa.toUpperCase(),
    };
    setVeiculos([...veiculos, newVeic]);
    setModelo("");
    setPlaca("");
  };

  const handleDeleteVeiculo = (id: string) => {
    setVeiculos(veiculos.filter(v => v.id !== id));
  };

  const startEditVeic = (v: Veiculo) => {
    setEditVeicId(v.id);
    setEditModelo(v.modelo);
    setEditPlaca(v.placa);
  };

  const saveEditVeic = (id: string) => {
    if (!editModelo || !editPlaca) return;
    setVeiculos(veiculos.map(v =>
      v.id === id ? { ...v, modelo: editModelo.toUpperCase(), placa: editPlaca.toUpperCase() } : v
    ));
    setEditVeicId(null);
  };

  return (
    <div className="space-y-4">
      {/* 1. Cadastro de Funcionário */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm">
            <UserPlus className="h-4 w-4 flex-shrink-0" />
            Cadastro de Funcionário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-xs">Nome Completo</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" className="h-9 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="matricula" className="text-xs">Matrícula</Label>
              <Input id="matricula" value={matricula} onChange={(e) => setMatricula(e.target.value)} placeholder="12345" className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="funcao" className="text-xs">Função</Label>
              <Input id="funcao" value={funcao} onChange={(e) => setFuncao(e.target.value)} placeholder="Cargo" className="h-9 text-sm" />
            </div>
          </div>
          <Button onClick={handleAddFuncionario} className="w-full h-9 text-sm">
            <Plus className="mr-1 h-4 w-4" />
            Adicionar Funcionário
          </Button>
        </CardContent>
      </Card>

      {/* 2. Cadastro de Veículo */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Car className="h-4 w-4 flex-shrink-0" />
            Cadastro de Veículo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="modelo" className="text-xs">Modelo</Label>
              <Input id="modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Modelo" className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placa" className="text-xs">Placa</Label>
              <Input id="placa" value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} placeholder="ABC-1234" className="h-9 text-sm" />
            </div>
          </div>
          <Button onClick={handleAddVeiculo} className="w-full h-9 text-sm">
            <Plus className="mr-1 h-4 w-4" />
            Adicionar Veículo
          </Button>
        </CardContent>
      </Card>

      {/* 3. Funcionários Cadastrados */}
      {funcionarios.length > 0 && (
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <UserPlus className="h-4 w-4 flex-shrink-0" />
              Funcionários Cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4">
            {funcionarios.map((f) => (
              <div key={f.id} className="p-2 border rounded-lg">
                {editFuncId === f.id ? (
                  <div className="space-y-2">
                    <Input value={editNome} onChange={(e) => setEditNome(e.target.value)} placeholder="Nome" className="h-8 text-xs" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input value={editMatricula} onChange={(e) => setEditMatricula(e.target.value)} placeholder="Matrícula" className="h-8 text-xs" />
                      <Input value={editFuncao} onChange={(e) => setEditFuncao(e.target.value)} placeholder="Função" className="h-8 text-xs" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEditFunc(f.id)} className="flex-1 h-8 text-xs">
                        <Save className="h-3 w-3 mr-1" /> Salvar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditFuncId(null)} className="h-8">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-xs font-medium leading-tight break-words">{f.nome}</p>
                      <div className="flex gap-2 text-[10px] text-muted-foreground">
                        <span>Mat: {f.matricula}</span>
                        <span>•</span>
                        <span className="truncate">{f.funcao}</span>
                      </div>
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditFunc(f)}>
                        <Edit2 className="h-3 w-3 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteFuncionario(f.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 4. Veículos Cadastrados */}
      {veiculos.length > 0 && (
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Car className="h-4 w-4 flex-shrink-0" />
              Veículos Cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4">
            {veiculos.map((v) => (
              <div key={v.id} className="p-2 border rounded-lg">
                {editVeicId === v.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input value={editModelo} onChange={(e) => setEditModelo(e.target.value)} placeholder="Modelo" className="h-8 text-xs" />
                      <Input value={editPlaca} onChange={(e) => setEditPlaca(e.target.value.toUpperCase())} placeholder="Placa" className="h-8 text-xs" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEditVeic(v.id)} className="flex-1 h-8 text-xs">
                        <Save className="h-3 w-3 mr-1" /> Salvar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditVeicId(null)} className="h-8">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-xs font-medium leading-tight break-words">{v.modelo}</p>
                      <p className="text-[10px] text-muted-foreground">Placa: {v.placa}</p>
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditVeic(v)}>
                        <Edit2 className="h-3 w-3 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteVeiculo(v.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
