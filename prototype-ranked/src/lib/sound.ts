/**
 * Tiny Web Audio synth — every sound is generated on the fly, so the game
 * ships zero audio files. The context is created lazily on the first sound
 * (always after a user gesture, so browsers allow it).
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;
let noiseBuf: AudioBuffer | null = null;

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

function audio(): AudioContext | null {
  if (!enabled || typeof window === 'undefined') return null;
  try {
    if (ctx && ctx.state === 'closed') {
      ctx = null;
      master = null;
      noiseBuf = null;
    }
    if (!ctx) {
      const AC =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 6;
      master = ctx.createGain();
      master.gain.value = 0.32;
      master.connect(comp);
      comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended' || (ctx.state as string) === 'interrupted') {
      void ctx.resume().catch(() => {});
    }
    return ctx;
  } catch {
    return null;
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && ctx && (ctx.state === 'suspended' || (ctx.state as string) === 'interrupted')) {
      void ctx.resume().catch(() => {});
    }
  });
}

interface ToneOpts {
  type?: OscillatorType;
  dur?: number;
  vol?: number;
  attack?: number;
  when?: number;
  slideTo?: number;
  filter?: number;
}

function tone(freq: number, o: ToneOpts = {}) {
  const c = audio();
  if (!c || !master) return;
  try {
    const { type = 'sine', dur = 0.15, vol = 0.3, attack = 0.006, when = 0, slideTo, filter } = o;
    const t0 = c.currentTime + when;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let node: AudioNode = osc;
    if (filter) {
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = filter;
      osc.connect(f);
      node = f;
    }
    node.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  } catch {
    // Audio scheduling failed or context in invalid state
  }
}

function noise(o: { dur?: number; vol?: number; when?: number; from?: number; to?: number; q?: number } = {}) {
  const c = audio();
  if (!c || !master) return;
  try {
    const { dur = 0.3, vol = 0.2, when = 0, from = 600, to = 3000, q = 0.8 } = o;
    if (!noiseBuf) {
      noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t0 = c.currentTime + when;
    const src = c.createBufferSource();
    src.buffer = noiseBuf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = q;
    f.frequency.setValueAtTime(from, t0);
    f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  } catch {
    // Noise scheduling failed or context in invalid state
  }
}

/** C-major pentatonic from C5 — correct answers climb it as the combo grows. */
const SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0];
const semis = (base: number, st: number) => base * Math.pow(2, st / 12);

export const sfx = {
  tap: () => tone(620, { type: 'triangle', dur: 0.07, vol: 0.12 }),
  correct: (combo = 1) => {
    const i = Math.min(Math.max(combo - 1, 0), SCALE.length - 3);
    tone(SCALE[i], { type: 'triangle', dur: 0.16, vol: 0.28 });
    tone(SCALE[i + 2], { type: 'sine', dur: 0.34, vol: 0.26, when: 0.075 });
    tone(SCALE[i + 2] * 2, { type: 'sine', dur: 0.3, vol: 0.05, when: 0.075 });
  },
  wrong: () => {
    tone(196, { type: 'sawtooth', dur: 0.32, vol: 0.14, slideTo: 98, filter: 900 });
    tone(147, { type: 'square', dur: 0.26, vol: 0.06, slideTo: 80, filter: 600, when: 0.03 });
  },
  tick: () => tone(1500, { type: 'square', dur: 0.03, vol: 0.035, filter: 3000 }),
  combo: (level = 1) => {
    const lift = Math.min(level, 5) * 2;
    [0, 4, 7, 12].forEach((st, k) => tone(semis(523.25, st + lift), { type: 'triangle', dur: 0.15, vol: 0.2, when: k * 0.055 }));
  },
  whoosh: () => noise({ dur: 0.22, vol: 0.07, from: 500, to: 2600 }),
  coin: () => {
    tone(987.77, { type: 'square', dur: 0.07, vol: 0.06, filter: 4000 });
    tone(1318.51, { type: 'square', dur: 0.2, vol: 0.06, when: 0.065, filter: 4000 });
  },
  count: () => tone(1150 + Math.random() * 250, { type: 'triangle', dur: 0.03, vol: 0.045 }),
  countdown: (final = false) => tone(final ? 880 : 440, { type: 'triangle', dur: final ? 0.4 : 0.18, vol: 0.25 }),
  slam: () => {
    noise({ dur: 0.35, vol: 0.12, from: 200, to: 1200 });
    tone(130.81, { type: 'sine', dur: 0.4, vol: 0.4, slideTo: 65 });
  },
  achievement: () => {
    [783.99, 1046.5, 1318.51, 1567.98].forEach((f, k) => tone(f, { type: 'triangle', dur: 0.22, vol: 0.16, when: k * 0.07 }));
  },
  promotion: () => {
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((f, k) => tone(f, { type: 'triangle', dur: 0.2, vol: 0.2, when: k * 0.09 }));
    chord.forEach((f) => tone(f, { type: 'sine', dur: 1.5, vol: 0.12, when: 0.42, attack: 0.05 }));
    chord.forEach((f) => tone(f * 1.003, { type: 'sawtooth', dur: 1.3, vol: 0.022, when: 0.42, attack: 0.08, filter: 2400 }));
    noise({ dur: 1.2, vol: 0.05, when: 0.4, from: 3000, to: 9000, q: 0.5 });
  },
  chestShake: (i = 0) => tone(80 + i * 14, { type: 'sine', dur: 0.1, vol: 0.35 }),
  chestOpen: () => {
    noise({ dur: 0.5, vol: 0.18, from: 300, to: 6000 });
    [659.25, 830.61, 987.77, 1318.51].forEach((f, k) => tone(f, { type: 'triangle', dur: 0.5, vol: 0.14, when: 0.05 + k * 0.06 }));
  },
};
