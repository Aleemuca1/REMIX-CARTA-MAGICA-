import { useEffect, useState } from "react";

/**
 * Login do responsável (sem senha: código de 6 números no e-mail).
 * A criança nunca precisa entrar: o login só aparece para salvar a carta,
 * ver "Minhas cartas" e pagar. A sessão fica num cookie seguro (HttpOnly).
 */
export type Parent = { email: string; name?: string };
export type LoginReason = "salvar" | "pagar" | "area";

type State = {
  parent: Parent | null;
  ready: boolean;
  /** pedido de login aberto (o AuthHost mostra a janela) */
  pending: { reason: LoginReason; resolve: (p: Parent | null) => void } | null;
  areaOpen: boolean;
};

let state: State = { parent: null, ready: false, pending: null, areaOpen: false };
const listeners = new Set<() => void>();
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

export function useAuth() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return state;
}

let loading: Promise<Parent | null> | null = null;
export function loadMe(): Promise<Parent | null> {
  if (!loading) {
    loading = fetch("/api/auth/me", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : { parent: null }))
      .then((d) => {
        set({ parent: d.parent ?? null, ready: true });
        return d.parent ?? null;
      })
      .catch(() => {
        set({ ready: true });
        return null;
      });
  }
  return loading;
}

/** Garante um responsável logado. Abre a "porta dos pais" + login se precisar. Devolve null se desistirem. */
export async function requireParent(reason: LoginReason): Promise<Parent | null> {
  const p = state.parent ?? (await loadMe());
  if (p) return p;
  state.pending?.resolve(null);
  return new Promise((resolve) => set({ pending: { reason, resolve } }));
}

/** chamado pela janela de login quando termina (com sucesso ou não) */
export function finishLogin(parent: Parent | null) {
  const pending = state.pending;
  set({ pending: null, ...(parent ? { parent } : {}) });
  pending?.resolve(parent);
}

export async function openParentArea() {
  const p = await requireParent("area");
  if (p) set({ areaOpen: true });
}
export const closeParentArea = () => set({ areaOpen: false });

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
  loading = null;
  set({ parent: null, areaOpen: false });
}

async function post(url: string, body: unknown) {
  const r = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Algo deu errado. Tente de novo.");
  return data;
}

export const sendCode = (email: string) => post("/api/auth/start", { email }) as Promise<{ ok: true; devCode?: string }>;
export const verifyCode = (email: string, code: string, name?: string) =>
  post("/api/auth/verify", { email, code, name }) as Promise<{ ok: true; parent: Parent }>;
export const saveLetterToAccount = (letterId: string) =>
  post("/api/me/letters/save", { letterId }) as Promise<{ ok: true; emailed: boolean }>;

export type MyLetter = { token: string; childName: string; age: number; date: string; theme?: string; plan: string };
export async function myLetters(): Promise<MyLetter[]> {
  const r = await fetch("/api/me/letters", { credentials: "same-origin" });
  const data = await r.json().catch(() => []);
  if (!r.ok) throw new Error((data as any).error || "Não foi possível carregar suas cartas.");
  return data;
}
