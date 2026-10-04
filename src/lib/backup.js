import * as db from './db.js';
import { getState, flush, init } from './store.js';

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

export async function buildBackup() {
  await flush();
  const s = getState();
  const data = {};
  for (const k of db.KEYS) data[k] = s[k];
  const photos = {};
  for (const [id, blob] of await db.allPhotos()) {
    if (blob instanceof Blob) photos[id] = await blobToDataUrl(blob);
  }
  return JSON.stringify({ app: 'TrainSection', v: 1, exportedAt: new Date().toISOString(), data, photos });
}

export async function restoreBackup(text) {
  let obj;
  try { obj = JSON.parse(text); } catch { throw new Error('El archivo no es una copia de TrainSection.'); }
  if (!obj || obj.app !== 'TrainSection' || obj.v !== 1 || !obj.data) throw new Error('El archivo no es una copia de TrainSection.');
  await db.wipe();
  for (const k of db.KEYS) {
    if (obj.data[k] !== undefined && obj.data[k] !== null) await db.saveKey(k, obj.data[k]);
  }
  for (const [id, url] of Object.entries(obj.photos || {})) {
    const blob = await (await fetch(url)).blob();
    await db.savePhoto(id, blob);
  }
  await init();
}
