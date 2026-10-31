import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, LogOut, Mail, ShieldCheck, X } from "lucide-react";
import {
  closeParentArea,
  finishLogin,
  logout,
  myLetters,
  sendCode,
  useAuth,
  verifyCode,
  type LoginReason,
  type MyLetter,
} from "../../lib/auth";
import { letterTheme } from "../../lib/letterThemes";
import { prettyName } from "../../lib/prettyText";

/** Janela de login do responsável + Área dos Pais. Fica montada uma vez no App. */
export default function AuthHost({ onOpenLetter, onCreateLetter }: { onOpenLetter: (token: string) => void; onCreateLetter: () => void }) {
  const auth = useAuth();
  return (
    <>
      <AnimatePresence>{auth.pending && <LoginModal key="login" reason={auth.pending.reason} />}</AnimatePresence>
      <AnimatePresence>
        {auth.areaOpen && auth.parent && (
          <ParentArea
            key="area"
            email={auth.parent.email}
            name={auth.parent.name}
            onOpen={(t) => {
              closeParentArea();
              onOpenLetter(t);
            }}
            onCreate={() => {
              closeParentArea();
              onCreateLetter();
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
  area: { title: "Área dos pais", sub: "Entre para ver as cartas que você já guardou." },
};

function Shell({ children, onClose, id }: { children: React.ReactNode; onClose: () => void; id: string }) {
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
  const [step, setStep] = useState<"gate" | "email" | "code">(gatePassed ? "email" : "gate");
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
            setStep("email");
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

          {step === "email" ? (
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

function ParentArea({ email, name, onOpen, onCreate }: { email: string; name?: string; onOpen: (token: string) => void; onCreate: () => void }) {
  const [list, setList] = useState<MyLetter[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    myLetters()
      .then(setList)
      .catch((e) => setErr(e.message));
  }, []);
  const hello = useMemo(() => (name ? `Olá, ${prettyName(name)}!` : "Olá!"), [name]);
  return (
    <Shell onClose={closeParentArea} id="parent-area">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="w-5 h-5 text-[#FFD166]" />
        <span className="text-[11px] uppercase tracking-widest font-bold text-[#FFD166]">Área dos pais</span>
      </div>
      <h2 className="font-cinzel text-xl sm:text-2xl font-bold">{hello}</h2>
      <p className="text-xs text-white/60 mb-4 break-all">{email}</p>

      <h3 className="text-sm font-bold mb-2">✉️ Minhas cartas</h3>
      {err && <p className="text-sm text-[#FF8FA3]">{err}</p>}
      {!list && !err && (
        <div className="py-6 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#FFD166]" />
        </div>
      )}
      {list && list.length === 0 && (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
          <p className="text-sm text-white/75 mb-3">Nenhuma carta guardada ainda. Ao criar uma carta com você conectado, ela aparece aqui.</p>
          <button onClick={onCreate} className="rounded-full px-5 py-2.5 font-bold bg-gradient-to-r from-[#D90429] to-[#EF233C] cursor-pointer">
            Criar uma carta
          </button>
        </div>
      )}
      {list && list.length > 0 && (
        <ul className="space-y-2" id="my-letters">
          {list.map((l) => {
            const th = letterTheme(l.theme);
            return (
              <li key={l.token}>
                <button
                  onClick={() => onOpen(l.token)}
                  className="w-full flex items-center gap-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-3 text-left cursor-pointer"
                >
                  <span
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border border-white/30"
                    style={{ background: `linear-gradient(135deg, ${th.envelope[0]}, ${th.envelope[1]})` }}
                  >
                    ✉️
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold truncate">Carta para {prettyName(l.childName)}</span>
                    <span className="block text-xs text-white/60">
                      {l.age} anos · {l.date}
                    </span>
                  </span>
                  <span
                    className={`text-[10px] font-bold rounded-full px-2 py-1 ${l.plan === "free" ? "bg-white/10 text-white/70" : "bg-[#FFD166] text-[#0B132B]"}`}
                  >
                    {l.plan === "free" ? "Grátis" : "Natal Completo"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button onClick={() => void logout()} className="mt-5 w-full rounded-full py-2.5 text-sm font-semibold bg-white/10 hover:bg-white/15 inline-flex items-center justify-center gap-2 cursor-pointer" id="logout-btn">
        <LogOut className="w-4 h-4" /> Sair
      </button>
    </Shell>
  );
}
