/** Cartão de recorde dos jogos (1080x1920) para Status do WhatsApp e Stories. */
import { F, drawBrand, drawLights, drawNightSky, drawQr, ensureFonts } from "./shareKit";

export type ScoreCardInput = {
  game: string; // ex.: "Entrega Relâmpago"
  score: number;
  title: string; // ex.: "Rena Veloz"
  emoji: string;
  stats: [string, number | string, string][];
  player?: string;
  newBest?: boolean;
  snapshot?: HTMLCanvasElement | null;
  palette?: [string, string, string];
  accent?: string;
  /** seção do site para o link (ex.: "jogo", "urso") */
  anchor: string;
};

export const gameLink = (anchor: string) => `${window.location.origin}/#${anchor}`;

export async function renderScoreCard(o: ScoreCardInput) {
  await ensureFonts();
  const W = 1080,
    H = 1920;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const accent = o.accent ?? "#FFD166";
  drawNightSky(ctx, W, H, o.score % 97, o.palette);
  drawLights(ctx, W, 40);

  ctx.textAlign = "center";
  ctx.fillStyle = accent;
  ctx.font = F.sans(36, 800);
  ctx.fillText(`🎮 ${o.game.toUpperCase()}`, W / 2, 200);
  if (o.player) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = F.hand(96);
    ctx.fillText(o.player, W / 2, 310);
  }

  // print do jogo numa moldura
  let y = o.player ? 340 : 250;
  if (o.snapshot && o.snapshot.width > 0) {
    const fw = W - 160;
    const fh = Math.min(420, (o.snapshot.height / o.snapshot.width) * fw);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 40;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.roundRect(80 - 8, y - 8, fw + 16, fh + 16, 36);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(80, y, fw, fh, 30);
    ctx.clip();
    // recorta o centro da imagem do jogo
    const sr = o.snapshot.width / o.snapshot.height;
    const dr = fw / fh;
    let sw = o.snapshot.width,
      sh = o.snapshot.height;
    if (sr > dr) sw = sh * dr;
    else sh = sw / dr;
    ctx.drawImage(o.snapshot, (o.snapshot.width - sw) / 2, (o.snapshot.height - sh) / 2, sw, sh, 80, y, fw, fh);
    ctx.restore();
    y += fh + 60;
  } else y += 40;

  ctx.font = "150px serif";
  ctx.fillText(o.emoji, W / 2, y + 130);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = F.cinzel(58, 800);
  ctx.fillText(o.title, W / 2, y + 220);
  ctx.fillStyle = accent;
  ctx.font = F.cinzel(170, 800);
  ctx.fillText(String(o.score), W / 2, y + 390);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = F.sans(32, 700);
  ctx.fillText("PONTOS", W / 2, y + 440);
  if (o.newBest) {
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.roundRect(W / 2 - 190, y + 470, 380, 66, 33);
    ctx.fill();
    ctx.fillStyle = "#0B132B";
    ctx.font = F.sans(32, 800);
    ctx.fillText("🏆 NOVO RECORDE!", W / 2, y + 515);
  }

  // estatísticas
  const sy = y + 560;
  const bw = (W - 200) / o.stats.length;
  o.stats.forEach(([e, v, l], i) => {
    const x = 100 + i * bw;
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.roundRect(x + 10, sy, bw - 20, 175, 28);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "54px serif";
    ctx.fillText(e, x + bw / 2, sy + 70);
    ctx.font = F.sans(48, 800);
    ctx.fillText(String(v), x + bw / 2, sy + 125);
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.font = F.sans(26, 600);
    ctx.fillText(l, x + bw / 2, sy + 160);
  });

  // desafio + QR
  const qy = Math.min(H - 330, sy + 205);
  const q = 160;
  drawQr(ctx, gameLink(o.anchor), 140, qy, q);
  ctx.textAlign = "left";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = F.sans(42, 800);
  ctx.fillText("Consegue me vencer?", 330, qy + 62);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = F.sans(28, 500);
  ctx.fillText("Aponte a câmera e jogue grátis 🎄", 330, qy + 112);

  ctx.save();
  ctx.fillStyle = "rgba(11,19,43,0.85)";
  ctx.beginPath();
  ctx.roundRect(W / 2 - 300, H - 120, 600, 92, 46);
  ctx.fill();
  ctx.restore();
  drawBrand(ctx, W, H - 78, accent);
  return c;
}

/** Certificado do Papai Noel (paisagem 1600x1131) que a criança ganha ao terminar o jogo. */
export async function renderCertificate(o: { player: string; title: string; emoji: string; score: number; game: string; feat: string }) {
  await ensureFonts();
  const { parchment, waxSeal } = await import("./letterExport");
  const W = 1600,
    H = 1131;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0B132B";
  ctx.fillRect(0, 0, W, H);
  parchment(ctx, 0, 0, W, H, 0);
  ctx.textAlign = "center";
  ctx.fillStyle = "#9B021A";
  ctx.font = F.cinzel(34, 800);
  ctx.fillText("✦ OFICINA DO PAPAI NOEL • POLO NORTE ✦", W / 2, 150);
  ctx.fillStyle = "#1C2541";
  ctx.font = F.cinzel(74, 800);
  ctx.fillText("Certificado de Ajudante", W / 2, 250);
  ctx.fillText("do Papai Noel", W / 2, 335);
  ctx.fillStyle = "rgba(28,37,65,0.75)";
  ctx.font = F.serif(34, true);
  ctx.fillText("Este certificado é entregue com muito orgulho a", W / 2, 420);
  ctx.fillStyle = "#9B021A";
  let ns = 130;
  const name = o.player || "Pequeno Ajudante";
  ctx.font = F.hand(ns);
  while (ctx.measureText(name).width > W - 360 && ns > 60) ctx.font = F.hand((ns -= 6));
  ctx.fillText(name, W / 2, 545);
  ctx.strokeStyle = "rgba(155,2,26,0.35)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 420, 575);
  ctx.lineTo(W / 2 + 420, 575);
  ctx.stroke();
  ctx.fillStyle = "#1C2541";
  ctx.font = F.serif(36);
  ctx.fillText(o.feat, W / 2, 645);
  ctx.font = F.serif(36);
  ctx.fillText(`no jogo ${o.game} e conquistou a medalha`, W / 2, 695);
  // medalha
  const my = 815;
  ctx.fillStyle = "#D90429";
  ctx.beginPath();
  ctx.moveTo(W / 2 - 42, my - 92);
  ctx.lineTo(W / 2 - 20, my - 40);
  ctx.lineTo(W / 2 + 20, my - 40);
  ctx.lineTo(W / 2 + 42, my - 92);
  ctx.fill();
  const g = ctx.createRadialGradient(W / 2 - 20, my - 20, 10, W / 2, my, 80);
  g.addColorStop(0, "#FFE9A8");
  g.addColorStop(1, "#E9B949");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(W / 2, my, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#B8860B";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.font = "60px serif";
  ctx.textBaseline = "middle";
  ctx.fillText(o.emoji, W / 2, my + 4);
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#9B021A";
  ctx.font = F.cinzel(46, 800);
  ctx.fillText(o.title, W / 2, my + 118);
  // rodapé
  waxSeal(ctx, 230, 990, 62);
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(28,37,65,0.7)";
  ctx.font = F.sans(24, 600);
  ctx.fillText(`${o.score} pontos`, 310, 982);
  ctx.fillText(new Date().toLocaleDateString("pt-BR"), 310, 1016);
  ctx.textAlign = "right";
  ctx.fillStyle = "#9B021A";
  ctx.font = F.hand(84);
  ctx.fillText("Papai Noel", W - 190, 995);
  ctx.fillStyle = "rgba(28,37,65,0.6)";
  ctx.font = F.cinzel(20, 700);
  ctx.fillText("CHEFE DA OFICINA DE BRINQUEDOS", W - 190, 1030);
  return c;
}
