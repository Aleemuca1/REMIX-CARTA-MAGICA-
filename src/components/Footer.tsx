import { motion, useReducedMotion } from "motion/react";

/** Rodapé com trenó passando e guirlanda. */
export default function Footer({ onScrollTo }: { onScrollTo: (id: string) => void }) {
  const reduce = useReducedMotion();
  return (
    <footer className="relative w-full border-t border-white/10 bg-[#040812] pt-14 pb-10 text-center text-xs text-[#EDF2F4]/60 overflow-hidden">
      {/* guirlanda */}
      <div className="absolute top-0 inset-x-0 h-6 flex justify-around" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} className="text-lg -mt-2" style={{ transform: `rotate(${i % 2 ? 20 : -20}deg)` }}>
            {i % 4 === 0 ? "🔴" : i % 4 === 2 ? "🟡" : "🌿"}
          </span>
        ))}
      </div>
      {!reduce && (
        <motion.div
          className="absolute top-8 text-2xl"
          animate={{ left: ["110%", "-15%"] }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          aria-hidden="true"
        >
          🦌🦌🛷
        </motion.div>
      )}
      <div className="relative max-w-6xl mx-auto px-4 space-y-3 mt-6">
        <p className="font-cinzel text-lg text-[#FFD166]">Carta Mágica do Papai Noel</p>
        <p>Transformando o Natal das crianças com inteligência artificial, carinho e memórias inesquecíveis.</p>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 pt-2 text-[#EDF2F4]/70">
          {[
            ["como-funciona", "Como funciona"],
            ["jogo", "Jogo de Natal"],
            ["atelie", "Ateliê de Natal"],
            ["calendario", "Calendário do Advento"],
            ["precos", "Planos"],
            ["duvidas", "Dúvidas"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => onScrollTo(id)} className="hover:text-[#FFD166] transition-colors cursor-pointer">
              {label}
            </button>
          ))}
        </nav>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-1 text-[11px] text-[#EDF2F4]/55">
          <a href="/termos" className="hover:text-[#FFD166] underline-offset-2 hover:underline">Termos de Uso</a>
          <a href="/privacidade" className="hover:text-[#FFD166] underline-offset-2 hover:underline">Política de Privacidade</a>
          <a href="/cookies" className="hover:text-[#FFD166] underline-offset-2 hover:underline">Política de Cookies</a>
        </nav>
        <p className="text-[11px] text-[#EDF2F4]/40 pt-3">
          Feito com ❤️ e muito chocolate quente • © {new Date().getFullYear()} Carta Mágica
        </p>
      </div>
    </footer>
  );
}
