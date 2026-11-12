import { useEffect, useState } from "react";
import { Sparkles, Menu, X, UserRound } from "lucide-react";
import { openParentArea, useAuth } from "../lib/auth";
import { EXTRAS } from "./ExtrasHub";
import { ChevronDown } from "lucide-react";

/** Tudo o que o site tem (o menu do celular e o "Tudo para a família" do computador usam a mesma lista). */
const FEATURES = [
  { id: "criar", label: "🎅 Carta do Papai Noel", text: "Com o nome, a voz e o PDF" },
  { id: "correio", label: "📮 Correio do Polo Norte", text: "Seu filho escreve, o Papai Noel responde" },
  ...EXTRAS.map((e) => ({ id: e.id, label: `${e.emoji} ${e.title}`, text: e.text })),
];
const MENU = [
  { id: "como-funciona", label: "✨ Como funciona" },
  ...FEATURES.map((f) => ({ id: f.id, label: f.label })),
  { id: "precos", label: "👑 Planos" },
  { id: "duvidas", label: "❓ Dúvidas" },
];
import ChristmasLights from "./ChristmasLights";

interface NavbarProps {
  onStartWizard: (plan?: "free" | "pro") => void;
  onScrollTo: (id: string) => void;
}

export default function Navbar({ onStartWizard, onScrollTo }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [all, setAll] = useState(false);
  const go = (id: string) => {
    setAll(false);
    setMenu(false);
    if (id === "criar") onStartWizard("free");
    else onScrollTo(id);
  };
  useEffect(() => {
    if (!all) return;
    const close = (e: MouseEvent) => !(e.target as HTMLElement).closest("#nav-all-wrap") && setAll(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAll(false);
    window.addEventListener("click", close);
    window.addEventListener("keydown", esc);
    return () => (window.removeEventListener("click", close), window.removeEventListener("keydown", esc));
  }, [all]);
  const auth = useAuth();
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
        <nav className="flex items-center gap-2 sm:gap-6">
          <button
            onClick={() => onScrollTo("como-funciona")}
            className="text-xs sm:text-sm text-[#EDF2F4]/80 hover:text-white transition-colors cursor-pointer hidden sm:inline-block"
            id="nav-link-how"
          >
            Como Funciona
          </button>
          <div className="relative hidden md:block" id="nav-all-wrap">
            <button
              onClick={() => setAll((v) => !v)}
              className="text-xs sm:text-sm text-[#FFD166] hover:text-white font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
              aria-expanded={all}
              aria-haspopup="true"
              id="nav-all"
            >
              🎁 Tudo para a família <ChevronDown className={`w-3.5 h-3.5 transition-transform ${all ? "rotate-180" : ""}`} />
            </button>
            {all && (
              <div className="absolute right-0 lg:left-1/2 lg:-translate-x-1/2 top-full mt-3 w-[min(92vw,620px)] rounded-2xl border border-[#FFD166]/40 bg-[#0B132B]/98 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-3 grid grid-cols-2 gap-1 z-50" role="menu" id="nav-all-menu">
                {FEATURES.map((f) => (
                  <button key={f.id} onClick={() => go(f.id)} className="text-left rounded-xl px-3 py-2.5 hover:bg-white/10 cursor-pointer" role="menuitem" id={`nav-all-${f.id}`}>
                    <span className="block text-sm font-bold text-white">{f.label}</span>
                    <span className="block text-[11px] text-white/55 leading-snug">{f.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
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
          {auth.available && (
          <button
            onClick={() => void openParentArea()}
            className={`text-xs sm:text-sm transition-colors cursor-pointer inline-flex items-center gap-1.5 rounded-full ${
              auth.parent ? "bg-white/10 text-white px-2.5 py-1.5 hover:bg-white/15" : "text-[#EDF2F4]/80 hover:text-white p-2 sm:p-0"
            }`}
            id="nav-parents"
            aria-label="Área dos pais"
            title="Área dos pais"
          >
            <UserRound className="w-4 h-4" />
            <span className="hidden md:inline xl:hidden 2xl:inline">{auth.parent ? "Painel da Família" : "Área dos pais"}</span>
          </button>
          )}
          <button
            onClick={() => setMenu((v) => !v)}
            className="xl:hidden text-white/90 hover:text-white p-2 -mr-1 rounded-full hover:bg-white/10 cursor-pointer"
            aria-label={menu ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menu}
            id="nav-menu-btn"
          >
            {menu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <button
            onClick={() => onStartWizard("free")}
            className="bg-gradient-to-r from-[#D90429] to-[#EF233C] hover:from-[#EF233C] hover:to-[#9B021A] text-white font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm flex items-center gap-1.5 shadow-md border border-[#FFD166]/40 transition-transform active:scale-95 cursor-pointer btn-shine"
            id="nav-cta-create"
            data-celebrate
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFD166] relative z-10" />
            <span className="relative z-10">Criar Carta</span>
          </button>
        </nav>
      </div>
      <ChristmasLights />
      {menu && (
        <div className="xl:hidden absolute top-full inset-x-0 bg-[#060B19]/97 backdrop-blur-md border-b border-white/10 shadow-2xl">
          <nav className="max-w-6xl mx-auto px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-1">
            {MENU.map((m) => (
              <button
                key={m.id}
                onClick={() => go(m.id)}
                className="text-left text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-xl px-4 py-3 cursor-pointer"
              >
                {m.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
