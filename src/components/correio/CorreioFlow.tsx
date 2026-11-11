import { useEffect, useRef, useState, type FormEvent } from "react";
import { AVULSA, NORMAL, brl } from "../../lib/pricing";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import { Camera, Check, Loader2, Mail, Printer, Sparkles, Type } from "lucide-react";
import BackButton from "../BackButton";
import ElfWorkshopLoader from "../ElfWorkshopLoader";
import { useBackClose } from "../../lib/backClose";
import { musicBox } from "../../lib/christmasMusic";
import { prettyCity, prettyName } from "../../lib/prettyText";
import { getAccessCode, setChildName as rememberChild } from "../../advent/access";
import { LETTER_THEMES } from "../../lib/letterThemes";
import { approveLetter, sendChildLetter, shrinkImage, WHEN_OPTIONS, fmtDelivery, type CorreioResult, type When } from "../../lib/correio";
import type { Letter } from "../../types";
import { createPortal } from "react-dom";

type Step = "dados" | "cartinha" | "lendo" | "recebida" | "agendar" | "pronto";

/** Fluxo do Correio do Polo Norte: dados → cartinha (foto ou texto) → carta recebida → prévia e agendamento. */
export default function CorreioFlow({ onClose, onOpenLetter, onSeePlans, onBuyAvulsa }: { onClose: () => void; onOpenLetter: (l: Letter) => void; onSeePlans: () => void; /** Resposta Mágica avulsa (R$ 4,90) */ onBuyAvulsa?: (l: Letter) => void }) {
  useBackClose(true, onClose);
  const [step, setStep] = useState<Step>("dados");
  const [childName, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [achievements, setAch] = useState("");
  const [parentNotes, setNotes] = useState("");
  const [theme, setTheme] = useState("classico");
  const [consent, setConsent] = useState(false);
  const [mode, setMode] = useState<"foto" | "texto">("foto");
  const [photo, setPhoto] = useState<{ base64: string; mime: string; preview: string } | null>(null);
  const [typed, setTyped] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [limit, setLimit] = useState(false);
  const [result, setResult] = useState<CorreioResult | null>(null);
  const [when, setWhen] = useState<When>("vespera");
  const [busy, setBusy] = useState(false);
  const [deliverAt, setDeliverAt] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const pickFile = async (f?: File | null) => {
    if (!f) return;
    setErr(null);
    try {
      const { base64, mime } = await shrinkImage(f);
      setPhoto({ base64, mime, preview: `data:${mime};base64,${base64}` });
    } catch {
      setErr("Não consegui abrir essa foto. Tente outra.");
    }
  };

  const submitDados = (e: FormEvent) => {
    e.preventDefault();
    if (!childName.trim() || !age || !city.trim() || !consent) return;
    rememberChild(prettyName(childName));
    setStep("cartinha");
  };

  const send = async () => {
    setErr(null);
    setLimit(false);
    if (mode === "foto" && !photo) return setErr("Tire ou escolha a foto da cartinha.");
    if (mode === "texto" && typed.trim().length < 10) return setErr("Digite o que a criança escreveu (pelo menos uma frase).");
    setStep("lendo");
    musicBox.sleighBells(1.6);
    try {
      const r = await sendChildLetter({
        childName: prettyName(childName),
        age: Number(age),
        city: prettyCity(city),
        achievements,
        parentNotes,
        theme,
        parentalConsent: true,
        accessCode: getAccessCode() || undefined,
        ...(mode === "foto" ? { imageBase64: photo!.base64, mime: photo!.mime } : { text: typed.trim() }),
      });
      setPhoto(null); // a foto não fica guardada nem aqui
      setResult(r);
      setStep("recebida");
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.4 }, zIndex: 130, colors: ["#FFD166", "#EF233C", "#2DC653", "#FFFFFF"] });
      [72, 76, 79, 84].forEach((n, i) => setTimeout(() => musicBox.chime(n, undefined, 0.16), i * 140));
    } catch (e: any) {
      setStep("cartinha");
      setErr(e.message);
      if (e.limit) setLimit(true);
    }
  };

  const approve = async () => {
    if (!result) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await approveLetter(result.token, when);
      setDeliverAt(r.deliverAt);
      setStep("pronto");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const inputCls = "w-full bg-[#1C2541] border border-white/20 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FFD166]";
  const first = prettyName(childName.trim().split(/\s+/)[0] || childName);

  return (
    <motion.div className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="bg-[#0B132B] border-2 border-[#FFD166] rounded-3xl w-full max-w-lg p-5 sm:p-8 relative text-left shadow-2xl my-auto text-white"
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        id="correio-flow"
      >
        <div className="flex justify-between items-center mb-3">
          <BackButton onClick={onClose} />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#FFD166]">📮 Correio do Polo Norte</span>
        </div>

        {step === "dados" && (
          <form onSubmit={submitDados} className="space-y-4 text-xs sm:text-sm">
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold">Seu filho escreveu para o Papai Noel?</h3>
            <p className="text-[#EDF2F4]/70">Mande a cartinha dele e o Papai Noel responde de verdade: citando o que ele escreveu, respondendo às perguntas e sem prometer presentes. Você vê a resposta antes de ela chegar.</p>
            <div>
              <label className="block font-semibold mb-1">Nome da criança *</label>
              <input required maxLength={30} value={childName} onChange={(e) => setName(e.target.value)} onBlur={() => setName((n) => (n.trim() ? prettyName(n) : n))} placeholder="Ex: Sofia" className={inputCls} id="correio-nome" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Idade *</label>
                <input required type="number" min={1} max={14} value={age} onChange={(e) => setAge(e.target.value)} className={inputCls} id="correio-idade" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Cidade *</label>
                <input required maxLength={60} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex: Curitiba" className={inputCls} id="correio-cidade" />
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Conquistas do ano (opcional)</label>
              <input maxLength={200} value={achievements} onChange={(e) => setAch(e.target.value)} placeholder="Ex: aprendeu a ler e passou de ano" className={inputCls} />
            </div>
            <div>
              <label className="block font-semibold mb-1">Recado dos pais (opcional)</label>
              <input maxLength={160} value={parentNotes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: Te amamos muito!" className={inputCls} />
            </div>
            <div>
              <label className="block font-semibold mb-1.5">Cor da carta</label>
              <div className="flex flex-wrap gap-2">
                {LETTER_THEMES.map((t) => (
                  <button key={t.id} type="button" onClick={() => setTheme(t.id)} className={`px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer ${theme === t.id ? "bg-white text-[#0B132B] border-white" : "border-white/25 text-white/85"}`}>
                    {t.emoji} {t.name}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-start gap-3 rounded-2xl bg-white/5 border border-white/15 p-3 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#FFD166]" id="correio-consent" />
              <span className="text-[11px] sm:text-xs text-white/85 leading-snug">
                Sou pai, mãe ou responsável e autorizo o uso da cartinha só para criar a resposta. <b>A foto é lida na hora e não fica guardada.</b> Não aparecem sobrenome, escola nem endereço.
              </span>
            </label>
            <button type="submit" disabled={!childName.trim() || !age || !city.trim() || !consent} className="w-full rounded-full py-3.5 font-extrabold bg-gradient-to-r from-[#D90429] to-[#EF233C] border border-[#FFD166]/50 disabled:opacity-50 cursor-pointer" id="correio-next">
              Continuar →
            </button>
          </form>
        )}

        {step === "cartinha" && (
          <div className="space-y-4 text-xs sm:text-sm">
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold">A cartinha de {first}</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setMode("foto")} className={`rounded-2xl p-3 border-2 text-left cursor-pointer ${mode === "foto" ? "border-[#FFD166] bg-[#FFD166]/10" : "border-white/15 bg-white/5"}`} id="correio-modo-foto">
                <Camera className="w-5 h-5 text-[#FFD166] mb-1" />
                <b className="block">Foto da cartinha</b>
                <span className="text-white/65">Escrita à mão, com desenhos</span>
              </button>
              <button onClick={() => setMode("texto")} className={`rounded-2xl p-3 border-2 text-left cursor-pointer ${mode === "texto" ? "border-[#FFD166] bg-[#FFD166]/10" : "border-white/15 bg-white/5"}`} id="correio-modo-texto">
                <Type className="w-5 h-5 text-[#FFD166] mb-1" />
                <b className="block">Digitar</b>
                <span className="text-white/65">A criança dita e você escreve</span>
              </button>
            </div>
            {mode === "foto" ? (
              <div>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => void pickFile(e.target.files?.[0])} id="correio-foto" />
                {photo ? (
                  <div className="relative rounded-2xl overflow-hidden border border-white/20">
                    <img src={photo.preview} alt="Cartinha" className="w-full max-h-72 object-contain bg-black/40" />
                    <button onClick={() => fileRef.current?.click()} className="absolute bottom-2 right-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold cursor-pointer">
                      Trocar foto
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()} className="w-full rounded-2xl border-2 border-dashed border-[#FFD166]/60 bg-[#FFD166]/5 p-8 text-center cursor-pointer hover:bg-[#FFD166]/10" id="correio-foto-btn">
                    <Camera className="w-10 h-10 text-[#FFD166] mx-auto mb-2" />
                    <b className="block">Tirar ou escolher a foto</b>
                    <span className="text-white/65 text-xs">Folha inteira, com luz e sem sombra</span>
                  </button>
                )}
                <p className="text-[11px] text-white/55 mt-2">
                  Ainda não escreveu? Imprima o{" "}
                  <a href="/papel-timbrado-polo-norte.pdf" target="_blank" rel="noreferrer" className="underline text-[#FFD166]">
                    papel timbrado do Polo Norte
                  </a>{" "}
                  grátis.
                </p>
              </div>
            ) : (
              <textarea value={typed} onChange={(e) => setTyped(e.target.value.slice(0, 1500))} rows={7} placeholder={`Ex.: Querido Papai Noel, eu sou a ${first || "Sofia"}... Este ano eu aprendi a... Eu queria ganhar... As renas comem cenoura?`} className={inputCls + " resize-none"} id="correio-texto" />
            )}
            {err && (
              <div className="rounded-2xl border border-[#FF8FA3]/60 bg-[#D90429]/15 px-4 py-3 text-white" role="alert">
                {err}{" "}
                {limit && (
                  <button onClick={onSeePlans} className="underline font-bold text-[#FFD166] cursor-pointer">
                    Liberar agora
                  </button>
                )}
              </div>
            )}
            <button onClick={() => void send()} className="w-full rounded-full py-3.5 font-extrabold bg-gradient-to-r from-[#D90429] to-[#EF233C] border border-[#FFD166]/50 inline-flex items-center justify-center gap-2 cursor-pointer" id="correio-enviar" data-celebrate>
              <Mail className="w-5 h-5" /> Enviar para o Polo Norte
            </button>
          </div>
        )}

        {step === "recebida" && result && (
          <div className="text-center space-y-4">
            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: -6 }} transition={{ type: "spring", stiffness: 220, damping: 12, delay: 0.1 }} className="mx-auto w-32 h-32 rounded-full border-4 border-double border-[#FFD166] grid place-items-center text-[#FFD166]">
              <div className="font-cinzel text-[9px] font-extrabold tracking-widest leading-tight">
                CORREIO DO
                <br />
                <span className="font-xmas text-2xl tracking-normal">Polo Norte</span>
                <br />
                RECEBIDA ✓
              </div>
            </motion.div>
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold">A cartinha de {first} chegou!</h3>
            {result.protocol && (
              <p className="text-[#FFD166] font-bold">
                Sua carta é a nº <span className="text-2xl font-cinzel">{result.protocol.toLocaleString("pt-BR")}</span> do Polo Norte
              </p>
            )}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-left text-xs sm:text-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#FFD166] mb-1">👨‍👩‍👧 Só para os pais: o que o Papai Noel entendeu</p>
              {result.wishes.pedidos.length > 0 && (
                <p>
                  <b>🎁 Pediu:</b> {result.wishes.pedidos.join(", ")}
                </p>
              )}
              {result.wishes.perguntas.length > 0 && (
                <p>
                  <b>❓ Perguntou:</b> {result.wishes.perguntas.join(" · ")}
                </p>
              )}
              {result.wishes.contou.length > 0 && (
                <p>
                  <b>💬 Contou:</b> {result.wishes.contou.join(", ")}
                </p>
              )}
              {!result.wishes.pedidos.length && !result.wishes.perguntas.length && <p className="text-white/70">“{result.childText.slice(0, 160)}{result.childText.length > 160 ? "…" : ""}”</p>}
            </div>
            {result.sensitive ? (
              <div className="rounded-2xl border border-[#FFD166]/60 bg-[#FFD166]/10 p-4 text-left text-xs sm:text-sm">
                <b>💛 Esta cartinha merece um cuidado especial.</b> A resposta do Papai Noel vai passar por uma revisão carinhosa da nossa equipe antes de ser liberada. Você pode ver a prévia agora; avisamos quando estiver pronta para entregar.
              </div>
            ) : null}
            {result.letter.plan === "free" && onBuyAvulsa && (
              <button onClick={() => onBuyAvulsa(result.letter)} className="w-full text-left rounded-2xl border-2 border-[#FFD166] bg-gradient-to-r from-[#2B0B10] to-[#1C2541] p-4 cursor-pointer hover:brightness-110" id="correio-comprar-avulsa">
                <span className="flex items-center justify-between gap-3">
                  <span>
                    <b className="block text-sm text-[#FFD166]">✨ Resposta Mágica completa</b>
                    <span className="block text-xs text-white/75 leading-snug">O Papai Noel lê a resposta inteira com a voz dele + PDF para imprimir</span>
                  </span>
                  <span className="text-right shrink-0">
                    <s className="block text-[11px] text-white/45">{brl(NORMAL.pro)}</s>
                    <b className="font-cinzel text-xl text-[#FFD166]">{brl(AVULSA)}</b>
                  </span>
                </span>
              </button>
            )}
            <div className="grid gap-2">
              <button onClick={() => onOpenLetter(result.letter)} className="w-full rounded-full py-3.5 font-extrabold bg-[#FFD166] text-[#0B132B] inline-flex items-center justify-center gap-2 cursor-pointer" id="correio-ver-previa">
                <Sparkles className="w-5 h-5" /> Ver a resposta do Papai Noel (prévia)
              </button>
              <button onClick={() => setStep("agendar")} disabled={result.sensitive} className="w-full rounded-full py-3.5 font-extrabold bg-gradient-to-r from-[#2DC653] to-[#1a9e3e] border border-[#FFD166]/50 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50" id="correio-aprovar">
                <Check className="w-5 h-5" /> Aprovar e escolher quando entregar
              </button>
            </div>
            <p className="text-[11px] text-white/55">A resposta só aparece para {first} depois que você aprovar. Até lá, só você vê.</p>
          </div>
        )}

        {step === "agendar" && result && (
          <div className="space-y-4">
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold">Quando a resposta chega para {first}?</h3>
            <div className="grid gap-2">
              {WHEN_OPTIONS.map((w) => (
                <button key={w.id} onClick={() => setWhen(w.id)} className={`flex items-center gap-3 rounded-2xl p-3 border-2 text-left cursor-pointer ${when === w.id ? "border-[#FFD166] bg-[#FFD166]/10" : "border-white/15 bg-white/5"}`} id={`correio-when-${w.id}`}>
                  <span className="text-2xl">{w.emoji}</span>
                  <span className="flex-1">
                    <b className="block text-sm">{w.title}</b>
                    <span className="text-xs text-white/65">{w.text}</span>
                  </span>
                  {when === w.id && <Check className="w-5 h-5 text-[#FFD166]" />}
                </button>
              ))}
            </div>
            {err && <p className="text-sm text-[#FF8FA3]">{err}</p>}
            <button onClick={() => void approve()} disabled={busy} className="w-full rounded-full py-3.5 font-extrabold bg-gradient-to-r from-[#2DC653] to-[#1a9e3e] border border-[#FFD166]/50 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60" id="correio-confirmar">
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />} Aprovar e agendar entrega
            </button>
            <button onClick={() => setStep("recebida")} className="w-full text-xs text-white/60 underline cursor-pointer">
              Voltar
            </button>
          </div>
        )}

        {step === "pronto" && result && (
          <div className="text-center space-y-4">
            <div className="text-6xl">🛷✨</div>
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold">{deliverAt ? "Entrega agendada!" : "Entregue!"}</h3>
            <p className="text-sm text-white/80">
              {deliverAt ? (
                <>
                  A resposta do Papai Noel chega para {first} em <b className="text-[#FFD166]">{fmtDelivery(deliverAt)}</b>. Até lá o link mostra “a carta está a caminho”.
                </>
              ) : (
                <>A resposta do Papai Noel já está liberada para {first}.</>
              )}
            </p>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-xs text-left">
              <b>Link da carta</b> (mande para {first} na hora certa, ou para os avós):
              <div className="mt-1 break-all text-[#FFD166] select-all">{`${window.location.origin}/natal/${result.token}`}</div>
            </div>
            {result.letter.plan === "free" && onBuyAvulsa && (
              <button onClick={() => onBuyAvulsa(result.letter)} className="w-full text-left rounded-2xl border-2 border-[#FFD166] bg-gradient-to-r from-[#2B0B10] to-[#1C2541] p-4 cursor-pointer hover:brightness-110" id="correio-comprar-avulsa">
                <span className="flex items-center justify-between gap-3">
                  <span>
                    <b className="block text-sm text-[#FFD166]">✨ Resposta Mágica completa</b>
                    <span className="block text-xs text-white/75 leading-snug">O Papai Noel lê a resposta inteira com a voz dele + PDF para imprimir</span>
                  </span>
                  <span className="text-right shrink-0">
                    <s className="block text-[11px] text-white/45">{brl(NORMAL.pro)}</s>
                    <b className="font-cinzel text-xl text-[#FFD166]">{brl(AVULSA)}</b>
                  </span>
                </span>
              </button>
            )}
            <div className="grid gap-2">
              <a href={`https://wa.me/?text=${encodeURIComponent(`🎅 Chegou uma carta do Papai Noel para ${first}! ${window.location.origin}/natal/${result.token}`)}`} target="_blank" rel="noreferrer" className="w-full rounded-full py-3 font-extrabold bg-[#25D366] text-[#0B132B]">
                Mandar no WhatsApp
              </a>
              <button onClick={() => onOpenLetter(result.letter)} className="w-full rounded-full py-3 font-bold bg-white/10 hover:bg-white/15 inline-flex items-center justify-center gap-2 cursor-pointer">
                <Printer className="w-4 h-4" /> Abrir, ouvir e baixar o PDF
              </button>
              <button onClick={onClose} className="text-xs text-white/60 underline cursor-pointer">
                Fechar
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {step === "lendo" && createPortal(<AnimatePresence><ElfWorkshopLoader key="elf" childName={first} achievement={achievements} /></AnimatePresence>, document.body)}
    </motion.div>
  );
}
