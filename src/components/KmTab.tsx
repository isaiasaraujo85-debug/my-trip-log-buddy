import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Save, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { KmRecord } from "@/types";
import { generateKmPdf } from "@/utils/pdfGenerator";
import { cn } from "@/lib/utils";

export function KmTab() {
  const { toast } = useToast();
  const [records, setRecords] = useLocalStorage<KmRecord[]>("km-records", []);
  
  const [placa, setPlaca] = useState("");
  const [proprietario, setProprietario] = useState("");
  const [chapa, setChapa] = useState("");
  const [data, setData] = useState<Date | undefined>(new Date());
  const [kmInicial, setKmInicial] = useState("");
  const [kmFinal, setKmFinal] = useState("");
  const [kmPercorrido, setKmPercorrido] = useState(0);
  
  const [dataInicio, setDataInicio] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const inicial = parseFloat(kmInicial) || 0;
    const final = parseFloat(kmFinal) || 0;
    setKmPercorrido(Math.max(0, final - inicial));
  }, [kmInicial, kmFinal]);

  const handleSave = () => {
    if (!placa || !proprietario || !chapa || !data || !kmInicial || !kmFinal) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (kmPercorrido < 0) {
      toast({
        title: "Erro",
        description: "KM final deve ser maior que KM inicial.",
        variant: "destructive"
      });
      return;
    }

    const newRecord: KmRecord = {
      id: crypto.randomUUID(),
      placa,
      proprietario,
      chapa,
      data: format(data, "yyyy-MM-dd"),
      kmInicial: parseFloat(kmInicial),
      kmFinal: parseFloat(kmFinal),
      kmPercorrido
    };

    setRecords([...records, newRecord]);
    
    setKmInicial("");
    setKmFinal("");
    setData(new Date());
    
    toast({
      title: "Sucesso",
      description: "Registro de KM salvo com sucesso!"
    });
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

  const totalKm = filteredRecords.reduce((sum, r) => sum + r.kmPercorrido, 0);

  const handleGeneratePdf = () => {
    if (filteredRecords.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum registro encontrado para o período.",
        variant: "destructive"
      });
      return;
    }
    generateKmPdf(filteredRecords, dataInicio, dataFim, totalKm);
    toast({
      title: "PDF Gerado",
      description: "O relatório foi gerado com sucesso!"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lançamento de KM
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="placa">Placa do Veículo</Label>
              <Input
                id="placa"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                placeholder="ABC-1234"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proprietario">Proprietário</Label>
              <Input
                id="proprietario"
                value={proprietario}
                onChange={(e) => setProprietario(e.target.value)}
                placeholder="Nome do proprietário"
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
              <Input
                id="kmInicial"
                type="number"
                value={kmInicial}
                onChange={(e) => setKmInicial(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kmFinal">KM Final</Label>
              <Input
                id="kmFinal"
                type="number"
                value={kmFinal}
                onChange={(e) => setKmFinal(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <Label className="text-lg">KM Percorrido:</Label>
              <span className="text-2xl font-bold text-primary">{kmPercorrido} km</span>
            </div>
          </div>
          <Button onClick={handleSave} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Salvar KM
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

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>KM Inicial</TableHead>
                    <TableHead>KM Final</TableHead>
                    <TableHead>Percorrido</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhum registro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.data), "dd/MM/yyyy")}</TableCell>
                        <TableCell>{record.placa}</TableCell>
                        <TableCell>{record.kmInicial}</TableCell>
                        <TableCell>{record.kmFinal}</TableCell>
                        <TableCell className="font-medium">{record.kmPercorrido} km</TableCell>
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
