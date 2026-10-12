import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { TreePine } from "lucide-react";
import Reveal from "../Reveal";
import TreeSvg from "./TreeSvg";
import TreeEditor from "./TreeEditor";
import type { Ornament } from "../../tree/model";

const SAMPLE: Ornament[] = [
  { id: "a", type: "bola", color: "#E63946", x: 250, y: 220, text: "x" },
  { id: "b", type: "sino", color: "#FFD166", x: 350, y: 330 },
  { id: "c", type: "coracao", color: "#F72585", x: 225, y: 370, text: "x" },
  { id: "d", type: "laco", color: "#4CC9F0", x: 330, y: 200 },
  { id: "e", type: "estrela", color: "#FFD166", x: 410, y: 470, text: "x" },
  { id: "f", type: "bola", color: "#2DC653", x: 200, y: 500 },
  { id: "g", type: "doce", color: "#E63946", x: 300, y: 450, text: "x" },
  { id: "h", type: "boneco", color: "#4361EE", x: 290, y: 280 },
  { id: "i", type: "presente", color: "#9B5DE5", x: 205, y: 640 },
  { id: "j", type: "presente", color: "#E63946", x: 395, y: 650 },
];

/** Seção "Árvore de Natal da Família": todos penduram enfeites com frases de carinho. */
export default function TreeSection() {
  const [open, setOpen] = useState(false);
  const [sharedToken, setSharedToken] = useState<string | undefined>();

  // link compartilhado /arvore/<código> abre a árvore direto
  useEffect(() => {
    const m = window.location.pathname.match(/^\/arvore\/([a-z0-9]{6,16})\/?$/i);
    if (m) {
      setSharedToken(m[1].toLowerCase());
      setOpen(true);
      setTimeout(() => document.getElementById("arvore")?.scrollIntoView(), 300);
    }
  }, []);

  const close = () => {
    setOpen(false);
    if (window.location.pathname.startsWith("/arvore/")) {
      // depois que o histórico da janela for desfeito, limpa o endereço
      setTimeout(() => window.history.replaceState(null, "", "/"), 80);
      setSharedToken(undefined);
    }
  };

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="arvore">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#2DC653]/50 bg-gradient-to-br from-[#123524] via-[#1C2541] to-[#0B132B] p-6 sm:p-10 grid md:grid-cols-2 gap-8 items-center shadow-2xl">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-[#2DC653]/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 text-center md:text-left order-2 md:order-1">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0B132B] bg-[#2DC653] rounded-full px-3 py-1 mb-3">
              🎄 Novo · para toda a família
            </span>
            <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">Árvore de Natal da Família</h2>
            <p className="text-sm sm:text-base text-[#EDF2F4]/80 mb-5 leading-relaxed">
              Pais e filhos montam juntos uma árvore cheia de enfeites, e cada enfeite guarda uma frase de carinho, gratidão ou um
              desejo para o ano novo. Mande o link e os avós penduram enfeites de onde estiverem!
            </p>
            <ul className="text-xs sm:text-sm text-[#EDF2F4]/70 space-y-1.5 mb-6 inline-block text-left">
              <li>💌 Enfeites com frases prontas ou do seu jeito</li>
              <li>👵 Avós e tios participam pelo link do WhatsApp</li>
              <li>✨ Modo Ceia: as frases aparecem na tela na noite de Natal</li>
              <li>📲 Baixe a árvore com todas as frases para guardar</li>
            </ul>
            <div>
              <button
                onClick={() => setOpen(true)}
                className="bg-gradient-to-r from-[#2DC653] to-[#1a9e3e] text-white font-extrabold px-8 py-4 rounded-full inline-flex items-center gap-2 shadow-lg border border-[#FFD166]/50 btn-shine animate-soft-pulse cursor-pointer text-lg"
                id="tree-open-btn"
                data-celebrate
              >
                <TreePine className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Montar nossa árvore</span>
              </button>
            </div>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="relative z-10 order-1 md:order-2 rounded-3xl overflow-hidden border border-white/10 shadow-2xl cursor-pointer max-w-sm w-full mx-auto"
            aria-label="Abrir a árvore de Natal"
          >
            <TreeSvg ornaments={SAMPLE} starGlow className="w-full h-auto block" />
          </button>
        </div>
      </Reveal>

      <AnimatePresence>{open && <TreeEditor key={sharedToken || "local"} sharedToken={sharedToken} onClose={close} />}</AnimatePresence>
    </section>
  );
}
