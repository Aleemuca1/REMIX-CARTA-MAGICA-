import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, Volume2 } from "lucide-react";
import BackButton from "../BackButton";
import { useBackClose } from "../../lib/backClose";
import { musicBox } from "../../lib/christmasMusic";
import { OrnamentShape } from "./TreeSvg";
import type { Ornament } from "../../tree/model";

/** Modo Ceia: as frases da árvore aparecem uma a uma, em tela cheia, para a família ler junta. */
export default function CeiaMode({ title, ornaments, onClose }: { title: string; ornaments: Ornament[]; onClose: () => void }) {
  useBackClose(true, onClose);
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const n = ornaments.length;
  const cur = ornaments[i % Math.max(1, n)];

  const go = (d: number) => {
    setI((v) => (v + d + n) % n);
    musicBox.chime(76 + ((i + d) % 5) * 2, undefined, 0.12);
  };

  useEffect(() => {
    if (!auto || n < 2) return;
    const t = setTimeout(() => go(1), 7000);
    return () => clearTimeout(t);
  }, [auto, i, n]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const speak = () => {
    if (!cur?.text || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(`${cur.text}${cur.author ? `. De ${cur.author}.` : ""}`);
    u.lang = "pt-BR";
    u.rate = 0.92;
    window.speechSynthesis.speak(u);
  };

  if (!cur) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[120] bg-gradient-to-b from-[#060B19] via-[#0B132B] to-[#123524] flex flex-col items-center justify-center p-5 text-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute top-4 left-4">
        <BackButton onClick={onClose} />
      </div>
      {/* neve de fundo */}
      {Array.from({ length: 24 }, (_, k) => (
        <motion.span
          key={k}
          className="absolute text-white/40 pointer-events-none"
          style={{ left: `${(k * 41) % 100}%`, fontSize: 10 + (k % 4) * 5 }}
          initial={{ y: -40 }}
          animate={{ y: "110vh" }}
          transition={{ duration: 9 + (k % 6), repeat: Infinity, delay: (k % 8) * 0.9, ease: "linear" }}
        >
          ❄
        </motion.span>
      ))}

      <p className="font-cinzel text-[#FFD166] text-sm sm:text-lg tracking-widest uppercase mb-6 relative">
        ✨ {title || "Nossa Árvore de Natal"} ✨
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={cur.id}
          className="relative max-w-3xl w-full"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
        >
          <svg viewBox="-30 -34 60 60" className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4">
            <OrnamentShape o={cur} />
          </svg>
          <p className="font-serif italic text-white text-2xl sm:text-4xl md:text-5xl leading-snug">“{cur.text}”</p>
          {cur.author && <p className="mt-5 text-[#FFD166] font-bold text-lg sm:text-2xl">— {cur.author}</p>}
        </motion.div>
      </AnimatePresence>

      <div className="relative mt-10 flex items-center gap-3">
        <RoundBtn onClick={() => go(-1)} label="Anterior">
          <ChevronLeft className="w-6 h-6" />
        </RoundBtn>
        <RoundBtn onClick={() => setAuto((v) => !v)} label={auto ? "Pausar" : "Passar sozinho"}>
          {auto ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </RoundBtn>
        <RoundBtn onClick={speak} label="Ouvir">
          <Volume2 className="w-5 h-5" />
        </RoundBtn>
        <RoundBtn onClick={() => go(1)} label="Próxima">
          <ChevronRight className="w-6 h-6" />
        </RoundBtn>
      </div>
      <p className="relative mt-4 text-white/50 text-sm">
        {(i % n) + 1} de {n}
      </p>
    </motion.div>
  );
}

function RoundBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center cursor-pointer"
    >
      {children}
    </button>
  );
}
