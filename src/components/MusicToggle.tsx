import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Music, Pause, SkipForward } from "lucide-react";
import { musicBox } from "../lib/christmasMusic";

/** Botão flutuante para ligar a música de Natal (desligada por padrão). */
export default function MusicToggle() {
  const [playing, setPlaying] = useState(false);
  const [title, setTitle] = useState(musicBox.currentTitle);
  const [hint, setHint] = useState(true);

  useEffect(() => {
    musicBox.onSongChange = setTitle;
    const t = setTimeout(() => setHint(false), 9000);
    return () => {
      clearTimeout(t);
      musicBox.pause();
    };
  }, []);

  const toggle = async () => {
    setHint(false);
    if (playing) {
      musicBox.pause();
      setPlaying(false);
    } else {
      await musicBox.play();
      setPlaying(true);
    }
  };

  return (
    <div className="fixed left-3 sm:left-5 bottom-[88px] md:bottom-5 z-50 flex items-center gap-2">
      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className={`relative w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 border-[#FFD166] shadow-xl cursor-pointer ${
          playing ? "bg-gradient-to-br from-[#2DC653] to-[#137a34]" : "bg-gradient-to-br from-[#D90429] to-[#7A0015]"
        }`}
        aria-label={playing ? "Pausar música de Natal" : "Tocar música de Natal"}
        aria-pressed={playing}
      >
        {!playing && <span className="absolute inset-0 rounded-full animate-ping bg-[#FFD166]/30" />}
        {playing ? <Pause className="w-5 h-5 text-white" /> : <Music className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFD166]" />}

        {/* Notas musicais subindo enquanto toca */}
        <AnimatePresence>
          {playing &&
            [0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute text-[#FFD166] text-sm pointer-events-none"
                initial={{ opacity: 0, y: 0, x: 0 }}
                animate={{ opacity: [0, 1, 0], y: -46, x: (i - 1) * 16 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
              >
                {i % 2 ? "♫" : "♪"}
              </motion.span>
            ))}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {(playing || hint) && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className={`${playing ? "flex" : "hidden sm:flex"} items-center gap-2 bg-[#0B132B]/90 backdrop-blur border border-[#FFD166]/40 rounded-full pl-3 pr-1.5 py-1.5 text-xs text-[#EDF2F4] shadow-lg`}
          >
            {playing ? (
              <>
                <span className="flex items-end gap-[2px] h-3.5" aria-hidden="true">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className="eq-bar w-[3px] bg-[#FFD166] rounded-sm" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
                <span className="max-w-[130px] sm:max-w-none truncate">{title}</span>
                <button
                  onClick={() => musicBox.next()}
                  className="p-1 rounded-full hover:bg-white/10 cursor-pointer"
                  aria-label="Próxima música"
                >
                  <SkipForward className="w-3.5 h-3.5 text-[#FFD166]" />
                </button>
              </>
            ) : (
              <span className="pr-1.5">🎵 Ligue a música de Natal</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
