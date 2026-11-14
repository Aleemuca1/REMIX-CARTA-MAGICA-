import { ImageIcon, Pencil } from "lucide-react";
import Reveal from "../Reveal";
import CardPlanStrip, { CARD_ART, cardArt } from "./CardPlanStrip";
import { openExtra } from "../ExtrasHub";

/** Página inicial: vitrine do Cartão de Natal personalizado e o que cada plano libera. */
export default function CardTeaser({ onPlans }: { onPlans: (plan: "natal" | "familia") => void }) {
  return (
    <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="cartao-natal">
      <Reveal className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#0B132B] bg-[#FFD166] rounded-full px-3 py-1 mb-3">
          <ImageIcon className="w-3.5 h-3.5" /> Cartão de Natal personalizado
        </span>
        <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">Crie um cartão único com a foto da família</h2>
        <p className="text-sm sm:text-base text-[#EDF2F4]/75">9 modelos para imprimir, salvar como imagem ou mandar no WhatsApp. A foto fica só no seu aparelho.</p>
      </Reveal>
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8 max-w-4xl mx-auto">
        {CARD_ART.map((a, i) => (
          <button key={a} onClick={() => openExtra("cartao")} className={`group flex flex-col rounded-xl overflow-hidden bg-white/95 p-1 sm:p-1.5 shadow-xl cursor-pointer hover:-translate-y-1 transition-transform ${i > 5 ? "hidden sm:flex" : ""}`} aria-label="Personalizar este modelo">
            <img src={cardArt(a)} alt="" loading="lazy" className="w-full h-auto aspect-[4/3] object-cover rounded-lg" />
            <span className="mt-1 sm:mt-1.5 py-1 sm:py-1.5 rounded-md bg-gradient-to-r from-[#C1121F] to-[#8E0A18] text-white text-[10px] sm:text-xs font-bold inline-flex items-center justify-center gap-1">
              <Pencil className="w-3 h-3" /> Personalizar
            </span>
          </button>
        ))}
      </div>
      <div className="max-w-4xl mx-auto">
        <CardPlanStrip onPick={(p) => (p === "free" ? openExtra("cartao") : onPlans(p))} />
      </div>
    </section>
  );
}
