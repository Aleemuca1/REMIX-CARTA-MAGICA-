/**
 * Caixinha de música de Natal gerada no navegador (Web Audio API).
 * Todas as melodias são de domínio público:
 *  - Jingle Bells (James Lord Pierpont, 1857)
 *  - We Wish You a Merry Christmas (tradicional inglesa, séc. XVI)
 *  - Noite Feliz / Silent Night (Franz Gruber, 1818)
 * Nenhum arquivo de áudio é baixado — o som é sintetizado na hora.
 */

type Note = [midi: number | null, beats: number];

export type Song = { title: string; bpm: number; bells: boolean; notes: Note[] };

// Atalhos de notas (MIDI)
const C4 = 60, D4 = 62, E4 = 64, F4 = 65, G4 = 67, A4 = 69, B4 = 71;
const C5 = 72, D5 = 74, E5 = 76, F5 = 77;

const jingleBells: Note[] = [
  [E4, 1], [E4, 1], [E4, 2],
  [E4, 1], [E4, 1], [E4, 2],
  [E4, 1], [G4, 1], [C4, 1.5], [D4, 0.5],
  [E4, 4],
  [F4, 1], [F4, 1], [F4, 1.5], [F4, 0.5],
  [F4, 1], [E4, 1], [E4, 1], [E4, 0.5], [E4, 0.5],
  [E4, 1], [D4, 1], [D4, 1], [E4, 1],
  [D4, 2], [G4, 2],
  [E4, 1], [E4, 1], [E4, 2],
  [E4, 1], [E4, 1], [E4, 2],
  [E4, 1], [G4, 1], [C4, 1.5], [D4, 0.5],
  [E4, 4],
  [F4, 1], [F4, 1], [F4, 1.5], [F4, 0.5],
  [F4, 1], [E4, 1], [E4, 1], [E4, 0.5], [E4, 0.5],
  [G4, 1], [G4, 1], [F4, 1], [D4, 1],
  [C4, 4],
  [null, 2],
];

const weWish: Note[] = [
  [G4, 1],
  [C5, 1], [C5, 0.5], [D5, 0.5], [C5, 0.5], [B4, 0.5],
  [A4, 1], [A4, 1], [A4, 1],
  [D5, 1], [D5, 0.5], [E5, 0.5], [D5, 0.5], [C5, 0.5],
  [B4, 1], [G4, 1], [G4, 1],
  [E5, 1], [E5, 0.5], [F5, 0.5], [E5, 0.5], [D5, 0.5],
  [C5, 1], [A4, 1], [G4, 0.5], [G4, 0.5],
  [A4, 1], [D5, 1], [B4, 1],
  [C5, 3],
  [null, 2],
];

const silentNight: Note[] = [
  [G4, 1.5], [A4, 0.5], [G4, 1], [E4, 3],
  [G4, 1.5], [A4, 0.5], [G4, 1], [E4, 3],
  [D5, 2], [D5, 1], [B4, 3],
  [C5, 2], [C5, 1], [G4, 3],
  [A4, 2], [A4, 1], [C5, 1.5], [B4, 0.5], [A4, 1],
  [G4, 1.5], [A4, 0.5], [G4, 1], [E4, 3],
  [A4, 2], [A4, 1], [C5, 1.5], [B4, 0.5], [A4, 1],
  [G4, 1.5], [A4, 0.5], [G4, 1], [E4, 3],
  [D5, 2], [D5, 1], [F5, 1.5], [D5, 0.5], [B4, 1],
  [C5, 3], [E5, 3],
  [C5, 1.5], [G4, 0.5], [E4, 1], [G4, 1.5], [F4, 0.5], [D4, 1],
  [C4, 6],
  [null, 2],
];

export const SONGS: Song[] = [
  { title: "Jingle Bells", bpm: 176, bells: true, notes: jingleBells },
  { title: "We Wish You a Merry Christmas", bpm: 150, bells: true, notes: weWish },
  { title: "Noite Feliz", bpm: 96, bells: false, notes: silentNight },
];

const freq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export class ChristmasMusicBox {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private fx: GainNode | null = null;
  private timer: number | null = null;
  private songIdx = 0;
  private noteIdx = 0;
  private nextTime = 0;
  private beatCount = 0;
  private noiseBuf: AudioBuffer | null = null;
  playing = false;
  onSongChange?: (title: string) => void;

  private ensure() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.0001;
    this.master.connect(this.ctx.destination);

    // "Reverb" simples com eco suave
    const delay = this.ctx.createDelay();
    delay.delayTime.value = 0.23;
    const fb = this.ctx.createGain();
    fb.gain.value = 0.28;
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2600;
    this.fx = this.ctx.createGain();
    this.fx.gain.value = 0.35;
    this.fx.connect(delay);
    delay.connect(lp);
    lp.connect(fb);
    fb.connect(delay);
    lp.connect(this.master);

    // ruído para os guizos
    const len = this.ctx.sampleRate * 0.3;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  /** Toca um "plim" de sino (usado também pelos enfeites clicáveis). */
  chime(midi = 84, when?: number, vol = 0.22) {
    this.ensure();
    const ctx = this.ctx!;
    if (ctx.state === "suspended") ctx.resume();
    const t = when ?? ctx.currentTime;
    const f = freq(midi);
    // som de caixinha de música: fundamental + harmônicos que somem rápido
    [
      [1, vol, 1.6],
      [2.01, vol * 0.35, 0.6],
      [3.98, vol * 0.12, 0.25],
    ].forEach(([mult, v, dur]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f * mult;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(this.master!);
      g.connect(this.fx!);
      o.start(t);
      o.stop(t + dur + 0.05);
    });
    if (!this.playing && this.master) {
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setValueAtTime(0.9, t);
    }
  }

  private jingle(t: number, vol = 0.06) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    src.connect(hp);
    hp.connect(g);
    g.connect(this.master!);
    src.start(t);
    src.stop(t + 0.2);
  }

  private bass(midi: number, t: number, dur: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = freq(midi - 24);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.min(dur, 1.2));
    o.connect(g);
    g.connect(this.master!);
    o.start(t);
    o.stop(t + dur + 0.1);
  }

  private schedule = () => {
    if (!this.ctx) return;
    const song = SONGS[this.songIdx];
    const spb = 60 / song.bpm;
    while (this.nextTime < this.ctx.currentTime + 0.25) {
      const [midi, beats] = song.notes[this.noteIdx];
      const dur = beats * spb;
      if (midi !== null) {
        this.chime(midi + 12, this.nextTime, 0.2);
        if (beats >= 1) this.bass(midi, this.nextTime, dur);
      }
      if (song.bells) {
        // guizos no tempo
        const startBeat = this.beatCount;
        for (let b = Math.ceil(startBeat); b < startBeat + beats; b++) {
          this.jingle(this.nextTime + (b - startBeat) * spb, b % 2 === 0 ? 0.07 : 0.04);
        }
      }
      this.beatCount += beats;
      this.nextTime += dur;
      this.noteIdx++;
      if (this.noteIdx >= song.notes.length) {
        this.noteIdx = 0;
        this.beatCount = 0;
        this.songIdx = (this.songIdx + 1) % SONGS.length;
        this.onSongChange?.(SONGS[this.songIdx].title);
        break;
      }
    }
  };

  get currentTitle() {
    return SONGS[this.songIdx].title;
  }

  async play() {
    this.ensure();
    const ctx = this.ctx!;
    if (ctx.state === "suspended") await ctx.resume();
    this.playing = true;
    this.nextTime = ctx.currentTime + 0.1;
    this.master!.gain.cancelScheduledValues(ctx.currentTime);
    this.master!.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.master!.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + 0.6);
    this.onSongChange?.(this.currentTitle);
    if (this.timer) clearInterval(this.timer);
    this.timer = window.setInterval(this.schedule, 60);
  }

  pause() {
    if (!this.ctx) return;
    this.playing = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    const t = this.ctx.currentTime;
    this.master!.gain.cancelScheduledValues(t);
    this.master!.gain.setValueAtTime(this.master!.gain.value, t);
    this.master!.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  }

  next() {
    this.songIdx = (this.songIdx + 1) % SONGS.length;
    this.noteIdx = 0;
    this.beatCount = 0;
    if (this.ctx) this.nextTime = this.ctx.currentTime + 0.3;
    this.onSongChange?.(this.currentTitle);
  }
}

/** Instância única compartilhada pela página. */
export const musicBox = new ChristmasMusicBox();
