import { useEffect, useState } from 'preact/hooks';
import { useStore, update } from '../lib/store.js';
import { today, fmtLong } from '../lib/dates.js';
import { POSES, MEASURES, measuresDue } from '../lib/checkin.js';
import { compressImage } from '../lib/image.js';
import { pickFile } from '../lib/files.js';
import { savePhoto } from '../lib/db.js';
import { parseNum, dec } from '../lib/format.js';
import { Top, Icon, Field, toast } from '../ui.jsx';
import { go } from '../nav.js';

function PoseTile({ label, blob, onPick }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!blob) { setUrl(null); return undefined; }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return (
    <button type="button" class={'pose' + (blob ? ' has' : '')} onClick={onPick} aria-label={(blob ? 'Repetir foto: ' : 'Hacer foto: ') + label}>
      {url && <img src={url} alt="" />}
      {!url && <Icon.camera />}
      <span class="lbl">{label}</span>
    </button>
  );
}

export function Checkin() {
  const s = useStore();
  const t = today();
  const needMeasures = measuresDue(s, t);
  const [photos, setPhotos] = useState({});
  const [weight, setWeight] = useState(s.weights[t] != null ? dec(s.weights[t]) : '');
  const [waist, setWaist] = useState('');
  const [measures, setMeasures] = useState({});
  const [busy, setBusy] = useState(false);

  const take = async (pose) => {
    const file = await pickFile('image/*');
    if (!file) return;
    try {
      const blob = await compressImage(file);
      setPhotos((p) => ({ ...p, [pose]: blob }));
    } catch (e) {
      toast(e.message || 'No se pudo usar esa foto');
    }
  };

  const missing = POSES.filter(([k]) => !photos[k]).length;
  const w = parseNum(weight);
  const wa = parseNum(waist);
  const ready = missing === 0 && w && w >= 30 && w <= 250 && wa && wa >= 40 && wa <= 200;

  const save = async () => {
    if (!ready) {
      toast(missing ? 'Faltan ' + missing + ' foto' + (missing > 1 ? 's' : '') : 'Pon el peso y la cintura');
      return;
    }
    setBusy(true);
    try {
      const id = 'c' + t.replace(/-/g, '') + Date.now().toString(36).slice(-4);
      const ids = {};
      for (const [k] of POSES) {
        ids[k] = id + '-' + k;
        await savePhoto(ids[k], photos[k]);
      }
      const m = {};
      for (const [k] of MEASURES) { const v = parseNum(measures[k]); if (v) m[k] = v; }
      const entry = { id, date: t, weight: w, waist: wa, measures: Object.keys(m).length ? m : null, photos: ids };
      update((st) => ({
        checkins: [...st.checkins.filter((c) => c.date !== t), entry].sort((a, b) => (a.date < b.date ? -1 : 1)),
        weights: { ...st.weights, [t]: w },
        settings: { ...st.settings, postponed: null }
      }));
      toast('Check-in guardado');
      go('hoy');
    } catch (e) {
      toast('No se han podido guardar las fotos. ¿Queda espacio en el móvil?');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Top title="Check-in" sub={fmtLong(t)} back="#/hoy" />
      <main class="content full">
        <div class="card">
          <p class="k">Cómo hacer las fotos</p>
          <ul class="dots small">
            <li>Por la mañana, en ayunas y antes de entrenar, sin bombeo.</li>
            <li>Mismo sitio, misma luz y misma ropa cada vez.</li>
            <li>Móvil a la altura del ombligo, a 2–3 m, con temporizador.</li>
          </ul>
        </div>
        <div class="poses">
          {POSES.map(([k, label]) => <PoseTile key={k} label={label} blob={photos[k]} onPick={() => take(k)} />)}
        </div>
        <div class="grid2">
          <Field label="Peso (kg)"><input class="input num" inputMode="decimal" placeholder="68,4" value={weight} onInput={(e) => setWeight(e.currentTarget.value)} /></Field>
          <Field label="Cintura (cm)"><input class="input num" inputMode="decimal" placeholder="80" value={waist} onInput={(e) => setWaist(e.currentTarget.value)} /></Field>
        </div>
        <p class="tiny muted">Cintura: cinta a la altura del ombligo, relajado y después de soltar el aire.</p>
        {needMeasures && (
          <div class="card">
            <p class="k">Medidas (cada 4 semanas)</p>
            <div class="grid2">
              {MEASURES.map(([k, label]) => (
                <Field key={k} label={label + ' (cm)'}>
                  <input class="input num" inputMode="decimal" value={measures[k] || ''} onInput={(e) => setMeasures({ ...measures, [k]: e.currentTarget.value })} />
                </Field>
              ))}
            </div>
          </div>
        )}
        <button type="button" class="btn primary block" disabled={busy} onClick={save}>{busy ? 'Guardando…' : 'Guardar check-in'}</button>
        <p class="tiny muted center">Las fotos se guardan solo en este móvil. Haz una copia de seguridad de vez en cuando desde Ajustes.</p>
      </main>
    </>
  );
}
