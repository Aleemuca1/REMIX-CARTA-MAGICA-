import { motion } from "motion/react";
import { priceLabel } from "../lib/pricing";
import { Crown, Sparkles } from "lucide-react";
import { useBackClose } from "../lib/backClose";

/** Convite para o Natal Completo, mostrado quando a pessoa toca em algo do plano pago. */
export default function ProUpsell({
  title,
  text,
  onUpgrade,
  onClose,
}: {
  title: string;
  text: string;
  onUpgrade?: () => void;
  onClose: () => void;
}) {
  useBackClose(true, onClose);
  return (
    <motion.div
      className="fixed inset-0 z-[125] bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full sm:max-w-md bg-gradient-to-b from-[#1C2541] to-[#0B132B] border-2 border-[#FFD166] rounded-t-3xl sm:rounded-3xl p-6 text-center shadow-2xl"
        initial={{ y: 60, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 60 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        <motion.div
          className="text-5xl mb-2"
          animate={{ rotate: [-6, 6, -6], y: [0, -4, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          aria-hidden="true"
        >
          🎅👑
        </motion.div>
        <h4 className="font-cinzel text-xl sm:text-2xl font-bold text-white mb-2">{title}</h4>
        <p className="text-sm text-[#EDF2F4]/80 mb-4 leading-relaxed">{text}</p>
        <ul className="text-xs text-left text-[#EDF2F4]/80 space-y-1 bg-white/5 rounded-2xl p-3 mb-5 border border-white/10">
          <li>✓ 2 crianças e 10 cartas ({priceLabel("natal")}) ou 5 crianças e 23 cartas ({priceLabel("familia")})</li>
          <li>✓ 6 vozes lendo a carta inteira</li>
          <li>✓ Carta brilhante em 5 cores, PDF, imagem HD e certificado</li>
          <li>✓ 24 portinhas do Calendário do Advento</li>
          <li>✓ Árvore ilimitada, Modo Ceia com voz e Ateliê completo</li>
        </ul>
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] text-white font-bold py-3.5 rounded-full border border-[#FFD166]/50 btn-shine cursor-pointer inline-flex items-center justify-center gap-2"
            id="pro-upsell-btn"
          >
            <Crown className="w-4 h-4 text-[#FFD166] relative z-10" />
            <span className="relative z-10">Liberar tudo · a partir de {priceLabel("natal")}</span>
          </button>
        )}
        <button onClick={onClose} className="mt-3 text-sm text-white/60 hover:text-white underline cursor-pointer inline-flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Continuar no grátis
        </button>
      </motion.div>
    </motion.div>
  );
}
