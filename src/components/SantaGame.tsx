import { useCallback, useEffect, useRef, useState } from "react";
import BackButton from "./BackButton";
import { useBackClose } from "../lib/backClose";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { X, Play, RotateCcw, Sparkles, Trophy } from "lucide-react";
import Reveal from "./Reveal";
import { DeliveryGame, type GameResult } from "../game/deliveryGame";
import { musicBox } from "../lib/christmasMusic";
import { loadFaceImages, loadFamily } from "../family/store";
import SantaCongrats from "./SantaCongrats";
import { FamilyPodium, ModePicker, NextTurn, PlayersEditor, finalNames, loadPlayers, savePlayers } from "./family/FamilyMatch";
import { loadPlayer, savePlayer, medalFor, type Medal } from "../lib/player";

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

export const SANTA_MEDALS: Medal[] = [
  { min: 0, title: "Duende Aprendiz", emoji: "✨" },
  { min: 300, title: "Duende Entregador", emoji: "🧝" },
  { min: 800, title: "Rena Veloz", emoji: "🦌" },
  { min: 1500, title: "Chefe do Trenó", emoji: "🛷" },
  { min: 2500, title: "Papai Noel Honorário", emoji: "🎅" },
];
const rankFor = (score: number) => medalFor(SANTA_MEDALS, score);

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
  const [phase, setPhase] = useState<"intro" | "count" | "play" | "over" | "turn">("intro");
  const [count, setCount] = useState(3);
  const [name, setName] = useState(loadPlayer);
  const [easy, setEasy] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [best, setBest] = useState(readBest);
  const [newBest, setNewBest] = useState(false);
  // modo família: cada um joga uma rodada e no fim sai o campeão
  const [familyMode, setFamilyMode] = useState(false);
  const [names, setNames] = useState<string[]>(loadPlayers);
  const [turnIdx, setTurnIdx] = useState(0);
  const [scores, setScores] = useState<{ score: number; detail: string }[]>([]);
  const fam = useRef({ on: false, idx: 0, n: 1 });
  useBackClose(true, onClose);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const game = new DeliveryGame(canvas);
    gameRef.current = game;
    if (import.meta.env.DEV) (window as any).__santaGame = game;
    // a família do "Família no Trenó" viaja junto
    const fam = loadFamily();
    if (fam.inGame && fam.members.length) {
      loadFaceImages(fam.members).then((imgs) => {
        game.passengers = imgs;
        game.passengerNames = fam.members.map((m) => m.name);
      });
    }
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
    const settle = setTimeout(onResize, 450);
    return () => {
      clearTimeout(settle);
      game.stop();
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "";
    };
  }, []);

  const finish = useCallback((r: GameResult) => {
    onFinish?.(r);
    setResult(r);
    if (fam.current.on) {
      setScores((sc) => [...sc, { score: r.score, detail: `${r.delivered} presentes entregues` }]);
      const last = fam.current.idx >= fam.current.n - 1;
      setPhase(last ? "over" : "turn");
      if (last) confetti({ particleCount: 160, spread: 110, origin: { y: 0.4 }, zIndex: 80, colors: ["#FFD166", "#EF233C", "#2DC653", "#FFFFFF"] });
      return;
    }
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
  /** começa uma partida nova (no modo família, desde o jogador 1) */
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
  const begin = () => {
    if (name.trim()) savePlayer(name);
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
      className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm flex items-center justify-center p-0 sm:p-6 [@media(max-height:520px)]:p-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-5xl h-[100dvh] rounded-none border-0 sm:h-auto sm:aspect-[16/10] sm:max-h-[92vh] sm:rounded-3xl sm:border-2 [@media(max-height:520px)]:h-[100dvh] [@media(max-height:520px)]:max-h-none [@media(max-height:520px)]:max-w-none [@media(max-height:520px)]:aspect-auto [@media(max-height:520px)]:rounded-none [@media(max-height:520px)]:border-0 overflow-hidden border-[#FFD166] shadow-2xl bg-[#050A1A]"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
      >
        <canvas
          ref={canvasRef}
          className="game-canvas touch-none select-none"
          onPointerDown={(e) => {
            e.preventDefault();
            if (phase === "play") gameRef.current?.drop();
          }}
          aria-label="Área do jogo: toque para soltar um presente"
        />

        <BackButton
          onClick={onClose}
          className={`absolute z-20 top-3 ${phase === "play" || phase === "count" ? "left-1/2 -translate-x-1/2" : "left-3"}`}
        />

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
              <ModePicker family={familyMode} setFamily={setFamilyMode} accent="#FFD166" />
              {familyMode ? (
                <div className="mb-4 w-full flex justify-center">
                  <PlayersEditor names={names} setNames={setNames} />
                </div>
              ) : (
                <>
                  <label className="text-xs text-[#FFD166] font-bold uppercase tracking-wider mb-1">Nome do piloto</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 20))}
                    placeholder="Ex: Sofia"
                    className="bg-white/10 border border-white/30 rounded-full px-5 py-2.5 text-white text-center mb-5 focus:outline-none focus:border-[#FFD166] w-60"
                    onKeyDown={(e) => e.key === "Enter" && newMatch()}
                  />
                </>
              )}
              <button onClick={newMatch} className="bg-gradient-to-r from-[#2DC653] to-[#1a9e3e] text-white font-extrabold px-10 py-4 rounded-full text-lg inline-flex items-center gap-2 shadow-lg border border-[#FFD166]/50 btn-shine cursor-pointer" id="game-start-btn">
                <Play className="w-5 h-5 relative z-10 fill-white" />
                <span className="relative z-10">Começar!</span>
              </button>
              {best > 0 && <p className="text-xs text-[#EDF2F4]/60 mt-4">🏆 Seu recorde: {best} pontos</p>}
            </Overlay>
          )}

          {phase === "count" && (
            <motion.div key="count" className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
              {fam.current.on && <p className="mb-2 rounded-full bg-black/50 px-4 py-1.5 text-white font-bold" id="game-turn-label">🎮 Vez de {finalNames(names)[turnIdx]}</p>}
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

          {phase === "turn" && result && (
            <Overlay key="turn">
              <NextTurn
                last={finalNames(names)[turnIdx]}
                lastScore={result.score}
                unit="pontos"
                next={finalNames(names)[turnIdx + 1]}
                nextIdx={turnIdx + 1}
                onGo={nextTurn}
                accent="#FFD166"
                goId="game-next-turn"
              />
            </Overlay>
          )}

          {phase === "over" && fam.current.on && (
            <Overlay key="podium">
              <FamilyPodium
                game="Entrega Relâmpago"
                anchor="jogo"
                ranking={scores.map((x, i) => ({ name: finalNames(names)[i], score: x.score, detail: x.detail }))}
                unit="pontos"
                accent="#FFD166"
                onRetry={newMatch}
                onSetup={() => setPhase("intro")}
                retryId="game-retry-btn"
              />
            </Overlay>
          )}

          {phase === "over" && !fam.current.on && result && rank && (
            <Overlay key="over">
              <SantaCongrats
                game="Entrega Relâmpago"
                anchor="jogo"
                player={name}
                onPlayer={setName}
                score={result.score}
                best={best}
                newBest={newBest}
                medals={SANTA_MEDALS}
                feat={result.delivered > 0 ? `entregou ${result.delivered} ${result.delivered === 1 ? "presente" : "presentes"} nas chaminés` : "voou com o trenó pelo céu de Natal"}
                stats={[
                  ["🎁", result.delivered, "presentes"],
                  ["⭐", result.perfect, "perfeitos"],
                  ["🔥", result.bestStreak, "maior combo"],
                ]}
                accent="#FFD166"
                retryId="game-retry-btn"
                onRetry={newMatch}
                getSnapshot={() => canvasRef.current}
                onLetter={() => {
                  onClose();
                  onCreateLetter();
                }}
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
      className="absolute inset-0 z-10 flex flex-col items-center text-center px-5 bg-[#050A1A]/75 backdrop-blur-[2px] overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* my-auto centraliza quando cabe e deixa rolar quando a tela é baixa (celular deitado) */}
      <div className="my-auto w-full flex flex-col items-center pt-16 pb-6">{children}</div>
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
