// Integração com o Asaas Checkout (Pix e cartão).
// Variáveis de ambiente (configure SÓ na Vercel, nunca no código):
//   ASAAS_API_KEY        chave da API do Asaas ($aact_prod_... ou $aact_hmlg_... no sandbox)
//   ASAAS_ENV            opcional: "sandbox" ou "production" (detecta pela chave se ausente)
//   ASAAS_WEBHOOK_TOKEN  o mesmo "Token de autenticação" cadastrado no webhook do Asaas
//   PUBLIC_SITE_URL      opcional: ex. https://cartamagica.com.br (senão usa o domínio da requisição)
import { CHECKOUT_IMAGE_BASE64 } from "./checkoutImage.js";

export type PaidPlan = "pro" | "natal" | "familia";

/** o que pode ser cobrado: os planos e a troca Carta Completa -> Pacote Família */
export type CheckoutPlan = PaidPlan | "upgrade";
export const PLAN_PRICES: Record<CheckoutPlan, { value: number; name: string; description: string }> = {
  upgrade: {
    value: 11,
    name: "Carta Mágica: vire Família",
    description: "Troca da Carta Completa pelo Pacote Família: até 5 crianças e 23 cartas completas no total (paga só a diferença)",
  },
  pro: {
    value: 14.9,
    name: "Magia Completa",
    description: "Carta narrada pelo Papai Noel, PDF para imprimir, certificado e link para a família",
  },
  natal: {
    value: 14.9,
    name: "Carta Mágica (até 2 crianças)",
    description: "Até 2 crianças, 10 cartas completas com 6 vozes, PDF, imagem HD, certificado, carta brilhante em 5 cores e Calendário do Advento",
  },
  familia: {
    value: 25.9,
    name: "Carta Mágica Família (até 5)",
    description: "Até 5 crianças, 23 cartas completas com 6 vozes, PDF, imagem HD, certificado, carta brilhante em 5 cores e Calendário do Advento",
  },
};

/** quantas crianças cada plano cobre */
export const PLAN_CHILDREN: Record<string, number> = { pro: 1, natal: 2, familia: 5 };
/** cartas completas por criança (os pais costumam fazer mais de uma: refazer, véspera, recado especial) */
export const LETTERS_PER_CHILD = 3;
export const PLAN_LETTERS: Record<string, number> = { pro: 1, natal: 10, familia: 23 };

export const isPaidPlan = (p: unknown): p is PaidPlan => p === "pro" || p === "natal" || p === "familia";

export function asaasConfigured() {
  return Boolean(process.env.ASAAS_API_KEY);
}

function baseUrl() {
  if (process.env.ASAAS_API_BASE) return process.env.ASAAS_API_BASE; // usado só em testes
  const key = process.env.ASAAS_API_KEY || "";
  const env = (process.env.ASAAS_ENV || "").toLowerCase();
  const sandbox = env ? env === "sandbox" : key.includes("_hmlg_");
  return sandbox ? "https://api-sandbox.asaas.com/v3" : "https://api.asaas.com/v3";
}

export function checkoutPageUrl(id: string) {
  const sandbox = baseUrl().includes("sandbox");
  return `https://${sandbox ? "sandbox." : ""}asaas.com/checkoutSession/show?id=${encodeURIComponent(id)}`;
}

/** Cria a sessão de checkout e devolve { id, link }. */
export async function createCheckout(opts: {
  orderId: string;
  plan: CheckoutPlan;
  siteUrl: string;
}): Promise<{ id: string; link: string }> {
  const price = PLAN_PRICES[opts.plan];
  const back = `${opts.siteUrl.replace(/\/+$/, "")}/?pedido=${encodeURIComponent(opts.orderId)}`;
  const body = {
    billingTypes: ["PIX", "CREDIT_CARD"],
    chargeTypes: ["DETACHED"],
    minutesToExpire: 60,
    externalReference: opts.orderId,
    callback: {
      successUrl: `${back}&status=pago`,
      cancelUrl: `${back}&status=cancelado`,
      expiredUrl: `${back}&status=expirado`,
    },
    items: [
      {
        name: price.name.startsWith("Carta Mágica") ? price.name : `Carta Mágica — ${price.name}`,
        description: price.description,
        quantity: 1,
        value: price.value,
        imageBase64: CHECKOUT_IMAGE_BASE64,
        externalReference: opts.orderId,
      },
    ],
  };

  const res = await fetch(`${baseUrl()}/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "carta-magica",
      access_token: process.env.ASAAS_API_KEY as string,
    },
    body: JSON.stringify(body),
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok || !data?.id) {
    const msg =
      data?.errors?.map((e: any) => e.description).join("; ") ||
      (res.status === 401 ? "chave de API inválida (confira a ASAAS_API_KEY na Vercel)" : `HTTP ${res.status}`);
    throw new Error(`Asaas: ${msg}`);
  }
  return { id: data.id, link: data.link || checkoutPageUrl(data.id) };
}

/** Confere o token que o Asaas manda no cabeçalho do webhook. */
export function webhookAuthorized(headerToken: unknown) {
  const expected = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!expected) return false;
  return typeof headerToken === "string" && headerToken === expected;
}

/** Busca o e-mail do cliente no Asaas (o checkout pede e-mail ao comprador). */
export async function getCustomerEmail(customerId: string): Promise<string | undefined> {
  if (!customerId || !/^[A-Za-z0-9_-]{1,80}$/.test(customerId) || !asaasConfigured()) return undefined;
  try {
    const res = await fetch(`${baseUrl()}/customers/${customerId}`, {
      headers: { access_token: process.env.ASAAS_API_KEY as string, "User-Agent": "carta-magica" },
    });
    if (!res.ok) return undefined;
    const c: any = await res.json();
    return typeof c?.email === "string" && c.email.includes("@") ? c.email : undefined;
  } catch {
    return undefined;
  }
}

/** Código fácil de digitar (sem 0/O, 1/I/L). */
export function newAccessCode() {
  const abc = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => abc[b % abc.length]).join("");
}
