import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import Reveal from "./Reveal";

/** Tudo o que não é a carta fica guardado aqui: a página fica limpa e a família abre quando quiser. */
export const EXTRAS: { id: string; emoji: string; title: string; text: string }[] = [
  { id: "arvore", emoji: "🎄", title: "Árvore da Família", text: "Enfeites com frases de carinho." },
  { id: "calendario", emoji: "📅", title: "Calendário do Advento", text: "Uma surpresa por dia até o Natal." },
  { id: "lista", emoji: "📜", title: "Lista do Bom Comportamento", text: "Teste divertido com certificado." },
  { id: "rastreador", emoji: "🛷", title: "Rastreie o Papai Noel", text: "Siga o trenó pelo mundo." },
  { id: "jogo", emoji: "🎮", title: "Jogos de Natal", text: "Papai Noel, urso polar e memória." },
  { id: "atelie", emoji: "🎨", title: "Ateliê para colorir", text: "Desenhos para pintar e imprimir." },
  { id: "cartao", emoji: "💌", title: "Cartão de Natal", text: "9 modelos com a foto da família: PDF, imagem e vídeo." },
  { id: "familia", emoji: "📸", title: "Família no Trenó", text: "Coloque o rosto da família no trenó." },
];
const ALL_IDS = new Set([...EXTRAS.map((e) => e.id), "retrato", "meus-cartoes", "urso", "memoria", "arvore-luz", "natal-mundo", "globo", "presente"]);

export const isExtraId = (id: string) => ALL_IDS.has(id);
/** Abre o baú de brincadeiras e rola até a seção pedida (usado pelo menu). */
export const openExtra = (id: string) => window.dispatchEvent(new CustomEvent("cm-open-extra", { detail: id }));

export default function ExtrasHub({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const go = (id?: string) => {
    setOpen(true);
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 350);
  };

  useEffect(() => {
    // links compartilhados (/casa/..., /arvore/...) e links das páginas do guia (/#casinha) abrem direto
    const path = window.location.pathname;
    const hash = window.location.hash.slice(1);
    if (path.startsWith("/arvore/")) setOpen(true);
    else if (isExtraId(hash)) setTimeout(() => go(hash), 300);
    const onOpen = (e: Event) => go((e as CustomEvent<string>).detail);
    window.addEventListener("cm-open-extra", onOpen);
    return () => window.removeEventListener("cm-open-extra", onOpen);
  }, []);

  return (
    <section className="py-14 md:py-20" id="extras">
      <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <Reveal className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs text-[#FFD166] uppercase font-bold tracking-widest block mb-2">Bônus para a família</span>
          <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">Mais magia depois da carta</h2>
          <p className="text-sm sm:text-base text-[#EDF2F4]/75">Brincadeiras para fazer juntos até a noite de Natal. Toque em uma para abrir.</p>
        </Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {EXTRAS.map((e, i) => (
            <Reveal key={e.id} delay={0.04 * i}>
              <button
                onClick={() => go(e.id)}
                className="group w-full h-full text-left rounded-2xl bg-[#0B132B]/80 border border-white/10 hover:border-[#FFD166]/70 p-4 sm:p-5 transition-all hover:-translate-y-1 cursor-pointer"
                id={`extra-${e.id}`}
              >
                <span className="text-3xl sm:text-4xl block mb-2 transition-transform group-hover:scale-110 group-hover:-rotate-6">{e.emoji}</span>
                <span className="block font-bold text-white text-sm sm:text-base leading-tight">{e.title}</span>
                <span className="block text-[11px] sm:text-xs text-[#EDF2F4]/60 mt-1 leading-snug">{e.text}</span>
              </button>
            </Reveal>
          ))}
        </div>
        {!open && (
          <div className="text-center mt-6">
            <button onClick={() => go()} className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-bold cursor-pointer" id="extras-open">
              Ver todas as brincadeiras <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
