import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { KmRecord, PedagioRecord, RefeicaoRecord } from "@/types";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const addHeader = (doc: jsPDF, title: string, dataInicio?: Date, dataFim?: Date) => {
  // Logo placeholder
  doc.setFillColor(59, 130, 246);
  doc.rect(20, 15, 25, 25, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("KM", 25, 32);
  
  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.text("KM Control", 50, 25);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Controle de Despesas", 50, 33);
  
  // Report title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 20, 55);
  
  // Period
  if (dataInicio && dataFim) {
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    const periodo = `Período: ${format(dataInicio, "dd/MM/yyyy", { locale: ptBR })} a ${format(dataFim, "dd/MM/yyyy", { locale: ptBR })}`;
    doc.text(periodo, 20, 63);
  }
  
  doc.setFontSize(10);
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20, 70);
};

export const generateKmPdf = (
  records: KmRecord[],
  dataInicio?: Date,
  dataFim?: Date,
  totalKm?: number
) => {
  const doc = new jsPDF();
  
  addHeader(doc, "Relatório de Quilometragem", dataInicio, dataFim);
  
  // Vehicle info (from first record)
  if (records.length > 0) {
    const firstRecord = records[0];
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Placa: ${firstRecord.placa}`, 20, 82);
    doc.text(`Proprietário: ${firstRecord.proprietario}`, 20, 88);
    doc.text(`Chapa: ${firstRecord.chapa}`, 20, 94);
  }
  
  // Table
  const tableData = records.map(r => [
    format(new Date(r.data), "dd/MM/yyyy"),
    r.placa,
    r.kmInicial.toString(),
    r.kmFinal.toString(),
    `${r.kmPercorrido} km`
  ]);
  
  autoTable(doc, {
    startY: 100,
    head: [["Data", "Placa", "KM Inicial", "KM Final", "Percorrido"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 }
  });
  
  // Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total KM Percorrido: ${totalKm} km`, 20, finalY);
  
  doc.save(`relatorio-km-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const generatePedagioPdf = (
  records: PedagioRecord[],
  dataInicio?: Date,
  dataFim?: Date,
  total?: number
) => {
  const doc = new jsPDF();
  
  addHeader(doc, "Relatório de Pedágio", dataInicio, dataFim);
  
  // Table
  const tableData = records.map(r => [
    format(new Date(r.data), "dd/MM/yyyy"),
    formatCurrency(r.valor)
  ]);
  
  autoTable(doc, {
    startY: 80,
    head: [["Data", "Valor"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 }
  });
  
  // Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Gasto: ${formatCurrency(total || 0)}`, 20, finalY);
  
  doc.save(`relatorio-pedagio-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const generateRefeicaoPdf = (
  records: RefeicaoRecord[],
  dataInicio?: Date,
  dataFim?: Date,
  total?: number
) => {
  const doc = new jsPDF();
  
  addHeader(doc, "Relatório de Refeição", dataInicio, dataFim);
  
  // Table
  const tableData = records.map(r => [
    format(new Date(r.data), "dd/MM/yyyy"),
    formatCurrency(r.valor)
  ]);
  
  autoTable(doc, {
    startY: 80,
    head: [["Data", "Valor"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 }
  });
  
  // Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Gasto: ${formatCurrency(total || 0)}`, 20, finalY);
  
  doc.save(`relatorio-refeicao-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};
