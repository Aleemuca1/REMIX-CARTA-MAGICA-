import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Volume2 } from "lucide-react";
import { letterTheme } from "../lib/letterThemes";

/** Duas cartas de exemplo que se revezam no topo da página: mostram cores, nome destacado e a missão secreta. */
const SAMPLES = [
  {
    name: "Sofia",
    age: 6,
    city: "Belo Horizonte",
    theme: "rosa",
    tag: "🎀 Rosa Encantado",
    hello: "Ho Ho Ho! Olá, Sofia!",
    body:
      "Quando os duendes leram que você aprendeu a ler sozinha, a Mamãe Noel deu um pulinho de alegria e derrubou o chocolate quente na minha barba!",
    mission: "Leia uma historinha para alguém da sua casa antes de dormir.",
    bye: "Vou mandar um tchauzinho lá do trenó, Sofia!",
  },
  {
    name: "Pedro",
    age: 8,
    city: "São Paulo",
    theme: "azul",
    tag: "❄️ Azul Gelo",
    hello: "Ho Ho Ho! Olá, Pedro!",
    body:
      "Fiquei sabendo que você passou de ano e mandou muito bem na matemática. As renas até tentaram fazer contas com os cascos... e erraram tudo!",
    mission: "Ajude a montar a árvore de Natal e escolha onde fica a estrela.",
    bye: "Fique de olho no céu na véspera, Pedro!",
  },
];

const Name = ({ text, name }: { text: string; name: string }) => {
  const parts = text.split(name);
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && <span className="name-glow">{name}</span>}
        </span>
      ))}
    </>
  );
};

export default function HeroLetters({ onListen, onCreate }: { onListen: () => void; onCreate: () => void }) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % SAMPLES.length), 6500);
    return () => clearInterval(t);
  }, [reduce, paused]);

  const s = SAMPLES[idx];
  const back = SAMPLES[(idx + 1) % SAMPLES.length];
  const T = letterTheme(s.theme);
  const TB = letterTheme(back.theme);

  return (
    <div
      className="relative w-full max-w-[360px] sm:max-w-[410px] xl:max-w-[430px] mx-auto pt-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      id="hero-sample-letter-card"
    >
      {/* carta de trás, espiando */}
      <motion.div
        aria-hidden="true"
        key={`back-${back.name}`}
        initial={reduce ? false : { opacity: 0, rotate: 0 }}
        animate={{ opacity: 1, rotate: 6, x: 18, y: -6 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-x-3 top-4 bottom-10 rounded-3xl border-4 parchment-bg shadow-xl"
        style={{ borderColor: TB.frame }}
      >
        <div className="absolute inset-0 rounded-[20px]" style={{ background: TB.tint }} />
        <span className="absolute top-3 right-4 font-xmas text-xl font-bold" style={{ color: TB.ink }}>
          {back.name} ✨
        </span>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={s.name}
          initial={reduce ? false : { opacity: 0, rotateY: -70, x: -30 }}
          animate={{ opacity: 1, rotateY: 0, x: 0, rotate: -1.5 }}
          exit={reduce ? undefined : { opacity: 0, rotateY: 70, x: 40, transition: { duration: 0.35 } }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          style={{ transformPerspective: 1100, "--ink": T.ink, "--accent": T.accent, "--frame": T.frame } as React.CSSProperties}
          className="relative z-20 parchment-bg text-[#2B2118] rounded-3xl p-5 sm:p-6 border-4 magical-shadow letter-glow"
        >
          <div className="absolute inset-0 rounded-[20px] pointer-events-none" style={{ background: T.tint }} aria-hidden="true" />
          {/* brilhinhos */}
          {[[6, 8, 0], [92, 14, 0.9], [88, 70, 1.7], [4, 82, 2.3]].map(([l, t, d], k) => (
            <span key={k} aria-hidden="true" className="letter-sparkle" style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${d}s`, fontSize: 14 }}>
              ✦
            </span>
          ))}

          <div className="relative">
            {/* selo de cera */}
            <motion.div
              initial={reduce ? false : { scale: 2.4, rotate: -40, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ delay: 0.45, type: "spring", stiffness: 260, damping: 13 }}
              className="absolute -top-9 -right-8 sm:-top-10 sm:-right-9 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center border-2 border-[#FFD166] text-[#FFD166] shadow-lg"
              style={{ background: `radial-gradient(circle at 35% 35%, ${T.seal[0]}, ${T.seal[1]})` }}
            >
              <span className="font-cinzel text-[8px] font-extrabold leading-none">POLO NORTE</span>
              <span className="font-mono text-[10px] font-bold text-white leading-none mt-0.5">2026</span>
            </motion.div>

            <div className="flex items-center gap-2 border-b border-[#1C2541]/15 pb-2.5 mb-3 pr-10">
              <span className="font-cinzel text-[9px] sm:text-[10px] font-extrabold tracking-[0.18em] uppercase" style={{ color: T.ink }}>
                ✦ Correio Real do Polo Norte
              </span>

            </div>

            <div className="inline-flex items-center gap-1.5 rounded-xl border border-dashed px-2.5 py-1 mb-2" style={{ borderColor: T.accent + "66", background: T.soft }}>
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: T.ink }}>Para</span>
              <span className="font-ps text-xl leading-none font-bold" style={{ color: T.ink }}>{s.name}</span>
              <span className="text-[10px] font-bold text-[#1C2541]/60">
                {s.age} anos · 📍 {s.city}
              </span>
            </div>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="font-xmas text-[26px] sm:text-[30px] font-bold leading-tight"
              style={{ color: T.ink }}
            >
              <Name text={s.hello} name={s.name} />
            </motion.p>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-letter drop-cap text-[14.5px] sm:text-[15.5px] leading-[1.7] mt-1.5"
            >
              {s.body}
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.85, type: "spring", stiffness: 220, damping: 16 }}
              className="mission-card mt-3 rounded-2xl border-2 border-dashed px-3 py-2"
              style={{ borderColor: T.ink + "66" }}
            >
              <span className="block font-cinzel text-[9px] font-extrabold tracking-[0.18em]" style={{ color: T.ink }}>
                🎯 MISSÃO SECRETA DE NATAL
              </span>
              <span className="font-letter text-[13px] sm:text-sm leading-snug">{s.mission}</span>
            </motion.div>

            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.15 }}
              className="font-ps text-[22px] sm:text-[24px] font-bold text-center leading-snug mt-3"
              style={{ color: T.ink }}
            >
              <Name text={s.bye} name={s.name} />
            </motion.p>

            <div className="mt-2 pt-2 border-t border-[#1C2541]/15 flex items-end justify-between">
              <span className="text-[10px] font-bold" style={{ color: T.ink }}>
                ✓ Aprovado no Livro Dourado
              </span>
              <span className="font-handwriting text-2xl sm:text-3xl font-bold foil-text" style={{ color: T.ink }}>
                Papai Noel
              </span>
            </div>

            <div className="mt-2 pt-2 flex items-center justify-between text-[11px] font-bold border-t border-dashed border-[#1C2541]/20" style={{ color: T.ink }}>
              <button onClick={onListen} className="hover:underline inline-flex items-center gap-1 cursor-pointer" id="hero-listen-sample-btn">
                <Volume2 className="w-3.5 h-3.5" /> Ouvir a voz do Papai Noel
              </button>
              <button onClick={onCreate} className="hover:underline cursor-pointer" id="hero-customize-btn">
                Fazer a do meu filho →
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* trocar de carta */}
      <div className="mt-4 flex items-center justify-center gap-2" role="tablist" aria-label="Cartas de exemplo">
        {SAMPLES.map((x, i) => {
          const th = letterTheme(x.theme);
          const on = i === idx;
          return (
            <button
              key={x.name}
              role="tab"
              aria-selected={on}
              onClick={() => setIdx(i)}
              className={`cursor-pointer rounded-full px-3 py-1 text-[11px] font-bold border transition-all ${on ? "scale-105 shadow-lg" : "opacity-70 hover:opacity-100"}`}
              style={on ? { background: th.frame, color: th.ink, borderColor: th.frame } : { background: "rgba(6,11,25,0.8)", color: "#EDF2F4", borderColor: "rgba(255,255,255,0.15)" }}
            >
              {x.name === "Pedro" ? "💌 Carta do Pedro" : "💌 Carta da Sofia"}
            </button>
          );
        })}
      </div>
      <p className="text-center mt-2 text-[11px] text-[#EDF2F4]/60">✨ Cada criança ganha a sua: com o nome, as conquistas e a cor preferida</p>
    </div>
  );
}
