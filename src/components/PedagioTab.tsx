import { useState } from "react";
import { format } from "date-fns";
import { Plus, Trash2, FileText, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { PedagioRecord, Funcionario, EmpresaConfig } from "@/types";
import { generatePedagioPdf } from "@/utils/pdfGenerator";
import { FuncionarioSelect } from "./FuncionarioSelect";
import { DatePickerField } from "./DatePickerField";

export function PedagioTab() {
  const [records, setRecords] = useLocalStorage<PedagioRecord[]>("pedagio-records", []);
  const [empresaConfig] = useLocalStorage<EmpresaConfig>("empresa-config", { nome: "" });
  
  const [funcionarioId, setFuncionarioId] = useState("");
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | undefined>();
  const [data, setData] = useState<Date | undefined>(new Date());
  const [valor, setValor] = useState("");
  
  const [dataInicio, setDataInicio] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [showReport, setShowReport] = useState(false);

  // States for inline editing
  const [editId, setEditId] = useState<string | null>(null);
  const [editValor, setEditValor] = useState("");

  const handleFuncionarioSelect = (funcionario: Funcionario | undefined) => {
    setSelectedFuncionario(funcionario);
    setFuncionarioId(funcionario?.id || "");
  };

  const handleAdd = () => {
    if (!selectedFuncionario || !data || !valor) {
      return;
    }

    const newRecord: PedagioRecord = {
      id: crypto.randomUUID(),
      funcionarioId: selectedFuncionario.id,
      funcionarioNome: selectedFuncionario.nome,
      funcionarioChapa: selectedFuncionario.chapa,
      carro: selectedFuncionario.carro,
      placa: selectedFuncionario.placa,
      data: format(data, "yyyy-MM-dd"),
      valor: parseFloat(valor)
    };

    setRecords([...records, newRecord]);
    setValor("");
  };

  const handleDelete = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  const startEdit = (record: PedagioRecord) => {
    setEditId(record.id);
    setEditValor(record.valor.toString());
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditValor("");
  };

  const saveEdit = (id: string) => {
    if (!editValor) {
      return;
    }

    setRecords(records.map(r => 
      r.id === id 
        ? { ...r, valor: parseFloat(editValor) }
        : r
    ));
    cancelEdit();
  };

  const filteredRecords = records.filter(r => {
    if (!dataInicio || !dataFim) return true;
    const recordDate = new Date(r.data);
    return recordDate >= dataInicio && recordDate <= dataFim;
  });

  const total = filteredRecords.reduce((sum, r) => sum + r.valor, 0);

  const handleGeneratePdf = () => {
    if (filteredRecords.length === 0) {
      return;
    }
    generatePedagioPdf(filteredRecords, dataInicio, dataFim, total, empresaConfig);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

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
          <FuncionarioSelect 
            value={funcionarioId}
            onSelect={handleFuncionarioSelect}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePickerField
              label="Data"
              value={data}
              onChange={setData}
            />
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>
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
              <DatePickerField
                label="Data Inicial"
                value={dataInicio}
                onChange={setDataInicio}
                placeholder="Início"
              />
              <DatePickerField
                label="Data Final"
                value={dataFim}
                onChange={setDataFim}
                placeholder="Fim"
              />
              <div className="flex items-end">
                <Button onClick={handleGeneratePdf} className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar PDF
                </Button>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Gasto:</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-3">
              {filteredRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum registro encontrado
                </p>
              ) : (
                filteredRecords.map((record) => (
                  <div key={record.id} className="p-3 border rounded-lg">
                    {editId === record.id ? (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">Valor (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editValor}
                            onChange={(e) => setEditValor(e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => saveEdit(record.id)}
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
                            <span className="text-muted-foreground text-xs">Data:</span>
                            <p className="font-medium">{format(new Date(record.data), "dd/MM/yyyy")}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">Funcionário:</span>
                            <p className="font-medium truncate">{record.funcionarioNome}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">Placa:</span>
                            <p className="font-medium">{record.placa}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">Valor:</span>
                            <p className="font-medium text-primary">{formatCurrency(record.valor)}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => startEdit(record)}
                          >
                            <Edit2 className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(record.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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
