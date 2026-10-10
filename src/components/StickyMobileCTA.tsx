import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

/** Botão fixo no rodapé do celular, aparece depois que a pessoa rola a página. */
export default function StickyMobileCTA({ onClick }: { onClick: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-0 inset-x-0 z-40 p-3 md:hidden bg-gradient-to-t from-[#060B19] via-[#060B19]/95 to-transparent"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
        >
          <button
            onClick={onClick}
            data-celebrate
            className="w-full bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-lg border border-[#FFD166]/50 btn-shine animate-soft-pulse cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FFD166] relative z-10" />
            <span className="relative z-10">Criar a carta do meu filho grátis</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
