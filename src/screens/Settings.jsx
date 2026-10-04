import { useEffect, useState } from 'preact/hooks';
import { useStore, update } from '../lib/store.js';
import { targets } from '../lib/nutrition.js';
import { buildBackup, restoreBackup } from '../lib/backup.js';
import { buildIcs } from '../lib/ics.js';
import { saveFile, pickFile, isNative } from '../lib/files.js';
import { wipe } from '../lib/db.js';
import { today, fmtShort } from '../lib/dates.js';
import { miles, parseNum, dec } from '../lib/format.js';
import { Top, Field, toast, confirmDialog } from '../ui.jsx';
import { go } from '../nav.js';

export const APP_VERSION = '1.0.0';

export function ProfileForm({ initial, onSave, submitLabel = 'Guardar' }) {
  const [p, setP] = useState({
    name: initial?.name || '',
    sex: initial?.sex || 'h',
    age: initial?.age ?? '',
    height: initial?.height ?? '',
    weight: initial?.weight != null ? dec(initial.weight) : '',
    bmr: initial?.bmr ?? '',
    job: String(initial?.job ?? 0)
  });
  const set = (k) => (e) => setP({ ...p, [k]: e.currentTarget.value });
  const submit = (e) => {
    e.preventDefault();
    const age = parseNum(p.age), height = parseNum(p.height), weight = parseNum(p.weight), bmr = parseNum(p.bmr);
    if (!age || age < 14 || age > 80) { toast('Edad entre 14 y 80'); return; }
    if (!height || height < 140 || height > 220) { toast('Altura en cm, entre 140 y 220'); return; }
    if (!weight || weight < 35 || weight > 200) { toast('Peso en kg, entre 35 y 200'); return; }
    if (p.bmr !== '' && (!bmr || bmr < 1000 || bmr > 3500)) { toast('El basal va entre 1.000 y 3.500 kcal, o déjalo vacío'); return; }
    onSave({ name: p.name.trim().slice(0, 30), sex: p.sex, age: Math.round(age), height: Math.round(height), weight, bmr: p.bmr === '' ? null : Math.round(bmr), job: Number(p.job) });
  };
  return (
    <form class="stack" onSubmit={submit} novalidate>
      <Field label="Nombre (opcional)"><input class="input" value={p.name} onInput={set('name')} autoComplete="given-name" /></Field>
      <div class="grid2">
        <Field label="Sexo">
          <select class="select" value={p.sex} onChange={set('sex')}><option value="h">Hombre</option><option value="m">Mujer</option></select>
        </Field>
        <Field label="Edad"><input class="input num" inputMode="numeric" value={p.age} onInput={set('age')} /></Field>
        <Field label="Altura (cm)"><input class="input num" inputMode="numeric" value={p.height} onInput={set('height')} /></Field>
        <Field label="Peso (kg)"><input class="input num" inputMode="decimal" value={p.weight} onInput={set('weight')} /></Field>
      </div>
      <Field label="Metabolismo basal medido (opcional)"><input class="input num" inputMode="numeric" placeholder="Vacío = lo calculo con una fórmula" value={p.bmr} onInput={set('bmr')} /></Field>
      <Field label="Trabajo">
        <select class="select" value={p.job} onChange={set('job')}>
          <option value="0">Sentado casi todo el día</option>
          <option value="0.1">De pie</option>
          <option value="0.25">Físico</option>
        </select>
      </Field>
      <button type="submit" class="btn primary block">{submitLabel}</button>
    </form>
  );
}

function StorageInfo() {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const persisted = navigator.storage?.persisted ? await navigator.storage.persisted() : null;
        const est = navigator.storage?.estimate ? await navigator.storage.estimate() : null;
        setInfo({ persisted, used: est?.usage || 0 });
      } catch { setInfo({ persisted: null, used: 0 }); }
    })();
  }, []);
  if (!info) return null;
  return (
    <p class="small muted">
      Ocupas {dec(info.used / 1048576, 1)} MB.{' '}
      {info.persisted === true ? 'El navegador no borrará estos datos por falta de espacio.' : info.persisted === false ? 'El navegador podría borrarlos si se queda sin espacio: haz copias.' : ''}
    </p>
  );
}

export function Settings() {
  const s = useStore();
  const tg = targets(s.profile, 'up');
  const [busy, setBusy] = useState(false);

  const saveProfile = (p) => {
    update((st) => ({ profile: { ...st.profile, ...p }, weights: st.weights[today()] == null ? { ...st.weights, [today()]: p.weight } : st.weights }));
    toast('Perfil guardado');
  };

  const setSetting = (k, v) => update((st) => ({ settings: { ...st.settings, [k]: v } }));

  const exportBackup = async () => {
    setBusy(true);
    try {
      const json = await buildBackup();
      const r = await saveFile('trainsection-copia-' + today() + '.json', json, 'application/json');
      if (r !== 'cancelled') { setSetting('lastBackup', today()); toast('Copia lista'); }
    } catch (e) {
      toast('No se pudo crear la copia');
    } finally { setBusy(false); }
  };

  const importBackup = async () => {
    const file = await pickFile('application/json,.json');
    if (!file) return;
    const ok = await confirmDialog({ title: 'Restaurar copia', text: 'Se sustituirán todos los datos de esta app por los de la copia.', ok: 'Restaurar', danger: true });
    if (!ok) return;
    setBusy(true);
    try {
      await restoreBackup(await file.text());
      toast('Copia restaurada');
      go('hoy');
    } catch (e) {
      toast(e.message || 'No se pudo restaurar');
    } finally { setBusy(false); }
  };

  const reminders = async () => {
    const ics = buildIcs({ gymTime: s.settings.gymTime, checkinEvery: s.settings.checkinEvery });
    await saveFile('trainsection-recordatorios.ics', ics, 'text/calendar');
  };

  const wipeAll = async () => {
    const ok = await confirmDialog({ title: 'Borrar todo', text: 'Se borrarán entrenos, fotos, peso y rutinas de este móvil. No se puede deshacer. Haz antes una copia.', ok: 'Borrar todo', danger: true });
    if (!ok) return;
    await wipe();
    location.hash = '#/hoy';
    location.reload();
  };

  return (
    <>
      <Top title="Ajustes" back="#/hoy" />
      <main class="content">
        <div class="card">
          <p class="k">Tu perfil</p>
          <ProfileForm initial={s.profile} onSave={saveProfile} />
          {tg && <p class="small muted">Día de torso: {miles(tg.kcal)} kcal · {tg.protein} g de proteína. Basal {miles(tg.basal)} kcal ({tg.measured ? 'medido' : 'estimado'}).</p>}
        </div>

        <div class="card">
          <p class="k">Plan</p>
          <div class="grid2">
            <Field label="Hora del gimnasio"><input class="input num" type="time" value={s.settings.gymTime} onInput={(e) => setSetting('gymTime', e.currentTarget.value || '18:00')} /></Field>
            <Field label="Check-in cada">
              <select class="select" value={s.settings.checkinEvery} onChange={(e) => setSetting('checkinEvery', Number(e.currentTarget.value))}>
                <option value={7}>7 días</option><option value={14}>14 días</option><option value={28}>28 días</option>
              </select>
            </Field>
          </div>
          <button type="button" class="btn" onClick={reminders}>Añadir recordatorios al calendario</button>
          <p class="small muted">Crea avisos de gimnasio (L–V), batido, calistenia, tápers del domingo, check-in y hora de dormir. Ábrelo con tu app de calendario.</p>
        </div>

        <div class="card">
          <p class="k">Copia de seguridad</p>
          <p class="small">Tus datos y fotos viven solo en este móvil. Exporta una copia cada pocas semanas y guárdala en Drive o en el ordenador.</p>
          <div class="btns">
            <button type="button" class="btn primary" disabled={busy} onClick={exportBackup}>Exportar copia</button>
            <button type="button" class="btn" disabled={busy} onClick={importBackup}>Restaurar copia</button>
          </div>
          <p class="small muted">{s.settings.lastBackup ? 'Última copia: ' + fmtShort(s.settings.lastBackup) + '.' : 'Aún no has hecho ninguna copia.'}</p>
          <StorageInfo />
        </div>

        <div class="card">
          <p class="k">Acerca de</p>
          <p class="small">TrainSection {APP_VERSION}{isNative() ? ' · app Android' : ''}. Plan orientativo para personas sanas: no sustituye a un médico, un fisioterapeuta o un dietista-nutricionista.</p>
          <p class="small muted">Vídeos de técnica de Renaissance Periodization, Jeff Nippard y otros canales de YouTube; recetas de canales de cocina en español.</p>
          <button type="button" class="btn danger" onClick={wipeAll}>Borrar todos los datos</button>
        </div>
      </main>
    </>
  );
}
