/**
 * Regras do calendário:
 * - a porta N abre a partir de N de dezembro;
 * - a porta 1 é uma prévia grátis (abre em qualquer data);
 * - as demais pedem o plano Natal Completo;
 * - ?advento=teste na URL libera tudo (para você testar).
 */
const PROGRESS_KEY = "carta-magica-advento";
const ACCESS_KEY = "carta-magica-advento-acesso";
const NAME_KEY = "carta-magica-nome";
const TEST_KEY = "carta-magica-advento-teste";

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* sem armazenamento */
  }
};

export function isTestMode() {
  try {
    const p = new URLSearchParams(window.location.search).get("advento");
    if (p === "teste") sessionStorage.setItem(TEST_KEY, "1");
    return sessionStorage.getItem(TEST_KEY) === "1";
  } catch {
    return false;
  }
}

/** Ano do calendário atual (em janeiro ainda vale o de dezembro passado). */
function adventYear(now = new Date()) {
  return now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
}

export function daysUntilOpen(day: number, now = new Date()) {
  const open = new Date(adventYear(now), 11, day, 0, 0, 0);
  const diff = open.getTime() - now.getTime();
  return diff <= 0 ? 0 : Math.ceil(diff / 86400000);
}

export function isDateOpen(day: number) {
  return isTestMode() || daysUntilOpen(day) === 0;
}

export function hasFullAccess() {
  return isTestMode() || read(ACCESS_KEY) === "natal";
}

const CODE_KEY = "carta-magica-codigo";
/** Código mágico do pedido pago (para abrir em outro aparelho). */
export function saveAccessCode(code: string) {
  write(CODE_KEY, code);
}
export function getAccessCode() {
  return read(CODE_KEY) || "";
}

/** Chamado depois do pagamento do plano Natal Completo. */
export function grantFullAccess() {
  write(ACCESS_KEY, "natal");
}

export function canPlay(day: number) {
  if (day === 1) return true; // prévia grátis
  return hasFullAccess() && isDateOpen(day);
}

export function getProgress(): number[] {
  try {
    return JSON.parse(read(PROGRESS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function markDone(day: number) {
  const p = new Set(getProgress());
  p.add(day);
  write(PROGRESS_KEY, JSON.stringify([...p]));
  return [...p];
}

export function getChildName() {
  return read(NAME_KEY) || "";
}
export function setChildName(n: string) {
  write(NAME_KEY, n.trim().slice(0, 20));
}
