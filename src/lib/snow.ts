/** Controle global da neve (usado pelo canvas, botão de nevasca e cliques). */
export type SnowEvent = { type: "burst"; x: number; y: number } | { type: "blizzard"; on: boolean };

const listeners = new Set<(e: SnowEvent) => void>();
let blizzard = false;

export const snow = {
  on(fn: (e: SnowEvent) => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  burst(x: number, y: number) {
    listeners.forEach((fn) => fn({ type: "burst", x, y }));
  },
  setBlizzard(on: boolean) {
    blizzard = on;
    listeners.forEach((fn) => fn({ type: "blizzard", on }));
  },
  get blizzard() {
    return blizzard;
  },
};
