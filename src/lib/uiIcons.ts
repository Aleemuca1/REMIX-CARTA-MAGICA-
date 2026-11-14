/** Ícones da interface (no lugar dos emojis). Só no navegador: o servidor não importa este arquivo. */
import { BookOpen, Bell, Drum, Gift, Heart, Moon, Navigation, PartyPopper, Piano, Sparkles, Star, Zap, type LucideIcon } from "lucide-react";

export const VOICE_ICON: Record<string, LucideIcon> = {
  noel: Gift,
  "noel-alegre": PartyPopper,
  mamae: Heart,
  duende: Sparkles,
  contador: BookOpen,
  anjo: Star,
};
export const voiceIcon = (id: string) => VOICE_ICON[id] ?? Gift;

export const WHEN_ICON: Record<string, LucideIcon> = { agora: Zap, "3dias": Navigation, vespera: Moon, natal: Gift };
export const SONG_ICON: Record<string, LucideIcon> = { alegre: Bell, festa: Drum, classica: Piano, ninar: Moon };
