import { VIEW_H, VIEW_W, type HouseItem } from "./model";

/** PNG com a casinha, os nomes da família e os recadinhos embaixo (para baixar ou mandar no WhatsApp). */
export async function houseToPng(svg: SVGSVGElement, title: string, items: HouseItem[]): Promise<Blob> {
  const W = 1200;
  const sceneH = Math.round(((W - 80) * VIEW_H) / VIEW_W);
  const msgs = items.filter((i) => i.text);
  const names = items.filter((i) => i.kind === "pessoa" && i.name).map((i) => i.name as string);
  const ctx0 = document.createElement("canvas").getContext("2d")!;
  ctx0.font = "28px Georgia, serif";
  const wrap = (text: string, max: number) => {
    const words = text.split(" ");
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const t = cur ? `${cur} ${w}` : w;
      if (ctx0.measureText(t).width > max && cur) {
        lines.push(cur);
        cur = w;
      } else cur = t;
    }
    if (cur) lines.push(cur);
    return lines;
  };
  const blocks = msgs.map((m) => ({ lines: wrap(`“${m.text}”`, W - 200), author: m.author || m.name }));
  const msgH = msgs.length ? 100 + blocks.reduce((a, b) => a + b.lines.length * 38 + (b.author ? 34 : 0) + 24, 0) : 0;
  const namesH = names.length ? 70 : 0;
  const H = 130 + sceneH + 30 + namesH + msgH + 80;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#3A1F0F");
  bg.addColorStop(0.35, "#1C2541");
  bg.addColorStop(1, "#0B132B");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFD166";
  ctx.font = "bold 50px Georgia, serif";
  ctx.fillText(`🏡 ${title}`, W / 2, 84);

  // a cena (sem balões, que usam HTML e não entram na imagem)
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.querySelectorAll("foreignObject").forEach((n) => n.parentElement?.remove());
  clone.setAttribute("width", String(W - 80));
  clone.setAttribute("height", String(sceneH));
  const xml = new XMLSerializer().serializeToString(clone);
  const img = new Image();
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
  await img.decode();
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(40, 120, W - 80, sceneH, 32);
  ctx.clip();
  ctx.drawImage(img, 40, 120, W - 80, sceneH);
  ctx.restore();
  ctx.strokeStyle = "#FFD166";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(40, 120, W - 80, sceneH, 32);
  ctx.stroke();

  let y = 120 + sceneH + 70;
  if (names.length) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 30px Arial, sans-serif";
    ctx.fillText(`👨‍👩‍👧 ${names.join(" · ")}`.slice(0, 110), W / 2, y);
    y += namesH;
  }
  if (msgs.length) {
    ctx.fillStyle = "#FFD166";
    ctx.font = "bold 34px Georgia, serif";
    ctx.fillText("💌 Recadinhos da família", W / 2, y);
    y += 56;
    for (const b of blocks) {
      ctx.fillStyle = "#EDF2F4";
      ctx.font = "italic 28px Georgia, serif";
      for (const line of b.lines) {
        ctx.fillText(line, W / 2, y);
        y += 38;
      }
      if (b.author) {
        ctx.fillStyle = "#FFD166";
        ctx.font = "bold 22px Arial, sans-serif";
        ctx.fillText(`— ${b.author}`, W / 2, y);
        y += 34;
      }
      y += 24;
    }
  }
  ctx.fillStyle = "rgba(237,242,244,.55)";
  ctx.font = "22px Arial, sans-serif";
  ctx.fillText(`Feito com amor na Carta Mágica · ${window.location.host}`, W / 2, H - 36);
  return await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("png"))), "image/png"));
}
