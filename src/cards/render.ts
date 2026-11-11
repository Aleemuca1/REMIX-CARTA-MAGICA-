/** Desenha as faces do cartão (frente, dentro, verso) e as imagens para redes sociais. */
import { F } from "../lib/shareKit";
import * as A from "./art";
import { drawLine, templateOf, textBlock } from "./templates";
import { STILL, type Anim, type CardData, type FaceMode, type Orientation } from "./types";

export const SITE = "cartamagicanatal.com.br";

/** Proporção A (raiz de 2): vale para A4, A5 e A6. */
export function cardDims(o: Orientation, long = 1414) {
  const short = Math.round(long / Math.SQRT2);
  return o === "retrato" ? { W: short, H: long } : { W: long, H: short };
}

export function makeCanvas(W: number, H: number) {
  const c = document.createElement("canvas");
  c.width = Math.round(W);
  c.height = Math.round(H);
  return c;
}

function watermark(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const u = Math.min(W, H) / 1000;
  ctx.save();
  ctx.font = F.sans(20 * u, 800);
  const t = `✨ ${SITE}`;
  const w = ctx.measureText(t).width + 30 * u;
  ctx.globalAlpha = 0.72;
  ctx.fillStyle = "rgba(11,19,43,0.55)";
  ctx.beginPath();
  ctx.roundRect(W - w - 22 * u, H - 54 * u, w, 36 * u, 18 * u);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(t, W - w / 2 - 22 * u, H - 36 * u);
  ctx.restore();
}

export function renderFace(ctx: CanvasRenderingContext2D, W: number, H: number, d: CardData, mode: FaceMode = "front", a: Anim = STILL) {
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  templateOf(d.template).draw(ctx, W, H, d, mode, a);
  if (d.watermark) watermark(ctx, W, H);
  ctx.restore();
}

function paper(ctx: CanvasRenderingContext2D, W: number, H: number, d: CardData) {
  const t = templateOf(d.template).theme;
  A.paperTexture(ctx, W, H, t.paper, "rgba(120,90,50,0.05)", 9, 700);
  const u = Math.min(W, H) / 1000;
  ctx.save();
  ctx.strokeStyle = t.gold ? A.goldGrad(ctx, 0, 0, W, H) : t.accent;
  ctx.lineWidth = 4 * u;
  ctx.strokeRect(34 * u, 34 * u, W - 68 * u, H - 68 * u);
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.5 * u;
  ctx.strokeRect(46 * u, 46 * u, W - 92 * u, H - 92 * u);
  ctx.restore();
}

/** Páginas de dentro do cartão dobrado. Esquerda: enfeite e frase. Direita: a mensagem da família. */
export function renderInner(ctx: CanvasRenderingContext2D, W: number, H: number, d: CardData, side: "left" | "right") {
  const tpl = templateOf(d.template);
  const t = tpl.theme;
  const u = Math.min(W, H) / 1000;
  paper(ctx, W, H, d);
  const st = { ...t.style, titleColor: t.gold ? ("gold" as const) : t.accent, familyColor: t.ink, bodyColor: t.ink, accent: t.accent, soft: A.shade(t.ink, 0.35), shadow: undefined };
  if (side === "left") {
    tpl.ornament(ctx, W / 2, H * 0.36, 260 * u);
    drawLine(ctx, d.title || "Feliz Natal", "hand", 120 * u, st.titleColor, W / 2, H * 0.6, W * 0.8);
    drawLine(ctx, "Que a magia do Natal ilumine", "serifI", 38 * u, t.ink, W / 2, H * 0.69, W * 0.8);
    drawLine(ctx, "cada dia do novo ano.", "serifI", 38 * u, t.ink, W / 2, H * 0.73, W * 0.8);
    if (d.watermark) watermark(ctx, W, H);
    return;
  }
  textBlock(ctx, { ...d, title: "" }, { x: W * 0.12, y: H * 0.1, w: W * 0.76, h: H * 0.8 }, st, "front", STILL, {
    family: true,
    maxLines: 12,
    divider: (x, y, s) => {
      ctx.save();
      ctx.strokeStyle = t.gold ? A.goldGrad(ctx, x - s * 4, y, x + s * 4, y) : t.accent;
      ctx.lineWidth = 2 * u;
      ctx.beginPath();
      ctx.moveTo(x - s * 3, y);
      ctx.lineTo(x + s * 3, y);
      ctx.stroke();
      A.star5(ctx, x, y, s * 0.4, t.gold ? A.goldGrad(ctx, x - 10, y - 10, x + 10, y + 10) : t.accent);
      ctx.restore();
    },
  });
  if (d.watermark) watermark(ctx, W, H);
}

export function renderBack(ctx: CanvasRenderingContext2D, W: number, H: number, d: CardData) {
  const tpl = templateOf(d.template);
  const u = Math.min(W, H) / 1000;
  paper(ctx, W, H, d);
  tpl.ornament(ctx, W / 2, H * 0.72, 120 * u);
  drawLine(ctx, /natal/i.test(d.year) ? d.year : `Natal ${d.year || new Date().getFullYear()}`, "cinzel", 26 * u, tpl.theme.ink, W / 2, H * 0.83, W * 0.7, 1, undefined, 0.3);
  drawLine(ctx, `Feito com carinho no Carta Mágica · ${SITE}`, "sans", 17 * u, A.shade(tpl.theme.ink, 0.4), W / 2, H * 0.87, W * 0.8);
}

/* ------------------------------------------------------------------ imagens para redes */

export type SocialVariant = "hd" | "whatsapp" | "instagram" | "quadrado" | "vertical";
export const SOCIAL: { id: SocialVariant; label: string; w: number; h: number; hint: string }[] = [
  { id: "hd", label: "Alta resolução", w: 0, h: 0, hint: "Só o cartão, nítido para imprimir em casa" },
  { id: "whatsapp", label: "WhatsApp", w: 1080, h: 1350, hint: "Leve e nítido no Status e nas conversas" },
  { id: "instagram", label: "Instagram (feed)", w: 1080, h: 1350, hint: "4:5, o formato que mais aparece no feed" },
  { id: "quadrado", label: "Quadrado", w: 1080, h: 1080, hint: "1:1 para Facebook e grupos" },
  { id: "vertical", label: "Vertical (Stories)", w: 1080, h: 1920, hint: "9:16 para Stories, Reels e TikTok" },
];

/** Fundo de palco (cores do modelo) com luzinhas e neve. `t` anima no vídeo. */
export function drawStage(ctx: CanvasRenderingContext2D, W: number, H: number, d: CardData, t = -1) {
  const [c0, c1] = templateOf(d.template).theme.stage;
  const g = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H / 2, Math.hypot(W, H) * 0.6);
  g.addColorStop(0, c1);
  g.addColorStop(1, c0);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const u = Math.min(W, H) / 1000;
  A.bokeh(ctx, W, H, 30, 23, ["#FFD98A", "#FFFFFF", "#FFB86B"], 14 * u, 70 * u, 0.28);
  A.snowfall(ctx, W, H, 110, 5, u, "255,255,255", t < 0 ? 0 : t);
}

export function cardCanvas(d: CardData, long = 1414, mode: FaceMode = "front", a: Anim = STILL) {
  const { W, H } = cardDims(d.orientation, long);
  const c = makeCanvas(W, H);
  renderFace(c.getContext("2d")!, W, H, d, mode, a);
  return c;
}

/** Coloca o cartão inteiro (sem cortar nada) no formato pedido, com sombra elegante. */
export function placeCard(ctx: CanvasRenderingContext2D, card: CanvasImageSource, cw: number, ch: number, W: number, H: number, scale = 0.88, cy = 0.5, rot = 0) {
  const k = Math.min((W * scale) / cw, (H * scale) / ch);
  const w = cw * k,
    h = ch * k;
  ctx.save();
  ctx.translate(W / 2, H * cy);
  ctx.rotate(rot);
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = Math.min(W, H) * 0.05;
  ctx.shadowOffsetY = Math.min(W, H) * 0.018;
  ctx.fillStyle = "#fff";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.shadowColor = "transparent";
  ctx.drawImage(card, -w / 2, -h / 2, w, h);
  ctx.restore();
  return { w, h };
}

export function socialCanvas(d: CardData, v: SocialVariant) {
  if (v === "hd") return cardCanvas(d, 3000);
  const spec = SOCIAL.find((s) => s.id === v)!;
  const card = cardCanvas(d, 2000);
  const c = makeCanvas(spec.w, spec.h);
  const ctx = c.getContext("2d")!;
  drawStage(ctx, spec.w, spec.h, d);
  placeCard(ctx, card, card.width, card.height, spec.w, spec.h, v === "vertical" ? 0.86 : 0.9, 0.5);
  return c;
}
