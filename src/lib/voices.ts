/** Vozes da narração. A primeira é a do plano grátis; as outras são do plano pago. */
export type VoiceId = "noel" | "noel-alegre" | "mamae" | "duende" | "contador";

export type Voice = {
  id: VoiceId;
  label: string;
  emoji: string;
  /** voz pronta do Gemini TTS */
  gemini: string;
  /** como a IA deve interpretar o texto */
  style: string;
  /** ajustes para a voz do navegador (quando não há Gemini) */
  pitch: number;
  rate: number;
  female?: boolean;
  pro: boolean;
};

export const VOICES: Voice[] = [
  {
    id: "noel",
    label: "Papai Noel",
    emoji: "🎅",
    gemini: "Algenib",
    style:
      "Leia como o verdadeiro Papai Noel: voz grave, rouca e muito calorosa de vovô bondoso, falando devagar, sorrindo, com pausas carinhosas entre as frases e uma risada suave 'Ho ho ho' no começo. Emoção e ternura em cada palavra.",
    pitch: 0.55,
    rate: 0.84,
    pro: false,
  },
  {
    id: "noel-alegre",
    label: "Noel animado",
    emoji: "🎉",
    gemini: "Fenrir",
    style:
      "Leia como um Papai Noel muito alegre e animado, cheio de energia e entusiasmo, com risadas 'HO HO HO' bem gostosas, sempre claro e sem pressa, como quem chega com o saco de presentes.",
    pitch: 0.7,
    rate: 0.95,
    pro: true,
  },
  {
    id: "mamae",
    label: "Mamãe Noel",
    emoji: "🤶",
    gemini: "Sulafat",
    style:
      "Leia como a Mamãe Noel: voz feminina doce, carinhosa e acolhedora de vovó, calma e sorridente, como quem conta um segredo bom perto da lareira.",
    pitch: 1.05,
    rate: 0.9,
    female: true,
    pro: true,
  },
  {
    id: "duende",
    label: "Duende",
    emoji: "🧝",
    gemini: "Puck",
    style:
      "Leia como um duende ajudante do Polo Norte: voz brincalhona, travessa e muito animada, com risadinhas, como quem está contando uma novidade incrível.",
    pitch: 1.5,
    rate: 1.04,
    pro: true,
  },
  {
    id: "contador",
    label: "Contador de histórias",
    emoji: "📖",
    gemini: "Charon",
    style:
      "Leia como um contador de histórias de Natal: voz calma, mágica e envolvente, com suspense suave e pausas, como um conto lido antes de dormir.",
    pitch: 0.85,
    rate: 0.86,
    pro: true,
  },
];

export const voiceById = (id: unknown): Voice => VOICES.find((v) => v.id === id) ?? VOICES[0];

/** Recados do calendário: a voz combina com quem escreveu. */
export function voiceForSender(from: string): Voice {
  if (/mam[ãa]e/i.test(from)) return voiceById("mamae");
  if (/duende/i.test(from)) return voiceById("duende");
  return voiceById("noel");
}
