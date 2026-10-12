import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, X, Star, Crown } from "lucide-react";
import Reveal from "../Reveal";
import { ADVENT_DAYS, type AdventDay } from "../../advent/days";
import CodeRedeem from "./CodeRedeem";
import { canPlay, daysUntilOpen, getAccessCode, getChildName, getProgress, hasFullAccess, isDateOpen, isTestMode, markDone, setChildName } from "../../advent/access";
import { MessageActivity, QuizActivity, KindnessActivity, MemoryActivity, CatchActivity, BellsActivity, SnowmanActivity, celebrate } from "./Activities";
import { GameModal } from "../SantaGame";
import { AtelierModal } from "../atelier/AtelierSection";
import { musicBox } from "../../lib/christmasMusic";

// ordem "bagunçada" das portinhas, como nos calendários de verdade
const LAYOUT = [7, 1, 15, 22, 10, 3, 19, 12, 5, 24, 17, 8, 2, 14, 21, 9, 18, 4, 11, 23, 6, 16, 13, 20];
const PALETTES = [
  ["#D90429", "#7A0015"],
  ["#1B7F3B", "#0E3B2A"],
  ["#1C3D8C", "#0B132B"],
  ["#B8860B", "#7A5A00"],
];

export default function AdventCalendar({ onUpgrade }: { onUpgrade: () => void }) {
  const [done, setDone] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [opening, setOpening] = useState<number | null>(null);
  const [active, setActive] = useState<AdventDay | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [upsell, setUpsell] = useState(false);
  const [shake, setShake] = useState<number | null>(null);
  const [, setUnlockTick] = useState(0);
  const full = hasFullAccess();
  const myCode = full ? getAccessCode() : "";
  const unlocked = (child?: string) => {
    setUnlockTick((t) => t + 1);
    setUpsell(false);
    if (child && !getChildName()) {
      setChildName(child);
      setName(child);
    }
    say("Calendário liberado neste aparelho! 🎄");
  };
  const test = isTestMode();

  useEffect(() => {
    setDone(getProgress());
    setName(getChildName());
  }, []);

  const say = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  };

  const clickDoor = (d: AdventDay) => {
    if (done.includes(d.day) || canPlay(d.day)) {
      musicBox.chime(84, undefined, 0.14);
      setOpening(d.day);
      setTimeout(() => {
        setActive(d);
        setOpening(null);
      }, 650);
      return;
    }
    setShake(d.day);
    setTimeout(() => setShake(null), 500);
    musicBox.chime(55, undefined, 0.1);
    if (!full) {
      setUpsell(true);
      return;
    }
    const n = daysUntilOpen(d.day);
    say(n === 1 ? "Essa portinha abre amanhã! 🎁" : `Essa portinha abre em ${n} dias! 🎁`);
  };

  const complete = useCallback(
    (day: number) => {
      setDone((prev) => (prev.includes(day) ? prev : markDone(day)));
    },
    [],
  );

  const stars = done.length;
  const childLabel = name.trim() || "criança querida";

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="calendario">
      <Reveal className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#0B132B] bg-[#FFD166] rounded-full px-3 py-1 mb-3">
          <Crown className="w-3.5 h-3.5" /> Natal Completo
        </span>
        <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">Calendário do Advento Mágico</h2>
        <p className="text-sm sm:text-base text-[#EDF2F4]/75">
          De 1 a 24 de dezembro, uma portinha nova por dia com jogos, adivinhas, desafios de bondade e recados do Papai Noel.
          Cada portinha completada vira uma estrela no Livro Dourado!
        </p>
      </Reveal>

      {/* nome + progresso */}
      <Reveal delay={0.1}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-[#0B132B]/80 border border-white/10 rounded-2xl p-4">
          <label className="flex items-center gap-2 text-sm text-white w-full sm:w-auto">
            <span className="whitespace-nowrap">Calendário de</span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setChildName(e.target.value);
              }}
              placeholder="nome da criança"
              className="bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white w-full sm:w-48 focus:outline-none focus:border-[#FFD166]"
            />
          </label>
          <div className="w-full sm:w-80">
            <div className="flex justify-between text-xs text-[#FFD166] font-bold mb-1">
              <span>⭐ {stars} de 24 estrelas</span>
              {test && <span className="text-[#4CC9F0]">modo teste</span>}
            </div>
            <div className="h-3 rounded-full bg-white/10 overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-[#FFD166] to-[#FFB703]" animate={{ width: `${(stars / 24) * 100}%` }} transition={{ type: "spring", stiffness: 80 }} />
            </div>
          </div>
        </div>
      </Reveal>

      {/* portinhas */}
      <div className="max-w-3xl mx-auto grid grid-cols-4 sm:grid-cols-6 grid-flow-row-dense gap-2.5 sm:gap-3 p-3 sm:p-5 rounded-3xl bg-gradient-to-br from-[#2A1A12] to-[#1a0f0a] border-4 border-[#B8860B]/70 shadow-2xl" style={{ perspective: 900 }}>
        {LAYOUT.map((dayNum, idx) => {
          const d = ADVENT_DAYS[dayNum - 1];
          const isDone = done.includes(d.day);
          const playable = canPlay(d.day);
          const [a, b] = PALETTES[idx % PALETTES.length];
          const lockedByPlan = !full && d.day !== 1;
          const big = dayNum === 24;
          return (
            <motion.button
              key={d.day}
              onClick={() => clickDoor(d)}
              className={`relative aspect-square rounded-xl cursor-pointer ${big ? "col-span-2 row-span-2 aspect-auto" : ""}`}
              animate={shake === d.day ? { x: [0, -6, 6, -4, 4, 0] } : {}}
              whileHover={{ y: -3 }}
              aria-label={`Dia ${d.day}`}
            >
              {/* interior (aparece quando a porta abre) */}
              <div className="absolute inset-0 rounded-xl bg-[#FCF9F2] flex flex-col items-center justify-center shadow-inner">
                <span className={big ? "text-6xl" : "text-3xl sm:text-4xl"}>{d.emoji}</span>
                {isDone && <Star className="absolute top-1 right-1 w-4 h-4 fill-[#FFD166] text-[#B8860B]" />}
              </div>
              {/* porta */}
              <motion.div
                className="advent-door-front absolute inset-0 rounded-xl flex flex-col items-center justify-center origin-left"
                style={{ ["--door-a" as string]: a, ["--door-b" as string]: b, backfaceVisibility: "hidden" }}
                animate={{ rotateY: isDone || opening === d.day ? -105 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <span className={`font-cinzel font-extrabold text-[#FFE194] drop-shadow ${big ? "text-5xl sm:text-6xl" : "text-2xl sm:text-3xl"}`}>{d.day}</span>
                {d.day === 1 && !isDone && <span className="text-[9px] sm:text-[10px] font-bold text-white bg-[#2DC653] rounded-full px-1.5 mt-1">GRÁTIS</span>}
                {!playable && (
                  <span className="absolute bottom-1.5 right-1.5 text-[#FFE194]/80">
                    {lockedByPlan ? <Crown className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  </span>
                )}
                {playable && !isDone && (
                  <motion.span
                    className="absolute inset-0 rounded-xl"
                    animate={{ boxShadow: ["0 0 0px #FFD166", "0 0 22px #FFD166", "0 0 0px #FFD166"] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                )}
                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px]">🎀</span>
              </motion.div>
            </motion.button>
          );
        })}
        {/* enfeites que completam a moldura */}
        {["🎄", "🎅", "⭐"].map((e, i) => (
          <motion.div
            key={e}
            className="aspect-square rounded-xl bg-[#1a0f0a] border border-[#B8860B]/40 flex items-center justify-center text-3xl sm:text-4xl"
            animate={{ rotate: [-6, 6, -6] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          >
            {e}
          </motion.div>
        ))}
      </div>

      {!full && (
        <p className="text-center text-xs sm:text-sm text-[#EDF2F4]/70 mt-5">
          A portinha 1 é uma prévia grátis. As outras 23 fazem parte do plano{" "}
          <button onClick={onUpgrade} className="text-[#FFD166] font-bold underline cursor-pointer">
            Natal Completo
          </button>
          .
        </p>
      )}
      {!full && (
        <div className="text-center mt-3">
          <CodeRedeem onUnlocked={unlocked} />
        </div>
      )}
      {full && myCode && (
        <p className="text-center text-xs text-[#EDF2F4]/60 mt-4">
          Seu código mágico para abrir em outro aparelho: <b className="text-[#FFD166] tracking-widest">{myCode}</b>
        </p>
      )}
      {full && !isDateOpen(2) && (
        <p className="text-center text-xs sm:text-sm text-[#EDF2F4]/70 mt-5">As portinhas começam a abrir no dia 1º de dezembro. 🎄</p>
      )}

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] bg-[#0B132B] text-white text-sm font-semibold px-5 py-3 rounded-full border border-[#FFD166]/60 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* convite para o plano */}
      <AnimatePresence>
        {upsell && (
          <Backdrop onClose={() => setUpsell(false)}>
            <div className="text-center">
              <div className="text-5xl mb-2">👑🎁</div>
              <h3 className="font-cinzel text-2xl font-bold text-white mb-2">Portinha do plano Natal Completo</h3>
              <p className="text-sm text-[#EDF2F4]/75 mb-5">
                Com o Natal Completo, {name.trim() || "seu filho"} ganha 24 surpresas até a véspera de Natal, além da carta com voz do Papai Noel,
                PDF e certificados.
              </p>
              <button
                onClick={() => {
                  setUpsell(false);
                  onUpgrade();
                }}
                className="bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] text-white font-bold px-7 py-3.5 rounded-full border border-[#FFD166]/50 btn-shine cursor-pointer"
              >
                <span className="relative z-10">Quero o Natal Completo</span>
              </button>
              <div className="mt-4">
                <CodeRedeem onUnlocked={unlocked} />
              </div>
            </div>
          </Backdrop>
        )}
      </AnimatePresence>

      {/* atividade do dia */}
      <AnimatePresence>
        {active && active.activity.type !== "delivery" && active.activity.type !== "coloring" && (
          <Backdrop onClose={() => setActive(null)} wide={active.activity.type === "snowman" || active.activity.type === "memory"}>
            <DayHeader d={active} done={done.includes(active.day)} />
            <DayBody d={active} name={childLabel} done={done.includes(active.day)} onDone={() => complete(active.day)} />
            <div className="text-center mt-5">
              <button onClick={() => setActive(null)} className="text-sm text-[#EDF2F4]/70 hover:text-white underline cursor-pointer">
                Voltar ao calendário
              </button>
            </div>
          </Backdrop>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && active.activity.type === "coloring" && (
          <AtelierModal
            title={`Dia ${active.day}: ${active.title}`}
            designId={active.activity.design}
            lockDesign
            allowExclusive
            onClose={() => setActive(null)}
            onDone={() => {
              complete(active.day);
              celebrate();
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && active.activity.type === "delivery" && (
          <GameModal
            onClose={() => setActive(null)}
            onCreateLetter={onUpgrade}
            onFinish={(r) => {
              if (r.delivered >= 5) {
                complete(active.day);
                celebrate();
              }
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function DayHeader({ d, done }: { d: AdventDay; done: boolean }) {
  return (
    <div className="text-center mb-5">
      <span className="font-cinzel text-xs font-bold text-[#FFD166] tracking-widest">DIA {d.day} DE DEZEMBRO</span>
      <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white mt-1">
        {d.emoji} {d.title}
      </h3>
      {done && <p className="text-xs text-[#2DC653] font-bold mt-1">⭐ Estrela conquistada</p>}
    </div>
  );
}

function DayBody({ d, name, done, onDone }: { d: AdventDay; name: string; done: boolean; onDone: () => void }) {
  const a = d.activity;
  switch (a.type) {
    case "message":
      return <MessageActivity from={a.from} text={a.text.replace(/\{nome\}/g, name)} day={d.day} name={name} onDone={onDone} />;
    case "quiz":
      return <QuizActivity {...a} onDone={onDone} />;
    case "kindness":
      return <KindnessActivity challenge={a.challenge} tip={a.tip} done={done} onDone={onDone} />;
    case "memory":
      return <MemoryActivity pairs={a.pairs} onDone={onDone} />;
    case "catch":
      return <CatchActivity goal={a.goal} seconds={a.seconds} golden={a.golden} onDone={onDone} />;
    case "bells":
      return <BellsActivity song={a.song} onDone={onDone} />;
    case "snowman":
      return <SnowmanActivity onDone={onDone} />;
    default:
      return null;
  }
}

function Backdrop({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <motion.div
      className="fixed inset-0 z-[85] bg-black/85 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`relative my-auto w-full ${wide ? "max-w-2xl" : "max-w-lg"} bg-gradient-to-b from-[#1C2541] to-[#0B132B] border-2 border-[#FFD166] rounded-3xl p-5 sm:p-8 shadow-2xl`}
        initial={{ scale: 0.85, y: 30, rotate: -2 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-white/60 hover:text-white p-1.5 rounded-full hover:bg-white/10 cursor-pointer" aria-label="Fechar">
          <X className="w-5 h-5" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
