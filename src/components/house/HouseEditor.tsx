import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import { Copy, Check, Download, Moon, Share2, Sun, Trash2, Plus, Minus, MessageCircleHeart } from "lucide-react";
import BackButton from "../BackButton";
import ProUpsell from "../ProUpsell";
import HouseScene, { Drawn, type Ghost, type SantaStep } from "./HouseScene";
import { ItemArt, OUTFITS, Person, SKINS, Thumb } from "./art";
import { useBackClose } from "../../lib/backClose";
import { musicBox } from "../../lib/christmasMusic";
import { hasFullAccess, getChildName } from "../../advent/access";
import { whatsappUrl } from "../../lib/shareKit";
import {
  CATALOG,
  FREE_ITEMS,
  HOUSE,
  HOUSE_MODELS,
  ITEM_GROUPS,
  MAX_ITEMS,
  MAX_NAME,
  MAX_TEXT,
  PERSON_TYPES,
  RECADOS,
  ROOF_COLORS,
  personRef,
  type PersonType,
  VIEW_H,
  VIEW_W,
  canPlace,
  catalogItem,
  settle,
  newId,
  sanitizeText,
  type HouseItem,
  type HouseState,
} from "../../house/model";
import { api, loadLocal, saveLocal, shareUrl } from "../../house/store";
import { houseToPng } from "../../house/exportImage";

type Tab = "itens" | "familia" | "casa";

export default function HouseEditor({ onClose, sharedToken, onUpgrade }: { onClose: () => void; sharedToken?: string; onUpgrade?: () => void }) {
  useBackClose(true, onClose);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [house, setHouse] = useState<HouseState>(() => loadLocal());
  const [visitor, setVisitor] = useState(false);
  const [loading, setLoading] = useState(Boolean(sharedToken));
  const [tab, setTab] = useState<Tab>("itens");
  const [group, setGroup] = useState(ITEM_GROUPS[0]);
  const [pick, setPick] = useState<string | null>("arvore"); // item do catálogo escolhido
  const [person, setPerson] = useState<Draft | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [night, setNight] = useState(false);
  const [santa, setSanta] = useState<SantaStep>(0);
  const [gifts, setGifts] = useState<HouseItem[]>([]);
  const [bubble, setBubble] = useState<HouseItem | null>(null);
  const [ghost, setGhost] = useState<Ghost>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [share, setShare] = useState(false);
  const [busy, setBusy] = useState(false);
  const [author, setAuthor] = useState("");
  const [note, setNote] = useState<HouseItem | null>(null); // escrevendo recadinho
  const [visitorAdded, setVisitorAdded] = useState(0);
  const [upsell, setUpsell] = useState<{ title: string; text: string } | null>(null);
  const [full] = useState(() => hasFullAccess());
  const drag = useRef<{ id: string; dx: number; dy: number; moved: boolean; sx: number; sy: number } | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);

  const say = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2600);
  };

  // carrega a casa compartilhada (visitante) ou sincroniza a do dono
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const local = loadLocal();
    const token = sharedToken || local.token;
    if (token) {
      const owner = Boolean(local.token === token && local.editKey);
      setVisitor(!owner);
      api
        .get(token)
        .then((r) => {
          const next = owner ? { ...local, cfg: r.cfg, items: r.items } : { cfg: r.cfg, items: r.items, token };
          setHouse(next);
          if (owner) saveLocal(next);
        })
        .catch((e) => say(e.message))
        .finally(() => setLoading(false));
    }
    return () => {
      document.body.style.overflow = "";
      window.clearTimeout(saveTimer.current);
    };
  }, [sharedToken]);

  // recadinhos aparecendo em balõezinhos
  useEffect(() => {
    const withText = house.items.filter((i) => i.text);
    if (!withText.length) return setBubble(null);
    let k = 0;
    const t: number[] = [];
    const cycle = () => {
      setBubble(withText[k++ % withText.length]);
      t.push(window.setTimeout(() => setBubble(null), 4200));
    };
    t.push(window.setTimeout(cycle, 1500));
    const iv = window.setInterval(cycle, 6000);
    return () => {
      t.forEach(clearTimeout);
      clearInterval(iv);
    };
  }, [house.items]);

  const people = house.items.filter((i) => i.kind === "pessoa" && i.name);
  const count = house.items.length;
  const isOwner = !visitor;

  /** grava neste aparelho e, se a casa tiver link, no Polo Norte também */
  const commit = (next: HouseState, sync = true) => {
    setHouse(next);
    if (visitor) return;
    saveLocal(next);
    if (sync && next.token && next.editKey) {
      window.clearTimeout(saveTimer.current);
      const { token, editKey, cfg, items } = next;
      saveTimer.current = window.setTimeout(() => api.save(token!, editKey!, cfg, items).catch((e) => say(e.message)), 700);
    }
  };

  const toView = (e: RPointerEvent<Element>) => {
    const svg = svgRef.current!;
    const m = svg.getScreenCTM();
    if (m) {
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      return { x: p.x, y: p.y };
    }
    const r = svg.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * VIEW_W, y: ((e.clientY - r.top) / r.height) * VIEW_H };
  };

  /** o que vai ser colocado no próximo toque */
  const current = (): { kind: "item" | "pessoa"; ref: string } | null => {
    if (person) return { kind: "pessoa", ref: personRef(person.type, person.tone, person.outfit) };
    return pick && catalogItem(pick) ? { kind: "item", ref: pick } : null;
  };

  const place = async (x: number, y: number) => {
    const cur = current();
    if (!cur) return;
    if (count >= MAX_ITEMS) return say("A casa está lotada de amor! 💛");
    if (isOwner && !full && count >= FREE_ITEMS) {
      return setUpsell({
        title: "Sua casinha está ficando linda! 🏡",
        text: `No plano grátis cabem ${FREE_ITEMS} coisas na casa. Com o Natal Completo ela fica ilimitada, ganha a casa de biscoito, o iglu e os itens especiais.`,
      });
    }
    if (visitor && visitorAdded >= 3) return say("Você já colocou 3 coisas. Obrigado pelo carinho! 💛");
    if (!person && pick && catalogItem(pick)?.pro && !full) {
      return setUpsell({ title: "Item especial ✨", text: "O anjinho, o trenzinho, o carrossel, o unicórnio, os fogos e a Estrela de Belém fazem parte do Natal Completo." });
    }
    if (!canPlace(x, y)) return say("Coloque dentro da casa, no quintal com neve ou no telhado 🏡");
    const it: HouseItem = person
      ? {
          id: newId(),
          kind: "pessoa",
          ref: cur.ref,
          x: Math.round(x),
          y: Math.round(y),
          s: 1,
          name: sanitizeText(person.name, MAX_NAME) || undefined,
          text: sanitizeText(person.text, MAX_TEXT) || undefined,
          author: sanitizeText(person.name, MAX_NAME) || undefined,
        }
      : { id: newId(), kind: "item", ref: pick!, x: Math.round(x), y: Math.round(y), s: 1, author: author || undefined };
    Object.assign(it, settle(it));
    musicBox.chime(79 + Math.floor(Math.random() * 6), undefined, 0.12);
    if (person) {
      setPerson(null);
      setTab("itens");
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.4 }, zIndex: 120 });
      say(`${it.name || "Bonequinho"} chegou na casa! 🏡`);
    }
    if (visitor && house.token) {
      setBusy(true);
      try {
        const r = await api.add(house.token, it);
        setHouse({ ...house, items: r.items });
        setVisitorAdded((n) => n + 1);
        if (it.kind === "item") setNote(it);
      } catch (e: any) {
        say(e.message);
      } finally {
        setBusy(false);
      }
      return;
    }
    commit({ ...house, items: [...house.items, it] });
  };

  // toque no fundo: coloca o item escolhido
  const onBgDown = (e: RPointerEvent<SVGSVGElement>) => {
    if (loading || busy || santa) return;
    if (drag.current) return;
    setSelected(null);
    const { x, y } = toView(e);
    void place(x, y);
  };
  const onBgMove = (e: RPointerEvent<SVGSVGElement>) => {
    const { x, y } = toView(e);
    const d = drag.current;
    if (d) {
      // só começa a arrastar depois de mexer um pouquinho (senão é um toque)
      if (!d.moved && Math.hypot(x - d.sx, y - d.sy) < 10) return;
      d.moved = true;
      setSelected(d.id);
      setHouse((h) => ({ ...h, items: h.items.map((i) => (i.id === d.id ? { ...i, x: Math.round(x - d.dx), y: Math.round(y - d.dy) } : i)) }));
      return;
    }
    if (e.pointerType !== "mouse") return;
    const cur = current();
    setGhost(cur && canPlace(x, y) ? { ...cur, x, y } : null);
  };
  const onBgUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) {
      // toque rápido em cima de algo: com um enfeite escolhido, coloca o novo ali; sem, seleciona
      if (pick || person) {
        setSelected(null);
        void place(d.sx, d.sy);
      } else setSelected(d.id);
      return;
    }
    if (d?.moved) {
      // não deixa sair do desenho
      const it = house.items.find((i) => i.id === d.id);
      if (it && !canPlace(it.x, it.y)) {
        say("Ops! Esse lugar fica fora da casa. Voltei para perto 😉");
        const fixed = { ...it, x: Math.min(Math.max(it.x, HOUSE.x + 30), HOUSE.x + HOUSE.w - 30), y: Math.min(Math.max(it.y, HOUSE.y + 40), HOUSE.y + HOUSE.h - 20) };
        commit({ ...house, items: house.items.map((i) => (i.id === it.id ? fixed : i)) });
      } else if (it) commit({ ...house, items: house.items.map((i) => (i.id === it.id ? { ...i, ...settle(i) } : i)) });
    }
  };
  const onItemDown = (e: RPointerEvent<SVGGElement>, it: HouseItem) => {
    e.stopPropagation();
    if (it.text) setBubble(it);
    if (visitor) {
      const { x, y } = toView(e);
      void place(x, y);
      return;
    }
    const { x, y } = toView(e);
    setGhost(null);
    drag.current = { id: it.id, dx: x - it.x, dy: y - it.y, moved: false, sx: x, sy: y };
    (e.currentTarget.ownerSVGElement as SVGSVGElement | null)?.setPointerCapture?.(e.pointerId);
  };

  const sel = house.items.find((i) => i.id === selected) || null;
  const patchSel = (p: Partial<HouseItem>) => sel && commit({ ...house, items: house.items.map((i) => (i.id === sel.id ? { ...i, ...settle({ ...i, ...p }) } : i)) });
  const removeSel = () => {
    if (!sel) return;
    commit({ ...house, items: house.items.filter((i) => i.id !== sel.id) });
    setSelected(null);
  };

  const saveNote = async (text: string, by: string) => {
    if (!note) return;
    const t = sanitizeText(text, MAX_TEXT) || undefined;
    const a = sanitizeText(by, MAX_NAME) || undefined;
    const n = note;
    setNote(null);
    if (!t) return;
    if (visitor && house.token) {
      try {
        const r = await api.add(house.token, { ...n, text: t, author: a });
        setHouse({ ...house, items: r.items });
      } catch (e: any) {
        say(e.message);
      }
    } else commit({ ...house, items: house.items.map((i) => (i.id === n.id ? { ...i, text: t, author: a ?? i.author } : i)) });
    say("Recadinho guardado 💌");
  };

  // visita do Papai Noel: trenó no céu, desce pela chaminé e deixa presentes
  const callSanta = () => {
    if (santa) return;
    setNight(true);
    setSelected(null);
    musicBox.sleighBells(3);
    setSanta(1);
    window.setTimeout(() => setSanta(2), 3000);
    window.setTimeout(() => {
      setSanta(3);
      const tree = house.items.find((i) => i.ref === "arvore") || { x: HOUSE.x + 150, y: HOUSE.y + HOUSE.h - 40 };
      setGifts(
        [-48, 0, 48].map((dx, k) => ({ id: `g${k}`, kind: "item", ref: "presente", x: tree.x + dx, y: Math.min(tree.y + 42, HOUSE.y + HOUSE.h - 22), s: 0.9 + k * 0.1 })),
      );
      [72, 76, 79, 84].forEach((n, i) => window.setTimeout(() => musicBox.chime(n, undefined, 0.18), i * 150));
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.35 }, zIndex: 120, colors: ["#FFD166", "#EF233C", "#2DC653", "#FFFFFF"] });
    }, 4700);
    window.setTimeout(() => {
      setSanta(0);
      setGifts([]);
    }, 12500);
  };
  const santaLine = useMemo(() => {
    const names = people.map((p) => p.name!).filter(Boolean);
    const child = getChildName();
    const list = names.length ? (names.length > 1 ? `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}` : names[0]) : child || "família";
    return `Ho Ho Ho! Feliz Natal, ${list}! Que casa mais linda vocês montaram! 🎁`;
  }, [people]);

  const startShare = async () => {
    if (house.token) return setShare(true);
    setBusy(true);
    try {
      const r = await api.create(house.cfg, house.items);
      commit({ ...house, token: r.token, editKey: r.editKey }, false);
      setShare(true);
    } catch (e: any) {
      say(e.message);
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    if (!svgRef.current) return;
    try {
      const blob = await houseToPng(svgRef.current, house.cfg.title || "Nossa Casinha de Natal", house.items);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "casinha-de-natal-da-familia.png";
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
      say("Imagem salva! Mande para a família 📲");
    } catch {
      say("Não consegui gerar a imagem neste aparelho.");
    }
  };

  const setCfg = (p: Partial<HouseState["cfg"]>) => commit({ ...house, cfg: { ...house.cfg, ...p } });
  const childName = getChildName();
  const items = gifts.length ? [...house.items, ...gifts] : house.items;

  const tabBtn = (id: Tab, label: string) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      className={`flex-1 rounded-full py-2 text-xs sm:text-sm font-bold cursor-pointer transition-colors ${tab === id ? "bg-[#FFD166] text-[#0B132B]" : "bg-white/10 text-white hover:bg-white/15"}`}
    >
      {label}
    </button>
  );

  return (
    <motion.div className="fixed inset-0 z-[88] bg-black/90 backdrop-blur-sm flex items-start justify-center p-2 sm:p-5 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="relative my-auto w-full max-w-6xl bg-gradient-to-b from-[#3A1F0F] via-[#1C2541] to-[#0B132B] border-2 border-[#FFD166] rounded-3xl p-3 sm:p-6 shadow-2xl"
        initial={{ scale: 0.94, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        id="house-editor"
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <BackButton onClick={onClose} />
          <div className="text-xs sm:text-sm text-[#EDF2F4]/80 font-semibold text-right">
            🏡 {count}
            {isOwner && !full ? `/${FREE_ITEMS}` : ""} coisas · 👨‍👩‍👧 {people.length} na família
          </div>
        </div>

        {visitor && (
          <div className="mb-3 rounded-2xl bg-[#FFD166]/15 border border-[#FFD166]/40 px-4 py-3 text-sm text-white text-center">
            🎁 Você foi convidado(a) para a <b>{house.cfg.title || "Casinha de Natal da família"}</b>! Coloque o seu bonequinho com um recadinho e até 3 enfeites.
          </div>
        )}

        <div className="grid lg:grid-cols-[1.45fr_1fr] gap-4 sm:gap-5">
          {/* casa */}
          <div className="relative">
            {isOwner ? (
              <input
                value={house.cfg.title}
                onChange={(e) => setHouse({ ...house, cfg: { ...house.cfg, title: e.target.value.slice(0, 40) } })}
                onBlur={(e) => setCfg({ title: sanitizeText(e.target.value, 40) })}
                placeholder={childName ? `Casinha de Natal de ${childName}` : "Dê um nome: Casinha da Família Silva..."}
                aria-label="Nome da casa"
                className="w-full mb-2 bg-transparent border-b border-dashed border-[#FFD166]/50 text-center font-cinzel text-lg sm:text-2xl font-bold text-[#FFD166] placeholder:text-[#FFD166]/45 focus:outline-none focus:border-[#FFD166] py-1"
                id="house-title"
              />
            ) : (
              <h3 className="mb-2 text-center font-cinzel text-lg sm:text-2xl font-bold text-[#FFD166]">{house.cfg.title || "Casinha de Natal da Família"}</h3>
            )}
            <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#0B132B]">
              <HouseScene
                ref={svgRef}
                cfg={house.cfg}
                items={items}
                night={night}
                selected={selected}
                bubble={santa ? null : bubble}
                santa={santa}
                santaLine={santaLine}
                ghost={ghost}
                onBgDown={onBgDown}
                onBgMove={onBgMove}
                onBgUp={onBgUp}
                onItemDown={onItemDown}
                className="w-full h-auto block"
              />
              {loading && <div className="absolute inset-0 grid place-items-center bg-black/50 text-white font-bold">Abrindo a casinha... 🏡</div>}
              {/* ações do item escolhido */}
              <AnimatePresence>
                {sel && isOwner && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#0B132B]/95 border border-[#FFD166]/60 rounded-full px-2 py-1.5 shadow-xl"
                  >
                    <button onClick={() => patchSel({ s: Math.max(0.6, +(sel.s - 0.2).toFixed(1)) })} className="p-2 rounded-full bg-white/10 text-white cursor-pointer" aria-label="Diminuir">
                      <Minus className="w-4 h-4" />
                    </button>
                    <button onClick={() => patchSel({ s: Math.min(1.8, +(sel.s + 0.2).toFixed(1)) })} className="p-2 rounded-full bg-white/10 text-white cursor-pointer" aria-label="Aumentar">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button onClick={() => setNote(sel)} className="px-3 py-2 rounded-full bg-[#FFD166] text-[#0B132B] text-xs font-extrabold cursor-pointer inline-flex items-center gap-1">
                      <MessageCircleHeart className="w-4 h-4" /> Recadinho
                    </button>
                    <button onClick={removeSel} className="p-2 rounded-full bg-[#D90429] text-white cursor-pointer" aria-label="Tirar da casa">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="mt-2 text-center text-[11px] sm:text-xs text-[#EDF2F4]/65">
              {visitor ? "Escolha ao lado e toque na casa para colocar." : "Escolha ao lado e toque na casa para colocar · arraste para mudar de lugar · toque para aumentar, escrever recadinho ou tirar"}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <button onClick={() => setNight((n) => !n)} className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer" id="house-night">
                {night ? <Sun className="w-4 h-4 text-[#FFD166]" /> : <Moon className="w-4 h-4 text-[#FFD166]" />} {night ? "Dia" : "Noite de Natal"}
              </button>
              <button
                onClick={callSanta}
                disabled={Boolean(santa)}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white text-sm font-extrabold border border-[#FFD166]/60 shadow-lg cursor-pointer disabled:opacity-60 btn-shine"
                id="house-santa"
                data-celebrate
              >
                🎅 Chamar o Papai Noel
              </button>
              {isOwner && (
                <>
                  <button onClick={download} className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer" id="house-download">
                    <Download className="w-4 h-4" /> Baixar
                  </button>
                  <button onClick={startShare} disabled={busy} className="px-4 py-2 rounded-full bg-[#2DC653] text-[#0B132B] text-sm font-extrabold inline-flex items-center gap-1.5 cursor-pointer" id="house-share">
                    <Share2 className="w-4 h-4" /> Chamar a família
                  </button>
                </>
              )}
            </div>
          </div>

          {/* painel */}
          <div className="bg-[#0B132B]/70 border border-white/10 rounded-2xl p-3 sm:p-4 text-white">
            <div className="flex gap-1.5 mb-3">
              {tabBtn("itens", "🎄 Enfeites")}
              {tabBtn("familia", "👨‍👩‍👧 Família")}
              {isOwner && tabBtn("casa", "🏡 Casa")}
            </div>

            {tab === "itens" && (
              <div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {ITEM_GROUPS.map((g) => (
                    <button key={g} onClick={() => setGroup(g)} className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer border ${group === g ? "bg-white text-[#0B132B] border-white" : "border-white/20 text-white/80"}`}>
                      {g === "Especiais" ? "👑 Especiais" : g}
                    </button>
                  ))}
                </div>
                {isOwner && (
                  <button
                    onClick={() => {
                      setPick(null);
                      setPerson(null);
                      say("Modo arrumar: toque em algo para aumentar, escrever recadinho ou tirar ✋");
                    }}
                    className={`w-full mb-2 rounded-xl py-2 text-xs font-bold cursor-pointer border-2 ${!pick && !person ? "border-[#FFD166] bg-[#FFD166]/15 text-[#FFD166]" : "border-white/10 bg-white/5 text-white/85"}`}
                    id="house-arrange"
                  >
                    ✋ Arrumar a casa (mover, aumentar, recadinho, tirar)
                  </button>
                )}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {CATALOG.filter((c) => c.group === group).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setPick(c.id);
                        setPerson(null);
                      }}
                      className={`relative rounded-xl p-1.5 flex flex-col items-center gap-0.5 cursor-pointer border-2 transition-all ${pick === c.id && !person ? "border-[#FFD166] bg-[#FFD166]/15 scale-105" : "border-transparent bg-white/5 hover:bg-white/10"}`}
                      id={`house-item-${c.id}`}
                    >
                      <Thumb size={46}>
                        <ItemArt id={c.id} />
                      </Thumb>
                      <span className="text-[10px] font-semibold leading-tight text-center text-white/85">{c.label}</span>
                      {c.pro && !full && <span className="absolute -top-1 -right-1 text-[11px]">👑</span>}
                    </button>
                  ))}
                </div>
                {isOwner && people.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#FFD166] mb-1.5">Quem está colocando agora?</p>
                    <div className="flex flex-wrap gap-1.5">
                      {["", ...people.map((p) => p.name!)].map((n) => (
                        <button key={n || "ninguem"} onClick={() => setAuthor(n)} className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer border ${author === n ? "bg-[#FFD166] text-[#0B132B] border-[#FFD166]" : "border-white/20 text-white/80"}`}>
                          {n || "Todo mundo"}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-white/55 mt-1">Passe o celular: cada um escolhe o seu nome e coloca os seus enfeites.</p>
                  </div>
                )}
              </div>
            )}

            {tab === "familia" && (
              <PersonForm
                value={person}
                onChange={setPerson}
                visitor={visitor}
                onReady={() => say("Agora toque na casa onde o bonequinho vai ficar 👆")}
              />
            )}

            {tab === "casa" && isOwner && (
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#FFD166] mb-2">Modelo da casa</p>
                  <div className="grid grid-cols-3 gap-2">
                    {HOUSE_MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => (m.pro && !full ? setUpsell({ title: `${m.label} ${m.emoji}`, text: "A casa de biscoito e o iglu de gelo fazem parte do Natal Completo." }) : setCfg({ model: m.id }))}
                        className={`relative rounded-xl p-2 flex flex-col items-center cursor-pointer border-2 ${house.cfg.model === m.id ? "border-[#FFD166] bg-[#FFD166]/15" : "border-white/10 bg-white/5"}`}
                      >
                        <span className="text-3xl">{m.emoji}</span>
                        <span className="text-[11px] font-bold text-center">{m.label}</span>
                        {m.pro && !full && <span className="absolute -top-1 -right-1 text-xs">👑</span>}
                      </button>
                    ))}
                  </div>
                </div>
                {house.cfg.model !== "iglu" && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#FFD166] mb-2">Cor do telhado</p>
                    <div className="flex gap-2">
                      {ROOF_COLORS.map((c) => (
                        <button key={c} onClick={() => setCfg({ roof: c })} className={`w-9 h-9 rounded-full border-4 cursor-pointer ${house.cfg.roof === c ? "border-[#FFD166] scale-110" : "border-white/20"}`} style={{ background: c }} aria-label={`Telhado ${c}`} />
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    if (!count || !window.confirm("Começar uma casa nova? Tudo o que está nesta casa sai daqui.")) return;
                    commit({ ...house, items: [] });
                  }}
                  className="text-xs text-white/60 underline cursor-pointer"
                >
                  Começar do zero
                </button>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>{toast && <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[130] bg-[#0B132B] border border-[#FFD166]/60 text-white text-sm font-semibold rounded-full px-5 py-2.5 shadow-2xl text-center max-w-[92vw]">{toast}</motion.div>}</AnimatePresence>
        <AnimatePresence>{note && <NoteDialog item={note} defaultAuthor={author} onSave={saveNote} onClose={() => setNote(null)} />}</AnimatePresence>
        <AnimatePresence>{share && house.token && <ShareDialog token={house.token} title={house.cfg.title} onClose={() => setShare(false)} />}</AnimatePresence>
        <AnimatePresence>{upsell && <ProUpsell title={upsell.title} text={upsell.text} onUpgrade={onUpgrade} onClose={() => setUpsell(null)} />}</AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

type Draft = { type: PersonType; tone: number; outfit: number; name: string; text: string };

function PersonForm({ value, onChange, visitor, onReady }: { value: Draft | null; onChange: (v: Draft | null) => void; visitor: boolean; onReady: () => void }) {
  const [draft, setDraft] = useState<Draft>(value ?? { type: "mamae", tone: 0, outfit: 0, name: "Mamãe", text: "" });
  const ready = value !== null;
  const pet = draft.type === "cachorro" || draft.type === "gato";
  const set = (p: Partial<Draft>) => {
    setDraft({ ...draft, ...p });
    if (ready) onChange(null);
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-white/80">{visitor ? "Monte o seu bonequinho e deixe um recadinho para a família 💌" : "Crie um bonequinho para cada pessoa da família (e para o bichinho também!)"}</p>
      <div className="flex gap-3 items-center">
        <div className="shrink-0 rounded-2xl bg-gradient-to-b from-[#FCE7C9] to-[#F7D7AE] border-2 border-[#FFD166] p-1">
          <Thumb size={92}>
            <Person type={draft.type} tone={draft.tone} outfit={draft.outfit} />
          </Thumb>
        </div>
        <div className="flex-1 space-y-2">
          {!pet && (
            <div>
              <span className="text-[11px] font-bold text-white/70 block mb-1">Tom de pele</span>
              <div className="flex gap-1.5">
                {SKINS.map((c, i) => (
                  <button key={c} onClick={() => set({ tone: i })} className={`w-7 h-7 rounded-full border-[3px] cursor-pointer ${draft.tone === i ? "border-[#FFD166] scale-110" : "border-white/20"}`} style={{ background: c }} aria-label={`Tom de pele ${i + 1}`} />
                ))}
              </div>
            </div>
          )}
          <div>
            <span className="text-[11px] font-bold text-white/70 block mb-1">{pet ? "Cor da coleira" : "Cor da roupa"}</span>
            <div className="flex gap-1.5">
              {OUTFITS.map((c, i) => (
                <button key={c} onClick={() => set({ outfit: i })} className={`w-7 h-7 rounded-full border-[3px] cursor-pointer ${draft.outfit === i ? "border-[#FFD166] scale-110" : "border-white/20"}`} style={{ background: c }} aria-label={`Cor ${i + 1}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {PERSON_TYPES.map((x) => (
          <button
            key={x.id}
            onClick={() => {
              const labels = PERSON_TYPES.map((t) => t.label as string);
              set({ type: x.id, name: !draft.name || labels.includes(draft.name) ? (x.id === "tio" ? "" : x.label) : draft.name });
            }}
            className={`rounded-xl p-0.5 flex flex-col items-center cursor-pointer border-2 ${draft.type === x.id ? "border-[#FFD166] bg-[#FFD166]/15" : "border-transparent bg-white/5 hover:bg-white/10"}`}
            id={`house-person-${x.id}`}
          >
            <Thumb size={44}>
              <Person type={x.id} tone={draft.tone} outfit={draft.outfit} />
            </Thumb>
            <span className="text-[10px] font-semibold leading-tight text-center">{x.id === "tio" ? "Tio(a)" : x.label}</span>
          </button>
        ))}
      </div>
      <input
        value={draft.name}
        onChange={(e) => set({ name: e.target.value.slice(0, MAX_NAME) })}
        placeholder="Nome (ex.: Vovó Lurdes, Pedro, Thor)"
        className="w-full bg-[#1C2541] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD166]"
        id="house-person-name"
      />
      <textarea
        value={draft.text}
        onChange={(e) => set({ text: e.target.value.slice(0, MAX_TEXT) })}
        placeholder="Recadinho (opcional): aparece num balão na casa"
        rows={2}
        className="w-full bg-[#1C2541] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD166] resize-none"
      />
      <div className="flex flex-wrap gap-1.5">
        {RECADOS.slice(0, 4).map((r) => (
          <button key={r} onClick={() => set({ text: r })} className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 cursor-pointer">
            {r}
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          onChange(draft);
          onReady();
        }}
        className={`w-full py-3 rounded-full font-extrabold cursor-pointer inline-flex items-center justify-center gap-2 ${ready ? "bg-[#2DC653] text-[#0B132B]" : "bg-[#FFD166] text-[#0B132B]"}`}
        id="house-person-ready"
      >
        {ready ? "👆 Agora toque na casa" : "Colocar na casa ✨"}
      </button>
    </div>
  );
}

function NoteDialog({ item, defaultAuthor, onSave, onClose }: { item: HouseItem; defaultAuthor: string; onSave: (t: string, a: string) => void; onClose: () => void }) {
  useBackClose(true, onClose);
  const [text, setText] = useState(item.text || "");
  const [by, setBy] = useState(item.author || defaultAuthor || "");
  const c = item.kind === "item" ? catalogItem(item.ref) : null;
  return (
    <motion.div className="fixed inset-0 z-[120] bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }} className="w-full sm:max-w-md bg-[#1C2541] border-2 border-[#FFD166] rounded-t-3xl sm:rounded-3xl p-5 text-white">
        <p className="font-cinzel font-bold text-lg mb-2">
          💌 Recadinho {c ? `no(a) ${c.label.toLowerCase()}` : item.name ? `de ${item.name}` : ""}
        </p>
        <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))} rows={3} placeholder="Escreva algo carinhoso..." className="w-full bg-[#0B132B] border border-white/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FFD166] resize-none" autoFocus />
        <div className="flex flex-wrap gap-1.5 my-2">
          {RECADOS.map((r) => (
            <button key={r} onClick={() => setText(r)} className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 cursor-pointer">
              {r}
            </button>
          ))}
        </div>
        <input value={by} onChange={(e) => setBy(e.target.value.slice(0, MAX_NAME))} placeholder="Quem escreveu? (ex.: Vovó)" className="w-full bg-[#0B132B] border border-white/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FFD166]" />
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-full bg-white/10 font-bold cursor-pointer">
            Agora não
          </button>
          <button onClick={() => onSave(text, by)} className="flex-1 py-3 rounded-full bg-[#FFD166] text-[#0B132B] font-extrabold cursor-pointer">
            Guardar 💌
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ShareDialog({ token, title, onClose }: { token: string; title: string; onClose: () => void }) {
  useBackClose(true, onClose);
  const [copied, setCopied] = useState(false);
  const url = shareUrl(token);
  const msg = `🏡🎄 Vem montar a ${title || "nossa Casinha de Natal"} com a gente! Coloque o seu bonequinho e deixe um recadinho: ${url}`;
  return (
    <motion.div className="fixed inset-0 z-[120] bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }} className="w-full sm:max-w-md bg-[#1C2541] border-2 border-[#FFD166] rounded-t-3xl sm:rounded-3xl p-5 text-white text-center">
        <div className="text-5xl mb-1">👵🏡👴</div>
        <p className="font-cinzel font-bold text-xl">Chame a família!</p>
        <p className="text-sm text-white/75 mt-1 mb-4">Avós, tios e primos abrem o link, colocam o bonequinho deles na casa e deixam um recadinho. Só você pode mudar as coisas de lugar ou tirar.</p>
        <a href={whatsappUrl(msg)} target="_blank" rel="noreferrer" className="block w-full py-3 rounded-full bg-[#25D366] text-[#0B132B] font-extrabold mb-2">
          Mandar no WhatsApp
        </a>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(url).then(() => setCopied(true));
          }}
          className="w-full py-3 rounded-full bg-white/10 font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-[#2DC653]" /> : <Copy className="w-4 h-4" />} {copied ? "Link copiado!" : "Copiar link"}
        </button>
        <button onClick={onClose} className="mt-3 text-sm text-white/60 underline cursor-pointer">
          Fechar
        </button>
      </motion.div>
    </motion.div>
  );
}
