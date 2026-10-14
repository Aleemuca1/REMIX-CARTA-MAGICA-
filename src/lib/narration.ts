/**
 * Narração da carta com a voz do Papai Noel.
 * 1) Tenta o áudio do servidor (Gemini TTS, PCM 24 kHz) e converte em WAV.
 * 2) Se não houver, usa a voz do próprio navegador (speechSynthesis), grave e lenta.
 */
import { VOICES, type Voice } from "./voices";

function pcmBase64ToWavUrl(b64: string, sampleRate = 24000) {
  const bin = atob(b64);
  const pcm = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) pcm[i] = bin.charCodeAt(i);
  const header = new ArrayBuffer(44);
  const v = new DataView(header);
  const w = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF");
  v.setUint32(4, 36 + pcm.length, true);
  w(8, "WAVE");
  w(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  w(36, "data");
  v.setUint32(40, pcm.length, true);
  return URL.createObjectURL(new Blob([header, pcm], { type: "audio/wav" }));
}

export type Narrator = { stop: () => void };

type Source = { token: string } | { adventDay: number; name: string } | { treeToken: string; ornamentId: string };
type Opts = {
  voice?: Voice;
  /** progresso da leitura, de 0 a 1 (para destacar o trecho que está sendo lido) */
  onProgress?: (frac: number) => void;
};

function pickBrowserVoice(v: Voice) {
  const voices = window.speechSynthesis.getVoices();
  const pt = voices.filter((x) => x.lang?.toLowerCase().startsWith("pt"));
  const br = pt.filter((x) => /br/i.test(x.lang));
  const pool = br.length ? br : pt;
  const female = /luciana|francisca|maria|vit[oó]ria|camila|female|feminin|google português do brasil/i;
  const male = /daniel|ricardo|ant[oô]nio|felipe|male|masculin/i;
  return (v.female ? pool.find((x) => female.test(x.name)) : pool.find((x) => male.test(x.name))) || pool[0] || null;
}

export async function narrate(
  text: string,
  childName: string,
  onEnd: () => void,
  source?: Source,
  opts: Opts = {},
): Promise<Narrator> {
  const voice = opts.voice ?? VOICES[0];
  // 1) voz do servidor (Gemini)
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...(source ?? {}), voiceId: voice.id }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        const url = pcmBase64ToWavUrl(data.audioBase64);
        const audio = new Audio(url);
        let raf = 0;
        const tick = () => {
          if (audio.duration > 0) opts.onProgress?.(audio.currentTime / audio.duration);
          raf = requestAnimationFrame(tick);
        };
        const finish = () => {
          cancelAnimationFrame(raf);
          URL.revokeObjectURL(url);
          onEnd();
        };
        audio.onended = finish;
        await audio.play();
        raf = requestAnimationFrame(tick);
        return {
          stop: () => {
            audio.pause();
            finish();
          },
        };
      }
    }
  } catch {
    /* segue para a voz do navegador */
  }

  // 2) voz do navegador: lê parágrafo por parágrafo, com pausas
  if (!("speechSynthesis" in window)) {
    onEnd();
    return { stop: () => {} };
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const parts = text
    .replace(/🎅|✨|🎄|🎁|❤️|⭐/g, "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const total = parts.reduce((a, p) => a + p.length, 0) || 1;
  const bv = pickBrowserVoice(voice);
  let stopped = false;
  let done = 0;
  const speakPart = (i: number) => {
    if (stopped) return;
    if (i >= parts.length) {
      opts.onProgress?.(1);
      onEnd();
      return;
    }
    const u = new SpeechSynthesisUtterance(parts[i]);
    u.lang = "pt-BR";
    u.voice = bv;
    u.pitch = voice.pitch;
    u.rate = voice.rate;
    u.onstart = () => opts.onProgress?.(done / total + 0.0001);
    u.onend = () => {
      done += parts[i].length;
      opts.onProgress?.(done / total);
      setTimeout(() => speakPart(i + 1), 450); // pausa entre parágrafos
    };
    u.onerror = () => {
      if (!stopped) onEnd();
    };
    synth.speak(u);
  };
  speakPart(0);
  return {
    stop: () => {
      stopped = true;
      synth.cancel();
      onEnd();
    },
  };
}
