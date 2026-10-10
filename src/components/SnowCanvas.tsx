import { useEffect, useRef } from "react";
import { snow } from "../lib/snow";

/**
 * Neve em 3 camadas (fundo, meio e flocos grandes desfocados na frente),
 * com vento em rajadas, balanço suave, cristais girando, modo nevasca
 * e explosão de flocos onde a pessoa clica.
 */
type Flake = {
  x: number; y: number; r: number; vy: number; sway: number; phase: number;
  layer: 0 | 1 | 2; crystal: boolean; rot: number; vr: number; alpha: number;
};
type Burst = { x: number; y: number; vx: number; vy: number; r: number; rot: number; life: number };

export default function SnowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let W = 0, H = 0;
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const mobile = W < 700;
    const base = mobile ? 55 : 110;
    let target = base;
    const flakes: Flake[] = [];
    const bursts: Burst[] = [];

    const make = (y?: number): Flake => {
      const roll = Math.random();
      const layer: 0 | 1 | 2 = roll < 0.55 ? 0 : roll < 0.92 ? 1 : 2;
      const r = layer === 0 ? Math.random() * 1.3 + 0.6 : layer === 1 ? Math.random() * 2 + 1.6 : Math.random() * 5 + 5;
      return {
        x: Math.random() * W,
        y: y ?? Math.random() * H,
        r,
        vy: layer === 0 ? 18 + Math.random() * 18 : layer === 1 ? 35 + Math.random() * 30 : 60 + Math.random() * 40,
        sway: layer === 0 ? 6 : layer === 1 ? 14 : 22,
        phase: Math.random() * Math.PI * 2,
        layer,
        crystal: layer === 1 && Math.random() < 0.35,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 1.5,
        alpha: layer === 0 ? 0.35 + Math.random() * 0.3 : layer === 1 ? 0.6 + Math.random() * 0.3 : 0.12 + Math.random() * 0.12,
      };
    };
    for (let i = 0; i < base; i++) flakes.push(make());

    let wind = 0, windTarget = 0, gustTimer = 0, blizzardLevel = 0, blizzardTarget = 0;

    const off = snow.on((e) => {
      if (e.type === "blizzard") {
        blizzardTarget = e.on ? 1 : 0;
        target = e.on ? base * 3 : base;
      } else {
        for (let i = 0; i < 16; i++) {
          const a = (Math.PI * 2 * i) / 16 + Math.random() * 0.3;
          const s = 120 + Math.random() * 180;
          bursts.push({ x: e.x, y: e.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 3 + Math.random() * 4, rot: Math.random() * 3, life: 1 });
        }
      }
    });

    const drawCrystal = (x: number, y: number, r: number, rot: number, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.strokeStyle = `rgba(235,245,255,${alpha})`;
      ctx.lineWidth = Math.max(0.8, r * 0.28);
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 3) * k;
        const cx = Math.cos(a), cy = Math.sin(a);
        ctx.moveTo(0, 0);
        ctx.lineTo(cx * r * 2, cy * r * 2);
        // raminhos
        const bx = cx * r * 1.2, by = cy * r * 1.2;
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(a + 0.7) * r * 0.6, by + Math.sin(a + 0.7) * r * 0.6);
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(a - 0.7) * r * 0.6, by + Math.sin(a - 0.7) * r * 0.6);
      }
      ctx.stroke();
      ctx.restore();
    };

    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      // vento em rajadas
      gustTimer -= dt;
      if (gustTimer <= 0) {
        gustTimer = 3 + Math.random() * 5;
        windTarget = (Math.random() - 0.35) * 40;
      }
      blizzardLevel += (blizzardTarget - blizzardLevel) * Math.min(1, dt * 1.2);
      wind += (windTarget + blizzardLevel * 140 - wind) * Math.min(1, dt * 0.8);

      // ajusta quantidade de flocos aos poucos
      if (flakes.length < target && Math.random() < 0.9) flakes.push(make(-10));
      if (flakes.length > target) flakes.splice(0, 2);

      ctx.clearRect(0, 0, W, H);

      for (const f of flakes) {
        const depth = f.layer === 0 ? 0.5 : f.layer === 1 ? 1 : 1.6;
        f.y += f.vy * dt * (1 + blizzardLevel * 1.2);
        f.x += (wind * depth + Math.sin(t * 0.9 + f.phase) * f.sway) * dt;
        f.rot += f.vr * dt;
        if (f.y > H + 20) { f.y = -20; f.x = Math.random() * W; }
        if (f.x > W + 20) f.x = -20;
        if (f.x < -20) f.x = W + 20;

        if (f.layer === 2) {
          // floco grande desfocado (efeito de profundidade)
          const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
          g.addColorStop(0, `rgba(255,255,255,${f.alpha})`);
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
        } else if (f.crystal) {
          drawCrystal(f.x, f.y, f.r, f.rot, f.alpha);
        } else {
          ctx.fillStyle = `rgba(255,255,255,${f.alpha})`;
          ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
        }
      }

      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.vx *= 0.94; b.vy = b.vy * 0.94 + 40 * dt;
        b.x += b.vx * dt; b.y += b.vy * dt; b.rot += dt * 3; b.life -= dt * 0.9;
        if (b.life <= 0) { bursts.splice(i, 1); continue; }
        drawCrystal(b.x, b.y, b.r, b.rot, b.life);
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      off();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10 opacity-80" aria-hidden="true" />;
}
