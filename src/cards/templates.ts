/**
 * Os 9 modelos do Cartão de Natal. Cada um tem cenário, moldura e enfeites próprios (não são cópias recoloridas).
 * Tudo é desenhado em vetor e se adapta a qualquer tamanho e às orientações retrato e paisagem.
 * O texto nunca faz parte do fundo: é desenhado por cima, com os dados que a família digitou.
 */
import { F, wrapLines } from "../lib/shareKit";
import * as A from "./art";
import type { Box, Ctx } from "./art";
import type { Anim, CardData, FaceMode, TemplateId } from "./types";

export type FontKey = "hand" | "cinzel" | "serif" | "serifI" | "ps" | "xmas" | "letter" | "sans";
const font = (k: FontKey, px: number) =>
  k === "hand" ? F.hand(px) : k === "cinzel" ? F.cinzel(px, 700) : k === "serif" ? `600 ${px}px 'Playfair Display', Georgia, serif` : k === "serifI" ? F.serif(px, true) : k === "ps" ? F.ps(px) : k === "xmas" ? F.xmas(px) : k === "letter" ? F.letter(px, 500) : F.sans(px, 700);

export type TextStyle = {
  title: FontKey;
  titleColor: string | "gold";
  family: FontKey;
  familyColor: string | "gold";
  body: FontKey;
  bodyColor: string;
  accent: string;
  soft: string; // cor das linhas pequenas (filhos, ano)
  shadow?: string;
};

export type Theme = {
  paper: [string, string, string]; // fundo das páginas internas
  ink: string;
  accent: string;
  gold: boolean;
  style: TextStyle;
  /** Cores do fundo das imagens para redes (PNG/vídeo) */
  stage: [string, string];
};

export type Template = {
  id: TemplateId;
  name: string;
  tagline: string;
  theme: Theme;
  draw: (ctx: Ctx, W: number, H: number, d: CardData, mode: FaceMode, a: Anim) => void;
  ornament: (ctx: Ctx, cx: number, cy: number, s: number) => void;
};

/* ---------------------------------------------------------------- utilidades de texto e foto */

function paintOf(ctx: Ctx, c: string | "gold", x0: number, x1: number, y: number) {
  return c === "gold" ? A.goldGrad(ctx, x0, y - 30, x1, y + 30) : c;
}

/** Tamanho de fonte que faz o texto caber na largura (nunca corta). */
export function fitPx(ctx: Ctx, text: string, k: FontKey, px: number, maxW: number, min = 8) {
  let p = px;
  ctx.font = font(k, p);
  while (p > min && ctx.measureText(text).width > maxW) {
    p *= 0.94;
    ctx.font = font(k, p);
  }
  return p;
}

export function drawLine(ctx: Ctx, text: string, k: FontKey, px: number, color: string | "gold", cx: number, y: number, maxW: number, alpha = 1, shadow?: string, spacing = 0) {
  if (!text || alpha <= 0) return px;
  ctx.save();
  ctx.globalAlpha *= alpha;
  const p = fitPx(ctx, text, k, px, maxW);
  ctx.font = font(k, p);
  if (spacing) (ctx as any).letterSpacing = `${spacing * p}px`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const w = ctx.measureText(text).width;
  if (shadow) {
    ctx.shadowColor = shadow;
    ctx.shadowBlur = p * 0.18;
    ctx.shadowOffsetY = p * 0.04;
  }
  ctx.fillStyle = paintOf(ctx, color, cx - w / 2, cx + w / 2, y);
  ctx.fillText(text, cx, y);
  ctx.restore();
  return p;
}

/** Bloco de texto da família: [título] · nome · divisor · mensagem · filhos · assinatura · ano. Encolhe até caber. */
export function textBlock(
  ctx: Ctx,
  d: CardData,
  box: Box,
  st: TextStyle,
  mode: FaceMode,
  a: Anim,
  opt: { title?: boolean; family?: boolean; divider?: (cx: number, y: number, s: number) => void; maxLines?: number } = {},
) {
  const withTitle = !!opt.title,
    withFamily = opt.family !== false;
  const cx = box.x + box.w / 2;
  const base = Math.min(box.h, box.w * 1.3);
  const msg = mode === "front" ? d.message.trim() : "";
  const kids = mode === "front" ? d.children.trim() : "";
  const sign = mode === "front" ? d.signature.trim() : "";
  const year = d.year.trim();
  for (let s = 1; s > 0.4; s -= 0.05) {
    const tPx = base * 0.22 * s,
      fPx = base * 0.165 * s,
      mPx = base * 0.092 * s,
      kPx = base * 0.056 * s,
      sPx = base * 0.125 * s,
      yPx = base * 0.052 * s;
    ctx.font = font(st.body, mPx);
    const lines = msg ? wrapLines(ctx, msg, box.w * 0.94).filter((l, i, arr) => l || i < arr.length - 1) : [];
    if (lines.length > (opt.maxLines ?? 6) && s > 0.45) continue;
    const items: { h: number; draw: (y: number) => void }[] = [];
    if (withTitle && d.title.trim()) items.push({ h: tPx * 1.12, draw: (y) => drawLine(ctx, d.title, st.title, tPx, st.titleColor, cx, y + tPx * 0.56, box.w, a.title, st.shadow) });
    if (withFamily && d.family.trim()) items.push({ h: fPx * 1.3, draw: (y) => drawLine(ctx, d.family, st.family, fPx, st.familyColor, cx, y + fPx * 0.65, box.w, a.family, st.shadow) });
    if (opt.divider && (lines.length || kids || sign)) items.push({ h: fPx * 0.62, draw: (y) => a.message > 0 && (ctx.save(), (ctx.globalAlpha *= a.message), opt.divider!(cx, y + fPx * 0.31, fPx * 0.5), ctx.restore()) });
    if (lines.length)
      items.push({
        h: lines.length * mPx * 1.42 + mPx * 0.2,
        draw: (y) => lines.forEach((l, i) => drawLine(ctx, l, st.body, mPx, st.bodyColor, cx, y + mPx * 0.71 + i * mPx * 1.42, box.w, a.message)),
      });
    if (kids) items.push({ h: kPx * 2, draw: (y) => drawLine(ctx, kids.toUpperCase(), "sans", kPx, st.soft, cx, y + kPx, box.w, a.message, undefined, 0.16) });
    if (sign) items.push({ h: sPx * 1.25, draw: (y) => drawLine(ctx, sign, "hand", sPx, st.accent, cx, y + sPx * 0.62, box.w, a.sign, st.shadow) });
    if (year) items.push({ h: yPx * 1.9, draw: (y) => drawLine(ctx, year, "cinzel", yPx, st.soft, cx, y + yPx, box.w, a.sign, undefined, 0.3) });
    const total = items.reduce((t, i) => t + i.h, 0);
    if (total > box.h && s > 0.45) continue;
    let y = box.y + Math.max(0, (box.h - total) / 2);
    for (const it of items) {
      it.draw(y);
      y += it.h;
    }
    return;
  }
}

/** Desenha a foto dentro de uma forma (clip), respeitando o enquadramento escolhido. Nunca distorce. */
/** Última área de foto desenhada (o editor usa para arrastar a foto dentro da moldura). */
export let lastPhotoBox: Box | null = null;

export function drawPhoto(ctx: Ctx, d: CardData, box: Box, clip: (ctx: Ctx) => void, a: Anim, u: number, empty = "#E9E2D3") {
  lastPhotoBox = { ...box };
  ctx.save();
  clip(ctx);
  ctx.clip();
  if (!d.photo || !d.photoW) {
    const g = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h);
    g.addColorStop(0, A.shade(empty, 0.25));
    g.addColorStop(1, A.shade(empty, -0.12));
    ctx.fillStyle = g;
    ctx.fillRect(box.x, box.y, box.w, box.h);
    const cx = box.x + box.w / 2,
      cy = box.y + box.h / 2,
      s = Math.min(box.w, box.h) * 0.16;
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "#6B5A44";
    ctx.beginPath();
    ctx.roundRect(cx - s, cy - s * 0.65, s * 2, s * 1.4, s * 0.25);
    ctx.fill();
    ctx.fillStyle = A.shade(empty, 0.25);
    ctx.beginPath();
    ctx.arc(cx, cy + s * 0.05, s * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6B5A44";
    ctx.fillRect(cx - s * 0.35, cy - s * 0.85, s * 0.7, s * 0.25);
    ctx.font = F.sans(Math.max(10, s * 0.42), 700);
    ctx.textAlign = "center";
    ctx.fillText("Sua foto aqui", cx, cy + s * 1.4);
    ctx.restore();
    return;
  }
  const c = d.crop;
  const pw = d.photoW,
    ph = d.photoH;
  const cover = Math.max(box.w / pw, box.h / ph),
    contain = Math.min(box.w / pw, box.h / ph);
  const zoomAnim = a.zoom;
  if (c.fit) {
    // foto inteira + fundo desfocado da própria foto (sem cortar ninguém)
    ctx.save();
    ctx.filter = `blur(${Math.round(18 * u)}px) brightness(0.85)`;
    ctx.drawImage(d.photo, box.x + (box.w - pw * cover * 1.1) / 2, box.y + (box.h - ph * cover * 1.1) / 2, pw * cover * 1.1, ph * cover * 1.1);
    ctx.restore();
  }
  const k = (c.fit ? contain : cover) * Math.max(1, c.zoom) * zoomAnim;
  const dw = pw * k,
    dh = ph * k;
  const ex = Math.max(0, dw - box.w),
    ey = Math.max(0, dh - box.h);
  const x = box.x + (box.w - dw) / 2 - (c.ox * ex) / 2;
  const y = box.y + (box.h - dh) / 2 - (c.oy * ey) / 2;
  ctx.globalAlpha *= a.photo;
  ctx.drawImage(d.photo, x, y, dw, dh);
  ctx.restore();
}

const rect = (b: Box, r = 0) => (ctx: Ctx) => {
  ctx.beginPath();
  ctx.roundRect(b.x, b.y, b.w, b.h, r);
};
const circle = (cx: number, cy: number, r: number) => (ctx: Ctx) => {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
};
const B = (W: number, H: number, x: number, y: number, w: number, h: number): Box => ({ x: x * W, y: y * H, w: w * W, h: h * H });

function shadowed(ctx: Ctx, u: number, f: () => void, blur = 30, oy = 12, color = "rgba(0,0,0,0.35)") {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur * u;
  ctx.shadowOffsetY = oy * u;
  f();
  ctx.restore();
}

/** Moldura dourada entalhada (bisel + filetes). */
function goldFrame(ctx: Ctx, b: Box, t: number, u: number, r = 0) {
  const o = A.grow(b, t);
  shadowed(ctx, u, () => {
    ctx.fillStyle = A.goldGrad(ctx, o.x, o.y, o.x + o.w, o.y + o.h);
    ctx.beginPath();
    ctx.roundRect(o.x, o.y, o.w, o.h, r + t);
    ctx.roundRect(b.x, b.y, b.w, b.h, r);
    ctx.fill("evenodd");
  });
  ctx.save();
  ctx.lineWidth = 2.2 * u;
  ctx.strokeStyle = "rgba(110,70,10,0.75)";
  for (const k of [0.2, 0.62]) {
    const g = A.grow(b, t * k);
    ctx.beginPath();
    ctx.roundRect(g.x, g.y, g.w, g.h, r + t * k);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255,248,215,0.8)";
  ctx.lineWidth = 1.6 * u;
  const g2 = A.grow(b, t * 0.42);
  ctx.beginPath();
  ctx.roundRect(g2.x, g2.y, g2.w, g2.h, r + t * 0.42);
  ctx.stroke();
  // contas (pérolas) no filete externo
  const g3 = A.grow(b, t * 0.82);
  const per = 2 * (g3.w + g3.h),
    n = Math.round(per / (14 * u));
  ctx.fillStyle = "rgba(255,246,200,0.9)";
  for (let i = 0; i < n; i++) {
    let p = (i / n) * per,
      x = 0,
      y = 0;
    if (p < g3.w) [x, y] = [g3.x + p, g3.y];
    else if ((p -= g3.w) < g3.h) [x, y] = [g3.x + g3.w, g3.y + p];
    else if ((p -= g3.h) < g3.w) [x, y] = [g3.x + g3.w - p, g3.y + g3.h];
    else [x, y] = [g3.x, g3.y + g3.h - (p - g3.w)];
    ctx.beginPath();
    ctx.arc(x, y, 2.4 * u, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  // sombra interna sobre a foto
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(b.x, b.y, b.w, b.h, r);
  ctx.clip();
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 16 * u;
  ctx.lineWidth = 10 * u;
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ctx.roundRect(b.x - 5 * u, b.y - 5 * u, b.w + 10 * u, b.h + 10 * u, r);
  ctx.stroke();
  ctx.restore();
}

function goldDivider(ctx: Ctx, cx: number, y: number, s: number, color?: string) {
  ctx.save();
  ctx.strokeStyle = color ?? A.goldGrad(ctx, cx - s * 4, y, cx + s * 4, y);
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = Math.max(1, s * 0.08);
  for (const k of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + k * s * 0.7, y);
    ctx.lineTo(cx + k * s * 3.6, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + k * s * 3.75, y, s * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(cx, y - s * 0.42);
  ctx.lineTo(cx + s * 0.42, y);
  ctx.lineTo(cx, y + s * 0.42);
  ctx.lineTo(cx - s * 0.42, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function vignette(ctx: Ctx, W: number, H: number, a = 0.35) {
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.6);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${a})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

/* ---------------------------------------------------------------- 1. Dourado */

const dourado: Template = {
  id: "dourado",
  name: "Dourado",
  tagline: "Moldura dourada e laço vermelho",
  theme: {
    paper: ["#FFFDF6", "#F8EEDA", "#EBD7AE"],
    ink: "#4A3520",
    accent: "#9E1B2E",
    gold: true,
    stage: ["#3B0710", "#7A0E1F"],
    style: { title: "hand", titleColor: "gold", family: "cinzel", familyColor: "#8E1427", body: "serifI", bodyColor: "#4A3520", accent: "#9E1B2E", soft: "#9A7A45" },
  },
  ornament: (ctx, cx, cy, s) => (A.holly(ctx, cx - s * 0.5, cy, s, -0.2), A.bow(ctx, cx, cy - s * 0.1, s * 0.55)),
  draw(ctx, W, H, d, mode, a) {
    const u = Math.min(W, H) / 1000,
      land = W > H;
    A.paperTexture(ctx, W, H, ["#FFFDF6", "#F7EBD3", "#E6CFA3"], "rgba(160,120,60,0.05)", 21, 900);
    // padrão adamascado discreto
    ctx.save();
    ctx.globalAlpha = 0.07;
    for (let y = 40 * u; y < H; y += 120 * u) for (let x = ((y / (120 * u)) % 2) * 60 * u + 30 * u; x < W; x += 120 * u) A.star5(ctx, x, y, 12 * u, "#B8860B");
    ctx.restore();
    // bordas
    ctx.save();
    ctx.strokeStyle = A.goldGrad(ctx, 0, 0, W, H);
    ctx.lineWidth = 7 * u;
    ctx.strokeRect(26 * u, 26 * u, W - 52 * u, H - 52 * u);
    ctx.lineWidth = 2 * u;
    ctx.strokeRect(42 * u, 42 * u, W - 84 * u, H - 84 * u);
    ctx.restore();
    const cs = 120 * u;
    A.cornerFlourish(ctx, 50 * u, 50 * u, cs, 0);
    A.cornerFlourish(ctx, W - 50 * u, 50 * u, cs, Math.PI / 2);
    A.cornerFlourish(ctx, W - 50 * u, H - 50 * u, cs, Math.PI);
    A.cornerFlourish(ctx, 50 * u, H - 50 * u, cs, -Math.PI / 2);
    const st = this.theme.style;
    const pb = land ? B(W, H, 0.085, 0.15, 0.5, 0.7) : B(W, H, 0.15, 0.19, 0.7, 0.45);
    goldFrame(ctx, pb, 34 * u, u);
    drawPhoto(ctx, d, pb, rect(pb), a, u);
    // azevinho nos cantos de baixo + laço em cima
    A.holly(ctx, pb.x - 6 * u, pb.y + pb.h + 8 * u, 95 * u, 0.4);
    A.holly(ctx, pb.x + pb.w + 6 * u, pb.y + pb.h + 8 * u, 95 * u, Math.PI - 0.4);
    A.bow(ctx, pb.x + pb.w / 2, pb.y - 26 * u, 92 * u, 0, 1.0);
    if (land) textBlock(ctx, d, B(W, H, 0.63, 0.1, 0.31, 0.8), st, mode, a, { title: true, divider: (x, y, s) => goldDivider(ctx, x, y, s) });
    else {
      drawLine(ctx, d.title, st.title, 118 * u, "gold", W / 2, 0.095 * H, W * 0.62, a.title, "rgba(120,80,0,0.25)");
      textBlock(ctx, d, B(W, H, 0.12, 0.695, 0.76, 0.255), st, mode, a, { divider: (x, y, s) => goldDivider(ctx, x, y, s) });
    }
  },
};

/* ---------------------------------------------------------------- 2. Fotográfico (foto instantânea) */

function clothespin(ctx: Ctx, x: number, y: number, s: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const g = ctx.createLinearGradient(-s * 0.2, 0, s * 0.2, 0);
  g.addColorStop(0, "#B07A45");
  g.addColorStop(0.5, "#DDB07A");
  g.addColorStop(1, "#A06C3A");
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = s * 0.15;
  ctx.shadowOffsetY = s * 0.05;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(-s * 0.16, -s * 0.6, s * 0.32, s * 1.2, s * 0.08);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#8E959E";
  ctx.fillRect(-s * 0.19, -s * 0.12, s * 0.38, s * 0.12);
  ctx.strokeStyle = "rgba(90,50,20,0.5)";
  ctx.lineWidth = s * 0.02;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.55);
  ctx.lineTo(0, s * 0.55);
  ctx.stroke();
  ctx.restore();
}

function sticker(ctx: Ctx, x: number, y: number, r: number, u: number, text: string, alpha: number) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(0.16);
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 12 * u;
  ctx.shadowOffsetY = 4 * u;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  g.addColorStop(0, "#E8243F");
  g.addColorStop(1, "#A00D22");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.setLineDash([4 * u, 5 * u]);
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = 2 * u;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  const words = text.split(/\s+/).filter(Boolean);
  const lines = words.length > 1 ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")] : words;
  lines.forEach((l, i) => drawLine(ctx, l, "ps", r * 0.42, "#FFFFFF", 0, (i - (lines.length - 1) / 2) * r * 0.42, r * 1.35));
  ctx.restore();
}

const fotografico: Template = {
  id: "fotografico",
  name: "Fotográfico",
  tagline: "Foto instantânea pendurada no varal de luzes",
  theme: {
    paper: ["#FBFAF6", "#F1EFE6", "#DAD9CC"],
    ink: "#21304F",
    accent: "#C1121F",
    gold: false,
    stage: ["#1D3A2F", "#4E7A5E"],
    style: { title: "ps", titleColor: "#C1121F", family: "ps", familyColor: "#21304F", body: "ps", bodyColor: "#2B3A55", accent: "#C1121F", soft: "#5C6B80" },
  },
  ornament: (ctx, cx, cy, s) => sticker(ctx, cx, cy, s * 0.5, s / 100, "Feliz Natal", 1),
  draw(ctx, W, H, d, mode, a) {
    const u = Math.min(W, H) / 1000,
      land = W > H;
    // tecido de linho verde-sálvia
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#E9F0E5");
    g.addColorStop(1, "#C9D8C4");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.strokeStyle = "#2F4A35";
    ctx.lineWidth = u;
    for (let x = 0; x < W; x += 6 * u) (ctx.beginPath(), ctx.moveTo(x, 0), ctx.lineTo(x, H), ctx.stroke());
    for (let y = 0; y < H; y += 6 * u) (ctx.beginPath(), ctx.moveTo(0, y), ctx.lineTo(W, y), ctx.stroke());
    ctx.restore();
    A.bokeh(ctx, W, H * 0.3, 14, 4, ["#FFD166", "#FFFFFF"], 20 * u, 60 * u, 0.25);
    A.lightString(ctx, -20 * u, W + 20 * u, 0.045 * H, 46 * u, u, a.t);
    // estrelinhas de papel espalhadas
    const r = A.rng(8);
    for (let i = 0; i < 9; i++) A.star5(ctx, r() * W, (0.15 + r() * 0.8) * H, (8 + r() * 10) * u, i % 2 ? "rgba(193,18,31,0.55)" : "rgba(212,165,55,0.7)");
    const st = this.theme.style;
    const pol = land ? B(W, H, 0.07, 0.13, 0.46, 0.8) : B(W, H, 0.14, 0.1, 0.72, 0.6);
    const lip = pol.h * (land ? 0.17 : 0.19),
      pad = pol.w * 0.055;
    const pb: Box = { x: pol.x + pad, y: pol.y + pad, w: pol.w - 2 * pad, h: pol.h - pad - lip };
    ctx.save();
    ctx.translate(pol.x + pol.w / 2, pol.y + pol.h / 2);
    ctx.rotate(-0.035);
    ctx.translate(-(pol.x + pol.w / 2), -(pol.y + pol.h / 2));
    shadowed(ctx, u, () => {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(pol.x, pol.y, pol.w, pol.h);
    }, 34, 16, "rgba(20,40,25,0.4)");
    const pg = ctx.createLinearGradient(pol.x, pol.y, pol.x, pol.y + pol.h);
    pg.addColorStop(0, "#FFFFFF");
    pg.addColorStop(1, "#F2F0EA");
    ctx.fillStyle = pg;
    ctx.fillRect(pol.x, pol.y, pol.w, pol.h);
    drawPhoto(ctx, d, pb, rect(pb), a, u);
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 2 * u;
    ctx.strokeRect(pb.x, pb.y, pb.w, pb.h);
    // nome escrito à mão na borda da foto
    drawLine(ctx, d.family, "ps", lip * 0.5, "#21304F", pol.x + pol.w / 2, pb.y + pb.h + lip * 0.52, pol.w * 0.86, a.family);
    ctx.restore();
    clothespin(ctx, pol.x + pol.w / 2, pol.y - 4 * u, 88 * u, 0.04);
    sticker(ctx, pol.x + pol.w - 22 * u, pol.y + 40 * u, 92 * u, u, d.title || "Feliz Natal", a.title);
    const tb = land ? B(W, H, 0.58, 0.14, 0.37, 0.76) : B(W, H, 0.1, 0.725, 0.8, 0.245);
    textBlock(ctx, d, tb, st, mode, a, { family: false });
  },
};

/* ---------------------------------------------------------------- 3. Guirlanda */

function wreath(ctx: Ctx, cx: number, cy: number, R: number, u: number, seed = 5) {
  const r = A.rng(seed);
  const ring = 78 * u;
  // base escura
  ctx.save();
  ctx.strokeStyle = "#0C3A22";
  ctx.lineWidth = ring * 1.1;
  ctx.beginPath();
  ctx.arc(cx, cy, R + ring * 0.45, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  const n = 46;
  for (let layer = 0; layer < 2; layer++)
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + layer * 0.07;
      const rr = R + ring * (0.15 + r() * 0.65);
      A.sprig(ctx, cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, ring * (1.3 + r() * 0.4), ang + Math.PI / 2 + (r() - 0.5) * 0.5, seed * 100 + i + layer * 50, false);
    }
  const cols = ["#D4A537", "#C1121F", "#F2D27A", "#B80E25"];
  for (let i = 0; i < 16; i++) {
    const ang = (i / 16) * Math.PI * 2 + 0.2;
    const rr = R + ring * (0.3 + r() * 0.4);
    if (Math.sin(ang) > 0.82) continue; // espaço do laço
    if (i % 3 === 0) A.pineCone(ctx, cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, 46 * u, ang);
    else A.bauble(ctx, cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, (15 + r() * 7) * u, cols[i % 4]);
  }
  for (let i = 0; i < 26; i++) {
    const ang = r() * Math.PI * 2;
    const rr = R + ring * (0.1 + r() * 0.8);
    A.berry(ctx, cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, 7 * u);
  }
}

const guirlanda: Template = {
  id: "guirlanda",
  name: "Guirlanda",
  tagline: "Guirlanda de pinheiro com a foto bem no centro",
  theme: {
    paper: ["#FBF7EC", "#F1EAD6", "#DCCFAE"],
    ink: "#173D2A",
    accent: "#B80E25",
    gold: true,
    stage: ["#06210F", "#1E5A3A"],
    style: { title: "hand", titleColor: "#FFF1CF", family: "cinzel", familyColor: "gold", body: "serifI", bodyColor: "#EEF5EC", accent: "#FFD98A", soft: "#C6D9C9", shadow: "rgba(0,0,0,0.35)" },
  },
  ornament: (ctx, cx, cy, s) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(0.22, 0.22);
    wreath(ctx, 0, 0, s * 1.1, s / 100);
    ctx.restore();
  },
  draw(ctx, W, H, d, mode, a) {
    const u = Math.min(W, H) / 1000,
      land = W > H;
    const g = ctx.createRadialGradient(W / 2, H * 0.38, 0, W / 2, H * 0.5, Math.max(W, H) * 0.8);
    g.addColorStop(0, "#2B7A4F");
    g.addColorStop(0.5, "#16502F");
    g.addColorStop(1, "#08281A");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    A.bokeh(ctx, W, H, 26, 31, ["#FFD98A", "#FFFFFF"], 10 * u, 46 * u, 0.22);
    A.snowfall(ctx, W, H, 90, 12, u, "255,255,255", 0);
    const st = this.theme.style;
    const cx = land ? 0.3 * W : W / 2,
      cy = land ? 0.5 * H : 0.375 * H,
      R = land ? 0.29 * H : 0.265 * W;
    // halo dourado atrás da foto
    const halo = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.6);
    halo.addColorStop(0, "rgba(255,220,140,0.45)");
    halo.addColorStop(1, "rgba(255,220,140,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);
    const pb: Box = { x: cx - R, y: cy - R, w: 2 * R, h: 2 * R };
    drawPhoto(ctx, d, pb, circle(cx, cy, R), a, u);
    ctx.save();
    ctx.strokeStyle = A.goldGrad(ctx, cx - R, cy - R, cx + R, cy + R);
    ctx.lineWidth = 8 * u;
    ctx.beginPath();
    ctx.arc(cx, cy, R + 2 * u, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    wreath(ctx, cx, cy, R + 8 * u, u);
    A.bow(ctx, cx, cy + R + 52 * u, 96 * u, 0, 1.05);
    if (land) textBlock(ctx, d, B(W, H, 0.6, 0.1, 0.35, 0.8), st, mode, a, { title: true, divider: (x, y, s) => goldDivider(ctx, x, y, s) });
    else {
      drawLine(ctx, d.title, st.title, 116 * u, st.titleColor, W / 2, 0.072 * H, W * 0.7, a.title, st.shadow);
      textBlock(ctx, d, B(W, H, 0.1, 0.705, 0.8, 0.265), st, mode, a, { divider: (x, y, s) => goldDivider(ctx, x, y, s) });
    }
  },
};

/* ---------------------------------------------------------------- 4. Estrelado */

function bigStar(ctx: Ctx, x: number, y: number, r: number) {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
  glow.addColorStop(0, "rgba(255,236,170,0.8)");
  glow.addColorStop(0.3, "rgba(255,214,120,0.25)");
  glow.addColorStop(1, "rgba(255,214,120,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 8;
    const rr = i % 4 === 0 ? r : i % 2 === 0 ? r * 0.55 : r * 0.24;
    ctx.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = A.goldGrad(ctx, x - r, y - r, x + r, y + r);
  ctx.fill();
}

const estrelado: Template = {
  id: "estrelado",
  name: "Estrelado",
  tagline: "Céu azul-marinho, estrelas e detalhes em ouro",
  theme: {
    paper: ["#F9F7F1", "#EEEAE0", "#D7D1C2"],
    ink: "#13234D",
    accent: "#B8860B",
    gold: true,
    stage: ["#050B1F", "#1C3166"],
    style: { title: "hand", titleColor: "gold", family: "cinzel", familyColor: "#FFF4D6", body: "serifI", bodyColor: "#E6ECFA", accent: "#F2D27A", soft: "#AFC0E6", shadow: "rgba(0,0,0,0.4)" },
  },
  ornament: (ctx, cx, cy, s) => bigStar(ctx, cx, cy, s * 0.45),
  draw(ctx, W, H, d, mode, a) {
    const u = Math.min(W, H) / 1000,
      land = W > H;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#060E28");
    g.addColorStop(0.55, "#12245A");
    g.addColorStop(1, "#203E7E");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const mw = ctx.createLinearGradient(0, H * 0.2, W, H * 0.6);
    mw.addColorStop(0, "rgba(140,170,255,0)");
    mw.addColorStop(0.5, "rgba(160,190,255,0.12)");
    mw.addColorStop(1, "rgba(140,170,255,0)");
    ctx.fillStyle = mw;
    ctx.fillRect(0, 0, W, H);
    A.stars(ctx, W, H, 420, 9, 1, 2 * u);
    const r = A.rng(77);
    for (let i = 0; i < 16; i++) A.twinkle(ctx, r() * W, r() * H, (10 + r() * 18) * u, "#FFE7A0", a.t < 0 ? 0.9 : 0.5 + 0.5 * Math.sin(a.t * 3 + i));
    // constelação dourada
    ctx.save();
    ctx.strokeStyle = "rgba(242,210,122,0.45)";
    ctx.lineWidth = 1.6 * u;
    const pts = [
      [0.08, 0.2],
      [0.16, 0.14],
      [0.24, 0.19],
      [0.21, 0.27],
    ].map(([x, y]) => [x * W, y * H]);
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    pts.forEach(([x, y]) => A.star5(ctx, x, y, 7 * u, "#F2D27A"));
    ctx.restore();
    // lua crescente
    const mx = land ? W * 0.535 : W * 0.86,
      my = land ? H * 0.1 : H * 0.09,
      mr = (land ? 38 : 46) * u;
    ctx.save();
    ctx.shadowColor = "rgba(255,240,200,0.8)";
    ctx.shadowBlur = 30 * u;
    ctx.fillStyle = "#FFF3CF";
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(mx + mr * 0.45, my - mr * 0.2, mr * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // redesenha o céu onde a lua "comeu" (destination-out abre buraco transparente)
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    const st = this.theme.style;
    const pb = land ? B(W, H, 0.08, 0.1, 0.42, 0.82) : B(W, H, 0.17, 0.17, 0.66, 0.5);
    const arch = (c: Ctx) => A.archPath(c, pb);
    // molduras duplas em ouro
    ctx.save();
    ctx.strokeStyle = A.goldGrad(ctx, pb.x, pb.y, pb.x + pb.w, pb.y + pb.h);
    ctx.lineWidth = 3 * u;
    A.archPath(ctx, A.grow(pb, 22 * u));
    ctx.stroke();
    ctx.lineWidth = 9 * u;
    ctx.shadowColor = "rgba(255,210,120,0.6)";
    ctx.shadowBlur = 20 * u;
    A.archPath(ctx, A.grow(pb, 6 * u));
    ctx.stroke();
    ctx.restore();
    drawPhoto(ctx, d, pb, arch, a, u, "#D9DEEA");
    // estrelinhas sobre o arco
    for (let i = 0; i <= 8; i++) {
      const ang = Math.PI + (i / 8) * Math.PI;
      const R = pb.w / 2 + 40 * u;
      A.star5(ctx, pb.x + pb.w / 2 + Math.cos(ang) * R, pb.y + pb.w / 2 + Math.sin(ang) * R, (i % 2 ? 7 : 11) * u, "#F2D27A");
    }
    bigStar(ctx, pb.x + pb.w / 2, pb.y - 46 * u, 40 * u);
    if (land) textBlock(ctx, d, B(W, H, 0.59, 0.16, 0.37, 0.74), st, mode, a, { title: true, divider: (x, y, s) => goldDivider(ctx, x, y, s) });
    else {
      drawLine(ctx, d.title, st.title, 104 * u, "gold", W / 2, 0.065 * H, W * 0.6, a.title, st.shadow);
      textBlock(ctx, d, B(W, H, 0.1, 0.71, 0.8, 0.255), st, mode, a, { divider: (x, y, s) => goldDivider(ctx, x, y, s) });
    }
  },
};

/* ---------------------------------------------------------------- 5. Papai Noel */

function furFrame(ctx: Ctx, b: Box, u: number) {
  const t = 46 * u;
  const o = A.grow(b, t);
  shadowed(ctx, u, () => {
    ctx.fillStyle = A.redGrad(ctx, o.y, o.y + o.h);
    ctx.beginPath();
    ctx.roundRect(o.x, o.y, o.w, o.h, 34 * u);
    ctx.roundRect(b.x, b.y, b.w, b.h, 14 * u);
    ctx.fill("evenodd");
  }, 30, 14, "rgba(60,0,10,0.45)");
  // pelúcia branca contornando a foto
  const r = A.rng(4);
  const ring = A.grow(b, 10 * u);
  const per = 2 * (ring.w + ring.h);
  const n = Math.round(per / (15 * u));
  for (let pass = 0; pass < 2; pass++)
    for (let i = 0; i < n; i++) {
      let p = (i / n) * per,
        x = 0,
        y = 0;
      if (p < ring.w) [x, y] = [ring.x + p, ring.y];
      else if ((p -= ring.w) < ring.h) [x, y] = [ring.x + ring.w, ring.y + p];
      else if ((p -= ring.h) < ring.w) [x, y] = [ring.x + ring.w - p, ring.y + ring.h];
      else [x, y] = [ring.x, ring.y + ring.h - (p - ring.w)];
      const rr = (pass ? 9 : 13) * u * (0.8 + r() * 0.4);
      const gr = ctx.createRadialGradient(x - rr * 0.3, y - rr * 0.3, rr * 0.1, x, y, rr);
      gr.addColorStop(0, "#FFFFFF");
      gr.addColorStop(1, pass ? "#F1F1F1" : "#DADDE3");
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(x + (r() - 0.5) * 4 * u, y + (r() - 0.5) * 4 * u, rr, 0, Math.PI * 2);
      ctx.fill();
    }
  // cinto preto com fivela dourada
  const by = o.y + o.h - t * 0.5;
  ctx.fillStyle = "#151515";
  ctx.fillRect(o.x - 8 * u, by - 18 * u, o.w + 16 * u, 36 * u);
  const bw = 90 * u;
  ctx.strokeStyle = A.goldGrad(ctx, o.x + o.w / 2 - bw / 2, by, o.x + o.w / 2 + bw / 2, by);
  ctx.lineWidth = 10 * u;
  ctx.strokeRect(o.x + o.w / 2 - bw / 2, by - 28 * u, bw, 56 * u);
}

const papainoel: Template = {
  id: "papainoel",
  name: "Papai Noel",
  tagline: "O Papai Noel acenando ao lado da foto",
  theme: {
    paper: ["#FFFBF5", "#F8EDE3", "#E9D2C2"],
    ink: "#5A0A16",
    accent: "#C8102E",
    gold: false,
    stage: ["#4A0410", "#B80E25"],
    style: { title: "hand", titleColor: "#FFFFFF", family: "cinzel", familyColor: "#FFF2C7", body: "serifI", bodyColor: "#FFF5EC", accent: "#FFE08A", soft: "#FFCFCF", shadow: "rgba(60,0,10,0.5)" },
  },
  ornament: (ctx, cx, cy, s) => A.santa(ctx, cx, cy - s * 0.3, s * 0.32),
  draw(ctx, W, H, d, mode, a) {
    const u = Math.min(W, H) / 1000,
      land = W > H;
    const g = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, "#E0243B");
    g.addColorStop(0.6, "#B20D24");
    g.addColorStop(1, "#740516");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const r = A.rng(13);
    for (let i = 0; i < 26; i++) A.crystal(ctx, r() * W, r() * H, (14 + r() * 26) * u, "rgba(255,255,255,0.13)", 2.4 * u);
    A.snowfall(ctx, W, H, 120, 3, u, "255,255,255", a.t < 0 ? 0 : a.t);
    // chão de neve
    const gy = land ? 0.86 * H : 0.9 * H;
    ctx.fillStyle = "#F4F8FF";
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.bezierCurveTo(W * 0.25, gy - 40 * u, W * 0.55, gy + 30 * u, W, gy - 30 * u);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(170,195,230,0.5)";
    ctx.beginPath();
    ctx.moveTo(0, gy + 30 * u);
    ctx.bezierCurveTo(W * 0.3, gy + 10 * u, W * 0.6, gy + 50 * u, W, gy + 20 * u);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.fill();
    const st = this.theme.style;
    const pb = land ? B(W, H, 0.07, 0.11, 0.5, 0.66) : B(W, H, 0.12, 0.15, 0.76, 0.44);
    furFrame(ctx, pb, u);
    drawPhoto(ctx, d, pb, rect(pb, 14 * u), a, u);
    if (land) {
      A.santa(ctx, 0.73 * W, 0.6 * H, 76 * u);
      A.giftBox(ctx, 0.84 * W, gy + 6 * u, 70 * u, 60 * u, "#1F7A47", "#FFD166", u);
      textBlock(ctx, d, B(W, H, 0.6, 0.06, 0.36, 0.46), st, mode, a, { title: true, maxLines: 4 });
    } else {
      A.santa(ctx, 0.2 * W, 0.745 * H, 86 * u);
      A.giftBox(ctx, 0.32 * W, gy + 16 * u, 66 * u, 58 * u, "#1F7A47", "#FFD166", u);
      drawLine(ctx, d.title, st.title, 112 * u, st.titleColor, W / 2, 0.072 * H, W * 0.7, a.title, st.shadow);
      textBlock(ctx, d, B(W, H, 0.38, 0.655, 0.58, 0.245), st, mode, a, {});
    }
  },
};

/* ---------------------------------------------------------------- 6. Rústico */

function tape(ctx: Ctx, x: number, y: number, w: number, h: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = "rgba(240,228,196,0.78)";
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2);
  for (let i = 0; i <= 6; i++) ctx.lineTo(-w / 2 + (w * i) / 6, -h / 2 + (i % 2 ? 2 : -1));
  ctx.lineTo(w / 2, h / 2);
  for (let i = 6; i >= 0; i--) ctx.lineTo(-w / 2 + (w * i) / 6, h / 2 + (i % 2 ? -2 : 1));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

const rustico: Template = {
  id: "rustico",
  name: "Rústico",
  tagline: "Papel kraft, lanterna acesa e pinhas",
  theme: {
    paper: ["#F3E6CF", "#E6D2AF", "#CDB083"],
    ink: "#3B2414",
    accent: "#8C2A1C",
    gold: false,
    stage: ["#2A1A0E", "#6B4A2A"],
    style: { title: "serifI", titleColor: "#3B2414", family: "serif", familyColor: "#3B2414", body: "letter", bodyColor: "#3E2A1A", accent: "#8C2A1C", soft: "#6E5236" },
  },
  ornament: (ctx, cx, cy, s) => (A.pineCone(ctx, cx - s * 0.25, cy, s * 0.5, -0.4), A.pineCone(ctx, cx + s * 0.2, cy + s * 0.05, s * 0.45, 0.5), A.holly(ctx, cx, cy - s * 0.12, s * 0.5, -1.4)),
  draw(ctx, W, H, d, mode, a) {
    const u = Math.min(W, H) / 1000,
      land = W > H;
    A.paperTexture(ctx, W, H, ["#D8B88E", "#C49D6E", "#A47B4E"], "rgba(80,50,20,0.12)", 33, 2200);
    // manchas suaves do papel
    const r = A.rng(5);
    for (let i = 0; i < 10; i++) {
      const x = r() * W,
        y = r() * H,
        rr = (80 + r() * 180) * u;
      const gg = ctx.createRadialGradient(x, y, 0, x, y, rr);
      gg.addColorStop(0, "rgba(110,70,30,0.08)");
      gg.addColorStop(1, "rgba(110,70,30,0)");
      ctx.fillStyle = gg;
      ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    // borda de barbante
    ctx.save();
    ctx.setLineDash([10 * u, 7 * u]);
    ctx.strokeStyle = "rgba(70,40,15,0.6)";
    ctx.lineWidth = 3 * u;
    ctx.strokeRect(30 * u, 30 * u, W - 60 * u, H - 60 * u);
    ctx.restore();
    const st = this.theme.style;
    // lanterna pendurada
    const lx = land ? 0.94 * W : 0.12 * W;
    ctx.strokeStyle = "#5B3A1E";
    ctx.lineWidth = 3 * u;
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx, 0.035 * H);
    ctx.stroke();
    A.lantern(ctx, lx, 0.035 * H + 12 * u, 92 * u);
    const pb = land ? B(W, H, 0.085, 0.13, 0.48, 0.66) : B(W, H, 0.14, 0.18, 0.72, 0.44);
    const border = 26 * u;
    ctx.save();
    ctx.translate(pb.x + pb.w / 2, pb.y + pb.h / 2);
    ctx.rotate(0.022);
    ctx.translate(-(pb.x + pb.w / 2), -(pb.y + pb.h / 2));
    shadowed(ctx, u, () => {
      ctx.fillStyle = "#FBF7EE";
      const o = A.grow(pb, border);
      ctx.fillRect(o.x, o.y, o.w, o.h);
    }, 26, 10, "rgba(60,30,10,0.4)");
    drawPhoto(ctx, d, pb, rect(pb), a, u);
    ctx.restore();
    tape(ctx, pb.x + 10 * u, pb.y - 6 * u, 130 * u, 40 * u, -0.7);
    tape(ctx, pb.x + pb.w - 10 * u, pb.y - 6 * u, 130 * u, 40 * u, 0.7);
    // pinhas e ramos nos cantos de baixo
    const by = land ? 0.92 * H : 0.95 * H;
    A.sprig(ctx, 0.02 * W, by, 230 * u, -0.35, 71);
    A.sprig(ctx, 0.04 * W, by + 10 * u, 180 * u, -0.05, 72);
    A.pineCone(ctx, 0.12 * W, by - 10 * u, 70 * u, -0.6);
    A.sprig(ctx, 0.98 * W, by, 230 * u, Math.PI + 0.35, 73);
    A.pineCone(ctx, 0.88 * W, by - 6 * u, 76 * u, 0.5);
    A.pineCone(ctx, 0.93 * W, by - 30 * u, 60 * u, 1.1);
    if (land) textBlock(ctx, d, B(W, H, 0.62, 0.18, 0.33, 0.66), st, mode, a, { title: true, divider: (x, y, s) => goldDivider(ctx, x, y, s, "#6E4A28") });
    else {
      drawLine(ctx, "BOAS FESTAS", "cinzel", 26 * u, "#6E4A28", W / 2, 0.052 * H, W * 0.5, a.title, undefined, 0.35);
      drawLine(ctx, d.title, st.title, 96 * u, st.titleColor, W / 2, 0.1 * H, W * 0.6, a.title);
      textBlock(ctx, d, B(W, H, 0.17, 0.685, 0.66, 0.235), st, mode, a, { divider: (x, y, s) => goldDivider(ctx, x, y, s, "#6E4A28") });
    }
  },
};

/* ---------------------------------------------------------------- 7. Vila de Natal */

function village(ctx: Ctx, W: number, H: number, top: number, u: number, t: number) {
  // morros de neve
  ctx.fillStyle = "#C9D8F0";
  ctx.beginPath();
  ctx.moveTo(0, top + 60 * u);
  ctx.bezierCurveTo(W * 0.3, top - 40 * u, W * 0.6, top + 80 * u, W, top);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fill();
  const hs = (H - top) / 300;
  const s = Math.min(u, hs * u * 1.2);
  const houses: [number, number, number, string][] = [
    [0.04, 120, 100, "#9C3B2E"],
    [0.2, 150, 130, "#3D5A80"],
    [0.4, 130, 110, "#7A4E2D"],
    [0.6, 160, 140, "#2E6B4E"],
    [0.8, 130, 105, "#8C2A3C"],
  ];
  const base = top + (H - top) * 0.55;
  for (const [x, w, h, c] of houses) A.house(ctx, x * W, base, w * s, h * s, c, s, Math.round(x * 100));
  for (const x of [0.15, 0.36, 0.56, 0.76, 0.97]) A.pineTree(ctx, x * W, base + 6 * s, 120 * s, s, true, true, Math.round(x * 50));
  // trilho e trem
  const ty = top + (H - top) * 0.82;
  ctx.fillStyle = "#EEF4FF";
  ctx.beginPath();
  ctx.moveTo(0, base - 4 * s);
  ctx.bezierCurveTo(W * 0.4, base - 20 * s, W * 0.7, base + 10 * s, W, base - 10 * s);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fill();
  ctx.fillStyle = "#6B5A4A";
  ctx.fillRect(0, ty + 2 * s, W, 6 * s);
  const trainX = t < 0 ? 0.52 * W : ((t * 0.12 * W) % (W + 400 * s)) - 300 * s;
  A.train(ctx, trainX, ty + 2 * s, 92 * s, s);
}

const vila: Template = {
  id: "vila",
  name: "Vila de Natal",
  tagline: "Vila iluminada, neve, casinhas e trenzinho",
  theme: {
    paper: ["#F7F9FD", "#E9EEF8", "#CCD7EA"],
    ink: "#13274F",
    accent: "#C1121F",
    gold: true,
    stage: ["#081230", "#2A407A"],
    style: { title: "xmas", titleColor: "#FFFFFF", family: "cinzel", familyColor: "#FFE7A6", body: "serifI", bodyColor: "#EAF0FF", accent: "#FFD98A", soft: "#B8C8EC", shadow: "rgba(255,200,90,0.45)" },
  },
  ornament: (ctx, cx, cy, s) => A.house(ctx, cx - s * 0.35, cy + s * 0.35, s * 0.7, s * 0.55, "#9C3B2E", s / 140, 2),
  draw(ctx, W, H, d, mode, a) {
    const u = Math.min(W, H) / 1000,
      land = W > H;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#081230");
    g.addColorStop(0.55, "#1B2F64");
    g.addColorStop(1, "#425C99");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    A.stars(ctx, W, H, 260, 41, 0.75, 1.8 * u);
    A.snowfall(ctx, W, H, 150, 9, u, "255,255,255", a.t < 0 ? 0 : a.t);
    const st = this.theme.style;
    const vTop = land ? 0.74 * H : 0.795 * H;
    const pb = land ? B(W, H, 0.07, 0.08, 0.47, 0.6) : B(W, H, 0.13, 0.145, 0.74, 0.39);
    // moldura branca de janela com neve no topo e pingentes de gelo
    const o = A.grow(pb, 24 * u);
    shadowed(ctx, u, () => {
      ctx.fillStyle = "#F6F9FF";
      ctx.beginPath();
      ctx.roundRect(o.x, o.y, o.w, o.h, 14 * u);
      ctx.fill();
    }, 40, 10, "rgba(255,210,120,0.4)");
    drawPhoto(ctx, d, pb, rect(pb, 6 * u), a, u, "#D8E2F2");
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(o.x - 12 * u, o.y + 18 * u);
    const bumps = 9;
    for (let i = 0; i <= bumps; i++) {
      const x = o.x - 12 * u + ((o.w + 24 * u) * i) / bumps;
      ctx.quadraticCurveTo(x - (o.w / bumps) * 0.5, o.y - 26 * u - (i % 2) * 8 * u, x, o.y + 4 * u);
    }
    ctx.lineTo(o.x + o.w + 12 * u, o.y + 18 * u);
    ctx.closePath();
    ctx.fill();
    const rr = A.rng(3);
    ctx.fillStyle = "rgba(225,240,255,0.95)";
    for (let i = 0; i < 16; i++) {
      const x = o.x + 20 * u + rr() * (o.w - 40 * u),
        L = (12 + rr() * 26) * u;
      ctx.beginPath();
      ctx.moveTo(x - 5 * u, o.y + o.h - 2 * u);
      ctx.lineTo(x + 5 * u, o.y + o.h - 2 * u);
      ctx.lineTo(x, o.y + o.h + L);
      ctx.fill();
    }
    village(ctx, W, H, vTop, u, a.t);
    if (land) textBlock(ctx, d, B(W, H, 0.59, 0.07, 0.37, 0.64), st, mode, a, { title: true, maxLines: 4 });
    else {
      drawLine(ctx, d.title, st.title, 104 * u, st.titleColor, W / 2, 0.07 * H, W * 0.72, a.title, st.shadow);
      textBlock(ctx, d, B(W, H, 0.1, 0.578, 0.8, 0.212), st, mode, a, { maxLines: 4 });
    }
  },
};

/* ---------------------------------------------------------------- 8. Presentes Mágicos */

const presentes: Template = {
  id: "presentes",
  name: "Presentes Mágicos",
  tagline: "Presentes, fitas de cetim e luz dourada",
  theme: {
    paper: ["#FFF9F0", "#F6EAD8", "#E4CCA8"],
    ink: "#4A0B19",
    accent: "#B8860B",
    gold: true,
    stage: ["#2A0410", "#6E1024"],
    style: { title: "hand", titleColor: "gold", family: "cinzel", familyColor: "#FFF1D2", body: "serifI", bodyColor: "#FBE9DA", accent: "#F2D27A", soft: "#E3B9A7", shadow: "rgba(0,0,0,0.4)" },
  },
  ornament: (ctx, cx, cy, s) => (A.giftBox(ctx, cx - s * 0.35, cy + s * 0.35, s * 0.5, s * 0.45, "#B80E25", "#F2D27A", s / 120), A.giftBox(ctx, cx + s * 0.1, cy + s * 0.35, s * 0.36, s * 0.55, "#1F7A47", "#F2D27A", s / 120)),
  draw(ctx, W, H, d, mode, a) {
    const u = Math.min(W, H) / 1000,
      land = W > H;
    const g = ctx.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.5, Math.max(W, H) * 0.8);
    g.addColorStop(0, "#8E1A30");
    g.addColorStop(0.55, "#5C0B1C");
    g.addColorStop(1, "#2B040D");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // raios de luz dourada
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const ox = W / 2,
      oy = -0.05 * H;
    for (let i = 0; i < 12; i++) {
      const ang = Math.PI / 2 + (i - 5.5) * 0.12;
      const L = Math.hypot(W, H);
      ctx.fillStyle = `rgba(255,210,130,${0.035 + (i % 2) * 0.02})`;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + Math.cos(ang - 0.03) * L, oy + Math.sin(ang - 0.03) * L);
      ctx.lineTo(ox + Math.cos(ang + 0.03) * L, oy + Math.sin(ang + 0.03) * L);
      ctx.fill();
    }
    ctx.restore();
    A.bokeh(ctx, W, H, 40, 52, ["#FFD98A", "#FFB86B", "#FFF1C1"], 12 * u, 60 * u, 0.4);
    const st = this.theme.style;
    const pb = land ? B(W, H, 0.08, 0.13, 0.48, 0.7) : B(W, H, 0.14, 0.165, 0.72, 0.445);
    // fitas de cetim cruzando o cartão (por trás da foto), como um embrulho
    const rib = 54 * u;
    const ribbon = (x: number, y: number, w: number, h: number, vert: boolean) => {
      const rg = vert ? ctx.createLinearGradient(x, 0, x + w, 0) : ctx.createLinearGradient(0, y, 0, y + h);
      rg.addColorStop(0, "#9A6B12");
      rg.addColorStop(0.3, "#F7E3A0");
      rg.addColorStop(0.5, "#D4A537");
      rg.addColorStop(0.75, "#FFF1C1");
      rg.addColorStop(1, "#9A6B12");
      ctx.fillStyle = rg;
      ctx.fillRect(x, y, w, h);
    };
    shadowed(ctx, u, () => {
      ribbon(pb.x + pb.w / 2 - rib / 2, 0, rib, pb.y + pb.h / 2, true);
      ribbon(0, pb.y + pb.h / 2 - rib / 2, land ? pb.x + pb.w + 40 * u : W, rib, false);
    }, 16, 4);
    // passe-partout creme + filete dourado
    const mat = A.grow(pb, 18 * u);
    shadowed(ctx, u, () => {
      ctx.fillStyle = "#FFF6E6";
      ctx.fillRect(mat.x, mat.y, mat.w, mat.h);
    }, 36, 14);
    ctx.strokeStyle = A.goldGrad(ctx, mat.x, mat.y, mat.x + mat.w, mat.y + mat.h);
    ctx.lineWidth = 5 * u;
    ctx.strokeRect(mat.x + 6 * u, mat.y + 6 * u, mat.w - 12 * u, mat.h - 12 * u);
    drawPhoto(ctx, d, pb, rect(pb), a, u);
    A.bow(ctx, pb.x + pb.w / 2, pb.y - 16 * u, 104 * u, 0, 0.9, true);
    // presentes empilhados
    const gy = land ? 0.97 * H : 0.975 * H;
    A.giftBox(ctx, 0.03 * W, gy, 130 * u, 110 * u, "#1F7A47", "#F2D27A", u);
    A.giftBox(ctx, 0.07 * W, gy - 110 * u, 90 * u, 80 * u, "#C1121F", "#F2D27A", u);
    A.giftBox(ctx, (land ? 0.88 : 0.84) * W, gy, 140 * u, 100 * u, "#C1121F", "#FFFFFF", u);
    A.giftBox(ctx, (land ? 0.9 : 0.87) * W, gy - 100 * u, 80 * u, 90 * u, "#F2D27A", "#B80E25", u);
    const r = A.rng(19);
    for (let i = 0; i < 12; i++) A.twinkle(ctx, r() * W, r() * H, (12 + r() * 16) * u, "#FFE7A0", a.t < 0 ? 0.85 : 0.5 + 0.5 * Math.sin(a.t * 4 + i * 1.3));
    if (land) textBlock(ctx, d, B(W, H, 0.6, 0.08, 0.36, 0.7), st, mode, a, { title: true, divider: (x, y, s) => goldDivider(ctx, x, y, s) });
    else {
      drawLine(ctx, d.title, st.title, 112 * u, "gold", W / 2, 0.072 * H, W * 0.66, a.title, st.shadow);
      textBlock(ctx, d, B(W, H, 0.18, 0.67, 0.64, 0.25), st, mode, a, { divider: (x, y, s) => goldDivider(ctx, x, y, s) });
    }
  },
};

/* ---------------------------------------------------------------- 9. Neve Encantada (globo de neve) */

const neve: Template = {
  id: "neve",
  name: "Neve Encantada",
  tagline: "Globo de neve com a família dentro",
  theme: {
    paper: ["#FAFDFF", "#EAF4FC", "#C9DFF2"],
    ink: "#13315C",
    accent: "#2F6FB0",
    gold: true,
    stage: ["#0F2F57", "#5E93C8"],
    style: { title: "hand", titleColor: "#13315C", family: "cinzel", familyColor: "#13315C", body: "serifI", bodyColor: "#1C3B66", accent: "#2F6FB0", soft: "#4C6F98" },
  },
  ornament: (ctx, cx, cy, s) => A.crystal(ctx, cx, cy, s * 0.42, "#5E93C8", s * 0.05),
  draw(ctx, W, H, d, mode, a) {
    const u = Math.min(W, H) / 1000,
      land = W > H;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#EAF5FD");
    g.addColorStop(0.6, "#B9D7EF");
    g.addColorStop(1, "#86B1DA");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const r = A.rng(61);
    for (let i = 0; i < 22; i++) {
      const x = r() * W,
        y = r() * H,
        s = (16 + r() * 34) * u;
      const inText = land ? x > 0.56 * W : y > 0.68 * H && x > 0.08 * W && x < 0.92 * W;
      A.crystal(ctx, x, y, s, `rgba(255,255,255,${inText ? 0.3 : 0.7})`, 2.6 * u);
    }
    A.snowfall(ctx, W, H, 130, 15, u, "255,255,255", a.t < 0 ? 0 : a.t * 0.7);
    const st = this.theme.style;
    const cx = land ? 0.3 * W : 0.5 * W,
      cy = land ? 0.42 * H : 0.37 * H,
      R = land ? 0.3 * H : 0.29 * W;
    // base do globo
    const by = cy + R * 0.8,
      bh = R * 0.46,
      bw = R * 1.25;
    shadowed(ctx, u, () => {
      const wg = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
      wg.addColorStop(0, "#5A2E12");
      wg.addColorStop(0.5, "#9A5A2C");
      wg.addColorStop(1, "#4E260E");
      ctx.fillStyle = wg;
      ctx.beginPath();
      ctx.moveTo(cx - bw * 0.78, by);
      ctx.lineTo(cx + bw * 0.78, by);
      ctx.lineTo(cx + bw, by + bh);
      ctx.lineTo(cx - bw, by + bh);
      ctx.closePath();
      ctx.fill();
    }, 30, 14, "rgba(10,30,60,0.4)");
    ctx.fillStyle = A.goldGrad(ctx, cx - bw, by, cx + bw, by);
    ctx.fillRect(cx - bw * 0.8, by - 6 * u, bw * 1.6, 14 * u);
    ctx.fillRect(cx - bw * 1.02, by + bh - 10 * u, bw * 2.04, 16 * u);
    // vidro com a foto dentro
    const pb: Box = { x: cx - R, y: cy - R, w: 2 * R, h: 2 * R };
    drawPhoto(ctx, d, pb, circle(cx, cy, R * 0.97), a, u, "#DCE8F5");
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.97, 0, Math.PI * 2);
    ctx.clip();
    const inner = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R);
    inner.addColorStop(0, "rgba(255,255,255,0)");
    inner.addColorStop(1, "rgba(200,225,255,0.45)");
    ctx.fillStyle = inner;
    ctx.fillRect(pb.x, pb.y, pb.w, pb.h);
    // neve dentro do globo + montinho de neve no fundo
    A.snowfall(ctx, W, H, 70, 99, u * 0.9, "255,255,255", a.t < 0 ? 0 : a.t * 0.4);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + R * 0.98, R * 1.0, R * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 6 * u;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.97, 0, Math.PI * 2);
    ctx.stroke();
    // reflexo do vidro
    const hl = ctx.createLinearGradient(cx - R, cy - R, cx, cy);
    hl.addColorStop(0, "rgba(255,255,255,0.75)");
    hl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = hl;
    ctx.lineWidth = 18 * u;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.82, Math.PI * 1.08, Math.PI * 1.42);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.beginPath();
    ctx.ellipse(cx + R * 0.42, cy - R * 0.55, R * 0.06, R * 0.035, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // plaquinha dourada com o nome da família na base
    const pw = bw * 1.35,
      ph = bh * 0.5;
    ctx.save();
    ctx.globalAlpha *= a.family;
    ctx.fillStyle = A.goldGrad(ctx, cx - pw / 2, by, cx + pw / 2, by + bh);
    ctx.beginPath();
    ctx.roundRect(cx - pw / 2, by + bh * 0.24, pw, ph, ph * 0.18);
    ctx.fill();
    ctx.strokeStyle = "rgba(90,55,5,0.6)";
    ctx.lineWidth = 2 * u;
    ctx.beginPath();
    ctx.roundRect(cx - pw / 2 + 6 * u, by + bh * 0.24 + 6 * u, pw - 12 * u, ph - 12 * u, ph * 0.12);
    ctx.stroke();
    ctx.restore();
    drawLine(ctx, d.family, "cinzel", ph * 0.46, "#4A2A06", cx, by + bh * 0.24 + ph / 2 + 1 * u, pw * 0.88, a.family);
    if (land) textBlock(ctx, d, B(W, H, 0.6, 0.12, 0.35, 0.76), st, mode, a, { title: true, family: false, divider: (x, y, s) => goldDivider(ctx, x, y, s, "#5E93C8") });
    else {
      drawLine(ctx, d.title, st.title, 110 * u, st.titleColor, W / 2, 0.06 * H, W * 0.7, a.title);
      textBlock(ctx, d, B(W, H, 0.1, 0.705, 0.8, 0.255), st, mode, a, { family: false, divider: (x, y, s) => goldDivider(ctx, x, y, s, "#5E93C8") });
    }
  },
};

export const TEMPLATES: Template[] = [dourado, fotografico, guirlanda, estrelado, papainoel, rustico, vila, presentes, neve];
export const templateOf = (id: TemplateId) => TEMPLATES.find((t) => t.id === id) ?? dourado;
export { vignette };
