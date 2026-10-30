var __defProp = Object.defineProperty;
var __name = (target, value) =>
  __defProp(target, "name", { value, configurable: true });
import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import * as db from "./db";
import { randomBytes } from "crypto";
import * as asaas from "./asaas";
import { ADVENT_DAYS } from "./src/advent/days";
import { voiceById, voiceForSender } from "./src/lib/voices";
import * as mailer from "./mailer";
import { createHash, timingSafeEqual } from "crypto";
import { MAX_AUTHOR, MAX_ORNAMENTS, MAX_TEXT, ORNAMENT_TYPES, VIEW_H, VIEW_W, sanitizeText } from "./src/tree/model";
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

O Rudolph, a rena de nariz vermelho brilhante, j\xE1 separou com todo carinho a sua cartinha sobre o dinossauro rob\xF4 que acende os olhos. Nossos elfos inventores est\xE3o dando os \xFAltimos retoques na oficina m\xE1gica de brinquedos.

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

J\xE1 registrei no meu Grande Livro Dourado o seu desejo da maleta de tintas m\xE1gicas e pinc\xE9is. O Rudolph e as outras renas mandam um carinhoso relincho m\xE1gico para voc\xEA!

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

function generateFallbackLetter(data) {
  const isPro = data.plan === "pro";
  const name = data.childName.trim();
  const city = String(data.city || "").trim().slice(0, 60);
  const age = data.age;
  const achievements =
    data.achievements?.trim() ||
    "foi uma crian\xE7a gentil, bondosa e cheia de alegria";
  const gift =
    data.giftRequest?.trim() || "uma surpresa m\xE1gica feita com todo o amor";
  const parentNotes = data.parentNotes?.trim() || "";
  const x: LetterExtras = data.extras || {};
  const ps = x.pet
    ? `\n\nP.S.: Mande um abraço bem apertado para ${x.pet}! O Rudolph quer conhecer esse amigo especial. \u{1F98C}`
    : x.food
      ? `\n\nP.S.: Os duendes descobriram que você adora ${x.food} e agora querem provar também! \u{1F604}`
      : x.friend
        ? `\n\nP.S.: Diga ao(à) ${x.friend} que o Papai Noel mandou um oi! \u2728`
        : "";
  const sib = x.siblings ? ` e ${x.siblings}` : "";
  if (isPro) {
    return `Ho Ho Ho! Ol\xE1, meu querido(a) ${name}${sib}!

Daqui do topo do Polo Norte, onde as luzes douradas e esmeraldas da Aurora Boreal dan\xE7am pelo c\xE9u estrelado e as cabanas de madeira soltam fuma\xE7a quentinha com aroma de canela, peguei minha pena de cristal mais brilhante para escrever uma mensagem especial e \xFAnica para voc\xEA a\xED em ${city}!

Abri o Grande Livro Dourado das Boas A\xE7\xF5es que os elfos guardam no cora\xE7\xE3o da biblioteca polar. Quando encontrei a sua p\xE1gina, com seus ${age} anos de idade, meu cora\xE7\xE3o se encheu de orgulho e alegria ao ler que voc\xEA ${achievements}! A Mam\xE3e Noel e os duendes artes\xE3os aplaudiram com sorrisos largos. Pequenos gestos de coragem, bondade e amor fazem o mundo inteiro brilhar mais forte.

O Rudolph, com seu nariz vermelho cintilante, j\xE1 colocou uma fita dourada no registro do seu pedido especial: "${gift}". Nossos duendes inventores est\xE3o trabalhando com muito esmero e alegria na oficina central de brinquedos, garantindo que a noite m\xE1gica seja repleta de encanto e surpresas preparadas com carinho.

${
  parentNotes
    ? `Seus pais me contaram tamb\xE9m um segredinho com os olhinhos cheios de ternura: ${parentNotes}. O amor da sua fam\xEDlia \xE9 o verdadeiro p\xF3 de estrelas que ilumina todo o caminho do tren\xF3!

`
    : ""
}Continue sendo essa crian\xE7a t\xE3o valente, curiosa, doce e protetora de quem est\xE1 ao seu redor. Na Noite de Natal, quando os sininhos tocarem no c\xE9u gelado, saiba que estou enviando uma chuva de b\xEAn\xE7\xE3os, sa\xFAde e p\xF3 de estrelas cintilantes para o seu lar.

Com carinho, Papai Noel \u{1F385}${ps}`;
  }
  return `Ho Ho Ho! Ol\xE1, meu querido(a) ${name}${sib}!

Aqui da minha oficina m\xE1gica no Polo Norte, cercado por montanhas de neve branquinha e o brilho suave das estrelas de Natal, observei voc\xEA a\xED na cidade de ${city}!

O Grande Livro Dourado me mostrou com muita alegria que, aos seus ${age} anos de idade, voc\xEA ${achievements}! Que orgulho ver seu crescimento e o seu cora\xE7\xE3o t\xE3o bondoso.

Eu e o Rudolph j\xE1 lemos a sua cartinha sobre o seu pedido: ${gift}. Os duendes est\xE3o preparando tudo com muito carinho e anima\xE7\xE3o para a chegada do Natal.

${
  parentNotes
    ? `Seus pais t\xEAm um amor infinito por voc\xEA e se orgulham muito da pessoa incr\xEDvel que voc\xEA \xE9.

`
    : ""
}Guarde sempre o brilho da esperan\xE7a e da alegria no seu cora\xE7\xE3o, espalhando sorrisos por onde passar.

Com carinho, Papai Noel \u{1F385}${ps}`;
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
app.get("/api/letter/:token", async (req, res) => {
  try {
    const letter = await db.findLetter(req.params.token);
    if (!letter) {
      return res.status(404).json({ error: "Carta n\xE3o encontrada" });
    }
    res.json(letter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar a carta" });
  }
});
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
      plan = "free",
      photoUrl,
      parentalConsent,
    } = req.body;
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
    const isPro = plan === "pro" || plan === "natal";
    let letterContent = "";
    let generatedWithAI = false;
    const ai = getGeminiClient();
    if (ai) {
      try {
        const systemInstruction = `Voc\xEA \xE9 o verdadeiro Papai Noel escrevendo uma carta emocionante, aut\xEAntica, calorosa e inesquec\xEDvel para uma crian\xE7a.
Siga RIGOROSAMENTE esta estrutura em 7 partes consecutivas e harmoniosas:
1. SAUDA\xC7\xC3O: Ex: "Ho Ho Ho! Ol\xE1, meu querido(a) ${childName}!"
2. INTRODU\xC7\xC3O DO POLO NORTE: Descri\xE7\xE3o v\xEDvida e sensorial do Polo Norte (as montanhas geladas, a Aurora Boreal dan\xE7ando em cores no c\xE9u noturno, a oficina cheia de aromas de canela e pinheiro, os duendes concentrados preparando os brinquedos e as renas treinando o grande voo).
3. CONQUISTAS: Reconhecimento sincero, comovente e afetuoso das atitudes, aprendizados e conquistas da crian\xE7a aos ${age} anos de idade em ${city}. Elogie a coragem, o carinho e o esfor\xE7o.
4. PEDIDO DE NATAL: Men\xE7\xE3o carinhosa e animada ao presente pedido (${giftRequest || "uma surpresa especial"}), sem fazer falsas promessas materiais irreais mas garantindo que o Rudolph e os duendes j\xE1 guardaram o desejo no cora\xE7\xE3o da oficina.
5. CARINHO & PALAVRAS DOS PAIS: ${parentNotes ? `Integre de forma natural, doce e comovente o recado confidencial dos respons\xE1veis: "${parentNotes}". Relembre que o amor da fam\xEDlia \xE9 o maior tesouro.` : `Reforce o amor imenso e orgulho que a fam\xEDlia sente por ela.`}
6. ENCERRAMENTO: Uma b\xEAn\xE7\xE3o m\xE1gica de p\xF3 de estrelas, encorajando a crian\xE7a a continuar sendo gentil, respeitosa e iluminando a vida de todos.
7. ASSINATURA OBRIGAT\xD3RIA: Exatamente "Com carinho, Papai Noel \u{1F385}"
8. P.S.: Depois da assinatura, em um par\xE1grafo separado, um "P.S.:" curtinho, engra\xE7ado ou secreto, ligado a um detalhe pessoal da crian\xE7a (bichinho, comida, amigo ou brincadeira favorita). Se n\xE3o houver detalhe, conte um segredinho divertido do Polo Norte.
${extrasText ? `\nDETALHES PESSOAIS (use TODOS, de forma natural e espalhada pela carta \u2014 \xE9 isso que faz a fam\xEDlia se emocionar):\n${extrasText}\n` : ""}

DIRETRIZES DE SEGURAN\xC7A E \xC9TICA:
- NUNCA use chantagem emocional ("se n\xE3o obedecer n\xE3o ganha presente", "estou vigiando se voc\xEA chora"). O Papai Noel \xE9 pura bondade, sabedoria e aconchego.
- NUNCA prometa itens materiais de forma for\xE7ada.
- Tom da carta: ${toneDesc}.
- Estilo: ${style} (${isPro ? "Para o Plano PRO: crie uma narrativa rica, profunda, liter\xE1ria e m\xE1gica com cerca de 260 a 340 palavras, repleta de detalhes sensoriais e emo\xE7\xE3o genu\xEDna" : "Para o Plano Gratuito: crie uma mensagem acolhedora, clara e comovente com cerca de 150 a 190 palavras"}).
- Idioma: Portugu\xEAs do Brasil impec\xE1vel, po\xE9tico e afetuoso.`;
        const userPrompt = `Escreva a carta de Natal personalizada com as informa\xE7\xF5es:
- Crian\xE7a: ${childName}
- Idade: ${age} anos
- Cidade: ${city}
- Conquistas e atitudes especiais: ${achievements || "Foi gentil e espalhou alegria"}
- Pedido de presente na cartinha: ${giftRequest || "Um presente feito com amor"}
- Palavras especiais dos pais/respons\xE1veis: ${parentNotes || "Nenhum detalhe extra"}
${extrasText ? `${extrasText}\n` : ""}- Plano: ${isPro ? "PRO (m\xE1xima profundidade emocional, detalhes sensoriais e magia liter\xE1ria)" : "Gratuito (b\xE1sica, terna e envolvente)"}
- Estilo: ${style}`;
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: userPrompt,
          config: { systemInstruction, temperature: 0.72 },
        });
        if (response && response.text) {
          letterContent = response.text.trim();
          generatedWithAI = true;
        }
      } catch (err) {
        console.warn(
          "Gemini API call failed, falling back to local generator:",
          err?.message || err,
        );
      }
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
      plan: "free",
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
app.post("/api/tts", async (req, res) => {
  try {
    const { token, adventDay, name, voiceId, treeToken, ornamentId } = req.body || {};
    let voice = voiceById(voiceId);
    // a voz só é gerada para textos do próprio site (carta salva ou recado do calendário),
    // nunca para um texto qualquer vindo do navegador
    let text = "";
    let childName = "";
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
      const paidVoice = letterRec.plan === "pro" || letterRec.plan === "natal";
      text = paidVoice ? letterRec.content : paras.slice(0, 2).join("\n\n");
      // outras vozes são do plano pago
      if (!paidVoice) voice = voiceById("noel");
    }
    if (!text) {
      return res
        .status(400)
        .json({ error: "Texto n\xE3o fornecido para s\xEDntese de voz." });
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
                  text: `${voice.style} Fale em português do Brasil, com naturalidade. Texto:\n\n${String(text).slice(0, 2500)}`,
                },
              ],
            },
          ],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
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
    const isPro = plan === "pro" || plan === "natal";
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
    // um único plano pago: Natal Completo (R$ 29,90). "pro" antigo vira "natal".
    const plan = asaas.isPaidPlan(req.body?.plan) ? "natal" : null;
    if (!plan) {
      return res.status(400).json({ error: "Plano inválido." });
    }
    const letter = await db.findLetter(String(letterId || ""));
    if (!letter) {
      return res.status(404).json({ error: "Carta não encontrada. Crie a carta antes de pagar." });
    }
    if (!asaas.asaasConfigured()) {
      return res.status(503).json({
        error: "O pagamento ainda não está disponível. Tente novamente em breve.",
      });
    }
    const orderId = `cm${randomBytes(9).toString("base64url")}`;
    const price = asaas.PLAN_PRICES[plan];
    await db.insertOrder({
      orderId,
      letterId: letter.id,
      childName: letter.childName,
      amount: price.value,
      plan,
      includePhysicalDispatch: false,
      status: "pending",
      paymentMethod: "Asaas (Pix / Cartão)",
      createdAt: new Date().toLocaleString("pt-BR"),
    });
    const checkout = await asaas.createCheckout({ orderId, plan, siteUrl: siteUrlFrom(req) });
    await db.updateOrder(orderId, { gatewayChargeId: checkout.id });
    res.json({ success: true, orderId, checkoutUrl: checkout.link });
  } catch (err: any) {
    console.error("Erro no checkout:", err?.message || err);
    res.status(500).json({ error: "Não foi possível abrir o pagamento agora. Tente de novo em instantes." });
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
    res.set("Cache-Control", "public, max-age=300").type("html").send(out);
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
    res.set("Cache-Control", "public, max-age=300").type("html").send(out);
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
    if (!t) return res.status(404).json({ error: "Árvore não encontrada. Confira o link." });
    res.json(publicTree(t));
  } catch {
    res.status(500).json({ error: "Erro ao buscar a árvore." });
  }
});

app.post("/api/tree/:token/ornaments", async (req, res) => {
  if (treeRateLimited(req)) return res.status(429).json({ error: "Calma, duende! Muitos enfeites seguidos. Tente daqui a pouco." });
  try {
    const t = await db.findTree(String(req.params.token).toLowerCase());
    if (!t) return res.status(404).json({ error: "Árvore não encontrada." });
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

    if (paid && order.status !== "paid") {
      const accessCode = asaas.newAccessCode();
      const customerId = evt.payment?.customer || evt.checkout?.customer;
      const customerEmail =
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
      ttsStatus: "Nativo + Web Speech Operacional",
      pdfStatus: "Renderizador de Alta Precis\xE3o Operacional",
      logisticsStatus: "Integra\xE7\xE3o Postal Operacional",
    },
  });
});
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
