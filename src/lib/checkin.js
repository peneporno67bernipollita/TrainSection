import { addDays, daysBetween } from './dates.js';

export const POSES = [
  ['front', 'Frente, relajado', 'Frente'],
  ['side', 'Perfil derecho, relajado', 'Perfil'],
  ['back', 'Espalda, relajada', 'Espalda'],
  ['flex', 'Frente, doble bíceps', 'Bíceps']
];

export const MEASURES = [
  ['shoulders', 'Hombros'],
  ['chest', 'Pecho'],
  ['arm', 'Brazo contraído'],
  ['forearm', 'Antebrazo'],
  ['thigh', 'Muslo']
];

// Check-ins are due every `checkinEvery` days. The workout is locked while one
// is due, except for one "postpone until tomorrow" per period.
export function checkinStatus(s, t) {
  const every = Number(s.settings?.checkinEvery) || 14;
  const list = s.checkins || [];
  const last = list.length ? list[list.length - 1] : null;
  const due = !last || daysBetween(last.date, t) >= every;
  const period = last ? last.date : 'none';
  const p = s.settings?.postponed;
  const postponedToday = !!(p && p.period === period && p.until === t);
  const canPostpone = due && !(p && p.period === period);
  const nextDate = last ? addDays(last.date, every) : t;
  return {
    due,
    first: !last,
    last,
    period,
    postponedToday,
    canPostpone,
    gate: due && !postponedToday,
    nextDate,
    daysLeft: last ? Math.max(0, daysBetween(t, nextDate)) : 0
  };
}

export function measuresDue(s, t) {
  const withMeasures = (s.checkins || []).filter((c) => c.measures && Object.values(c.measures).some(Boolean));
  if (!withMeasures.length) return true;
  return daysBetween(withMeasures[withMeasures.length - 1].date, t) >= 28;
}
