import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { musicBox } from "../lib/christmasMusic";

/** Bolas de Natal penduradas que balançam e tocam um sino ao clicar. */
const BALLS = [
  { left: "3%", len: 52, color: "#EF233C", note: 79, size: 28 },
  { left: "11%", len: 28, color: "#FFD166", note: 84, size: 20 },
  { left: "19%", len: 44, color: "#2DC653", note: 81, size: 24 },
  { left: "27%", len: 22, color: "#4CC9F0", note: 76, size: 20 },
];

export default function HangingOrnaments() {
  return (
    <div className="absolute top-0 inset-x-0 h-40 z-30 pointer-events-none hidden sm:block" aria-hidden="true">
      {BALLS.map((b, i) => (
        <Ball key={i} {...b} index={i} />
      ))}
    </div>
  );
}

function Ball({ left, len, color, note, size, index }: (typeof BALLS)[number] & { index: number }) {
  const reduce = useReducedMotion();
  const [hits, setHits] = useState(0);
  const ring = () => {
    setHits((h) => h + 1);
    musicBox.chime(note);
  };
  return (
    <motion.div
      className="absolute top-0 origin-top pointer-events-auto cursor-pointer"
      style={{ left }}
      animate={
        reduce
          ? {}
          : hits
            ? { rotate: [0, 22, -18, 12, -8, 4, 0] }
            : { rotate: [-4, 4, -4] }
      }
      key={hits}
      transition={hits ? { duration: 1.6, ease: "easeOut" } : { duration: 3 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
      onClick={ring}
      onHoverStart={() => !reduce && setHits((h) => h + 1)}
      title="Toque o sino!"
    >
      <div className="mx-auto w-px bg-[#FFD166]/60" style={{ height: len }} />
      <div className="mx-auto w-2 h-2 bg-[#C9A227] rounded-sm -mt-px" />
      <div
        className="rounded-full -mt-0.5 relative"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 32% 30%, #ffffffcc 0%, ${color} 28%, ${color} 60%, #00000088 100%)`,
          boxShadow: `0 0 18px ${color}88`,
          marginLeft: -size / 2 + 4,
        }}
      />
    </motion.div>
  );
}
