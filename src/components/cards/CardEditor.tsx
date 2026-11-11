import { useEffect, useMemo, useRef, useState, type ChangeEvent, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import {
  Camera,
  Check,
  Copy,
  Crop,
  Expand,
  Facebook,
  FileDown,
  Film,
  ImageDown,
  ImagePlus,
  Instagram,
  LayoutGrid,
  Link,
  Lock,
  MessageCircle,
  Move,
  Music,
  Play,
  RotateCw,
  Save,
  Share2,
  ShieldCheck,
  Shrink,
  Smartphone,
  Square,
  Trash2,
  Type,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useBackClose } from "../../lib/backClose";
import { hasFullAccess } from "../../advent/access";
import { canShareFiles, canvasToBlob, copyText, downloadBlob, ensureFonts, facebookUrl, safeName, shareOrDownload, whatsappUrl } from "../../lib/shareKit";
import { musicBox } from "../../lib/christmasMusic";
import { TEMPLATES, templateOf, lastPhotoBox } from "../../cards/templates";
import { SITE, SOCIAL, cardCanvas, cardDims, renderFace, socialCanvas, type SocialVariant } from "../../cards/render";
import { BLEED, DPI, PAPERS, buildPdf, planPdf, type PdfOptions, type PaperId } from "../../cards/pdf";
import { DURATION, VIDEO_FORMATS, VIDEO_STYLES, drawFrame, prepareLayers, recordCardVideo, type VideoFormat, type VideoMusic, type VideoStyle } from "../../cards/video";
import { isImage, photoFromBlob } from "../../cards/photo";
import { newCardId, saveCard, type SavedCard } from "../../cards/store";
import type { CardData, CardTexts, Crop as CropT, Orientation, TemplateId } from "../../cards/types";

export const MESSAGES = [
  "Neste Natal, nossa família preparou uma lembrança especial. Que o amor, a paz e a esperança estejam presentes em todos os lares.",
  "Que a luz do Natal ilumine a sua casa e que o novo ano chegue cheio de saúde, alegria e bons encontros.",
  "Obrigado por fazer parte da nossa história. Desejamos a vocês um Natal de muito amor e um ano novo abençoado.",
  "Que o Menino Jesus renove a fé e a esperança em cada coração. Feliz e abençoado Natal!",
  "Entre abraços, risadas e muita magia, desejamos um Natal inesquecível para toda a família.",
  "Que não falte amor na mesa, paz no coração e sonhos para o ano que vem. Boas festas!",
];
export const SHARE_TEXTS = [
  "Neste Natal, nossa família preparou uma lembrança especial. Que o amor, a paz e a esperança estejam presentes em todos os lares. Feliz Natal! ❤️🎄",
  "Fizemos o nosso cartão de Natal com muito carinho. Que a magia do Natal chegue até você! 🎄✨",
  "Feliz Natal! Que o novo ano traga saúde, paz e muitas alegrias para vocês. ❤️",
];
const MAX_MSG = 280;

type Tab = "modelo" | "foto" | "texto" | "pdf" | "imagem" | "video" | "compartilhar";
const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: "modelo", label: "Modelo", icon: <LayoutGrid className="w-4 h-4" /> },
  { id: "foto", label: "Foto", icon: <Camera className="w-4 h-4" /> },
  { id: "texto", label: "Textos", icon: <Type className="w-4 h-4" /> },
  { id: "pdf", label: "Imprimir", icon: <FileDown className="w-4 h-4" /> },
  { id: "imagem", label: "Imagem", icon: <ImageDown className="w-4 h-4" /> },
  { id: "video", label: "Vídeo", icon: <Film className="w-4 h-4" /> },
  { id: "compartilhar", label: "Compartilhar", icon: <Share2 className="w-4 h-4" /> },
];

const PREVIEW_LONG = 1300;
const defaultTexts = (): CardTexts => ({
  title: "Feliz Natal",
  family: "Família Silva",
  children: "",
  message: MESSAGES[0],
  signature: "Com carinho, de todos nós",
  year: `Natal ${new Date().getFullYear()}`,
});

export default function CardEditor({
  template,
  saved,
  onClose,
  onSaved,
  onUpgrade,
}: {
  template: TemplateId;
  saved?: SavedCard;
  onClose: () => void;
  onSaved?: () => void;
  onUpgrade?: () => void;
}) {
  useBackClose(true, onClose);
  const full = hasFullAccess();
  const [id] = useState(saved?.id ?? newCardId());
  const [tpl, setTpl] = useState<TemplateId>(saved?.template ?? template);
  const [orientation, setOrientation] = useState<Orientation>(saved?.orientation ?? "retrato");
  const [texts, setTexts] = useState<CardTexts>(() =>
    saved ? { title: saved.title, family: saved.family, children: saved.children, message: saved.message, signature: saved.signature, year: saved.year } : defaultTexts(),
  );
  const [crop, setCrop] = useState<CropT>(saved?.crop ?? { zoom: 1, ox: 0, oy: 0, fit: false, rot: 0 });
  const [orig, setOrig] = useState<Blob | null>(saved?.photo ?? null);
  const [work, setWork] = useState<HTMLCanvasElement | null>(null);
  const [consent, setConsent] = useState(!!saved?.photo);
  const [tab, setTab] = useState<Tab>("foto");
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ t: string; ok?: boolean } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [savedOnce, setSavedOnce] = useState(!!saved);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const camRef = useRef<HTMLInputElement | null>(null);
  const photoBox = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const d: CardData = useMemo(
    () => ({ ...texts, template: tpl, orientation, photo: work, photoW: work?.width ?? 0, photoH: work?.height ?? 0, crop, watermark: !full }),
    [texts, tpl, orientation, work, crop, full],
  );

  const say = (t: string, ok = true) => {
    setNote({ t, ok });
    window.setTimeout(() => setNote((n) => (n?.t === t ? null : n)), 3200);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // abre a foto salva (original intacto) com o giro escolhido
  useEffect(() => {
    let alive = true;
    if (!orig) {
      setWork(null);
      return;
    }
    photoFromBlob(orig, crop.rot ?? 0)
      .then((c) => alive && setWork(c))
      .catch((e) => say((e as Error).message, false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orig, crop.rot]);

  // prévia ao vivo
  const raf = useRef(0);
  useEffect(() => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      ensureFonts().then(() => {
        const c = canvas.current;
        if (!c) return;
        const { W, H } = cardDims(orientation, PREVIEW_LONG);
        if (c.width !== W || c.height !== H) {
          c.width = W;
          c.height = H;
        }
        renderFace(c.getContext("2d")!, W, H, d);
        photoBox.current = lastPhotoBox ? { ...lastPhotoBox } : null;
      });
    });
  }, [d, orientation]);

  const touch = () => setDirty(true);
  const setText = (k: keyof CardTexts, v: string) => {
    setTexts((t) => ({ ...t, [k]: v }));
    touch();
  };
  const setCropP = (p: Partial<CropT>) => {
    setCrop((c) => ({ ...c, ...p }));
    touch();
  };

  /* ---------------- foto */
  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!isImage(f)) return say("Escolha um arquivo de imagem (JPG, PNG ou HEIC).", false);
    if (f.size > 40 * 1024 * 1024) return say("Essa foto é muito grande (máx. 40 MB).", false);
    setBusy("Abrindo a foto...");
    try {
      const c = await photoFromBlob(f, 0);
      setOrig(f);
      setCrop({ zoom: 1, ox: 0, oy: 0, fit: false, rot: 0 });
      setWork(c);
      touch();
      say(`Foto colocada (${c.width}×${c.height}). Arraste na prévia para enquadrar.`);
    } catch (err) {
      say((err as Error).message, false);
    } finally {
      setBusy(null);
    }
  };
  const openPicker = (cam = false) => {
    if (!consent) {
      say("Marque a autorização para usar a foto.", false);
      return;
    }
    (cam ? camRef : fileRef).current?.click();
  };

  // arrastar / pinçar / rolar a foto dentro da moldura
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<{ sx: number; sy: number; c: CropT; dist?: number } | null>(null);
  const toCanvas = (e: { clientX: number; clientY: number }) => {
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };
  const inBox = (p: { x: number; y: number }) => {
    const b = photoBox.current;
    return !!b && p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
  };
  const overflow = (c: CropT) => {
    const b = photoBox.current;
    if (!b || !work) return { ex: 0, ey: 0 };
    const k = (c.fit ? Math.min(b.w / work.width, b.h / work.height) : Math.max(b.w / work.width, b.h / work.height)) * Math.max(1, c.zoom);
    return { ex: Math.max(0, work.width * k - b.w), ey: Math.max(0, work.height * k - b.h) };
  };
  const onDown = (e: RPointerEvent<HTMLCanvasElement>) => {
    const p = toCanvas(e);
    if (!work) {
      if (inBox(p)) {
        setTab("foto");
        openPicker();
      }
      return;
    }
    if (!inBox(p) && ptrs.current.size === 0) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    ptrs.current.set(e.pointerId, p);
    if (ptrs.current.size === 2) {
      const [a, b] = [...ptrs.current.values()];
      drag.current = { sx: 0, sy: 0, c: crop, dist: Math.hypot(a.x - b.x, a.y - b.y) };
    } else drag.current = { sx: p.x, sy: p.y, c: crop };
  };
  const onMove = (e: RPointerEvent<HTMLCanvasElement>) => {
    if (!drag.current || !ptrs.current.has(e.pointerId)) return;
    const p = toCanvas(e);
    ptrs.current.set(e.pointerId, p);
    const st = drag.current;
    if (ptrs.current.size >= 2 && st.dist) {
      const [a, b] = [...ptrs.current.values()];
      const z = Math.max(1, Math.min(4, st.c.zoom * (Math.hypot(a.x - b.x, a.y - b.y) / st.dist)));
      setCropP({ zoom: z });
      return;
    }
    const { ex, ey } = overflow(st.c);
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    setCropP({ ox: ex ? clamp(st.c.ox - ((p.x - st.sx) * 2) / ex) : 0, oy: ey ? clamp(st.c.oy - ((p.y - st.sy) * 2) / ey) : 0 });
  };
  const onUp = (e: RPointerEvent<HTMLCanvasElement>) => {
    ptrs.current.delete(e.pointerId);
    if (ptrs.current.size === 0) drag.current = null;
    else {
      const [p] = [...ptrs.current.values()];
      drag.current = { sx: p.x, sy: p.y, c: crop };
    }
  };
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const wheel = (e: WheelEvent) => {
      if (!work || !inBox(toCanvas(e))) return;
      e.preventDefault();
      setCrop((cr) => ({ ...cr, zoom: Math.max(1, Math.min(4, cr.zoom * (e.deltaY < 0 ? 1.06 : 1 / 1.06))) }));
      setDirty(true);
    };
    c.addEventListener("wheel", wheel, { passive: false });
    return () => c.removeEventListener("wheel", wheel);
  });

  /* ---------------- salvar */
  const save = async (quiet = false) => {
    try {
      const thumb = cardCanvas(d, 420).toDataURL("image/jpeg", 0.72);
      await saveCard({ id, template: tpl, orientation, crop, photo: orig, thumb, ...texts, updatedAt: Date.now() });
      setDirty(false);
      setSavedOnce(true);
      onSaved?.();
      if (!quiet) say("Cartão salvo em Meus cartões (neste aparelho).");
    } catch {
      if (!quiet) say("Não consegui salvar neste navegador (modo anônimo?). Baixe o PDF ou a imagem.", false);
    }
  };
  // depois do primeiro "Salvar", as mudanças são guardadas sozinhas
  useEffect(() => {
    if (!savedOnce || !dirty) return;
    const t = window.setTimeout(() => save(true), 1200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, savedOnce, dirty]);

  const fname = (ext: string, extra = "") => `cartao-de-natal-${safeName(texts.family || "familia")}${extra}.${ext}`;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-[#060B1C]/95 backdrop-blur-sm flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Personalizar cartão de Natal"
      id="card-editor"
    >
      {/* topo */}
      <div className="flex items-center gap-2 px-3 sm:px-5 py-2.5 border-b border-white/10 bg-[#0B132B]">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-widest text-[#FFD166] font-bold">Cartão de Natal</p>
          <p className="text-white font-cinzel font-bold text-sm sm:text-base truncate">Modelo {templateOf(tpl).name}</p>
        </div>
        <button onClick={() => save()} className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold px-3 py-2 rounded-xl cursor-pointer" id="card-save">
          <Save className="w-4 h-4" /> <span className="hidden sm:inline">{savedOnce ? (dirty ? "Salvar" : "Salvo") : "Salvar"}</span>
        </button>
        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer" aria-label="Fechar" id="card-close">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {/* prévia */}
        <div className="relative shrink-0 lg:flex-1 flex flex-col items-center justify-center gap-1.5 p-3 sm:p-5 lg:p-8 bg-[radial-gradient(ellipse_at_center,#1C2A55_0%,#060B1C_75%)] h-[42vh] sm:h-[46vh] lg:h-auto">
          <canvas
            ref={canvas}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            className={`max-w-full max-h-[calc(100%-24px)] min-h-0 w-auto h-auto shadow-[0_20px_60px_rgba(0,0,0,0.6)] touch-none select-none ${work ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
            style={{ aspectRatio: orientation === "retrato" ? "1 / 1.4142" : "1.4142 / 1" }}
            id="card-preview"
          />
          {work && (
            <span className="shrink-0 text-[10px] sm:text-xs text-white/60 inline-flex items-center gap-1.5 pointer-events-none">
              <Move className="w-3 h-3" /> Arraste a foto · pince ou role para dar zoom
            </span>
          )}
          {busy && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-[#0B132B] border border-[#FFD166]/50 rounded-2xl px-5 py-4 text-white text-sm font-bold flex items-center gap-3">
                <span className="w-5 h-5 border-2 border-[#FFD166] border-t-transparent rounded-full animate-spin" /> {busy}
              </div>
            </div>
          )}
        </div>

        {/* painel */}
        <div className="flex-1 lg:flex-none lg:w-[430px] min-h-0 flex flex-col bg-[#0B132B] border-t lg:border-t-0 lg:border-l border-white/10">
          <div className="flex gap-1 overflow-x-auto lg:flex-wrap px-2 pt-2 pb-1 border-b border-white/10 shrink-0" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${tab === t.id ? "bg-[#FFD166] text-[#0B132B]" : "text-white/75 hover:bg-white/10"}`}
                id={`card-tab-${t.id}`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 text-white">
            {tab === "modelo" && (
              <ModelTab
                tpl={tpl}
                orientation={orientation}
                onTpl={(t) => {
                  setTpl(t);
                  touch();
                }}
                onOrientation={(o) => {
                  setOrientation(o);
                  touch();
                }}
              />
            )}
            {tab === "foto" && (
              <div className="space-y-4">
                <label className="flex gap-2.5 items-start text-xs text-white/80 bg-white/5 rounded-xl p-3 cursor-pointer">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-[#2DC653] w-4 h-4" id="card-consent" />
                  <span>Tenho autorização das pessoas da foto (e dos responsáveis pelas crianças) para usá-la neste cartão.</span>
                </label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pick} id="card-file" />
                <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} />
                <div className="grid grid-cols-2 gap-2">
                  <Btn onClick={() => openPicker()} primary id="card-photo-pick">
                    <ImagePlus className="w-4 h-4" /> {work ? "Trocar foto" : "Escolher foto"}
                  </Btn>
                  <Btn onClick={() => openPicker(true)} id="card-photo-camera">
                    <Camera className="w-4 h-4" /> Tirar foto
                  </Btn>
                </div>
                {work ? (
                  <>
                    <Field label={`Zoom · ${Math.round(crop.zoom * 100)}%`}>
                      <div className="flex items-center gap-2">
                        <IconBtn onClick={() => setCropP({ zoom: Math.max(1, crop.zoom / 1.12) })} label="Diminuir zoom">
                          <ZoomOut className="w-4 h-4" />
                        </IconBtn>
                        <input type="range" min={1} max={4} step={0.01} value={crop.zoom} onChange={(e) => setCropP({ zoom: +e.target.value })} className="flex-1 accent-[#FFD166]" id="card-zoom" aria-label="Zoom da foto" />
                        <IconBtn onClick={() => setCropP({ zoom: Math.min(4, crop.zoom * 1.12) })} label="Aumentar zoom">
                          <ZoomIn className="w-4 h-4" />
                        </IconBtn>
                      </div>
                    </Field>
                    <Field label="Enquadramento">
                      <div className="grid grid-cols-2 gap-2">
                        <Btn onClick={() => setCropP({ fit: false })} active={!crop.fit} id="card-fill">
                          <Expand className="w-4 h-4" /> Preencher
                        </Btn>
                        <Btn onClick={() => setCropP({ fit: true, zoom: 1, ox: 0, oy: 0 })} active={crop.fit} id="card-fit">
                          <Shrink className="w-4 h-4" /> Foto inteira
                        </Btn>
                        <Btn onClick={() => setCropP({ zoom: 1, ox: 0, oy: 0 })} id="card-center">
                          <Crop className="w-4 h-4" /> Centralizar
                        </Btn>
                        <Btn onClick={() => setCropP({ rot: ((crop.rot ?? 0) + 1) % 4, ox: 0, oy: 0 })} id="card-rotate">
                          <RotateCw className="w-4 h-4" /> Girar
                        </Btn>
                      </div>
                    </Field>
                    <Field label="Posição fina">
                      <div className="space-y-2">
                        <input type="range" min={-1} max={1} step={0.01} value={crop.ox} onChange={(e) => setCropP({ ox: +e.target.value })} className="w-full accent-[#FFD166]" aria-label="Posição horizontal" id="card-ox" />
                        <input type="range" min={-1} max={1} step={0.01} value={crop.oy} onChange={(e) => setCropP({ oy: +e.target.value })} className="w-full accent-[#FFD166]" aria-label="Posição vertical" id="card-oy" />
                      </div>
                    </Field>
                    <Btn
                      onClick={() => {
                        setOrig(null);
                        setWork(null);
                        setCrop({ zoom: 1, ox: 0, oy: 0, fit: false, rot: 0 });
                        touch();
                        say("Foto removida do cartão.");
                      }}
                      danger
                      id="card-photo-remove"
                    >
                      <Trash2 className="w-4 h-4" /> Remover foto
                    </Btn>
                    <p className="text-[11px] text-white/50">
                      Foto original preservada ({work.width}×{work.height} px de trabalho). Nada de inteligência artificial: o rosto de vocês aparece exatamente como na foto.
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-white/60 leading-relaxed">Dica: fotos na horizontal ou quadradas, com todos bem iluminados, ficam lindas. Depois é só arrastar para enquadrar.</p>
                )}
                <p className="text-[11px] text-[#2DC653] flex gap-1.5">
                  <ShieldCheck className="w-4 h-4 shrink-0" /> A foto fica só neste aparelho e nunca vai para o nosso servidor.
                </p>
              </div>
            )}
            {tab === "texto" && <TextTab texts={texts} setText={setText} />}
            {tab === "pdf" && <PdfTab d={d} full={full} onUpgrade={onUpgrade} setBusy={setBusy} say={say} fname={fname} onOrientation={(o) => (setOrientation(o), touch())} />}
            {tab === "imagem" && <ImageTab d={d} full={full} onUpgrade={onUpgrade} setBusy={setBusy} say={say} fname={fname} />}
            {tab === "video" && <VideoTab d={d} full={full} onUpgrade={onUpgrade} say={say} fname={fname} />}
            {tab === "compartilhar" && <ShareTab d={d} say={say} fname={fname} setBusy={setBusy} />}
          </div>
          {note && (
            <div className={`mx-3 mb-3 rounded-xl px-3 py-2 text-xs font-bold ${note.ok === false ? "bg-red-500/20 text-red-200 border border-red-400/40" : "bg-[#2DC653]/15 text-[#BFF5CF] border border-[#2DC653]/40"}`} role="status" id="card-note">
              {note.t}
            </div>
          )}
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ peças */

function Btn({ children, onClick, primary, active, danger, disabled, id, big }: { children: ReactNode; onClick: () => void; primary?: boolean; active?: boolean; danger?: boolean; disabled?: boolean; id?: string; big?: boolean }) {
  const cls = primary
    ? "bg-gradient-to-r from-[#2DC653] to-[#1B7F3B] text-white border-[#FFD166]/40"
    : danger
      ? "bg-red-500/10 text-red-200 border-red-400/30 hover:bg-red-500/20"
      : active
        ? "bg-[#FFD166] text-[#0B132B] border-[#FFD166]"
        : "bg-white/5 text-white border-white/15 hover:bg-white/10";
  return (
    <button onClick={onClick} disabled={disabled} id={id} className={`w-full inline-flex items-center justify-center gap-2 rounded-xl border font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${big ? "py-3.5 text-sm" : "py-2.5 text-xs sm:text-sm"} ${cls}`}>
      {children}
    </button>
  );
}
function IconBtn({ children, onClick, label }: { children: ReactNode; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} aria-label={label} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer">
      {children}
    </button>
  );
}
function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[11px] uppercase tracking-wider font-bold text-[#FFD166]">{label}</span>
        {hint && <span className="text-[10px] text-white/45">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
const inputCls = "w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/35 focus:outline-none focus:border-[#FFD166]";

function Watermark({ full, onUpgrade }: { full: boolean; onUpgrade?: () => void }) {
  if (full) return <p className="text-[11px] text-[#2DC653]">✓ Seu plano libera tudo sem marca d'água.</p>;
  return (
    <p className="text-[11px] text-white/60 leading-snug">
      <Lock className="w-3 h-3 inline -mt-0.5" /> Na versão grátis sai uma marca discreta do site no cantinho.{" "}
      {onUpgrade && (
        <button onClick={onUpgrade} className="text-[#FFD166] font-bold underline cursor-pointer">
          Tirar a marca com um plano
        </button>
      )}
    </p>
  );
}

/* ------------------------------------------------------------------ Modelo */

function ModelTab({ tpl, orientation, onTpl, onOrientation }: { tpl: TemplateId; orientation: Orientation; onTpl: (t: TemplateId) => void; onOrientation: (o: Orientation) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Orientação">
        <div className="grid grid-cols-2 gap-2">
          <Btn onClick={() => onOrientation("retrato")} active={orientation === "retrato"} id="card-orient-retrato">
            ▯ Retrato (em pé)
          </Btn>
          <Btn onClick={() => onOrientation("paisagem")} active={orientation === "paisagem"} id="card-orient-paisagem">
            ▭ Paisagem (deitado)
          </Btn>
        </div>
      </Field>
      <Field label="Modelo" hint="a foto e os textos continuam">
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onTpl(t.id)}
              className={`rounded-xl p-2 text-[11px] font-bold leading-tight border cursor-pointer ${tpl === t.id ? "border-[#FFD166] bg-[#FFD166]/15 text-[#FFD166]" : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"}`}
              id={`card-model-${t.id}`}
            >
              <span className="block h-6 rounded-md mb-1.5" style={{ background: `linear-gradient(135deg, ${t.theme.stage[1]}, ${t.theme.stage[0]})` }} />
              {t.name}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

/* ------------------------------------------------------------------ Textos */

function TextTab({ texts, setText }: { texts: CardTexts; setText: (k: keyof CardTexts, v: string) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Título">
        <input className={inputCls} value={texts.title} maxLength={30} onChange={(e) => setText("title", e.target.value)} placeholder="Feliz Natal" id="card-title" />
      </Field>
      <Field label="Nome da família" hint={`${texts.family.length}/40`}>
        <input className={inputCls} value={texts.family} maxLength={40} onChange={(e) => setText("family", e.target.value)} placeholder="Família Silva" id="card-family" />
      </Field>
      <Field label="Nome das crianças" hint="opcional">
        <input className={inputCls} value={texts.children} maxLength={60} onChange={(e) => setText("children", e.target.value)} placeholder="Ana, Pedro e Leo" id="card-children" />
      </Field>
      <Field label="Mensagem de Natal" hint={`${texts.message.length}/${MAX_MSG}`}>
        <textarea className={`${inputCls} min-h-[96px] resize-y`} value={texts.message} maxLength={MAX_MSG} onChange={(e) => setText("message", e.target.value)} placeholder="Escreva com as suas palavras..." id="card-message" />
        <div className="mt-2 flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-white/45 font-bold">Sugestões (toque para usar)</span>
          {MESSAGES.map((m, i) => (
            <button key={i} onClick={() => setText("message", m)} className={`text-left text-xs rounded-lg px-3 py-2 border cursor-pointer leading-snug ${texts.message === m ? "border-[#FFD166] bg-[#FFD166]/10 text-[#FFE7A6]" : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10"}`} id={`card-msg-${i}`}>
              {m}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Assinatura">
        <input className={inputCls} value={texts.signature} maxLength={50} onChange={(e) => setText("signature", e.target.value)} placeholder="Com amor, Marcos e Júlia" id="card-signature" />
      </Field>
      <Field label="Ano">
        <input className={inputCls} value={texts.year} maxLength={20} onChange={(e) => setText("year", e.target.value)} placeholder="Natal 2026" id="card-year" />
      </Field>
    </div>
  );
}

/* ------------------------------------------------------------------ PDF */

type TabProps = { d: CardData; full: boolean; onUpgrade?: () => void; setBusy: (s: string | null) => void; say: (t: string, ok?: boolean) => void; fname: (ext: string, extra?: string) => string };

function PdfTab({ d, full, onUpgrade, setBusy, say, fname, onOrientation }: TabProps & { onOrientation: (o: Orientation) => void }) {
  const [o, setO] = useState<PdfOptions>({ paper: "A5", fold: "simples", print: "casa", back: false, custom: { w: 150, h: 200 } });
  const plan = planPdf(d, o);
  const up = (p: Partial<PdfOptions>) => setO((x) => ({ ...x, ...p }));
  const go = async () => {
    setBusy("Gerando o PDF em 300 DPI...");
    await new Promise((r) => setTimeout(r, 30));
    try {
      await ensureFonts();
      const { blob } = await buildPdf(d, o, (t) => setBusy(t));
      downloadBlob(blob, fname("pdf", `-${o.paper === "custom" ? `${plan.sheetW}x${plan.sheetH}mm` : o.paper.toLowerCase()}-${o.fold}`));
      say("PDF pronto! Confira a pasta de downloads.");
    } catch (e) {
      console.error(e);
      say("Não consegui gerar o PDF. Tente um tamanho menor.", false);
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className="space-y-4">
      <Field label="Tamanho do papel">
        <div className="grid grid-cols-4 gap-2">
          {(["A4", "A5", "A6", "custom"] as PaperId[]).map((p) => (
            <Btn key={p} onClick={() => up({ paper: p })} active={o.paper === p} id={`pdf-paper-${p}`}>
              {p === "custom" ? "Outro" : p}
            </Btn>
          ))}
        </div>
        <p className="text-[10px] text-white/45 mt-1.5">A4 210×297 · A5 148×210 · A6 105×148 mm</p>
        {o.paper === "custom" && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <label className="text-[11px] text-white/60">
              Largura (mm)
              <input type="number" min={50} max={450} className={inputCls} value={o.custom?.w ?? 150} onChange={(e) => up({ custom: { w: +e.target.value, h: o.custom?.h ?? 200 } })} id="pdf-custom-w" />
            </label>
            <label className="text-[11px] text-white/60">
              Altura (mm)
              <input type="number" min={50} max={450} className={inputCls} value={o.custom?.h ?? 200} onChange={(e) => up({ custom: { w: o.custom?.w ?? 150, h: +e.target.value } })} id="pdf-custom-h" />
            </label>
          </div>
        )}
      </Field>
      <Field label="Tipo de cartão">
        <div className="grid grid-cols-2 gap-2">
          <Btn onClick={() => up({ fold: "simples" })} active={o.fold === "simples"} id="pdf-simples">
            Simples (só frente)
          </Btn>
          <Btn onClick={() => up({ fold: "dobrado" })} active={o.fold === "dobrado"} id="pdf-dobrado">
            Dobrado (abre)
          </Btn>
        </div>
        {o.fold === "simples" ? (
          <label className="flex items-center gap-2 text-xs text-white/75 mt-2 cursor-pointer">
            <input type="checkbox" checked={o.back} onChange={(e) => up({ back: e.target.checked })} className="accent-[#FFD166] w-4 h-4" id="pdf-back" /> Incluir verso (frente e verso)
          </label>
        ) : (
          <p className="text-[11px] text-white/55 mt-2 leading-snug">A folha é dobrada ao meio: capa com a foto, verso, e por dentro a mensagem, os nomes e a assinatura.</p>
        )}
      </Field>
      <Field label="Orientação">
        <div className="grid grid-cols-2 gap-2">
          <Btn onClick={() => onOrientation("retrato")} active={d.orientation === "retrato"} id="pdf-orient-retrato">
            Retrato
          </Btn>
          <Btn onClick={() => onOrientation("paisagem")} active={d.orientation === "paisagem"} id="pdf-orient-paisagem">
            Paisagem
          </Btn>
        </div>
      </Field>
      <Field label="Onde vai imprimir?">
        <div className="grid grid-cols-2 gap-2">
          <Btn onClick={() => up({ print: "casa" })} active={o.print === "casa"} id="pdf-casa">
            Em casa
          </Btn>
          <Btn onClick={() => up({ print: "grafica" })} active={o.print === "grafica"} id="pdf-grafica">
            Gráfica
          </Btn>
        </div>
        <p className="text-[11px] text-white/55 mt-2 leading-snug">
          {o.print === "grafica"
            ? `Com sangria de ${BLEED} mm e marcas de corte${o.fold === "dobrado" ? " e de dobra" : ""}. Leve o PDF como está.`
            : "Tamanho exato da folha. Imprima em “tamanho real” (100%), em papel de 180 a 250 g."}
        </p>
      </Field>
      <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-white/75 space-y-1" id="pdf-plan">
        <p>
          <b className="text-white">Cartão pronto:</b> {fmt(plan.cardW)} × {fmt(plan.cardH)} mm {o.fold === "dobrado" && `(folha ${fmt(plan.sheetW)} × ${fmt(plan.sheetH)} mm)`}
        </p>
        <p>
          <b className="text-white">PDF:</b> {plan.pages} {plan.pages > 1 ? "páginas" : "página"} de {fmt(plan.pageW)} × {fmt(plan.pageH)} mm · {DPI} DPI ({plan.pxW}×{plan.pxH} px)
        </p>
        {plan.pages > 1 && <p className="text-white/55">Frente e verso: vire a folha pela borda curta.</p>}
      </div>
      <Watermark full={full} onUpgrade={onUpgrade} />
      <Btn onClick={go} primary big id="pdf-download">
        <FileDown className="w-5 h-5" /> BAIXAR CARTÃO PARA IMPRESSÃO
      </Btn>
    </div>
  );
}
const fmt = (n: number) => (Math.round(n * 10) / 10).toString().replace(".", ",");

/* ------------------------------------------------------------------ Imagem */

function ImageTab({ d, full, onUpgrade, setBusy, say, fname }: TabProps) {
  const [v, setV] = useState<SocialVariant>("whatsapp");
  const go = async (share: boolean) => {
    setBusy("Preparando a imagem...");
    await new Promise((r) => setTimeout(r, 30));
    try {
      await ensureFonts();
      const c = socialCanvas(d, v);
      const blob = await canvasToBlob(c, "image/png");
      const name = fname("png", `-${v}`);
      if (share) {
        const r = await shareOrDownload(blob, name, SHARE_TEXTS[0]);
        say(r === "shared" ? "Imagem compartilhada!" : r === "canceled" ? "Compartilhamento cancelado." : "Imagem salva (seu aparelho não compartilha arquivos direto).");
      } else {
        downloadBlob(blob, name);
        say(`Imagem salva (${c.width}×${c.height} px).`);
      }
    } catch (e) {
      console.error(e);
      say("Não consegui gerar a imagem.", false);
    } finally {
      setBusy(null);
    }
  };
  const hd = cardDims(d.orientation, 3000);
  return (
    <div className="space-y-4">
      <Field label="Formato da imagem">
        <div className="space-y-2">
          {SOCIAL.map((s) => (
            <button key={s.id} onClick={() => setV(s.id)} className={`w-full text-left rounded-xl border px-3 py-2.5 cursor-pointer ${v === s.id ? "border-[#FFD166] bg-[#FFD166]/10" : "border-white/15 bg-white/5 hover:bg-white/10"}`} id={`img-${s.id}`}>
              <span className="flex items-center justify-between">
                <span className="font-bold text-sm">{s.label}</span>
                <span className="text-[11px] text-white/55">{s.id === "hd" ? `${hd.W}×${hd.H}` : `${s.w}×${s.h}`}</span>
              </span>
              <span className="block text-[11px] text-white/55 mt-0.5">{s.hint}</span>
            </button>
          ))}
        </div>
      </Field>
      <Watermark full={full} onUpgrade={onUpgrade} />
      <Btn onClick={() => go(false)} primary big id="img-download">
        <ImageDown className="w-5 h-5" /> SALVAR COMO IMAGEM
      </Btn>
      <Btn onClick={() => go(true)} id="img-share">
        <Share2 className="w-4 h-4" /> Enviar a imagem pelo celular
      </Btn>
    </div>
  );
}

/* ------------------------------------------------------------------ Vídeo */

function VideoTab({ d, full, onUpgrade, say, fname }: Omit<TabProps, "setBusy">) {
  const [format, setFormat] = useState<VideoFormat>("stories");
  const [style, setStyle] = useState<VideoStyle>("classica");
  const [music, setMusic] = useState<VideoMusic>("caixinha");
  const [audio, setAudio] = useState<File | null>(null);
  const [playing, setPlaying] = useState(false);
  const [rec, setRec] = useState<number | null>(null);
  const [out, setOut] = useState<{ url: string; blob: Blob; ext: string; w: number; h: number } | null>(null);
  const prev = useRef<HTMLCanvasElement | null>(null);
  const cancel = useRef({ cancel: false });
  const spec = VIDEO_FORMATS.find((f) => f.id === format)!;

  // prévia animada (não grava)
  useEffect(() => {
    if (!playing) return;
    const c = prev.current;
    if (!c) return;
    const W = spec.w / 2,
      H = spec.h / 2;
    c.width = W;
    c.height = H;
    const L = prepareLayers(d, 900);
    const ctx = c.getContext("2d")!;
    const t0 = performance.now();
    let id = 0;
    const loop = () => {
      const t = ((performance.now() - t0) / 1000) % DURATION;
      drawFrame(ctx, W, H, t, d, L, style);
      id = requestAnimationFrame(loop);
    };
    loop();
    let ac: AudioContext | null = null;
    if (music === "caixinha") musicBox.play();
    else if (music === "arquivo" && audio) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      ac = new AC();
      audio.arrayBuffer().then((b) =>
        ac!.decodeAudioData(b).then((buf) => {
          const s = ac!.createBufferSource();
          s.buffer = buf;
          s.connect(ac!.destination);
          s.start();
        }),
      );
    }
    return () => {
      cancelAnimationFrame(id);
      if (music === "caixinha") musicBox.pause();
      ac?.close();
    };
  }, [playing, format, style, music, audio, d, spec.w, spec.h]);

  // primeiro quadro parado
  useEffect(() => {
    if (playing) return;
    const c = prev.current;
    if (!c) return;
    c.width = spec.w / 2;
    c.height = spec.h / 2;
    ensureFonts().then(() => drawFrame(c.getContext("2d")!, c.width, c.height, 7.4, d, prepareLayers(d, 900), style));
  }, [playing, d, style, spec.w, spec.h]);

  useEffect(() => () => out && URL.revokeObjectURL(out.url), [out]);

  const generate = async () => {
    setPlaying(false);
    setOut(null);
    cancel.current = { cancel: false };
    setRec(0);
    try {
      await ensureFonts();
      const r = await recordCardVideo(d, { format, style, music, audioFile: audio }, (f) => setRec(f), cancel.current);
      setOut({ url: URL.createObjectURL(r.blob), blob: r.blob, ext: r.ext, w: r.w, h: r.h });
      say(`Vídeo pronto (${r.w}×${r.h}, ${DURATION} s, ${r.ext.toUpperCase()}).`);
    } catch (e) {
      if ((e as Error).message !== "cancelado") say((e as Error).message || "Não consegui gravar o vídeo.", false);
    } finally {
      setRec(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="relative w-full max-w-[220px]">
          <canvas ref={prev} className="w-full h-auto rounded-xl shadow-2xl bg-black" style={{ aspectRatio: `${spec.w} / ${spec.h}` }} id="video-preview" />
          {rec !== null && (
            <div className="absolute inset-0 rounded-xl bg-black/60 flex flex-col items-center justify-center text-center p-3">
              <span className="w-6 h-6 border-2 border-[#FFD166] border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-xs font-bold">Gravando... {Math.round(rec * 100)}%</span>
              <span className="text-[10px] text-white/60 mt-1">Deixe esta tela aberta</span>
            </div>
          )}
        </div>
      </div>
      <Btn onClick={() => setPlaying((p) => !p)} disabled={rec !== null} id="video-play">
        {playing ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />} {playing ? "Parar prévia" : "Ver prévia"}
      </Btn>
      <Field label="Formato">
        <div className="grid grid-cols-2 gap-2">
          {VIDEO_FORMATS.map((f) => (
            <Btn key={f.id} onClick={() => setFormat(f.id)} active={format === f.id} id={`video-${f.id}`}>
              {f.id === "stories" ? "Reels/Stories/TikTok" : "Feed 4:5"}
            </Btn>
          ))}
        </div>
        <p className="text-[10px] text-white/45 mt-1">{spec.label} · {DURATION} segundos</p>
      </Field>
      <Field label="Animação">
        <div className="grid grid-cols-3 gap-2">
          {VIDEO_STYLES.map((s) => (
            <Btn key={s.id} onClick={() => setStyle(s.id)} active={style === s.id} id={`video-style-${s.id}`}>
              {s.label}
            </Btn>
          ))}
        </div>
        <p className="text-[10px] text-white/45 mt-1">{VIDEO_STYLES.find((s) => s.id === style)!.hint}</p>
      </Field>
      <Field label="Música">
        <div className="grid grid-cols-3 gap-2">
          <Btn onClick={() => setMusic("caixinha")} active={music === "caixinha"} id="video-music-caixinha">
            <Music className="w-4 h-4" /> Natal
          </Btn>
          <Btn onClick={() => setMusic("arquivo")} active={music === "arquivo"} id="video-music-arquivo">
            <Upload className="w-4 h-4" /> Meu áudio
          </Btn>
          <Btn onClick={() => setMusic("nenhuma")} active={music === "nenhuma"} id="video-music-nenhuma">
            Sem
          </Btn>
        </div>
        {music === "caixinha" && <p className="text-[10px] text-white/45 mt-1">Melodias tradicionais de domínio público tocadas pela nossa caixinha de música (livres de direitos).</p>}
        {music === "arquivo" && (
          <div className="mt-2">
            <input type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files?.[0] ?? null)} className="block w-full text-xs text-white/70 file:mr-2 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:px-3 file:py-2" id="video-audio" />
            <p className="text-[10px] text-white/45 mt-1">Use só áudio seu ou com autorização (ex.: a família cantando). Músicas de artistas podem ser bloqueadas nas redes.</p>
          </div>
        )}
      </Field>
      <Watermark full={full} onUpgrade={onUpgrade} />
      {rec === null ? (
        <Btn onClick={generate} primary big disabled={music === "arquivo" && !audio} id="video-generate">
          <Film className="w-5 h-5" /> TRANSFORMAR MEU CARTÃO EM VÍDEO
        </Btn>
      ) : (
        <Btn onClick={() => (cancel.current.cancel = true)} danger id="video-cancel">
          Cancelar gravação
        </Btn>
      )}
      {out && (
        <div className="rounded-xl border border-[#2DC653]/40 bg-[#2DC653]/10 p-3 space-y-2" id="video-result">
          <video src={out.url} controls playsInline className="w-full max-h-[50vh] rounded-lg bg-black" />
          <div className="grid grid-cols-2 gap-2">
            <Btn onClick={() => downloadBlob(out.blob, fname(out.ext, `-video-${format}`))} primary id="video-save">
              <FileDown className="w-4 h-4" /> Salvar vídeo
            </Btn>
            <Btn
              onClick={async () => {
                const r = await shareOrDownload(out.blob, fname(out.ext, "-video"), SHARE_TEXTS[0]);
                say(r === "shared" ? "Vídeo compartilhado!" : r === "canceled" ? "Cancelado." : "Vídeo salvo. Publique pelo app que preferir.");
              }}
              id="video-share"
            >
              <Share2 className="w-4 h-4" /> Compartilhar
            </Btn>
          </div>
          {out.ext !== "mp4" && <p className="text-[10px] text-white/55">Seu navegador grava em WebM. WhatsApp, Instagram e TikTok aceitam pelo celular; se algum app recusar, gere pelo Chrome/Safari do celular, que grava em MP4.</p>}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Compartilhar */

function ShareTab({ d, say, fname, setBusy }: Omit<TabProps, "full" | "onUpgrade">) {
  const [text, setText] = useState(SHARE_TEXTS[0]);
  const [copied, setCopied] = useState(false);
  const link = `https://${SITE}`;
  const image = async () => {
    await ensureFonts();
    const c = socialCanvas(d, "whatsapp");
    return new File([await canvasToBlob(c, "image/png")], fname("png", "-whatsapp"), { type: "image/png" });
  };
  const withImage = async (f: (file: File) => Promise<void> | void) => {
    setBusy("Preparando a imagem...");
    await new Promise((r) => setTimeout(r, 30));
    try {
      await f(await image());
    } finally {
      setBusy(null);
    }
  };
  const native = () =>
    withImage(async (file) => {
      if (canShareFiles([file])) {
        try {
          await navigator.share({ files: [file], text });
          say("Compartilhado!");
        } catch (e) {
          if ((e as Error).name !== "AbortError") say("Não deu para compartilhar daqui. A imagem foi salva.", false);
        }
      } else if (navigator.share) {
        downloadBlob(file, file.name);
        await navigator.share({ text: `${text}\n${link}` }).catch(() => {});
      } else {
        downloadBlob(file, file.name);
        say("Seu navegador não compartilha arquivos. A imagem foi salva para você enviar.");
      }
    });
  const whatsapp = () =>
    withImage(async (file) => {
      if (canShareFiles([file])) {
        try {
          await navigator.share({ files: [file], text });
          return;
        } catch (e) {
          if ((e as Error).name === "AbortError") return;
        }
      }
      downloadBlob(file, file.name);
      window.open(whatsappUrl(text), "_blank", "noopener");
      say("Imagem salva. No WhatsApp, anexe a imagem junto com a mensagem.");
    });
  const appFlow = (app: "Instagram" | "TikTok") =>
    withImage(async (file) => {
      if (canShareFiles([file])) {
        try {
          await navigator.share({ files: [file], text });
          return;
        } catch (e) {
          if ((e as Error).name === "AbortError") return;
        }
      }
      downloadBlob(file, file.name);
      await copyText(text);
      say(`Imagem salva e legenda copiada. Abra o ${app} e publique a partir da galeria.`);
    });
  return (
    <div className="space-y-4">
      <Field label="Mensagem para enviar junto">
        <textarea className={`${inputCls} min-h-[90px]`} value={text} onChange={(e) => setText(e.target.value)} id="share-text" />
        <div className="mt-2 flex flex-col gap-1.5">
          {SHARE_TEXTS.map((m, i) => (
            <button key={i} onClick={() => setText(m)} className={`text-left text-xs rounded-lg px-3 py-2 border cursor-pointer ${text === m ? "border-[#FFD166] bg-[#FFD166]/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`} id={`share-msg-${i}`}>
              {m}
            </button>
          ))}
        </div>
      </Field>
      <Btn onClick={native} primary big id="share-native">
        <Smartphone className="w-5 h-5" /> COMPARTILHAR MINHA CRIAÇÃO
      </Btn>
      <div className="grid grid-cols-2 gap-2">
        <Btn onClick={whatsapp} id="share-whatsapp">
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </Btn>
        <Btn onClick={() => appFlow("Instagram")} id="share-instagram">
          <Instagram className="w-4 h-4" /> Instagram
        </Btn>
        <Btn
          onClick={() =>
            withImage((file) => {
              downloadBlob(file, file.name);
              window.open(facebookUrl(link), "_blank", "noopener");
              say("Imagem salva. No Facebook, adicione a foto ao post.");
            })
          }
          id="share-facebook"
        >
          <Facebook className="w-4 h-4" /> Facebook
        </Btn>
        <Btn onClick={() => appFlow("TikTok")} id="share-tiktok">
          <Film className="w-4 h-4" /> TikTok
        </Btn>
      </div>
      <Btn
        onClick={async () => {
          await copyText(`${text}\n${link}`);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          say("Mensagem e link copiados.");
        }}
        id="share-copy"
      >
        {copied ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />} {copied ? "Copiado!" : "Copiar mensagem com link"}
      </Btn>
      <p className="text-[11px] text-white/55 leading-snug">
        <Copy className="w-3 h-3 inline -mt-0.5" /> Nada é publicado automaticamente: você escolhe o app e confirma lá. No Instagram e no TikTok, a imagem (ou o vídeo da aba Vídeo) é salva e você publica pelo app.
      </p>
    </div>
  );
}
