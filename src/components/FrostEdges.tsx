import { useEffect, useState } from "react";
import { snow } from "../lib/snow";

/** Bordas da tela congeladas — ficam mais fortes durante a nevasca. */
function Corner({ className, flipX, flipY }: { className: string; flipX?: boolean; flipY?: boolean }) {
  const branches = [
    [0, 0, 120, 30], [0, 0, 40, 110], [0, 0, 90, 90], [30, 8, 60, 50], [10, 35, 45, 70], [60, 16, 100, 10], [16, 60, 12, 100],
  ];
  return (
    <svg
      viewBox="0 0 160 160"
      className={`absolute w-40 h-40 sm:w-64 sm:h-64 ${className}`}
      style={{ transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})` }}
    >
      <defs>
        <radialGradient id="frostG" cx="0" cy="0" r="1">
          <stop offset="0" stopColor="#EAF6FF" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#CFE8FF" stopOpacity="0.15" />
          <stop offset="1" stopColor="#CFE8FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="160" height="160" fill="url(#frostG)" />
      <g stroke="#F4FBFF" strokeOpacity="0.55" strokeWidth="1" fill="none" strokeLinecap="round">
        {branches.map(([x1, y1, x2, y2], i) => (
          <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} />
        ))}
        {branches.slice(0, 3).map(([, , x2, y2], i) => (
          <g key={`b${i}`}>
            <path d={`M${x2 * 0.5} ${y2 * 0.5} l${10 + i * 3} ${-6 + i * 4}`} />
            <path d={`M${x2 * 0.7} ${y2 * 0.7} l${-4 + i * 2} ${10 + i * 2}`} />
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function FrostEdges() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const off = snow.on((e) => e.type === "blizzard" && setOn(e.on));
    return () => {
      off();
    };
  }, []);
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[15] transition-opacity duration-[2000ms] ${on ? "opacity-100" : "opacity-35"}`}
      aria-hidden="true"
    >
      <Corner className="top-0 left-0" />
      <Corner className="top-0 right-0" flipX />
      <Corner className="bottom-0 left-0" flipY />
      <Corner className="bottom-0 right-0" flipX flipY />
    </div>
  );
}
