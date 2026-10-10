import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import confetti from "canvas-confetti";
import { Sparkles } from "lucide-react";
import Reveal from "./Reveal";
import { musicBox } from "../lib/christmasMusic";

/** Presente interativo: clique para abrir e descobrir a surpresa. */
export default function GiftSurprise({ onStart }: { onStart: () => void }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  const openGift = (e: React.MouseEvent) => {
    if (open) return;
    setOpen(true);
    [79, 84, 88, 91].forEach((n, i) => setTimeout(() => musicBox.chime(n), i * 110));
    if (!reduce) {
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      confetti({
        particleCount: 120,
        spread: 90,
        startVelocity: 38,
        origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 3) / window.innerHeight },
        colors: ["#FFD166", "#EF233C", "#2DC653", "#FFFFFF"],
        zIndex: 60,
      });
    }
  };

  return (
    <section className="py-16 md:py-20 px-4 max-w-4xl mx-auto text-center" id="presente">
      <Reveal>
        <span className="text-xs text-[#FFD166] uppercase font-bold tracking-widest block mb-2">
          Tem uma surpresa para você
        </span>
        <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8">
          {open ? "Presente aberto! 🎉" : "Clique no presente 🎁"}
        </h2>
      </Reveal>

      <div className={`relative mx-auto w-48 h-56 sm:w-56 sm:h-64 transition-[margin] duration-500 ${open ? "mt-36" : "mt-0"}`}>
        <AnimatePresence>
          {open && (
            <motion.div
              className="absolute inset-x-0 -top-4 z-0 flex flex-col items-center"
              initial={{ y: 60, opacity: 0, scale: 0.6 }}
              animate={{ y: -130, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 140, damping: 12, delay: 0.25 }}
            >
              <div className="parchment-bg border-2 border-[#FFD166] rounded-xl px-5 py-4 shadow-2xl text-[#1C2541] w-64 sm:w-72">
                <p className="font-cinzel text-[#9B021A] font-bold text-sm">Vale-Carta Mágica</p>
                <p className="font-handwriting text-3xl text-[#9B021A] leading-tight">Sua 1ª carta é grátis!</p>
                <p className="text-[11px] text-[#1C2541]/70 mt-1">Personalizada com o nome do seu filho, pronta em 2 minutos.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={openGift}
          className="absolute inset-x-0 bottom-0 mx-auto w-44 sm:w-52 cursor-pointer z-10"
          animate={open || reduce ? {} : { rotate: [0, -4, 4, -3, 3, 0], y: [0, -6, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 1.6 }}
          aria-label="Abrir presente"
        >
          {/* tampa */}
          <motion.div
            className="relative h-10 sm:h-12 mx-[-6px] rounded-md bg-gradient-to-b from-[#EF233C] to-[#B5001F] border-2 border-[#FFD166]/70 shadow-lg z-20"
            animate={open ? { y: -90, rotate: -24, x: -40, opacity: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 bg-[#FFD166]" />
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-4xl">🎀</div>
          </motion.div>
          {/* caixa */}
          <div className="relative h-32 sm:h-36 rounded-b-md bg-gradient-to-b from-[#D90429] to-[#7A0015] border-2 border-t-0 border-[#FFD166]/70 shadow-2xl overflow-hidden">
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 bg-[#FFD166]" />
            {open && <div className="absolute inset-0 bg-gradient-to-t from-transparent to-[#FFE194]/60 animate-pulse" />}
          </div>
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.button
            onClick={onStart}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-10 bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] text-white font-bold px-8 py-4 rounded-full inline-flex items-center gap-2 shadow-lg border border-[#FFD166]/50 btn-shine animate-soft-pulse cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-[#FFD166] relative z-10" />
            <span className="relative z-10">Usar meu vale e criar a carta</span>
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
}
