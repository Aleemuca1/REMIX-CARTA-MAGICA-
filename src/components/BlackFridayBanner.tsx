import { useEffect, useState } from "react";
import { Mail, Sparkles } from "lucide-react";
import Reveal from "./Reveal";
import { PROMO, promoActive, promoEndsLabel } from "../lib/promo";
import { AVULSA, NORMAL, brl, priceLabel } from "../lib/pricing";

/** Banner grande da Black Friday (só em novembro; some sozinho em 01/12). */
export default function BlackFridayBanner({ onPlans, onCorreio }: { onPlans: () => void; onCorreio: () => void }) {
  const [left, setLeft] = useState(() => Date.parse(PROMO.until) - Date.now());
  useEffect(() => {
    const t = setInterval(() => setLeft(Date.parse(PROMO.until) - Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!promoActive()) return null;
  const parts = [
    [Math.floor(left / 864e5), "dias"],
    [Math.floor((left % 864e5) / 36e5), "horas"],
    [Math.floor((left % 36e5) / 6e4), "min"],
    [Math.floor((left % 6e4) / 1e3), "seg"],
  ] as const;
  const plans = [
    { id: "natal" as const, name: "Carta Completa", kids: "até 2 crianças · 10 cartas" },
    { id: "familia" as const, name: "Pacote Família", kids: "até 5 crianças · 23 cartas" },
  ];
  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pt-6 pb-4" id="black-friday">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#FFD166] bg-[radial-gradient(ellipse_at_top,#2B2110_0%,#0B0B0F_60%)] p-5 sm:p-8 shadow-[0_0_60px_rgba(255,209,102,0.18)]">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#FFD166]/15 blur-3xl pointer-events-none" />
          <div className="relative grid lg:grid-cols-[1.1fr_1fr] gap-6 items-center">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 bg-[#FFD166] text-[#0B0B0F] text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.2em] rounded-full px-3 py-1 mb-3">
                🖤 Black Friday · só em novembro
              </span>
              <h2 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                O Natal Completo com <span className="text-[#FFD166]">até {PROMO.off.familia} de desconto</span>
              </h2>
              <p className="text-sm sm:text-base text-white/75 mt-2">Pagamento único no Pix ou cartão. Preço especial até {promoEndsLabel()}, depois volta ao normal.</p>
              <div className="flex justify-center lg:justify-start gap-2 mt-4" aria-label="Tempo até o fim da promoção">
                {parts.map(([v, l]) => (
                  <div key={l} className="w-14 sm:w-16 rounded-xl bg-white/10 border border-white/15 py-1.5 text-center">
                    <span className="block font-cinzel text-xl sm:text-2xl font-extrabold text-[#FFD166] tabular-nums">{String(Math.max(0, v)).padStart(2, "0")}</span>
                    <span className="block text-[10px] uppercase tracking-wider text-white/60">{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3">
              {plans.map((p) => (
                <button key={p.id} onClick={onPlans} className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-[#FFD166]/40 px-4 py-3 text-left cursor-pointer transition-colors" id={`bf-${p.id}`}>
                  <span>
                    <span className="block font-cinzel font-bold text-white">{p.name}</span>
                    <span className="block text-xs text-white/60">{p.kids}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-xs text-white/50">
                      de <s>{PROMO.from[p.id]}</s> <b className="text-[#2DC653]">-{PROMO.off[p.id]}</b>
                    </span>
                    <span className="block font-cinzel text-2xl font-extrabold text-[#FFD166]">{priceLabel(p.id)}</span>
                  </span>
                </button>
              ))}
              <button onClick={onCorreio} className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-white/25 px-4 py-2.5 text-left cursor-pointer hover:border-[#FFD166]/60" id="bf-avulsa">
                <span className="text-xs sm:text-sm text-white/85 inline-flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#FFD166] shrink-0" /> Resposta Mágica de uma cartinha
                </span>
                <span className="text-sm whitespace-nowrap">
                  <s className="text-white/45 text-xs">{brl(NORMAL.pro)}</s> <b className="text-[#FFD166]">{brl(AVULSA)}</b>
                </span>
              </button>
              <button onClick={onPlans} className="w-full bg-gradient-to-r from-[#FFD166] to-[#E9A13B] text-[#0B0B0F] font-extrabold py-3.5 rounded-full inline-flex items-center justify-center gap-2 shadow-lg btn-shine cursor-pointer" id="bf-cta" data-celebrate>
                <Sparkles className="w-5 h-5 relative z-10" /> <span className="relative z-10">Garantir o preço de Black Friday</span>
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
