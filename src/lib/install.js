import { isNative } from './files.js';

// Android/desktop Chrome fire beforeinstallprompt; iOS needs manual steps.
let deferred = null;
const listeners = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    listeners.forEach((fn) => fn());
  });
  window.addEventListener('appinstalled', () => { deferred = null; listeners.forEach((fn) => fn()); });
}

export const onInstallChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

export function isStandalone() {
  return isNative() || window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const canPromptInstall = () => !!deferred;

export async function promptInstall() {
  if (!deferred) return false;
  deferred.prompt();
  const choice = await deferred.userChoice.catch(() => null);
  deferred = null;
  listeners.forEach((fn) => fn());
  return choice && choice.outcome === 'accepted';
}
