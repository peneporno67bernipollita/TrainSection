import { nextMonday, today, addDays, weekday } from './dates.js';

// Builds a calendar file with recurring reminders. Times are "floating"
// local times, so the phone shows them in its own time zone.
const stamp = (dateIso, hhmm) => dateIso.replace(/-/g, '') + 'T' + hhmm.replace(':', '') + '00';
const nowStamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');

function event(uid, start, end, summary, rrule, description) {
  return [
    'BEGIN:VEVENT',
    'UID:' + uid + '@trainsection',
    'DTSTAMP:' + nowStamp(),
    'DTSTART:' + start,
    'DTEND:' + end,
    'SUMMARY:' + summary,
    description ? 'DESCRIPTION:' + description : null,
    rrule ? 'RRULE:' + rrule : null,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:' + summary,
    'TRIGGER:-PT15M',
    'END:VALARM',
    'END:VEVENT'
  ].filter(Boolean).join('\r\n');
}

export function buildIcs({ gymTime = '18:00', checkinEvery = 14 } = {}) {
  const monday = nextMonday(today());
  const [h, m] = gymTime.split(':').map(Number);
  const endMin = Math.min(23 * 60 + 59, h * 60 + m + 90);
  const endH = String(Math.floor(endMin / 60)).padStart(2, '0') + ':' + String(endMin % 60).padStart(2, '0');
  const t = today();
  const sunday = weekday(t) === 6 ? t : addDays(t, 6 - weekday(t));
  const saturday = addDays(sunday, -1);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TrainSection//ES',
    'CALSCALE:GREGORIAN',
    event('gym', stamp(monday, gymTime), stamp(monday, endH), 'Gimnasio · TrainSection', 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', 'Abre TrainSection para ver el entreno de hoy.'),
    event('batido', stamp(monday, '17:00'), stamp(monday, '17:15'), 'Batido pre-entreno', 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', ''),
    event('calistenia', stamp(saturday, '10:30'), stamp(saturday, '11:30'), 'Calistenia', 'FREQ=WEEKLY;BYDAY=SA', ''),
    event('tapers', stamp(sunday, '11:00'), stamp(sunday, '13:30'), 'Cocinar los tápers de la semana', 'FREQ=WEEKLY;BYDAY=SU', 'Las recetas del menú están en TrainSection > Comida.'),
    event('checkin', stamp(sunday, '09:00'), stamp(sunday, '09:15'), 'Check-in: fotos, peso y cintura', 'FREQ=WEEKLY;INTERVAL=' + Math.max(1, Math.round(checkinEvery / 7)) + ';BYDAY=SU', 'En ayunas y antes de entrenar.'),
    event('sueno', stamp(monday, '22:00'), stamp(monday, '22:15'), 'A dormir en 30 min', 'FREQ=DAILY', 'Objetivo: 7,5–8 h de sueño.'),
    'END:VCALENDAR'
  ];
  return lines.join('\r\n') + '\r\n';
}
