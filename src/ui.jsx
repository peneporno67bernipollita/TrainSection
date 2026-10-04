import { useEffect, useState } from 'preact/hooks';
import { ytUrl } from './data/exercises.js';

/* ---------- icons (24px, stroke = currentColor) ---------- */
const P = (d) => <path d={d} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />;
const svg = (children) => <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;

export const Icon = {
  home: () => svg(<>{P('M3 11l9-7 9 7')}{P('M5 10v10h14V10')}{P('M10 20v-6h4v6')}</>),
  calendar: () => svg(<>{P('M4 6h16v14H4z')}{P('M4 10h16')}{P('M8 3v4M16 3v4')}</>),
  chart: () => svg(<>{P('M4 20V4')}{P('M4 20h16')}{P('M7 15l4-5 3 3 5-7')}</>),
  food: () => svg(<>{P('M7 3v8a2 2 0 0 0 4 0V3')}{P('M9 11v10')}{P('M17 3c-2 0-3 2-3 6s1 5 3 5v7')}</>),
  list: () => svg(<>{P('M9 6h11M9 12h11M9 18h11')}{P('M4 6h.01M4 12h.01M4 18h.01')}</>),
  gear: () => svg(<>{P('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z')}{P('M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z')}</>),
  back: () => svg(P('M15 18l-6-6 6-6')),
  check: () => svg(P('M5 12.5l4.5 4.5L19 7')),
  plus: () => svg(P('M12 5v14M5 12h14')),
  minus: () => svg(P('M5 12h14')),
  camera: () => svg(<>{P('M4 8h3l2-3h6l2 3h3v11H4z')}{P('M12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z')}</>),
  share: () => svg(<>{P('M12 3v12')}{P('M7 8l5-5 5 5')}{P('M5 13v7h14v-7')}</>),
  copy: () => svg(<>{P('M9 9h11v11H9z')}{P('M5 15H4V4h11v1')}</>),
  trash: () => svg(<>{P('M4 7h16')}{P('M9 7V4h6v3')}{P('M6 7l1 13h10l1-13')}</>),
  up: () => svg(P('M6 15l6-6 6 6')),
  down: () => svg(P('M6 9l6 6 6-6')),
  x: () => svg(P('M6 6l12 12M18 6L6 18')),
  edit: () => svg(<>{P('M4 20h4L19 9l-4-4L4 16z')}</>),
  book: () => svg(<>{P('M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z')}{P('M4 19V5')}</>),
  person: () => svg(<>{P('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z')}{P('M5 21a7 7 0 0 1 14 0')}</>)
};

/* ---------- toast ---------- */
let toastListener = null;
export function toast(msg) { if (toastListener) toastListener(msg); }

export function ToastHost() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    let t = null;
    toastListener = (m) => { setMsg(m); clearTimeout(t); t = setTimeout(() => setMsg(null), 2600); };
    return () => { toastListener = null; clearTimeout(t); };
  }, []);
  return msg ? <div class="toast" role="status">{msg}</div> : null;
}

/* ---------- confirm dialog (window.confirm is unreliable in webviews) ---------- */
let confirmListener = null;
export function confirmDialog(opts) {
  return new Promise((resolve) => {
    if (!confirmListener) { resolve(false); return; }
    confirmListener({ ...opts, resolve });
  });
}

export function ConfirmHost() {
  const [req, setReq] = useState(null);
  useEffect(() => { confirmListener = setReq; return () => { confirmListener = null; }; }, []);
  if (!req) return null;
  const close = (v) => { req.resolve(v); setReq(null); };
  return (
    <div class="backdrop" onClick={(e) => { if (e.target === e.currentTarget) close(false); }}>
      <div class="sheet" role="dialog" aria-modal="true" aria-label={req.title}>
        <p class="h2">{req.title}</p>
        {req.text && <p class="muted">{req.text}</p>}
        <div class="btns">
          <button type="button" class={'btn ' + (req.danger ? 'danger' : 'primary')} onClick={() => close(true)}>{req.ok || 'Aceptar'}</button>
          <button type="button" class="btn ghost" onClick={() => close(false)}>{req.cancel || 'Cancelar'}</button>
        </div>
      </div>
    </div>
  );
}

export function Sheet({ title, onClose, children }) {
  return (
    <div class="backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div class="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div class="row between">
          <p class="h2">{title}</p>
          <button type="button" class="iconbtn" aria-label="Cerrar" onClick={onClose}><Icon.x /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- small pieces ---------- */
export function Top({ title, sub, back, right }) {
  return (
    <header class="top">
      {back && <a class="iconbtn" href={back} aria-label="Volver"><Icon.back /></a>}
      <div class="grow">
        <h1>{title}</h1>
        {sub && <p class="sub">{sub}</p>}
      </div>
      {right}
    </header>
  );
}

export function Seg({ value, options, onChange, label }) {
  return (
    <div class="seg" role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button type="button" key={v} aria-pressed={String(v === value)} onClick={() => onChange(v)}>{text}</button>
      ))}
    </div>
  );
}

export function Videos({ list, first = true }) {
  if (!list || !list.length) return null;
  return (
    <div class="btns">
      {list.map(([label, id], i) => (
        <a key={id + label} class={'btn sm play' + (first && i === 0 ? ' primary' : '')} href={ytUrl(id)} target="_blank" rel="noopener">{label}</a>
      ))}
    </div>
  );
}

export function Plate({ plate, sm }) {
  return <span class={'plate ' + (plate || 'p25') + (sm ? ' sm' : '')} aria-hidden="true" />;
}

export function Field({ label, children }) {
  return <label class="field"><span>{label}</span>{children}</label>;
}

/* ---------- line chart (SVG, no dependencies) ---------- */
export function LineChart({ series, height = 180, yUnit = '', xLabels = [] }) {
  const all = series.flatMap((s) => s.points.map((p) => p.y)).filter((v) => Number.isFinite(v));
  const n = Math.max(0, ...series.flatMap((s) => s.points.map((p, i) => (p.i ?? i)))) + 1;
  if (all.length < 2 || n < 2) return <p class="empty">Aún no hay datos suficientes para la gráfica.</p>;
  const W = 340, H = height, L = 38, R = 8, T = 10, B = 22;
  let lo = Math.min(...all), hi = Math.max(...all);
  if (hi - lo < 1) { lo -= 0.5; hi += 0.5; }
  const pad = (hi - lo) * 0.12; lo -= pad; hi += pad;
  const x = (i) => L + (i * (W - L - R)) / Math.max(1, n - 1);
  const y = (v) => T + ((hi - v) * (H - T - B)) / (hi - lo);
  const ticks = [lo, (lo + hi) / 2, hi];
  const fmt = (v) => (Math.round(v * 10) / 10).toString().replace('.', ',');
  return (
    <svg class="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Gráfica">
      {ticks.map((t) => (
        <g key={t}>
          <line class="axis" x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke-dasharray="2 4" />
          <text x={L - 6} y={y(t) + 3} text-anchor="end">{fmt(t)}{yUnit}</text>
        </g>
      ))}
      {xLabels.map(([i, label]) => <text key={i} x={x(i)} y={H - 6} text-anchor={i === 0 ? 'start' : i >= n - 1 ? 'end' : 'middle'}>{label}</text>)}
      {series.map((s) => {
        const pts = s.points.map((p, i) => (Number.isFinite(p.y) ? [x(p.i ?? i), y(p.y)] : null)).filter(Boolean);
        const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
        return (
          <g key={s.name}>
            {s.line !== false && <path d={d} fill="none" stroke={s.color} stroke-width={s.width || 2} stroke-linejoin="round" stroke-linecap="round" />}
            {s.dots && pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={s.r || 2.5} fill={s.color} />)}
          </g>
        );
      })}
    </svg>
  );
}
