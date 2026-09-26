import { Sparkles } from "lucide-react";

interface NavbarProps {
  onStartWizard: (plan?: "free" | "pro") => void;
  onScrollTo: (id: string) => void;
}

export default function Navbar({ onStartWizard, onScrollTo }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#060B19]/80 border-b border-white/10">
      <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onScrollTo("hero-section")}
          className="flex items-center gap-2.5 cursor-pointer group"
          id="navbar-brand"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D90429] to-[#EF233C] flex items-center justify-center text-xl shadow-md border border-[#FFD166]/40 group-hover:scale-105 transition-transform">
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
            onClick={() => onScrollTo("precos")}
            className="text-xs sm:text-sm text-[#EDF2F4]/80 hover:text-white transition-colors cursor-pointer hidden sm:inline-block"
            id="nav-link-pricing"
          >
            Planos
          </button>
          <button
            onClick={() => onStartWizard("free")}
            className="bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-1.5 shadow-md border border-[#FFD166]/40 transition-transform active:scale-95 cursor-pointer"
            id="nav-cta-create"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFD166]" />
            <span>Criar Carta</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
