/**
 * audioEngine.js
 *
 * Two responsibilities:
 * 1. Generate procedural ambient audio for built-in tracks (Web Audio API).
 *    No external files needed — audio is synthesized in the browser.
 * 2. Mix audio (from blob OR generated) with the canvas video stream
 *    when stitching reels, so the final reel actually has music.
 */

// ─── Shared AudioContext ──────────────────────────────────────────────────────

let _ctx = null;
const getCtx = () => {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
};

// ─── Preview state (singleton per session) ────────────────────────────────────

let _previewNodes = [];
let _previewSource = null;

export const stopPreview = () => {
  _previewNodes.forEach((n) => { try { n.stop?.(); n.disconnect?.(); } catch (_) {} });
  _previewNodes = [];
  if (_previewSource) { try { _previewSource.stop(); _previewSource.disconnect(); } catch (_) {} }
  _previewSource = null;
};

// ─── Built-in track generator ─────────────────────────────────────────────────

/**
 * Plays a procedural ambient preview for a built-in track ID.
 * Returns a stop function.
 *
 * Track personalities:
 *  morning_haze  — slow pad + high shimmer
 *  paper_piano   — soft sine "piano" notes
 *  golden_hour   — warm lofi drone + slight crackle
 *  open_field    — wide reverb drone + bird-like chirps
 *  quiet_strings — slow bowed string simulation
 *  rain_window   — filtered noise (rain) + low rumble
 *  worn_cassette — lofi tape hiss + warm bass tone
 *  dusk_guitar   — plucked string decay
 */
export const previewBuiltInTrack = (trackId) => {
  stopPreview();
  const ctx = getCtx();
  const nodes = [];

  const makeGain = (vol = 0.5) => {
    const g = ctx.createGain();
    g.gain.value = vol;
    g.connect(ctx.destination);
    nodes.push(g);
    return g;
  };

  const makeLFO = (freq, depth, target, param) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.value = depth;
    osc.connect(gain);
    gain.connect(param);
    osc.start();
    nodes.push(osc, gain);
  };

  const makeDrone = (freq, vol = 0.08, type = 'sine') => {
    const osc = ctx.createOscillator();
    const g = makeGain(vol);
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(g);
    osc.start();
    nodes.push(osc);
    return osc;
  };

  const makePad = (freqs, vol = 0.05) => {
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      const filt = ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = 800;
      const g = makeGain(vol);
      osc.type = 'sine';
      osc.frequency.value = f;
      osc.connect(filt);
      filt.connect(g);
      osc.start();
      nodes.push(osc, filt);
    });
  };

  const makeNoise = (vol = 0.04, color = 'pink') => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (color === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else {
        data[i] = white;
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = color === 'pink' ? 2000 : 800;
    const g = makeGain(vol);
    src.connect(filt);
    filt.connect(g);
    src.start();
    nodes.push(src, filt);
    return src;
  };

  const makePluck = (freq, delay = 0) => {
    const bufLen = Math.floor(ctx.sampleRate / freq);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    // Karplus-Strong: repeatedly apply low-pass to simulate decay
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 3000;
    const g = makeGain(0.15);
    src.connect(filt);
    filt.connect(g);
    src.start(ctx.currentTime + delay);
    nodes.push(src, filt);
  };

  switch (trackId) {
    case 'morning_haze': {
      makePad([110, 220, 330, 440], 0.04);
      makeLFO(0.1, 20, null, ctx.createGain().gain); // shimmer effect via pad
      makeNoise(0.015, 'pink');
      break;
    }
    case 'paper_piano': {
      // Soft "piano" notes repeating gently
      const notes = [261.63, 329.63, 392, 523.25]; // C4 E4 G4 C5
      const playNote = (freq, when) => {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        env.gain.setValueAtTime(0, when);
        env.gain.linearRampToValueAtTime(0.12, when + 0.01);
        env.gain.exponentialRampToValueAtTime(0.001, when + 2.5);
        osc.connect(env);
        env.connect(ctx.destination);
        osc.start(when);
        osc.stop(when + 2.5);
        nodes.push(osc, env);
      };
      let t = ctx.currentTime;
      [0, 2, 3.5, 5, 7, 8.5].forEach((offset, i) => {
        playNote(notes[i % notes.length], t + offset);
      });
      // Schedule repeating after 10s
      const interval = setInterval(() => {
        let t2 = ctx.currentTime;
        [0, 2, 3.5, 5].forEach((offset, i) => playNote(notes[i % notes.length], t2 + offset));
      }, 10000);
      nodes.push({ stop: () => clearInterval(interval), disconnect: () => {} });
      break;
    }
    case 'golden_hour': {
      makeDrone(82.41, 0.07, 'sawtooth'); // E2 warm bass
      makeDrone(164.81, 0.04, 'sine');
      makeNoise(0.025, 'pink');
      const filt = ctx.createBiquadFilter();
      filt.type = 'highpass';
      filt.frequency.value = 8000;
      makeGain(0.015).connect(filt); // tape hiss
      break;
    }
    case 'open_field': {
      makePad([73.42, 110, 146.83], 0.035); // D2 A2 D3
      makeNoise(0.012, 'pink');
      // Bird-like chirp
      const chirp = () => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        const freq = 2000 + Math.random() * 1000;
        o.frequency.setValueAtTime(freq, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(freq * 1.3, ctx.currentTime + 0.08);
        g.gain.setValueAtTime(0.06, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        o.connect(g); g.connect(ctx.destination);
        o.start(); o.stop(ctx.currentTime + 0.15);
        nodes.push(o, g);
      };
      chirp();
      const iv = setInterval(() => { if (Math.random() > 0.6) chirp(); }, 2500);
      nodes.push({ stop: () => clearInterval(iv), disconnect: () => {} });
      break;
    }
    case 'quiet_strings': {
      // Slow bowed string: sine + vibrato
      const base = makeDrone(220, 0.06, 'sine');
      makeLFO(0.2, 3, null, base.frequency);
      makeDrone(329.63, 0.03, 'sine');
      break;
    }
    case 'rain_window': {
      makeNoise(0.06, 'pink'); // rain
      makeDrone(55, 0.04, 'sine'); // low rumble
      const filt = ctx.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.value = 1200;
      filt.Q.value = 0.5;
      makeNoise(0.03, 'white');
      break;
    }
    case 'worn_cassette': {
      makeDrone(82.41, 0.07, 'triangle'); // E2 warm
      makeNoise(0.02, 'pink'); // tape hiss
      makeLFO(0.05, 1.5, null, ctx.createGain().gain);
      break;
    }
    case 'dusk_guitar': {
      // Plucked string sequence
      const guitarNotes = [196, 246.94, 293.66, 369.99]; // G3 B3 D4 F#4
      guitarNotes.forEach((f, i) => makePluck(f, i * 0.6));
      const iv2 = setInterval(() => {
        guitarNotes.forEach((f, i) => makePluck(f, i * 0.6));
      }, 4000);
      nodes.push({ stop: () => clearInterval(iv2), disconnect: () => {} });
      break;
    }
    default:
      makePad([220, 330], 0.04);
  }

  _previewNodes = nodes;
  return stopPreview;
};

// ─── Decode audio blob to AudioBuffer ────────────────────────────────────────

export const decodeAudioBlob = async (blob) => {
  const ctx = getCtx();
  const arrayBuffer = await blob.arrayBuffer();
  return ctx.decodeAudioData(arrayBuffer);
};

// ─── Generate audio buffer for built-in track (for reel mixing) ──────────────

/**
 * Returns a Float32Array PCM buffer for the built-in track,
 * suitable for encoding into the reel via createBufferSource.
 * Duration in seconds.
 */
export const renderBuiltInTrackBuffer = async (trackId, durationSeconds) => {
  const sampleRate = 44100;
  const offlineCtx = new OfflineAudioContext(2, sampleRate * durationSeconds, sampleRate);

  const makeOfflineGain = (vol) => {
    const g = offlineCtx.createGain();
    g.gain.value = vol;
    g.connect(offlineCtx.destination);
    return g;
  };

  const makeOfflineDrone = (freq, vol, type = 'sine') => {
    const osc = offlineCtx.createOscillator();
    const g = makeOfflineGain(vol);
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(g);
    osc.start(0);
    osc.stop(durationSeconds);
  };

  const makeOfflineNoise = (vol = 0.04) => {
    const bufferSize = sampleRate * durationSeconds;
    const buffer = offlineCtx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    const src = offlineCtx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filt = offlineCtx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 2000;
    const g = makeOfflineGain(vol);
    src.connect(filt);
    filt.connect(g);
    src.start(0);
  };

  switch (trackId) {
    case 'morning_haze':
      makeOfflineDrone(110, 0.04);
      makeOfflineDrone(220, 0.03);
      makeOfflineDrone(330, 0.02);
      makeOfflineNoise(0.015);
      break;
    case 'paper_piano': {
      const notes = [261.63, 329.63, 392, 523.25];
      [0, 2, 3.5, 5, 7, 8.5].forEach((t, i) => {
        const osc = offlineCtx.createOscillator();
        const env = offlineCtx.createGain();
        osc.frequency.value = notes[i % notes.length];
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(0.12, t + 0.01);
        env.gain.exponentialRampToValueAtTime(0.001, Math.min(t + 2.5, durationSeconds));
        osc.connect(env);
        env.connect(offlineCtx.destination);
        osc.start(t);
        osc.stop(Math.min(t + 2.5, durationSeconds));
      });
      break;
    }
    case 'golden_hour':
    case 'worn_cassette':
      makeOfflineDrone(82.41, 0.07, 'sawtooth');
      makeOfflineDrone(164.81, 0.04);
      makeOfflineNoise(0.025);
      break;
    case 'quiet_strings':
      makeOfflineDrone(220, 0.06);
      makeOfflineDrone(329.63, 0.03);
      makeOfflineDrone(440, 0.02);
      break;
    case 'rain_window':
      makeOfflineNoise(0.06);
      makeOfflineDrone(55, 0.04);
      break;
    case 'open_field':
      makeOfflineDrone(73.42, 0.035);
      makeOfflineDrone(110, 0.025);
      makeOfflineNoise(0.012);
      break;
    case 'dusk_guitar': {
      const gNotes = [196, 246.94, 293.66, 369.99];
      gNotes.forEach((f, i) => {
        const t = i * 0.6;
        if (t >= durationSeconds) return;
        const osc = offlineCtx.createOscillator();
        const env = offlineCtx.createGain();
        const filt = offlineCtx.createBiquadFilter();
        filt.type = 'lowpass';
        filt.frequency.value = 3000;
        osc.frequency.value = f;
        env.gain.setValueAtTime(0.15, t);
        env.gain.exponentialRampToValueAtTime(0.001, Math.min(t + 1.8, durationSeconds));
        osc.connect(filt);
        filt.connect(env);
        env.connect(offlineCtx.destination);
        osc.start(t);
        osc.stop(Math.min(t + 1.8, durationSeconds));
      });
      break;
    }
    default:
      makeOfflineDrone(220, 0.04);
      makeOfflineDrone(330, 0.03);
  }

  return offlineCtx.startRendering();
};

// ─── Create audio MediaStream from AudioBuffer ────────────────────────────────

/**
 * Decodes an audio blob (or uses a pre-decoded buffer) and returns
 * a MediaStream that can be combined with a canvas stream for MediaRecorder.
 *
 * Also returns a stop function to call when recording is done.
 */
export const createAudioStreamFromBuffer = (audioBuffer) => {
  const ctx = getCtx();
  const streamDest = ctx.createMediaStreamDestination();

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.75; // Music at 75% volume under video
  masterGain.connect(streamDest);

  // Fade in first 1s, fade out last 2s handled by caller stopping
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.75, ctx.currentTime + 1.0);

  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.loop = true;
  source.connect(masterGain);
  source.start(ctx.currentTime);

  const stop = (fadeOutDuration = 1.5) => {
    const now = ctx.currentTime;
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0, now + fadeOutDuration);
    setTimeout(() => {
      try { source.stop(); source.disconnect(); masterGain.disconnect(); } catch (_) {}
    }, fadeOutDuration * 1000 + 100);
  };

  return { stream: streamDest.stream, stop };
};

/**
 * Resolves a music source to an AudioBuffer:
 * - If musicBlob is provided (user-uploaded): decode it
 * - If trackId is a built-in ID: render it procedurally
 * - Otherwise: return null (no music)
 */
export const resolveAudioBuffer = async (trackId, musicBlob, durationSeconds) => {
  if (musicBlob) {
    try {
      return await decodeAudioBlob(musicBlob);
    } catch (e) {
      console.warn('Could not decode uploaded music:', e);
    }
  }
  if (trackId && trackId !== 'none' && trackId !== 'uploaded') {
    try {
      return await renderBuiltInTrackBuffer(trackId, durationSeconds);
    } catch (e) {
      console.warn('Could not render built-in track:', e);
    }
  }
  return null;
};