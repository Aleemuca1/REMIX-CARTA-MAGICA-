/**
 * "Foto" ilustrada de exemplo (família desenhada, sem rostos reais) para as prévias da galeria.
 * Assim a galeria mostra como o cartão fica com uma foto, sem usar imagem de ninguém.
 */
import * as A from "./art";

let cache: HTMLCanvasElement | null = null;

export function demoPhoto(): HTMLCanvasElement {
  if (cache) return cache;
  const S = 1200;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const ctx = c.getContext("2d")!;
  const u = S / 1000;
  // sala aconchegante
  const g = ctx.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, "#6B3A2A");
  g.addColorStop(0.6, "#A0573A");
  g.addColorStop(1, "#5A2E1E");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  ctx.filter = `blur(${10 * u}px)`;
  A.pineTree(ctx, 0.14 * S, 0.86 * S, 0.7 * S, u * 1.6, false, true, 7);
  A.bokeh(ctx, S, S * 0.7, 30, 3, ["#FFD27A", "#FFB86B", "#FFF1C1"], 18 * u, 70 * u, 0.55);
  ctx.filter = "none";
  // janela/luz quente de fundo
  const lg = ctx.createRadialGradient(0.62 * S, 0.3 * S, 0, 0.62 * S, 0.3 * S, 0.6 * S);
  lg.addColorStop(0, "rgba(255,220,160,0.55)");
  lg.addColorStop(1, "rgba(255,220,160,0)");
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, S, S);
  // sofá
  ctx.fillStyle = "#3E2A4F";
  ctx.beginPath();
  ctx.roundRect(0.08 * S, 0.66 * S, 0.84 * S, 0.4 * S, 60 * u);
  ctx.fill();
  type P = { x: number; y: number; h: number; skin: string; hair: string; sweater: string; hat?: boolean; long?: boolean };
  const people: P[] = [
    { x: 0.32, y: 0.36, h: 1, skin: "#E9B28C", hair: "#3A2216", sweater: "#B80E25" },
    { x: 0.66, y: 0.37, h: 0.97, skin: "#C98B64", hair: "#1E140E", sweater: "#1F7A47", long: true },
    { x: 0.44, y: 0.55, h: 0.72, skin: "#F2C6A4", hair: "#7A4A22", sweater: "#2F6FB0", hat: true },
    { x: 0.58, y: 0.57, h: 0.66, skin: "#D79D78", hair: "#2A1A10", sweater: "#E9B949", hat: true, long: true },
  ];
  for (const p of people) {
    const x = p.x * S,
      y = p.y * S,
      r = 95 * u * p.h;
    // corpo
    ctx.fillStyle = p.sweater;
    ctx.beginPath();
    ctx.moveTo(x - r * 1.5, S);
    ctx.bezierCurveTo(x - r * 1.6, y + r * 1.4, x - r * 0.9, y + r * 0.95, x, y + r * 0.95);
    ctx.bezierCurveTo(x + r * 0.9, y + r * 0.95, x + r * 1.6, y + r * 1.4, x + r * 1.5, S);
    ctx.fill();
    // padrão do suéter
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    for (let i = -3; i <= 3; i++) A.star5(ctx, x + i * r * 0.36, y + r * 1.55, r * 0.08, "rgba(255,255,255,0.8)");
    // cabelo atrás
    ctx.fillStyle = p.hair;
    if (p.long) {
      ctx.beginPath();
      ctx.ellipse(x, y + r * 0.35, r * 1.08, r * 1.15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // pescoço e rosto
    ctx.fillStyle = p.skin;
    ctx.fillRect(x - r * 0.28, y + r * 0.6, r * 0.56, r * 0.45);
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.86, r * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();
    // cabelo da frente
    ctx.fillStyle = p.hair;
    ctx.beginPath();
    ctx.ellipse(x, y - r * 0.55, r * 0.9, r * 0.5, 0, Math.PI, 0);
    ctx.quadraticCurveTo(x + r * 0.4, y - r * 0.3, x - r * 0.2, y - r * 0.45);
    ctx.quadraticCurveTo(x - r * 0.6, y - r * 0.3, x - r * 0.9, y - r * 0.55);
    ctx.fill();
    // olhinhos sorrindo + bochechas + sorriso
    ctx.strokeStyle = "#3A2418";
    ctx.lineWidth = r * 0.07;
    ctx.lineCap = "round";
    for (const k of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(x + k * r * 0.32, y + r * 0.02, r * 0.12, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(235,110,110,0.35)";
    for (const k of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(x + k * r * 0.48, y + r * 0.28, r * 0.14, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x, y + r * 0.3, r * 0.3, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    if (p.hat) {
      ctx.fillStyle = A.redGrad(ctx, y - r * 1.8, y - r * 0.5);
      ctx.beginPath();
      ctx.moveTo(x - r * 0.95, y - r * 0.55);
      ctx.bezierCurveTo(x - r * 0.7, y - r * 1.6, x + r * 0.4, y - r * 1.9, x + r * 1.25, y - r * 1.15);
      ctx.bezierCurveTo(x + r * 0.7, y - r * 1.1, x + r * 0.8, y - r * 0.8, x + r * 0.95, y - r * 0.55);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(x - r * 1.05, y - r * 0.75, r * 2.1, r * 0.34, r * 0.17);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + r * 1.27, y - r * 1.12, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // luz de fim de tarde por cima
  const fg = ctx.createLinearGradient(0, 0, S, S);
  fg.addColorStop(0, "rgba(255,200,140,0.12)");
  fg.addColorStop(1, "rgba(60,20,10,0.18)");
  ctx.fillStyle = fg;
  ctx.fillRect(0, 0, S, S);
  cache = c;
  return c;
}
