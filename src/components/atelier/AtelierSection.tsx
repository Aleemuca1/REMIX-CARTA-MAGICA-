import { useEffect, useState } from "react";
import BackButton from "../BackButton";
import { useBackClose } from "../../lib/backClose";
import { motion, AnimatePresence } from "motion/react";
import { X, Palette } from "lucide-react";
import Reveal from "../Reveal";
import AtelierEditor from "./AtelierEditor";
import { DESIGNS, designDataUrl } from "../../atelier/designs";
import { getChildName, hasFullAccess } from "../../advent/access";
import ProUpsell from "../ProUpsell";

/** Seção "Ateliê de Natal": colorir desenhos ou desenhar livre, baixar e compartilhar. */
export default function AtelierSection({ onUpgrade }: { onUpgrade?: () => void }) {
  const [open, setOpen] = useState(false);
  const preview = DESIGNS.filter((d) => !d.exclusive).slice(0, 6);

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="atelie">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#FF8FA3]/50 bg-gradient-to-br from-[#2A1036] via-[#1C2541] to-[#0B132B] p-6 sm:p-10 grid md:grid-cols-2 gap-8 items-center shadow-2xl">
          <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-[#FF8FA3]/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0B132B] bg-[#FF8FA3] rounded-full px-3 py-1 mb-3">
              🎨 Grátis para colorir
            </span>
            <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">Ateliê de Natal</h2>
            <p className="text-sm sm:text-base text-[#EDF2F4]/80 mb-5 leading-relaxed">
              Pinte desenhos de Natal com o balde de tinta mágico (não sai da linha!), desenhe livre com pincel de brilho e
              enfeite com adesivos. No final, baixe com uma moldura especial e mande para a família.
            </p>
            <ul className="text-xs sm:text-sm text-[#EDF2F4]/70 space-y-1.5 mb-6 inline-block text-left">
              <li>🖍️ 8 desenhos para colorir + desenho livre</li>
              <li>✨ Pincel de brilho, adesivos e borracha</li>
              <li>📲 Baixe ou compartilhe no WhatsApp</li>
            </ul>
            <div>
              <button
                onClick={() => setOpen(true)}
                className="bg-gradient-to-r from-[#F72585] to-[#B5179E] text-white font-extrabold px-8 py-4 rounded-full inline-flex items-center gap-2 shadow-lg border border-[#FFD166]/50 btn-shine animate-soft-pulse cursor-pointer text-lg"
                id="atelier-open-btn"
              >
                <Palette className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Abrir o Ateliê</span>
              </button>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3">
            {preview.map((d, i) => (
              <motion.button
                key={d.id}
                onClick={() => setOpen(true)}
                className="aspect-square rounded-2xl bg-white p-2 shadow-lg cursor-pointer"
                animate={{ rotate: [i % 2 ? -3 : 3, i % 2 ? 3 : -3, i % 2 ? -3 : 3], y: [0, -4, 0] }}
                transition={{ duration: 4 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.08 }}
                aria-label={`Colorir ${d.name}`}
              >
                <img src={designDataUrl(d, 160)} alt={d.name} className="w-full h-full" draggable={false} />
              </motion.button>
            ))}
          </div>
        </div>
      </Reveal>

      <AnimatePresence>
        {open && (
          <AtelierModal
            onClose={() => setOpen(false)}
            onUpgrade={
              onUpgrade
                ? () => {
                    setOpen(false);
                    setTimeout(onUpgrade, 250);
                  }
                : undefined
            }
          />
        )}
      </AnimatePresence>
    </section>
  );
}

export function AtelierModal({
  onClose,
  designId,
  lockDesign,
  allowExclusive,
  onDone,
  title = "Ateliê de Natal",
  onUpgrade,
}: {
  onUpgrade?: () => void;
  onClose: () => void;
  designId?: string;
  lockDesign?: boolean;
  allowExclusive?: boolean;
  onDone?: () => void;
  title?: string;
}) {
  const [full] = useState(() => hasFullAccess());
  const [locked, setLocked] = useState<string | null>(null);
  useBackClose(true, onClose);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", k);
    };
  }, [onClose]);
  return (
    <motion.div
      className="fixed inset-0 z-[88] bg-black/90 backdrop-blur-sm flex items-start justify-center p-2 sm:p-5 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative my-auto w-full max-w-5xl bg-gradient-to-b from-[#1C2541] to-[#0B132B] border-2 border-[#FFD166] rounded-3xl p-4 sm:p-6 shadow-2xl"
        initial={{ scale: 0.92, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white">🎨 {title}</h3>
          <BackButton onClick={onClose} />
        </div>
        <AtelierEditor
          initialDesignId={designId}
          lockDesign={lockDesign}
          allowExclusive={allowExclusive}
          childName={getChildName()}
          onDone={onDone}
          full={full}
          onLocked={(what) => setLocked(what)}
        />
        <AnimatePresence>
          {locked && (
            <ProUpsell
              title="Exclusivo do Natal Completo ✨"
              text={`${locked} faz parte do Natal Completo, junto com mais desenhos, adesivos especiais e a moldura com o nome da criança.`}
              onClose={() => setLocked(null)}
              onUpgrade={
                onUpgrade
                  ? () => {
                      setLocked(null);
                      onUpgrade();
                    }
                  : undefined
              }
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
