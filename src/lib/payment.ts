import { useEffect } from "react";
import type { Letter } from "../types";
import { getAccessCode, grantFullAccess, saveAccessCode } from "../advent/access";
import { loginWithCode } from "./auth";
import { fetchLetter } from "./correio";

type Msg = { kind: "wait" | "ok" | "error"; text: string } | null;

/** Cria o pedido no servidor e leva para a página de pagamento do Asaas. Devolve uma mensagem de erro, se houver. */
export async function startCheckout(letterId: string | null, plan: "pro" | "natal" | "familia" | "upgrade" | "avulsa", code?: string): Promise<string | null> {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ letterId, plan, code }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.checkoutUrl) {
      return data.error || "Não foi possível abrir o pagamento agora. Tente de novo em instantes.";
    }
    window.location.href = data.checkoutUrl;
    return null;
  } catch {
    return "Sem conexão. Confira a internet e tente de novo.";
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Quando o cliente volta do Asaas (?pedido=...&status=...), espera o webhook
 * confirmar o pagamento e reabre a carta já com o plano liberado.
 */
export function usePaymentReturn(setMsg: (m: Msg) => void, openLetter: (l: Letter) => void, createLetter?: () => void, openCorreio?: (l: Letter) => void) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("pedido");
    if (!orderId) return;
    const status = params.get("status");
    const clean = () => window.history.replaceState(null, "", window.location.pathname);

    if (status === "cancelado" || status === "expirado") {
      clean();
      setMsg({
        kind: "error",
        text:
          status === "expirado"
            ? "O tempo para pagar acabou. É só tentar de novo quando quiser."
            : "O pagamento não foi concluído. Sua carta continua salva.",
      });
      return;
    }

    let stop = false;
    (async () => {
      setMsg({ kind: "wait", text: "Confirmando seu pagamento com o Polo Norte..." });
      // Pix costuma confirmar em segundos; cartão pode levar um pouco mais
      for (let i = 0; i < 40 && !stop; i++) {
        try {
          const r = await fetch(`/api/order/${encodeURIComponent(orderId)}`);
          if (r.ok) {
            const o = await r.json();
            if (o.status === "paid" && o.plan === "pro") {
              // Resposta Mágica: libera esta cartinha e guarda o código para a 2ª cartinha (sem trocar um código de plano que já exista)
              clean();
              if (o.accessCode && !getAccessCode()) saveAccessCode(o.accessCode);
              if (o.letterToken) {
                // a cartinha ainda não foi entregue: busca com a chave de quem enviou e volta para o Correio
                const r = await fetchLetter(o.letterToken).catch(() => ({}) as { letter?: Letter });
                if (r.letter) (openCorreio ?? openLetter)(r.letter);
              }
              setMsg({ kind: "ok", text: "Pagamento confirmado! A Resposta Mágica está liberada: ouça a carta inteira com a voz do Papai Noel, baixe o PDF e o certificado. Você ainda pode mandar mais 1 cartinha pelo Correio, que ela já sai completa. 🎅" });
              return;
            }
            if (o.status === "paid") {
              grantFullAccess();
              if (o.accessCode) {
                saveAccessCode(o.accessCode);
                // já entra na Área dos Pais com o código da compra (sem senha)
                void loginWithCode(o.accessCode).catch(() => {});
              }
              if (o.plan === "upgrade") {
                clean();
                setMsg({ kind: "ok", text: "Pronto! Agora vocês têm o Pacote Família: até 5 crianças e 23 cartas completas. 🎄 Veja tudo no Painel da Família." });
                return;
              }
              if (o.letterToken) {
                const lr = await fetch(`/api/letter/${encodeURIComponent(o.letterToken)}`);
                if (lr.ok) openLetter(await lr.json());
              } else if (createLetter) {
                // pagou direto pelos planos: abre a criação já com as cartas completas liberadas
                setTimeout(createLetter, 1200);
              }
              clean();
              setMsg({
                kind: "ok",
                text:
                  "Pagamento confirmado! As 6 vozes, o PDF, o certificado e o Calendário do Advento estão liberados. 🎄" +
                  (o.plan === "familia"
                    ? " Agora é só criar as cartas: até 5 crianças e 23 cartas completas no total. Acompanhe tudo no Painel da Família (botão Área dos pais)."
                    : o.plan === "natal"
                      ? " Agora é só criar as cartas: até 2 crianças e 10 cartas completas no total. Acompanhe tudo no Painel da Família (botão Área dos pais)."
                      : "") +
                  (o.accessCode
                    ? ` Seu código mágico para abrir em outro aparelho: ${o.accessCode} (guarde, ele também aparece no Calendário).`
                    : ""),
              });
              return;
            }
            if (o.status === "canceled" || o.status === "failed") break;
          }
        } catch {
          /* tenta de novo */
        }
        await sleep(3000);
      }
      if (!stop) {
        setMsg({
          kind: "error",
          text: "Ainda não recebemos a confirmação. Se você pagou, aguarde alguns minutos e recarregue esta página.",
        });
      }
    })();
    return () => {
      stop = true;
    };
  }, []);
}
