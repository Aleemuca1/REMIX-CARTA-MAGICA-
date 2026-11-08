/**
 * Certificados com cara de diploma de verdade (paisagem, proporção A4):
 * moldura dourada dupla com cantoneiras, faixa vermelha, marca d'água, medalha, selo de cera e assinaturas.
 * - Certificado Oficial de Bom Comportamento (planos pagos, a partir da carta)
 * - Certificado de Ajudante do Papai Noel (jogos)
 */
import type { Letter } from "../types";
import { F, drawQr, ensureFonts, wrapLines } from "./shareKit";
import { prettyName } from "./prettyText";

export const CW = 2000;
export const CH = 1414;
const GOLD = ["#FFF1B8", "#E9B949", "#B8860B"];
const RED = "#9B021A";
const NAVY = "#1C2541";

function goldGrad(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, GOLD[2]);
  g.addColorStop(0.25, GOLD[0]);
  g.addColorStop(0.5, GOLD[1]);
  g.addColorStop(0.75, GOLD[0]);
  g.addColorStop(1, GOLD[2]);
  return g;
}

/** Papel creme com vinheta e fibras suaves. */
function paper(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, W * 0.75);
  g.addColorStop(0, "#FFFDF6");
  g.addColorStop(0.7, "#FBF3DF");
  g.addColorStop(1, "#EFDDB4");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // fibras
  let s = 11;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  ctx.strokeStyle = "rgba(160,120,60,0.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 420; i++) {
    const x = rnd() * W,
      y = rnd() * H,
      l = 10 + rnd() * 40,
      a = rnd() * Math.PI;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
}

/** Floco de neve gigante e clarinho no fundo (marca d'água). */
function watermark(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "rgba(184,134,11,0.075)";
  ctx.lineCap = "round";
  ctx.lineWidth = r * 0.05;
  for (let k = 0; k < 6; k++) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r);
    for (const f of [0.35, 0.6, 0.82]) {
      const b = r * (0.28 - f * 0.12);
      ctx.moveTo(0, -r * f);
      ctx.lineTo(-b, -r * f - b);
      ctx.moveTo(0, -r * f);
      ctx.lineTo(b, -r * f - b);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** Cantoneira com volutas. */
function cornerOrnament(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = goldGrad(ctx, 0, 0, s, s);
  ctx.lineWidth = s * 0.06;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, s);
  ctx.bezierCurveTo(0, s * 0.35, s * 0.35, 0, s, 0);
  ctx.moveTo(s * 0.18, s * 0.9);
  ctx.bezierCurveTo(s * 0.2, s * 0.5, s * 0.5, s * 0.2, s * 0.9, s * 0.18);
  ctx.stroke();
  // volutas
  ctx.lineWidth = s * 0.045;
  for (const [cx, cy] of [
    [s * 0.98, s * 0.12],
    [s * 0.12, s * 0.98],
  ]) {
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.09, 0, Math.PI * 1.6);
    ctx.stroke();
  }
  ctx.fillStyle = GOLD[1];
  ctx.beginPath();
  ctx.arc(s * 0.3, s * 0.3, s * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Moldura dourada dupla com cantoneiras e um friso vermelho fino por dentro. */
function frame(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const m = 40;
  ctx.save();
  ctx.lineWidth = 22;
  ctx.strokeStyle = goldGrad(ctx, 0, 0, W, H);
  ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
  ctx.lineWidth = 4;
  ctx.strokeRect(m + 30, m + 30, W - 2 * (m + 30), H - 2 * (m + 30));
  ctx.strokeStyle = "rgba(155,2,26,0.45)";
  ctx.lineWidth = 2;
  ctx.setLineDash([2, 10]);
  ctx.strokeRect(m + 44, m + 44, W - 2 * (m + 44), H - 2 * (m + 44));
  ctx.setLineDash([]);
  ctx.restore();
  const s = 150,
    o = m + 22;
  cornerOrnament(ctx, o, o, s, 0);
  cornerOrnament(ctx, W - o, o, s, Math.PI / 2);
  cornerOrnament(ctx, W - o, H - o, s, Math.PI);
  cornerOrnament(ctx, o, H - o, s, -Math.PI / 2);
}

/** Folhas de azevinho com frutinhas. */
function holly(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  for (const a of [-0.5, 0.5]) {
    ctx.save();
    ctx.rotate(a);
    const g = ctx.createLinearGradient(0, 0, s, 0);
    g.addColorStop(0, "#14532D");
    g.addColorStop(1, "#2A9A61");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(s * 0.25, -s * 0.28, s * 0.5, -s * 0.12);
    ctx.quadraticCurveTo(s * 0.75, -s * 0.3, s, 0);
    ctx.quadraticCurveTo(s * 0.75, s * 0.3, s * 0.5, s * 0.12);
    ctx.quadraticCurveTo(s * 0.25, s * 0.28, 0, 0);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = s * 0.02;
    ctx.beginPath();
    ctx.moveTo(s * 0.05, 0);
    ctx.lineTo(s * 0.9, 0);
    ctx.stroke();
    ctx.restore();
  }
  for (const [dx, dy] of [
    [0, 0],
    [s * 0.13, -s * 0.1],
    [s * 0.12, s * 0.11],
  ]) {
    const g = ctx.createRadialGradient(dx - s * 0.03, dy - s * 0.03, 1, dx, dy, s * 0.09);
    g.addColorStop(0, "#FF5A6E");
    g.addColorStop(1, "#A3001B");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(dx, dy, s * 0.085, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Faixa vermelha com pontas dobradas e texto dourado. */
function ribbon(ctx: CanvasRenderingContext2D, cx: number, y: number, w: number, h: number, text: string) {
  ctx.save();
  const tail = h * 0.9;
  ctx.fillStyle = "#7A0115";
  for (const dir of [-1, 1]) {
    const x0 = cx + dir * (w / 2 - 10);
    ctx.beginPath();
    ctx.moveTo(x0, y + h * 0.25);
    ctx.lineTo(x0 + dir * tail, y + h * 0.25);
    ctx.lineTo(x0 + dir * tail * 0.7, y + h * 0.75);
    ctx.lineTo(x0 + dir * tail, y + h * 1.25);
    ctx.lineTo(x0, y + h * 1.25);
    ctx.closePath();
    ctx.fill();
  }
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "#E01E3C");
  g.addColorStop(1, "#9B021A");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = GOLD[1];
  ctx.lineWidth = 3;
  ctx.strokeRect(cx - w / 2 + 10, y + 10, w - 20, h - 20);
  ctx.fillStyle = "#FFE9A8";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = F.cinzel(Math.round(h * 0.4), 800);
  ctx.fillText(text, cx, y + h / 2 + 2);
  ctx.restore();
}

/** Medalha dourada com fitas e um símbolo no meio. */
function medal(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, symbol: string) {
  ctx.save();
  for (const [dx, col] of [
    [-1, "#D90429"],
    [1, "#1F7A4D"],
  ] as const) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x + dx * r * 0.15, y);
    ctx.lineTo(x + dx * r * 0.75, y + r * 1.8);
    ctx.lineTo(x + dx * r * 0.45, y + r * 1.55);
    ctx.lineTo(x + dx * r * 0.2, y + r * 1.85);
    ctx.lineTo(x - dx * r * 0.25, y + r * 0.2);
    ctx.closePath();
    ctx.fill();
  }
  // estrela de pontas (borda serrilhada)
  ctx.fillStyle = goldGrad(ctx, x - r, y - r, x + r, y + r);
  ctx.beginPath();
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    const rr = r * (i % 2 ? 0.9 : 1);
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r * 0.75);
  g.addColorStop(0, "#FFF6D0");
  g.addColorStop(1, "#E2AE3A");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.72, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#B8860B";
  ctx.lineWidth = r * 0.05;
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${Math.round(r * 0.75)}px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",serif`;
  ctx.fillText(symbol, x, y + r * 0.05);
  ctx.restore();
}

/** Selo de cera com fitinhas. */
function seal(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, label: string) {
  ctx.save();
  ctx.fillStyle = "#9B021A";
  for (const a of [-0.35, 0.35]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.fillRect(-r * 0.2, 0, r * 0.4, r * 1.6);
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, r * 1.6);
    ctx.lineTo(0, r * 1.4);
    ctx.lineTo(r * 0.2, r * 1.6);
    ctx.fillStyle = "#FBF3DF";
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#9B021A";
  }
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, "#E2343F");
  g.addColorStop(1, "#7A0115");
  ctx.fillStyle = g;
  ctx.beginPath();
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const rr = r * (i % 2 ? 0.9 : 1);
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#FFD166";
  ctx.lineWidth = r * 0.05;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.68, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#FFD166";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = F.cinzel(Math.round(r * 0.16), 800);
  ctx.fillText("POLO NORTE", x, y - r * 0.24);
  ctx.font = F.cinzel(Math.round(r * 0.42), 800);
  ctx.fillText(label, x, y + r * 0.17);
  ctx.restore();
}

function signature(ctx: CanvasRenderingContext2D, x: number, y: number, name: string, role: string) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = RED;
  ctx.font = F.hand(92);
  ctx.fillText(name, x, y);
  ctx.strokeStyle = "rgba(28,37,65,0.55)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 230, y + 26);
  ctx.lineTo(x + 230, y + 26);
  ctx.stroke();
  ctx.fillStyle = "rgba(28,37,65,0.7)";
  ctx.font = F.cinzel(22, 700);
  ctx.fillText(role, x, y + 62);
  ctx.restore();
}

/** Nome grande em letra cursiva dourada, diminuindo se for comprido. */
function bigName(ctx: CanvasRenderingContext2D, name: string, cx: number, y: number, maxW: number, size = 190) {
  ctx.save();
  ctx.textAlign = "center";
  let s = size;
  ctx.font = F.hand(s);
  while (ctx.measureText(name).width > maxW && s > 80) ctx.font = F.hand((s -= 6));
  const w = ctx.measureText(name).width;
  ctx.fillStyle = "rgba(122,1,21,0.18)";
  ctx.fillText(name, cx + 4, y + 5);
  const g = ctx.createLinearGradient(cx - w / 2, y - s, cx + w / 2, y);
  g.addColorStop(0, "#9B021A");
  g.addColorStop(0.5, "#D90429");
  g.addColorStop(1, "#9B021A");
  ctx.fillStyle = g;
  ctx.fillText(name, cx, y);
  // floreio embaixo do nome
  ctx.strokeStyle = goldGrad(ctx, cx - 460, 0, cx + 460, 0);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 460, y + 40);
  ctx.quadraticCurveTo(cx, y + 10, cx + 460, y + 40);
  ctx.stroke();
  ctx.fillStyle = GOLD[1];
  ctx.beginPath();
  ctx.arc(cx, y + 26, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function base(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = CW;
  c.height = CH;
  const ctx = c.getContext("2d")!;
  paper(ctx, CW, CH);
  watermark(ctx, CW / 2, CH / 2 + 40, 520);
  frame(ctx, CW, CH);
  holly(ctx, 120, 150, 130, 0.5);
  holly(ctx, CW - 120, 150, 130, Math.PI - 0.5);
  return [c, ctx];
}

const shortAchievements = (raw: string) =>
  String(raw || "")
    .split(/[\n;,.]+|\s+e\s+(?=[a-záéíóú])/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 2)
    .slice(0, 3)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));

/** Certificado Oficial de Bom Comportamento (planos pagos). */
export async function renderGoodCertificate(l: Letter) {
  await ensureFonts();
  const [c, ctx] = base();
  const name = prettyName(l.childName || "Criança querida");
  const year = new Date().getFullYear();
  ctx.textAlign = "center";
  ctx.fillStyle = RED;
  ctx.font = F.cinzel(30, 800);
  ctx.fillText("✦  CORREIO REAL DO POLO NORTE  ✦", CW / 2, 190);
  ribbon(ctx, CW / 2, 225, 1020, 110, "CERTIFICADO OFICIAL");
  ctx.fillStyle = NAVY;
  ctx.font = F.xmas(92);
  ctx.fillText("de Bom Comportamento", CW / 2, 455);
  ctx.fillStyle = "rgba(28,37,65,0.78)";
  ctx.font = F.serif(38, true);
  ctx.fillText("O Papai Noel certifica, com muito orgulho, que", CW / 2, 545);
  bigName(ctx, name, CW / 2, 715, 1300);
  ctx.fillStyle = NAVY;
  ctx.font = F.serif(40);
  const bits = [l.age ? `${l.age} ${Number(l.age) === 1 ? "ano" : "anos"}` : "", l.city ? `de ${l.city}` : ""].filter(Boolean).join(", ");
  ctx.fillText(`${bits ? bits + ", " : ""}está oficialmente na Lista do Bom Comportamento de ${year}`, CW / 2, 820, CW - 420);
  // destaques do ano (um por linha)
  const items = shortAchievements(l.achievements);
  ctx.fillStyle = RED;
  ctx.font = F.cinzel(26, 800);
  ctx.fillText("DESTAQUES DO ANO", CW / 2, 892);
  ctx.fillStyle = NAVY;
  ctx.font = F.letter(36, 500);
  const list = items.length ? items : ["Carinho, coragem e coração de ouro"];
  list.forEach((it, i) => ctx.fillText(`★  ${it}`, CW / 2, 944 + i * 48, CW - 700));
  // rodapé: assinaturas, medalha, selo e QR
  medal(ctx, CW / 2, 1150, 78, "⭐");
  signature(ctx, 600, 1190, "Papai Noel", "CHEFE DO POLO NORTE");
  signature(ctx, CW - 600, 1190, "Duende Chefe", "GUARDIÃO DA LISTA");
  seal(ctx, 235, 1120, 72, String(year));
  const nr = l.protocol ? `Nº ${l.protocol.toLocaleString("pt-BR")}` : `Nº ${(l.token || "").slice(-5).toUpperCase()}`;
  ctx.fillStyle = "rgba(28,37,65,0.6)";
  ctx.font = F.sans(20, 600);
  ctx.textAlign = "right";
  ctx.fillText(`${nr} · ${new Date().toLocaleDateString("pt-BR")}`, CW - 130, CH - 112);
  if (l.token) {
    const q = 116;
    ctx.fillStyle = "#fff";
    ctx.fillRect(CW - 140 - q - 8, 1100, q + 16, q + 16);
    drawQr(ctx, `${window.location.origin}/natal/${l.token}`, CW - 140 - q, 1108, q);
  }
  return c;
}

/** PDF A4 deitado do Certificado de Bom Comportamento. */
export async function goodCertificatePdf(l: Letter) {
  const [page, { jsPDF }] = await Promise.all([renderGoodCertificate(l), import("jspdf")]);
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  pdf.addImage(page.toDataURL("image/jpeg", 0.94), "JPEG", 0, 0, 297, 210);
  pdf.setProperties({ title: `Certificado de Bom Comportamento - ${l.childName}`, author: "Papai Noel • Carta Mágica" });
  return pdf.output("blob") as Blob;
}

/** Certificado de Ajudante do Papai Noel (jogos), no mesmo estilo de diploma. */
export async function renderHelperCertificate(o: { player: string; title: string; emoji: string; score: number; game: string; feat: string }) {
  await ensureFonts();
  const [c, ctx] = base();
  ctx.textAlign = "center";
  ctx.fillStyle = RED;
  ctx.font = F.cinzel(30, 800);
  ctx.fillText("✦  OFICINA DO PAPAI NOEL • POLO NORTE  ✦", CW / 2, 190);
  ribbon(ctx, CW / 2, 225, 1060, 110, "CERTIFICADO DE AJUDANTE");
  ctx.fillStyle = NAVY;
  ctx.font = F.xmas(84);
  ctx.fillText("do Papai Noel", CW / 2, 445);
  ctx.fillStyle = "rgba(28,37,65,0.78)";
  ctx.font = F.serif(38, true);
  ctx.fillText("Entregue com muito orgulho a", CW / 2, 535);
  bigName(ctx, prettyName(o.player || "Pequeno Ajudante"), CW / 2, 700, 1300);
  ctx.fillStyle = NAVY;
  ctx.font = F.serif(40);
  ctx.fillText(`${o.feat} no jogo ${o.game}`, CW / 2, 810, CW - 420);
  ctx.fillText("e conquistou a medalha", CW / 2, 862);
  medal(ctx, CW / 2, 975, 80, o.emoji);
  ctx.fillStyle = RED;
  ctx.font = F.cinzel(54, 800);
  ctx.fillText(o.title, CW / 2, 1205);
  signature(ctx, CW - 470, 1170, "Papai Noel", "CHEFE DA OFICINA DE BRINQUEDOS");
  seal(ctx, 260, 1100, 78, String(new Date().getFullYear()));
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(28,37,65,0.7)";
  ctx.font = F.sans(26, 700);
  ctx.fillText(`${o.score} pontos`, 380, 1095);
  ctx.font = F.sans(22, 600);
  ctx.fillText(new Date().toLocaleDateString("pt-BR"), 380, 1132);
  return c;
}
