/**
 * PDF para impressão, gerado a partir do cartão personalizado (não é print da tela).
 * - A4, A5, A6 ou tamanho personalizado (mm), retrato ou paisagem.
 * - Cartão simples (frente, com verso opcional) ou dobrado (folha com capa+verso e as duas páginas de dentro).
 * - 300 DPI, sangria de 3 mm (fundo estendido em espelho) e marcas de corte e de dobra para gráfica.
 */
import { makeCanvas, renderBack, renderFace, renderInner } from "./render";
import type { CardData } from "./types";

export type PaperId = "A4" | "A5" | "A6" | "custom";
export const PAPERS: Record<Exclude<PaperId, "custom">, [number, number]> = { A4: [210, 297], A5: [148, 210], A6: [105, 148] };
export const DPI = 300;
export const BLEED = 3; // mm
const SLUG = 8; // mm de área para as marcas de corte
const pxOf = (mm: number) => Math.round((mm / 25.4) * DPI);

export type PdfOptions = {
  paper: PaperId;
  custom?: { w: number; h: number };
  fold: "simples" | "dobrado";
  /** gráfica = sangria + marcas de corte · casa = tamanho exato da folha */
  print: "grafica" | "casa";
  /** cartão simples: incluir verso (frente e verso) */
  back: boolean;
};

export type PdfPlan = {
  pageW: number; // mm, página do PDF
  pageH: number;
  sheetW: number; // mm, folha final depois do corte
  sheetH: number;
  cardW: number; // mm, cartão final (dobrado, se for o caso)
  cardH: number;
  pages: number;
  foldAxis: "x" | "y" | null; // dobra vertical (x) ou horizontal (y)
  pxW: number; // pixels da folha (com sangria) a 300 DPI
  pxH: number;
};

/** Tamanho da folha no sentido certo para o tipo de cartão escolhido. */
export function planPdf(d: CardData, o: PdfOptions): PdfPlan {
  const [a, b] = o.paper === "custom" ? [Math.max(50, Math.min(450, o.custom?.w || 150)), Math.max(50, Math.min(450, o.custom?.h || 210))] : PAPERS[o.paper];
  const short = Math.min(a, b),
    long = Math.max(a, b);
  const portrait = d.orientation === "retrato";
  let sheetW: number, sheetH: number, cardW: number, cardH: number, foldAxis: PdfPlan["foldAxis"] = null;
  if (o.paper === "custom") {
    // personalizado: respeita largura × altura digitadas
    sheetW = a;
    sheetH = b;
  } else if (o.fold === "simples") {
    sheetW = portrait ? short : long;
    sheetH = portrait ? long : short;
  } else {
    // dobrado: cartão em pé = folha deitada com dobra no meio; cartão deitado = folha em pé, dobra em cima
    sheetW = portrait ? long : short;
    sheetH = portrait ? short : long;
  }
  if (o.fold === "dobrado") {
    foldAxis = sheetW >= sheetH ? "x" : "y";
    cardW = foldAxis === "x" ? sheetW / 2 : sheetW;
    cardH = foldAxis === "x" ? sheetH : sheetH / 2;
  } else {
    cardW = sheetW;
    cardH = sheetH;
  }
  const extra = o.print === "grafica" ? 2 * (BLEED + SLUG) : 0;
  const bleed = o.print === "grafica" ? 2 * BLEED : 0;
  return {
    pageW: sheetW + extra,
    pageH: sheetH + extra,
    sheetW,
    sheetH,
    cardW,
    cardH,
    pages: o.fold === "dobrado" || o.back ? 2 : 1,
    foldAxis,
    pxW: pxOf(sheetW + bleed),
    pxH: pxOf(sheetH + bleed),
  };
}

/** Estende o desenho para a sangria espelhando as bordas (nada de conteúdo vai para a área de corte). */
function withBleed(src: HTMLCanvasElement, b: number) {
  if (b <= 0) return src;
  const W = src.width,
    H = src.height;
  const c = makeCanvas(W + 2 * b, H + 2 * b);
  const ctx = c.getContext("2d")!;
  const m = (sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, fx: number, fy: number) => {
    ctx.save();
    ctx.translate(dx + (fx < 0 ? sw : 0), dy + (fy < 0 ? sh : 0));
    ctx.scale(fx, fy);
    ctx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
    ctx.restore();
  };
  m(0, 0, W, b, b, 0, 1, -1); // topo
  m(0, H - b, W, b, b, H + b, 1, -1); // base
  m(0, 0, b, H, 0, b, -1, 1); // esquerda
  m(W - b, 0, b, H, W + b, b, -1, 1); // direita
  m(0, 0, b, b, 0, 0, -1, -1);
  m(W - b, 0, b, b, W + b, 0, -1, -1);
  m(0, H - b, b, b, 0, H + b, -1, -1);
  m(W - b, H - b, b, b, W + b, H + b, -1, -1);
  ctx.drawImage(src, b, b);
  return c;
}

function panel(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, W: number, H: number) => void, rotate180 = false) {
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d")!;
  if (rotate180) {
    ctx.translate(w, h);
    ctx.rotate(Math.PI);
  }
  draw(ctx, w, h);
  return c;
}

/** Monta as folhas (em pixels, já com sangria) que vão para o PDF. */
export function buildSheets(d: CardData, o: PdfOptions, plan = planPdf(d, o)) {
  const b = o.print === "grafica" ? pxOf(BLEED) : 0;
  const SW = plan.pxW - 2 * b,
    SH = plan.pxH - 2 * b; // folha sem sangria
  const sheets: { canvas: HTMLCanvasElement; label: string }[] = [];
  if (o.fold === "simples") {
    sheets.push({ canvas: withBleed(panel(SW, SH, (ctx, W, H) => renderFace(ctx, W, H, d, "front")), b), label: "Frente" });
    if (o.back) sheets.push({ canvas: withBleed(panel(SW, SH, (ctx, W, H) => renderBack(ctx, W, H, d)), b), label: "Verso" });
    return sheets;
  }
  const outside = makeCanvas(SW, SH),
    inside = makeCanvas(SW, SH);
  const oc = outside.getContext("2d")!,
    ic = inside.getContext("2d")!;
  if (plan.foldAxis === "x") {
    const pw = Math.floor(SW / 2);
    // fora: [verso | capa] — dentro: [esquerda | direita]
    oc.drawImage(panel(pw, SH, (c, W, H) => renderBack(c, W, H, d)), 0, 0);
    oc.drawImage(panel(SW - pw, SH, (c, W, H) => renderFace(c, W, H, d, "cover")), pw, 0);
    ic.drawImage(panel(pw, SH, (c, W, H) => renderInner(c, W, H, d, "left")), 0, 0);
    ic.drawImage(panel(SW - pw, SH, (c, W, H) => renderInner(c, W, H, d, "right")), pw, 0);
  } else {
    const ph = Math.floor(SH / 2);
    // dobra em cima: verso de cabeça para baixo na metade de cima, capa embaixo
    oc.drawImage(panel(SW, ph, (c, W, H) => renderBack(c, W, H, d), true), 0, 0);
    oc.drawImage(panel(SW, SH - ph, (c, W, H) => renderFace(c, W, H, d, "cover")), 0, ph);
    ic.drawImage(panel(SW, ph, (c, W, H) => renderInner(c, W, H, d, "left")), 0, 0);
    ic.drawImage(panel(SW, SH - ph, (c, W, H) => renderInner(c, W, H, d, "right")), 0, ph);
  }
  sheets.push({ canvas: withBleed(outside, b), label: "Lado de fora (capa e verso)" });
  sheets.push({ canvas: withBleed(inside, b), label: "Lado de dentro (mensagem)" });
  return sheets;
}

function marks(pdf: any, plan: PdfPlan, fold: boolean) {
  const o = SLUG + BLEED;
  const x0 = o,
    y0 = o,
    x1 = o + plan.sheetW,
    y1 = o + plan.sheetH;
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.15);
  const L = SLUG - 2;
  for (const x of [x0, x1]) {
    pdf.line(x, 0.5, x, 0.5 + L);
    pdf.line(x, plan.pageH - 0.5 - L, x, plan.pageH - 0.5);
  }
  for (const y of [y0, y1]) {
    pdf.line(0.5, y, 0.5 + L, y);
    pdf.line(plan.pageW - 0.5 - L, y, plan.pageW - 0.5, y);
  }
  if (fold && plan.foldAxis) {
    pdf.setLineDashPattern([1.2, 1], 0);
    if (plan.foldAxis === "x") {
      const x = o + plan.sheetW / 2;
      pdf.line(x, 0.5, x, 0.5 + L);
      pdf.line(x, plan.pageH - 0.5 - L, x, plan.pageH - 0.5);
    } else {
      const y = o + plan.sheetH / 2;
      pdf.line(0.5, y, 0.5 + L, y);
      pdf.line(plan.pageW - 0.5 - L, y, plan.pageW - 0.5, y);
    }
    pdf.setLineDashPattern([], 0);
  }
  pdf.setFontSize(5.5);
  pdf.setTextColor(90, 90, 90);
}

export async function buildPdf(d: CardData, o: PdfOptions, onStep?: (t: string) => void) {
  const plan = planPdf(d, o);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: [plan.pageW, plan.pageH], orientation: plan.pageW > plan.pageH ? "landscape" : "portrait", compress: true });
  pdf.setProperties({ title: `Cartão de Natal ${d.family || ""}`.trim(), creator: "Carta Mágica", subject: "Cartão de Natal para impressão" });
  const sheets = buildSheets(d, o, plan);
  const off = o.print === "grafica" ? SLUG : 0;
  const bw = o.print === "grafica" ? plan.sheetW + 2 * BLEED : plan.sheetW,
    bh = o.print === "grafica" ? plan.sheetH + 2 * BLEED : plan.sheetH;
  sheets.forEach((s, i) => {
    onStep?.(`Montando ${s.label.toLowerCase()}...`);
    if (i > 0) pdf.addPage([plan.pageW, plan.pageH], plan.pageW > plan.pageH ? "landscape" : "portrait");
    pdf.addImage(s.canvas, "JPEG", off, off, bw, bh, undefined, "SLOW");
    if (o.print === "grafica") {
      marks(pdf, plan, o.fold === "dobrado");
      const info = `Carta Mágica · ${s.label} · ${o.paper === "custom" ? `${plan.sheetW}×${plan.sheetH} mm` : o.paper} · 300 DPI · sangria 3 mm${o.fold === "dobrado" ? ` · dobrar na linha tracejada` : ""}`;
      pdf.text(info, SLUG + BLEED + 4, plan.pageH - 2.2);
    }
  });
  return { blob: pdf.output("blob") as Blob, plan, sheets: sheets.map((s) => ({ w: s.canvas.width, h: s.canvas.height, label: s.label })) };
}
