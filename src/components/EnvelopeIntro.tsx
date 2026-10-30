import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { musicBox } from "../lib/christmasMusic";

/**
 * Envelope do Polo Norte: a criança toca no selo de cera, ele se quebra em dois,
 * a aba abre e a carta sobe. Se ninguém tocar, abre sozinho depois de alguns segundos.
 */
export default function EnvelopeIntro({ childName, city, date, onDone }: { childName: string; city?: string; date?: string; onDone: () => void }) {
  const [state, setState] = useState<"closed" | "cracking" | "open">("closed");

  const crack = () => {
    if (state !== "closed") return;
    setState("cracking");
    musicBox.chime(60, undefined, 0.14);
    setTimeout(() => musicBox.sleighBells(1.4, 0.09), 250);
    setTimeout(() => setState("open"), 650);
    setTimeout(onDone, 2300);
  };

  // abre sozinho se ninguém tocar (ex.: celular parado na mesa)
  useEffect(() => {
    const t = setTimeout(crack, 9000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const opened = state !== "closed";

  return (
    <motion.div
      className="relative self-center my-auto w-[310px] sm:w-[420px] h-[210px] sm:h-[280px] cursor-pointer select-none"
      initial={{ y: 60, opacity: 0, scale: 0.8, rotate: -6 }}
      animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.3 } }}
      transition={{ type: "spring", stiffness: 160, damping: 16 }}
      onClick={crack}
      role="button"
      aria-label={`Abrir a carta de ${childName}`}
      id="envelope"
      style={{ perspective: 1000 }}
    >
      {/* Carta saindo do envelope */}
      <motion.div
        className="absolute left-4 right-4 top-4 bottom-4 parchment-bg rounded-lg border-2 border-[#FFD166] shadow-xl flex flex-col items-center justify-start pt-4 text-[#9B021A] z-10"
        animate={{ y: state === "open" ? -130 : 0 }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="font-cinzel text-[10px] tracking-widest font-bold">CORREIO DO POLO NORTE</span>
        <span className="font-handwriting text-3xl sm:text-4xl mt-1">Para {childName}</span>
      </motion.div>

      {/* Corpo do envelope */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#B5001F] to-[#7A0015] border-2 border-[#FFD166]/70 shadow-2xl z-20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top right, transparent 49.5%, rgba(0,0,0,0.18) 50%), linear-gradient(to top left, transparent 49.5%, rgba(0,0,0,0.18) 50%)" }}
        />
        {/* destinatário */}
        <div className="absolute bottom-3 sm:bottom-5 left-0 right-0 text-center">
          <span className="block font-handwriting text-3xl sm:text-4xl text-[#FFD166] leading-none">{childName}</span>
          {city && <span className="block text-[10px] sm:text-xs text-[#FFE9A8]/80 mt-0.5">{city}</span>}
        </div>
        {/* selo postal */}
        <div className="absolute bottom-2.5 right-2.5 w-11 h-14 sm:w-14 sm:h-[4.5rem] bg-[#FFF6D8] rounded-[3px] p-1 shadow rotate-3" style={{ outline: "2px dashed #FFF6D8", outlineOffset: 1 }}>
          <div className="w-full h-full rounded-sm bg-gradient-to-b from-[#1C3D6E] to-[#0B132B] flex flex-col items-center justify-center text-base sm:text-xl leading-none">
            🦌
            <span className="text-[6px] sm:text-[7px] text-[#FFD166] font-bold mt-0.5">POLO NORTE</span>
          </div>
        </div>
        {/* carimbo */}
        <div className="absolute bottom-3 left-3 w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#FFE9A8]/55 flex flex-col items-center justify-center -rotate-12 text-[#FFE9A8]/70 text-[6px] sm:text-[7px] font-bold leading-tight text-center">
          <span>CORREIO REAL</span>
          <span className="text-[8px] sm:text-[9px]">★ {date || new Date().toLocaleDateString("pt-BR")} ★</span>
          <span>POLO NORTE</span>
        </div>
      </div>

      {/* Aba do envelope */}
      <motion.div
        className="absolute left-0 right-0 top-0 h-1/2 origin-top"
        initial={{ rotateX: 0 }}
        animate={opened ? { rotateX: 180, zIndex: 5 } : { rotateX: 0, zIndex: 30 }}
        transition={{ delay: opened ? 0.25 : 0, duration: 0.6, ease: "easeInOut", zIndex: { delay: 0.55, duration: 0 } }}
        style={{ transformStyle: "preserve-3d", zIndex: 30 }}
      >
        <div
          className="w-full h-full bg-gradient-to-b from-[#D90429] to-[#9B021A] border-x-2 border-t-2 border-[#FFD166]/70 rounded-t-xl"
          style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
        />
      </motion.div>

      {/* Selo de cera: inteiro, pulsando; ao tocar se parte em duas metades */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20">
        {!opened ? (
          <motion.div
            className="w-full h-full wax-seal rounded-full border-2 border-[#FFD166] flex items-center justify-center font-cinzel text-xs font-extrabold text-[#FFD166] shadow-xl"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            id="envelope-seal"
          >
            PN
          </motion.div>
        ) : (
          (["left", "right"] as const).map((side) => (
            <motion.div
              key={side}
              className="absolute inset-0 wax-seal rounded-full border-2 border-[#FFD166] flex items-center justify-center font-cinzel text-xs font-extrabold text-[#FFD166]"
              style={{ clipPath: side === "left" ? "polygon(0 0, 55% 0, 42% 35%, 58% 60%, 45% 100%, 0 100%)" : "polygon(55% 0, 100% 0, 100% 100%, 45% 100%, 58% 60%, 42% 35%)" }}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={{ x: side === "left" ? -70 : 70, y: 90, rotate: side === "left" ? -50 : 50, opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeIn" }}
            >
              PN
            </motion.div>
          ))
        )}
        {/* faíscas ao quebrar */}
        <AnimatePresence>
          {state === "cracking" &&
            Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-1/2 text-[#FFD166] text-sm pointer-events-none"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                  animate={{ x: Math.cos(a) * 80, y: Math.sin(a) * 80, opacity: 0, scale: 1.3 }}
                  transition={{ duration: 0.7 }}
                >
                  ✦
                </motion.span>
              );
            })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {!opened && (
          <motion.p
            className="absolute -bottom-12 left-0 right-0 text-center text-sm font-bold text-[#FFD166]"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: [0, -4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ y: { duration: 1.2, repeat: Infinity }, opacity: { delay: 0.6 } }}
          >
            👆 Toque no selo para abrir a carta
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
