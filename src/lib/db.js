import { createStore, get, set, del, getMany, entries, clear } from 'idb-keyval';

const kv = createStore('trainsection', 'kv');
const photos = createStore('trainsection-photos', 'photos');

export const KEYS = ['profile', 'routines', 'activeRoutineId', 'sessions', 'current', 'checkins', 'weights', 'habits', 'settings'];

export async function loadAll() {
  const vals = await getMany(KEYS, kv);
  return Object.fromEntries(KEYS.map((k, i) => [k, vals[i]]));
}

export const saveKey = (k, v) => set(k, v, kv);

// Photos are stored as { type, buf } with an ArrayBuffer instead of a Blob:
// some Safari and WebView versions fail when writing Blobs to IndexedDB.
// Old entries saved as Blobs are still read.
async function pack(blob) {
  const buf = blob.arrayBuffer ? await blob.arrayBuffer() : await new Response(blob).arrayBuffer();
  return { type: blob.type || 'image/jpeg', buf };
}
const unpack = (v) => (v && v.buf ? new Blob([v.buf], { type: v.type }) : v);

export const savePhoto = async (id, blob) => set(id, await pack(blob), photos);
export const getPhoto = async (id) => unpack(await get(id, photos));
export const deletePhoto = (id) => del(id, photos);
export const allPhotos = async () => (await entries(photos)).map(([id, v]) => [id, unpack(v)]);

export async function wipe() {
  await clear(kv);
  await clear(photos);
}
