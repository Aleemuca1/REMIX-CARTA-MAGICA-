import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { musicBox } from "../lib/christmasMusic";
import { PLACES } from "../lib/worldChristmas";

/**
 * Espera da carta: a oficina do duende Pipoca. Ele escreve a carta na mesa enquanto a IA trabalha,
 * a criança pode tocar nele (ele pula e fala) e pegar os presentes que caem para "ajudar".
 */
type Gift = { id: number; x: number; emoji: string; dur: number };

const ELF_LINES = [
  "Ho ho! Obrigado pela ajuda!",
  "Psiu… estou caprichando!",
  "Quase terminando!",
  "Essa carta vai ficar linda!",
  "Hihi! Faz cócegas!",
  "O Papai Noel vai adorar!",
];
const GIFTS = ["🎁", "🧸", "🍭", "⭐", "🎈", "🚂", "🪀", "🍪"];

export default function ElfWorkshopLoader({ childName, achievement }: { childName: string; achievement?: string }) {
  const name = childName.trim() || "você";
  const steps = useMemo(
    () => [
      `📖 Procurando ${name} no Livro Dourado…`,
      achievement?.trim() ? `✍️ Escrevendo sobre “${achievement.trim().slice(0, 42)}${achievement.trim().length > 42 ? "…" : ""}”` : `✍️ Escrevendo as conquistas de ${name}…`,
      "🦌 As renas estão iluminando o pergaminho…",
      "🎅 O Papai Noel está lendo e sorrindo…",
      "🔴 Carimbando o selo de cera…",
    ],
    [name, achievement],
  );
  const fact = useMemo(() => {
    const p = PLACES[Math.floor(Math.random() * PLACES.length)];
    return `${p.flag} ${p.name}: ${p.facts[Math.floor(Math.random() * p.facts.length)]}`;
  }, []);

  const [t, setT] = useState(0); // segundos
  const [say, setSay] = useState<string | null>(null);
  const [jump, setJump] = useState(0);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [caught, setCaught] = useState(0);
  const idRef = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const tick = setInterval(() => setT((performance.now() - start) / 1000), 200);
    const spawn = setInterval(() => {
      setGifts((g) =>
        g.length >= 5
          ? g
          : [...g, { id: ++idRef.current, x: 6 + Math.random() * 82, emoji: GIFTS[Math.floor(Math.random() * GIFTS.length)], dur: 4.5 + Math.random() * 2.5 }],
      );
    }, 1100);
    return () => {
      clearInterval(tick);
      clearInterval(spawn);
    };
  }, []);

  const step = Math.min(steps.length - 1, Math.floor(t / 3));
  // progresso que nunca "trava": chega perto de 95% e fica respirando
  const progress = Math.min(95, 100 * (1 - Math.exp(-t / 6)));
  const slow = t > 20;

  const tapElf = () => {
    setJump((j) => j + 1);
    setSay(ELF_LINES[Math.floor(Math.random() * ELF_LINES.length)]);
    musicBox.chime([79, 84, 88][Math.floor(Math.random() * 3)], undefined, 0.09);
    setTimeout(() => setSay(null), 1800);
  };
  const catchGift = (id: number) => {
    setGifts((g) => g.filter((x) => x.id !== id));
    setCaught((c) => c + 1);
    musicBox.chime([84, 88, 91, 96][caught % 4], undefined, 0.08);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[90] bg-[radial-gradient(ellipse_at_top,#1B2F66_0%,#0B1430_45%,#050914_100%)] flex flex-col items-center justify-center px-4 overflow-y-auto overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="status"
      aria-live="polite"
      id="elf-loader"
    >
      {/* neve */}
      {Array.from({ length: 26 }, (_, i) => (
        <span
          key={i}
          className="elf-snow absolute top-0 text-white/70 pointer-events-none"
          style={{ left: `${(i * 37) % 100}%`, fontSize: 8 + (i % 4) * 3, animationDuration: `${6 + (i % 5)}s`, animationDelay: `${(i % 7) * 0.7}s` }}
          aria-hidden="true"
        >
          ❄
        </span>
      ))}

      {/* presentes caindo para pegar */}
      <AnimatePresence>
        {gifts.map((g) => (
          <motion.button
            key={g.id}
            className="absolute top-0 text-3xl sm:text-4xl cursor-pointer z-20 select-none"
            style={{ left: `${g.x}%` }}
            initial={{ y: -60, rotate: -20 }}
            animate={{ y: "110vh", rotate: 20 }}
            exit={{ scale: 1.8, opacity: 0, transition: { duration: 0.25 } }}
            transition={{ duration: g.dur, ease: "linear" }}
            onAnimationComplete={() => setGifts((all) => all.filter((x) => x.id !== g.id))}
            onClick={() => catchGift(g.id)}
            aria-label="Pegar presente"
          >
            {g.emoji}
          </motion.button>
        ))}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-md text-center">
        <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] font-extrabold text-[#0B132B] bg-[#FFD166] rounded-full px-3 py-1 mb-2">✨ Oficina do Polo Norte</p>
        <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white leading-snug">
          O duende <span className="text-[#7CE38B]">Pipoca</span> está escrevendo
          <br />a carta de <span className="foil-text" style={{ ["--ink" as string]: "#FFD166" }}>{name}</span>!
        </h3>

        {/* cena da oficina */}
        <div className="relative mx-auto mt-4 w-full max-w-[380px] rounded-[28px] p-[3px] bg-gradient-to-b from-[#FFD166] via-[#E9B949]/60 to-[#9B021A]/60 shadow-[0_0_60px_rgba(255,209,102,0.25)]">
          <svg viewBox="0 0 360 270" className="w-full h-auto block rounded-[25px]" aria-hidden="true">
            <defs>
              <radialGradient id="ws-wall" cx="55%" cy="55%" r="75%">
                <stop offset="0%" stopColor="#7A3B1F" />
                <stop offset="60%" stopColor="#4A2212" />
                <stop offset="100%" stopColor="#24100A" />
              </radialGradient>
              <radialGradient id="ws-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFC56B" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#FFC56B" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="ws-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B1838" />
                <stop offset="100%" stopColor="#24407A" />
              </linearGradient>
              <linearGradient id="ws-desk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B87333" />
                <stop offset="100%" stopColor="#7A4A22" />
              </linearGradient>
              <linearGradient id="ws-paper" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFFBEF" />
                <stop offset="100%" stopColor="#F3E2B8" />
              </linearGradient>
              <radialGradient id="ws-skin" cx="40%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#FFE3CC" />
                <stop offset="100%" stopColor="#F2B992" />
              </radialGradient>
              <linearGradient id="ws-hat" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3CCB6B" />
                <stop offset="100%" stopColor="#13753A" />
              </linearGradient>
              <linearGradient id="ws-tunic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34B862" />
                <stop offset="100%" stopColor="#167A3D" />
              </linearGradient>
              <linearGradient id="ws-flame" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#FF6B1A" />
                <stop offset="60%" stopColor="#FFB23E" />
                <stop offset="100%" stopColor="#FFF3B0" />
              </linearGradient>
              <clipPath id="ws-win">
                <path d="M262 112 V62 a36 36 0 0 1 72 0 V112 Z" />
              </clipPath>
            </defs>

            {/* parede quentinha */}
            <rect width="360" height="270" fill="url(#ws-wall)" />
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1={i * 30 + 15} y1="0" x2={i * 30 + 15} y2="200" stroke="#FFFFFF" strokeOpacity="0.035" strokeWidth="10" />
            ))}

            {/* janela arredondada com neve caindo */}
            <g>
              <path d="M262 112 V62 a36 36 0 0 1 72 0 V112 Z" fill="url(#ws-sky)" />
              <g clipPath="url(#ws-win)">
                <circle cx="312" cy="50" r="9" fill="#FFF6D8" />
                {Array.from({ length: 10 }, (_, i) => (
                  <circle key={i} className="ws-winsnow" cx={268 + ((i * 23) % 62)} cy="20" r={1 + (i % 3) * 0.6} fill="#FFFFFF" style={{ animationDelay: `${(i % 5) * 0.8}s`, animationDuration: `${3 + (i % 4)}s` }} />
                ))}
                <path d="M258 108 Q 298 96 338 108 V116 H258 Z" fill="#EAF4FF" />
              </g>
              <path d="M262 112 V62 a36 36 0 0 1 72 0 V112 Z" fill="none" stroke="#8A5A2B" strokeWidth="6" />
              <line x1="298" y1="26" x2="298" y2="112" stroke="#8A5A2B" strokeWidth="3.5" />
              <line x1="262" y1="76" x2="334" y2="76" stroke="#8A5A2B" strokeWidth="3.5" />
              <rect x="256" y="110" width="84" height="7" rx="3" fill="#A86E3A" />
            </g>

            {/* lareira com fogo e meias */}
            <g>
              <rect x="10" y="132" width="86" height="100" rx="6" fill="#8C8C9E" />
              {Array.from({ length: 5 }, (_, r) =>
                Array.from({ length: 3 }, (_, c) => (
                  <rect key={`${r}-${c}`} x={12 + c * 28 + (r % 2) * 10} y={134 + r * 19} width="26" height="17" rx="3" fill={(r + c) % 2 ? "#A3A3B6" : "#9696AA"} />
                )),
              )}
              <rect x="4" y="124" width="98" height="12" rx="4" fill="#7A4A22" />
              <path d="M28 232 V188 a25 25 0 0 1 50 0 V232 Z" fill="#1A0D08" />
              <ellipse cx="53" cy="226" rx="34" ry="18" fill="url(#ws-glow)" className="elf-flicker" />
              <g className="ws-fire" style={{ transformOrigin: "53px 230px" }}>
                <path d="M38 230 C 34 214 46 208 44 196 C 52 204 50 212 56 214 C 54 202 62 196 60 186 C 72 200 72 216 68 230 Z" fill="url(#ws-flame)" />
              </g>
              <rect x="34" y="226" width="40" height="7" rx="3" fill="#5A3418" />
              {/* meias */}
              {[[22, "#E01E37"], [62, "#2DC653"]].map(([x, c]) => (
                <g key={x as number} transform={`translate(${x} 136)`}>
                  <path d="M0 0 H14 V20 Q14 28 22 28 Q26 34 18 36 H6 Q0 36 0 28 Z" fill={c as string} />
                  <rect x="-1" y="-1" width="16" height="6" rx="2" fill="#FFFFFF" />
                </g>
              ))}
            </g>

            {/* varal de luzinhas */}
            <path d="M0 14 Q 90 40 180 16 T 360 16" fill="none" stroke="#1F5A2E" strokeWidth="5" strokeLinecap="round" />
            {Array.from({ length: 13 }, (_, i) => {
              const x = 14 + i * 27.5;
              const y = 18 + Math.sin((x / 360) * Math.PI * 2) * -8 + (x < 180 ? Math.sin((x / 180) * Math.PI) * 10 : Math.sin(((x - 180) / 180) * Math.PI) * 3);
              const c = ["#FFD166", "#EF233C", "#4CC9F0", "#FF7AA2", "#7CE38B"][i % 5];
              return (
                <g key={i} className="lt-bulb" style={{ animationDelay: `${(i % 6) * 0.3}s` }}>
                  <circle cx={x} cy={y + 6} r="7" fill={c} opacity="0.35" />
                  <ellipse cx={x} cy={y + 6} rx="3.2" ry="4.2" fill={c} />
                </g>
              );
            })}

            {/* brilho da vela */}
            <circle cx="140" cy="160" r="95" fill="url(#ws-glow)" className="elf-flicker" opacity="0.65" />

            {/* ===== duende Pipoca (atrás da mesa) ===== */}
            <motion.g
              key={jump}
              onClick={tapElf}
              style={{ cursor: "pointer" }}
              animate={jump ? { y: [0, -26, 0, -8, 0] } : { y: [0, -1.5, 0] }}
              transition={jump ? { duration: 0.7 } : { duration: 1.8, repeat: Infinity }}
              id="elf-btn"
              role="button"
              aria-label="Tocar no duende Pipoca"
            >
              {/* corpo */}
              <path d="M112 200 Q 116 160 150 156 Q 184 160 188 200 Z" fill="url(#ws-tunic)" />
              <path d="M128 160 L136 170 L143 160 L150 171 L157 160 L164 170 L172 160 L176 166 Q150 176 124 166 Z" fill="#E01E37" />
              {[136, 150, 164].map((x) => (
                <circle key={x} cx={x} cy="171" r="2.4" fill="#FFD166" />
              ))}
              {/* braço esquerdo apoiado */}
              <path d="M120 176 Q 110 192 124 198" stroke="#1F9A4D" strokeWidth="13" fill="none" strokeLinecap="round" />
              <circle cx="128" cy="198" r="7" fill="url(#ws-skin)" />
              {/* orelhas */}
              <path d="M121 112 Q 96 96 92 88 Q 104 116 124 126 Z" fill="url(#ws-skin)" />
              <path d="M117 110 Q 104 102 99 96 Q 108 112 120 119 Z" fill="#F4A6A0" opacity="0.6" />
              <path d="M179 112 Q 204 96 208 88 Q 196 116 176 126 Z" fill="url(#ws-skin)" />
              <path d="M183 110 Q 196 102 201 96 Q 192 112 180 119 Z" fill="#F4A6A0" opacity="0.6" />
              {/* cabeça */}
              <circle cx="150" cy="118" r="31" fill="url(#ws-skin)" />
              {/* cabelo ruivo saindo do gorro */}
              <path d="M122 104 q6 10 12 2 q6 10 12 2 q6 10 12 2 q6 10 12 2 q6 10 10 0 q-4 -10 -28 -12 q-24 2 -30 6 Z" fill="#C8642B" />
              {/* olhos grandes */}
              <motion.g animate={{ scaleY: [1, 1, 0.1, 1] }} transition={{ duration: 3.4, repeat: Infinity, times: [0, 0.9, 0.95, 1] }} style={{ transformOrigin: "150px 118px" }}>
                <ellipse cx="139" cy="118" rx="5.2" ry="6.6" fill="#2B1B17" />
                <ellipse cx="161" cy="118" rx="5.2" ry="6.6" fill="#2B1B17" />
                <circle cx="141" cy="115.5" r="2" fill="#FFFFFF" />
                <circle cx="163" cy="115.5" r="2" fill="#FFFFFF" />
                <circle cx="137.6" cy="120.6" r="0.9" fill="#FFFFFF" />
                <circle cx="159.6" cy="120.6" r="0.9" fill="#FFFFFF" />
              </motion.g>
              <path d="M132 108 q7 -4 13 0" stroke="#8A4A22" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M155 108 q7 -4 13 0" stroke="#8A4A22" strokeWidth="2" fill="none" strokeLinecap="round" />
              {/* bochechas, sardinhas, nariz e sorriso */}
              <ellipse cx="131" cy="130" rx="6" ry="4" fill="#FF8FA3" opacity="0.65" />
              <ellipse cx="169" cy="130" rx="6" ry="4" fill="#FF8FA3" opacity="0.65" />
              {[[127, 127], [131, 125], [135, 128], [165, 128], [169, 125], [173, 127]].map(([x, y]) => (
                <circle key={`${x}${y}`} cx={x} cy={y} r="0.9" fill="#C8642B" opacity="0.7" />
              ))}
              <ellipse cx="150" cy="127" rx="4.5" ry="3.6" fill="#F4A98A" />
              <path d={say ? "M140 134 Q150 148 160 134 Z" : "M140 135 Q150 144 160 135"} fill={say ? "#9B021A" : "none"} stroke="#9B021A" strokeWidth="2.4" strokeLinecap="round" />
              {say && <path d="M144 138 Q150 142 156 138" fill="#FF8FA3" />}
              {/* gorro com ponta caída e guizo */}
              <path d="M117 100 Q 122 62 158 56 Q 200 52 214 84 Q 196 72 186 86 Q 184 98 183 100 Z" fill="url(#ws-hat)" />
              <path d="M150 60 Q 170 58 184 72" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M114 100 Q 150 88 186 100 Q 188 110 184 112 Q 150 100 116 112 Q 112 108 114 100 Z" fill="#FFFFFF" />
              <motion.g animate={{ rotate: [0, 16, -8, 0] }} transition={{ duration: 1.4, repeat: Infinity }} style={{ transformOrigin: "214px 84px" }}>
                <circle cx="215" cy="90" r="7" fill="#FFD166" stroke="#E9B949" strokeWidth="1.5" />
                <circle cx="215" cy="93" r="1.8" fill="#8A5A00" />
                <circle cx="212.5" cy="87.5" r="1.6" fill="#FFFFFF" opacity="0.8" />
              </motion.g>
            </motion.g>

            {/* mesa */}
            <rect x="96" y="196" width="252" height="16" rx="6" fill="url(#ws-desk)" />
            <rect x="104" y="212" width="236" height="58" fill="#6B4320" />
            <rect x="120" y="222" width="90" height="34" rx="4" fill="#5A3418" />
            <rect x="226" y="222" width="98" height="34" rx="4" fill="#5A3418" />
            <circle cx="165" cy="239" r="3" fill="#FFD166" />
            <circle cx="275" cy="239" r="3" fill="#FFD166" />

            {/* vela */}
            <rect x="106" y="174" width="12" height="24" rx="2" fill="#FFF6E5" />
            <path d="M104 196 H120 V200 H104 Z" fill="#E9B949" />
            <g className="ws-candle" style={{ transformOrigin: "112px 174px" }}>
              <path d="M112 160 C 106 168 108 174 112 175 C 116 174 118 168 112 160 Z" fill="url(#ws-flame)" />
            </g>
            <circle cx="112" cy="168" r="14" fill="#FFD166" opacity="0.18" className="elf-flicker" />

            {/* pilha de cartas com selo */}
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${300 - i * 3} ${182 - i * 6}) rotate(${-6 + i * 5})`}>
                <rect x="-20" y="-6" width="40" height="22" rx="2" fill={i === 2 ? "#FFFFFF" : "#F7EEDC"} stroke="#E1CFA8" />
                <path d="M-20 -6 L0 6 L20 -6" fill="none" stroke="#E1CFA8" />
                <circle cx="0" cy="6" r="3.6" fill="#D90429" />
              </g>
            ))}

            {/* pergaminho que vai sendo escrito */}
            <g transform="translate(190 148) rotate(-5)">
              <rect x="0" y="0" width="84" height="52" rx="4" fill="url(#ws-paper)" stroke="#E9B949" strokeWidth="1.6" />
              <rect x="-4" y="-3" width="92" height="7" rx="3.5" fill="#E8D3A2" />
              <rect x="-4" y="48" width="92" height="7" rx="3.5" fill="#E8D3A2" />
              {[0, 1, 2, 3, 4].map((i) => {
                const full = 68 - (i === 4 ? 30 : 0);
                const w = Math.max(0, Math.min(full, ((progress - i * 16) / 16) * full));
                return <rect key={i} x="8" y={8 + i * 7.5} width={w} height="2.4" rx="1.2" fill="#9B021A" opacity="0.8" />;
              })}
              <circle cx="72" cy="42" r="5" fill="#D90429" opacity={progress > 80 ? 1 : 0.12} />
            </g>
            {/* braço direito escrevendo com a pena */}
            <motion.g animate={{ rotate: [-4, 6, -2, 8, -4], x: [0, 6, 12, 18, 0] }} transition={{ duration: 2.2, repeat: Infinity }} style={{ transformOrigin: "180px 172px" }}>
              <path d="M178 170 Q 196 176 206 186" stroke="#1F9A4D" strokeWidth="13" fill="none" strokeLinecap="round" />
              <circle cx="208" cy="188" r="7" fill="url(#ws-skin)" />
              <path d="M209 186 L 226 150 Q 236 140 230 158 Z" fill="#FFFFFF" stroke="#D8C8B0" strokeWidth="1" />
              <path d="M210 184 L226 152" stroke="#C9B8A0" strokeWidth="0.8" />
            </motion.g>
            {/* pozinho mágico subindo da carta */}
            {Array.from({ length: 6 }, (_, i) => (
              <text key={i} x={204 + i * 11} y="150" fontSize="8" fill="#FFE9A8" className="ws-sparkle" style={{ animationDelay: `${i * 0.45}s` }}>
                ✦
              </text>
            ))}

            {/* vinheta suave */}
            <rect width="360" height="270" fill="none" stroke="#000000" strokeOpacity="0.25" strokeWidth="18" />
          </svg>

          <AnimatePresence>
            {say && (
              <motion.div
                className="absolute left-[36%] top-[6%] bg-white text-[#1C2541] text-xs font-extrabold rounded-2xl rounded-bl-sm px-3 py-2 shadow-xl"
                initial={{ opacity: 0, scale: 0.6, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {say}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* etapas */}
        <div className="mt-4 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-sm px-4 pt-2 pb-4">
        <div className="h-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={slow ? "slow" : step}
              className="text-sm sm:text-base font-bold text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {slow ? "✨ O Papai Noel está caprichando… só mais um pouquinho!" : steps[step]}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="relative h-3 rounded-full bg-white/10 overflow-hidden mx-2">
          <div className="h-full rounded-full bg-gradient-to-r from-[#2DC653] via-[#FFD166] to-[#EF233C] transition-[width] duration-300 relative" style={{ width: `${progress}%` }}>
            <span className="absolute inset-0 ws-shine" />
          </div>
        </div>
        </div>

        <p className="mt-4 text-xs text-[#FFE9A8]">
          👆 Toque no duende ou pegue os presentes que caem para ajudar!{" "}
          {caught > 0 && (
            <b className="text-white" id="elf-caught">
              🎁 {caught} {caught === 1 ? "presente" : "presentes"}
            </b>
          )}
        </p>
        <p className="mt-3 text-[11px] text-white/60 leading-snug px-4">
          <b className="text-white/80">Você sabia?</b> {fact}
        </p>
      </div>
    </motion.div>
  );
}
