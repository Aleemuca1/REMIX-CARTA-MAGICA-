import { useState } from "react";
import { musicBox } from "../lib/christmasMusic";

const SAYINGS = ["Oi! ⛄", "Brrr! Que frio!", "Ho ho... ops, sou o boneco!", "Me dá um abraço?", "Feliz Natal! ❄️"];

/** Vilarejo coberto de neve com janelas acesas, no rodapé do hero. */
export default function SnowyVillage() {
  const [say, setSay] = useState<string | null>(null);
  const [jump, setJump] = useState(0);
  const poke = () => {
    setJump((j) => j + 1);
    setSay(SAYINGS[Math.floor(Math.random() * SAYINGS.length)]);
    [79, 84, 88].forEach((n, i) => setTimeout(() => musicBox.chime(n, undefined, 0.12), i * 90));
    setTimeout(() => setSay(null), 2200);
  };
  const houses = [
    { x: 60, w: 70, h: 46, roof: 34 },
    { x: 190, w: 54, h: 38, roof: 28 },
    { x: 330, w: 90, h: 58, roof: 40, church: true },
    { x: 560, w: 64, h: 42, roof: 30 },
    { x: 760, w: 76, h: 50, roof: 36 },
    { x: 940, w: 58, h: 40, roof: 30 },
    { x: 1110, w: 80, h: 52, roof: 36 },
    { x: 1300, w: 60, h: 40, roof: 28 },
  ];
  const trees = [140, 260, 470, 500, 680, 870, 1230, 1400];
  return (
    <div className="absolute bottom-0 left-0 right-0 h-28 sm:h-36 pointer-events-none" aria-hidden="true">
      <svg viewBox="0 0 1440 160" preserveAspectRatio="xMidYMax slice" className="w-full h-full">
        <defs>
          <linearGradient id="snowGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#E8F1FF" />
            <stop offset="1" stopColor="#9FB6D9" />
          </linearGradient>
          <radialGradient id="winGlow">
            <stop offset="0" stopColor="#FFE194" stopOpacity="0.9" />
            <stop offset="1" stopColor="#FFB703" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* colinas ao fundo */}
        <path d="M0 110 Q 180 70 360 100 T 720 95 T 1080 100 T 1440 90 V160 H0Z" fill="#1C2541" opacity="0.8" />
        {houses.map((h, i) => {
          const base = 130;
          const top = base - h.h;
          return (
            <g key={i}>
              {h.church && <rect x={h.x + h.w / 2 - 8} y={top - h.roof - 30} width="16" height="34" fill="#0F1A33" />}
              {h.church && <path d={`M${h.x + h.w / 2 - 11} ${top - h.roof - 28} L${h.x + h.w / 2} ${top - h.roof - 48} L${h.x + h.w / 2 + 11} ${top - h.roof - 28}Z`} fill="#E8F1FF" />}
              <rect x={h.x} y={top} width={h.w} height={h.h} fill="#0F1A33" />
              <path d={`M${h.x - 8} ${top + 2} L${h.x + h.w / 2} ${top - h.roof} L${h.x + h.w + 8} ${top + 2}Z`} fill="#E8F1FF" />
              {/* janelas */}
              {[0.22, 0.62].map((fx, j) => (
                <g key={j} className="village-window" style={{ animationDelay: `${(i * 0.7 + j) % 4}s` }}>
                  <circle cx={h.x + h.w * fx + 7} cy={top + h.h * 0.35 + 7} r="16" fill="url(#winGlow)" />
                  <rect x={h.x + h.w * fx} y={top + h.h * 0.35} width="14" height="14" rx="2" fill="#FFD166" />
                </g>
              ))}
              {/* fumaça da chaminé */}
              {i % 3 === 0 && (
                <g>
                  <rect x={h.x + h.w * 0.72} y={top - h.roof * 0.6} width="9" height="16" fill="#0F1A33" />
                  <circle className="chimney-smoke" cx={h.x + h.w * 0.72 + 4.5} cy={top - h.roof * 0.6 - 6} r="5" fill="#CBD5E1" />
                  <circle className="chimney-smoke" style={{ animationDelay: "1.2s" }} cx={h.x + h.w * 0.72 + 4.5} cy={top - h.roof * 0.6 - 6} r="4" fill="#CBD5E1" />
                </g>
              )}
            </g>
          );
        })}
        {trees.map((x, i) => (
          <g key={i} transform={`translate(${x} ${i % 2 ? 132 : 128})`}>
            <path d="M0 -44 L14 -18 L8 -18 L20 0 L-20 0 L-8 -18 L-14 -18Z" fill="#0E3B2A" />
            <path d="M0 -44 L7 -31 L-7 -31Z" fill="#E8F1FF" />
            <circle cx="0" cy="-46" r="2.5" className="tree-star" fill="#FFD166" />
          </g>
        ))}
        {/* boneco de neve acenando */}
        <g transform="translate(1050 128)" style={{ pointerEvents: "auto", cursor: "pointer" }} onClick={poke}>
          <g key={jump} className={jump ? "snowman-jump" : ""}>
          <ellipse cx="0" cy="0" rx="20" ry="6" fill="#C9D7F0" />
          <circle cx="0" cy="-14" r="16" fill="#F4F8FF" />
          <circle cx="0" cy="-38" r="12" fill="#F4F8FF" />
          <circle cx="0" cy="-57" r="9" fill="#F4F8FF" />
          <rect x="-8" y="-72" width="16" height="4" rx="1" fill="#1a1a2e" />
          <rect x="-5" y="-84" width="10" height="13" rx="1" fill="#1a1a2e" />
          <rect x="-5" y="-75" width="10" height="3" fill="#EF233C" />
          <g className="snowman-eyes">
            <circle cx="-3.2" cy="-59" r="1.3" fill="#1a1a2e" />
            <circle cx="3.2" cy="-59" r="1.3" fill="#1a1a2e" />
          </g>
          <path d="M0 -56 L9 -54 L0 -53Z" fill="#F77F00" />
          <path d="M-9 -49 Q0 -45 9 -49 L10 -46 Q0 -42 -10 -46Z" fill="#EF233C" />
          <path d="M6 -47 L10 -36 L6 -36Z" fill="#EF233C" />
          <circle cx="0" cy="-40" r="1.4" fill="#1a1a2e" />
          <circle cx="0" cy="-34" r="1.4" fill="#1a1a2e" />
          <path d="M-11 -40 L-28 -50 M-22 -46 L-26 -54" stroke="#6B4226" strokeWidth="2" strokeLinecap="round" />
          <g className="snowman-arm">
            <path d="M11 -40 L28 -54 M22 -49 L29 -47" stroke="#6B4226" strokeWidth="2" strokeLinecap="round" />
          </g>
          </g>
          {say && (
            <g transform="translate(0 -100)">
              <rect x={-say.length * 3.6 - 10} y="-16" width={say.length * 7.2 + 20} height="24" rx="12" fill="#FFFFFF" />
              <text x="0" y="1" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1C2541" fontFamily="system-ui, sans-serif">
                {say}
              </text>
            </g>
          )}
        </g>
        {/* chão de neve */}
        <path d="M0 132 Q 240 118 480 130 T 960 128 T 1440 126 V160 H0Z" fill="url(#snowGrad)" />
      </svg>
    </div>
  );
}
