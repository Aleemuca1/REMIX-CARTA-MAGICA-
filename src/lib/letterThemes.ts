/**
 * Cores da carta do Papai Noel. A família escolhe livremente (não é "de menino" ou "de menina").
 * As mesmas cores valem na tela, no envelope e nos arquivos baixados (PDF, imagem, story, vídeo).
 */
export type LetterTheme = {
  id: string;
  name: string;
  emoji: string;
  /** títulos, assinatura e nome */
  ink: string;
  /** botões e detalhes fortes */
  accent: string;
  accent2: string;
  /** moldura do papel */
  frame: string;
  /** cor do papel */
  paper: string;
  /** véu de cor por cima do papel (tela) */
  tint: string;
  /** fundo suave da etiqueta "Para" */
  soft: string;
  /** selo de cera: claro → escuro */
  seal: [string, string];
  /** envelope: corpo e aba (claro → escuro) */
  envelope: [string, string];
  flap: [string, string];
};

export const LETTER_THEMES: LetterTheme[] = [
  {
    id: "classico",
    name: "Clássica",
    emoji: "🎅",
    ink: "#9B021A",
    accent: "#D90429",
    accent2: "#EF233C",
    frame: "#FFD166",
    paper: "#FCF9F2",
    tint: "rgba(0,0,0,0)",
    soft: "rgba(217,4,41,0.08)",
    seal: ["#EF233C", "#7A0115"],
    envelope: ["#B5001F", "#7A0015"],
    flap: ["#D90429", "#9B021A"],
  },
  {
    id: "rosa",
    name: "Rosa Encantado",
    emoji: "🎀",
    ink: "#A3164F",
    accent: "#E0457B",
    accent2: "#FF7AA2",
    frame: "#F5A8C5",
    paper: "#FFF6F9",
    tint: "rgba(255,170,200,0.16)",
    soft: "rgba(224,69,123,0.10)",
    seal: ["#FF7AA2", "#9C1450"],
    envelope: ["#E0457B", "#A8195A"],
    flap: ["#F37AA3", "#C42A6B"],
  },
  {
    id: "lilas",
    name: "Lilás Mágico",
    emoji: "🦄",
    ink: "#5E2A96",
    accent: "#8E4BD6",
    accent2: "#B57BFF",
    frame: "#D3BCFF",
    paper: "#FBF8FF",
    tint: "rgba(190,160,255,0.14)",
    soft: "rgba(142,75,214,0.10)",
    seal: ["#B57BFF", "#4E1F86"],
    envelope: ["#8E4BD6", "#5A2496"],
    flap: ["#A877EA", "#6E35B5"],
  },
  {
    id: "azul",
    name: "Azul Gelo",
    emoji: "❄️",
    ink: "#174A84",
    accent: "#2F7DD1",
    accent2: "#4CC9F0",
    frame: "#9FD6FF",
    paper: "#F7FBFF",
    tint: "rgba(160,215,255,0.16)",
    soft: "rgba(47,125,209,0.10)",
    seal: ["#4CA3F0", "#123F78"],
    envelope: ["#2F7DD1", "#164C8C"],
    flap: ["#4E9BE8", "#225FA8"],
  },
  {
    id: "verde",
    name: "Verde Floresta",
    emoji: "🎄",
    ink: "#17633A",
    accent: "#23914F",
    accent2: "#3CBF6E",
    frame: "#FFD166",
    paper: "#F9FCF6",
    tint: "rgba(150,215,160,0.13)",
    soft: "rgba(35,145,79,0.10)",
    seal: ["#3CBF6E", "#0F4D2A"],
    envelope: ["#23914F", "#135C32"],
    flap: ["#3AAE66", "#1C7A43"],
  },
];

export const DEFAULT_THEME = LETTER_THEMES[0];

export function letterTheme(id?: string | null): LetterTheme {
  return LETTER_THEMES.find((t) => t.id === id) || DEFAULT_THEME;
}
