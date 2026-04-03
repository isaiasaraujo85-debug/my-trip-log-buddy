import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { KmRecord, EmpresaConfig } from "@/types";
import { parseLocalDate } from "@/utils/dateUtils";

interface KmReportContentProps {
  records: KmRecord[];
  dataInicio?: Date;
  dataFim?: Date;
  totalKm: number;
  totalValor: number;
  empresaConfig: EmpresaConfig;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const A4_STYLE = {
  width: '1123px',
  minHeight: '794px',
  padding: '40px',
  fontFamily: 'Arial, sans-serif',
  boxSizing: 'border-box' as const,
  textTransform: 'uppercase' as const,
};

export function KmReportContent({ records, dataInicio, dataFim, totalKm, totalValor, empresaConfig }: KmReportContentProps) {
  const firstRecord = records[0];

  const allImages: { date: string; label: string; base64: string; sortKey: string }[] = [];
  const sortedRecords = [...records].sort((a, b) => a.data.localeCompare(b.data));
  
  for (const record of sortedRecords) {
    const dateLabel = format(parseLocalDate(record.data), "dd/MM/yyyy");
    if (record.imagensKmInicial) {
      for (const img of record.imagensKmInicial) {
        allImages.push({ date: dateLabel, label: `${dateLabel} - KM INICIAL: ${record.kmInicial ?? "-"}`, base64: img.base64, sortKey: record.data + '_0' });
      }
    }
    if (record.imagensKmFinal) {
      for (const img of record.imagensKmFinal) {
        allImages.push({ date: dateLabel, label: `${dateLabel} - KM FINAL: ${record.kmFinal ?? "-"}`, base64: img.base64, sortKey: record.data + '_1' });
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
            <h1 className="text-xl font-bold">{(empresaConfig.nome || "Sua Empresa").toUpperCase()}</h1>
            <p className="text-gray-600 font-semibold">CONTROLE DE DESPESAS</p>
          </div>
        </div>

        <h2 className="text-lg font-bold mb-2">RELATÓRIO DE QUILOMETRAGEM</h2>
        
        {dataInicio && dataFim && (
          <p className="text-sm text-gray-600 mb-1">PERÍODO: {format(dataInicio, "dd/MM/yyyy", { locale: ptBR })} A {format(dataFim, "dd/MM/yyyy", { locale: ptBR })}</p>
        )}
        <p className="text-sm text-gray-600 mb-4">GERADO EM: {format(new Date(), "dd/MM/yyyy 'ÀS' HH:mm", { locale: ptBR })}</p>

        {firstRecord && (
          <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-100 rounded text-sm">
            <div><span className="text-gray-600">FUNCIONÁRIO:</span> <strong>{firstRecord.funcionarioNome}</strong></div>
            <div><span className="text-gray-600">MATRÍCULA:</span> <strong>{firstRecord.funcionarioMatricula}</strong></div>
            <div><span className="text-gray-600">VEÍCULO:</span> <strong>{firstRecord.veiculo}</strong></div>
            <div><span className="text-gray-600">PLACA:</span> <strong>{firstRecord.placa}</strong></div>
          </div>
        )}

        <table className="w-full border-collapse mb-4 text-sm">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="p-2 text-left border border-blue-600">DATA</th>
              <th className="p-2 text-left border border-blue-600">FUNCIONÁRIO</th>
              <th className="p-2 text-left border border-blue-600">PLACA</th>
              <th className="p-2 text-right border border-blue-600">KM INICIAL</th>
              <th className="p-2 text-right border border-blue-600">KM FINAL</th>
              <th className="p-2 text-right border border-blue-600">PERCORRIDO</th>
              <th className="p-2 text-right border border-blue-600">VALOR</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="p-2 border border-gray-300">{format(parseLocalDate(record.data), "dd/MM/yyyy")}</td>
                <td className="p-2 border border-gray-300">{record.funcionarioNome}</td>
                <td className="p-2 border border-gray-300">{record.placa}</td>
                <td className="p-2 border border-gray-300 text-right">{record.kmInicial ?? "-"}</td>
                <td className="p-2 border border-gray-300 text-right">{record.kmFinal ?? "-"}</td>
                <td className="p-2 border border-gray-300 text-right">{record.kmPercorrido} KM</td>
                <td className="p-2 border border-gray-300 text-right">{formatCurrency(record.valorTotal || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 bg-gray-100 rounded">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold">TOTAL KM PERCORRIDO:</span>
            <span className="text-xl font-bold text-blue-600">{totalKm} KM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold">VALOR TOTAL A RECEBER:</span>
            <span className="text-xl font-bold text-green-600">{formatCurrency(totalValor)}</span>
          </div>
        </div>
      </div>

      {imagePages.map((page, pageIndex) => (
        <div key={pageIndex} className="bg-white text-black" style={{ ...A4_STYLE, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-300">
            <span className="text-sm font-bold text-gray-600">COMPROVANTES ANEXADOS - PÁGINA {pageIndex + 1}</span>
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
