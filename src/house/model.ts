/** "Nossa Casinha de Natal": a família monta a casa com enfeites e bonequinhos de cada pessoa. */

export const VIEW_W = 900;
export const VIEW_H = 640;
export const GROUND_Y = 560;
/** paredes da casa (corte, como casinha de bonecas) */
export const HOUSE = { x: 190, y: 250, w: 520, h: 310, floorY: 405 };

export type HouseModel = "chale" | "biscoito" | "iglu";
export const HOUSE_MODELS: { id: HouseModel; label: string; emoji: string; pro?: boolean }[] = [
  { id: "chale", label: "Chalé de madeira", emoji: "🏡" },
  { id: "biscoito", label: "Casa de biscoito", emoji: "🍪", pro: true },
  { id: "iglu", label: "Iglu de gelo", emoji: "🧊", pro: true },
];
export const ROOF_COLORS = ["#C1121F", "#2D6A4F", "#1D3557", "#7B2CBF", "#8D5524"];

export type ItemKind = "item" | "pessoa";
export type HouseItem = {
  id: string;
  kind: ItemKind;
  /** item: código do catálogo · pessoa: emoji do bonequinho */
  ref: string;
  x: number;
  y: number;
  s: number; // tamanho (0.6 a 1.8)
  name?: string; // pessoa: nome
  text?: string; // recadinho
  author?: string;
  at?: string;
};
export type HouseCfg = { model: HouseModel; roof: string; title: string };
export type HouseState = { cfg: HouseCfg; items: HouseItem[]; token?: string; editKey?: string };

export const MAX_ITEMS = 120;
export const FREE_ITEMS = 20;
export const MAX_TEXT = 100;
export const MAX_NAME = 18;

export type CatalogItem = { id: string; emoji: string; label: string; size: number; group: string; pro?: boolean };
export const CATALOG: CatalogItem[] = [
  // sala
  { id: "arvore", emoji: "🎄", label: "Árvore", size: 124, group: "Sala" },
  { id: "lareira", emoji: "🔥", label: "Lareira", size: 96, group: "Sala" },
  { id: "meia", emoji: "🧦", label: "Meia", size: 44, group: "Sala" },
  { id: "presente", emoji: "🎁", label: "Presente", size: 44, group: "Sala" },
  { id: "sofa", emoji: "🛋️", label: "Sofá", size: 110, group: "Sala" },
  { id: "urso", emoji: "🧸", label: "Ursinho", size: 50, group: "Sala" },
  { id: "vela", emoji: "🕯️", label: "Vela", size: 40, group: "Sala" },
  { id: "sino", emoji: "🔔", label: "Sino", size: 40, group: "Sala" },
  { id: "estrela", emoji: "⭐", label: "Estrela", size: 40, group: "Sala" },
  { id: "laco", emoji: "🎀", label: "Laço", size: 40, group: "Sala" },
  { id: "tapete", emoji: "🟥", label: "Tapete", size: 120, group: "Sala" },
  { id: "luminaria", emoji: "💡", label: "Luminária", size: 52, group: "Sala" },
  // ceia
  { id: "peru", emoji: "🍗", label: "Ceia", size: 64, group: "Ceia" },
  { id: "biscoitos", emoji: "🍪", label: "Biscoitos", size: 54, group: "Ceia" },
  { id: "leite", emoji: "🥛", label: "Leite p/ Noel", size: 42, group: "Ceia" },
  { id: "bolo", emoji: "🎂", label: "Bolo", size: 60, group: "Ceia" },
  { id: "chocolate", emoji: "☕", label: "Chocolate quente", size: 42, group: "Ceia" },
  { id: "panetone", emoji: "🍞", label: "Panetone", size: 48, group: "Ceia" },
  { id: "doce", emoji: "🍭", label: "Bengala doce", size: 44, group: "Ceia" },
  // quarto
  { id: "cama", emoji: "🛏️", label: "Cama", size: 120, group: "Quarto" },
  { id: "livro", emoji: "📖", label: "Historinha", size: 48, group: "Quarto" },
  { id: "carrinho", emoji: "🚗", label: "Carrinho", size: 56, group: "Quarto" },
  { id: "boneca", emoji: "🪆", label: "Boneca", size: 56, group: "Quarto" },
  { id: "bola", emoji: "⚽", label: "Bola", size: 40, group: "Quarto" },
  { id: "quadro", emoji: "🖼️", label: "Quadro", size: 56, group: "Quarto" },
  // quintal
  { id: "boneco", emoji: "⛄", label: "Boneco de neve", size: 84, group: "Quintal" },
  { id: "rena", emoji: "🦌", label: "Rena", size: 88, group: "Quintal" },
  { id: "treno", emoji: "🛷", label: "Trenó", size: 90, group: "Quintal" },
  { id: "pinheiro", emoji: "🌲", label: "Pinheiro", size: 110, group: "Quintal" },
  { id: "pomba", emoji: "🕊️", label: "Pombinha da paz", size: 46, group: "Quintal" },
  // especiais (Natal Completo)
  { id: "anjo", emoji: "👼", label: "Anjinho", size: 60, group: "Especiais", pro: true },
  { id: "trem", emoji: "🚂", label: "Trenzinho", size: 76, group: "Especiais", pro: true },
  { id: "carrossel", emoji: "🎠", label: "Carrossel", size: 84, group: "Especiais", pro: true },
  { id: "unicornio", emoji: "🦄", label: "Unicórnio", size: 72, group: "Especiais", pro: true },
  { id: "fogos", emoji: "🎆", label: "Fogos", size: 70, group: "Especiais", pro: true },
  { id: "presepio", emoji: "🌟", label: "Presépio", size: 80, group: "Especiais", pro: true },
];
export const ITEM_GROUPS = ["Sala", "Ceia", "Quarto", "Quintal", "Especiais"];
export const catalogItem = (id: string) => CATALOG.find((c) => c.id === id);

/** Bonequinhos da família: tipo, tom de pele (0-5) e cor da roupa (0-5) → "p:vova:2:1" */
export const PERSON_TYPES = [
  { id: "mamae", label: "Mamãe" },
  { id: "papai", label: "Papai" },
  { id: "menina", label: "Menina" },
  { id: "menino", label: "Menino" },
  { id: "bebe", label: "Bebê" },
  { id: "vova", label: "Vovó" },
  { id: "vovo", label: "Vovô" },
  { id: "tio", label: "Tio(a) com gorro" },
  { id: "cachorro", label: "Cachorro" },
  { id: "gato", label: "Gato" },
] as const;
export type PersonType = (typeof PERSON_TYPES)[number]["id"];
export const personRef = (type: PersonType, tone: number, outfit: number) => `p:${type}:${tone}:${outfit}`;
export function parsePerson(ref: string) {
  const m = /^p:([a-z]+):([0-5]):([0-5])$/.exec(ref);
  if (!m || !PERSON_TYPES.some((t) => t.id === m[1])) return null;
  return { type: m[1] as PersonType, tone: Number(m[2]), outfit: Number(m[3]) };
}
export const isPersonRef = (ref: string) => parsePerson(ref) !== null;
export const PERSON_SIZE = 84;

export const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const emptyHouse = (): HouseState => ({ cfg: { model: "chale", roof: ROOF_COLORS[0], title: "" }, items: [] });

export function sanitizeText(s: unknown, max: number) {
  return String(s ?? "")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** Onde dá para colocar: dentro da casa, no quintal (chão de neve) ou no telhado. */
export function canPlace(x: number, y: number) {
  if (x < 20 || x > VIEW_W - 20 || y > VIEW_H - 12) return false;
  const inHouse = x > HOUSE.x + 8 && x < HOUSE.x + HOUSE.w - 8 && y > HOUSE.y + 10 && y < HOUSE.y + HOUSE.h;
  const yard = y > GROUND_Y - 40;
  const roof = y > 110 && y < HOUSE.y && x > HOUSE.x - 30 && x < HOUSE.x + HOUSE.w + 30;
  return inHouse || yard || roof;
}

export const RECADOS = [
  "Feliz Natal, família! Amo vocês!",
  "Que a nossa casa seja sempre cheia de amor.",
  "Obrigado(a) por mais um ano juntinhos.",
  "Guardei um abraço bem apertado para você!",
  "Papai Noel, cuida da nossa família!",
  "Que 2027 tenha muitas viagens e risadas.",
];

/** Enfeites que ficam pendurados na parede (os outros "caem" no chão do cômodo, como numa casinha de bonecas) */
export const HANGING = new Set(["meia", "sino", "estrela", "laco", "quadro", "fogos", "pomba", "anjo"]);
/** Ajusta a altura: dentro da casa, o desenho pousa no piso do andar onde foi tocado. */
export function settle<T extends { kind: string; ref: string; x: number; y: number; s: number }>(it: T): T {
  const unit = ((it.kind === "pessoa" ? PERSON_SIZE : catalogItem(it.ref)?.size ?? 44) / 100) * it.s;
  const foot = 46 * unit;
  const inside = it.x > HOUSE.x && it.x < HOUSE.x + HOUSE.w && it.y > HOUSE.y && it.y < HOUSE.y + HOUSE.h + 10;
  if (inside && !(it.kind === "item" && HANGING.has(it.ref))) {
    const floor = it.y < HOUSE.floorY ? HOUSE.floorY - 8 : HOUSE.y + HOUSE.h - 16;
    return { ...it, y: Math.round(floor - foot + (it.ref === "tapete" ? 14 * unit : 0)) };
  }
  return { ...it, y: Math.round(Math.min(it.y, VIEW_H - 6 - foot)) };
}
