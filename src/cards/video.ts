/**
 * "Transformar meu cartão em vídeo": animação de 12 s feita no próprio aparelho.
 * Neve, luzinhas piscando, brilho dourado, zoom cinematográfico, nome da família entrando,
 * mensagem aparecendo, partículas de luz e encerramento com "Feliz Natal" + assinatura.
 * Música: caixinha de músicas de domínio público (tocada pelo próprio site), um áudio da família ou sem música.
 */
import { musicBox } from "../lib/christmasMusic";
import { F } from "../lib/shareKit";
import { videoMime } from "../lib/letterExport";
import * as A from "./art";
import { cardDims, drawStage, makeCanvas, renderFace } from "./render";
import { drawLine, templateOf } from "./templates";
import type { Anim, CardData } from "./types";

export type VideoFormat = "stories" | "feed";
export type VideoStyle = "classica" | "magica" | "suave";
export type VideoMusic = "caixinha" | "arquivo" | "nenhuma";
export const VIDEO_FORMATS: { id: VideoFormat; label: string; w: number; h: number }[] = [
  { id: "stories", label: "Reels · Stories · TikTok (1080×1920)", w: 1080, h: 1920 },
  { id: "feed", label: "Feed (1080×1350)", w: 1080, h: 1350 },
];
export const VIDEO_STYLES: { id: VideoStyle; label: string; hint: string }[] = [
  { id: "classica", label: "Clássica", hint: "Zoom suave na foto e textos entrando um a um" },
  { id: "magica", label: "Mágica", hint: "Mais brilhos, faíscas douradas e partículas de luz" },
  { id: "suave", label: "Suave", hint: "Sem zoom, só neve e textos aparecendo devagar" },
];
export const DURATION = 12;

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));
const ramp = (t: number, a: number, b: number) => ease((t - a) / (b - a));

/** Camadas prontas (o cartão é desenhado só 5 vezes, não a cada quadro). */
export type VideoLayers = { layers: HTMLCanvasElement[]; cw: number; ch: number };
export function prepareLayers(d: CardData, long = 1500): VideoLayers {
  const { W, H } = cardDims(d.orientation, long);
  const steps: Partial<Anim>[] = [
    { title: 0, family: 0, message: 0, sign: 0 },
    { title: 1, family: 0, message: 0, sign: 0 },
    { title: 1, family: 1, message: 0, sign: 0 },
    { title: 1, family: 1, message: 1, sign: 0 },
    { title: 1, family: 1, message: 1, sign: 1 },
  ];
  const layers = steps.map((s) => {
    const c = makeCanvas(W, H);
    renderFace(c.getContext("2d")!, W, H, d, "front", { title: 1, family: 1, message: 1, sign: 1, photo: 1, zoom: 1, t: -1, ...s });
    return c;
  });
  return { layers, cw: W, ch: H };
}

/** Desenha o quadro do tempo t (segundos). Usado na prévia e na gravação. */
export function drawFrame(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, d: CardData, L: VideoLayers, style: VideoStyle) {
  const u = Math.min(W, H) / 1000;
  const slow = style === "suave" ? 1.25 : 1;
  drawStage(ctx, W, H, d, t);
  // partículas de luz subindo
  const r = A.rng(42);
  const nP = style === "magica" ? 70 : 34;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < nP; i++) {
    const x0 = r() * W,
      sp = (30 + r() * 70) * u,
      ph = r() * 20,
      rad = (2 + r() * 4) * u;
    const y = H - (((t + ph) * sp) % (H + 40 * u));
    const al = 0.25 + 0.35 * Math.sin(t * 2 + i);
    const g = ctx.createRadialGradient(x0, y, 0, x0, y, rad * 4);
    g.addColorStop(0, `rgba(255,224,150,${al})`);
    g.addColorStop(1, "rgba(255,224,150,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x0 + Math.sin(t + i) * 10 * u, y, rad * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // posição do cartão: entra, câmera puxa da foto para o cartão inteiro, no fim sobe para dar espaço ao encerramento
  const story = H / W > 1.5;
  const endT = ramp(t, 9.3, 10.4);
  const fitScale = Math.min((W * 0.88) / L.cw, (H * (story ? 0.7 : 0.86)) / L.ch);
  const endScale = Math.min((W * 0.7) / L.cw, (H * (story ? 0.5 : 0.62)) / L.ch);
  const zoomIn = style === "suave" ? 1 : 1.55 - 0.55 * ramp(t, 0.3, 6.5);
  let scale = fitScale * zoomIn;
  scale = scale + (endScale - fitScale) * endT;
  const land = d.orientation === "paisagem";
  // foco inicial perto da foto
  const fx = land ? 0.3 : 0.5,
    fy = land ? 0.48 : 0.4;
  const focusMix = style === "suave" ? 0 : 1 - ramp(t, 0.3, 6.5);
  const cx = W / 2 - (fx - 0.5) * L.cw * scale * focusMix;
  const cyBase = story ? H * 0.47 : H * 0.5;
  const cyEnd = story ? H * 0.34 : H * 0.4;
  const cy = cyBase - (fy - 0.5) * L.ch * scale * focusMix + (cyEnd - cyBase) * endT;
  const appear = ramp(t, 0, 0.9);
  const w = L.cw * scale,
    h = L.ch * scale;
  ctx.save();
  ctx.globalAlpha = appear;
  ctx.translate(cx, cy);
  ctx.rotate((1 - appear) * -0.04);
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 60 * u;
  ctx.shadowOffsetY = 24 * u;
  ctx.fillStyle = "#000";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.shadowColor = "transparent";
  // camadas de texto em sequência
  const k = [ramp(t, 1.2 * slow, 2.2 * slow), ramp(t, 2.6 * slow, 3.5 * slow), ramp(t, 4 * slow, 5.4 * slow), ramp(t, 6 * slow, 6.9 * slow)];
  let shown = 0;
  while (shown < 4 && k[shown] >= 1) shown++;
  ctx.drawImage(L.layers[shown], -w / 2, -h / 2, w, h);
  if (shown < 4 && k[shown] > 0) {
    ctx.globalAlpha = appear * k[shown];
    ctx.drawImage(L.layers[shown + 1], -w / 2, -h / 2, w, h);
    ctx.globalAlpha = appear;
  }
  // brilho dourado passando (luz atravessando o cartão)
  const sweep = ramp(t, 7.2, 8.8);
  if (sweep > 0 && sweep < 1) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(-w / 2, -h / 2, w, h);
    ctx.clip();
    ctx.globalCompositeOperation = "lighter";
    const sx = -w / 2 - w * 0.5 + sweep * w * 2;
    const g = ctx.createLinearGradient(sx - w * 0.25, -h / 2, sx + w * 0.25, h / 2);
    g.addColorStop(0, "rgba(255,220,140,0)");
    g.addColorStop(0.5, "rgba(255,230,170,0.42)");
    g.addColorStop(1, "rgba(255,220,140,0)");
    ctx.fillStyle = g;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }
  // estrelinhas cintilando sobre o cartão
  const r2 = A.rng(7);
  const nT = style === "magica" ? 16 : 8;
  for (let i = 0; i < nT; i++) {
    const x = (r2() - 0.5) * w,
      y = (r2() - 0.5) * h,
      ph = r2() * 6.28;
    const a = Math.max(0, Math.sin(t * 2.4 + ph)) * appear;
    if (a > 0.05) A.twinkle(ctx, x, y, (14 + r2() * 18) * u * (style === "magica" ? 1.3 : 1), "#FFE7A0", a);
  }
  ctx.restore();

  // neve na frente de tudo
  A.snowfall(ctx, W, H, style === "suave" ? 60 : 90, 77, u * 1.2, "255,255,255", t * 1.3);

  // encerramento
  const fin = ramp(t, 9.8, 10.9);
  if (fin > 0) {
    const st = templateOf(d.template).theme.style;
    if (!story) {
      ctx.fillStyle = `rgba(5,8,20,${0.55 * fin})`;
      ctx.fillRect(0, 0, W, H);
    }
    const ty = story ? H * 0.71 : H * 0.42;
    ctx.save();
    ctx.translate(0, (1 - fin) * 40 * u);
    drawLine(ctx, d.title || "Feliz Natal", "hand", 170 * u, "gold", W / 2, ty, W * 0.86, fin, "rgba(0,0,0,0.5)");
    const s2 = ramp(t, 10.4, 11.3);
    const lineSign = d.signature || d.family;
    if (lineSign) drawLine(ctx, lineSign, "hand", 76 * u, "#FFF4DA", W / 2, ty + 150 * u, W * 0.84, s2, "rgba(0,0,0,0.5)");
    if (d.family && d.signature) drawLine(ctx, d.family.toUpperCase(), "cinzel", 34 * u, "#F2D27A", W / 2, ty + 230 * u, W * 0.84, s2, undefined, 0.2);
    ctx.restore();
    void st;
  }
  if (d.watermark) {
    ctx.save();
    ctx.font = F.sans(24 * u, 800);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.textAlign = "center";
    ctx.fillText("✨ cartamagicanatal.com.br", W / 2, H - 40 * u);
    ctx.restore();
  }
  // fade final
  const out = ramp(t, DURATION - 0.6, DURATION);
  if (out > 0) {
    ctx.fillStyle = `rgba(0,0,0,${out * 0.85})`;
    ctx.fillRect(0, 0, W, H);
  }
}

export type VideoOptions = { format: VideoFormat; style: VideoStyle; music: VideoMusic; audioFile?: File | null };

/** Grava o vídeo em tempo real (12 s). MP4 quando o navegador grava MP4; senão WebM. */
export async function recordCardVideo(d: CardData, o: VideoOptions, onProgress: (f: number) => void, signal?: { cancel: boolean }) {
  const mime = videoMime();
  if (!mime) throw new Error("Este navegador não grava vídeo. Tente pelo Chrome, Edge ou Safari atualizados.");
  const spec = VIDEO_FORMATS.find((f) => f.id === o.format)!;
  const c = makeCanvas(spec.w, spec.h);
  const ctx = c.getContext("2d")!;
  const L = prepareLayers(d);
  drawFrame(ctx, spec.w, spec.h, 0, d, L, o.style);
  const vStream = (c as any).captureStream(30) as MediaStream;
  const tracks: MediaStreamTrack[] = [...vStream.getVideoTracks()];
  let stopAudio: () => void = () => {};
  if (o.music === "caixinha") {
    const s = musicBox.recordingStream();
    if (s) {
      tracks.push(...s.getAudioTracks());
      if (!musicBox.playing) await musicBox.play();
      stopAudio = () => musicBox.pause();
    }
  } else if (o.music === "arquivo" && o.audioFile) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    const ac: AudioContext = new AC();
    const buf = await ac.decodeAudioData(await o.audioFile.arrayBuffer());
    const src = ac.createBufferSource();
    src.buffer = buf;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(1, ac.currentTime + 0.6);
    gain.gain.setValueAtTime(1, ac.currentTime + DURATION - 1.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + DURATION);
    const dest = ac.createMediaStreamDestination();
    src.connect(gain);
    gain.connect(dest);
    gain.connect(ac.destination);
    src.start();
    tracks.push(...dest.stream.getAudioTracks());
    stopAudio = () => {
      try {
        src.stop();
      } catch {
        /* já parou */
      }
      ac.close();
    };
  }
  const rec = new MediaRecorder(new MediaStream(tracks), { mimeType: mime, videoBitsPerSecond: 8_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise<void>((ok) => (rec.onstop = () => ok()));
  rec.start(250);
  const t0 = performance.now();
  await new Promise<void>((ok) => {
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      if (signal?.cancel || t >= DURATION) return ok();
      drawFrame(ctx, spec.w, spec.h, t, d, L, o.style);
      onProgress(t / DURATION);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  drawFrame(ctx, spec.w, spec.h, DURATION, d, L, o.style);
  await new Promise((r) => setTimeout(r, 120));
  rec.stop();
  stopAudio();
  await done;
  if (signal?.cancel) throw new Error("cancelado");
  const type = mime.split(";")[0];
  return { blob: new Blob(chunks, { type }), ext: type.includes("mp4") ? "mp4" : "webm", w: spec.w, h: spec.h };
}
