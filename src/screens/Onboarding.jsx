import { useState } from 'preact/hooks';
import { useStore, update } from '../lib/store.js';
import { PRESET_ID } from '../data/preset.js';
import { decodeRoutine, extractCode } from '../lib/share.js';
import { today, nextMonday } from '../lib/dates.js';
import { targets } from '../lib/nutrition.js';
import { miles } from '../lib/format.js';
import { ProfileForm } from './Settings.jsx';
import { toast, Field, useBackHandler } from '../ui.jsx';
import { go } from '../nav.js';

function Logo() {
  return (
    <svg class="logo" viewBox="0 0 100 100" aria-hidden="true">
      <rect width="100" height="100" rx="24" fill="var(--surface)" />
      <circle cx="50" cy="50" r="34" fill="var(--p25)" />
      <circle cx="50" cy="50" r="27" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="3" />
      <circle cx="50" cy="50" r="7" fill="var(--surface)" />
    </svg>
  );
}

export function Onboarding() {
  const s = useStore();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState(null);
  const [choice, setChoice] = useState(s.activeRoutineId && s.activeRoutineId !== PRESET_ID ? 'keep' : 'preset');
  const [code, setCode] = useState('');
  const [routine, setRoutine] = useState(null);
  const [start, setStart] = useState(nextMonday(today()));
  useBackHandler(() => setStep((x) => Math.max(0, x - 1)), step > 0);

  const activeName = s.routines.find((r) => r.id === s.activeRoutineId)?.name;

  const nextFromRoutine = () => {
    if (choice === 'code') {
      try {
        setRoutine(decodeRoutine(extractCode(code)));
      } catch (e) {
        toast(e.message);
        return;
      }
    }
    setStep(3);
  };

  const finish = () => {
    update((st) => {
      const patch = {
        profile: { ...profile, startDate: start, createdAt: Date.now() },
        weights: { ...st.weights, [today()]: profile.weight }
      };
      if (choice === 'code' && routine) {
        patch.routines = [...st.routines, routine];
        patch.activeRoutineId = routine.id;
      } else if (choice === 'preset') {
        patch.activeRoutineId = PRESET_ID;
      }
      return patch;
    });
    go('hoy', { replace: true });
  };

  const tg = profile ? targets(profile, 'up') : null;

  return (
    <main class="content" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
      <div class="steps" aria-hidden="true">{[0, 1, 2, 3].map((i) => <i key={i} class={i <= step ? 'on' : ''} />)}</div>

      {step === 0 && (
        <div class="hero">
          <Logo />
          <p class="title">TrainSection</p>
          <p>Tu rutina, el registro de cada serie, check-ins con fotos cada 2 semanas y menús baratos para ganar músculo sin acumular barriga.</p>
          <ul class="dots small">
            <li>Funciona sin conexión y tus datos se quedan en tu móvil.</li>
            <li>Te dice cuándo subir peso y cuánto descansar.</li>
            <li>Comparte tu rutina con un amigo con un enlace.</li>
          </ul>
          <button type="button" class="btn primary block" onClick={() => setStep(1)}>Empezar</button>
        </div>
      )}

      {step === 1 && (
        <div class="stack">
          <p class="title">Tus datos</p>
          <p class="small muted">Sirven para calcular tus calorías y tu proteína. Solo se guardan en este móvil.</p>
          <ProfileForm initial={profile} submitLabel="Siguiente" onSave={(p) => { setProfile(p); setStep(2); }} />
        </div>
      )}

      {step === 2 && (
        <div class="stack">
          <p class="title">Tu rutina</p>
          {choice === 'keep' || (s.activeRoutineId && s.activeRoutineId !== PRESET_ID) ? (
            <label class="check card"><input type="radio" name="r" checked={choice === 'keep'} onChange={() => setChoice('keep')} /><span><strong>{activeName}</strong><br /><span class="small muted">La que acabas de importar</span></span></label>
          ) : null}
          <label class="check card"><input type="radio" name="r" checked={choice === 'preset'} onChange={() => setChoice('preset')} /><span><strong>Plan Fase 1</strong><br /><span class="small muted">5 días: Torso A, Pierna A, Prioridades, Torso B y Pierna B</span></span></label>
          <label class="check card"><input type="radio" name="r" checked={choice === 'code'} onChange={() => setChoice('code')} /><span><strong>Tengo el código de un amigo</strong><br /><span class="small muted">Pega el enlace que te ha mandado</span></span></label>
          {choice === 'code' && <textarea class="textarea" value={code} onInput={(e) => setCode(e.currentTarget.value)} placeholder="https://…#/importar/…" aria-label="Enlace de la rutina" />}
          <div class="btns">
            <button type="button" class="btn ghost" onClick={() => setStep(1)}>Atrás</button>
            <button type="button" class="btn primary" onClick={nextFromRoutine}>Siguiente</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div class="stack">
          <p class="title">Todo listo</p>
          <Field label="Fecha de inicio"><input class="input" type="date" value={start} onInput={(e) => setStart(e.currentTarget.value || today())} /></Field>
          {tg && (
            <div class="card">
              <p class="k">Tus números en un día de torso</p>
              <p><span class="num">{miles(tg.kcal)}</span> kcal y <span class="num">{tg.protein}</span> g de proteína. El día de pierna algo más y el domingo algo menos.</p>
            </div>
          )}
          <div class="card">
            <p class="k">Lo primero</p>
            <p class="small">Antes del primer entreno, la app te pedirá las fotos iniciales, el peso y la cintura. Así verás tu cambio dentro de unas semanas.</p>
          </div>
          <div class="btns">
            <button type="button" class="btn ghost" onClick={() => setStep(2)}>Atrás</button>
            <button type="button" class="btn primary" onClick={finish}>Entrar</button>
          </div>
        </div>
      )}
    </main>
  );
}
