import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { snow } from "../lib/snow";

/** Botão flutuante que liga/desliga a nevasca. */
export default function SnowToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => () => snow.setBlizzard(false), []);
  const toggle = () => {
    const next = !on;
    setOn(next);
    snow.setBlizzard(next);
  };
  return (
    <div className="fixed left-3 sm:left-5 bottom-[146px] md:bottom-[84px] z-50 flex items-center gap-2">
      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 shadow-xl cursor-pointer text-xl sm:text-2xl ${
          on ? "bg-gradient-to-br from-[#E0F2FF] to-[#8EC5FF] border-white" : "bg-gradient-to-br from-[#1C2A55] to-[#0B132B] border-[#8EC5FF]/70"
        }`}
        aria-label={on ? "Parar a nevasca" : "Fazer nevar mais"}
        aria-pressed={on}
      >
        <motion.span animate={on ? { rotate: 360 } : { rotate: 0 }} transition={on ? { duration: 3, repeat: Infinity, ease: "linear" } : { duration: 0.4 }}>
          ❄️
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {on && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="bg-[#0B132B]/90 border border-[#8EC5FF]/50 text-[#E0F2FF] text-xs font-semibold rounded-full px-3 py-1.5 shadow-lg"
          >
            Nevasca! ❄
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
