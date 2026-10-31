import { randomUUID } from "crypto";
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
  theme?: string;
  parentId?: string;
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
  gatewayChargeId?: string;
  accessCode?: string;
  customerEmail?: string;
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
    theme: l.theme,
    parent_id: l.parentId,
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
  theme: r.theme ?? undefined,
  parentId: r.parent_id ?? undefined,
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
  gateway_charge_id: o.gatewayChargeId ?? null,
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
  gatewayChargeId: r.gateway_charge_id ?? undefined,
  accessCode: r.access_code ?? undefined,
  customerEmail: r.customer_email ?? undefined,
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
  // se as migrações 006 (cor) ou 007 (login) ainda não foram aplicadas, salva sem essas colunas
  for (const col of ["theme", "parent_id"]) {
    if (error && new RegExp(col).test(error.message) && col in row) {
      console.warn(`Coluna ${col} ausente em letters: rode as migrações 006/007 do Supabase`);
      delete row[col];
      ({ error } = await supabase.from("letters").insert(row));
    }
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
  const row = letterToRow(patch);
  let { error } = await supabase.from("letters").update(row).eq("id", id);
  if (error && /theme/.test(error.message) && "theme" in row) {
    console.warn("Coluna theme ausente: rode supabase/migrations/006_cor_da_carta.sql");
    delete row.theme;
    if (!Object.keys(row).length) return;
    ({ error } = await supabase.from("letters").update(row).eq("id", id));
  }
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

const SAFE_ID = /^[A-Za-z0-9_-]{1,120}$/;

/** Busca um pedido pelo nosso id ou pelo id do checkout no Asaas. */
export async function findOrder(id: string): Promise<OrderRecord | null> {
  if (!id || !SAFE_ID.test(id)) return null;
  if (!supabase) {
    return memOrders.find((o) => o.orderId === id || o.gatewayChargeId === id) ?? null;
  }
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .or(`order_id.eq.${id},gateway_charge_id.eq.${id}`)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Supabase findOrder: ${error.message}`);
  return data ? rowToOrder(data) : null;
}

/** Atualiza status (e id do checkout) de um pedido. */
export async function updateOrder(
  orderId: string,
  patch: {
    status?: string;
    gatewayChargeId?: string;
    paymentMethod?: string;
    accessCode?: string;
    customerEmail?: string;
  },
): Promise<void> {
  if (!supabase) {
    const o = memOrders.find((x) => x.orderId === orderId);
    if (o) {
      Object.assign(o, patch);
      if (patch.status === "paid") o.paidAt = new Date().toLocaleString("pt-BR");
    }
    return;
  }
  const row: Record<string, any> = {};
  if (patch.status) row.status = patch.status;
  if (patch.status === "paid") row.paid_at = new Date().toISOString();
  if (patch.gatewayChargeId) row.gateway_charge_id = patch.gatewayChargeId;
  if (patch.paymentMethod) row.payment_method = patch.paymentMethod;
  if (patch.accessCode) row.access_code = patch.accessCode;
  if (patch.customerEmail) row.customer_email = patch.customerEmail;
  let { error } = await supabase.from("orders").update(row).eq("order_id", orderId);
  // se a migração 004 ainda não foi aplicada, salva o resto (não trava a liberação do plano)
  if (error && /access_code|customer_email/.test(error.message)) {
    console.warn("Colunas novas ausentes: rode supabase/migrations/004_codigo_magico.sql");
    delete row.access_code;
    delete row.customer_email;
    ({ error } = await supabase.from("orders").update(row).eq("order_id", orderId));
  }
  if (error) throw new Error(`Supabase updateOrder: ${error.message}`);
}

/** Procura um pedido PAGO pelo código mágico (para liberar em outro aparelho). */
export async function findPaidOrderByCode(code: string): Promise<OrderRecord | null> {
  if (!/^[A-Z0-9]{6}$/.test(code)) return null;
  if (!supabase) {
    return memOrders.find((o) => o.accessCode === code && o.status === "paid") ?? null;
  }
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("access_code", code)
    .eq("status", "paid")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Supabase findPaidOrderByCode: ${error.message}`);
  return data ? rowToOrder(data) : null;
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

// ---------- Árvore de Natal da Família ----------
export type TreeRecord = {
  token: string;
  editKeyHash: string;
  title: string;
  ornaments: any[];
  updatedAt?: string;
};
const memTrees = new Map<string, TreeRecord>();

export async function insertTree(t: TreeRecord): Promise<void> {
  if (!supabase) {
    memTrees.set(t.token, { ...t, updatedAt: new Date().toISOString() });
    return;
  }
  const { error } = await supabase.from("family_trees").insert({
    token: t.token,
    edit_key_hash: t.editKeyHash,
    title: t.title,
    ornaments: t.ornaments,
  });
  if (error) throw new Error(`Supabase insertTree: ${error.message}`);
}

export async function findTree(token: string): Promise<TreeRecord | null> {
  if (!/^[a-z0-9]{6,16}$/.test(token)) return null;
  if (!supabase) return memTrees.get(token) ?? null;
  const { data, error } = await supabase.from("family_trees").select("*").eq("token", token).maybeSingle();
  if (error) throw new Error(`Supabase findTree: ${error.message}`);
  return data
    ? { token: data.token, editKeyHash: data.edit_key_hash, title: data.title, ornaments: data.ornaments || [], updatedAt: data.updated_at }
    : null;
}

export async function saveTree(token: string, patch: { title?: string; ornaments?: any[] }): Promise<void> {
  if (!supabase) {
    const t = memTrees.get(token);
    if (t) Object.assign(t, patch, { updatedAt: new Date().toISOString() });
    return;
  }
  const { error } = await supabase
    .from("family_trees")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("token", token);
  if (error) throw new Error(`Supabase saveTree: ${error.message}`);
}


// ---------- Login do responsável (código de 6 dígitos por e-mail) ----------
// Tabelas da migração 007_login_responsavel.sql. Sem Supabase, fica tudo em memória (testes locais).
export type ParentRecord = { id: string; email: string; name?: string };
type CodeRow = { email: string; code_hash: string; expires_at: string; attempts: number; created_at: string };
const memParents: ParentRecord[] = [];
const memCodes: CodeRow[] = [];
const memSessions: { token_hash: string; parent_id: string; expires_at: string }[] = [];

export async function saveLoginCode(email: string, codeHash: string, expiresAt: Date): Promise<void> {
  const row = { email, code_hash: codeHash, expires_at: expiresAt.toISOString(), attempts: 0, created_at: new Date().toISOString() };
  if (!supabase) {
    for (let i = memCodes.length - 1; i >= 0; i--) if (memCodes[i].email === email) memCodes.splice(i, 1);
    memCodes.push(row);
    return;
  }
  await supabase.from("auth_codes").delete().eq("email", email);
  const { error } = await supabase.from("auth_codes").insert(row);
  if (error) throw new Error(`Supabase saveLoginCode: ${error.message}`);
}

export async function latestLoginCode(email: string): Promise<(CodeRow & { id?: number }) | null> {
  if (!supabase) return memCodes.filter((c) => c.email === email).slice(-1)[0] ?? null;
  const { data, error } = await supabase
    .from("auth_codes")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Supabase latestLoginCode: ${error.message}`);
  return data ?? null;
}

export async function bumpLoginAttempts(email: string, attempts: number): Promise<void> {
  if (!supabase) {
    memCodes.filter((c) => c.email === email).forEach((c) => (c.attempts = attempts));
    return;
  }
  await supabase.from("auth_codes").update({ attempts }).eq("email", email);
}

export async function clearLoginCodes(email: string): Promise<void> {
  if (!supabase) {
    for (let i = memCodes.length - 1; i >= 0; i--) if (memCodes[i].email === email) memCodes.splice(i, 1);
    return;
  }
  await supabase.from("auth_codes").delete().eq("email", email);
}

export async function upsertParent(email: string, name?: string): Promise<ParentRecord> {
  if (!supabase) {
    let p = memParents.find((x) => x.email === email);
    if (!p) {
      p = { id: `p-${randomUUID()}`, email, name };
      memParents.push(p);
    } else if (name) p.name = name;
    return p;
  }
  const { data: found } = await supabase.from("parents").select("id,email,name").eq("email", email).maybeSingle();
  if (found) {
    const patch: Record<string, any> = { last_login_at: new Date().toISOString() };
    if (name && !found.name) patch.name = name;
    await supabase.from("parents").update(patch).eq("id", found.id);
    return { id: found.id, email: found.email, name: patch.name ?? found.name ?? undefined };
  }
  const { data, error } = await supabase
    .from("parents")
    .insert({ email, name: name || null, last_login_at: new Date().toISOString() })
    .select("id,email,name")
    .single();
  if (error) throw new Error(`Supabase upsertParent: ${error.message}`);
  return { id: data.id, email: data.email, name: data.name ?? undefined };
}

export async function createSession(tokenHash: string, parentId: string, expiresAt: Date): Promise<void> {
  const row = { token_hash: tokenHash, parent_id: parentId, expires_at: expiresAt.toISOString() };
  if (!supabase) {
    memSessions.push(row);
    return;
  }
  const { error } = await supabase.from("parent_sessions").insert(row);
  if (error) throw new Error(`Supabase createSession: ${error.message}`);
}

export async function parentBySession(tokenHash: string): Promise<ParentRecord | null> {
  const now = Date.now();
  if (!supabase) {
    const s = memSessions.find((x) => x.token_hash === tokenHash && Date.parse(x.expires_at) > now);
    return s ? memParents.find((p) => p.id === s.parent_id) ?? null : null;
  }
  const { data, error } = await supabase
    .from("parent_sessions")
    .select("expires_at, parents(id,email,name)")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (error || !data || Date.parse(data.expires_at) <= now) return null;
  const p: any = Array.isArray(data.parents) ? data.parents[0] : data.parents;
  return p ? { id: p.id, email: p.email, name: p.name ?? undefined } : null;
}

export async function deleteSession(tokenHash: string): Promise<void> {
  if (!supabase) {
    const i = memSessions.findIndex((x) => x.token_hash === tokenHash);
    if (i >= 0) memSessions.splice(i, 1);
    return;
  }
  await supabase.from("parent_sessions").delete().eq("token_hash", tokenHash);
}

export async function lettersOfParent(parentId: string, limit = 60): Promise<LetterRecord[]> {
  if (!supabase) return memLetters.filter((l) => l.parentId === parentId).slice(0, limit);
  const { data, error } = await supabase
    .from("letters")
    .select("*")
    .eq("parent_id", parentId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Supabase lettersOfParent: ${error.message}`);
  return (data ?? []).map(rowToLetter);
}
