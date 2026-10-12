import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { grantFullAccess, saveAccessCode } from "../../advent/access";

/** "Já comprou?" — libera o plano em outro aparelho com o código mágico. */
export default function CodeRedeem({ onUnlocked }: { onUnlocked: (childName?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const c = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (c.length !== 6) {
      setErr("O código tem 6 letras e números.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/access/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) {
        setErr(d.error || "Código não encontrado.");
        return;
      }
      grantFullAccess();
      saveAccessCode(c);
      setOpen(false);
      onUnlocked(d.childName);
    } catch {
      setErr("Sem conexão. Tente de novo.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs sm:text-sm text-[#EDF2F4]/70 hover:text-white underline inline-flex items-center gap-1.5 cursor-pointer"
        id="advent-code-btn"
      >
        <KeyRound className="w-3.5 h-3.5 text-[#FFD166]" /> Já comprou? Use seu código mágico
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 8))}
          placeholder="Ex.: K7M2QX"
          aria-label="Código mágico"
          autoFocus
          className="w-36 text-center tracking-[0.3em] font-bold uppercase bg-[#0B132B] border border-[#FFD166]/50 rounded-full px-4 py-2 text-white placeholder:text-white/30 placeholder:tracking-normal focus:outline-none focus:border-[#FFD166]"
          id="advent-code-input"
        />
        <button
          type="submit"
          disabled={busy}
          className="bg-[#FFD166] text-[#0B132B] font-bold px-5 py-2 rounded-full disabled:opacity-60 cursor-pointer"
          id="advent-code-submit"
        >
          {busy ? "..." : "Liberar"}
        </button>
      </div>
      {err && <p className="text-xs text-[#EF233C]">{err}</p>}
      <p className="text-[11px] text-[#EDF2F4]/50">O código veio na tela de confirmação e no e-mail da compra.</p>
    </form>
  );
}
