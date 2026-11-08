// Guarda os áudios gerados (voz e músicas) no Supabase Storage, num bucket PRIVADO.
// Assim a mesma carta não é narrada (e paga) duas vezes, e a música fica salva para sempre.
// Sem Supabase (desenvolvimento), guarda em memória.
import { supabaseClient } from "./db.js";

const BUCKET = "carta-magica-audio";
const mem = new Map<string, Buffer>();
let bucketReady: Promise<boolean> | null = null;

function ensureBucket(): Promise<boolean> {
  const sb = supabaseClient();
  if (!sb) return Promise.resolve(false);
  if (!bucketReady) {
    bucketReady = (async () => {
      const { error } = await sb.storage.getBucket(BUCKET);
      if (!error) return true;
      const { error: e2 } = await sb.storage.createBucket(BUCKET, { public: false, fileSizeLimit: 15 * 1024 * 1024 });
      if (e2 && !/exist/i.test(e2.message)) {
        console.warn("Não deu para criar o bucket de áudios:", e2.message);
        bucketReady = null;
        return false;
      }
      return true;
    })();
  }
  return bucketReady;
}

export async function put(path: string, data: Buffer, contentType: string): Promise<boolean> {
  if (!(await ensureBucket())) {
    if (!supabaseClient()) {
      mem.set(path, data);
      return true;
    }
    return false;
  }
  const { error } = await supabaseClient()!.storage.from(BUCKET).upload(path, data, { contentType, upsert: true });
  if (error) console.warn("Falha ao guardar áudio:", error.message);
  return !error;
}

export async function get(path: string): Promise<Buffer | null> {
  if (!supabaseClient()) return mem.get(path) ?? null;
  if (!(await ensureBucket())) return null;
  const { data, error } = await supabaseClient()!.storage.from(BUCKET).download(path);
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}

/** Endereço temporário (1 dia) para o navegador tocar o áudio direto do Storage. */
export async function url(path: string): Promise<string | null> {
  if (!supabaseClient()) return mem.has(path) ? `/api/audio-dev/${encodeURIComponent(path)}` : null;
  if (!(await ensureBucket())) return null;
  const { data, error } = await supabaseClient()!.storage.from(BUCKET).createSignedUrl(path, 24 * 60 * 60);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function list(prefix: string): Promise<string[]> {
  if (!supabaseClient()) return [...mem.keys()].filter((k) => k.startsWith(prefix + "/")).map((k) => k.slice(prefix.length + 1));
  if (!(await ensureBucket())) return [];
  const { data, error } = await supabaseClient()!.storage.from(BUCKET).list(prefix, { limit: 100 });
  if (error || !data) return [];
  return data.map((f) => f.name);
}

export const devGet = (path: string) => mem.get(path) ?? null;
