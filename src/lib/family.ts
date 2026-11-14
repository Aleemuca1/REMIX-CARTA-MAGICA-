import { Bell, Gift, Home, Snowflake, Sparkles, Star, TreePine, type LucideIcon } from "lucide-react";

/** Perfil da família (Painel dos Pais): nome, bio, avatar e as crianças, guardados uma vez. Sem fotos: o avatar é um ícone. */
export type FamilyChild = { name: string; age?: number };
export type FamilyProfile = { familyName: string; bio: string; avatar: string; children: FamilyChild[]; slug: string; isPublic: boolean };

type AvatarDef = { label: string; icon?: LucideIcon; hat?: boolean; bg: string };
export const AVATARS: Record<string, AvatarDef> = {
  estrela: { label: "Estrela", icon: Star, bg: "linear-gradient(145deg,#FFE9A8,#FFD166 45%,#E09F2E)" },
  arvore: { label: "Árvore", icon: TreePine, bg: "linear-gradient(145deg,#6EE7A0,#2DC653 50%,#167A35)" },
  gorro: { label: "Gorro", hat: true, bg: "linear-gradient(145deg,#FFFFFF,#F1F4FA)" },
  rena: { label: "Neve", icon: Snowflake, bg: "linear-gradient(145deg,#9AD0FF,#4A90E2 55%,#1C3D8C)" },
  sino: { label: "Sino", icon: Bell, bg: "linear-gradient(145deg,#FFD6A5,#F4A261 50%,#B5651D)" },
  presente: { label: "Presente", icon: Gift, bg: "linear-gradient(145deg,#FF5468,#D90429 55%,#8E0A18)" },
  boneco: { label: "Brilho", icon: Sparkles, bg: "linear-gradient(145deg,#E0E7FF,#A5B4FC 55%,#6366F1)" },
  casa: { label: "Casinha", icon: Home, bg: "linear-gradient(145deg,#2A3A6E,#1C2541 60%,#0B132B)" },
};
export const avatarOf = (id?: string) => AVATARS[id || ""] ?? AVATARS.estrela;

let cache: FamilyProfile | null | undefined;
const listeners = new Set<(p: FamilyProfile | null) => void>();

export async function loadProfile(force = false): Promise<{ ready: boolean; profile: FamilyProfile | null }> {
  if (cache !== undefined && !force) return { ready: true, profile: cache };
  try {
    const r = await fetch("/api/me/profile", { credentials: "same-origin" });
    if (!r.ok) return { ready: false, profile: null };
    const d = await r.json();
    cache = d.profile ?? null;
    return { ready: d.ready !== false, profile: cache ?? null };
  } catch {
    return { ready: false, profile: null };
  }
}

export async function saveProfile(p: FamilyProfile): Promise<FamilyProfile> {
  const r = await fetch("/api/me/profile", {
    method: "PUT",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Não foi possível salvar o perfil.");
  cache = d.profile;
  listeners.forEach((l) => l(cache ?? null));
  return d.profile;
}

export const clearProfileCache = () => {
  cache = undefined;
};

export const familyUrl = (slug: string) => `${window.location.origin}/familia/${slug}`;

export type PublicFamily = {
  profile: { familyName: string; bio: string; avatar: string; children: FamilyChild[] };
  letters: { token: string; childName: string; date?: string; theme?: string }[];
  trees: { token: string; title: string }[];
  houses: { token: string; title: string }[];
};
export async function loadPublicFamily(slug: string): Promise<PublicFamily | null> {
  const r = await fetch(`/api/familia/${encodeURIComponent(slug)}`);
  if (!r.ok) return null;
  return r.json();
}

/** Dias que faltam para o Natal (25/12), no horário do aparelho. */
export function daysToChristmas(now = new Date()) {
  let y = now.getFullYear();
  if (now.getMonth() === 11 && now.getDate() > 25) y++;
  const xmas = new Date(y, 11, 25);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((xmas.getTime() - today.getTime()) / 86400000);
}
