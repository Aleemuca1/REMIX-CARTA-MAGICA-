import confetti from "canvas-confetti";
import { musicBox } from "./christmasMusic";

/** Chuva de presentes, estrelas e flocos saindo do botão clicado. */
let shapes: confetti.Shape[] | null = null;
export function celebrateFrom(el: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try {
    if (!shapes && "shapeFromText" in confetti) {
      shapes = ["🎁", "⭐", "❄️", "🎄"].map((t) => (confetti as any).shapeFromText({ text: t, scalar: 2.2 }));
    }
  } catch {
    shapes = [];
  }
  const r = el.getBoundingClientRect();
  confetti({
    particleCount: 26,
    spread: 80,
    startVelocity: 32,
    scalar: 2.2,
    shapes: shapes && shapes.length ? shapes : undefined,
    origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight },
    zIndex: 100,
  });
  [84, 88, 91].forEach((n, i) => setTimeout(() => musicBox.chime(n, undefined, 0.1), i * 60));
}
