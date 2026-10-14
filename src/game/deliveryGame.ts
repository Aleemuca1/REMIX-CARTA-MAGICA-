/**
 * "Entrega Relâmpago do Papai Noel" — motor do jogo em <canvas>.
 * Um botão só: tocar/clicar/espaço solta um presente do trenó.
 * Acerte a boca das chaminés; chaminés douradas valem mais; o vento muda.
 */
import santaSrc from "../assets/images/santa-sleigh.webp";
import { drawFace, SEATS } from "../family/store";

export type GameResult = { score: number; delivered: number; perfect: number; bestStreak: number };

type House = {
  x: number; w: number; h: number; roofH: number;
  cx: number; cw: number; ch: number;
  golden: boolean; hit: boolean;
  body: string; windows: boolean[];
};
type Gift = { x: number; y: number; vx: number; vy: number; rot: number; color: string; done: boolean };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; world: boolean };
type Popup = { x: number; y: number; text: string; life: number; color: string };
export type PowerKind = "triplo" | "ima" | "tempo" | "turbo";
type Power = { x: number; y: number; kind: PowerKind; phase: number; taken: boolean };
type Thanks = { hs: House; life: number; text: string; emoji: string };
type Cloud = { x: number; y: number; s: number; par: number };

const POWER_INFO: Record<PowerKind, { emoji: string; label: string; color: string }> = {
  triplo: { emoji: "🎁", label: "Presente triplo!", color: "#F72585" },
  ima: { emoji: "🧲", label: "Ímã de chaminé!", color: "#4CC9F0" },
  tempo: { emoji: "⏰", label: "+5 segundos!", color: "#2DC653" },
  turbo: { emoji: "🌈", label: "Turbo arco-íris: pontos em dobro!", color: "#FFD166" },
};
const THANKS = ["Obrigado, Papai Noel!", "Eba! Presente!", "Uhuul!", "Valeu, Noel!", "Que alegria!", "Ho ho ho!"];
const KIDS = ["🧒", "👧", "👦", "👶", "🧒🏽", "👧🏾"];
const ANNOUNCE: Record<number, string> = { 5: "SUPER COMBO!", 10: "INCRÍVEL!", 15: "FANTÁSTICO!", 20: "LENDÁRIO!", 30: "MESTRE DO TRENÓ!" };

const GIFT_COLORS = ["#EF233C", "#2DC653", "#4CC9F0", "#F72585", "#FFD166", "#9D4EDD"];
const HOUSE_COLORS = ["#3A2E5C", "#2E3F5C", "#5C2E3A", "#2E5C4A", "#4A3A2E"];
const DURATION = 60;

export class DeliveryGame {
  private ctx: CanvasRenderingContext2D;
  private W = 0; private H = 0; private dpr = 1; private u = 1;
  private raf = 0; private last = 0; private running = false;
  private santa = new Image(); private santaReady = false;
  /** Família que viaja no trenó (fotos do "Família no Trenó"). */
  passengers: HTMLImageElement[] = [];
  passengerNames: string[] = [];

  private cam = 0; private speed = 0; private t = 0; private timeLeft = DURATION;
  private houses: House[] = []; private gifts: Gift[] = []; private parts: Particle[] = []; private pops: Popup[] = [];
  private snow: { x: number; y: number; r: number; s: number }[] = [];
  private stars: { x: number; y: number; r: number; p: number }[] = [];
  private wind = 0; private windTarget = 0; private windTimer = 0;
  private cooldown = 0; private streak = 0;
  private res: GameResult = { score: 0, delivered: 0, perfect: 0, bestStreak: 0 };
  private shake = 0;
  private bonusTime = 0;
  private powers: Power[] = []; private powerTimer = 6;
  private effects: Record<"triplo" | "ima" | "turbo", number> = { triplo: 0, ima: 0, turbo: 0 };
  private announce: { text: string; life: number; color: string } | null = null;
  private flash = 0;
  private thanks: Thanks[] = [];
  private clouds: Cloud[] = [];
  private shootStar: { x: number; y: number; life: number } | null = null; private shootTimer = 3;
  /** Modo fácil para os pequenos: chaminés maiores, sem vento e trenó mais lento. */
  easy = false;

  onEnd?: (r: GameResult) => void;
  onSound?: (kind: "drop" | "hit" | "perfect" | "miss" | "golden" | "power" | "combo", streak: number) => void;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    this.santa.onload = () => (this.santaReady = true);
    this.santa.src = santaSrc;
    this.resize();
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = r.width; this.H = r.height;
    this.canvas.width = Math.round(r.width * this.dpr);
    this.canvas.height = Math.round(r.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.u = this.H / 600;
    this.stars = Array.from({ length: 70 }, () => ({
      x: Math.random() * this.W, y: Math.random() * this.H * 0.55, r: Math.random() * 1.4 + 0.3, p: Math.random() * 6,
    }));
    this.clouds = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * this.W * 1.5, y: this.H * (0.08 + Math.random() * 0.3), s: 0.6 + Math.random() * 0.8, par: 0.05 + (i % 3) * 0.04,
    }));
    this.snow = Array.from({ length: 60 }, () => ({
      x: Math.random() * this.W, y: Math.random() * this.H, r: Math.random() * 2 + 0.8, s: Math.random() * 30 + 20,
    }));
    if (!this.running) this.draw();
  }

  private get groundY() { return this.H * 0.88; }
  private get sleighX() { return this.W * (this.W < 600 ? 0.16 : 0.2); }
  private get sleighY() { return this.H * 0.17 + Math.sin(this.t * 2.2) * this.H * 0.025; }
  private get santaW() { return Math.min(this.W * 0.34, this.H * 0.36); }

  start() {
    this.cam = 0; this.t = 0; this.timeLeft = DURATION; this.speed = (this.easy ? 150 : 190) * this.u;
    this.powers = []; this.powerTimer = 5; this.effects = { triplo: 0, ima: 0, turbo: 0 };
    this.announce = null; this.flash = 0; this.thanks = [];
    this.houses = []; this.gifts = []; this.parts = []; this.pops = [];
    this.wind = 0; this.windTarget = 0; this.windTimer = 4; this.cooldown = 0; this.streak = 0; this.bonusTime = 0;
    this.res = { score: 0, delivered: 0, perfect: 0, bestStreak: 0 };
    let x = this.W * 0.75;
    while (x < this.W * 3) x = this.addHouse(x);
    this.running = true;
    this.last = performance.now();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() { this.running = false; cancelAnimationFrame(this.raf); }

  private addHouse(x: number) {
    const u = this.u;
    const w = (90 + Math.random() * 70) * u;
    const h = (70 + Math.random() * 90) * u;
    const roofH = w * (0.32 + Math.random() * 0.12);
    const cw = (30 + Math.random() * 10) * u * (this.easy ? 1.6 : 1);
    const golden = this.houses.length > 2 && Math.random() < 0.16;
    this.houses.push({
      x, w, h, roofH,
      cx: w * (0.58 + Math.random() * 0.14), cw, ch: (34 + Math.random() * 16) * u,
      golden, hit: false,
      body: HOUSE_COLORS[Math.floor(Math.random() * HOUSE_COLORS.length)],
      windows: [Math.random() > 0.25, Math.random() > 0.25, Math.random() > 0.4],
    });
    return x + w + (70 + Math.random() * 150) * u;
  }

  /** Altura do telhado (em coordenadas de tela Y) num ponto x do mundo. */
  private roofYAt(hs: House, wx: number) {
    const top = this.groundY - hs.h;
    const mid = hs.x + hs.w / 2;
    const d = Math.abs(wx - mid) / (hs.w / 2 + 10 * this.u);
    return top - hs.roofH * (1 - Math.min(1, d));
  }
  private chimneyTop(hs: House) {
    const base = this.roofYAt(hs, hs.x + hs.cx + hs.cw / 2);
    return base - hs.ch;
  }

  drop() {
    if (!this.running || this.cooldown > 0) return;
    this.cooldown = 0.32;
    const sw = this.santaW;
    const spreads = this.effects.triplo > 0 ? [-70, 0, 70] : [0];
    for (const sp of spreads) {
      this.gifts.push({
        x: this.cam + this.sleighX + sw * 0.2,
        y: this.sleighY + sw * 0.28,
        vx: this.speed * 0.9 + sp * this.u, vy: 40 * this.u, rot: Math.random() * 3,
        color: GIFT_COLORS[Math.floor(Math.random() * GIFT_COLORS.length)], done: false,
      });
    }
    this.onSound?.("drop", this.streak);
  }

  private burst(x: number, y: number, colors: string[], n: number, world = true, power = 1) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = (60 + Math.random() * 200) * this.u * power;
      this.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80 * this.u, life: 1, color: colors[i % colors.length], size: (2 + Math.random() * 3) * this.u, world });
    }
  }

  private loop = (now: number) => {
    if (!this.running) return;
    const real = Math.min(0.25, (now - this.last) / 1000);
    this.last = now;
    // física em passos pequenos; o relógio usa o tempo real
    let rest = real;
    while (rest > 0 && this.running) {
      const dt = Math.min(0.02, rest);
      this.update(dt);
      rest -= dt;
    }
    this.draw();
    if (this.running) this.raf = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    const u = this.u;
    this.t += dt;
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.running = false;
      this.draw();
      this.onEnd?.(this.res);
      return;
    }
    // acelera aos poucos
    this.speed = ((this.easy ? 150 : 190) + (DURATION - this.timeLeft) * (this.easy ? 1.6 : 2.6)) * u;
    (Object.keys(this.effects) as (keyof typeof this.effects)[]).forEach((k) => (this.effects[k] = Math.max(0, this.effects[k] - dt)));
    this.flash = Math.max(0, this.flash - dt * 2.5);
    if (this.announce) { this.announce.life -= dt; if (this.announce.life <= 0) this.announce = null; }
    for (const th of this.thanks) th.life -= dt;
    this.thanks = this.thanks.filter((th) => th.life > 0);
    for (const c of this.clouds) if (c.x - this.cam * c.par < -200 * u) c.x += this.W * 1.6 + 200 * u;
    this.shootTimer -= dt;
    if (this.shootTimer <= 0) { this.shootTimer = 4 + Math.random() * 6; this.shootStar = { x: this.W * (0.4 + Math.random() * 0.6), y: this.H * Math.random() * 0.2, life: 1 }; }
    if (this.shootStar) { this.shootStar.life -= dt * 1.4; this.shootStar.x -= 420 * u * dt; this.shootStar.y += 160 * u * dt; if (this.shootStar.life <= 0) this.shootStar = null; }

    // power-ups flutuando: acerte com um presente para pegar
    this.powerTimer -= dt;
    if (this.powerTimer <= 0) {
      this.powerTimer = 7 + Math.random() * 5;
      const kinds: PowerKind[] = ["triplo", "ima", "tempo", "turbo"];
      this.powers.push({ x: this.cam + this.W * 1.05, y: this.H * (0.36 + Math.random() * 0.16), kind: kinds[Math.floor(Math.random() * kinds.length)], phase: Math.random() * 6, taken: false });
    }
    this.powers = this.powers.filter((pw) => !pw.taken && pw.x > this.cam - 60 * u);
    this.cam += this.speed * dt;
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.shake = Math.max(0, this.shake - dt * 3);

    // vento
    this.windTimer -= dt;
    if (this.windTimer <= 0) {
      this.windTimer = 5 + Math.random() * 5;
      const lvl = Math.min(1, (DURATION - this.timeLeft) / 40);
      this.windTarget = this.easy ? 0 : (Math.random() * 2 - 1) * 120 * u * (0.3 + lvl);
    }
    this.wind += (this.windTarget - this.wind) * Math.min(1, dt * 1.5);

    // casas
    const lastH = this.houses[this.houses.length - 1];
    if (lastH.x + lastH.w < this.cam + this.W * 2) this.addHouse(lastH.x + lastH.w + (70 + Math.random() * 150) * u);
    this.houses = this.houses.filter((h) => h.x + h.w > this.cam - 200 * u);

    // presentes
    const g = 900 * u;
    for (const gf of this.gifts) {
      if (gf.done) continue;
      const prevY = gf.y;
      gf.vy += g * dt;
      gf.vx += this.wind * dt;
      if (this.effects.ima > 0) {
        let best: number | null = null;
        for (const hs of this.houses) {
          if (hs.hit) continue;
          const cx = hs.x + hs.cx + hs.cw / 2;
          if (cx < gf.x - 30 * u || cx > gf.x + 260 * u) continue;
          if (best === null || Math.abs(cx - gf.x) < Math.abs(best - gf.x)) best = cx;
        }
        if (best !== null) gf.vx += (best - gf.x) * 7 * dt;
      }
      for (const pw of this.powers) {
        if (pw.taken) continue;
        const py = pw.y + Math.sin(this.t * 2 + pw.phase) * 10 * u;
        if (Math.hypot(gf.x - pw.x, gf.y - py) < 30 * u) this.takePower(pw, py);
      }
      gf.x += gf.vx * dt;
      gf.y += gf.vy * dt;
      gf.rot += dt * 4;
      for (const hs of this.houses) {
        if (gf.x < hs.x - 20 * u || gf.x > hs.x + hs.w + 20 * u) continue;
        const cTop = this.chimneyTop(hs);
        const cL = hs.x + hs.cx, cR = cL + hs.cw;
        // entrou na chaminé
        if (prevY <= cTop && gf.y >= cTop && gf.x >= cL - 3 * u && gf.x <= cR + 3 * u) {
          gf.done = true;
          const center = Math.abs(gf.x - (cL + hs.cw / 2)) < hs.cw * 0.22;
          this.streak++;
          this.res.bestStreak = Math.max(this.res.bestStreak, this.streak);
          this.res.delivered++;
          const mult = Math.min(5, 1 + Math.floor(this.streak / 3));
          let pts = (hs.golden ? 30 : 10) * mult;
          if (center) { pts += 5 * mult; this.res.perfect++; }
          if (this.effects.turbo > 0) pts *= 2;
          this.thanks.push({ hs, life: 2.4, text: THANKS[Math.floor(Math.random() * THANKS.length)], emoji: KIDS[Math.floor(Math.random() * KIDS.length)] });
          if (ANNOUNCE[this.streak]) {
            this.announce = { text: ANNOUNCE[this.streak], life: 1.6, color: "#FFD166" };
            this.flash = 0.6;
            this.onSound?.("combo", this.streak);
          }
          this.res.score += pts;
          const bonus = hs.golden && this.bonusTime < 12 ? 2 : 0;
          this.bonusTime += bonus;
          this.timeLeft += bonus;
          hs.hit = true;
          const colors = hs.golden ? ["#FFD166", "#FFF1C1", "#FFB703"] : ["#FFD166", "#EF233C", "#FFFFFF", "#2DC653"];
          this.burst(cL + hs.cw / 2, cTop, colors, hs.golden ? 40 : 22, true, hs.golden ? 1.4 : 1);
          this.pops.push({
            x: cL + hs.cw / 2, y: cTop - 20 * u,
            text: `${center ? "PERFEITO! " : ""}+${pts}${bonus ? " ⭐ +2s" : hs.golden ? " ⭐" : ""}`,
            life: 1.2, color: hs.golden ? "#FFD166" : center ? "#4CC9F0" : "#FFFFFF",
          });
          this.onSound?.(hs.golden ? "golden" : center ? "perfect" : "hit", this.streak);
          break;
        }
        // bateu no telhado ou no corpo da casa
        const inChimneyX = gf.x >= cL && gf.x <= cR;
        const hitChimneyWall = inChimneyX && gf.y > cTop;
        if (gf.x >= hs.x && gf.x <= hs.x + hs.w && (gf.y >= this.roofYAt(hs, gf.x) || hitChimneyWall)) {
          this.miss(gf);
          break;
        }
      }
      if (!gf.done && gf.y >= this.groundY) this.miss(gf);
    }
    this.gifts = this.gifts.filter((gf) => !gf.done && gf.x > this.cam - 100 * u);

    for (const p of this.parts) {
      p.vy += 500 * u * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 1.3;
    }
    this.parts = this.parts.filter((p) => p.life > 0);
    for (const pp of this.pops) { pp.y -= 40 * u * dt; pp.life -= dt; }
    this.pops = this.pops.filter((p) => p.life > 0);

    for (const s of this.snow) {
      s.y += s.s * u * dt; s.x += (this.wind / (3 * u) * 0.02 - 10) * dt * u;
      if (s.y > this.H) { s.y = -5; s.x = Math.random() * this.W; }
      if (s.x < -5) s.x = this.W + 5; if (s.x > this.W + 5) s.x = -5;
    }
  }

  private takePower(pw: Power, py: number) {
    pw.taken = true;
    const info = POWER_INFO[pw.kind];
    if (pw.kind === "tempo") this.timeLeft += 5;
    else this.effects[pw.kind] = 8;
    this.announce = { text: `${info.emoji} ${info.label}`, life: 1.5, color: info.color };
    this.flash = 0.35;
    this.burst(pw.x, py, [info.color, "#FFFFFF", "#FFD166"], 36, true, 1.3);
    this.onSound?.("power", this.streak);
  }

  private miss(gf: Gift) {
    gf.done = true;
    if (this.streak >= 3) this.pops.push({ x: gf.x, y: gf.y - 20 * this.u, text: "combo perdido", life: 1, color: "#FF8FA3" });
    this.streak = 0;
    this.burst(gf.x, gf.y, ["#FFFFFF", "#DDE8FF"], 10, true, 0.5);
    this.shake = 0.25;
    this.onSound?.("miss", 0);
  }

  // ------------------------------------------------------------------ desenho
  private draw() {
    const { ctx, W, H, u } = this;
    ctx.save();
    if (this.shake > 0) ctx.translate((Math.random() - 0.5) * 6 * this.shake, (Math.random() - 0.5) * 6 * this.shake);

    // céu
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#050A1A"); sky.addColorStop(0.6, "#0E1A3A"); sky.addColorStop(1, "#1C2A55");
    ctx.fillStyle = sky; ctx.fillRect(-10, -10, W + 20, H + 20);

    for (const s of this.stars) {
      ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(this.t * 1.5 + s.p));
      ctx.fillStyle = "#FFF6D8";
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // lua
    const mx = W * 0.82, my = H * 0.16, mr = 34 * u;
    const glow = ctx.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 3);
    glow.addColorStop(0, "rgba(255,241,193,0.35)"); glow.addColorStop(1, "rgba(255,241,193,0)");
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(mx, my, mr * 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#FFF4CF"; ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();

    // aurora boreal
    for (let band = 0; band < 2; band++) {
      ctx.save();
      ctx.globalAlpha = 0.16 + band * 0.06;
      ctx.fillStyle = band ? "#4CC9F0" : "#2DC653";
      ctx.beginPath();
      ctx.moveTo(0, H * 0.05);
      for (let x = 0; x <= W; x += 20) {
        ctx.lineTo(x, H * (0.1 + band * 0.06) + Math.sin(x * 0.008 + this.t * 0.6 + band * 2) * 18 * u);
      }
      for (let x = W; x >= 0; x -= 20) {
        ctx.lineTo(x, H * (0.2 + band * 0.06) + Math.sin(x * 0.01 + this.t * 0.5 + band) * 22 * u);
      }
      ctx.closePath();
      ctx.filter = "blur(8px)";
      ctx.fill();
      ctx.restore();
    }
    if (this.shootStar) {
      const st = this.shootStar;
      const gr = ctx.createLinearGradient(st.x, st.y, st.x + 90 * u, st.y - 34 * u);
      gr.addColorStop(0, `rgba(255,255,255,${st.life})`);
      gr.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = gr; ctx.lineWidth = 2 * u;
      ctx.beginPath(); ctx.moveTo(st.x, st.y); ctx.lineTo(st.x + 90 * u, st.y - 34 * u); ctx.stroke();
    }
    // nuvens
    ctx.fillStyle = "rgba(220,232,250,0.12)";
    for (const c of this.clouds) {
      const cx = c.x - this.cam * c.par, cy = c.y, s = c.s * 40 * u;
      ctx.beginPath();
      ctx.ellipse(cx, cy, s * 1.6, s * 0.55, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + s * 0.8, cy - s * 0.3, s, s * 0.6, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - s * 0.7, cy - s * 0.2, s * 0.9, s * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // colinas em parallax
    this.hills(0.15, H * 0.72, 60 * u, "#16234A", 0.004);
    this.hills(0.35, H * 0.8, 40 * u, "#1B2B57", 0.007);

    // casas
    for (const hs of this.houses) this.drawHouse(hs);
    this.drawThanks();
    this.drawPowers();

    // chão
    ctx.fillStyle = "#DCE8FA";
    ctx.fillRect(-10, this.groundY, W + 20, H - this.groundY + 10);
    ctx.fillStyle = "#B8CBEA";
    ctx.fillRect(-10, this.groundY + 6 * u, W + 20, 3 * u);

    // presentes
    for (const gf of this.gifts) this.drawGift(gf.x - this.cam, gf.y, gf.rot, gf.color);

    // trenó
    this.drawSleigh();

    // partículas e textos
    for (const p of this.parts) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.world ? p.x - this.cam : p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    for (const pp of this.pops) {
      ctx.globalAlpha = Math.min(1, pp.life * 1.5);
      ctx.font = `800 ${Math.round(18 * u)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.lineWidth = 4 * u; ctx.strokeStyle = "rgba(6,11,25,0.8)";
      ctx.strokeText(pp.text, pp.x - this.cam, pp.y);
      ctx.fillStyle = pp.color; ctx.fillText(pp.text, pp.x - this.cam, pp.y);
    }
    ctx.globalAlpha = 1;

    // neve
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    for (const s of this.snow) { ctx.beginPath(); ctx.arc(s.x, s.y, s.r * u, 0, Math.PI * 2); ctx.fill(); }

    ctx.restore();
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255,241,193,${this.flash * 0.35})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (this.announce) {
      const a = this.announce;
      const k = Math.min(1, (1.6 - a.life) * 6);
      const scale = 0.6 + k * 0.4 + Math.sin(this.t * 10) * 0.02;
      ctx.save();
      ctx.translate(W / 2, H * 0.42);
      ctx.scale(scale, scale);
      ctx.globalAlpha = Math.min(1, a.life * 2);
      ctx.textAlign = "center";
      ctx.font = `900 ${Math.round(34 * u)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.lineWidth = 7 * u; ctx.strokeStyle = "rgba(6,11,25,0.85)";
      ctx.strokeText(a.text, 0, 0);
      ctx.fillStyle = a.color; ctx.fillText(a.text, 0, 0);
      ctx.restore();
    }
    this.drawHud();
  }

  private drawThanks() {
    const { ctx, u } = this;
    for (const th of this.thanks) {
      const hs = th.hs;
      const x = hs.x - this.cam;
      if (x > this.W + 50 || x + hs.w < -50) continue;
      const top = this.groundY - hs.h;
      const k = 1 - th.life / 2.4;
      const pop = Math.min(1, k * 6);
      const wx = x + hs.w * 0.5, wy = top + hs.h * 0.3 + 9 * u;
      ctx.save();
      ctx.globalAlpha = Math.min(1, th.life * 1.5);
      ctx.font = `${Math.round(18 * u * pop)}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(th.emoji, wx, wy + 6 * u - Math.abs(Math.sin(this.t * 10)) * 3 * u);
      // balão de fala
      const ty = top - hs.roofH - 18 * u - k * 16 * u;
      ctx.font = `800 ${Math.round(12 * u)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      const tw = ctx.measureText(th.text).width + 14 * u;
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.beginPath();
      ctx.roundRect(wx - tw / 2, ty - 14 * u, tw, 20 * u, 10 * u);
      ctx.fill();
      ctx.fillStyle = "#1C2541";
      ctx.fillText(th.text, wx, ty);
      ctx.fillStyle = "#EF233C";
      ctx.font = `${Math.round(12 * u)}px system-ui`;
      ctx.fillText("❤", wx + tw / 2 + 4 * u, ty - 12 * u - k * 10 * u);
      ctx.restore();
    }
  }

  private drawPowers() {
    const { ctx, u } = this;
    for (const pw of this.powers) {
      const x = pw.x - this.cam;
      const y = pw.y + Math.sin(this.t * 2 + pw.phase) * 10 * u;
      const info = POWER_INFO[pw.kind];
      const r = 20 * u * (1 + Math.sin(this.t * 5 + pw.phase) * 0.06);
      const gl = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 2.2);
      gl.addColorStop(0, info.color + "88");
      gl.addColorStop(1, info.color + "00");
      ctx.fillStyle = gl;
      ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.strokeStyle = info.color; ctx.lineWidth = 2.5 * u;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.font = `${Math.round(20 * u)}px system-ui`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(info.emoji, x, y + 1 * u);
      ctx.textBaseline = "alphabetic";
    }
  }

  private hills(par: number, baseY: number, amp: number, color: string, freq: number) {
    const { ctx, W, H } = this;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(-10, H);
    const off = this.cam * par;
    for (let x = -10; x <= W + 10; x += 12) {
      const wx = x + off;
      ctx.lineTo(x, baseY - Math.sin(wx * freq) * amp - Math.sin(wx * freq * 2.3 + 1) * amp * 0.4);
    }
    ctx.lineTo(W + 10, H); ctx.closePath(); ctx.fill();
  }

  private drawHouse(hs: House) {
    const { ctx, u } = this;
    const x = hs.x - this.cam;
    if (x > this.W + 50 || x + hs.w < -50) return;
    const top = this.groundY - hs.h;

    // chaminé (atrás do telhado)
    const cx = x + hs.cx, cTop = this.chimneyTop(hs);
    ctx.fillStyle = hs.golden ? "#B8860B" : "#7A2E2E";
    ctx.fillRect(cx, cTop, hs.cw, this.groundY - hs.h - cTop + 4 * u);
    // tijolos
    ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1;
    for (let yy = cTop + 8 * u; yy < top; yy += 8 * u) {
      ctx.beginPath(); ctx.moveTo(cx, yy); ctx.lineTo(cx + hs.cw, yy); ctx.stroke();
    }
    // borda da chaminé
    ctx.fillStyle = hs.golden ? "#FFD166" : "#EDEFF5";
    ctx.fillRect(cx - 4 * u, cTop - 6 * u, hs.cw + 8 * u, 7 * u);
    // alvo brilhando
    if (!hs.hit) {
      const pulse = 0.5 + 0.5 * Math.sin(this.t * 6);
      const gr = ctx.createRadialGradient(cx + hs.cw / 2, cTop - 6 * u, 2, cx + hs.cw / 2, cTop - 6 * u, hs.cw * 1.1);
      gr.addColorStop(0, hs.golden ? `rgba(255,209,102,${0.55 + pulse * 0.3})` : `rgba(255,255,255,${0.25 + pulse * 0.2})`);
      gr.addColorStop(1, "rgba(255,209,102,0)");
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.arc(cx + hs.cw / 2, cTop - 6 * u, hs.cw * 1.1, 0, Math.PI * 2); ctx.fill();
      if (hs.golden) {
        ctx.font = `${Math.round(18 * u)}px system-ui`; ctx.textAlign = "center";
        ctx.fillText("⭐", cx + hs.cw / 2, cTop - 14 * u - pulse * 4 * u);
      }
    } else {
      // fumacinha de "entregue"
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      for (let i = 0; i < 3; i++) {
        const k = (this.t * 0.8 + i / 3) % 1;
        ctx.beginPath(); ctx.arc(cx + hs.cw / 2 + k * 14 * u, cTop - 8 * u - k * 34 * u, (4 + k * 8) * u, 0, Math.PI * 2); ctx.fill();
      }
    }

    // corpo
    ctx.fillStyle = hs.body;
    ctx.fillRect(x, top, hs.w, hs.h);
    // janelas
    const ww = 16 * u, wh = 18 * u;
    const slots = [x + hs.w * 0.18, x + hs.w * 0.5 - ww / 2, x + hs.w * 0.82 - ww];
    hs.windows.forEach((on, i) => {
      ctx.fillStyle = on ? (hs.hit ? "#FFE8A3" : "#FFD166") : "#1A2140";
      ctx.fillRect(slots[i], top + hs.h * 0.3, ww, wh);
      if (on) {
        ctx.fillStyle = "rgba(255,209,102,0.18)";
        ctx.fillRect(slots[i] - 4 * u, top + hs.h * 0.3 - 4 * u, ww + 8 * u, wh + 8 * u);
      }
    });
    // porta
    ctx.fillStyle = "#2A1A12";
    ctx.fillRect(x + hs.w * 0.42, this.groundY - 30 * u, hs.w * 0.16, 30 * u);
    // guirlanda na porta
    ctx.strokeStyle = "#2DC653"; ctx.lineWidth = 3 * u;
    ctx.beginPath(); ctx.arc(x + hs.w * 0.5, this.groundY - 22 * u, 5 * u, 0, Math.PI * 2); ctx.stroke();

    // telhado com neve
    ctx.fillStyle = "#EEF4FF";
    ctx.beginPath();
    ctx.moveTo(x - 10 * u, top + 2 * u);
    ctx.lineTo(x + hs.w / 2, top - hs.roofH);
    ctx.lineTo(x + hs.w + 10 * u, top + 2 * u);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#C9D7F0";
    ctx.fillRect(x - 10 * u, top, hs.w + 20 * u, 4 * u);

    // luzinhas na beira do telhado
    for (let i = 0; i < 6; i++) {
      const lx = x + (hs.w / 5) * i;
      const on = Math.sin(this.t * 4 + i + hs.x) > 0;
      ctx.fillStyle = on ? GIFT_COLORS[i % GIFT_COLORS.length] : "rgba(255,255,255,0.15)";
      ctx.beginPath(); ctx.arc(lx, top + 8 * u, 2.6 * u, 0, Math.PI * 2); ctx.fill();
    }
  }

  private drawGift(x: number, y: number, rot: number, color: string) {
    const { ctx, u } = this;
    const s = 16 * u;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(rot) * 0.4);
    ctx.fillStyle = color; ctx.fillRect(-s / 2, -s / 2, s, s);
    ctx.fillStyle = "#FFD166";
    ctx.fillRect(-2 * u, -s / 2, 4 * u, s); ctx.fillRect(-s / 2, -2 * u, s, 4 * u);
    ctx.beginPath(); ctx.arc(-3 * u, -s / 2 - 2 * u, 3 * u, 0, Math.PI * 2); ctx.arc(3 * u, -s / 2 - 2 * u, 3 * u, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  private drawSleigh() {
    const { ctx, u } = this;
    const w = this.santaW, h = w * (576 / 1056);
    const x = this.sleighX - w * 0.3, y = this.sleighY;
    if (this.effects.turbo > 0) {
      const rainbow = ["#EF233C", "#F77F00", "#FFD166", "#2DC653", "#4CC9F0", "#9D4EDD"];
      rainbow.forEach((c, i) => {
        ctx.strokeStyle = c; ctx.globalAlpha = 0.75; ctx.lineWidth = 4 * u;
        ctx.beginPath();
        for (let k = 0; k <= 20; k++) {
          const px = x + w * 0.15 - k * 12 * u;
          const py = y + h * 0.55 + i * 4 * u + Math.sin(this.t * 6 - k * 0.5) * 5 * u;
          if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }
    // rastro de brilho
    for (let i = 0; i < 14; i++) {
      const k = i / 14;
      ctx.globalAlpha = (1 - k) * 0.6;
      ctx.fillStyle = i % 2 ? "#FFD166" : "#FFF1C1";
      ctx.beginPath();
      ctx.arc(x + w * 0.1 - k * 90 * u, y + h * 0.75 + Math.sin(this.t * 8 + i) * 4 * u, (3 - k * 2) * u, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(Math.sin(this.t * 2.2 + 1) * 0.04);
    if (this.santaReady) ctx.drawImage(this.santa, -w / 2, -h / 2, w, h);
    else { ctx.fillStyle = "#D90429"; ctx.fillRect(-w / 4, -h / 6, w / 2, h / 3); }
    const fr = w * 0.062;
    this.passengers.slice(0, SEATS.length).forEach((img, i) => {
      const fx = -w / 2 + SEATS[i].x * w;
      const fy = -h / 2 + SEATS[i].y * h + Math.sin(this.t * 4 + i) * fr * 0.08;
      ctx.fillStyle = "#C1121F";
      ctx.beginPath();
      ctx.ellipse(fx, fy + fr * 1.05, fr * 0.85, fr * 0.6, 0, Math.PI, 0);
      ctx.fill();
      drawFace(ctx, img, fx, fy, fr, undefined, true);
    });
    ctx.restore();
    // mira: linha pontilhada mostrando a queda aproximada
    if (this.running) {
      ctx.setLineDash([3 * u, 6 * u]);
      ctx.strokeStyle = "rgba(255,209,102,0.35)"; ctx.lineWidth = 1.5 * u;
      ctx.beginPath();
      const sx = this.sleighX + w * 0.2 - this.cam + this.cam, sy = this.sleighY + w * 0.28;
      ctx.moveTo(sx, sy);
      let px = 0, py = 0, vx = -this.speed * 0.1, vy = 40 * u;
      for (let i = 0; i < 18; i++) {
        const dt = 0.05; vy += 900 * u * dt; vx += this.wind * dt; px += vx * dt; py += vy * dt;
        if (sy + py > this.groundY) break;
        ctx.lineTo(sx + px, sy + py);
      }
      ctx.stroke(); ctx.setLineDash([]);
    }
  }

  private drawHud() {
    const { ctx, W, u } = this;
    const pad = 12 * u;
    ctx.font = `800 ${Math.round(22 * u)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.textAlign = "left"; ctx.fillStyle = "#FFD166";
    ctx.fillText(`🎁 ${this.res.score}`, pad, pad + 20 * u);
    ctx.textAlign = "right";
    ctx.fillStyle = this.timeLeft < 10 ? "#FF6B6B" : "#FFFFFF";
    ctx.fillText(`⏱ ${Math.ceil(this.timeLeft)}s`, W - pad, pad + 20 * u);
    // combo
    if (this.streak >= 2) {
      const mult = Math.min(5, 1 + Math.floor(this.streak / 3));
      ctx.textAlign = "left"; ctx.fillStyle = "#4CC9F0";
      ctx.font = `800 ${Math.round(15 * u)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.fillText(`🔥 ${this.streak} seguidas  x${mult}`, pad, pad + 44 * u);
    }
    // power-ups ativos
    const act = (["triplo", "ima", "turbo"] as const).filter((k) => this.effects[k] > 0);
    act.forEach((k, i) => {
      const info = POWER_INFO[k];
      const x = pad + i * 70 * u, y = pad + 60 * u;
      ctx.fillStyle = "rgba(6,11,25,0.6)";
      ctx.beginPath(); ctx.roundRect(x, y, 62 * u, 24 * u, 12 * u); ctx.fill();
      ctx.fillStyle = info.color;
      ctx.beginPath(); ctx.roundRect(x, y + 20 * u, (62 * u * this.effects[k]) / 8, 4 * u, 2 * u); ctx.fill();
      ctx.textAlign = "left"; ctx.fillStyle = "#FFFFFF";
      ctx.font = `700 ${Math.round(13 * u)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.fillText(`${info.emoji} ${Math.ceil(this.effects[k])}s`, x + 8 * u, y + 16 * u);
    });
    if (this.easy) {
      ctx.textAlign = "right"; ctx.fillStyle = "#2DC653";
      ctx.font = `800 ${Math.round(12 * u)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.fillText("modo fácil", W - pad, pad + 60 * u);
    }
    // vento
    const wv = this.wind / (120 * u);
    ctx.textAlign = "right"; ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = `700 ${Math.round(13 * u)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    const arrows = Math.abs(wv) < 0.12 ? "calmo" : (wv > 0 ? "➜".repeat(1 + Math.round(Math.abs(wv) * 2)) : "⬅".repeat(1 + Math.round(Math.abs(wv) * 2)));
    ctx.fillText(`vento ${arrows}`, W - pad, pad + 42 * u);
  }
}
