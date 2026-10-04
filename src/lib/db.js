import { createStore, get, set, del, getMany, entries, clear } from 'idb-keyval';

const kv = createStore('trainsection', 'kv');
const photos = createStore('trainsection-photos', 'photos');

export const KEYS = ['profile', 'routines', 'activeRoutineId', 'sessions', 'current', 'checkins', 'weights', 'habits', 'settings'];

export async function loadAll() {
  const vals = await getMany(KEYS, kv);
  return Object.fromEntries(KEYS.map((k, i) => [k, vals[i]]));
}

export const saveKey = (k, v) => set(k, v, kv);
export const savePhoto = (id, blob) => set(id, blob, photos);
export const getPhoto = (id) => get(id, photos);
export const deletePhoto = (id) => del(id, photos);
export const allPhotos = () => entries(photos);

export async function wipe() {
  await clear(kv);
  await clear(photos);
}
