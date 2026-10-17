import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, Link2, Download, Send, Check, Loader2 } from "lucide-react";
import type { Letter } from "../../types";
import { useBackClose } from "../../lib/backClose";
import { fetchNarrationAudio } from "../../lib/narration";
import type { Voice } from "../../lib/voices";
import {
  canShareFiles,
  canvasToBlob,
  copyText,
  downloadBlob,
  facebookUrl,
  safeName,
  shareOrDownload,
  telegramUrl,
  whatsappUrl,
  xUrl,
} from "../../lib/shareKit";
import { letterParagraphs, letterPdf, letterUrl, recordLetterVideo, renderLetterPage, renderPost, renderStory, videoMime } from "../../lib/letterExport";
import ProUpsell from "../ProUpsell";

type Kind = "story" | "post" | "pdf" | "png" | "jpg" | "video" | "audio" | "txt";

/**
 * Central de compartilhamento da carta: WhatsApp, redes sociais e download em vários formatos.
 * Story e post são grátis (levam a marca do site); os formatos completos são do Natal Completo.
 */
export default function ShareSheet({
  letter,
  isPro,
  voice,
  onClose,
  onUpgrade,
}: {
  letter: Letter;
  isPro: boolean;
  voice: Voice;
  onClose: () => void;
  onUpgrade?: () => void;
}) {
  useBackClose(true, onClose);
  const [preview, setPreview] = useState<{ story?: string; post?: string }>({});
  const [tab, setTab] = useState<"story" | "post">("story");
  const [busy, setBusy] = useState<Kind | null>(null);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [locked, setLocked] = useState<string | null>(null);
  const audioCache = useRef<Map<string, Blob | null>>(new Map());
  const blobs = useRef<{ story?: Blob; post?: Blob }>({});
  const url = letterUrl(letter);
  const base = `Carta-do-Papai-Noel-${safeName(letter.childName)}`;
  const msg = `🎅✨ Olha que lindo! O Papai Noel escreveu uma carta para ${letter.childName}! Abra e ouça a voz dele: ${url}`;
  const canRecord = !!videoMime();

  const say = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(null), 3200);
  };

  // gera as imagens de prévia ao abrir
  useEffect(() => {
    let alive = true;
    const urls: string[] = [];
    (async () => {
      for (const k of ["story", "post"] as const) {
        const c = k === "story" ? await renderStory(letter) : await renderPost(letter);
        const b = await canvasToBlob(c, "image/jpeg", 0.9);
        if (!alive) return;
        blobs.current[k] = b;
        const u = URL.createObjectURL(b);
        urls.push(u);
        setPreview((p) => ({ ...p, [k]: u }));
      }
    })().catch(() => {});
    return () => {
      alive = false;
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [letter]);

  const getImage = async (k: "story" | "post") => {
    if (blobs.current[k]) return blobs.current[k]!;
    const c = k === "story" ? await renderStory(letter) : await renderPost(letter);
    const b = await canvasToBlob(c, "image/jpeg", 0.9);
    blobs.current[k] = b;
    return b;
  };

  const getAudio = async () => {
    if (audioCache.current.has(voice.id)) return audioCache.current.get(voice.id)!;
    const a = await fetchNarrationAudio({ token: letter.token }, voice);
    audioCache.current.set(voice.id, a);
    return a;
  };

  const run = async (k: Kind, pro: boolean, fn: () => Promise<void>) => {
    if (pro && !isPro) {
      setLocked(k);
      return;
    }
    if (busy) return;
    setBusy(k);
    setProgress(0);
    try {
      await fn();
    } catch {
      say("Não deu certo agora. Tente de novo em instantes.");
    } finally {
      setBusy(null);
    }
  };

  const sendImage = (k: "story" | "post") =>
    run(k, false, async () => {
      const b = await getImage(k);
      const r = await shareOrDownload(b, `${base}-${k === "story" ? "stories" : "post"}.jpg`, msg, "Carta do Papai Noel");
      if (r === "downloaded") say("Imagem salva! Agora é só postar no WhatsApp, Instagram ou Facebook. 📲");
    });

  const items: { k: Kind; emoji: string; title: string; sub: string; pro: boolean; act: () => void; hide?: boolean }[] = [
    { k: "story", emoji: "📱", title: "Status / Stories", sub: "Imagem 9:16", pro: false, act: () => sendImage("story") },
    { k: "post", emoji: "🟥", title: "Post do feed", sub: "Imagem 1:1", pro: false, act: () => sendImage("post") },
    {
      k: "pdf",
      emoji: "📄",
      title: "PDF para imprimir",
      sub: "A4 com QR da voz",
      pro: true,
      act: () =>
        run("pdf", true, async () => {
          downloadBlob(await letterPdf(letter), `${base}.pdf`);
          say("PDF baixado! Imprima e entregue com um envelope. 🎄");
        }),
    },
    {
      k: "png",
      emoji: "🖼️",
      title: "Imagem HD",
      sub: "PNG da carta inteira",
      pro: true,
      act: () =>
        run("png", true, async () => {
          downloadBlob(await canvasToBlob(await renderLetterPage(letter), "image/png"), `${base}.png`);
          say("Imagem HD baixada! ✨");
        }),
    },
    {
      k: "jpg",
      emoji: "📸",
      title: "Foto (JPG)",
      sub: "Leve, ótima p/ WhatsApp",
      pro: true,
      act: () =>
        run("jpg", true, async () => {
          const b = await canvasToBlob(await renderLetterPage(letter), "image/jpeg", 0.88);
          const r = await shareOrDownload(b, `${base}.jpg`, msg, "Carta do Papai Noel");
          if (r === "downloaded") say("Foto da carta baixada! 📸");
        }),
    },
    {
      k: "video",
      emoji: "🎬",
      title: "Vídeo com a voz",
      sub: canRecord ? "Reels, Status, TikTok" : "Indisponível neste navegador",
      pro: true,
      hide: false,
      act: () =>
        run("video", true, async () => {
          if (!canRecord) {
            say("Este navegador não grava vídeo. Tente pelo Chrome ou pelo celular.");
            return;
          }
          const a = await getAudio();
          const { blob, ext } = await recordLetterVideo(letter, a, setProgress);
          const r = await shareOrDownload(blob, `${base}.${ext}`, msg, "Carta do Papai Noel");
          if (r === "downloaded") say(a ? "Vídeo baixado com a voz do Papai Noel! 🎬" : "Vídeo baixado! 🎬");
        }),
    },
    {
      k: "audio",
      emoji: "🎧",
      title: "Áudio da voz",
      sub: `Lida por ${voice.label}`,
      pro: true,
      act: () =>
        run("audio", true, async () => {
          const a = await getAudio();
          if (!a) {
            say("A voz em áudio ainda não está disponível. Tente o vídeo ou ouça pela carta.");
            return;
          }
          const r = await shareOrDownload(a, `${base}-voz.wav`, msg, "Voz do Papai Noel");
          if (r === "downloaded") say("Áudio baixado! Mande no WhatsApp para os avós. 🎧");
        }),
    },
    {
      k: "txt",
      emoji: "📝",
      title: "Texto da carta",
      sub: "Arquivo .txt",
      pro: true,
      act: () =>
        run("txt", true, async () => {
          const body = `CARTA DO PAPAI NOEL PARA ${letter.childName.toUpperCase()}\n${letter.date || ""}\n\n${letterParagraphs(letter).join("\n\n")}\n\nCom carinho,\nPapai Noel\n\nOuça a voz: ${url}\n`;
          downloadBlob(new Blob([body], { type: "text/plain;charset=utf-8" }), `${base}.txt`);
          say("Texto baixado! 📝");
        }),
    },
  ];

  const nativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <motion.div
      className="fixed inset-0 z-[90] bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && !busy && onClose()}
      data-no-pdf
    >
      <motion.div
        className="w-full sm:max-w-2xl max-h-[94vh] overflow-y-auto bg-gradient-to-b from-[#1C2541] to-[#0B132B] border-2 border-[#FFD166] rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-2xl"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        role="dialog"
        aria-label="Compartilhar e baixar a carta"
        id="share-sheet"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-cinzel text-lg sm:text-xl font-bold">Compartilhe a magia ✨</h3>
            <p className="text-xs text-white/65">Envie para a família, poste nas redes ou baixe no formato que quiser.</p>
          </div>
          <button onClick={onClose} disabled={!!busy} className="p-2 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer disabled:opacity-40" aria-label="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-[200px_1fr] gap-4">
          {/* prévia */}
          <div className="flex flex-col items-center">
            <div className="flex gap-1 mb-2 bg-white/10 rounded-full p-1 text-[11px] font-bold">
              {(["story", "post"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`px-3 py-1 rounded-full cursor-pointer ${tab === k ? "bg-[#FFD166] text-[#0B132B]" : "text-white/75"}`}
                >
                  {k === "story" ? "Stories 9:16" : "Post 1:1"}
                </button>
              ))}
            </div>
            <div
              className={`relative w-full ${tab === "story" ? "max-w-[150px] sm:max-w-[190px] aspect-[9/16]" : "max-w-[200px] aspect-square"} rounded-2xl overflow-hidden border border-white/20 bg-white/5`}
            >
              {preview[tab] ? (
                <img src={preview[tab]} alt="Prévia da imagem para compartilhar" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FFD166]" />
                </div>
              )}
            </div>
            <button
              onClick={() => sendImage(tab)}
              disabled={!!busy || !preview[tab]}
              className="mt-2 w-full max-w-[200px] rounded-full py-2 text-xs font-bold bg-white/10 hover:bg-white/20 inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              id="share-send-image"
            >
              {canShareFiles([new File([], "a.jpg", { type: "image/jpeg" })]) ? <Send className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              {canShareFiles([new File([], "a.jpg", { type: "image/jpeg" })]) ? "Enviar esta imagem" : "Baixar esta imagem"}
            </button>
          </div>

          <div>
            {/* enviar */}
            <a
              href={whatsappUrl(msg)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-2xl py-3.5 px-4 font-extrabold text-sm sm:text-base bg-[#25D366] hover:bg-[#1EBE5A] text-[#06371B] inline-flex items-center justify-center gap-2 shadow-lg"
              id="share-whatsapp"
            >
              <WhatsIcon /> Enviar no WhatsApp
            </a>
            <div className="grid grid-cols-4 gap-2 mt-2">
              <SocialBtn label="Instagram" onClick={() => sendImage("story")} bg="bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]">
                IG
              </SocialBtn>
              <SocialBtn label="Facebook" href={facebookUrl(url)} bg="bg-[#1877F2]">
                f
              </SocialBtn>
              <SocialBtn label="Telegram" href={telegramUrl(url, msg.replace(` ${url}`, ""))} bg="bg-[#229ED9]">
                ✈
              </SocialBtn>
              <SocialBtn label="X" href={xUrl(url, `O Papai Noel escreveu para ${letter.childName}! 🎅`)} bg="bg-black">
                𝕏
              </SocialBtn>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={async () => say((await copyText(url)) ? "Link copiado! Cole onde quiser. 🔗" : url)}
                className="flex-1 rounded-full py-2.5 text-xs font-bold bg-white/10 hover:bg-white/20 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                id="share-copy"
              >
                <Link2 className="w-3.5 h-3.5" /> Copiar link
              </button>
              {nativeShare && (
                <button
                  onClick={() => navigator.share({ title: "Carta do Papai Noel", text: msg.replace(` ${url}`, ""), url }).catch(() => {})}
                  className="flex-1 rounded-full py-2.5 text-xs font-bold bg-white/10 hover:bg-white/20 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Mais apps
                </button>
              )}
            </div>

            {/* baixar */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#FFD166] mt-4 mb-2">Baixar em todos os formatos</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {items
                .filter((i) => !i.hide)
                .map((i) => {
                  const lockedItem = i.pro && !isPro;
                  const isBusy = busy === i.k;
                  return (
                    <button
                      key={i.k}
                      onClick={i.act}
                      disabled={!!busy && !isBusy}
                      className={`relative text-left rounded-2xl p-2.5 border transition-colors cursor-pointer disabled:opacity-40 ${
                        lockedItem ? "border-white/10 bg-white/5" : "border-white/20 bg-white/10 hover:bg-white/15 hover:border-[#FFD166]/70"
                      }`}
                      id={`share-${i.k}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl leading-none">{i.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-tight">{i.title}</p>
                          <p className="text-[10px] text-white/55 leading-tight line-clamp-2">{isBusy ? busyText(i.k, progress) : i.sub}</p>
                        </div>
                      </div>
                      {lockedItem && <Lock className="absolute top-2 right-2 w-3 h-3 text-[#FFD166]" />}
                      {isBusy && (
                        <span className="absolute left-2 right-2 bottom-1 h-1 rounded-full bg-white/10 overflow-hidden">
                          <span
                            className={`block h-full bg-[#FFD166] ${i.k === "video" ? "" : "animate-pulse w-full"}`}
                            style={i.k === "video" ? { width: `${Math.round(progress * 100)}%` } : undefined}
                          />
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
            {!isPro && (
              <p className="text-[11px] text-white/60 mt-2">
                🔒 PDF, imagem HD, vídeo e áudio com a voz fazem parte do{" "}
                <button onClick={() => setLocked("pdf")} className="text-[#FFD166] font-bold underline cursor-pointer">
                  Natal Completo
                </button>
                .
              </p>
            )}
            {busy === "video" && (
              <p className="text-[11px] text-[#FFD166] mt-2">🎬 Gravando o vídeo no tempo da leitura... deixe esta tela aberta.</p>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[130] bg-[#0B132B] text-white text-sm font-semibold px-5 py-3 rounded-full border border-[#FFD166]/60 shadow-2xl flex items-center gap-2 max-w-[90vw] break-words"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            role="status"
          >
            <Check className="w-4 h-4 text-[#2DC653] shrink-0" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {locked && (
          <ProUpsell
            title="Todos os formatos no Natal Completo"
            text="Baixe a carta em PDF com QR code da voz, imagem HD, vídeo com o Papai Noel lendo para postar nos Stories e áudio para mandar aos avós."
            onUpgrade={
              onUpgrade
                ? () => {
                    setLocked(null);
                    onUpgrade();
                  }
                : undefined
            }
            onClose={() => setLocked(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function busyText(k: Kind, p: number) {
  if (k === "video") return p > 0 ? `Gravando... ${Math.round(p * 100)}%` : "Preparando a voz...";
  if (k === "audio") return "Preparando a voz...";
  return "Gerando...";
}

function SocialBtn({ label, href, onClick, bg, children }: { label: string; href?: string; onClick?: () => void; bg: string; children: ReactNode }) {
  const cls = `rounded-2xl py-2 flex flex-col items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer`;
  const inner = (
    <>
      <span className={`w-9 h-9 rounded-full ${bg} text-white font-extrabold text-sm flex items-center justify-center`}>{children}</span>
      <span className="text-[10px] text-white/75">{label}</span>
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={`Compartilhar no ${label}`}>
      {inner}
    </a>
  ) : (
    <button onClick={onClick} className={cls} aria-label={`Compartilhar no ${label}`}>
      {inner}
    </button>
  );
}

export function WhatsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.01c0-5.2 4.23-9.43 9.44-9.43a9.37 9.37 0 0 1 6.67 2.77 9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.3 11.3 0 0 0 12.05.7C5.79.7.7 5.79.7 12.05c0 2 .52 3.95 1.52 5.67L.6 23.6l6.02-1.58a11.3 11.3 0 0 0 5.42 1.38h.01c6.26 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.32-8.02" />
    </svg>
  );
}
