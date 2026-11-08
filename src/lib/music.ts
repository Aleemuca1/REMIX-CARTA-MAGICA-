/** Música de Natal cantada (planos pagos): uma por criança. */
export type SongSection = { name: string; lines: string[] };
export type Song = { child: string; title: string; style: string; status: string; lyrics: SongSection[]; url: string | null };
export type MusicStatus = { enabled: boolean; allowed: boolean; limit?: number; used?: number; remaining?: number; songs?: Song[] };

export const SONG_STYLES = [
  { id: "alegre", emoji: "🔔", label: "Alegre", desc: "Pop com sininhos" },
  { id: "festa", emoji: "🥁", label: "Festa", desc: "Para cantar na ceia" },
  { id: "classica", emoji: "🎻", label: "Clássica", desc: "Orquestra mágica" },
  { id: "ninar", emoji: "🌙", label: "De ninar", desc: "Calminha, caixinha de música" },
];

type Who = { token?: string; code?: string };

export async function musicStatus(who: Who): Promise<MusicStatus> {
  const r = await fetch("/api/music/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(who) });
  if (!r.ok) throw new Error("status");
  return r.json();
}

export async function createSong(o: Who & { childName: string; style: string }): Promise<Song> {
  const r = await fetch("/api/music", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(o) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.song) throw new Error(d.error || "Não foi possível criar a música agora.");
  return d.song;
}
