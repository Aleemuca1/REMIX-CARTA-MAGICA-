import { forwardRef, useId, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GROUND_Y, HOUSE, VIEW_H, VIEW_W, PERSON_SIZE, catalogItem, parsePerson, type HouseCfg, type HouseItem } from "../../house/model";
import { ItemArt, Person } from "./art";

export type SantaStep = 0 | 1 | 2 | 3;
export type Ghost = { ref: string; kind: "item" | "pessoa"; x: number; y: number } | null;

type Props = {
  cfg: HouseCfg;
  items: HouseItem[];
  night: boolean;
  selected?: string | null;
  bubble?: HouseItem | null;
  santa?: SantaStep;
  santaLine?: string;
  ghost?: Ghost;
  onBgDown?: (e: RPointerEvent<SVGSVGElement>) => void;
  onBgMove?: (e: RPointerEvent<SVGSVGElement>) => void;
  onBgUp?: (e: RPointerEvent<SVGSVGElement>) => void;
  onItemDown?: (e: RPointerEvent<SVGGElement>, it: HouseItem) => void;
  className?: string;
  still?: boolean; // sem animações (miniatura / imagem)
};

const O = "#3B2416";
const { x: HX, y: HY, w: HW, h: HH, floorY } = HOUSE;
const BOTTOM = HY + HH;
const MID = HX + HW / 2;
const CHIMNEY_X = HX + HW * 0.74;
const ROOF_TOP = HY - 168;
const seedOf = (id: string) => [...id].reduce((a, c) => a + c.charCodeAt(0), 0);

/** desenho (item ou pessoa) já posicionado e no tamanho certo */
export function Drawn({ it, night }: { it: Pick<HouseItem, "id" | "kind" | "ref" | "s">; night?: boolean }): ReactNode {
  if (it.kind === "pessoa") {
    const p = parsePerson(it.ref);
    if (!p) return null;
    return <Person type={p.type} tone={p.tone} outfit={p.outfit} />;
  }
  return <ItemArt id={it.ref} seed={seedOf(it.id)} night={night} />;
}
export const unitsOf = (it: Pick<HouseItem, "kind" | "ref" | "s">) => ((it.kind === "pessoa" ? PERSON_SIZE : catalogItem(it.ref)?.size ?? 44) / 100) * it.s;

function Lamp({ x, y, night, len = 26 }: { x: number; y: number; night: boolean; len?: number }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + len} stroke={O} strokeWidth={2} />
      {night && <ellipse cx={x} cy={y + len + 40} rx={70} ry={55} fill="#FFD27A" opacity={0.16} />}
      <path d={`M${x - 14},${y + len + 12} Q${x},${y + len - 6} ${x + 14},${y + len + 12} Z`} fill="#F2B632" stroke={O} strokeWidth={2} />
      <circle cx={x} cy={y + len + 14} r={4} fill={night ? "#FFF3B0" : "#FFF"} stroke={O} strokeWidth={1.4} />
    </g>
  );
}

function Window({ x, y, w, h, night, curtain = "#D62839" }: { x: number; y: number; w: number; h: number; night: boolean; curtain?: string }) {
  return (
    <g>
      <rect x={x - 6} y={y - 6} width={w + 12} height={h + 12} rx={8} fill="#FFF" stroke={O} strokeWidth={2.4} />
      <rect x={x} y={y} width={w} height={h} rx={4} fill={night ? "#13224F" : "#9ED8FF"} />
      {night ? <circle cx={x + w * 0.72} cy={y + h * 0.3} r={7} fill="#FFF6D6" /> : <circle cx={x + w * 0.72} cy={y + h * 0.3} r={7} fill="#FFE066" />}
      <path d={`M${x},${y + h} Q${x + w * 0.3},${y + h * 0.62} ${x + w * 0.6},${y + h * 0.78} T${x + w},${y + h * 0.7} V${y + h} Z`} fill="#FFF" />
      {night && [0.2, 0.45, 0.8].map((f, i) => <circle key={i} cx={x + w * f} cy={y + h * (0.25 + i * 0.15)} r={1.6} fill="#FFF" />)}
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#FFF" strokeWidth={4} />
      <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke="#FFF" strokeWidth={4} />
      <path d={`M${x - 10},${y - 8} Q${x + 14},${y + h * 0.4} ${x - 4},${y + h + 6} L${x - 12},${y + h + 6} Z`} fill={curtain} stroke={O} strokeWidth={2} />
      <path d={`M${x + w + 10},${y - 8} Q${x + w - 14},${y + h * 0.4} ${x + w + 4},${y + h + 6} L${x + w + 12},${y + h + 6} Z`} fill={curtain} stroke={O} strokeWidth={2} />
      <rect x={x - 14} y={y - 12} width={w + 28} height={7} rx={3.5} fill="#9C6B43" stroke={O} strokeWidth={2} />
      <rect x={x - 8} y={y + h + 6} width={w + 16} height={7} rx={3} fill="#FFF" stroke={O} strokeWidth={2} />
    </g>
  );
}

function Interior({ cfg, night, uid }: { cfg: HouseCfg; night: boolean; uid: string }) {
  const ice = cfg.model === "iglu";
  const quartoBg = ice ? "#E7F4FF" : "#ECE6FF";
  const salaBg = ice ? "#EAF6FF" : "#FCE7C9";
  const ceiaBg = ice ? "#E3F2FD" : "#DDF3E6";
  const wood = ice ? "#BFD9EE" : "#C98B5A";
  return (
    <g>
      <defs>
        <pattern id={`stars${uid}`} width={34} height={34} patternUnits="userSpaceOnUse">
          <rect width={34} height={34} fill={quartoBg} />
          <path d="M8,6 l1.6,3.4 l3.6,.4 l-2.7,2.4 l.8,3.6 l-3.3,-1.9 l-3.3,1.9 l.8,-3.6 l-2.7,-2.4 l3.6,-.4 Z" fill="#C9B8FF" />
          <circle cx={26} cy={24} r={2} fill="#C9B8FF" />
        </pattern>
        <pattern id={`stripes${uid}`} width={26} height={26} patternUnits="userSpaceOnUse">
          <rect width={26} height={26} fill={salaBg} />
          <rect width={9} height={26} fill={ice ? "#DCEEFF" : "#F7D7AE"} />
          <circle cx={18} cy={8} r={1.8} fill={ice ? "#B9DCF5" : "#E7A86E"} />
        </pattern>
        <pattern id={`dots${uid}`} width={28} height={28} patternUnits="userSpaceOnUse">
          <rect width={28} height={28} fill={ceiaBg} />
          <circle cx={7} cy={7} r={2.2} fill={ice ? "#B9DCF5" : "#9BD4B4"} />
          <circle cx={21} cy={21} r={2.2} fill={ice ? "#B9DCF5" : "#F4A3B4"} />
        </pattern>
        <pattern id={`tiles${uid}`} width={24} height={24} patternUnits="userSpaceOnUse">
          <rect width={24} height={24} fill="#FFF" />
          <rect width={12} height={12} fill="#E05A63" />
          <rect x={12} y={12} width={12} height={12} fill="#E05A63" />
        </pattern>
      </defs>
      {/* quarto */}
      <rect x={HX} y={HY} width={HW} height={floorY - HY} fill={`url(#stars${uid})`} />
      {/* sala e ceia */}
      <rect x={HX} y={floorY} width={HW / 2} height={BOTTOM - floorY} fill={`url(#stripes${uid})`} />
      <rect x={MID} y={floorY} width={HW / 2} height={BOTTOM - floorY} fill={`url(#dots${uid})`} />
      {/* lambri da sala */}
      <rect x={HX} y={BOTTOM - 56} width={HW / 2} height={40} fill={wood} opacity={0.55} />
      <line x1={HX} y1={BOTTOM - 56} x2={MID} y2={BOTTOM - 56} stroke={O} strokeWidth={2} opacity={0.4} />
      {/* azulejo da ceia */}
      <rect x={MID} y={BOTTOM - 56} width={HW / 2} height={40} fill={`url(#tiles${uid})`} opacity={0.35} />
      {/* janelas */}
      <Window x={HX + 40} y={HY + 34} w={78} h={62} night={night} curtain={ice ? "#2F6DB5" : "#D62839"} />
      <Window x={MID + 70} y={floorY + 34} w={64} h={50} night={night} curtain="#2D8A5B" />
      {/* prateleira do quarto */}
      <rect x={MID + 40} y={HY + 70} width={110} height={6} rx={2} fill="#9C6B43" stroke={O} strokeWidth={2} />
      <rect x={MID + 50} y={HY + 52} width={10} height={18} fill="#2F6DB5" stroke={O} strokeWidth={1.6} />
      <rect x={MID + 62} y={HY + 48} width={10} height={22} fill="#D62839" stroke={O} strokeWidth={1.6} />
      <rect x={MID + 74} y={HY + 54} width={10} height={16} fill="#FFD166" stroke={O} strokeWidth={1.6} />
      <circle cx={MID + 130} cy={HY + 60} r={9} fill="#2D8A5B" stroke={O} strokeWidth={1.6} />
      <rect x={MID + 124} y={HY + 62} width={12} height={8} fill="#B5651D" stroke={O} strokeWidth={1.4} />
      {/* guirlanda da sala */}
      <g transform={`translate(${HX + 160}, ${floorY + 48})`}>
        <circle r={18} fill="none" stroke={O} strokeWidth={12} />
        <circle r={18} fill="none" stroke="#2A9A61" strokeWidth={8} />
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <circle key={k} cx={Math.cos(k) * 18} cy={Math.sin(k) * 18} r={2.6} fill="#D62839" />
        ))}
        <path d="M-7,14 L0,22 L7,14 L0,18 Z" fill="#D62839" stroke={O} strokeWidth={1.6} />
      </g>
      {/* escada da ceia para o quarto */}
      <g>
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={HX + HW - 28 - i * 0} y={BOTTOM - 16 - (i + 1) * 23} width={28 - 0} height={23} fill="#B07A4F" stroke={O} strokeWidth={1.6} />
        ))}
        <path d={`M${HX + HW - 30},${BOTTOM - 16} L${HX + HW - 30},${floorY}`} stroke={O} strokeWidth={2} />
      </g>
      {/* luminárias */}
      <Lamp x={HX + 90} y={floorY + 2} night={night} />
      <Lamp x={MID + 50} y={floorY + 2} night={night} len={18} />
      <Lamp x={MID - 40} y={HY} night={night} len={20} />
      {/* pisos */}
      <rect x={HX} y={BOTTOM - 16} width={HW} height={16} fill={ice ? "#A9CDEB" : "#8B5A33"} />
      {Array.from({ length: 13 }, (_, i) => (
        <line key={i} x1={HX + i * 40} y1={BOTTOM - 16} x2={HX + i * 40 + 6} y2={BOTTOM} stroke={O} strokeWidth={1.2} opacity={0.5} />
      ))}
      {/* placas dos cômodos */}
      {[
        ["QUARTO", MID + 120, HY + 120],
        ["SALA", HX + 50, floorY + 120],
        ["CEIA", MID + 40, BOTTOM - 70],
      ].map(([t, x, y]) => (
        <g key={t as string} opacity={0.85}>
          <rect x={(x as number) - 32} y={(y as number) - 11} width={64} height={18} rx={9} fill="#FFF" opacity={0.75} />
          <text x={x as number} y={(y as number) + 2} textAnchor="middle" fontSize={10} fontWeight={800} letterSpacing={2} fill="#7A4A26" fontFamily="system-ui, sans-serif">
            {t}
          </text>
        </g>
      ))}
      {night && <rect x={HX} y={HY} width={HW} height={HH} fill="#FFB347" opacity={0.1} />}
    </g>
  );
}

function Shell({ cfg, night, uid }: { cfg: HouseCfg; night: boolean; uid: string }) {
  const candy = cfg.model === "biscoito";
  if (cfg.model === "iglu") {
    return (
      <g>
        <path d={`M${HX - 30},${BOTTOM} V${HY + 40} Q${MID},${HY - 230} ${HX + HW + 30},${HY + 40} V${BOTTOM} Z`} fill="#E3F2FD" stroke={O} strokeWidth={3} />
        {[0.25, 0.5, 0.75].map((f, i) => (
          <path key={i} d={`M${HX - 30 + 40 * f},${HY + 40 - i * 4} Q${MID},${HY - 230 + 200 * f} ${HX + HW + 30 - 40 * f},${HY + 40 - i * 4}`} fill="none" stroke="#A9CDEB" strokeWidth={2.4} />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={HX - 20 + i * 66} y1={HY - 10 - Math.sin((i / 8) * Math.PI) * 120} x2={HX - 20 + i * 66} y2={HY + 6 - Math.sin((i / 8) * Math.PI) * 100} stroke="#A9CDEB" strokeWidth={2.4} />
        ))}
        <ellipse cx={MID} cy={HY - 128} rx={70} ry={16} fill="#FFF" stroke={O} strokeWidth={2} />
        {/* frente de gelo nas laterais */}
        <rect x={HX - 30} y={HY} width={30} height={HH} fill="#D4EAFB" stroke={O} strokeWidth={2.4} />
        <rect x={HX + HW} y={HY} width={30} height={HH} fill="#D4EAFB" stroke={O} strokeWidth={2.4} />
      </g>
    );
  }
  const wall = candy ? "#C47A3A" : "#7A4A26";
  return (
    <g>
      {/* chaminé */}
      <rect x={CHIMNEY_X - 24} y={ROOF_TOP + 46} width={48} height={110} fill={candy ? "#F4A3B4" : "#A2412D"} stroke={O} strokeWidth={3} />
      {!candy &&
        Array.from({ length: 6 }, (_, r) => (
          <g key={r}>
            <line x1={CHIMNEY_X - 24} y1={ROOF_TOP + 62 + r * 16} x2={CHIMNEY_X + 24} y2={ROOF_TOP + 62 + r * 16} stroke="#6E2A1D" strokeWidth={2} />
            <line x1={CHIMNEY_X - 8 + (r % 2) * 16} y1={ROOF_TOP + 46 + r * 16} x2={CHIMNEY_X - 8 + (r % 2) * 16} y2={ROOF_TOP + 62 + r * 16} stroke="#6E2A1D" strokeWidth={2} />
          </g>
        ))}
      {candy && [0, 1, 2, 3].map((i) => <rect key={i} x={CHIMNEY_X - 24} y={ROOF_TOP + 56 + i * 26} width={48} height={10} fill="#FFF" />)}
      <rect x={CHIMNEY_X - 30} y={ROOF_TOP + 36} width={60} height={16} rx={6} fill="#FFF" stroke={O} strokeWidth={2.4} />
      {/* telhado */}
      <defs>
        <clipPath id={`roof${uid}`}>
          <polygon points={`${HX - 44},${HY + 4} ${MID},${ROOF_TOP} ${HX + HW + 44},${HY + 4}`} />
        </clipPath>
      </defs>
      <polygon points={`${HX - 44},${HY + 4} ${MID},${ROOF_TOP} ${HX + HW + 44},${HY + 4}`} fill={cfg.roof} stroke={O} strokeWidth={3.2} strokeLinejoin="round" />
      <g clipPath={`url(#roof${uid})`}>
        {candy
          ? Array.from({ length: 16 }, (_, i) => (
              <path key={i} d={`M${HX - 60 + i * 44},${HY + 10} L${HX - 20 + i * 44 - 160},${ROOF_TOP - 40}`} stroke="#FFF" strokeWidth={12} opacity={0.55} />
            ))
          : Array.from({ length: 7 }, (_, r) =>
              Array.from({ length: 22 }, (_, k) => (
                <path
                  key={`${r}-${k}`}
                  d={`M${HX - 60 + k * 30 + (r % 2) * 15},${ROOF_TOP + 34 + r * 24} q15,16 30,0`}
                  fill="none"
                  stroke="#000"
                  strokeOpacity={0.18}
                  strokeWidth={2.4}
                />
              )),
            )}
      </g>
      {/* janela redonda do sótão */}
      <circle cx={MID} cy={HY - 66} r={24} fill={night ? "#FFD27A" : "#BDE3FF"} stroke="#FFF" strokeWidth={6} />
      <circle cx={MID} cy={HY - 66} r={27} fill="none" stroke={O} strokeWidth={2.4} />
      <path d={`M${MID - 24},${HY - 66} H${MID + 24} M${MID},${HY - 90} V${HY - 42}`} stroke="#FFF" strokeWidth={4} />
      {night && <circle cx={MID} cy={HY - 66} r={40} fill="#FFD27A" opacity={0.18} />}
      {/* neve no telhado com pingentes */}
      <path
        d={`M${HX - 50},${HY + 6} L${MID},${ROOF_TOP - 6} L${HX + HW + 50},${HY + 6} Q${HX + HW + 30},${HY + 18} ${HX + HW + 18},${HY + 8} Q${HX + HW},${HY + 22} ${HX + HW - 14},${HY + 10} L${MID},${ROOF_TOP + 26} L${HX + 14},${HY + 10} Q${HX},${HY + 22} ${HX - 18},${HY + 8} Q${HX - 30},${HY + 18} ${HX - 50},${HY + 6} Z`}
        fill="#FFF"
        stroke={O}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      {candy &&
        ["#D62839", "#2D8A5B", "#FFD166", "#2F6DB5", "#F25C78", "#8A4FD8", "#FFD166"].map((c, i) => {
          const t = (i + 1) / 8;
          const x = HX - 44 + t * (HW + 88);
          const y = HY + 4 - (1 - Math.abs(t - 0.5) * 2) * (HY - ROOF_TOP) + 30;
          return <circle key={i} cx={x} cy={y} r={11} fill={c} stroke={O} strokeWidth={2} />;
        })}
      {/* paredes externas (corte) */}
      <rect x={HX - 16} y={HY} width={16} height={HH} fill={wall} stroke={O} strokeWidth={2.4} />
      <rect x={HX + HW} y={HY} width={16} height={HH} fill={wall} stroke={O} strokeWidth={2.4} />
      {candy &&
        [HX - 8, HX + HW + 8].map((x) => (
          <path key={x} d={`M${x},${HY + 6} V${BOTTOM - 6}`} stroke="#FFF" strokeWidth={5} strokeDasharray="10 10" strokeLinecap="round" />
        ))}
    </g>
  );
}

function Lights({ night, still }: { night: boolean; still?: boolean }) {
  const cols = ["#FFD166", "#EF233C", "#4CC9F0", "#7CE38B", "#FF7AA2"];
  const pts = Array.from({ length: 17 }, (_, i) => {
    const t = i / 16;
    return { x: HX - 40 + t * (HW + 80), y: HY + 20 + Math.abs(Math.sin(t * Math.PI * 4)) * 10, c: cols[i % cols.length] };
  });
  return (
    <g>
      <path d={`M${pts.map((p) => `${p.x},${p.y - 4}`).join(" L")}`} stroke="#1f3b2a" strokeWidth={2.4} fill="none" />
      {pts.map((p, i) => (
        <g key={i}>
          {night && <circle cx={p.x} cy={p.y + 4} r={11} fill={p.c} opacity={0.38} />}
          <rect x={p.x - 2.5} y={p.y - 6} width={5} height={4} fill="#2B2B38" />
          <ellipse cx={p.x} cy={p.y + 3} rx={4.5} ry={6.5} fill={p.c} stroke={O} strokeWidth={1.2} className={night && !still ? "lt-bulb" : undefined} style={{ animationDelay: `${(i % 4) * 0.35}s` }} />
        </g>
      ))}
    </g>
  );
}

const HouseScene = forwardRef<SVGSVGElement, Props>(function HouseScene(
  { cfg, items, night, selected, bubble, santa = 0, santaLine, ghost, onBgDown, onBgMove, onBgUp, onItemDown, className, still },
  ref,
) {
  const uid = useId().replace(/:/g, "");
  // tapetes ficam no chão, por baixo de tudo; o resto por profundidade
  const sorted = [...items].sort((a, b) => (a.ref === "tapete" ? -1 : 0) - (b.ref === "tapete" ? -1 : 0) || a.y - b.y);
  const chimneyTop = cfg.model === "iglu" ? HY - 150 : ROOF_TOP + 36;
  const santaX = cfg.model === "iglu" ? MID : CHIMNEY_X;
  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onPointerDown={onBgDown}
      onPointerMove={onBgMove}
      onPointerUp={onBgUp}
      style={{ touchAction: "none", userSelect: "none" }}
      role="img"
      aria-label={cfg.title || "Nossa Casinha de Natal"}
    >
      <defs>
        <linearGradient id={`sky${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={night ? "#050C26" : "#7CC8F4"} />
          <stop offset="1" stopColor={night ? "#24386E" : "#E3F5FF"} />
        </linearGradient>
        <radialGradient id={`glow${uid}`}>
          <stop offset="0" stopColor="#FFE9A8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`snow${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor={night ? "#B9C8E8" : "#DCEBF7"} />
        </linearGradient>
      </defs>
      <rect width={VIEW_W} height={VIEW_H} fill={`url(#sky${uid})`} />
      {night ? (
        <>
          <path d="M-20,150 Q200,40 420,120 T920,80" stroke="#4BE3A5" strokeWidth={46} fill="none" opacity={0.13} strokeLinecap="round" />
          <path d="M-20,200 Q240,100 480,170 T920,130" stroke="#8A7CFF" strokeWidth={34} fill="none" opacity={0.1} strokeLinecap="round" />
          {Array.from({ length: 46 }, (_, i) => (
            <circle key={i} cx={(i * 97 + 13) % VIEW_W} cy={(i * 53) % 260} r={i % 6 === 0 ? 2.2 : 1.2} fill="#FFFFFF" opacity={0.45 + (i % 3) * 0.2} />
          ))}
          <circle cx={790} cy={84} r={70} fill={`url(#glow${uid})`} />
          <circle cx={790} cy={84} r={32} fill="#FFF6D6" stroke="#E9D8A6" strokeWidth={2} />
          <circle cx={780} cy={76} r={6} fill="#EFE2B8" />
          <circle cx={800} cy={96} r={4} fill="#EFE2B8" />
        </>
      ) : (
        <>
          <circle cx={800} cy={84} r={60} fill={`url(#glow${uid})`} />
          <circle cx={800} cy={84} r={34} fill="#FFE066" stroke="#F2B632" strokeWidth={3} />
          <g fill="#FFFFFF" stroke="#C9E4F5" strokeWidth={2}>
            <path d="M80,100 q0,-26 30,-24 q10,-22 36,-12 q26,-6 30,18 q20,4 12,20 h-104 q-10,-2 -4,-2 Z" />
            <path d="M560,70 q0,-20 24,-18 q10,-16 30,-8 q20,-2 22,14 q14,4 8,14 h-80 Z" />
          </g>
        </>
      )}
      {/* vila ao longe */}
      <path d={`M0,${GROUND_Y - 50} Q180,${GROUND_Y - 130} 360,${GROUND_Y - 60} T720,${GROUND_Y - 70} T${VIEW_W},${GROUND_Y - 80} V${VIEW_H} H0 Z`} fill={night ? "#2B3F74" : "#BFDDF3"} />
      {[
        [40, 0.8],
        [770, 0.7],
        [845, 0.9],
      ].map(([x, s], i) => (
        <g key={i} transform={`translate(${x},${GROUND_Y - 70}) scale(${s})`}>
          <rect x={-18} y={-20} width={36} height={30} fill={night ? "#3A4F86" : "#E8F2FA"} stroke={O} strokeWidth={1.6} />
          <path d="M-24,-18 L0,-40 L24,-18 Z" fill={night ? "#5A3A6E" : "#C1121F"} stroke={O} strokeWidth={1.6} />
          <rect x={-6} y={-12} width={12} height={10} fill={night ? "#FFD27A" : "#9ED8FF"} />
        </g>
      ))}
      {[95, 140, 720, 812].map((x, i) => (
        <g key={i} transform={`translate(${x},${GROUND_Y - 34}) scale(${0.75 + (i % 2) * 0.2})`}>
          <ItemArt id="pinheiro" />
        </g>
      ))}

      <Shell cfg={cfg} night={night} uid={uid} />
      <Interior cfg={cfg} night={night} uid={uid} />
      {/* contorno e piso entre andares */}
      <rect x={HX} y={floorY - 8} width={HW} height={12} fill={cfg.model === "iglu" ? "#A9CDEB" : "#7A4A26"} stroke={O} strokeWidth={2} />
      <line x1={MID} y1={floorY + 4} x2={MID} y2={BOTTOM - 16} stroke={cfg.model === "iglu" ? "#A9CDEB" : "#7A4A26"} strokeWidth={6} />
      <rect x={HX} y={HY} width={HW} height={HH} fill="none" stroke={O} strokeWidth={3} />
      {cfg.model !== "iglu" && <Lights night={night} still={still} />}

      {/* chão de neve, cerca e lampião */}
      <path d={`M0,${GROUND_Y} Q220,${GROUND_Y - 20} 450,${GROUND_Y + 4} T${VIEW_W},${GROUND_Y - 8} V${VIEW_H} H0 Z`} fill={`url(#snow${uid})`} stroke="#C9D8EA" strokeWidth={2} />
      <rect x={HX - 30} y={BOTTOM - 2} width={HW + 60} height={12} rx={4} fill="#9AA6B8" stroke={O} strokeWidth={2} />
      {[20, 50, 80, 110, 140].map((x) => (
        <g key={x}>
          <rect x={x} y={GROUND_Y - 6} width={8} height={34} rx={3} fill="#9C6B43" stroke={O} strokeWidth={1.6} />
          <rect x={x - 2} y={GROUND_Y - 10} width={12} height={6} rx={3} fill="#FFF" />
        </g>
      ))}
      <path d={`M20,${GROUND_Y + 4} H148 M20,${GROUND_Y + 18} H148`} stroke="#9C6B43" strokeWidth={4} />
      <g transform={`translate(${VIEW_W - 60},${GROUND_Y - 30})`}>
        <rect x={-3} y={-20} width={6} height={74} fill="#2B2B38" />
        <rect x={-12} y={-44} width={24} height={26} rx={4} fill={night ? "#FFD27A" : "#FFF3C4"} stroke={O} strokeWidth={2.4} />
        <path d="M-15,-44 L0,-56 L15,-44 Z" fill="#2B2B38" />
        {night && <circle cx={0} cy={-31} r={34} fill="#FFD27A" opacity={0.22} />}
        <path d="M-12,-18 q12,10 24,0" stroke="#D62839" strokeWidth={4} fill="none" />
      </g>

      {/* fumacinha */}
      {cfg.model !== "iglu" && !still && (
        <g>
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={CHIMNEY_X}
              cy={ROOF_TOP + 30}
              r={10}
              fill="#FFFFFF"
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: [0, 0.7, 0], y: -70, scale: 1.8, x: 20 }}
              transition={{ duration: 3.2, repeat: Infinity, delay: i * 1.05 }}
            />
          ))}
        </g>
      )}

      {/* itens e família */}
      {sorted.map((it) => {
        const k = unitsOf(it);
        return (
          <g key={it.id} onPointerDown={onItemDown ? (e) => onItemDown(e, it) : undefined} style={{ cursor: onItemDown ? "grab" : undefined }}>
            {selected === it.id && <ellipse cx={it.x} cy={it.y} rx={58 * k} ry={56 * k} fill="#FFD166" opacity={0.22} stroke="#FFD166" strokeWidth={3} strokeDasharray="7 6" />}
            <g transform={`translate(${it.x},${it.y}) scale(${k})`}>
              <Drawn it={it} night={night} />
            </g>
            {it.kind === "pessoa" && it.name && (
              <g pointerEvents="none">
                <rect x={it.x - it.name.length * 3.9 - 10} y={it.y + 48 * k} width={it.name.length * 7.8 + 20} height={20} rx={10} fill="#FFF" stroke={O} strokeWidth={2} />
                <text x={it.x} y={it.y + 48 * k + 14} textAnchor="middle" fontSize={12} fontWeight={800} fill="#7A1020" fontFamily="system-ui, sans-serif">
                  {it.name}
                </text>
              </g>
            )}
            {it.text && !still && (
              <g pointerEvents="none" transform={`translate(${it.x + 34 * k},${it.y - 44 * k})`}>
                <circle r={10} fill="#D62839" stroke="#FFF" strokeWidth={2.4} />
                <path d="M-4.5,-2 a2.6,2.6 0 0 1 4.5,-1.6 a2.6,2.6 0 0 1 4.5,1.6 q0,3 -4.5,6 q-4.5,-3 -4.5,-6 Z" fill="#FFF" />
              </g>
            )}
          </g>
        );
      })}

      {ghost && (
        <g transform={`translate(${ghost.x},${ghost.y}) scale(${unitsOf({ kind: ghost.kind, ref: ghost.ref, s: 1 })})`} opacity={0.55} pointerEvents="none">
          <Drawn it={{ id: "ghost", kind: ghost.kind, ref: ghost.ref, s: 1 }} night={night} />
        </g>
      )}

      {/* balão de recadinho */}
      <AnimatePresence>
        {bubble?.text && (
          <motion.g key={bubble.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} pointerEvents="none">
            {(() => {
              const w = Math.min(320, Math.max(150, bubble.text.length * 7.2 + 34));
              const bx = Math.min(Math.max(bubble.x - w / 2, 10), VIEW_W - w - 10);
              const by = Math.max(bubble.y - 60 * unitsOf(bubble) - 80, 8);
              return (
                <>
                  <path d={`M${bubble.x - 8},${by + 70} L${bubble.x},${by + 84} L${bubble.x + 8},${by + 70} Z`} fill="#FFF" stroke={O} strokeWidth={2.4} />
                  <rect x={bx} y={by} width={w} height={72} rx={18} fill="#FFF" stroke={O} strokeWidth={2.4} />
                  <foreignObject x={bx + 10} y={by + 6} width={w - 20} height={62}>
                    <div style={{ font: "600 13px system-ui, sans-serif", color: "#2B2118", lineHeight: 1.25, textAlign: "center" }}>
                      “{bubble.text}”
                      {(bubble.author || bubble.name) && <div style={{ color: "#B5172E", fontWeight: 800, fontSize: 12, marginTop: 2 }}>— {bubble.author || bubble.name}</div>}
                    </div>
                  </foreignObject>
                </>
              );
            })()}
          </motion.g>
        )}
      </AnimatePresence>

      {/* visita do Papai Noel */}
      {santa >= 1 && !still && (
        <motion.g initial={{ x: VIEW_W + 60 }} animate={{ x: -360 }} transition={{ duration: 3.4, ease: "easeInOut" }}>
          <g transform="translate(0,110) scale(0.55)">
            <ItemArt id="rena" night />
          </g>
          <g transform="translate(70,104) scale(0.55)">
            <ItemArt id="rena" night />
          </g>
          <path d="M20,104 L120,112" stroke="#C99A4B" strokeWidth={2} />
          <g transform="translate(160,108) scale(0.7)">
            <ItemArt id="treno" />
          </g>
          <g transform="translate(150,78) scale(0.5)">
            <Santa />
          </g>
        </motion.g>
      )}
      {santa >= 2 && !still && (
        <motion.g
          initial={{ x: santaX, y: chimneyTop - 80, opacity: 0 }}
          animate={santa === 3 ? { x: HX + HW * 0.36, y: BOTTOM - 62, opacity: 1 } : { y: [chimneyTop - 80, chimneyTop - 30, chimneyTop + 30], opacity: [0, 1, 0] }}
          transition={{ duration: santa === 3 ? 0.6 : 1.6 }}
        >
          <g transform="scale(0.95)">
            <Santa />
          </g>
        </motion.g>
      )}
      {santa === 3 && !still && santaLine && (
        <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: "spring" }} style={{ transformOrigin: `${HX + HW * 0.36}px ${floorY}px` }}>
          <rect x={HX + 14} y={floorY - 74} width={390} height={60} rx={20} fill="#D62839" stroke="#FFD166" strokeWidth={3} />
          <foreignObject x={HX + 24} y={floorY - 68} width={370} height={50}>
            <div style={{ font: "800 14px system-ui, sans-serif", color: "#FFFFFF", lineHeight: 1.25, textAlign: "center" }}>{santaLine}</div>
          </foreignObject>
        </motion.g>
      )}
      {night && !still && (
        <g pointerEvents="none">
          {Array.from({ length: 26 }, (_, i) => (
            <circle key={i} cx={(i * 37 + 11) % VIEW_W} cy={-10} r={1.8 + (i % 3)} fill="#FFFFFF" opacity={0.85} className="hs-snow" style={{ animationDelay: `${(i * 0.37) % 6}s`, animationDuration: `${6 + (i % 5)}s` }} />
          ))}
        </g>
      )}
    </svg>
  );
});

/** Papai Noel desenhado no mesmo estilo dos bonequinhos */
function Santa() {
  const l = { stroke: O, strokeWidth: 2.6, strokeLinejoin: "round" as const };
  return (
    <g>
      <ellipse cx={0} cy={48} rx={30} ry={4.5} fill="#000" opacity={0.18} />
      <rect x={-16} y={30} width={12} height={14} rx={4} fill="#2B2B38" {...l} />
      <rect x={4} y={30} width={12} height={14} rx={4} fill="#2B2B38" {...l} />
      <path d="M-28,4 Q0,-8 28,4 L32,34 Q0,42 -32,34 Z" fill="#D62839" {...l} />
      <rect x={-31} y={20} width={62} height={8} fill="#2B2B38" />
      <rect x={-6} y={19} width={12} height={10} rx={2} fill="#FFD166" {...l} strokeWidth={2} />
      <path d="M0,-2 V34" stroke="#FFF" strokeWidth={6} />
      <path d="M-28,8 q-14,8 -10,22" stroke={O} strokeWidth={12} fill="none" strokeLinecap="round" />
      <path d="M-28,8 q-14,8 -10,22" stroke="#D62839" strokeWidth={7.5} fill="none" strokeLinecap="round" />
      <path d="M28,8 q16,-10 18,-26" stroke={O} strokeWidth={12} fill="none" strokeLinecap="round" />
      <path d="M28,8 q16,-10 18,-26" stroke="#D62839" strokeWidth={7.5} fill="none" strokeLinecap="round" />
      <circle cx={-38} cy={30} r={5} fill="#FFF" {...l} strokeWidth={2} />
      <circle cx={46} cy={-20} r={5} fill="#FFF" {...l} strokeWidth={2} />
      <circle cx={0} cy={-18} r={21} fill="#FFE0C7" {...l} />
      <path d="M-20,-14 Q-24,16 0,22 Q24,16 20,-14 Q12,-4 0,-6 Q-12,-4 -20,-14 Z" fill="#FFF" {...l} strokeWidth={2.2} />
      <path d="M-10,-7 Q-4,-11 0,-7 Q4,-11 10,-7 Q4,-3 0,-5 Q-4,-3 -10,-7 Z" fill="#FFF" {...l} strokeWidth={1.8} />
      <circle cx={0} cy={-10} r={3.4} fill="#FF9AA2" {...l} strokeWidth={1.4} />
      <ellipse cx={-7} cy={-17} rx={2.6} ry={3.2} fill={O} />
      <ellipse cx={7} cy={-17} rx={2.6} ry={3.2} fill={O} />
      <ellipse cx={-13} cy={-11} rx={4} ry={2.4} fill="#FF7B8A" opacity={0.55} />
      <ellipse cx={13} cy={-11} rx={4} ry={2.4} fill="#FF7B8A" opacity={0.55} />
      <g transform="translate(0,-36) rotate(-10)">
        <path d="M-20,6 Q-4,-28 20,-14 Q8,-6 18,6 Z" fill="#D62839" {...l} />
        <rect x={-23} y={2} width={44} height={10} rx={5} fill="#FFF" {...l} />
        <circle cx={21} cy={-14} r={5.5} fill="#FFF" {...l} />
      </g>
    </g>
  );
}

export default HouseScene;
