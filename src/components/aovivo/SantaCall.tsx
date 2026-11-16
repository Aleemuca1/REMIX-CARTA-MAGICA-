import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, Camera, Check, Keyboard, Loader2, Mail, Mic, PhoneCall, PhoneOff, Send, ShieldCheck, Star } from "lucide-react";
import { useBackClose } from "../../lib/backClose";
import { prettyName } from "../../lib/prettyText";
import { getChildName, setChildName as rememberChild } from "../../advent/access";
import { musicBox } from "../../lib/christmasMusic";
import { brl } from "../../lib/pricing";
import { canvasToBlob, ensureFonts, safeName, shareOrDownload } from "../../lib/shareKit";
import { CallError, ageFrom, callStatus, playReply, saveCallToken, talk, type Answers, type Kind, type Reply } from "../../lib/aovivo";

type Stage = "porta" | "tocando" | "chamada" | "fim";
const IMG = "/aovivo/noel.webp";
const QUESTIONS: { key: keyof Answers; label: string; hint: string }[] = [
  { key: "idade", label: "Idade", hint: "Quantos anos você tem?" },
  { key: "bom", label: "Uma coisa boa", hint: "Uma coisa boa que você fez este ano" },
  { key: "pedido", label: "Pedido de Natal", hint: "O que você quer pedir de Natal?" },
];

/**
 * Papai Noel Ao Vivo: "ligação" guiada. Ele chama a criança pelo nome, faz 3 perguntas
 * (idade, uma coisa boa e o pedido), a criança responde no microfone e ele responde juntando tudo.
 */
export default function SantaCall({
  onClose,
  onUpgrade,
  onBuyCall,
  onMakeLetter,
}: {
  onClose: () => void;
  onUpgrade: () => void;
  /** Ligação avulsa (R$ 5,90) */
  onBuyCall: (childName: string) => void;
  /** abre a criação da carta já com o que a criança contou */
  onMakeLetter: () => void;
}) {
  useBackClose(true, onClose);
  const [stage, setStage] = useState<Stage>("porta");
  const [name, setName] = useState(getChildName() || "");
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [paywall, setPaywall] = useState<null | "novo" | "usado">(null);
  const [typing, setTyping] = useState(false);
  const [typed, setTyped] = useState("");
  const [left, setLeft] = useState(120);
  const [total, setTotal] = useState(120);
  const [ask, setAsk] = useState(0); // pergunta atual (1 a 3); 0 = nenhuma; 4 = conversa livre
  const [answers, setAnswers] = useState<Answers>({ idade: "", bom: "", pedido: "" });
  const [info, setInfo] = useState<{ chamadas: number; preco: number }>({ chamadas: 0, preco: 5.9 });
  const audio = useRef<HTMLAudioElement | null>(null);
  const stopped = useRef(false);
  const story = useRef(0);
  const history = useRef<{ from: "c" | "n"; text: string }[]>([]);
  const answersRef = useRef<Answers>({ idade: "", bom: "", pedido: "" });
  const recRef = useRef<any>(null);
  const photoRef = useRef<HTMLInputElement | null>(null);
  const first = prettyName(name.trim().split(/\s+/)[0] || "");
  const SR = typeof window !== "undefined" ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;
  const busy = speaking || thinking;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    void callStatus().then((s) => setInfo({ chamadas: s.chamadas, preco: s.preco }));
    return () => {
      document.body.style.overflow = "";
      stopped.current = true;
      audio.current?.pause();
      recRef.current?.stop?.();
      window.speechSynthesis?.cancel?.();
    };
  }, []);

  // relógio regressivo: no fim do tempo o Papai Noel se despede
  useEffect(() => {
    if (stage !== "chamada" || paywall) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [stage, paywall]);
  useEffect(() => {
    if (stage === "chamada" && !paywall && left === 0 && !busy) void say("tchau");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, busy]);

  const speak = async (r: Reply) => {
    history.current.push({ from: "n", text: r.text });
    setCaption(r.text);
    setThinking(false);
    setSpeaking(true);
    if (audio.current) await playReply(audio.current, r, () => stopped.current);
    setSpeaking(false);
  };

  const say = async (kind: Kind, extra: { said?: string; n?: number } = {}) => {
    if (busy) return;
    setErr(null);
    setThinking(true);
    recRef.current?.stop?.();
    try {
      const r = await talk({ kind, childName: first, ...extra, story: story.current, answers: answersRef.current, history: history.current });
      if (kind === "historia") story.current += 1;
      if (r.limit) {
        setThinking(false);
        return void say("tchau");
      }
      if (extra.said) history.current.push({ from: "c", text: extra.said });
      if (kind === "ola") {
        if (r.paid) {
          setLeft(r.seconds ?? 120);
          setTotal(r.seconds ?? 120);
        }
      }
      await speak(r);
      if (r.done) {
        saveCallToken("");
        return setStage("fim");
      }
      if (kind === "ola" && !r.paid) return setPaywall(r.used ? "usado" : "novo");
      if (r.ask) setAsk(r.ask);
      if (r.final || r.sensitive) setAsk(4);
    } catch (e: any) {
      setThinking(false);
      setSpeaking(false);
      if (e instanceof CallError && e.paywall) setPaywall("novo");
      else setErr(e.message);
    }
  };

  /** a criança respondeu (falando ou digitando) */
  const heard = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    if (ask >= 1 && ask <= 3) {
      const key = QUESTIONS[ask - 1].key;
      answersRef.current = { ...answersRef.current, [key]: t };
      setAnswers(answersRef.current);
      history.current.push({ from: "c", text: t });
      musicBox.chime(84, undefined, 0.1);
      if (ask < 3) void say("pergunta", { n: ask + 1 });
      else void say("resposta");
    } else void say("conversa", { said: t });
  };

  const answer = () => {
    if (!first) return setErr("Escreva o nome da criança.");
    if (!consent) return setErr("Marque que um responsável está junto.");
    rememberChild(first);
    setErr(null);
    setStage("tocando");
    // o toque do responsável libera o som no celular
    audio.current?.play().catch(() => {});
    musicBox.sleighBells(1.4);
    setTimeout(() => {
      setStage("chamada");
      void say("ola");
    }, 1900);
  };

  const listen = () => {
    if (busy) return;
    if (!SR) return setTyping(true);
    if (listening) return recRef.current?.stop?.();
    try {
      const rec = new SR();
      rec.lang = "pt-BR";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      let got = "";
      rec.onresult = (ev: any) => {
        got = String(ev.results?.[0]?.[0]?.transcript || "").trim();
      };
      rec.onend = () => {
        setListening(false);
        if (got) heard(got);
      };
      rec.onerror = () => {
        setListening(false);
        setTyping(true);
      };
      recRef.current = rec;
      rec.start();
      setListening(true);
      musicBox.chime(88, undefined, 0.1);
    } catch {
      setTyping(true);
    }
  };

  const sendTyped = () => {
    const t = typed.trim();
    if (!t) return;
    setTyped("");
    heard(t);
  };

  const toLetter = () => {
    try {
      sessionStorage.setItem("cm-prefill-child", JSON.stringify({ name: first, age: ageFrom(answers.idade), achievements: answers.bom, gift: answers.pedido }));
    } catch {
      /* ok */
    }
    onMakeLetter();
  };

  // foto-lembrança: montada só no aparelho (a foto da criança não sai daqui)
  const makePhoto = async (file?: File | null) => {
    try {
      await ensureFonts();
      const W = 1080, H = 1350;
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const g = c.getContext("2d")!;
      const load = (src: string) =>
        new Promise<HTMLImageElement>((ok, no) => {
          const i = new Image();
          i.onload = () => ok(i);
          i.onerror = no;
          i.src = src;
        });
      const santa = await load(IMG);
      const sc = Math.max(W / santa.width, H / santa.height);
      g.drawImage(santa, (W - santa.width * sc) / 2, 0, santa.width * sc, santa.height * sc);
      const grad = g.createLinearGradient(0, H * 0.5, 0, H);
      grad.addColorStop(0, "rgba(6,11,25,0)");
      grad.addColorStop(1, "rgba(6,11,25,0.95)");
      g.fillStyle = grad;
      g.fillRect(0, H * 0.5, W, H * 0.5);
      if (file) {
        const kid = await load(URL.createObjectURL(file));
        const R = 210, cx = W - 270, cy = H - 520;
        g.save();
        g.beginPath();
        g.arc(cx, cy, R, 0, Math.PI * 2);
        g.clip();
        const ks = Math.max((R * 2) / kid.width, (R * 2) / kid.height);
        g.drawImage(kid, cx - (kid.width * ks) / 2, cy - (kid.height * ks) / 2, kid.width * ks, kid.height * ks);
        g.restore();
        g.lineWidth = 12;
        g.strokeStyle = "#FFD166";
        g.beginPath();
        g.arc(cx, cy, R, 0, Math.PI * 2);
        g.stroke();
      }
      g.textAlign = "center";
      g.fillStyle = "#FFD166";
      g.font = "800 76px Cinzel, Georgia, serif";
      g.fillText(`${first || "Eu"} falou com o`, W / 2, H - 200);
      g.fillStyle = "#FFFFFF";
      g.font = "800 96px Cinzel, Georgia, serif";
      g.fillText("Papai Noel!", W / 2, H - 100);
      g.font = "700 34px 'Plus Jakarta Sans', sans-serif";
      g.fillStyle = "rgba(255,255,255,0.85)";
      g.fillText("cartamagicanatal.com.br", W / 2, H - 42);
      const blob = await canvasToBlob(c, "image/jpeg", 0.9);
      await shareOrDownload(blob, `papai-noel-${safeName(first || "natal")}.jpg`, `${first || "Meu filho"} falou com o Papai Noel!`, "Papai Noel Ao Vivo");
    } catch {
      setErr("Não consegui montar a foto. Tente de novo.");
    }
  };

  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  const anyAnswer = Boolean(answers.idade || answers.bom || answers.pedido);
  const guided = ask >= 1 && ask <= 3;
  const hint = listening ? "Estou ouvindo... fale agora!" : busy ? "" : guided ? `Aperte o microfone e responda: ${QUESTIONS[ask - 1].hint.toLowerCase()}` : "Aperte o microfone para falar";

  return (
    <motion.div className="fixed inset-0 z-[125] bg-[#060B19] text-white flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} id="aovivo">
      <audio ref={audio} preload="none" className="hidden" />
      <input ref={photoRef} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => void makePhoto(e.target.files?.[0])} />
      <div className="relative w-full h-full sm:max-w-[430px] sm:h-[92dvh] sm:rounded-[36px] overflow-hidden sm:border-2 sm:border-[#FFD166]/50 shadow-2xl bg-black">
        <motion.img
          src={IMG}
          alt="Papai Noel"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "72% top" }}
          animate={speaking ? { scale: [1.04, 1.07, 1.04] } : { scale: 1.04 }}
          transition={speaking ? { duration: 0.9, repeat: Infinity } : { duration: 0.6 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#060B19]" />

        {/* topo */}
        <div className="absolute top-0 inset-x-0 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-cinzel font-extrabold text-lg leading-tight drop-shadow">Papai Noel</p>
              <p className="text-[11px] font-bold text-[#FFD166] tracking-widest">AO VIVO · IA</p>
            </div>
            {stage === "chamada" && !paywall && (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold shadow-lg ${left <= 20 ? "bg-[#FFD166] text-[#0B132B]" : "bg-[#D90429]"}`} id="aovivo-relogio">
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" /> {mmss}
              </span>
            )}
          </div>
          {stage === "chamada" && !paywall && (
            <div className="mt-2 h-1 rounded-full bg-white/20 overflow-hidden" aria-hidden="true">
              <div className="h-full bg-[#FFD166] transition-[width] duration-1000 ease-linear" style={{ width: `${(left / total) * 100}%` }} />
            </div>
          )}
        </div>

        {/* porta dos pais */}
        {stage === "porta" && (
          <div className="absolute inset-x-0 bottom-0 p-5 pb-7 bg-gradient-to-t from-[#060B19] via-[#060B19]/95 to-transparent pt-16">
            <h2 className="font-cinzel text-2xl font-bold leading-tight">O Papai Noel quer falar com o seu filho</h2>
            <p className="text-sm text-white/75 mt-1">Ele chama pelo nome, pergunta a idade, o que a criança fez de bom e o pedido de Natal. E responde com a voz dele.</p>
            <label className="block mt-4">
              <span className="block text-xs font-bold mb-1">Nome da criança</span>
              <input value={name} maxLength={20} onChange={(e) => (setName(e.target.value), setErr(null))} placeholder="Ex: Benjamim" className="w-full bg-[#1C2541] border border-white/25 rounded-xl px-3.5 py-3 text-white focus:outline-none focus:border-[#FFD166]" id="aovivo-nome" autoComplete="off" />
            </label>
            <label className="flex items-start gap-2.5 mt-3 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => (setConsent(e.target.checked), setErr(null))} className="mt-0.5 w-4 h-4 accent-[#FFD166]" id="aovivo-consent" />
              <span className="text-[11px] text-white/80 leading-snug">Sou pai, mãe ou responsável e estou junto. É uma conversa com inteligência artificial. O que a criança fala não é gravado nem guardado.</span>
            </label>
            {err && <p className="mt-2 text-sm text-[#FF8FA3]" role="alert">{err}</p>}
            <div className="mt-4 flex gap-2">
              <button onClick={onClose} className="rounded-full px-5 py-3.5 font-bold bg-white/10 hover:bg-white/15 cursor-pointer">Voltar</button>
              <button onClick={answer} className="flex-1 rounded-full py-3.5 font-extrabold bg-[#2DC653] text-[#06240F] inline-flex items-center justify-center gap-2 cursor-pointer animate-soft-pulse" id="aovivo-atender">
                <PhoneCall className="w-5 h-5" /> Atender a chamada
              </button>
            </div>
            <p className="mt-3 text-center text-[11px] text-white/60" id="aovivo-info">
              {info.chamadas > 0 ? `Vocês têm ${info.chamadas} ${info.chamadas === 1 ? "ligação" : "ligações"} de 2 minutos` : `A saudação com o nome é grátis · Ligação completa por ${brl(info.preco)}`}
            </p>
          </div>
        )}

        {stage === "tocando" && (
          <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-4">
            <motion.span animate={{ scale: [1, 1.18, 1], rotate: [0, -12, 12, 0] }} transition={{ duration: 0.7, repeat: Infinity }} className="grid place-items-center w-24 h-24 rounded-full bg-[#2DC653]">
              <PhoneCall className="w-11 h-11 text-white" />
            </motion.span>
            <p className="font-cinzel text-xl font-bold">Ligando para o Polo Norte...</p>
          </div>
        )}

        {/* chamada */}
        {stage === "chamada" && (
          <div className="absolute inset-x-0 bottom-0 p-4 pb-6 bg-gradient-to-t from-[#060B19] via-[#060B19]/92 to-transparent pt-20">
            {/* o que a criança já contou */}
            {!paywall && (ask >= 1 || anyAnswer) && (
              <div className="mb-2 grid grid-cols-3 gap-1.5" id="aovivo-passos">
                {QUESTIONS.map((q, i) => {
                  const done = Boolean(answers[q.key]);
                  const now = ask === i + 1;
                  return (
                    <div key={q.key} className={`rounded-xl px-2 py-1.5 border text-center ${done ? "bg-[#2DC653]/20 border-[#2DC653]/70" : now ? "bg-[#FFD166]/20 border-[#FFD166]" : "bg-black/40 border-white/15"}`}>
                      <p className="text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1">
                        {done && <Check className="w-3 h-3 text-[#2DC653]" />} {q.label}
                      </p>
                      <p className="text-[11px] text-white/85 truncate">{answers[q.key] || (now ? "sua vez!" : "...")}</p>
                    </div>
                  );
                })}
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div key={caption.slice(0, 24) + String(thinking)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl border border-[#7DE3F4]/60 bg-[#0B132B]/85 backdrop-blur px-4 py-3 shadow-[0_0_24px_rgba(125,227,244,0.25)] max-h-36 overflow-y-auto" id="aovivo-fala">
                <div className="flex items-start gap-3">
                  <span className="flex items-end gap-[3px] h-6 shrink-0 mt-1" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.span key={i} className="w-[3px] rounded-full bg-[#7DE3F4]" animate={speaking ? { height: [6, 22, 10, 18, 6] } : { height: 6 }} transition={speaking ? { duration: 0.6, repeat: Infinity, delay: i * 0.09 } : { duration: 0.2 }} />
                    ))}
                  </span>
                  <p className="text-[15px] leading-snug font-semibold">{thinking ? "O Papai Noel está pensando..." : caption || "..."}</p>
                </div>
              </motion.div>
            </AnimatePresence>
            {err && <p className="mt-2 text-sm text-[#FF8FA3]" role="alert">{err}</p>}

            {paywall ? (
              <div className="mt-3 rounded-2xl border-2 border-[#FFD166] bg-[#1C2541] p-4 text-center" id="aovivo-paywall">
                <p className="font-bold text-lg leading-tight">{paywall === "usado" ? `Quer mais uma ligação para ${first}?` : `O Papai Noel quer conversar com ${first}!`}</p>
                <ul className="mt-2 text-left text-[13px] text-white/90 space-y-1">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-[#2DC653] shrink-0 mt-0.5" /> Ele pergunta a idade, o que {first} fez de bom e o pedido</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-[#2DC653] shrink-0 mt-0.5" /> Responde com a voz dele, dizendo o nome</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-[#2DC653] shrink-0 mt-0.5" /> História de Natal e foto-lembrança</li>
                </ul>
                <button onClick={() => onBuyCall(first)} className="mt-3 w-full rounded-full py-3.5 font-extrabold bg-[#2DC653] text-[#06240F] inline-flex items-center justify-center gap-2 cursor-pointer animate-soft-pulse" id="aovivo-comprar">
                  <PhoneCall className="w-5 h-5" /> Continuar a ligação · {brl(info.preco)}
                </button>
                <p className="mt-2 text-[11px] text-white/65">Pix ou cartão, pagamento único · 1 ligação de 2 minutos</p>
                <button onClick={() => (onClose(), setTimeout(onUpgrade, 250))} className="mt-2 text-xs underline text-[#FFD166] cursor-pointer" id="aovivo-planos">
                  Ou veja os planos: carta completa + ligação
                </button>
              </div>
            ) : (
              <>
                {ask === 4 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button disabled={busy} onClick={() => void say("historia")} className="rounded-full px-2 py-2.5 text-[12px] font-bold border bg-white/10 border-[#FFD166]/50 hover:bg-white/15 inline-flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50" id="aovivo-historia">
                      <BookOpen className="w-4 h-4" /> História
                    </button>
                    <button disabled={busy} onClick={() => photoRef.current?.click()} className="rounded-full px-2 py-2.5 text-[12px] font-bold border bg-white/10 border-[#FFD166]/50 hover:bg-white/15 inline-flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50" id="aovivo-foto">
                      <Camera className="w-4 h-4" /> Foto
                    </button>
                    <button disabled={busy} onClick={() => setCaption(`Estou ouvindo, ${first}! Aperte o microfone e fale.`)} className="rounded-full px-2 py-2.5 text-[12px] font-bold border bg-white/10 border-[#FFD166]/50 hover:bg-white/15 inline-flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50" id="aovivo-conversa">
                      <Star className="w-4 h-4" /> Conversar
                    </button>
                  </div>
                )}
                {typing && (
                  <div className="mt-3 flex gap-2">
                    <input value={typed} maxLength={200} onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendTyped()} placeholder={guided ? QUESTIONS[ask - 1].hint : "Escreva para o Papai Noel"} className="flex-1 bg-[#1C2541] border border-white/25 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#FFD166]" id="aovivo-texto" />
                    <button onClick={sendTyped} disabled={busy} className="grid place-items-center w-11 h-11 rounded-full bg-[#FFD166] text-[#0B132B] cursor-pointer disabled:opacity-50" aria-label="Enviar" id="aovivo-enviar">
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* controles */}
            <div className="mt-4 flex items-center justify-center gap-5">
              {!paywall && (
                <button onClick={() => setTyping((v) => !v)} className="grid place-items-center w-12 h-12 rounded-full bg-white/15 cursor-pointer" aria-label="Escrever">
                  <Keyboard className="w-5 h-5" />
                </button>
              )}
              {!paywall && (
                <button onClick={listen} disabled={busy} className={`grid place-items-center w-[72px] h-[72px] rounded-full cursor-pointer disabled:opacity-50 ${listening ? "bg-[#2DC653] animate-pulse" : "bg-white text-[#0B132B]"} ${!busy && !listening && guided ? "ring-4 ring-[#FFD166] animate-soft-pulse" : ""}`} aria-label={listening ? "Parar" : "Falar com o Papai Noel"} id="aovivo-mic">
                  {thinking ? <Loader2 className="w-7 h-7 animate-spin" /> : <Mic className="w-8 h-8" />}
                </button>
              )}
              <button onClick={() => (paywall || busy ? onClose() : void say("tchau"))} className="grid place-items-center w-12 h-12 rounded-full bg-[#D90429] cursor-pointer" aria-label="Encerrar a chamada" id="aovivo-desligar">
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
            {!paywall && <p className="text-center text-[11px] text-white/70 mt-2 min-h-4">{hint}</p>}
          </div>
        )}

        {stage === "fim" && (
          <div className="absolute inset-x-0 bottom-0 p-5 pb-7 bg-gradient-to-t from-[#060B19] via-[#060B19]/95 to-transparent pt-16" id="aovivo-fim">
            <h2 className="font-cinzel text-2xl font-bold text-center">Até a noite de Natal, {first}!</h2>
            {anyAnswer && (
              <div className="mt-3 rounded-2xl border border-[#FFD166]/50 bg-[#0B132B]/85 p-3" id="aovivo-resumo">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#FFD166] mb-1.5">Para os pais: o que {first} contou</p>
                {QUESTIONS.map((q) =>
                  answers[q.key] ? (
                    <p key={q.key} className="text-sm leading-snug">
                      <b>{q.label}:</b> {answers[q.key]}
                    </p>
                  ) : null,
                )}
              </div>
            )}
            <div className="mt-3 grid gap-2">
              {anyAnswer && (
                <button onClick={toLetter} className="rounded-full py-3.5 font-extrabold bg-gradient-to-r from-[#D90429] to-[#EF233C] border border-[#FFD166]/60 inline-flex items-center justify-center gap-2 cursor-pointer" id="aovivo-carta">
                  <Mail className="w-5 h-5" /> Transformar em carta do Papai Noel
                </button>
              )}
              <button onClick={() => photoRef.current?.click()} className="rounded-full py-3 font-extrabold bg-[#FFD166] text-[#0B132B] inline-flex items-center justify-center gap-2 cursor-pointer" id="aovivo-foto-fim">
                <Camera className="w-5 h-5" /> Foto com o Papai Noel
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => void makePhoto(null)} className="rounded-full py-2.5 text-sm font-bold bg-white/10 hover:bg-white/15 cursor-pointer">Lembrança sem foto</button>
                <button onClick={onClose} className="rounded-full py-2.5 text-sm font-bold bg-white/10 hover:bg-white/15 cursor-pointer">Fechar</button>
              </div>
            </div>
            <p className="text-[11px] text-white/55 mt-3 flex gap-1.5 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> A foto é montada no seu aparelho. O que a criança falou não ficou guardado no site.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
