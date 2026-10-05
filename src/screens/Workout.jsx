import { useEffect, useState } from 'preact/hooks';
import { useStore, update } from '../lib/store.js';
import { exerciseInfo } from '../data/exercises.js';
import { lastEntry, suggestion, summary, doneSets, bestE1rm, e1rm } from '../lib/training.js';
import { clock } from '../lib/dates.js';
import { parseNum, miles } from '../lib/format.js';
import { beep, unlockAudio, keepAwake } from '../lib/sound.js';
import { Top, Icon, Videos, toast, confirmDialog, Sheet } from '../ui.jsx';
import { goBack } from '../nav.js';

const shown = (v) => (v == null ? '' : typeof v === 'number' ? String(v).replace('.', ',') : v);

function patchSet(ei, si, patch) {
  update((st) => {
    const entries = st.current.entries.map((e, i) => (i !== ei ? e : { ...e, sets: e.sets.map((x, j) => (j !== si ? x : { ...x, ...patch })) }));
    return { current: { ...st.current, entries } };
  });
}

function patchEntry(ei, fn) {
  update((st) => {
    const entries = st.current.entries.map((e, i) => (i !== ei ? e : fn(e)));
    return { current: { ...st.current, entries } };
  });
}

function Elapsed({ since }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 15000); return () => clearInterval(t); }, []);
  return <>{Math.max(0, Math.round((now - since) / 60000))} min</>;
}

function RestBar({ cur }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!cur.restEnd) return undefined;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [cur.restEnd]);
  useEffect(() => {
    if (cur.restEnd && !cur.restBeeped && now >= cur.restEnd) {
      beep(3);
      update((st) => (st.current ? { current: { ...st.current, restBeeped: true } } : null));
      setTimeout(() => update((st) => (st.current && st.current.restEnd === cur.restEnd ? { current: { ...st.current, restEnd: null } } : null)), 4000);
    }
  }, [now, cur.restEnd, cur.restBeeped]);
  if (!cur.restEnd) return null;
  const left = Math.max(0, (cur.restEnd - now) / 1000);
  const pct = cur.restTotal ? Math.min(100, ((cur.restTotal - left) / cur.restTotal) * 100) : 100;
  const add = (sec) => update((st) => ({ current: { ...st.current, restEnd: st.current.restEnd + sec * 1000, restTotal: (st.current.restTotal || 0) + sec, restBeeped: false } }));
  const skip = () => update((st) => ({ current: { ...st.current, restEnd: null } }));
  return (
    <div class={'restbar' + (left <= 0 ? ' go' : '')} role="timer" aria-live="polite">
      <div class="inner">
        <div class="grow">
          <p class="eyebrow">{left > 0 ? 'Descanso' : 'A por la siguiente serie'}</p>
          <p class="time">{clock(left)}</p>
          <div class="bar"><i style={{ width: pct + '%' }} /></div>
        </div>
        <button type="button" class="btn sm" onClick={() => add(15)}>+15 s</button>
        <button type="button" class="btn sm primary" onClick={skip}>{left > 0 ? 'Saltar' : 'Cerrar'}</button>
      </div>
    </div>
  );
}

function ExerciseCard({ entry, ei, history }) {
  const info = exerciseInfo(entry);
  const tg = entry.target;
  const last = lastEntry(history, entry.ex);
  const sug = suggestion({ sets: tg.sets, min: tg.min, max: tg.max }, last);
  const unitM = (entry.unit || info.unit) === 'm';
  const allDone = entry.sets.length > 0 && entry.sets.every((x) => x.done);
  const repsLabel = unitM ? 'Metros' : tg.perSide ? 'Reps/brazo' : 'Reps';

  const toggle = (si) => {
    unlockAudio();
    const set = entry.sets[si];
    if (!set.done) {
      const r = parseNum(set.r);
      if (!r || r <= 0) { toast(unitM ? 'Escribe los metros' : 'Escribe las repeticiones'); return; }
      patchSet(ei, si, { done: true });
      const rest = tg.rest || 90;
      update((st) => ({ current: { ...st.current, restEnd: Date.now() + rest * 1000, restTotal: rest, restBeeped: false } }));
    } else {
      patchSet(ei, si, { done: false });
    }
  };

  const addSet = () => patchEntry(ei, (e) => {
    const prev = e.sets[e.sets.length - 1];
    return { ...e, sets: [...e.sets, { w: prev ? prev.w : null, r: null, rir: null, done: false }] };
  });
  const removeSet = () => patchEntry(ei, (e) => (e.sets.length > 1 ? { ...e, sets: e.sets.slice(0, -1) } : e));

  return (
    <section class={'ex-card' + (allDone ? ' done' : '')} aria-label={info.name}>
      <div class="ex-head">
        <span class="n">{String(ei + 1).padStart(2, '0')}</span>
        <div class="stack tight">
          <p class="ex-name">{info.name}</p>
          <div class="chips">
            {tg.ss && <span class="chip acc">Superserie {tg.ss}</span>}
            <span class="chip ink">{tg.sets} × {tg.min}–{tg.max}{unitM ? ' m' : tg.perSide ? '/brazo' : ''}</span>
            {tg.rir && <span class="chip">{/^\d/.test(tg.rir) ? 'RIR ' + tg.rir : tg.rir}</span>}
            <span class="chip">{clock(tg.rest || 90)}</span>
          </div>
        </div>
      </div>
      {last && <p class="last">Última vez ({last.session.date.slice(8, 10)}/{last.session.date.slice(5, 7)}): <span class="num">{summary(last.entry)}</span></p>}
      <p class={'hint' + (sug.kind === 'up' ? ' up' : '')}>{sug.text}</p>
      <div class="sets">
        <div class="set-row head"><span class="idx">#</span><span>{unitM ? 'Kg/mano' : 'Kg'}</span><span>{repsLabel}</span><span>RIR</span><span /></div>
        {entry.sets.map((set, si) => (
          <div class={'set-row' + (set.done ? ' is-done' : '')} key={si}>
            <span class="idx">{si + 1}</span>
            <input inputMode="decimal" placeholder="kg" aria-label={'Peso de la serie ' + (si + 1)} value={shown(set.w)} onInput={(e) => patchSet(ei, si, { w: e.currentTarget.value })} />
            <input inputMode="numeric" placeholder={unitM ? String(tg.max) : tg.min + '–' + tg.max} aria-label={repsLabel + ' de la serie ' + (si + 1)} value={shown(set.r)} onInput={(e) => patchSet(ei, si, { r: e.currentTarget.value })} />
            <select aria-label={'RIR de la serie ' + (si + 1)} value={set.rir ?? ''} onChange={(e) => patchSet(ei, si, { rir: e.currentTarget.value === '' ? null : Number(e.currentTarget.value) })}>
              <option value="">–</option>
              {[0, 1, 2, 3, 4].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <button type="button" class="tick" aria-pressed={String(!!set.done)} aria-label={'Serie ' + (si + 1) + (set.done ? ' hecha' : ' pendiente')} onClick={() => toggle(si)}><Icon.check /></button>
          </div>
        ))}
      </div>
      <div class="row between">
        <div class="btns">
          <button type="button" class="btn sm" onClick={addSet}><Icon.plus /> Serie</button>
          <button type="button" class="btn sm ghost" onClick={removeSet} disabled={entry.sets.length <= 1}><Icon.minus /> Serie</button>
        </div>
      </div>
      <details class="cue">
        <summary>Técnica y alternativa</summary>
        {info.cue && <p>{info.cue}</p>}
        {info.alt && <p class="muted">Si la máquina está ocupada: {info.alt}.</p>}
      </details>
      <Videos list={info.videos} />
    </section>
  );
}

function normalize(cur) {
  return {
    ...cur,
    restEnd: undefined, restTotal: undefined, restBeeped: undefined,
    finishedAt: Date.now(),
    entries: cur.entries.map((e) => ({
      ...e,
      sets: e.sets.map((x) => ({ w: parseNum(x.w), r: parseNum(x.r), rir: x.rir ?? null, done: !!x.done && (parseNum(x.r) || 0) > 0 }))
    }))
  };
}

export function Workout() {
  const s = useStore();
  const cur = s.current;
  const [finishing, setFinishing] = useState(null);

  useEffect(() => {
    keepAwake(true);
    const onVis = () => { if (document.visibilityState === 'visible') keepAwake(true); };
    document.addEventListener('visibilitychange', onVis);
    return () => { document.removeEventListener('visibilitychange', onVis); keepAwake(false); };
  }, []);

  if (!cur) {
    return (
      <>
        <Top title="Entreno" back="#/hoy" />
        <main class="content">
          <p class="empty">No hay ningún entreno en curso.</p>
          <a class="btn primary" href="#/hoy">Volver a Hoy</a>
        </main>
      </>
    );
  }

  const history = s.sessions;
  const done = cur.entries.reduce((a, e) => a + e.sets.filter((x) => x.done).length, 0);
  const total = cur.entries.reduce((a, e) => a + e.sets.length, 0);

  const askFinish = async () => {
    if (!done) {
      const ok = await confirmDialog({ title: 'Sin series registradas', text: 'No has marcado ninguna serie como hecha. ¿Quieres descartar este entreno?', ok: 'Descartar', danger: true });
      if (ok) { update({ current: null }); goBack('hoy'); }
      return;
    }
    const sess = normalize(cur);
    const prs = [];
    let volume = 0;
    for (const e of sess.entries) {
      const sets = doneSets(e);
      for (const x of sets) volume += (x.w || 0) * (x.r || 0);
      const prev = bestE1rm(history, e.ex);
      const best = Math.max(0, ...sets.map((x) => e1rm(x.w, x.r)));
      if (prev > 0 && best > prev * 1.005) prs.push(exerciseInfo(e).name);
    }
    setFinishing({ sess, prs, volume, minutes: Math.round((sess.finishedAt - sess.startedAt) / 60000) });
  };

  const save = () => {
    const sess = finishing.sess;
    delete sess.restEnd; delete sess.restTotal; delete sess.restBeeped;
    update((st) => ({ sessions: [...st.sessions, sess].sort((a, b) => (a.date === b.date ? a.startedAt - b.startedAt : a.date < b.date ? -1 : 1)), current: null }));
    setFinishing(null);
    toast(finishing.prs.length ? 'Entreno guardado · ' + finishing.prs.length + ' récord' + (finishing.prs.length > 1 ? 's' : '') : 'Entreno guardado');
    goBack('hoy');
  };

  const discard = async () => {
    const ok = await confirmDialog({ title: 'Descartar entreno', text: 'Se borrará todo lo que has apuntado en este entreno.', ok: 'Descartar', danger: true });
    if (ok) { update({ current: null }); goBack('hoy'); }
  };

  return (
    <>
      <Top title={cur.dayName} sub={<><span class="num">{done}/{total}</span> series · <Elapsed since={cur.startedAt} /></>} back="#/hoy" />
      <main class="content full">
        <p class="small muted">Calienta 5 min y haz 2–3 series de aproximación en el primer ejercicio de cada músculo. Toca el ✓ al acabar cada serie y empieza el descanso.</p>
        {cur.entries.map((entry, ei) => <ExerciseCard key={ei} entry={entry} ei={ei} history={history} />)}
        <div class="card">
          <p class="small">Para terminar: 10 min de cinta inclinada o bici, a un ritmo en el que puedas hablar.</p>
          <button type="button" class="btn primary block" onClick={askFinish}><Icon.check /> Terminar entreno</button>
          <button type="button" class="btn danger block" onClick={discard}>Descartar entreno</button>
        </div>
      </main>
      <RestBar cur={cur} />
      {finishing && (
        <Sheet title="Entreno terminado" onClose={() => setFinishing(null)}>
          <div class="stats three">
            <div><p class="k">Series</p><p class="v">{finishing.sess.entries.reduce((a, e) => a + doneSets(e).length, 0)}</p></div>
            <div><p class="k">Minutos</p><p class="v">{finishing.minutes}</p></div>
            <div><p class="k">Volumen</p><p class="v">{miles(finishing.volume)}</p><p class="s">kg × reps</p></div>
          </div>
          {finishing.prs.length > 0 ? (
            <div class="card okc"><p class="k">Récords de fuerza</p><ul class="dots small">{finishing.prs.map((p) => <li key={p}>{p}</li>)}</ul></div>
          ) : (
            <p class="small muted">Sin récords hoy. Lo importante es sumar una repetición o un poco de peso cada semana.</p>
          )}
          <p class="small">Ahora: cena con proteína en la próxima hora y a dormir pronto.</p>
          <button type="button" class="btn primary block" onClick={save}>Guardar entreno</button>
          <button type="button" class="btn ghost block" onClick={() => setFinishing(null)}>Seguir entrenando</button>
        </Sheet>
      )}
    </>
  );
}
