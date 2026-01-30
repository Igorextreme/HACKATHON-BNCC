import jsPDF from "jspdf";
import { Material } from "@/app/models/types/material";
import { applyPdfTemplate } from "./pdfTemplate";

export function exportPdf(material: Material): Buffer {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 25;

  let pageNumber = 1;

  // TEMPLATE PRIMEIRA PÁGINA
  applyPdfTemplate(pdf, material.title, pageNumber);

  let y = 55; // começa abaixo do título

  // Função para renderizar linha com Markdown
  function renderLine(line: string, x: number, y: number) {
    let fontSize = 11;
    let fontStyle: "normal" | "bold" | "italic" | "bolditalic" = "normal";

    // Detecta título
    if (line.startsWith("#### ")) {
      fontSize = 12;
      line = line.slice(5);
      fontStyle = "bold";
    } else if (line.startsWith("### ")) {
      fontSize = 14;
      line = line.slice(4);
      fontStyle = "bold";
    } else if (line.startsWith("## ")) {
      fontSize = 16;
      line = line.slice(3);
      fontStyle = "bold";
    } else if (line.startsWith("# ")) {
      fontSize = 18;
      line = line.slice(2);
      fontStyle = "bold";
    }

    pdf.setFontSize(fontSize);

    // Divide em partes para negrito/itálico
    const regex = /(\*\*\*.+?\*\*\*|\*\*.+?\*\*|\*.+?\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        pdf.setFont("helvetica", fontStyle.includes("bold") ? "bold" : "normal");
        pdf.text(line.slice(lastIndex, match.index), x, y);
        x += pdf.getTextWidth(line.slice(lastIndex, match.index));
      }

      const value = match[0];
      let text = "";
      let style: "normal" | "bold" | "italic" | "bolditalic" = "normal";

      if (value.startsWith("***")) {
        text = value.slice(3, -3);
        style = "bolditalic";
      } else if (value.startsWith("**")) {
        text = value.slice(2, -2);
        style = "bold";
      } else {
        text = value.slice(1, -1);
        style = "italic";
      }

      switch (style) {
        case "bold":
          pdf.setFont("helvetica", "bold");
          break;
        case "italic":
          pdf.setFont("helvetica", "italic");
          break;
        case "bolditalic":
          pdf.setFont("helvetica", "bolditalic");
          break;
        default:
          pdf.setFont("helvetica", "normal");
      }

      pdf.text(text, x, y);
      x += pdf.getTextWidth(text);

      lastIndex = match.index + value.length;
    }

    // Renderiza o restante da linha
    if (lastIndex < line.length) {
      pdf.setFont("helvetica", fontStyle.includes("bold") ? "bold" : "normal");
      pdf.text(line.slice(lastIndex), x, y);
    }
  }

  // Quebra em linhas considerando largura da página
  // Quebra em linhas considerando largura da página
const rawLines = material.content.split("\n");
for (const rawLine of rawLines) { // <--- trocar let por const
  const wrappedLines = pdf.splitTextToSize(rawLine, pageWidth - margin * 2);

  for (const line of wrappedLines) { // <--- trocar let por const
    if (y > 270) {
      pdf.addPage();
      pageNumber++;
      applyPdfTemplate(pdf, material.title, pageNumber);
      y = 35;
    }

    renderLine(line, margin, y);
    y += 6;
  }
}


  return Buffer.from(pdf.output("arraybuffer"));
}
