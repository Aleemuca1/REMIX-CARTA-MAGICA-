import type { Ornament } from "./model";

/** Gera um PNG com a árvore e as frases da família embaixo, pronto para baixar ou mandar no WhatsApp. */
export async function treeToPng(svg: SVGSVGElement, title: string, ornaments: Ornament[]): Promise<Blob> {
  const W = 1080;
  const treeH = Math.round((W * 720) / 600);
  const msgs = ornaments.filter((o) => o.text);
  const ctx0 = document.createElement("canvas").getContext("2d")!;
  ctx0.font = "30px Georgia, serif";

  // quebra as frases em linhas
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
  const blocks = msgs.map((m) => ({ lines: wrap(`“${m.text}”`, W - 160), author: m.author }));
  const msgH = msgs.length ? 120 + blocks.reduce((a, b) => a + b.lines.length * 40 + (b.author ? 36 : 0) + 28, 0) : 0;
  const H = 130 + treeH + msgH + 90;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0B132B");
  bg.addColorStop(1, "#1C2541");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // título
  ctx.fillStyle = "#FFD166";
  ctx.textAlign = "center";
  ctx.font = "bold 50px Georgia, serif";
  ctx.fillText(title || "Nossa Árvore de Natal", W / 2, 82);

  // árvore (SVG -> imagem)
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", String(W));
  clone.setAttribute("height", String(treeH));
  const xml = new XMLSerializer().serializeToString(clone);
  const img = new Image();
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
  await img.decode();
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(40, 120, W - 80, treeH - 80, 36);
  ctx.clip();
  ctx.drawImage(img, 40, 120, W - 80, ((W - 80) * 720) / 600);
  ctx.restore();

  // frases
  let y = 120 + treeH - 80 + 90;
  if (msgs.length) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 36px Georgia, serif";
    ctx.fillText("✨ Frases da nossa família ✨", W / 2, y);
    y += 64;
    for (const b of blocks) {
      ctx.fillStyle = "#EDF2F4";
      ctx.font = "italic 30px Georgia, serif";
      for (const line of b.lines) {
        ctx.fillText(line, W / 2, y);
        y += 40;
      }
      if (b.author) {
        ctx.fillStyle = "#FFD166";
        ctx.font = "bold 24px Arial, sans-serif";
        ctx.fillText(`— ${b.author}`, W / 2, y);
        y += 36;
      }
      y += 28;
    }
  }

  ctx.fillStyle = "rgba(237,242,244,.55)";
  ctx.font = "22px Arial, sans-serif";
  ctx.fillText(`Feito com amor na Carta Mágica · ${window.location.host}`, W / 2, H - 40);

  return await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("png"))), "image/png"));
}
