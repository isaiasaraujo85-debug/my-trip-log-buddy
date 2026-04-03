import { useState } from "react";
import { format } from "date-fns";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { PedagioRecord, Funcionario, Veiculo, EmpresaConfig, AttachedImage } from "@/types";
import { FuncionarioSelect } from "./FuncionarioSelect";
import { VeiculoSelect } from "./VeiculoSelect";
import { DatePickerField } from "./DatePickerField";
import { ReportExportButton } from "./reports/ReportExportButton";
import { PedagioReportContent } from "./reports/PedagioReportContent";
import { ImageAttachButton } from "./ImageAttachButton";
import { parseLocalDate } from "@/utils/dateUtils";

export function PedagioTab() {
  const [records, setRecords] = useLocalStorage<PedagioRecord[]>("pedagio-records", []);
  const [empresaConfig] = useLocalStorage<EmpresaConfig>("empresa-config", { nome: "" });
  
  const [funcionarioId, setFuncionarioId] = useState("");
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | undefined>();
  const [veiculoId, setVeiculoId] = useState("");
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | undefined>();
  const [data, setData] = useState<Date | undefined>(new Date());
  const [valor, setValor] = useState("");
  const [direcao, setDirecao] = useState<'ida' | 'volta'>('ida');
  const [imagensComprovante, setImagensComprovante] = useState<AttachedImage[]>([]);
  
  const [dataInicio, setDataInicio] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [showReport, setShowReport] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editValor, setEditValor] = useState("");
  const [editDirecao, setEditDirecao] = useState<'ida' | 'volta'>('ida');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleFuncionarioSelect = (funcionario: Funcionario | undefined) => {
    setSelectedFuncionario(funcionario);
    setFuncionarioId(funcionario?.id || "");
  };

  const handleVeiculoSelect = (veiculo: Veiculo | undefined) => {
    setSelectedVeiculo(veiculo);
    setVeiculoId(veiculo?.id || "");
  };

  const handleAdd = () => {
    if (!selectedFuncionario || !selectedVeiculo || !data || !valor) return;

    const newRecord: PedagioRecord = {
      id: crypto.randomUUID(),
      funcionarioId: selectedFuncionario.id,
      funcionarioNome: selectedFuncionario.nome,
      funcionarioMatricula: selectedFuncionario.matricula,
      veiculoId: selectedVeiculo.id,
      veiculo: selectedVeiculo.modelo,
      placa: selectedVeiculo.placa,
      data: format(data, "yyyy-MM-dd"),
      valor: parseFloat(valor),
      direcao,
      imagensComprovante: imagensComprovante.length > 0 ? imagensComprovante : undefined,
    };

    setRecords([...records, newRecord]);
    setValor("");
    setImagensComprovante([]);
  };

  const handleDelete = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
    setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    setRecords(records.filter(r => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s; });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRecords.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredRecords.map(r => r.id)));
  };

  const startEdit = (record: PedagioRecord) => {
    setEditId(record.id);
    setEditValor(record.valor.toString());
    setEditDirecao(record.direcao || 'ida');
  };

  const cancelEdit = () => { setEditId(null); setEditValor(""); };

  const saveEdit = (id: string) => {
    if (!editValor) return;
    setRecords(records.map(r => r.id === id ? { ...r, valor: parseFloat(editValor), direcao: editDirecao } : r));
    cancelEdit();
  };

  const filteredRecords = records.filter(r => {
    if (!dataInicio || !dataFim) return true;
    const recordDate = parseLocalDate(r.data);
    return recordDate >= dataInicio && recordDate <= dataFim;
  });

  const total = filteredRecords.reduce((sum, r) => sum + r.valor, 0);
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 whitespace-nowrap">
            <Plus className="h-5 w-5 flex-shrink-0" />
            Lançamento de Pedágio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FuncionarioSelect value={funcionarioId} onSelect={handleFuncionarioSelect} />
          <VeiculoSelect value={veiculoId} onSelect={handleVeiculoSelect} />

          {(selectedFuncionario || selectedVeiculo) && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <div className="grid grid-cols-2 gap-2">
                {selectedFuncionario && (
                  <>
                    <div><span className="text-muted-foreground">Nome:</span><p className="font-medium">{selectedFuncionario.nome}</p></div>
                    <div><span className="text-muted-foreground">Matrícula:</span><p className="font-medium">{selectedFuncionario.matricula}</p></div>
                    <div><span className="text-muted-foreground">Função:</span><p className="font-medium">{selectedFuncionario.funcao}</p></div>
                  </>
                )}
                {selectedVeiculo && (
                  <>
                    <div><span className="text-muted-foreground">Veículo:</span><p className="font-medium">{selectedVeiculo.modelo}</p></div>
                    <div><span className="text-muted-foreground">Placa:</span><p className="font-medium">{selectedVeiculo.placa}</p></div>
                  </>
                )}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-4">
            <DatePickerField label="Data" value={data} onChange={setData} />
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input id="valor" type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" className="uppercase" />
            </div>
            <div className="space-y-2">
              <Label>Direção</Label>
              <RadioGroup value={direcao} onValueChange={(v) => setDirecao(v as 'ida' | 'volta')} className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ida" id="ida" />
                  <Label htmlFor="ida" className="cursor-pointer">Ida</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="volta" id="volta" />
                  <Label htmlFor="volta" className="cursor-pointer">Volta</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <ImageAttachButton images={imagensComprovante} onImagesChange={setImagensComprovante} label="Comprovante" />
          <Button onClick={handleAdd} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Pedágio
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Relatório de Pedágio</span>
            <Button variant="outline" size="sm" onClick={() => setShowReport(!showReport)}>
              {showReport ? "Ocultar" : "Mostrar"} Relatório
            </Button>
          </CardTitle>
        </CardHeader>
        {showReport && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DatePickerField label="Data Inicial" value={dataInicio} onChange={setDataInicio} placeholder="Início" />
              <DatePickerField label="Data Final" value={dataFim} onChange={setDataFim} placeholder="Fim" />
              <div className="flex items-end">
                <ReportExportButton filename="relatorio-pedagio" disabled={filteredRecords.length === 0}>
                  <PedagioReportContent records={filteredRecords} dataInicio={dataInicio} dataFim={dataFim} total={total} empresaConfig={empresaConfig} />
                </ReportExportButton>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Gasto:</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            {filteredRecords.length > 0 && (
              <div className="flex items-center justify-between gap-2 py-2 border-b">
                <div className="flex items-center gap-2">
                  <Checkbox checked={selectedIds.size === filteredRecords.length && filteredRecords.length > 0} onCheckedChange={toggleSelectAll} />
                  <span className="text-sm text-muted-foreground">{selectedIds.size > 0 ? `${selectedIds.size} selecionado(s)` : "Selecionar todos"}</span>
                </div>
                {selectedIds.size > 0 && (
                  <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                    <Trash2 className="h-4 w-4 mr-1" /> Excluir ({selectedIds.size})
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-3">
              {filteredRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Nenhum registro encontrado</p>
              ) : (
                filteredRecords.map((record) => (
                  <div key={record.id} className="p-3 border rounded-lg">
                    {editId === record.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Valor (R$)</Label>
                            <Input type="number" step="0.01" value={editValor} onChange={(e) => setEditValor(e.target.value)} className="h-8 text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs">Direção</Label>
                            <RadioGroup value={editDirecao} onValueChange={(v) => setEditDirecao(v as 'ida' | 'volta')} className="flex gap-4 mt-1">
                              <div className="flex items-center space-x-1"><RadioGroupItem value="ida" id="edit-ida" /><Label htmlFor="edit-ida" className="text-xs cursor-pointer">Ida</Label></div>
                              <div className="flex items-center space-x-1"><RadioGroupItem value="volta" id="edit-volta" /><Label htmlFor="edit-volta" className="text-xs cursor-pointer">Volta</Label></div>
                            </RadioGroup>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit(record.id)} className="flex-1"><Save className="h-4 w-4 mr-1" /> Salvar</Button>
                          <Button variant="outline" size="sm" onClick={cancelEdit}><X className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <Checkbox checked={selectedIds.has(record.id)} onCheckedChange={() => toggleSelectId(record.id)} className="mt-1" />
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm flex-1 min-w-0">
                          <div><span className="text-muted-foreground text-xs">Data:</span><p className="font-medium">{format(parseLocalDate(record.data), "dd/MM/yyyy")}</p></div>
                          <div><span className="text-muted-foreground text-xs">Funcionário:</span><p className="font-medium truncate">{record.funcionarioNome}</p></div>
                          <div><span className="text-muted-foreground text-xs">Placa:</span><p className="font-medium">{record.placa}</p></div>
                          <div><span className="text-muted-foreground text-xs">Valor:</span><p className="font-medium text-primary">{formatCurrency(record.valor)}</p></div>
                          <div><span className="text-muted-foreground text-xs">Direção:</span><p className="font-medium">{record.direcao === 'ida' ? 'Ida' : 'Volta'}</p></div>
                          {record.imagensComprovante && record.imagensComprovante.length > 0 && (
                            <div><span className="text-xs text-muted-foreground">📷 {record.imagensComprovante.length} comprovante(s)</span></div>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(record)}><Edit2 className="h-4 w-4 text-blue-600" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(record.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
