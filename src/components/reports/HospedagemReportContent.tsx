import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { HospedagemRecord, EmpresaConfig, TipoHospedagem } from "@/types";
import { parseLocalDate } from "@/utils/dateUtils";

interface HospedagemReportContentProps {
  records: HospedagemRecord[];
  dataInicio?: Date;
  dataFim?: Date;
  total: number;
  empresaConfig: EmpresaConfig;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const tipoHospedagemLabels: Record<TipoHospedagem, string> = {
  nenhum: "Nenhum",
  hotel: "HOTEL",
  airbnb: "AIRBNB",
  pousada: "POUSADA",
  outros: "OUTROS"
};

const A4_LANDSCAPE = {
  width: '1123px',
  minHeight: '794px',
  padding: '40px',
  fontFamily: 'Arial, sans-serif',
  boxSizing: 'border-box' as const,
  textTransform: 'uppercase' as const,
};

export function HospedagemReportContent({ records, dataInicio, dataFim, total, empresaConfig }: HospedagemReportContentProps) {
  const firstRecord = records[0];

  const allImages: { date: string; label: string; base64: string }[] = [];
  const sortedRecords = [...records].sort((a, b) => a.data.localeCompare(b.data));

  for (const record of sortedRecords) {
    if (record.imagens) {
      const dateLabel = format(parseLocalDate(record.data), "dd/MM/yyyy");
      for (const img of record.imagens) {
        allImages.push({ date: record.data, label: `${dateLabel} - HOSPEDAGEM: ${formatCurrency(record.valor)}`, base64: img.base64 });
      }
    }
  }

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
          {empresaConfig.logoBase64 ? (
            <img src={empresaConfig.logoBase64} alt="Logo" className="object-contain" style={{ width: '400px', height: '64px' }} />
          ) : (
            <div className="bg-blue-500 rounded flex items-center justify-center" style={{ width: '400px', height: '64px' }}>
              <span className="text-white font-bold text-xl">KM</span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{(empresaConfig.nome || "SUA EMPRESA").toUpperCase()}</h1>
            <p className="text-gray-600 font-semibold">CONTROLE DE DESPESAS</p>
          </div>
        </div>

        <h2 className="text-lg font-bold mb-2">RELATÓRIO DE HOSPEDAGEM</h2>

        {dataInicio && dataFim && (
          <p className="text-sm text-gray-600 mb-1">PERÍODO: {format(dataInicio, "dd/MM/yyyy", { locale: ptBR })} A {format(dataFim, "dd/MM/yyyy", { locale: ptBR })}</p>
        )}
        <p className="text-sm text-gray-600 mb-4">GERADO EM: {format(new Date(), "dd/MM/yyyy 'ÀS' HH:mm", { locale: ptBR })}</p>

        {firstRecord && (
          <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-100 rounded text-sm">
            <div><span className="text-gray-600">FUNCIONÁRIO:</span> <strong>{firstRecord.funcionarioNome}</strong></div>
            <div><span className="text-gray-600">MATRÍCULA:</span> <strong>{firstRecord.funcionarioMatricula}</strong></div>
          </div>
        )}

        <table className="w-full border-collapse mb-4 text-sm">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="p-2 text-left border border-blue-600">DATA</th>
              <th className="p-2 text-left border border-blue-600">FUNCIONÁRIO</th>
              <th className="p-2 text-left border border-blue-600">MATRÍCULA</th>
              <th className="p-2 text-left border border-blue-600">TIPO</th>
              <th className="p-2 text-right border border-blue-600">VALOR</th>
              <th className="p-2 text-left border border-blue-600">OBSERVAÇÃO</th>
            </tr>
          </thead>
          <tbody>
            {sortedRecords.map((record, index) => (
              <tr key={record.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="p-2 border border-gray-300">{format(parseLocalDate(record.data), "dd/MM/yyyy")}</td>
                <td className="p-2 border border-gray-300">{record.funcionarioNome}</td>
                <td className="p-2 border border-gray-300">{record.funcionarioMatricula}</td>
                <td className="p-2 border border-gray-300">{tipoHospedagemLabels[record.tipo] || record.tipo}</td>
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
        </div>
      ))}
    </div>
  );
}
