import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { Play, Plus, X, RotateCcw, ShieldCheck, Users, Camera, Volume2 } from "lucide-react";
import Reveal from "../Reveal";
import BackButton from "../BackButton";
import ProUpsell from "../ProUpsell";
import SantaCongrats from "../SantaCongrats";
import FaceCropper from "../family/FaceCropper";
import { useBackClose } from "../../lib/backClose";
import { musicBox } from "../../lib/christmasMusic";
import { santaHush, santaSpeak } from "../../lib/santaSpeak";
import { loadPlayer, savePlayer, type Medal } from "../../lib/player";
import { hasFullAccess } from "../../advent/access";
import { FAMILY_EVENT, FREE_MEMBERS, MAX_MEMBERS, drawFace, loadFamily, saveFamily, type FamilyMember } from "../../family/store";

/** Cartas de Natal (pares). */
const XMAS = [
  { k: "noel", e: "🎅", n: "Papai Noel", c: ["#FF5A6E", "#B5102A"] },
  { k: "arvore", e: "🎄", n: "Árvore", c: ["#3DDC84", "#147A3E"] },
  { k: "boneco", e: "⛄", n: "Boneco de neve", c: ["#8FD3FF", "#3A7BD5"] },
  { k: "rena", e: "🦌", n: "Rena", c: ["#E2A76F", "#8B5A2B"] },
  { k: "presente", e: "🎁", n: "Presente", c: ["#FF8FB1", "#C2185B"] },
  { k: "sino", e: "🔔", n: "Sino", c: ["#FFE08A", "#E0A100"] },
  { k: "estrela", e: "⭐", n: "Estrela", c: ["#FFF3B0", "#F4B400"] },
  { k: "biscoito", e: "🍪", n: "Biscoito", c: ["#F6C58F", "#A0612B"] },
  { k: "meia", e: "🧦", n: "Meia", c: ["#FF7B7B", "#2E7D32"] },
  { k: "treno", e: "🛷", n: "Trenó", c: ["#B39DDB", "#5E35B1"] },
  { k: "duende", e: "🧝", n: "Duende", c: ["#A5E887", "#2E7D32"] },
  { k: "pinguim", e: "🐧", n: "Pinguim", c: ["#B0BEC5", "#37474F"] },
  { k: "floco", e: "❄️", n: "Floco de neve", c: ["#E1F5FE", "#4FC3F7"] },
  { k: "mamae", e: "🤶", n: "Mamãe Noel", c: ["#FF9AA2", "#C2185B"] },
  { k: "vela", e: "🕯️", n: "Vela", c: ["#FFE0B2", "#FB8C00"] },
  { k: "laco", e: "🎀", n: "Laço", c: ["#F8BBD0", "#D81B60"] },
];

const LEVELS = [
  { id: "facil", label: "🧒 Fácil", pairs: 6, cols: "grid-cols-4", desc: "12 cartas" },
  { id: "medio", label: "😀 Médio", pairs: 8, cols: "grid-cols-4", desc: "16 cartas" },
  { id: "dificil", label: "🧠 Difícil", pairs: 12, cols: "grid-cols-4 sm:grid-cols-6", desc: "24 cartas" },
] as const;
type LevelId = (typeof LEVELS)[number]["id"];

const PLAYER_COLORS = ["#FFD166", "#4CC9F0", "#F72585", "#2DC653"];
const QUICK_NAMES = ["Mamãe", "Papai", "Vovó", "Vovô", "Titia", "Irmão", "Irmã"];

export const MEMORY_MEDALS: Medal[] = [
  { min: 0, title: "Duende Curioso", emoji: "🧝" },
  { min: 450, title: "Rena Atenta", emoji: "🦌" },
  { min: 650, title: "Guardião dos Presentes", emoji: "🎁" },
  { min: 820, title: "Memória de Estrela", emoji: "⭐" },
  { min: 950, title: "Memória do Papai Noel", emoji: "🎅" },
];

const readBest = () => {
  try {
    return Number(localStorage.getItem("carta-magica-memoria-best") || 0);
  } catch {
    return 0;
  }
};

type Card = { id: number; key: string; emoji?: string; name: string; colors: string[]; img?: string };
type Player = { name: string; score: number };

const shuffle = <T,>(a: T[]) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

/** Rostinho com gorro de Papai Noel, pronto para a carta. */
function faceCard(m: FamilyMember): Promise<string> {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 240;
      const ctx = c.getContext("2d")!;
      drawFace(ctx, img, 120, 132, 82, undefined, true);
      res(c.toDataURL("image/png"));
    };
    img.onerror = () => res(m.img);
    img.src = m.img;
  });
}

// ------------------------------------------------------------------ seção da página
export default function MemoryGame({ onUpgrade, onCreateLetter }: { onUpgrade?: () => void; onCreateLetter?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="memoria">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#2DC653]/60 bg-gradient-to-br from-[#0E2A1C] via-[#0B132B] to-[#1C2541] p-6 sm:p-10 grid md:grid-cols-2 gap-8 items-center shadow-2xl">
          <div className="absolute -left-16 -top-16 w-72 h-72 rounded-full bg-[#2DC653]/10 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0B132B] bg-[#2DC653] rounded-full px-3 py-1 mb-3">
              🃏 Novo · para jogar em família
            </span>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white mb-3">Jogo da Memória de Natal</h2>
            <p className="text-[#EDF2F4]/85 mb-4">
              Vire as cartas e encontre os pares: Papai Noel, árvore, rena, presentes... e até <b className="text-[#FFD166]">as fotos da sua família</b> de
              gorrinho! Jogue sozinho ou com até 4 jogadores: pais, filhos e avós.
            </p>
            <ul className="text-sm text-[#EDF2F4]/75 space-y-1 mb-6">
              <li>👨‍👩‍👧 Até 4 jogadores, um de cada vez</li>
              <li>📸 Fotos da família nas cartas (ficam só no seu aparelho)</li>
              <li>🎅 O Papai Noel anuncia quem ganhou</li>
            </ul>
            <motion.button
              onClick={() => setOpen(true)}
              whileTap={{ scale: 0.96 }}
              className="bg-gradient-to-r from-[#2DC653] to-[#1a9e3e] text-white font-extrabold px-8 py-4 rounded-full inline-flex items-center gap-2 shadow-lg border border-[#FFD166]/50 btn-shine cursor-pointer text-lg"
              id="memory-play-btn"
            >
              <Play className="w-5 h-5 fill-white relative z-10" />
              <span className="relative z-10">Jogar agora</span>
            </motion.button>
          </div>
          <div className="relative z-10 h-64 sm:h-72" aria-hidden="true">
            {[
              { e: "🎅", r: -14, x: "8%", y: "16%", c: XMAS[0].c },
              { e: "🎄", r: 6, x: "36%", y: "4%", c: XMAS[1].c },
              { e: "⛄", r: 16, x: "62%", y: "18%", c: XMAS[2].c },
              { e: null, r: -6, x: "22%", y: "46%", c: [] },
              { e: "🦌", r: 10, x: "50%", y: "50%", c: XMAS[3].c },
            ].map((k, i) => (
              <motion.div
                key={i}
                className="absolute w-24 sm:w-28 aspect-[3/4] rounded-2xl border-4 border-white shadow-2xl flex items-center justify-center text-5xl"
                style={{
                  left: k.x,
                  top: k.y,
                  rotate: k.r,
                  background: k.e ? `linear-gradient(135deg, ${k.c[0]}, ${k.c[1]})` : undefined,
                }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
              >
                {k.e ?? <CardBack />}
              </motion.div>
            ))}
          </div>
        </div>
      </Reveal>
      <AnimatePresence>{open && <MemoryModal onClose={() => setOpen(false)} onUpgrade={onUpgrade} onCreateLetter={onCreateLetter} />}</AnimatePresence>
    </section>
  );
}

function CardBack() {
  return (
    <div className="absolute inset-0 rounded-xl overflow-hidden bg-[#B5102A]">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #FFFFFF 0 6px, transparent 6px 18px), repeating-linear-gradient(-45deg, #2DC653 0 6px, transparent 6px 18px)",
        }}
      />
      <div className="absolute inset-[10%] rounded-lg border-2 border-[#FFD166]/80 flex items-center justify-center">
        <span className="text-3xl drop-shadow">⭐</span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ janela do jogo
function MemoryModal({ onClose, onUpgrade, onCreateLetter }: { onClose: () => void; onUpgrade?: () => void; onCreateLetter?: () => void }) {
  useBackClose(true, onClose);
  const [phase, setPhase] = useState<"setup" | "play" | "over">("setup");
  const [players, setPlayers] = useState<Player[]>(() => [{ name: loadPlayer() || "", score: 0 }]);
  const [level, setLevel] = useState<LevelId>("facil");
  const [useFamily, setUseFamily] = useState(true);
  const [family, setFamily] = useState<FamilyMember[]>(() => loadFamily().members);
  const [deck, setDeck] = useState<Card[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [turn, setTurn] = useState(0);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const [start, setStart] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const [best, setBest] = useState(readBest);
  const [newBest, setNewBest] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const sync = () => setFamily(loadFamily().members);
    window.addEventListener(FAMILY_EVENT, sync);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener(FAMILY_EVENT, sync);
      santaHush();
    };
  }, []);

  useEffect(() => {
    if (phase !== "play") return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 500);
    return () => clearInterval(t);
  }, [phase, start]);

  const lv = LEVELS.find((l) => l.id === level)!;
  const solo = players.length === 1;

  const begin = useCallback(async () => {
    const fam = useFamily ? family.slice(0, Math.min(family.length, lv.pairs - 2)) : [];
    const faces = await Promise.all(fam.map(faceCard));
    const famCards: Omit<Card, "id">[] = fam.map((m, i) => ({ key: `f-${m.id}`, name: m.name || "Você", colors: ["#FFF6D8", "#FFD166"], img: faces[i] }));
    const xmas = shuffle(XMAS)
      .slice(0, lv.pairs - famCards.length)
      .map((x) => ({ key: x.k, emoji: x.e, name: x.n, colors: x.c }));
    const pairs = [...famCards, ...xmas];
    setDeck(shuffle([...pairs, ...pairs]).map((c, i) => ({ ...c, id: i })));
    setOpen([]);
    setFound(new Set());
    setTurn(0);
    setMoves(0);
    setLock(false);
    setFlash(null);
    setPlayers((ps) => ps.map((p, i) => ({ name: p.name.trim() || (ps.length === 1 ? "" : `Jogador ${i + 1}`), score: 0 })));
    if (players[0]?.name.trim()) savePlayer(players[0].name);
    setStart(Date.now());
    setElapsed(0);
    setPhase("play");
    musicBox.sleighBells(1, 0.07);
  }, [useFamily, family, lv.pairs, players]);

  const flip = (c: Card) => {
    if (lock || open.includes(c.id) || found.has(c.key)) return;
    musicBox.chime(76 + (open.length ? 4 : 0), undefined, 0.08);
    const nxt = [...open, c.id];
    setOpen(nxt);
    if (nxt.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = nxt.map((id) => deck.find((d) => d.id === id)!);
    if (a.key === b.key) {
      // achou o par: ponto e joga de novo
      const f = new Set(found);
      f.add(a.key);
      setFound(f);
      setOpen([]);
      setPlayers((ps) => ps.map((p, i) => (i === turn ? { ...p, score: p.score + 1 } : p)));
      [79, 84, 88].forEach((n, i) => setTimeout(() => musicBox.chime(n, undefined, 0.12), i * 90));
      setFlash(a.img ? `${a.name}! 📸` : `${a.emoji} ${a.name}!`);
      setTimeout(() => setFlash(null), 1100);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 }, zIndex: 120, colors: ["#FFD166", "#EF233C", "#2DC653", "#FFFFFF"] });
      if (f.size === deck.length / 2) setTimeout(() => finish(), 900);
    } else {
      setLock(true);
      setTimeout(() => {
        setOpen([]);
        setLock(false);
        if (players.length > 1) {
          setTurn((t) => (t + 1) % players.length);
          musicBox.chime(67, undefined, 0.06);
        }
      }, 950);
    }
  };

  const score = Math.round(1000 * Math.min(1, (deck.length / 2) / Math.max(1, moves)) + (deck.length / 2) * 5);

  const finish = () => {
    setPhase("over");
    confetti({ particleCount: 160, spread: 110, origin: { y: 0.4 }, zIndex: 120, colors: ["#FFD166", "#EF233C", "#2DC653", "#FFFFFF"] });
    if (players.length === 1) {
      const b = readBest();
      // score atualizado no próximo render; calculamos aqui também
      const s = Math.round(1000 * Math.min(1, deck.length / 2 / Math.max(1, moves + 1)) + (deck.length / 2) * 5);
      if (s > b) {
        try {
          localStorage.setItem("carta-magica-memoria-best", String(s));
        } catch {
          /* sem armazenamento */
        }
        setBest(s);
        setNewBest(true);
      } else setNewBest(false);
    }
  };

  // imagem do tabuleiro para o cartão de recorde
  const snapshot = () => {
    const c = document.createElement("canvas");
    c.width = 800;
    c.height = 600;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, 600);
    g.addColorStop(0, "#0E2A1C");
    g.addColorStop(1, "#1C2541");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 800, 600);
    const uniq = deck.filter((d, i) => deck.findIndex((x) => x.key === d.key) === i).slice(0, 12);
    uniq.forEach((d, i) => {
      const x = 40 + (i % 4) * 185,
        y = 30 + Math.floor(i / 4) * 190;
      const gr = ctx.createLinearGradient(x, y, x + 160, y + 170);
      gr.addColorStop(0, d.colors[0]);
      gr.addColorStop(1, d.colors[1]);
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.roundRect(x, y, 160, 170, 18);
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 6;
      ctx.stroke();
      if (d.emoji) {
        ctx.font = "90px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(d.emoji, x + 80, y + 90);
      }
    });
    return c;
  };

  const winners = useMemo(() => {
    const max = Math.max(...players.map((p) => p.score));
    return players.filter((p) => p.score === max);
  }, [players]);

  return (
    <motion.div
      className="fixed inset-0 z-[88] bg-black/90 backdrop-blur-sm flex items-start justify-center p-2 sm:p-5 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative my-auto w-full max-w-4xl bg-gradient-to-b from-[#0E2A1C] to-[#0B132B] border-2 border-[#2DC653] rounded-3xl p-3 sm:p-6 shadow-2xl"
        initial={{ scale: 0.94, y: 30 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <BackButton onClick={phase === "play" ? () => setPhase("setup") : onClose} />
          <h3 className="font-cinzel text-base sm:text-2xl font-bold text-white text-center">🃏 Memória de Natal</h3>
          <span className="w-16" />
        </div>

        {phase === "setup" && (
          <Setup
            players={players}
            setPlayers={setPlayers}
            level={level}
            setLevel={setLevel}
            useFamily={useFamily}
            setUseFamily={setUseFamily}
            family={family}
            onUpgrade={onUpgrade}
            onStart={begin}
          />
        )}

        {phase === "play" && (
          <div>
            {/* placar */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              {players.map((p, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: !solo && i === turn ? 1.08 : 1 }}
                  className={`rounded-full px-3 py-1.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-2 ${
                    !solo && i === turn ? "bg-white/15 text-white" : "bg-white/5 text-white/70 border-transparent"
                  }`}
                  style={{ borderColor: !solo && i === turn ? PLAYER_COLORS[i] : undefined }}
                  id={`memory-player-${i}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: PLAYER_COLORS[i] }} />
                  {solo ? "Pares" : p.name}: {p.score}
                  {!solo && i === turn && <span className="ml-1">👈 sua vez</span>}
                </motion.div>
              ))}
              <span className="text-xs text-white/60">👆 {moves} jogadas{solo ? ` · ⏱️ ${elapsed}s` : ""}</span>
            </div>
            <div className={`grid ${lv.cols} gap-2 sm:gap-3 max-w-2xl mx-auto`} id="memory-board">
              {deck.map((c) => {
                const up = open.includes(c.id) || found.has(c.key);
                const done = found.has(c.key);
                return (
                  <button
                    key={c.id}
                    onClick={() => flip(c)}
                    className="relative aspect-[3/4] cursor-pointer [perspective:800px] select-none"
                    aria-label={up ? c.name : "Carta virada"}
                    data-key={c.key}
                    data-up={up ? "1" : "0"}
                  >
                    <motion.div
                      className="absolute inset-0 [transform-style:preserve-3d]"
                      animate={{ rotateY: up ? 180 : 0, scale: done ? [1, 1.08, 1] : 1 }}
                      transition={{ duration: 0.45 }}
                    >
                      <div className="absolute inset-0 rounded-xl border-2 sm:border-4 border-white shadow-lg [backface-visibility:hidden]">
                        <CardBack />
                      </div>
                      <div
                        className={`absolute inset-0 rounded-xl border-2 sm:border-4 shadow-lg flex flex-col items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                          done ? "border-[#FFD166]" : "border-white"
                        }`}
                        style={{ background: `linear-gradient(135deg, ${c.colors[0]}, ${c.colors[1]})` }}
                      >
                        {c.img ? (
                          <img src={c.img} alt={c.name} className="w-[86%] aspect-square object-contain" draggable={false} />
                        ) : (
                          <span className="text-[min(9vw,3.4rem)] leading-none drop-shadow">{c.emoji}</span>
                        )}
                        <span className="mt-1 text-[9px] sm:text-[11px] font-extrabold text-[#0B132B] bg-white/80 rounded-full px-1.5 sm:px-2 py-0.5 max-w-[92%] truncate">
                          {c.name}
                        </span>
                        {done && <span className="absolute top-1 right-1 text-xs sm:text-sm">✨</span>}
                      </div>
                    </motion.div>
                  </button>
                );
              })}
            </div>
            <AnimatePresence>
              {flash && (
                <motion.div
                  className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[95] bg-white text-[#0B132B] font-extrabold text-lg sm:text-2xl rounded-full px-6 py-3 shadow-2xl border-4 border-[#FFD166] pointer-events-none"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.3, opacity: 0 }}
                >
                  🎅 Achou! {flash}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {phase === "over" &&
          (solo ? (
            <div className="flex justify-center">
              <SantaCongrats
                game="Memória de Natal"
                anchor="memoria"
                player={players[0].name}
                onPlayer={(n) => setPlayers([{ ...players[0], name: n }])}
                score={score}
                best={best}
                newBest={newBest}
                medals={MEMORY_MEDALS}
                feat={`encontrou os ${deck.length / 2} pares em ${moves} jogadas`}
                stats={[
                  ["🃏", deck.length / 2, "pares"],
                  ["👆", moves, "jogadas"],
                  ["⏱️", `${elapsed}s`, "tempo"],
                ]}
                accent="#2DC653"
                retryId="memory-retry-btn"
                onRetry={begin}
                getSnapshot={snapshot}
                onLetter={
                  onCreateLetter
                    ? () => {
                        onClose();
                        onCreateLetter();
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            <Podium players={players} winners={winners} onRetry={begin} onSetup={() => setPhase("setup")} />
          ))}
      </motion.div>
    </motion.div>
  );
}

// ------------------------------------------------------------------ preparação
function Setup({
  players,
  setPlayers,
  level,
  setLevel,
  useFamily,
  setUseFamily,
  family,
  onUpgrade,
  onStart,
}: {
  players: Player[];
  setPlayers: (p: Player[]) => void;
  level: LevelId;
  setLevel: (l: LevelId) => void;
  useFamily: boolean;
  setUseFamily: (v: boolean) => void;
  family: FamilyMember[];
  onUpgrade?: () => void;
  onStart: () => void;
}) {
  const full = hasFullAccess();
  const limit = full ? MAX_MEMBERS : FREE_MEMBERS;
  const [consent, setConsent] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [upsell, setUpsell] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const say = (m: string) => {
    setNote(m);
    setTimeout(() => setNote(null), 3000);
  };

  const addPhoto = () => {
    if (!consent) {
      say("Marque a autorização do responsável antes de adicionar fotos. 💛");
      return;
    }
    if (family.length >= limit) {
      if (!full) setUpsell(true);
      else say(`Cabem até ${MAX_MEMBERS} fotos.`);
      return;
    }
    fileRef.current?.click();
  };
  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f && f.type.startsWith("image/")) setCropFile(f);
  };
  const onCropped = (img: string) => {
    setCropFile(null);
    const fam = loadFamily();
    const used = new Set(fam.members.map((m) => m.name));
    const name = ["Mamãe", "Papai", "Vovó", "Vovô", "Titia", "Titio"].find((n) => !used.has(n)) ?? "";
    const m: FamilyMember = { id: Math.random().toString(36).slice(2, 9), name: fam.members.length === 0 ? players[0]?.name || "" : name, img };
    if (!saveFamily({ ...fam, members: [...fam.members, m] })) say("O aparelho está sem espaço para guardar a foto.");
    musicBox.chime(84, undefined, 0.1);
  };
  const rename = (id: string, name: string) => {
    const fam = loadFamily();
    saveFamily({ ...fam, members: fam.members.map((m) => (m.id === id ? { ...m, name: name.slice(0, 14) } : m)) });
  };
  const remove = (id: string) => {
    const fam = loadFamily();
    saveFamily({ ...fam, members: fam.members.filter((m) => m.id !== id) });
  };

  const setName = (i: number, name: string) => setPlayers(players.map((p, k) => (k === i ? { ...p, name: name.slice(0, 14) } : p)));
  const addPlayer = (name = "") => players.length < 4 && setPlayers([...players, { name, score: 0 }]);

  return (
    <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#FFD166] mb-2 inline-flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Quem vai jogar? (até 4)
          </p>
          <div className="space-y-2">
            {players.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: PLAYER_COLORS[i] }} />
                <input
                  value={p.name}
                  onChange={(e) => setName(i, e.target.value)}
                  placeholder={i === 0 ? "Seu nome (ex: Sofia)" : `Jogador ${i + 1}`}
                  className="flex-1 min-w-0 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-[#FFD166]"
                  id={`memory-name-${i}`}
                />
                {i > 0 && (
                  <button onClick={() => setPlayers(players.filter((_, k) => k !== i))} className="p-2 rounded-full bg-white/10 text-white cursor-pointer" aria-label="Tirar jogador">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {players.length < 4 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button onClick={() => addPlayer()} className="rounded-full px-3 py-1.5 text-xs font-bold bg-white/10 text-white inline-flex items-center gap-1 cursor-pointer" id="memory-add-player">
                <Plus className="w-3.5 h-3.5" /> Jogador
              </button>
              {QUICK_NAMES.filter((n) => !players.some((p) => p.name === n))
                .slice(0, 4)
                .map((n) => (
                  <button key={n} onClick={() => addPlayer(n)} className="rounded-full px-3 py-1.5 text-xs font-bold bg-white/5 border border-white/15 text-white/85 cursor-pointer">
                    + {n}
                  </button>
                ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#FFD166] mb-2">Dificuldade</p>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`rounded-2xl p-2.5 text-left border-2 cursor-pointer ${level === l.id ? "border-[#2DC653] bg-[#2DC653]/15" : "border-white/15 bg-white/5"}`}
              >
                <span className="block font-bold text-white text-sm">{l.label}</span>
                <span className="block text-[11px] text-white/60">{l.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FFD166] inline-flex items-center gap-1.5">
              <Camera className="w-4 h-4" /> Fotos da família nas cartas
            </p>
            <label className="inline-flex items-center gap-1.5 text-xs text-white/80 cursor-pointer">
              <input type="checkbox" checked={useFamily} onChange={(e) => setUseFamily(e.target.checked)} className="accent-[#2DC653]" />
              usar
            </label>
          </div>
          <div className="flex flex-wrap gap-2.5 mb-3">
            {family.map((m) => (
              <div key={m.id} className="relative w-16 flex flex-col items-center">
                <img src={m.img} alt="" className="w-14 h-14 rounded-full object-cover border-[3px] border-[#FFD166]" />
                <input
                  defaultValue={m.name}
                  onBlur={(e) => rename(m.id, e.target.value)}
                  placeholder="Nome"
                  className="w-16 mt-1 bg-[#1C2541] border border-white/15 rounded-full px-1.5 py-0.5 text-white text-[10px] text-center focus:outline-none focus:border-[#FFD166]"
                />
                <button onClick={() => remove(m.id)} className="absolute -top-1 -right-0.5 w-5 h-5 rounded-full bg-[#EF233C] text-white flex items-center justify-center cursor-pointer" aria-label="Tirar foto">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={addPhoto}
              className={`w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer ${consent ? "border-[#FFD166] text-[#FFD166]" : "border-white/25 text-white/40"}`}
              aria-label="Adicionar foto"
              id="memory-add-photo"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
          <label className="flex items-start gap-2 text-[12px] text-white/85 cursor-pointer bg-[#0B132B]/60 rounded-xl p-2.5 border border-white/10">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="accent-[#2DC653] mt-0.5" id="memory-consent" />
            <span>
              <b>Sou o pai, a mãe ou o responsável</b> e autorizo usar estas fotos no jogo. As fotos são recortadas e guardadas <b>só neste aparelho</b> e não são
              enviadas para a internet.
            </span>
          </label>
          <p className="text-[11px] text-white/50 mt-2 inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2DC653]" /> As mesmas fotos aparecem no "Família no Trenó". {!full && `Grátis: até ${FREE_MEMBERS} fotos.`}
          </p>
          {note && <p className="text-[12px] text-[#FFD166] mt-2">{note}</p>}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} id="memory-file" />
        </div>

        <motion.button
          onClick={onStart}
          whileTap={{ scale: 0.96 }}
          className="w-full bg-gradient-to-r from-[#2DC653] to-[#1a9e3e] text-white font-extrabold py-4 rounded-full inline-flex items-center justify-center gap-2 shadow-lg border border-[#FFD166]/50 btn-shine cursor-pointer text-lg"
          id="memory-start-btn"
        >
          <Play className="w-5 h-5 fill-white relative z-10" />
          <span className="relative z-10">Começar!</span>
        </motion.button>
      </div>

      <AnimatePresence>{cropFile && <FaceCropper key="crop" file={cropFile} onDone={onCropped} onCancel={() => setCropFile(null)} />}</AnimatePresence>
      <AnimatePresence>
        {upsell && (
          <ProUpsell
            title="Mais fotos da família"
            text={`No plano grátis cabem ${FREE_MEMBERS} fotos. Com o Natal Completo cabem até ${MAX_MEMBERS}: vovós, titios e padrinhos também!`}
            onUpgrade={
              onUpgrade
                ? () => {
                    setUpsell(false);
                    onUpgrade();
                  }
                : undefined
            }
            onClose={() => setUpsell(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ------------------------------------------------------------------ pódio (vários jogadores)
function Podium({ players, winners, onRetry, onSetup }: { players: Player[]; winners: Player[]; onRetry: () => void; onSetup: () => void }) {
  const tie = winners.length > 1;
  const speech = tie
    ? `Ho ho ho! Que empate lindo! ${winners.map((w) => w.name).join(" e ")} acharam ${winners[0].score} pares cada! Todos ganharam um abraço do Papai Noel!`
    : `Ho ho ho! Parabéns, ${winners[0].name}! Você achou ${winners[0].score} pares e venceu o Jogo da Memória! Que memória de rena!`;
  useEffect(() => {
    musicBox.sleighBells(1.2, 0.08);
    const t = setTimeout(() => santaSpeak(speech), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ranked = players.map((p, i) => ({ ...p, i })).sort((a, b) => b.score - a.score);
  const medal = ["🥇", "🥈", "🥉", "🎖️"];
  return (
    <div className="max-w-md mx-auto text-center py-2">
      <div className="flex items-start gap-2 text-left">
        <div className="shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-[#EF233C] to-[#9B021A] border-2 border-[#FFD166] flex items-center justify-center text-4xl">🎅</div>
        <div className="relative flex-1 bg-white text-[#1C2541] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm shadow-lg" id="memory-podium-bubble">
          {speech}
          <button onClick={() => santaSpeak(speech)} className="absolute -bottom-3 right-2 bg-[#9B021A] text-white rounded-full px-2.5 py-1 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer">
            <Volume2 className="w-3 h-3" /> Ouvir
          </button>
        </div>
      </div>
      <div className="mt-6 space-y-2">
        {ranked.map((p, k) => (
          <motion.div
            key={p.i}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + k * 0.15 }}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 border-2 ${k === 0 || p.score === ranked[0].score ? "bg-[#FFD166]/15 border-[#FFD166]" : "bg-white/5 border-white/10"}`}
          >
            <span className="text-2xl">{p.score === ranked[0].score ? "🥇" : medal[k]}</span>
            <span className="w-3 h-3 rounded-full" style={{ background: PLAYER_COLORS[p.i] }} />
            <span className="flex-1 text-left text-white font-bold">{p.name}</span>
            <span className="text-[#FFD166] font-extrabold">{p.score} pares</span>
          </motion.div>
        ))}
      </div>
      <div className="flex gap-2 mt-5">
        <button
          onClick={onRetry}
          className="flex-[1.3] rounded-full py-3.5 font-extrabold text-white bg-gradient-to-r from-[#2DC653] to-[#1a9e3e] border border-[#FFD166]/50 inline-flex items-center justify-center gap-2 cursor-pointer"
          id="memory-retry-btn"
        >
          <RotateCcw className="w-5 h-5" /> Jogar de novo
        </button>
        <button onClick={onSetup} className="flex-1 rounded-full py-3.5 font-bold text-white bg-white/10 border border-white/20 cursor-pointer">
          Trocar jogadores
        </button>
      </div>
    </div>
  );
}
