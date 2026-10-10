import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import confetti from "canvas-confetti";
import { musicBox } from "../lib/christmasMusic";

/** Papai Noel que aparece no canto da tela, acena e dá dicas. Clique nele! */
const TIPS: { text: string; target?: string }[] = [
  { text: "Ho ho ho! Já fez a cartinha do seu filho? ✉️", target: "hero-section" },
  { text: "Psiu... teste o jogo do trenó! 🛷", target: "jogo" },
  { text: "Que tal pintar um desenho no Ateliê? 🎨", target: "atelie" },
  { text: "Sacuda o globo de neve! ❄️", target: "globo" },
  { text: "Os duendes estão de olho nas boas ações! 👀" },
  { text: "Já abriu a portinha de hoje do calendário? 📅", target: "calendario" },
];

export default function SantaPeek() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const [tip, setTip] = useState(0);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    let i = 0;
    let hideT: ReturnType<typeof setTimeout>;
    const appear = () => {
      setTip(i++ % TIPS.length);
      setShow(true);
      hideT = setTimeout(() => setShow(false), 7000);
    };
    const first = setTimeout(appear, 9000);
    const loop = setInterval(appear, 28000);
    return () => {
      clearTimeout(first);
      clearTimeout(hideT);
      clearInterval(loop);
    };
  }, []);

  const click = (e: React.MouseEvent) => {
    setHits((h) => h + 1);
    [67, 64, 60].forEach((n, i) => setTimeout(() => musicBox.chime(n + 12, undefined, 0.16), i * 160));
    if (!reduce) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
        colors: ["#EF233C", "#FFFFFF", "#FFD166", "#2DC653"],
        zIndex: 60,
      });
    }
    const t = TIPS[tip].target;
    if (t) document.getElementById(t)?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => setShow(false), 1200);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed right-2 sm:right-6 bottom-[88px] md:bottom-0 z-[45] flex items-end gap-2 pointer-events-none"
          initial={{ y: 160 }}
          animate={{ y: 0 }}
          exit={{ y: 180 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
        >
          <motion.div
            className="pointer-events-auto mb-16 sm:mb-20 max-w-[200px] sm:max-w-[240px] bg-white text-[#1C2541] text-xs sm:text-sm font-semibold rounded-2xl rounded-br-none px-3.5 py-2.5 shadow-2xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.45, type: "spring", stiffness: 260, damping: 16 }}
            style={{ originX: 1, originY: 1 }}
          >
            {hits > 0 && tip % 2 ? "Ho ho ho! Você me achou! 🎉" : TIPS[tip].text}
          </motion.div>
          <motion.button
            onClick={click}
            className="pointer-events-auto relative w-24 h-28 sm:w-28 sm:h-32 cursor-pointer"
            animate={reduce ? {} : { rotate: [-4, 4, -4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            aria-label="Papai Noel: clique para uma surpresa"
            whileHover={{ scale: 1.08 }}
          >
            <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
              {/* mão acenando */}
              <motion.g
                style={{ transformOrigin: "100px 110px", transformBox: "view-box" }}
                animate={reduce ? {} : { rotate: [0, -25, 0, -20, 0] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                <rect x="96" y="70" width="12" height="40" rx="6" fill="#D90429" />
                <circle cx="102" cy="68" r="9" fill="#FFFFFF" />
              </motion.g>
              {/* gorro */}
              <path d="M24 52 Q34 6 76 10 Q104 14 108 42 L96 46 Q92 28 76 26 Q86 38 96 52 Z" fill="#E63946" />
              <circle cx="106" cy="46" r="8" fill="#FFFFFF" />
              {/* rosto */}
              <circle cx="60" cy="72" r="30" fill="#F6C9A8" />
              <circle cx="46" cy="78" r="6" fill="#FF8FA3" opacity="0.6" />
              <circle cx="74" cy="78" r="6" fill="#FF8FA3" opacity="0.6" />
              <g className="snowman-eyes">
                <ellipse cx="50" cy="68" rx="3.4" ry="4.4" fill="#1E2340" />
                <ellipse cx="70" cy="68" rx="3.4" ry="4.4" fill="#1E2340" />
              </g>
              <circle cx="60" cy="78" r="5" fill="#E8907A" />
              {/* barba */}
              <path d="M28 78 Q24 130 60 138 Q96 130 92 78 Q80 98 60 96 Q40 98 28 78 Z" fill="#FFFFFF" />
              <path d="M60 88 Q48 80 40 88 Q50 94 60 90 Q70 94 80 88 Q72 80 60 88 Z" fill="#F1F5F9" stroke="#E2E8F0" />
              <path d="M54 104 Q60 109 66 104" stroke="#C2410C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* pelo do gorro */}
              <rect x="22" y="46" width="78" height="14" rx="7" fill="#FFFFFF" />
            </svg>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
