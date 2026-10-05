import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, daysBetween, weekday, weekStart, monthGrid, nextMonday } from '../src/lib/dates.js';
import { targets, dayType, mealsFor, menuFor, weightAdvice, mifflin } from '../src/lib/nutrition.js';
import { e1rm, suggestion, nextDayIndex, weekStreak, newSessionFor, summary } from '../src/lib/training.js';
import { encodeRoutine, decodeRoutine, extractCode, shareLink } from '../src/lib/share.js';
import { checkinStatus, measuresDue } from '../src/lib/checkin.js';
import { PRESET_ROUTINE } from '../src/data/preset.js';
import { EXERCISES } from '../src/data/exercises.js';
import { RECIPES, MENUS, SHOPPING } from '../src/data/food.js';
import { reminders, buildIcs, googleCalendarUrl } from '../src/lib/ics.js';

const PROFILE = { sex: 'h', age: 20, height: 177, weight: 68, bmr: 1750, job: 0 };

test('dates: weekday, week start and month grid', () => {
  assert.equal(weekday('2026-10-04'), 6); // Sunday
  assert.equal(weekday('2026-10-05'), 0); // Monday
  assert.equal(weekStart('2026-10-04'), '2026-09-28');
  assert.equal(addDays('2026-10-25', 1), '2026-10-26'); // across the DST change
  assert.equal(daysBetween('2026-10-04', '2026-10-18'), 14);
  assert.equal(nextMonday('2026-10-04'), '2026-10-05');
  const grid = monthGrid(2026, 9);
  assert.equal(grid[0][0], '2026-09-28');
  assert.ok(grid.flat().includes('2026-10-31'));
});

test('nutrition: the plan numbers come out of the calculator', () => {
  assert.equal(targets(PROFILE, 'leg').kcal, 3000);
  assert.equal(targets(PROFILE, 'up').kcal, 2850);
  assert.equal(targets(PROFILE, 'rest').kcal, 2600);
  const t = targets(PROFILE, 'up');
  assert.equal(t.protein, 140);
  assert.equal(t.proteinBudget, 125);
  assert.equal(t.fat, 75);
  assert.equal(t.weeklyMaint, 2700);
  assert.equal(Math.round(mifflin(PROFILE)), 1691);
  // Without a measured basal it falls back to Mifflin-St Jeor
  assert.equal(targets({ ...PROFILE, bmr: null }, 'up').kcal, 2750);
});

test('nutrition: day types and the menu rotation', () => {
  const leg = PRESET_ROUTINE.days[1];
  const up = PRESET_ROUTINE.days[0];
  assert.equal(dayType('2026-10-06', leg), 'leg');
  assert.equal(dayType('2026-10-05', up), 'up');
  assert.equal(dayType('2026-10-10', up), 'up'); // Saturday, calisthenics
  assert.equal(dayType('2026-10-11', leg), 'rest'); // Sunday
  assert.equal(menuFor('2026-10-04').k, 'A');
  assert.equal(menuFor('2026-10-17').k, 'A');
  assert.equal(menuFor('2026-10-18').k, 'B');
  assert.equal(menuFor('2026-11-01').k, 'C');
  assert.equal(menuFor('2026-11-15').k, 'A');
  assert.equal(mealsFor('2026-10-05').lunch, 'lentejas');
  assert.equal(mealsFor('2026-10-08').lunch, 'espinacas');
  assert.equal(mealsFor('2026-10-04').dinner, 'tortilla');
  assert.equal(mealsFor('2026-10-25').dinner, null); // Menu B Sunday dinner is an omelette
});

test('nutrition: weight advice follows the plan table', () => {
  const w = {};
  for (let i = 0; i < 21; i++) w[addDays('2026-10-01', i)] = 68 + i * 0.03;
  const a = weightAdvice(w, '2026-10-21');
  assert.equal(a.tone, 'ok');
  assert.ok(a.rate > 0.15 && a.rate < 0.25);
  const flat = {};
  for (let i = 0; i < 21; i++) flat[addDays('2026-10-01', i)] = 68;
  assert.equal(weightAdvice(flat, '2026-10-21').tone, 'warn');
  assert.equal(weightAdvice({}, '2026-10-21').rate, null);
});

test('training: e1RM, suggestions and summaries', () => {
  assert.equal(Math.round(e1rm(47.5, 8) * 10) / 10, 60.2);
  const item = { sets: 3, min: 8, max: 12 };
  const top = { entry: { unit: 'kg', sets: [12, 12, 12].map((r) => ({ w: 40, r, done: true })) } };
  const mid = { entry: { unit: 'kg', sets: [12, 11, 10].map((r) => ({ w: 40, r, done: true })) } };
  assert.equal(suggestion(item, top).kind, 'up');
  assert.equal(suggestion(item, mid).kind, 'reps');
  assert.equal(suggestion(item, null).kind, 'new');
  assert.equal(summary(mid.entry), '40×12 · 40×11 · 40×10');
});

test('training: rotation continues after the last finished day', () => {
  const r = PRESET_ROUTINE;
  assert.equal(nextDayIndex(r, [], '2026-10-05').index, 0); // Monday, no history
  assert.equal(nextDayIndex(r, [], '2026-10-07').index, 2); // Wednesday, no history
  const s = [{ routineId: r.id, dayId: 'torsoA', date: '2026-10-05', finishedAt: 1, entries: [] }];
  assert.equal(nextDayIndex(r, s, '2026-10-07').index, 1); // missed Tuesday: Pierna A is still pending
  const done = nextDayIndex(r, s, '2026-10-05');
  assert.equal(done.doneToday, true);
  const sess = newSessionFor(r, 0, [], '2026-10-05');
  assert.equal(sess.entries.length, 6);
  assert.equal(sess.entries[0].sets.length, 4);
});

test('training: week streak needs 4 sessions per week', () => {
  const s = [];
  for (const d of ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15']) {
    s.push({ date: d, finishedAt: 1, entries: [] });
  }
  assert.equal(weekStreak(s, '2026-10-18'), 2);
  assert.equal(weekStreak(s, '2026-10-20'), 2);
  assert.equal(weekStreak(s, '2026-10-27'), 0);
});

test('share: a routine survives the trip through a link', () => {
  const r = JSON.parse(JSON.stringify(PRESET_ROUTINE));
  r.days[0].items.push({ ex: 'custom:x', custom: { name: 'Mi ejercicio', video: 'dQw4w9WgXcQ', muscle: 'pecho' }, sets: 2, min: 6, max: 9, rir: '2', rest: 120 });
  const code = encodeRoutine(r);
  assert.ok(code.length < 1000, 'code is short enough for a QR: ' + code.length);
  const back = decodeRoutine(extractCode(shareLink(code)));
  assert.equal(back.name, r.name);
  assert.equal(back.days.length, 5);
  assert.equal(back.days[2].items.length, r.days[2].items.length);
  assert.deepEqual(back.days[2].items.map((x) => x.ex), r.days[2].items.map((x) => x.ex));
  assert.equal(back.days[2].items[3].ss, 'A');
  assert.equal(back.days[2].items[7].perSide, true);
  const custom = back.days[0].items[back.days[0].items.length - 1];
  assert.equal(custom.custom.name, 'Mi ejercicio');
  assert.equal(custom.custom.video, 'dQw4w9WgXcQ');
  assert.throws(() => decodeRoutine('nope'), /no es válido|no es una rutina|dañado/);
});

test('check-in: due every 14 days, one postponement per period', () => {
  const s = { settings: { checkinEvery: 14 }, checkins: [] };
  assert.equal(checkinStatus(s, '2026-10-04').gate, true);
  s.checkins = [{ date: '2026-10-04', measures: { waist: 1 } }];
  assert.equal(checkinStatus(s, '2026-10-17').due, false);
  const due = checkinStatus(s, '2026-10-18');
  assert.equal(due.due, true);
  assert.equal(due.canPostpone, true);
  s.settings.postponed = { period: '2026-10-04', until: '2026-10-18' };
  assert.equal(checkinStatus(s, '2026-10-18').gate, false);
  assert.equal(checkinStatus(s, '2026-10-19').gate, true);
  assert.equal(checkinStatus(s, '2026-10-19').canPostpone, false);
  assert.equal(measuresDue(s, '2026-10-20'), false);
  assert.equal(measuresDue(s, '2026-11-01'), true);
});

test('data: every routine exercise, recipe and menu entry exists', () => {
  for (const d of PRESET_ROUTINE.days) for (const it of d.items) assert.ok(EXERCISES[it.ex], 'missing exercise ' + it.ex);
  for (const m of MENUS) for (const k of [...m.early, ...m.late, ...m.sunday]) assert.ok(RECIPES[k], 'missing recipe ' + k);
  for (const e of Object.values(EXERCISES)) for (const [, id] of e.videos) assert.match(id, /^[\w-]{11}$/);
  for (const r of Object.values(RECIPES)) for (const [, id] of r.videos) assert.match(id, /^[\w-]{11}$/);
  const total = SHOPPING.reduce((a, g) => a + g.items.reduce((b, it) => b + it[2], 0), 0);
  assert.equal(Math.round(total * 100) / 100, 28.66);
  const sets = PRESET_ROUTINE.days.map((d) => d.items.reduce((a, it) => a + it.sets, 0));
  assert.deepEqual(sets, [20, 21, 28, 17, 21]);
});

test('reminders: calendar file and Google Calendar links', () => {
  const list = reminders({ gymTime: '18:00', checkinEvery: 14 });
  assert.equal(list.length, 6);
  const gym = list.find((e) => e.uid === 'gym');
  assert.match(gym.start, /^\d{8}T180000$/);
  assert.match(gym.end, /^\d{8}T193000$/);
  assert.equal(weekday(gym.start.slice(0, 4) + '-' + gym.start.slice(4, 6) + '-' + gym.start.slice(6, 8)), 0); // a Monday
  assert.match(reminders({ gymTime: '23:00' }).find((e) => e.uid === 'gym').end, /T235900$/);
  assert.match(list.find((e) => e.uid === 'checkin').rrule, /INTERVAL=2;BYDAY=SU/);
  assert.match(reminders({ checkinEvery: 28 }).find((e) => e.uid === 'checkin').rrule, /INTERVAL=4;/);
  const ics = buildIcs({ gymTime: '18:00', checkinEvery: 14 });
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n') && ics.endsWith('END:VCALENDAR\r\n'));
  assert.equal(ics.match(/BEGIN:VEVENT/g).length, 6);
  assert.equal(ics.match(/BEGIN:VALARM/g).length, 6);
  const url = new URL(googleCalendarUrl(gym));
  assert.equal(url.hostname, 'calendar.google.com');
  assert.equal(url.searchParams.get('action'), 'TEMPLATE');
  assert.equal(url.searchParams.get('dates'), gym.start + '/' + gym.end);
  assert.equal(url.searchParams.get('recur'), 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR');
});
