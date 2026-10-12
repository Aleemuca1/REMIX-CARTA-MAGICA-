import { useEffect } from "react";
import type { Letter } from "../types";
import { grantFullAccess, saveAccessCode } from "../advent/access";

type Msg = { kind: "wait" | "ok" | "error"; text: string } | null;

/** Cria o pedido no servidor e leva para a página de pagamento do Asaas. Devolve uma mensagem de erro, se houver. */
export async function startCheckout(letterId: string, plan: "pro" | "natal"): Promise<string | null> {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ letterId, plan }),
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
export function usePaymentReturn(setMsg: (m: Msg) => void, openLetter: (l: Letter) => void) {
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
            if (o.status === "paid") {
              grantFullAccess();
              if (o.accessCode) saveAccessCode(o.accessCode);
              if (o.letterToken) {
                const lr = await fetch(`/api/letter/${encodeURIComponent(o.letterToken)}`);
                if (lr.ok) openLetter(await lr.json());
              }
              clean();
              setMsg({
                kind: "ok",
                text:
                  "Pagamento confirmado! A voz do Papai Noel, o PDF e o Calendário do Advento estão liberados. 🎄" +
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
