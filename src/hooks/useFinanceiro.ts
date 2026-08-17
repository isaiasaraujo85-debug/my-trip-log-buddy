import { useLocalStorage } from "@/hooks/useLocalStorage";
import { tipoEntradaLabels, origemLabels } from "@/utils/financeiroLabels";
import {
  DepositoRecord,
  HospedagemRecord,
  KmRecord,
  Movimento,
  PedagioRecord,
  RefeicaoRecord,
  TransporteRecord,
} from "@/types";

export function useFinanceiro() {
  const [depositos, setDepositos] = useLocalStorage<DepositoRecord[]>("financeiro-depositos", []);
  const [kmRecords] = useLocalStorage<KmRecord[]>("km-records", []);
  const [pedagioRecords] = useLocalStorage<PedagioRecord[]>("pedagio-records", []);
  const [hospedagemRecords] = useLocalStorage<HospedagemRecord[]>("hospedagem-records", []);
  const [refeicaoRecords] = useLocalStorage<RefeicaoRecord[]>("refeicao-records", []);
  const [transporteRecords] = useLocalStorage<TransporteRecord[]>("transporte-records", []);

  const movimentos: Movimento[] = [
    ...depositos.map((d) => ({
      id: d.id,
      data: d.data,
      tipo: "entrada" as const,
      categoria: tipoEntradaLabels[d.tipoEntrada || "nenhum"],
      descricao: (d.origem && d.origem !== "nenhum" ? origemLabels[d.origem] : d.observacao) || "ENTRADA DE VALOR",
      valor: d.valor,
      isDeposito: true,
      formaEntrada: tipoEntradaLabels[d.tipoEntrada || "nenhum"],
      origem: d.origem && d.origem !== "nenhum" ? origemLabels[d.origem] : "-",
    })),

    ...kmRecords
      .filter((r) => (r.valorTotal || 0) > 0)
      .map((r) => ({
        id: r.id,
        data: r.data,
        tipo: "saida" as const,
        categoria: "KM",
        descricao: `${r.kmPercorrido} KM${r.placa ? ` - ${r.placa}` : ""}`,
        valor: r.valorTotal || 0,
      })),
    ...pedagioRecords.map((r) => ({
      id: r.id,
      data: r.data,
      tipo: "saida" as const,
      categoria: "PEDÁGIO",
      descricao: r.direcao === "ida" ? "IDA" : "VOLTA",
      valor: r.valor,
    })),
    ...hospedagemRecords.map((r) => ({
      id: r.id,
      data: r.data,
      tipo: "saida" as const,
      categoria: "HOSPEDAGEM",
      descricao: r.tipo.toUpperCase(),
      valor: r.valor,
    })),
    ...refeicaoRecords.map((r) => ({
      id: r.id,
      data: r.data,
      tipo: "saida" as const,
      categoria: "REFEIÇÃO",
      descricao: r.tipo.toUpperCase(),
      valor: r.valor,
    })),
    ...transporteRecords.map((r) => ({
      id: r.id,
      data: r.data,
      tipo: "saida" as const,
      categoria: "TRANSPORTE",
      descricao: `${r.transporte.toUpperCase()} - ${r.direcao === "ida" ? "IDA" : "VOLTA"}`,
      valor: r.valor,
    })),
  ].sort((a, b) => a.data.localeCompare(b.data));

  const totalEntradas = movimentos.filter((m) => m.tipo === "entrada").reduce((s, m) => s + m.valor, 0);
  const totalSaidas = movimentos.filter((m) => m.tipo === "saida").reduce((s, m) => s + m.valor, 0);
  const saldo = totalEntradas - totalSaidas;

  return { depositos, setDepositos, movimentos, totalEntradas, totalSaidas, saldo };
}
