export type PlanType = "free" | "pro" | "natal" | "familia";

export interface Letter {
  id: string;
  childName: string;
  age: number;
  city: string;
  achievements: string;
  giftRequest: string;
  parentNotes?: string;
  style: string;
  plan: PlanType;
  date: string;
  token: string;
  deliveryStatus: "dispatched" | "delivered" | "pending";
  trackingCode: string;
  content: string;
  audioUrl?: string;
  photoUrl?: string;
  /** cor da carta: classico, rosa, lilas, azul ou verde */
  theme?: string;
  /** Correio do Polo Norte */
  childText?: string;
  wishes?: { pedidos: string[]; perguntas: string[]; contou: string[] };
  deliverAt?: string;
  reviewStatus?: string;
  protocol?: number;
}
