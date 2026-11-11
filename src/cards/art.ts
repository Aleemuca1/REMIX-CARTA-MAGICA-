/**
 * Peças de ilustração dos cartões de Natal, desenhadas em vetor no canvas.
 * Tudo é código (nenhuma imagem baixada), então sai nítido em qualquer tamanho, inclusive no PDF a 300 DPI.
 * Convenção: `u` é a unidade do cartão (1/1000 do lado menor).
 */
export type Ctx = CanvasRenderingContext2D;
export type Box = { x: number; y: number; w: number; h: number };

export function rng(seed: number) {
  let v = seed >>> 0;
  return () => {
    v = (v + 0x6d2b79f5) >>> 0;
    let t = v;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function goldGrad(ctx: Ctx, x0: number, y0: number, x1: number, y1: number) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  ["#9A6B12", "#F7E7A6", "#D4A537", "#FFF4C9", "#B8860B", "#F2D27A"].forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c));
  return g;
}
export function redGrad(ctx: Ctx, y0: number, y1: number) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, "#E8243F");
  g.addColorStop(0.55, "#B80E25");
  g.addColorStop(1, "#7E0517");
  return g;
}

export function roundRect(ctx: Ctx, b: Box, r: number) {
  ctx.beginPath();
  ctx.roundRect(b.x, b.y, b.w, b.h, r);
}
export function archPath(ctx: Ctx, b: Box) {
  const r = b.w / 2;
  ctx.beginPath();
  ctx.moveTo(b.x, b.y + b.h);
  ctx.lineTo(b.x, b.y + r);
  ctx.arc(b.x + r, b.y + r, r, Math.PI, 0);
  ctx.lineTo(b.x + b.w, b.y + b.h);
  ctx.closePath();
}
export function ovalPath(ctx: Ctx, b: Box) {
  ctx.beginPath();
  ctx.ellipse(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, b.h / 2, 0, 0, Math.PI * 2);
}
export const grow = (b: Box, d: number): Box => ({ x: b.x - d, y: b.y - d, w: b.w + 2 * d, h: b.h + 2 * d });

/** Luzes desfocadas (bokeh). */
export function bokeh(ctx: Ctx, W: number, H: number, n: number, seed: number, colors: string[], rMin: number, rMax: number, alpha = 0.5) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * W,
      y = r() * H,
      rr = rMin + r() * (rMax - rMin);
    const c = colors[i % colors.length];
    const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
    g.addColorStop(0, hexA(c, alpha * (0.5 + r() * 0.5)));
    g.addColorStop(0.6, hexA(c, alpha * 0.25));
    g.addColorStop(1, hexA(c, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rr, 0, Math.PI * 2);
    ctx.fill();
  }
}
export function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a))})`;
}

export function stars(ctx: Ctx, W: number, H: number, n: number, seed: number, maxY = 1, size = 2.2) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = `rgba(255,250,230,${0.3 + r() * 0.7})`;
    ctx.beginPath();
    ctx.arc(r() * W, r() * H * maxY, 0.5 + r() * size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function star5(ctx: Ctx, x: number, y: number, r: number, fill: string | CanvasGradient, inner = 0.42) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * inner : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

/** Brilho de 4 pontas (estrela cintilante). */
export function twinkle(ctx: Ctx, x: number, y: number, r: number, color = "#FFF4C9", alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, hexA(color, 0.9));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
  ctx.restore();
}

export function crystal(ctx: Ctx, x: number, y: number, r: number, color: string, lw: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  for (let k = 0; k < 6; k++) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r);
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(-r * 0.25, -r * 0.78);
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(r * 0.25, -r * 0.78);
    ctx.stroke();
  }
  ctx.restore();
}

/** Neve caindo (pontos), determinística. */
export function snowfall(ctx: Ctx, W: number, H: number, n: number, seed: number, u: number, color = "255,255,255", t = 0) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x0 = r() * W,
      y0 = r() * H,
      big = r() < 0.15,
      rad = (big ? 3 + r() * 3 : 1 + r() * 2.2) * u,
      sp = (0.4 + r()) * 60 * u,
      ph = r() * 6.28;
    const y = (y0 + t * sp) % (H + 20 * u);
    const x = x0 + Math.sin(t * 0.8 + ph) * 14 * u;
    ctx.fillStyle = `rgba(${color},${big ? 0.45 : 0.8})`;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Raminho de pinheiro com agulhas e frutinhas. */
export function sprig(ctx: Ctx, x: number, y: number, len: number, ang: number, seed = 1, berries = true) {
  const r = rng(seed);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.lineCap = "round";
  ctx.strokeStyle = "#5B3A1E";
  ctx.lineWidth = len * 0.025;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.5, -len * 0.06, len, 0);
  ctx.stroke();
  const greens = ["#1E5A3A", "#2E7D4F", "#174A2F", "#3C8F5E"];
  for (let i = 0; i < 46; i++) {
    const t = i / 46;
    const px = t * len,
      py = -Math.sin(t * Math.PI) * len * 0.03;
    const n = len * (0.16 - t * 0.07) * (0.8 + r() * 0.4);
    for (const side of [-1, 1]) {
      ctx.strokeStyle = greens[Math.floor(r() * 4)];
      ctx.lineWidth = len * 0.012;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + n * 0.55, py + side * n * 0.85);
      ctx.stroke();
    }
  }
  if (berries)
    for (const [bx, by] of [
      [len * 0.18, len * 0.05],
      [len * 0.24, -len * 0.04],
      [len * 0.3, len * 0.07],
    ]) {
      berry(ctx, bx, by, len * 0.034);
    }
  ctx.restore();
}
export function berry(ctx: Ctx, x: number, y: number, r: number) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, "#FF7B7B");
  g.addColorStop(1, "#8E0016");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function holly(ctx: Ctx, x: number, y: number, s: number, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  for (const a of [-0.55, 0.55]) {
    ctx.save();
    ctx.rotate(a);
    const g = ctx.createLinearGradient(0, -s * 0.3, s, s * 0.3);
    g.addColorStop(0, "#155C35");
    g.addColorStop(1, "#2E9E5E");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(s * 0.2, -s * 0.3, s * 0.38, -s * 0.12);
    ctx.quadraticCurveTo(s * 0.55, -s * 0.32, s * 0.7, -s * 0.12);
    ctx.quadraticCurveTo(s * 0.86, -s * 0.28, s, 0);
    ctx.quadraticCurveTo(s * 0.86, s * 0.28, s * 0.7, s * 0.12);
    ctx.quadraticCurveTo(s * 0.55, s * 0.32, s * 0.38, s * 0.12);
    ctx.quadraticCurveTo(s * 0.2, s * 0.3, 0, 0);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = s * 0.02;
    ctx.beginPath();
    ctx.moveTo(s * 0.05, 0);
    ctx.lineTo(s * 0.9, 0);
    ctx.stroke();
    ctx.restore();
  }
  berry(ctx, 0, 0, s * 0.09);
  berry(ctx, s * 0.12, -s * 0.1, s * 0.08);
  berry(ctx, s * 0.11, s * 0.11, s * 0.08);
  ctx.restore();
}

export function pineCone(ctx: Ctx, x: number, y: number, s: number, ang: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  for (let i = 0; i < 8; i++) {
    const yy = -s * 0.5 + i * s * 0.13,
      w = s * 0.34 * Math.sin(((i + 1) / 9) * Math.PI);
    const g = ctx.createLinearGradient(-w, 0, w, 0);
    g.addColorStop(0, "#5E3A1C");
    g.addColorStop(0.5, i % 2 ? "#9C6738" : "#8A5A30");
    g.addColorStop(1, "#4E2F16");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, yy, w, s * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Laço de fita vermelha com caudas. */
export function bow(ctx: Ctx, x: number, y: number, s: number, rot = 0, tails = 1.1, gold = false) {
  const fill = (y0: number, y1: number) => (gold ? goldGrad(ctx, -s, y0, s, y1) : redGrad(ctx, y0, y1));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.shadowColor = "rgba(60,0,10,0.35)";
  ctx.shadowBlur = s * 0.25;
  ctx.shadowOffsetY = s * 0.08;
  for (const k of [-1, 1]) {
    // caudas
    ctx.fillStyle = fill(0, s * tails * 1.2);
    ctx.beginPath();
    ctx.moveTo(k * s * 0.06, s * 0.04);
    ctx.bezierCurveTo(k * s * 0.2, s * 0.5, k * s * 0.35, s * 0.8, k * s * 0.55, s * tails);
    ctx.lineTo(k * s * 0.42, s * tails * 0.88);
    ctx.lineTo(k * s * 0.32, s * tails * 1.04);
    ctx.bezierCurveTo(k * s * 0.18, s * 0.7, k * s * 0.08, s * 0.4, -k * s * 0.04, s * 0.06);
    ctx.closePath();
    ctx.fill();
  }
  for (const k of [-1, 1]) {
    // alças
    ctx.fillStyle = fill(-s * 0.6, s * 0.3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(k * s * 0.35, -s * 0.62, k * s * 1.05, -s * 0.5, k * s * 0.98, -s * 0.08);
    ctx.bezierCurveTo(k * s * 0.92, s * 0.26, k * s * 0.42, s * 0.22, 0, 0);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = gold ? "rgba(110,70,0,0.3)" : "rgba(90,0,15,0.35)";
    ctx.beginPath();
    ctx.moveTo(k * s * 0.15, -s * 0.05);
    ctx.bezierCurveTo(k * s * 0.4, -s * 0.38, k * s * 0.8, -s * 0.33, k * s * 0.8, -s * 0.1);
    ctx.bezierCurveTo(k * s * 0.6, -s * 0.2, k * s * 0.35, -s * 0.15, k * s * 0.15, -s * 0.05);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.ellipse(k * s * 0.55, -s * 0.36, s * 0.22, s * 0.05, k * -0.35, 0, Math.PI * 2);
    ctx.fill();
  }
  const g = ctx.createRadialGradient(-s * 0.05, -s * 0.05, s * 0.02, 0, 0, s * 0.2);
  g.addColorStop(0, gold ? "#FFF0B5" : "#F23C55");
  g.addColorStop(1, gold ? "#9A6B12" : "#8A0619");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.18, s * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Bola de Natal pendurada. */
export function bauble(ctx: Ctx, x: number, y: number, r: number, color: string, string = 0) {
  if (string > 0) {
    ctx.strokeStyle = "rgba(200,160,60,0.9)";
    ctx.lineWidth = r * 0.06;
    ctx.beginPath();
    ctx.moveTo(x, y - r - string);
    ctx.lineTo(x, y - r);
    ctx.stroke();
  }
  ctx.fillStyle = goldGrad(ctx, x - r * 0.3, y - r * 1.2, x + r * 0.3, y - r);
  ctx.fillRect(x - r * 0.28, y - r * 1.18, r * 0.56, r * 0.26);
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.05, x, y, r);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.18, hexA(color, 1));
  g.addColorStop(1, shade(color, -0.45));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
export function shade(hex: string, k: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k)));
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

/** Fio de luzinhas coloridas acesas (phase anima o pisca-pisca no vídeo). */
export function lightString(ctx: Ctx, x0: number, x1: number, y: number, sag: number, u: number, phase = -1) {
  ctx.save();
  ctx.strokeStyle = "rgba(25,45,30,0.95)";
  ctx.lineWidth = 3 * u;
  ctx.beginPath();
  const n = 60;
  const P = (t: number) => [x0 + (x1 - x0) * t, y + Math.sin(t * Math.PI) * sag + Math.sin(t * Math.PI * 6) * sag * 0.08];
  for (let i = 0; i <= n; i++) {
    const [px, py] = P(i / n);
    if (i) ctx.lineTo(px, py);
    else ctx.moveTo(px, py);
  }
  ctx.stroke();
  const cols = ["#FF3B5C", "#FFD166", "#2DC653", "#4CC9F0", "#F72585"];
  const count = Math.max(6, Math.round((x1 - x0) / (48 * u)));
  for (let i = 0; i < count; i++) {
    const [px, py] = P((i + 0.5) / count);
    const on = phase < 0 ? 1 : 0.55 + 0.45 * Math.sin(phase * 5 + i * 1.7);
    ctx.shadowColor = cols[i % 5];
    ctx.shadowBlur = 16 * u * on;
    ctx.globalAlpha = 0.6 + 0.4 * on;
    ctx.fillStyle = cols[i % 5];
    ctx.beginPath();
    ctx.ellipse(px, py + 11 * u, 6.5 * u, 10 * u, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Placa/plaquinha creme com borda dourada (nome da família). */
export function plaque(ctx: Ctx, cx: number, cy: number, w: number, h: number, u: number, style: "scroll" | "rounded" = "rounded") {
  ctx.save();
  ctx.shadowColor = "rgba(40,20,0,0.35)";
  ctx.shadowBlur = 18 * u;
  ctx.shadowOffsetY = 6 * u;
  const g = ctx.createLinearGradient(0, cy - h / 2, 0, cy + h / 2);
  g.addColorStop(0, "#FFFBEF");
  g.addColorStop(1, "#F3E2BC");
  ctx.fillStyle = g;
  ctx.beginPath();
  if (style === "scroll") {
    const e = h * 0.35;
    ctx.moveTo(cx - w / 2 + e, cy - h / 2);
    ctx.lineTo(cx + w / 2 - e, cy - h / 2);
    ctx.quadraticCurveTo(cx + w / 2, cy - h / 2, cx + w / 2, cy - h / 2 + e * 0.6);
    ctx.quadraticCurveTo(cx + w / 2 - e * 0.5, cy, cx + w / 2, cy + h / 2 - e * 0.6);
    ctx.quadraticCurveTo(cx + w / 2, cy + h / 2, cx + w / 2 - e, cy + h / 2);
    ctx.lineTo(cx - w / 2 + e, cy + h / 2);
    ctx.quadraticCurveTo(cx - w / 2, cy + h / 2, cx - w / 2, cy + h / 2 - e * 0.6);
    ctx.quadraticCurveTo(cx - w / 2 + e * 0.5, cy, cx - w / 2, cy - h / 2 + e * 0.6);
    ctx.quadraticCurveTo(cx - w / 2, cy - h / 2, cx - w / 2 + e, cy - h / 2);
  } else ctx.roundRect(cx - w / 2, cy - h / 2, w, h, h * 0.5);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = goldGrad(ctx, cx - w / 2, cy, cx + w / 2, cy);
  ctx.lineWidth = 4 * u;
  ctx.beginPath();
  ctx.roundRect(cx - w / 2 + 7 * u, cy - h / 2 + 7 * u, w - 14 * u, h - 14 * u, (h - 14 * u) * (style === "scroll" ? 0.2 : 0.5));
  ctx.stroke();
  ctx.restore();
}

/** Faixa de fita vermelha (banner) com pontas dobradas. */
export function ribbonBanner(ctx: Ctx, cx: number, cy: number, w: number, h: number, u: number, curve = 0.08) {
  ctx.save();
  const tail = h * 0.9;
  ctx.fillStyle = "#7A0115";
  for (const k of [-1, 1]) {
    const x0 = cx + k * (w / 2 - h * 0.25);
    ctx.beginPath();
    ctx.moveTo(x0, cy - h * 0.2);
    ctx.lineTo(x0 + k * tail, cy - h * 0.2 + h * curve * 3);
    ctx.lineTo(x0 + k * tail * 0.7, cy + h * 0.3 + h * curve * 3);
    ctx.lineTo(x0 + k * tail, cy + h * 0.8 + h * curve * 3);
    ctx.lineTo(x0, cy + h * 0.65);
    ctx.closePath();
    ctx.fill();
  }
  ctx.shadowColor = "rgba(60,0,10,0.4)";
  ctx.shadowBlur = 16 * u;
  ctx.fillStyle = redGrad(ctx, cy - h / 2, cy + h / 2);
  const bend = h * curve * 4;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy - h / 2 + bend);
  ctx.quadraticCurveTo(cx, cy - h / 2 - bend, cx + w / 2, cy - h / 2 + bend);
  ctx.lineTo(cx + w / 2, cy + h / 2 + bend);
  ctx.quadraticCurveTo(cx, cy + h / 2 - bend, cx - w / 2, cy + h / 2 + bend);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = goldGrad(ctx, cx - w / 2, 0, cx + w / 2, 0);
  ctx.lineWidth = 3 * u;
  for (const off of [h * 0.12, -h * 0.12]) {
    ctx.beginPath();
    ctx.moveTo(cx - w / 2 + 8 * u, cy + off * 3 - (off > 0 ? h * 0.24 : -h * 0.24) + bend * 0.7);
    ctx.quadraticCurveTo(cx, cy + off * 3 - (off > 0 ? h * 0.24 : -h * 0.24) - bend * 1.3, cx + w / 2 - 8 * u, cy + off * 3 - (off > 0 ? h * 0.24 : -h * 0.24) + bend * 0.7);
    ctx.stroke();
  }
  ctx.restore();
}

/** Arabesco dourado de canto. */
export function cornerFlourish(ctx: Ctx, x: number, y: number, s: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = goldGrad(ctx, 0, 0, s, s);
  ctx.lineCap = "round";
  ctx.lineWidth = s * 0.045;
  ctx.beginPath();
  ctx.moveTo(0, s);
  ctx.bezierCurveTo(0, s * 0.35, s * 0.35, 0, s, 0);
  ctx.stroke();
  ctx.lineWidth = s * 0.03;
  ctx.beginPath();
  ctx.moveTo(s * 0.16, s * 0.9);
  ctx.bezierCurveTo(s * 0.2, s * 0.5, s * 0.5, s * 0.2, s * 0.9, s * 0.16);
  ctx.stroke();
  for (const [cx, cy, a] of [
    [s * 0.98, s * 0.12, 0],
    [s * 0.12, s * 0.98, 1],
  ] as const) {
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.09, a ? Math.PI * 0.2 : Math.PI * 0.7, a ? Math.PI * 1.8 : Math.PI * 2.3);
    ctx.stroke();
  }
  // folhinhas
  for (const t of [0.35, 0.6]) {
    const px = s * (0.06 + t * 0.6),
      py = s * (0.94 - t * 0.6);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = goldGrad(ctx, -s * 0.1, 0, s * 0.1, 0);
    ctx.beginPath();
    ctx.ellipse(s * 0.08, 0, s * 0.08, s * 0.03, 0.5, 0, Math.PI * 2);
    ctx.ellipse(-s * 0.08, 0, s * 0.08, s * 0.03, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#E9B949";
  ctx.beginPath();
  ctx.arc(s * 0.3, s * 0.3, s * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Papel com fibras (rústico, carta). */
export function paperTexture(ctx: Ctx, W: number, H: number, base: [string, string, string], fiber: string, seed = 17, n = 1400) {
  const g = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.1, W / 2, H / 2, Math.max(W, H) * 0.75);
  g.addColorStop(0, base[0]);
  g.addColorStop(0.65, base[1]);
  g.addColorStop(1, base[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const r = rng(seed);
  ctx.strokeStyle = fiber;
  ctx.lineWidth = Math.max(1, Math.min(W, H) / 1000);
  for (let i = 0; i < n; i++) {
    const x = r() * W,
      y = r() * H,
      l = (6 + r() * 24) * (Math.min(W, H) / 1000),
      a = r() * Math.PI;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
}

/** Papai Noel ilustrado (figura genérica, de domínio público), acenando. Cabeça em (x,y), escala s ≈ altura da cabeça. */
export function santa(ctx: Ctx, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  // corpo (casaco vermelho)
  ctx.fillStyle = redGrad(ctx, s * 0.4, s * 2.6);
  ctx.beginPath();
  ctx.moveTo(-s * 1.05, s * 2.7);
  ctx.bezierCurveTo(-s * 1.1, s * 1.2, -s * 0.75, s * 0.55, 0, s * 0.5);
  ctx.bezierCurveTo(s * 0.75, s * 0.55, s * 1.1, s * 1.2, s * 1.05, s * 2.7);
  ctx.closePath();
  ctx.fill();
  // braço acenando
  ctx.save();
  ctx.translate(s * 0.75, s * 0.85);
  ctx.rotate(-0.95);
  ctx.fillStyle = redGrad(ctx, 0, s);
  ctx.beginPath();
  ctx.roundRect(-s * 0.22, -s * 1.05, s * 0.44, s * 1.1, s * 0.22);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(-s * 0.27, -s * 1.12, s * 0.54, s * 0.2, s * 0.1);
  ctx.fill();
  ctx.fillStyle = "#F4F1EA";
  ctx.beginPath();
  ctx.ellipse(0, -s * 1.3, s * 0.22, s * 0.25, 0, 0, Math.PI * 2); // luva
  ctx.fill();
  ctx.restore();
  // faixa de pelúcia no casaco + cinto
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(-s * 0.12, s * 1.3, s * 0.24, s * 1.4);
  ctx.fillStyle = "#1A1A1A";
  ctx.fillRect(-s * 1.08, s * 1.85, s * 2.16, s * 0.24);
  ctx.strokeStyle = goldGrad(ctx, -s * 0.2, 0, s * 0.2, 0);
  ctx.lineWidth = s * 0.06;
  ctx.strokeRect(-s * 0.2, s * 1.82, s * 0.4, s * 0.3);
  // rosto
  const skin = ctx.createRadialGradient(-s * 0.15, -s * 0.1, s * 0.1, 0, 0, s * 0.6);
  skin.addColorStop(0, "#FFDCC4");
  skin.addColorStop(1, "#EFAE8E");
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.45, s * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // barba
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(-s * 0.55, -s * 0.05);
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const bx = -s * 0.55 + t * s * 1.1;
    const by = s * 0.35 + Math.sin(t * Math.PI) * s * 0.75 + (i % 2 ? s * 0.08 : 0);
    ctx.quadraticCurveTo(bx - s * 0.05, by + s * 0.08, bx, by);
  }
  ctx.lineTo(s * 0.55, -s * 0.05);
  ctx.quadraticCurveTo(s * 0.3, s * 0.25, 0, s * 0.18);
  ctx.quadraticCurveTo(-s * 0.3, s * 0.25, -s * 0.55, -s * 0.05);
  ctx.fill();
  ctx.strokeStyle = "rgba(170,180,200,0.7)";
  ctx.lineWidth = s * 0.02;
  ctx.stroke();
  // bigode
  for (const k of [-1, 1]) {
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.ellipse(k * s * 0.17, s * 0.14, s * 0.2, s * 0.1, k * -0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  // nariz, bochechas, olhos
  ctx.fillStyle = "#F08B7A";
  ctx.beginPath();
  ctx.arc(0, s * 0.03, s * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(240,110,110,0.35)";
  for (const k of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(k * s * 0.24, s * 0.02, s * 0.09, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "#3A2418";
  ctx.lineWidth = s * 0.045;
  ctx.lineCap = "round";
  for (const k of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(k * s * 0.16, -s * 0.12, s * 0.07, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }
  // sobrancelhas
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = s * 0.07;
  for (const k of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(k * s * 0.07, -s * 0.24);
    ctx.quadraticCurveTo(k * s * 0.17, -s * 0.31, k * s * 0.28, -s * 0.24);
    ctx.stroke();
  }
  // gorro
  ctx.fillStyle = redGrad(ctx, -s * 1.1, -s * 0.3);
  ctx.beginPath();
  ctx.moveTo(-s * 0.5, -s * 0.32);
  ctx.bezierCurveTo(-s * 0.45, -s * 0.95, s * 0.25, -s * 1.15, s * 0.85, -s * 0.75);
  ctx.bezierCurveTo(s * 0.55, -s * 0.7, s * 0.5, -s * 0.5, s * 0.5, -s * 0.32);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(-s * 0.58, -s * 0.44, s * 1.16, s * 0.24, s * 0.12);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(s * 0.88, -s * 0.72, s * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Lanterna antiga acesa. */
export function lantern(ctx: Ctx, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  const glow = ctx.createRadialGradient(0, s * 0.55, s * 0.05, 0, s * 0.55, s * 1.4);
  glow.addColorStop(0, "rgba(255,200,90,0.75)");
  glow.addColorStop(0.4, "rgba(255,170,60,0.25)");
  glow.addColorStop(1, "rgba(255,170,60,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, s * 0.55, s * 1.4, 0, Math.PI * 2);
  ctx.fill();
  const metal = ctx.createLinearGradient(-s * 0.4, 0, s * 0.4, 0);
  metal.addColorStop(0, "#2B2118");
  metal.addColorStop(0.5, "#6B5236");
  metal.addColorStop(1, "#2B2118");
  // argola
  ctx.strokeStyle = "#3A2B1C";
  ctx.lineWidth = s * 0.05;
  ctx.beginPath();
  ctx.arc(0, -s * 0.12, s * 0.12, Math.PI, 0);
  ctx.stroke();
  // teto
  ctx.fillStyle = metal;
  ctx.beginPath();
  ctx.moveTo(-s * 0.4, s * 0.12);
  ctx.lineTo(0, -s * 0.12);
  ctx.lineTo(s * 0.4, s * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-s * 0.42, s * 0.1, s * 0.84, s * 0.08);
  // vidro com chama
  const fl = ctx.createRadialGradient(0, s * 0.6, s * 0.02, 0, s * 0.6, s * 0.42);
  fl.addColorStop(0, "#FFFBE0");
  fl.addColorStop(0.25, "#FFD36B");
  fl.addColorStop(1, "#C76A1B");
  ctx.fillStyle = fl;
  ctx.fillRect(-s * 0.32, s * 0.18, s * 0.64, s * 0.82);
  ctx.fillStyle = "#FFF6D0";
  ctx.beginPath();
  ctx.ellipse(0, s * 0.62, s * 0.06, s * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  // grade
  ctx.strokeStyle = "#3A2B1C";
  ctx.lineWidth = s * 0.05;
  ctx.strokeRect(-s * 0.32, s * 0.18, s * 0.64, s * 0.82);
  ctx.beginPath();
  ctx.moveTo(0, s * 0.18);
  ctx.lineTo(0, s * 1.0);
  ctx.stroke();
  ctx.fillStyle = metal;
  ctx.fillRect(-s * 0.42, s * 1.0, s * 0.84, s * 0.12);
  ctx.restore();
}

export function house(ctx: Ctx, x: number, base: number, w: number, h: number, wall: string, u: number, seed = 1) {
  const r = rng(seed);
  ctx.fillStyle = wall;
  ctx.fillRect(x, base - h, w, h);
  // telhado com neve
  ctx.fillStyle = shade(wall, -0.35);
  ctx.beginPath();
  ctx.moveTo(x - w * 0.08, base - h);
  ctx.lineTo(x + w / 2, base - h - w * 0.5);
  ctx.lineTo(x + w * 1.08, base - h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#F5F9FF";
  ctx.beginPath();
  ctx.moveTo(x - w * 0.1, base - h + 2 * u);
  ctx.lineTo(x + w / 2, base - h - w * 0.52);
  ctx.lineTo(x + w * 1.1, base - h + 2 * u);
  ctx.quadraticCurveTo(x + w * 0.9, base - h - w * 0.12, x + w * 0.75, base - h - w * 0.06);
  ctx.quadraticCurveTo(x + w / 2, base - h - w * 0.22, x + w * 0.3, base - h - w * 0.05);
  ctx.quadraticCurveTo(x + w * 0.12, base - h - w * 0.1, x - w * 0.1, base - h + 2 * u);
  ctx.fill();
  // janelas acesas
  const cols = 2;
  for (let i = 0; i < cols; i++) {
    const wx = x + w * (0.18 + i * 0.42),
      wy = base - h * 0.72,
      ww = w * 0.22,
      wh = h * 0.24;
    ctx.save();
    ctx.shadowColor = "rgba(255,200,90,0.9)";
    ctx.shadowBlur = 14 * u;
    ctx.fillStyle = r() < 0.85 ? "#FFD27A" : "#F7A84A";
    ctx.fillRect(wx, wy, ww, wh);
    ctx.restore();
    ctx.strokeStyle = shade(wall, -0.5);
    ctx.lineWidth = 2 * u;
    ctx.beginPath();
    ctx.moveTo(wx + ww / 2, wy);
    ctx.lineTo(wx + ww / 2, wy + wh);
    ctx.moveTo(wx, wy + wh / 2);
    ctx.lineTo(wx + ww, wy + wh / 2);
    ctx.stroke();
  }
  // porta com guirlanda
  ctx.fillStyle = shade(wall, -0.55);
  ctx.fillRect(x + w * 0.4, base - h * 0.34, w * 0.2, h * 0.34);
  ctx.strokeStyle = "#2E8B57";
  ctx.lineWidth = 3 * u;
  ctx.beginPath();
  ctx.arc(x + w * 0.5, base - h * 0.24, w * 0.055, 0, Math.PI * 2);
  ctx.stroke();
}

export function pineTree(ctx: Ctx, x: number, base: number, h: number, u: number, snow = true, lights = false, seed = 3) {
  const r = rng(seed);
  ctx.fillStyle = "#4A2E16";
  ctx.fillRect(x - h * 0.04, base - h * 0.12, h * 0.08, h * 0.12);
  for (let k = 0; k < 4; k++) {
    const top = base - h + k * h * 0.2,
      w = h * (0.18 + k * 0.1);
    const g = ctx.createLinearGradient(x - w, 0, x + w, 0);
    g.addColorStop(0, "#0E4A2C");
    g.addColorStop(0.5, "#1F7A47");
    g.addColorStop(1, "#0B3A22");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x - w, top + h * 0.32);
    ctx.lineTo(x + w, top + h * 0.32);
    ctx.closePath();
    ctx.fill();
    if (snow) {
      ctx.fillStyle = "rgba(245,250,255,0.9)";
      ctx.beginPath();
      ctx.moveTo(x - w * 0.95, top + h * 0.31);
      ctx.quadraticCurveTo(x - w * 0.5, top + h * 0.24, x, top + h * 0.3);
      ctx.quadraticCurveTo(x + w * 0.5, top + h * 0.24, x + w * 0.95, top + h * 0.31);
      ctx.lineTo(x + w * 0.9, top + h * 0.33);
      ctx.lineTo(x - w * 0.9, top + h * 0.33);
      ctx.fill();
    }
  }
  if (lights) {
    const cols = ["#FFD166", "#FF5A6E", "#4CC9F0", "#FFFFFF"];
    for (let i = 0; i < 18; i++) {
      const t = r();
      const yy = base - h * 0.9 + t * h * 0.78;
      const half = (yy - (base - h)) * 0.42;
      const xx = x + (r() * 2 - 1) * half;
      ctx.save();
      ctx.shadowColor = cols[i % 4];
      ctx.shadowBlur = 10 * u;
      ctx.fillStyle = cols[i % 4];
      ctx.beginPath();
      ctx.arc(xx, yy, 3.2 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    star5(ctx, x, base - h, h * 0.07, goldGrad(ctx, x - 10, base - h - 10, x + 10, base - h + 10));
  }
}

export function snowman(ctx: Ctx, x: number, base: number, s: number) {
  ctx.save();
  const body = (cx: number, cy: number, r: number) => {
    const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
    g.addColorStop(0, "#FFFFFF");
    g.addColorStop(1, "#C9D9EC");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  };
  body(x, base - s * 0.45, s * 0.45);
  body(x, base - s * 1.13, s * 0.33);
  body(x, base - s * 1.62, s * 0.24);
  // cachecol
  ctx.fillStyle = "#D90429";
  ctx.beginPath();
  ctx.roundRect(x - s * 0.27, base - s * 1.43, s * 0.54, s * 0.1, s * 0.05);
  ctx.fill();
  ctx.fillRect(x + s * 0.1, base - s * 1.4, s * 0.1, s * 0.3);
  // cartola
  ctx.fillStyle = "#1C1C24";
  ctx.fillRect(x - s * 0.24, base - s * 1.84, s * 0.48, s * 0.05);
  ctx.fillRect(x - s * 0.16, base - s * 2.12, s * 0.32, s * 0.3);
  ctx.fillStyle = "#D90429";
  ctx.fillRect(x - s * 0.16, base - s * 1.9, s * 0.32, s * 0.05);
  // rosto
  ctx.fillStyle = "#1C1C24";
  for (const k of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(x + k * s * 0.08, base - s * 1.67, s * 0.03, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#F48C2B";
  ctx.beginPath();
  ctx.moveTo(x, base - s * 1.6);
  ctx.lineTo(x + s * 0.2, base - s * 1.57);
  ctx.lineTo(x, base - s * 1.55);
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = "#1C1C24";
    ctx.beginPath();
    ctx.arc(x, base - s * (1.2 - i * 0.12), s * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }
  // braços
  ctx.strokeStyle = "#5B3A1E";
  ctx.lineWidth = s * 0.03;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, base - s * 1.15);
  ctx.lineTo(x - s * 0.62, base - s * 1.35);
  ctx.moveTo(x + s * 0.3, base - s * 1.15);
  ctx.lineTo(x + s * 0.62, base - s * 1.4);
  ctx.stroke();
  ctx.restore();
}

export function giftBox(ctx: Ctx, x: number, base: number, w: number, h: number, color: string, ribbon: string, u: number) {
  ctx.save();
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, shade(color, -0.25));
  g.addColorStop(0.5, color);
  g.addColorStop(1, shade(color, -0.35));
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 14 * u;
  ctx.fillStyle = g;
  ctx.fillRect(x, base - h, w, h);
  ctx.shadowBlur = 0;
  ctx.fillStyle = shade(color, -0.15);
  ctx.fillRect(x - w * 0.05, base - h - h * 0.16, w * 1.1, h * 0.18);
  ctx.fillStyle = ribbon;
  ctx.fillRect(x + w * 0.44, base - h - h * 0.16, w * 0.12, h * 1.16);
  ctx.fillRect(x - w * 0.05, base - h * 0.55, w * 1.1, h * 0.1);
  // laço pequeno
  ctx.beginPath();
  ctx.ellipse(x + w * 0.38, base - h - h * 0.25, w * 0.15, h * 0.1, -0.5, 0, Math.PI * 2);
  ctx.ellipse(x + w * 0.62, base - h - h * 0.25, w * 0.15, h * 0.1, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Trenzinho de Natal (locomotiva + vagão). */
export function train(ctx: Ctx, x: number, base: number, s: number, u: number) {
  ctx.save();
  const red = redGrad(ctx, base - s, base);
  // vagão
  ctx.fillStyle = "#1F7A47";
  ctx.fillRect(x + s * 1.35, base - s * 0.62, s * 0.9, s * 0.48);
  giftBox(ctx, x + s * 1.45, base - s * 0.62, s * 0.32, s * 0.28, "#FFD166", "#D90429", u);
  giftBox(ctx, x + s * 1.82, base - s * 0.62, s * 0.3, s * 0.36, "#D90429", "#FFD166", u);
  // locomotiva
  ctx.fillStyle = red;
  ctx.fillRect(x, base - s * 0.62, s * 1.2, s * 0.48);
  ctx.fillRect(x + s * 0.72, base - s * 1.05, s * 0.48, s * 0.45);
  ctx.fillStyle = "#1C1C24";
  ctx.fillRect(x + s * 0.68, base - s * 1.12, s * 0.56, s * 0.09);
  ctx.fillRect(x + s * 0.15, base - s * 0.98, s * 0.2, s * 0.36);
  ctx.fillStyle = "#FFD27A";
  ctx.fillRect(x + s * 0.83, base - s * 0.96, s * 0.26, s * 0.22);
  ctx.fillStyle = goldGrad(ctx, x, 0, x + s, 0);
  ctx.fillRect(x, base - s * 0.2, s * 2.3, s * 0.06);
  // rodas
  for (const wx of [0.2, 0.55, 0.95, 1.55, 2.05]) {
    ctx.fillStyle = "#1C1C24";
    ctx.beginPath();
    ctx.arc(x + s * wx, base - s * 0.1, s * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#E9B949";
    ctx.beginPath();
    ctx.arc(x + s * wx, base - s * 0.1, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
  // fumaça
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x + s * (0.25 - i * 0.12), base - s * (1.15 + i * 0.2), s * (0.12 + i * 0.05), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Estábulo do presépio em silhueta, iluminado pela estrela. */
export function nativity(ctx: Ctx, x: number, base: number, s: number) {
  ctx.save();
  const glow = ctx.createRadialGradient(x, base - s * 0.45, s * 0.05, x, base - s * 0.45, s * 0.9);
  glow.addColorStop(0, "rgba(255,214,120,0.95)");
  glow.addColorStop(0.5, "rgba(255,180,80,0.35)");
  glow.addColorStop(1, "rgba(255,180,80,0)");
  // estábulo
  ctx.fillStyle = "#1A1208";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.8, base);
  ctx.lineTo(x - s * 0.8, base - s * 0.6);
  ctx.lineTo(x, base - s * 1.05);
  ctx.lineTo(x + s * 0.8, base - s * 0.6);
  ctx.lineTo(x + s * 0.8, base);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = glow;
  ctx.fillRect(x - s * 0.62, base - s * 0.85, s * 1.24, s * 0.85);
  ctx.fillStyle = "#FFE7A6";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.6, base);
  ctx.lineTo(x - s * 0.6, base - s * 0.55);
  ctx.lineTo(x, base - s * 0.85);
  ctx.lineTo(x + s * 0.6, base - s * 0.55);
  ctx.lineTo(x + s * 0.6, base);
  ctx.closePath();
  ctx.globalAlpha = 0.55;
  ctx.fill();
  ctx.globalAlpha = 1;
  // figuras em silhueta (Maria, José, manjedoura)
  ctx.fillStyle = "#1A1208";
  ctx.beginPath();
  ctx.ellipse(x - s * 0.3, base - s * 0.22, s * 0.13, s * 0.24, 0, 0, Math.PI * 2);
  ctx.arc(x - s * 0.3, base - s * 0.5, s * 0.08, 0, Math.PI * 2);
  ctx.ellipse(x + s * 0.32, base - s * 0.26, s * 0.13, s * 0.28, 0, 0, Math.PI * 2);
  ctx.arc(x + s * 0.32, base - s * 0.58, s * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - s * 0.14, base - s * 0.14, s * 0.28, s * 0.14);
  ctx.fillStyle = "#FFF4C9";
  ctx.beginPath();
  ctx.ellipse(x, base - s * 0.16, s * 0.1, s * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
