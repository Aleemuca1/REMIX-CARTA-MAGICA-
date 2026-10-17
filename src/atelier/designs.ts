/** Desenhos de Natal para colorir (traços originais, 400x400). */

export type DesignCat = "noel" | "bichos" | "enfeites" | "cenas";
export type Design = { id: string; name: string; emoji: string; cat: DesignCat; exclusive?: boolean; free?: boolean; body: string };

export const DESIGN_CATS: { id: DesignCat | "todos"; label: string }[] = [
  { id: "todos", label: "✨ Todos" },
  { id: "noel", label: "🎅 Papai Noel" },
  { id: "bichos", label: "🦌 Bichinhos" },
  { id: "enfeites", label: "🔔 Enfeites" },
  { id: "cenas", label: "🏠 Cenas" },
];

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
    cat: "enfeites",
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
    cat: "bichos",
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
    cat: "enfeites",
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
    cat: "enfeites",
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
    cat: "noel",
    name: "Rosto do Papai Noel",
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
    cat: "bichos",
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
    cat: "cenas",
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
    cat: "enfeites",
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
    cat: "cenas",
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
    cat: "enfeites",
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

  {
    id: "noel-corpo",
    cat: "noel",
    name: "Papai Noel acenando",
    emoji: "🎅",
    free: true,
    body: `
      <path d="M150 96 Q172 26 248 42 Q292 54 300 104 L282 108 Q272 80 250 74 Q262 88 262 98 Z"/>
      <circle cx="300" cy="114" r="14"/>
      <rect x="140" y="90" width="124" height="22" rx="11"/>
      <ellipse cx="202" cy="134" rx="40" ry="24"/>
      <circle cx="188" cy="128" r="4" fill="#1E2340"/><circle cx="216" cy="128" r="4" fill="#1E2340"/>
      <circle cx="202" cy="140" r="7"/>
      <path d="M164 142 Q150 204 202 224 Q254 204 240 142 Q224 166 202 162 Q180 166 164 142 Z"/>
      <path d="M202 154 Q186 140 170 152 Q186 164 202 158 Q218 164 234 152 Q218 140 202 154 Z"/>
      <path d="M168 205 Q130 252 132 326 M236 205 Q274 252 272 326"/>
      <rect x="190" y="222" width="24" height="104"/>
      <rect x="132" y="268" width="140" height="22"/>
      <rect x="186" y="263" width="32" height="32" rx="4"/>
      <rect x="124" y="324" width="156" height="20" rx="10"/>
      <path d="M160 200 Q112 228 116 286"/><path d="M150 214 Q124 240 128 284"/>
      <circle cx="120" cy="298" r="15"/>
      <path d="M244 200 Q284 198 306 176"/><path d="M252 218 Q292 214 318 192"/>
      <circle cx="322" cy="178" r="16"/>
      <rect x="150" y="344" width="36" height="24"/><rect x="218" y="344" width="36" height="24"/>
      <path d="M140 368 L188 368 L188 388 L130 388 Q128 376 140 368 Z"/>
      <path d="M264 368 L216 368 L216 388 L274 388 Q276 376 264 368 Z"/>`,
  },
  {
    id: "treno",
    cat: "noel",
    name: "Trenó com presentes",
    emoji: "🛷",
    free: true,
    body: `
      <path d="M44 338 L318 338 Q362 338 364 304 Q364 284 344 286 Q330 290 338 304"/>
      <path d="M100 338 L100 306 M270 338 L270 306"/>
      <path d="M70 306 L300 306 Q334 304 338 262 L344 196 Q306 210 286 244 L112 244 Q92 204 58 196 Q52 262 70 306 Z"/>
      <path d="M112 276 Q142 254 172 276 Q202 298 232 276 Q256 258 280 272"/>
      <rect x="120" y="178" width="62" height="66"/><rect x="144" y="178" width="14" height="66"/>
      <path d="M151 178 C130 150 112 172 151 178 C172 150 190 172 151 178"/>
      <rect x="192" y="150" width="72" height="94"/><rect x="192" y="188" width="72" height="14"/>
      <path d="M228 150 C206 120 188 144 228 150 C250 120 268 144 228 150"/>
      <path d="M268 244 Q256 176 290 156 Q318 180 306 240"/>
      <path d="M282 160 Q290 150 298 160"/>
      <polygon points="${star(60, 80, 22, 9)}"/><polygon points="${star(330, 70, 16, 7)}"/><polygon points="${star(200, 60, 12, 5)}"/>`,
  },
  {
    id: "duende",
    cat: "noel",
    name: "Duende ajudante",
    emoji: "🧝",
    body: `
      <path d="M152 128 Q176 34 284 52 L246 122 Z"/>
      <circle cx="290" cy="50" r="12"/>
      <rect x="146" y="116" width="108" height="22" rx="11"/>
      <circle cx="200" cy="168" r="44"/>
      <path d="M158 160 L122 136 L160 182"/><path d="M242 160 L278 136 L240 182"/>
      <circle cx="184" cy="162" r="5" fill="#1E2340"/><circle cx="216" cy="162" r="5" fill="#1E2340"/>
      <circle cx="174" cy="182" r="7"/><circle cx="226" cy="182" r="7"/>
      <path d="M186 190 Q200 202 214 190"/>
      <path d="M162 214 L134 322 L266 322 L238 214 Z"/>
      <path d="M162 214 L176 232 L190 216 L204 234 L218 216 L232 232 L238 214"/>
      <rect x="140" y="268" width="120" height="16"/><rect x="190" y="264" width="20" height="24"/>
      <path d="M160 226 Q122 252 116 292"/><circle cx="114" cy="300" r="11"/>
      <path d="M240 226 Q278 252 284 292"/><circle cx="286" cy="300" r="11"/>
      <rect x="164" y="322" width="26" height="36"/><rect x="210" y="322" width="26" height="36"/>
      <path d="M190 358 L190 376 L148 376 Q132 372 132 356 Q144 364 164 358 Z"/>
      <path d="M210 358 L210 376 L252 376 Q268 372 268 356 Q256 364 236 358 Z"/>`,
  },
  {
    id: "estrela",
    cat: "enfeites",
    name: "Estrela de Natal",
    emoji: "⭐",
    body: `
      <polygon points="${star(200, 205, 150, 62)}"/>
      <polygon points="${star(200, 205, 70, 30)}"/>
      <circle cx="200" cy="205" r="14"/>
      <polygon points="${star(58, 58, 22, 9)}"/><polygon points="${star(345, 70, 18, 8)}"/><polygon points="${star(352, 350, 20, 8)}"/><polygon points="${star(48, 345, 16, 7)}"/>`,
  },
  {
    id: "bola",
    cat: "enfeites",
    name: "Bola de Natal",
    emoji: "🔴",
    body: `
      <path d="M200 76 Q186 50 200 36 Q216 50 206 62"/>
      <rect x="174" y="74" width="52" height="24" rx="4"/>
      <circle cx="200" cy="228" r="130"/>
      <path d="M74 196 Q200 236 326 196"/><path d="M74 262 Q200 302 326 262"/>
      <polygon points="${star(200, 150, 28, 12)}"/>
      <circle cx="120" cy="230" r="9"/><circle cx="160" cy="240" r="9"/><circle cx="200" cy="244" r="9"/><circle cx="240" cy="240" r="9"/><circle cx="280" cy="230" r="9"/>
      <path d="M150 316 L160 334 L170 316 M230 316 L240 334 L250 316 M190 330 L200 348 L210 330"/>
      <path d="M128 128 Q110 150 104 176"/>`,
  },
  {
    id: "vela",
    cat: "enfeites",
    name: "Vela de Natal",
    emoji: "🕯️",
    body: `
      <path d="M200 136 Q170 108 200 58 Q230 108 200 136 Z"/>
      <path d="M200 128 Q186 112 200 88 Q214 112 200 128 Z"/>
      <rect x="164" y="146" width="72" height="182" rx="6"/>
      <path d="M164 160 Q180 178 192 162 Q198 196 210 164 Q222 186 236 160"/>
      <path d="M200 136 L200 146"/>
      <ellipse cx="200" cy="340" rx="118" ry="24"/>
      <path d="M82 340 L92 366 Q200 392 308 366 L318 340"/>
      <ellipse cx="128" cy="320" rx="34" ry="14" transform="rotate(-20 128 320)"/>
      <ellipse cx="272" cy="320" rx="34" ry="14" transform="rotate(20 272 320)"/>
      <circle cx="152" cy="326" r="8"/><circle cx="248" cy="326" r="8"/><circle cx="160" cy="312" r="8"/>`,
  },
  {
    id: "bengala",
    cat: "enfeites",
    name: "Bengalas doces",
    emoji: "🍭",
    body: `
      <path d="M134 360 L134 130 Q134 86 108 86 Q86 86 86 112 L54 112 Q54 54 108 54 Q166 54 166 130 L166 360 Z"/>
      <path d="M234 360 L234 130 Q234 54 292 54 Q346 54 346 112 L314 112 Q314 86 292 86 Q266 86 266 130 L266 360 Z"/>
      <path d="M134 330 L166 310 M134 280 L166 260 M134 230 L166 210 M134 180 L166 160 M134 128 L162 104 M100 56 L112 86 M56 98 L86 92"/>
      <path d="M234 310 L266 330 M234 260 L266 280 M234 210 L266 230 M234 160 L266 180 M238 104 L266 128 M300 56 L288 86 M344 98 L314 92"/>
      <path d="M200 230 C160 190 140 236 196 238 C150 260 172 290 200 248 C228 290 250 260 204 238 C260 236 240 190 200 230 Z"/>
      <circle cx="200" cy="238" r="12"/>`,
  },
  {
    id: "pinguim",
    cat: "bichos",
    name: "Pinguim de gorro",
    emoji: "🐧",
    body: `
      <ellipse cx="200" cy="246" rx="96" ry="122"/>
      <path d="M200 140 Q138 160 140 250 Q140 340 200 356 Q260 340 260 250 Q262 160 200 140 Z"/>
      <circle cx="176" cy="182" r="9"/><circle cx="224" cy="182" r="9"/>
      <circle cx="176" cy="182" r="4" fill="#1E2340"/><circle cx="224" cy="182" r="4" fill="#1E2340"/>
      <path d="M184 204 L216 204 L200 226 Z"/>
      <path d="M106 220 Q70 262 92 312 Q112 282 116 250"/><path d="M294 220 Q330 262 308 312 Q288 282 284 250"/>
      <ellipse cx="166" cy="372" rx="30" ry="12"/><ellipse cx="234" cy="372" rx="30" ry="12"/>
      <path d="M128 150 Q150 46 252 60 Q296 70 292 118"/>
      <circle cx="292" cy="128" r="14"/>
      <rect x="118" y="136" width="164" height="24" rx="12"/>
      <path d="M128 250 Q200 272 272 250 L272 270 Q200 292 128 270 Z"/>
      <path d="M244 268 L262 330 L238 334 L230 274"/>`,
  },
  {
    id: "urso",
    cat: "bichos",
    name: "Ursinho polar",
    emoji: "🐻‍❄️",
    body: `
      <circle cx="130" cy="96" r="28"/><circle cx="270" cy="96" r="28"/>
      <circle cx="130" cy="96" r="13"/><circle cx="270" cy="96" r="13"/>
      <circle cx="200" cy="168" r="88"/>
      <ellipse cx="200" cy="206" rx="44" ry="32"/>
      <ellipse cx="200" cy="190" rx="15" ry="10" fill="#1E2340"/>
      <path d="M200 200 L200 216 M184 222 Q200 232 216 222"/>
      <circle cx="166" cy="152" r="7" fill="#1E2340"/><circle cx="234" cy="152" r="7" fill="#1E2340"/>
      <path d="M118 250 Q200 282 282 250 L284 272 Q200 304 116 272 Z"/>
      <path d="M232 276 L246 336 L222 340 L214 282"/>
      <path d="M104 268 Q86 330 112 384 L288 384 Q314 330 296 268"/>
      <ellipse cx="146" cy="372" rx="30" ry="18"/><ellipse cx="254" cy="372" rx="30" ry="18"/>`,
  },
  {
    id: "lareira",
    cat: "cenas",
    name: "Lareira com meias",
    emoji: "🔥",
    body: `
      <rect x="38" y="96" width="324" height="30" rx="4"/>
      <rect x="58" y="126" width="284" height="246"/>
      <path d="M118 372 L118 250 Q200 186 282 250 L282 372"/>
      <path d="M58 170 L118 170 M282 170 L342 170 M58 214 L118 214 M282 214 L342 214 M58 258 L118 258 M282 258 L342 258 M58 302 L118 302 M282 302 L342 302 M58 340 L118 340 M282 340 L342 340"/>
      <path d="M150 360 L250 340 M150 340 L250 360"/>
      <path d="M200 340 Q160 300 184 262 Q192 290 200 272 Q206 296 218 268 Q244 306 200 340 Z"/>
      <rect x="84" y="126" width="32" height="14" rx="3"/>
      <path d="M88 140 L112 140 L112 196 Q112 214 94 214 L74 214 Q62 212 64 202 Q66 194 78 194 L88 194 Z"/>
      <rect x="184" y="126" width="32" height="14" rx="3"/>
      <path d="M188 140 L212 140 L212 196 Q212 214 194 214 L174 214 Q162 212 164 202 Q166 194 178 194 L188 194 Z"/>
      <rect x="284" y="126" width="32" height="14" rx="3"/>
      <path d="M288 140 L312 140 L312 196 Q312 214 294 214 L274 214 Q262 212 264 202 Q266 194 278 194 L288 194 Z"/>
      <polygon points="${star(200, 58, 26, 11)}"/>
      <rect x="140" y="70" width="18" height="26"/><rect x="242" y="70" width="18" height="26"/>`,
  },
  {
    id: "casa-biscoito",
    cat: "cenas",
    name: "Casinha de biscoito",
    emoji: "🍬",
    exclusive: true,
    body: `
      <path d="M70 196 L200 82 L330 196 Z"/>
      <path d="M70 196 Q90 216 110 198 Q130 218 150 198 Q170 218 190 198 Q210 218 230 198 Q250 218 270 198 Q290 218 310 198 Q320 212 330 196"/>
      <rect x="92" y="200" width="216" height="160"/>
      <path d="M172 360 L172 290 Q200 262 228 290 L228 360"/>
      <rect x="112" y="226" width="46" height="46" rx="6"/><path d="M135 226 L135 272 M112 249 L158 249"/>
      <rect x="242" y="226" width="46" height="46" rx="6"/><path d="M265 226 L265 272 M242 249 L288 249"/>
      <circle cx="160" cy="150" r="12"/><circle cx="200" cy="124" r="12"/><circle cx="240" cy="150" r="12"/>
      <path d="M70 360 L70 230 Q70 210 52 210 Q38 210 38 226" stroke-width="10"/>
      <path d="M330 360 L330 230 Q330 210 348 210 Q362 210 362 226" stroke-width="10"/>
      <path d="M20 360 L380 360"/>
      <circle cx="120" cy="320" r="10"/><circle cx="280" cy="320" r="10"/><circle cx="200" cy="320" r="5" fill="#1E2340"/>`,
  },
  {
    id: "presepio",
    cat: "cenas",
    name: "Presépio",
    emoji: "⭐",
    exclusive: true,
    body: `
      <polygon points="${star(200, 46, 26, 10)}"/>
      <path d="M200 76 L200 104 M174 64 L156 80 M226 64 L244 80"/>
      <path d="M60 196 L200 108 L340 196"/>
      <path d="M84 182 L84 360 M316 182 L316 360"/>
      <path d="M30 360 L370 360"/>
      <path d="M150 330 L250 330 L236 290 L164 290 Z"/>
      <path d="M150 330 L140 356 M250 330 L260 356"/>
      <ellipse cx="200" cy="284" rx="34" ry="14"/>
      <circle cx="182" cy="276" r="11"/>
      <ellipse cx="182" cy="262" rx="16" ry="5"/>
      <path d="M118 360 L118 268 Q118 240 136 236 Q156 240 156 268 L156 360"/><circle cx="136" cy="222" r="17"/>
      <path d="M244 360 L244 268 Q244 240 262 236 Q282 240 282 268 L282 360"/><circle cx="262" cy="222" r="17"/>
      <path d="M296 360 L296 250 Q290 238 300 232"/>`,
  },
];

export function designSvg(d: Design, size = 400) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="${size}" height="${size}"><g fill="none" stroke="#1E2340" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${d.body}</g></svg>`;
}

export const designDataUrl = (d: Design, size = 400) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(designSvg(d, size));
