import { useState } from "react";
import { format } from "date-fns";
import { Plus, Trash2, Wallet, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DepositoRecord, EmpresaConfig, Funcionario, OrigemEntrada, TipoEntrada } from "@/types";
import { FuncionarioSelect } from "./FuncionarioSelect";
import { origemLabels, origemOrdem, tipoEntradaLabels, tipoEntradaOrdem } from "@/utils/financeiroLabels";
import { DatePickerField } from "./DatePickerField";
import { CurrencyInput } from "./CurrencyInput";
import { ObservacaoField } from "./ObservacaoField";
import { ReportExportButton } from "./reports/ReportExportButton";
import { FinanceiroReportContent } from "./reports/FinanceiroReportContent";
import { parseLocalDate } from "@/utils/dateUtils";
import { generateFinanceiroPdf } from "@/utils/pdfGenerator";

const formatCurrencyDisplay = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function FinanceiroTab() {
  const [empresaConfig] = useLocalStorage<EmpresaConfig>("empresa-config", { nome: "" });
  const { depositos, setDepositos, movimentos } = useFinanceiro();

  const [funcionario, setFuncionario] = useState<Funcionario | undefined>();
  const [data, setData] = useState<Date | undefined>(new Date());
  const [valor, setValor] = useState("");
  const [tipoEntrada, setTipoEntrada] = useState<TipoEntrada>("nenhum");
  const [origem, setOrigem] = useState<OrigemEntrada>("nenhum");
  const [observacao, setObservacao] = useState("");

  const [dataInicio, setDataInicio] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [showReport, setShowReport] = useState(false);

  const handleAdd = () => {
    if (!data || !valor) return;
    const novo: DepositoRecord = {
      id: crypto.randomUUID(),
      data: format(data, "yyyy-MM-dd"),
      valor: parseFloat(valor),
      tipoEntrada,
      origem,
      observacao: observacao.trim() || undefined,
      funcionarioId: funcionario?.id,
      funcionarioNome: funcionario?.nome,
      funcionarioMatricula: funcionario?.matricula,
    };
    setDepositos([...depositos, novo]);
    setValor("");
    setTipoEntrada("nenhum");
    setOrigem("nenhum");
    setObservacao("");
  };


  const handleDeleteDeposito = (id: string) => {
    setDepositos(depositos.filter((d) => d.id !== id));
  };

  const filteredMovimentos = movimentos.filter((m) => {
    if (!dataInicio || !dataFim) return true;
    const d = parseLocalDate(m.data);
    return d >= dataInicio && d <= dataFim;
  });

  const entradas = filteredMovimentos.filter((m) => m.tipo === "entrada").reduce((s, m) => s + m.valor, 0);
  const saidas = filteredMovimentos.filter((m) => m.tipo === "saida").reduce((s, m) => s + m.valor, 0);
  const saldoFiltrado = entradas - saidas;

  const handleGeneratePdf = () => {
    generateFinanceiroPdf(filteredMovimentos, dataInicio, dataFim, entradas, saidas, saldoFiltrado, empresaConfig, funcionario?.nome);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-5 w-5 flex-shrink-0" />
            Lançamento Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FuncionarioSelect value={funcionario?.id || ""} onSelect={setFuncionario} />
          <DatePickerField label="Data" value={data} onChange={setData} />
          <div className="space-y-1">
            <Label htmlFor="valor-financeiro" className="text-xs">Valor (R$)</Label>
            <CurrencyInput id="valor-financeiro" value={valor} onChange={setValor} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Forma de Entrada</Label>

            <Select value={tipoEntrada} onValueChange={(v) => setTipoEntrada(v as TipoEntrada)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tipoEntradaOrdem.map((t) => (
                  <SelectItem key={t} value={t}>{t === "nenhum" ? "Nenhum" : tipoEntradaLabels[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Origem</Label>
            <Select value={origem} onValueChange={(v) => setOrigem(v as OrigemEntrada)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {origemOrdem.map((o) => (
                  <SelectItem key={o} value={o}>{origemLabels[o]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ObservacaoField id="observacao-financeiro" value={observacao} onChange={setObservacao} />
          <Button onClick={handleAdd} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Valor
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Extrato de Gastos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <DatePickerField label="Data Inicial" value={dataInicio} onChange={setDataInicio} placeholder="Início" />
            <DatePickerField label="Data Final" value={dataFim} onChange={setDataFim} placeholder="Fim" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-muted">
              <p className="text-[10px] uppercase text-muted-foreground">Entrada</p>
              <p className="text-sm font-bold text-blue-600">{formatCurrencyDisplay(entradas)}</p>
            </div>
            <div className="p-2 rounded-lg bg-muted">
              <p className="text-[10px] uppercase text-muted-foreground">Saída</p>
              <p className="text-sm font-bold text-destructive">{formatCurrencyDisplay(saidas)}</p>
            </div>
            <div className="p-2 rounded-lg bg-muted">
              <p className="text-[10px] uppercase text-muted-foreground">Saldo</p>
              <p className={`text-sm font-bold ${saldoFiltrado < 0 ? "text-destructive" : "text-blue-600"}`}>
                {formatCurrencyDisplay(saldoFiltrado)}
              </p>
            </div>
          </div>

          <ReportExportButton filename="relatorio-financeiro" disabled={filteredMovimentos.length === 0} onGeneratePdf={handleGeneratePdf}>
            <FinanceiroReportContent
              movimentos={filteredMovimentos}
              dataInicio={dataInicio}
              dataFim={dataFim}
              totalEntradas={entradas}
              totalSaidas={saidas}
              saldo={saldoFiltrado}
              empresaConfig={empresaConfig}
              funcionarioNome={funcionario?.nome}
            />
          </ReportExportButton>

          <div className="space-y-2">
            {filteredMovimentos.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">Nenhuma movimentação encontrada</p>
            ) : (
              filteredMovimentos.map((m) => (
                <div key={m.id} className="flex items-start gap-2 p-2 border rounded-lg">
                  {m.tipo === "entrada" ? (
                    <ArrowUpCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="font-bold uppercase">{m.categoria}</span>
                      <span className={`font-bold ${m.tipo === "entrada" ? "text-blue-600" : "text-destructive"}`}>
                        {m.tipo === "entrada" ? "+" : "-"} {formatCurrencyDisplay(m.valor)}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      {format(parseLocalDate(m.data), "dd/MM/yyyy")} · {m.descricao || "-"}
                    </p>
                  </div>
                  {m.isDeposito && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteDeposito(m.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
