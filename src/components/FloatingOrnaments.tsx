import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/** Enfeites flutuando nas laterais, com leve efeito parallax ao rolar. */
const ITEMS = [
  { emoji: "🎁", left: "4%", top: "38%", size: "2rem", speed: -120, dur: 7 },
  { emoji: "⭐", left: "92%", top: "30%", size: "1.6rem", speed: -200, dur: 6 },
  { emoji: "🔔", left: "88%", top: "70%", size: "1.8rem", speed: -90, dur: 8 },
  { emoji: "❄️", left: "7%", top: "78%", size: "1.5rem", speed: -160, dur: 9 },
  { emoji: "🍬", left: "95%", top: "120%", size: "1.5rem", speed: -140, dur: 7.5 },
  { emoji: "🎄", left: "3%", top: "140%", size: "2rem", speed: -110, dur: 8.5 },
];

export default function FloatingOrnaments() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  return (
    <div className="absolute inset-x-0 top-0 h-[250vh] pointer-events-none overflow-hidden hidden md:block" aria-hidden="true">
      {ITEMS.map((it, i) => (
        <Ornament key={i} {...it} scrollY={scrollY} reduce={!!reduce} />
      ))}
    </div>
  );
}

function Ornament({ emoji, left, top, size, speed, dur, scrollY, reduce }: any) {
  const y = useTransform(scrollY, [0, 1500], [0, reduce ? 0 : speed]);
  return (
    <motion.span className="absolute opacity-70 select-none" style={{ left, top, fontSize: size, y }}>
      <motion.span
        className="inline-block drop-shadow-[0_0_12px_rgba(255,209,102,0.45)]"
        animate={reduce ? {} : { y: [0, -14, 0], rotate: [-8, 8, -8] }}
        transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
      >
        {emoji}
      </motion.span>
    </motion.span>
  );
}
