import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefeicaoRecord, EmpresaConfig, TipoRefeicao } from "@/types";

interface RefeicaoReportContentProps {
  records: RefeicaoRecord[];
  dataInicio?: Date;
  dataFim?: Date;
  total: number;
  empresaConfig: EmpresaConfig;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const tipoRefeicaoLabels: Record<TipoRefeicao, string> = {
  cafe: "Café",
  almoco: "Almoço",
  jantar: "Jantar",
  outros: "Outros"
};

export function RefeicaoReportContent({
  records,
  dataInicio,
  dataFim,
  total,
  empresaConfig
}: RefeicaoReportContentProps) {
  const firstRecord = records[0];

  return (
    <div className="bg-white text-black p-6 min-w-[600px]" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-blue-500">
        {empresaConfig.logoBase64 ? (
          <img 
            src={empresaConfig.logoBase64} 
            alt="Logo" 
            className="w-32 h-16 object-contain"
          />
        ) : (
          <div className="w-32 h-16 bg-blue-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xl">KM</span>
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold">{empresaConfig.nome || "Sua Empresa"}</h1>
          <p className="text-gray-600 font-semibold">Controle de Despesas</p>
        </div>
      </div>

      {/* Report Title */}
      <h2 className="text-lg font-bold mb-2">Relatório de Refeição</h2>
      
      {/* Period */}
      {dataInicio && dataFim && (
        <p className="text-sm text-gray-600 mb-1">
          Período: {format(dataInicio, "dd/MM/yyyy", { locale: ptBR })} a {format(dataFim, "dd/MM/yyyy", { locale: ptBR })}
        </p>
      )}
      <p className="text-sm text-gray-600 mb-4">
        Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
      </p>

      {/* Employee Info */}
      {firstRecord && (
        <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-100 rounded text-sm">
          <div><span className="text-gray-600">Funcionário:</span> <strong>{firstRecord.funcionarioNome}</strong></div>
          <div><span className="text-gray-600">Chapa:</span> <strong>{firstRecord.funcionarioChapa}</strong></div>
        </div>
      )}

      {/* Table */}
      <table className="w-full border-collapse mb-4 text-sm">
        <thead>
          <tr className="bg-blue-500 text-white">
            <th className="p-2 text-left border border-blue-600">Data</th>
            <th className="p-2 text-left border border-blue-600">Funcionário</th>
            <th className="p-2 text-left border border-blue-600">Chapa</th>
            <th className="p-2 text-left border border-blue-600">Tipo</th>
            <th className="p-2 text-right border border-blue-600">Valor</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr key={record.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
              <td className="p-2 border border-gray-300">{format(new Date(record.data), "dd/MM/yyyy")}</td>
              <td className="p-2 border border-gray-300">{record.funcionarioNome}</td>
              <td className="p-2 border border-gray-300">{record.funcionarioChapa}</td>
              <td className="p-2 border border-gray-300">{tipoRefeicaoLabels[record.tipo] || record.tipo}</td>
              <td className="p-2 border border-gray-300 text-right">{formatCurrency(record.valor)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div className="p-4 bg-gray-100 rounded">
        <div className="flex justify-between items-center">
          <span className="font-bold">Total Gasto:</span>
          <span className="text-xl font-bold text-blue-600">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
