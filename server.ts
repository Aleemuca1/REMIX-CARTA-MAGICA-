var __defProp = Object.defineProperty;
var __name = (target, value) =>
  __defProp(target, "name", { value, configurable: true });
import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import * as db from "./db.js";
import { randomBytes } from "crypto";
import * as asaas from "./asaas.js";
import { planPrice } from "./src/lib/pricing.js";
import { ADVENT_DAYS } from "./src/advent/days.js";
import { voiceById, voiceForSender } from "./src/lib/voices.js";
import * as mailer from "./mailer.js";
import * as eleven from "./elevenlabs.js";
import * as audioStore from "./audioStore.js";
import { createHash, timingSafeEqual } from "crypto";
import { MAX_AUTHOR, MAX_ORNAMENTS, MAX_TEXT, ORNAMENT_TYPES, VIEW_H, VIEW_W, sanitizeText } from "./src/tree/model.js";
import { CATALOG as HOUSE_CATALOG, isPersonRef, VIEW_W as HOUSE_W, VIEW_H as HOUSE_H } from "./src/house/model.js";
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
// Rotas administrativas exigem o header "x-admin-token" igual a ADMIN_TOKEN.
function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN || req.get("x-admin-token") !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  next();
}
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(process.cwd(), "public")));

// ======================= Login do responsável =======================
// Só os pais fazem login (código de 6 dígitos no e-mail, sem senha).
// A criança joga e vê a carta grátis sem login; o login aparece para salvar a carta,
// receber por e-mail, ver "Minhas cartas" e pagar.
const SESSION_COOKIE = "cm_sess";
const SESSION_DAYS = 60;
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "dev-only-secret";
const sha = (v: string) => createHash("sha256").update(`${AUTH_SECRET}:${v}`).digest("hex");
const cleanEmail = (v: unknown) => String(v ?? "").trim().toLowerCase().slice(0, 120);
const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
function readCookie(req: any, name: string): string | null {
  const raw = String(req.headers?.cookie || "");
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}
function isHttps(req: any) {
  return String(req.headers["x-forwarded-proto"] || "").startsWith("https") || process.env.VERCEL === "1";
}
async function currentParent(req: any): Promise<db.ParentRecord | null> {
  if (req._parent !== undefined) return req._parent;
  const tok = readCookie(req, SESSION_COOKIE);
  let p: db.ParentRecord | null = null;
  if (tok && /^[A-Za-z0-9_-]{30,80}$/.test(tok)) {
    try {
      p = await db.parentBySession(sha(`sess:${tok}`));
    } catch {
      p = null;
    }
  }
  req._parent = p;
  return p;
}
const ipOf = (req: any) => String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();
const authHits = new Map<string, number[]>();
function tooMany(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const arr = (authHits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  authHits.set(key, arr);
  return arr.length > max;
}

async function startSession(req: any, res: any, parentId: string) {
  const token = randomBytes(32).toString("base64url");
  await db.createSession(sha(`sess:${token}`), parentId, new Date(Date.now() + SESSION_DAYS * 864e5));
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${isHttps(req) ? "; Secure" : ""}`,
  );
}

// Entrar com o código mágico da compra (funciona mesmo sem o e-mail configurado):
// o código liga a pessoa ao e-mail usado no pagamento.
app.post("/api/auth/code", async (req, res) => {
  const code = String(req.body?.code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (code.length !== 6) return res.status(400).json({ error: "O código mágico tem 6 letras e números." });
  if (tooMany(`codelogin:${ipOf(req)}`, 10, 15 * 60 * 1000)) {
    return res.status(429).json({ error: "Muitas tentativas. Espere alguns minutos e tente de novo." });
  }
  try {
    const order = await db.findPaidOrderByCode(code);
    if (!order) return res.status(404).json({ error: "Código não encontrado. Confira as letras e tente de novo." });
    const email = cleanEmail(order.customerEmail);
    if (!validEmail(email)) {
      return res.status(400).json({ error: "Esse código ainda não tem um e-mail ligado. Fale com a gente pelo WhatsApp que resolvemos rapidinho." });
    }
    const parent = await db.upsertParent(email);
    await startSession(req, res, parent.id);
    res.json({ ok: true, parent: { email: parent.email, name: parent.name } });
  } catch (err: any) {
    console.error("auth/code:", err?.message || err);
    res.status(500).json({ error: "Não foi possível entrar agora. Tente de novo." });
  }
});

app.post("/api/auth/start", async (req, res) => {
  const email = cleanEmail(req.body?.email);
  if (!validEmail(email)) return res.status(400).json({ error: "Confira o e-mail digitado." });
  if (tooMany(`ip:${ipOf(req)}`, 12, 60 * 60 * 1000) || tooMany(`mail:${email}`, 5, 60 * 60 * 1000)) {
    return res.status(429).json({ error: "Muitos pedidos de código. Espere alguns minutos e tente de novo." });
  }
  const devMode = process.env.NODE_ENV !== "production" && !process.env.VERCEL;
  if (!mailer.emailConfigured() && !devMode) {
    return res.status(503).json({ error: "O login por e-mail ainda está sendo configurado. Tente mais tarde." });
  }
  try {
    const last = await db.latestLoginCode(email);
    if (last && Date.now() - Date.parse(last.created_at) < 45 * 1000) {
      return res.status(429).json({ error: "Acabamos de enviar um código. Espere alguns segundos para pedir outro." });
    }
    const code = String(randomBytes(4).readUInt32BE(0) % 1000000).padStart(6, "0");
    await db.saveLoginCode(email, sha(`code:${email}:${code}`), new Date(Date.now() + 10 * 60 * 1000));
    const sent = await mailer.sendLoginCode({ to: email, code, siteUrl: siteUrlFrom(req) });
    if (!sent && !devMode) return res.status(502).json({ error: "Não conseguimos enviar o e-mail agora. Tente de novo." });
    // em testes locais (sem e-mail configurado) o código aparece no log do servidor
    if (!sent) console.log(`[login] código para ${email}: ${code}`);
    res.json({ ok: true, ...(devMode && !sent ? { devCode: code } : {}) });
  } catch (err: any) {
    console.error("auth/start:", err?.message || err);
    res.status(500).json({ error: "Não foi possível enviar o código agora." });
  }
});

app.post("/api/auth/verify", async (req, res) => {
  const email = cleanEmail(req.body?.email);
  const code = String(req.body?.code ?? "").replace(/\D/g, "");
  const name = String(req.body?.name ?? "").trim().replace(/\s+/g, " ").slice(0, 40) || undefined;
  if (!validEmail(email) || code.length !== 6) return res.status(400).json({ error: "Digite os 6 números do código." });
  if (tooMany(`verify:${ipOf(req)}`, 30, 15 * 60 * 1000)) {
    return res.status(429).json({ error: "Muitas tentativas. Espere alguns minutos." });
  }
  try {
    const row = await db.latestLoginCode(email);
    if (!row || Date.parse(row.expires_at) < Date.now()) {
      return res.status(400).json({ error: "Esse código venceu. Peça um novo." });
    }
    if (row.attempts >= 5) {
      await db.clearLoginCodes(email);
      return res.status(400).json({ error: "Muitas tentativas com esse código. Peça um novo." });
    }
    const a = Buffer.from(row.code_hash, "hex");
    const b = Buffer.from(sha(`code:${email}:${code}`), "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      await db.bumpLoginAttempts(email, row.attempts + 1);
      return res.status(400).json({ error: "Código incorreto. Confira o e-mail e tente de novo." });
    }
    await db.clearLoginCodes(email);
    const parent = await db.upsertParent(email, name);
    await startSession(req, res, parent.id);
    res.json({ ok: true, parent: { email: parent.email, name: parent.name } });
  } catch (err: any) {
    console.error("auth/verify:", err?.message || err);
    res.status(500).json({ error: "Não foi possível entrar agora. Tente de novo." });
  }
});

app.get("/api/auth/me", async (req, res) => {
  const p = await currentParent(req);
  res.setHeader("Cache-Control", "no-store");
  const devMode = process.env.NODE_ENV !== "production" && !process.env.VERCEL;
  // available=false: o e-mail (Resend) ainda não foi configurado, então o site não pede login
  // available: a Área dos Pais aparece (entrar com o código mágico funciona sempre)
  // email: o login por e-mail (Resend) está configurado; só aí pedimos login antes de pagar
  const ready = await db.authReady().catch(() => false);
  res.json({ parent: p ? { email: p.email, name: p.name } : null, available: ready, email: ready && (mailer.emailConfigured() || devMode) });
});

app.post("/api/auth/logout", async (req, res) => {
  const tok = readCookie(req, SESSION_COOKIE);
  if (tok) await db.deleteSession(sha(`sess:${tok}`)).catch(() => {});
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isHttps(req) ? "; Secure" : ""}`);
  res.json({ ok: true });
});

// Minhas cartas
app.get("/api/me/letters", async (req, res) => {
  const p = await currentParent(req);
  if (!p) return res.status(401).json({ error: "Entre na Área dos Pais." });
  try {
    const list = await db.lettersOfParent(p.id);
    res.setHeader("Cache-Control", "no-store");
    res.json(list.map((l) => ({ token: l.token, childName: l.childName, age: l.age, date: l.date, theme: l.theme, plan: l.plan })));
  } catch (err: any) {
    console.error("me/letters:", err?.message || err);
    res.status(500).json({ error: "Não foi possível carregar suas cartas." });
  }
});

// Painel da Família: planos, cartas usadas/restantes, cartas por criança, casinhas e árvores
const PLAN_LABEL: Record<string, string> = { natal: "Carta Completa", familia: "Pacote Família", pro: "Magia Completa" };
app.get("/api/me/panel", async (req, res) => {
  const p = await currentParent(req);
  if (!p) return res.status(401).json({ error: "Entre na Área dos Pais." });
  res.setHeader("Cache-Control", "no-store");
  try {
    const orders = (await db.paidOrdersByEmail(p.email)).filter((o) => o.plan !== "upgrade" && o.accessCode);
    const plans = [];
    for (const o of orders) {
      const st = await codeStatus(o.accessCode!);
      if (!st) continue;
      plans.push({
        code: st.code,
        plan: st.plan,
        label: PLAN_LABEL[st.plan] || "Natal Completo",
        children: st.children,
        limit: st.limit,
        used: st.used,
        remaining: st.remaining,
        paidAt: o.paidAt,
        amount: o.amount,
        canUpgrade: st.plan === "natal",
      });
    }
    const codes = plans.map((x) => x.code);
    const [mine, byCode, trees] = await Promise.all([db.lettersOfParent(p.id), db.lettersByCodes(codes), db.treesOfParent(p.id)]);
    const seen = new Set<string>();
    const letters = [...mine, ...byCode]
      .filter((l) => (seen.has(l.token) ? false : (seen.add(l.token), true)))
      .map((l) => ({
        token: l.token, childName: l.childName, age: l.age, date: l.date, theme: l.theme, plan: l.plan,
        wishes: l.wishes, protocol: l.protocol, deliverAt: l.deliverAt, review: l.reviewStatus === "pending",
        fromChild: Boolean(l.childText),
      }));
    res.json({
      parent: { email: p.email, name: p.name },
      plans,
      letters,
      houses: trees.filter((t) => t.token.startsWith("casa")).map((t) => ({ token: t.token, title: t.title, updatedAt: t.updatedAt })),
      trees: trees.filter((t) => !t.token.startsWith("casa")).map((t) => ({ token: t.token, title: t.title, updatedAt: t.updatedAt })),
    });
  } catch (err: any) {
    console.error("me/panel:", err?.message || err);
    res.status(500).json({ error: "Não foi possível carregar o painel agora." });
  }
});

// Guarda a casinha ou a árvore na conta (quem criou prova com a chave de edição)
app.post("/api/me/link", async (req, res) => {
  const p = await currentParent(req);
  if (!p) return res.status(401).json({ error: "Entre na Área dos Pais." });
  try {
    const token = String(req.body?.token || "").toLowerCase();
    const t = await db.findTree(token);
    if (!t) return res.status(404).json({ error: "Não encontrada." });
    if (t.parentId === p.id) return res.json({ ok: true });
    if (t.parentId || !ownerOk(t, req.body?.editKey)) return res.status(403).json({ error: "Só quem criou pode guardar na conta." });
    await db.linkTreeToParent(token, p.id);
    res.json({ ok: true });
  } catch (err: any) {
    console.error("me/link:", err?.message || err);
    res.status(500).json({ error: "Não foi possível guardar agora." });
  }
});

// Salvar a carta na conta do responsável e mandar o link por e-mail
app.post("/api/me/letters/save", async (req, res) => {
  const p = await currentParent(req);
  if (!p) return res.status(401).json({ error: "Entre na Área dos Pais." });
  try {
    const letter = await db.findLetter(String(req.body?.letterId || ""));
    if (!letter) return res.status(404).json({ error: "Carta não encontrada. Crie a carta de novo." });
    if (letter.parentId && letter.parentId !== p.id) return res.status(403).json({ error: "Essa carta já está guardada em outra conta." });
    if (!letter.parentId) await db.updateLetter(letter.id, { parentId: p.id });
    const site = siteUrlFrom(req);
    const emailed = await mailer.sendLetterLink({ to: p.email, childName: letter.childName, letterUrl: `${site}/natal/${letter.token}`, siteUrl: site });
    res.json({ ok: true, emailed });
  } catch (err: any) {
    console.error("me/letters/save:", err?.message || err);
    res.status(500).json({ error: "Não foi possível salvar a carta agora." });
  }
});
// ===================================================================
const demoLetters: any[] = [
  {
    id: "cm-demo-01",
    childName: "Lucas",
    age: 6,
    city: "S\xE3o Paulo, SP",
    achievements:
      "Aprendeu a andar de bicicleta sem rodinhas e ajudou a cuidar com muito carinho do gatinho Pipoca.",
    giftRequest: "Um dinossauro rob\xF4 que acende os olhos",
    parentNotes:
      "Lembrar de continuar dormindo no pr\xF3prio quarto e que os pais o amam infinitamente.",
    style: "m\xE1gico",
    plan: "pro",
    date: "12/11/2026",
    token: "lucas-sp-7821",
    deliveryStatus: "dispatched",
    trackingCode: "NP-849204-BR",
    content: `Ho Ho Ho! Ol\xE1, meu querido Lucas!

Daqui do alto da montanha gelada do Polo Norte, onde as luzes da Aurora Boreal dan\xE7am no c\xE9u estrelado, olhei atrav\xE9s do meu grande telesc\xF3pio de cristal dourado e avistei voc\xEA a\xED em S\xE3o Paulo!

Voc\xEA nem imagina o quanto os duendes artes\xE3os e a Mam\xE3e Noel vibraram quando souberam da sua grande coragem neste ano: andar de bicicleta sem rodinhas! \xC9 preciso ter um cora\xE7\xE3o muito valente para tentar, cair, levantar e conseguir pedalar com o vento no rosto. E o seu cuidado afetuoso com o gatinho Pipoca aquece o cora\xE7\xE3o deste velhinho como um chocolate quente em noite de nevasca.

O pr\xF3prio Papai Noel j\xE1 separou com todo carinho a sua cartinha sobre o dinossauro rob\xF4 que acende os olhos. Nossos elfos inventores est\xE3o dando os \xFAltimos retoques na oficina m\xE1gica de brinquedos.

Seus pais t\xEAm um orgulho gigantesco de voc\xEA. Lembre-se sempre de ser esse menino gentil, corajoso e de continuar dormindo no seu pr\xF3prio quarto como o grande rapazinho que voc\xEA j\xE1 \xE9.

Na noite m\xE1gica de Natal, estarei sobrevoando sua casa com meu tren\xF3. Se puder, deixe uma cenoura fresca para as renas e um abra\xE7o carinhoso em quem cuida de voc\xEA.

Com todo o meu amor e p\xF3 de estrelas,
Com carinho, Papai Noel \u{1F385}`,
  },
  {
    id: "cm-demo-02",
    childName: "Helena",
    age: 5,
    city: "Curitiba, PR",
    achievements:
      "Fez novos amigos na escolinha e aprendeu a desenhar arco-\xEDris sozinha.",
    giftRequest: "Uma maleta de tintas m\xE1gicas e pinc\xE9is",
    style: "carinhoso",
    plan: "free",
    date: "10/11/2026",
    token: "helena-cwb-3912",
    deliveryStatus: "digital_only",
    content: `Ho Ho Ho! Minha querida Helena!

Que alegria escrever para voc\xEA diretamente da minha oficina de brinquedos no Polo Norte! 

Os duendes observadores me contaram que voc\xEA foi muito corajosa ao fazer novos amigos na escolinha em Curitiba e que seus desenhos de arco-\xEDris s\xE3o repletos de cores e alegria! Continue espalhando esse sorriso doce por onde passar.

J\xE1 registrei no meu Grande Livro Dourado o seu desejo da maleta de tintas m\xE1gicas e pinc\xE9is. As renas mandam um carinhoso relincho m\xE1gico para voc\xEA!

Durma bem e guarde sempre o encanto do Natal no seu cora\xE7\xE3ozinho.

Com carinho, Papai Noel \u{1F385}`,
  },
];
const demoOrders: any[] = [
  {
    orderId: "ORD-98214",
    letterId: "cm-demo-01",
    childName: "Lucas",
    amount: 39.99,
    plan: "pro",
    includePhysicalDispatch: true,
    status: "paid",
    paymentMethod: "Asaas (Pix / Cart\xE3o)",
    createdAt: "12/11/2026 14:22",
    paidAt: "12/11/2026 14:23",
  },
];
db.seedMemory(demoLetters, demoOrders);
let aiClient = null;
function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }
  return aiClient;
}
__name(getGeminiClient, "getGeminiClient");

/** Detalhes opcionais que deixam a carta mais pessoal (tudo curtinho e sem dados sensíveis). */
type LetterExtras = { pet?: string; friend?: string; food?: string; favorite?: string; encourage?: string; siblings?: string };
function cleanExtras(raw: any): LetterExtras {
  const out: LetterExtras = {};
  if (!raw || typeof raw !== "object") return out;
  for (const k of ["pet", "friend", "food", "favorite", "encourage", "siblings"] as const) {
    const v = typeof raw[k] === "string" ? raw[k].replace(/[<>{}\[\]"`]/g, "").replace(/\s+/g, " ").trim().slice(0, k === "encourage" ? 90 : 60) : "";
    if (v) out[k] = v;
  }
  return out;
}
const TONES: Record<string, string> = {
  "mágico": "mágico e encantado, cheio de detalhes do Polo Norte",
  emocionante: "emocionante e terno, que faça os pais se emocionarem, falando de crescimento, família e amor",
  "engraçado": "divertido e bem-humorado, com trapalhadas dos duendes e das renas, piadinhas leves que façam a criança rir alto",
  aventura: "de aventura, contando uma pequena missão secreta no Polo Norte em que a criança é a heroína/herói",
};
function extrasForPrompt(x: LetterExtras) {
  const lines: string[] = [];
  if (x.siblings) lines.push(`- Irmãos que também recebem a carta (cite cada um pelo nome com carinho, a carta é para todos): ${x.siblings}`);
  if (x.pet) lines.push(`- Bichinho de estimação (mande um recado ou abraço especial para ele pelo nome): ${x.pet}`);
  if (x.friend) lines.push(`- Melhor amigo(a) (cite com carinho): ${x.friend}`);
  if (x.food) lines.push(`- Comida favorita (os duendes adoram/querem provar): ${x.food}`);
  if (x.favorite) lines.push(`- Desenho, personagem ou brincadeira favorita (mencione de forma divertida, sem usar marcas como se fossem do Papai Noel): ${x.favorite}`);
  if (x.encourage) lines.push(`- Algo que os pais querem incentivar (faça um incentivo CARINHOSO e positivo, como um desafio mágico, nunca bronca, ameaça ou condição para ganhar presente): ${x.encourage}`);
  return lines.join("\n");
}

const ACCENTS: Record<string, string> = {
  matematica: "matemática", portugues: "português", ingles: "inglês", historia: "história", ciencias: "ciências", musica: "música",
  bicicleta: "bicicleta", videogame: "videogame", ferias: "férias", ja: "já", tambem: "também", voce: "você", irmao: "irmão",
  irma: "irmã", educacao: "educação", licao: "lição", licoes: "lições", natacao: "natação", ballet: "balé", onibus: "ônibus", lapis: "lápis",
};
/** Arruma o que os pais escreveram para caber numa frase: "aprendeu matematica e foi obediente e passou de ano" -> "aprendeu matematica, foi obediente e passou de ano". */
function tidyPhrase(raw: string) {
  let t = String(raw || "").replace(/\s+/g, " ").trim().replace(/[.!;]+$/, "");
  if (!t) return "";
  const parts = t.split(/\s*(?:,|\be\b)\s+/i).map((x) => x.trim()).filter(Boolean);
  if (parts.length > 1) t = `${parts.slice(0, -1).join(", ")} e ${parts[parts.length - 1]}`;
  // acentos que os pais costumam esquecer ao digitar no celular
  t = t.replace(/\b(matematica|portugues|ingles|historia|ciencias|musica|bicicleta|video ?game|ferias|ja|tambem|voce|irmao|irma|educacao|licao|licoes|natacao|ballet|onibus|lapis)\b/gi, (w) => ACCENTS[w.toLowerCase().replace(" ", "")] ?? w);
  // primeira letra minúscula (vai no meio da frase), menos siglas e nomes
  if (/^[A-ZÀ-Ú][a-zà-ú]/.test(t) && !/^(Eu|Ele|Ela)\b/.test(t)) t = t[0].toLowerCase() + t.slice(1);
  return t;
}
/** Conquista começa com verbo ("aprendeu", "foi")? Então cabe depois de "você". */
const startsWithVerb = (t: string) => /^(aprendeu|foi|passou|ajudou|conseguiu|tirou|ganhou|fez|come[cç]ou|terminou|leu|venceu|cuidou|comeu|dormiu|parou|deixou|largou|entrou|treinou|tocou|nadou|andou|virou|ficou|obedeceu|respeitou|dividiu|compartilhou|escreveu|desenhou|mudou|se\s)/i.test(t);

function generateFallbackLetter(data) {
  const isPro = data.plan === "pro";
  const name = String(data.childName || "").trim().split(/\s+/)[0] || "querido(a)";
  const city = String(data.city || "").trim().slice(0, 60);
  const age = data.age;
  const ach = tidyPhrase(data.achievements);
  const achLine = !ach
    ? "você foi uma criança gentil, bondosa e cheia de alegria"
    : startsWithVerb(ach)
      ? `você ${ach}`
      : `você teve um ano lindo: ${ach}`;
  const gift = tidyPhrase(data.giftRequest);
  const parentNotes = String(data.parentNotes || "").replace(/\s+/g, " ").trim();
  const x: LetterExtras = data.extras || {};
  const sib = x.siblings ? ` e ${x.siblings}` : "";
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  const openings = [
    `Hoje de manhã, quando os duendes entregaram a pilha de cartas, a sua estava brilhando tanto que a Mamãe Noel precisou colocar óculos escuros! Dei uma gargalhada tão grande que a minha barba balançou feito gelatina.`,
    `Você não vai acreditar: assim que vi o seu nome na pilha de cartas, o meu gorro saiu voando de alegria e foi parar no nariz de uma rena! Os duendes riram tanto que derrubaram uma caixa inteira de bolinhas de Natal.`,
    `Aqui no Polo Norte a notícia correu rápido: os duendes fizeram uma festa com chocolate quente e dança na neve só para comemorar o ano incrível que você teve aí em ${city}!`,
  ];
  const missions = [
    `até o dia 24, dê um abraço surpresa em alguém da sua casa e conte uma coisa que você admira nessa pessoa. Os duendes vão anotar tudo no Livro Dourado!`,
    `faça um desenho bem bonito para o Papai Noel e deixe na janela na noite de Natal. Prometo dar uma espiadinha lá do trenó!`,
    `ajude alguém da sua família numa tarefa (pôr a mesa, guardar os brinquedos ou regar uma plantinha) sem ninguém pedir. É uma magia secreta que faz o Natal brilhar mais!`,
  ];
  const farewells = [
    `Até a noite de Natal, ${name}! Vou passar pertinho da sua casa e mandar um tchauzinho lá do trenó.`,
    `Fique de olho no céu na véspera de Natal, ${name}: se vir uma luzinha vermelha piscando, sou eu acenando para você!`,
    `Um abraço quentinho do tamanho do Polo Norte, ${name}! Nos vemos na noite mais mágica do ano.`,
  ];
  const ps = x.pet
    ? `P.S.: Mande um abraço bem apertado para ${x.pet}! As renas querem muito conhecer esse amigo especial.`
    : x.food
      ? `P.S.: Os duendes descobriram que você adora ${x.food} e agora querem provar também. Será que sobra um pedacinho para eles?`
      : x.friend
        ? `P.S.: Diga ao(à) ${x.friend} que o Papai Noel mandou um oi bem animado!`
        : pick([
            `P.S.: A Mamãe Noel pediu para avisar que fez biscoitos com o seu nome escrito em chocolate. Eu já comi dois... shhh, não conte para ela!`,
            `P.S.: Uma das renas tentou ler a sua carta e acabou espirrando purpurina na oficina inteira. Agora está tudo brilhando!`,
          ]);
  const paras: string[] = [];
  paras.push(`Ho Ho Ho! Olá, ${name}${sib}, meu ajudante favorito de ${city}!`);
  paras.push(pick(openings));
  paras.push(
    `Abri o Grande Livro Dourado na sua página e li, com o coração cheio de orgulho, que neste ano, aos ${age} anos, ${achLine}! Isso é coisa de criança muito especial, ${name}. A Mamãe Noel e os duendes bateram palmas na hora.${isPro ? " Cada passo seu mostra o quanto você é corajoso(a), esforçado(a) e cheio(a) de luz." : ""}`,
  );
  paras.push(
    gift
      ? `Eu mesmo anotei o seu pedido no Grande Livro Dourado com a minha caneta de pena brilhante: ${gift}. Os duendes já sabem e estão trabalhando com muito carinho na oficina.`
      : `Os duendes estão trabalhando com muito carinho na oficina, preparando um Natal cheio de surpresas e alegria para a sua casa.`,
  );
  paras.push(
    parentNotes
      ? `E a sua família me mandou um recadinho especial para você: “${parentNotes}”. Guarde isso no coração, porque o amor da família é a magia mais forte que existe.`
      : `A sua família tem muito orgulho de você e um amor do tamanho do céu estrelado. Esse é o presente mais bonito de todos.`,
  );
  paras.push(`🎯 Missão secreta de Natal: ${pick(missions)}`);
  paras.push(pick(farewells));
  paras.push(ps);
  return paras.join("\n\n");
}
__name(generateFallbackLetter, "generateFallbackLetter");
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Carta M\xE1gica API",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    supabaseConfigured: db.usingSupabase(),
    paymentsConfigured: asaas.asaasConfigured(),
    webhookConfigured: Boolean(process.env.ASAAS_WEBHOOK_TOKEN),
    emailConfigured: mailer.emailConfigured(),
    timestamp: new Date().toISOString(),
  });
});
app.get("/api/letters", requireAdmin, async (_req, res) => {
  try {
    res.json(await db.listLetters());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar cartas" });
  }
});

// ======================= Correio do Polo Norte =======================
// A criança escreve a cartinha (à mão, na folha timbrada, ou digitada). Os pais mandam a foto.
// A foto é lida na hora pela IA e NUNCA é guardada: só o texto lido fica no banco.
type ReadLetter = { text: string; wishes: ChildLetter["wishes"]; sensitive: boolean; why: string };
const SENSITIVE_WORDS = /\b(morreu|faleceu|c[eé]u|separa|divorc|briga|bateu|apanh|hospital|doen[cç]a|c[aâ]ncer|remédio|tratamento|triste|chorar|medo|fome|sem casa|bebida|b[eê]bado|machuc)/i;
function emptyWishes() {
  return { pedidos: [] as string[], perguntas: [] as string[], contou: [] as string[] };
}
function cleanList(v: unknown, max = 6) {
  return (Array.isArray(v) ? v : []).map((x) => sanitizeText(x, 120)).filter(Boolean).slice(0, max);
}
/** Lê a cartinha (foto ou texto) e tira pedidos, perguntas e o que a criança contou. */
async function readChildLetter(input: { imageBase64?: string; mime?: string; text?: string }): Promise<ReadLetter> {
  const ai = getGeminiClient();
  const typed = sanitizeText(input.text, 1500);
  const instruction = `Você trabalha no Correio do Polo Norte e lê as cartinhas que as crianças escrevem para o Papai Noel.
${input.imageBase64 ? "Leia a cartinha manuscrita na imagem (pode ter erros de ortografia, letras invertidas e desenhos; interprete com carinho e NÃO corrija o que a criança quis dizer)." : "Leia a cartinha abaixo."}
Responda SOMENTE um JSON com este formato exato:
{"transcricao":"texto da cartinha, fiel ao que a criança escreveu, corrigindo só a ortografia para ficar legível","pedidos":["cada presente ou desejo pedido"],"perguntas":["cada pergunta que a criança fez ao Papai Noel"],"contou":["coisas que ela contou sobre ela: conquistas, família, bichinho, escola"],"sensivel":false,"motivo":""}
Marque "sensivel": true (e explique em "motivo") se a cartinha falar de luto, morte, doença grave, separação dos pais, violência, fome, medo ou tristeza profunda. Se a imagem não for uma cartinha (ou não der para ler nada), devolva "transcricao":"" e listas vazias.${typed ? `\n\nCARTINHA:\n"""${typed}"""` : ""}`;
  if (ai) {
    for (const model of LETTER_MODELS) {
      try {
        const parts: any[] = [{ text: instruction }];
        if (input.imageBase64) parts.push({ inlineData: { mimeType: input.mime || "image/jpeg", data: input.imageBase64 } });
        const resp = await ai.models.generateContent({ model, contents: [{ parts }], config: { temperature: 0.2, responseMimeType: "application/json" } });
        const raw = String(resp?.text || "").trim().replace(/^```json\s*|```$/g, "");
        const j = JSON.parse(raw);
        const text = sanitizeText(j.transcricao, 1500);
        const wishes = { pedidos: cleanList(j.pedidos), perguntas: cleanList(j.perguntas), contou: cleanList(j.contou, 8) };
        const sensitive = Boolean(j.sensivel) || SENSITIVE_WORDS.test(text);
        return { text, wishes, sensitive, why: sanitizeText(j.motivo, 200) };
      } catch (e: any) {
        console.warn(`Leitura da cartinha (${model}) falhou:`, e?.message || e);
      }
    }
  }
  // sem IA: usa o texto digitado como está
  const text = typed;
  return { text, wishes: emptyWishes(), sensitive: SENSITIVE_WORDS.test(text), why: "" };
}

/** Quando a resposta fica visível para a criança, conforme a escolha dos pais. */
function deliveryDate(when: unknown): string | null {
  const w = String(when || "agora");
  const now = new Date();
  const y = now.getFullYear();
  // horário de Brasília (UTC-3), independente do fuso do servidor
  const at = (m: number, d: number, h: number) => {
    const dt = new Date(Date.UTC(y, m, d, h + 3, 0, 0));
    return dt < now ? null : dt.toISOString(); // se já passou, entrega agora
  };
  if (w === "3dias") return new Date(now.getTime() + 3 * 864e5).toISOString();
  if (w === "vespera") return at(11, 24, 19); // 24/12 às 19h
  if (w === "natal") return at(11, 25, 7); // 25/12 às 7h
  return null;
}

app.post("/api/correio", async (req, res) => {
  try {
    const { childName, age, city, parentalConsent, parentNotes = "", achievements = "", style = "mágico" } = req.body || {};
    if (parentalConsent !== true) return res.status(400).json({ error: "É preciso confirmar que você é o responsável pela criança e autoriza o uso dos dados." });
    if (!childName || !age || !city) return res.status(400).json({ error: "Preencha o nome, a idade e a cidade da criança." });
    const image = typeof req.body?.imageBase64 === "string" ? req.body.imageBase64.replace(/^data:[^;]+;base64,/, "") : "";
    const mime = /^image\/(jpeg|png|webp|heic|heif)$/.test(String(req.body?.mime)) ? String(req.body.mime) : "image/jpeg";
    const typed = sanitizeText(req.body?.text, 1500);
    if (!image && !typed) return res.status(400).json({ error: "Mande a foto da cartinha ou digite o que a criança escreveu." });
    if (image.length > 6_000_000) return res.status(413).json({ error: "A foto ficou grande demais. Tente outra foto ou uma mais próxima da folha." });
    const covered = await coveredByCode(req.body?.accessCode);
    if (!covered && tooMany(`correio:${ipOf(req)}`, 6, 24 * 60 * 60 * 1000)) {
      return res.status(429).json({ error: "Hoje já chegaram muitas cartinhas por aqui. Volte amanhã ou libere o Natal Completo.", limit: true });
    }
    // 1) o Polo Norte lê a cartinha (a foto é usada só aqui e descartada)
    const read = await readChildLetter({ imageBase64: image || undefined, mime, text: typed || undefined });
    if (!read.text && !typed) {
      return res.status(422).json({ error: "Não consegui ler a cartinha nessa foto. Tente com mais luz, a folha inteira aparecendo e sem sombra. Ou digite o texto dela." });
    }
    const childText = read.text || typed;
    // 2) o Papai Noel escreve a resposta
    const plan = covered ? covered.plan : "free";
    const isPro = plan !== "free";
    const extras = cleanExtras(req.body?.extras);
    const giftRequest = read.wishes.pedidos.slice(0, 3).join(", ");
    const composed = await composeLetter({
      childName, age, city, achievements: String(achievements), giftRequest, parentNotes: String(parentNotes), style: String(style),
      extras, extrasText: extrasForPrompt(extras), toneDesc: TONES[String(style)] ?? TONES["mágico"], isPro,
      childLetter: { text: childText, wishes: read.wishes },
    });
    const theme = LETTER_THEME_IDS.includes(String(req.body?.theme)) ? String(req.body.theme) : "classico";
    const token = `${String(childName).toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now().toString(36)}`;
    const previewKey = randomBytes(12).toString("base64url");
    const protocol = await db.nextProtocol().catch(() => undefined);
    const rec = {
      id: `cm-${Date.now()}`,
      childName, age: Number(age), city, achievements: String(achievements), giftRequest, parentNotes: String(parentNotes), style: String(style), theme,
      parentId: (await currentParent(req))?.id,
      plan: covered ? covered.plan : "free",
      accessCode: covered ? covered.code : undefined,
      parentalConsentAt: new Date().toISOString(),
      content: composed.content,
      date: new Date().toLocaleDateString("pt-BR"),
      token, deliveryStatus: "awaiting_approval",
      childText, wishes: read.wishes, previewKey, protocol,
      // tema sensível: a resposta fica retida até alguém da equipe revisar
      reviewStatus: read.sensitive ? "pending" : undefined,
      // até os pais aprovarem, a carta não aparece para a criança
      deliverAt: "2099-01-01T00:00:00.000Z",
    };
    await db.insertLetter(rec as any);
    if (read.sensitive) console.warn(`[correio] carta ${token} retida para revisão: ${read.why}`);
    res.json({
      success: true,
      token, previewKey, protocol,
      childText, wishes: read.wishes,
      sensitive: read.sensitive,
      letter: { ...rec, previewKey: undefined },
      generatedWithAI: composed.generatedWithAI,
    });
  } catch (err: any) {
    console.error("Erro no correio:", err?.message || err);
    res.status(500).json({ error: "O Correio do Polo Norte está com muita neve agora. Tente de novo em instantes." });
  }
});

/** Os pais aprovam a resposta e escolhem quando ela chega para a criança. */
app.post("/api/correio/aprovar", async (req, res) => {
  try {
    const letter = await db.findLetter(String(req.body?.token || "").toLowerCase());
    if (!letter) return res.status(404).json({ error: "Carta não encontrada." });
    const me = await currentParent(req);
    const owner = (letter.previewKey && req.body?.previewKey === letter.previewKey) || (me && letter.parentId === me.id);
    if (!owner) return res.status(403).json({ error: "Só quem enviou a cartinha pode aprovar a resposta." });
    if (letter.reviewStatus === "pending") {
      return res.status(409).json({ error: "Esta resposta está em revisão carinhosa pela nossa equipe. Avisaremos assim que for liberada.", review: true });
    }
    const when = String(req.body?.when || "agora");
    const deliverAt = deliveryDate(when);
    await db.updateLetter(letter.id, { deliverAt: deliverAt ?? (null as any), deliveryStatus: deliverAt ? "scheduled" : "digital_only" });
    if (me && !letter.parentId) await db.updateLetter(letter.id, { parentId: me.id }).catch(() => {});
    // e-mail para os pais com o link (se o e-mail estiver configurado)
    const email = me?.email;
    if (email) {
      const site = siteUrlFrom(req);
      await mailer.sendLetterLink({ to: email, childName: letter.childName, letterUrl: `${site}/natal/${letter.token}`, siteUrl: site }).catch(() => false);
    }
    res.json({ ok: true, deliverAt, when });
  } catch (err: any) {
    console.error("correio/aprovar:", err?.message || err);
    res.status(500).json({ error: "Não foi possível agendar agora." });
  }
});

// Equipe: cartas retidas para revisão (tema sensível)
app.get("/api/admin/revisao", requireAdmin, async (_req, res) => {
  res.json(await db.lettersPendingReview());
});
app.post("/api/admin/revisao/:token", requireAdmin, async (req, res) => {
  const letter = await db.findLetter(String(req.params.token).toLowerCase());
  if (!letter) return res.status(404).json({ error: "Carta não encontrada." });
  const ok = req.body?.approve !== false;
  await db.updateLetter(letter.id, { reviewStatus: ok ? "approved" : "blocked", ...(ok ? {} : { deliverAt: "2099-01-01T00:00:00.000Z" }) });
  res.json({ ok: true });
});
// ===================================================================

app.get("/api/letter/:token", async (req, res) => {
  try {
    const letter = await db.findLetter(req.params.token);
    if (!letter) {
      return res.status(404).json({ error: "Carta n\xE3o encontrada" });
    }
    // Correio do Polo Norte: quem enviou (chave de prévia ou conta) vê tudo; a criança só depois da entrega
    const me = letter.parentId ? await currentParent(req) : null;
    const owner = (letter.previewKey && req.query.k === letter.previewKey) || (me && me.id === letter.parentId);
    const locked = letter.deliverAt && Date.parse(letter.deliverAt) > Date.now();
    const blocked = letter.reviewStatus === "pending" || letter.reviewStatus === "blocked";
    res.setHeader("Cache-Control", "no-store");
    if (!owner && (locked || blocked)) {
      return res.status(423).json({
        error: blocked ? "Esta carta ainda está sendo preparada no Polo Norte." : "A carta do Papai Noel ainda está a caminho!",
        locked: true,
        deliverAt: blocked ? undefined : letter.deliverAt,
        childName: letter.childName,
        protocol: letter.protocol,
      });
    }
    const { previewKey, ...pub } = letter;
    if (!owner) {
      // a criança não vê a transcrição da própria cartinha nem a lista de desejos (isso é dos pais)
      delete (pub as any).childText;
      delete (pub as any).wishes;
    }
    res.json(pub);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar a carta" });
  }
});

/** Confere se o código de um pedido pago ainda tem carta completa sobrando. */
async function codeStatus(raw: unknown) {
  const code = String(raw ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (code.length !== 6) return null;
  const order = await db.findPaidOrderByCode(code);
  if (!order) return null;
  const limit = asaas.PLAN_LETTERS[order.plan] ?? 1;
  const extra = await db.countLettersByCode(code);
  if (extra === null) return { code, plan: order.plan, limit, used: limit, remaining: 0 };
  const used = (order.letterId ? 1 : 0) + extra; // a carta do pagamento (se pagou junto com uma carta) + as outras
  return { code, plan: order.plan, limit, used, remaining: Math.max(0, limit - used), children: asaas.PLAN_CHILDREN[order.plan] ?? 1 };
}
async function coveredByCode(raw: unknown) {
  if (!raw) return null;
  try {
    const st = await codeStatus(raw);
    return st && st.remaining > 0 ? { code: st.code, plan: st.plan as any } : null;
  } catch {
    return null;
  }
}
app.get("/api/access/status/:code", async (req, res) => {
  if (tooMany(`status:${ipOf(req)}`, 40, 10 * 60 * 1000)) return res.status(429).json({ error: "Muitas tentativas." });
  try {
    const st = await codeStatus(req.params.code);
    if (!st) return res.status(404).json({ error: "Código não encontrado." });
    res.setHeader("Cache-Control", "no-store");
    res.json({ plan: st.plan, limit: st.limit, used: st.used, remaining: st.remaining, children: (st as any).children ?? 1 });
  } catch {
    res.status(500).json({ error: "Erro ao conferir o código." });
  }
});
/** Escreve a carta (IA com modelos reserva; se tudo falhar, a carta reserva). childLetter = resposta ao Correio do Polo Norte. */
const LETTER_MODELS = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash"];
type ChildLetter = { text: string; wishes: { pedidos: string[]; perguntas: string[]; contou: string[] } };
async function composeLetter(o: {
  childName: string; age: number | string; city: string; achievements: string; giftRequest: string; parentNotes: string;
  style: string; extras: LetterExtras; extrasText: string; toneDesc: string; isPro: boolean; childLetter?: ChildLetter;
}) {
  const { childName, age, city, achievements, giftRequest, parentNotes, style, extras, extrasText, toneDesc, isPro, childLetter } = o;
  let letterContent = "";
  let generatedWithAI = false;
  const ai = getGeminiClient();
  if (ai) {
    try {
      const systemInstruction = `Você é o verdadeiro Papai Noel escrevendo, de próprio punho, uma carta mágica, divertida e emocionante para uma criança brasileira de ${age} anos. A carta será lida em voz alta pelos pais ou pela voz do Papai Noel, então escreva para a CRIANÇA entender e se encantar: frases curtas, palavras simples, muita imaginação e humor carinhoso.

ESTRUTURA (cada parte em um parágrafo separado por uma linha em branco):
1. SAUDAÇÃO: uma única linha animada e criativa com o nome, por exemplo "Ho Ho Ho! Olá, ${childName}, meu ajudante favorito de ${city}!". Varie: não repita sempre a mesma frase.
2. ABERTURA MÁGICA: conte uma cena engraçada ou surpreendente que acabou de acontecer COM O PRÓPRIO PAPAI NOEL no Polo Norte por causa da criança (ex.: deu uma gargalhada tão grande que a barba balançou; o gorro saiu voando de alegria ao ler o nome dela; os duendes fizeram uma festa). Seja inventivo e diferente a cada carta.
3. CONQUISTAS (OBRIGATÓRIO): cite UMA POR UMA, de forma explícita e concreta, TODAS as conquistas que a família escreveu (ex.: se escreveram "aprendeu matemática, foi obediente e passou de ano", a carta precisa falar da matemática, da obediência e de ter passado de ano). Corrija a ortografia do que os pais digitaram, sem mudar o sentido. Lembre a idade e a cidade.
4. PEDIDO DE NATAL: diga que o próprio Papai Noel anotou o pedido (${giftRequest || "uma surpresa especial"}) no Grande Livro Dourado, com carinho e sem prometer que o presente vai chegar.
5. CARINHO DA FAMÍLIA: ${parentNotes ? `inclua com delicadeza o recado dos responsáveis: "${parentNotes}".` : "lembre que a família tem muito orgulho e amor por ela."}
6. MISSÃO SECRETA: um parágrafo que começa exatamente com "🎯 Missão secreta de Natal:" e traz uma pequena missão gentil e divertida para a criança cumprir até o Natal (ex.: dar um abraço surpresa em alguém, ajudar a pôr a mesa, desenhar algo para o Papai Noel e deixar na janela). Uma frase ou duas.
7. DESPEDIDA: uma frase final criativa e carinhosa que use o nome da criança e uma imagem divertida do Polo Norte (ex.: "Até a noite de Natal, ${childName}! Vou passar pertinho da sua casa e mandar um tchauzinho lá do trenó."). NÃO escreva assinatura nem "Papai Noel" no final: a assinatura já aparece desenhada na carta.
8. P.S.: depois da despedida, um parágrafo que começa com "P.S.:" curtinho e engraçado, envolvendo o Papai Noel, a Mamãe Noel ou os duendes e, se houver, um detalhe pessoal da criança (bichinho, comida, amigo ou brincadeira favorita).
${childLetter ? `\nA CARTINHA QUE A CRIANÇA ESCREVEU (ela mesma escreveu para o Papai Noel; esta carta é a RESPOSTA):\n"""${childLetter.text.slice(0, 1500)}"""\n- Pedidos que ela fez: ${childLetter.wishes.pedidos.join("; ") || "nenhum"}\n- Perguntas que ela fez: ${childLetter.wishes.perguntas.join("; ") || "nenhuma"}\n- O que ela contou: ${childLetter.wishes.contou.join("; ") || "nada em especial"}\nREGRAS DA RESPOSTA: comece dizendo que a carta dela CHEGOU no Polo Norte (fale de algo específico que ela escreveu ou desenhou); RESPONDA CADA PERGUNTA dela com carinho e imaginação (isso é o que mais encanta); cite os pedidos dizendo que anotou no Grande Livro Dourado, sem prometer; se ela pediu algo para outra pessoa, elogie o coração generoso; nunca corrija a letra ou a ortografia dela, só elogie o capricho.\n` : ""}${extrasText ? `\nDETALHES PESSOAIS (use TODOS, de forma natural e espalhada pela carta — é isso que faz a família se emocionar):\n${extrasText}\n` : ""}
REGRAS IMPORTANTES:
- O protagonista é sempre o Papai Noel. Fale de "as renas", "os duendes" e "a Mamãe Noel" de forma genérica: NUNCA cite personagens de filmes, desenhos ou marcas (por exemplo, não use o nome "Rudolph").
- NUNCA use chantagem ("se não obedecer não ganha presente") nem prometa presentes. O Papai Noel é pura bondade e aconchego.
- Use no máximo 3 emojis na carta toda, além do 🎯 da missão.
- Use o nome da criança pelo menos 3 vezes ao longo da carta.
- Tudo o que a família escreveu (conquistas, pedido e recado) TEM que aparecer na carta. Antes de terminar, confira se nada ficou de fora.
- Escreva com ortografia e acentuação perfeitas: esta carta será impressa e guardada pela criança para sempre.
- Tom da carta: ${toneDesc}.
- Tamanho: ${isPro ? "carta completa e caprichada, com cerca de 230 a 300 palavras" : "carta acolhedora com cerca de 150 a 190 palavras"}.
- Idioma: português do Brasil, simples, mágico e afetuoso. Escreva somente a carta, sem títulos nem marcações.`;
      const userPrompt = `Escreva a carta de Natal personalizada com as informa\xE7\xF5es:
- Crian\xE7a: ${childName}
- Idade: ${age} anos
- Cidade: ${city}
- Conquistas e atitudes especiais (citar TODAS na carta): ${achievements || "Foi gentil e espalhou alegria"}
- Pedido de presente na cartinha: ${giftRequest || "Um presente feito com amor"}
- Palavras especiais dos pais/respons\xE1veis: ${parentNotes || "Nenhum detalhe extra"}
${extrasText ? `${extrasText}\n` : ""}- Plano: ${isPro ? "PRO (m\xE1xima profundidade emocional, detalhes sensoriais e magia liter\xE1ria)" : "Gratuito (b\xE1sica, terna e envolvente)"}
- Estilo: ${style}${childLetter ? `\n- Esta carta é a RESPOSTA à cartinha que a criança enviou (veja as instruções). Responda tudo o que ela perguntou.` : ""}`;
      // se um modelo falhar (fila cheia, instabilidade), tenta o próximo antes de usar a carta reserva
      for (const model of LETTER_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: userPrompt,
            config: { systemInstruction, temperature: 0.9 },
          });
          const txt = response?.text?.trim();
          if (txt && txt.length > 200) {
            letterContent = txt;
            generatedWithAI = true;
            break;
          }
        } catch (e) {
          console.warn(`Gemini (${model}) falhou:`, e?.message || e);
        }
      }
    } catch (err) {
      console.warn(
        "Gemini API call failed, falling back to local generator:",
        err?.message || err,
      );
    }
  }
  if (!letterContent && childLetter) {
    // sem IA: a carta reserva ganha um parágrafo sobre a cartinha que a criança mandou
    const w = childLetter.wishes;
    const perguntas = w.perguntas.length ? ` Você me perguntou: "${w.perguntas[0]}". Que pergunta boa! Aqui no Polo Norte a resposta é sempre cheia de magia, e eu adoro quando você fica curioso(a).` : "";
    const pedidos = w.pedidos.length ? ` Anotei no Grande Livro Dourado tudo o que você pediu: ${w.pedidos.join(", ")}. Os duendes já estão de olho!` : "";
    const extraPara = `A sua cartinha chegou aqui no Polo Norte e foi direto para a minha mesa! Li cada palavrinha com os meus óculos de aumento e fiquei encantado com o seu capricho.${perguntas}${pedidos}`;
    const base = generateFallbackLetter({ childName, age: Number(age), city, achievements, giftRequest, parentNotes, style, extras, plan: isPro ? "pro" : "free" });
    const paras = base.split("\n\n");
    paras.splice(1, 0, extraPara);
    letterContent = paras.join("\n\n");
  }
  if (!letterContent) {
    letterContent = generateFallbackLetter({
      childName,
      age: Number(age),
      city,
      achievements,
      giftRequest,
      parentNotes,
      style,
      extras,
      plan: isPro ? "pro" : "free",
    });
  }
  return { content: letterContent, generatedWithAI };
}

const LETTER_THEME_IDS = ["classico", "rosa", "lilas", "azul", "verde"];
app.post("/api/generate-letter", async (req, res) => {
  try {
    const {
      childName,
      age,
      city,
      achievements,
      giftRequest,
      parentNotes,
      style = "m\xE1gico",
      photoUrl,
      parentalConsent,
    } = req.body;
    // irmãos: o código do pedido pago cobre mais cartas completas (2 no plano Carta Completa, 5 no Família)
    const covered = parentalConsent === true ? await coveredByCode(req.body?.accessCode) : null;
    const plan = covered ? covered.plan : req.body?.plan || "free";
    // carta grátis: limite por dia (a IA tem custo). Por aparelho é 3; aqui é um teto por rede, mais folgado.
    if (!covered && tooMany(`gen:${ipOf(req)}`, 15, 24 * 60 * 60 * 1000)) {
      return res.status(429).json({
        error: "Hoje já foram criadas muitas cartas grátis por aqui. Volte amanhã ou libere o Natal Completo para criar as cartas completas dos seus filhos.",
        limit: true,
      });
    }
    const extras = cleanExtras(req.body?.extras);
    const theme = LETTER_THEME_IDS.includes(String(req.body?.theme)) ? String(req.body.theme) : "classico";
    const toneDesc = TONES[String(style)] ?? TONES["mágico"];
    const extrasText = extrasForPrompt(extras);
    // LGPD art. 14: exige consentimento do responsável antes de tratar dados da criança
    if (parentalConsent !== true) {
      return res.status(400).json({
        error: "É preciso confirmar que você é o responsável pela criança e autoriza o uso dos dados.",
      });
    }
    if (!childName || !age || !city) {
      return res
        .status(400)
        .json({
          error:
            "Campos obrigat\xF3rios ausentes (nome da crian\xE7a, idade e cidade).",
        });
    }
    // o plano pedido só define o tamanho da carta; o acesso pago só é liberado
    // depois que o Asaas confirma o pagamento (webhook)
    const isPro = plan === "pro" || plan === "natal" || plan === "familia";
    const composed = await composeLetter({ childName, age, city, achievements, giftRequest, parentNotes, style, extras, extrasText, toneDesc, isPro });
    const letterContent = composed.content;
    const generatedWithAI = composed.generatedWithAI;
    const token = `${childName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now().toString(36)}`;
    const newRecord = {
      id: `cm-${Date.now()}`,
      childName,
      age: Number(age),
      city,
      achievements: achievements || "",
      giftRequest: giftRequest || "",
      parentNotes: parentNotes || "",
      style,
      theme,
      parentId: (await currentParent(req))?.id,
      plan: covered ? covered.plan : "free",
      accessCode: covered ? covered.code : undefined,
      parentalConsentAt: new Date().toISOString(),
      content: letterContent,
      date: new Date().toLocaleDateString("pt-BR"),
      token,
      photoUrl,
      deliveryStatus: "digital_only",
    };
    await db.insertLetter(newRecord as any);
    return res.json({
      success: true,
      letter: newRecord,
      generatedWithAI,
      shareUrl: `/natal/${newRecord.token}`,
    });
  } catch (error) {
    console.error("Error generating letter:", error);
    res
      .status(500)
      .json({ error: "Falha ao gerar a carta m\xE1gica. Tente novamente." });
  }
});
// guarda áudios já gerados (mesmo texto = mesma voz), para não pagar duas vezes
const ttsCache = new Map<string, string>();
/** Deixa a carta gostosa de ouvir: sem emojis, com transições faladas e a despedida do Papai Noel. */
function speechText(content: string, voiceId: string) {
  let t = String(content || "")
    .replace(/🎯\s*Miss[aã]o secreta de Natal:?/gi, "E agora... uma missão secreta de Natal, só para você:")
    .replace(/^\s*P\.?\s?S\.?:?/gim, "Ah... e antes que eu me esqueça:")
    .replace(/\((a|o|as|os)\)/g, "")
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, "")
    .replace(/[ \t]+/g, " ")
    .trim();
  if (voiceId === "noel" || voiceId === "noel-alegre") t += "\n\nCom todo o carinho do Polo Norte... Papai Noel. Ho ho ho!";
  return t;
}
/** Ajusta o texto para a voz ler sem tropeçar: números, abreviações e pontuação que confunde a leitura. */
const UNITS = ["zero","um","dois","três","quatro","cinco","seis","sete","oito","nove","dez","onze","doze","treze","quatorze","quinze","dezesseis","dezessete","dezoito","dezenove"];
const TENS = ["","","vinte","trinta","quarenta","cinquenta","sessenta","setenta","oitenta","noventa"];
function numberWords(n: number): string {
  if (n < 20) return UNITS[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? " e " + UNITS[n % 10] : "");
  if (n === 100) return "cem";
  return String(n);
}
function elevenText(t: string) {
  return t
    .replace(/\bSr\.\s?/g, "Senhor ")
    .replace(/\bSra\.\s?/g, "Senhora ")
    .replace(/\bDr\.\s?/g, "Doutor ")
    .replace(/\bvc\b/gi, "você")
    .replace(/\bpq\b/gi, "porque")
    .replace(/\b(\d{1,2})\s?anos\b/g, (_m, d) => `${numberWords(Number(d))} anos`)
    .replace(/\b(\d{1,2})º/g, (_m, d) => `${numberWords(Number(d))}º`)
    .replace(/Ho\s*,?\s*ho\s*,?\s*ho/gi, "Ho, ho, ho")
    .replace(/[“”"]/g, "")
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/!{2,}/g, "!")
    .replace(/\.{4,}/g, "...")
    .replace(/\n{3,}/g, "\n\n")
    .slice(0, 4500);
}
app.post("/api/tts", async (req, res) => {
  try {
    const { token, adventDay, name, voiceId, treeToken, ornamentId } = req.body || {};
    let voice = voiceById(voiceId);
    // a voz só é gerada para textos do próprio site (carta salva ou recado do calendário),
    // nunca para um texto qualquer vindo do navegador
    let text = "";
    let childName = "";
    let paidLetter = false;
    if (treeToken) {
      // Modo Ceia da árvore: o Papai Noel lê a frase de um enfeite
      const t = await db.findTree(String(treeToken).toLowerCase());
      const o: any = t?.ornaments.find((x: any) => x.id === ornamentId);
      if (!o?.text) return res.status(404).json({ error: "Frase n\xE3o encontrada." });
      childName = String(o.author || "");
      text = `${o.text}${o.author ? `\n\nCom carinho, ${o.author}.` : ""}`;
      voice = voiceById("noel");
    } else if (adventDay) {
      const d = ADVENT_DAYS.find((x) => x.day === Number(adventDay));
      if (!d || d.activity.type !== "message") {
        return res.status(404).json({ error: "Recado n\xE3o encontrado." });
      }
      childName = String(name || "").replace(/[^\p{L} ]/gu, "").trim().slice(0, 20) || "crian\xE7a querida";
      text = d.activity.text.replace(/\{nome\}/g, childName);
      voice = voiceForSender(d.activity.from);
    } else {
      const letterRec = await db.findLetter(String(token || ""));
      if (!letterRec) {
        return res.status(404).json({ error: "Carta n\xE3o encontrada." });
      }
      childName = letterRec.childName;
      const paras = String(letterRec.content || "").split(/\n\s*\n/).filter(Boolean);
      const paidVoice = letterRec.plan === "pro" || letterRec.plan === "natal" || letterRec.plan === "familia";
      paidLetter = paidVoice;
      // outras vozes são do plano pago
      if (!paidVoice) voice = voiceById("noel");
      text = paidVoice ? speechText(letterRec.content, voice.id) : speechText(paras.slice(0, 2).join("\n\n"), "");
    }
    if (!text) {
      return res
        .status(400)
        .json({ error: "Texto n\xE3o fornecido para s\xEDntese de voz." });
    }
    // 1) ElevenLabs: pronúncia certinha em português. Cada texto é narrado UMA vez e fica guardado.
    const freeLetter = !treeToken && !adventDay && !paidLetter;
    const elevenOk = eleven.elevenEnabled() && (!freeLetter || process.env.ELEVENLABS_GRATIS !== "nao");
    if (elevenOk) {
      const spoken = elevenText(freeLetter ? text.slice(0, 650) : text);
      const key = `tts/${createHash("sha256").update(`${voice.id}|${freeLetter ? "flash" : "v2"}|${spoken}`).digest("hex").slice(0, 40)}.mp3`;
      try {
        let audioUrl = await audioStore.url(key).catch(() => null);
        if (!audioUrl) {
          if (tooMany(`eleven:${ipOf(req)}`, 30, 60 * 60 * 1000)) throw new Error("limite de narrações por hora");
          const mp3 = await eleven.speak(spoken, voice.id, { cheap: freeLetter });
          const saved = await audioStore.put(key, mp3, "audio/mpeg");
          audioUrl = saved ? await audioStore.url(key) : null;
          if (!audioUrl) {
            return res.json({ success: true, provider: "elevenlabs", mime: "audio/mpeg", audioBase64: mp3.toString("base64") });
          }
        }
        return res.json({ success: true, provider: "elevenlabs", mime: "audio/mpeg", audioUrl });
      } catch (e: any) {
        console.warn("ElevenLabs TTS falhou, usando a voz do Google:", e?.message || e);
      }
    }
    const ai = getGeminiClient();
    const cacheKey = `${voice.id}|${text}`;
    let audioBase64 = ttsCache.get(cacheKey) ?? null;
    let provider = audioBase64 ? "gemini_tts" : "web_speech_fallback";
    if (ai && !audioBase64) {
      try {
        const ttsResponse = await ai.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: [
            {
              parts: [
                {
                  text: `${voice.style}\n\nLeia em português do Brasil, com naturalidade, respeitando as pausas de cada parágrafo. Não leia estas instruções, só o texto abaixo.\n\n${String(text).slice(0, 2800)}`,
                },
              ],
            },
          ],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              languageCode: "pt-BR",
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voice.gemini,
                },
              },
            },
          },
        });
        const part = ttsResponse.candidates?.[0]?.content?.parts?.[0];
        if (part && "inlineData" in part && part.inlineData?.data) {
          audioBase64 = part.inlineData.data;
          provider = "gemini_tts";
          if (ttsCache.size > 150) ttsCache.delete(ttsCache.keys().next().value as string);
          ttsCache.set(cacheKey, audioBase64 as string);
        }
      } catch (ttsErr) {
        console.warn(
          "Gemini TTS preview fallback active:",
          ttsErr?.message || ttsErr,
        );
      }
    }
    res.json({
      success: true,
      provider,
      audioBase64,
      voiceConfig: {
        tone: "Papai Noel (Grave, Caloroso, Natalino)",
        suggestedPitch: 0.65,
        suggestedRate: 0.88,
        lang: "pt-BR",
      },
      message:
        provider === "gemini_tts"
          ? "\xC1udio nativo do Papai Noel gerado com sucesso pelo Gemini TTS!"
          : "Sintetizador tem\xE1tico configurado com modula\xE7\xE3o de voz grave do Papai Noel.",
    });
  } catch (err) {
    res
      .status(500)
      .json({
        error: "Falha ao processar Text-to-Speech",
        details: err?.message,
      });
  }
});
app.post("/api/video/render-request", (req, res) => {
  try {
    const { letterId, childName, theme = "oficina_polo_norte" } = req.body;
    const videoJob = {
      jobId: `VEO-JOB-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      letterId: letterId || "demo",
      childName: childName || "Crian\xE7a",
      theme,
      engine: "Google Veo / Veo 3.1 Lite Avatar Pipeline",
      promptSpec: {
        scene:
          "Santa Claus sitting by a crackling warm fireplace in a wooden North Pole cabin, glowing Christmas tree, smiling gently and holding a parchment with the child's name written in gold ink",
        motion:
          "Gentle warm wave, twinkling eyes, breathing life into the camera",
        lighting: "Cinematic golden hour and northern lights glow",
        aspectRatio: "16:9",
      },
      status: "scheduled_for_christmas_eve",
      availabilityNote:
        "Estreia oficial do v\xEDdeo na v\xE9spera de Natal! Os duendes cinegrafistas est\xE3o preparando a anima\xE7\xE3o.",
      previewStillUrl:
        "https://images.unsplash.com/photo-1543258103-a62bdc069871?auto=format&fit=crop&w=1200&q=80",
      createdAt: new Date().toISOString(),
    };
    res.json({
      success: true,
      job: videoJob,
      message:
        "Estrutura do v\xEDdeo personalizada registrada com sucesso no pipeline do Polo Norte!",
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao agendar gera\xE7\xE3o de v\xEDdeo" });
  }
});
app.get("/api/video/status/:letterId", (req, res) => {
  const { letterId } = req.params;
  res.json({
    letterId,
    status: "coming_soon",
    featureName: "V\xEDdeo Personalizado do Papai Noel",
    availableInPlan: "pro",
    badge: "Em Breve para a Noite de Natal",
    description:
      "Uma experi\xEAncia em v\xEDdeo cinematogr\xE1fico onde o Papai Noel fala diretamente com a crian\xE7a na sua oficina m\xE1gica.",
  });
});
app.post("/api/generate-pdf", (req, res) => {
  try {
    const {
      letterId,
      childName,
      age,
      city,
      content,
      token,
      plan = "pro",
      photoUrl,
    } = req.body;
    const isPro = plan === "pro" || plan === "natal" || plan === "familia";
    const waterMarkHtml = !isPro
      ? `<div style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 11px; color: #9B021A; opacity: 0.7;">
          Vers\xE3o de Degusta\xE7\xE3o \u2022 Carta M\xE1gica (cartamagica.com.br)
         </div>`
      : "";
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Carta do Papai Noel - ${childName || "Especial"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
    
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Playfair Display', Georgia, serif;
      background: #FFFFFF;
      color: #1C2541;
      display: flex;
      justify-content: center;
    }
    
    .page-container {
      width: 100%;
      max-width: 210mm;
      min-height: 297mm;
      background: #FFFDF9 radial-gradient(#F5EDDA 1px, transparent 1px);
      background-size: 30px 30px;
      border: 3px double #C49A45;
      padding: 30px 40px;
      position: relative;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid rgba(28, 37, 65, 0.15);
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    
    .polar-tag {
      font-family: 'Cinzel', serif;
      font-size: 11px;
      font-weight: 900;
      color: #9B021A;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    
    .recipient-info {
      font-size: 13px;
      color: #333333;
    }
    
    .wax-seal {
      width: 65px;
      height: 65px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #EF233C 0%, #D90429 50%, #780016 100%);
      border: 2px solid #FFD166;
      color: #FFD166;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
    }
    
    .seal-text-top {
      font-family: 'Cinzel', serif;
      font-size: 8px;
      font-weight: 900;
      line-height: 1;
    }
    
    .seal-text-sub {
      font-size: 9px;
      font-weight: bold;
      margin-top: 2px;
    }
    
    .photo-portrait {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 18px;
    }
    
    .photo-frame {
      width: 70px;
      height: 70px;
      border-radius: 10px;
      border: 2px solid #C49A45;
      padding: 2px;
      background: #FFFDF9;
      box-shadow: 0 3px 8px rgba(0,0,0,0.15);
      overflow: hidden;
    }
    
    .photo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 6px;
    }
    
    .photo-caption {
      font-family: 'Cinzel', serif;
      font-size: 8px;
      font-weight: bold;
      color: #9B021A;
      margin-top: 3px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .letter-body {
      font-size: 15px;
      line-height: 1.8;
      color: #1A1A1A;
      white-space: pre-line;
      margin-bottom: 30px;
    }
    
    .footer {
      border-top: 1px solid rgba(28, 37, 65, 0.2);
      padding-top: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    
    .official-badge {
      font-family: 'Cinzel', serif;
      font-size: 10px;
      color: #9B021A;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .signature-box {
      text-align: right;
    }
    
    .signature-font {
      font-family: 'Great Vibes', cursive;
      font-size: 42px;
      color: #9B021A;
      line-height: 1;
      margin-bottom: 4px;
    }
    
    .signature-sub {
      font-size: 11px;
      color: #666666;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="header">
      <div style="display: flex; align-items: center;">
        ${
          photoUrl
            ? `
        <div class="photo-portrait">
          <div class="photo-frame">
            <img src="${photoUrl}" alt="${childName || "Crian\xE7a"}" class="photo-img" />
          </div>
          <div class="photo-caption">Retrato Oficial</div>
        </div>
        `
            : ""
        }
        <div>
          <div class="polar-tag">Via Tren\xF3 A\xE9reo Oficial \u2022 Polo Norte</div>
          <div class="recipient-info">
            Correspond\xEAncia para: <strong>${childName || "Crian\xE7a Especial"}</strong> (${age ? `${age} anos` : ""} \u2022 ${city || "Brasil"})
          </div>
        </div>
      </div>
      <div class="wax-seal">
        <div class="seal-text-top">POLO<br/>NORTE</div>
        <div class="seal-text-sub">OFICIAL</div>
      </div>
    </div>
    
    <div class="letter-body">${(content || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
    
    <div class="footer">
      <div>
        <div class="official-badge">Certificado de Bondade & Amor \u2022 Registro ${token || "OFICIAL"}</div>
        <div style="font-size: 11px; color: #777; margin-top: 3px;">Expresso Polar Oficial \u2022 Carta M\xE1gica</div>
      </div>
      <div class="signature-box">
        <div class="signature-font">Papai Noel</div>
        <div class="signature-sub">Oficina dos Duendes e Renas \u{1F98C} \u2022 Polo Norte</div>
      </div>
    </div>
    ${waterMarkHtml}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  <\/script>
</body>
</html>`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    res
      .status(500)
      .json({
        error: "Falha ao gerar vers\xE3o para impress\xE3o",
        details: err?.message,
      });
  }
});
function siteUrlFrom(req: any) {
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL;
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0];
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0];
  return `${proto}://${host}`;
}

// Cria um pedido pendente e a sessão de pagamento no Asaas (Pix ou cartão).
app.post("/api/checkout", async (req, res) => {
  try {
    const { letterId } = req.body || {};
    // Carta Completa (natal), Pacote Família (familia) ou troca de plano (upgrade). "pro" antigo vira "natal".
    // "avulsa" = Resposta Mágica de UMA cartinha do Correio (fica gravada como plano "pro": 1 carta)
    const plan: "natal" | "familia" | "upgrade" | "pro" | null =
      req.body?.plan === "upgrade" ? "upgrade" : req.body?.plan === "avulsa" ? "pro" : req.body?.plan === "familia" ? "familia" : asaas.isPaidPlan(req.body?.plan) ? "natal" : null;
    if (!plan) {
      return res.status(400).json({ error: "Plano inválido." });
    }
    let upgradeOf: string | undefined;
    if (plan === "upgrade") {
      const code = String(req.body?.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      const orig = await db.findPaidOrderByCode(code);
      if (!orig || orig.plan !== "natal") return res.status(400).json({ error: "Essa compra já é Pacote Família ou o código não foi encontrado." });
      upgradeOf = code;
    }
    // dá para pagar direto pelos planos, antes de criar a carta (ex.: quem já usou as 3 grátis do dia)
    const letter = letterId ? await db.findLetter(String(letterId)) : null;
    if (letterId && !letter) {
      return res.status(404).json({ error: "Carta não encontrada. Atualize a página e tente de novo." });
    }
    if (plan === "pro" && (!letter || letter.plan !== "free")) {
      return res.status(400).json({ error: letter ? "Esta cartinha já está liberada." : "A Resposta Mágica é para uma cartinha: abra a resposta e toque em liberar." });
    }
    if (!asaas.asaasConfigured()) {
      return res.status(503).json({
        error: "O pagamento ainda não está disponível. Tente novamente em breve.",
      });
    }
    const parent = await currentParent(req);
    if (parent && letter && !letter.parentId) await db.updateLetter(letter.id, { parentId: parent.id }).catch(() => {});
    const orderId = `cm${randomBytes(9).toString("base64url")}`;
    const price = { value: planPrice(plan) };
    await db.insertOrder({
      orderId,
      letterId: letter?.id ?? null,
      childName: letter?.childName ?? "Família",
      amount: price.value,
      plan,
      includePhysicalDispatch: false,
      status: "pending",
      paymentMethod: "Asaas (Pix / Cartão)",
      createdAt: new Date().toLocaleString("pt-BR"),
      ...(upgradeOf ? { upgradeOf } : {}),
    });
    if (parent?.email) await db.updateOrder(orderId, { customerEmail: parent.email }).catch(() => {});
    const checkout = await asaas.createCheckout({ orderId, plan, siteUrl: siteUrlFrom(req) });
    await db.updateOrder(orderId, { gatewayChargeId: checkout.id });
    res.json({ success: true, orderId, checkoutUrl: checkout.link });
  } catch (err: any) {
    const msg = String(err?.message || err);
    console.error("Erro no checkout:", msg);
    // mostra o motivo que o Asaas deu (não tem dado sigiloso) para facilitar a correção
    const asaasMsg = msg.startsWith("Asaas:") ? msg.slice(6).trim() : "";
    res.status(500).json({
      error: asaasMsg
        ? `O Asaas não abriu o pagamento: ${asaasMsg}`
        : "Não foi possível abrir o pagamento agora. Tente de novo em instantes.",
    });
  }
});

// A página consulta aqui, depois de voltar do Asaas, se o pagamento já foi confirmado.
app.get("/api/order/:orderId", async (req, res) => {
  try {
    const order = await db.findOrder(req.params.orderId);
    if (!order || order.orderId !== req.params.orderId) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }
    const letter = await db.findLetter(order.letterId);
    res.json({
      status: order.status,
      plan: order.plan,
      letterToken: order.status === "paid" ? letter?.token : undefined,
      accessCode: order.status === "paid" ? order.accessCode : undefined,
    });
  } catch {
    res.status(500).json({ error: "Erro ao consultar pedido" });
  }
});

// Código mágico: libera o plano pago em outro aparelho (celular, tablet...)
const redeemTries = new Map<string, { n: number; t: number }>();
app.post("/api/access/redeem", async (req, res) => {
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  const now = Date.now();
  const r = redeemTries.get(ip);
  if (r && now - r.t < 10 * 60 * 1000 && r.n >= 8) {
    return res.status(429).json({ error: "Muitas tentativas. Espere alguns minutos e tente de novo." });
  }
  redeemTries.set(ip, r && now - r.t < 10 * 60 * 1000 ? { n: r.n + 1, t: r.t } : { n: 1, t: now });
  try {
    const code = String(req.body?.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const order = await db.findPaidOrderByCode(code);
    if (!order) return res.status(404).json({ error: "Código não encontrado. Confira as letras e tente de novo." });
    const letter = await db.findLetter(order.letterId);
    res.json({ ok: true, plan: order.plan, letterToken: letter?.token, childName: letter?.childName });
  } catch {
    res.status(500).json({ error: "Erro ao conferir o código." });
  }
});

// Link compartilhado /natal/<token>: devolve a página com título e imagem
// próprios, para aparecer bonito no WhatsApp (o WhatsApp não roda JavaScript).
let indexHtmlCache: string | null = null;
async function loadIndexHtml(req: any): Promise<string | null> {
  if (indexHtmlCache) return indexHtmlCache;
  try {
    const fs = await import("fs");
    const local = path.join(process.cwd(), "dist", "index.html");
    if (fs.existsSync(local)) {
      indexHtmlCache = fs.readFileSync(local, "utf8");
      return indexHtmlCache;
    }
  } catch {
    /* na Vercel o arquivo fica no CDN */
  }
  try {
    const r = await fetch(`${siteUrlFrom(req).replace(/\/+$/, "")}/index.html`);
    if (r.ok) indexHtmlCache = await r.text();
  } catch {
    /* sem página */
  }
  return indexHtmlCache;
}
const escAttr = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
app.get("/arvore/:token", async (req, res, next) => {
  if (process.env.NODE_ENV !== "production") return next();
  try {
    const html = await loadIndexHtml(req);
    if (!html) return next();
    const t = await db.findTree(String(req.params.token).toLowerCase()).catch(() => null);
    const site = siteUrlFrom(req).replace(/\/+$/, "");
    const title = t?.title ? `🎄 ${t.title}: venha pendurar um enfeite!` : "🎄 Venha pendurar um enfeite na nossa Árvore de Natal!";
    const desc = "Escreva uma frase de carinho e pendure na árvore da família. 💌";
    const tags = `
    <meta property="og:title" content="${escAttr(title)}" />
    <meta property="og:description" content="${escAttr(desc)}" />
    <meta property="og:image" content="${site}/og-arvore.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />`;
    const out = html
      .replace(/<title>[^<]*<\/title>/, `<title>${escAttr(title)}</title>`)
      .replace(/\s*<meta (property="og:[^"]+"|name="twitter:card")[^>]*>/g, "")
      .replace("</head>", `${tags}\n  </head>`);
    res.set("Cache-Control", "public, max-age=300").set("X-Robots-Tag", "noindex").type("html").send(out);
  } catch {
    next();
  }
});

app.get("/casa/:token", async (req, res, next) => {
  if (process.env.NODE_ENV !== "production") return next();
  try {
    const html = await loadIndexHtml(req);
    if (!html) return next();
    const t = await db.findTree(String(req.params.token).toLowerCase()).catch(() => null);
    const site = siteUrlFrom(req).replace(/\/+$/, "");
    const title = t?.title ? `🏡 ${t.title}: venha colocar o seu bonequinho!` : "🏡 Venha montar a nossa Casinha de Natal!";
    const desc = "Coloque o seu bonequinho na casa da família e deixe um recadinho de Natal. 💌";
    const tags = `
    <meta property="og:title" content="${escAttr(title)}" />
    <meta property="og:description" content="${escAttr(desc)}" />
    <meta property="og:image" content="${site}/og-casa.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />`;
    const out = html
      .replace(/<title>[^<]*<\/title>/, `<title>${escAttr(title)}</title>`)
      .replace(/\s*<meta (property="og:[^"]+"|name="twitter:card")[^>]*>/g, "")
      .replace("</head>", `${tags}\n  </head>`);
    res.set("Cache-Control", "public, max-age=300").set("X-Robots-Tag", "noindex").type("html").send(out);
  } catch {
    next();
  }
});

app.get("/natal/:token", async (req, res, next) => {
  if (process.env.NODE_ENV !== "production") return next();
  try {
    const html = await loadIndexHtml(req);
    if (!html) return next();
    const letter = await db.findLetter(String(req.params.token).toLowerCase());
    const first = letter ? String(letter.childName).trim().split(/\s+/)[0].slice(0, 20) : "";
    const site = siteUrlFrom(req).replace(/\/+$/, "");
    const title = first ? `Uma carta do Papai Noel para ${first} ✨` : "Uma carta do Papai Noel chegou! ✨";
    const desc = "Direto do Polo Norte: abra a carta mágica e ouça o Papai Noel. 🎅🎄";
    const tags = `
    <meta property="og:title" content="${escAttr(title)}" />
    <meta property="og:description" content="${escAttr(desc)}" />
    <meta property="og:image" content="${site}/og-carta.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${site}/natal/${escAttr(String(req.params.token))}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />`;
    const out = html
      .replace(/<title>[^<]*<\/title>/, `<title>${escAttr(title)}</title>`)
      .replace(/\s*<meta (property="og:[^"]+"|name="twitter:card")[^>]*>/g, "")
      .replace("</head>", `${tags}\n  </head>`);
    res.set("Cache-Control", "public, max-age=300").set("X-Robots-Tag", "noindex").type("html").send(out);
  } catch {
    next();
  }
});

// ---------- Árvore de Natal da Família ----------
const TREE_TYPES = new Set(ORNAMENT_TYPES.map((t) => t.type));
const hashKey = (k: string) => createHash("sha256").update(k).digest("hex");
function cleanOrnament(o: any) {
  if (!o || typeof o !== "object" || !TREE_TYPES.has(o.type)) return null;
  const x = Number(o.x);
  const y = Number(o.y);
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > VIEW_W || y < 0 || y > VIEW_H) return null;
  const color = /^#[0-9a-fA-F]{6}$/.test(o.color) ? o.color : "#E63946";
  const id = /^[a-z0-9]{4,24}$/.test(String(o.id)) ? String(o.id) : randomBytes(6).toString("hex");
  const text = sanitizeText(o.text, MAX_TEXT);
  const author = sanitizeText(o.author, MAX_AUTHOR);
  return { id, type: o.type, color, x: Math.round(x), y: Math.round(y), ...(text ? { text } : {}), ...(author ? { author } : {}), at: new Date().toISOString() };
}
function ownerOk(rec: db.TreeRecord, key: unknown) {
  if (typeof key !== "string" || key.length < 10) return false;
  const a = Buffer.from(hashKey(key));
  const b = Buffer.from(rec.editKeyHash);
  return a.length === b.length && timingSafeEqual(a, b);
}
const treeHits = new Map<string, { n: number; t: number }>();
function treeRateLimited(req: any, limit = 40) {
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();
  const now = Date.now();
  const r = treeHits.get(ip);
  if (!r || now - r.t > 10 * 60 * 1000) {
    treeHits.set(ip, { n: 1, t: now });
    return false;
  }
  r.n++;
  return r.n > limit;
}
const publicTree = (t: db.TreeRecord) => ({ title: t.title, ornaments: t.ornaments });

app.post("/api/tree", async (req, res) => {
  if (treeRateLimited(req, 10)) return res.status(429).json({ error: "Muitas árvores criadas. Tente mais tarde." });
  try {
    const title = sanitizeText(req.body?.title, 40);
    const list = Array.isArray(req.body?.ornaments) ? req.body.ornaments.slice(0, MAX_ORNAMENTS) : [];
    const ornaments = list.map(cleanOrnament).filter(Boolean);
    const token = randomBytes(8).toString("hex").slice(0, 10);
    const editKey = randomBytes(18).toString("base64url");
    await db.insertTree({ token, editKeyHash: hashKey(editKey), title, ornaments });
    res.json({ token, editKey });
  } catch (err: any) {
    console.error("Erro ao criar árvore:", err?.message || err);
    res.status(503).json({ error: "O compartilhamento da árvore está indisponível agora. Sua árvore continua salva neste aparelho." });
  }
});

app.get("/api/tree/:token", async (req, res) => {
  try {
    const t = await db.findTree(String(req.params.token).toLowerCase());
    if (!t || !Array.isArray(t.ornaments)) return res.status(404).json({ error: "Árvore não encontrada. Confira o link." });
    res.json(publicTree(t));
  } catch {
    res.status(500).json({ error: "Erro ao buscar a árvore." });
  }
});

app.post("/api/tree/:token/ornaments", async (req, res) => {
  if (treeRateLimited(req)) return res.status(429).json({ error: "Calma, duende! Muitos enfeites seguidos. Tente daqui a pouco." });
  try {
    const t = await db.findTree(String(req.params.token).toLowerCase());
    if (!t || !Array.isArray(t.ornaments)) return res.status(404).json({ error: "Árvore não encontrada." });
    if (t.ornaments.length >= MAX_ORNAMENTS) return res.status(400).json({ error: "A árvore está lotada de enfeites!" });
    const o = cleanOrnament(req.body?.ornament);
    if (!o) return res.status(400).json({ error: "Enfeite inválido." });
    const ornaments = [...t.ornaments.filter((x: any) => x.id !== o.id), o];
    await db.saveTree(t.token, { ornaments });
    res.json({ title: t.title, ornaments });
  } catch {
    res.status(500).json({ error: "Não foi possível pendurar o enfeite agora." });
  }
});

app.delete("/api/tree/:token/ornaments/:id", async (req, res) => {
  try {
    const t = await db.findTree(String(req.params.token).toLowerCase());
    if (!t) return res.status(404).json({ error: "Árvore não encontrada." });
    if (!ownerOk(t, req.headers["x-edit-key"])) return res.status(403).json({ error: "Só quem criou a árvore pode tirar enfeites." });
    const ornaments = t.ornaments.filter((x: any) => x.id !== req.params.id);
    await db.saveTree(t.token, { ornaments });
    res.json({ title: t.title, ornaments });
  } catch {
    res.status(500).json({ error: "Erro ao tirar o enfeite." });
  }
});

app.patch("/api/tree/:token", async (req, res) => {
  try {
    const t = await db.findTree(String(req.params.token).toLowerCase());
    if (!t) return res.status(404).json({ error: "Árvore não encontrada." });
    if (!ownerOk(t, req.headers["x-edit-key"])) return res.status(403).json({ error: "Sem permissão." });
    const title = sanitizeText(req.body?.title, 40);
    await db.saveTree(t.token, { title });
    res.json({ title, ornaments: t.ornaments });
  } catch {
    res.status(500).json({ error: "Erro ao salvar o nome." });
  }
});


// ---------- Nossa Casinha de Natal (guardada na mesma tabela da árvore, com código começando por "casa") ----------
const HOUSE_MODEL_IDS = new Set(["chale", "biscoito", "iglu"]);
const HOUSE_ITEM_IDS = new Set(HOUSE_CATALOG.map((c) => c.id));
function cleanHouseCfg(c: any) {
  return {
    model: HOUSE_MODEL_IDS.has(c?.model) ? c.model : "chale",
    roof: /^#[0-9a-fA-F]{6}$/.test(c?.roof) ? c.roof : "#C1121F",
    title: sanitizeText(c?.title, 40),
  };
}
function cleanHouseItem(o: any) {
  if (!o || typeof o !== "object") return null;
  const kind = o.kind === "pessoa" ? "pessoa" : o.kind === "item" ? "item" : null;
  if (!kind) return null;
  const ref = String(o.ref || "");
  if (kind === "item" ? !HOUSE_ITEM_IDS.has(ref) : !isPersonRef(ref)) return null;
  const x = Number(o.x);
  const y = Number(o.y);
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > HOUSE_W || y < 0 || y > HOUSE_H) return null;
  const s = Math.min(1.8, Math.max(0.6, Number(o.s) || 1));
  const id = /^[a-z0-9]{4,24}$/.test(String(o.id)) ? String(o.id) : randomBytes(6).toString("hex");
  const name = sanitizeText(o.name, 18);
  const text = sanitizeText(o.text, 100);
  const author = sanitizeText(o.author, 18);
  return { id, kind, ref, x: Math.round(x), y: Math.round(y), s: Math.round(s * 10) / 10, ...(name ? { name } : {}), ...(text ? { text } : {}), ...(author ? { author } : {}), at: new Date().toISOString() };
}
const houseOf = (t: db.TreeRecord) => {
  const d: any = t.ornaments && !Array.isArray(t.ornaments) ? t.ornaments : { cfg: {}, items: [] };
  return { cfg: cleanHouseCfg({ ...d.cfg, title: t.title }), items: Array.isArray(d.items) ? d.items : [] };
};
const isHouseToken = (t: string) => /^casa[a-f0-9]{8}$/.test(t);

app.post("/api/house", async (req, res) => {
  if (treeRateLimited(req, 10)) return res.status(429).json({ error: "Muitas casinhas criadas. Tente mais tarde." });
  try {
    const cfg = cleanHouseCfg(req.body?.cfg);
    const list = Array.isArray(req.body?.items) ? req.body.items.slice(0, 120) : [];
    const items = list.map(cleanHouseItem).filter(Boolean);
    const token = `casa${randomBytes(4).toString("hex")}`;
    const editKey = randomBytes(18).toString("base64url");
    await db.insertTree({ token, editKeyHash: hashKey(editKey), title: cfg.title, ornaments: { cfg, items } as any });
    res.json({ token, editKey });
  } catch (err: any) {
    console.error("Erro ao criar casinha:", err?.message || err);
    res.status(503).json({ error: "O link da casinha está indisponível agora. Ela continua salva neste aparelho." });
  }
});

app.get("/api/house/:token", async (req, res) => {
  try {
    const token = String(req.params.token).toLowerCase();
    const t = isHouseToken(token) ? await db.findTree(token) : null;
    if (!t) return res.status(404).json({ error: "Casinha não encontrada. Confira o link." });
    const me = t.parentId ? await currentParent(req) : null;
    res.setHeader("Cache-Control", "no-store");
    res.json({ ...houseOf(t), mine: Boolean(me && me.id === t.parentId) });
  } catch {
    res.status(500).json({ error: "Erro ao abrir a casinha." });
  }
});

// visitantes (avós, tios) só podem colocar coisas novas ou o recadinho delas
app.post("/api/house/:token/items", async (req, res) => {
  if (treeRateLimited(req)) return res.status(429).json({ error: "Calma, duende! Muitas coisas seguidas. Tente daqui a pouco." });
  try {
    const token = String(req.params.token).toLowerCase();
    const t = isHouseToken(token) ? await db.findTree(token) : null;
    if (!t) return res.status(404).json({ error: "Casinha não encontrada." });
    const h = houseOf(t);
    if (h.items.length >= 120) return res.status(400).json({ error: "A casinha está lotada de amor!" });
    const it = cleanHouseItem(req.body?.item);
    if (!it) return res.status(400).json({ error: "Item inválido." });
    const items = [...h.items.filter((x: any) => x.id !== it.id), it];
    await db.saveTree(t.token, { ornaments: { cfg: h.cfg, items } as any });
    res.json({ cfg: h.cfg, items });
  } catch {
    res.status(500).json({ error: "Não foi possível colocar agora." });
  }
});

// quem criou a casa salva tudo (mover, aumentar, tirar, trocar modelo)
app.put("/api/house/:token", async (req, res) => {
  try {
    const token = String(req.params.token).toLowerCase();
    const t = isHouseToken(token) ? await db.findTree(token) : null;
    if (!t) return res.status(404).json({ error: "Casinha não encontrada." });
    const me = t.parentId ? await currentParent(req) : null;
    if (!ownerOk(t, req.headers["x-edit-key"]) && !(me && me.id === t.parentId)) {
      return res.status(403).json({ error: "Só quem criou a casinha pode mudar as coisas de lugar." });
    }
    const cfg = cleanHouseCfg(req.body?.cfg);
    const list = Array.isArray(req.body?.items) ? req.body.items.slice(0, 120) : [];
    const items = list.map(cleanHouseItem).filter(Boolean);
    await db.saveTree(t.token, { title: cfg.title, ornaments: { cfg, items } as any });
    res.json({ cfg, items });
  } catch {
    res.status(500).json({ error: "Não foi possível salvar a casinha agora." });
  }
});

// Webhook do Asaas: é o ÚNICO lugar que libera o acesso pago.
// No Asaas: Integrações > Webhooks > URL https://SEU-SITE/api/asaas/webhook,
// eventos de Checkout e de Cobrança, e o mesmo token da variável ASAAS_WEBHOOK_TOKEN.
const processedEvents = new Set<string>();
app.post("/api/asaas/webhook", async (req, res) => {
  if (!asaas.webhookAuthorized(req.headers["asaas-access-token"])) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const evt = req.body || {};
  try {
    if (evt.id && processedEvents.has(evt.id)) return res.json({ received: true });
    const event: string = evt.event || "";
    const refs = [
      evt.checkout?.id,
      evt.checkout?.externalReference,
      evt.payment?.checkoutSession,
      evt.payment?.externalReference,
    ].filter((v) => typeof v === "string" && v);

    let order: db.OrderRecord | null = null;
    for (const r of refs) {
      order = await db.findOrder(r);
      if (order) break;
    }
    if (!order) return res.json({ received: true, ignored: true });

    const paid = ["CHECKOUT_PAID", "PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"].includes(event);
    const closed = ["CHECKOUT_CANCELED", "CHECKOUT_EXPIRED"].includes(event);
    const refunded = ["PAYMENT_REFUNDED", "PAYMENT_CHARGEBACK_REQUESTED"].includes(event);

    if (paid && order.status !== "paid" && order.plan === "upgrade") {
      await db.updateOrder(order.orderId, { status: "paid" });
      const orig = order.upgradeOf ? await db.findPaidOrderByCode(order.upgradeOf) : null;
      if (orig) await db.updateOrder(orig.orderId, { plan: "familia" });
    } else if (paid && order.status !== "paid") {
      const accessCode = asaas.newAccessCode();
      const customerId = evt.payment?.customer || evt.checkout?.customer;
      const customerEmail =
        // o e-mail da conta (quem estava logado ao pagar) vale mais; senão, o e-mail digitado no Asaas
        order.customerEmail ||
        (typeof evt.checkout?.customerData?.email === "string" && evt.checkout.customerData.email) ||
        (customerId ? await asaas.getCustomerEmail(String(customerId)) : undefined);
      await db.updateOrder(order.orderId, { status: "paid", accessCode, customerEmail: customerEmail || undefined });
      const letter = await db.findLetter(order.letterId);
      if (letter) await db.updateLetter(letter.id, { plan: order.plan as any });
      // e-mail com o link da carta e o código mágico (só se o Resend estiver configurado)
      if (letter && customerEmail) {
        const site = siteUrlFrom(req).replace(/\/+$/, "");
        const saved = await db.findOrder(order.orderId);
        await mailer.sendPurchaseEmail({
          to: customerEmail,
          childName: letter.childName,
          letterUrl: `${site}/natal/${letter.token}`,
          siteUrl: site,
          accessCode: saved?.accessCode,
        });
      }
    } else if (closed && order.status === "pending") {
      await db.updateOrder(order.orderId, { status: "canceled" });
    } else if (refunded) {
      await db.updateOrder(order.orderId, { status: "refunded" });
      const letter = await db.findLetter(order.letterId);
      if (letter) await db.updateLetter(letter.id, { plan: "free" });
    }
    if (evt.id) processedEvents.add(evt.id);
    res.json({ received: true });
  } catch (err: any) {
    console.error("Erro no webhook do Asaas:", err?.message || err);
    res.status(500).json({ error: "erro" });
  }
});

app.post("/api/logistics/calculate", (req, res) => {
  const { zipCode, country = "Brasil" } = req.body;
  res.json({
    success: true,
    service:
      country === "Brasil"
        ? "Carta Registrada Polar A\xE9rea"
        : "Expresso Internacional Polar",
    cost: 29.9,
    estimatedDays:
      country === "Brasil" ? "3 a 5 dias \xFAteis" : "5 a 8 dias \xFAteis",
    packaging: "Envelope pergaminho 180g com selo de cera vermelha artesanal",
    trackingAvailable: true,
  });
});
app.post("/api/logistics/quote", (req, res) => {
  const { country = "Brasil", zipCode } = req.body;
  const services = [
    {
      carrier: "Correio Polar A\xE9reo Oficial (Polo Norte Express)",
      deliveryTime: "3 a 5 dias \xFAteis",
      price: 29.9,
      includes: [
        "Envelope pergaminho artesanal",
        "Selo de cera vermelha em relevo",
        "Certificado de Bom Menino / Boa Menina em papel 180g",
      ],
    },
    {
      carrier: "DHL Express Internacional Natalino",
      deliveryTime: "2 a 3 dias \xFAteis",
      price: 49.9,
      includes: [
        "Rastreamento priorit\xE1rio em tempo real",
        "Embalagem presente\xE1vel com fita de veludo",
      ],
    },
  ];
  res.json({
    success: true,
    destination: { country, zipCode },
    services,
    sealAuthenticity: "Selo hologr\xE1fico do Polo Norte garantido",
  });
});
const inMemoryAnalyticsEvents = [];
app.post("/api/analytics", (req, res) => {
  try {
    const { event, timestamp, url, utm, ...payload } = req.body;
    if (event) {
      inMemoryAnalyticsEvents.unshift({
        event,
        timestamp: timestamp || new Date().toISOString(),
        url,
        utm,
        payload,
      });
      if (inMemoryAnalyticsEvents.length > 500) {
        inMemoryAnalyticsEvents.pop();
      }
    }
    res.json({ success: true, count: inMemoryAnalyticsEvents.length });
  } catch {
    res.json({ success: false });
  }
});
app.post("/api/secret-message", async (req, res) => {
  try {
    const {
      letterId,
      childName = "Crian\xE7a",
      achievements = "",
      parentNotes = "",
    } = req.body;
    const letter = await db.findLetter(letterId);
    if (letter && letter.secretMessage) {
      return res.json({ success: true, secretMessage: letter.secretMessage });
    }
    let secretMessage = "";
    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `Voc\xEA \xE9 o Papai Noel sussurrando um segredinho confidencial e muito doce para a crian\xE7a chamada ${childName}.
Detalhes: ${achievements ? `Conquistas: ${achievements}.` : ""} ${parentNotes ? `Recado dos pais: ${parentNotes}.` : ""}
Escreva exatamente 2 a 3 frases curtas e afetuosas, come\xE7ando com "Psst... Um segredo s\xF3 nosso:" ou algo m\xE1gico equivalente, revelando algo especial que s\xF3 o Papai Noel sabe sobre ela. Em portugu\xEAs do Brasil caloroso e comovente.`,
          config: { temperature: 0.75, maxOutputTokens: 180 },
        });
        if (response && response.text) {
          secretMessage = response.text.trim();
        }
      } catch (err) {
        console.warn("Secret message fallback active:", err?.message);
      }
    }
    if (!secretMessage) {
      secretMessage = `Psst... ${childName}! Os duendes me contaram em segredo que o seu abra\xE7o tem o poder m\xE1gico de acalmar qualquer dia nublado. Guarde este segredo no seu cora\xE7\xE3ozinho: voc\xEA \xE9 a luz mais brilhante desta casa e o Polo Norte tem muito orgulho de voc\xEA! \u2728 Com carinho, Noel.`;
    }
    if (letter) {
      await db.updateLetter(letter.id, { secretMessage });
    }
    res.json({ success: true, secretMessage });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao gerar mensagem secreta", details: err?.message });
  }
});
// cor da carta (clássica, rosa, lilás, azul, verde) — pode ser trocada depois de pronta
app.post("/api/letter-theme", async (req, res) => {
  try {
    const { letterId, theme } = req.body || {};
    if (!LETTER_THEME_IDS.includes(String(theme))) return res.status(400).json({ error: "Cor inválida" });
    const letter = await db.findLetter(String(letterId || ""));
    if (!letter) return res.status(404).json({ error: "Carta não encontrada" });
    await db.updateLetter(letter.id, { theme: String(theme) });
    res.json({ success: true, theme });
  } catch {
    res.status(500).json({ error: "Erro ao salvar a cor da carta" });
  }
});
app.post("/api/reaction", async (req, res) => {
  try {
    const { letterId, reaction } = req.body;
    const letter = await db.findLetter(letterId);
    if (letter) {
      await db.updateLetter(letter.id, {
        childReaction: String(reaction ?? "").slice(0, 200),
      });
    }
    res.json({ success: true, reaction });
  } catch {
    res.status(500).json({ error: "Erro ao salvar rea\xE7\xE3o" });
  }
});
function getFallbackElfSuggestions(field, childName = "", age) {
  const numAge = typeof age === "number" ? age : 6;
  switch (field) {
    case "achievements":
      if (numAge <= 4) {
        return [
          "Aprendeu a guardar os brinquedos no cesto com muita alegria e cantoria!",
          "Comeu frutas e legumes coloridos e distribuiu abra\xE7os apertados na fam\xEDlia.",
          "Aprendeu a usar o peniquinho e foi muito corajosa em todas as novidades!",
          "Dividiu os brinquedos com os amiguinhos com um sorriso lindo no rostinho.",
        ];
      } else if (numAge <= 8) {
        return [
          "Aprendeu a andar de bicicleta sem rodinhas e demonstrou muita coragem!",
          "Arrumou a caminha todos os dias e cuidou com muito carinho da fam\xEDlia.",
          "Fez novos amigos na escola e ajudou os colegas com muita gentileza.",
          "Aprendeu a nadar sem b\xF3ias como um peixinho destemido!",
        ];
      } else {
        return [
          "Dedicou-se aos estudos com autonomia e tirou \xF3timas notas na escola.",
          "Ajudou nas tarefas de casa e foi um exemplo carinhoso de responsabilidade.",
          "Acolheu e defendeu um colega que estava se sentindo sozinho na escola.",
          "Desenvolveu novas habilidades com dedica\xE7\xE3o e persist\xEAncia diante de desafios.",
        ];
      }
    case "learningMilestone":
      if (numAge <= 4) {
        return [
          "Aprendeu a falar as primeiras frases completas e a cantarolar m\xFAsicas.",
          "Aprendeu a cal\xE7ar os pr\xF3prios sapatos e a vestir o casaquinho.",
          "Aprendeu o nome das cores e a reconhecer os bichinhos nos livros.",
          "Aprendeu a expressar o que sente com palavras doces e carinhosas.",
        ];
      } else if (numAge <= 8) {
        return [
          "Aprendeu a ler as primeiras palavrinhas e historinhas com entusiasmo!",
          "Aprendeu a amarrar o pr\xF3prio t\xEAnis e a organizar a mochila escolar.",
          "Aprendeu a somar continhas e a escrever bilhetinhos cheios de carinho.",
          "Aprendeu a andar de patins/skate mantendo o equil\xEDbrio com valentia.",
        ];
      } else {
        return [
          "Aprendeu a tocar instrumentos musicais e a expressar sua criatividade.",
          "Leu livros mais longos por conta pr\xF3pria, ampliando muito a imagina\xE7\xE3o.",
          "Aprendeu a preparar receitinhas simples ajudando a fam\xEDlia na cozinha.",
          "Aprendeu no\xE7\xF5es incr\xEDveis de ci\xEAncias e rob\xF3tica com muita curiosidade.",
        ];
      }
    case "favoriteActivity":
      return [
        "Ama desenhar animais fant\xE1sticos, colorir mundos m\xE1gicos e pintar telas.",
        "Adora inventar castelos gigantes com blocos de montar e criar aventuras espaciais.",
        "Gosta de cantar, dan\xE7ar pela sala e encenar teatrinhos divertidos.",
        "Adora brincar ao ar livre na grama, correr com o pet e andar de bicicleta.",
      ];
    case "specialMention":
      return [
        "Lembrar que o vov\xF4 e a vov\xF3 mandam um abra\xE7o bem apertado e cheio de orgulho.",
        "Elogiar a bravura e a calma que mostrou durante a visita ao m\xE9dico ou dentista.",
        "Mencionar o amor incondicional e o carinho com que cuida dos animais da casa.",
        "Dizer que os duendes do Polo Norte viram como ela foi generosa com os colegas.",
      ];
    case "giftRequest":
      if (numAge <= 4) {
        return [
          "Um trenzinho de madeira com trilhos e bloquinhos coloridos para montar.",
          "Um livro interativo com sons de animais e ilustra\xE7\xF5es m\xE1gicas.",
          "Um bichinho de pel\xFAcia fofinho para ser companheiro de soninhos tranquilos.",
          "Um kit l\xFAdico de massinhas de modelar com forminhas divertidas.",
        ];
      } else if (numAge <= 8) {
        return [
          "Uma bicicleta com capacete para viver grandes aventuras pelo parque!",
          "Um kit completo de pintura e artes com aquarelas, telas e pinc\xE9is.",
          "Um rob\xF4 interativo inteligente ou jogo de tabuleiro para brincar em fam\xEDlia.",
          "Um conjunto incr\xEDvel de blocos de montar para construir naves e castelos.",
        ];
      } else {
        return [
          "Um jogo de tabuleiro estrat\xE9gico para reunir a fam\xEDlia toda nas noites de Natal.",
          "Um kit de experimentos cient\xEDficos ou rob\xF3tica para explorar inven\xE7\xF5es.",
          "Um telesc\xF3pio ou bin\xF3culo para observar as estrelas e constela\xE7\xF5es no c\xE9u.",
          "Um patinete esportivo veloz com kit completo de joelheiras e capacete.",
        ];
      }
    case "parentNotes":
      return [
        "Lembrar com amor de continuar dormindo no pr\xF3prio quartinho a noite toda com coragem.",
        "Refor\xE7ar que os pais t\xEAm um orgulho imenso de seu cora\xE7\xE3o bondoso e alegre.",
        "Incentivar a continuar experimentando legumes e verduras para crescer forte e saud\xE1vel.",
        "Lembrar que errar faz parte do aprendizado e que tentar de novo \xE9 sinal de sabedoria.",
      ];
    default:
      return [
        "Uma atitude cheia de generosidade e empatia com as pessoas ao redor.",
        "Uma conquista di\xE1ria feita com persist\xEAncia, curiosidade e bom humor.",
        "Um momento inesquec\xEDvel em fam\xEDlia com gargalhadas e muito carinho.",
        "Um passo importante de crescimento e amadurecimento com amor.",
      ];
  }
}
__name(getFallbackElfSuggestions, "getFallbackElfSuggestions");
app.post("/api/elf-suggestions", async (req, res) => {
  try {
    const { field, childName = "", age, city = "" } = req.body;
    const ai = getGeminiClient();
    let suggestions = [];
    if (ai) {
      try {
        const fieldDescriptions = {
          achievements:
            "boas a\xE7\xF5es, conquistas ou atitudes nobres e carinhosas da crian\xE7a no ano",
          learningMilestone:
            "aprendizados marcantes, habilidades novas e supera\xE7\xF5es",
          favoriteActivity:
            "brincadeiras, atividades e hobbies favoritos da crian\xE7a",
          specialMention:
            "recado especial ou detalhe carinhoso que o Papai Noel deve citar",
          giftRequest:
            "ideias realistas e l\xFAdicas de pedidos de presentes de Natal para a crian\xE7a",
          parentNotes:
            "conselho amoroso, h\xE1bito a incentivar ou palavra de carinho dos pais",
        };
        const targetField =
          fieldDescriptions[field] || "ideia m\xE1gica para carta de Natal";
        const childAgeStr = age ? `de ${age} anos` : "crian\xE7a";
        const childNameStr = childName ? `chamada ${childName}` : "";
        const prompt = `Voc\xEA \xE9 o Elfo Artes\xE3o da F\xE1brica do Papai Noel no Polo Norte.
Sua miss\xE3o \xE9 sugerir exatamente 4 op\xE7\xF5es criativas, afetuosas, aut\xEAnticas e inspiradoras em portugu\xEAs brasileiro para preencher o campo: ${targetField}.
Perfil da crian\xE7a: ${childNameStr} ${childAgeStr}.
Cada sugest\xE3o deve ser uma frase concisa (de 6 a 18 palavras), pronta para ser inserida diretamente no formul\xE1rio pelos pais.
Retorne APENAS um array JSON de strings no formato:
["sugest\xE3o 1", "sugest\xE3o 2", "sugest\xE3o 3", "sugest\xE3o 4"]`;
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: { responseMimeType: "application/json", temperature: 0.85 },
        });
        if (response && response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (Array.isArray(parsed) && parsed.length > 0) {
            suggestions = parsed.slice(0, 4).map((s) => String(s).trim());
          }
        }
      } catch (err) {
        console.warn(
          "Gemini elf suggestions call failed, falling back to curated suggestions:",
          err?.message || err,
        );
      }
    }
    if (!suggestions || suggestions.length === 0) {
      suggestions = getFallbackElfSuggestions(
        field,
        childName,
        typeof age === "number" ? age : void 0,
      );
    }
    res.json({ success: true, field, suggestions });
  } catch (error) {
    console.error("Error in /api/elf-suggestions:", error);
    res.status(500).json({ error: "Erro ao gerar sugest\xF5es do elfo." });
  }
});
app.get("/api/admin/metrics", requireAdmin, async (_req, res) => {
  const m = await db.getMetrics().catch((err) => {
    console.error(err);
    return { total: 0, pro: 0, revenue: 0 };
  });
  const totalLetters = m.total;
  const proLetters = m.pro;
  const freeLetters = totalLetters - proLetters;
  const conversionRate =
    totalLetters > 0
      ? Number(((proLetters / totalLetters) * 100).toFixed(1))
      : 0;
  res.json({
    totalLetters,
    proLetters,
    freeLetters,
    conversionRate,
    totalRevenue: Number(m.revenue.toFixed(2)),
    recentLetters: await db.listLetters(10).catch(() => []),
    recentOrders: await db.listOrders(10).catch(() => []),
    database: db.usingSupabase() ? "Supabase" : "Mem\xF3ria (dados somem ao reiniciar)",
    systemHealth: {
      geminiStatus: process.env.GEMINI_API_KEY
        ? "Operacional"
        : "Chave n\xE3o detectada (Modo Fallback Ativo)",
      ttsStatus: eleven.elevenEnabled() ? "ElevenLabs (voz e música) Operacional" : "Gemini + Web Speech (sem ElevenLabs)",
      pdfStatus: "Renderizador de Alta Precis\xE3o Operacional",
      logisticsStatus: "Integra\xE7\xE3o Postal Operacional",
    },
  });
});
// ======================= Música de Natal (planos pagos) =======================
// Uma música cantada por criança do plano: até 2 crianças = 2 músicas; até 5 = 5.
// A letra é escrita pela IA (Gemini) e a música é composta e cantada pela ElevenLabs Music.
// Tudo fica guardado no Storage (songs/<código>/<criança>.json + .mp3).
type SongMeta = {
  child: string;
  title: string;
  style: string;
  sections: eleven.SongSection[];
  status: "pending" | "ready" | "error";
  createdAt: string;
  letterToken?: string;
};
const slugChild = (n: string) =>
  String(n || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "crianca";
const firstName = (n: string) => String(n || "").trim().split(/\s+/)[0] || "criança";

async function songCodeFor(body: any): Promise<{ code: string; plan: string; letter: db.LetterRecord | null } | null> {
  let letter: db.LetterRecord | null = null;
  let code = String(body?.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (body?.token) {
    letter = await db.findLetter(String(body.token).toLowerCase());
    if (!letter) return null;
    if (letter.plan === "free") {
      if (code.length !== 6) return null; // carta grátis só entra com o código do plano (Painel da Família)
    } else if (letter.accessCode) code = letter.accessCode;
    else {
      const o = await db.findPaidOrderByLetter(letter.id);
      if (o?.accessCode) code = o.accessCode;
    }
  }
  if (code.length !== 6) return null;
  const order = await db.findPaidOrderByCode(code);
  if (!order) return null;
  return { code, plan: order.plan, letter };
}
async function songsOf(code: string): Promise<SongMeta[]> {
  const names = (await audioStore.list(`songs/${code}`)).filter((n) => n.endsWith(".json"));
  const out: SongMeta[] = [];
  for (const n of names) {
    const raw = await audioStore.get(`songs/${code}/${n}`);
    if (!raw) continue;
    try {
      const m = JSON.parse(raw.toString("utf8")) as SongMeta;
      // pedido que travou no meio (mais de 8 minutos) não conta
      if (m.status === "pending" && Date.now() - Date.parse(m.createdAt) > 8 * 60 * 1000) m.status = "error";
      out.push(m);
    } catch {
      /* ignora arquivo quebrado */
    }
  }
  return out;
}
async function publicSong(code: string, m: SongMeta) {
  const slug = slugChild(m.child);
  return {
    child: m.child,
    title: m.title,
    style: m.style,
    status: m.status,
    lyrics: m.sections,
    url: m.status === "ready" ? await audioStore.url(`songs/${code}/${slug}.mp3`) : null,
  };
}
function fallbackLyrics(name: string, achievements: string, gift: string): { title: string; sections: eleven.SongSection[] } {
  const n = firstName(name);
  const feito = sanitizeText(achievements, 80).split(/[,;.\n]/)[0]?.trim().toLowerCase() || "foi muito legal";
  const pedido = sanitizeText(gift, 60).split(/[,;.\n]/)[0]?.trim().toLowerCase();
  return {
    title: `O Natal de ${n}`,
    sections: [
      { name: "Intro", lines: [] },
      { name: "Verso 1", lines: [`Lá no Polo Norte tem festa e alegria`, `O trenó já brilha, é quase o grande dia`, `O Papai Noel abriu o seu livrão`, `E o nome de ${n} tem estrela e coração`] },
      { name: "Refrão", lines: [`${n}, ${n}, que Natal especial`, `Os sinos tocam forte, tem magia no quintal`, `${n}, ${n}, o Noel mandou dizer`, `Que este ano ele tem orgulho de você`] },
      { name: "Verso 2", lines: [`Contaram lá na oficina que ${feito}`, `As renas comemoram, o duende fez um hino`, pedido ? `Sua cartinha falou de ${pedido} com carinho` : `Sua cartinha chegou cheia de carinho`, `E o Papai Noel guardou ela pertinho`] },
      { name: "Refrão", lines: [`${n}, ${n}, que Natal especial`, `Os sinos tocam forte, tem magia no quintal`, `${n}, ${n}, o Noel mandou dizer`, `Que este ano ele tem orgulho de você`] },
      { name: "Final", lines: [`Ho, ho, ho, feliz Natal, ${n}!`] },
    ],
  };
}
async function writeLyrics(o: { name: string; age?: number; city?: string; achievements: string; gift: string; extras?: string }) {
  const ai = getGeminiClient();
  const prompt = `Você é compositor de músicas infantis de Natal no Brasil. Escreva a LETRA de uma música curta e alegre para a criança ${firstName(o.name)}${o.age ? `, de ${o.age} anos` : ""}${o.city ? `, de ${sanitizeText(o.city, 40)}` : ""}.
O que ela fez de bom este ano: ${sanitizeText(o.achievements, 300) || "foi uma criança muito carinhosa"}.
O que ela pediu ao Papai Noel: ${sanitizeText(o.gift, 120) || "uma surpresa"}.
${o.extras ? `Detalhes: ${sanitizeText(o.extras, 200)}.` : ""}
Regras: português do Brasil, palavras simples que uma criança canta junto, rimas fáceis, versos curtos (6 a 10 sílabas). O NOME da criança aparece no refrão. Cite 1 ou 2 conquistas reais dela. Pode citar o pedido, mas NUNCA prometa que o presente vai chegar. Não use marcas, nomes de artistas nem trechos de músicas existentes. Nada triste.
Responda SOMENTE um JSON: {"titulo":"...","secoes":[{"nome":"Intro","linhas":[]},{"nome":"Verso 1","linhas":[4 linhas]},{"nome":"Refrão","linhas":[4 linhas]},{"nome":"Verso 2","linhas":[4 linhas]},{"nome":"Refrão","linhas":[as mesmas 4 linhas do refrão]},{"nome":"Final","linhas":[1 ou 2 linhas]}]}`;
  if (ai) {
    for (const model of LETTER_MODELS) {
      try {
        const r = await ai.models.generateContent({ model, contents: [{ parts: [{ text: prompt }] }], config: { temperature: 0.9, responseMimeType: "application/json" } });
        const j = JSON.parse(String(r?.text || "").trim().replace(/^```json\s*|```$/g, ""));
        const sections: eleven.SongSection[] = (Array.isArray(j.secoes) ? j.secoes : [])
          .slice(0, 7)
          .map((x: any) => ({ name: sanitizeText(x?.nome, 40) || "Verso", lines: (Array.isArray(x?.linhas) ? x.linhas : []).map((l: any) => sanitizeText(l, 140)).filter(Boolean).slice(0, 6) }));
        if (sections.filter((x) => x.lines.length).length >= 3) return { title: sanitizeText(j.titulo, 60) || `O Natal de ${firstName(o.name)}`, sections };
      } catch (e: any) {
        console.warn(`Letra da música (${model}) falhou:`, e?.message || e);
      }
    }
  }
  return fallbackLyrics(o.name, o.achievements, o.gift);
}

/** Interruptor da Música de Natal: só aparece com MUSICA_ATIVA=sim na Vercel (e a chave da ElevenLabs). */
const musicOn = () => eleven.elevenEnabled() && /^(sim|1|true)$/i.test(String(process.env.MUSICA_ATIVA || ""));
app.get("/api/features", (_req, res) => {
  res.setHeader("Cache-Control", "public, max-age=60");
  res.json({ music: musicOn() });
});
app.post("/api/music/status", async (req, res) => {
  try {
    if (tooMany(`musicst:${ipOf(req)}`, 60, 10 * 60 * 1000)) return res.status(429).json({ error: "Muitas tentativas." });
    const c = await songCodeFor(req.body);
    res.setHeader("Cache-Control", "no-store");
    if (!c) return res.json({ enabled: musicOn(), allowed: false });
    const limit = asaas.PLAN_CHILDREN[c.plan] ?? 1;
    const songs = await songsOf(c.code);
    const used = songs.filter((m) => m.status !== "error").length;
    res.json({
      enabled: musicOn(),
      allowed: true,
      limit,
      used,
      remaining: Math.max(0, limit - used),
      songs: await Promise.all(songs.filter((m) => m.status !== "error").map((m) => publicSong(c.code, m))),
    });
  } catch (e: any) {
    res.status(500).json({ error: "Erro ao conferir as músicas." });
  }
});

app.post("/api/music", async (req, res) => {
  try {
    if (!musicOn()) return res.status(503).json({ error: "A Música de Natal está sendo preparada no Polo Norte. Volte em breve!" });
    if (tooMany(`music:${ipOf(req)}`, 6, 60 * 60 * 1000)) return res.status(429).json({ error: "Calma, os duendes estão cantando! Tente daqui a pouco." });
    const c = await songCodeFor(req.body);
    if (!c) return res.status(403).json({ error: "A Música de Natal faz parte dos planos pagos.", needPlan: true });
    const name = sanitizeText(c.letter?.childName || req.body?.childName, 40);
    if (!name) return res.status(400).json({ error: "Diga o nome da criança." });
    const style = eleven.SONG_STYLES.includes(String(req.body?.style)) ? String(req.body.style) : "alegre";
    const slug = slugChild(name);
    const limit = asaas.PLAN_CHILDREN[c.plan] ?? 1;
    const songs = await songsOf(c.code);
    const mine = songs.find((m) => slugChild(m.child) === slug);
    if (mine && mine.status !== "error") return res.json({ song: await publicSong(c.code, mine), existing: true });
    const used = songs.filter((m) => m.status !== "error").length;
    if (used >= limit) return res.status(409).json({ error: `Seu plano já usou as ${limit} músicas (uma por criança).`, limitReached: true });

    const lyr = await writeLyrics({
      name,
      age: c.letter?.age || Number(req.body?.age) || undefined,
      city: c.letter?.city || req.body?.city,
      achievements: c.letter?.achievements || req.body?.achievements || "",
      gift: c.letter?.giftRequest || req.body?.giftRequest || "",
    });
    const meta: SongMeta = { child: name, title: lyr.title, style, sections: lyr.sections, status: "pending", createdAt: new Date().toISOString(), letterToken: c.letter?.token };
    const metaPath = `songs/${c.code}/${slug}.json`;
    await audioStore.put(metaPath, Buffer.from(JSON.stringify(meta)), "application/json");
    let mp3: Buffer;
    try {
      mp3 = await eleven.compose({ title: lyr.title, sections: lyr.sections, style });
    } catch (e: any) {
      console.warn("Música (1ª tentativa) falhou:", e?.message);
      // letra recusada (ex.: nome parecido com marca): tenta com a letra reserva
      const fb = fallbackLyrics(name, c.letter?.achievements || "", "");
      try {
        mp3 = await eleven.compose({ title: fb.title, sections: fb.sections, style });
        meta.title = fb.title;
        meta.sections = fb.sections;
      } catch (e2: any) {
        console.error("Música falhou:", e2?.message);
        meta.status = "error";
        await audioStore.put(metaPath, Buffer.from(JSON.stringify(meta)), "application/json");
        return res.status(502).json({ error: "Os duendes desafinaram! Tente de novo em alguns minutos (não foi descontado do seu plano)." });
      }
    }
    await audioStore.put(`songs/${c.code}/${slug}.mp3`, mp3, "audio/mpeg");
    meta.status = "ready";
    await audioStore.put(metaPath, Buffer.from(JSON.stringify(meta)), "application/json");
    res.json({ song: await publicSong(c.code, meta) });
  } catch (e: any) {
    console.error("music:", e);
    res.status(500).json({ error: "Erro ao criar a música." });
  }
});

// só no desenvolvimento (sem Supabase): entrega os áudios guardados em memória
app.get("/api/audio-dev/:path", (req, res) => {
  if (db.usingSupabase()) return res.status(404).end();
  const buf = audioStore.devGet(String(req.params.path));
  if (!buf) return res.status(404).end();
  res.setHeader("Content-Type", req.params.path.endsWith(".json") ? "application/json" : "audio/mpeg");
  res.send(buf);
});
// =================================================================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite só é carregado em desenvolvimento (não entra no servidor da Vercel)
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Carta M\xE1gica Server running on http://0.0.0.0:${PORT}`);
  });
}
__name(startServer, "startServer");

// Na Vercel o app roda como função serverless (api/index.ts); localmente sobe o servidor.
if (!process.env.VERCEL) {
  startServer();
}

export default app;
