import { Check, Sparkles, Crown } from "lucide-react";
import { PlanType } from "../types";
import Reveal from "./Reveal";

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
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Carta Digital",
    tag: "Grátis",
    price: "R$ 0",
    note: "para sempre",
    cta: "Gerar carta grátis",
    features: [
      { text: "Carta personalizada com o nome da criança" },
      { text: "Envelope mágico animado" },
      { text: "Prévia da voz do Papai Noel" },
      { text: "Jogo Entrega Relâmpago e Ateliê de Natal" },
      { text: "1ª portinha do Calendário do Advento" },
    ],
  },
  {
    id: "natal",
    name: "Natal Completo",
    tag: "Mais escolhido",
    price: "R$ 29,90",
    note: "pagamento único",
    cta: "Quero o Natal Completo",
    highlight: true,
    features: [
      { text: "Tudo da Magia Completa", strong: true },
      { text: "Calendário do Advento com 24 surpresas", strong: true },
      { text: "Minijogos, adivinhas, desenhos exclusivos e desafios de bondade" },
      { text: "Recados diários do Papai Noel e da Mamãe Noel" },
      { text: "Estrelas no Livro Dourado até a véspera" },
    ],
  },
  {
    id: "pro",
    name: "Magia Completa",
    tag: "PRO",
    price: "R$ 19,90",
    note: "pagamento único",
    cta: "Garantir Magia Completa",
    features: [
      { text: "Tudo do plano grátis", strong: true },
      { text: "Carta inteira narrada pelo Papai Noel", strong: true },
      { text: "PDF em alta para imprimir em A4" },
      { text: "Certificado de Bom Comportamento" },
      { text: "Link para compartilhar com a família" },
    ],
  },
];

export default function PricingSection({ onSelectPlan }: PricingSectionProps) {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="precos">
      <Reveal className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs text-[#FFD166] uppercase font-bold tracking-widest block mb-2">Acessível para todas as famílias</span>
        <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Escolha a experiência ideal</h2>
        <p className="text-sm sm:text-base text-[#EDF2F4]/75">
          Comece grátis e, se quiser, leve a magia até a noite de Natal com o Calendário do Advento.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {PLANS.map((p, i) => (
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
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${p.id === "pro" ? "bg-[#FFD166]/20 text-[#FFD166] border border-[#FFD166]/40" : "bg-white/10 text-[#EDF2F4]/80"}`}>
                      {p.tag}
                    </span>
                  )}
                </div>
                <div className="mb-6">
                  <span className={`text-3xl sm:text-4xl font-extrabold font-cinzel ${p.id === "free" ? "text-white" : "text-[#FFD166]"}`}>{p.price}</span>
                  <span className="text-xs text-[#EDF2F4]/60 ml-2">{p.note}</span>
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
