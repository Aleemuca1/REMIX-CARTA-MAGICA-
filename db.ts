// Camada de dados da Carta Mágica.
// Usa o Supabase quando SUPABASE_URL e SUPABASE_SECRET_KEY estão definidos;
// caso contrário, guarda tudo em memória (modo desenvolvimento).
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type LetterRecord = {
  id: string;
  token: string;
  childName: string;
  age: number;
  city: string;
  achievements: string;
  giftRequest: string;
  parentNotes: string;
  style: string;
  plan: "free" | "pro" | "natal";
  content: string;
  date: string;
  photoUrl?: string;
  deliveryStatus: string;
  trackingCode?: string;
  shippingAddress?: any;
  secretMessage?: string;
  childReaction?: string;
  parentalConsentAt?: string;
  createdAt?: string;
};

export type OrderRecord = {
  orderId: string;
  letterId: string;
  childName: string;
  amount: number;
  plan: string;
  includePhysicalDispatch: boolean;
  status: string;
  paymentMethod: string;
  createdAt: string;
  paidAt?: string;
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_SECRET_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const usingSupabase = () => Boolean(supabase);

// ---------- mapeamento camelCase <-> snake_case ----------
const letterToRow = (l: Partial<LetterRecord>) => {
  const row: Record<string, any> = {
    id: l.id,
    token: l.token,
    child_name: l.childName,
    age: l.age,
    city: l.city,
    achievements: l.achievements,
    gift_request: l.giftRequest,
    parent_notes: l.parentNotes,
    style: l.style,
    plan: l.plan,
    content: l.content,
    letter_date: l.date,
    photo_url: l.photoUrl,
    delivery_status: l.deliveryStatus,
    tracking_code: l.trackingCode,
    shipping_address: l.shippingAddress,
    secret_message: l.secretMessage,
    child_reaction: l.childReaction,
    parental_consent_at: l.parentalConsentAt,
  };
  Object.keys(row).forEach((k) => row[k] === undefined && delete row[k]);
  return row;
};

const rowToLetter = (r: any): LetterRecord => ({
  id: r.id,
  token: r.token,
  childName: r.child_name,
  age: r.age,
  city: r.city,
  achievements: r.achievements ?? "",
  giftRequest: r.gift_request ?? "",
  parentNotes: r.parent_notes ?? "",
  style: r.style,
  plan: r.plan,
  content: r.content,
  date: r.letter_date,
  photoUrl: r.photo_url ?? undefined,
  deliveryStatus: r.delivery_status,
  trackingCode: r.tracking_code ?? undefined,
  shippingAddress: r.shipping_address ?? undefined,
  secretMessage: r.secret_message ?? undefined,
  childReaction: r.child_reaction ?? undefined,
  parentalConsentAt: r.parental_consent_at ?? undefined,
  createdAt: r.created_at,
});

const orderToRow = (o: OrderRecord) => ({
  order_id: o.orderId,
  letter_id: o.letterId,
  child_name: o.childName,
  amount: o.amount,
  plan: o.plan,
  include_physical_dispatch: o.includePhysicalDispatch,
  status: o.status,
  payment_method: o.paymentMethod,
  paid_at: o.status === "paid" ? new Date().toISOString() : null,
});

const rowToOrder = (r: any): OrderRecord => ({
  orderId: r.order_id,
  letterId: r.letter_id,
  childName: r.child_name,
  amount: Number(r.amount),
  plan: r.plan,
  includePhysicalDispatch: r.include_physical_dispatch,
  status: r.status,
  paymentMethod: r.payment_method,
  createdAt: new Date(r.created_at).toLocaleString("pt-BR"),
  paidAt: r.paid_at ? new Date(r.paid_at).toLocaleString("pt-BR") : undefined,
});

// ---------- fallback em memória ----------
const memLetters: LetterRecord[] = [];
const memOrders: OrderRecord[] = [];

export function seedMemory(letters: LetterRecord[], orders: OrderRecord[]) {
  if (supabase) return;
  memLetters.push(...letters);
  memOrders.push(...orders);
}

// ---------- API pública ----------
export async function insertLetter(letter: LetterRecord): Promise<void> {
  if (!supabase) {
    memLetters.unshift(letter);
    return;
  }
  const row = letterToRow(letter);
  let { error } = await supabase.from("letters").insert(row);
  // se a migração 003 ainda não foi aplicada, salva sem a coluna nova (não quebra o site)
  if (error && /parental_consent_at/.test(error.message)) {
    console.warn("Coluna parental_consent_at ausente: rode supabase/migrations/003_consentimento.sql");
    delete row.parental_consent_at;
    ({ error } = await supabase.from("letters").insert(row));
  }
  if (error) throw new Error(`Supabase insertLetter: ${error.message}`);
}

export async function findLetter(idOrToken: string): Promise<LetterRecord | null> {
  // tokens e ids só têm letras minúsculas, números e hífen — evita injeção no filtro
  if (!idOrToken || !/^[a-z0-9-]{1,80}$/.test(idOrToken)) return null;
  if (!supabase) {
    return memLetters.find((l) => l.token === idOrToken || l.id === idOrToken) ?? null;
  }
  const { data, error } = await supabase
    .from("letters")
    .select("*")
    .or(`token.eq.${idOrToken},id.eq.${idOrToken}`)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Supabase findLetter: ${error.message}`);
  return data ? rowToLetter(data) : null;
}

export async function updateLetter(
  id: string,
  patch: Partial<LetterRecord>,
): Promise<void> {
  if (!supabase) {
    const l = memLetters.find((x) => x.id === id);
    if (l) Object.assign(l, patch);
    return;
  }
  const { error } = await supabase.from("letters").update(letterToRow(patch)).eq("id", id);
  if (error) throw new Error(`Supabase updateLetter: ${error.message}`);
}

export async function listLetters(limit = 50): Promise<LetterRecord[]> {
  if (!supabase) return memLetters.slice(0, limit);
  const { data, error } = await supabase
    .from("letters")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Supabase listLetters: ${error.message}`);
  return (data ?? []).map(rowToLetter);
}

export async function insertOrder(order: OrderRecord): Promise<void> {
  if (!supabase) {
    memOrders.unshift(order);
    return;
  }
  const { error } = await supabase.from("orders").insert(orderToRow(order));
  if (error) throw new Error(`Supabase insertOrder: ${error.message}`);
}

export async function listOrders(limit = 50): Promise<OrderRecord[]> {
  if (!supabase) return memOrders.slice(0, limit);
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Supabase listOrders: ${error.message}`);
  return (data ?? []).map(rowToOrder);
}

export async function getMetrics() {
  if (!supabase) {
    const total = memLetters.length;
    const pro = memLetters.filter((l) => l.plan === "pro").length;
    const revenue = memOrders
      .filter((o) => o.status === "paid")
      .reduce((a, o) => a + o.amount, 0);
    return { total, pro, revenue };
  }
  const [{ count: total }, { count: pro }, paid] = await Promise.all([
    supabase.from("letters").select("id", { count: "exact", head: true }),
    supabase.from("letters").select("id", { count: "exact", head: true }).eq("plan", "pro"),
    supabase.from("orders").select("amount").eq("status", "paid"),
  ]);
  const revenue = (paid.data ?? []).reduce((a: number, o: any) => a + Number(o.amount), 0);
  return { total: total ?? 0, pro: pro ?? 0, revenue };
}
