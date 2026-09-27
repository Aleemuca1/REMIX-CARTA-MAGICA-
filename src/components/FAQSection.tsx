import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import Reveal from "./Reveal";

const FAQS = [
  {
    q: "Quanto tempo leva para a carta ficar pronta?",
    a: "Menos de 2 minutos. Você preenche o nome, a idade e algumas conquistas do ano, e a carta aparece na hora na tela.",
  },
  {
    q: "A carta gratuita é realmente grátis?",
    a: "Sim. Você gera e vê a carta completa sem pagar nada. O plano Magia Completa é opcional e acrescenta narração em áudio, PDF para impressão e certificado.",
  },
  {
    q: "Posso imprimir a carta?",
    a: "Pode. Ela já vem no formato de pergaminho, pronta para imprimir em papel A4 e colocar em um envelope para a criança abrir.",
  },
  {
    q: "Para qual idade a carta é indicada?",
    a: "Para crianças de 1 a 14 anos. O Papai Noel ajusta o jeito de escrever de acordo com a idade informada.",
  },
  {
    q: "Posso fazer cartas para mais de um filho?",
    a: "Claro! Cada carta é única e personalizada. É só criar uma para cada criança.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto" id="duvidas">
      <Reveal className="text-center mb-10">
        <span className="text-xs text-[#FFD166] uppercase font-bold tracking-widest block mb-2">
          Dúvidas frequentes
        </span>
        <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          Perguntas dos papais e mamães
        </h2>
      </Reveal>
      <div className="space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={i} delay={i * 0.08}>
              <div
                className={`rounded-2xl border transition-colors duration-300 ${
                  isOpen ? "border-[#FFD166]/50 bg-[#1C2541]/70" : "border-white/10 bg-[#0B132B]/70 hover:border-white/25"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-white text-sm sm:text-base">{f.q}</span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="w-5 h-5 text-[#FFD166]" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-[#EDF2F4]/75 leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
