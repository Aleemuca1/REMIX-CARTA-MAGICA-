import { useEffect } from "react";
import { motion } from "motion/react";

/**
 * Animação do envelope do Polo Norte: o selo de cera se rompe,
 * a aba abre e a carta sobe. Clique para pular.
 */
export default function EnvelopeIntro({ childName, onDone }: { childName: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="relative w-[300px] sm:w-[380px] h-[200px] sm:h-[250px] cursor-pointer select-none"
      initial={{ y: 60, opacity: 0, scale: 0.8, rotate: -6 }}
      animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.3 } }}
      transition={{ type: "spring", stiffness: 160, damping: 16 }}
      onClick={onDone}
      title="Clique para abrir"
      style={{ perspective: 1000 }}
    >
      {/* Carta saindo do envelope */}
      <motion.div
        className="absolute left-4 right-4 top-4 bottom-4 parchment-bg rounded-lg border-2 border-[#FFD166] shadow-xl flex flex-col items-center justify-start pt-4 text-[#9B021A] z-10"
        initial={{ y: 0 }}
        animate={{ y: -120 }}
        transition={{ delay: 1.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
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
        <span className="absolute bottom-4 left-0 right-0 text-center font-handwriting text-2xl sm:text-3xl text-[#FFD166]">
          {childName}
        </span>
      </div>

      {/* Aba do envelope */}
      <motion.div
        className="absolute left-0 right-0 top-0 h-1/2 z-30 origin-top"
        initial={{ rotateX: 0, zIndex: 30 }}
        animate={{ rotateX: 180, zIndex: 5 }}
        transition={{ delay: 1.0, duration: 0.6, ease: "easeInOut", zIndex: { delay: 1.3, duration: 0 } }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="w-full h-full bg-gradient-to-b from-[#D90429] to-[#9B021A] border-x-2 border-t-2 border-[#FFD166]/70 rounded-t-xl"
          style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
        />
      </motion.div>

      {/* Selo de cera */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 wax-seal w-16 h-16 rounded-full border-2 border-[#FFD166] flex items-center justify-center font-cinzel text-[10px] font-extrabold text-[#FFD166]"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.15, 1.15, 0], rotate: [0, -10, 10, 40], opacity: [1, 1, 1, 0] }}
        transition={{ delay: 0.3, duration: 0.8, times: [0, 0.3, 0.6, 1] }}
      >
        PN
      </motion.div>

      <motion.p
        className="absolute -bottom-10 left-0 right-0 text-center text-xs text-[#EDF2F4]/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Uma carta chegou do Polo Norte... ✨
      </motion.p>
    </motion.div>
  );
}
