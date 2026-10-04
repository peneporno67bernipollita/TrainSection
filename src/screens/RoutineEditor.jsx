import { useState } from 'preact/hooks';
import { useStore, update } from '../lib/store.js';
import { PRESET_ID, PLATES } from '../data/preset.js';
import { EXERCISES, MUSCLES, exerciseName, parseYouTubeId } from '../data/exercises.js';
import { Top, Icon, Plate, Sheet, toast, confirmDialog, Field } from '../ui.jsx';
import { go } from '../nav.js';

const RESTS = [45, 60, 75, 90, 105, 120, 150, 180, 240];
const LETTERS = ['', 'A', 'B', 'C', 'D'];
const intOr = (v, d) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : d; };

function ExercisePicker({ onPick, onClose }) {
  const [q, setQ] = useState('');
  const [custom, setCustom] = useState({ name: '', video: '', muscle: 'pecho' });
  const norm = (x) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const list = Object.values(EXERCISES).filter((e) => !q || norm(e.name).includes(norm(q)) || norm(MUSCLES[e.muscle] || '').includes(norm(q)));
  const groups = {};
  for (const e of list) (groups[e.muscle] = groups[e.muscle] || []).push(e);
  const addCustom = () => {
    if (!custom.name.trim()) { toast('Ponle nombre al ejercicio'); return; }
    const video = parseYouTubeId(custom.video) || '';
    if (custom.video && !video) { toast('El enlace de YouTube no es válido'); return; }
    onPick({ ex: 'custom:' + Math.random().toString(36).slice(2, 8), custom: { name: custom.name.trim(), video, muscle: custom.muscle } });
  };
  return (
    <Sheet title="Añadir ejercicio" onClose={onClose}>
      <input class="input" placeholder="Buscar por nombre o músculo" value={q} onInput={(e) => setQ(e.currentTarget.value)} aria-label="Buscar ejercicio" />
      {Object.keys(groups).map((m) => (
        <div class="stack tight" key={m}>
          <p class="eyebrow">{MUSCLES[m] || m}</p>
          <div class="card flat list">
            {groups[m].map((e) => (
              <button type="button" key={e.id} class="item" style={{ background: 'none', border: 0, textAlign: 'left', cursor: 'pointer', width: '100%' }} onClick={() => onPick({ ex: e.id })}>
                <span class="grow">{e.name}</span><Icon.plus />
              </button>
            ))}
          </div>
        </div>
      ))}
      <div class="card">
        <p class="k">Ejercicio propio</p>
        <Field label="Nombre"><input class="input" value={custom.name} onInput={(e) => setCustom({ ...custom, name: e.currentTarget.value })} /></Field>
        <Field label="Vídeo de YouTube (opcional)"><input class="input" placeholder="Pega el enlace" value={custom.video} onInput={(e) => setCustom({ ...custom, video: e.currentTarget.value })} /></Field>
        <Field label="Músculo">
          <select class="select" value={custom.muscle} onChange={(e) => setCustom({ ...custom, muscle: e.currentTarget.value })}>
            {Object.entries(MUSCLES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </Field>
        <button type="button" class="btn" onClick={addCustom}><Icon.plus /> Añadir el mío</button>
      </div>
    </Sheet>
  );
}

function ItemEditor({ it, ii, total, onChange, onMove, onRemove }) {
  return (
    <div class="stack tight" style={{ padding: '12px 14px' }}>
      <div class="row">
        <span class="num small muted">{String(ii + 1).padStart(2, '0')}</span>
        <p class="grow"><strong>{exerciseName(it)}</strong></p>
        <button type="button" class="iconbtn" aria-label="Subir" disabled={ii === 0} onClick={() => onMove(-1)}><Icon.up /></button>
        <button type="button" class="iconbtn" aria-label="Bajar" disabled={ii === total - 1} onClick={() => onMove(1)}><Icon.down /></button>
        <button type="button" class="iconbtn" aria-label="Quitar" onClick={onRemove}><Icon.trash /></button>
      </div>
      <div class="grid3">
        <Field label="Series"><input class="input num" type="number" inputMode="numeric" min="1" max="10" value={it.sets} onInput={(e) => onChange({ sets: Math.min(10, Math.max(1, intOr(e.currentTarget.value, it.sets))) })} /></Field>
        <Field label="Mín."><input class="input num" type="number" inputMode="numeric" min="1" max="100" value={it.min} onInput={(e) => onChange({ min: Math.max(1, intOr(e.currentTarget.value, it.min)) })} /></Field>
        <Field label="Máx."><input class="input num" type="number" inputMode="numeric" min="1" max="100" value={it.max} onInput={(e) => onChange({ max: Math.max(1, intOr(e.currentTarget.value, it.max)) })} /></Field>
      </div>
      <div class="grid3">
        <Field label="RIR"><input class="input num" value={it.rir || ''} placeholder="1–2" onInput={(e) => onChange({ rir: e.currentTarget.value.slice(0, 10) })} /></Field>
        <Field label="Descanso">
          <select class="select" value={it.rest} onChange={(e) => onChange({ rest: Number(e.currentTarget.value) })}>
            {[...new Set([...RESTS, it.rest])].sort((a, b) => a - b).map((v) => <option key={v} value={v}>{Math.floor(v / 60)}:{String(v % 60).padStart(2, '0')}</option>)}
          </select>
        </Field>
        <Field label="Superserie">
          <select class="select" value={it.ss || ''} onChange={(e) => onChange({ ss: e.currentTarget.value || undefined })}>
            {LETTERS.map((l) => <option key={l} value={l}>{l || '–'}</option>)}
          </select>
        </Field>
      </div>
      <label class="check"><input type="checkbox" checked={!!it.perSide} onChange={(e) => onChange({ perSide: e.currentTarget.checked })} /><span class="small">Repeticiones por brazo o por pierna</span></label>
    </div>
  );
}

export function RoutineEditor({ id }) {
  const s = useStore();
  const orig = s.routines.find((r) => r.id === id);
  const [r, setR] = useState(() => (orig ? JSON.parse(JSON.stringify(orig)) : null));
  const [picker, setPicker] = useState(null);
  const [openDay, setOpenDay] = useState(0);

  if (!orig || !r) {
    return (<><Top title="Rutina" back="#/rutinas" /><main class="content"><p class="empty">No encuentro esta rutina.</p></main></>);
  }
  if (orig.id === PRESET_ID) {
    return (<><Top title="Plan Fase 1" back="#/rutinas" /><main class="content"><p class="small">El plan original no se edita. Desde Rutinas, pulsa Editar y se creará una copia tuya.</p></main></>);
  }

  const setDay = (di, patch) => setR({ ...r, days: r.days.map((d, i) => (i === di ? { ...d, ...patch } : d)) });
  const setItems = (di, fn) => setDay(di, { items: fn(r.days[di].items) });
  const move = (arr, i, dir) => { const a = arr.slice(); const j = i + dir; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; };

  const addDay = () => {
    const n = r.days.length;
    if (n >= 7) { toast('Como mucho 7 días'); return; }
    setR({ ...r, days: [...r.days, { id: 'd' + Date.now().toString(36), name: 'Día ' + (n + 1), short: '', focus: '', plate: PLATES[n % PLATES.length], type: 'up', time: 60, items: [] }] });
    setOpenDay(n);
  };

  const removeDay = async (di) => {
    if (r.days.length <= 1) { toast('La rutina necesita al menos un día'); return; }
    const ok = await confirmDialog({ title: 'Quitar día', text: '«' + r.days[di].name + '» y sus ejercicios saldrán de la rutina.', ok: 'Quitar', danger: true });
    if (ok) { setR({ ...r, days: r.days.filter((_, i) => i !== di) }); setOpenDay(0); }
  };

  const save = () => {
    if (!r.name.trim()) { toast('Ponle nombre a la rutina'); return; }
    if (r.days.some((d) => !d.items.length)) { toast('Cada día necesita al menos un ejercicio'); return; }
    const clean = {
      ...r,
      name: r.name.trim().slice(0, 60),
      days: r.days.map((d) => ({ ...d, name: (d.name || 'Día').trim().slice(0, 40), items: d.items.map((it) => ({ ...it, max: Math.max(it.min, it.max) })) }))
    };
    update((st) => ({ routines: st.routines.map((x) => (x.id === clean.id ? clean : x)) }));
    toast('Rutina guardada');
    go('rutinas');
  };

  return (
    <>
      <Top title="Editar rutina" back="#/rutinas" right={<button type="button" class="btn primary sm" onClick={save}>Guardar</button>} />
      <main class="content">
        <Field label="Nombre de la rutina"><input class="input" value={r.name} onInput={(e) => setR({ ...r, name: e.currentTarget.value })} /></Field>
        {r.days.map((d, di) => (
          <div class="card flat" key={d.id}>
            <button type="button" class="item" style={{ background: 'none', border: 0, width: '100%', textAlign: 'left', cursor: 'pointer' }} aria-expanded={String(openDay === di)} onClick={() => setOpenDay(openDay === di ? -1 : di)}>
              <Plate plate={d.plate} sm />
              <span class="grow"><strong>{d.name}</strong> <span class="small muted">· {d.items.length} ejercicios</span></span>
              {openDay === di ? <Icon.up /> : <Icon.down />}
            </button>
            {openDay === di && (
              <div class="stack" style={{ padding: '0 14px 14px' }}>
                <div class="grid2">
                  <Field label="Nombre del día"><input class="input" value={d.name} onInput={(e) => setDay(di, { name: e.currentTarget.value })} /></Field>
                  <Field label="Letra del día"><input class="input" maxLength={2} value={d.short || ''} placeholder="L" onInput={(e) => setDay(di, { short: e.currentTarget.value.toUpperCase() })} /></Field>
                </div>
                <Field label="Enfoque"><input class="input" value={d.focus || ''} placeholder="Qué trabaja este día" onInput={(e) => setDay(di, { focus: e.currentTarget.value })} /></Field>
                <div class="grid3">
                  <Field label="Tipo">
                    <select class="select" value={d.type || 'up'} onChange={(e) => setDay(di, { type: e.currentTarget.value })}>
                      <option value="up">Torso</option><option value="leg">Pierna</option>
                    </select>
                  </Field>
                  <Field label="Minutos"><input class="input num" type="number" inputMode="numeric" value={d.time || 60} onInput={(e) => setDay(di, { time: intOr(e.currentTarget.value, 60) })} /></Field>
                  <Field label="Color">
                    <select class="select" value={d.plate} onChange={(e) => setDay(di, { plate: e.currentTarget.value })}>
                      {PLATES.map((p, i) => <option key={p} value={p}>{['Rojo', 'Azul', 'Amarillo', 'Verde', 'Blanco'][i]}</option>)}
                    </select>
                  </Field>
                </div>
                <div class="card flat list">
                  {d.items.map((it, ii) => (
                    <ItemEditor key={ii + it.ex} it={it} ii={ii} total={d.items.length}
                      onChange={(patch) => setItems(di, (items) => items.map((x, k) => (k === ii ? { ...x, ...patch } : x)))}
                      onMove={(dir) => setItems(di, (items) => move(items, ii, dir))}
                      onRemove={() => setItems(di, (items) => items.filter((_, k) => k !== ii))} />
                  ))}
                  {!d.items.length && <p class="empty small">Sin ejercicios todavía.</p>}
                </div>
                <div class="btns">
                  <button type="button" class="btn sm primary" onClick={() => setPicker(di)}><Icon.plus /> Ejercicio</button>
                  <button type="button" class="btn sm" disabled={di === 0} onClick={() => { setR({ ...r, days: move(r.days, di, -1) }); setOpenDay(di - 1); }}><Icon.up /> Día</button>
                  <button type="button" class="btn sm" disabled={di === r.days.length - 1} onClick={() => { setR({ ...r, days: move(r.days, di, 1) }); setOpenDay(di + 1); }}><Icon.down /> Día</button>
                  <button type="button" class="btn sm danger" onClick={() => removeDay(di)}><Icon.trash /> Día</button>
                </div>
              </div>
            )}
          </div>
        ))}
        <button type="button" class="btn" onClick={addDay}><Icon.plus /> Añadir día</button>
        <button type="button" class="btn primary block" onClick={save}>Guardar rutina</button>
      </main>
      {picker != null && (
        <ExercisePicker onClose={() => setPicker(null)} onPick={(base) => {
          setItems(picker, (items) => [...items, { sets: 3, min: 8, max: 12, rir: '1–2', rest: 90, ...base }]);
          setPicker(null);
          toast('Ejercicio añadido');
        }} />
      )}
    </>
  );
}
