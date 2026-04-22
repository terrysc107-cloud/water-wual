"use client";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { type PlanDraft, type ReportSection } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type PdfInput = {
  title: string;
  subtitle: string;
  sections: ReportSection[];
  plan: PlanDraft;
};

export async function downloadReportPdf(input: PdfInput) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let cursor = 744;

  const drawLine = (
    text: string,
    options?: {
      size?: number;
      bold?: boolean;
      color?: [number, number, number];
    },
  ) => {
    const size = options?.size ?? 10;
    const usedFont = options?.bold ? bold : font;
    const color = options?.color ?? [0.07, 0.13, 0.18];
    page.drawText(text, {
      x: 44,
      y: cursor,
      size,
      font: usedFont,
      color: rgb(color[0], color[1], color[2]),
      maxWidth: 520,
      lineHeight: size + 4,
    });
    cursor -= size + 8;
  };

  drawLine(input.title, {
    size: 22,
    bold: true,
    color: [0.07, 0.36, 0.45],
  });
  drawLine(input.subtitle, { size: 11 });
  drawLine(`Generated ${formatDate(new Date().toISOString())}`, {
    size: 9,
    color: [0.35, 0.42, 0.47],
  });
  cursor -= 8;

  input.sections.slice(0, 5).forEach((section) => {
    drawLine(section.title, { size: 13, bold: true });
    section.body.slice(0, 5).forEach((line) => drawLine(`• ${line}`, { size: 10 }));
    cursor -= 6;
  });

  drawLine("Water Management Plan Highlights", { size: 13, bold: true });
  input.plan.sections.slice(0, 3).forEach((section) => {
    drawLine(section.title, {
      size: 11,
      bold: true,
      color: [0.07, 0.36, 0.45],
    });
    section.body.slice(0, 3).forEach((line) => drawLine(`• ${line}`, { size: 10 }));
  });

  const bytes = await pdfDoc.save();
  const normalizedBytes = Uint8Array.from(bytes);
  const blob = new Blob([normalizedBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${input.title.replace(/\s+/g, "-").toLowerCase()}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
