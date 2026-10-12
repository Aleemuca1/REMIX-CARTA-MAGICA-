import { useEffect, useRef } from "react";

/**
 * Faz o botão "voltar" do celular/navegador fechar
 * a janela aberta (jogo, ateliê, carta...) em vez de sair do site.
 * Funciona com janelas uma por cima da outra: fecha só a de cima.
 */
type Entry = { close: () => void };
const stack: Entry[] = [];
let ignorePops = 0;
let listening = false;

function listen() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("popstate", () => {
    if (ignorePops > 0) {
      ignorePops--;
      return;
    }
    stack.pop()?.close();
  });
}

// Quando uma janela fecha e outra abre logo em seguida (ex.: formulário -> carta),
// reaproveitamos a mesma entrada do histórico em vez de voltar e avançar de novo.
let pendingBacks = 0;
let flushScheduled = false;
function scheduleFlush() {
  if (flushScheduled) return;
  flushScheduled = true;
  setTimeout(() => {
    flushScheduled = false;
    if (pendingBacks > 0) {
      const n = pendingBacks;
      pendingBacks = 0;
      ignorePops++;
      try {
        window.history.go(-n);
      } catch {
        ignorePops--;
      }
    }
  }, 0);
}

export function useBackClose(active: boolean, onClose: () => void) {
  const ref = useRef(onClose);
  ref.current = onClose;
  useEffect(() => {
    if (!active) return;
    listen();
    const entry: Entry = { close: () => ref.current() };
    stack.push(entry);
    if (pendingBacks > 0) {
      pendingBacks--; // reaproveita a entrada da janela que acabou de fechar
    } else {
      try {
        window.history.pushState({ cartaMagicaModal: true }, "");
      } catch {
        /* navegador sem histórico */
      }
    }
    return () => {
      const i = stack.indexOf(entry);
      if (i >= 0) {
        // fechou pelo botão da tela: desfaz a entrada que criamos no histórico
        stack.splice(i, 1);
        pendingBacks++;
        scheduleFlush();
      }
    };
  }, [active]);
}
