import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PedagioRecord, EmpresaConfig } from "@/types";
import { parseLocalDate } from "@/utils/dateUtils";
import logoPaulistao from "@/assets/logo-paulistao.jpeg.asset.json";
import { ReportFooter } from "./ReportFooter";

interface PedagioReportContentProps {
  records: PedagioRecord[];
  dataInicio?: Date;
  dataFim?: Date;
  total: number;
  empresaConfig: EmpresaConfig;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const A4_LANDSCAPE = {
  width: '1123px',
  minHeight: '794px',
  padding: '40px',
  fontFamily: 'Arial, sans-serif',
  boxSizing: 'border-box' as const,
  textTransform: 'uppercase' as const,
};

const A4_PORTRAIT = {
  width: '794px',
  minHeight: '1123px',
  padding: '40px',
  fontFamily: 'Arial, sans-serif',
  boxSizing: 'border-box' as const,
  textTransform: 'uppercase' as const,
};

export function PedagioReportContent({ records, dataInicio, dataFim, total, empresaConfig }: PedagioReportContentProps) {
  const firstRecord = records[0];

  const allImages: { date: string; label: string; base64: string; direcao: string }[] = [];
  const sortedRecords = [...records].sort((a, b) => a.data.localeCompare(b.data));
  
  for (const record of sortedRecords) {
    if (record.imagensComprovante) {
      const dateLabel = format(parseLocalDate(record.data), "dd/MM/yyyy");
      for (const img of record.imagensComprovante) {
        allImages.push({
          date: record.data,
          label: `${dateLabel} - PEDÁGIO (${record.direcao === 'ida' ? 'IDA' : 'VOLTA'}): ${formatCurrency(record.valor)}`,
          base64: img.base64,
          direcao: record.direcao,
        });
      }
    }
  }

  // Sort: date asc, ida before volta
  allImages.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.direcao !== b.direcao) return a.direcao === 'ida' ? -1 : 1;
    return 0;
  });

  // Group by date
  const dateGroups = new Map<string, typeof allImages>();
  for (const img of allImages) {
    if (!dateGroups.has(img.date)) dateGroups.set(img.date, []);
    dateGroups.get(img.date)!.push(img);
  }

  const imagePages: typeof allImages[] = [];
  for (const [, imgs] of dateGroups) {
    for (let i = 0; i < imgs.length; i += 2) {
      imagePages.push(imgs.slice(i, i + 2));
    }
  }

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

        <h2 className="text-lg font-bold mb-2">RELATÓRIO DE PEDÁGIO</h2>
        
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
              <th className="p-2 text-left border border-blue-600">DIREÇÃO</th>
              <th className="p-2 text-right border border-blue-600">VALOR</th>
              <th className="p-2 text-left border border-blue-600">OBSERVAÇÃO</th>
            </tr>
          </thead>
          <tbody>
            {sortedRecords.map((record, index) => (
              <tr key={record.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="p-2 border border-gray-300">{format(parseLocalDate(record.data), "dd/MM/yyyy")}</td>
                <td className="p-2 border border-gray-300">{record.funcionarioNome}</td>
                <td className="p-2 border border-gray-300">{record.placa}</td>
                <td className="p-2 border border-gray-300">{record.direcao === 'ida' ? 'IDA' : 'VOLTA'}</td>
                <td className="p-2 border border-gray-300 text-right">{formatCurrency(record.valor)}</td>
                <td className="p-2 border border-gray-300">{record.observacao || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 bg-gray-100 rounded">
          <div className="flex justify-between items-center">
            <span className="font-bold">TOTAL GASTO:</span>
            <span className="text-xl font-bold text-blue-600">{formatCurrency(total)}</span>
          </div>
        </div>
        <ReportFooter />
      </div>

      {imagePages.map((page, pageIndex) => (
        <div key={pageIndex} className="bg-white text-black" style={{ ...A4_LANDSCAPE, display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-300">
            <span className="text-sm font-bold text-gray-600">COMPROVANTES ANEXADOS - PÁGINA {pageIndex + 1}</span>
          </div>
          <div className="flex-1 flex flex-row gap-4 justify-center items-stretch">
            {page.map((img, imgIndex) => (
              <div key={imgIndex} className="flex-1 flex flex-col items-center justify-center border border-gray-300 rounded p-3" style={{ minWidth: 0 }}>
                <p className="text-sm font-semibold text-gray-700 mb-2">{img.label}</p>
                <img src={img.base64} alt={img.label} className="max-w-full h-auto rounded" style={{ maxHeight: '620px', maxWidth: '100%', objectFit: 'contain' }} />
              </div>
            ))}
          </div>
          <ReportFooter />
        </div>
      ))}
    </div>
  );
}
