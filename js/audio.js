// Beeps (Web Audio) and spoken cues (Web Speech).
// Browsers, iOS especially, only allow sound after the user taps something,
// so unlock() is called from the "Start" button.

let ctx = null;
const prefs = { sound: true, voice: true };

export function setAudioPrefs(p) { Object.assign(prefs, p); }

export function unlock() {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    // a silent blip "wakes up" audio on iOS
    beep(440, 0.01, 0.0001);
  } catch { /* no audio available */ }
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
  }
}

export function beep(freq = 880, dur = 0.12, vol = 0.25) {
  if (!prefs.sound || !ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  const t = ctx.currentTime;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const tick = () => beep(880, 0.1);        // 3, 2, 1
export const go = () => beep(1320, 0.28, 0.3);   // start working
export const done = () => { beep(660, 0.15); setTimeout(() => beep(990, 0.25), 160); };

export function say(text) {
  if (!prefs.voice || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.05;
  speechSynthesis.speak(u);
}

export function hush() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
