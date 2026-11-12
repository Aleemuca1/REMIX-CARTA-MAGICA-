import { useEffect, useRef, useState } from "react";
import { AVULSA, NORMAL, brl } from "../../lib/pricing";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import { Camera, Check, Eraser, Loader2, Mail, Mic, PenLine, Printer, Sparkles, Undo2 } from "lucide-react";
import BackButton from "../BackButton";
import ElfWorkshopLoader from "../ElfWorkshopLoader";
import { useBackClose } from "../../lib/backClose";
import { musicBox } from "../../lib/christmasMusic";
import { prettyName } from "../../lib/prettyText";
import { getAccessCode, setChildName as rememberChild } from "../../advent/access";
import { approveLetter, sendChildLetter, shrinkImage, WHEN_OPTIONS, fmtDelivery, type CorreioResult, type When } from "../../lib/correio";
import type { Letter } from "../../types";
import { createPortal } from "react-dom";

type Step = "dados" | "cartinha" | "lendo" | "recebida" | "agendar" | "pronto";

/** Fluxo do Correio do Polo Norte: dados → cartinha (foto ou texto) → carta recebida → prévia e agendamento. */
/** Prévia do Certificado de Bom Comportamento com o nome da criança (o PDF vem na Resposta Mágica). */
function CertThumb({ letter }: { letter: Letter }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    import("../../lib/certificate")
      .then(({ renderGoodCertificate }) => renderGoodCertificate(letter))
      .then((c) => alive && setSrc(c.toDataURL("image/jpeg", 0.7)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [letter]);
  if (!src) return null;
  return (
    <span className="block relative mb-3">
      <img src={src} alt="Certificado de Bom Comportamento" className="w-full rounded-lg shadow-lg rotate-[-1.5deg]" />
      <span className="absolute top-2 right-2 bg-[#D90429] text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full px-2 py-0.5">🏅 incluso</span>
    </span>
  );
}

export default function CorreioFlow({ onClose, onOpenLetter, onSeePlans, onBuyAvulsa }: { onClose: () => void; onOpenLetter: (l: Letter) => void; onSeePlans: () => void; /** Resposta Mágica avulsa (R$ 4,90) */ onBuyAvulsa?: (l: Letter) => void }) {
  useBackClose(true, onClose);
  const [step, setStep] = useState<Step>("cartinha");
  const [childName, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [mode, setMode] = useState<"foto" | "texto">("texto");
  const [undo, setUndo] = useState("");
  const paperRef = useRef<HTMLTextAreaElement | null>(null);
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

  // ditado: a criança fala e o texto aparece no papel (Chrome/Android/Edge; some quando o navegador não tem)
  const SR = typeof window !== "undefined" ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;
  const canListen = !!SR;
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);
  const toggleListen = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    try {
      const rec = new SR();
      rec.lang = "pt-BR";
      rec.continuous = true;
      rec.interimResults = false;
      rec.onresult = (ev: any) => {
        let add = "";
        for (let i = ev.resultIndex; i < ev.results.length; i++) if (ev.results[i].isFinal) add += ev.results[i][0].transcript;
        if (add.trim()) setTyped((t) => (t ? `${t.trimEnd()} ${add.trim()}` : add.trim().replace(/^./, (c: string) => c.toUpperCase())).slice(0, 1500));
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };
  useEffect(() => () => recRef.current?.stop?.(), []);

  const send = async () => {
    setErr(null);
    setLimit(false);
    recRef.current?.stop?.();
    if (!childName.trim()) return setErr("Escreva o nome da criança.");
    if (!consent) return setErr("Marque a autorização do responsável para enviar.");
    rememberChild(prettyName(childName));
    if (mode === "foto" && !photo) return setErr("Tire ou escolha a foto da cartinha.");
    if (mode === "texto" && typed.trim().length < 10) return setErr("Escreva a cartinha (pelo menos uma frase) ou toque em Falar a cartinha.");
    setStep("lendo");
    musicBox.sleighBells(1.6);
    try {
      const r = await sendChildLetter({
        childName: prettyName(childName),
        theme: "classico",
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

        {step === "cartinha" && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold leading-tight">Escreva para o Papai Noel</h3>
              <p className="text-white/70 mt-1">Ele lê com carinho, responde cada pergunta e assina. Você vê a resposta antes de ela chegar.</p>
            </div>

            <label className="block">
              <span className="block font-semibold mb-1">Nome da criança</span>
              <input maxLength={30} value={childName} onChange={(e) => (setName(e.target.value), setErr(null))} onBlur={() => setName((n) => (n.trim() ? prettyName(n) : n))} placeholder="Ex: Pedro" className={inputCls} id="correio-nome" autoComplete="off" />
            </label>

            <div className="grid grid-cols-2 gap-2" role="tablist">
              <button onClick={() => setMode("texto")} className={`rounded-2xl p-3 border-2 text-left cursor-pointer transition-colors ${mode === "texto" ? "border-[#FFD166] bg-[#FFD166]/10" : "border-white/15 bg-white/5 hover:bg-white/10"}`} id="correio-modo-texto" role="tab" aria-selected={mode === "texto"}>
                <PenLine className="w-5 h-5 text-[#FFD166] mb-1" />
                <b className="block">Escrever aqui</b>
                <span className="text-white/65">Digitando ou falando</span>
              </button>
              <button onClick={() => setMode("foto")} className={`rounded-2xl p-3 border-2 text-left cursor-pointer transition-colors ${mode === "foto" ? "border-[#FFD166] bg-[#FFD166]/10" : "border-white/15 bg-white/5 hover:bg-white/10"}`} id="correio-modo-foto" role="tab" aria-selected={mode === "foto"}>
                <Camera className="w-5 h-5 text-[#FFD166] mb-1" />
                <b className="block">Foto da cartinha</b>
                <span className="text-white/65">Escrita à mão, com desenhos</span>
              </button>
            </div>

            {mode === "texto" ? (
              <div>
                {/* papel de carta de verdade: pautado, margem vermelha e letra de mão */}
                <div className="relative rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.45)] bg-[#FFFBF0] text-[#22305A]" id="correio-papel">
                  <div className="absolute inset-y-0 left-10 w-px bg-[#E5484D]/50" aria-hidden="true" />
                  <div className="absolute top-2 right-3 text-[10px] font-cinzel font-bold tracking-widest text-[#B8111F]/70" aria-hidden="true">
                    ✦ POLO NORTE ✦
                  </div>
                  <p className="font-ps text-2xl pl-12 pr-4 pt-6 leading-9">Querido Papai Noel,</p>
                  <textarea
                    ref={paperRef}
                    value={typed}
                    onChange={(e) => setTyped(e.target.value.slice(0, 1500))}
                    rows={7}
                    placeholder={`eu sou ${childName.trim() ? prettyName(childName.trim().split(/\s+/)[0]) : "o Pedro"}... Este ano eu aprendi a... Eu queria ganhar... As renas comem cenoura?`}
                    className="block w-full bg-transparent pl-12 pr-4 pb-2 font-ps text-[22px] leading-9 text-[#22305A] placeholder:text-[#22305A]/35 resize-none focus:outline-none"
                    style={{ backgroundImage: "repeating-linear-gradient(transparent 0 35px, rgba(34,48,90,0.16) 35px 36px)", backgroundAttachment: "local" }}
                    id="correio-texto"
                  />
                  <p className="font-ps text-2xl text-right pr-5 pb-4 leading-9">
                    Com carinho, <span className="text-[#B8111F]">{first || "____"}</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  {canListen && (
                    <button onClick={toggleListen} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 font-bold border cursor-pointer ${listening ? "bg-[#D90429] border-[#FF8FA3] animate-pulse" : "bg-white/10 border-white/15 hover:bg-white/15"}`} id="correio-falar">
                      <Mic className="w-4 h-4" /> {listening ? "Ouvindo... toque para parar" : "Falar a cartinha"}
                    </button>
                  )}
                  {typed && (
                    <button
                      onClick={() => {
                        setUndo(typed);
                        setTyped("");
                        paperRef.current?.focus();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 font-bold bg-white/10 border border-white/15 hover:bg-white/15 cursor-pointer"
                      id="correio-apagar"
                    >
                      <Eraser className="w-4 h-4" /> Apagar e começar de novo
                    </button>
                  )}
                  {!typed && undo && (
                    <button onClick={() => (setTyped(undo), setUndo(""))} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 font-bold bg-white/10 border border-white/15 hover:bg-white/15 cursor-pointer" id="correio-desfazer">
                      <Undo2 className="w-4 h-4" /> Desfazer
                    </button>
                  )}
                  <span className="ml-auto text-[11px] text-white/45">{typed.length}/1500</span>
                </div>
              </div>
            ) : (
              <div>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => void pickFile(e.target.files?.[0])} id="correio-foto" />
                {photo ? (
                  <div className="relative rounded-2xl overflow-hidden border border-white/20">
                    <img src={photo.preview} alt="Cartinha" className="w-full max-h-72 object-contain bg-black/40" />
                    <div className="absolute bottom-2 right-2 flex gap-2">
                      <button onClick={() => setPhoto(null)} className="rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold cursor-pointer inline-flex items-center gap-1" id="correio-foto-remover">
                        <Eraser className="w-3.5 h-3.5" /> Remover
                      </button>
                      <button onClick={() => fileRef.current?.click()} className="rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold cursor-pointer">
                        Trocar foto
                      </button>
                    </div>
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
            )}

            <label className="flex items-start gap-3 rounded-2xl bg-white/5 border border-white/15 p-3 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => (setConsent(e.target.checked), setErr(null))} className="mt-0.5 w-4 h-4 accent-[#FFD166]" id="correio-consent" />
              <span className="text-[11px] text-white/80 leading-snug">
                Sou pai, mãe ou responsável e autorizo o uso da cartinha só para criar a resposta. A foto é lida na hora e não fica guardada.
              </span>
            </label>

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
                <CertThumb letter={result.letter} />
                <span className="flex items-center justify-between gap-3">
                  <span>
                    <b className="block text-sm text-[#FFD166]">✨ Resposta Mágica · até 2 cartinhas</b>
                    <span className="block text-xs text-white/80 leading-snug mt-0.5">🔊 O Papai Noel lê a resposta inteira com a voz dele</span>
                    <span className="block text-xs text-white/80 leading-snug">📄 PDF para imprimir · 🏅 Certificado de Bom Comportamento</span>
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
                <CertThumb letter={result.letter} />
                <span className="flex items-center justify-between gap-3">
                  <span>
                    <b className="block text-sm text-[#FFD166]">✨ Resposta Mágica · até 2 cartinhas</b>
                    <span className="block text-xs text-white/80 leading-snug mt-0.5">🔊 O Papai Noel lê a resposta inteira com a voz dele</span>
                    <span className="block text-xs text-white/80 leading-snug">📄 PDF para imprimir · 🏅 Certificado de Bom Comportamento</span>
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

      {step === "lendo" && createPortal(<AnimatePresence><ElfWorkshopLoader key="elf" childName={first} /></AnimatePresence>, document.body)}
    </motion.div>
  );
}
