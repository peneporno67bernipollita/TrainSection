import { render } from 'preact';
import '@fontsource/big-shoulders-display/latin-800';
import '@fontsource/ibm-plex-sans/latin-400';
import '@fontsource/ibm-plex-sans/latin-500';
import '@fontsource/ibm-plex-sans/latin-600';
import '@fontsource/ibm-plex-mono/latin-500';
import '@fontsource/ibm-plex-mono/latin-600';
import './styles.css';
import './lib/install.js';
import { App } from './app.jsx';
import * as store from './lib/store.js';
import { isNative, cleanCameraFiles } from './lib/files.js';
import { runBackHandler } from './ui.jsx';
import { initNav, goBack, canGoBack } from './nav.js';

initNav();
store.init();
if (import.meta.env.DEV) {
  window.__ts = { store };
  import('./lib/backup.js').then((m) => { window.__ts.backup = m; });
  import('./lib/ics.js').then((m) => { window.__ts.ics = m; });
}
render(<App />, document.getElementById('app'));

if (isNative()) {
  // Android back button: close an open dialog, else go back a screen, else
  // send the app to the background (like any other app).
  import('@capacitor/app').then(({ App: NativeApp }) => {
    NativeApp.addListener('backButton', () => {
      if (runBackHandler()) return;
      if (canGoBack()) goBack();
      else NativeApp.minimizeApp();
    });
  }).catch(() => {});
  // Capacitor picks the status bar icon colour once at start; follow the
  // phone when it switches between light and dark with the app open.
  import('@capacitor/core').then(({ SystemBars, SystemBarsStyle }) => {
    const dark = matchMedia('(prefers-color-scheme: dark)');
    const sync = () => SystemBars.setStyle({ style: dark.matches ? SystemBarsStyle.Dark : SystemBarsStyle.Light }).catch(() => {});
    dark.addEventListener('change', sync);
    sync();
  }).catch(() => {});
  cleanCameraFiles();
}

if (!isNative() && 'serviceWorker' in navigator && import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true })).catch(() => {});
}

if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persisted().then((p) => { if (!p) navigator.storage.persist(); }).catch(() => {});
}
