/** Nome da criança que está jogando (fica só neste aparelho e vale para todos os jogos). */
const KEY = "carta-magica-jogador";
export function loadPlayer() {
  try {
    return localStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
}
export function savePlayer(n: string) {
  try {
    localStorage.setItem(KEY, n.trim().slice(0, 20));
  } catch {
    /* sem armazenamento */
  }
}

export type Medal = { min: number; title: string; emoji: string };
/** Medalha conquistada para a pontuação (a lista vai da menor para a maior). */
export const medalFor = (tiers: Medal[], score: number) => [...tiers].reverse().find((t) => score >= t.min) ?? tiers[0];
