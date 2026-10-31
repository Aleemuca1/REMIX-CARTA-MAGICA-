/** Imagem do resultado da "Lista do Bom Comportamento" (story 1080x1920) para WhatsApp e Instagram. */
import { F, drawBrand, drawLights, drawNightSky, drawQr, ensureFonts, wrapLines } from "./shareKit";
import { parchment, waxSeal } from "./letterExport";

export async function renderNiceListStory(o: { name: string; percent: number; level: string; emoji: string; url: string }) {
  await ensureFonts();
  const W = 1080;
  const H = 1920;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  drawNightSky(ctx, W, H, 11);
  drawLights(ctx, W, 70);

  ctx.textAlign = "center";
  ctx.fillStyle = "#FFD166";
  ctx.font = F.sans(40, 800);
  ctx.fillText("🎅 RESULTADO OFICIAL DO POLO NORTE", W / 2, 230);

  // pergaminho
  const cx = 90;
  const cy = 300;
  const cw = W - 180;
  const ch = 1170;
  parchment(ctx, cx, cy, cw, ch, 40);

  ctx.fillStyle = "#9B021A";
  ctx.font = F.cinzel(46, 800);
  ctx.fillText("LISTA DO BOM", W / 2, cy + 140);
  ctx.fillText("COMPORTAMENTO", W / 2, cy + 200);
  ctx.fillStyle = "rgba(28,37,65,0.65)";
  ctx.font = F.serif(30, true);
  ctx.fillText("Conferida pelos duendes do Papai Noel", W / 2, cy + 255);

  // nome
  ctx.fillStyle = "#1C2541";
  let size = 130;
  ctx.font = F.hand(size);
  while (ctx.measureText(o.name).width > cw - 140 && size > 60) {
    size -= 6;
    ctx.font = F.hand(size);
  }
  ctx.fillText(o.name, W / 2, cy + 430);
  ctx.strokeStyle = "rgba(155,2,26,0.35)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx + 140, cy + 460);
  ctx.lineTo(cx + cw - 140, cy + 460);
  ctx.stroke();

  ctx.fillStyle = "#1C2541";
  ctx.font = F.serif(40);
  ctx.fillText("está na lista com", W / 2, cy + 540);

  // porcentagem com barra
  ctx.fillStyle = "#2DC653";
  ctx.font = F.cinzel(170, 800);
  ctx.fillText(`${o.percent}%`, W / 2, cy + 720);
  const bx = cx + 120;
  const bw = cw - 240;
  const by = cy + 770;
  ctx.fillStyle = "rgba(28,37,65,0.1)";
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, 34, 17);
  ctx.fill();
  const g = ctx.createLinearGradient(bx, 0, bx + bw, 0);
  g.addColorStop(0, "#2DC653");
  g.addColorStop(1, "#FFD166");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(bx, by, (bw * o.percent) / 100, 34, 17);
  ctx.fill();

  ctx.fillStyle = "#9B021A";
  ctx.font = F.sans(46, 800);
  wrapLines(ctx, `${o.emoji} ${o.level}`, cw - 160).forEach((l, i) => ctx.fillText(l, W / 2, cy + 900 + i * 56));

  // carimbo APROVADO
  ctx.save();
  ctx.translate(cx + cw - 190, cy + 1050);
  ctx.rotate(-0.22);
  ctx.strokeStyle = "rgba(45,198,83,0.85)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(-150, -55, 300, 110, 18);
  ctx.stroke();
  ctx.fillStyle = "rgba(45,198,83,0.9)";
  ctx.font = F.sans(54, 900);
  ctx.textBaseline = "middle";
  ctx.fillText("APROVADO ✓", 0, 4);
  ctx.restore();
  waxSeal(ctx, cx + 170, cy + 1050, 70);

  // chamada + QR
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = F.sans(46, 800);
  ctx.fillText("E você, está na lista? 🤔", W / 2, 1545);
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(W / 2 - 115, 1575, 230, 230, 18);
  ctx.fill();
  drawQr(ctx, o.url, W / 2 - 100, 1590, 200);
  drawBrand(ctx, W, 1855, "#9B021A");
  return c;
}
