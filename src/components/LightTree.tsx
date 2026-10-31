import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { BookOpen, ChevronRight, Heart, Lightbulb, X } from "lucide-react";
import Reveal from "./Reveal";
import { WhatsIcon } from "./letter/ShareSheet";
import { BAUBLES } from "../lib/lightTree";
import { whatsappUrl } from "../lib/shareKit";
import { musicBox } from "../lib/christmasMusic";

const KEY = "carta-magica-arvore-luz";
const loadOpened = (): number[] => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v.filter((n) => Number.isInteger(n) && n >= 0 && n < BAUBLES.length) : [];
  } catch {
    return [];
  }
};
const saveOpened = (v: number[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* sem armazenamento */
  }
};

// posição de cada bolinha na árvore (viewBox 400 x 540)
const SPOTS: [number, number][] = [
  [200, 120], [182, 168], [222, 156],
  [222, 200], [150, 255], [200, 236], [252, 262],
  [120, 342], [170, 316], [232, 346], [282, 324],
  [95, 430], [150, 404], [206, 436], [262, 410], [312, 432],
];
// tiers: [topo, base, meia-largura]
const TIERS: [number, number, number][] = [
  [70, 190, 72],
  [138, 282, 112],
  [218, 372, 148],
  [298, 458, 178],
];
// cordões de luz (curva de um lado ao outro de cada camada)
const GARLANDS = [
  { y0: 150, y1: 182, w: 52 },
  { y0: 228, y1: 268, w: 92 },
  { y0: 310, y1: 356, w: 126 },
  { y0: 392, y1: 440, w: 160 },
];
const BULB_COLORS = ["#FFD166", "#EF233C", "#4CC9F0", "#2DC653", "#FF7AA2", "#FFFFFF"];

function bulbsFor(g: (typeof GARLANDS)[number], gi: number) {
  const n = 7 + gi * 2;
  const a = { x: 200 - g.w, y: g.y0 };
  const b = { x: 200 + g.w, y: g.y0 + 6 };
  const c = { x: 200, y: g.y1 + 18 };
  return Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    return {
      x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
      y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
      color: BULB_COLORS[(i + gi) % BULB_COLORS.length],
      delay: ((i * 37 + gi * 13) % 20) / 10,
    };
  });
}

/** Árvore de Natal iluminada: cada bolinha abre uma mensagem, um versículo e uma ideia para o Natal. */
export default function LightTree({ onCreateLetter }: { onCreateLetter: () => void }) {
  const [opened, setOpened] = useState<number[]>(loadOpened);
  const [current, setCurrent] = useState<number | null>(null);
  const all = opened.length >= BAUBLES.length;
  const bulbs = useMemo(() => GARLANDS.flatMap((g, gi) => bulbsFor(g, gi)), []);
  const garlandPaths = useMemo(
    () => GARLANDS.map((g) => `M ${200 - g.w} ${g.y0} Q 200 ${g.y1 + 18} ${200 + g.w} ${g.y0 + 6}`),
    [],
  );

  const open = (i: number) => {
    setCurrent(i);
    musicBox.chime([72, 76, 79, 84, 88][i % 5], undefined, 0.1);
    if (!opened.includes(i)) {
      const next = [...opened, i];
      setOpened(next);
      saveOpened(next);
      if (next.length === BAUBLES.length) {
        setTimeout(() => {
          musicBox.sleighBells(1.6, 0.08);
          confetti({ particleCount: 180, spread: 120, origin: { y: 0.4 }, zIndex: 120, colors: ["#FFD166", "#FFFFFF", "#EF233C", "#2DC653"] });
        }, 600);
      }
    }
  };
  const nextClosed = () => {
    const n = BAUBLES.findIndex((_, i) => !opened.includes(i) && i !== current);
    open(n >= 0 ? n : ((current ?? 0) + 1) % BAUBLES.length);
  };

  const starGlow = 0.35 + 0.65 * (opened.length / BAUBLES.length);

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="arvore-luz">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#FFD166]/50 bg-gradient-to-b from-[#040A1C] via-[#0A1838] to-[#132A4F] p-4 sm:p-10 shadow-2xl grid md:grid-cols-[1fr_1.1fr] gap-6 items-center">
          <div className="text-center md:text-left relative z-10">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0B132B] bg-[#FFD166] rounded-full px-3 py-1 mb-3">
              ✨ Árvore de Luz
            </span>
            <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-white mb-3">Toque numa bolinha e receba uma mensagem</h2>
            <p className="text-sm sm:text-base text-[#EDF2F4]/85 mb-4 leading-relaxed">
              Cada bolinha guarda uma <b className="text-[#FFD166]">mensagem de carinho</b>, uma <b className="text-[#FFD166]">palavra da Bíblia</b> e uma{" "}
              <b className="text-[#FFD166]">ideia para viver o Natal em família</b>, com a melhor época para fazer. Abra todas e acenda a estrela!
            </p>
            <div className="inline-flex items-center gap-3 bg-white/10 rounded-full px-4 py-2 mb-4">
              <span className="text-sm text-white font-bold" id="light-progress">
                ⭐ {opened.length} de {BAUBLES.length} bolinhas abertas
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden max-w-xs mx-auto md:mx-0 mb-5">
              <div className="h-full rounded-full bg-gradient-to-r from-[#FFD166] to-[#FFF6D8] transition-all duration-700" style={{ width: `${(opened.length / BAUBLES.length) * 100}%` }} />
            </div>
            {all && <p className="text-[#FFD166] font-bold mb-4">🌟 Você acendeu a árvore inteira! Que seu Natal seja cheio de luz.</p>}
            <div>
              <button
                onClick={onCreateLetter}
                className="bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white font-extrabold px-6 py-3.5 rounded-full inline-flex items-center gap-2 shadow-lg border border-[#FFD166]/50 btn-shine cursor-pointer"
                id="light-letter-cta"
                data-celebrate
              >
                <span className="relative z-10">✉️ Escrever minha carta para o Papai Noel</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <svg viewBox="0 0 400 540" className="w-full max-w-[460px] mx-auto block" role="img" aria-label="Árvore de Natal iluminada com bolinhas para tocar">
              <defs>
                <radialGradient id="lt-halo" cx="50%" cy="55%" r="55%">
                  <stop offset="0%" stopColor="#FFD166" stopOpacity="0.35" />
                  <stop offset="60%" stopColor="#FFB347" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#FFB347" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="lt-tree" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1F7A45" />
                  <stop offset="55%" stopColor="#11532E" />
                  <stop offset="100%" stopColor="#0A3A20" />
                </linearGradient>
                <linearGradient id="lt-snow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F4FAFF" />
                  <stop offset="100%" stopColor="#BFD8F0" />
                </linearGradient>
                <filter id="lt-glow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="3.2" />
                </filter>
                <filter id="lt-softglow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" />
                </filter>
                {BAUBLES.map((b, i) => (
                  <radialGradient key={i} id={`lt-b${i}`} cx="35%" cy="30%" r="75%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                    <stop offset="25%" stopColor={b.color} />
                    <stop offset="100%" stopColor="#1C0A12" stopOpacity="0.85" />
                  </radialGradient>
                ))}
              </defs>

              {/* céu: estrelas e lua */}
              {Array.from({ length: 40 }, (_, i) => (
                <circle
                  key={i}
                  cx={(i * 97) % 400}
                  cy={(i * 53) % 230}
                  r={i % 5 === 0 ? 1.4 : 0.8}
                  fill="#FFFFFF"
                  className="lt-star"
                  style={{ animationDelay: `${(i % 9) * 0.35}s` }}
                />
              ))}
              <circle cx="345" cy="58" r="22" fill="#FFF6D8" opacity="0.95" />
              <circle cx="335" cy="52" r="22" fill="#0A1838" opacity="0.0" />

              {/* brilho atrás da árvore */}
              <ellipse cx="200" cy="300" rx="210" ry="250" fill="url(#lt-halo)" />

              {/* chão com neve e casinhas */}
              <path d="M0 470 Q 100 450 200 466 T 400 462 L 400 540 L 0 540 Z" fill="url(#lt-snow)" />
              {[30, 330].map((x, k) => (
                <g key={x} transform={`translate(${x} ${448 - k * 4})`} opacity="0.9">
                  <rect x="0" y="10" width="40" height="26" fill="#2A1B3D" />
                  <path d="M-4 12 L20 -6 L44 12 Z" fill="#E8F2FF" />
                  <rect x="8" y="18" width="8" height="8" fill="#FFD166" className="lt-window" />
                  <rect x="24" y="18" width="8" height="8" fill="#FFD166" className="lt-window" style={{ animationDelay: "1.2s" }} />
                </g>
              ))}

              {/* tronco */}
              <rect x="186" y="452" width="28" height="32" rx="3" fill="#5A3418" />

              {/* camadas da árvore com bordinha ondulada */}
              {[...TIERS].reverse().map(([top, base, hw], k) => {
                const waves = 6 + (3 - k);
                let d = `M 200 ${top} L ${200 + hw} ${base} `;
                for (let i = waves; i > 0; i--) {
                  const x1 = 200 - hw + ((2 * hw) / waves) * (i - 0.5);
                  const x2 = 200 - hw + ((2 * hw) / waves) * (i - 1);
                  d += `Q ${x1} ${base + 12} ${x2} ${base} `;
                }
                d += "Z";
                return (
                  <g key={top}>
                    <path d={d} fill="url(#lt-tree)" stroke="#0A3A20" strokeWidth="1.5" />
                    <path d={`M 200 ${top + 6} L ${200 - hw * 0.55} ${base - 6}`} stroke="#2DC653" strokeOpacity="0.18" strokeWidth="3" strokeLinecap="round" />
                  </g>
                );
              })}

              {/* neve nas pontas */}
              {TIERS.map(([, base, hw]) => (
                <g key={`s${base}`} fill="#FFFFFF" opacity="0.85">
                  <ellipse cx={200 - hw + 10} cy={base + 1} rx="9" ry="3" />
                  <ellipse cx={200 + hw - 10} cy={base + 1} rx="9" ry="3" />
                </g>
              ))}

              {/* cordões de luz */}
              {garlandPaths.map((d, i) => (
                <path key={i} d={d} fill="none" stroke="#FFE9A8" strokeOpacity="0.45" strokeWidth="1.2" />
              ))}
              {bulbs.map((b, i) => (
                <g key={i} className="lt-bulb" style={{ animationDelay: `${b.delay}s` }}>
                  <circle cx={b.x} cy={b.y} r="5.5" fill={b.color} filter="url(#lt-glow)" opacity="0.9" />
                  <circle cx={b.x} cy={b.y} r="2.4" fill={b.color} />
                  <circle cx={b.x - 0.7} cy={b.y - 0.8} r="0.8" fill="#FFFFFF" opacity="0.9" />
                </g>
              ))}

              {/* bolinhas que abrem mensagem */}
              {SPOTS.map(([x, y], i) => {
                const isOpen = opened.includes(i);
                const isCur = current === i;
                return (
                  <g
                    key={i}
                    role="button"
                    tabIndex={0}
                    aria-label={`Bolinha ${i + 1}${isOpen ? " (já aberta)" : ""}`}
                    onClick={() => open(i)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open(i))}
                    className="cursor-pointer outline-none lt-bauble"
                    style={{ transformOrigin: `${x}px ${y - 14}px`, animationDelay: `${(i % 6) * 0.4}s` }}
                    id={`bauble-${i}`}
                  >
                    <line x1={x} y1={y - 22} x2={x} y2={y - 13} stroke="#FFE9A8" strokeWidth="0.8" />
                    <circle cx={x} cy={y} r={isCur ? 18 : 15} fill={BAUBLES[i].color} filter="url(#lt-softglow)" opacity={isOpen ? 0.35 : 0.75} className={isOpen ? "" : "lt-pulse"} />
                    <circle cx={x} cy={y} r="11" fill={`url(#lt-b${i})`} stroke="#FFE9A8" strokeOpacity="0.6" strokeWidth="0.8" />
                    <rect x={x - 3.5} y={y - 14.5} width="7" height="4" rx="1" fill="#E9B949" />
                    <ellipse cx={x - 3.5} cy={y - 4} rx="3" ry="1.8" fill="#FFFFFF" opacity="0.55" />
                    {isOpen ? (
                      <text x={x} y={y + 4} fontSize="9" textAnchor="middle" fill="#FFFFFF" fontWeight="700">
                        ✓
                      </text>
                    ) : (
                      <text x={x} y={y + 4} fontSize="9" textAnchor="middle" fill="#FFFFFF" fontWeight="800" opacity="0.9">
                        ✦
                      </text>
                    )}
                  </g>
                );
              })}

              {/* estrela do topo: brilha mais a cada bolinha aberta */}
              <g transform="translate(200 58)">
                <circle r={30 + starGlow * 20} fill="#FFD166" opacity={0.15 + starGlow * 0.35} filter="url(#lt-softglow)" className="lt-starglow" />
                <path
                  d="M0 -22 L6.5 -7 L22 -6.8 L10 3.6 L13.6 19 L0 10.6 L-13.6 19 L-10 3.6 L-22 -6.8 L-6.5 -7 Z"
                  fill={all ? "#FFF3B0" : "#FFD166"}
                  stroke="#E9B949"
                  strokeWidth="1.5"
                />
              </g>

              {/* presentes */}
              {[
                [120, 470, "#EF233C", "#FFD166"],
                [158, 480, "#4CC9F0", "#FFFFFF"],
                [240, 476, "#2DC653", "#EF233C"],
                [278, 470, "#B57BFF", "#FFD166"],
              ].map(([x, y, c, r]) => (
                <g key={`${x}`}>
                  <rect x={(x as number) - 16} y={y as number} width="32" height="24" rx="2" fill={c as string} />
                  <rect x={(x as number) - 3} y={y as number} width="6" height="24" fill={r as string} />
                  <rect x={(x as number) - 16} y={(y as number) + 8} width="32" height="5" fill={r as string} />
                  <path d={`M ${x} ${y} q -10 -10 -12 0 M ${x} ${y} q 10 -10 12 0`} stroke={r as string} strokeWidth="3" fill="none" />
                </g>
              ))}
            </svg>
            <p className="text-center text-xs text-white/60 mt-1">👆 Toque nas bolinhas que piscam</p>
          </div>
        </div>
      </Reveal>

      <AnimatePresence>
        {current !== null && (
          <BaubleCard
            key={current}
            i={current}
            onClose={() => setCurrent(null)}
            onNext={nextClosed}
            onLetter={() => {
              setCurrent(null);
              onCreateLetter();
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function BaubleCard({ i, onClose, onNext, onLetter }: { i: number; onClose: () => void; onNext: () => void; onLetter: () => void }) {
  const b = BAUBLES[i];
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  const share = `✨ ${b.message}\n\n📖 "${b.verse}" (${b.ref})\n\n🎄 Ideia para o Natal: ${b.idea}\n\nAbra uma bolinha da Árvore de Luz: ${window.location.origin}/#arvore-luz`;
  return (
    <motion.div className="fixed inset-0 z-[85] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        role="dialog"
        aria-modal="true"
        id="bauble-card"
        className="relative w-full sm:max-w-md max-h-[90dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl parchment-bg text-[#1C2541] border-4 shadow-2xl p-5 sm:p-7"
        style={{ borderColor: b.color, boxShadow: `0 0 50px ${b.color}66` }}
        initial={{ y: 80, scale: 0.9, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-black/5 cursor-pointer" aria-label="Fechar">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-full shadow-inner" style={{ background: `radial-gradient(circle at 35% 30%, #fff, ${b.color} 40%, #3a0d1a)` }} />
          <span className="font-cinzel text-xs font-extrabold tracking-[0.18em] text-[#9B021A]">BOLINHA {i + 1} DE {BAUBLES.length}</span>
        </div>

        <h3 className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#9B021A]">
          <Heart className="w-3.5 h-3.5" /> Mensagem para você
        </h3>
        <p className="font-handwriting text-2xl sm:text-3xl leading-snug mt-1 mb-4">{b.message}</p>

        <div className="rounded-2xl bg-[#FFF6D8] border border-[#E9B949]/50 p-3.5 mb-4">
          <h3 className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#8A5A00]">
            <BookOpen className="w-3.5 h-3.5" /> Palavra de Deus
          </h3>
          <p className="font-serif italic text-base mt-1">“{b.verse}”</p>
          <p className="text-xs font-bold text-[#8A5A00] mt-1 text-right">{b.ref}</p>
        </div>

        <h3 className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#1a7a3e]">
          <Lightbulb className="w-3.5 h-3.5" /> Ideia para este Natal
        </h3>
        <p className="text-sm mt-1">{b.idea}</p>
        <p className="text-xs mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#2DC653]/15 text-[#14532F] font-bold px-2.5 py-1">📅 Melhor época: {b.when}</p>

        {b.letter && (
          <button
            onClick={onLetter}
            className="mt-4 w-full rounded-2xl p-3 text-left bg-gradient-to-r from-[#9B021A] to-[#D90429] border-2 border-[#FFD166] text-white flex items-center gap-3 cursor-pointer"
            id="bauble-letter"
          >
            <span className="text-3xl">✉️</span>
            <span className="font-extrabold leading-tight">Escrever a cartinha agora</span>
          </button>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a href={whatsappUrl(share)} target="_blank" rel="noopener" className="rounded-full py-2.5 font-bold text-white bg-[#25D366] inline-flex items-center justify-center gap-2 text-sm">
            <WhatsIcon className="w-4 h-4" /> Enviar
          </a>
          <button onClick={onNext} className="rounded-full py-2.5 font-bold text-white bg-[#1C2541] inline-flex items-center justify-center gap-1 text-sm cursor-pointer" id="bauble-next">
            Próxima bolinha <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
