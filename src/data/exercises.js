// Exercise library. Routines reference exercises by id, which keeps shared
// routine codes short. Videos are YouTube ids: the first entry is the short
// demo (Renaissance Periodization) when there is one, then technique videos.

export const MUSCLES = {
  pecho: 'Pecho',
  espalda: 'Espalda',
  hombro: 'Hombro',
  hombro_lateral: 'Hombro lateral',
  hombro_posterior: 'Hombro posterior',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  antebrazo: 'Antebrazo',
  abdomen: 'Abdomen',
  cuadriceps: 'Cuádriceps',
  femoral: 'Femoral',
  gluteo: 'Glúteo',
  gemelo: 'Gemelo'
};

const list = [
  // Torso A
  { id: 'press_incl_smith', name: 'Press inclinado en multipower', muscle: 'pecho', videos: [['Demo', '8urE8Z8AMQ4'], ['Técnica de press', 'vcBig73ojpE']], cue: 'Banco a 30°. Baja la barra a la parte alta del pecho con las escápulas juntas y sube sin rebotar.', alt: 'Press inclinado en máquina' },
  { id: 'dominadas', name: 'Dominadas', muscle: 'espalda', videos: [['Técnica', 'Hdc7Mw6BIEE'], ['Errores típicos', 'B5z3k20QCS0']], cue: 'Brazos estirados abajo y pecho hacia la barra. Cuando hagas todas las series al máximo, añade 2,5 kg con un cinturón de lastre o una mancuerna entre los pies.', alt: 'Dominadas asistidas o jalón al pecho' },
  { id: 'press_hombro_maquina', name: 'Press de hombros en máquina', muscle: 'hombro', videos: [['Demo', 'WvLMauqrnK8'], ['Técnica', '_RlRDWO2jfg']], cue: 'Espalda pegada al respaldo y asas a la altura de la barbilla al empezar. Sube sin bloquear los codos de golpe y baja controlado.', alt: 'Press de hombros con mancuernas sentado' },
  { id: 'remo_apoyo_pecho', name: 'Remo en máquina con apoyo en el pecho', muscle: 'espalda', videos: [['Demo', '_FrrYQxA6kc'], ['Técnica', '5XfV6hvcxCE']], cue: 'Pecho pegado al apoyo. Tira llevando los codos hacia la cadera, aprieta 1 s y deja que los omóplatos se separen al volver.', alt: 'Remo con mancuerna con apoyo' },
  { id: 'fondos', name: 'Fondos en paralelas', muscle: 'pecho', videos: [['Demo', '4LA1kF7yCGo'], ['Técnica', 'yN6Q1UI_xkE']], cue: 'Tronco algo inclinado y bajada hasta que el hombro quede un poco por debajo del codo. Cuando hagas todas las series al máximo, añade lastre.', alt: 'Fondos asistidos o press de pecho en máquina' },
  { id: 'lateral_polea', name: 'Elevación lateral en polea', muscle: 'hombro_lateral', videos: [['Demo', 'lq7eLC30b9w'], ['Técnica', 'f_OGBg2KxgY']], cue: 'Polea a la altura de la muñeca y cable por delante del cuerpo. Sube hasta la altura del hombro sin balanceo.', alt: 'Elevación lateral con mancuerna' },

  // Pierna A
  { id: 'hack', name: 'Sentadilla hack', muscle: 'cuadriceps', videos: [['Demo', 'rYgNArpwE7E'], ['Técnica', '4cxt_Tldugw']], cue: 'Cabeza apoyada y mirada al frente, sin echarla hacia atrás. Baja hasta donde la pelvis siga pegada al respaldo y sube empujando con todo el pie.', alt: 'Sentadilla péndulo o prensa' },
  { id: 'rdl_smith', name: 'Peso muerto rumano en multipower', muscle: 'femoral', videos: [['Demo con mancuernas', 'cYKYGwcg0U8'], ['Técnica', '_oyxCn2iSjU']], cue: 'Rodillas un poco flexionadas, cadera hacia atrás y espalda neutra. Baja hasta notar un tirón fuerte en el femoral y sube apretando el glúteo.', alt: 'Peso muerto rumano con mancuernas' },
  { id: 'curl_femoral_sentado', name: 'Curl femoral sentado', muscle: 'femoral', videos: [['Demo', 'Orxowest56U'], ['Técnica', 'jobEeklwrrs']], cue: 'Rodillo justo encima del tobillo. Inclina el tronco hacia delante para estirar más el femoral y baja en 2–3 s.', alt: 'Curl femoral tumbado' },
  { id: 'ext_cuadriceps', name: 'Extensión de cuádriceps', muscle: 'cuadriceps', videos: [['Demo', 'm0FOpMEgero'], ['Técnica', 'ljO4jkwv8wQ'], ['Errores típicos', 'xUZNOR6WP0A']], cue: 'Rodilla alineada con el eje de la máquina. Pausa de 1 s arriba y baja en 2–3 s.', alt: 'Extensión a una pierna' },
  { id: 'granjero', name: 'Paseo del granjero', muscle: 'antebrazo', unit: 'm', videos: [['Técnica', '69hTPgHwA08']], cue: 'Una mancuerna pesada en cada mano, hombros atrás y abdomen firme. Pasos cortos. Si no hay sitio para caminar, aguanta las mancuernas quieto 30–40 s. Sube peso cuando completes los metros con buena postura.', alt: 'Colgarte de la barra el máximo tiempo' },
  { id: 'gemelo_pie', name: 'Gemelos de pie en máquina', muscle: 'gemelo', videos: [['Demo', 'N3awlEyTY98'], ['Técnica', '-qsRtp_PbVM']], cue: 'Pausa de 1–2 s abajo con el talón todo lo estirado que puedas y sube al máximo. Sin rebotes.', alt: 'Gemelos en prensa' },
  { id: 'crunch_polea', name: 'Crunch en polea alta', muscle: 'abdomen', videos: [['Demo', '6GMKPQVERzw'], ['Técnica', '1G0y8D5rFDc']], cue: 'De rodillas, con la cuerda junto a la cabeza. Enrolla la columna acercando las costillas a la pelvis. Los brazos no tiran.', alt: 'Crunch en máquina' },

  // Prioridades
  { id: 'press_incl_mancuernas', name: 'Press inclinado con mancuernas', muscle: 'pecho', videos: [['Demo', '5CECBjd7HLQ'], ['Técnica', 'GHcAIiL9J_Y']], cue: 'Banco a 30°. Codos a 45–60° del cuerpo y bajada hasta notar el pecho estirado. Empieza con poco peso.', alt: 'Press inclinado en máquina' },
  { id: 'cruce_poleas', name: 'Cruce de poleas de abajo arriba', muscle: 'pecho', videos: [['Demo', 'e_8HLu59-to'], ['Técnica', '-EIhKMDSjBY']], cue: 'Poleas abajo. Sube las manos en arco hasta la altura de la barbilla con el pecho fuera y nota el estiramiento abajo.', alt: 'Contractora (pec deck)' },
  { id: 'lateral_maquina', name: 'Elevación lateral en máquina', muscle: 'hombro_lateral', videos: [['Demo', '0o07iGKUarI'], ['Técnica', 'n5dsI9qQXwY']], cue: 'Sube hasta la altura del hombro guiando con los codos. La última serie, al fallo.', alt: 'Elevación lateral con mancuernas' },
  { id: 'lateral_cruzada', name: 'Elevación lateral cruzada en polea', muscle: 'hombro_lateral', videos: [['Demo', '2OMbdPF7mz4'], ['Técnica', 'fD6kaKjiy84']], cue: 'El cable cruza por delante del cuerpo desde el lado contrario. Mismo gesto que la elevación lateral.', alt: 'Elevación lateral con mancuerna' },
  { id: 'triceps_overhead', name: 'Extensión de tríceps sobre la cabeza en polea', muscle: 'triceps', videos: [['Demo', 'kqidUIf1eJE'], ['Técnica', '94DXwlcX8Po']], cue: 'De espaldas a la polea, con los codos apuntando al frente y arriba. Baja hasta notar el estiramiento detrás del brazo y extiende del todo.', alt: 'Extensión con mancuerna sobre la cabeza' },
  { id: 'triceps_cuerda', name: 'Extensión de tríceps en polea con cuerda', muscle: 'triceps', videos: [['Demo', '-xa-6cQaZKY'], ['Técnica', 'yftl1tBWmKk']], cue: 'Codos pegados al cuerpo y quietos. Extiende del todo y separa los extremos de la cuerda al final.', alt: 'Extensión con barra en polea' },
  { id: 'curl_inverso', name: 'Curl inverso con barra Z', muscle: 'antebrazo', videos: [['Técnica', 'MfMxT_jXcPE'], ['Antebrazo a fondo', 'L9oMEzzQ9og']], cue: 'Palmas hacia abajo y codos pegados. Sube sin balanceo y baja en 2–3 s. Trabaja el braquiorradial y los extensores del antebrazo.', alt: 'Curl martillo' },
  { id: 'pulso_polea', name: 'Pulso en polea alta', muscle: 'antebrazo', perSide: true, videos: [['Polea alta', 'pGFJY_JaVb0'], ['Ejercicios de pulso', 'vfVbWWUqrso']], cue: 'Polea arriba del todo, agarre como en un pulso y codo apoyado. Tira hacia abajo y hacia dentro y vuelve despacio dejando que la polea te abra la muñeca: así el antebrazo también trabaja estirado. Hombro siempre por delante del codo, sin girar el cuerpo de espaldas al brazo.', alt: 'Curl de muñeca en polea' },
  { id: 'curl_muneca', name: 'Curl de muñeca', muscle: 'antebrazo', videos: [['Demo', '2wPpcJBe03o'], ['Técnica', 'L9oMEzzQ9og']], cue: 'Antebrazos apoyados en un banco y muñecas fuera. Deja que la mancuerna ruede hasta los dedos para estirar y sube flexionando la muñeca.', alt: 'Curl de muñeca en polea' },
  { id: 'rodillas_colgado', name: 'Elevación de rodillas colgado', muscle: 'abdomen', videos: [['Demo', 'RD_A-Z15ER4'], ['Técnica', '2RrGnjxSsiA']], cue: 'Sube las rodillas enrollando la pelvis hacia el pecho, sin balancearte. Si el agarre falla antes que el abdomen, hazlo en la silla romana.', alt: 'Elevación de piernas en silla romana' },

  // Torso B
  { id: 'jalon', name: 'Jalón al pecho', muscle: 'espalda', videos: [['Demo', 'EUIri47Epcg'], ['Técnica', 'O94yEoGXtBY']], cue: 'Agarre algo más ancho que los hombros y pecho alto. Tira con los codos hacia abajo y hacia los costados hasta la parte alta del pecho.', alt: 'Dominadas asistidas' },
  { id: 'remo_polea', name: 'Remo sentado en polea baja', muscle: 'espalda', videos: [['Demo', 'UCXxvVItLoM'], ['Técnica', '5XfV6hvcxCE']], cue: 'Agarre neutro y tronco casi quieto. Tira hacia el ombligo y deja que los hombros vayan hacia delante al volver.', alt: 'Remo en máquina' },
  { id: 'press_pecho_maquina', name: 'Press de pecho en máquina', muscle: 'pecho', videos: [['Demo', '0Wa9CfRXUkA'], ['Técnica', 'SUdQ1roIWz0']], cue: 'Asas a la altura de la mitad del pecho. Escápulas atrás y bajada controlada hasta notar el estiramiento.', alt: 'Press plano con mancuernas' },
  { id: 'pullover_polea', name: 'Pullover en polea alta', muscle: 'espalda', videos: [['Demo', 'G9uNaXGTJ4w'], ['Técnica', 'O94yEoGXtBY']], cue: 'Brazos casi rectos y tronco algo inclinado. Lleva la barra o la cuerda desde arriba hasta los muslos usando la espalda.', alt: 'Pullover en máquina' },
  { id: 'pajaros_maquina', name: 'Pájaros en máquina', muscle: 'hombro_posterior', videos: [['Demo', '5YK4bgzXDp0'], ['Técnica', 'qfc70k40318']], cue: 'Asas a la altura de los hombros y brazos casi rectos. Abre hacia atrás sin juntar del todo los omóplatos.', alt: 'Face pull en polea' },
  { id: 'curl_predicador', name: 'Curl predicador en máquina', muscle: 'biceps', videos: [['Demo', 'Ja6ZlIDONac'], ['Técnica', 'qehmseuvj-I']], cue: 'Axila pegada al borde del apoyo. Baja hasta casi estirar el brazo, que es donde más crece.', alt: 'Curl en polea' },

  // Pierna B
  { id: 'prensa', name: 'Prensa de piernas', muscle: 'cuadriceps', videos: [['Demo', 'yZmx_Ac3880'], ['Técnica', 'B6rGDcfyPto']], cue: 'Pies a la anchura de los hombros, en la mitad de la plataforma. Baja todo lo que puedas sin que se despegue la parte baja de la espalda.', alt: 'Sentadilla hack' },
  { id: 'curl_femoral_tumbado', name: 'Curl femoral tumbado', muscle: 'femoral', videos: [['Demo', 'n5WDXD_mpVY'], ['Técnica', '0a_fVS2s4Ho']], cue: 'Cadera pegada al banco. Sube sin levantar el culo y baja en 2–3 s.', alt: 'Curl femoral sentado' },
  { id: 'hip_thrust_maquina', name: 'Hip thrust en máquina', muscle: 'gluteo', videos: [['Demo', 'ZSPmIyX9RZs'], ['Técnica', 'xDmFkJxPzeM']], cue: 'Espalda alta apoyada y mirada al frente. Sube hasta que cadera y tronco queden en línea y aprieta el glúteo 1 s arriba.', alt: 'Hip thrust en multipower' },
  { id: 'gemelo_prensa', name: 'Gemelos en prensa', muscle: 'gemelo', videos: [['Demo', 'KxEYX_cuesM'], ['Técnica', 'Xa18jxyeSnM']], cue: 'Solo la punta del pie en la plataforma y rodillas casi rectas. Pausa abajo en cada repetición.', alt: 'Gemelos de pie en máquina' },
  { id: 'lateral_mancuernas', name: 'Elevación lateral con mancuernas', muscle: 'hombro_lateral', videos: [['Demo', 'OuG1smZTsQQ'], ['Técnica', 'v_ZkxWzYnMc']], cue: 'Mancuernas ligeras y codos algo flexionados. Sube hasta la altura del hombro sin impulso.', alt: 'Elevación lateral en máquina o polea' },
  { id: 'crunch_maquina', name: 'Crunch en máquina', muscle: 'abdomen', videos: [['Demo', '-OUSBPnHvsQ'], ['Técnica', 'Tn-XvYG9x7w']], cue: 'Enrolla la columna y suelta el aire al acercar el pecho a la pelvis.', alt: 'Crunch en polea' },

  // Alternatives that are handy when a machine is taken
  { id: 'press_incl_maquina', name: 'Press inclinado en máquina', muscle: 'pecho', videos: [['Demo', 'TrTSvn5-MTk'], ['Técnica', 'SUdQ1roIWz0']], cue: 'Asas a la altura de la parte alta del pecho, escápulas atrás y bajada en 2–3 s.', alt: 'Press inclinado en multipower' },
  { id: 'dominadas_asistidas', name: 'Dominadas asistidas', muscle: 'espalda', videos: [['Técnica', 'vKpqOpjJt18']], cue: 'Usa la menor ayuda que te permita hacer el rango completo. Quita ayuda cuando completes las repeticiones.', alt: 'Jalón al pecho' },
  { id: 'press_hombro_mancuernas', name: 'Press de hombros con mancuernas sentado', muscle: 'hombro', videos: [['Demo', 'HzIiNhHhhtA'], ['Técnica', '_RlRDWO2jfg']], cue: 'Respaldo casi vertical, mancuernas a la altura de las orejas y codos algo por delante del cuerpo.', alt: 'Press de hombros en máquina' },
  { id: 'fondos_asistidos', name: 'Fondos asistidos', muscle: 'pecho', videos: [['Demo', 'yZ83t4mrPrI'], ['Técnica', 'yN6Q1UI_xkE']], cue: 'La menor ayuda posible y recorrido completo.', alt: 'Press de pecho en máquina' },
  { id: 'pec_deck', name: 'Contractora (pec deck)', muscle: 'pecho', videos: [['Demo', 'O-OBCfyh9Fw']], cue: 'Asiento bajo para trabajar la parte alta del pecho. Abre hasta notar el estiramiento.', alt: 'Cruce de poleas' },
  { id: 'curl_inclinado', name: 'Curl inclinado con mancuernas', muscle: 'biceps', videos: [['Demo', 'aTYlqC_JacQ'], ['Técnica', 'i1YgFZB6alI']], cue: 'Banco a 45–60° y brazos colgando por detrás del cuerpo. Sube sin adelantar los codos.', alt: 'Curl en polea' },
  { id: 'curl_martillo', name: 'Curl martillo', muscle: 'antebrazo', videos: [['Demo', 'XOEL4MgekYE'], ['Técnica', 'MfMxT_jXcPE']], cue: 'Agarre neutro, codos pegados y sin balanceo.', alt: 'Curl inverso' },
  { id: 'rdl_mancuernas', name: 'Peso muerto rumano con mancuernas', muscle: 'femoral', videos: [['Demo', 'cYKYGwcg0U8'], ['Técnica', '_oyxCn2iSjU']], cue: 'Cadera atrás, espalda neutra y mancuernas pegadas a las piernas.', alt: 'Peso muerto rumano en multipower' }
];

export const EXERCISES = Object.fromEntries(list.map((e) => [e.id, { unit: 'kg', perSide: false, ...e }]));

// Share codes refer to exercises by their position in this list, so new
// exercises must always be appended at the end of `list`.
export const EXERCISE_IDS = list.map((e) => e.id);

export function exerciseName(item) {
  if (item.custom) return item.custom.name;
  return EXERCISES[item.ex]?.name || 'Ejercicio';
}

export function exerciseInfo(item) {
  if (item.custom) {
    return {
      id: item.ex,
      name: item.custom.name,
      muscle: item.custom.muscle || 'otro',
      unit: 'kg',
      perSide: false,
      videos: item.custom.video ? [['Vídeo', item.custom.video]] : [],
      cue: item.custom.cue || '',
      alt: ''
    };
  }
  return EXERCISES[item.ex] || { id: item.ex, name: 'Ejercicio', muscle: 'otro', unit: 'kg', videos: [], cue: '', alt: '' };
}

export const ytUrl = (id) => 'https://www.youtube.com/watch?v=' + id;

// Accepts a YouTube link or a bare id and returns the 11-character id.
export function parseYouTubeId(text) {
  if (!text) return null;
  const s = String(text).trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}
