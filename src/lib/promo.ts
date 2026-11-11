/** Promoção Black Friday (datas e preços ficam em pricing.ts). */
import { PROMO as P, fromLabel, planOff, promoActive } from "./pricing";

export const PROMO = {
  ...P,
  /** preço anterior de cada plano (o que aparece riscado) */
  get from(): Record<string, string> {
    return { natal: fromLabel("natal"), familia: fromLabel("familia") };
  },
  get off(): Record<string, string> {
    return { natal: planOff("natal"), familia: planOff("familia") };
  },
};

export { promoActive };
export const promoEndsLabel = () =>
  new Date(PROMO.until).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });
