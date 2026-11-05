import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Mail, ShieldCheck, X } from "lucide-react";
import { closeParentArea, codeLogin, finishLogin, sendCode, useAuth, verifyCode, type LoginReason } from "../../lib/auth";
import FamilyPanel from "./FamilyPanel";

/** Janela de login do responsável + Área dos Pais. Fica montada uma vez no App. */
export default function AuthHost({
  onOpenLetter,
  onCreateLetter,
  onPay,
}: {
  onOpenLetter: (token: string) => void;
  onCreateLetter: () => void;
  onPay: (plan: "natal" | "familia" | "upgrade", code?: string) => void;
}) {
  const auth = useAuth();
  return (
    <>
      <AnimatePresence>{auth.pending && <LoginModal key="login" reason={auth.pending.reason} />}</AnimatePresence>
      <AnimatePresence>
        {auth.areaOpen && auth.parent && (
          <FamilyPanel
            key="area"
            onOpen={(t) => {
              closeParentArea();
              onOpenLetter(t);
            }}
            onCreate={() => {
              closeParentArea();
              onCreateLetter();
            }}
            onPay={(plan, code) => {
              closeParentArea();
              onPay(plan, code);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// a porta dos pais só aparece uma vez por visita
let gatePassed = false;

const TITLES: Record<LoginReason, { title: string; sub: string }> = {
  salvar: { title: "Guardar a carta", sub: "Entre como responsável para guardar a carta e receber o link no seu e-mail." },
  pagar: { title: "Antes de pagar", sub: "Entre como responsável. Assim a compra fica na sua conta e você recebe tudo por e-mail." },
  area: { title: "Painel da Família", sub: "Acompanhe as cartas de cada criança, quantas ainda faltam, a casinha e a árvore da família." },
};

export function Shell({ children, onClose, id }: { children: React.ReactNode; onClose: () => void; id: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <motion.div
      className="fixed inset-0 z-[96] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        id={id}
        className="relative w-full sm:max-w-md max-h-[92dvh] overflow-y-auto bg-gradient-to-b from-[#13204A] to-[#0B132B] text-white rounded-t-3xl sm:rounded-3xl border border-[#FFD166]/50 shadow-2xl p-5 sm:p-7"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/10 cursor-pointer" aria-label="Fechar">
          <X className="w-5 h-5" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}

function LoginModal({ reason }: { reason: LoginReason }) {
  const auth = useAuth();
  const first = auth.email ? "email" : "magic";
  const [step, setStep] = useState<"gate" | "email" | "code" | "magic">(gatePassed ? first : "gate");
  const [magic, setMagic] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [wait, setWait] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);
  const cancel = () => finishLogin(null);
  const t = TITLES[reason];

  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  const ask = async () => {
    setErr(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setErr("Confira o e-mail digitado.");
      return;
    }
    setBusy(true);
    try {
      const r = await sendCode(email.trim());
      setDevCode(r.devCode ?? null);
      setStep("code");
      setCode("");
      setWait(45);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const enterWithMagic = async () => {
    const v = magic.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (v.length !== 6) {
      setErr("O código mágico tem 6 letras e números.");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const r = await codeLogin(v);
      finishLogin(r.parent);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (value = code) => {
    if (value.length !== 6 || busy) return;
    setErr(null);
    setBusy(true);
    try {
      const r = await verifyCode(email.trim(), value, name.trim() || undefined);
      finishLogin(r.parent);
    } catch (e: any) {
      setErr(e.message);
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell onClose={cancel} id="parent-login">
      {step === "gate" ? (
        <ParentGate
          onPass={() => {
            gatePassed = true;
            setStep(first);
          }}
        />
      ) : (
        <>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-[#FFD166]" />
            <span className="text-[11px] uppercase tracking-widest font-bold text-[#FFD166]">Área dos pais</span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold mb-1">{t.title}</h2>
          <p className="text-sm text-white/75 mb-4">{t.sub}</p>

          {step === "magic" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void enterWithMagic();
              }}
              className="space-y-3"
            >
              <label className="block">
                <span className="text-xs font-semibold text-white/80">Código mágico da compra</span>
                <input
                  value={magic}
                  onChange={(e) => setMagic(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                  autoFocus
                  autoCapitalize="characters"
                  placeholder="EX: K7Q2MB"
                  className="mt-1 w-full bg-white text-[#0B132B] rounded-2xl px-4 py-3 text-center text-2xl font-extrabold tracking-[0.35em] focus:outline-none focus:ring-4 focus:ring-[#FFD166]/50"
                  id="login-magic"
                />
              </label>
              <p className="text-[11px] text-white/60 leading-snug">
                O código aparece na tela depois do pagamento e no Calendário do Advento. Ele liga você ao e-mail usado na compra.
              </p>
              {err && <p className="text-sm text-[#FF8FA3]">{err}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full py-3.5 font-extrabold bg-gradient-to-r from-[#2DC653] to-[#1a9e3e] border border-[#FFD166]/50 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                id="login-magic-btn"
              >
                {busy && <Loader2 className="w-5 h-5 animate-spin" />}
                Entrar no Painel da Família
              </button>
              {auth.email ? (
                <button type="button" onClick={() => setStep("email")} className="w-full text-xs text-white/70 underline cursor-pointer">
                  Prefiro receber um código no e-mail
                </button>
              ) : (
                <p className="text-[11px] text-white/55 text-center">Ainda não comprou? Crie as cartas grátis normalmente. O painel aparece depois da compra.</p>
              )}
            </form>
          ) : step === "email" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void ask();
              }}
              className="space-y-3"
            >
              <label className="block">
                <span className="text-xs font-semibold text-white/80">Seu e-mail</span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value.slice(0, 120))}
                  placeholder="voce@email.com"
                  className="mt-1 w-full bg-white/10 border border-white/25 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD166]"
                  id="login-email"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-white/80">Seu nome (opcional)</span>
                <input
                  value={name}
                  autoComplete="given-name"
                  onChange={(e) => setName(e.target.value.slice(0, 40))}
                  placeholder="Ex: Ana"
                  className="mt-1 w-full bg-white/10 border border-white/25 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD166]"
                  id="login-name"
                />
              </label>
              {err && <p className="text-sm text-[#FF8FA3]">{err}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full py-3.5 font-extrabold bg-gradient-to-r from-[#D90429] to-[#EF233C] border border-[#FFD166]/50 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                id="login-send"
              >
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                Receber código no e-mail
              </button>
              <button type="button" onClick={() => setStep("magic")} className="w-full text-xs text-[#FFD166] underline cursor-pointer">
                Já comprei: entrar com o código mágico
              </button>
              <p className="text-[11px] text-white/55 leading-snug">
                Sem senha: enviamos um código de 6 números. Usamos seu e-mail só para você entrar e receber as cartas, conforme a{" "}
                <a href="/privacidade" target="_blank" rel="noopener" className="underline">
                  política de privacidade
                </a>
                .
              </p>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-sm">
                Enviamos um código para <b className="text-[#FFD166] break-all">{email}</b>. Confira também a caixa de spam.
              </p>
              <input
                value={code}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(v);
                  if (v.length === 6) void confirm(v);
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                placeholder="000000"
                aria-label="Código de 6 números"
                className="w-full bg-white text-[#0B132B] rounded-2xl px-4 py-3 text-center text-3xl font-extrabold tracking-[0.5em] focus:outline-none focus:ring-4 focus:ring-[#FFD166]/50"
                id="login-code"
              />
              {devCode && <p className="text-[11px] text-white/50">Modo de teste: o código é {devCode}</p>}
              {err && <p className="text-sm text-[#FF8FA3]">{err}</p>}
              <button
                onClick={() => void confirm()}
                disabled={busy || code.length !== 6}
                className="w-full rounded-full py-3.5 font-extrabold bg-gradient-to-r from-[#2DC653] to-[#1a9e3e] border border-[#FFD166]/50 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                id="login-verify"
              >
                {busy && <Loader2 className="w-5 h-5 animate-spin" />}
                Entrar
              </button>
              <div className="flex justify-between text-xs text-white/70">
                <button onClick={() => setStep("email")} className="underline cursor-pointer">
                  Trocar e-mail
                </button>
                <button onClick={() => void ask()} disabled={wait > 0 || busy} className="underline cursor-pointer disabled:no-underline disabled:opacity-50">
                  {wait > 0 ? `Reenviar em ${wait}s` : "Reenviar código"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Shell>
  );
}

/** "Porta dos pais": uma continha que criança pequena não sabe, para ela não entrar sozinha. */
function ParentGate({ onPass }: { onPass: () => void }) {
  const make = () => {
    const a = 6 + Math.floor(Math.random() * 4);
    const b = 6 + Math.floor(Math.random() * 4);
    return { a, b };
  };
  const [q, setQ] = useState(make);
  const [v, setV] = useState("");
  const [wrong, setWrong] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);
  const check = () => {
    if (Number(v) === q.a * q.b) onPass();
    else {
      setWrong(true);
      setQ(make());
      setV("");
      ref.current?.focus();
    }
  };
  return (
    <div className="text-center">
      <div className="text-4xl mb-2">👨‍👩‍👧</div>
      <h2 className="font-cinzel text-xl font-bold mb-1">Chame um adulto</h2>
      <p className="text-sm text-white/75 mb-4">Esta parte é para o pai, a mãe ou o responsável. Responda para continuar:</p>
      <p className="text-3xl font-extrabold text-[#FFD166] mb-3" id="gate-question">
        Quanto é {q.a} × {q.b}?
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          check();
        }}
        className="flex gap-2 justify-center"
      >
        <input
          ref={ref}
          value={v}
          onChange={(e) => {
            setWrong(false);
            setV(e.target.value.replace(/\D/g, "").slice(0, 3));
          }}
          inputMode="numeric"
          autoFocus
          aria-label="Resposta"
          className="w-28 bg-white text-[#0B132B] rounded-xl px-3 py-3 text-center text-2xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD166]/50"
          id="gate-answer"
        />
        <button type="submit" className="rounded-xl px-5 font-bold bg-[#FFD166] text-[#0B132B] cursor-pointer" id="gate-ok">
          OK
        </button>
      </form>
      {wrong && <p className="text-sm text-[#FF8FA3] mt-2">Ops, não é isso. Tente esta outra conta.</p>}
    </div>
  );
}
