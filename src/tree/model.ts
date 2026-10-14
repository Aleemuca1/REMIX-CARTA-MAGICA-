/** Árvore de Natal da Família: enfeites com frases, montada por pais, filhos e avós. */

export type OrnamentType = "bola" | "sino" | "laco" | "doce" | "coracao" | "estrela" | "boneco" | "presente" | "brilho" | "anjo";

export type Ornament = {
  id: string;
  type: OrnamentType;
  color: string;
  x: number; // coordenadas no desenho da árvore (viewBox 600 x 720)
  y: number;
  text?: string;
  author?: string;
  at?: string;
};

export type TreeState = {
  title: string;
  ornaments: Ornament[];
  token?: string; // quando a árvore foi compartilhada
  editKey?: string; // só quem criou tem
};

export const VIEW_W = 600;
export const VIEW_H = 720;
export const MAX_ORNAMENTS = 80;
export const MAX_TEXT = 120;
export const MAX_AUTHOR = 24;

export const ORNAMENT_TYPES: { type: OrnamentType; label: string; emoji: string; pro?: boolean }[] = [
  { type: "bola", label: "Bolinha", emoji: "🔴" },
  { type: "sino", label: "Sino", emoji: "🔔" },
  { type: "laco", label: "Laço", emoji: "🎀" },
  { type: "doce", label: "Bengala", emoji: "🍭" },
  { type: "coracao", label: "Coração", emoji: "❤️" },
  { type: "estrela", label: "Estrela", emoji: "⭐" },
  { type: "boneco", label: "Boneco de neve", emoji: "⛄" },
  { type: "presente", label: "Presente", emoji: "🎁" },
  { type: "brilho", label: "Bola de brilho", emoji: "✨", pro: true },
  { type: "anjo", label: "Anjinho", emoji: "👼", pro: true },
];

/** Plano grátis: até 12 enfeites pendurados por quem criou a árvore. */
export const FREE_ORNAMENTS = 12;

export const ORNAMENT_COLORS = ["#E63946", "#F4A261", "#FFD166", "#2DC653", "#4CC9F0", "#4361EE", "#9B5DE5", "#F72585", "#FFFFFF", "#C0C0C0"];

/** Camadas da copa (triângulos): ápice e base. Usado para desenhar e para saber se o toque caiu na árvore. */
export const TIERS = [
  { apexY: 95, baseY: 265, half: 125 },
  { apexY: 190, baseY: 405, half: 190 },
  { apexY: 315, baseY: 565, half: 255 },
];
export const TREE_CX = 300;
export const GROUND_Y = 600;

export function insideTree(x: number, y: number) {
  return TIERS.some((t) => {
    if (y < t.apexY + 8 || y > t.baseY - 4) return false;
    const half = ((y - t.apexY) / (t.baseY - t.apexY)) * t.half;
    return Math.abs(x - TREE_CX) <= half - 10;
  });
}

/** Onde cada enfeite pode ficar: presentes no chão, o resto pendurado na árvore. */
export function canPlace(type: OrnamentType, x: number, y: number) {
  if (type === "presente") return y >= GROUND_Y - 30 && y <= VIEW_H - 25 && x > 40 && x < VIEW_W - 40;
  return insideTree(x, y);
}

export const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const PHRASE_GROUPS: { label: string; emoji: string; phrases: string[] }[] = [
  {
    label: "Gratidão",
    emoji: "🙏",
    phrases: [
      "Obrigado por cada abraço deste ano.",
      "Sou grato pela nossa família estar junta.",
      "Agradeço pelas risadas na hora do jantar.",
      "Obrigada por cuidar de mim quando fiquei doente.",
      "Grato pelos amigos que chegaram este ano.",
    ],
  },
  {
    label: "Desejos para 2027",
    emoji: "🌟",
    phrases: [
      "Que 2027 tenha mais viagens em família.",
      "Desejo saúde e alegria para todos nós.",
      "Quero aprender a andar de bicicleta sem rodinha!",
      "Que a nossa casa seja sempre cheia de amor.",
      "Desejo mais tardes de jogos e pipoca.",
    ],
  },
  {
    label: "Amor em família",
    emoji: "❤️",
    phrases: [
      "Você é o melhor presente que eu ganhei.",
      "Amo vocês até o Polo Norte e de volta!",
      "Nossa família é a minha estrela favorita.",
      "Com vocês, todo dia parece Natal.",
      "Te amo do tamanho do céu.",
    ],
  },
  {
    label: "Para o Papai Noel",
    emoji: "🎅",
    phrases: [
      "Papai Noel, este ano eu tentei ser muito gentil!",
      "Obrigado, Papai Noel, pela magia do Natal.",
      "Papai Noel, cuide das renas na viagem!",
      "Prometo deixar biscoitos e leite para você.",
    ],
  },
  {
    label: "Bondade",
    emoji: "🤝",
    phrases: [
      "Vou ajudar mais em casa no ano que vem.",
      "Quero doar um brinquedo para outra criança.",
      "Prometo dividir meus brinquedos com meu irmão.",
      "Vou dizer 'obrigado' e 'por favor' todos os dias.",
    ],
  },
];

export const AUTHOR_SUGGESTIONS = ["Mamãe", "Papai", "Vovó", "Vovô", "Titia", "Titio", "Dindo(a)"];

export function sanitizeText(s: unknown, max: number) {
  return String(s ?? "")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}
