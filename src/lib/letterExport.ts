/**
 * Gera a carta do Papai Noel em vários formatos, aqui no navegador:
 * folha A4 (PNG/JPG/PDF), story 9:16, post 1:1 e vídeo com a voz.
 */
import type { Letter } from "../types";
import { DEFAULT_THEME, letterTheme, type LetterTheme } from "./letterThemes";
import { prettyCity, prettyName } from "./prettyText";
import { F, drawBrand, drawLights, drawNightSky, drawQr, ensureFonts, wrapLines, SITE_HOST } from "./shareKit";

/** cores da carta que está sendo desenhada agora */
let T: LetterTheme = DEFAULT_THEME;
const useTheme = (l: Letter) => (T = letterTheme(l.theme));

export const letterParagraphs = (l: Letter) => (l.content || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
export const letterUrl = (l: Letter) => `${window.location.origin}/natal/${l.token}`;

export function parchment(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, t: LetterTheme = DEFAULT_THEME) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = w * 0.04;
  ctx.shadowOffsetY = w * 0.012;
  ctx.fillStyle = t.paper;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.clip();
  const g = ctx.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * 0.3, x + w / 2, y + h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, "rgba(252,249,242,0)");
  g.addColorStop(1, "rgba(214,184,128,0.45)");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  if (t.id !== DEFAULT_THEME.id) {
    ctx.fillStyle = t.tint;
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
  // moldura dupla
  ctx.save();
  ctx.strokeStyle = t.id === DEFAULT_THEME.id || t.frame === "#FFD166" ? "#E9B949" : t.frame;
  ctx.lineWidth = Math.max(3, w * 0.008);
  ctx.beginPath();
  ctx.roundRect(x + w * 0.012, y + w * 0.012, w - w * 0.024, h - w * 0.024, r * 0.8);
  ctx.stroke();
  ctx.lineWidth = Math.max(1, w * 0.002);
  ctx.strokeStyle = t.ink + "73";
  ctx.beginPath();
  ctx.roundRect(x + w * 0.028, y + w * 0.028, w - w * 0.056, h - w * 0.056, r * 0.6);
  ctx.stroke();
  ctx.restore();
  // azevinho nos cantos
  holly(ctx, x + w * 0.05, y + w * 0.05, w * 0.03, t.accent);
  holly(ctx, x + w - w * 0.05, y + h - w * 0.05, w * 0.03, t.accent);
}

function holly(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, berry = "#D90429") {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#1B7A3A";
  for (const a of [-0.6, 0.6]) {
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.9, s * 0.42, s * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = berry;
  for (const [dx, dy] of [
    [-s * 0.25, 0],
    [s * 0.25, 0],
    [0, s * 0.3],
  ])
    ctx.beginPath(), ctx.arc(dx, dy, s * 0.3, 0, Math.PI * 2), ctx.fill();
  ctx.restore();
}

export function waxSeal(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: LetterTheme = DEFAULT_THEME) {
  ctx.save();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, t.seal[0]);
  g.addColorStop(1, t.seal[1]);
  ctx.fillStyle = g;
  ctx.beginPath();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const rr = r * (i % 2 ? 0.92 : 1);
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#FFD166";
  ctx.lineWidth = r * 0.06;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#FFD166";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = F.cinzel(Math.round(r * 0.5));
  ctx.fillText(String(new Date().getFullYear()), x, y + r * 0.03);
  ctx.restore();
}

/** Cabeçalho "Correio Real do Polo Norte". Devolve o y logo abaixo. */
function letterHead(ctx: CanvasRenderingContext2D, l: Letter, x: number, y: number, w: number, s: number) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = T.ink;
  ctx.font = F.cinzel(Math.round(s * 1.15), 800);
  ctx.fillText("✦ CORREIO REAL DO POLO NORTE ✦", x + w / 2, y + s * 1.1);
  ctx.fillStyle = "rgba(28,37,65,0.7)";
  ctx.font = F.serif(Math.round(s * 0.72), true);
  ctx.fillText(`Expedição Oficial de Natal${l.trackingCode ? ` • Registro #${l.trackingCode}` : ""}`, x + w / 2, y + s * 2.1);
  ctx.strokeStyle = "rgba(28,37,65,0.18)";
  ctx.lineWidth = Math.max(1, s * 0.06);
  ctx.beginPath();
  ctx.moveTo(x, y + s * 2.75);
  ctx.lineTo(x + w, y + s * 2.75);
  ctx.stroke();
  // "Para:"
  const to = `Para: ${prettyName(l.childName)}, ${l.age} anos  •  ${prettyCity(l.city)}`;
  ctx.font = F.sans(Math.round(s * 0.66), 700);
  ctx.textAlign = "left";
  const tw = ctx.measureText(to).width + s * 1.2;
  const py = y + s * 3.35;
  ctx.fillStyle = T.soft;
  ctx.beginPath();
  ctx.roundRect(x, py, Math.min(tw, w * 0.68), s * 1.2, s * 0.6);
  ctx.fill();
  ctx.fillStyle = T.ink;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, py, w * 0.68, s * 1.2);
  ctx.clip();
  ctx.fillText(to, x + s * 0.6, py + s * 0.82);
  ctx.restore();
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(28,37,65,0.6)";
  ctx.font = F.sans(Math.round(s * 0.6), 500);
  ctx.fillText(l.date || "", x + w, py + s * 0.82);
  ctx.restore();
  return py + s * 2;
}

function signature(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, s: number) {
  ctx.save();
  ctx.strokeStyle = "rgba(28,37,65,0.18)";
  ctx.lineWidth = Math.max(1, s * 0.06);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  waxSeal(ctx, x + s * 1.3, y + s * 1.9, s * 1.15, T);
  ctx.textAlign = "left";
  ctx.fillStyle = T.ink;
  ctx.font = F.cinzel(Math.round(s * 0.5), 700);
  ctx.fillText("SELO REAL DO POLO NORTE", x + s * 2.8, y + s * 1.8);
  ctx.fillStyle = "rgba(28,37,65,0.6)";
  ctx.font = F.sans(Math.round(s * 0.46), 500);
  ctx.fillText("Autenticidade garantida", x + s * 2.8, y + s * 2.45);
  ctx.textAlign = "right";
  ctx.fillStyle = T.ink;
  ctx.font = F.hand(Math.round(s * 2.4));
  ctx.fillText("Papai Noel", x + w, y + s * 2.2);
  ctx.fillStyle = "rgba(28,37,65,0.6)";
  ctx.font = F.cinzel(Math.round(s * 0.45), 600);
  ctx.fillText("OFICINA CENTRAL DE BRINQUEDOS", x + w, y + s * 2.95);
  ctx.restore();
}

type Layout = { lines: { t: string; para: number }[]; size: number; lh: number };

function layoutBody(ctx: CanvasRenderingContext2D, paras: string[], maxW: number, maxH: number, start: number, min: number): Layout {
  for (let size = start; size >= min; size -= 1) {
    ctx.font = F.serif(size);
    const lh = size * 1.55;
    const lines: Layout["lines"] = [];
    paras.forEach((p, i) => {
      wrapLines(ctx, p, maxW).forEach((t) => lines.push({ t, para: i }));
      lines.push({ t: "", para: -1 });
    });
    lines.pop();
    const h = lines.reduce((a, ln) => a + (ln.t ? lh : lh * 0.55), 0);
    if (h <= maxH || size === min) return { lines, size, lh };
  }
  return { lines: [], size: min, lh: min * 1.5 };
}

function drawBody(ctx: CanvasRenderingContext2D, lay: Layout, x: number, y: number, maxH = Infinity, highlight = -1) {
  ctx.save();
  ctx.font = F.serif(lay.size);
  ctx.textAlign = "left";
  let yy = y;
  for (const ln of lay.lines) {
    if (!ln.t) {
      yy += lay.lh * 0.55;
      continue;
    }
    if (yy - y + lay.lh > maxH) break;
    ctx.fillStyle = highlight >= 0 && ln.para !== highlight ? "rgba(28,37,65,0.45)" : "#1C2541";
    ctx.fillText(ln.t, x, yy + lay.size);
    yy += lay.lh;
  }
  ctx.restore();
  return yy;
}

/** A carta completa numa folha A4 (1240x1754), com QR code para ouvir a voz. */
export async function renderLetterPage(l: Letter, withQr = true) {
  useTheme(l);
  await ensureFonts();
  const W = 1240,
    H = 1754;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#FCF9F2";
  ctx.fillRect(0, 0, W, H);
  parchment(ctx, 0, 0, W, H, 0, T);
  const m = 120,
    s = 34;
  const iw = W - m * 2;
  let y = letterHead(ctx, l, m, 100, iw, s);
  const footer = withQr ? 330 : 190;
  const lay = layoutBody(ctx, letterParagraphs(l), iw, H - y - footer - 40, 40, 18);
  drawBody(ctx, lay, m, y + 10);
  const fy = H - footer - 20;
  signature(ctx, m, fy, iw, s);
  if (withQr) {
    const q = 118;
    drawQr(ctx, letterUrl(l), m, H - q - 70, q);
    ctx.fillStyle = "#1C2541";
    ctx.font = F.sans(22, 700);
    ctx.textAlign = "left";
    ctx.fillText("Aponte a câmera do celular aqui", m + q + 24, H - 70 - q + 46);
    ctx.font = F.sans(19, 500);
    ctx.fillStyle = "rgba(28,37,65,0.7)";
    ctx.fillText("e ouça o Papai Noel lendo esta carta 🔔", m + q + 24, H - 70 - q + 80);
    ctx.textAlign = "right";
    ctx.fillStyle = T.ink + "BF";
    ctx.font = F.cinzel(18, 700);
    ctx.fillText(`Carta Mágica • ${SITE_HOST()}`, W - m - 70, H - 76);
  }
  return c;
}

/** Quantas linhas cabem na altura (as linhas em branco entre parágrafos contam como meia linha, por segurança contamos inteira). */
const fitLines = (h: number, lh: number) => Math.max(3, Math.floor(h / lh));

/** Trecho da carta que cabe no cartão (termina com "…" se cortar). */
function excerpt(ctx: CanvasRenderingContext2D, paras: string[], maxW: number, maxLines: number, size: number) {
  ctx.font = F.serif(size);
  const out: { t: string; para: number }[] = [];
  for (let i = 0; i < paras.length && out.length < maxLines; i++) {
    for (const t of wrapLines(ctx, paras[i], maxW)) {
      if (out.length >= maxLines) break;
      out.push({ t, para: i });
    }
    if (out.length < maxLines && i < paras.length - 1) out.push({ t: "", para: -1 });
  }
  const total = paras.reduce((a, p) => a + wrapLines(ctx, p, maxW).length + 1, -1);
  while (out.length && !out[out.length - 1].t) out.pop();
  if (total > out.length && out.length) {
    const last = out[out.length - 1];
    let t = last.t;
    while (t && ctx.measureText(t + " …").width > maxW) t = t.replace(/\s*\S+$/, "");
    last.t = `${t} …`;
  }
  return out;
}

/** Imagem vertical 9:16 (1080x1920) para Status do WhatsApp, Stories e Reels. */
export async function renderStory(l: Letter) {
  useTheme(l);
  await ensureFonts();
  const W = 1080,
    H = 1920;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  drawNightSky(ctx, W, H, l.childName.length + 3);
  drawLights(ctx, W, 40);
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFD166";
  ctx.font = F.sans(34, 800);
  ctx.fillText("📬 CHEGOU DO POLO NORTE!", W / 2, 190);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = F.cinzel(64, 800);
  ctx.fillText("Uma carta do", W / 2, 270);
  ctx.fillText("Papai Noel para", W / 2, 345);
  ctx.fillStyle = "#FFD166";
  let ns = 120;
  ctx.font = F.hand(ns);
  while (ctx.measureText(l.childName).width > W - 140 && ns > 60) ctx.font = F.hand((ns -= 6));
  ctx.fillText(l.childName, W / 2, 470);

  const cx = 80,
    cy = 540,
    cw = W - 160,
    ch = 1010;
  parchment(ctx, cx, cy, cw, ch, 36, T);
  const m = 70,
    s = 26;
  const y = letterHead(ctx, l, cx + m, cy + 50, cw - m * 2, s);
  const sigY = cy + ch - 190;
  const ex = excerpt(ctx, letterParagraphs(l), cw - m * 2, fitLines(sigY - y - 24, 33 * 1.5), 33);
  drawBody(ctx, { lines: ex, size: 33, lh: 33 * 1.5 }, cx + m, y);
  signature(ctx, cx + m, sigY, cw - m * 2, s);

  // chamada + QR
  const q = 170;
  const qy = 1600;
  drawQr(ctx, letterUrl(l), W / 2 - q / 2 - 230, qy, q);
  ctx.textAlign = "left";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = F.sans(34, 800);
  ctx.fillText("Ouça a voz do", W / 2 - 30, qy + 58);
  ctx.fillText("Papai Noel 🔔", W / 2 - 30, qy + 104);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = F.sans(24, 500);
  ctx.fillText("aponte a câmera no código", W / 2 - 30, qy + 146);
  drawBrandOnSnow(ctx, W, H);
  return c;
}

function drawBrandOnSnow(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.save();
  ctx.fillStyle = "rgba(11,19,43,0.85)";
  ctx.beginPath();
  const bw = W * 0.56;
  ctx.roundRect(W / 2 - bw / 2, H - W * 0.11, bw, W * 0.085, W * 0.04);
  ctx.fill();
  ctx.restore();
  drawBrand(ctx, W, H - W * 0.07, "#FFD166");
}

/** Imagem quadrada 1:1 (1080x1080) para o feed do Instagram/Facebook. */
export async function renderPost(l: Letter) {
  useTheme(l);
  await ensureFonts();
  const W = 1080,
    H = 1080;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  drawNightSky(ctx, W, H, l.childName.length + 11);
  drawLights(ctx, W, 26);
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = F.cinzel(42, 800);
  ctx.fillText("O Papai Noel escreveu para", W / 2, 130);
  ctx.fillStyle = "#FFD166";
  let ns = 92;
  ctx.font = F.hand(ns);
  while (ctx.measureText(l.childName).width > W - 160 && ns > 50) ctx.font = F.hand((ns -= 6));
  ctx.fillText(l.childName, W / 2, 222);
  const cx = 90,
    cy = 262,
    cw = W - 180,
    ch = 660;
  parchment(ctx, cx, cy, cw, ch, 30, T);
  const m = 56,
    s = 21;
  const y = letterHead(ctx, l, cx + m, cy + 34, cw - m * 2, s);
  const ex = excerpt(ctx, letterParagraphs(l), cw - m * 2, fitLines(cy + ch - 120 - (y - 6), 27 * 1.5), 27);
  drawBody(ctx, { lines: ex, size: 27, lh: 27 * 1.5 }, cx + m, y - 6);
  ctx.textAlign = "right";
  ctx.fillStyle = T.ink;
  ctx.font = F.hand(64);
  ctx.fillText("Papai Noel", cx + cw - m - 50, cy + ch - 50);
  waxSeal(ctx, cx + m + 34, cy + ch - 70, 36, T);
  drawBrandOnSnow(ctx, W, H);
  return c;
}

/** PDF A4 da carta completa (com QR code para ouvir). */
export async function letterPdf(l: Letter) {
  const [page, { jsPDF }] = await Promise.all([renderLetterPage(l, true), import("jspdf")]);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  pdf.addImage(page.toDataURL("image/jpeg", 0.93), "JPEG", 0, 0, 210, 297);
  pdf.setProperties({ title: `Carta do Papai Noel para ${l.childName}`, author: "Papai Noel • Carta Mágica" });
  return pdf.output("blob") as Blob;
}

export function videoMime() {
  if (typeof MediaRecorder === "undefined" || !("captureStream" in HTMLCanvasElement.prototype)) return null;
  const opts = ["video/mp4;codecs=avc1,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  return opts.find((m) => MediaRecorder.isTypeSupported(m)) ?? null;
}

/**
 * Vídeo vertical (720x1280) da carta: sininhos, título, a carta rolando com o trecho
 * lido em destaque, e a voz do Papai Noel (se houver áudio). Grava em tempo real.
 */
export async function recordLetterVideo(l: Letter, audio: Blob | null, onProgress: (f: number) => void): Promise<{ blob: Blob; ext: string }> {
  useTheme(l);
  const mime = videoMime();
  if (!mime) throw new Error("sem gravação");
  await ensureFonts();
  const W = 720,
    H = 1280;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  // fundo pronto (céu) para não redesenhar estrelas a cada quadro
  const bg = document.createElement("canvas");
  bg.width = W;
  bg.height = H;
  drawNightSky(bg.getContext("2d")!, W, H, 5);

  // cartão (pergaminho + cabeçalho) também pronto
  const cx = 44,
    cy = 250,
    cw = W - 88,
    ch = 900;
  const card = document.createElement("canvas");
  card.width = W;
  card.height = H;
  const kctx = card.getContext("2d")!;
  parchment(kctx, cx, cy, cw, ch, 26, T);
  const m = 44,
    s = 17;
  const bodyTop = letterHead(kctx, l, cx + m, cy + 30, cw - m * 2, s);
  const paras = letterParagraphs(l);
  const bodyH = cy + ch - 150 - bodyTop;
  const lay = layoutBody(ctx, paras, cw - m * 2, 99999, 24, 24);
  // início (em fração do texto) de cada parágrafo, para sincronizar com a voz
  const total = paras.reduce((a, p) => a + p.length, 0) || 1;
  const starts: number[] = [];
  paras.reduce((acc, p) => (starts.push(acc / total), acc + p.length), 0);
  // y de cada parágrafo dentro do texto
  const paraY: number[] = [];
  {
    let yy = 0;
    for (const ln of lay.lines) {
      if (!ln.t) {
        yy += lay.lh * 0.55;
        continue;
      }
      if (paraY[ln.para] === undefined) paraY[ln.para] = yy;
      yy += lay.lh;
    }
    paraY.push(yy);
  }
  const textH = paraY[paraY.length - 1];

  // áudio: voz + sininhos num único fluxo
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  const actx: AudioContext = new AC();
  if (actx.state === "suspended") await actx.resume();
  const dest = actx.createMediaStreamDestination();
  const out = actx.createGain();
  out.gain.value = 1;
  out.connect(dest);
  out.connect(actx.destination); // a família ouve enquanto grava
  let voiceBuf: AudioBuffer | null = null;
  if (audio) {
    try {
      voiceBuf = await actx.decodeAudioData(await audio.arrayBuffer());
    } catch {
      voiceBuf = null;
    }
  }
  const INTRO = 2.6,
    OUTRO = 3.2;
  const readDur = voiceBuf ? voiceBuf.duration : Math.min(70, Math.max(18, total * 0.055));
  const dur = INTRO + readDur + OUTRO;

  const bell = (t: number, f: number, v = 0.12) => {
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = "sine";
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 1.5);
  };

  const stream = (c as HTMLCanvasElement & { captureStream: (fps: number) => MediaStream }).captureStream(30);
  dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 3_500_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);

  const flakes = Array.from({ length: 70 }, (_, i) => ({ x: (i * 97) % W, y: (i * 173) % H, r: 1.5 + (i % 4), v: 30 + (i % 5) * 14 }));

  return new Promise((resolve) => {
    rec.onstop = () => {
      actx.close().catch(() => {});
      resolve({ blob: new Blob(chunks, { type: mime }), ext: mime.includes("mp4") ? "mp4" : "webm" });
    };
    rec.start(250);
    const t0 = actx.currentTime + 0.05;
    // sininhos de abertura
    [0, 0.18, 0.36, 0.7, 0.88, 1.06].forEach((d, i) => bell(t0 + d, [1568, 1760, 2093, 1568, 1760, 2349][i], 0.08));
    if (voiceBuf) {
      const src = actx.createBufferSource();
      src.buffer = voiceBuf;
      src.connect(out);
      src.start(t0 + INTRO);
    }
    [0, 0.2, 0.4, 0.8].forEach((d, i) => bell(t0 + INTRO + readDur + 0.3 + d, [2093, 2349, 2637, 3136][i], 0.07));

    let lastPara = -1;
    const frame = () => {
      const t = actx.currentTime - t0;
      onProgress(Math.min(1, Math.max(0, t / dur)));
      ctx.drawImage(bg, 0, 0);
      // título
      const a = Math.min(1, t / 0.8);
      ctx.globalAlpha = a;
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFD166";
      ctx.font = F.sans(24, 800);
      ctx.fillText("📬 CHEGOU DO POLO NORTE!", W / 2, 80);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = F.cinzel(38, 800);
      ctx.fillText("Carta do Papai Noel para", W / 2, 135);
      ctx.fillStyle = "#FFD166";
      let ns = 78;
      ctx.font = F.hand(ns);
      while (ctx.measureText(l.childName).width > W - 80 && ns > 40) ctx.font = F.hand((ns -= 4));
      ctx.fillText(l.childName, W / 2, 215);
      ctx.globalAlpha = 1;

      // cartão subindo
      const rise = Math.max(0, 1 - (t - 0.5) / 1.4);
      const off = (rise * rise) * H * 0.7;
      ctx.save();
      ctx.translate(0, off);
      ctx.drawImage(card, 0, 0);
      // texto rolando, trecho lido em destaque
      const f = Math.min(1, Math.max(0, (t - INTRO) / readDur));
      let idx = 0;
      for (let k = 0; k < starts.length; k++) if (f >= starts[k]) idx = k;
      const reading = t >= INTRO && t < INTRO + readDur;
      if (reading && idx !== lastPara) lastPara = idx;
      // rolagem suave: acompanha o progresso dentro do parágrafo
      const pStart = starts[idx],
        pEnd = starts[idx + 1] ?? 1;
      const inner = Math.min(1, Math.max(0, (f - pStart) / Math.max(0.0001, pEnd - pStart)));
      const focusY = paraY[idx] + (paraY[idx + 1] - paraY[idx]) * inner;
      const maxScroll = Math.max(0, textH - bodyH);
      const scroll = t < INTRO ? 0 : Math.min(maxScroll, Math.max(0, focusY - bodyH * 0.4));
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx + 10, bodyTop + 4, cw - 20, bodyH);
      ctx.clip();
      if (reading) {
        // faixa dourada no parágrafo lido
        ctx.fillStyle = "rgba(255,209,102,0.28)";
        ctx.beginPath();
        ctx.roundRect(cx + m - 12, bodyTop + 8 + paraY[idx] - scroll - 6, cw - m * 2 + 24, paraY[idx + 1] - paraY[idx] - lay.lh * 0.55 + 14, 14);
        ctx.fill();
      }
      drawBody(ctx, lay, cx + m, bodyTop + 8 - scroll, Infinity, reading ? idx : -1);
      ctx.restore();
      // sino balançando ao lado do trecho lido
      if (reading) {
        ctx.font = "30px serif";
        ctx.textAlign = "center";
        ctx.save();
        const by = bodyTop + 8 + paraY[idx] - scroll + 10;
        ctx.translate(cx + 22, Math.min(Math.max(by, bodyTop + 10), bodyTop + bodyH - 10));
        ctx.rotate(Math.sin(t * 7) * 0.35);
        ctx.fillText("🔔", 0, 10);
        ctx.restore();
      }
      signature(ctx, cx + m, cy + ch - 140, cw - m * 2, s);
      ctx.restore();

      // final
      if (t > INTRO + readDur) {
        const e = Math.min(1, (t - INTRO - readDur) / 0.8);
        ctx.fillStyle = `rgba(5,10,26,${0.78 * e})`;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = e;
        ctx.textAlign = "center";
        ctx.fillStyle = "#FFD166";
        ctx.font = F.hand(96);
        ctx.fillText("Feliz Natal!", W / 2, H / 2 - 60);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = F.sans(28, 700);
        ctx.fillText("Peça a carta do Papai Noel em", W / 2, H / 2 + 20);
        ctx.fillStyle = "#FFD166";
        ctx.font = F.sans(34, 800);
        ctx.fillText(SITE_HOST(), W / 2, H / 2 + 70);
        ctx.globalAlpha = 1;
      }

      // neve
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      for (const fl of flakes) {
        const y = (fl.y + t * fl.v) % H;
        const x = fl.x + Math.sin(t + fl.y) * 12;
        ctx.beginPath();
        ctx.arc(x, y, fl.r, 0, Math.PI * 2);
        ctx.fill();
      }
      drawBrand(ctx, W, H - 60, "#0B132B");

      if (t >= dur) {
        rec.stop();
        return;
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}
