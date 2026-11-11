/**
 * "Meus cartões": salvos só neste aparelho (IndexedDB). A foto original nunca vai para o servidor
 * nem fica pública; apagar o cartão apaga a foto junto.
 */
import type { CardTexts, Crop, Orientation, TemplateId } from "./types";

export type SavedCard = CardTexts & {
  id: string;
  template: TemplateId;
  orientation: Orientation;
  crop: Crop;
  photo: Blob | null; // arquivo original, sem alteração
  thumb: string; // miniatura JPEG pequena (data URL) para a lista
  updatedAt: number;
};

const DB = "carta-magica-cartoes",
  STORE = "cards";

function open(): Promise<IDBDatabase> {
  return new Promise((ok, err) => {
    if (typeof indexedDB === "undefined") return err(new Error("sem IndexedDB"));
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: "id" });
    r.onsuccess = () => ok(r.result);
    r.onerror = () => err(r.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((ok, err) => {
    const t = db.transaction(STORE, mode);
    const req = f(t.objectStore(STORE));
    t.oncomplete = () => (db.close(), ok(req.result));
    t.onerror = () => (db.close(), err(t.error));
  });
}

export const newCardId = () => `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export async function saveCard(c: SavedCard) {
  await tx("readwrite", (s) => s.put(c));
}
export async function listCards(): Promise<SavedCard[]> {
  try {
    const all = await tx<SavedCard[]>("readonly", (s) => s.getAll() as IDBRequest<SavedCard[]>);
    return all.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}
export async function getCard(id: string) {
  return tx<SavedCard | undefined>("readonly", (s) => s.get(id) as IDBRequest<SavedCard | undefined>);
}
export async function deleteCard(id: string) {
  await tx("readwrite", (s) => s.delete(id));
}
