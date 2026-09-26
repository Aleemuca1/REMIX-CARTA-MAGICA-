import { useState } from "react";
import { Sparkles, ArrowRight, ShieldCheck, Heart, Volume2, Stamp } from "lucide-react";
import ChristmasCountdown from "./ChristmasCountdown";
import HeroSantaFlight from "./HeroSantaFlight";

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
  const [envelopeOpen, setEnvelopeOpen] = useState(false);

  return (
    <section className="relative pt-6 pb-16 md:pt-12 md:pb-24 px-4 sm:px-6 lg:px-8 w-full overflow-hidden" id="hero-section">
      {/* Background radial glow - strictly bounded to prevent horizontal expansion */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-[650px] h-[360px] bg-radial from-[#D90429]/15 via-[#FFD166]/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl xl:max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">
        {/* Left Column: Emotional Copy & CTAs */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left z-20">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 bg-[#0B132B]/90 border border-[#FFD166]/40 rounded-full px-4 py-1.5 text-xs text-[#FFD166] shadow-md mx-auto lg:mx-0">
            <span className="flex h-2 w-2 rounded-full bg-[#EF233C] animate-ping" />
            <span className="font-semibold tracking-wide">Experiência Oficial de Natal por Inteligência Artificial</span>
          </div>

          {/* Headline Mandated by User */}
          <h1 className="font-cinzel text-3xl sm:text-4xl lg:text-[40px] xl:text-5xl font-extrabold text-white leading-[1.18] tracking-tight">
            Neste Natal, o Papai Noel vai chamar seu filho{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFE194] via-[#FFD166] to-[#FFB703] drop-shadow-sm">
              pelo nome.
            </span>
          </h1>

          {/* Subheadline Mandated by User */}
          <p className="text-base sm:text-lg text-[#EDF2F4]/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
            Crie uma experiência mágica e personalizada que seu filho vai lembrar para sempre.
          </p>

          {/* Elegant Christmas Countdown for Dec 25 */}
          <div className="pt-1 flex justify-center lg:justify-start">
            <ChristmasCountdown />
          </div>

          {/* Social Proof & Trust snippet */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs text-[#EDF2F4]/70 pt-1">
            <div className="flex items-center gap-1.5 bg-[#1C2541]/70 px-3 py-1.5 rounded-full border border-white/5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Privacidade Infantil Protegida</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#1C2541]/70 px-3 py-1.5 rounded-full border border-white/5">
              <Heart className="w-3.5 h-3.5 text-[#EF233C]" />
              <span>Mais de 14.800 crianças encantadas</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#1C2541]/70 px-3 py-1.5 rounded-full border border-white/5">
              <Volume2 className="w-3.5 h-3.5 text-[#FFD166]" />
              <span>Voz e PDF prontos para imprimir</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={() => onStartWizard("free")}
              className="w-full sm:w-auto bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold px-8 py-4 rounded-full shadow-lg border border-[#FFD166]/50 flex items-center justify-center gap-3 text-base sm:text-lg transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer gold-glow"
              id="hero-cta-free"
            >
              <Sparkles className="w-5 h-5 text-[#FFD166]" />
              <span>✨ Criar minha carta grátis</span>
              <ArrowRight className="w-4 h-4 text-[#FFD166]" />
            </button>

            <button
              onClick={() => onScrollTo("como-funciona")}
              className="w-full sm:w-auto bg-[#0B132B]/85 hover:bg-[#1C2541] border border-white/20 text-[#EDF2F4] font-semibold px-6 py-4 rounded-full text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
              id="hero-cta-how"
            >
              <span>🎅 Ver como funciona</span>
            </button>
          </div>

          {/* Guarantee Tag */}
          <p className="text-xs text-[#EDF2F4]/60 text-center lg:text-left">
            🎁 Comece gratuitamente agora • Nenhuma cobrança oculta • Você vê a carta antes de qualquer decisão.
          </p>
        </div>

        {/* Right Column: Visual Elegant Parchment Letter + Integrated Decorative Santa in Sky */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative z-20 w-full">
          {/* Dedicated celestial flight corridor in the upper-right sky above the letter card */}
          <div className="w-full relative h-28 sm:h-32 md:h-36 lg:h-40 flex items-end justify-end mb-2 sm:mb-3 pointer-events-none select-none">
            <HeroSantaFlight />
          </div>

          <div className="relative w-full max-w-[360px] sm:max-w-[400px] xl:max-w-[420px] mx-auto">
            {/* North Pole Wax Seal Stamp */}
            <div 
              onClick={() => setEnvelopeOpen(!envelopeOpen)}
              className="absolute -top-4 -right-2 sm:-top-5 sm:-right-3 z-30 wax-seal w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center border-2 border-[#FFD166] text-[#FFD166] cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              title="Clique para abrir ou fechar a carta"
              id="seal-stamp"
            >
              <span className="font-cinzel text-[8px] sm:text-[9px] font-extrabold uppercase leading-none text-center">
                POLO NORTE
              </span>
              <span className="font-mono text-[9px] sm:text-[10px] font-bold text-white leading-none mt-0.5">
                2026
              </span>
              <span className="text-[7px] text-[#FFD166]/80 uppercase tracking-tighter mt-0.5">
                OFICIAL
              </span>
            </div>

            {/* Vintage Parchment Preview Card */}
            <div
              className={`relative z-20 parchment-bg text-[#1C2541] rounded-3xl p-5 sm:p-7 border-4 border-[#FFD166] magical-shadow transition-all duration-500 transform ${
                envelopeOpen ? "rotate-0 scale-[1.01]" : "rotate-1 hover:rotate-0"
              }`}
              id="hero-sample-letter-card"
            >
              {/* Header decorative bar */}
              <div className="flex justify-between items-center border-b-2 border-[#1C2541]/20 pb-3 sm:pb-4 mb-3 sm:mb-4">
                <div>
                  <span className="font-cinzel text-[9px] sm:text-[10px] font-extrabold tracking-widest text-[#9B021A] uppercase block">
                    SERVIÇO POSTAL AERONÁUTICO DO POLO NORTE
                  </span>
                  <span className="text-[10px] text-[#1C2541]/70 font-serif italic">
                    Expresso Oficial de Natal • Destinatário Especial
                  </span>
                </div>
                <Stamp className="w-5 h-5 sm:w-6 sm:h-6 text-[#9B021A]/50" />
              </div>

              {/* Child Info Badge */}
              <div className="inline-block bg-[#D90429]/10 text-[#9B021A] border border-[#D90429]/30 rounded-full px-3 py-1 text-[11px] font-bold mb-3">
                Para: Lucas, 6 anos — São Paulo, SP
              </div>

              {/* Body snippet */}
              <div className="font-serif text-sm sm:text-base leading-relaxed space-y-2 text-[#1C2541]">
                <p className="font-cinzel font-bold text-[#9B021A] text-base">
                  Ho Ho Ho! Meu querido Lucas,
                </p>
                <p>
                  Aqui do alto do Polo Norte, observei no meu telescópio de cristal o quanto você foi corajoso ao aprender a andar de bicicleta sem rodinhas este ano!
                </p>
                <p className="text-xs sm:text-sm text-[#1C2541]/80 italic">
                  O Rudolph já separou com carinho a sua cartinha sobre o dinossauro robô que você pediu...
                </p>
              </div>

              {/* Signature and Authenticity Seal */}
              <div className="mt-4 pt-3 border-t border-[#1C2541]/15 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-cinzel text-[#1C2541]/60 block">
                    Certificado de Bom Menino
                  </span>
                  <span className="text-xs font-bold text-[#9B021A]">
                    ✓ Aprovado no Livro Dourado
                  </span>
                </div>
                <div className="text-right pr-2">
                  <span className="font-handwriting text-2xl sm:text-3xl text-[#9B021A] font-bold block -mb-1">
                    Papai Noel
                  </span>
                  <span className="text-[9px] text-[#1C2541]/50">Oficina Central do Polo Norte</span>
                </div>
              </div>

              {/* Interactive preview helper */}
              <div className="mt-3 pt-2 flex items-center justify-between text-xs font-semibold text-[#9B021A] border-t border-dashed border-[#1C2541]/20">
                <button
                  onClick={onViewSample}
                  className="hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  id="hero-listen-sample-btn"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Ouvir narração em áudio</span>
                </button>
                <button
                  onClick={() => onStartWizard("free")}
                  className="hover:underline text-[11px] font-bold pr-2 cursor-pointer"
                  id="hero-customize-btn"
                >
                  Personalizar para seu filho →
                </button>
              </div>
            </div>

            {/* Little decorative ribbon under the card */}
            <div className="text-center mt-3">
              <span className="inline-block text-[11px] text-[#EDF2F4]/60 bg-[#060B19]/80 px-3 py-1 rounded-full border border-white/10">
                ✨ Modelo interativo • 100% personalizável em segundos
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
