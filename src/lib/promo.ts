/**
 * Promoção Black Friday. Para mudar a data ou os preços "de", edite só aqui.
 * Os preços cobrados ficam em asaas.ts (hoje R$ 14,90 e R$ 25,90); aqui é só o que aparece riscado.
 */
export const PROMO = {
  name: "Black Friday",
  /** acaba em 30/11 às 23:59 (horário de Brasília) */
  until: "2026-12-01T02:59:59.000Z",
  /** preço anterior de cada plano (o que aparece riscado) */
  from: { natal: "R$ 29,90", familia: "R$ 49,90" } as Record<string, string>,
  off: { natal: "50%", familia: "48%" } as Record<string, string>,
};

export const promoActive = () => Date.now() < Date.parse(PROMO.until);
export const promoEndsLabel = () =>
  new Date(PROMO.until).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });
