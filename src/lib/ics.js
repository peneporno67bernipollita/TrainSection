import { nextMonday, today, addDays, weekday } from './dates.js';

// Recurring reminders, exported as a calendar file (.ics) or as one Google
// Calendar link per reminder. Times are "floating" local times, so the phone
// shows them in its own time zone.
const stamp = (dateIso, hhmm) => dateIso.replace(/-/g, '') + 'T' + hhmm.replace(':', '') + '00';
const nowStamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');

export function reminders({ gymTime = '18:00', checkinEvery = 14 } = {}) {
  const monday = nextMonday(today());
  const [h, m] = gymTime.split(':').map(Number);
  const endMin = Math.min(23 * 60 + 59, h * 60 + m + 90);
  const endH = String(Math.floor(endMin / 60)).padStart(2, '0') + ':' + String(endMin % 60).padStart(2, '0');
  const t = today();
  const sunday = weekday(t) === 6 ? t : addDays(t, 6 - weekday(t));
  const saturday = addDays(sunday, -1);
  const ev = (uid, day, from, to, title, rrule, details = '') => ({ uid, start: stamp(day, from), end: stamp(day, to), title, rrule, details });
  return [
    ev('gym', monday, gymTime, endH, 'Gimnasio · TrainSection', 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', 'Abre TrainSection para ver el entreno de hoy.'),
    ev('batido', monday, '17:00', '17:15', 'Batido pre-entreno', 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'),
    ev('calistenia', saturday, '10:30', '11:30', 'Calistenia', 'FREQ=WEEKLY;BYDAY=SA'),
    ev('tapers', sunday, '11:00', '13:30', 'Cocinar los tápers de la semana', 'FREQ=WEEKLY;BYDAY=SU', 'Las recetas del menú están en TrainSection > Comida.'),
    ev('checkin', sunday, '09:00', '09:15', 'Check-in: fotos, peso y cintura', 'FREQ=WEEKLY;INTERVAL=' + Math.max(1, Math.round(checkinEvery / 7)) + ';BYDAY=SU', 'En ayunas y antes de entrenar.'),
    ev('sueno', monday, '22:00', '22:15', 'A dormir en 30 min', 'FREQ=DAILY', 'Objetivo: 7,5–8 h de sueño.')
  ];
}

function vevent(e) {
  return [
    'BEGIN:VEVENT',
    'UID:' + e.uid + '@trainsection',
    'DTSTAMP:' + nowStamp(),
    'DTSTART:' + e.start,
    'DTEND:' + e.end,
    'SUMMARY:' + e.title,
    e.details ? 'DESCRIPTION:' + e.details : null,
    'RRULE:' + e.rrule,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:' + e.title,
    'TRIGGER:-PT15M',
    'END:VALARM',
    'END:VEVENT'
  ].filter(Boolean).join('\r\n');
}

export function buildIcs(opts) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TrainSection//ES', 'CALSCALE:GREGORIAN', ...reminders(opts).map(vevent), 'END:VCALENDAR'];
  return lines.join('\r\n') + '\r\n';
}

// Opens Google Calendar's new-event screen already filled in: a fallback for
// calendar apps that won't import the .ics file.
export function googleCalendarUrl(e) {
  const q = new URLSearchParams({ action: 'TEMPLATE', text: e.title, dates: e.start + '/' + e.end, recur: 'RRULE:' + e.rrule });
  if (e.details) q.set('details', e.details);
  return 'https://calendar.google.com/calendar/render?' + q.toString();
}
