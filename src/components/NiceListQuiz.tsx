import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { Instagram, Loader2, RotateCcw, Sparkles } from "lucide-react";
import Reveal from "./Reveal";
import { WhatsIcon } from "./letter/ShareSheet";
import { santaHush, santaSpeak } from "../lib/santaSpeak";
import { musicBox } from "../lib/christmasMusic";
import { canvasToBlob, safeName, shareOrDownload, whatsappUrl } from "../lib/shareKit";
import { renderNiceListStory } from "../lib/niceListCard";
import { prettyName } from "../lib/prettyText";
import { loadPlayer, savePlayer } from "../lib/player";

type Q = { q: string; emoji: string; tip: string };
const QUESTIONS: Q[] = [
  { q: "Você ajudou a guardar os brinquedos?", emoji: "🧸", tip: "guardar os brinquedos depois de brincar" },
  { q: "Escovou os dentes antes de dormir?", emoji: "🪥", tip: "escovar os dentinhos todas as noites" },
  { q: "Foi gentil com irmãos e amigos?", emoji: "🤝", tip: "dar um abraço em quem estiver triste" },
  { q: "Comeu frutas e verduras?", emoji: "🥦", tip: "provar uma fruta nova esta semana" },
  { q: "Disse “por favor” e “obrigado”?", emoji: "🙏", tip: "usar as palavrinhas mágicas: por favor e obrigado" },
  { q: "Ajudou alguém em casa?", emoji: "🏠", tip: "ajudar a pôr a mesa do jantar" },
];
const ANSWERS = [
  { v: 3, label: "Sempre!", emoji: "🌟" },
  { v: 2, label: "Às vezes", emoji: "🙂" },
  { v: 1, label: "Quase nunca", emoji: "🙈" },
];

function resultFor(answers: number[]) {
  const sum = answers.reduce((a, b) => a + b, 0);
  const min = QUESTIONS.length;
  const max = QUESTIONS.length * 3;
  // todo mundo entra na lista: de 80% a 100%
  const percent = Math.round(80 + (20 * (sum - min)) / (max - min));
  const level =
    percent >= 96
      ? { title: "Nível Estrela Dourada", emoji: "⭐" }
      : percent >= 88
        ? { title: "Nível Ajudante do Papai Noel", emoji: "🧝" }
        : { title: "Nível Coração de Ouro", emoji: "💛" };
  const low = answers.indexOf(Math.min(...answers));
  const tip = answers[low] < 3 ? QUESTIONS[low].tip : "continuar sendo esse exemplo para todo mundo";
  return { percent, level, tip };
}

const STEPS = ["intro", "quiz", "checking", "result"] as const;

/** "Você está na Lista do Bom Comportamento?" — quiz rápido que termina chamando para a carta. */
export default function NiceListQuiz({ onCreateLetter }: { onCreateLetter: () => void }) {
  const [step, setStep] = useState<(typeof STEPS)[number]>("intro");
  const [name, setName] = useState(loadPlayer);
  const [answers, setAnswers] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const kid = prettyName(name) || "Criança";
  const res = useMemo(() => (answers.length === QUESTIONS.length ? resultFor(answers) : null), [answers]);
  const link = `${window.location.origin}/#lista`;

  const start = () => {
    if (name.trim()) savePlayer(name);
    setAnswers([]);
    setStep("quiz");
    musicBox.chime(76, undefined, 0.08);
  };

  const answer = (v: number) => {
    const next = [...answers, v];
    setAnswers(next);
    musicBox.chime([72, 76, 79, 84, 88, 91][next.length - 1] ?? 84, undefined, 0.08);
    if (next.length === QUESTIONS.length) {
      setStep("checking");
      musicBox.sleighBells(1.6, 0.07);
    }
  };

  // os duendes "conferem" a lista
  useEffect(() => {
    if (step !== "checking") return;
    const t = setTimeout(() => setStep("result"), 2600);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (step !== "result" || !res) return;
    confetti({ particleCount: 160, spread: 100, origin: { y: 0.55 }, zIndex: 60, colors: ["#2DC653", "#FFD166", "#EF233C", "#FFFFFF"] });
    const t = setTimeout(
      () =>
        santaSpeak(
          `Ho ho ho! ${kid}, você está na Lista do Bom Comportamento com ${res.percent} por cento! ${res.level.title}! Agora me escreva uma cartinha contando o que você quer ganhar no Natal!`,
        ),
      700,
    );
    return () => {
      clearTimeout(t);
      santaHush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const shareText = res
    ? `🎅 ${kid} está na Lista do Bom Comportamento do Papai Noel com ${res.percent}%! ${res.level.emoji} E o seu filho, está na lista? Faça o teste: ${link}`
    : "";

  const shareImage = async () => {
    if (!res || busy) return;
    setBusy(true);
    try {
      const c = await renderNiceListStory({ name: kid, percent: res.percent, level: res.level.title, emoji: res.level.emoji, url: link });
      const blob = await canvasToBlob(c, "image/jpeg", 0.92);
      const r = await shareOrDownload(blob, `Lista-do-Bom-Comportamento-${safeName(kid)}.jpg`, shareText, "Lista do Bom Comportamento");
      if (r === "downloaded") {
        setNote("Imagem salva! É só postar no Story do Instagram ou mandar no WhatsApp. 📲");
        setTimeout(() => setNote(null), 4500);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto" id="lista">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#2DC653]/60 bg-gradient-to-br from-[#0F3D26] via-[#14532F] to-[#0B132B] p-5 sm:p-10 shadow-2xl text-center">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#2DC653]/20 blur-3xl pointer-events-none" />
          <AnimatePresence mode="wait">
            {step === "intro" && (
              <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="relative">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0B132B] bg-[#2DC653] rounded-full px-3 py-1 mb-3">
                  📜 Teste grátis · 1 minuto
                </span>
                <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-white mb-3">Você está na Lista do Bom Comportamento?</h2>
                <p className="text-sm sm:text-base text-[#EDF2F4]/85 mb-5 max-w-lg mx-auto">
                  Os duendes do Papai Noel vão conferir o pergaminho! Responda 6 perguntinhas e descubra seu nível. 🎅
                </p>
                <motion.div className="text-6xl mb-4" animate={{ rotate: [-6, 6, -6] }} transition={{ duration: 2, repeat: Infinity }} aria-hidden="true">
                  📜
                </motion.div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 20))}
                  onKeyDown={(e) => e.key === "Enter" && start()}
                  placeholder="Nome da criança"
                  className="bg-white/10 border border-white/30 rounded-full px-5 py-3 text-white text-center mb-4 focus:outline-none focus:border-[#2DC653] w-64 max-w-full"
                  id="nice-name"
                />
                <div>
                  <button
                    onClick={start}
                    className="bg-gradient-to-r from-[#2DC653] to-[#1a9e3e] text-white font-extrabold px-8 py-4 rounded-full inline-flex items-center gap-2 shadow-lg border border-[#FFD166]/50 btn-shine cursor-pointer text-lg"
                    id="nice-start"
                    data-celebrate
                  >
                    <Sparkles className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Fazer o teste</span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === "quiz" && (
              <motion.div key={`q${answers.length}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="relative">
                <div className="flex justify-center gap-1.5 mb-5" aria-label={`Pergunta ${answers.length + 1} de ${QUESTIONS.length}`}>
                  {QUESTIONS.map((_, i) => (
                    <span key={i} className={`h-2 rounded-full transition-all ${i < answers.length ? "w-6 bg-[#2DC653]" : i === answers.length ? "w-8 bg-[#FFD166]" : "w-4 bg-white/20"}`} />
                  ))}
                </div>
                <div className="text-6xl mb-3" aria-hidden="true">
                  {QUESTIONS[answers.length].emoji}
                </div>
                <h3 className="font-cinzel text-xl sm:text-3xl font-bold text-white mb-6" id="nice-question">
                  {QUESTIONS[answers.length].q}
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md mx-auto">
                  {ANSWERS.map((a) => (
                    <motion.button
                      key={a.v}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => answer(a.v)}
                      className="rounded-2xl bg-white/10 hover:bg-white/20 border-2 border-white/15 hover:border-[#FFD166] py-4 px-1 flex flex-col items-center gap-1 cursor-pointer"
                      id={`nice-a${a.v}`}
                    >
                      <span className="text-3xl sm:text-4xl">{a.emoji}</span>
                      <span className="text-xs sm:text-sm font-bold text-white">{a.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "checking" && (
              <motion.div key="check" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative py-6">
                <div className="relative mx-auto w-56 h-40 rounded-xl bg-[#FBF7EF] text-[#1C2541] overflow-hidden shadow-xl border-2 border-[#FFD166]">
                  <motion.div className="absolute inset-x-0 top-0 px-4 py-2 text-left text-xs font-serif space-y-1.5" animate={{ y: [0, -260] }} transition={{ duration: 2.4, ease: "easeInOut" }}>
                    {["Ana ✔", "Bruno ✔", "Clara ✔", "Davi ✔", "Elisa ✔", "Gabriel ✔", "Helena ✔", "Isaac ✔", "Júlia ✔", "Lucas ✔", "Maria ✔", "Noah ✔", "Olívia ✔", "Pedro ✔", "Sofia ✔"].map((n) => (
                      <p key={n} className="border-b border-[#1C2541]/10 pb-1">
                        {n}
                      </p>
                    ))}
                    <p className="font-bold text-[#9B021A]">{kid} ✔</p>
                  </motion.div>
                </div>
                <p className="mt-5 text-white font-bold inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Os duendes estão conferindo a lista…
                </p>
              </motion.div>
            )}

            {step === "result" && res && (
              <motion.div key="res" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 16 }} className="relative">
                <div className="mx-auto max-w-md rounded-2xl parchment-bg text-[#1C2541] p-5 sm:p-7 border-4 border-[#FFD166] shadow-2xl relative" id="nice-result">
                  <p className="font-cinzel text-[11px] sm:text-xs font-extrabold tracking-[0.2em] text-[#9B021A]">LISTA DO BOM COMPORTAMENTO</p>
                  <p className="font-handwriting text-5xl text-[#1C2541] mt-2 leading-tight break-words">{kid}</p>
                  <p className="text-sm mt-1">está na lista com</p>
                  <p className="font-cinzel text-6xl font-extrabold text-[#1a9e3e] my-1">{res.percent}%</p>
                  <div className="h-3 rounded-full bg-[#1C2541]/10 overflow-hidden mx-4">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-[#2DC653] to-[#FFD166]" initial={{ width: 0 }} animate={{ width: `${res.percent}%` }} transition={{ delay: 0.3, duration: 1 }} />
                  </div>
                  <p className="mt-3 font-extrabold text-[#9B021A]">
                    {res.level.emoji} {res.level.title}
                  </p>
                  <p className="mt-2 text-xs text-[#1C2541]/75">
                    🧝 Dica do duende: {res.tip}. Assim o pergaminho brilha ainda mais!
                  </p>
                  <motion.span
                    className="absolute -top-4 -right-3 rotate-12 bg-[#2DC653] text-white text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-lg border-2 border-white"
                    initial={{ scale: 3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 12 }}
                  >
                    APROVADO ✓
                  </motion.span>
                </div>

                <motion.button
                  onClick={onCreateLetter}
                  whileTap={{ scale: 0.96 }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mt-5 w-full max-w-md mx-auto rounded-2xl p-4 text-left bg-gradient-to-r from-[#9B021A] via-[#D90429] to-[#9B021A] border-2 border-[#FFD166] flex items-center gap-3 cursor-pointer shadow-xl btn-shine animate-soft-pulse"
                  id="nice-letter-cta"
                >
                  <span className="text-4xl relative z-10">✉️</span>
                  <span className="relative z-10">
                    <span className="block font-extrabold text-white text-base leading-tight">Você está na lista! Agora escreva sua cartinha</span>
                    <span className="block text-[11px] text-[#FFE9A8] mt-0.5">O Papai Noel responde com o seu nome • grátis</span>
                  </span>
                </motion.button>

                <div className="mt-3 grid grid-cols-2 gap-2 max-w-md mx-auto">
                  <a
                    href={whatsappUrl(shareText)}
                    target="_blank"
                    rel="noopener"
                    className="rounded-full py-3 font-bold text-white bg-[#25D366] inline-flex items-center justify-center gap-2 text-sm"
                    id="nice-whats"
                  >
                    <WhatsIcon className="w-4 h-4" /> WhatsApp
                  </a>
                  <button
                    onClick={() => void shareImage()}
                    disabled={busy}
                    className="rounded-full py-3 font-bold text-white bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] inline-flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-70"
                    id="nice-story"
                  >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Instagram className="w-4 h-4" />} Story
                  </button>
                </div>
                {note && <p className="text-xs text-[#FFD166] mt-2">{note}</p>}
                <button onClick={() => setStep("intro")} className="mt-4 text-xs text-white/70 hover:text-white inline-flex items-center gap-1 cursor-pointer" id="nice-again">
                  <RotateCcw className="w-3.5 h-3.5" /> Testar outra criança
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}
