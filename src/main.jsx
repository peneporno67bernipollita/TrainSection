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
import { isNative } from './lib/files.js';

store.init();
if (import.meta.env.DEV) {
  window.__ts = { store };
  import('./lib/backup.js').then((m) => { window.__ts.backup = m; });
  import('./lib/ics.js').then((m) => { window.__ts.ics = m; });
}
render(<App />, document.getElementById('app'));

if (!isNative() && 'serviceWorker' in navigator && import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true })).catch(() => {});
}

if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persisted().then((p) => { if (!p) navigator.storage.persist(); }).catch(() => {});
}
