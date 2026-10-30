import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Plus, X, RotateCcw, Users, Volume2, Award, Loader2 } from "lucide-react";
import { WhatsIcon } from "../letter/ShareSheet";
import { musicBox } from "../../lib/christmasMusic";
import { santaSpeak } from "../../lib/santaSpeak";
import { canvasToBlob, safeName, shareOrDownload, whatsappUrl } from "../../lib/shareKit";
import { renderFamilyCertificate, type RankRow } from "../../lib/scoreCard";

export const PLAYER_COLORS = ["#FFD166", "#4CC9F0", "#F72585", "#2DC653"];
const QUICK = ["Mamãe", "Papai", "Vovó", "Vovô", "Titia", "Irmão", "Irmã"];
const KEY = "carta-magica-jogadores";

export function loadPlayers(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (Array.isArray(v) && v.length) return v.slice(0, 4).map(String);
  } catch {
    /* nada */
  }
  return ["", ""];
}
export function savePlayers(names: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(names.map((n) => n.trim()).slice(0, 4)));
  } catch {
    /* nada */
  }
}
/** Nomes finais (vazios viram "Jogador N"). */
export const finalNames = (names: string[]) => names.map((n, i) => n.trim() || `Jogador ${i + 1}`);

/** Lista de até 4 jogadores com nome (ex.: Pedro, Ben, Samuka e Ale). */
export function PlayersEditor({ names, setNames, min = 2, accent = "#FFD166" }: { names: string[]; setNames: (n: string[]) => void; min?: number; accent?: string }) {
  const set = (i: number, v: string) => setNames(names.map((n, k) => (k === i ? v.slice(0, 14) : n)));
  return (
    <div className="w-full max-w-sm text-left">
      <p className="text-xs font-bold uppercase tracking-widest mb-2 inline-flex items-center gap-1.5" style={{ color: accent }}>
        <Users className="w-4 h-4" /> Quem vai jogar? (até 4)
      </p>
      <div className="space-y-2">
        {names.map((n, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[11px] font-extrabold text-[#0B132B]" style={{ background: PLAYER_COLORS[i] }}>
              {i + 1}
            </span>
            <input
              value={n}
              onChange={(e) => set(i, e.target.value)}
              placeholder={["Ex: Pedro", "Ex: Ben", "Ex: Samuka", "Ex: Ale"][i]}
              className="flex-1 min-w-0 bg-white/10 border border-white/25 rounded-full px-4 py-2 text-white text-sm focus:outline-none"
              id={`fam-name-${i}`}
            />
            {names.length > min && (
              <button onClick={() => setNames(names.filter((_, k) => k !== i))} className="p-2 rounded-full bg-white/10 text-white cursor-pointer" aria-label="Tirar jogador">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      {names.length < 4 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          <button onClick={() => setNames([...names, ""])} className="rounded-full px-3 py-1.5 text-xs font-bold bg-white/10 text-white inline-flex items-center gap-1 cursor-pointer" id="fam-add-player">
            <Plus className="w-3.5 h-3.5" /> Jogador
          </button>
          {QUICK.filter((q) => !names.includes(q))
            .slice(0, 3)
            .map((q) => (
              <button key={q} onClick={() => setNames([...names, q])} className="rounded-full px-3 py-1.5 text-xs font-bold bg-white/5 border border-white/15 text-white/85 cursor-pointer">
                + {q}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

/** Tela de "passe o celular": quem jogou e quem é o próximo. */
export function NextTurn({ last, lastScore, unit, next, nextIdx, onGo, accent, goId }: { last: string; lastScore: number; unit: string; next: string; nextIdx: number; onGo: () => void; accent: string; goId: string }) {
  useEffect(() => {
    musicBox.chime(84, undefined, 0.12);
    santaSpeak(`Muito bem, ${last}! ${lastScore} ${unit}. Agora é a vez de ${next}!`);
  }, [last, lastScore, unit, next]);
  return (
    <div className="max-w-sm w-full text-center">
      <p className="text-white/80 text-sm">
        Muito bem, <b className="text-white">{last}</b>! 🎉
      </p>
      <p className="font-cinzel text-4xl font-extrabold my-1" style={{ color: accent }}>
        {lastScore} <span className="text-lg">{unit}</span>
      </p>
      <div className="mt-5 rounded-3xl bg-white/10 border-2 p-5" style={{ borderColor: PLAYER_COLORS[nextIdx] }}>
        <p className="text-xs uppercase tracking-widest text-white/60 font-bold">📱 Passe o celular para</p>
        <p className="font-cinzel text-3xl font-extrabold mt-1" style={{ color: PLAYER_COLORS[nextIdx] }}>
          {next}
        </p>
      </div>
      <motion.button
        onClick={onGo}
        whileTap={{ scale: 0.95 }}
        className="mt-5 w-full rounded-full py-4 font-extrabold text-lg text-[#0B132B] bg-gradient-to-r from-[#FFD166] to-[#F4A261] cursor-pointer shadow-lg"
        id={goId}
      >
        ▶ Começar a vez de {next}
      </motion.button>
    </div>
  );
}

/** Pódio da família: ranking, Papai Noel anuncia o vencedor, certificado do campeão para postar. */
export function FamilyPodium({
  game,
  anchor,
  ranking,
  unit,
  accent,
  onRetry,
  onSetup,
  retryId,
  onLetter,
}: {
  game: string;
  anchor: string;
  ranking: RankRow[];
  unit: string;
  accent: string;
  onRetry: () => void;
  onSetup: () => void;
  retryId: string;
  /** convite para cada criança escrever a cartinha (jogo do circo) */
  onLetter?: () => void;
}) {
  const sorted = [...ranking].sort((a, b) => b.score - a.score);
  const top = sorted[0]?.score ?? 0;
  const winners = sorted.filter((r) => r.score === top);
  const tie = winners.length > 1;
  const speech = tie
    ? `Ho ho ho! Que empate lindo! ${winners.map((w) => w.name).join(" e ")} fizeram ${top} ${unit}! Todos são campeões do Papai Noel!`
    : `Ho ho ho! Parabéns, ${winners[0]?.name}! Você venceu com ${top} ${unit}! ${sorted[1] ? `Em segundo lugar, ${sorted[1].name}. ` : ""}Que família campeã!`;
  const fullSpeech = onLetter ? `${speech} Agora cada um pode me escrever uma cartinha contando o que quer ganhar no Natal!` : speech;
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  useEffect(() => {
    musicBox.sleighBells(1.2, 0.08);
    const t = setTimeout(() => santaSpeak(fullSpeech), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const medal = ["🥇", "🥈", "🥉", "🎖️"];
  const link = `${location.origin}/#${anchor}`;
  const waText = `🏆 Campeonato da família no ${game}!\n${sorted.map((r) => `${medal[Math.min(3, new Set(sorted.filter((x) => x.score > r.score).map((x) => x.score)).size)]} ${r.name}: ${r.score} ${unit}`).join("\n")}\nJogue também: ${link}`;

  const cert = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const c = await renderFamilyCertificate({ game, ranking: sorted, unit });
      const b = await canvasToBlob(c, "image/jpeg", 0.92);
      const r = await shareOrDownload(b, `Campeao-${safeName(winners.map((w) => w.name).join("-"))}.jpg`, waText, "Certificado do Campeão");
      if (r === "downloaded") {
        setNote("Certificado salvo! Poste no Status ou imprima. 🏆");
        setTimeout(() => setNote(null), 4000);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md w-full text-center py-2">
      <div className="flex items-start gap-2 text-left">
        <div className="shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-[#EF233C] to-[#9B021A] border-2 border-[#FFD166] flex items-center justify-center text-4xl">🎅</div>
        <div className="relative flex-1 bg-white text-[#1C2541] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm shadow-lg" id={`${anchor}-podium-bubble`}>
          {fullSpeech}
          <button onClick={() => santaSpeak(fullSpeech)} className="absolute -bottom-3 right-2 bg-[#9B021A] text-white rounded-full px-2.5 py-1 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer">
            <Volume2 className="w-3 h-3" /> Ouvir
          </button>
        </div>
      </div>
      <div className="mt-6 space-y-2">
        {sorted.map((p, k) => (
          <motion.div
            key={p.name + k}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + k * 0.15 }}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 border-2 ${p.score === top ? "bg-[#FFD166]/15 border-[#FFD166]" : "bg-white/5 border-white/10"}`}
          >
            <span className="text-2xl">{medal[Math.min(3, new Set(sorted.filter((x) => x.score > p.score).map((x) => x.score)).size)]}</span>
            <span className="flex-1 text-left text-white font-bold">
              {p.name}
              {p.detail && <span className="block text-[11px] text-white/55 font-normal">{p.detail}</span>}
            </span>
            <span className="font-extrabold" style={{ color: accent }}>
              {p.score} {unit}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-5">
        <button
          onClick={cert}
          disabled={busy}
          className="rounded-full py-3 font-extrabold text-[#0B132B] text-sm bg-gradient-to-r from-[#FFD166] to-[#F4A261] inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
          id={`${anchor}-family-cert`}
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />} Certificado do campeão
        </button>
        <a
          href={whatsappUrl(waText)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full py-3 font-extrabold text-sm bg-[#25D366] text-[#06371B] inline-flex items-center justify-center gap-1.5"
          id={`${anchor}-family-wa`}
        >
          <WhatsIcon className="w-4 h-4" /> Enviar placar
        </a>
      </div>
      {note && <p className="text-[11px] text-[#FFD166] mt-1.5">{note}</p>}
      <div className="flex gap-2 mt-2">
        <button
          onClick={onRetry}
          className="flex-[1.3] rounded-full py-3.5 font-extrabold text-white bg-gradient-to-r from-[#2DC653] to-[#1a9e3e] border border-[#FFD166]/50 inline-flex items-center justify-center gap-2 cursor-pointer"
          id={retryId}
        >
          <RotateCcw className="w-5 h-5" /> Revanche!
        </button>
        <button onClick={onSetup} className="flex-1 rounded-full py-3.5 font-bold text-white bg-white/10 border border-white/20 cursor-pointer">
          Trocar jogadores
        </button>
      </div>
      {onLetter && (
        <button
          onClick={onLetter}
          className="w-full mt-3 rounded-2xl p-3.5 text-left bg-gradient-to-r from-[#9B021A] via-[#D90429] to-[#9B021A] border-2 border-[#FFD166] flex items-center gap-3 cursor-pointer shadow-xl animate-soft-pulse"
          id={`${anchor}-family-letter-cta`}
        >
          <span className="text-4xl shrink-0">✉️</span>
          <span className="min-w-0">
            <span className="block font-extrabold text-white text-base leading-tight">Agora, cartinhas para o Papai Noel!</span>
            <span className="block text-[11px] text-[#FFE9A8] mt-0.5">Cada criança faz a sua, com a ajuda de um adulto</span>
          </span>
        </button>
      )}
    </div>
  );
}

/** Botões "Sozinho / Em família". */
export function ModePicker({ family, setFamily, accent }: { family: boolean; setFamily: (v: boolean) => void; accent: string }) {
  return (
    <div className="grid grid-cols-2 gap-2 mb-3 w-full max-w-xs">
      {[
        [false, "👤 Sozinho", "bater o recorde"],
        [true, "👨‍👩‍👧 Em família", "até 4, cada um na sua vez"],
      ].map(([v, t, d]) => (
        <button
          key={String(v)}
          onClick={() => setFamily(v as boolean)}
          className={`rounded-2xl px-3 py-2 border-2 cursor-pointer text-left ${family === v ? "bg-white/15" : "border-white/20 bg-white/5"}`}
          style={family === v ? { borderColor: accent } : undefined}
          id={v ? "mode-family" : "mode-solo"}
        >
          <span className="block text-white font-bold text-sm">{t as string}</span>
          <span className="block text-[11px] text-white/60">{d as string}</span>
        </button>
      ))}
    </div>
  );
}
