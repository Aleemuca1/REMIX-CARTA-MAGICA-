import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { Play } from "lucide-react";
import Reveal from "./Reveal";
import BackButton from "./BackButton";
import { useBackClose } from "../lib/backClose";
import { musicBox } from "../lib/christmasMusic";
import { CircusGame as Engine, SHOTS, type CircusResult } from "../game/circusGame";
import SantaCongrats from "./SantaCongrats";
import { FamilyPodium, ModePicker, NextTurn, PlayersEditor, finalNames, loadPlayers, savePlayers } from "./family/FamilyMatch";
import { loadPlayer, savePlayer, medalFor, type Medal } from "../lib/player";

const ACCENT = "#FF6B8B";
const BEST_KEY = "carta-magica-circo-best";
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

export const CIRCUS_MEDALS: Medal[] = [
  { min: 0, title: "Ajudante do Picadeiro", emoji: "🎪" },
  { min: 250, title: "Duende Voador", emoji: "🧝" },
  { min: 500, title: "Acrobata das Estrelas", emoji: "⭐" },
  { min: 800, title: "Mestre do Canhão", emoji: "🎯" },
  { min: 1100, title: "Estrela do Circo de Natal", emoji: "👑" },
];

/** Seção da landing: "Circo de Natal". No fim, o Papai Noel convida a criança a escrever a cartinha. */
export default function CircusGame({ onCreateLetter }: { onCreateLetter?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="circo">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#FFD166]/70 bg-gradient-to-br from-[#5A0A1E] via-[#7A0F2A] to-[#2A0612] p-6 sm:p-10 grid md:grid-cols-2 gap-8 items-center shadow-2xl">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-[#FF6B8B]/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2A0612] bg-[#FFD166] rounded-full px-3 py-1 mb-3">
              🎪 Novo jogo grátis
            </span>
            <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">Circo de Natal</h2>
            <p className="text-sm sm:text-base text-[#EDF2F4]/85 mb-5 leading-relaxed">
              Respeitável público! O duende <strong className="text-[#FFD166]">Pipoca</strong> é a bala de canhão do circo do Papai
              Noel. Toque na hora certa da <strong className="text-[#FF8FA3]">barra de força</strong>, passe pela argola de bengala
              doce, pegue estrelas e caia bem no meio do alvo!
            </p>
            <ul className="text-xs sm:text-sm text-[#EDF2F4]/75 space-y-1.5 mb-6 inline-block text-left">
              <li>👆 Um toque só: a barra sobe e desce, toque para disparar</li>
              <li>🎯 Meio do alvo +100 · 🍭 argola +50 · ⭐ estrela +20</li>
              <li>🧒 Modo fácil: alvo grande e linha mostrando o caminho</li>
              <li>✉️ No final, o Papai Noel tem um pedido especial…</li>
            </ul>
            <div>
              <button
                onClick={() => setOpen(true)}
                className="bg-gradient-to-r from-[#FF6B8B] to-[#D90429] text-white font-extrabold px-8 py-4 rounded-full inline-flex items-center gap-2 shadow-lg border border-[#FFD166]/60 btn-shine animate-soft-pulse cursor-pointer text-lg"
                id="circus-play-btn"
                data-celebrate
              >
                <Play className="w-5 h-5 relative z-10 fill-white" />
                <span className="relative z-10">Entrar no circo</span>
              </button>
            </div>
          </div>
          <div className="relative z-10 h-56 sm:h-64 rounded-2xl overflow-hidden border border-[#FFD166]/30">
            <CircusPreview />
          </div>
        </div>
      </Reveal>
      <AnimatePresence>{open && <CircusModal onClose={() => setOpen(false)} onCreateLetter={onCreateLetter} />}</AnimatePresence>
    </section>
  );
}

function CircusPreview() {
  return (
    <div className="absolute inset-0" aria-hidden="true" style={{ background: "repeating-conic-gradient(from 270deg at 50% -30%, #9B021A 0deg 6deg, #F3E3C3 6deg 12deg)" }}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />
      <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-b from-[#C98B4A] to-[#7A4A22]" />
      <div className="absolute bottom-10 inset-x-0 h-3 bg-[#B5001F]" />
      <div className="absolute bottom-10 left-[8%] text-5xl -rotate-[30deg]">💥</div>
      <motion.div
        className="absolute text-4xl"
        animate={{ left: ["14%", "48%", "78%"], bottom: ["30%", "78%", "18%"], rotate: [0, 360, 720] }}
        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut" }}
      >
        🧝
      </motion.div>
      <div className="absolute left-[46%] top-[14%] w-8 h-16 rounded-[50%] border-[6px] border-dashed border-[#EF233C] bg-white/5" />
      <motion.div className="absolute right-[12%] bottom-12 text-4xl" animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
        🎯
      </motion.div>
      <motion.div className="absolute left-[30%] top-[26%] text-2xl" animate={{ y: [0, -6, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
        ⭐
      </motion.div>
      <div className="absolute top-2 inset-x-0 flex justify-around text-xs">
        {Array.from({ length: 9 }, (_, i) => (
          <motion.span key={i} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}>
            {["🟡", "🔴", "🟢"][i % 3]}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function CircusModal({ onClose, onCreateLetter }: { onClose: () => void; onCreateLetter?: () => void }) {
  useBackClose(true, onClose);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Engine | null>(null);
  const [phase, setPhase] = useState<"intro" | "count" | "play" | "over" | "turn">("intro");
  const [count, setCount] = useState(3);
  const [easy, setEasy] = useState(true);
  const [name, setName] = useState(loadPlayer);
  const [hud, setHud] = useState({ score: 0, shot: 1 });
  const [result, setResult] = useState<CircusResult | null>(null);
  const [best, setBest] = useState(readBest);
  const [newBest, setNewBest] = useState(false);
  const [familyMode, setFamilyMode] = useState(false);
  const [names, setNames] = useState<string[]>(loadPlayers);
  const [turnIdx, setTurnIdx] = useState(0);
  const [scores, setScores] = useState<{ score: number; detail: string }[]>([]);
  const fam = useRef({ on: false, idx: 0, n: 1 });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const game = new Engine(canvasRef.current!);
    gameRef.current = game;
    if (import.meta.env.DEV) (window as any).__circusGame = game;
    game.onSound = (k) => {
      if (k === "boom") {
        musicBox.chime(43, undefined, 0.18);
        setTimeout(() => musicBox.chime(67, undefined, 0.1), 60);
      } else if (k === "star") musicBox.chime(91, undefined, 0.09);
      else if (k === "ring") [84, 88, 91].forEach((n, i) => setTimeout(() => musicBox.chime(n, undefined, 0.1), i * 60));
      else if (k === "hit") [72, 76, 79].forEach((n, i) => setTimeout(() => musicBox.chime(n, undefined, 0.12), i * 70));
      else if (k === "perfect") {
        [72, 76, 79, 84, 88].forEach((n, i) => setTimeout(() => musicBox.chime(n, undefined, 0.13), i * 60));
        musicBox.sleighBells(0.8, 0.07);
      } else if (k === "miss") musicBox.chime(52, undefined, 0.12);
      else if (k === "tick") musicBox.chime(96, undefined, 0.015);
    };
    game.onHud = (h) => setHud(h);
    game.onEnd = (r) => {
      setResult(r);
      if (fam.current.on) {
        setScores((sc) => [...sc, { score: r.score, detail: `${r.hits}/${r.shots} no alvo · ${r.stars} ⭐` }]);
        const last = fam.current.idx >= fam.current.n - 1;
        setPhase(last ? "over" : "turn");
        if (last) confetti({ particleCount: 160, spread: 110, origin: { y: 0.4 }, zIndex: 120, colors: ["#FF6B8B", "#FFD166", "#FFFFFF", "#2DC653"] });
        return;
      }
      setPhase("over");
      const b = readBest();
      if (r.score > b) {
        saveBest(r.score);
        setBest(r.score);
        setNewBest(true);
        confetti({ particleCount: 140, spread: 100, origin: { y: 0.4 }, zIndex: 120, colors: ["#FF6B8B", "#FFD166", "#FFFFFF", "#2DC653"] });
      }
    };
    const onResize = () => game.resize();
    window.addEventListener("resize", onResize);
    const settle = setTimeout(onResize, 450);
    return () => {
      clearTimeout(settle);
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
    setHud({ score: 0, shot: 1 });
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

  const newMatch = () => {
    fam.current = { on: familyMode, idx: 0, n: familyMode ? names.length : 1 };
    if (familyMode) savePlayers(names);
    setTurnIdx(0);
    setScores([]);
    begin();
  };
  const nextTurn = () => {
    fam.current.idx += 1;
    setTurnIdx(fam.current.idx);
    begin();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "play" && (e.code === "Space" || e.key === "Enter" || e.key === "ArrowUp")) {
        e.preventDefault();
        gameRef.current?.fire();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const toLetter = onCreateLetter
    ? () => {
        onClose();
        onCreateLetter();
      }
    : undefined;

  return (
    <motion.div
      className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm flex items-center justify-center p-0 sm:p-6 [@media(max-height:520px)]:p-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-5xl h-[100dvh] rounded-none border-0 sm:h-auto sm:aspect-[16/10] sm:max-h-[92vh] sm:rounded-3xl sm:border-2 [@media(max-height:520px)]:h-[100dvh] [@media(max-height:520px)]:max-h-none [@media(max-height:520px)]:max-w-none [@media(max-height:520px)]:aspect-auto [@media(max-height:520px)]:rounded-none [@media(max-height:520px)]:border-0 overflow-hidden border-[#FFD166] shadow-2xl bg-[#2A0612]"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
      >
        {/* no circo o canvas ocupa a tela toda: o picadeiro se ajusta sozinho */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none select-none"
          onPointerDown={(e) => {
            e.preventDefault();
            if (phase === "play") gameRef.current?.fire();
          }}
          aria-label="Circo de Natal: toque para disparar o duende do canhão"
          id="circus-canvas"
        />

        {(phase === "play" || phase === "count") && (
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1 pointer-events-none z-10">
            <div className="bg-black/45 rounded-full px-3 py-1.5 text-white font-extrabold text-sm sm:text-base" id="circus-score">
              ⭐ {hud.score}
            </div>
            <div className="bg-black/45 rounded-full px-3 py-1 text-xs font-bold text-white/90 flex items-center gap-1">
              {Array.from({ length: SHOTS }, (_, i) => (
                <span key={i} className={`inline-block w-2 h-2 rounded-full ${i < hud.shot - 1 ? "bg-white/25" : i === hud.shot - 1 ? "bg-[#FFD166]" : "bg-[#FF6B8B]"}`} />
              ))}
            </div>
            {fam.current.on && <div className="bg-black/45 rounded-full px-3 py-0.5 text-[11px] font-bold text-[#FFD166]">🎮 {finalNames(names)[turnIdx]}</div>}
          </div>
        )}

        <BackButton onClick={onClose} className="absolute z-20 top-3 left-3" />

        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <Overlay key="intro">
              <motion.div className="text-6xl mb-2" animate={{ rotate: [-10, 10, -10], y: [0, -8, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
                🎪
              </motion.div>
              <h3 className="font-cinzel text-2xl sm:text-4xl font-bold text-white mb-2">Circo de Natal</h3>
              <p className="text-sm sm:text-base text-[#EDF2F4]/85 mb-5 max-w-md">
                A barra de <b className="text-[#FFD166]">força</b> sobe e desce sozinha. Toque na hora certa para o duende Pipoca voar
                do canhão e cair no <b className="text-[#FF8FA3]">meio do alvo</b> 🎯! São {SHOTS} disparos.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-5 w-full max-w-sm">
                {[
                  { v: true, t: "🧒 Fácil", d: "alvo grande e linha do caminho" },
                  { v: false, t: "🚀 Normal", d: "o alvo começa a dançar" },
                ].map((o) => (
                  <button
                    key={o.t}
                    onClick={() => setEasy(o.v)}
                    className={`rounded-2xl p-3 text-left border-2 cursor-pointer ${easy === o.v ? "border-[#FF6B8B] bg-[#FF6B8B]/15" : "border-white/15 bg-white/5"}`}
                    id={o.v ? "circus-easy" : "circus-normal"}
                  >
                    <span className="block font-bold text-white text-sm">{o.t}</span>
                    <span className="block text-[11px] text-white/65">{o.d}</span>
                  </button>
                ))}
              </div>
              <ModePicker family={familyMode} setFamily={setFamilyMode} accent={ACCENT} />
              {familyMode ? (
                <div className="mb-4 w-full flex justify-center">
                  <PlayersEditor names={names} setNames={setNames} accent={ACCENT} />
                </div>
              ) : (
                <>
                  <label className="text-xs text-[#FF8FA3] font-bold uppercase tracking-wider mb-1">Nome do artista</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 20))}
                    placeholder="Ex: Sofia"
                    className="bg-white/10 border border-white/30 rounded-full px-5 py-2.5 text-white text-center mb-4 focus:outline-none focus:border-[#FF6B8B] w-60 max-w-full"
                    onKeyDown={(e) => e.key === "Enter" && newMatch()}
                    id="circus-name"
                  />
                </>
              )}
              <button
                onClick={newMatch}
                className="bg-gradient-to-r from-[#FF6B8B] to-[#D90429] text-white font-extrabold px-10 py-4 rounded-full text-lg inline-flex items-center gap-2 shadow-lg border border-[#FFD166]/50 btn-shine cursor-pointer"
                id="circus-start-btn"
              >
                <Play className="w-5 h-5 fill-white relative z-10" />
                <span className="relative z-10">Começar o show!</span>
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
              <div className="flex flex-col items-center">
                {fam.current.on && <p className="mb-2 rounded-full bg-black/50 px-4 py-1.5 text-white font-bold">🎮 Vez de {finalNames(names)[turnIdx]}</p>}
                <span className="font-cinzel text-8xl font-extrabold text-white drop-shadow-[0_0_20px_rgba(255,107,139,0.9)]">{count}</span>
              </div>
            </motion.div>
          )}

          {phase === "turn" && result && (
            <Overlay key="turn">
              <NextTurn
                last={finalNames(names)[turnIdx]}
                lastScore={result.score}
                unit="pontos"
                next={finalNames(names)[turnIdx + 1]}
                nextIdx={turnIdx + 1}
                onGo={nextTurn}
                accent={ACCENT}
                goId="circus-next-turn"
              />
            </Overlay>
          )}

          {phase === "over" && fam.current.on && (
            <Overlay key="podium">
              <FamilyPodium
                game="Circo de Natal"
                anchor="circo"
                ranking={scores.map((x, i) => ({ name: finalNames(names)[i], score: x.score, detail: x.detail }))}
                unit="pontos"
                accent={ACCENT}
                onRetry={newMatch}
                onSetup={() => setPhase("intro")}
                retryId="circus-retry-btn"
                onLetter={toLetter}
              />
            </Overlay>
          )}

          {phase === "over" && !fam.current.on && result && (
            <Overlay key="over">
              <SantaCongrats
                game="Circo de Natal"
                anchor="circo"
                player={name}
                onPlayer={setName}
                score={result.score}
                best={best}
                newBest={newBest}
                medals={CIRCUS_MEDALS}
                feat={
                  result.hits > 0
                    ? `acertou o alvo ${result.hits} ${result.hits === 1 ? "vez" : "vezes"} no Circo de Natal${result.perfect ? `, ${result.perfect} bem no meio` : ""}`
                    : "foi muito corajoso no canhão do Circo de Natal"
                }
                stats={[
                  ["🎯", `${result.hits}/${result.shots}`, "no alvo"],
                  ["🍭", result.rings, "argolas"],
                  ["⭐", result.stars, "estrelas"],
                ]}
                accent={ACCENT}
                retryId="circus-retry-btn"
                onRetry={newMatch}
                getSnapshot={() => canvasRef.current}
                onLetter={toLetter}
                letterCta
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
      className="absolute inset-0 z-10 flex flex-col items-center text-center px-5 bg-[#2A0612]/80 backdrop-blur-[2px] overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="my-auto w-full flex flex-col items-center pt-16 pb-6">{children}</div>
    </motion.div>
  );
}
