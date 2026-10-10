import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { Volume2, Square, Check, RotateCcw } from "lucide-react";
import { musicBox } from "../../lib/christmasMusic";
import { narrate, type Narrator } from "../../lib/narration";
import SnowmanBuilder from "./SnowmanBuilder";

type Done = () => void;
export const celebrate = () => {
  confetti({ particleCount: 110, spread: 90, origin: { y: 0.5 }, zIndex: 95, colors: ["#FFD166", "#EF233C", "#2DC653", "#FFFFFF"] });
  [79, 84, 88].forEach((n, i) => setTimeout(() => musicBox.chime(n, undefined, 0.16), i * 110));
};
const btn =
  "bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] text-white font-bold px-6 py-3 rounded-full inline-flex items-center justify-center gap-2 border border-[#FFD166]/50 btn-shine cursor-pointer";

/* ------------------------------------------------------------------ Mensagem */
export function MessageActivity({ from, text, onDone }: { from: string; text: string; onDone: Done }) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const nar = useRef<Narrator | null>(null);
  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => {
      clearTimeout(t);
      nar.current?.stop();
    };
  }, [onDone]);
  const listen = async () => {
    if (state !== "idle") {
      nar.current?.stop();
      setState("idle");
      return;
    }
    setState("loading");
    nar.current = await narrate(text, "", () => setState("idle"));
    setState((s) => (s === "loading" ? "playing" : s));
  };
  return (
    <div className="parchment-bg text-[#1C2541] rounded-2xl p-5 sm:p-7 border-2 border-[#FFD166] shadow-xl text-left">
      <p className="font-cinzel text-xs font-bold text-[#9B021A] mb-2">De: {from}</p>
      {text.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚ{])/).map((s, i) => (
        <motion.span key={i} className="font-serif text-sm sm:text-base leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.35 }}>
          {s}{" "}
        </motion.span>
      ))}
      <div className="mt-4 flex justify-between items-end">
        <button onClick={listen} className="bg-[#1C2541] text-white text-xs sm:text-sm rounded-full px-4 py-2 inline-flex items-center gap-2 cursor-pointer">
          {state === "idle" ? <Volume2 className="w-4 h-4 text-[#FFD166]" /> : <Square className="w-3.5 h-3.5 fill-[#FFD166] text-[#FFD166]" />}
          {state === "idle" ? "Ouvir" : state === "loading" ? "Carregando..." : "Parar"}
        </button>
        <span className="font-handwriting text-3xl text-[#9B021A]">{from}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Adivinha */
export function QuizActivity({ question, options, answer, fact, onDone }: { question: string; options: string[]; answer: number; fact: string; onDone: Done }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const choose = (i: number) => {
    if (picked !== null) return;
    if (i === answer) {
      setPicked(i);
      celebrate();
      onDone();
    } else {
      setWrong(i);
      musicBox.chime(55, undefined, 0.12);
      setTimeout(() => setWrong(null), 600);
    }
  };
  return (
    <div className="text-center">
      <p className="text-white text-base sm:text-lg font-semibold mb-5">{question}</p>
      <div className="grid gap-3">
        {options.map((o, i) => (
          <motion.button
            key={o}
            onClick={() => choose(i)}
            animate={wrong === i ? { x: [0, -10, 10, -6, 6, 0] } : {}}
            className={`rounded-2xl px-5 py-3.5 font-bold border-2 cursor-pointer transition-colors ${
              picked === i ? "bg-[#2DC653] border-[#2DC653] text-white" : wrong === i ? "bg-[#EF233C]/30 border-[#EF233C] text-white" : "bg-white/5 border-white/15 text-white hover:border-[#FFD166]"
            }`}
          >
            {picked === i && <Check className="inline w-5 h-5 mr-1" />} {o}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {picked !== null && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 text-[#FFD166] text-sm">
            🎉 Acertou! {fact}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ Bondade */
export function KindnessActivity({ challenge, tip, done, onDone }: { challenge: string; tip: string; done: boolean; onDone: Done }) {
  const [ok, setOk] = useState(done);
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-widest text-[#FFD166] font-bold mb-2">Missão de hoje</p>
      <p className="text-white text-lg sm:text-xl font-semibold mb-2">{challenge}</p>
      <p className="text-[#EDF2F4]/60 text-sm mb-6">{tip}</p>
      {ok ? (
        <motion.p initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-[#2DC653] font-bold text-lg">
          ⭐ Missão cumprida! O Papai Noel anotou no Livro Dourado.
        </motion.p>
      ) : (
        <button
          className={btn}
          onClick={() => {
            setOk(true);
            celebrate();
            onDone();
          }}
        >
          <span className="relative z-10">Eu fiz! ⭐</span>
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Memória */
const MEM_ICONS = ["🎁", "🦌", "⛄", "🎄", "🔔", "🍪", "⭐", "🧦", "🎅", "🕯️"];
export function MemoryActivity({ pairs, onDone }: { pairs: number; onDone: Done }) {
  const deck = useMemo(() => {
    const icons = MEM_ICONS.slice(0, pairs);
    return [...icons, ...icons].map((icon, i) => ({ id: i, icon })).sort(() => Math.random() - 0.5);
  }, [pairs]);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || found.includes(deck[i].icon)) return;
    musicBox.chime(76 + (i % 5) * 2, undefined, 0.08);
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (deck[a].icon === deck[b].icon) {
        const f = [...found, deck[a].icon];
        setTimeout(() => {
          setFound(f);
          setOpen([]);
          musicBox.chime(88, undefined, 0.14);
          if (f.length === pairs) {
            celebrate();
            onDone();
          }
        }, 350);
      } else setTimeout(() => setOpen([]), 800);
    }
  };
  const cols = pairs <= 6 ? "grid-cols-4" : "grid-cols-4";
  return (
    <div className="text-center">
      <p className="text-[#EDF2F4]/70 text-sm mb-3">Encontre os pares! Jogadas: {moves}</p>
      <div className={`grid ${cols} gap-2 sm:gap-3 max-w-sm mx-auto`} style={{ perspective: 800 }}>
        {deck.map((c, i) => {
          const shown = open.includes(i) || found.includes(c.icon);
          return (
            <motion.button
              key={c.id}
              onClick={() => flip(i)}
              className="relative aspect-square cursor-pointer"
              animate={{ rotateY: shown ? 180 : 0 }}
              transition={{ duration: 0.35 }}
              style={{ transformStyle: "preserve-3d" }}
              aria-label="carta"
            >
              <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#D90429] to-[#7A0015] border-2 border-[#FFD166]/60 flex items-center justify-center text-[#FFD166] text-xl" style={{ backfaceVisibility: "hidden" }}>
                ✦
              </span>
              <span
                className={`absolute inset-0 rounded-xl border-2 flex items-center justify-center text-3xl sm:text-4xl ${found.includes(c.icon) ? "bg-[#2DC653]/25 border-[#2DC653]" : "bg-[#FCF9F2] border-[#FFD166]"}`}
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                {c.icon}
              </span>
            </motion.button>
          );
        })}
      </div>
      {found.length === pairs && <p className="mt-4 text-[#FFD166] font-bold">🎉 Memória de duende! Você achou todos em {moves} jogadas.</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ Pegue os flocos */
export function CatchActivity({ goal, seconds, golden, onDone }: { goal: number; seconds: number; golden?: boolean; onDone: Done }) {
  const [phase, setPhase] = useState<"ready" | "play" | "end">("ready");
  const [time, setTime] = useState(seconds);
  const [score, setScore] = useState(0);
  const [flakes, setFlakes] = useState<{ id: number; left: number; dur: number; size: number }[]>([]);
  const idRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (phase !== "play") return;
    const spawn = setInterval(() => {
      idRef.current++;
      const f = { id: idRef.current, left: 5 + Math.random() * 85, dur: 2.6 + Math.random() * 2.2, size: 28 + Math.random() * 18 };
      setFlakes((arr) => [...arr.slice(-14), f]);
    }, 420);
    const clock = setInterval(() => setTime((t) => t - 1), 1000);
    return () => {
      clearInterval(spawn);
      clearInterval(clock);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "play" && time <= 0) {
      setPhase("end");
      setFlakes([]);
    }
  }, [time, phase]);

  const hit = (id: number) => {
    setFlakes((arr) => arr.filter((f) => f.id !== id));
    setScore((s) => {
      const n = s + 1;
      musicBox.chime(76 + (n % 8) * 2, undefined, 0.1);
      if (n >= goal && !doneRef.current) {
        doneRef.current = true;
        celebrate();
        onDone();
      }
      return n;
    });
  };

  return (
    <div className="text-center">
      <div className="flex justify-between text-sm font-bold text-white mb-2 px-1">
        <span>❄ {score} / {goal}</span>
        <span>⏱ {Math.max(0, time)}s</span>
      </div>
      <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#050A1A] to-[#1C2A55] select-none">
        {phase === "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
            <p className="text-white">Toque nos {golden ? "flocos dourados" : "flocos de neve"} antes que caiam no chão! Meta: {goal}</p>
            <button className={btn} onClick={() => setPhase("play")}>
              <span className="relative z-10">Começar!</span>
            </button>
          </div>
        )}
        {phase === "end" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 bg-black/40">
            <p className="text-2xl font-extrabold text-[#FFD166]">{score >= goal ? "🎉 Conseguiu!" : "Quase lá!"}</p>
            <p className="text-white">Você pegou {score} flocos.</p>
            <button
              className="bg-white/10 border border-white/30 text-white rounded-full px-5 py-2.5 inline-flex items-center gap-2 cursor-pointer"
              onClick={() => {
                setScore(0);
                setTime(seconds);
                setPhase("play");
              }}
            >
              <RotateCcw className="w-4 h-4" /> Jogar de novo
            </button>
          </div>
        )}
        {flakes.map((f) => (
          <button
            key={f.id}
            onPointerDown={() => hit(f.id)}
            className="absolute top-0 catch-flake cursor-pointer"
            style={{ left: `${f.left}%`, fontSize: f.size, animationDuration: `${f.dur}s`, filter: golden ? "drop-shadow(0 0 8px #FFD166)" : "drop-shadow(0 0 6px #8EC5FF)" }}
            onAnimationEnd={() => setFlakes((arr) => arr.filter((x) => x.id !== f.id))}
            aria-label="floco"
          >
            {golden ? "🌟" : "❄️"}
          </button>
        ))}
        <div className="absolute bottom-0 inset-x-0 h-4 bg-[#DCE8FA]" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Sininhos */
const BELL_NOTES = [60, 62, 64, 65, 67, 69, 71, 72];
const BELL_NAMES = ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si", "Dó"];
const BELL_COLORS = ["#EF233C", "#F77F00", "#FFD166", "#2DC653", "#4CC9F0", "#4361EE", "#9D4EDD", "#F72585"];
const SONGS = {
  // índices dos sinos
  jingle: [2, 2, 2, 2, 2, 2, 2, 4, 0, 1, 2],
  silent: [4, 5, 4, 2, 4, 5, 4, 2],
};
export function BellsActivity({ song, onDone }: { song: "jingle" | "silent"; onDone: Done }) {
  const seq = SONGS[song];
  const [step, setStep] = useState(0);
  const [ringing, setRinging] = useState<number | null>(null);
  const finished = step >= seq.length;
  const ring = (i: number) => {
    musicBox.chime(BELL_NOTES[i] + 12, undefined, 0.22);
    setRinging(i);
    setTimeout(() => setRinging(null), 250);
    if (finished) return;
    if (i === seq[step]) {
      const n = step + 1;
      setStep(n);
      if (n === seq.length) {
        setTimeout(() => {
          celebrate();
          onDone();
        }, 300);
      }
    }
  };
  return (
    <div className="text-center">
      <p className="text-white mb-1">
        Toque os sininhos na ordem para tocar <strong className="text-[#FFD166]">{song === "jingle" ? "Jingle Bells" : "Noite Feliz"}</strong>!
      </p>
      <p className="text-[#EDF2F4]/60 text-xs mb-4">O sininho que brilha é o próximo. ({Math.min(step, seq.length)}/{seq.length})</p>
      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto">
        {BELL_NOTES.map((_, i) => {
          const next = !finished && seq[step] === i;
          return (
            <motion.button
              key={i}
              onPointerDown={() => ring(i)}
              animate={ringing === i ? { rotate: [0, -18, 14, -8, 0] } : next ? { scale: [1, 1.08, 1] } : {}}
              transition={next && ringing !== i ? { duration: 0.9, repeat: Infinity } : { duration: 0.4 }}
              className="rounded-2xl py-3 flex flex-col items-center gap-1 cursor-pointer border-2"
              style={{
                background: `${BELL_COLORS[i]}33`,
                borderColor: next ? "#FFFFFF" : `${BELL_COLORS[i]}88`,
                boxShadow: next ? `0 0 20px ${BELL_COLORS[i]}` : "none",
              }}
            >
              <span className="text-3xl sm:text-4xl">🔔</span>
              <span className="text-xs font-bold text-white">{BELL_NAMES[i]}</span>
            </motion.button>
          );
        })}
      </div>
      {finished && <p className="mt-4 text-[#FFD166] font-bold">🎶 Que lindo! Os duendes aplaudiram de pé!</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ Boneco de neve */
export function SnowmanActivity({ onDone }: { onDone: Done }) {
  return (
    <SnowmanBuilder
      onDone={() => {
        celebrate();
        onDone();
      }}
    />
  );
}
