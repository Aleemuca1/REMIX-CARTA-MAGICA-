/**
 * Pequena "caixa de lápis" para desenhar as páginas de colorir em SVG (400x400).
 * Tudo é traço (sem preenchimento), menos olhos e brilhos.
 */
const f = (n: number) => n.toFixed(1);
const INK = "#1E2340";

/** Elipse "fofinha": contorno feito de bolinhas (barba, pelo, nuvem, neve). */
export function fluffy(cx: number, cy: number, rx: number, ry: number, n: number, bulge = 0.18, a0 = 0, a1 = Math.PI * 2, close = true) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) {
    const am = a0 + ((a1 - a0) * (i - 0.5)) / n;
    const k = 1 + bulge;
    d += ` Q${f(cx + Math.cos(am) * rx * k)} ${f(cy + Math.sin(am) * ry * k)} ${f(pts[i][0])} ${f(pts[i][1])}`;
  }
  return `<path d="${d}${close ? " Z" : ""}"/>`;
}

/** Faixa de pelo branco (borda do gorro, punho): retângulo com bordas onduladas. */
export function furBand(x: number, y: number, w: number, h: number, n?: number) {
  const k = n ?? Math.max(3, Math.round(w / 22));
  const step = w / k;
  let d = `M${f(x)} ${f(y + h / 2)}`;
  for (let i = 0; i < k; i++) d += ` Q${f(x + step * (i + 0.5))} ${f(y - h * 0.35)} ${f(x + step * (i + 1))} ${f(y + (i === k - 1 ? h / 2 : 0))}`;
  for (let i = k; i > 0; i--) d += ` Q${f(x + step * (i - 0.5))} ${f(y + h * 1.35)} ${f(x + step * (i - 1))} ${f(y + (i === 1 ? h / 2 : h))}`;
  return `<path d="${d} Z"/>`;
}

export const star = (cx: number, cy: number, R: number, r = R * 0.45, rot = 0) =>
  `<polygon points="${Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + rot + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;
    return `${f(cx + Math.cos(a) * rad)},${f(cy + Math.sin(a) * rad)}`;
  }).join(" ")}" stroke-linejoin="round"/>`;

/** Estrelinha de brilho (4 pontas). */
export const sparkle = (x: number, y: number, s: number) =>
  `<path d="M${f(x)} ${f(y - s)} Q${f(x + s * 0.15)} ${f(y - s * 0.15)} ${f(x + s)} ${f(y)} Q${f(x + s * 0.15)} ${f(y + s * 0.15)} ${f(x)} ${f(y + s)} Q${f(x - s * 0.15)} ${f(y + s * 0.15)} ${f(x - s)} ${f(y)} Q${f(x - s * 0.15)} ${f(y - s * 0.15)} ${f(x)} ${f(y - s)} Z" stroke-width="3.5"/>`;

/** Floco de neve com 6 braços. */
export function snowflake(x: number, y: number, r: number) {
  let d = "";
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const ex = x + Math.cos(a) * r,
      ey = y + Math.sin(a) * r;
    d += `M${f(x)} ${f(y)} L${f(ex)} ${f(ey)} `;
    const mx = x + Math.cos(a) * r * 0.6,
      my = y + Math.sin(a) * r * 0.6;
    for (const s of [-1, 1]) {
      const b = a + s * 0.7;
      d += `M${f(mx)} ${f(my)} L${f(mx + Math.cos(b) * r * 0.32)} ${f(my + Math.sin(b) * r * 0.32)} `;
    }
  }
  return `<path d="${d}" stroke-width="3"/>`;
}

/** Olho fofo: oval escuro com brilho. */
export const eye = (x: number, y: number, s = 7) =>
  `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(s * 0.8)}" ry="${f(s)}" fill="${INK}"/><circle cx="${f(x + s * 0.25)}" cy="${f(y - s * 0.35)}" r="${f(s * 0.3)}" fill="#FFFFFF" stroke="none"/>`;
/** Olho fechado sorrindo. */
export const happyEye = (x: number, y: number, s = 8) => `<path d="M${f(x - s)} ${f(y)} Q${f(x)} ${f(y - s * 1.1)} ${f(x + s)} ${f(y)}"/>`;
export const smile = (x: number, y: number, w = 12, h = 8) => `<path d="M${f(x - w)} ${f(y)} Q${f(x)} ${f(y + h * 1.6)} ${f(x + w)} ${f(y)}"/>`;
/** Boquinha aberta sorrindo (dá para pintar). */
export const openSmile = (x: number, y: number, w = 11) =>
  `<path d="M${f(x - w)} ${f(y)} Q${f(x)} ${f(y + w * 1.5)} ${f(x + w)} ${f(y)} Z"/>`;
export const cheek = (x: number, y: number, r = 8) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r)}" ry="${f(r * 0.7)}" stroke-width="3"/>`;

export const heart = (x: number, y: number, s: number) =>
  `<path d="M${f(x)} ${f(y + s * 0.9)} C${f(x - s * 1.4)} ${f(y)} ${f(x - s * 0.9)} ${f(y - s)} ${f(x)} ${f(y - s * 0.35)} C${f(x + s * 0.9)} ${f(y - s)} ${f(x + s * 1.4)} ${f(y)} ${f(x)} ${f(y + s * 0.9)} Z"/>`;

/** Folha de azevinho (pontuda) + frutinhas. */
export function holly(x: number, y: number, s = 1, rot = 0) {
  const leaf = (r: number) =>
    `<path transform="translate(${f(x)} ${f(y)}) rotate(${r + rot}) scale(${s})" d="M0 0 Q6 -5 6 -12 Q11 -11 15 -16 Q17 -11 23 -11 Q22 -5 28 -2 Q22 1 22 6 Q16 5 13 10 Q9 5 3 6 Q4 2 0 0 Z"/>`;
  return (
    leaf(-160) +
    leaf(-20) +
    `<circle cx="${f(x - 4 * s)}" cy="${f(y + 3 * s)}" r="${f(5 * s)}"/><circle cx="${f(x + 5 * s)}" cy="${f(y + 4 * s)}" r="${f(5 * s)}"/><circle cx="${f(x)}" cy="${f(y - 4 * s)}" r="${f(5 * s)}"/>`
  );
}

/** Presente com tampa, fita e laço. */
export function gift(x: number, y: number, w: number, h: number, pattern: "dots" | "stripes" | "stars" | "none" = "none") {
  const lid = h * 0.24;
  let p = "";
  if (pattern === "dots")
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) p += `<circle cx="${f(x + w * (0.2 + i * 0.6))}" cy="${f(y + lid + (h - lid) * (0.3 + j * 0.42))}" r="${f(Math.min(w, h) * 0.06)}"/>`;
  if (pattern === "stripes")
    for (let i = 1; i < 4; i++) p += `<path d="M${f(x + 4)} ${f(y + lid + ((h - lid) * i) / 4 + 6)} L${f(x + w * 0.4)} ${f(y + lid + ((h - lid) * i) / 4 - 6)} M${f(x + w * 0.6)} ${f(y + lid + ((h - lid) * i) / 4 + 6)} L${f(x + w - 4)} ${f(y + lid + ((h - lid) * i) / 4 - 6)}" stroke-width="3"/>`;
  if (pattern === "stars") p += star(x + w * 0.22, y + lid + (h - lid) * 0.5, Math.min(w, h) * 0.1) + star(x + w * 0.78, y + lid + (h - lid) * 0.5, Math.min(w, h) * 0.1);
  const cx = x + w / 2;
  return (
    `<g fill="#FFFFFF"><rect x="${f(x)}" y="${f(y + lid)}" width="${f(w)}" height="${f(h - lid)}" rx="4"/>` +
    `<rect x="${f(x - 5)}" y="${f(y)}" width="${f(w + 10)}" height="${f(lid)}" rx="4"/></g>` +
    p +
    `<g fill="#FFFFFF"><rect x="${f(cx - w * 0.09)}" y="${f(y)}" width="${f(w * 0.18)}" height="${f(h)}"/>` +
    `<path d="M${f(cx)} ${f(y)} C${f(cx - w * 0.5)} ${f(y - h * 0.5)} ${f(cx - w * 0.55)} ${f(y + h * 0.02)} ${f(cx)} ${f(y)} Z"/>` +
    `<path d="M${f(cx)} ${f(y)} C${f(cx + w * 0.5)} ${f(y - h * 0.5)} ${f(cx + w * 0.55)} ${f(y + h * 0.02)} ${f(cx)} ${f(y)} Z"/>` +
    `<circle cx="${f(cx)}" cy="${f(y)}" r="${f(w * 0.07)}"/></g>`
  );
}

/** Chão de neve ondulado. */
export const snowGround = (y: number, wav = 18) =>
  `<path d="M-10 ${f(y)} Q60 ${f(y - wav)} 130 ${f(y - 4)} Q210 ${f(y + wav * 0.7)} 280 ${f(y - 6)} Q340 ${f(y - wav)} 410 ${f(y - 2)}"/>`;

/** Pinheirinho fofo pequeno (para fundo). */
export function pine(x: number, y: number, s = 1) {
  const tier = (ty: number, w: number, h: number) =>
    `<path d="M${f(x)} ${f(ty - h)} Q${f(x - w * 0.4)} ${f(ty - h * 0.35)} ${f(x - w)} ${f(ty)} Q${f(x - w * 0.5)} ${f(ty + 7 * s)} ${f(x)} ${f(ty + 2 * s)} Q${f(x + w * 0.5)} ${f(ty + 7 * s)} ${f(x + w)} ${f(ty)} Q${f(x + w * 0.4)} ${f(ty - h * 0.35)} ${f(x)} ${f(ty - h)} Z"/>`;
  return (
    `<g fill="#FFFFFF"><rect x="${f(x - 6 * s)}" y="${f(y - 4 * s)}" width="${f(12 * s)}" height="${f(16 * s)}" rx="2"/>` +
    tier(y - 2 * s, 34 * s, 34 * s) +
    tier(y - 26 * s, 26 * s, 30 * s) +
    tier(y - 48 * s, 18 * s, 26 * s) +
    `</g>`
  );
}
