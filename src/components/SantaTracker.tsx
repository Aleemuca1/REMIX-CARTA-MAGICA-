import { useEffect, useMemo, useState } from "react";
import { MapPin, Sparkles } from "lucide-react";
import Reveal from "./Reveal";
import { WhatsIcon } from "./letter/ShareSheet";
import { whatsappUrl } from "../lib/shareKit";
import { LAND_PATHS, MAP_H, MAP_TOP, MAP_W, NEWS, ROUTE, TRAINING, flyingAt, phaseAt, px, DEPART_H, RETURN_H, type Phase } from "../lib/santaRoute";

const POLE = ROUTE[0];
const fmt = (n: number) => n.toLocaleString("pt-BR");

/** ?rastreio=voo mostra uma simulação acelerada da noite de Natal (para conferir antes do dia 24) */
function useClock() {
  const demo = useMemo(() => new URLSearchParams(window.location.search).get("rastreio") === "voo", []);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [demo]);
  return { now, demo };
}

/** Seção "Rastreie o Papai Noel": mapa com o trenó e a contagem para o Natal. */
export default function SantaTracker({ onCreateLetter }: { onCreateLetter: () => void }) {
  const { now, demo } = useClock();
  const phase: Phase = useMemo(() => {
    if (demo) {
      const span = RETURN_H - DEPART_H;
      return flyingAt(DEPART_H + ((now / 1000) * 0.35) % span);
    }
    return phaseAt(new Date(now));
  }, [now, demo]);

  const link = `${window.location.origin}/#rastreador`;
  const share =
    phase.kind === "prep"
      ? `🛷 Faltam ${phase.daysToXmas} dias para o Natal! Acompanhe o trenó do Papai Noel e os preparativos no Polo Norte: ${link}`
      : phase.kind === "flying"
        ? `🛷 O Papai Noel está voando agora perto de ${phase.to.name}! Acompanhe ao vivo: ${link}`
        : `🎅 Missão cumprida! O Papai Noel entregou todos os presentes. Veja o mapa: ${link}`;

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" id="rastreador">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#4CC9F0]/50 bg-gradient-to-br from-[#081633] via-[#0D2149] to-[#060B19] p-4 sm:p-8 shadow-2xl">
          <div className="text-center mb-4 sm:mb-6">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0B132B] bg-[#4CC9F0] rounded-full px-3 py-1 mb-3">
              <MapPin className="w-3.5 h-3.5" /> {phase.kind === "flying" ? "Ao vivo" : "Atualiza todo dia"}
            </span>
            <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-white">Rastreie o Papai Noel</h2>
          </div>

          <Status phase={phase} demo={demo} />

          <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 bg-[#0A2A55]">
            <WorldMap phase={phase} now={now} />
          </div>

          {phase.kind === "prep" && <PrepCards phase={phase} />}

          <div className="mt-5 grid sm:grid-cols-[1fr_auto] gap-2 max-w-2xl mx-auto">
            <button
              onClick={onCreateLetter}
              className="rounded-2xl p-3.5 text-left bg-gradient-to-r from-[#9B021A] via-[#D90429] to-[#9B021A] border-2 border-[#FFD166] flex items-center gap-3 cursor-pointer shadow-xl btn-shine"
              id="tracker-letter-cta"
              data-celebrate
            >
              <span className="text-3xl relative z-10">✉️</span>
              <span className="relative z-10">
                <span className="block font-extrabold text-white leading-tight">
                  {phase.kind === "done" ? "Escreva para o Papai Noel do próximo Natal" : "Mande sua cartinha antes do trenó sair!"}
                </span>
                <span className="block text-[11px] text-[#FFE9A8] mt-0.5">O Papai Noel responde com o nome da criança • grátis</span>
              </span>
            </button>
            <a
              href={whatsappUrl(share)}
              target="_blank"
              rel="noopener"
              className="rounded-2xl px-5 py-3 font-bold text-white bg-[#25D366] inline-flex items-center justify-center gap-2"
              id="tracker-whats"
            >
              <WhatsIcon className="w-5 h-5" /> Avisar a família
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Status({ phase, demo }: { phase: Phase; demo: boolean }) {
  if (phase.kind === "prep") {
    const news = NEWS[phase.dayIndex % NEWS.length];
    return (
      <div className="text-center">
        <p className="text-white/80 text-sm">Faltam</p>
        <p className="font-cinzel text-6xl sm:text-7xl font-extrabold text-[#FFD166] leading-none drop-shadow-[0_0_20px_rgba(255,209,102,0.4)]" id="tracker-days">
          {phase.daysToXmas}
        </p>
        <p className="text-white font-bold text-lg">{phase.daysToXmas === 1 ? "dia para o Natal!" : "dias para o Natal!"}</p>
        <p className="mt-2 text-sm text-[#BDE7FF]">
          📰 Hoje no Polo Norte: <span className="text-white">{news}</span>
        </p>
      </div>
    );
  }
  if (phase.kind === "flying") {
    const near = phase.f > 0.85 ? phase.to : phase.f < 0.15 ? phase.from : null;
    return (
      <div className="text-center" id="tracker-live">
        {demo && <p className="text-[11px] text-[#FFD166] mb-1">Simulação da noite de Natal (acelerada)</p>}
        <p className="font-cinzel text-xl sm:text-3xl font-bold text-white">
          {near ? (
            <>
              🛷 Entregando presentes em <span className="text-[#FFD166]">{near.flag} {near.name}</span>!
            </>
          ) : (
            <>
              🛷 Voando para <span className="text-[#FFD166]">{phase.to.flag} {phase.to.name}</span>
            </>
          )}
        </p>
        <p className="mt-2 text-sm text-[#BDE7FF]">
          🎁 Presentes entregues: <b className="text-white tabular-nums">{fmt(phase.gifts)}</b>
        </p>
        <p className="mt-1 text-xs text-white/70">No Brasil ele chega perto da meia-noite. Hora de dormir, senão ele passa direto! 😴</p>
      </div>
    );
  }
  return (
    <div className="text-center">
      <p className="font-cinzel text-xl sm:text-3xl font-bold text-white">🎅 Missão cumprida!</p>
      <p className="mt-2 text-sm text-[#BDE7FF]">O Papai Noel entregou todos os presentes e voltou para o Polo Norte. Agora as renas estão dormindo. 💤</p>
    </div>
  );
}

function PrepCards({ phase }: { phase: Extract<Phase, { kind: "prep" }> }) {
  const pct = Math.round(phase.progress * 100);
  const trip = TRAINING[phase.dayIndex % TRAINING.length];
  const items = [
    { e: "🎁", t: "Presentes prontos", v: `${pct}%`, bar: pct },
    { e: "🦌", t: "Renas em treino", v: "9 de 9", bar: 100 },
    { e: "✈️", t: "Voo de treino de hoje", v: trip.name, bar: null },
  ];
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
      {items.map((it) => (
        <div key={it.t} className="rounded-2xl bg-white/5 border border-white/10 p-3 flex items-center gap-3">
          <span className="text-2xl">{it.e}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-white/60 font-bold">{it.t}</p>
            <p className="text-white font-extrabold truncate">{it.v}</p>
            {it.bar !== null && (
              <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#2DC653] to-[#FFD166]" style={{ width: `${it.bar}%` }} />
              </div>
            )}
          </div>
        </div>
      ))}
      <p className="sm:col-span-3 text-center text-xs text-white/60 mt-1">
        <Sparkles className="inline w-3.5 h-3.5 text-[#FFD166] mr-1" />
        Volte amanhã: todo dia tem notícia nova e um voo de treino diferente. No dia 24 o trenó aparece ao vivo no mapa!
      </p>
    </div>
  );
}

function WorldMap({ phase, now }: { phase: Phase; now: number }) {
  // posição do trenó
  let sleigh = px(POLE.lon, POLE.lat);
  let dir = 1;
  let trail: { x: number; y: number }[] = [];
  let label: string | null = null;
  if (phase.kind === "prep") {
    // voo de treino: vai do Polo Norte até a cidade do dia e volta (a cada 10 s)
    const trip = TRAINING[phase.dayIndex % TRAINING.length];
    const a = px(POLE.lon, POLE.lat);
    const b = px(trip.lon, trip.lat);
    const t = ((now / 1000) % 10) / 10;
    const k = t < 0.5 ? t * 2 : 2 - t * 2;
    const e = k * k * (3 - 2 * k);
    const cx = (a.x + b.x) / 2 + (b.y - a.y) * 0.25;
    const cy = Math.min(a.y, b.y) - 10;
    sleigh = { x: (1 - e) * (1 - e) * a.x + 2 * (1 - e) * e * cx + e * e * b.x, y: (1 - e) * (1 - e) * a.y + 2 * (1 - e) * e * cy + e * e * b.y };
    dir = (t < 0.5 ? b.x - a.x : a.x - b.x) >= 0 ? 1 : -1;
    label = trip.name;
    trail = [];
  } else if (phase.kind === "flying") {
    sleigh = px(phase.pos.lon, phase.pos.lat);
    let dl = phase.to.lon - phase.from.lon;
    if (dl > 180) dl -= 360;
    if (dl < -180) dl += 360;
    dir = dl >= 0 ? 1 : -1;
    trail = ROUTE.slice(1, phase.idx + 1).map((s) => px(s.lon, s.lat));
  }

  const done = phase.kind === "done";
  const visited = phase.kind === "flying" ? phase.idx : done ? ROUTE.length : 0;

  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="w-full h-auto block" role="img" aria-label="Mapa do mundo com o trenó do Papai Noel">
      <defs>
        <radialGradient id="tr-glow">
          <stop offset="0%" stopColor="#FFD166" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFD166" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tr-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#13386E" />
          <stop offset="100%" stopColor="#0A2A55" />
        </linearGradient>
      </defs>
      <rect width={MAP_W} height={MAP_H} fill="url(#tr-sea)" />
      {/* linhas de latitude/longitude */}
      {Array.from({ length: 11 }, (_, i) => (
        <line key={`v${i}`} x1={i * 36} x2={i * 36} y1={0} y2={MAP_H} stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.3" />
      ))}
      {[60, 30, 0, -30].map((lat) => (
        <line key={`h${lat}`} x1={0} x2={MAP_W} y1={MAP_TOP - lat} y2={MAP_TOP - lat} stroke="#ffffff" strokeOpacity={lat === 0 ? 0.1 : 0.05} strokeWidth="0.3" />
      ))}
      {/* faixa de gelo do Polo Norte */}
      <rect x={0} y={0} width={MAP_W} height={5} fill="#E8F4FF" opacity="0.85" />
      {LAND_PATHS.map((d, i) => (
        <path key={i} d={d} fill="#2E7D4F" stroke="#7BD389" strokeOpacity="0.5" strokeWidth="0.35" strokeLinejoin="round" />
      ))}
      {/* Brasil em destaque */}
      <circle cx={px(-47, -14).x} cy={px(-47, -14).y} r={10} fill="#FFD166" opacity="0.08" />

      {/* rota da noite de Natal */}
      {ROUTE.slice(1, -1).map((s, i) => {
        const p = px(s.lon, s.lat);
        const isVisited = i + 1 <= visited;
        return <circle key={`${s.name}${i}`} cx={p.x} cy={p.y} r={isVisited ? 1.4 : 0.9} fill={isVisited ? "#FFD166" : "#ffffff"} opacity={isVisited ? 1 : 0.35} />;
      })}
      {trail.length > 1 && (
        <polyline
          points={trail.map((p) => `${p.x},${p.y}`).join(" ") + (phase.kind === "flying" ? ` ${sleigh.x},${sleigh.y}` : "")}
          fill="none"
          stroke="#FFD166"
          strokeWidth="0.6"
          strokeDasharray="1.6 1.2"
          opacity="0.85"
        />
      )}

      {/* oficina no Polo Norte */}
      <g transform={`translate(${px(POLE.lon, POLE.lat).x} ${px(POLE.lon, POLE.lat).y + 3})`}>
        <circle r={5} fill="url(#tr-glow)" opacity="0.6" />
        <text fontSize="6" textAnchor="middle" dominantBaseline="middle">
          🏠
        </text>
        <text y={6.5} fontSize="2.6" textAnchor="middle" fill="#ffffff" fontWeight="700">
          Polo Norte
        </text>
      </g>

      {label && (
        <g>
          {(() => {
            const t = TRAINING.find((x) => x.name === label)!;
            const p = px(t.lon, t.lat);
            return (
              <>
                <circle cx={p.x} cy={p.y} r={1.6} fill="#FFD166" />
                <circle cx={p.x} cy={p.y} r={3.5} fill="none" stroke="#FFD166" strokeWidth="0.4">
                  <animate attributeName="r" values="1.6;5;1.6" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x={p.x} y={p.y + 5} fontSize="2.8" textAnchor="middle" fill="#FFE9A8" fontWeight="700">
                  {label}
                </text>
              </>
            );
          })()}
        </g>
      )}

      {/* trenó */}
      {!done && (
        <g transform={`translate(${sleigh.x.toFixed(2)} ${sleigh.y.toFixed(2)})`} id="tracker-sleigh">
          <circle r={7} fill="url(#tr-glow)" opacity="0.7" />
          <g transform={`scale(${dir} 1)`}>
            <text fontSize="7" textAnchor="middle" dominantBaseline="middle">
              🛷
            </text>
          </g>
          <text y={-4.5} fontSize="3.4" textAnchor="middle">
            🎅
          </text>
        </g>
      )}
    </svg>
  );
}
