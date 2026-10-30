/**
 * "Circo de Natal — Duende Bala de Canhão".
 * A barra de força sobe e desce sozinha; a criança toca na hora certa e o duende Pipoca
 * voa pelo picadeiro, passa pela argola de bengala doce, pega estrelas e tenta cair
 * na almofada-alvo. 8 disparos por partida.
 */

export type CircusResult = { score: number; hits: number; perfect: number; stars: number; rings: number; shots: number };
type Sound = "boom" | "star" | "ring" | "hit" | "perfect" | "miss" | "tick";
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number; kind: "dot" | "conf" | "spark" };
type Star = { x: number; y: number; taken: boolean; t: number };

const VH = 500;
const GROUND = 440;
const CUSHION_TOP = 414;
const G = 900;
const ANGLE = (54 * Math.PI) / 180;
const BARREL = 66;
export const SHOTS = 8;

export class CircusGame {
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;
  private W = 800;
  private H = 500;
  private VW = 800;
  private scale = 1;
  private ox = 0;
  private oy = 0;
  private raf = 0;
  private last = 0;
  running = false;
  easy = false;

  private t = 0;
  private state: "aim" | "fly" | "land" | "done" = "aim";
  private power = 0;
  private powerT = 0;
  private vmin = 380;
  private vmax = 820;
  private shot = 0;
  private score = 0;
  private hits = 0;
  private perfect = 0;
  private starsTaken = 0;
  private rings = 0;
  private elf = { x: 0, y: 0, vx: 0, vy: 0, rot: 0, ringed: false };
  private trail: { x: number; y: number }[] = [];
  private target = { base: 600, x: 600, w: 92, moving: false, phase: 0 };
  private ring = { x: 400, y: 200, r: 34, hitFx: 0 };
  private stars: Star[] = [];
  private parts: Particle[] = [];
  private announce: { text: string; sub?: string; t: number; color: string } | null = null;
  private landT = 0;
  private recoil = 0;
  private flash = 0;
  private crowd: { x: number; y: number; c: string; hat: boolean; p: number }[] = [];

  onEnd?: (r: CircusResult) => void;
  onSound?: (k: Sound) => void;
  onHud?: (h: { score: number; shot: number }) => void;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    this.resize();
    this.setupShot(true);
    this.draw();
  }

  // ------------------------------------------------------------ layout
  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = Math.max(280, r.width);
    this.H = Math.max(220, r.height);
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
    const aspect = this.W / this.H;
    this.VW = Math.min(1000, Math.max(520, aspect * VH));
    this.scale = Math.min(this.W / this.VW, this.H / VH);
    this.ox = (this.W - this.VW * this.scale) / 2;
    this.oy = (this.H - VH * this.scale) / 2;
    // a força mínima e máxima são calculadas para o tamanho do picadeiro
    this.vmin = this.solveV(this.VW * 0.3);
    this.vmax = this.solveV(this.VW * 0.97);
    this.crowd = [];
    const cols = ["#5B3A8C", "#3A4E8C", "#8C3A5B", "#2F6B5A", "#7A5A2F", "#4A3A6C"];
    for (let row = 0; row < 3; row++) {
      for (let x = -10 + row * 14; x < this.VW + 20; x += 30 + Math.random() * 6) {
        this.crowd.push({ x, y: 336 + row * 26, c: cols[Math.floor(Math.random() * cols.length)], hat: Math.random() < 0.25, p: Math.random() * 6 });
      }
    }
    if (!this.running) {
      this.setupShot(this.state !== "fly");
      this.draw();
    }
  }

  private get pivot() {
    return { x: this.VW * 0.1 + 20, y: 404 };
  }
  private get muzzle() {
    const p = this.pivot;
    return { x: p.x + Math.cos(ANGLE) * BARREL, y: p.y - Math.sin(ANGLE) * BARREL };
  }

  /** onde o duende cai (altura da almofada) para uma velocidade v */
  private landX(v: number) {
    const m = this.muzzle;
    const vx = v * Math.cos(ANGLE);
    const vy = -v * Math.sin(ANGLE);
    // y(t) = m.y + vy t + G t²/2 = CUSHION_TOP
    const a = G / 2, b = vy, c = m.y - CUSHION_TOP;
    const tt = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
    return m.x + vx * tt;
  }
  private solveV(x: number) {
    let lo = 50, hi = 3000;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (this.landX(mid) < x) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }
  private velFor(power: number) {
    return this.vmin + (this.vmax - this.vmin) * power;
  }
  private pointAt(v: number, tt: number) {
    const m = this.muzzle;
    return { x: m.x + v * Math.cos(ANGLE) * tt, y: m.y - v * Math.sin(ANGLE) * tt + (G * tt * tt) / 2 };
  }

  // ------------------------------------------------------------ partida
  private setupShot(first = false) {
    const VW = this.VW;
    const n = first ? 0 : this.shot;
    // alvos cada vez mais longe e, no modo normal, se mexendo a partir do 4º disparo
    const spots = [0.62, 0.78, 0.5, 0.86, 0.68, 0.56, 0.9, 0.74];
    const jitter = (Math.random() - 0.5) * 0.06;
    this.target.base = VW * Math.min(0.9, Math.max(0.46, spots[n % spots.length] + jitter));
    this.target.x = this.target.base;
    this.target.w = this.easy ? 128 : 92;
    this.target.moving = !this.easy && n >= 3;
    this.target.phase = Math.random() * 6;
    // argola e estrelas ficam no caminho "certo" para o alvo
    const v = this.solveV(this.target.base);
    const m = this.muzzle;
    const flight = ((-(-v * Math.sin(ANGLE)) + Math.sqrt((v * Math.sin(ANGLE)) ** 2 + 2 * G * (CUSHION_TOP - m.y))) / G);
    const ringP = this.pointAt(v, flight * (0.42 + Math.random() * 0.12));
    this.ring.x = ringP.x;
    this.ring.y = ringP.y + (Math.random() - 0.5) * 16;
    this.ring.r = this.easy ? 42 : 34;
    this.stars = [0.22, 0.7].map((f, i) => {
      const p = this.pointAt(v * (1 + (i ? 0.03 : -0.03)), flight * f);
      return { x: p.x, y: p.y - 6, taken: false, t: Math.random() * 6 };
    });
    this.state = "aim";
    this.trail = [];
  }

  start() {
    this.shot = 0;
    this.score = 0;
    this.hits = 0;
    this.perfect = 0;
    this.starsTaken = 0;
    this.rings = 0;
    this.parts = [];
    this.powerT = 0;
    this.resize();
    this.setupShot(true);
    this.say(this.easy ? "Toque na hora certa!" : "Respeitável público!", this.easy ? "a linha mostra o caminho" : "o show vai começar", "#FFD166");
    this.running = true;
    this.last = performance.now();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.loop);
    this.hud();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  fire() {
    if (!this.running || this.state !== "aim") return;
    const v = this.velFor(this.power);
    const m = this.muzzle;
    this.elf = { x: m.x, y: m.y, vx: v * Math.cos(ANGLE), vy: -v * Math.sin(ANGLE), rot: -ANGLE, ringed: false };
    this.state = "fly";
    this.recoil = 1;
    this.flash = 1;
    this.trail = [];
    for (let i = 0; i < 26; i++) {
      const a = -ANGLE + (Math.random() - 0.5) * 1.2;
      const s = 80 + Math.random() * 220;
      this.parts.push({ x: m.x, y: m.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.7, max: 0.7, color: ["#FFD166", "#F4A261", "#FFFFFF", "#EF233C"][i % 4], size: 2 + Math.random() * 3, kind: "spark" });
    }
    this.onSound?.("boom");
  }

  private hud() {
    this.onHud?.({ score: this.score, shot: Math.min(SHOTS, this.shot + 1) });
  }

  private say(text: string, sub: string | undefined, color: string) {
    this.announce = { text, sub, t: 1.5, color };
  }

  private burst(x: number, y: number, n: number, kind: Particle["kind"], colors: string[], speed = 260) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.3 + Math.random() * 0.7);
      this.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - speed * 0.5, life: 1.2, max: 1.2, color: colors[i % colors.length], size: 3 + Math.random() * 4, kind });
    }
  }

  private loop = (now: number) => {
    const dt = Math.min(0.033, (now - this.last) / 1000);
    this.last = now;
    this.update(dt);
    this.draw();
    if (this.running) this.raf = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    this.t += dt;
    this.recoil = Math.max(0, this.recoil - dt * 3);
    this.flash = Math.max(0, this.flash - dt * 4);
    this.ring.hitFx = Math.max(0, this.ring.hitFx - dt * 2);
    if (this.announce) {
      this.announce.t -= dt;
      if (this.announce.t <= 0) this.announce = null;
    }
    if (this.target.moving && this.state !== "land") {
      this.target.x = this.target.base + Math.sin(this.t * 1.3 + this.target.phase) * Math.min(60, this.VW * 0.06);
    }

    if (this.state === "aim") {
      const prev = this.power;
      this.powerT += dt * (this.easy ? 1.7 : 2.5);
      this.power = (1 - Math.cos(this.powerT)) / 2;
      if (Math.floor(prev * 5) !== Math.floor(this.power * 5)) this.onSound?.("tick");
    }

    if (this.state === "fly") {
      const e = this.elf;
      const px = e.x, py = e.y;
      e.vy += G * dt;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.rot += dt * 7;
      this.trail.push({ x: e.x, y: e.y });
      if (this.trail.length > 18) this.trail.shift();
      if (Math.random() < 0.6) this.parts.push({ x: e.x, y: e.y, vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40, life: 0.5, max: 0.5, color: "#FFE9A8", size: 2, kind: "spark" });
      // argola: atravessou a linha vertical da argola dentro do raio
      if (!e.ringed && px < this.ring.x && e.x >= this.ring.x) {
        const yAt = py + ((this.ring.x - px) / (e.x - px)) * (e.y - py);
        if (Math.abs(yAt - this.ring.y) < this.ring.r * 0.85) {
          e.ringed = true;
          this.rings++;
          this.score += 50;
          this.ring.hitFx = 1;
          this.burst(this.ring.x, this.ring.y, 18, "conf", ["#EF233C", "#FFFFFF", "#FFD166"], 200);
          this.say("Argola! +50", undefined, "#FF8FA3");
          this.onSound?.("ring");
          this.hud();
        }
      }
      for (const s of this.stars) {
        if (!s.taken && Math.hypot(s.x - e.x, s.y - e.y) < 30) {
          s.taken = true;
          this.starsTaken++;
          this.score += 20;
          this.burst(s.x, s.y, 10, "spark", ["#FFD166", "#FFFFFF"], 160);
          this.onSound?.("star");
          this.hud();
        }
      }
      // pousou?
      const half = this.target.w / 2;
      if (e.vy > 0 && py < CUSHION_TOP && e.y >= CUSHION_TOP && Math.abs(e.x - this.target.x) <= half) {
        e.y = CUSHION_TOP;
        this.land(true);
      } else if (e.y >= GROUND - 6 || e.x > this.VW + 60) {
        e.y = Math.min(e.y, GROUND - 6);
        this.land(false);
      }
    }

    if (this.state === "land") {
      this.landT -= dt;
      const e = this.elf;
      e.rot *= 0.85;
      if (this.landT <= 0) {
        this.shot++;
        if (this.shot >= SHOTS) {
          this.state = "done";
          this.running = false;
          this.onEnd?.({ score: this.score, hits: this.hits, perfect: this.perfect, stars: this.starsTaken, rings: this.rings, shots: SHOTS });
          return;
        }
        this.setupShot();
        this.powerT = 0;
        this.hud();
        if (this.shot === SHOTS - 1) this.say("Último disparo!", undefined, "#FFD166");
        else if (this.target.moving && this.shot === 3) this.say("O alvo começou a dançar!", undefined, "#4CC9F0");
      }
    }

    for (const p of this.parts) {
      p.life -= dt;
      p.vy += (p.kind === "conf" ? 260 : 120) * dt;
      p.vx *= 0.99;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    this.parts = this.parts.filter((p) => p.life > 0);
  }

  private land(hit: boolean) {
    this.state = "land";
    this.landT = 1.25;
    const e = this.elf;
    if (hit) {
      const d = Math.abs(e.x - this.target.x);
      const half = this.target.w / 2;
      let pts = 40;
      if (d < (this.easy ? 18 : 12)) pts = 100;
      else if (d < half * 0.55) pts = 70;
      this.hits++;
      if (pts === 100) this.perfect++;
      this.score += pts;
      this.burst(e.x, CUSHION_TOP - 10, pts === 100 ? 46 : 28, "conf", ["#EF233C", "#2DC653", "#FFD166", "#4CC9F0", "#FFFFFF"], 320);
      this.say(pts === 100 ? "PERFEITO!" : pts === 70 ? "Muito bem!" : "No alvo!", `+${pts}`, pts === 100 ? "#FFD166" : "#2DC653");
      this.onSound?.(pts === 100 ? "perfect" : "hit");
    } else {
      this.burst(e.x, GROUND - 4, 16, "dot", ["#D9A066", "#C98B4A", "#F1C27D"], 140);
      const short = e.x < this.target.x;
      this.say(short ? "Quase! Mais força" : "Uau, voou longe!", short ? "segure um pouquinho mais" : "toque um pouco antes", "#FFFFFF");
      this.onSound?.("miss");
    }
    this.hud();
  }

  // ------------------------------------------------------------ desenho
  draw() {
    const c = this.ctx;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.drawTent();
    c.save();
    c.translate(this.ox, this.oy);
    c.scale(this.scale, this.scale);
    this.drawCrowd();
    this.drawFloor();
    this.drawTarget();
    if (this.state === "aim" && this.easy) this.drawPreview();
    this.drawRing(false);
    this.drawStars();
    this.drawTrail();
    if (this.state === "fly" || this.state === "land") this.drawElf(this.elf.x, this.elf.y - (this.state === "land" ? 18 : 0), this.state === "fly" ? this.elf.rot : 0, 1, true);
    this.drawRing(true);
    this.drawCannon();
    this.drawParts();
    this.drawSpots();
    c.restore();
    this.drawAnnounce();
  }

  private drawTent() {
    const c = this.ctx;
    const W = this.W, H = this.H;
    c.fillStyle = "#3A0712";
    c.fillRect(0, 0, W, H);
    // listras da lona saindo do topo
    const cx = W / 2, cy = -H * 0.25;
    const n = 18;
    for (let i = 0; i < n; i++) {
      const a0 = Math.PI * 0.05 + (i / n) * Math.PI * 0.9;
      const a1 = Math.PI * 0.05 + ((i + 1) / n) * Math.PI * 0.9;
      c.beginPath();
      c.moveTo(cx, cy);
      c.lineTo(cx + Math.cos(a0) * W * 2, cy + Math.sin(a0) * W * 2);
      c.lineTo(cx + Math.cos(a1) * W * 2, cy + Math.sin(a1) * W * 2);
      c.closePath();
      c.fillStyle = i % 2 ? "#9B021A" : "#F3E3C3";
      c.fill();
    }
    const shade = c.createLinearGradient(0, 0, 0, H);
    shade.addColorStop(0, "rgba(20,0,10,0.35)");
    shade.addColorStop(0.55, "rgba(20,0,10,0.55)");
    shade.addColorStop(1, "rgba(10,0,8,0.85)");
    c.fillStyle = shade;
    c.fillRect(0, 0, W, H);
    // varal de lâmpadas
    const bulbs = Math.max(10, Math.round(W / 34));
    for (let k = 0; k < 2; k++) {
      const y0 = H * (0.06 + k * 0.08);
      c.strokeStyle = "rgba(255,233,168,0.35)";
      c.lineWidth = 1.5;
      c.beginPath();
      for (let i = 0; i <= 40; i++) {
        const x = (i / 40) * W;
        const y = y0 + Math.sin((i / 40) * Math.PI * 3) * H * 0.025;
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.stroke();
      for (let i = 0; i < bulbs; i++) {
        const f = (i + 0.5) / bulbs;
        const x = f * W;
        const y = y0 + Math.sin(f * Math.PI * 3) * H * 0.025 + 4;
        const on = Math.sin(this.t * 4 + i * 1.7 + k) > -0.3;
        const col = ["#FFD166", "#EF233C", "#2DC653", "#4CC9F0"][(i + k) % 4];
        if (on) {
          c.fillStyle = col + "55";
          c.beginPath();
          c.arc(x, y, 7, 0, Math.PI * 2);
          c.fill();
        }
        c.fillStyle = on ? col : "#4a3a3a";
        c.beginPath();
        c.arc(x, y, 3, 0, Math.PI * 2);
        c.fill();
      }
    }
  }

  private drawCrowd() {
    const c = this.ctx;
    c.fillStyle = "#1B0710";
    c.fillRect(-this.ox / this.scale - 10, 322, this.W / this.scale + 40, 130);
    for (const p of this.crowd) {
      const bob = Math.sin(this.t * 3 + p.p) * (this.state === "land" && this.landT > 0.6 ? 4 : 1.2);
      c.fillStyle = p.c;
      c.beginPath();
      c.ellipse(p.x, p.y + 18 + bob, 14, 12, 0, Math.PI, 0);
      c.fill();
      c.fillStyle = "#2A1420";
      c.beginPath();
      c.arc(p.x, p.y + bob, 8, 0, Math.PI * 2);
      c.fill();
      if (p.hat) {
        c.fillStyle = "#D90429";
        c.beginPath();
        c.moveTo(p.x - 8, p.y - 4 + bob);
        c.lineTo(p.x + 8, p.y - 4 + bob);
        c.lineTo(p.x + 10, p.y - 15 + bob);
        c.closePath();
        c.fill();
        c.fillStyle = "#fff";
        c.beginPath();
        c.arc(p.x + 10, p.y - 15 + bob, 2.5, 0, Math.PI * 2);
        c.fill();
      }
    }
  }

  private drawFloor() {
    const c = this.ctx;
    const VW = this.VW;
    const left = -this.ox / this.scale - 10;
    const width = this.W / this.scale + 40;
    // borda do picadeiro
    c.fillStyle = "#B5001F";
    c.fillRect(left, GROUND - 22, width, 22);
    c.fillStyle = "#FFD166";
    for (let x = 10; x < VW; x += 46) {
      this.starShape(x, GROUND - 11, 6, 2.6);
      c.fill();
    }
    // serragem
    const g = c.createLinearGradient(0, GROUND, 0, VH + 200);
    g.addColorStop(0, "#C98B4A");
    g.addColorStop(1, "#7A4A22");
    c.fillStyle = g;
    c.fillRect(left, GROUND, width, VH - GROUND + 200);
    c.fillStyle = "rgba(255,230,180,0.18)";
    for (let i = 0; i < 40; i++) {
      const x = (i * 97) % VW;
      const y = GROUND + 8 + ((i * 37) % 50);
      c.fillRect(x, y, 3, 1.5);
    }
  }

  private drawTarget() {
    const c = this.ctx;
    const x = this.target.x;
    const w = this.target.w;
    const squash = this.state === "land" && this.landT > 0.9 && Math.abs(this.elf.x - x) <= w / 2 ? 6 : 0;
    // suporte
    c.fillStyle = "#3A2A1A";
    c.fillRect(x - w / 2 + 6, CUSHION_TOP + 6, 8, GROUND - CUSHION_TOP - 6);
    c.fillRect(x + w / 2 - 14, CUSHION_TOP + 6, 8, GROUND - CUSHION_TOP - 6);
    // almofada com anéis do alvo
    const rings = ["#B5001F", "#FFFFFF", "#B5001F", "#FFD166"];
    rings.forEach((col, i) => {
      const f = 1 - i * 0.24;
      c.fillStyle = col;
      c.beginPath();
      c.ellipse(x, CUSHION_TOP + 4 + squash / 2, (w / 2) * f, (11 - squash / 3) * f + 2, 0, 0, Math.PI * 2);
      c.fill();
    });
    c.strokeStyle = "rgba(0,0,0,0.25)";
    c.lineWidth = 1;
    c.beginPath();
    c.ellipse(x, CUSHION_TOP + 4 + squash / 2, w / 2, 13 - squash / 3, 0, 0, Math.PI * 2);
    c.stroke();
    // bandeirinha
    c.strokeStyle = "#FFE9A8";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x + w / 2 + 6, GROUND - 4);
    c.lineTo(x + w / 2 + 6, CUSHION_TOP - 34);
    c.stroke();
    c.fillStyle = "#2DC653";
    c.beginPath();
    const wave = Math.sin(this.t * 6) * 3;
    c.moveTo(x + w / 2 + 6, CUSHION_TOP - 34);
    c.lineTo(x + w / 2 + 28, CUSHION_TOP - 28 + wave);
    c.lineTo(x + w / 2 + 6, CUSHION_TOP - 22);
    c.closePath();
    c.fill();
  }

  private drawPreview() {
    const c = this.ctx;
    const v = this.velFor(this.power);
    c.fillStyle = "rgba(255,255,255,0.75)";
    for (let i = 1; i < 60; i++) {
      const p = this.pointAt(v, i * 0.045);
      if (p.y > CUSHION_TOP) break;
      c.globalAlpha = Math.max(0.15, 1 - i / 45);
      c.beginPath();
      c.arc(p.x, p.y, 3, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
  }

  /** argola de bengala doce: metade de trás antes do duende, metade da frente depois */
  private drawRing(front: boolean) {
    const c = this.ctx;
    const { x, y, r, hitFx } = this.ring;
    const rx = r * 0.38;
    const glow = hitFx > 0 ? 1 + hitFx * 0.25 : 1;
    c.save();
    c.translate(x, y);
    c.scale(glow, glow);
    c.lineWidth = 9;
    const segs = 14;
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * Math.PI * 2;
      const a1 = ((i + 1) / segs) * Math.PI * 2;
      const mid = (a0 + a1) / 2;
      const isFront = Math.cos(mid) > 0;
      if (isFront !== front) continue;
      c.strokeStyle = i % 2 ? "#FFFFFF" : "#E01E37";
      c.beginPath();
      c.ellipse(0, 0, rx, r, 0, a0, a1 + 0.02);
      c.stroke();
    }
    if (front && hitFx > 0) {
      c.strokeStyle = `rgba(255,209,102,${hitFx})`;
      c.lineWidth = 3;
      c.beginPath();
      c.ellipse(0, 0, rx + 8, r + 8, 0, 0, Math.PI * 2);
      c.stroke();
    }
    c.restore();
    if (!front) {
      // brilhinho de "passe por aqui"
      c.fillStyle = "rgba(255,233,168,0.12)";
      c.beginPath();
      c.ellipse(x, y, r * 0.3, r * 0.9, 0, 0, Math.PI * 2);
      c.fill();
    }
  }

  private drawStars() {
    const c = this.ctx;
    for (const s of this.stars) {
      if (s.taken) continue;
      const b = Math.sin(this.t * 3 + s.t) * 4;
      c.save();
      c.translate(s.x, s.y + b);
      c.rotate(Math.sin(this.t * 2 + s.t) * 0.2);
      c.fillStyle = "rgba(255,209,102,0.25)";
      c.beginPath();
      c.arc(0, 0, 18, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#FFD166";
      this.starShape(0, 0, 12, 5.2);
      c.fill();
      c.strokeStyle = "#B8860B";
      c.lineWidth = 1.5;
      c.stroke();
      c.restore();
    }
  }

  private drawTrail() {
    const c = this.ctx;
    if (this.state !== "fly") return;
    this.trail.forEach((p, i) => {
      c.fillStyle = `rgba(255,233,168,${(i / this.trail.length) * 0.5})`;
      c.beginPath();
      c.arc(p.x, p.y, 2 + (i / this.trail.length) * 5, 0, Math.PI * 2);
      c.fill();
    });
  }

  private drawCannon() {
    const c = this.ctx;
    const p = this.pivot;
    const back = this.recoil * 12;
    // base com rodas
    c.fillStyle = "#1C3D6E";
    c.beginPath();
    c.moveTo(p.x - 40, GROUND - 2);
    c.lineTo(p.x + 34, GROUND - 2);
    c.lineTo(p.x + 18, p.y - 6);
    c.lineTo(p.x - 26, p.y - 6);
    c.closePath();
    c.fill();
    c.fillStyle = "#FFD166";
    this.starShape(p.x - 4, p.y + 14, 9, 4);
    c.fill();
    // cano
    c.save();
    c.translate(p.x - Math.cos(ANGLE) * back, p.y + Math.sin(ANGLE) * back);
    c.rotate(-ANGLE);
    const g = c.createLinearGradient(0, -18, 0, 18);
    g.addColorStop(0, "#E01E37");
    g.addColorStop(0.5, "#FF5A6E");
    g.addColorStop(1, "#8A0016");
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(-14, -18);
    c.lineTo(BARREL, -22);
    c.lineTo(BARREL, 22);
    c.lineTo(-14, 18);
    c.closePath();
    c.fill();
    c.fillStyle = "#FFD166";
    c.fillRect(BARREL - 10, -24, 10, 48);
    c.fillRect(18, -20, 6, 40);
    c.fillStyle = "#FFFFFF";
    [6, 34, 48].forEach((x) => {
      c.beginPath();
      c.arc(x, 0, 3, 0, Math.PI * 2);
      c.fill();
    });
    // duende espiando de dentro do cano antes do disparo
    if (this.state === "aim") {
      c.save();
      c.translate(BARREL + 2, 0);
      c.rotate(ANGLE);
      this.drawElf(0, -6, 0, 0.8, false);
      c.restore();
    }
    c.restore();
    // roda
    c.fillStyle = "#5A3418";
    c.beginPath();
    c.arc(p.x - 6, GROUND - 14, 15, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#FFD166";
    c.lineWidth = 3;
    c.stroke();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + this.recoil;
      c.beginPath();
      c.moveTo(p.x - 6, GROUND - 14);
      c.lineTo(p.x - 6 + Math.cos(a) * 13, GROUND - 14 + Math.sin(a) * 13);
      c.stroke();
    }
    if (this.flash > 0) {
      const m = this.muzzle;
      const r = c.createRadialGradient(m.x, m.y, 0, m.x, m.y, 60 * this.flash + 10);
      r.addColorStop(0, `rgba(255,240,200,${this.flash})`);
      r.addColorStop(1, "rgba(255,180,80,0)");
      c.fillStyle = r;
      c.beginPath();
      c.arc(m.x, m.y, 70, 0, Math.PI * 2);
      c.fill();
    }
    // barra de força
    if (this.state === "aim") this.drawPowerBar();
  }

  private drawPowerBar() {
    const c = this.ctx;
    const p = this.pivot;
    const x = Math.max(14, p.x - 74);
    const y = 230;
    const h = 150;
    const w = 20;
    c.fillStyle = "rgba(0,0,0,0.45)";
    this.roundRect(x - 4, y - 4, w + 8, h + 8, 12);
    c.fill();
    const g = c.createLinearGradient(0, y + h, 0, y);
    g.addColorStop(0, "#2DC653");
    g.addColorStop(0.55, "#FFD166");
    g.addColorStop(1, "#EF233C");
    c.fillStyle = "rgba(255,255,255,0.12)";
    this.roundRect(x, y, w, h, 9);
    c.fill();
    c.save();
    this.roundRect(x, y, w, h, 9);
    c.clip();
    c.fillStyle = g;
    c.fillRect(x, y + h * (1 - this.power), w, h * this.power);
    c.restore();
    // marcador
    const my = y + h * (1 - this.power);
    c.fillStyle = "#FFFFFF";
    c.beginPath();
    c.moveTo(x + w + 4, my);
    c.lineTo(x + w + 14, my - 7);
    c.lineTo(x + w + 14, my + 7);
    c.closePath();
    c.fill();
    c.fillStyle = "#FFE9A8";
    c.font = "bold 11px system-ui, sans-serif";
    c.textAlign = "center";
    c.fillText("FORÇA", x + w / 2, y - 10);
  }

  /** duende Pipoca: chapéu verde com pompom, orelhas pontudas, bochechas rosadas */
  private drawElf(x: number, y: number, rot: number, s: number, flying: boolean) {
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.scale(s, s);
    if (flying) {
      // bracinhos e perninhas abertos
      c.strokeStyle = "#2DC653";
      c.lineWidth = 5;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(-8, 4);
      c.lineTo(-20, -6);
      c.moveTo(8, 4);
      c.lineTo(20, -6);
      c.stroke();
      c.strokeStyle = "#B5001F";
      c.beginPath();
      c.moveTo(-5, 16);
      c.lineTo(-12, 26);
      c.moveTo(5, 16);
      c.lineTo(12, 26);
      c.stroke();
      c.fillStyle = "#5A3418";
      c.beginPath();
      c.arc(-13, 27, 3.5, 0, Math.PI * 2);
      c.arc(13, 27, 3.5, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#F7C9A0";
      c.beginPath();
      c.arc(-21, -7, 3.5, 0, Math.PI * 2);
      c.arc(21, -7, 3.5, 0, Math.PI * 2);
      c.fill();
    }
    // corpo
    c.fillStyle = "#2DC653";
    c.beginPath();
    c.ellipse(0, 8, 11, 12, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#1a7a34";
    c.fillRect(-11, 8, 22, 4);
    c.fillStyle = "#FFD166";
    c.fillRect(-3, 7.5, 6, 5);
    // gola
    c.fillStyle = "#E01E37";
    for (let i = -2; i <= 2; i++) {
      c.beginPath();
      c.moveTo(i * 4.5 - 3, -3);
      c.lineTo(i * 4.5 + 3, -3);
      c.lineTo(i * 4.5, 3);
      c.closePath();
      c.fill();
    }
    // cabeça
    c.fillStyle = "#F7C9A0";
    c.beginPath();
    c.moveTo(-10, -12);
    c.lineTo(-17, -18);
    c.lineTo(-9, -8);
    c.closePath();
    c.moveTo(10, -12);
    c.lineTo(17, -18);
    c.lineTo(9, -8);
    c.closePath();
    c.fill();
    c.beginPath();
    c.arc(0, -11, 10, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#FF8FA3";
    c.beginPath();
    c.arc(-5.5, -8, 2.2, 0, Math.PI * 2);
    c.arc(5.5, -8, 2.2, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#1C2541";
    c.beginPath();
    c.arc(-3.5, -12, 1.6, 0, Math.PI * 2);
    c.arc(3.5, -12, 1.6, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#9B021A";
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(0, -8, flying ? 3.5 : 2.6, 0.15 * Math.PI, 0.85 * Math.PI);
    c.stroke();
    // chapéu
    c.fillStyle = "#1a9e3e";
    c.beginPath();
    c.moveTo(-11, -16);
    c.quadraticCurveTo(-2, -40, 14, -36);
    c.lineTo(11, -16);
    c.closePath();
    c.fill();
    c.fillStyle = "#FFFFFF";
    c.fillRect(-12, -19, 24, 5);
    c.fillStyle = "#E01E37";
    c.beginPath();
    c.arc(15, -36, 4, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  private drawParts() {
    const c = this.ctx;
    for (const p of this.parts) {
      const a = Math.max(0, p.life / p.max);
      c.globalAlpha = a;
      c.fillStyle = p.color;
      if (p.kind === "conf") {
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.life * 10);
        c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        c.restore();
      } else {
        c.beginPath();
        c.arc(p.x, p.y, p.size * (p.kind === "spark" ? a : 1), 0, Math.PI * 2);
        c.fill();
      }
    }
    c.globalAlpha = 1;
  }

  private drawSpots() {
    const c = this.ctx;
    c.save();
    c.globalCompositeOperation = "lighter";
    const spots: { x: number; y: number }[] = [
      { x: this.VW * 0.5 + Math.sin(this.t * 0.7) * this.VW * 0.3, y: GROUND - 10 },
      { x: this.state === "fly" ? this.elf.x : this.target.x, y: this.state === "fly" ? this.elf.y : CUSHION_TOP },
    ];
    const sources = [-40, this.VW + 40];
    spots.forEach((s, i) => {
      const sx = sources[i];
      const sy = -20;
      const g = c.createLinearGradient(sx, sy, s.x, s.y);
      g.addColorStop(0, "rgba(255,240,200,0.0)");
      g.addColorStop(1, i ? "rgba(255,240,200,0.16)" : "rgba(180,220,255,0.09)");
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(sx - 6, sy);
      c.lineTo(s.x - 60, s.y + 10);
      c.lineTo(s.x + 60, s.y + 10);
      c.lineTo(sx + 6, sy);
      c.closePath();
      c.fill();
      const r = c.createRadialGradient(s.x, s.y + 10, 0, s.x, s.y + 10, 70);
      r.addColorStop(0, i ? "rgba(255,240,200,0.18)" : "rgba(180,220,255,0.1)");
      r.addColorStop(1, "rgba(255,240,200,0)");
      c.fillStyle = r;
      c.beginPath();
      c.ellipse(s.x, s.y + 10, 70, 22, 0, 0, Math.PI * 2);
      c.fill();
    });
    c.restore();
  }

  private drawAnnounce() {
    const c = this.ctx;
    const a = this.announce;
    if (!a) {
      if (this.running && this.state === "aim") {
        const pulse = 0.6 + Math.sin(this.t * 5) * 0.4;
        c.globalAlpha = pulse;
        c.fillStyle = "#FFE9A8";
        c.font = `800 ${Math.round(Math.max(14, Math.min(22, this.W / 26)))}px system-ui, sans-serif`;
        c.textAlign = "center";
        c.fillText("👆 TOQUE PARA DISPARAR!", this.W / 2, this.oy + 96 * this.scale + 20);
        c.globalAlpha = 1;
      }
      return;
    }
    const life = Math.min(1, a.t / 0.4);
    const pop = a.t > 1.3 ? 1 + (a.t - 1.3) * 2 : 1;
    const size = Math.round(Math.max(26, Math.min(56, this.W / 13)) * pop);
    c.save();
    c.globalAlpha = life;
    c.textAlign = "center";
    c.font = `900 ${size}px system-ui, sans-serif`;
    c.lineWidth = 6;
    c.strokeStyle = "rgba(40,0,10,0.75)";
    const y = this.oy + 150 * this.scale + size * 0.4;
    c.strokeText(a.text, this.W / 2, y);
    c.fillStyle = a.color;
    c.fillText(a.text, this.W / 2, y);
    if (a.sub) {
      c.font = `700 ${Math.round(size * 0.45)}px system-ui, sans-serif`;
      c.lineWidth = 4;
      c.strokeText(a.sub, this.W / 2, y + size * 0.75);
      c.fillStyle = "#FFFFFF";
      c.fillText(a.sub, this.W / 2, y + size * 0.75);
    }
    c.restore();
  }

  private starShape(x: number, y: number, R: number, r: number) {
    const c = this.ctx;
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r : R;
      c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    c.closePath();
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number) {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
}
