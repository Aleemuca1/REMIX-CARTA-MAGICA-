export type TemplateId = "dourado" | "fotografico" | "guirlanda" | "estrelado" | "papainoel" | "rustico" | "vila" | "presentes" | "neve";
export type Orientation = "retrato" | "paisagem";

/** Enquadramento da foto dentro da moldura. ox/oy vão de -1 a 1 (quanto da sobra aparece de cada lado). */
export type Crop = { zoom: number; ox: number; oy: number; fit: boolean; /** quartos de volta (0-3) aplicados à foto */ rot?: number };

export type CardTexts = {
  title: string; // "Feliz Natal"
  family: string; // "Família Silva"
  children: string; // "Ana, Pedro e Leo"
  message: string;
  signature: string; // "Com amor, Marcos e Júlia"
  year: string;
};

export type CardData = CardTexts & {
  template: TemplateId;
  orientation: Orientation;
  photo: CanvasImageSource | null;
  photoW: number;
  photoH: number;
  crop: Crop;
  watermark?: boolean;
};

/** Para o vídeo: opacidade/entrada de cada elemento (0..1). Sem animação = tudo 1. */
export type Anim = { title: number; family: number; message: number; sign: number; photo: number; zoom: number; t: number };
export const STILL: Anim = { title: 1, family: 1, message: 1, sign: 1, photo: 1, zoom: 1, t: -1 };

/** front = cartão simples (tudo na frente) · cover = capa do cartão dobrado (mensagem vai para dentro). */
export type FaceMode = "front" | "cover";
