/** Desenhos de Natal para colorir (traços originais, 400x400). */

export type Design = { id: string; name: string; emoji: string; exclusive?: boolean; body: string };

const star = (cx: number, cy: number, R: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;
    return `${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)}`;
  }).join(" ");

const wreathLeaves = () =>
  Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI * 2) / 12;
    const x = 200 + Math.cos(a) * 110, y = 200 + Math.sin(a) * 110;
    const deg = (a * 180) / Math.PI + 90;
    return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="24" ry="12" transform="rotate(${deg.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }).join("") +
  Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI * 2) / 6 + Math.PI / 12;
    return `<circle cx="${(200 + Math.cos(a) * 112).toFixed(1)}" cy="${(200 + Math.sin(a) * 112).toFixed(1)}" r="9"/>`;
  }).join("");

export const DESIGNS: Design[] = [
  {
    id: "arvore",
    name: "Árvore de Natal",
    emoji: "🎄",
    body: `
      <path d="M200 52 L150 130 L175 130 L120 210 L150 210 L90 300 L310 300 L250 210 L280 210 L225 130 L250 130 Z"/>
      <path d="M175 130 L225 130"/><path d="M150 210 L250 210"/>
      <path d="M127 245 Q200 282 270 240"/>
      <polygon points="${star(200, 42, 26, 11)}"/>
      <circle cx="192" cy="105" r="9"/><circle cx="165" cy="183" r="9"/><circle cx="232" cy="172" r="9"/>
      <circle cx="150" cy="275" r="9"/><circle cx="205" cy="232" r="9"/><circle cx="258" cy="278" r="9"/>
      <rect x="180" y="300" width="40" height="40"/>
      <path d="M145 340 L255 340 L242 385 L158 385 Z"/>`,
  },
  {
    id: "boneco",
    name: "Boneco de neve",
    emoji: "⛄",
    body: `
      <circle cx="200" cy="292" r="78"/><circle cx="200" cy="178" r="55"/><circle cx="200" cy="92" r="40"/>
      <rect x="150" y="50" width="100" height="12" rx="4"/><rect x="170" y="8" width="60" height="44"/><rect x="170" y="36" width="60" height="10"/>
      <circle cx="185" cy="84" r="4" fill="#1E2340"/><circle cx="215" cy="84" r="4" fill="#1E2340"/>
      <path d="M200 96 L242 103 L200 110 Z"/>
      <path d="M150 134 Q200 152 250 134 L252 150 Q200 170 148 150 Z"/>
      <path d="M220 152 L240 152 L246 204 L226 206 Z"/>
      <circle cx="200" cy="170" r="6"/><circle cx="200" cy="195" r="6"/><circle cx="200" cy="270" r="7"/><circle cx="200" cy="302" r="7"/>
      <path d="M148 178 L92 140 M108 150 L100 128"/><path d="M252 178 L308 140 M292 150 L300 128"/>`,
  },
  {
    id: "presente",
    name: "Presente",
    emoji: "🎁",
    body: `
      <rect x="90" y="172" width="220" height="188" rx="6"/>
      <rect x="75" y="132" width="250" height="44" rx="6"/>
      <rect x="185" y="132" width="30" height="228"/>
      <rect x="90" y="248" width="220" height="30"/>
      <path d="M200 132 C150 70 115 115 200 132"/><path d="M200 132 C250 70 285 115 200 132"/>
      <circle cx="200" cy="128" r="12"/>
      <circle cx="130" cy="210" r="11"/><circle cx="265" cy="215" r="11"/><circle cx="135" cy="320" r="11"/><circle cx="270" cy="322" r="11"/>`,
  },
  {
    id: "sino",
    name: "Sino",
    emoji: "🔔",
    body: `
      <path d="M200 72 C140 72 125 132 125 192 C125 242 102 262 95 282 L305 282 C298 262 275 242 275 192 C275 132 260 72 200 72 Z"/>
      <rect x="88" y="282" width="224" height="22" rx="8"/>
      <circle cx="200" cy="322" r="18"/>
      <path d="M126 205 Q200 225 274 205"/>
      <polygon points="${star(200, 150, 26, 11)}"/>
      <path d="M200 60 C160 22 132 66 200 60"/><path d="M200 60 C240 22 268 66 200 60"/>
      <circle cx="200" cy="60" r="10"/>`,
  },
  {
    id: "noel",
    name: "Papai Noel",
    emoji: "🎅",
    body: `
      <path d="M125 134 Q165 40 255 58 Q300 72 306 122 L284 128 Q276 98 248 92 Q262 112 276 134 Z"/>
      <circle cx="304" cy="132" r="17"/>
      <ellipse cx="200" cy="198" rx="66" ry="60"/>
      <rect x="112" y="128" width="176" height="34" rx="17"/>
      <path d="M138 205 Q128 292 200 324 Q272 292 262 205 Q232 242 200 237 Q168 242 138 205 Z"/>
      <path d="M200 228 Q175 208 152 228 Q175 244 200 233 Q225 244 248 228 Q225 208 200 228 Z"/>
      <circle cx="200" cy="210" r="11"/>
      <circle cx="178" cy="188" r="5" fill="#1E2340"/><circle cx="222" cy="188" r="5" fill="#1E2340"/>
      <path d="M190 258 Q200 266 210 258"/>`,
  },
  {
    id: "rena",
    name: "Rena",
    emoji: "🦌",
    body: `
      <path d="M160 142 L138 58 L150 55 L160 94 L180 68 L189 75 L166 110 L174 140 Z"/>
      <path d="M240 142 L262 58 L250 55 L240 94 L220 68 L211 75 L234 110 L226 140 Z"/>
      <path d="M138 168 Q90 140 98 178 Q118 190 142 182 Z"/><path d="M262 168 Q310 140 302 178 Q282 190 258 182 Z"/>
      <ellipse cx="200" cy="218" rx="70" ry="84"/>
      <ellipse cx="200" cy="272" rx="48" ry="38"/>
      <ellipse cx="200" cy="252" rx="19" ry="14"/>
      <circle cx="176" cy="198" r="6" fill="#1E2340"/><circle cx="224" cy="198" r="6" fill="#1E2340"/>
      <path d="M185 288 Q200 298 215 288"/>
      <path d="M148 300 Q200 332 252 300 L256 320 Q200 352 144 320 Z"/>
      <circle cx="200" cy="342" r="13"/>`,
  },
  {
    id: "casinha",
    name: "Casinha na neve",
    emoji: "🏠",
    body: `
      <path d="M0 360 Q200 328 400 360 L400 400 L0 400 Z"/>
      <rect x="245" y="112" width="32" height="56"/>
      <rect x="100" y="192" width="200" height="160"/>
      <path d="M78 197 L200 96 L322 197 Z"/>
      <path d="M78 197 Q100 210 120 194 Q140 212 170 197 Q200 214 230 197 Q250 212 280 194 Q300 208 322 197"/>
      <rect x="178" y="272" width="46" height="80" rx="4"/><circle cx="214" cy="314" r="4" fill="#1E2340"/>
      <rect x="120" y="222" width="46" height="40"/><path d="M143 222 L143 262 M120 242 L166 242"/>
      <rect x="236" y="222" width="46" height="40"/><path d="M259 222 L259 262 M236 242 L282 242"/>
      <polygon points="${star(60, 60, 24, 10)}"/>
      <circle cx="335" cy="60" r="26"/>
      <path d="M340 352 L372 352 L356 300 Z"/>`,
  },
  {
    id: "meia",
    name: "Meia de Natal",
    emoji: "🧦",
    body: `
      <path d="M150 88 L250 88 L250 230 Q250 270 290 290 Q332 316 302 346 Q276 370 230 346 L170 302 Q138 280 150 240 Z"/>
      <rect x="132" y="40" width="136" height="52" rx="12"/>
      <path d="M290 290 Q332 316 302 346 Q286 358 266 352 Q286 322 290 290 Z"/>
      <polygon points="${star(200, 172, 34, 14)}"/>
      <circle cx="170" cy="250" r="9"/><circle cx="215" cy="290" r="9"/>`,
  },
  {
    id: "biscoito",
    name: "Biscoito de gengibre",
    emoji: "🍪",
    exclusive: true,
    body: `
      <path d="M170 136 L120 150 Q95 160 105 185 Q115 200 140 190 L160 185 L150 260 L120 320 Q110 345 135 350 Q155 352 165 330 L200 280 L235 330 Q245 352 265 350 Q290 345 280 320 L250 260 L240 185 L260 190 Q285 200 295 185 Q305 160 280 150 L230 136 Z"/>
      <circle cx="200" cy="95" r="46"/>
      <circle cx="184" cy="88" r="5" fill="#1E2340"/><circle cx="216" cy="88" r="5" fill="#1E2340"/>
      <path d="M182 110 Q200 124 218 110"/>
      <path d="M200 150 L180 140 L180 160 Z"/><path d="M200 150 L220 140 L220 160 Z"/>
      <circle cx="200" cy="195" r="9"/><circle cx="200" cy="228" r="9"/>
      <path d="M112 168 Q120 178 128 168"/><path d="M272 168 Q280 178 288 168"/>
      <path d="M128 330 Q136 340 144 330"/><path d="M256 330 Q264 340 272 330"/>`,
  },
  {
    id: "guirlanda",
    name: "Guirlanda",
    emoji: "💫",
    exclusive: true,
    body: `
      <circle cx="200" cy="200" r="140"/><circle cx="200" cy="200" r="80"/>
      ${wreathLeaves()}
      <path d="M200 334 C150 296 128 356 200 334"/><path d="M200 334 C250 296 272 356 200 334"/>
      <path d="M194 340 L170 392 L190 386 L200 344 Z"/><path d="M206 340 L230 392 L210 386 L200 344 Z"/>
      <circle cx="200" cy="334" r="11"/>`,
  },
];

export function designSvg(d: Design, size = 400) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="${size}" height="${size}"><g fill="none" stroke="#1E2340" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${d.body}</g></svg>`;
}

export const designDataUrl = (d: Design, size = 400) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(designSvg(d, size));
