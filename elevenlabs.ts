// ElevenLabs: voz do Papai Noel (pronúncia certinha em português) e Música de Natal cantada.
// A chave fica SÓ na Vercel: ELEVENLABS_API_KEY. Sem ela, o site volta para a voz do Google.
const API = process.env.ELEVENLABS_API_BASE || "https://api.elevenlabs.io/v1";

export const elevenEnabled = () => Boolean(process.env.ELEVENLABS_API_KEY);

/** Vozes da biblioteca da ElevenLabs (português do Brasil). Cada uma pode ser trocada por variável na Vercel. */
const VOICE_IDS: Record<string, { env: string; id: string; stability: number; style: number }> = {
  noel: { env: "ELEVENLABS_VOICE_NOEL", id: "mBxe7tYxRAMLpIP3fPEp", stability: 0.5, style: 0.35 }, // "Papai Noel" (bom velhinho, levemente rouco)
  "noel-alegre": { env: "ELEVENLABS_VOICE_NOEL", id: "mBxe7tYxRAMLpIP3fPEp", stability: 0.32, style: 0.7 },
  mamae: { env: "ELEVENLABS_VOICE_MAMAE", id: "lWq4KDY8znfkV0DrK8Vb", stability: 0.5, style: 0.3 }, // Yasmin (doce, para crianças)
  duende: { env: "ELEVENLABS_VOICE_DUENDE", id: "mQTtm28IjDcoO2sbXmov", stability: 0.3, style: 0.75 }, // Filipe (expressivo)
  contador: { env: "ELEVENLABS_VOICE_CONTADOR", id: "96bMRo5cMbvHHsds2Wr0", stability: 0.55, style: 0.3 }, // Narrador Lopes
  anjo: { env: "ELEVENLABS_VOICE_ANJO", id: "e06XicPETIbfUaeHM9zH", stability: 0.5, style: 0.35 }, // Fabi
};
// voz pronta que existe em toda conta (reserva, se a voz da biblioteca não estiver liberada)
const BACKUP_VOICE = "JBFqnCBsd6RMkjVDRZzb";

async function call(path: string, body: unknown, accept = "audio/mpeg", timeoutMs = 60000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: { "xi-api-key": String(process.env.ELEVENLABS_API_KEY), "Content-Type": "application/json", Accept: accept },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      const err: any = new Error(`ElevenLabs ${res.status}: ${txt.slice(0, 300)}`);
      err.status = res.status;
      err.body = txt;
      throw err;
    }
    return Buffer.from(await res.arrayBuffer());
  } finally {
    clearTimeout(t);
  }
}

/** Texto -> MP3 com a voz escolhida (modelo multilíngue, o de melhor pronúncia). */
export async function speak(text: string, voiceKey: string, opts: { cheap?: boolean } = {}): Promise<Buffer> {
  const v = VOICE_IDS[voiceKey] ?? VOICE_IDS.noel;
  const voiceId = process.env[v.env] || v.id;
  const body = {
    text,
    // prévia das cartas grátis: modelo Flash (metade do preço); cartas pagas: o de melhor pronúncia
    model_id: opts.cheap ? process.env.ELEVENLABS_TTS_MODEL_GRATIS || "eleven_flash_v2_5" : process.env.ELEVENLABS_TTS_MODEL || "eleven_multilingual_v2",
    voice_settings: { stability: v.stability, similarity_boost: 0.8, style: v.style, use_speaker_boost: true, speed: 0.92 },
  };
  try {
    return await call(`/text-to-speech/${voiceId}?output_format=mp3_44100_128`, body);
  } catch (e: any) {
    // voz da biblioteca ainda não adicionada na conta: usa a voz reserva para não deixar a criança sem áudio
    if (e?.status === 404 || e?.status === 400 || /voice/i.test(String(e?.body || ""))) {
      console.warn("Voz ElevenLabs indisponível, usando a reserva:", e?.message);
      return call(`/text-to-speech/${BACKUP_VOICE}?output_format=mp3_44100_128`, body);
    }
    throw e;
  }
}

export type SongSection = { name: string; lines: string[] };
export type SongPlan = { title: string; sections: SongSection[]; style: string };

const STYLES: Record<string, string[]> = {
  alegre: ["upbeat christmas pop", "jingle bells", "sleigh bells", "children's choir backing", "joyful", "brazilian portuguese vocals"],
  ninar: ["gentle christmas lullaby", "music box", "soft piano", "warm female vocals", "calm", "brazilian portuguese vocals"],
  classica: ["classic orchestral christmas carol", "strings", "glockenspiel", "warm male vocals", "magical", "brazilian portuguese vocals"],
  festa: ["festive brazilian christmas samba-pop", "light percussion", "sleigh bells", "happy family sing-along", "brazilian portuguese vocals"],
};
export const SONG_STYLES = Object.keys(STYLES);

/** Compõe e canta a música (cerca de 1 minuto). Devolve o MP3. */
export async function compose(plan: SongPlan): Promise<Buffer> {
  const styles = STYLES[plan.style] ?? STYLES.alegre;
  const dur: Record<string, number> = { intro: 6000, verso: 16000, refrao: 14000, ponte: 10000, final: 8000 };
  const sections = plan.sections.slice(0, 7).map((s) => {
    const key = s.name.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");
    const base = key.startsWith("ref") ? "refrao" : key.startsWith("pon") ? "ponte" : key.startsWith("fin") ? "final" : key.startsWith("int") ? "intro" : "verso";
    return {
      section_name: s.name.slice(0, 60) || "Verso",
      positive_local_styles: base === "refrao" ? ["catchy chorus", "everyone sings along"] : base === "intro" ? ["instrumental intro", "sleigh bells"] : [],
      negative_local_styles: [],
      duration_ms: dur[base],
      lines: s.lines.map((l) => l.slice(0, 180)).slice(0, 8),
    };
  });
  const body = {
    model_id: "music_v1",
    composition_plan: {
      positive_global_styles: styles,
      negative_global_styles: ["explicit", "sad", "dark", "heavy metal", "english lyrics"],
      sections,
    },
    respect_sections_durations: true,
  };
  return call("/music?output_format=mp3_44100_128", body, "audio/mpeg", 240000);
}
