import santaSrc from "../assets/images/santa-sleigh.webp";
import { drawFace, SEATS } from "./store";


type Gift = { x: number; y: number; vy: number; vx: number; rot: number; color: string; landed: number };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: string };
type Pop = { text: string; x: number; y: number; life: number };

/** Cena animada: a família passeando no trenó do Papai Noel sobre o vilarejo. */
export class SleighScene {
  private ctx: CanvasRenderingContext2D;
  private W = 800;
  private H = 500;
  private dpr = 1;
  private raf = 0;
  private t = 0;
  private last = 0;
  private santa = new Image();
  private ready = false;
  private flakes = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 2.2 + 0.6, s: Math.random() * 0.5 + 0.3 }));
  private stars = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random() * 0.55, r: Math.random() * 1.4 + 0.4, p: Math.random() * 6 }));
  private gifts: Gift[] = [];
  private sparks: Spark[] = [];
  private pops: Pop[] = [];
  private loopT = 0;
  faces: HTMLImageElement[] = [];
  names: string[] = [];
  title = "";
  onBells?: () => void;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    this.santa.onload = () => (this.ready = true);
    this.santa.src = santaSrc;
    this.resize();
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = Math.max(280, r.width);
    this.H = Math.max(200, r.height);
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  start() {
    this.last = performance.now();
    cancelAnimationFrame(this.raf);
    const loop = (now: number) => {
      const dt = Math.min(0.04, (now - this.last) / 1000);
      this.last = now;
      this.t += dt;
      this.update(dt);
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.raf);
  }

  private get sleighW() {
    return Math.min(this.W * 0.62, this.H * 1.05);
  }

  /** Posição do trenó: atravessa a tela em ondas e recomeça. */
  private sleighPos() {
    const period = 9;
    const k = (this.loopT % period) / period;
    const w = this.sleighW;
    const x = -w * 0.9 + k * (this.W + w * 1.4);
    const y = this.H * 0.2 + Math.sin(k * Math.PI * 2) * this.H * 0.07;
    return { x, y, w, h: w * (576 / 1056) };
  }

  /** Toque na tela: sininhos, presentes caindo e "Ho ho ho!". */
  tap(px?: number, py?: number) {
    const s = this.sleighPos();
    const gx = s.x + s.w * 0.3;
    const gy = s.y + s.h * 0.55;
    const colors = ["#EF233C", "#2DC653", "#FFD166", "#4CC9F0", "#9B5DE5"];
    for (let i = 0; i < 4; i++) {
      this.gifts.push({ x: gx + (Math.random() - 0.5) * 40, y: gy, vy: -60 - Math.random() * 80, vx: (Math.random() - 0.5) * 80, rot: Math.random(), color: colors[(Math.random() * 5) | 0], landed: 0 });
    }
    const x = px ?? s.x + s.w * 0.5;
    const y = py ?? s.y;
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 60 + Math.random() * 180;
      this.sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.9, color: Math.random() < 0.5 ? "#FFD166" : "#FFFFFF" });
    }
    const words = ["Ho Ho Ho!", "Feliz Natal!", "🔔 Plim plim!", "✨ Magia!", "🎁 Presentes!"];
    this.pops.push({ text: words[(Math.random() * words.length) | 0], x, y: y - 10, life: 1.4 });
    this.onBells?.();
  }

  private update(dt: number) {
    this.loopT += dt;
    for (const f of this.flakes) {
      f.y += f.s * dt * 0.12;
      f.x += Math.sin(this.t + f.r * 3) * dt * 0.01;
      if (f.y > 1) {
        f.y = -0.02;
        f.x = Math.random();
      }
    }
    const ground = this.H * 0.86;
    for (const g of this.gifts) {
      if (g.landed > 0) {
        g.landed += dt;
        continue;
      }
      g.vy += 260 * dt; // caem devagar (paraquedinha de estrela)
      g.vy = Math.min(g.vy, 150);
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.rot += dt;
      if (g.y > ground) {
        g.y = ground;
        g.landed = 0.001;
      }
    }
    this.gifts = this.gifts.filter((g) => g.landed < 3);
    for (const s of this.sparks) {
      s.life -= dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 120 * dt;
    }
    this.sparks = this.sparks.filter((s) => s.life > 0);
    for (const p of this.pops) {
      p.life -= dt;
      p.y -= 30 * dt;
    }
    this.pops = this.pops.filter((p) => p.life > 0);
  }

  draw() {
    const c = this.ctx;
    const { W, H } = this;
    const sky = c.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#060B25");
    sky.addColorStop(0.55, "#16295C");
    sky.addColorStop(1, "#2E4D86");
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H);

    // aurora boreal
    for (let k = 0; k < 3; k++) {
      const base = H * (0.12 + k * 0.06);
      c.beginPath();
      c.moveTo(0, base);
      for (let x = 0; x <= W; x += 16) c.lineTo(x, base + Math.sin(x / (110 + k * 30) + this.t * (0.35 + k * 0.1)) * 16);
      c.lineTo(W, base + 46);
      c.lineTo(0, base + 46);
      c.closePath();
      c.fillStyle = ["rgba(45,198,83,0.17)", "rgba(76,201,240,0.13)", "rgba(155,93,229,0.11)"][k];
      c.fill();
    }
    // estrelas
    for (const s of this.stars) {
      c.globalAlpha = 0.45 + Math.sin(this.t * 2 + s.p) * 0.35;
      c.fillStyle = "#FFFFFF";
      c.beginPath();
      c.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
    // lua
    const mg = c.createRadialGradient(W * 0.84, H * 0.16, 4, W * 0.84, H * 0.16, H * 0.16);
    mg.addColorStop(0, "rgba(255,246,213,0.45)");
    mg.addColorStop(1, "rgba(255,246,213,0)");
    c.fillStyle = mg;
    c.beginPath();
    c.arc(W * 0.84, H * 0.16, H * 0.16, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#FFF6D5";
    c.beginPath();
    c.arc(W * 0.84, H * 0.16, H * 0.065, 0, Math.PI * 2);
    c.fill();

    // morros nevados
    this.hill(H * 0.74, H * 0.08, "#3F5F96", 0.004);
    this.hill(H * 0.8, H * 0.06, "#6E8FC4", 0.006);

    // vilarejo
    const ground = H * 0.86;
    const hs = Math.min(W, H * 1.6) / 16;
    for (let i = 0; i < 9; i++) {
      const x = (i + 0.5) * (W / 9);
      this.house(x, ground, hs * (0.9 + ((i * 7) % 3) * 0.12), i);
    }
    c.fillStyle = "#EAF3FF";
    c.fillRect(0, ground, W, H - ground);
    c.fillStyle = "#D2E2F5";
    c.beginPath();
    c.ellipse(W * 0.3, H, W * 0.5, H * 0.07, 0, 0, Math.PI * 2);
    c.fill();

    // presentes caindo / no chão
    for (const g of this.gifts) {
      c.save();
      c.globalAlpha = g.landed > 2 ? Math.max(0, 3 - g.landed) : 1;
      c.translate(g.x, g.y);
      if (!g.landed) {
        // estrelinha-paraquedas
        c.strokeStyle = "rgba(255,255,255,0.6)";
        c.beginPath();
        c.moveTo(-6, -8);
        c.lineTo(0, -22);
        c.lineTo(6, -8);
        c.stroke();
        c.fillStyle = "#FFD166";
        c.font = "14px serif";
        c.textAlign = "center";
        c.fillText("★", 0, -20);
      }
      c.rotate(g.landed ? 0 : Math.sin(g.rot * 3) * 0.3);
      c.fillStyle = g.color;
      c.fillRect(-8, -8, 16, 16);
      c.fillStyle = "#FFFFFF";
      c.fillRect(-2, -8, 4, 16);
      c.fillRect(-8, -2, 16, 4);
      c.restore();
    }

    // trenó com a família
    const s = this.sleighPos();
    // rastro de brilho
    for (let i = 0; i < 26; i++) {
      const k = i / 26;
      c.globalAlpha = (1 - k) * 0.7;
      c.fillStyle = i % 2 ? "#FFD166" : "#FFF1C1";
      c.beginPath();
      c.arc(s.x + s.w * 0.1 - k * s.w * 0.6, s.y + s.h * 0.82 + Math.sin(this.t * 7 + i) * 5 + k * 18, (3.4 - k * 2.4) * (s.w / 500), 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
    c.save();
    c.translate(s.x + s.w / 2, s.y + s.h / 2);
    c.rotate(Math.sin(this.loopT * 0.7) * 0.05);
    if (this.ready) c.drawImage(this.santa, -s.w / 2, -s.h / 2, s.w, s.h);
    const r = s.w * 0.052;
    this.faces.slice(0, SEATS.length).forEach((img, i) => {
      const seat = SEATS[i];
      const fx = -s.w / 2 + seat.x * s.w;
      const fy = -s.h / 2 + seat.y * s.h + Math.sin(this.t * 4 + i) * r * 0.08;
      // corpinho de casaco vermelho
      c.fillStyle = "#C1121F";
      c.beginPath();
      c.ellipse(fx, fy + r * 1.05, r * 0.85, r * 0.6, 0, Math.PI, 0);
      c.fill();
      drawFace(c, img, fx, fy, r, this.names[i], true);
    });
    c.restore();

    // faíscas e palavras
    for (const p of this.sparks) {
      c.globalAlpha = Math.max(0, p.life);
      c.fillStyle = p.color;
      c.beginPath();
      c.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
    for (const p of this.pops) {
      c.globalAlpha = Math.min(1, p.life);
      c.font = `bold ${Math.max(16, W / 28)}px system-ui, sans-serif`;
      c.textAlign = "center";
      c.lineWidth = 5;
      c.strokeStyle = "rgba(11,19,43,0.75)";
      c.strokeText(p.text, p.x, p.y);
      c.fillStyle = "#FFD166";
      c.fillText(p.text, p.x, p.y);
    }
    c.globalAlpha = 1;

    // neve na frente
    c.fillStyle = "rgba(255,255,255,0.9)";
    for (const f of this.flakes) {
      c.beginPath();
      c.arc(f.x * W, f.y * H, f.r, 0, Math.PI * 2);
      c.fill();
    }

    // título e rodapé
    const fs = Math.max(16, Math.min(W / 22, 34));
    c.textAlign = "center";
    c.font = `bold ${fs}px Georgia, "Times New Roman", serif`;
    c.lineWidth = 5;
    c.strokeStyle = "rgba(6,11,37,0.8)";
    const title = this.title || "Nossa família no trenó do Papai Noel";
    c.strokeText(title, W / 2, fs * 1.5);
    c.fillStyle = "#FFD166";
    c.fillText(title, W / 2, fs * 1.5);
    c.font = `${fs * 0.55}px system-ui, sans-serif`;
    c.fillStyle = "rgba(11,19,43,0.75)";
    c.fillText(`Natal ${new Date().getFullYear()} ✨ Carta Mágica`, W / 2, H - fs * 0.45);
  }

  private hill(y: number, amp: number, color: string, freq: number) {
    const c = this.ctx;
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(0, this.H);
    for (let x = 0; x <= this.W; x += 10) c.lineTo(x, y - Math.sin(x * freq + 1) * amp - Math.sin(x * freq * 2.3) * amp * 0.4);
    c.lineTo(this.W, this.H);
    c.closePath();
    c.fill();
  }

  private house(x: number, ground: number, s: number, i: number) {
    const c = this.ctx;
    const colors = ["#8D3B3B", "#3B5B8D", "#3B7A57", "#6B4E8D", "#8D6B3B"];
    const w = s * 1.6;
    const h = s * 1.15;
    c.fillStyle = colors[i % colors.length];
    c.fillRect(x - w / 2, ground - h, w, h);
    // telhado nevado
    c.fillStyle = "#F4F8FF";
    c.beginPath();
    c.moveTo(x - w * 0.62, ground - h + 2);
    c.lineTo(x, ground - h - s * 0.75);
    c.lineTo(x + w * 0.62, ground - h + 2);
    c.closePath();
    c.fill();
    // chaminé e fumaça
    c.fillStyle = "#7A3B2E";
    c.fillRect(x + w * 0.2, ground - h - s * 0.62, s * 0.22, s * 0.4);
    for (let k = 0; k < 3; k++) {
      const ph = (this.t * 0.6 + k / 3 + i * 0.13) % 1;
      c.globalAlpha = (1 - ph) * 0.35;
      c.fillStyle = "#E6EEF8";
      c.beginPath();
      c.arc(x + w * 0.31 + Math.sin(ph * 6) * 4, ground - h - s * 0.7 - ph * s * 1.2, s * 0.12 + ph * s * 0.15, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
    // janelas acesas piscando
    const lit = 0.75 + Math.sin(this.t * 2 + i) * 0.25;
    c.fillStyle = `rgba(255,209,102,${lit})`;
    c.fillRect(x - w * 0.32, ground - h * 0.7, s * 0.34, s * 0.3);
    c.fillRect(x + w * 0.08, ground - h * 0.7, s * 0.34, s * 0.3);
    c.fillStyle = "#3A2418";
    c.fillRect(x - s * 0.15, ground - s * 0.48, s * 0.3, s * 0.48);
  }

  /** Foto do momento (PNG). */
  snapshot(): Promise<Blob> {
    return new Promise((res, rej) => this.canvas.toBlob((b) => (b ? res(b) : rej(new Error("png"))), "image/png"));
  }

  /** Grava um vídeo curto da cena (quando o navegador permite). */
  static videoMime() {
    if (typeof MediaRecorder === "undefined" || !("captureStream" in HTMLCanvasElement.prototype)) return null;
    const opts = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm"];
    return opts.find((m) => MediaRecorder.isTypeSupported(m)) ?? null;
  }

  record(seconds: number, audio?: MediaStream): Promise<{ blob: Blob; ext: string }> {
    const mime = SleighScene.videoMime();
    if (!mime) return Promise.reject(new Error("sem gravação"));
    const stream = (this.canvas as HTMLCanvasElement & { captureStream: (fps: number) => MediaStream }).captureStream(30);
    audio?.getAudioTracks().forEach((t) => stream.addTrack(t));
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    return new Promise((res) => {
      rec.onstop = () => res({ blob: new Blob(chunks, { type: mime }), ext: mime.includes("mp4") ? "mp4" : "webm" });
      rec.start(200);
      // começa o passeio do início para o vídeo ficar completo
      this.loopT = 0;
      setTimeout(() => rec.stop(), seconds * 1000);
    });
  }
}
