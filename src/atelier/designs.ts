/** Desenhos de Natal para colorir (traços originais, 400x400, estilo livro de colorir). */
import * as P1 from "./pages1";
import * as P2 from "./pages2";

export type DesignCat = "noel" | "bichos" | "enfeites" | "cenas";
export type Design = { id: string; name: string; emoji: string; cat: DesignCat; exclusive?: boolean; free?: boolean; body: string };

export const DESIGN_CATS: { id: DesignCat | "todos"; label: string }[] = [
  { id: "todos", label: "✨ Todos" },
  { id: "noel", label: "🎅 Papai Noel" },
  { id: "bichos", label: "🦌 Bichinhos" },
  { id: "enfeites", label: "🔔 Enfeites" },
  { id: "cenas", label: "🏠 Cenas" },
];

export const DESIGNS: Design[] = [
  { id: "arvore", cat: "enfeites", name: "Árvore de Natal", emoji: "🎄",  body: P1.arvore() },
  { id: "boneco", cat: "bichos", name: "Boneco de neve", emoji: "⛄",  body: P1.boneco() },
  { id: "presente", cat: "enfeites", name: "Presentes", emoji: "🎁",  body: P2.presente() },
  { id: "sino", cat: "enfeites", name: "Sinos de Natal", emoji: "🔔",  body: P2.sino() },
  { id: "noel", cat: "noel", name: "Rosto do Papai Noel", emoji: "🎅",  body: P2.noelRosto() },
  { id: "rena", cat: "bichos", name: "Rena", emoji: "🦌",  body: P1.rena() },
  { id: "casinha", cat: "cenas", name: "Casinha na neve", emoji: "🏠",  body: P2.casinha() },
  { id: "meia", cat: "enfeites", name: "Meia de Natal", emoji: "🧦",  body: P2.meia() },
  { id: "biscoito", cat: "cenas", name: "Biscoito de gengibre", emoji: "🍪", exclusive: true, body: P2.biscoito() },
  { id: "guirlanda", cat: "enfeites", name: "Guirlanda", emoji: "💫", exclusive: true, body: P2.guirlanda() },
  { id: "noel-corpo", cat: "noel", name: "Papai Noel acenando", emoji: "🎅", free: true, body: P1.noelCorpo() },
  { id: "treno", cat: "noel", name: "Trenó com presentes", emoji: "🛷", free: true, body: P1.treno() },
  { id: "duende", cat: "noel", name: "Duende ajudante", emoji: "🧝",  body: P2.duende() },
  { id: "estrela", cat: "enfeites", name: "Estrela de Natal", emoji: "⭐",  body: P2.estrela() },
  { id: "bola", cat: "enfeites", name: "Bola de Natal", emoji: "🔴",  body: P2.bola() },
  { id: "vela", cat: "enfeites", name: "Velas de Natal", emoji: "🕯️",  body: P2.vela() },
  { id: "bengala", cat: "enfeites", name: "Bengalas doces", emoji: "🍭",  body: P2.bengala() },
  { id: "pinguim", cat: "bichos", name: "Pinguim de gorro", emoji: "🐧",  body: P1.pinguim() },
  { id: "urso", cat: "bichos", name: "Ursinho polar", emoji: "🐻‍❄️",  body: P2.urso() },
  { id: "lareira", cat: "cenas", name: "Lareira com meias", emoji: "🔥",  body: P2.lareira() },
  { id: "casa-biscoito", cat: "cenas", name: "Casinha de biscoito", emoji: "🍬", exclusive: true, body: P2.casaBiscoito() },
  { id: "presepio", cat: "cenas", name: "Presépio", emoji: "⭐", exclusive: true, body: P2.presepio() },
];

export function designSvg(d: Design, size = 400) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="${size}" height="${size}"><g fill="none" stroke="#1E2340" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${d.body}</g></svg>`;
}

export const designDataUrl = (d: Design, size = 400) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(designSvg(d, size));
