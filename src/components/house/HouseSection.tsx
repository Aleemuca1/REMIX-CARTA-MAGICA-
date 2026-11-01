import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Home } from "lucide-react";
import Reveal from "../Reveal";
import HouseScene from "./HouseScene";
import HouseEditor from "./HouseEditor";
import { settle, type HouseItem } from "../../house/model";

const SAMPLE: HouseItem[] = [
  { id: "t", kind: "item", ref: "tapete", x: 330, y: 520, s: 1 },
  { id: "a", kind: "item", ref: "arvore", x: 240, y: 480, s: 1 },
  { id: "b", kind: "item", ref: "lareira", x: 390, y: 498, s: 0.95 },
  { id: "c", kind: "item", ref: "presente", x: 214, y: 530, s: 0.9 },
  { id: "c2", kind: "item", ref: "presente", x: 268, y: 534, s: 0.75 },
  { id: "d", kind: "item", ref: "peru", x: 560, y: 520, s: 1 },
  { id: "e", kind: "item", ref: "bolo", x: 615, y: 514, s: 0.9 },
  { id: "f", kind: "item", ref: "cama", x: 560, y: 360, s: 1 },
  { id: "g", kind: "item", ref: "urso", x: 470, y: 372, s: 0.9 },
  { id: "h", kind: "item", ref: "boneco", x: 90, y: 560, s: 1 },
  { id: "i", kind: "item", ref: "rena", x: 800, y: 575, s: 0.9 },
  { id: "j", kind: "pessoa", ref: "p:vova:1:3", x: 318, y: 505, s: 0.95, name: "Vovó" },
  { id: "k", kind: "pessoa", ref: "p:menina:2:5", x: 465, y: 510, s: 0.85, name: "Sofia" },
  { id: "l", kind: "pessoa", ref: "p:cachorro:0:0", x: 670, y: 522, s: 0.7, name: "Thor" },
  { id: "m", kind: "pessoa", ref: "p:papai:2:1", x: 300, y: 360, s: 0.95, name: "Papai" },
];

/** Seção "Nossa Casinha de Natal": a família monta a casa junta, no mesmo celular ou pelo link. */
export default function HouseSection({ onUpgrade }: { onUpgrade?: () => void }) {
  const [open, setOpen] = useState(false);
  const [sharedToken, setSharedToken] = useState<string | undefined>();

  // link compartilhado /casa/<código> abre a casa direto
  useEffect(() => {
    const m = window.location.pathname.match(/^\/casa\/([a-z0-9]{6,20})\/?$/i);
    if (m) {
      setSharedToken(m[1].toLowerCase());
      setOpen(true);
      setTimeout(() => document.getElementById("casinha")?.scrollIntoView(), 300);
    }
  }, []);

  const close = () => {
    setOpen(false);
    if (window.location.pathname.startsWith("/casa/")) {
      setTimeout(() => window.history.replaceState(null, "", "/"), 80);
      setSharedToken(undefined);
    }
  };

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="casinha">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#FFD166]/50 bg-gradient-to-br from-[#3A1F0F] via-[#1C2541] to-[#0B132B] p-6 sm:p-10 grid md:grid-cols-2 gap-8 items-center shadow-2xl">
          <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-[#FFD166]/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0B132B] bg-[#FFD166] rounded-full px-3 py-1 mb-3">🏡 Novo · jogo em família</span>
            <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">Nossa Casinha de Natal</h2>
            <p className="text-sm sm:text-base text-[#EDF2F4]/80 mb-5 leading-relaxed">
              Monte a casa da família com árvore, lareira, ceia e bonecos de neve. Cada pessoa vira um bonequinho com o próprio nome, e no fim o Papai
              Noel desce pela chaminé e deixa presentes!
            </p>
            <ul className="text-xs sm:text-sm text-[#EDF2F4]/70 space-y-1.5 mb-6 inline-block text-left">
              <li>👨‍👩‍👧 Todo mundo junto no mesmo celular, passando a vez</li>
              <li>👵 Avós e tios colocam o bonequinho deles pelo link do WhatsApp</li>
              <li>🌙 Noite de Natal com luzinhas, neve e a visita do Papai Noel</li>
              <li>📲 Baixe a casinha com os recadinhos para guardar</li>
            </ul>
            <div>
              <button
                onClick={() => setOpen(true)}
                className="bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white font-extrabold px-8 py-4 rounded-full inline-flex items-center gap-2 shadow-lg border border-[#FFD166]/60 btn-shine animate-soft-pulse cursor-pointer text-lg"
                id="house-open-btn"
                data-celebrate
              >
                <Home className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Montar nossa casinha</span>
              </button>
            </div>
          </div>
          <button onClick={() => setOpen(true)} className="relative z-10 rounded-3xl overflow-hidden border border-white/15 shadow-2xl cursor-pointer w-full" aria-label="Abrir a Casinha de Natal">
            <HouseScene cfg={{ model: "chale", roof: "#C1121F", title: "" }} items={SAMPLE.map((i) => ({ ...i, ...settle(i) }))} night className="w-full h-auto block pointer-events-none" />
          </button>
        </div>
      </Reveal>
      <AnimatePresence>{open && <HouseEditor onClose={close} sharedToken={sharedToken} onUpgrade={onUpgrade} />}</AnimatePresence>
    </section>
  );
}
