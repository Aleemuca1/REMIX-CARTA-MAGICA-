import type { Ornament, TreeState } from "./model";

const KEY = "carta-magica-arvore";

export function loadLocal(): TreeState {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (v && Array.isArray(v.ornaments)) return v;
  } catch {
    /* sem armazenamento */
  }
  return { title: "", ornaments: [] };
}

export function saveLocal(t: TreeState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(t));
  } catch {
    /* sem armazenamento */
  }
}

type Remote = { title: string; ornaments: Ornament[] };

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { headers: { "Content-Type": "application/json" }, ...init });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Não foi possível falar com o Polo Norte agora.");
  return d as T;
}

export const api = {
  create: (title: string, ornaments: Ornament[]) =>
    call<{ token: string; editKey: string }>("/api/tree", { method: "POST", body: JSON.stringify({ title, ornaments }) }),
  get: (token: string) => call<Remote>(`/api/tree/${encodeURIComponent(token)}`),
  add: (token: string, ornament: Ornament) =>
    call<Remote>(`/api/tree/${encodeURIComponent(token)}/ornaments`, { method: "POST", body: JSON.stringify({ ornament }) }),
  remove: (token: string, id: string, editKey: string) =>
    call<Remote>(`/api/tree/${encodeURIComponent(token)}/ornaments/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-edit-key": editKey },
    }),
  rename: (token: string, title: string, editKey: string) =>
    call<Remote>(`/api/tree/${encodeURIComponent(token)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-edit-key": editKey },
      body: JSON.stringify({ title }),
    }),
};

export const shareUrl = (token: string) => `${window.location.origin}/arvore/${token}`;
