import { useStore, update } from '../lib/store.js';
import { fmtLong } from '../lib/dates.js';
import { doneSets, summary } from '../lib/training.js';
import { exerciseInfo } from '../data/exercises.js';
import { Top, Icon, Plate, toast, confirmDialog } from '../ui.jsx';
import { go } from '../nav.js';

export function SessionDetail({ id }) {
  const s = useStore();
  const x = s.sessions.find((y) => y.id === id);
  if (!x) return (<><Top title="Entreno" back="#/calendario" /><main class="content"><p class="empty">No encuentro este entreno.</p></main></>);

  const remove = async () => {
    const ok = await confirmDialog({ title: 'Borrar entreno', text: 'Se borrará este entreno del historial.', ok: 'Borrar', danger: true });
    if (!ok) return;
    update((st) => ({ sessions: st.sessions.filter((y) => y.id !== id) }));
    toast('Entreno borrado');
    go('calendario');
  };

  const minutes = x.finishedAt ? Math.round((x.finishedAt - x.startedAt) / 60000) : 0;
  return (
    <>
      <Top title={x.dayName} sub={fmtLong(x.date)} back="#/calendario" />
      <main class="content">
        <div class="row"><Plate plate={x.plate} /><p class="small muted">{x.entries.reduce((a, e) => a + doneSets(e).length, 0)} series · {minutes} min</p></div>
        <div class="card flat list">
          {x.entries.map((e, i) => (
            <div class="item" key={i} style={{ alignItems: 'flex-start' }}>
              <span class="num small muted" style={{ width: '1.8rem' }}>{String(i + 1).padStart(2, '0')}</span>
              <div class="grow">
                <p><strong>{exerciseInfo(e).name}</strong></p>
                <p class="small num">{summary(e) || 'Sin series hechas'}</p>
              </div>
            </div>
          ))}
        </div>
        <button type="button" class="btn danger" onClick={remove}><Icon.trash /> Borrar entreno</button>
      </main>
    </>
  );
}
