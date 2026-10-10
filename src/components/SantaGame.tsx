import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { X, Play, RotateCcw, Sparkles, Trophy } from "lucide-react";
import Reveal from "./Reveal";
import { DeliveryGame, type GameResult } from "../game/deliveryGame";
import { musicBox } from "../lib/christmasMusic";

const BEST_KEY = "carta-magica-best";
const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};
const saveBest = (v: number) => {
  try {
    localStorage.setItem(BEST_KEY, String(v));
  } catch {
    /* navegador sem armazenamento: tudo bem */
  }
};

function rankFor(score: number) {
  if (score >= 2500) return { title: "Papai Noel Honorário", emoji: "🎅" };
  if (score >= 1500) return { title: "Chefe do Trenó", emoji: "🛷" };
  if (score >= 800) return { title: "Rena Veloz", emoji: "🦌" };
  if (score >= 300) return { title: "Duende Entregador", emoji: "🧝" };
  return { title: "Duende Aprendiz", emoji: "✨" };
}

// Escalas pentatônicas para os sons de acerto subirem com o combo
const HIT_NOTES = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93];

/** Seção da landing com o jogo "Entrega Relâmpago do Papai Noel". */
export default function SantaGame({ onCreateLetter }: { onCreateLetter: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="jogo">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#FFD166]/60 bg-gradient-to-br from-[#0E1A3A] via-[#0B132B] to-[#1C2541] p-6 sm:p-10 grid md:grid-cols-2 gap-8 items-center shadow-2xl">
          <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full bg-[#FFD166]/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0B132B] bg-[#FFD166] rounded-full px-3 py-1 mb-3">
              🎮 Jogo de Natal grátis
            </span>
            <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
              Entrega Relâmpago do Papai Noel
            </h2>
            <p className="text-sm sm:text-base text-[#EDF2F4]/80 mb-5 leading-relaxed">
              Pilote o trenó sobre o vilarejo e solte os presentes bem na boca das chaminés! Cuidado com o vento, faça
              combos e procure as <strong className="text-[#FFD166]">chaminés douradas ⭐</strong>. Você tem 60 segundos.
            </p>
            <ul className="text-xs sm:text-sm text-[#EDF2F4]/70 space-y-1.5 mb-6 inline-block text-left">
              <li>👆 Toque na tela, clique ou aperte <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">espaço</kbd> para soltar</li>
              <li>🎯 No centro da chaminé = PERFEITO</li>
              <li>🔥 Acertos seguidos multiplicam os pontos</li>
              <li>🫧 Acerte as bolhas mágicas: 🎁 triplo, 🧲 ímã, ⏰ tempo e 🌈 turbo</li>
              <li>🧒 Modo fácil para os pequenos (sem vento!)</li>
            </ul>
            <div>
              <button
                onClick={() => setOpen(true)}
                className="bg-gradient-to-r from-[#2DC653] to-[#1a9e3e] text-white font-extrabold px-8 py-4 rounded-full inline-flex items-center gap-2 shadow-lg border border-[#FFD166]/50 btn-shine animate-soft-pulse cursor-pointer text-lg"
                id="game-play-btn"
              >
                <Play className="w-5 h-5 relative z-10 fill-white" />
                <span className="relative z-10">Jogar agora</span>
              </button>
            </div>
          </div>

          {/* Mini cena animada de prévia */}
          <div className="relative z-10 h-56 sm:h-64 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#050A1A] to-[#1C2A55]">
            <GamePreview />
          </div>
        </div>
      </Reveal>

      <AnimatePresence>{open && <GameModal onClose={() => setOpen(false)} onCreateLetter={onCreateLetter} />}</AnimatePresence>
    </section>
  );
}

function GamePreview() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      {[...Array(18)].map((_, i) => (
        <span
          key={i}
          className="twinkle-star"
          style={{ top: `${(i * 37) % 60}%`, left: `${(i * 53) % 100}%`, width: 2, height: 2, animationDuration: `${2 + (i % 3)}s` }}
        />
      ))}
      <motion.div
        className="absolute text-5xl"
        style={{ top: "12%" }}
        animate={{ left: ["-20%", "110%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      >
        🛷
      </motion.div>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          animate={{ top: ["22%", "70%"], left: [`${20 + i * 25}%`, `${22 + i * 25}%`], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 1.6 + 0.5, repeatDelay: 3.4, ease: "easeIn" }}
        >
          🎁
        </motion.div>
      ))}
      <div className="absolute bottom-0 inset-x-0 flex items-end justify-around px-4">
        {["🏠", "🏡", "🏠", "🏘️"].map((h, i) => (
          <span key={i} className="text-5xl sm:text-6xl drop-shadow-[0_0_10px_rgba(255,209,102,0.4)]">
            {h}
          </span>
        ))}
      </div>
      <div className="absolute bottom-0 inset-x-0 h-3 bg-[#DCE8FA]" />
    </div>
  );
}

export function GameModal({
  onClose,
  onCreateLetter,
  onFinish,
}: {
  onClose: () => void;
  onCreateLetter: () => void;
  onFinish?: (r: GameResult) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<DeliveryGame | null>(null);
  const [phase, setPhase] = useState<"intro" | "count" | "play" | "over">("intro");
  const [count, setCount] = useState(3);
  const [name, setName] = useState("");
  const [easy, setEasy] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [best, setBest] = useState(readBest);
  const [newBest, setNewBest] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const game = new DeliveryGame(canvas);
    gameRef.current = game;
    if (import.meta.env.DEV) (window as any).__santaGame = game;
    game.onSound = (kind, streak) => {
      if (kind === "hit" || kind === "perfect") musicBox.chime(HIT_NOTES[Math.min(streak - 1, HIT_NOTES.length - 1)], undefined, 0.18);
      if (kind === "perfect") setTimeout(() => musicBox.chime(96, undefined, 0.1), 70);
      if (kind === "golden") [84, 88, 91, 96].forEach((n, i) => setTimeout(() => musicBox.chime(n, undefined, 0.16), i * 60));
      if (kind === "miss") musicBox.chime(55, undefined, 0.12);
      if (kind === "power") [79, 83, 86, 91, 95].forEach((n, i) => setTimeout(() => musicBox.chime(n, undefined, 0.14), i * 55));
      if (kind === "combo") [72, 76, 79, 84, 88, 91].forEach((n, i) => setTimeout(() => musicBox.chime(n, undefined, 0.15), i * 70));
    };
    const onResize = () => game.resize();
    window.addEventListener("resize", onResize);
    document.body.style.overflow = "hidden";
    return () => {
      game.stop();
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "";
    };
  }, []);

  const finish = useCallback((r: GameResult) => {
    onFinish?.(r);
    setResult(r);
    setPhase("over");
    const prev = readBest();
    if (r.score > prev) {
      saveBest(r.score);
      setBest(r.score);
      setNewBest(true);
    } else setNewBest(false);
    [72, 76, 79, 84].forEach((n, i) => setTimeout(() => musicBox.chime(n), i * 140));
    confetti({ particleCount: 140, spread: 100, origin: { y: 0.4 }, zIndex: 80, colors: ["#FFD166", "#EF233C", "#2DC653", "#FFFFFF"] });
  }, [onFinish]);

  const easyRef = useRef(false);
  easyRef.current = easy;
  const begin = () => {
    setPhase("count");
    setCount(3);
    let c = 3;
    musicBox.chime(72, undefined, 0.15);
    const t = setInterval(() => {
      c--;
      if (c > 0) {
        setCount(c);
        musicBox.chime(72, undefined, 0.15);
      } else {
        clearInterval(t);
        musicBox.chime(84, undefined, 0.2);
        setPhase("play");
        const g = gameRef.current!;
        g.onEnd = finish;
        g.resize();
        g.easy = easyRef.current;
        g.start();
      }
    }, 700);
  };

  // controles: toque, clique e teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (phase === "play" && (e.code === "Space" || e.key === "Enter" || e.key === "ArrowDown")) {
        e.preventDefault();
        gameRef.current?.drop();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onClose]);

  const rank = result ? rankFor(result.score) : null;
  const pilot = name.trim() || "Piloto";

  return (
    <motion.div
      className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-5xl aspect-[3/4] sm:aspect-[16/10] max-h-[92vh] rounded-3xl overflow-hidden border-2 border-[#FFD166] shadow-2xl bg-[#050A1A]"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none select-none"
          onPointerDown={(e) => {
            e.preventDefault();
            if (phase === "play") gameRef.current?.drop();
          }}
          aria-label="Área do jogo: toque para soltar um presente"
        />

        <button
          onClick={onClose}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 cursor-pointer"
          aria-label="Fechar jogo"
        >
          <X className="w-5 h-5" />
        </button>

        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <Overlay key="intro">
              <div className="text-6xl mb-2">🛷🎁</div>
              <h3 className="font-cinzel text-2xl sm:text-4xl font-bold text-white mb-2">Entrega Relâmpago</h3>
              <p className="text-sm sm:text-base text-[#EDF2F4]/80 mb-5 max-w-md">
                Toque na tela para soltar presentes nas chaminés. A linha pontilhada mostra onde o presente vai cair — mas
                o vento muda! Acerte as bolhas mágicas para ganhar poderes. 🫧
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4 w-full max-w-xs">
                {[
                  { v: true, t: "🧒 Fácil", d: "chaminés grandes, sem vento" },
                  { v: false, t: "🚀 Normal", d: "com vento e mais rápido" },
                ].map((o) => (
                  <button
                    key={o.t}
                    onClick={() => setEasy(o.v)}
                    className={`rounded-2xl px-3 py-2 border-2 cursor-pointer text-left ${easy === o.v ? "border-[#FFD166] bg-[#FFD166]/15" : "border-white/20 bg-white/5"}`}
                  >
                    <span className="block text-white font-bold text-sm">{o.t}</span>
                    <span className="block text-[11px] text-white/60">{o.d}</span>
                  </button>
                ))}
              </div>
              <label className="text-xs text-[#FFD166] font-bold uppercase tracking-wider mb-1">Nome do piloto</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 20))}
                placeholder="Ex: Sofia"
                className="bg-white/10 border border-white/30 rounded-full px-5 py-2.5 text-white text-center mb-5 focus:outline-none focus:border-[#FFD166] w-60"
                onKeyDown={(e) => e.key === "Enter" && begin()}
              />
              <button onClick={begin} className="bg-gradient-to-r from-[#2DC653] to-[#1a9e3e] text-white font-extrabold px-10 py-4 rounded-full text-lg inline-flex items-center gap-2 shadow-lg border border-[#FFD166]/50 btn-shine cursor-pointer" id="game-start-btn">
                <Play className="w-5 h-5 relative z-10 fill-white" />
                <span className="relative z-10">Começar!</span>
              </button>
              {best > 0 && <p className="text-xs text-[#EDF2F4]/60 mt-4">🏆 Seu recorde: {best} pontos</p>}
            </Overlay>
          )}

          {phase === "count" && (
            <motion.div key="count" className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={count}
                  className="font-cinzel text-8xl sm:text-9xl font-extrabold text-[#FFD166] drop-shadow-[0_0_30px_rgba(255,209,102,0.8)]"
                  initial={{ scale: 2.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {count}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          )}

          {phase === "over" && result && rank && (
            <Overlay key="over">
              <motion.div className="text-6xl mb-1" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 12 }}>
                {rank.emoji}
              </motion.div>
              <p className="text-xs uppercase tracking-widest text-[#FFD166] font-bold">Ho Ho Ho! Parabéns, {pilot}!</p>
              <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white mt-1">{rank.title}</h3>
              <motion.p className="font-cinzel text-5xl sm:text-6xl font-extrabold text-[#FFD166] my-2" initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                {result.score}
              </motion.p>
              {newBest && (
                <p className="inline-flex items-center gap-1 text-xs font-bold text-[#0B132B] bg-[#FFD166] rounded-full px-3 py-1 mb-2">
                  <Trophy className="w-3.5 h-3.5" /> Novo recorde!
                </p>
              )}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center my-3 text-white">
                <Stat label="presentes" value={result.delivered} />
                <Stat label="perfeitos" value={result.perfect} />
                <Stat label="maior combo" value={result.bestStreak} />
              </div>
              <p className="text-xs sm:text-sm text-[#EDF2F4]/75 max-w-sm mb-4">
                O Papai Noel viu tudo pelo telescópio! Que tal receber uma carta dele contando essa conquista?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={begin} className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-6 py-3 rounded-full inline-flex items-center justify-center gap-2 cursor-pointer" id="game-retry-btn">
                  <RotateCcw className="w-4 h-4" /> Jogar de novo
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onCreateLetter();
                  }}
                  className="bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] text-white font-bold px-6 py-3 rounded-full inline-flex items-center justify-center gap-2 border border-[#FFD166]/50 btn-shine cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#FFD166] relative z-10" />
                  <span className="relative z-10">Criar carta do Papai Noel</span>
                </button>
              </div>
            </Overlay>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-5 bg-[#050A1A]/75 backdrop-blur-[2px] overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
      <div className="text-xl sm:text-2xl font-extrabold">{value}</div>
      <div className="text-[10px] sm:text-xs text-[#EDF2F4]/60">{label}</div>
    </div>
  );
}
