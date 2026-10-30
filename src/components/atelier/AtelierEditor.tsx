import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Undo2, Trash2, Download, Share2, Check } from "lucide-react";
import { DESIGNS, DESIGN_CATS, designDataUrl, type Design, type DesignCat } from "../../atelier/designs";
import { floodFill } from "../../atelier/floodFill";
import { musicBox } from "../../lib/christmasMusic";

const N = 800; // resolução interna do desenho
const COLORS = [
  "#E63946", "#9B1B30", "#2DC653", "#1B7F3B", "#FFD166", "#FFB703", "#F77F00", "#8B5A2B",
  "#FF8FA3", "#9D4EDD", "#4361EE", "#4CC9F0", "#FFFFFF", "#ADB5BD", "#1E2340", "#F6C9A8",
];
const STICKERS = ["⭐", "❄️", "🎁", "🔔", "🍬", "🎀", "✨", "🦌", "🎄", "🍪", "❤️", "🌟"];
const SIZES = [6, 14, 26, 44];
type Tool = "balde" | "pincel" | "brilho" | "borracha" | "adesivo";
type Mode = "colorir" | "livre";
type Bg = "branco" | "carta" | "noite";
type Snap = { paint?: ImageData; stick?: ImageData };

const TOOLS: { id: Tool; icon: string; label: string }[] = [
  { id: "balde", icon: "🪣", label: "Balde" },
  { id: "pincel", icon: "🖌️", label: "Pincel" },
  { id: "brilho", icon: "✨", label: "Brilho" },
  { id: "borracha", icon: "🧽", label: "Apagar" },
  { id: "adesivo", icon: "⭐", label: "Adesivos" },
];

export default function AtelierEditor({
  initialDesignId = "arvore",
  lockDesign = false,
  allowExclusive = false,
  childName = "",
  onDone,
  full = true,
  onLocked,
}: {
  initialDesignId?: string;
  lockDesign?: boolean;
  allowExclusive?: boolean;
  childName?: string;
  onDone?: () => void;
  /** tem o Natal Completo? (libera todos os desenhos, adesivos e o nome na moldura) */
  full?: boolean;
  onLocked?: (what: string) => void;
}) {
  const bgRef = useRef<HTMLCanvasElement | null>(null);
  const paintRef = useRef<HTMLCanvasElement | null>(null);
  const lineRef = useRef<HTMLCanvasElement | null>(null);
  const stickRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef<{ x: number; y: number } | null>(null);
  const downAt = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const undo = useRef<Snap[]>([]);

  const [mode, setMode] = useState<Mode>("colorir");
  const [designId, setDesignId] = useState(initialDesignId);
  const [bg, setBg] = useState<Bg>("branco");
  const [tool, setTool] = useState<Tool>("balde");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [sticker, setSticker] = useState(STICKERS[0]);
  const [name, setName] = useState(childName);
  const [canUndo, setCanUndo] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // plano grátis: 6 desenhos e 6 adesivos; o resto é do Natal Completo
  const freeIds = [...DESIGNS.filter((d) => !d.exclusive && !d.free).slice(0, 6), ...DESIGNS.filter((d) => d.free)].map((d) => d.id);
  const [cat, setCat] = useState<DesignCat | "todos">("todos");
  const designs = DESIGNS; // no grátis, os exclusivos aparecem com cadeado
  const designLocked = (id: string) => !full && !allowExclusive && !freeIds.includes(id) && id !== initialDesignId;
  const stickerLocked = (i: number) => !full && i >= 6;
  const design = DESIGNS.find((d) => d.id === designId) ?? DESIGNS[0];

  const ctx = (r: React.RefObject<HTMLCanvasElement | null>) => r.current!.getContext("2d", { willReadFrequently: true })!;
  const say = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  };

  // ---------------------------------------------------------------- camadas
  const drawBackground = useCallback((which: Bg, m: Mode) => {
    const c = ctx(bgRef);
    c.clearRect(0, 0, N, N);
    if (m === "colorir" || which === "branco") {
      c.fillStyle = "#FFFFFF";
      c.fillRect(0, 0, N, N);
      return;
    }
    if (which === "carta") {
      c.fillStyle = "#FCF6E8";
      c.fillRect(0, 0, N, N);
      c.strokeStyle = "rgba(155,2,26,0.15)";
      c.lineWidth = 2;
      for (let y = 90; y < N; y += 52) {
        c.beginPath();
        c.moveTo(40, y);
        c.lineTo(N - 40, y);
        c.stroke();
      }
      c.strokeStyle = "rgba(212,160,23,0.6)";
      c.lineWidth = 10;
      c.strokeRect(14, 14, N - 28, N - 28);
      return;
    }
    const g = c.createLinearGradient(0, 0, 0, N);
    g.addColorStop(0, "#0B1535");
    g.addColorStop(1, "#24366B");
    c.fillStyle = g;
    c.fillRect(0, 0, N, N);
    for (let i = 0; i < 70; i++) {
      c.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.6})`;
      c.beginPath();
      c.arc(Math.random() * N, Math.random() * N * 0.75, Math.random() * 2 + 0.5, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = "#EAF2FF";
    c.beginPath();
    c.moveTo(0, N * 0.86);
    c.quadraticCurveTo(N * 0.5, N * 0.78, N, N * 0.88);
    c.lineTo(N, N);
    c.lineTo(0, N);
    c.fill();
  }, []);

  const loadLines = useCallback((d: Design | null) => {
    const c = ctx(lineRef);
    c.clearRect(0, 0, N, N);
    if (!d) return;
    const img = new Image();
    img.onload = () => {
      c.clearRect(0, 0, N, N);
      c.drawImage(img, 0, 0, N, N);
      // o branco do desenho vira transparente: só os traços ficam (e a tinta aparece por baixo)
      const im = c.getImageData(0, 0, N, N);
      const px = im.data;
      for (let i = 0; i < px.length; i += 4) {
        if (!px[i + 3]) continue;
        const lum = (px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11) / 255;
        const a = Math.round(Math.min(1, (1 - lum) * 1.25) * (px[i + 3] / 255) * 255);
        px[i] = 30;
        px[i + 1] = 35;
        px[i + 2] = 64;
        px[i + 3] = a;
      }
      c.putImageData(im, 0, 0);
    };
    img.src = designDataUrl(d, N);
  }, []);

  const resetPaint = () => {
    ctx(paintRef).clearRect(0, 0, N, N);
    ctx(stickRef).clearRect(0, 0, N, N);
    undo.current = [];
    setCanUndo(false);
  };

  useEffect(() => {
    drawBackground(bg, mode);
  }, [bg, mode, drawBackground]);

  useEffect(() => {
    resetPaint();
    loadLines(mode === "colorir" ? design : null);
    if (mode === "livre" && tool === "balde") setTool("pincel");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designId, mode, loadLines]);

  // ---------------------------------------------------------------- desfazer
  const snapshot = (layers: ("paint" | "stick")[]) => {
    const s: Snap = {};
    if (layers.includes("paint")) s.paint = ctx(paintRef).getImageData(0, 0, N, N);
    if (layers.includes("stick")) s.stick = ctx(stickRef).getImageData(0, 0, N, N);
    undo.current.push(s);
    if (undo.current.length > 15) undo.current.shift();
    setCanUndo(true);
  };
  const doUndo = () => {
    const s = undo.current.pop();
    if (!s) return;
    if (s.paint) ctx(paintRef).putImageData(s.paint, 0, 0);
    if (s.stick) ctx(stickRef).putImageData(s.stick, 0, 0);
    setCanUndo(undo.current.length > 0);
    musicBox.chime(72, undefined, 0.08);
  };
  const clearAll = () => {
    snapshot(["paint", "stick"]);
    ctx(paintRef).clearRect(0, 0, N, N);
    ctx(stickRef).clearRect(0, 0, N, N);
  };

  // ---------------------------------------------------------------- ferramentas
  const pos = (e: React.PointerEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * N, y: ((e.clientY - r.top) / r.height) * N };
  };

  const sparkle = (x: number, y: number) => {
    const c = ctx(paintRef);
    const festive = ["#FFD166", "#FFFFFF", "#FF8FA3", "#4CC9F0", "#2DC653", color];
    for (let i = 0; i < 3; i++) {
      const px = x + (Math.random() - 0.5) * size * 1.6;
      const py = y + (Math.random() - 0.5) * size * 1.6;
      const s = Math.random() * size * 0.35 + 3;
      c.save();
      c.fillStyle = festive[Math.floor(Math.random() * festive.length)];
      c.shadowColor = c.fillStyle as string;
      c.shadowBlur = 10;
      c.translate(px, py);
      c.rotate(Math.random() * Math.PI);
      c.beginPath();
      for (let k = 0; k < 8; k++) {
        const rr = k % 2 ? s * 0.35 : s;
        const a = (k * Math.PI) / 4;
        c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      c.closePath();
      c.fill();
      c.restore();
    }
  };

  const strokeTo = (x: number, y: number) => {
    const from = drawing.current!;
    if (tool === "brilho") {
      const dist = Math.hypot(x - from.x, y - from.y);
      if (dist > size * 0.6) {
        sparkle(x, y);
        drawing.current = { x, y };
      }
      return;
    }
    const c = ctx(paintRef);
    c.save();
    c.globalCompositeOperation = tool === "borracha" ? "destination-out" : "source-over";
    c.strokeStyle = color;
    c.lineWidth = size;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.beginPath();
    c.moveTo(from.x, from.y);
    c.lineTo(x, y);
    c.stroke();
    c.restore();
    drawing.current = { x, y };
  };

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const { x, y } = pos(e);
    if (tool === "balde") {
      snapshot(["paint"]);
      const pc = ctx(paintRef);
      const paint = pc.getImageData(0, 0, N, N);
      let ok: boolean;
      if (mode === "colorir") {
        ok = floodFill({ paint, lines: ctx(lineRef).getImageData(0, 0, N, N), x, y, color });
      } else {
        const tmp = document.createElement("canvas");
        tmp.width = tmp.height = N;
        const t = tmp.getContext("2d")!;
        t.drawImage(bgRef.current!, 0, 0);
        t.drawImage(paintRef.current!, 0, 0);
        ok = floodFill({ paint, composite: t.getImageData(0, 0, N, N), x, y, color });
      }
      if (ok) {
        pc.putImageData(paint, 0, 0);
        musicBox.chime(76 + Math.floor(Math.random() * 6) * 2, undefined, 0.1);
      } else undo.current.pop();
      return;
    }
    if (tool === "adesivo") {
      snapshot(["stick"]);
      const c = ctx(stickRef);
      const s = size * 2.6 + 30;
      c.font = `${s}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(sticker, x, y);
      musicBox.chime(84, undefined, 0.1);
      return;
    }
    snapshot(["paint"]);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drawing.current = { x, y };
    downAt.current = { x, y, moved: false };
    if (tool === "brilho") sparkle(x, y);
    else strokeTo(x + 0.01, y + 0.01);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const { x, y } = pos(e);
    if (downAt.current && Math.hypot(x - downAt.current.x, y - downAt.current.y) > 6) downAt.current.moved = true;
    strokeTo(x, y);
  };
  const onUp = () => {
    // apagar com um toque (sem arrastar) no modo colorir: tira a cor da parte inteira
    const d = downAt.current;
    downAt.current = null;
    if (tool === "borracha" && mode === "colorir" && d && !d.moved) eraseRegion(d.x, d.y);
    drawing.current = null;
  };

  /** Tira a cor de uma parte inteira do desenho (como um "balde" que apaga). */
  const eraseRegion = (x: number, y: number) => {
    const pc = ctx(paintRef);
    const paint = pc.getImageData(0, 0, N, N);
    const mark = new ImageData(new Uint8ClampedArray(paint.data.length), N, N);
    const ok = floodFill({ paint: mark, lines: ctx(lineRef).getImageData(0, 0, N, N), x, y, color: "#010203" });
    if (!ok) return;
    for (let i = 3; i < mark.data.length; i += 4) if (mark.data[i] > 0) paint.data[i] = 0;
    pc.putImageData(paint, 0, 0);
    musicBox.chime(67, undefined, 0.08);
  };

  // ---------------------------------------------------------------- exportar
  const buildImage = async () => {
    const W = 1080, H = 1350;
    const out = document.createElement("canvas");
    out.width = W;
    out.height = H;
    const c = out.getContext("2d")!;
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0B132B");
    g.addColorStop(1, "#1C2541");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    c.strokeStyle = "#FFD166";
    c.lineWidth = 10;
    c.strokeRect(24, 24, W - 48, H - 48);
    for (let i = 0; i < 40; i++) {
      c.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.5})`;
      c.beginPath();
      c.arc(40 + Math.random() * (W - 80), 40 + Math.random() * 180, Math.random() * 2.5 + 0.5, 0, Math.PI * 2);
      c.fill();
    }
    c.textAlign = "center";
    c.fillStyle = "#FFD166";
    c.font = 'bold 60px Georgia, "Times New Roman", serif';
    const who = full ? name.trim() : "";
    c.fillText(who ? `Desenho de ${who}` : "Meu desenho de Natal", W / 2, 130);
    c.fillStyle = "#EDF2F4";
    c.font = '32px Georgia, "Times New Roman", serif';
    c.fillText(`Natal ${new Date().getFullYear()} ✨`, W / 2, 185);

    const x = 80, y = 230, s = W - 160;
    c.save();
    c.beginPath();
    c.roundRect(x, y, s, s, 28);
    c.clip();
    for (const r of [bgRef, paintRef, lineRef, stickRef]) c.drawImage(r.current!, x, y, s, s);
    c.restore();
    c.strokeStyle = "rgba(255,209,102,0.8)";
    c.lineWidth = 6;
    c.beginPath();
    c.roundRect(x, y, s, s, 28);
    c.stroke();

    c.font = '56px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    c.fillText("🎄", 70, 1290);
    c.fillText("🎁", W - 70, 1290);
    c.fillStyle = "rgba(237,242,244,0.75)";
    c.font = "26px system-ui, sans-serif";
    c.fillText("Feito no Ateliê de Natal • Carta Mágica", W / 2, 1280);
    return new Promise<Blob>((res) => out.toBlob((b) => res(b!), "image/png"));
  };

  const fileName = () => `desenho-de-natal${name.trim() ? "-" + name.trim().replace(/\s+/g, "-") : ""}.png`;

  const download = async () => {
    const blob = await buildImage();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName();
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    say("Imagem salva! 🎨");
    onDone?.();
  };

  const share = async () => {
    const blob = await buildImage();
    const file = new File([blob], fileName(), { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Meu desenho de Natal", text: "Olha o desenho de Natal que eu fiz! 🎄" });
        onDone?.();
        return;
      } catch {
        return;
      }
    }
    await download();
    say("Imagem baixada! Agora é só enviar no WhatsApp 💬");
  };

  // ---------------------------------------------------------------- UI
  const pill = (active: boolean) =>
    `rounded-xl px-2 py-2 text-[11px] font-semibold border-2 flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
      active ? "bg-[#FFD166]/20 border-[#FFD166] text-white" : "bg-white/5 border-white/10 text-white/80 hover:border-white/30"
    }`;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start min-w-0">
      {/* tela */}
      <div className="relative">
        <div
          className="relative w-full aspect-square rounded-2xl overflow-hidden border-4 border-[#FFD166]/70 shadow-2xl bg-white touch-none select-none"
          style={{ cursor: tool === "balde" ? "cell" : "crosshair" }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={onUp}
        >
          {[bgRef, paintRef, lineRef, stickRef].map((r, i) => (
            <canvas key={i} ref={r} width={N} height={N} className="absolute inset-0 w-full h-full pointer-events-none" />
          ))}
        </div>
        <AnimatePresence>
          {toast && (
            <motion.div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#0B132B] text-white text-sm font-semibold px-4 py-2 rounded-full border border-[#FFD166]/60 shadow-xl flex items-center gap-2 whitespace-nowrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Check className="w-4 h-4 text-[#2DC653]" /> {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ferramentas */}
      <div className="space-y-4">
        {!lockDesign && (
          <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-full">
            {(["colorir", "livre"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-full py-2 px-1 text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap ${mode === m ? "bg-[#FFD166] text-[#0B132B]" : "text-white/80"}`}
              >
                {m === "colorir" ? "🖍️ Colorir" : "✏️ Desenho livre"}
              </button>
            ))}
          </div>
        )}

        {mode === "colorir" && !lockDesign && (
          <div>
            <p className="text-xs font-bold text-[#FFD166] uppercase tracking-wider mb-2">Escolha o desenho ({DESIGNS.length})</p>
            <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
              {DESIGN_CATS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold cursor-pointer border ${cat === c.id ? "bg-[#FFD166] text-[#0B132B] border-[#FFD166]" : "bg-white/5 text-white/80 border-white/15"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
              {designs.filter((d) => cat === "todos" || d.cat === cat).map((d) => (
                <button
                  key={d.id}
                  onClick={() => (designLocked(d.id) ? onLocked?.(`O desenho "${d.name}"`) : setDesignId(d.id))}
                  title={designLocked(d.id) ? `${d.name} (Natal Completo)` : d.name}
                  className={`relative aspect-square rounded-xl bg-white p-1 border-4 cursor-pointer transition-transform hover:scale-105 ${designId === d.id ? "border-[#FFD166]" : "border-transparent"}`}
                >
                  <img src={designDataUrl(d, 120)} alt={d.name} className={`w-full h-full ${designLocked(d.id) ? "opacity-40" : ""}`} draggable={false} />
                  {designLocked(d.id) && <span className="absolute inset-0 flex items-center justify-center text-xl">🔒</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === "livre" && (
          <div>
            <p className="text-xs font-bold text-[#FFD166] uppercase tracking-wider mb-2">Fundo</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                ["branco", "⬜", "Branco"],
                ["carta", "📜", "Papel de carta"],
                ["noite", "🌙", "Noite com neve"],
              ] as [Bg, string, string][]).map(([id, icon, label]) => (
                <button key={id} className={pill(bg === id)} onClick={() => setBg(id)}>
                  <span className="text-lg">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-bold text-[#FFD166] uppercase tracking-wider mb-2">Ferramentas</p>
          <div className="grid grid-cols-5 gap-1.5">
            {TOOLS.map((t) => (
              <button key={t.id} className={pill(tool === t.id)} onClick={() => setTool(t.id)}>
                <span className="text-lg">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tool !== "balde" && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/70">Tamanho</span>
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 cursor-pointer ${size === s ? "border-[#FFD166] bg-white/10" : "border-white/10"}`}
                aria-label={`Tamanho ${s}`}
              >
                <span className="rounded-full bg-white" style={{ width: Math.max(4, s / 2), height: Math.max(4, s / 2) }} />
              </button>
            ))}
          </div>
        )}

        {tool === "borracha" && (
          <p className="text-xs text-white/75 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
            🧽 Arraste o dedo para apagar{mode === "colorir" ? " ou toque numa parte para tirar toda a cor dela" : ""}. Errou? Use <b>Desfazer</b>.
          </p>
        )}
        {tool === "adesivo" ? (
          <div className="grid grid-cols-6 gap-2">
            {STICKERS.map((s, i) => (
              <button
                key={s}
                onClick={() => (stickerLocked(i) ? onLocked?.(`O adesivo ${s}`) : setSticker(s))}
                className={`relative aspect-square rounded-xl text-2xl border-2 cursor-pointer ${sticker === s ? "border-[#FFD166] bg-white/10" : "border-white/10 bg-white/5"}`}
              >
                <span className={stickerLocked(i) ? "opacity-35" : ""}>{s}</span>
                {stickerLocked(i) && <span className="absolute bottom-0 right-0.5 text-[11px]">🔒</span>}
              </button>
            ))}
          </div>
        ) : (
          tool !== "borracha" && (
            <div className="grid grid-cols-8 gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`aspect-square rounded-full border-2 cursor-pointer transition-transform ${color === c ? "border-white scale-110 ring-2 ring-[#FFD166]" : "border-white/20"}`}
                  style={{ background: c }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          )
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={doUndo}
            disabled={!canUndo}
            className="bg-white/10 border border-white/20 text-white rounded-full py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Undo2 className="w-4 h-4" /> Desfazer
          </button>
          <button onClick={clearAll} className="bg-white/10 border border-white/20 text-white rounded-full py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer">
            <Trash2 className="w-4 h-4" /> Limpar
          </button>
        </div>

        <div className="pt-2 border-t border-white/10 space-y-2">
          {full ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 20))}
              placeholder="Nome do artista (vai na moldura)"
              className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FFD166]"
            />
          ) : (
            <button
              onClick={() => onLocked?.("A moldura com o nome da criança")}
              className="w-full text-left bg-white/5 border border-dashed border-white/25 rounded-full px-4 py-2.5 text-white/55 text-sm cursor-pointer"
            >
              🔒 Nome do artista na moldura (Natal Completo)
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={download} className="bg-white/10 border border-[#FFD166]/50 text-white rounded-full py-3 text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer hover:bg-white/15">
              <Download className="w-4 h-4 text-[#FFD166]" /> Baixar
            </button>
            <button
              onClick={share}
              className="bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] text-white rounded-full py-3 text-sm font-bold inline-flex items-center justify-center gap-1.5 border border-[#FFD166]/50 btn-shine cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[#FFD166] relative z-10" />
              <span className="relative z-10">Compartilhar</span>
            </button>
          </div>
          {lockDesign && onDone && (
            <button
              onClick={() => {
                onDone();
                say("Estrela conquistada! ⭐");
              }}
              className="w-full bg-[#2DC653] hover:bg-[#25a846] text-white rounded-full py-3 text-sm font-bold cursor-pointer"
            >
              Terminei! ⭐
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
