import { motion, useReducedMotion } from "motion/react";
import HeroFlakes from "./HeroFlakes";
import { Sparkles, ArrowRight, ShieldCheck, Timer, Volume2 } from "lucide-react";
import ChristmasCountdown from "./ChristmasCountdown";
import HeroLetters from "./HeroLetters";
import { PROMO, promoActive } from "../lib/promo";
import NightSky from "./NightSky";
import SnowyVillage from "./SnowyVillage";
import HangingOrnaments from "./HangingOrnaments";


interface LandingHeroProps {
  onStartWizard: (plan?: "free" | "pro") => void;
  onScrollTo: (id: string) => void;
  onViewSample: () => void;
}

export default function LandingHero({
  onStartWizard,
  onScrollTo,
  onViewSample,
}: LandingHeroProps) {
  const reduce = useReducedMotion();
  const item = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section className="relative pt-6 pb-36 md:pt-12 md:pb-44 px-4 sm:px-6 lg:px-8 w-full overflow-hidden" id="hero-section">
      {/* Background radial glow - strictly bounded to prevent horizontal expansion */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-[650px] h-[360px] bg-radial from-[#D90429]/15 via-[#FFD166]/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="aurora pointer-events-none -z-10" aria-hidden="true" />
      <NightSky />
      <HangingOrnaments />
      <SnowyVillage />
      <HeroFlakes />

      <div className="max-w-6xl xl:max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">
        {/* Left Column: Emotional Copy & CTAs */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left z-20">
          {/* Subtle Tag */}
          <motion.div {...item(0)} className="inline-flex items-center gap-2 bg-[#0B132B]/90 border border-[#FFD166]/40 rounded-full px-4 py-1.5 text-xs text-[#FFD166] shadow-md mx-auto lg:mx-0">
            <span className="flex h-2 w-2 rounded-full bg-[#EF233C] animate-ping" />
            <span className="font-semibold tracking-wide">Carta do Papai Noel com o nome do seu filho · grátis em 2 minutos</span>
          </motion.div>

          {/* Headline Mandated by User */}
          <motion.h1 {...item(1)} className="font-cinzel text-3xl sm:text-4xl lg:text-[40px] xl:text-5xl font-extrabold text-white leading-[1.18] tracking-tight">
            Neste Natal, o Papai Noel vai chamar seu filho{" "}
            <span className="relative inline-block">
              <span className="text-gold-shimmer drop-shadow-sm">pelo nome.</span>
              <span className="title-sparkle text-base -top-2 -left-3" style={{ animationDelay: "0s" }}>✦</span>
              <span className="title-sparkle text-sm top-0 -right-4" style={{ animationDelay: "0.8s" }}>✦</span>
              <span className="title-sparkle text-xs -bottom-1 left-1/2" style={{ animationDelay: "1.6s" }}>✦</span>
            </span>
          </motion.h1>

          {/* Subheadline Mandated by User */}
          <motion.p {...item(2)} className="text-base sm:text-lg text-[#EDF2F4]/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
            Uma carta escrita só para ele, com as conquistas do ano, lida pela voz do Papai Noel. Você vê a carta antes de pagar qualquer coisa.
          </motion.p>

          {/* Elegant Christmas Countdown for Dec 25 */}
          <motion.div {...item(3)} className="pt-1 flex justify-center lg:justify-start">
            <ChristmasCountdown />
          </motion.div>

          {/* Social Proof & Trust snippet */}
          <motion.div {...item(4)} className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs text-[#EDF2F4]/70 pt-1">
            <div className="flex items-center gap-1.5 bg-[#1C2541]/70 px-3 py-1.5 rounded-full border border-white/5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Privacidade Infantil Protegida</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#1C2541]/70 px-3 py-1.5 rounded-full border border-white/5">
              <Timer className="w-3.5 h-3.5 text-[#EF233C]" />
              <span>Pronta em menos de 2 minutos</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#1C2541]/70 px-3 py-1.5 rounded-full border border-white/5">
              <Volume2 className="w-3.5 h-3.5 text-[#FFD166]" />
              <span>Voz e PDF prontos para imprimir</span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div {...item(5)} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={() => onStartWizard("free")}
              className="group w-full sm:w-auto bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold px-8 py-4 rounded-full shadow-lg border border-[#FFD166]/50 flex items-center justify-center gap-3 text-base sm:text-lg transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer btn-shine animate-soft-pulse"
              id="hero-cta-free"
              data-celebrate
            >
              <Sparkles className="w-5 h-5 text-[#FFD166] relative z-10" />
              <span className="relative z-10">Criar minha carta grátis</span>
              <ArrowRight className="w-4 h-4 text-[#FFD166] relative z-10 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => onScrollTo("como-funciona")}
              className="w-full sm:w-auto bg-[#0B132B]/85 hover:bg-[#1C2541] border border-white/20 text-[#EDF2F4] font-semibold px-6 py-4 rounded-full text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
              id="hero-cta-how"
            >
              <span>🎅 Ver como funciona</span>
            </button>
          </motion.div>

          {/* Guarantee Tag */}
          <p className="text-xs text-[#EDF2F4]/60 text-center lg:text-left">
            🎁 Grátis para começar • Natal Completo a partir de R$ 14,90{promoActive() && <> <s className="opacity-60">R$ 29,90</s> na {PROMO.name}</>} • Seu filho escreveu? <button onClick={() => onScrollTo("correio")} className="underline text-[#FFD166] cursor-pointer">O Papai Noel responde</button>
          </p>
        </div>

        {/* Right Column: Visual Elegant Parchment Letter + Integrated Decorative Santa in Sky */}
        <motion.div
          className="lg:col-span-5 flex flex-col items-center justify-center relative z-20 w-full"
          initial={reduce ? false : { opacity: 0, scale: 0.9, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >

          <HeroLetters onListen={onViewSample} onCreate={() => onStartWizard("free")} />
        </motion.div>
      </div>
    </section>
  );
}
