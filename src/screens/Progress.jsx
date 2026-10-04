import { useMemo, useState } from 'preact/hooks';
import { useStore } from '../lib/store.js';
import { today, addDays, daysBetween, fmtShort } from '../lib/dates.js';
import { weightAdvice, weekAverage } from '../lib/nutrition.js';
import { doneSets, e1rm, summary } from '../lib/training.js';
import { exerciseInfo } from '../data/exercises.js';
import { POSES, MEASURES } from '../lib/checkin.js';
import { dec } from '../lib/format.js';
import { Top, Icon, Seg, LineChart } from '../ui.jsx';
import { PhotoImg } from '../components/PhotoImg.jsx';

function WeightTab({ s }) {
  const t = today();
  const from90 = addDays(t, -89);
  const firstLogged = Object.keys(s.weights).filter((d) => d >= from90 && d <= t).sort()[0];
  const start = firstLogged && firstLogged > from90 ? firstLogged : from90;
  const days = Math.max(2, daysBetween(start, t) + 1);
  const pts = [];
  const avg = [];
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i);
    const v = s.weights[d];
    if (v) pts.push({ i, y: v });
    const a = weekAverage(s.weights, d);
    if (a && v) avg.push({ i, y: a });
  }
  const waistGain = waistChange(s.checkins, t);
  const adv = weightAdvice(s.weights, t, waistGain);
  const labels = [[0, fmtShort(start)], [days - 1, fmtShort(t)]];
  return (
    <>
      <div class="card">
        <p class="k">Peso{days >= 89 ? ', últimos 90 días' : ''}</p>
        <LineChart yUnit="" xLabels={labels} series={[
          { name: 'Diario', color: 'var(--muted)', points: pts, line: false, dots: true, r: 2 },
          { name: 'Media 7 días', color: 'var(--accent)', points: avg, width: 2.5 }
        ]} />
        <p class="tiny muted">Puntos: cada pesada. Línea: media de 7 días, que es la que cuenta.</p>
      </div>
      <div class="card">
        <div class="stats three">
          <div><p class="k">Esta semana</p><p class="v">{adv.now ? dec(adv.now) : '—'}</p><p class="s">kg de media</p></div>
          <div><p class="k">Hace 2 sem.</p><p class="v">{adv.before ? dec(adv.before) : '—'}</p><p class="s">kg de media</p></div>
          <div><p class="k">Ritmo</p><p class="v hl">{adv.rate != null ? (adv.rate >= 0 ? '+' : '') + dec(adv.rate, 2) : '—'}</p><p class="s">kg/semana</p></div>
        </div>
        <p class={'small chip ' + (adv.tone === 'ok' ? 'ok' : adv.tone === 'warn' ? 'warn' : '')} style={{ whiteSpace: 'normal', lineHeight: 1.4, padding: '10px' }}>{adv.text}</p>
        <p class="tiny muted">Objetivo: subir 0,15–0,25 kg por semana. Las 2 primeras semanas subirás algo más por agua y glucógeno; no cuentan para ajustar.</p>
      </div>
    </>
  );
}

function waistChange(checkins, t) {
  const withWaist = checkins.filter((c) => c.waist);
  if (withWaist.length < 2) return null;
  const last = withWaist[withWaist.length - 1];
  const ref = [...withWaist].reverse().find((c) => daysBetween(c.date, last.date) >= 21);
  if (!ref) return null;
  const months = daysBetween(ref.date, last.date) / 30;
  return (last.waist - ref.waist) / months;
}

function MeasuresTab({ s }) {
  const list = s.checkins;
  const waist = list.filter((c) => c.waist).map((c, i) => ({ i, y: c.waist }));
  return (
    <>
      <div class="card">
        <p class="k">Cintura (cm)</p>
        <LineChart series={[{ name: 'Cintura', color: 'var(--accent)', points: waist, dots: true }]} />
      </div>
      <div class="card flat">
        {!list.length ? <p class="empty">Todavía no hay check-ins.</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
              <thead>
                <tr>{['Fecha', 'Peso', 'Cintura', ...MEASURES.map(([, l]) => l)].map((h) => <th key={h} class="eyebrow" style={{ textAlign: 'left', padding: '10px 12px', whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {[...list].reverse().map((c) => (
                  <tr key={c.id} style={{ borderTop: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{fmtShort(c.date)}</td>
                    <td class="num" style={{ padding: '10px 12px' }}>{dec(c.weight)}</td>
                    <td class="num" style={{ padding: '10px 12px' }}>{dec(c.waist)}</td>
                    {MEASURES.map(([k]) => <td key={k} class="num" style={{ padding: '10px 12px' }}>{c.measures?.[k] ? dec(c.measures[k]) : '—'}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function StrengthTab({ s }) {
  const exercises = useMemo(() => {
    const seen = new Map();
    for (let i = s.sessions.length - 1; i >= 0; i--) {
      for (const e of s.sessions[i].entries) {
        if (!seen.has(e.ex) && doneSets(e).length && e.unit !== 'm') seen.set(e.ex, exerciseInfo(e).name);
      }
    }
    return [...seen.entries()];
  }, [s.sessions]);
  const [ex, setEx] = useState(exercises[0]?.[0] || '');
  if (!exercises.length) return <div class="card"><p class="empty">Cuando termines entrenos verás aquí la evolución de tu fuerza en cada ejercicio.</p></div>;
  const rows = s.sessions
    .map((x) => ({ x, e: x.entries.find((e) => e.ex === ex) }))
    .filter((r) => r.e && doneSets(r.e).length);
  const points = rows.map((r, i) => ({ i, y: Math.round(Math.max(...doneSets(r.e).map((st) => e1rm(st.w, st.r))) * 10) / 10 }));
  const best = Math.max(0, ...points.map((p) => p.y));
  return (
    <>
      <label class="field"><span>Ejercicio</span>
        <select class="select" value={ex} onChange={(e) => setEx(e.currentTarget.value)}>
          {exercises.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
      </label>
      <div class="card">
        <p class="k">Fuerza estimada (1RM)</p>
        <LineChart series={[{ name: '1RM', color: 'var(--accent)', points, dots: true }]} xLabels={rows.length > 1 ? [[0, fmtShort(rows[0].x.date)], [rows.length - 1, fmtShort(rows[rows.length - 1].x.date)]] : []} />
        <p class="small">Mejor marca estimada: <span class="num">{best ? dec(best) + ' kg' : '—'}</span>. Se calcula con la fórmula de Epley a partir de tus series.</p>
      </div>
      <div class="card flat list">
        {[...rows].reverse().slice(0, 12).map((r) => (
          <div class="item" key={r.x.id}>
            <span class="num small" style={{ width: '4.5rem' }}>{fmtShort(r.x.date)}</span>
            <span class="num small grow">{summary(r.e)}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function PhotosTab({ s }) {
  const list = s.checkins.filter((c) => c.photos && Object.values(c.photos).some(Boolean));
  const [pose, setPose] = useState('front');
  const [a, setA] = useState(list[0]?.id || '');
  const [b, setB] = useState(list[list.length - 1]?.id || '');
  if (!list.length) return <div class="card"><p class="empty">Haz tu primer check-in para empezar a comparar fotos.</p><a class="btn primary" href="#/checkin"><Icon.camera /> Hacer check-in</a></div>;
  const ca = list.find((c) => c.id === a) || list[0];
  const cb = list.find((c) => c.id === b) || list[list.length - 1];
  return (
    <>
      <Seg value={pose} onChange={setPose} label="Pose" options={POSES.map(([k, , short]) => [k, short])} />
      <div class="grid2">
        <label class="field"><span>Antes</span>
          <select class="select" value={ca.id} onChange={(e) => setA(e.currentTarget.value)}>{list.map((c) => <option key={c.id} value={c.id}>{fmtShort(c.date)}</option>)}</select>
        </label>
        <label class="field"><span>Después</span>
          <select class="select" value={cb.id} onChange={(e) => setB(e.currentTarget.value)}>{list.map((c) => <option key={c.id} value={c.id}>{fmtShort(c.date)}</option>)}</select>
        </label>
      </div>
      <div class="compare">
        <figure><PhotoImg id={ca.photos?.[pose]} alt={'Antes, ' + fmtShort(ca.date)} /><figcaption class="tiny muted">{fmtShort(ca.date)} · {dec(ca.weight)} kg · {dec(ca.waist)} cm</figcaption></figure>
        <figure><PhotoImg id={cb.photos?.[pose]} alt={'Después, ' + fmtShort(cb.date)} /><figcaption class="tiny muted">{fmtShort(cb.date)} · {dec(cb.weight)} kg · {dec(cb.waist)} cm</figcaption></figure>
      </div>
      <p class="tiny muted">Compara siempre con la misma luz y la misma pose. Los cambios se notan de mes en mes, no de semana en semana.</p>
    </>
  );
}

export function Progress({ initial = 'peso' }) {
  const s = useStore();
  const [tab, setTab] = useState(initial);
  return (
    <>
      <Top title="Progreso" right={<a class="iconbtn" href="#/checkin" aria-label="Hacer check-in"><Icon.camera /></a>} />
      <main class="content">
        <Seg value={tab} onChange={setTab} label="Vista" options={[['peso', 'Peso'], ['medidas', 'Medidas'], ['fuerza', 'Fuerza'], ['fotos', 'Fotos']]} />
        {tab === 'peso' && <WeightTab s={s} />}
        {tab === 'medidas' && <MeasuresTab s={s} />}
        {tab === 'fuerza' && <StrengthTab s={s} />}
        {tab === 'fotos' && <PhotosTab s={s} />}
      </main>
    </>
  );
}
