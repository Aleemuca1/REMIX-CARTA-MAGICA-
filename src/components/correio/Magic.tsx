/**
 * Magia da tela da cartinha (Correio do Polo Norte):
 * tinta que solta faísca, duende que reage, pote de pó mágico, adesivos, boas-vindas do Papai Noel
 * e o envio com selo de cera + trenó. Tudo fica só no aparelho.
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Baby, Bell, Bike, Bird, Blocks, Bot, BookOpen, Cake, Camera, Candy, CandyCane, Car, Cat, Crown, Dog, Drum, Fish, Footprints,
  Gamepad2, Gift, Guitar, Headphones, Heart, Laptop, Palette, Plane, Rabbit, Rocket, Sailboat, Shirt, Smartphone, Snowflake, Star,
  Tablet, Tent, TrainFront, TreePine, Trophy, Wand2, Watch, type LucideIcon,
} from "lucide-react";
import { SantaHat } from "../ui/Icons";

/* ---------------- presentes que o duende reconhece ---------------- */
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const GIFTS: [string[], LucideIcon][] = [
  [["bicicleta", "bike", "patinete", "skate", "patins"], Bike],
  [["videogame", "video game", "playstation", "ps5", "xbox", "nintendo", "joguinho"], Gamepad2],
  [["carrinho", "hot wheels", "carro de controle"], Car],
  [["lego", "quebra-cabeca", "quebra cabeca", "blocos"], Blocks],
  [["cachorro", "cachorrinho", "filhote"], Dog],
  [["gato", "gatinho"], Cat],
  [["foguete"], Rocket],
  [["trem", "trenzinho"], TrainFront],
  [["aviao", "aviaozinho"], Plane],
  [["boneca", "barbie", "reborn", "bebe"], Baby],
  [["dinossauro", "dino"], Footprints],
  [["fone"], Headphones],
  [["celular"], Smartphone],
  [["tablet", "ipad"], Tablet],
  [["vestido", "roupa", "camisa", "tenis"], Shirt],
  [["violao", "guitarra"], Guitar],
  [["tambor", "bateria"], Drum],
  [["livro", "gibi"], BookOpen],
  [["bola", "futebol", "chuteira", "camisa do time"], Trophy],
  [["massinha", "tinta", "lapis de cor", "canetinha", "pintar", "desenhar"], Palette],
  [["robo"], Bot],
  [["coelho", "coelhinho"], Rabbit],
  [["peixe", "peixinho", "aquario"], Fish],
  [["passarinho", "papagaio"], Bird],
  [["relogio", "smartwatch"], Watch],
  [["camera"], Camera],
  [["barraca", "cabana"], Tent],
  [["barco", "barquinho"], Sailboat],
  [["princesa", "coroa", "fantasia"], Crown],
  [["varinha", "magica", "magico"], Wand2],
  [["bolo", "doce", "chocolate", "pirulito"], Cake],
  [["notebook", "computador"], Laptop],
  [["urso", "ursinho", "pelucia"], Heart],
];

/** Devolve os presentes novos que apareceram no texto (palavra escrita + ícone). */
export function findGifts(text: string, seen: Set<string>): { word: string; icon: LucideIcon }[] {
  const t = ` ${norm(text)} `;
  const out: { word: string; icon: LucideIcon }[] = [];
  for (const [words, icon] of GIFTS) {
    for (const w of words) {
      if (seen.has(w)) continue;
      const re = new RegExp(`[^a-z]${w.replace(/[-\s]/g, "[-\\s]")}s?[^a-z]`);
      if (re.test(t)) {
        seen.add(w);
        out.push({ word: w, icon });
        break;
      }
    }
  }
  return out;
}

/** Posição do cursor dentro do textarea (relativa ao papel), para a tinta soltar faíscas no lugar certo. */
export function caretXY(ta: HTMLTextAreaElement): { x: number; y: number } {
  const cs = getComputedStyle(ta);
  const div = document.createElement("div");
  const props = ["boxSizing", "width", "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "borderTopWidth", "borderLeftWidth", "textTransform", "tabSize"] as const;
  props.forEach((p) => ((div.style as any)[p] = (cs as any)[p]));
  Object.assign(div.style, { position: "absolute", visibility: "hidden", whiteSpace: "pre-wrap", wordWrap: "break-word", top: "0", left: "-9999px" });
  div.textContent = ta.value.slice(0, ta.selectionEnd ?? ta.value.length);
  const span = document.createElement("span");
  span.textContent = ".";
  div.appendChild(span);
  document.body.appendChild(div);
  const lh = parseFloat(cs.lineHeight) || 36;
  const x = ta.offsetLeft + span.offsetLeft;
  const y = ta.offsetTop + span.offsetTop - ta.scrollTop + lh * 0.5;
  div.remove();
  return { x, y };
}

/* ---------------- faíscas da tinta ---------------- */
export type Spark = { id: number; x: number; y: number; dx: number; dy: number; s: number; c: string };
let sparkId = 0;
const SPARK_COLORS = ["#FFD166", "#F4A261", "#FFE9A8", "#EF233C", "#2DC653"];
export const makeSparks = (x: number, y: number, n = 4): Spark[] =>
  Array.from({ length: n }, () => ({
    id: ++sparkId,
    x,
    y,
    dx: (Math.random() - 0.5) * 46,
    dy: -14 - Math.random() * 30,
    s: 0.6 + Math.random() * 0.7,
    c: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
  }));

export function SparkLayer({ sparks }: { sparks: Spark[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {sparks.map((p) => (
          <motion.svg
            key={p.id}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            className="absolute"
            style={{ left: p.x - 7, top: p.y - 7 }}
            initial={{ opacity: 1, scale: 0.2, x: 0, y: 0, rotate: 0 }}
            animate={{ opacity: 0, scale: p.s, x: p.dx, y: p.dy, rotate: 90 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill={p.c} />
          </motion.svg>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- duende ---------------- */
export function ElfFace({ size = 76, talking = false }: { size?: number; talking?: boolean }) {
  return (
    <motion.svg width={size} height={size * 1.12} viewBox="0 0 120 134" aria-hidden="true" animate={talking ? { rotate: [0, -6, 5, -3, 0], y: [0, -4, 0] } : { rotate: 0, y: 0 }} transition={{ duration: 0.7 }}>
      {/* chapéu */}
      <path d="M22 58 C30 28 52 8 86 6 C78 18 74 30 92 52 Z" fill="#1F9D4C" />
      <path d="M86 6 C96 10 104 18 108 30" stroke="#1F9D4C" strokeWidth="10" strokeLinecap="round" fill="none" />
      <circle cx="109" cy="34" r="8" fill="#FFD166" />
      <rect x="16" y="50" width="88" height="14" rx="7" fill="#D90429" />
      <circle cx="34" cy="57" r="2.5" fill="#FFD166" />
      <circle cx="60" cy="57" r="2.5" fill="#FFD166" />
      <circle cx="86" cy="57" r="2.5" fill="#FFD166" />
      {/* orelhas */}
      <path d="M22 80 L2 66 L18 96 Z" fill="#F6C9A0" />
      <path d="M98 80 L118 66 L102 96 Z" fill="#F6C9A0" />
      {/* rosto */}
      <circle cx="60" cy="90" r="36" fill="#FCD9B6" />
      <circle cx="42" cy="100" r="7" fill="#F7A8A8" opacity="0.6" />
      <circle cx="78" cy="100" r="7" fill="#F7A8A8" opacity="0.6" />
      <ellipse cx="47" cy="86" rx="5" ry="6.5" fill="#22305A" />
      <ellipse cx="73" cy="86" rx="5" ry="6.5" fill="#22305A" />
      <circle cx="49" cy="83.5" r="1.8" fill="#fff" />
      <circle cx="75" cy="83.5" r="1.8" fill="#fff" />
      <circle cx="60" cy="96" r="4" fill="#F29A7A" />
      {talking ? <ellipse cx="60" cy="110" rx="9" ry="6" fill="#9B021A" /> : <path d="M48 106 Q60 117 72 106" stroke="#9B021A" strokeWidth="3.5" strokeLinecap="round" fill="none" />}
    </motion.svg>
  );
}

export type ElfMsg = { key: number; text: string; icon?: LucideIcon };
export function ElfHelper({ msg }: { msg: ElfMsg | null }) {
  return (
    <div className="pointer-events-none absolute -right-2 -bottom-3 z-30 flex items-end gap-1.5" id="correio-duende">
      <AnimatePresence mode="wait">
        {msg && (
          <motion.div
            key={msg.key}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            className="mb-10 max-w-[190px] rounded-2xl rounded-br-sm bg-white text-[#22305A] shadow-xl border-2 border-[#1F9D4C] px-3 py-2 text-[13px] font-bold leading-snug flex items-center gap-2"
          >
            {msg.icon && (
              <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 500, damping: 14, delay: 0.1 }} className="shrink-0 grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFE9A8] to-[#E09F2E]">
                <msg.icon className="w-5 h-5 text-[#4A2A00]" />
              </motion.span>
            )}
            <span>{msg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <ElfFace size={64} talking={!!msg} />
    </div>
  );
}

/* ---------------- pote de pó mágico ---------------- */
export const JAR_GOALS = [60, 160, 320];
export function StarJar({ chars }: { chars: number }) {
  const max = JAR_GOALS[JAR_GOALS.length - 1];
  const fill = Math.min(1, chars / max);
  const stars = Math.min(14, Math.floor(fill * 14));
  const level = JAR_GOALS.filter((g) => chars >= g).length;
  const pos = [[30, 78], [44, 74], [56, 79], [38, 66], [50, 63], [26, 60], [58, 66], [34, 52], [47, 50], [56, 54], [28, 44], [42, 40], [53, 42], [36, 30]];
  return (
    <div className="flex items-center gap-2" id="correio-pote" title="Pote de pó mágico">
      <svg width="46" height="56" viewBox="0 0 84 100" aria-hidden="true">
        <defs>
          <clipPath id="jarClip">
            <path d="M18 26 h48 v6 c8 4 10 10 10 18 v36 c0 6 -4 10 -10 10 h-48 c-6 0 -10 -4 -10 -10 v-36 c0 -8 2 -14 10 -18 z" />
          </clipPath>
          <linearGradient id="jarDust" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFE9A8" />
            <stop offset="1" stopColor="#E09F2E" />
          </linearGradient>
        </defs>
        <g clipPath="url(#jarClip)">
          <rect x="0" y="0" width="84" height="100" fill="rgba(255,255,255,0.08)" />
          <motion.rect x="0" width="84" height="100" fill="url(#jarDust)" opacity="0.55" animate={{ y: 96 - fill * 66 }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
          {pos.slice(0, stars).map(([x, y], i) => (
            <motion.path key={i} d="M0 -6 L1.8 -1.8 L6 0 L1.8 1.8 L0 6 L-1.8 1.8 L-6 0 L-1.8 -1.8 Z" fill="#FFF7D6" initial={{ scale: 0 }} animate={{ scale: 1 }} transform={`translate(${x} ${y})`} />
          ))}
        </g>
        <path d="M18 26 h48 v6 c8 4 10 10 10 18 v36 c0 6 -4 10 -10 10 h-48 c-6 0 -10 -4 -10 -10 v-36 c0 -8 2 -14 10 -18 z" fill="none" stroke="#FFD166" strokeWidth="3" />
        <rect x="14" y="14" width="56" height="14" rx="4" fill="#9B021A" stroke="#FFD166" strokeWidth="2" />
      </svg>
      <div className="leading-tight">
        <p className="text-[11px] font-bold text-[#FFD166]">Pó mágico</p>
        <div className="flex gap-0.5 mt-0.5">
          {JAR_GOALS.map((g, i) => (
            <Star key={g} className={`w-3.5 h-3.5 ${i < level ? "text-[#FFD166] fill-[#FFD166]" : "text-white/30"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- adesivos ---------------- */
export const STICKERS: { id: string; icon: LucideIcon; color: string; fill?: string; label: string }[] = [
  { id: "estrela", icon: Star, color: "#E09F2E", fill: "#FFD166", label: "Estrela" },
  { id: "arvore", icon: TreePine, color: "#167A35", fill: "#2DC653", label: "Árvore" },
  { id: "presente", icon: Gift, color: "#9B021A", fill: "#FF5468", label: "Presente" },
  { id: "coracao", icon: Heart, color: "#B8111F", fill: "#EF233C", label: "Coração" },
  { id: "floco", icon: Snowflake, color: "#2563EB", label: "Floco de neve" },
  { id: "sino", icon: Bell, color: "#B5651D", fill: "#FFD166", label: "Sino" },
  { id: "bengala", icon: CandyCane, color: "#D90429", label: "Bengala doce" },
  { id: "doce", icon: Candy, color: "#C026D3", fill: "#F0ABFC", label: "Doce" },
];
export type PlacedSticker = { key: number; id: string; x: number; y: number; rot: number };
const stickerOf = (id: string) => STICKERS.find((s) => s.id === id) ?? STICKERS[0];

export function StickerLayer({ items, bounds, onRemove }: { items: PlacedSticker[]; bounds: React.RefObject<HTMLDivElement | null>; onRemove: (key: number) => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10" id="correio-adesivos">
      <AnimatePresence>
        {items.map((s) => {
          const def = stickerOf(s.id);
          return (
            <motion.button
              key={s.key}
              type="button"
              drag
              dragConstraints={bounds}
              dragElastic={0.1}
              dragMomentum={false}
              onTap={() => onRemove(s.key)}
              initial={{ scale: 0, rotate: s.rot - 40 }}
              animate={{ scale: 1, rotate: s.rot }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 16 }}
              className="pointer-events-auto absolute grid place-items-center w-11 h-11 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.25)] border-2 border-white cursor-grab active:cursor-grabbing touch-none"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              aria-label={`Adesivo ${def.label} (toque para tirar)`}
            >
              <def.icon className="w-7 h-7" color={def.color} fill={def.fill ?? "none"} strokeWidth={2} />
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function StickerTray({ onAdd }: { onAdd: (id: string) => void }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1" id="correio-adesivos-bandeja">
      <span className="text-[11px] font-bold text-white/70 shrink-0 mr-1">Adesivos:</span>
      {STICKERS.map((s) => (
        <motion.button
          key={s.id}
          type="button"
          whileTap={{ scale: 0.85 }}
          whileHover={{ y: -2 }}
          onClick={() => onAdd(s.id)}
          className="shrink-0 grid place-items-center w-9 h-9 rounded-full bg-white shadow cursor-pointer"
          aria-label={`Colar adesivo ${s.label}`}
          id={`adesivo-${s.id}`}
        >
          <s.icon className="w-5 h-5" color={s.color} fill={s.fill ?? "none"} />
        </motion.button>
      ))}
    </div>
  );
}

/* ---------------- boas-vindas do Papai Noel ---------------- */
export function speakSanta(text: string) {
  try {
    if (!("speechSynthesis" in window)) return;
    const s = window.speechSynthesis;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    const v = s.getVoices().find((x) => x.lang?.toLowerCase().startsWith("pt") && /male|daniel|ricardo|antonio|google/i.test(x.name)) ?? s.getVoices().find((x) => x.lang?.toLowerCase().startsWith("pt"));
    if (v) u.voice = v;
    u.pitch = 0.6;
    u.rate = 0.9;
    s.speak(u);
  } catch {
    /* sem voz no navegador */
  }
}

export function SantaWelcome({ name, onDone }: { name: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 6500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0, y: -14, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="flex items-center gap-3 rounded-2xl border border-[#FFD166]/50 bg-gradient-to-r from-[#9B021A] to-[#D90429] p-3 shadow-xl"
      id="correio-boas-vindas"
      role="status"
    >
      <motion.span animate={{ rotate: [0, -10, 8, 0] }} transition={{ duration: 1.2, repeat: 2 }} className="shrink-0 grid place-items-center w-12 h-12 rounded-full bg-white">
        <SantaHat size={34} />
      </motion.span>
      <p className="text-sm leading-snug">
        <b className="text-[#FFD166]">Ho ho ho!</b> Estou ansioso para ler a sua cartinha{name ? `, ${name}` : ""}! Escreva com calma, eu leio tudinho.
      </p>
    </motion.div>
  );
}

/* ---------------- envio: selo de cera + trenó ---------------- */
export function SealSend({ initial, onSealed, onCancel }: { initial: string; onSealed: () => void; onCancel: () => void }) {
  const [phase, setPhase] = useState<"selar" | "selado" | "voando">("selar");
  const done = useRef(false);
  const press = () => {
    if (phase !== "selar") return;
    setPhase("selado");
    setTimeout(() => setPhase("voando"), 900);
    setTimeout(() => {
      if (!done.current) {
        done.current = true;
        onSealed();
      }
    }, 3300);
  };
  return (
    <motion.div className="fixed inset-0 z-[140] bg-[#060B19]/95 flex flex-col items-center justify-center p-6 overflow-hidden text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} id="correio-selo">
      {/* estrelinhas no céu */}
      {Array.from({ length: 30 }, (_, i) => (
        <motion.span key={i} className="absolute rounded-full bg-white" style={{ width: 2 + (i % 3), height: 2 + (i % 3), left: `${(i * 37) % 100}%`, top: `${(i * 53) % 70}%` }} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5 + (i % 5) * 0.4, repeat: Infinity }} />
      ))}

      <p className="font-cinzel text-xl sm:text-2xl font-bold text-center mb-8 relative z-10">
        {phase === "selar" ? "Aperte o selo para fechar a cartinha" : phase === "selado" ? "Cartinha selada!" : "A caminho do Polo Norte..."}
      </p>

      {/* envelope */}
      <motion.div
        className="relative w-[280px] h-[180px]"
        animate={phase === "voando" ? { x: 420, y: -420, scale: 0.15, rotate: 18, opacity: 0 } : { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }}
        transition={phase === "voando" ? { duration: 1.6, ease: [0.6, 0, 0.4, 1], delay: 0.5 } : { type: "spring" }}
      >
        <div className="absolute inset-0 rounded-xl bg-[#FBF3E2] shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden">
          <svg viewBox="0 0 280 180" className="absolute inset-0 w-full h-full" aria-hidden="true">
            <path d="M0 180 L140 90 L280 180 Z" fill="#F1E4C6" />
            <path d="M0 0 L0 180 L120 95 Z" fill="#EFE0BE" />
            <path d="M280 0 L280 180 L160 95 Z" fill="#EFE0BE" />
          </svg>
        </div>
        {/* aba */}
        <motion.svg viewBox="0 0 280 110" className="absolute left-0 top-0 w-full origin-top" style={{ height: 110 }} animate={{ rotateX: phase === "selar" ? 160 : 0 }} transition={{ duration: 0.5 }} aria-hidden="true">
          <path d="M0 0 L280 0 L140 105 Z" fill="#E9D7AF" stroke="#D9C495" strokeWidth="1.5" />
        </motion.svg>
        {/* selo de cera */}
        <motion.button
          type="button"
          onClick={press}
          className="absolute w-20 h-20 rounded-full grid place-items-center cursor-pointer"
          style={{ left: "calc(50% - 40px)", top: 46, background: "radial-gradient(circle at 35% 30%, #FF5468, #B8111F 55%, #7A0612)" }}
          animate={phase === "selar" ? { scale: [1, 1.08, 1] } : { scale: [1.5, 1] }}
          transition={phase === "selar" ? { duration: 1.1, repeat: Infinity } : { duration: 0.35, ease: "easeOut" }}
          aria-label="Apertar o selo"
          id="correio-selo-btn"
        >
          <span className="absolute inset-1.5 rounded-full border-2 border-[#FFB3BD]/50" />
          <span className="font-cinzel text-3xl font-extrabold text-[#FFE1E6] drop-shadow">{initial || "N"}</span>
        </motion.button>
        {phase === "selado" && (
          <motion.span className="absolute w-20 h-20 rounded-full border-4 border-[#FFD166]" style={{ left: "calc(50% - 40px)", top: 46 }} initial={{ scale: 1, opacity: 0.9 }} animate={{ scale: 2.6, opacity: 0 }} transition={{ duration: 0.8 }} />
        )}
      </motion.div>

      {/* trenó cruzando o céu */}
      {phase === "voando" && (
        <motion.div className="absolute top-[18%] left-0 flex items-end gap-1 text-[#FFD166]" initial={{ x: "-40vw", y: 40 }} animate={{ x: "120vw", y: -60 }} transition={{ duration: 2.6, ease: "easeInOut" }} aria-hidden="true">
          <svg width="220" height="70" viewBox="0 0 220 70">
            {[0, 46].map((dx) => (
              <g key={dx} transform={`translate(${dx} 0)`} fill="#FFD166">
                <path d="M10 40 C14 30 30 28 38 32 L46 22 L48 30 L44 36 C44 44 36 48 26 48 L22 58 L18 58 L20 48 L14 48 L12 58 L8 58 L10 46 Z" />
                <path d="M44 22 L40 12 M44 22 L50 13 M48 18 L54 14" stroke="#FFD166" strokeWidth="2" fill="none" />
              </g>
            ))}
            <path d="M96 30 L104 28" stroke="#FFD166" strokeWidth="1.5" />
            <path d="M108 30 C108 46 120 50 150 50 L176 50 C184 50 188 42 186 30 L150 34 Z" fill="#D90429" stroke="#FFD166" strokeWidth="2" />
            <path d="M104 56 C110 62 120 62 190 62 C196 62 200 58 198 54" stroke="#FFD166" strokeWidth="3" fill="none" />
            <rect x="150" y="18" width="18" height="16" rx="2" fill="#2DC653" />
            <rect x="166" y="22" width="14" height="12" rx="2" fill="#FFD166" />
          </svg>
          <motion.div className="h-1 w-40 rounded-full bg-gradient-to-l from-[#FFD166] to-transparent mb-6" />
        </motion.div>
      )}

      {phase === "selar" && (
        <button onClick={onCancel} className="mt-10 text-sm text-white/60 underline cursor-pointer relative z-10">
          Voltar e escrever mais
        </button>
      )}
    </motion.div>
  );
}
