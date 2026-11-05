import { useEffect, useState } from "react";
import { motion } from "motion/react";
import BackButton from "../BackButton";
import { useBackClose } from "../../lib/backClose";
import { prettyName } from "../../lib/prettyText";

/** "A carta do Papai Noel está a caminho": o que a criança vê antes da data de entrega. */
export default function OnTheWay({ childName, deliverAt, protocol, message, onClose }: { childName: string; deliverAt?: string; protocol?: number; message: string; onClose: () => void }) {
  useBackClose(true, onClose);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const target = deliverAt ? Date.parse(deliverAt) : 0;
  const far = target > Date.parse("2090-01-01");
  const left = Math.max(0, target - now);
  const d = Math.floor(left / 864e5);
  const h = Math.floor((left % 864e5) / 36e5);
  const m = Math.floor((left % 36e5) / 6e4);
  const s = Math.floor((left % 6e4) / 1e3);
  const first = prettyName(childName.trim().split(/\s+/)[0] || childName);
  return (
    <motion.div className="fixed inset-0 z-50 bg-[#060B19]/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="relative w-full max-w-md text-center text-white">
        <div className="absolute left-0 top-0">
          <BackButton onClick={onClose} />
        </div>
        <motion.div animate={{ x: [-30, 30, -30], y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity }} className="text-7xl mt-10 mb-4" aria-hidden="true">
          🦌🦌🛷
        </motion.div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#FFD166]">📮 Correio do Polo Norte</p>
        <h1 className="font-cinzel text-2xl sm:text-3xl font-bold mt-2">{message}</h1>
        <p className="text-white/75 mt-2 text-sm">
          {first}, o Papai Noel já escreveu a sua carta{protocol ? ` (é a nº ${protocol.toLocaleString("pt-BR")} do Polo Norte)` : ""}. O trenó está trazendo!
        </p>
        {target > 0 && !far && left > 0 && (
          <div className="mt-6 grid grid-cols-4 gap-2 max-w-xs mx-auto" aria-label="Tempo até a carta chegar">
            {[
              [d, "dias"],
              [h, "horas"],
              [m, "min"],
              [s, "seg"],
            ].map(([v, l]) => (
              <div key={l as string} className="rounded-2xl bg-[#D90429] border border-[#FFD166]/60 py-3">
                <div className="font-cinzel text-2xl font-extrabold">{String(v).padStart(2, "0")}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/80">{l}</div>
              </div>
            ))}
          </div>
        )}
        {target > 0 && !far && left === 0 && (
          <button onClick={() => window.location.reload()} className="mt-6 rounded-full px-6 py-3 font-extrabold bg-[#FFD166] text-[#0B132B] cursor-pointer">
            Chegou! Abrir a carta 🎁
          </button>
        )}
        <p className="mt-6 text-xs text-white/50">Enquanto isso, que tal deixar biscoitos e um copo de leite na janela? 🍪🥛</p>
      </div>
    </motion.div>
  );
}
