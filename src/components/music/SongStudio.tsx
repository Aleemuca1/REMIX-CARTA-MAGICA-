import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Download, Music2, Pause, Play, Sparkles, X } from "lucide-react";
import confetti from "canvas-confetti";
import { createSong, musicStatus, type Song, type MusicStatus, SONG_STYLES } from "../../lib/music";
import { prettyName } from "../../lib/prettyText";

const STEPS = [
  "🎼 O Papai Noel está escrevendo a letra com o nome...",
  "🔔 Os duendes estão afinando os sininhos do trenó...",
  "🎹 A orquestra do Polo Norte está ensaiando...",
  "🎤 O coral das renas está gravando...",
  "✨ Colocando o brilho mágico no final...",
];

type Props = { token?: string; code?: string; childName: string; onClose: () => void; onUpgrade?: () => void };

/** Estúdio da Música de Natal: escolhe o estilo, cria, toca a música e mostra a letra. */
export default function SongStudio({ token, code, childName, onClose, onUpgrade }: Props) {
  const [st, setSt] = useState<MusicStatus | null>(null);
  const [song, setSong] = useState<Song | null>(null);
  const [style, setStyle] = useState("alegre");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const first = prettyName(childName.trim().split(/\s+/)[0] || childName);

  useEffect(() => {
    musicStatus({ token, code })
      .then((s) => {
        setSt(s);
        const mine = s.songs?.find((x) => x.child.trim().toLowerCase() === childName.trim().toLowerCase());
        if (mine) setSong(mine);
      })
      .catch(() => setSt({ enabled: false, allowed: false }));
  }, [token, code, childName]);

  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 9000);
    return () => clearInterval(t);
  }, [busy]);

  useEffect(() => () => audio.current?.pause(), []);

  const make = async () => {
    setBusy(true);
    setErr(null);
    setStep(0);
    try {
      const s = await createSong({ token, code, childName, style });
      setSong(s);
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.4 }, zIndex: 90, colors: ["#FFD166", "#D90429", "#2DC653", "#FFFFFF"] });
    } catch (e: any) {
      setErr(e?.message || "Não deu certo agora. Tente de novo.");
    } finally {
      setBusy(false);
    }
  };

  const toggle = () => {
    if (!song?.url) return;
    if (!audio.current) {
      audio.current = new Audio(song.url);
      audio.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audio.current.pause();
      setPlaying(false);
    } else {
      void audio.current.play();
      setPlaying(true);
    }
  };

  const download = async () => {
    if (!song?.url) return;
    try {
      const blob = await (await fetch(song.url)).blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `musica-de-natal-${first.toLowerCase()}.mp3`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch {
      window.open(song.url, "_blank");
    }
  };

  const body = (
    <motion.div
      className="fixed inset-0 z-[80] bg-[#060B19]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Música de Natal"
      id="song-studio"
    >
      <motion.div
        initial={{ y: 40, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        className="relative w-full max-w-md my-auto rounded-3xl overflow-hidden border-2 border-[#FFD166]/70 bg-gradient-to-b from-[#2B0B10] via-[#1C2541] to-[#0B132B] text-white shadow-2xl"
      >
        <button onClick={onClose} className="absolute right-3 top-3 z-10 rounded-full bg-white/10 hover:bg-white/20 p-2 cursor-pointer" aria-label="Fechar">
          <X className="w-4 h-4" />
        </button>
        {/* cabeçalho com notas flutuando */}
        <div className="relative px-6 pt-7 pb-5 text-center overflow-hidden">
          {["♪", "♫", "♬", "♪", "♫"].map((n, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className="absolute text-[#FFD166]/50 text-2xl"
              style={{ left: `${10 + i * 19}%`, top: "60%" }}
              animate={{ y: [-4, -46, -4], opacity: [0, 1, 0], rotate: [-10, 10, -10] }}
              transition={{ duration: 3.2 + i * 0.4, repeat: Infinity, delay: i * 0.6 }}
            >
              {n}
            </motion.span>
          ))}
          <div className="relative mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#D90429] to-[#EF233C] grid place-items-center border-2 border-[#FFD166] shadow-lg">
            <Music2 className="w-8 h-8 text-[#FFD166]" />
          </div>
          <p className="relative mt-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#FFD166]">Estúdio do Polo Norte</p>
          <h2 className="relative font-xmas text-3xl sm:text-4xl mt-1">A música de {first}</h2>
          <p className="relative text-white/70 text-sm mt-1">Uma música de Natal cantada, feita só para {first}, com o nome e as conquistas do ano.</p>
        </div>

        <div className="px-5 pb-6">
          {!st && <p className="text-center text-white/70 py-6">Abrindo o estúdio... 🎶</p>}

          {st && !st.allowed && (
            <div className="text-center py-3">
              <p className="text-white/85 text-sm">A Música de Natal faz parte dos planos pagos: <b className="text-[#FFD166]">uma música para cada criança</b>.</p>
              {onUpgrade && (
                <button onClick={onUpgrade} className="mt-4 rounded-full px-6 py-3 font-extrabold bg-[#FFD166] text-[#0B132B] cursor-pointer" id="song-upgrade">
                  Ver planos 🎁
                </button>
              )}
            </div>
          )}

          {st && st.allowed && !st.enabled && !song && (
            <p className="text-center text-white/80 text-sm py-4">Os duendes estão terminando de montar o estúdio. A Música de Natal chega em breve! 🎄</p>
          )}

          {st?.allowed && song && (
            <div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
                <motion.button
                  onClick={toggle}
                  whileTap={{ scale: 0.92 }}
                  className="shrink-0 w-14 h-14 rounded-full bg-[#FFD166] text-[#0B132B] grid place-items-center shadow-lg cursor-pointer"
                  aria-label={playing ? "Pausar" : "Tocar"}
                  id="song-play"
                >
                  {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </motion.button>
                <div className="min-w-0 flex-1">
                  <p className="font-bold truncate">{song.title}</p>
                  <span className="flex items-end gap-[3px] h-4 mt-1" aria-hidden="true">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <span key={i} className={`w-[3px] rounded-sm bg-[#FFD166] ${playing ? "eq-bar" : ""}`} style={{ height: playing ? undefined : `${4 + ((i * 7) % 10)}px`, animationDelay: `${i * 0.08}s` }} />
                    ))}
                  </span>
                </div>
                <button onClick={download} className="shrink-0 rounded-full bg-white/10 hover:bg-white/20 p-3 cursor-pointer" aria-label="Baixar a música" id="song-download">
                  <Download className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 max-h-64 overflow-y-auto rounded-2xl bg-[#FCF9F2] text-[#2B2118] p-4">
                {song.lyrics.filter((s) => s.lines.length).map((s, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B021A]">{s.name}</p>
                    {s.lines.map((l, k) => (
                      <p key={k} className={`font-ps text-[20px] leading-snug ${/refr/i.test(s.name) ? "text-[#9B021A]" : ""}`}>
                        {l}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-white/50 text-center mt-3">Baixe a música para tocar na ceia e mandar para a família. 🎄</p>
            </div>
          )}

          {st?.allowed && st.enabled && !song && !busy && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#FFD166] mb-2">Escolha o ritmo</p>
              <div className="grid grid-cols-2 gap-2">
                {SONG_STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    id={`song-style-${s.id}`}
                    className={`rounded-2xl p-3 text-left border cursor-pointer transition-colors ${style === s.id ? "bg-[#FFD166] text-[#0B132B] border-[#FFD166]" : "bg-white/5 border-white/15 hover:border-[#FFD166]/60"}`}
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {s.emoji}
                    </span>
                    <p className="font-bold text-sm mt-1">{s.label}</p>
                    <p className={`text-[11px] ${style === s.id ? "text-[#0B132B]/70" : "text-white/55"}`}>{s.desc}</p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-white/60 mt-3 text-center">
                {st.remaining} de {st.limit} {st.limit === 1 ? "música disponível" : "músicas disponíveis"} no seu plano (uma por criança).
              </p>
              {st.remaining > 0 ? (
                <motion.button
                  onClick={make}
                  whileTap={{ scale: 0.96 }}
                  className="mt-3 w-full rounded-full py-4 font-extrabold text-lg bg-gradient-to-r from-[#D90429] to-[#EF233C] border border-[#FFD166]/60 btn-shine cursor-pointer inline-flex items-center justify-center gap-2"
                  id="song-create"
                >
                  <Sparkles className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Criar a música de {first}</span>
                </motion.button>
              ) : (
                <p className="mt-3 text-center text-sm text-[#FFD166]">Seu plano já usou todas as músicas. 🎶</p>
              )}
              {err && <p className="mt-3 text-center text-sm text-[#FF8FA3]">{err}</p>}
            </div>
          )}

          {busy && (
            <div className="text-center py-6" aria-live="polite">
              <div className="relative mx-auto w-28 h-28">
                <motion.div className="absolute inset-0 rounded-full border-4 border-dashed border-[#FFD166]/70" animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} />
                <motion.span className="absolute inset-0 grid place-items-center text-5xl" animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                  🎅
                </motion.span>
              </div>
              <AnimatePresence mode="wait">
                <motion.p key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-4 font-bold text-[#FFD166]">
                  {STEPS[step]}
                </motion.p>
              </AnimatePresence>
              <p className="text-xs text-white/55 mt-2">Leva de 1 a 3 minutos. Não feche esta tela. 🎶</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
  return createPortal(body, document.body);
}
