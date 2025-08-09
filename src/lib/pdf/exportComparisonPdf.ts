import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ComparisonData, Product, Store } from "@/lib/types";
import { calculateTotalsByStore, calculateOptimalTotal, summarizeTotals } from "@/lib/comparison/calc";
import { comparisonExportsService } from "@/services/supabase/comparisonExportsService";

export async function exportComparisonPdf(
  comparison: ComparisonData,
  opts: {
    userName?: string | null;
    userEmail?: string | null;
    userPlan?: string;
  } = {}
) {
  const { products, stores } = comparison;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  let cursorY = 40;

  // Logo no topo esquerdo
  let titleX = marginX;
  try {
    const logo = await loadImageAsDataUrl("/og-image.jpg");
    if (logo) {
      doc.addImage(logo, "JPEG", marginX, cursorY - 10, 44, 44);
      titleX = marginX + 54;
    }
  } catch (_) {}

  const title = "Relatório de Comparação de Preços";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, titleX, cursorY + 8);
  cursorY += 28;

  // Company / client info
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const today = new Date();
  const headerLeft = [
    "Comparador: O Esperto Comparador",
    "Descrição: Plataforma de comparação de preços",
    `Data do download: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`,
    `Local da comparação: ${comparison.location || "-"}`,
  ];
  const headerRight = [
    `Cliente: ${opts.userName || "-"}`,
    `Plano: ${opts.userPlan || "-"}`,
    `Email: ${opts.userEmail || "-"}`,
  ];
  headerLeft.forEach((t, i) => doc.text(t, marginX, cursorY + i * 14));
  headerRight.forEach((t, i) => doc.text(t, 320, cursorY + i * 14));
  cursorY += 14 * Math.max(headerLeft.length, headerRight.length) + 10;

  // Summary calculations
  const totals = calculateTotalsByStore(products, stores);
  const optimal = calculateOptimalTotal(products, stores);
  const { highest, average, lowest } = summarizeTotals(totals);
  const cheapestStoreId = Object.entries(totals).sort((a, b) => a[1] - b[1])[0]?.[0];
  const cheapestStoreName = stores.find((s) => s.id === cheapestStoreId)?.name || "-";

  autoTable(doc, {
    startY: cursorY,
    styles: { fontSize: 10 },
    head: [["Métrica", "Valor"]],
    body: [
      ["Loja mais barata", cheapestStoreName],
      ["Total otimizado (menores preços)", formatBRL(optimal)],
      ["Total mais caro", formatBRL(highest)],
      ["Média entre lojas", formatBRL(average)],
      ["Economia vs mais caro", formatBRL(highest - optimal)],
      ["Economia vs média", formatBRL(average - optimal)],
    ],
    theme: "striped",
    margin: { left: marginX, right: marginX },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 20;

  // Per-store detailed tables
  for (const store of stores) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Mercado: ${store.name}`, marginX, cursorY);
    cursorY += 10;

    const rows = products.map((p) => {
      const price = p.prices[store.id];
      const subtotal = typeof price === "number" ? price * (p.quantity ?? 1) : 0;
      return [
        p.name,
        `${p.quantity} ${p.unit}`,
        typeof price === "number" ? formatBRL(price) : "-",
        formatBRL(subtotal),
      ];
    });

    autoTable(doc, {
      startY: cursorY,
      head: [["Produto", "Qtde", "Preço", "Subtotal"]],
      body: rows,
      styles: { fontSize: 9 },
      theme: "grid",
      margin: { left: marginX, right: marginX },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 4;
    doc.setFont("helvetica", "normal");
    doc.text(`Total neste mercado: ${formatBRL(totals[store.id] || 0)}`, marginX, cursorY + 12);
    cursorY += 26;

    if (cursorY > 760) {
      doc.addPage();
      cursorY = 50;
    }
  }

  // Caixa de Total Geral (soma dos totais de cada mercado)
  const grandTotal = Object.values(totals).reduce((acc, v) => acc + (v || 0), 0);
  autoTable(doc, {
    startY: cursorY,
    head: [["Total Geral (soma dos totais de cada mercado)", "Valor"]],
    body: [["", formatBRL(grandTotal)]],
    styles: { fontSize: 11 },
    theme: "grid",
    margin: { left: marginX, right: marginX },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 16;

  // Disclaimer
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  const disclaimer =
    "Aviso: valores podem mudar a qualquer momento. Os preços podem ser alterados pelos estabelecimentos no dia seguinte. A plataforma não se responsabiliza por eventuais divergências.";
  const disclaimerLines = doc.splitTextToSize(disclaimer, 515);
  autoTable(doc, {
    startY: cursorY,
    head: [["Aviso Importante"]],
    body: disclaimerLines.map((l: string) => [l]),
    styles: { fontSize: 8 },
    theme: "plain",
    margin: { left: marginX, right: marginX },
  });
  cursorY = (doc as any).lastAutoTable.finalY;

  // File name
  const fileName = `comparacao_${todayStr(today)}.pdf`;

  // Compute file size and save
  const arrayBuffer = doc.output("arraybuffer") as ArrayBuffer;
  const fileSizeBytes = arrayBuffer.byteLength;
  doc.save(fileName);

  // Log export (best-effort)
  try {
    await comparisonExportsService.logExport({
      format: "pdf",
      file_size_bytes: fileSizeBytes,
      plan: opts.userPlan,
      meta: {
        stores: stores.map((s) => s.name),
        productsCount: products.length,
        totals,
        optimal,
        highest,
        average,
      },
    });
  } catch (e) {
    console.warn("Failed to log export:", e);
  }
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function todayStr(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
}

async function loadImageAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
