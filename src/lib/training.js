import { weekday, weekStart, addDays, daysBetween } from './dates.js';
import { EXERCISES } from '../data/exercises.js';

// Epley estimate of the one-rep max. Above ~12 reps it overestimates, so we
// cap the reps used in the formula.
export function e1rm(w, r) {
  if (!w || !r) return 0;
  const reps = Math.min(r, 12);
  return reps <= 1 ? w : w * (1 + reps / 30);
}

export const doneSets = (entry) => (entry?.sets || []).filter((s) => s.done && s.r > 0);

// Most recent finished session entry for an exercise (optionally before a date).
export function lastEntry(sessions, exId, beforeId = null) {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const s = sessions[i];
    if (beforeId && s.id === beforeId) continue;
    const e = s.entries.find((x) => x.ex === exId);
    if (e && doneSets(e).length) return { entry: e, session: s };
  }
  return null;
}

export function bestE1rm(sessions, exId, excludeId = null) {
  let best = 0;
  for (const s of sessions) {
    if (excludeId && s.id === excludeId) continue;
    for (const e of s.entries) {
      if (e.ex !== exId) continue;
      for (const set of doneSets(e)) best = Math.max(best, e1rm(set.w, set.r));
    }
  }
  return best;
}

// Double progression: when every set reached the top of the range, add load.
export function suggestion(item, last) {
  if (!last) return { kind: 'new', text: 'Primera vez: busca un peso con el que llegues al rango dejando las repeticiones en reserva indicadas.' };
  const sets = doneSets(last.entry);
  if (!sets.length) return { kind: 'new', text: 'Sin datos de la última vez.' };
  const allTop = sets.length >= item.sets && sets.slice(0, item.sets).every((s) => s.r >= item.max);
  const unit = last.entry.unit || 'kg';
  if (allTop) {
    const step = unit === 'm' ? 'más peso' : stepFor(item) + ' kg más';
    return { kind: 'up', text: 'La última vez llegaste al máximo en todas las series: hoy ' + step + ' y vuelve a la parte baja del rango.' };
  }
  return { kind: 'reps', text: 'Mismo peso que la última vez e intenta sumar 1 repetición en alguna serie.' };
}

function stepFor(item) {
  // Big compound lifts move in 2,5 kg jumps; small isolation work in 1–2 kg.
  return item.max <= 10 ? '2,5' : '1–2,5';
}

export function summary(entry) {
  const sets = doneSets(entry);
  if (!sets.length) return '';
  const unit = entry.unit === 'm' ? ' m' : '';
  return sets.map((s) => (s.w ? fmtNum(s.w) + '×' : '') + s.r + unit).join(' · ');
}

export function fmtNum(n) {
  if (n == null || n === '') return '';
  return String(Math.round(n * 100) / 100).replace('.', ',');
}

// Which routine day comes next: the one after the last finished session.
// Without history it follows the weekday (Mon = first day).
export function nextDayIndex(routine, sessions, todayIso) {
  const n = routine.days.length;
  const mine = sessions.filter((s) => s.routineId === routine.id && s.finishedAt);
  const doneToday = mine.find((s) => s.date === todayIso);
  if (doneToday) {
    const idx = routine.days.findIndex((d) => d.id === doneToday.dayId);
    if (idx >= 0) return { index: idx, doneToday: true };
  }
  const last = mine[mine.length - 1];
  if (last) {
    const idx = routine.days.findIndex((d) => d.id === last.dayId);
    if (idx >= 0) return { index: (idx + 1) % n, doneToday: false };
  }
  const wd = weekday(todayIso);
  return { index: wd < n ? wd : 0, doneToday: false };
}

export function sessionsInWeek(sessions, anyIso) {
  const start = weekStart(anyIso);
  const end = addDays(start, 6);
  return sessions.filter((s) => s.finishedAt && s.date >= start && s.date <= end);
}

// Consecutive weeks (ending this week if already met, else last week) with at
// least `target` finished gym sessions.
export function weekStreak(sessions, todayIso, target = 4) {
  let start = weekStart(todayIso);
  let count = 0;
  if (sessionsInWeek(sessions, start).length < target) start = addDays(start, -7);
  for (let i = 0; i < 260; i++) {
    if (sessionsInWeek(sessions, start).length >= target) { count++; start = addDays(start, -7); } else break;
  }
  return count;
}

export function newSessionFor(routine, dayIndex, sessions, todayIso) {
  const day = routine.days[dayIndex];
  return {
    id: 's' + Date.now().toString(36),
    routineId: routine.id,
    dayId: day.id,
    dayName: day.name,
    plate: day.plate,
    date: todayIso,
    startedAt: Date.now(),
    finishedAt: null,
    entries: day.items.map((item) => {
      const last = lastEntry(sessions, item.ex);
      const prev = last ? doneSets(last.entry) : [];
      return {
        ex: item.ex,
        custom: item.custom || null,
        unit: item.custom ? 'kg' : (EXERCISES[item.ex]?.unit || 'kg'),
        target: { sets: item.sets, min: item.min, max: item.max, rir: item.rir, rest: item.rest, ss: item.ss || null, perSide: !!(item.perSide ?? EXERCISES[item.ex]?.perSide) },
        sets: Array.from({ length: item.sets }, (_, k) => ({ w: prev[k]?.w ?? prev[prev.length - 1]?.w ?? null, r: null, rir: null, done: false }))
      };
    })
  };
}

export function daysSince(dateIso, todayIso) {
  return daysBetween(dateIso, todayIso);
}
