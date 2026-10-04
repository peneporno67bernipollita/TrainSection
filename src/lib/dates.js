// Local-calendar date helpers. Dates are stored as 'YYYY-MM-DD' strings in
// the user's local time; parsing at noon avoids daylight-saving surprises.

const pad = (n) => String(n).padStart(2, '0');

export function iso(d = new Date()) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

export function parse(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export const today = () => iso(new Date());

export function addDays(s, n) {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return iso(d);
}

export function daysBetween(a, b) {
  return Math.round((parse(b) - parse(a)) / 86400000);
}

// Monday = 0 … Sunday = 6
export function weekday(s) {
  return (parse(s).getDay() + 6) % 7;
}

export function weekStart(s) {
  return addDays(s, -weekday(s));
}

const fmtLongF = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtShortF = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' });
const fmtMonthF = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });

export const fmtLong = (s) => fmtLongF.format(parse(s));
export const fmtShort = (s) => fmtShortF.format(parse(s)).replace('.', '');
export const fmtMonth = (y, m) => fmtMonthF.format(new Date(y, m, 1, 12));

export const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// Weeks (Monday first) covering a month, as arrays of ISO dates.
export function monthGrid(year, month) {
  const first = iso(new Date(year, month, 1, 12));
  let cursor = weekStart(first);
  const weeks = [];
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) { week.push(cursor); cursor = addDays(cursor, 1); }
    weeks.push(week);
    if (parse(cursor).getMonth() !== month && w >= 3) break;
  }
  return weeks;
}

export function nextMonday(s = today()) {
  const wd = weekday(s);
  return wd === 0 ? s : addDays(s, 7 - wd);
}

export function minutes(ms) {
  return Math.max(0, Math.round(ms / 60000));
}

export function clock(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  return Math.floor(s / 60) + ':' + pad(s % 60);
}
