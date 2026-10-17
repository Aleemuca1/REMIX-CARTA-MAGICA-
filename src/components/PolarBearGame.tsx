import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { Play, RotateCcw, Trophy } from "lucide-react";
import Reveal from "./Reveal";
import BackButton from "./BackButton";
import { useBackClose } from "../lib/backClose";
import { musicBox } from "../lib/christmasMusic";
import { PolarGame, type PolarResult } from "../game/polarGame";
import SantaCongrats from "./SantaCongrats";
import { loadPlayer, savePlayer, medalFor, type Medal } from "../lib/player";

const BEST_KEY = "carta-magica-urso-best";
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
    /* sem armazenamento */
  }
};

export const BEAR_MEDALS: Medal[] = [
  { min: 0, title: "Filhote Corajoso", emoji: "🐾" },
  { min: 350, title: "Patinador do Polo", emoji: "⛸️" },
  { min: 900, title: "Ursinho Veloz", emoji: "🐻‍❄️" },
  { min: 1800, title: "Escorregador Lendário", emoji: "🏆" },
  { min: 3000, title: "Rei do Gelo", emoji: "👑" },
];
const medal = (score: number) => medalFor(BEAR_MEDALS, score);

/** Seção da landing: "Escorrega do Ursinho Polar". */
export default function PolarBearGame({ onCreateLetter }: { onCreateLetter?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="urso">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#4CC9F0]/60 bg-gradient-to-br from-[#0B2545] via-[#13315C] to-[#0B132B] p-6 sm:p-10 grid md:grid-cols-2 gap-8 items-center shadow-2xl">
          <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-[#4CC9F0]/15 blur-3xl pointer-events-none" />
          <div className="relative z-10 order-2 md:order-1 h-56 sm:h-64 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#071030] via-[#14295A] to-[#2D4E86]">
            <BearPreview />
          </div>
          <div className="relative z-10 order-1 md:order-2 text-center md:text-left">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0B132B] bg-[#4CC9F0] rounded-full px-3 py-1 mb-3">
              🐻‍❄️ Novo jogo grátis
            </span>
            <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">Escorrega do Ursinho Polar</h2>
            <p className="text-sm sm:text-base text-[#EDF2F4]/80 mb-5 leading-relaxed">
              O ursinho <strong className="text-[#4CC9F0]">Polo</strong> desliza de barriga pelo gelo do Polo Norte! Pule os
              blocos de gelo, os bonecos de neve e os pinguins, pegue peixinhos e presentes e encontre a{" "}
              <strong className="text-[#FFD166]">estrela mágica ⭐</strong>.
            </p>
            <ul className="text-xs sm:text-sm text-[#EDF2F4]/70 space-y-1.5 mb-6 inline-block text-left">
              <li>👆 Toque ou aperte <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">espaço</kbd> para pular</li>
              <li>🦘 Toque de novo no ar = pulo duplo</li>
              <li>🐟 +10 · 🎁 +50 · ⭐ fica invencível · ❤️ vida extra</li>
              <li>🧒 Modo fácil para os pequenos (mais vidas, mais devagar)</li>
            </ul>
            <div>
              <button
                onClick={() => setOpen(true)}
                className="bg-gradient-to-r from-[#4CC9F0] to-[#4361EE] text-white font-extrabold px-8 py-4 rounded-full inline-flex items-center gap-2 shadow-lg border border-[#FFD166]/50 btn-shine animate-soft-pulse cursor-pointer text-lg"
                id="bear-play-btn"
                data-celebrate
              >
                <Play className="w-5 h-5 relative z-10 fill-white" />
                <span className="relative z-10">Escorregar agora</span>
              </button>
            </div>
          </div>
        </div>
      </Reveal>
      <AnimatePresence>{open && <BearModal onClose={() => setOpen(false)} onCreateLetter={onCreateLetter} />}</AnimatePresence>
    </section>
  );
}

function BearPreview() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="absolute inset-x-0 top-6 h-16 bg-gradient-to-r from-[#2DC653]/0 via-[#2DC653]/25 to-[#4CC9F0]/0 blur-xl" />
      <div className="absolute right-8 top-6 w-10 h-10 rounded-full bg-[#FFF6D5] shadow-[0_0_30px_rgba(255,246,213,0.6)]" />
      <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-b from-[#E8F4FF] to-[#B9D6F2]" />
      <motion.div
        className="absolute bottom-10 left-[18%] text-5xl"
        animate={{ y: [0, -70, 0, 0, -55, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, times: [0, 0.2, 0.4, 0.6, 0.78, 1] }}
      >
        🐻‍❄️
      </motion.div>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute bottom-10 text-3xl"
          animate={{ left: ["105%", "-15%"] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.93, ease: "linear" }}
        >
          {["🧊", "⛄", "🐧"][i]}
        </motion.div>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={`f${i}`}
          className="absolute text-xl"
          style={{ bottom: `${38 + (i % 2) * 18}%` }}
          animate={{ left: ["105%", "-10%"] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.7 + 0.3, ease: "linear" }}
        >
          {i === 2 ? "🎁" : "🐟"}
        </motion.div>
      ))}
    </div>
  );
}

const JUMP_NOTES = [76, 79];
const FISH_NOTES = [84, 86, 88, 91];

function BearModal({ onClose, onCreateLetter }: { onClose: () => void; onCreateLetter?: () => void }) {
  useBackClose(true, onClose);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<PolarGame | null>(null);
  const [phase, setPhase] = useState<"intro" | "count" | "play" | "over">("intro");
  const [count, setCount] = useState(3);
  const [easy, setEasy] = useState(false);
  const [name, setName] = useState(loadPlayer);
  const [hud, setHud] = useState({ score: 0, hearts: 3, meters: 0, star: 0 });
  const [result, setResult] = useState<PolarResult | null>(null);
  const [best, setBest] = useState(readBest);
  const [newBest, setNewBest] = useState(false);
  const fishNote = useRef(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const game = new PolarGame(canvasRef.current!);
    gameRef.current = game;
    if (import.meta.env.DEV) (window as any).__polarGame = game;
    game.onSound = (k) => {
      if (k === "jump") musicBox.chime(JUMP_NOTES[Math.floor(Math.random() * 2)], undefined, 0.07);
      else if (k === "fish") musicBox.chime(FISH_NOTES[fishNote.current++ % FISH_NOTES.length], undefined, 0.09);
      else if (k === "gift") [79, 84, 88].forEach((n, i) => musicBox.chime(n, undefined, 0.1 - i * 0.02));
      else if (k === "star") musicBox.sleighBells(1, 0.1);
      else if (k === "heart") [84, 91].forEach((n) => musicBox.chime(n, undefined, 0.1));
      else if (k === "hurt") musicBox.chime(55, undefined, 0.16);
    };
    let lastHud = 0;
    game.onHud = (h) => {
      const now = performance.now();
      if (now - lastHud > 120) {
        lastHud = now;
        setHud(h);
      }
    };
    game.onEnd = (r) => {
      setResult(r);
      setPhase("over");
      setHud((h) => ({ ...h, hearts: 0, score: r.score }));
      const b = readBest();
      if (r.score > b) {
        saveBest(r.score);
        setBest(r.score);
        setNewBest(true);
        confetti({ particleCount: 140, spread: 100, origin: { y: 0.4 }, zIndex: 120, colors: ["#4CC9F0", "#FFD166", "#FFFFFF", "#EF233C"] });
      }
    };
    const onResize = () => game.resize();
    window.addEventListener("resize", onResize);
    return () => {
      game.stop();
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "";
    };
  }, []);

  const begin = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    g.easy = easy;
    if (name.trim()) savePlayer(name);
    setResult(null);
    setNewBest(false);
    setPhase("count");
    setCount(3);
    let n = 3;
    musicBox.chime(72, undefined, 0.12);
    const t = setInterval(() => {
      n--;
      if (n > 0) {
        setCount(n);
        musicBox.chime(72, undefined, 0.12);
      } else {
        clearInterval(t);
        musicBox.chime(84, undefined, 0.16);
        setPhase("play");
        g.start();
      }
    }, 650);
  }, [easy, name]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "play" && (e.code === "Space" || e.key === "ArrowUp" || e.key === "Enter")) {
        e.preventDefault();
        gameRef.current?.jump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const m = result ? medal(result.score) : null;

  return (
    <motion.div
      className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-5xl aspect-[3/4] sm:aspect-[16/9] max-h-[92vh] rounded-3xl overflow-hidden border-2 border-[#4CC9F0] shadow-2xl bg-[#071030]"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none select-none"
          onPointerDown={(e) => {
            e.preventDefault();
            if (phase === "play") gameRef.current?.jump();
          }}
          aria-label="Jogo do ursinho polar: toque para pular"
        />

        {/* placar */}
        {(phase === "play" || phase === "count") && (
          <div className="absolute top-3 inset-x-3 flex items-start justify-between pointer-events-none z-10">
            <div className="bg-black/35 rounded-full px-3 py-1.5 text-white font-extrabold text-sm sm:text-base">
              🐟 {hud.score}
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="bg-black/35 rounded-full px-3 py-1 text-sm sm:text-base tracking-tight">
                {Array.from({ length: easy ? 5 : 3 }, (_, i) => (
                  <span key={i} className={i < hud.hearts ? "" : "opacity-25 grayscale"}>
                    ❤️
                  </span>
                ))}
              </div>
              <div className="bg-black/35 rounded-full px-3 py-0.5 text-white/90 text-xs font-bold">{hud.meters} m</div>
              {hud.star > 0 && <div className="bg-[#FFD166] text-[#0B132B] rounded-full px-3 py-0.5 text-xs font-extrabold">⭐ {Math.ceil(hud.star)}s</div>}
            </div>
          </div>
        )}

        <BackButton
          onClick={onClose}
          className={`absolute z-20 ${phase === "play" || phase === "count" ? "bottom-3 left-3" : "top-3 left-3"}`}
        />

        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <Overlay key="intro">
              <motion.div className="text-6xl mb-2" animate={{ rotate: [-8, 8, -8], y: [0, -6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
                🐻‍❄️
              </motion.div>
              <h3 className="font-cinzel text-2xl sm:text-4xl font-bold text-white mb-2">Escorrega do Ursinho Polar</h3>
              <p className="text-sm sm:text-base text-[#EDF2F4]/85 mb-5 max-w-md">
                Toque na tela para o Polo pular. No ar, toque de novo para um pulo duplo! Pegue peixinhos 🐟 e presentes 🎁 e
                fuja dos blocos de gelo, bonecos de neve e pinguins.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-5 w-full max-w-sm">
                {[
                  { v: true, t: "🧒 Fácil", d: "5 vidas, mais devagar" },
                  { v: false, t: "🚀 Normal", d: "3 vidas, fica rápido" },
                ].map((o) => (
                  <button
                    key={o.t}
                    onClick={() => setEasy(o.v)}
                    className={`rounded-2xl p-3 text-left border-2 cursor-pointer ${easy === o.v ? "border-[#4CC9F0] bg-[#4CC9F0]/15" : "border-white/15 bg-white/5"}`}
                  >
                    <span className="block font-bold text-white text-sm">{o.t}</span>
                    <span className="block text-[11px] text-white/65">{o.d}</span>
                  </button>
                ))}
              </div>
              <label className="text-xs text-[#4CC9F0] font-bold uppercase tracking-wider mb-1">Seu nome</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 20))}
                placeholder="Ex: Sofia"
                className="bg-white/10 border border-white/30 rounded-full px-5 py-2.5 text-white text-center mb-4 focus:outline-none focus:border-[#4CC9F0] w-60"
                onKeyDown={(e) => e.key === "Enter" && begin()}
                id="bear-name"
              />
              <button
                onClick={begin}
                className="bg-gradient-to-r from-[#4CC9F0] to-[#4361EE] text-white font-extrabold px-10 py-4 rounded-full text-lg inline-flex items-center gap-2 shadow-lg border border-[#FFD166]/50 btn-shine cursor-pointer"
                id="bear-start-btn"
              >
                <Play className="w-5 h-5 fill-white relative z-10" />
                <span className="relative z-10">Começar!</span>
              </button>
              {best > 0 && <p className="mt-3 text-xs text-white/60">🏆 Seu recorde: {best}</p>}
            </Overlay>
          )}

          {phase === "count" && (
            <motion.div
              key={`c${count}`}
              className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <span className="font-cinzel text-8xl font-extrabold text-white drop-shadow-[0_0_20px_rgba(76,201,240,0.8)]">{count}</span>
            </motion.div>
          )}

          {phase === "over" && result && m && (
            <Overlay key="over">
              <SantaCongrats
                game="Escorrega do Ursinho"
                anchor="urso"
                player={name}
                onPlayer={setName}
                score={result.score}
                best={best}
                newBest={newBest}
                medals={BEAR_MEDALS}
                feat={result.fish > 0 ? `pegou ${result.fish} ${result.fish === 1 ? "peixinho" : "peixinhos"} e escorregou ${result.meters} metros no gelo` : `escorregou ${result.meters} metros no gelo com o ursinho`}
                stats={[
                  ["🐟", result.fish, "peixes"],
                  ["🎁", result.gifts, "presentes"],
                  ["🏁", result.meters, "metros"],
                ]}
                accent="#4CC9F0"
                retryId="bear-retry-btn"
                onRetry={begin}
                getSnapshot={() => canvasRef.current}
                onLetter={onCreateLetter ? () => { onClose(); onCreateLetter(); } : undefined}
              />
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
      className="absolute inset-0 z-10 flex flex-col items-center text-center px-5 bg-[#071030]/75 backdrop-blur-[2px] overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="my-auto w-full flex flex-col items-center pt-16 pb-6">{children}</div>
    </motion.div>
  );
}
