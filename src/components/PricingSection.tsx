import { Check, Sparkles } from "lucide-react";
import { PlanType } from "../types";

interface PricingSectionProps {
  onSelectPlan: (plan: PlanType) => void;
}

export default function PricingSection({ onSelectPlan }: PricingSectionProps) {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto" id="precos">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs text-[#FFD166] uppercase font-bold tracking-widest block mb-2">
          Acessível para todas as famílias
        </span>
        <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
          Escolha a experiência ideal
        </h2>
        <p className="text-sm sm:text-base text-[#EDF2F4]/75">
          Experimente 100% grátis ou desbloqueie narração em áudio mágica e certificado dourado de bom comportamento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Free Plan */}
        <div className="bg-[#0B132B]/80 border border-white/10 rounded-3xl p-7 sm:p-8 flex flex-col justify-between backdrop-blur-sm">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-cinzel text-xl font-bold text-white">Carta Digital</h3>
              <span className="bg-white/10 text-xs px-3 py-1 rounded-full font-semibold text-[#EDF2F4]/80">
                Básico
              </span>
            </div>
            <div className="mb-6">
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-cinzel">R$ 0</span>
              <span className="text-xs text-[#EDF2F4]/60 ml-2">Totalmente gratuito</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-[#EDF2F4]/80 mb-8">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Carta personalizada com nome da criança</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Menção a 1 conquista do ano</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Design clássico de pergaminho</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Visualização instantânea na tela</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => onSelectPlan("free")}
            className="w-full bg-[#1C2541] hover:bg-[#2A3555] text-white font-bold py-3.5 rounded-full text-sm transition-colors border border-white/15 cursor-pointer"
            id="plan-free-btn"
          >
            Gerar Carta Grátis
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-gradient-to-b from-[#1C2541] via-[#0B132B] to-[#0B132B] border-2 border-[#FFD166] rounded-3xl p-7 sm:p-8 flex flex-col justify-between relative shadow-2xl">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1 rounded-full border border-[#FFD166]/60 shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FFD166]" />
            <span>Mais Popular e Completo</span>
          </div>
          <div>
            <div className="flex justify-between items-center mb-4 mt-2">
              <h3 className="font-cinzel text-xl font-bold text-white">Magia Completa do Polo Norte</h3>
              <span className="bg-[#FFD166]/20 text-xs px-3 py-1 rounded-full font-bold text-[#FFD166] border border-[#FFD166]/40">
                PRO
              </span>
            </div>
            <div className="mb-6">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#FFD166] font-cinzel">R$ 19,90</span>
              <span className="text-xs text-[#EDF2F4]/60 ml-2">Pagamento único</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-[#EDF2F4]/90 mb-8">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD166] shrink-0" />
                <span className="font-semibold text-white">Tudo do plano gratuito</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD166] shrink-0" />
                <span><strong>Narração com a voz calorosa</strong> do Papai Noel</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD166] shrink-0" />
                <span>PDF de alta resolução pronto para impressão A4</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD166] shrink-0" />
                <span>Certificado Oficial de Bom Comportamento</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#FFD166] shrink-0" />
                <span>Selo de Cera 2026 e Carimbo Postal do Polo Norte</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => onSelectPlan("pro")}
            className="w-full bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold py-3.5 rounded-full text-sm transition-transform active:scale-95 shadow-lg border border-[#FFD166]/50 gold-glow cursor-pointer"
            id="plan-pro-btn"
          >
            Garantir Magia Completa
          </button>
        </div>
      </div>
    </section>
  );
}
