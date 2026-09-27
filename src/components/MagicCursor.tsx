import { useEffect, useRef } from "react";

/** Rastro de pó mágico dourado seguindo o mouse (só em computador). */
export default function MagicCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type P = { x: number; y: number; vx: number; vy: number; life: number; size: number; hue: string };
    const parts: P[] = [];
    const hues = ["255,209,102", "255,241,200", "239,35,60"];
    let last = 0;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - last < 16) return;
      last = now;
      for (let i = 0; i < 2; i++) {
        parts.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.2,
          vy: Math.random() * 1.2 + 0.3,
          life: 1,
          size: Math.random() * 2.4 + 1,
          hue: hues[Math.random() < 0.8 ? (Math.random() < 0.6 ? 0 : 1) : 2],
        });
      }
      if (parts.length > 120) parts.splice(0, parts.length - 120);
    };
    window.addEventListener("pointermove", onMove);

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.025;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.hue},${p.life})`;
        ctx.shadowColor = `rgba(${p.hue},${p.life})`;
        ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-[70]" aria-hidden="true" />;
}
