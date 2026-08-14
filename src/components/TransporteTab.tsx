import { useState } from "react";
import { format } from "date-fns";
import { Plus, Trash2, Edit2, Save, X, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { TransporteRecord, Funcionario, EmpresaConfig, AttachedImage, TipoTransporte } from "@/types";
import { FuncionarioSelect } from "./FuncionarioSelect";
import { TransporteSelect, tipoTransporteLabels } from "./TransporteSelect";
import { DatePickerField } from "./DatePickerField";
import { ReportExportButton } from "./reports/ReportExportButton";
import { TransporteReportContent } from "./reports/TransporteReportContent";
import { ImageAttachButton } from "./ImageAttachButton";
import { CurrencyInput } from "./CurrencyInput";
import { parseLocalDate } from "@/utils/dateUtils";
import { generateTransportePdf } from "@/utils/pdfGenerator";

export function TransporteTab() {
  const [records, setRecords] = useLocalStorage<TransporteRecord[]>("transporte-records", []);
  const [empresaConfig] = useLocalStorage<EmpresaConfig>("empresa-config", { nome: "" });

  const [funcionarioId, setFuncionarioId] = useState("");
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | undefined>();
  const [transporte, setTransporte] = useState<TipoTransporte>("nenhum");
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
  const [editTransporte, setEditTransporte] = useState<TipoTransporte>("nenhum");
  const [editImagens, setEditImagens] = useState<AttachedImage[]>([]);
  const [editData, setEditData] = useState<Date | undefined>();
  const [editFuncionario, setEditFuncionario] = useState<Funcionario | undefined>();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleFuncionarioSelect = (funcionario: Funcionario | undefined) => {
    setSelectedFuncionario(funcionario);
    setFuncionarioId(funcionario?.id || "");
  };

  const handleAdd = () => {
    if (!data || !valor || transporte === "nenhum") return;

    const newRecord: TransporteRecord = {
      id: crypto.randomUUID(),
      funcionarioId: selectedFuncionario?.id || "",
      funcionarioNome: selectedFuncionario?.nome?.toUpperCase() || "",
      funcionarioMatricula: selectedFuncionario?.matricula?.toUpperCase() || "",
      transporte,
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

  const startEdit = (record: TransporteRecord) => {
    setEditId(record.id);
    setEditValor(record.valor.toString());
    setEditDirecao(record.direcao || 'ida');
    setEditTransporte(record.transporte || 'nenhum');
    setEditImagens(record.imagensComprovante || []);
    setEditData(record.data ? parseLocalDate(record.data) : undefined);
    setEditFuncionario(record.funcionarioId ? { id: record.funcionarioId, nome: record.funcionarioNome, matricula: record.funcionarioMatricula, funcao: "" } : undefined);
  };

  const cancelEdit = () => { setEditId(null); setEditValor(""); setEditImagens([]); };

  const saveEdit = (id: string) => {
    if (!editValor) return;
    setRecords(records.map(r => r.id === id ? {
      ...r,
      data: editData ? format(editData, "yyyy-MM-dd") : r.data,
      funcionarioId: editFuncionario?.id || "",
      funcionarioNome: editFuncionario?.nome?.toUpperCase() || "",
      funcionarioMatricula: editFuncionario?.matricula?.toUpperCase() || "",
      transporte: editTransporte,
      valor: parseFloat(editValor),
      direcao: editDirecao,
      imagensComprovante: editImagens.length > 0 ? editImagens : undefined,
    } : r));
    cancelEdit();
  };

  const filteredRecords = records.filter(r => {
    if (!dataInicio || !dataFim) return true;
    const recordDate = parseLocalDate(r.data);
    return recordDate >= dataInicio && recordDate <= dataFim;
  }).sort((a, b) => a.data.localeCompare(b.data));

  const total = filteredRecords.reduce((sum, r) => sum + r.valor, 0);
  const formatCurrencyDisplay = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleGeneratePdf = () => {
    generateTransportePdf(filteredRecords, dataInicio, dataFim, total, empresaConfig);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bus className="h-5 w-5 flex-shrink-0" />
            Lançamento de Transporte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FuncionarioSelect value={funcionarioId} onSelect={handleFuncionarioSelect} />
          <TransporteSelect value={transporte} onChange={setTransporte} />

          {selectedFuncionario && (
            <div className="p-2 bg-muted rounded-lg text-xs">
              <div className="grid grid-cols-2 gap-1">
                <div><span className="text-muted-foreground">Nome:</span><p className="font-medium truncate">{selectedFuncionario.nome}</p></div>
                <div><span className="text-muted-foreground">Matrícula:</span><p className="font-medium">{selectedFuncionario.matricula}</p></div>
                <div><span className="text-muted-foreground">Função:</span><p className="font-medium truncate">{selectedFuncionario.funcao}</p></div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <DatePickerField label="Data" value={data} onChange={setData} />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="valor-transporte" className="text-xs">Valor (R$)</Label>
                <CurrencyInput id="valor-transporte" value={valor} onChange={setValor} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Direção</Label>
                <RadioGroup value={direcao} onValueChange={(v) => setDirecao(v as 'ida' | 'volta')} className="flex gap-4 h-10 items-center">
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="ida" id="transporte-ida" />
                    <Label htmlFor="transporte-ida" className="cursor-pointer text-sm">Ida</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="volta" id="transporte-volta" />
                    <Label htmlFor="transporte-volta" className="cursor-pointer text-sm">Volta</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          <ImageAttachButton images={imagensComprovante} onImagesChange={setImagensComprovante} label="Comprovante" />
          <Button onClick={handleAdd} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Transporte
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span>Relatório de Transporte</span>
            <Button variant="outline" size="sm" onClick={() => setShowReport(!showReport)}>
              {showReport ? "Ocultar" : "Mostrar"}
            </Button>
          </CardTitle>
        </CardHeader>
        {showReport && (
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <DatePickerField label="Data Inicial" value={dataInicio} onChange={setDataInicio} placeholder="Início" />
              <DatePickerField label="Data Final" value={dataFim} onChange={setDataFim} placeholder="Fim" />
            </div>
            <ReportExportButton filename="relatorio-transporte" disabled={filteredRecords.length === 0} onGeneratePdf={handleGeneratePdf}>
              <TransporteReportContent records={filteredRecords} dataInicio={dataInicio} dataFim={dataFim} total={total} empresaConfig={empresaConfig} />
            </ReportExportButton>

            <div className="bg-muted p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">Total Gasto:</span>
                <span className="text-base font-bold text-primary">{formatCurrencyDisplay(total)}</span>
              </div>
            </div>

            {filteredRecords.length > 0 && (
              <div className="flex items-center justify-between gap-2 py-2 border-b">
                <div className="flex items-center gap-2">
                  <Checkbox checked={selectedIds.size === filteredRecords.length && filteredRecords.length > 0} onCheckedChange={toggleSelectAll} />
                  <span className="text-xs text-muted-foreground">{selectedIds.size > 0 ? `${selectedIds.size} selecionado(s)` : "Selecionar todos"}</span>
                </div>
                {selectedIds.size > 0 && (
                  <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                    <Trash2 className="h-3 w-3 mr-1" /> Excluir ({selectedIds.size})
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-2">
              {filteredRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 text-sm">Nenhum registro encontrado</p>
              ) : (
                filteredRecords.map((record) => (
                  <div key={record.id} className="p-2 border rounded-lg">
                    {editId === record.id ? (
                      <div className="space-y-2">
                        <FuncionarioSelect value={editFuncionario?.id || ""} onSelect={setEditFuncionario} />
                        <TransporteSelect value={editTransporte} onChange={setEditTransporte} className="h-8" />
                        <DatePickerField label="Data" value={editData} onChange={setEditData} />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Valor (R$)</Label>
                            <CurrencyInput value={editValor} onChange={setEditValor} className="h-8 text-xs" />
                          </div>
                          <div>
                            <Label className="text-xs">Direção</Label>
                            <RadioGroup value={editDirecao} onValueChange={(v) => setEditDirecao(v as 'ida' | 'volta')} className="flex gap-3 mt-1">
                              <div className="flex items-center space-x-1"><RadioGroupItem value="ida" id="edit-transporte-ida" /><Label htmlFor="edit-transporte-ida" className="text-xs cursor-pointer">Ida</Label></div>
                              <div className="flex items-center space-x-1"><RadioGroupItem value="volta" id="edit-transporte-volta" /><Label htmlFor="edit-transporte-volta" className="text-xs cursor-pointer">Volta</Label></div>
                            </RadioGroup>
                          </div>
                        </div>
                        <ImageAttachButton images={editImagens} onImagesChange={setEditImagens} label="Comprovante" />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit(record.id)} className="flex-1"><Save className="h-3 w-3 mr-1" /> Salvar</Button>
                          <Button variant="outline" size="sm" onClick={cancelEdit}><X className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <Checkbox checked={selectedIds.has(record.id)} onCheckedChange={() => toggleSelectId(record.id)} className="mt-1" />
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs flex-1 min-w-0">
                          <div><span className="text-muted-foreground">Data:</span><p className="font-medium">{format(parseLocalDate(record.data), "dd/MM/yyyy")}</p></div>
                          <div><span className="text-muted-foreground">Funcionário:</span><p className="font-medium truncate">{record.funcionarioNome || "-"}</p></div>
                          <div><span className="text-muted-foreground">Transporte:</span><p className="font-medium truncate">{tipoTransporteLabels[record.transporte] || "-"}</p></div>
                          <div><span className="text-muted-foreground">Valor:</span><p className="font-medium text-primary">{formatCurrencyDisplay(record.valor)}</p></div>
                          <div><span className="text-muted-foreground">Direção:</span><p className="font-medium">{record.direcao === 'ida' ? 'Ida' : 'Volta'}</p></div>
                          {record.imagensComprovante && record.imagensComprovante.length > 0 && (
                            <div><span className="text-xs text-muted-foreground">📷 {record.imagensComprovante.length}</span></div>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(record)}><Edit2 className="h-3 w-3 text-blue-600" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(record.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
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
