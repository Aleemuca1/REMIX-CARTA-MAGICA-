/**
 * "Escorrega do Ursinho Polar": o ursinho Polo desliza de barriga pelo gelo do Polo Norte,
 * pula obstáculos e pega peixinhos, presentes e estrelas.
 * Toque/clique/espaço = pular (dá para pular duas vezes no ar).
 */

export type PolarResult = { score: number; fish: number; gifts: number; meters: number };
type ItemKind = "peixe" | "presente" | "estrela" | "coracao";
type ObstKind = "bloco" | "boneco" | "pinguim" | "pedra";

type Item = { x: number; y: number; kind: ItemKind; taken: boolean; t: number };
type Obst = { x: number; w: number; h: number; kind: ObstKind; hit: boolean; bob: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number; text?: string };

export class PolarGame {
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;
  W = 800;
  H = 450;
  private raf = 0;
  private last = 0;
  running = false;
  easy = false;

  // estado
  private speed = 0;
  private dist = 0;
  private bearY = 0;
  private vy = 0;
  private jumps = 0;
  private hearts = 3;
  private hurt = 0;
  private star = 0;
  private fish = 0;
  private gifts = 0;
  private bonus = 0;
  private time = 0;
  private items: Item[] = [];
  private obst: Obst[] = [];
  private parts: Particle[] = [];
  private flakes: { x: number; y: number; r: number; s: number }[] = [];
  private nextObst = 0;
  private nextItem = 0;
  private scarf: { x: number; y: number }[] = [];
  private announce: { text: string; t: number } | null = null;

  onEnd?: (r: PolarResult) => void;
  onSound?: (kind: "jump" | "fish" | "gift" | "star" | "hurt" | "heart" | "land") => void;
  onHud?: (h: { score: number; hearts: number; meters: number; star: number }) => void;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    this.resize();
    for (let i = 0; i < 60; i++) this.flakes.push({ x: Math.random(), y: Math.random(), r: Math.random() * 2 + 0.6, s: Math.random() * 0.4 + 0.2 });
    this.reset();
    this.draw(0);
  }

  private get ground() {
    return this.H * 0.8;
  }
  private get u() {
    return this.H / 450; // unidade de escala
  }
  private get bearX() {
    return this.W * 0.2;
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = Math.max(300, r.width);
    this.H = Math.max(240, r.height);
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (!this.running) this.draw(0);
  }

  private reset() {
    this.speed = 260;
    this.dist = 0;
    this.bearY = 0;
    this.vy = 0;
    this.jumps = 0;
    this.hearts = this.easy ? 5 : 3;
    this.hurt = 0;
    this.star = 0;
    this.fish = 0;
    this.gifts = 0;
    this.bonus = 0;
    this.time = 0;
    this.items = [];
    this.obst = [];
    this.parts = [];
    this.nextObst = 1.6;
    this.nextItem = 0.6;
    this.scarf = Array.from({ length: 6 }, () => ({ x: 0, y: 0 }));
    this.announce = null;
  }

  start() {
    this.reset();
    this.running = true;
    this.last = performance.now();
    this.say(this.easy ? "Vamos escorregar! 🐻‍❄️" : "Prepare a barriguinha! 🐻‍❄️");
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /** Pular (até 2 vezes no ar). */
  jump() {
    if (!this.running) return;
    if (this.jumps >= 2) return;
    const u = this.u;
    this.vy = (this.jumps === 0 ? -720 : -600) * u * (this.easy ? 1.05 : 1);
    this.jumps++;
    this.burst(this.bearX, this.ground - this.bearY, "#FFFFFF", 8, 140);
    this.onSound?.("jump");
  }

  private score() {
    return Math.floor(this.dist / 10) + this.fish * 10 + this.gifts * 50 + this.bonus;
  }

  private say(text: string) {
    this.announce = { text, t: 1.6 };
  }

  private loop = (now: number) => {
    const dt = Math.min(0.033, (now - this.last) / 1000);
    this.last = now;
    this.update(dt);
    this.draw(dt);
    if (this.running) this.raf = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    const u = this.u;
    this.time += dt;
    // fica mais rápido com o tempo
    const max = this.easy ? 380 : 560;
    this.speed = Math.min(max, (this.easy ? 230 : 260) + this.time * (this.easy ? 3 : 6));
    const v = this.speed * u * (this.star > 0 ? 1.25 : 1);
    this.dist += v * dt * 0.05;

    // física do pulo
    const g = 2100 * u;
    this.vy += g * dt;
    this.bearY -= this.vy * dt;
    if (this.bearY <= 0) {
      if (this.jumps > 0 && this.vy > 300 * u) {
        this.burst(this.bearX, this.ground, "#E6F2FF", 6, 90);
        this.onSound?.("land");
      }
      this.bearY = 0;
      this.vy = 0;
      this.jumps = 0;
    }
    if (this.hurt > 0) this.hurt -= dt;
    if (this.star > 0) {
      this.star -= dt;
      if (Math.random() < 0.6) this.burst(this.bearX - 20 * u, this.ground - this.bearY - 20 * u, "#FFD166", 1, 60);
    }

    // gera obstáculos
    this.nextObst -= dt;
    if (this.nextObst <= 0) {
      const kinds: ObstKind[] = this.time < 12 ? ["bloco", "boneco"] : ["bloco", "boneco", "pinguim", "pedra"];
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      const size = { bloco: [44, 40], boneco: [40, 62], pinguim: [34, 44], pedra: [56, 26] }[kind];
      this.obst.push({ x: this.W + 40, w: size[0] * u, h: size[1] * u, kind, hit: false, bob: Math.random() * 6 });
      const gap = (this.easy ? 2.0 : 1.35) - Math.min(0.55, this.time * 0.012);
      this.nextObst = gap + Math.random() * (this.easy ? 1.2 : 0.9);
    }
    // gera itens (em arcos, para incentivar o pulo)
    this.nextItem -= dt;
    if (this.nextItem <= 0) {
      const r = Math.random();
      if (r < 0.06) {
        this.items.push({ x: this.W + 30, y: 150 * u, kind: "estrela", taken: false, t: 0 });
      } else if (r < 0.1 && this.hearts < (this.easy ? 5 : 3)) {
        this.items.push({ x: this.W + 30, y: 120 * u, kind: "coracao", taken: false, t: 0 });
      } else if (r < 0.3) {
        this.items.push({ x: this.W + 30, y: (90 + Math.random() * 90) * u, kind: "presente", taken: false, t: 0 });
      } else {
        const n = 3 + Math.floor(Math.random() * 3);
        const high = Math.random() < 0.5;
        for (let k = 0; k < n; k++) {
          const arc = high ? Math.sin((k / (n - 1)) * Math.PI) * 90 + 40 : 22;
          this.items.push({ x: this.W + 30 + k * 34 * u, y: arc * u, kind: "peixe", taken: false, t: Math.random() * 6 });
        }
      }
      this.nextItem = 0.9 + Math.random() * 1.1;
    }

    // move e colide
    const bx = this.bearX;
    const by = this.ground - this.bearY;
    const bw = 60 * u;
    const bh = 44 * u;
    for (const o of this.obst) {
      o.x -= v * dt;
      if (o.hit) continue;
      const ox = o.x - o.w / 2;
      const oy = this.ground - o.h;
      const overlap = bx + bw * 0.42 > ox + 6 * u && bx - bw * 0.42 < ox + o.w - 6 * u && by > oy + 6 * u && by - bh < this.ground;
      if (overlap) {
        o.hit = true;
        if (this.star > 0) {
          this.bonus += 30;
          this.burst(o.x, oy, "#FFD166", 18, 260);
          this.pop(o.x, oy - 10 * u, "+30 💥");
          this.onSound?.("star");
        } else if (this.hurt <= 0) {
          this.hearts--;
          this.hurt = 1.4;
          this.burst(bx, by - bh / 2, "#9CC9FF", 14, 220);
          this.onSound?.("hurt");
          if (this.hearts <= 0) return this.finish();
          this.say(this.hearts === 1 ? "Último coração! ❤️" : "Ops! Cuidado! 🧊");
        }
      }
    }
    this.obst = this.obst.filter((o) => o.x > -80);

    for (const it of this.items) {
      it.x -= v * dt;
      it.t += dt;
      if (it.taken) continue;
      const iy = this.ground - it.y;
      const dx = it.x - bx;
      const dy = iy - (by - bh / 2);
      const reach = (this.star > 0 ? 46 : 32) * u;
      if (dx * dx + dy * dy < reach * reach) {
        it.taken = true;
        if (it.kind === "peixe") {
          this.fish++;
          this.pop(it.x, iy, "+10");
          this.onSound?.("fish");
          if (this.fish % 25 === 0) this.say(`${this.fish} peixinhos! 🐟`);
        } else if (it.kind === "presente") {
          this.gifts++;
          this.pop(it.x, iy, "+50 🎁");
          this.burst(it.x, iy, "#EF233C", 12, 200);
          this.onSound?.("gift");
        } else if (it.kind === "estrela") {
          this.star = 5;
          this.say("Superestrela! ⭐ Nada te segura!");
          this.burst(it.x, iy, "#FFD166", 22, 260);
          this.onSound?.("star");
        } else {
          this.hearts++;
          this.pop(it.x, iy, "+❤️");
          this.onSound?.("heart");
        }
      }
    }
    this.items = this.items.filter((i) => i.x > -40 && !i.taken);

    for (const p of this.parts) {
      p.life -= dt;
      p.x += p.vx * dt - (p.text ? 0 : v * dt * 0.3);
      p.y += p.vy * dt;
      if (!p.text) p.vy += 500 * dt;
    }
    this.parts = this.parts.filter((p) => p.life > 0);
    if (this.announce) {
      this.announce.t -= dt;
      if (this.announce.t <= 0) this.announce = null;
    }
    // marcos de distância
    const before = Math.floor((this.dist - v * dt * 0.05) / 250);
    const now = Math.floor(this.dist / 250);
    if (now > before && now > 0) this.say(`${now * 250} metros! 🏁`);

    this.onHud?.({ score: this.score(), hearts: this.hearts, meters: Math.floor(this.dist), star: Math.max(0, this.star) });
  }

  private finish() {
    this.running = false;
    this.draw(0);
    this.onEnd?.({ score: this.score(), fish: this.fish, gifts: this.gifts, meters: Math.floor(this.dist) });
  }

  private burst(x: number, y: number, color: string, n: number, sp: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = sp * (0.4 + Math.random() * 0.6) * this.u;
      this.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120 * this.u, life: 0.6, max: 0.6, color, size: (2 + Math.random() * 3) * this.u });
    }
  }
  private pop(x: number, y: number, text: string) {
    this.parts.push({ x, y, vx: 0, vy: -70 * this.u, life: 0.9, max: 0.9, color: "#FFFFFF", size: 18 * this.u, text });
  }

  // ------------------------------------------------------------------ desenho
  private draw(dt: number) {
    const c = this.ctx;
    const { W, H } = this;
    const u = this.u;
    const gy = this.ground;
    const scroll = this.dist * 20;

    // céu com aurora
    const sky = c.createLinearGradient(0, 0, 0, gy);
    sky.addColorStop(0, "#071030");
    sky.addColorStop(0.6, "#14295A");
    sky.addColorStop(1, "#2D4E86");
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H);
    for (let k = 0; k < 3; k++) {
      c.beginPath();
      const base = H * (0.18 + k * 0.07);
      c.moveTo(0, base);
      for (let x = 0; x <= W; x += 20) {
        c.lineTo(x, base + Math.sin(x / (120 + k * 40) + this.time * (0.4 + k * 0.15)) * 18 * u);
      }
      c.lineTo(W, base + 50 * u);
      c.lineTo(0, base + 50 * u);
      c.closePath();
      c.fillStyle = ["rgba(45,198,83,0.16)", "rgba(76,201,240,0.13)", "rgba(155,93,229,0.1)"][k];
      c.fill();
    }
    // lua
    c.fillStyle = "rgba(255,246,213,0.95)";
    c.beginPath();
    c.arc(W * 0.82, H * 0.17, 26 * u, 0, Math.PI * 2);
    c.fill();

    // montanhas (paralaxe)
    this.mountains(scroll * 0.1, gy - 120 * u, 160 * u, "#3B5C93", 260 * u);
    this.mountains(scroll * 0.25, gy - 60 * u, 110 * u, "#5C7FB8", 190 * u);
    // iglus e pinheiros ao fundo
    const off = (scroll * 0.45) % (420 * u);
    for (let x = -off; x < W + 420 * u; x += 420 * u) {
      this.igloo(x + 120 * u, gy - 4 * u, u);
      this.pine(x + 300 * u, gy - 2 * u, u * 0.9);
      this.pine(x + 340 * u, gy - 2 * u, u * 0.7);
    }

    // chão de gelo
    const ice = c.createLinearGradient(0, gy, 0, H);
    ice.addColorStop(0, "#E8F4FF");
    ice.addColorStop(1, "#B9D6F2");
    c.fillStyle = ice;
    c.fillRect(0, gy, W, H - gy);
    c.strokeStyle = "rgba(120,170,220,0.5)";
    c.lineWidth = 2;
    const lo = scroll % (90 * u);
    for (let x = -lo; x < W; x += 90 * u) {
      c.beginPath();
      c.moveTo(x, gy + 18 * u);
      c.lineTo(x + 40 * u, gy + 18 * u);
      c.moveTo(x + 30 * u, gy + 40 * u);
      c.lineTo(x + 75 * u, gy + 40 * u);
      c.stroke();
    }

    // itens
    for (const it of this.items) this.item(it, u);
    // obstáculos
    for (const o of this.obst) this.obstacle(o, u);

    // ursinho
    this.bear(u, dt);

    // partículas e textos
    for (const p of this.parts) {
      const a = Math.max(0, p.life / p.max);
      if (p.text) {
        c.globalAlpha = a;
        c.font = `bold ${p.size}px system-ui, sans-serif`;
        c.textAlign = "center";
        c.lineWidth = 4;
        c.strokeStyle = "rgba(11,19,43,0.7)";
        c.strokeText(p.text, p.x, p.y);
        c.fillStyle = "#FFD166";
        c.fillText(p.text, p.x, p.y);
      } else {
        c.globalAlpha = a;
        c.fillStyle = p.color;
        c.beginPath();
        c.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        c.fill();
      }
      c.globalAlpha = 1;
    }

    // neve
    c.fillStyle = "rgba(255,255,255,0.85)";
    for (const f of this.flakes) {
      f.y += (f.s * dt * 60) / H + 0.0005;
      f.x -= ((this.speed * u * dt) / W) * 0.25;
      if (f.y > 1) f.y = 0;
      if (f.x < 0) f.x = 1;
      c.beginPath();
      c.arc(f.x * W, f.y * H, f.r * u, 0, Math.PI * 2);
      c.fill();
    }

    // aviso central
    if (this.announce) {
      const a = Math.min(1, this.announce.t * 2);
      c.globalAlpha = a;
      c.font = `bold ${26 * u}px system-ui, sans-serif`;
      c.textAlign = "center";
      c.lineWidth = 6;
      c.strokeStyle = "rgba(11,19,43,0.75)";
      c.strokeText(this.announce.text, W / 2, H * 0.36);
      c.fillStyle = "#FFFFFF";
      c.fillText(this.announce.text, W / 2, H * 0.36);
      c.globalAlpha = 1;
    }
  }

  private mountains(offset: number, baseY: number, height: number, color: string, span: number) {
    const c = this.ctx;
    const o = offset % span;
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(-span, this.ground);
    for (let x = -o - span; x < this.W + span; x += span) {
      c.lineTo(x, baseY + height * 0.5);
      c.lineTo(x + span * 0.5, baseY - height * 0.3);
      c.lineTo(x + span, baseY + height * 0.5);
    }
    c.lineTo(this.W + span, this.ground);
    c.closePath();
    c.fill();
    // neve nos picos
    c.fillStyle = "rgba(255,255,255,0.85)";
    for (let x = -o - span; x < this.W + span; x += span) {
      const px = x + span * 0.5;
      const py = baseY - height * 0.3;
      c.beginPath();
      c.moveTo(px, py);
      c.lineTo(px - span * 0.12, py + height * 0.16);
      c.lineTo(px + span * 0.12, py + height * 0.16);
      c.closePath();
      c.fill();
    }
  }

  private igloo(x: number, y: number, u: number) {
    const c = this.ctx;
    c.fillStyle = "#F2F8FF";
    c.beginPath();
    c.arc(x, y, 34 * u, Math.PI, 0);
    c.fill();
    c.strokeStyle = "rgba(140,180,220,0.6)";
    c.lineWidth = 1.5;
    for (let k = 1; k < 3; k++) {
      c.beginPath();
      c.arc(x, y, 34 * u, Math.PI, 0);
      c.moveTo(x - 34 * u, y - k * 11 * u);
      c.lineTo(x + 34 * u, y - k * 11 * u);
      c.stroke();
    }
    c.fillStyle = "#2D4E86";
    c.beginPath();
    c.arc(x + 12 * u, y, 10 * u, Math.PI, 0);
    c.fill();
    c.fillStyle = "rgba(255,209,102,0.6)";
    c.beginPath();
    c.arc(x + 12 * u, y, 6 * u, Math.PI, 0);
    c.fill();
  }

  private pine(x: number, y: number, s: number) {
    const c = this.ctx;
    c.fillStyle = "#1E5B3A";
    for (let k = 0; k < 3; k++) {
      c.beginPath();
      c.moveTo(x, y - (70 - k * 18) * s);
      c.lineTo(x - (22 + k * 6) * s, y - (30 - k * 14) * s);
      c.lineTo(x + (22 + k * 6) * s, y - (30 - k * 14) * s);
      c.closePath();
      c.fill();
    }
    c.fillStyle = "#FFFFFF";
    c.beginPath();
    c.moveTo(x, y - 70 * s);
    c.lineTo(x - 8 * s, y - 56 * s);
    c.lineTo(x + 8 * s, y - 56 * s);
    c.closePath();
    c.fill();
  }

  private item(it: Item, u: number) {
    const c = this.ctx;
    const x = it.x;
    const y = this.ground - it.y + Math.sin(it.t * 4) * 4 * u;
    c.save();
    c.translate(x, y);
    if (it.kind === "peixe") {
      c.rotate(Math.sin(it.t * 6) * 0.2);
      c.fillStyle = "#FF9F1C";
      c.beginPath();
      c.ellipse(0, 0, 12 * u, 7 * u, 0, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.moveTo(10 * u, 0);
      c.lineTo(19 * u, -7 * u);
      c.lineTo(19 * u, 7 * u);
      c.closePath();
      c.fill();
      c.fillStyle = "#FFFFFF";
      c.beginPath();
      c.arc(-6 * u, -2 * u, 2.4 * u, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#1C2541";
      c.beginPath();
      c.arc(-6.5 * u, -2 * u, 1.2 * u, 0, Math.PI * 2);
      c.fill();
    } else if (it.kind === "presente") {
      c.rotate(Math.sin(it.t * 3) * 0.12);
      c.fillStyle = "#EF233C";
      c.fillRect(-14 * u, -12 * u, 28 * u, 24 * u);
      c.fillStyle = "#FFD166";
      c.fillRect(-3 * u, -12 * u, 6 * u, 24 * u);
      c.fillRect(-14 * u, -3 * u, 28 * u, 6 * u);
      c.beginPath();
      c.ellipse(-6 * u, -15 * u, 6 * u, 4 * u, -0.5, 0, Math.PI * 2);
      c.ellipse(6 * u, -15 * u, 6 * u, 4 * u, 0.5, 0, Math.PI * 2);
      c.fill();
    } else if (it.kind === "estrela") {
      c.rotate(it.t * 2);
      const glow = c.createRadialGradient(0, 0, 2, 0, 0, 30 * u);
      glow.addColorStop(0, "rgba(255,209,102,0.8)");
      glow.addColorStop(1, "rgba(255,209,102,0)");
      c.fillStyle = glow;
      c.beginPath();
      c.arc(0, 0, 30 * u, 0, Math.PI * 2);
      c.fill();
      this.starPath(16 * u);
      c.fillStyle = "#FFD166";
      c.fill();
    } else {
      const s = 1 + Math.sin(it.t * 6) * 0.08;
      c.scale(s, s);
      c.fillStyle = "#F72585";
      c.beginPath();
      c.moveTo(0, 10 * u);
      c.bezierCurveTo(-18 * u, -2 * u, -10 * u, -16 * u, 0, -7 * u);
      c.bezierCurveTo(10 * u, -16 * u, 18 * u, -2 * u, 0, 10 * u);
      c.fill();
    }
    c.restore();
  }

  private starPath(r: number) {
    const c = this.ctx;
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    c.closePath();
  }

  private obstacle(o: Obst, u: number) {
    const c = this.ctx;
    const x = o.x;
    const gy = this.ground;
    c.save();
    if (o.hit) c.globalAlpha = 0.35;
    if (o.kind === "bloco") {
      const g = c.createLinearGradient(x - o.w / 2, gy - o.h, x + o.w / 2, gy);
      g.addColorStop(0, "#DFF3FF");
      g.addColorStop(1, "#7FB6E6");
      c.fillStyle = g;
      c.beginPath();
      c.roundRect(x - o.w / 2, gy - o.h, o.w, o.h, 6 * u);
      c.fill();
      c.strokeStyle = "rgba(255,255,255,0.9)";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(x - o.w / 2 + 8 * u, gy - o.h + 8 * u);
      c.lineTo(x - o.w / 2 + 18 * u, gy - o.h + 8 * u);
      c.stroke();
    } else if (o.kind === "boneco") {
      c.fillStyle = "#FFFFFF";
      c.strokeStyle = "#B8C4D6";
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(x, gy - 18 * u, 18 * u, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.beginPath();
      c.arc(x, gy - 46 * u, 13 * u, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.fillStyle = "#1C2541";
      c.fillRect(x - 9 * u, gy - 70 * u, 18 * u, 12 * u);
      c.fillRect(x - 13 * u, gy - 60 * u, 26 * u, 3 * u);
      c.fillStyle = "#F4A261";
      c.beginPath();
      c.moveTo(x - 1 * u, gy - 46 * u);
      c.lineTo(x - 13 * u, gy - 44 * u);
      c.lineTo(x - 1 * u, gy - 42 * u);
      c.fill();
      c.fillStyle = "#1C2541";
      c.beginPath();
      c.arc(x - 5 * u, gy - 50 * u, 1.6 * u, 0, Math.PI * 2);
      c.arc(x + 4 * u, gy - 50 * u, 1.6 * u, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#EF233C";
      c.fillRect(x - 12 * u, gy - 36 * u, 24 * u, 5 * u);
    } else if (o.kind === "pinguim") {
      const hop = Math.abs(Math.sin(this.time * 8 + o.bob)) * 5 * u;
      c.translate(0, -hop);
      c.fillStyle = "#1C2541";
      c.beginPath();
      c.ellipse(x, gy - 22 * u, 16 * u, 22 * u, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#FFFFFF";
      c.beginPath();
      c.ellipse(x - 3 * u, gy - 18 * u, 10 * u, 16 * u, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#F4A261";
      c.beginPath();
      c.moveTo(x - 10 * u, gy - 32 * u);
      c.lineTo(x - 20 * u, gy - 29 * u);
      c.lineTo(x - 10 * u, gy - 27 * u);
      c.fill();
      c.fillStyle = "#1C2541";
      c.beginPath();
      c.arc(x - 6 * u, gy - 34 * u, 1.8 * u, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#EF233C";
      c.fillRect(x - 14 * u, gy - 26 * u, 26 * u, 4 * u);
    } else {
      c.fillStyle = "#8D99AE";
      c.beginPath();
      c.ellipse(x, gy - o.h / 2 + 2 * u, o.w / 2, o.h / 2 + 2 * u, 0, Math.PI, 0);
      c.fill();
      c.fillStyle = "#FFFFFF";
      c.beginPath();
      c.ellipse(x, gy - o.h + 4 * u, o.w / 2.6, 6 * u, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }

  /** O ursinho Polo: deitado de barriga no gelo, com cachecol vermelho voando. */
  private bear(u: number, dt: number) {
    const c = this.ctx;
    const x = this.bearX;
    const y = this.ground - this.bearY;
    const air = this.bearY > 1;
    const blink = this.hurt > 0 && Math.floor(this.hurt * 12) % 2 === 0;
    if (blink) return;

    // sombra
    c.fillStyle = "rgba(30,60,110,0.25)";
    c.beginPath();
    c.ellipse(x, this.ground + 3 * u, 40 * u * (1 - Math.min(0.5, this.bearY / (300 * u))), 6 * u, 0, 0, Math.PI * 2);
    c.fill();

    c.save();
    c.translate(x, y);
    c.scale(1.3, 1.3); // ursinho um pouco maior que o cenário
    const tilt = air ? Math.max(-0.35, Math.min(0.35, this.vy / (2400 * u))) : Math.sin(this.time * 10) * 0.02;
    c.rotate(tilt);
    if (this.star > 0) {
      const glow = c.createRadialGradient(0, -16 * u, 4, 0, -16 * u, 52 * u);
      glow.addColorStop(0, "rgba(255,209,102,0.55)");
      glow.addColorStop(1, "rgba(255,209,102,0)");
      c.fillStyle = glow;
      c.beginPath();
      c.arc(0, -16 * u, 52 * u, 0, Math.PI * 2);
      c.fill();
    }

    // cachecol (fita que balança atrás)
    const sx = -6 * u;
    const sy = -24 * u;
    this.scarf[0] = { x: sx, y: sy };
    for (let i = 1; i < this.scarf.length; i++) {
      const p = this.scarf[i];
      const tx = this.scarf[i - 1].x - 7 * u;
      const ty = this.scarf[i - 1].y + Math.sin(this.time * 14 + i) * 2.5 * u + (air ? 2 * u : 0);
      p.x += (tx - p.x) * Math.min(1, dt * 25 || 1);
      p.y += (ty - p.y) * Math.min(1, dt * 25 || 1);
    }
    c.strokeStyle = "#E63946";
    c.lineWidth = 6 * u;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(this.scarf[0].x, this.scarf[0].y);
    for (const p of this.scarf) c.lineTo(p.x, p.y);
    c.stroke();

    // corpo (deitado)
    c.fillStyle = "#FFFFFF";
    c.strokeStyle = "#C9D8EA";
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(-4 * u, -14 * u, 30 * u, 15 * u, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    // patinhas da frente esticadas
    c.beginPath();
    c.ellipse(24 * u, -6 * u, 9 * u, 5 * u, 0.2, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    // patinhas de trás
    c.beginPath();
    c.ellipse(-32 * u, -8 * u, 8 * u, 5 * u, -0.3, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    // cabeça
    c.beginPath();
    c.arc(20 * u, -26 * u, 15 * u, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    // orelhas
    c.beginPath();
    c.arc(10 * u, -38 * u, 5 * u, 0, Math.PI * 2);
    c.arc(26 * u, -40 * u, 5 * u, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.fillStyle = "#FFC2D1";
    c.beginPath();
    c.arc(10 * u, -38 * u, 2.4 * u, 0, Math.PI * 2);
    c.arc(26 * u, -40 * u, 2.4 * u, 0, Math.PI * 2);
    c.fill();
    // focinho
    c.fillStyle = "#F4F8FF";
    c.beginPath();
    c.ellipse(31 * u, -22 * u, 8 * u, 6 * u, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#1C2541";
    c.beginPath();
    c.ellipse(36 * u, -24 * u, 3.4 * u, 2.6 * u, 0, 0, Math.PI * 2);
    c.fill();
    // olhos (fechados de felicidade quando no ar)
    c.strokeStyle = "#1C2541";
    c.lineWidth = 2;
    if (air || this.star > 0) {
      c.beginPath();
      c.arc(22 * u, -29 * u, 2.6 * u, Math.PI * 1.1, Math.PI * 1.9);
      c.stroke();
    } else {
      c.fillStyle = "#1C2541";
      c.beginPath();
      c.arc(23 * u, -29 * u, 2.2 * u, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#FFFFFF";
      c.beginPath();
      c.arc(23.8 * u, -29.8 * u, 0.8 * u, 0, Math.PI * 2);
      c.fill();
    }
    // bochecha
    c.fillStyle = "rgba(255,143,163,0.55)";
    c.beginPath();
    c.arc(18 * u, -21 * u, 3.2 * u, 0, Math.PI * 2);
    c.fill();
    // gorrinho de Natal
    c.fillStyle = "#E63946";
    c.beginPath();
    c.moveTo(8 * u, -36 * u);
    c.quadraticCurveTo(18 * u, -58 * u, 4 * u, -60 * u);
    c.lineTo(30 * u, -38 * u);
    c.closePath();
    c.fill();
    c.fillStyle = "#FFFFFF";
    c.beginPath();
    c.roundRect(6 * u, -40 * u, 26 * u, 6 * u, 3 * u);
    c.fill();
    c.beginPath();
    c.arc(4 * u, -60 * u, 4 * u, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // rastro de neve quando desliza no chão
    if (!air && this.running && Math.random() < 0.5) {
      this.parts.push({ x: x - 30 * u, y: this.ground - 2 * u, vx: -80 * u - Math.random() * 60 * u, vy: -60 * u * Math.random(), life: 0.4, max: 0.4, color: "#FFFFFF", size: 2 * u });
    }
  }
}
