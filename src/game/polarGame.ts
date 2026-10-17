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
    return Math.max(this.W * 0.2, 96 * this.u);
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
  /** número pseudoaleatório estável para cada índice (montanhas e icebergs não "pulam" ao rolar) */
  private hash(i: number) {
    const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  }

  private draw(dt: number) {
    const c = this.ctx;
    const { W, H } = this;
    const u = this.u;
    const gy = this.ground;
    const scroll = this.dist * 20;
    const t = this.time + performance.now() / 1000 * (this.running ? 0 : 1);

    // ---- céu polar
    const sky = c.createLinearGradient(0, 0, 0, gy);
    sky.addColorStop(0, "#030716");
    sky.addColorStop(0.45, "#0B1A3F");
    sky.addColorStop(0.8, "#1D3A6E");
    sky.addColorStop(1, "#3A5F95");
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H);

    // estrelas piscando
    for (let i = 0; i < 70; i++) {
      const sx = this.hash(i) * W;
      const sy = this.hash(i + 100) * gy * 0.55;
      const tw = 0.45 + 0.55 * Math.abs(Math.sin(t * (0.8 + this.hash(i + 200) * 2) + i));
      c.globalAlpha = tw * 0.9;
      c.fillStyle = "#FFFFFF";
      c.fillRect(sx, sy, (this.hash(i + 300) > 0.85 ? 2 : 1.2) * u, (this.hash(i + 300) > 0.85 ? 2 : 1.2) * u);
    }
    c.globalAlpha = 1;

    // aurora boreal em cortinas
    this.aurora(t, u);

    // lua com halo e crateras
    const mx = W * 0.84,
      my = H * 0.15,
      mr = 22 * u;
    const halo = c.createRadialGradient(mx, my, mr, mx, my, mr * 4.5);
    halo.addColorStop(0, "rgba(220,235,255,0.35)");
    halo.addColorStop(1, "rgba(220,235,255,0)");
    c.fillStyle = halo;
    c.beginPath();
    c.arc(mx, my, mr * 4.5, 0, Math.PI * 2);
    c.fill();
    const moon = c.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, mr * 0.2, mx, my, mr);
    moon.addColorStop(0, "#FFFFFF");
    moon.addColorStop(1, "#DCE6F2");
    c.fillStyle = moon;
    c.beginPath();
    c.arc(mx, my, mr, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(150,170,200,0.35)";
    for (const [dx, dy, r] of [
      [-0.3, -0.2, 0.22],
      [0.25, 0.15, 0.16],
      [-0.05, 0.4, 0.12],
      [0.35, -0.35, 0.09],
    ]) {
      c.beginPath();
      c.arc(mx + dx * mr, my + dy * mr, r * mr, 0, Math.PI * 2);
      c.fill();
    }

    // ---- geleiras ao fundo (com lado iluminado e lado na sombra)
    this.glaciers(scroll * 0.06, gy - 95 * u, 150 * u, 230 * u, ["#2E4B7D", "#1F3763", "#C9DAF0"], 1);
    this.glaciers(scroll * 0.16, gy - 50 * u, 105 * u, 170 * u, ["#4B6EA6", "#355585", "#E4EEFA"], 7);

    // ---- mar gelado com icebergs e reflexos
    const seaTop = gy - 34 * u;
    const sea = c.createLinearGradient(0, seaTop, 0, gy);
    sea.addColorStop(0, "#1B3D6E");
    sea.addColorStop(1, "#0E2850");
    c.fillStyle = sea;
    c.fillRect(0, seaTop, W, gy - seaTop);
    // brilho da lua na água
    c.fillStyle = "rgba(220,235,255,0.25)";
    for (let k = 0; k < 6; k++) {
      const wy = seaTop + 4 * u + k * 5 * u;
      const ww = (40 - k * 4) * u * (1 + 0.2 * Math.sin(t * 2 + k));
      c.fillRect(mx - ww / 2 + Math.sin(t * 1.5 + k) * 6 * u, wy, ww, 1.6 * u);
    }
    // ondinhas
    c.strokeStyle = "rgba(160,200,240,0.25)";
    c.lineWidth = 1;
    const wo = (scroll * 0.3) % (60 * u);
    for (let k = 0; k < 3; k++) {
      const wy = seaTop + (8 + k * 9) * u;
      c.beginPath();
      for (let x = -wo - 60 * u; x < W; x += 60 * u) {
        c.moveTo(x + k * 20 * u, wy);
        c.quadraticCurveTo(x + k * 20 * u + 10 * u, wy - 2 * u, x + k * 20 * u + 20 * u, wy);
      }
      c.stroke();
    }
    // icebergs flutuando
    const span = 300 * u;
    const io = (scroll * 0.3) % span;
    const i0 = Math.floor((scroll * 0.3) / span);
    for (let k = -1; k < W / span + 2; k++) {
      const h = this.hash(i0 + k + 50);
      if (h < 0.35) continue;
      this.iceberg(k * span - io + h * 120 * u, seaTop + 10 * u, (0.6 + h * 0.6) * u, t);
    }

    // ---- placa de gelo (chão)
    const ice = c.createLinearGradient(0, gy, 0, H);
    ice.addColorStop(0, "#F7FBFF");
    ice.addColorStop(0.25, "#DCEBFA");
    ice.addColorStop(1, "#A9C8E8");
    c.fillStyle = ice;
    c.fillRect(0, gy - 2 * u, W, H - gy + 2 * u);
    // borda com neve fofa
    c.fillStyle = "#FFFFFF";
    const bo = scroll % (46 * u);
    c.beginPath();
    c.moveTo(0, gy + 4 * u);
    for (let x = -bo - 46 * u; x < W + 46 * u; x += 46 * u) c.quadraticCurveTo(x + 23 * u, gy - 6 * u, x + 46 * u, gy + 2 * u);
    c.lineTo(W, gy + 8 * u);
    c.lineTo(0, gy + 8 * u);
    c.fill();
    // rachaduras e marcas do gelo
    const co = scroll % (220 * u);
    const ci = Math.floor(scroll / (220 * u));
    c.strokeStyle = "rgba(110,155,205,0.45)";
    c.lineWidth = 1.2 * u;
    for (let k = 0; k < W / (220 * u) + 2; k++) {
      const x = k * 220 * u - co;
      const h = this.hash(ci + k);
      const y0 = gy + (20 + h * 30) * u;
      c.beginPath();
      c.moveTo(x, y0);
      c.lineTo(x + 30 * u, y0 + 6 * u);
      c.lineTo(x + 52 * u, y0 + 2 * u);
      c.lineTo(x + 80 * u, y0 + 10 * u);
      c.moveTo(x + 30 * u, y0 + 6 * u);
      c.lineTo(x + 38 * u, y0 + 18 * u);
      c.stroke();
      // faixas brilhantes
      c.fillStyle = "rgba(255,255,255,0.55)";
      c.fillRect(x + 110 * u, gy + (14 + h * 40) * u, 50 * u * (0.5 + h), 2 * u);
    }
    // cintilância no gelo
    for (let k = 0; k < 14; k++) {
      const sx = ((this.hash(k + 400) * W * 1.5 - scroll) % W + W) % W;
      const sy = gy + 10 * u + this.hash(k + 500) * (H - gy - 16 * u);
      const a = Math.max(0, Math.sin(t * 3 + k * 1.7));
      if (a < 0.6) continue;
      c.globalAlpha = (a - 0.6) * 2.5;
      this.sparkle(sx, sy, 4 * u);
    }
    c.globalAlpha = 1;

    // itens e obstáculos
    for (const it of this.items) this.item(it, u);
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

    // neve (em duas profundidades)
    for (const f of this.flakes) {
      f.y += (f.s * dt * 60) / H + 0.0005;
      f.x -= ((this.speed * u * dt) / W) * (0.15 + f.r * 0.08);
      if (f.y > 1) f.y = 0;
      if (f.x < 0) f.x = 1;
      c.globalAlpha = 0.5 + f.r * 0.18;
      c.fillStyle = "#FFFFFF";
      c.beginPath();
      c.arc(f.x * W + Math.sin(t + f.y * 10) * 3 * u, f.y * H, f.r * u, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;

    // vinheta suave nas bordas
    const vg = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.75);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(2,6,20,0.35)");
    c.fillStyle = vg;
    c.fillRect(0, 0, W, H);

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

  private aurora(t: number, u: number) {
    const c = this.ctx;
    const { W, H } = this;
    const bands: [number, number, string, string][] = [
      [H * 0.08, 110 * u, "rgba(80,255,170,", "0"],
      [H * 0.16, 80 * u, "rgba(120,200,255,", "1"],
    ];
    c.save();
    c.globalCompositeOperation = "lighter";
    bands.forEach(([top, h, col], b) => {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, col + "0)");
      g.addColorStop(0.35, col + (b ? "0.16)" : "0.22)"));
      g.addColorStop(1, col + "0)");
      c.fillStyle = g;
      const step = 5 * u;
      for (let x = 0; x < W; x += step) {
        const wave = Math.sin(x / (160 * u) + t * (0.35 + b * 0.2)) * 22 * u + Math.sin(x / (55 * u) - t * 0.6) * 7 * u;
        const ray = 0.45 + 0.55 * Math.abs(Math.sin(x / (23 * u) + t * 0.9 + b));
        c.globalAlpha = ray;
        c.save();
        c.translate(x, top + wave);
        c.fillRect(-1, 0, step + 2, h * (0.7 + 0.3 * ray));
        c.restore();
      }
    });
    c.restore();
    c.globalAlpha = 1;
  }

  /** Cadeia de geleiras: picos irregulares, face clara (lua) e face na sombra. */
  private glaciers(offset: number, baseY: number, height: number, span: number, [light, dark, snow]: string[], seed: number) {
    const c = this.ctx;
    const gy = this.ground;
    const i0 = Math.floor(offset / span);
    const o = offset - i0 * span;
    for (let k = -1; k < this.W / span + 2; k++) {
      const h = this.hash(i0 + k + seed * 31);
      const px = k * span - o + span * (0.3 + h * 0.4);
      const ph = height * (0.55 + h * 0.45);
      const py = baseY - ph * 0.45;
      const lx = px - span * (0.55 + h * 0.2);
      const rx = px + span * (0.55 + (1 - h) * 0.2);
      // face iluminada (direita, voltada para a lua)
      c.fillStyle = light;
      c.beginPath();
      c.moveTo(px, py);
      c.lineTo(px + span * 0.12, py + ph * 0.3);
      c.lineTo(rx, gy);
      c.lineTo(px, gy);
      c.closePath();
      c.fill();
      // face na sombra
      c.fillStyle = dark;
      c.beginPath();
      c.moveTo(px, py);
      c.lineTo(px - span * 0.1, py + ph * 0.25);
      c.lineTo(px - span * 0.06, py + ph * 0.45);
      c.lineTo(lx, gy);
      c.lineTo(px, gy);
      c.closePath();
      c.fill();
      // neve no pico (irregular)
      c.fillStyle = snow;
      c.beginPath();
      c.moveTo(px, py);
      c.lineTo(px + span * 0.11, py + ph * 0.24);
      c.lineTo(px + span * 0.05, py + ph * 0.2);
      c.lineTo(px, py + ph * 0.3);
      c.lineTo(px - span * 0.04, py + ph * 0.19);
      c.lineTo(px - span * 0.09, py + ph * 0.22);
      c.closePath();
      c.fill();
    }
  }

  private iceberg(x: number, waterY: number, s: number, t: number) {
    const c = this.ctx;
    const bob = Math.sin(t * 1.2 + x * 0.01) * 1.5 * s;
    const y = waterY + bob;
    // reflexo
    c.fillStyle = "rgba(200,225,255,0.18)";
    c.beginPath();
    c.moveTo(x - 30 * s, y);
    c.lineTo(x + 34 * s, y);
    c.lineTo(x + 18 * s, y + 16 * s);
    c.lineTo(x - 14 * s, y + 18 * s);
    c.closePath();
    c.fill();
    // corpo
    c.fillStyle = "#EAF4FF";
    c.beginPath();
    c.moveTo(x - 30 * s, y);
    c.lineTo(x - 18 * s, y - 22 * s);
    c.lineTo(x - 4 * s, y - 30 * s);
    c.lineTo(x + 12 * s, y - 20 * s);
    c.lineTo(x + 34 * s, y);
    c.closePath();
    c.fill();
    c.fillStyle = "#A9C6E6";
    c.beginPath();
    c.moveTo(x - 4 * s, y - 30 * s);
    c.lineTo(x + 12 * s, y - 20 * s);
    c.lineTo(x + 34 * s, y);
    c.lineTo(x + 6 * s, y);
    c.closePath();
    c.fill();
  }

  private sparkle(x: number, y: number, r: number) {
    const c = this.ctx;
    c.fillStyle = "#FFFFFF";
    c.beginPath();
    c.moveTo(x, y - r);
    c.lineTo(x + r * 0.22, y - r * 0.22);
    c.lineTo(x + r, y);
    c.lineTo(x + r * 0.22, y + r * 0.22);
    c.lineTo(x, y + r);
    c.lineTo(x - r * 0.22, y + r * 0.22);
    c.lineTo(x - r, y);
    c.lineTo(x - r * 0.22, y - r * 0.22);
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
      // peixe do Ártico prateado-azulado, com brilho
      c.rotate(Math.sin(it.t * 6) * 0.2);
      const glow = c.createRadialGradient(0, 0, 2, 0, 0, 22 * u);
      glow.addColorStop(0, "rgba(255,240,200,0.35)");
      glow.addColorStop(1, "rgba(255,240,200,0)");
      c.fillStyle = glow;
      c.beginPath();
      c.arc(0, 0, 22 * u, 0, Math.PI * 2);
      c.fill();
      const body = c.createLinearGradient(0, -8 * u, 0, 8 * u);
      body.addColorStop(0, "#3D6FA8");
      body.addColorStop(0.45, "#9EC3E6");
      body.addColorStop(0.55, "#F0D9B5");
      body.addColorStop(1, "#E8E2D6");
      c.fillStyle = body;
      c.beginPath();
      c.moveTo(-14 * u, 0);
      c.quadraticCurveTo(-4 * u, -10 * u, 10 * u, -2 * u);
      c.lineTo(20 * u, -8 * u);
      c.lineTo(17 * u, 0);
      c.lineTo(20 * u, 8 * u);
      c.lineTo(10 * u, 2 * u);
      c.quadraticCurveTo(-4 * u, 10 * u, -14 * u, 0);
      c.fill();
      c.strokeStyle = "rgba(30,60,110,0.6)";
      c.lineWidth = 1;
      c.stroke();
      c.fillStyle = "#FF8A5B";
      c.beginPath();
      c.moveTo(-2 * u, -6 * u);
      c.lineTo(4 * u, -11 * u);
      c.lineTo(6 * u, -4 * u);
      c.fill();
      c.fillStyle = "#FFFFFF";
      c.beginPath();
      c.arc(-8 * u, -1.5 * u, 2.4 * u, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#0B132B";
      c.beginPath();
      c.arc(-8.4 * u, -1.5 * u, 1.3 * u, 0, Math.PI * 2);
      c.fill();
    } else if (it.kind === "presente") {
      c.rotate(Math.sin(it.t * 3) * 0.12);
      const g = c.createLinearGradient(-14 * u, -12 * u, 14 * u, 12 * u);
      g.addColorStop(0, "#FF4D5E");
      g.addColorStop(1, "#B5102A");
      c.fillStyle = g;
      c.beginPath();
      c.roundRect(-14 * u, -12 * u, 28 * u, 24 * u, 3 * u);
      c.fill();
      c.fillStyle = "#FFD166";
      c.fillRect(-3 * u, -12 * u, 6 * u, 24 * u);
      c.fillRect(-14 * u, -3 * u, 28 * u, 6 * u);
      c.beginPath();
      c.ellipse(-6 * u, -15 * u, 6 * u, 4 * u, -0.5, 0, Math.PI * 2);
      c.ellipse(6 * u, -15 * u, 6 * u, 4 * u, 0.5, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "rgba(255,255,255,0.35)";
      c.fillRect(-12 * u, -10 * u, 6 * u, 3 * u);
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

  private groundShadow(x: number, w: number) {
    const c = this.ctx;
    const g = c.createRadialGradient(x, this.ground + 2 * this.u, 0, x, this.ground + 2 * this.u, w);
    g.addColorStop(0, "rgba(40,80,140,0.35)");
    g.addColorStop(1, "rgba(40,80,140,0)");
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(x, this.ground + 2 * this.u, w, w * 0.18, 0, 0, Math.PI * 2);
    c.fill();
  }

  private obstacle(o: Obst, u: number) {
    const c = this.ctx;
    const x = o.x;
    const gy = this.ground;
    c.save();
    if (o.hit) c.globalAlpha = 0.35;
    this.groundShadow(x, o.w * 0.75);
    if (o.kind === "bloco") {
      // bloco de gelo translúcido com facetas
      const l = x - o.w / 2,
        top = gy - o.h;
      const g = c.createLinearGradient(l, top, l + o.w, gy);
      g.addColorStop(0, "rgba(235,248,255,0.95)");
      g.addColorStop(0.5, "rgba(150,205,240,0.92)");
      g.addColorStop(1, "rgba(90,150,210,0.95)");
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(l + 4 * u, gy);
      c.lineTo(l, top + 10 * u);
      c.lineTo(l + 10 * u, top);
      c.lineTo(l + o.w - 6 * u, top + 3 * u);
      c.lineTo(l + o.w, top + 14 * u);
      c.lineTo(l + o.w - 3 * u, gy);
      c.closePath();
      c.fill();
      c.fillStyle = "rgba(255,255,255,0.55)";
      c.beginPath();
      c.moveTo(l + 10 * u, top);
      c.lineTo(l + o.w - 6 * u, top + 3 * u);
      c.lineTo(l + o.w - 14 * u, top + 12 * u);
      c.lineTo(l + 6 * u, top + 10 * u);
      c.closePath();
      c.fill();
      c.strokeStyle = "rgba(255,255,255,0.8)";
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(l + 8 * u, top + 16 * u);
      c.lineTo(l + 14 * u, gy - 8 * u);
      c.moveTo(l + o.w * 0.6, top + 14 * u);
      c.lineTo(l + o.w * 0.5, top + 26 * u);
      c.stroke();
      // neve em cima
      c.fillStyle = "#FFFFFF";
      c.beginPath();
      c.ellipse(x, top + 2 * u, o.w * 0.42, 4 * u, 0.03, 0, Math.PI * 2);
      c.fill();
    } else if (o.kind === "boneco") {
      const ball = (cx: number, cy: number, r: number) => {
        const g = c.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r);
        g.addColorStop(0, "#FFFFFF");
        g.addColorStop(1, "#C7D8EC");
        c.fillStyle = g;
        c.beginPath();
        c.arc(cx, cy, r, 0, Math.PI * 2);
        c.fill();
      };
      ball(x, gy - 18 * u, 19 * u);
      ball(x, gy - 46 * u, 13 * u);
      // braços de galho
      c.strokeStyle = "#5A3A22";
      c.lineWidth = 2 * u;
      c.beginPath();
      c.moveTo(x - 10 * u, gy - 26 * u);
      c.lineTo(x - 26 * u, gy - 38 * u);
      c.lineTo(x - 30 * u, gy - 36 * u);
      c.moveTo(x + 10 * u, gy - 26 * u);
      c.lineTo(x + 25 * u, gy - 40 * u);
      c.stroke();
      c.fillStyle = "#1C2541";
      c.fillRect(x - 9 * u, gy - 70 * u, 18 * u, 12 * u);
      c.fillRect(x - 13 * u, gy - 60 * u, 26 * u, 3 * u);
      c.fillStyle = "#B5102A";
      c.fillRect(x - 9 * u, gy - 63 * u, 18 * u, 3 * u);
      c.fillStyle = "#F4A261";
      c.beginPath();
      c.moveTo(x - 1 * u, gy - 47 * u);
      c.lineTo(x - 15 * u, gy - 44 * u);
      c.lineTo(x - 1 * u, gy - 42 * u);
      c.fill();
      c.fillStyle = "#1C2541";
      c.beginPath();
      c.arc(x - 5 * u, gy - 50 * u, 1.6 * u, 0, Math.PI * 2);
      c.arc(x + 4 * u, gy - 50 * u, 1.6 * u, 0, Math.PI * 2);
      c.fill();
      for (const by of [-24, -14]) {
        c.beginPath();
        c.arc(x, gy + by * u, 1.8 * u, 0, Math.PI * 2);
        c.fill();
      }
      c.fillStyle = "#E63946";
      c.beginPath();
      c.roundRect(x - 13 * u, gy - 37 * u, 26 * u, 5 * u, 2 * u);
      c.fill();
      c.fillRect(x + 4 * u, gy - 34 * u, 5 * u, 12 * u);
    } else if (o.kind === "pinguim") {
      // pinguim-imperador
      const hop = Math.abs(Math.sin(this.time * 8 + o.bob)) * 5 * u;
      c.translate(0, -hop);
      const back = c.createLinearGradient(x - 16 * u, 0, x + 16 * u, 0);
      back.addColorStop(0, "#0B132B");
      back.addColorStop(1, "#2A3550");
      c.fillStyle = back;
      c.beginPath();
      c.ellipse(x + 2 * u, gy - 23 * u, 15 * u, 23 * u, 0.05, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#F7F7F2";
      c.beginPath();
      c.ellipse(x - 4 * u, gy - 18 * u, 10 * u, 17 * u, 0.05, 0, Math.PI * 2);
      c.fill();
      // mancha amarela do pescoço
      const neck = c.createRadialGradient(x - 8 * u, gy - 33 * u, 1, x - 8 * u, gy - 33 * u, 7 * u);
      neck.addColorStop(0, "#FFC233");
      neck.addColorStop(1, "rgba(255,194,51,0)");
      c.fillStyle = neck;
      c.beginPath();
      c.arc(x - 8 * u, gy - 33 * u, 7 * u, 0, Math.PI * 2);
      c.fill();
      // cabeça e bico
      c.fillStyle = "#0B132B";
      c.beginPath();
      c.arc(x - 2 * u, gy - 41 * u, 8 * u, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#F4A261";
      c.beginPath();
      c.moveTo(x - 9 * u, gy - 42 * u);
      c.lineTo(x - 19 * u, gy - 39 * u);
      c.lineTo(x - 9 * u, gy - 38 * u);
      c.fill();
      c.fillStyle = "#FFFFFF";
      c.beginPath();
      c.arc(x - 5 * u, gy - 43 * u, 1.6 * u, 0, Math.PI * 2);
      c.fill();
      // asinha e pés
      c.fillStyle = "#1C2541";
      c.beginPath();
      c.ellipse(x + 10 * u, gy - 20 * u, 4 * u, 12 * u, 0.3 + Math.sin(this.time * 10 + o.bob) * 0.2, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#F4A261";
      c.beginPath();
      c.ellipse(x - 6 * u, gy - 1 * u, 6 * u, 2.5 * u, 0, 0, Math.PI * 2);
      c.ellipse(x + 5 * u, gy - 1 * u, 6 * u, 2.5 * u, 0, 0, Math.PI * 2);
      c.fill();
      // gorrinho
      c.fillStyle = "#E63946";
      c.beginPath();
      c.moveTo(x - 9 * u, gy - 46 * u);
      c.quadraticCurveTo(x, gy - 62 * u, x + 10 * u, gy - 56 * u);
      c.lineTo(x + 6 * u, gy - 45 * u);
      c.fill();
      c.fillStyle = "#FFFFFF";
      c.beginPath();
      c.arc(x + 10 * u, gy - 56 * u, 2.6 * u, 0, Math.PI * 2);
      c.fill();
    } else {
      // rocha escura com neve
      const g = c.createLinearGradient(x, gy - o.h, x, gy);
      g.addColorStop(0, "#6C7A92");
      g.addColorStop(1, "#3E4A60");
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(x - o.w / 2, gy);
      c.lineTo(x - o.w * 0.4, gy - o.h * 0.6);
      c.lineTo(x - o.w * 0.15, gy - o.h);
      c.lineTo(x + o.w * 0.2, gy - o.h * 0.9);
      c.lineTo(x + o.w * 0.45, gy - o.h * 0.45);
      c.lineTo(x + o.w / 2, gy);
      c.closePath();
      c.fill();
      c.fillStyle = "rgba(255,255,255,0.18)";
      c.beginPath();
      c.moveTo(x - o.w * 0.4, gy - o.h * 0.6);
      c.lineTo(x - o.w * 0.15, gy - o.h);
      c.lineTo(x - o.w * 0.1, gy - o.h * 0.4);
      c.closePath();
      c.fill();
      c.fillStyle = "#FFFFFF";
      c.beginPath();
      c.moveTo(x - o.w * 0.35, gy - o.h * 0.68);
      c.lineTo(x - o.w * 0.15, gy - o.h - 2 * u);
      c.lineTo(x + o.w * 0.22, gy - o.h * 0.92);
      c.quadraticCurveTo(x, gy - o.h * 0.7, x - o.w * 0.35, gy - o.h * 0.68);
      c.fill();
    }
    c.restore();
  }

  /** O ursinho Polo: urso-polar deitado de barriga, deslizando no gelo, com cachecol e gorro. */
  private bear(u: number, dt: number) {
    const c = this.ctx;
    const x = this.bearX;
    const y = this.ground - this.bearY;
    const air = this.bearY > 1;
    const blink = this.hurt > 0 && Math.floor(this.hurt * 12) % 2 === 0;
    if (blink) return;

    // sombra no gelo
    const sh = 1 - Math.min(0.6, this.bearY / (300 * u));
    c.save();
    c.globalAlpha = sh;
    this.groundShadow(x, 58 * u * sh);
    c.restore();

    c.save();
    c.translate(x, y);
    c.scale(1.3, 1.3);
    const tilt = air ? Math.max(-0.35, Math.min(0.35, this.vy / (2400 * u))) : Math.sin(this.time * 10) * 0.015;
    c.rotate(tilt);
    if (this.star > 0) {
      const glow = c.createRadialGradient(0, -16 * u, 4, 0, -16 * u, 56 * u);
      glow.addColorStop(0, "rgba(255,209,102,0.55)");
      glow.addColorStop(1, "rgba(255,209,102,0)");
      c.fillStyle = glow;
      c.beginPath();
      c.arc(0, -16 * u, 56 * u, 0, Math.PI * 2);
      c.fill();
    }

    const fur = c.createLinearGradient(0, -34 * u, 0, 0);
    fur.addColorStop(0, "#FFFFFF");
    fur.addColorStop(0.6, "#F6F1E4");
    fur.addColorStop(1, "#DDD3BC");
    const edge = "rgba(150,140,115,0.55)";
    const paddle = air ? 0.5 : Math.sin(this.time * 14) * 0.25;

    // patas de trás esticadas (com almofadinhas)
    c.save();
    c.translate(-34 * u, -6 * u);
    c.rotate(-0.15 - paddle * 0.3);
    c.fillStyle = fur;
    c.strokeStyle = edge;
    c.lineWidth = 1.2;
    c.beginPath();
    c.ellipse(-10 * u, 0, 14 * u, 6.5 * u, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.fillStyle = "#3A3A44";
    c.beginPath();
    c.ellipse(-22 * u, 0, 2.8 * u, 4.6 * u, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // cachecol voando
    const sx = 8 * u;
    const sy = -27 * u;
    this.scarf[0] = { x: sx, y: sy };
    for (let i = 1; i < this.scarf.length; i++) {
      const p = this.scarf[i];
      const tx = this.scarf[i - 1].x - 8 * u;
      const ty = this.scarf[i - 1].y + Math.sin(this.time * 14 + i) * 2.5 * u + (air ? 2 * u : 0);
      p.x += (tx - p.x) * Math.min(1, dt * 25 || 1);
      p.y += (ty - p.y) * Math.min(1, dt * 25 || 1);
    }
    c.strokeStyle = "#C1121F";
    c.lineWidth = 6.5 * u;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(this.scarf[0].x, this.scarf[0].y);
    for (const p of this.scarf) c.lineTo(p.x, p.y);
    c.stroke();
    c.strokeStyle = "rgba(255,255,255,0.5)";
    c.lineWidth = 1.5 * u;
    c.setLineDash([3 * u, 5 * u]);
    c.stroke();
    c.setLineDash([]);

    // corpo alongado (urso-polar de verdade é comprido)
    c.fillStyle = fur;
    c.strokeStyle = edge;
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(-44 * u, -6 * u);
    c.bezierCurveTo(-46 * u, -24 * u, -26 * u, -32 * u, -6 * u, -30 * u);
    c.bezierCurveTo(10 * u, -30 * u, 18 * u, -30 * u, 24 * u, -26 * u);
    c.lineTo(26 * u, -8 * u);
    c.bezierCurveTo(10 * u, -1 * u, -20 * u, 0, -44 * u, -6 * u);
    c.closePath();
    c.fill();
    c.stroke();
    // sombra da barriga
    c.fillStyle = "rgba(170,155,120,0.25)";
    c.beginPath();
    c.ellipse(-10 * u, -5 * u, 30 * u, 4.5 * u, 0, 0, Math.PI * 2);
    c.fill();
    // pelos nas costas
    c.strokeStyle = "rgba(190,180,150,0.6)";
    c.lineWidth = 1;
    for (let k = 0; k < 7; k++) {
      const fx = -36 * u + k * 8 * u;
      c.beginPath();
      c.moveTo(fx, -26 * u + Math.abs(k - 3) * 0.8 * u);
      c.lineTo(fx - 3 * u, -22 * u + Math.abs(k - 3) * 0.8 * u);
      c.stroke();
    }

    // patas da frente esticadas para a frente
    c.save();
    c.translate(22 * u, -6 * u);
    c.rotate(0.05 + paddle * 0.2);
    c.fillStyle = fur;
    c.strokeStyle = edge;
    c.lineWidth = 1.2;
    c.beginPath();
    c.ellipse(10 * u, 0, 14 * u, 5.5 * u, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.strokeStyle = "#3A3A44";
    c.lineWidth = 1.2;
    for (let k = -1; k <= 1; k++) {
      c.beginPath();
      c.moveTo(23 * u, k * 2.2 * u);
      c.lineTo(25.5 * u, k * 2.6 * u);
      c.stroke();
    }
    c.restore();

    // cabeça: focinho comprido, orelhas pequenas
    c.fillStyle = fur;
    c.strokeStyle = edge;
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(14 * u, -24 * u);
    c.bezierCurveTo(14 * u, -40 * u, 30 * u, -44 * u, 38 * u, -36 * u);
    c.bezierCurveTo(44 * u, -32 * u, 50 * u, -30 * u, 52 * u, -26 * u);
    c.bezierCurveTo(53 * u, -21 * u, 46 * u, -18 * u, 38 * u, -18 * u);
    c.bezierCurveTo(28 * u, -16 * u, 16 * u, -16 * u, 14 * u, -24 * u);
    c.closePath();
    c.fill();
    c.stroke();
    // orelhas
    for (const [ex, ey] of [
      [22, -39],
      [29, -41],
    ]) {
      c.fillStyle = fur;
      c.beginPath();
      c.arc(ex * u, ey * u, 3.6 * u, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.fillStyle = "#C9BBA0";
      c.beginPath();
      c.arc(ex * u, ey * u, 1.6 * u, 0, Math.PI * 2);
      c.fill();
    }
    // nariz preto brilhante
    c.fillStyle = "#1B1B22";
    c.beginPath();
    c.ellipse(51 * u, -27 * u, 3.4 * u, 2.6 * u, 0.2, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.6)";
    c.beginPath();
    c.arc(50.5 * u, -28 * u, 0.8 * u, 0, Math.PI * 2);
    c.fill();
    // boca
    c.strokeStyle = "#3A3A44";
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(50 * u, -24.5 * u);
    c.quadraticCurveTo(46 * u, -20 * u, 42 * u, -21 * u);
    c.stroke();
    // olho
    if (air || this.star > 0) {
      c.strokeStyle = "#1B1B22";
      c.lineWidth = 1.6;
      c.beginPath();
      c.arc(36 * u, -31 * u, 2.2 * u, Math.PI * 1.1, Math.PI * 1.9);
      c.stroke();
    } else {
      c.fillStyle = "#1B1B22";
      c.beginPath();
      c.arc(36 * u, -31 * u, 1.9 * u, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#FFFFFF";
      c.beginPath();
      c.arc(36.6 * u, -31.7 * u, 0.7 * u, 0, Math.PI * 2);
      c.fill();
    }
    // gorro de Natal com pompom
    c.fillStyle = "#C1121F";
    c.beginPath();
    c.moveTo(17 * u, -36 * u);
    c.quadraticCurveTo(22 * u, -58 * u, 6 * u, -58 * u);
    c.lineTo(34 * u, -39 * u);
    c.closePath();
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.25)";
    c.beginPath();
    c.moveTo(19 * u, -38 * u);
    c.quadraticCurveTo(22 * u, -52 * u, 12 * u, -55 * u);
    c.lineTo(22 * u, -38 * u);
    c.fill();
    c.fillStyle = "#FFFFFF";
    c.beginPath();
    c.roundRect(15 * u, -41 * u, 21 * u, 5.5 * u, 2.7 * u);
    c.fill();
    c.beginPath();
    c.arc(6 * u, -58 * u, 3.8 * u, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // pó de neve levantado ao deslizar
    if (!air && this.running) {
      for (let k = 0; k < 2; k++) {
        if (Math.random() < 0.7)
          this.parts.push({
            x: x - 40 * u + Math.random() * 20 * u,
            y: this.ground - 2 * u,
            vx: -90 * u - Math.random() * 80 * u,
            vy: -40 * u - Math.random() * 90 * u,
            life: 0.45,
            max: 0.45,
            color: k ? "#FFFFFF" : "#DCEBFA",
            size: (1.5 + Math.random() * 2) * u,
          });
      }
      // brilho da pata da frente
      if (Math.random() < 0.15) this.parts.push({ x: x + 60 * u, y: this.ground - 3 * u, vx: -40 * u, vy: -50 * u, life: 0.3, max: 0.3, color: "#FFFFFF", size: 1.5 * u });
    }
  }
}
