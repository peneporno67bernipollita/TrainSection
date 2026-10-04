import LZString from 'lz-string';
import { EXERCISES, EXERCISE_IDS } from '../data/exercises.js';
import { PLATES } from '../data/preset.js';

// Public address of the web app, used in share links so they work from any
// phone (the Android app itself runs on a local origin).
export const PUBLIC_URL = 'https://peneporno67bernipollita.github.io/TrainSection/';

// Compact format (v2): arrays instead of objects and library exercises as
// their index in EXERCISE_IDS, so the link and the QR stay small.
export function encodeRoutine(r) {
  const days = r.days.map((d) => [
    d.name, d.short || '', d.focus || '', Math.max(0, PLATES.indexOf(d.plate)), d.type === 'leg' ? 1 : 0, d.time || 0,
    d.items.map((it) => {
      const idx = it.custom ? -1 : EXERCISE_IDS.indexOf(it.ex);
      const ref = idx >= 0 ? idx : ['c', it.custom?.name || exName(it), it.custom?.video || '', it.custom?.muscle || ''];
      const row = [ref, it.sets, it.min, it.max, it.rir || '', it.rest || 90, it.ss || 0, it.perSide ? 1 : 0, it.note || 0];
      while (row.length > 4 && !row[row.length - 1]) row.pop();
      return row;
    })
  ]);
  return LZString.compressToEncodedURIComponent(JSON.stringify([2, r.name, days]));
}

const exName = (it) => EXERCISES[it.ex]?.name || 'Ejercicio';

export function shareLink(code) {
  return PUBLIC_URL + '#/importar/' + code;
}

// Accepts a full link, a link fragment or the bare code.
export function extractCode(text) {
  if (!text) return '';
  const s = String(text).trim();
  const m = s.match(/#\/importar\/([A-Za-z0-9+\-$_]+)/);
  if (m) return m[1];
  return s.replace(/\s+/g, '');
}

const clampInt = (v, lo, hi, dflt) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;
};
const str = (v, max = 160) => String(v ?? '').slice(0, max);
const rid = () => Math.random().toString(36).slice(2, 8);

function buildItem(ref, sets, min, max, rir, rest, ss, perSide, note) {
  const base = {
    sets: clampInt(sets, 1, 10, 3), min: clampInt(min, 1, 100, 8), max: clampInt(max, 1, 100, 12),
    rir: str(rir, 10), rest: clampInt(rest, 15, 600, 90)
  };
  if (ss) base.ss = str(ss, 2);
  if (perSide) base.perSide = true;
  if (note) base.note = str(note, 200);
  if (base.max < base.min) base.max = base.min;
  if (Array.isArray(ref) && ref[0] === 'c') {
    const video = /^[\w-]{11}$/.test(ref[2] || '') ? ref[2] : '';
    return { ...base, ex: 'custom:' + rid(), custom: { name: str(ref[1], 60) || 'Ejercicio', video, muscle: str(ref[3], 20) } };
  }
  const id = typeof ref === 'number' ? EXERCISE_IDS[ref] : typeof ref === 'string' ? ref : null;
  if (id && EXERCISES[id]) return { ...base, ex: id };
  return { ...base, ex: 'custom:' + rid(), custom: { name: 'Ejercicio desconocido', video: '', muscle: '' } };
}

export function decodeRoutine(code) {
  const json = LZString.decompressFromEncodedURIComponent(code);
  if (!json) throw new Error('El código no es válido o está incompleto. Copia el enlace entero.');
  let data;
  try { data = JSON.parse(json); } catch { throw new Error('El código está dañado. Pide que te lo vuelvan a enviar.'); }
  const now = Date.now().toString(36);
  let name;
  let days;
  if (Array.isArray(data) && data[0] === 2 && Array.isArray(data[2])) {
    name = data[1];
    days = data[2].map((d) => ({ n: d[0], s: d[1], f: d[2], p: PLATES[d[3]] || '', t: d[4] ? 'leg' : 'up', m: d[5], i: (d[6] || []).map((row) => buildItem(...row)) }));
  } else if (data && data.v === 1 && Array.isArray(data.d)) {
    name = data.n;
    days = data.d.map((d) => ({ ...d, i: (d.i || []).map((row) => buildItem(...row)) }));
  } else {
    throw new Error('Este código no es una rutina de TrainSection.');
  }
  if (!days.length) throw new Error('La rutina no tiene días.');
  return {
    id: 'r' + now,
    name: str(name, 60) || 'Rutina importada',
    source: 'import',
    days: days.slice(0, 7).map((d, di) => ({
      id: 'd' + di + now,
      name: str(d.n, 40) || 'Día ' + (di + 1),
      short: str(d.s, 2),
      focus: str(d.f, 120),
      plate: PLATES.includes(d.p) ? d.p : PLATES[di % PLATES.length],
      type: d.t === 'leg' ? 'leg' : 'up',
      time: clampInt(d.m, 0, 240, 60),
      items: d.i.slice(0, 20)
    }))
  };
}
