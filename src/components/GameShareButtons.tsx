import { useState } from "react";
import { Share2, Loader2 } from "lucide-react";
import { WhatsIcon } from "./letter/ShareSheet";
import { canvasToBlob, safeName, shareOrDownload, whatsappUrl } from "../lib/shareKit";
import { gameLink, renderScoreCard, type ScoreCardInput } from "../lib/scoreCard";

/** Botões de "desafiar a família": cartão do recorde (imagem) e mensagem no WhatsApp. */
export default function GameShareButtons({ card, getSnapshot }: { card: Omit<ScoreCardInput, "snapshot">; getSnapshot: () => HTMLCanvasElement | null }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const text = `🎮 ${card.player ? `${card.player} fez` : "Fiz"} ${card.score} pontos no ${card.game} (${card.title} ${card.emoji})! Consegue me vencer? Jogue grátis: ${gameLink(card.anchor)}`;

  const shareCard = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // copia o quadro do jogo antes de qualquer coisa mudar na tela
      const src = getSnapshot();
      let snap: HTMLCanvasElement | null = null;
      if (src && src.width) {
        snap = document.createElement("canvas");
        snap.width = src.width;
        snap.height = src.height;
        snap.getContext("2d")!.drawImage(src, 0, 0);
      }
      const c = await renderScoreCard({ ...card, snapshot: snap });
      const b = await canvasToBlob(c, "image/jpeg", 0.9);
      const r = await shareOrDownload(b, `Recorde-${safeName(card.game)}-${card.score}.jpg`, text, card.game);
      if (r === "downloaded") {
        setNote("Imagem salva! Poste no Status ou nos Stories. 📲");
        setTimeout(() => setNote(null), 3500);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-sm mb-3">
      <div className="flex gap-2">
        <a
          href={whatsappUrl(text)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full py-2.5 text-xs sm:text-sm font-bold bg-[#25D366] hover:bg-[#1EBE5A] text-[#06371B] inline-flex items-center justify-center gap-1.5"
          id={`${card.anchor}-share-wa`}
        >
          <WhatsIcon className="w-4 h-4" /> Desafiar
        </a>
        <button
          onClick={shareCard}
          disabled={busy}
          className="flex-1 rounded-full py-2.5 text-xs sm:text-sm font-bold bg-white/15 hover:bg-white/25 border border-white/30 text-white inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          id={`${card.anchor}-share-card`}
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} Postar recorde
        </button>
      </div>
      {note && <p className="text-[11px] text-[#FFD166] mt-1.5">{note}</p>}
    </div>
  );
}
