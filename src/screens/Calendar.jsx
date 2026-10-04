import { useState } from 'preact/hooks';
import { useStore } from '../lib/store.js';
import { today, monthGrid, fmtMonth, fmtLong, WEEKDAYS, parse } from '../lib/dates.js';
import { doneSets } from '../lib/training.js';
import { POSES } from '../lib/checkin.js';
import { dec } from '../lib/format.js';
import { Top, Icon, Plate } from '../ui.jsx';
import { PhotoImg } from '../components/PhotoImg.jsx';

const HABIT_LABEL = { sleep: 'Sueño', steps: 'Pasos', meals: 'Comidas', noAlcohol: 'Sin alcohol' };

export function CalendarScreen() {
  const s = useStore();
  const t = today();
  const td = parse(t);
  const [ym, setYm] = useState([td.getFullYear(), td.getMonth()]);
  const [sel, setSel] = useState(t);
  const [y, m] = ym;
  const weeks = monthGrid(y, m);

  const byDate = {};
  for (const x of s.sessions) (byDate[x.date] = byDate[x.date] || []).push(x);
  const ciByDate = {};
  for (const c of s.checkins) ciByDate[c.date] = c;

  const move = (d) => {
    const nm = m + d;
    setYm([y + Math.floor(nm / 12), ((nm % 12) + 12) % 12]);
  };

  const daySessions = byDate[sel] || [];
  const ci = ciByDate[sel];
  const w = s.weights[sel];
  const habits = s.habits[sel] || {};
  const habitList = Object.keys(HABIT_LABEL).filter((k) => habits[k]);

  return (
    <>
      <Top title="Calendario" right={<a class="iconbtn" href="#/ajustes" aria-label="Ajustes"><Icon.gear /></a>} />
      <main class="content">
        <div class="row between">
          <button type="button" class="iconbtn" aria-label="Mes anterior" onClick={() => move(-1)}><Icon.back /></button>
          <p class="h2">{fmtMonth(y, m).replace(/^./, (c) => c.toUpperCase())}</p>
          <button type="button" class="iconbtn" aria-label="Mes siguiente" onClick={() => move(1)} style={{ transform: 'scaleX(-1)' }}><Icon.back /></button>
        </div>
        <div class="cal" role="grid" aria-label="Calendario">
          {WEEKDAYS.map((d) => <span class="wd" key={d}>{d}</span>)}
          {weeks.flat().map((d) => {
            const inMonth = parse(d).getMonth() === m;
            const sess = (byDate[d] || []).filter((x) => x.finishedAt);
            return (
              <button type="button" key={d} class={(inMonth ? '' : 'out ') + (d === t ? 'today' : '')} aria-pressed={String(d === sel)} aria-label={fmtLong(d)} onClick={() => setSel(d)}>
                <span class="d">{Number(d.slice(8, 10))}</span>
                <span class="marks">
                  {sess.map((x) => <i key={x.id} class="dot" style={{ '--c': 'var(--' + (x.plate || 'p25') + ')' }} />)}
                  {ciByDate[d] && <i class="dot ci" />}
                </span>
              </button>
            );
          })}
        </div>
        <p class="tiny muted">Los puntos de color son entrenos (el color del día de la rutina). El aro es un check-in.</p>

        <div class="card">
          <p class="k" style={{ textTransform: 'none' }}>{fmtLong(sel)}</p>
          {!daySessions.length && !ci && w == null && !habitList.length && <p class="small muted">Nada registrado este día.</p>}
          {daySessions.filter((x) => x.finishedAt).map((x) => (
            <div class="row" key={x.id}>
              <Plate plate={x.plate} sm />
              <div class="grow">
                <p><strong>{x.dayName}</strong></p>
                <p class="small muted">{x.entries.reduce((a, e) => a + doneSets(e).length, 0)} series · {Math.round((x.finishedAt - x.startedAt) / 60000)} min</p>
              </div>
              <a class="btn sm" href={'#/sesion/' + x.id}>Ver</a>
            </div>
          ))}
          {w != null && <p class="small">Peso: <span class="num">{dec(w)} kg</span></p>}
          {habitList.length > 0 && <p class="small">Hábitos: {habitList.map((k) => HABIT_LABEL[k]).join(', ')}</p>}
          {ci && (
            <div class="stack tight">
              <p class="small"><strong>Check-in</strong> · {dec(ci.weight)} kg · cintura {dec(ci.waist)} cm</p>
              <div class="thumbs">
                {POSES.map(([k, label]) => <PhotoImg key={k} id={ci.photos?.[k]} alt={label} />)}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
