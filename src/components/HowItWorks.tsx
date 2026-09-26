import { Sparkles, Edit3, Scroll, Gift } from "lucide-react";
import Reveal from "./Reveal";

interface HowItWorksProps {
  onStartWizard: (plan?: "free" | "pro") => void;
}

export default function HowItWorks({ onStartWizard }: HowItWorksProps) {
  const steps = [
    {
      icon: <Edit3 className="w-6 h-6 text-[#FFD166]" />,
      step: "01",
      title: "Conte sobre seu filho",
      desc: "Informe o nome, idade, cidade e aquelas pequenas grandes vitórias do ano que só a família sabe.",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#EF233C]" />,
      step: "02",
      title: "A magia da oficina",
      desc: "Nossa tecnologia inteligente do Polo Norte redige uma mensagem calorosa e cheia de detalhes reais.",
    },
    {
      icon: <Scroll className="w-6 h-6 text-[#FFD166]" />,
      step: "03",
      title: "Carta oficial com selo",
      desc: "Receba na hora o pergaminho vintage com selo de cera, narração em áudio e pronto para imprimir.",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl xl:max-w-7xl mx-auto" id="como-funciona">
      <Reveal className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs text-[#FFD166] uppercase font-bold tracking-widest block mb-2">
          Simples, Rápido e Inesquecível
        </span>
        <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
          Como a magia acontece em 3 passos
        </h2>
        <p className="text-sm sm:text-base text-[#EDF2F4]/75">
          Em menos de 2 minutos você cria uma memória de infância que sua família guardará para sempre.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {steps.map((item, index) => (
          <Reveal key={index} delay={index * 0.15}>
          <div
            className="group h-full bg-[#0B132B]/80 border border-white/10 rounded-2xl p-6 sm:p-7 relative backdrop-blur-sm hover:border-[#FFD166]/50 hover:-translate-y-2 hover:shadow-[0_18px_40px_-12px_rgba(255,209,102,0.35)] transition-all duration-300"
          >
            <div className="icon-bounce w-12 h-12 rounded-xl bg-[#1C2541] flex items-center justify-center mb-4 border border-white/10">
              {item.icon}
            </div>
            <span className="font-cinzel font-extrabold text-2xl text-[#FFD166]/30 absolute top-6 right-6">
              {item.step}
            </span>
            <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white mb-2">
              {item.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#EDF2F4]/70 leading-relaxed">
              {item.desc}
            </p>
          </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="text-center mt-10" delay={0.3}>
        <button
          onClick={() => onStartWizard("free")}
          className="bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white font-bold px-7 py-3 rounded-full text-sm sm:text-base inline-flex items-center gap-2 shadow-lg border border-[#FFD166]/40 hover:scale-105 transition-transform cursor-pointer btn-shine"
          id="how-it-works-cta"
        >
          <Gift className="w-4 h-4 text-[#FFD166]" />
          <span className="relative z-10">Começar Agora Mesmo</span>
        </button>
      </Reveal>
    </section>
  );
}
