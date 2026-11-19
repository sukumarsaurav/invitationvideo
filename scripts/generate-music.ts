// Writes the background music in public/music/ (see src/templates/music.ts).
// Every sound is synthesised here (plucked strings, drums, bells, pads), so the tracks are our own
// work with no licence to track. Replace any of them with a licensed recording by dropping an .m4a
// with the same name into public/music/; this script is only needed to rebuild the originals.
// Run with: node scripts/generate-music.ts   (needs ffmpeg on the PATH for the AAC files)
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SR = 44100;
const OUT_DIR = fileURLToPath(new URL('../public/music/', import.meta.url));

// ---------- tiny synth toolkit ----------

/** Seeded random numbers, so every build of a track is identical. */
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 2 ** 32;
};

type Mix = { L: Float32Array; R: Float32Array; send: Float32Array };
const makeMix = (seconds: number): Mix => {
  const n = Math.ceil(seconds * SR);
  return { L: new Float32Array(n), R: new Float32Array(n), send: new Float32Array(n) };
};

/** Adds a mono sound at `at` seconds, panned (-1 left … 1 right), with some of it sent to the reverb. */
const add = (mix: Mix, sound: Float32Array, at: number, gain = 1, pan = 0, reverb = 0.2) => {
  const start = Math.round(at * SR);
  const a = ((pan + 1) * Math.PI) / 4;
  const gl = Math.cos(a) * gain;
  const gr = Math.sin(a) * gain;
  for (let i = 0; i < sound.length; i++) {
    const j = start + i;
    if (j < 0 || j >= mix.L.length) continue;
    mix.L[j] += sound[i] * gl;
    mix.R[j] += sound[i] * gr;
    mix.send[j] += sound[i] * gain * reverb;
  }
};

const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);

/** Plucked string (Karplus-Strong with a fractional delay, so high notes stay in tune). */
const pluck = (freq: number, seconds: number, { decay = 0.996, bright = 0.6, seed = 1 } = {}) => {
  const n = Math.ceil(seconds * SR);
  const y = new Float32Array(n);
  const period = SR / freq;
  const D = period - 0.5; // the averaging filter adds half a sample of delay
  const r = rng(seed + Math.round(freq * 100));
  const burst = Math.ceil(period);
  let lp = 0;
  const at = (k: number) => (k >= 0 ? y[k] : 0);
  for (let i = 0; i < n; i++) {
    let exc = 0;
    if (i < burst) {
      lp += bright * (r() * 2 - 1 - lp);
      exc = lp;
    }
    const pos = i - D;
    const i0 = Math.floor(pos);
    const f = pos - i0;
    const d1 = at(i0) * (1 - f) + at(i0 + 1) * f;
    const d2 = at(i0 - 1) * (1 - f) + at(i0) * f;
    y[i] = exc + decay * 0.5 * (d1 + d2);
  }
  // Short release so notes never click when cut.
  const rel = Math.min(n, Math.round(0.03 * SR));
  for (let i = 0; i < rel; i++) y[n - 1 - i] *= i / rel;
  return y;
};

/** A drum-like tone: a sine whose pitch falls from `f0` to `f1`, plus an optional click of noise. */
const thump = (f0: number, f1: number, seconds: number, { pitchFall = 25, ampFall = 8, noise = 0, seed = 3 } = {}) => {
  const n = Math.ceil(seconds * SR);
  const y = new Float32Array(n);
  const r = rng(seed);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = f1 + (f0 - f1) * Math.exp(-t * pitchFall);
    phase += (2 * Math.PI * f) / SR;
    const env = Math.exp(-t * ampFall) * Math.min(1, t / 0.002);
    y[i] = Math.sin(phase) * env + (r() * 2 - 1) * noise * Math.exp(-t * 80);
  }
  return y;
};

/** Band-passed noise burst (claps, the dhol's high side, tabla strokes). */
const noiseHit = (seconds: number, centre: number, q: number, fall: number, seed = 7) => {
  const n = Math.ceil(seconds * SR);
  const y = new Float32Array(n);
  const r = rng(seed);
  const w = (2 * Math.PI * centre) / SR;
  const alpha = Math.sin(w) / (2 * q);
  const b0 = alpha, b2 = -alpha, a0 = 1 + alpha, a1 = -2 * Math.cos(w), a2 = 1 - alpha;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < n; i++) {
    const x = (r() * 2 - 1) * Math.exp((-i / SR) * fall);
    const out = (b0 * x + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = out;
    y[i] = out;
  }
  return y;
};

/** Ringing tone with a few harmonics (tabla dayan, bells without FM). */
const ring = (freq: number, seconds: number, harmonics: number[], fall: number) => {
  const n = Math.ceil(seconds * SR);
  const y = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let s = 0;
    harmonics.forEach((g, h) => (s += g * Math.sin(2 * Math.PI * freq * (h + 1) * t)));
    y[i] = s * Math.exp(-t * fall) * Math.min(1, t / 0.003);
  }
  return y;
};

/** FM bell: bright at the strike, mellowing as it rings. */
const bell = (freq: number, seconds: number) => {
  const n = Math.ceil(seconds * SR);
  const y = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const index = 2.2 * Math.exp(-t * 3);
    y[i] = Math.sin(2 * Math.PI * freq * t + index * Math.sin(2 * Math.PI * freq * 3.5 * t)) * Math.exp(-t * 1.6) * Math.min(1, t / 0.002);
  }
  return y;
};

/** Soft pad: detuned saws, low-passed, with a slow swell. Like a harmonium when `reedy`. */
const pad = (freqs: number[], seconds: number, { cutoff = 1400, attack = 0.4, release = 0.6, reedy = false } = {}) => {
  const n = Math.ceil(seconds * SR);
  const y = new Float32Array(n);
  const k = 1 - Math.exp((-2 * Math.PI * cutoff) / SR);
  const voices = freqs.flatMap((f) => (reedy ? [f, f * 1.003] : [f * 0.997, f, f * 1.004]));
  const phases = voices.map((_, i) => (i * 0.37) % 1);
  let lp1 = 0, lp2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let s = 0;
    voices.forEach((f, v) => {
      phases[v] = (phases[v] + f / SR) % 1;
      s += reedy ? (phases[v] < 0.3 ? 1 : -0.43) : 2 * phases[v] - 1;
    });
    lp1 += k * (s - lp1);
    lp2 += k * (lp1 - lp2);
    const env = Math.min(1, t / attack) * Math.min(1, (seconds - t) / release);
    y[i] = (lp2 / voices.length) * Math.max(0, env);
  }
  return y;
};

/** Simple stereo reverb (Freeverb-style combs and all-passes) for the send bus. */
const reverb = (input: Float32Array, spread: number, size = 0.8) => {
  const out = new Float32Array(input.length);
  for (const d0 of [1116, 1188, 1277, 1356, 1422, 1491]) {
    const d = d0 + spread;
    const buf = new Float32Array(d);
    let idx = 0, store = 0;
    for (let i = 0; i < input.length; i++) {
      const y = buf[idx];
      store = y * 0.75 + store * 0.25;
      buf[idx] = input[i] + store * size;
      idx = (idx + 1) % d;
      out[i] += y / 6;
    }
  }
  for (const d0 of [556, 441, 341, 225]) {
    const d = d0 + spread;
    const buf = new Float32Array(d);
    let idx = 0;
    for (let i = 0; i < out.length; i++) {
      const b = buf[idx];
      const x = out[i];
      buf[idx] = x + b * 0.5;
      out[i] = b - x;
      idx = (idx + 1) % d;
    }
  }
  return out;
};

/** Reverb, fades and a -1 dB peak level, then a 16-bit stereo WAV. */
const finish = (mix: Mix, wet = 0.3, fadeOut = 2.5) => {
  const rl = reverb(mix.send, 0);
  const rr = reverb(mix.send, 23);
  const n = mix.L.length;
  let peak = 0;
  for (let i = 0; i < n; i++) {
    mix.L[i] += rl[i] * wet;
    mix.R[i] += rr[i] * wet;
    peak = Math.max(peak, Math.abs(mix.L[i]), Math.abs(mix.R[i]));
  }
  const g = 0.89 / (peak || 1);
  const fo = fadeOut * SR;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    const env = Math.min(1, i / (0.02 * SR), (n - i) / fo);
    const clamp = (v: number) => Math.max(-1, Math.min(1, v * g * env));
    buf.writeInt16LE(Math.round(clamp(mix.L[i]) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(clamp(mix.R[i]) * 32767), 46 + i * 4);
  }
  return buf;
};

// ---------- melody notation ----------
// One token per step: a MIDI note name like "D5", "F#4", "-" to hold the previous note, "_" for silence.
const NOTE: Record<string, number> = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const toMidi = (name: string) => {
  const m = /^([A-G]#?)(\d)$/.exec(name);
  if (!m) throw new Error(`Bad note ${name}`);
  return 12 * (Number(m[2]) + 1) + NOTE[m[1]];
};
type Note = { step: number; midi: number; length: number };
const parse = (line: string): Note[] => {
  const tokens = line.split(/\s+/).filter((x) => x && x !== '|');
  const notes: Note[] = [];
  tokens.forEach((tok, i) => {
    if (tok === '-') {
      if (notes.length) notes[notes.length - 1].length++;
    } else if (tok !== '_') notes.push({ step: i, midi: toMidi(tok), length: 1 });
  });
  return notes;
};

// ---------- tracks ----------

/** Santoor melody over tanpura and a gentle keherwa on tabla. For weddings and pujas. */
const santoor = () => {
  const beat = 60 / 84;
  const eighth = beat / 2;
  const mix = makeMix(32);
  const intro = 4 * beat;

  // Tanpura: Pa, Sa, Sa, low Sa, round and round under everything (Sa = D).
  const tanpura = [toMidi('A3'), toMidi('D4'), toMidi('D4'), toMidi('D3')];
  for (let t = 0, i = 0; t < 31; t += beat * 0.75, i++) {
    add(mix, pluck(midi(tanpura[i % 4]), 3.2, { decay: 0.9993, bright: 0.35, seed: i }), t, 0.32, i % 2 ? 0.35 : -0.35, 0.35);
  }

  // Opening roll on Sa.
  for (let i = 0; i < 12; i++) add(mix, pluck(midi(toMidi('D5')), 1.2, { decay: 0.993, bright: 0.9, seed: 50 + i }), i * (eighth / 2) + beat, 0.25 + i * 0.03, 0.15, 0.3);

  const melody = parse(`
    D5 - F#5 - A5 - B5 A5 | F#5 - E5 - D5 - - - | F#5 - A5 - B5 - D6 - | C#6 B5 A5 - F#5 - - -
    A5 B5 D6 E6 F#6 - E6 D6 | C#6 - B5 - A5 - - - | F#5 A5 B5 A5 F#5 E5 D5 C#5 | D5 - - - - - - -
    F#5 A5 B5 A5 F#5 E5 D5 C#5 | D5 - - - - - - -`);
  for (const n of melody) {
    const at = intro + n.step * eighth;
    const f = midi(n.midi);
    // Santoor players roll long notes with quick repeated strikes.
    const strikes = n.length >= 4 ? n.length * 2 : n.length >= 2 ? 2 : 1;
    const gap = n.length >= 4 ? eighth / 2 : eighth;
    for (let s = 0; s < strikes; s++) {
      const fadeIn = strikes > 2 ? 0.55 + 0.45 * Math.sin((Math.PI * s) / strikes) : 1;
      add(mix, pluck(f, 1.6, { decay: 0.994, bright: 0.85, seed: n.step * 10 + s }), at + s * gap, 0.5 * fadeIn, 0.15, 0.3);
    }
    add(mix, pluck(f / 2, 1.4, { decay: 0.993, bright: 0.6, seed: n.step + 99 }), at + 0.012, 0.15, -0.2, 0.3);
  }

  // Keherwa: dha ge na ti | na ka dhi na, softly.
  const dayan = ring(midi(toMidi('D5')), 0.8, [1, 0.5, 0.25, 0.12], 6);
  const bayan = thump(110, 78, 0.9, { pitchFall: 6, ampFall: 4.5 });
  const ti = noiseHit(0.12, 3200, 1.2, 50, 11);
  const bol: Array<'dha' | 'ge' | 'na' | 'ti' | 'ka' | 'dhi'> = ['dha', 'ge', 'na', 'ti', 'na', 'ka', 'dhi', 'na'];
  for (let t = intro, i = 0; t < 30; t += eighth, i++) {
    const b = bol[i % 8];
    if (b === 'dha' || b === 'dhi' || b === 'ge') add(mix, bayan, t, b === 'ge' ? 0.32 : 0.42, -0.1, 0.1);
    if (b === 'dha' || b === 'na') add(mix, dayan, t, 0.2, 0.1, 0.15);
    if (b === 'dhi') add(mix, ring(midi(toMidi('D5')) * 0.98, 0.6, [1, 0.7, 0.4], 8), t, 0.18, 0.1, 0.15);
    if (b === 'ti' || b === 'ka') add(mix, ti, t, 0.28, 0.2, 0.1);
  }
  return finish(mix, 0.35, 3);
};

/** Dhol chaal with a tumbi riff and harmonium chords. For baaraat, sangeet and big celebrations. */
const dhol = () => {
  const beat = 60 / 104;
  const six = beat / 4;
  const mix = makeMix(32);

  const dagga = thump(95, 52, 0.7, { pitchFall: 22, ampFall: 6.5, noise: 0.25, seed: 5 });
  const tilli = noiseHit(0.18, 1900, 2.2, 32, 9);
  const tilliTone = ring(430, 0.18, [1, 0.3], 26);
  // Bhangra chaal over two beats in sixteenths.
  const chaal = 'D _ _ T D _ T _';
  const fill = 'D T D T D T T T';
  const bars = Math.floor(30 / (beat * 2));
  for (let b = 0; b < bars; b++) {
    const pattern = (b % 8 === 7 ? fill : chaal).split(' ');
    pattern.forEach((p, i) => {
      const t = b * beat * 2 + i * six;
      if (p === 'D') add(mix, dagga, t, 0.85, -0.15, 0.1);
      if (p === 'T') {
        add(mix, tilli, t, 0.55, 0.25, 0.12);
        add(mix, tilliTone, t, 0.18, 0.25, 0.1);
      }
    });
  }

  // Chords G - C - D - G, a bar (4 beats) each, from bar 2.
  const start = 4 * beat;
  const chords = [['G3', 'B3', 'D4'], ['C4', 'E4', 'G4'], ['D4', 'F#4', 'A4'], ['G3', 'B3', 'D4']];
  for (let t = start, i = 0; t < 29; t += 4 * beat, i++) {
    const c = chords[i % 4].map((x) => midi(toMidi(x)));
    add(mix, pad(c, 4 * beat, { cutoff: 2200, attack: 0.05, release: 0.25, reedy: true }), t, 0.32, -0.25, 0.25);
    add(mix, thump(c[0] / 2, c[0] / 2, beat * 1.5, { pitchFall: 1, ampFall: 2.5 }), t, 0.45, 0, 0);
    add(mix, thump(c[0] / 2, c[0] / 2, beat * 1.5, { pitchFall: 1, ampFall: 2.5 }), t + 2 * beat, 0.35, 0, 0);
  }

  // Tumbi riff (sixteenths), answered an octave lower the second time.
  const riff = parse('D6 _ B5 _ D6 _ E6 D6 _ B5 A5 _ G5 _ A5 _ | B5 _ G5 _ B5 _ D6 B5 _ A5 G5 _ E5 _ G5 _');
  for (let t = start + 8 * beat, round = 0; t < 28; t += 8 * beat, round++) {
    for (const n of riff) {
      const f = midi(n.midi) / (round % 2 ? 2 : 1);
      add(mix, pluck(f, 0.5, { decay: 0.985, bright: 0.95, seed: n.step + round }), t + n.step * six, 0.42, 0.3, 0.2);
    }
  }
  return finish(mix, 0.22, 2.5);
};

/** Bright pop for birthdays: four-on-the-floor, claps, bass and a plucky hook. */
const party = () => {
  const beat = 60 / 116;
  const eighth = beat / 2;
  const mix = makeMix(32);
  const kick = thump(150, 45, 0.45, { pitchFall: 30, ampFall: 9, noise: 0.1 });
  const clap = (() => {
    const one = noiseHit(0.25, 1400, 1.4, 28, 21);
    const out = new Float32Array(one.length + 900);
    for (const off of [0, 300, 600]) for (let i = 0; i < one.length; i++) out[i + off] += one[i] * (off === 600 ? 1 : 0.6);
    return out;
  })();
  const hat = noiseHit(0.06, 9000, 0.9, 90, 31);
  const intro = 4 * beat;
  const chords = [['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4']];
  const lead = parse(`
    E5 G5 C6 G5 A5 G5 E5 - | D5 G5 B5 G5 A5 G5 D5 - | C5 E5 A5 E5 G5 E5 C5 - | F5 A5 C6 A5 G5 E5 D5 C5`);
  const total = 30;
  for (let t = 0, i = 0; t < total; t += beat, i++) {
    if (t >= intro || i % 2 === 0) add(mix, kick, t, 0.9, 0, 0.02);
    if (t >= intro && i % 2 === 1) add(mix, clap, t, 0.5, 0.05, 0.25);
    add(mix, hat, t + eighth, 0.22, 0.35, 0.05);
    add(mix, hat, t, 0.12, 0.35, 0.05);
  }
  for (let t = 0, bar = 0; t < total; t += 4 * beat, bar++) {
    const c = chords[bar % 4].map((x) => midi(toMidi(x)));
    add(mix, pad(c, 4 * beat, { cutoff: 1800, attack: 0.08, release: 0.2 }), t, 0.35, -0.3, 0.3);
    for (let e = 0; e < 8; e++) add(mix, pluck(c[0] / 2, 0.3, { decay: 0.98, bright: 0.4, seed: e }), t + e * eighth, 0.55, 0, 0);
  }
  for (let t = intro, round = 0; t < total - 1; t += 16 * beat, round++) {
    for (const n of lead) {
      add(mix, pluck(midi(n.midi), 0.6, { decay: 0.99, bright: 1, seed: n.step + round * 7 }), t + n.step * eighth, 0.45, 0.25, 0.3);
      if (round > 0) add(mix, bell(midi(n.midi) * 2, 0.5), t + n.step * eighth, 0.06, -0.3, 0.3);
    }
  }
  return finish(mix, 0.2, 2);
};

/** Slow bells over warm chords. For anniversaries, baby showers and gentle moments. */
const bells = () => {
  const beat = 60 / 72;
  const eighth = beat / 2;
  const mix = makeMix(32);
  const chords = [['F3', 'A3', 'C4', 'F4'], ['C3', 'G3', 'C4', 'E4'], ['D3', 'A3', 'D4', 'F4'], ['A#2', 'F3', 'A#3', 'D4']];
  const bars = 9;
  for (let bar = 0; bar < bars; bar++) {
    const t = bar * 4 * beat;
    const last = bar === bars - 1;
    const c = chords[last ? 0 : bar % 4].map((x) => midi(toMidi(x)));
    add(mix, pad(c, 4 * beat + 0.6, { cutoff: 900, attack: 0.9, release: 1.2 }), t, 0.5, 0, 0.45);
    add(mix, pluck(c[0] / 2, 3, { decay: 0.9985, bright: 0.3, seed: bar }), t, 0.5, -0.1, 0.3);
    if (last) {
      add(mix, bell(c[3] * 2, 4), t, 0.3, 0.2, 0.5);
      continue;
    }
    // Arpeggio up and back down across two octaves.
    const tones = [c[1], c[2], c[3], c[1] * 2, c[2] * 2, c[3] * 2, c[2] * 2, c[3]];
    tones.forEach((f, i) => add(mix, bell(f * 2, 2.5), t + i * eighth, bar < 1 ? 0.12 : 0.18, i % 2 ? 0.3 : -0.3, 0.5));
  }
  return finish(mix, 0.4, 3);
};

const TRACKS: Record<string, () => Buffer> = {
  'santoor-shubh': santoor,
  'dhol-baaraat': dhol,
  'party-pop': party,
  'golden-bells': bells,
};

mkdirSync(OUT_DIR, { recursive: true });
const only = process.argv[2];
for (const [id, make] of Object.entries(TRACKS)) {
  if (only && only !== id) continue;
  const wav = `${OUT_DIR}${id}.wav`;
  writeFileSync(wav, make());
  try {
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', `${OUT_DIR}${id}.m4a`]);
    rmSync(wav);
    console.log(`public/music/${id}.m4a`);
  } catch {
    console.log(`public/music/${id}.wav (install ffmpeg to make the .m4a the app uses)`);
  }
}
