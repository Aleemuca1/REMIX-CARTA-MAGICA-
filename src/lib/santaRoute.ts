/**
 * Rota do trenó na véspera de Natal e o "dia a dia" do Polo Norte antes disso.
 * O Papai Noel chega em cada cidade perto da meia-noite local (como os rastreadores famosos):
 * sai do Polo Norte no dia 24 às 10h (UTC) e volta no dia 25 por volta das 11h (UTC).
 */
export type Stop = { name: string; lon: number; lat: number; h: number; flag: string };

/** h = horas depois de 24/12 00:00 UTC em que o trenó passa pela cidade */
export const ROUTE: Stop[] = [
  { name: "Polo Norte", lon: -30, lat: 84, h: 10, flag: "🎅" },
  { name: "Auckland", lon: 174.8, lat: -36.8, h: 11, flag: "🇳🇿" },
  { name: "Sydney", lon: 151.2, lat: -33.9, h: 13, flag: "🇦🇺" },
  { name: "Tóquio", lon: 139.7, lat: 35.7, h: 15, flag: "🇯🇵" },
  { name: "Pequim", lon: 116.4, lat: 39.9, h: 16, flag: "🇨🇳" },
  { name: "Mumbai", lon: 72.9, lat: 19.1, h: 18.5, flag: "🇮🇳" },
  { name: "Dubai", lon: 55.3, lat: 25.3, h: 20, flag: "🇦🇪" },
  { name: "Moscou", lon: 37.6, lat: 55.8, h: 21, flag: "🇷🇺" },
  { name: "Cairo", lon: 31.2, lat: 30.0, h: 22, flag: "🇪🇬" },
  { name: "Roma", lon: 12.5, lat: 41.9, h: 22.8, flag: "🇮🇹" },
  { name: "Paris", lon: 2.35, lat: 48.9, h: 23.2, flag: "🇫🇷" },
  { name: "Londres", lon: -0.1, lat: 51.5, h: 23.8, flag: "🇬🇧" },
  { name: "Lisboa", lon: -9.1, lat: 38.7, h: 24.2, flag: "🇵🇹" },
  { name: "Natal (RN)", lon: -35.2, lat: -5.8, h: 26.5, flag: "🇧🇷" },
  { name: "Recife", lon: -34.9, lat: -8.05, h: 26.7, flag: "🇧🇷" },
  { name: "Salvador", lon: -38.5, lat: -12.97, h: 26.9, flag: "🇧🇷" },
  { name: "Rio de Janeiro", lon: -43.2, lat: -22.9, h: 27.1, flag: "🇧🇷" },
  { name: "São Paulo", lon: -46.6, lat: -23.5, h: 27.3, flag: "🇧🇷" },
  { name: "Curitiba", lon: -49.3, lat: -25.4, h: 27.45, flag: "🇧🇷" },
  { name: "Porto Alegre", lon: -51.2, lat: -30.0, h: 27.6, flag: "🇧🇷" },
  { name: "Belo Horizonte", lon: -43.9, lat: -19.9, h: 27.75, flag: "🇧🇷" },
  { name: "Brasília", lon: -47.9, lat: -15.8, h: 27.9, flag: "🇧🇷" },
  { name: "Buenos Aires", lon: -58.4, lat: -34.6, h: 28.05, flag: "🇦🇷" },
  { name: "Manaus", lon: -60.0, lat: -3.1, h: 28.4, flag: "🇧🇷" },
  { name: "Nova York", lon: -74.0, lat: 40.7, h: 29, flag: "🇺🇸" },
  { name: "Cidade do México", lon: -99.1, lat: 19.4, h: 30, flag: "🇲🇽" },
  { name: "Los Angeles", lon: -118.2, lat: 34.05, h: 32, flag: "🇺🇸" },
  { name: "Havaí", lon: -157.9, lat: 21.3, h: 34, flag: "🇺🇸" },
  { name: "Polo Norte", lon: -30, lat: 84, h: 35, flag: "🎅" },
];

export const DEPART_H = ROUTE[0].h;
export const RETURN_H = ROUTE[ROUTE.length - 1].h;
export const TOTAL_GIFTS = 2_400_000_000;

export type Phase =
  | { kind: "prep"; daysToXmas: number; progress: number; dayIndex: number }
  | { kind: "flying"; pos: { lon: number; lat: number }; from: Stop; to: Stop; idx: number; f: number; gifts: number; hour: number }
  | { kind: "done" };

/** horas desde 24/12 00:00 UTC do ano do Natal "atual" */
export function phaseAt(now: Date): Phase {
  const y = now.getUTCFullYear();
  const eve = Date.UTC(y, 11, 24, 0, 0, 0);
  const hours = (now.getTime() - eve) / 3600000;
  if (hours >= DEPART_H && hours < RETURN_H) return flyingAt(hours);
  // depois da volta, até o fim do ano: missão cumprida
  if (hours >= RETURN_H) return { kind: "done" };
  // dias até o Natal (25/12 no horário do aparelho)
  const xmas = new Date(y, 11, 25, 0, 0, 0).getTime();
  const daysToXmas = Math.max(0, Math.ceil((xmas - now.getTime()) / 86400000));
  // presentes prontos: 35% em 1º/out → 100% na véspera
  const start = Date.UTC(y, 9, 1);
  const progress = Math.max(0.35, Math.min(1, 0.35 + (0.65 * (now.getTime() - start)) / (eve - start)));
  const dayIndex = Math.floor(now.getTime() / 86400000);
  return { kind: "prep", daysToXmas, progress, dayIndex };
}

export function flyingAt(hours: number): Phase {
  let i = 0;
  while (i < ROUTE.length - 2 && ROUTE[i + 1].h <= hours) i++;
  const from = ROUTE[i];
  const to = ROUTE[i + 1];
  const f = Math.max(0, Math.min(1, (hours - from.h) / (to.h - from.h)));
  // atravessar a linha da data pelo caminho mais curto
  let dl = to.lon - from.lon;
  if (dl > 180) dl -= 360;
  if (dl < -180) dl += 360;
  let lon = from.lon + dl * f;
  if (lon > 180) lon -= 360;
  if (lon < -180) lon += 360;
  const lat = from.lat + (to.lat - from.lat) * f;
  const gifts = Math.round((TOTAL_GIFTS * (hours - DEPART_H)) / (RETURN_H - 1 - DEPART_H));
  return { kind: "flying", pos: { lon, lat }, from, to, idx: i, f, gifts: Math.min(TOTAL_GIFTS, Math.max(0, gifts)), hour: hours };
}

/** Voo de treino do dia (antes do Natal): muda a cada dia, para a família voltar amanhã. */
export const TRAINING: { name: string; lon: number; lat: number }[] = [
  { name: "Rio de Janeiro", lon: -43.2, lat: -22.9 },
  { name: "Tóquio", lon: 139.7, lat: 35.7 },
  { name: "Lisboa", lon: -9.1, lat: 38.7 },
  { name: "Salvador", lon: -38.5, lat: -12.97 },
  { name: "Sydney", lon: 151.2, lat: -33.9 },
  { name: "Nova York", lon: -74.0, lat: 40.7 },
  { name: "Manaus", lon: -60.0, lat: -3.1 },
  { name: "Cairo", lon: 31.2, lat: 30.0 },
  { name: "Curitiba", lon: -49.3, lat: -25.4 },
  { name: "Paris", lon: 2.35, lat: 48.9 },
  { name: "Recife", lon: -34.9, lat: -8.05 },
  { name: "Cidade do Cabo", lon: 18.4, lat: -33.9 },
  { name: "Belo Horizonte", lon: -43.9, lat: -19.9 },
  { name: "Pequim", lon: 116.4, lat: 39.9 },
  { name: "Porto Alegre", lon: -51.2, lat: -30.0 },
  { name: "Cidade do México", lon: -99.1, lat: 19.4 },
  { name: "Fortaleza", lon: -38.5, lat: -3.7 },
  { name: "Roma", lon: 12.5, lat: 41.9 },
  { name: "Brasília", lon: -47.9, lat: -15.8 },
  { name: "Buenos Aires", lon: -58.4, lat: -34.6 },
  { name: "São Paulo", lon: -46.6, lat: -23.5 },
];

export const NEWS: string[] = [
  "Os duendes embrulharam uma montanha de presentes hoje 🎁",
  "A Mamãe Noel testou uma receita nova de biscoito de gengibre 🍪",
  "O Rudolph treinou o nariz brilhante no meio da neblina 🔴",
  "O trenó ganhou uma camada nova de tinta vermelha 🛷",
  "Chegou um saco enorme de cartinhas do Brasil 📬",
  "As renas comeram cenouras extras para ficar fortes 🥕",
  "Os duendes conferiram a Lista do Bom Comportamento duas vezes 📜",
  "A oficina ficou acesa a noite inteira: falta pouco! 💡",
  "O Papai Noel experimentou a roupa nova (ficou um pouquinho apertada) 😄",
  "Os sininhos do trenó foram afinados 🔔",
  "Nevou muito no Polo Norte e as renas fizeram anjinhos na neve ❄️",
  "Um duende se perdeu dentro de uma caixa de presente (já acharam!) 📦",
  "O mapa das chaminés do Brasil foi atualizado 🗺️",
  "A Mamãe Noel costurou gorros novos para os duendes 🧵",
];

/* ---------- mapa: projeção simples (lon/lat → x/y) e continentes desenhados à mão ---------- */
export const MAP_W = 360;
export const MAP_TOP = 85; // latitude do topo
export const MAP_BOTTOM = -58;
export const MAP_H = MAP_TOP - MAP_BOTTOM;
export const px = (lon: number, lat: number) => ({ x: lon + 180, y: MAP_TOP - lat });

const LANDS: [number, number][][] = [
  // América do Norte
  [[-168,66],[-162,70],[-150,71],[-140,70],[-128,70],[-115,68],[-100,68],[-90,70],[-82,68],[-78,62],[-65,60],[-60,55],[-56,51],[-64,47],[-70,43],[-74,40],[-76,35],[-81,31],[-80,26],[-82,25],[-83,29],[-89,30],[-94,29],[-97,27],[-97,22],[-94,18],[-90,21],[-87,21],[-88,16],[-84,11],[-82,9],[-78,8],[-80,7.5],[-83,8],[-86,12],[-92,14],[-96,16],[-105,20],[-106,23],[-110,24],[-112,29],[-115,30],[-117,33],[-121,35],[-124,40],[-124,46],[-125,50],[-130,55],[-135,58],[-142,60],[-150,61],[-155,58],[-160,56],[-158,59],[-164,60],[-166,63]],
  // Groenlândia
  [[-55,82],[-30,83],[-20,80],[-20,72],[-25,70],[-35,65],[-43,60],[-50,62],[-53,67],[-56,72],[-66,77],[-60,79]],
  // América do Sul
  [[-78,8],[-72,12],[-63,10],[-55,6],[-50,1],[-44,-2],[-35,-6],[-35,-9],[-39,-14],[-40,-21],[-45,-23],[-48,-28],[-53,-33],[-58,-38],[-62,-40],[-65,-45],[-68,-50],[-69,-55],[-73,-53],[-75,-46],[-74,-40],[-72,-30],[-71,-20],[-76,-14],[-80,-6],[-81,-2],[-80,1]],
  // Europa + Ásia
  [[-10,36],[-9,43],[-2,44],[-5,48],[2,51],[8,54],[8,57],[5,59],[6,62],[13,67],[20,70],[28,71],[40,67],[45,68],[55,69],[68,72],[80,73],[95,76],[105,78],[115,74],[130,72],[140,72],[160,70],[170,69],[179,66],[178,64],[165,60],[160,55],[156,51],[142,53],[140,47],[135,43],[130,42],[127,38],[126,35],[122,31],[121,28],[118,24],[110,21],[108,17],[109,12],[105,9],[103,11],[100,13],[100,8],[103,2],[100,3],[98,8],[98,16],[95,17],[92,21],[88,22],[85,20],[80,15],[78,8],[76,10],[73,16],[72,21],[67,25],[61,25],[57,26],[56,24],[59,22],[55,17],[52,16],[45,13],[43,13],[39,21],[35,28],[34,31],[35,36],[30,36],[27,37],[26,40],[23,38],[21,40],[19,42],[16,40],[15,38],[12,42],[9,44],[4,43],[0,39],[-2,37],[-5,36]],
  // Grã-Bretanha
  [[-5,50],[1,51],[2,53],[-1,56],[-4,58],[-6,57],[-5,54],[-4,52]],
  // Japão
  [[130,31],[134,34],[140,36],[142,40],[141,45],[139,41],[136,36],[130,33]],
  // África
  [[-17,21],[-16,28],[-10,30],[-6,35],[10,37],[11,33],[20,31],[25,32],[32,31],[34,27],[38,18],[43,12],[51,12],[48,5],[42,-1],[40,-10],[40,-16],[35,-24],[32,-29],[27,-34],[20,-35],[18,-32],[15,-27],[12,-18],[13,-10],[12,-5],[9,-1],[9,4],[5,5],[-2,5],[-8,4],[-13,8],[-17,13]],
  // Madagascar
  [[44,-25],[47,-25],[50,-15],[49,-12],[44,-17]],
  // Sumatra/Java, Bornéu, Nova Guiné
  [[95,5],[100,1],[106,-6],[115,-8],[120,-9],[110,-6],[104,-4],[98,2]],
  [[109,1],[118,7],[119,1],[116,-4],[110,-3]],
  [[131,-1],[141,-3],[150,-10],[141,-9],[135,-4]],
  // Austrália
  [[114,-22],[114,-34],[118,-35],[124,-33],[131,-31],[138,-35],[141,-38],[147,-38],[150,-37],[153,-31],[153,-25],[146,-19],[142,-11],[136,-12],[131,-11],[126,-14],[122,-18]],
  // Nova Zelândia
  [[172,-35],[175,-37],[178,-38],[174,-42],[171,-45],[167,-46],[171,-41]],
];

export const LAND_PATHS = LANDS.map(
  (poly) =>
    poly
      .map(([lon, lat], i) => {
        const p = px(lon, lat);
        return `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      })
      .join(" ") + " Z",
);
