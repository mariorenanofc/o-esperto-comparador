import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ComparisonData, Product, Store } from "@/lib/types";
import { calculateTotalsByStore, calculateOptimalTotal, summarizeTotals } from "@/lib/comparison/calc";
import { comparisonExportsService } from "@/services/supabase/comparisonExportsService";
import logoEC from "@/assets/logo-ec.png";

export async function exportComparisonPdf(
  comparison: ComparisonData,
  location?: { city: string; state: string },
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
  let logoBottom = 0;
  try {
    const logo = await loadImageAsDataUrl(logoEC);
    if (logo) {
      doc.addImage(logo, "PNG", marginX, cursorY - 10, 44, 44);
      titleX = marginX + 54;
      logoBottom = cursorY - 10 + 44; // base da logo
    }
  } catch (_) {}

  const title = "Relatório de Comparação de Preços";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, titleX, cursorY + 8);
  const afterTitleY = cursorY + 28;
  cursorY = Math.max(afterTitleY, logoBottom + 6); // garante espaço abaixo da logo

  // Company / client info
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const today = new Date();
  const locationText = location?.city && location?.state 
    ? `${location.city}/${location.state}` 
    : (comparison.location || "-");
    
  const headerLeft = [
    "Comparador: O Esperto Comparador",
    "Descrição: Plataforma de comparação de preços",
    `Data do download: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`,
    `Local da comparação: ${locationText}`,
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
    pageBreak: "avoid",
    margin: { left: marginX, right: marginX },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 20;

  // Calculate best prices by store (same logic as BestPricesByStore component)
  const getBestPricesByStore = () => {
    // First, determine which store has the lowest price for each product
    const bestPriceMap = new Map();
    
    products.forEach((product) => {
      let bestPrice = Infinity;
      let bestStoreId = "";
      
      Object.entries(product.prices).forEach(([storeId, price]) => {
        if (typeof price === "number" && price < bestPrice) {
          bestPrice = price;
          bestStoreId = storeId;
        }
      });
      
      if (bestStoreId) {
        bestPriceMap.set(product.id, {
          storeId: bestStoreId,
          price: bestPrice,
        });
      }
    });
    
    // Group products by store
    const storeItemsMap = new Map();
    
    products.forEach((product) => {
      const bestPriceInfo = bestPriceMap.get(product.id);
      if (bestPriceInfo) {
        const { storeId, price } = bestPriceInfo;
        
        const storeItems = storeItemsMap.get(storeId) || [];
        storeItems.push({
          product,
          unitPrice: price,
          totalPrice: price * (product.quantity ?? 1),
        });
        
        storeItemsMap.set(storeId, storeItems);
      }
    });
    
    // Convert map to array and calculate totals
    const result = [];
    
    stores.forEach((store) => {
      const items = storeItemsMap.get(store.id) || [];
      if (items.length > 0) {
        const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
        
        result.push({
          store,
          items,
          total,
        });
      }
    });
    
    // Sort by number of items (descending)
    return result.sort((a, b) => b.items.length - a.items.length);
  };

  const storesWithBestPrices = getBestPricesByStore();

  // Display only stores with best prices for products
  for (const { store, items, total } of storesWithBestPrices) {
    // Avoid orphaned headings: if near the bottom, start a new page before the section
    if (cursorY > 730) {
      doc.addPage();
      cursorY = 50;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`${store.name} - ${items.length} ${items.length === 1 ? "item" : "itens"} mais barato${items.length === 1 ? "" : "s"}`, marginX, cursorY);
    cursorY += 10;

    const rows = items.map((item) => [
      item.product.name,
      `${item.product.quantity} ${item.product.unit}`,
      formatBRL(item.unitPrice),
      formatBRL(item.totalPrice),
    ]);

    autoTable(doc, {
      startY: cursorY,
      head: [["Produto", "Qtde", "Preço Unitário", "Total"]],
      body: rows,
      styles: { fontSize: 9 },
      theme: "grid",
      margin: { left: marginX, right: marginX },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 4;
    doc.setFont("helvetica", "normal");
    doc.text(`Total neste mercado: ${formatBRL(total)}`, marginX, cursorY + 12);
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
    pageBreak: "avoid",
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
    pageBreak: "avoid",
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
