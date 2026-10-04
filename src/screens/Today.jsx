import { useEffect, useState } from 'preact/hooks';
import { useStore, update, activeRoutine } from '../lib/store.js';
import { today, fmtLong, weekday } from '../lib/dates.js';
import { nextDayIndex, sessionsInWeek, weekStreak, newSessionFor, doneSets, fmtNum } from '../lib/training.js';
import { targets, dayType, DAY_TYPE_LABEL, mealsFor, weekAverage, weightAdvice } from '../lib/nutrition.js';
import { checkinStatus } from '../lib/checkin.js';
import { isIOS, isStandalone, canPromptInstall, promptInstall, onInstallChange } from '../lib/install.js';
import { RECIPES } from '../data/food.js';
import { miles } from '../lib/format.js';
import { Top, Icon, Plate, toast } from '../ui.jsx';
import { go } from '../nav.js';

const HABITS = [
  ['sleep', 'He dormido 7,5 h o más'],
  ['steps', '8.000 pasos'],
  ['meals', 'He comido lo del plan'],
  ['noAlcohol', 'Sin alcohol']
];

function parseKg(v) {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function InstallHint({ settings }) {
  const [, force] = useState(0);
  useEffect(() => onInstallChange(() => force((x) => x + 1)), []);
  if (settings.hideInstall || isStandalone()) return null;
  const hide = () => update((s) => ({ settings: { ...s.settings, hideInstall: true } }));
  if (canPromptInstall()) {
    return (
      <div class="card">
        <p class="k">Instálala</p>
        <p class="small">Añádela a tu pantalla de inicio para usarla sin conexión y a pantalla completa.</p>
        <div class="btns">
          <button type="button" class="btn primary sm" onClick={() => promptInstall()}>Instalar</button>
          <button type="button" class="btn ghost sm" onClick={hide}>Ahora no</button>
        </div>
      </div>
    );
  }
  if (isIOS()) {
    return (
      <div class="card">
        <p class="k">Instálala en el iPhone</p>
        <p class="small">En Safari, pulsa Compartir y luego «Añadir a pantalla de inicio». Ábrela siempre desde ese icono: ahí se guardan tus datos.</p>
        <div class="btns"><button type="button" class="btn ghost sm" onClick={hide}>Entendido</button></div>
      </div>
    );
  }
  return null;
}

export function Today() {
  const s = useStore();
  const t = today();
  const wd = weekday(t);
  const routine = activeRoutine(s);
  const next = nextDayIndex(routine, s.sessions, t);
  const [pick, setPick] = useState(null);
  const [choosing, setChoosing] = useState(false);
  const dayIdx = pick ?? next.index;
  const day = routine.days[dayIdx] || routine.days[0];
  const type = dayType(t, day);
  const tg = targets(s.profile, type);
  const meals = mealsFor(t);
  const ci = checkinStatus(s, t);
  const week = sessionsInWeek(s.sessions, t);
  const streak = weekStreak(s.sessions, t);
  const doneToday = s.sessions.filter((x) => x.date === t && x.finishedAt);
  const totalSets = day.items.reduce((a, it) => a + it.sets, 0);

  const [kg, setKg] = useState(s.weights[t] != null ? fmtNum(s.weights[t]) : '');
  const avg = weekAverage(s.weights, t);
  const advice = weightAdvice(s.weights, t);
  const habits = s.habits[t] || {};

  const start = () => {
    if (ci.gate) {
      toast('Primero toca el check-in');
      go('checkin');
      return;
    }
    update({ current: newSessionFor(routine, dayIdx, s.sessions, t) });
    go('entreno');
  };

  const postpone = () => update((st) => ({ settings: { ...st.settings, postponed: { period: ci.period, until: t } } }));

  const saveWeight = () => {
    const v = parseKg(kg);
    if (v == null || v < 30 || v > 250) { toast('Escribe tu peso en kg, por ejemplo 68,4'); return; }
    update((st) => ({ weights: { ...st.weights, [t]: v } }));
    toast('Peso guardado');
  };

  const toggleHabit = (k) => update((st) => ({ habits: { ...st.habits, [t]: { ...(st.habits[t] || {}), [k]: !(st.habits[t] || {})[k] } } }));

  const name = s.profile?.name ? ', ' + s.profile.name : '';

  return (
    <>
      <Top title={'Hoy' + name} sub={fmtLong(t)} right={<a class="iconbtn" href="#/ajustes" aria-label="Ajustes"><Icon.gear /></a>} />
      <main class="content">
        {s.storageError && <div class="card alert"><p class="small">{s.storageError}</p></div>}
        <InstallHint settings={s.settings} />

        {ci.due && (
          <div class={'card' + (ci.gate ? ' alert' : '')}>
            <p class="k">{ci.first ? 'Antes de empezar' : 'Toca check-in'}</p>
            <p>{ci.first ? 'Haz tus fotos iniciales, el peso y la cintura. Así podrás comparar dentro de unas semanas.' : 'Cada 14 días: 4 fotos, peso y cintura. Hasta que lo hagas, el entreno queda bloqueado.'}</p>
            <div class="btns">
              <a class="btn primary" href="#/checkin"><Icon.camera /> Hacer check-in</a>
              {ci.canPostpone && <button type="button" class="btn ghost" onClick={postpone}>Hoy no puedo</button>}
            </div>
            {ci.postponedToday && <p class="small muted">Aplazado hasta mañana. Solo se puede aplazar una vez.</p>}
          </div>
        )}

        {s.current ? (
          <div class="card alert">
            <p class="k">Entreno en curso</p>
            <div class="row"><Plate plate={s.current.plate} /><p class="h2 grow">{s.current.dayName}</p></div>
            <a class="btn primary block" href="#/entreno">Continuar entreno</a>
          </div>
        ) : doneToday.length ? (
          <div class="card okc">
            <p class="k">Entreno de hoy hecho</p>
            {doneToday.map((x) => (
              <div class="row" key={x.id}>
                <Plate plate={x.plate} />
                <div class="grow">
                  <p class="h2">{x.dayName}</p>
                  <p class="small muted">{x.entries.reduce((a, e) => a + doneSets(e).length, 0)} series · {Math.round((x.finishedAt - x.startedAt) / 60000)} min</p>
                </div>
                <a class="btn sm" href={'#/sesion/' + x.id}>Ver</a>
              </div>
            ))}
            <p class="small">Toca recuperar: cena con proteína y a dormir pronto.</p>
          </div>
        ) : wd >= 5 && pick == null ? (
          <div class="card">
            <p class="k">{wd === 5 ? 'Sábado' : 'Domingo'}</p>
            <p class="h2">{wd === 5 ? 'Toca calistenia' : 'Descanso total'}</p>
            <p class="small">{wd === 5 ? 'Habilidades y fuerza con tu peso, sin llegar al fallo. Unos 60 minutos.' : 'Hoy toca cocinar los tápers de la semana y planificar. Si es día de check-in, hazlo en ayunas.'}</p>
            <div class="btns">
              {wd === 5 ? <a class="btn sm" href="#/guia/calistenia">Guía de calistenia</a> : <a class="btn sm" href="#/comida?t=menus">Recetas de la semana</a>}
              <button type="button" class="btn ghost sm" onClick={() => { setPick(next.index); setChoosing(true); }}>Entrenar en el gimnasio igualmente</button>
            </div>
          </div>
        ) : (
          <div class="card">
            <p class="k">Entreno de hoy · {routine.name}</p>
            <div class="row">
              <Plate plate={day.plate} />
              <div class="grow">
                <p class="h2">{day.name}</p>
                <p class="small muted">{day.focus}</p>
              </div>
            </div>
            <p class="small num">{day.items.length} ejercicios · {totalSets} series · ≈ {day.time || 60} min + 10 de cardio</p>
            <button type="button" class="btn primary block" onClick={start}>{ci.gate ? 'Haz primero el check-in' : 'Empezar entreno'}</button>
            {!choosing ? (
              <button type="button" class="linkbtn small" onClick={() => setChoosing(true)}>Hacer otro día</button>
            ) : (
              <div class="chips">
                {routine.days.map((d, i) => (
                  <button type="button" key={d.id} class={'btn sm' + (i === dayIdx ? ' primary' : '')} onClick={() => setPick(i)}>{d.name}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {tg && (
          <div class="card">
            <div class="row between"><p class="k">{DAY_TYPE_LABEL[type]}</p><a class="small" href="#/comida">Comida</a></div>
            <div class="stats three">
              <div><p class="k">Calorías</p><p class="v hl">{miles(tg.kcal)}</p></div>
              <div><p class="k">Proteína</p><p class="v">{tg.protein} g</p></div>
              <div><p class="k">Hidratos</p><p class="v">{tg.carbs} g</p></div>
            </div>
            <p class="small">
              <strong>Comida:</strong> {RECIPES[meals.lunch]?.name}.{' '}
              <strong>Cena:</strong> {meals.dinner ? RECIPES[meals.dinner]?.name : 'tortilla francesa de 2 huevos y 2 claras con pan'}.
              {' '}Menú {meals.menu.k}.
            </p>
          </div>
        )}

        <div class="card">
          <p class="k">Peso de hoy</p>
          <div class="row">
            <input class="input grow num" inputMode="decimal" placeholder="kg, en ayunas" value={kg} onInput={(e) => setKg(e.currentTarget.value)} aria-label="Peso de hoy en kg" />
            <button type="button" class="btn" onClick={saveWeight}>Guardar</button>
          </div>
          <p class="small muted">{avg ? 'Media de 7 días: ' + fmtNum(Math.round(avg * 10) / 10) + ' kg. ' : ''}{advice.text}</p>
        </div>

        <div class="card">
          <p class="k">Hábitos de hoy</p>
          {HABITS.map(([k, label]) => (
            <label class="check" key={k}>
              <input type="checkbox" checked={!!habits[k]} onChange={() => toggleHabit(k)} />
              <span>{label}</span>
            </label>
          ))}
        </div>

        <div class="card">
          <p class="k">Esta semana</p>
          <div class="stats">
            <div><p class="k">Entrenos</p><p class="v">{week.length} / {routine.days.length}</p></div>
            <div><p class="k">Racha</p><p class="v">{streak} {streak === 1 ? 'semana' : 'semanas'}</p><p class="s">con 4 entrenos o más</p></div>
          </div>
          {!ci.due && <p class="small muted">Próximo check-in en {ci.daysLeft} {ci.daysLeft === 1 ? 'día' : 'días'}.</p>}
        </div>

        <a class="btn block" href="#/guia"><Icon.book /> Guía: progresión, calistenia y hábitos</a>
      </main>
    </>
  );
}
