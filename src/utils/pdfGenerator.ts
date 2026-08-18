import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { KmRecord, PedagioRecord, RefeicaoRecord, TransporteRecord, HospedagemRecord, EmpresaConfig, TipoRefeicao, TipoHospedagem, AttachedImage, Movimento } from "@/types";
import { parseLocalDate } from "@/utils/dateUtils";
import { downloadBase64 } from "@/utils/downloadHelper";
import { tipoTransporteLabels } from "@/components/TransporteSelect";
import { logoPaulistaoBase64 } from "@/assets/logoPaulistaoBase64";

function savePdf(doc: jsPDF, filename: string) {
  // Gera o PDF como data URL base64 e usa o helper compatível com WebView.
  const dataUri = doc.output("datauristring");
  // jsPDF inclui ;filename=... no datauristring — limpamos para um data URL puro.
  const cleaned = dataUri.replace(/;filename=[^;,]+/, "");
  void downloadBase64(cleaned, filename, "application/pdf");
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const tipoRefeicaoLabels: Record<TipoRefeicao, string> = {
  nenhum: "NENHUM",
  cafe: "CAFÉ",
  almoco: "ALMOÇO",
  jantar: "JANTAR",
  outros: "OUTROS"
};

const tipoHospedagemLabels: Record<TipoHospedagem, string> = {
  nenhum: "Nenhum",
  hotel: "HOTEL",
  airbnb: "AIRBNB",
  pousada: "POUSADA",
  outros: "OUTROS"
};

const addHeader = (doc: jsPDF, title: string, empresaConfig?: EmpresaConfig, dataInicio?: Date, dataFim?: Date) => {
  let yPos = 15;
  
  try {
    doc.addImage(empresaConfig?.logoBase64 || logoPaulistaoBase64, 'JPEG', 20, yPos, 60, 20);
  } catch (e) {
    doc.setFillColor(59, 130, 246);
    doc.rect(20, yPos, 60, 20, "F");
  }

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text((empresaConfig?.nome || "PAULISTÃO ATACADISTA").toUpperCase(), 85, yPos + 12);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text("CONTROLE DE DESPESAS", 85, yPos + 22);
  
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

const CREDITO = "APLICATIVO DESENVOLVIDO POR ISAIAS DE ARAUJO 08/2026";

function addFooterAllPages(doc: jsPDF) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(CREDITO, pw / 2, ph - 6, { align: "center" });
  }
}

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
    doc.addPage("a4", "landscape");
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("COMPROVANTES ANEXADOS", 15, 15);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 18, pw - 15, 18);

    // 2 imagens lado a lado em paisagem
    const margin = 15;
    const gap = 10;
    const colWidth = (pw - margin * 2 - gap) / 2;
    const yTop = 25;
    const labelHeight = 8;
    const imgHeight = ph - yTop - labelHeight - margin;

    for (let i = 0; i < page.length; i++) {
      const img = page[i];
      const xStart = margin + i * (colWidth + gap);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(img.label.toUpperCase(), xStart, yTop);

      try {
        doc.addImage(img.base64, 'JPEG', xStart, yTop + 4, colWidth, imgHeight, undefined, 'FAST');
      } catch (e) {
        doc.setFontSize(8);
        doc.setTextColor(200, 0, 0);
        doc.text("ERRO AO CARREGAR IMAGEM", xStart, yTop + 20);
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
  }
  
  const tableData = records.map(r => [
    format(parseLocalDate(r.data), "dd/MM/yyyy"),
    r.veiculo,
    r.placa,
    r.kmInicial?.toString() || "-",
    r.kmFinal?.toString() || "-",
    `${r.kmPercorrido} KM`,
    formatCurrency(r.valorTotal || 0),
    r.observacao || "-"
  ]);
  
  autoTable(doc, {
    startY: 95,
    head: [["DATA", "VEÍCULO", "PLACA", "KM INICIAL", "KM FINAL", "PERCORRIDO", "VALOR", "OBSERVAÇÃO"]],
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
  
  addFooterAllPages(doc);
  savePdf(doc, `relatorio-km-${format(new Date(), "yyyy-MM-dd")}.pdf`);
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
  }
  
  const tableData = records.map(r => [
    format(parseLocalDate(r.data), "dd/MM/yyyy"),
    r.veiculo,
    r.placa,
    r.direcao === 'ida' ? 'IDA' : 'VOLTA',
    formatCurrency(r.valor),
    r.observacao || "-"
  ]);
  
  autoTable(doc, {
    startY: 95,
    head: [["DATA", "VEÍCULO", "PLACA", "DESLOCAMENTO", "VALOR", "OBSERVAÇÃO"]],
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
  
  addFooterAllPages(doc);
  savePdf(doc, `relatorio-pedagio-${format(new Date(), "yyyy-MM-dd")}.pdf`);
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
    tipoRefeicaoLabels[r.tipo] || r.tipo,
    formatCurrency(r.valor),
    r.observacao || "-"
  ]);
  
  autoTable(doc, {
    startY: 95,
    head: [["DATA", "REFEIÇÃO", "VALOR", "OBSERVAÇÃO"]],
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
  
  addFooterAllPages(doc);
  savePdf(doc, `relatorio-refeicao-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const generateTransportePdf = (
  records: TransporteRecord[],
  dataInicio?: Date,
  dataFim?: Date,
  total?: number,
  empresaConfig?: EmpresaConfig
) => {
  const doc = new jsPDF("landscape");

  addHeader(doc, "RELATÓRIO DE TRANSPORTE", empresaConfig, dataInicio, dataFim);

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
    (tipoTransporteLabels[r.transporte] || r.transporte).toUpperCase(),
    r.direcao === 'ida' ? 'IDA' : 'VOLTA',
    formatCurrency(r.valor),
    r.observacao || "-"
  ]);

  autoTable(doc, {
    startY: 95,
    head: [["DATA", "TRANSPORTE", "DESLOCAMENTO", "VALOR", "OBSERVAÇÃO"]],
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

  const images: ImageEntry[] = [];
  const sortedRecords = [...records].sort((a, b) => a.data.localeCompare(b.data));
  for (const record of sortedRecords) {
    const dateLabel = format(parseLocalDate(record.data), "dd/MM/yyyy");
    if (record.imagensComprovante) {
      for (const img of record.imagensComprovante) {
        images.push({
          date: record.data,
          label: `${dateLabel} - TRANSPORTE ${record.direcao === 'ida' ? 'IDA' : 'VOLTA'}: ${formatCurrency(record.valor)}`,
          base64: img.base64,
          sortKey: record.direcao === 'ida' ? 0 : 1,
          sortKey2: 0
        });
      }
    }
  }
  addAttachmentPages(doc, images);

  addFooterAllPages(doc);
  savePdf(doc, `relatorio-transporte-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const generateHospedagemPdf = (
  records: HospedagemRecord[],
  dataInicio?: Date,
  dataFim?: Date,
  total?: number,
  empresaConfig?: EmpresaConfig
) => {
  const doc = new jsPDF("landscape");

  addHeader(doc, "RELATÓRIO DE HOSPEDAGEM", empresaConfig, dataInicio, dataFim);

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
    tipoHospedagemLabels[r.tipo] || r.tipo,
    formatCurrency(r.valor),
    r.observacao || "-"
  ]);

  autoTable(doc, {
    startY: 95,
    head: [["DATA", "HOSPEDAGEM", "VALOR", "OBSERVAÇÃO"]],
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

  const images: ImageEntry[] = [];
  const sortedRecords = [...records].sort((a, b) => a.data.localeCompare(b.data));
  for (const record of sortedRecords) {
    const dateLabel = format(parseLocalDate(record.data), "dd/MM/yyyy");
    if (record.imagens) {
      for (const img of record.imagens) {
        images.push({
          date: record.data,
          label: `${dateLabel} - HOSPEDAGEM: ${formatCurrency(record.valor)}`,
          base64: img.base64,
          sortKey: record.valor,
          sortKey2: 0
        });
      }
    }
  }
  addAttachmentPages(doc, images);

  addFooterAllPages(doc);
  savePdf(doc, `relatorio-hospedagem-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const generateFinanceiroPdf = (
  movimentos: Movimento[],
  dataInicio?: Date,
  dataFim?: Date,
  totalEntradas?: number,
  totalSaidas?: number,
  saldo?: number,
  empresaConfig?: EmpresaConfig,
  funcionarioNome?: string,
  funcionarioMatricula?: string
) => {
  const doc = new jsPDF("landscape");

  addHeader(doc, "EXTRATO FINANCEIRO", empresaConfig, dataInicio, dataFim);

  if (funcionarioNome) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`FUNCIONÁRIO: ${funcionarioNome.toUpperCase()}`, 20, 78);
    if (funcionarioMatricula) {
      doc.text(`MATRÍCULA: ${funcionarioMatricula.toUpperCase()}`, 20, 83);
    }
  }

  const tableData = movimentos.map(m => [
    format(parseLocalDate(m.data), "dd/MM/yyyy"),
    m.tipo === "entrada" ? "ENTRADA" : "SAÍDA",
    m.categoria,
    m.tipo === "entrada" ? formatCurrency(m.valor) : "-",
    m.tipo === "entrada" ? (m.formaEntrada || "-") : "-",
    m.tipo === "saida" ? formatCurrency(m.valor) : "-",
    m.descricao || "-"
  ]);

  autoTable(doc, {
    startY: funcionarioMatricula ? 90 : 85,
    head: [["DATA", "TIPO", "CATEGORIA", "ENTRADA", "FORMA DE ENTRADA", "SAÍDA", "DESCRIÇÃO"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 }
  });


  let finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`TOTAL DE ENTRADAS: ${formatCurrency(totalEntradas || 0)}`, 20, finalY);
  finalY += 6;
  doc.text(`TOTAL DE SAÍDAS: ${formatCurrency(totalSaidas || 0)}`, 20, finalY);
  finalY += 8;
  doc.setFontSize(13);
  if ((saldo || 0) < 0) doc.setTextColor(220, 38, 38);
  else doc.setTextColor(37, 99, 235);
  doc.text(`SALDO: ${formatCurrency(saldo || 0)}`, 20, finalY);

  addFooterAllPages(doc);
  savePdf(doc, `relatorio-financeiro-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};
