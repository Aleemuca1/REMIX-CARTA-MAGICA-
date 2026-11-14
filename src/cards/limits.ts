/**
 * Quantos cartões de Natal cada plano pode criar (contados neste aparelho, em "Meus cartões"):
 * grátis 1 · Carta Completa 5 · Pacote Família sem limite.
 */
import { getAccessCode, hasFullAccess, isTestMode } from "../advent/access";

export type CardPlan = "free" | "natal" | "familia";
export const CARD_LIMIT: Record<CardPlan, number> = { free: 1, natal: 5, familia: Infinity };
export const CARD_PLAN_LABEL: Record<CardPlan, string> = { free: "Grátis", natal: "Carta Completa", familia: "Pacote Família" };

const KEY = "carta-magica-plano";
const read = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};
const write = (v: string) => {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* ok */
  }
};

/** Guarda o plano comprado (chamado depois do pagamento ou ao entrar no painel). */
export const rememberPlan = (plan: string) => write(plan === "familia" ? "familia" : "natal");

export async function cardPlan(): Promise<CardPlan> {
  if (isTestMode()) return "familia";
  if (!hasFullAccess()) return "free";
  const cached = read();
  if (cached === "familia") return "familia";
  const code = getAccessCode();
  if (code) {
    try {
      const r = await fetch(`/api/access/status/${encodeURIComponent(code)}`);
      if (r.ok) {
        const d = await r.json();
        if (d.plan) rememberPlan(d.plan);
        return d.plan === "familia" ? "familia" : "natal";
      }
    } catch {
      /* sem rede: usa o que sabemos */
    }
  }
  return "natal";
}
