import { motion } from "motion/react";
import { Check, Crown, X } from "lucide-react";
import { useBackClose } from "../lib/backClose";
import { PROMO, promoActive } from "../lib/promo";

export type PaidChoice = "natal" | "familia";

export const PAID_PLANS: {
  id: PaidChoice;
  name: string;
  kids: string;
  price: string;
  badge?: string;
}[] = [
  { id: "natal", name: "Carta Completa", kids: "até 2 crianças · 10 cartas", price: "R$ 14,90", badge: "Mais escolhido" },
  { id: "familia", name: "Pacote Família", kids: "até 5 crianças · 23 cartas", price: "R$ 25,90", badge: "Melhor para famílias grandes" },
];

/** O que vem nos dois planos pagos (tudo o que temos de melhor). */
export const PAID_FEATURES = [
  "10 cartas completas (Carta Completa) ou 23 (Pacote Família): dá para refazer, fazer a da véspera e um recado especial",
  "6 vozes lendo a carta inteira (Papai Noel, Noel animado, Mamãe Noel, Duende, Contador de histórias e Anjinho)",
  "🎵 Música de Natal cantada com o nome da criança (uma por criança)",
  "Carta brilhante em 5 cores, com moldura que brilha",
  "PDF para imprimir, imagem HD e vídeo com a voz",
  "Certificado de Bom Comportamento",
  "24 surpresas no Calendário do Advento",
];

/** Escolha do plano antes de pagar: Carta Completa (até 2 crianças) ou Pacote Família (até 5). */
export default function PlanChooser({ onPick, onClose }: { onPick: (p: PaidChoice) => void; onClose: () => void }) {
  useBackClose(true, onClose);
  return (
    <motion.div
      className="fixed inset-0 z-[97] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        id="plan-chooser"
        className="relative w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto bg-gradient-to-b from-[#1C2541] to-[#0B132B] border-2 border-[#FFD166] rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-2xl"
        initial={{ y: 60, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 60 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/10 cursor-pointer" aria-label="Fechar">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="text-4xl mb-1" aria-hidden="true">
            🎅👑
          </div>
          <h3 className="font-cinzel text-xl sm:text-2xl font-bold">{promoActive() ? `🖤 ${PROMO.name}: escolha o seu Natal Completo` : "Escolha o seu Natal Completo"}</h3>
          <p className="text-sm text-white/70 mt-1">Pagamento único, no Pix ou cartão. Cada criança ganha a sua carta com o próprio nome.</p>
        </div>

        <div className="mt-4 grid gap-3">
          {PAID_PLANS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => onPick(p.id)}
              className={`relative text-left rounded-2xl p-4 border-2 cursor-pointer transition-transform hover:-translate-y-0.5 ${
                i === 0 ? "border-[#FFD166] bg-[#FFD166]/10" : "border-white/20 bg-white/5 hover:border-[#FFD166]/60"
              }`}
              id={`choose-${p.id}`}
            >
              {p.badge && (
                <span className={`absolute -top-2.5 right-3 text-[10px] font-extrabold uppercase tracking-wider rounded-full px-2.5 py-0.5 ${i === 0 ? "bg-[#D90429] text-white" : "bg-[#2DC653] text-[#0B132B]"}`}>
                  {p.badge}
                </span>
              )}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-cinzel font-bold text-lg leading-tight">{p.name}</p>
                  <p className="text-sm text-[#FFD166] font-bold">👧👦 {p.kids}</p>
                </div>
                <div className="text-right shrink-0">
                  {promoActive() && <p className="text-xs text-white/50 -mb-1"><s>{PROMO.from[p.id]}</s> <span className="text-[#FFD166] font-bold">-{PROMO.off[p.id]}</span></p>}
                  <p className="font-cinzel text-2xl font-extrabold text-[#FFD166]">{p.price}</p>
                  <p className="text-[10px] text-white/60">pagamento único</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#FFD166]">Os dois planos têm tudo:</p>
        <ul className="mt-2 space-y-1.5">
          {PAID_FEATURES.map((f) => (
            <li key={f} className="flex gap-2 text-xs sm:text-sm text-white/85">
              <Check className="w-4 h-4 text-[#2DC653] shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] text-white/55 text-center inline-flex items-center gap-1 justify-center w-full">
          <Crown className="w-3.5 h-3.5 text-[#FFD166]" /> Depois de pagar, é só criar as cartas dos irmãos: elas já saem completas.
        </p>
      </motion.div>
    </motion.div>
  );
}
