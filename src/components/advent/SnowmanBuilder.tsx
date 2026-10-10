import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Shuffle, Sparkles } from "lucide-react";
import { musicBox } from "../../lib/christmasMusic";

/* ----------------------------------------------------------------- opções */
const HATS = [
  { id: "gorro", label: "Gorro", icon: "🧶" },
  { id: "noel", label: "Papai Noel", icon: "🎅" },
  { id: "cartola", label: "Cartola", icon: "🎩" },
  { id: "rena", label: "Rena", icon: "🦌" },
  { id: "fone", label: "Fone", icon: "🎧" },
  { id: "nenhum", label: "Sem", icon: "🚫" },
] as const;
const SCARVES = [
  { id: "vermelho", label: "Vermelho", a: "#E63946", b: "#B5172A", striped: false },
  { id: "verde", label: "Listrado", a: "#2DC653", b: "#F4F8FF", striped: true },
  { id: "azul", label: "Azul", a: "#4CC9F0", b: "#2A7FBF", striped: false },
  { id: "doce", label: "Bengala", a: "#EF233C", b: "#FFFFFF", striped: true },
  { id: "roxo", label: "Roxo", a: "#9D4EDD", b: "#FFD166", striped: true },
] as const;
const FACES = [
  { id: "feliz", label: "Feliz", icon: "😊" },
  { id: "piscando", label: "Piscando", icon: "😉" },
  { id: "surpreso", label: "Surpreso", icon: "😮" },
  { id: "apaixonado", label: "Apaixonado", icon: "😍" },
] as const;
const EXTRAS = [
  { id: "oculos", label: "Óculos", icon: "🕶️" },
  { id: "luvas", label: "Luvas", icon: "🧤" },
  { id: "gravata", label: "Gravata", icon: "🎀" },
  { id: "dourados", label: "Botões dourados", icon: "✨" },
] as const;
const SCENES = [
  { id: "noite", label: "Noite", icon: "🌙", sky: ["#0B1535", "#1E3263"] },
  { id: "aurora", label: "Aurora", icon: "🌌", sky: ["#061A2B", "#0F3D3E"] },
  { id: "tarde", label: "Pôr do sol", icon: "🌅", sky: ["#3A1C5C", "#F28C6B"] },
] as const;

type Hat = (typeof HATS)[number]["id"];
type Face = (typeof FACES)[number]["id"];
type Extra = (typeof EXTRAS)[number]["id"];
type Look = { hat: Hat; scarf: number; face: Face; extras: Extra[]; scene: number };

const TABS = ["Chapéu", "Cachecol", "Rosto", "Acessórios", "Cenário"] as const;

/* ----------------------------------------------------------------- desenho */
function SnowmanSVG({ look, name, cheer }: { look: Look; name: string; cheer: boolean }) {
  const sc = SCARVES[look.scarf];
  const scene = SCENES[look.scene];
  const golden = look.extras.includes("dourados");
  const mittens = look.extras.includes("luvas");
  return (
    <svg viewBox="0 0 300 360" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sm-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={scene.sky[0]} />
          <stop offset="1" stopColor={scene.sky[1]} />
        </linearGradient>
        <radialGradient id="sm-snow" cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.55" stopColor="#EEF5FF" />
          <stop offset="1" stopColor="#B9CFEE" />
        </radialGradient>
        <linearGradient id="sm-carrot" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FF9F1C" />
          <stop offset="1" stopColor="#E85D04" />
        </linearGradient>
        <radialGradient id="sm-aurora" cx="0.5" cy="0.2" r="0.8">
          <stop offset="0" stopColor="#2DC653" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#4CC9F0" stopOpacity="0.2" />
          <stop offset="1" stopColor="#4CC9F0" stopOpacity="0" />
        </radialGradient>
        <pattern id="sm-stripes" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="12" height="12" fill={sc.a} />
          <rect width="6" height="12" fill={sc.b} />
        </pattern>
        <radialGradient id="sm-gold" cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#FFF1C1" />
          <stop offset="1" stopColor="#D4A017" />
        </radialGradient>
      </defs>

      {/* cenário */}
      <rect width="300" height="360" fill="url(#sm-sky)" />
      {scene.id === "aurora" && <ellipse cx="150" cy="60" rx="220" ry="90" fill="url(#sm-aurora)" />}
      {scene.id === "noite" && <circle cx="245" cy="55" r="20" fill="#FFF4CF" opacity="0.9" />}
      {scene.id === "tarde" && <circle cx="60" cy="250" r="45" fill="#FFD166" opacity="0.55" />}
      {[[30, 40], [80, 70], [210, 30], [270, 110], [120, 25], [40, 150], [260, 180]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 1.4 : 2} fill="#FFFFFF" opacity={scene.id === "tarde" ? 0.4 : 0.85} />
      ))}
      <path d="M0 300 Q 80 280 150 296 T 300 290 V360 H0Z" fill="#EAF2FF" />
      <path d="M0 312 Q 90 300 170 314 T 300 306 V360 H0Z" fill="#F7FBFF" />
      <ellipse cx="150" cy="326" rx="78" ry="12" fill="#9FB6D9" opacity="0.55" />

      <motion.g
        animate={cheer ? { y: [0, -18, 0, -10, 0] } : { y: [0, -2.5, 0] }}
        transition={cheer ? { duration: 1, repeat: Infinity } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* braços */}
        <g stroke="#6B4226" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M104 178 L58 150 M72 158 L64 140" />
        </g>
        {mittens && <circle cx="56" cy="148" r="9" fill={sc.a} stroke="#00000022" strokeWidth="1" />}
        <motion.g
          style={{ transformOrigin: "196px 178px", transformBox: "view-box" }}
          animate={{ rotate: cheer ? [0, -35, 0] : [0, -22, 0, -16, 0] }}
          transition={{ duration: cheer ? 0.5 : 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M196 178 L244 146 M230 155 L240 138" stroke="#6B4226" strokeWidth="5" strokeLinecap="round" fill="none" />
          {mittens && <circle cx="246" cy="144" r="9" fill={sc.a} stroke="#00000022" strokeWidth="1" />}
        </motion.g>

        {/* corpo */}
        <circle cx="150" cy="262" r="68" fill="url(#sm-snow)" />
        <circle cx="150" cy="178" r="50" fill="url(#sm-snow)" />
        {/* botões */}
        {[160, 180, 200]
          .filter((y) => !(y === 160 && look.extras.includes("gravata")))
          .map((y) => (
            <circle key={y} cx="150" cy={y} r={golden ? 6 : 5} fill={golden ? "url(#sm-gold)" : "#232842"} />
          ))}
        {[245, 272].map((y) => (
          <circle key={y} cx="150" cy={y} r={golden ? 6.5 : 5.5} fill={golden ? "url(#sm-gold)" : "#232842"} />
        ))}

        {/* cachecol */}
        <g>
          <path d="M108 132 Q150 150 192 132 L194 146 Q150 166 106 146Z" fill={sc.striped ? "url(#sm-stripes)" : sc.a} />
          <motion.g
            style={{ transformOrigin: "172px 146px", transformBox: "view-box" }}
            animate={{ rotate: [0, 7, -3, 5, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M164 146 L182 146 L186 196 L166 198Z" fill={sc.striped ? "url(#sm-stripes)" : sc.b} />
            {[168, 173, 178, 183].map((x) => (
              <line key={x} x1={x} y1="197" x2={x + 1} y2="206" stroke={sc.a} strokeWidth="2.5" strokeLinecap="round" />
            ))}
          </motion.g>
        </g>
        {look.extras.includes("gravata") && (
          <g transform="translate(150 158)">
            <path d="M0 0 L-16 -9 L-16 9Z M0 0 L16 -9 L16 9Z" fill="#EF233C" />
            <circle r="4" fill="#B5172A" />
          </g>
        )}

        {/* cabeça */}
        <motion.g
          style={{ transformOrigin: "150px 130px", transformBox: "view-box" }}
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="150" cy="98" r="40" fill="url(#sm-snow)" />
          {/* bochechas */}
          <circle cx="126" cy="110" r="7" fill="#FF8FA3" opacity="0.5" />
          <circle cx="174" cy="110" r="7" fill="#FF8FA3" opacity="0.5" />
          <Face face={look.face} />
          {/* nariz */}
          <path d="M150 101 L186 108 L150 113 Z" fill="url(#sm-carrot)" />
          <path d="M160 104 l2 4 M170 106 l2 3" stroke="#C04A00" strokeWidth="1.2" strokeLinecap="round" />
          {look.extras.includes("oculos") && (
            <g>
              <rect x="120" y="84" width="24" height="15" rx="6" fill="#111827" />
              <rect x="156" y="84" width="24" height="15" rx="6" fill="#111827" />
              <path d="M144 90 L156 90" stroke="#111827" strokeWidth="3" />
              <path d="M124 87 l8 0" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
              <path d="M160 87 l8 0" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}
          <HatShape hat={look.hat} color={sc.a} />
        </motion.g>
      </motion.g>

      {/* placa com nome */}
      {name && (
        <g transform="translate(250 286) rotate(6)">
          <rect x="-4" y="10" width="8" height="40" rx="2" fill="#7B4B2A" />
          <rect x="-40" y="-12" width="80" height="30" rx="6" fill="#A0673D" stroke="#6B3E1E" strokeWidth="2" />
          <text x="0" y="8" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize={name.length > 8 ? 11 : 14} fill="#FFF4DD">
            {name}
          </text>
        </g>
      )}

    </svg>
  );
}

function Face({ face }: { face: Face }) {
  const ink = "#1E2340";
  const eye = (cx: number) => (
    <g className="snowman-eyes">
      <ellipse cx={cx} cy="92" rx="5" ry="6.5" fill={ink} />
      <circle cx={cx + 1.8} cy="89.5" r="1.8" fill="#FFFFFF" />
    </g>
  );
  if (face === "apaixonado")
    return (
      <g>
        {[136, 164].map((x) => (
          <path key={x} d={`M${x} 97 l-7 -7 a4 4 0 0 1 7 -4 a4 4 0 0 1 7 4 z`} fill="#EF233C" />
        ))}
        <path d="M136 118 Q150 132 164 118" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    );
  if (face === "surpreso")
    return (
      <g>
        <circle cx="136" cy="92" r="7" fill={ink} />
        <circle cx="164" cy="92" r="7" fill={ink} />
        <circle cx="138" cy="89" r="2.2" fill="#fff" />
        <circle cx="166" cy="89" r="2.2" fill="#fff" />
        <ellipse cx="150" cy="122" rx="6" ry="7" fill={ink} />
      </g>
    );
  if (face === "piscando")
    return (
      <g>
        <path d="M130 93 Q136 88 142 93" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
        {eye(164)}
        <path d="M134 117 Q150 130 166 115" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    );
  return (
    <g>
      {eye(136)}
      {eye(164)}
      <path d="M135 117 Q150 130 165 117" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

function HatShape({ hat, color }: { hat: Hat; color: string }) {
  switch (hat) {
    case "gorro":
      return (
        <g>
          <path d="M112 78 Q112 36 150 34 Q188 36 188 78Z" fill={color} />
          <path d="M120 60 Q150 52 180 60" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="3" fill="none" />
          <rect x="108" y="70" width="84" height="16" rx="8" fill="#F4F8FF" />
          <circle cx="150" cy="30" r="11" fill="#F4F8FF" />
        </g>
      );
    case "noel":
      return (
        <g>
          <path d="M112 76 Q120 30 162 26 Q196 30 208 70 L196 72 Q186 48 166 44 Q150 50 188 76Z" fill="#E63946" />
          <rect x="106" y="68" width="88" height="16" rx="8" fill="#FFFFFF" />
          <circle cx="206" cy="74" r="10" fill="#FFFFFF" />
        </g>
      );
    case "cartola":
      return (
        <g>
          <rect x="102" y="66" width="96" height="10" rx="5" fill="#1B1B2F" />
          <rect x="120" y="18" width="60" height="52" rx="4" fill="#1B1B2F" />
          <rect x="120" y="56" width="60" height="9" fill="#E63946" />
          <path d="M160 58 l6 -8 l6 8z" fill="#2DC653" />
        </g>
      );
    case "rena":
      return (
        <g stroke="#7B4B2A" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M112 72 Q150 50 188 72" stroke="#5B3A1E" strokeWidth="6" />
          <path d="M124 62 L112 30 M116 42 L102 36 M114 34 L120 22" />
          <path d="M176 62 L188 30 M184 42 L198 36 M186 34 L180 22" />
          <circle cx="132" cy="62" r="4" fill="#FFD166" stroke="none" />
          <circle cx="168" cy="62" r="4" fill="#FFD166" stroke="none" />
        </g>
      );
    case "fone":
      return (
        <g>
          <path d="M112 92 Q112 44 150 42 Q188 44 188 92" stroke="#1F2937" strokeWidth="7" fill="none" strokeLinecap="round" />
          <rect x="100" y="82" width="18" height="28" rx="8" fill={color} />
          <rect x="182" y="82" width="18" height="28" rx="8" fill={color} />
          <rect x="104" y="88" width="6" height="16" rx="3" fill="#FFFFFF" opacity="0.35" />
          <motion.text x="210" y="70" fontSize="16" fill="#FFD166" animate={{ y: [70, 58, 70], opacity: [0, 1, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
            ♪
          </motion.text>
        </g>
      );
    default:
      return null;
  }
}

/* ----------------------------------------------------------------- tela */
export default function SnowmanBuilder({ onDone }: { onDone: () => void }) {
  const [look, setLook] = useState<Look>({ hat: "gorro", scarf: 0, face: "feliz", extras: ["luvas"], scene: 0 });
  const [tab, setTab] = useState<(typeof TABS)[number]>("Chapéu");
  const [name, setName] = useState("");
  const [cheer, setCheer] = useState(false);
  const [done, setDone] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const ping = (n = 0) => musicBox.chime(79 + (n % 5) * 2, undefined, 0.1);
  const set = (patch: Partial<Look>, n = 0) => {
    setLook((l) => ({ ...l, ...patch }));
    ping(n);
  };
  const toggleExtra = (e: Extra, n: number) =>
    set({ extras: look.extras.includes(e) ? look.extras.filter((x) => x !== e) : [...look.extras, e] }, n);

  const surprise = () => {
    const r = (n: number) => Math.floor(Math.random() * n);
    setLook({
      hat: HATS[r(HATS.length - 1)].id,
      scarf: r(SCARVES.length),
      face: FACES[r(FACES.length)].id,
      extras: EXTRAS.filter(() => Math.random() > 0.5).map((e) => e.id),
      scene: r(SCENES.length),
    });
    [84, 88, 91].forEach((n, i) => setTimeout(() => musicBox.chime(n, undefined, 0.12), i * 80));
  };

  const save = async () => {
    const svg = boxRef.current?.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
    await img.decode();
    const c = document.createElement("canvas");
    c.width = 900;
    c.height = 1080;
    c.getContext("2d")!.drawImage(img, 0, 0, 900, 1080);
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `boneco-de-neve${name ? "-" + name : ""}.png`;
    a.click();
  };

  const finish = () => {
    setDone(true);
    setCheer(true);
    onDone();
    setTimeout(() => setCheer(false), 3500);
  };

  const chip = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-[11px] font-semibold border-2 cursor-pointer transition-colors ${
      active ? "bg-[#FFD166]/20 border-[#FFD166] text-white" : "bg-white/5 border-white/10 text-white/80 hover:border-white/30"
    }`;

  return (
    <div className="grid sm:grid-cols-2 gap-5 items-start">
      <div ref={boxRef} className="relative aspect-[5/6] rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl">
        <SnowmanSVG look={look} name={name.trim()} cheer={cheer} />
        <AnimatePresence>
          {cheer && (
            <motion.div className="absolute inset-x-0 top-4 text-center" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="bg-white/90 text-[#1C2541] font-bold text-sm rounded-full px-4 py-1.5 shadow">Uhuuul! Obrigado! ⛄💙</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 12))}
          placeholder="Dê um nome ao boneco"
          className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FFD166]"
        />
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold cursor-pointer ${tab === t ? "bg-[#FFD166] text-[#0B132B]" : "bg-white/10 text-white/80"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 min-h-[132px] content-start">
          {tab === "Chapéu" &&
            HATS.map((h, i) => (
              <button key={h.id} className={chip(look.hat === h.id)} onClick={() => set({ hat: h.id }, i)}>
                <span className="text-xl">{h.icon}</span>
                {h.label}
              </button>
            ))}
          {tab === "Cachecol" &&
            SCARVES.map((s, i) => (
              <button key={s.id} className={chip(look.scarf === i)} onClick={() => set({ scarf: i }, i)}>
                <span
                  className="w-7 h-4 rounded"
                  style={{ background: s.striped ? `repeating-linear-gradient(45deg, ${s.a} 0 5px, ${s.b} 5px 10px)` : s.a }}
                />
                {s.label}
              </button>
            ))}
          {tab === "Rosto" &&
            FACES.map((f, i) => (
              <button key={f.id} className={chip(look.face === f.id)} onClick={() => set({ face: f.id }, i)}>
                <span className="text-xl">{f.icon}</span>
                {f.label}
              </button>
            ))}
          {tab === "Acessórios" &&
            EXTRAS.map((e, i) => (
              <button key={e.id} className={chip(look.extras.includes(e.id))} onClick={() => toggleExtra(e.id, i)}>
                <span className="text-xl">{e.icon}</span>
                {e.label}
              </button>
            ))}
          {tab === "Cenário" &&
            SCENES.map((s, i) => (
              <button key={s.id} className={chip(look.scene === i)} onClick={() => set({ scene: i }, i)}>
                <span className="text-xl">{s.icon}</span>
                {s.label}
              </button>
            ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={surprise} className="bg-white/10 border border-white/20 text-white rounded-full py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer hover:border-[#FFD166]">
            <Shuffle className="w-4 h-4 text-[#FFD166]" /> Surpresa
          </button>
          <button onClick={save} className="bg-white/10 border border-white/20 text-white rounded-full py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer hover:border-[#FFD166]">
            <Download className="w-4 h-4 text-[#FFD166]" /> Salvar imagem
          </button>
        </div>
        {!done ? (
          <button
            onClick={finish}
            className="w-full bg-gradient-to-r from-[#D90429] via-[#EF233C] to-[#D90429] text-white font-bold py-3 rounded-full border border-[#FFD166]/50 btn-shine cursor-pointer"
          >
            <span className="relative z-10 inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FFD166]" /> Pronto, ficou lindo!
            </span>
          </button>
        ) : (
          <p className="text-center text-[#FFD166] font-bold">⭐ Estrela conquistada! Salve a imagem e mostre para a família.</p>
        )}
      </div>
    </div>
  );
}
