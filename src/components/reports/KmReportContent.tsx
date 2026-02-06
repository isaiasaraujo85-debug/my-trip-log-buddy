import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { KmRecord, EmpresaConfig } from "@/types";

interface KmReportContentProps {
  records: KmRecord[];
  dataInicio?: Date;
  dataFim?: Date;
  totalKm: number;
  totalValor: number;
  empresaConfig: EmpresaConfig;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export function KmReportContent({
  records,
  dataInicio,
  dataFim,
  totalKm,
  totalValor,
  empresaConfig
}: KmReportContentProps) {
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
      <h2 className="text-lg font-bold mb-2">Relatório de Quilometragem</h2>
      
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
          <div><span className="text-gray-600">Veículo:</span> <strong>{firstRecord.carro}</strong></div>
          <div><span className="text-gray-600">Placa:</span> <strong>{firstRecord.placa}</strong></div>
        </div>
      )}

      {/* Table */}
      <table className="w-full border-collapse mb-4 text-sm">
        <thead>
          <tr className="bg-blue-500 text-white">
            <th className="p-2 text-left border border-blue-600">Data</th>
            <th className="p-2 text-left border border-blue-600">Funcionário</th>
            <th className="p-2 text-left border border-blue-600">Placa</th>
            <th className="p-2 text-right border border-blue-600">KM Inicial</th>
            <th className="p-2 text-right border border-blue-600">KM Final</th>
            <th className="p-2 text-right border border-blue-600">Percorrido</th>
            <th className="p-2 text-right border border-blue-600">Valor</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr key={record.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
              <td className="p-2 border border-gray-300">{format(new Date(record.data), "dd/MM/yyyy")}</td>
              <td className="p-2 border border-gray-300">{record.funcionarioNome}</td>
              <td className="p-2 border border-gray-300">{record.placa}</td>
              <td className="p-2 border border-gray-300 text-right">{record.kmInicial ?? "-"}</td>
              <td className="p-2 border border-gray-300 text-right">{record.kmFinal ?? "-"}</td>
              <td className="p-2 border border-gray-300 text-right">{record.kmPercorrido} km</td>
              <td className="p-2 border border-gray-300 text-right">{formatCurrency(record.valorTotal || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="p-4 bg-gray-100 rounded">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold">Total KM Percorrido:</span>
          <span className="text-xl font-bold text-blue-600">{totalKm} km</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-bold">Valor Total a Receber:</span>
          <span className="text-xl font-bold text-green-600">{formatCurrency(totalValor)}</span>
        </div>
      </div>
    </div>
  );
}
