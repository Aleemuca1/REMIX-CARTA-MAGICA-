import { AnimatePresence, motion } from "motion/react";
import { X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type Props = {
  msg: { kind: "wait" | "ok" | "error"; text: string } | null;
  onClose: () => void;
};

export default function PaymentToast({ msg, onClose }: Props) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed z-[200] bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md rounded-2xl border border-[#FFD166]/50 bg-[#0B132B]/95 backdrop-blur text-white shadow-2xl p-4 flex items-start gap-3"
        >
          {msg.kind === "wait" && <Loader2 className="w-5 h-5 text-[#FFD166] animate-spin shrink-0 mt-0.5" />}
          {msg.kind === "ok" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {msg.kind === "error" && <AlertCircle className="w-5 h-5 text-[#EF233C] shrink-0 mt-0.5" />}
          <p className="text-sm flex-1">{msg.text}</p>
          {msg.kind !== "wait" && (
            <button onClick={onClose} aria-label="Fechar" className="text-white/60 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
