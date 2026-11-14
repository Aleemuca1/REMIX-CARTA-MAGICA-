import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Film, FileDown, FolderHeart, ImageDown, Pencil, Share2, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import Reveal from "../Reveal";
import { ensureFonts } from "../../lib/shareKit";
import { TEMPLATES } from "../../cards/templates";
import { cardDims, renderFace } from "../../cards/render";
import { demoPhoto } from "../../cards/demoPhoto";
import { deleteCard, listCards, type SavedCard } from "../../cards/store";
import type { CardData, TemplateId } from "../../cards/types";
import CardEditor from "./CardEditor";
import CardPlanStrip, { CARD_ART, CardFan, cardArt } from "./CardPlanStrip";
import { CARD_LIMIT, cardPlan, type CardPlan } from "../../cards/limits";
import { priceLabel } from "../../lib/pricing";

const PREVIEW_LONG = 900;

/** Prévia de um modelo com a família ilustrada de exemplo (sem rosto real). */
function TemplatePreview({ id, delay }: { id: TemplateId; delay: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => {
      ensureFonts().then(() => {
        const c = ref.current;
        if (!alive || !c) return;
        const ph = demoPhoto();
        const { W, H } = cardDims("retrato", PREVIEW_LONG);
        const d: CardData = {
          template: id,
          orientation: "retrato",
          photo: ph,
          photoW: ph.width,
          photoH: ph.height,
          crop: { zoom: 1, ox: 0, oy: 0, fit: false },
          title: "Feliz Natal",
          family: "Família Oliveira",
          children: "Ana, Pedro e Leo",
          message: "Que o amor, a paz e a esperança estejam presentes em todos os lares.",
          signature: "Com amor, Marcos e Júlia",
          year: `Natal ${new Date().getFullYear()}`,
        };
        renderFace(c.getContext("2d")!, W, H, d);
        c.dataset.ready = "1";
      });
    }, delay);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [id, delay]);
  const { W, H } = cardDims("retrato", PREVIEW_LONG);
  return <canvas ref={ref} width={W} height={H} className="block w-full h-auto rounded-[4px] bg-[#1C2541]" aria-hidden="true" />;
}

const STEPS = [
  { n: 1, t: "Escolha o modelo", d: "9 cartões com moldura e cenário próprios." },
  { n: 2, t: "Coloque a foto", d: "Do celular ou do computador. Arraste e dê zoom para enquadrar." },
  { n: 3, t: "Escreva a mensagem", d: "Nome da família, das crianças, assinatura e ano." },
  { n: 4, t: "Baixe e compartilhe", d: "PDF para imprimir, imagem, vídeo e WhatsApp." },
];

/** Cartão de Natal Premium: galeria com os 9 modelos + editor. Substitui o antigo Retrato de Natal. */
export default function ChristmasCardSection({ onUpgrade }: { onUpgrade?: () => void }) {
  const [editing, setEditingRaw] = useState<{ template: TemplateId; saved?: SavedCard } | null>(null);
  const [limitHit, setLimitHit] = useState<CardPlan | null>(null);
  // cartão novo: confere o limite do plano (grátis 1 · Carta Completa 5 · Pacote Família à vontade)
  const setEditing = async (e: { template: TemplateId; saved?: SavedCard } | null) => {
    if (e && !e.saved) {
      const plan = await cardPlan();
      const count = (await listCards()).length;
      if (count >= CARD_LIMIT[plan]) return setLimitHit(plan);
    }
    setEditingRaw(e);
  };
  const [mine, setMine] = useState<SavedCard[]>([]);
  const refresh = () => listCards().then(setMine);
  useEffect(() => {
    refresh();
  }, []);

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-20" id="cartao">
      <span id="retrato" className="block relative -top-20" aria-hidden="true" />
      <Reveal className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
        <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#0B132B] bg-[#FFD166] rounded-full px-3 py-1 mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Novo · Cartão de Natal Premium
        </span>
        <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">O cartão de Natal da sua família</h2>
        <p className="text-sm sm:text-base text-[#EDF2F4]/80 leading-relaxed">
          Escolha um dos 9 modelos, coloque a foto de vocês e escreva a mensagem. Sai pronto para imprimir em A4, A5 ou A6, para o WhatsApp, o Instagram e até em vídeo.
        </p>
      </Reveal>
      <div className="mb-8 md:mb-10">
        <CardPlanStrip onPick={(p) => (p === "free" ? document.getElementById("cartao-galeria")?.scrollIntoView({ behavior: "smooth", block: "start" }) : onUpgrade?.())} />
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-8 items-start">
        {/* passo a passo + recursos */}
        <aside className="rounded-3xl border border-[#FFD166]/30 bg-[#0B132B]/80 p-5 sm:p-6 lg:sticky lg:top-24 order-2 lg:order-1">
          <h3 className="font-cinzel text-white font-bold text-lg mb-4">Como funciona</h3>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-1 gap-3 mb-5">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-3">
                <span className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD166] to-[#E9A13B] text-[#0B132B] font-extrabold text-sm flex items-center justify-center">{s.n}</span>
                <span>
                  <span className="block text-white font-bold text-sm leading-tight">{s.t}</span>
                  <span className="block text-[#EDF2F4]/60 text-xs leading-snug mt-0.5">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>
          <ul className="space-y-2 text-xs text-[#EDF2F4]/80 border-t border-white/10 pt-4 mb-4">
            <li className="flex items-center gap-2">
              <FileDown className="w-4 h-4 text-[#FFD166]" /> PDF 300 DPI: A4, A5, A6 ou personalizado
            </li>
            <li className="flex items-center gap-2">
              <ImageDown className="w-4 h-4 text-[#FFD166]" /> Imagem para WhatsApp, feed e Stories
            </li>
            <li className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#FFD166]" /> Vídeo animado com neve e música
            </li>
            <li className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#FFD166]" /> Compartilhe com a família
            </li>
          </ul>
          <p className="text-[11px] text-[#2DC653] flex gap-1.5 leading-snug">
            <ShieldCheck className="w-4 h-4 shrink-0" /> A foto fica só no seu aparelho. Não enviamos para nenhum servidor e você pode apagar quando quiser.
          </p>
        </aside>

        <div className="order-1 lg:order-2">
          {mine.length > 0 && (
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4" id="meus-cartoes">
              <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <FolderHeart className="w-4 h-4 text-[#FFD166]" /> Meus cartões (salvos neste aparelho)
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {mine.map((c) => (
                  <div key={c.id} className="shrink-0 w-28 sm:w-32">
                    <button onClick={() => setEditing({ template: c.template, saved: c })} className="block w-full cursor-pointer" aria-label={`Editar ${c.family}`}>
                      <img src={c.thumb} alt="" className="w-full h-auto rounded-md shadow-lg border border-white/10" />
                    </button>
                    <div className="flex items-center justify-between mt-1.5 gap-1">
                      <button onClick={() => setEditing({ template: c.template, saved: c })} className="text-[11px] text-[#FFD166] font-bold inline-flex items-center gap-1 cursor-pointer">
                        <Pencil className="w-3 h-3" /> Editar
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm("Apagar este cartão e a foto dele deste aparelho?")) return;
                          await deleteCard(c.id);
                          refresh();
                        }}
                        className="text-[11px] text-white/50 hover:text-red-300 inline-flex items-center gap-1 cursor-pointer"
                        aria-label="Apagar cartão"
                      >
                        <Trash2 className="w-3 h-3" /> Apagar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5" id="cartao-galeria">
            {TEMPLATES.map((t, i) => (
              <Reveal key={t.id} delay={0.03 * i}>
                <article className="group h-full flex flex-col rounded-2xl bg-gradient-to-b from-[#1C2541] to-[#0B132B] border border-white/10 hover:border-[#FFD166]/70 p-2.5 sm:p-3 transition-all hover:-translate-y-1 shadow-xl" data-card-model={t.id}>
                  <button onClick={() => setEditing({ template: t.id })} className="block w-full cursor-pointer rounded-md overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.45)]" aria-label={`Personalizar o modelo ${t.name}`}>
                    <img src={cardArt(t.id)} alt={`Modelo ${t.name}`} loading="lazy" className="block w-full h-auto aspect-[4/3] object-cover" />
                  </button>
                  <div className="pt-3 px-0.5 flex-1 flex flex-col">
                    <h3 className="font-cinzel font-bold text-white text-sm sm:text-base leading-tight">{t.name}</h3>
                    <p className="text-[11px] sm:text-xs text-[#EDF2F4]/60 leading-snug mt-1 mb-3 flex-1">{t.tagline}</p>
                    <button
                      onClick={() => setEditing({ template: t.id })}
                      className="w-full bg-gradient-to-r from-[#C1121F] to-[#8E0A18] hover:from-[#D90429] text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl inline-flex items-center justify-center gap-1.5 border border-[#FFD166]/40 cursor-pointer"
                      id={`card-edit-${t.id}`}
                    >
                      <Pencil className="w-3.5 h-3.5" /> Personalizar
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {limitHit && (
        <div className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setLimitHit(null)}>
          <div role="dialog" aria-modal="true" id="card-limit" className="w-full max-w-md rounded-3xl border-2 border-[#FFD166] bg-gradient-to-b from-[#1C2541] to-[#0B132B] p-6 text-white text-center">
            <CardFan art={limitHit === "free" ? CARD_ART.slice(0, 5) : CARD_ART} />
            <h3 className="mt-5 font-cinzel text-xl font-bold">{limitHit === "free" ? "Seu cartão grátis já foi criado" : "Vocês já criaram os 5 cartões"}</h3>
            <p className="mt-2 text-sm text-white/80">
              {limitHit === "free"
                ? `Com a Carta Completa (${priceLabel("natal")}) são até 5 cartões sem marca d'água. No Pacote Família (${priceLabel("familia")}) é à vontade, com todos os modelos.`
                : `No Pacote Família (${priceLabel("familia")}) os cartões são à vontade, com todos os 9 modelos. Vocês também podem apagar um cartão em Meus cartões para fazer outro.`}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              {onUpgrade && (
                <button onClick={() => (setLimitHit(null), onUpgrade())} className="rounded-full py-3 font-extrabold bg-gradient-to-r from-[#D90429] to-[#EF233C] border border-[#FFD166]/50 cursor-pointer" id="card-limit-upgrade">
                  Ver os planos
                </button>
              )}
              <button onClick={() => setLimitHit(null)} className="rounded-full py-2.5 text-sm font-semibold bg-white/10 hover:bg-white/15 cursor-pointer">
                Agora não
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <CardEditor
            key={editing.saved?.id ?? editing.template}
            template={editing.template}
            saved={editing.saved}
            onClose={() => {
              setEditingRaw(null);
              refresh();
            }}
            onSaved={refresh}
            onUpgrade={
              onUpgrade
                ? () => {
                    setEditingRaw(null);
                    setTimeout(onUpgrade, 250);
                  }
                : undefined
            }
          />
        )}
      </AnimatePresence>
    </section>
  );
}
