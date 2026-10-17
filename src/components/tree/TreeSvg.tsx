import { forwardRef, type MouseEvent, type PointerEvent } from "react";
import { GROUND_Y, TIERS, TREE_CX, VIEW_H, VIEW_W, type Ornament } from "../../tree/model";

const LIGHT_COLORS = ["#FFD166", "#EF233C", "#4CC9F0", "#2DC653", "#F72585"];

/** Pontos das guirlandas (curvas que cruzam cada camada da árvore). */
function garlands() {
  return TIERS.map((t, i) => {
    const y1 = t.apexY + (t.baseY - t.apexY) * 0.42;
    const y2 = t.apexY + (t.baseY - t.apexY) * 0.8;
    const w1 = ((y1 - t.apexY) / (t.baseY - t.apexY)) * t.half - 14;
    const w2 = ((y2 - t.apexY) / (t.baseY - t.apexY)) * t.half - 14;
    return [
      { x1: TREE_CX - w1, y1: y1 - 10, x2: TREE_CX + w1, y2: y1 + 12, sag: 26 + i * 4 },
      { x1: TREE_CX + w2, y1: y2 - 12, x2: TREE_CX - w2, y2: y2 + 10, sag: 30 + i * 5 },
    ];
  }).flat();
}

function lightPoints() {
  const pts: { x: number; y: number; c: string; d: number }[] = [];
  garlands().forEach((g, gi) => {
    const n = 7 + gi;
    for (let k = 1; k < n; k++) {
      const t = k / n;
      const mx = (g.x1 + g.x2) / 2;
      const my = (g.y1 + g.y2) / 2 + g.sag;
      // ponto na curva quadrática
      const x = (1 - t) * (1 - t) * g.x1 + 2 * (1 - t) * t * mx + t * t * g.x2;
      const y = (1 - t) * (1 - t) * g.y1 + 2 * (1 - t) * t * my + t * t * g.y2;
      pts.push({ x, y, c: LIGHT_COLORS[(k + gi) % LIGHT_COLORS.length], d: ((k * 37 + gi * 11) % 20) / 10 });
    }
  });
  return pts;
}
const GARLANDS = garlands();
const FLAKES = Array.from({ length: 46 }, (_, i) => ({
  x: (i * 131 + 17) % VIEW_W,
  r: 1.4 + ((i * 7) % 5) * 0.55,
  dur: 7 + ((i * 13) % 9),
  delay: -((i * 37) % 160) / 10,
  o: 0.55 + ((i * 3) % 5) * 0.09,
}));
const LIGHTS = lightPoints();

/** Camadas de galhos (de cima para baixo) que formam o pinheiro desenhado. */
const LAYERS = [
  { top: 84, bottom: 172, half: 80 },
  { top: 118, bottom: 238, half: 120 },
  { top: 162, bottom: 308, half: 160 },
  { top: 212, bottom: 382, half: 197 },
  { top: 270, bottom: 458, half: 230 },
  { top: 334, bottom: 546, half: 264 },
];
const hash = (n: number) => {
  const v = Math.sin(n * 91.7 + 47.3) * 43758.5453;
  return v - Math.floor(v);
};
type Tip = { x: number; y: number };
/** Contorno de uma camada: lados com "agulhas" e a barra de baixo com pontas de galho caídas. */
function layerShape(L: (typeof LAYERS)[number], li: number) {
  const cx = TREE_CX;
  const n = Math.max(4, Math.round(L.half / 21));
  const tips: Tip[] = [];
  for (let k = 0; k <= n; k++) {
    const f = k / n;
    const x = cx - L.half + f * L.half * 2;
    // as pontas do meio caem um pouco menos (formato de saia)
    const droop = 10 + hash(li * 13 + k) * 9 - Math.cos((f - 0.5) * Math.PI) * 4;
    tips.push({ x, y: L.bottom + droop });
  }
  const side = (from: Tip, to: Tip, seed: number) => {
    // lado com pequenas agulhas para fora
    let d = "";
    const steps = 6;
    for (let k = 1; k <= steps; k++) {
      const f = k / steps;
      const x = from.x + (to.x - from.x) * f;
      const y = from.y + (to.y - from.y) * f;
      const out = (to.x < from.x ? -1 : 1) * (5 + hash(seed + k) * 7) * Math.sin(f * Math.PI * 0.9 + 0.2);
      d += ` L${(x + out).toFixed(1)},${(y + 2).toFixed(1)} L${(x - out * 0.3).toFixed(1)},${(y + 6).toFixed(1)}`;
    }
    return d;
  };
  const left = tips[0];
  const right = tips[tips.length - 1];
  let d = `M${cx},${L.top}`;
  d += side({ x: cx, y: L.top }, left, li * 7);
  d += ` L${left.x},${left.y}`;
  for (let k = 0; k < tips.length - 1; k++) {
    const a = tips[k];
    const b = tips[k + 1];
    const mx = (a.x + b.x) / 2;
    const notch = L.bottom - 10 - hash(li * 5 + k) * 6;
    d += ` Q${(a.x + mx) / 2},${notch + 2} ${mx},${notch}`;
    d += ` Q${(mx + b.x) / 2},${notch + 2} ${b.x},${b.y}`;
  }
  // volta pelo lado direito até o topo
  const back = side(right, { x: cx, y: L.top }, li * 11).replace(/^ L/, " L");
  d += back + " Z";
  return { d, tips };
}
const SHAPES = LAYERS.map(layerShape);
const GIFTS = [
  { x: 192, y: 582, w: 60, h: 46, c: "#D62839", r: "#FFD166" },
  { x: 332, y: 576, w: 66, h: 52, c: "#3A56D4", r: "#FFD166" },
  { x: 244, y: 600, w: 46, h: 38, c: "#1E9E4A", r: "#FFFFFF" },
  { x: 384, y: 604, w: 42, h: 34, c: "#F4A261", r: "#D62839" },
  { x: 292, y: 612, w: 38, h: 30, c: "#8E44D9", r: "#FFD166" },
];


/** Desenha um enfeite. Coordenadas centradas no ponto (x, y). */
/** Nome pequeno de quem pendurou, embaixo do enfeite. */
function NameTag({ name, y }: { name: string; y: number }) {
  const n = name.trim().split(/\s+/)[0].slice(0, 12);
  if (!n) return null;
  const w = n.length * 6.4 + 12;
  return (
    <g transform={`translate(0,${y})`} pointerEvents="none">
      <rect x={-w / 2} y={-8} width={w} height={15} rx={7.5} fill="rgba(11,19,43,0.78)" stroke="rgba(255,209,102,0.7)" strokeWidth={0.8} />
      <text x={0} y={3.2} fontSize={10} textAnchor="middle" fill="#FFF6D8" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold">
        {n}
      </text>
    </g>
  );
}

export function OrnamentShape({ o, selected, showName = true }: { o: Ornament; selected?: boolean; showName?: boolean }) {
  const c = o.color;
  const hasText = Boolean(o.text);
  const ring = selected ? <circle r={30} fill="none" stroke="#FFD166" strokeWidth={3} strokeDasharray="5 4" /> : null;
  const tag = hasText ? (
    // bilhetinho dobrado pendurado no enfeite: tem mensagem aqui dentro
    <g transform="translate(14,-4) rotate(14)">
      <line x1={-6} y1={-6} x2={0} y2={0} stroke="#C9A227" strokeWidth={1} />
      <rect x={-1} y={-1} width={15} height={11} rx={1.5} fill="#FFFDF5" stroke="#9B021A" strokeWidth={1.2} />
      <path d="M-1,-1 L6.5,5 L14,-1" stroke="#9B021A" strokeWidth={1} fill="none" />
      <path d="M6.5,8.6 C3.6,6.6 4.4,4.6 6.5,5.8 C8.6,4.6 9.4,6.6 6.5,8.6 Z" fill="#E63946" />
    </g>
  ) : null;
  let body;
  switch (o.type) {
    case "bola":
      body = (
        <g>
          <line x1={0} y1={-30} x2={0} y2={-18} stroke="#C9A227" strokeWidth={1.5} />
          <rect x={-5} y={-21} width={10} height={6} rx={1.5} fill="#C9A227" />
          <circle r={16} fill={c} stroke="rgba(0,0,0,.25)" strokeWidth={1} />
          <path d="M-14,-2 Q0,6 14,-2" stroke="rgba(255,255,255,.55)" strokeWidth={2} fill="none" />
          <ellipse cx={-6} cy={-6} rx={4.5} ry={3} fill="rgba(255,255,255,.75)" />
        </g>
      );
      break;
    case "sino":
      body = (
        <g>
          <path d="M-15,10 Q-15,-16 0,-18 Q15,-16 15,10 L18,14 L-18,14 Z" fill={c} stroke="rgba(0,0,0,.3)" strokeWidth={1} />
          <circle cy={17} r={4} fill="#C9A227" />
          <path d="M-6,-12 Q0,-22 6,-12" stroke="#2DC653" strokeWidth={3} fill="none" />
          <ellipse cx={-6} cy={-4} rx={3} ry={6} fill="rgba(255,255,255,.45)" />
        </g>
      );
      break;
    case "laco":
      body = (
        <g>
          <path d="M0,0 C-10,-14 -24,-12 -20,0 C-24,12 -10,14 0,0 Z" fill={c} stroke="rgba(0,0,0,.3)" />
          <path d="M0,0 C10,-14 24,-12 20,0 C24,12 10,14 0,0 Z" fill={c} stroke="rgba(0,0,0,.3)" />
          <path d="M-3,2 L-10,20 L-4,17 L0,22 Z M3,2 L10,20 L4,17 L0,22 Z" fill={c} stroke="rgba(0,0,0,.3)" />
          <circle r={4.5} fill={c} stroke="rgba(0,0,0,.35)" />
        </g>
      );
      break;
    case "doce":
      body = (
        <g transform="rotate(-15)">
          <path d="M4,20 L4,-8 Q4,-20 -7,-20 Q-16,-20 -16,-11" stroke="#FFFFFF" strokeWidth={8} fill="none" strokeLinecap="round" />
          <path
            d="M4,20 L4,-8 Q4,-20 -7,-20 Q-16,-20 -16,-11"
            stroke={c === "#FFFFFF" ? "#E63946" : c}
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="5 5"
          />
        </g>
      );
      break;
    case "coracao":
      body = (
        <g>
          <path d="M0,16 C-22,2 -18,-16 -6,-15 C-2,-15 0,-11 0,-9 C0,-11 2,-15 6,-15 C18,-16 22,2 0,16 Z" fill={c} stroke="rgba(0,0,0,.3)" />
          <ellipse cx={-7} cy={-7} rx={3.5} ry={2.5} fill="rgba(255,255,255,.7)" />
        </g>
      );
      break;
    case "estrela":
      body = (
        <path
          d="M0,-19 L5.6,-6 L19,-5.9 L8.7,3.2 L11.8,17 L0,9.5 L-11.8,17 L-8.7,3.2 L-19,-5.9 L-5.6,-6 Z"
          fill={c}
          stroke="rgba(0,0,0,.3)"
          strokeWidth={1}
        />
      );
      break;
    case "boneco":
      body = (
        <g>
          <circle cy={8} r={12} fill="#FFFFFF" stroke="#B8C4D6" />
          <circle cy={-10} r={9} fill="#FFFFFF" stroke="#B8C4D6" />
          <rect x={-8} y={-26} width={16} height={9} rx={2} fill="#1C2541" />
          <rect x={-11} y={-18} width={22} height={3} rx={1.5} fill="#1C2541" />
          <path d="M-9,-3 Q0,1 9,-3 L11,3 L6,0" fill={c} />
          <circle cx={-3} cy={-11} r={1.4} fill="#1C2541" />
          <circle cx={3} cy={-11} r={1.4} fill="#1C2541" />
          <path d="M0,-9 L6,-8 L0,-7 Z" fill="#F4A261" />
          <circle cy={6} r={1.4} fill="#1C2541" />
          <circle cy={11} r={1.4} fill="#1C2541" />
        </g>
      );
      break;
    case "brilho":
      body = (
        <g>
          <line x1={0} y1={-32} x2={0} y2={-20} stroke="#C9A227" strokeWidth={1.5} />
          <rect x={-5} y={-23} width={10} height={6} rx={1.5} fill="#E9C46A" />
          <circle r={18} fill="#E9B949" stroke="#A67C00" strokeWidth={1.2} />
          <circle r={18} fill={c} opacity={0.35} />
          {[
            [-8, -6, 2.4],
            [6, -9, 1.8],
            [9, 4, 2.2],
            [-3, 9, 1.6],
            [-11, 5, 1.4],
            [2, 0, 1.3],
            [12, -2, 1.2],
          ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#FFFBEA" opacity={0.9} />
          ))}
          <path d="M14,-20 L15.5,-15 L20,-14 L15.5,-12.5 L14,-8 L12.5,-12.5 L8,-14 L12.5,-15 Z" fill="#FFFFFF" />
          <path d="M-17,10 L-16,13 L-13,14 L-16,15 L-17,18 L-18,15 L-21,14 L-18,13 Z" fill="#FFFFFF" />
        </g>
      );
      break;
    case "anjo":
      body = (
        <g>
          <path d="M-4,-2 C-20,-14 -26,4 -10,8 Z" fill="#FFFFFF" stroke="#C9D3E3" />
          <path d="M4,-2 C20,-14 26,4 10,8 Z" fill="#FFFFFF" stroke="#C9D3E3" />
          <path d="M0,-6 L13,20 L-13,20 Z" fill={c} stroke="rgba(0,0,0,.25)" />
          <circle cy={-11} r={7} fill="#F6D2B0" stroke="rgba(0,0,0,.2)" />
          <path d="M-7,-13 Q0,-22 7,-13 Q4,-17 0,-17 Q-4,-17 -7,-13 Z" fill="#E9C46A" />
          <ellipse cy={-21} rx={8} ry={2.6} fill="none" stroke="#FFD166" strokeWidth={2} />
          <circle cx={-2.4} cy={-11} r={0.9} fill="#1C2541" />
          <circle cx={2.4} cy={-11} r={0.9} fill="#1C2541" />
        </g>
      );
      break;
    case "presente":
      body = (
        <g>
          <rect x={-24} y={-20} width={48} height={40} rx={3} fill={c} stroke="rgba(0,0,0,.3)" />
          <rect x={-5} y={-20} width={10} height={40} fill="#FFD166" />
          <rect x={-24} y={-4} width={48} height={8} fill="#FFD166" />
          <path d="M0,-20 C-8,-34 -22,-30 -14,-20 Z M0,-20 C8,-34 22,-30 14,-20 Z" fill="#FFD166" stroke="rgba(0,0,0,.25)" />
        </g>
      );
      break;
  }
  return (
    <g>
      {ring}
      {body}
      {tag}
      {showName && o.author && <NameTag name={o.author} y={o.type === "presente" ? 30 : 27} />}
    </g>
  );
}

type Props = {
  ornaments: Ornament[];
  lightsOn?: boolean;
  /** noite mágica: o cenário escurece e a árvore ilumina tudo */
  night?: boolean;
  starGlow?: boolean;
  selectedId?: string | null;
  ghost?: Ornament | null;
  onTap?: (e: MouseEvent<SVGSVGElement>) => void;
  onPointerMove?: (e: PointerEvent<SVGSVGElement>) => void;
  onPointerLeave?: () => void;
  onOrnamentClick?: (o: Ornament) => void;
  className?: string;
  /** desenho estático (sem animações), usado para gerar a imagem */
  staticMode?: boolean;
};

const TreeSvg = forwardRef<SVGSVGElement, Props>(function TreeSvg(
  { ornaments, lightsOn = true, night = false, starGlow, selectedId, ghost, onTap, onPointerMove, onPointerLeave, onOrnamentClick, className, staticMode },
  ref,
) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={className}
      onClick={onTap}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      role="img"
      aria-label="Árvore de Natal da família"
    >
      <defs>
        <radialGradient id="tsky" cx="50%" cy="20%" r="90%">
          <stop offset="0%" stopColor="#24305E" />
          <stop offset="60%" stopColor="#0B132B" />
          <stop offset="100%" stopColor="#060B19" />
        </radialGradient>
        <linearGradient id="tleaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2E8F52" />
          <stop offset="100%" stopColor="#0F4A27" />
        </linearGradient>
        <linearGradient id="tleaf2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#279151" />
          <stop offset="100%" stopColor="#0D4123" />
        </linearGradient>
        <radialGradient id="tskyN" cx="50%" cy="15%" r="95%">
          <stop offset="0%" stopColor="#141C3D" />
          <stop offset="60%" stopColor="#050A1C" />
          <stop offset="100%" stopColor="#02040C" />
        </radialGradient>
        <linearGradient id="tshade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#CFE8FF" stopOpacity="0.16" />
          <stop offset="45%" stopColor="#CFE8FF" stopOpacity="0" />
          <stop offset="70%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
        </linearGradient>
        <pattern id="tneedle" width="14" height="12" patternUnits="userSpaceOnUse">
          <path d="M2,10 L6,3 M7,11 L10,4 M11,10 L13,6" stroke="#4FB874" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M4,11 L2,5 M9,11 L8,6" stroke="#0E4726" strokeWidth="1.2" strokeLinecap="round" />
        </pattern>
        <radialGradient id="twarm" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFC870" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFC870" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tpoolR"><stop offset="0%" stopColor="#FF4D6D" stopOpacity="0.55" /><stop offset="100%" stopColor="#FF4D6D" stopOpacity="0" /></radialGradient>
        <radialGradient id="tpoolB"><stop offset="0%" stopColor="#4CC9F0" stopOpacity="0.55" /><stop offset="100%" stopColor="#4CC9F0" stopOpacity="0" /></radialGradient>
        <radialGradient id="tpoolG"><stop offset="0%" stopColor="#FFD166" stopOpacity="0.6" /><stop offset="100%" stopColor="#FFD166" stopOpacity="0" /></radialGradient>
        <radialGradient id="tglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF3B0" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFD166" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* céu e neve */}
      <rect width={VIEW_W} height={VIEW_H} fill={night ? "url(#tskyN)" : "url(#tsky)"} />
      {night && <circle cx={520} cy={70} r={26} fill="#F4F1E6" />}
      {night && <circle cx={520} cy={70} r={60} fill="url(#twarm)" opacity={0.5} />}
      {Array.from({ length: 40 }, (_, i) => (
        <circle
          key={i}
          cx={(i * 137) % VIEW_W}
          cy={(i * 89) % (GROUND_Y - 40)}
          r={i % 3 === 0 ? 2 : 1.2}
          fill="#FFFFFF"
          opacity={0.35 + (i % 4) * 0.12}
        />
      ))}
      <path d={`M0,${GROUND_Y} Q150,${GROUND_Y - 22} 300,${GROUND_Y - 8} T600,${GROUND_Y - 4} L600,${VIEW_H} L0,${VIEW_H} Z`} fill="#E8F0FA" />
      <path d={`M0,${GROUND_Y + 30} Q200,${GROUND_Y + 12} 420,${GROUND_Y + 34} T600,${GROUND_Y + 26} L600,${VIEW_H} L0,${VIEW_H} Z`} fill="#D3DFEE" />

      {/* casinhas ao longe (janelas acendem à noite) */}
      {[
        [38, GROUND_Y - 12, 0.9],
        [520, GROUND_Y - 8, 1],
      ].map(([hx, hy, k], i) => (
        <g key={i} transform={`translate(${hx},${hy}) scale(${k})`}>
          <rect x={-22} y={-26} width={44} height={26} fill={night ? "#1A2340" : "#5C6F96"} />
          <path d="M-28,-24 L0,-46 L28,-24 Z" fill={night ? "#121A33" : "#45577E"} />
          <path d="M-28,-24 L0,-46 L28,-24" stroke="#F4F8FF" strokeWidth={4} fill="none" strokeLinejoin="round" />
          <rect x={-14} y={-19} width={9} height={9} fill={night ? "#FFD27A" : "#9FB3D6"} />
          <rect x={5} y={-19} width={9} height={9} fill={night ? "#FFD27A" : "#9FB3D6"} />
          {night && <circle cx={0} cy={-14} r={26} fill="url(#twarm)" />}
        </g>
      ))}

      {/* tronco com textura */}
      <rect x={TREE_CX - 24} y={530} width={48} height={84} rx={5} fill="#5B371E" />
      <rect x={TREE_CX - 24} y={530} width={16} height={84} rx={5} fill="#7A4D2C" />
      <path d={`M${TREE_CX - 4},552 q4,14 -2,30 M${TREE_CX + 10},560 q-3,12 2,24`} stroke="#3F2513" strokeWidth={2} fill="none" />

      {/* saia da árvore */}
      <ellipse cx={TREE_CX} cy={612} rx={130} ry={20} fill="#B5102A" />
      <ellipse cx={TREE_CX} cy={608} rx={130} ry={18} fill="#D62839" />
      <ellipse cx={TREE_CX} cy={612} rx={130} ry={20} fill="none" stroke="#FFFFFF" strokeWidth={5} strokeDasharray="2 9" strokeLinecap="round" />

      {/* copa: camadas de galhos, de baixo para cima, cada uma fazendo sombra na de baixo */}
      {[...SHAPES].reverse().map((sh, ri) => {
        const i = SHAPES.length - 1 - ri;
        return (
          <g key={i}>
            <path d={sh.d} transform="translate(0,9)" fill="rgba(3,25,12,0.45)" />
            <path d={sh.d} fill={i % 2 ? "url(#tleaf2)" : "url(#tleaf)"} stroke="#0B3A1E" strokeWidth={1.5} strokeLinejoin="round" />
            <path d={sh.d} fill="url(#tneedle)" opacity={0.55} />
            {/* luz da lua na borda esquerda */}
            <path d={sh.d} fill="url(#tshade)" />
            {/* pontinhas dos galhos mais claras */}
            {sh.tips.map((p, k) => (
              <path
                key={k}
                d={`M${p.x - 6},${p.y - 9} Q${p.x},${p.y - 2} ${p.x + 5},${p.y - 10}`}
                stroke="#5CC27E"
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                opacity={0.7}
              />
            ))}
            {/* neve acumulada em cima de alguns galhos */}
            {sh.tips
              .filter((_, k) => hash(i * 17 + k) > 0.45)
              .map((p, k) => (
                <path
                  key={`s${k}`}
                  d={`M${p.x - 14},${p.y - 12} Q${p.x - 4},${p.y - 20} ${p.x + 9},${p.y - 13} Q${p.x + 2},${p.y - 9} ${p.x - 14},${p.y - 12} Z`}
                  fill="#F4F8FF"
                  opacity={0.95}
                />
              ))}
          </g>
        );
      })}

      {/* presentes embaixo da árvore */}
      {GIFTS.map((g, i) => (
        <g key={i}>
          <ellipse cx={g.x + g.w / 2} cy={g.y + g.h + 2} rx={g.w * 0.55} ry={5} fill="rgba(20,30,60,0.25)" />
          <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={3} fill={g.c} />
          <rect x={g.x + g.w * 0.62} y={g.y} width={g.w * 0.38} height={g.h} rx={3} fill="rgba(0,0,0,0.18)" />
          <rect x={g.x - 3} y={g.y - 2} width={g.w + 6} height={g.h * 0.22} rx={3} fill={g.c} />
          <rect x={g.x - 3} y={g.y - 2} width={g.w + 6} height={g.h * 0.22} rx={3} fill="rgba(255,255,255,0.12)" />
          <rect x={g.x + g.w / 2 - 4} y={g.y - 2} width={8} height={g.h + 2} fill={g.r} />
          <rect x={g.x} y={g.y + g.h * 0.5 - 3} width={g.w} height={6} fill={g.r} opacity={0.9} />
          <path
            d={`M${g.x + g.w / 2},${g.y - 2} c-16,-16 -24,-2 -10,2 z M${g.x + g.w / 2},${g.y - 2} c16,-16 24,-2 10,2 z`}
            fill={g.r}
            stroke="rgba(0,0,0,0.2)"
          />
          <circle cx={g.x + g.w / 2} cy={g.y - 2} r={3.5} fill={g.r} />
        </g>
      ))}

      {/* noite mágica: tudo escurece e só as luzes iluminam */}
      {night && <rect width={VIEW_W} height={VIEW_H} fill="rgba(2,5,18,0.5)" pointerEvents="none" />}
      {night && lightsOn && (
        <g pointerEvents="none">
          <ellipse cx={TREE_CX} cy={330} rx={300} ry={300} fill="url(#twarm)" opacity={0.75} />
          <ellipse cx={TREE_CX - 120} cy={GROUND_Y + 22} rx={90} ry={20} fill="url(#tpoolR)" />
          <ellipse cx={TREE_CX + 120} cy={GROUND_Y + 26} rx={90} ry={20} fill="url(#tpoolB)" />
          <ellipse cx={TREE_CX} cy={GROUND_Y + 30} rx={150} ry={26} fill="url(#tpoolG)" />
        </g>
      )}

      {/* guirlandas douradas */}
      {GARLANDS.map((g, i) => (
        <path
          key={i}
          d={`M${g.x1},${g.y1} Q${(g.x1 + g.x2) / 2},${(g.y1 + g.y2) / 2 + g.sag} ${g.x2},${g.y2}`}
          stroke="#E9C46A"
          strokeWidth={3}
          fill="none"
          strokeDasharray="1 6"
          strokeLinecap="round"
        />
      ))}

      {/* pisca-pisca */}
      {LIGHTS.map((p, i) => (
        <g key={i}>
          {lightsOn && <circle cx={p.x} cy={p.y} r={night ? 13 : 9} fill={p.c} opacity={night ? 0.5 : 0.25} className={staticMode ? undefined : "tree-light-glow"} style={staticMode ? undefined : { animationDelay: `${p.d}s` }} />}
          <circle
            cx={p.x}
            cy={p.y}
            r={night && lightsOn ? 4.6 : 4}
            fill={lightsOn ? (night ? "#FFFDF0" : p.c) : "#5B6478"}
            stroke={night && lightsOn ? p.c : undefined}
            strokeWidth={night && lightsOn ? 2.4 : undefined}
            className={lightsOn && !staticMode ? "tree-light" : undefined}
            style={lightsOn && !staticMode ? { animationDelay: `${p.d}s` } : undefined}
          />
        </g>
      ))}

      {/* estrela do topo */}
      <g transform={`translate(${TREE_CX},${TIERS[0].apexY - 14})`}>
        {night && lightsOn && (
          <g className={staticMode ? undefined : "tree-star-rays"} opacity={0.55}>
            {Array.from({ length: 12 }, (_, k) => (
              <path key={k} d="M-4,0 L0,-120 L4,0 Z" fill="#FFE8A3" transform={`rotate(${k * 30})`} opacity={k % 2 ? 0.5 : 0.9} />
            ))}
          </g>
        )}
        {(starGlow || lightsOn) && <circle r={starGlow || night ? 70 : 40} fill="url(#tglow)" className={staticMode ? undefined : "tree-star-glow"} />}
        <path
          d="M0,-34 L10,-11 L34,-10 L15.5,5.7 L21,30 L0,17 L-21,30 L-15.5,5.7 L-34,-10 L-10,-11 Z"
          fill="#FFD166"
          stroke="#C9A227"
          strokeWidth={2}
        />
      </g>

      {/* enfeites */}
      {ornaments.map((o) => (
        <g
          key={o.id}
          transform={`translate(${o.x},${o.y})`}
          onClick={
            onOrnamentClick
              ? (e) => {
                  e.stopPropagation();
                  onOrnamentClick(o);
                }
              : undefined
          }
          style={onOrnamentClick ? { cursor: "pointer" } : undefined}
        >
          <g className={staticMode ? undefined : "tree-ornament"} style={staticMode ? undefined : { animationDelay: `${(o.x % 7) / 3}s` }}>
            <OrnamentShape o={o} selected={o.id === selectedId} />
          </g>
        </g>
      ))}

      {/* neve caindo na frente da árvore */}
      {!staticMode && (
        <g pointerEvents="none">
          {FLAKES.map((f, i) => (
            <circle
              key={i}
              cx={f.x}
              cy={-10}
              r={f.r}
              fill="#FFFFFF"
              opacity={f.o}
              className="tree-snow"
              style={{ animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s` }}
            />
          ))}
        </g>
      )}

      {ghost && (
        <g transform={`translate(${ghost.x},${ghost.y})`} opacity={0.55} pointerEvents="none">
          <OrnamentShape o={ghost} />
        </g>
      )}
    </svg>
  );
});

export default TreeSvg;
