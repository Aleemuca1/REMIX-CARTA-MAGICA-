import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, Volume2, Award, ChevronDown, Sparkles, Loader2 } from "lucide-react";
import GameShareButtons from "./GameShareButtons";
import { medalFor, savePlayer, type Medal } from "../lib/player";
import { renderCertificate } from "../lib/scoreCard";
import { canvasToBlob, safeName, shareOrDownload } from "../lib/shareKit";
import { musicBox } from "../lib/christmasMusic";

type Props = {
  game: string;
  anchor: string;
  player: string;
  onPlayer: (n: string) => void;
  score: number;
  best: number;
  newBest: boolean;
  medals: Medal[];
  stats: [string, number | string, string][];
  /** frase do que a criança fez, ex.: "entregou 12 presentes nas chaminés" */
  feat: string;
  accent: string;
  retryId: string;
  onRetry: () => void;
  getSnapshot: () => HTMLCanvasElement | null;
  /** só aparece na área dos pais (a não ser que letterCta esteja ligado) */
  onLetter?: () => void;
  /** mostra um convite grande para a criança escrever a cartinha (e o Noel fala sobre isso) */
  letterCta?: boolean;
};

/** Final do jogo: o Papai Noel aparece, dá parabéns (falando!) e entrega a medalha e o certificado. */
export default function SantaCongrats(p: Props) {
  const medal = medalFor(p.medals, p.score);
  const idx = p.medals.indexOf(medal);
  const next = p.medals[idx + 1];
  const bestMedalIdx = p.medals.indexOf(medalFor(p.medals, p.best));
  const name = p.player.trim();
  const [typed, setTyped] = useState("");
  const [parents, setParents] = useState(false);
  const [certBusy, setCertBusy] = useState(false);
  const [askName, setAskName] = useState(false);
  const [draft, setDraft] = useState(name);
  const [note, setNote] = useState<string | null>(null);
  const spokenRef = useRef(false);

  const cheer = p.newBest ? "Você bateu o seu recorde! " : "";
  const goal = next
    ? `Faltam só ${next.min - p.score} pontos para a medalha ${next.title}. Vamos tentar de novo?`
    : "Você é o maior campeão do Polo Norte!";
  const invite = p.letterCta && p.onLetter
    ? " E agora tenho um pedido especial: me escreva uma cartinha contando o que você quer ganhar neste Natal! Peça ajuda para um adulto. Eu vou adorar ler!"
    : ` ${goal}`;
  const speech = `Ho ho ho! Parabéns, ${name || "meu pequeno ajudante"}! Você ${p.feat}! ${cheer}Ganhou a medalha ${medal.title}!${invite}`;

  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    const s = window.speechSynthesis;
    s.cancel();
    const u = new SpeechSynthesisUtterance(speech.replace(/[^\p{L}\p{N}\s.,!?]/gu, ""));
    u.lang = "pt-BR";
    const pt = s.getVoices().filter((v) => v.lang?.toLowerCase().startsWith("pt"));
    u.voice = pt.find((v) => /daniel|ricardo|ant[oô]nio|felipe|male|masculin/i.test(v.name)) || pt.find((v) => /br/i.test(v.lang)) || pt[0] || null;
    u.pitch = 0.75;
    u.rate = 0.92;
    s.speak(u);
  };

  // texto aparecendo letra por letra + sininhos + voz
  useEffect(() => {
    let i = 0;
    setTyped("");
    const t = setInterval(() => {
      i += 2;
      setTyped(speech.slice(0, i));
      if (i >= speech.length) clearInterval(t);
    }, 28);
    const v = setTimeout(() => {
      if (spokenRef.current) return;
      spokenRef.current = true;
      musicBox.sleighBells(1.2, 0.08);
      setTimeout(speak, 900);
    }, 500);
    return () => {
      clearInterval(t);
      clearTimeout(v);
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* nada */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech]);

  const makeCert = async (who: string) => {
    if (certBusy) return;
    setCertBusy(true);
    try {
      const c = await renderCertificate({ player: who, title: medal.title, emoji: medal.emoji, score: p.score, game: p.game, feat: `Ajudou o Papai Noel e ${p.feat}` });
      const b = await canvasToBlob(c, "image/jpeg", 0.92);
      const r = await shareOrDownload(b, `Certificado-${safeName(who || "Ajudante")}.jpg`, `🏅 ${who || "Meu ajudante"} ganhou o Certificado de Ajudante do Papai Noel!`, "Certificado do Papai Noel");
      if (r === "downloaded") {
        setNote("Certificado salvo! Dá para imprimir e colar na geladeira. 🏅");
        setTimeout(() => setNote(null), 4000);
      }
      [79, 84, 88, 91].forEach((n, i) => setTimeout(() => musicBox.chime(n, undefined, 0.12), i * 90));
    } finally {
      setCertBusy(false);
    }
  };

  const onCert = () => {
    if (!name) {
      setAskName(true);
      return;
    }
    makeCert(name);
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center py-2">
      {/* Papai Noel falando */}
      <div className="flex items-start gap-2 w-full mt-8 sm:mt-2">
        <motion.div
          className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#EF233C] to-[#9B021A] border-2 border-[#FFD166] flex items-center justify-center text-4xl sm:text-5xl shadow-xl"
          initial={{ scale: 0, rotate: -40 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 12 }}
          aria-hidden="true"
        >
          <motion.span animate={{ rotate: [-6, 6, -6], y: [0, -2, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
            🎅
          </motion.span>
          <motion.span
            className="absolute -right-2 -top-1 text-2xl"
            animate={{ rotate: [0, 25, -10, 25, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.6 }}
            style={{ originX: 0.2, originY: 0.9 }}
          >
            👋
          </motion.span>
        </motion.div>
        <motion.div
          className="relative flex-1 bg-white text-[#1C2541] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-left text-[12.5px] sm:text-sm leading-snug shadow-lg min-h-[4.5rem]"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          id="santa-congrats-bubble"
        >
          {typed}
          {typed.length < speech.length && <span className="inline-block w-1.5 h-3.5 bg-[#9B021A] ml-0.5 animate-pulse align-middle" />}
          <button
            onClick={speak}
            className="absolute -bottom-3 right-2 bg-[#9B021A] text-white rounded-full px-2.5 py-1 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer shadow"
            aria-label="Ouvir o Papai Noel de novo"
          >
            <Volume2 className="w-3 h-3" /> Ouvir
          </button>
        </motion.div>
      </div>

      {/* medalha conquistada */}
      <motion.div
        className="mt-4 flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-2.5 border w-full"
        style={{ borderColor: `${p.accent}66` }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 220, damping: 14 }}
      >
        <motion.div
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FFE9A8] to-[#E9B949] border-2 border-[#B8860B] flex items-center justify-center text-3xl shrink-0"
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          {medal.emoji}
        </motion.div>
        <div className="text-left flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: p.accent }}>
            Medalha conquistada
          </p>
          <p className="font-cinzel text-white font-bold text-base sm:text-lg leading-tight">{medal.title}</p>
          <p className="text-white/70 text-xs">
            <span className="font-extrabold text-white text-sm">{p.score}</span> pontos
            {p.newBest && <span className="ml-1.5 text-[#FFD166] font-bold">🏆 Novo recorde!</span>}
          </p>
        </div>
      </motion.div>

      {/* botões para a criança */}
      <div className="flex gap-2 w-full mt-3">
        <motion.button
          onClick={p.onRetry}
          whileTap={{ scale: 0.95 }}
          className="flex-[1.3] rounded-full py-3.5 font-extrabold text-white text-base inline-flex items-center justify-center gap-2 border border-[#FFD166]/50 btn-shine cursor-pointer shadow-lg"
          style={{ background: `linear-gradient(90deg, ${p.accent}, #2DC653)` }}
          id={p.retryId}
        >
          <RotateCcw className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Jogar de novo</span>
        </motion.button>
        <motion.button
          onClick={onCert}
          whileTap={{ scale: 0.95 }}
          disabled={certBusy}
          className="flex-1 rounded-full py-3.5 font-extrabold text-[#0B132B] text-sm bg-gradient-to-r from-[#FFD166] to-[#F4A261] inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-70"
          id={`${p.anchor}-cert-btn`}
        >
          {certBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
          Certificado
        </motion.button>
      </div>
      {note && <p className="text-[11px] text-[#FFD166] mt-1.5">{note}</p>}

      {p.letterCta && p.onLetter && (
        <motion.button
          onClick={p.onLetter}
          whileTap={{ scale: 0.96 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="relative w-full mt-3 rounded-2xl p-3.5 text-left bg-gradient-to-r from-[#9B021A] via-[#D90429] to-[#9B021A] border-2 border-[#FFD166] flex items-center gap-3 cursor-pointer shadow-xl btn-shine animate-soft-pulse"
          id={`${p.anchor}-letter-cta`}
        >
          <motion.span className="text-4xl shrink-0 relative z-10" animate={{ rotate: [-8, 8, -8], y: [0, -3, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
            ✉️
          </motion.span>
          <span className="relative z-10 min-w-0">
            <span className="block font-extrabold text-white text-base leading-tight">Escrever minha cartinha para o Papai Noel</span>
            <span className="block text-[11px] text-[#FFE9A8] mt-0.5">Peça ajuda para um adulto • o Papai Noel responde!</span>
          </span>
        </motion.button>
      )}

      <AnimatePresence>
        {askName && (
          <motion.div className="w-full mt-3 bg-white/10 rounded-2xl p-3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <p className="text-xs text-white mb-2">🎅 Qual nome o Papai Noel escreve no certificado?</p>
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, 20))}
                placeholder="Ex: Sofia"
                autoFocus
                className="flex-1 min-w-0 bg-white/10 border border-white/30 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-[#FFD166]"
                onKeyDown={(e) => e.key === "Enter" && draft.trim() && (savePlayer(draft), p.onPlayer(draft.trim()), setAskName(false), makeCert(draft.trim()))}
                id={`${p.anchor}-cert-name`}
              />
              <button
                onClick={() => {
                  if (!draft.trim()) return;
                  savePlayer(draft);
                  p.onPlayer(draft.trim());
                  setAskName(false);
                  makeCert(draft.trim());
                }}
                className="rounded-full px-4 py-2 text-sm font-bold bg-[#FFD166] text-[#0B132B] cursor-pointer"
                id={`${p.anchor}-cert-ok`}
              >
                Pronto
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden sm:grid grid-cols-3 gap-2 w-full mt-3">
        {p.stats.map(([e, v, l]) => (
          <div key={l} className="bg-white/10 rounded-xl py-1.5">
            <div className="text-base leading-none">{e}</div>
            <div className="text-white font-extrabold text-sm">{v}</div>
            <div className="text-[10px] text-white/60">{l}</div>
          </div>
        ))}
      </div>

      {/* coleção de medalhas */}
      <div className="w-full mt-3">
        <div className="flex justify-between gap-1">
          {p.medals.map((m, i) => {
            const got = i <= Math.max(bestMedalIdx, idx);
            return (
              <div key={m.title} className="flex-1 flex flex-col items-center" title={m.title}>
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg border-2 ${
                    got ? "bg-gradient-to-br from-[#FFE9A8] to-[#E9B949] border-[#B8860B]" : "bg-white/5 border-white/15 grayscale opacity-40"
                  } ${i === idx ? "ring-2 ring-offset-2 ring-offset-transparent" : ""}`}
                  style={i === idx ? ({ "--tw-ring-color": p.accent } as React.CSSProperties) : undefined}
                >
                  {got ? m.emoji : "🔒"}
                </div>
                <span className="text-[9px] text-white/55 mt-0.5 leading-tight text-center line-clamp-2">{m.title}</span>
              </div>
            );
          })}
        </div>
        {next && (
          <div className="mt-2">
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: p.accent }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((p.score - medal.min) / (next.min - medal.min)) * 100)}%` }}
                transition={{ delay: 0.8, duration: 0.9 }}
              />
            </div>
            <p className="text-[11px] text-white/70 mt-1">
              Próxima medalha: {next.emoji} <b className="text-white">{next.title}</b> com {next.min} pontos
            </p>
          </div>
        )}
      </div>

      {/* área dos pais (discreta) */}
      <button
        onClick={() => setParents((v) => !v)}
        className="mt-4 text-[11px] text-white/55 hover:text-white/80 inline-flex items-center gap-1 cursor-pointer"
        id={`${p.anchor}-parents-btn`}
        aria-expanded={parents}
      >
        👨‍👩‍👧 Para os pais: compartilhar{p.onLetter && !p.letterCta ? " e carta do Papai Noel" : ""}
        <ChevronDown className={`w-3 h-3 transition-transform ${parents ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {parents && (
          <motion.div className="w-full mt-2 overflow-hidden" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <GameShareButtons
              card={{ game: p.game, score: p.score, title: medal.title, emoji: medal.emoji, player: name || undefined, newBest: p.newBest, anchor: p.anchor, stats: p.stats, accent: p.accent === "#FFD166" ? undefined : p.accent, palette: p.accent === "#FFD166" ? undefined : ["#071030", "#14295A", "#2D4E86"] }}
              getSnapshot={p.getSnapshot}
            />
            {p.onLetter && !p.letterCta && (
              <button
                onClick={p.onLetter}
                className="w-full rounded-2xl p-3 text-left bg-gradient-to-r from-[#9B021A] to-[#D90429] border border-[#FFD166]/40 flex items-center gap-3 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-[#FFD166] shrink-0" />
                <span className="text-xs text-white">
                  <b>Surpreenda {name || "seu filho"}:</b> peça uma carta do Papai Noel contando essa conquista. Vocês preenchem juntos em 1 minuto.
                </span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
