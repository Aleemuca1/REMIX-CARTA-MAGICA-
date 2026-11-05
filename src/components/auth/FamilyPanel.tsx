import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check, Copy, Crown, Loader2, LogOut, Plus, X } from "lucide-react";
import { closeParentArea, linkToAccount, loadPanel, logout, useAuth, type Panel } from "../../lib/auth";
import { letterTheme } from "../../lib/letterThemes";
import { prettyName } from "../../lib/prettyText";
import { useBackClose } from "../../lib/backClose";
import { getProgress, grantFullAccess, saveAccessCode } from "../../advent/access";
import { loadLocal as localHouse } from "../../house/store";
import { loadLocal as localTree } from "../../tree/store";
import { PAID_FEATURES } from "../PlanChooser";

type Tab = "cartas" | "casa" | "calendario" | "planos";

/** Painel da Família: quantas cartas já foram feitas, quantas faltam, cartas por criança, casinha, árvore e plano. */
export default function FamilyPanel({
  onOpen,
  onCreate,
  onPay,
}: {
  onOpen: (token: string) => void;
  onCreate: () => void;
  onPay: (plan: "natal" | "familia" | "upgrade", code?: string) => void;
}) {
  useBackClose(true, closeParentArea);
  const auth = useAuth();
  const [data, setData] = useState<Panel | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("cartas");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    (async () => {
      // a casinha e a árvore deste aparelho entram na conta automaticamente
      const h = localHouse();
      const t = localTree();
      await Promise.all([h.token && h.editKey ? linkToAccount(h.token, h.editKey) : null, t.token && t.editKey ? linkToAccount(t.token, t.editKey) : null]);
      try {
        const d = await loadPanel();
        setData(d);
        // libera o Natal Completo neste aparelho também (as próximas cartas já saem completas)
        const withRoom = d.plans.find((p) => p.remaining > 0) ?? d.plans[0];
        if (withRoom) {
          saveAccessCode(withRoom.code);
          grantFullAccess();
        }
      } catch (e: any) {
        setErr(e.message);
      }
    })();
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const plan = data?.plans[0];
  const totals = useMemo(() => {
    if (!data?.plans.length) return null;
    return data.plans.reduce((a, p) => ({ limit: a.limit + p.limit, used: a.used + p.used, remaining: a.remaining + p.remaining, children: a.children + p.children }), {
      limit: 0,
      used: 0,
      remaining: 0,
      children: 0,
    });
  }, [data]);
  const byChild = useMemo(() => {
    const m = new Map<string, Panel["letters"]>();
    for (const l of data?.letters ?? []) {
      const k = prettyName(l.childName.trim().split(/\s+/)[0] || l.childName);
      m.set(k, [...(m.get(k) ?? []), l]);
    }
    return [...m.entries()];
  }, [data]);
  const advent = getProgress().length;
  const name = auth.parent?.name ? prettyName(auth.parent.name) : "";
  const go = (hash: string) => {
    closeParentArea();
    setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 250);
  };

  const tabs: [Tab, string][] = [
    ["cartas", "💌 Cartas"],
    ["casa", "🏡 Casinha e Árvore"],
    ["calendario", "📅 Calendário"],
    ["planos", "👑 Plano"],
  ];

  return (
    <motion.div className="fixed inset-0 z-[96] bg-black/85 backdrop-blur-sm flex items-start justify-center p-0 sm:p-5 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        role="dialog"
        aria-modal="true"
        id="parent-area"
        className="relative w-full sm:max-w-3xl min-h-[100dvh] sm:min-h-0 sm:my-auto bg-gradient-to-b from-[#13204A] to-[#0B132B] text-white sm:rounded-3xl border-[#FFD166]/50 sm:border shadow-2xl p-4 sm:p-7"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        <button onClick={closeParentArea} className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/10 cursor-pointer" aria-label="Fechar">
          <X className="w-5 h-5" />
        </button>
        <p className="text-[11px] uppercase tracking-widest font-bold text-[#FFD166]">👨‍👩‍👧 Painel da Família</p>
        <h2 className="font-cinzel text-2xl sm:text-3xl font-bold">{name ? `Olá, ${name}!` : "Olá!"}</h2>
        <p className="text-xs text-white/60 break-all">{auth.parent?.email}</p>

        {!data && !err && (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#FFD166]" />
          </div>
        )}
        {err && <p className="mt-6 text-sm text-[#FF8FA3]">{err}</p>}

        {data && (
          <>
            {/* resumo */}
            {totals && plan ? (
              <div className="mt-4 rounded-3xl border-2 border-[#FFD166]/60 bg-gradient-to-br from-[#FFD166]/15 to-transparent p-4 sm:p-5" id="panel-summary">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-cinzel font-bold text-lg">
                    <Crown className="w-5 h-5 text-[#FFD166]" /> {data.plans.length > 1 ? `${data.plans.length} compras` : plan.label}
                  </span>
                  <button
                    onClick={() => navigator.clipboard?.writeText(plan.code).then(() => setCopied(true))}
                    className="text-xs font-bold rounded-full bg-white/10 hover:bg-white/15 px-3 py-1.5 inline-flex items-center gap-1.5 cursor-pointer"
                    title="Use este código para abrir em outro celular"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#2DC653]" /> : <Copy className="w-3.5 h-3.5" />} Código mágico: <b className="tracking-widest">{plan.code}</b>
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <Stat n={totals.used} label="cartas feitas" />
                  <Stat n={totals.remaining} label="ainda faltam" gold />
                  <Stat n={`${Math.min(byChild.length, totals.children)}/${totals.children}`} label="crianças" />
                </div>
                <div className="mt-4 h-3 rounded-full bg-white/10 overflow-hidden" aria-label={`${totals.used} de ${totals.limit} cartas`}>
                  <motion.div className="h-full bg-gradient-to-r from-[#FFD166] to-[#2DC653]" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (totals.used / totals.limit) * 100)}%` }} transition={{ duration: 0.8 }} />
                </div>
                <p className="mt-1.5 text-xs text-white/70">
                  {totals.used} de {totals.limit} cartas completas usadas
                  {totals.remaining === 0 ? " · as cartas do plano acabaram" : ""}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={onCreate} disabled={totals.remaining === 0} className="rounded-full px-5 py-2.5 font-extrabold bg-gradient-to-r from-[#D90429] to-[#EF233C] border border-[#FFD166]/50 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50" id="panel-create">
                    <Plus className="w-4 h-4" /> Criar nova carta
                  </button>
                  {plan.canUpgrade && (
                    <button onClick={() => onPay("upgrade", plan.code)} className="rounded-full px-5 py-2.5 font-bold bg-[#2DC653] text-[#0B132B] cursor-pointer" id="panel-upgrade">
                      Virar Pacote Família por + R$ 11,00
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-3xl border border-white/15 bg-white/5 p-4 sm:p-5" id="panel-summary">
                <p className="font-cinzel font-bold text-lg">Plano grátis</p>
                <p className="text-sm text-white/75 mt-1">
                  Vocês podem criar até 3 cartas grátis por dia. Com o Natal Completo cada criança ganha cartas completas com 6 vozes, PDF, certificado e o Calendário do Advento.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => onPay("natal")} className="rounded-full px-4 py-2.5 font-extrabold bg-gradient-to-r from-[#D90429] to-[#EF233C] border border-[#FFD166]/50 cursor-pointer">
                    Carta Completa · R$ 14,90 (2 crianças, 10 cartas)
                  </button>
                  <button onClick={() => onPay("familia")} className="rounded-full px-4 py-2.5 font-bold bg-white/10 hover:bg-white/15 cursor-pointer">
                    Pacote Família · R$ 25,90 (5 crianças, 23 cartas)
                  </button>
                </div>
              </div>
            )}

            {/* abas */}
            <div className="mt-5 flex gap-1.5 overflow-x-auto pb-1" role="tablist">
              {tabs.map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold cursor-pointer ${tab === id ? "bg-[#FFD166] text-[#0B132B]" : "bg-white/10 text-white hover:bg-white/15"}`}
                  id={`panel-tab-${id}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {tab === "cartas" &&
                (byChild.length === 0 ? (
                  <Empty text="Nenhuma carta por aqui ainda. As cartas criadas com vocês conectados (ou com o código mágico) aparecem aqui, separadas por criança." action="Criar a primeira carta" onAction={onCreate} />
                ) : (
                  <div className="space-y-4" id="panel-letters">
                    {byChild.map(([child, list]) => (
                      <div key={child} className="rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold">
                            🧒 {child} <span className="text-white/60 font-normal text-sm">· {list.length} {list.length === 1 ? "carta" : "cartas"}</span>
                          </p>
                          <button onClick={onCreate} className="text-xs font-bold text-[#FFD166] underline cursor-pointer">
                            + outra carta
                          </button>
                        </div>
                        <ul className="grid sm:grid-cols-2 gap-2">
                          {list.map((l) => {
                            const th = letterTheme(l.theme);
                            return (
                              <li key={l.token}>
                                <button onClick={() => onOpen(l.token)} className="w-full flex items-center gap-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 p-2.5 text-left cursor-pointer">
                                  <span className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 border border-white/30" style={{ background: `linear-gradient(135deg, ${th.envelope[0]}, ${th.envelope[1]})` }}>
                                    ✉️
                                  </span>
                                  <span className="flex-1 min-w-0">
                                    <span className="block text-sm font-bold truncate">
                                      {th.emoji} {th.name}
                                    </span>
                                    <span className="block text-xs text-white/60">
                                      {l.age} anos · {l.date}
                                    </span>
                                  </span>
                                  <span className={`text-[10px] font-bold rounded-full px-2 py-1 ${l.plan === "free" ? "bg-white/10 text-white/70" : "bg-[#FFD166] text-[#0B132B]"}`}>
                                    {l.plan === "free" ? "Grátis" : "Completa"}
                                  </span>
                                </button>
                                {l.fromChild && (
                                  <div className="mt-1 ml-1 text-[11px] text-white/70 space-y-0.5">
                                    <p>
                                      📮 Resposta à cartinha{l.protocol ? ` nº ${l.protocol.toLocaleString("pt-BR")}` : ""} ·{" "}
                                      {l.review ? <span className="text-[#FFD166]">em revisão carinhosa</span> : l.deliverAt && Date.parse(l.deliverAt) > Date.now() ? (Date.parse(l.deliverAt) > Date.parse("2090-01-01") ? <span className="text-[#FFD166]">aguardando sua aprovação</span> : <>chega em {new Date(l.deliverAt).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</>) : "entregue"}
                                    </p>
                                    {l.wishes?.pedidos?.length ? <p>🎁 <b>Pediu:</b> {l.wishes.pedidos.join(", ")}</p> : null}
                                    {l.wishes?.perguntas?.length ? <p>❓ <b>Perguntou:</b> {l.wishes.perguntas.join(" · ")}</p> : null}
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}

              {tab === "casa" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <Place
                    emoji="🏡"
                    title="Casinha de Natal"
                    items={data.houses.map((h) => ({ label: h.title || "Casinha da família", href: `/casa/${h.token}` }))}
                    emptyText="Montem a casinha juntos e chamem os avós pelo link."
                    onStart={() => go("casinha")}
                    start="Montar a casinha"
                  />
                  <Place
                    emoji="🎄"
                    title="Árvore da Família"
                    items={data.trees.map((t) => ({ label: t.title || "Árvore da família", href: `/arvore/${t.token}` }))}
                    emptyText="Cada enfeite guarda uma frase de carinho da família."
                    onStart={() => go("arvore")}
                    start="Montar a árvore"
                  />
                  <p className="sm:col-span-2 text-[11px] text-white/55">
                    A casinha e a árvore entram no painel quando vocês criam o link para a família com a conta conectada. Assim dá para abrir e arrumar em qualquer celular.
                  </p>
                </div>
              )}

              {tab === "calendario" && (
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <p className="font-bold">📅 Calendário do Advento</p>
                  <p className="text-sm text-white/75 mt-1">
                    {advent} de 24 portinhas abertas {advent >= 24 ? "· completo! 🎉" : ""} <span className="text-white/50">(neste aparelho)</span>
                  </p>
                  <div className="mt-3 grid grid-cols-8 sm:grid-cols-12 gap-1.5">
                    {Array.from({ length: 24 }, (_, i) => (
                      <span key={i} className={`aspect-square rounded-md grid place-items-center text-[11px] font-bold ${getProgress().includes(i + 1) ? "bg-[#2DC653] text-[#0B132B]" : "bg-white/10 text-white/60"}`}>
                        {i + 1}
                      </span>
                    ))}
                  </div>
                  <button onClick={() => go("calendario")} className="mt-4 rounded-full px-5 py-2.5 font-bold bg-[#FFD166] text-[#0B132B] cursor-pointer">
                    Abrir o calendário
                  </button>
                </div>
              )}

              {tab === "planos" && (
                <div className="space-y-3">
                  {data.plans.map((p) => (
                    <div key={p.code} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                      <div className="flex justify-between gap-2 flex-wrap">
                        <p className="font-bold">👑 {p.label}</p>
                        <p className="text-sm text-white/70">
                          R$ {p.amount.toFixed(2).replace(".", ",")} {p.paidAt ? `· pago em ${p.paidAt.split(" ")[0]}` : ""}
                        </p>
                      </div>
                      <p className="text-sm text-white/75 mt-1">
                        Até {p.children} crianças · {p.used} de {p.limit} cartas usadas · código <b className="tracking-widest">{p.code}</b>
                      </p>
                      {p.canUpgrade && (
                        <button onClick={() => onPay("upgrade", p.code)} className="mt-3 rounded-full px-4 py-2 text-sm font-bold bg-[#2DC653] text-[#0B132B] cursor-pointer">
                          Precisa de mais? Virar Pacote Família (+ R$ 11,00)
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#FFD166] mb-2">O que vem no Natal Completo</p>
                    <ul className="space-y-1.5">
                      {PAID_FEATURES.map((f) => (
                        <li key={f} className="flex gap-2 text-sm text-white/85">
                          <Check className="w-4 h-4 text-[#2DC653] shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <button onClick={() => void logout()} className="mt-6 w-full rounded-full py-2.5 text-sm font-semibold bg-white/10 hover:bg-white/15 inline-flex items-center justify-center gap-2 cursor-pointer" id="logout-btn">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </motion.div>
    </motion.div>
  );
}

function Stat({ n, label, gold }: { n: number | string; label: string; gold?: boolean }) {
  return (
    <div className="rounded-2xl bg-[#0B132B]/60 border border-white/10 py-3">
      <p className={`font-cinzel text-2xl sm:text-3xl font-extrabold ${gold ? "text-[#FFD166]" : "text-white"}`}>{n}</p>
      <p className="text-[11px] sm:text-xs text-white/70">{label}</p>
    </div>
  );
}

function Empty({ text, action, onAction }: { text: string; action: string; onAction: () => void }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
      <p className="text-sm text-white/75 mb-3">{text}</p>
      <button onClick={onAction} className="rounded-full px-5 py-2.5 font-bold bg-gradient-to-r from-[#D90429] to-[#EF233C] cursor-pointer">
        {action}
      </button>
    </div>
  );
}

function Place({ emoji, title, items, emptyText, onStart, start }: { emoji: string; title: string; items: { label: string; href: string }[]; emptyText: string; onStart: () => void; start: string }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col">
      <p className="font-bold text-lg">
        {emoji} {title}
      </p>
      {items.length ? (
        <ul className="mt-2 space-y-2 flex-1">
          {items.map((i) => (
            <li key={i.href}>
              <a href={i.href} className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2.5 text-sm font-semibold">
                {i.label} <span className="text-[#FFD166]">Abrir →</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-white/70 flex-1">{emptyText}</p>
      )}
      <button onClick={onStart} className="mt-3 rounded-full px-4 py-2 text-sm font-bold bg-white/10 hover:bg-white/15 cursor-pointer">
        {start}
      </button>
    </div>
  );
}
