import { useState } from "react";
import { format } from "date-fns";
import { Plus, Trash2, Utensils, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { RefeicaoRecord, Funcionario, EmpresaConfig, TipoRefeicao, AttachedImage } from "@/types";
import { FuncionarioSelect } from "./FuncionarioSelect";
import { DatePickerField } from "./DatePickerField";
import { ReportExportButton } from "./reports/ReportExportButton";
import { RefeicaoReportContent } from "./reports/RefeicaoReportContent";
import { ImageAttachButton } from "./ImageAttachButton";
import { CurrencyInput } from "./CurrencyInput";
import { parseLocalDate } from "@/utils/dateUtils";
import { generateRefeicaoPdf } from "@/utils/pdfGenerator";

const tipoRefeicaoLabels: Record<TipoRefeicao, string> = {
  cafe: "Café",
  almoco: "Almoço",
  jantar: "Jantar",
  outros: "Outros"
};

export function RefeicaoTab() {
  const [records, setRecords] = useLocalStorage<RefeicaoRecord[]>("refeicao-records", []);
  const [empresaConfig] = useLocalStorage<EmpresaConfig>("empresa-config", { nome: "" });
  
  const [funcionarioId, setFuncionarioId] = useState("");
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | undefined>();
  const [data, setData] = useState<Date | undefined>(new Date());
  const [tipo, setTipo] = useState<TipoRefeicao>("almoco");
  const [valor, setValor] = useState("");
  const [imagens, setImagens] = useState<AttachedImage[]>([]);
  
  const [dataInicio, setDataInicio] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [showReport, setShowReport] = useState(false);

  const [reportFuncionarioId, setReportFuncionarioId] = useState("");
  const [reportFuncionario, setReportFuncionario] = useState<Funcionario | undefined>();

  const [editId, setEditId] = useState<string | null>(null);
  const [editTipo, setEditTipo] = useState<TipoRefeicao>("almoco");
  const [editValor, setEditValor] = useState("");
  const [editImagens, setEditImagens] = useState<AttachedImage[]>([]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleFuncionarioSelect = (funcionario: Funcionario | undefined) => {
    setSelectedFuncionario(funcionario);
    setFuncionarioId(funcionario?.id || "");
  };

  const handleAdd = () => {
    if (!data || !valor || !tipo) return;

    const newRecord: RefeicaoRecord = {
      id: crypto.randomUUID(),
      funcionarioId: selectedFuncionario?.id || "",
      funcionarioNome: selectedFuncionario?.nome?.toUpperCase() || "",
      funcionarioMatricula: selectedFuncionario?.matricula?.toUpperCase() || "",
      data: format(data, "yyyy-MM-dd"),
      tipo,
      valor: parseFloat(valor),
      imagens: imagens.length > 0 ? imagens : undefined,
    };

    setRecords([...records, newRecord]);
    setValor("");
    setImagens([]);
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

  const startEdit = (record: RefeicaoRecord) => {
    setEditId(record.id);
    setEditTipo(record.tipo);
    setEditValor(record.valor.toString());
    setEditImagens(record.imagens || []);
  };

  const cancelEdit = () => { setEditId(null); setEditTipo("almoco"); setEditValor(""); setEditImagens([]); };

  const saveEdit = (id: string) => {
    if (!editValor || !editTipo) return;
    setRecords(records.map(r => r.id === id ? {
      ...r,
      tipo: editTipo,
      valor: parseFloat(editValor),
      imagens: editImagens.length > 0 ? editImagens : undefined,
    } : r));
    cancelEdit();
  };

  const filteredRecords = records.filter(r => {
    if (!dataInicio || !dataFim) return true;
    const recordDate = parseLocalDate(r.data);
    return recordDate >= dataInicio && recordDate <= dataFim;
  });

  const reportRecords: RefeicaoRecord[] = filteredRecords.map(r => ({
    ...r,
    funcionarioNome: reportFuncionario ? reportFuncionario.nome.toUpperCase() : r.funcionarioNome,
    funcionarioMatricula: reportFuncionario ? (reportFuncionario.matricula || "").toUpperCase() : r.funcionarioMatricula,
  }));
  const total = reportRecords.reduce((sum, r) => sum + r.valor, 0);
  const formatCurrencyDisplay = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleGeneratePdf = () => {
    generateRefeicaoPdf(reportRecords, dataInicio, dataFim, total, empresaConfig);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Utensils className="h-5 w-5 flex-shrink-0" />
            Lançamento de Refeição
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FuncionarioSelect value={funcionarioId} onSelect={handleFuncionarioSelect} />

          {selectedFuncionario && (
            <div className="p-2 bg-muted rounded-lg text-xs">
              <div className="grid grid-cols-2 gap-1">
                <div><span className="text-muted-foreground">Nome:</span><p className="font-medium truncate">{selectedFuncionario.nome}</p></div>
                <div><span className="text-muted-foreground">Matrícula:</span><p className="font-medium">{selectedFuncionario.matricula}</p></div>
                <div><span className="text-muted-foreground">Função:</span><p className="font-medium truncate">{selectedFuncionario.funcao}</p></div>
              </div>
            </div>
          )}
          
          <DatePickerField label="Data" value={data} onChange={setData} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoRefeicao)}>
                <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cafe">Café</SelectItem>
                  <SelectItem value="almoco">Almoço</SelectItem>
                  <SelectItem value="jantar">Jantar</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="valor" className="text-xs">Valor (R$)</Label>
              <CurrencyInput id="valor" value={valor} onChange={setValor} />
            </div>
          </div>
          <ImageAttachButton images={imagens} onImagesChange={setImagens} label="Comprovante" />
          <Button onClick={handleAdd} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Refeição
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span>Relatório de Refeição</span>
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
            <div className="space-y-2">
              <Label className="text-xs">Funcionário (Relatório)</Label>
              <FuncionarioSelect value={reportFuncionarioId} onSelect={(f) => { setReportFuncionario(f); setReportFuncionarioId(f?.id || ""); }} />
            </div>
            <ReportExportButton filename="relatorio-refeicao" disabled={reportRecords.length === 0} onGeneratePdf={handleGeneratePdf}>
              <RefeicaoReportContent records={reportRecords} dataInicio={dataInicio} dataFim={dataFim} total={total} empresaConfig={empresaConfig} />
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
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Tipo</Label>
                            <Select value={editTipo} onValueChange={(v) => setEditTipo(v as TipoRefeicao)}>
                              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cafe">Café</SelectItem>
                                <SelectItem value="almoco">Almoço</SelectItem>
                                <SelectItem value="jantar">Jantar</SelectItem>
                                <SelectItem value="outros">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Valor (R$)</Label>
                            <CurrencyInput value={editValor} onChange={setEditValor} className="h-8 text-xs" />
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
                          <div><span className="text-muted-foreground">Tipo:</span><p className="font-medium">{tipoRefeicaoLabels[record.tipo] || record.tipo}</p></div>
                          <div><span className="text-muted-foreground">Valor:</span><p className="font-medium text-primary">{formatCurrencyDisplay(record.valor)}</p></div>
                          {record.imagens && record.imagens.length > 0 && (
                            <div className="col-span-2"><span className="text-xs text-muted-foreground">📷 {record.imagens.length}</span></div>
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
