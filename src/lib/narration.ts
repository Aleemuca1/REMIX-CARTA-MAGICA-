/**
 * Narração da carta com a voz do Papai Noel.
 * 1) Tenta o áudio do servidor (Gemini TTS, PCM 24 kHz) e converte em WAV.
 * 2) Se não houver, usa a voz do próprio navegador (speechSynthesis), grave e lenta.
 */

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

export async function narrate(text: string, childName: string, onEnd: () => void): Promise<Narrator> {
  // 1) voz do servidor
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, childName }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        const url = pcmBase64ToWavUrl(data.audioBase64);
        const audio = new Audio(url);
        audio.onended = () => {
          URL.revokeObjectURL(url);
          onEnd();
        };
        await audio.play();
        return {
          stop: () => {
            audio.pause();
            URL.revokeObjectURL(url);
            onEnd();
          },
        };
      }
    }
  } catch {
    /* segue para a voz do navegador */
  }

  // 2) voz do navegador
  if (!("speechSynthesis" in window)) {
    onEnd();
    return { stop: () => {} };
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const voices = synth.getVoices();
  const ptVoices = voices.filter((v) => v.lang?.toLowerCase().startsWith("pt"));
  const male = ptVoices.find((v) => /daniel|ricardo|antonio|felipe|male|masculin/i.test(v.name));
  const utter = new SpeechSynthesisUtterance(text.replace(/🎅|✨|🎄|🎁/g, ""));
  utter.lang = "pt-BR";
  utter.voice = male || ptVoices[0] || null;
  utter.pitch = 0.6;
  utter.rate = 0.88;
  utter.onend = onEnd;
  utter.onerror = onEnd;
  synth.speak(utter);
  return {
    stop: () => {
      synth.cancel();
      onEnd();
    },
  };
}
