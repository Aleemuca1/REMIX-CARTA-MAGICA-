// Envio de e-mail depois da compra, usando o Resend (resend.com).
// Variáveis (só na Vercel):
//   RESEND_API_KEY  chave da API do Resend (re_...)
//   EMAIL_FROM      remetente com domínio verificado, ex.: "Carta Mágica <papainoel@cartamagica.com.br>"
// Sem essas variáveis o site funciona normalmente, só não envia o e-mail.

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

export async function sendPurchaseEmail(opts: {
  to: string;
  childName: string;
  letterUrl: string;
  siteUrl: string;
  accessCode?: string;
}): Promise<boolean> {
  if (!emailConfigured()) return false;
  const name = esc(opts.childName || "seu filho");
  const code = opts.accessCode
    ? `<p style="margin:24px 0 8px">Seu <b>código mágico</b> para abrir o Calendário do Advento em outro celular ou tablet:</p>
       <p style="font-size:30px;letter-spacing:6px;font-weight:bold;color:#9B021A;margin:0">${esc(opts.accessCode)}</p>
       <p style="font-size:13px;color:#555">No site, vá até o Calendário do Advento e toque em “Já comprou? Use seu código mágico”.</p>`
    : "";
  const html = `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;background:#FBF7EF;border:2px solid #FFD166;border-radius:16px;padding:28px;color:#1C2541">
  <p style="font-size:13px;letter-spacing:2px;color:#9B021A;font-weight:bold;margin:0">CORREIO REAL DO POLO NORTE</p>
  <h1 style="font-size:24px;margin:12px 0">Ho Ho Ho! A magia de ${name} está liberada 🎅</h1>
  <p>Obrigado pela sua compra! A carta completa com a voz do Papai Noel, o PDF para imprimir e o Calendário do Advento já estão prontos.</p>
  <p style="text-align:center;margin:28px 0"><a href="${esc(opts.letterUrl)}" style="background:#D90429;color:#fff;text-decoration:none;padding:14px 26px;border-radius:999px;font-weight:bold;font-family:Arial,sans-serif">Abrir a carta de ${name}</a></p>
  ${code}
  <p style="margin-top:28px">Guarde este e-mail: o link funciona até o Natal e você pode enviar para os avós e tios.</p>
  <p style="font-size:12px;color:#777;margin-top:28px">Carta Mágica · <a href="${esc(opts.siteUrl)}" style="color:#777">${esc(opts.siteUrl.replace(/^https?:\/\//, ""))}</a> · Dúvidas? Responda este e-mail.</p>
</div>`;
  try {
    const res = await fetch(process.env.RESEND_API_URL || "https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [opts.to],
        subject: `🎅 A carta do Papai Noel para ${opts.childName || "seu filho"} está liberada`,
        html,
      }),
    });
    if (!res.ok) console.warn("Resend falhou:", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e: any) {
    console.warn("Resend erro:", e?.message || e);
    return false;
  }
}

async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  if (!emailConfigured()) return false;
  try {
    const res = await fetch(process.env.RESEND_API_URL || "https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject, html }),
    });
    if (!res.ok) console.warn("Resend falhou:", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e: any) {
    console.warn("Resend erro:", e?.message || e);
    return false;
  }
}

const frame = (inner: string, siteUrl: string) => `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;background:#FBF7EF;border:2px solid #FFD166;border-radius:16px;padding:28px;color:#1C2541">
  <p style="font-size:13px;letter-spacing:2px;color:#9B021A;font-weight:bold;margin:0">CORREIO REAL DO POLO NORTE</p>
  ${inner}
  <p style="font-size:12px;color:#777;margin-top:28px">Carta Mágica · <a href="${esc(siteUrl)}" style="color:#777">${esc(siteUrl.replace(/^https?:\/\//, ""))}</a></p>
</div>`;

/** Código de 6 dígitos para o responsável entrar na Área dos Pais. */
export async function sendLoginCode(opts: { to: string; code: string; siteUrl: string }): Promise<boolean> {
  const inner = `<h1 style="font-size:22px;margin:12px 0">Seu código para entrar 🔐</h1>
  <p>Use este código na Carta Mágica para entrar na Área dos Pais:</p>
  <p style="font-size:36px;letter-spacing:10px;font-weight:bold;color:#9B021A;margin:18px 0;font-family:Arial,sans-serif">${esc(opts.code)}</p>
  <p style="font-size:13px;color:#555">O código vale por 10 minutos. Se não foi você que pediu, é só ignorar este e-mail.</p>`;
  return sendMail(opts.to, `${opts.code} é o seu código da Carta Mágica`, frame(inner, opts.siteUrl));
}

/** Link da carta salva, para o responsável guardar e mandar para a família. */
export async function sendLetterLink(opts: { to: string; childName: string; letterUrl: string; siteUrl: string }): Promise<boolean> {
  const name = esc(opts.childName || "seu filho");
  const inner = `<h1 style="font-size:22px;margin:12px 0">A carta de ${name} está guardada 🎅</h1>
  <p>Este é o link da carta do Papai Noel. Ele fica salvo também em <b>Minhas cartas</b>, na Área dos Pais.</p>
  <p style="text-align:center;margin:28px 0"><a href="${esc(opts.letterUrl)}" style="background:#D90429;color:#fff;text-decoration:none;padding:14px 26px;border-radius:999px;font-weight:bold;font-family:Arial,sans-serif">Abrir a carta de ${name}</a></p>
  <p>Dá para mandar este link para os avós e tios pelo WhatsApp. 💌</p>`;
  return sendMail(opts.to, `🎅 A carta do Papai Noel para ${opts.childName || "seu filho"}`, frame(inner, opts.siteUrl));
}
