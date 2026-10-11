import { useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { LEGAL } from "../../legal/config";
import type { LegalDoc } from "../../legal/content";

const LINKS = [
  ["/termos", "Termos de Uso"],
  ["/privacidade", "Política de Privacidade"],
  ["/cookies", "Política de Cookies"],
] as const;

/** Página de texto legal (Termos, Privacidade, Cookies). */
export default function LegalPage({ doc }: { doc: LegalDoc }) {
  useEffect(() => {
    document.title = `${doc.title} — ${LEGAL.marca}`;
    window.scrollTo(0, 0);
  }, [doc]);

  // destaca campos ainda não preenchidos em src/legal/config.ts
  const mark = (t: string) =>
    t.split(/(\[[^\]]+\])/g).map((part, i) =>
      part.startsWith("[") ? (
        <mark key={i} className="bg-[#FFD166]/30 text-[#9B021A] rounded px-1">
          {part}
        </mark>
      ) : (
        part
      ),
    );

  return (
    <div className="min-h-screen bg-[#060B19] text-[#EDF2F4] px-4 py-10 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-[#FFD166] hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar para a Carta Mágica
        </a>

        <nav className="flex flex-wrap gap-2 mb-8">
          {LINKS.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className={`text-xs sm:text-sm rounded-full px-4 py-2 border ${
                href === `/${doc.slug}` ? "bg-[#FFD166] text-[#0B132B] border-[#FFD166] font-bold" : "border-white/20 text-white/80 hover:border-white/40"
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="parchment-bg text-[#1C2541] rounded-3xl border-4 border-[#FFD166] shadow-2xl p-6 sm:p-10"
        >
          <p className="text-4xl mb-2">{doc.emoji}</p>
          <h1 className="font-cinzel text-2xl sm:text-4xl font-bold text-[#9B021A] mb-1">{doc.title}</h1>
          <p className="text-xs text-[#1C2541]/60 mb-6">Última atualização: {LEGAL.atualizadoEm}</p>
          <p className="text-sm sm:text-base leading-relaxed mb-6">{mark(doc.intro)}</p>

          {doc.blocks.map((b, i) => (
            <section key={i} className="mb-5">
              {b.h && <h2 className="font-cinzel text-lg sm:text-xl font-bold text-[#9B021A] mt-6 mb-2">{b.h}</h2>}
              {b.p?.map((t, j) => (
                <p key={j} className="text-sm sm:text-base leading-relaxed mb-2">
                  {mark(t)}
                </p>
              ))}
              {b.li && (
                <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base leading-relaxed">
                  {b.li.map((t, j) => (
                    <li key={j}>{mark(t)}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </motion.article>

        <p className="text-center text-xs text-white/50 mt-8">
          © {new Date().getFullYear()} {LEGAL.marca} • {LEGAL.email}
        </p>
      </div>
    </div>
  );
}
