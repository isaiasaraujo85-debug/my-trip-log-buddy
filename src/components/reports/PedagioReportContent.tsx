import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PedagioRecord, EmpresaConfig } from "@/types";
import { parseLocalDate } from "@/utils/dateUtils";

interface PedagioReportContentProps {
  records: PedagioRecord[];
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

const A4_STYLE = {
  width: '1123px',
  minHeight: '794px',
  padding: '40px',
  fontFamily: 'Arial, sans-serif',
  boxSizing: 'border-box' as const,
};

export function PedagioReportContent({
  records,
  dataInicio,
  dataFim,
  total,
  empresaConfig
}: PedagioReportContentProps) {
  const firstRecord = records[0];

  const allImages: { label: string; base64: string }[] = [];
  const sortedRecords = [...records].sort((a, b) => a.data.localeCompare(b.data));
  
  for (const record of sortedRecords) {
    if (record.imagensComprovante) {
      const dateLabel = format(parseLocalDate(record.data), "dd/MM/yyyy");
      for (const img of record.imagensComprovante) {
        allImages.push({
          label: `${dateLabel} - Pedágio: ${formatCurrency(record.valor)}`,
          base64: img.base64,
        });
      }
    }
  }

  const imagePages: typeof allImages[] = [];
  for (let i = 0; i < allImages.length; i += 2) {
    imagePages.push(allImages.slice(i, i + 2));
  }

  return (
    <div>
      <div className="bg-white text-black" style={A4_STYLE}>
        <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-blue-500">
          {empresaConfig.logoBase64 ? (
            <img src={empresaConfig.logoBase64} alt="Logo" className="w-32 h-16 object-contain" />
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

        <h2 className="text-lg font-bold mb-2">Relatório de Pedágio</h2>
        
        {dataInicio && dataFim && (
          <p className="text-sm text-gray-600 mb-1">
            Período: {format(dataInicio, "dd/MM/yyyy", { locale: ptBR })} a {format(dataFim, "dd/MM/yyyy", { locale: ptBR })}
          </p>
        )}
        <p className="text-sm text-gray-600 mb-4">
          Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </p>

        {firstRecord && (
          <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-100 rounded text-sm">
            <div><span className="text-gray-600">Funcionário:</span> <strong>{firstRecord.funcionarioNome}</strong></div>
            <div><span className="text-gray-600">Chapa:</span> <strong>{firstRecord.funcionarioChapa}</strong></div>
            <div><span className="text-gray-600">Veículo:</span> <strong>{firstRecord.carro}</strong></div>
            <div><span className="text-gray-600">Placa:</span> <strong>{firstRecord.placa}</strong></div>
          </div>
        )}

        <table className="w-full border-collapse mb-4 text-sm">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="p-2 text-left border border-blue-600">Data</th>
              <th className="p-2 text-left border border-blue-600">Funcionário</th>
              <th className="p-2 text-left border border-blue-600">Placa</th>
              <th className="p-2 text-right border border-blue-600">Valor</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="p-2 border border-gray-300">{format(parseLocalDate(record.data), "dd/MM/yyyy")}</td>
                <td className="p-2 border border-gray-300">{record.funcionarioNome}</td>
                <td className="p-2 border border-gray-300">{record.placa}</td>
                <td className="p-2 border border-gray-300 text-right">{formatCurrency(record.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 bg-gray-100 rounded">
          <div className="flex justify-between items-center">
            <span className="font-bold">Total Gasto:</span>
            <span className="text-xl font-bold text-blue-600">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {imagePages.map((page, pageIndex) => (
        <div key={pageIndex} className="bg-white text-black" style={{ ...A4_STYLE, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-300">
            <span className="text-sm font-bold text-gray-600">Comprovantes Anexados - Página {pageIndex + 1}</span>
          </div>
          <div className="flex-1 flex flex-col gap-4 justify-center">
            {page.map((img, imgIndex) => (
              <div key={imgIndex} className="flex-1 flex flex-col items-center justify-center border border-gray-300 rounded p-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">{img.label}</p>
                <img src={img.base64} alt={img.label} className="max-w-full h-auto rounded" style={{ maxHeight: '300px', objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
