import { Check, Sparkles, Crown } from "lucide-react";
import { priceLabel } from "../lib/pricing";
import { useFeatures } from "../lib/features";
import { PlanType } from "../types";
import Reveal from "./Reveal";
import { PROMO, promoActive, promoEndsLabel } from "../lib/promo";

interface PricingSectionProps {
  onSelectPlan: (plan: PlanType) => void;
}

type Plan = {
  id: PlanType;
  name: string;
  tag: string;
  price: string;
  note: string;
  cta: string;
  features: { text: string; strong?: boolean }[];
  highlight?: boolean;
  kids?: string;
};

const PAID: { text: string; strong?: boolean }[] = [
  { text: "Cartas completas com o nome de cada criança", strong: true },
  { text: "6 vozes lendo a carta inteira: Papai Noel, Noel animado, Mamãe Noel, Duende, Contador de histórias e Anjinho", strong: true },
  { text: "Carta brilhante em 5 cores, com moldura que brilha", strong: true },
  { text: "PDF para imprimir, imagem HD e vídeo com a voz" },
  { text: "Certificado de Bom Comportamento" },
  { text: "24 surpresas no Calendário do Advento" },
  { text: "Árvore ilimitada, Modo Ceia com voz e Ateliê completo" },
];

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Carta Digital",
    tag: "Grátis",
    price: "R$ 0",
    note: "para sempre",
    cta: "Gerar carta grátis",
    features: [
      { text: "Até 3 cartas por dia com o nome da criança" },
      { text: "Envelope mágico e carta brilhante em 5 cores" },
      { text: "Prévia da voz do Papai Noel" },
      { text: "Jogos, Árvore de Luz e Lista do Bom Comportamento" },
      { text: "Ateliê de Natal com desenhos para colorir" },
      { text: "1ª portinha do Calendário do Advento" },
    ],
  },
  {
    id: "natal",
    name: "Carta Completa",
    tag: "Mais escolhido · até 2 crianças",
    kids: "👧👦 até 2 crianças · 10 cartas completas",
    get price() { return priceLabel("natal"); },
    note: "pagamento único",
    cta: "Quero para meus filhos",
    highlight: true,
    features: PAID,
  },
  {
    id: "familia",
    name: "Pacote Família",
    tag: "Até 5 crianças",
    kids: "👨‍👩‍👧‍👦 até 5 crianças · 23 cartas completas",
    get price() { return priceLabel("familia"); },
    note: "pagamento único",
    cta: "Quero o Pacote Família",
    features: PAID,
  },
];

export default function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const feat = useFeatures();
  const plans = PLANS.map((p) => (p.id === "free" || !feat.music ? p : { ...p, features: [{ text: "🎵 NOVO: Música de Natal cantada com o nome da criança (1 por criança)", strong: true }, ...p.features] }));
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="precos">
      <Reveal className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs text-[#FFD166] uppercase font-bold tracking-widest block mb-2">Acessível para todas as famílias</span>
        <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Escolha a experiência ideal</h2>
        <p className="text-sm sm:text-base text-[#EDF2F4]/75">
          Comece grátis. Se quiser, libere tudo para os seus filhos com pagamento único: cada criança ganha a sua carta completa, com o próprio nome.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7 items-stretch max-w-6xl mx-auto">
        {plans.map((p, i) => (
          <Reveal key={p.id} delay={0.1 + i * 0.12} className={`h-full ${p.highlight ? "md:-mt-4 md:mb-4" : ""}`}>
            <div
              className={`h-full rounded-3xl p-7 sm:p-8 flex flex-col justify-between relative transition-all duration-300 hover:-translate-y-1.5 ${
                p.highlight
                  ? "pro-glow-border shadow-2xl hover:shadow-[0_25px_60px_-15px_rgba(255,209,102,0.45)]"
                  : "snow-cap bg-[#0B132B]/80 border border-white/10 backdrop-blur-sm hover:border-white/25"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1 rounded-full border border-[#FFD166]/60 shadow-md flex items-center gap-1 whitespace-nowrap">
                  <Crown className="w-3 h-3 text-[#FFD166]" />
                  <span>{p.tag}</span>
                </div>
              )}
              <div>
                <div className="flex justify-between items-center mb-4 mt-2 gap-2">
                  <h3 className="font-cinzel text-xl font-bold text-white">{p.name}</h3>
                  {!p.highlight && (
                    <span className={`text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap ${p.id === "familia" ? "bg-[#2DC653]/20 text-[#7BE495] border border-[#2DC653]/40" : "bg-white/10 text-[#EDF2F4]/80"}`}>
                      {p.tag}
                    </span>
                  )}
                </div>
                {p.kids && <p className="text-sm font-bold text-[#FFE9A8] -mt-2 mb-2">{p.kids}</p>}
                <div className="mb-6">
                  {promoActive() && PROMO.from[p.id] && (
                    <div className="flex items-center gap-2 mb-1">
                      <s className="text-sm text-[#EDF2F4]/55">{PROMO.from[p.id]}</s>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#FFD166] text-[#0B132B] rounded-full px-2 py-0.5">🖤 {PROMO.name} · -{PROMO.off[p.id]}</span>
                    </div>
                  )}
                  <span className={`text-3xl sm:text-4xl font-extrabold font-cinzel ${p.id === "free" ? "text-white" : "text-[#FFD166]"}`}>{p.price}</span>
                  <span className="text-xs text-[#EDF2F4]/60 ml-2">{p.note}</span>
                  {promoActive() && PROMO.from[p.id] && <span className="block text-[11px] text-[#FFD166]/80 mt-1">Promoção válida até {promoEndsLabel()}</span>}
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-[#EDF2F4]/85 mb-8">
                  {p.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${p.id === "free" ? "text-emerald-400" : "text-[#FFD166]"}`} />
                      <span className={f.strong ? "font-semibold text-white" : ""}>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => onSelectPlan(p.id)}
                className={
                  p.id === "free"
                    ? "w-full bg-[#1C2541] hover:bg-[#2A3555] text-white font-bold py-3.5 rounded-full text-sm transition-colors border border-white/15 cursor-pointer"
                    : `w-full bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] text-white font-bold py-3.5 rounded-full text-sm shadow-lg border border-[#FFD166]/50 cursor-pointer btn-shine ${p.highlight ? "animate-soft-pulse" : ""}`
                }
                id={`plan-${p.id}-btn`}
                data-celebrate
              >
                <span className="relative z-10 inline-flex items-center gap-1.5">
                  {p.highlight && <Sparkles className="w-4 h-4 text-[#FFD166]" />}
                  {p.cta}
                </span>
              </button>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
