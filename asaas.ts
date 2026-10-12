// Integração com o Asaas Checkout (Pix e cartão).
// Variáveis de ambiente (configure SÓ na Vercel, nunca no código):
//   ASAAS_API_KEY        chave da API do Asaas ($aact_prod_... ou $aact_hmlg_... no sandbox)
//   ASAAS_ENV            opcional: "sandbox" ou "production" (detecta pela chave se ausente)
//   ASAAS_WEBHOOK_TOKEN  o mesmo "Token de autenticação" cadastrado no webhook do Asaas
//   PUBLIC_SITE_URL      opcional: ex. https://cartamagica.com.br (senão usa o domínio da requisição)
import { CHECKOUT_IMAGE_BASE64 } from "./checkoutImage";

export type PaidPlan = "pro" | "natal";

export const PLAN_PRICES: Record<PaidPlan, { value: number; name: string; description: string }> = {
  pro: {
    value: 19.9,
    name: "Magia Completa",
    description: "Carta narrada pelo Papai Noel, PDF para imprimir, certificado e link para a família",
  },
  natal: {
    value: 29.9,
    name: "Natal Completo",
    description: "Carta completa com a voz do Papai Noel, PDF, certificado e Calendário do Advento com 24 surpresas",
  },
};

export const isPaidPlan = (p: unknown): p is PaidPlan => p === "pro" || p === "natal";

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
  plan: PaidPlan;
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
        name: `Carta Mágica — ${price.name}`,
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
    const msg = data?.errors?.map((e: any) => e.description).join("; ") || `HTTP ${res.status}`;
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
