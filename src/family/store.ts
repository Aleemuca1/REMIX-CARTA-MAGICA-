/**
 * Família no Trenó: fotos (rostinhos) da família guardadas SÓ neste aparelho.
 * Nada é enviado para o servidor.
 */
export type FamilyMember = { id: string; name: string; img: string /* JPEG em data URL, 256x256 */ };
export type FamilyState = { title: string; members: FamilyMember[]; inGame: boolean };

/** Lugares no trenó (frações da imagem 1056x576): banco da frente, saco de presentes e garupa da rena. */
export const SEATS = [
  { x: 0.465, y: 0.44 },
  { x: 0.585, y: 0.47 },
  { x: 0.235, y: 0.4 },
  { x: 0.14, y: 0.47 },
  { x: 0.3, y: 0.26 },
  { x: 0.82, y: 0.37 },
];

const KEY = "carta-magica-familia";
export const FREE_MEMBERS = 3;
export const MAX_MEMBERS = 6;
export const FAMILY_EVENT = "carta-magica-familia";

export function loadFamily(): FamilyState {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (v && Array.isArray(v.members)) return { title: v.title || "", members: v.members, inGame: v.inGame !== false };
  } catch {
    /* sem armazenamento */
  }
  return { title: "", members: [], inGame: true };
}

export function saveFamily(f: FamilyState): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(f));
    window.dispatchEvent(new Event(FAMILY_EVENT));
    return true;
  } catch {
    return false; // armazenamento cheio: as fotos ficam só até fechar a página
  }
}

export function clearFamily() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nada */
  }
  window.dispatchEvent(new Event(FAMILY_EVENT));
}

/** Carrega os rostinhos como imagens prontas para desenhar no canvas. */
export function loadFaceImages(members: FamilyMember[]): Promise<HTMLImageElement[]> {
  return Promise.all(
    members.map(
      (m) =>
        new Promise<HTMLImageElement>((res) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = () => res(img);
          img.src = m.img;
        }),
    ),
  ).then((list) => list.filter((i) => i.naturalWidth > 0));
}

/** Desenha um rostinho redondo com gorro de Papai Noel e (opcional) o nome embaixo. */
export function drawFace(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, r: number, name?: string, hat = true) {
  ctx.save();
  // borda dourada
  ctx.fillStyle = "#FFD166";
  ctx.beginPath();
  ctx.arc(x, y, r + Math.max(2, r * 0.1), 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
  ctx.restore();
  if (hat) {
    ctx.save();
    ctx.translate(x, y - r * 0.78);
    ctx.rotate(-0.18);
    ctx.fillStyle = "#E63946";
    ctx.beginPath();
    ctx.moveTo(-r * 0.78, 0);
    ctx.quadraticCurveTo(-r * 0.1, -r * 1.25, r * 0.95, -r * 0.9);
    ctx.lineTo(r * 0.78, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(-r * 0.86, -r * 0.14, r * 1.72, r * 0.32, r * 0.16);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.98, -r * 0.92, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  if (name) {
    const fs = Math.max(10, r * 0.42);
    ctx.font = `bold ${fs}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    const w = ctx.measureText(name).width + fs * 0.9;
    ctx.fillStyle = "rgba(11,19,43,0.82)";
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y + r * 0.92, w, fs * 1.45, fs * 0.72);
    ctx.fill();
    ctx.fillStyle = "#FFF6D8";
    ctx.fillText(name, x, y + r * 0.92 + fs * 1.08);
  }
}
