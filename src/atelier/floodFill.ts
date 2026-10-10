/**
 * Balde de tinta.
 * - Modo colorir: a região é limitada pelos traços do desenho (camada de linhas),
 *   então a tinta nunca "vaza" e pode ser trocada quantas vezes quiser.
 * - Modo livre: a região é a área de cor parecida com o ponto clicado.
 */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function floodFill(opts: {
  paint: ImageData; // será modificada
  lines?: ImageData; // traços (alpha = barreira)
  composite?: ImageData; // imagem visível (modo livre)
  x: number;
  y: number;
  color: string;
}) {
  const { paint, lines, composite, color } = opts;
  const W = paint.width, H = paint.height;
  const x0 = Math.floor(opts.x), y0 = Math.floor(opts.y);
  if (x0 < 0 || y0 < 0 || x0 >= W || y0 >= H) return false;
  const [r, g, b] = hexToRgb(color);

  let barrier: (i: number) => boolean;
  if (lines) {
    const la = lines.data;
    barrier = (i) => la[i * 4 + 3] > 110;
  } else {
    const c = composite!.data;
    const s = (y0 * W + x0) * 4;
    const sr = c[s], sg = c[s + 1], sb = c[s + 2];
    barrier = (i) => {
      const k = i * 4;
      return Math.abs(c[k] - sr) + Math.abs(c[k + 1] - sg) + Math.abs(c[k + 2] - sb) > 60;
    };
  }
  if (barrier(y0 * W + x0)) return false;

  const region = new Uint8Array(W * H);
  const stack: number[] = [x0, y0];
  while (stack.length) {
    const y = stack.pop()!, x = stack.pop()!;
    let xl = x;
    while (xl >= 0 && !region[y * W + xl] && !barrier(y * W + xl)) xl--;
    xl++;
    let upOpen = false, downOpen = false;
    for (let xx = xl; xx < W; xx++) {
      const i = y * W + xx;
      if (region[i] || barrier(i)) break;
      region[i] = 1;
      if (y > 0) {
        const u = i - W;
        const ok = !region[u] && !barrier(u);
        if (ok && !upOpen) stack.push(xx, y - 1);
        upOpen = ok;
      }
      if (y < H - 1) {
        const d = i + W;
        const ok = !region[d] && !barrier(d);
        if (ok && !downOpen) stack.push(xx, y + 1);
        downOpen = ok;
      }
    }
  }

  // expande 2px por baixo dos traços (evita bordinha branca no anti-aliasing)
  if (lines) {
    for (let pass = 0; pass < 2; pass++) {
      const add: number[] = [];
      for (let y = 1; y < H - 1; y++)
        for (let x = 1; x < W - 1; x++) {
          const i = y * W + x;
          if (region[i] || !barrier(i)) continue;
          if (region[i - 1] || region[i + 1] || region[i - W] || region[i + W]) add.push(i);
        }
      for (const i of add) region[i] = 1;
    }
  }

  const d = paint.data;
  for (let i = 0; i < region.length; i++) {
    if (!region[i]) continue;
    const k = i * 4;
    d[k] = r;
    d[k + 1] = g;
    d[k + 2] = b;
    d[k + 3] = 255;
  }
  return true;
}
