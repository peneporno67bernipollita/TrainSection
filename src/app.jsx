import { useEffect, useState } from 'preact/hooks';
import { useStore } from './lib/store.js';
import { Icon, ToastHost, ConfirmHost } from './ui.jsx';
import { Today } from './screens/Today.jsx';
import { Workout } from './screens/Workout.jsx';
import { CalendarScreen } from './screens/Calendar.jsx';
import { Progress } from './screens/Progress.jsx';
import { Food } from './screens/Food.jsx';
import { Routines } from './screens/Routines.jsx';
import { RoutineEditor } from './screens/RoutineEditor.jsx';
import { ShareRoutine } from './screens/ShareRoutine.jsx';
import { ImportRoutine } from './screens/ImportRoutine.jsx';
import { Checkin } from './screens/Checkin.jsx';
import { Settings } from './screens/Settings.jsx';
import { Guide } from './screens/Guide.jsx';
import { SessionDetail } from './screens/SessionDetail.jsx';
import { Onboarding } from './screens/Onboarding.jsx';

function parseHash() {
  const h = decodeURI(location.hash.replace(/^#\/?/, ''));
  const [path, query = ''] = h.split('?');
  const parts = path.split('/').filter(Boolean);
  return { parts, query: new URLSearchParams(query) };
}

export function useRoute() {
  const [route, setRoute] = useState(parseHash());
  useEffect(() => {
    const on = () => { setRoute(parseHash()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

const TABS = [
  ['hoy', 'Hoy', Icon.home],
  ['calendario', 'Calendario', Icon.calendar],
  ['progreso', 'Progreso', Icon.chart],
  ['comida', 'Comida', Icon.food],
  ['rutinas', 'Rutinas', Icon.list]
];

function TabBar({ current }) {
  return (
    <div class="tabbar">
      <nav aria-label="Secciones">
        {TABS.map(([id, label, Ic]) => (
          <a key={id} href={'#/' + id} aria-current={current === id ? 'page' : undefined}>
            <Ic />
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

export function App() {
  const s = useStore();
  const { parts, query } = useRoute();
  const [head = 'hoy', a, b] = parts;

  if (!s.ready) return <div class="shell"><p class="empty">Cargando…</p></div>;

  let screen = null;
  let tab = null;

  if (!s.profile && head !== 'importar') {
    screen = <Onboarding />;
  } else {
    switch (head) {
      case 'entreno': screen = <Workout />; break;
      case 'calendario': screen = <CalendarScreen />; tab = head; break;
      case 'progreso': screen = <Progress initial={query.get('t') || 'peso'} />; tab = head; break;
      case 'comida': screen = <Food initial={query.get('t') || 'hoy'} />; tab = head; break;
      case 'rutinas':
        if (a === 'editar') screen = <RoutineEditor id={b} />;
        else if (a === 'compartir') screen = <ShareRoutine id={b} />;
        else { screen = <Routines />; tab = head; }
        break;
      case 'importar': screen = <ImportRoutine code={a || ''} />; break;
      case 'checkin': screen = <Checkin />; break;
      case 'ajustes': screen = <Settings />; break;
      case 'guia': screen = <Guide open={a || ''} />; break;
      case 'sesion': screen = <SessionDetail id={a} />; break;
      default: screen = <Today />; tab = 'hoy';
    }
  }

  return (
    <div class="shell">
      {screen}
      {tab && <TabBar current={tab} />}
      <ToastHost />
      <ConfirmHost />
    </div>
  );
}
