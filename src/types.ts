export type PlanType = "free" | "pro";

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
}
