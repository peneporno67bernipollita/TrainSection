import { useEffect, useState } from 'preact/hooks';
import * as db from './db.js';
import { PRESET_ROUTINE, PRESET_ID } from '../data/preset.js';

const DEFAULT_SETTINGS = { checkinEvery: 14, gymTime: '18:00', postponed: null, shopping: {}, hideInstall: false, lastBackup: null };

const DEFAULTS = {
  profile: null,
  routines: [],
  activeRoutineId: null,
  sessions: [],
  current: null,
  checkins: [],
  weights: {},
  habits: {},
  settings: DEFAULT_SETTINGS
};

let state = { ...DEFAULTS, ready: false, storageError: null };
let version = 0;
const listeners = new Set();
const dirty = new Set();
let timer = null;

const clone = (o) => JSON.parse(JSON.stringify(o));

export const getState = () => state;

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  version++;
  listeners.forEach((fn) => fn(state));
}

export async function flush() {
  clearTimeout(timer);
  const keys = [...dirty];
  dirty.clear();
  for (const k of keys) {
    try {
      await db.saveKey(k, state[k]);
    } catch (e) {
      state = { ...state, storageError: 'No se ha podido guardar en el móvil. Libera espacio o exporta una copia.' };
      emit();
    }
  }
}

// patch: an object with top-level keys, or a function returning one.
export function update(patch) {
  const p = typeof patch === 'function' ? patch(state) : patch;
  if (!p) return;
  state = { ...state, ...p };
  Object.keys(p).forEach((k) => { if (db.KEYS.includes(k)) dirty.add(k); });
  clearTimeout(timer);
  timer = setTimeout(flush, 200);
  emit();
}

export function withPreset(routines) {
  const list = Array.isArray(routines) ? routines.slice() : [];
  const idx = list.findIndex((r) => r.id === PRESET_ID);
  if (idx < 0) list.unshift(clone(PRESET_ROUTINE));
  else if ((list[idx].version || 0) < PRESET_ROUTINE.version) list[idx] = clone(PRESET_ROUTINE);
  return list;
}

export async function init() {
  try {
    const data = await db.loadAll();
    const next = { ...DEFAULTS };
    for (const k of db.KEYS) if (data[k] !== undefined) next[k] = data[k];
    next.settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
    next.routines = withPreset(next.routines);
    if (!next.activeRoutineId || !next.routines.some((r) => r.id === next.activeRoutineId)) next.activeRoutineId = PRESET_ID;
    state = { ...state, ...next, ready: true };
    if (JSON.stringify(next.routines) !== JSON.stringify(data.routines)) { dirty.add('routines'); }
    if (next.activeRoutineId !== data.activeRoutineId) dirty.add('activeRoutineId');
    if (dirty.size) timer = setTimeout(flush, 50);
  } catch (e) {
    state = {
      ...state,
      ...DEFAULTS,
      routines: withPreset([]),
      activeRoutineId: PRESET_ID,
      ready: true,
      storageError: 'Este navegador no deja guardar datos (¿modo privado?). Lo que registres se perderá al cerrar.'
    };
  }
  emit();
}

export function useStore() {
  const [, force] = useState(0);
  const seen = version;
  useEffect(() => {
    const unsub = subscribe(() => force((x) => x + 1));
    // The state may have changed between render and subscription (e.g. the
    // database finished loading), so re-render if we missed an update.
    if (version !== seen) force((x) => x + 1);
    return unsub;
  }, []);
  return state;
}

export function activeRoutine(s = state) {
  return s.routines.find((r) => r.id === s.activeRoutineId) || s.routines[0];
}

if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', () => flush());
}
