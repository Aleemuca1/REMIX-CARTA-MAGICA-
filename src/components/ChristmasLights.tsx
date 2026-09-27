/** Fio de luzinhas de Natal piscando (decorativo). */
const COLORS = ["#EF233C", "#FFD166", "#2DC653", "#4CC9F0", "#F72585"];

export default function ChristmasLights({ count = 28 }: { count?: number }) {
  return (
    <div className="xmas-lights" aria-hidden="true">
      <svg className="xmas-wire" viewBox="0 0 100 10" preserveAspectRatio="none">
        <path
          d={Array.from({ length: count }, (_, i) => {
            const x0 = (i / count) * 100;
            const x1 = ((i + 1) / count) * 100;
            return `${i === 0 ? "M" : ""}${x0},1 Q${(x0 + x1) / 2},6 ${x1},1`;
          }).join(" ")}
          fill="none"
          stroke="#1a2a1f"
          strokeWidth="0.35"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="xmas-bulb"
          style={{
            left: `${((i + 0.5) / count) * 100}%`,
            ["--bulb" as string]: COLORS[i % COLORS.length],
            animationDelay: `${(i % 5) * 0.35}s`,
          }}
        />
      ))}
    </div>
  );
}
