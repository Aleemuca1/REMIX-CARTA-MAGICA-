/** Flocos de neve grandes (cristais) caindo devagar por cima do topo da página. */
const FLAKES = Array.from({ length: 22 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 97.13 + n * 13.7) + 1) / 2);
  return {
    left: Math.round(r(1) * 100),
    size: 14 + Math.round(r(2) * 22),
    dur: 9 + r(3) * 10,
    delay: -r(4) * 18,
    drift: Math.round((r(5) - 0.5) * 120),
    op: 0.45 + r(6) * 0.45,
    char: i % 3 === 0 ? "❅" : i % 3 === 1 ? "❆" : "❄",
  };
});

export default function HeroFlakes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]" aria-hidden="true">
      {FLAKES.map((f, i) => (
        <span
          key={i}
          className="hero-flake"
          style={{
            left: `${f.left}%`,
            fontSize: f.size,
            opacity: f.op,
            animationDuration: `${f.dur}s, ${f.dur / 3}s`,
            animationDelay: `${f.delay}s, ${f.delay}s`,
            ["--drift" as any]: `${f.drift}px`,
          }}
        >
          {f.char}
        </span>
      ))}
    </div>
  );
}
