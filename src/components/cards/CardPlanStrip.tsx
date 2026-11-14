import { Crown, Gift, Users } from "lucide-react";
import { priceLabel } from "../../lib/pricing";

/** As 9 artes de exemplo do Cartão de Natal (public/cartoes). */
export const CARD_ART = ["dourado", "fotografico", "guirlanda", "estrelado", "papainoel", "rustico", "vila", "presentes", "neve"] as const;
export const cardArt = (id: string) => `/cartoes/${id}.webp`;

const PLANS = [
  { id: "free", name: "Grátis", price: "R$ 0", count: "1 cartão", art: CARD_ART.slice(0, 1), icon: Gift, note: "com marca discreta do site" },
  { id: "natal", name: "Carta Completa", get price() { return priceLabel("natal"); }, count: "até 5 cartões", art: CARD_ART.slice(0, 5), icon: Crown, note: "sem marca d'água · PDF, imagem e vídeo" },
  { id: "familia", name: "Pacote Família", get price() { return priceLabel("familia"); }, count: "cartões à vontade", art: CARD_ART, icon: Users, note: "todos os 9 modelos, quantos quiser" },
] as const;

/** Miniaturas em leque: mostra quantos cartões cada plano libera. */
export function CardFan({ art, max = 5, className = "" }: { art: readonly string[]; max?: number; className?: string }) {
  const shown = art.slice(0, max);
  const extra = art.length - shown.length;
  const mid = (shown.length - 1) / 2;
  return (
    <div className={`relative h-24 sm:h-28 flex items-end justify-center ${className}`} aria-hidden="true">
      {shown.map((a, i) => (
        <img
          key={a}
          src={cardArt(a)}
          alt=""
          loading="lazy"
          className="absolute bottom-0 w-[40%] max-w-[120px] rounded-md border-2 border-white shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
          style={{ transform: `translateX(${(i - mid) * 28}%) rotate(${(i - mid) * 7}deg)`, transformOrigin: "50% 120%", zIndex: 10 - Math.abs(Math.round(i - mid)) }}
        />
      ))}
      {extra > 0 && (
        <span className="absolute -bottom-2 right-1 z-20 rounded-full bg-[#FFD166] text-[#0B132B] text-[11px] font-extrabold px-2 py-0.5 shadow">+{extra} modelos</span>
      )}
    </div>
  );
}

/** Quadro "Cartão de Natal em cada plano" (página inicial e seção do cartão). */
export default function CardPlanStrip({ onPick }: { onPick?: (plan: "free" | "natal" | "familia") => void }) {
  return (
    <div className="grid sm:grid-cols-3 gap-3 sm:gap-4" id="cartao-planos">
      {PLANS.map((p) => {
        const I = p.icon;
        const hi = p.id === "natal";
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onPick?.(p.id)}
            className={`text-left rounded-2xl p-4 pt-5 border transition-all hover:-translate-y-0.5 cursor-pointer ${hi ? "border-[#FFD166] bg-gradient-to-b from-[#FFD166]/15 to-[#0B132B]" : "border-white/15 bg-[#0B132B]/70 hover:border-[#FFD166]/60"}`}
            id={`cartao-plano-${p.id}`}
          >
            <CardFan art={p.art} />
            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-cinzel font-bold text-white">
                <I className="w-4 h-4 text-[#FFD166]" /> {p.name}
              </span>
              <span className={`text-sm font-extrabold ${p.id === "free" ? "text-white" : "text-[#FFD166]"}`}>{p.price}</span>
            </div>
            <p className="mt-1 text-lg font-extrabold text-white leading-tight">{p.count}</p>
            <p className="text-xs text-white/60">{p.note}</p>
          </button>
        );
      })}
    </div>
  );
}
