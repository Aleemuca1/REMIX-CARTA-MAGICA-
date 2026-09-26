import { useMemo } from "react";

/** Estrelinhas cintilando no fundo do céu noturno. */
export default function TwinkleStars({ count = 45 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2.2 + 1,
        delay: Math.random() * 4,
        duration: Math.random() * 3 + 2.5,
      })),
    [count],
  );
  return (
    <div className="fixed inset-0 pointer-events-none -z-0" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className="twinkle-star"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
