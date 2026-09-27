import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import ChristmasLights from "./ChristmasLights";

interface NavbarProps {
  onStartWizard: (plan?: "free" | "pro") => void;
  onScrollTo: (id: string) => void;
}

export default function Navbar({ onStartWizard, onScrollTo }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-md border-b border-white/10 transition-all duration-300 ${
        scrolled ? "bg-[#060B19]/95 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.8)]" : "bg-[#060B19]/70"
      }`}
    >
      <div
        className={`max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        {/* Brand Logo */}
        <div
          onClick={() => onScrollTo("hero-section")}
          className="flex items-center gap-2.5 cursor-pointer group"
          id="navbar-brand"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D90429] to-[#EF233C] flex items-center justify-center text-xl shadow-md border border-[#FFD166]/40 group-hover:scale-110 group-hover:rotate-12 transition-transform">
            🎅
          </div>
          <div className="flex flex-col">
            <span className="font-cinzel text-lg sm:text-xl font-bold text-white tracking-wide leading-tight">
              Carta Mágica
            </span>
            <span className="text-[10px] text-[#FFD166] uppercase tracking-widest font-semibold">
              Polo Norte Oficial
            </span>
          </div>
        </div>

        {/* Nav Links & CTA */}
        <nav className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => onScrollTo("como-funciona")}
            className="text-xs sm:text-sm text-[#EDF2F4]/80 hover:text-white transition-colors cursor-pointer hidden sm:inline-block"
            id="nav-link-how"
          >
            Como Funciona
          </button>
          <button
            onClick={() => onScrollTo("duvidas")}
            className="text-xs sm:text-sm text-[#EDF2F4]/80 hover:text-white transition-colors cursor-pointer hidden md:inline-block"
          >
            Dúvidas
          </button>
          <button
            onClick={() => onScrollTo("precos")}
            className="text-xs sm:text-sm text-[#EDF2F4]/80 hover:text-white transition-colors cursor-pointer hidden sm:inline-block"
            id="nav-link-pricing"
          >
            Planos
          </button>
          <button
            onClick={() => onStartWizard("free")}
            className="bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-1.5 shadow-md border border-[#FFD166]/40 transition-transform active:scale-95 cursor-pointer btn-shine"
            id="nav-cta-create"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFD166] relative z-10" />
            <span className="relative z-10">Criar Carta</span>
          </button>
        </nav>
      </div>
      <ChristmasLights />
    </header>
  );
}
