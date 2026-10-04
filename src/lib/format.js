// Spanish number formatting that also groups 4-digit numbers (2.850).
export const miles = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function dec(n, digits = 1) {
  if (n == null || !Number.isFinite(n)) return '—';
  const f = 10 ** digits;
  return String(Math.round(n * f) / f).replace('.', ',');
}

export function parseNum(v) {
  const n = parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}
