import { useEffect, useMemo, useState, type ReactNode } from "react";
import { priceLabel } from "../../lib/pricing";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Copy,
  Crown,
  Gamepad2,
  Globe,
  Image as ImageIcon,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Mailbox,
  MessageCircle,
  Music2,
  Palette,
  Pencil,
  Plus,
  Share2,
  Sparkles,
  Trash2,
  TreePine,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { closeParentArea, linkToAccount, loadPanel, logout, useAuth, type Panel } from "../../lib/auth";
import { letterTheme } from "../../lib/letterThemes";
import { prettyName } from "../../lib/prettyText";
import { useBackClose } from "../../lib/backClose";
import { getProgress, grantFullAccess, saveAccessCode } from "../../advent/access";
import { loadLocal as localHouse } from "../../house/store";
import { loadLocal as localTree } from "../../tree/store";
import { PAID_FEATURES } from "../PlanChooser";
import SongStudio from "../music/SongStudio";
import { useFeatures } from "../../lib/features";
import { openExtra } from "../ExtrasHub";
import { AVATARS, daysToChristmas, familyUrl, loadProfile, saveProfile, type FamilyChild, type FamilyProfile } from "../../lib/family";
import FamilyAvatar from "../family/FamilyAvatar";
import { rememberPlan } from "../../cards/limits";
import { IconBadge } from "../ui/Icons";

type Tab = "cartas" | "musicas" | "arvore" | "calendario" | "planos";
const EMPTY: FamilyProfile = { familyName: "", bio: "", avatar: "estrela", children: [], slug: "", isPublic: false };

/** Painel da Família: perfil da família, página para compartilhar, cartas por criança, atalhos e plano. */
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
  const features = useFeatures();
  const [data, setData] = useState<Panel | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("cartas");
  const [copied, setCopied] = useState<string | null>(null);
  const [songFor, setSongFor] = useState<string | null>(null);
  const [profile, setProfile] = useState<FamilyProfile | null>(null);
  const [profileReady, setProfileReady] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    (async () => {
      // a casinha e a árvore deste aparelho entram na conta automaticamente
      const h = localHouse();
      const t = localTree();
      await Promise.all([h.token && h.editKey ? linkToAccount(h.token, h.editKey) : null, t.token && t.editKey ? linkToAccount(t.token, t.editKey) : null]);
      const [panel, prof] = await Promise.all([loadPanel().catch((e: Error) => e), loadProfile(true)]);
      setProfile(prof.profile);
      setProfileReady(prof.ready);
      if (panel instanceof Error) return setErr(panel.message);
      setData(panel);
      // libera o Natal Completo neste aparelho também (as próximas cartas já saem completas)
      const withRoom = panel.plans.find((p) => p.remaining > 0) ?? panel.plans[0];
      if (withRoom) {
        saveAccessCode(withRoom.code);
        grantFullAccess();
        rememberPlan(panel.plans.some((p) => p.plan === "familia") ? "familia" : withRoom.plan);
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

  // crianças: as do perfil primeiro, depois as que só aparecem nas cartas
  const kids = useMemo(() => {
    const m = new Map<string, { name: string; age?: number; letters: Panel["letters"] }>();
    const key = (n: string) => prettyName(n.trim().split(/\s+/)[0] || n).toLowerCase();
    for (const c of profile?.children ?? []) m.set(key(c.name), { name: prettyName(c.name), age: c.age, letters: [] });
    for (const l of data?.letters ?? []) {
      const k = key(l.childName);
      const cur = m.get(k) ?? { name: prettyName(l.childName.trim().split(/\s+/)[0] || l.childName), age: l.age, letters: [] };
      cur.letters.push(l);
      if (!cur.age && l.age) cur.age = l.age;
      m.set(k, cur);
    }
    return [...m.values()];
  }, [data, profile]);

  const advent = getProgress().length;
  const days = daysToChristmas();
  const firstName = auth.parent?.name ? prettyName(auth.parent.name).split(" ")[0] : "";
  const title = profile?.familyName ? profile.familyName : firstName ? `Família de ${firstName}` : "Nossa família";

  const leave = (then?: () => void) => {
    closeParentArea();
    if (then) setTimeout(then, 250);
  };
  const home = () => leave(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  const section = (id: string) => leave(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  const extra = (id: string) => leave(() => openExtra(id));
  const newLetterFor = (c?: FamilyChild) => {
    try {
      if (c) sessionStorage.setItem("cm-prefill-child", JSON.stringify(c));
    } catch {
      /* ok */
    }
    onCreate();
  };
  const copy = (text: string, id: string) =>
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1800);
    });

  const shortcuts: { id: string; icon: LucideIcon; label: string; onClick: () => void; tone?: "red" | "gold" | "green" | "navy" }[] = [
    { id: "nova", icon: Plus, label: "Nova carta", onClick: () => newLetterFor(), tone: "red" },
    { id: "correio", icon: Mailbox, label: "Correio", onClick: () => section("correio") },
    { id: "cartao", icon: ImageIcon, label: "Cartão", onClick: () => extra("cartao") },
    { id: "jogos", icon: Gamepad2, label: "Jogos", onClick: () => extra("jogo") },
    { id: "atelie", icon: Palette, label: "Ateliê", onClick: () => extra("atelie") },
    { id: "calendario", icon: CalendarDays, label: "Calendário", onClick: () => extra("calendario") },
    { id: "arvore", icon: TreePine, label: "Árvore", onClick: () => extra("arvore"), tone: "green" },
    ...(features.music ? [{ id: "musica", icon: Music2, label: "Música", onClick: () => setTab("musicas") }] : []),
  ];

  const tabs: [Tab, string, LucideIcon][] = [
    ["cartas", "Cartas", Mail],
    ...(features.music ? ([["musicas", "Músicas", Music2]] as [Tab, string, LucideIcon][]) : []),
    ["arvore", "Árvore", TreePine],
    ["calendario", "Calendário", CalendarDays],
    ["planos", "Plano", Crown],
  ];

  const pageUrl = profile?.isPublic && profile.slug ? familyUrl(profile.slug) : null;

  return (
    <motion.div className="fixed inset-0 z-[96] bg-black/85 backdrop-blur-sm flex items-start justify-center p-0 sm:p-5 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Painel da Família"
        id="parent-area"
        className="relative w-full sm:max-w-4xl min-h-[100dvh] sm:min-h-0 sm:my-auto bg-[#0B132B] text-white sm:rounded-3xl border-[#FFD166]/40 sm:border shadow-2xl overflow-hidden"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        {/* barra de cima */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 px-3 sm:px-5 py-2.5 bg-[#0B132B]/90 backdrop-blur border-b border-white/10">
          <button onClick={home} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold bg-white/10 hover:bg-white/15 cursor-pointer" id="panel-home">
            <ArrowLeft className="w-4 h-4" /> Voltar ao início
          </button>
          <p className="hidden sm:block text-[11px] uppercase tracking-[0.25em] font-bold text-[#FFD166]">Painel da Família</p>
          <div className="flex items-center gap-1">
            <button onClick={() => void logout()} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white/75 hover:bg-white/10 cursor-pointer" id="logout-btn">
              <LogOut className="w-4 h-4" /> Sair
            </button>
            <button onClick={closeParentArea} className="p-2 rounded-full hover:bg-white/10 cursor-pointer" aria-label="Fechar">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* capa da família */}
        <div className="relative px-4 sm:px-7 pt-6 pb-5 bg-[radial-gradient(ellipse_at_top_left,rgba(255,209,102,0.18),transparent_55%),linear-gradient(180deg,#1C2541,#0B132B)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <FamilyAvatar id={profile?.avatar} size={84} />
            <div className="flex-1 min-w-0">
              <h2 className="font-cinzel text-2xl sm:text-3xl font-bold leading-tight break-words" id="panel-family-name">
                {title}
              </h2>
              <p className="mt-1 text-sm text-white/75 max-w-xl break-words">
                {profile?.bio || "Conte em uma frase quem é a família. Ela aparece na página que vocês podem mandar para os avós."}
              </p>
              <p className="mt-1.5 text-xs text-white/50 break-all">{auth.parent?.email}</p>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end gap-2">
              <div className="rounded-2xl border border-[#FFD166]/50 bg-[#FFD166]/10 px-4 py-2 text-center" id="panel-countdown">
                <p className="font-cinzel text-2xl font-extrabold text-[#FFD166] leading-none">{days === 0 ? "Hoje" : days}</p>
                <p className="text-[10px] uppercase tracking-widest text-white/75 mt-1">{days === 0 ? "é Natal!" : days === 1 ? "dia para o Natal" : "dias para o Natal"}</p>
              </div>
              <button
                onClick={() => setEditing((v) => !v)}
                disabled={!profileReady}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold bg-[#FFD166] text-[#0B132B] hover:brightness-105 cursor-pointer disabled:opacity-50"
                id="panel-edit-profile"
              >
                <Pencil className="w-4 h-4" /> {editing ? "Fechar" : "Editar perfil"}
              </button>
            </div>
          </div>
          {!profileReady && <p className="mt-3 text-xs text-[#FFD166]">O perfil da família está sendo preparado e fica disponível em breve.</p>}

          <AnimatePresence initial={false}>
            {editing && (
              <ProfileEditor
                initial={profile ?? { ...EMPTY, familyName: firstName ? `Família de ${firstName}` : "", children: kids.slice(0, 6).map((k) => ({ name: k.name, age: k.age })) }}
                onSaved={(p) => {
                  setProfile(p);
                  setEditing(false);
                }}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="px-4 sm:px-7 pb-7">
          {!data && !err && (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#FFD166]" />
            </div>
          )}
          {err && <p className="mt-6 text-sm text-[#FF8FA3]">{err}</p>}

          {data && (
            <>
              {/* atalhos */}
              <div className="mt-5 grid grid-cols-4 sm:grid-cols-8 gap-2" id="panel-shortcuts">
                {shortcuts.map((s) => (
                  <button key={s.id} onClick={s.onClick} className="group flex flex-col items-center gap-1.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 py-3 px-1 cursor-pointer transition-colors" id={`panel-go-${s.id}`}>
                    <IconBadge icon={s.icon} size="sm" tone={s.tone ?? "glass"} className="group-hover:scale-105 transition-transform" />
                    <span className="text-[11px] sm:text-xs font-bold text-white/90 leading-tight text-center">{s.label}</span>
                  </button>
                ))}
              </div>

              {/* página da família para compartilhar */}
              <Card className="mt-4" id="panel-share">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <IconBadge icon={Globe} tone="navy" size="md" round />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">Página da família</p>
                    {pageUrl ? (
                      <p className="text-xs text-white/70 break-all">{pageUrl.replace(/^https?:\/\//, "")}</p>
                    ) : (
                      <p className="text-xs text-white/70">Um link bonito com a bio, as cartas entregues e a árvore, para os avós e tios verem. Vocês escolhem se fica ligado.</p>
                    )}
                  </div>
                  {pageUrl ? (
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Olha a página de Natal da ${title}: ${pageUrl}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold bg-[#25D366] text-[#06240F]"
                        id="panel-share-wa"
                      >
                        <MessageCircle className="w-4 h-4" /> WhatsApp
                      </a>
                      <button onClick={() => copy(pageUrl, "page")} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold bg-white/10 hover:bg-white/15 cursor-pointer" id="panel-share-copy">
                        {copied === "page" ? <Check className="w-4 h-4 text-[#2DC653]" /> : <Copy className="w-4 h-4" />} Copiar
                      </button>
                      <a href={pageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold bg-white/10 hover:bg-white/15">
                        <Share2 className="w-4 h-4" /> Ver
                      </a>
                    </div>
                  ) : (
                    <button onClick={() => setEditing(true)} disabled={!profileReady} className="rounded-full px-4 py-2 text-sm font-bold bg-white/10 hover:bg-white/15 cursor-pointer disabled:opacity-50">
                      Criar a página
                    </button>
                  )}
                </div>
              </Card>

              {/* resumo do plano */}
              {totals && plan ? (
                <Card className="mt-4 border-[#FFD166]/50 bg-gradient-to-br from-[#FFD166]/[0.12] to-transparent" id="panel-summary">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 font-cinzel font-bold text-lg">
                      <Crown className="w-5 h-5 text-[#FFD166]" /> {data.plans.length > 1 ? `${data.plans.length} compras` : plan.label}
                    </span>
                    <button
                      onClick={() => copy(plan.code, "code")}
                      className="text-xs font-bold rounded-full bg-white/10 hover:bg-white/15 px-3 py-1.5 inline-flex items-center gap-1.5 cursor-pointer"
                      title="Use este código para abrir em outro celular"
                    >
                      {copied === "code" ? <Check className="w-3.5 h-3.5 text-[#2DC653]" /> : <Copy className="w-3.5 h-3.5" />} Código mágico: <b className="tracking-widest">{plan.code}</b>
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <Stat n={totals.used} label="cartas feitas" />
                    <Stat n={totals.remaining} label="ainda faltam" gold />
                    <Stat n={`${Math.min(kids.length, totals.children)}/${totals.children}`} label="crianças" />
                  </div>
                  <div className="mt-4 h-2.5 rounded-full bg-white/10 overflow-hidden" aria-label={`${totals.used} de ${totals.limit} cartas`}>
                    <motion.div className="h-full bg-gradient-to-r from-[#FFD166] to-[#2DC653]" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (totals.used / totals.limit) * 100)}%` }} transition={{ duration: 0.8 }} />
                  </div>
                  <p className="mt-1.5 text-xs text-white/70">
                    {totals.used} de {totals.limit} cartas completas usadas
                    {totals.remaining === 0 ? " · as cartas do plano acabaram" : ""}
                  </p>
                  {plan.canUpgrade && (
                    <button onClick={() => onPay("upgrade", plan.code)} className="mt-3 rounded-full px-5 py-2.5 text-sm font-bold bg-[#2DC653] text-[#0B132B] cursor-pointer" id="panel-upgrade">
                      Virar Pacote Família por + R$ 11,00
                    </button>
                  )}
                </Card>
              ) : (
                <Card className="mt-4" id="panel-summary">
                  <p className="font-cinzel font-bold text-lg">Plano grátis</p>
                  <p className="text-sm text-white/75 mt-1">
                    Vocês podem criar até 3 cartas grátis por dia. Com o Natal Completo cada criança ganha cartas completas com 6 vozes, PDF, certificado e o Calendário do Advento.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => onPay("natal")} className="rounded-full px-4 py-2.5 font-extrabold bg-gradient-to-r from-[#D90429] to-[#EF233C] border border-[#FFD166]/50 cursor-pointer">
                      Carta Completa · {priceLabel("natal")} (2 crianças, 10 cartas)
                    </button>
                    <button onClick={() => onPay("familia")} className="rounded-full px-4 py-2.5 font-bold bg-white/10 hover:bg-white/15 cursor-pointer">
                      Pacote Família · {priceLabel("familia")} (5 crianças, 23 cartas)
                    </button>
                  </div>
                </Card>
              )}

              {/* abas */}
              <div className="mt-6 flex gap-1.5 overflow-x-auto pb-1 border-b border-white/10" role="tablist">
                {tabs.map(([id, label, I]) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={tab === id}
                    onClick={() => setTab(id)}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold cursor-pointer border-b-2 -mb-px transition-colors ${tab === id ? "border-[#FFD166] text-[#FFD166]" : "border-transparent text-white/70 hover:text-white"}`}
                    id={`panel-tab-${id}`}
                  >
                    <I className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                {tab === "cartas" &&
                  (kids.length === 0 ? (
                    <Empty text="Nenhuma carta por aqui ainda. As cartas criadas com vocês conectados aparecem aqui, separadas por criança." action="Criar a primeira carta" onAction={() => newLetterFor()} />
                  ) : (
                    <div className="grid md:grid-cols-2 gap-3" id="panel-letters">
                      {kids.map((k) => (
                        <Card key={k.name} className="!p-0 overflow-hidden">
                          <div className="flex items-center gap-3 p-3 sm:p-4 border-b border-white/10 bg-white/[0.03]">
                            <span className="w-11 h-11 rounded-full grid place-items-center font-cinzel font-extrabold text-lg text-[#0B132B] bg-gradient-to-br from-[#FFE9A8] to-[#E09F2E] shrink-0">{k.name.charAt(0)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold truncate">{k.name}</p>
                              <p className="text-xs text-white/60">
                                {k.age ? `${k.age} anos · ` : ""}
                                {k.letters.length} {k.letters.length === 1 ? "carta" : "cartas"}
                              </p>
                            </div>
                            <button onClick={() => newLetterFor({ name: k.name, age: k.age })} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold bg-[#D90429] hover:bg-[#EF233C] cursor-pointer">
                              <Plus className="w-3.5 h-3.5" /> Carta
                            </button>
                          </div>
                          {k.letters.length === 0 ? (
                            <p className="p-4 text-sm text-white/60">Ainda sem carta. Que tal a primeira?</p>
                          ) : (
                            <ul className="p-2 space-y-1">
                              {k.letters.map((l) => {
                                const th = letterTheme(l.theme);
                                const scheduled = l.deliverAt && Date.parse(l.deliverAt) > Date.now();
                                return (
                                  <li key={l.token}>
                                    <button onClick={() => onOpen(l.token)} className="w-full flex items-center gap-3 rounded-xl hover:bg-white/[0.07] p-2 text-left cursor-pointer">
                                      <span className="w-9 h-9 rounded-lg grid place-items-center shrink-0 border border-white/30" style={{ background: `linear-gradient(135deg, ${th.envelope[0]}, ${th.envelope[1]})` }}>
                                        <Mail className="w-4 h-4 text-white" />
                                      </span>
                                      <span className="flex-1 min-w-0">
                                        <span className="block text-sm font-bold truncate">{l.fromChild ? `Resposta à cartinha${l.protocol ? ` nº ${l.protocol.toLocaleString("pt-BR")}` : ""}` : th.name}</span>
                                        <span className="block text-xs text-white/60 truncate">
                                          {l.date}
                                          {l.review ? " · em revisão carinhosa" : scheduled ? (Date.parse(l.deliverAt!) > Date.parse("2090-01-01") ? " · aguardando sua aprovação" : ` · chega em ${new Date(l.deliverAt!).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`) : ""}
                                          {l.wishes?.pedidos?.length ? ` · pediu: ${l.wishes.pedidos.join(", ")}` : ""}
                                        </span>
                                      </span>
                                      <span className={`text-[10px] font-bold rounded-full px-2 py-1 ${l.plan === "free" ? "bg-white/10 text-white/70" : "bg-[#FFD166] text-[#0B132B]"}`}>{l.plan === "free" ? "Grátis" : "Completa"}</span>
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </Card>
                      ))}
                    </div>
                  ))}

                {tab === "musicas" && (
                  <Card className="bg-gradient-to-br from-[#2B0B10] to-[#1C2541] border-[#FFD166]/40" id="panel-songs">
                    <p className="font-bold text-lg inline-flex items-center gap-2">
                      <Music2 className="w-5 h-5 text-[#FFD166]" /> Música de Natal cantada
                    </p>
                    <p className="text-sm text-white/75 mt-1">Uma música de verdade, cantada com o nome e as conquistas de cada criança. O plano inclui uma música por criança.</p>
                    {!plan ? (
                      <button onClick={() => onPay("natal")} className="mt-3 rounded-full px-5 py-2.5 font-bold bg-[#FFD166] text-[#0B132B] cursor-pointer">
                        Liberar com um plano
                      </button>
                    ) : kids.every((k) => !k.letters.length) ? (
                      <p className="mt-3 text-sm text-[#FFD166]">Crie a carta de cada criança primeiro: a música usa o que vocês contaram nela.</p>
                    ) : (
                      <ul className="mt-3 grid sm:grid-cols-2 gap-2">
                        {kids
                          .filter((k) => k.letters.length)
                          .map((k) => (
                            <li key={k.name}>
                              <button onClick={() => setSongFor(k.letters[0].token)} className="w-full flex items-center justify-between gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 p-3 cursor-pointer" id={`panel-song-${k.name.toLowerCase()}`}>
                                <span className="font-bold inline-flex items-center gap-2">
                                  <UserRound className="w-4 h-4 text-[#FFD166]" /> {k.name}
                                </span>
                                <span className="text-xs font-bold rounded-full px-3 py-1 bg-[#FFD166] text-[#0B132B]">Abrir estúdio</span>
                              </button>
                            </li>
                          ))}
                      </ul>
                    )}
                  </Card>
                )}

                {tab === "arvore" && (
                  <Card>
                    <p className="font-bold text-lg inline-flex items-center gap-2">
                      <TreePine className="w-5 h-5 text-[#2DC653]" /> Árvore da Família
                    </p>
                    {data.trees.length ? (
                      <ul className="mt-2 space-y-2">
                        {data.trees.map((t) => (
                          <li key={t.token}>
                            <a href={`/arvore/${t.token}`} className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2.5 text-sm font-semibold">
                              {t.title || "Árvore da família"} <span className="text-[#FFD166]">Abrir →</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-sm text-white/70">Cada enfeite guarda uma frase de carinho da família.</p>
                    )}
                    <button onClick={() => extra("arvore")} className="mt-3 rounded-full px-4 py-2 text-sm font-bold bg-white/10 hover:bg-white/15 cursor-pointer">
                      Montar a árvore
                    </button>
                    <p className="mt-3 text-[11px] text-white/55">A árvore entra no painel quando vocês criam o link para a família com a conta conectada.</p>
                  </Card>
                )}

                {tab === "calendario" && (
                  <Card>
                    <p className="font-bold inline-flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-[#FFD166]" /> Calendário do Advento
                    </p>
                    <p className="text-sm text-white/75 mt-1">
                      {advent} de 24 portinhas abertas {advent >= 24 ? "· completo!" : ""} <span className="text-white/50">(neste aparelho)</span>
                    </p>
                    <div className="mt-3 grid grid-cols-8 sm:grid-cols-12 gap-1.5">
                      {Array.from({ length: 24 }, (_, i) => (
                        <span key={i} className={`aspect-square rounded-md grid place-items-center text-[11px] font-bold ${getProgress().includes(i + 1) ? "bg-[#2DC653] text-[#0B132B]" : "bg-white/10 text-white/60"}`}>
                          {i + 1}
                        </span>
                      ))}
                    </div>
                    <button onClick={() => extra("calendario")} className="mt-4 rounded-full px-5 py-2.5 font-bold bg-[#FFD166] text-[#0B132B] cursor-pointer">
                      Abrir o calendário
                    </button>
                  </Card>
                )}

                {tab === "planos" && (
                  <div className="space-y-3">
                    {data.plans.map((p) => (
                      <Card key={p.code}>
                        <div className="flex justify-between gap-2 flex-wrap">
                          <p className="font-bold inline-flex items-center gap-2">
                            <Crown className="w-4 h-4 text-[#FFD166]" /> {p.label}
                          </p>
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
                      </Card>
                    ))}
                    <Card>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#FFD166] mb-2">O que vem no Natal Completo</p>
                      <ul className="space-y-1.5">
                        {PAID_FEATURES.map((f) => (
                          <li key={f} className="flex gap-2 text-sm text-white/85">
                            <Check className="w-4 h-4 text-[#2DC653] shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                )}
              </div>

              <p className="mt-6 text-[11px] text-white/45 inline-flex items-start gap-1.5">
                <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" /> As fotos das crianças nunca saem do aparelho. Na página da família aparecem só o primeiro nome, a bio e as cartas já entregues.
              </p>
            </>
          )}
        </div>
      </motion.div>
      {songFor && (
        <SongStudio
          token={songFor}
          code={plan?.code}
          childName={data?.letters.find((l) => l.token === songFor)?.childName || ""}
          onClose={() => setSongFor(null)}
          onUpgrade={() => {
            setSongFor(null);
            onPay("natal");
          }}
        />
      )}
    </motion.div>
  );
}

/** Edição do perfil: nome, bio, avatar, crianças e a página pública. */
function ProfileEditor({ initial, onSaved }: { initial: FamilyProfile; onSaved: (p: FamilyProfile) => void }) {
  const [p, setP] = useState<FamilyProfile>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const up = (patch: Partial<FamilyProfile>) => setP((x) => ({ ...x, ...patch }));
  const setKid = (i: number, patch: Partial<FamilyChild>) => up({ children: p.children.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  const suggested = (p.familyName || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/^fam[ií]lia\s+(de\s+|da\s+|do\s+)?/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const out = await saveProfile({ ...p, slug: p.slug || (suggested ? `familia-${suggested}` : ""), children: p.children.filter((c) => c.name.trim()) });
      onSaved(out);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  };
  const input = "w-full bg-[#0B132B] border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD166]";

  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
      <div className="mt-5 rounded-2xl border border-white/15 bg-white/[0.04] p-4 sm:p-5 grid gap-4" id="profile-editor">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs font-bold text-white/80 mb-1">Nome da família</span>
            <input className={input} maxLength={60} placeholder="Ex: Família Silva" value={p.familyName} onChange={(e) => up({ familyName: e.target.value })} id="profile-name" />
          </label>
          <div>
            <span className="block text-xs font-bold text-white/80 mb-1">Avatar</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Avatar da família">
              {Object.entries(AVATARS).map(([id, a]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={p.avatar === id}
                  title={a.label}
                  onClick={() => up({ avatar: id })}
                  className={`rounded-full p-0.5 cursor-pointer ${p.avatar === id ? "ring-2 ring-[#FFD166] ring-offset-2 ring-offset-[#1C2541]" : "opacity-75 hover:opacity-100"}`}
                >
                  <FamilyAvatar id={id} size={34} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <label className="block">
          <span className="block text-xs font-bold text-white/80 mb-1">
            Bio da família <span className="font-normal text-white/50">({p.bio.length}/280)</span>
          </span>
          <textarea className={input} rows={2} maxLength={280} placeholder="Ex: Moramos em Curitiba, amamos montar a árvore juntos e o Thor, nosso cachorro, adora o Natal." value={p.bio} onChange={(e) => up({ bio: e.target.value })} id="profile-bio" />
        </label>

        <div>
          <span className="block text-xs font-bold text-white/80 mb-1">Crianças (preenchem a carta com um toque)</span>
          <div className="space-y-2">
            {p.children.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input className={input} maxLength={40} placeholder="Nome" value={c.name} onChange={(e) => setKid(i, { name: e.target.value })} id={`profile-kid-${i}`} />
                <input className={`${input} !w-24`} type="number" min={0} max={17} placeholder="Idade" value={c.age ?? ""} onChange={(e) => setKid(i, { age: e.target.value === "" ? undefined : Number(e.target.value) })} />
                <button type="button" onClick={() => up({ children: p.children.filter((_, j) => j !== i) })} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer" aria-label={`Tirar ${c.name || "criança"}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {p.children.length < 6 && (
              <button type="button" onClick={() => up({ children: [...p.children, { name: "" }] })} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold bg-white/10 hover:bg-white/15 cursor-pointer" id="profile-add-kid">
                <Plus className="w-3.5 h-3.5" /> Adicionar criança
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-[#0B132B]/70 border border-white/10 p-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-1 w-4 h-4 accent-[#FFD166]" checked={p.isPublic} onChange={(e) => up({ isPublic: e.target.checked })} id="profile-public" />
            <span className="text-sm">
              <b>Ligar a página da família</b>
              <span className="block text-xs text-white/65">Quem tiver o link vê a bio, o primeiro nome das crianças e as cartas já entregues. Dá para desligar quando quiser.</span>
            </span>
          </label>
          {p.isPublic && (
            <div className="mt-3 flex items-center gap-1 text-sm">
              <span className="text-white/55 shrink-0">cartamagicanatal.com.br/familia/</span>
              <input
                className={`${input} !py-1.5`}
                maxLength={40}
                placeholder={suggested ? `familia-${suggested}` : "familia-silva"}
                value={p.slug}
                onChange={(e) => up({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 40) })}
                id="profile-slug"
              />
            </div>
          )}
        </div>

        {msg && <p className="text-sm text-[#FF8FA3]">{msg}</p>}
        <div className="flex justify-end">
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 font-extrabold bg-gradient-to-r from-[#D90429] to-[#EF233C] border border-[#FFD166]/50 cursor-pointer disabled:opacity-60" id="profile-save">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Salvar perfil
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Card({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={`rounded-2xl bg-white/[0.04] border border-white/10 p-4 sm:p-5 ${className}`}>
      {children}
    </div>
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
    <Card className="text-center">
      <p className="text-sm text-white/75 mb-3">{text}</p>
      <button onClick={onAction} className="rounded-full px-5 py-2.5 font-bold bg-gradient-to-r from-[#D90429] to-[#EF233C] cursor-pointer">
        {action}
      </button>
    </Card>
  );
}
