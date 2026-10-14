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
    <g transform="translate(15,-17)">
      <circle r={8} fill="#FFFDF5" stroke="#9B021A" strokeWidth={1.5} />
      <text x={0} y={3.5} fontSize={10} textAnchor="middle" fill="#9B021A" fontFamily="Georgia,serif" fontWeight="bold">
        ✉
      </text>
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
  { ornaments, lightsOn = true, starGlow, selectedId, ghost, onTap, onPointerMove, onPointerLeave, onOrnamentClick, className, staticMode },
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
          <stop offset="0%" stopColor="#2F9E57" />
          <stop offset="100%" stopColor="#14532D" />
        </linearGradient>
        <linearGradient id="tleaf2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38B463" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
        <radialGradient id="tglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF3B0" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFD166" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* céu e neve */}
      <rect width={VIEW_W} height={VIEW_H} fill="url(#tsky)" />
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

      {/* tronco */}
      <rect x={TREE_CX - 26} y={548} width={52} height={66} rx={6} fill="#6B4226" />
      <rect x={TREE_CX - 26} y={548} width={18} height={66} rx={6} fill="#7E5233" />

      {/* copa: de baixo para cima */}
      {[...TIERS].reverse().map((t, i) => {
        const l = TREE_CX - t.half;
        const r = TREE_CX + t.half;
        const scallops = 6 + (2 - i) * 1;
        let bottom = "";
        for (let k = scallops; k >= 1; k--) {
          const x0 = l + ((k - 1) / scallops) * (r - l);
          const x1 = l + (k / scallops) * (r - l);
          bottom += ` Q${(x0 + x1) / 2},${t.baseY + 16} ${x0},${t.baseY}`;
        }
        const d = `M${TREE_CX},${t.apexY} L${r},${t.baseY}${bottom} Z`;
        return (
          <g key={i}>
            <path d={d} fill={i % 2 ? "url(#tleaf2)" : "url(#tleaf)"} stroke="#0F3D22" strokeWidth={2} />
            {/* neve nas pontas */}
            <path
              d={`M${l + 8},${t.baseY - 2} Q${l + 30},${t.baseY + 8} ${l + 54},${t.baseY + 1}`}
              stroke="#F4F8FF"
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
              opacity={0.9}
            />
            <path
              d={`M${r - 54},${t.baseY + 1} Q${r - 30},${t.baseY + 8} ${r - 8},${t.baseY - 2}`}
              stroke="#F4F8FF"
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
              opacity={0.9}
            />
          </g>
        );
      })}

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
          {lightsOn && <circle cx={p.x} cy={p.y} r={9} fill={p.c} opacity={0.25} className={staticMode ? undefined : "tree-light-glow"} style={staticMode ? undefined : { animationDelay: `${p.d}s` }} />}
          <circle
            cx={p.x}
            cy={p.y}
            r={4}
            fill={lightsOn ? p.c : "#5B6478"}
            className={lightsOn && !staticMode ? "tree-light" : undefined}
            style={lightsOn && !staticMode ? { animationDelay: `${p.d}s` } : undefined}
          />
        </g>
      ))}

      {/* estrela do topo */}
      <g transform={`translate(${TREE_CX},${TIERS[0].apexY - 14})`}>
        {(starGlow || lightsOn) && <circle r={starGlow ? 62 : 40} fill="url(#tglow)" className={staticMode ? undefined : "tree-star-glow"} />}
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
