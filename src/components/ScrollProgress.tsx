import { motion, useScroll, useSpring } from "motion/react";

/** Barra listrada de bengala doce mostrando quanto da página já foi lida. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-1.5 z-[60] origin-left candy-cane-bar"
      style={{ scaleX }}
    />
  );
}
