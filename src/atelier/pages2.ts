/** Páginas de colorir (parte 2). */
import { cheek, eye, fluffy, furBand, gift, happyEye, heart, holly, openSmile, pine, smile, snowGround, snowflake, sparkle, star } from "./art";

const W = (s: string) => `<g fill="#FFFFFF">${s}</g>`;
const tube = (d: string, w = 16) => `<path d="${d}" stroke-width="${w}"/><path d="${d}" stroke-width="${w - 9}" stroke="#FFFFFF"/>`;
/** barba: metade de baixo fofinha, com a parte de cima recortada em volta da boca */
function beard(cx: number, cy: number, rx: number, ry: number) {
  const a0 = Math.PI * 0.04,
    a1 = Math.PI * 0.96;
  const p = fluffy(cx, cy, rx, ry, 18, 0.13, a0, a1, false);
  const sx = cx + Math.cos(a0) * rx,
    sy = cy + Math.sin(a0) * ry;
  return p.replace('"/>', ` Q${cx} ${cy + 64} ${sx.toFixed(1)} ${sy.toFixed(1)} Z"/>`);
}
const face = (x: number, y: number, s = 1) =>
  eye(x - 18 * s, y, 7 * s) + eye(x + 18 * s, y, 7 * s) + cheek(x - 32 * s, y + 16 * s, 8 * s) + cheek(x + 32 * s, y + 16 * s, 8 * s) + smile(x, y + 12 * s, 9 * s, 6 * s);

export const presente = () =>
  star(50, 60, 14) +
  star(352, 74, 12) +
  sparkle(80, 150, 9) +
  sparkle(330, 170, 10) +
  snowflake(46, 250, 12) +
  snowflake(360, 260, 12) +
  snowGround(382, 8) +
  gift(28, 300, 74, 76, "dots") +
  gift(298, 296, 76, 80, "stripes") +
  // presentão com carinha
  W(`<rect x="104" y="176" width="192" height="196" rx="10"/>`) +
  W(`<rect x="92" y="146" width="216" height="46" rx="10"/>`) +
  W(`<rect x="186" y="146" width="28" height="226"/>`) +
  W(`<path d="M200 146 C140 74 92 128 200 146 Z"/><path d="M200 146 C260 74 308 128 200 146 Z"/>`) +
  W(`<path d="M196 150 L170 196 L184 192 L188 206 Z"/><path d="M204 150 L230 196 L216 192 L212 206 Z"/>`) +
  W(`<circle cx="200" cy="144" r="13"/>`) +
  eye(150, 262, 9) +
  eye(250, 262, 9) +
  cheek(132, 292, 10) +
  cheek(268, 292, 10) +
  `<path d="M226 294 Q240 306 254 294" />` +
  `<path d="M146 294 Q160 306 174 294" />` +
  star(140, 344, 12) +
  star(260, 344, 12) +
  heart(140, 214, 10) +
  heart(260, 214, 10);

const bell = (x: number, y: number, s: number, rot: number) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
  W(
    `<circle cx="0" cy="108" r="16"/><path d="M0 0 C-50 0 -60 50 -60 86 C-60 100 -76 104 -76 114 L76 114 C76 104 60 100 60 86 C60 50 50 0 0 0 Z"/>`,
  ) +
  `<path d="M-58 82 Q0 98 58 82" stroke-width="4"/><path d="M-62 96 Q0 112 62 96" stroke-width="4"/>` +
  star(0, 46, 16) +
  `</g>`;

export const sino = () =>
  snowflake(48, 300, 14) +
  snowflake(352, 310, 14) +
  sparkle(60, 60, 10) +
  sparkle(340, 60, 10) +
  // notas musicais
  `<path d="M60 160 L60 196 M60 160 L78 154 L78 190" stroke-width="4"/><ellipse cx="54" cy="198" rx="7" ry="5" fill="#1E2340"/><ellipse cx="72" cy="192" rx="7" ry="5" fill="#1E2340"/>` +
  `<path d="M340 170 L340 206" stroke-width="4"/><ellipse cx="334" cy="208" rx="7" ry="5" fill="#1E2340"/><path d="M340 170 Q352 178 350 190" stroke-width="4"/>` +
  bell(150, 150, 1, 14) +
  bell(250, 150, 1, -14) +
  // laço por cima
  W(`<path d="M200 118 C150 70 116 118 168 130 Z"/><path d="M200 118 C250 70 284 118 232 130 Z"/>`) +
  W(`<path d="M190 126 L164 190 L180 184 L184 200 L200 132 Z"/><path d="M210 126 L236 190 L220 184 L216 200 L200 132 Z"/>`) +
  W(`<ellipse cx="200" cy="122" rx="16" ry="14"/>`) +
  holly(200, 96, 1.1, 0);

export const noelRosto = () =>
  snowflake(46, 330, 15) +
  snowflake(356, 330, 15) +
  sparkle(50, 60, 10) +
  sparkle(356, 220, 9) +
  // rosto
  W(`<ellipse cx="200" cy="186" rx="92" ry="74"/>`) +
  // barba por cima (bochechas até o queixo)
  W(beard(200, 214, 118, 130)) +
  // óculos
  W(`<circle cx="166" cy="186" r="22"/><circle cx="234" cy="186" r="22"/>`) +
  `<path d="M188 186 Q200 178 212 186 M144 182 L112 176 M256 182 L288 176" stroke-width="4"/>` +
  eye(166, 188, 8) +
  eye(234, 188, 8) +
  W(`<path d="M138 156 Q166 138 190 156 Q166 150 138 156 Z"/><path d="M262 156 Q234 138 210 156 Q234 150 262 156 Z"/>`) +
  cheek(128, 222, 13) +
  cheek(272, 222, 13) +
  // bigode, nariz e boca
  openSmile(200, 262, 16) +
  W(`<path d="M200 236 C178 214 138 220 130 248 C156 258 186 254 200 244 Z"/><path d="M200 236 C222 214 262 220 270 248 C244 258 214 254 200 244 Z"/>`) +
  W(`<ellipse cx="200" cy="226" rx="17" ry="14"/>`) +
  // gorro
  W(`<path d="M104 140 Q110 30 220 28 Q312 32 330 112 Q340 150 352 170 L322 168 Q318 120 296 98 Q300 126 296 140 Z"/>`) +
  W(fluffy(354, 184, 24, 24, 10, 0.15)) +
  furBand(90, 124, 220, 38);

export const casinha = () =>
  // fumaça
  W(fluffy(292, 52, 18, 14, 8, 0.2) + fluffy(318, 30, 14, 11, 7, 0.2)) +
  snowflake(46, 50, 14) +
  snowflake(120, 92, 9) +
  sparkle(360, 80, 9) +
  pine(44, 352, 1.15) +
  pine(362, 352, 1) +
  snowGround(352, 6) +
  `<path d="M168 352 Q160 372 140 392 M232 352 Q240 372 262 392" stroke-width="4"/>` +
  // chaminé
  W(`<rect x="262" y="76" width="40" height="70"/>`) +
  W(fluffy(282, 74, 26, 9, 6, 0.4, Math.PI, Math.PI * 2, true)) +
  // casa
  W(`<rect x="88" y="190" width="224" height="162" rx="4"/>`) +
  `<path d="M88 236 L312 236 M88 282 L312 282 M88 326 L312 326" stroke-width="2.5" stroke-dasharray="14 10"/>` +
  // telhado com neve
  W(`<path d="M64 200 L200 96 L336 200 Z"/>`) +
  W(`<path d="M60 202 Q70 214 84 206 Q96 222 112 208 Q126 222 142 208 Q156 224 172 210 Q186 226 200 210 Q214 226 228 210 Q244 224 258 208 Q274 222 288 208 Q304 222 316 206 Q330 214 340 202 L200 92 Z"/>`) +
  W(`<circle cx="200" cy="160" r="20"/>`) +
  `<path d="M200 140 L200 180 M180 160 L220 160" stroke-width="3"/>` +
  // porta com guirlanda
  W(`<path d="M168 352 L168 268 Q200 236 232 268 L232 352 Z"/>`) +
  W(fluffy(200, 282, 16, 16, 9, 0.25)) +
  W(`<circle cx="200" cy="282" r="8"/>`) +
  `<circle cx="222" cy="318" r="4" fill="#1E2340"/>` +
  // janelas com cortininha
  W(`<rect x="104" y="232" width="50" height="54" rx="4"/><rect x="246" y="232" width="50" height="54" rx="4"/>`) +
  `<path d="M129 232 L129 286 M104 259 L154 259 M271 232 L271 286 M246 259 L296 259" stroke-width="3"/>` +
  W(`<rect x="98" y="284" width="62" height="10" rx="3"/><rect x="240" y="284" width="62" height="10" rx="3"/>`) +
  holly(129, 228, 0.6, 0) +
  holly(271, 228, 0.6, 0);

export const meia = () =>
  snowflake(50, 330, 14) +
  sparkle(70, 120, 10) +
  sparkle(340, 340, 10) +
  `<path d="M60 40 Q200 70 340 40" stroke-width="4"/>` +
  star(340, 120, 14) +
  // brinquedos espiando
  tube("M168 120 L168 50 Q168 26 146 26 Q126 26 126 46", 18) +
  `<path d="M160 112 L176 102 M160 92 L176 82 M160 72 L176 62 M138 30 L148 44" stroke-width="3"/>` +
  W(`<circle cx="236" cy="64" r="12"/><circle cx="270" cy="64" r="12"/><circle cx="253" cy="88" r="28"/>`) +
  eye(242, 84, 5) +
  eye(264, 84, 5) +
  `<ellipse cx="253" cy="98" rx="6" ry="4" fill="#1E2340"/>` +
  // meia
  W(`<path d="M128 140 L272 140 L272 252 Q272 286 300 304 Q336 328 320 362 Q300 392 252 372 L162 330 Q120 308 124 262 Z"/>`) +
  W(`<path d="M272 290 Q300 302 316 318 Q336 340 320 362 Q306 380 280 378 Q300 350 272 290 Z" />`) +
  W(`<path d="M150 318 Q170 300 180 340 L162 330 Q148 324 150 318 Z"/>`) +
  `<path d="M130 196 L270 196 M128 214 L272 214" stroke-width="3"/>` +
  snowflake(200, 262, 22) +
  heart(160, 262, 9) +
  heart(240, 262, 9) +
  // punho fofinho
  W(`<rect x="110" y="104" width="180" height="52" rx="20"/>`) +
  `<path d="M128 122 Q134 116 140 122 M160 136 Q166 130 172 136 M196 120 Q202 114 208 120 M232 136 Q238 130 244 136 M262 122 Q268 116 274 122" stroke-width="3"/>` +
  holly(282, 112, 0.9, 0);

export const biscoito = () =>
  // biscoitinhos ao redor
  W(star(64, 70, 32, 18)) +
  `<path d="M52 66 L76 66" stroke-width="3" stroke-dasharray="4 4"/>` +
  W(heart(338, 74, 26)) +
  `<path d="M326 72 Q338 62 350 72" stroke-width="3"/>` +
  sparkle(60, 300, 10) +
  sparkle(344, 300, 10) +
  // corpo do bonequinho
  W(
    `<path d="M170 168 Q120 168 96 178 Q64 194 82 222 Q96 236 132 222 L152 214 L146 278 Q120 330 108 346 Q94 374 124 380 Q146 382 160 356 L200 306 L240 356 Q254 382 276 380 Q306 374 292 346 Q280 330 254 278 L248 214 L268 222 Q304 236 318 222 Q336 194 304 178 Q280 168 230 168 Z"/>`,
  ) +
  `<path d="M94 196 Q100 186 106 196 Q112 206 118 196 M282 196 Q288 186 294 196 Q300 206 306 196" stroke-width="3"/>` +
  `<path d="M112 356 Q118 346 124 356 Q130 366 136 356 M264 356 Q270 346 276 356 Q282 366 288 356" stroke-width="3"/>` +
  W(`<circle cx="200" cy="238" r="9"/><circle cx="200" cy="270" r="9"/>`) +
  // gravatinha
  W(`<path d="M200 192 L176 180 L176 204 Z"/><path d="M200 192 L224 180 L224 204 Z"/><circle cx="200" cy="192" r="6"/>`) +
  // cabeça
  W(`<circle cx="200" cy="112" r="62"/>`) +
  `<path d="M150 82 Q156 74 162 82 Q168 90 174 82 M226 82 Q232 74 238 82 Q244 90 250 82" stroke-width="3"/>` +
  face(200, 112, 1.05);

export const guirlanda = () =>
  sparkle(50, 50, 10) +
  sparkle(352, 56, 10) +
  snowflake(46, 360, 13) +
  snowflake(356, 360, 13) +
  W(fluffy(200, 186, 142, 142, 26, 0.12)) +
  W(fluffy(200, 186, 70, 70, 14, 0.14)) +
  // folhinhas desenhadas na coroa
  Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const x = 200 + Math.cos(a) * 106,
      y = 186 + Math.sin(a) * 106;
    return `<path d="M${(x - Math.sin(a) * 12).toFixed(1)} ${(y + Math.cos(a) * 12).toFixed(1)} Q${(x + Math.cos(a) * 10).toFixed(1)} ${(y + Math.sin(a) * 10).toFixed(1)} ${(x + Math.sin(a) * 12).toFixed(1)} ${(y - Math.cos(a) * 12).toFixed(1)}" stroke-width="3"/>`;
  }).join("") +
  // bolinhas
  [0.15, 0.45, 0.85, 1.25, 1.65].map((k, i) => {
    const a = k * Math.PI - Math.PI / 2;
    const x = 200 + Math.cos(a) * 112,
      y = 186 + Math.sin(a) * 112;
    return W(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15"/>`) + (i % 2 ? star(x, y, 7) : `<path d="M${(x - 12).toFixed(1)} ${y.toFixed(1)} Q${x.toFixed(1)} ${(y + 7).toFixed(1)} ${(x + 12).toFixed(1)} ${y.toFixed(1)}" stroke-width="3"/>`);
  }).join("") +
  holly(118, 112, 1, 30) +
  holly(290, 128, 1, -20) +
  // laço grande
  W(`<path d="M196 324 L160 392 L180 386 L188 400 L206 330 Z"/><path d="M204 324 L240 392 L220 386 L212 400 L194 330 Z"/>`) +
  W(`<path d="M200 318 C140 262 100 330 160 344 Q184 344 200 318 Z"/><path d="M200 318 C260 262 300 330 240 344 Q216 344 200 318 Z"/>`) +
  W(`<ellipse cx="200" cy="320" rx="18" ry="16"/>`);

export const duende = () =>
  snowflake(46, 60, 14) +
  sparkle(350, 60, 10) +
  sparkle(60, 210, 9) +
  snowGround(382, 8) +
  // pernas listradas e sapatos
  W(`<rect x="164" y="318" width="28" height="44"/><rect x="208" y="318" width="28" height="44"/>`) +
  `<path d="M164 332 L192 332 M164 346 L192 346 M208 332 L236 332 M208 346 L236 346" stroke-width="3"/>` +
  W(`<path d="M192 360 L192 380 L146 380 Q126 378 122 358 Q138 368 162 360 Z"/><path d="M208 360 L208 380 L254 380 Q274 378 278 358 Q262 368 238 360 Z"/>`) +
  W(`<circle cx="122" cy="356" r="6"/><circle cx="278" cy="356" r="6"/>`) +
  // presente na mão
  gift(250, 238, 66, 62, "dots") +
  // túnica
  W(`<path d="M160 206 L128 324 L272 324 L240 206 Z"/>`) +
  W(`<path d="M128 324 L140 308 L152 326 L164 308 L176 326 L188 308 L200 326 L212 308 L224 326 L236 308 L248 326 L260 308 L272 324 Z"/>`) +
  W(`<rect x="138" y="266" width="124" height="18" rx="4"/><rect x="186" y="260" width="28" height="30" rx="4"/>`) +
  // braços
  W(`<path d="M160 216 Q124 240 118 278 L138 284 Q144 254 170 236 Z"/>`) +
  W(`<circle cx="126" cy="292" r="12"/>`) +
  W(`<path d="M240 216 Q266 236 268 258 L248 262 Q244 246 230 236 Z"/>`) +
  W(`<circle cx="260" cy="266" r="12"/>`) +
  // gola
  W(`<path d="M150 206 L166 226 L180 210 L192 230 L200 212 L208 230 L220 210 L234 226 L250 206 Z"/>`) +
  // orelhas pontudas
  W(`<path d="M148 150 L104 124 L144 182 Z"/><path d="M252 150 L296 124 L256 182 Z"/>`) +
  // cabeça
  W(`<circle cx="200" cy="158" r="54"/>`) +
  face(200, 158, 1) +
  // gorro com guizo
  W(`<path d="M142 128 Q168 30 300 40 L254 120 Z"/>`) +
  W(`<circle cx="304" cy="38" r="14"/>`) +
  `<path d="M296 38 L312 38" stroke-width="3"/>` +
  furBand(138, 112, 124, 26);

export const estrela = () =>
  W(fluffy(70, 360, 70, 32, 9, 0.25, Math.PI, Math.PI * 2)) +
  W(fluffy(330, 362, 76, 34, 9, 0.25, Math.PI, Math.PI * 2)) +
  `<path d="M-6 362 L410 362"/>` +
  W(star(200, 196, 160, 74)) +
  W(star(200, 196, 118, 56)) +
  face(200, 210, 1.3) +
  W(star(58, 64, 26)) +
  `<circle cx="52" cy="64" r="2" fill="#1E2340"/><circle cx="64" cy="64" r="2" fill="#1E2340"/>` +
  W(star(350, 70, 22)) +
  sparkle(352, 196, 12) +
  sparkle(50, 200, 10) +
  sparkle(120, 30, 8) +
  sparkle(282, 30, 8);

export const bola = () =>
  sparkle(60, 80, 10) +
  sparkle(340, 330, 10) +
  snowflake(54, 330, 14) +
  snowflake(350, 90, 13) +
  // fita e laço
  `<path d="M200 18 L200 74" stroke-width="4"/>` +
  W(`<path d="M200 30 C170 4 150 36 182 40 Z"/><path d="M200 30 C230 4 250 36 218 40 Z"/><circle cx="200" cy="32" r="8"/>`) +
  W(`<rect x="172" y="70" width="56" height="30" rx="5"/>`) +
  `<path d="M184 70 L184 100 M200 70 L200 100 M216 70 L216 100" stroke-width="3"/>` +
  W(`<circle cx="200" cy="232" r="138"/>`) +
  // faixas decoradas
  `<path d="M68 190 Q200 236 332 190"/><path d="M64 236 Q200 282 336 236"/>` +
  `<path d="M84 300 Q200 336 316 300"/>` +
  Array.from({ length: 9 }, (_, i) => {
    const x = 92 + i * 27;
    const y = 214 + Math.sin(((i + 0.5) / 9) * Math.PI) * 26 - 4;
    return heart(x, y, 7);
  }).join("") +
  snowflake(200, 150, 32) +
  star(132, 146, 13) +
  star(268, 146, 13) +
  `<circle cx="140" cy="282" r="7"/><circle cx="200" cy="292" r="7"/><circle cx="260" cy="282" r="7"/>` +
  `<path d="M120 330 L140 312 L160 330 L180 312 L200 330 L220 312 L240 330 L260 312 L280 330" stroke-width="3"/>` +
  holly(240, 92, 0.9, 0);

const candle = (x: number, y: number, w: number, h: number) =>
  W(`<path d="M${x} ${y - 10} Q${x - 22} ${y - 34} ${x} ${y - 66} Q${x + 22} ${y - 34} ${x} ${y - 10} Z"/>`) +
  W(`<path d="M${x} ${y - 16} Q${x - 9} ${y - 28} ${x} ${y - 44} Q${x + 9} ${y - 28} ${x} ${y - 16} Z"/>`) +
  `<path d="M${x} ${y - 10} L${x} ${y}"/>` +
  W(`<rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" rx="6"/>`) +
  `<path d="M${x - w / 2} ${y + 14} Q${x - w / 4} ${y + 30} ${x - w / 8} ${y + 14} Q${x} ${y + 40} ${x + w / 8} ${y + 14} Q${x + w / 4} ${y + 26} ${x + w / 2} ${y + 14}" stroke-width="4"/>`;

export const vela = () =>
  sparkle(60, 60, 12) +
  sparkle(340, 50, 12) +
  sparkle(200, 26, 8) +
  star(80, 150, 10) +
  star(320, 160, 10) +
  candle(130, 220, 56, 140) +
  candle(270, 200, 56, 160) +
  candle(200, 150, 64, 210) +
  heart(200, 250, 12) +
  star(130, 290, 12) +
  star(270, 290, 12) +
  // base com azevinho
  W(`<ellipse cx="200" cy="362" rx="168" ry="22"/>`) +
  holly(84, 350, 1.2, 10) +
  holly(316, 352, 1.2, -10) +
  holly(200, 366, 1.1, 0);

export const bengala = () =>
  sparkle(50, 330, 10) +
  sparkle(356, 330, 10) +
  snowflake(200, 40, 16) +
  W(`<path d="M134 372 L134 140 Q134 96 106 96 Q84 96 84 122 L50 122 Q50 62 106 62 Q168 62 168 140 L168 372 Q151 384 134 372 Z"/>`) +
  W(`<path d="M232 372 L232 140 Q232 62 294 62 Q350 62 350 122 L316 122 Q316 96 294 96 Q266 96 266 140 L266 372 Q249 384 232 372 Z"/>`) +
  `<path d="M134 350 L168 326 M134 306 L168 282 M134 262 L168 238 M134 218 L168 194 M134 174 L168 150 M136 128 L160 102 M104 64 L112 96 M58 100 L90 106" stroke-width="5"/>` +
  `<path d="M232 326 L266 350 M232 282 L266 306 M232 238 L266 262 M232 194 L266 218 M232 150 L266 174 M240 102 L264 128 M296 64 L288 96 M342 100 L310 106" stroke-width="5"/>` +
  // laço
  W(`<path d="M200 236 C150 190 120 252 186 252 Z"/><path d="M200 236 C250 190 280 252 214 252 Z"/>`) +
  W(`<path d="M192 246 L170 300 L184 294 L190 310 L200 252 Z"/><path d="M208 246 L230 300 L216 294 L210 310 L200 252 Z"/>`) +
  W(`<ellipse cx="200" cy="244" rx="15" ry="13"/>`) +
  holly(200, 210, 1, 0) +
  // balinhas
  W(`<circle cx="70" cy="200" r="20"/><path d="M50 200 L32 188 L32 212 Z"/><path d="M90 200 L108 188 L108 212 Z"/>`) +
  `<path d="M58 186 Q70 200 62 214 M74 182 Q86 198 78 216" stroke-width="3"/>` +
  W(`<circle cx="330" cy="210" r="20"/><path d="M310 210 L292 198 L292 222 Z"/><path d="M350 210 L368 198 L368 222 Z"/>`) +
  `<path d="M318 196 Q330 210 322 224 M334 192 Q346 208 338 226" stroke-width="3"/>`;

export const urso = () =>
  snowflake(46, 56, 14) +
  snowflake(360, 64, 12) +
  sparkle(60, 190, 9) +
  sparkle(344, 200, 9) +
  snowGround(380, 8) +
  // pés
  W(`<ellipse cx="146" cy="360" rx="34" ry="22"/><ellipse cx="254" cy="360" rx="34" ry="22"/>`) +
  `<circle cx="146" cy="362" r="9"/><circle cx="254" cy="362" r="9"/>` +
  // corpo
  W(`<ellipse cx="200" cy="300" rx="94" ry="76"/>`) +
  // caneca de chocolate
  W(`<path d="M248 276 Q284 276 284 300 Q284 322 254 320 Z"/>`) +
  W(`<rect x="166" y="262" width="88" height="76" rx="12"/>`) +
  heart(210, 300, 13) +
  W(fluffy(210, 260, 44, 10, 8, 0.6, Math.PI, Math.PI * 2, true)) +
  `<path d="M190 236 Q182 222 192 212 Q200 202 192 190 M222 236 Q214 222 224 212 Q232 202 224 190" stroke-width="3.5"/>` +
  // patinhas segurando
  W(`<ellipse cx="160" cy="300" rx="20" ry="16"/><ellipse cx="262" cy="306" rx="18" ry="15"/>`) +
  // cachecol
  W(`<path d="M120 224 Q200 256 280 224 L284 248 Q200 282 116 248 Z"/>`) +
  `<path d="M150 236 L146 258 M180 244 L178 266 M220 244 L222 266 M250 236 L254 258" stroke-width="3"/>` +
  // orelhas e cabeça
  W(`<circle cx="138" cy="96" r="24"/><circle cx="262" cy="96" r="24"/>`) +
  `<circle cx="138" cy="96" r="11"/><circle cx="262" cy="96" r="11"/>` +
  W(`<ellipse cx="200" cy="150" rx="82" ry="72"/>`) +
  W(`<ellipse cx="200" cy="180" rx="34" ry="24"/>`) +
  `<ellipse cx="200" cy="168" rx="12" ry="8" fill="#1E2340"/>` +
  `<path d="M200 176 L200 186 M188 190 Q200 198 212 190"/>` +
  eye(170, 140, 8) +
  eye(230, 140, 8) +
  cheek(146, 170, 10) +
  cheek(254, 170, 10) +
  // gorrinho
  W(`<path d="M150 96 Q160 40 210 46 Q252 52 252 92 Z"/>`) +
  W(fluffy(214, 40, 13, 13, 7, 0.2)) +
  furBand(144, 86, 112, 22);

export const lareira = () =>
  // velinhas e estrela em cima
  W(`<rect x="62" y="40" width="20" height="40" rx="3"/><rect x="318" y="40" width="20" height="40" rx="3"/>`) +
  W(`<path d="M72 36 Q62 26 72 12 Q82 26 72 36 Z"/><path d="M328 36 Q318 26 328 12 Q338 26 328 36 Z"/>`) +
  // lareira
  W(`<rect x="44" y="118" width="312" height="252"/>`) +
  W(`<rect x="28" y="80" width="344" height="36" rx="6"/>`) +
  `<path d="M36 84 Q118 120 200 92 Q282 120 364 84" stroke-width="10"/><path d="M36 84 Q118 120 200 92 Q282 120 364 84" stroke-width="2" stroke="#FFFFFF"/>` +
  W(`<circle cx="82" cy="104" r="10"/><circle cx="148" cy="106" r="10"/><circle cx="252" cy="106" r="10"/><circle cx="318" cy="104" r="10"/>`) +
  holly(200, 88, 1, 0) +
  `<path d="M44 168 L100 168 M300 168 L356 168 M44 214 L100 214 M300 214 L356 214 M44 260 L100 260 M300 260 L356 260 M44 306 L100 306 M300 306 L356 306 M72 118 L72 168 M72 214 L72 260 M72 306 L72 370 M86 168 L86 214 M86 260 L86 306 M328 118 L328 168 M328 214 L328 260 M328 306 L328 370 M314 168 L314 214 M314 260 L314 306" stroke-width="3"/>` +
  W(`<path d="M100 370 L100 250 Q200 174 300 250 L300 370 Z"/>`) +
  // fogo e lenha
  W(`<path d="M200 344 Q148 306 176 250 Q184 280 196 268 Q192 236 214 214 Q216 256 234 254 Q252 296 200 344 Z"/>`) +
  W(`<path d="M200 338 Q178 316 192 290 Q200 306 206 296 Q222 316 200 338 Z"/>`) +
  W(`<rect x="132" y="336" width="136" height="20" rx="10" transform="rotate(-8 200 346)"/><rect x="132" y="336" width="136" height="20" rx="10" transform="rotate(8 200 346)"/>`) +
  // meias penduradas
  [98, 200, 302]
    .map(
      (x, i) =>
        W(
          `<path d="M${x - 14} 128 L${x + 14} 128 L${x + 14} 170 Q${x + 14} 186 ${x - 2} 188 L${x - 22} 190 Q${x - 34} 186 ${x - 30} 176 Q${x - 26} 168 ${x - 14} 168 Z"/>`,
        ) +
        W(`<rect x="${x - 18}" y="116" width="36" height="16" rx="5"/>`) +
        (i === 1 ? star(x, 154, 8) : heart(x, 154, 7)),
    )
    .join("");

export const casaBiscoito = () =>
  sparkle(50, 50, 10) +
  sparkle(352, 60, 10) +
  snowflake(46, 150, 12) +
  snowflake(356, 160, 12) +
  snowGround(366, 6) +
  // pirulitos
  `<path d="M40 366 L40 270 M360 366 L360 270" stroke-width="6"/>` +
  W(`<circle cx="40" cy="250" r="26"/><circle cx="360" cy="250" r="26"/>`) +
  `<path d="M40 250 m-6 0 a6 6 0 1 1 12 0 a12 12 0 1 1 -24 0 a18 18 0 1 1 36 0" stroke-width="3"/>` +
  `<path d="M360 250 m-6 0 a6 6 0 1 1 12 0 a12 12 0 1 1 -24 0 a18 18 0 1 1 36 0" stroke-width="3"/>` +
  // casa
  W(`<rect x="88" y="190" width="224" height="176" rx="6"/>`) +
  W(`<path d="M62 204 L200 78 L338 204 Z"/>`) +
  W(`<path d="M58 206 Q72 226 88 210 Q104 230 120 212 Q136 232 152 214 Q168 234 184 216 Q200 236 216 216 Q232 234 248 214 Q264 232 280 212 Q296 230 312 210 Q328 226 342 206 L200 82 Z"/>`) +
  `<path d="M130 160 Q150 150 170 160 Q190 170 210 160 Q230 150 250 160 Q260 166 270 160" stroke-width="3"/>` +
  W(`<circle cx="160" cy="132" r="11"/><circle cx="200" cy="112" r="11"/><circle cx="240" cy="132" r="11"/><circle cx="200" cy="160" r="11"/>`) +
  // porta com coração
  W(`<path d="M170 366 L170 290 Q200 260 230 290 L230 366 Z"/>`) +
  heart(200, 312, 10) +
  `<circle cx="222" cy="336" r="4" fill="#1E2340"/>` +
  // janelas de bala
  W(`<circle cx="130" cy="264" r="26"/><circle cx="270" cy="264" r="26"/>`) +
  `<path d="M112 246 L148 282 M148 246 L112 282 M252 246 L288 282 M288 246 L252 282" stroke-width="3"/>` +
  // jujubas e bengalas
  W(`<path d="M104 366 Q104 346 116 346 Q128 346 128 366 Z"/><path d="M272 366 Q272 346 284 346 Q296 346 296 366 Z"/>`) +
  `<path d="M94 330 L306 330" stroke-width="3" stroke-dasharray="2 12"/>`;

export const presepio = () =>
  // estrela guia
  W(star(200, 44, 30, 13)) +
  `<path d="M200 78 L200 100 M172 60 L152 70 M228 60 L248 70 M180 74 L166 92 M220 74 L234 92" stroke-width="3"/>` +
  sparkle(60, 50, 9) +
  sparkle(340, 50, 9) +
  sparkle(90, 110, 7) +
  sparkle(316, 112, 7) +
  // colinas
  `<path d="M-10 330 Q80 300 160 324 M240 324 Q320 296 410 326"/>` +
  `<path d="M-10 372 L410 372"/>` +
  // estábulo
  W(`<rect x="76" y="186" width="16" height="186"/><rect x="308" y="186" width="16" height="186"/>`) +
  W(`<path d="M50 200 L200 118 L350 200 L336 212 L200 138 L64 212 Z"/>`) +
  `<path d="M120 172 L140 182 M170 152 L186 162 M230 152 L214 162 M280 172 L260 182" stroke-width="3"/>` +
  // Maria
  W(`<path d="M106 372 Q100 300 126 268 Q150 270 160 300 Q168 340 162 372 Z"/>`) +
  W(`<circle cx="134" cy="248" r="22"/>`) +
  W(`<path d="M108 256 Q106 220 134 218 Q162 220 160 256 Q156 236 134 234 Q112 236 108 256 Z"/>`) +
  happyEye(127, 250, 4) +
  happyEye(141, 250, 4) +
  `<path d="M130 260 Q134 263 138 260" stroke-width="3"/>` +
  // José com cajado
  `<path d="M300 372 L300 230 Q300 214 286 214" stroke-width="6"/>` +
  W(`<path d="M240 372 Q234 296 262 262 Q290 264 296 300 Q302 340 296 372 Z"/>`) +
  W(`<circle cx="268" cy="240" r="22"/>`) +
  W(`<path d="M246 252 Q252 278 268 280 Q284 278 290 252 Q280 264 268 264 Q256 264 246 252 Z"/>`) +
  happyEye(261, 240, 4) +
  happyEye(275, 240, 4) +
  // manjedoura com o bebê
  W(`<path d="M160 334 L240 334 L226 300 L174 300 Z"/>`) +
  `<path d="M168 334 L156 362 M232 334 L244 362" stroke-width="5"/>` +
  `<path d="M170 304 L164 296 M182 304 L180 292 M218 304 L220 292 M230 304 L236 296" stroke-width="3"/>` +
  W(`<ellipse cx="200" cy="296" rx="30" ry="13"/>`) +
  W(`<circle cx="182" cy="288" r="11"/>`) +
  `<ellipse cx="182" cy="272" rx="15" ry="4" stroke-width="3"/>` +
  happyEye(178, 289, 3) +
  happyEye(187, 289, 3) +
  // ovelhinha
  W(fluffy(354, 348, 26, 18, 9, 0.3)) +
  W(`<ellipse cx="330" cy="338" rx="10" ry="12"/>`) +
  `<path d="M344 364 L344 372 M364 364 L364 372" stroke-width="4"/>` +
  `<circle cx="327" cy="336" r="1.8" fill="#1E2340"/>`;
