import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Camera, Download, Film, Plus, Share2, Trash2, Bell, ShieldCheck } from "lucide-react";
import Reveal from "../Reveal";
import BackButton from "../BackButton";
import ProUpsell from "../ProUpsell";
import FaceCropper from "./FaceCropper";
import { useBackClose } from "../../lib/backClose";
import { musicBox } from "../../lib/christmasMusic";
import { hasFullAccess } from "../../advent/access";
import { SleighScene } from "../../family/sleighScene";
import { FREE_MEMBERS, MAX_MEMBERS, loadFaceImages, loadFamily, saveFamily, type FamilyMember, type FamilyState } from "../../family/store";

const NAME_SUGGESTIONS = ["Mamãe", "Papai", "Vovó", "Vovô", "Titia", "Titio"];

/** Seção "Família no Trenó": fotos da família viram passageiros do trenó do Papai Noel. */
export default function FamilySection({ onUpgrade }: { onUpgrade?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="familia">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#FFD166]/60 bg-gradient-to-br from-[#2B1240] via-[#1C2541] to-[#0B132B] p-6 sm:p-10 grid md:grid-cols-2 gap-8 items-center shadow-2xl">
          <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-[#F72585]/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0B132B] bg-[#FFD166] rounded-full px-3 py-1 mb-3">
              📸 Novo · com fotos da família
            </span>
            <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">A Família no Trenó do Papai Noel</h2>
            <p className="text-sm sm:text-base text-[#EDF2F4]/80 mb-5 leading-relaxed">
              Coloque a foto da criança, do papai, da mamãe e dos avós, e veja todo mundo voando no trenó do Papai Noel sobre o
              vilarejo! Toque na tela para tocar os sininhos e jogar presentes. Depois, a família também viaja no trenó do jogo
              Entrega Relâmpago.
            </p>
            <ul className="text-xs sm:text-sm text-[#EDF2F4]/70 space-y-1.5 mb-4 inline-block text-left">
              <li>🎅 Rostinhos com gorro de Papai Noel e nome</li>
              <li>🔔 Sininhos, neve caindo e presentes de paraquedas</li>
              <li>📲 Baixe a foto mágica ou um vídeo para o WhatsApp</li>
            </ul>
            <p className="text-[11px] text-[#2DC653] mb-6 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> As fotos ficam só no seu aparelho. Não enviamos para nenhum servidor.
            </p>
            <div>
              <button
                onClick={() => setOpen(true)}
                className="bg-gradient-to-r from-[#F72585] to-[#D90429] text-white font-extrabold px-8 py-4 rounded-full inline-flex items-center gap-2 shadow-lg border border-[#FFD166]/50 btn-shine animate-soft-pulse cursor-pointer text-lg"
                id="family-open-btn"
                data-celebrate
              >
                <Camera className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Colocar a família no trenó</span>
              </button>
            </div>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="relative z-10 h-56 sm:h-72 rounded-2xl overflow-hidden border border-white/10 cursor-pointer"
            aria-label="Abrir a família no trenó"
          >
            <PreviewScene />
          </button>
        </div>
      </Reveal>
      <AnimatePresence>
        {open && (
          <FamilyModal
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

/** Prévia: a cena real com rostinhos de exemplo (desenhados, sem fotos). */
function PreviewScene() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const scene = new SleighScene(ref.current!);
    scene.title = "Sua família aqui! 🎄";
    const make = (emoji: string, bg: string) => {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const x = c.getContext("2d")!;
      x.fillStyle = bg;
      x.fillRect(0, 0, 128, 128);
      x.font = "84px serif";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText(emoji, 64, 72);
      const img = new Image();
      img.src = c.toDataURL();
      return img;
    };
    scene.faces = [make("👧", "#FFE5EC"), make("👩", "#E0F2FE"), make("👨", "#ECFCCB")];
    scene.names = ["Sofia", "Mamãe", "Papai"];
    scene.start();
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? scene.start() : scene.stop()));
    io.observe(ref.current!);
    const onR = () => scene.resize();
    window.addEventListener("resize", onR);
    return () => {
      io.disconnect();
      scene.stop();
      window.removeEventListener("resize", onR);
    };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" aria-hidden="true" />;
}

function FamilyModal({ onClose, onUpgrade }: { onClose: () => void; onUpgrade?: () => void }) {
  useBackClose(true, onClose);
  const [fam, setFam] = useState<FamilyState>(() => loadFamily());
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [step, setStep] = useState<"fotos" | "passeio">(() => (loadFamily().members.length ? "passeio" : "fotos"));
  const [upsell, setUpsell] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const full = hasFullAccess();
  const limit = full ? MAX_MEMBERS : FREE_MEMBERS;

  const say = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const update = (f: FamilyState) => {
    setFam(f);
    if (!saveFamily(f)) say("O aparelho está sem espaço: as fotos ficam só até fechar a página.");
  };

  const addPhoto = () => {
    if (fam.members.length >= limit) {
      if (!full) setUpsell(true);
      else say(`Cabem até ${MAX_MEMBERS} pessoas no trenó!`);
      return;
    }
    fileRef.current?.click();
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      say("Escolha uma foto (imagem).");
      return;
    }
    setCropFile(f);
  };

  const onCropped = (img: string) => {
    setCropFile(null);
    const used = new Set(fam.members.map((m) => m.name));
    const name = NAME_SUGGESTIONS.find((n) => !used.has(n)) ?? "";
    const m: FamilyMember = { id: Math.random().toString(36).slice(2, 9), name: fam.members.length === 0 ? "" : name, img };
    update({ ...fam, members: [...fam.members, m] });
    musicBox.chime(84, undefined, 0.1);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[88] bg-black/90 backdrop-blur-sm flex items-start justify-center p-2 sm:p-5 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative my-auto w-full max-w-5xl bg-gradient-to-b from-[#2B1240] to-[#0B132B] border-2 border-[#FFD166] rounded-3xl p-3 sm:p-6 shadow-2xl"
        initial={{ scale: 0.94, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <BackButton onClick={onClose} />
          <div className="flex bg-white/10 rounded-full p-1 text-xs sm:text-sm font-bold">
            {(["fotos", "passeio"] as const).map((s) => (
              <button
                key={s}
                onClick={() => (s === "passeio" && !fam.members.length ? say("Adicione pelo menos uma foto 📸") : setStep(s))}
                className={`px-3 sm:px-4 py-1.5 rounded-full cursor-pointer ${step === s ? "bg-[#FFD166] text-[#0B132B]" : "text-white/80"}`}
              >
                {s === "fotos" ? "1. Fotos" : "2. Passeio 🛷"}
              </button>
            ))}
          </div>
        </div>

        {step === "fotos" ? (
          <div>
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white text-center mb-1">Quem vai no trenó? 🛷</h3>
            <p className="text-center text-sm text-white/70 mb-4">
              Adicione até {limit} pessoas. A primeira é a criança! {!full && `No Natal Completo cabem até ${MAX_MEMBERS} (vovós e titios também).`}
            </p>
            <input
              value={fam.title}
              onChange={(e) => update({ ...fam, title: e.target.value.slice(0, 40) })}
              placeholder="Título: Família da Sofia no trenó 🎅"
              className="w-full max-w-md mx-auto block mb-5 bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-white text-sm text-center placeholder:text-white/40 focus:outline-none focus:border-[#FFD166]"
              id="family-title"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {fam.members.map((m, i) => (
                <div key={m.id} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center gap-2">
                  <img src={m.img} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-[#FFD166]" />
                  <input
                    value={m.name}
                    onChange={(e) => update({ ...fam, members: fam.members.map((x) => (x.id === m.id ? { ...x, name: e.target.value.slice(0, 14) } : x)) })}
                    placeholder={i === 0 ? "Nome da criança" : "Nome"}
                    className="w-full bg-[#1C2541] border border-white/15 rounded-full px-3 py-1.5 text-white text-xs text-center focus:outline-none focus:border-[#FFD166]"
                  />
                  <button
                    onClick={() => update({ ...fam, members: fam.members.filter((x) => x.id !== m.id) })}
                    className="text-[11px] text-white/55 hover:text-white inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Tirar
                  </button>
                </div>
              ))}
              {fam.members.length < MAX_MEMBERS && (
                <button
                  onClick={addPhoto}
                  className="border-2 border-dashed border-[#FFD166]/60 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 min-h-[150px] text-white/85 hover:bg-white/5 cursor-pointer"
                  id="family-add"
                >
                  <span className="w-14 h-14 rounded-full bg-[#FFD166]/15 flex items-center justify-center">
                    {fam.members.length >= limit ? <span className="text-xl">🔒</span> : <Plus className="w-7 h-7 text-[#FFD166]" />}
                  </span>
                  <span className="text-xs font-bold">{fam.members.length === 0 ? "Foto da criança" : "Adicionar foto"}</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} id="family-file" />
            <p className="text-[11px] text-white/50 text-center mt-4 inline-flex items-center justify-center gap-1.5 w-full">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2DC653]" /> As fotos são recortadas aqui no seu aparelho e não saem dele.
            </p>
            <label className="mt-3 flex items-center justify-center gap-2 text-xs text-white/75 cursor-pointer">
              <input type="checkbox" checked={fam.inGame} onChange={(e) => update({ ...fam, inGame: e.target.checked })} className="accent-[#FFD166]" />
              Levar a família no trenó do jogo Entrega Relâmpago 🎮
            </label>
            <div className="text-center mt-5">
              <button
                onClick={() => (fam.members.length ? setStep("passeio") : addPhoto())}
                className="bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white font-extrabold px-8 py-3.5 rounded-full border border-[#FFD166]/50 btn-shine cursor-pointer"
                id="family-go"
              >
                <span className="relative z-10">{fam.members.length ? "Ver o passeio no trenó 🛷" : "Adicionar a primeira foto 📸"}</span>
              </button>
            </div>
          </div>
        ) : (
          <Ride fam={fam} say={say} />
        )}

        <AnimatePresence>
          {cropFile && <FaceCropper key="crop" file={cropFile} onDone={onCropped} onCancel={() => setCropFile(null)} />}
          {upsell && (
            <ProUpsell
              key="u"
              title="Cabe mais gente no trenó! 🛷"
              text={`No plano grátis vão ${FREE_MEMBERS} pessoas. Com o Natal Completo cabem até ${MAX_MEMBERS}: vovós, titios e padrinhos também!`}
              onClose={() => setUpsell(false)}
              onUpgrade={onUpgrade}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {toast && (
            <motion.div
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[130] bg-[#0B132B] text-white text-sm font-semibold px-5 py-3 rounded-full border border-[#FFD166]/60 shadow-2xl max-w-[92vw] text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function Ride({ fam, say }: { fam: FamilyState; say: (m: string) => void }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<SleighScene | null>(null);
  const [recording, setRecording] = useState(0);
  const canVideo = SleighScene.videoMime() !== null;

  useEffect(() => {
    const scene = new SleighScene(ref.current!);
    sceneRef.current = scene;
    scene.title = fam.title.trim() || (fam.members[0]?.name ? `Família de ${fam.members[0].name} no trenó 🎅` : "");
    scene.names = fam.members.map((m) => m.name);
    scene.onBells = () => musicBox.sleighBells(1.2, 0.1);
    loadFaceImages(fam.members).then((imgs) => (scene.faces = imgs));
    scene.start();
    musicBox.sleighBells(1.6, 0.1);
    const onR = () => scene.resize();
    window.addEventListener("resize", onR);
    return () => {
      scene.stop();
      window.removeEventListener("resize", onR);
    };
  }, [fam]);

  const fileBase = () => `familia-no-treno${fam.members[0]?.name ? "-" + fam.members[0].name.replace(/\s+/g, "-") : ""}`;

  const shareOrDownload = async (blob: Blob, name: string, text: string) => {
    const file = new File([blob], name, { type: blob.type });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Família no trenó do Papai Noel", text });
        return;
      } catch {
        return;
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    say("Arquivo salvo! Agora é só mandar no WhatsApp 📲");
  };

  const photo = async () => {
    const s = sceneRef.current;
    if (!s) return;
    musicBox.chime(88, undefined, 0.12);
    const blob = await s.snapshot();
    await shareOrDownload(blob, `${fileBase()}.png`, "Olha a nossa família no trenó do Papai Noel! 🎅🛷");
  };

  const video = async () => {
    const s = sceneRef.current;
    if (!s || recording) return;
    const secs = 9;
    setRecording(secs);
    const tick = setInterval(() => setRecording((r) => Math.max(1, r - 1)), 1000);
    const audio = musicBox.recordingStream() ?? undefined;
    // sininhos durante a gravação
    const bells = [300, 2500, 5200, 7600].map((ms) => setTimeout(() => s.tap(), ms));
    try {
      const { blob, ext } = await s.record(secs, audio);
      await shareOrDownload(blob, `${fileBase()}.${ext}`, "Nossa família voando no trenó do Papai Noel! 🎅🛷✨");
    } catch {
      say("Este navegador não grava vídeo. Use a foto mágica 📸");
    } finally {
      clearInterval(tick);
      bells.forEach(clearTimeout);
      setRecording(0);
    }
  };

  return (
    <div>
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl aspect-[4/5] sm:aspect-[16/9] max-h-[70vh] w-full mx-auto">
        <canvas
          ref={ref}
          className="absolute inset-0 w-full h-full cursor-pointer touch-manipulation"
          onClick={(e) => {
            const r = (e.target as HTMLElement).getBoundingClientRect();
            sceneRef.current?.tap(e.clientX - r.left, e.clientY - r.top);
          }}
          aria-label="Passeio da família no trenó. Toque para tocar os sininhos."
        />
        {recording > 0 && (
          <div className="absolute top-3 right-3 bg-[#EF233C] text-white text-xs font-bold rounded-full px-3 py-1.5 inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Gravando... {recording}s
          </div>
        )}
      </div>
      <p className="text-center text-xs text-white/60 mt-2">👆 Toque na tela para tocar os sininhos e jogar presentes!</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 max-w-2xl mx-auto">
        <button onClick={() => sceneRef.current?.tap()} className="rounded-full py-3 text-sm font-bold bg-white/10 text-white border border-white/15 inline-flex items-center justify-center gap-1.5 cursor-pointer">
          <Bell className="w-4 h-4 text-[#FFD166]" /> Sininhos
        </button>
        <button
          onClick={photo}
          className="rounded-full py-3 text-sm font-bold bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white border border-[#FFD166]/50 inline-flex items-center justify-center gap-1.5 cursor-pointer"
          id="family-photo"
        >
          {typeof navigator !== "undefined" && "share" in navigator ? <Share2 className="w-4 h-4" /> : <Download className="w-4 h-4" />} Foto mágica
        </button>
        {canVideo && (
          <button
            onClick={video}
            disabled={recording > 0}
            className="col-span-2 sm:col-span-1 rounded-full py-3 text-sm font-bold bg-white/10 text-white border border-white/15 inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            id="family-video"
          >
            <Film className="w-4 h-4 text-[#FFD166]" /> {recording ? "Gravando..." : "Vídeo de 9 segundos"}
          </button>
        )}
      </div>
    </div>
  );
}
