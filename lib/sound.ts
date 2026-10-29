import { motion } from "@/config/motion";

let context: AudioContext | null = null;
let enabled = false;
let lastCue = -Infinity;

export function enableSound(value: boolean) {
  enabled = value;
  try { localStorage.setItem("prospera-sound", value ? "on" : "off"); } catch {}
  if (value) {
    try { context ??= new AudioContext(); void context.resume().catch(() => {}); } catch { enabled = false; }
  }
}

export function playTone(frequency = 660) {
  if (!enabled || !context || document.hidden || performance.now() - lastCue < motion.cueGapMs) return;
  lastCue = performance.now();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);
  gain.gain.setValueAtTime(.025, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .28);
  oscillator.connect(gain); gain.connect(context.destination);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  oscillator.start(); oscillator.stop(context.currentTime + .3);
}
