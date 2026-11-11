import { useEffect, useState } from "react";
import { PROMO, promoActive, promoEndsLabel } from "../lib/promo";
import { priceLabel } from "../lib/pricing";

/** Faixa fina no topo com a promoção (some sozinha quando a promoção acaba). */
export default function PromoBar({ onClick }: { onClick: () => void }) {
  const [left, setLeft] = useState(() => Date.parse(PROMO.until) - Date.now());
  useEffect(() => {
    const t = setInterval(() => setLeft(Date.parse(PROMO.until) - Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!promoActive()) return null;
  const d = Math.floor(left / 864e5);
  const h = Math.floor((left % 864e5) / 36e5);
  const m = Math.floor((left % 36e5) / 6e4);
  return (
    <button
      onClick={onClick}
      className="w-full bg-gradient-to-r from-[#0B0B0F] via-[#2B0B10] to-[#0B0B0F] text-white text-[12px] sm:text-sm font-bold py-2 px-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 cursor-pointer border-b border-[#FFD166]/40"
      id="promo-bar"
    >
      <span className="bg-[#FFD166] text-[#0B132B] rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-widest">🖤 {PROMO.name}</span>
      <span>
        Carta Completa <s className="opacity-70">{PROMO.from.natal}</s> por <b className="text-[#FFD166]">{priceLabel("natal")}</b> · Família <s className="opacity-70">{PROMO.from.familia}</s> por <b className="text-[#FFD166]">{priceLabel("familia")}</b>
      </span>
      <span className="opacity-85">
        até {promoEndsLabel()} · termina em {d > 0 ? `${d}d ` : ""}{String(h).padStart(2, "0")}h{String(m).padStart(2, "0")}
      </span>
    </button>
  );
}
