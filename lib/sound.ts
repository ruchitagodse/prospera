let context: AudioContext | null = null;
let enabled = false;
const notes = [523.25, 587.33, 659.25, 783.99, 880, 783.99, 659.25, 587.33];
let noteIndex = 0;

export function enableSound(value: boolean) {
  enabled = value;
  try { localStorage.setItem("prospera-sound", value ? "on" : "off"); } catch {}
  if (value) {
    try { context ??= new AudioContext(); void context.resume().catch(() => {}); } catch { enabled = false; }
  }
}

export function playTone(frequency?: number) {
  if (!enabled || !context || document.hidden) return;
  // Resume within the gesture, including after a mobile browser suspends audio.
  if (context.state === "suspended") void context.resume().catch(() => {});
  const note = frequency ?? notes[noteIndex++ % notes.length];
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const overtone = context.createOscillator();
  const gain = context.createGain();
  const shimmer = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(note, now);
  overtone.type = "sine";
  overtone.frequency.setValueAtTime(note * 2, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(.035, now + .008);
  gain.gain.exponentialRampToValueAtTime(.0001, now + .4);
  shimmer.gain.setValueAtTime(.18, now);
  overtone.connect(shimmer); shimmer.connect(gain);
  oscillator.connect(gain); gain.connect(context.destination);
  oscillator.onended = () => { oscillator.disconnect(); overtone.disconnect(); shimmer.disconnect(); gain.disconnect(); };
  oscillator.start(now); overtone.start(now);
  oscillator.stop(now + .42); overtone.stop(now + .42);
}
