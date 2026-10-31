import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Reveal from "./Reveal";
import { PLACES, REGIONS, type Region } from "../lib/worldChristmas";

/** "Natal pelo mundo": curiosidades organizadas por região, sempre terminando na carta. */
export default function WorldChristmas({ onCreateLetter }: { onCreateLetter: () => void }) {
  const [region, setRegion] = useState<Region>("Brasil");
  const [openId, setOpenId] = useState<string | null>(null);
  const list = PLACES.filter((p) => p.region === region);

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="natal-mundo">
      <Reveal>
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0B132B] bg-[#FFD166] rounded-full px-3 py-1 mb-3">
            🌍 Curiosidades
          </span>
          <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-white mb-2">Como é o Natal pelo mundo?</h2>
          <p className="text-sm sm:text-base text-[#EDF2F4]/80 max-w-2xl mx-auto">
            O trenó do Papai Noel passa por todas essas cidades na noite de 24. Descubra como cada lugar comemora e como se diz “Feliz Natal” por lá!
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6" role="tablist" aria-label="Regiões">
          {REGIONS.map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={region === r}
              onClick={() => {
                setRegion(r);
                setOpenId(null);
              }}
              className={`rounded-full px-4 py-2 text-sm font-bold border cursor-pointer transition-colors ${
                region === r ? "bg-[#FFD166] text-[#0B132B] border-[#FFD166]" : "bg-white/5 text-white/85 border-white/15 hover:border-[#FFD166]/60"
              }`}
              id={`world-tab-${r}`}
            >
              {r === "Brasil" ? "🇧🇷 Brasil" : r === "Américas" ? "🌎 Américas" : r === "Europa" ? "🏰 Europa" : "🌏 Outros lugares"}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {list.map((p) => {
              const open = openId === p.id;
              return (
                <motion.article
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl bg-gradient-to-br from-[#14224A] to-[#0B132B] border border-white/10 hover:border-[#FFD166]/50 p-4 text-left shadow-lg"
                  id={`place-${p.id}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl shrink-0">{p.emoji}</span>
                    <div className="min-w-0">
                      <h3 className="font-cinzel font-bold text-white text-lg leading-tight">
                        {p.flag} {p.name}
                      </h3>
                      <p className="text-xs text-white/60">{p.country}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-white/70">
                    Lá se diz: <b className="text-[#FFD166] text-sm">{p.hello}</b>
                  </p>
                  <ul className="mt-2 space-y-2">
                    {(open ? p.facts : p.facts.slice(0, 1)).map((f) => (
                      <li key={f} className="text-sm text-[#EDF2F4]/90 leading-snug flex gap-2">
                        <span className="text-[#FFD166]">✦</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setOpenId(open ? null : p.id)} className="mt-2 text-xs font-bold text-[#4CC9F0] hover:text-white cursor-pointer" id={`place-more-${p.id}`}>
                    {open ? "Mostrar menos" : `+ ${p.facts.length - 1} curiosidades`}
                  </button>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onCreateLetter}
            className="bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white font-extrabold px-6 py-3.5 rounded-full inline-flex items-center gap-2 shadow-lg border border-[#FFD166]/50 btn-shine cursor-pointer"
            id="world-letter-cta"
            data-celebrate
          >
            <span className="relative z-10">✉️ Escrever minha carta: o trenó passa aqui também!</span>
          </button>
        </div>
      </Reveal>
    </section>
  );
}
