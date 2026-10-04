import { weekday, addDays, daysBetween } from './dates.js';
import { MENUS, MENU_START } from '../data/food.js';

// Activity factors per kind of day for someone with a desk job, plus a 5 %
// surplus for a slow lean bulk. See the plan's nutrition section.
const FACTORS = { rest: 1.42, up: 1.55, leg: 1.63 };
const SURPLUS = 1.05;

const r50 = (n) => Math.round(n / 50) * 50;
const r5 = (n) => Math.round(n / 5) * 5;

export function mifflin(p) {
  if (!p || !p.weight || !p.height || !p.age) return null;
  return 10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === 'm' ? -161 : 5);
}

export function basal(p) {
  const measured = Number(p?.bmr);
  if (measured >= 1000 && measured <= 3500) return { value: measured, measured: true };
  const est = mifflin(p);
  return est ? { value: est, measured: false } : null;
}

export function targets(p, type = 'up') {
  const b = basal(p);
  if (!b) return null;
  const job = Number(p.job) || 0;
  const maint = (t) => b.value * (FACTORS[t] + job);
  const kcal = r50(maint(type) * SURPLUS);
  const protein = Math.ceil((2 * p.weight) / 5) * 5;
  const proteinBudget = Math.ceil((1.8 * p.weight) / 5) * 5;
  const fat = r5(1.1 * p.weight);
  const carbs = Math.max(0, r5((kcal - protein * 4 - fat * 9) / 4));
  const weeklyMaint = r50((2 * maint('leg') + 4 * maint('up') + maint('rest')) / 7);
  return { kcal, protein, proteinBudget, fat, carbs, weeklyMaint, basal: Math.round(b.value), measured: b.measured };
}

export const DAY_TYPE_LABEL = { leg: 'Día de pierna', up: 'Día de torso o calistenia', rest: 'Día de descanso' };

// Saturday is calisthenics, Sunday is rest, weekdays follow the gym day.
export function dayType(dateIso, plannedDay) {
  const wd = weekday(dateIso);
  if (wd === 6) return 'rest';
  if (wd === 5) return 'up';
  return plannedDay?.type === 'leg' ? 'leg' : 'up';
}

export function menuFor(dateIso) {
  let weeks = Math.floor(daysBetween(MENU_START, dateIso) / 7);
  if (weeks < 0) weeks = 0;
  return MENUS[Math.floor(weeks / 2) % MENUS.length];
}

// Which tuppers are eaten on a given day: early dishes Mon–Wed, late dishes
// Thu–Sat and the fresh dish on Sunday.
export function mealsFor(dateIso) {
  const menu = menuFor(dateIso);
  const wd = weekday(dateIso);
  if (wd === 6) return { menu, lunch: menu.sunday[0], dinner: menu.sunDinner || null, sunday: true };
  const pair = wd <= 2 ? menu.early : menu.late;
  return { menu, lunch: pair[0], dinner: pair[1], sunday: false };
}

// Average weight over the 7 days ending on `end` (inclusive).
export function weekAverage(weights, end) {
  const vals = [];
  for (let i = 0; i < 7; i++) {
    const v = weights[addDays(end, -i)];
    if (v) vals.push(v);
  }
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

// Compares this week's average with the one two weeks earlier.
export function weightAdvice(weights, end, waistGainMonth = null) {
  const now = weekAverage(weights, end);
  const before = weekAverage(weights, addDays(end, -14));
  if (now == null || before == null) {
    return { now, before, rate: null, tone: 'muted', text: 'Pésate cada mañana. Con 3 semanas de datos verás aquí tu ritmo y si hay que ajustar calorías.' };
  }
  const rate = (now - before) / 2;
  if (waistGainMonth != null && waistGainMonth > 1) {
    return { now, before, rate, tone: 'warn', text: 'La cintura crece más de 1 cm al mes: quita 150 kcal al día.' };
  }
  if (rate < 0.1) return { now, before, rate, tone: 'warn', text: 'Subes menos de 0,1 kg por semana: añade 150 kcal al día, mejor en hidratos.' };
  if (rate <= 0.25) return { now, before, rate, tone: 'ok', text: 'Ritmo perfecto (0,1–0,25 kg por semana). No cambies nada.' };
  if (rate <= 0.35) return { now, before, rate, tone: 'muted', text: 'Algo rápido, pero aún dentro de lo razonable. Vigila la cintura.' };
  return { now, before, rate, tone: 'warn', text: 'Subes más de 0,35 kg por semana: quita 150 kcal al día.' };
}
