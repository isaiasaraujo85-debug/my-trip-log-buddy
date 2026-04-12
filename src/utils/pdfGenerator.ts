import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { KmRecord, PedagioRecord, RefeicaoRecord, EmpresaConfig, TipoRefeicao, AttachedImage } from "@/types";
import { parseLocalDate } from "@/utils/dateUtils";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const tipoRefeicaoLabels: Record<TipoRefeicao, string> = {
  cafe: "CAFÉ",
  almoco: "ALMOÇO",
  jantar: "JANTAR",
  outros: "OUTROS"
};

const addHeader = (doc: jsPDF, title: string, empresaConfig?: EmpresaConfig, dataInicio?: Date, dataFim?: Date) => {
  let yPos = 15;
  
  if (empresaConfig?.logoBase64) {
    try {
      doc.addImage(empresaConfig.logoBase64, 'PNG', 20, yPos, 30, 30);
    } catch (e) {
      doc.setFillColor(59, 130, 246);
      doc.rect(20, yPos, 30, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text("KM", 26, yPos + 20);
    }
  } else {
    doc.setFillColor(59, 130, 246);
    doc.rect(20, yPos, 30, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("KM", 26, yPos + 20);
  }
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text((empresaConfig?.nome || "SUA EMPRESA").toUpperCase(), 55, yPos + 12);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text("CONTROLE DE DESPESAS", 55, yPos + 22);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), 20, 55);
  
  if (dataInicio && dataFim) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const periodo = `PERÍODO: ${format(dataInicio, "dd/MM/yyyy", { locale: ptBR })} A ${format(dataFim, "dd/MM/yyyy", { locale: ptBR })}`;
    doc.text(periodo, 20, 63);
  }
  
  doc.setFontSize(10);
  doc.text(`GERADO EM: ${format(new Date(), "dd/MM/yyyy 'ÀS' HH:mm", { locale: ptBR })}`, 20, 70);
};

interface ImageEntry {
  date: string;
  label: string;
  base64: string;
  sortKey: number;
  sortKey2: number;
}

function addAttachmentPages(doc: jsPDF, images: ImageEntry[]) {
  if (images.length === 0) return;

  // Sort: date asc, sortKey asc, sortKey2 asc
  images.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
    return a.sortKey2 - b.sortKey2;
  });

  // Group by date
  const dateGroups = new Map<string, ImageEntry[]>();
  for (const img of images) {
    if (!dateGroups.has(img.date)) dateGroups.set(img.date, []);
    dateGroups.get(img.date)!.push(img);
  }

  // Create pages: 2 images per page, same date per page
  const pages: ImageEntry[][] = [];
  for (const [, imgs] of dateGroups) {
    for (let i = 0; i < imgs.length; i += 2) {
      pages.push(imgs.slice(i, i + 2));
    }
  }

  for (const page of pages) {
    doc.addPage("a4", "portrait");
    const pw = doc.internal.pageSize.getWidth();

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("COMPROVANTES ANEXADOS", 20, 20);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 23, pw - 20, 23);

    const imgAreaTop = 30;
    const imgAreaHeight = (doc.internal.pageSize.getHeight() - 50) / 2;

    for (let i = 0; i < page.length; i++) {
      const img = page[i];
      const yStart = imgAreaTop + i * imgAreaHeight;

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(img.label.toUpperCase(), 20, yStart + 5);

      try {
        const maxW = pw - 40;
        const maxH = imgAreaHeight - 20;
        doc.addImage(img.base64, 'JPEG', 20, yStart + 10, maxW, maxH, undefined, 'FAST');
      } catch (e) {
        doc.setFontSize(8);
        doc.setTextColor(200, 0, 0);
        doc.text("ERRO AO CARREGAR IMAGEM", 20, yStart + 20);
      }
    }
  }
}

export const generateKmPdf = (
  records: KmRecord[],
  dataInicio?: Date,
  dataFim?: Date,
  totalKm?: number,
  totalValor?: number,
  empresaConfig?: EmpresaConfig
) => {
  const doc = new jsPDF("landscape");
  
  addHeader(doc, "RELATÓRIO DE QUILOMETRAGEM", empresaConfig, dataInicio, dataFim);
  
  if (records.length > 0) {
    const firstRecord = records[0];
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`FUNCIONÁRIO: ${firstRecord.funcionarioNome}`, 20, 82);
    doc.text(`MATRÍCULA: ${firstRecord.funcionarioMatricula}`, 20, 88);
    doc.text(`VEÍCULO: ${firstRecord.veiculo}`, 160, 82);
    doc.text(`PLACA: ${firstRecord.placa}`, 160, 88);
  }
  
  const tableData = records.map(r => [
    format(parseLocalDate(r.data), "dd/MM/yyyy"),
    r.funcionarioNome,
    r.placa,
    r.kmInicial?.toString() || "-",
    r.kmFinal?.toString() || "-",
    `${r.kmPercorrido} KM`,
    formatCurrency(r.valorTotal || 0)
  ]);
  
  autoTable(doc, {
    startY: 95,
    head: [["DATA", "FUNCIONÁRIO", "PLACA", "KM INICIAL", "KM FINAL", "PERCORRIDO", "VALOR"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 }
  });
  
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`TOTAL KM PERCORRIDO: ${totalKm} KM`, 20, finalY);
  doc.setTextColor(0, 128, 0);
  doc.text(`VALOR TOTAL A RECEBER: ${formatCurrency(totalValor || 0)}`, 20, finalY + 8);
  
  // Add attachment pages
  const images: ImageEntry[] = [];
  const sortedRecords = [...records].sort((a, b) => a.data.localeCompare(b.data));
  for (const record of sortedRecords) {
    const dateLabel = format(parseLocalDate(record.data), "dd/MM/yyyy");
    if (record.imagensKmInicial) {
      for (const img of record.imagensKmInicial) {
        images.push({ date: record.data, label: `${dateLabel} - KM INICIAL: ${record.kmInicial ?? "-"}`, base64: img.base64, sortKey: record.kmInicial ?? 0, sortKey2: 0 });
      }
    }
    if (record.imagensKmFinal) {
      for (const img of record.imagensKmFinal) {
        images.push({ date: record.data, label: `${dateLabel} - KM FINAL: ${record.kmFinal ?? "-"}`, base64: img.base64, sortKey: record.kmFinal ?? 0, sortKey2: 1 });
      }
    }
  }
  addAttachmentPages(doc, images);
  
  doc.save(`relatorio-km-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const generatePedagioPdf = (
  records: PedagioRecord[],
  dataInicio?: Date,
  dataFim?: Date,
  total?: number,
  empresaConfig?: EmpresaConfig
) => {
  const doc = new jsPDF("landscape");
  
  addHeader(doc, "RELATÓRIO DE PEDÁGIO", empresaConfig, dataInicio, dataFim);
  
  if (records.length > 0) {
    const firstRecord = records[0];
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`FUNCIONÁRIO: ${firstRecord.funcionarioNome}`, 20, 82);
    doc.text(`MATRÍCULA: ${firstRecord.funcionarioMatricula}`, 20, 88);
    doc.text(`VEÍCULO: ${firstRecord.veiculo}`, 160, 82);
    doc.text(`PLACA: ${firstRecord.placa}`, 160, 88);
  }
  
  const tableData = records.map(r => [
    format(parseLocalDate(r.data), "dd/MM/yyyy"),
    r.funcionarioNome,
    r.placa,
    r.direcao === 'ida' ? 'IDA' : 'VOLTA',
    formatCurrency(r.valor)
  ]);
  
  autoTable(doc, {
    startY: 95,
    head: [["DATA", "FUNCIONÁRIO", "PLACA", "DIREÇÃO", "VALOR"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 }
  });
  
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`TOTAL GASTO: ${formatCurrency(total || 0)}`, 20, finalY);
  
  // Add attachment pages
  const images: ImageEntry[] = [];
  const sortedRecords = [...records].sort((a, b) => a.data.localeCompare(b.data));
  for (const record of sortedRecords) {
    const dateLabel = format(parseLocalDate(record.data), "dd/MM/yyyy");
    if (record.imagensComprovante) {
      for (const img of record.imagensComprovante) {
        images.push({
          date: record.data,
          label: `${dateLabel} - PEDÁGIO ${record.direcao === 'ida' ? 'IDA' : 'VOLTA'}: ${formatCurrency(record.valor)}`,
          base64: img.base64,
          sortKey: record.direcao === 'ida' ? 0 : 1,
          sortKey2: 0
        });
      }
    }
  }
  addAttachmentPages(doc, images);
  
  doc.save(`relatorio-pedagio-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const generateRefeicaoPdf = (
  records: RefeicaoRecord[],
  dataInicio?: Date,
  dataFim?: Date,
  total?: number,
  empresaConfig?: EmpresaConfig
) => {
  const doc = new jsPDF("landscape");
  
  addHeader(doc, "RELATÓRIO DE REFEIÇÃO", empresaConfig, dataInicio, dataFim);
  
  if (records.length > 0) {
    const firstRecord = records[0];
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`FUNCIONÁRIO: ${firstRecord.funcionarioNome}`, 20, 82);
    doc.text(`MATRÍCULA: ${firstRecord.funcionarioMatricula}`, 20, 88);
  }
  
  const tableData = records.map(r => [
    format(parseLocalDate(r.data), "dd/MM/yyyy"),
    r.funcionarioNome,
    r.funcionarioMatricula,
    tipoRefeicaoLabels[r.tipo] || r.tipo,
    formatCurrency(r.valor)
  ]);
  
  autoTable(doc, {
    startY: 95,
    head: [["DATA", "FUNCIONÁRIO", "CHAPA", "TIPO", "VALOR"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 }
  });
  
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`TOTAL GASTO: ${formatCurrency(total || 0)}`, 20, finalY);
  
  // Add attachment pages
  const images: ImageEntry[] = [];
  const sortedRecords = [...records].sort((a, b) => a.data.localeCompare(b.data));
  for (const record of sortedRecords) {
    const dateLabel = format(parseLocalDate(record.data), "dd/MM/yyyy");
    if (record.imagens) {
      for (const img of record.imagens) {
        images.push({
          date: record.data,
          label: `${dateLabel} - REFEIÇÃO: ${formatCurrency(record.valor)}`,
          base64: img.base64,
          sortKey: record.valor,
          sortKey2: 0
        });
      }
    }
  }
  addAttachmentPages(doc, images);
  
  doc.save(`relatorio-refeicao-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};
