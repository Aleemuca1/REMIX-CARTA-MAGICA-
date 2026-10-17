/**
 * Ferramentas de compartilhamento: imagens prontas para WhatsApp/Instagram,
 * QR code, envio de arquivos pelo menu do celular e downloads.
 * Tudo é gerado aqui no navegador.
 */
import qrcode from "qrcode-generator";

export const SITE_HOST = () => window.location.host.replace(/^www\./, "");

export function canvasToBlob(c: HTMLCanvasElement, type = "image/png", q = 0.92): Promise<Blob> {
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("blob"))), type, q));
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function safeName(s: string) {
  return (
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "familia"
  );
}

/** O celular consegue mandar este arquivo direto para o WhatsApp/Instagram? */
export function canShareFiles(files: File[]) {
  try {
    return !!navigator.canShare && navigator.canShare({ files });
  } catch {
    return false;
  }
}

/**
 * Abre o menu do celular para enviar o arquivo (WhatsApp, Instagram, Telegram...).
 * Se o aparelho não suportar, baixa o arquivo. Devolve "shared" | "downloaded" | "canceled".
 */
export async function shareOrDownload(blob: Blob, filename: string, text: string, title?: string) {
  const file = new File([blob], filename, { type: blob.type });
  if (canShareFiles([file])) {
    try {
      await navigator.share({ files: [file], text, title });
      return "shared" as const;
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return "canceled" as const;
    }
  }
  downloadBlob(blob, filename);
  return "downloaded" as const;
}

export const whatsappUrl = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;
export const facebookUrl = (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
export const telegramUrl = (url: string, text: string) =>
  `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
export const xUrl = (url: string, text: string) =>
  `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

export async function copyText(t: string) {
  try {
    await navigator.clipboard.writeText(t);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = t;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** Desenha um QR code (quadrado de lado `size`) no canvas. */
export function drawQr(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, dark = "#1C2541", light = "#FFFFFF") {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  const quiet = 2;
  const cell = size / (n + quiet * 2);
  ctx.save();
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, size * 0.06);
  ctx.fill();
  ctx.fillStyle = dark;
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (qr.isDark(r, c)) ctx.fillRect(x + (c + quiet) * cell, y + (r + quiet) * cell, Math.ceil(cell), Math.ceil(cell));
  ctx.restore();
}

/** Espera as fontes do site carregarem (para o texto sair bonito na imagem). */
export async function ensureFonts() {
  try {
    await Promise.all(
      ["700 40px Cinzel", "40px 'Great Vibes'", "40px 'Playfair Display'", "italic 40px 'Playfair Display'", "700 40px 'Plus Jakarta Sans'"].map((f) =>
        document.fonts.load(f),
      ),
    );
  } catch {
    /* segue com as fontes do sistema */
  }
}

export const F = {
  cinzel: (px: number, w = 700) => `${w} ${px}px Cinzel, Georgia, serif`,
  serif: (px: number, italic = false) => `${italic ? "italic " : ""}${px}px 'Playfair Display', Georgia, serif`,
  hand: (px: number) => `${px}px 'Great Vibes', 'Brush Script MT', cursive`,
  sans: (px: number, w = 700) => `${w} ${px}px 'Plus Jakarta Sans', system-ui, sans-serif`,
};

/** Quebra o texto em linhas que cabem na largura. */
export function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    const words = para.split(/\s+/).filter(Boolean);
    let line = "";
    for (const w of words) {
      const t = line ? `${line} ${w}` : w;
      if (ctx.measureText(t).width > maxW && line) {
        out.push(line);
        line = w;
      } else line = t;
    }
    out.push(line);
  }
  return out;
}

/** Céu de Natal estrelado com neve (fundo das imagens para redes sociais). */
export function drawNightSky(ctx: CanvasRenderingContext2D, w: number, h: number, seed = 7, palette: [string, string, string] = ["#050A1A", "#0E1A3A", "#1C2A55"]) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, palette[0]);
  g.addColorStop(0.55, palette[1]);
  g.addColorStop(1, palette[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  // brilho da lua
  const mx = w * 0.9,
    my = Math.min(h * 0.06, w * 0.1);
  const moon = ctx.createRadialGradient(mx, my, 0, mx, my, w * 0.25);
  moon.addColorStop(0, "rgba(255,233,170,0.35)");
  moon.addColorStop(1, "rgba(255,233,170,0)");
  ctx.fillStyle = moon;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#FFF6D8";
  ctx.beginPath();
  ctx.arc(mx, my, w * 0.035, 0, Math.PI * 2);
  ctx.fill();
  // estrelas
  for (let i = 0; i < 90; i++) {
    ctx.globalAlpha = 0.3 + rnd() * 0.7;
    ctx.fillStyle = "#FFFFFF";
    const r = rnd() * w * 0.0025 + 0.6;
    ctx.beginPath();
    ctx.arc(rnd() * w, rnd() * h * 0.6, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // flocos de neve
  for (let i = 0; i < 140; i++) {
    ctx.globalAlpha = 0.25 + rnd() * 0.6;
    const r = rnd() * w * 0.005 + 1;
    ctx.beginPath();
    ctx.arc(rnd() * w, rnd() * h, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // montes de neve
  ctx.fillStyle = "#EAF4FF";
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, h * 0.93);
  ctx.quadraticCurveTo(w * 0.25, h * 0.88, w * 0.5, h * 0.93);
  ctx.quadraticCurveTo(w * 0.75, h * 0.97, w, h * 0.91);
  ctx.lineTo(w, h);
  ctx.fill();
}

/** Pisca-pisca no topo da imagem. */
export function drawLights(ctx: CanvasRenderingContext2D, w: number, y: number) {
  const colors = ["#EF233C", "#FFD166", "#2DC653", "#4CC9F0"];
  ctx.strokeStyle = "rgba(20,30,50,0.9)";
  ctx.lineWidth = w * 0.003;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 4) ctx.lineTo(x, y + Math.sin((x / w) * Math.PI * 6) * w * 0.012);
  ctx.stroke();
  const n = 14;
  for (let i = 0; i < n; i++) {
    const x = (i + 0.5) * (w / n);
    const yy = y + Math.sin((x / w) * Math.PI * 6) * w * 0.012 + w * 0.012;
    const c = colors[i % colors.length];
    const glow = ctx.createRadialGradient(x, yy, 0, x, yy, w * 0.03);
    glow.addColorStop(0, c);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, yy, w * 0.03, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.ellipse(x, yy, w * 0.008, w * 0.013, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Selinho "feito no site" no rodapé das imagens. */
export function drawBrand(ctx: CanvasRenderingContext2D, w: number, y: number, color = "#FFF6D8") {
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  ctx.font = F.cinzel(Math.round(w * 0.03));
  ctx.fillText("✦ Carta Mágica ✦", w / 2, y);
  ctx.globalAlpha = 0.75;
  ctx.font = F.sans(Math.round(w * 0.022), 600);
  ctx.fillText(SITE_HOST(), w / 2, y + w * 0.036);
  ctx.restore();
}
