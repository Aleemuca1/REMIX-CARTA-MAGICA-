import { BookOpen, Camera, Gift, PhoneCall, ShieldCheck, Star } from "lucide-react";
import Reveal from "../Reveal";
import { LIGACAO, brl } from "../../lib/pricing";

/** Página inicial: chamada para o Papai Noel Ao Vivo. */
export default function SantaLiveSection({ onStart }: { onStart: () => void }) {
  return (
    <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="ao-vivo">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#FFD166]/60 bg-gradient-to-br from-[#2B0B10] via-[#1C2541] to-[#0B132B] grid md:grid-cols-2 items-stretch shadow-2xl">
          <div className="p-6 sm:p-10 order-2 md:order-1 flex flex-col justify-center">
            <span className="inline-flex items-center gap-2 self-start text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-white bg-[#D90429] rounded-full px-3 py-1 mb-3">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Novo · Ao vivo
            </span>
            <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">O Papai Noel liga e chama o seu filho pelo nome</h2>
            <p className="text-sm sm:text-base text-[#EDF2F4]/80 mt-3">Uma ligação mágica com voz: ele pergunta a idade, o que a criança fez de bom e o pedido de Natal, e responde na hora. A saudação com o nome é grátis.</p>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-white/90">
              <li className="flex items-center gap-2"><Gift className="w-4 h-4 text-[#FFD166]" /> Anota o pedido</li>
              <li className="flex items-center gap-2"><Star className="w-4 h-4 text-[#FFD166]" /> Fala o nome dela</li>
              <li className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#FFD166]" /> Ouve uma história</li>
              <li className="flex items-center gap-2"><Camera className="w-4 h-4 text-[#FFD166]" /> Tira uma foto</li>
            </ul>
            <button onClick={onStart} className="mt-6 self-start bg-[#2DC653] hover:brightness-105 text-[#06240F] font-extrabold px-7 py-4 rounded-full inline-flex items-center gap-2 shadow-lg animate-soft-pulse cursor-pointer text-base sm:text-lg" id="aovivo-open-btn" data-celebrate>
              <PhoneCall className="w-5 h-5" /> Atender o Papai Noel
            </button>
            <p className="mt-3 text-sm text-white/85">
              Ligação completa de 2 minutos por <b className="text-[#FFD166]">{brl(LIGACAO)}</b> · incluída na Carta Completa e no Pacote Família
            </p>
            <p className="mt-2 text-[11px] text-[#2DC653] flex gap-1.5 leading-snug">
              <ShieldCheck className="w-4 h-4 shrink-0" /> Com um adulto junto. Conversa com inteligência artificial; a voz da criança não é gravada.
            </p>
          </div>
          <button onClick={onStart} className="order-1 md:order-2 relative min-h-[220px] cursor-pointer" aria-label="Atender o Papai Noel">
            <img src="/aovivo/capa.webp" alt="Papai Noel em uma chamada de vídeo" loading="lazy" className="absolute inset-0 w-full h-full object-cover object-left" />
          </button>
        </div>
      </Reveal>
    </section>
  );
}
