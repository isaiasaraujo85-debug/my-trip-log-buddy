import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { KmRecord, PedagioRecord, RefeicaoRecord, EmpresaConfig, TipoRefeicao } from "@/types";

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

const addHeader = (doc: jsPDF, title: string, empresaConfig?: EmpresaConfig, dataInicio?: Date, dataFim?: Date) => {
  let yPos = 15;
  
  // Logo - proportional size (30x30)
  if (empresaConfig?.logoBase64) {
    try {
      doc.addImage(empresaConfig.logoBase64, 'PNG', 20, yPos, 30, 30);
    } catch (e) {
      // Fallback to default logo
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
  
  // Company name - adjusted position for smaller logo
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(empresaConfig?.nome || "Sua Empresa", 55, yPos + 12);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text("Controle de Despesas", 55, yPos + 22);
  
  // Report title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, 55);
  
  // Period
  if (dataInicio && dataFim) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
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
  totalKm?: number,
  totalValor?: number,
  empresaConfig?: EmpresaConfig
) => {
  const doc = new jsPDF();
  
  addHeader(doc, "Relatório de Quilometragem", empresaConfig, dataInicio, dataFim);
  
  // Employee info (from first record)
  if (records.length > 0) {
    const firstRecord = records[0];
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Funcionário: ${firstRecord.funcionarioNome}`, 20, 82);
    doc.text(`Matrícula: ${firstRecord.funcionarioMatricula}`, 20, 88);
    doc.text(`Veículo: ${firstRecord.veiculo}`, 120, 82);
    doc.text(`Placa: ${firstRecord.placa}`, 120, 88);
  }
  
  // Table
  const tableData = records.map(r => [
    format(new Date(r.data), "dd/MM/yyyy"),
    r.funcionarioNome,
    r.placa,
    r.kmInicial?.toString() || "-",
    r.kmFinal?.toString() || "-",
    `${r.kmPercorrido} km`,
    formatCurrency(r.valorTotal || 0)
  ]);
  
  autoTable(doc, {
    startY: 95,
    head: [["Data", "Funcionário", "Placa", "KM Inicial", "KM Final", "Percorrido", "Valor"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 }
  });
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total KM Percorrido: ${totalKm} km`, 20, finalY);
  doc.setTextColor(0, 128, 0);
  doc.text(`Valor Total a Receber: ${formatCurrency(totalValor || 0)}`, 20, finalY + 8);
  
  doc.save(`relatorio-km-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const generatePedagioPdf = (
  records: PedagioRecord[],
  dataInicio?: Date,
  dataFim?: Date,
  total?: number,
  empresaConfig?: EmpresaConfig
) => {
  const doc = new jsPDF();
  
  addHeader(doc, "Relatório de Pedágio", empresaConfig, dataInicio, dataFim);
  
  // Employee info (from first record)
  if (records.length > 0) {
    const firstRecord = records[0];
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Funcionário: ${firstRecord.funcionarioNome}`, 20, 82);
    doc.text(`Matrícula: ${firstRecord.funcionarioMatricula}`, 20, 88);
    doc.text(`Veículo: ${firstRecord.veiculo}`, 120, 82);
    doc.text(`Placa: ${firstRecord.placa}`, 120, 88);
  }
  
  // Table
  const tableData = records.map(r => [
    format(new Date(r.data), "dd/MM/yyyy"),
    r.funcionarioNome,
    r.placa,
    formatCurrency(r.valor)
  ]);
  
  autoTable(doc, {
    startY: 95,
    head: [["Data", "Funcionário", "Placa", "Valor"]],
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
  total?: number,
  empresaConfig?: EmpresaConfig
) => {
  const doc = new jsPDF();
  
  addHeader(doc, "Relatório de Refeição", empresaConfig, dataInicio, dataFim);
  
  // Employee info (from first record)
  if (records.length > 0) {
    const firstRecord = records[0];
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Funcionário: ${firstRecord.funcionarioNome}`, 20, 82);
    doc.text(`Chapa: ${firstRecord.funcionarioChapa}`, 20, 88);
  }
  
  // Table
  const tableData = records.map(r => [
    format(new Date(r.data), "dd/MM/yyyy"),
    r.funcionarioNome,
    r.funcionarioChapa,
    tipoRefeicaoLabels[r.tipo] || r.tipo,
    formatCurrency(r.valor)
  ]);
  
  autoTable(doc, {
    startY: 95,
    head: [["Data", "Funcionário", "Chapa", "Tipo", "Valor"]],
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
