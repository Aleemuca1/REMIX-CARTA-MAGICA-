/**
 * Desenhos da Casinha de Natal (personagens e enfeites), todos no mesmo estilo:
 * contorno marrom arredondado, cores suaves, brilhinho e sombra no chão.
 * Cada desenho cabe numa caixa de -50 a 50 (centro em 0,0; chão em y = 46).
 */
import type { ReactNode } from "react";
import type { PersonType } from "../../house/model";

const O = "#3B2416"; // contorno
const sw = 2.6;
const line = { stroke: O, strokeWidth: sw, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export const SKINS = ["#FFE0C7", "#F7C9A1", "#E2AC7D", "#C68B59", "#8D5524", "#5E3A22"];
export const OUTFITS = ["#D62839", "#2D8A5B", "#2F6DB5", "#8A4FD8", "#F07B3F", "#E7558B"];
export { PERSON_TYPES, personRef, parsePerson } from "../../house/model";

const Shadow = ({ w = 34, y = 46 }: { w?: number; y?: number }) => <ellipse cx={0} cy={y} rx={w} ry={4.5} fill="#000" opacity={0.18} />;
const Shine = ({ x, y, r = 3 }: { x: number; y: number; r?: number }) => <circle cx={x} cy={y} r={r} fill="#FFF" opacity={0.75} />;

function Face({ cy = -16, glasses = false, old = false }: { cy?: number; glasses?: boolean; old?: boolean }) {
  return (
    <g>
      <ellipse cx={-7.5} cy={cy + 1} rx={2.7} ry={3.5} fill={O} />
      <ellipse cx={7.5} cy={cy + 1} rx={2.7} ry={3.5} fill={O} />
      <circle cx={-6.6} cy={cy - 0.2} r={1.1} fill="#FFF" />
      <circle cx={8.4} cy={cy - 0.2} r={1.1} fill="#FFF" />
      <ellipse cx={-13} cy={cy + 7.5} rx={4.2} ry={2.6} fill="#FF7B8A" opacity={0.55} />
      <ellipse cx={13} cy={cy + 7.5} rx={4.2} ry={2.6} fill="#FF7B8A" opacity={0.55} />
      <path d={`M-4,${cy + 8} Q0,${cy + 12} 4,${cy + 8}`} fill="none" {...line} strokeWidth={2.2} />
      {glasses && (
        <g fill="none" stroke={O} strokeWidth={1.8}>
          <circle cx={-7.5} cy={cy + 1} r={5.6} />
          <circle cx={7.5} cy={cy + 1} r={5.6} />
          <path d={`M-1.9,${cy} L1.9,${cy}`} />
        </g>
      )}
      {old && <path d={`M-12,${cy - 6} q3,-2 6,0 M6,${cy - 6} q3,-2 6,0`} stroke={O} strokeWidth={1.4} fill="none" opacity={0.5} />}
    </g>
  );
}

/** Suéter de Natal com faixa de zigue-zague e bolinhas */
function Sweater({ c, top = 2, bottom = 32, w = 22 }: { c: string; top?: number; bottom?: number; w?: number }) {
  return (
    <g>
      <path d={`M${-w + 4},${top} Q0,${top - 6} ${w - 4},${top} L${w},${bottom} Q0,${bottom + 4} ${-w},${bottom} Z`} fill={c} {...line} />
      <path
        d={`M${-w + 2},${top + 13} l5,-4 l5,4 l5,-4 l5,4 l5,-4 l5,4 l5,-4 l5,4`}
        fill="none"
        stroke="#FFF"
        strokeWidth={2.4}
        strokeLinejoin="round"
        opacity={0.95}
      />
      <circle cx={-9} cy={top + 22} r={1.6} fill="#FFF" />
      <circle cx={0} cy={top + 24} r={1.6} fill="#FFF" />
      <circle cx={9} cy={top + 22} r={1.6} fill="#FFF" />
      <path d={`M-6,${top - 2} Q0,${top + 3} 6,${top - 2}`} fill="none" stroke="#FFF" strokeWidth={2} opacity={0.8} />
    </g>
  );
}

function Legs({ c = "#3C4A6E" }: { c?: string }) {
  return (
    <g>
      <rect x={-13} y={28} width={10} height={14} rx={4} fill={c} {...line} />
      <rect x={3} y={28} width={10} height={14} rx={4} fill={c} {...line} />
      <ellipse cx={-8} cy={43} rx={7} ry={4} fill="#5A3A28" {...line} />
      <ellipse cx={8} cy={43} rx={7} ry={4} fill="#5A3A28" {...line} />
    </g>
  );
}

function Arms({ c, skin, y = 8 }: { c: string; skin: string; y?: number }) {
  return (
    <g>
      <path d={`M-20,${y} q-9,8 -7,18`} stroke={O} strokeWidth={10.5} fill="none" strokeLinecap="round" />
      <path d={`M-20,${y} q-9,8 -7,18`} stroke={c} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d={`M20,${y} q9,8 7,18`} stroke={O} strokeWidth={10.5} fill="none" strokeLinecap="round" />
      <path d={`M20,${y} q9,8 7,18`} stroke={c} strokeWidth={6} fill="none" strokeLinecap="round" />
      <circle cx={-27} cy={y + 19} r={4.2} fill={skin} {...line} strokeWidth={2} />
      <circle cx={27} cy={y + 19} r={4.2} fill={skin} {...line} strokeWidth={2} />
    </g>
  );
}

const darkHair = (tone: number) => (tone >= 4 ? "#1E140F" : tone >= 2 ? "#3A2418" : "#6B4226");

function SantaHat({ y = -36, tilt = -12 }: { y?: number; tilt?: number }) {
  return (
    <g transform={`translate(0,${y}) rotate(${tilt})`}>
      <path d="M-19,6 Q-4,-26 18,-14 Q8,-6 17,6 Z" fill="#D62839" {...line} />
      <rect x={-22} y={2} width={42} height={9} rx={4.5} fill="#FFF" {...line} />
      <circle cx={19} cy={-14} r={5} fill="#FFF" {...line} />
    </g>
  );
}

export function Person({ type, tone, outfit }: { type: PersonType; tone: number; outfit: number }): ReactNode {
  const skin = SKINS[tone] ?? SKINS[0];
  const c = OUTFITS[outfit] ?? OUTFITS[0];
  const hair = darkHair(tone);
  if (type === "cachorro") {
    return (
      <g>
        <Shadow w={30} />
        <path d="M24,22 q14,-6 12,-20" fill="none" stroke={O} strokeWidth={8} strokeLinecap="round" />
        <path d="M24,22 q14,-6 12,-20" fill="none" stroke="#C8894E" strokeWidth={4.5} strokeLinecap="round" />
        <ellipse cx={4} cy={26} rx={26} ry={18} fill="#C8894E" {...line} />
        <ellipse cx={6} cy={30} rx={14} ry={10} fill="#F4E1C8" />
        <rect x={-18} y={30} width={10} height={15} rx={5} fill="#C8894E" {...line} />
        <rect x={-4} y={32} width={10} height={13} rx={5} fill="#C8894E" {...line} />
        <circle cx={-12} cy={-6} r={21} fill="#C8894E" {...line} />
        <ellipse cx={-12} cy={2} rx={12} ry={9} fill="#F4E1C8" />
        <path d="M-30,-14 q-10,12 -4,26 q8,-2 10,-14 Z" fill="#7A4B2A" {...line} />
        <path d="M6,-14 q10,12 4,26 q-8,-2 -10,-14 Z" fill="#7A4B2A" {...line} />
        <ellipse cx={-19} cy={-8} rx={2.6} ry={3.3} fill={O} />
        <ellipse cx={-5} cy={-8} rx={2.6} ry={3.3} fill={O} />
        <circle cx={-18.2} cy={-9} r={1} fill="#FFF" />
        <circle cx={-4.2} cy={-9} r={1} fill="#FFF" />
        <ellipse cx={-12} cy={0} rx={4.5} ry={3.2} fill={O} />
        <path d="M-12,3 v3 M-16,6 q4,4 8,0" fill="none" {...line} strokeWidth={1.8} />
        <path d="M-25,13 Q-12,20 1,13" fill="none" stroke={c} strokeWidth={5} strokeLinecap="round" />
        <circle cx={-12} cy={19} r={4} fill="#FFD166" {...line} strokeWidth={1.8} />
      </g>
    );
  }
  if (type === "gato") {
    return (
      <g>
        <Shadow w={26} />
        <path d="M18,40 q22,-4 16,-30" fill="none" stroke={O} strokeWidth={8} strokeLinecap="round" />
        <path d="M18,40 q22,-4 16,-30" fill="none" stroke="#F2A65A" strokeWidth={4.5} strokeLinecap="round" />
        <path d="M-20,44 Q-24,12 0,8 Q24,12 20,44 Z" fill="#F2A65A" {...line} />
        <path d="M-8,44 Q0,24 8,44" fill="#FFF3E2" />
        <circle cx={0} cy={-8} r={20} fill="#F2A65A" {...line} />
        <path d="M-18,-16 L-16,-36 L-4,-25 Z" fill="#F2A65A" {...line} />
        <path d="M18,-16 L16,-36 L4,-25 Z" fill="#F2A65A" {...line} />
        <path d="M-14,-20 l-1,-9 l6,5 Z M14,-20 l1,-9 l-6,5 Z" fill="#FFB3C1" />
        <path d="M-8,-22 l2,7 M0,-24 v7 M8,-22 l-2,7" stroke="#C97A35" strokeWidth={2} strokeLinecap="round" />
        <ellipse cx={-7} cy={-7} rx={2.6} ry={3.6} fill={O} />
        <ellipse cx={7} cy={-7} rx={2.6} ry={3.6} fill={O} />
        <circle cx={-6.2} cy={-8.2} r={1} fill="#FFF" />
        <circle cx={7.8} cy={-8.2} r={1} fill="#FFF" />
        <path d="M-2,-1 l2,2 l2,-2 Z" fill="#FF7B8A" />
        <path d="M0,1 q-3,4 -6,2 M0,1 q3,4 6,2" fill="none" stroke={O} strokeWidth={1.6} />
        <path d="M-20,-2 h-10 M-20,2 l-9,3 M20,-2 h10 M20,2 l9,3" stroke={O} strokeWidth={1.3} />
        <path d="M-8,10 l-8,-5 l0,10 Z M8,10 l8,-5 l0,10 Z" fill={c} {...line} strokeWidth={1.8} />
        <circle cx={0} cy={10} r={3.5} fill={c} {...line} strokeWidth={1.8} />
      </g>
    );
  }
  if (type === "bebe") {
    return (
      <g transform="translate(0,8) scale(0.82)">
        <Shadow w={24} y={46} />
        <path d="M-18,6 Q0,0 18,6 L20,40 Q0,46 -20,40 Z" fill={c} {...line} />
        <circle cx={-8} cy={22} r={2} fill="#FFF" />
        <circle cx={8} cy={22} r={2} fill="#FFF" />
        <ellipse cx={-10} cy={42} rx={8} ry={5} fill={c} {...line} />
        <ellipse cx={10} cy={42} rx={8} ry={5} fill={c} {...line} />
        <Arms c={c} skin={skin} y={10} />
        <circle cx={0} cy={-14} r={24} fill={skin} {...line} />
        <path d="M-2,-37 q6,-6 4,2 q6,-6 6,2" fill="none" stroke={hair} strokeWidth={3} strokeLinecap="round" />
        <Face cy={-12} />
        <circle cx={0} cy={-1} r={4} fill="#8ECAE6" {...line} strokeWidth={1.8} />
      </g>
    );
  }
  const isOld = type === "vova" || type === "vovo";
  const hc = isOld ? "#D5D9E0" : hair;
  const long = type === "mamae" || type === "vova" || type === "menina";
  return (
    <g>
      <Shadow w={26} />
      {/* cabelo de trás */}
      {type === "mamae" && <path d="M-24,-18 Q-30,14 -16,18 L16,18 Q30,14 24,-18 Z" fill={hc} {...line} />}
      {type === "menina" && (
        <g>
          <circle cx={-25} cy={-8} r={9} fill={hc} {...line} />
          <circle cx={25} cy={-8} r={9} fill={hc} {...line} />
          <path d="M-31,-17 l-6,-4 l1,8 Z M31,-17 l6,-4 l-1,8 Z" fill={c} {...line} strokeWidth={1.8} />
        </g>
      )}
      {type === "vova" && <circle cx={0} cy={-40} r={9} fill={hc} {...line} />}
      <Legs c={isOld ? "#5B5F73" : "#3C4A6E"} />
      <Arms c={c} skin={skin} />
      {type === "vova" ? (
        <g>
          <path d="M-20,4 Q0,-4 20,4 L23,33 Q0,38 -23,33 Z" fill={c} {...line} />
          <path d="M-20,4 L0,20 L20,4" fill="none" stroke="#FFF" strokeWidth={2.4} opacity={0.9} />
          <circle cx={0} cy={24} r={2} fill="#FFD166" />
        </g>
      ) : type === "vovo" ? (
        <g>
          <path d="M-20,4 Q0,-4 20,4 L22,32 Q0,36 -22,32 Z" fill={c} {...line} />
          <path d="M0,0 V32" stroke={O} strokeWidth={1.8} />
          {[8, 16, 24].map((y) => (
            <circle key={y} cx={3.5} cy={y} r={1.5} fill="#FFD166" />
          ))}
        </g>
      ) : (
        <Sweater c={c} />
      )}
      <circle cx={-21} cy={-14} r={4.5} fill={skin} {...line} strokeWidth={2} />
      <circle cx={21} cy={-14} r={4.5} fill={skin} {...line} strokeWidth={2} />
      <circle cx={0} cy={-16} r={21} fill={skin} {...line} />
      {/* cabelo da frente */}
      {type === "mamae" && <path d="M-21,-18 Q-18,-40 0,-38 Q18,-40 21,-18 Q12,-28 2,-26 Q-8,-30 -21,-18 Z" fill={hc} {...line} />}
      {type === "papai" && <path d="M-21,-16 Q-22,-40 0,-39 Q22,-40 21,-16 Q17,-28 8,-28 L4,-24 L0,-28 Q-12,-30 -21,-16 Z" fill={hc} {...line} />}
      {type === "menina" && <path d="M-21,-16 Q-20,-40 0,-38 Q20,-40 21,-16 Q14,-30 -2,-27 Q-14,-26 -21,-16 Z" fill={hc} {...line} />}
      {type === "menino" && <path d="M-21,-14 Q-24,-40 0,-39 Q24,-40 21,-14 L16,-26 L12,-20 L8,-28 L2,-22 L-4,-29 L-9,-21 L-14,-27 Z" fill={hc} {...line} />}
      {type === "vova" && <path d="M-21,-16 Q-20,-38 0,-37 Q20,-38 21,-16 Q12,-26 0,-24 Q-12,-26 -21,-16 Z" fill={hc} {...line} />}
      {type === "vovo" && (
        <g>
          <path d="M-21,-12 Q-24,-26 -14,-30 Q-16,-20 -19,-12 Z M21,-12 Q24,-26 14,-30 Q16,-20 19,-12 Z" fill={hc} {...line} strokeWidth={2} />
          <Shine x={-6} y={-30} r={4} />
        </g>
      )}
      {type === "tio" && <path d="M-21,-16 Q-22,-40 0,-39 Q22,-40 21,-16 Q10,-26 -4,-24 Q-14,-24 -21,-16 Z" fill={hc} {...line} />}
      <Face glasses={isOld} old={isOld} />
      {type === "vovo" && <path d="M-9,-6 Q-4,-11 0,-7 Q4,-11 9,-6 Q4,-3 0,-5 Q-4,-3 -9,-6 Z" fill={hc} {...line} strokeWidth={1.8} />}
      {type === "papai" && <path d="M-15,-6 Q-14,8 0,9 Q14,8 15,-6 Q8,2 0,2 Q-8,2 -15,-6 Z" fill={hc} opacity={0.85} />}
      {type === "papai" && <path d="M-4,-7 Q0,-4 4,-7" fill="none" {...line} strokeWidth={2} />}
      {type === "menina" && <circle cx={13} cy={-33} r={4.5} fill={c} {...line} strokeWidth={1.8} />}
      {type === "tio" && <SantaHat />}
      {type === "menino" && <path d="M-4,-40 q4,-8 8,0" fill="none" stroke={hc} strokeWidth={3} strokeLinecap="round" />}
      {!long && type !== "vovo" && type !== "tio" && type !== "menino" && null}
    </g>
  );
}

/* ---------------- enfeites ---------------- */

const GIFT_COLORS = [
  ["#D62839", "#FFD166"],
  ["#2D8A5B", "#F25C78"],
  ["#2F6DB5", "#FFFFFF"],
  ["#8A4FD8", "#FFD166"],
  ["#F07B3F", "#2F6DB5"],
];

function Gift({ seed = 0 }: { seed?: number }) {
  const [box, rib] = GIFT_COLORS[seed % GIFT_COLORS.length];
  return (
    <g>
      <Shadow w={32} />
      <rect x={-30} y={-6} width={60} height={50} rx={5} fill={box} {...line} />
      <rect x={-34} y={-18} width={68} height={16} rx={4} fill={box} {...line} />
      <rect x={-5} y={-18} width={10} height={62} fill={rib} {...line} strokeWidth={2} />
      <path d="M0,-18 Q-22,-40 -18,-22 Q-14,-14 0,-18 Z M0,-18 Q22,-40 18,-22 Q14,-14 0,-18 Z" fill={rib} {...line} strokeWidth={2.2} />
      <circle cx={0} cy={-19} r={4} fill={rib} {...line} strokeWidth={2} />
      <path d="M-24,4 v14" stroke="#FFF" strokeWidth={4} strokeLinecap="round" opacity={0.35} />
    </g>
  );
}

export function ItemArt({ id, seed = 0, night = false }: { id: string; seed?: number; night?: boolean }): ReactNode {
  switch (id) {
    case "arvore":
      return (
        <g>
          <Shadow w={36} />
          <rect x={-7} y={30} width={14} height={14} rx={2} fill="#7A4B2A" {...line} />
          <path d="M-24,40 h48 l-4,6 h-40 Z" fill="#D62839" {...line} strokeWidth={2} />
          <path d="M0,-30 L-34,34 Q0,40 34,34 Z" fill="#1F7A4D" {...line} />
          <path d="M0,-38 L-27,10 Q0,16 27,10 Z" fill="#2A9A61" {...line} />
          <path d="M0,-46 L-19,-14 Q0,-9 19,-14 Z" fill="#35B373" {...line} />
          <path d="M-22,22 Q0,32 24,18 M-16,-2 Q2,6 18,-6" fill="none" stroke="#FFD166" strokeWidth={2.4} strokeDasharray="1 5" strokeLinecap="round" />
          {[
            [-14, 26, "#D62839"],
            [12, 28, "#FFD166"],
            [-4, 10, "#4CC9F0"],
            [14, 4, "#F25C78"],
            [-12, -6, "#FFD166"],
            [6, -20, "#D62839"],
            [22, 26, "#8A4FD8"],
          ].map(([x, y, c], i) => (
            <g key={i}>
              {night && <circle cx={x as number} cy={y as number} r={7} fill={c as string} opacity={0.35} />}
              <circle cx={x as number} cy={y as number} r={3.6} fill={c as string} stroke={O} strokeWidth={1.4} />
            </g>
          ))}
          <path d="M0,-58 l4,8 l9,1 l-7,6 l2,9 l-8,-5 l-8,5 l2,-9 l-7,-6 l9,-1 Z" fill="#FFD166" {...line} strokeWidth={2} />
          {night && <circle cx={0} cy={-50} r={12} fill="#FFD166" opacity={0.3} />}
        </g>
      );
    case "lareira":
      return (
        <g>
          <Shadow w={44} />
          <rect x={-44} y={-30} width={88} height={74} rx={4} fill="#B4513A" {...line} />
          {[-18, -4, 10, 24, 38].map((y, r) =>
            [-44, -26, -8, 10, 28].map((x, k) => <rect key={`${r}-${k}`} x={x + (r % 2) * 9} y={y - 10} width={16} height={11} fill="none" stroke="#8E3B28" strokeWidth={1.4} />),
          )}
          <rect x={-50} y={-40} width={100} height={12} rx={3} fill="#F1E3C8" {...line} />
          <path d="M-24,44 V8 Q0,-12 24,8 V44 Z" fill="#2B140B" {...line} />
          <g className="ws-fire" style={{ transformOrigin: "0px 40px" }}>
            <path d="M-14,40 Q-18,22 -6,12 Q-6,24 0,22 Q-2,8 8,0 Q8,18 16,24 Q18,34 12,40 Z" fill="#F77F00" />
            <path d="M-8,40 Q-10,28 -2,22 Q0,30 4,28 Q4,20 9,16 Q12,30 8,40 Z" fill="#FFD166" />
          </g>
          <path d="M-18,40 h36" stroke="#6B3E1E" strokeWidth={5} strokeLinecap="round" />
          <circle cx={0} cy={26} r={30} fill="#FFB347" opacity={0.18} />
          <path d="M-34,-28 v12 l6,4 l3,-5 v-11 Z M26,-28 v12 l6,4 l3,-5 v-11 Z" fill="#D62839" {...line} strokeWidth={1.6} />
        </g>
      );
    case "meia":
      return (
        <g>
          <path d="M-8,-40 v-8" stroke={O} strokeWidth={2} />
          <path d="M-14,-34 h24 v40 q0,18 -16,22 h-14 q-12,0 -10,-12 q2,-8 10,-10 h6 Z" fill="#D62839" {...line} />
          <rect x={-17} y={-44} width={30} height={12} rx={5} fill="#FFF" {...line} />
          <path d="M-12,-14 h18 M-12,-4 h18" stroke="#FFF" strokeWidth={3} opacity={0.8} />
          <circle cx={0} cy={8} r={3} fill="#FFD166" />
        </g>
      );
    case "presente":
      return <Gift seed={seed} />;
    case "sofa":
      return (
        <g>
          <Shadow w={46} />
          <rect x={-46} y={-14} width={92} height={40} rx={12} fill="#B5172E" {...line} />
          <rect x={-40} y={6} width={80} height={24} rx={8} fill="#D62839" {...line} />
          <rect x={-52} y={0} width={16} height={34} rx={7} fill="#B5172E" {...line} />
          <rect x={36} y={0} width={16} height={34} rx={7} fill="#B5172E" {...line} />
          <rect x={-30} y={-8} width={22} height={18} rx={6} fill="#2D8A5B" {...line} transform="rotate(-8 -19 1)" />
          <rect x={10} y={-8} width={22} height={18} rx={6} fill="#FFD166" {...line} transform="rotate(8 21 1)" />
          <rect x={-46} y={34} width={6} height={10} fill="#5A3A28" />
          <rect x={40} y={34} width={6} height={10} fill="#5A3A28" />
        </g>
      );
    case "urso":
      return (
        <g>
          <Shadow w={24} />
          <circle cx={-14} cy={-30} r={8} fill="#B07A4F" {...line} />
          <circle cx={14} cy={-30} r={8} fill="#B07A4F" {...line} />
          <ellipse cx={0} cy={22} rx={20} ry={22} fill="#B07A4F" {...line} />
          <ellipse cx={0} cy={26} rx={11} ry={12} fill="#E9C9A3" />
          <circle cx={-18} cy={40} r={8} fill="#B07A4F" {...line} />
          <circle cx={18} cy={40} r={8} fill="#B07A4F" {...line} />
          <circle cx={0} cy={-16} r={18} fill="#B07A4F" {...line} />
          <ellipse cx={0} cy={-10} rx={8} ry={6} fill="#E9C9A3" />
          <circle cx={-6} cy={-19} r={2.4} fill={O} />
          <circle cx={6} cy={-19} r={2.4} fill={O} />
          <ellipse cx={0} cy={-12} rx={3} ry={2.2} fill={O} />
          <path d="M-12,2 l-8,-6 v12 Z M12,2 l8,-6 v12 Z" fill="#D62839" {...line} strokeWidth={1.6} />
        </g>
      );
    case "vela":
      return (
        <g>
          <Shadow w={20} />
          {night && <circle cx={0} cy={-30} r={20} fill="#FFD166" opacity={0.3} />}
          <ellipse cx={0} cy={40} rx={20} ry={6} fill="#2D8A5B" {...line} />
          <rect x={-10} y={-18} width={20} height={58} rx={4} fill="#F7F1E3" {...line} />
          <path d="M-10,-12 q5,8 10,0 q5,8 10,0" fill="#F7F1E3" stroke={O} strokeWidth={1.4} />
          <path d="M0,-38 Q-8,-28 0,-20 Q8,-28 0,-38 Z" fill="#FFB703" {...line} strokeWidth={1.8} />
          <path d="M0,-32 Q-3,-27 0,-23 Q3,-27 0,-32 Z" fill="#FFF3B0" />
          <path d="M-14,40 l-8,-8 M14,40 l8,-8" stroke="#D62839" strokeWidth={4} strokeLinecap="round" />
        </g>
      );
    case "sino":
      return (
        <g>
          <path d="M0,-40 v-6" stroke={O} strokeWidth={2} />
          <path d="M-24,22 Q-24,-34 0,-34 Q24,-34 24,22 L30,30 H-30 Z" fill="#F2B632" {...line} />
          <circle cx={0} cy={34} r={6} fill="#E09A1C" {...line} />
          <path d="M-12,-22 Q-16,0 -14,18" stroke="#FFF" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.6} />
          <path d="M0,-34 Q-20,-52 -18,-36 Q-14,-28 0,-34 Z M0,-34 Q20,-52 18,-36 Q14,-28 0,-34 Z" fill="#D62839" {...line} strokeWidth={2} />
        </g>
      );
    case "estrela":
      return (
        <g>
          {night && <circle r={34} fill="#FFD166" opacity={0.3} />}
          <path d="M0,-40 l11,23 l25,3 l-19,17 l5,25 l-22,-12 l-22,12 l5,-25 l-19,-17 l25,-3 Z" fill="#FFD166" {...line} />
          <circle cx={-6} cy={-2} r={2.2} fill={O} />
          <circle cx={6} cy={-2} r={2.2} fill={O} />
          <path d="M-4,5 q4,4 8,0" fill="none" {...line} strokeWidth={1.8} />
          <Shine x={-10} y={-14} r={3} />
        </g>
      );
    case "laco":
      return (
        <g>
          <path d="M0,0 Q-40,-30 -36,4 Q-30,22 0,0 Z M0,0 Q40,-30 36,4 Q30,22 0,0 Z" fill="#D62839" {...line} />
          <path d="M-4,4 L-14,40 L-4,34 L0,42 Z M4,4 L14,40 L4,34 L0,42 Z" fill="#B5172E" {...line} strokeWidth={2} />
          <circle cx={0} cy={0} r={7} fill="#B5172E" {...line} />
          <path d="M-26,-8 q6,-4 12,2" stroke="#FFF" strokeWidth={3} fill="none" opacity={0.6} strokeLinecap="round" />
        </g>
      );
    case "peru":
      return (
        <g>
          <Shadow w={42} />
          <ellipse cx={0} cy={30} rx={46} ry={13} fill="#F7F1E3" {...line} />
          <ellipse cx={0} cy={28} rx={36} ry={8} fill="#E9E1CF" />
          <path d="M-30,24 Q-34,-10 0,-12 Q34,-10 30,24 Z" fill="#C66B2C" {...line} />
          <path d="M-18,-4 Q-8,-10 4,-6" stroke="#FFF" strokeWidth={4} fill="none" opacity={0.4} strokeLinecap="round" />
          <path d="M26,6 l14,-12" stroke={O} strokeWidth={9} strokeLinecap="round" />
          <path d="M26,6 l14,-12" stroke="#C66B2C" strokeWidth={5} strokeLinecap="round" />
          <circle cx={42} cy={-8} r={5} fill="#FFF" {...line} strokeWidth={1.8} />
          <circle cx={-32} cy={26} r={5} fill="#2D8A5B" />
          <circle cx={-24} cy={30} r={4} fill="#D62839" />
          <circle cx={28} cy={30} r={4} fill="#F07B3F" />
        </g>
      );
    case "biscoitos":
      return (
        <g>
          <Shadow w={38} />
          <ellipse cx={0} cy={34} rx={40} ry={11} fill="#7FB7E8" {...line} />
          <circle cx={-18} cy={22} r={13} fill="#D8A15F" {...line} />
          <circle cx={14} cy={24} r={13} fill="#D8A15F" {...line} />
          {[
            [-22, 18],
            [-14, 26],
            [10, 20],
            [18, 28],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={2} fill="#5A3A28" />
          ))}
          <g transform="translate(0,-6)">
            <circle cx={0} cy={-14} r={9} fill="#B8743A" {...line} />
            <path d="M-6,-6 h12 l10,6 l-3,5 l-8,-3 l4,16 l-5,3 l-6,-10 l-6,10 l-5,-3 l4,-16 l-8,3 l-3,-5 Z" fill="#B8743A" {...line} strokeWidth={2} />
            <circle cx={-3} cy={-15} r={1.4} fill={O} />
            <circle cx={3} cy={-15} r={1.4} fill={O} />
            <path d="M-3,-11 q3,2 6,0" stroke="#FFF" strokeWidth={1.4} fill="none" />
            <circle cx={0} cy={1} r={1.6} fill="#D62839" />
            <circle cx={0} cy={7} r={1.6} fill="#2D8A5B" />
          </g>
        </g>
      );
    case "leite":
      return (
        <g>
          <Shadow w={26} />
          <path d="M-14,-30 L14,-30 L11,40 Q0,44 -11,40 Z" fill="#E8F4FF" {...line} />
          <path d="M-13,-16 L13,-16 L11,38 Q0,42 -11,38 Z" fill="#FFF" />
          <path d="M-9,-10 v38" stroke="#C8E3FA" strokeWidth={3} strokeLinecap="round" />
          <circle cx={26} cy={34} r={11} fill="#D8A15F" {...line} />
          <circle cx={23} cy={31} r={1.8} fill="#5A3A28" />
          <circle cx={29} cy={37} r={1.8} fill="#5A3A28" />
        </g>
      );
    case "bolo":
      return (
        <g>
          <Shadow w={38} />
          <ellipse cx={0} cy={40} rx={40} ry={7} fill="#F7F1E3" {...line} />
          <rect x={-32} y={8} width={64} height={30} rx={6} fill="#8B4A2B" {...line} />
          <path d="M-32,14 q8,8 16,0 q8,8 16,0 q8,8 16,0 q8,8 16,0 V8 h-64 Z" fill="#FFF" stroke={O} strokeWidth={1.8} />
          <rect x={-20} y={-18} width={40} height={28} rx={5} fill="#F25C78" {...line} />
          <path d="M-20,-12 q5,6 10,0 q5,6 10,0 q5,6 10,0 q5,6 10,0 V-18 h-40 Z" fill="#FFF" stroke={O} strokeWidth={1.6} />
          <circle cx={-8} cy={-22} r={4} fill="#D62839" {...line} strokeWidth={1.4} />
          <circle cx={8} cy={-22} r={4} fill="#D62839" {...line} strokeWidth={1.4} />
          <path d="M-6,-26 q2,-6 6,-6 M10,-26 q2,-6 6,-6" stroke="#2D8A5B" strokeWidth={2} fill="none" />
        </g>
      );
    case "chocolate":
      return (
        <g>
          <Shadow w={26} />
          <path d="M-8,-26 q-6,-8 0,-14 M4,-26 q-6,-8 0,-14" stroke="#FFF" strokeWidth={3} fill="none" opacity={0.8} strokeLinecap="round" />
          <path d="M20,-6 q16,0 14,16 q-2,12 -16,10" fill="none" {...line} strokeWidth={7} />
          <path d="M20,-6 q16,0 14,16 q-2,12 -16,10" fill="none" stroke="#D62839" strokeWidth={3.5} />
          <path d="M-22,-16 h44 l-4,54 q-18,6 -36,0 Z" fill="#D62839" {...line} />
          <ellipse cx={0} cy={-16} rx={22} ry={6} fill="#6B3A1E" {...line} />
          <rect x={-10} y={-24} width={9} height={9} rx={2} fill="#FFF" {...line} strokeWidth={1.4} />
          <rect x={2} y={-22} width={9} height={9} rx={2} fill="#FFF" {...line} strokeWidth={1.4} transform="rotate(14 6 -18)" />
          <path d="M-14,4 h28 M-13,14 h26" stroke="#FFF" strokeWidth={3} opacity={0.85} />
        </g>
      );
    case "panetone":
      return (
        <g>
          <Shadow w={30} />
          <path d="M-28,8 Q-30,-30 0,-32 Q30,-30 28,8 Z" fill="#B8743A" {...line} />
          <path d="M-14,-24 q6,-6 12,-2" stroke="#FFF" strokeWidth={3} fill="none" opacity={0.4} />
          <rect x={-30} y={4} width={60} height={38} rx={3} fill="#F2B632" {...line} />
          <path d="M-30,16 h60 M-30,30 h60" stroke="#D62839" strokeWidth={4} />
          {[
            [-12, -10],
            [8, -16],
            [14, -4],
            [-4, -20],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={2.4} fill={i % 2 ? "#D62839" : "#5A3A28"} />
          ))}
        </g>
      );
    case "doce":
      return (
        <g>
          <path d="M6,44 V-18 Q6,-40 -12,-40 Q-30,-40 -30,-22" fill="none" stroke={O} strokeWidth={15} strokeLinecap="round" />
          <path d="M6,44 V-18 Q6,-40 -12,-40 Q-30,-40 -30,-22" fill="none" stroke="#FFF" strokeWidth={10} strokeLinecap="round" />
          <path d="M6,44 V-18 Q6,-40 -12,-40 Q-30,-40 -30,-22" fill="none" stroke="#D62839" strokeWidth={10} strokeDasharray="7 7" />
          <path d="M-4,-20 l-6,-10 M-4,-20 l6,-10" stroke="#2D8A5B" strokeWidth={4} strokeLinecap="round" />
        </g>
      );
    case "cama":
      return (
        <g>
          <Shadow w={48} />
          <rect x={-50} y={-22} width={12} height={68} rx={4} fill="#9C6B43" {...line} />
          <rect x={38} y={-2} width={12} height={48} rx={4} fill="#9C6B43" {...line} />
          <rect x={-44} y={8} width={88} height={22} rx={6} fill="#F7F1E3" {...line} />
          <rect x={-38} y={-2} width={26} height={14} rx={7} fill="#FFF" {...line} />
          <path d="M-14,4 h58 v26 h-58 Z" fill="#2F6DB5" {...line} />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M${-10 + i * 14},10 l4,6 l-4,6 l-4,-6 Z`} fill="#FFD166" />
          ))}
          <rect x={-44} y={30} width={88} height={8} fill="#9C6B43" {...line} strokeWidth={2} />
        </g>
      );
    case "livro":
      return (
        <g>
          <Shadow w={34} />
          <path d="M0,-18 Q-20,-28 -38,-20 V30 Q-20,22 0,32 Z" fill="#FFF" {...line} />
          <path d="M0,-18 Q20,-28 38,-20 V30 Q20,22 0,32 Z" fill="#FFF" {...line} />
          <path d="M-38,30 Q-20,24 0,34 Q20,24 38,30 V36 Q20,30 0,40 Q-20,30 -38,36 Z" fill="#2F6DB5" {...line} />
          <path d="M-30,-10 h22 M-30,0 h22 M-30,10 h16" stroke="#9AA6B8" strokeWidth={2.4} strokeLinecap="round" />
          <path d="M18,-4 l4,8 l8,1 l-6,5 l2,8 l-8,-4 l-8,4 l2,-8 l-6,-5 l8,-1 Z" fill="#FFD166" stroke={O} strokeWidth={1.4} />
        </g>
      );
    case "carrinho":
      return (
        <g>
          <Shadow w={40} />
          <path d="M-42,26 V8 Q-40,0 -30,0 L-18,-16 Q-14,-20 -6,-20 H14 Q22,-20 26,-14 L34,0 Q44,2 44,12 V26 Z" fill="#D62839" {...line} />
          <path d="M-14,-14 h10 v12 h-20 Z M2,-14 h12 l8,12 h-20 Z" fill="#BDE3FF" {...line} strokeWidth={2} />
          <circle cx={-24} cy={30} r={11} fill="#3A3A48" {...line} />
          <circle cx={26} cy={30} r={11} fill="#3A3A48" {...line} />
          <circle cx={-24} cy={30} r={4} fill="#D9D9E3" />
          <circle cx={26} cy={30} r={4} fill="#D9D9E3" />
          <circle cx={40} cy={10} r={3} fill="#FFD166" />
          <path d="M-36,12 h20" stroke="#FFF" strokeWidth={3} opacity={0.5} strokeLinecap="round" />
        </g>
      );
    case "boneca":
      return <Person type="menina" tone={1} outfit={5} />;
    case "bola":
      return (
        <g>
          <Shadow w={24} />
          <circle cx={0} cy={14} r={30} fill="#FFF" {...line} />
          <path d="M0,4 l9,6 l-3,11 h-12 l-3,-11 Z" fill={O} />
          <path d="M0,4 V-14 M9,10 l17,-6 M6,21 l10,14 M-6,21 l-10,14 M-9,10 l-17,-6" stroke={O} strokeWidth={2} />
          <path d="M-6,-16 l6,-4 l6,4 Z" fill={O} />
          <Shine x={-14} y={0} r={4} />
        </g>
      );
    case "quadro":
      return (
        <g>
          <rect x={-34} y={-30} width={68} height={56} rx={4} fill="#C99A4B" {...line} />
          <rect x={-26} y={-22} width={52} height={40} fill="#BDE3FF" stroke={O} strokeWidth={2} />
          <path d="M-26,18 Q-8,6 8,12 Q18,6 26,10 V18 Z" fill="#FFF" />
          <path d="M8,10 L0,-12 L-8,10 Z" fill="#2A9A61" stroke={O} strokeWidth={1.4} />
          <circle cx={16} cy={-12} r={5} fill="#FFD166" />
          <path d="M0,-30 L-10,-42 M0,-30 L10,-42" stroke={O} strokeWidth={1.6} />
        </g>
      );
    case "boneco":
      return (
        <g>
          <Shadow w={30} />
          <circle cx={0} cy={22} r={24} fill="#FFF" {...line} />
          <circle cx={0} cy={-14} r={18} fill="#FFF" {...line} />
          <path d="M-14,30 q14,8 28,0" stroke="#DCEBF7" strokeWidth={6} fill="none" strokeLinecap="round" />
          <rect x={-14} y={-48} width={28} height={20} rx={3} fill="#2B2B38" {...line} />
          <rect x={-20} y={-32} width={40} height={6} rx={3} fill="#2B2B38" {...line} />
          <rect x={-14} y={-36} width={28} height={4} fill="#D62839" />
          <circle cx={-6} cy={-16} r={2.4} fill={O} />
          <circle cx={6} cy={-16} r={2.4} fill={O} />
          <path d="M0,-10 l14,4 l-14,2 Z" fill="#F07B3F" {...line} strokeWidth={1.6} />
          <path d="M-18,2 Q0,10 18,2 L16,8 Q0,16 -16,8 Z" fill="#D62839" {...line} strokeWidth={2} />
          <path d="M10,8 l4,18 l6,-2 l-2,-16" fill="#D62839" {...line} strokeWidth={2} />
          <circle cx={0} cy={16} r={2.4} fill={O} />
          <circle cx={0} cy={26} r={2.4} fill={O} />
          <path d="M-22,10 l-18,-14 M-34,-4 l-6,-4 M22,10 l18,-14 M34,-4 l4,-6" stroke="#7A4B2A" strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    case "rena":
      return (
        <g>
          <Shadow w={34} />
          <path d="M14,-28 l-2,-12 l-6,-4 M12,-36 l6,-8 M22,-28 l4,-12 l6,-4 M25,-36 l-2,-8" stroke="#7A4B2A" strokeWidth={4} strokeLinecap="round" fill="none" />
          <ellipse cx={-6} cy={14} rx={30} ry={17} fill="#A8693A" {...line} />
          <ellipse cx={-6} cy={20} rx={18} ry={8} fill="#E9C9A3" />
          {[-28, -16, 2, 14].map((x) => (
            <rect key={x} x={x} y={24} width={8} height={20} rx={3} fill="#A8693A" {...line} />
          ))}
          <path d="M-36,6 q-8,-4 -6,6" stroke={O} strokeWidth={2} fill="#E9C9A3" />
          <path d="M8,4 Q10,-14 18,-20" stroke={O} strokeWidth={13} strokeLinecap="round" fill="none" />
          <path d="M8,4 Q10,-14 18,-20" stroke="#A8693A" strokeWidth={8.5} strokeLinecap="round" fill="none" />
          <ellipse cx={22} cy={-20} rx={14} ry={11} fill="#A8693A" {...line} />
          <ellipse cx={10} cy={-26} rx={6} ry={3} fill="#A8693A" {...line} transform="rotate(-30 10 -26)" />
          <circle cx={36} cy={-17} r={5.5} fill="#E63946" {...line} strokeWidth={1.8} />
          {night && <circle cx={36} cy={-17} r={10} fill="#E63946" opacity={0.35} />}
          <circle cx={22} cy={-23} r={2.2} fill={O} />
          <path d="M4,0 Q14,6 22,0" stroke="#D62839" strokeWidth={4} fill="none" strokeLinecap="round" />
          <circle cx={13} cy={6} r={3} fill="#FFD166" {...line} strokeWidth={1.4} />
        </g>
      );
    case "treno":
      return (
        <g>
          <Shadow w={44} />
          <path d="M-44,36 H38 Q50,36 48,24" fill="none" stroke="#C99A4B" strokeWidth={5} strokeLinecap="round" />
          <path d="M-30,36 v-10 M20,36 v-10" stroke="#C99A4B" strokeWidth={4} />
          <path d="M-40,26 V-6 Q-40,-14 -30,-14 L-8,-2 H30 Q40,-2 40,8 V26 Z" fill="#D62839" {...line} />
          <path d="M-36,8 h70" stroke="#FFD166" strokeWidth={3} strokeDasharray="2 5" strokeLinecap="round" />
          <g transform="translate(14,-14) scale(0.5)">
            <Gift seed={2} />
          </g>
          <g transform="translate(-14,-22) scale(0.45)">
            <Gift seed={3} />
          </g>
        </g>
      );
    case "pinheiro":
      return (
        <g>
          <Shadow w={30} />
          <rect x={-6} y={32} width={12} height={12} fill="#7A4B2A" {...line} />
          <path d="M0,-50 L-34,34 H34 Z" fill="#1F6E46" {...line} />
          <path d="M0,-50 L-14,-14 Q-6,-20 0,-12 Q6,-20 14,-14 Z M-22,4 Q-10,-2 0,6 Q10,-2 22,4 L16,-10 Q8,-4 0,-10 Q-8,-4 -16,-10 Z M-30,26 Q-14,18 0,26 Q14,18 30,26 L24,12 Q12,18 0,12 Q-12,18 -24,12 Z" fill="#FFF" />
        </g>
      );
    case "pomba":
      return (
        <g>
          <ellipse cx={0} cy={6} rx={24} ry={14} fill="#FFF" {...line} />
          <circle cx={20} cy={-4} r={10} fill="#FFF" {...line} />
          <path d="M28,-4 l9,2 l-9,3 Z" fill="#F2B632" {...line} strokeWidth={1.6} />
          <circle cx={22} cy={-6} r={1.8} fill={O} />
          <path d="M-6,0 Q-14,-34 -36,-28 Q-24,-10 -6,4 Z" fill="#EAF4FF" {...line} />
          <path d="M-22,10 l-16,10 l4,-12 Z" fill="#FFF" {...line} strokeWidth={2} />
          <path d="M34,4 q6,4 2,10 M30,6 q-2,8 4,10" stroke="#2D8A5B" strokeWidth={2.4} fill="none" />
        </g>
      );
    case "anjo":
      return (
        <g>
          <Shadow w={20} />
          <ellipse cx={0} cy={-46} rx={14} ry={4} fill="none" stroke="#FFD166" strokeWidth={3.5} />
          <path d="M-10,-4 Q-44,-30 -40,6 Q-28,14 -10,6 Z M10,-4 Q44,-30 40,6 Q28,14 10,6 Z" fill="#EAF4FF" {...line} />
          <path d="M-18,44 L-12,0 Q0,-6 12,0 L18,44 Z" fill="#FFF" {...line} />
          <path d="M-16,36 h32" stroke="#FFD166" strokeWidth={3} />
          <circle cx={0} cy={-20} r={15} fill="#FFE0C7" {...line} />
          <path d="M-15,-22 Q-14,-38 0,-37 Q14,-38 15,-22 Q8,-30 0,-28 Q-8,-30 -15,-22 Z" fill="#F2C14E" {...line} strokeWidth={2} />
          <circle cx={-5} cy={-19} r={1.8} fill={O} />
          <circle cx={5} cy={-19} r={1.8} fill={O} />
          <path d="M-3,-13 q3,3 6,0" stroke={O} strokeWidth={1.6} fill="none" />
          <ellipse cx={-9} cy={-14} rx={3} ry={2} fill="#FF7B8A" opacity={0.5} />
          <ellipse cx={9} cy={-14} rx={3} ry={2} fill="#FF7B8A" opacity={0.5} />
        </g>
      );
    case "trem":
      return (
        <g>
          <Shadow w={46} />
          <rect x={-46} y={-4} width={30} height={30} rx={4} fill="#2D8A5B" {...line} />
          <path d="M-14,26 V-22 H10 V-6 H34 Q44,-6 44,6 V26 Z" fill="#D62839" {...line} />
          <rect x={-10} y={-18} width={16} height={12} rx={2} fill="#BDE3FF" {...line} strokeWidth={1.8} />
          <rect x={22} y={-24} width={10} height={18} fill="#2B2B38" {...line} strokeWidth={2} />
          <circle cx={27} cy={-34} r={6} fill="#FFF" opacity={0.85} />
          <circle cx={36} cy={-44} r={4} fill="#FFF" opacity={0.6} />
          {[-38, -24, -2, 16, 34].map((x) => (
            <circle key={x} cx={x} cy={30} r={8} fill="#3A3A48" {...line} />
          ))}
          <path d="M-16,12 h-2" stroke={O} strokeWidth={3} />
          <circle cx={44} cy={10} r={3} fill="#FFD166" />
        </g>
      );
    case "carrossel":
      return (
        <g>
          <Shadow w={44} />
          <path d="M-44,-10 L0,-44 L44,-10 Z" fill="#F25C78" {...line} />
          <path d="M-44,-10 q11,10 22,0 q11,10 22,0 q11,10 22,0 q11,10 22,0" fill="#FFF" stroke={O} strokeWidth={2} />
          <circle cx={0} cy={-46} r={4} fill="#FFD166" {...line} strokeWidth={1.6} />
          <path d="M-30,-4 V30 M0,-4 V30 M30,-4 V30" stroke="#F2B632" strokeWidth={4} />
          <ellipse cx={0} cy={36} rx={46} ry={9} fill="#8A4FD8" {...line} />
          {[-30, 30].map((x, i) => (
            <g key={x} transform={`translate(${x},${i ? 10 : 14})`}>
              <ellipse cx={0} cy={0} rx={12} ry={7} fill="#FFF" {...line} strokeWidth={2} />
              <circle cx={10} cy={-6} r={5} fill="#FFF" {...line} strokeWidth={2} />
            </g>
          ))}
        </g>
      );
    case "unicornio":
      return (
        <g>
          <Shadow w={30} />
          <ellipse cx={-6} cy={16} rx={26} ry={16} fill="#FFF" {...line} />
          {[-24, -12, 4, 14].map((x) => (
            <rect key={x} x={x} y={24} width={8} height={20} rx={3} fill="#FFF" {...line} />
          ))}
          <path d="M-30,10 q-14,0 -12,16 q6,-4 8,-8" fill="#B794F4" {...line} strokeWidth={2} />
          <path d="M8,8 Q8,-14 18,-20" stroke={O} strokeWidth={14} strokeLinecap="round" fill="none" />
          <path d="M8,8 Q8,-14 18,-20" stroke="#FFF" strokeWidth={9.5} strokeLinecap="round" fill="none" />
          <ellipse cx={22} cy={-20} rx={14} ry={11} fill="#FFF" {...line} />
          <path d="M18,-30 L26,-52 L28,-28 Z" fill="#FFD166" {...line} strokeWidth={2} />
          <path d="M8,-28 Q0,-14 6,4 Q-2,-8 -4,-18 Q2,-26 8,-28 Z" fill="#F25C78" {...line} strokeWidth={2} />
          <circle cx={24} cy={-22} r={2.2} fill={O} />
          <ellipse cx={30} cy={-16} rx={3} ry={2} fill="#FF7B8A" opacity={0.6} />
        </g>
      );
    case "fogos":
      return (
        <g>
          {[
            ["#FFD166", 0, -10, 28],
            ["#F25C78", -26, 6, 18],
            ["#4CC9F0", 24, 12, 20],
          ].map(([c, x, y, r], i) => (
            <g key={i} transform={`translate(${x},${y})`}>
              {Array.from({ length: 12 }, (_, k) => {
                const a = (k / 12) * Math.PI * 2;
                const R = r as number;
                return <line key={k} x1={Math.cos(a) * R * 0.3} y1={Math.sin(a) * R * 0.3} x2={Math.cos(a) * R} y2={Math.sin(a) * R} stroke={c as string} strokeWidth={3} strokeLinecap="round" />;
              })}
              <circle r={3.5} fill="#FFF" />
            </g>
          ))}
        </g>
      );
    case "presepio":
      return (
        <g>
          <Shadow w={44} />
          <path d="M0,-50 l4,10 l11,1 l-8,7 l3,11 l-10,-6 l-10,6 l3,-11 l-8,-7 l11,-1 Z" fill="#FFD166" {...line} strokeWidth={2} />
          {night && <circle cx={0} cy={-40} r={18} fill="#FFD166" opacity={0.35} />}
          <path d="M-44,-4 L0,-28 L44,-4" fill="none" stroke="#7A4B2A" strokeWidth={8} strokeLinecap="round" />
          <path d="M-36,-2 V44 M36,-2 V44" stroke="#7A4B2A" strokeWidth={6} />
          <path d="M-18,30 L-12,44 M18,30 L12,44" stroke="#9C6B43" strokeWidth={4} />
          <path d="M-20,20 Q0,36 20,20 L18,30 Q0,40 -18,30 Z" fill="#C99A4B" {...line} strokeWidth={2} />
          <path d="M-16,22 q16,8 32,0" stroke="#F2C14E" strokeWidth={4} />
          <ellipse cx={0} cy={18} rx={9} ry={6} fill="#FFF" {...line} strokeWidth={1.8} />
          <circle cx={0} cy={11} r={5} fill="#F7C9A1" {...line} strokeWidth={1.6} />
          <ellipse cx={0} cy={4} rx={10} ry={3} fill="none" stroke="#FFD166" strokeWidth={2} />
        </g>
      );
    case "tapete":
      return (
        <g>
          <ellipse cx={0} cy={30} rx={50} ry={14} fill="#D62839" {...line} />
          <ellipse cx={0} cy={30} rx={38} ry={9} fill="none" stroke="#FFD166" strokeWidth={3} strokeDasharray="4 4" />
          <ellipse cx={0} cy={30} rx={22} ry={5} fill="#2D8A5B" />
        </g>
      );
    case "luminaria":
      return (
        <g>
          <Shadow w={18} />
          {night && <ellipse cx={0} cy={-6} rx={36} ry={30} fill="#FFD166" opacity={0.25} />}
          <path d="M-20,-14 L-12,-42 H12 L20,-14 Z" fill="#F2B632" {...line} />
          <path d="M0,-14 V40" stroke={O} strokeWidth={4} />
          <ellipse cx={0} cy={42} rx={14} ry={4} fill="#7A4B2A" {...line} strokeWidth={2} />
        </g>
      );
    default:
      return <Gift seed={seed} />;
  }
}

/** Miniatura para os botões do painel */
export function Thumb({ children, size = 44 }: { children: ReactNode; size?: number }) {
  return (
    <svg viewBox="-56 -62 112 114" width={size} height={size} aria-hidden="true">
      {children}
    </svg>
  );
}
