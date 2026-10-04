import { useState } from 'preact/hooks';
import { useStore, update, activeRoutine } from '../lib/store.js';
import { today, weekday } from '../lib/dates.js';
import { targets, dayType, DAY_TYPE_LABEL, mealsFor, menuFor } from '../lib/nutrition.js';
import { nextDayIndex } from '../lib/training.js';
import { RECIPES, MENUS, SHAKES, SHOPPING, SAVINGS, STORES, APPS, FOOD_SAFETY } from '../data/food.js';
import { miles } from '../lib/format.js';
import { Top, Icon, Seg, Videos } from '../ui.jsx';

function Recipe({ k }) {
  const r = RECIPES[k];
  if (!r) return null;
  return (
    <div class="stack tight" style={{ padding: '14px 16px' }}>
      <div class="row between" style={{ alignItems: 'baseline' }}>
        <p><strong>{r.name}</strong></p>
        <p class="num tiny muted" style={{ whiteSpace: 'nowrap' }}>≈ {r.kcal} kcal · {r.p} g · {r.cost} €</p>
      </div>
      <div class="chips">{r.tools.map((t) => <span class="chip" key={t}>{t}</span>)}</div>
      <details class="cue"><summary>Ingredientes para {r.per}</summary><p>{r.ing}</p></details>
      {r.note && <p class="small muted">{r.note}</p>}
      <Videos list={r.videos} />
    </div>
  );
}

function TodayTab({ s }) {
  const t = today();
  const routine = activeRoutine(s);
  const next = nextDayIndex(routine, s.sessions, t);
  const planned = routine.days[next.index];
  const auto = dayType(t, planned);
  const [type, setType] = useState(auto);
  const tg = targets(s.profile, type);
  const meals = mealsFor(t);
  const wd = weekday(t);
  const sunday = wd === 6;
  const dinnerName = meals.dinner ? RECIPES[meals.dinner]?.name : 'Tortilla francesa de 2 huevos y 2 claras con pan';
  const rows = [
    ['06:45', 'Gachas de avena', '80 g de avena, 350 ml de leche entera, 1 plátano y canela', 'gachas'],
    ['11:00', 'Media mañana', '30 g de cacahuetes tostados'],
    ['14:00', 'Comida', RECIPES[meals.lunch]?.name + ' y 80 g de pan'],
    sunday ? ['17:00', 'Merienda', '250 g de queso fresco batido 0 % con 1 plátano'] : ['17:00', 'Batido pre-entreno', SHAKES.pre.recipe],
    ['20:15', 'Cena', dinnerName + ' y 80 g de pan']
  ];
  return (
    <>
      <Seg value={type} onChange={setType} label="Tipo de día" options={[['leg', 'Pierna'], ['up', 'Torso'], ['rest', 'Descanso']]} />
      {tg ? (
        <div class="card">
          <p class="k">{DAY_TYPE_LABEL[type]}{type === auto ? ' · hoy' : ''}</p>
          <div class="stats">
            <div><p class="k">Calorías</p><p class="v hl">{miles(tg.kcal)}</p><p class="s">kcal</p></div>
            <div><p class="k">Proteína</p><p class="v">{tg.protein} g</p><p class="s">{tg.proteinBudget} g en modo ahorro</p></div>
            <div><p class="k">Hidratos</p><p class="v">{tg.carbs} g</p></div>
            <div><p class="k">Grasa</p><p class="v">{tg.fat} g</p></div>
          </div>
          <p class="tiny muted">Mantenimiento medio estimado: {miles(tg.weeklyMaint)} kcal (basal {miles(tg.basal)} {tg.measured ? 'medido' : 'estimado'}). Lo que manda es la báscula: revisa la pestaña Progreso.</p>
        </div>
      ) : <div class="card"><p class="small">Completa tu perfil en Ajustes para calcular tus calorías.</p></div>}
      <div class="card flat list">
        {rows.map(([h, title, text, rec]) => (
          <div class="item" key={h + title} style={{ alignItems: 'flex-start' }}>
            <span class="num small muted" style={{ width: '3.2rem', paddingTop: '2px' }}>{h}</span>
            <div class="grow">
              <p><strong>{title}</strong></p>
              <p class="small muted">{text}</p>
              {rec && <Videos list={RECIPES[rec].videos} first={false} />}
            </div>
          </div>
        ))}
      </div>
      <p class="small muted">Día de pierna: añade 1 plátano o 2 rebanadas de pan. Esta semana toca el Menú {meals.menu.k}.</p>
    </>
  );
}

function MenusTab() {
  const thisMenu = menuFor(today());
  const [k, setK] = useState(thisMenu.k);
  const menu = MENUS.find((m) => m.k === k) || MENUS[0];
  return (
    <>
      <Seg value={k} onChange={setK} label="Menú" options={MENUS.map((m) => [m.k, 'Menú ' + m.k + (m.k === thisMenu.k ? ' · ahora' : '')])} />
      <p class="small muted">Rotan cada 2 semanas: A, B, C y vuelta a empezar. Gachas, batido, lentejas y cacahuetes se mantienen siempre.</p>
      <p class="eyebrow">Lunes a miércoles · nevera</p>
      <div class="card flat list">{menu.early.map((r) => <Recipe key={r} k={r} />)}</div>
      <p class="eyebrow">Jueves a sábado · congelador</p>
      <div class="card flat list">{menu.late.map((r) => <Recipe key={r} k={r} />)}</div>
      <p class="eyebrow">Domingo · recién hecho</p>
      <div class="card flat list">{menu.sunday.map((r) => <Recipe key={r} k={r} />)}</div>
      <p class="small muted">{menu.sunNote}</p>
      <div class="card">
        <p class="k">Cocinar y guardar</p>
        <ul class="dots small">{FOOD_SAFETY.map((x) => <li key={x}>{x}</li>)}</ul>
      </div>
    </>
  );
}

function ShoppingTab({ s }) {
  const checked = s.settings.shopping || {};
  const toggle = (key) => update((st) => ({ settings: { ...st.settings, shopping: { ...(st.settings.shopping || {}), [key]: !(st.settings.shopping || {})[key] } } }));
  const reset = () => update((st) => ({ settings: { ...st.settings, shopping: {} } }));
  const total = SHOPPING.reduce((a, g) => a + g.items.reduce((b, it) => b + it[2], 0), 0);
  const left = SHOPPING.reduce((a, g) => a + g.items.reduce((b, it) => b + (checked[it[0]] ? 0 : it[2]), 0), 0);
  return (
    <>
      <div class="card">
        <p class="k">Lista de la semana · Menú A</p>
        <div class="stats">
          <div><p class="k">Total</p><p class="v">{total.toFixed(2).replace('.', ',')} €</p></div>
          <div><p class="k">Te falta</p><p class="v hl">{left.toFixed(2).replace('.', ',')} €</p></div>
        </div>
        <p class="tiny muted">Precios de Mercadona del 4 de octubre de 2026. Los menús B y C usan casi lo mismo: el B lleva más pollo y sale unos 2–3 € más caro.</p>
      </div>
      {SHOPPING.map((g) => (
        <div class="card" key={g.group}>
          <p class="k">{g.group}</p>
          {g.items.map(([name, qty, cost]) => (
            <label class="check" key={name}>
              <input type="checkbox" checked={!!checked[name]} onChange={() => toggle(name)} />
              <span class="grow">{name} <span class="muted small">· {qty}</span></span>
              <span class="num small">{cost.toFixed(2).replace('.', ',')} €</span>
            </label>
          ))}
        </div>
      ))}
      <button type="button" class="btn ghost" onClick={reset}>Desmarcar todo</button>
      <div class="card">
        <p class="k">Cómo quedarte en 100 € al mes</p>
        {SAVINGS.map(([text, save]) => <div class="row between" key={text} style={{ alignItems: 'flex-start' }}><p class="small grow">{text}</p><p class="num small">{save}</p></div>)}
        <p class="small muted">Con las 4 medidas, la semana baja a unos 24 €, unos 105 € al mes.</p>
      </div>
      <div class="card">
        <p class="k">Dónde comprar en Sanlúcar</p>
        <ul class="dots small">{STORES.map((x) => <li key={x}>{x}</li>)}</ul>
      </div>
      <div class="card flat list">
        {APPS.map(([name, text]) => <div class="item" key={name}><div class="grow"><p><strong>{name}</strong></p><p class="small muted">{text}</p></div></div>)}
      </div>
    </>
  );
}

function ShakesTab() {
  return (
    <>
      {['pre', 'post'].map((k) => {
        const sh = SHAKES[k];
        return (
          <div class="card" key={k}>
            <p class="k">{sh.name}</p>
            <span class={'chip verdict ' + (sh.tone === 'ok' ? 'ok' : 'warn')}>{sh.verdict}</span>
            <p><strong>Receta:</strong> {sh.recipe}</p>
            <p class="num small">{sh.macros}</p>
            {sh.plus && <p class="small muted">{sh.plus}</p>}
            <ul class="dots small">{sh.notes.map((n) => <li key={n}>{n}</li>)}</ul>
          </div>
        );
      })}
      <div class="card">
        <p class="k">Suplementos</p>
        <p class="small">Comer de todo y no tomar suplementos es válido. Tu omega-3 está bien. Si te haces una analítica, mira la vitamina D. Sin carne roja, el hierro te llega de legumbres, huevos y pescado azul; acompaña las legumbres con pimiento, tomate o naranja.</p>
      </div>
    </>
  );
}

export function Food({ initial = 'hoy' }) {
  const s = useStore();
  const [tab, setTab] = useState(['hoy', 'menus', 'compra', 'batidos'].includes(initial) ? initial : 'hoy');
  return (
    <>
      <Top title="Comida" right={<a class="iconbtn" href="#/ajustes" aria-label="Ajustes"><Icon.gear /></a>} />
      <main class="content">
        <Seg value={tab} onChange={setTab} label="Sección" options={[['hoy', 'Hoy'], ['menus', 'Menús'], ['compra', 'Compra'], ['batidos', 'Batidos']]} />
        {tab === 'hoy' && <TodayTab s={s} />}
        {tab === 'menus' && <MenusTab />}
        {tab === 'compra' && <ShoppingTab s={s} />}
        {tab === 'batidos' && <ShakesTab />}
      </main>
    </>
  );
}
