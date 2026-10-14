import { useEffect, useRef, useState, type PointerEvent } from "react";
import { motion } from "motion/react";
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { useBackClose } from "../../lib/backClose";

const SIZE = 256;

/**
 * Recorta o rostinho em círculo. A foto é lida e processada aqui mesmo no navegador.
 * Devolve um JPEG pequeno (256x256).
 */
export default function FaceCropper({ file, onDone, onCancel }: { file: File; onDone: (dataUrl: string) => void; onCancel: () => void }) {
  useBackClose(true, onCancel);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rot, setRot] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const VIEW = 260;

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const i = new Image();
    i.onload = () => setImg(i);
    i.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // escala base: a menor medida da foto preenche o círculo
  const base = img ? VIEW / Math.min(img.naturalWidth, img.naturalHeight) : 1;

  useEffect(() => {
    const c = canvasRef.current;
    if (!c || !img) return;
    const ctx = c.getContext("2d")!;
    c.width = VIEW * 2;
    c.height = VIEW * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.fillStyle = "#0B132B";
    ctx.fillRect(0, 0, VIEW, VIEW);
    ctx.save();
    ctx.translate(VIEW / 2 + pos.x, VIEW / 2 + pos.y);
    ctx.rotate((rot * Math.PI) / 180);
    const s = base * zoom;
    ctx.drawImage(img, (-img.naturalWidth * s) / 2, (-img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
    ctx.restore();
    // máscara: escurece fora do círculo
    ctx.fillStyle = "rgba(6,11,25,0.65)";
    ctx.beginPath();
    ctx.rect(0, 0, VIEW, VIEW);
    ctx.arc(VIEW / 2, VIEW / 2, VIEW / 2 - 14, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.strokeStyle = "#FFD166";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(VIEW / 2, VIEW / 2, VIEW / 2 - 14, 0, Math.PI * 2);
    ctx.stroke();
  }, [img, zoom, rot, pos, base]);

  const down = (e: PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
  };
  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current) return;
    const r = (e.target as HTMLElement).getBoundingClientRect();
    const k = VIEW / r.width;
    setPos({ x: drag.current.px + (e.clientX - drag.current.x) * k, y: drag.current.py + (e.clientY - drag.current.y) * k });
  };

  const finish = () => {
    if (!img) return;
    const out = document.createElement("canvas");
    out.width = SIZE;
    out.height = SIZE;
    const ctx = out.getContext("2d")!;
    const inner = VIEW - 28; // diâmetro do círculo
    const k = SIZE / inner;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.translate(SIZE / 2 + pos.x * k, SIZE / 2 + pos.y * k);
    ctx.rotate((rot * Math.PI) / 180);
    const s = base * zoom * k;
    ctx.drawImage(img, (-img.naturalWidth * s) / 2, (-img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
    onDone(out.toDataURL("image/jpeg", 0.82));
  };

  return (
    <motion.div
      className="fixed inset-0 z-[120] bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full sm:max-w-sm bg-[#0B132B] border-2 border-[#FFD166] rounded-t-3xl sm:rounded-3xl p-5 text-center"
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        exit={{ y: 60 }}
      >
        <h4 className="font-cinzel text-lg font-bold text-white mb-1">Ajuste o rostinho</h4>
        <p className="text-xs text-white/60 mb-3">Arraste a foto e use o zoom para o rosto ficar dentro do círculo.</p>
        <canvas
          ref={canvasRef}
          className="mx-auto rounded-2xl touch-none cursor-grab active:cursor-grabbing"
          style={{ width: VIEW, height: VIEW, maxWidth: "100%" }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
          aria-label="Área para ajustar a foto"
        />
        <div className="flex items-center gap-2 mt-3">
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))} className="p-2 rounded-full bg-white/10 text-white cursor-pointer" aria-label="Diminuir zoom">
            <ZoomOut className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={0.5}
            max={3.5}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-[#FFD166]"
            aria-label="Zoom"
          />
          <button onClick={() => setZoom((z) => Math.min(3.5, z + 0.15))} className="p-2 rounded-full bg-white/10 text-white cursor-pointer" aria-label="Aumentar zoom">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => setRot((r) => (r + 90) % 360)} className="p-2 rounded-full bg-white/10 text-white cursor-pointer" aria-label="Girar">
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onCancel} className="flex-1 rounded-full py-3 text-sm font-bold bg-white/10 text-white cursor-pointer">
            Cancelar
          </button>
          <button
            onClick={finish}
            disabled={!img}
            className="flex-[1.4] rounded-full py-3 text-sm font-bold bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white border border-[#FFD166]/50 cursor-pointer disabled:opacity-40"
            id="face-done"
          >
            Pronto ✨
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
