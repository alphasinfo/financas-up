import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatarMoeda, formatarData } from "./formatters";

interface TransacaoPDF {
  data: Date;
  descricao: string;
  categoria: string;
  tipo: string;
  valor: number;
  status: string;
}

interface RelatorioPDF {
  periodo: string;
  receitas: number;
  despesas: number;
  saldo: number;
  transacoes: TransacaoPDF[];
}

export function exportarRelatorioParaPDF(dados: RelatorioPDF) {
  const doc = new jsPDF();

  // Cabeçalho
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // Azul
  doc.text("Finanças Up", 14, 20);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Relatório Financeiro", 14, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Período: ${dados.periodo}`, 14, 38);
  doc.text(`Gerado em: ${formatarData(new Date())}`, 14, 44);

  // Cards de resumo
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  const yStart = 55;
  
  // Receitas
  doc.setFillColor(220, 252, 231); // Verde claro
  doc.rect(14, yStart, 60, 20, "F");
  doc.setTextColor(22, 163, 74); // Verde
  doc.text("Receitas", 16, yStart + 8);
  doc.setFontSize(14);
  doc.text(formatarMoeda(dados.receitas), 16, yStart + 16);

  // Despesas
  doc.setFillColor(254, 226, 226); // Vermelho claro
  doc.rect(78, yStart, 60, 20, "F");
  doc.setTextColor(220, 38, 38); // Vermelho
  doc.setFontSize(12);
  doc.text("Despesas", 80, yStart + 8);
  doc.setFontSize(14);
  doc.text(formatarMoeda(dados.despesas), 80, yStart + 16);

  // Saldo
  const corSaldo = dados.saldo >= 0 ? [22, 163, 74] : [220, 38, 38];
  doc.setFillColor(dados.saldo >= 0 ? 220 : 254, dados.saldo >= 0 ? 252 : 226, dados.saldo >= 0 ? 231 : 226);
  doc.rect(142, yStart, 60, 20, "F");
  doc.setTextColor(corSaldo[0], corSaldo[1], corSaldo[2]);
  doc.setFontSize(12);
  doc.text("Saldo", 144, yStart + 8);
  doc.setFontSize(14);
  doc.text(formatarMoeda(dados.saldo), 144, yStart + 16);

  // Tabela de transações
  const tableData = dados.transacoes.map((t) => [
    formatarData(t.data),
    t.descricao,
    t.categoria,
    t.tipo === "RECEITA" ? "Receita" : "Despesa",
    formatarMoeda(t.valor),
    t.status,
  ]);

  autoTable(doc, {
    startY: yStart + 30,
    head: [["Data", "Descrição", "Categoria", "Tipo", "Valor", "Status"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 50 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30, halign: "right" },
      5: { cellWidth: 25 },
    },
    didParseCell: (data) => {
      // Colorir tipo
      if (data.column.index === 3 && data.section === "body") {
        const tipo = data.cell.raw as string;
        if (tipo === "Receita") {
          data.cell.styles.textColor = [22, 163, 74];
        } else {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
      // Colorir valor
      if (data.column.index === 4 && data.section === "body") {
        const rowIndex = data.row.index;
        const tipo = dados.transacoes[rowIndex].tipo;
        if (tipo === "RECEITA") {
          data.cell.styles.textColor = [22, 163, 74];
        } else {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
    },
  });

  // Rodapé
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Finanças Up - Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  return doc;
}

export function exportarCalendarioParaPDF(transacoes: TransacaoPDF[], mes: string, ano: string) {
  const doc = new jsPDF();

  // Cabeçalho
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235);
  doc.text("Finanças Up", 14, 20);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Calendário Financeiro", 14, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Período: ${mes}/${ano}`, 14, 38);
  doc.text(`Gerado em: ${formatarData(new Date())}`, 14, 44);

  // Tabela
  const tableData = transacoes.map((t) => [
    formatarData(t.data),
    t.descricao,
    t.tipo === "RECEITA" ? "Receita" : "Despesa",
    formatarMoeda(t.valor),
    t.status,
  ]);

  autoTable(doc, {
    startY: 55,
    head: [["Data", "Descrição", "Tipo", "Valor", "Status"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 70 },
      2: { cellWidth: 30 },
      3: { cellWidth: 35, halign: "right" },
      4: { cellWidth: 30 },
    },
    didParseCell: (data) => {
      if (data.column.index === 2 && data.section === "body") {
        const tipo = data.cell.raw as string;
        if (tipo === "Receita") {
          data.cell.styles.textColor = [22, 163, 74];
        } else {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
      if (data.column.index === 3 && data.section === "body") {
        const rowIndex = data.row.index;
        const tipo = transacoes[rowIndex].tipo;
        if (tipo === "RECEITA") {
          data.cell.styles.textColor = [22, 163, 74];
        } else {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
    },
  });

  // Rodapé
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Finanças Up - Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  return doc;
}

export function baixarPDF(doc: jsPDF, nomeArquivo: string) {
  doc.save(nomeArquivo);
}

// Exportar PDF com gráficos (usando canvas)
export function exportarRelatorioComGraficos(
  dados: RelatorioPDF,
  graficosBase64?: { receitas?: string; categorias?: string; evolucao?: string }
) {
  const doc = new jsPDF();

  // Cabeçalho
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235);
  doc.text("Finanças Up", 14, 20);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Relatório Financeiro Completo", 14, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Período: ${dados.periodo}`, 14, 38);
  doc.text(`Gerado em: ${formatarData(new Date())}`, 14, 44);

  // Cards de resumo
  const yStart = 55;
  
  doc.setFontSize(12);
  doc.setFillColor(220, 252, 231);
  doc.rect(14, yStart, 60, 20, "F");
  doc.setTextColor(22, 163, 74);
  doc.text("Receitas", 16, yStart + 8);
  doc.setFontSize(14);
  doc.text(formatarMoeda(dados.receitas), 16, yStart + 16);

  doc.setFillColor(254, 226, 226);
  doc.rect(78, yStart, 60, 20, "F");
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(12);
  doc.text("Despesas", 80, yStart + 8);
  doc.setFontSize(14);
  doc.text(formatarMoeda(dados.despesas), 80, yStart + 16);

  const corSaldo = dados.saldo >= 0 ? [22, 163, 74] : [220, 38, 38];
  doc.setFillColor(dados.saldo >= 0 ? 220 : 254, dados.saldo >= 0 ? 252 : 226, dados.saldo >= 0 ? 231 : 226);
  doc.rect(142, yStart, 60, 20, "F");
  doc.setTextColor(corSaldo[0], corSaldo[1], corSaldo[2]);
  doc.setFontSize(12);
  doc.text("Saldo", 144, yStart + 8);
  doc.setFontSize(14);
  doc.text(formatarMoeda(dados.saldo), 144, yStart + 16);

  let currentY = yStart + 30;

  // Adicionar gráficos se fornecidos
  if (graficosBase64?.receitas) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Gráfico: Receitas vs Despesas", 14, 20);
    doc.addImage(graficosBase64.receitas, "PNG", 14, 30, 180, 100);
    currentY = 140;
  }

  if (graficosBase64?.categorias) {
    if (!graficosBase64.receitas) doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Gráfico: Despesas por Categoria", 14, currentY);
    doc.addImage(graficosBase64.categorias, "PNG", 14, currentY + 10, 180, 100);
  }

  // Tabela de transações
  doc.addPage();
  doc.setFontSize(14);
  doc.text("Detalhamento de Transações", 14, 20);

  const tableData = dados.transacoes.map((t) => [
    formatarData(t.data),
    t.descricao,
    t.categoria,
    t.tipo === "RECEITA" ? "Receita" : "Despesa",
    formatarMoeda(t.valor),
    t.status,
  ]);

  autoTable(doc, {
    startY: 30,
    head: [["Data", "Descrição", "Categoria", "Tipo", "Valor", "Status"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 50 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30, halign: "right" },
      5: { cellWidth: 25 },
    },
    didParseCell: (data) => {
      if (data.column.index === 3 && data.section === "body") {
        const tipo = data.cell.raw as string;
        if (tipo === "Receita") {
          data.cell.styles.textColor = [22, 163, 74];
        } else {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
      if (data.column.index === 4 && data.section === "body") {
        const rowIndex = data.row.index;
        const tipo = dados.transacoes[rowIndex].tipo;
        if (tipo === "RECEITA") {
          data.cell.styles.textColor = [22, 163, 74];
        } else {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
    },
  });

  // Rodapé em todas as páginas
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Finanças Up - Relatório Completo - Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  return doc;
}
