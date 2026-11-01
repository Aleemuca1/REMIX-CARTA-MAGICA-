import { emptyHouse, type HouseCfg, type HouseItem, type HouseState } from "./model";

const KEY = "carta-magica-casinha";

export function loadLocal(): HouseState {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (v && Array.isArray(v.items) && v.cfg) return v;
  } catch {
    /* sem armazenamento */
  }
  return emptyHouse();
}

export function saveLocal(h: HouseState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(h));
  } catch {
    /* sem armazenamento */
  }
}

type Remote = { cfg: HouseCfg; items: HouseItem[] };

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { headers: { "Content-Type": "application/json" }, ...init });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Não foi possível falar com o Polo Norte agora.");
  return d as T;
}
const owner = (editKey: string) => ({ "Content-Type": "application/json", "x-edit-key": editKey });

export const api = {
  create: (cfg: HouseCfg, items: HouseItem[]) =>
    call<{ token: string; editKey: string }>("/api/house", { method: "POST", body: JSON.stringify({ cfg, items }) }),
  get: (token: string) => call<Remote>(`/api/house/${encodeURIComponent(token)}`),
  add: (token: string, item: HouseItem) =>
    call<Remote>(`/api/house/${encodeURIComponent(token)}/items`, { method: "POST", body: JSON.stringify({ item }) }),
  /** só quem criou: salva a casa inteira (mover, aumentar, tirar, trocar modelo) */
  save: (token: string, editKey: string, cfg: HouseCfg, items: HouseItem[]) =>
    call<Remote>(`/api/house/${encodeURIComponent(token)}`, { method: "PUT", headers: owner(editKey), body: JSON.stringify({ cfg, items }) }),
};

export const shareUrl = (token: string) => `${window.location.origin}/casa/${token}`;
