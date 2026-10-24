/** Páginas de colorir (parte 1): Papai Noel, trenó, árvore, rena, pinguim e boneco de neve. */
import { cheek, eye, fluffy, furBand, gift, happyEye, heart, holly, openSmile, pine, smile, snowGround, snowflake, sparkle, star } from "./art";

const W = (s: string) => `<g fill="#FFFFFF">${s}</g>`;
/** traço grosso com miolo branco (vira um "tubo" para pintar): chifres, bengalas, galhos */
const tube = (d: string, w = 16) => `<path d="${d}" stroke-width="${w}"/><path d="${d}" stroke-width="${w - 9}" stroke="#FFFFFF"/>`;

export const noelCorpo = () =>
  snowflake(42, 56, 18) +
  snowflake(358, 300, 14) +
  sparkle(300, 70, 10) +
  sparkle(360, 110, 8) +
  sparkle(48, 250, 8) +
  snowGround(380, 14) +
  // saco de presentes atrás
  W(`<path d="M22 372 Q10 300 48 268 Q40 250 56 244 Q70 252 64 266 Q106 286 104 372 Z"/>`) +
  `<path d="M46 268 Q56 274 66 266"/>` +
  star(62, 320, 14) +
  // botas
  W(
    `<path d="M146 344 L144 370 Q144 386 160 386 L194 386 Q200 372 186 366 L182 344 Z"/><path d="M254 344 L256 370 Q256 386 240 386 L206 386 Q200 372 214 366 L218 344 Z"/>`,
  ) +
  // casaco
  W(`<path d="M128 236 Q98 300 114 350 L286 350 Q302 300 272 236 Z"/>`) +
  furBand(106, 336, 188, 24) +
  W(`<rect x="188" y="236" width="24" height="104" rx="6"/>`) +
  W(`<rect x="112" y="282" width="176" height="24" rx="4"/>`) +
  W(`<rect x="182" y="276" width="36" height="36" rx="6"/><rect x="192" y="286" width="16" height="16" rx="2"/>`) +
  // braço esquerdo (para baixo) e direito (acenando)
  W(`<path d="M136 246 Q100 266 98 306 L126 312 Q128 286 150 272 Z"/>`) +
  furBand(94, 302, 36, 14, 2) +
  W(fluffy(110, 330, 17, 16, 7, 0.12)) +
  W(`<path d="M262 244 Q300 226 310 190 L338 200 Q330 240 278 272 Z"/>`) +
  W(`<rect x="306" y="180" width="36" height="16" rx="8" transform="rotate(18 324 188)"/>`) +
  W(fluffy(330, 162, 19, 19, 8, 0.12)) +
  `<path d="M314 172 Q306 160 314 152"/>` +
  // barba de nuvem
  W(fluffy(200, 214, 70, 62, 14, 0.16)) +
  // rosto
  W(`<ellipse cx="200" cy="166" rx="52" ry="40"/>`) +
  eye(180, 160, 7) +
  eye(220, 160, 7) +
  `<path d="M170 144 Q180 138 190 144 M210 144 Q220 138 230 144" stroke-width="4"/>` +
  cheek(162, 178, 9) +
  cheek(238, 178, 9) +
  W(`<path d="M200 190 C186 176 160 180 158 196 C172 204 190 202 200 194 Z"/><path d="M200 190 C214 176 240 180 242 196 C228 204 210 202 200 194 Z"/>`) +
  W(`<ellipse cx="200" cy="182" rx="10" ry="8"/>`) +
  openSmile(200, 210, 11) +
  // gorro
  W(`<path d="M260 132 Q250 60 170 58 Q110 62 100 120 L122 128 Q128 98 150 92 Q138 112 138 130 Z"/>`) +
  W(fluffy(100, 132, 18, 18, 8, 0.15)) +
  furBand(130, 118, 140, 28);

export const treno = () =>
  // lua e estrelas
  `<path d="M340 30 Q300 50 312 92 Q324 124 362 120 Q332 108 328 78 Q326 50 340 30 Z"/>` +
  star(60, 50, 16) +
  star(140, 30, 10) +
  star(250, 44, 12) +
  sparkle(200, 90, 9) +
  sparkle(36, 130, 8) +
  snowGround(368, 12) +
  // presentes empilhados (atrás do trenó)
  gift(108, 176, 74, 92, "dots") +
  gift(190, 142, 64, 126, "stripes") +
  W(`<path d="M252 268 Q240 196 274 172 Q264 160 276 152 Q290 158 284 170 Q314 196 300 268 Z"/>`) +
  `<path d="M270 170 Q278 176 286 168"/>` +
  heart(276, 228, 12) +
  // ursinho espiando
  W(`<circle cx="152" cy="146" r="11"/><circle cx="184" cy="146" r="11"/><circle cx="168" cy="166" r="22"/>`) +
  eye(160, 164, 4) +
  eye(176, 164, 4) +
  `<ellipse cx="168" cy="174" rx="5" ry="3.5" fill="#1E2340"/>` +
  // corpo do trenó
  W(
    `<path d="M70 216 Q62 304 112 316 L284 316 Q342 310 342 240 L342 218 Q342 196 320 198 Q300 202 304 222 L304 244 Q300 264 282 264 L118 264 Q100 264 100 242 L100 214 Q100 194 84 194 Q70 196 70 216 Z"/>`,
  ) +
  `<path d="M84 206 Q78 214 86 222 M322 210 Q316 218 324 226" stroke-width="4"/>` +
  `<path d="M120 292 Q140 272 162 288 Q182 304 202 286 Q222 270 244 288 Q262 302 282 288" stroke-width="4"/>` +
  heart(200, 300, 7) +
  // esquis
  `<path d="M120 316 L120 342 M270 316 L270 342" stroke-width="6"/>` +
  `<path d="M52 342 L300 342 Q352 342 354 308 Q354 288 336 290 Q322 294 330 308" stroke-width="7"/>`;

const ball = (x: number, y: number, r: number, kind: number) =>
  W(`<rect x="${x - r * 0.35}" y="${y - r - 7}" width="${r * 0.7}" height="9" rx="2"/><circle cx="${x}" cy="${y}" r="${r}"/>`) +
  (kind === 0
    ? `<path d="M${x - r} ${y} Q${x} ${y + r * 0.45} ${x + r} ${y}" stroke-width="3"/>`
    : kind === 1
      ? `<path d="M${x - r * 0.95} ${y - r * 0.2} L${x - r * 0.5} ${y + r * 0.3} L${x} ${y - r * 0.2} L${x + r * 0.5} ${y + r * 0.3} L${x + r * 0.95} ${y - r * 0.2}" stroke-width="3"/>`
      : star(x, y, r * 0.55));

const tier = (top: number, bot: number, half: number, n: number) => {
  let d = `M200 ${top} Q${200 - half * 0.45} ${top + (bot - top) * 0.55} ${200 - half} ${bot}`;
  const step = (half * 2) / n;
  for (let i = 0; i < n; i++) d += ` Q${200 - half + step * (i + 0.5)} ${bot + 18} ${200 - half + step * (i + 1)} ${bot}`;
  d += ` Q${200 + half * 0.45} ${top + (bot - top) * 0.55} 200 ${top} Z`;
  return W(`<path d="${d}"/>`);
};

export const arvore = () =>
  snowflake(46, 60, 16) +
  snowflake(356, 92, 13) +
  sparkle(70, 170, 9) +
  sparkle(330, 190, 10) +
  snowGround(372, 10) +
  W(`<rect x="180" y="320" width="40" height="34" rx="4"/>`) +
  tier(196, 326, 150, 7) +
  tier(132, 252, 112, 5) +
  tier(78, 176, 76, 4) +
  // guirlanda
  `<path d="M146 300 Q200 322 262 296" stroke-width="3.5" stroke-dasharray="1 9"/>` +
  `<path d="M152 160 Q200 176 246 156" stroke-width="3.5" stroke-dasharray="1 9"/>` +
  // rostinho
  eye(182, 214, 7) +
  eye(218, 214, 7) +
  cheek(166, 230, 8) +
  cheek(234, 230, 8) +
  smile(200, 228, 10, 7) +
  // enfeites
  ball(166, 140, 12, 0) +
  ball(238, 132, 11, 2) +
  ball(130, 236, 13, 1) +
  ball(272, 240, 13, 0) +
  ball(96, 316, 14, 2) +
  ball(196, 288, 14, 1) +
  ball(300, 318, 14, 1) +
  // estrela com carinha
  W(star(200, 66, 34, 15)) +
  `<circle cx="193" cy="66" r="2.6" fill="#1E2340"/><circle cx="207" cy="66" r="2.6" fill="#1E2340"/>` +
  `<path d="M195 74 Q200 78 205 74" stroke-width="2.5"/>` +
  // presentes
  gift(64, 320, 70, 56, "stripes") +
  gift(268, 322, 66, 54, "dots") +
  gift(158, 338, 50, 40, "stars");

export const rena = () =>
  snowflake(40, 60, 15) +
  snowflake(362, 250, 13) +
  sparkle(340, 60, 11) +
  sparkle(60, 230, 8) +
  snowGround(378, 12) +
  // chifres (atrás da cabeça)
  tube("M164 126 Q146 92 152 58 M152 92 Q128 86 118 64 M150 70 Q160 54 176 50") +
  tube("M236 126 Q254 92 248 58 M248 92 Q272 86 282 64 M250 70 Q240 54 224 50") +
  holly(232, 108, 0.9, 0) +
  // patas de trás
  W(`<ellipse cx="128" cy="346" rx="34" ry="24"/><ellipse cx="272" cy="346" rx="34" ry="24"/>`) +
  // corpo
  W(`<ellipse cx="200" cy="300" rx="82" ry="72"/>`) +
  W(`<ellipse cx="200" cy="296" rx="42" ry="34"/>`) +
  // patas da frente
  W(`<rect x="160" y="324" width="32" height="54" rx="14"/><rect x="208" y="324" width="32" height="54" rx="14"/>`) +
  `<path d="M160 362 L192 362 M208 362 L240 362"/>` +
  // orelhas
  W(`<path d="M138 156 Q96 130 92 160 Q104 182 142 172 Z"/><path d="M262 156 Q304 130 308 160 Q296 182 258 172 Z"/>`) +
  // cachecol
  W(`<path d="M138 222 Q200 254 262 222 L266 246 Q200 280 134 246 Z"/>`) +
  W(`<path d="M236 248 L248 300 L224 304 L216 254 Z"/>`) +
  `<path d="M224 288 L248 284 M220 270 L244 266" stroke-width="3"/>` +
  // cabeça
  W(`<ellipse cx="200" cy="172" rx="66" ry="58"/>`) +
  W(`<ellipse cx="200" cy="204" rx="40" ry="26"/>`) +
  eye(174, 162, 8) +
  eye(226, 162, 8) +
  cheek(156, 190, 9) +
  cheek(244, 190, 9) +
  W(`<circle cx="200" cy="192" r="15"/>`) +
  `<path d="M193 186 Q197 182 202 184" stroke-width="3"/>` +
  smile(200, 212, 10, 6) +
  // sininho
  W(`<circle cx="200" cy="256" r="12"/>`) +
  `<path d="M190 256 L210 256" stroke-width="3"/>`;

export const pinguim = () =>
  snowflake(46, 58, 16) +
  snowflake(354, 66, 14) +
  sparkle(90, 140, 9) +
  sparkle(318, 150, 9) +
  pine(58, 372, 0.95) +
  pine(344, 374, 1.05) +
  snowGround(378, 10) +
  // pés e asas (atrás do corpo)
  W(`<ellipse cx="164" cy="370" rx="30" ry="13"/><ellipse cx="236" cy="370" rx="30" ry="13"/>`) +
  W(`<path d="M116 228 Q66 266 82 324 Q112 304 122 270 Z"/><path d="M284 228 Q334 266 318 324 Q288 304 278 270 Z"/>`) +
  // corpo e barriga
  W(`<ellipse cx="200" cy="252" rx="94" ry="118"/>`) +
  W(`<path d="M200 168 C150 146 118 190 134 232 C118 292 150 352 200 358 C250 352 282 292 266 232 C282 190 250 146 200 168 Z"/>`) +
  eye(176, 212, 8) +
  eye(224, 212, 8) +
  cheek(156, 236, 9) +
  cheek(244, 236, 9) +
  W(`<path d="M186 230 Q200 222 214 230 Q206 246 200 248 Q194 246 186 230 Z"/>`) +
  // cachecol
  W(`<path d="M116 270 Q200 304 284 270 L286 296 Q200 330 114 296 Z"/>`) +
  `<path d="M150 284 L144 306 M178 292 L174 316 M222 292 L226 316 M250 284 L256 306" stroke-width="3"/>` +
  W(`<path d="M244 296 L258 352 L234 356 L226 302 Z"/>`) +
  `<path d="M232 342 L254 338 M230 326 L252 322" stroke-width="3"/>` +
  // gorro
  W(`<path d="M120 172 Q118 96 200 92 Q282 96 280 172 Z"/>`) +
  `<path d="M146 166 Q150 120 170 102 M200 164 L200 96 M254 166 Q250 120 230 102" stroke-width="3"/>` +
  W(fluffy(200, 86, 22, 20, 9, 0.18)) +
  furBand(110, 160, 180, 26);

export const boneco = () =>
  snowflake(48, 52, 16) +
  snowflake(350, 46, 14) +
  snowflake(372, 132, 10) +
  sparkle(70, 160, 9) +
  pine(52, 372, 1) +
  pine(350, 370, 0.85) +
  snowGround(378, 10) +
  // braços de galho com luvas
  tube("M130 262 Q96 240 70 214 M96 240 Q90 222 94 206", 14) +
  tube("M270 262 Q304 240 330 214 M304 240 Q310 222 306 206", 14) +
  W(fluffy(66, 206, 16, 15, 7, 0.12)) +
  W(fluffy(334, 206, 16, 15, 7, 0.12)) +
  // corpo e cabeça
  W(`<circle cx="200" cy="296" r="90"/>`) +
  `<path d="M140 340 Q170 360 196 352" stroke-width="3"/>` +
  W(`<circle cx="200" cy="270" r="9"/><circle cx="200" cy="304" r="9"/><circle cx="200" cy="338" r="9"/>`) +
  W(`<circle cx="200" cy="164" r="66"/>`) +
  eye(176, 152, 8) +
  eye(224, 152, 8) +
  cheek(156, 178, 10) +
  cheek(244, 178, 10) +
  W(`<path d="M196 168 Q230 172 252 180 Q228 186 196 182 Z"/>`) +
  `<path d="M214 172 L216 182 M230 175 L231 183" stroke-width="2.5"/>` +
  `<circle cx="180" cy="196" r="3" fill="#1E2340"/><circle cx="192" cy="202" r="3" fill="#1E2340"/><circle cx="206" cy="203" r="3" fill="#1E2340"/><circle cx="219" cy="198" r="3" fill="#1E2340"/>` +
  // cachecol
  W(`<path d="M134 214 Q200 248 266 214 L270 240 Q200 274 130 240 Z"/>`) +
  W(`<path d="M150 236 L136 296 L162 300 L172 244 Z"/>`) +
  `<path d="M140 282 L162 286 M144 266 L166 270" stroke-width="3"/>` +
  // cartola
  W(`<rect x="150" y="38" width="100" height="72" rx="6"/>`) +
  W(`<rect x="150" y="84" width="100" height="18"/>`) +
  W(`<ellipse cx="200" cy="110" rx="76" ry="13"/>`) +
  holly(232, 92, 0.9, 0);
