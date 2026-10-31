import { useCallback, useEffect, useRef, useState } from "react";
import { prettyCity, prettyName } from "../lib/prettyText";
import BackButton from "./BackButton";
import { useBackClose } from "../lib/backClose";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import EnvelopeIntro from "./EnvelopeIntro";
import confetti from "canvas-confetti";
import { Printer, Share2, Sparkles, Stamp, Volume2, Square, Lock, Check, BookmarkPlus } from "lucide-react";
import { requireParent, saveLetterToAccount } from "../lib/auth";
import ShareSheet, { WhatsIcon } from "./letter/ShareSheet";
import { whatsappUrl } from "../lib/shareKit";
import { Letter } from "../types";
import { narrate, type Narrator } from "../lib/narration";
import { musicBox } from "../lib/christmasMusic";
import { VOICES, voiceById, type VoiceId } from "../lib/voices";
import { LETTER_THEMES, letterTheme } from "../lib/letterThemes";

// [esquerda %, topo %, atraso s, tamanho]
const SPARKLES: [number, number, number, number][] = [
  [2, 3, 0, 18], [95, 2, 0.8, 14], [97, 22, 1.6, 12], [1, 30, 2.1, 12], [96, 48, 0.4, 16], [2, 58, 1.2, 14],
  [97, 72, 2.4, 12], [1, 86, 0.6, 16], [94, 96, 1.9, 18], [50, 0.5, 1.1, 12], [30, 98.5, 2.8, 12], [70, 99, 0.2, 14],
];

interface LetterViewProps {
  letter: Letter;
  onClose: () => void;
  onUpgrade?: (plan: "pro" | "natal") => void;
}

export default function LetterView({ letter, onClose, onUpgrade }: LetterViewProps) {
  const reduce = useReducedMotion();
  const [opened, setOpened] = useState(!!reduce);
  const handleOpened = useCallback(() => setOpened(true), []);
  const paragraphs = (letter.content || "").split(/\n\s*\n/).filter(Boolean);
  const isPro = letter.plan === "pro" || letter.plan === "natal";
  const cardRef = useRef<HTMLDivElement | null>(null);
  const narratorRef = useRef<Narrator | null>(null);
  const [speaking, setSpeaking] = useState<"idle" | "loading" | "playing">("idle");
  const [toast, setToast] = useState<string | null>(null);
  const [upsell, setUpsell] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [voiceId, setVoiceId] = useState<VoiceId>("noel");
  const [readIdx, setReadIdx] = useState(-1);
  const paraRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const [themeId, setThemeId] = useState(letterTheme(letter.theme).id);
  const T = letterTheme(themeId);
  const themedLetter = { ...letter, theme: themeId };
  useBackClose(true, onClose);

  const [saved, setSaved] = useState(false);
  const saveToAccount = async () => {
    if (saved) return;
    const parent = await requireParent("salvar");
    if (!parent) return;
    try {
      const r = await saveLetterToAccount(letter.id);
      setSaved(true);
      musicBox.chime(88, undefined, 0.1);
      showToast(r.emailed ? `Carta guardada! Enviamos o link para ${parent.email} 💌` : "Carta guardada em Minhas cartas! 💌");
    } catch (e: any) {
      showToast(e?.message || "Não foi possível guardar agora.");
    }
  };

  const pickTheme = (id: string) => {
    if (id === themeId) return;
    setThemeId(id);
    letter.theme = id;
    musicBox.chime(84, undefined, 0.08);
    const t = letterTheme(id);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.35 }, zIndex: 60, colors: [t.accent, t.accent2, t.frame, "#FFFFFF"] });
    fetch("/api/letter-theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ letterId: letter.id, theme: id }),
    }).catch(() => {
      /* a cor continua na tela mesmo sem salvar */
    });
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => () => narratorRef.current?.stop(), []);

  const handleListen = async () => {
    if (speaking !== "idle") {
      narratorRef.current?.stop();
      narratorRef.current = null;
      setSpeaking("idle");
      setReadIdx(-1);
      return;
    }
    setSpeaking("loading");
    // sininhos do trenó anunciando o Papai Noel
    musicBox.sleighBells(1.6);
    // plano grátis: prévia com os dois primeiros parágrafos
    const readParas = isPro ? paragraphs : paragraphs.slice(0, 2);
    const text = readParas.join("\n\n");
    // onde começa cada parágrafo (para destacar o trecho que está sendo lido)
    const total = readParas.reduce((a, p) => a + p.length, 0) || 1;
    const starts: number[] = [];
    readParas.reduce((acc, p) => (starts.push(acc / total), acc + p.length), 0);
    let last = -1;
    const voice = voiceById(isPro ? voiceId : "noel");
    narratorRef.current = await narrate(
      text,
      letter.childName,
      () => {
        setSpeaking("idle");
        setReadIdx(-1);
        if (!isPro) setUpsell(true);
      },
      { token: letter.token },
      {
        voice,
        onProgress: (f) => {
          let idx = 0;
          for (let k = 0; k < starts.length; k++) if (f >= starts[k]) idx = k;
          if (idx !== last) {
            last = idx;
            setReadIdx(idx);
            if (idx > 0) musicBox.chime(84 + (idx % 4) * 2, undefined, 0.06);
            paraRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        },
      },
    );
    setSpeaking((st) => (st === "loading" ? "playing" : st));
  };

  const pickVoice = (id: VoiceId) => {
    const v = voiceById(id);
    if (v.pro && !isPro) {
      setUpsell(true);
      showToast(`A voz ${v.emoji} ${v.label} faz parte do Natal Completo`);
      return;
    }
    if (speaking !== "idle") {
      narratorRef.current?.stop();
      narratorRef.current = null;
      setSpeaking("idle");
    }
    setVoiceId(id);
    musicBox.chime(88, undefined, 0.08);
  };

  // Chuva de confete dourado e vermelho quando a carta abre
  useEffect(() => {
    if (reduce || !opened) return;
    const colors = [T.frame, T.accent2, "#FFFFFF", T.accent];
    const fire = (ratio: number, opts: confetti.Options) =>
      confetti({ origin: { y: 0.65 }, colors, particleCount: Math.floor(180 * ratio), zIndex: 60, ...opts });
    const t = setTimeout(() => {
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }, 450);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, opened]);

  const shareUrl = `${window.location.origin}/natal/${letter.token}`;
  const waText = `🎅✨ Olha que lindo! O Papai Noel escreveu uma carta para ${letter.childName}! Abra e ouça a voz dele: ${shareUrl}`;

  return (
    <motion.div
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-start justify-center p-4 overflow-y-auto print:p-0 print:bg-white"
      style={{ "--ink": T.ink, "--accent": T.accent, "--accent2": T.accent2, "--frame": T.frame } as React.CSSProperties}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AnimatePresence mode="wait">
      {!opened ? (
        <EnvelopeIntro key="env" theme={T} childName={prettyName(letter.childName)} city={letter.city ? prettyCity(letter.city) : undefined} date={letter.date} onDone={handleOpened} />
      ) : (
      <motion.div
        key="letter"
        initial={reduce ? false : { opacity: 0, y: 80, rotateX: 25, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        style={{ transformPerspective: 1200 }}
        ref={cardRef}
        className="relative w-full max-w-2xl parchment-bg text-[#1C2541] rounded-3xl p-6 sm:p-10 border-4 border-[var(--frame)] shadow-2xl letter-glow my-auto transition-colors duration-500 print:border-none print:shadow-none print:p-6 print:rounded-none">
        {/* véu de cor do papel (fica atrás do texto) */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 rounded-3xl pointer-events-none transition-colors duration-500 print:hidden" style={{ background: T.tint }} />
        {/* brilhinhos dourados piscando pela carta */}
        {SPARKLES.map(([l, t, d, z], k) => (
          <span key={k} aria-hidden="true" className="letter-sparkle" style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${d}s`, fontSize: z }}>
            ✦
          </span>
        ))}
        {/* Controles (não aparecem na impressão nem no PDF) */}
        <div data-no-pdf className="pb-4 mb-4 border-b-2 border-[#1C2541]/15 print:hidden">
          <div className="flex justify-between items-center gap-2">
            <span className="font-cinzel text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
              Carta do Polo Norte
            </span>
            <BackButton onClick={onClose} light />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <motion.button
              onClick={handleListen}
              whileTap={{ scale: 0.95 }}
              className={`relative overflow-hidden rounded-full px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer text-white shadow-md ${
                speaking === "idle" ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] btn-shine" : "bg-[#1C2541]"
              }`}
            >
              {speaking === "idle" ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#FFD166] relative z-10" />
                  <span className="relative z-10">
                    {isPro ? `Ouvir: ${voiceById(voiceId).label}` : "Ouvir prévia da voz"}
                  </span>
                </>
              ) : speaking === "loading" ? (
                <>
                  <Sparkles className="w-4 h-4 text-[#FFD166] animate-spin" />
                  <span>🔔 Os sininhos do trenó estão chegando...</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-[#FFD166] fill-[#FFD166]" />
                  <span className="flex items-end gap-[2px] h-3.5" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span key={i} className="eq-bar w-[3px] bg-[#FFD166] rounded-sm" style={{ animationDelay: `${i * 0.12}s` }} />
                    ))}
                  </span>
                  <span>Parar</span>
                </>
              )}
            </motion.button>
            <motion.a
              href={whatsappUrl(waText)}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -2 }}
              className="bg-[#25D366] hover:bg-[#1EBE5A] text-[#06371B] rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 px-3.5 py-2 shadow-md"
              id="letter-whatsapp"
            >
              <WhatsIcon className="w-4 h-4" />
              WhatsApp
            </motion.a>
            <ToolButton onClick={() => setShareOpen(true)} icon={<Share2 className="w-4 h-4 text-[#FFD166]" />} id="letter-share">
              Compartilhar e baixar
            </ToolButton>
            <ToolButton onClick={() => window.print()} icon={<Printer className="w-4 h-4 text-[#FFD166]" />}>
              Imprimir
            </ToolButton>
            <ToolButton
              onClick={() => void saveToAccount()}
              icon={saved ? <Check className="w-4 h-4 text-[#2DC653]" /> : <BookmarkPlus className="w-4 h-4 text-[#FFD166]" />}
              id="letter-save"
            >
              {saved ? "Guardada" : "Guardar e receber por e-mail"}
            </ToolButton>
          </div>

          {/* escolha da voz */}
          <div className="mt-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink)] mb-1.5">Escolha quem vai ler a carta</p>
            <div className="flex flex-wrap gap-1.5">
              {VOICES.map((v) => {
                const locked = v.pro && !isPro;
                const active = (isPro ? voiceId : "noel") === v.id;
                return (
                  <motion.button
                    key={v.id}
                    onClick={() => pickVoice(v.id)}
                    whileTap={{ scale: 0.92 }}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1 cursor-pointer border transition-colors ${
                      active
                        ? "bg-[var(--ink)] text-white border-[var(--ink)] shadow"
                        : locked
                          ? "bg-[#1C2541]/5 text-[#1C2541]/55 border-[#1C2541]/15"
                          : "bg-white text-[#1C2541] border-[#1C2541]/20 hover:border-[var(--ink)]"
                    }`}
                    aria-pressed={active}
                    title={locked ? "Disponível no Natal Completo" : v.label}
                  >
                    <span>{v.emoji}</span>
                    {v.label}
                    {locked && <Lock className="w-3 h-3" />}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* cor da carta */}
          <div className="mt-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink)] mb-1.5">🎨 Cor da carta</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cor da carta">
              {LETTER_THEMES.map((t) => {
                const active = themeId === t.id;
                return (
                  <motion.button
                    key={t.id}
                    onClick={() => pickTheme(t.id)}
                    whileTap={{ scale: 0.9 }}
                    aria-pressed={active}
                    aria-label={t.name}
                    title={t.name}
                    className={`relative w-9 h-9 rounded-full flex items-center justify-center text-sm cursor-pointer border-2 shadow transition-transform ${
                      active ? "border-[#1C2541] scale-110" : "border-white hover:scale-105"
                    }`}
                    style={{ background: `linear-gradient(135deg, ${t.envelope[0]}, ${t.envelope[1]})` }}
                    id={`letter-theme-${t.id}`}
                  >
                    {t.emoji}
                    {active && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#1C2541] text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {upsell && !isPro && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-2xl bg-gradient-to-r from-[#1C2541] to-[#0B132B] text-white p-4 flex flex-col sm:flex-row items-center gap-3 border border-[#FFD166]/60">
                  <span className="text-3xl">🎅</span>
                  <p className="text-xs sm:text-sm flex-1 text-center sm:text-left">
                    <strong className="text-[#FFD166]">Gostou da voz?</strong> No Natal Completo o Papai Noel lê a carta
                    inteira, você baixa em PDF, imagem HD e vídeo com a voz, e ganha 24 dias de surpresas no Calendário do Advento.
                  </p>
                  <button
                    onClick={() => onUpgrade?.("natal")}
                    className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] text-white font-bold px-4 py-2 rounded-full text-xs sm:text-sm whitespace-nowrap btn-shine cursor-pointer"
                  >
                    <span className="relative z-10">Liberar tudo · R$ 29,90</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Letterhead */}
        <div className="flex justify-between items-center mb-6 border-b border-[#1C2541]/15 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--ink)]" />
              <span className="font-cinzel text-xs sm:text-sm font-extrabold tracking-widest text-[var(--ink)] uppercase foil-text">
                CORREIO REAL DO POLO NORTE
              </span>
            </div>
            <span className="text-xs text-[#1C2541]/70 font-serif italic">
              Expedição Oficial de Natal{letter.trackingCode ? ` • Registro #${letter.trackingCode}` : ""}
            </span>
          </div>
          <Stamp className="w-7 h-7 text-[var(--ink)]/60" />
        </div>

        {/* Destination Details */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-x-4 gap-y-2" id="letter-address">
          <div className="relative min-w-0 max-w-full bg-[var(--accent)]/[0.06] border border-dashed border-[var(--accent)]/35 rounded-xl pl-3.5 pr-4 py-2 text-[var(--ink)]">
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/70">Para</span>
            <span className="block font-handwriting text-2xl leading-tight break-words foil-text">
              {prettyName(letter.childName)}
              {letter.age ? <span className="font-sans text-xs font-bold text-[var(--ink)]/75 align-middle ml-2 whitespace-nowrap">{letter.age} anos</span> : null}
            </span>
            {letter.city && (
              <span className="mt-0.5 flex items-start gap-1 text-xs font-semibold text-[#1C2541]/75 break-words">
                <span aria-hidden="true">📍</span>
                <span className="min-w-0">{prettyCity(letter.city)}</span>
              </span>
            )}
          </div>
          <span className="text-xs text-[#1C2541]/60 font-mono pt-1 whitespace-nowrap">{letter.date}</span>
        </div>

        {/* Letter Body */}
        <div className="font-serif text-sm sm:text-base leading-relaxed space-y-4 text-[#1C2541] whitespace-pre-line my-4">
          {paragraphs.map((p, i) => {
            const reading = readIdx === i;
            const dim = readIdx >= 0 && !reading;
            return (
              <motion.p
                key={i}
                ref={(el) => {
                  paraRefs.current[i] = el;
                }}
                initial={reduce ? false : { opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: dim ? 0.55 : 1, y: 0, filter: "blur(0px)", scale: reading ? 1.015 : 1 }}
                transition={readIdx >= 0 ? { duration: 0.5 } : { delay: 0.6 + i * 0.35, duration: 0.6 }}
                className={`relative rounded-xl transition-colors duration-500 ${
                  reading ? "bg-[#FFD166]/25 shadow-[0_0_0_2px_rgba(255,209,102,0.55)] px-3 py-2 -mx-3" : ""
                } ${/^P\.?\s?S\.?/i.test(p) ? "font-handwriting text-2xl sm:text-3xl text-[var(--ink)] leading-snug pt-2 -rotate-1" : ""}`}
              >
                {reading && (
                  <>
                    <motion.span
                      aria-hidden="true"
                      className="absolute -left-1 -top-3 text-base select-none pointer-events-none"
                      animate={{ rotate: [-18, 18, -18], y: [0, -3, 0] }}
                      transition={{ duration: 0.9, repeat: Infinity }}
                      data-no-pdf
                    >
                      🔔
                    </motion.span>
                    {[0, 1, 2].map((k) => (
                      <motion.span
                        key={k}
                        aria-hidden="true"
                        className="absolute text-[#E9B949] text-xs select-none pointer-events-none"
                        style={{ right: `${8 + k * 14}%`, top: k % 2 ? "-10px" : "auto", bottom: k % 2 ? "auto" : "-10px" }}
                        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 90, 180] }}
                        transition={{ duration: 1.6, repeat: Infinity, delay: k * 0.45 }}
                        data-no-pdf
                      >
                        ✦
                      </motion.span>
                    ))}
                  </>
                )}
                {p}
              </motion.p>
            );
          })}
        </div>

        {/* Footer with Seals and Signatures */}
        <div className="mt-8 pt-6 border-t-2 border-[#1C2541]/15 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <motion.span
                initial={reduce ? false : { scale: 3, opacity: 0, rotate: -40 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.8 + paragraphs.length * 0.35, type: "spring", stiffness: 300, damping: 14 }}
                style={{ background: `radial-gradient(circle at 35% 35%, ${T.seal[0]}, ${T.seal[1]})` }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold text-[#FFD166] border border-[#FFD166] shadow">
                2026
              </motion.span>
              <div>
                <span className="text-[10px] uppercase font-cinzel font-bold text-[var(--ink)] block">
                  Selo Real do Polo Norte
                </span>
                <span className="text-[9px] text-[#1C2541]/60">
                  Autenticidade Garantida
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="font-handwriting text-3xl sm:text-4xl text-[var(--ink)] font-bold block -mb-2 foil-text">
              Papai Noel
            </span>
            <span className="text-[10px] text-[#1C2541]/60 uppercase tracking-wider font-cinzel">
              Oficina Central de Brinquedos
            </span>
          </div>
        </div>
      </motion.div>
      )}
      </AnimatePresence>

      {/* selo "lendo agora", com o Papai Noel balançando e sininhos */}
      <AnimatePresence>
        {speaking === "playing" && (
          <motion.div
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[65] flex items-center gap-3 bg-[#0B132B]/95 text-white rounded-full pl-2 pr-2 py-2 border border-[#FFD166]/60 shadow-2xl backdrop-blur print:hidden"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            data-no-pdf
          >
            <motion.span
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--ink)] flex items-center justify-center text-xl border border-[#FFD166]/60"
              animate={{ rotate: [-8, 8, -8], y: [0, -2, 0] }}
              transition={{ duration: 1.1, repeat: Infinity }}
              aria-hidden="true"
            >
              {voiceById(isPro ? voiceId : "noel").emoji}
            </motion.span>
            <div className="text-xs sm:text-sm leading-tight">
              <p className="font-bold">{voiceById(isPro ? voiceId : "noel").label} está lendo...</p>
              <span className="flex items-end gap-[2px] h-3 mt-1" aria-hidden="true">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <span key={i} className="eq-bar w-[3px] bg-[#FFD166] rounded-sm" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </span>
            </div>
            <motion.span aria-hidden="true" animate={{ rotate: [-20, 20, -20] }} transition={{ duration: 0.6, repeat: Infinity }}>
              🔔
            </motion.span>
            <button
              onClick={handleListen}
              className="ml-1 rounded-full bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-bold cursor-pointer"
            >
              Parar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {shareOpen && (
          <ShareSheet
            letter={themedLetter}
            isPro={isPro}
            voice={voiceById(isPro ? voiceId : "noel")}
            onClose={() => setShareOpen(false)}
            onUpgrade={onUpgrade ? () => onUpgrade("natal") : undefined}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-[#0B132B] text-white text-sm font-semibold px-5 py-3 rounded-full border border-[#FFD166]/60 shadow-2xl flex items-center gap-2 max-w-[90vw] break-words"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Check className="w-4 h-4 text-[#2DC653] shrink-0" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ToolButton({ onClick, icon, children, id }: { onClick: () => void; icon: React.ReactNode; children: React.ReactNode; id?: string }) {
  return (
    <motion.button
      onClick={onClick}
      id={id}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="bg-[#1C2541] hover:bg-[#2A3555] text-white rounded-full text-xs sm:text-sm flex items-center gap-1.5 px-3.5 py-2 transition-colors cursor-pointer"
    >
      {icon}
      <span>{children}</span>
    </motion.button>
  );
}
