import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import EnvelopeIntro from "./EnvelopeIntro";
import confetti from "canvas-confetti";
import { X, Printer, Share2, Sparkles, Stamp, Volume2, Square, Download, Lock, Check } from "lucide-react";
import { Letter } from "../types";
import { narrate, type Narrator } from "../lib/narration";

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
  const [pdfBusy, setPdfBusy] = useState(false);

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
      return;
    }
    setSpeaking("loading");
    // plano grátis: prévia com os dois primeiros parágrafos
    const text = isPro ? letter.content : paragraphs.slice(0, 2).join("\n\n");
    narratorRef.current = await narrate(
      text,
      letter.childName,
      () => {
        setSpeaking("idle");
        if (!isPro) setUpsell(true);
      },
      letter.token,
    );
    setSpeaking((st) => (st === "loading" ? "playing" : st));
  };

  const handlePdf = async () => {
    if (!isPro) {
      setUpsell(true);
      return;
    }
    if (!cardRef.current || pdfBusy) return;
    setPdfBusy(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#FCF9F2",
        ignoreElements: (el) => el.hasAttribute("data-no-pdf"),
      });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210, pageH = 297, margin = 10;
      let w = pageW - margin * 2;
      let h = (canvas.height * w) / canvas.width;
      if (h > pageH - margin * 2) {
        h = pageH - margin * 2;
        w = (canvas.width * h) / canvas.height;
      }
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", (pageW - w) / 2, margin, w, h);
      pdf.save(`Carta-do-Papai-Noel-${letter.childName}.pdf`);
      showToast("PDF baixado! 🎄");
    } catch {
      showToast("Não foi possível gerar o PDF agora.");
    } finally {
      setPdfBusy(false);
    }
  };

  // Chuva de confete dourado e vermelho quando a carta abre
  useEffect(() => {
    if (reduce || !opened) return;
    const colors = ["#FFD166", "#EF233C", "#FFFFFF", "#2DC653"];
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
  }, [reduce, opened]);

  const handlePrint = () => {
    window.print();
  };

  const shareUrl = `${window.location.origin}/natal/${letter.token}`;
  const handleShare = async () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Carta do Papai Noel para ${letter.childName}`,
          text: `Olha a cartinha que o Papai Noel escreveu para ${letter.childName}! 🎅`,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Link da carta copiado! ✨");
      } catch {
        showToast(shareUrl);
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-start justify-center p-4 overflow-y-auto print:p-0 print:bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AnimatePresence mode="wait">
      {!opened ? (
        <EnvelopeIntro key="env" childName={letter.childName} onDone={handleOpened} />
      ) : (
      <motion.div
        key="letter"
        initial={reduce ? false : { opacity: 0, y: 80, rotateX: 25, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        style={{ transformPerspective: 1200 }}
        ref={cardRef}
        className="relative w-full max-w-2xl parchment-bg text-[#1C2541] rounded-3xl p-6 sm:p-10 border-4 border-[#FFD166] shadow-2xl my-auto print:border-none print:shadow-none print:p-6 print:rounded-none">
        {/* Controles (não aparecem na impressão nem no PDF) */}
        <div data-no-pdf className="pb-4 mb-4 border-b-2 border-[#1C2541]/15 print:hidden">
          <div className="flex justify-between items-center gap-2">
            <span className="font-cinzel text-xs font-bold text-[#9B021A] uppercase tracking-wider">
              Carta do Polo Norte
            </span>
            <button
              onClick={onClose}
              className="text-[#1C2541]/70 hover:text-[#1C2541] p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Fechar carta"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <motion.button
              onClick={handleListen}
              whileTap={{ scale: 0.95 }}
              className={`relative overflow-hidden rounded-full px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer text-white shadow-md ${
                speaking === "idle" ? "bg-gradient-to-r from-[#D90429] to-[#EF233C] btn-shine" : "bg-[#1C2541]"
              }`}
            >
              {speaking === "idle" ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#FFD166] relative z-10" />
                  <span className="relative z-10">{isPro ? "Ouvir o Papai Noel" : "Ouvir prévia da voz"}</span>
                </>
              ) : speaking === "loading" ? (
                <>
                  <Sparkles className="w-4 h-4 text-[#FFD166] animate-spin" />
                  <span>Papai Noel limpando a garganta...</span>
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
            <ToolButton onClick={handlePdf} icon={isPro ? <Download className="w-4 h-4 text-[#FFD166]" /> : <Lock className="w-3.5 h-3.5 text-[#FFD166]" />}>
              {pdfBusy ? "Gerando PDF..." : "Baixar PDF"}
            </ToolButton>
            <ToolButton onClick={() => window.print()} icon={<Printer className="w-4 h-4 text-[#FFD166]" />}>
              Imprimir
            </ToolButton>
            <ToolButton onClick={handleShare} icon={<Share2 className="w-4 h-4 text-[#FFD166]" />}>
              Compartilhar
            </ToolButton>
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
                    <strong className="text-[#FFD166]">Gostou da voz?</strong> No plano Magia Completa o Papai Noel lê a carta
                    inteira, e você baixa o PDF em alta para imprimir.
                  </p>
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => onUpgrade?.("pro")}
                      className="bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white font-bold px-4 py-2 rounded-full text-xs sm:text-sm whitespace-nowrap btn-shine cursor-pointer"
                    >
                      <span className="relative z-10">Magia Completa · R$ 19,90</span>
                    </button>
                    <button
                      onClick={() => onUpgrade?.("natal")}
                      className="bg-[#FFD166] text-[#0B132B] font-bold px-4 py-2 rounded-full text-xs sm:text-sm whitespace-nowrap cursor-pointer hover:brightness-105"
                    >
                      + Calendário do Advento · R$ 29,90
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Letterhead */}
        <div className="flex justify-between items-center mb-6 border-b border-[#1C2541]/15 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#9B021A]" />
              <span className="font-cinzel text-xs sm:text-sm font-extrabold tracking-widest text-[#9B021A] uppercase">
                CORREIO REAL DO POLO NORTE
              </span>
            </div>
            <span className="text-xs text-[#1C2541]/70 font-serif italic">
              Expedição Oficial de Natal{letter.trackingCode ? ` • Registro #${letter.trackingCode}` : ""}
            </span>
          </div>
          <Stamp className="w-7 h-7 text-[#9B021A]/60" />
        </div>

        {/* Destination Details */}
        <div className="mb-6 flex justify-between items-center text-xs">
          <span className="bg-[#D90429]/10 text-[#9B021A] font-bold px-3 py-1 rounded-full border border-[#D90429]/20">
            Para: {letter.childName}, {letter.age} anos • {letter.city}
          </span>
          <span className="text-[#1C2541]/60 font-mono">
            {letter.date}
          </span>
        </div>

        {/* Letter Body */}
        <div className="font-serif text-sm sm:text-base leading-relaxed space-y-4 text-[#1C2541] whitespace-pre-line my-4">
          {paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={reduce ? false : { opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.6 + i * 0.35, duration: 0.6 }}
            >
              {p}
            </motion.p>
          ))}
        </div>

        {/* Footer with Seals and Signatures */}
        <div className="mt-8 pt-6 border-t-2 border-[#1C2541]/15 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <motion.span
                initial={reduce ? false : { scale: 3, opacity: 0, rotate: -40 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.8 + paragraphs.length * 0.35, type: "spring", stiffness: 300, damping: 14 }}
                className="w-8 h-8 rounded-full wax-seal flex items-center justify-center text-[9px] font-bold text-[#FFD166] border border-[#FFD166]">
                2026
              </motion.span>
              <div>
                <span className="text-[10px] uppercase font-cinzel font-bold text-[#9B021A] block">
                  Selo Real do Polo Norte
                </span>
                <span className="text-[9px] text-[#1C2541]/60">
                  Autenticidade Garantida
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="font-handwriting text-3xl sm:text-4xl text-[#9B021A] font-bold block -mb-2">
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

      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-[#0B132B] text-white text-sm font-semibold px-5 py-3 rounded-full border border-[#FFD166]/60 shadow-2xl flex items-center gap-2 max-w-[90vw] break-all"
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

function ToolButton({ onClick, icon, children }: { onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="bg-[#1C2541] hover:bg-[#2A3555] text-white rounded-full text-xs sm:text-sm flex items-center gap-1.5 px-3.5 py-2 transition-colors cursor-pointer"
    >
      {icon}
      <span>{children}</span>
    </motion.button>
  );
}
