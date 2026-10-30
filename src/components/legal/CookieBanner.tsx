import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const KEY = "carta-magica-cookies";

/** Aviso de cookies/armazenamento local (só usamos itens necessários). */
export default function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let seen = false;
    try {
      seen = !!localStorage.getItem(KEY);
    } catch {
      /* sem armazenamento: mostra sempre */
    }
    if (!seen) {
      const t = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);
  const ok = () => {
    try {
      localStorage.setItem(KEY, new Date().toISOString());
    } catch {
      /* ignora */
    }
    setShow(false);
  };
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="dialog"
          aria-label="Aviso de cookies"
          className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 sm:max-w-sm z-[70] bg-[#0B132B]/95 backdrop-blur border border-[#FFD166]/50 rounded-2xl p-4 shadow-2xl text-sm text-[#EDF2F4]"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
        >
          <p className="font-bold text-[#FFD166] mb-1">🍪 Biscoitinhos do Polo Norte</p>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-3">
            Guardamos no seu navegador só o necessário para o site funcionar (progresso do calendário e recorde do jogo). Não usamos cookies de
            publicidade.{" "}
            <a href="/cookies" className="underline text-[#FFD166]">
              Saiba mais
            </a>
            .
          </p>
          <button onClick={ok} className="w-full bg-[#FFD166] hover:bg-[#FFE194] text-[#0B132B] font-bold rounded-full py-2 cursor-pointer">
            Entendi
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
