const SMALL = new Set(["de", "da", "do", "das", "dos", "e"]);

/** "samuel" → "Samuel", "maria da silva" → "Maria da Silva" */
export function prettyName(s: string) {
  return (s || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .split(" ")
    .map((w, i) => (i > 0 && SMALL.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

/** "sao paulo, sp" → "São Paulo, SP"; "rio de janeiro - rj" → "Rio de Janeiro - RJ" */
export function prettyCity(s: string) {
  const fixed = prettyName(s)
    .replace(/\bSao\b/g, "São")
    .replace(/\bJoao\b/g, "João")
    .replace(/\bGoiania\b/g, "Goiânia")
    .replace(/\bBrasilia\b/g, "Brasília")
    .replace(/\bMaceio\b/g, "Maceió")
    .replace(/\bVitoria\b/g, "Vitória")
    .replace(/\bCuiaba\b/g, "Cuiabá")
    .replace(/\bBelem\b/g, "Belém")
    .replace(/\bFlorianopolis\b/g, "Florianópolis");
  // sigla do estado no final em maiúsculas (", sp" / "- rj" / "/mg" / " sp")
  return fixed.replace(/([,\-/ ]\s*)([A-Za-z]{2})$/, (_m, sep, uf) => sep + uf.toUpperCase());
}
