/**
 * OpenAI como motor de texto da Carta Mágica (carta, leitura da cartinha, letra da música, sugestões).
 * Ativa quando existe OPENAI_API_KEY na Vercel. Sem a chave (ou se a OpenAI falhar), o site usa o Gemini.
 * A chave fica SÓ no servidor. Usamos fetch direto: sem dependência nova.
 */
const BASE = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
/** OPENAI_MODEL escolhe o modelo; sem ela, tenta estes em ordem. */
const MODELS = () => (process.env.OPENAI_MODEL ? [process.env.OPENAI_MODEL] : ["gpt-4.1-mini", "gpt-4o-mini"]);

export const openaiConfigured = () => Boolean(process.env.OPENAI_API_KEY);

export type AiRequest = {
  system?: string;
  user: string;
  /** foto da cartinha (base64, sem o prefixo data:) */
  imageBase64?: string;
  mime?: string;
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
};

async function call(model: string, r: AiRequest, withTemperature: boolean): Promise<Response> {
  const content: any = r.imageBase64
    ? [
        { type: "text", text: r.user },
        { type: "image_url", image_url: { url: `data:${r.mime || "image/jpeg"};base64,${r.imageBase64}` } },
      ]
    : r.user;
  const body: Record<string, any> = {
    model,
    messages: [...(r.system ? [{ role: "system", content: r.system }] : []), { role: "user", content }],
    ...(withTemperature && r.temperature !== undefined ? { temperature: r.temperature } : {}),
    ...(r.json ? { response_format: { type: "json_object" } } : {}),
    ...(r.maxTokens ? { max_completion_tokens: r.maxTokens } : {}),
  };
  return fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });
}

/** Devolve o texto gerado ou null (para o chamador cair no Gemini). Nunca lança erro. */
export async function openaiText(r: AiRequest): Promise<string | null> {
  if (!openaiConfigured()) return null;
  for (const model of MODELS()) {
    try {
      let res = await call(model, r, true);
      // alguns modelos não aceitam "temperature": tenta de novo sem ela
      if (res.status === 400) {
        const t = await res.text().catch(() => "");
        if (/temperature/i.test(t)) res = await call(model, r, false);
        else {
          console.warn(`OpenAI (${model}) 400:`, t.slice(0, 200));
          continue;
        }
      }
      if (!res.ok) {
        console.warn(`OpenAI (${model}) falhou:`, res.status, (await res.text().catch(() => "")).slice(0, 200));
        // chave inválida ou sem crédito: não adianta tentar outro modelo
        if (res.status === 401 || res.status === 402) return null;
        continue;
      }
      const data: any = await res.json();
      const txt = String(data?.choices?.[0]?.message?.content || "").trim();
      if (txt) return txt;
    } catch (e: any) {
      console.warn(`OpenAI (${model}) erro:`, e?.message || e);
    }
  }
  return null;
}
