/** Correio do Polo Norte: a criança escreve, os pais mandam a foto e o Papai Noel responde. */
import type { Letter } from "../types";

const KEYS = "carta-magica-correio-chaves"; // token -> chave de prévia (quem enviou vê antes da entrega)

export function savePreviewKey(token: string, key: string) {
  try {
    const m = JSON.parse(localStorage.getItem(KEYS) || "{}");
    m[token] = key;
    localStorage.setItem(KEYS, JSON.stringify(m));
  } catch {
    /* sem armazenamento */
  }
}
export function previewKeyOf(token: string): string | undefined {
  try {
    return JSON.parse(localStorage.getItem(KEYS) || "{}")[token];
  } catch {
    return undefined;
  }
}

/** Busca uma carta pelo token (com a chave de prévia, se este aparelho enviou a cartinha). */
export async function fetchLetter(token: string): Promise<{ letter?: Letter; locked?: { deliverAt?: string; childName: string; protocol?: number; message: string } }> {
  const k = previewKeyOf(token);
  const r = await fetch(`/api/letter/${encodeURIComponent(token)}${k ? `?k=${encodeURIComponent(k)}` : ""}`, { credentials: "same-origin" });
  const d = await r.json().catch(() => ({}));
  if (r.status === 423) return { locked: { deliverAt: d.deliverAt, childName: d.childName, protocol: d.protocol, message: d.error } };
  if (!r.ok) throw new Error(d.error || "Carta não encontrada.");
  return { letter: d };
}

/** Reduz a foto no próprio celular antes de enviar (mais rápido e a foto nunca sai em tamanho cheio). */
export async function shrinkImage(file: File, max = 1600): Promise<{ base64: string; mime: string }> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL("image/jpeg", 0.86);
    return { base64: dataUrl.split(",")[1], mime: "image/jpeg" };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export type CorreioResult = {
  token: string;
  previewKey: string;
  protocol?: number;
  childText: string;
  wishes: { pedidos: string[]; perguntas: string[]; contou: string[] };
  sensitive: boolean;
  letter: Letter;
};

export async function sendChildLetter(body: Record<string, unknown>): Promise<CorreioResult> {
  const r = await fetch("/api/correio", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(d.error || "O Correio do Polo Norte não respondeu."), { limit: d.limit });
  savePreviewKey(d.token, d.previewKey);
  return d;
}

export type When = "agora" | "3dias" | "vespera" | "natal";
export const WHEN_OPTIONS: { id: When; emoji: string; title: string; text: string }[] = [
  { id: "agora", emoji: "⚡", title: "Agora mesmo", text: "A resposta aparece na hora." },
  { id: "3dias", emoji: "🛷", title: "Daqui a 3 dias", text: "Como se viesse voando do Polo Norte." },
  { id: "vespera", emoji: "🌙", title: "Véspera de Natal", text: "Dia 24, às 19h. O momento mais mágico." },
  { id: "natal", emoji: "🎁", title: "Manhã de Natal", text: "Dia 25, às 7h, junto com os presentes." },
];

export async function approveLetter(token: string, when: When): Promise<{ deliverAt: string | null }> {
  const r = await fetch("/api/correio/aprovar", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, previewKey: previewKeyOf(token), when }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(d.error || "Não foi possível agendar."), { review: d.review });
  return d;
}

export const fmtDelivery = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (d.getFullYear() > 2090) return "depois da aprovação dos pais";
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" });
};
