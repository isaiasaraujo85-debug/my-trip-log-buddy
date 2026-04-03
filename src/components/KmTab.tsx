import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Save, Trash2, FileText, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { KmRecord, Funcionario, Veiculo, EmpresaConfig, AttachedImage } from "@/types";
import { cn } from "@/lib/utils";
import { parseLocalDate } from "@/utils/dateUtils";
import { FuncionarioSelect } from "./FuncionarioSelect";
import { VeiculoSelect } from "./VeiculoSelect";
import { DatePickerField } from "./DatePickerField";
import { ReportExportButton } from "./reports/ReportExportButton";
import { KmReportContent } from "./reports/KmReportContent";
import { ImageAttachButton } from "./ImageAttachButton";

export function KmTab() {
  const [records, setRecords] = useLocalStorage<KmRecord[]>("km-records", []);
  const [empresaConfig] = useLocalStorage<EmpresaConfig>("empresa-config", { nome: "" });
  const [savedValorKm, setSavedValorKm] = useLocalStorage<string>("km-valor-km", "");
  
  const [funcionarioId, setFuncionarioId] = useState("");
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | undefined>();
  const [veiculoId, setVeiculoId] = useState("");
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | undefined>();
  const [data, setData] = useState<Date | undefined>(new Date());
  const [kmInicial, setKmInicial] = useState("");
  const [kmFinal, setKmFinal] = useState("");
  const [kmPercorrido, setKmPercorrido] = useState(0);
  const [valorKm, setValorKm] = useState(savedValorKm);
  const [valorTotal, setValorTotal] = useState(0);
  
  const [imagensKmInicial, setImagensKmInicial] = useState<AttachedImage[]>([]);
  const [imagensKmFinal, setImagensKmFinal] = useState<AttachedImage[]>([]);
  
  const [dataInicio, setDataInicio] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [showReport, setShowReport] = useState(false);
  
  const [tableEditId, setTableEditId] = useState<string | null>(null);
  const [tableEditKmInicial, setTableEditKmInicial] = useState("");
  const [tableEditKmFinal, setTableEditKmFinal] = useState("");
  const [tableEditValorKm, setTableEditValorKm] = useState("");
  const [tableEditImgInicial, setTableEditImgInicial] = useState<AttachedImage[]>([]);
  const [tableEditImgFinal, setTableEditImgFinal] = useState<AttachedImage[]>([]);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const inicial = parseFloat(kmInicial) || 0;
    const final2 = parseFloat(kmFinal) || 0;
    const percorrido = Math.max(0, final2 - inicial);
    setKmPercorrido(percorrido);
    const valor = parseFloat(valorKm) || 0;
    setValorTotal(percorrido * valor);
  }, [kmInicial, kmFinal, valorKm]);

  const handleValorKmChange = (value: string) => {
    setValorKm(value);
    setSavedValorKm(value);
  };

  const handleFuncionarioSelect = (funcionario: Funcionario | undefined) => {
    setSelectedFuncionario(funcionario);
    setFuncionarioId(funcionario?.id || "");
  };

  const handleVeiculoSelect = (veiculo: Veiculo | undefined) => {
    setSelectedVeiculo(veiculo);
    setVeiculoId(veiculo?.id || "");
  };

  const handleSave = () => {
    if (!selectedFuncionario || !selectedVeiculo || !data) return;
    if (!kmInicial && !kmFinal) return;

    const dateStr = format(data, "yyyy-MM-dd");
    const kmInicialValue = parseFloat(kmInicial) || null;
    const kmFinalValue = parseFloat(kmFinal) || null;
    const valorKmValue = parseFloat(valorKm) || 0;
    
    if (kmInicialValue !== null && kmFinalValue !== null && kmFinalValue < kmInicialValue) return;

    const calculatedKm = (kmInicialValue !== null && kmFinalValue !== null) ? kmFinalValue - kmInicialValue : 0;
    const status: 'parcial' | 'completo' = (kmInicialValue !== null && kmFinalValue !== null) ? 'completo' : 'parcial';

    const newRecord: KmRecord = {
      id: crypto.randomUUID(),
      funcionarioId: selectedFuncionario.id,
      funcionarioNome: selectedFuncionario.nome.toUpperCase(),
      funcionarioMatricula: selectedFuncionario.matricula.toUpperCase(),
      veiculoId: selectedVeiculo.id,
      veiculo: selectedVeiculo.modelo.toUpperCase(),
      placa: selectedVeiculo.placa.toUpperCase(),
      data: dateStr,
      kmInicial: kmInicialValue,
      kmFinal: kmFinalValue,
      kmPercorrido: calculatedKm,
      valorKm: valorKmValue,
      valorTotal: calculatedKm * valorKmValue,
      status,
      imagensKmInicial: imagensKmInicial.length > 0 ? imagensKmInicial : undefined,
      imagensKmFinal: imagensKmFinal.length > 0 ? imagensKmFinal : undefined,
    };
    setRecords([...records, newRecord]);
    setKmInicial("");
    setKmFinal("");
    setImagensKmInicial([]);
    setImagensKmFinal([]);
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

  const startTableEdit = (record: KmRecord) => {
    setTableEditId(record.id);
    setTableEditKmInicial(record.kmInicial?.toString() || "");
    setTableEditKmFinal(record.kmFinal?.toString() || "");
    setTableEditValorKm(record.valorKm?.toString() || "");
    setTableEditImgInicial(record.imagensKmInicial || []);
    setTableEditImgFinal(record.imagensKmFinal || []);
  };

  const cancelTableEdit = () => { setTableEditId(null); };

  const saveTableEdit = (id: string) => {
    const kmInicialValue = parseFloat(tableEditKmInicial) || null;
    const kmFinalValue = parseFloat(tableEditKmFinal) || null;
    const valorKmValue = parseFloat(tableEditValorKm) || 0;
    if (kmInicialValue !== null && kmFinalValue !== null && kmFinalValue < kmInicialValue) return;
    const calculatedKm = (kmInicialValue !== null && kmFinalValue !== null) ? kmFinalValue - kmInicialValue : 0;
    const status: 'parcial' | 'completo' = (kmInicialValue !== null && kmFinalValue !== null) ? 'completo' : 'parcial';
    setRecords(records.map(r => r.id === id ? {
      ...r,
      kmInicial: kmInicialValue,
      kmFinal: kmFinalValue,
      kmPercorrido: calculatedKm,
      valorKm: valorKmValue,
      valorTotal: calculatedKm * valorKmValue,
      status,
      imagensKmInicial: tableEditImgInicial.length > 0 ? tableEditImgInicial : undefined,
      imagensKmFinal: tableEditImgFinal.length > 0 ? tableEditImgFinal : undefined,
    } : r));
    cancelTableEdit();
  };

  const filteredRecords = records.filter(r => {
    if (!dataInicio || !dataFim) return true;
    const recordDate = parseLocalDate(r.data);
    return recordDate >= dataInicio && recordDate <= dataFim;
  });

  const completedRecords = filteredRecords.filter(r => r.status === 'completo');
  const totalKm = completedRecords.reduce((sum, r) => sum + r.kmPercorrido, 0);
  const totalValor = completedRecords.reduce((sum, r) => sum + (r.valorTotal || 0), 0);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 whitespace-nowrap">
            <FileText className="h-5 w-5 flex-shrink-0" />
            Lançamento de KM
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePickerField label="Data" value={data} onChange={setData} />
            <div className="space-y-2">
              <Label htmlFor="valorKm">Valor por KM (R$)</Label>
              <Input id="valorKm" type="number" step="0.01" value={valorKm} onChange={(e) => handleValorKmChange(e.target.value)} placeholder="0,00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kmInicial">KM Inicial</Label>
              <Input id="kmInicial" type="number" value={kmInicial} onChange={(e) => setKmInicial(e.target.value)} placeholder="0" />
              <ImageAttachButton images={imagensKmInicial} onImagesChange={setImagensKmInicial} label="Comprovante" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kmFinal">KM Final</Label>
              <Input id="kmFinal" type="number" value={kmFinal} onChange={(e) => setKmFinal(e.target.value)} placeholder="0" />
              <ImageAttachButton images={imagensKmFinal} onImagesChange={setImagensKmFinal} label="Comprovante" />
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-base">KM Percorrido:</Label>
              <span className="text-xl font-bold text-primary">{kmPercorrido} km</span>
            </div>
            <div className="flex justify-between items-center">
              <Label className="text-base">Valor a Receber:</Label>
              <span className="text-xl font-bold text-green-600">{formatCurrency(valorTotal)}</span>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Salvar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Relatório de KM</span>
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
                <ReportExportButton filename="relatorio-km" disabled={completedRecords.length === 0}>
                  <KmReportContent records={completedRecords} dataInicio={dataInicio} dataFim={dataFim} totalKm={totalKm} totalValor={totalValor} empresaConfig={empresaConfig} />
                </ReportExportButton>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total KM:</span>
                <span className="text-lg font-bold text-primary">{totalKm} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Valor Total:</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(totalValor)}</span>
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
                    {tableEditId === record.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div><Label className="text-xs">KM Inicial</Label><Input type="number" value={tableEditKmInicial} onChange={(e) => setTableEditKmInicial(e.target.value)} className="h-8 text-sm" /></div>
                          <div><Label className="text-xs">KM Final</Label><Input type="number" value={tableEditKmFinal} onChange={(e) => setTableEditKmFinal(e.target.value)} className="h-8 text-sm" /></div>
                          <div><Label className="text-xs">Valor KM</Label><Input type="number" step="0.01" value={tableEditValorKm} onChange={(e) => setTableEditValorKm(e.target.value)} className="h-8 text-sm" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <ImageAttachButton images={tableEditImgInicial} onImagesChange={setTableEditImgInicial} label="Comprovante KM Inicial" />
                          <ImageAttachButton images={tableEditImgFinal} onImagesChange={setTableEditImgFinal} label="Comprovante KM Final" />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveTableEdit(record.id)} className="flex-1"><Save className="h-4 w-4 mr-1" /> Salvar</Button>
                          <Button variant="outline" size="sm" onClick={cancelTableEdit}><X className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <Checkbox checked={selectedIds.has(record.id)} onCheckedChange={() => toggleSelectId(record.id)} className="mt-1" />
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm flex-1 min-w-0">
                          <div><span className="text-muted-foreground text-xs">Data:</span><p className="font-medium">{format(parseLocalDate(record.data), "dd/MM/yyyy")}</p></div>
                          <div><span className="text-muted-foreground text-xs">Funcionário:</span><p className="font-medium truncate">{record.funcionarioNome}</p></div>
                          <div><span className="text-muted-foreground text-xs">KM Inicial:</span><p className="font-medium">{record.kmInicial ?? "-"}</p></div>
                          <div><span className="text-muted-foreground text-xs">KM Final:</span><p className="font-medium">{record.kmFinal ?? "-"}</p></div>
                          <div><span className="text-muted-foreground text-xs">Percorrido:</span><p className="font-medium text-primary">{record.kmPercorrido} km</p></div>
                          <div><span className="text-muted-foreground text-xs">Valor:</span><p className="font-medium text-green-600">{formatCurrency(record.valorTotal || 0)}</p></div>
                          <div className="col-span-2">
                            <span className={cn("text-xs px-2 py-1 rounded-full", record.status === 'completo' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800")}>
                              {record.status === 'completo' ? "Completo" : "Parcial"}
                            </span>
                            {((record.imagensKmInicial && record.imagensKmInicial.length > 0) || (record.imagensKmFinal && record.imagensKmFinal.length > 0)) && (
                              <span className="text-xs text-muted-foreground ml-2">📷 {(record.imagensKmInicial?.length || 0) + (record.imagensKmFinal?.length || 0)} comprovante(s)</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startTableEdit(record)}><Edit2 className="h-4 w-4 text-blue-600" /></Button>
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
