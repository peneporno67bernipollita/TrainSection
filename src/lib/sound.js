import { isNative } from './files.js';

let ctx = null;

// Must be called from a user gesture once so iOS lets us play sound later.
export function unlockAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch { /* audio not available */ }
}

export function beep(times = 3) {
  try {
    if (!ctx) unlockAudio();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    for (let i = 0; i < times; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = i === times - 1 ? 1175 : 880;
      gain.gain.setValueAtTime(0.0001, t0 + i * 0.28);
      gain.gain.exponentialRampToValueAtTime(0.35, t0 + i * 0.28 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.28 + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0 + i * 0.28);
      osc.stop(t0 + i * 0.28 + 0.24);
    }
  } catch { /* ignore */ }
  try { if (navigator.vibrate) navigator.vibrate([180, 90, 180, 90, 260]); } catch { /* ignore */ }
}

let lock = null;
export async function keepAwake(on) {
  if (isNative()) {
    // In the Android app a window flag keeps the screen on: unlike the Wake
    // Lock API it isn't dropped when the page is hidden, and old WebViews lack it.
    try {
      const { KeepAwake } = await import('@capacitor-community/keep-awake');
      await (on ? KeepAwake.keepAwake() : KeepAwake.allowSleep());
    } catch { /* plugin not available */ }
    return;
  }
  try {
    if (on && 'wakeLock' in navigator && document.visibilityState === 'visible') {
      if (!lock) {
        lock = await navigator.wakeLock.request('screen');
        lock.addEventListener('release', () => { lock = null; });
      }
    } else if (!on && lock) {
      await lock.release();
      lock = null;
    }
  } catch { lock = null; }
}
