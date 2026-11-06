import { MUTE_KEY } from "./constants.js";

function readMuted(storage) {
  try {
    return storage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function createAudio(storage) {
  const AudioCtx = typeof window !== "undefined"
    ? window.AudioContext || window.webkitAudioContext
    : null;
  let context = null;
  let noiseBuffer = null;
  let muted = readMuted(storage);

  function ac() {
    if (!AudioCtx) return null;
    if (!context) context = new AudioCtx();
    return context;
  }

  function noise() {
    const ctx = ac();
    if (!ctx) return null;
    if (!noiseBuffer) {
      noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.3), ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    }
    return noiseBuffer;
  }

  function tone(freq, dur, type, gain, slide) {
    const ctx = ac();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t + dur);
    amp.gain.setValueAtTime(gain, t);
    amp.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function rustle(dur, gain) {
    const ctx = ac();
    const buffer = noise();
    if (!ctx || !buffer) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1400;
    filter.Q.value = 0.7;
    const amp = ctx.createGain();
    const t = ctx.currentTime;
    amp.gain.setValueAtTime(gain, t);
    amp.gain.exponentialRampToValueAtTime(0.001, t + dur);
    source.connect(filter);
    filter.connect(amp);
    amp.connect(ctx.destination);
    source.start(t);
    source.stop(t + dur);
  }

  const players = {
    shoot() {
      tone(240, 0.09, "sine", 0.05, 520);
    },
    swish() {
      rustle(0.22, 0.09);
    },
    make() {
      rustle(0.14, 0.06);
      tone(320, 0.1, "sine", 0.04, 180);
    },
    bounce() {
      tone(150, 0.07, "sine", 0.06, 70);
    },
    rim() {
      tone(740, 0.06, "triangle", 0.05, 420);
    },
    board() {
      tone(170, 0.09, "sine", 0.07, 90);
    },
    buzzer() {
      tone(150, 0.38, "sawtooth", 0.03, 110);
      tone(196, 0.38, "square", 0.015, 140);
    },
    click() {
      tone(540, 0.04, "sine", 0.03, 540);
    },
  };

  return {
    get muted() {
      return muted;
    },
    resume() {
      const ctx = ac();
      if (ctx && ctx.state === "suspended") return ctx.resume();
      return Promise.resolve();
    },
    toggle() {
      muted = !muted;
      try {
        storage.setItem(MUTE_KEY, muted ? "1" : "0");
      } catch {
        // The game still runs if the browser refuses storage.
      }
      return muted;
    },
    play(name) {
      if (muted) return;
      const play = players[name];
      if (!play) return;
      try {
        play();
      } catch {
        // Ignore audio graph failures so a shot is never blocked.
      }
    },
  };
}
