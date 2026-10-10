import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import santaImg from "../assets/images/santa-sleigh.webp";
import { musicBox } from "../lib/christmasMusic";

/** Lua cheia, estrelas cadentes e a silhueta do trenó cruzando a lua. */
export default function NightSky() {
  const reduce = useReducedMotion();
  const [shoot, setShoot] = useState<{ id: number; top: number; left: number }[]>([]);
  const [fly, setFly] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const spawn = () => {
      const s = { id: Date.now() + Math.random(), top: Math.random() * 35, left: 30 + Math.random() * 60 };
      setShoot((arr) => [...arr.slice(-2), s]);
    };
    const t = setInterval(spawn, 4200);
    spawn();
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Lua */}
      <button
        className="hidden lg:block absolute top-[6%] left-[52%] w-32 h-32 rounded-full moon pointer-events-auto cursor-pointer hover:scale-105 transition-transform"
        onClick={() => {
          setFly((f) => f + 1);
          [67, 72, 76, 79].forEach((n, i) => setTimeout(() => musicBox.chime(n + 12, undefined, 0.12), i * 120));
        }}
        aria-label="Lua: clique para chamar o trenó"
        title="Clique na lua 🌙"
      />
      {fly > 0 && !reduce && (
        <motion.img
          key={fly}
          src={santaImg}
          alt=""
          className="hidden lg:block absolute w-44 drop-shadow-[0_0_18px_rgba(255,209,102,0.6)]"
          initial={{ left: "110%", top: "40%", rotate: 8, scaleX: -1 }}
          animate={{ left: ["110%", "55%", "-30%"], top: ["40%", "8%", "22%"], rotate: [8, -6, -10] }}
          transition={{ duration: 3.2, ease: "easeInOut" }}
        />
      )}

      {/* Silhueta do trenó passando pela lua */}
      {!reduce && (
        <motion.img
          src={santaImg}
          alt=""
          className="hidden lg:block absolute w-32 opacity-0"
          style={{ filter: "brightness(0) drop-shadow(0 0 1px rgba(0,0,0,0.6))", top: "10%" }}
          initial={{ left: "-15%", top: "22%", opacity: 0 }}
          animate={{
            left: ["-15%", "30%", "52%", "75%", "115%"],
            top: ["24%", "14%", "10%", "8%", "2%"],
            opacity: [0, 0.9, 0.95, 0.9, 0],
            rotate: [4, -2, -4, -6, -8],
          }}
          transition={{ duration: 9, repeat: Infinity, repeatDelay: 11, ease: "easeInOut", delay: 3 }}
        />
      )}

      {/* Estrelas cadentes */}
      {shoot.map((s) => (
        <span key={s.id} className="shooting-star" style={{ top: `${s.top}%`, left: `${s.left}%` }} />
      ))}
    </div>
  );
}
