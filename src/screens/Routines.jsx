import { useStore, update } from '../lib/store.js';
import { PRESET_ID } from '../data/preset.js';
import { exerciseName } from '../data/exercises.js';
import { Top, Icon, Plate, toast, confirmDialog } from '../ui.jsx';
import { go } from '../nav.js';

export function newRoutineId() {
  return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

export function copyRoutine(r, name) {
  const copy = JSON.parse(JSON.stringify(r));
  copy.id = newRoutineId();
  copy.name = name || r.name + ' (mi versión)';
  copy.source = 'custom';
  delete copy.version;
  return copy;
}

export function Routines() {
  const s = useStore();
  const active = s.routines.find((r) => r.id === s.activeRoutineId);

  const activate = (r) => { update({ activeRoutineId: r.id }); toast('Rutina activa: ' + r.name); };

  const edit = (r) => {
    if (r.id === PRESET_ID) {
      const copy = copyRoutine(r);
      update((st) => ({ routines: [...st.routines, copy] }));
      toast('He creado una copia editable');
      go('rutinas/editar/' + copy.id);
      return;
    }
    go('rutinas/editar/' + r.id);
  };

  const remove = async (r) => {
    const ok = await confirmDialog({ title: 'Borrar rutina', text: '«' + r.name + '» se borrará de esta app. Tus entrenos guardados no se borran.', ok: 'Borrar', danger: true });
    if (!ok) return;
    update((st) => {
      const routines = st.routines.filter((x) => x.id !== r.id);
      return { routines, activeRoutineId: st.activeRoutineId === r.id ? PRESET_ID : st.activeRoutineId };
    });
    toast('Rutina borrada');
  };

  const newRoutine = () => {
    const r = {
      id: newRoutineId(), name: 'Mi rutina', source: 'custom',
      days: [{ id: 'd' + Date.now().toString(36), name: 'Día 1', short: 'L', focus: '', plate: 'p25', type: 'up', time: 60, items: [] }]
    };
    update((st) => ({ routines: [...st.routines, r] }));
    go('rutinas/editar/' + r.id);
  };

  return (
    <>
      <Top title="Rutinas" right={<a class="iconbtn" href="#/ajustes" aria-label="Ajustes"><Icon.gear /></a>} />
      <main class="content">
        {active && (
          <div class="card">
            <p class="k">Rutina activa</p>
            <p class="h2">{active.name}</p>
            <div class="stack tight">
              {active.days.map((d) => (
                <details class="cue" key={d.id}>
                  <summary><span class="row" style={{ display: 'inline-flex', verticalAlign: 'middle' }}><Plate plate={d.plate} sm /> {d.name}{d.short ? ' · ' + d.short : ''}</span></summary>
                  <ol class="dots small" style={{ marginTop: '6px' }}>
                    {d.items.map((it, i) => <li key={i}>{exerciseName(it)} · <span class="num">{it.sets} × {it.min}–{it.max}</span></li>)}
                  </ol>
                </details>
              ))}
            </div>
            <div class="btns">
              <button type="button" class="btn sm" onClick={() => edit(active)}><Icon.edit /> Editar</button>
              <a class="btn sm" href={'#/rutinas/compartir/' + active.id}><Icon.share /> Compartir</a>
            </div>
          </div>
        )}

        <div class="card flat list">
          {s.routines.filter((r) => r.id !== s.activeRoutineId).map((r) => (
            <div class="item" key={r.id}>
              <div class="grow">
                <p><strong>{r.name}</strong></p>
                <p class="small muted">{r.days.length} días · {r.source === 'preset' ? 'plan original' : r.source === 'import' ? 'importada' : 'tuya'}</p>
              </div>
              <div class="btns">
                <button type="button" class="btn sm primary" onClick={() => activate(r)}>Usar</button>
                <a class="btn sm" href={'#/rutinas/compartir/' + r.id} aria-label={'Compartir ' + r.name}><Icon.share /></a>
                <button type="button" class="btn sm" onClick={() => edit(r)} aria-label={'Editar ' + r.name}><Icon.edit /></button>
                {r.id !== PRESET_ID && <button type="button" class="btn sm danger" onClick={() => remove(r)} aria-label={'Borrar ' + r.name}><Icon.trash /></button>}
              </div>
            </div>
          ))}
          {s.routines.length <= 1 && <p class="empty small">Solo tienes una rutina. Crea una o importa la de un amigo.</p>}
        </div>

        <div class="btns">
          <button type="button" class="btn" onClick={newRoutine}><Icon.plus /> Nueva rutina</button>
          <a class="btn" href="#/importar">Importar de un amigo</a>
        </div>

        <div class="card">
          <p class="k">Calistenia los sábados</p>
          <p class="small">Va aparte de la rutina: habilidades y fuerza con tu peso, sin llegar al fallo.</p>
          <a class="btn sm" href="#/guia/calistenia">Ver guía y tutoriales</a>
        </div>
      </main>
    </>
  );
}
