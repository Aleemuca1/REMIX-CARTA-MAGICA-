/** Papai Noel Ao Vivo: fala com o servidor e toca a voz. Nada do que a criança fala é guardado. */
import { pcmBase64ToWavBlob } from "./narration";
import { getAccessCode } from "../advent/access";

export type Kind = "ola" | "pergunta" | "resposta" | "conversa" | "historia" | "tchau";
type AudioPart = { audioUrl?: string; audioBase64?: string; mime?: string };
export type Reply = AudioPart & {
  text: string;
  paid?: boolean;
  parts?: AudioPart[];
  /** número da pergunta que o Papai Noel acabou de fazer (1 a 3) */
  ask?: number;
  callToken?: string;
  seconds?: number;
  /** já usou as chamadas do código */
  used?: boolean;
  final?: boolean;
  limit?: boolean;
  done?: boolean;
  sensitive?: boolean;
};
export type Answers = { idade: string; bom: string; pedido: string };
export class CallError extends Error {
  paywall = false;
}

// código da Ligação avulsa (R$ 5,90): fica separado do código do plano
const CALL_KEY = "carta-magica-ligacao";
const TOKEN_KEY = "cm-aovivo-token";
const ls = {
  get: (k: string, s: Storage | undefined = typeof localStorage !== "undefined" ? localStorage : undefined) => {
    try {
      return s?.getItem(k) || "";
    } catch {
      return "";
    }
  },
  set: (k: string, v: string, s: Storage | undefined = typeof localStorage !== "undefined" ? localStorage : undefined) => {
    try {
      if (v) s?.setItem(k, v);
      else s?.removeItem(k);
    } catch {
      /* ok */
    }
  },
};
export const saveCallCode = (code: string) => ls.set(CALL_KEY, code);
export const getCallCode = () => ls.get(CALL_KEY);
const sess = () => (typeof sessionStorage !== "undefined" ? sessionStorage : undefined);
export const saveCallToken = (t: string) => ls.set(TOKEN_KEY, t, sess());
export const getCallToken = () => ls.get(TOKEN_KEY, sess());

export async function callStatus(): Promise<{ ativo: boolean; chamadas: number; temCodigo: boolean; segundos: number; preco: number }> {
  try {
    const r = await fetch(`/api/aovivo/status?code=${encodeURIComponent(getAccessCode())}&call=${encodeURIComponent(getCallCode())}`);
    return await r.json();
  } catch {
    return { ativo: false, chamadas: 0, temCodigo: false, segundos: 120, preco: 5.9 };
  }
}

export async function talk(body: { kind: Kind; childName: string; said?: string; n?: number; story?: number; answers?: Partial<Answers>; history?: { from: "c" | "n"; text: string }[] }): Promise<Reply> {
  const r = await fetch("/api/aovivo/falar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, parentalConsent: true, accessCode: getAccessCode() || undefined, callCode: getCallCode() || undefined, callToken: getCallToken() || undefined }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = new CallError(d.error || "A ligação falhou. Tente de novo.");
    e.paywall = Boolean(d.paywall);
    throw e;
  }
  if (d.callToken) saveCallToken(d.callToken);
  return d as Reply;
}

const b64ToBlob = (b64: string, type: string) => {
  const bin = atob(b64);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return new Blob([u], { type });
};
const srcOf = (p: AudioPart): string | null => {
  if (p.audioUrl) return p.audioUrl;
  if (!p.audioBase64) return null;
  return URL.createObjectURL(p.mime === "audio/mpeg" ? b64ToBlob(p.audioBase64, "audio/mpeg") : pcmBase64ToWavBlob(p.audioBase64));
};

/** Toca a resposta (um ou mais trechos). Sem áudio do servidor, usa a voz do aparelho. */
export function playReply(el: HTMLAudioElement, reply: Reply, stopped: () => boolean): Promise<void> {
  const parts = (reply.parts?.length ? reply.parts : [reply]).map(srcOf).filter(Boolean) as string[];
  if (!parts.length) return speakLocal(reply.text, stopped);
  return parts.reduce<Promise<void>>(
    (chain, src) =>
      chain.then(
        () =>
          new Promise<void>((done) => {
            if (stopped()) return done();
            el.onended = () => done();
            el.onerror = () => done();
            el.src = src;
            el.play().catch(() => done());
          }),
      ),
    Promise.resolve(),
  );
}

function speakLocal(text: string, stopped: () => boolean): Promise<void> {
  return new Promise((done) => {
    try {
      if (!("speechSynthesis" in window) || !window.speechSynthesis || stopped()) return done();
      const s = window.speechSynthesis;
      s.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "pt-BR";
      const v = s.getVoices().find((x) => x.lang?.toLowerCase().startsWith("pt"));
      if (v) u.voice = v;
      u.pitch = 0.6;
      u.rate = 0.92;
      u.onend = () => done();
      u.onerror = () => done();
      s.speak(u);
      setTimeout(done, Math.min(60000, 2500 + text.length * 90));
    } catch {
      done();
    }
  });
}

/** "seis", "tenho 6 anos", "6" -> 6 (para preencher a carta depois) */
export function ageFrom(text: string): number | undefined {
  const m = text.match(/\d{1,2}/);
  if (m) {
    const n = Number(m[0]);
    return n >= 1 && n <= 14 ? n : undefined;
  }
  const words = ["um", "dois", "tres", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze"];
  const t = text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const i = words.findIndex((w) => new RegExp(`\\b${w}\\b`).test(t));
  return i >= 0 ? i + 1 : undefined;
}
