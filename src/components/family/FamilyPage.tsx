import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Mail, Sparkles, TreePine, Home as HomeIcon } from "lucide-react";
import { daysToChristmas, loadPublicFamily, type PublicFamily } from "../../lib/family";
import { letterTheme } from "../../lib/letterThemes";
import FamilyAvatar from "./FamilyAvatar";
import { SantaHat } from "../ui/Icons";

/** Página pública da família: /familia/:slug (só existe se os pais ligarem no painel). */
export default function FamilyPage({ slug }: { slug: string }) {
  const [data, setData] = useState<PublicFamily | null | undefined>(undefined);
  useEffect(() => {
    loadPublicFamily(slug).then((d) => {
      setData(d);
      if (d) document.title = `${d.profile.familyName} · Natal na Carta Mágica`;
    });
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex";
    document.head.appendChild(m);
  }, [slug]);
  const days = daysToChristmas();

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,#1C2541,#0B132B_60%)] text-white">
      <header className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="inline-flex items-center gap-2 font-cinzel font-bold">
          <SantaHat size={28} /> Carta Mágica
        </a>
        <a href="/" className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold bg-white/10 hover:bg-white/15">
          <ArrowLeft className="w-4 h-4" /> Página inicial
        </a>
      </header>

      {data === undefined && (
        <div className="py-32 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFD166]" />
        </div>
      )}
      {data === null && (
        <div className="max-w-md mx-auto text-center py-24 px-4">
          <h1 className="font-cinzel text-2xl font-bold">Página não encontrada</h1>
          <p className="mt-2 text-white/70 text-sm">Esta família ainda não abriu a página dela, ou o link mudou.</p>
          <a href="/" className="mt-6 inline-block rounded-full px-6 py-3 font-bold bg-gradient-to-r from-[#D90429] to-[#EF233C]">
            Criar a carta do Papai Noel
          </a>
        </div>
      )}
      {data && (
        <main className="max-w-4xl mx-auto px-4 pb-16" id="family-page">
          <section className="text-center pt-6">
            <FamilyAvatar id={data.profile.avatar} size={104} className="mx-auto" />
            <h1 className="mt-5 font-cinzel text-3xl sm:text-4xl font-bold">{data.profile.familyName}</h1>
            {data.profile.bio && <p className="mt-3 max-w-xl mx-auto text-white/80">{data.profile.bio}</p>}
            {data.profile.children.length > 0 && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {data.profile.children.map((c) => (
                  <span key={c.name} className="rounded-full px-4 py-1.5 text-sm font-bold bg-white/10 border border-white/15">
                    {c.name}
                    {c.age ? <span className="text-white/60 font-semibold"> · {c.age} anos</span> : null}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#FFD166]/50 bg-[#FFD166]/10 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 text-[#FFD166]" /> {days === 0 ? "Hoje é Natal!" : `Faltam ${days} ${days === 1 ? "dia" : "dias"} para o Natal`}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-cinzel text-xl font-bold mb-3 inline-flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#FFD166]" /> Cartas do Papai Noel
            </h2>
            {data.letters.length ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {data.letters.map((l) => {
                  const th = letterTheme(l.theme);
                  return (
                    <a key={l.token} href={`/natal/${l.token}`} className="flex items-center gap-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 p-3">
                      <span className="w-12 h-12 rounded-xl grid place-items-center shrink-0 border border-white/30" style={{ background: `linear-gradient(135deg, ${th.envelope[0]}, ${th.envelope[1]})` }}>
                        <Mail className="w-5 h-5" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-bold">Carta para {l.childName}</span>
                        <span className="block text-xs text-white/60">{l.date}</span>
                      </span>
                      <span className="text-sm font-bold text-[#FFD166]">Abrir →</span>
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-white/65">As cartas aparecem aqui quando o Papai Noel entregar.</p>
            )}
          </section>

          {(data.trees.length > 0 || data.houses.length > 0) && (
            <section className="mt-10">
              <h2 className="font-cinzel text-xl font-bold mb-3 inline-flex items-center gap-2">
                <TreePine className="w-5 h-5 text-[#2DC653]" /> Árvore e casinha da família
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {data.trees.map((t) => (
                  <a key={t.token} href={`/arvore/${t.token}`} className="flex items-center gap-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 p-3">
                    <TreePine className="w-6 h-6 text-[#2DC653]" /> <span className="flex-1 font-bold">{t.title || "Árvore da família"}</span>
                    <span className="text-xs text-white/60">deixe um enfeite</span>
                  </a>
                ))}
                {data.houses.map((h) => (
                  <a key={h.token} href={`/casa/${h.token}`} className="flex items-center gap-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 p-3">
                    <HomeIcon className="w-6 h-6 text-[#FFD166]" /> <span className="flex-1 font-bold">{h.title || "Casinha de Natal"}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          <section className="mt-12 rounded-3xl border-2 border-[#FFD166]/60 bg-gradient-to-br from-[#D90429]/25 to-transparent p-6 text-center">
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold">A sua família também merece uma carta</h2>
            <p className="mt-2 text-sm text-white/75">O Papai Noel escreve com o nome, a idade e as conquistas de cada criança. A primeira é grátis.</p>
            <a href="/" className="mt-5 inline-block rounded-full px-7 py-3 font-extrabold bg-gradient-to-r from-[#D90429] to-[#EF233C] border border-[#FFD166]/50">
              Criar carta grátis
            </a>
          </section>
        </main>
      )}
    </div>
  );
}
