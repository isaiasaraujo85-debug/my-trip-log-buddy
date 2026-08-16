import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EmpresaConfig, Movimento } from "@/types";
import { parseLocalDate } from "@/utils/dateUtils";
import logoPaulistao from "@/assets/logo-paulistao.jpeg.asset.json";
import { ReportFooter } from "./ReportFooter";

interface FinanceiroReportContentProps {
  movimentos: Movimento[];
  dataInicio?: Date;
  dataFim?: Date;
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  empresaConfig: EmpresaConfig;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const A4_LANDSCAPE = {
  width: "1123px",
  minHeight: "794px",
  padding: "40px",
  fontFamily: "Arial, sans-serif",
  boxSizing: "border-box" as const,
  textTransform: "uppercase" as const,
};

export function FinanceiroReportContent({
  movimentos,
  dataInicio,
  dataFim,
  totalEntradas,
  totalSaidas,
  saldo,
  empresaConfig,
}: FinanceiroReportContentProps) {
  return (
    <div>
      <div className="bg-white text-black" style={A4_LANDSCAPE}>
        <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-blue-500">
          <img src={empresaConfig.logoBase64 || logoPaulistao.url} alt="Logo" className="object-fill" style={{ width: '400px', height: '64px' }} />
          <div>
            <h1 className="text-xl font-bold">{(empresaConfig.nome || "PAULISTÃO ATACADISTA").toUpperCase()}</h1>
            <p className="text-gray-600 font-semibold">CONTROLE DE DESPESAS</p>
          </div>
        </div>

        <h2 className="text-lg font-bold mb-2">EXTRATO FINANCEIRO</h2>

        {dataInicio && dataFim && (
          <p className="text-sm text-gray-600 mb-1">
            PERÍODO: {format(dataInicio, "dd/MM/yyyy", { locale: ptBR })} A {format(dataFim, "dd/MM/yyyy", { locale: ptBR })}
          </p>
        )}
        <p className="text-sm text-gray-600 mb-4">GERADO EM: {format(new Date(), "dd/MM/yyyy 'ÀS' HH:mm", { locale: ptBR })}</p>

        <table className="w-full border-collapse mb-4 text-sm">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="p-2 text-left border border-blue-600">DATA</th>
              <th className="p-2 text-left border border-blue-600">TIPO</th>
              <th className="p-2 text-left border border-blue-600">CATEGORIA</th>
              <th className="p-2 text-right border border-blue-600">ENTRADA</th>
              <th className="p-2 text-right border border-blue-600">SAÍDA</th>
              <th className="p-2 text-left border border-blue-600">DESCRIÇÃO</th>
            </tr>
          </thead>
          <tbody>
            {movimentos.map((m, index) => (
              <tr key={m.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="p-2 border border-gray-300">{format(parseLocalDate(m.data), "dd/MM/yyyy")}</td>
                <td className="p-2 border border-gray-300">{m.tipo === "entrada" ? "ENTRADA" : "SAÍDA"}</td>
                <td className="p-2 border border-gray-300">{m.categoria}</td>
                <td className="p-2 border border-gray-300 text-right">{m.tipo === "entrada" ? formatCurrency(m.valor) : "-"}</td>
                <td className="p-2 border border-gray-300 text-right">{m.tipo === "saida" ? formatCurrency(m.valor) : "-"}</td>
                <td className="p-2 border border-gray-300">{m.descricao || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 bg-gray-100 rounded space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-bold">TOTAL DE ENTRADAS:</span>
            <span className="font-bold text-blue-600">{formatCurrency(totalEntradas)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold">TOTAL DE SAÍDAS:</span>
            <span className="font-bold text-red-600">{formatCurrency(totalSaidas)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-300">
            <span className="font-bold">SALDO:</span>
            <span className={`text-xl font-bold ${saldo < 0 ? "text-red-600" : "text-blue-600"}`}>{formatCurrency(saldo)}</span>
          </div>
        </div>

        <ReportFooter />
      </div>
    </div>
  );
}
