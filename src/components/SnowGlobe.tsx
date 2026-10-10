import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, AnimatePresence } from "motion/react";
import Reveal from "./Reveal";
import { musicBox } from "../lib/christmasMusic";

const MESSAGES = [
  "Os duendes contaram que alguém aí anda muito gentil este ano! ✨",
  "A Mamãe Noel já está assando biscoitos para a grande noite. 🍪",
  "O Rudolph está treinando voos rasantes sobre a sua cidade! 🦌",
  "Quem acredita na magia do Natal enxerga estrelas mais brilhantes. ⭐",
  "O Papai Noel adora abraços apertados e sorrisos sinceros. 🤗",
  "Um presente especial está sendo embrulhado agora mesmo na oficina! 🎁",
  "Dizem que quem sacode o globo três vezes ganha um desejo de Natal. 🌟",
  "As renas pediram cenouras extras para a viagem deste ano. 🥕",
];

type P = { x: number; y: number; vx: number; vy: number; r: number };

/** Globo de neve: toque ou arraste para sacudir e revelar uma mensagem do Polo Norte. */
export default function SnowGlobe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const partsRef = useRef<P[]>([]);
  const controls = useAnimationControls();
  const [msg, setMsg] = useState<string | null>(null);
  const [shakes, setShakes] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const S = 300;
    canvas.width = S * 2;
    canvas.height = S * 2;
    ctx.scale(2, 2);
    const cx = S / 2, cy = S / 2, R = S / 2 - 4;
    partsRef.current = Array.from({ length: 160 }, () => {
      const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * R * 0.9;
      return { x: cx + Math.cos(a) * d, y: cy + R * 0.55 - Math.random() * 10, vx: 0, vy: 0, r: Math.random() * 1.8 + 0.8 };
    });

    const drawScene = () => {
      // chão de neve
      ctx.fillStyle = "#EEF4FF";
      ctx.beginPath();
      ctx.ellipse(cx, cy + R * 0.62, R * 0.95, R * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      // casinha
      const hx = cx - 20, hy = cy + 30;
      ctx.fillStyle = "#7A2E2E"; ctx.fillRect(hx + 30, hy - 58, 10, 20);
      ctx.fillStyle = "#3A2E5C"; ctx.fillRect(hx - 35, hy - 40, 70, 50);
      ctx.fillStyle = "#F4F8FF";
      ctx.beginPath(); ctx.moveTo(hx - 44, hy - 38); ctx.lineTo(hx, hy - 72); ctx.lineTo(hx + 44, hy - 38); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#FFD166"; ctx.fillRect(hx - 24, hy - 25, 14, 14); ctx.fillRect(hx + 10, hy - 25, 14, 14);
      ctx.fillStyle = "#2A1A12"; ctx.fillRect(hx - 7, hy - 8, 14, 18);
      // pinheiro
      const tx = cx + 60, ty = cy + 42;
      ctx.fillStyle = "#0E3B2A";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(tx, ty - 70 + i * 18); ctx.lineTo(tx + 22 - i * 2 + i * 4, ty - 30 + i * 18); ctx.lineTo(tx - 22 + i * 2 - i * 4, ty - 30 + i * 18); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = "#FFD166"; ctx.beginPath(); ctx.arc(tx, ty - 72, 4, 0, Math.PI * 2); ctx.fill();
      ["#EF233C", "#4CC9F0", "#FFD166", "#F72585"].forEach((c, i) => {
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(tx - 10 + i * 7, ty - 40 + (i % 2) * 14, 2.5, 0, Math.PI * 2); ctx.fill();
      });
      // bonequinho de neve
      const sx = cx - 70, sy = cy + 55;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath(); ctx.arc(sx, sy, 13, 0, Math.PI * 2); ctx.arc(sx, sy - 19, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#F77F00"; ctx.beginPath(); ctx.moveTo(sx, sy - 19); ctx.lineTo(sx + 8, sy - 18); ctx.lineTo(sx, sy - 17); ctx.fill();
      ctx.fillStyle = "#EF233C"; ctx.fillRect(sx - 8, sy - 12, 16, 3);
    };

    let raf = 0, last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, S, S);
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      drawScene();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      const floor = cy + R * 0.55;
      for (const p of partsRef.current) {
        p.vy += 22 * dt; // afunda devagar, como na água
        p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.x += Math.sin(now / 700 + p.r * 5) * 0.08;
        if (p.y > floor) { p.y = floor; p.vy = 0; p.vx *= 0.5; }
        const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy);
        if (d > R - 3) { p.x = cx + (dx / d) * (R - 3); p.y = cy + (dy / d) * (R - 3); p.vx *= -0.4; p.vy *= -0.4; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const shake = (power = 1) => {
    for (const p of partsRef.current) {
      p.vx += (Math.random() - 0.5) * 380 * power;
      p.vy -= (120 + Math.random() * 260) * power;
    }
    controls.start({ rotate: [0, -9, 8, -6, 5, -2, 0], x: [0, -10, 9, -6, 4, 0], transition: { duration: 0.8 } });
    musicBox.chime([79, 84, 88][shakes % 3], undefined, 0.12);
    setShakes((n) => n + 1);
    setMsg(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
  };

  return (
    <section className="py-16 md:py-24 px-4 max-w-5xl mx-auto" id="globo">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <Reveal className="text-center md:text-left order-2 md:order-1">
          <span className="text-xs text-[#8EC5FF] uppercase font-bold tracking-widest block mb-2">Globo de neve mágico</span>
          <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Sacuda e receba um recado do Polo Norte ❄️</h2>
          <p className="text-sm sm:text-base text-[#EDF2F4]/75 mb-6">
            Toque no globo (ou arraste) para fazer nevar lá dentro. A cada sacudida, os duendes mandam uma mensagem diferente!
          </p>
          <div className="min-h-[88px]">
            <AnimatePresence mode="wait">
              {msg ? (
                <motion.div
                  key={msg + shakes}
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="parchment-bg text-[#1C2541] rounded-2xl px-5 py-4 border-2 border-[#FFD166] shadow-xl inline-block text-left"
                >
                  <span className="font-cinzel text-[11px] font-bold text-[#9B021A] block mb-1">Recado nº {shakes}</span>
                  <span className="font-serif text-sm sm:text-base">{msg}</span>
                </motion.div>
              ) : (
                <motion.p key="hint" className="text-[#8EC5FF] text-sm font-semibold" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                  👆 Toque no globo para começar
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </Reveal>

        <Reveal className="order-1 md:order-2 flex justify-center" delay={0.1}>
          <motion.div
            animate={controls}
            className="relative cursor-grab active:cursor-grabbing select-none"
            onClick={() => shake(1)}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => shake(Math.min(2, 0.6 + Math.hypot(info.velocity.x, info.velocity.y) / 1500))}
            role="button"
            aria-label="Sacudir o globo de neve"
            whileHover={{ scale: 1.03 }}
          >
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full globe-glass overflow-hidden">
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
              <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.35), transparent 18%)" }} />
            </div>
            {/* base */}
            <div className="relative mx-auto -mt-6 w-56 sm:w-64 h-14 rounded-b-[40px] rounded-t-xl bg-gradient-to-b from-[#9B021A] to-[#5a0010] border-t-4 border-[#FFD166] shadow-2xl flex items-center justify-center">
              <span className="font-cinzel text-[11px] sm:text-xs font-bold text-[#FFD166] tracking-widest">POLO NORTE • 2026</span>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
