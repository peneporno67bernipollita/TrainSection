import { useMemo, useState } from 'preact/hooks';
import { useStore, update } from '../lib/store.js';
import { decodeRoutine, extractCode } from '../lib/share.js';
import { readQrFromFile } from '../lib/qr.js';
import { pickFile, copyText } from '../lib/files.js';
import { isStandalone, isIOS } from '../lib/install.js';
import { exerciseName } from '../data/exercises.js';
import { Top, Icon, Plate, toast } from '../ui.jsx';
import { go, goBack } from '../nav.js';

export function ImportRoutine({ code: initialCode }) {
  const s = useStore();
  const [text, setText] = useState(initialCode ? '#/importar/' + initialCode : '');
  const [code, setCode] = useState(initialCode || '');
  const result = useMemo(() => {
    if (!code) return null;
    try { return { routine: decodeRoutine(code) }; } catch (e) { return { error: e.message }; }
  }, [code]);

  const openedFromLink = !!initialCode;
  const inBrowserOnIPhone = openedFromLink && isIOS() && !isStandalone();

  const check = () => {
    const c = extractCode(text);
    if (!c) { toast('Pega primero el enlace o el código'); return; }
    setCode(c);
  };

  const scan = async () => {
    const file = await pickFile('image/*');
    if (!file) return;
    try {
      const data = await readQrFromFile(file);
      if (!data) { toast('No encuentro un QR en esa foto'); return; }
      setText(data);
      setCode(extractCode(data));
    } catch (e) {
      toast(e.message);
    }
  };

  const save = (activate) => {
    const r = result.routine;
    update((st) => ({ routines: [...st.routines, r], activeRoutineId: activate ? r.id : st.activeRoutineId }));
    toast(activate ? 'Rutina guardada y activada' : 'Rutina guardada');
    if (s.profile) goBack('rutinas');
    else go('hoy', { replace: true });
  };

  return (
    <>
      <Top title="Importar rutina" back={s.profile ? '#/rutinas' : undefined} />
      <main class="content">
        {inBrowserOnIPhone && (
          <div class="card alert">
            <p class="k">En iPhone</p>
            <p class="small">Safari y la app de la pantalla de inicio guardan los datos por separado, así que no importes la rutina aquí:</p>
            <ol class="dots small">
              <li>Si aún no la tienes, instálala: Compartir → «Añadir a pantalla de inicio».</li>
              <li>Copia el código con el botón de abajo.</li>
              <li>Abre TrainSection desde la pantalla de inicio y pégalo en Rutinas → «Importar de un amigo».</li>
            </ol>
            <button type="button" class="btn primary" onClick={async () => toast((await copyText(text)) ? 'Código copiado' : 'No he podido copiar')}><Icon.copy /> Copiar código</button>
          </div>
        )}
        {!result?.routine && (
          <div class="card">
            <p class="k">Pega el enlace o el código</p>
            <textarea class="textarea" value={text} onInput={(e) => setText(e.currentTarget.value)} placeholder="https://…#/importar/…" aria-label="Enlace o código de la rutina" />
            <div class="btns">
              <button type="button" class="btn primary" onClick={check}>Ver rutina</button>
              <button type="button" class="btn" onClick={scan}><Icon.camera /> Leer QR de una foto</button>
            </div>
          </div>
        )}
        {result?.error && <div class="card alert"><p class="small">{result.error}</p></div>}
        {result?.routine && (
          <div class="card">
            <p class="k">Rutina recibida</p>
            <p class="h2">{result.routine.name}</p>
            {result.routine.days.map((d) => (
              <div key={d.id} class="stack tight">
                <div class="row"><Plate plate={d.plate} sm /><strong>{d.name}</strong></div>
                <p class="small muted">{d.items.map((it) => exerciseName(it) + ' ' + it.sets + '×' + it.min + '–' + it.max).join(' · ')}</p>
              </div>
            ))}
            <div class="btns">
              <button type="button" class="btn primary" onClick={() => save(true)}>Guardar y usar</button>
              <button type="button" class="btn" onClick={() => save(false)}>Solo guardar</button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
