import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import { Download, Lightbulb, LightbulbOff, Share2, Sparkles, Trash2, Copy, Check, MessageCircleHeart } from "lucide-react";
import BackButton from "../BackButton";
import { useBackClose } from "../../lib/backClose";
import { musicBox } from "../../lib/christmasMusic";
import TreeSvg, { OrnamentShape } from "./TreeSvg";
import CeiaMode from "./CeiaMode";
import ProUpsell from "../ProUpsell";
import { hasFullAccess } from "../../advent/access";
import {
  AUTHOR_SUGGESTIONS,
  FREE_ORNAMENTS,
  MAX_AUTHOR,
  MAX_ORNAMENTS,
  MAX_TEXT,
  ORNAMENT_COLORS,
  ORNAMENT_TYPES,
  PHRASE_GROUPS,
  VIEW_H,
  VIEW_W,
  canPlace,
  newId,
  sanitizeText,
  type Ornament,
  type OrnamentType,
  type TreeState,
} from "../../tree/model";
import { api, loadLocal, saveLocal, shareUrl } from "../../tree/store";
import { treeToPng } from "../../tree/exportImage";
import { getChildName } from "../../advent/access";

const GOAL = 8; // frases para a estrela brilhar

export default function TreeEditor({
  onClose,
  sharedToken,
  onUpgrade,
}: {
  onClose: () => void;
  sharedToken?: string;
  onUpgrade?: () => void;
}) {
  useBackClose(true, onClose);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [tree, setTree] = useState<TreeState>(() => loadLocal());
  const [visitor, setVisitor] = useState(false);
  const [loading, setLoading] = useState(Boolean(sharedToken));
  const [type, setType] = useState<OrnamentType>("bola");
  const [color, setColor] = useState(ORNAMENT_COLORS[0]);
  const [lightsOn, setLightsOn] = useState(true);
  const [night, setNight] = useState(false);
  const [ghost, setGhost] = useState<Ornament | null>(null);
  const [pending, setPending] = useState<Ornament | null>(null);
  const [viewing, setViewing] = useState<Ornament | null>(null);
  const [ceia, setCeia] = useState(false);
  const [share, setShare] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const celebrated = useRef(false);
  const [bubble, setBubble] = useState<Ornament | null>(null);
  const [full] = useState(() => hasFullAccess());
  const [upsell, setUpsell] = useState<{ title: string; text: string } | null>(null);

  const say = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };

  // carrega a árvore compartilhada (visitante) ou sincroniza a do dono
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
          setTree(owner ? { ...local, title: r.title, ornaments: r.ornaments } : { title: r.title, ornaments: r.ornaments, token });
          if (owner) saveLocal({ ...local, title: r.title, ornaments: r.ornaments });
        })
        .catch((e) => say(e.message))
        .finally(() => setLoading(false));
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sharedToken]);

  const messages = tree.ornaments.filter((o) => o.text).length;

  // frases "saindo" dos enfeites de tempos em tempos, como balõezinhos
  useEffect(() => {
    const withText = tree.ornaments.filter((o) => o.text);
    if (!withText.length) {
      setBubble(null);
      return;
    }
    let k = Math.floor(Math.random() * withText.length);
    const timers: number[] = [];
    const cycle = () => {
      setBubble(withText[k % withText.length]);
      k++;
      timers.push(window.setTimeout(() => setBubble(null), 4200));
    };
    timers.push(window.setTimeout(cycle, 1200));
    const iv = window.setInterval(cycle, 5600);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(iv);
    };
  }, [tree.ornaments]);
  const isOwner = !visitor;

  useEffect(() => {
    if (messages >= GOAL && !celebrated.current && !loading) {
      celebrated.current = true;
      confetti({ particleCount: 140, spread: 100, origin: { y: 0.3 }, zIndex: 120, colors: ["#FFD166", "#EF233C", "#2DC653", "#FFFFFF"] });
      [72, 76, 79, 84].forEach((n, i) => setTimeout(() => musicBox.chime(n, undefined, 0.18), i * 140));
      say("A estrela acendeu! Sua árvore está cheia de amor ⭐");
    }
  }, [messages, loading]);

  const update = (t: TreeState) => {
    setTree(t);
    if (!visitor) saveLocal(t);
  };

  // converte o toque da tela para as coordenadas do desenho (funciona em qualquer tamanho de tela)
  const toView = (e: PointerEvent<SVGSVGElement> | MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget as SVGSVGElement;
    const m = svg.getScreenCTM();
    if (m) {
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      return { x: p.x, y: p.y };
    }
    const r = svg.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * VIEW_W, y: ((e.clientY - r.top) / r.height) * VIEW_H };
  };

  const onDown = (e: MouseEvent<SVGSVGElement>) => {
    if (loading || pending) return;
    const { x, y } = toView(e);
    if (tree.ornaments.length >= MAX_ORNAMENTS) {
      say("A árvore está lotada! Que família amorosa 💛");
      return;
    }
    if (!visitor && !full && tree.ornaments.length >= FREE_ORNAMENTS) {
      setUpsell({
        title: "Sua árvore está cheia de amor! 💛",
        text: `No plano grátis cabem ${FREE_ORNAMENTS} enfeites. Com o Natal Completo a árvore fica ilimitada, ganha enfeites especiais e o Modo Ceia com a voz do Papai Noel lendo as frases da família.`,
      });
      return;
    }
    if (ORNAMENT_TYPES.find((t) => t.type === type)?.pro && !full) {
      setUpsell({ title: "Enfeite especial ✨", text: "A bola de brilho e o anjinho fazem parte do Natal Completo." });
      return;
    }
    if (!canPlace(type, x, y)) {
      say(type === "presente" ? "Presentes ficam no chão, embaixo da árvore 🎁" : "Toque nos galhos da árvore para pendurar 🎄");
      return;
    }
    musicBox.chime(79 + Math.floor(Math.random() * 6), undefined, 0.12);
    setGhost(null);
    setPending({ id: newId(), type, color, x: Math.round(x), y: Math.round(y) });
  };

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (e.pointerType !== "mouse" || pending) return;
    const { x, y } = toView(e);
    setGhost(canPlace(type, x, y) ? { id: "ghost", type, color, x, y } : null);
  };

  const confirmPending = async (text: string, author: string) => {
    if (!pending) return;
    const o: Ornament = {
      ...pending,
      text: sanitizeText(text, MAX_TEXT) || undefined,
      author: sanitizeText(author, MAX_AUTHOR) || undefined,
      at: new Date().toISOString(),
    };
    setPending(null);
    if (tree.token) {
      setBusy(true);
      try {
        const r = await api.add(tree.token, o);
        update({ ...tree, ornaments: r.ornaments });
      } catch (e: any) {
        say(e.message);
      } finally {
        setBusy(false);
      }
    } else {
      update({ ...tree, ornaments: [...tree.ornaments, o] });
    }
    if (o.text) say("Frase pendurada com carinho 💌");
  };

  const removeOrnament = async (o: Ornament) => {
    setViewing(null);
    if (tree.token) {
      if (!tree.editKey) return;
      try {
        const r = await api.remove(tree.token, o.id, tree.editKey);
        update({ ...tree, ornaments: r.ornaments });
      } catch (e: any) {
        say(e.message);
      }
    } else {
      update({ ...tree, ornaments: tree.ornaments.filter((x) => x.id !== o.id) });
    }
  };

  const download = async () => {
    if (!svgRef.current) return;
    try {
      const blob = await treeToPng(svgRef.current, tree.title || "Nossa Árvore de Natal", tree.ornaments);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "arvore-de-natal-da-familia.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      say("Imagem salva! Mande para a família 📲");
    } catch {
      say("Não consegui gerar a imagem neste aparelho.");
    }
  };

  const startShare = async () => {
    if (tree.token) {
      setShare(true);
      return;
    }
    setBusy(true);
    try {
      const r = await api.create(tree.title, tree.ornaments);
      update({ ...tree, token: r.token, editKey: r.editKey });
      setShare(true);
    } catch (e: any) {
      say(e.message);
    } finally {
      setBusy(false);
    }
  };

  const saveTitle = useCallback(
    async (title: string) => {
      const t = sanitizeText(title, 40);
      update({ ...tree, title: t });
      if (tree.token && tree.editKey) api.rename(tree.token, t, tree.editKey).catch(() => {});
    },
    [tree],
  );

  const childName = getChildName();

  return (
    <motion.div
      className="fixed inset-0 z-[88] bg-black/90 backdrop-blur-sm flex items-start justify-center p-2 sm:p-5 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative my-auto w-full max-w-6xl bg-gradient-to-b from-[#123524] to-[#0B132B] border-2 border-[#FFD166] rounded-3xl p-3 sm:p-6 shadow-2xl"
        initial={{ scale: 0.94, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <BackButton onClick={onClose} />
          <div className="text-xs sm:text-sm text-[#EDF2F4]/80 font-semibold text-right">
            🎄 {tree.ornaments.length}
            {!visitor && !full ? `/${FREE_ORNAMENTS}` : ""} enfeites · 💌 {messages} {messages === 1 ? "frase" : "frases"}
          </div>
        </div>

        {visitor && (
          <div className="mb-3 rounded-2xl bg-[#FFD166]/15 border border-[#FFD166]/40 px-4 py-3 text-sm text-white text-center">
            🎁 Você foi convidado(a) para pendurar um enfeite com uma frase na <b>{tree.title || "árvore da família"}</b>!
          </div>
        )}

        <div className="grid lg:grid-cols-[1.25fr_1fr] gap-4 sm:gap-6">
          {/* árvore */}
          <div className="relative">
            {isOwner ? (
              <input
                value={tree.title}
                onChange={(e) => setTree({ ...tree, title: e.target.value.slice(0, 40) })}
                onBlur={(e) => saveTitle(e.target.value)}
                placeholder={childName ? `Árvore da família de ${childName}` : "Dê um nome: Árvore da Família..."}
                aria-label="Nome da árvore"
                className="w-full mb-2 bg-transparent border-b border-dashed border-[#FFD166]/50 text-center font-cinzel text-lg sm:text-2xl font-bold text-[#FFD166] placeholder:text-[#FFD166]/45 focus:outline-none focus:border-[#FFD166] py-1"
                id="tree-title"
              />
            ) : (
              <h3 className="mb-2 text-center font-cinzel text-lg sm:text-2xl font-bold text-[#FFD166]">{tree.title || "Árvore da Família"}</h3>
            )}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-[#0B132B] mx-auto w-full max-w-[min(100%,51vh)] lg:max-w-[min(100%,60vh)]">
              <TreeSvg
                ref={svgRef}
                ornaments={tree.ornaments}
                lightsOn={lightsOn}
                night={night}
                starGlow={messages >= GOAL}
                ghost={ghost}
                onTap={onDown}
                onPointerMove={onMove}
                onPointerLeave={() => setGhost(null)}
                onOrnamentClick={(o) => setViewing(o)}
                className="w-full h-auto block touch-manipulation select-none cursor-crosshair"
              />
              <AnimatePresence>
                {bubble && !pending && !viewing && (
                  <motion.div
                    key={bubble.id}
                    aria-live="polite"
                    className="absolute z-10 max-w-[62%] text-left bg-[#FFFDF5] text-[#1C2541] rounded-2xl rounded-bl-sm shadow-xl border-2 border-[#FFD166] px-3 py-2 pointer-events-none"
                    style={{
                      left: `${Math.min(70, Math.max(4, (bubble.x / VIEW_W) * 100 - 6))}%`,
                      bottom: `${100 - (bubble.y / VIEW_H) * 100 + 5}%`,
                    }}
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <span className="block font-serif italic text-[11px] sm:text-xs leading-snug line-clamp-3">“{bubble.text}”</span>
                    {bubble.author && <span className="block text-[10px] font-bold text-[#9B021A] mt-0.5">— {bubble.author}</span>}
                  </motion.div>
                )}
              </AnimatePresence>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-semibold">Buscando a árvore no Polo Norte...</div>
              )}
              {!loading && tree.ornaments.length === 0 && (
                <div className="absolute bottom-[18%] inset-x-0 text-center pointer-events-none">
                  <span className="inline-block bg-black/55 text-white text-xs sm:text-sm font-semibold rounded-full px-4 py-2">
                    👆 Escolha um enfeite e toque na árvore
                  </span>
                </div>
              )}
            </div>
            {/* barra de progresso da estrela */}
            <div className="mt-2 flex items-center gap-2 text-xs text-[#EDF2F4]/75">
              <span>⭐</span>
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#FFD166] to-[#F4A261] transition-all" style={{ width: `${Math.min(100, (messages / GOAL) * 100)}%` }} />
              </div>
              <span>{messages >= GOAL ? "Estrela acesa!" : `${GOAL - messages} frases para acender a estrela`}</span>
            </div>

          </div>

          {/* painel */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#FFD166] mb-2">1. Escolha o enfeite</p>
              <div className="grid grid-cols-4 gap-2">
                {ORNAMENT_TYPES.map((t) => (
                  <button
                    key={t.type}
                    onClick={() => {
                      if (t.pro && !full) {
                        setUpsell({ title: `${t.emoji} ${t.label}`, text: "Este enfeite especial faz parte do Natal Completo." });
                        return;
                      }
                      setType(t.type);
                    }}
                    className={`rounded-xl p-1.5 border flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                      type === t.type ? "bg-white/15 border-[#FFD166]" : "bg-white/5 border-white/10 hover:border-white/30"
                    }`}
                    aria-pressed={type === t.type}
                  >
                    <svg viewBox="-30 -34 60 60" className="w-10 h-10">
                      <OrnamentShape o={{ id: t.type, type: t.type, color, x: 0, y: 0 }} />
                    </svg>
                    <span className="text-[10px] sm:text-[11px] text-white/85 leading-tight text-center">
                      {t.label}
                      {t.pro && !full && " 🔒"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#FFD166] mb-2">2. Escolha a cor</p>
              <div className="flex flex-wrap gap-2">
                {ORNAMENT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 cursor-pointer ${color === c ? "border-[#FFD166] scale-110" : "border-white/20"}`}
                    style={{ background: c }}
                    aria-label={`Cor ${c}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-white/85 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
              <b className="text-[#FFD166]">3.</b> Toque na árvore para pendurar e escreva uma frase de carinho. Toque num enfeite para ler a frase. 💌
            </p>

            <button
              onClick={() => {
                const on = !night;
                setNight(on);
                if (on) {
                  setLightsOn(true);
                  [72, 76, 79, 84, 88].forEach((n, i) => setTimeout(() => musicBox.chime(n, undefined, 0.1), i * 110));
                }
              }}
              className={`w-full rounded-2xl py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 border cursor-pointer transition-colors ${
                night ? "bg-[#FFD166] text-[#0B132B] border-[#FFD166]" : "bg-gradient-to-r from-[#0B132B] to-[#24305E] text-white border-[#FFD166]/50"
              }`}
              id="tree-night-btn"
              aria-pressed={night}
            >
              {night ? "☀️ Voltar para o dia" : "🌙 Noite mágica: a árvore ilumina a noite"}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <ToolBtn onClick={() => setCeia(true)} disabled={!messages} highlight>
                <Sparkles className="w-4 h-4" /> Modo Ceia
              </ToolBtn>
              <ToolBtn onClick={startShare} disabled={busy}>
                <Share2 className="w-4 h-4" /> {tree.token ? "Convidar família" : "Chamar a família"}
              </ToolBtn>
              <ToolBtn onClick={download}>
                <Download className="w-4 h-4" /> Baixar imagem
              </ToolBtn>
              <ToolBtn onClick={() => setLightsOn((v) => !v)}>
                {lightsOn ? <LightbulbOff className="w-4 h-4" /> : <Lightbulb className="w-4 h-4" />} {lightsOn ? "Apagar luzes" : "Acender luzes"}
              </ToolBtn>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Dica: no <b>Modo Ceia</b>, na noite de Natal, as frases aparecem uma por uma na tela para a família ler junta. Com
              "Chamar a família", avós e tios penduram enfeites de qualquer lugar pelo link.
            </p>
          </div>
        </div>

        {/* mural com todas as frases */}
        {messages > 0 && (
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FFD166] mb-2">💌 Mural de frases da família ({messages})</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
              {tree.ornaments
                .filter((o) => o.text)
                .slice()
                .reverse()
                .map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setViewing(o)}
                    className="flex items-start gap-2 text-left bg-[#FFFDF5] text-[#1C2541] rounded-xl p-2.5 border border-[#FFD166]/60 hover:shadow-lg cursor-pointer"
                  >
                    <svg viewBox="-30 -34 60 60" className="w-8 h-8 shrink-0">
                      <OrnamentShape o={o} showName={false} />
                    </svg>
                    <span className="min-w-0">
                      <span className="block font-serif italic text-xs leading-snug line-clamp-3">“{o.text}”</span>
                      {o.author && <span className="block text-[10px] font-bold text-[#9B021A] mt-0.5">— {o.author}</span>}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {pending && <PhraseDialog key="p" ornament={pending} childName={childName} onCancel={() => setPending(null)} onSave={confirmPending} />}
          {viewing && (
            <ViewDialog
              key="v"
              o={viewing}
              canRemove={!tree.token || Boolean(tree.editKey)}
              onRemove={() => removeOrnament(viewing)}
              onClose={() => setViewing(null)}
            />
          )}
          {share && tree.token && <ShareDialog key="s" token={tree.token} title={tree.title} onClose={() => setShare(false)} />}
          {ceia && (
            <CeiaMode
              key="c"
              title={tree.title}
              ornaments={tree.ornaments.filter((o) => o.text)}
              onClose={() => setCeia(false)}
              full={full}
              treeToken={tree.token}
              onLocked={() =>
                setUpsell({
                  title: "A voz do Papai Noel na ceia 🎅",
                  text: "Com o Natal Completo o Papai Noel lê em voz alta cada frase da família no Modo Ceia.",
                })
              }
            />
          )}
          {upsell && (
            <ProUpsell
              key="u"
              title={upsell.title}
              text={upsell.text}
              onClose={() => setUpsell(null)}
              onUpgrade={
                onUpgrade
                  ? () => {
                      setUpsell(null);
                      setTimeout(onUpgrade, 120);
                    }
                  : undefined
              }
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[130] bg-[#0B132B] text-white text-sm font-semibold px-5 py-3 rounded-full border border-[#FFD166]/60 shadow-2xl max-w-[92vw] text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function ToolBtn({ children, onClick, disabled, highlight }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; highlight?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-3 py-2.5 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        highlight ? "bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white border border-[#FFD166]/50" : "bg-white/10 hover:bg-white/20 text-white border border-white/15"
      }`}
    >
      {children}
    </button>
  );
}

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useBackClose(true, onClose);
  return (
    <motion.div
      className="fixed inset-0 z-[110] bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full sm:max-w-lg max-h-[88vh] overflow-y-auto bg-[#0B132B] border-2 border-[#FFD166] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl"
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        exit={{ y: 60 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function PhraseDialog({
  ornament,
  childName,
  onCancel,
  onSave,
}: {
  ornament: Ornament;
  childName: string;
  onCancel: () => void;
  onSave: (text: string, author: string) => void;
}) {
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [group, setGroup] = useState(0);
  const authors = childName ? [childName, ...AUTHOR_SUGGESTIONS] : AUTHOR_SUGGESTIONS;
  return (
    <Sheet onClose={onCancel}>
      <div className="flex items-center gap-3 mb-3">
        <svg viewBox="-30 -34 60 60" className="w-12 h-12 shrink-0">
          <OrnamentShape o={ornament} showName={false} />
        </svg>
        <div>
          <h4 className="font-cinzel text-lg font-bold text-white">Escreva uma frase de carinho</h4>
          <p className="text-xs text-white/60">Ela fica guardada dentro do enfeite. (Opcional)</p>
        </div>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
        {PHRASE_GROUPS.map((g, i) => (
          <button
            key={g.label}
            onClick={() => setGroup(i)}
            className={`shrink-0 text-xs font-bold rounded-full px-3 py-1.5 cursor-pointer ${group === i ? "bg-[#FFD166] text-[#0B132B]" : "bg-white/10 text-white"}`}
          >
            {g.emoji} {g.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 mb-3">
        {PHRASE_GROUPS[group].phrases.map((p) => (
          <button
            key={p}
            onClick={() => setText(p)}
            className={`text-left text-sm rounded-xl px-3 py-2 border cursor-pointer ${text === p ? "border-[#FFD166] bg-[#FFD166]/10 text-white" : "border-white/10 bg-white/5 text-white/85 hover:border-white/30"}`}
          >
            {p}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
        placeholder="Ou escreva do seu jeito..."
        rows={2}
        className="w-full bg-[#1C2541] border border-white/15 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/35 focus:outline-none focus:border-[#FFD166]"
        id="tree-phrase"
      />
      <div className="text-right text-[10px] text-white/40 mb-2">
        {text.length}/{MAX_TEXT}
      </div>
      <p className="text-xs font-bold text-[#FFD166] mb-1.5">Quem está escrevendo?</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {authors.map((a) => (
          <button
            key={a}
            onClick={() => setAuthor(a)}
            className={`text-xs rounded-full px-3 py-1.5 cursor-pointer ${author === a ? "bg-[#FFD166] text-[#0B132B] font-bold" : "bg-white/10 text-white"}`}
          >
            {a}
          </button>
        ))}
      </div>
      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value.slice(0, MAX_AUTHOR))}
        placeholder="Nome ou apelido (só o primeiro nome)"
        className="w-full bg-[#1C2541] border border-white/15 rounded-full px-4 py-2 text-white text-sm placeholder:text-white/35 focus:outline-none focus:border-[#FFD166] mb-4"
        id="tree-author"
      />
      <div className="flex gap-2">
        <button onClick={() => onSave("", author)} className="flex-1 rounded-full py-3 text-sm font-bold bg-white/10 text-white cursor-pointer">
          Só pendurar
        </button>
        <button
          onClick={() => onSave(text, author)}
          disabled={!text.trim()}
          className="flex-[1.4] rounded-full py-3 text-sm font-bold bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white border border-[#FFD166]/50 cursor-pointer disabled:opacity-40"
          id="tree-phrase-save"
        >
          💌 Pendurar com a frase
        </button>
      </div>
    </Sheet>
  );
}

function ViewDialog({ o, canRemove, onRemove, onClose }: { o: Ornament; canRemove: boolean; onRemove: () => void; onClose: () => void }) {
  return (
    <Sheet onClose={onClose}>
      <div className="text-center">
        <svg viewBox="-30 -34 60 60" className="w-16 h-16 mx-auto">
          <OrnamentShape o={o} showName={false} />
        </svg>
        {o.text ? (
          <div className="parchment-bg rounded-2xl p-5 mt-2 text-[#1C2541]">
            <MessageCircleHeart className="w-5 h-5 text-[#9B021A] mx-auto mb-1" />
            <p className="font-serif text-lg italic leading-snug">“{o.text}”</p>
            {o.author && <p className="mt-2 font-bold text-[#9B021A]">— {o.author}</p>}
          </div>
        ) : (
          <p className="text-white/70 text-sm mt-2">Este enfeite não tem frase.</p>
        )}
        <div className="flex gap-2 mt-4">
          {canRemove && (
            <button onClick={onRemove} className="rounded-full px-4 py-2.5 text-sm font-bold bg-white/10 text-white inline-flex items-center gap-1.5 cursor-pointer">
              <Trash2 className="w-4 h-4" /> Tirar
            </button>
          )}
          <button onClick={onClose} className="flex-1 rounded-full py-2.5 text-sm font-bold bg-[#FFD166] text-[#0B132B] cursor-pointer">
            Fechar
          </button>
        </div>
      </div>
    </Sheet>
  );
}

function ShareDialog({ token, title, onClose }: { token: string; title: string; onClose: () => void }) {
  const url = shareUrl(token);
  const [copied, setCopied] = useState(false);
  const msg = `🎄 Venha pendurar um enfeite com uma frase de carinho na ${title || "nossa Árvore de Natal"}! ${url}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* sem área de transferência */
    }
  };
  const native = async () => {
    try {
      await navigator.share({ title: "Árvore de Natal da Família", text: msg, url });
    } catch {
      /* cancelado */
    }
  };
  return (
    <Sheet onClose={onClose}>
      <h4 className="font-cinzel text-xl font-bold text-white mb-1">Chame a família para enfeitar 🎄</h4>
      <p className="text-sm text-white/70 mb-4">
        Mande o link para avós, tios e padrinhos. Eles penduram um enfeite com uma frase, de onde estiverem, e tudo aparece aqui na sua
        árvore.
      </p>
      <div className="flex gap-2 mb-3">
        <input readOnly value={url} className="flex-1 min-w-0 bg-[#1C2541] border border-white/15 rounded-full px-4 py-2 text-white text-xs" />
        <button onClick={copy} className="rounded-full px-4 bg-white/10 text-white text-sm font-bold inline-flex items-center gap-1 cursor-pointer">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(msg)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center rounded-full py-3 font-bold bg-[#25D366] text-[#0B132B] mb-2"
      >
        Enviar no WhatsApp
      </a>
      {typeof navigator !== "undefined" && "share" in navigator && (
        <button onClick={native} className="w-full rounded-full py-3 font-bold bg-white/10 text-white cursor-pointer mb-2">
          Outras opções de envio
        </button>
      )}
      <p className="text-[11px] text-white/45 text-center">Quem tem o link pode adicionar enfeites. Só você (neste aparelho) pode tirar.</p>
    </Sheet>
  );
}
