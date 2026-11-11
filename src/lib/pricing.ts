/**
 * Preços da Carta Mágica: ÚNICO lugar para mudar valores (o site mostra e o Asaas cobra daqui).
 * Black Friday: em novembro cobra o preço promocional; a partir de 01/12 (horário de Brasília) volta sozinho ao normal.
 */
export const PROMO = {
  name: "Black Friday",
  /** acaba em 30/11 às 23:59:59 (horário de Brasília = 01/12 02:59:59 UTC) */
  until: "2026-12-01T02:59:59.000Z",
};

export type PricedPlan = "natal" | "familia" | "pro";

/** preço normal (dezembro em diante) */
export const NORMAL: Record<PricedPlan, number> = { natal: 14.9, familia: 25.9, pro: 6.9 };
/** preço da Black Friday (novembro) */
export const PROMO_PRICE: Record<"natal" | "familia", number> = { natal: 11.9, familia: 19.9 };
/** Resposta Mágica avulsa (uma cartinha do Correio): de R$ 6,90 por R$ 4,90 */
export const AVULSA = 4.9;

export const promoActive = (now = Date.now()) => now < Date.parse(PROMO.until);

/** quanto o Asaas cobra agora por cada plano */
export function planPrice(plan: PricedPlan | "upgrade", now = Date.now()): number {
  if (plan === "pro") return AVULSA;
  const on = promoActive(now);
  const p = (k: "natal" | "familia") => (on ? PROMO_PRICE[k] : NORMAL[k]);
  // troca Carta Completa -> Pacote Família: paga só a diferença
  if (plan === "upgrade") return Math.round((p("familia") - p("natal")) * 100) / 100;
  return p(plan);
}

/** preço "de" (riscado) quando há desconto, senão null */
export function planFrom(plan: PricedPlan, now = Date.now()): number | null {
  if (plan === "pro") return NORMAL.pro;
  return promoActive(now) ? NORMAL[plan] : null;
}
export const planOff = (plan: PricedPlan, now = Date.now()) => {
  const f = planFrom(plan, now);
  return f ? `${Math.round((1 - planPrice(plan, now) / f) * 100)}%` : "";
};

export const brl = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
export const priceLabel = (plan: PricedPlan | "upgrade") => brl(planPrice(plan));
export const fromLabel = (plan: PricedPlan) => {
  const f = planFrom(plan);
  return f ? brl(f) : "";
};
