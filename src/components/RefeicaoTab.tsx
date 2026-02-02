import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Plus, Trash2, FileText, Utensils, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { RefeicaoRecord, Funcionario, EmpresaConfig, TipoRefeicao } from "@/types";
import { generateRefeicaoPdf } from "@/utils/pdfGenerator";
import { cn } from "@/lib/utils";
import { FuncionarioSelect } from "./FuncionarioSelect";
import { EmpresaHeader } from "./EmpresaHeader";

const tipoRefeicaoLabels: Record<TipoRefeicao, string> = {
  cafe: "Café",
  almoco: "Almoço",
  jantar: "Jantar",
  outros: "Outros"
};

export function RefeicaoTab() {
  const { toast } = useToast();
  const [records, setRecords] = useLocalStorage<RefeicaoRecord[]>("refeicao-records", []);
  const [empresaConfig] = useLocalStorage<EmpresaConfig>("empresa-config", { nome: "" });
  
  const [funcionarioId, setFuncionarioId] = useState("");
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | undefined>();
  const [data, setData] = useState<Date | undefined>(new Date());
  const [tipo, setTipo] = useState<TipoRefeicao>("almoco");
  const [valor, setValor] = useState("");
  
  const [dataInicio, setDataInicio] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [showReport, setShowReport] = useState(false);

  // States for inline editing
  const [editId, setEditId] = useState<string | null>(null);
  const [editTipo, setEditTipo] = useState<TipoRefeicao>("almoco");
  const [editValor, setEditValor] = useState("");

  const handleFuncionarioSelect = (funcionario: Funcionario | undefined) => {
    setSelectedFuncionario(funcionario);
    setFuncionarioId(funcionario?.id || "");
  };

  const handleAdd = () => {
    if (!selectedFuncionario || !data || !valor || !tipo) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    const newRecord: RefeicaoRecord = {
      id: crypto.randomUUID(),
      funcionarioId: selectedFuncionario.id,
      funcionarioNome: selectedFuncionario.nome,
      funcionarioChapa: selectedFuncionario.chapa,
      data: format(data, "yyyy-MM-dd"),
      tipo,
      valor: parseFloat(valor)
    };

    setRecords([...records, newRecord]);
    setValor("");
    
    toast({
      title: "Sucesso",
      description: "Refeição adicionada com sucesso!"
    });
  };

  const handleDelete = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
    toast({
      title: "Excluído",
      description: "Registro removido com sucesso."
    });
  };

  const startEdit = (record: RefeicaoRecord) => {
    setEditId(record.id);
    setEditTipo(record.tipo);
    setEditValor(record.valor.toString());
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTipo("almoco");
    setEditValor("");
  };

  const saveEdit = (id: string) => {
    if (!editValor || !editTipo) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setRecords(records.map(r => 
      r.id === id 
        ? { ...r, tipo: editTipo, valor: parseFloat(editValor) }
        : r
    ));
    cancelEdit();
    toast({
      title: "Sucesso",
      description: "Registro atualizado com sucesso!"
    });
  };

  const filteredRecords = records.filter(r => {
    if (!dataInicio || !dataFim) return true;
    const recordDate = new Date(r.data);
    return recordDate >= dataInicio && recordDate <= dataFim;
  });

  const total = filteredRecords.reduce((sum, r) => sum + r.valor, 0);

  const handleGeneratePdf = () => {
    if (filteredRecords.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum registro encontrado para o período.",
        variant: "destructive"
      });
      return;
    }
    generateRefeicaoPdf(filteredRecords, dataInicio, dataFim, total, empresaConfig);
    toast({
      title: "PDF Gerado",
      description: "O relatório foi gerado com sucesso!"
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <EmpresaHeader />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 whitespace-nowrap">
            <Utensils className="h-5 w-5 flex-shrink-0" />
            Lançamento de Refeição
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FuncionarioSelect 
            value={funcionarioId}
            onSelect={handleFuncionarioSelect}
            showDetails={false}
          />

          {selectedFuncionario && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Nome:</span>
                  <p className="font-medium">{selectedFuncionario.nome}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Chapa:</span>
                  <p className="font-medium">{selectedFuncionario.chapa}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data ? format(data, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data}
                    onSelect={setData}
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoRefeicao)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cafe">Café</SelectItem>
                  <SelectItem value="almoco">Almoço</SelectItem>
                  <SelectItem value="jantar">Jantar</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            Adicionar Refeição
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Relatório de Refeição</span>
            <Button variant="outline" size="sm" onClick={() => setShowReport(!showReport)}>
              {showReport ? "Ocultar" : "Mostrar"} Relatório
            </Button>
          </CardTitle>
        </CardHeader>
        {showReport && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataInicio && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataInicio ? format(dataInicio, "dd/MM/yyyy", { locale: ptBR }) : "Início"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataInicio}
                      onSelect={setDataInicio}
                      locale={ptBR}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataFim && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataFim ? format(dataFim, "dd/MM/yyyy", { locale: ptBR }) : "Fim"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataFim}
                      onSelect={setDataFim}
                      locale={ptBR}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Tipo</Label>
                            <Select value={editTipo} onValueChange={(v) => setEditTipo(v as TipoRefeicao)}>
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
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
                            <Input
                              type="number"
                              step="0.01"
                              value={editValor}
                              onChange={(e) => setEditValor(e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
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
                            <span className="text-muted-foreground text-xs">Tipo:</span>
                            <p className="font-medium">{tipoRefeicaoLabels[record.tipo] || record.tipo}</p>
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
