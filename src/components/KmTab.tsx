import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Save, Trash2, FileText, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { KmRecord, Funcionario, EmpresaConfig } from "@/types";
import { generateKmPdf } from "@/utils/pdfGenerator";
import { cn } from "@/lib/utils";
import { FuncionarioSelect } from "./FuncionarioSelect";
import { EmpresaHeader } from "./EmpresaHeader";

export function KmTab() {
  const { toast } = useToast();
  const [records, setRecords] = useLocalStorage<KmRecord[]>("km-records", []);
  const [empresaConfig] = useLocalStorage<EmpresaConfig>("empresa-config", { nome: "" });
  
  const [funcionarioId, setFuncionarioId] = useState("");
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | undefined>();
  const [data, setData] = useState<Date | undefined>(new Date());
  const [kmInicial, setKmInicial] = useState("");
  const [kmFinal, setKmFinal] = useState("");
  const [kmPercorrido, setKmPercorrido] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [dataInicio, setDataInicio] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const inicial = parseFloat(kmInicial) || 0;
    const final = parseFloat(kmFinal) || 0;
    setKmPercorrido(Math.max(0, final - inicial));
  }, [kmInicial, kmFinal]);

  // Check for pending record (partial) for today
  useEffect(() => {
    if (data && funcionarioId) {
      const dateStr = format(data, "yyyy-MM-dd");
      const pendingRecord = records.find(
        r => r.funcionarioId === funcionarioId && r.data === dateStr && r.status === 'parcial'
      );
      if (pendingRecord) {
        setEditingId(pendingRecord.id);
        setKmInicial(pendingRecord.kmInicial?.toString() || "");
        setKmFinal(pendingRecord.kmFinal?.toString() || "");
      } else {
        setEditingId(null);
        setKmInicial("");
        setKmFinal("");
      }
    }
  }, [data, funcionarioId, records]);

  const handleFuncionarioSelect = (funcionario: Funcionario | undefined) => {
    setSelectedFuncionario(funcionario);
    setFuncionarioId(funcionario?.id || "");
  };

  const handleSaveKmInicial = () => {
    if (!selectedFuncionario || !data || !kmInicial) {
      toast({
        title: "Erro",
        description: "Selecione um funcionário, data e KM inicial.",
        variant: "destructive"
      });
      return;
    }

    const dateStr = format(data, "yyyy-MM-dd");
    const existingRecord = records.find(
      r => r.funcionarioId === funcionarioId && r.data === dateStr
    );

    if (existingRecord) {
      // Update existing record
      setRecords(records.map(r => 
        r.id === existingRecord.id 
          ? { ...r, kmInicial: parseFloat(kmInicial) }
          : r
      ));
    } else {
      // Create new partial record
      const newRecord: KmRecord = {
        id: crypto.randomUUID(),
        funcionarioId: selectedFuncionario.id,
        funcionarioNome: selectedFuncionario.nome,
        funcionarioChapa: selectedFuncionario.chapa,
        carro: selectedFuncionario.carro,
        placa: selectedFuncionario.placa,
        data: dateStr,
        kmInicial: parseFloat(kmInicial),
        kmFinal: null,
        kmPercorrido: 0,
        status: 'parcial'
      };
      setRecords([...records, newRecord]);
    }

    toast({
      title: "Sucesso",
      description: "KM inicial salvo com sucesso!"
    });
  };

  const handleSaveKmFinal = () => {
    if (!selectedFuncionario || !data || !kmFinal) {
      toast({
        title: "Erro",
        description: "Selecione um funcionário, data e KM final.",
        variant: "destructive"
      });
      return;
    }

    const dateStr = format(data, "yyyy-MM-dd");
    const existingRecord = records.find(
      r => r.funcionarioId === funcionarioId && r.data === dateStr
    );

    if (existingRecord) {
      const kmInicialValue = existingRecord.kmInicial || 0;
      const kmFinalValue = parseFloat(kmFinal);
      
      if (kmFinalValue < kmInicialValue) {
        toast({
          title: "Erro",
          description: "KM final deve ser maior que KM inicial.",
          variant: "destructive"
        });
        return;
      }

      setRecords(records.map(r => 
        r.id === existingRecord.id 
          ? { 
              ...r, 
              kmFinal: kmFinalValue,
              kmPercorrido: kmFinalValue - kmInicialValue,
              status: 'completo' as const
            }
          : r
      ));
      
      toast({
        title: "Sucesso",
        description: "KM final salvo com sucesso!"
      });
    } else {
      toast({
        title: "Erro",
        description: "Salve o KM inicial primeiro.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
    toast({
      title: "Excluído",
      description: "Registro removido com sucesso."
    });
  };

  const filteredRecords = records.filter(r => {
    if (!dataInicio || !dataFim) return true;
    const recordDate = new Date(r.data);
    return recordDate >= dataInicio && recordDate <= dataFim;
  });

  const completedRecords = filteredRecords.filter(r => r.status === 'completo');
  const totalKm = completedRecords.reduce((sum, r) => sum + r.kmPercorrido, 0);

  const handleGeneratePdf = () => {
    if (completedRecords.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum registro completo encontrado para o período.",
        variant: "destructive"
      });
      return;
    }
    generateKmPdf(completedRecords, dataInicio, dataFim, totalKm, empresaConfig);
    toast({
      title: "PDF Gerado",
      description: "O relatório foi gerado com sucesso!"
    });
  };

  return (
    <div className="space-y-6">
      <EmpresaHeader />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lançamento de KM
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FuncionarioSelect 
            value={funcionarioId}
            onSelect={handleFuncionarioSelect}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="kmInicial">KM Inicial</Label>
              <div className="flex gap-2">
                <Input
                  id="kmInicial"
                  type="number"
                  value={kmInicial}
                  onChange={(e) => setKmInicial(e.target.value)}
                  placeholder="0"
                />
                <Button onClick={handleSaveKmInicial} size="icon" variant="outline">
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kmFinal">KM Final</Label>
              <div className="flex gap-2">
                <Input
                  id="kmFinal"
                  type="number"
                  value={kmFinal}
                  onChange={(e) => setKmFinal(e.target.value)}
                  placeholder="0"
                />
                <Button onClick={handleSaveKmFinal} size="icon" variant="outline">
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <Label className="text-lg">KM Percorrido:</Label>
              <span className="text-2xl font-bold text-primary">{kmPercorrido} km</span>
            </div>
          </div>

          {editingId && (
            <p className="text-sm text-muted-foreground text-center">
              <Edit2 className="inline h-4 w-4 mr-1" />
              Editando registro existente para esta data
            </p>
          )}
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
                <span className="font-medium">Total KM Percorrido:</span>
                <span className="text-xl font-bold text-primary">{totalKm} km</span>
              </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>KM Inicial</TableHead>
                    <TableHead>KM Final</TableHead>
                    <TableHead>Percorrido</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Nenhum registro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.data), "dd/MM/yyyy")}</TableCell>
                        <TableCell>{record.funcionarioNome}</TableCell>
                        <TableCell>{record.placa}</TableCell>
                        <TableCell>{record.kmInicial ?? "-"}</TableCell>
                        <TableCell>{record.kmFinal ?? "-"}</TableCell>
                        <TableCell className="font-medium">{record.kmPercorrido} km</TableCell>
                        <TableCell>
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            record.status === 'completo' 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          )}>
                            {record.status === 'completo' ? 'Completo' : 'Parcial'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(record.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
