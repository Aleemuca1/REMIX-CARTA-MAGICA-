/**
 * Ícones do site (no lugar dos emojis): um único estilo em tudo.
 * IconBadge = ícone dentro de um selo redondo/arredondado; SantaHat = marca da Carta Mágica (gorro desenhado).
 */
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

type Tone = "gold" | "red" | "green" | "glass" | "navy";
const TONES: Record<Tone, { bg: string; fg: string; ring: string }> = {
  gold: { bg: "linear-gradient(145deg,#FFE9A8 0%,#FFD166 45%,#E09F2E 100%)", fg: "#4A2A00", ring: "rgba(255,209,102,0.55)" },
  red: { bg: "linear-gradient(145deg,#FF5468 0%,#D90429 55%,#8E0A18 100%)", fg: "#FFFFFF", ring: "rgba(255,209,102,0.5)" },
  green: { bg: "linear-gradient(145deg,#6EE7A0 0%,#2DC653 50%,#167A35 100%)", fg: "#06240F", ring: "rgba(255,255,255,0.35)" },
  glass: { bg: "linear-gradient(145deg,rgba(255,255,255,0.16),rgba(255,255,255,0.05))", fg: "#FFD166", ring: "rgba(255,209,102,0.35)" },
  navy: { bg: "linear-gradient(145deg,#2A3A6E 0%,#1C2541 60%,#0B132B 100%)", fg: "#FFD166", ring: "rgba(255,209,102,0.45)" },
};
const SIZES = { xs: [22, 12], sm: [30, 16], md: [40, 20], lg: [52, 26], xl: [68, 34] } as const;

export function IconBadge({
  icon: I,
  tone = "gold",
  size = "md",
  round = false,
  className = "",
  style,
}: {
  icon: LucideIcon;
  tone?: Tone;
  size?: keyof typeof SIZES;
  round?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const [box, ic] = SIZES[size];
  const t = TONES[tone];
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center ${round ? "rounded-full" : "rounded-[30%]"} ${className}`}
      style={{ width: box, height: box, background: t.bg, color: t.fg, boxShadow: `0 0 0 1px ${t.ring} inset, 0 6px 16px -6px rgba(0,0,0,0.6)`, ...style }}
    >
      <I width={ic} height={ic} strokeWidth={2.2} />
    </span>
  );
}

/** Ícone pequeno em linha, dourado (para listas e rótulos). */
export function Ico({ icon: I, className = "w-4 h-4 text-[#FFD166]" }: { icon: LucideIcon; className?: string }) {
  return <I aria-hidden="true" className={`inline-block shrink-0 ${className}`} strokeWidth={2.2} />;
}

/** Marca da Carta Mágica: gorro do Papai Noel desenhado (vetor). */
export function SantaHat({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="cmHatRed" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF4D63" />
          <stop offset="0.6" stopColor="#D90429" />
          <stop offset="1" stopColor="#8E0A18" />
        </linearGradient>
      </defs>
      <path d="M12 44 C14 26 26 12 42 12 C50 12 55 18 56 26 C52 22 48 22 46 26 C44 32 46 38 50 44 Z" fill="url(#cmHatRed)" />
      <path d="M44 14 C48 13 52 15 54 19" stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="8" y="42" width="46" height="12" rx="6" fill="#FFFFFF" />
      <rect x="8" y="42" width="46" height="5" rx="2.5" fill="#F1F4FA" />
      <circle cx="54" cy="27" r="7" fill="#FFFFFF" />
      <circle cx="52" cy="25" r="2.4" fill="#F1F4FA" />
    </svg>
  );
}
